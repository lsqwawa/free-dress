import { Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { WechatMpLoginDto, WechatAppLoginDto, BindPhoneDto, BindWechatMpDto, BindWechatAppDto } from './dto/wechat.dto';
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
            phone: string;
            nickname: string;
            id: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
        autoBindResult: "OK" | "CONFLICT" | "ALREADY_BOUND" | "SKIP";
    }>;
    wechatMpLogin(dto: WechatMpLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
    }>;
    wechatAppLogin(dto: WechatAppLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
    }>;
    bindPhone(userId: string, dto: BindPhoneDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
    }>;
    bindWechatMp(userId: string, dto: BindWechatMpDto, req: Request): Promise<{
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
        message: string;
    }>;
    bindWechatApp(userId: string, dto: BindWechatAppDto, req: Request): Promise<{
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
        message: string;
    }>;
    unbindWechat(userId: string, body: {
        platform: 'APP' | 'MP';
    }, req: Request): Promise<{
        user: {
            id: any;
            phone: any;
            nickname: any;
            avatarUrl: any;
            role: any;
            registerSource: any;
            hasPhone: boolean;
            hasWechatMp: boolean;
            hasWechatApp: boolean;
            needBindPhone: boolean;
            createdAt: any;
        };
        message: string;
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
