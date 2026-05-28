/**
 * Badge 徽标
 * variant：solid / outline / stamp（印章感，带 hairline 边框 + 大字距）
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, FONTS, HAIRLINE } from '../constants';

type BadgeVariant = 'solid' | 'outline' | 'stamp';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  bg?: string;
  color?: string;
  borderRadius?: number | string;
  px?: number;
  py?: number;
}

export function Badge({
  children,
  variant = 'solid',
  style,
  textStyle,
  bg,
  color,
  borderRadius,
  px,
  py,
}: BadgeProps) {
  const cfg = getVariantConfig(variant);
  const finalBg = bg ?? cfg.bg;
  const finalColor = color ?? cfg.color;
  const finalRadius =
    borderRadius === 'full' ? RADIUS.full : borderRadius ?? cfg.radius;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: finalBg,
          borderColor: cfg.borderColor,
          borderWidth: cfg.borderWidth,
          borderRadius: finalRadius as number,
          paddingHorizontal: px !== undefined ? px * 4 : cfg.px,
          paddingVertical: py !== undefined ? py * 4 : cfg.py,
        },
        style,
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={[
            styles.text,
            {
              color: finalColor,
              fontFamily: variant === 'stamp' ? FONTS.bodyMedium : FONTS.body,
              letterSpacing: variant === 'stamp' ? 1.6 : 0.4,
              textTransform: variant === 'stamp' ? 'uppercase' : 'none',
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function getVariantConfig(variant: BadgeVariant) {
  switch (variant) {
    case 'outline':
      return {
        bg: 'transparent',
        color: COLORS.ink,
        borderColor: COLORS.ink,
        borderWidth: HAIRLINE,
        radius: RADIUS.sm,
        px: SPACING[2],
        py: SPACING[1],
      };
    case 'stamp':
      return {
        bg: COLORS.cream,
        color: COLORS.caramel,
        borderColor: COLORS.caramel,
        borderWidth: HAIRLINE,
        radius: RADIUS.sm,
        px: SPACING[3],
        py: SPACING[1],
      };
    case 'solid':
    default:
      return {
        bg: COLORS.ink,
        color: COLORS.cream,
        borderColor: 'transparent',
        borderWidth: 0,
        radius: RADIUS.full,
        px: SPACING[2],
        py: SPACING[1],
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
