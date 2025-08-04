const rateLimit = require('express-rate-limit');

// 通用限制器
const createLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        message
      });
    }
  });
};

// 通用API限制器 - 每15分钟100个请求
const generalLimiter = createLimiter(
  15 * 60 * 1000, // 15分钟
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  '请求过于频繁，请稍后再试'
);

// 认证相关限制器 - 每15分钟5次登录尝试
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15分钟
  5,
  '登录尝试次数过多，请15分钟后再试',
  true // 成功的请求不计入限制
);

// 验证码限制器 - 每分钟1次
const codeLimiter = createLimiter(
  60 * 1000, // 1分钟
  1,
  '验证码发送过于频繁，请1分钟后再试'
);

// 注册限制器 - 每小时3次注册
const registerLimiter = createLimiter(
  60 * 60 * 1000, // 1小时
  3,
  '注册过于频繁，请1小时后再试'
);

// 密码重置限制器 - 每小时3次
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000, // 1小时
  3,
  '密码重置请求过于频繁，请1小时后再试'
);

module.exports = {
  generalLimiter,
  authLimiter,
  codeLimiter,
  registerLimiter,
  passwordResetLimiter
};