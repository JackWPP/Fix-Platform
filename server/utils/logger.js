const fs = require('fs');
const path = require('path');

// 日志级别定义
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// 根据环境设置日志级别
const getLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : 
    (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);
};

// 确保日志目录存在
const ensureLogDir = () => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

// 格式化日志消息
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  // 控制台输出格式
  const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  return {
    console: consoleMessage,
    file: JSON.stringify(logEntry)
  };
};

// 写入文件日志
const writeToFile = (level, formattedMessage) => {
  if (process.env.NODE_ENV === 'test') return; // 测试环境不写文件
  
  try {
    const logDir = ensureLogDir();
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${today}.log`);
    const errorLogFile = path.join(logDir, `${today}-error.log`);
    
    // 所有日志写入主日志文件
    fs.appendFileSync(logFile, formattedMessage.file + '\n');
    
    // 错误日志单独写入错误日志文件
    if (level === 'ERROR') {
      fs.appendFileSync(errorLogFile, formattedMessage.file + '\n');
    }
  } catch (error) {
    console.error('Failed to write log to file:', error);
  }
};

// 日志记录器类
class Logger {
  constructor() {
    this.currentLevel = getLogLevel();
  }
  
  shouldLog(level) {
    return LOG_LEVELS[level.toUpperCase()] <= this.currentLevel;
  }
  
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formatted = formatMessage(level, message, meta);
    
    // 控制台输出
    if (level === 'ERROR') {
      console.error(formatted.console);
    } else if (level === 'WARN') {
      console.warn(formatted.console);
    } else {
      console.log(formatted.console);
    }
    
    // 文件输出
    writeToFile(level, formatted);
  }
  
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }
  
  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }
  
  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }
  
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
  
  // HTTP请求日志
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || 'anonymous'
    };
    
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`;
    
    if (res.statusCode >= 400) {
      this.warn(message, logData);
    } else {
      this.info(message, logData);
    }
  }
  
  // 数据库操作日志
  logDatabase(operation, collection, query = {}, result = {}) {
    const logData = {
      operation,
      collection,
      query: JSON.stringify(query),
      result: typeof result === 'object' ? JSON.stringify(result) : result
    };
    
    this.debug(`Database ${operation} on ${collection}`, logData);
  }
  
  // 认证日志
  logAuth(action, userId, success, details = {}) {
    const logData = {
      action,
      userId,
      success,
      ...details
    };
    
    const message = `Auth ${action} for user ${userId}: ${success ? 'SUCCESS' : 'FAILED'}`;
    
    if (success) {
      this.info(message, logData);
    } else {
      this.warn(message, logData);
    }
  }
  
  // 系统错误日志
  logSystemError(error, context = {}) {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };
    
    this.error(`System Error: ${error.message}`, logData);
  }
}

// 创建全局日志实例
const logger = new Logger();

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  logger.logSystemError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.logSystemError(new Error(reason), { 
    type: 'unhandledRejection',
    promise: promise.toString()
  });
});

module.exports = logger;