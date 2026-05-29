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
import { getTryonResults } from '../api/tryon';

interface TryOnItem {
  id: string;
  personImageUrl: string;
  resultImageUrl: string;
  createdAt: string;
  outfit?: {
    style?: string;
    outfitClothes: { cloth: { imageUrl: string }; order: number }[];
  };
}

function TryOnHistoryScreen() {
  const navigation = useNavigation<any>();
  const [results, setResults] = useState<TryOnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await getTryonResults();
      setResults(res.data);
    } catch (e) {
      console.error('获取试穿记录失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [fetchResults]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const renderItem = ({ item, index }: { item: TryOnItem; index: number }) => (
    <View style={styles.card}>
      <MonoText style={styles.cardNo}>
        {String(index + 1).padStart(2, '0')}
      </MonoText>
      <Image source={{ uri: item.resultImageUrl }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <KickerText>{item.outfit?.style || '试穿'}</KickerText>
        <BodyText style={styles.cardMeta}>
          {item.outfit?.outfitClothes?.length || 0} 件
        </BodyText>
      </View>
      <CaptionText style={styles.cardDate}>{formatDate(item.createdAt)}</CaptionText>
    </View>
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="TRY-ON ARCHIVE"
        title="试穿记录"
        issue={`${String(results.length).padStart(2, '0')} RECORDS`}
        leftSlot={
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <FlatList
        data={results}
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
              <Feather name="image" size={40} color={COLORS.mistGray} />
              <SerifTitle style={styles.emptyTitle}>暂无试穿记录</SerifTitle>
              <CaptionText style={styles.emptyHint}>
                去 AI 试穿页面体验虚拟换装
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
  cardImage: {
    width: 56,
    height: 70,
    backgroundColor: COLORS.ink,
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

export default TryOnHistoryScreen;
