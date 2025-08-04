import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminRegister = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // 管理员注册
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.adminRegister(values);
      if (response.success) {
        message.success('管理员账号创建成功');
        history.push('/admin-login');
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (error) {
      message.error(error.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            管理员注册
          </Title>
          <Text type="secondary">创建新的管理员账号</Text>
        </div>
        
        <Form
          form={form}
          name="admin-register"
          onFinish={handleRegister}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="请输入手机号" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { type: 'email', message: '请输入正确的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱（可选）" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '请输入姓名' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入姓名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[
              { required: true, message: '请选择角色' }
            ]}
          >
            <Select placeholder="请选择角色" size="large">
              <Option value="admin">管理员</Option>
              <Option value="customer_service">客服</Option>
              <Option value="repairman">维修员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请再次输入密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              创建账号
            </Button>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="default" 
              onClick={() => history.push('/admin-login')}
              size="large"
              style={{ width: '100%' }}
            >
              返回登录
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            仅限超级管理员创建新账号
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegister;