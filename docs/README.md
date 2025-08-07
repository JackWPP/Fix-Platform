# XGX店内部维修下单管理系统

## 📋 项目简介

XGX店内部维修下单管理系统是一个现代化的维修服务管理平台，采用React + Node.js全栈技术栈开发。系统旨在解决传统维修服务中用户下单困难、维修流程不透明、数据统计困难等核心问题，为用户、维修员、客服和管理员提供完整的业务流程支持。

## ✨ 核心特性

- 🔐 **多角色权限管理** - 支持用户、维修员、客服、管理员四种角色
- 📱 **移动端优先设计** - 响应式界面，完美适配手机和PC端
- 🚀 **实时订单跟踪** - 订单状态实时更新，维修进度透明化
- 📊 **数据可视化大屏** - 管理员数据大屏，业务数据一目了然
- 💬 **完整反馈系统** - 用户评价反馈，服务质量持续改进
- 🔒 **安全认证体系** - JWT令牌 + 手机验证码双重安全保障

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Ant Design** - 企业级UI组件库
- **Tailwind CSS** - 原子化CSS框架
- **Vite** - 快速构建工具
- **Zustand** - 轻量级状态管理

### 后端技术
- **Node.js 18** - JavaScript运行时
- **Express 4** - Web应用框架
- **TypeScript** - 类型安全开发
- **JWT** - 身份认证
- **Multer** - 文件上传处理

### 数据库与存储
- **Supabase** - 现代化后端即服务
- **PostgreSQL** - 关系型数据库
- **Supabase Storage** - 文件存储服务

### 开发工具
- **ESLint** - 代码质量检查
- **Nodemon** - 开发热重载
- **Concurrently** - 并发脚本执行

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 配置环境变量：
```env
# Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT配置
JWT_SECRET=your_jwt_secret

# 短信服务配置
ALI_ACCESS_KEY_ID=your_ali_access_key_id
ALI_ACCESS_KEY_SECRET=your_ali_access_key_secret
```

### 数据库初始化
1. 在Supabase控制台执行SQL迁移文件：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_missing_tables.sql`

### 启动开发服务器
```bash
# 同时启动前端和后端开发服务器
npm run dev

# 或者分别启动
npm run client:dev  # 前端服务器 (http://localhost:5173)
npm run server:dev  # 后端服务器 (http://localhost:3000)
```

## 📁 项目结构

```
Fix-Platform/
├── api/                    # 后端API代码
│   ├── routes/            # 路由定义
│   ├── middleware/        # 中间件
│   ├── utils/            # 工具函数
│   └── config/           # 配置文件
├── src/                   # 前端源代码
│   ├── components/       # 公共组件
│   ├── pages/           # 页面组件
│   ├── hooks/           # 自定义Hook
│   ├── utils/           # 工具函数
│   └── store/           # 状态管理
├── docs/                  # 项目文档
├── supabase/             # 数据库迁移文件
└── uploads/              # 文件上传目录
```

## 🔑 测试账号

系统预设了以下测试账号：

| 角色 | 手机号 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | 13800000000 | 123456 | 系统管理员，拥有所有权限 |
| 客服 | 13800000001 | 123456 | 客服人员，处理用户反馈 |
| 维修员 | 13800000002 | 123456 | 维修员，处理维修订单 |

> 注意：普通用户需要通过手机验证码注册登录

## 🌐 系统访问

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000
- **管理员后台**: http://localhost:5173/admin/dashboard

## 📚 文档导航

- [用户手册](./user-manual.md) - 系统使用指南
- [开发文档](./development.md) - 开发和维护指南
- [产品需求文档](./product-requirements.md) - 详细功能需求
- [技术架构文档](./technical-architecture.md) - 系统架构设计
- [API文档](./api-reference.md) - 接口文档

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情

## 📞 联系我们

如有问题或建议，请联系开发团队。

---

**XGX店内部维修下单管理系统** - 让维修服务更简单、更透明、更高效！