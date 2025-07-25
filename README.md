# Fix-Platform

一个维修管理平台 For XGX

## 项目介绍

本项目主要用于XGX店内部的维修下单管理，旨在解决下面几个问题：

- 用户下单困难，下单之后没反馈
- 维修同学不知道要修那些单，没有直观的反馈
- 收获不到用户评价反馈
- 缺乏统一的首款平台

## 技术栈

- 前端: React + Ant Design
- 后端: Node.js + Express
- 数据库: MongoDB
- 部署: Docker

## 项目结构

```
Fix-Platform/
├── client/        # 前端代码
├── server/        # 后端代码
└── docker-compose.yml
```

## 运行项目

### 使用Docker（推荐）

```bash
# 启动所有服务
docker-compose up

# 后台启动所有服务
docker-compose up -d
```

### 本地开发

1. 启动MongoDB数据库（需要本地安装MongoDB）

2. 启动后端服务：
```bash
cd server
npm install
npm run dev
```

3. 启动前端服务：
```bash
cd client
npm install
npm start
```

## API文档

### 认证相关

- POST `/api/auth/send-code` - 发送验证码
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

### 订单相关

- POST `/api/orders` - 创建订单
- GET `/api/orders` - 获取用户订单列表
- GET `/api/orders/:id` - 获取订单详情
- PUT `/api/orders/:id/cancel` - 取消订单
- POST `/api/orders/:id/rate` - 评价订单

### 用户相关

- GET `/api/user/info` - 获取用户信息
- PUT `/api/user/info` - 更新用户信息