import React, { useState, useEffect, useContext } from 'react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { VendorContext } from '../VendorContext/VendorContext';
import BaseURL from '../BaseURL/BaseURL';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '../AuthContext/AuthContext';

const SalesAnalyticsDashboard = () => {
  const { t } = useTranslation(); // Use the translation hook
  const { vendorId } = useContext(VendorContext);
  const { token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metricsSummary, setMetricsSummary] = useState({
    totalSales: 0,
    averageOrderValue: 0,
    totalOrders: 0
  });
  const [revenueBreakdown, setRevenueBreakdown] = useState({});
  const [salesTrends, setSalesTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noDataFound, setNoDataFound] = useState(false);

  const fetchData = async () => {
    if (!token) {
      setError('Access token required');
      return;
    }

    if (!vendorId) {
      setError(t('vendor_id_missing'));
      return;
    }
  
    setLoading(true);
    setError(null);
    setNoDataFound(false);
  
    try {
      const params = {
        vendorId,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const config = {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      // First try to fetch metrics summary
      try {
        const metricsRes = await axios.get(`${BaseURL}/metrics-summary`, config);
  
        // If the metrics response is valid, proceed with further data fetches
        setMetricsSummary(metricsRes.data);
  
        // Fetch other data if metrics data is successfully received
        const [revenueRes, trendsRes, topProductsRes, ordersStatusRes] = await Promise.all([
          axios.get(`${BaseURL}/revenue-breakdown`, config),
          axios.get(`${BaseURL}/sales-trends`, config),
          axios.get(`${BaseURL}/top-products`, config),
          axios.get(`${BaseURL}/orders-by-status`, config)
        ]);
  
        // Handle revenue breakdown response
        const revenueObj = revenueRes.data || {};
        setRevenueBreakdown(revenueObj);
  
        const trendsData = trendsRes.data.map(item => ({
          date: item._id,
          sales: item.totalSales
        }));
        setSalesTrends(trendsData);
  
        const topProductsData = topProductsRes.data.map(item => ({
          name: item._id,
          sales: item.totalSold
        }));
        setTopProducts(topProductsData);
  
        const ordersStatusObj = {};
        ordersStatusRes.data.forEach(item => {
          ordersStatusObj[item._id] = item.count;
        });
        setOrdersByStatus(ordersStatusObj);
  
      } catch (metricsError) {
        // Handle specific "No orders found" error
        if (metricsError.response?.data?.message === t('no_orders_found_message')) {
          setNoDataFound(true);
          // Reset all data states to empty/zero values
          setMetricsSummary({
            totalSales: 0,
            averageOrderValue: 0,
            totalOrders: 0
          });
          setRevenueBreakdown({});
          setSalesTrends([]);
          setTopProducts([]);
          setOrdersByStatus({});
        } else {
          // For other errors, show a general error message
          setError(metricsError.response?.data?.message || t('data_fetch_error'));
        }
      }
  
    } catch (err) {
      console.error(err);
      // In case of general errors, set the error state
      setError(t('data_fetch_error'));
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (vendorId) {
      fetchData();
    }
  }, [vendorId, startDate, endDate]);

  const totalSales = metricsSummary.totalSales;
  const totalOrders = metricsSummary.totalOrders;
  const averageOrderValue = metricsSummary.averageOrderValue || 0;

  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="text-gray-400 text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('no_orders_found')}</h3>
      <p className="text-gray-500 text-center">
        {t('no_orders_found_message')}<br />
        {t('try_different_time_period')}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">{t('analytics')}</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center mb-8">
          <p className="text-gray-500">{t('loading_data')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center mb-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* No Data State */}
      {noDataFound && !loading && !error && (
        <NoDataMessage />
      )}

      {/* Data Display */}
      {!loading && !error && !noDataFound && (
        <>
          {/* Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-gray-100 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800">{t('total_sales')}</h2>
              <p className="text-3xl font-bold text-black">${totalSales.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800">{t('average_order_value')}</h2>
              <p className="text-3xl font-bold text-black">${averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800">{t('total_orders')}</h2>
              <p className="text-3xl font-bold text-black">{totalOrders}</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800">{t('revenue_breakdown')}</h2>
              <p className="text-lg font-semibold text-black">{t('online')}: ${revenueBreakdown['Online']?.toLocaleString() || 0}</p>
              <p className="text-lg font-semibold text-black">{t('pos')}: ${revenueBreakdown['POS']?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Graphs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trends */}
            <div className="p-4 border border-gray-200 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">{t('sales_trends')}</h2>
              <div className="w-full h-[300px]">
                {salesTrends.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={salesTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '0.375rem',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#000000" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500">{t('no_sales_trends_data')}</p>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="p-4 border border-gray-200 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">{t('top_products')}</h2>
              <div className="w-full h-[300px]">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '0.375rem',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#000000">
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500">{t('no_top_products_data')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          <div className="p-4 border border-gray-200 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">{t('orders_by_status')}</h2>
            <div className="w-full h-[300px]">
              {Object.keys(ordersByStatus).length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(ordersByStatus).map(([status, count]) => ({ name: status, value: count }))} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      fill="#000000" 
                      dataKey="value" 
                      label
                    >
                      {Object.keys(ordersByStatus).map((status, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${index * 60}, 70%, 50%)`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: 'white'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">{t('no_orders_by_status_data')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalyticsDashboard;
