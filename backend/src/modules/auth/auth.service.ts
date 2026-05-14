import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

/**
 * 认证服务
 * 处理用户登录、注册等认证逻辑
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   * @param registerDto 注册信息
   * @returns 用户信息及 Token
   */
  async register(registerDto: RegisterDto) {
    const { phone, password, nickname } = registerDto;

    console.log('注册信息:', registerDto);

    try {
      // 检查手机号是否已存在
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        throw new ConflictException('该手机号已被注册');
      }

      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建用户
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

      // 生成 Token
      const tokens = await this.generateTokens(user.id, user.phone);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      console.error('注册错误详情:', error);
      throw error;
    }
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @returns 用户信息及 Token
   */
  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成 Token
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

  /**
   * 刷新 Token
   * @param userId 用户ID
   * @param phone 手机号
   * @returns 新的 Token
   */
  async refreshTokens(userId: string, phone: string) {
    return this.generateTokens(userId, phone);
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param userId 用户ID
   * @param phone 手机号
   * @returns Token 对象
   */
  private async generateTokens(userId: string, phone: string) {
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

  /**
   * 验证用户（用于 JWT 策略）
   * @param userId 用户ID
   * @returns 用户信息
   */
  async validateUser(userId: string) {
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
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }
}
