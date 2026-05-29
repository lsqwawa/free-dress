import { Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly captchaService;
    constructor(authService: AuthService, captchaService: CaptchaService);
    getCaptcha(req: Request): {
        captchaId: string;
        image: string;
    };
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
    forgotPassword(body: {
        phone: string;
        captchaId: string;
        captchaAnswer: string;
    }): Promise<{
        resetToken: string;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshTokens(userId: string, phone: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(user: any): Promise<any>;
    changePassword(userId: string, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
