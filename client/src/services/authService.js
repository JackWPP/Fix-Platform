import api from './api';

// 用户登录
export const login = (phone, code) => {
  return api.post('/auth/login', { phone, code });
};

// 用户注册
export const register = (phone, code) => {
  return api.post('/auth/register', { phone, code });
};

// 发送验证码
export const sendCode = (phone) => {
  return api.post('/auth/send-code', { phone });
};

// 获取用户信息
export const getUserInfo = () => {
  return api.get('/user/info');
};