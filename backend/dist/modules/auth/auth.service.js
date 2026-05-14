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
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { phone, password, nickname } = registerDto;
        console.log('注册信息:', registerDto);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map