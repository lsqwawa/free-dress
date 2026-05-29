/**
 * 绑定手机号
 * - 面向纯微信注册账号（无 phone / 无 password）
 * - 输入：手机号 + 登录密码 + 确认密码 + 图形验证码
 * - 成功后刷新本地 user，goBack 回到「账号与安全」
 * - 已绑定手机号的用户进入此页直接 Alert + goBack，避免重复绑定
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Input,
  Button,
  KickerText,
  CaptionText,
} from '../components';
import { GrainOverlay } from '../theme/grain';
import { COLORS, SPACING, FONT_SIZES, HAIRLINE } from '../constants';
import { useAuthStore } from '../store/authStore';
import { bindPhone, getCaptcha, getProfile } from '../api/auth';
import { RootStackParamList } from '../types';

type BindPhoneNavProp = NativeStackNavigationProp<RootStackParamList, 'BindPhone'>;

function BindPhoneScreen() {
  const navigation = useNavigation<BindPhoneNavProp>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // 重复绑定守护
  useEffect(() => {
    if (user?.hasPhone) {
      Alert.alert('提示', '当前账号已绑定手机号，无需重复绑定', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    }
  }, [user?.hasPhone, navigation]);

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

  const handleSubmit = async () => {
    if (!phone.trim()) return Alert.alert('提示', '请输入手机号');
    if (!/^1[3-9]\d{9}$/.test(phone)) return Alert.alert('提示', '手机号格式不正确');
    if (!password.trim()) return Alert.alert('提示', '请输入登录密码');
    if (password.length < 6) return Alert.alert('提示', '密码长度不能少于6位');
    if (password !== confirmPassword) return Alert.alert('提示', '两次输入的密码不一致');
    if (!captchaAnswer.trim()) return Alert.alert('提示', '请输入验证码');

    setLoading(true);
    try {
      const res = await bindPhone(phone, password, captchaId, captchaAnswer);
      if (res.code === 200) {
        // 后端返回新的 user / tokens；这里仅同步 user 字段
        if (res.data?.user) {
          updateUser(res.data.user as any);
        } else {
          // 兜底：拉一次 profile
          try {
            const p = await getProfile();
            if (p?.data) updateUser(p.data as any);
          } catch {
            // 忽略
          }
        }
        Alert.alert('成功', '手机号绑定成功', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('失败', res.message || '绑定失败');
        loadCaptcha();
      }
    } catch (err: any) {
      Alert.alert('失败', err?.message || '绑定失败，请重试');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScreenHeader
        kicker="BIND · PHONE"
        title="绑定手机号"
        leftSlot={
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldGap}>
            <Input
              label="手机号"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
              keyboardType="phone-pad"
              variant="underline"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.fieldGap}>
            <Input
              label="登录密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              maxLength={20}
              variant="underline"
              placeholder="6 - 20 位"
            />
          </View>
          <View style={styles.fieldGap}>
            <Input
              label="确认密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              maxLength={20}
              variant="underline"
            />
          </View>

          <View style={styles.fieldGap}>
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
          </View>

          <View style={styles.actions}>
            <Button
              variant="solid"
              colorScheme="ink"
              size="lg"
              onPress={handleSubmit}
              isLoading={loading}
              block
            >
              绑定手机号
            </Button>
          </View>

          <Text style={styles.tips}>
            绑定后即可使用手机号 + 密码登录，与微信账号互相关联，便于跨设备访问与找回。
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ecru },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[12],
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
  },
  tips: {
    marginTop: SPACING[5],
    color: COLORS.inkMuted,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
});

export default BindPhoneScreen;
