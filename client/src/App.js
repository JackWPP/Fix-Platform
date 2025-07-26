import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import CreateOrder from './pages/CreateOrder';
import './App.css';

const { Header, Content, Footer } = Layout;

// 内部布局组件，在Router内部使用useHistory
const AppLayout = () => {
  const history = useHistory();
  const location = useLocation();

  // 根据当前路径设置选中的菜单项
  const getSelectedKey = () => {
    switch (location.pathname) {
      case '/':
        return ['1'];
      case '/orders':
        return ['2'];
      case '/profile':
        return ['3'];
      case '/create-order':
        return ['2']; // 创建订单页面也属于订单相关
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

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu 
          theme="dark" 
          mode="horizontal" 
          selectedKeys={getSelectedKey()} 
          items={menuItems} 
        />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/orders" component={Orders} />
            <Route path="/profile" component={Profile} />
            <Route path="/create-order" component={CreateOrder} />
          </Switch>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Fix-Platform ©2025 Created for XGX</Footer>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
