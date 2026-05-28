/**
 * Section 杂志风分区头
 * 左 Kicker 小字 + 中部衬线主标题 + 右 Mono 期号 + 下方 hairline 长线
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, HAIRLINE } from '../constants';
import { KickerText, SectionTitle, MonoText } from './Text';

interface SectionProps {
  /** 英文小标 */
  kicker?: string;
  /** 主标题 */
  title?: string;
  /** 右上期号 */
  issue?: string;
  /** 是否显示底部 hairline */
  divider?: boolean;
  style?: ViewStyle;
}

export function Section({
  kicker,
  title,
  issue,
  divider = true,
  style,
}: SectionProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {kicker ? <KickerText>{kicker}</KickerText> : null}
          {title ? (
            <SectionTitle style={styles.title}>{title}</SectionTitle>
          ) : null}
        </View>
        {issue ? <MonoText>{issue}</MonoText> : null}
      </View>
      {divider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: SPACING[2],
  },
  left: {
    flex: 1,
    gap: 4,
  },
  title: {
    marginTop: 4,
  },
  divider: {
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
    width: '100%',
  },
});
