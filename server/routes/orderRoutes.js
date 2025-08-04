const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
  rateOrder,
  getRepairmanOrders,
  updateOrderStatus,
  getAllOrders,
  assignOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 创建订单
router.post('/', createOrder);

// 获取用户订单列表
router.get('/', getOrders);

// 获取订单详情
router.get('/:id', getOrderDetail);

// 取消订单
router.put('/:id/cancel', cancelOrder);

// 评价订单
router.post('/:id/rate', rateOrder);

// 维修员相关路由
// 获取分配给维修员的订单
router.get('/repairman/orders', roleAuth(['repairman']), getRepairmanOrders);

// 更新订单状态（维修员）
router.put('/:id/status', roleAuth(['repairman']), updateOrderStatus);

// 管理员相关路由
// 获取所有订单（管理员）
router.get('/admin/all', roleAuth(['admin']), getAllOrders);

// 分配订单给维修员（管理员）
router.put('/:id/assign', roleAuth(['admin']), assignOrder);

module.exports = router;