# Fix-Platform 维修服务管理平台

一个基于 React + Node.js + MongoDB 的现代化维修服务管理平台，提供完整的订单管理、用户认证、多角色权限控制等功能。

## 🚀 项目特性

- **现代化技术栈**：React 18 + Ant Design 5 + Node.js + Express + MongoDB
- **多角色权限**：支持普通用户、维修员、客服、管理员四种角色
- **完整订单流程**：从订单创建到完成的全流程管理
- **实时状态更新**：订单状态实时跟踪和更新
- **图片上传**：支持多图片上传和预览
- **响应式设计**：适配桌面端和移动端
- **Docker 部署**：支持容器化部署

## 📋 功能模块

### 用户功能

- 手机号验证码登录/注册
- 创建维修订单
- 查看订单状态
- 订单评价
- 个人信息管理

### 维修员功能

- 查看分配的订单
- 更新订单状态
- 上传维修进度图片
- 工作台数据统计

### 客服功能

- 订单分配和管理
- 客户沟通记录
- 订单状态跟踪

### 管理员功能

- 用户管理
- 订单统计
- 系统配置管理
- 数据分析报表

## 🛠️ 技术栈

### 前端

- **React 18** - 用户界面框架
- **Ant Design 5.26.6** - UI 组件库
- **React Router 5.3.4** - 路由管理
- **Axios** - HTTP 客户端
- **Recharts** - 数据可视化

### 后端

- **Node.js** - 运行时环境
- **Express 4** - Web 框架
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Multer** - 文件上传

### 部署

- **Docker** - 容器化
- **Docker Compose** - 多容器编排
- **Vercel** - 前端部署

## 📦 项目结构

```
Fix-Platform/
├── client/                 # 前端应用
│   ├── public/            # 静态资源
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── contexts/      # React Context
│   │   └── App.js         # 应用入口
│   └── package.json
├── server/                # 后端应用
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── middleware/       # 中间件
│   ├── services/         # 业务服务
│   ├── scripts/          # 脚本文件
│   └── app.js            # 应用入口
├── .trae/
│   └── documents/        # 项目文档
├── docker-compose.yml    # Docker 编排文件
├── vercel.json          # Vercel 配置
└── README.md            # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 环境配置

在 `server` 目录下创建 `.env` 文件：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/fix-platform

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=5000
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 初始化数据

```bash
# 进入服务器目录
cd server

# 运行初始化脚本
node scripts/initData.js
```

### 启动应用

```bash
# 启动后端服务
cd server
npm start

# 启动前端应用（新终端）
cd client
npm start
```

访问 http://localhost:3000 查看应用。

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

### 单独构建镜像

```bash
# 构建前端镜像
cd client
docker build -t fix-platform-client .

# 构建后端镜像
cd ../server
docker build -t fix-platform-server .
```

## 📱 测试账号

系统提供以下测试账号：

| 角色       | 手机号      | 密码   | 说明       |
| ---------- | ----------- | ------ | ---------- |
| 超级管理员 | 13800000001 | 123456 | 系统管理员 |
| 客服       | 13800000002 | 123456 | 客服人员   |
| 维修员     | 13800000003 | 123456 | 维修技师   |
| 维修员     | 13800000004 | 123456 | 维修技师   |
| 普通用户   | 13800000005 | 123456 | 普通客户   |
| 普通用户   | 13800000006 | 123456 | 普通客户   |

## 🔧 开发指南

### 代码规范

- 使用 ES6+ 语法
- 组件采用函数式组件 + Hooks
- 遵循 Ant Design 设计规范
- 使用 TypeScript（推荐）

### 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### API 开发

- 遵循 RESTful 设计原则
- 统一错误处理和响应格式
- 添加适当的中间件验证
- 编写 API 文档

## 📊 项目状态

### 已完成功能 ✅

- [X] 用户认证系统
- [X] 订单管理系统
- [X] 多角色权限控制
- [X] 图片上传功能
- [X] 响应式界面设计
- [X] 数据统计展示
- [X] 系统配置管理

### 开发中功能 🚧

- [ ] 实时通知系统
- [ ] 支付功能集成
- [ ] 消息通信功能
- [ ] 移动端 PWA

### 计划功能 📋

- [ ] 数据分析报表
- [ ] 第三方服务集成
- [ ] 多语言支持
- [ ] 系统监控

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/your-username/Fix-Platform/issues)
- 邮箱: your-email@example.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**Fix-Platform** - 让维修服务更简单、更高效！
