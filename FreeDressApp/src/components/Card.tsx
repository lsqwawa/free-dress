/**
 * Card 卡片
 * variant：flat（无边框无阴影）/ outlined（细边框）/ editorial（cream + hairline）/ poster（深底图卡 + 印刷投影）
 * 兼容旧 borderRadius / padding / margin / bg / overflow API
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, HAIRLINE, SHADOWS } from '../constants';

type CardVariant = 'flat' | 'outlined' | 'editorial' | 'poster';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  bg?: string;
  borderRadius?: number;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginX?: number;
  marginY?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  overflow?: 'hidden' | 'visible' | 'scroll';
}

export function Card({
  children,
  variant = 'editorial',
  style,
  bg,
  borderRadius,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginX,
  marginY,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  overflow,
}: CardProps) {
  const variantStyle = getVariantStyle(variant);
  const finalBg = bg ?? variantStyle.backgroundColor;
  const finalRadius = borderRadius ?? variantStyle.borderRadius;

  return (
    <View
      style={[
        variantStyle,
        {
          backgroundColor: finalBg,
          borderRadius: finalRadius,
          padding,
          paddingHorizontal: paddingX,
          paddingVertical: paddingY,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          margin,
          marginHorizontal: marginX,
          marginVertical: marginY,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          overflow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function getVariantStyle(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'flat':
      return {
        backgroundColor: COLORS.cream,
        borderRadius: RADIUS.sm,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderRadius: RADIUS.sm,
        borderWidth: HAIRLINE,
        borderColor: COLORS.mistGray,
      };
    case 'poster':
      return {
        backgroundColor: COLORS.ink,
        borderRadius: RADIUS.sm,
        ...SHADOWS.poster,
      };
    case 'editorial':
    default:
      return {
        backgroundColor: COLORS.cream,
        borderRadius: RADIUS.sm,
        borderWidth: HAIRLINE,
        borderColor: COLORS.mistGray,
      };
  }
}

const _unused = StyleSheet.create({ noop: {} });
