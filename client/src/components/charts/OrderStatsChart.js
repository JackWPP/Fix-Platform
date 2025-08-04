import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Card, Row, Col, Select } from 'antd';

const { Option } = Select;

// 状态颜色映射
const STATUS_COLORS = {
  pending: '#faad14',
  confirmed: '#1890ff',
  in_progress: '#52c41a',
  completed: '#389e0d',
  cancelled: '#f5222d'
};

// 服务类型颜色
const SERVICE_TYPE_COLORS = {
  repair: '#1890ff',
  appointment: '#52c41a'
};

// 紧急程度颜色
const URGENCY_COLORS = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#f5222d'
};

const OrderStatsChart = ({ data, onPeriodChange, period }) => {
  if (!data) {
    return <div>加载中...</div>;
  }

  const {
    statusStats = [],
    serviceTypeStats = [],
    urgencyStats = [],
    dailyTrend = [],
    summary = {}
  } = data;

  // 处理状态统计数据
  const statusData = statusStats.map(item => ({
    name: getStatusText(item._id),
    value: item.count,
    color: STATUS_COLORS[item._id] || '#8884d8'
  }));

  // 处理服务类型数据
  const serviceTypeData = serviceTypeStats.map(item => ({
    name: getServiceTypeText(item._id),
    value: item.count,
    color: SERVICE_TYPE_COLORS[item._id] || '#8884d8'
  }));

  // 处理紧急程度数据
  const urgencyData = urgencyStats.map(item => ({
    name: getUrgencyText(item._id),
    value: item.count,
    color: URGENCY_COLORS[item._id] || '#8884d8'
  }));

  // 处理每日趋势数据
  const trendData = dailyTrend.map(item => ({
    date: `${item._id.month}/${item._id.day}`,
    count: item.count
  }));

  function getStatusText(status) {
    const statusMap = {
      pending: '待处理',
      confirmed: '已确认',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  }

  function getServiceTypeText(type) {
    const typeMap = {
      repair: '维修服务',
      appointment: '预约服务'
    };
    return typeMap[type] || type;
  }

  function getUrgencyText(urgency) {
    const urgencyMap = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return urgencyMap[urgency] || urgency;
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // 小于5%不显示标签
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>订单统计分析</h3>
        <Select 
          value={period} 
          onChange={onPeriodChange}
          style={{ width: 120 }}
        >
          <Option value="7">最近7天</Option>
          <Option value="30">最近30天</Option>
          <Option value="90">最近90天</Option>
        </Select>
      </div>

      {/* 概览卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {summary.totalOrders || 0}
              </div>
              <div style={{ color: '#666' }}>总订单数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {summary.completedOrders || 0}
              </div>
              <div style={{ color: '#666' }}>已完成订单</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {summary.completionRate || 0}%
              </div>
              <div style={{ color: '#666' }}>完成率</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {Math.round((summary.totalOrders || 0) / (period === '7' ? 7 : period === '30' ? 30 : 90))}
              </div>
              <div style={{ color: '#666' }}>日均订单</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 订单状态分布 */}
        <Col span={12}>
          <Card title="订单状态分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 服务类型分布 */}
        <Col span={12}>
          <Card title="服务类型分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* 紧急程度分布 */}
        <Col span={12}>
          <Card title="紧急程度分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 订单趋势 */}
        <Col span={12}>
          <Card title="订单趋势" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderStatsChart;