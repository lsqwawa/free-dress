import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import {
  ScreenHeader,
  Button,
  Tag,
  Input,
  IconButton,
  KickerText,
  CaptionText,
} from '../components';
import { COLORS, SPACING, RADIUS, HAIRLINE, CLOTH_CATEGORIES, SEASON_OPTIONS, STYLE_OPTIONS } from '../constants';
import { ClothCategory } from '../types';
import { uploadImage } from '../api/upload';
import { useWardrobeStore } from '../store/wardrobeStore';
import { getCloth } from '../api/clothes';

export default function EditClothingScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const clothId = route.params?.clothId;
  const { editCloth } = useWardrobeStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<ClothCategory | null>(null);
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClothData();
  }, []);

  const loadClothData = async () => {
    try {
      const res = await getCloth(clothId);
      const cloth = res.data;
      setImageUrl(cloth.imageUrl);
      setCategory(cloth.category as ClothCategory);
      setColor(cloth.color || '');
      setStyle(cloth.style || '');
      setSelectedSeasons(cloth.season || []);
      setTags((cloth.tags || []).join(', '));
    } catch (e: any) {
      Alert.alert('加载失败', e.message || '无法获取衣物信息');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleSeason = (s: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const pickImage = (fromCamera: boolean) => {
    const action = fromCamera ? launchCamera : launchImageLibrary;
    action({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('错误', res.errorMessage || '无法获取图片');
        return;
      }
      if (res.assets?.[0]?.uri) {
        setImageUri(res.assets[0].uri);
        setImageUrl(null);
      }
    });
  };

  const handleSubmit = async () => {
    if (!category) return Alert.alert('提示', '请选择衣物分类');

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;

      // 如果用户更换了图片，先上传新图片
      if (imageUri) {
        const uploadRes = await uploadImage(imageUri);
        finalImageUrl = uploadRes.data.url;
      }

      await editCloth(clothId, {
        imageUrl: finalImageUrl || undefined,
        category,
        color: color || undefined,
        style: style || undefined,
        season: selectedSeasons.length > 0 ? selectedSeasons : undefined,
        tags: tags ? tags.split(/[,，\s]+/).filter(Boolean) : undefined,
      });

      Alert.alert('成功', '衣物已更新', [
        { text: '好的', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('更新失败', e.message || '请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <ScreenHeader
          kicker="EDITING"
          title="编辑衣物"
          leftSlot={
            <IconButton name="arrow-left" variant="outline" buttonSize={36} onPress={() => navigation.goBack()} />
          }
        />
      </View>
    );
  }

  const displayImage = imageUri || imageUrl;

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="EDITING"
        title="编辑衣物"
        leftSlot={
          <IconButton name="arrow-left" variant="outline" buttonSize={36} onPress={() => navigation.goBack()} />
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 图片 */}
        <View style={styles.section}>
          <KickerText>PHOTO</KickerText>
          {displayImage ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: displayImage }} style={styles.preview} />
              <Pressable style={styles.retake} onPress={() => { setImageUri(null); setImageUrl(null); }}>
                <Feather name="refresh-cw" size={14} color={COLORS.ecru} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.pickRow}>
              <Pressable style={styles.pickBtn} onPress={() => pickImage(true)}>
                <Feather name="camera" size={28} color={COLORS.inkMuted} />
                <CaptionText>拍照</CaptionText>
              </Pressable>
              <Pressable style={styles.pickBtn} onPress={() => pickImage(false)}>
                <Feather name="image" size={28} color={COLORS.inkMuted} />
                <CaptionText>相册</CaptionText>
              </Pressable>
            </View>
          )}
        </View>

        {/* 分类 */}
        <View style={styles.section}>
          <KickerText>CATEGORY *</KickerText>
          <View style={styles.tagRow}>
            {CLOTH_CATEGORIES.map((c) => (
              <Tag
                key={c.value}
                active={category === c.value}
                onPress={() => setCategory(c.value as ClothCategory)}
              >
                {c.label}
              </Tag>
            ))}
          </View>
        </View>

        {/* 颜色 */}
        <View style={styles.section}>
          <KickerText>COLOR</KickerText>
          <Input
            value={color}
            onChangeText={setColor}
            placeholder="如：黑色、白色"
            variant="underline"
          />
        </View>

        {/* 风格 */}
        <View style={styles.section}>
          <KickerText>STYLE</KickerText>
          <View style={styles.tagRow}>
            {STYLE_OPTIONS.map((s) => (
              <Tag
                key={s}
                active={style === s}
                onPress={() => setStyle(style === s ? '' : s)}
                size="sm"
              >
                {s}
              </Tag>
            ))}
          </View>
        </View>

        {/* 季节 */}
        <View style={styles.section}>
          <KickerText>SEASON</KickerText>
          <View style={styles.tagRow}>
            {SEASON_OPTIONS.map((s) => (
              <Tag
                key={s}
                active={selectedSeasons.includes(s)}
                onPress={() => toggleSeason(s)}
              >
                {s}
              </Tag>
            ))}
          </View>
        </View>

        {/* 标签 */}
        <View style={styles.section}>
          <KickerText>TAGS</KickerText>
          <Input
            value={tags}
            onChangeText={setTags}
            placeholder="用逗号分隔，如：T恤, 纯棉"
            variant="underline"
          />
        </View>

        {/* 提交 */}
        <Button
          onPress={handleSubmit}
          disabled={submitting}
          isLoading={submitting}
          style={styles.submitBtn}
        >
          {submitting ? '保存中...' : '保存修改'}
        </Button>

        <View style={{ height: SPACING[10] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  body: { paddingHorizontal: SPACING[5], paddingTop: SPACING[2] },
  section: { marginBottom: SPACING[6] },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[2], marginTop: SPACING[2] },
  pickRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginTop: SPACING[2],
  },
  pickBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: RADIUS.sm,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    borderStyle: 'dashed',
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[1],
  },
  previewWrap: { marginTop: SPACING[2], position: 'relative' },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cream,
  },
  retake: {
    position: 'absolute',
    top: SPACING[2],
    right: SPACING[2],
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: { marginTop: SPACING[4] },
});
