import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">首页</Menu.Item>
            <Menu.Item key="2">我的订单</Menu.Item>
            <Menu.Item key="3">个人中心</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Fix-Platform ©2023 Created for XGX</Footer>
      </Layout>
    </Router>
  );
}

export default App;
