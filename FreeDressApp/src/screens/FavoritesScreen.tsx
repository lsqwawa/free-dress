import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import {
  ScreenHeader,
  Section,
  BodyText,
  CaptionText,
  KickerText,
  SerifTitle,
  MonoText,
} from '../components';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';
import { getFavorites, toggleFavorite } from '../api/outfits';

interface OutfitWithClothes {
  id: string;
  style?: string;
  occasion?: string;
  outfitClothes: { cloth: { imageUrl: string; category: string }; order: number }[];
  _count?: { favorites: number };
}

function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<OutfitWithClothes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await getFavorites();
      setFavorites(res.data);
    } catch (e) {
      console.error('获取收藏失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (outfitId: string) => {
    try {
      await toggleFavorite(outfitId);
      setFavorites((prev) => prev.filter((o) => o.id !== outfitId));
    } catch (e) {
      Alert.alert('操作失败', '请稍后重试' + e);
    }
  };

  const renderItem = ({ item }: { item: OutfitWithClothes }) => {
    const images = item.outfitClothes
      ?.sort((a, b) => a.order - b.order)
      .map((oc) => oc.cloth?.imageUrl)
      .filter(Boolean) as string[];

    return (
      <View style={styles.card}>
        <View style={styles.cardImages}>
          {images.length > 0 ? (
            images.slice(0, 4).map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.cardImg} />
            ))
          ) : (
            <View style={[styles.cardImg, styles.cardImgEmpty]}>
              <Feather name="layers" size={20} color={COLORS.cream} />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <KickerText>{item.style || '搭配'}</KickerText>
            <MonoText style={styles.cardCount}>
              {item.outfitClothes?.length || 0} 件
            </MonoText>
          </View>
          {item.occasion && (
            <CaptionText style={styles.cardOccasion}>{item.occasion}</CaptionText>
          )}
        </View>
        <Pressable
          style={styles.removeBtn}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Feather name="bookmark" size={16} color={COLORS.caramel} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="SAVED COLLECTION"
        title="收藏柜"
        issue={`${String(favorites.length).padStart(2, '0')} SAVED`}
        leftSlot={
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.caramel}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Feather name="bookmark" size={40} color={COLORS.mistGray} />
              <SerifTitle style={styles.emptyTitle}>暂无收藏</SerifTitle>
              <CaptionText style={styles.emptyHint}>
                在搭配页面点击收藏，心仪的搭配会出现在这里
              </CaptionText>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[20],
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    marginTop: SPACING[4],
    padding: SPACING[3],
    alignItems: 'center',
  },
  cardImages: {
    flexDirection: 'row',
    gap: 2,
  },
  cardImg: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.ink,
  },
  cardImgEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING[3],
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCount: {
    color: COLORS.inkMuted,
  },
  cardOccasion: {
    fontStyle: 'italic',
    color: COLORS.clay,
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingTop: SPACING[16],
    gap: SPACING[3],
  },
  emptyTitle: {
    color: COLORS.inkMuted,
  },
  emptyHint: {
    color: COLORS.clay,
    textAlign: 'center',
    paddingHorizontal: SPACING[8],
  },
});

export default FavoritesScreen;
