# 畅搭（FreeDress）- 智能衣物搭配平台

> 🎭 基于AI技术的智能穿搭应用，让穿搭变得简单有趣

畅搭（FreeDress）是一款基于AI技术的智能穿搭应用，帮助用户管理衣橱、获取智能搭配建议，并通过AI试穿功能预览穿搭效果。

## 📋 项目概述

- **核心价值**：解决用户日常穿搭难题，提供个性化、智能化的搭配建议
- **目标用户**：追求时尚、注重个人形象的人群
- **市场定位**：轻量级穿搭工具，结合AI技术提供差异化体验

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **移动端** | React Native | 0.85.3 |
| **语言** | TypeScript | 5.8.3 |
| **后端** | NestJS | 10.3.0 |
| **管理后台** | React + Vite | 18.3 / 5.4 |
| **数据库** | PostgreSQL | 16+ |
| **ORM** | Prisma | 5.7.0 |
| **认证** | JWT (Passport.js) | - |
| **状态管理** | Zustand（移动端） | 5.0.13 |
| **导航** | React Navigation | 7.x |

## 📁 项目结构

```
free-dress/
├── FreeDressApp/               # React Native 移动端应用
│   ├── src/
│   │   ├── api/                # API接口（auth / clothes / outfits / tryon / upload / users）
│   │   ├── components/         # 自定义UI组件
│   │   ├── constants/          # 常量配置
│   │   ├── navigation/         # 导航配置（RootNavigator / MainTab / WardrobeStack）
│   │   ├── screens/            # 页面组件
│   │   ├── services/           # 外部服务封装（微信SDK）
│   │   ├── store/              # Zustand 状态管理（auth / outfit / tryOn / wardrobe）
│   │   ├── theme/              # 主题与样式系统
│   │   └── types/              # 类型定义
│   ├── android/                # Android原生代码
│   ├── ios/                    # iOS原生代码
│   └── package.json
│
├── backend/                    # NestJS 后端服务
│   ├── src/
│   │   ├── main.ts             # 应用入口
│   │   ├── app.module.ts       # 根模块
│   │   ├── prisma/             # Prisma 数据库模块
│   │   ├── common/             # 公共工具（decorators / guards / interceptors / filters）
│   │   └── modules/
│   │       ├── auth/           # 认证模块（JWT / 微信登录 / 验证码 / 密码重置）
│   │       ├── users/          # 用户模块
│   │       ├── clothes/        # 衣物模块
│   │       ├── outfits/        # 搭配模块（含AI推荐）
│   │       ├── tryon/          # AI试穿模块（含配额管理）
│   │       ├── membership/     # 会员模块
│   │       ├── upload/         # 文件上传模块
│   │       └── admin/          # 管理后台API
│   ├── prisma/
│   │   └── schema.prisma       # 数据库模型
│   └── package.json
│
├── freedressBackWeb/           # 管理后台前端（React + Vite）
│   ├── src/
│   │   ├── api/                # API接口（auth / admin）
│   │   ├── components/         # UI组件库（Button / Card / Table / Dialog / Pagination 等）
│   │   ├── hooks/              # 自定义Hooks（useAuth）
│   │   ├── layouts/            # 布局组件（AdminLayout / AuthLayout）
│   │   ├── pages/              # 页面（dashboard / clothes / outfits / users / tryon / membership / system）
│   │   ├── store/              # Zustand 状态管理
│   │   └── types/              # TypeScript 类型定义
│   └── package.json
│
├── docs/                       # 项目文档
│   └── API.md                  # API接口与数据库模型文档
├── LICENSE                     # MIT许可证
└── README.md                   # 项目说明文档
```

## ✨ 核心功能

### 🔐 用户认证
- 手机号注册 / 登录
- 微信登录（App端 / 小程序端）
- 管理员账号名登录
- JWT Token认证与自动刷新
- 密码重置与验证码服务

### 🗄️ 我的衣橱
- 衣物上传（拍照 / 相册）
- 衣物分类管理（上衣、下装、外套、配饰、鞋子）
- 衣物标签（颜色、风格、季节）
- 衣物增删改查

### 👔 智能搭配
- 选择衣物生成搭配
- AI智能推荐搭配方案
- 保存搭配组合
- 搭配收藏与历史记录

### 🤖 AI试穿
- 上传人物照片
- 选择搭配组合
- AI生成试穿效果图
- AI配额管理与使用统计
- 试穿历史记录

### 💎 会员订阅
- VIP会员管理
- 订阅计划配置

### 🖥️ 管理后台
- 数据看板（营收趋势、用户统计、AI配额统计）
- 用户管理（角色分配、状态筛选）
- 衣物 / 搭配 / 试穿记录管理
- 会员订阅管理
- 系统配置

### 👤 个人中心
- 用户信息管理
- 账号安全设置（修改密码、微信绑定 / 解绑、手机号绑定）
- 统计数据展示
- 收藏管理
- 设置

## 🚀 快速开始

### 环境要求

- Node.js >= 22.11.0
- PostgreSQL >= 16.0
- JDK 17（Android开发）
- Xcode >= 15（iOS开发）

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 生成 Prisma Client
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 启动开发服务器
npm run start:dev
```

后端服务将在 http://localhost:3000 启动，API文档地址：http://localhost:3000/api

### 移动端启动

```bash
# 进入前端目录
cd FreeDressApp

# 安装依赖
npm install

# iOS环境（Mac）
bundle install
bundle exec pod install

# 启动Metro服务
npm start

# 运行Android
npm run android

# 运行iOS（Mac）
npm run ios
```

### 管理后台启动

```bash
# 进入管理后台目录
cd freedressBackWeb

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台将在 http://localhost:5173 启动。

## 📖 文档

- [API 接口与数据库模型文档](docs/API.md)

## 📝 开发规范

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier配置
- 使用函数式组件和React Hooks
- 组件使用大驼峰命名

### Git规范
- 使用语义化的提交信息（Gitmoji + Angular规范）
- 功能分支开发，合并前进行代码审查
- 保持提交历史清晰

### API规范
- 统一响应格式：{ code, message, data, timestamp }
- 使用RESTful风格
- 需要认证的接口添加Bearer Token

## 📅 开发计划

### 第一阶段（已完成）
- ✅ 用户认证系统（手机号 + 微信登录）
- ✅ 基础页面搭建
- ✅ 衣物管理功能
- ✅ React Native 0.85升级
- ✅ 后端代码审查与安全加固
- ✅ 管理后台前端框架搭建

### 第二阶段（核心功能）
- ⬜ AI智能搭配算法
- ⬜ 搭配收藏功能
- ⬜ AI试穿功能

### 第三阶段（扩展功能）
- ⬜ 社交分享功能
- ⬜ 搭配广场
- ⬜ VIP会员系统

## 🤝 贡献指南

1. Fork项目到个人仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，欢迎提交Issue或联系开发团队。

---

**畅搭（FreeDress）- 让穿搭更简单！** ✨