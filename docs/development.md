# 开发文档

## 🛠️ 开发环境搭建

### 系统要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows/macOS/Linux

### 开发工具推荐
- **IDE**: VS Code
- **插件**: 
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Bracket Pair Colorizer

### 环境配置

1. **克隆项目**
```bash
git clone <repository-url>
cd Fix-Platform
```

2. **安装依赖**
```bash
npm install
```

3. **环境变量配置**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
# .env 文件内容：
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
ALI_ACCESS_KEY_ID=your_ali_sms_access_key_id
ALI_ACCESS_KEY_SECRET=your_ali_sms_access_key_secret
```

4. **数据库初始化**
```sql
-- 在Supabase SQL编辑器中执行
-- 1. 执行 supabase/migrations/001_initial_schema.sql
-- 2. 执行 supabase/migrations/002_add_missing_tables.sql
```

## 🏗️ 项目架构

### 目录结构详解

```
Fix-Platform/
├── api/                      # 后端API服务
│   ├── routes/              # 路由定义
│   │   ├── auth.ts         # 认证相关路由
│   │   ├── orders.ts       # 订单管理路由
│   │   ├── users.ts        # 用户管理路由
│   │   └── upload.ts       # 文件上传路由
│   ├── middleware/          # 中间件
│   │   └── auth.ts         # JWT认证中间件
│   ├── utils/              # 工具函数
│   │   ├── auth.ts         # 认证工具
│   │   └── sms.ts          # 短信服务
│   ├── config/             # 配置文件
│   │   └── database.ts     # 数据库配置
│   ├── app.ts              # Express应用配置
│   ├── server.ts           # 服务器启动文件
│   └── index.ts            # API入口文件
├── src/                     # 前端源代码
│   ├── components/         # 公共组件
│   │   ├── layout/        # 布局组件
│   │   └── Empty.tsx      # 空状态组件
│   ├── pages/              # 页面组件
│   │   ├── auth/          # 认证页面
│   │   ├── admin/         # 管理员页面
│   │   ├── repairman/     # 维修员页面
│   │   ├── customer-service/ # 客服页面
│   │   ├── orders/        # 订单页面
│   │   └── users/         # 用户页面
│   ├── hooks/              # 自定义Hook
│   │   └── useTheme.ts    # 主题Hook
│   ├── utils/              # 工具函数
│   │   └── api.ts         # API请求封装
│   ├── store/              # 状态管理
│   │   └── index.ts       # Zustand状态管理
│   ├── router/             # 路由配置
│   │   └── index.tsx      # 路由定义
│   └── lib/                # 库文件
│       └── utils.ts       # 通用工具函数
├── supabase/               # 数据库相关
│   └── migrations/        # 数据库迁移文件
├── docs/                   # 项目文档
├── uploads/                # 文件上传目录
└── public/                 # 静态资源
```

### 技术架构说明

#### 前端架构
- **React 18**: 使用函数组件和Hooks
- **TypeScript**: 严格类型检查
- **Ant Design**: UI组件库
- **Tailwind CSS**: 原子化CSS
- **Zustand**: 轻量级状态管理
- **React Router**: 客户端路由

#### 后端架构
- **Express**: Web框架
- **TypeScript**: 类型安全
- **JWT**: 身份认证
- **Multer**: 文件上传
- **Supabase**: 数据库服务

## 🔧 开发规范

### 代码规范

#### TypeScript规范
```typescript
// 接口定义
interface User {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'technician' | 'service' | 'admin';
  createdAt: string;
}

// 组件定义
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // 组件实现
};
```

#### 命名规范
- **文件名**: 使用PascalCase（组件）或camelCase（工具函数）
- **组件名**: PascalCase
- **变量名**: camelCase
- **常量名**: UPPER_SNAKE_CASE
- **接口名**: PascalCase，以I开头（可选）

#### 目录规范
```
# 页面组件目录结构
pages/
├── admin/
│   ├── Dashboard.tsx       # 管理员仪表板
│   ├── UserManagement.tsx  # 用户管理
│   └── index.ts           # 导出文件
```

### Git规范

#### 分支管理
- **main**: 主分支，生产环境代码
- **develop**: 开发分支
- **feature/xxx**: 功能分支
- **hotfix/xxx**: 热修复分支

#### 提交信息规范
```bash
# 格式：<type>(<scope>): <subject>

# 类型说明：
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动

# 示例：
feat(auth): 添加手机验证码登录功能
fix(order): 修复订单状态更新问题
docs(readme): 更新项目说明文档
```

## 🚀 开发流程

### 本地开发

1. **启动开发服务器**
```bash
# 同时启动前后端
npm run dev

# 分别启动
npm run client:dev  # 前端 (localhost:5173)
npm run server:dev  # 后端 (localhost:3000)
```

2. **代码检查**
```bash
# ESLint检查
npm run lint

# TypeScript类型检查
npm run check
```

3. **构建项目**
```bash
npm run build
```

### 新功能开发

1. **创建功能分支**
```bash
git checkout -b feature/new-feature
```

2. **开发流程**
   - 编写功能代码
   - 添加类型定义
   - 编写测试用例
   - 更新文档

3. **提交代码**
```bash
git add .
git commit -m "feat(module): 添加新功能描述"
git push origin feature/new-feature
```

4. **创建Pull Request**
   - 描述功能变更
   - 关联相关Issue
   - 请求代码审查

## 🔍 调试指南

### 前端调试

1. **React DevTools**
   - 安装浏览器扩展
   - 查看组件状态和props
   - 性能分析

2. **网络请求调试**
```typescript
// 在api.ts中添加请求日志
axios.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);
```

3. **状态管理调试**
```typescript
// Zustand devtools
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      // store implementation
    }),
    { name: 'app-store' }
  )
);
```

### 后端调试

1. **日志记录**
```typescript
// 添加详细日志
console.log('API Request:', req.method, req.path, req.body);
console.log('Database Query:', query, params);
console.error('Error:', error.message, error.stack);
```

2. **数据库调试**
```typescript
// Supabase查询调试
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Supabase Error:', error);
}
console.log('Query Result:', data);
```

## 📊 性能优化

### 前端优化

1. **代码分割**
```typescript
// 路由懒加载
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));

// 组件懒加载
const LazyComponent = lazy(() => import('./LazyComponent'));
```

2. **状态优化**
```typescript
// 使用useMemo缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 使用useCallback缓存函数
const handleClick = useCallback(() => {
  // 处理点击
}, [dependency]);
```

3. **图片优化**
```typescript
// 图片懒加载
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="description"
/>

// 图片压缩
const compressImage = (file: File) => {
  // 图片压缩逻辑
};
```

### 后端优化

1. **数据库查询优化**
```sql
-- 添加索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 优化查询
SELECT o.*, u.name as user_name 
FROM orders o 
JOIN users u ON o.user_id = u.id 
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 20;
```

2. **缓存策略**
```typescript
// Redis缓存
const cacheKey = `user:${userId}`;
const cachedUser = await redis.get(cacheKey);

if (cachedUser) {
  return JSON.parse(cachedUser);
}

const user = await getUserFromDB(userId);
await redis.setex(cacheKey, 3600, JSON.stringify(user));
return user;
```

## 🧪 测试指南

### 单元测试

```typescript
// 组件测试示例
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

test('renders user information', () => {
  const user = {
    id: '1',
    name: 'Test User',
    phone: '13800000000',
    role: 'user' as const,
    createdAt: '2024-01-01'
  };

  render(<UserCard user={user} />);
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('13800000000')).toBeInTheDocument();
});
```

### API测试

```typescript
// API测试示例
import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  test('POST /api/auth/login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '13800000000',
        code: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

## 🚀 部署指南

### 生产环境部署

1. **构建项目**
```bash
npm run build
```

2. **Docker部署**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

3. **Nginx配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 环境变量配置

```bash
# 生产环境变量
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key
JWT_SECRET=your_strong_jwt_secret
```

## 🔧 常见问题解决

### 开发环境问题

1. **端口占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
# 或者
lsof -ti:3000

# 杀死进程
taskkill /PID <PID> /F
# 或者
kill -9 <PID>
```

2. **依赖安装失败**
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

3. **TypeScript编译错误**
```bash
# 重新生成类型文件
npm run check

# 清除TypeScript缓存
rm -rf .tsbuildinfo
```

### 数据库问题

1. **连接失败**
   - 检查Supabase URL和密钥
   - 确认网络连接
   - 检查防火墙设置

2. **权限问题**
   - 检查RLS策略
   - 确认用户角色权限
   - 验证JWT令牌

### 部署问题

1. **构建失败**
   - 检查环境变量
   - 确认依赖版本
   - 查看构建日志

2. **运行时错误**
   - 检查生产环境配置
   - 查看服务器日志
   - 确认数据库连接

## 📚 学习资源

### 官方文档
- [React官方文档](https://react.dev/)
- [TypeScript官方文档](https://www.typescriptlang.org/)
- [Ant Design文档](https://ant.design/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Supabase文档](https://supabase.com/docs)

### 推荐教程
- React Hooks深入理解
- TypeScript最佳实践
- Node.js性能优化
- PostgreSQL查询优化

---

**持续学习，持续改进！如有技术问题，欢迎交流讨论。**