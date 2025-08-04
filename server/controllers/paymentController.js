const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');
const crypto = require('crypto');

// 服务价格配置
const SERVICE_PRICES = {
  repair: {
    cleaning: 50,
    screen_replacement: 200,
    battery_replacement: 150,
    system_reinstall: 80,
    software_install: 30
  },
  appointment: {
    cleaning: 50,
    screen_replacement: 200,
    battery_replacement: 150,
    system_reinstall: 80,
    software_install: 30
  }
};

// 获取服务价格
exports.getServicePrice = async (req, res) => {
  try {
    const { serviceType, appointmentService } = req.query;
    
    if (!serviceType || !appointmentService) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    const price = SERVICE_PRICES[serviceType]?.[appointmentService];
    
    if (price === undefined) {
      return res.status(400).json({
        success: false,
        message: '无效的服务类型或服务项目'
      });
    }
    
    res.json({
      success: true,
      price: price
    });
  } catch (error) {
    console.error('获取服务价格失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取所有服务价格列表
exports.getServicePrices = async (req, res) => {
  try {
    res.json({
      success: true,
      prices: SERVICE_PRICES
    });
  } catch (error) {
    console.error('获取服务价格列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 发起支付
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 查找订单
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 检查订单是否已支付
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: '订单已支付'
      });
    }
    
    // 计算订单金额（如果还没有设置）
    if (order.amount === 0) {
      const price = SERVICE_PRICES[order.serviceType]?.[order.appointmentService] || 100;
      order.amount = price;
    }
    
    // 生成支付订单号
    const paymentOrderId = generatePaymentOrderId();
    
    // 更新订单支付信息
    order.paymentMethod = paymentMethod;
    order.paymentOrderId = paymentOrderId;
    order.paymentStatus = 'pending';
    
    await order.save();
    
    // 模拟支付接口响应
    const paymentResponse = await simulatePaymentAPI({
      orderId: order._id,
      paymentOrderId,
      amount: order.amount,
      paymentMethod
    });
    
    res.json({
      success: true,
      paymentOrderId,
      amount: order.amount,
      paymentUrl: paymentResponse.paymentUrl,
      qrCode: paymentResponse.qrCode
    });
  } catch (error) {
    console.error('发起支付失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 查询支付状态
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.amount,
      paymentTime: order.paymentTime
    });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 支付回调处理
exports.paymentCallback = async (req, res) => {
  try {
    const { paymentOrderId, status, transactionId } = req.body;
    
    // 使用支付服务处理支付结果
    if (status === 'success') {
      await PaymentService.handlePaymentSuccess(paymentOrderId, transactionId);
    } else if (status === 'failed') {
      await PaymentService.handlePaymentFailure(paymentOrderId, '第三方支付失败');
    }
    
    res.json({
      success: true,
      message: '支付状态更新成功'
    });
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};

// 模拟支付（用于测试）
exports.simulatePayment = async (req, res) => {
  try {
    const { paymentOrderId, success = true } = req.body;
    
    // 查找订单
    const order = await Order.findOne({ paymentOrderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 使用支付服务处理支付结果
    let result;
    if (success) {
      result = await PaymentService.handlePaymentSuccess(paymentOrderId);
    } else {
      result = await PaymentService.handlePaymentFailure(paymentOrderId, '模拟支付失败');
    }
    
    res.json({
      success: true,
      message: success ? '支付成功' : '支付失败',
      paymentStatus: result.order.paymentStatus,
      orderStatus: result.order.status
    });
  } catch (error) {
    console.error('模拟支付失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};

// 申请退款
exports.requestRefund = async (req, res) => {
  try {
    const { orderId, refundAmount, refundReason } = req.body;
    const operatorId = req.user ? req.user.id : null;
    
    // 使用支付服务处理退款
    const result = await PaymentService.handleRefund(orderId, refundAmount, refundReason, operatorId);
    
    res.json({
      success: true,
      message: '退款处理成功',
      order: result.order
    });
  } catch (error) {
    console.error('申请退款失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};

// 获取支付统计数据
exports.getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const statistics = await PaymentService.getPaymentStatistics(startDate, endDate);
    
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('获取支付统计失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};

// 生成支付订单号
function generatePaymentOrderId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `PAY${timestamp}${random}`.toUpperCase();
}

// 模拟支付API
async function simulatePaymentAPI({ orderId, paymentOrderId, amount, paymentMethod }) {
  // 模拟不同支付方式的响应
  const responses = {
    wechat: {
      paymentUrl: `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=${paymentOrderId}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
    },
    alipay: {
      paymentUrl: `https://openapi.alipay.com/gateway.do?method=alipay.trade.page.pay&out_trade_no=${paymentOrderId}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
    }
  };
  
  return responses[paymentMethod] || responses.wechat;
}