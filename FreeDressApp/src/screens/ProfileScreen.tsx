import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Avatar,
  Badge,
  Button,
  Section,
  KickerText,
  SerifTitle,
  CaptionText,
  MonoText,
  BodyText,
} from '../components';
import { GrainOverlay } from '../theme/grain';
import { useAuthStore } from '../store/authStore';
import { getUserStats } from '../api/users';
import { getTryonQuota, AiUsageSummary } from '../api/tryon';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES } from '../constants';
import { getVolText, getEstYearText } from '../utils/date';

interface StatItem {
  no: string;
  kicker: string;
  value: number;
}

interface MenuItem {
  no: string;
  title: string;
  iconName: string;
  route?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { no: '01', title: '收藏柜', iconName: 'bookmark', route: 'Favorites' },
  { no: '02', title: '搭配历史', iconName: 'clock', route: 'OutfitHistory' },
  { no: '03', title: '试穿记录', iconName: 'image', route: 'TryOnHistory' },
  { no: '04', title: '会员中心', iconName: 'award', route: 'Membership' },
  { no: '05', title: '设置', iconName: 'settings', route: 'Settings' },
  { no: '06', title: '帮助与反馈', iconName: 'help-circle' },
];

function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, clearAuth } = useAuthStore();
  const [stats, setStats] = useState<StatItem[]>([
    { no: '01', kicker: 'PIECES', value: 0 },
    { no: '02', kicker: 'OUTFITS', value: 0 },
    { no: '03', kicker: 'SAVED', value: 0 },
    { no: '04', kicker: 'TRY-ONS', value: 0 },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsageSummary | null>(null);
  const volText = getVolText();
  const estYearText = getEstYearText();

  const fetchStats = useCallback(async () => {
    try {
      const res = await getUserStats();
      const d = res.data;
      setStats([
        { no: '01', kicker: 'PIECES', value: d.clothesCount },
        { no: '02', kicker: 'OUTFITS', value: d.outfitsCount },
        { no: '03', kicker: 'SAVED', value: d.favoritesCount },
        { no: '04', kicker: 'TRY-ONS', value: d.tryOnCount },
      ]);
    } catch (e) {
      console.error('获取统计失败:', e);
    }
    try {
      const quotaRes = await getTryonQuota();
      setAiUsage(quotaRes.data);
    } catch (e) {
      // AI配额获取失败不影响主流程
      console.error('获取AI配额失败:', e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const handleLogout = () => {
    Alert.alert('退订本期', '您确定要登出本刊吗？', [
      { text: '继续阅读', style: 'cancel' },
      { text: '确定退订', style: 'destructive', onPress: () => clearAuth() },
    ]);
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) {
      navigation.navigate(item.route);
    } else {
      Alert.alert(item.title, '功能即将开放，敬请期待');
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        kicker="ATELIER · YOU"
        title="我的"
        issue={`MEMBER №${(user?.id?.slice(-3) || '001').toUpperCase()}`}
        rightSlot={
          <Pressable
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Feather name="edit-2" size={16} color={COLORS.ink} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.caramel}
          />
        }
      >
        {/* 用户卡 */}
        <View style={styles.userCard}>
          <GrainOverlay opacity={0.06} color={COLORS.cream} density={100} />

          <View style={styles.userTopRow}>
            <KickerText style={styles.userKicker}>{estYearText}</KickerText>
            <MonoText style={styles.userIssue}>{volText}</MonoText>
          </View>

          <View style={styles.userBody}>
            <Avatar
              size={80}
              fallback={user?.nickname || 'U'}
              bg={COLORS.cream}
              borderColor={COLORS.cream}
              stamp={
                user?.role === 'VIP' ? (
                  <Badge variant="stamp">VIP</Badge>
                ) : null
              }
            />
            <View style={styles.userInfo}>
              <SerifTitle style={styles.userNickname}>
                {user?.nickname || '匿名读者'}
              </SerifTitle>
              <MonoText style={styles.userPhone}>
                {user?.phone || '+86 ··· ···· ····'}
              </MonoText>
            </View>
          </View>

          <View style={styles.userDivider} />

          <View style={styles.userTagline}>
            <Feather name="feather" size={14} color={COLORS.sand} />
            <CaptionText style={styles.userTaglineText}>
              "我的衣橱，是我书写的另一本日记。"
            </CaptionText>
          </View>
        </View>

        {/* 统计 */}
        <View style={styles.statsBlock}>
          <Section
            kicker="EDITORIAL STATS"
            title="编辑数据"
            issue="CURRENT"
          />
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.no} style={styles.statCell}>
                <MonoText style={styles.statNo}>{s.no}</MonoText>
                <SerifTitle style={styles.statValue}>
                  {String(s.value).padStart(2, '0')}
                </SerifTitle>
                <KickerText numberOfLines={1} style={styles.statKicker}>{s.kicker}</KickerText>
              </View>
            ))}
          </View>
        </View>

        {/* AI 使用情况 */}
        {aiUsage && (
          <View style={styles.aiBlock}>
            <Section kicker="AI CREDITS" title="今日额度" issue="DAILY" />
            <View style={styles.aiCard}>
              <View style={styles.aiRow}>
                <View style={styles.aiItem}>
                  <KickerText style={styles.aiLabel}>AI 试穿</KickerText>
                  <View style={styles.aiBarWrap}>
                    <View
                      style={[
                        styles.aiBar,
                        { width: `${(aiUsage.tryon.used / aiUsage.tryon.limit) * 100}%` },
                      ]}
                    />
                  </View>
                  <MonoText style={styles.aiCount}>
                    {aiUsage.tryon.used}/{aiUsage.tryon.limit}
                  </MonoText>
                </View>
                <View style={styles.aiItem}>
                  <KickerText style={styles.aiLabel}>AI 推荐</KickerText>
                  <View style={styles.aiBarWrap}>
                    <View
                      style={[
                        styles.aiBar,
                        { width: `${(aiUsage.recommend.used / aiUsage.recommend.limit) * 100}%` },
                      ]}
                    />
                  </View>
                  <MonoText style={styles.aiCount}>
                    {aiUsage.recommend.used}/{aiUsage.recommend.limit}
                  </MonoText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 菜单列表 */}
        <View style={styles.menuBlock}>
          <Section kicker="DIRECTORY" title="目录" issue="06 PAGES" />
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item, idx) => (
              <Pressable
                key={item.no}
                onPress={() => handleMenuPress(item)}
                style={({ pressed }) => [
                  styles.menuItem,
                  idx !== MENU_ITEMS.length - 1 ? styles.menuItemBorder : null,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={styles.menuLeft}>
                  <MonoText style={styles.menuNo}>№{item.no}</MonoText>
                  <Feather name={item.iconName} size={18} color={COLORS.ink} />
                  <BodyText style={styles.menuTitle}>{item.title}</BodyText>
                </View>
                <View style={styles.menuRight}>
                  <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 登出 */}
        <View style={styles.logoutWrap}>
          <Button
            variant="outline"
            colorScheme="ink"
            size="md"
            onPress={handleLogout}
            block
          >
            退订本期 · 登出
          </Button>
          <View style={styles.versionRow}>
            <View style={styles.versionLine} />
            <MonoText style={styles.versionText}>畅搭 · 0.1.0 · COUTURE</MonoText>
            <View style={styles.versionLine} />
          </View>
        </View>
      </ScrollView>
    </View>
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 用户卡 */
  userCard: {
    backgroundColor: COLORS.ink,
    marginTop: SPACING[5],
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
    overflow: 'hidden',
  },
  userTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[5],
  },
  userKicker: {
    color: COLORS.sand,
  },
  userIssue: {
    color: COLORS.cream,
  },
  userBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[5],
  },
  userInfo: {
    flex: 1,
    gap: SPACING[2],
  },
  userNickname: {
    color: COLORS.cream,
    fontSize: FONT_SIZES.xl,
  },
  userPhone: {
    color: COLORS.cream,
    opacity: 0.7,
  },
  userDivider: {
    height: HAIRLINE,
    backgroundColor: COLORS.inkMuted,
    opacity: 0.4,
    marginVertical: SPACING[5],
  },
  userTagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  userTaglineText: {
    color: COLORS.cream,
    fontStyle: 'italic',
    flex: 1,
  },

  /* 统计 */
  statsBlock: {
    marginTop: SPACING[8],
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: SPACING[5],
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
  },
  statCell: {
    flex: 1,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[1],
    alignItems: 'center',
    borderRightWidth: HAIRLINE,
    borderRightColor: COLORS.mistGray,
    gap: SPACING[1],
  },
  statNo: {
    color: COLORS.inkMuted,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.ink,
    marginVertical: SPACING[1],
  },
  statKicker: {
    color: COLORS.caramel,
  },

  /* AI 使用情况 */
  aiBlock: {
    marginTop: SPACING[6],
  },
  aiCard: {
    marginTop: SPACING[3],
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
  },
  aiRow: {
    flexDirection: 'row',
    gap: SPACING[5],
  },
  aiItem: {
    flex: 1,
    gap: SPACING[2],
  },
  aiLabel: {
    color: COLORS.inkSoft,
  },
  aiBarWrap: {
    height: 4,
    backgroundColor: COLORS.mistGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  aiBar: {
    height: 4,
    backgroundColor: COLORS.caramel,
    borderRadius: 2,
  },
  aiCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.inkMuted,
  },

  /* 菜单 */
  menuBlock: {
    marginTop: SPACING[8],
  },
  menuList: {
    marginTop: SPACING[3],
  },
  menuItem: {
    paddingVertical: SPACING[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemBorder: {
    borderBottomWidth: HAIRLINE,
    borderBottomColor: COLORS.mistGray,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    flex: 1,
  },
  menuNo: {
    color: COLORS.inkMuted,
    minWidth: 32,
  },
  menuTitle: {
    color: COLORS.ink,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },

  /* 登出 */
  logoutWrap: {
    marginTop: SPACING[10],
    gap: SPACING[6],
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    justifyContent: 'center',
  },
  versionLine: {
    flex: 1,
    height: HAIRLINE,
    backgroundColor: COLORS.mistGray,
  },
  versionText: {
    color: COLORS.inkMuted,
  },
});

export default ProfileScreen;
