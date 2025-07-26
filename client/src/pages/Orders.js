import React from 'react';
import { Table, Tag, Space, Button, Typography, message } from 'antd';
import { useHistory } from 'react-router-dom';

const { Title } = Typography;

const Orders = () => {
  const history = useHistory();
  
  const handleViewDetail = (record) => {
    message.info(`查看订单 ${record.id} 的详情`);
    // 这里可以添加查看订单详情的逻辑
  };

  const handleCancelOrder = (record) => {
    message.warning(`取消订单 ${record.id}`);
    // 这里可以添加取消订单的逻辑
  };

  const handleCreateOrder = () => {
    history.push('/create-order');
  };
  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '设备类型',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: '问题描述',
      dataIndex: 'issue',
      key: 'issue',
    },
    {
      title: '提交时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: status => {
        let color = status === '已完成' ? 'green' : status === '处理中' ? 'orange' : 'blue';
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <a onClick={() => handleViewDetail(record)}>查看详情</a>
          {record.status === '待处理' && <a onClick={() => handleCancelOrder(record)}>取消订单</a>}
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      id: 'ORD001',
      device: '笔记本电脑',
      issue: '无法开机',
      time: '2025-07-10 14:30',
      status: '处理中',
    },
    {
      key: '2',
      id: 'ORD002',
      device: '手机',
      issue: '屏幕碎裂',
      time: '2025-07-12 09:15',
      status: '已完成',
    },
    {
      key: '3',
      id: 'ORD003',
      device: '平板电脑',
      issue: '电池膨胀',
      time: '2025-07-15 16:45',
      status: '待处理',
    },
  ];

  return (
    <div>
      <Title level={2}>我的订单</Title>
      <Table columns={columns} dataSource={data} />
      <Button type="primary" style={{ marginTop: 16 }} onClick={handleCreateOrder}>
        创建新订单
      </Button>
    </div>
  );
};

export default Orders;