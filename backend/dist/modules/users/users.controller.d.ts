import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
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
    getStats(userId: string): Promise<{
        clothesCount: number;
        outfitsCount: number;
        favoritesCount: number;
        tryOnCount: number;
    }>;
}
