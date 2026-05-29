import apiClient from './axios';
import { ApiResponse, LoginResponse, User } from '../types';

/**
 * 认证相关 API
 */

/**
 * 获取图片验证码
 * @returns captchaId 和 SVG 图片数据
 */
export const getCaptcha = async (): Promise<ApiResponse<{ captchaId: string; image: string }>> => {
  return apiClient.get('/auth/captcha') as Promise<ApiResponse<{ captchaId: string; image: string }>>;
};

/**
 * 用户注册
 * @param phone 手机号
 * @param password 密码
 * @param captchaId 验证码ID
 * @param captchaAnswer 验证码答案
 * @param nickname 昵称（可选）
 */
export const register = async (
  phone: string,
  password: string,
  captchaId: string,
  captchaAnswer: string,
  nickname?: string
): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post('/auth/register', {
    phone,
    password,
    captchaId,
    captchaAnswer,
    nickname,
  }) as Promise<ApiResponse<LoginResponse>>;
};

/**
 * 用户登录
 * @param phone 手机号
 * @param password 密码
 */
export const login = async (
  phone: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post('/auth/login', {
    phone,
    password,
  }) as Promise<ApiResponse<LoginResponse>>;
};

/**
 * 忘记密码 - 验证手机号获取重置令牌
 * @param phone 手机号
 * @param captchaId 验证码ID
 * @param captchaAnswer 验证码答案
 */
export const forgotPassword = async (
  phone: string,
  captchaId: string,
  captchaAnswer: string
): Promise<ApiResponse<{ resetToken: string; message: string }>> => {
  return apiClient.post('/auth/forgot-password', {
    phone,
    captchaId,
    captchaAnswer,
  }) as Promise<ApiResponse<{ resetToken: string; message: string }>>;
};

/**
 * 重置密码
 * @param resetToken 重置令牌
 * @param newPassword 新密码
 */
export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.post('/auth/reset-password', {
    resetToken,
    newPassword,
  }) as Promise<ApiResponse<{ message: string }>>;
};

/**
 * 刷新 Token
 */
export const refreshToken = async (): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
  return apiClient.post('/auth/refresh') as Promise<ApiResponse<{ accessToken: string; refreshToken: string }>>;
};

/**
 * 获取当前用户信息
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  return apiClient.get('/auth/profile') as Promise<ApiResponse<User>>;
};

// ============================================================
//                     微信登录 / 绑定
// ============================================================

/**
 * App 端微信登录
 * @param code 微信 OpenSDK 授权回调的 code
 */
export const wechatAppLogin = async (
  code: string,
): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post('/auth/wechat/app-login', { code }) as Promise<
    ApiResponse<LoginResponse>
  >;
};

/**
 * 已登录账号绑定手机号（需 JWT）
 */
export const bindPhone = async (
  phone: string,
  password: string,
  captchaId: string,
  captchaAnswer: string,
): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post('/auth/bind/phone', {
    phone,
    password,
    captchaId,
    captchaAnswer,
  }) as Promise<ApiResponse<LoginResponse>>;
};

/**
 * 已登录账号绑定 App 端微信
 */
export const bindWechatApp = async (
  code: string,
): Promise<ApiResponse<{ user: User; message: string }>> => {
  return apiClient.post('/auth/bind/wechat-app', { code }) as Promise<
    ApiResponse<{ user: User; message: string }>
  >;
};

/**
 * 解绑微信
 */
export const unbindWechat = async (
  platform: 'APP' | 'MP' = 'APP',
): Promise<ApiResponse<{ user: User; message: string }>> => {
  return apiClient.post('/auth/unbind/wechat', { platform }) as Promise<
    ApiResponse<{ user: User; message: string }>
  >;
};
