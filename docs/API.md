# API 接口文档

> 本文档记录畅搭（FreeDress）后端全部 RESTful API 接口。

## 🔌 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/register | 用户注册（手机号） |
| POST | /auth/login | 用户登录（手机号 / 管理员账号名） |
| POST | /auth/wechat | 微信Code登录 |
| POST | /auth/refresh | 刷新Token |
| GET  | /auth/profile | 获取当前用户信息 |

## 👤 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /users/profile | 获取用户详情 |
| PUT  | /users/profile | 更新用户资料 |
| GET  | /users/stats | 获取用户统计 |

## 👕 衣物接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /clothes | 创建衣物 |
| GET  | /clothes | 获取衣物列表 |
| GET  | /clothes/:id | 获取衣物详情 |
| PUT  | /clothes/:id | 更新衣物 |
| DELETE | /clothes/:id | 删除衣物 |
| GET  | /clothes/stats/categories | 获取分类统计 |

## 👔 搭配接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /outfits | 创建搭配 |
| GET  | /outfits | 获取搭配列表 |
| GET  | /outfits/recommend | AI智能推荐搭配 |
| PUT  | /outfits/:id/favorite | 收藏 / 取消收藏搭配 |

## 🤖 试穿接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /tryon | 创建AI试穿任务 |
| GET  | /tryon | 获取试穿历史列表 |

## 💎 会员接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /membership/plans | 获取会员计划列表 |

## 📁 文件上传接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /upload | 上传文件 |

## 🖥️ 管理后台接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /admin/stats | 获取综合统计数据 |
| GET  | /admin/stats/revenue-trend | 营收趋势 |
| GET  | /admin/users | 用户列表（支持搜索/角色/状态筛选） |
| PUT  | /admin/users/:id/role | 修改用户角色 |
| GET  | /admin/clothes | 衣物列表 |
| GET  | /admin/outfits | 搭配列表 |
| GET  | /admin/tryon/stats | 试穿统计 |
| GET  | /admin/tryon | 试穿记录列表 |
| GET  | /admin/subscriptions | 订阅列表 |
| GET  | /admin/ai-quotas/stats | AI配额统计（7日 / 30日） |

---

## 📊 数据库模型

### 用户表（users）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| phone | String | 手机号（唯一） |
| password | String | 加密密码 |
| nickname | String | 昵称 |
| avatarUrl | String | 头像URL |
| role | Enum | 角色（USER / VIP） |

### 微信绑定日志表（wechat_bind_logs）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID |
| openid | String | 微信OpenID |
| unionid | String | 微信UnionID |

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

### 搭配表（outfits）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |
| name | String | 搭配名称 |

### 试穿结果表（try_on_results）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |
| imageUrl | String | 试穿效果图URL |

### 会员订阅表（subscriptions）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |

### AI配额表（ai_quotas）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |

### 密码重置表（reset_tokens）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |
| token | String | 重置令牌 |