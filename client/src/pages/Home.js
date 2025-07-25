import React from 'react';
import { Button, Card, Col, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div>
      <Title level={2}>欢迎使用XGX维修平台</Title>
      <Paragraph>在这里您可以方便地下维修订单，查看订单状态和历史记录。</Paragraph>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card title="快速下单" bordered={false}>
            <p>快速提交您的维修需求</p>
            <Button type="primary">立即下单</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="订单查询" bordered={false}>
            <p>查看您的订单状态</p>
            <Button>查看订单</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="服务评价" bordered={false}>
            <p>对已完成的服务进行评价</p>
            <Button>我要评价</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;