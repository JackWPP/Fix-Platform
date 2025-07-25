const Order = require('../models/Order');

// 创建订单
const createOrder = async (req, res) => {
  try {
    const { deviceType, issueDescription } = req.body;
    const userId = req.user.id; // 从认证中间件获取用户ID

    const order = new Order({
      userId,
      deviceType,
      issueDescription
    });

    const savedOrder = await order.save();
    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    message: error.message
    });
  }
};

// 获取用户订单列表
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id; // 从认证中间件获取用户ID

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取订单详情
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // 从认证中间件获取用户ID

    const order = await Order.findOne({ _id: id, userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 取消订单
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // 从认证中间件获取用户ID

    const order = await Order.findOneAndUpdate(
      { _id: id, userId, status: 'pending' },
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无法取消'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 评价订单
const rateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // 从认证中间件获取用户ID

    const order = await Order.findOneAndUpdate(
      { _id: id, userId, status: 'completed' },
      { 
        rating: { score: rating, comment },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无法评价'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
  rateOrder
};