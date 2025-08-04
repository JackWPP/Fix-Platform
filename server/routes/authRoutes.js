const express = require('express');
const router = express.Router();
const { sendCode, register, login, loginWithCode, adminRegister, getAuthConfig } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  validateRegister,
  validateLogin,
  validateCodeLogin,
  validateSendCode
} = require('../middleware/validation');

// 公开端点
router.get('/config', getAuthConfig);
router.post('/send-code', validateSendCode, sendCode);
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/login-with-code', validateCodeLogin, loginWithCode);

// 需要认证的端点
router.post('/admin-register', auth, roleAuth(['admin']), adminRegister);

module.exports = router;