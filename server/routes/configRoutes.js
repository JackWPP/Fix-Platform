const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  serviceTypeController,
  deviceTypeController,
  pricingStrategyController,
  systemConfigController
} = require('../controllers/configController');

// 服务类型路由
router.get('/service-types', auth, serviceTypeController.getAll);
router.get('/service-types/:id', auth, serviceTypeController.getById);
router.post('/service-types', auth, roleAuth(['admin']), serviceTypeController.create);
router.put('/service-types/:id', auth, roleAuth(['admin']), serviceTypeController.update);
router.delete('/service-types/:id', auth, roleAuth(['admin']), serviceTypeController.delete);

// 设备类型路由
router.get('/device-types', auth, deviceTypeController.getAll);
router.get('/device-types/:id', auth, deviceTypeController.getById);
router.post('/device-types', auth, roleAuth(['admin']), deviceTypeController.create);
router.put('/device-types/:id', auth, roleAuth(['admin']), deviceTypeController.update);
router.delete('/device-types/:id', auth, roleAuth(['admin']), deviceTypeController.delete);

// 价格策略路由
router.get('/pricing-strategies', auth, pricingStrategyController.getAll);
router.get('/pricing-strategies/:id', auth, pricingStrategyController.getById);
router.post('/pricing-strategies', auth, roleAuth(['admin']), pricingStrategyController.create);
router.put('/pricing-strategies/:id', auth, roleAuth(['admin']), pricingStrategyController.update);
router.delete('/pricing-strategies/:id', auth, roleAuth(['admin']), pricingStrategyController.delete);
router.post('/pricing-strategies/calculate', auth, pricingStrategyController.calculatePrice);

// 系统配置路由
router.get('/system-configs', auth, roleAuth(['admin']), systemConfigController.getAll);
router.get('/system-configs/:key', auth, roleAuth(['admin']), systemConfigController.getByKey);
router.post('/system-configs', auth, roleAuth(['admin']), systemConfigController.create);
router.put('/system-configs/:key', auth, roleAuth(['admin']), systemConfigController.update);
router.delete('/system-configs/:key', auth, roleAuth(['admin']), systemConfigController.delete);
router.post('/system-configs/batch', auth, roleAuth(['admin']), systemConfigController.batchUpdate);

module.exports = router;