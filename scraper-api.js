import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

let browser = null;

// Hàm khởi tạo browser (singleton)
async function getBrowser() {
    if (!browser || !browser.isConnected()) {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });
    }
    return browser;
}

// ==========================================
// DANH SÁCH TỈNH THÀNH (ID theo dauthau.asia)
// ==========================================
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

// Mapping tên tỉnh tiếng Việt sang key
const PROVINCE_NAME_MAP = {
    'Hà Nội': 'ha-noi', 'TP.HCM': 'ho-chi-minh', 'Hồ Chí Minh': 'ho-chi-minh',
    'Đà Nẵng': 'da-nang', 'Hải Phòng': 'hai-phong', 'Cần Thơ': 'can-tho',
    'An Giang': 'an-giang', 'Bà Rịa - Vũng Tàu': 'ba-ria-vung-tau',
    'Bắc Giang': 'bac-giang', 'Bắc Kạn': 'bac-kan', 'Bạc Liêu': 'bac-lieu',
    'Bắc Ninh': 'bac-ninh', 'Bến Tre': 'ben-tre', 'Bình Định': 'binh-dinh',
    'Bình Dương': 'binh-duong', 'Bình Phước': 'binh-phuoc', 'Bình Thuận': 'binh-thuan',
    'Cà Mau': 'ca-mau', 'Cao Bằng': 'cao-bang', 'Đắk Lắk': 'dak-lak',
    'Đắk Nông': 'dak-nong', 'Điện Biên': 'dien-bien', 'Đồng Nai': 'dong-nai',
    'Đồng Tháp': 'dong-thap', 'Gia Lai': 'gia-lai', 'Hà Giang': 'ha-giang',
    'Hà Nam': 'ha-nam', 'Hà Tĩnh': 'ha-tinh', 'Hải Dương': 'hai-duong',
    'Hậu Giang': 'hau-giang', 'Hòa Bình': 'hoa-binh', 'Hưng Yên': 'hung-yen',
    'Khánh Hòa': 'khanh-hoa', 'Kiên Giang': 'kien-giang', 'Kon Tum': 'kon-tum',
    'Lai Châu': 'lai-chau', 'Lâm Đồng': 'lam-dong', 'Lạng Sơn': 'lang-son',
    'Lào Cai': 'lao-cai', 'Long An': 'long-an', 'Nam Định': 'nam-dinh',
    'Nghệ An': 'nghe-an', 'Ninh Bình': 'ninh-binh', 'Ninh Thuận': 'ninh-thuan',
    'Phú Thọ': 'phu-tho', 'Phú Yên': 'phu-yen', 'Quảng Bình': 'quang-binh',
    'Quảng Nam': 'quang-nam', 'Quảng Ngãi': 'quang-ngai', 'Quảng Ninh': 'quang-ninh',
    'Quảng Trị': 'quang-tri', 'Sóc Trăng': 'soc-trang', 'Sơn La': 'son-la',
    'Tây Ninh': 'tay-ninh', 'Thái Bình': 'thai-binh', 'Thái Nguyên': 'thai-nguyen',
    'Thanh Hóa': 'thanh-hoa', 'Thừa Thiên Huế': 'thua-thien-hue',
    'Tiền Giang': 'tien-giang', 'Trà Vinh': 'tra-vinh', 'Tuyên Quang': 'tuyen-quang',
    'Vĩnh Long': 'vinh-long', 'Vĩnh Phúc': 'vinh-phuc', 'Yên Bái': 'yen-bai'
};

// ==========================================
// API: Lấy danh sách bộ lọc
// ==========================================
app.get('/api/filters', (req, res) => {
    res.json({
        success: true,
        filters: {
            provinces: Object.entries(PROVINCE_NAME_MAP).map(([name, key]) => ({
                id: PROVINCES[key],
                key,
                name
            })),
            sectors: [
                { id: 'hang-hoa', name: 'Hàng hóa', param: 'goods', value: 1 },
                { id: 'xay-lap', name: 'Xây lắp', param: 'construction', value: 1 },
                { id: 'tu-van', name: 'Tư vấn', param: 'consulting', value: 1 },
                { id: 'phi-tu-van', name: 'Phi tư vấn', param: 'non_consulting', value: 1 },
                { id: 'hon-hop', name: 'Hỗn hợp', param: 'mixed', value: 1 }
            ],
            biddingTypes: [
                { id: 0, name: 'Tất cả' },
                { id: 1, name: 'Đấu thầu rộng rãi' },
                { id: 2, name: 'Đấu thầu hạn chế' },
                { id: 3, name: 'Chỉ định thầu' },
                { id: 4, name: 'Chào hàng cạnh tranh' },
                { id: 5, name: 'Mua sắm trực tiếp' },
                { id: 6, name: 'Tự thực hiện' },
                { id: 7, name: 'Lựa chọn nhà thầu trong trường hợp đặc biệt' },
                { id: 8, name: 'Chào giá trực tuyến' }
            ],
            submissionTypes: [
                { id: 'all', name: 'Tất cả' },
                { id: 'online', name: 'Đấu qua mạng (Điện tử)' },
                { id: 'offline', name: 'Trực tiếp' }
            ]
        }
    });
});

// ==========================================
// API: Cào dữ liệu với bộ lọc nâng cao
// ==========================================
app.get('/api/scrape-dauthau', async (req, res) => {
    const {
        keyword = '',
        keyword2 = '',
        without_key = '',
        province = '',         // Slug tỉnh thành (ha-noi, ho-chi-minh...)
        provinceId = '',       // Hoặc truyền trực tiếp ID
        biddingType = '0',     // Hình thức lựa chọn nhà thầu
        sector = '',           // hang-hoa, xay-lap, tu-van, phi-tu-van, hon-hop
        priceFrom = '',        // Giá trị tối thiểu
        priceTo = '',          // Giá trị tối đa
        submissionType = '',   // online, offline
        infoType = 'tbmt',     // Loại thông tin (tbmt, khlcnt, kqlcnt, du-an, ...)
        page = '1'             // Số trang
    } = req.query;

    // Mapping loại thông tin → URL path trên dauthau.asia
    const INFO_TYPE_PATHS = {
        'tbmt':       '/thongbao/moithau/',
        'khlcnt':     '/kehoach/luachon-nhathau/',
        'khlcnt-tt':  '/kehoachtongthe/luachon-nhathau/',
        'du-an':      '/devprojects/',
        'kqmt':       '/open/',
        'kqlcnt':     '/ketqua/luachon-nhathau/',
        'mst':        '/moisotuyen/nhathau/',
        'mqt':        '/listprequalification/?type=12',
        'kqst':       '/ketquasotuyen/nhathau/',
        'kqmqt':      '/listresultpq/?type=13',
        'kq-mo-st':   '/listopenpq/',
        'kq-mo-qt':   '/listopenpq/?type=14',
        'ycbg':       '/request-quote/'
    };
    const basePath = INFO_TYPE_PATHS[infoType] || '/thongbao/moithau/';

    console.log(`🔍 [Scraper] Bắt đầu cào dữ liệu thầu:`);
    console.log(`   Loại: "${infoType}" | Từ khóa: "${keyword}" | Tỉnh: "${province || provinceId}" | Lĩnh vực: "${sector}" | Trang: ${page}`);
    
    let pageInstance = null;
    try {
        const browserInstance = await getBrowser();
        pageInstance = await browserInstance.newPage();
        
        await pageInstance.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
        await pageInstance.setViewport({ width: 1920, height: 1080 });

        // Xây dựng URL với bộ lọc
        const params = new URLSearchParams();
        
        if (keyword) {
            params.set('q', keyword);              // Tham số tìm kiếm chính hiện nay
            params.set('keyword', keyword);        // Fallback

            // Tự động nhận diện nếu người dùng tìm tên Chủ đầu tư/Bên mời thầu
            const kwLower = keyword.trim().toLowerCase();
            const isInvestorSearch = /^(sở|ban|ubnd|công ty|phòng|bệnh viện|trường|trung tâm|viện)/.test(kwLower);
            if (isInvestorSearch) {
                params.set('type_search', '1'); // 1 = Tìm theo Bên mời thầu / Chủ đầu tư
            } else {
                params.set('type_search', '0'); // 0 = Tìm theo Tên gói thầu
            }
        }
        if (keyword2) params.set('ls_key2', keyword2);
        if (without_key) params.set('without_key', without_key);
        
        // Tỉnh thành
        const resolvedProvinceId = provinceId || (province ? PROVINCES[province] : '');
        if (resolvedProvinceId) params.set('search_idprovince', resolvedProvinceId);
        
        // Hình thức lựa chọn nhà thầu
        if (biddingType && biddingType !== '0') params.set('cat', biddingType);
        
        // Lĩnh vực MSC
        if (sector) {
            const sectorMap = { 'hang-hoa': 'goods', 'xay-lap': 'construction', 'tu-van': 'consulting', 'phi-tu-van': 'non_consulting', 'hon-hop': 'mixed' };
            if (sectorMap[sector]) params.set(sectorMap[sector], '1');
        }
        
        // Khoảng giá trị
        if (priceFrom) params.set('tbmt_price_from', priceFrom);
        if (priceTo) params.set('tbmt_price_to', priceTo);
        
        // Hình thức dự thầu
        if (submissionType === 'online') {
            params.set('is_online', '1');
        } else if (submissionType === 'offline') {
            params.set('is_online', '0');
        }

        // Kích hoạt chế độ tìm kiếm
        params.set('searching', '1');
        if (keyword2 || without_key || sector || priceFrom || priceTo) {
            params.set('is_advance', '1');
        }
        
        // Số trang
        if (page && page !== '1') params.set('page', page);

        // Xây dựng URL cuối cùng — basePath có thể đã chứa query string (ví dụ: ?type=12)
        const separator = basePath.includes('?') ? '&' : '?';
        const queryStr = params.toString();
        const searchUrl = `https://dauthau.asia${basePath}${queryStr ? separator + queryStr : ''}`;
        console.log(`   URL: ${searchUrl}`);

        await pageInstance.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Chờ dữ liệu load
        try {
            await pageInstance.waitForSelector('table tbody tr, .table-responsive, #main-content', { timeout: 15000 });
        } catch (e) {
            console.warn("⚠️ [Scraper] Timeout chờ selector, thử bóc tách dữ liệu hiện có.");
        }

        const bids = await pageInstance.evaluate(() => {
            const results = [];
            
            // =====================================================
            // Cấu trúc bảng dauthau.asia (4 cột):
            // td:nth-child(1) = GÓI THẦU (mã + tên, link chi tiết)
            // td:nth-child(2) = CHỦ ĐẦU TƯ (mã + tên)  
            // td:nth-child(3) = NGÀY ĐĂNG TẢI
            // td:nth-child(4) = ĐÓNG THẦU
            // =====================================================
            const rows = document.querySelectorAll('table tbody tr');
            
            rows.forEach(el => {
                const cells = el.querySelectorAll('td');
                if (cells.length < 3) return;
                
                // Cột 1: Gói thầu - lấy link và tên
                const col1 = cells[0];
                const bidLink = col1 ? col1.querySelector('a') : null;
                const bidName = bidLink ? (bidLink.getAttribute('title') || bidLink.innerText.trim()) : '';
                const bidCode = col1 ? (col1.querySelector('span') ? col1.querySelector('span').innerText.trim() : '') : '';
                
                if (!bidName || bidName.length < 5) return;
                if (results.find(r => r.name === bidName)) return;
                
                // Cột 2: Chủ đầu tư
                const col2 = cells[1];
                const ownerLink = col2 ? col2.querySelector('a') : null;
                const ownerName = ownerLink ? (ownerLink.getAttribute('title') || ownerLink.innerText.trim()) : (col2 ? col2.innerText.trim().split('\n')[0] : '');
                
                // Cột 3: Ngày đăng tải
                const col3 = cells.length >= 3 ? cells[2] : null;
                const publishDate = col3 ? col3.innerText.trim() : '';
                
                // Cột 4: Đóng thầu
                const col4 = cells.length >= 4 ? cells[3] : null;
                const closingDateText = col4 ? col4.innerText.trim() : '';
                
                // Parse ngày đóng thầu (format: dd/MM/yyyy HH:mm hoặc dd/MM/yyyy)
                const dateMatch = closingDateText.match(/\d{2}\/\d{2}\/\d{4}/);
                const closingDate = dateMatch ? dateMatch[0] : closingDateText || 'Đang cập nhật';
                
                results.push({
                    id: 'BID-DAUTHASIA-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                    name: bidName,
                    project: bidName,
                    bidCode: bidCode,
                    customer: ownerName || 'Đang cập nhật',
                    value: 0, // Giá trị không hiển thị trong bảng danh sách, cần vào trang chi tiết
                    closingDate: closingDate,
                    publishDate: publishDate,
                    status: 'preparing',
                    url: bidLink ? bidLink.href : '',
                    source: 'dauthau.asia'
                });
            });

            // Fallback: Nếu không tìm thấy bảng, thử link thông báo
            if (results.length === 0) {
                document.querySelectorAll('a[href*="/thongbao/"]').forEach(el => {
                    const title = el.getAttribute('title') || el.innerText.trim();
                    if (title.length > 20 && !results.find(x => x.name === title)) {
                        results.push({
                            id: 'BID-DAUTHASIA-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                            name: title,
                            project: title,
                            customer: 'Dauthau.asia',
                            value: 0,
                            closingDate: 'Đang cập nhật',
                            status: 'preparing',
                            url: el.href,
                            source: 'dauthau.asia'
                        });
                    }
                });
            }

            // Trích xuất thông tin phân trang
            let totalPages = 1;
            const paginationLinks = document.querySelectorAll('.pagination a, .page-item a');
            paginationLinks.forEach(link => {
                const pageNum = parseInt(link.innerText.trim());
                if (pageNum && pageNum > totalPages) totalPages = pageNum;
            });

            return { results, totalPages };
        });

        await pageInstance.close();
        
        const processedBids = bids.results.slice(0, 30);
        console.log(`✅ [Scraper] Đã tìm thấy ${processedBids.length} kết quả (Trang ${page}/${bids.totalPages}).`);
        
        res.json({ 
            success: true, 
            count: processedBids.length, 
            data: processedBids,
            pagination: {
                currentPage: parseInt(page),
                totalPages: bids.totalPages
            },
            filters: { keyword, province, sector, biddingType, priceFrom, priceTo, submissionType }
        });

    } catch (err) {
        if (pageInstance) await pageInstance.close();
        console.error('❌ [Scraper] Lỗi Chi tiết:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message,
            stack: err.stack,
            hint: "Kiểm tra kết nối internet hoặc trang dauthau.asia có đang chặn bot không."
        });
    }

});

const PORT = process.env.SCRAPER_PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 VIETBACH Bidding Scraper Service v2.0
=========================================
Status: RUNNING
Port: ${PORT}
Endpoints:
  GET /api/filters                    → Lấy danh sách bộ lọc
  GET /api/scrape-dauthau             → Cào thầu mới nhất
  GET /api/scrape-dauthau?keyword=... → Tìm theo từ khóa
  
  Bộ lọc nâng cao:
  &province=ha-noi                    → Lọc theo tỉnh thành
  &sector=xay-lap                     → Lĩnh vực (hang-hoa|xay-lap|tu-van|phi-tu-van|hon-hop)
  &biddingType=1                      → Hình thức (1:Rộng rãi|3:Chỉ định|4:Chào hàng|...)
  &priceFrom=1000000000               → Giá trị tối thiểu
  &priceTo=50000000000                → Giá trị tối đa
  &submissionType=online              → Hình thức dự thầu (online|offline)
  &keyword2=...                       → Từ khóa bổ sung
  &without_key=...                    → Loại trừ từ khóa
  &page=2                             → Phân trang
=========================================
    `);
});
