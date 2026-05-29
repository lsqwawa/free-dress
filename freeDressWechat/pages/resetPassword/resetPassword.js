const { authApi } = require('../../utils/api');

Page({
  data: {
    resetToken: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
  },

  onLoad(options) {
    this.setData({ resetToken: decodeURIComponent(options.resetToken || '') });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async handleReset() {
    const { resetToken, newPassword, confirmPassword } = this.data;

    if (!newPassword.trim()) return wx.showToast({ title: '请输入新密码', icon: 'none' });
    if (newPassword.length < 6) return wx.showToast({ title: '密码至少6位', icon: 'none' });
    if (newPassword !== confirmPassword) return wx.showToast({ title: '两次密码不一致', icon: 'none' });

    this.setData({ loading: true });
    try {
      const res = await authApi.resetPassword({ resetToken, newPassword });
      if (res.code === 200) {
        wx.showModal({
          title: '成功',
          content: '密码重置成功，请重新登录',
          showCancel: false,
          confirmText: '去登录',
          success: () => {
            wx.reLaunch({ url: '/pages/login/login' });
          },
        });
      } else {
        wx.showToast({ title: res.message || '重置失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '重置失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
