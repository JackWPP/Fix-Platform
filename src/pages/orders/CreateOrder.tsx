import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Upload, Space, Radio } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { orderAPI, uploadAPI, handleAPIError } from '../../utils/api';
import { message } from '../../utils/message';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface DeviceType {
  id: string;
  name: string;
  code: string;
}

interface ServiceType {
  id: string;
  name: string;
  code: string;
  category: string;
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [serviceType, setServiceType] = useState<string>('repair');
  const [appointmentService, setAppointmentService] = useState<string>('');

  // 获取设备类型和服务类型
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [deviceResponse, serviceResponse] = await Promise.all([
          orderAPI.getDeviceTypes(),
          orderAPI.getServiceTypes()
        ]);
        
        if (deviceResponse.data?.success) {
          setDeviceTypes(deviceResponse.data.data.deviceTypes || []);
        } else {
          message.error('获取设备类型失败');
        }
        
        if (serviceResponse.data?.success) {
          setServiceTypes(serviceResponse.data.data.serviceTypes || []);
        } else {
          message.error('获取服务类型失败');
        }
      } catch (error) {
        console.error('获取元数据失败:', error);
        const apiError = handleAPIError(error);
        message.error(`获取元数据失败: ${apiError.message}`);
      }
    };

    fetchMetaData();
  }, []);

  // 处理文件上传
  const handleUpload = async (file: File) => {
    try {
      const response = await uploadAPI.uploadSingle(file);
      
      if (response.data?.success) {
        return {
          url: response.data.data.url,
          type: 'problem'
        };
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      message.error('图片上传失败');
      throw error;
    }
  };

  // 提交订单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // 上传图片
      const images = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          const uploadResult = await handleUpload(file.originFileObj);
          images.push(uploadResult);
        }
      }

      // 创建订单
      const orderData = {
        ...values,
        appointment_time: values.appointment_time.toISOString(),
        images
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response.data?.success) {
        message.success('订单创建成功');
        navigate('/orders');
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

  // 文件上传配置
  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
    beforeUpload: () => false, // 阻止自动上传
    accept: 'image/*',
    multiple: true,
    maxCount: 5,
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            service_type: 'repair',
            urgency: 'normal',
            liquid_metal: 'uncertain'
          }}
          onValuesChange={(changedValues, allValues) => {
            // 当服务类型改变时，重置相关字段
            if (changedValues.service_type) {
              setServiceType(changedValues.service_type);
              if (changedValues.service_type === 'repair') {
                form.setFieldsValue({
                  appointment_service: undefined,
                  liquid_metal: undefined,
                  service_details: undefined
                });
                setAppointmentService('');
              } else {
                form.setFieldsValue({
                  problem_description: undefined,
                  issue_description: undefined
                });
              }
            }
            // 当预约服务类型改变时，处理液态金属选项
            if (changedValues.appointment_service) {
              setAppointmentService(changedValues.appointment_service);
              if (changedValues.appointment_service !== 'cleaning') {
                form.setFieldsValue({ liquid_metal: undefined });
              }
            }
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="device_type"
              label="设备类型"
              rules={[{ required: true, message: '请选择设备类型' }]}
            >
              <Select placeholder="请选择设备类型" loading={deviceTypes.length === 0}>
                {deviceTypes.length > 0 ? (
                  deviceTypes.map(type => (
                    <Option key={type.id} value={type.code}>{type.name}</Option>
                  ))
                ) : (
                  <>
                    <Option value="笔记本电脑">笔记本电脑</Option>
                    <Option value="台式电脑">台式电脑</Option>
                    <Option value="手机">手机</Option>
                    <Option value="平板电脑">平板电脑</Option>
                    <Option value="其他">其他</Option>
                  </>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name="device_model"
              label="设备型号"
              rules={[{ required: true, message: '请输入设备型号' }]}
            >
              <Input placeholder="请输入设备型号" />
            </Form.Item>
          </div>

          <Form.Item
            name="service_type"
            label="服务类型"
            rules={[{ required: true, message: '请选择服务类型' }]}
          >
            <Radio.Group>
              <Radio value="repair">维修服务</Radio>
              <Radio value="appointment">预约服务</Radio>
            </Radio.Group>
          </Form.Item>

          {serviceType === 'appointment' && (
            <Form.Item
              name="appointment_service"
              label="预约服务类型"
              rules={[{ required: true, message: '请选择预约服务类型' }]}
            >
              <Select 
                placeholder="请选择预约服务类型"
                onChange={(value) => setAppointmentService(value)}
              >
                <Option value="cleaning">清灰</Option>
                <Option value="screen_replacement">换屏</Option>
                <Option value="battery_replacement">换电池</Option>
                <Option value="system_reinstall">系统重装</Option>
                <Option value="software_install">软件安装</Option>
              </Select>
            </Form.Item>
          )}

          {/* 液态金属选项 - 仅在清灰服务时显示 */}
          {serviceType === 'appointment' && appointmentService === 'cleaning' && (
            <Form.Item
              name="liquid_metal"
              label="液态金属机型"
              extra="清灰服务中，液态金属机型需要特殊处理"
            >
              <Radio.Group>
                <Radio value="yes">是</Radio>
                <Radio value="no">否</Radio>
                <Radio value="uncertain">不确定</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item
            name="urgency"
            label="紧急程度"
          >
            <Radio.Group>
              <Radio value="normal">普通</Radio>
              <Radio value="urgent">紧急</Radio>
              <Radio value="emergency">非常紧急</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 维修服务的问题描述 */}
          {serviceType === 'repair' && (
            <>
              <Form.Item
                name="problem_description"
                label="问题描述"
                rules={[{ required: true, message: '请详细描述设备问题' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述设备问题，包括故障现象、发生时间等"
                />
              </Form.Item>

              <Form.Item
                name="issue_description"
                label="故障现象"
              >
                <TextArea
                  rows={3}
                  placeholder="请描述具体的故障现象，如蓝屏、死机、无法开机等"
                />
              </Form.Item>
            </>
          )}

          {/* 预约服务的服务详情 */}
          {serviceType === 'appointment' && (
            <Form.Item
              name="service_details"
              label="服务详情"
            >
              <TextArea
                rows={3}
                placeholder="请描述具体的服务需求或特殊要求"
              />
            </Form.Item>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="contact_name"
              label="联系人姓名"
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>

            <Form.Item
              name="contact_phone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </div>

          <Form.Item
            name="appointment_time"
            label="预约时间"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="请选择预约时间"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="images"
            label="相关图片"
            extra="最多上传5张图片，支持jpg、png格式"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建订单
              </Button>
              <Button onClick={() => navigate(-1)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;