const Order = require('../models/Order');

// 创建订单
const createOrder = async (req, res) => {
  try {
    const { 
      deviceType, 
      deviceModel,
      serviceType,
      appointmentService,
      liquidMetal,
      problemDescription,
      issueDescription,
      urgency,
      contactName,
      contactPhone,
      appointmentTime,
      images
    } = req.body;
    
    // 如果没有用户认证，创建临时订单（用于演示）
    const userId = req.user ? req.user.id : null;

    const order = new Order({
      userId,
      deviceType,
      deviceModel,
      serviceType,
      appointmentService,
      liquidMetal,
      problemDescription: problemDescription || issueDescription,
      issueDescription: problemDescription || issueDescription,
      urgency,
      contactName,
      contactPhone,
      appointmentTime,
      images: images || []
    });

    const savedOrder = await order.save();
    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取用户订单列表
const getOrders = async (req, res) => {
  try {
    // 如果没有用户认证，返回所有订单（用于演示）
    const query = req.user ? { userId: req.user.id } : {};
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
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
    
    // 如果没有用户认证，允许查看任何订单（用于演示）
    const query = req.user ? { _id: id, userId: req.user.id } : { _id: id };
    
    const order = await Order.findOne(query);
    
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
    console.error('获取订单详情错误:', error);
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
    
    // 如果没有用户认证，允许取消任何订单（用于演示）
    const query = req.user ? { _id: id, userId: req.user.id, status: '待处理' } : { _id: id, status: '待处理' };

    const order = await Order.findOneAndUpdate(
      query,
      { status: '已取消', updatedAt: Date.now() },
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
    console.error('取消订单错误:', error);
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
    
    // 如果没有用户认证，允许评价任何订单（用于演示）
    const query = req.user ? { _id: id, userId: req.user.id, status: '已完成' } : { _id: id, status: '已完成' };

    const order = await Order.findOneAndUpdate(
      query,
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
    console.error('评价订单错误:', error);
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