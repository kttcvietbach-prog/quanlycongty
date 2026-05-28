/**
 * Advanced ERP Chatbot Service
 * Intelligent assistant with multi-model support, context awareness, and ERP data integration
 */

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.CHATBOT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Initialize Anthropic client - with fallback
let anthropic;
try {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
} catch (error) {
  console.warn('⚠️ Warning: Could not initialize Anthropic client');
  console.warn('Make sure ANTHROPIC_API_KEY is set in .env file');
}

// In-memory storage
const conversations = new Map();
const sessionMetadata = new Map();

// Constants
const CONVERSATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY = 20;
const MAX_TOKENS = 1024;

/**
 * System prompt for ERP support
 */
const SYSTEM_PROMPT = `Bạn là một Trợ lý AI chuyên nghiệp cho hệ thống VIETBACHCORP ERP V6.1.

**Khả năng chính:**
1. **Hỗ trợ Nhân sự**: Quản lý nhân viên, hợp đồng, chấm công, lương bổng
2. **Quản lý Dự án**: Theo dõi dự án, công việc, tiến độ, nhân lực
3. **Bán hàng**: Quản lý khách hàng, đơn hàng, giá bán, hóa đơn
4. **Mua hàng**: Nhà cung cấp, đơn đặt hàng, chào giá, nhập kho
5. **Sản xuất**: Quản lý sản phẩm, BOM, qui trình, MRP
6. **Kho hàng**: Kiểm kê, xuất nhập, chứng từ
7. **Tài chính**: Kế toán, báo cáo, phân tích dữ liệu
8. **Quản lý**: Cấu hình hệ thống, phân quyền, cơ cấu tổ chức

**Cách trả lời:**
- Lịch sự, chuyên nghiệp, tập trung vào vấn đề người dùng
- Cung cấp hướng dẫn chi tiết từng bước
- Gợi ý các tính năng có liên quan
- Sử dụng định dạng HTML cơ bản (<b>, <i>, <ul>, <li>) để làm nổi bật
- Phân tích dữ liệu được cung cấp và đưa ra insight

**Ngôn ngữ**: Trả lời bằng tiếng Việt, trừ khi người dùng sử dụng tiếng Anh

**Lưu ý quan trọng**:
- Không bao giờ chia sẻ mật khẩu hay thông tin bảo mật
- Luôn yêu cầu xác nhận trước khi thực hiện hành động quan trọng
- Cung cấp dữ liệu chính xác từ ngữ cảnh ERP được cung cấp`;

/**
 * POST /api/chat/message
 * Send and receive chat messages
 */
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message, systemContext = '', userId = 'unknown' } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'sessionId và message là bắt buộc' 
      });
    }

    // Validate message length
    if (message.trim().length === 0 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Tin nhắn phải từ 1-5000 ký tự'
      });
    }

    // Check if anthropic is available
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'API Key chưa được cấu hình. Kiểm tra file .env'
      });
    }

    // Cleanup old conversations
    cleanupOldConversations();

    // Get or create conversation
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
      sessionMetadata.set(sessionId, {
        createdAt: Date.now(),
        userId,
        messageCount: 0
      });
    }

    const history = conversations.get(sessionId);
    const metadata = sessionMetadata.get(sessionId);

    // Limit history
    const limitedHistory = history.slice(-MAX_HISTORY);

    // Add user message
    limitedHistory.push({
      role: 'user',
      content: message
    });

    // Build system prompt with context
    const contextPrompt = systemContext 
      ? `${SYSTEM_PROMPT}\n\n**Dữ liệu hiện tại từ hệ thống:**\n${systemContext}`
      : SYSTEM_PROMPT;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: MAX_TOKENS,
      system: contextPrompt,
      messages: limitedHistory
    });

    // Extract response
    const assistantMessage = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

    // Add to history
    limitedHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    // Update storage
    conversations.set(sessionId, limitedHistory);
    metadata.messageCount += 1;

    return res.json({
      success: true,
      message: assistantMessage,
      sessionId,
      messageCount: metadata.messageCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi máy chủ'
    });
  }
});

/**
 * POST /api/chat/analyze
 * Analyze ERP data and provide insights
 */
app.post('/api/chat/analyze', async (req, res) => {
  try {
    const { sessionId, data, analysisType = 'general', userId = 'unknown' } = req.body;

    if (!sessionId || !data) {
      return res.status(400).json({
        success: false,
        error: 'sessionId và data là bắt buộc'
      });
    }

    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'API Key chưa được cấu hình'
      });
    }

    const analysisPrompt = buildAnalysisPrompt(analysisType, data);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: MAX_TOKENS * 2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const analysis = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Không thể phân tích dữ liệu.';

    return res.json({
      success: true,
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Analysis API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi máy chủ'
    });
  }
});

/**
 * POST /api/chat/clear
 * Clear conversation history
 */
app.post('/api/chat/clear', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId là bắt buộc'
      });
    }

    conversations.delete(sessionId);
    sessionMetadata.delete(sessionId);

    return res.json({
      success: true,
      message: 'Đã xóa lịch sử trò chuyện'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/status
 * Get chatbot status
 */
app.get('/api/chat/status', (req, res) => {
  return res.json({
    success: true,
    status: anthropic ? 'online' : 'offline',
    model: 'Claude 3.5 Sonnet',
    timestamp: new Date().toISOString(),
    conversations: conversations.size,
    apiKeyConfigured: !!anthropic
  });
});

/**
 * Build analysis prompt based on type
 */
function buildAnalysisPrompt(type, data) {
  const dataStr = JSON.stringify(data, null, 2);

  switch (type) {
    case 'sales':
      return `Phân tích dữ liệu bán hàng sau đây và cung cấp các insight chính về:
- Hiệu suất bán hàng
- Sản phẩm/khách hàng hàng đầu
- Xu hướng và khuyến nghị
- Cơ hội cải thiện

Dữ liệu:
${dataStr}

Trả lời bằng tiếng Việt, sử dụng định dạng HTML cơ bản để làm nổi bật.`;

    case 'inventory':
      return `Phân tích tình trạng kho hàng và cung cấp khuyến nghị về:
- Mức tồn kho tối ưu
- Sản phẩm cần đặt hàng
- Sản phẩm chậm chuyển động
- Chi phí lưu trữ

Dữ liệu:
${dataStr}

Trả lời bằng tiếng Việt, sử dụng định dạng HTML cơ bản.`;

    case 'finance':
      return `Phân tích dữ liệu tài chính và cung cấp:
- Tóm tắt tài chính
- Các chỉ số chính
- Xu hướng
- Khuyến nghị

Dữ liệu:
${dataStr}

Trả lời bằng tiếng Việt.`;

    case 'hr':
      return `Phân tích dữ liệu nhân sự và cung cấp insight về:
- Hiệu suất nhân viên
- Bộ phận
- Lương bổng và chi phí
- Khuyến nghị quản lý

Dữ liệu:
${dataStr}

Trả lời bằng tiếng Việt.`;

    default:
      return `Phân tích dữ liệu sau đây và cung cấp các insight hữu ích:

${dataStr}

Trả lời bằng tiếng Việt.`;
  }
}

/**
 * Cleanup old conversations (older than timeout)
 */
function cleanupOldConversations() {
  const now = Date.now();
  for (const [sessionId, metadata] of sessionMetadata.entries()) {
    if (now - metadata.createdAt > CONVERSATION_TIMEOUT) {
      conversations.delete(sessionId);
      sessionMetadata.delete(sessionId);
      console.log(`🗑️ Cleaned up old conversation: ${sessionId}`);
    }
  }
}

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ Chatbot Service running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/chat/message`);
  console.log('🤖 Model: Claude 3.5 Sonnet');
  console.log(`🔑 API Key configured: ${!!anthropic}`);
  console.log('');
});

module.exports = app;
