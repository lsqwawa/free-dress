import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 认证控制器
 * 处理用户登录、注册等接口
 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '使用手机号和密码注册新账号' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 用户登录
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '使用手机号和密码登录' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
}
