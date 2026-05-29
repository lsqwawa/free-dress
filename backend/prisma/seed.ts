import { PrismaClient, ClothCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 清理现有数据
  await prisma.tryOnResult.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.outfitCloth.deleteMany();
  await prisma.outfit.deleteMany();
  await prisma.cloth.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户
  const passwordHash = await bcrypt.hash('123456', 10);

  // 创建默认管理员
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      phone: 'admin',
      password: adminPasswordHash,
      nickname: '系统管理员',
      role: 'ADMIN',
    },
  });
  console.log(`✅ 创建管理员: ${admin.nickname} (phone=admin, password=admin123)`);

  const user1 = await prisma.user.create({
    data: {
      phone: '13800000001',
      password: passwordHash,
      nickname: '时尚编辑',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      phone: '13800000002',
      password: passwordHash,
      nickname: '搭配达人',
      role: 'VIP',
    },
  });

  console.log(`✅ 创建用户: ${user1.nickname}, ${user2.nickname}`);

  // 为 user1 创建衣物
  const clothesData = [
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-top-1.jpg',
      category: 'TOP' as ClothCategory,
      color: '白色',
      style: '简约',
      season: ['春', '夏'],
      tags: ['基础款', '百搭'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-top-2.jpg',
      category: 'TOP' as ClothCategory,
      color: '黑色',
      style: '商务',
      season: ['秋', '冬'],
      tags: ['正装', '衬衫'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-bottom-1.jpg',
      category: 'BOTTOM' as ClothCategory,
      color: '蓝色',
      style: '休闲',
      season: ['春', '夏', '秋'],
      tags: ['牛仔', '直筒'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-bottom-2.jpg',
      category: 'BOTTOM' as ClothCategory,
      color: '黑色',
      style: '商务',
      season: ['秋', '冬'],
      tags: ['西裤', '修身'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-coat-1.jpg',
      category: 'COAT' as ClothCategory,
      color: '灰色',
      style: '简约',
      season: ['秋', '冬'],
      tags: ['大衣', '羊毛'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-shoe-1.jpg',
      category: 'SHOE' as ClothCategory,
      color: '白色',
      style: '休闲',
      season: ['春', '夏', '秋'],
      tags: ['运动鞋', '百搭'],
    },
    {
      userId: user1.id,
      imageUrl: '/uploads/demo-acc-1.jpg',
      category: 'ACCESSORY' as ClothCategory,
      color: '棕色',
      style: '复古',
      season: ['春', '夏', '秋', '冬'],
      tags: ['皮带', '真皮'],
    },
  ];

  const clothes = await Promise.all(
    clothesData.map((data) => prisma.cloth.create({ data })),
  );

  console.log(`✅ 创建衣物: ${clothes.length} 件`);

  // 为 user1 创建搭配
  const outfit1 = await prisma.outfit.create({
    data: {
      userId: user1.id,
      style: '简约休闲',
      occasion: '日常出行',
      aiDescription: '白色T恤搭配蓝色牛仔裤，简约而不失格调，适合周末逛街或朋友聚会。',
      outfitClothes: {
        create: [
          { clothId: clothes[0].id, order: 0 },
          { clothId: clothes[2].id, order: 1 },
          { clothId: clothes[5].id, order: 2 },
        ],
      },
    },
  });

  const outfit2 = await prisma.outfit.create({
    data: {
      userId: user1.id,
      style: '商务通勤',
      occasion: '上班',
      aiDescription: '黑色衬衫搭配黑色西裤，干练利落，外搭灰色羊毛大衣提升质感。',
      outfitClothes: {
        create: [
          { clothId: clothes[1].id, order: 0 },
          { clothId: clothes[3].id, order: 1 },
          { clothId: clothes[4].id, order: 2 },
          { clothId: clothes[6].id, order: 3 },
        ],
      },
    },
  });

  console.log(`✅ 创建搭配: ${outfit1.style}, ${outfit2.style}`);

  // 为 user1 创建试穿记录
  await prisma.tryOnResult.create({
    data: {
      userId: user1.id,
      outfitId: outfit1.id,
      personImageUrl: '/uploads/demo-person.jpg',
      resultImageUrl: '/uploads/demo-person.jpg',
    },
  });

  console.log('✅ 创建试穿记录: 1 条');

  // 为 user2 创建收藏
  await prisma.favorite.create({
    data: {
      userId: user2.id,
      outfitId: outfit1.id,
    },
  });

  console.log('✅ 创建收藏记录: 1 条');

  console.log('🎉 数据播种完成！');
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
