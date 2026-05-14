import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

/**
 * JWT 策略
 * 验证 JWT Token 并提取用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      // 从请求头中提取 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略过期 Token
      ignoreExpiration: false,
      // 使用环境变量中的密钥
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * 验证 JWT Payload
   * @param payload JWT 载荷
   * @returns 用户信息
   */
  async validate(payload: { sub: string; phone: string }) {
    // 根据用户ID验证用户是否存在
    const user = await this.authService.validateUser(payload.sub);
    
    return {
      userId: payload.sub,
      phone: payload.phone,
      ...user,
    };
  }
}
