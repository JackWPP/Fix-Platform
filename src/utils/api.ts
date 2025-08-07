import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API接口定义
export const authAPI = {
  // 发送验证码
  sendCode: (phone: string) => 
    api.post('/auth/send-code', { phone }),
  
  // 手机验证码登录
  login: (phone: string, code: string, name?: string) => 
    api.post('/auth/login', { phone, code, name }),
  
  // 密码登录
  passwordLogin: (phone: string, password: string) => 
    api.post('/auth/password-login', { phone, password }),
  
  // 获取当前用户信息
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  // 刷新token
  refreshToken: () => 
    api.post('/auth/refresh'),
  
  // 登出
  logout: () => 
    api.post('/auth/logout'),
};

export const orderAPI = {
  // 创建订单
  createOrder: (orderData: any) => 
    api.post('/orders', orderData),
  
  // 获取订单列表
  getOrders: (params?: any) => 
    api.get('/orders', { params }),
  
  // 获取订单详情
  getOrderDetail: (orderId: string) => 
    api.get(`/orders/${orderId}`),
  
  // 根据ID获取订单
  getOrderById: (orderId: string) => 
    api.get(`/orders/${orderId}`),
  
  // 删除订单
  deleteOrder: (orderId: string) => 
    api.delete(`/orders/${orderId}`),
  
  // 更新订单
  updateOrder: (orderId: string, updateData: any) => 
    api.put(`/orders/${orderId}`, updateData),
  
  // 分配订单
  assignOrder: (orderId: string, technician_id: string) => 
    api.put(`/orders/${orderId}/assign`, { technician_id }),
  
  // 更新订单状态
  updateOrderStatus: (orderId: string, status: string, description?: string) => 
    api.put(`/orders/${orderId}/status`, { status, description }),
  
  // 添加订单备注
  addOrderNote: (orderId: string, description: string) => 
    api.post(`/orders/${orderId}/notes`, { description }),
  
  // 获取设备类型
  getDeviceTypes: () => 
    api.get('/orders/meta/device-types'),
  
  // 获取服务类型
  getServiceTypes: () => 
    api.get('/orders/meta/service-types'),
};

export const userAPI = {
  // 获取用户列表
  getUsers: (params?: any) => 
    api.get('/users', { params }),
  
  // 根据ID获取用户
  getUserById: (userId: string) => 
    api.get(`/users/${userId}`),
  
  // 获取维修员列表
  getTechnicians: () => 
    api.get('/users/technicians'),
  
  // 创建用户
  createUser: (userData: any) => 
    api.post('/users', userData),
  
  // 获取用户详情
  getUserDetail: (userId: string) => 
    api.get(`/users/${userId}`),
  
  // 更新用户信息
  updateUser: (userId: string, userData: any) => 
    api.put(`/users/${userId}`, userData),
  
  // 删除用户
  deleteUser: (userId: string) => 
    api.delete(`/users/${userId}`),
  
  // 重置密码
  resetPassword: (userId: string, password?: string) => 
    api.post(`/users/${userId}/reset-password`, { password }),
  
  // 获取用户统计
  getUserStats: () => 
    api.get('/users/stats/overview'),
  
  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => 
    api.put('/users/change-password', data),
};

export const uploadAPI = {
  // 单文件上传
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 多文件上传
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 删除文件
  deleteFile: (fileName: string) => 
    api.delete(`/upload/${fileName}`),
  
  // 获取文件信息
  getFileInfo: (fileName: string) => 
    api.get(`/upload/info/${fileName}`),
};

// 通用错误处理
export const handleAPIError = (error: any) => {
  if (error.response) {
    // 服务器返回错误状态码
    const { status, data } = error.response;
    return {
      success: false,
      message: data?.message || `请求失败 (${status})`,
      status,
    };
  } else if (error.request) {
    // 请求发送但没有收到响应
    return {
      success: false,
      message: '网络连接失败，请检查网络设置',
    };
  } else {
    // 其他错误
    return {
      success: false,
      message: error.message || '未知错误',
    };
  }
};

export default api;