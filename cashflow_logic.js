(function () {
    // ==========================================
    // MODULE: Lưu Chuyển Tiền Tệ - ĐA NĂM
    // ==========================================
    const CF_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    let cfSelectedYear = 2025;

    function getDefaultCFData() {
        return [
            { id: '1', name: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', value: 0, isHeader: true },
            { id: '2', name: 'II. Lưu chuyển tiền từ hoạt động đầu tư', value: 0, isHeader: true },
            { id: '3', name: 'III. Lưu chuyển tiền từ hoạt động tài chính', value: 0, isHeader: true },
            { id: '4', name: 'Lưu chuyển tiền thuần trong kỳ', value: 0, isTotal: true },
            { id: '5', name: 'Tiền và tương đương tiền đầu kỳ', value: 0, isTotal: true },
            { id: '6', name: 'Tiền và tương đương tiền cuối kỳ', value: 0, isTotal: true }
        ];
    }

    const defaultCF2025 = [
        { id: '1', name: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', value: -1587619788, isHeader: true },
        { id: '2', name: 'II. Lưu chuyển tiền từ hoạt động đầu tư', value: 28718593, isHeader: true },
        { id: '3', name: 'III. Lưu chuyển tiền từ hoạt động tài chính', value: -1750000000, isHeader: true },
        { id: '4', name: 'Lưu chuyển tiền thuần trong kỳ', value: -3308901195, isTotal: true },
        { id: '5', name: 'Tiền và tương đương tiền đầu kỳ', value: 9632937001, isTotal: true },
        { id: '6', name: 'Tiền và tương đương tiền cuối kỳ', value: 6324035806, isTotal: true }
    ];

    function loadCFData(year) {
        try {
            // Priority 1: Synced array
            const allData = JSON.parse(localStorage.getItem('erp_cashflow_data')) || [];
            const yearEntry = allData.find(d => d.id === year.toString());
            if (yearEntry && yearEntry.items) {return yearEntry.items;}

            // Priority 2: Legacy key
            const saved = localStorage.getItem('erp_cashflow_data_' + year);
            if (saved) {return JSON.parse(saved);}

            // Priority 3: 2025 migration
            if (year === 2025) {
                const oldSaved = localStorage.getItem('erp_cashflow_data');
                if (oldSaved) {return JSON.parse(oldSaved);}
                return JSON.parse(JSON.stringify(defaultCF2025));
            }
        } catch (e) { }
        return getDefaultCFData();
    }

    function saveCFData(year, data) {
        // Legacy local
        localStorage.setItem('erp_cashflow_data_' + year, JSON.stringify(data));

        // Sync
        if (window.CrudSync) {
            const syncData = {
                id: year.toString(),
                items: data,
                updatedAt: new Date().toISOString()
            };
            window.CrudSync.saveItem('erp_cashflow_data', syncData, 'id');
        }
    }

    function renderCashFlow() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) {return;}

        const cfData = loadCFData(cfSelectedYear);
        const prevYearData = loadCFData(cfSelectedYear - 1); // Tải dữ liệu năm trước
        const f = window.erpApp.formatValue;

        const yearTabs = CF_YEARS.map(y => `
            <button onclick="window.erpApp.cfSelectYear(${y})" style="padding:10px 20px; border-radius:12px; font-weight:800; font-size:13px; cursor:pointer; transition:all 0.2s; border:1.5px solid ${y === cfSelectedYear ? '#2563eb' : '#e2e8f0'}; background:${y === cfSelectedYear ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#fff'}; color:${y === cfSelectedYear ? '#fff' : '#64748b'}; box-shadow:${y === cfSelectedYear ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'};">${y}</button>
        `).join('');

        pageContent.innerHTML = `
            <div class="cf-module" style="animation: fadeIn 0.4s ease-out; background:#fff; padding:40px; font-family: 'Times New Roman', serif;">
                <div class="cf-print-container" style="max-width:1000px; margin:0 auto; color:#000;">
                    
                    <!-- Toolbar điều khiển -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; font-family:'Inter',sans-serif;" class="no-print">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="background:#f1f5f9; border:none; padding:8px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:700; color:#475569;">
                                <span class="material-icons-outlined">arrow_back</span> Quay lại
                            </button>
                            <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; font-family:'Inter',sans-serif;">Lưu Chuyển Tiền Tệ</h2>
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

                    <!-- Header chuẩn B03-DN -->
                    <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
                        <div style="text-align:center; flex:1;">
                            <h2 style="margin:4px 0; font-size:18px; text-transform:uppercase; font-weight:bold;">BÁO CÁO LƯU CHUYỂN TIỀN TỆ</h2>
                            <p style="margin:4px 0; font-style:italic; font-size:14px;">(Theo phương pháp trực tiếp)</p>
                            <p style="margin:10px 0; font-weight:bold; font-size:14px;">Năm tài chính ${cfSelectedYear}</p>
                        </div>
                        <div style="width:200px; padding:10px; border:1px solid #000; text-align:center; font-size:12px; line-height:1.4;">
                            <strong>Mẫu số: B 03 – DN</strong><br>
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
                            ${cfData.map(item => {
            const isTotal = item.isTotal;
            const isHeader = item.isHeader;
            const weight = (isTotal || isHeader) ? 'bold' : 'normal';
            const bg = isTotal ? '#f2f2f2' : 'transparent';

            // Tìm giá trị năm trước
            const prevItem = prevYearData.find(p => p.id === item.id);
            const prevValue = prevItem ? prevItem.value : 0;

            return `
                                    <tr onclick="window.erpApp.openEditCFModal('${item.id}')" style="cursor:pointer; background:${bg}; transition: background 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='${bg}'">
                                        <td style="border:1px solid #000; padding:10px; font-weight:${weight}; font-family:'Times New Roman', serif;">${item.name}</td>
                                        <td style="border:1px solid #000; padding:10px; text-align:center; font-weight:${weight};">${item.id}</td>
                                        <td style="border:1px solid #000; padding:10px;"></td>
                                        <td style="border:1px solid #000; padding:10px; text-align:right; font-weight:${weight}; color:${item.value < 0 ? '#ef4444' : '#000'};">${item.value !== 0 ? f(item.value) : '0'}</td>
                                        <td style="border:1px solid #000; padding:10px; text-align:right; font-weight:${weight}; color:${prevValue < 0 ? '#ef4444' : '#666'};">${prevValue !== 0 ? f(prevValue) : '0'}</td>
                                    </tr>
                                `;
        }).join('')}
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

    function openEditCFModal(id) {
        const cfData = loadCFData(cfSelectedYear);
        const item = cfData.find(i => i.id === id);
        if (!item) {return;}
        const modalHtml = `
            <div id="cfEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">Cập nhật dòng tiền</h2>
                        <button onclick="document.getElementById('cfEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="background:#ecfdf5; padding:10px 16px; border-radius:10px; margin-bottom:16px; font-size:13px; font-weight:700; color:#059669; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">calendar_month</span> Năm ${cfSelectedYear}
                    </div>
                    <div style="display:grid; gap:16px;">
                        <div style="font-size:14px; font-weight:700; color:#64748b;">${item.name}</div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Giá trị (VNĐ)</label>
                            <input type="text" id="edit_cf_value" value="${window.erpApp.formatValue(item.value)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b;">
                        </div>
                        <button onclick="window.erpApp.saveCFValue('${item.id}')" style="width:100%; padding:16px; background:#1e293b; color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer;">Xác nhận cập nhật</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveCFValue(id) {
        const val = window.erpApp.parseVND(document.getElementById('edit_cf_value').value);
        const cfData = loadCFData(cfSelectedYear);
        const idx = cfData.findIndex(i => i.id === id);
        if (idx !== -1) {
            cfData[idx].value = val;
            // Recalculate
            const getV = (cid) => { const it = cfData.find(i => i.id === cid); return it ? it.value : 0; };
            const setV = (cid, v) => { const it = cfData.find(i => i.id === cid); if (it) {it.value = v;} };
            const net = getV('1') + getV('2') + getV('3');
            setV('4', net);
            setV('6', getV('5') + net);

            saveCFData(cfSelectedYear, cfData);
            document.getElementById('cfEditModal').remove();
            renderCashFlow();
            if (window.erpApp.showToast) {window.erpApp.showToast(`Đã cập nhật LCTT năm ${cfSelectedYear}`);}
        }
    }

    function cfSelectYear(year) { cfSelectedYear = year; renderCashFlow(); }

    window.erpApp.getCFData = loadCFData;
    window.erpApp.renderCashFlow = renderCashFlow;
    window.erpApp.openEditCFModal = openEditCFModal;
    window.erpApp.saveCFValue = saveCFValue;
    window.erpApp.cfSelectYear = cfSelectYear;
})();
