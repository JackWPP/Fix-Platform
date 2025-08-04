import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import CreateOrder from './pages/CreateOrder';
import Payment from './pages/Payment';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import RepairmanDashboard from './pages/RepairmanDashboard';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';
import UserProfile from './pages/UserProfile';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationCenter from './components/NotificationCenter';
import socketService from './services/socketService';
import './App.css';

const { Header, Content, Footer } = Layout;

// 内部布局组件，在Router内部使用useHistory
const AppLayout = () => {
  const history = useHistory();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // 建立WebSocket连接
        socketService.connect(token);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // 监听用户变化，管理WebSocket连接
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token && !socketService.getConnectionStatus()) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }

    // 组件卸载时断开连接
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // 登录回调
  const handleLogin = (userData) => {
    setUser(userData);
    // 登录成功后建立WebSocket连接
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    setUser(null);
    history.push('/login');
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
  }

  // 如果未登录，显示登录页面
  if (!user && location.pathname !== '/login' && location.pathname !== '/admin-login' && location.pathname !== '/admin-register') {
    return <Login onLogin={handleLogin} />;
  }

  // 如果在管理员登录页面
  if (location.pathname === '/admin-login') {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // 如果在管理员注册页面
  if (location.pathname === '/admin-register') {
    return <AdminRegister />;
  }

  // 如果在登录页面但已登录，根据角色重定向
  if (user && (location.pathname === '/login' || location.pathname === '/admin-login')) {
    switch (user.role) {
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
    return null;
  }

  // 根据用户角色显示不同的界面
  const renderDashboard = () => {
    if (!user) return <Home />;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'repairman':
        return <RepairmanDashboard />;
      case 'customer_service':
        return <CustomerServiceDashboard />;
      default:
        return <Home />;
    }
  };

  // 如果用户已登录且有特定角色，直接显示对应仪表盘
  if (user && ['admin', 'repairman', 'customer_service'].includes(user.role)) {
    return renderDashboard();
  }

  // 普通用户界面
  const getSelectedKey = () => {
    switch (location.pathname) {
      case '/':
        return ['1'];
      case '/orders':
        return ['2'];
      case '/profile':
        return ['3'];
      case '/create-order':
        return ['2'];
      default:
        return ['1'];
    }
  };

  const menuItems = [
    {
      key: '1',
      label: '首页',
      onClick: () => history.push('/')
    },
    {
      key: '2', 
      label: '我的订单',
      onClick: () => history.push('/orders')
    },
    {
      key: '3',
      label: '个人中心', 
      onClick: () => history.push('/profile')
    }
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => history.push('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginRight: '20px' }}>
            Fix-Platform
          </div>
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={getSelectedKey()} 
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NotificationCenter />
          <span style={{ color: '#fff', marginRight: '12px', marginLeft: '12px' }}>
            欢迎，{user?.name || user?.phone}
          </span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar 
              style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} 
              icon={<UserOutlined />} 
            />
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Switch>
             <Route exact path="/" component={Home} />
             <Route path="/orders" component={Orders} />
             <Route path="/profile" component={UserProfile} />
             <Route path="/create-order" component={CreateOrder} />
             <Route path="/payment/:orderId" component={Payment} />
             <Route path="/login" render={() => <Login onLogin={handleLogin} />} />
             <Route path="/admin-login" render={() => <AdminLogin onLogin={handleLogin} />} />
             <Route path="/admin-register" component={AdminRegister} />
           </Switch>
        </div>
      </Content>
      
      <Layout.Footer style={{ textAlign: 'center' }}>
        Fix-Platform ©2025 Created for XGX
      </Layout.Footer>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </Router>
  );
}

export default App;
