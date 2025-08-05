# Vercel 部署指南

## 环境变量配置

在 Vercel 项目设置中，需要配置以下环境变量：

### 必需的环境变量

1. **MONGODB_URI**
   - 描述：MongoDB 数据库连接字符串
   - 示例：`mongodb+srv://username:password@cluster.mongodb.net/fixplatform`
   - 获取方式：从 MongoDB Atlas 获取连接字符串

2. **JWT_SECRET**
   - 描述：JWT 令牌签名密钥
   - 示例：`your-super-secret-jwt-key-here`
   - 建议：使用强随机字符串，至少32位

3. **NODE_ENV**
   - 描述：运行环境
   - 值：`production`

### 可选的环境变量

4. **ENABLE_SMS_VERIFICATION**
   - 描述：是否启用短信验证
   - 值：`false`（生产环境建议关闭）

5. **CORS_ORIGIN**
   - 描述：允许的跨域来源
   - 示例：`https://your-app.vercel.app`

6. **MAX_FILE_SIZE**
   - 描述：最大文件上传大小
   - 默认值：`10mb`

## 部署步骤

1. **连接 GitHub 仓库**
   - 在 Vercel 控制台中导入项目
   - 选择 GitHub 仓库

2. **配置构建设置**
   - 构建命令：`npm run build`
   - 输出目录：`client/build`
   - 安装命令：`npm install`

3. **设置环境变量**
   - 在项目设置 > Environment Variables 中添加上述变量
   - 确保所有必需变量都已配置

4. **部署项目**
   - 点击 Deploy 按钮
   - 等待构建完成

## 故障排除

### 常见问题

1. **404 错误**
   - 检查 `vercel.json` 配置是否正确
   - 确保 API 路由配置正确

2. **数据库连接失败**
   - 检查 `MONGODB_URI` 是否正确
   - 确保 MongoDB Atlas 允许 Vercel IP 访问

3. **JWT 错误**
   - 检查 `JWT_SECRET` 是否配置
   - 确保密钥足够复杂

4. **CORS 错误**
   - 检查 `CORS_ORIGIN` 配置
   - 确保前端域名正确

### 调试方法

1. **查看构建日志**
   - 在 Vercel 控制台查看构建过程
   - 检查是否有错误信息

2. **查看函数日志**
   - 在 Functions 标签页查看 API 函数日志
   - 检查运行时错误

3. **测试 API 端点**
   - 访问 `https://your-app.vercel.app/api/health`
   - 检查 API 是否正常响应

## 性能优化

1. **启用压缩**
   - 已在代码中配置 gzip 压缩

2. **缓存策略**
   - 静态资源自动缓存
   - API 响应可配置缓存头

3. **函数优化**
   - 设置合适的函数超时时间
   - 优化数据库查询

## 监控和维护

1. **健康检查**
   - 定期访问 `/api/health` 端点
   - 监控应用状态

2. **日志监控**
   - 查看 Vercel 函数日志
   - 设置错误告警

3. **性能监控**
   - 使用 Vercel Analytics
   - 监控响应时间和错误率