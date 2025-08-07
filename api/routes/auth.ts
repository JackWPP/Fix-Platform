/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import express from 'express';
import { 
  generateVerificationCode, 
  storeVerificationCode, 
  verifyVerificationCode,
  validatePhone,
  getUserByPhone,
  createUser,
  generateToken,
  comparePassword
} from '../utils/auth.js';
import { sendSMS } from '../utils/sms.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    // 验证手机号格式
    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    // 生成验证码
    const code = generateVerificationCode();
    
    // 存储验证码
    storeVerificationCode(phone, code);
    
    // 发送短信
    const smsResult = await sendSMS(phone, code);
    
    if (!smsResult) {
      return res.status(500).json({
        success: false,
        message: '验证码发送失败，请稍后重试'
      });
    }

    res.json({
      success: true,
      message: '验证码已发送，请注意查收'
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 手机验证码登录/注册
router.post('/login', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    // 验证输入
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    // 验证验证码
    if (!verifyVerificationCode(phone, code)) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 查找用户
    const { data: existingUser, error } = await getUserByPhone(phone);
    
    let user;
    
    if (error && error.code === 'PGRST116') {
      // 用户不存在，创建新用户
      try {
        user = await createUser({
          phone,
          password: 'sms_login', // 短信登录用户使用默认密码
          name: name || '',
          role: 'user'
        });
      } catch (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({
          success: false,
          message: '用户创建失败'
        });
      }
    } else if (existingUser) {
      user = existingUser;
    } else {
      return res.status(500).json({
        success: false,
        message: '用户查询失败'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 密码登录（管理员等特殊角色）
router.post('/password-login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    // 查找用户
    const { data: user, error } = await getUserByPhone(phone);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或密码错误'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// 用户登出
router.post('/logout', authenticateToken, (req, res) => {
  // JWT是无状态的，客户端删除token即可实现登出
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 刷新令牌
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 生成新的JWT令牌
    const newToken = generateToken(req.user.id, req.user.role);

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;