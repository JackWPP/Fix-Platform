const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 发送验证码（模拟）
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
    const { phone, code } = req.body;
    
    // 在实际应用中，这里会验证验证码
    // 为了简化，我们跳过验证码验证
    
    // 检查用户是否已存在
    let user = await User.findOne({ phone });
    
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: '用户已存在' 
      });
    }
    
    // 创建新用户
    user = new User({ phone });
    await user.save();
    
    // 生成token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
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

module.exports = {
  sendCode,
  register,
  login
};