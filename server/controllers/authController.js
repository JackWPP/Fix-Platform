const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 发送验证码（模拟）- 保留用于注册
const sendCode = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // 在实际应用中，这里会调用短信服务发送验证码
    // 为了简化，我们直接返回成功
    res.json({ 
      success: true, 
      message: '验证码已发送（模拟）' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 用户注册
const register = async (req, res) => {
  try {
    const { username, phone, password, name, code } = req.body;
    
    // 验证必填字段
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '手机号和密码为必填项' 
      });
    }
    
    // 在实际应用中，这里会验证验证码
    // 为了简化，我们跳过验证码验证
    
    // 检查用户是否已存在
    let existingUser = await User.findOne({ 
      $or: [
        { phone },
        { username: username || null }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.phone === phone ? '手机号已被注册' : '用户名已被使用' 
      });
    }
    
    // 创建新用户
    const userData = { phone, password };
    if (username) userData.username = username;
    if (name) userData.name = name;
    
    const user = new User(userData);
    await user.save();
    
    // 生成token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier可以是用户名或手机号
    
    // 验证必填字段
    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入用户名/手机号和密码' 
      });
    }
    
    // 查找用户（支持用户名或手机号登录）
    let user;
    
    // 先尝试按手机号查找
    user = await User.findOne({ phone: identifier });
    
    // 如果没找到且identifier不是纯数字，再按用户名查找
    if (!user && !/^\d+$/.test(identifier)) {
      user = await User.findOne({ username: identifier });
    }
    
    console.log('查询用户:', identifier, '结果:', user ? '找到' : '未找到');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '密码错误' 
      });
    }
    
    // 生成token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 验证码登录（保留用于特殊情况）
const loginWithCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    // 在实际应用中，这里会验证验证码
    // 为了简化，我们跳过验证码验证
    
    // 查找用户
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    // 生成token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 管理员注册（需要超级管理员权限）
const adminRegister = async (req, res) => {
  try {
    const { username, phone, password, name, email, role } = req.body;
    
    // 验证必填字段
    if (!username || !phone || !password || !name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名、手机号、密码、姓名和角色为必填项' 
      });
    }
    
    // 验证角色
    const allowedRoles = ['admin', 'customer_service', 'repairman'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: '无效的角色类型' 
      });
    }
    
    // 检查用户是否已存在
    let existingUser = await User.findOne({ 
      $or: [
        { phone },
        { username }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.phone === phone ? '手机号已被注册' : '用户名已被使用' 
      });
    }
    
    // 创建新管理员用户
    const userData = { 
      username, 
      phone, 
      password, 
      name, 
      role 
    };
    
    if (email) userData.email = email;
    
    const user = new User(userData);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: '管理员账号创建成功',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  sendCode,
  register,
  login,
  loginWithCode,
  adminRegister
};