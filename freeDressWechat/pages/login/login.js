const { authApi } = require('../../utils/api');
const { getLoginVolText, getIssueNo } = require('../../utils/date');
const app = getApp();

Page({
  data: {
    phone: '',
    password: '',
    loading: false,
    wechatLoading: false,
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
      // 尝试在登录时一并取微信 code（用于自动绑定，失败不阻塞）
      let wechatCode = null;
      try {
        const lr = await new Promise((resolve) => {
          wx.login({ success: (r) => resolve(r), fail: () => resolve(null) });
        });
        if (lr && lr.code) wechatCode = lr.code;
      } catch (_) {}

      const res = await authApi.login(phone, password, wechatCode);
      if (res.code === 200) {
        app.setAuth(res.data);
        // 自动绑定结果提示
        if (res.data && res.data.autoBindResult === 'OK') {
          wx.showToast({ title: '已自动绑定微信', icon: 'success', duration: 1500 });
        } else if (res.data && res.data.autoBindResult === 'CONFLICT') {
          wx.showToast({ title: '当前微信已绑其他账号', icon: 'none', duration: 2000 });
        }
        setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 微信一键登录
   * - 先调用 wx.login 拿 code
   * - 调用后端 /auth/wechat/mp-login
   * - 若返回 needBindPhone=true，提示用户后续可在账号安全中绑定
   */
  async handleWechatLogin() {
    this.setData({ wechatLoading: true });
    try {
      // 拿头像/昵称（可选，失败不阻塞）
      let userInfo = null;
      try {
        const ui = await new Promise((resolve) => {
          if (!wx.getUserProfile) return resolve(null);
          wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (r) => resolve(r.userInfo),
            fail: () => resolve(null),
          });
        });
        if (ui) userInfo = { nickname: ui.nickName, avatarUrl: ui.avatarUrl };
      } catch (_) {}

      const lr = await new Promise((resolve, reject) => {
        wx.login({ success: (r) => resolve(r), fail: (e) => reject(e) });
      });
      if (!lr || !lr.code) {
        return wx.showToast({ title: '获取微信授权失败', icon: 'none' });
      }

      const res = await authApi.wechatMpLogin({
        code: lr.code,
        nickname: userInfo && userInfo.nickname,
        avatarUrl: userInfo && userInfo.avatarUrl,
      });
      if (res.code === 200) {
        app.setAuth(res.data);
        if (res.data && res.data.user && res.data.user.needBindPhone) {
          wx.showModal({
            title: '提示',
            content: '当前账号尚未绑定手机号，是否前往绑定？',
            confirmText: '去绑定',
            cancelText: '稍后',
            success: (m) => {
              if (m.confirm) {
                wx.navigateTo({ url: '/pages/bindPhone/bindPhone' });
              } else {
                wx.switchTab({ url: '/pages/home/home' });
              }
            },
          });
        } else {
          wx.switchTab({ url: '/pages/home/home' });
        }
      } else {
        wx.showToast({ title: res.message || '微信登录失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '微信登录失败', icon: 'none' });
    } finally {
      this.setData({ wechatLoading: false });
    }
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  goToForgotPassword() {
    wx.navigateTo({ url: '/pages/forgotPassword/forgotPassword' });
  }
});
