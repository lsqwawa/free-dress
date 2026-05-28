Component({
  data: {
    selected: 0,
    indicatorLeft: 0,
    indicatorWidth: 0,
    list: [
      { pagePath: '/pages/home/home', text: 'HOME', iconPath: '/assets/icons/home.svg', selectedIconPath: '/assets/icons/home-active.svg' },
      { pagePath: '/pages/wardrobe/wardrobe', text: '衣橱', iconPath: '/assets/icons/wardrobe.svg', selectedIconPath: '/assets/icons/wardrobe-active.svg' },
      { pagePath: '/pages/tryon/tryon', text: '试穿', iconPath: '/assets/icons/tryon.svg', selectedIconPath: '/assets/icons/tryon-active.svg' },
      { pagePath: '/pages/outfit/outfit', text: '搭配', iconPath: '/assets/icons/outfit.svg', selectedIconPath: '/assets/icons/outfit-active.svg' },
      { pagePath: '/pages/profile/profile', text: '我的', iconPath: '/assets/icons/profile.svg', selectedIconPath: '/assets/icons/profile-active.svg' },
    ]
  },

  attached() {
    this.updateIndicator(this.data.selected);
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      if (index === this.data.selected) return;
      
      this.setData({ selected: index });
      this.updateIndicator(index);
      
      wx.switchTab({ url: path });
    },

    updateIndicator(index) {
      const query = this.createSelectorQuery();
      query.select('.tab-items').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          const itemWidth = res[0].width / 5;
          this.setData({
            indicatorLeft: itemWidth * index + itemWidth * 0.25,
            indicatorWidth: itemWidth * 0.5,
          });
        }
      });
    }
  }
});
