const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 基础健康检查
router.get('/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// 详细健康检查（包括数据库连接状态）
router.get('/health/detailed', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        sms: process.env.ENABLE_SMS_VERIFICATION === 'true' ? 'enabled' : 'disabled'
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
        },
        cpu: {
          usage: process.cpuUsage()
        }
      }
    };

    // 检查数据库连接状态
    try {
      const dbState = mongoose.connection.readyState;
      switch (dbState) {
        case 0:
          healthStatus.services.database = 'disconnected';
          break;
        case 1:
          healthStatus.services.database = 'connected';
          break;
        case 2:
          healthStatus.services.database = 'connecting';
          break;
        case 3:
          healthStatus.services.database = 'disconnecting';
          break;
        default:
          healthStatus.services.database = 'unknown';
      }

      // 如果数据库连接正常，进行简单的查询测试
      if (dbState === 1) {
        await mongoose.connection.db.admin().ping();
        healthStatus.services.database = 'healthy';
      }
    } catch (dbError) {
      healthStatus.services.database = 'error';
      healthStatus.status = 'degraded';
    }

    // 根据服务状态确定整体健康状态
    if (healthStatus.services.database === 'error' || healthStatus.services.database === 'disconnected') {
      healthStatus.status = 'unhealthy';
      res.status(503);
    } else if (healthStatus.services.database === 'connecting' || healthStatus.services.database === 'disconnecting') {
      healthStatus.status = 'degraded';
      res.status(200);
    } else {
      res.status(200);
    }

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// 就绪检查（用于容器编排）
router.get('/ready', async (req, res) => {
  try {
    // 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ready: false,
        reason: 'Database not connected'
      });
    }

    // 进行数据库ping测试
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 存活检查（用于容器编排）
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;