const User = require('../models/User');

// 获取用户信息
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
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
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      user: updatedUser
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
  updateUserInfo
};