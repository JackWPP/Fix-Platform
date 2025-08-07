import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Input, Select, DatePicker, message, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { orderAPI, handleAPIError } from '../../utils/api';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Order {
  id: string;
  device_type: string;
  device_model: string;
  service_type: string;
  contact_name: string;
  contact_phone: string;
  status: string;
  appointment_time: string;
  created_at: string;
  assigned_to?: string;
  users?: { name: string; phone: string };
  assigned_user?: { name: string; phone: string };
}

const OrderList: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: null as any,
  });

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrders({
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      
      if (response.data?.success) {
        setOrders(response.data.data.orders || []);
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
    fetchOrders();
  }, [filters]);

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

  // 查看订单详情
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  // 删除订单
  const handleDeleteOrder = async (orderId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个订单吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await orderAPI.deleteOrder(orderId);
          if (response.data?.success) {
            message.success('订单删除成功');
            fetchOrders();
          } else {
            const error = handleAPIError(response);
            message.error(error.message);
          }
        } catch (error) {
          const apiError = handleAPIError(error);
          message.error(apiError.message);
        }
      },
    });
  };

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => id.slice(0, 8) + '...',
    },
    {
      title: '设备信息',
      key: 'device',
      render: (_, record) => (
        <div>
          <div>{record.device_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.device_model}</div>
        </div>
      ),
    },
    {
      title: '服务类型',
      dataIndex: 'service_type',
      key: 'service_type',
    },
    {
      title: '联系人',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contact_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.contact_phone}</div>
        </div>
      ),
    },
    {
      title: '预约时间',
      dataIndex: 'appointment_time',
      key: 'appointment_time',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '分配维修员',
      key: 'assigned',
      render: (_, record) => (
        record.assigned_user ? (
          <div>
            <div>{record.assigned_user.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.assigned_user.phone}</div>
          </div>
        ) : (
          <span style={{ color: '#999' }}>未分配</span>
        )
      ),
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
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {(user?.role === 'admin' || user?.role === 'customer_service') && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteOrder(record.id)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Search
              placeholder="搜索订单"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="待处理">待处理</Option>
              <Option value="处理中">处理中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
            <RangePicker
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Space>
        </div>
        
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
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单ID">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="设备类型">{selectedOrder.device_type}</Descriptions.Item>
            <Descriptions.Item label="设备型号">{selectedOrder.device_model}</Descriptions.Item>
            <Descriptions.Item label="服务类型">{selectedOrder.service_type}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selectedOrder.contact_name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedOrder.contact_phone}</Descriptions.Item>
            <Descriptions.Item label="预约时间">
              {new Date(selectedOrder.appointment_time).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="分配维修员">
              {selectedOrder.assigned_user ? selectedOrder.assigned_user.name : '未分配'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedOrder.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;