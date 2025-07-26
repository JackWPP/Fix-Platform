import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import CreateOrder from './pages/CreateOrder';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const history = useHistory();

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
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={menuItems} />
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
    </Router>
  );
}

export default App;
