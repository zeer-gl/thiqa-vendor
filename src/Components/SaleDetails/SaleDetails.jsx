import React from 'react';

const SaleDetails = ({ saleId }) => {
  // Sample data - replace with API data
  const saleSummary = {
    saleId: saleId,
    dateTime: '2023-10-01 10:00 AM',
    paymentMethod: 'Cash',
    totalAmount: 150.0,
    deviceName: 'POS Terminal 1',
  };

  const itemsSold = [
    {
      productName: 'Product A',
      quantity: 2,
      unitPrice: 50.0,
      subtotal: 100.0,
    },
    {
      productName: 'Product B',
      quantity: 1,
      unitPrice: 50.0,
      subtotal: 50.0,
    },
    // ...more items
  ];

  const handlePrintReceipt = () => {
    // Implement print functionality
    console.log('Print receipt');
  };

  const handleEmailReceipt = () => {
    // Implement email functionality
    console.log('Email receipt');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            POS Dashboard
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            POS Sales
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center text-gray-700">Sale Details</li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
      </div>

      {/* Sale Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Sale Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">Sale ID:</span> {saleSummary.saleId}
            </p>
            <p>
              <span className="font-medium">Date/Time:</span> {saleSummary.dateTime}
            </p>
          </div>
          <div>
            <p>
              <span className="font-medium">Payment Method:</span> {saleSummary.paymentMethod}
            </p>
            <p>
              <span className="font-medium">Total Amount:</span> $
              {saleSummary.totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p>
              <span className="font-medium">Device Name:</span> {saleSummary.deviceName}
            </p>
          </div>
        </div>
      </div>

      {/* Items Sold */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Items Sold</h2>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Product Name</th>
              <th className="px-4 py-2 border-b">Quantity</th>
              <th className="px-4 py-2 border-b">Unit Price</th>
              <th className="px-4 py-2 border-b">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itemsSold.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{item.productName}</td>
                <td className="px-4 py-2 border-b">{item.quantity}</td>
                <td className="px-4 py-2 border-b">${item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-2 border-b">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Receipt */}
      <div className="flex space-x-4">
        <button
          onClick={handlePrintReceipt}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Print Receipt
        </button>
        <button
          onClick={handleEmailReceipt}
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Email Receipt
        </button>
      </div>
    </div>
  );
};

export default SaleDetails;
