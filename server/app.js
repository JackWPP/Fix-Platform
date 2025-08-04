const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

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

// 将io实例添加到app中，供其他模块使用
app.set('io', io);
// 同时设置为全局变量，供服务模块使用
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Socket.io server initialized');
});