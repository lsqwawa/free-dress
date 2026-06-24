// 后端 Prisma 模型映射的 TypeScript 类型定义

// ============ 枚举 ============

export enum UserRole {
  USER = 'USER',
  VIP = 'VIP',
  ADMIN = 'ADMIN',
}

export enum RegisterSource {
  PHONE = 'PHONE',
  WECHAT_APP = 'WECHAT_APP',
  WECHAT_MP = 'WECHAT_MP',
}

export enum ClothCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  COAT = 'COAT',
  ACCESSORY = 'ACCESSORY',
  SHOE = 'SHOE',
}

export enum TryOnStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SubscriptionPlan {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============ 业务实体 ============

export interface User {
  id: string;
  phone: string | null;
  wechatUnionId: string | null;
  wechatOpenIdApp: string | null;
  wechatOpenIdMp: string | null;
  wechatNickname: string | null;
  wechatAvatarUrl: string | null;
  nickname: string;
  avatarUrl: string | null;
  role: UserRole;
  registerSource: RegisterSource;
  createdAt: string;
  updatedAt: string;
}

/** 后台管理员（实质就是 role=ADMIN 的 User） */
export type AdminUser = User;

export interface Cloth {
  id: string;
  userId: string;
  imageUrl: string;
  category: ClothCategory;
  color: string | null;
  style: string | null;
  season: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'nickname' | 'avatarUrl'>;
}

export interface Outfit {
  id: string;
  userId: string;
  aiDescription: string | null;
  style: string | null;
  occasion: string | null;
  imageUrl: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'nickname' | 'avatarUrl'>;
  outfitClothes?: { clothId: string; order: number; cloth?: Cloth }[];
}

export interface TryOnResult {
  id: string;
  userId: string;
  outfitId: string;
  personImageUrl: string;
  resultImageUrl: string | null;
  status: TryOnStatus;
  progress: number;
  failReason: string | null;
  processingTime: number | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'nickname' | 'avatarUrl'>;
  outfit?: Pick<Outfit, 'id' | 'imageUrl' | 'style'>;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  createdAt: string;
  user?: Pick<User, 'id' | 'nickname' | 'phone'>;
}

export interface AiQuota {
  id: string;
  userId: string;
  type: 'tryon' | 'recommend' | string;
  date: string;
  count: number;
  createdAt: string;
}

// ============ 通用响应 ============

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// ============ AI 试穿统计 ============

export interface TryOnStats {
  statusCounts: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
  avgProcessingTime: number;
  topFailReasons: { reason: string; count: number }[];
}

export interface AiQuotaSeriesPoint {
  date: string;
  tryon: number;
  recommend: number;
  total: number;
}

export interface AiQuotaPeriodStats {
  total: number;
  tryon: number;
  recommend: number;
  activeUsers: number;
  series: AiQuotaSeriesPoint[];
}

export interface AiQuotaStats {
  last7Days: AiQuotaPeriodStats;
  last30Days: AiQuotaPeriodStats;
}

// ============ Admin 统计 ============

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalClothes: number;
  totalOutfits: number;
  totalTryOns: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
  aiCallsToday: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

// ============ Admin 试穿统计 ============

export interface TryOnStatsResponse {
  statusCounts: Record<TryOnStatus, number>;
  avgProcessingTime: number;
  topFailReasons: { reason: string; count: number }[];
}

// ============ Admin AI 配额统计 ============

export interface AiQuotaStatsResponse {
  totalCalls: number;
  todayCalls: number;
  dailyStats: { date: string; tryon: number; recommend: number }[];
}

// ============ 用户详情（含 _count） ============

export interface UserDetail extends User {
  _count?: {
    clothes: number;
    outfits: number;
    tryOnResults: number;
    favorites: number;
  };
}

// ============ 认证 ============

export interface LoginPayload {
  phone: string;
  password: string;
}

/**
 * 登录响应（与后端 auth.service.login 返回结构对齐）
 * 经 TransformInterceptor 包装后，axios 响应拦截器已解包至此 data 层。
 */
export interface LoginResponse {
  /** JWT 访问令牌（后端字段为 accessToken） */
  accessToken: string;
  /** JWT 刷新令牌（30 天有效） */
  refreshToken: string;
  /** 序列化后的用户信息 */
  user: AdminUser;
  /** 自动绑定微信结果（管理后台登录场景下通常为 'SKIP'） */
  autoBindResult?: 'OK' | 'CONFLICT' | 'ALREADY_BOUND' | 'SKIP';
}
