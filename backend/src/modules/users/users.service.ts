import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * 用户服务
 * 处理用户相关业务逻辑
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 根据ID查找用户
   * @param userId 用户ID
   * @returns 用户信息
   */
  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clothes: true,
            outfits: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param updateProfileDto 更新信息
   * @returns 更新后的用户信息
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 获取用户统计数据
   * @param userId 用户ID
   * @returns 统计数据
   */
  async getUserStats(userId: string) {
    const stats = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            clothes: true,
            outfits: true,
            favorites: true,
            tryOnResults: true,
          },
        },
      },
    });

    if (!stats) {
      throw new NotFoundException('用户不存在');
    }

    return {
      clothesCount: stats._count.clothes,
      outfitsCount: stats._count.outfits,
      favoritesCount: stats._count.favorites,
      tryOnCount: stats._count.tryOnResults,
    };
  }
}
