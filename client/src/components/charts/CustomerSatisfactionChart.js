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
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Card, Row, Col, Select, Progress, Rate } from 'antd';
import { SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';

const { Option } = Select;

// 满意度颜色映射
const SATISFACTION_COLORS = {
  1: '#f5222d', // 非常不满意
  2: '#fa541c', // 不满意
  3: '#faad14', // 一般
  4: '#52c41a', // 满意
  5: '#1890ff'  // 非常满意
};

// 满意度标签映射
const SATISFACTION_LABELS = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意'
};

const CustomerSatisfactionChart = ({ data, onPeriodChange, period }) => {
  if (!data) {
    return <div>加载中...</div>;
  }

  const {
    ratingDistribution = [],
    avgRatingByService = [],
    satisfactionTrend = []
  } = data;

  // 处理评分分布数据
  const ratingData = ratingDistribution.map(item => ({
    rating: item._id,
    label: SATISFACTION_LABELS[item._id],
    count: item.count,
    percentage: 0, // 将在下面计算
    color: SATISFACTION_COLORS[item._id]
  }));

  // 计算百分比
  const totalRatings = ratingData.reduce((sum, item) => sum + item.count, 0);
  ratingData.forEach(item => {
    item.percentage = totalRatings > 0 ? ((item.count / totalRatings) * 100).toFixed(1) : 0;
  });

  // 处理服务类型满意度数据
  const serviceData = avgRatingByService.map(item => ({
    service: item._id,
    avgRating: parseFloat(item.avgRating?.toFixed(2) || 0),
    count: item.count
  }));

  // 处理满意度趋势数据
  const trendData = satisfactionTrend.map(item => ({
    date: item._id,
    avgRating: parseFloat(item.avgRating?.toFixed(2) || 0),
    count: item.count
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // 计算统计数据
  const overallRating = totalRatings > 0 
    ? (ratingData.reduce((sum, item) => sum + (item.rating * item.count), 0) / totalRatings).toFixed(2)
    : 0;
  
  const satisfiedCount = ratingData.filter(item => item.rating >= 4).reduce((sum, item) => sum + item.count, 0);
  const satisfactionRate = totalRatings > 0 ? ((satisfiedCount / totalRatings) * 100).toFixed(1) : 0;
  
  const dissatisfiedCount = ratingData.filter(item => item.rating <= 2).reduce((sum, item) => sum + item.count, 0);
  const dissatisfactionRate = totalRatings > 0 ? ((dissatisfiedCount / totalRatings) * 100).toFixed(1) : 0;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, label }) => {
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

  // 获取满意度图标
  const getSatisfactionIcon = (rating) => {
    if (rating >= 4) return <SmileOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
    if (rating >= 3) return <MehOutlined style={{ color: '#faad14', fontSize: 24 }} />;
    return <FrownOutlined style={{ color: '#f5222d', fontSize: 24 }} />;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>客户满意度分析</h3>
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
              <div style={{ marginBottom: 8 }}>
                {getSatisfactionIcon(overallRating)}
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {overallRating}
              </div>
              <div style={{ color: '#666' }}>总体评分</div>
              <Rate disabled defaultValue={parseFloat(overallRating)} allowHalf style={{ fontSize: 16, marginTop: 4 }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {satisfactionRate}%
              </div>
              <div style={{ color: '#666' }}>满意度</div>
              <Progress 
                percent={parseFloat(satisfactionRate)} 
                strokeColor="#52c41a" 
                showInfo={false} 
                style={{ marginTop: 8 }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>4-5星评价占比</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                {dissatisfactionRate}%
              </div>
              <div style={{ color: '#666' }}>不满意度</div>
              <Progress 
                percent={parseFloat(dissatisfactionRate)} 
                strokeColor="#f5222d" 
                showInfo={false} 
                style={{ marginTop: 8 }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>1-2星评价占比</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {totalRatings}
              </div>
              <div style={{ color: '#666' }}>评价总数</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 评分分布饼图 */}
        <Col span={12}>
          <Card title="评分分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}个 (${props.payload.percentage}%)`,
                    props.payload.label
                  ]}
                />
                <Legend 
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {SATISFACTION_LABELS[entry.payload.rating]} ({entry.payload.count}个)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 各服务类型满意度 */}
        <Col span={12}>
          <Card title="各服务类型满意度" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="service" type="category" width={80} />
                <Tooltip 
                  formatter={(value, name) => [`${value}分`, '平均评分']}
                  labelFormatter={(label) => `服务类型: ${label}`}
                />
                <Bar 
                  dataKey="avgRating" 
                  fill={(entry) => {
                    const rating = Math.round(entry.avgRating);
                    return SATISFACTION_COLORS[rating] || '#8884d8';
                  }}
                >
                  {serviceData.map((entry, index) => {
                    const rating = Math.round(entry.avgRating);
                    return <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[rating] || '#8884d8'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 满意度趋势 */}
      {trendData.length > 0 && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="满意度趋势" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return `日期: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    formatter={(value, name) => [
                      `${value}分`,
                      name === 'avgRating' ? '平均评分' : name
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#1890ff"
                    strokeWidth={3}
                    dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CustomerSatisfactionChart;