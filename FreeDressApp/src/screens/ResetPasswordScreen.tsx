/**
 * 重置密码页
 * 使用重置令牌设置新密码
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Button,
  Input,
  KickerText,
  SerifTitle,
  CaptionText,
} from '../components';
import { GrainBackground } from '../theme/grain';
import { editorialTransition, slowTransition } from '../theme/motion';
import { RootStackParamList } from '../types';
import { resetPassword } from '../api/auth';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';

type ResetPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const insets = useSafeAreaInsets();
  const { resetToken } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(16);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, slowTransition);
    titleY.value = withTiming(0, slowTransition);
    formOpacity.value = withDelay(200, withTiming(1, editorialTransition));
    formY.value = withDelay(200, withTiming(0, editorialTransition));
  }, [titleOpacity, titleY, formOpacity, formY]);

  const titleAnim = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const formAnim = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const handleReset = async () => {
    if (!newPassword.trim()) return Alert.alert('提示', '请输入新密码');
    if (newPassword.length < 6) return Alert.alert('提示', '密码长度不能少于6位');
    if (newPassword !== confirmPassword) return Alert.alert('提示', '两次输入的密码不一致');

    setLoading(true);
    try {
      const response = await resetPassword(resetToken, newPassword);
      if (response.code === 200) {
        Alert.alert('成功', '密码重置成功，请重新登录', [
          { text: '去登录', onPress: () => navigation.popToTop() },
        ]);
      } else {
        Alert.alert('错误', response.message || '重置失败');
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GrainBackground density={60} opacity={0.05} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            { paddingTop: insets.top + SPACING[6] },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* 顶部 */}
          <View style={styles.topRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={COLORS.ink} />
              <KickerText style={styles.backLabel}>BACK</KickerText>
            </Pressable>
          </View>

          {/* Hero */}
          <Animated.View style={[styles.heroBlock, titleAnim]}>
            <KickerText style={styles.kicker}>NEW PASSWORD</KickerText>
            <SerifTitle style={styles.title}>设置新密码</SerifTitle>
            <View style={styles.divider} />
            <CaptionText style={styles.tagline}>
              请输入 6-20 位新密码
            </CaptionText>
          </Animated.View>

          {/* 表单 */}
          <Animated.View style={[styles.formContainer, formAnim]}>
            <View style={styles.fieldGap}>
              <Input
                label="新密码"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                maxLength={20}
                variant="underline"
                placeholder="6 - 20 位"
              />
            </View>
            <View style={styles.fieldGap}>
              <Input
                label="确认新密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                maxLength={20}
                variant="underline"
              />
            </View>

            <View style={styles.actions}>
              <Button
                variant="solid"
                colorScheme="ink"
                size="lg"
                onPress={handleReset}
                isLoading={loading}
                block
                rightSlot={
                  <Feather name="check" size={16} color={COLORS.cream} />
                }
              >
                确认重置
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ecru,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[12],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  backLabel: {
    color: COLORS.ink,
  },
  heroBlock: {
    marginBottom: SPACING[8],
  },
  kicker: {
    marginBottom: SPACING[3],
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    lineHeight: FONT_SIZES.xxl * 1.05,
  },
  divider: {
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
    marginVertical: SPACING[5],
  },
  tagline: {
    fontStyle: 'italic',
  },
  formContainer: {
    width: '100%',
  },
  fieldGap: {
    marginBottom: SPACING[6],
  },
  actions: {
    marginTop: SPACING[8],
    gap: SPACING[3],
  },
});

export default ResetPasswordScreen;
