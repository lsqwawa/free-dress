import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTryonDto } from './dto/create-tryon.dto';
import { AiTryonProvider } from './ai-tryon.provider';
import { AiQuotaService } from './ai-quota.service';

@Injectable()
export class TryonService {
  private readonly logger = new Logger(TryonService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiTryonProvider,
    private readonly quotaService: AiQuotaService,
  ) {}

  /**
   * 创建试穿请求
   * 1. 校验权限和配额
   * 2. 创建PENDING记录
   * 3. 异步调用AI服务
   * 4. 更新结果
   */
  async create(userId: string, dto: CreateTryonDto) {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: dto.outfitId },
      include: {
        outfitClothes: {
          include: { cloth: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!outfit) {
      throw new NotFoundException('搭配不存在');
    }
    if (outfit.userId !== userId) {
      throw new ForbiddenException('无权使用该搭配');
    }

    // 去重检查：相同人物照+搭配已有成功结果时直接复用（不扣配额）
    const existing = await this.prisma.tryOnResult.findFirst({
      where: {
        userId,
        outfitId: dto.outfitId,
        personImageUrl: dto.personImageUrl,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return {
        ...existing,
        message: '已有相同试穿结果，直接返回',
      };
    }

    // 并发互斥：检查是否有正在处理中的任务
    const pendingTask = await this.prisma.tryOnResult.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });
    if (pendingTask) {
      throw new ForbiddenException('当前有试穿任务正在处理中，请等待完成后再试');
    }

    // 通过去重和并发检查后再扣除配额
    await this.quotaService.consumeQuota(userId, 'tryon');

    // 创建 PENDING 记录
    const result = await this.prisma.tryOnResult.create({
      data: {
        userId,
        outfitId: dto.outfitId,
        personImageUrl: dto.personImageUrl,
        status: 'PENDING',
        progress: 0,
      },
    });

    // 异步处理AI生成（不阻塞响应）
    this.processAiTryon(result.id, dto.personImageUrl, outfit).catch(err => {
      this.logger.error(`AI试穿处理失败 [${result.id}]: ${err.message}`);
    });

    return {
      ...result,
      message: 'AI试穿任务已提交，请稍后查看结果',
    };
  }

  /**
   * 异步执行AI试穿生成
   */
  private async processAiTryon(resultId: string, personImageUrl: string, outfit: any) {
    try {
      // 更新为处理中
      await this.prisma.tryOnResult.update({
        where: { id: resultId },
        data: { status: 'PROCESSING', progress: 20 },
      });

      // 取搭配中第一件衣物的图片作为试穿衣物
      const garmentImageUrl = outfit.outfitClothes?.[0]?.cloth?.imageUrl;
      if (!garmentImageUrl) {
        throw new Error('搭配中没有衣物图片');
      }

      // 更新进度
      await this.prisma.tryOnResult.update({
        where: { id: resultId },
        data: { progress: 50 },
      });

      // 调用AI服务
      const aiResult = await this.aiProvider.generate({
        personImageUrl,
        garmentImageUrl,
      });

      // 更新为完成
      await this.prisma.tryOnResult.update({
        where: { id: resultId },
        data: {
          status: 'COMPLETED',
          resultImageUrl: aiResult.resultImageUrl,
          progress: 100,
          processingTime: aiResult.processingTime,
        },
      });

      this.logger.log(`AI试穿完成 [${resultId}], 耗时 ${aiResult.processingTime}ms`);
    } catch (error) {
      await this.prisma.tryOnResult.update({
        where: { id: resultId },
        data: {
          status: 'FAILED',
          failReason: error.message || '生成失败',
          progress: 0,
        },
      });
    }
  }

  /**
   * 查询试穿结果状态（前端轮询用）
   */
  async getStatus(id: string, userId: string) {
    const result = await this.prisma.tryOnResult.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        progress: true,
        resultImageUrl: true,
        failReason: true,
      },
    });

    if (!result) {
      throw new NotFoundException('试穿记录不存在');
    }

    return result;
  }

  async findAll(userId: string) {
    return this.prisma.tryOnResult.findMany({
      where: { userId },
      include: {
        outfit: {
          include: {
            outfitClothes: {
              include: { cloth: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const result = await this.prisma.tryOnResult.findUnique({
      where: { id },
      include: {
        outfit: {
          include: {
            outfitClothes: {
              include: { cloth: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('试穿记录不存在');
    }
    if (result.userId !== userId) {
      throw new ForbiddenException('无权访问该记录');
    }

    return result;
  }
}
