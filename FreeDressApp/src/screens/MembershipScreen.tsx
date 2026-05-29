import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  ScreenHeader,
  Section,
  Button,
  KickerText,
  SerifTitle,
  BodyText,
  MonoText,
  CaptionText,
} from '../components';
import { GrainOverlay } from '../theme/grain';
import { COLORS, SPACING, HAIRLINE, FONT_SIZES, RADIUS } from '../constants';
import apiClient from '../api/axios';

interface MembershipInfo {
  isVip: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  benefits: string[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  benefits: string[];
  tag: string;
}

export default function MembershipScreen() {
  const navigation = useNavigation<any>();
  const [info, setInfo] = useState<MembershipInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [infoRes, plansRes] = await Promise.all([
        apiClient.get('/membership'),
        apiClient.get('/membership/plans'),
      ]);
      setInfo((infoRes as any).data);
      setPlans((plansRes as any).data);
    } catch (e) {
      // 静默失败
    }
  };

  const handleSubscribe = useCallback(async () => {
    if (!selectedPlan) {
      Alert.alert('提示', '请选择一个套餐');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/membership/subscribe', { plan: selectedPlan });
      Alert.alert('开通成功', '恭喜成为VIP会员！', [
        { text: '好的', onPress: () => loadData() },
      ]);
    } catch (e: any) {
      Alert.alert('开通失败', e.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selectedPlan]);

  return (
    <View style={styles.root}>
      <GrainOverlay />
      <ScreenHeader
        kicker="MEMBERSHIP"
        title="会员中心"
        leftSlot={
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </Pressable>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 当前状态 */}
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <KickerText style={styles.statusKicker}>CURRENT STATUS</KickerText>
            <View style={[styles.badge, info?.isVip ? styles.badgeVip : styles.badgeFree]}>
              <MonoText style={styles.badgeText}>
                {info?.isVip ? 'VIP' : 'FREE'}
              </MonoText>
            </View>
          </View>
          {info?.isVip ? (
            <View style={styles.statusInfo}>
              <SerifTitle style={styles.statusTitle}>
                {info.plan === 'MONTHLY' ? 'VIP月卡' : 'SVIP年卡'}
              </SerifTitle>
              <CaptionText style={styles.statusExpiry}>
                剩余 {info.daysRemaining} 天 · 到期 {info.expiresAt?.split('T')[0]}
              </CaptionText>
            </View>
          ) : (
            <View style={styles.statusInfo}>
              <SerifTitle style={styles.statusTitle}>免费版</SerifTitle>
              <CaptionText style={styles.statusExpiry}>
                升级VIP解锁更多AI能力
              </CaptionText>
            </View>
          )}
        </View>

        {/* 权益列表 */}
        <Section kicker="BENEFITS" title="当前权益" />
        <View style={styles.benefitsList}>
          {(info?.benefits || []).map((b, idx) => (
            <View key={idx} style={styles.benefitItem}>
              <Feather
                name={info?.isVip ? 'check-circle' : 'circle'}
                size={14}
                color={info?.isVip ? COLORS.caramel : COLORS.clay}
              />
              <BodyText style={styles.benefitText}>{b}</BodyText>
            </View>
          ))}
        </View>

        {/* 套餐选择 */}
        {!info?.isVip && (
          <>
            <Section kicker="PLANS" title="选择套餐" />
            <View style={styles.plansRow}>
              {plans.map((plan) => (
                <Pressable
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardActive,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.tag && (
                    <View style={styles.planTag}>
                      <MonoText style={styles.planTagText}>{plan.tag}</MonoText>
                    </View>
                  )}
                  <SerifTitle style={styles.planName}>{plan.name}</SerifTitle>
                  <View style={styles.planPriceRow}>
                    <SerifTitle style={styles.planPrice}>¥{plan.price}</SerifTitle>
                    <CaptionText style={styles.planOriginal}>¥{plan.originalPrice}</CaptionText>
                  </View>
                  <CaptionText style={styles.planDuration}>{plan.duration}</CaptionText>
                </Pressable>
              ))}
            </View>

            <Button
              onPress={handleSubscribe}
              isLoading={loading}
              disabled={loading || !selectedPlan}
              style={styles.subscribeBtn}
            >
              {loading ? '开通中...' : '立即开通'}
            </Button>
            <CaptionText style={styles.disclaimer}>
              注：当前为演示版，实际需对接微信/支付宝支付
            </CaptionText>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ecru },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[20] },

  statusCard: {
    backgroundColor: COLORS.ink,
    padding: SPACING[5],
    marginTop: SPACING[4],
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusKicker: { color: COLORS.sand },
  badge: { paddingHorizontal: SPACING[3], paddingVertical: 2, borderRadius: RADIUS.sm },
  badgeVip: { backgroundColor: COLORS.caramel },
  badgeFree: { backgroundColor: COLORS.clay },
  badgeText: { color: COLORS.cream, fontSize: FONT_SIZES.xs },
  statusInfo: { marginTop: SPACING[4], gap: SPACING[2] },
  statusTitle: { color: COLORS.cream, fontSize: FONT_SIZES.xl },
  statusExpiry: { color: COLORS.sand },

  benefitsList: { marginTop: SPACING[3], gap: SPACING[3] },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] },
  benefitText: { fontSize: FONT_SIZES.base },

  plansRow: { flexDirection: 'row', gap: SPACING[3], marginTop: SPACING[4] },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderWidth: HAIRLINE,
    borderColor: COLORS.mistGray,
    padding: SPACING[4],
    alignItems: 'center',
    gap: SPACING[2],
    position: 'relative',
  },
  planCardActive: { borderColor: COLORS.caramel, borderWidth: 2 },
  planTag: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: COLORS.caramel,
    paddingHorizontal: SPACING[2],
    paddingVertical: 1,
  },
  planTagText: { color: COLORS.cream, fontSize: 9 },
  planName: { fontSize: FONT_SIZES.md },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING[2] },
  planPrice: { fontSize: FONT_SIZES.xl, color: COLORS.caramel },
  planOriginal: { textDecorationLine: 'line-through', color: COLORS.clay },
  planDuration: { color: COLORS.inkMuted },

  subscribeBtn: { marginTop: SPACING[6] },
  disclaimer: { textAlign: 'center', marginTop: SPACING[3], color: COLORS.clay },
});
