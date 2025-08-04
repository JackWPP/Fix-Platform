const { ServiceType, DeviceType, PricingStrategy, SystemConfig } = require('../models/Config');

// 服务类型管理
const serviceTypeController = {
  // 获取所有服务类型
  getAll: async (req, res) => {
    try {
      const serviceTypes = await ServiceType.find().sort({ createdAt: -1 });
      res.json({ success: true, data: serviceTypes });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取服务类型失败', error: error.message });
    }
  },

  // 获取单个服务类型
  getById: async (req, res) => {
    try {
      const serviceType = await ServiceType.findById(req.params.id);
      if (!serviceType) {
        return res.status(404).json({ success: false, message: '服务类型不存在' });
      }
      res.json({ success: true, data: serviceType });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取服务类型失败', error: error.message });
    }
  },

  // 创建服务类型
  create: async (req, res) => {
    try {
      const serviceType = new ServiceType(req.body);
      await serviceType.save();
      res.status(201).json({ success: true, data: serviceType, message: '服务类型创建成功' });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ success: false, message: '服务类型名称或代码已存在' });
      } else {
        res.status(500).json({ success: false, message: '创建服务类型失败', error: error.message });
      }
    }
  },

  // 更新服务类型
  update: async (req, res) => {
    try {
      const serviceType = await ServiceType.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!serviceType) {
        return res.status(404).json({ success: false, message: '服务类型不存在' });
      }
      res.json({ success: true, data: serviceType, message: '服务类型更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新服务类型失败', error: error.message });
    }
  },

  // 删除服务类型
  delete: async (req, res) => {
    try {
      const serviceType = await ServiceType.findByIdAndDelete(req.params.id);
      if (!serviceType) {
        return res.status(404).json({ success: false, message: '服务类型不存在' });
      }
      res.json({ success: true, message: '服务类型删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除服务类型失败', error: error.message });
    }
  }
};

// 设备类型管理
const deviceTypeController = {
  // 获取所有设备类型
  getAll: async (req, res) => {
    try {
      const deviceTypes = await DeviceType.find().sort({ createdAt: -1 });
      res.json({ success: true, data: deviceTypes });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取设备类型失败', error: error.message });
    }
  },

  // 获取单个设备类型
  getById: async (req, res) => {
    try {
      const deviceType = await DeviceType.findById(req.params.id);
      if (!deviceType) {
        return res.status(404).json({ success: false, message: '设备类型不存在' });
      }
      res.json({ success: true, data: deviceType });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取设备类型失败', error: error.message });
    }
  },

  // 创建设备类型
  create: async (req, res) => {
    try {
      const deviceType = new DeviceType(req.body);
      await deviceType.save();
      res.status(201).json({ success: true, data: deviceType, message: '设备类型创建成功' });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ success: false, message: '设备类型名称或代码已存在' });
      } else {
        res.status(500).json({ success: false, message: '创建设备类型失败', error: error.message });
      }
    }
  },

  // 更新设备类型
  update: async (req, res) => {
    try {
      console.log(`${new Date().toISOString()} - 更新设备类型 ID: ${req.params.id}`);
      console.log('更新数据:', req.body);
      
      const deviceType = await DeviceType.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!deviceType) {
        console.log('设备类型不存在:', req.params.id);
        return res.status(404).json({ success: false, message: '设备类型不存在' });
      }
      
      console.log('设备类型更新成功:', deviceType);
      res.json({ success: true, data: deviceType, message: '设备类型更新成功' });
    } catch (error) {
      console.error('更新设备类型失败:', error);
      res.status(500).json({ success: false, message: '更新设备类型失败', error: error.message });
    }
  },

  // 删除设备类型
  delete: async (req, res) => {
    try {
      const deviceType = await DeviceType.findByIdAndDelete(req.params.id);
      if (!deviceType) {
        return res.status(404).json({ success: false, message: '设备类型不存在' });
      }
      res.json({ success: true, message: '设备类型删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除设备类型失败', error: error.message });
    }
  }
};

// 价格策略管理
const pricingStrategyController = {
  // 获取所有价格策略
  getAll: async (req, res) => {
    try {
      const strategies = await PricingStrategy.find()
        .populate('serviceTypes', 'name code')
        .populate('deviceTypes', 'name code')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: strategies });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取价格策略失败', error: error.message });
    }
  },

  // 获取单个价格策略
  getById: async (req, res) => {
    try {
      const strategy = await PricingStrategy.findById(req.params.id)
        .populate('serviceTypes', 'name code')
        .populate('deviceTypes', 'name code');
      if (!strategy) {
        return res.status(404).json({ success: false, message: '价格策略不存在' });
      }
      res.json({ success: true, data: strategy });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取价格策略失败', error: error.message });
    }
  },

  // 创建价格策略
  create: async (req, res) => {
    try {
      const strategy = new PricingStrategy(req.body);
      await strategy.save();
      res.status(201).json({ success: true, data: strategy, message: '价格策略创建成功' });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ success: false, message: '价格策略名称已存在' });
      } else {
        res.status(500).json({ success: false, message: '创建价格策略失败', error: error.message });
      }
    }
  },

  // 更新价格策略
  update: async (req, res) => {
    try {
      const strategy = await PricingStrategy.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!strategy) {
        return res.status(404).json({ success: false, message: '价格策略不存在' });
      }
      res.json({ success: true, data: strategy, message: '价格策略更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新价格策略失败', error: error.message });
    }
  },

  // 删除价格策略
  delete: async (req, res) => {
    try {
      const strategy = await PricingStrategy.findByIdAndDelete(req.params.id);
      if (!strategy) {
        return res.status(404).json({ success: false, message: '价格策略不存在' });
      }
      res.json({ success: true, message: '价格策略删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除价格策略失败', error: error.message });
    }
  },

  // 计算订单价格
  calculatePrice: async (req, res) => {
    try {
      const { serviceTypeId, deviceTypeId, urgency = 'normal', duration = 1 } = req.body;
      
      // 获取活跃的价格策略
      const activeStrategies = await PricingStrategy.find({
        isActive: true,
        $or: [
          { validTo: null },
          { validTo: { $gte: new Date() } }
        ],
        validFrom: { $lte: new Date() }
      }).populate('serviceTypes deviceTypes');

      // 查找匹配的策略
      const matchingStrategy = activeStrategies.find(strategy => {
        const serviceMatch = !serviceTypeId || strategy.serviceTypes.some(st => st._id.toString() === serviceTypeId);
        const deviceMatch = !deviceTypeId || strategy.deviceTypes.some(dt => dt._id.toString() === deviceTypeId);
        return serviceMatch && deviceMatch;
      });

      if (!matchingStrategy) {
        return res.status(404).json({ success: false, message: '未找到匹配的价格策略' });
      }

      // 计算基础价格
      let basePrice = matchingStrategy.rules.basePrice || 0;
      if (matchingStrategy.type === 'hourly') {
        basePrice += (matchingStrategy.rules.hourlyRate || 0) * duration;
      }

      // 应用紧急程度倍数
      const urgencyMultiplier = matchingStrategy.rules.urgencyMultiplier[urgency] || 1.0;
      let finalPrice = basePrice * urgencyMultiplier;

      // 应用折扣规则
      const applicableDiscounts = matchingStrategy.rules.discountRules.filter(rule => {
        return !rule.minOrderAmount || finalPrice >= rule.minOrderAmount;
      });

      let totalDiscount = 0;
      applicableDiscounts.forEach(discount => {
        if (discount.discountType === 'percentage') {
          totalDiscount += finalPrice * (discount.discountValue / 100);
        } else {
          totalDiscount += discount.discountValue;
        }
      });

      finalPrice = Math.max(0, finalPrice - totalDiscount);

      res.json({
        success: true,
        data: {
          basePrice,
          urgencyMultiplier,
          totalDiscount,
          finalPrice: Math.round(finalPrice * 100) / 100,
          strategy: matchingStrategy.name,
          appliedDiscounts: applicableDiscounts
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '价格计算失败', error: error.message });
    }
  }
};

// 系统配置管理
const systemConfigController = {
  // 获取所有系统配置
  getAll: async (req, res) => {
    try {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const configs = await SystemConfig.find(filter).sort({ category: 1, key: 1 });
      res.json({ success: true, data: configs });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取系统配置失败', error: error.message });
    }
  },

  // 获取单个系统配置
  getByKey: async (req, res) => {
    try {
      const config = await SystemConfig.findOne({ key: req.params.key });
      if (!config) {
        return res.status(404).json({ success: false, message: '配置项不存在' });
      }
      res.json({ success: true, data: config });
    } catch (error) {
      res.status(500).json({ success: false, message: '获取配置项失败', error: error.message });
    }
  },

  // 创建系统配置
  create: async (req, res) => {
    try {
      const config = new SystemConfig(req.body);
      await config.save();
      res.status(201).json({ success: true, data: config, message: '配置项创建成功' });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ success: false, message: '配置项键名已存在' });
      } else {
        res.status(500).json({ success: false, message: '创建配置项失败', error: error.message });
      }
    }
  },

  // 更新系统配置
  update: async (req, res) => {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { key: req.params.key },
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!config) {
        return res.status(404).json({ success: false, message: '配置项不存在' });
      }
      if (!config.isEditable) {
        return res.status(403).json({ success: false, message: '该配置项不允许编辑' });
      }
      res.json({ success: true, data: config, message: '配置项更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '更新配置项失败', error: error.message });
    }
  },

  // 删除系统配置
  delete: async (req, res) => {
    try {
      const config = await SystemConfig.findOneAndDelete({ key: req.params.key });
      if (!config) {
        return res.status(404).json({ success: false, message: '配置项不存在' });
      }
      if (!config.isEditable) {
        return res.status(403).json({ success: false, message: '该配置项不允许删除' });
      }
      res.json({ success: true, message: '配置项删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '删除配置项失败', error: error.message });
    }
  },

  // 批量更新配置
  batchUpdate: async (req, res) => {
    try {
      const { configs } = req.body;
      const results = [];
      
      for (const configData of configs) {
        const config = await SystemConfig.findOneAndUpdate(
          { key: configData.key },
          { value: configData.value, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        if (config && config.isEditable) {
          results.push(config);
        }
      }
      
      res.json({ success: true, data: results, message: '批量更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '批量更新失败', error: error.message });
    }
  }
};

module.exports = {
  serviceTypeController,
  deviceTypeController,
  pricingStrategyController,
  systemConfigController
};