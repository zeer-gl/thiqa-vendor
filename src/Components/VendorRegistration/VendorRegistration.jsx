import React, { useState } from 'react';
import { X, Phone, Building2, FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BaseURL from '../BaseURL/BaseURL';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const VendorRegistration = () => {
  const { t } = useTranslation(); // Use the translation hook
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    businessName: '',
    businessType: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
    },
    taxId: '',
    email: '',
    password: '',
  });
  const [vendorId, setVendorId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: t('phone_verification'), icon: Phone },
    { number: 2, title: t('business_details'), icon: Building2 },
    { number: 3, title: t('tax_information'), icon: FileText },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); // For preview purposes
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'postalCode', 'country'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setErrors({});
    try {
      const response = await axios.post(`${BaseURL}/send-otp`, {
        phoneNumber: formData.phoneNumber,
      });

      setVendorId(response.data.vendorId);
      localStorage.setItem('vendorId', response.data.vendorId);
      console.log(response.data.vendorId);

      setShowOtpModal(true);
    } catch (error) {
      console.error('Send OTP Error:', error);
      setErrors({
        sendOtp: error.response?.data?.message || t('failed_to_send_otp'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrors({});
    try {
      const otp = otpValues.join('');
      const response = await axios.post(`${BaseURL}/verify-otp`, {
        vendorId,
        otp,
      });

      setIsOtpVerified(true);
      setCurrentStep(2);
      setShowOtpModal(false);
    } catch (error) {
      console.error('Verify OTP Error:', error);
      setErrors({
        verifyOtp: error.response?.data?.message || t('otp_verification_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append('vendorId', vendorId);
    formDataToSend.append('businessName', formData.businessName);
    formDataToSend.append('businessType', formData.businessType);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('taxId', formData.taxId);
    
    // Append address as an object (not as a string)
    formDataToSend.append('address', JSON.stringify(formData.address));
  
    // Append logo if it's present
    if (logoFile) {
      formDataToSend.append('logo', logoFile);
    }
  
    try {
      const response = await axios.post(`${BaseURL}/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success(response.data.message);
      navigate('/');
    } catch (error) {
      console.error('Registration Error:', error);
      setErrors({
        register: error.response?.data?.message || t('registration_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 text-gray-300'
                }`}
              >
                <step.icon size={20} />
              </div>
              <span
                className={`mt-2 text-xs ${
                  currentStep >= step.number ? 'text-black' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhoneVerification = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('phone_number')}</label>
        <div className="flex space-x-2">
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="flex-1 p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
            placeholder={t('enter_phone_number')}
          />
          <button
            onClick={handleSendOtp}
            className={`px-4 py-2 rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            } transition-colors`}
            disabled={loading || !formData.phoneNumber}
          >
            {loading ? t('sending_otp') : t('send_otp')}
          </button>
        </div>
        {errors.sendOtp && <p className="text-red-500 text-sm">{errors.sendOtp}</p>}
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('business_name')}</label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('enter_business_name')}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('business_logo')}</label>
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
        />
        {logoPreview && (
          <div className="mt-2">
            <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-contain" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('business_type')}</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
        >
          <option value="">{t('select_business_type')}</option>
          <option value="sole-proprietorship">{t('sole_proprietorship')}</option>
          <option value="llc">{t('llc')}</option>
          <option value="corporation">{t('corporation')}</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('street_address')}</label>
        <input
          type="text"
          name="street"
          value={formData.address.street}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('enter_street_address')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t('city')}</label>
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
            placeholder={t('city')}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t('state')}</label>
          <input
            type="text"
            name="state"
            value={formData.address.state}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
            placeholder={t('state')}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t('zip_code')}</label>
          <input
            type="text"
            name="postalCode"
            value={formData.address.postalCode}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
            placeholder={t('zip_code')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('country')}</label>
        <input
          type="text"
          name="country"
          value={formData.address.country}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('country')}
          disabled
        />
      </div>
      {errors.register && <p className="text-red-500 text-sm">{errors.register}</p>}
    </div>
  );

  const renderTaxInformation = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('tax_id_number')}</label>
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('enter_tax_id')}
        />
        <p className="text-sm text-gray-500">{t('tax_id_info')}</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('business_email')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('enter_business_email')}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t('password')}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:border-black focus:outline-none"
          placeholder={t('create_password')}
        />
      </div>
      <button
        onClick={handleRegister}
        className={`w-full px-4 py-2 mt-4 bg-black text-white rounded hover:bg-gray-800 transition-colors ${
          !isCurrentStepCompleted() ? 'cursor-not-allowed bg-gray-300' : ''
        }`}
        disabled={!isCurrentStepCompleted() || loading}
      >
        {loading ? t('registering') : t('submit')}
      </button>
      {errors.register && <p className="text-red-500 text-sm">{errors.register}</p>}
    </div>
  );

  const renderOtpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('verify_phone_number')}</h3>
          <button onClick={() => setShowOtpModal(false)} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{t('enter_otp_code')}</p>
        <div className="flex justify-between mb-6">
          {otpValues.map((value, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-12 text-center border border-gray-300 rounded focus:border-black focus:outline-none"
            />
          ))}
        </div>
        {errors.verifyOtp && <p className="text-red-500 text-sm">{errors.verifyOtp}</p>}
        <button
          onClick={handleVerifyOtp}
          className={`w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? t('verifying') : t('verify_otp')}
        </button>
      </div>
    </div>
  );

  const isCurrentStepCompleted = () => {
    if (currentStep === 1) {
      return isOtpVerified;
    } else if (currentStep === 2) {
      return (
        formData.businessName &&
        formData.businessType &&
        formData.address.street &&
        formData.address.city &&
        formData.address.state &&
        formData.address.postalCode &&
        formData.address.country
      );
    } else if (currentStep === 3) {
      return formData.taxId && formData.email && formData.password;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        {renderStepIndicator()}
        {currentStep === 1 && renderPhoneVerification()}
        {currentStep === 2 && renderBusinessDetails()}
        {currentStep === 3 && renderTaxInformation()}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-white hover:bg-gray-400'
            } transition-colors`}
          >
            {t('back')}
          </button>
          {currentStep < steps.length && (
            <button
              onClick={() => {
                if (currentStep === 1 && isOtpVerified) {
                  setCurrentStep(2);
                } else if (currentStep === 2) {
                  setCurrentStep(3);
                }
              }}
              disabled={!isCurrentStepCompleted()}
              className={`px-4 py-2 rounded ${
                isCurrentStepCompleted()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              } transition-colors`}
            >
              {t('next')}
            </button>
          )}
        </div>
      </div>
      {showOtpModal && renderOtpModal()}
    </div>
  );
};

export default VendorRegistration;
