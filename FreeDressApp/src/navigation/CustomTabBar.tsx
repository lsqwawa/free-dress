/**
 * 自定义底部 TabBar
 * ink 深色底 + cream hairline 上边线 + caramel 滑动指示器
 * 中心 Tab 放大为视觉锚（AI 试穿）
 */
import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, HAIRLINE, EASE, DURATION, FONTS, FONT_SIZES } from '../constants';
import { Text } from 'react-native';

interface TabConfig {
  key: string;
  icon: string;
  label: string;
  kicker: string;
  center?: boolean;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  Home: { key: 'Home', icon: 'home', label: '首页', kicker: 'HOME' },
  Wardrobe: { key: 'Wardrobe', icon: 'inbox', label: '衣橱', kicker: 'CLOSET' },
  TryOn: { key: 'TryOn', icon: 'user-check', label: '试穿', kicker: 'TRY-ON', center: true },
  Outfit: { key: 'Outfit', icon: 'layers', label: '搭配', kicker: 'STYLE' },
  Profile: { key: 'Profile', icon: 'user', label: '我的', kicker: 'YOU' },
};

const TAB_HEIGHT = 72;
const INDICATOR_WIDTH = 24;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);
  const tabWidth = useSharedValue(Dimensions.get('window').width / state.routes.length);

  useEffect(() => {
    indicatorX.value = withTiming(state.index * tabWidth.value, {
      duration: DURATION.slow,
      easing: EASE.editorial,
    });
  }, [state.index, indicatorX, tabWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width / state.routes.length;
    tabWidth.value = w;
    indicatorX.value = state.index * w;
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorX.value + (tabWidth.value - INDICATOR_WIDTH) / 2 },
    ],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, SPACING[2]),
          height: TAB_HEIGHT + Math.max(insets.bottom, SPACING[2]),
        },
      ]}
      onLayout={onLayout}
    >
      <View style={styles.hairline} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const cfg = TAB_CONFIG[route.name] || {
            key: route.name,
            icon: 'circle',
            label: route.name,
            kicker: route.name.toUpperCase(),
          };
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <TabItem
              key={route.key}
              cfg={cfg}
              focused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>

      {/* 滑动指示器 */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
}

interface TabItemProps {
  cfg: TabConfig;
  focused: boolean;
  onPress: () => void;
}

function TabItem({ cfg, focused, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.02 : 1, {
      duration: DURATION.base,
      easing: EASE.editorial,
    });
  }, [focused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePress = () => {
    // if (cfg.center) {
    //   rotate.value = withTiming(rotate.value + 180, {
    //     duration: DURATION.slow,
    //     easing: EASE.editorial,
    //   });
    // }
    onPress();
  };

  if (cfg.center) {
    return (
      <Pressable style={styles.tabItem} onPress={handlePress}>
        <Animated.View style={[styles.centerCircle, animatedIconStyle]}>
          <Feather
            name={cfg.icon}
            size={20}
            color={focused ? COLORS.cream : COLORS.cream}
          />
        </Animated.View>
        <Text
          style={[
            styles.kicker,
            { color: focused ? COLORS.sand : COLORS.inkMuted },
          ]}
        >
          {cfg.kicker}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.tabItem} onPress={handlePress}>
      <Animated.View style={animatedIconStyle}>
        <Feather
          name={cfg.icon}
          size={20}
          color={focused ? COLORS.sand : COLORS.inkMuted}
        />
      </Animated.View>
      <Text
        style={[
          styles.kicker,
          {
            color: focused ? COLORS.sand : COLORS.inkMuted,
            marginTop: 4
          },
        ]}
      >
        {cfg.kicker}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.ink,
    paddingTop: SPACING[3],
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HAIRLINE,
    backgroundColor: COLORS.inkMuted,
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING[2],
  },
  centerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: HAIRLINE,
    borderColor: COLORS.cream,
    backgroundColor: COLORS.caramel,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SPACING[3],
    marginBottom: SPACING[1],
  },
  kicker: {
    fontFamily: FONTS.bodyMedium,
    fontSize: FONT_SIZES.xs - 2,
    letterSpacing: 1.6,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 2,
    backgroundColor: COLORS.caramel,
  },
});
