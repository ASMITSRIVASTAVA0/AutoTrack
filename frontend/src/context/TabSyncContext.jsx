// context/TabSyncContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const TabSyncContext = createContext();

export const useTabSync = () => useContext(TabSyncContext);

export const TabSyncProvider = ({ children }) => {
  const [tabId] = useState(() => sessionStorage.getItem('tabId') || `tab_${Date.now()}`);
  
  useEffect(() => {
    // Store tab ID in session storage
    sessionStorage.setItem('tabId', tabId);
    
    // Set up BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('app_tab_sync');
    
    // Listen for messages from other tabs
    channel.onmessage = (event) => {
      if (event.data.type === 'CONTEXT_UPDATE' && event.data.tabId !== tabId) {
        console.log('Received context update from another tab:', event.data);
        // You can update local context based on this if needed
      }
    };
    
    // Cleanup
    return () => {
      channel.close();
    };
  }, [tabId]);
  
  const broadcastContextUpdate = (contextType, data) => {
    try {
      const channel = new BroadcastChannel('app_tab_sync');
      channel.postMessage({
        type: 'CONTEXT_UPDATE',
        tabId,
        contextType,
        data,
        timestamp: Date.now()
      });
      channel.close();
    } catch (error) {
      console.error('Error broadcasting context update:', error);
    }
  };
  
  return (
    <TabSyncContext.Provider value={{ tabId, broadcastContextUpdate }}>
      {children}
    </TabSyncContext.Provider>
  );
};

TabSyncProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TabSyncContext;