/**
 * IconButton 图标按钮
 * 圆形 / 方形，含 press 缩放
 */
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, RADIUS, SPACING, HAIRLINE } from '../constants';
import { fastTransition } from '../theme/motion';

interface IconButtonProps {
  /** Feather 图标名 */
  name: string;
  size?: number;
  /** 整体尺寸 */
  buttonSize?: number;
  variant?: 'ghost' | 'outline' | 'solid' | 'inverse' | 'caramel';
  shape?: 'circle' | 'square';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  name,
  size = 18,
  buttonSize = 40,
  variant = 'ghost',
  shape = 'square',
  onPress,
  disabled,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const cfg = getConfig(variant);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.92, fastTransition);
      }}
      onPressOut={() => {
        scale.value = withTiming(1, fastTransition);
      }}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          borderWidth: cfg.borderWidth,
          borderRadius: shape === 'circle' ? RADIUS.full : RADIUS.sm,
          opacity: disabled ? 0.4 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={name} size={size} color={cfg.color} />
    </AnimatedPressable>
  );
}

function getConfig(variant: IconButtonProps['variant']) {
  switch (variant) {
    case 'outline':
      return {
        bg: 'transparent',
        color: COLORS.ink,
        border: COLORS.mistGray,
        borderWidth: HAIRLINE,
      };
    case 'solid':
      return {
        bg: COLORS.ink,
        color: COLORS.cream,
        border: COLORS.ink,
        borderWidth: 0,
      };
    case 'inverse':
      return {
        bg: COLORS.cream,
        color: COLORS.ink,
        border: COLORS.cream,
        borderWidth: 0,
      };
    case 'caramel':
      return {
        bg: COLORS.caramel,
        color: COLORS.cream,
        border: COLORS.caramel,
        borderWidth: 0,
      };
    case 'ghost':
    default:
      return {
        bg: 'transparent',
        color: COLORS.ink,
        border: 'transparent',
        borderWidth: 0,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[1],
  },
});
