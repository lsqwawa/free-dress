import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: any): Promise<any>;
}
