import React, { createContext, useState, useEffect, useContext } from 'react';
import { authenticatedFetch } from '../../utils/apiUtils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCategories = async () => {
    if (hasFetched || categories.length > 0) {
      return; // Already loaded or currently loading
    }

    setIsLoading(true);
    setError(null);
    setHasFetched(true);
    
    try {
      const response = await authenticatedFetch('/getCategories');
      if (response) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      toast.error(t('failed_to_fetch_categories'));
      setHasFetched(false); // Reset on error to allow retry
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted && !hasFetched) {
      fetchCategories();
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCategories = () => {
    setCategories([]);
    fetchCategories();
  };

  const value = {
    categories,
    isLoading,
    error,
    refreshCategories,
    fetchCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
