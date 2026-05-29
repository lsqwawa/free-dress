/**
 * API 接口集合 · 与 FreeDressApp 保持一致
 */
const { get, post, put, del, upload } = require('./request');

// === 认证 ===
const authApi = {
  // 图片验证码（注册/找回密码使用）
  getCaptcha: () => get('/auth/captcha'),
  // 登录（可选传 wechatCode 触发自动绑定微信）
  login: (phone, password, wechatCode) => post('/auth/login', {
    phone,
    password,
    ...(wechatCode ? { wechatCode } : {}),
  }),
  // 注册（带图片验证码）
  register: (data) => post('/auth/register', data),
  // 刷新 Token
  refreshToken: (refreshToken) => post('/auth/refresh', { refreshToken }),
  // 忘记密码：验证手机号 + 验证码 → 返回重置令牌
  forgotPassword: (data) => post('/auth/forgot-password', data),
  // 重置密码：使用重置令牌 + 新密码
  resetPassword: (data) => post('/auth/reset-password', data),
  // 修改密码（已登录态）
  changePassword: (data) => post('/auth/change-password', data),
  // 小程序微信一键登录
  wechatMpLogin: (data) => post('/auth/wechat/mp-login', data),
  // 绑定手机号（已登录态）
  bindPhone: (data) => post('/auth/bind/phone', data),
  // 绑定/解绑微信
  bindWechatMp: (data) => post('/auth/bind/wechat-mp', data),
  unbindWechat: (platform) => post('/auth/unbind/wechat', { platform: platform || 'MP' }),
};

// === 用户 ===
const userApi = {
  getProfile: () => get('/users/profile'),
  updateProfile: (data) => put('/users/profile', data),
  getStats: () => get('/users/stats'),
};

// === 衣物 ===
const clothesApi = {
  getList: (params) => get('/clothes', params),
  getById: (id) => get(`/clothes/${id}`),
  create: (data) => post('/clothes', data),
  update: (id, data) => put(`/clothes/${id}`, data),
  remove: (id) => del(`/clothes/${id}`),
  getCategoryStats: () => get('/clothes/stats/categories'),
};

// === 搭配 ===
const outfitsApi = {
  getList: (params) => get('/outfits', params),
  getById: (id) => get(`/outfits/${id}`),
  create: (data) => post('/outfits', data),
  remove: (id) => del(`/outfits/${id}`),
  toggleFavorite: (id) => post(`/outfits/${id}/favorite`),
  getFavorites: (params) => get('/outfits/favorites', params),
  // AI 推荐搭配
  getRecommendations: (params) => get('/outfits/recommendations', params),
};

// === AI 试穿 ===
const tryOnApi = {
  // 创建试穿任务（路径与 App 对齐）
  generate: (data) => post('/tryon', data),
  // 历史记录
  getHistory: (params) => get('/tryon', params),
  // 单次试穿详情
  getById: (id) => get(`/tryon/${id}`),
  // 试穿任务状态轮询
  getStatus: (id) => get(`/tryon/${id}/status`),
  // AI 配额查询（试穿/推荐）
  getQuota: () => get('/tryon/quota'),
};

// === 会员 ===
const membershipApi = {
  // 当前会员信息（VIP 状态、有效期等）
  getInfo: () => get('/membership'),
  // 套餐列表
  getPlans: () => get('/membership/plans'),
  // 订阅
  subscribe: (data) => post('/membership/subscribe', data),
};

// === 上传 ===
const uploadApi = {
  image: (filePath) => upload('/upload/image', filePath, 'file'),
};

module.exports = {
  authApi,
  userApi,
  clothesApi,
  outfitsApi,
  tryOnApi,
  membershipApi,
  uploadApi,
};
