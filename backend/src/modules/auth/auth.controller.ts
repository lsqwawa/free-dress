import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 认证控制器
 * 处理用户登录、注册、验证码、密码重置等接口
 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  /**
   * 获取图片验证码
   */
  @Get('captcha')
  @ApiOperation({ summary: '获取图片验证码', description: '生成 SVG 格式的图片验证码' })
  getCaptcha(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.captchaService.generate(ip);
  }

  /**
   * 用户注册（图片验证码校验）
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '使用手机号、密码和图片验证码注册新账号' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 用户登录
   */
  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '使用手机号和密码登录；小程序端可附带 wechatCode 触发自动绑定微信',
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 小程序微信登录
   */
  @Post('wechat/mp-login')
  @ApiOperation({
    summary: '小程序微信登录',
    description: '使用 wx.login() 返回的 code 进行登录，未注册时自动建号',
  })
  async wechatMpLogin(@Body() dto: WechatMpLoginDto, @Req() req: Request) {
    return this.authService.wechatMpLogin(dto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * App 微信登录
   */
  @Post('wechat/app-login')
  @ApiOperation({
    summary: 'App 微信登录',
    description: '使用微信 OpenSDK 授权回调的 code 进行登录，未注册时自动建号',
  })
  async wechatAppLogin(@Body() dto: WechatAppLoginDto, @Req() req: Request) {
    return this.authService.wechatAppLogin(dto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 已登录账号绑定手机号
   */
  @Post('bind/phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定手机号', description: '为已登录账号补充手机号和密码' })
  async bindPhone(
    @CurrentUser('sub') userId: string,
    @Body() dto: BindPhoneDto,
    @Req() req: Request,
  ) {
    return this.authService.bindPhone(userId, dto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 已登录账号绑定小程序微信
   */
  @Post('bind/wechat-mp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定小程序微信', description: '为已登录账号绑定当前小程序微信' })
  async bindWechatMp(
    @CurrentUser('sub') userId: string,
    @Body() dto: BindWechatMpDto,
    @Req() req: Request,
  ) {
    return this.authService.bindWechatMp(userId, dto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 已登录账号绑定 App 微信
   */
  @Post('bind/wechat-app')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定 App 微信', description: '为已登录账号绑定当前移动应用微信' })
  async bindWechatApp(
    @CurrentUser('sub') userId: string,
    @Body() dto: BindWechatAppDto,
    @Req() req: Request,
  ) {
    return this.authService.bindWechatApp(userId, dto, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 解绑微信
   */
  @Post('unbind/wechat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '解绑微信', description: '解绑指定平台的微信账号（要求已绑手机号 + 密码）' })
  async unbindWechat(
    @CurrentUser('sub') userId: string,
    @Body() body: { platform: 'APP' | 'MP' },
    @Req() req: Request,
  ) {
    const platform = body?.platform === 'APP' ? 'APP' : 'MP';
    return this.authService.unbindWechat(userId, platform, { ip: req.ip || req.socket.remoteAddress });
  }

  /**
   * 忘记密码 - 验证手机号并获取重置令牌
   */
  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码', description: '验证手机号和图片验证码，获取密码重置令牌' })
  async forgotPassword(@Body() body: { phone: string; captchaId: string; captchaAnswer: string }) {
    return this.authService.forgotPassword(body.phone, body.captchaId, body.captchaAnswer);
  }

  /**
   * 重置密码
   */
  @Post('reset-password')
  @ApiOperation({ summary: '重置密码', description: '使用重置令牌设置新密码' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * 刷新 Token
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新 Token', description: '使用刷新令牌获取新的访问令牌' })
  async refreshTokens(@CurrentUser('sub') userId: string, @CurrentUser('phone') phone: string) {
    return this.authService.refreshTokens(userId, phone);
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息', description: '获取当前登录用户的信息' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  /**
   * 修改密码
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码', description: '验证旧密码后设置新密码' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, body.oldPassword, body.newPassword);
  }
}
