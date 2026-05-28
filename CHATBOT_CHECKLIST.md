# ✅ Chatbot v2.0 - Quick Start Checklist

## 📋 Pre-Launch Checklist

### System Requirements
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] Port 3001 is free
- [ ] 200MB free disk space

### Get API Access
- [ ] Go to https://console.anthropic.com
- [ ] Create account / Login
- [ ] Create API Key
- [ ] Copy API Key (starts with `sk-ant-`)
- [ ] Keep it safe (don't share!)

### Setup Project Files
- [ ] Navigate to project directory
- [ ] Open `features/chatbot/.env.example`
- [ ] Create `.env` file
- [ ] Paste: `ANTHROPIC_API_KEY=sk-ant-YOUR_KEY`
- [ ] Save file

### Install Dependencies
- [ ] Open terminal
- [ ] Run: `npm install express cors @anthropic-ai/sdk`
- [ ] Wait for completion
- [ ] Check: no error messages

## 🚀 Launch Checklist

### Start Backend Service
**Windows:**
- [ ] Open `features/chatbot/start-chatbot-service.bat`
- [ ] Wait for "✅ Chatbot Service running"
- [ ] Keep terminal open

**Linux/Mac:**
```bash
bash features/chatbot/start-chatbot-service.sh
```
- [ ] Wait for startup message
- [ ] Keep terminal open

### Verify Backend
- [ ] See "✅ Chatbot Service running on port 3001"
- [ ] See "🤖 Model: Claude 3.5 Sonnet"
- [ ] No error messages in terminal

### Test Connection
In another terminal:
```bash
curl http://localhost:3001/api/chat/status
```
- [ ] Should return JSON with `"status": "online"`

## 📱 Frontend Integration

### Option A: Quick Integration
Add to your HTML:
```html
<script type="module">
  import { initChatbot } from './features/chatbot/chatbot-advanced.js';
  initChatbot();
</script>
```
- [ ] Added to index.html
- [ ] Before closing `</body>` tag

### Option B: App.js Integration
In your app.js:
```javascript
import { chatbotIntegration } from './features/chatbot/integration.js';

window.addEventListener('DOMContentLoaded', async () => {
  await chatbotIntegration.initialize();
});
```
- [ ] Added to app.js
- [ ] Imported correctly

### Option C: With Data Context (Best)
```javascript
import { chatbotIntegration, setupChatbotContext } from './features/chatbot/integration.js';

window.addEventListener('DOMContentLoaded', async () => {
  await chatbotIntegration.initialize();
  setupChatbotContext();
});
```
- [ ] Imported
- [ ] Both functions called

## 🎨 Visual Verification

### Check UI Element
- [ ] Open app in browser
- [ ] Look at bottom-right corner
- [ ] See 🤖 button (blue circle with chat icon)
- [ ] No errors in browser console (F12)

### Test Interaction
- [ ] Click chatbot button
- [ ] See chatbot window open
- [ ] See "Trợ lý ERP" header
- [ ] See quick suggestions
- [ ] See input field with placeholder

### Send Test Message
- [ ] Click input field
- [ ] Type: "Xin chào"
- [ ] Press Enter or click Send
- [ ] See your message appear
- [ ] See typing indicator
- [ ] See AI response appear

## 🔧 Troubleshooting Checklist

### Chatbot doesn't appear
- [ ] Backend service running? (check terminal)
- [ ] No console errors? (open F12 > Console)
- [ ] Correct import path?
- [ ] JavaScript enabled in browser?

### Backend won't start
- [ ] API key set in .env?
- [ ] File permissions correct?
- [ ] Port 3001 free? (`netstat -ano | findstr :3001`)
- [ ] Node.js installed? (`node --version`)

### No response from chatbot
- [ ] Backend running?
- [ ] API key valid?
- [ ] Check network tab (F12 > Network)
- [ ] Any error messages in console?

### Port already in use
```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process
lsof -i :3001
kill -9 <PID>

# Or use different port
CHATBOT_PORT=3002 node chatbot-service.js
```
- [ ] Process killed
- [ ] Try port 3002 if needed

## 📊 Feature Testing

### Basic Features
- [ ] Send message: ✅
- [ ] Receive response: ✅
- [ ] Typing animation: ✅
- [ ] Message history: ✅
- [ ] Input history (arrow keys): ✅

### Advanced Features
- [ ] Quick suggestions work: ✅
- [ ] Clear history button: ✅
- [ ] Settings button: ✅
- [ ] Close button: ✅
- [ ] Toggle button: ✅

### Data Integration
- [ ] ERP context loaded: ✅
- [ ] User info correct: ✅
- [ ] Module data showing: ✅

## 📈 Performance Check

### Metrics
- [ ] First response < 5 seconds
- [ ] Subsequent responses < 2 seconds
- [ ] No memory leaks (check Task Manager)
- [ ] Smooth animations

### Browser Console
- [ ] No red error messages
- [ ] No warnings
- [ ] "✅ Chatbot initialized" message

## 🎯 Deployment Checklist

### Pre-Production
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] API key secure (environment variable)
- [ ] CORS configured
- [ ] Logging enabled

### Production Setup
- [ ] Use PM2 or systemd
- [ ] Setup auto-restart
- [ ] Configure monitoring
- [ ] Setup backups
- [ ] Test failover

## 📚 Documentation Review

- [ ] Read [README.md](features/chatbot/README.md)
- [ ] Review [INSTALLATION_GUIDE.md](features/chatbot/INSTALLATION_GUIDE.md)
- [ ] Check [integration.js](features/chatbot/integration.js) examples
- [ ] Understand [STRUCTURE.md](features/chatbot/STRUCTURE.md)

## ✨ Customization (Optional)

### UI Customization
- [ ] Reviewed CSS variables in chatbot-advanced.js
- [ ] Customized colors if needed
- [ ] Adjusted position if needed
- [ ] Responsive design tested on mobile

### API Customization
- [ ] Adjusted MAX_TOKENS if needed
- [ ] Modified system prompt if needed
- [ ] Updated CONVERSATION_TIMEOUT if needed
- [ ] Configured MAX_HISTORY if needed

## 🚀 Going Live

### Final Checks
- [ ] All checklist items completed
- [ ] No blocking issues
- [ ] Performance acceptable
- [ ] Team trained on usage
- [ ] Support contact shared

### Launch
- [ ] Deploy to production
- [ ] Monitor logs
- [ ] Collect user feedback
- [ ] Be ready to support

## 📞 Post-Launch

### First Week
- [ ] Monitor server performance
- [ ] Watch error logs
- [ ] Collect user feedback
- [ ] Fix any issues found

### Ongoing
- [ ] Regular backups
- [ ] Security updates
- [ ] Monitor conversations
- [ ] Improve based on feedback

## 🎉 Completion

### All Done? 🎊
- [ ] System running
- [ ] Users happy
- [ ] Everything working
- [ ] Ready for scaling

**Celebrate! 🎉 Your Chatbot is Live! 🚀**

---

## 📝 Notes

Use this space to track your progress:

```
Date: _________________
Status: _________________
Issues: _________________
Next Steps: _________________
```

---

## 📞 Support

Still have questions?
1. Check [INSTALLATION_GUIDE.md](features/chatbot/INSTALLATION_GUIDE.md)
2. Review [README.md](features/chatbot/README.md)
3. Check browser console (F12)
4. Check terminal logs
5. Contact support

**Need Help? 📧 support@vietbacherp.com**

---

**Version**: 2.0  
**Last Updated**: April 29, 2024  
**Status**: ✅ Ready for Deployment
