# Fix-Platform 维修服务管理平台

一个基于 React + Node.js + MongoDB 的现代化维修服务管理平台，提供完整的订单管理、用户认证、多角色权限控制等功能。

## 🚀 项目特性

- **现代化技术栈**：React 18 + Ant Design 5 + Node.js + Express + MongoDB
- **多角色权限**：支持普通用户、维修员、客服、管理员四种角色
- **完整订单流程**：从订单创建到完成的全流程管理
- **实时状态更新**：订单状态实时跟踪和更新
- **图片上传**：支持多图片上传和预览
- **响应式设计**：适配桌面端和移动端
- **生产环境就绪**：完整的生产环境配置和部署方案
- **安全增强**：输入验证、请求限制、CORS 配置等安全措施
- **健康监控**：完整的健康检查和监控系统
- **日志系统**：结构化日志记录和管理
- **Docker 部署**：支持容器化部署和 Docker Compose 编排

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
# 基础配置
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/fix_platform
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fix_platform
# 或使用内存数据库（开发测试）
# MONGODB_URI=memory

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 短信验证码配置（可选）
ENABLE_SMS_VERIFICATION=false
SMS_ACCESS_KEY_ID=your-access-key-id
SMS_ACCESS_KEY_SECRET=your-access-key-secret
SMS_SIGN_NAME=your-sign-name
SMS_TEMPLATE_CODE=your-template-code

# 日志配置
LOG_LEVEL=DEBUG

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 安全配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
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

### 开发环境

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境

```bash
# 启动生产环境（包含 Nginx）
docker-compose --profile production up -d

# 健康检查
curl http://localhost/api/health
```

### 环境变量配置

创建 `.env` 文件配置 Docker 环境：

```env
# Docker 环境配置
NODE_ENV=production
PORT=5000
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DB_NAME=fix_platform
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-domain.com
ENABLE_SMS_VERIFICATION=false
LOG_LEVEL=INFO
```

## 📱 测试账号

系统提供以下测试账号：

| 角色       | 手机号      | 密码   | 说明       |
| ---------- | ----------- | ------ | ---------- |
| 超级管理员 | 13800000001 | 123456 | 系统管理员 |
| 客服       | 13800000002 | 123456 | 客服人员   |
| 维修员     | 13800000003 | 123456 | 维修技师   |
| 维修员     | 13800000004 | 123456 | 维修技师   |

**注意**：生产环境部署时请务必修改默认密码！

## 🔧 API 接口

### 健康检查

- `GET /api/health` - 基础健康检查
- `GET /api/health/detailed` - 详细健康检查
- `GET /api/ready` - 就绪检查
- `GET /api/live` - 存活检查

### 认证配置

- `GET /api/auth/config` - 获取认证配置（是否启用短信验证等）

## 🚀 生产环境部署

详细的生产环境部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)，包含：

- Docker 部署方案
- PM2 部署方案
- Nginx 反向代理配置
- SSL 证书配置
- 监控和日志管理
- 备份策略
- 安全配置
- 性能优化

## 🔒 安全特性

- **输入验证**：所有用户输入都经过严格验证
- **请求限制**：防止暴力攻击和 DDoS
- **CORS 配置**：跨域请求安全控制
- **安全头**：Helmet.js 提供的安全头配置
- **JWT 认证**：安全的用户身份验证
- **密码加密**：bcrypt 加密存储
- **文件上传限制**：文件类型和大小限制

## 📊 监控和日志

### 日志系统

- 结构化日志记录
- 不同环境的日志级别控制
- 自动日志轮转
- 错误日志单独记录

### 监控指标

- 应用健康状态
- 数据库连接状态
- 系统资源使用情况
- API 响应时间
- 错误率统计
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

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/JackWPP/Fix-Platform/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**Fix-Platform** - 让维修服务更简单、更高效！
