import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import {
  MenuOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Space,
  Typography,
  Drawer,
} from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 根据用户角色生成菜单项
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">工作台</Link>,
      },
      {
        key: '/orders',
        icon: <FileTextOutlined />,
        label: '订单管理',
        children: [
          {
            key: '/orders/list',
            label: <Link to="/orders">订单列表</Link>,
          },
          ...(user?.role === 'user' || user?.role === 'customer_service' || user?.role === 'admin'
            ? [
                {
                  key: '/orders/create',
                  label: <Link to="/orders/create">创建订单</Link>,
                },
              ]
            : []),
        ],
      },
    ];

    // 管理员可以看到用户管理
    if (user?.role === 'admin') {
      baseItems.push({
        key: '/users',
        icon: <UserOutlined />,
        label: <Link to="/users">用户管理</Link>,
      });
    }

    baseItems.push({
      key: '/profile',
      icon: <SettingOutlined />,
      label: <Link to="/profile">个人设置</Link>,
    });

    return baseItems;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getRoleText = (role: string) => {
    const roleMap = {
      user: '用户',
      repairman: '维修员',
      customer_service: '客服',
      admin: '管理员',
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const siderContent = (
    <>
      <div className="flex items-center justify-center h-16 bg-blue-600">
        <Text className="text-white text-lg font-bold">XGX维修店</Text>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname === '/orders' ? '/orders/list' : location.pathname]}
        defaultOpenKeys={['/orders']}
        items={getMenuItems()}
        className="border-r-0"
      />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {/* 桌面端侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="hidden lg:block"
        width={240}
      >
        {siderContent}
      </Sider>

      {/* 移动端抽屉 */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ body: { padding: 0 } }}
        width={240}
        className="lg:hidden"
      >
        <div className="bg-gray-800 text-white h-full">
          {siderContent}
        </div>
      </Drawer>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* 移动端菜单按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden mr-4"
            />
            
            {/* 桌面端折叠按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:inline-flex"
            />
            
            {/* 快捷操作按钮 */}
            {(user?.role === 'user' || user?.role === 'customer_service' || user?.role === 'admin') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/orders/create')}
                className="ml-4"
              >
                <span className="hidden sm:inline">创建订单</span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* 通知铃铛 */}
            <Badge count={0} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            {/* 用户信息 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                <Avatar size="small" className="bg-blue-500">
                  {user?.name?.charAt(0) || user?.phone?.slice(-2)}
                </Avatar>
                <div className="ml-2 hidden sm:block">
                  <div className="text-sm font-medium">{user?.name || '未设置姓名'}</div>
                  <div className="text-xs text-gray-500">{getRoleText(user?.role || '')}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="m-4 p-6 bg-white rounded-lg shadow-sm min-h-[calc(100vh-112px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;