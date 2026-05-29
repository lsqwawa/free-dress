const { membershipApi } = require('../../utils/api');

Page({
  data: {
    info: null,
    plans: [],
    selectedPlan: '',
    loading: false,
    planTitle: '',
    daysLabel: '',
    benefitsList: [],
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      const [infoRes, plansRes] = await Promise.all([
        membershipApi.getInfo(),
        membershipApi.getPlans(),
      ]);
      const info = infoRes.data || {};
      const plans = plansRes.data || [];
      const benefitsList = (info.benefits || []).map((b) => ({
        text: b,
        active: !!info.isVip,
      }));
      this.setData({
        info,
        plans,
        benefitsList,
        planTitle: info.isVip ? (info.plan === 'MONTHLY' ? 'VIP月卡' : 'SVIP年卡') : '免费版',
        daysLabel: info.isVip
          ? `剩余 ${info.daysRemaining || 0} 天 · 到期 ${(info.expiresAt || '').split('T')[0]}`
          : '升级 VIP 解锁更多 AI 能力',
      });
    } catch (e) {
      // 静默
    }
  },

  onSelectPlan(e) {
    this.setData({ selectedPlan: e.currentTarget.dataset.id });
  },

  async handleSubscribe() {
    if (!this.data.selectedPlan) {
      return wx.showToast({ title: '请选择套餐', icon: 'none' });
    }
    this.setData({ loading: true });
    try {
      await membershipApi.subscribe({ plan: this.data.selectedPlan });
      wx.showModal({
        title: '开通成功',
        content: '恭喜成为 VIP 会员！',
        showCancel: false,
        success: () => this.loadData(),
      });
    } catch (err) {
      wx.showToast({ title: err.message || '开通失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
