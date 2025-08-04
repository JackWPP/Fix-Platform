import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Typography, Tabs } from 'antd';
import { UserOutlined, MobileOutlined, LockOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState('password');
  const [authConfig, setAuthConfig] = useState({ smsEnabled: false, environment: 'development' });
  const [configLoading, setConfigLoading] = useState(true);
  const history = useHistory();

  // 获取认证配置
  useEffect(() => {
    const fetchAuthConfig = async () => {
      try {
        const response = await authAPI.getAuthConfig();
        if (response.success) {
          setAuthConfig(response.config);
        }
      } catch (error) {
        console.error('获取认证配置失败:', error);
        // 使用默认配置
        setAuthConfig({ smsEnabled: false, environment: 'development' });
      } finally {
        setConfigLoading(false);
      }
    };

    fetchAuthConfig();
  }, []);

  // 发送验证码
  const sendCode = async (formType = 'code') => {
    if (!authConfig.smsEnabled) {
      message.info('验证码功能已禁用，请使用密码登录');
      return;
    }

    try {
      const currentForm = formType === 'register' ? registerForm : codeForm;
      const phone = currentForm.getFieldValue('phone');
      if (!phone) {
        message.error('请先输入手机号');
        return;
      }

      setCodeLoading(true);
      const response = await authAPI.sendCode(phone);
      if (response.success) {
        message.success(response.message || '验证码已发送');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        message.error(response.message || '发送验证码失败');
      }
    } catch (error) {
      message.error(error.message || '发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  // 密码登录
  const handlePasswordLogin = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values.identifier, values.password);
      if (response.success) {
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        message.success('登录成功');
        
        // 调用父组件的登录回调
        if (onLogin) {
          onLogin(response.user);
        }
        
        // 根据用户角色跳转到不同页面
        switch (response.user.role) {
          case 'admin':
          case 'customer_service':
            history.push('/admin');
            break;
          case 'repairman':
            history.push('/repairman');
            break;
          default:
            history.push('/');
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

  // 验证码登录
  const handleCodeLogin = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.loginWithCode(values.phone, values.code);
      if (response.success) {
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        message.success('登录成功');
        
        // 调用父组件的登录回调
        if (onLogin) {
          onLogin(response.user);
        }
        
        // 根据用户角色跳转到不同页面
        switch (response.user.role) {
          case 'admin':
          case 'customer_service':
            history.push('/admin');
            break;
          case 'repairman':
            history.push('/repairman');
            break;
          default:
            history.push('/');
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

  // 注册
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      
      // 如果未启用短信验证码，移除验证码字段
      const registerData = { ...values };
      if (!authConfig.smsEnabled) {
        delete registerData.code;
      }
      
      const response = await authAPI.register(registerData);
      if (response.success) {
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        message.success('注册成功');
        
        // 调用父组件的登录回调
        if (onLogin) {
          onLogin(response.user);
        }
        
        // 新注册用户默认跳转到首页
        history.push('/');
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据配置动态生成标签页
  const getTabItems = () => {
    const items = [
      {
        key: 'password',
        label: '密码登录',
        children: (
          <Form
            form={loginForm}
            name="passwordLogin"
            onFinish={handlePasswordLogin}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="用户名/手机号"
              name="identifier"
              rules={[
                { required: true, message: '请输入用户名或手机号' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户名或手机号" 
                size="large"
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
                登录
              </Button>
            </Form.Item>
          </Form>
        )
      }
    ];

    // 只有启用短信验证码时才显示验证码登录
    if (authConfig.smsEnabled) {
      items.push({
        key: 'code',
        label: '验证码登录',
        children: (
          <Form
            form={codeForm}
            name="codeLogin"
            onFinish={handleCodeLogin}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input 
                prefix={<MobileOutlined />} 
                placeholder="请输入手机号" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="验证码"
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入验证码" 
                  size="large"
                  style={{ flex: 1 }}
                />
                <Button 
                  size="large"
                  onClick={() => sendCode('code')}
                  loading={codeLoading}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </Space.Compact>
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        )
      });
    }

    // 注册表单
    items.push({
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名（可选）"
            name="username"
            rules={[
              { min: 3, message: '用户名至少3位' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名（可选）" 
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
              prefix={<MobileOutlined />} 
              placeholder="请输入手机号" 
              size="large"
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

          <Form.Item
            label="姓名（可选）"
            name="name"
          >
            <Input 
              placeholder="请输入姓名" 
              size="large"
            />
          </Form.Item>

          {/* 只有启用短信验证码时才显示验证码字段 */}
          {authConfig.smsEnabled && (
            <Form.Item
              label="验证码"
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入验证码" 
                  size="large"
                  style={{ flex: 1 }}
                />
                <Button 
                  size="large"
                  onClick={() => sendCode('register')}
                  loading={codeLoading}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </Space.Compact>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      )
    });

    return items;
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
            Fix-Platform
          </Title>
          <Text type="secondary">维修管理平台</Text>
        </div>
        
        {configLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Typography.Text type="secondary">加载中...</Typography.Text>
          </div>
        ) : (
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={getTabItems()}
            centered
          />
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            登录即表示同意用户协议和隐私政策
          </Text>
          {authConfig.environment === 'development' && !authConfig.smsEnabled && (
            <div style={{ marginTop: 8 }}>
              <Text type="warning" style={{ fontSize: '11px' }}>
                开发模式：短信验证码功能已禁用
              </Text>
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button 
            type="link" 
            onClick={() => history.push('/admin-login')}
            style={{ fontSize: '12px' }}
          >
            管理员登录
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;