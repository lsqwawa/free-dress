/**
 * API 接口集合
 */
const { get, post, put, del, upload } = require('./request');

// === 认证 ===
const authApi = {
  login: (phone, password) => post('/auth/login', { phone, password }),
  register: (data) => post('/auth/register', data),
  refreshToken: (refreshToken) => post('/auth/refresh', { refreshToken }),
  forgotPassword: (phone) => post('/auth/forgot-password', { phone }),
  resetPassword: (data) => post('/auth/reset-password', data),
};

// === 用户 ===
const userApi = {
  getProfile: () => get('/users/me'),
  updateProfile: (data) => put('/users/me', data),
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
};

// === AI试穿 ===
const tryOnApi = {
  generate: (data) => post('/tryon/generate', data),
  getHistory: (params) => get('/tryon/history', params),
  getById: (id) => get(`/tryon/${id}`),
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
  uploadApi,
};
