/**
 * 全局类型定义
 */

// 用户角色
export type UserRole = 'USER' | 'VIP';

// 注册来源
export type RegisterSource = 'PHONE' | 'WECHAT_APP' | 'WECHAT_MP';

// 用户信息
export interface User {
  id: string;
  /** 纯微信账号可能没有手机号 */
  phone?: string | null;
  nickname: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  // 绑定状态（后端 serializeUser 返回）
  registerSource?: RegisterSource;
  hasPhone?: boolean;
  hasWechatMp?: boolean;
  hasWechatApp?: boolean;
  needBindPhone?: boolean;
}

// 衣物分类
export type ClothCategory = 'TOP' | 'BOTTOM' | 'COAT' | 'ACCESSORY' | 'SHOE';

// 衣物信息
export interface Cloth {
  id: string;
  userId: string;
  imageUrl: string;
  category: ClothCategory;
  color?: string;
  style?: string;
  season: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 搭配信息
export interface Outfit {
  id: string;
  userId: string;
  clothIds: string[];
  clothes?: Cloth[];
  aiDescription?: string;
  style?: string;
  occasion?: string;
  imageUrl?: string;
  createdAt: string;
}

// AI试穿结果
export interface TryOnResult {
  id: string;
  userId: string;
  outfitId: string;
  personImageUrl: string;
  resultImageUrl: string;
  createdAt: string;
}

// API 响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 登录响应
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 导航参数
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { resetToken: string };
  EditProfile: undefined;
  Favorites: undefined;
  OutfitHistory: undefined;
  TryOnHistory: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  EditClothing: { clothId: string };
  Membership: undefined;
  AccountSecurity: undefined;
  BindPhone: undefined;
};

export type WardrobeStackParamList = {
  WardrobeList: undefined;
  AddClothing: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Outfit: undefined;
  TryOn: undefined;
  Profile: undefined;
};
