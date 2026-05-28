/**
 * 常量定义
 */
module.exports = {
  // 衣物分类
  CLOTH_CATEGORIES: [
    { value: 'ALL', label: '全部', kicker: 'ALL' },
    { value: 'TOP', label: '上衣', kicker: 'TOP' },
    { value: 'BOTTOM', label: '下装', kicker: 'BOTTOM' },
    { value: 'COAT', label: '外套', kicker: 'COAT' },
    { value: 'ACCESSORY', label: '配饰', kicker: 'ACC' },
    { value: 'SHOE', label: '鞋子', kicker: 'SHOES' },
  ],

  // 风格选项
  STYLE_OPTIONS: ['极简', '商务', '街头', '复古', '度假', '甜美', '中性', '运动', '优雅'],

  // 颜色选项
  COLOR_OPTIONS: ['黑色', '白色', '灰色', '红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色', '棕色', '米色'],

  // 季节选项
  SEASON_OPTIONS: ['春', '夏', '秋', '冬'],
};
