import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CaptchaService } from './captcha.service';
import { WechatService } from './wechat.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * 认证模块
 * 提供用户认证相关功能
 */
@Module({
  imports: [
    // 配置 Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // 配置 JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CaptchaService, WechatService, JwtStrategy],
  exports: [AuthService, CaptchaService, WechatService],
})
export class AuthModule {}
