/**
 * 全局类型定义
 */

// 用户角色
export type UserRole = 'USER' | 'VIP';

// 用户信息
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
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
