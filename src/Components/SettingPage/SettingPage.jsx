import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import axios from 'axios';
import BaseURL from '../BaseURL/BaseURL';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const SettingsPage = () => {
  const { t } = useTranslation(); // Use the translation hook
  const [profile, setProfile] = useState({
    email: '',
    businessName: '',
    contactNumber: '',
    logoUrl: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA'
    },
    description: ''
  });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const vendorId = localStorage.getItem('vendorId');

  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: false,
    stockAlerts: false,
    salesNotifications: false
  });

  const [dragActive, setDragActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // State for Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendor = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`${BaseURL}/get-vendor/${vendorId}`);
        const vendor = response.data.vendor;

        // Check if address is an object or a string
        if (typeof vendor.address === 'string') {
          // Parse the address string into separate fields
          const addressString = vendor.address; // e.g., "123 Fashion Street, New York, NY 10001"
          const addressParts = addressString.split(', ');
          const street = addressParts[0]?.trim() || '';
          const city = addressParts[1]?.trim() || '';
          const stateZip = addressParts[2]?.trim() || '';
          const [state, postalCode] = stateZip.split(' ') || ['', ''];

          setProfile({
            email: vendor.email,
            businessName: vendor.businessName,
            contactNumber: vendor.phone,
            logoUrl: vendor.logo,
            address: {
              street,
              city,
              state,
              postalCode,
              country: 'USA' // Default or derive from elsewhere
            },
            description: vendor.description || ''
          });
        } else if (typeof vendor.address === 'object') {
          setProfile({
            email: vendor.email,
            businessName: vendor.businessName,
            contactNumber: vendor.phone,
            logoUrl: vendor.logo,
            address: {
              street: vendor.address.street || '',
              city: vendor.address.city || '',
              state: vendor.address.state || '',
              postalCode: vendor.address.postalCode || '',
              country: vendor.address.country || 'USA'
            },
            description: vendor.description || ''
          });
        }

        setNotificationPreferences({
          orderUpdates: vendor.notificationPreferences.orderUpdates,
          stockAlerts: vendor.notificationPreferences.stockAlerts,
          salesNotifications: vendor.notificationPreferences.salesNotifications
        });
      } catch (err) {
        setError(err.response?.data?.message || t('failed_to_fetch_vendor'));
      } finally {
        setIsFetching(false);
      }
    };

    fetchVendor();
  }, [vendorId]);

  // Handle changes in profile fields, including nested address fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle changes in notification preferences
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences(prev => ({ ...prev, [name]: checked }));
  };

  // Handle drag events for logo upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setDragActive(false);
    }
  };

  // Handle drop event for logo upload
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedLogo(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection for logo upload
  const handleLogoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
    }
  };

  // Handle saving changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('businessName', profile.businessName);
      formData.append('email', profile.email);
      formData.append('phone', profile.contactNumber);
      formData.append('description', profile.description);
  
      // Add the missing fields
      formData.append('businessType', profile.businessType || ''); // Adjust as needed
      formData.append('taxId', profile.taxId || ''); // Adjust as needed
  
      // Append notification preferences
      formData.append('orderUpdates', notificationPreferences.orderUpdates);
      formData.append('stockAlerts', notificationPreferences.stockAlerts);
      formData.append('salesNotifications', notificationPreferences.salesNotifications);
  
      // Append address fields
      formData.append('address', JSON.stringify(profile.address)); // Convert address object to string
      formData.append('city', profile.address.city);
      formData.append('state', profile.address.state);
      formData.append('zipCode', profile.address.postalCode); // Adjust if you need to map this differently
      formData.append('country', profile.address.country);
  
      if (selectedLogo) {
        formData.append('logo', selectedLogo);
      }
  
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
  
      const response = await axios.put(`${BaseURL}/update-vendor/${vendorId}`, formData, config);
      const updatedVendor = response.data.vendor;
      setProfile(prev => ({
        ...prev,
        logoUrl: updatedVendor.logo
      }));
      setSelectedLogo(null);
      toast.success(t('changes_saved_successfully'));
    } catch (err) {
      setError(err.response?.data?.message || t('failed_to_save_changes'));
      toast.error(err.response?.data?.message || t('failed_to_save_changes'));
    } finally {
      setIsSaving(false);
    }
  };
  

  // Open the password modal 
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  // Close the password modal and reset password fields
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setPasswordError(null);
  };

  // Handle changes in password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Submit password change
  const submitPasswordChange = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return;
    }

    // Optional: Add more password validations here

    setPasswordLoading(true);
    setPasswordError(null);
    try {
      await axios.put(`${BaseURL}/${vendorId}/change-password`, {
        currentPassword,
        newPassword
      });
      toast.success(t('password_changed_successfully'));
      closePasswordModal();
    } catch (err) {
      setPasswordError(err.response?.data?.message || t('failed_to_change_password'));
      toast.error(err.response?.data?.message || t('failed_to_change_password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center items-center h-screen">{t('loading')}...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ToastContainer />
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
      </div>

      {/* Display Error if any */}
      {error && <div className="text-red-500 text-center mt-4">{error}</div>}

      {/* Account Settings Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-black pb-2">{t('account_settings')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              readOnly
              className="w-full text-lg border-black border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('password')}</label>
            <button
              className="text-blue-600 hover:underline"
              onClick={openPasswordModal}
            >
              {t('change_password')}
            </button>
          </div>
        </div>
      </div>

      {/* Business Information Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-black pb-2">{t('business_information')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('business_name')}</label>
            <input
              type="text"
              name="businessName"
              value={profile.businessName}
              onChange={handleProfileChange}
              className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('contact_number')}</label>
            <input
              type="text"
              name="contactNumber"
              value={profile.contactNumber}
              onChange={handleProfileChange}
              className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('street')}</label>
              <input
                type="text"
                name="address.street"
                value={profile.address.street}
                onChange={handleProfileChange}
                className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('city')}</label>
              <input
                type="text"
                name="address.city"
                value={profile.address.city}
                onChange={handleProfileChange}
                className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('state')}</label>
              <input
                type="text"
                name="address.state"
                value={profile.address.state}
                onChange={handleProfileChange}
                className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('postal_code')}</label>
              <input
                type="text"
                name="address.postalCode"
                value={profile.address.postalCode}
                onChange={handleProfileChange}
                className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('country')}</label>
              <input
                type="text"
                name="address.country"
                value={profile.address.country}
                onChange={handleProfileChange}
                className="w-full text-lg border-black border rounded-lg p-2 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Logo Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-dashed border-2 ${dragActive ? 'border-black' : 'border-gray-400'} 
              rounded-lg p-8 text-center cursor-pointer transition-colors duration-200`}
            onClick={() => document.getElementById('logoUpload').click()}
          >
            <input
              type="file"
              id="logoUpload"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-2">
              <Camera className="w-8 h-8" />
              <p className="text-sm">
                {t('drag_and_drop_logo')}
              </p>
              {selectedLogo ? (
                <p className="text-sm font-medium">{t('file_selected')}: {selectedLogo.name}</p>
              ) : profile.logoUrl ? (
                <div className="mt-4">
                  <img src={profile.logoUrl} alt="Current Logo" className="w-32 h-32 object-contain" />
                  <p className="text-sm mt-2">{t('current_logo')}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-black pb-2">{t('notification_preferences')}</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="orderUpdates"
              checked={notificationPreferences.orderUpdates}
              onChange={handleToggleChange}
              className="w-5 h-5 text-black border-black rounded focus:ring-black"
            />
            <label htmlFor="orderUpdates" className="ml-3 text-lg">{t('order_updates')}</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="stockAlerts"
              checked={notificationPreferences.stockAlerts}
              onChange={handleToggleChange}
              className="w-5 h-5 text-black border-black rounded focus:ring-black"
            />
            <label htmlFor="stockAlerts" className="ml-3 text-lg">{t('stock_alerts')}</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="salesNotifications"
              checked={notificationPreferences.salesNotifications}
              onChange={handleToggleChange}
              className="w-5 h-5 text-black border-black rounded focus:ring-black"
            />
            <label htmlFor="salesNotifications" className="ml-3 text-lg">{t('sales_notifications')}</label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveChanges}
        className="w-full md:w-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        disabled={isSaving}
      >
        {isSaving ? t('saving') : t('save_changes')}
      </button>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{t('change_password')}</h2>
            {passwordError && <div className="text-red-500 mb-2">{passwordError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('current_password')}</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('new_password')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('confirm_new_password')}</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closePasswordModal}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                disabled={passwordLoading}
              >
                {t('cancel')}
              </button>
              <button
                onClick={submitPasswordChange}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                disabled={passwordLoading}
              >
                {passwordLoading ? t('changing') : t('change_password')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
