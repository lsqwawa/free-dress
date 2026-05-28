/**
 * 排版样式预设
 * 组合字体族、字号、行高、字距，便于在页面与组件中直接复用
 */
import { TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants';

/** 杂志巨型 Hero（启动页 / 登录页） */
export const heroStyle: TextStyle = {
  fontFamily: FONTS.display,
  fontSize: FONT_SIZES.hero,
  lineHeight: FONT_SIZES.hero * 1.0,
  letterSpacing: -2,
  color: COLORS.ink,
  fontWeight: '400',
};

/** Display 大标题 */
export const displayStyle: TextStyle = {
  fontFamily: FONTS.display,
  fontSize: FONT_SIZES.display,
  lineHeight: FONT_SIZES.display * 1.05,
  letterSpacing: -1,
  color: COLORS.ink,
  fontWeight: '400',
};

/** 衬线主标题 */
export const serifTitleStyle: TextStyle = {
  fontFamily: FONTS.serif,
  fontSize: FONT_SIZES.xxl,
  lineHeight: FONT_SIZES.xxl * 1.1,
  letterSpacing: -0.5,
  color: COLORS.ink,
  fontWeight: '400',
};

/** 衬线 section 标题 */
export const sectionTitleStyle: TextStyle = {
  fontFamily: FONTS.serif,
  fontSize: FONT_SIZES.lg,
  lineHeight: FONT_SIZES.lg * 1.25,
  letterSpacing: 0,
  color: COLORS.ink,
  fontWeight: '400',
};

/** 衬线斜体引文 */
export const quoteStyle: TextStyle = {
  fontFamily: FONTS.serif,
  fontSize: FONT_SIZES.md,
  lineHeight: FONT_SIZES.md * 1.5,
  fontStyle: 'italic',
  color: COLORS.inkSoft,
  fontWeight: '400',
};

/** 正文 */
export const bodyStyle: TextStyle = {
  fontFamily: FONTS.body,
  fontSize: FONT_SIZES.base,
  lineHeight: FONT_SIZES.base * 1.55,
  color: COLORS.inkSoft,
  fontWeight: '400',
};

/** 弱化正文 */
export const captionStyle: TextStyle = {
  fontFamily: FONTS.body,
  fontSize: FONT_SIZES.sm,
  lineHeight: FONT_SIZES.sm * 1.5,
  color: COLORS.inkMuted,
  fontWeight: '400',
};

/** 极小英文标签 — Kicker */
export const kickerStyle: TextStyle = {
  fontFamily: FONTS.bodyMedium,
  fontSize: FONT_SIZES.xs,
  lineHeight: FONT_SIZES.xs * 1.4,
  letterSpacing: 2.4,
  color: COLORS.inkSoft,
  textTransform: 'uppercase',
  fontWeight: '600',
};

/** 等宽 — 期号、编号、价格 */
export const monoStyle: TextStyle = {
  fontFamily: FONTS.mono,
  fontSize: FONT_SIZES.xs,
  lineHeight: FONT_SIZES.xs * 1.4,
  letterSpacing: 1,
  color: COLORS.inkSoft,
  fontWeight: '400',
};

/** 等宽 — 大号期号 */
export const monoLargeStyle: TextStyle = {
  fontFamily: FONTS.mono,
  fontSize: FONT_SIZES.sm,
  lineHeight: FONT_SIZES.sm * 1.4,
  letterSpacing: 1.2,
  color: COLORS.inkSoft,
  fontWeight: '400',
};

/** 按钮文字 */
export const buttonTextStyle: TextStyle = {
  fontFamily: FONTS.bodyMedium,
  fontSize: FONT_SIZES.base,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  fontWeight: '600',
};
