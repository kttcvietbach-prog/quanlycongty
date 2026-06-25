import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import https from 'https';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import multer from 'multer';
import { initDriveClient, uploadFile, listFiles, downloadFile, deleteFile, createFolder, listFolders, getModuleFolders, isDriveReady } from './google-drive.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const DATA_DIR = join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const KEYWORDS_FILE = join(DATA_DIR, 'monitored_keywords.json');
const SEEN_BIDS_FILE = join(DATA_DIR, 'seen_bids.json');

function loadJSON(file, defaultVal = []) {
  if (!fs.existsSync(file)) return defaultVal;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return defaultVal; }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Import Alert & Email Services
import { runExpirationScan } from './alert_service.mjs';
import { sendEmailNotification } from './email_service.mjs';

// --- SCRAPER CONFIGURATION ---
// Dùng Axios + Cheerio để thay thế Puppeteer (nhẹ hơn, chạy ổn định trên Render)
let guestCookieJar = '';

async function getScrapedData(url) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
      'Referer': 'https://dauthau.asia/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'Upgrade-Insecure-Requests': '1'
    };

    // 1. Nếu có VIP Cookie trong .env, sử dụng ngay lập tức
    if (process.env.DAUTHAU_COOKIE) {
      headers['Cookie'] = process.env.DAUTHAU_COOKIE;
    } 
    // 2. Nếu không có VIP Cookie, tự động lấy Cookie vãng lai (Guest Session Cookie) từ trang chủ
    else {
      if (!guestCookieJar) {
        console.log('🌐 [Scraper] Khởi tạo phiên khách vãng lai (Guest Session) bằng cách kết nối trang chủ...');
        try {
          const homeRes = await axios.get('https://dauthau.asia/', { 
            headers: { 'User-Agent': headers['User-Agent'] }, 
            timeout: 10000 
          });
          const setCookie = homeRes.headers['set-cookie'];
          if (setCookie) {
            guestCookieJar = setCookie.map(c => c.split(';')[0]).join('; ');
            console.log('✅ [Scraper] Lấy Cookie khách vãng lai thành công:', guestCookieJar);
          }
        } catch (homeErr) {
          console.warn('⚠️ [Scraper] Không lấy được cookie trang chủ, tiếp tục cào trực tiếp:', homeErr.message);
        }
      }
      if (guestCookieJar) {
        headers['Cookie'] = guestCookieJar;
      }
    }

    const response = await axios.get(url, { headers, timeout: 15000 });
    return response.data;
  } catch (err) {
    console.error(`❌ [Scraper] Lỗi khi tải trang: ${err.message}`);
    throw err;
  }
}

const PROVINCES = {
  'ha-noi': 1, 'ho-chi-minh': 2, 'da-nang': 3, 'hai-phong': 4, 'can-tho': 5,
  'an-giang': 6, 'ba-ria-vung-tau': 7, 'bac-giang': 8, 'bac-kan': 9, 'bac-lieu': 10,
  'bac-ninh': 11, 'ben-tre': 12, 'binh-dinh': 13, 'binh-duong': 14, 'binh-phuoc': 15,
  'binh-thuan': 16, 'ca-mau': 17, 'cao-bang': 18, 'dak-lak': 19, 'dak-nong': 20,
  'dien-bien': 21, 'dong-nai': 22, 'dong-thap': 23, 'gia-lai': 24, 'ha-giang': 25,
  'ha-nam': 26, 'ha-tinh': 27, 'hai-duong': 28, 'hau-giang': 29, 'hoa-binh': 30,
  'hung-yen': 31, 'khanh-hoa': 32, 'kien-giang': 33, 'kon-tum': 34, 'lai-chau': 35,
  'lam-dong': 36, 'lang-son': 37, 'lao-cai': 38, 'long-an': 39, 'nam-dinh': 40,
  'nghe-an': 41, 'ninh-binh': 42, 'ninh-thuan': 43, 'phu-tho': 44, 'phu-yen': 45,
  'quang-binh': 46, 'quang-nam': 47, 'quang-ngai': 48, 'quang-ninh': 49, 'quang-tri': 50,
  'soc-trang': 51, 'son-la': 52, 'tay-ninh': 53, 'thai-binh': 54, 'thai-nguyen': 55,
  'thanh-hoa': 56, 'thua-thien-hue': 57, 'tien-giang': 58, 'tra-vinh': 59, 'tuyen-quang': 60,
  'vinh-long': 61, 'vinh-phuc': 62, 'yen-bai': 63
};

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
  }
}));

// Multer config for file uploads (temp storage before sending to Drive)
const UPLOAD_TEMP_DIR = join(__dirname, 'data', 'uploads_temp');
if (!fs.existsSync(UPLOAD_TEMP_DIR)) fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });

const upload = multer({
  dest: UPLOAD_TEMP_DIR,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// Explicit route for root
app.get('/', (req, res) => {
  const indexPath = join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`index.html not found in ${__dirname}`);
  }
});

// --- AI CONFIGURATION ---
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const genAI = rawGeminiKey && !rawGeminiKey.includes('your-gemini')
  ? new GoogleGenerativeAI(rawGeminiKey)
  : null;

const conversations = new Map();

const PERSONA_PROMPTS = {
  'project-manager': `Bạn đang đóng vai là một QUẢN LÝ DỰ ÁN (Project Manager). Tập trung vào tiến độ, rủi ro và điều phối.`,
  'accountant': `Bạn đang đóng vai là một KẾ TOÁN TRƯỞNG. Kiểm soát chi phí, dòng tiền và chính xác số liệu.`,
  'financial-analyst': `Bạn đang đóng vai là một CHUYÊN GIA PHÂN TÍCH TÀI CHÍNH. Dự báo xu hướng và ROI.`,
  'hr-advisor': `Bạn đang đóng vai là một CỐ VẤN NHÂN SỰ. KPI, văn hóa và con người.`,
  'logistician': `Bạn đang đóng vai là một CHUYÊN GIA KHO VẬN. Tối ưu tồn kho và chuỗi cung ứng.`,
  'default': `Bạn là Trợ lý AI đa năng của VIETBACH ERP.`
};

const SYSTEM_PROMPT = `Bạn là Trợ lý AI thông minh của VIETBACHCORP. 
1. Ưu tiên "Current system context".
2. Phân biệt rõ số liệu công ty và dự án.
3. Thấu cảm, thông minh và đôi khi hài hước.`;

// --- AI ROUTES ---
app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message, systemContext = '', persona = 'default' } = req.body;
  if (!sessionId || !message) return res.status(400).json({ error: 'Missing data' });

  if (!conversations.has(sessionId)) conversations.set(sessionId, []);
  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: message });

  const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['default'];
  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n**ROLE:** ${personaPrompt}\n\n**CONTEXT:** ${systemContext}`;

  try {
    // 1. Try Claude (if key exists)
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: history
      });
      const aiMsg = response.content[0].text;
      history.push({ role: 'assistant', content: aiMsg });
      return res.json({ success: true, message: aiMsg, provider: 'claude' });
    }

    // 2. Try Gemini (Fallback)
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${fullSystemPrompt}\n\nUser: ${message}`;
      const result = await model.generateContent(prompt);
      const aiMsg = result.response.text();
      history.push({ role: 'assistant', content: aiMsg });
      return res.json({ success: true, message: aiMsg, provider: 'gemini' });
    }

    throw new Error('No AI provider available');
  } catch (err) {
    console.error('AI Error:', err);
    res.status(503).json({ success: false, message: "⚠️ Xin lỗi, tôi không thể kết nối AI lúc này. Hãy thử lại sau.", isFallback: true });
  }
});

app.get('/api/chat/status', (req, res) => {
  res.json({ status: 'online', gemini: !!genAI, anthropic: !!process.env.ANTHROPIC_API_KEY });
});

// --- ZALO PROXY ---
app.post('/zalo-proxy', (req, res) => {
  const targetUrl = 'https://openapi.zalo.me/v3.0/oa/message/transaction';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'access_token': req.headers['access_token'] || '',
      'secret_key': req.headers['secret_key'] || ''
    }
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ error: -1, message: err.message });
  });

  proxyReq.write(JSON.stringify(req.body));
  proxyReq.end();
});

app.post('/zalo-refresh', (req, res) => {
  const targetUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'access_token': req.headers['access_token'] || '',
      'secret_key': req.headers['secret_key'] || ''
    }
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ error: -1, message: err.message });
  });

  proxyReq.write(JSON.stringify(req.body));
  proxyReq.end();

});

// --- ALERT SERVICE ROUTES ---
app.get('/api/admin/scan-alerts', async (req, res) => {
  console.log('⚡ Manual alert scan triggered');
  try {
    const result = await runExpirationScan();
    res.json({ success: true, message: 'Alert scan completed.', summary: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- EMAIL NOTIFICATION FOR DATA CHANGES ---

app.post('/api/send-notification-email', async (req, res) => {
    const { subject, body, content, to, changes, attachments } = req.body;
    const emailBody = body || content;
    if (!subject || !emailBody) {
        return res.status(400).json({ success: false, message: 'Missing subject or body' });
    }

    try {
        // Load email config from Firestore
        const emailConfigUrl = `https://firestore.googleapis.com/v1/projects/vietbachcorp-6cd8c/databases/(default)/documents/email_config/email_config`;
        const configRes = await new Promise((resolve) => {
            https.get(emailConfigUrl, (httpRes) => {
                let data = '';
                httpRes.on('data', (chunk) => data += chunk);
                httpRes.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
                });
            }).on('error', () => resolve({}));
        });

        const emailConfig = {
            enabled: configRes.fields?.enabled?.booleanValue ?? false,
            smtpHost: configRes.fields?.smtpHost?.stringValue || 'smtp.gmail.com',
            smtpPort: configRes.fields?.smtpPort?.stringValue || '587',
            smtpUser: configRes.fields?.smtpUser?.stringValue || '',
            smtpPass: configRes.fields?.smtpPass?.stringValue || '',
            senderName: configRes.fields?.senderName?.stringValue || 'VIETBACHCORP ERP',
            recipientEmails: to || [configRes.fields?.recipientEmails?.stringValue, configRes.fields?.smtpUser?.stringValue].filter(Boolean).join(','),
            attachments: attachments || []
        };

        if (!emailConfig.enabled) {
            return res.json({ success: false, message: 'Email notifications disabled' });
        }

        const result = await sendEmailNotification(subject, emailBody, emailConfig);
        console.log(`[EmailNotify] Data change email: ${changes?.length || 0} changes, result: ${result.success}`);
        res.json({ success: result.success, message: result.success ? 'Email sent' : result.message });
    } catch (err) {
        console.error('[EmailNotify] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- SCRAPER ENDPOINTS ---
app.get('/api/filters', (req, res) => {
  res.json({
    success: true,
    filters: {
      provinces: Object.entries(PROVINCES).map(([key, id]) => ({ id, key, name: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })),
      sectors: [
        { id: 'hang-hoa', name: 'Hàng hóa', param: 'goods', value: 1 },
        { id: 'xay-lap', name: 'Xây lắp', param: 'construction', value: 1 },
        { id: 'tu-van', name: 'Tư vấn', param: 'consulting', value: 1 },
        { id: 'phi-tu-van', name: 'Phi tư vấn', param: 'non_consulting', value: 1 },
        { id: 'hon-hop', name: 'Hỗn hợp', param: 'mixed', value: 1 }
      ]
    }
  });
});

app.get('/api/scrape-dauthau', async (req, res) => {
  const { keyword = '', province = '', provinceId = '', biddingType = '0', sector = '', infoType = 'tbmt', page = '1' } = req.query;
  console.log(`📡 [Scraper] Yêu cầu mới: keyword="${keyword}", province="${province}", infoType="${infoType}"`);

  const INFO_TYPE_PATHS = { 'tbmt': '/thongbao/moithau/', 'khlcnt': '/kehoach/luachon-nhathau/', 'du-an': '/devprojects/', 'kqlcnt': '/ketqua/luachon-nhathau/' };
  const basePath = INFO_TYPE_PATHS[infoType] || '/thongbao/moithau/';

  try {

    const params = new URLSearchParams();
    if (keyword) {
      params.set('q', keyword);
      params.set('keyword', keyword);
      const kwLower = keyword.trim().toLowerCase();
      const isInvestorSearch = /^(sở|ban|ubnd|công ty|phòng|bệnh viện|trường|trung tâm|viện)/.test(kwLower);
      if (isInvestorSearch) params.set('type_search', '1');
      else params.set('type_search', '0');
    }
    const resProvId = provinceId || (province ? PROVINCES[province] : '');
    if (resProvId) params.set('search_idprovince', resProvId);
    if (sector) {
      const sm = { 'hang-hoa': 'goods', 'xay-lap': 'construction', 'tu-van': 'consulting', 'phi-tu-van': 'non_consulting', 'hon-hop': 'mixed' };
      if (sm[sector]) params.set(sm[sector], '1');
    }
    if (keyword || resProvId || sector || (page && page !== '1')) {
      params.set('searching', '1');
    }
    if (page && page !== '1') params.set('page', page);

    const sep = basePath.includes('?') ? '&' : '?';
    const searchUrl = `https://dauthau.asia${basePath}${sep}${params.toString()}`;
    console.log(`🔍 [Scraper] URL: ${searchUrl}`);

    const html = await getScrapedData(searchUrl);
    const $ = cheerio.load(html);
    
    const results = [];

    $('table tbody tr').each((i, el) => {
      const cells = $(el).find('td');
      if (cells.length < 3) return;

      const col1 = $(cells[0]);
      const bidLink = col1.find('a');
      const bidName = bidLink.attr('title') || bidLink.text().trim();

      if (!bidName || bidName.length < 5) return;

      const ownerName = $(cells[1]).find('a').text().trim() || $(cells[1]).text().trim().split('\n')[0];
      const closingDateMatch = $(cells[3]).text().trim().match(/\d{2}\/\d{2}\/\d{4}/);
      const closingDate = closingDateMatch ? closingDateMatch[0] : 'Đang cập nhật';

      results.push({
        id: 'BID-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: bidName,
        project: bidName,
        customer: ownerName || 'Đang cập nhật',
        closingDate,
        url: bidLink.attr('href') ? (bidLink.attr('href').startsWith('http') ? bidLink.attr('href') : 'https://dauthau.asia' + bidLink.attr('href')) : '',
        source: 'dauthau.asia'
      });
    });

    // Chỉ kiểm tra trang đăng nhập hoặc yêu cầu tài khoản VIP nếu thực sự không tìm thấy kết quả nào
    if (results.length === 0) {
      const pageTitle = $('title').text().trim();
      const bodyText = $('body').text();
      const isLoginRequired = pageTitle.includes('Đăng nhập') || pageTitle.includes('iportal') || pageTitle.includes('iPortal') || 
                              bodyText.includes('Bạn phải đăng nhập để sử dụng') || bodyText.includes('yêu cầu đăng nhập để sử dụng') || 
                              bodyText.includes('chỉ dành cho thành viên');

      if (isLoginRequired) {
        console.warn('⚠️ [Scraper] Bị chuyển hướng hoặc yêu cầu đăng nhập tài khoản DauThau.info.');
        return res.json({ 
          success: false, 
          errorType: 'LOGIN_REQUIRED', 
          message: 'DauThau.info yêu cầu đăng nhập tài khoản để xem Thông báo mời thầu (TBMT) với bộ lọc này.' 
        });
      }
    }

    console.log(`✅ [Scraper] Thành công: Lấy được ${results.length} kết quả.`);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(`❌ [Scraper] LỖI CHI TIẾT:`, err);
    
    let errorType = 'SCRAPER_ERROR';
    let errorMessage = err.message;
    
    if (err.response?.status === 403 || err.response?.status === 503) {
      errorType = 'CLOUDFLARE_BLOCKED';
      errorMessage = 'Kết nối bị chặn bởi hệ thống bảo vệ (Cloudflare) của DauThau.info. Vui lòng cấu hình DAUTHAU_COOKIE trong file .env để vượt qua bảo vệ!';
    }
    
    res.json({ success: false, errorType, error: errorMessage });
  }
});

// --- GOOGLE DRIVE FILE MANAGEMENT ---

// Check Drive status
app.get('/api/drive/status', async (req, res) => {
  try {
    const ready = await isDriveReady();
    const modules = ready ? getModuleFolders() : [];
    res.json({ success: true, ready, modules });
  } catch (err) {
    res.json({ success: false, ready: false, error: err.message });
  }
});

// Upload file(s) to Google Drive
app.post('/api/drive/upload', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'Không có file nào được chọn' });
  }

  const { module, folderId } = req.body;
  const results = [];
  const errors = [];

  for (const file of req.files) {
    try {
      // Sửa lỗi multer mã hóa sai tên file tiếng Việt (từ latin1 -> utf8)
      let safeFileName = file.originalname;
      try {
        const decoded = Buffer.from(file.originalname, 'latin1').toString('utf8');
        if (decoded.length > 0 && decoded.replace(/\0/g, '').length === decoded.length) {
            safeFileName = decoded;
        }
      } catch (e) {
        // Bỏ qua lỗi decode, dùng tên gốc
      }

      const uploaded = await uploadFile({
        filePath: file.path,
        fileName: safeFileName,
        mimeType: file.mimetype,
        module: module || 'chung',
        folderId: folderId || null
      });
      results.push(uploaded);
    } catch (err) {
      errors.push({ file: file.originalname, error: err.message });
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
    }
  }

  res.json({
    success: errors.length === 0,
    uploaded: results,
    errors,
    message: `Đã upload ${results.length}/${req.files.length} file thành công`
  });
});

// List files in a folder
app.get('/api/drive/files', async (req, res) => {
  try {
    const { folderId, module, pageSize, pageToken } = req.query;
    const result = await listFiles({
      folderId,
      module,
      pageSize: parseInt(pageSize) || 50,
      pageToken
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download a file
app.get('/api/drive/download/:fileId', async (req, res) => {
  try {
    const { stream, metadata } = await downloadFile(req.params.fileId);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.name)}"`);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    if (metadata.size) res.setHeader('Content-Length', metadata.size);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// View/Stream a file directly in the browser (inline) - perfect for Google Drive images
app.get('/api/drive/view/:fileId', async (req, res) => {
  try {
    const { stream, metadata } = await downloadFile(req.params.fileId);
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    if (metadata.size) res.setHeader('Content-Length', metadata.size);
    stream.pipe(res);
  } catch (err) {
    console.error('[DriveView] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a file
app.delete('/api/drive/files/:fileId', async (req, res) => {
  try {
    await deleteFile(req.params.fileId);
    res.json({ success: true, message: 'File đã được xóa' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List folders
app.get('/api/drive/folders', async (req, res) => {
  try {
    const { parentId } = req.query;
    const folders = await listFolders(parentId);
    res.json({ success: true, folders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new folder
app.post('/api/drive/folders', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Thiếu tên folder' });
    const folder = await createFolder(name, parentId);
    res.json({ success: true, folder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get module folders
app.get('/api/drive/modules', (req, res) => {
  const modules = getModuleFolders();
  res.json({ success: true, modules });
});

// Catch-all for SPA
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'index.html');
  console.log(`[Server] Serving SPA root: ${indexPath}`);
  res.sendFile(indexPath);
});

// --- MONITORING ENDPOINTS ---
app.get('/api/bidding-monitor/keywords', (req, res) => {
  res.json(loadJSON(KEYWORDS_FILE));
});

app.post('/api/bidding-monitor/keywords', (req, res) => {
  const { keyword, province, infoType } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Thiếu từ khóa' });

  const keywords = loadJSON(KEYWORDS_FILE);
  const exists = keywords.find(k => k.keyword === keyword && k.province === province && k.infoType === infoType);
  if (!exists) {
    keywords.push({ keyword, province, infoType, addedAt: new Date().toISOString() });
    saveJSON(KEYWORDS_FILE, keywords);
  }
  res.json({ success: true, keywords });
});

app.delete('/api/bidding-monitor/keywords', (req, res) => {
  const { keyword } = req.body;
  let keywords = loadJSON(KEYWORDS_FILE);
  keywords = keywords.filter(k => k.keyword !== keyword);
  saveJSON(KEYWORDS_FILE, keywords);
  res.json({ success: true, keywords });
});

async function runAutoBiddingScan() {
  console.log('🤖 [AutoScraper] Bắt đầu quét gói thầu mới...');
  const keywords = loadJSON(KEYWORDS_FILE);
  const seenBids = loadJSON(SEEN_BIDS_FILE);
  const newBidsFound = [];

  for (const k of keywords) {
    try {
      console.log(`🔍 [AutoScraper] Đang quét: "${k.keyword}"...`);
      const params = new URLSearchParams({
        q: k.keyword,
        keyword: k.keyword,
        type_search: '1',
        searching: '1'
      });
      if (k.province) {
        const provId = PROVINCES[k.province];
        if (provId) params.set('search_idprovince', provId);
      }

      const INFO_TYPE_PATHS = { 'tbmt': '/thongbao/moithau/', 'khlcnt': '/kehoach/luachon-nhathau/', 'du-an': '/devprojects/', 'kqlcnt': '/ketqua/luachon-nhathau/' };
      const basePath = INFO_TYPE_PATHS[k.infoType] || '/thongbao/moithau/';
      const sep = basePath.includes('?') ? '&' : '?';
      const searchUrl = `https://dauthau.asia${basePath}${sep}${params.toString()}`;

      const html = await getScrapedData(searchUrl);
      const $ = cheerio.load(html);

      $('table tbody tr').each((i, el) => {
        const cells = $(el).find('td');
        if (cells.length < 3) return;
        const bidLink = $(cells[0]).find('a');
        const bidName = bidLink.attr('title') || bidLink.text().trim();
        const bidUrl = bidLink.attr('href') ? (bidLink.attr('href').startsWith('http') ? bidLink.attr('href') : 'https://dauthau.asia' + bidLink.attr('href')) : '';

        // Dùng URL hoặc tên làm ID duy nhất để tránh trùng
        const bidId = bidUrl || bidName;
        if (bidName && bidName.length > 5 && !seenBids.includes(bidId)) {
          console.log(`✨ [AutoScraper] Tìm thấy gói mới: ${bidName}`);
          newBidsFound.push({ name: bidName, keyword: k.keyword, url: bidUrl });
          seenBids.push(bidId);
        }
      });

      // Giới hạn bộ nhớ seenBids (giữ 2000 cái gần nhất)
      if (seenBids.length > 2000) seenBids.splice(0, seenBids.length - 2000);
      saveJSON(SEEN_BIDS_FILE, seenBids);

    } catch (err) {
      console.error(`❌ [AutoScraper] Lỗi khi quét từ khóa "${k.keyword}":`, err.message);
    }
    // Nghỉ 5s giữa mỗi từ khóa để tránh bị chặn
    await new Promise(r => setTimeout(r, 5000));
  }

  if (newBidsFound.length > 0) {
    console.log(`🔔 [AutoScraper] Đang gửi thông báo cho ${newBidsFound.length} gói thầu mới...`);

    // Gửi Email nếu có cấu hình
    const emailSubject = `🔔 [VIETBACH ERP] Có ${newBidsFound.length} gói thầu mới được tìm thấy!`;
    const emailBody = newBidsFound.map(b => `- Gói thầu: ${b.name}\n  Từ khóa: ${b.keyword}\n  Link: ${b.url}`).join('\n\n');

    const emailConfig = {
      enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || 587,
      recipientEmails: process.env.ALERT_RECIPIENT || process.env.SMTP_USER,
      senderName: 'Hệ thống Cảnh báo Đấu thầu'
    };

    if (emailConfig.enabled) {
      await sendEmailNotification(emailSubject, emailBody, emailConfig);
    } else {
      console.log('ℹ️ [AutoScraper] Bỏ qua gửi email do chưa cấu hình SMTP_USER/PASS.');
    }
  } else {
    console.log('ℹ️ [AutoScraper] Không tìm thấy gói thầu mới nào.');
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 VIETBACCORP Server running on port ${PORT}`);
  console.log(`📂 Current directory: ${__dirname}`);

  // Initialize Google Drive
  try {
    await initDriveClient();
  } catch (err) {
    console.warn('⚠️ [GoogleDrive] Khởi tạo thất bại:', err.message);
  }

  // Daily Scheduler
  let lastMorningScan = '';
  let lastAfternoonScan = '';

  const checkAndRunSchedule = () => {
    const now = new Date();
    // Lấy ngày local để tránh lệch múi giờ (UTC)
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const hour = now.getHours();

    // Quét buổi sáng (từ 8h trở đi, nếu chưa quét trong ngày)
    if (hour >= 8 && lastMorningScan !== today) {
      console.log(`🕒 Running Morning Scan (Triggered at ${hour}:${String(now.getMinutes()).padStart(2, '0')})`);
      runAutoBiddingScan();
      runExpirationScan();
      lastMorningScan = today;
    }

    // Quét buổi chiều (từ 14h trở đi, nếu chưa quét trong ngày)
    if (hour >= 14 && lastAfternoonScan !== today) {
      console.log(`🕒 Running Afternoon Scan (Triggered at ${hour}:${String(now.getMinutes()).padStart(2, '0')})`);
      runAutoBiddingScan();
      lastAfternoonScan = today;
    }
  };

  // Kiểm tra ngay sau khi khởi động 15 giây
  setTimeout(checkAndRunSchedule, 15000);

  // Sau đó lặp kiểm tra mỗi 15 phút
  setInterval(checkAndRunSchedule, 1000 * 60 * 15);
});

