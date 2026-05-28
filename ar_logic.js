(function () {
    // ==========================================
    // MODULE: Công Nợ Phải Thu (Accounts Receivable)
    // ==========================================
    let arData = [];

    try {
        const saved = localStorage.getItem('erp_ar_data');
        if (saved) {arData = JSON.parse(saved);}
    } catch (e) { }
    window.erpApp.arData = arData; // Expose for integration

    function renderAR() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Công nợ phải thu';}
        if (pageBadge) {pageBadge.textContent = 'Kế toán';}


        
        const totalDebt = arData.reduce((sum, item) => sum + (item.status !== 'paid' ? (item.total - item.paid) : 0), 0);
        const overdueDebt = arData.reduce((sum, item) => sum + (item.status === 'overdue' ? (item.total - item.paid) : 0), 0);

        const html = `
            <div class="ar-module" style="animation: fadeInUp 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Theo Dõi Công Nợ Phải Thu</h2>
                    </div>
                    <button onclick="window.erpApp.openAddARModal()" style="padding:10px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:12px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">
                        <span class="material-icons-outlined">add</span> Thêm công nợ mới
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:32px;">
                    <div style="background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding:24px; border-radius:24px; color:#fff; box-shadow:0 10px 20px -5px rgba(37, 99, 235, 0.3);">
                        <div style="font-size:12px; font-weight:800; opacity:0.8; text-transform:uppercase;">Tổng phải thu</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px;">${window.erpApp.formatValue(totalDebt)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Nợ quá hạn</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px; color:#ef4444;">${window.erpApp.formatValue(overdueDebt)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Số hóa đơn chờ</div>
                        <div style="font-size:28px; font-weight:900; margin-top:8px; color:#1e293b;">${arData.filter(i => i.status !== 'paid').length}</div>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:900px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">HÓA ĐƠN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">KHÁCH HÀNG</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">DỰ ÁN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">HẠN THANH TOÁN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">TỔNG TIỀN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CÒN NỢ</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:center;">TRẠNG THÁI</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${arData.map(item => {
                                    const balance = item.total - item.paid;
                                    let statusBg, statusColor, statusText;
                                    switch(item.status) {
                                        case 'paid': statusBg = '#dcfce7'; statusColor = '#16a34a'; statusText = 'Đã thanh toán'; break;
                                        case 'partial': statusBg = '#e0f2fe'; statusColor = '#0369a1'; statusText = 'Thanh toán một phần'; break;
                                        case 'overdue': statusBg = '#fee2e2'; statusColor = '#dc2626'; statusText = 'Quá hạn'; break;
                                        default: statusBg = '#f1f5f9'; statusColor = '#64748b'; statusText = 'Chưa thanh toán';
                                    }
                                    return `
                                        <tr style="border-bottom:1px solid #f8fafc; cursor:pointer;" onclick="window.erpApp.viewARDetail('${item.id}')">
                                            <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${item.id}</td>
                                            <td style="padding:16px 12px; font-weight:700; color:#475569;">${item.customer}</td>
                                            <td style="padding:16px 12px; font-weight:600; color:#64748b;">
                                                ${item.projectId ? (window.pmProjects?.find(p => p.id === item.projectId)?.name || item.projectId) : '<span style="color:#cbd5e1">Ngoại dự án</span>'}
                                            </td>
                                            <td style="padding:16px 12px; font-weight:600; color:#64748b;">${item.dueDate}</td>
                                            <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${window.erpApp.formatValue(item.total)} đ</td>
                                            <td style="padding:16px 12px; font-weight:900; color:${balance > 0 ? '#ef4444' : '#10b981'}; text-align:right;">${window.erpApp.formatValue(balance)} đ</td>
                                            <td style="padding:16px 12px; text-align:center;">
                                                <span style="background:${statusBg}; color:${statusColor}; padding:6px 12px; border-radius:30px; font-size:11px; font-weight:800;">${statusText}</span>
                                            </td>
                                            <td style="padding:16px 12px; text-align:center;" onclick="event.stopPropagation()">
                                                <div style="display:flex; gap:8px; justify-content:center;">
                                                    <button onclick="window.erpApp.viewARDetail('${item.id}')" title="Xem chi tiết" style="background:none; border:none; color:#3b82f6; cursor:pointer; display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; transition:0.2s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='none'">
                                                        <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                                    </button>
                                                    <button onclick="window.erpApp.openEditARModal('${item.id}')" title="Cập nhật thanh toán" style="background:none; border:none; color:#10b981; cursor:pointer; display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; transition:0.2s;" onmouseover="this.style.background='#ecfdf5'" onmouseout="this.style.background='none'">
                                                        <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                                    </button>
                                                </div>
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
        if (pageContent) {pageContent.innerHTML = html;}
    }

    function viewARDetail(id) {
        const item = arData.find(a => a.id === id);
        if (!item) {return;}

        const balance = item.total - item.paid;

        const modalHtml = `
            <div id="arDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1000; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Chi tiết Công nợ</h2>
                        <button onclick="document.getElementById('arDetailModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="background:#f8fafc; padding:24px; border-radius:24px; border:1px solid #f1f5f9; display:grid; gap:16px; margin-bottom:24px;">
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">KHÁCH HÀNG</span><span style="font-weight:900; color:#1e293b;">${item.customer}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">MÃ HÓA ĐƠN</span><span style="font-weight:900; color:#3b82f6;">${item.id}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">NGÀY PHÁT HÀNH</span><span style="font-weight:700;">${item.date}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8; font-weight:800; font-size:11px;">HẠN THANH TOÁN</span><span style="font-weight:700; color:#f59e0b;">${item.dueDate}</span></div>
                        <div style="border-top:1px solid #e2e8f0; padding-top:16px; display:flex; justify-content:space-between;"><span style="color:#1e293b; font-weight:900;">TỔNG TIỀN</span><span style="font-weight:900; font-size:18px;">${window.erpApp.formatValue(item.total)} đ</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:900;">ĐÃ TRẢ</span><span style="font-weight:900; color:#10b981;">${window.erpApp.formatValue(item.paid)} đ</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="color:#ef4444; font-weight:900;">CÒN NỢ</span><span style="font-weight:900; color:#ef4444; font-size:18px;">${window.erpApp.formatValue(balance)} đ</span></div>
                    </div>
                    <button onclick="window.erpApp.openEditARModal('${item.id}')" style="width:100%; padding:14px; background:#1e293b; color:#fff; border:none; border-radius:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">edit</span> Cập nhật thanh toán
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function openEditARModal(id) {
        const item = arData.find(a => a.id === id);
        if (!item) {return;}
        const detail = document.getElementById('arDetailModal');
        if (detail) {detail.remove();}

        const modalHtml = `
            <div id="arEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <h2 style="margin:0 0 24px 0; font-size:20px; font-weight:900; color:#1e293b;">Cập nhật Thanh Toán</h2>
                    <div style="display:grid; gap:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">SỐ TIỀN ĐÃ THANH TOÁN (VNĐ)</label>
                            <input type="text" id="edit_ar_paid" value="${window.erpApp.formatValue(item.paid)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">DỰ ÁN LIÊN KẾT</label>
                            <select id="edit_ar_project" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:700;">
                                <option value="">-- Không thuộc dự án --</option>
                                ${(window.pmProjects || []).map(p => `
                                    <option value="${p.id}" ${item.projectId === p.id ? 'selected' : ''}>${p.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">TRẠNG THÁI</label>
                            <select id="edit_ar_status" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:700;">
                                <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Chưa thanh toán</option>
                                <option value="partial" ${item.status === 'partial' ? 'selected' : ''}>Thanh toán một phần</option>
                                <option value="paid" ${item.status === 'paid' ? 'selected' : ''}>Đã thanh toán (Xong)</option>
                                <option value="overdue" ${item.status === 'overdue' ? 'selected' : ''}>Quá hạn</option>
                            </select>
                        </div>
                        <button onclick="window.erpApp.saveAR('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; margin-top:12px;">Xác nhận cập nhật</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveAR(id) {
        const paidStr = document.getElementById('edit_ar_paid').value;
        const paid = window.erpApp.parseVND(paidStr);
        const status = document.getElementById('edit_ar_status').value;
        const projectId = document.getElementById('edit_ar_project').value;

        const idx = arData.findIndex(a => a.id === id);
        if (idx !== -1) {
            arData[idx] = { ...arData[idx], paid, status, projectId };
            localStorage.setItem('erp_ar_data', JSON.stringify(arData));
            window.erpApp.arData = arData; // Update reference
            if (window.CrudSync) {window.CrudSync.saveItem('erp_ar_data', arData[idx], 'id');}
            
            // Gửi thông báo hệ thống
            if (window.erpApp.addNotification) {
                window.erpApp.addNotification(
                    `Đã cập nhật thanh toán từ KH: ${arData[idx].customer}`,
                    'payments',
                    'green',
                    'tai-chinh'
                );
            }

            document.getElementById('arEditModal').remove();
            renderAR();
            if (window.erpApp.showToast) {window.erpApp.showToast('Đã cập nhật công nợ thành công');}
        }
    }

    function openAddARModal() {
        const customers = window.customers || [];
        const projects = window.pmProjects || [];
        const nextId = 'AR-' + Date.now().toString().slice(-6);
        const today = new Date().toISOString().split('T')[0];

        const modalHtml = `
            <div id="arAddModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:32px; padding:32px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Thêm Công Nợ Phải Thu Mới</h2>
                        <button onclick="document.getElementById('arAddModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form onsubmit="window.erpApp.saveNewAR(event)" style="display:grid; gap:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">MÃ HÓA ĐƠN</label>
                            <input type="text" name="id" value="${nextId}" required style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; background:#f8fafc; font-weight:800;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">KHÁCH HÀNG</label>
                            <select name="customer" required style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:700;">
                                <option value="">-- Chọn khách hàng --</option>
                                ${customers.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">DỰ ÁN LIÊN KẾT</label>
                            <select name="projectId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:700;">
                                <option value="">-- Không thuộc dự án --</option>
                                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">HẠN THANH TOÁN</label>
                                <input type="date" name="dueDate" value="${today}" required style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px;">TỔNG TIỀN (VNĐ)</label>
                                <input type="text" name="total" placeholder="0" oninput="window.erpApp.formatNumberInput(this)" required style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#10b981;">
                            </div>
                        </div>
                        <button type="submit" style="width:100%; padding:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; margin-top:12px; box-shadow:0 10px 20px -5px rgba(16, 185, 129, 0.3);">Tạo hóa đơn phải thu</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveNewAR(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRecord = {
            id: formData.get('id'),
            customer: formData.get('customer'),
            projectId: formData.get('projectId'),
            dueDate: formData.get('dueDate'),
            total: window.erpApp.parseVND(formData.get('total')),
            paid: 0,
            status: 'pending',
            date: new Date().toLocaleDateString('vi-VN')
        };

        arData.unshift(newRecord);
        localStorage.setItem('erp_ar_data', JSON.stringify(arData));
        window.erpApp.arData = arData;
        if (window.CrudSync) {window.CrudSync.saveItem('erp_ar_data', newRecord, 'id');}

        document.getElementById('arAddModal').remove();
        renderAR();
        if (window.erpApp.showToast) {window.erpApp.showToast('Đã thêm công nợ phải thu mới');}
    }

    window.erpApp.renderAR = renderAR;
    window.erpApp.viewARDetail = viewARDetail;
    window.erpApp.openEditARModal = openEditARModal;
    window.erpApp.openAddARModal = openAddARModal;
    window.erpApp.saveNewAR = saveNewAR;
    window.erpApp.saveAR = saveAR;

})();
