const { authApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    captchaAnswer: '',
    captchaSvg: '',
    captchaId: '',
    loading: false,
    captchaLoading: false,
  },

  onLoad() {
    this.refreshCaptcha();
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  onCaptchaInput(e) {
    this.setData({ captchaAnswer: e.detail.value });
  },

  async refreshCaptcha() {
    this.setData({ captchaLoading: true });
    try {
      const res = await authApi.getCaptcha();
      if (res.code === 200 && res.data) {
        this.setData({
          captchaSvg: res.data.svg,
          captchaId: res.data.captchaId,
          captchaAnswer: '',
        });
      }
    } catch (e) {
      wx.showToast({ title: '获取验证码失败', icon: 'none' });
    } finally {
      this.setData({ captchaLoading: false });
    }
  },

  async handleSubmit() {
    const { phone, password, captchaAnswer, captchaId } = this.data;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    }
    if (!password || password.length < 6 || password.length > 20) {
      return wx.showToast({ title: '密码须为6-20位', icon: 'none' });
    }
    if (!captchaAnswer.trim()) {
      return wx.showToast({ title: '请输入验证码', icon: 'none' });
    }

    this.setData({ loading: true });
    try {
      const res = await authApi.bindPhone({
        phone,
        password,
        captchaId,
        captchaAnswer,
      });
      if (res.code === 200) {
        // 更新本地登录态
        app.setAuth(res.data);
        wx.showToast({ title: '绑定成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 800);
      } else {
        wx.showToast({ title: res.message || '绑定失败', icon: 'none' });
        this.refreshCaptcha();
      }
    } catch (err) {
      wx.showToast({ title: err.message || '绑定失败', icon: 'none' });
      this.refreshCaptcha();
    } finally {
      this.setData({ loading: false });
    }
  },
});
