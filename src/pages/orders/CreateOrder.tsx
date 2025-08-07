import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Upload, message, Space, Radio } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { orderAPI, uploadAPI, handleAPIError } from '../../utils/api';
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
  const [serviceType, setServiceType] = useState<string>('');

  // 获取设备类型和服务类型
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [deviceResponse, serviceResponse] = await Promise.all([
          orderAPI.getDeviceTypes(),
          orderAPI.getServiceTypes()
        ]);
        
        if (deviceResponse.data?.success) {
          setDeviceTypes(deviceResponse.data.data.device_types || []);
        }
        
        if (serviceResponse.data?.success) {
          setServiceTypes(serviceResponse.data.data.service_types || []);
        }
      } catch (error) {
        console.error('获取元数据失败:', error);
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
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="device_type"
              label="设备类型"
              rules={[{ required: true, message: '请选择设备类型' }]}
            >
              <Select placeholder="请选择设备类型">
                <Option value="笔记本电脑">笔记本电脑</Option>
                <Option value="台式电脑">台式电脑</Option>
                <Option value="手机">手机</Option>
                <Option value="平板电脑">平板电脑</Option>
                <Option value="其他">其他</Option>
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
            <Radio.Group onChange={(e) => setServiceType(e.target.value)}>
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
              <Select placeholder="请选择预约服务类型">
                <Option value="cleaning">清洁保养</Option>
                <Option value="screen_replacement">屏幕更换</Option>
                <Option value="battery_replacement">电池更换</Option>
                <Option value="system_reinstall">系统重装</Option>
                <Option value="software_install">软件安装</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="liquid_metal"
            label="是否需要液态金属"
          >
            <Radio.Group>
              <Radio value="yes">是</Radio>
              <Radio value="no">否</Radio>
              <Radio value="uncertain">不确定</Radio>
            </Radio.Group>
          </Form.Item>

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

          <Form.Item
            name="problem_description"
            label="问题描述"
          >
            <TextArea
              rows={4}
              placeholder="请详细描述设备问题"
            />
          </Form.Item>

          <Form.Item
            name="issue_description"
            label="故障现象"
          >
            <TextArea
              rows={3}
              placeholder="请描述具体的故障现象"
            />
          </Form.Item>

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