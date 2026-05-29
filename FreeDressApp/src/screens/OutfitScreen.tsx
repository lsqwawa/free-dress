import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  FlatList,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Tag,
  Button,
  Section,
  KickerText,
  SectionTitle,
  BodyText,
  CaptionText,
  QuoteText,
  MonoText,
  IconButton,
} from '../components';
import { COLORS, SPACING, HAIRLINE, RADIUS, FONT_SIZES } from '../constants';
import { Cloth } from '../types';
import { useWardrobeStore } from '../store/wardrobeStore';
import { useOutfitStore } from '../store/outfitStore';
import { getRecommendations, RecommendationResult } from '../api/outfits';


const STYLE_INTENTS = [
  '极简', '商务', '街头', '复古', '度假', '甜美', '中性', '运动', '优雅',
];

function OutfitScreen() {
  const navigation = useNavigation<any>();
  const { clothes, fetchClothes } = useWardrobeStore();
  const { currentOutfit, createNewOutfit, toggleFav } = useOutfitStore();

  const [intents, setIntents] = useState<string[]>([]);
  const [selectedClothIds, setSelectedClothIds] = useState<string[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    if (clothes.length === 0) {
      fetchClothes();
    }
  }, []);

  const toggleIntent = (intent: string) => {
    setIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent],
    );
  };

  const toggleClothSelection = (id: string) => {
    setSelectedClothIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedClothes = clothes.filter((c) => selectedClothIds.includes(c.id));

  const handleGenerate = async () => {
    if (selectedClothIds.length === 0) {
      return Alert.alert('提示', '请先从衣橱选择至少一件衣物');
    }

    setGenerating(true);
    try {
      await createNewOutfit({
        clothIds: selectedClothIds,
        style: intents.join('、') || undefined,
        aiDescription: `以${selectedClothIds.length}件衣物组成的${intents.join('、') || '日常'}搭配`,
      });
    } catch (e: any) {
      Alert.alert('创建失败', e.message || '请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleFavorite = useCallback(async () => {
    if (!currentOutfit) return;
    try {
      await toggleFav(currentOutfit.id);
    } catch (e: any) {
      Alert.alert('操作失败', e.message);
    }
  }, [currentOutfit]);

  const handleGetRecommendations = useCallback(async () => {
    setLoadingRec(true);
    try {
      const res = await getRecommendations({ count: 3 });
      setRecommendations(res.data || []);
    } catch (e: any) {
      if (e.message?.includes('次数已用完')) {
        Alert.alert('配额用尽', '今日AI推荐次数已用完，明天再试');
      } else {
        Alert.alert('推荐失败', e.message || '请稍后重试');
      }
    } finally {
      setLoadingRec(false);
    }
  }, []);

  const handleAdoptRecommendation = useCallback((rec: RecommendationResult) => {
    setSelectedClothIds(rec.clothIds);
    setIntents(rec.style ? [rec.style] : []);
    Alert.alert('已采纳', `${rec.reason}\n\n已填入选择区，可直接生成搭配`);
  }, []);

  const handleShare = useCallback(async () => {
    if (!currentOutfit) return;
    try {
      const items = currentOutfit.outfitClothes?.length || 0;
      await Share.share({
        message: `我在「畅搭」搭配了一套${currentOutfit.style || '日常'}风格穿搭（${items}件单品）✨\n${currentOutfit.aiDescription || '每一件衣服都是自我表达的一部分。'}\n\n#畅搭FreeDress #今日穿搭`,
        title: '分享我的搭配',
      });
    } catch (e) {
      // 用户取消分享，静默处理
    }
  }, [currentOutfit]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="STYLE LAB"
        title="搭配实验室"
        issue="DRAFT №07"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 宣言条 */}
        <View style={styles.manifesto}>
          <View style={styles.manifestoBar} />
          <View style={styles.manifestoBody}>
            <KickerText style={styles.manifestoKicker}>
              FROM YOUR WARDROBE
            </KickerText>
            <QuoteText style={styles.manifestoQuote}>
              选三五件你心仪之物，让 AI 为你拟好今日的札记。
            </QuoteText>
          </View>
        </View>

        {/* 已选衣物 */}
        <View style={styles.section}>
          <Section
            kicker="SELECTED PIECES"
            title="已选衣物"
            issue={`${String(selectedClothIds.length).padStart(2, '0')} ITEMS`}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbsRow}
          >
            <Pressable
              style={styles.addThumb}
              onPress={() => setPickerVisible(true)}
            >
              <Feather name="plus" size={22} color={COLORS.ink} />
              <MonoText style={styles.addThumbLabel}>ADD</MonoText>
            </Pressable>

            {selectedClothes.map((item) => (
              <Pressable
                key={item.id}
                style={styles.thumbItem}
                onPress={() => toggleClothSelection(item.id)}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} />
                <View style={styles.thumbRemove}>
                  <Feather name="x" size={10} color={COLORS.cream} />
                </View>
              </Pressable>
            ))}

            {selectedClothIds.length === 0 && (
              <View style={styles.emptyThumbsHint}>
                <CaptionText style={styles.emptyHintText}>
                  请从衣橱挑选 3-5 件
                </CaptionText>
              </View>
            )}
          </ScrollView>
        </View>

        {/* 风格意图 */}
        <View style={styles.section}>
          <Section
            kicker="STYLE INTENT"
            title="风格意图"
            issue="MULTI-CHOICE"
          />
          <View style={styles.tagWrap}>
            {STYLE_INTENTS.map((intent) => (
              <Tag
                key={intent}
                size="md"
                active={intents.includes(intent)}
                onPress={() => toggleIntent(intent)}
              >
                {intent}
              </Tag>
            ))}
          </View>
        </View>

        {/* 主按钮 */}
        <View style={styles.actionBar}>
          <Button
            variant="solid"
            colorScheme="ink"
            size="lg"
            block
            isLoading={generating}
            disabled={generating}
            onPress={handleGenerate}
            rightSlot={
              <View style={styles.actionDot}>
                <View style={styles.actionDotInner} />
              </View>
            }
          >
            {generating ? '生成中...' : '生成今日搭配'}
          </Button>
          <CaptionText style={styles.actionHint}>
            预计耗时 8 - 12 秒 · 运用本期素材重新缝合
          </CaptionText>
        </View>

        {/* 结果区 */}
        <View style={styles.section}>
          <Section
            kicker="OUTFIT RESULT"
            title="拟稿"
            issue="VOL.24 · DRAFT"
          />

          {currentOutfit ? (
            <View style={styles.resultCard}>
              <View style={styles.resultImage}>
                {currentOutfit.outfitClothes?.length > 0 ? (
                  <View style={styles.resultGrid}>
                    {currentOutfit.outfitClothes.slice(0, 4).map((oc, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: oc.cloth?.imageUrl }}
                        style={styles.resultGridImg}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.resultCenter}>
                    <Feather name="layers" size={36} color={COLORS.cream} />
                  </View>
                )}
                <View style={styles.resultStampTop}>
                  <MonoText style={{ color: COLORS.cream }}>VOL.24 / OUTFIT</MonoText>
                </View>
              </View>
              <View style={styles.resultInfo}>
                <SectionTitle style={styles.resultTitle}>
                  {currentOutfit.style || '你的搭配'}
                </SectionTitle>
                <QuoteText style={styles.resultCaption}>
                  {currentOutfit.aiDescription || '"穿衣是一种自我编辑。"'}
                </QuoteText>
                <View style={styles.resultActions}>
                  <ActionLink
                    icon="refresh-cw"
                    label="重新生成"
                    onPress={handleGenerate}
                  />
                  <View style={styles.resultActionDivider} />
                  <ActionLink
                    icon={currentOutfit.isFavorited ? 'bookmark' : 'bookmark'}
                    label={currentOutfit.isFavorited ? '已收藏' : '收藏'}
                    onPress={handleFavorite}
                    active={currentOutfit.isFavorited}
                  />
                  <View style={styles.resultActionDivider} />
                  <ActionLink
                    icon="user-check"
                    label="试穿"
                    onPress={() => navigation.navigate('TryOn')}
                  />
                  <View style={styles.resultActionDivider} />
                  <ActionLink
                    icon="share-2"
                    label="分享"
                    onPress={handleShare}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.resultCard}>
              <View style={styles.resultImage}>
                <View style={styles.resultStripe} />
                <View style={styles.resultStampTop}>
                  <MonoText style={{ color: COLORS.cream }}>VOL.24 / OUTFIT</MonoText>
                </View>
                <View style={styles.resultCenter}>
                  <Feather name="layers" size={36} color={COLORS.cream} />
                  <MonoText style={styles.resultPlaceholderText}>
                    AI DRAFT WILL APPEAR HERE
                  </MonoText>
                </View>
              </View>
              <View style={styles.resultInfo}>
                <SectionTitle style={styles.resultTitle}>
                  等待第一稿 · 你的札记
                </SectionTitle>
                <QuoteText style={styles.resultCaption}>
                  "穿衣是一种自我编辑——挑出你今天想成为的版本。"
                </QuoteText>
              </View>
            </View>
          )}
        </View>

        {/* AI 推荐区 */}
        <View style={styles.section}>
          <Section
            kicker="AI STYLIST"
            title="智能推荐"
            issue="POWERED BY AI"
          />
          <CaptionText style={styles.recHint}>
            基于你的衣橱，AI 为你拟定搭配方案
          </CaptionText>

          <Button
            variant="outline"
            colorScheme="ink"
            size="md"
            block
            isLoading={loadingRec}
            disabled={loadingRec}
            onPress={handleGetRecommendations}
            style={styles.recBtn}
          >
            {loadingRec ? '推荐生成中...' : '获取 AI 推荐'}
          </Button>

          {recommendations.length > 0 && (
            <View style={styles.recList}>
              {recommendations.map((rec, idx) => (
                <Pressable
                  key={idx}
                  style={styles.recCard}
                  onPress={() => handleAdoptRecommendation(rec)}
                >
                  <View style={styles.recCardHeader}>
                    <MonoText style={styles.recNo}>№{String(idx + 1).padStart(2, '0')}</MonoText>
                    <View style={styles.recScoreBadge}>
                      <MonoText style={styles.recScoreText}>{rec.score}分</MonoText>
                    </View>
                  </View>
                  <SectionTitle style={styles.recStyle}>{rec.style}</SectionTitle>
                  <CaptionText style={styles.recReason}>{rec.reason}</CaptionText>
                  <View style={styles.recFooter}>
                    <CaptionText style={styles.recOccasion}>{rec.occasion}</CaptionText>
                    <CaptionText style={styles.recAdopt}>点击采纳 →</CaptionText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 衣物选择器弹窗 */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.pickerWrap}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <KickerText>SELECT PIECES</KickerText>
              <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
                <Pressable onPress={() => { setSelectedClothIds([]); }}>
                  <CaptionText style={{ color: COLORS.signal }}>清空</CaptionText>
                </Pressable>
                <Pressable onPress={() => setPickerVisible(false)}>
                  <Feather name="x" size={22} color={COLORS.ink} />
                </Pressable>
              </View>
            </View>

            <View style={styles.pickerHint}>
              <CaptionText>
                已选 {selectedClothIds.length} 件 · 点击选择/取消
              </CaptionText>
            </View>

            <FlatList
              data={clothes}
              numColumns={3}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.pickerGrid}
              columnWrapperStyle={{ gap: SPACING[2] }}
              ItemSeparatorComponent={() => <View style={{ height: SPACING[2] }} />}
              renderItem={({ item }) => {
                const selected = selectedClothIds.includes(item.id);
                return (
                  <Pressable
                    style={[
                      styles.pickerItem,
                      selected && styles.pickerItemSelected,
                    ]}
                    onPress={() => toggleClothSelection(item.id)}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.pickerImg} />
                    {selected && (
                      <View style={styles.pickerCheck}>
                        <Feather name="check" size={14} color={COLORS.cream} />
                      </View>
                    )}
                  </Pressable>
                );
              }}
            />

            <Button
              onPress={() => setPickerVisible(false)}
              style={{ marginHorizontal: SPACING[4], marginBottom: SPACING[4] }}
            >
              完成选择 ({selectedClothIds.length})
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionLink({
  icon,
  label,
  onPress,
  active,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <Pressable style={styles.actionLink} onPress={onPress}>
      <Feather
        name={icon}
        size={14}
        color={active ? COLORS.caramel : COLORS.ink}
      />
      <BodyText
        style={[
          styles.actionLinkLabel,
          active && { color: COLORS.caramel },
        ]}
      >
        {label}
      </BodyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[20],
  },

  /* 宣言条 */
  manifesto: {
    flexDirection: 'row',
    backgroundColor: COLORS.ink,
    marginTop: SPACING[5],
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    gap: SPACING[3],
  },
  manifestoBar: { width: 2, backgroundColor: COLORS.caramel },
  manifestoBody: { flex: 1, gap: SPACING[2] },
  manifestoKicker: { color: COLORS.sand },
  manifestoQuote: { color: COLORS.cream, fontStyle: 'italic' },

  section: { marginTop: SPACING[10] },

  /* 已选衣物 */
  thumbsRow: {
    paddingTop: SPACING[5],
    gap: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  addThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    borderWidth: HAIRLINE * 2,
    borderColor: COLORS.ink,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[1] - 2,
  },
  addThumbLabel: {
    fontSize: FONT_SIZES.xs - 2,
    letterSpacing: 1.4,
    color: COLORS.ink,
  },
  thumbItem: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.signal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyThumbsHint: { paddingHorizontal: SPACING[3], justifyContent: 'center' },
  emptyHintText: { fontStyle: 'italic' },

  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginTop: SPACING[5],
  },

  /* 主按钮 */
  actionBar: { marginTop: SPACING[10], gap: SPACING[3] },
  actionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.caramel,
  },
  actionHint: { textAlign: 'center', fontStyle: 'italic' },

  /* 结果 */
  resultCard: {
    marginTop: SPACING[5],
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  resultImage: {
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.ink,
    overflow: 'hidden',
    position: 'relative',
  },
  resultGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultGridImg: { width: '50%', height: '50%' },
  resultStripe: {
    position: 'absolute',
    top: '40%',
    left: '-10%',
    right: '-10%',
    height: 60,
    backgroundColor: COLORS.caramel,
    opacity: 0.18,
    transform: [{ rotate: '-6deg' }],
  },
  resultStampTop: {
    position: 'absolute',
    top: SPACING[3],
    left: SPACING[3],
    right: SPACING[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[3],
  },
  resultPlaceholderText: { color: COLORS.cream, opacity: 0.6 },
  resultInfo: { padding: SPACING[5], gap: SPACING[3] },
  resultTitle: { fontSize: FONT_SIZES.lg },
  resultCaption: { color: COLORS.inkSoft },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: HAIRLINE,
    borderTopColor: COLORS.mistGray,
  },
  actionLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[2],
  },
  actionLinkLabel: { fontSize: FONT_SIZES.sm, color: COLORS.ink, fontWeight: '500' },
  resultActionDivider: { width: HAIRLINE, height: 16, backgroundColor: COLORS.mistGray },

  /* AI 推荐 */
  recHint: { marginTop: SPACING[2], fontStyle: 'italic' },
  recBtn: { marginTop: SPACING[4] },
  recList: { marginTop: SPACING[4], gap: SPACING[3] },
  recCard: {
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    padding: SPACING[4],
    gap: SPACING[2],
  },
  recCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recNo: { color: COLORS.inkMuted, fontSize: FONT_SIZES.xs },
  recScoreBadge: {
    backgroundColor: COLORS.caramel,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  recScoreText: { color: COLORS.cream, fontSize: FONT_SIZES.xs },
  recStyle: { fontSize: FONT_SIZES.md },
  recReason: { color: COLORS.inkSoft },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: HAIRLINE,
    borderTopColor: COLORS.mistGray,
  },
  recOccasion: { color: COLORS.clay },
  recAdopt: { color: COLORS.caramel, fontWeight: '500' },

  /* 衣物选择器 */
  pickerWrap: { flex: 1, backgroundColor: 'rgba(31,27,22,0.5)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: COLORS.ecru,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    paddingBottom: SPACING[4],
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  pickerHint: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[2],
  },
  pickerGrid: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
  },
  pickerItem: {
    flex: 1 / 3,
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerItemSelected: { borderColor: COLORS.caramel },
  pickerImg: { width: '100%', height: '100%' },
  pickerCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.caramel,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OutfitScreen;
