/**
 * Tag 胶囊标签
 * active 状态 ink 实心，inactive 仅 hairline 边框
 */
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZES,
  FONTS,
  HAIRLINE,
} from '../constants';

interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  size?: 'sm' | 'md';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Tag({
  children,
  active = false,
  size = 'md',
  onPress,
  disabled,
  style,
  textStyle,
}: TagProps) {
  const sizing = size === 'sm'
    ? { px: SPACING[3], py: SPACING[1], fontSize: FONT_SIZES.xs }
    : { px: SPACING[4], py: SPACING[2], fontSize: FONT_SIZES.sm };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.tag,
        {
          paddingHorizontal: sizing.px,
          paddingVertical: sizing.py,
          backgroundColor: active ? COLORS.ink : 'transparent',
          borderColor: active ? COLORS.ink : COLORS.mistGray,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: active ? COLORS.cream : COLORS.inkSoft,
            fontSize: sizing.fontSize,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: RADIUS.full,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
});
