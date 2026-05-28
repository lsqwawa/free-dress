const { clothesApi } = require('../../utils/api');
const { CLOTH_CATEGORIES } = require('../../utils/constants');

Page({
  data: {
    categories: CLOTH_CATEGORIES,
    activeCategory: 'ALL',
    clothes: [],
    filteredClothes: [],
    loading: true,
    refreshing: false,
    total: '00',
    searchOpen: false,
    searchQuery: '',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.fetchClothes();
  },

  async fetchClothes() {
    this.setData({ loading: true });
    try {
      const params = {};
      if (this.data.activeCategory !== 'ALL') {
        params.category = this.data.activeCategory;
      }
      const res = await clothesApi.getList(params);
      const clothes = (res.data || []).map(item => ({
        ...item,
        seasonText: item.season ? item.season.join(' · ') : '',
      }));
      this.setData({
        clothes,
        filteredClothes: this.filterClothes(clothes, this.data.searchQuery),
        total: String(clothes.length).padStart(2, '0'),
        loading: false,
      });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  filterClothes(list, query) {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(c =>
      (c.color && c.color.toLowerCase().includes(q)) ||
      (c.style && c.style.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
    );
  },

  switchCategory(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ activeCategory: value });
    this.fetchClothes();
  },

  toggleSearch() {
    const open = !this.data.searchOpen;
    this.setData({ searchOpen: open, searchQuery: '' });
    if (!open) {
      this.setData({ filteredClothes: this.data.clothes });
    }
  },

  onSearch(e) {
    const query = e.detail.value;
    this.setData({
      searchQuery: query,
      filteredClothes: this.filterClothes(this.data.clothes, query),
    });
  },

  clearSearch() {
    this.setData({ searchQuery: '', filteredClothes: this.data.clothes });
  },

  async onRefresh() {
    this.setData({ refreshing: true });
    await this.fetchClothes();
    this.setData({ refreshing: false });
  },

  handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除衣物',
      content: '确定要删除这件衣物吗？',
      confirmColor: '#8C4A3F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await clothesApi.remove(id);
            this.fetchClothes();
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  showDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.previewImage({ urls: [item.imageUrl], current: item.imageUrl });
  },

  goAddClothing() {
    wx.navigateTo({ url: '/pages/addClothing/addClothing' });
  },
});
