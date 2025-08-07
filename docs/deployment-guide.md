# 部署指南

## 📋 概述

本文档详细说明了XGX店内部维修下单管理系统的生产环境部署流程，包括服务器配置、环境搭建、应用部署和运维监控等内容。

## 🖥️ 服务器要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 50GB SSD
- **网络**: 10Mbps带宽
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 8+

### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 100GB SSD
- **网络**: 100Mbps带宽
- **操作系统**: Ubuntu 22.04 LTS

## 🐳 Docker 部署（推荐）

### 1. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 创建部署目录

```bash
sudo mkdir -p /opt/fix-platform
cd /opt/fix-platform
```

### 3. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
      - ALIYUN_SMS_ACCESS_KEY_ID=${ALIYUN_SMS_ACCESS_KEY_ID}
      - ALIYUN_SMS_ACCESS_KEY_SECRET=${ALIYUN_SMS_ACCESS_KEY_SECRET}
      - ALIYUN_SMS_SIGN_NAME=${ALIYUN_SMS_SIGN_NAME}
      - ALIYUN_SMS_TEMPLATE_CODE=${ALIYUN_SMS_TEMPLATE_CODE}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - redis
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  redis_data:

networks:
  default:
    driver: bridge
```

### 4. 创建 Dockerfile.frontend

```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 5. 创建 Dockerfile.backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 6. 创建 Nginx 配置

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 上传文件大小限制
    client_max_body_size 10M;

    # 前端应用
    server {
        listen 80;
        server_name your-domain.com;

        # HTTPS 重定向
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;

            # 缓存配置
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API 代理
        location /api/ {
            proxy_pass http://backend:3000/api/;
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
        location /uploads/ {
            proxy_pass http://backend:3000/uploads/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 7. 环境变量配置

创建 `.env` 文件：

```bash
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# Redis 配置
REDIS_URL=redis://redis:6379

# 阿里云短信服务
ALIYUN_SMS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_SMS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_SMS_SIGN_NAME=your-sign-name
ALIYUN_SMS_TEMPLATE_CODE=your-template-code

# 其他配置
NODE_ENV=production
PORT=3000
```

### 8. SSL 证书配置

```bash
# 创建 SSL 目录
sudo mkdir -p /opt/fix-platform/ssl

# 使用 Let's Encrypt 获取免费证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 复制证书文件
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/fix-platform/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/fix-platform/ssl/key.pem

# 设置权限
sudo chmod 600 /opt/fix-platform/ssl/*
```

### 9. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

## 🔧 手动部署

### 1. 安装 Node.js

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装 PM2

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 3. 部署应用

```bash
# 克隆代码
git clone https://github.com/your-repo/fix-platform.git
cd fix-platform

# 安装依赖
npm install

# 构建前端
npm run build

# 构建后端
npm run build:server
```

### 4. 配置 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'fix-platform-backend',
      script: './api/dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

### 5. 启动应用

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart all

# 停止应用
pm2 stop all
```

### 6. 配置 Nginx

```bash
# 安装 Nginx
sudo apt update
sudo apt install nginx

# 创建站点配置
sudo nano /etc/nginx/sites-available/fix-platform
```

添加配置内容（参考上面的 Nginx 配置）

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/fix-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

## 📊 监控和日志

### 1. 系统监控

```bash
# 安装 htop
sudo apt install htop

# 监控系统资源
htop

# 监控磁盘使用
df -h

# 监控内存使用
free -h
```

### 2. 应用监控

```bash
# PM2 监控
pm2 monit

# Docker 监控
docker stats

# 查看容器日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 日志管理

```bash
# 设置日志轮转
sudo nano /etc/logrotate.d/fix-platform
```

添加配置：

```
/opt/fix-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔄 自动化部署

### 1. 创建部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "开始部署..."

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建应用
npm run build
npm run build:server

# 重启服务
if command -v docker-compose &> /dev/null; then
    echo "使用 Docker 部署"
    docker-compose down
    docker-compose up -d --build
else
    echo "使用 PM2 部署"
    pm2 restart all
fi

echo "部署完成！"
```

### 2. 设置 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/fix-platform
          ./deploy.sh
```

## 🔒 安全配置

### 1. 防火墙配置

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow ssh

# 允许 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 查看状态
sudo ufw status
```

### 2. 定期更新

```bash
# 创建更新脚本
sudo nano /usr/local/bin/system-update.sh
```

添加内容：

```bash
#!/bin/bash
apt update && apt upgrade -y
apt autoremove -y
```

```bash
# 设置定时任务
sudo crontab -e

# 添加每周自动更新
0 2 * * 0 /usr/local/bin/system-update.sh
```

### 3. 备份策略

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup.sh
```

添加内容：

```bash
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 备份应用代码
tar -czf $BACKUP_DIR/app.tar.gz /opt/fix-platform

# 备份数据库（如果使用本地数据库）
# pg_dump database_name > $BACKUP_DIR/database.sql

# 清理旧备份（保留30天）
find /backup -type d -mtime +30 -exec rm -rf {} +
```

```bash
# 设置定时备份
sudo crontab -e

# 添加每日备份
0 3 * * * /usr/local/bin/backup.sh
```

## 🚨 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :3000
   
   # 检查服务状态
   docker-compose ps
   pm2 status
   ```

2. **内存不足**
   ```bash
   # 检查内存使用
   free -h
   
   # 清理缓存
   sudo sync && sudo sysctl vm.drop_caches=3
   ```

3. **磁盘空间不足**
   ```bash
   # 检查磁盘使用
   df -h
   
   # 清理 Docker 镜像
   docker system prune -a
   
   # 清理日志
   sudo journalctl --vacuum-time=7d
   ```

4. **SSL 证书过期**
   ```bash
   # 续期证书
   sudo certbot renew
   
   # 重启 Nginx
   sudo systemctl restart nginx
   ```

### 性能优化

1. **启用 HTTP/2**
   - 在 Nginx 配置中添加 `http2`

2. **配置缓存**
   - 设置静态资源缓存
   - 启用 Redis 缓存

3. **数据库优化**
   - 配置连接池
   - 添加适当索引

4. **CDN 配置**
   - 使用 CDN 加速静态资源
   - 配置图片压缩

---

**部署完成后，请访问 `https://your-domain.com` 验证系统是否正常运行。**