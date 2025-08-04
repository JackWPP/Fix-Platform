const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Order = require('../models/Order');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function initData() {
  try {
    // 清空现有数据
    await User.deleteMany({});
    await Order.deleteMany({});
    
    console.log('已清空现有数据');
    
    // 创建测试用户
    const users = [
      {
        name: '管理员',
        phone: '13800000001',
        password: await bcrypt.hash('123456', 10),
        role: 'admin'
      },
      {
        name: '客服小王',
        phone: '13800000002', 
        password: await bcrypt.hash('123456', 10),
        role: 'customer_service'
      },
      {
        name: '维修师傅张三',
        phone: '13800000003',
        password: await bcrypt.hash('123456', 10),
        role: 'repairman'
      },
      {
        name: '维修师傅李四',
        phone: '13800000004',
        password: await bcrypt.hash('123456', 10),
        role: 'repairman'
      },
      {
        name: '普通用户王五',
        phone: '13800000005',
        password: await bcrypt.hash('123456', 10),
        role: 'user'
      },
      {
        name: '普通用户赵六',
        phone: '13800000006',
        password: await bcrypt.hash('123456', 10),
        role: 'user'
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log('已创建测试用户:', createdUsers.length, '个');
    
    // 创建测试订单
    const orders = [
      {
        userId: createdUsers[4]._id, // 普通用户王五
        deviceType: '手机',
        deviceModel: 'iPhone 14',
        serviceType: 'repair',
        issueDescription: '屏幕碎裂，无法正常显示',
        problemDescription: '屏幕碎裂，无法正常显示',
        contactName: '王五',
        contactPhone: '13800000005',
        appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
        urgency: 'urgent',
        status: '待处理',
        assignedTo: createdUsers[2]._id // 分配给维修师傅张三
      },
      {
        userId: createdUsers[5]._id, // 普通用户赵六
        deviceType: '电脑',
        deviceModel: 'ThinkPad X1',
        serviceType: 'repair',
        issueDescription: '开机黑屏，风扇转动但无显示',
        problemDescription: '开机黑屏，风扇转动但无显示',
        contactName: '赵六',
        contactPhone: '13800000006',
        appointmentTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 后天
        urgency: 'normal',
        status: '处理中',
        assignedTo: createdUsers[3]._id, // 分配给维修师傅李四
        repairNotes: '已检查硬件，疑似显卡问题'
      },
      {
        userId: createdUsers[4]._id, // 普通用户王五
        deviceType: '平板',
        deviceModel: 'MatePad Pro',
        serviceType: 'appointment',
        appointmentService: 'battery_replacement',
        issueDescription: '充电接口松动，无法正常充电',
        problemDescription: '充电接口松动，无法正常充电',
        contactName: '王五',
        contactPhone: '13800000005',
        appointmentTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天（已完成）
        urgency: 'normal',
        status: '已完成',
        assignedTo: createdUsers[2]._id, // 分配给维修师傅张三
        repairNotes: '已更换充电接口，测试正常',
        rating: {
          score: 5,
          comment: '维修很及时，师傅很专业！'
        }
      }
    ];
    
    const createdOrders = await Order.insertMany(orders);
    console.log('已创建测试订单:', createdOrders.length, '个');
    
    console.log('\n=== 测试账号信息 ===');
    console.log('管理员: 13800000001 / 123456');
    console.log('客服: 13800000002 / 123456');
    console.log('维修员张三: 13800000003 / 123456');
    console.log('维修员李四: 13800000004 / 123456');
    console.log('用户王五: 13800000005 / 123456');
    console.log('用户赵六: 13800000006 / 123456');
    console.log('==================');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化数据失败:', error);
    process.exit(1);
  }
}

initData();