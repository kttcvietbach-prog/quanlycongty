(function () {
    // ==========================================
    // MODULE: Lưu Chuyển Tiền Tệ (Cash Flow Statement)
    // ==========================================
    let cfData = [
        { id: '1', name: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', value: 150000000, isHeader: true },
        { id: '2', name: 'II. Lưu chuyển tiền từ hoạt động đầu tư', value: -80000000, isHeader: true },
        { id: '3', name: 'III. Lưu chuyển tiền từ hoạt động tài chính', value: 200000000, isHeader: true },
        { id: '4', name: 'Lưu chuyển tiền thuần trong kỳ', value: 270000000, isTotal: true },
        { id: '5', name: 'Tiền và tương đương tiền đầu kỳ', value: 180000000, isTotal: true },
        { id: '6', name: 'Tiền và tương đương tiền cuối kỳ', value: 450000000, isTotal: true }
    ];

    try {
        const saved = localStorage.getItem('erp_cashflow_data');
        if (saved) cfData = JSON.parse(saved);
    } catch (e) { }

    function renderCashFlow() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Lưu chuyển tiền tệ';
        if (pageBadge) pageBadge.textContent = 'Tài chính';

        const fmt = new Intl.NumberFormat('vi-VN');

        const html = `
            <div class="cf-module" style="animation: fadeInUp 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo Cáo Lưu Chuyển Tiền Tệ</h2>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; box-shadow:0 10px 30px -10px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Chỉ tiêu công việc</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right; width:220px; text-transform:uppercase;">Số tiền (VNĐ)</th>
                                    <th style="padding:16px 12px; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cfData.map(item => {
                                    const isTotal = item.isTotal;
                                    const background = isTotal ? '#f8fafc' : 'transparent';
                                    const color = item.value < 0 ? '#ef4444' : (isTotal ? '#3b82f6' : '#1e293b');
                                    const weight = isTotal ? '900' : '700';

                                    return `
                                        <tr style="border-bottom:1px solid #f1f5f9; background:${background};">
                                            <td style="padding:18px 12px; font-weight:${weight}; color:#475569; font-size:14px;">${item.name}</td>
                                            <td style="padding:18px 12px; font-weight:900; color:${color}; text-align:right; font-size:15px;">${fmt.format(item.value)}</td>
                                            <td style="padding:18px 12px; text-align:right;">
                                                <button onclick="window.erpApp.openEditCFModal('${item.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;" title="Chỉnh sửa">
                                                    <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) pageContent.innerHTML = html;
    }

    function openEditCFModal(id) {
        const item = cfData.find(i => i.id === id);
        if (!item) return;

        const modalHtml = `
            <div id="cfEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">Cập nhật dòng tiền</h2>
                        <button onclick="document.getElementById('cfEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:16px;">
                        <div style="font-size:14px; font-weight:700; color:#64748b; margin-bottom:10px;">${item.name}</div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Giá trị điều chỉnh (VNĐ)</label>
                            <input type="text" id="edit_cf_value" value="${new Intl.NumberFormat('vi-VN').format(item.value)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b;">
                        </div>
                        <button onclick="window.erpApp.saveCFValue('${item.id}')" style="width:100%; padding:16px; background:#1e293b; color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer;">Xác nhận cập nhật</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveCFValue(id) {
        const valStr = document.getElementById('edit_cf_value').value;
        const val = window.erpApp.parseVND(valStr);
        const idx = cfData.findIndex(i => i.id === id);
        if (idx !== -1) {
            cfData[idx].value = val;
            calculateCF();
            localStorage.setItem('erp_cashflow_data', JSON.stringify(cfData));
            document.getElementById('cfEditModal').remove();
            renderCashFlow();
            if (typeof showToast === 'function') showToast('Đã cập nhật báo cáo lưu chuyển tiền tệ');
        }
    }

    function calculateCF() {
        const getV = (id) => cfData.find(i => i.id === id).value;
        const setV = (id, val) => { const item = cfData.find(i => i.id === id); if(item) item.value = val; };

        // 4. Thuần trong kỳ = 1 + 2 + 3
        const net = getV('1') + getV('2') + getV('3');
        setV('4', net);
        // 6. Cuối kỳ = Đầu kỳ + Thuần trong kỳ
        setV('6', getV('5') + net);
    }

    window.erpApp.renderCashFlow = renderCashFlow;
    window.erpApp.openEditCFModal = openEditCFModal;
    window.erpApp.saveCFValue = saveCFValue;

})();
