/**
 * 生成 TabBar 占位 PNG 图标
 * 由于 app.json 校验仅支持 .png/.jpg，但自定义 TabBar 实际使用 SVG
 * 此脚本生成 24x24 透明 PNG 作为占位
 */
const fs = require('fs');
const path = require('path');

// 最小合法 24x24 透明 PNG (base64)
const TINY_PNG_BASE64 = 
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAA' +
  'lwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vu' +
  'PBoAAAATSURBVEiJ7cEBDQAAAMKg909tDwcUAABeAwMYAAHiDuFfAAAAAElFTkSuQmCC';

const iconDir = path.join(__dirname, 'assets', 'icons');

const names = [
  'home.png', 'home-active.png',
  'wardrobe.png', 'wardrobe-active.png',
  'tryon.png', 'tryon-active.png',
  'outfit.png', 'outfit-active.png',
  'profile.png', 'profile-active.png',
];

// 确保目录存在
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const buf = Buffer.from(TINY_PNG_BASE64, 'base64');

names.forEach(name => {
  const filePath = path.join(iconDir, name);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ ${name} (${buf.length} bytes)`);
});

console.log('\nDone! PNG placeholders generated for app.json validation.');
console.log('Custom TabBar will use SVG files for actual rendering.');
