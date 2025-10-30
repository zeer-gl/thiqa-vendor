import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Package,
  Building2,
  Settings,
  ChartColumnBig,
  ChartNoAxesCombined,
  UserCheck,
  LogOut,
  FileText,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Sidebar items with translation keys for labels
  const sidebarItems = [
    { icon: <Package className="w-5 h-5" />, label: "manage_products", route: "/" },
    { icon: <Building2 className="w-5 h-5" />, label: "manage_orders", route: "/manage-orders" },
    { icon: <FileText className="w-5 h-5" />, label: "demand_quotes", route: "/demand-quotes" },
    { icon: <ChartNoAxesCombined className="w-5 h-5" />, label: "pos_integration", route: "/pos-integration" },
    { icon: <ChartColumnBig className="w-5 h-5" />, label: "sales_analytics", route: "/sales-analytics" },
    { icon: <UserCheck className="w-5 h-5" />, label: "manage_subscription", route: "/subscription-manager" },
    { icon: <Settings className="w-5 h-5" />, label: "settings", route: "/settings" },
  ];

  const handleLogout = () => {
    logout();
  };

  // Function to switch language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative">
      {/* Hamburger Menu Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform transition-transform duration-200 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">{i18n.t('welcome')}</h2>
          <p className="text-sm text-gray-400 mt-1">{i18n.t('manage_store')}</p>
        </div>

        {/* Language Switcher Dropdown */}
        <div className="px-4 py-3">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="mt-6">
          <div className="px-4">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.route}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors mb-1 group ${location.pathname === item.route ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="ml-3">{i18n.t(item.label)}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">{i18n.t('logout')}</span>
          </button>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
