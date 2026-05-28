# 🤖 VIETBACHCORP ERP Advanced Chatbot v2.0

Trợ lý AI thông minh cho hệ thống VIETBACHCORP ERP với khả năng phân tích dữ liệu, hỗ trợ đa ngôn ngữ và tích hợp dữ liệu hệ thống.

## ✨ Tính Năng Chính

### 🎯 Tính Năng Chatbot
- **AI Thông Minh**: Sử dụng Claude 3.5 Sonnet của Anthropic
- **Hiểu Ngữ Cảnh**: Truy cập dữ liệu thực tế từ các module ERP
- **Gợi Ý Nhanh**: Các câu hỏi gợi ý để bắt đầu nhanh
- **Lịch Sử Trò Chuyện**: Nhớ cuộc trò chuyện trước đó (max 20 message)
- **Hỗ Trợ Đa Ngôn Ngữ**: Tiếng Việt + Tiếng Anh
- **Phân Tích Dữ Liệu**: Phân tích báo cáo, số liệu thực tế
- **Bộ Nhớ Học**: Học từ các cuộc trò chuyện để cải thiện

### 📊 Khả Năng Phân Tích
- **Bán Hàng**: Phân tích doanh số, xu hướng, cơ hội
- **Kho Hàng**: Cảnh báo tồn kho thấp, tối ưu hóa
- **Tài Chính**: Phân tích doanh thu, chi phí, lợi nhuận
- **Nhân Sự**: Insight về nhân viên, hợp đồng, lương
- **Dự Án**: Theo dõi tiến độ, deadline, nhân lực

### 🔐 Bảo Mật
- Không chia sẻ mật khẩu hoặc dữ liệu nhạy cảm
- Xác nhận trước khi thực hiện hành động quan trọng
- Phiên làm việc tự động hết hạn sau 30 phút không dùng
- API key được lưu trữ an toàn

## 📦 Cài Đặt

### 1. Cài Đặt Dependencies

```bash
npm install express cors @anthropic-ai/sdk
```

### 2. Cấu Hình Environment

Tạo file `.env` hoặc cấu hình biến môi trường:

```env
# Backend Chatbot Service
CHATBOT_PORT=3001
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 3. Khởi Động Backend Service

```bash
# Từ terminal
node chatbot-service.js

# Hoặc sử dụng nodemon để auto-reload
nodemon chatbot-service.js
```

Output sẽ như:
```
✅ Chatbot Service running on port 3001
📡 API: http://localhost:3001/api/chat/message
🤖 Model: Claude 3.5 Sonnet
```

## 🚀 Sử Dụng

### Cách 1: Import và Khởi Tạo (ES6 Modules)

```javascript
import { initChatbot } from './features/chatbot/chatbot-advanced.js';

// Khởi tạo chatbot
initChatbot({
  apiBaseUrl: 'http://localhost:3001',
  userId: 'user123',
  systemContext: 'Thêm ngữ cảnh tùy chỉnh nếu cần'
});
```

### Cách 2: Script Tag (CommonJS)

```html
<script src="/features/chatbot/chatbot-advanced.js"></script>
<script>
  initChatbot({
    apiBaseUrl: 'http://localhost:3001'
  });
</script>
```

### Cách 3: Tích Hợp Với Dữ Liệu ERP

```javascript
import { initChatbot } from './features/chatbot/chatbot-advanced.js';
import { erpContextManager } from './features/chatbot/erp-context.js';

// Thiết lập dữ liệu ERP toàn cục
window.employeeData = [...]; // Từ module HR
window.projectData = [...];  // Từ module Dự án
window.salesData = [...];    // Từ module Bán hàng
window.inventoryData = [...]; // Từ module Kho hàng

// Khởi tạo
initChatbot({
  apiBaseUrl: 'http://localhost:3001',
  userId: getCurrentUserId()
});
```

## 🎨 Giao Diện

### Vị Trí Mặc Định
- **Góc dưới phải**: Nút chat tròn màu xanh dương
- **Bật/Tắt**: Click vào nút hoặc nút Close
- **Responsive**: Tự động thích ứng với màn hình nhỏ

### Tuỳ Chỉnh CSS

```css
/* Ghi đè các biến CSS */
.erp-chatbot {
  --primary: #2563eb;           /* Màu chính */
  --primary-dark: #1e40af;      /* Màu chính đậm */
  --bg: #ffffff;                /* Nền */
  --text: #1f2937;              /* Màu chữ */
  --success: #10b981;           /* Xanh lá */
  --danger: #ef4444;            /* Đỏ */
}
```

## 📡 API Endpoints

### 1. Chat - Gửi tin nhắn

```bash
POST /api/chat/message
```

**Request:**
```json
{
  "sessionId": "session_123",
  "message": "Có bao nhiêu nhân viên?",
  "systemContext": "Thông tin ngữ cảnh ERP",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Câu trả lời từ AI...",
  "sessionId": "session_123",
  "messageCount": 5,
  "timestamp": "2024-04-29T10:30:00Z"
}
```

### 2. Analyze - Phân Tích Dữ Liệu

```bash
POST /api/chat/analyze
```

**Request:**
```json
{
  "sessionId": "session_123",
  "data": {
    "orders": [...],
    "total": 100000
  },
  "analysisType": "sales"
}
```

**Analysis Types:**
- `sales` - Phân tích bán hàng
- `inventory` - Phân tích kho hàng
- `finance` - Phân tích tài chính
- `hr` - Phân tích nhân sự
- `general` - Phân tích chung

### 3. Clear - Xóa Lịch Sử

```bash
POST /api/chat/clear
```

**Request:**
```json
{
  "sessionId": "session_123"
}
```

### 4. Status - Kiểm Tra Trạng Thái

```bash
GET /api/chat/status
```

**Response:**
```json
{
  "success": true,
  "status": "online",
  "model": "Claude 3.5 Sonnet",
  "timestamp": "2024-04-29T10:30:00Z",
  "conversations": 5
}
```

## 💡 Ví Dụ Sử Dụng

### Ví Dụ 1: Tích Hợp Vào Module Bán Hàng

```javascript
// features/sales/customers.js
import { initChatbot } from '../chatbot/chatbot-advanced.js';

export function initSalesModule() {
  // Setup sales data
  window.salesData = getSalesData();

  // Initialize chatbot with sales context
  initChatbot({
    apiBaseUrl: 'http://localhost:3001',
    systemContext: 'Người dùng đang làm việc trên module Bán hàng'
  });
}
```

### Ví Dụ 2: Phân Tích Dữ Liệu

```javascript
// Phân tích doanh số bán hàng
const analysisButton = document.getElementById('analyze-sales');
analysisButton.addEventListener('click', async () => {
  const salesData = window.salesData;
  
  const response = await fetch('http://localhost:3001/api/chat/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: window.chatbotState?.sessionId,
      data: salesData,
      analysisType: 'sales'
    })
  });

  const result = await response.json();
  console.log('Phân tích:', result.analysis);
});
```

### Ví Dụ 3: Lấy Context Tùy Chỉnh

```javascript
// Cung cấp context động dựa trên hành động người dùng
window.getERPContext = function() {
  const user = getCurrentUser();
  const module = getCurrentModule();
  
  return `
    Người dùng: ${user.name} (${user.role})
    Module hiện tại: ${module}
    Phòng ban: ${user.department}
    Dữ liệu: ${getModuleDataSummary(module)}
  `;
};
```

## 🔧 Troubleshooting

### 1. Chatbot không hoạt động

**Kiểm tra:**
- Backend service chạy? `npm start` hoặc `node chatbot-service.js`
- API URL đúng? Kiểm tra `apiBaseUrl` config
- API Key hợp lệ? Kiểm tra biến `ANTHROPIC_API_KEY`

```bash
# Kiểm tra trạng thái
curl http://localhost:3001/api/chat/status
```

### 2. Không nhận được response

**Giải pháp:**
- Kiểm tra console browser (F12)
- Kiểm tra network tab để xem request/response
- Kiểm tra server logs

```javascript
// Thêm debug logging
window.chatbotState = {
  ...window.chatbotState,
  debug: true
};
```

### 3. Rate limiting

**Cấu hình:**
```javascript
// Trong chatbot-advanced.js
chatbotState.rateLimitDelay = 2000; // 2 seconds
```

### 4. Memory không đủ

**Giải pháp:**
- Clear lịch sử: Click nút xóa lịch sử
- Giảm MAX_TOKENS trong chatbot-service.js
- Giảm conversation history size (MAX_HISTORY)

## 📊 Monitoring

### Xem thống kê bộ nhớ

```javascript
// Trong browser console
console.log(window.getChatbotMemoryStats());
```

Output:
```json
{
  "totalConversations": 5,
  "totalLearnings": 42,
  "patterns": ["how-to", "what-is", "why"],
  "averageConversationLength": 3.2,
  "topics": ["Bán hàng", "Dự án", "Nhân sự"]
}
```

### Export dữ liệu conversation

```javascript
// Export để lưu trữ/phân tích
const data = conversationMemory.exportData();
console.log(JSON.stringify(data, null, 2));

// Hoặc download
const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'chatbot-memory.json';
a.click();
```

## 🚀 Performance Tips

1. **Cache context**: Sử dụng cache 5 phút cho dữ liệu ERP
2. **Lazy load**: Chỉ tải chatbot khi cần
3. **Compress responses**: Sử dụng gzip compression
4. **Optimize images**: Giảm kích thước asset
5. **Use CDN**: Serve static assets từ CDN

## 📝 Keyboard Shortcuts

- **Enter**: Gửi tin nhắn
- **Shift + Enter**: Xuống dòng trong input
- **Mũi tên lên**: Tin nhắn trước
- **Mũi tên xuống**: Tin nhắn sau
- **Ctrl + K**: Focus chatbot (nếu cấu hình)

## 🔐 Security Best Practices

1. **Never log sensitive data**: Mật khẩu, token, PII
2. **Validate inputs**: Xác thực dữ liệu từ người dùng
3. **Use HTTPS**: Trong production
4. **Rotate API keys**: Thường xuyên
5. **Monitor usage**: Kiểm tra abuse patterns

## 📞 Support

Nếu có vấn đề, hãy:

1. Kiểm tra logs: `VSCODE_TARGET_SESSION_LOG` variable
2. Xem lỗi browser: F12 > Console
3. Kiểm tra network requests: F12 > Network
4. Xem server logs: Terminal nơi khởi chạy service

## 📄 License

MIT License - Tự do sử dụng và sửa đổi

## 🎯 Roadmap

- [ ] Thêm hỗ trợ voice/speech
- [ ] Tích hợp các AI models khác
- [ ] Export báo cáo PDF
- [ ] Machine learning improvements
- [ ] Mobile app companion
- [ ] Real-time collaboration
- [ ] Custom training data

---

**Version**: 2.0  
**Last Updated**: April 29, 2024  
**Status**: Production Ready ✅
