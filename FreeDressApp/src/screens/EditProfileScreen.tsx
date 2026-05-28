import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import {
  ScreenHeader,
  Button,
  Input,
  Avatar,
  IconButton,
  KickerText,
} from '../components';
import { COLORS, SPACING, RADIUS, HAIRLINE } from '../constants';
import { useAuthStore } from '../store/authStore';
import { updateUserProfile } from '../api/users';
import { uploadImage } from '../api/upload';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = (fromCamera: boolean) => {
    const action = fromCamera ? launchCamera : launchImageLibrary;
    action({ mediaType: 'photo', quality: 0.8, maxWidth: 400, maxHeight: 400 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('错误', res.errorMessage || '无法获取图片');
        return;
      }
      if (res.assets?.[0]?.uri) {
        setAvatarUri(res.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      return Alert.alert('提示', '昵称不能为空');
    }

    setSaving(true);
    try {
      let avatarUrl = user?.avatarUrl;

      if (avatarUri) {
        const uploadRes = await uploadImage(avatarUri);
        avatarUrl = uploadRes.data.url;
      }

      const res = await updateUserProfile({
        nickname: nickname.trim(),
        avatarUrl,
      });

      updateUser(res.data);
      Alert.alert('成功', '资料已更新', [
        { text: '好的', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('保存失败', e.message || '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="EDIT PROFILE"
        title="编辑资料"
        leftSlot={
          <IconButton
            name="arrow-left"
            variant="outline"
            buttonSize={36}
            onPress={() => navigation.goBack()}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* 头像 */}
        <View style={styles.avatarSection}>
          <KickerText>AVATAR</KickerText>
          <View style={styles.avatarRow}>
            <Avatar
              size={96}
              uri={avatarUri || user?.avatarUrl}
              fallback={nickname || 'U'}
              bg={COLORS.cream}
              borderColor={COLORS.mistGray}
            />
            <View style={styles.avatarActions}>
              <Pressable
                style={styles.avatarBtn}
                onPress={() => pickAvatar(true)}
              >
                <Feather name="camera" size={20} color={COLORS.inkMuted} />
                <KickerText>拍照</KickerText>
              </Pressable>
              <Pressable
                style={styles.avatarBtn}
                onPress={() => pickAvatar(false)}
              >
                <Feather name="image" size={20} color={COLORS.inkMuted} />
                <KickerText>相册</KickerText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 昵称 */}
        <View style={styles.field}>
          <KickerText>NICKNAME</KickerText>
          <Input
            value={nickname}
            onChangeText={setNickname}
            placeholder="输入新昵称"
            variant="underline"
            maxLength={20}
          />
        </View>

        {/* 手机号（只读） */}
        <View style={styles.field}>
          <KickerText>PHONE</KickerText>
          <Input
            value={user?.phone || ''}
            variant="underline"
            editable={false}
            style={{ opacity: 0.5 }}
          />
        </View>

        <Button
          onPress={handleSave}
          disabled={saving}
          isLoading={saving}
          style={styles.saveBtn}
        >
          {saving ? '保存中...' : '保存修改'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  body: { paddingHorizontal: SPACING[5], paddingTop: SPACING[2] },

  avatarSection: { marginBottom: SPACING[6] },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[5],
    marginTop: SPACING[3],
  },
  avatarActions: { gap: SPACING[3] },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[2],
  },

  field: { marginBottom: SPACING[5] },
  saveBtn: { marginTop: SPACING[4] },
});
