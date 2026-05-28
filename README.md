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
| **前端** | React Native | 0.85.3 |
| **语言** | TypeScript | 5.8.3 |
| **后端** | NestJS | 10.3.0 |
| **数据库** | PostgreSQL | 16+ |
| **ORM** | Prisma | 5.7.0 |
| **认证** | JWT (Passport.js) | - |
| **状态管理** | Zustand | 5.0.13 |
| **导航** | React Navigation | 7.x |

## 📁 项目结构

```
free-dress/
├── FreeDressApp/               # React Native 移动端应用
│   ├── src/
│   │   ├── components/         # 自定义UI组件
│   │   ├── screens/            # 页面组件
│   │   ├── navigation/         # 导航配置
│   │   ├── api/                # API接口
│   │   ├── store/              # 状态管理
│   │   ├── types/              # 类型定义
│   │   └── constants/          # 常量配置
│   ├── android/                # Android原生代码
│   ├── ios/                    # iOS原生代码
│   └── package.json
│
├── backend/                    # NestJS 后端服务
│   ├── src/
│   │   ├── main.ts             # 应用入口
│   │   ├── app.module.ts       # 根模块
│   │   ├── prisma/             # Prisma数据库模块
│   │   ├── common/             # 公共工具
│   │   │   ├── decorators/     # 装饰器
│   │   │   ├── guards/         # 守卫
│   │   │   ├── interceptors/   # 拦截器
│   │   │   └── filters/        # 过滤器
│   │   └── modules/            # 功能模块
│   │       ├── auth/           # 认证模块
│   │       ├── users/          # 用户模块
│   │       └── clothes/        # 衣物模块
│   ├── prisma/
│   │   └── schema.prisma       # 数据库模型
│   └── package.json
│
├── LICENSE                     # MIT许可证
└── README.md                   # 项目说明文档
```

## ✨ 核心功能

### 🔐 用户认证
- 手机号注册/登录
- JWT Token认证机制
- 支持Token自动刷新

### 🗄️ 我的衣橱
- 衣物上传（拍照/相册）
- 衣物分类管理（上衣、下装、外套、配饰、鞋子）
- 衣物标签（颜色、风格、季节）
- 衣物增删改查

### 👔 智能搭配
- 选择衣物生成搭配
- AI智能推荐搭配方案
- 保存搭配组合
- 搭配收藏

### 🤖 AI试穿
- 上传人物照片
- 选择搭配组合
- AI生成试穿效果图
- 试穿历史记录

### 👤 个人中心
- 用户信息管理
- 统计数据展示
- 收藏管理

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

### 前端启动

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

## 🔌 API接口

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| POST | /auth/refresh | 刷新Token |
| GET | /auth/profile | 获取用户信息 |

### 用户接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /users/profile | 获取用户详情 |
| PUT | /users/profile | 更新用户资料 |
| GET | /users/stats | 获取用户统计 |

### 衣物接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /clothes | 创建衣物 |
| GET | /clothes | 获取衣物列表 |
| GET | /clothes/:id | 获取衣物详情 |
| PUT | /clothes/:id | 更新衣物 |
| DELETE | /clothes/:id | 删除衣物 |
| GET | /clothes/stats/categories | 获取分类统计 |

## 📊 数据库模型

### 用户表（users）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| phone | String | 手机号（唯一） |
| password | String | 加密密码 |
| nickname | String | 昵称 |
| avatarUrl | String | 头像URL |
| role | Enum | 角色（USER/VIP） |

### 衣物表（clothes）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |
| imageUrl | String | 图片URL |
| category | Enum | 分类 |
| color | String | 颜色 |
| style | String | 风格 |
| season | String[] | 适用季节 |
| tags | String[] | 标签 |

## 📝 开发规范

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier配置
- 使用函数式组件和React Hooks
- 组件使用大驼峰命名

### Git规范
- 使用语义化的提交信息
- 功能分支开发，合并前进行代码审查
- 保持提交历史清晰

### API规范
- 统一响应格式：{ code, message, data, timestamp }
- 使用RESTful风格
- 需要认证的接口添加Bearer Token

## 📅 开发计划

### 第一阶段（已完成）
- ✅ 用户认证系统
- ✅ 基础页面搭建
- ✅ 衣物管理功能
- ✅ React Native 0.85升级

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