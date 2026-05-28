const { clothesApi, outfitsApi } = require('../../utils/api');
const { STYLE_OPTIONS } = require('../../utils/constants');
const { getVolText } = require('../../utils/date');

Page({
  data: {
    styleIntents: STYLE_OPTIONS,
    intents: [],
    allClothes: [],
    selectedClothes: [],
    selectedCount: '00',
    currentOutfit: null,
    generating: false,
    pickerVisible: false,
    volText: '',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.setData({ volText: getVolText() });
    this.fetchClothes();
  },

  async fetchClothes() {
    try {
      const res = await clothesApi.getList();
      const clothes = (res.data || []).map(item => ({ ...item, selected: false }));
      this.setData({ allClothes: clothes });
    } catch (e) { console.error(e); }
  },

  toggleIntent(e) {
    const intent = e.currentTarget.dataset.intent;
    let { intents } = this.data;
    const idx = intents.indexOf(intent);
    if (idx > -1) { intents.splice(idx, 1); } else { intents.push(intent); }
    this.setData({ intents: [...intents] });
  },

  openPicker() { this.setData({ pickerVisible: true }); },
  closePicker() { this.setData({ pickerVisible: false }); },

  toggleCloth(e) {
    const id = e.currentTarget.dataset.id;
    let { allClothes } = this.data;
    allClothes = allClothes.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
    const selected = allClothes.filter(c => c.selected);
    this.setData({
      allClothes,
      selectedClothes: selected,
      selectedCount: String(selected.length).padStart(2, '0'),
    });
  },

  removeCloth(e) {
    const id = e.currentTarget.dataset.id;
    let { allClothes } = this.data;
    allClothes = allClothes.map(c => c.id === id ? { ...c, selected: false } : c);
    const selected = allClothes.filter(c => c.selected);
    this.setData({
      allClothes,
      selectedClothes: selected,
      selectedCount: String(selected.length).padStart(2, '0'),
    });
  },

  clearSelection() {
    let { allClothes } = this.data;
    allClothes = allClothes.map(c => ({ ...c, selected: false }));
    this.setData({ allClothes, selectedClothes: [], selectedCount: '00' });
  },

  async handleGenerate() {
    const { selectedClothes, intents } = this.data;
    if (selectedClothes.length === 0) {
      return wx.showToast({ title: '请先选择衣物', icon: 'none' });
    }
    this.setData({ generating: true });
    try {
      const res = await outfitsApi.create({
        clothIds: selectedClothes.map(c => c.id),
        style: intents.join('、') || undefined,
        aiDescription: `以${selectedClothes.length}件衣物组成的${intents.join('、') || '日常'}搭配`,
      });
      this.setData({ currentOutfit: { ...res.data, clothes: selectedClothes } });
    } catch (e) {
      wx.showToast({ title: e.message || '创建失败', icon: 'none' });
    } finally {
      this.setData({ generating: false });
    }
  },

  async handleFavorite() {
    if (!this.data.currentOutfit) return;
    try {
      await outfitsApi.toggleFavorite(this.data.currentOutfit.id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  goTryon() { wx.switchTab({ url: '/pages/tryon/tryon' }); },
});
