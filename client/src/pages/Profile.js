import React from 'react';
import { Form, Input, Button, Typography, Card } from 'antd';

const { Title } = Typography;

const Profile = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };

  return (
    <div>
      <Title level={2}>个人中心</Title>
      <Card title="个人信息" style={{ width: '100%' }}>
        <Form
          form={form}
          name="profile"
          onFinish={onFinish}
          initialValues={{
            name: '张三',
            phone: '13800138000',
            email: 'zhangsan@example.com',
          }}
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存信息
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;