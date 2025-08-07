/**
 * Supabase数据库配置
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建Supabase客户端（后端使用service_role_key）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  ORDERS: 'orders',
  ORDER_IMAGES: 'order_images',
  ORDER_LOGS: 'order_logs',
  FEEDBACKS: 'feedbacks',
  USER_ADDRESSES: 'user_addresses'
} as const;

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  TECHNICIAN = 'technician',
  SERVICE = 'service',
  ADMIN = 'admin'
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 图片类型枚举
export enum ImageType {
  PROBLEM = 'problem',
  REPAIR = 'repair',
  RESULT = 'result'
}

export default supabase;