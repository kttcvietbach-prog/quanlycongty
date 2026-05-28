# 📋 Hướng Dẫn Cài Đặt & Sử Dụng - Chatbot ERP v2.0

## 🎯 Tổng Quan Nhanh

**Chatbot ERP v2.0** là hệ thống hỗ trợ thông minh với AI Claude, tích hợp toàn bộ dữ liệu ERP.

### ⚡ Bắt Đầu (5 phút)

```bash
# 1. Copy .env
cp features/chatbot/.env.example .env

# 2. Điền API key (cần Anthropic API key)
# Mở .env và thêm: ANTHROPIC_API_KEY=sk-ant-...

# 3. Khởi động service
cd features/chatbot
node chatbot-service.js

# 4. Mở ứng dụng & chatbot sẽ tự hiện lên
```

---

## 📦 Cài Đặt Chi Tiết

### Yêu Cầu Hệ Thống

- **Node.js**: v16.0.0 hoặc cao hơn
- **npm**: v8.0.0 hoặc cao hơn
- **Port**: 3001 (mặc định, có thể thay đổi)
- **API Key**: Anthropic API key (https://console.anthropic.com)

### Bước 1: Chuẩn Bị API Key

1. Truy cập: https://console.anthropic.com
2. Đăng ký/Đăng nhập
3. Tạo API Key mới
4. Copy key (sẽ dùng ở bước tiếp)

### Bước 2: Cấu Hình Environment

```bash
# Di chuyển đến thư mục project
cd "c:\Users\PC\Desktop\VIETBACHERP V29"

# Copy file mẫu
copy features\chatbot\.env.example .env

# Hoặc trên Linux/Mac:
cp features/chatbot/.env.example .env
```

### Bước 3: Chỉnh Sửa .env File

```bash
# Mở file .env bằng editor
# Windows: Dùng Notepad hoặc VS Code
# Linux/Mac: nano .env

# Tìm dòng:
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Thay thế thành key thực tế của bạn:
ANTHROPIC_API_KEY=sk-ant-1234567890abcdefg...
```

### Bước 4: Kiểm Tra Dependencies

```bash
# Đảm bảo các package đã cài
npm list express cors @anthropic-ai/sdk

# Nếu chưa có, cài lại:
npm install express cors @anthropic-ai/sdk
```

### Bước 5: Khởi Động Service

**Cách 1: Dùng Script (Dễ nhất)**

```bash
# Windows
features\chatbot\start-chatbot-service.bat

# Linux/Mac
bash features/chatbot/start-chatbot-service.sh
```

**Cách 2: Dùng Terminal**

```bash
cd features/chatbot
node chatbot-service.js
```

**Cách 3: Dùng npm**

```bash
npm run chatbot-start
# (Nếu đã add vào package.json scripts)
```

### Bước 6: Kiểm Tra Kết Nối

Khi service chạy, bạn sẽ thấy:

```
✅ Chatbot Service running on port 3001
📡 API: http://localhost:3001/api/chat/message
🤖 Model: Claude 3.5 Sonnet
```

Nếu thấy lỗi, xem phần Troubleshooting bên dưới.

---

## 🎨 Tích Hợp Vào App

### Cách 1: Cơ Bản (HTML Script Tag)

```html
<!-- Thêm vào index.html trước </body> -->
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  
  initChatbot();
</script>
```

### Cách 2: Với Configuration

```html
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  
  initChatbot({
    apiBaseUrl: 'http://localhost:3001',
    userId: 'user123'
  });
</script>
```

### Cách 3: Tích Hợp Hoàn Chỉnh (Recommended)

```javascript
// app.js
import { chatbotIntegration, setupChatbotContext } from './features/chatbot/integration.js';

// Khởi động khi app start
window.addEventListener('DOMContentLoaded', async () => {
  // ... các initialization khác ...
  
  // Khởi động chatbot
  await chatbotIntegration.initialize();
  
  // Setup dữ liệu ERP
  setupChatbotContext();
});
```

### Cách 4: Với Dữ Liệu Động

```javascript
// Khi có dữ liệu mới, cập nhật:
import { setupChatbotContext } from './features/chatbot/integration.js';

function onDataLoaded(data) {
  // Lưu vào window globals (dùng cho chatbot)
  window.salesData = data.sales;
  window.inventoryData = data.inventory;
  
  // Thông báo cho chatbot
  setupChatbotContext();
}
```

---

## 🎯 Sử Dụng Chatbot

### Nút Chatbot

- 📍 **Vị trí**: Góc dưới phải màn hình
- 🎨 **Màu sắc**: Xanh dương gradient
- 🔔 **Huy hiệu**: Hiển thị số tin nhắn chưa đọc

### Keyboard Shortcuts

| Phím | Hành Động |
|------|----------|
| `Enter` | Gửi tin nhắn |
| `Shift + Enter` | Xuống dòng |
| `↑ Mũi tên lên` | Tin nhắn trước |
| `↓ Mũi tên xuống` | Tin nhắn sau |

### Ví Dụ Câu Hỏi

```
- "Có bao nhiêu nhân viên?"
- "Doanh số bán hàng tháng này bao nhiêu?"
- "Sản phẩm nào tồn kho thấp?"
- "Các dự án nào đang tiến hành?"
- "Chi phí lương tháng này là bao nhiêu?"
- "Phân tích doanh số cho tôi"
- "Danh sách nhân viên sắp hết hợp đồng"
```

---

## 📊 API Usage

### Chat API

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "message": "Hỏi gì đó",
    "userId": "user123"
  }'
```

### Status Check

```bash
curl http://localhost:3001/api/chat/status
```

Response:
```json
{
  "success": true,
  "status": "online",
  "model": "Claude 3.5 Sonnet",
  "conversations": 5
}
```

---

## 🔧 Troubleshooting

### ❌ Error: "Port 3001 is already in use"

**Giải pháp 1**: Sử dụng port khác
```bash
CHATBOT_PORT=3002 node chatbot-service.js
```

**Giải pháp 2**: Tìm process đang dùng port
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### ❌ Error: "API Key invalid"

**Kiểm tra:**
1. API Key có hợp lệ? Truy cập https://console.anthropic.com
2. Key có format đúng? Phải bắt đầu `sk-ant-`
3. .env file có load đúng? Check console logs

**Xử lý:**
```bash
# Verify key được load
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY)"
```

### ❌ Error: "Cannot find module '@anthropic-ai/sdk'"

**Giải pháp:**
```bash
npm install @anthropic-ai/sdk
# Hoặc cài lại tất cả
npm install
```

### ❌ Chatbot không hiển thị

**Kiểm tra:**
1. Backend service chạy? Mở browser console (F12)
2. Network request có error? Xem Network tab
3. Console có error message? Kiểm tra

**Xử lý:**
```javascript
// Trong browser console
console.log(window.chatbotState); // Kiểm tra state
console.log(window.erpApp); // Kiểm tra app
```

### ⚠️ Chatbot offline

**Nguyên nhân:**
- Backend service không chạy
- Port khác
- Firewall block

**Xử lý:**
```bash
# 1. Verify service chạy
curl http://localhost:3001/api/chat/status

# 2. Check port
netstat -ano | findstr :3001

# 3. Restart service
node chatbot-service.js
```

### 💾 "Memory full" Error

**Giải pháp:**
1. Xóa chat history (Click nút xóa lịch sử)
2. Restart service (tự động xóa in-memory data)
3. Giảm MAX_HISTORY trong code

---

## 📈 Performance Tuning

### Tối Ưu Memory

```javascript
// Giảm lịch sử conversation
const MAX_HISTORY = 10; // Default 20

// Giảm token output
const MAX_TOKENS = 512; // Default 1024

// Cache context lâu hơn
const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Tối Ưu Tốc Độ

1. **Enable gzip compression** (production)
2. **Use CDN** cho static files
3. **Cache API responses**
4. **Lazy load** chatbot widget

### Monitoring

```bash
# Check memory usage
ps aux | grep node

# Check CPU
# Windows: Task Manager > Performance
# Linux: top

# Check network
# Browser: F12 > Network tab
```

---

## 🚀 Deployment (Production)

### Checklist Pre-Deployment

- [ ] API key dimulai dengan `sk-ant-`
- [ ] CORS origin diatur đúng
- [ ] Environment = production
- [ ] Database connection test
- [ ] SSL/HTTPS configured
- [ ] Logs configured
- [ ] Monitoring set up

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "chatbot-service.js"]
```

```bash
# Build & Run
docker build -t chatbot:latest .
docker run -p 3001:3001 -e ANTHROPIC_API_KEY=sk-ant-... chatbot:latest
```

### PM2 Management

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start chatbot-service.js --name "chatbot" --watch

# Monitor
pm2 monit

# Logs
pm2 logs chatbot
```

---

## 📞 Support & Resources

### Có Vấn Đề?

1. **Check logs**: `VSCODE_TARGET_SESSION_LOG` folder
2. **Browser console**: F12 > Console tab
3. **Network tab**: F12 > Network tab
4. **Server logs**: Terminal nơi chạy service

### Tài Liệu

- [Chatbot README](./README.md) - Tài liệu chi tiết
- [Integration Guide](./integration.js) - Code examples
- [.env.example](./.env.example) - Cấu hình mẫu

### Liên Hệ

📧 Email: support@vietbacherp.com  
💬 Chat: Sử dụng chatbot bên trong app  
🐛 Issues: Báo cáo lỗi kỹ thuật

---

## ✅ Checklist Hoàn Thành

- [ ] Node.js installed (v16+)
- [ ] Anthropic API key obtained
- [ ] .env file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Backend service running (`npm start` hoặc `node chatbot-service.js`)
- [ ] Frontend integrated (HTML/app.js)
- [ ] Chatbot appears on page
- [ ] Able to send messages
- [ ] Responses working

---

**Status**: ✅ Ready for Production  
**Version**: 2.0  
**Last Updated**: April 29, 2024

---

**Mọi thắc mắc, vui lòng liên hệ team hỗ trợ!** 🎉
