const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // 暂时设为可选，用于演示功能
  },
  deviceType: {
    type: String,
    required: true
  },
  deviceModel: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['repair', 'appointment'],
    required: true
  },
  appointmentService: {
    type: String,
    enum: ['cleaning', 'screen_replacement', 'battery_replacement', 'system_reinstall', 'software_install']
  },
  liquidMetal: {
    type: String,
    enum: ['yes', 'no', 'uncertain']
  },
  problemDescription: {
    type: String
  },
  issueDescription: {
    type: String
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: Date,
    required: true
  },
  images: [{
    type: String // 存储图片URL或base64
  }],
  status: {
    type: String,
    enum: ['待处理', '处理中', '已完成', '已取消'],
    default: '待处理'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
});

module.exports = mongoose.model('Order', orderSchema);