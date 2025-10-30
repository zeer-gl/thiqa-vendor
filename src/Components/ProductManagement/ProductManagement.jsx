import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { VendorContext } from '../VendorContext/VendorContext';
import { useCategories } from '../CategoryContext/CategoryContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import BaseURL from '../BaseURL/BaseURL';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import { authenticatedFetch } from '../../utils/apiUtils';

const ProductListManager = () => {
  const { t, i18n } = useTranslation(); // Use translation hook
  const { categories } = useCategories(); // Use shared categories
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const vendorId = localStorage.getItem('vendorId');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      if (!isMounted) return;
      
      setIsFetching(true);
      setFetchError(null);
      try {
        const response = await authenticatedFetch(`/getProducts/${vendorId}`);
        if (response && isMounted) {
          const data = await response.json();
          const { products: fetchedProducts } = data;

          const productsWithCategoryNames = fetchedProducts.map(product => {
            const categoryObj = categories.find(cat => cat._id === product.category);
            return {
              ...product,
              categoryName: categoryObj ? categoryObj.name.en : t('uncategorized')
            };
          });

          const sortedProducts = productsWithCategoryNames.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );

          if (isMounted) {
            setProducts(sortedProducts);
            setFilteredProducts(sortedProducts);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching products:', error);
          setFetchError(t('failed_to_fetch_products'));
          toast.error(t('failed_to_fetch_products'));
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    if (categories.length > 0) {
      fetchProducts();
    }
    
    return () => {
      isMounted = false;
    };
  }, [vendorId, categories, t]);


  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        i18n.language === 'ar'
          ? product.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
          : product.name_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(product => {
        if (statusFilter === 'active') return product.isActive === true;
        if (statusFilter === 'inactive') return product.isActive === false;
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, statusFilter, products, i18n.language]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (product) => {
    try {
      const response = await authenticatedFetch(`/updateProduct/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          isActive: !product.isActive,
        }),
      });
      if (response) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p._id === product._id ? { ...p, isActive: !p.isActive } : p
          )
        );
        setFilteredProducts(prevProducts =>
          prevProducts.map(p =>
            p._id === product._id ? { ...p, isActive: !p.isActive } : p
          )
        );
        toast.success(t('product_status_updated'));
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(t('failed_to_update_product_status'));
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await authenticatedFetch(`/deleteProduct/${productId}`, {
        method: 'DELETE',
      });
      if (response) {
        setProducts(prevProducts =>
          prevProducts.filter(product => product._id !== productId)
        );
        setFilteredProducts(prevProducts =>
          prevProducts.filter(product => product._id !== productId)
        );
        toast.success(t('product_deleted_successfully'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('product_deleted_error'));
    }
  };

  const ITEMS_PER_PAGE = 10;
  const paginatedProducts = filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreItems = paginatedProducts.length < filteredProducts.length;

  const loadMoreProducts = () => {
    if (!isFetching && hasMoreItems) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">{t('product_management')}</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder={t('search_products')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">{t('all_categories')}</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name.en}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">{t('all_statuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
          <Link
            to="/add-product"
            className="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('add_product')}
          </Link>
        </div>
      </div>

      {isFetching && currentPage === 1 ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : fetchError ? (
        <div className="text-center text-red-500 p-4">{fetchError}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('Image')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('product_name')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('category')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('measurement_unit')}</th> {/* Added Measurement Unit heading */}
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('price')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('stock_level')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {t('no_products_found')}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{i18n.language === 'ar' ? product.name_ar : product.name_en}</td> {/* Display product name based on language */}
                    <td className="px-6 py-4 text-sm text-gray-500">{product.categoryName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.measurementUnit}</td> {/* Display Measurement Unit */}
                    <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.stockQuantity}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleStatusToggle(product)}
                        className={`${
                          product.isActive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.isActive ? t('active') : t('inactive')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <Link to={`/edit-product/${product._id}`} className="ml-2 text-blue-600 hover:text-blue-800">
                        <Pencil className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {hasMoreItems && (
            <div className="flex justify-center mt-4 mb-6">
              <button onClick={loadMoreProducts} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                {t('load_more')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListManager;
