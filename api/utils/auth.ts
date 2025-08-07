import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import type { StringValue } from 'ms';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: StringValue | number = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

// JWT令牌接口
interface JWTPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// 生成JWT令牌
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// 验证JWT令牌
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (_error) {
    throw new Error('Invalid token');
  }
};

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 生成6位数验证码
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 验证手机号格式
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 根据用户ID获取用户信息
export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error('User not found');
  }

  return data;
};

// 根据手机号获取用户信息
export const getUserByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  return { data, error };
};

// 创建新用户
export const createUser = async (userData: {
  phone: string;
  password: string;
  name?: string;
  role?: string;
}) => {
  const hashedPassword = await hashPassword(userData.password);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      phone: userData.phone,
      password: hashedPassword,
      name: userData.name || '',
      role: userData.role || 'user'
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create user');
  }

  return data;
};

// 更新用户信息
export const updateUser = async (userId: string, updateData: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update user');
  }

  return data;
};

// 验证码存储（简单内存存储，生产环境建议使用Redis）
const verificationCodes = new Map<string, { code: string; expires: number }>();

// 存储验证码
export const storeVerificationCode = (phone: string, code: string): void => {
  const expires = Date.now() + 5 * 60 * 1000; // 5分钟过期
  verificationCodes.set(phone, { code, expires });
};

// 验证验证码
export const verifyVerificationCode = (phone: string, code: string): boolean => {
  const stored = verificationCodes.get(phone);
  
  if (!stored) {
    return false;
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(phone);
    return false;
  }
  
  if (stored.code !== code) {
    return false;
  }
  
  verificationCodes.delete(phone);
  return true;
};

// 清理过期验证码
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(phone);
    }
  }
}, 60 * 1000); // 每分钟清理一次