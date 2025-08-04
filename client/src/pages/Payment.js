import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Radio, message, Spin, Alert, Descriptions, Divider } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { WechatOutlined, AlipayOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { orderAPI, paymentAPI } from '../services/api';

const { Title, Text } = Typography;

const Payment = () => {
  const { orderId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [orderInfo, setOrderInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const paymentMethods = [
    {
      value: 'wechat',
      label: '微信支付',
      icon: <WechatOutlined style={{ color: '#1AAD19', fontSize: 20 }} />,
      description: '使用微信扫码支付'
    },
    {
      value: 'alipay',
      label: '支付宝',
      icon: <AlipayOutlined style={{ color: '#1677FF', fontSize: 20 }} />,
      description: '使用支付宝扫码支付'
    }
  ];

  // 获取订单信息
  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!orderId) {
        message.error('订单ID不存在');
        history.push('/orders');
        return;
      }

      try {
        setOrderLoading(true);
        const order = await orderAPI.getOrderDetail(orderId);
        setOrderInfo(order);
        setPaymentStatus(order.paymentStatus || 'unpaid');
        
        // 如果订单已支付，直接跳转到订单详情
        if (order.paymentStatus === 'paid') {
          message.success('订单已支付完成');
          setTimeout(() => {
            history.push(`/orders/${orderId}`);
          }, 1500);
        }
      } catch (error) {
        console.error('获取订单信息失败:', error);
        message.error('获取订单信息失败');
        history.push('/orders');
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId, history]);

  // 处理支付
  const handlePayment = async () => {
    if (!orderInfo) {
      message.error('订单信息不存在');
      return;
    }

    setLoading(true);
    try {
      // 模拟支付流程
      const paymentData = {
        orderId: orderInfo._id,
        paymentMethod,
        amount: orderInfo.amount
      };

      message.loading('正在处理支付...', 2);
      
      // 调用模拟支付接口
      const result = await paymentAPI.simulatePayment(paymentData);
      
      if (result.success) {
        message.success('支付成功！');
        setPaymentStatus('paid');
        
        // 跳转到订单详情页面
        setTimeout(() => {
          history.push(`/orders/${orderId}`);
        }, 1500);
      } else {
        message.error(result.message || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付失败:', error);
      message.error('支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消支付
  const handleCancel = () => {
    history.push('/orders');
  };

  if (orderLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>正在加载订单信息...</div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Alert
          message="订单不存在"
          description="请检查订单ID是否正确"
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (paymentStatus === 'paid') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={3}>支付成功</Title>
            <Text type="secondary">订单已支付完成，我们会尽快为您安排服务</Text>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => history.push(`/orders/${orderId}`)}>
                查看订单详情
              </Button>
              <Button style={{ marginLeft: 12 }} onClick={() => history.push('/orders')}>
                返回订单列表
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>订单支付</Title>
      
      <Card title="订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={1}>
          <Descriptions.Item label="订单号">{orderInfo._id}</Descriptions.Item>
          <Descriptions.Item label="服务类型">
            {orderInfo.serviceType === 'repair' ? '维修服务' : '预约服务'}
            {orderInfo.appointmentService && ` - ${orderInfo.appointmentService}`}
          </Descriptions.Item>
          <Descriptions.Item label="设备信息">
            {orderInfo.deviceType} - {orderInfo.deviceModel}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">{orderInfo.contactName}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{orderInfo.contactPhone}</Descriptions.Item>
          <Descriptions.Item label="订单金额">
            <Text strong style={{ fontSize: 18, color: '#f5222d' }}>¥{orderInfo.amount}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="选择支付方式">
        <Radio.Group 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: '100%' }}
        >
          {paymentMethods.map(method => (
            <div key={method.value} style={{ marginBottom: 12 }}>
              <Radio value={method.value} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  {method.icon}
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 500 }}>{method.label}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{method.description}</div>
                  </div>
                </div>
              </Radio>
            </div>
          ))}
        </Radio.Group>

        <Divider />
        
        <Alert
          message="支付说明"
          description="这是模拟支付环境，点击支付按钮将自动完成支付流程。实际环境中会跳转到相应的支付平台。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            loading={loading}
            onClick={handlePayment}
            style={{ minWidth: 120, marginRight: 12 }}
          >
            立即支付 ¥{orderInfo.amount}
          </Button>
          <Button size="large" onClick={handleCancel}>
            取消支付
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Payment;