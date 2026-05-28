/**
 * Button
 * 五种 variant：solid / outline / ghost / link / inverse
 * 焦糖、墨黑、米白三套配色 scheme，支持按下缩放、加载、禁用
 */
import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants';
import { buttonTextStyle } from '../theme/typography';
import { fastTransition } from '../theme/motion';
import { BodyText } from './Text';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'inverse';
type ButtonColorScheme = 'caramel' | 'ink' | 'cream' | 'orange' | 'gray' | 'red' | 'blue';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  block?: boolean;
  uppercase?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** 右侧装饰元素，例如箭头点 */
  rightSlot?: React.ReactNode;
  /** 左侧装饰元素 */
  leftSlot?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  onPress,
  variant = 'solid',
  colorScheme = 'ink',
  size = 'md',
  isLoading = false,
  disabled = false,
  block = false,
  uppercase = true,
  style,
  textStyle,
  rightSlot,
  leftSlot,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const colors = getColors(colorScheme, variant);
  const sizing = getSizing(size);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, fastTransition);
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, fastTransition);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'ghost' || variant === 'link' ? 0 : 1,
          paddingVertical: sizing.py,
          paddingHorizontal: sizing.px,
          opacity: disabled ? 0.4 : 1,
          alignSelf: block ? 'stretch' : 'auto',
        },
        variant === 'solid' && colorScheme === 'ink' ? SHADOWS.poster : null,
        animatedStyle,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {leftSlot}
          <BodyText
            style={[
              buttonTextStyle,
              {
                color: colors.text,
                fontSize: sizing.fontSize,
                textTransform: uppercase ? 'uppercase' : 'none',
              },
              textStyle,
            ]}
          >
            {children}
          </BodyText>
          {rightSlot}
        </View>
      )}
      {variant === 'link' ? (
        <View
          style={[
            styles.linkUnderline,
            { backgroundColor: colors.text },
          ]}
        />
      ) : null}
    </AnimatedPressable>
  );
}

function getColors(scheme: ButtonColorScheme, variant: ButtonVariant) {
  // 兼容旧 scheme
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    'ink-solid': { bg: COLORS.ink, text: COLORS.cream, border: COLORS.ink },
    'ink-outline': { bg: 'transparent', text: COLORS.ink, border: COLORS.ink },
    'ink-ghost': { bg: 'transparent', text: COLORS.ink, border: 'transparent' },
    'ink-link': { bg: 'transparent', text: COLORS.ink, border: 'transparent' },
    'ink-inverse': { bg: COLORS.cream, text: COLORS.ink, border: COLORS.cream },

    'caramel-solid': { bg: COLORS.caramel, text: COLORS.cream, border: COLORS.caramel },
    'caramel-outline': { bg: 'transparent', text: COLORS.caramel, border: COLORS.caramel },
    'caramel-ghost': { bg: 'transparent', text: COLORS.caramel, border: 'transparent' },
    'caramel-link': { bg: 'transparent', text: COLORS.caramel, border: 'transparent' },
    'caramel-inverse': { bg: COLORS.cream, text: COLORS.caramel, border: COLORS.cream },

    'cream-solid': { bg: COLORS.cream, text: COLORS.ink, border: COLORS.cream },
    'cream-outline': { bg: 'transparent', text: COLORS.cream, border: COLORS.cream },
    'cream-ghost': { bg: 'transparent', text: COLORS.cream, border: 'transparent' },
    'cream-link': { bg: 'transparent', text: COLORS.cream, border: 'transparent' },
    'cream-inverse': { bg: COLORS.ink, text: COLORS.cream, border: COLORS.ink },
  };

  // 旧 scheme 映射
  const aliasScheme =
    scheme === 'orange' ? 'caramel'
    : scheme === 'gray' ? 'ink'
    : scheme === 'red' ? 'caramel'
    : scheme === 'blue' ? 'ink'
    : scheme;

  const key = `${aliasScheme}-${variant}`;
  return palette[key] || palette['ink-solid'];
}

function getSizing(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return { py: SPACING[2], px: SPACING[4], fontSize: FONT_SIZES.sm };
    case 'lg':
      return { py: SPACING[4], px: SPACING[6], fontSize: FONT_SIZES.base };
    default:
      return { py: SPACING[3], px: SPACING[5], fontSize: FONT_SIZES.sm };
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  linkUnderline: {
    position: 'absolute',
    bottom: 4,
    left: '20%',
    right: '20%',
    height: 1,
  },
});
