/**
 * EmptyState 空状态
 * 杂志风：线稿图标 + 期号 + 主标题 + 副标题 + 行动按钮
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, HAIRLINE } from '../constants';
import { KickerText, SerifTitle, CaptionText } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  iconName?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  iconName = 'inbox',
  kicker = 'NOTHING HERE — YET',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconFrame}>
        <Feather name={iconName} size={36} color={COLORS.inkSoft} />
      </View>
      <View style={styles.kickerWrap}>
        <View style={styles.line} />
        <KickerText>{kicker}</KickerText>
        <View style={styles.line} />
      </View>
      <SerifTitle style={styles.title}>{title}</SerifTitle>
      {subtitle ? (
        <CaptionText style={styles.subtitle}>{subtitle}</CaptionText>
      ) : null}
      {actionLabel ? (
        <View style={styles.actionWrap}>
          <Button
            variant="solid"
            colorScheme="ink"
            size="md"
            onPress={onAction}
            rightSlot={
              <Feather name="arrow-right" size={14} color={COLORS.cream} />
            }
          >
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[6],
  },
  iconFrame: {
    width: 72,
    height: 72,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[6],
  },
  kickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  line: {
    width: 24,
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actionWrap: {
    marginTop: SPACING[6],
  },
});
