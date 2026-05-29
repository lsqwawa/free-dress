import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { WechatService } from './wechat.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  WechatMpLoginDto,
  WechatAppLoginDto,
  BindPhoneDto,
  BindWechatMpDto,
  BindWechatAppDto,
} from './dto/wechat.dto';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

/**
 * 认证服务
 * 处理用户登录、注册、验证码校验、密码重置等认证逻辑
 */
@Injectable()
export class AuthService {
  // 重置令牌有效期 10 分钟
  private readonly RESET_TOKEN_TTL = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly wechatService: WechatService,
  ) {
    // 定期清理过期重置令牌
    setInterval(() => this.cleanupResetTokens(), 5 * 60 * 1000);
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
   * @param loginDto 登录信息（可携带 wechatCode 触发自动绑定）
   * @param ctx     上下文（ip）
   * @returns 用户信息、Token 以及自动绑定结果
   */
  async login(loginDto: LoginDto, ctx?: { ip?: string }) {
    const { phone, password, wechatCode } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 自动绑定微信（仅在传入 wechatCode 时尝试，失败不阻塞登录）
    let autoBindResult: 'OK' | 'CONFLICT' | 'ALREADY_BOUND' | 'SKIP' = 'SKIP';
    let latestUser = user;
    if (wechatCode) {
      const r = await this.tryAutoBindWechatMp(user.id, wechatCode, ctx?.ip).catch((e) => {
        console.warn('[login] 自动绑定微信失败:', e?.message || e);
        return { status: 'SKIP' as const, user: undefined };
      });
      autoBindResult = r.status;
      if (r.user) latestUser = r.user as any;
    }

    // 生成 Token
    const tokens = await this.generateTokens(latestUser.id, latestUser.phone);

    return {
      user: this.serializeUser(latestUser),
      autoBindResult,
      ...tokens,
    };
  }

  /**
   * 刷新 Token
   * @param userId 用户ID
   * @param phone 手机号（可空）
   * @returns 新的 Token
   */
  async refreshTokens(userId: string, phone: string | null | undefined) {
    return this.generateTokens(userId, phone || null);
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param userId 用户ID
   * @param phone  手机号（纯微信用户为 null）
   * @returns Token 对象
   */
  private async generateTokens(userId: string, phone: string | null) {
    const payload: { sub: string; phone?: string } = { sub: userId };
    if (phone) payload.phone = phone;

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

    // 生成重置令牌并存入数据库
    const resetToken = uuid();
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

  /**
   * 重置密码
   * @param resetPasswordDto 重置密码信息
   * @returns 操作结果
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    const entry = await this.prisma.resetToken.findUnique({
      where: { token: resetToken },
    });

    if (!entry || entry.used) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    // 检查是否过期
    if (new Date() > entry.expiresAt) {
      await this.prisma.resetToken.update({
        where: { id: entry.id },
        data: { used: true },
      });
      throw new BadRequestException('重置令牌已过期，请重新操作');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码并标记令牌已使用（事务保证原子性）
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

  /**
   * 清理过期重置令牌
   */
  private async cleanupResetTokens(): Promise<void> {
    await this.prisma.resetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true },
        ],
      },
    }).catch(() => {});
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

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('请填写所有字段');
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      throw new BadRequestException('新密码长度须为6-20位');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码（纯微信账号可能没有 password，则要求先调用 bind/phone 设置密码）
    if (!user.password) {
      throw new BadRequestException('当前账号未设置密码，请先绑定手机号并设置密码');
    }
    const isOldValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldValid) {
      throw new BadRequestException('当前密码错误');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  // ============================================================
  //                  微信登录 / 绑定 / 解绑
  // ============================================================

  /**
   * 序列化用户信息，统一对外结构，包含绑定状态
   */
  private serializeUser(user: any) {
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

  /**
   * 写入审计日志（绑定/解绑/自动绑定行为）
   */
  private async writeBindLog(
    userId: string,
    action: string,
    platform: 'APP' | 'MP',
    detail?: any,
    ip?: string,
  ) {
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
    } catch (e) {
      // 日志失败不影响主流程
    }
  }

  /**
   * 小程序微信登录
   */
  async wechatMpLogin(dto: WechatMpLoginDto, ctx?: { ip?: string }) {
    const session = await this.wechatService.jscode2session(dto.code);
    const { openid, unionid } = session;

    let user = await this.findUserByWechat(unionid, openid, 'MP');

    if (user) {
      const updateData: any = {};
      if (!user.wechatOpenIdMp) updateData.wechatOpenIdMp = openid;
      if (unionid && !user.wechatUnionId) updateData.wechatUnionId = unionid;
      if (dto.nickname && !user.wechatNickname) updateData.wechatNickname = dto.nickname;
      if (dto.avatarUrl && !user.wechatAvatarUrl) updateData.wechatAvatarUrl = dto.avatarUrl;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    } else {
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

  /**
   * App 端微信登录
   */
  async wechatAppLogin(dto: WechatAppLoginDto, ctx?: { ip?: string }) {
    const auth = await this.wechatService.appOauthAccessToken(dto.code);
    const { openid, unionid, access_token } = auth;

    const info = await this.wechatService.getAppUserInfo(access_token, openid);

    let user = await this.findUserByWechat(unionid, openid, 'APP');

    if (user) {
      const updateData: any = {};
      if (!user.wechatOpenIdApp) updateData.wechatOpenIdApp = openid;
      if (unionid && !user.wechatUnionId) updateData.wechatUnionId = unionid;
      if (info?.nickname && !user.wechatNickname) updateData.wechatNickname = info.nickname;
      if (info?.headimgurl && !user.wechatAvatarUrl) updateData.wechatAvatarUrl = info.headimgurl;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    } else {
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

  /**
   * 根据 unionId / openId 查找用户（unionId 优先）
   */
  private async findUserByWechat(
    unionid: string | undefined,
    openid: string,
    platform: 'APP' | 'MP',
  ) {
    if (unionid) {
      const byUnion = await this.prisma.user.findUnique({ where: { wechatUnionId: unionid } });
      if (byUnion) return byUnion;
    }
    if (platform === 'MP') {
      return this.prisma.user.findUnique({ where: { wechatOpenIdMp: openid } });
    }
    return this.prisma.user.findUnique({ where: { wechatOpenIdApp: openid } });
  }

  /**
   * 已登录账号绑定手机号
   */
  async bindPhone(userId: string, dto: BindPhoneDto, ctx?: { ip?: string }) {
    const { phone, password, captchaId, captchaAnswer } = dto;

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }
    if (password.length < 6 || password.length > 20) {
      throw new BadRequestException('密码长度必须在6-20位之间');
    }

    const isCaptchaValid = this.captchaService.verify(captchaId, captchaAnswer);
    if (!isCaptchaValid) {
      throw new BadRequestException('验证码错误');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.phone) {
      throw new ConflictException('当前账号已绑定手机号');
    }

    const dup = await this.prisma.user.findUnique({ where: { phone } });
    if (dup) {
      throw new ConflictException('该手机号已被其他账号占用');
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

  /** 绑定小程序微信 */
  async bindWechatMp(userId: string, dto: BindWechatMpDto, ctx?: { ip?: string }) {
    const session = await this.wechatService.jscode2session(dto.code);
    return this.bindWechatInternal(userId, 'MP', session.openid, session.unionid, ctx);
  }

  /** 绑定 App 微信 */
  async bindWechatApp(userId: string, dto: BindWechatAppDto, ctx?: { ip?: string }) {
    const auth = await this.wechatService.appOauthAccessToken(dto.code);
    return this.bindWechatInternal(userId, 'APP', auth.openid, auth.unionid, ctx);
  }

  /** 微信绑定核心逻辑 */
  private async bindWechatInternal(
    userId: string,
    platform: 'APP' | 'MP',
    openid: string,
    unionid: string | undefined,
    ctx?: { ip?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const platformField = platform === 'MP' ? 'wechatOpenIdMp' : 'wechatOpenIdApp';
    if ((user as any)[platformField]) {
      throw new ConflictException('当前账号已绑定该端微信');
    }

    const orClauses: any[] = [
      platform === 'MP' ? { wechatOpenIdMp: openid } : { wechatOpenIdApp: openid },
    ];
    if (unionid) orClauses.push({ wechatUnionId: unionid });

    const conflict = await this.prisma.user.findFirst({
      where: { AND: [{ id: { not: userId } }, { OR: orClauses }] },
    });
    if (conflict) {
      throw new ConflictException('该微信已被其他账号绑定，请先在原账号解绑');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        [platformField]: openid,
        wechatUnionId: unionid || user.wechatUnionId || null,
      },
    });
    await this.writeBindLog(
      userId,
      platform === 'MP' ? 'BIND_WECHAT_MP' : 'BIND_WECHAT_APP',
      platform,
      { openid, unionid },
      ctx?.ip,
    );
    return { user: this.serializeUser(updated), message: '微信绑定成功' };
  }

  /**
   * 解绑微信（要求账号已绑手机号 + 密码，避免锁死）
   */
  async unbindWechat(userId: string, platform: 'APP' | 'MP', ctx?: { ip?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    if (!user.phone || !user.password) {
      throw new BadRequestException('请先绑定手机号并设置密码后再解绑微信');
    }

    const platformField = platform === 'MP' ? 'wechatOpenIdMp' : 'wechatOpenIdApp';
    if (!(user as any)[platformField]) {
      throw new BadRequestException('当前账号未绑定该端微信');
    }

    const data: any = { [platformField]: null };
    const otherField = platform === 'MP' ? 'wechatOpenIdApp' : 'wechatOpenIdMp';
    if (!(user as any)[otherField]) {
      data.wechatUnionId = null;
      data.wechatNickname = null;
      data.wechatAvatarUrl = null;
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data });
    await this.writeBindLog(userId, 'UNBIND_WECHAT', platform, null, ctx?.ip);
    return { user: this.serializeUser(updated), message: '微信解绑成功' };
  }

  /**
   * 手机号登录时尝试自动绑定小程序微信
   * - 仅在当前微信未被任何账号占用时执行
   * - 冲突仅返回状态，不写数据
   */
  private async tryAutoBindWechatMp(
    userId: string,
    wechatCode: string,
    ip?: string,
  ): Promise<{ status: 'OK' | 'CONFLICT' | 'ALREADY_BOUND' | 'SKIP'; user?: any }> {
    const session = await this.wechatService.jscode2session(wechatCode);
    const { openid, unionid } = session;

    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me) return { status: 'SKIP' };

    if (me.wechatOpenIdMp) {
      return {
        status: me.wechatOpenIdMp === openid ? 'ALREADY_BOUND' : 'CONFLICT',
        user: me,
      };
    }

    const orClauses: any[] = [{ wechatOpenIdMp: openid }];
    if (unionid) orClauses.push({ wechatUnionId: unionid });

    const conflict = await this.prisma.user.findFirst({
      where: { id: { not: userId }, OR: orClauses },
    });
    if (conflict) return { status: 'CONFLICT', user: me };

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
}
