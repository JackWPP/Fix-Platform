import React, { useState } from 'react';
import { Badge, Button, Dropdown, List, Typography, Empty, Space, Divider } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../contexts/NotificationContext';

const { Text } = Typography;

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotification();
  const [visible, setVisible] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 小于1分钟
      return '刚刚';
    } else if (diff < 3600000) { // 小于1小时
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 小于1天
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_status_change':
        return '🔄';
      case 'order_assignment':
        return '📋';
      case 'new_order':
        return '🆕';
      case 'system_message':
        return '📢';
      default:
        return '📝';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_status_change':
        return '#1890ff';
      case 'order_assignment':
        return '#52c41a';
      case 'new_order':
        return '#faad14';
      case 'system_message':
        return '#722ed1';
      default:
        return '#8c8c8c';
    }
  };

  const notificationMenu = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>通知中心</Text>
          <Space>
            {unreadCount > 0 && (
              <Button 
                type="text" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
              >
                全部已读
              </Button>
            )}
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={clearNotifications}
            >
              清空
            </Button>
          </Space>
        </Space>
      </div>
      
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="暂无通知" 
            style={{ padding: '20px' }}
          />
        ) : (
          <List
            size="small"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  backgroundColor: item.read ? '#fff' : '#f6ffed',
                  borderLeft: `3px solid ${item.read ? 'transparent' : getNotificationColor(item.type)}`,
                  cursor: 'pointer'
                }}
                onClick={() => !item.read && markAsRead(item.id)}
              >
                <List.Item.Meta
                  avatar={
                    <span style={{ fontSize: '16px' }}>
                      {getNotificationIcon(item.type)}
                    </span>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text 
                        style={{ 
                          fontSize: '13px',
                          fontWeight: item.read ? 'normal' : 'bold'
                        }}
                      >
                        {item.message}
                      </Text>
                      {!item.read && (
                        <Badge 
                          status="processing" 
                          style={{ marginLeft: '8px' }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {formatTime(item.timestamp)}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              显示最近 {Math.min(notifications.length, 50)} 条通知
            </Text>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          style={{ 
            border: 'none',
            boxShadow: 'none',
            color: unreadCount > 0 ? '#1890ff' : '#8c8c8c'
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter;