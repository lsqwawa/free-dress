Page({
  data: {
    settings: [
      { no: '01', title: '修改密码', subtitle: '定期更换密码更安全', icon: '🔒', action: 'changePassword' },
      { no: '02', title: '清除缓存', subtitle: '释放存储空间', icon: '🗑', action: 'clearCache' },
      { no: '03', title: '隐私政策', subtitle: '', icon: '⛨', action: 'privacy' },
      { no: '04', title: '关于畅搭', subtitle: 'v1.0.0', icon: 'ⓘ', action: 'about' },
      { no: '05', title: '注销账号', subtitle: '', icon: '⊗', action: 'deleteAccount', danger: true },
    ],
  },

  onItemTap(e) {
    const action = e.currentTarget.dataset.action;
    switch (action) {
      case 'changePassword':
        wx.navigateTo({ url: '/pages/changePassword/changePassword' });
        break;
      case 'clearCache':
        this.handleClearCache();
        break;
      case 'privacy':
        wx.showModal({
          title: '隐私政策',
          content: '我们重视你的隐私，所有数据仅用于提供穿搭服务，不会分享给第三方。',
          showCancel: false,
        });
        break;
      case 'about':
        wx.showModal({
          title: '关于畅搭',
          content: '畅搭（FreeDress）v1.0.0\n面向年轻人的智能 AI 穿搭工具\n让每一天都穿出自信',
          showCancel: false,
        });
        break;
      case 'deleteAccount':
        this.handleDeleteAccount();
        break;
    }
  },

  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？不会影响你的账号数据。',
      success: (res) => {
        if (res.confirm) {
          // 仅清理图片/历史等临时缓存键（保留登录态）
          try {
            wx.removeStorageSync('outfitDraft');
            wx.removeStorageSync('tryonDraft');
          } catch (e) {}
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      },
    });
  },

  handleDeleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销后你的所有数据将被永久删除，且无法恢复。确定要注销吗？',
      confirmText: '确认注销',
      confirmColor: '#8C4A3F',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '功能即将上线，请联系客服', icon: 'none' });
        }
      },
    });
  },

  goBack() {
    wx.navigateBack();
  },
});
