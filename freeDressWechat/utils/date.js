/**
 * 日期工具 · Editorial Couture 期刊风格日期格式化
 */

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * 获取当前日期的期刊风格格式：DD · MMM · WKD
 * 例如：26 · MAY · MON
 */
function getEditorialDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = MONTHS_EN[now.getMonth()];
  const weekday = WEEKDAYS_EN[now.getDay()];
  return `${day} · ${month} · ${weekday}`;
}

/**
 * 获取当前的日期 DD
 */
function getDayNumber() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  return day;
}

/**
 * 获取当前月份 - 年份后两位 + 季节：05 - 26'SS 或 05 - 26'FW
 * SS = Spring/Summer (3-8月), FW = Fall/Winter (9-2月)
 */
function getSeasonCode() {
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 1-12
  const season = (month >= 3 && month <= 8) ? 'SS' : 'FW';
  return `${month} — ${yearShort}'${season}`;
}

/**
 * 获取当前是一年中的第几周（ISO 周数）
 * 用作 VOL / ISSUE 编号
 */
function getWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * 获取 ISSUE 编号字符串：ISSUE 22
 */
function getIssueText() {
  return `ISSUE ${getWeekNumber()}`;
}

/**
 * 获取 VOL 编号：VOL.22
 */
function getVolText() {
  return `VOL.${getWeekNumber()}`;
}

/**
 * 获取期号短格式：№ 22
 */
function getIssueNo() {
  return `№ ${getWeekNumber()}`;
}

/**
 * 获取完整的登录页期号：VOL.01 — 26'SS
 */
function getLoginVolText() {
  return `VOL.${getSeasonCode()}`;
}

/**
 * 获取当前年份
 */
function getCurrentYear() {
  return new Date().getFullYear();
}

module.exports = {
  getEditorialDate,
  getDayNumber,
  getSeasonCode,
  getWeekNumber,
  getIssueText,
  getVolText,
  getIssueNo,
  getLoginVolText,
  getCurrentYear,
};
