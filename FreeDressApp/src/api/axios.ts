import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, STORAGE_KEYS} from '../constants';

/**
 * 创建 Axios 实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 在每个请求中添加认证令牌
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 从本地存储获取 token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 处理响应和错误
 */
apiClient.interceptors.response.use(
  response => {
    // 返回响应数据
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 处理 401 错误（未授权）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新 token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          );

          const {accessToken, refreshToken: newRefreshToken} =
            response.data.data;

          // 保存新的 token
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await AsyncStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            newRefreshToken,
          );

          // 重试原请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除认证信息
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_INFO,
        ]);

        // 可以在这里触发登出事件或跳转到登录页
        console.error('Token 刷新失败，请重新登录');
      }
    }

    // 处理其他错误
    const errorMessage =
      (error.response?.data as any)?.message || '网络请求失败';
    return Promise.reject(new Error(errorMessage));
  },
);

export default apiClient;
