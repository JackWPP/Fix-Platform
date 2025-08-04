import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, Row, Col, Select, Statistic, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Option } = Select;

// 服务类型颜色映射
const SERVICE_COLORS = {
  '家电维修': '#1890ff',
  '电脑维修': '#52c41a',
  '手机维修': '#faad14',
  '其他维修': '#722ed1'
};

const RevenueStatsChart = ({ data, onPeriodChange, period }) => {
  if (!data) {
    return <div>加载中...</div>;
  }

  const {
    totalRevenue = 0,
    revenueByService = [],
    dailyRevenue = [],
    monthlyRevenue = [],
    revenueGrowth = 0
  } = data;

  // 处理服务类型收入数据
  const serviceRevenueData = revenueByService.map(item => ({
    service: item._id,
    revenue: item.totalRevenue,
    orders: item.orderCount,
    avgOrderValue: item.totalRevenue / item.orderCount,
    color: SERVICE_COLORS[item._id] || '#8884d8'
  }));

  // 处理日收入趋势数据
  const dailyTrendData = dailyRevenue.map(item => ({
    date: item._id,
    revenue: item.totalRevenue,
    orders: item.orderCount,
    avgOrderValue: item.totalRevenue / item.orderCount
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // 处理月收入数据
  const monthlyTrendData = monthlyRevenue.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    revenue: item.totalRevenue,
    orders: item.orderCount,
    avgOrderValue: item.totalRevenue / item.orderCount
  })).sort((a, b) => new Date(a.month) - new Date(b.month));

  // 计算统计数据
  const totalOrders = serviceRevenueData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const highestRevenueService = serviceRevenueData.reduce((max, item) => 
    item.revenue > max.revenue ? item : max, serviceRevenueData[0] || { service: '暂无', revenue: 0 }
  );

  // 计算增长趋势
  const getGrowthColor = (growth) => {
    if (growth > 0) return '#52c41a';
    if (growth < 0) return '#f5222d';
    return '#faad14';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUpOutlined />;
    if (growth < 0) return <ArrowDownOutlined />;
    return null;
  };

  // 格式化货币
  const formatCurrency = (value) => {
    return `¥${value.toLocaleString()}`;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, service }) => {
    if (percent < 0.05) return null;
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
        <h3>收入统计分析</h3>
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
            <Statistic
              title="总收入"
              value={totalRevenue}
              precision={2}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              prefix="¥"
              suffix={
                <span style={{ fontSize: 14, color: getGrowthColor(revenueGrowth) }}>
                  {getGrowthIcon(revenueGrowth)} {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={totalOrders}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均订单价值"
              value={avgOrderValue}
              precision={2}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>最高收入服务</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>
                {highestRevenueService.service}
              </div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                {formatCurrency(highestRevenueService.revenue)}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 收入趋势图 */}
        <Col span={16}>
          <Card title="收入趋势" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tickFormatter={(value) => `¥${value}`}
                />
                <Tooltip 
                  labelFormatter={(value) => `日期: ${new Date(value).toLocaleDateString()}`}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value), '收入'];
                    if (name === 'orders') return [value, '订单数'];
                    if (name === 'avgOrderValue') return [formatCurrency(value), '平均订单价值'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="avgOrderValue"
                  stroke="#52c41a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 服务类型收入分布 */}
        <Col span={8}>
          <Card title="服务类型收入分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {serviceRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    formatCurrency(value),
                    '收入'
                  ]}
                  labelFormatter={(label) => `服务类型: ${label}`}
                />
                <Legend 
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {entry.payload.service} ({formatCurrency(entry.payload.revenue)})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 服务类型详细分析 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="各服务类型收入对比" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis tickFormatter={(value) => `¥${value}`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value), '收入'];
                    if (name === 'orders') return [value, '订单数'];
                    if (name === 'avgOrderValue') return [formatCurrency(value), '平均订单价值'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="收入">
                  {serviceRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="平均订单价值对比" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRevenueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `¥${value}`} />
                <YAxis dataKey="service" type="category" width={80} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '平均订单价值']}
                  labelFormatter={(label) => `服务类型: ${label}`}
                />
                <Bar dataKey="avgOrderValue">
                  {serviceRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 月度收入趋势 */}
      {monthlyTrendData.length > 0 && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="月度收入趋势" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `¥${value}`} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return [formatCurrency(value), '收入'];
                      if (name === 'orders') return [value, '订单数'];
                      if (name === 'avgOrderValue') return [formatCurrency(value), '平均订单价值'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `月份: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    strokeWidth={3}
                    dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                    name="收入"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                    name="订单数"
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default RevenueStatsChart;