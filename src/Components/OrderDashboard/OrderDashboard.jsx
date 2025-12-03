import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import { authenticatedFetch } from '../../utils/apiUtils';

// Helper function to translate error messages
const translateErrorMessage = (errorMessage, t) => {
  if (!errorMessage) return t('fetch_error');
  
  const errorLower = errorMessage.toLowerCase();
  
  if (errorLower.includes('access token required') || errorLower.includes('access token')) {
    return t('access_token_required');
  }
  
  if (errorLower.includes('unauthorized') || errorLower.includes('401')) {
    return t('access_token_required');
  }
  
  // Return the original message if no translation found
  return errorMessage;
};

const OrderDashboard = () => {
  const { t } = useTranslation(); // Use translation hook to get the translation function
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const vendorId = localStorage.getItem('vendorId');

  useEffect(() => {
    let isMounted = true;
    
    const fetchOrders = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        const response = await authenticatedFetch(`/getorders?vendorId=${vendorId}`);
        if (!response) {
          throw new Error('No response from server');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        if (response && isMounted) {
          const data = await response.json();
          const normalizedOrders = data.map(order => ({
            ...order,
            id: order.parentOrderId,
            date: order.orderDate,
            amount: order.totalAmount,
          }));
          
          if (isMounted) {
            setOrders(normalizedOrders);
            setFilteredOrders(normalizedOrders);
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err.message || err.response?.data?.message || t('fetch_error');
          const translatedError = translateErrorMessage(errorMessage, t);
          setError(translatedError);
          toast.error(translatedError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    
    return () => {
      isMounted = false;
    };
  }, [vendorId, t]);

  useEffect(() => {
    const filterOrders = () => {
      const filtered = orders.filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter;
        const orderDate = new Date(order.date);
        const matchesDate =
          (!startDate || orderDate >= startDate) &&
          (!endDate || orderDate <= endDate);
        return matchesSearch && matchesStatus && matchesDate;
      });
      setFilteredOrders(filtered);
    };

    filterOrders();
  }, [searchTerm, statusFilter, startDate, endDate, orders, t]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          vendorId,
        }),
      });
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setError(null);
      toast.success(t('order_updated_successfully'));
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || t('update_error');
      const translatedError = translateErrorMessage(errorMessage, t);
      setError(translatedError);
      toast.error(translatedError);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeUpdateModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/updateOrder?vendorId=${vendorId}&orderId=${selectedOrder.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            shippingAddress: selectedOrder.shippingAddress,
            totalAmount: selectedOrder.totalAmount,
          }),
        }
      );
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? selectedOrder : order
        )
      );
      closeUpdateModal();
      toast.success(t('order_updated_successfully'));
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || t('update_error');
      const translatedError = translateErrorMessage(errorMessage, t);
      toast.error(translatedError);
    } finally {
      setLoading(false);
    }
  };

  const SearchIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">{t('order_management')}</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder={t('search_orders')} // Use translated placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="all">{t('all_orders')}</option>
            <option value="processing">{t('processing')}</option>
            <option value="shipped">{t('shipped')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </select>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            placeholderText={t('select_date_range')} // Use translated placeholder
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {loading && <p>{t('loading')}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'order_id',
                  'customer_name',
                  'total_amount',
                  'order_date',
                  'status',
                  'actions',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t(header)} {/* Use translation for table headers */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link to={`/orders/${order.id}`}>{order.id}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full focus:outline-none ${
                        order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="processing">{t('processing')}</option>
                      <option value="shipped">{t('shipped')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/manage-orders/${order.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        {t('view')}
                      </Link>
                      <button
                        onClick={() => openUpdateModal(order)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        {t('update')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    {t('no_orders_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">{t('update_order')}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shipping_address')}</label>
              <input
                type="text"
                value={selectedOrder.shippingAddress}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, shippingAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('total_amount')}</label>
              <input
                type="text"
                value={selectedOrder.totalAmount}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, totalAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpdateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
