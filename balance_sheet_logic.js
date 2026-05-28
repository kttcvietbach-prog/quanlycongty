(function () {
    // ==========================================
    // MODULE: BẢNG CÂN ĐỐI KÊ TOÁN - ĐA NĂM
    // ==========================================
    const BS_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    let bsSelectedYear = 2025;

    function getDefaultBSData() {
        return {
            assets: [
                { id: '100', name: 'A. TÀI SẢN NGẮN HẠN', value: 0, startValue: 0, isHeader: true },
                { id: '110', name: 'I. Tiền và các khoản tương đương tiền', value: 0, startValue: 0, parentId: '100' },
                { id: '130', name: 'III. Các khoản phải thu ngắn hạn', value: 0, startValue: 0, parentId: '100' },
                { id: '131', name: '1. Phải thu ngắn hạn của khách hàng', value: 0, startValue: 0, parentId: '130' },
                { id: '132', name: '2. Trả trước cho người bán ngắn hạn', value: 0, startValue: 0, parentId: '130' },
                { id: '136', name: '6. Phải thu ngắn hạn khác', value: 0, startValue: 0, parentId: '130' },
                { id: '140', name: 'IV. Hàng tồn kho', value: 0, startValue: 0, parentId: '100' },
                { id: '150', name: 'V. Tài sản ngắn hạn khác', value: 0, startValue: 0, parentId: '100' },
                { id: '200', name: 'B. TÀI SẢN DÀI HẠN', value: 0, startValue: 0, isHeader: true },
                { id: '220', name: 'II. Tài sản cố định', value: 0, startValue: 0, parentId: '200' },
                { id: '221', name: '1. Tài sản cố định hữu hình', value: 0, startValue: 0, parentId: '220' },
                { id: '222', name: '- Nguyên giá', value: 0, startValue: 0, parentId: '221' },
                { id: '223', name: '- Giá trị hao mòn lũy kế (*)', value: 0, startValue: 0, parentId: '221' },
                { id: '227', name: '3. Tài sản cố định vô hình', value: 0, startValue: 0, parentId: '220' },
                { id: '260', name: 'V. Tài sản dài hạn khác', value: 0, startValue: 0, parentId: '200' }
            ],
            liabilities: [
                { id: '300', name: 'C. NỢ PHẢI TRẢ', value: 0, startValue: 0, isHeader: true },
                { id: '310', name: 'I. Nợ ngắn hạn', value: 0, startValue: 0, parentId: '300' },
                { id: '311', name: '1. Phải trả người bán ngắn hạn', value: 0, startValue: 0, parentId: '310' },
                { id: '312', name: '2. Người mua trả tiền trước ngắn hạn', value: 0, startValue: 0, parentId: '310' },
                { id: '313', name: '3. Thuế và các khoản phải nộp Nhà nước', value: 0, startValue: 0, parentId: '310' },
                { id: '320', name: '10. Vay và nợ thuê tài chính ngắn hạn', value: 0, startValue: 0, parentId: '310' }
            ],
            equity: [
                { id: '400', name: 'D. VỐN CHỦ SỞ HỮU', value: 0, startValue: 0, isHeader: true },
                { id: '410', name: 'I. Vốn chủ sở hữu', value: 0, startValue: 0, parentId: '400' },
                { id: '411', name: '1. Vốn góp của chủ sở hữu', value: 0, startValue: 0, parentId: '410' },
                { id: '421', name: '11. Lợi nhuận sau thuế chưa phân phối', value: 0, startValue: 0, parentId: '410' },
                { id: '421a', name: '- LNST chưa phân phối lũy kế đến cuối kỳ trước', value: 0, startValue: 0, parentId: '421' },
                { id: '421b', name: '- LNST chưa phân phối kỳ này', value: 0, startValue: 0, parentId: '421' }
            ]
        };
    }

    const defaultBS2025 = {
        assets: [
            { id: '100', name: 'A. TÀI SẢN NGẮN HẠN', value: 38256886612, startValue: 26122701187, isHeader: true },
            { id: '110', name: 'I. Tiền và các khoản tương đương tiền', value: 6324035806, startValue: 9632937001, parentId: '100' },
            { id: '130', name: 'III. Các khoản phải thu ngắn hạn', value: 30256022394, startValue: 9920035476, parentId: '100' },
            { id: '131', name: '1. Phải thu ngắn hạn của khách hàng', value: 1845998294, startValue: 1741706555, parentId: '130' },
            { id: '132', name: '2. Trả trước cho người bán ngắn hạn', value: 8109326197, startValue: 1231184021, parentId: '130' },
            { id: '136', name: '6. Phải thu ngắn hạn khác', value: 20300697903, startValue: 6947144900, parentId: '130' },
            { id: '140', name: 'IV. Hàng tồn kho', value: 1676828412, startValue: 6195611456, parentId: '100' },
            { id: '150', name: 'V. Tài sản ngắn hạn khác', value: 0, startValue: 374117254, parentId: '100' },
            { id: '200', name: 'B. TÀI SẢN DÀI HẠN', value: 11419827279, startValue: 14280162172, isHeader: true },
            { id: '220', name: 'II. Tài sản cố định', value: 11415736386, startValue: 14248752960, parentId: '200' },
            { id: '221', name: '1. Tài sản cố định hữu hình', value: 10715736386, startValue: 13473752960, parentId: '220' },
            { id: '222', name: '- Nguyên giá', value: 29143847019, startValue: 29143847019, parentId: '221' },
            { id: '223', name: '- Giá trị hao mòn lũy kế (*)', value: -18428110633, startValue: -15670094059, parentId: '221' },
            { id: '227', name: '3. Tài sản cố định vô hình', value: 700000000, startValue: 775000000, parentId: '220' },
            { id: '260', name: 'V. Tài sản dài hạn khác', value: 4090893, startValue: 31409212, parentId: '200' }
        ],
        liabilities: [
            { id: '300', name: 'C. NỢ PHẢI TRẢ', value: 30371568156, startValue: 21126440990, isHeader: true },
            { id: '310', name: 'I. Nợ ngắn hạn', value: 30371568156, startValue: 21126440990, parentId: '300' },
            { id: '311', name: '1. Phải trả người bán ngắn hạn', value: 12265067640, startValue: 2432152108, parentId: '310' },
            { id: '312', name: '2. Người mua trả tiền trước ngắn hạn', value: 17833561650, startValue: 18488728497, parentId: '310' },
            { id: '313', name: '3. Thuế và các khoản phải nộp Nhà nước', value: 132938866, startValue: 315560385, parentId: '310' },
            { id: '320', name: '10. Vay và nợ thuê tài chính ngắn hạn', value: 140000000, startValue: 1890000000, parentId: '310' }
        ],
        equity: [
            { id: '400', name: 'D. VỐN CHỦ SỞ HỮU', value: 19305145735, startValue: 19276422369, isHeader: true },
            { id: '410', name: 'I. Vốn chủ sở hữu', value: 19305145735, startValue: 19276422369, parentId: '400' },
            { id: '411', name: '1. Vốn góp của chủ sở hữu', value: 20000000000, startValue: 20000000000, parentId: '410' },
            { id: '421', name: '11. Lợi nhuận sau thuế chưa phân phối', value: -694854265, startValue: -723577631, parentId: '410' },
            { id: '421a', name: '- LNST chưa phân phối lũy kế đến cuối kỳ trước', value: -723577631, startValue: -754577627, parentId: '421' },
            { id: '421b', name: '- LNST chưa phân phối kỳ này', value: 28723366, startValue: 30999996, parentId: '421' }
        ]
    };

    function loadBSData(year) {
        try {
            // Priority 1: Check synced collection array
            const rawData = localStorage.getItem('erp_balance_sheet');
            if (rawData) {
                const parsed = JSON.parse(rawData);
                if (Array.isArray(parsed)) {
                    // It's a collection
                    const yearData = parsed.find(d => d.id === year.toString());
                    if (yearData && yearData.assets) {return yearData;}
                } else if (year === 2025 && parsed.assets) {
                    // It's a legacy 2025 object
                    return parsed;
                }
            }

            // Priority 2: Check legacy yearly key
            const saved = localStorage.getItem('erp_balance_sheet_' + year);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.assets) {return parsed;}
            }

            // Priority 3: Fallback to default for 2025
            if (year === 2025) {
                return JSON.parse(JSON.stringify(defaultBS2025));
            }
        } catch (e) {
            console.error('Error loading BS data:', e);
        }
        return getDefaultBSData();
    }

    function saveBSData(year, data) {
        // Save to legacy key for compatibility
        localStorage.setItem('erp_balance_sheet_' + year, JSON.stringify(data));
        
        // Save to synced collection
        if (window.CrudSync) {
            const syncData = { 
                id: year.toString(), 
                ...data,
                updatedAt: new Date().toISOString()
            };
            window.CrudSync.saveItem('erp_balance_sheet', syncData, 'id');
        }
    }

    function renderBalanceSheet() {
        console.log('ERP Debug: Attempting to render Balance Sheet for year:', bsSelectedYear);
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('ERP Error: pageContent element not found!');
            return;
        }

        const bsData = loadBSData(bsSelectedYear);
        if (!bsData || !bsData.assets) {
            console.error('ERP Error: Failed to load BS data for', bsSelectedYear);
            pageContent.innerHTML = `<div class="error-state">Không thể tải dữ liệu bảng cân đối năm ${bsSelectedYear}</div>`;
            return;
        }
        const prevYearData = loadBSData(bsSelectedYear - 1); // Tải dữ liệu năm trước
        const f = window.erpApp.formatValue;
        
        // Tính tổng cộng cho năm hiện tại
        const totalAssets = bsData.assets.filter(a => a.isHeader).reduce((sum, a) => sum + a.value, 0);
        const totalLiabEq = bsData.liabilities.filter(l => l.isHeader).reduce((sum, l) => sum + l.value, 0) +
                            bsData.equity.filter(e => e.isHeader).reduce((sum, e) => sum + e.value, 0);
        
        // Tính tổng cộng cho năm trước (Số đầu năm)
        const getPrevVal = (section, id) => {
            const item = prevYearData[section].find(i => i.id === id);
            return item ? item.value : 0;
        };

        const totalAssetsStart = prevYearData.assets.filter(a => a.isHeader).reduce((s, a) => s + a.value, 0);
        const totalLiabEqStart = prevYearData.liabilities.filter(l => l.isHeader).reduce((s, l) => s + l.value, 0) +
                                 prevYearData.equity.filter(e => e.isHeader).reduce((s, e) => s + e.value, 0);

        const yearTabs = BS_YEARS.map(y => `
            <button onclick="window.erpApp.bsSelectYear(${y})" style="padding:10px 20px; border-radius:12px; font-weight:800; font-size:13px; cursor:pointer; transition:all 0.2s; border:1.5px solid ${y === bsSelectedYear ? '#2563eb' : '#e2e8f0'}; background:${y === bsSelectedYear ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#fff'}; color:${y === bsSelectedYear ? '#fff' : '#64748b'}; box-shadow:${y === bsSelectedYear ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'};">${y}</button>
        `).join('');

        const renderRow = (section, item) => {
            const isHeader = item.isHeader;
            const weight = isHeader ? 'bold' : 'normal';
            const paddingLeft = isHeader ? '10px' : '30px';
            
            // Lấy giá trị số cuối năm của năm trước để làm số đầu năm
            const startVal = getPrevVal(section, item.id);
            
            return `<tr onclick="window.erpApp.openEditBSModal('${item.id}')" style="cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='transparent'">
                <td style="border:1px solid #000; padding:8px ${paddingLeft}; font-weight:${weight}; font-family:'Times New Roman', serif;">${item.name}</td>
                <td style="border:1px solid #000; padding:8px; text-align:center; font-weight:${weight};">${item.id}</td>
                <td style="border:1px solid #000; padding:8px;"></td>
                <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:${weight}; color:${item.value < 0 ? '#ef4444' : '#000'};">${item.value !== 0 ? f(item.value) : '0'}</td>
                <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:${weight}; color:${startVal < 0 ? '#ef4444' : '#666'};">${startVal !== 0 ? f(startVal) : '0'}</td>
            </tr>`;
        };

        pageContent.innerHTML = `
            <div class="bs-module" style="animation: fadeIn 0.4s ease-out; background:#fff; padding:40px; font-family: 'Times New Roman', serif;">
                <div class="bs-print-container" style="max-width:1000px; margin:0 auto; color:#000;">
                    
                    <!-- Toolbar điều khiển -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; font-family:'Inter',sans-serif;" class="no-print">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="background:#f1f5f9; border:none; padding:8px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:700; color:#475569;">
                                <span class="material-icons-outlined">arrow_back</span> Quay lại
                            </button>
                            <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; font-family:'Inter',sans-serif;">Bảng Cân Đối Kế Toán</h2>
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

                    <!-- Header chuẩn B01-DN -->
                    <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
                        <div style="text-align:center; flex:1;">
                            <h2 style="margin:4px 0; font-size:18px; text-transform:uppercase; font-weight:bold;">BẢNG CÂN ĐỐI KẾ TOÁN</h2>
                            <p style="margin:10px 0; font-weight:bold; font-size:14px;">Tại ngày 31 tháng 12 năm ${bsSelectedYear}</p>
                        </div>
                        <div style="width:200px; padding:10px; border:1px solid #000; text-align:center; font-size:12px; line-height:1.4;">
                            <strong>Mẫu số: B 01 – DN</strong><br>
                            <span style="font-style:italic;">(Ban hành theo Thông tư số 200/2014/TT-BTC Ngày 22/12/2014 của Bộ Tài chính)</span>
                        </div>
                    </div>

                    <div style="margin-bottom:30px; font-size:14px;">
                        <p style="margin:4px 0;"><strong>Tên đơn vị báo cáo:</strong> Công ty Cổ Phần Tư Vấn Đầu Tư Và Xây Dựng Việt Bách</p>
                        <p style="margin:4px 0;"><strong>Mã số thuế:</strong> 0303204517</p>
                        <p style="margin:4px 0;"><strong>Địa chỉ:</strong> TP. Hồ Chí Minh, Việt Nam</p>
                    </div>

                    <!-- Bảng dữ liệu -->
                    <table style="width:100%; border-collapse:collapse; border:1px solid #000; font-size:13px;">
                        <thead>
                            <tr style="text-align:center; font-weight:bold; background:#f2f2f2;">
                                <th style="border:1px solid #000; padding:10px;">TÀI SẢN</th>
                                <th style="border:1px solid #000; padding:10px; width:60px;">Mã số</th>
                                <th style="border:1px solid #000; padding:10px; width:80px;">Thuyết minh</th>
                                <th style="border:1px solid #000; padding:10px; width:150px;">Số cuối năm</th>
                                <th style="border:1px solid #000; padding:10px; width:150px;">Số đầu năm</th>
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
                            <!-- PHẦN TÀI SẢN -->
                            <tr style="background:#f2f2f2;"><td colspan="5" style="padding:10px; font-weight:bold; text-transform:uppercase;">PHẦN I: TÀI SẢN</td></tr>
                            ${bsData.assets.map(item => renderRow('assets', item)).join('')}
                            <tr style="background:#eee; font-weight:bold;">
                                <td style="border:1px solid #000; padding:12px 10px;">TỔNG CỘNG TÀI SẢN (270 = 100 + 200)</td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:center;">270</td>
                                <td style="border:1px solid #000; padding:12px 10px;"></td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:right;">${f(totalAssets)}</td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:right;">${f(totalAssetsStart)}</td>
                            </tr>

                            <!-- PHẦN NGUỒN VỐN -->
                            <tr style="background:#f2f2f2; height:20px;"><td colspan="5" style="border:1px solid #000;"></td></tr>
                            <tr style="background:#f2f2f2;"><td colspan="5" style="padding:10px; font-weight:bold; text-transform:uppercase;">PHẦN II: NGUỒN VỐN</td></tr>
                            ${bsData.liabilities.map(item => renderRow('liabilities', item)).join('')}
                            ${bsData.equity.map(item => renderRow('equity', item)).join('')}
                            <tr style="background:#eee; font-weight:bold;">
                                <td style="border:1px solid #000; padding:12px 10px;">TỔNG CỘNG NGUỒN VỐN (440 = 300 + 400)</td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:center;">440</td>
                                <td style="border:1px solid #000; padding:12px 10px;"></td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:right;">${f(totalLiabEq)}</td>
                                <td style="border:1px solid #000; padding:12px 10px; text-align:right;">${f(totalLiabEqStart)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Chữ ký -->
                    <div style="margin-top:50px; display:grid; grid-template-columns: 1fr 1fr 1fr; text-align:center; font-family:'Inter', sans-serif;">
                        <div>
                            <p style="font-weight:bold; margin-bottom:80px;">NGƯỜI LẬP BIỂU</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                        <div>
                            <p style="font-weight:bold; margin-bottom:80px;">KẾ TOÁN TRƯỞNG</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                        <div>
                            <p style="font-style:italic;">Lập ngày .... tháng .... năm ....</p>
                            <p style="font-weight:bold; margin-bottom:80px;">GIÁM ĐỐC</p>
                            <p>(Ký, họ tên, đóng dấu)</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function openEditBSModal(id) {
        const bsData = loadBSData(bsSelectedYear);
        let allItems = [...bsData.assets, ...bsData.liabilities, ...bsData.equity];
        const item = allItems.find(i => i.id === id);
        if (!item) {return;}
        const modalHtml = `
            <div id="bsEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hiệu chỉnh Chỉ tiêu</h2>
                        <button onclick="document.getElementById('bsEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="background:#f0f9ff; padding:10px 16px; border-radius:10px; margin-bottom:16px; font-size:13px; font-weight:700; color:#0369a1; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">calendar_month</span> Năm tài chính ${bsSelectedYear}
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div><label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Tên chỉ tiêu</label>
                            <div style="font-size:14px; font-weight:700; color:#475569; background:#f8fafc; padding:12px; border-radius:12px;">${item.name}</div></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div><label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số cuối năm (VNĐ)</label>
                                <input type="text" id="edit_bs_value" value="${window.erpApp.formatValue(item.value)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b;"></div>
                            <div><label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số đầu năm (VNĐ)</label>
                                <input type="text" id="edit_bs_start_value" value="${window.erpApp.formatValue(item.startValue)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#64748b;"></div>
                        </div>
                        <button onclick="window.erpApp.saveBSValue('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer;">Cập nhật báo cáo</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveBSValue(id) {
        const value = window.erpApp.parseVND(document.getElementById('edit_bs_value').value);
        const startValue = window.erpApp.parseVND(document.getElementById('edit_bs_start_value').value);
        const bsData = loadBSData(bsSelectedYear);

        ['assets', 'liabilities', 'equity'].forEach(section => {
            const idx = bsData[section].findIndex(i => i.id === id);
            if (idx !== -1) { bsData[section][idx].value = value; bsData[section][idx].startValue = startValue; }
        });

        // Recalculate headers
        ['assets', 'liabilities', 'equity'].forEach(section => {
            bsData[section].filter(i => i.isHeader).forEach(header => {
                const children = bsData[section].filter(i => i.parentId === header.id);
                if (children.length > 0) {
                    header.value = children.reduce((sum, c) => sum + c.value, 0);
                    header.startValue = children.reduce((sum, c) => sum + c.startValue, 0);
                }
            });
        });

        saveBSData(bsSelectedYear, bsData);
        document.getElementById('bsEditModal').remove();
        renderBalanceSheet();
        if (window.erpApp.showToast) {window.erpApp.showToast(`Đã cập nhật BCĐKT năm ${bsSelectedYear}`);}
    }

    function bsSelectYear(year) { bsSelectedYear = year; renderBalanceSheet(); }

    window.erpApp.getBSData = loadBSData;
    window.erpApp.renderBalanceSheet = renderBalanceSheet;
    window.erpApp.openEditBSModal = openEditBSModal;
    window.erpApp.saveBSValue = saveBSValue;
    window.erpApp.bsSelectYear = bsSelectYear;
})();
