import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.notificationCallbacks = [];
  }

  // 连接到WebSocket服务器
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    // 监听通知消息
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      this.handleNotification(notification);
    });

    return this.socket;
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 处理接收到的通知
  handleNotification(notification) {
    // 调用所有注册的回调函数
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // 注册通知回调函数
  onNotification(callback) {
    this.notificationCallbacks.push(callback);
    
    // 返回取消注册的函数
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  // 发送消息到服务器
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // 监听服务器事件
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // 取消监听服务器事件
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;