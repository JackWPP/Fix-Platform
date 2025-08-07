import React, { useState } from 'react';
import { Form, Input, Button, Tabs, Typography, App } from 'antd';
import { PhoneOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../../store';
import { authAPI, handleAPIError } from '../../utils/api';

const { Text } = Typography;
const { TabPane } = Tabs;

const Login: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('sms');
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { setLoading } = useAppStore();

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
        navigate('/dashboard');
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
        navigate('/dashboard');
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

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className="mb-6"
      >
        <TabPane tab="短信登录" key="sms">
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
        </TabPane>

        <TabPane tab="密码登录" key="password">
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
        </TabPane>
      </Tabs>

      <div className="text-center mt-6">
        <Text className="text-gray-500 text-sm">
          首次使用请选择短信登录，系统将自动为您创建账户
        </Text>
      </div>
    </div>
  );
};

export default Login;