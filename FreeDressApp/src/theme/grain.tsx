/**
 * 颗粒纹理背景
 * 用半透明 View 错落叠加模拟印刷颗粒，无新依赖
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GrainProps {
  /** 颗粒密度，默认 60 */
  density?: number;
  /** 颗粒不透明度，默认 0.05 */
  opacity?: number;
  /** 颗粒颜色，默认深色 */
  color?: string;
  style?: ViewStyle;
}

/**
 * 伪随机数生成器（基于种子，确保每次渲染位置一致）
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * 颗粒背景层 — 绝对定位铺满父容器
 * 父容器需要设置 overflow: 'hidden' 与定位
 */
export function GrainBackground({
  density = 80,
  opacity = 0.06,
  color = '#1F1B16',
  style,
}: GrainProps) {
  // 用 useMemo 锁定颗粒位置，避免每次渲染都重新计算
  const dots = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: density }, (_, i) => ({
      key: i,
      top: `${rand() * 100}%`,
      left: `${rand() * 100}%`,
      size: 1 + Math.floor(rand() * 2),
      o: opacity * (0.5 + rand() * 0.5),
    }));
  }, [density, opacity]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {dots.map((d) => (
        <View
          key={d.key}
          style={{
            position: 'absolute',
            top: d.top as any,
            left: d.left as any,
            width: d.size,
            height: d.size,
            backgroundColor: color,
            opacity: d.o,
            borderRadius: d.size / 2,
          }}
        />
      ))}
    </View>
  );
}

/**
 * 噪点蒙版层（更浓密的颗粒，用于深色块上）
 */
export function GrainOverlay({ opacity = 0.08, color = '#FBF8F1', density = 120 }: GrainProps) {
  return <GrainBackground density={density} opacity={opacity} color={color} />;
}
