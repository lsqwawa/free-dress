const { userApi, uploadApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    nickname: '',
    phone: '',
    avatarUrl: '',
    avatarUri: '',
    saving: false,
  },

  onLoad() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      nickname: userInfo.nickname || '',
      phone: userInfo.phone || '',
      avatarUrl: userInfo.avatarUrl || '',
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ avatarUri: tempFilePath });
      },
    });
  },

  async handleSave() {
    if (!this.data.nickname.trim()) {
      return wx.showToast({ title: '昵称不能为空', icon: 'none' });
    }

    this.setData({ saving: true });
    try {
      let avatarUrl = this.data.avatarUrl;
      if (this.data.avatarUri) {
        const uploadRes = await uploadApi.image(this.data.avatarUri);
        avatarUrl = uploadRes.data.url;
      }

      const res = await userApi.updateProfile({
        nickname: this.data.nickname.trim(),
        avatarUrl,
      });
      // 同步全局
      app.globalData.userInfo = { ...(app.globalData.userInfo || {}), ...res.data };
      wx.setStorageSync('userInfo', app.globalData.userInfo);

      wx.showModal({
        title: '成功',
        content: '资料已更新',
        showCancel: false,
        success: () => wx.navigateBack(),
      });
    } catch (err) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
