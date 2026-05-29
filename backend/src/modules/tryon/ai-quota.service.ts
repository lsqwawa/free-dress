import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AI 配额管理服务
 * 控制用户每日AI调用次数，防止费用超支
 */
@Injectable()
export class AiQuotaService {
  // 每日配额限制
  private readonly DAILY_LIMITS = {
    tryon: { USER: 3, VIP: 15 },
    recommend: { USER: 10, VIP: 100 },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查用户是否还有配额
   * @param userId 用户ID
   * @param type 调用类型 (tryon | recommend)
   * @returns 是否有剩余配额
   */
  async checkQuota(userId: string, type: 'tryon' | 'recommend'): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const role = user?.role || 'USER';
    const limit = this.DAILY_LIMITS[type][role];
    const today = new Date().toISOString().split('T')[0];

    const quota = await this.prisma.aiQuota.findUnique({
      where: { userId_type_date: { userId, type, date: today } },
    });

    return (quota?.count || 0) < limit;
  }

  /**
   * 消耗一次配额
   * @param userId 用户ID
   * @param type 调用类型
   */
  async consumeQuota(userId: string, type: 'tryon' | 'recommend'): Promise<void> {
    const hasQuota = await this.checkQuota(userId, type);
    if (!hasQuota) {
      const typeLabel = type === 'tryon' ? 'AI试穿' : 'AI推荐';
      throw new ForbiddenException(`今日${typeLabel}次数已用完，明天再试或升级VIP`);
    }

    const today = new Date().toISOString().split('T')[0];

    await this.prisma.aiQuota.upsert({
      where: { userId_type_date: { userId, type, date: today } },
      update: { count: { increment: 1 } },
      create: { userId, type, date: today, count: 1 },
    });
  }

  /**
   * 获取用户当日剩余配额
   * @param userId 用户ID
   * @param type 调用类型
   * @returns 剩余配额数
   */
  async getRemainingQuota(userId: string, type: 'tryon' | 'recommend'): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const role = user?.role || 'USER';
    const limit = this.DAILY_LIMITS[type][role];
    const today = new Date().toISOString().split('T')[0];

    const quota = await this.prisma.aiQuota.findUnique({
      where: { userId_type_date: { userId, type, date: today } },
    });

    return Math.max(0, limit - (quota?.count || 0));
  }

  /**
   * 获取用户当日全部AI使用概况
   * @param userId 用户ID
   * @returns 各类型的已用/总额/剩余
   */
  async getDailyUsageSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const role = user?.role || 'USER';
    const today = new Date().toISOString().split('T')[0];

    const quotas = await this.prisma.aiQuota.findMany({
      where: { userId, date: today },
    });

    const usedMap: Record<string, number> = {};
    for (const q of quotas) {
      usedMap[q.type] = q.count;
    }

    return {
      tryon: {
        used: usedMap['tryon'] || 0,
        limit: this.DAILY_LIMITS.tryon[role],
        remaining: Math.max(0, this.DAILY_LIMITS.tryon[role] - (usedMap['tryon'] || 0)),
      },
      recommend: {
        used: usedMap['recommend'] || 0,
        limit: this.DAILY_LIMITS.recommend[role],
        remaining: Math.max(0, this.DAILY_LIMITS.recommend[role] - (usedMap['recommend'] || 0)),
      },
      date: today,
      role,
    };
  }
}
