/**
 * 账号与安全
 * - 显示手机号 / 微信绑定状态
 * - 提供 绑定手机号 / 绑定 / 解绑微信 / 修改密码 入口
 * - 微信入口受 isWechatAvailable 控制（一期未集成 SDK，按钮默认隐藏）
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import { ScreenHeader } from '../components';
import { GrainOverlay } from '../theme/grain';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useAuthStore } from '../store/authStore';
import {
  getProfile,
  bindWechatApp,
  unbindWechat,
} from '../api/auth';
import { isWechatAvailable, sendAuthRequest } from '../services/wechat';

export default function AccountSecurityScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [wechatAvail] = useState(isWechatAvailable());

  const refresh = useCallback(async () => {
    try {
      const res = await getProfile();
      if (res?.data) updateUser(res.data as any);
    } catch (e) {
      // 静默
    }
  }, [updateUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleBindWechat = async () => {
    if (!wechatAvail) {
      Alert.alert('提示', '微信登录入口尚未开启，敬请期待');
      return;
    }
    setLoading(true);
    try {
      const { code } = await sendAuthRequest();
      const res = await bindWechatApp(code);
      if (res.code === 200) {
        Alert.alert('成功', '微信绑定成功');
        updateUser(res.data.user as any);
      } else {
        Alert.alert('失败', res.message || '绑定失败');
      }
    } catch (err: any) {
      Alert.alert('失败', err?.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUnbindWechat = () => {
    if (!user?.hasPhone) {
      Alert.alert('提示', '请先绑定手机号后再解绑微信');
      return;
    }
    Alert.alert('解绑微信', '解绑后将无法使用微信登录，确定继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认解绑',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await unbindWechat('APP');
            if (res.code === 200) {
              Alert.alert('成功', '微信已解绑');
              updateUser(res.data.user as any);
            } else {
              Alert.alert('失败', res.message || '解绑失败');
            }
          } catch (err: any) {
            Alert.alert('失败', err?.message || '解绑失败');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScreenHeader
        kicker="ACCOUNT · SECURITY"
        title="账号与安全"
        leftSlot={
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Section>
          <Row
            label="手机号"
            value={user?.hasPhone ? (user.phone || '已绑定') : '未绑定'}
            actionText={user?.hasPhone ? '' : '去绑定'}
            onPress={user?.hasPhone ? undefined : () => navigation.navigate('BindPhone')}
          />
          <Row
            label="登录密码"
            value=""
            actionText={user?.hasPhone ? '修改' : '需先绑定手机号'}
            onPress={
              user?.hasPhone ? () => navigation.navigate('ChangePassword') : undefined
            }
          />
          {wechatAvail && (
            <Row
              label="微信账号"
              value={user?.hasWechatApp ? '已绑定' : '未绑定'}
              actionText={user?.hasWechatApp ? '解绑' : '去绑定'}
              actionStyle={user?.hasWechatApp ? 'danger' : 'default'}
              onPress={user?.hasWechatApp ? handleUnbindWechat : handleBindWechat}
            />
          )}
        </Section>
        <Text style={styles.tips}>
          提示：解绑微信前需先绑定手机号，避免账号无法登录。
        </Text>
        {loading && (
          <View style={styles.loadingMask}>
            <ActivityIndicator color={COLORS.ink} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

interface RowProps {
  label: string;
  value: string;
  actionText?: string;
  actionStyle?: 'default' | 'danger';
  onPress?: () => void;
}
function Row({ label, value, actionText, actionStyle, onPress }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {!!value && <Text style={styles.rowValue}>{value}</Text>}
        {!!actionText && (
          <Text
            style={[
              styles.rowAction,
              actionStyle === 'danger' && styles.rowActionDanger,
            ]}
          >
            {actionText}
          </Text>
        )}
        {!!onPress && (
          <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ecru },
  content: { padding: SPACING[4], paddingBottom: SPACING[8] },
  section: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: SPACING[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  rowPressed: { opacity: 0.6 },
  rowLabel: { color: COLORS.ink, fontSize: FONT_SIZES.md },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { color: COLORS.inkMuted, fontSize: FONT_SIZES.sm, marginRight: 8 },
  rowAction: { color: COLORS.ink, fontSize: FONT_SIZES.sm, marginRight: 4 },
  rowActionDanger: { color: '#c0392b' },
  tips: {
    color: COLORS.inkMuted,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginTop: SPACING[4],
  },
  loadingMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
