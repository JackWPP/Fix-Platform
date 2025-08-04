const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.logSystemError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body
  });

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = { message, statusCode: 404 };
  }

  // Mongoose 重复字段错误
  if (err.code === 11000) {
    const message = '数据已存在';
    error = { message, statusCode: 400 };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的访问令牌';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = '访问令牌已过期';
    error = { message, statusCode: 401 };
  }

  // 生产环境下不暴露错误堆栈
  const response = {
    success: false,
    message: error.message || '服务器内部错误'
  };

  // 开发环境下包含错误堆栈
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;