const mongoose = require('mongoose');

// 服务类型配置模型
const serviceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: Number, // 预计耗时（分钟）
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['repair', 'maintenance', 'installation', 'consultation'],
    default: 'repair'
  },
  requiredSkills: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 设备类型配置模型
const deviceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  brands: {
    type: String, // 支持品牌，逗号分隔的字符串
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  commonIssues: {
    type: String, // 常见问题，逗号分隔的字符串
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 价格策略配置模型
const pricingStrategySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['fixed', 'hourly', 'tiered', 'dynamic'],
    required: true
  },
  serviceTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  }],
  deviceTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeviceType'
  }],
  rules: {
    basePrice: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      default: 0
    },
    urgencyMultiplier: {
      normal: {
        type: Number,
        default: 1.0
      },
      urgent: {
        type: Number,
        default: 1.5
      },
      emergency: {
        type: Number,
        default: 2.0
      }
    },
    discountRules: [{
      condition: String, // 条件描述
      discountType: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      discountValue: Number,
      minOrderAmount: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 系统参数配置模型
const systemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  category: {
    type: String,
    enum: ['notification', 'business', 'system', 'ui', 'payment'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  validation: {
    required: {
      type: Boolean,
      default: false
    },
    min: Number,
    max: Number,
    pattern: String,
    options: [String] // 枚举选项
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建模型
const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);
const DeviceType = mongoose.model('DeviceType', deviceTypeSchema);
const PricingStrategy = mongoose.model('PricingStrategy', pricingStrategySchema);
const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = {
  ServiceType,
  DeviceType,
  PricingStrategy,
  SystemConfig
};