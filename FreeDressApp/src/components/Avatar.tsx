/**
 * Avatar 头像
 * 圆形或方形，支持挂载 stamp 徽标
 */
import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, RADIUS, HAIRLINE } from '../constants';

interface AvatarProps {
  uri?: string;
  size?: number;
  fallback?: string;
  shape?: 'circle' | 'square';
  borderColor?: string;
  bg?: string;
  style?: ViewStyle;
  /** 右下角徽标 */
  stamp?: React.ReactNode;
}

export function Avatar({
  uri,
  size = 64,
  fallback,
  shape = 'circle',
  borderColor = COLORS.mistGray,
  bg = COLORS.cream,
  style,
  stamp,
}: AvatarProps) {
  const radius = shape === 'circle' ? size / 2 : RADIUS.sm;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <View
        style={[
          styles.inner,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: bg,
            borderColor,
            borderWidth: HAIRLINE,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: radius,
            }}
          />
        ) : (
          <Text
            style={[
              styles.fallback,
              { fontSize: size * 0.42 },
            ]}
          >
            {fallback ? fallback.charAt(0).toUpperCase() : '·'}
          </Text>
        )}
      </View>
      {stamp ? <View style={styles.stamp}>{stamp}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  inner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    fontFamily: FONTS.serif,
    color: COLORS.ink,
    fontSize: FONT_SIZES.lg,
  },
  stamp: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
});
