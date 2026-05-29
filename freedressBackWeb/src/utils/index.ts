// 工具函数集合

/** className 拼接 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** 格式化日期 yyyy-MM-dd HH:mm */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 格式化日期 yyyy-MM-dd */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 数字千分位 */
export function formatNumber(n?: number | null): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return n.toLocaleString('zh-CN');
}

/** 金额（元） */
export function formatCurrency(n?: number | null, symbol = '¥'): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return `${symbol}${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 简单防抖 */
export function debounce<T extends (...args: never[]) => void>(fn: T, delay = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/** 截取字符串 */
export function truncate(str: string, max = 30): string {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}
