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
const wechat_service_1 = require("./wechat.service");
const uuid_1 = require("uuid");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService, captchaService, wechatService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.captchaService = captchaService;
        this.wechatService = wechatService;
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
    async login(loginDto, ctx) {
        const { phone, password, wechatCode } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        let autoBindResult = 'SKIP';
        let latestUser = user;
        if (wechatCode) {
            const r = await this.tryAutoBindWechatMp(user.id, wechatCode, ctx?.ip).catch((e) => {
                console.warn('[login] 自动绑定微信失败:', e?.message || e);
                return { status: 'SKIP', user: undefined };
            });
            autoBindResult = r.status;
            if (r.user)
                latestUser = r.user;
        }
        const tokens = await this.generateTokens(latestUser.id, latestUser.phone);
        return {
            user: this.serializeUser(latestUser),
            autoBindResult,
            ...tokens,
        };
    }
    async refreshTokens(userId, phone) {
        return this.generateTokens(userId, phone || null);
    }
    async generateTokens(userId, phone) {
        const payload = { sub: userId };
        if (phone)
            payload.phone = phone;
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
        if (!user.password) {
            throw new common_1.BadRequestException('当前账号未设置密码，请先绑定手机号并设置密码');
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
    serializeUser(user) {
        return {
            id: user.id,
            phone: user.phone || null,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl || user.wechatAvatarUrl || null,
            role: user.role,
            registerSource: user.registerSource,
            hasPhone: !!user.phone,
            hasWechatMp: !!user.wechatOpenIdMp,
            hasWechatApp: !!user.wechatOpenIdApp,
            needBindPhone: !user.phone,
            createdAt: user.createdAt,
        };
    }
    async writeBindLog(userId, action, platform, detail, ip) {
        try {
            await this.prisma.wechatBindLog.create({
                data: {
                    userId,
                    action,
                    platform,
                    detail: detail ? JSON.stringify(detail) : null,
                    ip: ip || null,
                },
            });
        }
        catch (e) {
        }
    }
    async wechatMpLogin(dto, ctx) {
        const session = await this.wechatService.jscode2session(dto.code);
        const { openid, unionid } = session;
        let user = await this.findUserByWechat(unionid, openid, 'MP');
        if (user) {
            const updateData = {};
            if (!user.wechatOpenIdMp)
                updateData.wechatOpenIdMp = openid;
            if (unionid && !user.wechatUnionId)
                updateData.wechatUnionId = unionid;
            if (dto.nickname && !user.wechatNickname)
                updateData.wechatNickname = dto.nickname;
            if (dto.avatarUrl && !user.wechatAvatarUrl)
                updateData.wechatAvatarUrl = dto.avatarUrl;
            if (Object.keys(updateData).length > 0) {
                user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
            }
        }
        else {
            user = await this.prisma.user.create({
                data: {
                    wechatOpenIdMp: openid,
                    wechatUnionId: unionid || null,
                    wechatNickname: dto.nickname || null,
                    wechatAvatarUrl: dto.avatarUrl || null,
                    nickname: dto.nickname || '微信用户',
                    avatarUrl: dto.avatarUrl || null,
                    registerSource: 'WECHAT_MP',
                },
            });
            await this.writeBindLog(user.id, 'CREATE_BY_WECHAT_MP', 'MP', { openid, unionid }, ctx?.ip);
        }
        const tokens = await this.generateTokens(user.id, user.phone || null);
        return { user: this.serializeUser(user), ...tokens };
    }
    async wechatAppLogin(dto, ctx) {
        const auth = await this.wechatService.appOauthAccessToken(dto.code);
        const { openid, unionid, access_token } = auth;
        const info = await this.wechatService.getAppUserInfo(access_token, openid);
        let user = await this.findUserByWechat(unionid, openid, 'APP');
        if (user) {
            const updateData = {};
            if (!user.wechatOpenIdApp)
                updateData.wechatOpenIdApp = openid;
            if (unionid && !user.wechatUnionId)
                updateData.wechatUnionId = unionid;
            if (info?.nickname && !user.wechatNickname)
                updateData.wechatNickname = info.nickname;
            if (info?.headimgurl && !user.wechatAvatarUrl)
                updateData.wechatAvatarUrl = info.headimgurl;
            if (Object.keys(updateData).length > 0) {
                user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
            }
        }
        else {
            user = await this.prisma.user.create({
                data: {
                    wechatOpenIdApp: openid,
                    wechatUnionId: unionid || null,
                    wechatNickname: info?.nickname || null,
                    wechatAvatarUrl: info?.headimgurl || null,
                    nickname: info?.nickname || '微信用户',
                    avatarUrl: info?.headimgurl || null,
                    registerSource: 'WECHAT_APP',
                },
            });
            await this.writeBindLog(user.id, 'CREATE_BY_WECHAT_APP', 'APP', { openid, unionid }, ctx?.ip);
        }
        const tokens = await this.generateTokens(user.id, user.phone || null);
        return { user: this.serializeUser(user), ...tokens };
    }
    async findUserByWechat(unionid, openid, platform) {
        if (unionid) {
            const byUnion = await this.prisma.user.findUnique({ where: { wechatUnionId: unionid } });
            if (byUnion)
                return byUnion;
        }
        if (platform === 'MP') {
            return this.prisma.user.findUnique({ where: { wechatOpenIdMp: openid } });
        }
        return this.prisma.user.findUnique({ where: { wechatOpenIdApp: openid } });
    }
    async bindPhone(userId, dto, ctx) {
        const { phone, password, captchaId, captchaAnswer } = dto;
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            throw new common_1.BadRequestException('手机号格式不正确');
        }
        if (password.length < 6 || password.length > 20) {
            throw new common_1.BadRequestException('密码长度必须在6-20位之间');
        }
        const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
        if (!isCaptchaValid) {
            throw new common_1.BadRequestException('验证码错误');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (user.phone) {
            throw new common_1.ConflictException('当前账号已绑定手机号');
        }
        const dup = await this.prisma.user.findUnique({ where: { phone } });
        if (dup) {
            throw new common_1.ConflictException('该手机号已被其他账号占用');
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { phone, password: hashed },
        });
        await this.writeBindLog(userId, 'BIND_PHONE', 'APP', { phone }, ctx?.ip);
        const tokens = await this.generateTokens(updated.id, updated.phone || null);
        return { user: this.serializeUser(updated), ...tokens };
    }
    async bindWechatMp(userId, dto, ctx) {
        const session = await this.wechatService.jscode2session(dto.code);
        return this.bindWechatInternal(userId, 'MP', session.openid, session.unionid, ctx);
    }
    async bindWechatApp(userId, dto, ctx) {
        const auth = await this.wechatService.appOauthAccessToken(dto.code);
        return this.bindWechatInternal(userId, 'APP', auth.openid, auth.unionid, ctx);
    }
    async bindWechatInternal(userId, platform, openid, unionid, ctx) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const platformField = platform === 'MP' ? 'wechatOpenIdMp' : 'wechatOpenIdApp';
        if (user[platformField]) {
            throw new common_1.ConflictException('当前账号已绑定该端微信');
        }
        const orClauses = [
            platform === 'MP' ? { wechatOpenIdMp: openid } : { wechatOpenIdApp: openid },
        ];
        if (unionid)
            orClauses.push({ wechatUnionId: unionid });
        const conflict = await this.prisma.user.findFirst({
            where: { AND: [{ id: { not: userId } }, { OR: orClauses }] },
        });
        if (conflict) {
            throw new common_1.ConflictException('该微信已被其他账号绑定，请先在原账号解绑');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                [platformField]: openid,
                wechatUnionId: unionid || user.wechatUnionId || null,
            },
        });
        await this.writeBindLog(userId, platform === 'MP' ? 'BIND_WECHAT_MP' : 'BIND_WECHAT_APP', platform, { openid, unionid }, ctx?.ip);
        return { user: this.serializeUser(updated), message: '微信绑定成功' };
    }
    async unbindWechat(userId, platform, ctx) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        if (!user.phone || !user.password) {
            throw new common_1.BadRequestException('请先绑定手机号并设置密码后再解绑微信');
        }
        const platformField = platform === 'MP' ? 'wechatOpenIdMp' : 'wechatOpenIdApp';
        if (!user[platformField]) {
            throw new common_1.BadRequestException('当前账号未绑定该端微信');
        }
        const data = { [platformField]: null };
        const otherField = platform === 'MP' ? 'wechatOpenIdApp' : 'wechatOpenIdMp';
        if (!user[otherField]) {
            data.wechatUnionId = null;
            data.wechatNickname = null;
            data.wechatAvatarUrl = null;
        }
        const updated = await this.prisma.user.update({ where: { id: userId }, data });
        await this.writeBindLog(userId, 'UNBIND_WECHAT', platform, null, ctx?.ip);
        return { user: this.serializeUser(updated), message: '微信解绑成功' };
    }
    async tryAutoBindWechatMp(userId, wechatCode, ip) {
        const session = await this.wechatService.jscode2session(wechatCode);
        const { openid, unionid } = session;
        const me = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!me)
            return { status: 'SKIP' };
        if (me.wechatOpenIdMp) {
            return {
                status: me.wechatOpenIdMp === openid ? 'ALREADY_BOUND' : 'CONFLICT',
                user: me,
            };
        }
        const orClauses = [{ wechatOpenIdMp: openid }];
        if (unionid)
            orClauses.push({ wechatUnionId: unionid });
        const conflict = await this.prisma.user.findFirst({
            where: { id: { not: userId }, OR: orClauses },
        });
        if (conflict)
            return { status: 'CONFLICT', user: me };
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                wechatOpenIdMp: openid,
                wechatUnionId: unionid || me.wechatUnionId || null,
            },
        });
        await this.writeBindLog(userId, 'AUTO_BIND_WECHAT_MP', 'MP', { openid, unionid }, ip);
        return { status: 'OK', user: updated };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        captcha_service_1.CaptchaService,
        wechat_service_1.WechatService])
], AuthService);
//# sourceMappingURL=auth.service.js.map