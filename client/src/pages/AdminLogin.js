import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminLogin = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // 管理员登录
  const handleAdminLogin = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values.identifier, values.password);
      if (response.success) {
        const user = response.user;
        
        // 验证用户角色是否为管理员或客服
        if (!['admin', 'customer_service'].includes(user.role)) {
          message.error('您没有管理员权限，请使用普通用户登录');
          return;
        }
        
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        message.success('管理员登录成功');
        
        // 调用父组件的登录回调
        if (onLogin) {
          onLogin(user);
        }
        
        // 跳转到管理员仪表盘
        if (user.role === 'admin') {
          history.push('/admin');
        } else if (user.role === 'customer_service') {
          history.push('/customer-service');
        }
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error(error.message || '登录失败');
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
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '2px solid #ff6b6b'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CrownOutlined style={{ fontSize: '48px', color: '#ff6b6b', marginBottom: 16 }} />
          <Title level={2} style={{ color: '#ff6b6b', marginBottom: 8 }}>
            管理员登录
          </Title>
          <Text type="secondary">Fix-Platform 后台管理系统</Text>
        </div>
        
        <Form
          form={form}
          name="adminLogin"
          onFinish={handleAdminLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="管理员账号"
            name="identifier"
            rules={[
              { required: true, message: '请输入管理员账号' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名或手机号" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                width: '100%', 
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              登录管理后台
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            type="link" 
            onClick={() => history.push('/admin-register')}
            style={{ color: '#ff6b6b', fontSize: '14px', marginRight: '16px' }}
          >
            注册管理员账号
          </Button>
          <Button 
            type="link" 
            onClick={() => history.push('/login')}
            style={{ color: '#666', fontSize: '14px' }}
          >
            ← 返回普通用户登录
          </Button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 16, padding: '16px', backgroundColor: '#fff2f0', borderRadius: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>注意：</strong>此页面仅供管理员和客服人员使用<br/>
            如需普通用户登录，请点击上方链接
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;