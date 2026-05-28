/**
 * Stack 布局组件
 * HStack 横向 / VStack 纵向，所有间距（space / mb / mt / px / py 等）走 SPACING token，1 = 4px
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SPACING } from '../constants';

type SpacingKey = keyof typeof SPACING;

interface StackProps {
  children: React.ReactNode;
  space?: SpacingKey | number;
  style?: ViewStyle;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  flex?: number;
  flexWrap?: 'wrap' | 'nowrap';
  /** 间距快捷方式，单位为 SPACING 索引（4px 网格） */
  mb?: SpacingKey | number;
  mt?: SpacingKey | number;
  ml?: SpacingKey | number;
  mr?: SpacingKey | number;
  mx?: SpacingKey | number;
  my?: SpacingKey | number;
  px?: SpacingKey | number;
  py?: SpacingKey | number;
  pt?: SpacingKey | number;
  pb?: SpacingKey | number;
  bg?: string;
}

/** 将 token key 或像素值统一转换为像素 */
function resolveSpacing(value: SpacingKey | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return SPACING[value as SpacingKey] ?? value;
  }
  return SPACING[value];
}

function buildSpacingStyle(props: Partial<StackProps>): ViewStyle {
  return {
    marginBottom: resolveSpacing(props.mb),
    marginTop: resolveSpacing(props.mt),
    marginLeft: resolveSpacing(props.ml),
    marginRight: resolveSpacing(props.mr),
    marginHorizontal: resolveSpacing(props.mx),
    marginVertical: resolveSpacing(props.my),
    paddingHorizontal: resolveSpacing(props.px),
    paddingVertical: resolveSpacing(props.py),
    paddingTop: resolveSpacing(props.pt),
    paddingBottom: resolveSpacing(props.pb),
  };
}

export function HStack({
  children,
  space = 0,
  style,
  alignItems = 'center',
  justifyContent = 'flex-start',
  flexWrap,
  flex,
  bg,
  ...spacingProps
}: StackProps) {
  const spacingStyle = buildSpacingStyle(spacingProps);
  const gap = resolveSpacing(space) ?? 0;
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.hstack,
        {
          alignItems,
          justifyContent,
          flexWrap,
          flex,
          backgroundColor: bg,
        },
        spacingStyle,
        style,
      ]}
    >
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={index < childrenArray.length - 1 ? { marginRight: gap } : null}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

export function VStack({
  children,
  space = 0,
  style,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  flexWrap,
  flex,
  bg,
  ...spacingProps
}: StackProps) {
  const spacingStyle = buildSpacingStyle(spacingProps);
  const gap = resolveSpacing(space) ?? 0;
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.vstack,
        {
          alignItems,
          justifyContent,
          flexWrap,
          flex,
          backgroundColor: bg,
        },
        spacingStyle,
        style,
      ]}
    >
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={index < childrenArray.length - 1 ? { marginBottom: gap } : null}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hstack: {
    flexDirection: 'row',
  },
  vstack: {
    flexDirection: 'column',
  },
});
