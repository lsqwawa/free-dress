import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 管理员守卫
 * 校验当前登录用户是否拥有 ADMIN 角色
 * 必须配合 JwtAuthGuard 一起使用
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('未授权');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
