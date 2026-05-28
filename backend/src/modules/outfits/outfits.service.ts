import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';

@Injectable()
export class OutfitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOutfitDto) {
    const outfit = await this.prisma.outfit.create({
      data: {
        userId,
        style: dto.style,
        occasion: dto.occasion,
        aiDescription: dto.aiDescription,
        imageUrl: dto.imageUrl,
        outfitClothes: {
          create: dto.clothIds.map((clothId, index) => ({
            clothId,
            order: index,
          })),
        },
      },
      include: {
        outfitClothes: {
          include: { cloth: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return outfit;
  }

  async findAll(userId: string) {
    return this.prisma.outfit.findMany({
      where: { userId },
      include: {
        outfitClothes: {
          include: { cloth: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id },
      include: {
        outfitClothes: {
          include: { cloth: true },
          orderBy: { order: 'asc' },
        },
        favorites: { where: { userId }, select: { userId: true } },
      },
    });

    if (!outfit) {
      throw new NotFoundException('搭配不存在');
    }
    if (outfit.userId !== userId) {
      throw new ForbiddenException('无权访问该搭配');
    }

    return {
      ...outfit,
      isFavorited: outfit.favorites.length > 0,
      favorites: undefined,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.outfit.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async toggleFavorite(userId: string, outfitId: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id: outfitId } });
    if (!outfit) {
      throw new NotFoundException('搭配不存在');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_outfitId: { userId, outfitId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_outfitId: { userId, outfitId } },
      });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, outfitId },
    });
    return { favorited: true };
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
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

    return favorites.map((f) => f.outfit);
  }
}
