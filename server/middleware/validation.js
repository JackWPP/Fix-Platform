const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 处理验证结果的中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      url: req.originalUrl,
      method: req.method,
      errors: errors.array(),
      ip: req.ip
    });
    
    return res.status(400).json({
      success: false,
      message: '输入数据验证失败',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// 用户注册验证规则
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文字符'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('密码长度必须在6-128个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/)
    .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  body('verificationCode')
    .optional()
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage('验证码长度必须在4-6位之间')
    .isNumeric()
    .withMessage('验证码必须是数字'),
  
  handleValidationErrors
];

// 用户登录验证规则
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('用户名/邮箱不能为空')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名/邮箱长度必须在3-50个字符之间'),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6, max: 128 })
    .withMessage('密码长度必须在6-128个字符之间'),
  
  handleValidationErrors
];

// 验证码登录验证规则
const validateCodeLogin = [
  body('phone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  body('code')
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage('验证码长度必须在4-6位之间')
    .isNumeric()
    .withMessage('验证码必须是数字'),
  
  handleValidationErrors
];

// 发送验证码验证规则
const validateSendCode = [
  body('phone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  handleValidationErrors
];

// 订单创建验证规则
const validateCreateOrder = [
  body('serviceType')
    .trim()
    .notEmpty()
    .withMessage('服务类型不能为空')
    .isIn(['repair', 'maintenance', 'installation', 'consultation'])
    .withMessage('无效的服务类型'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('问题描述长度必须在10-500个字符之间'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('无效的紧急程度'),
  
  body('preferredTime')
    .optional()
    .isISO8601()
    .withMessage('请输入有效的日期时间格式'),
  
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('地址长度必须在5-200个字符之间'),
  
  body('contactPhone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的联系电话'),
  
  handleValidationErrors
];

// 订单更新验证规则
const validateUpdateOrder = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('无效的订单状态'),
  
  body('technicianNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('技师备注不能超过1000个字符'),
  
  body('completionTime')
    .optional()
    .isISO8601()
    .withMessage('请输入有效的完成时间格式'),
  
  handleValidationErrors
];

// 支付验证规则
const validatePayment = [
  body('orderId')
    .trim()
    .notEmpty()
    .withMessage('订单ID不能为空')
    .isMongoId()
    .withMessage('无效的订单ID格式'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 99999.99 })
    .withMessage('支付金额必须在0.01-99999.99之间'),
  
  body('paymentMethod')
    .trim()
    .isIn(['alipay', 'wechat', 'bank_card', 'cash'])
    .withMessage('无效的支付方式'),
  
  handleValidationErrors
];

// 文件上传验证
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的文件'
    });
  }
  
  const file = req.file || (req.files && req.files[0]);
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `文件大小不能超过${Math.round(maxSize / 1024 / 1024)}MB`
    });
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: '不支持的文件类型，仅支持图片、PDF和文本文件'
    });
  }
  
  next();
};

// 通用ID验证
const validateMongoId = (paramName = 'id') => {
  return [
    body(paramName)
      .optional()
      .isMongoId()
      .withMessage(`无效的${paramName}格式`),
    handleValidationErrors
  ];
};

// 分页参数验证
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('页码必须是1-1000之间的整数'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCodeLogin,
  validateSendCode,
  validateCreateOrder,
  validateUpdateOrder,
  validatePayment,
  validateFileUpload,
  validateMongoId,
  validatePagination,
  handleValidationErrors
};