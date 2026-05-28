import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, RADIUS, HAIRLINE, FONT_SIZES, SEASON_OPTIONS, STYLE_OPTIONS } from '../constants';
import { Cloth, ClothCategory } from '../types';
import { KickerText, SerifTitle, CaptionText, MonoText } from './Text';
import { Tag } from './Tag';
import { Input } from './Input';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { useWardrobeStore } from '../store/wardrobeStore';

interface Props {
  cloth: Cloth | null;
  visible: boolean;
  onClose: () => void;
}

export function ClothDetailSheet({ cloth, visible, onClose }: Props) {
  const { editCloth, removeCloth } = useWardrobeStore();
  const [editing, setEditing] = useState(false);
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cloth) {
      setColor(cloth.color || '');
      setStyle(cloth.style || '');
      setSeasons(cloth.season || []);
      setEditing(false);
    }
  }, [cloth]);

  if (!cloth) return null;

  const toggleSeason = (s: string) => {
    setSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await editCloth(cloth.id, {
        color: color || undefined,
        style: style || undefined,
        season: seasons.length > 0 ? seasons : undefined,
      });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('保存失败', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('删除衣物', '确定要删除这件衣物吗？此操作不可撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCloth(cloth.id);
            onClose();
          } catch (e: any) {
            Alert.alert('删除失败', e.message);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          {/* 拖拽条 */}
          <View style={styles.handle} />

          {/* 顶部操作栏 */}
          <View style={styles.topBar}>
            <KickerText>{cloth.category}</KickerText>
            <View style={styles.topActions}>
              {!editing && (
                <IconButton
                  name="edit-2"
                  size={16}
                  buttonSize={32}
                  variant="ghost"
                  onPress={() => setEditing(true)}
                />
              )}
              <IconButton
                name="x"
                size={18}
                buttonSize={32}
                variant="ghost"
                onPress={onClose}
              />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 图片 */}
            <View style={styles.imageWrap}>
              {cloth.imageUrl ? (
                <Image source={{ uri: cloth.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={40} color={COLORS.clay} />
                </View>
              )}
              <View style={styles.stamp}>
                <MonoText style={{ color: COLORS.cream }}>
                  {cloth.id.slice(0, 8).toUpperCase()}
                </MonoText>
              </View>
            </View>

            {/* 详情/编辑 */}
            <View style={styles.body}>
              {editing ? (
                <>
                  <View style={styles.field}>
                    <KickerText>COLOR</KickerText>
                    <Input
                      value={color}
                      onChangeText={setColor}
                      placeholder="颜色"
                      variant="underline"
                    />
                  </View>
                  <View style={styles.field}>
                    <KickerText>STYLE</KickerText>
                    <View style={styles.tagRow}>
                      {STYLE_OPTIONS.map((s) => (
                        <Tag
                          key={s}
                          size="sm"
                          active={style === s}
                          onPress={() => setStyle(style === s ? '' : s)}
                        >
                          {s}
                        </Tag>
                      ))}
                    </View>
                  </View>
                  <View style={styles.field}>
                    <KickerText>SEASON</KickerText>
                    <View style={styles.tagRow}>
                      {SEASON_OPTIONS.map((s) => (
                        <Tag
                          key={s}
                          active={seasons.includes(s)}
                          onPress={() => toggleSeason(s)}
                        >
                          {s}
                        </Tag>
                      ))}
                    </View>
                  </View>
                  <View style={styles.editActions}>
                    <Button
                      variant="outline"
                      onPress={() => setEditing(false)}
                      style={{ flex: 1 }}
                    >
                      取消
                    </Button>
                    <Button
                      isLoading={saving}
                      disabled={saving}
                      onPress={handleSave}
                      style={{ flex: 1 }}
                    >
                      保存
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <SerifTitle style={styles.title}>
                    {cloth.color || '未命名衣物'}
                  </SerifTitle>
                  {cloth.style && (
                    <View style={styles.infoRow}>
                      <KickerText>STYLE</KickerText>
                      <CaptionText>{cloth.style}</CaptionText>
                    </View>
                  )}
                  {cloth.season?.length > 0 && (
                    <View style={styles.infoRow}>
                      <KickerText>SEASON</KickerText>
                      <CaptionText>{cloth.season.join(' · ')}</CaptionText>
                    </View>
                  )}
                  {cloth.tags?.length > 0 && (
                    <View style={styles.tagRow}>
                      {cloth.tags.map((t) => (
                        <Tag key={t} size="sm">
                          {t}
                        </Tag>
                      ))}
                    </View>
                  )}
                  <View style={styles.divider} />
                  <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={16} color={COLORS.signal} />
                    <CaptionText style={{ color: COLORS.signal }}>
                      删除此衣物
                    </CaptionText>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,27,22,0.5)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.ecru,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '85%',
    paddingBottom: SPACING[8],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.mistGray,
    alignSelf: 'center',
    marginTop: SPACING[3],
    marginBottom: SPACING[2],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  topActions: {
    flexDirection: 'row',
    gap: SPACING[1],
  },
  imageWrap: {
    marginHorizontal: SPACING[5],
    marginTop: SPACING[4],
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cream,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: SPACING[2],
    left: SPACING[2],
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  body: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
  },
  title: {
    marginBottom: SPACING[3],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  field: {
    marginBottom: SPACING[4],
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  divider: {
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
    marginVertical: SPACING[4],
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[2],
  },
});
