const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// 获取服务价格
router.get('/price', paymentController.getServicePrice);

// 获取所有服务价格列表
router.get('/prices', paymentController.getServicePrices);

// 发起支付（需要认证）
router.post('/initiate', auth, paymentController.initiatePayment);

// 查询支付状态（需要认证）
router.get('/status/:orderId', auth, paymentController.getPaymentStatus);

// 支付回调（不需要认证，用于第三方支付平台回调）
router.post('/callback', paymentController.paymentCallback);

// 模拟支付（用于测试，需要认证）
router.post('/simulate', auth, paymentController.simulatePayment);

// 申请退款（需要认证）
router.post('/refund', auth, paymentController.requestRefund);

// 获取支付统计数据（需要认证）
router.get('/statistics', auth, paymentController.getPaymentStatistics);

module.exports = router;