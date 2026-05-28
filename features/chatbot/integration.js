/**
 * Quick Integration Guide - ERP Chatbot
 * Hướng dẫn tích hợp nhanh Chatbot vào app chính
 */

// ========================================
// STEP 1: Thêm vào HTML
// ========================================
/*
<!-- Thêm vào cuối file index.html, trước closing </body> -->
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  
  // Khởi tạo khi page load
  window.addEventListener('DOMContentLoaded', () => {
    initChatbot({
      apiBaseUrl: 'http://localhost:3001',
      userId: getCurrentUserId()
    });
  });
</script>
*/

// ========================================
// STEP 2: Tích hợp với app.js (Recommended)
// ========================================

/**
 * Thêm vào app.js nơi bạn initialize các module khác
 */
export async function initializeChatbot() {
  try {
    // Import chatbot modules
    const { initChatbot } = await import('./features/chatbot/chatbot-advanced.js');
    const { erpContextManager } = await import('./features/chatbot/erp-context.js');

    // Get current user
    const user = getCurrentUser();

    // Initialize chatbot
    initChatbot({
      apiBaseUrl: process.env.CHATBOT_API_URL || 'http://localhost:3001',
      userId: user?.id || 'anonymous',
      systemContext: `Người dùng: ${user?.name} (${user?.role})`
    });

    console.log('✅ Chatbot initialized successfully');

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize chatbot:', error);
    return false;
  }
}

// ========================================
// STEP 3: Setup Data Context (Quan trọng!)
// ========================================

/**
 * Thiết lập dữ liệu ERP để chatbot có thể truy cập
 * Gọi hàm này mỗi khi dữ liệu module thay đổi
 */
export function setupChatbotContext() {
  // HR Module
  if (window.hrModule && typeof window.hrModule.getEmployees === 'function') {
    window.employeeData = window.hrModule.getEmployees();
  }

  // Project Module
  if (window.projectModule && typeof window.projectModule.getProjects === 'function') {
    window.projectData = window.projectModule.getProjects();
  }

  // Sales Module
  if (window.salesModule && typeof window.salesModule.getOrders === 'function') {
    window.salesData = window.salesModule.getOrders();
  }

  // Purchase Module
  if (window.purchaseModule && typeof window.purchaseModule.getOrders === 'function') {
    window.purchaseData = window.purchaseModule.getOrders();
  }

  // Inventory Module
  if (window.inventoryModule && typeof window.inventoryModule.getItems === 'function') {
    window.inventoryData = window.inventoryModule.getItems();
  }

  // Financial Module
  if (window.financialModule && typeof window.financialModule.getFinancialData === 'function') {
    window.financialData = window.financialModule.getFinancialData();
  }

  // Production Module
  if (window.productionModule && typeof window.productionModule.getOrders === 'function') {
    window.productionData = window.productionModule.getOrders();
  }

  console.log('✅ Chatbot context updated');
}

// ========================================
// STEP 4: Integrasi Penuh ke app.js
// ========================================

/**
 * Contoh lengkap mengintegrasikan ke app.js
 */
export const chatbotIntegration = {
  /**
   * Initialize during app startup
   */
  async initialize() {
    // 1. Start backend service check
    await this.checkBackendService();

    // 2. Initialize chatbot widget
    await this.initializeWidget();

    // 3. Setup data context
    this.setupContext();

    // 4. Setup event listeners
    this.setupEventListeners();

    // 5. Setup periodic context updates
    this.setupAutoUpdate();

    return true;
  },

  /**
   * Check if backend service is running
   */
  async checkBackendService() {
    try {
      const response = await fetch('http://localhost:3001/api/chat/status');
      if (!response.ok) throw new Error('Service unavailable');

      console.log('✅ Chatbot service is online');
      return true;
    } catch (error) {
      console.warn('⚠️ Chatbot service offline:', error);
      return false;
    }
  },

  /**
   * Initialize chatbot widget
   */
  async initializeWidget() {
    const { initChatbot } = await import('./features/chatbot/chatbot-advanced.js');

    initChatbot({
      apiBaseUrl: 'http://localhost:3001',
      userId: getCurrentUser()?.id
    });
  },

  /**
   * Setup context data
   */
  setupContext() {
    setupChatbotContext();
  },

  /**
   * Setup event listeners for data updates
   */
  setupEventListeners() {
    // Listen for module data changes
    document.addEventListener('module:dataUpdated', (e) => {
      const { module } = e.detail;
      console.log(`📊 ${module} data updated, refreshing chatbot context...`);
      setupChatbotContext();
    });

    // Listen for user changes
    document.addEventListener('user:changed', (e) => {
      const { user } = e.detail;
      console.log(`👤 User changed to ${user.name}, updating chatbot...`);
      // Chatbot akan tự lấy user mới từ localStorage/window
    });
  },

  /**
   * Auto-update context every 5 minutes
   */
  setupAutoUpdate() {
    setInterval(() => {
      setupChatbotContext();
    }, 5 * 60 * 1000);
  }
};

// ========================================
// STEP 5: Emit Events từ các Module
// ========================================

/**
 * Trong các module khác (sales.js, hr.js, etc), emit event khi dữ liệu thay đổi:
 */

// Ví dụ trong features/sales/customers.js:
function onSalesDataUpdated() {
  document.dispatchEvent(new CustomEvent('module:dataUpdated', {
    detail: { module: 'Sales' }
  }));
}

// Ví dụ trong features/hr/employees.js:
function onEmployeeDataUpdated() {
  document.dispatchEvent(new CustomEvent('module:dataUpdated', {
    detail: { module: 'HR' }
  }));
}

// ========================================
// STEP 6: Helper Functions
// ========================================

/**
 * Get current user
 */
function getCurrentUser() {
  return window.currentUser || {
    id: 'user_' + Date.now(),
    name: 'Guest User',
    role: 'User',
    department: 'General'
  };
}

/**
 * Send custom question to chatbot programmatically
 */
export async function askChatbot(question) {
  try {
    if (!window.chatbotState) {
      console.error('Chatbot not initialized');
      return null;
    }

    const response = await fetch('http://localhost:3001/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: window.chatbotState.sessionId,
        message: question,
        userId: getCurrentUser().id
      })
    });

    const data = await response.json();
    return data.success ? data.message : null;
  } catch (error) {
    console.error('Error asking chatbot:', error);
    return null;
  }
}

/**
 * Analyze data with chatbot
 */
export async function analyzeWithChatbot(data, analysisType = 'general') {
  try {
    if (!window.chatbotState) {
      console.error('Chatbot not initialized');
      return null;
    }

    const response = await fetch('http://localhost:3001/api/chat/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: window.chatbotState.sessionId,
        data,
        analysisType
      })
    });

    const result = await response.json();
    return result.success ? result.analysis : null;
  } catch (error) {
    console.error('Error analyzing with chatbot:', error);
    return null;
  }
}

// ========================================
// STEP 7: Usage Examples
// ========================================

/*
// Ví dụ 1: Khởi tạo trong app.js
import { chatbotIntegration, setupChatbotContext } from './features/chatbot/integration.js';

window.addEventListener('DOMContentLoaded', async () => {
  await chatbotIntegration.initialize();
});

// Ví dụ 2: Hỏi chatbot từ code khác
import { askChatbot } from './features/chatbot/integration.js';

async function generateSalesReport() {
  const analysis = await askChatbot('Tóm tắt doanh số tháng này');
  console.log(analysis);
}

// Ví dụ 3: Phân tích dữ liệu
import { analyzeWithChatbot } from './features/chatbot/integration.js';

async function analyzeSalesData() {
  const salesData = window.salesData;
  const analysis = await analyzeWithChatbot(salesData, 'sales');
  console.log(analysis);
}

// Ví dụ 4: Update context khi dữ liệu thay đổi
function saveSales(salesData) {
  // ... lưu dữ liệu
  
  // Update chatbot context
  window.salesData = salesData;
  document.dispatchEvent(new CustomEvent('module:dataUpdated', {
    detail: { module: 'Sales' }
  }));
}
*/

export { chatbotIntegration, setupChatbotContext, getCurrentUser, askChatbot, analyzeWithChatbot };
