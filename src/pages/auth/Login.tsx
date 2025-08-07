import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, Typography, Card } from 'antd';
import { PhoneOutlined, LockOutlined, SafetyOutlined, UserOutlined, SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../../store';
import { authAPI, handleAPIError } from '../../utils/api';
import { message } from '../../utils/message';

const { Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('sms');
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { setLoading } = useAppStore();

  const loginType = searchParams.get('type') || 'user'; // 'user' 或 'admin'
  const isAdminLogin = loginType === 'admin';

  useEffect(() => {
    // 管理端默认使用密码登录
    if (isAdminLogin) {
      setActiveTab('password');
    }
  }, [isAdminLogin]);

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.error('请输入手机号');
        return;
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        message.error('请输入有效的手机号码');
        return;
      }

      setSendingCode(true);
      const response = await authAPI.sendCode(phone);
      
      if (response.data.success) {
        message.success('验证码已发送，请注意查收');
        
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
        message.error(response.data.message || '验证码发送失败');
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setSendingCode(false);
    }
  };

  // 短信验证码登录
  const handleSMSLogin = async (values: any) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values.phone, values.code, values.name);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);
        message.success('登录成功');
        
        // 根据用户角色和登录类型导航
        if (isAdminLogin) {
          // 管理端根据角色跳转
          switch (user.role) {
            case 'admin':
              navigate('/dashboard');
              break;
            case 'repairman':
              navigate('/dashboard');
              break;
            case 'customer_service':
              navigate('/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          // 用户端
          navigate('/dashboard');
        }
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // 密码登录
  const handlePasswordLogin = async (values: any) => {
    try {
      setLoading(true);
      const response = await authAPI.passwordLogin(values.phone, values.password);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);
        message.success('登录成功');
        
        // 根据用户角色和登录类型导航
        if (isAdminLogin) {
          // 管理端根据角色跳转
          switch (user.role) {
            case 'admin':
              navigate('/dashboard');
              break;
            case 'repairman':
              navigate('/dashboard');
              break;
            case 'customer_service':
              navigate('/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          // 用户端
          navigate('/dashboard');
        }
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          {/* 页面头部 */}
          <div className="text-center mb-6">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              className="absolute left-4 top-4"
            >
              返回
            </Button>
            
            <div className="mb-4">
              {isAdminLogin ? (
                <SettingOutlined className="text-4xl text-purple-500" />
              ) : (
                <UserOutlined className="text-4xl text-blue-500" />
              )}
            </div>
            
            <Typography.Title level={3} className="mb-2">
              {isAdminLogin ? '管理端登录' : '用户登录'}
            </Typography.Title>
            
            <Typography.Text className="text-gray-600">
              {isAdminLogin ? '管理员、维修员、客服登录' : '普通用户登录'}
            </Typography.Text>
          </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className="mb-6"
        items={[
          {
            key: 'sms',
            label: '短信登录',
            children: (
          <Form
            form={form}
            name="sms-login"
            onFinish={handleSMSLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="请输入手机号"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              name="code"
              label="验证码"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为6位数字' },
              ]}
            >
              <div className="flex space-x-2">
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sendingCode}
                  loading={sendingCode}
                  className="w-24"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="name"
              label="姓名（可选）"
            >
              <Input placeholder="首次登录请输入姓名" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
            )
          },
          {
            key: 'password',
            label: '密码登录',
            children: (
          <Form
            form={passwordForm}
            name="password-login"
            onFinish={handlePasswordLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="请输入手机号"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
            )
          }
        ]}
      />

          <div className="text-center mt-6">
            <Text className="text-gray-500 text-sm">
              {isAdminLogin ? '请使用密码登录或短信验证码登录' : '首次使用请选择短信登录，系统将自动为您创建账户'}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;