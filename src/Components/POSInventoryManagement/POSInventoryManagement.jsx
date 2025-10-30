import React, { useState } from 'react';

const POSInventoryManagement = () => {
  const [inventoryData, setInventoryData] = useState([
    {
      productName: 'Product A',
      stockLevel: 15,
      stockThreshold: 20,
      lastUpdated: '2023-10-01 09:00 AM',
    },
    {
      productName: 'Product B',
      stockLevel: 25,
      stockThreshold: 20,
      lastUpdated: '2023-10-01 09:30 AM',
    },
    // ...more products
  ]);

  const handleSyncInventory = () => {
    // Implement inventory synchronization
    console.log('Syncing inventory...');
  };

  const handleUpdateStock = (productName) => {
    // Implement stock update functionality
    console.log(`Updating stock for ${productName}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">POS Inventory Management</h1>
        <button
          onClick={handleSyncInventory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Sync Inventory
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Product Name</th>
              <th className="px-4 py-2 border-b">Stock Level</th>
              <th className="px-4 py-2 border-b">Stock Threshold</th>
              <th className="px-4 py-2 border-b">Last Updated</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((product, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{product.productName}</td>
                <td
                  className={`px-4 py-2 border-b ${
                    product.stockLevel < product.stockThreshold ? 'text-red-600' : ''
                  }`}
                >
                  {product.stockLevel}
                </td>
                <td className="px-4 py-2 border-b">{product.stockThreshold}</td>
                <td className="px-4 py-2 border-b">{product.lastUpdated}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleUpdateStock(product.productName)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md"
                  >
                    Update Stock
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

export default POSInventoryManagement;
