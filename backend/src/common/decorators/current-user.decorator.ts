import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 当前用户装饰器
 * 用于获取请求中的用户信息
 */
export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // 如果指定了字段，返回该字段值
    return data ? user?.[data] : user;
  },
);
