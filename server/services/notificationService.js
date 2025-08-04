const notificationService = {
  // 发送订单状态变更通知
  sendOrderStatusNotification: (io, orderId, newStatus, userId, assignedTo) => {
    const notification = {
      type: 'order_status_change',
      orderId,
      newStatus,
      message: `订单 ${orderId} 状态已更新为: ${getStatusText(newStatus)}`,
      timestamp: new Date().toISOString()
    };

    // 通知订单创建者
    if (userId) {
      io.to(`user_${userId}`).emit('notification', notification);
    }

    // 通知分配的维修员
    if (assignedTo) {
      io.to(`user_${assignedTo}`).emit('notification', notification);
    }

    // 通知客服和管理员
    io.to('customer_service').emit('notification', notification);
    io.to('admin').emit('notification', notification);

    console.log(`Order status notification sent for order ${orderId}`);
  },

  // 发送新订单分配通知
  sendOrderAssignmentNotification: (io, orderId, repairmanId, orderDetails) => {
    const notification = {
      type: 'order_assignment',
      orderId,
      message: `您有新的维修订单: ${orderDetails.deviceType} - ${orderDetails.problemDescription}`,
      orderDetails,
      timestamp: new Date().toISOString()
    };

    // 通知被分配的维修员
    io.to(`user_${repairmanId}`).emit('notification', notification);
    io.to('repairman').emit('notification', notification);

    console.log(`Order assignment notification sent to repairman ${repairmanId}`);
  },

  // 发送新订单创建通知
  sendNewOrderNotification: (io, orderId, orderDetails) => {
    const notification = {
      type: 'new_order',
      orderId,
      message: `新订单创建: ${orderDetails.deviceType} - ${orderDetails.problemDescription}`,
      orderDetails,
      timestamp: new Date().toISOString()
    };

    // 通知客服和管理员
    io.to('customer_service').emit('notification', notification);
    io.to('admin').emit('notification', notification);

    console.log(`New order notification sent for order ${orderId}`);
  },

  // 发送系统消息
  sendSystemMessage: (io, targetRole, message, data = {}) => {
    const notification = {
      type: 'system_message',
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (targetRole === 'all') {
      io.emit('notification', notification);
    } else {
      io.to(targetRole).emit('notification', notification);
    }

    console.log(`System message sent to ${targetRole}: ${message}`);
  }
};

// 辅助函数：获取状态文本
function getStatusText(status) {
  const statusMap = {
    'pending': '待处理',
    'confirmed': '已确认',
    'in_progress': '处理中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
}

module.exports = notificationService;