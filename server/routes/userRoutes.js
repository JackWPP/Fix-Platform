const express = require('express');
const router = express.Router();
const { 
  getUserInfo, 
  updateUserInfo,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 获取用户信息
router.get('/info', getUserInfo);

// 更新用户信息
router.put('/info', updateUserInfo);

// 管理员用户管理路由
// 获取所有用户（管理员）
router.get('/admin/all', roleAuth(['admin']), getAllUsers);

// 创建用户（管理员）
router.post('/admin/create', roleAuth(['admin']), createUser);

// 更新用户（管理员）
router.put('/admin/:id', roleAuth(['admin']), updateUser);

// 删除用户（管理员）
router.delete('/admin/:id', roleAuth(['admin']), deleteUser);

module.exports = router;