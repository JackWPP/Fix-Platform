# Fix-Platform 生产环境部署指南

## 概述

Fix-Platform 是一个基于 React + Node.js + MongoDB 的维修服务平台。本文档详细说明了如何将应用部署到生产环境。

## 系统要求

### 最低配置
- CPU: 2核心
- 内存: 4GB RAM
- 存储: 20GB 可用空间
- 操作系统: Ubuntu 20.04+ / CentOS 8+ / Docker 支持

### 推荐配置
- CPU: 4核心
- 内存: 8GB RAM
- 存储: 50GB SSD
- 负载均衡器（生产环境）

## 部署方式

### 方式一：Docker 部署（推荐）

#### 1. 环境准备
```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 克隆项目
```bash
git clone <your-repository-url>
cd Fix-Platform
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑环境变量
nano server/.env
```

重要环境变量配置：
```env
# 生产环境配置
NODE_ENV=production
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://admin:your-password@mongodb:27017/fix_platform?authSource=admin

# JWT密钥（必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 客户端URL
CLIENT_URL=https://your-domain.com

# 短信验证码开关
ENABLE_SMS_VERIFICATION=false

# 日志级别
LOG_LEVEL=INFO

# 安全配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

#### 4. 启动服务
```bash
# 生产环境启动
docker-compose --profile production up -d

# 或者基础服务启动
docker-compose up -d
```

#### 5. 验证部署
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 健康检查
curl http://localhost/api/health
```

### 方式二：PM2 部署

#### 1. 环境准备
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 MongoDB
# 参考官方文档：https://docs.mongodb.com/manual/installation/
```

#### 2. 项目部署
```bash
# 克隆项目
git clone <your-repository-url>
cd Fix-Platform

# 安装后端依赖
cd server
npm install --production
cd ..

# 构建前端
cd client
npm install
npm run build
cd ..
```

#### 3. 配置环境变量
```bash
# 配置生产环境变量
cp server/.env.example server/.env
nano server/.env
```

#### 4. 启动应用
```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 设置开机自启
pm2 startup
pm2 save
```

## 数据库配置

### MongoDB 配置

#### Docker 方式
数据库会自动通过 Docker Compose 启动，无需额外配置。

#### 独立部署
```bash
# 创建数据库用户
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "your-password",
  roles: ["root"]
})

use fix_platform
db.createUser({
  user: "fix_platform_user",
  pwd: "your-app-password",
  roles: ["readWrite"]
})
```

### 初始化数据
```bash
# 进入服务器目录
cd server

# 运行初始化脚本
node scripts/initData.js
node scripts/initConfigData.js
```

## 反向代理配置

### Nginx 配置

#### 安装 Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 配置文件
将项目中的 `nginx.conf` 复制到 `/etc/nginx/sites-available/fix-platform`：

```bash
sudo cp nginx.conf /etc/nginx/sites-available/fix-platform
sudo ln -s /etc/nginx/sites-available/fix-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL 证书配置

#### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 监控和日志

### 应用监控

#### PM2 监控
```bash
# 查看应用状态
pm2 status
pm2 monit

# 查看日志
pm2 logs
pm2 logs fix-platform-server
```

#### Docker 监控
```bash
# 查看容器状态
docker-compose ps

# 查看资源使用
docker stats

# 查看日志
docker-compose logs -f
```

### 日志管理

应用日志位置：
- Docker: 容器内 `/app/logs/`
- PM2: `./logs/`

日志文件：
- `YYYY-MM-DD.log`: 所有日志
- `YYYY-MM-DD-error.log`: 错误日志
- `combined.log`: PM2 综合日志

### 健康检查

应用提供以下健康检查端点：
- `/api/health`: 基础健康检查
- `/api/health/detailed`: 详细健康检查
- `/api/ready`: 就绪检查
- `/api/live`: 存活检查

## 备份策略

### 数据库备份

#### 自动备份脚本
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/mongodb"
DB_NAME="fix_platform"

mkdir -p $BACKUP_DIR

# 备份数据库
mongodump --host localhost --port 27017 --db $DB_NAME --out $BACKUP_DIR/$DATE

# 压缩备份
tar -czf $BACKUP_DIR/fix_platform_$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### 设置定时备份
```bash
# 添加到 crontab
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup-db.sh
```

### 应用备份
```bash
# 备份应用文件
tar -czf fix-platform-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  /path/to/Fix-Platform
```

## 性能优化

### 应用层优化
1. 启用 Gzip 压缩
2. 配置静态文件缓存
3. 使用 CDN 加速静态资源
4. 数据库索引优化
5. 连接池配置

### 系统层优化
1. 调整文件描述符限制
2. 配置内核参数
3. 使用 SSD 存储
4. 配置 swap 分区

## 安全配置

### 防火墙配置
```bash
# UFW 配置
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 系统安全
1. 定期更新系统
2. 禁用 root 登录
3. 配置 SSH 密钥认证
4. 安装 fail2ban
5. 定期安全扫描

## 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :5000

# 检查环境变量
env | grep NODE_ENV

# 查看详细错误日志
pm2 logs --lines 100
```

#### 2. 数据库连接失败
```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 测试连接
mongo --host localhost --port 27017

# 检查防火墙
sudo ufw status
```

#### 3. 前端页面无法访问
```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 性能问题诊断
```bash
# 查看系统资源
top
htop
iostat

# 查看应用性能
pm2 monit
docker stats

# 数据库性能
mongo --eval "db.stats()"
```

## 更新和维护

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# Docker 方式更新
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# PM2 方式更新
npm install --production
npm run build
pm2 reload ecosystem.config.js
```

### 数据库维护
```bash
# 数据库优化
mongo fix_platform --eval "db.runCommand({compact: 'collection_name'})"

# 重建索引
mongo fix_platform --eval "db.collection_name.reIndex()"
```

## 联系支持

如果在部署过程中遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查应用日志和系统日志
3. 联系技术支持团队

---

**注意**: 在生产环境部署前，请务必：
1. 修改所有默认密码
2. 配置 HTTPS
3. 设置防火墙规则
4. 配置监控和告警
5. 制定备份策略