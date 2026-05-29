const { authApi } = require('../../utils/api');

Page({
  data: {
    phone: '',
    captchaAnswer: '',
    captchaId: '',
    captchaSvg: '',
    captchaLoading: false,
    loading: false,
  },

  onLoad() {
    this.loadCaptcha();
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async loadCaptcha() {
    if (this.data.captchaLoading) return;
    this.setData({ captchaLoading: true, captchaAnswer: '' });
    try {
      const res = await authApi.getCaptcha();
      this.setData({
        captchaId: res.data.captchaId,
        captchaSvg: res.data.image,
      });
    } catch (e) {
      wx.showToast({ title: '获取验证码失败', icon: 'none' });
    } finally {
      this.setData({ captchaLoading: false });
    }
  },

  refreshCaptcha() {
    this.loadCaptcha();
  },

  async handleSubmit() {
    const { phone, captchaId, captchaAnswer } = this.data;

    if (!phone.trim()) return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!/^1[3-9]\d{9}$/.test(phone)) return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    if (!captchaAnswer.trim()) return wx.showToast({ title: '请输入验证码', icon: 'none' });

    this.setData({ loading: true });
    try {
      const res = await authApi.forgotPassword({ phone, captchaId, captchaAnswer });
      if (res.code === 200) {
        const resetToken = res.data.resetToken;
        wx.redirectTo({ url: `/pages/resetPassword/resetPassword?resetToken=${encodeURIComponent(resetToken)}` });
      } else {
        wx.showToast({ title: res.message || '验证失败', icon: 'none' });
        this.loadCaptcha();
      }
    } catch (err) {
      wx.showToast({ title: err.message || '验证失败', icon: 'none' });
      this.loadCaptcha();
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
