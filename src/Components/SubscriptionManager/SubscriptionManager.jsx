import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, Shield, Headphones, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import BaseURL from '../BaseURL/BaseURL';
import { authenticatedFetch } from '../../utils/apiUtils';


const SubscriptionManager = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [expiryDate, setExpiryDate] = useState('2024-12-31'); // Example only
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suppose vendorId is stored somewhere or retrieved from context / route
  const vendorId = localStorage.getItem('vendorId') || 'someVendorId';

  useEffect(() => {
    let isMounted = true;
    
    // Fetch the vendor's subscription plans from the backend
    const fetchVendorPlans = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch(`/subscriptions/${vendorId}`);
        if (response && isMounted) {
          const data = await response.json();
          /**
           * Expecting structure like:
           * {
           *   currentPlanId: "abc123", // if any
           *   plans: [ { _id, name, price, features, duration, productsAllowed, ... }, ... ],
           *   paymentHistory: [ ... ] // optional
           * }
           */
          setPlans(data.plans || []);
          setCurrentPlanId(data.currentPlanId || null);
          setPaymentHistory(data.paymentHistory || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching vendor plans:', err);
          setError(err.message || 'Failed to fetch subscription data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVendorPlans();
    
    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  // Derive the current plan from the list
  const currentPlanDetails = plans.find((p) => p._id === currentPlanId);

  const getFeatureIcon = (feature) => {
    // Example icon logic – adjust as desired
    if (feature.toLowerCase().includes('analytics')) return <Zap className="w-4 h-4" />;
    if (feature.toLowerCase().includes('support')) return <Headphones className="w-4 h-4" />;
    if (feature.toLowerCase().includes('api')) return <Shield className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    );
  };

  const PaymentForm = () => {
    const handleConfirmPayment = async () => {
      try {
        // Example of sending request to upgrade subscription
        const response = await authenticatedFetch('/subscriptions/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendorId,
            planId: selectedPlan._id,
          }),
        });
        
        if (response) {
          // On success, we can close modal and re-fetch plans or set currentPlanId
          setIsModalOpen(false);
          setCurrentPlanId(selectedPlan._id);
        }
      } catch (error) {
        console.error('Payment/upgrade error:', error);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('card_number')}</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('expiry_date')}</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('cvc')}</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
              placeholder="123"
            />
          </div>
        </div>
        <button 
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
          onClick={handleConfirmPayment}
        >
          {t('confirm_payment')}
        </button>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{t('subscription_management')}</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('loading')}...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{t('subscription_management')}</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('subscription_management')}</h1>
      
      {/* Current Plan Display */}
      {currentPlanDetails ? (
        <div className="mb-8 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            {t('current_plan')}: {currentPlanDetails.name}
          </h2>
          <p className="mb-2">
            <strong>{t('expiry_date')}:</strong> {expiryDate}
          </p>
          <p className="mb-4">
            <strong>{t('features')}:</strong>
          </p>
          <ul className="list-disc list-inside">
            {(() => {
              // Handle different feature formats for current plan
              let features = [];
              if (Array.isArray(currentPlanDetails.features)) {
                features = currentPlanDetails.features.map(feature => {
                  if (typeof feature === 'object' && feature !== null) {
                    if (feature['0'] !== undefined) {
                      return Object.values(feature).filter(val => typeof val === 'string').join('');
                    }
                    if (feature.name) return feature.name;
                    if (feature.description) return feature.description;
                    return JSON.stringify(feature);
                  }
                  return feature;
                });
              } else if (typeof currentPlanDetails.features === 'string') {
                features = currentPlanDetails.features.split(',');
              }
              
              return features.map((feat, index) => (
                <li key={index}>{feat.trim()}</li>
              ));
            })()}
          </ul>
        </div>
      ) : (
        <p className="mb-8">{t('no_active_plan')}</p>
      )}

      {/* Plan Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan._id === currentPlanId;
          
          // Handle different feature formats
          let planFeatures = [];
          if (Array.isArray(plan.features)) {
            planFeatures = plan.features.map(feature => {
              // Handle features that are objects with numbered keys (malformed data)
              if (typeof feature === 'object' && feature !== null) {
                // If it has numbered keys, reconstruct the string
                if (feature['0'] !== undefined) {
                  return Object.values(feature).filter(val => typeof val === 'string').join('');
                }
                // If it's a proper feature object
                if (feature.name) {
                  return feature.name;
                }
                if (feature.description) {
                  return feature.description;
                }
                return JSON.stringify(feature);
              }
              // If it's already a string
              return feature;
            });
          } else if (typeof plan.features === 'string') {
            planFeatures = plan.features.split(',');
          }
          
          return (
            <div 
              key={plan._id}
              className={`
                p-6 rounded-lg transition-all
                ${isCurrent 
                  ? 'border-2 border-black shadow-inner' 
                  : 'border border-gray-200 shadow-xl hover:shadow-2xl'
                }
              `}
            >
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/{plan.duration}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {planFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    {getFeatureIcon(feature)}
                    <span>{feature.trim()}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="space-y-2">
                  <span className="block text-sm text-gray-600">{t('current_plan')}</span>
                  <button 
                    className="w-full py-2 px-4 rounded border border-black text-black hover:bg-gray-50 transition-colors"
                    onClick={() => handleUpgrade(plan)}
                  >
                    {t('manage_plan')}
                  </button>
                </div>
              ) : (
                <button 
                  className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  onClick={() => handleUpgrade(plan)}
                >
                  {t('upgrade_to')} {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment History Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{t('payment_history')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 text-left">{t('payment_date')}</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">{t('amount_paid')}</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">{t('payment_method')}</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">{t('invoice')}</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-gray-200">{payment.date}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{payment.amount}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{payment.method}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <a href={payment.invoice} className="text-blue-600 hover:underline">
                      {t('download')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6">
          <h3 className="text-xl font-bold">
            {currentPlanId === selectedPlan?._id 
              ? t('manage_subscription') 
              : `${t('upgrade_to')} ${selectedPlan?.name}`}
          </h3>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {selectedPlan.name} {t('plan')}
                  </span>
                  <span className="font-bold">
                    ${selectedPlan.price}/{selectedPlan.duration}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t('billed_period')} {selectedPlan.duration}. {t('cancel_anytime')}
                </p>
              </div>
              {/* If vendor is already on this plan, show "Cancel Subscription" (example).
                  Otherwise, show PaymentForm to upgrade. */}
              {currentPlanId === selectedPlan._id ? (
                <button 
                  className="w-full py-2 px-4 rounded border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('cancel_subscription')}
                </button>
              ) : (
                <PaymentForm />
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionManager;
