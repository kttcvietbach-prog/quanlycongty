// VIETBACHERP ERP - Modular Bootstrap
// Entry point for modular app

import './lib/utils.js';
import './core/navigation.js';
import './core/auth.js';
import './pages/home.js';
import './pages/profile.js';

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global Error:', e.error);
  // Show user-friendly error
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise:', e.reason);
});

// Init app
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ VIETBACHERP Modular App Initialized');
  window.erpApp = window.erpApp || {};
  
  // Import dynamic pages
  if (location.hash) {
    const page = location.hash.slice(1);
    window.erpNav.navigateTo(page);
  } else {
    window.erpNav.navigateTo('trang-chu');
  }
});

// Export for backward compat
window.bootstrapApp = () => {
  console.log('🚀 App bootstrapped with modules');
};

