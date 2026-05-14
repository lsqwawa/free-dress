# 畅搭 FreeDress - Backend API

> 🎭 智能衣物搭配平台后端服务

基于 NestJS 构建的 RESTful API 服务，为畅搭移动应用提供数据支持。

## 功能特性

### 🔐 认证模块
- 用户注册（手机号+密码）
- 用户登录
- JWT Token 刷新
- 获取当前用户信息

### 🗄️ 衣物管理
- 上传新衣物
- 获取衣物列表（支持分类筛选）
- 获取衣物详情
- 更新衣物信息
- 删除衣物
- 获取分类统计

### 👤 用户管理
- 获取用户详情
- 更新用户资料（昵称、头像）
- 获取用户统计数据

### 👔 搭配管理
- 创建搭配方案
- 获取搭配列表
- 获取搭配详情
- 删除搭配

### ⭐ 收藏管理
- 收藏搭配
- 取消收藏
- 获取收藏列表

### 🤖 AI 试穿
- 记录试穿结果
- 获取试穿历史

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | NestJS | 10.3.0 |
| 语言 | TypeScript | 5.3.3 |
| 数据库 | PostgreSQL | 16+ |
| ORM | Prisma | 5.7.0 |
| 认证 | JWT | - |
| API文档 | Swagger | 7.1.17 |
| 密码加密 | bcryptjs | 2.4.3 |

## 快速开始

### 环境要求

- Node.js >= 20.10.0
- PostgreSQL >= 16.0
- npm >= 10.0.0

### 安装依赖

```bash
cd backend
npm install
```

### 数据库配置

1. 创建 PostgreSQL 数据库：
```sql
CREATE DATABASE freedress;
```

2. 配置环境变量，复制 `.env.example` 并修改：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/freedress"
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 数据库迁移

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate
```

### 启动服务

```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问：http://localhost:3000

### API 文档

启动服务后访问 Swagger 文档：
- 地址：http://localhost:3000/api
- 包含所有 API 接口的详细说明和测试功能

## 项目结构

```
src/
├── common/              # 通用模块
│   ├── decorators/      # 自定义装饰器
│   │   └── current-user.decorator.ts
│   ├── filters/         # 异常过滤器
│   │   └── http-exception.filter.ts
│   ├── guards/          # 守卫
│   │   └── jwt-auth.guard.ts
│   └── interceptors/    # 拦截器
│       └── transform.interceptor.ts
├── modules/             # 业务模块
│   ├── auth/            # 认证模块
│   │   ├── dto/         # 数据传输对象
│   │   ├── strategies/  # Passport 策略
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── clothes/         # 衣物模块
│   │   ├── dto/
│   │   ├── clothes.controller.ts
│   │   ├── clothes.service.ts
│   │   └── clothes.module.ts
│   └── users/           # 用户模块
│       ├── dto/
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── prisma/              # Prisma 配置
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts        # 根模块
└── main.ts              # 入口文件
```

## API 接口

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| POST | /auth/refresh | 刷新 Token |
| GET | /auth/profile | 获取当前用户信息 |

### 衣物接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /clothes | 创建衣物 |
| GET | /clothes | 获取衣物列表 |
| GET | /clothes/:id | 获取衣物详情 |
| PUT | /clothes/:id | 更新衣物 |
| DELETE | /clothes/:id | 删除衣物 |
| GET | /clothes/stats/categories | 获取分类统计 |

### 用户接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /users/profile | 获取用户信息 |
| PUT | /users/profile | 更新用户资料 |
| GET | /users/stats | 获取用户统计 |

## 数据库模型

### User（用户）
- id: UUID
- phone: 手机号（唯一）
- password: 密码（加密）
- nickname: 昵称
- avatarUrl: 头像URL
- role: 角色（USER/VIP）
- createdAt: 创建时间
- updatedAt: 更新时间

### Cloth（衣物）
- id: UUID
- userId: 用户ID
- imageUrl: 图片URL
- category: 分类（TOP/BOTTOM/COAT/ACCESSORY/SHOE）
- color: 颜色
- style: 风格
- season: 适用季节（数组）
- tags: 标签（数组）

### Outfit（搭配）
- id: UUID
- userId: 用户ID
- aiDescription: AI描述
- style: 风格
- occasion: 适用场合
- imageUrl: 效果图URL

### Favorite（收藏）
- userId: 用户ID
- outfitId: 搭配ID

### TryOnResult（试穿结果）
- id: UUID
- userId: 用户ID
- outfitId: 搭配ID
- personImageUrl: 人物照片
- resultImageUrl: AI生成结果

## 认证机制

### JWT Token

系统使用 JWT 进行身份认证：
- **Access Token**: 有效期 1 小时，用于 API 访问
- **Refresh Token**: 有效期 7 天，用于刷新 Access Token

### 请求示例

```bash
# 登录获取 Token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "123456"}'

# 使用 Token 访问受保护接口
curl -X GET http://localhost:3000/clothes \
  -H "Authorization: Bearer your_access_token"
```

## 开发命令

```bash
npm run build        # 构建项目
npm run start        # 启动生产服务
npm run start:dev    # 启动开发服务器（热重载）
npm run start:debug  # 启动调试模式
npm run lint         # 代码检查
npm test             # 运行测试
npm run test:watch   # 监听测试
npm run test:cov     # 测试覆盖率
npm run prisma:generate  # 生成 Prisma 客户端
npm run prisma:migrate   # 执行数据库迁移
npm run prisma:studio    # 启动 Prisma Studio
```

## 许可证

MIT License - 详见 LICENSE 文件