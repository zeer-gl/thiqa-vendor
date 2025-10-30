// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './Components/AuthContext/AuthContext';
import { CategoryProvider } from './Components/CategoryContext/CategoryContext';

import VendorRegistration from './Components/VendorRegistration/VendorRegistration';
import ProductListManager from './Components/ProductManagement/ProductManagement';
import Layout from './Components/Sidebar/Layout';
import LoginForm from './Components/VendorRegistration/Login';
import OrderDashboard from './Components/OrderDashboard/OrderDashboard';
import POSIntegration from './Components/POSIntegration/POSIntegration';
import SalesAnalyticsDashboard from './Components/SalesAnalyticsDashboard/SalesAnalyticsDashboard';
import SubscriptionManager from './Components/SubscriptionManager/SubscriptionManager';
import OrderDetails from './Components/OrderDashboard/OrderDetails';
import AddEditProduct from './Components/ProductManagement/AddandEditProduct';
import SettingsPage from './Components/SettingPage/SettingPage';
import DemandQuotes from './Components/DemandQuotes/DemandQuotes';
import POSSalesManagement from './Components/POSSalesManagement/POSSalesManagement';
import SaleDetails from './Components/SaleDetails/SaleDetails';
import POSInventoryManagement from './Components/POSInventoryManagement/POSInventoryManagement';
import POSReports from './Components/POSReports/POSReports';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

// Firebase Messaging

import { onMessage, getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';

function App() {
  useEffect(() => {
    // Initialize Firebase messaging with proper error handling
    const initializeFirebase = async () => {
      try {
        console.log('Initializing Firebase messaging...');
        
        // Request Notification permission and get FCM token
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          
          try {
            const currentToken = await getToken(messaging, { 
              vapidKey: 'BBLMpQqN5ouDSIoU6kzHHYzwqPdsxcBTP7VCrIL3cDq5nBE0jAy2Sbr_CKFPdD1Tr0tEYNfSPfteg14FmOBQfDc' 
            });
            
            if (currentToken) {
              console.log('FCM Token:', currentToken);
              // Optionally, send the token to your backend for later use
            } else {
              console.warn('No registration token available.');
            }
          } catch (tokenError) {
            console.warn('Failed to get FCM token (this is normal in development):', tokenError.message);
          }
        } else {
          console.warn('Permission not granted for notifications.');
        }
      } catch (error) {
        console.warn('Firebase messaging initialization failed (app will continue to work):', error.message);
      }
    };

    // Initialize Firebase messaging
    initializeFirebase();

    // Listen for foreground messages with error handling
    let unsubscribe;
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        if (payload.notification) {
          const { title, body } = payload.notification;
          toast.info(
            <div>
              <strong>{title}</strong>
              <div>{body}</div>
            </div>,
            { position: toast.POSITION.TOP_RIGHT }
          );
        }
      });
    } catch (error) {
      console.warn('Failed to set up message listener:', error.message);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from messages:', error.message);
        }
      }
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <Routes>
        <Route path="/registration" element={<VendorRegistration />} />
        <Route path="/sign-in" element={<LoginForm />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductListManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-orders"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demand-quotes"
          element={
            <ProtectedRoute>
              <Layout>
                <DemandQuotes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-orders/:orderId"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:productId"
          element={
            <ProtectedRoute>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos-integration"
          element={
            <ProtectedRoute>
              <Layout>
                <POSIntegration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesAnalyticsDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription-manager"
          element={
            <ProtectedRoute>
              <Layout>
                <SubscriptionManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-management"
          element={
            <ProtectedRoute>
              <Layout>
                <POSSalesManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:saleId"
          element={
            <ProtectedRoute>
              <Layout>
                <SaleDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory-management"
          element={
            <ProtectedRoute>
              <Layout>
                <POSInventoryManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <POSReports />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
