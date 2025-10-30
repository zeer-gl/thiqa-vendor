import React, { createContext, useState, useEffect } from 'react';

export const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
  const [vendorId, setVendorId] = useState(null);
  

  useEffect(() => {
    // Retrieve vendorId from localStorage when the provider mounts
    const storedVendorId = localStorage.getItem('vendorId');
    console.log("storeid",storedVendorId);
    if (storedVendorId) {
      setVendorId(storedVendorId);
    }
  }, []);

  const updateVendorId = (id) => {
    setVendorId(id);
    if (id) {
      localStorage.setItem('vendorId', id);
    } else {
      localStorage.removeItem('vendorId');
    }
  };

  return (
    <VendorContext.Provider value={{ vendorId, setVendorId: updateVendorId }}>
      {children}
    </VendorContext.Provider>
  );
};
