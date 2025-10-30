import React from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';


const Layout = ({ children }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`flex h-screen bg-gray-100 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:ml-64">
        {children}
      </main>
    </div>
  );
};

export default Layout;
