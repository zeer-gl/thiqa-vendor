import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
    
    // Change page direction based on language
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.setAttribute('dir', 'ltr');
    }
    
    // Save to localStorage
    localStorage.setItem('i18nextLng', lang);
  };

  const currentLanguage = i18n.language || 'en';
  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>
          {currentLanguage === 'ar' ? 'العربية' : 'English'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown menu */}
          <div className={`absolute top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20 ${
            currentLanguage === 'ar' ? 'left-0' : 'right-0'
          }`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-gray-50 text-black font-medium'
                    : 'text-gray-700'
                } ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {lang.nativeLabel}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

