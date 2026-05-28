/**
 * 排版组件
 * Display / Serif / Body / Caption / Kicker / Mono
 * 在 Text 之上做风格预设，避免散落的 fontFamily 设置
 */
import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import {
  heroStyle,
  displayStyle,
  serifTitleStyle,
  sectionTitleStyle,
  quoteStyle,
  bodyStyle,
  captionStyle,
  kickerStyle,
  monoStyle,
  monoLargeStyle,
} from '../theme/typography';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[] | (TextStyle | undefined | null | false)[];
  color?: string;
}

/** 创建 typography 组件工厂 */
function makeText(baseStyle: TextStyle) {
  return ({ style, color, children, ...rest }: TypographyProps) => (
    <Text
      {...rest}
      style={StyleSheet.flatten([baseStyle, color ? { color } : null, style as any])}
    >
      {children}
    </Text>
  );
}

/** 巨型衬线 Hero（80px） */
export const HeroText = makeText(heroStyle);

/** 衬线 Display（56px） */
export const DisplayText = makeText(displayStyle);

/** 衬线主标题（40px） */
export const SerifTitle = makeText(serifTitleStyle);

/** 衬线 Section 标题（22px） */
export const SectionTitle = makeText(sectionTitleStyle);

/** 衬线斜体引文 */
export const QuoteText = makeText(quoteStyle);

/** 正文（15px） */
export const BodyText = makeText(bodyStyle);

/** 弱化正文（13px） */
export const CaptionText = makeText(captionStyle);

/** Kicker 极小英文标签 */
export const KickerText = makeText(kickerStyle);

/** Mono 等宽 */
export const MonoText = makeText(monoStyle);

/** Mono 大号等宽 */
export const MonoLargeText = makeText(monoLargeStyle);
