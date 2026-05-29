import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { WechatService } from './wechat.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { WechatMpLoginDto, WechatAppLoginDto, BindPhoneDto, BindWechatMpDto, BindWechatAppDto } from './dto/wechat.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly captchaService;
    private readonly wechatService;
    private readonly RESET_TOKEN_TTL;
    constructor(prisma: PrismaService, jwtService: JwtService, captchaService: CaptchaService, wechatService: WechatService);
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
    login(loginDto: LoginDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    refreshTokens(userId: string, phone: string | null | undefined): Promise<{
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
        phone: string;
        nickname: string;
        id: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private serializeUser;
    private writeBindLog;
    wechatMpLogin(dto: WechatMpLoginDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    wechatAppLogin(dto: WechatAppLoginDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    private findUserByWechat;
    bindPhone(userId: string, dto: BindPhoneDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    bindWechatMp(userId: string, dto: BindWechatMpDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    bindWechatApp(userId: string, dto: BindWechatAppDto, ctx?: {
        ip?: string;
    }): Promise<{
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
    private bindWechatInternal;
    unbindWechat(userId: string, platform: 'APP' | 'MP', ctx?: {
        ip?: string;
    }): Promise<{
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
    private tryAutoBindWechatMp;
}
