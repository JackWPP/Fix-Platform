import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Switch, Button, Typography, Tabs, InputNumber, TimePicker, Select, App } from 'antd';
import {
  SettingOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BellOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { handleAPIError } from '../../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SystemConfig {
  key: string;
  value: any;
  type: string;
  category: string;
  description: string;
}

const Settings: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [businessForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);

  // 获取系统配置
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      // 这里应该调用API获取系统配置
      // const response = await systemAPI.getConfigs();
      // 暂时使用模拟数据
      const mockConfigs: SystemConfig[] = [
        {
          key: 'business_hours',
          value: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5, 6] },
          type: 'object',
          category: 'business',
          description: '营业时间配置'
        },
        {
          key: 'contact_phone',
          value: '400-123-4567',
          type: 'string',
          category: 'business',
          description: '客服联系电话'
        },
        {
          key: 'contact_address',
          value: '北京市朝阳区XXX街道XXX号',
          type: 'string',
          category: 'business',
          description: '门店地址'
        },
        {
          key: 'emergency_fee_rate',
          value: 1.5,
          type: 'number',
          category: 'business',
          description: '紧急服务费率倍数'
        },
        {
          key: 'max_order_images',
          value: 10,
          type: 'number',
          category: 'system',
          description: '订单最大图片数量'
        },
        {
          key: 'notification_enabled',
          value: true,
          type: 'boolean',
          category: 'notification',
          description: '是否启用通知功能'
        },
        {
          key: 'sms_template_order_created',
          value: '您的维修订单已创建，订单号：{order_id}，我们将尽快为您安排服务。',
          type: 'string',
          category: 'notification',
          description: '订单创建短信模板'
        },
        {
          key: 'sms_template_order_assigned',
          value: '您的订单已分配给维修师傅，联系电话：{technician_phone}',
          type: 'string',
          category: 'notification',
          description: '订单分配短信模板'
        }
      ];
      
      setConfigs(mockConfigs);
      
      // 设置表单初始值
      const businessConfig = mockConfigs.find(c => c.key === 'business_hours');
      const businessHours = businessConfig?.value || { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5, 6] };
      
      businessForm.setFieldsValue({
        contact_phone: mockConfigs.find(c => c.key === 'contact_phone')?.value || '',
        contact_address: mockConfigs.find(c => c.key === 'contact_address')?.value || '',
        business_start: dayjs(businessHours.start, 'HH:mm'),
        business_end: dayjs(businessHours.end, 'HH:mm'),
        business_days: businessHours.days,
        emergency_fee_rate: mockConfigs.find(c => c.key === 'emergency_fee_rate')?.value || 1.5,
      });
      
      systemForm.setFieldsValue({
        max_order_images: mockConfigs.find(c => c.key === 'max_order_images')?.value || 10,
      });
      
      notificationForm.setFieldsValue({
        notification_enabled: mockConfigs.find(c => c.key === 'notification_enabled')?.value || true,
        sms_template_order_created: mockConfigs.find(c => c.key === 'sms_template_order_created')?.value || '',
        sms_template_order_assigned: mockConfigs.find(c => c.key === 'sms_template_order_assigned')?.value || '',
      });
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 保存业务配置
  const handleSaveBusinessConfig = async (values: any) => {
    try {
      setLoading(true);
      
      // 这里应该调用API保存配置
      // await systemAPI.updateConfigs({
      //   business_hours: {
      //     start: values.business_start.format('HH:mm'),
      //     end: values.business_end.format('HH:mm'),
      //     days: values.business_days
      //   },
      //   contact_phone: values.contact_phone,
      //   contact_address: values.contact_address,
      //   emergency_fee_rate: values.emergency_fee_rate
      // });
      
      message.success('业务配置保存成功');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // 保存系统配置
  const handleSaveSystemConfig = async (values: any) => {
    try {
      setLoading(true);
      
      // 这里应该调用API保存配置
      // await systemAPI.updateConfigs(values);
      
      message.success('系统配置保存成功');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // 保存通知配置
  const handleSaveNotificationConfig = async (values: any) => {
    try {
      setLoading(true);
      
      // 这里应该调用API保存配置
      // await systemAPI.updateConfigs(values);
      
      message.success('通知配置保存成功');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      message.error(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg">
        <Title level={2} className="text-white mb-2">
          <SettingOutlined className="mr-2" />
          系统设置
        </Title>
        <Text className="text-purple-100 text-lg">
          管理系统的各项配置参数
        </Text>
      </div>

      {/* 配置选项卡 */}
      <Card>
        <Tabs 
          defaultActiveKey="business"
          items={[
            {
              key: 'business',
              label: <span><DollarOutlined />业务配置</span>,
              children: (
            <Form
              form={businessForm}
              layout="vertical"
              onFinish={handleSaveBusinessConfig}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contact_phone"
                    label="客服电话"
                    rules={[{ required: true, message: '请输入客服电话' }]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入客服电话"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="emergency_fee_rate"
                    label="紧急服务费率倍数"
                    rules={[{ required: true, message: '请输入费率倍数' }]}
                  >
                    <InputNumber
                      min={1}
                      max={5}
                      step={0.1}
                      placeholder="1.5"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="contact_address"
                label="门店地址"
                rules={[{ required: true, message: '请输入门店地址' }]}
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="请输入门店地址"
                />
              </Form.Item>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="business_start"
                    label="营业开始时间"
                    rules={[{ required: true, message: '请选择开始时间' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="选择开始时间"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="business_end"
                    label="营业结束时间"
                    rules={[{ required: true, message: '请选择结束时间' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="选择结束时间"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="business_days"
                    label="营业日期"
                    rules={[{ required: true, message: '请选择营业日期' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择营业日期"
                    >
                      <Option value={1}>周一</Option>
                      <Option value={2}>周二</Option>
                      <Option value={3}>周三</Option>
                      <Option value={4}>周四</Option>
                      <Option value={5}>周五</Option>
                      <Option value={6}>周六</Option>
                      <Option value={0}>周日</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存业务配置
                </Button>
              </Form.Item>
            </Form>
              )
            },
            {
              key: 'system',
              label: <span><SettingOutlined />系统配置</span>,
              children: (
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSaveSystemConfig}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="max_order_images"
                    label="订单最大图片数量"
                    rules={[{ required: true, message: '请输入最大图片数量' }]}
                  >
                    <InputNumber
                      min={1}
                      max={20}
                      placeholder="10"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存系统配置
                </Button>
              </Form.Item>
            </Form>
              )
            },
            {
              key: 'notification',
              label: <span><BellOutlined />通知配置</span>,
              children: (
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleSaveNotificationConfig}
            >
              <Form.Item
                name="notification_enabled"
                label="启用通知功能"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="sms_template_order_created"
                label="订单创建短信模板"
                rules={[{ required: true, message: '请输入短信模板' }]}
                extra="可用变量：{order_id}, {customer_name}, {contact_phone}"
              >
                <TextArea
                  rows={3}
                  placeholder="您的维修订单已创建，订单号：{order_id}，我们将尽快为您安排服务。"
                />
              </Form.Item>
              
              <Form.Item
                name="sms_template_order_assigned"
                label="订单分配短信模板"
                rules={[{ required: true, message: '请输入短信模板' }]}
                extra="可用变量：{order_id}, {technician_name}, {technician_phone}"
              >
                <TextArea
                  rows={3}
                  placeholder="您的订单已分配给维修师傅，联系电话：{technician_phone}"
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存通知配置
                </Button>
              </Form.Item>
            </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings;