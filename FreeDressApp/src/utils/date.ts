/**
 * 日期工具 · Editorial Couture 期刊风格日期格式化
 *
 * 与 freeDressWechat/utils/date.js 保持一致，用于 App 端动态生成期刊期号、
 * 日期、季节码等信息，避免硬编码。
 */

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * 获取当前日期的期刊风格格式：DD · MMM · WKD
 * 例如：26 · MAY · MON
 */
export function getEditorialDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = MONTHS_EN[now.getMonth()];
  const weekday = WEEKDAYS_EN[now.getDay()];
  return `${day} · ${month} · ${weekday}`;
}

/**
 * 获取当前的日期 DD
 */
export function getDayNumber(): string {
  const now = new Date();
  return String(now.getDate()).padStart(2, '0');
}

/**
 * 获取当前月份 - 年份后两位 + 季节：05 — 26'SS 或 05 — 26'FW
 * SS = Spring/Summer (3-8月), FW = Fall/Winter (9-2月)
 */
export function getSeasonCode(): string {
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = now.getMonth() + 1; // 1-12
  const monthStr = String(month).padStart(2, '0');
  const season = month >= 3 && month <= 8 ? 'SS' : 'FW';
  return `${monthStr} — ${yearShort}'${season}`;
}

/**
 * 获取当前是一年中的第几周（ISO 周数）
 * 用作 VOL / ISSUE 编号
 */
export function getWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * 获取 ISSUE 编号字符串：ISSUE 22
 */
export function getIssueText(): string {
  return `ISSUE ${getWeekNumber()}`;
}

/**
 * 获取 VOL 编号：VOL.22
 */
export function getVolText(): string {
  return `VOL.${getWeekNumber()}`;
}

/**
 * 获取期号短格式：№ 22
 */
export function getIssueNo(): string {
  return `№ ${getWeekNumber()}`;
}

/**
 * 获取完整的登录页期号：VOL.05 — 26'SS
 */
export function getLoginVolText(): string {
  return `VOL.${getSeasonCode()}`;
}

/**
 * 获取当前年份
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * 获取 EST. YYYY 字符串：EST. 2026
 */
export function getEstYearText(): string {
  return `EST. ${getCurrentYear()}`;
}

/**
 * 获取当前周数对应的零填充字符串（用于 № 显示）
 */
export function getWeekNumberPadded(): string {
  return String(getWeekNumber()).padStart(2, '0');
}

/**
 * 获取 EDITORIAL · ISSUE NN 完整 kicker
 */
export function getEditorialIssueText(): string {
  return `EDITORIAL · ${getIssueText()}`;
}
