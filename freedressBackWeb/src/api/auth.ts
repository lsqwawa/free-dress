import http from './axios';
import type { AdminUser, LoginPayload, LoginResponse } from '@/types';

export const authApi = {
  /** 管理员登录 */
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    http.post('/auth/login', payload),

  /** 获取当前管理员信息 */
  me: (): Promise<AdminUser> => http.get('/auth/me'),

  /** 退出登录 */
  logout: (): Promise<void> => http.post('/auth/logout'),
};
