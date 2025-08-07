import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Tabs, Progress, List, Avatar } from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  TrophyOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useOrderStore } from '../../store';
import { orderAPI, userAPI, handleAPIError } from '../../utils/api';
import { App } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, setOrders } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    completionRate: 0,
    repairmenCount: 0,
    customerServiceCount: 0,
    todayOrders: 0,
    monthlyOrders: 0,
  });
  const [topRepairmen, setTopRepairmen] = useState<any[]>([]);

  // 获取管理员数据
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 获取所有订单
      const ordersResponse = await orderAPI.getOrders({ limit: 1000 });
      if (ordersResponse.data.success) {
        const ordersList = ordersResponse.data.data.orders;
        setOrders(ordersList);
        
        // 计算订单统计
        const totalOrders = ordersList.length;
        const completedOrders = ordersList.filter((order: any) => order.status === 'completed').length;
        const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
        
        // 今日订单
        const today = new Date().toDateString();
        const todayOrders = ordersList.filter((order: any) => 
          new Date(order.created_at).toDateString() === today
        ).length;
        
        // 本月订单
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyOrders = ordersList.filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        }).length;
        
        // 计算总收入（假设每个完成的订单收入100元）
        const totalRevenue = completedOrders * 100;
        
        setStats(prev => ({
          ...prev,
          totalOrders,
          completionRate,
          totalRevenue,
          todayOrders,
          monthlyOrders,
        }));
      }
      
      // 获取所有用户
      const usersResponse = await userAPI.getUsers({ limit: 1000 });
      if (usersResponse.data.success) {
        const usersList = usersResponse.data.data.users;
        setUsers(usersList);
        
        const totalUsers = usersList.length;
        const repairmenCount = usersList.filter((u: any) => u.role === 'repairman').length;
        const customerServiceCount = usersList.filter((u: any) => u.role === 'customer_service').length;
        
        // 计算维修员绩效
        const repairmen = usersList.filter((u: any) => u.role === 'repairman');
        const repairmenStats = repairmen.map((repairman: any) => {
          const assignedOrders = orders.filter((order: any) => order.assigned_to === repairman.id);
          const completedOrders = assignedOrders.filter((order: any) => order.status === 'completed');
          return {
            ...repairman,
            assignedCount: assignedOrders.length,
            completedCount: completedOrders.length,
            completionRate: assignedOrders.length > 0 ? Math.round((completedOrders.length / assignedOrders.length) * 100) : 0,
          };
        }).sort((a, b) => b.completedCount - a.completedCount).slice(0, 5);
        
        setTopRepairmen(repairmenStats);
        
        setStats(prev => ({
          ...prev,
          totalUsers,
          repairmenCount,
          customerServiceCount,
        }));
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
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

  // 获取角色标签
  const getRoleTag = (role: string) => {
    const roleMap = {
      user: { color: 'blue', text: '用户' },
      repairman: { color: 'green', text: '维修员' },
      customer_service: { color: 'orange', text: '客服' },
      admin: { color: 'red', text: '管理员' },
    };
    const config = roleMap[role as keyof typeof roleMap] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 最近订单表格列
  const recentOrdersColumns = [
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
  ];

  // 用户管理表格列
  const usersColumns = [
    {
      title: '用户姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar size="small" className="bg-blue-500">
            {name?.charAt(0) || record.phone?.slice(-2)}
          </Avatar>
          {name || '未设置'}
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role),
    },
    {
      title: '注册时间',
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
          onClick={() => navigate(`/users/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 管理员欢迎信息 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-lg">
        <Title level={2} className="text-white mb-2">
          管理员控制台
        </Title>
        <Text className="text-red-100 text-lg">
          你好，{user?.name}！系统运行正常，今日新增 {stats.todayOrders} 个订单，本月共 {stats.monthlyOrders} 个订单。
        </Text>
      </div>

      {/* 核心统计卡片 */}
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
              title="系统用户"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="完成率"
              value={stats.completionRate}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 团队统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="维修员"
              value={stats.repairmenCount}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="客服人员"
              value={stats.customerServiceCount}
              prefix={<CustomerServiceOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.todayOrders}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="管理操作">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/orders/create')}
          >
            创建订单
          </Button>
          <Button
            icon={<UserOutlined />}
            onClick={() => navigate('/users')}
          >
            用户管理
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/orders')}
          >
            订单管理
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
          >
            系统设置
          </Button>
        </Space>
      </Card>

      {/* 数据概览和绩效 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="orders">
              <TabPane tab="最近订单" key="orders">
                <Table
                  columns={recentOrdersColumns}
                  dataSource={orders.slice(0, 10)}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 800 }}
                />
              </TabPane>
              <TabPane tab="用户管理" key="users">
                <Table
                  columns={usersColumns}
                  dataSource={users.slice(0, 10)}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 600 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="维修员绩效排行" className="h-full">
            <List
              dataSource={topRepairmen}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar className="bg-blue-500">
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name || '未设置姓名'}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{item.phone}</Text>
                        <div>
                          <Text>完成: {item.completedCount}/{item.assignedCount}</Text>
                          <Progress
                            percent={item.completionRate}
                            size="small"
                            className="mt-1"
                          />
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;