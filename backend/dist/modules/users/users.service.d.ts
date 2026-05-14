import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(userId: string): Promise<{
        phone: string;
        nickname: string;
        id: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            clothes: number;
            outfits: number;
            favorites: number;
        };
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        phone: string;
        nickname: string;
        id: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserStats(userId: string): Promise<{
        clothesCount: number;
        outfitsCount: number;
        favoritesCount: number;
        tryOnCount: number;
    }>;
}
