# 🚀 Chatbot v2.0 - Quick Reference Card

## ⚡ 30-Second Setup

```bash
# 1. Configure
cp features/chatbot/.env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

# 2. Run
node features/chatbot/chatbot-service.js

# 3. Open app - Chatbot appears at bottom-right! ✅
```

## 📡 API Endpoints

```bash
# Send Message
POST /api/chat/message
{
  "sessionId": "session_123",
  "message": "Hỏi gì đó",
  "userId": "user123"
}

# Analyze Data
POST /api/chat/analyze
{
  "sessionId": "session_123",
  "data": {...},
  "analysisType": "sales" | "inventory" | "finance" | "hr"
}

# Clear History
POST /api/chat/clear
{ "sessionId": "session_123" }

# Check Status
GET /api/chat/status
```

## 🎨 HTML Integration

```html
<!-- Quick Start -->
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  initChatbot();
</script>

<!-- With Config -->
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  
  initChatbot({
    apiBaseUrl: 'http://localhost:3001',
    userId: 'user123'
  });
</script>
```

## ⚙️ JavaScript Integration

```javascript
// Basic
import { initChatbot } from './features/chatbot/chatbot-advanced.js';
initChatbot();

// With Data
import { chatbotIntegration, setupChatbotContext } from './features/chatbot/integration.js';

window.addEventListener('DOMContentLoaded', async () => {
  await chatbotIntegration.initialize();
  setupChatbotContext();
});

// Programmatic
import { askChatbot, analyzeWithChatbot } from './features/chatbot/integration.js';

const response = await askChatbot('Question?');
const analysis = await analyzeWithChatbot(data, 'sales');
```

## 🌍 Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
CHATBOT_PORT=3001
LOG_LEVEL=info
MAX_HISTORY=20
MAX_TOKENS=1024
CONVERSATION_TIMEOUT=1800000
```

## 🎯 Frontend Config

```javascript
initChatbot({
  apiBaseUrl: 'http://localhost:3001',    // Backend URL
  userId: 'user123',                       // User ID
  systemContext: 'Custom context'          // Custom prompt
})
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Shift+Enter | New line |
| ↑ Arrow Up | Previous message |
| ↓ Arrow Down | Next message |

## 🔧 Common Commands

```bash
# Start service
node chatbot-service.js

# Check if running
curl http://localhost:3001/api/chat/status

# Different port
CHATBOT_PORT=3002 node chatbot-service.js

# With logs
node chatbot-service.js 2>&1 | tee chatbot.log

# Background (Linux/Mac)
nohup node chatbot-service.js &

# Background (Windows)
start node chatbot-service.js
```

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Port in use | `CHATBOT_PORT=3002 node chatbot-service.js` |
| API key invalid | Check .env, must start with `sk-ant-` |
| Module not found | `npm install` |
| No response | Check backend running |
| CORS error | Check apiBaseUrl config |

## 📊 ERP Data Context

```javascript
// Auto-populated by chatbot
window.employeeData      // HR data
window.projectData       // Project data
window.salesData         // Sales data
window.purchaseData      // Purchase data
window.inventoryData     // Inventory data
window.financialData     // Financial data
window.productionData    // Production data
```

## 🎨 CSS Customization

```css
/* Color scheme */
.erp-chatbot {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --success: #10b981;
  --danger: #ef4444;
}

/* Position */
.chatbot-toggle {
  bottom: 24px;   /* Distance from bottom */
  right: 24px;    /* Distance from right */
}

/* Size */
.chatbot-window {
  width: 400px;   /* Width */
  height: 650px;  /* Height */
}
```

## 📈 Monitoring

```javascript
// Get stats
console.log(window.getChatbotMemoryStats());

// Check state
console.log(window.chatbotState);

// Get context
console.log(window.getERPContext());
```

## 🔐 Security Checklist

- [ ] API key in .env (not in code)
- [ ] HTTPS in production
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] Rate limiting active
- [ ] Session timeout set
- [ ] Logs monitored

## 📁 File Structure

```
features/chatbot/
├── chatbot-advanced.js        # Main widget
├── erp-context.js             # ERP data
├── conversation-memory.js     # Memory system
├── integration.js             # Helper functions
├── chatbot-service.js         # Backend API
├── start-chatbot-service.bat  # Windows launcher
├── start-chatbot-service.sh   # Linux/Mac launcher
├── .env.example               # Config template
└── README.md                  # Full docs
```

## 💾 Useful Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation |
| `INSTALLATION_GUIDE.md` | Setup guide |
| `integration.js` | Code examples |
| `STRUCTURE.md` | File overview |
| `.env.example` | Config template |

## 🚀 Performance Tips

- Cache context for 5 minutes
- Use local session storage
- Enable gzip compression
- Minimize API calls
- Use CDN for static files

## 📊 API Response Format

```json
{
  "success": true,
  "message": "AI response",
  "sessionId": "session_123",
  "messageCount": 5,
  "timestamp": "2024-04-29T10:30:00Z"
}
```

## 🎯 Example Queries

```
- "Có bao nhiêu nhân viên?"
- "Doanh số tháng này bao nhiêu?"
- "Sản phẩm nào tồn kho thấp?"
- "Phân tích doanh số cho tôi"
- "Danh sách dự án đang làm"
- "Chi phí lương tháng này"
- "Khách hàng nào mua nhiều nhất?"
```

## 🔄 Update Context

```javascript
import { setupChatbotContext } from './features/chatbot/integration.js';

// When data changes
window.salesData = newData;
setupChatbotContext();
```

## 💬 Send Message Programmatically

```javascript
import { askChatbot } from './features/chatbot/integration.js';

// Ask question
const response = await askChatbot('Your question here');
console.log(response);
```

## 📊 Analyze Data

```javascript
import { analyzeWithChatbot } from './features/chatbot/integration.js';

// Types: 'sales', 'inventory', 'finance', 'hr', 'general'
const analysis = await analyzeWithChatbot(data, 'sales');
console.log(analysis);
```

## 🆘 Getting Help

1. **Documentation**: Read README.md
2. **Setup Guide**: Check INSTALLATION_GUIDE.md
3. **Code Examples**: See integration.js
4. **Browser Console**: F12 > Console
5. **Server Logs**: Check terminal
6. **Network Tab**: F12 > Network

## 🎉 Success Indicators

✅ Chatbot button appears  
✅ Can send message  
✅ Receive response  
✅ No console errors  
✅ Backend running  

## 📞 Quick Support

**Email**: support@vietbacherp.com  
**Docs**: features/chatbot/README.md  
**Issues**: Check INSTALLATION_GUIDE.md  

---

**Version**: 2.0  
**Status**: ✅ Production Ready  
**Last Updated**: April 29, 2024

🤖 **Happy Chatting!** 💬
