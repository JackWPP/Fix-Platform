const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// 获取订单统计数据
const getOrderStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // 默认30天
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 按状态统计订单
    const statusStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 按服务类型统计订单
    const serviceTypeStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);

    // 按紧急程度统计订单
    const urgencyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // 每日订单趋势
    const dailyTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 总订单数
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    
    // 已完成订单数
    const completedOrders = await Order.countDocuments({ 
      status: 'completed', 
      createdAt: { $gte: startDate } 
    });

    // 完成率
    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        statusStats,
        serviceTypeStats,
        urgencyStats,
        dailyTrend,
        summary: {
          totalOrders,
          completedOrders,
          completionRate: parseFloat(completionRate)
        }
      }
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({ success: false, message: '获取订单统计失败' });
  }
};

// 获取维修员绩效统计
const getRepairmanStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 维修员工作量统计
    const repairmanWorkload = await Order.aggregate([
      { 
        $match: { 
          assignedTo: { $exists: true, $ne: null },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'repairman'
        }
      },
      { $unwind: '$repairman' },
      {
        $group: {
          _id: '$assignedTo',
          name: { $first: '$repairman.name' },
          phone: { $first: '$repairman.phone' },
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgressOrders: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          avgRating: { $avg: '$rating.score' }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$completedOrders', '$totalOrders'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalOrders: -1 } }
    ]);

    // 维修员评分分布
    const ratingDistribution = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$rating.score',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        repairmanWorkload,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('获取维修员统计失败:', error);
    res.status(500).json({ success: false, message: '获取维修员统计失败' });
  }
};

// 获取客户满意度统计
const getCustomerSatisfactionStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 评分分布
    const ratingDistribution = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$rating.score',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 平均评分
    const avgRatingResult = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.score' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
    const totalRatings = avgRatingResult.length > 0 ? avgRatingResult[0].totalRatings : 0;

    // 按服务类型的满意度
    const satisfactionByServiceType = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$serviceType',
          avgRating: { $avg: '$rating.score' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 满意度趋势（按周）
    const satisfactionTrend = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          avgRating: { $avg: '$rating.score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        ratingDistribution,
        avgRating: parseFloat(avgRating.toFixed(2)),
        totalRatings,
        satisfactionByServiceType,
        satisfactionTrend
      }
    });
  } catch (error) {
    console.error('获取客户满意度统计失败:', error);
    res.status(500).json({ success: false, message: '获取客户满意度统计失败' });
  }
};

// 获取收入统计
const getRevenueStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 总收入统计
    const revenueStats = await Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.amount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$payment.amount' }
        }
      }
    ]);

    // 按服务类型的收入
    const revenueByServiceType = await Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$serviceType',
          revenue: { $sum: '$payment.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 每日收入趋势
    const dailyRevenueTrend = await Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$payment.amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 支付方式统计
    const paymentMethodStats = await Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$payment.method',
          revenue: { $sum: '$payment.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalOrders = revenueStats.length > 0 ? revenueStats[0].totalOrders : 0;
    const avgOrderValue = revenueStats.length > 0 ? revenueStats[0].avgOrderValue : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
        },
        revenueByServiceType,
        dailyRevenueTrend,
        paymentMethodStats
      }
    });
  } catch (error) {
    console.error('获取收入统计失败:', error);
    res.status(500).json({ success: false, message: '获取收入统计失败' });
  }
};

// 获取综合仪表盘数据
const getDashboardStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 基础统计
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    const completedOrders = await Order.countDocuments({ 
      status: 'completed', 
      createdAt: { $gte: startDate } 
    });
    const pendingOrders = await Order.countDocuments({ 
      status: 'pending', 
      createdAt: { $gte: startDate } 
    });

    // 收入统计
    const revenueResult = await Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 平均评分
    const avgRatingResult = await Order.aggregate([
      { 
        $match: { 
          'rating.score': { $exists: true },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.score' }
        }
      }
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        avgRating: parseFloat(avgRating.toFixed(2)),
        completionRate: totalOrders > 0 ? parseFloat(((completedOrders / totalOrders) * 100).toFixed(2)) : 0
      }
    });
  } catch (error) {
    console.error('获取仪表盘统计失败:', error);
    res.status(500).json({ success: false, message: '获取仪表盘统计失败' });
  }
};

module.exports = {
  getOrderStats,
  getRepairmanStats,
  getCustomerSatisfactionStats,
  getRevenueStats,
  getDashboardStats
};