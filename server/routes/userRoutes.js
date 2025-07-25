const express = require('express');
const router = express.Router();
const { getUserInfo, updateUserInfo } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 获取用户信息
router.get('/info', getUserInfo);

// 更新用户信息
router.put('/info', updateUserInfo);

module.exports = router;