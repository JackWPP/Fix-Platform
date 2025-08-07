import { App } from 'antd';

// 全局message实例
let messageApi: ReturnType<typeof App.useApp>['message'] | null = null;

// 设置message实例
export const setMessageApi = (api: ReturnType<typeof App.useApp>['message']) => {
  messageApi = api;
};

// 全局message方法
export const message = {
  success: (content: string) => {
    if (messageApi) {
      messageApi.success(content);
    } else {
      console.warn('Message API not initialized');
    }
  },
  error: (content: string) => {
    if (messageApi) {
      messageApi.error(content);
    } else {
      console.warn('Message API not initialized');
    }
  },
  warning: (content: string) => {
    if (messageApi) {
      messageApi.warning(content);
    } else {
      console.warn('Message API not initialized');
    }
  },
  info: (content: string) => {
    if (messageApi) {
      messageApi.info(content);
    } else {
      console.warn('Message API not initialized');
    }
  },
  loading: (content: string) => {
    if (messageApi) {
      return messageApi.loading(content);
    } else {
      console.warn('Message API not initialized');
      return () => {};
    }
  }
};