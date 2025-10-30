import React, { useState } from 'react';

const POSSalesManagement = () => {
  const [filters, setFilters] = useState({
    dateRange: 'Today',
    paymentMethod: 'All',
    deviceName: '',
  });

  // Sample data - replace with API data
  const salesData = [
    {
      saleId: 'S001',
      dateTime: '2023-10-01 10:00 AM',
      totalAmount: 150.0,
      paymentMethod: 'Cash',
      deviceName: 'POS Terminal 1',
    },
    {
      saleId: 'S002',
      dateTime: '2023-10-01 11:30 AM',
      totalAmount: 200.0,
      paymentMethod: 'Card',
      deviceName: 'POS Terminal 2',
    },
    // ...more sales
  ];

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetails = (saleId) => {
    // Navigate to Sale Details Page
    console.log(`View details for sale ID: ${saleId}`);
  };

  const handleRefund = (saleId) => {
    // Initiate refund process
    console.log(`Initiate refund for sale ID: ${saleId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">POS Sales Management</h1>
        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>All</option>
              <option>Cash</option>
              <option>Card</option>
            </select>
          </div>
          {/* Device Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Device Name</label>
            <input
              type="text"
              name="deviceName"
              value={filters.deviceName}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter device name"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Sale ID</th>
              <th className="px-4 py-2 border-b">Date/Time</th>
              <th className="px-4 py-2 border-b">Total Amount</th>
              <th className="px-4 py-2 border-b">Payment Method</th>
              <th className="px-4 py-2 border-b">Device Name</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.saleId}>
                <td className="px-4 py-2 border-b">{sale.saleId}</td>
                <td className="px-4 py-2 border-b">{sale.dateTime}</td>
                <td className="px-4 py-2 border-b">${sale.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2 border-b">{sale.paymentMethod}</td>
                <td className="px-4 py-2 border-b">{sale.deviceName}</td>
                <td className="px-4 py-2 border-b space-x-2">
                  <button
                    onClick={() => handleViewDetails(sale.saleId)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRefund(sale.saleId)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                  >
                    Refund
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POSSalesManagement;
