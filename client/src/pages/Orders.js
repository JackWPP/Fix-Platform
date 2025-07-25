import React from 'react';
import { Table, Tag, Space, Button, Typography } from 'antd';

const { Title } = Typography;

const Orders = () => {
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
          <a>查看详情</a>
          {record.status === '待处理' && <a>取消订单</a>}
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
      time: '2023-05-10 14:30',
      status: '处理中',
    },
    {
      key: '2',
      id: 'ORD002',
      device: '手机',
      issue: '屏幕碎裂',
      time: '2023-05-12 09:15',
      status: '已完成',
    },
    {
      key: '3',
      id: 'ORD003',
      device: '平板电脑',
      issue: '电池膨胀',
      time: '2023-05-15 16:45',
      status: '待处理',
    },
  ];

  return (
    <div>
      <Title level={2}>我的订单</Title>
      <Table columns={columns} dataSource={data} />
      <Button type="primary" style={{ marginTop: 16 }}>
        创建新订单
      </Button>
    </div>
  );
};

export default Orders;