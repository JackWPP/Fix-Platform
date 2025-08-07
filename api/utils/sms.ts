import Core from '@alicloud/pop-core';

// 阿里云SMS API响应接口
interface SMSResponse {
  Code: string;
  Message?: string;
  RequestId?: string;
  BizId?: string;
}

// 只在生产环境或配置了阿里云密钥时初始化客户端
let client: Core | null = null;

if (process.env.NODE_ENV === 'production' && 
    process.env.ALIBABA_CLOUD_ACCESS_KEY_ID && 
    process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET) {
  client = new Core({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });
}

const SIGN_NAME = process.env.SMS_SIGN_NAME || 'XGX维修店';
const TEMPLATE_CODE = process.env.SMS_TEMPLATE_CODE || 'SMS_123456789';

// 发送短信验证码
export const sendSMS = async (phone: string, code: string): Promise<boolean> => {
  try {
    // 在开发环境中，直接返回成功，不实际发送短信
    if (process.env.NODE_ENV === 'development') {
      console.log(`[开发模式] 发送验证码到 ${phone}: ${code}`);
      return true;
    }

    const params = {
      PhoneNumbers: phone,
      SignName: SIGN_NAME,
      TemplateCode: TEMPLATE_CODE,
      TemplateParam: JSON.stringify({ code })
    };

    const requestOption = {
      method: 'POST'
    };

    if (!client) {
      throw new Error('SMS client not initialized');
    }

    const result = await client.request('SendSms', params, requestOption) as SMSResponse;
    
    if (result.Code === 'OK') {
      console.log(`短信发送成功: ${phone}`);
      return true;
    } else {
      console.error(`短信发送失败: ${result.Message}`);
      return false;
    }
  } catch (error) {
    console.error('短信发送异常:', error);
    return false;
  }
};

// 发送订单通知短信
export const sendOrderNotification = async (
  phone: string, 
  templateType: 'order_created' | 'order_assigned' | 'order_completed',
  params: Record<string, string>
): Promise<boolean> => {
  try {
    // 在开发环境中，直接返回成功
    if (process.env.NODE_ENV === 'development') {
      console.log(`[开发模式] 发送${templateType}通知到 ${phone}:`, params);
      return true;
    }

    // 根据模板类型选择不同的模板代码
    let templateCode = '';
    switch (templateType) {
      case 'order_created':
        templateCode = process.env.SMS_TEMPLATE_ORDER_CREATED || 'SMS_ORDER_CREATED';
        break;
      case 'order_assigned':
        templateCode = process.env.SMS_TEMPLATE_ORDER_ASSIGNED || 'SMS_ORDER_ASSIGNED';
        break;
      case 'order_completed':
        templateCode = process.env.SMS_TEMPLATE_ORDER_COMPLETED || 'SMS_ORDER_COMPLETED';
        break;
      default:
        throw new Error('Unknown template type');
    }

    const smsParams = {
      PhoneNumbers: phone,
      SignName: SIGN_NAME,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify(params)
    };

    const requestOption = {
      method: 'POST'
    };

    if (!client) {
      throw new Error('SMS client not initialized');
    }

    const result = await client.request('SendSms', smsParams, requestOption) as SMSResponse;
    
    if (result.Code === 'OK') {
      console.log(`订单通知短信发送成功: ${phone}`);
      return true;
    } else {
      console.error(`订单通知短信发送失败: ${result.Message}`);
      return false;
    }
  } catch (error) {
    console.error('订单通知短信发送异常:', error);
    return false;
  }
};

// 验证手机号格式
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 格式化手机号（隐藏中间4位）
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone.length !== 11) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};