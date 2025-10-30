import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { authenticatedFetch } from '../../utils/apiUtils';
import { Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const DemandQuotes = () => {
  console.log('🎯 DemandQuotes component rendered');
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({
    amount: '',
    description: '',
    notes: '',
    duration: '',
    durationDate: null
  });

  // Fetch quotes with pagination and server-side filtering
  const fetchQuotes = async (page = 1) => {
    console.log('🔄 fetchQuotes called with page:', page, 'at:', new Date().toISOString());
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10' // Use fixed limit to avoid dependency issues
      });

      // Only add parameters that are not undefined or empty
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        queryParams.append('typeOfProject', typeFilter);
      }
      // Area filter commented out
      /*
      if (areaFilter) {
        queryParams.append('area', areaFilter);
      }
      */
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString().split('T')[0]);
      }

      const response = await authenticatedFetch(`/quotes/visible?${queryParams}`);
      if (response && response.ok) {
        const data = await response.json();
        setQuotes(data.data || []);
        setPagination(data.pagination || pagination);
        setError(null);
      } else {
        throw new Error('Failed to fetch quotes');
      }
    } catch (err) {
      setError(t('fetch_quotes_error'));
      toast.error(t('fetch_quotes_error'));
    } finally {
      setLoading(false);
    }
  };

  // Single effect to handle all data fetching
  useEffect(() => {
    console.log('🚀 useEffect triggered with dependencies:', { searchTerm, statusFilter, typeFilter, startDate, endDate });
    
    // For search, use debounce
    if (searchTerm !== '') {
      const timeoutId = setTimeout(() => {
        console.log('⏰ Search timeout triggered');
        fetchQuotes(1);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      // For other filters or initial load, fetch immediately
      console.log('🔧 Immediate fetch triggered');
      fetchQuotes(1);
    }
  }, [searchTerm, statusFilter, typeFilter, startDate, endDate]);

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteModal(true);
  };

  const handleSubmitProposal = (quote) => {
    setSelectedQuote(quote);
    setShowProposalModal(true);
  };

  const handleProposalSubmit = async () => {
    // Validate required fields for proposal submission
    if (!proposalData.amount || !proposalData.description || !proposalData.durationDate) {
      toast.error('Please fill in all required fields including completion date');
      return;
    }

    try {
      setLoading(true);
      
      // Get vendor ID from localStorage (assuming it's stored there)
      const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
      const vendorId = vendorData._id;
      
      if (!vendorId) {
        toast.error('Vendor information not found. Please login again.');
        return;
      }

      // Create JSON payload for proposal submission
      const payload = {
        vendorId: vendorId,
        demandId: selectedQuote._id,
        isAccepted: false, // Vendors always submit proposals (not accept)
        price: proposalData.amount,
        note: proposalData.description,
        duration: proposalData.durationDate ? proposalData.durationDate.toISOString().split('T')[0] : ''
      };

      const response = await authenticatedFetch('/quotes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response && response.ok) {
        const result = await response.json();
        toast.success(result.message || t('proposal_submitted'));
        setShowProposalModal(false);
        setProposalData({ amount: '', description: '', notes: '', duration: '', durationDate: null });
        // Refresh quotes
        fetchQuotes(pagination.currentPage);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error('Proposal submission error:', err);
      toast.error(err.message || t('proposal_error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchQuotes(newPage);
  };

  const SearchIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">{t('quote_management')}</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder={t('search_quotes')}
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
            <option value="all">{t('all_quotes')}</option>
            <option value="open">{t('open')}</option>
            <option value="in_progress">{t('in_progress')}</option>
            <option value="closed">{t('closed')}</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="all">{t('all_project_types')}</option>
            {/* Project types will be populated from API if needed */}
          </select>
          {/* Address search field - commented out */}
          {/*
          <input
            type="text"
            placeholder={t('address')}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          />
          */}
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            placeholderText={t('select_date_range')}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {loading && <p className="text-center py-4">{t('loading_quotes')}</p>}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'quote_id',
                    'customer_name',
                    'project_name',
                    'description',
                    'address',
                    'price',
                    'request_date',
                    'status',
                    'application_status',
                    'actions',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote, index) => (
                  <tr key={quote._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {quote._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={quote.projectName || 'N/A'}>
                        {quote.projectName ? (quote.projectName.length > 50 ? `${quote.projectName.substring(0, 50)}...` : quote.projectName) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={quote.description || 'N/A'}>
                        {quote.description ? (quote.description.length > 50 ? `${quote.description.substring(0, 50)}...` : quote.description) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={quote.address || 'N/A'}>
                        {quote.address ? (quote.address.length > 50 ? `${quote.address.substring(0, 50)}...` : quote.address) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.price ? Number(quote.price).toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.dateOfRequest).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                        {t(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quote.vendorHasApplied 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.vendorHasApplied ? t('applied') : t('not_applied')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('view_quote')}
                        </button>
                        {quote.isAccepted ? (
                          <span className="flex items-center px-3 py-1 border border-green-300 text-green-600 rounded-lg bg-green-100">
                            <FileText className="w-4 h-4 mr-1" />
                            {t('order_complete_admin')}
                          </span>
                        ) : quote.status === 'open' && !quote.vendorHasApplied ? (
                          <button
                            onClick={() => handleSubmitProposal(quote)}
                            className="flex items-center px-3 py-1 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            {t('submit_proposal')}
                          </button>
                        ) : quote.status === 'open' && quote.vendorHasApplied ? (
                          <span className="flex items-center px-3 py-1 border border-gray-300 text-gray-500 rounded-lg bg-gray-100">
                            <FileText className="w-4 h-4 mr-1" />
                            {t('already_applied')}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      {t('no_quotes_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previous_page')}
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next_page')}
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t('showing')} <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> {t('to')} <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span> {t('of')} <span className="font-medium">{pagination.totalCount}</span> {t('results')}
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                      {t('page')} {pagination.currentPage} {t('of')} {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quote Details Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{t('quote_details')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('quote_id')}</label>
                  <p className="text-sm text-gray-900">{selectedQuote._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedQuote.status)}`}>
                    {t(selectedQuote.status)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('project_name')}</label>
                  <p className="text-sm text-gray-900">{selectedQuote.projectName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('price')}</label>
                  <p className="text-sm text-gray-900">{selectedQuote.price ? Number(selectedQuote.price).toFixed(2) : 'N/A'}</p>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{t('project_description')}</div>
                <div className="text-sm text-gray-900 mt-1">{selectedQuote.description || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('address')}</label>
                <p className="text-sm text-gray-900">{selectedQuote.address || 'N/A'}</p>
              </div>
              {selectedQuote.projectDesign && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('project_design')}</label>
                  <div className="mt-2">
                    <img 
                      src={selectedQuote.projectDesign} 
                      alt="Project Design" 
                      className="max-w-full h-48 object-contain border border-gray-300 rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p className="text-sm text-gray-500 mt-1" style={{display: 'none'}}>
                      {t('image_load_error')}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customer_contact')}</label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-900"><strong>{t('name')}:</strong> {selectedQuote.customerId?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-900"><strong>{t('email')}:</strong> {selectedQuote.customerId?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-900"><strong>{t('phone')}:</strong> {selectedQuote.customerId?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('request_date')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedQuote.dateOfRequest).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('is_accepted')}</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedQuote.isAccepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedQuote.isAccepted ? t('yes') : t('no')}
                  </span>
                </div>
              </div>
              {selectedQuote.proposals && selectedQuote.proposals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('existing_proposals')}</label>
                  <p className="text-sm text-gray-900">{selectedQuote.proposals.length} {t('proposals_submitted')}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                {t('cancel')}
              </button>
              {selectedQuote.isAccepted ? (
                <span className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md border border-green-300">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('order_complete_admin')}
                </span>
              ) : selectedQuote.status === 'open' && !selectedQuote.vendorHasApplied ? (
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    handleSubmitProposal(selectedQuote);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {t('submit_proposal')}
                </button>
              ) : selectedQuote.status === 'open' && selectedQuote.vendorHasApplied ? (
                <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-md border border-gray-300">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('already_applied')}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Submit Proposal Modal */}
      {showProposalModal && selectedQuote && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{t('submit_proposal_modal')}</h2>
            
            {/* Proposal Submission Section */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Submit Your Proposal</h3>
                <p className="text-sm text-green-700">
                  Submit your proposal with your pricing and terms for this demand quote.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('proposal_amount')} *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={proposalData.amount}
                    onChange={(e) => setProposalData({ ...proposalData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('completion_date')} *</label>
                  <DatePicker
                    selected={proposalData.durationDate}
                    onChange={(date) => setProposalData({ ...proposalData, durationDate: date })}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholderText={t('select_completion_date')}
                    showTimeSelect={false}
                    isClearable
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('proposal_description')} *</label>
                <textarea
                  value={proposalData.description}
                  onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  rows="3"
                  placeholder="Describe your proposal..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('proposal_notes')}</label>
                <textarea
                  value={proposalData.notes}
                  onChange={(e) => setProposalData({ ...proposalData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowProposalModal(false);
                  setProposalData({ amount: '', description: '', notes: '', duration: '', durationDate: null });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleProposalSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {loading ? t('loading') : t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandQuotes;
