import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Section,
  KickerText,
  BodyText,
  MonoText,
} from '../components';
import { GrainOverlay } from '../theme/grain';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';

interface SettingItem {
  no: string;
  title: string;
  subtitle?: string;
  iconName: string;
  action: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { clearAuth } = useAuthStore();

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除本地缓存吗？这不会影响你的账号数据。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            Alert.alert('提示', '缓存已清除');
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      '关于畅搭',
      '畅搭（FreeDress）v1.0.0\n\n面向年轻人的智能AI穿搭工具\n\n让每一天都穿出自信',
    );
  };

  const handlePrivacy = () => {
    Alert.alert('隐私政策', '我们重视你的隐私，所有数据仅用于提供穿搭服务，不会分享给第三方。');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '注销账号',
      '注销后你的所有数据将被永久删除，且无法恢复。确定要注销吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认注销',
          style: 'destructive',
          onPress: () => {
            Alert.alert('提示', '账号注销功能即将上线，如需注销请联系客服。');
          },
        },
      ],
    );
  };

  const SETTINGS: SettingItem[] = [
    { no: '01', title: '修改密码', subtitle: '定期更换密码更安全', iconName: 'lock', action: handleChangePassword },
    { no: '02', title: '清除缓存', subtitle: '释放存储空间', iconName: 'trash-2', action: handleClearCache },
    { no: '03', title: '隐私政策', iconName: 'shield', action: handlePrivacy },
    { no: '04', title: '关于畅搭', subtitle: 'v1.0.0', iconName: 'info', action: handleAbout },
    { no: '05', title: '注销账号', iconName: 'user-x', action: handleDeleteAccount, danger: true },
  ];

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScreenHeader
        kicker="PREFERENCES"
        title="设置"
        leftSlot={
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Section kicker="ACCOUNT" title="账号安全" />

        {SETTINGS.map((item) => (
          <Pressable
            key={item.no}
            style={styles.settingItem}
            onPress={item.action}
          >
            <View style={styles.itemLeft}>
              <MonoText style={styles.itemNo}>{item.no}</MonoText>
              <Feather
                name={item.iconName}
                size={18}
                color={item.danger ? COLORS.signal : COLORS.inkSoft}
              />
              <View style={styles.itemText}>
                <BodyText style={[styles.itemTitle, item.danger && styles.dangerText]}>
                  {item.title}
                </BodyText>
                {item.subtitle && (
                  <KickerText style={styles.itemSubtitle}>{item.subtitle}</KickerText>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={COLORS.mistGray} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ecru,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[10],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[4],
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  itemNo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.clay,
  },
  itemText: {
    gap: 2,
  },
  itemTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.ink,
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.clay,
  },
  dangerText: {
    color: COLORS.signal,
  },
});
