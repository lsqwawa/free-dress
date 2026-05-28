import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTryonDto } from './dto/create-tryon.dto';

@Injectable()
export class TryonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTryonDto) {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: dto.outfitId },
    });
    if (!outfit) {
      throw new NotFoundException('搭配不存在');
    }
    if (outfit.userId !== userId) {
      throw new ForbiddenException('无权使用该搭配');
    }

    // Mock AI 生成 — 返回占位图，后续接入真实 AI 服务
    const resultImageUrl = await this.generateTryonImage(dto.personImageUrl, dto.outfitId);

    const result = await this.prisma.tryOnResult.create({
      data: {
        userId,
        outfitId: dto.outfitId,
        personImageUrl: dto.personImageUrl,
        resultImageUrl,
      },
    });

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

  /**
   * Mock AI 试穿生成
   * 后续替换为真实 AI 服务调用（如 Kolors、IDM-VTON 等）
   */
  private async generateTryonImage(personImageUrl: string, outfitId: string): Promise<string> {
    // 模拟 AI 处理延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    // 返回人物原图作为占位，后续替换为 AI 合成结果
    return personImageUrl;
  }
}
