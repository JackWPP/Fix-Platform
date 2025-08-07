import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Timeline, Image, message, Modal, Form, Input, Select } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { orderAPI, userAPI, handleAPIError } from '../../utils/api';

const { TextArea } = Input;
const { Option } = Select;

interface Order {
  id: string;
  device_type: string;
  device_model: string;
  service_type: string;
  appointment_service?: string;
  liquid_metal?: string;
  problem_description?: string;
  issue_description?: string;
  urgency: string;
  contact_name: string;
  contact_phone: string;
  appointment_time: string;
  status: string;
  assigned_to?: string;
  repair_notes?: string;
  rating_score?: number;
  rating_comment?: string;
  amount?: number;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  users?: { name: string; phone: string };
  assigned_user?: { name: string; phone: string };
  order_images?: Array<{ id: string; image_url: string; image_type: string }>;
  order_logs?: Array<{
    id: string;
    action: string;
    description: string;
    created_at: string;
    users: { name: string };
  }>;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  // 获取订单详情
  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await orderAPI.getOrderDetail(orderId);
      
      if (response.data?.success) {
        setOrder(response.data.data.order);
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

  // 获取维修员列表
  const fetchTechnicians = async () => {
    try {
      const response = await userAPI.getTechnicians();
      
      if (response.data?.success) {
        setTechnicians(response.data.data.technicians || []);
      }
    } catch (error) {
      console.error('获取维修员列表失败:', error);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    if (user?.role === 'admin' || user?.role === 'customer_service') {
      fetchTechnicians();
    }
  }, [orderId]);

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '待处理': 'orange',
      '处理中': 'blue',
      '已完成': 'green',
      '已取消': 'red',
    };
    return colors[status] || 'default';
  };

  // 紧急程度标签颜色
  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      'normal': 'default',
      'urgent': 'orange',
      'emergency': 'red',
    };
    return colors[urgency] || 'default';
  };

  // 分配订单
  const handleAssignOrder = async (values: { technician_id: string }) => {
    if (!orderId) return;
    
    try {
      const response = await orderAPI.assignOrder(orderId, values.technician_id);
      
      if (response.data?.success) {
        message.success('订单分配成功');
        setAssignModalVisible(false);
        assignForm.resetFields();
        fetchOrderDetail();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  // 更新订单状态
  const handleUpdateStatus = async (values: { status: string; description?: string }) => {
    if (!orderId) return;
    
    try {
      const response = await orderAPI.updateOrderStatus(orderId, values.status, values.description);
      
      if (response.data?.success) {
        message.success('状态更新成功');
        setStatusModalVisible(false);
        statusForm.resetFields();
        fetchOrderDetail();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    }
  };

  if (!order) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              返回
            </Button>
            {(user?.role === 'admin' || user?.role === 'customer_service') && (
              <>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setAssignModalVisible(true)}
                  disabled={!!order.assigned_to}
                >
                  分配维修员
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setStatusModalVisible(true)}
                >
                  更新状态
                </Button>
              </>
            )}
          </Space>
        </div>

        <Descriptions title="订单信息" column={2} bordered>
          <Descriptions.Item label="订单ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="设备类型">{order.device_type}</Descriptions.Item>
          <Descriptions.Item label="设备型号">{order.device_model}</Descriptions.Item>
          <Descriptions.Item label="服务类型">{order.service_type}</Descriptions.Item>
          <Descriptions.Item label="预约服务">{order.appointment_service || '无'}</Descriptions.Item>
          <Descriptions.Item label="液态金属">{order.liquid_metal || '无'}</Descriptions.Item>
          <Descriptions.Item label="紧急程度">
            <Tag color={getUrgencyColor(order.urgency)}>
              {order.urgency === 'normal' ? '普通' : order.urgency === 'urgent' ? '紧急' : '非常紧急'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="联系人">{order.contact_name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.contact_phone}</Descriptions.Item>
          <Descriptions.Item label="预约时间">
            {new Date(order.appointment_time).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="分配维修员">
            {order.assigned_user ? order.assigned_user.name : '未分配'}
          </Descriptions.Item>
          <Descriptions.Item label="问题描述" span={2}>
            {order.problem_description || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="故障描述" span={2}>
            {order.issue_description || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="维修备注" span={2}>
            {order.repair_notes || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="订单金额">
            {order.amount ? `¥${order.amount}` : '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="支付状态">
            {order.payment_status ? (
              <Tag color={order.payment_status === 'paid' ? 'green' : 'orange'}>
                {order.payment_status === 'paid' ? '已支付' : '未支付'}
              </Tag>
            ) : '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(order.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {/* 订单图片 */}
        {order.order_images && order.order_images.length > 0 && (
          <Card title="相关图片" style={{ marginTop: 16 }}>
            <Image.PreviewGroup>
              <Space wrap>
                {order.order_images.map((img) => (
                  <Image
                    key={img.id}
                    width={100}
                    height={100}
                    src={img.image_url}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </Card>
        )}

        {/* 订单日志 */}
        {order.order_logs && order.order_logs.length > 0 && (
          <Card title="操作日志" style={{ marginTop: 16 }}>
            <Timeline>
              {order.order_logs.map((log) => (
                <Timeline.Item key={log.id}>
                  <div>
                    <div><strong>{log.description}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {log.users.name} · {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </Card>

      {/* 分配维修员弹窗 */}
      <Modal
        title="分配维修员"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => assignForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignOrder}
        >
          <Form.Item
            name="technician_id"
            label="选择维修员"
            rules={[{ required: true, message: '请选择维修员' }]}
          >
            <Select placeholder="请选择维修员">
              {technicians.map((tech) => (
                <Option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.phone})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 更新状态弹窗 */}
      <Modal
        title="更新订单状态"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={() => statusForm.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="待处理">待处理</Option>
              <Option value="处理中">处理中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="备注说明"
          >
            <TextArea rows={4} placeholder="请输入备注说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetail;