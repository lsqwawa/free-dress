# 畅搭 FreeDress - React Native App

> 🎭 智能衣物搭配平台，让穿搭更简单

畅搭是一款基于 React Native 的移动应用，帮助用户管理衣橱、获取智能搭配建议，并通过AI试穿功能预览穿搭效果。

## 功能特性

### 🏠 首页
- 欢迎界面和快捷入口
- 今日推荐搭配展示
- 热门搭配浏览

### 🗄️ 衣橱管理
- 衣物上传与分类
- 按类型筛选（上衣、下装、外套、配饰、鞋子）
- 衣物标签管理

### 👔 智能搭配
- AI 智能生成搭配方案
- 根据季节、场合推荐搭配
- 搭配收藏功能

### 🤖 AI 试穿
- 上传人物照片
- AI 合成试穿效果
- 试穿历史记录

### 👤 个人中心
- 用户信息管理
- 统计数据展示
- 收藏管理

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native | 0.85.3 |
| 语言 | TypeScript | 5.8.3 |
| 状态管理 | Zustand | 5.0.13 |
| 导航 | React Navigation | 7.x |
| 图标 | React Native Vector Icons | 10.3.0 |
| 图片选择 | React Native Image Picker | 8.2.1 |
| 动画 | React Native Reanimated | 4.3.1 |
| 列表 | Shopify Flash List | 2.3.1 |
| HTTP | Axios | 1.16.0 |
| 存储 | Async Storage | 1.24.0 |

## 快速开始

### 环境要求

- Node.js >= 22.11.0
- JDK 17（Android）
- Xcode >= 15（iOS）
- Android Studio（Android）

### 安装依赖

```bash
cd FreeDressApp
npm install
```

### iOS 配置

```bash
# 安装 CocoaPods
bundle install
bundle exec pod install
```

### 启动开发服务器

```bash
# 启动 Metro 服务器
npm start

# Android
npm run android

# iOS
npm run ios
```

## 项目结构

```
src/
├── components/          # 自定义UI组件
│   ├── Button.tsx       # 按钮组件
│   ├── Input.tsx        # 输入框组件
│   ├── Card.tsx         # 卡片组件
│   ├── Stack.tsx        # 布局组件(HStack/VStack)
│   ├── Badge.tsx        # 徽章组件
│   └── index.ts         # 组件导出
├── screens/             # 屏幕组件
│   ├── HomeScreen.tsx   # 首页
│   ├── LoginScreen.tsx  # 登录页
│   ├── RegisterScreen.tsx # 注册页
│   ├── WardrobeScreen.tsx # 衣橱页
│   ├── OutfitScreen.tsx # 搭配页
│   ├── TryOnScreen.tsx  # 试穿页
│   └── ProfileScreen.tsx # 个人中心
├── navigation/          # 导航配置
│   ├── RootNavigator.tsx
│   └── MainTabNavigator.tsx
├── api/                 # API 请求
│   ├── auth.ts          # 认证相关
│   └── axios.ts         # Axios 配置
├── store/               # 状态管理
│   └── authStore.ts     # 认证状态
├── types/               # 类型定义
│   └── index.ts
├── constants/           # 常量配置
│   └── index.ts
└── App.tsx              # 根组件
```

## 自定义组件

### Button

```tsx
<Button 
  variant="solid"    // solid | outline | ghost
  colorScheme="orange" // orange | gray | red | blue
  size="md"          // sm | md | lg
  onPress={() => {}}
>
  按钮文字
</Button>
```

### Input

```tsx
<Input
  placeholder="请输入"
  value={value}
  onChangeText={(text) => setValue(text)}
  variant="outline"  // outline | filled | unstyled
  error={false}
/>
```

### Card

```tsx
<Card 
  borderRadius={12}
  bg="white"
  style={{ padding: 16 }}
>
  卡片内容
</Card>
```

### HStack / VStack

```tsx
<HStack space={3} justifyContent="space-between">
  <Text>项目1</Text>
  <Text>项目2</Text>
</HStack>

<VStack space={2} alignItems="center">
  <Text>项目1</Text>
  <Text>项目2</Text>
</VStack>
```

## 配置

### API 配置

在 `src/api/axios.ts` 中配置后端 API 地址：

```ts
const baseURL = 'http://localhost:3000/api';
```

## 开发命令

```bash
npm start          # 启动 Metro 服务器
npm run android    # 运行 Android 应用
npm run ios        # 运行 iOS 应用
npm run lint       # 代码检查
npm test           # 运行测试
```

## 许可证

MIT License - 详见 LICENSE 文件