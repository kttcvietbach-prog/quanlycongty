/**
 * ERP Chatbot Module - Advanced Frontend Widget
 * Intelligent assistant UI with full feature support
 */

let chatbotState = {
  isOpen: false,
  sessionId: generateSessionId(),
  messages: [],
  isLoading: false,
  apiBaseUrl: 'http://localhost:3001',
  isOnline: false,
  inputHistory: [],
  inputHistoryIndex: -1,
  typingIndicatorTimeout: null,
  unreadCount: 0,
  userId: localStorage.getItem('userId') || 'user_' + Date.now(),
  lastMessageTime: 0,
  rateLimitDelay: 1000 // ms between messages
};

// Quick suggestion templates
const QUICK_SUGGESTIONS = [
  { text: '🎯 Tìm kiếm nhân viên', query: 'Làm cách nào để tìm kiếm nhân viên?' },
  { text: '📊 Báo cáo bán hàng', query: 'Tóm tắt doanh số bán hàng tháng này?' },
  { text: '📦 Tồn kho', query: 'Sản phẩm nào cần đặt hàng gấp?' },
  { text: '💼 Dự án', query: 'Các dự án nào đang tiến hành?' }
];

/**
 * Initialize chatbot widget with configuration
 */
export function initChatbot(config = {}) {
  chatbotState.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3001';
  chatbotState.userId = config.userId || chatbotState.userId;

  // Create UI
  createChatbotUI();
  
  // Setup events
  attachEventListeners();
  
  // Check API status
  checkChatbotStatus();
  
  // Add welcome message
  setTimeout(() => {
    addWelcomeMessage();
  }, 500);

  console.log('✅ Advanced Chatbot initialized', { 
    sessionId: chatbotState.sessionId,
    userId: chatbotState.userId
  });
}

/**
 * Create chatbot HTML structure
 */
function createChatbotUI() {
  // Check if already exists
  if (document.getElementById('erp-chatbot-container')) {return;}

  const chatbotHTML = `
    <div id="erp-chatbot-container" class="erp-chatbot">
      <!-- Chatbot Button -->
      <div id="chatbot-toggle" class="chatbot-toggle" title="Open ERP Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="unread-badge" style="display:none;">1</span>
      </div>

      <!-- Chatbot Window -->
      <div id="chatbot-window" class="chatbot-window" style="display:none;">
        <!-- Header -->
        <div class="chatbot-header">
          <h3>ERP Assistant 🤖</h3>
          <div class="chatbot-header-actions">
            <button id="chatbot-clear" class="chatbot-btn-icon" title="Clear chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              </svg>
            </button>
            <button id="chatbot-close" class="chatbot-btn-icon" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div id="chatbot-messages" class="chatbot-messages"></div>

        <!-- Input -->
        <div class="chatbot-input-group">
          <input
            id="chatbot-input"
            type="text"
            placeholder="Ask me anything about your ERP system..."
            class="chatbot-input"
          />
          <button id="chatbot-send" class="chatbot-btn-send" title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // Add styles
  addChatbotStyles();
}

/**
 * Add chatbot CSS styles
 */
function addChatbotStyles() {
  if (document.getElementById('chatbot-styles')) {return;}

  const styles = document.createElement('style');
  styles.id = 'chatbot-styles';
  styles.textContent = `
    .erp-chatbot {
      --primary: #2563eb;
      --primary-dark: #1e40af;
      --bg-light: #f9fafb;
      --border-color: #e5e7eb;
      --text-dark: #1f2937;
      --text-gray: #6b7280;
    }

    .chatbot-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      z-index: 9998;
      transition: all 0.3s ease;
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    .unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .chatbot-window {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 32px);
        height: 70vh;
        bottom: 24px;
        right: 16px;
        left: 16px;
      }
    }

    .chatbot-header {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    .chatbot-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .chatbot-header-actions {
      display: flex;
      gap: 8px;
    }

    .chatbot-btn-icon {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .chatbot-btn-icon:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--bg-light);
    }

    .chatbot-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }

    .chatbot-message {
      display: flex;
      gap: 8px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chatbot-message.user {
      justify-content: flex-end;
    }

    .chatbot-message-content {
      max-width: 70%;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .chatbot-message.assistant .chatbot-message-content {
      background: white;
      color: var(--text-dark);
      border: 1px solid var(--border-color);
    }

    .chatbot-message.user .chatbot-message-content {
      background: var(--primary);
      color: white;
    }

    .chatbot-message.system .chatbot-message-content {
      background: #fef3c7;
      color: #92400e;
      font-size: 13px;
      text-align: center;
    }

    .chatbot-message.loading {
      justify-content: flex-start;
    }

    .chatbot-typing {
      display: flex;
      gap: 4px;
      padding: 10px 12px;
    }

    .chatbot-typing span {
      width: 6px;
      height: 6px;
      background: var(--text-gray);
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }

    .chatbot-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        opacity: 0.5;
        transform: translateY(0);
      }
      40% {
        opacity: 1;
        transform: translateY(-4px);
      }
    }

    .chatbot-input-group {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--border-color);
      background: white;
    }

    .chatbot-input {
      flex: 1;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chatbot-input:focus {
      border-color: var(--primary);
    }

    .chatbot-btn-send {
      background: var(--primary);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .chatbot-btn-send:hover {
      background: var(--primary-dark);
    }

    .chatbot-btn-send:disabled {
      background: var(--text-gray);
      cursor: not-allowed;
    }
  `;

  document.head.appendChild(styles);
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  const toggle = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const sendBtn = document.getElementById('chatbot-send');
  const input = document.getElementById('chatbot-input');
  const clearBtn = document.getElementById('chatbot-clear');

  toggle.addEventListener('click', toggleChatbot);
  closeBtn.addEventListener('click', () => toggleChatbot(false));
  sendBtn.addEventListener('click', sendMessage);
  clearBtn.addEventListener('click', clearConversation);

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

/**
 * Toggle chatbot window
 */
function toggleChatbot(open = null) {
  const window = document.getElementById('chatbot-window');
  const isCurrentlyOpen = chatbotState.isOpen;

  chatbotState.isOpen = open !== null ? open : !isCurrentlyOpen;

  if (chatbotState.isOpen) {
    window.style.display = 'flex';
    document.getElementById('chatbot-input').focus();
    // Hide unread badge
    document.querySelector('.unread-badge').style.display = 'none';
  } else {
    window.style.display = 'none';
  }
}

/**
 * Send message to chatbot
 */
async function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();

  if (!message) {return;}
  if (chatbotState.isLoading) {return;}

  // Add user message
  addMessage('user', message);
  input.value = '';

  // Show typing indicator
  chatbotState.isLoading = true;
  addMessage('loading', '<div class="chatbot-typing"><span></span><span></span><span></span></div>');

  try {
    const response = await fetch(`${chatbotState.apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: chatbotState.sessionId,
        message: message,
        systemContext: getSystemContext()
      })
    });

    if (!response.ok) {throw new Error('API error');}

    const data = await response.json();

    // Remove typing indicator
    removeLastMessage();

    // Add assistant response
    addMessage('assistant', data.response);

  } catch (error) {
    removeLastMessage();
    addMessage('system', '❌ 연결 오류. 나중에 다시 시도해주세요.');
    console.error('Chatbot error:', error);
  } finally {
    chatbotState.isLoading = false;
  }
}

/**
 * Add message to chat
 */
function addMessage(role, content) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chatbot-message ${role}`;

  if (role === 'loading') {
    msgDiv.innerHTML = content;
  } else {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-message-content';
    contentDiv.textContent = content;
    msgDiv.appendChild(contentDiv);
  }

  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  chatbotState.messages.push({ role, content });
}

/**
 * Remove last message (for typing indicator)
 */
function removeLastMessage() {
  const messagesContainer = document.getElementById('chatbot-messages');
  if (messagesContainer.lastChild) {
    messagesContainer.removeChild(messagesContainer.lastChild);
  }
  if (chatbotState.messages.length > 0) {
    chatbotState.messages.pop();
  }
}

/**
 * Clear conversation
 */
async function clearConversation() {
  const performClear = async () => {
    try {
      await fetch(`${chatbotState.apiBaseUrl}/api/chat/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: chatbotState.sessionId })
      });

      // Clear UI
      const messagesContainer = document.getElementById('chatbot-messages');
      if (messagesContainer) {messagesContainer.innerHTML = '';}
      chatbotState.messages = [];
      addMessage('system', 'Conversation cleared. How can I help?');

    } catch (error) {
      console.error('Error clearing chat:', error);
      if (window.erpApp && window.erpApp.showToast) {
        window.erpApp.showToast('Lỗi khi xóa hội thoại', 'error');
      }
    }
  };

  if (window.erpApp && window.erpApp.showConfirm) {
    window.erpApp.showConfirm('Xóa hội thoại', 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này?', performClear);
  } else {
    if (confirm('Clear conversation?')) {
      performClear();
    }
  }
}

/**
 * Get current system context for chatbot
 */
function getSystemContext() {
  const context = {
    timestamp: new Date().toISOString(),
    currentPage: window.location.pathname,
    currentUser: window.erpApp?.getCurrentUser?.() || 'Unknown'
  };

  // Add relevant data from ERP system
  if (window.erpApp) {
    const stats = {
      projects: window.erpApp.features?.projects?.projects?.getProjectStats?.() || {},
      employees: window.erpApp.features?.hr?.employees?.getAllEmployees?.()?.length || 0,
      orders: window.erpApp.features?.sales?.customers?.getAllSalesOrders?.()?.length || 0,
      products: window.erpApp.features?.operations?.products?.getAllProducts?.()?.length || 0
    };
    context.systemStats = stats;
  }

  return JSON.stringify(context, null, 2);
}

/**
 * Check chatbot API status
 */
async function checkChatbotStatus() {
  try {
    const response = await fetch(`${chatbotState.apiBaseUrl}/api/chat/status`);
    if (response.ok) {
      console.log('✅ Chatbot API is online');
    }
  } catch (error) {
    console.warn('⚠️ Chatbot API is offline:', error.message);
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Export functions
export { toggleChatbot, sendMessage, clearConversation };
