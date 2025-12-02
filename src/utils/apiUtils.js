import BaseURL from '../Components/BaseURL/BaseURL';

// Get the stored token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Make an authenticated API request
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();

  // Detect if the body is FormData (for file uploads)
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders = {};

  // Only set JSON Content-Type when NOT sending FormData
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BaseURL}${endpoint}`, config);

    // If response is 401 (Unauthorized), clear auth data and redirect to login
    // COMMENTED OUT - Disabled automatic redirect to sign-in on 401 errors
    /*
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('vendorData');
      localStorage.removeItem('vendorId');
      window.location.href = '/sign-in';
      return null;
    }
    */

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper function to get vendor ID from localStorage
export const getVendorId = () => {
  return localStorage.getItem('vendorId');
};

// Helper function to get vendor data from localStorage
export const getVendorData = () => {
  const vendorData = localStorage.getItem('vendorData');
  return vendorData ? JSON.parse(vendorData) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Check if token is expired
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return tokenPayload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}; 