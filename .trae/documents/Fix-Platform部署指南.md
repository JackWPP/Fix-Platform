# Fix-Platform 部署指南

## 1. 部署概述

本指南详细介绍了 Fix-Platform 维修服务平台的生产环境部署流程，包括环境配置、部署步骤、监控设置和维护指南。

### 1.1 系统要求

**服务器要求**
- Node.js 18.0+ 
- MongoDB 5.0+
- 内存：至少 2GB RAM
- 存储：至少 20GB 可用空间
- 网络：支持 HTTPS

**开发环境**
- Git 2.0+
- Docker & Docker Compose（可选）
- PM2（生产环境进程管理）

## 2. 环境变量配置

### 2.1 创建环境配置文件

在项目根目录创建 `.env` 文件：

```bash
# 应用基础配置
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/fix-platform
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fix-platform

# JWT认证配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 短信验证码配置（可选）
ENABLE_SMS_VERIFICATION=false
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 邮件配置（可选）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2.2 环境变量说明

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| NODE_ENV | 是 | development | 运行环境模式 |
| PORT | 否 | 5000 | 服务器端口 |
| CLIENT_URL | 是 | - | 前端应用地址 |
| MONGODB_URI | 是 | - | MongoDB连接字符串 |
| JWT_SECRET | 是 | - | JWT加密密钥 |
| ENABLE_SMS_VERIFICATION | 否 | false | 是否启用短信验证 |

## 3. 本地部署

### 3.1 克隆项目

```bash
git clone https://github.com/your-username/Fix-Platform.git
cd Fix-Platform
```

### 3.2 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3.3 配置数据库

**本地 MongoDB 安装**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# macOS (使用 Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Windows
# 下载并安装 MongoDB Community Server
```

**初始化数据库**
```bash
cd server
node scripts/initDatabase.js
```

### 3.4 启动服务

**开发模式**
```bash
# 启动后端服务
cd server
npm run dev

# 启动前端服务（新终端）
cd client
npm start
```

**生产模式**
```bash
# 构建前端
cd client
npm run build

# 启动后端服务
cd ../server
npm start
```

## 4. Docker 部署

### 4.1 使用 Docker Compose

项目根目录已包含 `docker-compose.yml` 文件：

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

### 4.2 单独构建镜像

```bash
# 构建后端镜像
cd server
docker build -t fix-platform-server .

# 构建前端镜像
cd ../client
docker build -t fix-platform-client .

# 运行容器
docker run -d -p 5000:5000 --name server fix-platform-server
docker run -d -p 3000:3000 --name client fix-platform-client
```

## 5. 云平台部署

### 5.1 Vercel 部署（推荐）

**前端部署**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署前端
cd client
vercel --prod
```

**后端部署**
```bash
# 部署后端 API
cd server
vercel --prod
```

**环境变量配置**
在 Vercel 控制台设置环境变量：
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- 其他必需的环境变量

### 5.2 其他云平台

**Heroku 部署**
```bash
# 安装 Heroku CLI
# 创建应用
heroku create fix-platform-api

# 设置环境变量
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# 部署
git push heroku main
```

**AWS/阿里云部署**
- 使用 EC2/ECS 实例
- 配置负载均衡器
- 设置 RDS 数据库
- 配置 CDN 加速

## 6. 生产环境优化

### 6.1 进程管理

使用 PM2 管理 Node.js 进程：

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fix-platform-server',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};

# 启动应用
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart fix-platform-server
```

### 6.2 反向代理配置

**Nginx 配置示例**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 前端静态文件
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 文件上传
    location /uploads {
        alias /path/to/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.3 数据库优化

**MongoDB 索引优化**
```javascript
// 在 MongoDB 中创建索引
db.users.createIndex({ "phone": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.orders.createIndex({ "userId": 1, "createdAt": -1 })
db.orders.createIndex({ "assignedTo": 1, "status": 1 })
db.orders.createIndex({ "status": 1, "createdAt": -1 })
```

**连接池配置**
```javascript
// server/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // 最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket 超时
      bufferMaxEntries: 0
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

## 7. 监控与维护

### 7.1 健康检查

系统提供健康检查端点：
```bash
# 检查系统状态
curl https://your-domain.com/api/health

# 响应示例
{
  "status": "healthy",
  "timestamp": "2025-01-10T10:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 29360128,
    "heapUsed": 20537896
  },
  "database": "connected",
  "version": "1.0.0"
}
```

### 7.2 日志管理

**日志查看**
```bash
# PM2 日志
pm2 logs fix-platform-server

# 应用日志
tail -f logs/app.log

# 错误日志
tail -f logs/error.log
```

**日志轮转配置**
```bash
# 安装 logrotate
sudo apt-get install logrotate

# 创建配置文件 /etc/logrotate.d/fix-platform
/path/to/fix-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.3 备份策略

**数据库备份**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
DB_NAME="fix-platform"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mongodump --db $DB_NAME --out $BACKUP_DIR/mongodb_$DATE

# 压缩备份文件
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete

echo "Backup completed: mongodb_$DATE.tar.gz"
```

**文件备份**
```bash
#!/bin/bash
# backup_files.sh
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
APP_DIR="/path/to/fix-platform"

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR uploads

# 备份配置文件
cp $APP_DIR/.env $BACKUP_DIR/env_$DATE.backup

echo "Files backup completed"
```

### 7.4 性能监控

**系统监控脚本**
```bash
#!/bin/bash
# monitor.sh
echo "=== System Status ==="
date
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo "PM2 Status:"
pm2 status
echo "Database Status:"
mongo --eval "db.adminCommand('ping')"
```

**设置定时监控**
```bash
# 添加到 crontab
crontab -e

# 每5分钟检查一次系统状态
*/5 * * * * /path/to/monitor.sh >> /path/to/logs/monitor.log 2>&1

# 每天凌晨2点备份数据库
0 2 * * * /path/to/backup.sh

# 每天凌晨3点备份文件
0 3 * * * /path/to/backup_files.sh
```

## 8. 故障排除

### 8.1 常见问题

**服务无法启动**
```bash
# 检查端口占用
lsof -i :5000

# 检查环境变量
echo $NODE_ENV
cat .env

# 检查日志
pm2 logs
tail -f logs/error.log
```

**数据库连接失败**
```bash
# 检查 MongoDB 状态
sudo systemctl status mongodb

# 测试连接
mongo $MONGODB_URI --eval "db.adminCommand('ping')"

# 检查网络连接
telnet mongodb-host 27017
```

**内存不足**
```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head

# 重启 PM2 进程
pm2 restart all

# 清理日志
pm2 flush
```

### 8.2 应急处理

**服务降级**
```javascript
// 在紧急情况下禁用非核心功能
const EMERGENCY_MODE = process.env.EMERGENCY_MODE === 'true';

if (EMERGENCY_MODE) {
  // 禁用文件上传
  // 禁用短信发送
  // 简化响应数据
}
```

**快速回滚**
```bash
# Git 回滚
git log --oneline -10
git checkout <previous-commit-hash>
pm2 restart all

# 数据库回滚
mongorestore --db fix-platform /path/to/backup/mongodb_backup
```

## 9. 安全检查清单

### 9.1 部署前检查

- [ ] 更改默认密码和密钥
- [ ] 配置 HTTPS 证书
- [ ] 设置防火墙规则
- [ ] 启用访问日志
- [ ] 配置备份策略
- [ ] 测试健康检查端点
- [ ] 验证环境变量配置
- [ ] 检查文件权限设置

### 9.2 运行时安全

- [ ] 定期更新依赖包
- [ ] 监控异常访问
- [ ] 检查日志异常
- [ ] 验证备份完整性
- [ ] 测试故障恢复流程
- [ ] 更新安全补丁

## 10. 联系支持

如果在部署过程中遇到问题，请：

1. 查看项目文档和 FAQ
2. 检查 GitHub Issues
3. 联系技术支持团队
4. 提供详细的错误日志和环境信息

---

**注意事项**
- 生产环境部署前请充分测试
- 定期备份重要数据
- 保持系统和依赖包更新
- 监控系统性能和安全状态