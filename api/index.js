const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 导入中间件
const errorHandler = require('../server/middleware/errorHandler');
const { corsOptions, helmetOptions, requestLogger, securityHeaders } = require('../server/middleware/security');
const { generalLimiter, authLimiter, codeLimiter, registerLimiter } = require('../server/middleware/rateLimiter');

const app = express();

// 安全中间件
app.use(helmet(helmetOptions));
app.use(securityHeaders);
app.use(cors(corsOptions));

// 请求解析中间件
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 通用请求限制
app.use(generalLimiter);

// 应用特定的速率限制
app.use('/api/auth/send-code', codeLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login-with-code', authLimiter);

// 请求日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Connect to MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixplatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fix-Platform API' });
});

// API路由
const authRoutes = require('../server/routes/authRoutes');
const orderRoutes = require('../server/routes/orderRoutes');
const userRoutes = require('../server/routes/userRoutes');
const paymentRoutes = require('../server/routes/paymentRoutes');
const statsRoutes = require('../server/routes/statsRoutes');
const configRoutes = require('../server/routes/configRoutes');
const healthRoutes = require('../server/routes/healthRoutes');

// 健康检查路由（不需要认证）
app.use('/api', healthRoutes);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/config', configRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 导出为Vercel函数
module.exports = app;