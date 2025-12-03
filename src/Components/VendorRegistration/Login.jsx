import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import BaseURL from '../BaseURL/BaseURL';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  // Set initial page direction based on language
  useEffect(() => {
    const currentLang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
    if (currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  const validateForm = () => {
    const newErrors = {};
    // Email validation
    if (!formData.email) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('password_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BaseURL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await response.json();
        setIsLoading(false);
        if (response.ok) {
          // Use the login function from AuthContext to store token and vendor data
          login(data.token, data.vendor);
          
          // Show success toast
          toast.success(t('login_success'));
          console.log('Login successful:', data);
          navigate('/'); // Redirect to the home page
        } else {
          // Show error toast with the message from the server
          let errorMessage = data.message || t('login_failed');
          
          // Translate common error messages
          if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid email or password')) {
            errorMessage = i18n.language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password';
          } else if (errorMessage.includes('Vendor not found') || errorMessage.includes('User not found')) {
            errorMessage = i18n.language === 'ar' ? 'البائع غير موجود' : 'Vendor not found';
          } else if (errorMessage.includes('Account is suspended') || errorMessage.includes('Account suspended')) {
            errorMessage = i18n.language === 'ar' ? 'الحساب معطل' : 'Account is suspended';
          }
          
          toast.error(errorMessage);
        }
      } catch (error) {
        setIsLoading(false);
        let errorMessage = t('error_occurred');
        
        if (error.message && error.message.includes('NetworkError')) {
          errorMessage = i18n.language === 'ar' ? 'خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' : 'Network error. Please check your connection and try again.';
        }
        
        toast.error(errorMessage);
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl relative">
        {/* Language Switcher */}
        <div className={`absolute top-4 ${i18n.language === 'ar' ? 'left-4' : 'right-4'}`}>
          <LanguageSwitcher />
        </div>
       
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('welcome_back')}</h2>
          <p className="text-sm text-gray-500">
            {t('please_enter_credentials')}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className={`text-sm font-medium text-gray-700 block ${
              i18n.language === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {t('email_address')}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 flex items-center pointer-events-none ${
                i18n.language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'
              }`}>
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                className={`block w-full py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ease-in-out ${
                  i18n.language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                }`}
                placeholder={t('enter_email')}
              />
            </div>
            {errors.email && (
              <p className={`text-red-500 text-sm mt-1 ${
                i18n.language === 'ar' ? 'text-right' : 'text-left'
              }`}>{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className={`text-sm font-medium text-gray-700 block ${
              i18n.language === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {t('password')}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 flex items-center pointer-events-none ${
                i18n.language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'
              }`}>
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                className={`block w-full py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ease-in-out ${
                  i18n.language === 'ar' ? 'pr-10 pl-12' : 'pl-10 pr-12'
                }`}
                placeholder={t('enter_password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 flex items-center ${
                  i18n.language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className={`text-red-500 text-sm mt-1 ${
                i18n.language === 'ar' ? 'text-right' : 'text-left'
              }`}>{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t('sign_in')
            )}
          </button>

          {/* Sign up link */}
          <div className="text-center text-sm">
            <span className="text-gray-500">{t('dont_have_account')}</span>{' '}
            <a href="/registration" className="font-medium text-black hover:text-gray-800">
              {t('sign_up_now')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
