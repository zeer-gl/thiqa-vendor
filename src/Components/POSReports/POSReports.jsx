import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const POSReports = () => {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  // Sample data - replace with API data
  const dailySalesSummary = {
    totalRevenue: 5000,
    totalTransactions: 300,
    averageSaleValue: 16.67,
    products: [
      { productName: 'Product A', quantitySold: 100, revenue: 2000 },
      { productName: 'Product B', quantitySold: 50, revenue: 1500 },
      // ...more products
    ],
  };

  const monthlySalesTrends = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 4500 },
    { month: 'Mar', revenue: 4700 },
    // ...more months
  ];

  const topProducts = [
    { productName: 'Product A', unitsSold: 100, revenue: 2000 },
    { productName: 'Product B', unitsSold: 80, revenue: 1600 },
    // ...more products
  ];

  const handleDownloadReport = () => {
    // Implement report download functionality
    console.log('Downloading report...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">POS Reports</h1>
        {/* Date Range Picker */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      {/* Report Options */}
      {/* Daily Sales Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Sales Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-gray-700">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">${dailySalesSummary.totalRevenue}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Number of Transactions</p>
            <p className="text-2xl font-semibold text-gray-900">
              {dailySalesSummary.totalTransactions}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Average Sale Value</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${dailySalesSummary.averageSaleValue.toFixed(2)}
            </p>
          </div>
        </div>
        {/* Product Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Product Name</th>
                <th className="px-4 py-2 border-b">Quantity Sold</th>
                <th className="px-4 py-2 border-b">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailySalesSummary.products.map((product, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-b">{product.productName}</td>
                  <td className="px-4 py-2 border-b">{product.quantitySold}</td>
                  <td className="px-4 py-2 border-b">${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Sales Trends */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Monthly Sales Trends</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySalesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Product Name</th>
              <th className="px-4 py-2 border-b">Units Sold</th>
              <th className="px-4 py-2 border-b">Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{product.productName}</td>
                <td className="px-4 py-2 border-b">{product.unitsSold}</td>
                <td className="px-4 py-2 border-b">${product.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Options */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Download Report (PDF/CSV)
        </button>
      </div>
    </div>
  );
};

export default POSReports;
