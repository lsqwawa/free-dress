import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import {
  ScreenHeader,
  BodyText,
  CaptionText,
  KickerText,
  SerifTitle,
  MonoText,
} from '../components';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';
import { getOutfits } from '../api/outfits';

interface OutfitItem {
  id: string;
  style?: string;
  occasion?: string;
  createdAt: string;
  outfitClothes: { cloth: { imageUrl: string; category: string }; order: number }[];
}

function OutfitHistoryScreen() {
  const navigation = useNavigation<any>();
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutfits = useCallback(async () => {
    try {
      const res = await getOutfits();
      setOutfits(res.data);
    } catch (e) {
      console.error('获取搭配历史失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOutfits();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const renderItem = ({ item, index }: { item: OutfitItem; index: number }) => {
    const images = item.outfitClothes
      ?.sort((a, b) => a.order - b.order)
      .map((oc) => oc.cloth?.imageUrl)
      .filter(Boolean) as string[];

    return (
      <View style={styles.card}>
        <MonoText style={styles.cardNo}>
          {String(index + 1).padStart(2, '0')}
        </MonoText>
        <View style={styles.cardImages}>
          {images.length > 0 ? (
            images.slice(0, 3).map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.cardImg} />
            ))
          ) : (
            <View style={[styles.cardImg, styles.cardImgEmpty]}>
              <Feather name="layers" size={16} color={COLORS.cream} />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <KickerText>{item.style || '搭配'}</KickerText>
          <BodyText style={styles.cardMeta}>
            {item.outfitClothes?.length || 0} 件
            {item.occasion ? ` · ${item.occasion}` : ''}
          </BodyText>
        </View>
        <CaptionText style={styles.cardDate}>{formatDate(item.createdAt)}</CaptionText>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="OUTFIT ARCHIVE"
        title="搭配历史"
        issue={`${String(outfits.length).padStart(2, '0')} RECORDS`}
        leftSlot={
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <FlatList
        data={outfits}
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
              <Feather name="clock" size={40} color={COLORS.mistGray} />
              <SerifTitle style={styles.emptyTitle}>暂无搭配记录</SerifTitle>
              <CaptionText style={styles.emptyHint}>
                去搭配实验室创建你的第一套搭配
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
  cardNo: {
    color: COLORS.inkMuted,
    marginRight: SPACING[3],
    minWidth: 24,
  },
  cardImages: {
    flexDirection: 'row',
    gap: 2,
  },
  cardImg: {
    width: 44,
    height: 44,
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
  cardMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.clay,
  },
  cardDate: {
    color: COLORS.inkMuted,
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

export default OutfitHistoryScreen;
