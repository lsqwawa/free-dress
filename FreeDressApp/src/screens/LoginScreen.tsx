/**
 * 登录页
 * Editorial Couture：巨型衬线 Hero 标题 + 期号 + underline 表单 + ink 主按钮
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Button,
  Input,
  KickerText,
  HeroText,
  MonoText,
  CaptionText,
  BodyText,
} from '../components';
import { GrainBackground } from '../theme/grain';
import { editorialTransition, slowTransition } from '../theme/motion';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';
import { getLoginVolText, getIssueNo } from '../utils/date';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const volText = getLoginVolText();
  const issueNo = getIssueNo();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(16);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, slowTransition);
    titleY.value = withTiming(0, slowTransition);
    formOpacity.value = withDelay(220, withTiming(1, editorialTransition));
    formY.value = withDelay(220, withTiming(0, editorialTransition));
  }, [titleOpacity, titleY, formOpacity, formY]);

  const titleAnim = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const formAnim = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const handleLogin = async () => {
    if (!phone.trim()) return Alert.alert('提示', '请输入手机号');
    if (!/^1[3-9]\d{9}$/.test(phone)) return Alert.alert('提示', '手机号格式不正确');
    if (!password.trim()) return Alert.alert('提示', '请输入密码');

    setLoading(true);
    try {
      const response = await login(phone, password);
      if (response.code === 200) {
        await setAuth(response.data);
      } else {
        Alert.alert('错误', response.message || '登录失败');
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => navigation.navigate('Register');

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
            { paddingTop: insets.top + SPACING[8] },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* 顶部期号条 */}
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <View style={styles.dotLine} />
              <KickerText>FREEDRESS · ATELIER</KickerText>
            </View>
            <MonoText>{volText}</MonoText>
          </View>

          {/* Hero 区 */}
          <Animated.View style={[styles.heroBlock, titleAnim]}>
            <HeroText style={styles.heroChinese}>畅</HeroText>
            <View style={styles.heroSecondLine}>
              <HeroText style={styles.heroChinese}>搭</HeroText>
              <View style={styles.heroAside}>
                <CaptionText style={styles.heroEnglish}>FREEDRESS</CaptionText>
                <MonoText style={styles.heroIssue}>{issueNo}</MonoText>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <BodyText style={styles.tagline}>
              一刊一搭 · 把每天穿成展览
            </BodyText>
          </Animated.View>

          {/* 表单 */}
          <Animated.View style={[styles.formContainer, formAnim]}>
            <Input
              label="手机号"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
              keyboardType="phone-pad"
              variant="underline"
              autoCapitalize="none"
            />
            <View style={styles.spacer} />
            <Input
              label="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              maxLength={20}
              variant="underline"
            />

            <View style={styles.actions}>
              <Button
                variant="solid"
                colorScheme="ink"
                size="lg"
                onPress={handleLogin}
                isLoading={loading}
                block
                rightSlot={
                  <Feather name="arrow-right" size={16} color={COLORS.cream} />
                }
              >
                进入衣橱
              </Button>

              {/* 忘记密码 */}
              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotLink}
              >
                <CaptionText style={styles.forgotText}>忘记密码？</CaptionText>
              </Pressable>

              {/* 注册入口（更明显） */}
              <View style={styles.registerBlock}>
                <View style={styles.registerDivider}>
                  <View style={styles.registerLine} />
                  <KickerText style={styles.registerDividerText}>OR</KickerText>
                  <View style={styles.registerLine} />
                </View>
                <Button
                  variant="outline"
                  colorScheme="ink"
                  size="lg"
                  onPress={goToRegister}
                  block
                  rightSlot={
                    <Feather name="user-plus" size={14} color={COLORS.ink} />
                  }
                >
                  创建新账号
                </Button>
              </View>
            </View>
          </Animated.View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            <MonoText style={styles.footerText}>EDITORIAL ISSUE · COUTURE WARDROBE</MonoText>
          </View>
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
    paddingBottom: SPACING[10],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[10],
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  dotLine: {
    width: 18,
    height: HAIRLINE * 2,
    backgroundColor: COLORS.ink,
  },
  heroBlock: {
    marginBottom: SPACING[10],
  },
  heroChinese: {
    fontSize: 88,
    lineHeight: 92,
    letterSpacing: -3,
  },
  heroSecondLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroAside: {
    alignItems: 'flex-end',
    paddingBottom: SPACING[3],
    gap: SPACING[1],
  },
  heroEnglish: {
    fontSize: FONT_SIZES.xs,
    letterSpacing: 4,
    color: COLORS.inkSoft,
  },
  heroIssue: {
    color: COLORS.caramel,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1.4,
  },
  heroDivider: {
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
    marginVertical: SPACING[5],
  },
  tagline: {
    color: COLORS.inkSoft,
    fontStyle: 'italic',
  },
  formContainer: {
    width: '100%',
  },
  spacer: {
    height: SPACING[6],
  },
  actions: {
    marginTop: SPACING[10],
    gap: SPACING[4],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING[1],
  },
  forgotText: {
    color: COLORS.caramel,
    fontStyle: 'italic',
  },
  registerBlock: {
    marginTop: SPACING[2],
    gap: SPACING[4],
  },
  registerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  registerDividerText: {
    color: COLORS.clay,
  },
  registerLine: {
    flex: 1,
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
  },
  footer: {
    marginTop: SPACING[16],
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.inkMuted,
    fontSize: FONT_SIZES.xs - 1,
  },
});

export default LoginScreen;
