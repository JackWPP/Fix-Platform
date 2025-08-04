import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 认证相关API
export const authAPI = {
  // 发送验证码
  sendCode: (phone) => api.post('/auth/send-code', { phone }),
  
  // 密码登录（主要登录方式）
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  
  // 验证码登录（备用登录方式）
  loginWithCode: (phone, code) => api.post('/auth/login-with-code', { phone, code }),
  
  // 注册
  register: (data) => api.post('/auth/register', data),
  
  // 管理员注册
  adminRegister: (data) => api.post('/auth/admin-register', data),
};

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getUserInfo: () => api.get('/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => api.put('/user/info', data),
  
  // 管理员 - 获取所有用户
  getAllUsers: () => api.get('/user/admin/all'),
  
  // 管理员 - 创建用户
  createUser: (data) => api.post('/user/admin/create', data),
  
  // 管理员 - 更新用户
  updateUser: (id, data) => api.put(`/user/admin/${id}`, data),
  
  // 管理员 - 删除用户
  deleteUser: (id) => api.delete(`/user/admin/${id}`),
};

// 订单相关API
export const orderAPI = {
  // 创建订单
  createOrder: (data) => api.post('/orders', data),
  
  // 获取用户订单列表
  getOrders: () => api.get('/orders'),
  
  // 获取订单详情
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  
  // 取消订单
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // 评价订单
  rateOrder: (id, data) => api.post(`/orders/${id}/rate`, data),
  
  // 维修员 - 获取分配的订单
  getRepairmanOrders: () => api.get('/orders/repairman/orders'),
  
  // 维修员 - 更新订单状态
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  
  // 管理员 - 获取所有订单
  getAllOrders: () => api.get('/orders/admin/all'),
  
  // 管理员 - 分配订单
  assignOrder: (id, repairmanId) => api.put(`/orders/${id}/assign`, { repairmanId }),
};

// 支付相关API
export const paymentAPI = {
  // 获取服务价格
  getServicePrices: () => api.get('/payment/prices'),
  
  // 发起支付
  initiatePayment: (data) => api.post('/payment/initiate', data),
  
  // 查询支付状态
  getPaymentStatus: (orderId) => api.get(`/payment/status/${orderId}`),
  
  // 模拟支付
  simulatePayment: (data) => api.post('/payment/simulate', data),
  
  // 申请退款
  requestRefund: (data) => api.post('/payment/refund', data),
  
  // 获取支付统计数据
  getPaymentStatistics: () => api.get('/payment/statistics'),
};

// 统计数据相关API
export const statsAPI = {
  // 获取订单统计数据
  getOrderStats: (period = '30') => api.get(`/stats/orders?period=${period}`),
  
  // 获取维修员绩效统计
  getRepairmanStats: (period = '30') => api.get(`/stats/repairman?period=${period}`),
  
  // 获取客户满意度统计
  getCustomerSatisfactionStats: (period = '30') => api.get(`/stats/satisfaction?period=${period}`),
  
  // 获取收入统计
  getRevenueStats: (period = '30') => api.get(`/stats/revenue?period=${period}`),
  
  // 获取综合仪表盘数据
  getDashboardStats: (period = '30') => api.get(`/stats/dashboard?period=${period}`),
};

// 配置管理相关API
export const configAPI = {
  // 服务类型管理
  getServiceTypes: () => api.get('/config/service-types'),
  getServiceType: (id) => api.get(`/config/service-types/${id}`),
  createServiceType: (data) => api.post('/config/service-types', data),
  updateServiceType: (id, data) => api.put(`/config/service-types/${id}`, data),
  deleteServiceType: (id) => api.delete(`/config/service-types/${id}`),
  
  // 设备类型管理
  getDeviceTypes: () => api.get('/config/device-types'),
  getDeviceType: (id) => api.get(`/config/device-types/${id}`),
  createDeviceType: (data) => api.post('/config/device-types', data),
  updateDeviceType: (id, data) => api.put(`/config/device-types/${id}`, data),
  deleteDeviceType: (id) => api.delete(`/config/device-types/${id}`),
  
  // 价格策略管理
  getPricingStrategies: () => api.get('/config/pricing-strategies'),
  getPricingStrategy: (id) => api.get(`/config/pricing-strategies/${id}`),
  createPricingStrategy: (data) => api.post('/config/pricing-strategies', data),
  updatePricingStrategy: (id, data) => api.put(`/config/pricing-strategies/${id}`, data),
  deletePricingStrategy: (id) => api.delete(`/config/pricing-strategies/${id}`),
  
  // 价格计算
  calculatePrice: (data) => api.post('/config/pricing-strategies/calculate', data),
  
  // 系统配置管理
  getSystemConfigs: (category) => api.get(`/config/system-configs${category ? `?category=${category}` : ''}`),
  getSystemConfig: (id) => api.get(`/config/system-configs/${id}`),
  createSystemConfig: (data) => api.post('/config/system-configs', data),
  updateSystemConfig: (id, data) => api.put(`/config/system-configs/${id}`, data),
  deleteSystemConfig: (id) => api.delete(`/config/system-configs/${id}`),
  
  // 批量更新系统配置
  batchUpdateSystemConfigs: (data) => api.put('/config/system-configs/batch', data),
};

export default api;