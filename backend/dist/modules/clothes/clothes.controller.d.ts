import { ClothesService } from './clothes.service';
import { CreateClothDto } from './dto/create-cloth.dto';
import { UpdateClothDto } from './dto/update-cloth.dto';
import { ClothCategory } from '@prisma/client';
export declare class ClothesController {
    private readonly clothesService;
    constructor(clothesService: ClothesService);
    create(userId: string, createClothDto: CreateClothDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        imageUrl: string;
        category: import(".prisma/client").$Enums.ClothCategory;
        color: string | null;
        style: string | null;
        season: string[];
    }>;
    findAll(userId: string, category?: ClothCategory): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        imageUrl: string;
        category: import(".prisma/client").$Enums.ClothCategory;
        color: string | null;
        style: string | null;
        season: string[];
    }[]>;
    findOne(id: string, userId: string): Promise<{
        outfitClothes: ({
            outfit: {
                id: string;
                createdAt: Date;
                userId: string;
                imageUrl: string | null;
                style: string | null;
                aiDescription: string | null;
                occasion: string | null;
            };
        } & {
            order: number;
            clothId: string;
            outfitId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        imageUrl: string;
        category: import(".prisma/client").$Enums.ClothCategory;
        color: string | null;
        style: string | null;
        season: string[];
    }>;
    update(id: string, userId: string, updateClothDto: UpdateClothDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        imageUrl: string;
        category: import(".prisma/client").$Enums.ClothCategory;
        color: string | null;
        style: string | null;
        season: string[];
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    getCategoryStats(userId: string): Promise<{
        TOP: number;
        BOTTOM: number;
        COAT: number;
        ACCESSORY: number;
        SHOE: number;
    }>;
}
