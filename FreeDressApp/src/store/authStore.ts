import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginResponse } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * 认证状态接口
 */
interface AuthState {
  // 状态
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 方法
  setAuth: (data: LoginResponse) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  loadAuthFromStorage: () => Promise<void>;
}

/**
 * 认证状态管理
 * 使用 Zustand 管理用户认证状态
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // 初始状态
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * 设置认证信息
   */
  setAuth: async (data: LoginResponse) => {
    const { user, accessToken, refreshToken } = data;
    
    // 保存到状态
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    // 保存到本地存储
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER_INFO, JSON.stringify(user)],
    ]);
  },

  /**
   * 清除认证信息（登出）
   */
  clearAuth: async () => {
    // 清除状态
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // 清除本地存储
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_INFO,
    ]);
  },

  /**
   * 更新用户信息
   */
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      
      // 更新本地存储
      AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUser));
    }
  },

  /**
   * 从本地存储加载认证信息
   */
  loadAuthFromStorage: async () => {
    try {
      const [[, accessToken], [, refreshToken], [, userStr]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_INFO,
      ]);

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('加载认证信息失败:', error);
      set({ isLoading: false });
    }
  },
}));
