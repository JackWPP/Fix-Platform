const User = require('../models/User');

// 获取用户信息
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 更新用户信息
const updateUserInfo = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: user._id,
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

// 获取所有用户（管理员）
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-__v').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 创建用户（管理员）
const createUser = async (req, res) => {
  try {
    const { phone, name, email, role } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }
    
    const user = new User({
      phone,
      name: name || '',
      email: email || '',
      role: role || 'user'
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: '用户创建成功',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 更新用户（管理员）
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    
    await user.save();
    
    res.json({
      success: true,
      message: '用户更新成功',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 删除用户（管理员）
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 不能删除管理员账户
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: '不能删除管理员账户'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};