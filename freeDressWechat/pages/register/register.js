const { authApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    loading: false,
    codeSending: false,
    codeText: '获取验证码',
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  sendCode() {
    if (this.data.codeSending) return;
    const { phone } = this.data;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
    }
    
    this.setData({ codeSending: true });
    let seconds = 60;
    this.setData({ codeText: `${seconds}s` });
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        this.setData({ codeSending: false, codeText: '获取验证码' });
      } else {
        this.setData({ codeText: `${seconds}s` });
      }
    }, 1000);
  },

  async handleRegister() {
    const { phone, code, password, confirmPassword, nickname } = this.data;

    if (!phone.trim()) return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!/^1[3-9]\d{9}$/.test(phone)) return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    if (!code.trim()) return wx.showToast({ title: '请输入验证码', icon: 'none' });
    if (!password.trim() || password.length < 6) return wx.showToast({ title: '密码至少6位', icon: 'none' });
    if (password !== confirmPassword) return wx.showToast({ title: '两次密码不一致', icon: 'none' });

    this.setData({ loading: true });
    try {
      const res = await authApi.register({ phone, code, password, nickname: nickname || undefined });
      if (res.code === 200 || res.code === 201) {
        app.setAuth(res.data);
        wx.switchTab({ url: '/pages/home/home' });
      } else {
        wx.showToast({ title: res.message || '注册失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '注册失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
