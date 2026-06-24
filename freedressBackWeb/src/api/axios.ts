import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const TOKEN_KEY = 'freedress_admin_token';

/**
 * Token 存储工具
 * - get：过滤掉历史脏数据（如字符串 "undefined" / "null" / 空串），避免误判已登录
 * - set：仅在 token 为非空字符串时写入，防止 setItem(key, undefined) 把 "undefined" 落盘
 */
export const tokenStorage = {
  get: () => {
    const v = localStorage.getItem(TOKEN_KEY);
    if (!v || v === 'undefined' || v === 'null') return null;
    return v;
  },
  set: (token: string) => {
    if (typeof token !== 'string' || !token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20_000,
});

// 请求拦截器：注入 token
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：401 自动登出 + 统一错误处理
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端约定 { code, message, data } 结构；若不是该结构，则原样返回
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      if (body.code === 0 || body.code === 200) {
        return body.data;
      }
      const message = body.message ?? '请求失败';
      return Promise.reject(new Error(message));
    }
    return body;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    if (status === 401) {
      tokenStorage.clear();
      // 避免循环：仅在非登录页时跳转
      if (!location.pathname.startsWith('/login')) {
        location.replace('/login');
      }
    }
    const message =
      error.response?.data?.message ?? error.message ?? '网络异常，请稍后重试';
    return Promise.reject(new Error(message));
  },
);

export default http;
