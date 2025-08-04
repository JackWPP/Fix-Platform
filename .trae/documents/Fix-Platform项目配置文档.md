# Fix-Platform 项目配置文档

## 1. 版本控制配置

### 1.1 .gitignore 配置优化

项目使用优化的 .gitignore 配置，确保重要文档被正确跟踪：

**主要配置项：**
- **环境变量文件**：`.env*` - 保护敏感配置信息
- **依赖目录**：`node_modules/` - 排除第三方依赖包
- **构建输出**：`dist/`, `build/` - 排除编译生成文件
- **IDE配置**：`.vscode/`, `.idea/` - 排除编辑器配置
- **日志文件**：`*.log`, `logs/` - 排除运行日志
- **系统文件**：`.DS_Store`, `Thumbs.db` - 排除系统生成文件
- **临时文件**：`.tmp/`, `temp/` - 排除临时文件

**文档管理策略：**
- ✅ 保留 `.trae/documents/` 下的项目文档
- ❌ 忽略 `.trae/TODO.md` 临时文件
- ✅ 跟踪所有 Markdown 文档文件

### 1.2 .vercelignore 配置

优化的部署配置确保只部署必要文件：

**排除项目：**
- `node_modules` - 依赖包（Vercel会自动安装）
- `.git` - 版本控制文件
- `*.log` - 日志文件
- `.env.local` - 本地环境变量
- `README.md` - 项目说明文档
- `.trae/` - 开发工具配置

**部署优势：**
- 减少部署包大小
- 提高部署速度
- 保护敏感信息
- 避免不必要文件上传

## 2. 环境配置管理

### 2.1 多环境支持

项目支持多环境配置：

| 环境 | 配置文件 | 数据库 | 日志级别 | 描述 |
|------|----------|--------|----------|------|
| 开发环境 | `.env.development` | 本地MongoDB | debug | 本地开发调试 |
| 测试环境 | `.env.test` | 测试数据库 | info | 功能测试验证 |
| 生产环境 | `.env.production` | 生产数据库 | error | 线上运行环境 |

### 2.2 环境变量配置

**必需环境变量：**
```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/fix-platform

# JWT密钥
JWT_SECRET=your-secret-key

# 服务端口
PORT=5000

# 前端地址
CLIENT_URL=http://localhost:3000

# 文件上传路径
UPLOAD_PATH=./uploads
```

**可选环境变量：**
```bash
# 支付配置
WECHAT_PAY_APP_ID=your-wechat-app-id
ALIPAY_APP_ID=your-alipay-app-id

# 短信服务
SMS_ACCESS_KEY=your-sms-key
SMS_SECRET_KEY=your-sms-secret

# 云存储
OSS_ACCESS_KEY=your-oss-key
OSS_SECRET_KEY=your-oss-secret
```

## 3. Docker 配置

### 3.1 Docker Compose 服务编排

项目使用 Docker Compose 进行多服务管理：

**服务组件：**
- **MongoDB**：数据库服务
- **Backend**：Node.js 后端服务
- **Frontend**：React 前端服务
- **Nginx**：反向代理服务（可选）

**数据持久化：**
- MongoDB 数据卷映射
- 文件上传目录映射
- 日志文件映射

### 3.2 容器化优势

- **环境一致性**：开发、测试、生产环境统一
- **快速部署**：一键启动所有服务
- **资源隔离**：服务间相互独立
- **扩展性**：支持水平扩展

## 4. 部署配置

### 4.1 Vercel 自动化部署

**部署特性：**
- Git 集成自动部署
- 环境变量管理
- 自定义域名支持
- SSL 证书自动配置

**构建配置：**
```json
{
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ]
}
```

### 4.2 CI/CD 流程

**自动化流程：**
1. 代码推送到 Git 仓库
2. 触发 Vercel 自动构建
3. 运行测试用例
4. 构建前端应用
5. 部署到生产环境
6. 健康检查验证

## 5. 安全配置

### 5.1 敏感信息保护

**保护措施：**
- 环境变量存储敏感配置
- .gitignore 排除敏感文件
- JWT 密钥定期更换
- API 接口访问限制

### 5.2 文件安全

**上传限制：**
- 文件类型白名单
- 文件大小限制（5MB）
- 文件名安全检查
- 病毒扫描（推荐）

## 6. 监控与日志

### 6.1 日志配置

**日志级别：**
- **ERROR**：错误信息
- **WARN**：警告信息
- **INFO**：一般信息
- **DEBUG**：调试信息

**日志输出：**
- 控制台输出（开发环境）
- 文件输出（生产环境）
- 日志轮转配置

### 6.2 性能监控

**监控指标：**
- API 响应时间
- 数据库查询性能
- 内存使用情况
- 错误率统计

## 7. 开发工具配置

### 7.1 代码规范

**ESLint 配置：**
- React 代码规范
- ES6+ 语法检查
- 代码风格统一

**Prettier 配置：**
- 自动代码格式化
- 统一缩进和换行
- 保存时自动格式化

### 7.2 Git 工作流

**分支策略：**
- `main`：主分支（生产环境）
- `develop`：开发分支
- `feature/*`：功能分支
- `hotfix/*`：热修复分支

**提交规范：**
- `feat:`：新功能
- `fix:`：修复问题
- `docs:`：文档更新
- `style:`：代码格式
- `refactor:`：代码重构
- `test:`：测试相关
- `chore:`：构建过程或辅助工具的变动

## 8. 文档管理

### 8.1 文档结构

```
.trae/documents/
├── Fix-Platform产品需求文档.md
├── Fix-Platform技术架构文档.md
├── Fix-Platform项目现状分析与开发计划.md
└── Fix-Platform项目配置文档.md
```

### 8.2 文档维护原则

- **实时更新**：随项目进展同步更新
- **版本控制**：所有文档纳入 Git 管理
- **格式统一**：使用 Markdown 格式
- **内容完整**：涵盖需求、架构、配置等
- **易于查找**：合理的文件命名和目录结构

## 9. 配置文件清单

### 9.1 根目录配置文件

- `.gitignore` - Git 忽略规则
- `.vercelignore` - Vercel 部署忽略规则
- `docker-compose.yml` - Docker 服务编排
- `package.json` - 项目依赖和脚本

### 9.2 客户端配置文件

- `client/.env` - 前端环境变量
- `client/.gitignore` - 前端忽略规则
- `client/package.json` - 前端依赖
- `client/Dockerfile` - 前端容器配置

### 9.3 服务端配置文件

- `server/.env` - 后端环境变量
- `server/package.json` - 后端依赖
- `server/Dockerfile` - 后端容器配置

## 10. 最佳实践建议

### 10.1 开发建议

- 定期更新依赖包版本
- 遵循代码规范和提交规范
- 编写单元测试和集成测试
- 定期备份重要数据

### 10.2 部署建议

- 使用环境变量管理配置
- 实施蓝绿部署策略
- 配置健康检查和监控
- 定期进行安全审计

### 10.3 维护建议

- 定期清理日志文件
- 监控系统性能指标
- 及时处理安全漏洞
- 保持文档更新同步
