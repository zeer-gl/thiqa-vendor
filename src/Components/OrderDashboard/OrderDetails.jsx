import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BaseURL from '../BaseURL/BaseURL';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

const OrderDetails = () => {
  const { t } = useTranslation(); // Use the translation function
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [vendorOrder, setVendorOrder] = useState(null); // New state for vendorOrder
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const vendorId = localStorage.getItem('vendorId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${BaseURL}/orders/${orderId}?id=${vendorId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const fetchedOrder = response.data.order;
        setOrder(fetchedOrder);
        if (fetchedOrder.vendorOrders && fetchedOrder.vendorOrders.length > 0) {
          const currentVendorOrder = fetchedOrder.vendorOrders.find(
            (vo) => vo.vendor._id === vendorId
          );
          setVendorOrder(currentVendorOrder);
          setDeliveryStatus(currentVendorOrder.status || 'processing'); // Default to 'processing'
        } else {
          setVendorOrder(null);
          setDeliveryStatus('processing');
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || t('fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, vendorId, t]);

  const handleDeliveryStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${BaseURL}/orders/${orderId}/status`,
        {
          status: newStatus,
          vendorId, // Include vendorId in the request body
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setDeliveryStatus(newStatus);
      setVendorOrder((prevVendorOrder) => ({
        ...prevVendorOrder,
        status: newStatus,
      }));
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      alert(t('update_error'));
    }
  };

  const calculateSubtotal = (product) => {
    return ((product.quantity || 0) * (product.price || 0)).toFixed(2);
  };

  const calculateTotal = () => {
    if (!vendorOrder || !vendorOrder.products) return '0.00';
    return vendorOrder.products
      .reduce((total, product) => total + (product.quantity || 0) * (product.price || 0), 0)
      .toFixed(2);
  };

  const handleDeleteOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${BaseURL}/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast(t('order_deleted_successfully'));
      navigate('/manage-orders');
    } catch (err) {
      console.error('Failed to delete order:', err);
      toast(t('order_deleted_error'));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <Link to="/" className="hover:underline">
          {t('home')}
        </Link>
        <span>/</span>
        <Link to="/manage-orders" className="hover:underline">
          {t('orders')}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{t('order_details')}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{t('order_details')}</h1>

      {loading && <p>{t('loading')}...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && order && vendorOrder && (
        <>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('customer_info')}</h2>
            <p>
              <strong>{t('name')}:</strong> {order.customer.name || t('n/a')}
            </p>
            <p>
              <strong>{t('contact_info')}:</strong> {order.customer.email || t('n/a')}
            </p>
            <p>
              <strong>{t('address')}:</strong> {vendorOrder.shippingAddress || t('n/a')}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('order_summary')}</h2>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead>
                <tr>
                  {['product_name', 'quantity', 'price', 'subtotal'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendorOrder.products.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product?.name || t('n/a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${calculateSubtotal(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right">
              <strong>{t('total_amount')}: ${calculateTotal()}</strong>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('payment_delivery_info')}</h2>
            <p>
              <strong>{t('payment_method')}:</strong> {vendorOrder.paymentMethod || t('n/a')}
            </p>
            <p>
              <strong>{t('delivery_method')}:</strong> {vendorOrder.deliveryMethod || t('n/a')}
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                {t('delivery_status')}
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => handleDeliveryStatusChange(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="processing">{t('processing')}</option>
                <option value="shipped">{t('shipped')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="cancelled">{t('cancelled')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleDeleteOrder}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('delete_order')}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              {t('print_invoice')}
            </button>
          </div>
        </>
      )}

      {!loading && !error && order && !vendorOrder && (
        <p className="text-red-500">{t('no_vendor_orders_found')}</p>
      )}
    </div>
  );
};

export default OrderDetails;
