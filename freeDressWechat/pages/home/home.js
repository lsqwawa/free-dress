const { clothesApi } = require('../../utils/api');
const { getEditorialDate, getIssueText, getDayNumber, getIssueNo } = require('../../utils/date');
const app = getApp();

Page({
  data: {
    pieceCount: '00',
    editorialDate: '',
    issueText: '',
    issueNo: '',
    dayNum: '',
    recommendList: [
      { id: 'r1', title: '微凉清晨', caption: '一件燕麦色风衣，搭配奶茶卡其裤与白T，温柔而克制。', style: '简约' },
      { id: 'r2', title: '都市信差', caption: '深咖针织、烟管裤、猎装外套——把通勤穿成展。', style: '商务' },
      { id: 'r3', title: '海岸闲信', caption: '亚麻衬衫与卷边短裤，把风带进每一次呼吸。', style: '度假' },
    ],
    radioList: [
      { id: 'rd1', style: '休闲', pieces: 12, caption: '日常穿衣的一只懒猫' },
      { id: 'rd2', style: '商务', pieces: 8, caption: '会议室也是 T 台' },
      { id: 'rd3', style: '复古', pieces: 6, caption: '从 70 年代走出来' },
      { id: 'rd4', style: '街头', pieces: 9, caption: '把街道穿成主场' },
    ],
  },

  onShow() {
    // 更新 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    // 动态日期
    this.setData({
      editorialDate: getEditorialDate(),
      issueText: getIssueText(),
      issueNo: getIssueNo(),
      dayNum: String(getDayNumber()),
    });
    // 检查登录态
    if (!app.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.fetchPieceCount();
  },

  async fetchPieceCount() {
    try {
      const res = await clothesApi.getCategoryStats();
      const stats = res.data;
      const total = (stats.TOP || 0) + (stats.BOTTOM || 0) + (stats.COAT || 0) + (stats.ACCESSORY || 0) + (stats.SHOE || 0);
      this.setData({ pieceCount: String(total).padStart(2, '0') });
    } catch (e) {
      console.error('获取统计失败', e);
    }
  },

  goWardrobe() { wx.switchTab({ url: '/pages/wardrobe/wardrobe' }); },
  goOutfit() { wx.switchTab({ url: '/pages/outfit/outfit' }); },
  goTryon() { wx.switchTab({ url: '/pages/tryon/tryon' }); },
  goProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
});
