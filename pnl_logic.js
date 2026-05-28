(function () {
    // ==========================================
    // MODULE: Kết Quả Kinh Doanh (Income Statement / P&L) - ĐA NĂM
    // ==========================================
    const PNL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    let pnlSelectedYear = 2025;

    function getDefaultPNLData() {
        return [
            { id: '01', name: '1. Doanh thu bán hàng và cung cấp dịch vụ', value: 0, prevValue: 0, type: 'plus' },
            { id: '02', name: '2. Các khoản giảm trừ doanh thu', value: 0, prevValue: 0, type: 'minus' },
            { id: '10', name: '3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10 = 01 - 02)', value: 0, prevValue: 0, isTotal: true },
            { id: '11', name: '4. Giá vốn hàng bán', value: 0, prevValue: 0, type: 'minus' },
            { id: '20', name: '5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20 = 10 - 11)', value: 0, prevValue: 0, isTotal: true },
            { id: '21', name: '6. Doanh thu hoạt động tài chính', value: 0, prevValue: 0, type: 'plus' },
            { id: '22', name: '7. Chi phí tài chính', value: 0, prevValue: 0, type: 'minus' },
            { id: '23', name: ' - Trong đó: Chi phí lãi vay', value: 0, prevValue: 0, parentId: '22', type: 'info' },
            { id: '25', name: '8. Chi phí bán hàng', value: 0, prevValue: 0, type: 'minus' },
            { id: '26', name: '9. Chi phí quản lý doanh nghiệp', value: 0, prevValue: 0, type: 'minus' },
            { id: '30', name: '10. Lợi nhuận thuần từ hoạt động kinh doanh {30 = 20 + (21 - 22) - (25 + 26)}', value: 0, prevValue: 0, isTotal: true },
            { id: '31', name: '11. Thu nhập khác', value: 0, prevValue: 0, type: 'plus' },
            { id: '32', name: '12. Chi phí khác', value: 0, prevValue: 0, type: 'minus' },
            { id: '40', name: '13. Lợi nhuận khác (40 = 31 - 32)', value: 0, prevValue: 0, isTotal: true },
            { id: '50', name: '14. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)', value: 0, prevValue: 0, isTotal: true },
            { id: '51', name: '15. Chi phí thuế TNDN hiện hành', value: 0, prevValue: 0, type: 'minus' },
            { id: '52', name: '16. Chi phí thuế TNDN hoãn lại', value: 0, prevValue: 0, type: 'minus' },
            { id: '60', name: '17. Lợi nhuận sau thuế thu nhập doanh nghiệp (60 = 50 - 51 - 52)', value: 0, prevValue: 0, isTotal: true },
            { id: '70', name: '18. Lãi cơ bản trên cổ phiếu', value: 0, prevValue: 0, type: 'info' },
            { id: '71', name: '19. Lãi suy giảm trên cổ phiếu', value: 0, prevValue: 0, type: 'info' }
        ];
    }

    // Dữ liệu mẫu Việt Bách năm 2025
    const defaultData2025 = [
        { id: '01', name: '1. Doanh thu bán hàng và cung cấp dịch vụ', value: 64591968074, prevValue: 82882848021, type: 'plus' },
        { id: '02', name: '2. Các khoản giảm trừ doanh thu', value: 0, prevValue: 0, type: 'minus' },
        { id: '10', name: '3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10 = 01 - 02)', value: 64591968074, prevValue: 82882848021, isTotal: true },
        { id: '11', name: '4. Giá vốn hàng bán', value: 60245677215, prevValue: 77754191143, type: 'minus' },
        { id: '20', name: '5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20 = 10 - 11)', value: 4346290859, prevValue: 5128656878, isTotal: true },
        { id: '21', name: '6. Doanh thu hoạt động tài chính', value: 28718593, prevValue: 577858, type: 'plus' },
        { id: '22', name: '7. Chi phí tài chính', value: 157586165, prevValue: 110004585, type: 'minus' },
        { id: '23', name: ' - Trong đó: Chi phí lãi vay', value: 157586165, prevValue: 110004585, parentId: '22', type: 'info' },
        { id: '25', name: '8. Chi phí bán hàng', value: 0, prevValue: 0, type: 'minus' },
        { id: '26', name: '9. Chi phí quản lý doanh nghiệp', value: 4171512071, prevValue: 4702378940, type: 'minus' },
        { id: '30', name: '10. Lợi nhuận thuần từ hoạt động kinh doanh {30 = 20 + (21 - 22) - (25 + 26)}', value: 45911216, prevValue: 316851211, isTotal: true },
        { id: '31', name: '11. Thu nhập khác', value: 0, prevValue: 40909091, type: 'plus' },
        { id: '32', name: '12. Chi phí khác', value: 10007008, prevValue: 319010307, type: 'minus' },
        { id: '40', name: '13. Lợi nhuận khác (40 = 31 - 32)', value: -10007008, prevValue: -278101216, isTotal: true },
        { id: '50', name: '14. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)', value: 35904208, prevValue: 38749995, isTotal: true },
        { id: '51', name: '15. Chi phí thuế TNDN hiện hành', value: 7180842, prevValue: 7749999, type: 'minus' },
        { id: '52', name: '16. Chi phí thuế TNDN hoãn lại', value: 0, prevValue: 0, type: 'minus' },
        { id: '60', name: '17. Lợi nhuận sau thuế thu nhập doanh nghiệp (60 = 50 - 51 - 52)', value: 28723366, prevValue: 30999996, isTotal: true },
        { id: '70', name: '18. Lãi cơ bản trên cổ phiếu', value: 0, prevValue: 0, type: 'info' },
        { id: '71', name: '19. Lãi suy giảm trên cổ phiếu', value: 0, prevValue: 0, type: 'info' }
    ];

    function loadPNLData(year) {
        try {
            // Priority 1: Check synced collection array
            const rawData = localStorage.getItem('erp_pnl_data');
            if (rawData) {
                const parsed = JSON.parse(rawData);
                if (Array.isArray(parsed)) {
                    // It's a collection
                    const yearEntry = parsed.find(d => d.id === year.toString());
                    if (yearEntry && yearEntry.items) {return yearEntry.items;}
                } else if (year === 2025 && Array.isArray(parsed)) {
                    // It's a legacy 2025 array
                    return parsed;
                }
            }

            // Priority 2: Check legacy yearly key
            const saved = localStorage.getItem('erp_pnl_data_' + year);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {return parsed;}
            }

            // Priority 3: Fallback for 2025
            if (year === 2025) {
                return JSON.parse(JSON.stringify(defaultData2025));
            }
        } catch (e) {
            console.error('Error loading PNL data:', e);
        }
        return getDefaultPNLData();
    }

    function savePNLData(year, data) {
        // Legacy local storage
        localStorage.setItem('erp_pnl_data_' + year, JSON.stringify(data));
        
        // Firebase Sync
        if (window.CrudSync) {
            const syncData = {
                id: year.toString(),
                items: data, // Array of P&L lines
                updatedAt: new Date().toISOString()
            };
            window.CrudSync.saveItem('erp_pnl_data', syncData, 'id');
        }
    }

    function renderPNL() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {return;}

        const pnlData = loadPNLData(pnlSelectedYear);
        const prevYearData = loadPNLData(pnlSelectedYear - 1); // Tải dữ liệu năm trước
        const f = window.erpApp.formatValue;

        const yearTabs = PNL_YEARS.map(y => `
            <button onclick="window.erpApp.pnlSelectYear(${y})" style="padding:10px 20px; border-radius:12px; font-weight:800; font-size:13px; cursor:pointer; transition:all 0.2s; border:1.5px solid ${y === pnlSelectedYear ? '#2563eb' : '#e2e8f0'}; background:${y === pnlSelectedYear ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#fff'}; color:${y === pnlSelectedYear ? '#fff' : '#64748b'}; box-shadow:${y === pnlSelectedYear ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'};">${y}</button>
        `).join('');

        pageContent.innerHTML = `
            <div class="pnl-module" style="animation: fadeIn 0.4s ease-out; background:#fff; padding:40px; font-family: 'Times New Roman', serif;">
                <div class="pnl-print-container" style="max-width:1000px; margin:0 auto; color:#000;">
                    
                    <!-- Toolbar điều khiển -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; font-family:'Inter',sans-serif;" class="no-print">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="background:#f1f5f9; border:none; padding:8px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:700; color:#475569;">
                                <span class="material-icons-outlined">arrow_back</span> Quay lại
                            </button>
                            <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; font-family:'Inter',sans-serif;">Kết Quả Kinh Doanh</h2>
                        </div>
                        <button onclick="window.print()" style="padding:10px 20px; background:#1e293b; color:#fff; border:none; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; font-family:'Inter',sans-serif;">
                            <span class="material-icons-outlined">print</span> Xuất PDF
                        </button>
                    </div>

                    <!-- Chọn năm báo cáo -->
                    <div class="no-print" style="display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; font-family:'Inter',sans-serif; padding:16px 20px; background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0;">
                        <div style="display:flex; align-items:center; gap:8px; margin-right:8px;">
                            <span class="material-icons-outlined" style="color:#2563eb; font-size:20px;">calendar_month</span>
                            <span style="font-size:13px; font-weight:800; color:#475569;">Kỳ báo cáo:</span>
                        </div>
                        ${yearTabs}
                    </div>

                    <!-- Header chuẩn B02-DN -->
                    <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
                        <div style="text-align:center; flex:1;">
                            <h2 style="margin:4px 0; font-size:18px; text-transform:uppercase; font-weight:bold;">BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH</h2>
                            <p style="margin:10px 0; font-weight:bold; font-size:14px;">Năm tài chính ${pnlSelectedYear}</p>
                        </div>
                        <div style="width:200px; padding:10px; border:1px solid #000; text-align:center; font-size:12px; line-height:1.4;">
                            <strong>Mẫu số: B 02 – DN</strong><br>
                            <span style="font-style:italic;">(Ban hành theo Thông tư số 200/2014/TT-BTC Ngày 22/12/2014 của Bộ Tài chính)</span>
                        </div>
                    </div>

                    <div style="margin-bottom:30px; font-size:14px;">
                        <p style="margin:4px 0;"><strong>Tên đơn vị báo cáo:</strong> Công ty Cổ Phần Tư Vấn Đầu Tư Và Xây Dựng Việt Bách</p>
                        <p style="margin:4px 0;"><strong>Mã số thuế:</strong> 0303204517</p>
                    </div>

                    <!-- Bảng dữ liệu -->
                    <table style="width:100%; border-collapse:collapse; border:1px solid #000; font-size:13px;">
                        <thead>
                            <tr style="text-align:center; font-weight:bold; background:#f2f2f2;">
                                <th style="border:1px solid #000; padding:10px;">CHỈ TIÊU</th>
                                <th style="border:1px solid #000; padding:10px; width:60px;">Mã số</th>
                                <th style="border:1px solid #000; padding:10px; width:80px;">Thuyết minh</th>
                                <th style="border:1px solid #000; padding:10px; width:180px;">Năm nay</th>
                                <th style="border:1px solid #000; padding:10px; width:180px;">Năm trước</th>
                            </tr>
                            <tr style="text-align:center; font-style:italic; background:#f9f9f9;">
                                <td style="border:1px solid #000; padding:4px;">1</td>
                                <td style="border:1px solid #000; padding:4px;">2</td>
                                <td style="border:1px solid #000; padding:4px;">3</td>
                                <td style="border:1px solid #000; padding:4px;">4</td>
                                <td style="border:1px solid #000; padding:4px;">5</td>
                            </tr>
                        </thead>
                        <tbody>
                            ${pnlData.map(item => {
                                const isTotal = item.isTotal;
                                const isSub = item.parentId;
                                const weight = isTotal ? 'bold' : 'normal';
                                const paddingLeft = isSub ? '30px' : '10px';
                                
                                // Tìm giá trị năm trước
                                const prevItem = prevYearData.find(p => p.id === item.id);
                                const prevValue = prevItem ? prevItem.value : 0;

                                return `
                                    <tr onclick="window.erpApp.openEditPNLModal('${item.id}')" style="cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='transparent'">
                                        <td style="border:1px solid #000; padding:10px ${paddingLeft}; font-weight:${weight};">${item.name}</td>
                                        <td style="border:1px solid #000; padding:10px; text-align:center; font-weight:${weight};">${item.id}</td>
                                        <td style="border:1px solid #000; padding:10px;"></td>
                                        <td style="border:1px solid #000; padding:10px; text-align:right; font-weight:${weight};">${item.value !== 0 ? f(item.value) : '0'}</td>
                                        <td style="border:1px solid #000; padding:10px; text-align:right; font-weight:${weight};">${prevValue !== 0 ? f(prevValue) : '0'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    }

    function openEditPNLModal(id) {
        const pnlData = loadPNLData(pnlSelectedYear);
        const item = pnlData.find(i => i.id === id);
        if (!item) {return;}

        const modalHtml = `
            <div id="pnlEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hiệu chỉnh Chỉ tiêu</h2>
                        <button onclick="document.getElementById('pnlEditModal').remove()" style="background:#f1f5f9; border:none; cursor:pointer; color:#94a3b8; width:36px; height:36px; border-radius:10px;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="background:#eff6ff; padding:10px 16px; border-radius:10px; margin-bottom:16px; font-size:13px; font-weight:700; color:#2563eb; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">calendar_month</span> Năm ${pnlSelectedYear}
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Chỉ tiêu báo cáo</label>
                            <div style="font-size:14px; font-weight:700; color:#475569; background:#f8fafc; padding:12px; border-radius:12px; border:1px solid #e2e8f0;">${item.name}</div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Năm ${pnlSelectedYear} (VNĐ)</label>
                                <input type="text" id="edit_pnl_value" value="${window.erpApp.formatValue(item.value)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Năm ${pnlSelectedYear - 1} (VNĐ)</label>
                                <input type="text" id="edit_pnl_prev_value" value="${window.erpApp.formatValue(item.prevValue)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#64748b; outline:none;">
                            </div>
                        </div>
                        <button onclick="window.erpApp.savePNLValue('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                            Cập nhật và Tính toán lại
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function savePNLValue(id) {
        const valStr = document.getElementById('edit_pnl_value').value;
        const prevValStr = document.getElementById('edit_pnl_prev_value').value;
        
        const value = window.erpApp.parseVND(valStr);
        const prevValue = window.erpApp.parseVND(prevValStr);
        
        const pnlData = loadPNLData(pnlSelectedYear);
        const idx = pnlData.findIndex(i => i.id === id);
        if (idx !== -1) {
            pnlData[idx].value = value;
            pnlData[idx].prevValue = prevValue;
            
            calculatePNL(pnlData);
            savePNLData(pnlSelectedYear, pnlData);
            
            document.getElementById('pnlEditModal').remove();
            renderPNL();
            if (window.erpApp.showToast) {window.erpApp.showToast(`Đã cập nhật BCKQKD năm ${pnlSelectedYear}`);}
        }
    }

    function calculatePNL(pnlData) {
        const getVal = (id) => { const item = pnlData.find(i => i.id === id); return item ? item.value : 0; };
        const getPrev = (id) => { const item = pnlData.find(i => i.id === id); return item ? item.prevValue : 0; };

        const years = ['current', 'prev'];
        years.forEach(year => {
            const g = (id) => (year === 'current' ? getVal(id) : getPrev(id));
            const s = (id, val) => {
                const item = pnlData.find(i => i.id === id);
                if (item) {
                    if (year === 'current') {item.value = val;}
                    else {item.prevValue = val;}
                }
            };

            s('10', g('01') - g('02'));
            s('20', g('10') - g('11'));
            s('30', g('20') + g('21') - g('22') - g('25') - g('26'));
            s('40', g('31') - g('32'));
            s('50', g('30') + g('40'));
            s('60', g('50') - g('51') - g('52'));
        });
    }

    function pnlSelectYear(year) {
        pnlSelectedYear = year;
        renderPNL();
    }

    window.erpApp.getPNLData = loadPNLData;
    window.erpApp.renderPNL = renderPNL;
    window.erpApp.openEditPNLModal = openEditPNLModal;
    window.erpApp.savePNLValue = savePNLValue;
    window.erpApp.pnlSelectYear = pnlSelectYear;

})();
