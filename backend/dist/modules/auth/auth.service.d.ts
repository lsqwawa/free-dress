import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly captchaService;
    private readonly RESET_TOKEN_TTL;
    constructor(prisma: PrismaService, jwtService: JwtService, captchaService: CaptchaService);
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
    forgotPassword(phone: string, captchaId: string, captchaAnswer: string): Promise<{
        resetToken: string;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private cleanupResetTokens;
    validateUser(userId: string): Promise<{
        id: string;
        phone: string;
        nickname: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
