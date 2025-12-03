import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const POSDashboard = () => {
  const { t } = useTranslation(); // Use the translation hook
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Sample data
  const salesData = [
    { time: '10 AM', revenue: 500 },
    { time: '11 AM', revenue: 700 },
    { time: '12 PM', revenue: 400 },
    { time: '1 PM', revenue: 600 },
    { time: '2 PM', revenue: 800 },
    { time: '3 PM', revenue: 300 },
    { time: '4 PM', revenue: 900 },
  ];

  const transactionData = [
    { date: '01 Oct', transactions: 50 },
    { date: '02 Oct', transactions: 65 },
    { date: '03 Oct', transactions: 80 },
    { date: '04 Oct', transactions: 55 },
    { date: '05 Oct', transactions: 70 },
    { date: '06 Oct', transactions: 60 },
    { date: '07 Oct', transactions: 75 },
  ];

  // Metrics data
  const totalRevenue = 5000;
  const totalTransactions = 300;
  const topProduct = 'Product XYZ';
  const inventoryAlerts = [
    { name: 'Product A', count: 5 },
    { name: 'Product C', count: 2 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pos_dashboard')}</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            {t('add_pos_device')}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            {t('view_daily_sales_report')}
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total POS Revenue */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">{t('total_pos_revenue')}</h2>
          <p className="mt-1 text-2xl font-semibold text-gray-900">${totalRevenue}</p>
        </div>
        {/* Number of Transactions */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">{t('number_of_transactions')}</h2>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{totalTransactions}</p>
        </div>
        {/* Top Product */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">{t('top_product')}</h2>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{topProduct}</p>
        </div>
        {/* Inventory Alerts */}
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50 shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-sm font-medium text-red-600">{t('inventory_alerts')}</h2>
          </div>
          <ul className="mt-2">
            {inventoryAlerts.map((item) => (
              <li key={item.name} className="text-sm text-gray-700">
                {item.name}: {item.count} {t('units_left')}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Bar Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{t('sales_trends')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Trends Line Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{t('transactions_trends')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transactions" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
        >
          <span className="font-medium">{t('advanced_filters')}</span>
          {isFiltersExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {isFiltersExpanded && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('date_range')}
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>{t('today')}</option>
                  <option>{t('this_week')}</option>
                  <option>{t('this_month')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment_method')}
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>{t('all_methods')}</option>
                  <option>{t('cash')}</option>
                  <option>{t('card')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('device_name')}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder={t('enter_device_name')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSDashboard;
