/**
 * 根导航器
 * 应用 NavigationContainer 主题，使用 ecru / ink / caramel 配色
 */
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, StyleSheet } from 'react-native';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants';

import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import OutfitHistoryScreen from '../screens/OutfitHistoryScreen';
import TryOnHistoryScreen from '../screens/TryOnHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const editorialTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.caramel,
    background: COLORS.ecru,
    card: COLORS.ecru,
    text: COLORS.ink,
    border: COLORS.mistGray,
    notification: COLORS.signal,
  },
};

/**
 * 根导航器：根据登录状态切换 Main / Login+Register
 */
function RootNavigator() {
  const { isAuthenticated, isLoading, loadAuthFromStorage } = useAuthStore();

  useEffect(() => {
    loadAuthFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <View style={styles.splash} />;
  }

  return (
    <NavigationContainer theme={editorialTheme}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.ecru} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.ecru },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="OutfitHistory" component={OutfitHistoryScreen} />
            <Stack.Screen name="TryOnHistory" component={TryOnHistoryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.ecru,
  },
});

export default RootNavigator;
