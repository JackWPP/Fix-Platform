import React, { createContext, useContext, useState, useEffect } from 'react';
import { notification } from 'antd';
import socketService from '../services/socketService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 注册通知回调
    const unsubscribe = socketService.onNotification((notificationData) => {
      handleNewNotification(notificationData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNewNotification = (notificationData) => {
    // 添加到通知列表
    const newNotification = {
      ...notificationData,
      id: Date.now() + Math.random(),
      read: false,
      timestamp: notificationData.timestamp || new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // 保持最多50条通知
    setUnreadCount(prev => prev + 1);

    // 显示Ant Design通知
    showAntdNotification(notificationData);
  };

  const showAntdNotification = (notificationData) => {
    const { type, message, orderId } = notificationData;
    
    let notificationType = 'info';
    let title = '系统通知';
    
    switch (type) {
      case 'order_status_change':
        notificationType = 'info';
        title = '订单状态更新';
        break;
      case 'order_assignment':
        notificationType = 'success';
        title = '新订单分配';
        break;
      case 'new_order':
        notificationType = 'warning';
        title = '新订单创建';
        break;
      case 'system_message':
        notificationType = 'info';
        title = '系统消息';
        break;
      default:
        notificationType = 'info';
    }

    notification[notificationType]({
      message: title,
      description: message,
      duration: 4.5,
      placement: 'topRight',
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;