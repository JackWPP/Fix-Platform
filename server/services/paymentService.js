const Order = require('../models/Order');
const notificationService = require('./notificationService');

class PaymentService {
  // 处理支付成功后的业务逻辑
  static async handlePaymentSuccess(paymentOrderId, transactionId = null) {
    try {
      // 查找订单
      const order = await Order.findOne({ paymentOrderId });
      if (!order) {
        throw new Error('订单不存在');
      }

      // 更新支付状态
      order.paymentStatus = 'paid';
      order.paymentTime = new Date();
      
      // 支付成功后自动更新订单状态
      if (order.status === '待处理') {
        order.status = '处理中';
      }

      await order.save();

      // 发送支付成功通知
      const io = global.io; // 假设io实例是全局可访问的
      if (io) {
        // 通知用户支付成功
        if (order.userId) {
          io.to(`user_${order.userId}`).emit('paymentSuccess', {
            orderId: order._id,
            amount: order.amount,
            paymentTime: order.paymentTime
          });
        }

        // 通知管理员和客服有新的已支付订单
        io.to('admin').emit('newPaidOrder', {
          orderId: order._id,
          deviceType: order.deviceType,
          amount: order.amount,
          contactName: order.contactName
        });

        io.to('customer_service').emit('newPaidOrder', {
          orderId: order._id,
          deviceType: order.deviceType,
          amount: order.amount,
          contactName: order.contactName
        });

        // 发送订单状态变更通知
        notificationService.sendOrderStatusNotification(
          io,
          order._id,
          order.status,
          order.userId,
          order.assignedTo
        );
      }

      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('处理支付成功失败:', error);
      throw error;
    }
  }

  // 处理支付失败后的业务逻辑
  static async handlePaymentFailure(paymentOrderId, reason = null) {
    try {
      // 查找订单
      const order = await Order.findOne({ paymentOrderId });
      if (!order) {
        throw new Error('订单不存在');
      }

      // 更新支付状态
      order.paymentStatus = 'failed';
      
      await order.save();

      // 发送支付失败通知
      const io = global.io;
      if (io && order.userId) {
        io.to(`user_${order.userId}`).emit('paymentFailed', {
          orderId: order._id,
          reason: reason || '支付失败，请重试'
        });
      }

      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('处理支付失败失败:', error);
      throw error;
    }
  }

  // 处理退款业务逻辑
  static async handleRefund(orderId, refundAmount, refundReason, operatorId = null) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.paymentStatus !== 'paid') {
        throw new Error('订单未支付，无法退款');
      }

      if (refundAmount > order.amount) {
        throw new Error('退款金额不能超过订单金额');
      }

      // 更新退款信息
      order.refundAmount = refundAmount;
      order.refundTime = new Date();
      order.refundReason = refundReason;
      order.paymentStatus = 'refunded';
      
      // 如果全额退款，将订单状态改为已取消
      if (refundAmount === order.amount) {
        order.status = '已取消';
      }

      await order.save();

      // 发送退款通知
      const io = global.io;
      if (io) {
        // 通知用户退款成功
        if (order.userId) {
          io.to(`user_${order.userId}`).emit('refundSuccess', {
            orderId: order._id,
            refundAmount: refundAmount,
            refundTime: order.refundTime
          });
        }

        // 通知管理员退款完成
        io.to('admin').emit('refundCompleted', {
          orderId: order._id,
          refundAmount: refundAmount,
          operatorId: operatorId
        });
      }

      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('处理退款失败:', error);
      throw error;
    }
  }

  // 获取支付统计数据
  static async getPaymentStatistics(startDate = null, endDate = null) {
    try {
      const matchCondition = {};
      
      if (startDate && endDate) {
        matchCondition.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const statistics = await Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // 格式化统计结果
      const result = {
        unpaid: { count: 0, totalAmount: 0 },
        pending: { count: 0, totalAmount: 0 },
        paid: { count: 0, totalAmount: 0 },
        failed: { count: 0, totalAmount: 0 },
        refunded: { count: 0, totalAmount: 0 }
      };

      statistics.forEach(stat => {
        if (result[stat._id]) {
          result[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount
          };
        }
      });

      return result;
    } catch (error) {
      console.error('获取支付统计失败:', error);
      throw error;
    }
  }

  // 模拟第三方支付平台的异步通知
  static simulateAsyncPaymentNotification(paymentOrderId, success = true, delay = 2000) {
    setTimeout(async () => {
      try {
        if (success) {
          await PaymentService.handlePaymentSuccess(paymentOrderId);
          console.log(`模拟支付成功通知: ${paymentOrderId}`);
        } else {
          await PaymentService.handlePaymentFailure(paymentOrderId, '模拟支付失败');
          console.log(`模拟支付失败通知: ${paymentOrderId}`);
        }
      } catch (error) {
        console.error('模拟支付通知处理失败:', error);
      }
    }, delay);
  }
}

module.exports = PaymentService;