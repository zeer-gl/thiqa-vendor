import React, { useState } from 'react';
import { Bell, Package, CreditCard, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      message: 'New order #1234 received',
      timestamp: '2 minutes ago',
      isNew: true,
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received for order #1230',
      timestamp: '1 hour ago',
      isNew: true,
    },
    {
      id: 3,
      type: 'inventory',
      message: 'Low stock alert: Product SKU-789',
      timestamp: '3 hours ago',
      isNew: false,
    },
    {
      id: 4,
      type: 'order',
      message: 'Order #1229 has been shipped',
      timestamp: '5 hours ago',
      isNew: false,
    }
  ]);

  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'inventory':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          <span className="px-2 py-1 text-sm bg-black text-white rounded-full">
            {notifications.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Notifications List */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            <div className="relative pl-8 pr-4 border-l border-gray-300 ml-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="py-4 relative transition-all duration-300 ease-in-out"
                >
                  {/* New notification indicator */}
                  {notification.isNew && (
                    <div className="absolute left-0 w-2 h-2 -ml-5 bg-black rounded-full" />
                  )}
                  
                  <div className="flex items-start justify-between group">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getIcon(notification.type)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all duration-200"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No new notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorNotifications;