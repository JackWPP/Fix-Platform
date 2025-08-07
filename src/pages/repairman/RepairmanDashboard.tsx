import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message, Modal, Form, Input, Select, Timeline } from 'antd';
import { ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { orderAPI, handleAPIError } from '../../utils/api';
import { useAuthStore } from '../../store';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Option } = Select;

interface Order {
  id: string;
  title: string;
  description: string;
  device_type: string;
  service_type: string;
  status: string;
  priority: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  created_at: string;
  assigned_at?: string;
  completed_at?: string;
  repairman_id?: string;
  repairman_name?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

const RepairmanDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateForm] = Form.useForm();

  // 获取我的订单列表
  const fetchMyOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await orderAPI.getOrders({ repairman_id: user.id });
      
      if (response.data?.success) {
        const orderList = response.data.data.orders || [];
        setOrders(orderList);
        
        // 计算统计数据
        const newStats = {
          total: orderList.length,
          pending: orderList.filter((order: Order) => order.status === 'pending').length,
          in_progress: orderList.filter((order: Order) => order.status === 'in_progress').length,
          completed: orderList.filter((order: Order) => order.status === 'completed').length,
          cancelled: orderList.filter((order: Order) => order.status === 'cancelled').length,
        };
        setStats(newStats);
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'orange',
      'assigned': 'blue',
      'in_progress': 'cyan',
      'completed': 'green',
      'cancelled': 'red',
    };
    return colors[status] || 'default';
  };

  // 状态名称
  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      'pending': '待处理',
      'assigned': '已分配',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消',
    };
    return names[status] || status;
  };

  // 优先级标签颜色
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'urgent': 'purple',
    };
    return colors[priority] || 'default';
  };

  // 优先级名称
  const getPriorityName = (priority: string) => {
    const names: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '紧急',
    };
    return names[priority] || priority;
  };

  // 查看订单详情
  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // 更新订单状态
  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    updateForm.setFieldsValue({
      status: order.status,
      notes: '',
    });
    setUpdateModalVisible(true);
  };

  // 提交状态更新
  const handleUpdateOrder = async (values: any) => {
    if (!selectedOrder) return;
    
    try {
      const response = await orderAPI.updateOrderStatus(selectedOrder.id, values.status, values.notes);
      
      if (response.data?.success) {
        message.success('订单状态更新成功');
        setUpdateModalVisible(false);
        updateForm.resetFields();
        setSelectedOrder(null);
        fetchMyOrders();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '设备类型',
      dataIndex: 'device_type',
      key: 'device_type',
    },
    {
      title: '服务类型',
      dataIndex: 'service_type',
      key: 'service_type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusName(status)}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{getPriorityName(priority)}</Tag>
      ),
    },
    {
      title: '客户',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewOrderDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            onClick={() => openUpdateModal(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            更新
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.total}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.in_progress}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 我的订单列表 */}
      <Card title="我的订单">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            total: orders.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>订单编号：</strong>{selectedOrder.id}</p>
                <p><strong>标题：</strong>{selectedOrder.title}</p>
                <p><strong>设备类型：</strong>{selectedOrder.device_type}</p>
                <p><strong>服务类型：</strong>{selectedOrder.service_type}</p>
                <p><strong>状态：</strong>
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusName(selectedOrder.status)}
                  </Tag>
                </p>
                <p><strong>优先级：</strong>
                  <Tag color={getPriorityColor(selectedOrder.priority)}>
                    {getPriorityName(selectedOrder.priority)}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p><strong>客户姓名：</strong>{selectedOrder.customer_name}</p>
                <p><strong>客户电话：</strong>{selectedOrder.customer_phone}</p>
                <p><strong>服务地址：</strong>{selectedOrder.address}</p>
                <p><strong>创建时间：</strong>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                {selectedOrder.assigned_at && (
                  <p><strong>分配时间：</strong>{new Date(selectedOrder.assigned_at).toLocaleString()}</p>
                )}
                {selectedOrder.completed_at && (
                  <p><strong>完成时间：</strong>{new Date(selectedOrder.completed_at).toLocaleString()}</p>
                )}
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <p><strong>问题描述：</strong></p>
              <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {selectedOrder.description}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 更新订单状态弹窗 */}
      <Modal
        title="更新订单状态"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={() => updateForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateOrder}
        >
          <Form.Item
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select placeholder="请选择订单状态">
              <Option value="assigned">已分配</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
            rules={[{ required: true, message: '请输入处理备注' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入处理备注或进度说明"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepairmanDashboard;