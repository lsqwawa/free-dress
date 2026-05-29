"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const captcha_service_1 = require("./captcha.service");
const uuid_1 = require("uuid");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService, captchaService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.captchaService = captchaService;
        this.RESET_TOKEN_TTL = 10 * 60 * 1000;
        setInterval(() => this.cleanupResetTokens(), 5 * 60 * 1000);
    }
    async register(registerDto) {
        const { phone, password, captchaId, captchaAnswer, nickname } = registerDto;
        const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
        if (!isCaptchaValid) {
            throw new common_1.BadRequestException('验证码错误');
        }
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { phone },
            });
            if (existingUser) {
                throw new common_1.ConflictException('该手机号已被注册');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = await this.prisma.user.create({
                data: {
                    phone,
                    password: hashedPassword,
                    nickname: nickname || `用户${phone.slice(-4)}`,
                },
                select: {
                    id: true,
                    phone: true,
                    nickname: true,
                    avatarUrl: true,
                    role: true,
                    createdAt: true,
                },
            });
            const tokens = await this.generateTokens(user.id, user.phone);
            return {
                user,
                ...tokens,
            };
        }
        catch (error) {
            console.error('注册错误详情:', error);
            throw error;
        }
    }
    async login(loginDto) {
        const { phone, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const tokens = await this.generateTokens(user.id, user.phone);
        return {
            user: {
                id: user.id,
                phone: user.phone,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                role: user.role,
                createdAt: user.createdAt,
            },
            ...tokens,
        };
    }
    async refreshTokens(userId, phone) {
        return this.generateTokens(userId, phone);
    }
    async generateTokens(userId, phone) {
        const payload = { sub: userId, phone };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '30d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async forgotPassword(phone, captchaId, captchaAnswer) {
        const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
        if (!isCaptchaValid) {
            throw new common_1.BadRequestException('验证码错误');
        }
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            throw new common_1.NotFoundException('该手机号未注册');
        }
        const resetToken = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + this.RESET_TOKEN_TTL);
        await this.prisma.resetToken.create({
            data: {
                token: resetToken,
                userId: user.id,
                expiresAt,
            },
        });
        return {
            resetToken,
            message: '验证成功，请设置新密码',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { resetToken, newPassword } = resetPasswordDto;
        const entry = await this.prisma.resetToken.findUnique({
            where: { token: resetToken },
        });
        if (!entry || entry.used) {
            throw new common_1.BadRequestException('重置令牌无效或已过期');
        }
        if (new Date() > entry.expiresAt) {
            await this.prisma.resetToken.update({
                where: { id: entry.id },
                data: { used: true },
            });
            throw new common_1.BadRequestException('重置令牌已过期，请重新操作');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: entry.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.resetToken.update({
                where: { id: entry.id },
                data: { used: true },
            }),
        ]);
        return { message: '密码重置成功' };
    }
    async cleanupResetTokens() {
        await this.prisma.resetToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { used: true },
                ],
            },
        }).catch(() => { });
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                nickname: true,
                avatarUrl: true,
                role: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return user;
    }
    async changePassword(userId, oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            throw new common_1.BadRequestException('请填写所有字段');
        }
        if (newPassword.length < 6 || newPassword.length > 20) {
            throw new common_1.BadRequestException('新密码长度须为6-20位');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        const isOldValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldValid) {
            throw new common_1.BadRequestException('当前密码错误');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: '密码修改成功' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        captcha_service_1.CaptchaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map