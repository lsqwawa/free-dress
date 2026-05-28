/**
 * 全局常量与设计 Token
 * 设计语言：Editorial Couture · Postal Monochromatic · Neo-minimalism
 */
import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

// API 基础地址
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

/**
 * Atelier Palette
 * 暖灰棕单色调 + 一抹烧赭点睛，刻意压低饱和度，靠层次而非色相取胜
 */
export const COLORS = {
  // 主调（深 → 浅）
  ink: '#1F1B16',        // 主文字、深色块、Tab 背景（暖黑）
  inkSoft: '#4A4138',    // 次级文字
  inkMuted: '#7A6F62',   // 弱化文字

  // 米杏背景
  ecru: '#EBE4D6',       // 主背景
  cream: '#F6F1E6',      // 卡片底色
  paper: '#FBF8F1',      // 高亮纸感

  // 点睛（替换原焦糖橙，更 muted）
  caramel: '#A86B3D',    // 主品牌色（赤陶/烧赭）
  caramelDeep: '#7A4A28', // 按下/强调
  caramelTint: '#D9B492', // 浅化

  // 辅助
  sand: '#BFA478',       // 金棕，用于 VIP / 期号
  mistGray: '#C9C0B0',   // 边框、分隔线
  clay: '#948876',       // 占位、辅助文字
  signal: '#8C4A3F',     // 错误（赭红）
  jade: '#5E6B4D',       // 成功（橄榄）

  // —— 兼容旧字段（避免现有引用编译失败） ——
  primary: '#A86B3D',
  primaryLight: '#D9B492',
  primaryDark: '#7A4A28',
  secondary: '#BFA478',
  background: '#EBE4D6',
  white: '#FBF8F1',
  black: '#1F1B16',
  gray: '#948876',
  lightGray: '#D7CFC2',
  border: '#C9C0B0',
  error: '#8C4A3F',
  success: '#5E6B4D',
  warning: '#BFA478',
};

/**
 * 字体族
 * 平台原生衬线 / 无衬线 / 等宽，预留接入自定义字体（Playfair Display, Cormorant 等）
 */
export const FONTS = {
  display: Platform.select({
    ios: 'Didot',
    android: 'serif',
    default: 'serif',
  }) as string,
  serif: Platform.select({
    ios: 'Times New Roman',
    android: 'serif',
    default: 'serif',
  }) as string,
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  bodyMedium: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-medium',
    default: 'System',
  }) as string,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

/** 字号尺度 — 杂志感大字 + 紧凑正文 */
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 22,
  xl: 28,
  xxl: 40,
  display: 56,
  hero: 80,
};

/** 4px 间距网格 */
export const SPACING = {
  px: 1,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

/** 圆角 — 主用 0 / 4，刻意避开圆润感 */
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
};

/** 阴影 — 暖黑色低不透明长偏移，印刷感 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  press: {
    shadowColor: '#1F1B16',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 1,
  },
  card: {
    shadowColor: '#1F1B16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  poster: {
    shadowColor: '#1F1B16',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 0,
    elevation: 3,
  },
};

/** 动效曲线与时长 */
export const EASE = {
  editorial: Easing.bezier(0.22, 1, 0.36, 1),
  press: Easing.bezier(0.4, 0, 0.2, 1),
  in: Easing.bezier(0.4, 0, 1, 1),
  out: Easing.bezier(0, 0, 0.2, 1),
};

export const DURATION = {
  fast: 180,
  base: 260,
  slow: 480,
  scenic: 800,
};

/** 细线宽度 — 用于 hairline 分隔 */
export const HAIRLINE = Platform.OS === 'android' ? 0.5 : 0.33;

// 衣物分类
export const CLOTH_CATEGORIES = [
  { value: 'TOP', label: '上衣', icon: 'tshirt' },
  { value: 'BOTTOM', label: '下装', icon: 'user' },
  { value: 'COAT', label: '外套', icon: 'archive' },
  { value: 'ACCESSORY', label: '配饰', icon: 'gem' },
  { value: 'SHOE', label: '鞋子', icon: 'shoe-prints' },
] as const;

// 颜色选项
export const COLOR_OPTIONS = [
  '黑色', '白色', '灰色', '红色', '橙色', '黄色',
  '绿色', '蓝色', '紫色', '粉色', '棕色', '米色'
];

// 风格选项
export const STYLE_OPTIONS = [
  '休闲', '商务', '运动', '复古', '简约', '时尚',
  '甜美', '街头', '优雅', '中性'
];

// 季节选项
export const SEASON_OPTIONS = ['春', '夏', '秋', '冬'];

// 存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
};

// 分页配置
export const PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
