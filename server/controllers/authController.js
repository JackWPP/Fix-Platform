const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 发送验证码 - 根据环境变量决定是否启用
const sendCode = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // 检查是否启用短信验证码功能
    const smsEnabled = process.env.ENABLE_SMS_VERIFICATION === 'true';
    
    if (!smsEnabled) {
      return res.json({ 
        success: true, 
        message: '验证码功能已禁用，请使用密码登录' 
      });
    }
    
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入有效的手机号' 
      });
    }
    
    // 在实际应用中，这里会调用短信服务发送验证码
    // 当前为模拟模式
    if (process.env.NODE_ENV === 'development') {
      console.log(`模拟发送验证码到 ${phone}: 123456`);
    }
    
    res.json({ 
      success: true, 
      message: smsEnabled ? '验证码已发送' : '验证码已发送（模拟）' 
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '发送验证码失败，请稍后重试' 
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
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入有效的手机号' 
      });
    }
    
    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少需要6个字符' 
      });
    }
    
    // 检查是否启用短信验证码功能
    const smsEnabled = process.env.ENABLE_SMS_VERIFICATION === 'true';
    
    // 如果启用了短信验证码，需要验证验证码
    if (smsEnabled) {
      if (!code) {
        return res.status(400).json({ 
          success: false, 
          message: '请输入验证码' 
        });
      }
      
      // 在实际应用中，这里会验证验证码
      // 当前为模拟验证（开发环境接受123456）
      if (process.env.NODE_ENV === 'development' && code !== '123456') {
        return res.status(400).json({ 
          success: false, 
          message: '验证码错误（开发环境请使用123456）' 
        });
      }
    }
    
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
    
    console.log(`新用户注册成功: ${phone} (${user.role})`);
    
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
    console.error('用户注册错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '注册失败，请稍后重试' 
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
    
    console.log(`用户登录尝试: ${identifier} (${user ? '找到用户' : '用户不存在'})`);
    
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
    
    console.log(`用户密码登录成功: ${identifier} (${user.role})`);
    
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
    console.error('用户登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败，请稍后重试' 
    });
  }
};

// 验证码登录（当启用短信验证码时使用）
const loginWithCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    // 检查是否启用短信验证码功能
    const smsEnabled = process.env.ENABLE_SMS_VERIFICATION === 'true';
    
    if (!smsEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: '验证码登录功能已禁用，请使用密码登录' 
      });
    }
    
    // 验证必填字段
    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入手机号和验证码' 
      });
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入有效的手机号' 
      });
    }
    
    // 在实际应用中，这里会验证验证码
    // 当前为模拟验证（开发环境接受123456）
    if (process.env.NODE_ENV === 'development' && code !== '123456') {
      return res.status(400).json({ 
        success: false, 
        message: '验证码错误（开发环境请使用123456）' 
      });
    }
    
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
    
    console.log(`用户验证码登录成功: ${phone} (${user.role})`);
    
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
    console.error('验证码登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败，请稍后重试' 
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

// 获取认证配置信息
const getAuthConfig = async (req, res) => {
  try {
    const config = {
      smsEnabled: process.env.ENABLE_SMS_VERIFICATION === 'true',
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('获取认证配置错误:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
};

module.exports = {
  sendCode,
  register,
  login,
  loginWithCode,
  adminRegister,
  getAuthConfig
};