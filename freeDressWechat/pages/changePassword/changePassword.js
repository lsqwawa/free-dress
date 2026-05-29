const { authApi } = require('../../utils/api');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async handleSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return wx.showToast({ title: '请填写所有字段', icon: 'none' });
    }
    if (newPassword.length < 6) {
      return wx.showToast({ title: '新密码至少6位', icon: 'none' });
    }
    if (newPassword !== confirmPassword) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    this.setData({ loading: true });
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      wx.showModal({
        title: '成功',
        content: '密码修改成功',
        showCancel: false,
        success: () => wx.navigateBack(),
      });
    } catch (err) {
      wx.showToast({ title: err.message || '修改失败，请检查旧密码', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
