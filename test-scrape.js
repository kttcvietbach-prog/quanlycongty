import axios from 'axios';
import * as cheerio from 'cheerio';

axios.get('https://dauthau.asia/thongbao/moithau/').then(r => {
    const $ = cheerio.load(r.data);
    
    // In ra text của toàn bộ nội dung body để xem có data thầu không
    const rows = [];
    $('div, td').each((i, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text.includes('Bên mời thầu:') || text.includes('Chủ đầu tư:')) {
            rows.push(text.substring(0, 150));
        }
    });
    console.log("Tìm thấy", rows.length, "thông báo thầu tiềm năng.");
    console.log(rows.slice(0, 5));
}).catch(err => console.error(err));
