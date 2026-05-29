import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Button,
  Input,
} from '../components';
import { GrainOverlay } from '../theme/grain';
import { COLORS, SPACING } from '../constants';
import apiClient from '../api/axios';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('提示', '请填写所有字段');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('提示', '新密码长度不能少于6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      Alert.alert('成功', '密码修改成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('失败', e.message || '密码修改失败，请检查旧密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScreenHeader
        kicker="SECURITY"
        title="修改密码"
        leftSlot={
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Input
          label="当前密码"
          placeholder="请输入当前密码"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          variant="underline"
        />
        <Input
          label="新密码"
          placeholder="请输入新密码（至少6位）"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          variant="underline"
        />
        <Input
          label="确认新密码"
          placeholder="请再次输入新密码"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          variant="underline"
        />

        <View style={styles.buttonWrap}>
          <Button
            onPress={handleSubmit}
            isLoading={loading}
            disabled={loading}
          >
            {loading ? '提交中...' : '确认修改'}
          </Button>
        </View>
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
    paddingTop: SPACING[6],
    gap: SPACING[5],
  },
  buttonWrap: {
    marginTop: SPACING[8],
  },
});
