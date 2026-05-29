import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * 自定义限流守卫
 * - 已认证用户：按 userId 限流（精准到人）
 * - 未认证请求：按 IP 限流（兜底）
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // 优先使用 JWT 解析后的 userId 作为限流标识
    const user = req.user;
    if (user?.sub || user?.userId) {
      return `user_${user.sub || user.userId}`;
    }

    // 未认证时按 IP
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
