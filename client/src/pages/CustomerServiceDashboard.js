import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import NotificationCenter from '../components/NotificationCenter';
import './Dashboard.css';

const CustomerServiceDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      alert('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, {
        status: newStatus
      });
      if (response.data.success) {
        alert('订单状态更新成功');
        fetchOrders();
        setShowModal(false);
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态失败');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      '待处理': '#ff9800',
      '处理中': '#2196f3',
      '已完成': '#4caf50',
      '已取消': '#f44336'
    };
    return colors[status] || '#666';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'emergency': '#f44336',
      'urgent': '#ff9800',
      'normal': '#4caf50'
    };
    return colors[urgency] || '#666';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>客服工作台</h1>
          <NotificationCenter />
        </div>
        <div className="stats">
          <div className="stat-card">
            <h3>总订单</h3>
            <p>{orders.length}</p>
          </div>
          <div className="stat-card">
            <h3>待处理</h3>
            <p>{orders.filter(o => o.status === '待处理').length}</p>
          </div>
          <div className="stat-card">
            <h3>处理中</h3>
            <p>{orders.filter(o => o.status === '处理中').length}</p>
          </div>
          <div className="stat-card">
            <h3>已完成</h3>
            <p>{orders.filter(o => o.status === '已完成').length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="filter-bar">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部订单
          </button>
          <button 
            className={filter === '待处理' ? 'active' : ''}
            onClick={() => setFilter('待处理')}
          >
            待处理
          </button>
          <button 
            className={filter === '处理中' ? 'active' : ''}
            onClick={() => setFilter('处理中')}
          >
            处理中
          </button>
          <button 
            className={filter === '已完成' ? 'active' : ''}
            onClick={() => setFilter('已完成')}
          >
            已完成
          </button>
        </div>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>暂无订单</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{order.deviceType} - {order.deviceModel}</h3>
                    <p className="order-id">订单号: {order._id.slice(-8)}</p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    <span 
                      className="urgency-badge"
                      style={{ backgroundColor: getUrgencyColor(order.urgency) }}
                    >
                      {order.urgency === 'emergency' ? '紧急' : 
                       order.urgency === 'urgent' ? '加急' : '普通'}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <p><strong>客户:</strong> {order.contactName}</p>
                  <p><strong>电话:</strong> {order.contactPhone}</p>
                  <p><strong>问题:</strong> {order.problemDescription}</p>
                  <p><strong>预约时间:</strong> {new Date(order.appointmentTime).toLocaleString()}</p>
                  {order.assignedTo && (
                    <p><strong>分配维修员:</strong> {order.assignedTo.name}</p>
                  )}
                </div>
                
                <div className="order-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleViewOrder(order)}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 订单详情模态框 */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>订单详情</h2>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>基本信息</h3>
                <p><strong>设备类型:</strong> {selectedOrder.deviceType}</p>
                <p><strong>设备型号:</strong> {selectedOrder.deviceModel}</p>
                <p><strong>服务类型:</strong> {selectedOrder.serviceType === 'repair' ? '维修' : '预约服务'}</p>
                <p><strong>问题描述:</strong> {selectedOrder.problemDescription}</p>
                <p><strong>紧急程度:</strong> 
                  {selectedOrder.urgency === 'emergency' ? '紧急' : 
                   selectedOrder.urgency === 'urgent' ? '加急' : '普通'}
                </p>
              </div>
              
              <div className="detail-section">
                <h3>联系信息</h3>
                <p><strong>客户姓名:</strong> {selectedOrder.contactName}</p>
                <p><strong>联系电话:</strong> {selectedOrder.contactPhone}</p>
                <p><strong>预约时间:</strong> {new Date(selectedOrder.appointmentTime).toLocaleString()}</p>
              </div>
              
              {selectedOrder.assignedTo && (
                <div className="detail-section">
                  <h3>维修信息</h3>
                  <p><strong>维修员:</strong> {selectedOrder.assignedTo.name}</p>
                  <p><strong>维修员电话:</strong> {selectedOrder.assignedTo.phone}</p>
                  {selectedOrder.repairNotes && (
                    <p><strong>维修备注:</strong> {selectedOrder.repairNotes}</p>
                  )}
                </div>
              )}
              
              {selectedOrder.rating && (
                <div className="detail-section">
                  <h3>客户评价</h3>
                  <p><strong>评分:</strong> {'★'.repeat(selectedOrder.rating.score)}{'☆'.repeat(5-selectedOrder.rating.score)}</p>
                  <p><strong>评价:</strong> {selectedOrder.rating.comment}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {selectedOrder.status === '待处理' && (
                <button 
                  className="btn-primary"
                  onClick={() => handleUpdateStatus(selectedOrder._id, '处理中')}
                >
                  标记为处理中
                </button>
              )}
              {selectedOrder.status === '处理中' && (
                <button 
                  className="btn-success"
                  onClick={() => handleUpdateStatus(selectedOrder._id, '已完成')}
                >
                  标记为已完成
                </button>
              )}
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServiceDashboard;