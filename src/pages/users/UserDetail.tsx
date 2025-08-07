import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Modal, Form, Input, Select, Spin } from 'antd';

const { Option } = Select;
import { EditOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, handleAPIError } from '../../utils/api';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  // 获取用户详情
  const fetchUserDetail = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await userAPI.getUserDetail(userId);
      
      if (response.data?.success) {
        setUser(response.data.data);
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
    fetchUserDetail();
  }, [userId]);

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

  // 编辑用户
  const handleEditUser = async (values: any) => {
    if (!user) return;
    
    try {
      const response = await userAPI.updateUser(user.id, values);
      
      if (response.data?.success) {
        message.success('用户信息更新成功');
        setEditModalVisible(false);
        editForm.resetFields();
        fetchUserDetail();
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
    if (!user) return;
    
    try {
      const response = await userAPI.resetPassword(user.id, values.password);
      
      if (response.data?.success) {
        message.success('密码重置成功');
        setResetPasswordModalVisible(false);
        resetPasswordForm.resetFields();
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
  const openEditModal = () => {
    if (!user) return;
    
    editForm.setFieldsValue({
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    });
    setEditModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>用户不存在</p>
          <Button onClick={() => navigate('/users')}>返回用户列表</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/users')}
            >
              返回
            </Button>
            <span>用户详情</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={openEditModal}
            >
              编辑
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => setResetPasswordModalVisible(true)}
            >
              重置密码
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户ID" span={2}>
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item label="姓名">
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            {user.phone}
          </Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={getRoleColor(user.role)}>
              {getRoleName(user.role)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.is_active ? 'green' : 'red'}>
              {user.is_active ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(user.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(user.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

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

export default UserDetail;