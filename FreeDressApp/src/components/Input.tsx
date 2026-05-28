/**
 * Input 输入框
 * variant：outline / underline / filled
 * underline 是杂志风首选 — 单根 hairline 下划线，聚焦时变 caramel
 * 支持浮动 label
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES, HAIRLINE } from '../constants';
import { FONTS } from '../constants';

interface InputProps extends TextInputProps {
  label?: string;
  variant?: 'outline' | 'underline' | 'filled';
  borderColor?: string;
  focusBorderColor?: string;
  errorMessage?: string;
  error?: boolean;
  errorBorderColor?: string;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function Input({
  label,
  variant = 'underline',
  borderColor = COLORS.mistGray,
  focusBorderColor = COLORS.caramel,
  errorMessage,
  error = false,
  errorBorderColor = COLORS.signal,
  containerStyle,
  style,
  value,
  onFocus,
  onBlur,
  placeholder,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || !!value ? 1 : 0,
      duration: 220,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false,
    }).start();
  }, [focused, value, labelAnim]);

  const lineColor = error
    ? errorBorderColor
    : focused
    ? focusBorderColor
    : borderColor;

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [FONT_SIZES.base, FONT_SIZES.xs],
  });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inkMuted, error ? errorBorderColor : focused ? focusBorderColor : COLORS.inkSoft],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
            },
          ]}
        >
          {label}
        </Animated.Text>
      ) : null}

      <TextInput
        {...props}
        value={value}
        placeholder={focused || !label ? placeholder : ''}
        placeholderTextColor={COLORS.inkMuted}
        style={[
          styles.inputBase,
          variant === 'outline'
            ? { ...styles.outline, borderColor: lineColor }
            : null,
          variant === 'filled'
            ? { ...styles.filled, borderColor: lineColor }
            : null,
          style as any,
          { color: COLORS.ink, paddingTop: label ? 22 : SPACING[3] },
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />

      {variant === 'underline' ? (
        <View
          style={[
            styles.underline,
            {
              backgroundColor: lineColor,
              height: focused ? 1.5 : HAIRLINE,
            },
          ]}
        />
      ) : null}

      {error && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 6,
  },
  label: {
    position: 'absolute',
    left: 0,
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inputBase: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING[2],
    paddingHorizontal: 0,
    color: COLORS.ink,
  },
  outline: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[4],
  },
  filled: {
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[4],
  },
  underline: {
    width: '100%',
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.signal,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING[1],
    letterSpacing: 0.5,
  },
});
