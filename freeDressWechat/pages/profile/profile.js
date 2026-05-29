const { userApi, tryOnApi } = require('../../utils/api');
const { getVolText, getCurrentYear } = require('../../utils/date');
const app = getApp();

Page({
  data: {
    userInfo: {},
    avatarChar: 'U',
    refreshing: false,
    volText: '',
    estYear: '',
    aiUsage: null,
    aiTryonPercent: 0,
    aiRecPercent: 0,
    stats: [
      { no: '01', kicker: 'PIECES', value: '00' },
      { no: '02', kicker: 'OUTFITS', value: '00' },
      { no: '03', kicker: 'SAVED', value: '00' },
      { no: '04', kicker: 'TRY-ONS', value: '00' },
    ],
    menuItems: [
      { no: '01', title: '收藏柜', icon: '♡', route: '/pages/favorites/favorites' },
      { no: '02', title: '搭配历史', icon: '⏱', route: '/pages/outfitHistory/outfitHistory' },
      { no: '03', title: '试穿记录', icon: '◑', route: '/pages/tryOnHistory/tryOnHistory' },
      { no: '04', title: '会员中心', icon: '✦', route: '/pages/membership/membership' },
      { no: '05', title: '设置', icon: '⚙', route: '/pages/settings/settings' },
      { no: '06', title: '帮助与反馈', icon: '?', route: '' },
    ],
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    const userInfo = app.globalData.userInfo || {};
    const avatarChar = (userInfo.nickname || 'U').charAt(0).toUpperCase();
    this.setData({
      userInfo,
      avatarChar,
      volText: getVolText(),
      estYear: `EST. ${getCurrentYear()}`,
    });
    this.fetchStats();
  },

  async fetchStats() {
    try {
      const res = await userApi.getStats();
      const d = res.data;
      this.setData({
        stats: [
          { no: '01', kicker: 'PIECES', value: String(d.clothesCount || 0).padStart(2, '0') },
          { no: '02', kicker: 'OUTFITS', value: String(d.outfitsCount || 0).padStart(2, '0') },
          { no: '03', kicker: 'SAVED', value: String(d.favoritesCount || 0).padStart(2, '0') },
          { no: '04', kicker: 'TRY-ONS', value: String(d.tryOnCount || 0).padStart(2, '0') },
        ]
      });
    } catch (e) { console.error('获取统计失败', e); }

    // AI 配额（失败不影响主流程）
    try {
      const quotaRes = await tryOnApi.getQuota();
      const aiUsage = quotaRes.data || null;
      if (aiUsage) {
        const tryonLimit = (aiUsage.tryon && aiUsage.tryon.limit) || 1;
        const recLimit = (aiUsage.recommend && aiUsage.recommend.limit) || 1;
        const tryonUsed = (aiUsage.tryon && aiUsage.tryon.used) || 0;
        const recUsed = (aiUsage.recommend && aiUsage.recommend.used) || 0;
        this.setData({
          aiUsage,
          aiTryonPercent: Math.min(100, Math.round((tryonUsed / tryonLimit) * 100)),
          aiRecPercent: Math.min(100, Math.round((recUsed / recLimit) * 100)),
        });
      }
    } catch (e) { /* 静默 */ }
  },

  async onRefresh() {
    this.setData({ refreshing: true });
    await this.fetchStats();
    this.setData({ refreshing: false });
  },

  onMenuTap(e) {
    const item = e.currentTarget.dataset.item;
    if (item.route) {
      wx.navigateTo({ url: item.route });
    } else {
      wx.showToast({ title: '功能即将开放', icon: 'none' });
    }
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/editProfile/editProfile' });
  },

  handleLogout() {
    wx.showModal({
      title: '退订本期',
      content: '您确定要登出本刊吗？',
      confirmText: '确定退订',
      confirmColor: '#8C4A3F',
      cancelText: '继续阅读',
      success: (res) => {
        if (res.confirm) {
          app.clearAuth();
          wx.redirectTo({ url: '/pages/login/login' });
        }
      }
    });
  },
});
