import api from './api';

// 创建订单
export const createOrder = async (orderData) => {
  try {
    console.log('orderService: 准备发送请求到 /orders');
    console.log('orderService: 请求数据:', orderData);
    const response = await api.post('/orders', orderData);
    console.log('orderService: 收到响应:', response);
    return response;
  } catch (error) {
    console.error('orderService: 请求失败:', error);
    console.error('orderService: 错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request
    });
    throw error;
  }
};

// 获取用户订单列表
export const getOrders = () => {
  return api.get('/orders');
};

// 获取订单详情
export const getOrderDetail = (id) => {
  return api.get(`/orders/${id}`);
};

// 取消订单
export const cancelOrder = (id) => {
  return api.put(`/orders/${id}/cancel`);
};

// 评价订单
export const rateOrder = (id, rating, comment) => {
  return api.post(`/orders/${id}/rate`, { rating, comment });
};