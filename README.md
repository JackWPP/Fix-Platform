# XGX店内部维修下单管理系统

一个现代化的维修服务管理平台，为XGX店提供完整的维修订单管理解决方案。

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Redis 7+
- Supabase 账号

### 安装和启动

```bash
# 克隆项目
git clone <repository-url>
cd Fix-Platform

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息

# 启动开发服务器
npm run dev        # 启动前端开发服务器
npm run server:dev # 启动后端开发服务器
```

### 访问地址
- **用户端**: http://localhost:5173
- **管理员后台**: http://localhost:5173/admin
- **API服务**: http://localhost:3000

## 📚 文档导航

完整的项目文档位于 `docs/` 目录下：

### 核心文档
- [📖 项目README](./docs/README.md) - 详细的项目介绍和使用指南
- [👥 用户手册](./docs/user-manual.md) - 各角色用户的使用说明
- [🔧 开发文档](./docs/development.md) - 开发环境搭建和开发指南
- [🏗️ 技术架构](./docs/technical-architecture.md) - 系统架构和技术栈说明
- [📋 产品需求](./docs/product-requirements.md) - 详细的产品需求文档

### 专业文档
- [🔌 API参考](./docs/api-reference.md) - 完整的API接口文档
- [🚀 部署指南](./docs/deployment-guide.md) - 生产环境部署说明
- [👑 管理员指南](./docs/admin-guide.md) - 管理员后台使用指南

## 🎯 核心功能

- **用户端**: 在线下单、订单跟踪、评价反馈
- **维修员端**: 接单管理、进度更新、工作台
- **客服端**: 订单跟进、用户沟通、问题处理
- **管理员端**: 数据大屏、用户管理、系统设置

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Ant Design + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **缓存**: Redis
- **部署**: Docker + Nginx

## 🧪 测试账号

| 角色 | 手机号 | 密码 | 说明 |
|------|--------|------|------|
| 系统管理员 | 13800000001 | admin123 | 管理员后台访问 |
| 维修员 | 13800000002 | tech123 | 维修员工作台 |
| 客服人员 | 13800000003 | service123 | 客服管理界面 |

## 📄 许可证

MIT License

## 📞 联系我们

如有问题或建议，请联系开发团队。
