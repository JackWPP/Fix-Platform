import React from 'react';
import { Layout, Typography, Card } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Content className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.586V5L8 4z"
                />
              </svg>
            </div>
            <Title level={2} className="text-gray-800 mb-2">
              XGX维修店
            </Title>
            <Text className="text-gray-600">
              内部维修下单管理系统
            </Text>
          </div>

          {/* 登录表单卡片 */}
          <Card
            className="shadow-lg border-0"
            styles={{ body: { padding: '32px' } }}
          >
            {children}
          </Card>

          {/* 底部信息 */}
          <div className="text-center mt-8">
            <Text className="text-gray-500 text-sm">
              © 2024 XGX维修店. 保留所有权利.
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;