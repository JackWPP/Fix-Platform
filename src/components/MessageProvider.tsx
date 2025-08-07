import React, { useEffect } from 'react';
import { App } from 'antd';
import { setMessageApi } from '../utils/message';

interface MessageProviderProps {
  children: React.ReactNode;
}

const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { message } = App.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return <>{children}</>;
};

export default MessageProvider;