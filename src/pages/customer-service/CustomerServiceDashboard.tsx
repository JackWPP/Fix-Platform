import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Modal, Form, Select, Input, Tabs } from 'antd';
import {
  CustomerServiceOutlined,
  PhoneOutlined,
  MessageOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useOrderStore } from '../../store';
import { orderAPI, userAPI, handleAPIError } from '../../utils/api';
import { App } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const CustomerServiceDashboard: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, setOrders } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [repairmen, setRepairmen] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    unassignedOrders: 0,
  });

  // 获取客服相关数据
  const fetchCustomerServiceData = async () => {
    try {
      setLoading(true);
      
      // 获取所有订单
      const ordersResponse = await orderAPI.getOrders({ limit: 100 });
      if (ordersResponse.data.success) {
        const ordersList = ordersResponse.data.data.orders;
        setOrders(ordersList);
        
        // 计算统计数据
        const totalOrders = ordersList.length;
        const pendingOrders = ordersList.filter((order: any) => 
          ['pending', 'assigned'].includes(order.status)
        ).length;
        const unassignedOrders = ordersList.filter((order: any) => 
          order.status === 'pending'
        ).length;
        
        // 今日订单
        const today = new Date().toDateString();
        const todayOrders = ordersList.filter((order: any) => 
          new Date(order.created_at).toDateString() === today
        ).length;
        
        setStats({
          totalOrders,
          pendingOrders,
          todayOrders,
          unassignedOrders,
        });
      }
      
      // 获取维修员列表
      const repairmenResponse = await userAPI.getUsers({ role: 'repairman' });
      if (repairmenResponse.data.success) {
        setRepairmen(repairmenResponse.data.data.users);
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerServiceData();
  }, []);

  // 打开分配订单模态框
  const openAssignModal = (order: any) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      assigned_to: order.assigned_to || '',
      priority: order.priority || 'medium',
    });
    setAssignModalVisible(true);
  };

  // 分配订单给维修员
  const handleAssignOrder = async (values: any) => {
    try {
      const response = await orderAPI.assignOrder(selectedOrder.id, values.assigned_to);
      if (response.data.success) {
        message.success('订单分配成功');
        setAssignModalVisible(false);
        form.resetFields();
        fetchCustomerServiceData();
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', text: '待处理' },
      assigned: { color: 'blue', text: '已分配' },
      in_progress: { color: 'cyan', text: '处理中' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取优先级标签
  const getPriorityTag = (priority: string) => {
    const priorityMap = {
      low: { color: 'green', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
      urgent: { color: 'magenta', text: '紧急' },
    };
    const config = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 待处理订单表格列
  const pendingColumns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => navigate(`/orders/${id}`)}>
          {id.slice(0, 8)}...
        </Button>
      ),
    },
    {
      title: '设备类型',
      dataIndex: ['device_types', 'name'],
      key: 'device_type',
    },
    {
      title: '服务类型',
      dataIndex: ['service_types', 'name'],
      key: 'service_type',
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '分配给',
      dataIndex: ['assigned_user', 'name'],
      key: 'assigned_to',
      render: (name: string) => name || <Text type="secondary">未分配</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openAssignModal(record)}
          >
            分配
          </Button>
        </Space>
      ),
    },
  ];

  // 所有订单表格列
  const allOrdersColumns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => navigate(`/orders/${id}`)}>
          {id.slice(0, 8)}...
        </Button>
      ),
    },
    {
      title: '设备类型',
      dataIndex: ['device_types', 'name'],
      key: 'device_type',
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '分配给',
      dataIndex: ['assigned_user', 'name'],
      key: 'assigned_to',
      render: (name: string) => name || <Text type="secondary">未分配</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 客服欢迎信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
        <Title level={2} className="text-white mb-2">
          客服工作台
        </Title>
        <Text className="text-purple-100 text-lg">
          你好，{user?.name}！今天有 {stats.todayOrders} 个新订单，{stats.unassignedOrders} 个订单待分配。
        </Text>
      </div>

      {/* 客服统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<CustomerServiceOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={stats.pendingOrders}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新订单"
              value={stats.todayOrders}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="未分配订单"
              value={stats.unassignedOrders}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="快捷操作">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/orders/create')}
          >
            创建订单
          </Button>
          <Button onClick={() => navigate('/orders')}>查看所有订单</Button>
          <Button onClick={() => navigate('/users')}>用户管理</Button>
        </Space>
      </Card>

      {/* 订单管理标签页 */}
      <Card>
        <Tabs defaultActiveKey="pending">
          <TabPane tab={`待处理订单 (${stats.pendingOrders})`} key="pending">
            <Table
              columns={pendingColumns}
              dataSource={orders.filter(order => ['pending', 'assigned'].includes(order.status))}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="所有订单" key="all">
            <Table
              columns={allOrdersColumns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 分配订单模态框 */}
      <Modal
        title="分配订单"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignOrder}
        >
          <Form.Item
            name="assigned_to"
            label="分配给维修员"
            rules={[{ required: true, message: '请选择维修员' }]}
          >
            <Select placeholder="请选择维修员">
              {repairmen.map(repairman => (
                <Option key={repairman.id} value={repairman.id}>
                  {repairman.name} - {repairman.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认分配
              </Button>
              <Button onClick={() => {
                setAssignModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerServiceDashboard;