import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            phone: string;
            nickname: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            phone: string;
            nickname: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    refreshTokens(userId: string, phone: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    validateUser(userId: string): Promise<{
        id: string;
        phone: string;
        nickname: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
