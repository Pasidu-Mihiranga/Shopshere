// src/components/ShopOwnerDashboard/Analytics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

const Analytics = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [salesData, setSalesData] = useState({});
  const [productsData, setProductsData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/analytics?timeFrame=${timeFrame}`);
        
        setSalesData(response.data.sales);
        setProductsData(response.data.products);
        setCategoryData(response.data.categories);
        
        setError('');
      } catch (error) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeFrame]);
  
  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };
  
  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;
  
  // Generate labels for sales chart based on time frame
  const generateLabels = () => {
    const labels = [];
    const today = new Date();
    
    if (timeFrame === 'week') {
      for (let i = 6; i >= 0; i--) {
        labels.push(format(subDays(today, i), 'EEE'));
      }
    } else if (timeFrame === 'month') {
      for (let i = 29; i >= 0; i--) {
        labels.push(format(subDays(today, i), 'dd'));
      }
    } else if (timeFrame === 'year') {
      for (let i = 0; i < 12; i++) {
        labels.push(format(new Date(today.getFullYear(), i, 1), 'MMM'));
      }
    }
    
    return labels;
  };
  
  // Sales chart data
  const salesChartData = {
    labels: generateLabels(),
    datasets: [
      {
        label: 'Sales Amount ($)',
        data: salesData.amount || [],
        borderColor: '#F15A24',
        backgroundColor: 'rgba(241, 90, 36, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Orders Count',
        data: salesData.count || [],
        borderColor: '#333',
        backgroundColor: 'rgba(51, 51, 51, 0.2)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };
  
  const salesChartOptions = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        ticks: {
          beginAtZero: true,
          callback: (value) => `$${value}`
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: {
          beginAtZero: true
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };
  
  // Top products chart data
  const productChartData = {
    labels: productsData.names || [],
    datasets: [
      {
        label: 'Units Sold',
        data: productsData.quantities || [],
        backgroundColor: [
          '#F15A24',
          '#FF9D5C',
          '#FFC999',
          '#FFE5CC',
          '#333333'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Category distribution chart data
  const categoryChartData = {
    labels: categoryData.names || [],
    datasets: [
      {
        data: categoryData.percentages || [],
        backgroundColor: [
          '#F15A24',
          '#FF7F32',
          '#FF9D5C',
          '#FFB380',
          '#FFC999',
          '#FFD6B3',
          '#FFE5CC'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Shop Analytics</h2>
        <div className="time-frame-selector">
          <label>Time Frame:</label>
          <select value={timeFrame} onChange={handleTimeFrameChange}>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">${salesData.totalAmount?.toFixed(2) || 0}</p>
          <p className="stat-comparison">
            {salesData.percentChange >= 0 ? '+' : ''}
            {salesData.percentChange?.toFixed(2) || 0}% vs previous period
          </p>
        </div>
        <div className="stat-card">
          <h3>Orders</h3>
          <p className="stat-value">{salesData.totalOrders || 0}</p>
          <p className="stat-comparison">
            Avg. ${salesData.averageOrderValue?.toFixed(2) || 0} per order
          </p>
        </div>
        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <p className="stat-value">{salesData.conversionRate?.toFixed(2) || 0}%</p>
          <p className="stat-comparison">
            From {salesData.totalVisits || 0} shop visits
          </p>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Sales Trend</h3>
        <Line data={salesChartData} options={salesChartOptions} />
      </div>
      
      <div className="charts-row">
        <div className="chart-container">
          <h3>Top Selling Products</h3>
          <Bar data={productChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-container">
          <h3>Sales by Category</h3>
          <Pie data={categoryChartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;