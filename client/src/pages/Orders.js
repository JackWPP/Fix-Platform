import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, message, Input, Select, Card, Row, Col, Modal, Descriptions, Form, Rate, Statistic } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, DeleteOutlined, StarOutlined, DollarOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { orderAPI } from '../services/api';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const Orders = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();
  
  // 模拟从API获取订单数据
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = (record) => {
    const orderId = record._id ? record._id.slice(-8).toUpperCase() : 'N/A';
    Modal.confirm({
      title: '确认取消订单',
      content: `确定要取消订单 ${orderId} 吗？`,
      onOk: async () => {
        try {
          await orderAPI.cancelOrder(record._id, { reason: '用户主动取消' });
          message.success('订单已取消');
          fetchOrders();
        } catch (error) {
          console.error('取消订单失败:', error);
          message.error('取消订单失败，请重试');
        }
      }
    });
  };

  const handleReview = (record) => {
    setSelectedOrder(record);
    setReviewModalVisible(true);
  };

  const submitReview = async (values) => {
    try {
      await orderAPI.reviewOrder(selectedOrder._id, values);
      message.success('评价提交成功');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchOrders();
    } catch (error) {
      message.error('提交评价失败');
    }
  };

  const handleCreateOrder = () => {
    history.push('/create-order');
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'in_progress': 'cyan',
      'completed': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': '待确认',
      'confirmed': '已确认',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'unpaid': 'red',
      'paid': 'green',
      'failed': 'red',
      'refunded': 'orange'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      'unpaid': '未支付',
      'paid': '已支付',
      'failed': '支付失败',
      'refunded': '已退款'
    };
    return texts[status] || status;
  };

  const handlePayment = (record) => {
    history.push(`/payment/${record._id}`);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.slice(-8).toUpperCase() : 'N/A',
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: '设备型号',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: '问题描述',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
      render: (text) => text ? (text.length > 20 ? text.slice(0, 20) + '...' : text) : 'N/A',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : 'N/A',
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `¥${amount}` : '¥0',
    },
    {
      title: '支付状态',
      key: 'paymentStatus',
      dataIndex: 'paymentStatus',
      render: paymentStatus => (
        <Tag color={getPaymentStatusColor(paymentStatus || 'unpaid')} key={paymentStatus}>
          {getPaymentStatusText(paymentStatus || 'unpaid')}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: status => (
        <Tag color={getStatusColor(status)} key={status}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>查看详情</Button>
          {record.paymentStatus === 'unpaid' && (
            <Button type="link" size="small" onClick={() => handlePayment(record)}>
              <DollarOutlined /> 去支付
            </Button>
          )}
          {record.status === 'pending' && <Button type="link" size="small" onClick={() => handleCancelOrder(record)}>取消订单</Button>}
          {record.status === 'completed' && !record.review && (
            <Button type="link" size="small" onClick={() => handleReview(record)}>
              <StarOutlined /> 评价
            </Button>
          )}
        </Space>
      ),
    },
  ];



  // 获取订单统计
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
    return stats;
  };

  const stats = getOrderStats();

  // 过滤订单数据
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchText || 
      (order._id && order._id.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.deviceType && order.deviceType.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.deviceModel && order.deviceModel.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.problemDescription && order.problemDescription.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>我的订单</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总订单" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待确认" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="进行中" value={stats.inProgress} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 搜索和过滤区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="搜索订单号、设备类型或问题描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择状态"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待确认</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
              style={{ width: '100%' }}
            >
              创建新订单
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 订单表格 */}
      <Table 
        columns={columns} 
        dataSource={filteredOrders}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
      />

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedOrder && (
           <Descriptions column={2} bordered>
             <Descriptions.Item label="订单号">
               {selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A'}
             </Descriptions.Item>
             <Descriptions.Item label="状态">
               <Tag color={getStatusColor(selectedOrder.status)}>
                 {getStatusText(selectedOrder.status)}
               </Tag>
             </Descriptions.Item>
             <Descriptions.Item label="设备类型">{selectedOrder.deviceType || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="设备型号">{selectedOrder.deviceModel || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="服务类型">{selectedOrder.serviceType || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="订单金额">
               <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5222d' }}>
                 ¥{selectedOrder.amount || 0}
               </span>
             </Descriptions.Item>
             <Descriptions.Item label="支付状态">
               <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus || 'unpaid')}>
                 {getPaymentStatusText(selectedOrder.paymentStatus || 'unpaid')}
               </Tag>
             </Descriptions.Item>
             <Descriptions.Item label="紧急程度">
               {{
                 'low': '低',
                 'medium': '中',
                 'high': '高'
               }[selectedOrder.urgency] || '中'}
             </Descriptions.Item>
             <Descriptions.Item label="联系人">{selectedOrder.contactName || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="联系电话">{selectedOrder.contactPhone || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="预约时间" span={2}>
               {selectedOrder.appointmentTime ? new Date(selectedOrder.appointmentTime).toLocaleString('zh-CN') : 'N/A'}
             </Descriptions.Item>
             <Descriptions.Item label="提交时间" span={2}>
               {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('zh-CN') : 'N/A'}
             </Descriptions.Item>
             <Descriptions.Item label="问题描述" span={2}>
               {selectedOrder.problemDescription || 'N/A'}
             </Descriptions.Item>
             {selectedOrder.assignedTo && (
               <Descriptions.Item label="分配维修员" span={2}>
                 {selectedOrder.assignedTo.username}
               </Descriptions.Item>
             )}
             {selectedOrder.paymentTime && (
               <Descriptions.Item label="支付时间" span={2}>
                 {new Date(selectedOrder.paymentTime).toLocaleString('zh-CN')}
               </Descriptions.Item>
             )}
             {selectedOrder.paymentMethod && (
               <Descriptions.Item label="支付方式" span={2}>
                 {selectedOrder.paymentMethod === 'wechat' ? '微信支付' : 
                  selectedOrder.paymentMethod === 'alipay' ? '支付宝' : selectedOrder.paymentMethod}
               </Descriptions.Item>
             )}
             {selectedOrder.completedAt && (
               <Descriptions.Item label="完成时间" span={2}>
                 {new Date(selectedOrder.completedAt).toLocaleString('zh-CN')}
               </Descriptions.Item>
             )}
             {selectedOrder.review && (
               <Descriptions.Item label="我的评价" span={2}>
                 <div>
                   <Rate disabled value={selectedOrder.review.rating} />
                   <p style={{ marginTop: 8 }}>{selectedOrder.review.comment}</p>
                 </div>
               </Descriptions.Item>
             )}
           </Descriptions>
         )}
      </Modal>

      {/* 评价模态框 */}
      <Modal
        title="服务评价"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={reviewForm}
          onFinish={submitReview}
          layout="vertical"
        >
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea
              placeholder="请输入您对本次服务的评价"
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              提交评价
            </Button>
            <Button onClick={() => {
              setReviewModalVisible(false);
              reviewForm.resetFields();
            }}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;