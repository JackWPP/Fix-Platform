import api from './api';

// 创建订单
export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
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