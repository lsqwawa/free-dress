import http from './axios';
import type { AdminUser, LoginPayload, LoginResponse } from '@/types';

/**
 * 认证相关 API
 *
 * 关于密码传输：
 * 后端使用 bcrypt.compare 在服务端比对密码，前端必须按"明文"发送原始密码，
 * 由 HTTPS 通道保证传输安全。前端再做 MD5/SHA256 反而会把哈希值变成"等效密码"，
 * 且与服务端 bcrypt 校验互斥，因此此处保持原样不做客户端预处理。
 */
export const authApi = {
  /** 管理员登录 */
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    http.post('/auth/login', payload),

  /** 获取当前管理员信息（后端路由为 /auth/profile） */
  me: (): Promise<AdminUser> => http.get('/auth/profile'),
};
