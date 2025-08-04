import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  Input, 
  message, 
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Tabs,
  Descriptions,
  DatePicker,
  Switch
} from 'antd';
import { orderAPI, userAPI } from '../services/api';
import { 
  DashboardOutlined, 
  UserOutlined, 
  ToolOutlined, 
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import NotificationCenter from '../components/NotificationCenter';
import DashboardStats from '../components/charts/DashboardStats';
import ConfigManagement from '../components/ConfigManagement';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [repairmen, setRepairmen] = useState([]);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRepairmen: 0
  });

  // 获取所有订单
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      if (response.success) {
        const ordersWithKey = response.orders.map(order => ({
          ...order,
          key: order._id || order.id || Math.random().toString(36).substr(2, 9)
        }));
        setOrders(ordersWithKey);
        
        // 计算统计数据
        const totalOrders = ordersWithKey.length;
        const pendingOrders = ordersWithKey.filter(o => o.status === 'pending').length;
        setStats(prev => ({ ...prev, totalOrders, pendingOrders }));
      } else {
        message.error(response.message || '获取订单失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await userAPI.getAllUsers();
      if (response.success) {
        const usersWithKey = response.users.map(user => ({
          ...user,
          key: user._id || user.id || Math.random().toString(36).substr(2, 9)
        }));
        setUsers(usersWithKey);
        
        // 筛选维修员
        const repairmenList = usersWithKey.filter(user => user.role === 'repairman');
        setRepairmen(repairmenList);
        
        // 计算统计数据
        const totalUsers = usersWithKey.length;
        const totalRepairmen = repairmenList.length;
        setStats(prev => ({ ...prev, totalUsers, totalRepairmen }));
      } else {
        message.error(response.message || '获取用户失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // 查看订单详情
  const showOrderDetail = (record) => {
    setSelectedOrder(record);
    setDetailVisible(true);
  };

  // 分配订单给维修员
  const showAssignModal = (record) => {
    setSelectedOrder(record);
    assignForm.setFieldsValue({
      repairmanId: record.assignedTo || undefined
    });
    setAssignModalVisible(true);
  };

  // 提交订单分配
  const handleAssignOrder = async (values) => {
    try {
      const response = await orderAPI.assignOrder(selectedOrder._id, values.repairmanId);
      if (response.success) {
        message.success('订单分配成功');
        setAssignModalVisible(false);
        fetchOrders();
      } else {
        message.error(response.message || '分配失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    }
  };

  // 编辑用户
  const showUserModal = (record = null) => {
    setSelectedUser(record);
    if (record) {
      userForm.setFieldsValue({
        name: record.name,
        phone: record.phone,
        email: record.email,
        role: record.role
      });
    } else {
      userForm.resetFields();
    }
    setUserModalVisible(true);
  };

  // 保存用户
  const handleSaveUser = async (values) => {
    try {
      let response;
      if (selectedUser) {
        response = await userAPI.updateUser(selectedUser._id, values);
      } else {
        response = await userAPI.createUser(values);
      }
      
      if (response.success) {
        message.success(selectedUser ? '用户更新成功' : '用户创建成功');
        setUserModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await userAPI.deleteUser(userId);
          if (response.success) {
            message.success('用户删除成功');
            fetchUsers();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('网络错误，请重试');
        }
      }
    });
  };

  // 状态标签颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // 状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in_progress': return '处理中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  // 角色标签颜色
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'customer_service': return 'blue';
      case 'repairman': return 'green';
      case 'user': return 'default';
      default: return 'default';
    }
  };

  // 角色文本
  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'customer_service': return '客服';
      case 'repairman': return '维修员';
      case 'user': return '普通用户';
      default: return role;
    }
  };

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.slice(-8) : 'N/A',
      width: 100
    },
    {
      title: '用户',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 100
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type) => (
        <Tag color={type === 'repair' ? 'red' : 'blue'}>
          {type === 'repair' ? '维修服务' : '预约服务'}
        </Tag>
      ),
      width: 100
    },
    {
      title: '设备信息',
      key: 'device',
      render: (_, record) => (
        <div>
          <div>{record.deviceType}</div>
          {record.deviceModel && <Text type="secondary">{record.deviceModel}</Text>}
        </div>
      ),
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100
    },
    {
      title: '分配给',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) => {
        const repairman = repairmen.find(r => r._id === assignedTo);
        return repairman ? repairman.name || repairman.phone : '未分配';
      },
      width: 100
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<UserOutlined />}
            onClick={() => showAssignModal(record)}
          >
            分配
          </Button>
        </Space>
      ),
      width: 120
    }
  ];

  const userColumns = [
    {
      title: '用户ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.slice(-8) : 'N/A',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '未设置'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '未设置'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'N/A'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => showUserModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(record._id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            <DashboardOutlined /> 管理员后台
          </Title>
          <Space>
            <NotificationCenter />
            <Button type="primary" onClick={fetchOrders} loading={loading}>
              刷新数据
            </Button>
          </Space>
        </div>
      </Header>
      
      <Content style={{ margin: '24px', background: '#f0f2f5' }}>
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总订单数"
                value={stats.totalOrders}
                prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待处理订单"
                value={stats.pendingOrders}
                prefix={<ToolOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={stats.totalUsers}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="维修员数量"
                value={stats.totalRepairmen}
                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 主要内容 */}
        <Card>
          <Tabs defaultActiveKey="orders">
            <TabPane tab="数据统计" key="stats">
              <DashboardStats />
            </TabPane>
            
            <TabPane tab="订单管理" key="orders">
              <Table
                columns={orderColumns}
                dataSource={orders}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                scroll={{ x: 1200 }}
              />
            </TabPane>
            
            <TabPane tab="用户管理" key="users">
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showUserModal()}
                >
                  新增用户
                </Button>
              </div>
              <Table
                columns={userColumns}
                dataSource={users}
                loading={userLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
              />
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  系统配置
                </span>
              } 
              key="config"
            >
              <ConfigManagement />
            </TabPane>
          </Tabs>
        </Card>
      </Content>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单号" span={2}>
              {selectedOrder._id ? selectedOrder._id.slice(-8) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="服务类型">
              <Tag color={selectedOrder.serviceType === 'repair' ? 'red' : 'blue'}>
                {selectedOrder.serviceType === 'repair' ? '维修服务' : '预约服务'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="设备类型">
              {selectedOrder.deviceType}
            </Descriptions.Item>
            <Descriptions.Item label="设备型号">
              {selectedOrder.deviceModel || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {selectedOrder.contactName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>
              {selectedOrder.problemDescription || selectedOrder.issueDescription || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间" span={2}>
              {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 分配订单模态框 */}
      <Modal
        title="分配订单"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => assignForm.submit()}
        okText="分配"
        cancelText="取消"
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignOrder}
        >
          <Form.Item
            label="选择维修员"
            name="repairmanId"
            rules={[{ required: true, message: '请选择维修员' }]}
          >
            <Select placeholder="请选择维修员">
              {repairmen.map(repairman => (
                <Option key={repairman._id} value={repairman._id}>
                  {repairman.name || repairman.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户编辑模态框 */}
      <Modal
        title={selectedUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onOk={() => userForm.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Form.Item
            label="姓名"
            name="name"
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
            <Input placeholder="请输入手机号" disabled={!!selectedUser} />
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
          
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="user">普通用户</Option>
              <Option value="repairman">维修员</Option>
              <Option value="customer_service">客服</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;