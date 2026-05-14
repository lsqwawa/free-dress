import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClothDto } from './dto/create-cloth.dto';
import { UpdateClothDto } from './dto/update-cloth.dto';
import { ClothCategory } from '@prisma/client';

/**
 * 衣物服务
 * 处理衣物相关业务逻辑
 */
@Injectable()
export class ClothesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建衣物
   * @param userId 用户ID
   * @param createClothDto 衣物信息
   * @returns 创建的衣物
   */
  async create(userId: string, createClothDto: CreateClothDto) {
    const cloth = await this.prisma.cloth.create({
      data: {
        ...createClothDto,
        userId,
      },
    });

    return cloth;
  }

  /**
   * 获取用户的所有衣物
   * @param userId 用户ID
   * @param category 分类筛选（可选）
   * @returns 衣物列表
   */
  async findAll(userId: string, category?: ClothCategory) {
    const where: any = { userId };
    
    if (category) {
      where.category = category;
    }

    const clothes = await this.prisma.cloth.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return clothes;
  }

  /**
   * 根据ID获取衣物详情
   * @param id 衣物ID
   * @param userId 用户ID（用于权限验证）
   * @returns 衣物详情
   */
  async findOne(id: string, userId: string) {
    const cloth = await this.prisma.cloth.findUnique({
      where: { id },
      include: {
        outfitClothes: {
          include: {
            outfit: true,
          },
        },
      },
    });

    if (!cloth) {
      throw new NotFoundException('衣物不存在');
    }

    // 验证权限
    if (cloth.userId !== userId) {
      throw new ForbiddenException('无权访问该衣物');
    }

    return cloth;
  }

  /**
   * 更新衣物
   * @param id 衣物ID
   * @param userId 用户ID
   * @param updateClothDto 更新信息
   * @returns 更新后的衣物
   */
  async update(id: string, userId: string, updateClothDto: UpdateClothDto) {
    // 先检查衣物是否存在且属于当前用户
    const existingCloth = await this.findOne(id, userId);

    const cloth = await this.prisma.cloth.update({
      where: { id },
      data: updateClothDto,
    });

    return cloth;
  }

  /**
   * 删除衣物
   * @param id 衣物ID
   * @param userId 用户ID
   */
  async remove(id: string, userId: string) {
    // 先检查衣物是否存在且属于当前用户
    await this.findOne(id, userId);

    await this.prisma.cloth.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 获取衣物分类统计
   * @param userId 用户ID
   * @returns 各分类的衣物数量
   */
  async getCategoryStats(userId: string) {
    const stats = await this.prisma.cloth.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true,
      },
    });

    // 转换为更友好的格式
    const result = {
      TOP: 0,
      BOTTOM: 0,
      COAT: 0,
      ACCESSORY: 0,
      SHOE: 0,
    };

    stats.forEach((stat) => {
      result[stat.category] = stat._count.category;
    });

    return result;
  }
}
