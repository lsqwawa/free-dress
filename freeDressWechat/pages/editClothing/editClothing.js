const { clothesApi, uploadApi } = require('../../utils/api');
const { CLOTH_CATEGORIES, STYLE_OPTIONS, SEASON_OPTIONS } = require('../../utils/constants');

Page({
  data: {
    clothId: '',
    imageUri: '',
    imageUrl: '',
    category: '',
    color: '',
    style: '',
    tags: '',
    selectedSeasons: [],
    // 过滤掉 ALL，只展示真实分类
    categories: CLOTH_CATEGORIES.filter((c) => c.value !== 'ALL'),
    styles: STYLE_OPTIONS,
    seasons: SEASON_OPTIONS,
    loading: true,
    submitting: false,
  },

  onLoad(options) {
    const clothId = options.clothId || '';
    this.setData({ clothId });
    if (clothId) {
      this.loadCloth(clothId);
    } else {
      this.setData({ loading: false });
    }
  },

  async loadCloth(id) {
    try {
      const res = await clothesApi.getById(id);
      const cloth = res.data || {};
      this.setData({
        imageUrl: cloth.imageUrl || '',
        category: cloth.category || '',
        color: cloth.color || '',
        style: cloth.style || '',
        selectedSeasons: cloth.season || [],
        tags: (cloth.tags || []).join(', '),
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
    } finally {
      this.setData({ loading: false });
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ imageUri: res.tempFiles[0].tempFilePath, imageUrl: '' });
      },
    });
  },

  removePhoto() {
    this.setData({ imageUri: '', imageUrl: '' });
  },

  selectCategory(e) {
    this.setData({ category: e.currentTarget.dataset.value });
  },

  selectStyle(e) {
    const v = e.currentTarget.dataset.value;
    this.setData({ style: this.data.style === v ? '' : v });
  },

  toggleSeason(e) {
    const v = e.currentTarget.dataset.value;
    let arr = this.data.selectedSeasons.slice();
    const i = arr.indexOf(v);
    if (i > -1) arr.splice(i, 1); else arr.push(v);
    this.setData({ selectedSeasons: arr });
  },

  async handleSubmit() {
    if (!this.data.category) return wx.showToast({ title: '请选择分类', icon: 'none' });

    this.setData({ submitting: true });
    try {
      let finalImageUrl = this.data.imageUrl;
      if (this.data.imageUri) {
        const uploadRes = await uploadApi.image(this.data.imageUri);
        finalImageUrl = uploadRes.data.url;
      }
      const payload = {
        imageUrl: finalImageUrl || undefined,
        category: this.data.category,
        color: this.data.color || undefined,
        style: this.data.style || undefined,
        season: this.data.selectedSeasons.length > 0 ? this.data.selectedSeasons : undefined,
        tags: this.data.tags ? this.data.tags.split(/[,，\s]+/).filter(Boolean) : undefined,
      };
      await clothesApi.update(this.data.clothId, payload);
      wx.showModal({
        title: '成功',
        content: '衣物已更新',
        showCancel: false,
        success: () => wx.navigateBack(),
      });
    } catch (err) {
      wx.showToast({ title: err.message || '更新失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goBack() {
    wx.navigateBack();
  },
});
