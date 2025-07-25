const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
  rateOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

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

module.exports = router;