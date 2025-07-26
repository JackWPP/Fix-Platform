import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, message, Input, Select, Card, Row, Col, Modal, Descriptions } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { getOrders, cancelOrder } from '../services/orderService';

const { Title } = Typography;

const { Search } = Input;
const { Option } = Select;

const Orders = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  
  // 模拟从API获取订单数据
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      console.log('获取订单响应:', response);
      
      // 如果后端返回的是数组，直接使用；如果是对象包含data字段，则使用data
      const ordersData = Array.isArray(response.data) ? response.data : response.data?.orders || [];
      
      // 为每个订单添加key属性
      const ordersWithKeys = ordersData.map(order => ({
        ...order,
        key: order._id || order.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setOrders(ordersWithKeys);
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败，显示模拟数据');
      // 如果API调用失败，使用模拟数据
      setOrders(mockOrderData);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = (record) => {
    const orderId = record._id ? record._id.slice(-8).toUpperCase() : 'N/A';
    Modal.confirm({
      title: '确认取消订单',
      content: `确定要取消订单 ${orderId} 吗？`,
      onOk: async () => {
        try {
          await cancelOrder(record._id);
          message.success('订单已取消');
          fetchOrders(); // 重新获取订单列表
        } catch (error) {
          console.error('取消订单失败:', error);
          message.error('取消订单失败，请重试');
        }
      }
    });
  };

  const handleCreateOrder = () => {
    history.push('/create-order');
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };
  const columns = [
    {
      title: '订单号',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.slice(-8).toUpperCase() : 'N/A', // 显示订单ID的后8位
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (serviceType) => {
        return serviceType === 'repair' ? '维修服务' : serviceType === 'appointment' ? '预约服务' : serviceType;
      },
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: '设备型号',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
    },
    {
      title: '问题描述',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
      render: (text) => text ? (text.length > 20 ? text.slice(0, 20) + '...' : text) : 'N/A',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : 'N/A',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: status => {
        let color = status === '已完成' ? 'green' : status === '处理中' ? 'orange' : 'blue';
        return (
          <Tag color={color} key={status}>
            {status}
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

  // 模拟订单数据
  const mockOrderData = [
    {
      key: '1',
      id: 'ORD001',
      device: '笔记本电脑',
      deviceModel: 'MacBook Pro 2023',
      issue: '无法开机，按电源键无反应',
      time: '2025-07-10 14:30',
      status: '处理中',
      contactName: '张三',
      contactPhone: '13800138001',
      urgency: 'urgent',
      serviceType: 'repair'
    },
    {
      key: '2',
      id: 'ORD002',
      device: '手机',
      deviceModel: 'iPhone 14 Pro',
      issue: '屏幕碎裂，触摸失灵',
      time: '2025-07-12 09:15',
      status: '已完成',
      contactName: '李四',
      contactPhone: '13800138002',
      urgency: 'normal',
      serviceType: 'appointment',
      appointmentService: 'screen_replacement'
    },
    {
      key: '3',
      id: 'ORD003',
      device: '平板电脑',
      deviceModel: 'iPad Air',
      issue: '电池膨胀，设备变形',
      time: '2025-07-15 16:45',
      status: '待处理',
      contactName: '王五',
      contactPhone: '13800138003',
      urgency: 'emergency',
      serviceType: 'repair'
    },
    {
      key: '4',
      id: 'ORD004',
      device: '笔记本电脑',
      deviceModel: 'ThinkPad X1',
      issue: '清灰服务',
      time: '2025-07-18 10:20',
      status: '处理中',
      contactName: '赵六',
      contactPhone: '13800138004',
      urgency: 'normal',
      serviceType: 'appointment',
      appointmentService: 'cleaning',
      liquidMetal: 'no'
    },
  ];

  // 过滤订单数据
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchText || 
      (order._id && order._id.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.deviceType && order.deviceType.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.deviceModel && order.deviceModel.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.problemDescription && order.problemDescription.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.issueDescription && order.issueDescription.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Title level={2}>我的订单</Title>
      
      {/* 搜索和过滤区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="搜索订单号、设备类型或问题描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择状态"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <Option value="all">全部状态</Option>
              <Option value="待处理">待处理</Option>
              <Option value="处理中">处理中</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
              style={{ width: '100%' }}
            >
              创建新订单
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 订单表格 */}
      <Table 
        columns={columns} 
        dataSource={filteredOrders}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
      />

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedOrder && (
           <Descriptions column={2} bordered>
             <Descriptions.Item label="订单号">
               {selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A'}
             </Descriptions.Item>
             <Descriptions.Item label="状态">
               <Tag color={selectedOrder.status === '已完成' ? 'green' : selectedOrder.status === '处理中' ? 'orange' : 'blue'}>
                 {selectedOrder.status}
               </Tag>
             </Descriptions.Item>
             <Descriptions.Item label="服务类型" span={2}>
               <Tag color={selectedOrder.serviceType === 'repair' ? 'blue' : 'green'}>
                 {selectedOrder.serviceType === 'repair' ? '维修服务' : selectedOrder.serviceType === 'appointment' ? '预约服务' : selectedOrder.serviceType}
               </Tag>
             </Descriptions.Item>
             <Descriptions.Item label="设备类型">{selectedOrder.deviceType || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="设备型号">{selectedOrder.deviceModel || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="紧急程度">
               {{
                 'normal': '普通',
                 'urgent': '加急',
                 'emergency': '特急'
               }[selectedOrder.urgency] || '普通'}
             </Descriptions.Item>
             <Descriptions.Item label="预约时间">
               {selectedOrder.appointmentTime ? new Date(selectedOrder.appointmentTime).toLocaleString('zh-CN') : 'N/A'}
             </Descriptions.Item>
             {selectedOrder.appointmentService && (
               <Descriptions.Item label="预约服务" span={2}>
                 {{
                   'cleaning': '清灰',
                   'screen_replacement': '换屏',
                   'battery_replacement': '换电池',
                   'system_reinstall': '系统重装',
                   'software_install': '软件安装'
                 }[selectedOrder.appointmentService]}
               </Descriptions.Item>
             )}
             {selectedOrder.liquidMetal && (
               <Descriptions.Item label="液态金属机型" span={2}>
                 {selectedOrder.liquidMetal === 'yes' ? '是' : selectedOrder.liquidMetal === 'no' ? '否' : '不确定'}
               </Descriptions.Item>
             )}
             <Descriptions.Item label="联系人">{selectedOrder.contactName || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="联系电话">{selectedOrder.contactPhone || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="提交时间" span={2}>
               {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('zh-CN') : 'N/A'}
             </Descriptions.Item>
             <Descriptions.Item label="问题描述" span={2}>
               {selectedOrder.problemDescription || selectedOrder.issueDescription || 'N/A'}
             </Descriptions.Item>
           </Descriptions>
         )}
      </Modal>
    </div>
  );
};

export default Orders;