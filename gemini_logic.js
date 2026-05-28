/**
 * AI Integration for VIETBACHCORP ERP
 * Sử dụng backend chatbot service thay vì gọi API trực tiếp (an toàn hơn)
 * 
 * Lợi ích:
 * - API key được bảo vệ ở backend
 * - Sử dụng Claude AI (tốt hơn Gemini)
 * - Không bị lỗi API key invalid
 */

// Cấu hình Backend Service (Tự động chuyển đổi giữa Local và Production)
const PROD_API_URL = 'https://quanlycongty.onrender.com'; 
window.PROD_API_URL = PROD_API_URL;
window.API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : PROD_API_URL;

const CHATBOT_API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:3001'
    : PROD_API_URL;
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

/**
 * Kiểm tra backend service có chạy không
 */
async function checkChatbotService() {
    try {
        console.log('🔍 Checking chatbot service at:', CHATBOT_API_URL);
        const response = await fetch(`${CHATBOT_API_URL}/api/chat/status`, {
            method: 'GET',
            cache: 'no-cache'
        });
        console.log('✅ Service status response:', response.status);
        return response.ok;
    } catch (err) {
        console.error('❌ Service check failed:', err);
        return false;
    }
}

/**
 * Hàm gọi Chatbot Service để lấy câu trả lời
 * @param {string} prompt - Câu hỏi của người dùng
 * @param {string} systemContext - Dữ liệu ngữ cảnh hệ thống ERP
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function getGeminiResponse(prompt, systemContext = '', persona = 'default') {
    try {
        // Gọi thẳng backend chatbot service
        console.log('📤 Sending request to:', `${CHATBOT_API_URL}/api/chat/message`, '[Persona:', persona, ']');
        const response = await fetch(`${CHATBOT_API_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId,
                message: prompt,
                systemContext,
                persona,
                userId: getCurrentUserId()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.message) {
            // Nếu backend trả về tin nhắn lỗi (do thiếu key) thì ném lỗi để fallback xử lý
            if (data.message.includes('không thể kết nối AI') || data.isFallback) {
                throw new Error('Backend AI Missing Key');
            }
            return data.message;
        } else {
            throw new Error(data.error || 'Lỗi không xác định');
        }

    } catch (error) {
        console.error('❌ Chatbot API Error:', error);

        // --- NEW: Direct Browser Fallback (For GitHub/Static Hosting) ---
        const clientSideKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('GEMINI_CLIENT_KEY');
        const shouldFallback = error.message.includes('service') || error.message.includes('fetch') || error.message.includes('HTTP') || error.message.includes('Missing Key');
        
        if (clientSideKey && shouldFallback) {
            console.log('🔄 Backend offline or missing key, attempting direct Gemini call from browser...');
            try {
                const model = 'gemini-1.5-flash';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientSideKey}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `[System Context: ${systemContext}]\n\nUser: ${prompt}` }] }]
                    })
                });
                
                const data = await response.json();
                if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    return data.candidates[0].content.parts[0].text + '\n\n*(Phản hồi trực tiếp từ Gemini)*';
                } else {
                    throw new Error(data.error?.message || `HTTP ${response.status}`);
                }
            } catch (directErr) {
                console.error('❌ Direct Gemini call failed:', directErr);
                if (directErr.message.includes('API_KEY_INVALID') || directErr.message.includes('HTTP 400') || directErr.message.includes('API key')) {
                    return `⚠️ **Lỗi kết nối trực tiếp đến Gemini:** API Key của bạn không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật lại API Key trong phần cấu hình.`;
                }
            }
        }

        // Fallback option message if everything fails
        if (shouldFallback) {
            return `⚠️ Backend AI hiện không có API Key hoặc đang offline.
            
**Cách khắc phục:**
1. Cập nhật **API Key Gemini** vào cấu hình AI trên trình duyệt để gọi trực tiếp (Bấm nút "Cấu hình AI").
2. Hoặc cấu hình biến môi trường \`GEMINI_API_KEY\` hoặc \`ANTHROPIC_API_KEY\` trong file \`.env\` của thư mục dự án và khởi động lại backend ngầm (\`run-chatbot-background.vbs\`).`;
        }

        throw error;
    }
}

/**
 * Fallback response nếu service không chạy
 */
async function getFallbackResponse(prompt, systemContext = '') {
    return `⚠️ Dịch vụ Chatbot không hoạt động.

**Để sửa lỗi, vui lòng:**

1. **Mở terminal/PowerShell mới tại thư mục gốc dự án**
   - Windows: Bấm Win+R → gõ cmd → Enter
   - Hoặc mở terminal trong VS Code (Ctrl+\`)

2. **Chạy lệnh:**
   \`\`\`bash
   node chatbot-api.js
   \`\`\`

3. **Chờ cho đến khi thấy:**
   ✅ VIETBACCORP Chatbot API running on http://localhost:3001

4. **Quay lại ứng dụng và thử lại**

**Hoặc dùng script tự động:**
- Windows: Nhấp đôi \`start-chatbot.bat\` tại thư mục gốc
- Linux/Mac: \`bash start-chatbot.sh\` (nếu có)

Sau khi service chạy, tin nhắn sẽ hoạt động bình thường! 🚀`;
}

/**
 * Lấy ID người dùng hiện tại
 */
function getCurrentUserId() {
    return localStorage.getItem('userId') || window.currentUser?.id || 'user_' + Date.now();
}

// Gắn vào window để app.js có thể gọi
window.getGeminiResponse = getGeminiResponse;
window.checkChatbotService = checkChatbotService;
window.chatbotSessionId = sessionId;
