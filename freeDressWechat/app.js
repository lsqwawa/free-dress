/**
 * FreeDress 畅搭 · 小程序入口
 */
App({
  globalData: {
    userInfo: null,
    accessToken: '',
    refreshToken: '',
    baseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    // 检查登录态
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.globalData.accessToken = token;
      this.globalData.refreshToken = wx.getStorageSync('refresh_token') || '';
      this.globalData.userInfo = wx.getStorageSync('user_info') || null;
    }
  },

  /**
   * 设置认证信息
   */
  setAuth(data) {
    this.globalData.accessToken = data.accessToken;
    this.globalData.refreshToken = data.refreshToken;
    this.globalData.userInfo = data.user;
    wx.setStorageSync('access_token', data.accessToken);
    wx.setStorageSync('refresh_token', data.refreshToken);
    wx.setStorageSync('user_info', data.user);
  },

  /**
   * 清除认证信息
   */
  clearAuth() {
    this.globalData.accessToken = '';
    this.globalData.refreshToken = '';
    this.globalData.userInfo = null;
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('refresh_token');
    wx.removeStorageSync('user_info');
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!this.globalData.accessToken;
  }
});
