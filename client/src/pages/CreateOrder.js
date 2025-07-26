import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, message, DatePicker, Radio, Upload, Divider } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateOrder = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('repair'); // 'repair' 或 'appointment'
  const [appointmentService, setAppointmentService] = useState(''); // 选择的预约服务类型
  const [fileList, setFileList] = useState([]);

  const deviceTypes = [
    '手机',
    '电脑/笔记本',
    '平板电脑',
    '智能手表',
    '耳机/音响',
    '游戏设备',
    '其他电子设备'
  ];

  const serviceTypes = [
    { label: '维修服务', value: 'repair' },
    { label: '预约服务', value: 'appointment' }
  ];

  const appointmentServices = [
    { label: '清灰', value: 'cleaning' },
    { label: '换屏', value: 'screen_replacement' },
    { label: '换电池', value: 'battery_replacement' },
    { label: '系统重装', value: 'system_reinstall' },
    { label: '软件安装', value: 'software_install' }
  ];

  const urgencyLevels = [
    { label: '普通（3-5个工作日）', value: 'normal' },
    { label: '加急（1-2个工作日）', value: 'urgent' },
    { label: '特急（当天处理）', value: 'emergency' }
  ];

  const liquidMetalOptions = [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
    { label: '不确定', value: 'uncertain' }
  ];

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    setAppointmentService(''); // 清空预约服务选择
    // 清空相关字段
    form.setFieldsValue({
      problemDescription: undefined,
      appointmentService: undefined,
      liquidMetal: undefined
    });
  };

  const handleAppointmentServiceChange = (value) => {
    setAppointmentService(value);
    // 如果不是清灰服务，清空液态金属选项
    if (value !== 'cleaning') {
      form.setFieldsValue({
        liquidMetal: undefined
      });
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB！');
      return false;
    }
    return false; // 阻止自动上传，只做本地预览
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 这里可以调用API提交订单
      const orderData = {
        ...values,
        serviceType,
        images: fileList.map(file => file.originFileObj || file)
      };
      console.log('订单信息:', orderData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const serviceTypeName = serviceType === 'repair' ? '维修' : '预约';
      message.success(`${serviceTypeName}订单提交成功！我们会尽快联系您。`);
      
      // 跳转到订单页面
      setTimeout(() => {
        history.push('/orders');
      }, 1500);
      
    } catch (error) {
      message.error('订单提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.goBack();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>创建服务订单</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            serviceType: 'repair',
            urgency: 'normal'
          }}
        >
          <Form.Item
            label="服务类型"
            name="serviceType"
            rules={[{ required: true, message: '请选择服务类型' }]}
          >
            <Radio.Group onChange={(e) => handleServiceTypeChange(e.target.value)} value={serviceType}>
              {serviceTypes.map(type => (
                <Radio key={type.value} value={type.value}>
                  {type.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Divider />
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select placeholder="请选择需要维修的设备类型">
              {deviceTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="设备品牌/型号"
            name="deviceModel"
            rules={[{ required: true, message: '请输入设备品牌和型号' }]}
          >
            <Input placeholder="例如：iPhone 14 Pro、MacBook Air M2" />
          </Form.Item>

          {serviceType === 'appointment' && (
            <Form.Item
              label="预约服务"
              name="appointmentService"
              rules={[{ required: true, message: '请选择预约服务类型' }]}
            >
              <Select 
                placeholder="请选择需要预约的服务"
                onChange={handleAppointmentServiceChange}
              >
                {appointmentServices.map(service => (
                  <Option key={service.value} value={service.value}>{service.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {serviceType === 'appointment' && appointmentService === 'cleaning' && (
            <Form.Item
              label="是否为液态金属机型"
              name="liquidMetal"
              rules={[{ required: true, message: '请选择是否为液态金属机型' }]}
            >
              <Radio.Group>
                {liquidMetalOptions.map(option => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          )}

          {serviceType === 'repair' && (
            <Form.Item
              label="故障描述"
              name="problemDescription"
              rules={[{ required: true, message: '请详细描述遇到的问题' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请详细描述设备出现的问题，包括故障现象、发生时间等" 
              />
            </Form.Item>
          )}

          <Form.Item
            label="图片上传"
            name="images"
            extra="支持上传故障图片或设备照片，有助于我们更好地了解问题（可选）"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              multiple
            >
              {fileList.length >= 6 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item
            label="紧急程度"
            name="urgency"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Radio.Group>
              {urgencyLevels.map(level => (
                <Radio key={level.value} value={level.value}>
                  {level.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="联系人姓名"
            name="contactName"
            rules={[{ required: true, message: '请输入联系人姓名' }]}
          >
            <Input placeholder="请输入您的姓名" />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contactPhone"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入您的手机号码" />
          </Form.Item>

          <Form.Item
            label="预约时间"
            name="appointmentTime"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <DatePicker 
              showTime 
              placeholder="请选择您方便的时间" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="备注信息"
            name="remarks"
          >
            <TextArea 
              rows={2} 
              placeholder="其他需要说明的信息（选填）" 
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交订单
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;