import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Spin, message } from 'antd';
import OrderStatsChart from './OrderStatsChart';
import RepairmanStatsChart from './RepairmanStatsChart';
import CustomerSatisfactionChart from './CustomerSatisfactionChart';
import RevenueStatsChart from './RevenueStatsChart';
import { statsAPI } from '../../services/api';

const { TabPane } = Tabs;

const DashboardStats = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [statsData, setStatsData] = useState({
    orderStats: null,
    repairmanStats: null,
    satisfactionStats: null,
    revenueStats: null,
    dashboardData: null
  });

  // 获取统计数据
  const fetchStatsData = async (selectedPeriod = period) => {
    setLoading(true);
    try {
      const [orderData, repairmanData, satisfactionData, revenueData, dashboardData] = await Promise.all([
        statsAPI.getOrderStats(selectedPeriod),
        statsAPI.getRepairmanStats(selectedPeriod),
        statsAPI.getSatisfactionStats(selectedPeriod),
        statsAPI.getRevenueStats(selectedPeriod),
        statsAPI.getDashboardData(selectedPeriod)
      ]);

      setStatsData({
        orderStats: orderData.data,
        repairmanStats: repairmanData.data,
        satisfactionStats: satisfactionData.data,
        revenueStats: revenueData.data,
        dashboardData: dashboardData.data
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理时间周期变更
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchStatsData(newPeriod);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchStatsData();
  }, []);

  // 综合概览组件
  const OverviewDashboard = () => {
    const { dashboardData } = statsData;
    
    if (!dashboardData) {
      return <div>加载中...</div>;
    }

    const {
      totalOrders = 0,
      completedOrders = 0,
      totalRevenue = 0,
      avgRating = 0,
      activeRepairmen = 0,
      pendingOrders = 0,
      completionRate = 0,
      revenueGrowth = 0
    } = dashboardData;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                  {totalOrders}
                </div>
                <div style={{ color: '#666', fontSize: 16 }}>总订单数</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  最近{period}天
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                  {completedOrders}
                </div>
                <div style={{ color: '#666', fontSize: 16 }}>已完成订单</div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
                  完成率 {completionRate.toFixed(1)}%
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
                  ¥{totalRevenue.toLocaleString()}
                </div>
                <div style={{ color: '#666', fontSize: 16 }}>总收入</div>
                <div style={{ 
                  fontSize: 12, 
                  color: revenueGrowth >= 0 ? '#52c41a' : '#f5222d', 
                  marginTop: 4 
                }}>
                  {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth).toFixed(1)}%
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#722ed1' }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ color: '#666', fontSize: 16 }}>平均评分</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  满分5.0分
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#13c2c2' }}>
                  {activeRepairmen}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>活跃维修员</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                  {pendingOrders}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>待处理订单</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#eb2f96' }}>
                  {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>平均订单价值</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 快速图表预览 */}
        <Row gutter={16}>
          <Col span={12}>
            <Card title="订单状态概览" size="small">
              {statsData.orderStats && (
                <OrderStatsChart 
                  data={statsData.orderStats} 
                  onPeriodChange={handlePeriodChange}
                  period={period}
                  compact={true}
                />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="收入趋势概览" size="small">
              {statsData.revenueStats && (
                <RevenueStatsChart 
                  data={statsData.revenueStats} 
                  onPeriodChange={handlePeriodChange}
                  period={period}
                  compact={true}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#262626' }}>数据统计分析</h2>
        <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          实时监控平台运营数据，助力业务决策
        </p>
      </div>

      <Spin spinning={loading}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          style={{ background: 'white', padding: '16px', borderRadius: '8px' }}
        >
          <TabPane tab="综合概览" key="overview">
            <OverviewDashboard />
          </TabPane>
          
          <TabPane tab="订单统计" key="orders">
            {statsData.orderStats && (
              <OrderStatsChart 
                data={statsData.orderStats} 
                onPeriodChange={handlePeriodChange}
                period={period}
              />
            )}
          </TabPane>
          
          <TabPane tab="维修员绩效" key="repairmen">
            {statsData.repairmanStats && (
              <RepairmanStatsChart 
                data={statsData.repairmanStats} 
                onPeriodChange={handlePeriodChange}
                period={period}
              />
            )}
          </TabPane>
          
          <TabPane tab="客户满意度" key="satisfaction">
            {statsData.satisfactionStats && (
              <CustomerSatisfactionChart 
                data={statsData.satisfactionStats} 
                onPeriodChange={handlePeriodChange}
                period={period}
              />
            )}
          </TabPane>
          
          <TabPane tab="收入分析" key="revenue">
            {statsData.revenueStats && (
              <RevenueStatsChart 
                data={statsData.revenueStats} 
                onPeriodChange={handlePeriodChange}
                period={period}
              />
            )}
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default DashboardStats;