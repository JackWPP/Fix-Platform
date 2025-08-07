import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, App } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useOrderStore } from '../store';
import { orderAPI, userAPI, handleAPIError } from '../utils/api';
import RepairmanDashboard from './repairman/RepairmanDashboard';
import CustomerServiceDashboard from './customer-service/CustomerServiceDashboard';
import AdminDashboard from './admin/AdminDashboard';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, setOrders } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    myOrders: 0,
  });

  // 根据用户角色显示不同的界面
  if (user?.role === 'customer_service') {
    return <CustomerServiceDashboard />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'repairman') {
    return <RepairmanDashboard />;
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // 获取订单列表
      const ordersResponse = await orderAPI.getOrders({ limit: 10 });
      if (ordersResponse.data.success) {
        const ordersList = ordersResponse.data.data.orders;
        setOrders(ordersList);
        
        // 计算统计数据
        const totalOrders = ordersList.length;
        const pendingOrders = ordersList.filter((order: any) => 
          ['pending', 'assigned'].includes(order.status)
        ).length;
        const completedOrders = ordersList.filter((order: any) => 
          order.status === 'completed'
        ).length;
        
        let myOrders = 0;
        if (user?.role === 'user') {
          myOrders = ordersList.filter((order: any) => order.user_id === user.id).length;
        } else if (user?.role === 'repairman') {
          myOrders = ordersList.filter((order: any) => order.assigned_to === user.id).length;
        }
        
        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          myOrders,
        });
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  // 表格列配置
  const columns = [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
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

  // 根据用户角色显示不同的欢迎信息
  const getWelcomeMessage = () => {
    const roleMessages = {
      user: '欢迎使用维修服务系统',
      repairman: '今天有新的维修任务等待处理',
      customer_service: '客服工作台，处理用户咨询和订单',
      admin: '管理员控制台，系统运营概览',
    };
    return roleMessages[user?.role as keyof typeof roleMessages] || '欢迎使用系统';
  };

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <Title level={2} className="text-white mb-2">
          你好，{user?.name || '用户'}！
        </Title>
        <Text className="text-blue-100 text-lg">
          {getWelcomeMessage()}
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={user?.role === 'user' ? '我的订单' : user?.role === 'repairman' ? '分配给我' : '系统用户'}
              value={stats.myOrders}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      {(user?.role === 'user' || user?.role === 'customer_service' || user?.role === 'admin') && (
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
            {user?.role === 'user' && (
              <Button onClick={() => navigate('/users')}>用户管理</Button>
            )}
          </Space>
        </Card>
      )}

      {/* 最近订单 */}
      <Card
        title="最近订单"
        extra={
          <Button type="link" onClick={() => navigate('/orders')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={orders.slice(0, 5)}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;