import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../utils/auth.js';

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        name: string;
        role: string;
        created_at: string;
        updated_at: string;
      };
    }
  }
}

// 认证中间件
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失'
      });
    }

    // 验证token
    const decoded = verifyToken(token);
    
    // 获取用户信息
    const user = await getUserById(decoded.userId);
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: '访问令牌无效或已过期'
    });
  }
};

// 角色权限中间件
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};

// 管理员权限中间件
export const requireAdmin = requireRole(['admin']);

// 维修员权限中间件
export const requireTechnician = requireRole(['repairman', 'admin']);

// 客服权限中间件
export const requireCustomerService = requireRole(['customer_service', 'admin']);

// 用户或更高权限中间件
export const requireUser = requireRole(['user', 'repairman', 'customer_service', 'admin']);

// 可选认证中间件（不强制要求登录）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await getUserById(decoded.userId);
        req.user = user;
      } catch (error) {
        // 忽略token验证错误，继续处理请求
        console.log('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// 检查用户是否为订单所有者或相关维修员
export const checkOrderAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const orderId = req.params.orderId || req.body.orderId;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '订单ID缺失'
      });
    }

    // 管理员和客服可以访问所有订单
    if (['admin', 'customer_service'].includes(req.user.role)) {
      return next();
    }

    // 导入supabase客户端
    const { supabase } = await import('../config/database.js');
    
    // 查询订单信息
    const { data: order, error } = await supabase
      .from('orders')
      .select('user_id, assigned_to')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 检查用户是否为订单所有者或分配的维修员
    const isOwner = order.user_id === req.user.id;
    const isAssignedTechnician = order.assigned_to === req.user.id;

    if (!isOwner && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: '无权访问此订单'
      });
    }

    next();
  } catch (error) {
    console.error('Order access check failed:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};