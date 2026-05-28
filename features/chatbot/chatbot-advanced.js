/**
 * ERP Chatbot Module - Advanced Frontend Widget v2.0
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
  rateLimitDelay: 1000,
  customSystemContext: ''
};

const QUICK_SUGGESTIONS = [
  { text: '🎯 Tìm kiếm nhân viên', query: 'Làm cách nào để tìm kiếm nhân viên?' },
  { text: '📊 Báo cáo bán hàng', query: 'Tóm tắt doanh số bán hàng tháng này?' },
  { text: '📦 Tồn kho', query: 'Sản phẩm nào cần đặt hàng gấp?' },
  { text: '💼 Dự án', query: 'Các dự án nào đang tiến hành?' }
];

/**
 * Initialize chatbot with config
 */
export function initChatbot(config = {}) {
  chatbotState.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3001';
  chatbotState.userId = config.userId || chatbotState.userId;
  chatbotState.customSystemContext = config.systemContext || '';

  if (document.getElementById('erp-chatbot-container')) return;

  createChatbotUI();
  attachEventListeners();
  checkChatbotStatus();

  setTimeout(addWelcomeMessage, 500);

  console.log('✅ Chatbot initialized', { 
    sessionId: chatbotState.sessionId,
    userId: chatbotState.userId
  });
}

/**
 * Create chatbot HTML structure
 */
function createChatbotUI() {
  const chatbotHTML = `
    <div id="erp-chatbot-container" class="erp-chatbot">
      <!-- Toggle Button -->
      <div id="chatbot-toggle" class="chatbot-toggle" title="Mở trợ lý ERP">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-badge" style="display:none;">0</span>
      </div>

      <!-- Chatbot Window -->
      <div id="chatbot-window" class="chatbot-window" style="display:none;">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <h3>🤖 Trợ lý ERP</h3>
            <span id="chatbot-status" class="chatbot-status">●●●</span>
          </div>
          <div class="chatbot-header-actions">
            <button id="chatbot-settings" class="chatbot-btn-icon" title="Cài đặt">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <path d="M12 1v6m6.16-1.86l-4.24 4.24m7.07 0l-6.07 6.07m0 4.24h-6m-6.16-1.86l4.24-4.24m-7.07 0l6.07-6.07"></path>
              </svg>
            </button>
            <button id="chatbot-clear" class="chatbot-btn-icon" title="Xóa lịch sử">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              </svg>
            </button>
            <button id="chatbot-close" class="chatbot-btn-icon" title="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div id="chatbot-messages" class="chatbot-messages"></div>

        <!-- Quick Suggestions (shown when empty) -->
        <div id="chatbot-suggestions" class="chatbot-suggestions"></div>

        <!-- Input Group -->
        <div class="chatbot-input-group">
          <input
            id="chatbot-input"
            type="text"
            placeholder="Hỏi tôi về ERP..."
            class="chatbot-input"
            autocomplete="off"
          />
          <button id="chatbot-send" class="chatbot-btn-send" title="Gửi">
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
  addChatbotStyles();
}

/**
 * Add chatbot CSS styles
 */
function addChatbotStyles() {
  if (document.getElementById('chatbot-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chatbot-styles';
  styles.textContent = `
    .erp-chatbot {
      --primary: #2563eb;
      --primary-dark: #1e40af;
      --primary-light: #dbeafe;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --bg: #ffffff;
      --bg-light: #f9fafb;
      --bg-lighter: #f3f4f6;
      --border: #e5e7eb;
      --text: #1f2937;
      --text-muted: #6b7280;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 12px rgba(37, 99, 235, 0.15);
      --shadow-lg: 0 5px 40px rgba(0, 0, 0, 0.16);
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
      box-shadow: var(--shadow-md);
      z-index: 9998;
      transition: all 0.3s ease;
      position: relative;
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    .chatbot-toggle:active {
      transform: scale(0.95);
    }

    .chatbot-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      border: 2px solid var(--bg);
    }

    .chatbot-window {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 400px;
      height: 650px;
      background: var(--bg);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 32px);
        height: 75vh;
        bottom: 24px;
        right: 16px;
        left: 16px;
        border-radius: 12px;
      }
    }

    .chatbot-header {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px 16px 0 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chatbot-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chatbot-header-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .chatbot-status {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
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
      transition: all 0.2s;
    }

    .chatbot-btn-icon:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chatbot-btn-icon:active {
      transform: scale(0.9);
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
      background: var(--border);
      border-radius: 3px;
    }

    .chatbot-suggestions {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--bg-light);
      border-top: 1px solid var(--border);
    }

    .chatbot-suggestion-btn {
      background: white;
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      color: var(--text);
      transition: all 0.2s;
    }

    .chatbot-suggestion-btn:hover {
      border-color: var(--primary);
      background: var(--primary-light);
      color: var(--primary-dark);
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
      max-width: 80%;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .chatbot-message.assistant .chatbot-message-content {
      background: white;
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .chatbot-message.user .chatbot-message-content {
      background: var(--primary);
      color: white;
      border-radius: 12px 2px 12px 12px;
    }

    .chatbot-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
    }

    .chatbot-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      animation: bounce 1.4s infinite;
    }

    .chatbot-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-8px); }
    }

    .chatbot-input-group {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: var(--bg);
      border-top: 1px solid var(--border);
    }

    .chatbot-input {
      flex: 1;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .chatbot-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .chatbot-btn-send {
      background: var(--primary);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .chatbot-btn-send:hover {
      background: var(--primary-dark);
      transform: scale(1.05);
    }

    .chatbot-btn-send:active {
      transform: scale(0.95);
    }

    .chatbot-btn-send:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .chatbot-error {
      background: #fee2e2;
      color: #991b1b;
      padding: 10px 12px;
      border-radius: 8px;
      border-left: 3px solid var(--danger);
      font-size: 13px;
    }

    .chatbot-success {
      background: #dcfce7;
      color: #166534;
      padding: 10px 12px;
      border-radius: 8px;
      border-left: 3px solid var(--success);
      font-size: 13px;
    }

    .chatbot-info {
      background: #dbeafe;
      color: #0c4a6e;
      padding: 10px 12px;
      border-radius: 8px;
      border-left: 3px solid var(--primary);
      font-size: 13px;
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
  const clearBtn = document.getElementById('chatbot-clear');
  const input = document.getElementById('chatbot-input');
  const window = document.getElementById('chatbot-window');

  if (toggle) {
    toggle.addEventListener('click', toggleChatbot);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatbotState.isOpen = false;
      window.style.display = 'none';
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearChat);
  }

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateInputHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateInputHistory(1);
      }
    });
  }
}

/**
 * Toggle chatbot window
 */
function toggleChatbot() {
  chatbotState.isOpen = !chatbotState.isOpen;
  const window = document.getElementById('chatbot-window');
  const input = document.getElementById('chatbot-input');
  
  window.style.display = chatbotState.isOpen ? 'flex' : 'none';
  
  if (chatbotState.isOpen && input) {
    input.focus();
    document.getElementById('chatbot-badge').style.display = 'none';
    chatbotState.unreadCount = 0;
  }
}

/**
 * Send message to chatbot
 */
async function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();

  if (!message || chatbotState.isLoading) return;

  // Rate limiting
  if (Date.now() - chatbotState.lastMessageTime < chatbotState.rateLimitDelay) {
    return;
  }

  chatbotState.lastMessageTime = Date.now();

  // Add to history
  chatbotState.inputHistory.push(message);
  chatbotState.inputHistoryIndex = -1;

  // Clear input
  input.value = '';

  // Add user message to UI
  addMessage('user', message);

  // Show loading
  chatbotState.isLoading = true;
  showTypingIndicator();

  try {
    // Get system context from page if available
    let systemContext = chatbotState.customSystemContext;
    if (window.getERPContext && typeof window.getERPContext === 'function') {
      systemContext = window.getERPContext();
    }

    // Send to API
    const response = await fetch(`${chatbotState.apiBaseUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: chatbotState.sessionId,
        message,
        systemContext,
        userId: chatbotState.userId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      removeTypingIndicator();
      addMessage('assistant', data.message);
    } else {
      throw new Error(data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Chat error:', error);
    removeTypingIndicator();
    addMessage('error', `Lỗi: ${error.message}`);
  } finally {
    chatbotState.isLoading = false;
  }
}

/**
 * Add message to UI
 */
function addMessage(sender, text) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const suggestionsDiv = document.getElementById('chatbot-suggestions');

  // Hide suggestions if showing
  if (suggestionsDiv && chatbotState.messages.length > 0) {
    suggestionsDiv.style.display = 'none';
  }

  // Parse HTML content if from assistant
  let messageHTML = text;
  if (sender === 'assistant') {
    // Safely render HTML for assistant messages
    messageHTML = sanitizeHTML(text);
  }

  const messageEl = document.createElement('div');
  messageEl.className = `chatbot-message ${sender}`;

  const contentEl = document.createElement('div');
  contentEl.className = `chatbot-message-content`;

  if (sender === 'error') {
    contentEl.className += ' chatbot-error';
    contentEl.textContent = messageHTML;
  } else {
    if (sender === 'assistant') {
      contentEl.innerHTML = messageHTML;
    } else {
      contentEl.textContent = messageHTML;
    }
  }

  messageEl.appendChild(contentEl);
  messagesDiv.appendChild(messageEl);

  // Store in state
  chatbotState.messages.push({
    sender,
    text,
    timestamp: new Date()
  });

  // Scroll to bottom
  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 0);
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const messagesDiv = document.getElementById('chatbot-messages');
  const indicator = document.createElement('div');
  indicator.id = 'chatbot-typing-indicator';
  indicator.className = 'chatbot-message assistant';
  indicator.innerHTML = `
    <div class="chatbot-typing">
      <div class="chatbot-typing-dot"></div>
      <div class="chatbot-typing-dot"></div>
      <div class="chatbot-typing-dot"></div>
    </div>
  `;
  messagesDiv.appendChild(indicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
  const indicator = document.getElementById('chatbot-typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Add welcome message
 */
function addWelcomeMessage() {
  if (!chatbotState.isOpen) {
    addMessage('assistant', '👋 Xin chào! Tôi là trợ lý ERP của bạn. Hỏi tôi về bất kỳ điều gì liên quan đến hệ thống.');
    showQuickSuggestions();
  }
}

/**
 * Show quick suggestions
 */
function showQuickSuggestions() {
  const suggestionsDiv = document.getElementById('chatbot-suggestions');
  if (!suggestionsDiv) return;

  suggestionsDiv.innerHTML = '';
  QUICK_SUGGESTIONS.forEach(suggestion => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-suggestion-btn';
    btn.textContent = suggestion.text;
    btn.addEventListener('click', () => {
      const input = document.getElementById('chatbot-input');
      input.value = suggestion.query;
      sendMessage();
    });
    suggestionsDiv.appendChild(btn);
  });
}

/**
 * Clear chat history
 */
async function clearChat() {
  try {
    await fetch(`${chatbotState.apiBaseUrl}/api/chat/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: chatbotState.sessionId })
    });

    const messagesDiv = document.getElementById('chatbot-messages');
    messagesDiv.innerHTML = '';
    chatbotState.messages = [];
    chatbotState.inputHistory = [];
    chatbotState.inputHistoryIndex = -1;

    addWelcomeMessage();

  } catch (error) {
    console.error('Clear chat error:', error);
  }
}

/**
 * Check chatbot status
 */
async function checkChatbotStatus() {
  try {
    const response = await fetch(`${chatbotState.apiBaseUrl}/api/chat/status`);
    if (response.ok) {
      chatbotState.isOnline = true;
      const status = document.getElementById('chatbot-status');
      if (status) {
        status.style.color = '#10b981';
      }
    }
  } catch (error) {
    console.warn('Chatbot offline:', error);
    chatbotState.isOnline = false;
  }
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  let safe = div.innerHTML;

  // Allow safe HTML tags
  safe = safe
    .replace(/&lt;b&gt;/g, '<b>')
    .replace(/&lt;\/b&gt;/g, '</b>')
    .replace(/&lt;i&gt;/g, '<i>')
    .replace(/&lt;\/i&gt;/g, '</i>')
    .replace(/&lt;br&gt;/g, '<br>')
    .replace(/&lt;ul&gt;/g, '<ul>')
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;li&gt;/g, '<li>')
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>');

  return safe;
}

/**
 * Navigate input history
 */
function navigateInputHistory(direction) {
  const input = document.getElementById('chatbot-input');
  const history = chatbotState.inputHistory;

  if (history.length === 0) return;

  let newIndex = chatbotState.inputHistoryIndex + direction;
  newIndex = Math.max(-1, Math.min(newIndex, history.length - 1));

  chatbotState.inputHistoryIndex = newIndex;

  if (newIndex === -1) {
    input.value = '';
  } else {
    input.value = history[newIndex];
  }
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for external use
export {
  initChatbot,
  sendMessage,
  clearChat,
  addMessage,
  toggleChatbot,
  generateSessionId
};
