import React from 'react';
import { Button, Card, Col, Row, Typography, message } from 'antd';
import { useHistory } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const history = useHistory();

  const handleQuickOrder = () => {
    history.push('/create-order');
  };

  const handleViewOrders = () => {
    message.info('跳转到订单页面');
    history.push('/orders');
  };

  const handleEvaluate = () => {
    message.info('跳转到评价页面');
    // 这里可以添加跳转到评价页面的逻辑
    // history.push('/evaluate');
  };

  return (
    <div>
      <Title level={2}>欢迎使用XGX维修平台</Title>
      <Paragraph>在这里您可以方便地下维修订单，查看订单状态和历史记录。</Paragraph>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card title="快速下单" variant="borderless">
            <p>快速提交您的维修需求</p>
            <Button type="primary" onClick={handleQuickOrder}>立即下单</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="订单查询" variant="borderless">
            <p>查看您的订单状态</p>
            <Button onClick={handleViewOrders}>查看订单</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="服务评价" variant="borderless">
            <p>对已完成的服务进行评价</p>
            <Button onClick={handleEvaluate}>我要评价</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;