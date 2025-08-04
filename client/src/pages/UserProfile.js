import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Avatar, 
  Button, 
  Form, 
  Input, 
  List, 
  Tag, 
  Modal, 
  Rate, 
  message, 
  Spin, 
  Empty, 
  Row, 
  Col, 
  Statistic,
  Typography,
  Space,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  ShoppingOutlined,
  EditOutlined,
  StarOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { userAPI, orderAPI } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [ratingModal, setRatingModal] = useState({ visible: false, order: null });
  const [ratingForm] = Form.useForm();

  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserInfo();
      if (response.success) {
        setUser(response.user);
        form.setFieldsValue({
          name: response.user.name,
          phone: response.user.phone,
          email: response.user.email
        });
      } else {
        message.error(response.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderAPI.getOrders();
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        message.error(response.message || '获取订单失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const response = await userAPI.updateUserInfo(values);
      if (response.success) {
        setUser(response.user);
        setEditMode(false);
        message.success('个人信息更新成功');
      } else {
        message.error(response.message || '更新个人信息失败');
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      message.error('更新个人信息失败');
    }
  };

  const handleCancelOrder = async (orderId) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？取消后无法恢复。',
      okText: '确认取消',
      cancelText: '我再想想',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await orderAPI.cancelOrder(orderId);
          if (response.success) {
            message.success('订单取消成功');
            fetchOrders();
          } else {
            message.error(response.message || '取消订单失败');
          }
        } catch (error) {
          console.error('取消订单失败:', error);
          message.error('取消订单失败');
        }
      }
    });
  };

  const handleRateOrder = async (values) => {
    try {
      const response = await orderAPI.rateOrder(ratingModal.order._id, values);
      if (response.success) {
        message.success('评价提交成功');
        setRatingModal({ visible: false, order: null });
        ratingForm.resetFields();
        fetchOrders();
      } else {
        message.error(response.message || '提交评价失败');
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      message.error('提交评价失败');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      '待处理': { color: 'orange', icon: <ClockCircleOutlined /> },
      '处理中': { color: 'blue', icon: <ClockCircleOutlined /> },
      '已完成': { color: 'green', icon: <CheckCircleOutlined /> },
      '已取消': { color: 'red', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const getRoleText = (role) => {
    const roleMap = {
      'user': '普通用户',
      'admin': '管理员',
      'repairman': '维修员',
      'customer_service': '客服'
    };
    return roleMap[role] || role;
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => ['待处理', '处理中'].includes(o.status)).length,
    completed: orders.filter(o => o.status === '已完成').length,
    cancelled: orders.filter(o => o.status === '已取消').length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Row gutter={[24, 24]}>
        {/* 用户信息卡片 */}
        <Col span={24}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Row align="middle" gutter={24}>
              <Col>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '3px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
              </Col>
              <Col flex={1}>
                <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
                  {user?.name || '未设置姓名'}
                </Title>
                <Space direction="vertical" size={4}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                    <PhoneOutlined /> {user?.phone}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {getRoleText(user?.role)}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    <CalendarOutlined /> 注册时间：{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 统计卡片 */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="总订单"
                  value={orderStats.total}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="进行中"
                  value={orderStats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={orderStats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="已取消"
                  value={orderStats.cancelled}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* 主要内容 */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="profile" size="large">
              <TabPane tab="个人信息" key="profile">
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <Card title="基本信息" extra={
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? '取消编辑' : '编辑信息'}
                      </Button>
                    }>
                      {!editMode ? (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          <div>
                            <Text strong>姓名：</Text>
                            <Text>{user?.name || '未设置'}</Text>
                          </div>
                          <div>
                            <Text strong>手机号：</Text>
                            <Text>{user?.phone}</Text>
                          </div>
                          <div>
                            <Text strong>用户名：</Text>
                            <Text>{user?.username || '未设置'}</Text>
                          </div>
                          <div>
                            <Text strong>邮箱：</Text>
                            <Text>{user?.email || '未设置'}</Text>
                          </div>
                          <div>
                            <Text strong>角色：</Text>
                            <Tag color="blue">{getRoleText(user?.role)}</Tag>
                          </div>
                        </Space>
                      ) : (
                        <Form
                          form={form}
                          layout="vertical"
                          onFinish={handleUpdateProfile}
                        >
                          <Form.Item
                            label="姓名"
                            name="name"
                            rules={[{ required: true, message: '请输入姓名' }]}
                          >
                            <Input placeholder="请输入姓名" />
                          </Form.Item>
                          <Form.Item
                            label="手机号"
                            name="phone"
                            rules={[
                              { required: true, message: '请输入手机号' },
                              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                            ]}
                          >
                            <Input placeholder="请输入手机号" />
                          </Form.Item>
                          <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[
                              { type: 'email', message: '请输入正确的邮箱格式' }
                            ]}
                          >
                            <Input placeholder="请输入邮箱" />
                          </Form.Item>
                          <Form.Item>
                            <Space>
                              <Button type="primary" htmlType="submit">
                                保存修改
                              </Button>
                              <Button onClick={() => setEditMode(false)}>
                                取消
                              </Button>
                            </Space>
                          </Form.Item>
                        </Form>
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane tab="我的订单" key="orders">
                <Spin spinning={ordersLoading}>
                  {orders.length === 0 ? (
                    <Empty
                      description="暂无订单"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button type="primary" href="/create-order">
                        立即下单
                      </Button>
                    </Empty>
                  ) : (
                    <List
                      itemLayout="vertical"
                      size="large"
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        showQuickJumper: true
                      }}
                      dataSource={orders}
                      renderItem={(order) => (
                        <List.Item
                          key={order._id}
                          actions={[
                            order.status === '待处理' && (
                              <Button 
                                danger 
                                size="small"
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                取消订单
                              </Button>
                            ),
                            order.status === '已完成' && !order.rating && (
                              <Button 
                                type="primary" 
                                size="small"
                                icon={<StarOutlined />}
                                onClick={() => setRatingModal({ visible: true, order })}
                              >
                                评价服务
                              </Button>
                            ),
                            order.rating && (
                              <div>
                                <Rate disabled defaultValue={order.rating.score} style={{ fontSize: '14px' }} />
                                <Text type="secondary" style={{ marginLeft: '8px' }}>已评价</Text>
                              </div>
                            )
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{order.deviceType} - {order.deviceModel}</Text>
                                {getStatusTag(order.status)}
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size={4}>
                                <Text>订单号：{order._id?.slice(-8) || '未知'}</Text>
                                <Text>问题描述：{order.problemDescription}</Text>
                                <Text>预约时间：{new Date(order.appointmentTime).toLocaleString()}</Text>
                                {order.assignedTo && (
                                  <Text>维修员：{order.assignedTo.name}</Text>
                                )}
                                {order.repairNotes && (
                                  <Text>维修备注：{order.repairNotes}</Text>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Spin>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 评价模态框 */}
      <Modal
        title="评价服务"
        open={ratingModal.visible}
        onCancel={() => setRatingModal({ visible: false, order: null })}
        footer={null}
        width={500}
      >
        <Form
          form={ratingForm}
          layout="vertical"
          onFinish={handleRateOrder}
        >
          <Form.Item
            label="服务评分"
            name="rating"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate allowHalf style={{ fontSize: '24px' }} />
          </Form.Item>
          
          <Form.Item
            label="评价内容"
            name="comment"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请分享您的使用体验..."
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRatingModal({ visible: false, order: null })}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交评价
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;