const { authApi, userApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    user: null,
    loading: false,
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      // /users/profile 返回用户基本资料，包含绑定状态字段
      const res = await userApi.getProfile();
      if (res.code === 200 && res.data) {
        this.setData({ user: res.data });
        // 同步到全局
        app.globalData.userInfo = Object.assign({}, app.globalData.userInfo, res.data);
        wx.setStorageSync('userInfo', app.globalData.userInfo);
      }
    } catch (e) {
      // 兜底使用本地缓存
      const cached = app.globalData.userInfo || wx.getStorageSync('userInfo');
      if (cached) this.setData({ user: cached });
    }
  },

  goBindPhone() {
    wx.navigateTo({ url: '/pages/bindPhone/bindPhone' });
  },

  goChangePassword() {
    wx.navigateTo({ url: '/pages/changePassword/changePassword' });
  },

  async handleBindWechat() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const lr = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      if (!lr || !lr.code) throw new Error('获取微信授权失败');
      const res = await authApi.bindWechatMp({ code: lr.code });
      if (res.code === 200) {
        wx.showToast({ title: '绑定成功', icon: 'success' });
        this.loadProfile();
      } else {
        wx.showToast({ title: res.message || '绑定失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '绑定失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleUnbindWechat() {
    const { user } = this.data;
    if (!user || !user.hasPhone) {
      return wx.showToast({ title: '请先绑定手机号', icon: 'none' });
    }
    wx.showModal({
      title: '解绑微信',
      content: '解绑后将无法使用微信一键登录，确定继续吗？',
      success: async (m) => {
        if (!m.confirm) return;
        try {
          const res = await authApi.unbindWechat('MP');
          if (res.code === 200) {
            wx.showToast({ title: '解绑成功', icon: 'success' });
            this.loadProfile();
          } else {
            wx.showToast({ title: res.message || '解绑失败', icon: 'none' });
          }
        } catch (err) {
          wx.showToast({ title: err.message || '解绑失败', icon: 'none' });
        }
      },
    });
  },
});
