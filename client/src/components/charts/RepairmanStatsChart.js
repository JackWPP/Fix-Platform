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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, Row, Col, Select, Table, Rate } from 'antd';

const { Option } = Select;

// 评分颜色映射
const RATING_COLORS = ['#f5222d', '#fa541c', '#faad14', '#52c41a', '#1890ff'];

const RepairmanStatsChart = ({ data, onPeriodChange, period }) => {
  if (!data) {
    return <div>加载中...</div>;
  }

  const {
    repairmanWorkload = [],
    ratingDistribution = []
  } = data;

  // 处理维修员工作量数据
  const workloadData = repairmanWorkload.map(item => ({
    name: item.name || item.phone,
    totalOrders: item.totalOrders,
    completedOrders: item.completedOrders,
    inProgressOrders: item.inProgressOrders,
    completionRate: parseFloat(item.completionRate?.toFixed(2) || 0),
    avgRating: parseFloat(item.avgRating?.toFixed(2) || 0)
  }));

  // 处理评分分布数据
  const ratingData = ratingDistribution.map(item => ({
    rating: `${item._id}星`,
    count: item.count,
    color: RATING_COLORS[item._id - 1] || '#8884d8'
  }));

  // 维修员表格列定义
  const columns = [
    {
      title: '维修员',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => text || record.phone
    },
    {
      title: '总订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      sortDirections: ['descend', 'ascend']
    },
    {
      title: '已完成',
      dataIndex: 'completedOrders',
      key: 'completedOrders',
      sorter: (a, b) => a.completedOrders - b.completedOrders
    },
    {
      title: '进行中',
      dataIndex: 'inProgressOrders',
      key: 'inProgressOrders',
      sorter: (a, b) => a.inProgressOrders - b.inProgressOrders
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.completionRate - b.completionRate
    },
    {
      title: '平均评分',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (rating) => rating > 0 ? <Rate disabled defaultValue={rating} allowHalf /> : '暂无评分',
      sorter: (a, b) => a.avgRating - b.avgRating
    }
  ];

  // 计算统计数据
  const totalRepairmen = repairmanWorkload.length;
  const totalAssignedOrders = repairmanWorkload.reduce((sum, item) => sum + item.totalOrders, 0);
  const avgCompletionRate = totalRepairmen > 0 
    ? (repairmanWorkload.reduce((sum, item) => sum + item.completionRate, 0) / totalRepairmen).toFixed(2)
    : 0;
  const avgRating = repairmanWorkload.filter(item => item.avgRating > 0).length > 0
    ? (repairmanWorkload.reduce((sum, item) => sum + (item.avgRating || 0), 0) / repairmanWorkload.filter(item => item.avgRating > 0).length).toFixed(2)
    : 0;

  // 准备雷达图数据
  const radarData = workloadData.slice(0, 5).map(item => ({
    name: item.name,
    订单数量: (item.totalOrders / Math.max(...workloadData.map(d => d.totalOrders))) * 100,
    完成率: item.completionRate,
    评分: (item.avgRating / 5) * 100
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
        <h3>维修员绩效统计</h3>
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
                {totalRepairmen}
              </div>
              <div style={{ color: '#666' }}>活跃维修员</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {totalAssignedOrders}
              </div>
              <div style={{ color: '#666' }}>分配订单总数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {avgCompletionRate}%
              </div>
              <div style={{ color: '#666' }}>平均完成率</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {avgRating}
              </div>
              <div style={{ color: '#666' }}>平均评分</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 维修员工作量对比 */}
        <Col span={16}>
          <Card title="维修员工作量对比" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalOrders" fill="#1890ff" name="总订单" />
                <Bar dataKey="completedOrders" fill="#52c41a" name="已完成" />
                <Bar dataKey="inProgressOrders" fill="#faad14" name="进行中" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 评分分布 */}
        <Col span={8}>
          <Card title="评分分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 维修员综合能力雷达图 */}
      {radarData.length > 0 && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="维修员综合能力对比（前5名）" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="订单数量"
                    dataKey="订单数量"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="完成率"
                    dataKey="完成率"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="评分"
                    dataKey="评分"
                    stroke="#faad14"
                    fill="#faad14"
                    fillOpacity={0.1}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 维修员详细数据表格 */}
          <Col span={12}>
            <Card title="维修员详细数据" style={{ height: 400 }}>
              <Table
                columns={columns}
                dataSource={workloadData}
                rowKey={(record, index) => index}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false
                }}
                size="small"
                scroll={{ y: 240 }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default RepairmanStatsChart;