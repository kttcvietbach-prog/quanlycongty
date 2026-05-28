/**
 * One-time script to get Google Drive OAuth2 refresh token
 * Run: node get-drive-token.mjs
 */
import fs from 'fs';
import http from 'http';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OAUTH_CRED_PATH = join(__dirname, 'oauth-credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const REDIRECT_PORT = 3456;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;

async function main() {
  if (!fs.existsSync(OAUTH_CRED_PATH)) {
    console.error('❌ File oauth-credentials.json không tìm thấy!');
    console.error('   Tải từ Google Cloud Console → Credentials → OAuth Client');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(OAUTH_CRED_PATH, 'utf8'));
  const creds = raw.installed || raw.web;
  if (!creds) {
    console.error('❌ File credentials không đúng định dạng!');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });

  console.log('');
  console.log('🔐 Mở link này trong trình duyệt để đăng nhập:');
  console.log('');
  console.log(authUrl);
  console.log('');
  console.log('⏳ Đang chờ bạn đăng nhập...');

  // Auto-open browser on Windows
  const { exec } = await import('child_process');
  exec(`start "" "${authUrl}"`);

  // Start local server to receive the auth code
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>❌ Không nhận được mã xác thực</h2>');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      // Save tokens
      const envPath = join(__dirname, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      // Remove old Drive token entries
      envContent = envContent
        .replace(/\nGOOGLE_DRIVE_CLIENT_ID=.*/g, '')
        .replace(/\nGOOGLE_DRIVE_CLIENT_SECRET=.*/g, '')
        .replace(/\nGOOGLE_DRIVE_REFRESH_TOKEN=.*/g, '')
        .trim();

      envContent += `\n\n# Google Drive OAuth2\nGOOGLE_DRIVE_CLIENT_ID=${creds.client_id}\nGOOGLE_DRIVE_CLIENT_SECRET=${creds.client_secret}\nGOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`;

      fs.writeFileSync(envPath, envContent, 'utf8');

      console.log('');
      console.log('✅ Thành công! Token đã được lưu vào file .env');
      console.log('');
      console.log('📝 Đã thêm vào .env:');
      console.log(`   GOOGLE_DRIVE_CLIENT_ID=${creds.client_id}`);
      console.log(`   GOOGLE_DRIVE_CLIENT_SECRET=${creds.client_secret.substring(0, 8)}...`);
      console.log(`   GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token.substring(0, 20)}...`);
      console.log('');
      console.log('🚀 Giờ bạn có thể chạy: npm start');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family:Inter,sans-serif;max-width:500px;margin:80px auto;text-align:center;padding:40px;background:#f0fdf4;border-radius:16px;border:2px solid #86efac">
          <h1 style="color:#16a34a">✅ Kết nối Google Drive thành công!</h1>
          <p style="color:#4b5563;font-size:16px">Token đã được lưu vào file <code>.env</code></p>
          <p style="color:#6b7280;font-size:14px">Bạn có thể đóng tab này và chạy <code>npm start</code></p>
        </div>
      `);

      setTimeout(() => { server.close(); process.exit(0); }, 2000);
    } catch (err) {
      console.error('❌ Lỗi lấy token:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>❌ Lỗi: ${err.message}</h2>`);
      setTimeout(() => process.exit(1), 1000);
    }
  });

  server.listen(REDIRECT_PORT, () => {
    console.log(`🌐 Server đang lắng nghe tại http://localhost:${REDIRECT_PORT}`);
  });
}

main();
