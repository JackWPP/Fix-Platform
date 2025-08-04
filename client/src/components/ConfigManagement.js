import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Space,
  message,
  Popconfirm,
  Descriptions,
  Row,
  Col,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ToolOutlined,
  MobileOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { configAPI } from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ConfigManagement = () => {
  // 状态管理
  const [serviceTypes, setServiceTypes] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [pricingStrategies, setPricingStrategies] = useState([]);
  const [systemConfigs, setSystemConfigs] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'service', 'device', 'pricing', 'system'
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // 获取数据
  const fetchServiceTypes = async () => {
    try {
      const response = await configAPI.getServiceTypes();
      if (response.success) {
        setServiceTypes(response.data);
      }
    } catch (error) {
      message.error('获取服务类型失败');
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await configAPI.getDeviceTypes();
      if (response.success) {
        setDeviceTypes(response.data);
      }
    } catch (error) {
      message.error('获取设备类型失败');
    }
  };

  const fetchPricingStrategies = async () => {
    try {
      const response = await configAPI.getPricingStrategies();
      if (response.success) {
        setPricingStrategies(response.data);
      }
    } catch (error) {
      message.error('获取价格策略失败');
    }
  };

  const fetchSystemConfigs = async () => {
    try {
      const response = await configAPI.getSystemConfigs();
      if (response.success) {
        setSystemConfigs(response.data);
      }
    } catch (error) {
      message.error('获取系统配置失败');
    }
  };

  useEffect(() => {
    fetchServiceTypes();
    fetchDeviceTypes();
    fetchPricingStrategies();
    fetchSystemConfigs();
  }, []);

  // 通用模态框处理
  const showModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalVisible(true);
    
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单验证通过，提交数据:', values);
      setLoading(true);
      
      let response;
      const isEdit = !!editingItem;
      
      console.log(`执行${isEdit ? '更新' : '创建'}操作，类型: ${modalType}`);
      if (isEdit) {
        console.log('编辑项目:', editingItem);
      }
      
      switch (modalType) {
        case 'service':
          response = isEdit 
            ? await configAPI.updateServiceType(editingItem._id, values)
            : await configAPI.createServiceType(values);
          break;
        case 'device':
          response = isEdit
            ? await configAPI.updateDeviceType(editingItem._id, values)
            : await configAPI.createDeviceType(values);
          break;
        case 'pricing':
          response = isEdit
            ? await configAPI.updatePricingStrategy(editingItem._id, values)
            : await configAPI.createPricingStrategy(values);
          break;
        case 'system':
          response = isEdit
            ? await configAPI.updateSystemConfig(editingItem._id, values)
            : await configAPI.createSystemConfig(values);
          break;
        default:
          console.error('未知的模态框类型:', modalType);
          return;
      }
      
      console.log('API响应:', response);
      
      if (response && response.success) {
        message.success(`${isEdit ? '更新' : '创建'}成功`);
        setModalVisible(false);
        form.resetFields();
        setEditingItem(null);
        // 刷新对应数据
        switch (modalType) {
          case 'service': fetchServiceTypes(); break;
          case 'device': fetchDeviceTypes(); break;
          case 'pricing': fetchPricingStrategies(); break;
          case 'system': fetchSystemConfigs(); break;
        }
      } else {
        console.error('操作失败:', response);
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      console.error('提交表单时发生错误:', error);
      message.error(`操作失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除处理
  const handleDelete = async (type, id) => {
    try {
      let response;
      switch (type) {
        case 'service':
          response = await configAPI.deleteServiceType(id);
          break;
        case 'device':
          response = await configAPI.deleteDeviceType(id);
          break;
        case 'pricing':
          response = await configAPI.deletePricingStrategy(id);
          break;
        case 'system':
          response = await configAPI.deleteSystemConfig(id);
          break;
        default:
          return;
      }
      
      if (response.success) {
        message.success('删除成功');
        // 刷新对应数据
        switch (type) {
          case 'service': fetchServiceTypes(); break;
          case 'device': fetchDeviceTypes(); break;
          case 'pricing': fetchPricingStrategies(); break;
          case 'system': fetchSystemConfigs(); break;
        }
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 服务类型表格列
  const serviceColumns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '服务代码',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => `¥${price}`
    },
    {
      title: '预计耗时',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      render: (duration) => `${duration}分钟`
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal('service', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个服务类型吗？"
            onConfirm={() => handleDelete('service', record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 设备类型表格列
  const deviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '设备代码',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="green">{code}</Tag>,
      width: 100
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 80
    },
    {
      title: '支持品牌',
      dataIndex: 'brands',
      key: 'brands',
      render: (brands) => {
        if (!brands) return '-';
        const brandList = typeof brands === 'string' ? brands.split(',') : brands;
        return (
          <div>
            {brandList.slice(0, 2).map((brand, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
                {typeof brand === 'string' ? brand.trim() : String(brand)}
              </Tag>
            ))}
            {brandList.length > 2 && (
              <Tag color="default">+{brandList.length - 2}</Tag>
            )}
          </div>
        );
      },
      width: 150
    },
    {
      title: '常见问题',
      dataIndex: 'commonIssues',
      key: 'commonIssues',
      render: (issues) => {
        if (!issues) return '-';
        const issueList = typeof issues === 'string' ? issues.split(',') : issues;
        return (
          <div>
            {issueList.slice(0, 2).map((issue, index) => (
              <Tag key={index} color="orange" style={{ marginBottom: 2 }}>
                {typeof issue === 'string' ? issue.trim() : String(issue)}
              </Tag>
            ))}
            {issueList.length > 2 && (
              <Tag color="default">+{issueList.length - 2}</Tag>
            )}
          </div>
        );
      },
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
      width: 80
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal('device', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个设备类型吗？"
            onConfirm={() => handleDelete('device', record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 120
    }
  ];

  // 价格策略表格列
  const pricingColumns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '策略类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          'fixed': '固定价格',
          'hourly': '按小时计费',
          'dynamic': '动态定价'
        };
        return <Tag color="purple">{typeMap[type] || type}</Tag>;
      }
    },
    {
      title: '基础价格',
      dataIndex: ['rules', 'basePrice'],
      key: 'basePrice',
      render: (price) => price ? `¥${price}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal('pricing', record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个价格策略吗？"
            onConfirm={() => handleDelete('pricing', record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 系统配置表格列
  const systemColumns = [
    {
      title: '配置键',
      dataIndex: 'key',
      key: 'key',
      render: (key) => <Tag color="orange">{key}</Tag>
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (record.type === 'boolean') {
          return <Tag color={value ? 'green' : 'red'}>{value ? '是' : '否'}</Tag>;
        }
        return String(value);
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          'string': '字符串',
          'number': '数字',
          'boolean': '布尔值',
          'json': 'JSON'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '可编辑',
      dataIndex: 'editable',
      key: 'editable',
      render: (editable) => (
        <Tag color={editable ? 'green' : 'red'}>
          {editable ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.editable && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showModal('system', record)}
            >
              编辑
            </Button>
          )}
          {record.editable && (
            <Popconfirm
              title="确定删除这个配置项吗？"
              onConfirm={() => handleDelete('system', record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // 渲染模态框表单
  const renderModalForm = () => {
    switch (modalType) {
      case 'service':
        return (
          <>
            <Form.Item
              label="服务名称"
              name="name"
              rules={[{ required: true, message: '请输入服务名称' }]}
            >
              <Input placeholder="请输入服务名称" />
            </Form.Item>
            <Form.Item
              label="服务代码"
              name="code"
              rules={[{ required: true, message: '请输入服务代码' }]}
            >
              <Input placeholder="请输入服务代码" />
            </Form.Item>
            <Form.Item
              label="服务描述"
              name="description"
            >
              <TextArea rows={3} placeholder="请输入服务描述" />
            </Form.Item>
            <Form.Item
              label="基础价格"
              name="basePrice"
              rules={[{ required: true, message: '请输入基础价格' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入基础价格"
                addonAfter="元"
              />
            </Form.Item>
            <Form.Item
              label="预计耗时"
              name="estimatedDuration"
              rules={[{ required: true, message: '请输入预计耗时' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="请输入预计耗时"
                addonAfter="分钟"
              />
            </Form.Item>
            <Form.Item
              label="服务类别"
              name="category"
            >
              <Select placeholder="请选择服务类别">
                <Option value="维修">维修</Option>
                <Option value="清洁">清洁</Option>
                <Option value="安装">安装</Option>
                <Option value="检测">检测</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="是否启用"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        );
      
      case 'device':
        return (
          <>
            <Form.Item
              label="设备名称"
              name="name"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="请输入设备名称" />
            </Form.Item>
            <Form.Item
              label="设备代码"
              name="code"
              rules={[{ required: true, message: '请输入设备代码' }]}
            >
              <Input placeholder="请输入设备代码" />
            </Form.Item>
            <Form.Item
              label="设备类别"
              name="category"
              rules={[{ required: true, message: '请输入设备类别' }]}
            >
              <Select placeholder="请选择设备类别">
                <Option value="电脑">电脑</Option>
                <Option value="手机">手机</Option>
                <Option value="平板">平板</Option>
                <Option value="打印机">打印机</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="支持品牌"
              name="brands"
              tooltip="请输入支持的品牌，用逗号分隔"
            >
              <TextArea 
                rows={2} 
                placeholder="请输入支持的品牌，用逗号分隔，如：苹果,华为,小米" 
              />
            </Form.Item>
            <Form.Item
              label="常见问题"
              name="commonIssues"
              tooltip="请输入常见问题，用逗号分隔"
            >
              <TextArea 
                rows={3} 
                placeholder="请输入常见问题，用逗号分隔，如：屏幕破裂,电池老化,系统卡顿" 
              />
            </Form.Item>
            <Form.Item
              label="设备描述"
              name="description"
            >
              <TextArea rows={3} placeholder="请输入设备描述" />
            </Form.Item>
            <Form.Item
              label="是否启用"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        );
      
      case 'pricing':
        return (
          <>
            <Form.Item
              label="策略名称"
              name="name"
              rules={[{ required: true, message: '请输入策略名称' }]}
            >
              <Input placeholder="请输入策略名称" />
            </Form.Item>
            <Form.Item
              label="策略类型"
              name="type"
              rules={[{ required: true, message: '请选择策略类型' }]}
            >
              <Select placeholder="请选择策略类型">
                <Option value="fixed">固定价格</Option>
                <Option value="hourly">按小时计费</Option>
                <Option value="dynamic">动态定价</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="策略描述"
              name="description"
            >
              <TextArea rows={3} placeholder="请输入策略描述" />
            </Form.Item>
            <Form.Item
              label="是否启用"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        );
      
      case 'system':
        return (
          <>
            <Form.Item
              label="配置键"
              name="key"
              rules={[{ required: true, message: '请输入配置键' }]}
            >
              <Input placeholder="请输入配置键" disabled={!!editingItem} />
            </Form.Item>
            <Form.Item
              label="配置值"
              name="value"
              rules={[{ required: true, message: '请输入配置值' }]}
            >
              <Input placeholder="请输入配置值" />
            </Form.Item>
            <Form.Item
              label="数据类型"
              name="type"
              rules={[{ required: true, message: '请选择数据类型' }]}
            >
              <Select placeholder="请选择数据类型">
                <Option value="string">字符串</Option>
                <Option value="number">数字</Option>
                <Option value="boolean">布尔值</Option>
                <Option value="json">JSON</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="配置分类"
              name="category"
              rules={[{ required: true, message: '请输入配置分类' }]}
            >
              <Input placeholder="请输入配置分类" />
            </Form.Item>
            <Form.Item
              label="配置描述"
              name="description"
            >
              <TextArea rows={3} placeholder="请输入配置描述" />
            </Form.Item>
            <Form.Item
              label="是否可编辑"
              name="editable"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        );
      
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const titles = {
      service: '服务类型',
      device: '设备类型',
      pricing: '价格策略',
      system: '系统配置'
    };
    return `${editingItem ? '编辑' : '新增'}${titles[modalType]}`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Tabs defaultActiveKey="service">
          <TabPane
            tab={
              <span>
                <ToolOutlined />
                服务类型管理
              </span>
            }
            key="service"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal('service')}
              >
                新增服务类型
              </Button>
            </div>
            <Table
              columns={serviceColumns}
              dataSource={serviceTypes}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <MobileOutlined />
                设备类型管理
              </span>
            }
            key="device"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal('device')}
              >
                新增设备类型
              </Button>
            </div>
            <Table
              columns={deviceColumns}
              dataSource={deviceTypes}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <DollarOutlined />
                价格策略管理
              </span>
            }
            key="pricing"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal('pricing')}
              >
                新增价格策略
              </Button>
            </div>
            <Table
              columns={pricingColumns}
              dataSource={pricingStrategies}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                系统参数配置
              </span>
            }
            key="system"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal('system')}
              >
                新增系统配置
              </Button>
            </div>
            <Table
              columns={systemColumns}
              dataSource={systemConfigs}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 通用编辑模态框 */}
      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, editable: true }}
        >
          {renderModalForm()}
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigManagement;