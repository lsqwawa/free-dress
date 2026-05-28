const { authApi } = require('../../utils/api');
const { getLoginVolText, getIssueNo } = require('../../utils/date');
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    loading: false,
    volText: '',
    issueNo: ''
  },

  onLoad() {
    this.setData({ volText: getLoginVolText(), issueNo: getIssueNo() });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async handleLogin() {
    const { phone, password } = this.data;
    
    if (!phone.trim()) {
      return wx.showToast({ title: '请输入手机号', icon: 'none' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    }
    if (!password.trim()) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }

    this.setData({ loading: true });
    try {
      const res = await authApi.login(phone, password);
      if (res.code === 200) {
        app.setAuth(res.data);
        wx.switchTab({ url: '/pages/home/home' });
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  goToForgotPassword() {
    wx.showToast({ title: '功能即将开放', icon: 'none' });
  }
});
