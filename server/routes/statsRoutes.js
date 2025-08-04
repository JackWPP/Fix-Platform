const express = require('express');
const router = express.Router();
const {
  getOrderStats,
  getRepairmanStats,
  getCustomerSatisfactionStats,
  getRevenueStats,
  getDashboardStats
} = require('../controllers/statsController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// 获取订单统计数据 - 管理员和客服可访问
router.get('/orders', auth, roleAuth(['admin', 'customer_service']), getOrderStats);

// 获取维修员绩效统计 - 仅管理员可访问
router.get('/repairman', auth, roleAuth(['admin']), getRepairmanStats);

// 获取客户满意度统计 - 管理员和客服可访问
router.get('/satisfaction', auth, roleAuth(['admin', 'customer_service']), getCustomerSatisfactionStats);

// 获取收入统计 - 仅管理员可访问
router.get('/revenue', auth, roleAuth(['admin']), getRevenueStats);

// 获取综合仪表盘数据 - 管理员和客服可访问
router.get('/dashboard', auth, roleAuth(['admin', 'customer_service']), getDashboardStats);

module.exports = router;