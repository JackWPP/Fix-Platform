const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
require('dotenv').config();

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const { corsOptions, helmetOptions, requestLogger, securityHeaders } = require('./middleware/security');
const { generalLimiter, authLimiter, codeLimiter, registerLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

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

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fix-Platform API' });
});

// API路由
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const configRoutes = require('./routes/configRoutes');
const healthRoutes = require('./routes/healthRoutes');

// 健康检查路由（不需要认证）
app.use('/api', healthRoutes);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/config', configRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixplatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io JWT认证中间件
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io连接处理
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} (${socket.userRole}) connected`);
  
  // 根据用户角色加入相应的房间
  socket.join(socket.userRole);
  socket.join(`user_${socket.userId}`);
  
  // 处理断开连接
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 将io实例添加到app中，供其他模块使用
app.set('io', io);
// 同时设置为全局变量，供服务模块使用
global.io = io;

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Socket.io server initialized');
});

module.exports = app;