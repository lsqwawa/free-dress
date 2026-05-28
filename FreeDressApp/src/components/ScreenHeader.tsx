/**
 * ScreenHeader 页眉
 * 杂志感期号 + 主标题 + 右侧动作图标
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, HAIRLINE } from '../constants';
import { KickerText, SerifTitle, MonoText } from './Text';

interface ScreenHeaderProps {
  /** 英文小标 */
  kicker?: string;
  /** 中文主标题 */
  title?: string;
  /** 期号 */
  issue?: string;
  /** 右侧节点（IconButton 等） */
  rightSlot?: React.ReactNode;
  /** 左侧节点 */
  leftSlot?: React.ReactNode;
  /** 是否显示底部 hairline */
  divider?: boolean;
  style?: ViewStyle;
  /** 紧凑模式 */
  compact?: boolean;
}

export function ScreenHeader({
  kicker,
  title,
  issue,
  rightSlot,
  leftSlot,
  divider = true,
  style,
  compact = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (compact ? SPACING[3] : SPACING[4]),
          paddingBottom: compact ? SPACING[3] : SPACING[5],
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          {leftSlot}
          {kicker ? <KickerText>{kicker}</KickerText> : null}
        </View>
        {issue ? <MonoText>{issue}</MonoText> : null}
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
      {title ? <SerifTitle style={styles.title}>{title}</SerifTitle> : null}
      {divider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING[5],
    backgroundColor: COLORS.ecru,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
  },
  rightSlot: {
    marginLeft: SPACING[3],
  },
  title: {
    marginTop: SPACING[3],
  },
  divider: {
    marginTop: SPACING[4],
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
  },
});
