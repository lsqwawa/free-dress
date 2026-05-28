import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import {
  ScreenHeader,
  Section,
  Button,
  KickerText,
  SerifTitle,
  SectionTitle,
  CaptionText,
  QuoteText,
  MonoText,
  BodyText,
} from '../components';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES, EASE, DURATION } from '../constants';
import { uploadImage } from '../api/upload';
import { useOutfitStore } from '../store/outfitStore';
import { useTryOnStore } from '../store/tryOnStore';

const STEPS = [
  { no: '01', kicker: 'UPLOAD', label: '上传照片' },
  { no: '02', kicker: 'CHOOSE', label: '选择搭配' },
  { no: '03', kicker: 'COMPOSE', label: '生成效果' },
];

function TryOnScreen() {
  const { outfits, fetchOutfits } = useOutfitStore();
  const { currentResult, isGenerating, generateTryon } = useTryOnStore();

  const [personUri, setPersonUri] = useState<string | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const activeStep = personUrl ? (selectedOutfitId ? 2 : 1) : 0;

  useEffect(() => {
    if (outfits.length === 0) {
      fetchOutfits();
    }
  }, []);

  const pickImage = (fromCamera: boolean) => {
    const action = fromCamera ? launchCamera : launchImageLibrary;
    action({ mediaType: 'photo', quality: 0.8 }, async (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('错误', res.errorMessage || '无法获取图片');
        return;
      }
      const uri = res.assets?.[0]?.uri;
      if (!uri) return;

      setPersonUri(uri);
      setUploading(true);
      try {
        const uploadRes = await uploadImage(uri);
        setPersonUrl(uploadRes.data.url);
      } catch (e: any) {
        Alert.alert('上传失败', e.message);
        setPersonUri(null);
      } finally {
        setUploading(false);
      }
    });
  };

  const handleGenerate = async () => {
    if (!personUrl) return Alert.alert('提示', '请先上传一张全身照');
    if (!selectedOutfitId) return Alert.alert('提示', '请先选择一套搭配');

    try {
      await generateTryon({
        personImageUrl: personUrl,
        outfitId: selectedOutfitId,
      });
    } catch (e: any) {
      Alert.alert('生成失败', e.message || '请稍后重试');
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="TRY-ON STUDIO"
        title="AI 试穿"
        issue="STUDIO №07"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 步骤指示 */}
        <View style={styles.stepsRow}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.no}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    idx <= activeStep ? styles.stepCircleActive : null,
                  ]}
                >
                  <SerifTitle
                    style={[
                      styles.stepNo,
                      idx <= activeStep
                        ? { color: COLORS.cream }
                        : { color: COLORS.ink },
                    ]}
                  >
                    {step.no}
                  </SerifTitle>
                </View>
                <KickerText
                  style={[
                    styles.stepKicker,
                    {
                      color:
                        idx === activeStep ? COLORS.caramel : COLORS.inkMuted,
                    },
                  ]}
                >
                  {step.kicker}
                </KickerText>
                <CaptionText style={styles.stepLabel}>{step.label}</CaptionText>
              </View>
              {idx < STEPS.length - 1 ? (
                <View style={styles.stepLine} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        {/* 上传区 */}
        <View style={styles.section}>
          <Section
            kicker="STEP 01 · UPLOAD"
            title="上传你的全身照"
            issue="VIEWFINDER"
          />
          {personUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: personUri }} style={styles.preview} />
              <Pressable
                style={styles.previewRemove}
                onPress={() => {
                  setPersonUri(null);
                  setPersonUrl(null);
                }}
              >
                <Feather name="x" size={16} color={COLORS.cream} />
              </Pressable>
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <BodyText style={{ color: COLORS.cream }}>上传中...</BodyText>
                </View>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.uploadFrame}
              onPress={() => pickImage(false)}
              onLongPress={() => pickImage(true)}
            >
              <View style={[styles.cornerL, styles.cornerTL]} />
              <View style={[styles.cornerL, styles.cornerTR]} />
              <View style={[styles.cornerL, styles.cornerBL]} />
              <View style={[styles.cornerL, styles.cornerBR]} />

              <View style={styles.uploadIconBlock}>
                <Feather name="camera" size={36} color={COLORS.ink} />
              </View>
              <SectionTitle style={styles.uploadTitle}>
                点击选择照片
              </SectionTitle>
              <CaptionText style={styles.uploadHint}>
                长按拍照 · 点击从相册选择
              </CaptionText>
            </Pressable>
          )}
        </View>

        {/* 选择搭配 */}
        <View style={styles.section}>
          <Section
            kicker="STEP 02 · CHOOSE"
            title="选择一套搭配"
            issue={`${String(outfits.length).padStart(2, '0')} OUTFITS`}
          />
          {outfits.length === 0 ? (
            <View style={styles.emptyDrafts}>
              <CaptionText style={{ fontStyle: 'italic' }}>
                暂无搭配，请先在搭配实验室创建
              </CaptionText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.draftsRow}
            >
              {outfits.map((outfit) => {
                const selected = outfit.id === selectedOutfitId;
                const firstCloth = outfit.outfitClothes?.[0]?.cloth;
                return (
                  <Pressable
                    key={outfit.id}
                    style={[
                      styles.draftCard,
                      selected && styles.draftCardSelected,
                    ]}
                    onPress={() => setSelectedOutfitId(outfit.id)}
                  >
                    <View style={styles.draftImage}>
                      {firstCloth?.imageUrl ? (
                        <Image
                          source={{ uri: firstCloth.imageUrl }}
                          style={styles.draftImg}
                        />
                      ) : (
                        <Feather name="layers" size={20} color={COLORS.cream} />
                      )}
                    </View>
                    <View style={styles.draftInfo}>
                      <KickerText>{outfit.style || '搭配'}</KickerText>
                      <BodyText style={styles.draftTitle}>
                        {outfit.outfitClothes?.length || 0} 件
                      </BodyText>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 主按钮 */}
        <View style={styles.actionWrap}>
          <Button
            variant="solid"
            colorScheme="ink"
            size="lg"
            block
            isLoading={isGenerating}
            disabled={isGenerating || !personUrl || !selectedOutfitId}
            onPress={handleGenerate}
            rightSlot={!isGenerating ? <StitchingDots /> : undefined}
          >
            {isGenerating ? 'AI 正在缝制...' : '开始合成'}
          </Button>
          <CaptionText style={styles.actionHint}>
            合成中将显示 "AI 正在缝制…" · 一刻钟以内完成
          </CaptionText>
        </View>

        {/* 试穿结果 */}
        <View style={styles.section}>
          <Section
            kicker="OUTPUT"
            title="试穿效果"
            issue="VOL.24 / TRY-ON"
          />
          {currentResult ? (
            <View style={styles.resultFrame}>
              <View style={styles.resultStampRow}>
                <MonoText style={{ color: COLORS.cream }}>VOL.24</MonoText>
                <MonoText style={{ color: COLORS.cream }}>TRY-ON</MonoText>
              </View>
              <Image
                source={{ uri: currentResult.resultImageUrl }}
                style={styles.resultImage}
                resizeMode="cover"
              />
              <View style={styles.resultFooter}>
                <BodyText style={{ color: COLORS.cream }}>
                  {currentResult.outfit?.style || '试穿完成'}
                </BodyText>
                <Feather name="bookmark" size={16} color={COLORS.sand} />
              </View>
            </View>
          ) : (
            <View style={styles.resultFrame}>
              <View style={styles.resultStampRow}>
                <MonoText style={{ color: COLORS.cream }}>VOL.24</MonoText>
                <MonoText style={{ color: COLORS.cream }}>TRY-ON №07</MonoText>
              </View>
              <View style={styles.resultCenter}>
                <Feather name="user-check" size={40} color={COLORS.cream} />
                <QuoteText style={styles.resultText}>
                  "把你的身影借给衣服，看看它如何回望。"
                </QuoteText>
              </View>
              <View style={styles.resultFooter}>
                <BodyText style={{ color: COLORS.cream }}>等待生成 …</BodyText>
                <Feather name="bookmark" size={16} color={COLORS.sand} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StitchingDots() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: DURATION.slow * 1.6, easing: EASE.editorial }),
      ),
      -1,
      false,
    );
  }, [t]);

  const dot1 = useAnimatedStyle(() => ({
    opacity: 0.4 + (t.value > 0 && t.value < 0.34 ? 0.6 : 0),
  }));
  const dot2 = useAnimatedStyle(() => ({
    opacity: 0.4 + (t.value > 0.33 && t.value < 0.67 ? 0.6 : 0),
  }));
  const dot3 = useAnimatedStyle(() => ({
    opacity: 0.4 + (t.value > 0.66 ? 0.6 : 0),
  }));

  return (
    <View style={styles.dotsWrap}>
      <Animated.View style={[styles.dot, { backgroundColor: COLORS.sand }, dot1]} />
      <Animated.View style={[styles.dot, { backgroundColor: COLORS.caramel }, dot2]} />
      <Animated.View style={[styles.dot, { backgroundColor: COLORS.cream }, dot3]} />
    </View>
  );
}

const FRAME_CORNER = 14;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[20],
  },

  /* 步骤 */
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: SPACING[6],
    paddingHorizontal: SPACING[2],
  },
  stepItem: { alignItems: 'center', width: 80, gap: SPACING[1] },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: HAIRLINE * 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  stepNo: { fontSize: FONT_SIZES.md },
  stepKicker: { marginTop: SPACING[2] },
  stepLabel: { fontSize: FONT_SIZES.xs },
  stepLine: {
    flex: 1,
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
    marginTop: 22,
    marginHorizontal: -10,
  },

  section: { marginTop: SPACING[10] },

  /* 上传 */
  uploadFrame: {
    marginTop: SPACING[5],
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[5],
    alignItems: 'center',
    position: 'relative',
  },
  cornerL: {
    position: 'absolute',
    width: FRAME_CORNER,
    height: FRAME_CORNER,
    borderColor: COLORS.ink,
  },
  cornerTL: { top: SPACING[3], left: SPACING[3], borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cornerTR: { top: SPACING[3], right: SPACING[3], borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerBL: { bottom: SPACING[3], left: SPACING[3], borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBR: { bottom: SPACING[3], right: SPACING[3], borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  uploadIconBlock: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: HAIRLINE,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[4],
  },
  uploadTitle: { marginBottom: SPACING[2] },
  uploadHint: { fontStyle: 'italic', textAlign: 'center' },

  previewWrap: { marginTop: SPACING[5], position: 'relative' },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 4,
    backgroundColor: COLORS.cream,
  },
  previewRemove: {
    position: 'absolute',
    top: SPACING[2],
    right: SPACING[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31,27,22,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  /* 搭配列表 */
  draftsRow: { paddingTop: SPACING[5], gap: SPACING[3], flexDirection: 'row' },
  emptyDrafts: {
    marginTop: SPACING[5],
    paddingVertical: SPACING[6],
    alignItems: 'center',
  },
  draftCard: {
    width: 140,
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  draftCardSelected: { borderColor: COLORS.caramel, borderWidth: 2 },
  draftImage: {
    aspectRatio: 1,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  draftImg: { width: '100%', height: '100%' },
  draftInfo: { padding: SPACING[3], gap: 2 },
  draftTitle: { fontSize: FONT_SIZES.sm, fontWeight: '500' },

  /* 主按钮 */
  actionWrap: { marginTop: SPACING[10], gap: SPACING[3] },
  actionHint: { textAlign: 'center', fontStyle: 'italic' },
  dotsWrap: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  /* 结果 */
  resultFrame: {
    marginTop: SPACING[5],
    backgroundColor: COLORS.ink,
    aspectRatio: 4 / 5,
    padding: SPACING[5],
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  resultImage: {
    ...StyleSheet.absoluteFill,
  },
  resultStampRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resultCenter: {
    alignItems: 'center',
    gap: SPACING[5],
    paddingHorizontal: SPACING[6],
  },
  resultText: { color: COLORS.cream, textAlign: 'center' },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[3],
    borderTopWidth: HAIRLINE,
    borderTopColor: COLORS.inkMuted,
  },
});

export default TryOnScreen;
