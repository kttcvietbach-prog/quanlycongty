/**
 * ERP Chatbot API - Claude Integration
 * Backend service handling Claude API calls securely
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.CHATBOT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize Gemini client (Fallback)
const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
console.log('🔑 Gemini Key detected:', rawGeminiKey ? `${rawGeminiKey.substring(0, 7)}...` : 'MISSING');

const genAI = rawGeminiKey && !rawGeminiKey.includes('your-gemini')
  ? new GoogleGenerativeAI(rawGeminiKey)
  : null;

// Store conversation history (in-memory for demo; use database for production)
const conversations = new Map();

// Specialist Persona Prompts (Inspired by Awesome ChatGPT Prompts)
const PERSONA_PROMPTS = {
  'project-manager': `
Bạn đang đóng vai là một QUẢN LÝ DỰ ÁN (Project Manager) dày dạn kinh nghiệm. 
Nhiệm vụ: Tập trung vào lập kế hoạch, theo dõi tiến độ, quản lý rủi ro và điều phối nguồn lực.
Phong cách: Quyết đoán, có tổ chức, chú trọng vào số liệu tiến độ và các mốc quan trọng (milestones).
Khi trả lời: Hãy ưu tiên phân tích thời gian hoàn thành, các rủi ro có thể xảy ra và đề xuất hành động cụ thể để dự án đúng tiến độ.`,

  'accountant': `
Bạn đang đóng vai là một KẾ TOÁN TRƯỞNG (Accountant).
Nhiệm vụ: Kiểm soát chi phí, quản lý dòng tiền, thuế và tính tuân thủ tài chính.
Phong cách: Cẩn thận, chi tiết, chính xác đến từng con số.
Khi trả lời: Hãy tập trung vào tính cân đối, các khoản nợ phải thu/phải trả và hiệu quả sử dụng vốn.`,

  'financial-analyst': `
Bạn đang đóng vai là một CHUYÊN GIA PHÂN TÍCH TÀI CHÍNH (Financial Analyst).
Nhiệm vụ: Phân tích xu hướng, dự báo doanh thu, lợi nhuận và đánh giá hiệu quả đầu tư (ROI).
Phong cách: Khách quan, dựa trên dữ liệu, nhìn nhận bức tranh tổng thể.
Khi trả lời: Hãy sử dụng các chỉ số tài chính, so sánh dữ liệu quá khứ và đưa ra các dự báo mang tính chiến lược.`,

  'hr-advisor': `
Bạn đang đóng vai là một CỐ VẤN NHÂN SỰ (HR Advisor).
Nhiệm vụ: Quản lý hiệu suất nhân viên, văn hóa công ty và tuyển dụng.
Phong cách: Thấu hiểu, chuyên nghiệp, cân bằng giữa lợi ích công ty và nhân sự.
Khi trả lời: Hãy chú trọng vào KPI, phúc lợi, môi trường làm việc và lộ trình phát triển con người.`,

  'logistician': `
Bạn đang đóng vai là một CHUYÊN GIA VẬN HÀNH & KHO VẬN (Logistician).
Nhiệm vụ: Tối ưu hóa chuỗi cung ứng, tồn kho và chi phí vận chuyển.
Phong cách: Thực tế, hiệu quả, nhạy bén với các vấn đề logistics.
Khi trả lời: Hãy tập trung vào vòng quay hàng tồn kho, lead-time, và các giải pháp giảm thiểu chi phí lưu kho.`,

  'default': 'Bạn là Trợ lý AI đa năng, sẵn sàng hỗ trợ mọi nghiệp vụ ERP với phong cách chuyên nghiệp, thân thiện.'
};

// System prompt for ERP chatbot
const SYSTEM_PROMPT = `Bạn là Trợ lý AI thông minh của VIETBACHCORP (VIETBACH ERP).
Nhiệm vụ của bạn là hỗ trợ người dùng vận hành hệ thống ERP, tra cứu thông tin và thực hiện các nghiệp vụ.

QUY TẮC CỐT LÕI (CORE RULES):
1. LUÔN ƯU TIÊN thông tin trong phần "Current system context" (Ngữ cảnh hệ thống hiện tại) bên dưới để trả lời chính xác về số liệu thực tế của công ty.
2. PHÂN BIỆT RÕ RÀNG giữa "Số liệu toàn công ty" và "Số liệu riêng của từng dự án". Tránh nhầm lẫn các con số tiền tỷ khi báo cáo.
3. Nếu không có thông tin trong ngữ cảnh, hãy trả lời dựa trên kiến thức chung nhưng ghi chú rõ là "không tìm thấy dữ liệu trong hệ thống".
4. Tuyệt đối bảo mật thông tin kỹ thuật và API Key.

TÍNH CÁCH & KHẢ NĂNG MỞ RỘNG (PERSONALITY & VERSATILITY):
1. THÔNG MINH & ĐA NĂNG: Ngoài việc quản lý ERP, bạn có một "bộ não" phong phú về kiến thức xã hội, khoa học, văn hóa và giải trí.
2. THẤU CẢM & CHIA SẺ: Nếu người dùng bày tỏ cảm xúc (vui, buồn, mệt mỏi), hãy phản hồi một cách ấm áp, chân thành và khích lệ. Bạn không chỉ là một cỗ máy, hãy là một người đồng nghiệp đáng tin cậy.
3. HÀI HƯỚC: Nếu người dùng cần một câu chuyện cười hoặc không khí vui vẻ, hãy sẵn sàng chia sẻ những câu chuyện hài hước, tích cực để giúp họ giải tỏa áp lực công việc.
5. CÔNG CỤ NLP (UNDERTHESEA): Hệ thống của bạn được tích hợp công cụ xử lý ngôn ngữ tự nhiên UnderTheSea. Khi nhận được dữ liệu "NLP Analysis", hãy dùng thông tin đó để hiểu chính xác các danh từ riêng (Mã dự án, tên đối tác) và các hành động của người dùng.
6. Tuyệt đối không tiết lộ các API Key hoặc cấu hình kỹ thuật của hệ thống.`;

// Helper to call UnderTheSea NLP Processor
function callNLPProcessor(text) {
  try {
    // Sanitize text for shell
    const sanitized = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const result = execSync(`python nlp_processor.py "${sanitized}"`, { encoding: 'utf-8', timeout: 5000 });
    return JSON.parse(result);
  } catch (err) {
    console.warn('⚠️ NLP Processor Error:', err.message);
    return null;
  }
}

/**
 * POST /api/chat/message
 * Send message to chatbot
 */
app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message, systemContext = '', persona = 'default' } = req.body;

  // Basic validation
  if (!sessionId || !message) {
    return res.status(400).json({ success: false, error: 'sessionId and message are required' });
  }

  // Get or create conversation history
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const history = conversations.get(sessionId);

  try {
    console.log(`📩 [${new Date().toLocaleTimeString()}] Tin nhắn: "${message.substring(0, 50)}..." [Mode: ${persona}]`);

    // Get persona prompt
    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['default'];

    if (systemContext) {
      console.log(`📊 Đã nhận ngữ cảnh hệ thống (${systemContext.length} ký tự)`);
    }

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    });

    // 0. Vietnamese NLP Processing (UnderTheSea)
    const nlpData = callNLPProcessor(message);
    let nlpContext = '';
    if (nlpData && nlpData.success) {
      nlpContext = `\n[NLP Analysis: Segmented="${nlpData.segmented}", Entities=${JSON.stringify(nlpData.entities)}]`;
      console.log(`🤖 [NLP] Segmented: ${nlpData.segmented}`);
    }

    // Combine system prompt with persona and context
    const systemPromptWithContext = systemContext
      ? `${SYSTEM_PROMPT}\n\n**VAI TRÒ HIỆN TẠI:**\n${personaPrompt}\n\n**DỮ LIỆU HỆ THỐNG HIỆN TẠI:**\n${systemContext}${nlpContext}`
      : `${SYSTEM_PROMPT}\n\n**VAI TRÒ HIỆN TẠI:**\n${personaPrompt}${nlpContext}`;

    // --- 0. Ollama Local AI Integration (Highest Priority) ---
    const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

    try {
      console.log(`🤖 [Ollama] Attempting local call with model: ${OLLAMA_MODEL}`);
      const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: 'system', content: systemPromptWithContext },
            ...history
          ],
          stream: false
        })
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        const assistantMessage = data.message.content;

        history.push({ role: 'assistant', content: assistantMessage });
        if (history.length > 20) { history.splice(0, 2); }

        console.log('✅ Ollama response successful!');
        return res.json({
          success: true,
          message: assistantMessage,
          sessionId,
          provider: 'ollama-local',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Ollama response not OK');
      }
    } catch (ollamaError) {
      console.log('💡 Ollama not available or busy (Local AI skipped)');
    }

    // --- 1. OpenAI GPT Integration (Secondary Attempt) ---
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log(`🤖 [OpenAI] Attempting call with model: ${process.env.OPENAI_MODEL || 'gpt-5.4-mini'}`);

        // Prepare the prompt by combining history
        const prompt = `${systemPromptWithContext}\n\n` +
          history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n') +
          '\nAssistant:';

        const openAiResponse = await fetch(process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
            input: prompt,
            store: true
          })
        });

        if (!openAiResponse.ok) {
          throw new Error(`OpenAI API error: ${openAiResponse.statusText}`);
        }

        const data = await openAiResponse.json();

        // Extract message (handling various formats)
        let assistantMessage = '';
        if (Array.isArray(data.output) && data.output[0]) {
          const firstOutput = data.output[0];
          if (Array.isArray(firstOutput.content)) {
            const textItem = firstOutput.content.find(c => c.text || c.type === 'text');
            if (textItem) { assistantMessage = textItem.text || textItem.content || ''; }
          } else if (firstOutput.text) {
            assistantMessage = firstOutput.text;
          }
        }

        if (!assistantMessage && data.choices && data.choices[0] && data.choices[0].message) {
          assistantMessage = data.choices[0].message.content;
        }

        if (!assistantMessage) {
          console.error('❌ OpenAI Error: Could not parse response', data);
          throw new Error('Could not parse OpenAI response');
        }

        history.push({ role: 'assistant', content: assistantMessage });
        if (history.length > 20) { history.splice(0, 2); }

        return res.json({
          success: true,
          message: assistantMessage,
          sessionId,
          provider: 'openai',
          timestamp: new Date().toISOString()
        });

      } catch (openAiError) {
        console.error('❌ OpenAI attempt failed, falling back to Claude:', openAiError.message);
      }
    }

    // --- 2. Claude API Integration (Secondary Attempt) ---
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPromptWithContext,
          messages: history
        });

        const assistantMessage = response.content[0].type === 'text'
          ? response.content[0].text
          : 'Sorry, I could not process that request.';

        history.push({ role: 'assistant', content: assistantMessage });
        if (history.length > 20) { history.splice(0, 2); }

        return res.json({
          success: true,
          message: assistantMessage,
          sessionId,
          provider: 'claude',
          timestamp: new Date().toISOString()
        });
      } catch (claudeError) {
        console.error('❌ Anthropic API error:', claudeError.message);
      }
    }

    // If we reach here, both primary methods failed or were skipped
    throw new Error('Primary AI providers failed');

  } catch (error) {
    // --- 3. Gemini REST API Fallback (Tertiary Attempt) ---
    try {
      console.log('🚀 Using SDK for Gemini fallback (2.0-flash)...');
      const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['default'];
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
      const fullPrompt = `**VAI TRÒ:** ${personaPrompt}\n\n**NGỮ CẢNH HỆ THỐNG:** ${systemContext}\n\n**LỊCH SỬ TRÒ CHUYỆN:**\n${historyText}\n\n**CÂU HỎI MỚI NHẤT:** ${message}`;

      const result = await model.generateContent(fullPrompt);
      const assistantMessage = result.response.text();

      if (!assistantMessage) {
        throw new Error('Gemini SDK returned empty response');
      }

      console.log('✅ Gemini SDK fallback successful!');

      // Add to history
      history.push({ role: 'assistant', content: assistantMessage });
      if (history.length > 20) { history.splice(0, 2); }

      return res.json({
        success: true,
        message: assistantMessage,
        sessionId,
        provider: 'gemini-sdk',
        timestamp: new Date().toISOString()
      });
    } catch (geminiError) {
      console.error('❌ Gemini fallback also failed:', geminiError.message);

      // --- 4. Ultimate Static Fallback ---
      const fallbackMessage = 'Xin lỗi, hiện tại tôi đang gặp khó khăn khi kết nối với máy chủ AI. Tuy nhiên, tôi vẫn có thể hỗ trợ bạn các thao tác cơ bản trên hệ thống ERP. Bạn cần hướng dẫn về module nào?';

      res.json({
        success: true,
        message: fallbackMessage,
        sessionId,
        isFallback: true,
        timestamp: new Date().toISOString()
      });
    }
  }
});

/**
 * POST /api/chat/analyze
 * Analyze data with chatbot
 */
app.post('/api/chat/analyze', async (req, res) => {
  try {
    const { sessionId, data, analysisType = 'general' } = req.body;

    if (!sessionId || !data) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and data are required'
      });
    }

    const analysisPrompt = `Please analyze the following ${analysisType} data:\n\n${JSON.stringify(data, null, 2)}\n\nProvide insights and recommendations.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: analysisPrompt
      }]
    });

    const analysis = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Could not analyze data.';

    res.json({
      success: true,
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Analysis API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze data',
      details: error.message
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
      return res.status(400).json({ error: 'sessionId is required' });
    }

    conversations.delete(sessionId);

    res.json({ success: true, message: 'Conversation cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

/**
 * GET /api/chat/status
 * Health check
 */
app.get('/api/chat/status', async (req, res) => {
  let ollamaStatus = 'offline';
  try {
    const response = await fetch(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/tags`);
    if (response.ok) ollamaStatus = 'online';
  } catch (e) { /* ignore */ }

  res.json({
    status: 'online',
    ollama: ollamaStatus,
    primary_model: ollamaStatus === 'online' ? (process.env.OLLAMA_MODEL || 'llama3') : (process.env.OPENAI_API_KEY ? 'openai' : 'claude'),
    providers: {
      ollama: ollamaStatus === 'online',
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    },
    timestamp: new Date().toISOString()
  });
});

// Start server with EADDRINUSE recovery
const PRIMARY_PORT = parseInt(process.env.PORT || process.env.CHATBOT_PORT || 3001);
const FALLBACK_PORT = PRIMARY_PORT + 1;

function startServer(port) {
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${port} is already in use.`);
      if (port === PRIMARY_PORT) {
        console.log(`🔄 Trying fallback port ${FALLBACK_PORT}...`);
        server.close();
        startServer(FALLBACK_PORT);
      } else {
        console.error(`💥 Both ports ${PRIMARY_PORT} and ${FALLBACK_PORT} are busy.`);
        process.exit(1);
      }
    } else {
      console.error('CRITICAL ERROR:', err);
      process.exit(1);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    if (port !== PRIMARY_PORT) {
      console.warn(`⚠️  Primary port ${PRIMARY_PORT} was busy. Running on fallback port ${port}.`);
    }
    console.log('✅ SERVER STARTED SUCCESSFULLY');
    console.log(`🤖 VIETBACCORP Chatbot API running on port ${port}`);
    console.log(`📍 Health Check: http://localhost:${port}/api/chat/status`);
  });
}

startServer(PRIMARY_PORT);

process.on('SIGINT', () => { console.log('\n👋 Shutting down chatbot server...'); process.exit(0); });
process.on('uncaughtException', (err) => { console.error('CRITICAL ERROR:', err); });

export default app;
