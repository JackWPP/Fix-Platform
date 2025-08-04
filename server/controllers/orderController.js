const Order = require('../models/Order');
const notificationService = require('../services/notificationService');

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

    // 计算订单金额
    const amount = SERVICE_PRICES[serviceType]?.[appointmentService] || 100;

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
      images: images || [],
      amount: amount,
      paymentStatus: 'unpaid'
    });

    const savedOrder = await order.save();
    
    // 发送新订单通知
    const io = req.app.get('io');
    if (io) {
      notificationService.sendNewOrderNotification(io, savedOrder._id, {
        deviceType: savedOrder.deviceType,
        deviceModel: savedOrder.deviceModel,
        problemDescription: savedOrder.problemDescription,
        urgency: savedOrder.urgency,
        contactName: savedOrder.contactName
      });
    }
    
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

    // 发送订单状态变更通知
    const io = req.app.get('io');
    if (io) {
      notificationService.sendOrderStatusNotification(
        io, 
        order._id, 
        '已取消', 
        order.userId, 
        order.assignedTo
      );
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

// 获取分配给维修员的订单
const getRepairmanOrders = async (req, res) => {
  try {
    const repairmanId = req.user.id;
    
    const orders = await Order.find({ 
      assignedTo: repairmanId 
    }).sort({ createdAt: -1 });
    
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

// 更新订单状态（维修员）
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repairNotes, repairImages } = req.body;
    const repairmanId = req.user.id;
    
    const order = await Order.findOne({ 
      _id: id, 
      assignedTo: repairmanId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无权限操作'
      });
    }
    
    // 更新订单信息
    const oldStatus = order.status;
    order.status = status;
    if (repairNotes) order.repairNotes = repairNotes;
    if (repairImages) order.repairImages = repairImages;
    order.updatedAt = new Date();
    
    await order.save();
    
    // 发送订单状态变更通知（仅当状态实际改变时）
    if (oldStatus !== status) {
      const io = req.app.get('io');
      if (io) {
        notificationService.sendOrderStatusNotification(
          io, 
          order._id, 
          status, 
          order.userId, 
          order.assignedTo
        );
      }
    }
    
    res.json({
      success: true,
      message: '订单更新成功',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取所有订单（管理员）
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name phone')
      .populate('assignedTo', 'name phone')
      .sort({ createdAt: -1 });
    
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

// 分配订单给维修员（管理员）
const assignOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { repairmanId } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    order.assignedTo = repairmanId;
    order.status = 'in_progress';
    order.updatedAt = new Date();
    
    await order.save();
    
    // 发送订单分配通知
    const io = req.app.get('io');
    if (io) {
      notificationService.sendOrderAssignmentNotification(io, order._id, repairmanId, {
        deviceType: order.deviceType,
        deviceModel: order.deviceModel,
        problemDescription: order.problemDescription,
        urgency: order.urgency,
        contactName: order.contactName
      });
      
      // 同时发送状态变更通知
      notificationService.sendOrderStatusNotification(
        io, 
        order._id, 
        'in_progress', 
        order.userId, 
        repairmanId
      );
    }
    
    res.json({
      success: true,
      message: '订单分配成功',
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
  rateOrder,
  getRepairmanOrders,
  updateOrderStatus,
  getAllOrders,
  assignOrder
};