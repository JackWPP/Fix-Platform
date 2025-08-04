const mongoose = require('mongoose');
const { ServiceType, DeviceType, PricingStrategy, SystemConfig } = require('../models/Config');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixplatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 初始化服务类型数据
const initServiceTypes = async () => {
  const serviceTypes = [
    {
      name: '电脑清洁',
      code: 'cleaning',
      description: '电脑内部清洁，清除灰尘，提升散热效果',
      basePrice: 50,
      estimatedDuration: 60,
      category: 'maintenance',
      requiredSkills: ['基础维修', '清洁技能']
    },
    {
      name: '屏幕更换',
      code: 'screen_replacement',
      description: '更换损坏的显示屏',
      basePrice: 300,
      estimatedDuration: 120,
      category: 'repair',
      requiredSkills: ['硬件维修', '屏幕安装']
    },
    {
      name: '电池更换',
      code: 'battery_replacement',
      description: '更换老化或损坏的电池',
      basePrice: 150,
      estimatedDuration: 90,
      category: 'repair',
      requiredSkills: ['硬件维修', '电池安装']
    },
    {
      name: '系统重装',
      code: 'system_reinstall',
      description: '重新安装操作系统，恢复系统正常运行',
      basePrice: 80,
      estimatedDuration: 180,
      category: 'installation',
      requiredSkills: ['系统安装', '软件配置']
    },
    {
      name: '软件安装',
      code: 'software_install',
      description: '安装和配置各类软件应用',
      basePrice: 30,
      estimatedDuration: 45,
      category: 'installation',
      requiredSkills: ['软件安装', '系统配置']
    },
    {
      name: '硬件升级',
      code: 'hardware_upgrade',
      description: '升级内存、硬盘等硬件组件',
      basePrice: 100,
      estimatedDuration: 120,
      category: 'repair',
      requiredSkills: ['硬件维修', '组装技能']
    },
    {
      name: '数据恢复',
      code: 'data_recovery',
      description: '恢复丢失或损坏的数据文件',
      basePrice: 200,
      estimatedDuration: 240,
      category: 'repair',
      requiredSkills: ['数据恢复', '专业工具使用']
    },
    {
      name: '病毒清除',
      code: 'virus_removal',
      description: '清除电脑病毒和恶意软件',
      basePrice: 60,
      estimatedDuration: 90,
      category: 'maintenance',
      requiredSkills: ['安全维护', '杀毒软件使用']
    }
  ];

  for (const serviceType of serviceTypes) {
    await ServiceType.findOneAndUpdate(
      { code: serviceType.code },
      serviceType,
      { upsert: true, new: true }
    );
  }
  console.log('服务类型初始化完成');
};

// 初始化设备类型数据
const initDeviceTypes = async () => {
  const deviceTypes = [
    {
      name: '笔记本电脑',
      code: 'laptop',
      category: 'laptop',
      brand: '',
      models: [
        { name: 'ThinkPad X1', code: 'thinkpad_x1', specifications: { screen: '14寸', cpu: 'Intel i7', ram: '16GB' } },
        { name: 'MacBook Pro', code: 'macbook_pro', specifications: { screen: '13寸/16寸', cpu: 'M1/M2', ram: '8GB-32GB' } },
        { name: 'Dell XPS', code: 'dell_xps', specifications: { screen: '13寸/15寸', cpu: 'Intel i5/i7', ram: '8GB-16GB' } },
        { name: 'HP EliteBook', code: 'hp_elitebook', specifications: { screen: '14寸', cpu: 'Intel i5/i7', ram: '8GB-16GB' } }
      ],
      commonIssues: [
        { issue: '开机黑屏', solution: '检查内存条、显卡连接', estimatedCost: 100 },
        { issue: '键盘失灵', solution: '更换键盘', estimatedCost: 200 },
        { issue: '电池不充电', solution: '更换电池', estimatedCost: 150 },
        { issue: '散热不良', solution: '清洁风扇，更换散热膏', estimatedCost: 80 }
      ]
    },
    {
      name: '台式电脑',
      code: 'desktop',
      category: 'desktop',
      brand: '',
      models: [
        { name: '组装机', code: 'custom_build', specifications: { type: '自定义配置', cpu: '各品牌', ram: '8GB-64GB' } },
        { name: 'Dell OptiPlex', code: 'dell_optiplex', specifications: { type: '商用机', cpu: 'Intel i5/i7', ram: '8GB-16GB' } },
        { name: 'HP ProDesk', code: 'hp_prodesk', specifications: { type: '商用机', cpu: 'Intel i5/i7', ram: '8GB-16GB' } }
      ],
      commonIssues: [
        { issue: '无法开机', solution: '检查电源、主板', estimatedCost: 150 },
        { issue: '蓝屏死机', solution: '检查内存、硬盘', estimatedCost: 100 },
        { issue: '运行缓慢', solution: '清理系统、升级硬件', estimatedCost: 80 },
        { issue: '噪音过大', solution: '清洁风扇、更换风扇', estimatedCost: 60 }
      ]
    },
    {
      name: '手机',
      code: 'mobile',
      category: 'mobile',
      brand: '',
      models: [
        { name: 'iPhone', code: 'iphone', specifications: { brand: 'Apple', os: 'iOS', screen: '各尺寸' } },
        { name: 'Samsung Galaxy', code: 'samsung_galaxy', specifications: { brand: 'Samsung', os: 'Android', screen: '各尺寸' } },
        { name: '华为', code: 'huawei', specifications: { brand: 'Huawei', os: 'Android/HarmonyOS', screen: '各尺寸' } },
        { name: '小米', code: 'xiaomi', specifications: { brand: 'Xiaomi', os: 'MIUI', screen: '各尺寸' } }
      ],
      commonIssues: [
        { issue: '屏幕破裂', solution: '更换屏幕总成', estimatedCost: 300 },
        { issue: '电池老化', solution: '更换电池', estimatedCost: 120 },
        { issue: '充电接口损坏', solution: '更换充电接口', estimatedCost: 80 },
        { issue: '系统卡顿', solution: '系统优化、恢复出厂设置', estimatedCost: 50 }
      ]
    },
    {
      name: '平板电脑',
      code: 'tablet',
      category: 'tablet',
      brand: '',
      models: [
        { name: 'iPad', code: 'ipad', specifications: { brand: 'Apple', os: 'iPadOS', screen: '各尺寸' } },
        { name: 'Surface', code: 'surface', specifications: { brand: 'Microsoft', os: 'Windows', screen: '各尺寸' } },
        { name: 'Android平板', code: 'android_tablet', specifications: { brand: '各品牌', os: 'Android', screen: '各尺寸' } }
      ],
      commonIssues: [
        { issue: '触摸失灵', solution: '更换触摸屏', estimatedCost: 250 },
        { issue: '无法充电', solution: '更换充电接口或电池', estimatedCost: 150 },
        { issue: '系统崩溃', solution: '重装系统', estimatedCost: 80 }
      ]
    },
    {
      name: '打印机',
      code: 'printer',
      category: 'printer',
      brand: '',
      models: [
        { name: 'HP LaserJet', code: 'hp_laserjet', specifications: { type: '激光打印机', brand: 'HP' } },
        { name: 'Canon PIXMA', code: 'canon_pixma', specifications: { type: '喷墨打印机', brand: 'Canon' } },
        { name: 'Epson EcoTank', code: 'epson_ecotank', specifications: { type: '墨仓式打印机', brand: 'Epson' } }
      ],
      commonIssues: [
        { issue: '打印质量差', solution: '清洁打印头、更换墨盒', estimatedCost: 100 },
        { issue: '卡纸', solution: '清理纸道、调整纸张', estimatedCost: 50 },
        { issue: '无法连接', solution: '检查网络设置、重装驱动', estimatedCost: 60 }
      ]
    }
  ];

  for (const deviceType of deviceTypes) {
    await DeviceType.findOneAndUpdate(
      { code: deviceType.code },
      deviceType,
      { upsert: true, new: true }
    );
  }
  console.log('设备类型初始化完成');
};

// 初始化价格策略数据
const initPricingStrategies = async () => {
  // 获取服务类型和设备类型ID
  const serviceTypes = await ServiceType.find();
  const deviceTypes = await DeviceType.find();

  const strategies = [
    {
      name: '标准定价策略',
      type: 'fixed',
      serviceTypes: serviceTypes.map(st => st._id),
      deviceTypes: deviceTypes.map(dt => dt._id),
      rules: {
        basePrice: 0, // 使用服务类型的基础价格
        hourlyRate: 0,
        urgencyMultiplier: {
          normal: 1.0,
          urgent: 1.5,
          emergency: 2.0
        },
        discountRules: [
          {
            condition: '订单金额满200元',
            discountType: 'percentage',
            discountValue: 5,
            minOrderAmount: 200
          },
          {
            condition: '订单金额满500元',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 500
          }
        ]
      },
      isActive: true
    },
    {
      name: '按小时计费策略',
      type: 'hourly',
      serviceTypes: serviceTypes.filter(st => ['system_reinstall', 'data_recovery'].includes(st.code)).map(st => st._id),
      deviceTypes: deviceTypes.map(dt => dt._id),
      rules: {
        basePrice: 50,
        hourlyRate: 80,
        urgencyMultiplier: {
          normal: 1.0,
          urgent: 1.3,
          emergency: 1.8
        },
        discountRules: []
      },
      isActive: true
    }
  ];

  for (const strategy of strategies) {
    await PricingStrategy.findOneAndUpdate(
      { name: strategy.name },
      strategy,
      { upsert: true, new: true }
    );
  }
  console.log('价格策略初始化完成');
};

// 初始化系统配置数据
const initSystemConfigs = async () => {
  const configs = [
    // 通知设置
    {
      key: 'notification.email.enabled',
      value: true,
      type: 'boolean',
      category: 'notification',
      description: '是否启用邮件通知',
      validation: { required: true }
    },
    {
      key: 'notification.sms.enabled',
      value: false,
      type: 'boolean',
      category: 'notification',
      description: '是否启用短信通知',
      validation: { required: true }
    },
    {
      key: 'notification.push.enabled',
      value: true,
      type: 'boolean',
      category: 'notification',
      description: '是否启用推送通知',
      validation: { required: true }
    },
    {
      key: 'notification.order.status_change',
      value: true,
      type: 'boolean',
      category: 'notification',
      description: '订单状态变更时发送通知',
      validation: { required: true }
    },
    {
      key: 'notification.order.assignment',
      value: true,
      type: 'boolean',
      category: 'notification',
      description: '订单分配时发送通知',
      validation: { required: true }
    },
    
    // 业务规则
    {
      key: 'business.order.auto_assign',
      value: false,
      type: 'boolean',
      category: 'business',
      description: '是否自动分配订单给维修员',
      validation: { required: true }
    },
    {
      key: 'business.order.max_images',
      value: 6,
      type: 'number',
      category: 'business',
      description: '订单最大图片数量',
      validation: { required: true, min: 1, max: 10 }
    },
    {
      key: 'business.order.cancel_timeout',
      value: 24,
      type: 'number',
      category: 'business',
      description: '订单自动取消超时时间（小时）',
      validation: { required: true, min: 1, max: 168 }
    },
    {
      key: 'business.rating.required',
      value: false,
      type: 'boolean',
      category: 'business',
      description: '是否强制要求用户评价',
      validation: { required: true }
    },
    {
      key: 'business.working_hours',
      value: {
        start: '09:00',
        end: '18:00',
        weekends: false
      },
      type: 'object',
      category: 'business',
      description: '营业时间设置'
    },
    
    // 系统设置
    {
      key: 'system.maintenance_mode',
      value: false,
      type: 'boolean',
      category: 'system',
      description: '系统维护模式',
      validation: { required: true }
    },
    {
      key: 'system.max_concurrent_orders',
      value: 100,
      type: 'number',
      category: 'system',
      description: '系统最大并发订单数',
      validation: { required: true, min: 10, max: 1000 }
    },
    {
      key: 'system.session_timeout',
      value: 7200,
      type: 'number',
      category: 'system',
      description: '用户会话超时时间（秒）',
      validation: { required: true, min: 300, max: 86400 }
    },
    
    // UI设置
    {
      key: 'ui.theme.primary_color',
      value: '#1890ff',
      type: 'string',
      category: 'ui',
      description: '主题主色调',
      validation: { pattern: '^#[0-9A-Fa-f]{6}$' }
    },
    {
      key: 'ui.theme.secondary_color',
      value: '#faad14',
      type: 'string',
      category: 'ui',
      description: '主题辅助色',
      validation: { pattern: '^#[0-9A-Fa-f]{6}$' }
    },
    {
      key: 'ui.pagination.page_size',
      value: 10,
      type: 'number',
      category: 'ui',
      description: '分页默认每页数量',
      validation: { required: true, min: 5, max: 100 }
    },
    
    // 支付设置
    {
      key: 'payment.methods',
      value: ['wechat', 'alipay', 'cash'],
      type: 'array',
      category: 'payment',
      description: '支持的支付方式',
      validation: { options: ['wechat', 'alipay', 'cash', 'bank_card'] }
    },
    {
      key: 'payment.auto_refund',
      value: false,
      type: 'boolean',
      category: 'payment',
      description: '是否支持自动退款',
      validation: { required: true }
    },
    {
      key: 'payment.refund_timeout',
      value: 7,
      type: 'number',
      category: 'payment',
      description: '退款处理超时时间（天）',
      validation: { required: true, min: 1, max: 30 }
    }
  ];

  for (const config of configs) {
    await SystemConfig.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true, new: true }
    );
  }
  console.log('系统配置初始化完成');
};

// 执行初始化
const initializeConfigData = async () => {
  try {
    console.log('开始初始化配置数据...');
    
    await initServiceTypes();
    await initDeviceTypes();
    await initPricingStrategies();
    await initSystemConfigs();
    
    console.log('配置数据初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化配置数据失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initializeConfigData();
}

module.exports = {
  initServiceTypes,
  initDeviceTypes,
  initPricingStrategies,
  initSystemConfigs,
  initializeConfigData
};