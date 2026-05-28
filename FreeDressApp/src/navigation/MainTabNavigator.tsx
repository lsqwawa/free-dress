/**
 * 主页面底部导航器
 * 使用自定义 TabBar，关闭默认 header（每页自带 ScreenHeader）
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { CustomTabBar } from './CustomTabBar';

import HomeScreen from '../screens/HomeScreen';
import WardrobeStack from './WardrobeStack';
import OutfitScreen from '../screens/OutfitScreen';
import TryOnScreen from '../screens/TryOnScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * 顺序：Home / Wardrobe / TryOn(center) / Outfit / Profile
 * 中间放 TryOn 作为视觉锚
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wardrobe" component={WardrobeStack} />
      <Tab.Screen name="TryOn" component={TryOnScreen} />
      <Tab.Screen name="Outfit" component={OutfitScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
