(function () {
    // ==========================================
    // MODULE: Công Nợ Phải Trả (Accounts Payable)
    // ==========================================
    let apData = [
        { id: 'PINV-0012', supplier: 'Tổng kho Gỗ Việt', date: '2026-03-20', dueDate: '2026-04-05', total: 150000000, paid: 50000000, status: 'partial' },
        { id: 'PINV-0015', supplier: 'Phụ kiện Mộc An', date: '2026-03-28', dueDate: '2026-04-20', total: 25000000, paid: 0, status: 'pending' },
        { id: 'PINV-0008', supplier: 'Xưởng Sơn PU Hưng Thịnh', date: '2026-02-15', dueDate: '2026-03-01', total: 12000000, paid: 0, status: 'overdue' },
        { id: 'PINV-0020', supplier: 'Công ty Điện Lực Huế', date: '2026-04-01', dueDate: '2026-04-10', total: 8500000, paid: 8500000, status: 'paid' }
    ];

    try {
        const saved = localStorage.getItem('erp_ap_data');
        if (saved) apData = JSON.parse(saved);
    } catch (e) { }

    function renderAP() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Công nợ phải trả';
        if (pageBadge) pageBadge.textContent = 'Kế toán';

        const fmt = new Intl.NumberFormat('vi-VN');
        
        const totalPayable = apData.reduce((sum, item) => sum + (item.status !== 'paid' ? (item.total - item.paid) : 0), 0);
        const overduePayable = apData.reduce((sum, item) => sum + (item.status === 'overdue' ? (item.total - item.paid) : 0), 0);

        const html = `
            <div class="ap-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Theo Dõi Công Nợ Phải Trả</h2>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:32px;">
                    <div style="background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding:24px; border-radius:24px; color:#fff; box-shadow:0 10px 20px -5px rgba(220, 38, 38, 0.3);">
                        <div style="font-size:12px; font-weight:800; opacity:0.8; text-transform:uppercase;">Tổng phải trả</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px;">${fmt.format(totalPayable)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Nợ quá hạn NCC</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px; color:#ef4444;">${fmt.format(overduePayable)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Nhà cung cấp đang nợ</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px; color:#1e293b;">${apData.filter(i => i.status !== 'paid').length}</div>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:900px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">HÓA ĐƠN NCC</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">NHÀ CUNG CẤP</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">HẠN THANH TOÁN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">TỔNG THANH TOÁN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CÒN NỢ</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:center;">TRẠNG THÁI</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${apData.map(item => {
                                    const balance = item.total - item.paid;
                                    let statusBg, statusColor, statusText;
                                    switch(item.status) {
                                        case 'paid': statusBg = '#dcfce7'; statusColor = '#16a34a'; statusText = 'Đã Tất Toán'; break;
                                        case 'partial': statusBg = '#fff7ed'; statusColor = '#c2410c'; statusText = 'Đã trả một phần'; break;
                                        case 'overdue': statusBg = '#fee2e2'; statusColor = '#dc2626'; statusText = 'Quá hạn'; break;
                                        default: statusBg = '#f1f5f9'; statusColor = '#64748b'; statusText = 'Chưa thanh toán';
                                    }
                                    return `
                                        <tr style="border-bottom:1px solid #f8fafc; cursor:pointer;" onclick="window.erpApp.viewAPDetail('${item.id}')">
                                            <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${item.id}</td>
                                            <td style="padding:16px 12px; font-weight:700; color:#475569;">${item.supplier}</td>
                                            <td style="padding:16px 12px; font-weight:600; color:#64748b;">${item.dueDate}</td>
                                            <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${fmt.format(item.total)} đ</td>
                                            <td style="padding:16px 12px; font-weight:900; color:${balance > 0 ? '#ef4444' : '#10b981'}; text-align:right;">${fmt.format(balance)} đ</td>
                                            <td style="padding:16px 12px; text-align:center;">
                                                <span style="background:${statusBg}; color:${statusColor}; padding:6px 12px; border-radius:30px; font-size:11px; font-weight:800;">${statusText}</span>
                                            </td>
                                            <td style="padding:16px 12px; text-align:right;">
                                                <span class="material-icons-outlined" style="color:#cbd5e1; font-size:20px;">chevron_right</span>
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

    function viewAPDetail(id) {
        const item = apData.find(a => a.id === id);
        if (!item) return;
        const fmt = new Intl.NumberFormat('vi-VN');
        const balance = item.total - item.paid;

        const modalHtml = `
            <div id="apDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1000; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Chi tiết Nợ Phải Trả</h2>
                        <button onclick="document.getElementById('apDetailModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="background:#f8fafc; padding:24px; border-radius:24px; border:1px solid #f1f5f9; display:grid; gap:16px; margin-bottom:24px;">
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">NHÀ CUNG CẤP</span><span style="font-weight:900; color:#1e293b;">${item.supplier}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">MÃ HÓA ĐƠN NCC</span><span style="font-weight:900; color:#ef4444;">${item.id}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">NGÀY NHẬP</span><span style="font-weight:700;">${item.date}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">HẠN THANH TOÁN</span><span style="font-weight:700; color:#ef4444;">${item.dueDate}</span></div>
                        <div style="border-top:1px solid #e2e8f0; padding-top:16px; display:flex; justify-content:space-between;"><span style="color:#1e293b; font-weight:900;">TỔNG THANH TOÁN</span><span style="font-weight:900; font-size:18px;">${fmt.format(item.total)} đ</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:900;">ĐÃ TRẢ NCC</span><span style="font-weight:900; color:#10b981;">${fmt.format(item.paid)} đ</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#ef4444; font-weight:900;">CÒN PHẢI TRẢ</span><span style="font-weight:900; color:#ef4444; font-size:18px;">${fmt.format(balance)} đ</span></div>
                    </div>
                    <button onclick="window.erpApp.openEditAPModal('${item.id}')" style="width:100%; padding:14px; background:#ef4444; color:#fff; border:none; border-radius:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">payment</span> Ghi nhận thanh toán
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function openEditAPModal(id) {
        const item = apData.find(a => a.id === id);
        if (!item) return;
        const detail = document.getElementById('apDetailModal');
        if (detail) detail.remove();

        const modalHtml = `
            <div id="apEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <h2 style="margin:0 0 24px 0; font-size:20px; font-weight:900; color:#1e293b;">Cập nhật Thanh Toán NCC</h2>
                    <div style="display:grid; gap:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">SỐ TIỀN ĐÃ TRẢ NCC (VNĐ)</label>
                            <input type="text" id="edit_ap_paid" value="${new Intl.NumberFormat('vi-VN').format(item.paid)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">TRẠNG THÁI</label>
                            <select id="edit_ap_status" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:700;">
                                <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Chưa thanh toán</option>
                                <option value="partial" ${item.status === 'partial' ? 'selected' : ''}>Đã trả một phần</option>
                                <option value="paid" ${item.status === 'paid' ? 'selected' : ''}>Đã Tất Toán (Xong)</option>
                                <option value="overdue" ${item.status === 'overdue' ? 'selected' : ''}>Quá hạn</option>
                            </select>
                        </div>
                        <button onclick="window.erpApp.saveAP('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; margin-top:12px;">Xác nhận thanh toán</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveAP(id) {
        const paidStr = document.getElementById('edit_ap_paid').value;
        const paid = window.erpApp.parseVND(paidStr);
        const status = document.getElementById('edit_ap_status').value;

        const idx = apData.findIndex(a => a.id === id);
        if (idx !== -1) {
            apData[idx] = { ...apData[idx], paid, status };
            localStorage.setItem('erp_ap_data', JSON.stringify(apData));
            document.getElementById('apEditModal').remove();
            renderAP();
            if (typeof showToast === 'function') showToast('Đã cập nhật công nợ NCC');
        }
    }

    window.erpApp.renderAP = renderAP;
    window.erpApp.viewAPDetail = viewAPDetail;
    window.erpApp.openEditAPModal = openEditAPModal;
    window.erpApp.saveAP = saveAP;

})();
