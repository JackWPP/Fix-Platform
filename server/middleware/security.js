const helmet = require('helmet');
const cors = require('cors');
const logger = require('../utils/logger');

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

    // 生产环境下添加实际域名
    if (process.env.NODE_ENV === 'production') {
      // 可以从环境变量中读取生产域名
      const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      allowedOrigins.push(...productionOrigins);
    }

    // 开发环境允许无origin的请求（如Postman）
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('不允许的跨域请求'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};

// Helmet安全配置
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:']
    },
  },
  crossOriginEmbedderPolicy: false // 允许跨域嵌入
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  
  next();
};

// 安全头部中间件
const securityHeaders = (req, res, next) => {
  // 移除暴露服务器信息的头部
  res.removeHeader('X-Powered-By');
  
  // 添加安全头部
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 生产环境下强制HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

module.exports = {
  corsOptions,
  helmetOptions,
  requestLogger,
  securityHeaders
};