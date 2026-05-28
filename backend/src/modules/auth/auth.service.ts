import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

/**
 * 重置密码令牌存储
 */
interface ResetTokenEntry {
  userId: string;
  createdAt: number;
}

/**
 * 认证服务
 * 处理用户登录、注册、验证码校验、密码重置等认证逻辑
 */
@Injectable()
export class AuthService {
  // 重置密码令牌存储（生产环境应使用 Redis）
  private readonly resetTokens = new Map<string, ResetTokenEntry>();
  // 重置令牌有效期 10 分钟
  private readonly RESET_TOKEN_TTL = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
  ) {
    // 定期清理过期重置令牌
    setInterval(() => this.cleanupResetTokens(), 60 * 1000);
  }

  /**
   * 用户注册（图片验证码校验）
   * @param registerDto 注册信息
   * @returns 用户信息及 Token
   */
  async register(registerDto: RegisterDto) {
    const { phone, password, captchaId, captchaAnswer, nickname } = registerDto;

    // 验证图片验证码
    const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
    if (!isCaptchaValid) {
      throw new BadRequestException('验证码错误');
    }

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
   * 忘记密码 - 验证手机号并生成重置令牌
   * @param phone 手机号
   * @param captchaId 验证码ID
   * @param captchaAnswer 验证码答案
   * @returns 重置令牌
   */
  async forgotPassword(phone: string, captchaId: string, captchaAnswer: string) {
    // 验证图片验证码
    const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
    if (!isCaptchaValid) {
      throw new BadRequestException('验证码错误');
    }

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('该手机号未注册');
    }

    // 生成重置令牌
    const resetToken = uuid();
    this.resetTokens.set(resetToken, {
      userId: user.id,
      createdAt: Date.now(),
    });

    return {
      resetToken,
      message: '验证成功，请设置新密码',
    };
  }

  /**
   * 重置密码
   * @param resetPasswordDto 重置密码信息
   * @returns 操作结果
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    const entry = this.resetTokens.get(resetToken);
    if (!entry) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    // 检查是否过期
    if (Date.now() - entry.createdAt > this.RESET_TOKEN_TTL) {
      this.resetTokens.delete(resetToken);
      throw new BadRequestException('重置令牌已过期，请重新操作');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await this.prisma.user.update({
      where: { id: entry.userId },
      data: { password: hashedPassword },
    });

    // 删除已使用的令牌
    this.resetTokens.delete(resetToken);

    return { message: '密码重置成功' };
  }

  /**
   * 清理过期重置令牌
   */
  private cleanupResetTokens(): void {
    const now = Date.now();
    for (const [token, entry] of this.resetTokens.entries()) {
      if (now - entry.createdAt > this.RESET_TOKEN_TTL) {
        this.resetTokens.delete(token);
      }
    }
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
