import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { OutfitsService } from './outfits.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OutfitsService', () => {
  let service: OutfitsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      cloth: { findMany: jest.fn() },
      outfit: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      favorite: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutfitsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OutfitsService>(OutfitsService);
  });

  describe('create', () => {
    it('should throw if no clothIds provided', async () => {
      await expect(
        service.create('user-1', { clothIds: [], style: '休闲' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if clothIds contain other users items', async () => {
      prisma.cloth.findMany.mockResolvedValue([{ id: 'cloth-1' }]);

      await expect(
        service.create('user-1', { clothIds: ['cloth-1', 'cloth-2'], style: '休闲' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create outfit when all cloths belong to user', async () => {
      prisma.cloth.findMany.mockResolvedValue([
        { id: 'cloth-1' },
        { id: 'cloth-2' },
      ]);
      prisma.outfit.create.mockResolvedValue({
        id: 'outfit-1',
        userId: 'user-1',
        style: '休闲',
        outfitClothes: [],
      });

      const result = await service.create('user-1', {
        clothIds: ['cloth-1', 'cloth-2'],
        style: '休闲',
      });

      expect(result.id).toBe('outfit-1');
      expect(prisma.cloth.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['cloth-1', 'cloth-2'] }, userId: 'user-1' },
        select: { id: true },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException on non-existent outfit', async () => {
      prisma.outfit.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('fake-id', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException on other users outfit', async () => {
      prisma.outfit.findUnique.mockResolvedValue({
        id: 'outfit-1',
        userId: 'user-2',
        favorites: [],
      });

      await expect(
        service.findOne('outfit-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not exists', async () => {
      prisma.outfit.findUnique.mockResolvedValue({ id: 'outfit-1' });
      prisma.favorite.findUnique.mockResolvedValue(null);
      prisma.favorite.create.mockResolvedValue({});

      const result = await service.toggleFavorite('user-1', 'outfit-1');
      expect(result.favorited).toBe(true);
    });

    it('should remove favorite when exists', async () => {
      prisma.outfit.findUnique.mockResolvedValue({ id: 'outfit-1' });
      prisma.favorite.findUnique.mockResolvedValue({ userId: 'user-1', outfitId: 'outfit-1' });
      prisma.favorite.delete.mockResolvedValue({});

      const result = await service.toggleFavorite('user-1', 'outfit-1');
      expect(result.favorited).toBe(false);
    });
  });
});
