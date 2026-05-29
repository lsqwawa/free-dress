import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AiQuotaService } from '../tryon/ai-quota.service';

export interface RecommendationResult {
  clothIds: string[];
  style: string;
  occasion: string;
  reason: string;
  score: number;
}

/**
 * AI 搭配推荐服务
 * 使用 DeepSeek V4-Flash 生成搭配建议
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly enabled: boolean;
  // 推荐结果缓存（userId:scene:season → { result, expireAt }）
  private readonly cache = new Map<string, { result: RecommendationResult[]; expireAt: number }>();
  // 传入AI的衣物上限（控制token消耗）
  private readonly MAX_CLOTHES_FOR_AI = 50;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly quotaService: AiQuotaService,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.baseUrl = this.configService.get<string>(
      'DEEPSEEK_API_URL',
      'https://api.deepseek.com/v1/chat/completions',
    );
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      this.logger.warn('DeepSeek API未配置，搭配推荐将使用规则引擎模式');
    }
  }

  /**
   * 获取AI搭配推荐
   * @param userId 用户ID
   * @param options 推荐选项（场景、季节等）
   */
  async getRecommendations(
    userId: string,
    options?: { scene?: string; season?: string; count?: number },
  ): Promise<RecommendationResult[]> {
    // 检查缓存（30分钟有效，相同参数不重复调用AI）
    const cacheKey = `${userId}:${options?.scene || ''}:${options?.season || ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expireAt > Date.now()) {
      return cached.result;
    }

    // 先检查是否有配额（不扣除，仅检查）
    const hasQuota = await this.quotaService.checkQuota(userId, 'recommend');
    if (!hasQuota) {
      throw new ForbiddenException('今日AI推荐次数已用完，明天再试或升级VIP');
    }

    // 获取用户衣橱（限制数量，避免超大衣橱传入过多token）
    const clothes = await this.prisma.cloth.findMany({
      where: { userId },
      select: {
        id: true,
        category: true,
        color: true,
        style: true,
        season: true,
        tags: true,
        imageUrl: true,
      },
      take: this.MAX_CLOTHES_FOR_AI,
      orderBy: { createdAt: 'desc' },
    });

    if (clothes.length < 2) {
      return [];
    }

    // 如果AI可用则使用AI推荐，否则降级为规则引擎
    let result: RecommendationResult[];
    if (this.enabled) {
      result = await this.aiRecommend(clothes, options);
    } else {
      result = this.ruleBasedRecommend(clothes, options);
    }

    // AI调用成功后才扣除配额
    await this.quotaService.consumeQuota(userId, 'recommend');

    // 写入缓存（30分钟有效）
    this.cache.set(cacheKey, { result, expireAt: Date.now() + 30 * 60 * 1000 });
    return result;
  }

  /**
   * 基于DeepSeek的AI推荐
   */
  private async aiRecommend(
    clothes: any[],
    options?: { scene?: string; season?: string; count?: number },
  ): Promise<RecommendationResult[]> {
    const count = options?.count || 3;

    // 构建简洁的衣物描述（控制token用量）
    const clothesSummary = clothes.map(c => ({
      id: c.id,
      cat: c.category,
      color: c.color,
      style: c.style,
      season: c.season,
    }));

    const prompt = this.buildPrompt(clothesSummary, options, count);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业时尚搭配师。根据用户衣橱中的衣物，推荐合理的搭配组合。只返回JSON格式。',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        this.logger.error(`DeepSeek API 失败: ${response.status}`);
        return this.ruleBasedRecommend(clothes, options);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return this.ruleBasedRecommend(clothes, options);
      }

      const parsed = JSON.parse(content);
      const recommendations = parsed.recommendations || parsed.outfits || [];

      return recommendations.slice(0, count).map((rec: any) => ({
        clothIds: rec.clothIds || rec.cloth_ids || [],
        style: rec.style || '日常',
        occasion: rec.occasion || rec.scene || options?.scene || '日常',
        reason: rec.reason || rec.description || '搭配推荐',
        score: rec.score || 85,
      }));
    } catch (error) {
      this.logger.error(`AI推荐失败: ${error.message}`);
      return this.ruleBasedRecommend(clothes, options);
    }
  }

  /**
   * 构建推荐Prompt（控制token消耗）
   */
  private buildPrompt(
    clothes: any[],
    options?: { scene?: string; season?: string; count?: number },
    count = 3,
  ): string {
    const scene = options?.scene || '日常休闲';
    const season = options?.season || this.getCurrentSeason();

    return `衣橱: ${JSON.stringify(clothes)}
场景: ${scene}, 季节: ${season}
请推荐${count}组搭配，每组包含上衣+下装（可选外套/鞋/配饰）。
返回格式: {"recommendations":[{"clothIds":["id1","id2"],"style":"风格","occasion":"场合","reason":"搭配理由","score":85}]}`;
  }

  /**
   * 规则引擎推荐（降级方案，零成本）
   */
  private ruleBasedRecommend(
    clothes: any[],
    options?: { scene?: string; season?: string; count?: number },
  ): RecommendationResult[] {
    const count = options?.count || 3;
    const season = options?.season || this.getCurrentSeason();
    const results: RecommendationResult[] = [];

    // 按分类分组
    const tops = clothes.filter(c => c.category === 'TOP');
    const bottoms = clothes.filter(c => c.category === 'BOTTOM');
    const coats = clothes.filter(c => c.category === 'COAT');
    const shoes = clothes.filter(c => c.category === 'SHOE');

    // 简单色彩搭配规则
    const colorCompatibility: Record<string, string[]> = {
      '黑色': ['白色', '灰色', '米色', '红色', '蓝色'],
      '白色': ['黑色', '蓝色', '灰色', '米色', '粉色'],
      '蓝色': ['白色', '灰色', '米色', '黑色'],
      '灰色': ['黑色', '白色', '蓝色', '粉色'],
      '米色': ['白色', '棕色', '蓝色', '黑色'],
      '红色': ['黑色', '白色', '灰色'],
      '粉色': ['白色', '灰色', '蓝色'],
      '棕色': ['米色', '白色', '黑色'],
    };

    for (let i = 0; i < count && i < tops.length; i++) {
      const top = tops[i];
      // 找颜色搭配的下装
      const compatible = colorCompatibility[top.color] || [];
      let bottom = bottoms.find(b =>
        compatible.includes(b.color) && this.seasonMatch(b.season, season),
      ) || bottoms[i % bottoms.length];

      if (!bottom) continue;

      const clothIds = [top.id, bottom.id];

      // 可选加外套
      if (coats.length > 0 && (season === '冬' || season === '秋')) {
        clothIds.push(coats[i % coats.length].id);
      }

      // 可选加鞋
      if (shoes.length > 0) {
        clothIds.push(shoes[i % shoes.length].id);
      }

      results.push({
        clothIds,
        style: top.style || '休闲',
        occasion: options?.scene || '日常',
        reason: `${top.color || ''}${top.style || ''}上衣搭配${bottom.color || ''}下装，色彩协调`,
        score: 70 + Math.floor(Math.random() * 20),
      });
    }

    return results.slice(0, count);
  }

  /**
   * 获取当前季节
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春';
    if (month >= 6 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }

  /**
   * 判断衣物是否适合当前季节
   */
  private seasonMatch(seasons: string[], currentSeason: string): boolean {
    if (!seasons || seasons.length === 0) return true;
    return seasons.includes(currentSeason);
  }
}
