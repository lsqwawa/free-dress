const { outfitsApi, tryOnApi, uploadApi } = require('../../utils/api');
const { getVolText } = require('../../utils/date');

Page({
  data: {
    steps: [
      { no: '01', kicker: 'UPLOAD', label: '上传照片' },
      { no: '02', kicker: 'CHOOSE', label: '选择搭配' },
      { no: '03', kicker: 'COMPOSE', label: '生成效果' },
    ],
    activeStep: 0,
    volText: '',
    personUri: '',
    personUrl: '',
    uploading: false,
    outfits: [],
    outfitCount: '00',
    selectedOutfitId: '',
    isGenerating: false,
    currentResult: null,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.setData({ volText: getVolText() });
    this.fetchOutfits();
  },

  async fetchOutfits() {
    try {
      const res = await outfitsApi.getList();
      const outfits = (res.data || []).map(o => ({
        ...o,
        clothCount: o.outfitClothes?.length || 0,
      }));
      this.setData({ outfits, outfitCount: String(outfits.length).padStart(2, '0') });
    } catch (e) { console.error(e); }
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ personUri: tempFilePath, uploading: true });
        try {
          const uploadRes = await uploadApi.image(tempFilePath);
          this.setData({ personUrl: uploadRes.data.url, activeStep: this.data.selectedOutfitId ? 2 : 1 });
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' });
          this.setData({ personUri: '' });
        } finally {
          this.setData({ uploading: false });
        }
      }
    });
  },

  removePhoto() {
    this.setData({ personUri: '', personUrl: '', activeStep: 0 });
  },

  selectOutfit(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedOutfitId: id,
      activeStep: this.data.personUrl ? 2 : 1,
    });
  },

  async handleGenerate() {
    if (!this.data.personUrl) return wx.showToast({ title: '请先上传照片', icon: 'none' });
    if (!this.data.selectedOutfitId) return wx.showToast({ title: '请选择搭配', icon: 'none' });

    this.setData({ isGenerating: true });
    try {
      const res = await tryOnApi.generate({
        personImageUrl: this.data.personUrl,
        outfitId: this.data.selectedOutfitId,
      });
      this.setData({ currentResult: res.data });
    } catch (e) {
      wx.showToast({ title: e.message || '生成失败', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },
});
