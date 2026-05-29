const { authApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
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

  async handleRegister() {
    const { phone, password, confirmPassword, nickname, captchaId, captchaAnswer } = this.data;

    if (!phone.trim()) return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!/^1[3-9]\d{9}$/.test(phone)) return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    if (!password.trim() || password.length < 6) return wx.showToast({ title: '密码至少6位', icon: 'none' });
    if (password !== confirmPassword) return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    if (!captchaAnswer.trim()) return wx.showToast({ title: '请输入验证码', icon: 'none' });

    this.setData({ loading: true });
    try {
      const res = await authApi.register({
        phone,
        password,
        captchaId,
        captchaAnswer,
        nickname: nickname || undefined,
      });
      if (res.code === 200 || res.code === 201) {
        app.setAuth(res.data);
        wx.switchTab({ url: '/pages/home/home' });
      } else {
        wx.showToast({ title: res.message || '注册失败', icon: 'none' });
        this.loadCaptcha();
      }
    } catch (err) {
      wx.showToast({ title: err.message || '注册失败', icon: 'none' });
      this.loadCaptcha();
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
