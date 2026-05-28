/**
 * 首页 — 期刊封面 + 不对称快捷入口 + 横向推荐 + 风格电台
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  KickerText,
  HeroText,
  SerifTitle,
  SectionTitle,
  BodyText,
  CaptionText,
  MonoText,
  Tag,
  Section,
} from '../components';
import { GrainBackground } from '../theme/grain';
import { slowTransition } from '../theme/motion';
import { MainTabParamList } from '../types';
import { COLORS, SPACING, HAIRLINE, RADIUS, FONT_SIZES, FONTS } from '../constants';
import { getCategoryStats } from '../api/clothes';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const { width: SCREEN_W } = Dimensions.get('window');

interface QuickAction {
  title: string;
  kicker: string;
  no: string;
  iconName: string;
  size: 'large' | 'small';
  align: 'left' | 'right';
  onPress: () => void;
}

interface RecommendItem {
  id: string;
  title: string;
  caption: string;
  style: string;
  ratio: 'wide' | 'tall';
}

interface RadioItem {
  id: string;
  style: string;
  pieces: number;
  caption: string;
}

const RECOMMEND_LIST: RecommendItem[] = [
  {
    id: 'r1',
    title: '微凉清晨',
    caption: '一件燕麦色风衣，搭配奶茶卡其裤与白T，温柔而克制。',
    style: '简约',
    ratio: 'wide',
  },
  {
    id: 'r2',
    title: '都市信差',
    caption: '深咖针织、烟管裤、猎装外套——把通勤穿成展。',
    style: '商务',
    ratio: 'tall',
  },
  {
    id: 'r3',
    title: '海岸闲信',
    caption: '亚麻衬衫与卷边短裤，把风带进每一次呼吸。',
    style: '度假',
    ratio: 'tall',
  },
];

const RADIO_LIST: RadioItem[] = [
  { id: 'rd1', style: '休闲', pieces: 12, caption: '日常穿衣的一只懒猫' },
  { id: 'rd2', style: '商务', pieces: 8, caption: '会议室也是 T 台' },
  { id: 'rd3', style: '复古', pieces: 6, caption: '从 70 年代走出来' },
  { id: 'rd4', style: '街头', pieces: 9, caption: '把街道穿成主场' },
];

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [pieceCount, setPieceCount] = useState(0);

  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(20);

  useEffect(() => {
    heroOpacity.value = withTiming(1, slowTransition);
    heroY.value = withTiming(0, slowTransition);

    getCategoryStats().then((res) => {
      const s = res.data;
      setPieceCount(s.TOP + s.BOTTOM + s.COAT + s.ACCESSORY + s.SHOE);
    }).catch(() => {});
  }, [heroOpacity, heroY]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));

  const quickActions: QuickAction[] = [
    {
      title: '上传新装',
      kicker: 'UPLOAD',
      no: '01',
      iconName: 'camera',
      size: 'large',
      align: 'left',
      onPress: () => navigation.navigate('Wardrobe'),
    },
    {
      title: '智能搭配',
      kicker: 'STYLE LAB',
      no: '02',
      iconName: 'layers',
      size: 'small',
      align: 'right',
      onPress: () => navigation.navigate('Outfit'),
    },
    {
      title: 'AI 试穿',
      kicker: 'TRY-ON',
      no: '03',
      iconName: 'user-check',
      size: 'small',
      align: 'left',
      onPress: () => navigation.navigate('TryOn'),
    },
    {
      title: '收藏柜',
      kicker: 'SAVED',
      no: '04',
      iconName: 'bookmark',
      size: 'large',
      align: 'right',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: SPACING[16] }}
        showsVerticalScrollIndicator={false}
      >
        {/* === A. 期刊封面 === */}
        <Animated.View
          style={[
            styles.cover,
            { paddingTop: insets.top + SPACING[6] },
            heroStyle,
          ]}
        >
          <GrainBackground density={70} opacity={0.06} />

          <View style={styles.coverTopRow}>
            <View style={styles.coverTopLeft}>
              <View style={styles.dotLine} />
              <KickerText>EDITORIAL · ISSUE 24</KickerText>
            </View>
            <MonoText>26 · MAY · FRI</MonoText>
          </View>

          <View style={styles.coverTitleBlock}>
            <CaptionText style={styles.coverEyebrow}>TODAY</CaptionText>
            <HeroText style={styles.coverTitle}>今日</HeroText>
            <View style={styles.coverSecond}>
              <HeroText style={styles.coverTitle}>穿什么</HeroText>
              <View style={styles.coverIssueWrap}>
                <MonoText style={styles.coverIssue}>№</MonoText>
                <SerifTitle style={styles.coverIssueNum}>24</SerifTitle>
              </View>
            </View>
          </View>

          <View style={styles.coverFootRow}>
            <View style={styles.coverDivider} />
            <BodyText style={styles.coverTagline}>
              By FreeDress Atelier · 一刊一搭
            </BodyText>
          </View>
        </Animated.View>

        {/* === B. 不对称快捷入口 === */}
        <View style={styles.quickSection}>
          <Section
            kicker="QUICK ACCESS"
            title="进入栏目"
            issue={`${String(pieceCount).padStart(2, '0')} PIECES`}
          />

          <View style={styles.quickGrid}>
            {/* 第一行：大左 + 小右 */}
            <View style={styles.quickRow}>
              <QuickCard action={quickActions[0]} />
              <View style={styles.quickColumn}>
                <QuickCard action={quickActions[1]} />
              </View>
            </View>
            {/* 第二行：小左 + 大右 */}
            <View style={[styles.quickRow, styles.quickRowReverse]}>
              <View style={styles.quickColumn}>
                <QuickCard action={quickActions[2]} />
              </View>
              <QuickCard action={quickActions[3]} />
            </View>
          </View>
        </View>

        {/* === C. 今日推荐 === */}
        <View style={styles.recommendSection}>
          <Section
            kicker="EDITOR'S PICK"
            title="今日推荐"
            issue="03 LOOKS"
          />
          <FlatList
            data={RECOMMEND_LIST}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendList}
            ItemSeparatorComponent={() => <View style={{ width: SPACING[4] }} />}
            renderItem={({ item, index }) => (
              <RecommendCard item={item} index={index} />
            )}
          />
        </View>

        {/* === D. 风格电台 === */}
        <View style={styles.radioSection}>
          <Section kicker="STYLE RADIO" title="风格电台" issue="04 BANDS" />
          <View style={styles.radioGrid}>
            {RADIO_LIST.map((it, idx) => (
              <RadioCard key={it.id} item={it} index={idx} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ========== 子组件 ========== */

function QuickCard({ action }: { action: QuickAction }) {
  const isLarge = action.size === 'large';
  const cardStyle = [
    styles.quickCard,
    isLarge ? styles.quickCardLarge : styles.quickCardSmall,
    action.align === 'right' ? { marginTop: SPACING[8] } : null,
  ];

  return (
    <Pressable
      onPress={action.onPress}
      style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.85 : 1 }]}
    >
      {/* 顶部 ink 图标块 */}
      <View
        style={[
          styles.quickIconBlock,
          { height: isLarge ? 100 : 76 },
        ]}
      >
        <Feather name={action.iconName} size={isLarge ? 28 : 22} color={COLORS.cream} />
        <MonoText style={styles.quickNumber}>{action.no}</MonoText>
      </View>
      <View style={styles.quickInfo}>
        <KickerText>{action.kicker}</KickerText>
        <SectionTitle style={styles.quickTitle}>{action.title}</SectionTitle>
        <View style={styles.quickArrow}>
          <View style={styles.quickArrowLine} />
          <Feather name="arrow-right" size={14} color={COLORS.ink} />
        </View>
      </View>
    </Pressable>
  );
}

function RecommendCard({ item, index }: { item: RecommendItem; index: number }) {
  const cardWidth = item.ratio === 'wide' ? SCREEN_W * 0.78 : SCREEN_W * 0.55;
  const aspect = item.ratio === 'wide' ? 4 / 5 : 3 / 4;

  return (
    <View style={[styles.recommendCard, { width: cardWidth }]}>
      <View
        style={[
          styles.recommendImage,
          {
            height: cardWidth / aspect,
          },
        ]}
      >
        {/* 占位条纹 */}
        <View style={styles.recommendStripe} />
        <View style={styles.recommendStripeAlt} />
        <View style={styles.recommendStamp}>
          <MonoText style={{ color: COLORS.cream }}>{`№ ${index + 1}`}</MonoText>
        </View>
      </View>
      <View style={styles.recommendInfo}>
        <KickerText>STYLE · {item.style.toUpperCase()}</KickerText>
        <SectionTitle style={styles.recommendTitle}>{item.title}</SectionTitle>
        <CaptionText style={styles.recommendCaption}>{item.caption}</CaptionText>
      </View>
    </View>
  );
}

function RadioCard({ item, index }: { item: RadioItem; index: number }) {
  return (
    <Pressable style={styles.radioCard}>
      <View style={styles.radioHead}>
        <MonoText>0{index + 1}</MonoText>
        <Feather name="radio" size={14} color={COLORS.inkSoft} />
      </View>
      <SectionTitle style={styles.radioTitle}>{item.style}</SectionTitle>
      <CaptionText style={styles.radioCaption}>{item.caption}</CaptionText>
      <View style={styles.radioFoot}>
        <Tag size="sm">{item.pieces} 件</Tag>
        <Feather name="arrow-right" size={14} color={COLORS.ink} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.ecru,
  },
  container: {
    flex: 1,
  },

  /* === A. 封面 === */
  cover: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[10],
    backgroundColor: COLORS.ecru,
    overflow: 'hidden',
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  coverTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  dotLine: {
    width: 18,
    height: HAIRLINE * 2,
    backgroundColor: COLORS.ink,
  },
  coverTitleBlock: {
    marginBottom: SPACING[6],
  },
  coverEyebrow: {
    color: COLORS.caramel,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING[2],
    fontFamily: FONTS.bodyMedium,
    fontWeight: '600',
  },
  coverTitle: {
    fontSize: 76,
    lineHeight: 80,
    letterSpacing: -2.4,
  },
  coverSecond: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  coverIssueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING[1],
    paddingBottom: SPACING[4],
  },
  coverIssue: {
    color: COLORS.caramel,
  },
  coverIssueNum: {
    color: COLORS.caramel,
    fontSize: FONT_SIZES.xl,
  },
  coverFootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  coverDivider: {
    width: 32,
    height: HAIRLINE * 2,
    backgroundColor: COLORS.ink,
  },
  coverTagline: {
    color: COLORS.inkSoft,
    flex: 1,
    fontStyle: 'italic',
  },

  /* === B. 快捷入口 === */
  quickSection: {
    paddingHorizontal: SPACING[6],
    marginTop: SPACING[6],
  },
  quickGrid: {
    marginTop: SPACING[5],
  },
  quickRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[3],
    alignItems: 'flex-start',
  },
  quickRowReverse: {
    alignItems: 'flex-end',
  },
  quickColumn: {
    flex: 1,
  },
  quickCard: {
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    overflow: 'hidden',
  },
  quickCardLarge: {
    flex: 1.4,
  },
  quickCardSmall: {
    flex: 1,
  },
  quickIconBlock: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickNumber: {
    color: COLORS.cream,
    fontSize: FONT_SIZES.sm,
  },
  quickInfo: {
    padding: SPACING[4],
    gap: SPACING[1],
  },
  quickTitle: {
    fontSize: FONT_SIZES.md + 2,
    marginTop: SPACING[1],
  },
  quickArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[3],
  },
  quickArrowLine: {
    flex: 1,
    height: HAIRLINE,
    backgroundColor: COLORS.ink,
  },

  /* === C. 推荐 === */
  recommendSection: {
    marginTop: SPACING[10],
    paddingLeft: SPACING[6],
  },
  recommendList: {
    paddingTop: SPACING[5],
    paddingRight: SPACING[6],
  },
  recommendCard: {
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  recommendImage: {
    width: '100%',
    backgroundColor: COLORS.sand,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendStripe: {
    position: 'absolute',
    top: '20%',
    left: '-10%',
    right: '-10%',
    height: 40,
    backgroundColor: COLORS.ink,
    opacity: 0.08,
    transform: [{ rotate: '-8deg' }],
  },
  recommendStripeAlt: {
    position: 'absolute',
    bottom: '15%',
    left: '-10%',
    right: '-10%',
    height: 24,
    backgroundColor: COLORS.caramel,
    opacity: 0.4,
    transform: [{ rotate: '6deg' }],
  },
  recommendStamp: {
    position: 'absolute',
    top: SPACING[3],
    right: SPACING[3],
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  recommendInfo: {
    padding: SPACING[4],
    gap: SPACING[1],
  },
  recommendTitle: {
    marginTop: SPACING[1],
    marginBottom: SPACING[2],
  },
  recommendCaption: {
    fontStyle: 'italic',
  },

  /* === D. 风格电台 === */
  radioSection: {
    marginTop: SPACING[10],
    paddingHorizontal: SPACING[6],
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginTop: SPACING[5],
  },
  radioCard: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: SPACING[5],
    paddingHorizontal: SPACING[4],
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    backgroundColor: COLORS.cream,
    minHeight: 140,
  },
  radioHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  radioTitle: {
    fontSize: FONT_SIZES.lg,
  },
  radioCaption: {
    marginTop: SPACING[1],
    fontStyle: 'italic',
    flex: 1,
  },
  radioFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[4],
    paddingTop: SPACING[3],
    borderTopWidth: HAIRLINE,
    borderTopColor: COLORS.mistGray,
  },
});

export default HomeScreen;
