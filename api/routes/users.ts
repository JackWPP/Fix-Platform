import express from 'express';
import { supabase } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { hashPassword, validatePhone } from '../utils/auth';

const router = express.Router();

// 获取用户列表（管理员）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, is_active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('users')
      .select('id, phone, name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // 角色过滤
    if (role) {
      query = query.eq('role', role);
    }

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // 状态过滤
    if (is_active !== undefined && is_active !== '') {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: '获取用户列表失败'
      });
    }

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取维修员列表
router.get('/technicians', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: technicians, error } = await supabase
      .from('users')
      .select('id, name, phone, created_at')
      .eq('role', 'repairman')
      .order('name');

    if (error) {
      console.error('Get technicians error:', error);
      return res.status(500).json({
        success: false,
        message: '获取维修员列表失败'
      });
    }

    res.json({
      success: true,
      data: { technicians }
    });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建用户（管理员）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { phone, name, role, password } = req.body;

    // 验证输入
    if (!phone || !name || !role) {
      return res.status(400).json({
        success: false,
        message: '手机号、姓名和角色不能为空'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号码'
      });
    }

    const validRoles = ['user', 'repairman', 'customer_service', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户角色'
      });
    }

    // 检查手机号是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    // 创建用户
    const hashedPassword = password ? await hashPassword(password) : await hashPassword('123456');
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        phone,
        name,
        role,
        password: hashedPassword,
        is_active: true
      })
      .select('id, phone, name, role, is_active, created_at')
      .single();

    if (error) {
      console.error('Create user error:', error);
      return res.status(500).json({
        success: false,
        message: '用户创建失败'
      });
    }

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户详情
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // 检查权限：用户只能查看自己的信息，管理员可以查看所有用户
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, name, role, is_active, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get user detail error:', error);
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新用户信息
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, role, is_active } = req.body;

    // 检查权限：用户只能更新自己的基本信息，管理员可以更新所有用户
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    // 普通用户不能修改角色
    if (req.user!.role !== 'admin' && role) {
      return res.status(403).json({
        success: false,
        message: '无权修改用户角色'
      });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (phone && validatePhone(phone)) {
      // 检查新手机号是否已被其他用户使用
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该手机号已被其他用户使用'
        });
      }
      updateData.phone = phone;
    }
    if (role && req.user!.role === 'admin') {
      const validRoles = ['user', 'repairman', 'customer_service', 'admin'];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }
    if (is_active !== undefined && req.user!.role === 'admin') {
      updateData.is_active = Boolean(is_active);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, phone, name, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        message: '用户信息更新失败'
      });
    }

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除用户（管理员）
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // 不能删除自己
    if (req.user!.id === userId) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }

    // 检查用户是否有未完成的订单
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
      .in('status', ['pending', 'assigned', 'in_progress']);

    if (orderError) {
      console.error('Check user orders error:', orderError);
      return res.status(500).json({
        success: false,
        message: '检查用户订单失败'
      });
    }

    if (orders && orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该用户有未完成的订单，无法删除'
      });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: '用户删除失败'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 重置用户密码（管理员）
router.post('/:userId/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { password = '123456' } = req.body;

    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: '密码重置失败'
      });
    }

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户统计信息（管理员）
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 获取用户总数
    const { count: totalUsers, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      console.error('Get user count error:', userError);
      return res.status(500).json({
        success: false,
        message: '获取用户统计失败'
      });
    }

    // 按角色统计用户数量
    const { data: roleStats, error: roleError } = await supabase
      .from('users')
      .select('role')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const stats = data.reduce((acc: any, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});
        
        return { data: stats, error: null };
      });

    if (roleError) {
      console.error('Get role stats error:', roleError);
      return res.status(500).json({
        success: false,
        message: '获取角色统计失败'
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        roleStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;