import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Tag,
  EmptyState,
  IconButton,
  KickerText,
  CaptionText,
  MonoText,
  SectionTitle,
  Skeleton,
  ClothDetailSheet,
} from '../components';
import { Cloth, ClothCategory } from '../types';
import { COLORS, SPACING, HAIRLINE, RADIUS, FONT_SIZES } from '../constants';
import { useWardrobeStore } from '../store/wardrobeStore';

const CATEGORIES = [
  { value: 'ALL', label: '全部', kicker: 'ALL' },
  { value: 'TOP', label: '上衣', kicker: 'TOP' },
  { value: 'BOTTOM', label: '下装', kicker: 'BOTTOM' },
  { value: 'COAT', label: '外套', kicker: 'COAT' },
  { value: 'ACCESSORY', label: '配饰', kicker: 'ACC' },
  { value: 'SHOE', label: '鞋子', kicker: 'SHOES' },
];

function WardrobeScreen() {
  const navigation = useNavigation<any>();
  const {
    clothes,
    isLoading,
    activeCategory,
    setActiveCategory,
    fetchClothes,
    fetchStats,
    removeCloth,
  } = useWardrobeStore();

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClothes();
    fetchStats();
  }, [fetchClothes, fetchStats]);

  const filtered = useMemo(() => {
    let list = clothes;
    if (activeCategory !== 'ALL') {
      list = list.filter((c) => c.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.color && c.color.toLowerCase().includes(q)) ||
          (c.style && c.style.toLowerCase().includes(q)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }
    return list;
  }, [activeCategory, clothes, searchQuery]);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    if (cat === 'ALL') {
      fetchClothes();
    } else {
      fetchClothes(cat as ClothCategory);
    }
  }, [fetchClothes, setActiveCategory]);

  const handleRefresh = useCallback(() => {
    fetchClothes(activeCategory === 'ALL' ? undefined : (activeCategory as ClothCategory));
    fetchStats();
  }, [activeCategory, fetchClothes, fetchStats]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('删除衣物', '确定要删除这件衣物吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCloth(id);
          } catch (e: any) {
            Alert.alert('删除失败', e.message);
          }
        },
      },
    ]);
  }, [removeCloth]);

  const total = clothes.length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="MY WARDROBE"
        title="衣橱"
        issue={`${String(total).padStart(2, '0')} PIECES`}
        rightSlot={
          <IconButton
            name={searchOpen ? 'x' : 'search'}
            buttonSize={36}
            variant="outline"
            shape="square"
            onPress={() => {
              setSearchOpen(!searchOpen);
              if (searchOpen) setSearchQuery('');
            }}
          />
        }
      />

      {/* 分类 */}
      <View style={styles.categoryWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              onPress={() => handleCategoryChange(cat.value)}
              style={styles.categoryItem}
            >
              <Tag
                size="sm"
                active={activeCategory === cat.value}
                onPress={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </Tag>
              <KickerText
                style={[
                  styles.categoryKicker,
                  {
                    color:
                      activeCategory === cat.value
                        ? COLORS.caramel
                        : COLORS.inkMuted,
                  },
                ]}
              >
                {cat.kicker}
              </KickerText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 搜索栏 */}
      {searchOpen && (
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={COLORS.inkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索颜色、风格、标签…"
            placeholderTextColor={COLORS.clay}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color={COLORS.inkMuted} />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={COLORS.caramel}
          />
        }
      >
        {isLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.card}>
                <Skeleton width="100%" height={180} />
                <View style={{ padding: SPACING[3] }}>
                  <Skeleton width={60} height={12} />
                  <Skeleton width={80} height={16} style={{ marginTop: 6 }} />
                </View>
              </View>
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            iconName="inbox"
            kicker="NO ENTRIES IN THIS ISSUE"
            title="衣橱待编纂"
            subtitle="点击右下角按钮，让你的第一件衣物登上目录页。"
            actionLabel="开始上传"
            onAction={() => navigation.navigate('AddClothing')}
          />
        ) : (
          <View style={styles.grid}>
            {filtered.map((item, idx) => (
              <ClothCard
                key={item.id}
                item={item}
                index={idx}
                onPress={() => setSelectedCloth(item)}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabWrap}>
        <View style={styles.fabKicker}>
          <MonoText style={styles.fabKickerText}>ADD PIECE</MonoText>
        </View>
        <IconButton
          name="plus"
          buttonSize={56}
          size={22}
          variant="caramel"
          shape="circle"
          onPress={() => navigation.navigate('AddClothing')}
        />
      </View>

      <ClothDetailSheet
        cloth={selectedCloth}
        visible={selectedCloth !== null}
        onClose={() => setSelectedCloth(null)}
      />
    </View>
  );
}

function ClothCard({
  item,
  index,
  onPress,
  onDelete,
}: {
  item: Cloth;
  index: number;
  onPress: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      onLongPress={() => onDelete(item.id)}
    >
      <View style={styles.cardImage}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <Feather name="image" size={28} color={COLORS.clay} />
        )}
        <View style={styles.cardStamp}>
          <MonoText style={{ color: COLORS.cream }}>
            {`№${String(index + 1).padStart(2, '0')}`}
          </MonoText>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <KickerText>{item.category}</KickerText>
        <SectionTitle style={styles.cardTitle}>
          {item.color || '未命名'}
        </SectionTitle>
        <CaptionText style={styles.cardCaption}>
          {item.season?.join(' · ')}
        </CaptionText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.ecru,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[20],
  },

  categoryWrap: {
    paddingTop: SPACING[3],
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  categoryContent: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    gap: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    gap: SPACING[1],
  },
  categoryKicker: {
    fontSize: FONT_SIZES.xs - 2,
    letterSpacing: 1.4,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING[6],
    marginTop: SPACING[3],
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    gap: SPACING[2],
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.ink,
    padding: 0,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginTop: SPACING[5],
  },
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardStamp: {
    position: 'absolute',
    top: SPACING[2],
    left: SPACING[2],
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  cardInfo: {
    padding: SPACING[3],
    gap: SPACING[1],
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    marginTop: 2,
  },
  cardCaption: {
    fontSize: FONT_SIZES.xs,
  },

  fabWrap: {
    position: 'absolute',
    right: SPACING[6],
    bottom: SPACING[6] + 84,
    alignItems: 'center',
    gap: SPACING[1],
  },
  fabKicker: {
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    paddingHorizontal: SPACING[2],
    paddingVertical: 3,
  },
  fabKickerText: {
    fontSize: FONT_SIZES.xs - 2,
    letterSpacing: 1.4,
  },
});

export default WardrobeScreen;
