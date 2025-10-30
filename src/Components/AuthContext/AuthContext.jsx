import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('authToken'),
    vendor: JSON.parse(localStorage.getItem('vendorData') || 'null'),
    isAuthenticated: false,
    isLoading: true
  });

  // Check if token is valid on app load
  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('authToken');
      const vendorData = localStorage.getItem('vendorData');
      
      if (token && vendorData) {
        try {
          // Check if token is expired
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp > currentTime) {
            setAuthState({
              token,
              vendor: JSON.parse(vendorData),
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // Token expired, clear storage
            logout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateToken();
  }, []);

  const login = (token, vendorData) => {
    // Store in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('vendorData', JSON.stringify(vendorData));
    localStorage.setItem('vendorId', vendorData._id);
    
    // Update state
    setAuthState({
      token,
      vendor: vendorData,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorData');
    localStorage.removeItem('vendorId');
    
    // Update state
    setAuthState({
      token: null,
      vendor: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Show logout message
    toast.success(t('logout_success'));
    
    // Redirect to login
    navigate('/sign-in');
  };

  const updateVendorData = (newVendorData) => {
    // Update localStorage
    localStorage.setItem('vendorData', JSON.stringify(newVendorData));
    
    // Update state
    setAuthState(prev => ({
      ...prev,
      vendor: newVendorData
    }));
  };

  const value = {
    ...authState,
    login,
    logout,
    updateVendorData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 