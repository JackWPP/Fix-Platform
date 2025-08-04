import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  Input, 
  Upload, 
  message, 
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Descriptions
} from 'antd';
import { orderAPI } from '../services/api';
import { 
  ToolOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import NotificationCenter from '../components/NotificationCenter';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RepairmanDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // 获取分配给当前维修员的订单
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getRepairmanOrders();
      
      if (response.success) {
        const ordersWithKey = response.orders.map(order => ({
          ...order,
          key: order._id || order.id || Math.random().toString(36).substr(2, 9)
        }));
        setOrders(ordersWithKey);
        
        // 计算统计数据
        const pending = ordersWithKey.filter(o => o.status === 'pending').length;
        const inProgress = ordersWithKey.filter(o => o.status === 'in_progress').length;
        const completed = ordersWithKey.filter(o => o.status === 'completed').length;
        setStats({ pending, inProgress, completed });
      } else {
        message.error(response.message || '获取订单失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 查看订单详情
  const showDetail = (record) => {
    setSelectedOrder(record);
    setDetailVisible(true);
  };

  // 更新订单状态
  const showUpdate = (record) => {
    setSelectedOrder(record);
    form.setFieldsValue({
      status: record.status,
      repairNotes: record.repairNotes || ''
    });
    setUpdateVisible(true);
  };

  // 提交订单更新
  const handleUpdate = async (values) => {
    try {
      const response = await orderAPI.updateOrderStatus(selectedOrder._id, values);
      
      if (response.success) {
        message.success('订单更新成功');
        setUpdateVisible(false);
        fetchOrders(); // 重新获取订单列表
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    }
  };

  // 状态标签颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // 状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in_progress': return '处理中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  // 服务类型文本
  const getServiceTypeText = (serviceType) => {
    switch (serviceType) {
      case 'repair': return '维修服务';
      case 'appointment': return '预约服务';
      default: return serviceType;
    }
  };

  // 紧急程度文本
  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'low': return '不急';
      case 'medium': return '一般';
      case 'high': return '紧急';
      default: return urgency;
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.slice(-8) : 'N/A',
      width: 100
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type) => (
        <Tag color={type === 'repair' ? 'red' : 'blue'}>
          {getServiceTypeText(type)}
        </Tag>
      ),
      width: 100
    },
    {
      title: '设备信息',
      key: 'device',
      render: (_, record) => (
        <div>
          <div>{record.deviceType}</div>
          {record.deviceModel && <Text type="secondary">{record.deviceModel}</Text>}
        </div>
      ),
      width: 120
    },
    {
      title: '问题描述',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
      ellipsis: true,
      width: 200
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => {
        const color = urgency === 'high' ? 'red' : urgency === 'medium' ? 'orange' : 'green';
        return <Tag color={color}>{getUrgencyText(urgency)}</Tag>;
      },
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => showUpdate(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            更新
          </Button>
        </Space>
      ),
      width: 120
    }
  ];

  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            <ToolOutlined /> 维修员工作台
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationCenter />
            <Button type="primary" onClick={fetchOrders} loading={loading}>
              刷新订单
            </Button>
          </div>
        </div>
      </Header>
      
      <Content style={{ margin: '24px', background: '#f0f2f5' }}>
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="待处理订单"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="处理中订单"
                value={stats.inProgress}
                prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已完成订单"
                value={stats.completed}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 订单列表 */}
        <Card title="我的订单">
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Content>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单号" span={2}>
              {selectedOrder._id ? selectedOrder._id.slice(-8) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="服务类型">
              <Tag color={selectedOrder.serviceType === 'repair' ? 'red' : 'blue'}>
                {getServiceTypeText(selectedOrder.serviceType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="设备类型">
              {selectedOrder.deviceType}
            </Descriptions.Item>
            <Descriptions.Item label="设备型号">
              {selectedOrder.deviceModel || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {selectedOrder.contactName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label="紧急程度">
              <Tag color={selectedOrder.urgency === 'high' ? 'red' : selectedOrder.urgency === 'medium' ? 'orange' : 'green'}>
                {getUrgencyText(selectedOrder.urgency)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="预约时间">
              {selectedOrder.appointmentTime ? new Date(selectedOrder.appointmentTime).toLocaleString() : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>
              {selectedOrder.problemDescription || selectedOrder.issueDescription || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="维修备注" span={2}>
              {selectedOrder.repairNotes || '暂无备注'}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间" span={2}>
              {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 更新订单模态框 */}
      <Modal
        title="更新订单状态"
        open={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        onOk={() => form.submit()}
        okText="更新"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="订单状态"
            name="status"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select>
              <Option value="pending">待处理</Option>
              <Option value="in_progress">处理中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="维修备注"
            name="repairNotes"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入维修过程、使用的配件、注意事项等信息"
            />
          </Form.Item>
          
          <Form.Item
            label="维修图片"
            name="repairImages"
          >
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default RepairmanDashboard;