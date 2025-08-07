# API 参考文档

## 📋 概述

本文档详细描述了XGX店内部维修下单管理系统的所有API接口，包括请求格式、响应格式、错误码等信息。

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **认证方式**: JWT Bearer Token
- **字符编码**: UTF-8

### 通用响应格式

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "code": 200
}
```

### 错误响应格式

```json
{
  "success": false,
  "error": "错误信息",
  "code": 400
}
```

## 🔐 认证接口

### 发送短信验证码

**接口地址**: `POST /auth/send-sms`

**请求参数**:
```json
{
  "phone": "13800000000"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号码，11位数字 |

**响应示例**:
```json
{
  "success": true,
  "message": "验证码发送成功",
  "data": {
    "phone": "13800000000",
    "expires_in": 300
  }
}
```

**错误码**:
- `400`: 手机号格式错误
- `429`: 发送频率过快
- `500`: 短信服务异常

### 用户登录

**接口地址**: `POST /auth/login`

**请求参数**:
```json
{
  "phone": "13800000000",
  "code": "123456",
  "password": "123456"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号码 |
| code | string | 否 | 短信验证码（验证码登录时必填） |
| password | string | 否 | 密码（密码登录时必填） |

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone": "13800000000",
      "name": "用户名",
      "role": "user",
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**错误码**:
- `400`: 参数错误
- `401`: 验证码错误或密码错误
- `404`: 用户不存在

### 获取当前用户信息

**接口地址**: `GET /auth/me`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800000000",
    "name": "用户名",
    "role": "user",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📋 订单接口

### 创建订单

**接口地址**: `POST /orders`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数**:
```json
{
  "device_type": "手机",
  "problem_description": "屏幕破裂，需要更换屏幕",
  "address": "北京市朝阳区xxx街道xxx号",
  "contact_name": "张三",
  "contact_phone": "13900000000",
  "preferred_time": "2024-01-01T10:00:00Z",
  "images": ["image_url1", "image_url2"]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| device_type | string | 是 | 设备类型 |
| problem_description | string | 是 | 问题描述 |
| address | string | 是 | 维修地址 |
| contact_name | string | 是 | 联系人姓名 |
| contact_phone | string | 是 | 联系人电话 |
| preferred_time | string | 否 | 期望维修时间（ISO 8601格式） |
| images | array | 否 | 问题图片URL数组 |

**响应示例**:
```json
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "id": "order_uuid",
    "order_number": "ORD20240101001",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 获取订单列表

**接口地址**: `GET /orders`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 订单状态筛选 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| user_id | string | 否 | 用户ID（管理员可用） |
| technician_id | string | 否 | 维修员ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_uuid",
        "order_number": "ORD20240101001",
        "device_type": "手机",
        "problem_description": "屏幕破裂",
        "status": "pending",
        "estimated_cost": 200.00,
        "final_cost": null,
        "address": "北京市朝阳区xxx街道xxx号",
        "contact_name": "张三",
        "contact_phone": "13900000000",
        "preferred_time": "2024-01-01T10:00:00Z",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_uuid",
          "name": "用户名",
          "phone": "13800000000"
        },
        "technician": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 获取订单详情

**接口地址**: `GET /orders/:id`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "order_uuid",
    "order_number": "ORD20240101001",
    "device_type": "手机",
    "problem_description": "屏幕破裂，需要更换屏幕",
    "status": "in_progress",
    "estimated_cost": 200.00,
    "final_cost": 180.00,
    "address": "北京市朝阳区xxx街道xxx号",
    "contact_name": "张三",
    "contact_phone": "13900000000",
    "preferred_time": "2024-01-01T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T02:00:00Z",
    "completed_at": null,
    "user": {
      "id": "user_uuid",
      "name": "用户名",
      "phone": "13800000000"
    },
    "technician": {
      "id": "tech_uuid",
      "name": "维修员001",
      "phone": "13800000002"
    },
    "images": [
      {
        "id": "img_uuid",
        "image_url": "https://example.com/image1.jpg",
        "image_type": "problem",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "logs": [
      {
        "id": "log_uuid",
        "action": "订单创建",
        "notes": "用户提交维修订单",
        "created_at": "2024-01-01T00:00:00Z",
        "user": {
          "name": "用户名"
        }
      }
    ],
    "feedback": null
  }
}
```

### 更新订单状态

**接口地址**: `PUT /orders/:id/status`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数**:
```json
{
  "status": "accepted",
  "notes": "已接单，预计2小时内到达",
  "estimated_cost": 200.00,
  "final_cost": 180.00,
  "images": ["repair_image_url1"]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 是 | 新状态：pending/accepted/in_progress/completed/cancelled |
| notes | string | 否 | 状态更新说明 |
| estimated_cost | number | 否 | 预估费用 |
| final_cost | number | 否 | 最终费用 |
| images | array | 否 | 相关图片URL数组 |

**响应示例**:
```json
{
  "success": true,
  "message": "订单状态更新成功",
  "data": {
    "id": "order_uuid",
    "status": "accepted",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

### 接单

**接口地址**: `POST /orders/:id/accept`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "message": "接单成功",
  "data": {
    "id": "order_uuid",
    "status": "accepted",
    "technician_id": "tech_uuid"
  }
}
```

## 👥 用户接口

### 获取用户列表

**接口地址**: `GET /users`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| role | string | 否 | 用户角色筛选 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| search | string | 否 | 搜索关键词（姓名或手机号） |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_uuid",
        "phone": "13800000000",
        "name": "用户名",
        "role": "user",
        "avatar_url": null,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "order_count": 5,
        "last_login": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 获取用户详情

**接口地址**: `GET /users/:id`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "user_uuid",
    "phone": "13800000000",
    "name": "用户名",
    "role": "user",
    "avatar_url": null,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "addresses": [
      {
        "id": "addr_uuid",
        "address": "北京市朝阳区xxx街道xxx号",
        "contact_name": "张三",
        "contact_phone": "13900000000",
        "is_default": true
      }
    ],
    "statistics": {
      "total_orders": 10,
      "completed_orders": 8,
      "cancelled_orders": 1,
      "average_rating": 4.5,
      "total_spent": 1500.00
    }
  }
}
```

### 更新用户信息

**接口地址**: `PUT /users/:id`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "新用户名",
  "avatar_url": "https://example.com/avatar.jpg",
  "is_active": true
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 用户姓名 |
| avatar_url | string | 否 | 头像URL |
| is_active | boolean | 否 | 是否激活（仅管理员可用） |

**响应示例**:
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "data": {
    "id": "user_uuid",
    "name": "新用户名",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

## 📤 文件上传接口

### 上传图片

**接口地址**: `POST /upload/image`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 图片文件（支持jpg, jpeg, png, gif格式，最大5MB）
- `type`: 图片类型（problem/repair/result/avatar）

**响应示例**:
```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "url": "https://example.com/uploads/image_uuid.jpg",
    "filename": "image_uuid.jpg",
    "size": 1024000,
    "type": "problem"
  }
}
```

**错误码**:
- `400`: 文件格式不支持或文件过大
- `413`: 文件大小超出限制
- `500`: 上传服务异常

## 💬 反馈接口

### 创建反馈

**接口地址**: `POST /feedbacks`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数**:
```json
{
  "order_id": "order_uuid",
  "rating": 5,
  "comment": "服务很好，维修及时专业"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 是 | 订单ID |
| rating | number | 是 | 评分（1-5） |
| comment | string | 否 | 评价内容 |

**响应示例**:
```json
{
  "success": true,
  "message": "反馈提交成功",
  "data": {
    "id": "feedback_uuid",
    "order_id": "order_uuid",
    "rating": 5,
    "comment": "服务很好，维修及时专业",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 获取反馈列表

**接口地址**: `GET /feedbacks`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order_id | string | 否 | 订单ID |
| user_id | string | 否 | 用户ID |
| rating | number | 否 | 评分筛选 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "id": "feedback_uuid",
        "order_id": "order_uuid",
        "rating": 5,
        "comment": "服务很好，维修及时专业",
        "created_at": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_uuid",
          "name": "用户名",
          "phone": "13800000000"
        },
        "order": {
          "id": "order_uuid",
          "order_number": "ORD20240101001",
          "device_type": "手机"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

## 📊 统计接口

### 获取仪表板统计

**接口地址**: `GET /statistics/dashboard`

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| period | string | 否 | 统计周期：today/week/month/year |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_orders": 1000,
      "pending_orders": 50,
      "completed_orders": 800,
      "total_revenue": 150000.00,
      "average_rating": 4.5,
      "active_users": 500,
      "active_technicians": 20
    },
    "trends": {
      "orders_by_day": [
        {"date": "2024-01-01", "count": 10},
        {"date": "2024-01-02", "count": 15}
      ],
      "revenue_by_day": [
        {"date": "2024-01-01", "amount": 2000.00},
        {"date": "2024-01-02", "amount": 3000.00}
      ]
    },
    "device_types": [
      {"type": "手机", "count": 500, "percentage": 50},
      {"type": "电脑", "count": 300, "percentage": 30}
    ],
    "technician_performance": [
      {
        "technician_id": "tech_uuid",
        "name": "维修员001",
        "completed_orders": 100,
        "average_rating": 4.8,
        "total_revenue": 15000.00
      }
    ]
  }
}
```

## 🚨 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 413 | 请求实体过大 |
| 422 | 请求参数验证失败 |
| 429 | 请求频率过快 |
| 500 | 服务器内部错误 |
| 502 | 网关错误 |
| 503 | 服务不可用 |

## 📝 使用示例

### JavaScript/Axios 示例

```javascript
// 设置默认配置
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 登录
const login = async (phone, code) => {
  try {
    const response = await api.post('/auth/login', { phone, code });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error) {
    console.error('登录失败:', error.response.data.error);
    throw error;
  }
};

// 创建订单
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  } catch (error) {
    console.error('创建订单失败:', error.response.data.error);
    throw error;
  }
};

// 获取订单列表
const getOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取订单列表失败:', error.response.data.error);
    throw error;
  }
};
```

### cURL 示例

```bash
# 发送验证码
curl -X POST http://localhost:3000/api/auth/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800000000"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800000000", "code": "123456"}'

# 创建订单
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "device_type": "手机",
    "problem_description": "屏幕破裂",
    "address": "北京市朝阳区xxx街道xxx号",
    "contact_name": "张三",
    "contact_phone": "13900000000"
  }'

# 获取订单列表
curl -X GET "http://localhost:3000/api/orders?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## 🔄 版本更新

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持用户认证、订单管理、文件上传等基础功能

---

**如有疑问或建议，请联系开发团队。**