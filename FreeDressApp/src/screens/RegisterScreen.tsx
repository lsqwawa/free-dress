/**
 * 注册页
 * 与 LoginScreen 同语言，图片验证码注册
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
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
import { SvgXml } from 'react-native-svg';

import {
  Button,
  Input,
  KickerText,
  SerifTitle,
  MonoText,
  CaptionText,
} from '../components';
import { GrainBackground } from '../theme/grain';
import { editorialTransition, slowTransition } from '../theme/motion';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { register, getCaptcha } from '../api/auth';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';
import { getLoginVolText } from '../utils/date';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const volText = getLoginVolText();

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

  // 加载验证码
  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer('');
    try {
      const res = await getCaptcha();
      setCaptchaId(res.data.captchaId);
      setCaptchaSvg(res.data.image);
    } catch {
      Alert.alert('错误', '获取验证码失败，请重试');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleRegister = async () => {
    if (!phone.trim()) return Alert.alert('提示', '请输入手机号');
    if (!/^1[3-9]\d{9}$/.test(phone)) return Alert.alert('提示', '手机号格式不正确');
    if (!password.trim()) return Alert.alert('提示', '请输入密码');
    if (password.length < 6) return Alert.alert('提示', '密码长度不能少于6位');
    if (password !== confirmPassword) return Alert.alert('提示', '两次输入的密码不一致');
    if (!captchaAnswer.trim()) return Alert.alert('提示', '请输入验证码');

    setLoading(true);
    try {
      const response = await register(phone, password, captchaId, captchaAnswer, nickname);
      if (response.code === 200) {
        await setAuth(response.data);
      } else {
        Alert.alert('错误', response.message || '注册失败');
        loadCaptcha();
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '注册失败，请重试');
      loadCaptcha();
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
          {/* 顶部返回 + 期号 */}
          <View style={styles.topRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={18} color={COLORS.ink} />
              <KickerText style={styles.backLabel}>BACK</KickerText>
            </Pressable>
            <MonoText>{volText}</MonoText>
          </View>

          {/* Hero */}
          <Animated.View style={[styles.heroBlock, titleAnim]}>
            <KickerText style={styles.kicker}>NEW SUBSCRIBER</KickerText>
            <SerifTitle style={styles.title}>新刊订阅</SerifTitle>
            <SerifTitle style={[styles.title, styles.titleLight]}>开启你的衣橱专栏</SerifTitle>
            <View style={styles.divider} />
            <CaptionText style={styles.tagline}>
              填写信息 · 加入这本杂志
            </CaptionText>
          </Animated.View>

          {/* 表单 */}
          <Animated.View style={[styles.formContainer, formAnim]}>
            <FormField>
              <Input
                label="手机号"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
                keyboardType="phone-pad"
                variant="underline"
                autoCapitalize="none"
              />
            </FormField>
            <FormField>
              <Input
                label="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={20}
                variant="underline"
                placeholder="6 - 20 位"
              />
            </FormField>
            <FormField>
              <Input
                label="确认密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                maxLength={20}
                variant="underline"
              />
            </FormField>
            <FormField>
              <Input
                label="昵称（选填）"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                variant="underline"
              />
            </FormField>

            {/* 图片验证码 */}
            <FormField>
              <KickerText style={styles.captchaLabel}>VERIFICATION</KickerText>
              <View style={styles.captchaRow}>
                <View style={styles.captchaInputWrap}>
                  <Input
                    label="验证码"
                    value={captchaAnswer}
                    onChangeText={setCaptchaAnswer}
                    maxLength={4}
                    autoCapitalize="characters"
                    variant="underline"
                  />
                </View>
                <Pressable onPress={loadCaptcha} style={styles.captchaImageWrap}>
                  {captchaLoading ? (
                    <View style={styles.captchaPlaceholder}>
                      <ActivityIndicator size="small" color={COLORS.caramel} />
                    </View>
                  ) : captchaSvg ? (
                    <SvgXml xml={captchaSvg} width={130} height={44} />
                  ) : (
                    <View style={styles.captchaPlaceholder}>
                      <CaptionText>点击加载</CaptionText>
                    </View>
                  )}
                  <CaptionText style={styles.captchaTip}>点击刷新</CaptionText>
                </Pressable>
              </View>
            </FormField>

            <View style={styles.actions}>
              <Button
                variant="solid"
                colorScheme="ink"
                size="lg"
                onPress={handleRegister}
                isLoading={loading}
                block
                rightSlot={
                  <Feather name="arrow-right" size={16} color={COLORS.cream} />
                }
              >
                订阅创刊号
              </Button>
              <Button
                variant="ghost"
                colorScheme="ink"
                size="md"
                onPress={() => navigation.goBack()}
                uppercase
              >
                已有账号 · 登录
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FormField({ children }: { children: React.ReactNode }) {
  return <View style={styles.fieldGap}>{children}</View>;
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
  titleLight: {
    color: COLORS.inkSoft,
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
    marginBottom: SPACING[5],
  },
  captchaLabel: {
    marginBottom: SPACING[2],
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING[4],
  },
  captchaInputWrap: {
    flex: 1,
  },
  captchaImageWrap: {
    alignItems: 'center',
  },
  captchaPlaceholder: {
    width: 130,
    height: 44,
    backgroundColor: COLORS.cream,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  captchaTip: {
    marginTop: 2,
    fontSize: FONT_SIZES.xs,
    color: COLORS.clay,
  },
  actions: {
    marginTop: SPACING[6],
    gap: SPACING[3],
  },
});

export default RegisterScreen;
