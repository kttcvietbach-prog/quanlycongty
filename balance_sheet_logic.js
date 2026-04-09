(function () {
    // ==========================================
    // MODULE: Bảng Cân Đối Kế Toán (Balance Sheet)
    // ==========================================
    let bsData = {
        assets: [
            { id: '100', name: 'A. TÀI SẢN NGẮN HẠN', value: 1250000000, isHeader: true },
            { id: '110', name: 'I. Tiền và các khoản tương đương tiền', value: 450000000, parentId: '100' },
            { id: '120', name: 'II. Các khoản phải thu ngắn hạn', value: 320000000, parentId: '100' },
            { id: '130', name: 'III. Hàng tồn kho', value: 480000000, parentId: '100' },
            { id: '200', name: 'B. TÀI SẢN DÀI HẠN', value: 3500000000, isHeader: true },
            { id: '210', name: 'I. Tài sản cố định hữu hình', value: 2800000000, parentId: '200' },
            { id: '220', name: 'II. Bất động sản đầu tư', value: 700000000, parentId: '200' }
        ],
        liabilities: [
            { id: '300', name: 'C. NỢ PHẢI TRẢ', value: 1800000000, isHeader: true },
            { id: '310', name: 'I. Nợ ngắn hạn', value: 1200000000, parentId: '300' },
            { id: '320', name: 'II. Nợ dài hạn', value: 600000000, parentId: '300' }
        ],
        equity: [
            { id: '400', name: 'D. VỐN CHỦ SỞ HỮU', value: 2950000000, isHeader: true },
            { id: '410', name: 'I. Vốn góp của chủ sở hữu', value: 2500000000, parentId: '400' },
            { id: '420', name: 'II. Lợi nhuận sau thuế chưa phân phối', value: 450000000, parentId: '400' }
        ]
    };

    try {
        const saved = localStorage.getItem('erp_balance_sheet');
        if (saved) bsData = JSON.parse(saved);
    } catch (e) { }

    function renderBalanceSheet() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Bảng cân đối kế toán';
        if (pageBadge) pageBadge.textContent = 'Tài chính';

        const fmt = new Intl.NumberFormat('vi-VN');

        const totalAssets = bsData.assets.filter(a => a.isHeader).reduce((sum, a) => sum + a.value, 0);
        const totalLiabilitiesEquity = bsData.liabilities.filter(l => l.isHeader).reduce((sum, l) => sum + l.value, 0) +
                                       bsData.equity.filter(e => e.isHeader).reduce((sum, e) => sum + e.value, 0);

        const html = `
            <div class="bs-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Bảng Cân Đối Kế Toán</h2>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:32px;">
                    <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:24px; border-radius:24px; color:#fff; box-shadow:0 10px 15px -3px rgba(15, 23, 42, 0.2);">
                        <div style="font-size:12px; font-weight:800; opacity:0.7; text-transform:uppercase;">Tổng Tài Sản</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px;">${fmt.format(totalAssets)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Nguồn Vốn (Nợ + Vốn CSH)</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px; color:#3b82f6;">${fmt.format(totalLiabilitiesEquity)} đ</div>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; box-shadow:0 4px 20px -5px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Chỉ tiêu báo cáo</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right; width:200px; text-transform:uppercase;">Số cuối kỳ</th>
                                    <th style="padding:16px 12px; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background:#f8fafc;"><td colspan="3" style="padding:12px; font-weight:900; color:#1e293b; font-size:14px;">PHẦN I: TÀI SẢN</td></tr>
                                ${bsData.assets.map(item => renderBSRow(item, fmt)).join('')}
                                <tr style="background:#f1f5f9;"><td style="padding:16px 12px; font-weight:900; color:#1e293b;">TỔNG CỘNG TÀI SẢN</td><td style="padding:16px 12px; font-weight:900; color:#1e293b; text-align:right;">${fmt.format(totalAssets)}</td><td></td></tr>
                                
                                <tr style="background:#f8fafc;"><td colspan="3" style="padding:12px; font-weight:900; color:#1e293b; font-size:14px; margin-top:20px;">PHẦN II: NGUỒN VỐN</td></tr>
                                ${bsData.liabilities.map(item => renderBSRow(item, fmt)).join('')}
                                ${bsData.equity.map(item => renderBSRow(item, fmt)).join('')}
                                <tr style="background:#f1f5f9;"><td style="padding:16px 12px; font-weight:900; color:#1e293b;">TỔNG CỘNG NGUỒN VỐN</td><td style="padding:16px 12px; font-weight:900; color:#1e293b; text-align:right;">${fmt.format(totalLiabilitiesEquity)}</td><td></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) pageContent.innerHTML = html;
    }

    function renderBSRow(item, fmt) {
        const padding = item.isHeader ? '12px' : '32px';
        const color = item.isHeader ? '#1e293b' : '#64748b';
        const weight = item.isHeader ? '800' : '600';
        const size = item.isHeader ? '14px' : '13px';

        return `
            <tr style="border-bottom:1px solid #f8fafc;">
                <td style="padding:16px ${padding}; font-weight:${weight}; color:${color}; font-size:${size};">${item.name}</td>
                <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right; font-size:${size};">${fmt.format(item.value)}</td>
                <td style="padding:16px 12px; text-align:right;">
                    <button onclick="window.erpApp.openEditBSModal('${item.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;" title="Chỉnh sửa">
                        <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                    </button>
                </td>
            </tr>
        `;
    }

    function openEditBSModal(id) {
        let allItems = [...bsData.assets, ...bsData.liabilities, ...bsData.equity];
        const item = allItems.find(i => i.id === id);
        if (!item) return;

        const modalHtml = `
            <div id="bsEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hiệu chỉnh Chỉ tiêu</h2>
                        <button onclick="document.getElementById('bsEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Tên chỉ tiêu</label>
                            <div style="font-size:14px; font-weight:700; color:#475569; background:#f8fafc; padding:12px; border-radius:12px;">${item.name}</div>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Giá trị hạch toán (VNĐ)</label>
                            <input type="text" id="edit_bs_value" value="${new Intl.NumberFormat('vi-VN').format(item.value)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b;">
                        </div>
                        <button onclick="window.erpApp.saveBSValue('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(15, 23, 42, 0.3);">
                            Cập nhật báo cáo
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveBSValue(id) {
        const valStr = document.getElementById('edit_bs_value').value;
        const value = window.erpApp.parseVND(valStr);
        
        // Cập nhật trong đúng danh mục
        if (bsData.assets.some(i => i.id === id)) {
            const idx = bsData.assets.findIndex(i => i.id === id);
            bsData.assets[idx].value = value;
            // Nếu là con, cập nhật lại header nếu cần (tạm thời để thủ công hoặc tự động tính sau)
        } else if (bsData.liabilities.some(i => i.id === id)) {
            const idx = bsData.liabilities.findIndex(i => i.id === id);
            bsData.liabilities[idx].value = value;
        } else if (bsData.equity.some(i => i.id === id)) {
            const idx = bsData.equity.findIndex(i => i.id === id);
            bsData.equity[idx].value = value;
        }

        // Tự động tính toán lại các Headers (Cha) dựa trên các con
        recalculateBSHeaders();

        localStorage.setItem('erp_balance_sheet', JSON.stringify(bsData));
        document.getElementById('bsEditModal').remove();
        renderBalanceSheet();
        if (typeof showToast === 'function') showToast('Đã cập nhật Bảng cân đối');
    }

    function recalculateBSHeaders() {
        ['assets', 'liabilities', 'equity'].forEach(section => {
            bsData[section].filter(i => i.isHeader).forEach(header => {
                const children = bsData[section].filter(i => i.parentId === header.id);
                if (children.length > 0) {
                    header.value = children.reduce((sum, child) => sum + child.value, 0);
                }
            });
        });
    }

    window.erpApp.renderBalanceSheet = renderBalanceSheet;
    window.erpApp.openEditBSModal = openEditBSModal;
    window.erpApp.saveBSValue = saveBSValue;
})();
