import { ClothCategory } from '@prisma/client';
export declare class CreateClothDto {
    imageUrl: string;
    category: ClothCategory;
    color?: string;
    style?: string;
    season?: string[];
    tags?: string[];
}
