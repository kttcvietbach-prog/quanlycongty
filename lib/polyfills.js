// VIETBACH ERP - Module Compatibility Polyfills
// Fix "window.erpApp is undefined" errors for legacy modules

(function() {
  'use strict';

  // Ensure window.erpApp always exists
  window.erpApp = window.erpApp || {};
  window.erpApp.boms = window.erpApp.boms || [];
  window.erpApp.workCenters = window.erpApp.workCenters || [];
  window.erpApp.handleWcSearch = window.erpApp.handleWcSearch || function() { console.log('WC Search fallback'); };
  window.erpApp.handleRoutingSearch = window.erpApp.handleRoutingSearch || function() { console.log('Routing Search fallback'); };
  window.erpApp.filterMaintenanceSector = window.erpApp.filterMaintenanceSector || function() { console.log('Maintenance filter fallback'); };
  window.erpApp._getData = window.erpApp._getData || function(name) { 
    // Silenced warning during boot as per user request
    // console.log('erpApp._getData boot-fallback:', name); 
    return []; 
  };
  window.erpApp._setData = window.erpApp._setData || function(name, data) { 
    console.log('erpApp._setData fallback:', name); 
  };

  // Add all legacy data getters/setters
  ['employees', 'contracts', 'suppliers', 'rfqs', 'purchaseOrders', 'customers'].forEach(key => {
    if (!window.erpApp[key]) {
      Object.defineProperty(window.erpApp, key, {
        get() { return []; },
        set(data) { console.log(`${key} set:`, data.length || 0); }
      });
    }
  });

  // Legacy global vars
  window.boms = window.boms || [];
  window.workCenters = window.workCenters || [];

  // Safe initialization wrapper
  const originalInit = window.initModule || function(){};
  window.initModule = function(name) {
    try {
      originalInit.call(this, name);
    } catch (e) {
      console.warn('Module init safe-fail:', name, e.message);
    }
  };

  // Global placeholders to prevent 'not defined' errors before modules load
  window.showToast = window.showToast || function(m, t) { console.info('Pending Toast:', m, t); };
  window.notifyCRUD = window.notifyCRUD || function(m, a) { console.info('Pending Notification:', m, a); };
  window.erpApp.notifyCRUD = window.erpApp.notifyCRUD || window.notifyCRUD;
  window.erpApp.showToast = window.erpApp.showToast || window.showToast;

  console.log('✅ ERP Polyfills loaded - Compatibility mode ON');
})();

