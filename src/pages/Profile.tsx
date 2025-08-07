import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Upload } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { userAPI, handleAPIError } from '../utils/api';
import type { UploadProps } from 'antd';

interface ProfileForm {
  name: string;
  phone: string;
  avatar?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm<ProfileForm>();
  const [passwordForm] = Form.useForm<PasswordForm>();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        phone: user.phone,
      });
      setAvatarUrl('');
    }
  }, [user, profileForm]);

  // 更新个人信息
  const handleUpdateProfile = async (values: ProfileForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await userAPI.updateUser(user.id, {
        ...values,
      });
      
      if (response.data?.success) {
        message.success('个人信息更新成功');
        updateUser({
          ...user,
          name: values.name,
          phone: values.phone,
        });
        setEditing(false);
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

  // 修改密码
  const handleChangePassword = async (values: PasswordForm) => {
    setPasswordLoading(true);
    try {
      const response = await userAPI.changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      if (response.data?.success) {
        message.success('密码修改成功');
        passwordForm.resetFields();
      } else {
        const error = handleAPIError(response);
        message.error(error.message);
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      message.error(apiError.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // 头像上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        if (info.file.response?.success) {
          setAvatarUrl(info.file.response.data.url);
          message.success('头像上传成功');
        } else {
          message.error('头像上传失败');
        }
      } else if (info.file.status === 'error') {
        message.error('头像上传失败');
      }
    },
  };

  // 角色名称
  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      'admin': '管理员',
      'customer_service': '客服',
      'repairman': '维修员',
      'user': '用户',
    };
    return names[role] || role;
  };

  if (!user) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>请先登录</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* 个人信息卡片 */}
      <Card
        title="个人信息"
        extra={
          <Button
            type={editing ? 'default' : 'primary'}
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => {
              if (editing) {
                profileForm.submit();
              } else {
                setEditing(true);
              }
            }}
            loading={loading}
          >
            {editing ? '保存' : '编辑'}
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {/* 头像部分 */}
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            {editing && (
              <Upload {...uploadProps} showUploadList={false}>
                <Button icon={<UploadOutlined />} size="small">
                  更换头像
                </Button>
              </Upload>
            )}
          </div>
          
          {/* 表单部分 */}
          <div style={{ flex: 1 }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editing}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
              
              <Form.Item label="角色">
                <Input value={getRoleName(user.role)} disabled />
              </Form.Item>
              
              <Form.Item label="用户ID">
                <Input value={user.id} disabled />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>

      {/* 修改密码卡片 */}
      <Card title="修改密码">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={passwordLoading}
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;