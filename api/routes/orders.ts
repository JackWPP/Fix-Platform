import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken, requireUser, requireTechnician, requireAdmin, checkOrderAccess } from '../middleware/auth.js';
import { sendOrderNotification } from '../utils/sms.js';

const router = express.Router();

// 创建订单
router.post('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const {
      device_type,
      device_model,
      service_type,
      appointment_service,
      liquid_metal,
      problem_description,
      issue_description,
      service_details,
      urgency,
      contact_name,
      contact_phone,
      appointment_time,
      images
    } = req.body;

    // 验证必填字段
    if (!device_type || !device_model || !service_type || !contact_name || !contact_phone || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的订单信息'
      });
    }

    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user!.id,
        device_type,
        device_model,
        service_type,
        appointment_service,
        liquid_metal,
        problem_description,
        issue_description,
        service_details,
        urgency: urgency || 'normal',
        contact_name,
        contact_phone,
        appointment_time,
        status: '待处理'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return res.status(500).json({
        success: false,
        message: '订单创建失败'
      });
    }

    // 如果有图片，保存图片信息
    if (images && images.length > 0) {
      const imageInserts = images.map((image: any) => ({
        order_id: order.id,
        image_url: image.url,
        image_type: image.type || 'problem'
      }));

      const { error: imageError } = await supabase
        .from('order_images')
        .insert(imageInserts);

      if (imageError) {
        console.error('Save order images error:', imageError);
      }
    }

    // 记录订单日志
    await supabase
      .from('order_logs')
      .insert({
        order_id: order.id,
        user_id: req.user!.id,
        action: 'created',
        description: '订单已创建'
      });

    // 发送订单创建通知短信
    await sendOrderNotification(contact_phone, 'order_created', {
      order_id: order.id,
      contact_name
    });

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取订单列表
router.get('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assigned_to } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('orders')
      .select(`
        *,
        users!orders_user_id_fkey(name, phone),
        assigned_user:users!orders_assigned_to_fkey(name, phone),
        order_images(image_url, image_type)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // 根据用户角色过滤订单
    if (req.user!.role === 'user') {
      query = query.eq('user_id', req.user!.id);
    } else if (req.user!.role === 'repairman') {
      query = query.eq('assigned_to', req.user!.id);
    }
    // 管理员和客服可以查看所有订单

    // 状态过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 分配给特定维修员的订单
    if (assigned_to && ['admin', 'customer_service'].includes(req.user!.role)) {
      query = query.eq('assigned_to', assigned_to);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Get orders error:', error);
      return res.status(500).json({
        success: false,
        message: '获取订单列表失败'
      });
    }

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取订单详情
router.get('/:orderId', authenticateToken, checkOrderAccess, async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!orders_user_id_fkey(name, phone),
        assigned_user:users!orders_assigned_to_fkey(name, phone),
        order_images(id, image_url, image_type),
        order_logs(
          id,
          action,
          description,
          created_at,
          users(name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Get order detail error:', error);
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 分配订单给维修员
router.put('/:orderId/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        success: false,
        message: '请选择维修员'
      });
    }

    // 验证维修员是否存在
    const { data: technician, error: techError } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('id', technician_id)
      .eq('role', 'repairman')
      .single();

    if (techError || !technician) {
      return res.status(400).json({
        success: false,
        message: '维修员不存在'
      });
    }

    // 更新订单
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        assigned_to: technician_id,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        users!orders_user_id_fkey(name, phone)
      `)
      .single();

    if (updateError) {
      console.error('Assign order error:', updateError);
      return res.status(500).json({
        success: false,
        message: '订单分配失败'
      });
    }

    // 记录订单日志
    await supabase
      .from('order_logs')
      .insert({
        order_id: orderId,
        user_id: req.user!.id,
        action: 'assigned',
        description: `订单已分配给维修员：${technician.name}`
      });

    // 发送分配通知短信
    await sendOrderNotification(order.contact_phone, 'order_assigned', {
      order_id: orderId,
      technician_name: technician.name
    });

    res.json({
      success: true,
      message: '订单分配成功',
      data: { order }
    });
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新订单状态
router.put('/:orderId/status', authenticateToken, checkOrderAccess, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description } = req.body;

    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的订单状态'
      });
    }

    // 更新订单状态
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        users!orders_user_id_fkey(name, phone)
      `)
      .single();

    if (updateError) {
      console.error('Update order status error:', updateError);
      return res.status(500).json({
        success: false,
        message: '订单状态更新失败'
      });
    }

    // 记录订单日志
    await supabase
      .from('order_logs')
      .insert({
        order_id: orderId,
        user_id: req.user!.id,
        action: 'status_changed',
        description: description || `订单状态已更新为：${status}`
      });

    // 如果订单完成，发送完成通知
    if (status === 'completed') {
      await sendOrderNotification(order.contact_phone, 'order_completed', {
        order_id: orderId,
        contact_name: order.contact_name
      });
    }

    res.json({
      success: true,
      message: '订单状态更新成功',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 添加订单备注
router.post('/:orderId/notes', authenticateToken, checkOrderAccess, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: '备注内容不能为空'
      });
    }

    // 添加订单日志
    const { data: log, error } = await supabase
      .from('order_logs')
      .insert({
        order_id: orderId,
        user_id: req.user!.id,
        action: 'note_added',
        description
      })
      .select(`
        *,
        users(name)
      `)
      .single();

    if (error) {
      console.error('Add order note error:', error);
      return res.status(500).json({
        success: false,
        message: '添加备注失败'
      });
    }

    res.json({
      success: true,
      message: '备注添加成功',
      data: { log }
    });
  } catch (error) {
    console.error('Add order note error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取设备类型列表
router.get('/meta/device-types', async (req, res) => {
  try {
    const { data: deviceTypes, error } = await supabase
      .from('device_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Get device types error:', error);
      return res.status(500).json({
        success: false,
        message: '获取设备类型失败'
      });
    }

    res.json({
      success: true,
      data: { deviceTypes }
    });
  } catch (error) {
    console.error('Get device types error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取服务类型列表
router.get('/meta/service-types', async (req, res) => {
  try {
    const { data: serviceTypes, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Get service types error:', error);
      return res.status(500).json({
        success: false,
        message: '获取服务类型失败'
      });
    }

    res.json({
      success: true,
      data: { serviceTypes }
    });
  } catch (error) {
    console.error('Get service types error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;