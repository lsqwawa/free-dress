import http from './axios';
import type {
  AiQuotaStats,
  Cloth,
  DashboardStats,
  Outfit,
  PaginatedResponse,
  PaginationQuery,
  Subscription,
  TimeSeriesPoint,
  TryOnResult,
  TryOnStats,
  User,
  UserDetail,
} from '@/types';

/** Admin 端聚合 API 封装。后端路由约定：复数资源名，无 /me/ 前缀 */
export const adminApi = {
  // Dashboard
  stats: (): Promise<DashboardStats> => http.get('/admin/stats'),
  userTrend: (days = 30): Promise<TimeSeriesPoint[]> =>
    http.get('/admin/stats/users-trend', { params: { days } }),
  revenueTrend: (days = 30): Promise<TimeSeriesPoint[]> =>
    http.get('/admin/stats/revenue-trend', { params: { days } }),
  tryOnStats: (): Promise<TryOnStats> => http.get('/admin/tryon/stats'),
  aiQuotaStats: (days = 7): Promise<AiQuotaStats[]> =>
    http.get('/admin/ai-quotas/stats', { params: { days } }),

  // Users
  listUsers: (query: PaginationQuery & { role?: string; search?: string; registerSource?: string } = {}): Promise<PaginatedResponse<User>> =>
    http.get('/admin/users', { params: query }),
  getUser: (id: string): Promise<UserDetail> => http.get(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string): Promise<User> =>
    http.put(`/admin/users/${id}/role`, { role }),
  updateUser: (id: string, payload: Partial<User>): Promise<User> =>
    http.patch(`/admin/users/${id}`, payload),
  deleteUser: (id: string): Promise<void> => http.delete(`/admin/users/${id}`),

  // Clothes
  listClothes: (query: PaginationQuery & { category?: string; userId?: string } = {}): Promise<PaginatedResponse<Cloth>> =>
    http.get('/admin/clothes', { params: query }),
  deleteCloth: (id: string): Promise<void> => http.delete(`/admin/clothes/${id}`),

  // Outfits
  listOutfits: (query: PaginationQuery & { userId?: string } = {}): Promise<PaginatedResponse<Outfit>> =>
    http.get('/admin/outfits', { params: query }),
  deleteOutfit: (id: string): Promise<void> => http.delete(`/admin/outfits/${id}`),

  // Try-on
  listTryOns: (query: PaginationQuery & { status?: string } = {}): Promise<PaginatedResponse<TryOnResult>> =>
    http.get('/admin/tryons', { params: query }),

  // Subscriptions / Membership
  listSubscriptions: (
    query: PaginationQuery & { status?: string; plan?: string } = {},
  ): Promise<PaginatedResponse<Subscription>> => http.get('/admin/subscriptions', { params: query }),
};
