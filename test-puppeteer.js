import puppeteer from 'puppeteer';

(async () => {
    console.log("🚀 Đang kiểm tra khởi động trình duyệt Puppeteer...");
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://www.google.com');
        const title = await page.title();
        console.log("✅ Puppeteer khởi động thành công!");
        console.log("🌐 Tiêu đề trang thử nghiệm:", title);
        await browser.close();
        console.log("\n=> Kết luận: Hệ thống của bạn hỗ trợ tốt Puppeteer. Lỗi 500 có thể do dauthau.asia chặn bot.");
    } catch (err) {
        console.error("\n❌ Lỗi khởi động Puppeteer:");
        console.error(err.message);
        console.log("\n=> Gợi ý: Có thể bạn chưa cài đặt Chromium hoặc thiếu thư viện hệ thống (Visual C++ Redistributable trên Windows).");
    }
})();
