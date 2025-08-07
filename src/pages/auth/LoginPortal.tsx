import React from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import { UserOutlined, SettingOutlined, ToolOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPortal: React.FC = () => {
  const navigate = useNavigate();

  const handleUserLogin = () => {
    navigate('/login?type=user');
  };

  const handleAdminLogin = () => {
    navigate('/login?type=admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <Title level={1} className="text-gray-800 mb-4">
            XGX店内部维修下单管理系统
          </Title>
          <Text className="text-gray-600 text-lg">
            请选择您的登录类型
          </Text>
        </div>

        {/* 登录选项 */}
        <Row gutter={[32, 32]} justify="center">
          {/* 用户登录 */}
          <Col xs={24} sm={12} lg={10}>
            <Card
              hoverable
              className="text-center h-full shadow-lg border-0 transition-all duration-300 hover:shadow-xl"
              onClick={handleUserLogin}
            >
              <div className="py-8">
                <div className="mb-6">
                  <UserOutlined className="text-6xl text-blue-500" />
                </div>
                <Title level={3} className="text-gray-800 mb-4">
                  用户登录
                </Title>
                <Text className="text-gray-600 text-base block mb-6">
                  普通用户登录，提交维修订单
                </Text>
                <Button 
                  type="primary" 
                  size="large" 
                  className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
                >
                  进入用户端
                </Button>
              </div>
            </Card>
          </Col>

          {/* 管理登录 */}
          <Col xs={24} sm={12} lg={10}>
            <Card
              hoverable
              className="text-center h-full shadow-lg border-0 transition-all duration-300 hover:shadow-xl"
              onClick={handleAdminLogin}
            >
              <div className="py-8">
                <div className="mb-6">
                  <SettingOutlined className="text-6xl text-purple-500" />
                </div>
                <Title level={3} className="text-gray-800 mb-4">
                  管理登录
                </Title>
                <Text className="text-gray-600 text-base block mb-2">
                  管理员、维修员、客服登录
                </Text>
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <SettingOutlined className="mr-1" />
                    <span>管理员</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ToolOutlined className="mr-1" />
                    <span>维修员</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CustomerServiceOutlined className="mr-1" />
                    <span>客服</span>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="large" 
                  className="w-full bg-purple-500 hover:bg-purple-600 border-purple-500 hover:border-purple-600"
                >
                  进入管理端
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 底部说明 */}
        <div className="text-center mt-12">
          <Text className="text-gray-500">
            首次使用请选择短信登录，系统将自动为您创建账户
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;