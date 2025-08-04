# 多阶段构建
# 阶段1: 构建前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# 复制前端依赖文件
COPY client/package*.json ./

# 安装前端依赖
RUN npm ci --only=production

# 复制前端源码
COPY client/ ./

# 构建前端
RUN npm run build

# 阶段2: 构建后端
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# 复制后端依赖文件
COPY server/package*.json ./

# 安装后端依赖
RUN npm ci --only=production

# 阶段3: 生产环境
FROM node:18-alpine AS production

# 安装必要的系统依赖
RUN apk add --no-cache \
    tini \
    dumb-init

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# 复制后端文件
COPY --from=backend-builder --chown=nodejs:nodejs /app/server ./server
COPY --chown=nodejs:nodejs server/ ./server/

# 复制前端构建文件
COPY --from=frontend-builder --chown=nodejs:nodejs /app/client/build ./client/build

# 创建必要的目录
RUN mkdir -p logs uploads && chown -R nodejs:nodejs logs uploads

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 使用tini作为init进程
ENTRYPOINT ["tini", "--"]

# 启动应用
CMD ["node", "server/app.js"]