import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Input, Select, Modal, Form, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userAPI, handleAPIError } from '../../utils/api';
import { message } from '../../utils/message';
import { useAuthStore } from '../../store';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    is_active: '',
  });

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers({
        role: filters.role || undefined,
        search: filters.search || undefined,
        is_active: filters.is_active || undefined,
      });
      
      if (response.data?.success) {
        setUsers(response.data.data.users || []);
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // 角色标签颜色
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'red',
      'customer_service': 'blue',
      'repairman': 'green',
      'user': 'default',
    };
    return colors[role] || 'default';
  };

  // 角色名称
  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      'admin': '管理员',
      'customer_service': '客服',
      'repairman': '维修员',
      'user': '用户',
    };
    return names[role] || role;
  };

  // 创建用户
  const handleCreateUser = async (values: any) => {
    try {
      const response = await userAPI.createUser(values);
      
      if (response.data?.success) {
        message.success('用户创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchUsers();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 编辑用户
  const handleEditUser = async (values: any) => {
    if (!selectedUser) return;
    
    try {
      const response = await userAPI.updateUser(selectedUser.id, values);
      
      if (response.data?.success) {
        message.success('用户信息更新成功');
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 重置密码
  const handleResetPassword = async (values: { password: string }) => {
    if (!selectedUser) return;
    
    try {
      const response = await userAPI.resetPassword(selectedUser.id, values.password);
      
      if (response.data?.success) {
        message.success('密码重置成功');
        setResetPasswordModalVisible(false);
        resetPasswordForm.resetFields();
        setSelectedUser(null);
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await userAPI.deleteUser(userId);
      
      if (response.data?.success) {
        message.success('用户删除成功');
        fetchUsers();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 打开编辑弹窗
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    });
    setEditModalVisible(true);
  };

  // 打开重置密码弹窗
  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPasswordModalVisible(true);
  };

  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
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
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{getRoleName(role)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => openResetPasswordModal(record)}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space wrap>
            <Search
              placeholder="搜索用户"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
            <Select
              placeholder="选择角色"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, role: value || '' })}
            >
              <Option value="admin">管理员</Option>
              <Option value="customer_service">客服</Option>
              <Option value="repairman">维修员</Option>
              <Option value="user">用户</Option>
            </Select>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, is_active: value || '' })}
            >
              <Option value="true">启用</Option>
              <Option value="false">禁用</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 创建用户弹窗 */}
      <Modal
        title="新建用户"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="customer_service">客服</Option>
              <Option value="repairman">维修员</Option>
              <Option value="user">用户</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="password"
            label="初始密码"
            rules={[{ required: true, message: '请输入初始密码' }]}
          >
            <Input.Password placeholder="请输入初始密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户弹窗 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditUser}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="customer_service">客服</Option>
              <Option value="repairman">维修员</Option>
              <Option value="user">用户</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="is_active"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        onOk={() => resetPasswordForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;