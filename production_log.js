    // ==========================================
    // MODULE: Nhật ký sản xuất
    // ==========================================
    let productionLogs = [
        { id: 'LOG-001', moId: 'MO-2026-0041', date: '2026-04-10', shift: 'Ca 1', finishedQty: 10, note: 'Hoàn thành Cắt tấm gỗ', operator: 'Lê V. D' },
        { id: 'LOG-002', moId: 'MO-2026-0041', date: '2026-04-11', shift: 'Ca 1', finishedQty: 15, note: 'Lắp ráp xong 15 bộ', operator: 'Lê V. D' }
    ];

    try {
        const savedLogs = JSON.parse(localStorage.getItem('erp_productionLogs'));
        if (savedLogs) productionLogs = savedLogs;
    } catch (e) {}

    window.erpApp.renderProductionLog = function() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');
        
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Nhật ký sản xuất';
        if (pageBadge) pageBadge.textContent = 'Sản xuất';

        const html = `
            <div class="log-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo Cáo Nhật Ký Sản Xuất</h2>
                    </div>
                    <button onclick="window.erpApp.openCreateLogModal()" style="padding:12px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(16, 185, 129, 0.3);">
                        <span class="material-icons-outlined">add_circle</span> Ghi Nhật Ký Mới
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">NGÀY GHI NHẬN</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">CA LÀM</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">LỆNH SẢN XUẤT</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">SL HOÀN THÀNH</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">NGƯỜI THAO TÁC</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">GHI CHÚ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productionLogs.map(log => {
                                return `
                                <tr style="border-bottom:1px solid #f8fafc; cursor:pointer;" onclick="window.erpApp.viewLogDetail('${log.id}')">
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${log.date}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#10b981;">${log.shift}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#3b82f6;">${log.moId}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${log.finishedQty}</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#475569;">${log.operator}</td>
                                    <td style="padding:16px 12px; font-weight:500; color:#64748b; font-size:13px;">${log.note}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (pageContent) pageContent.innerHTML = html;
    };

    window.erpApp.viewLogDetail = function(id) {
        const log = productionLogs.find(l => l.id === id);
        if(!log) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'logDetailModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 550px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">history_edu</span> Chi tiết Nhật ký sản xuất</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('logDetailModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 20px;">
                    <div class="premium-card">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">event_note</span> Thông tin ghi nhận
                        </h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="info-item">
                                <div class="info-label">MÃ NHẬT KÝ</div>
                                <div class="info-value" style="color:var(--primary); font-size:16px;">${log.id}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">NGÀY THỰC HIỆN</div>
                                <div class="info-value">${log.date}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">CA LÀM VIỆC</div>
                                <div class="info-value" style="color:var(--status-green);">${log.shift}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">LỆNH SẢN XUẤT</div>
                                <div class="info-value" style="color:var(--primary); font-weight:800;">${log.moId}</div>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card bg-light">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">inventory_2</span> Kết quả sản xuất
                        </h4>
                        <div class="info-item" style="margin-bottom:16px;">
                            <div class="info-label">SẢN LƯỢNG HOÀN THÀNH</div>
                            <div style="font-size:24px; font-weight:900; color:var(--text-primary);">${log.finishedQty} <span style="font-size:14px; color:var(--text-muted); font-weight:600;">đơn vị</span></div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">GHI CHÚ / NỘI DUNG CHI TIẾT</div>
                            <div style="background:#fff; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); font-size:13px; color:var(--text-muted); line-height:1.6;">
                                ${log.note || '(Không có ghi chú)'}
                            </div>
                        </div>
                    </div>

                    <div class="premium-card">
                        <div class="info-item">
                            <div class="info-label">NGƯỜI THỰC HIỆN</div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="width:32px; height:32px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">${log.operator.charAt(0)}</div>
                                <div class="info-value">${log.operator}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('logDetailModal').remove()">Đóng</button>
                    <button type="button" class="btn-primary" onclick="window.erpApp.openEditLogModal('${log.id}')" style="background:var(--primary);">
                        <span class="material-icons-outlined">edit</span> Chỉnh sửa nhật ký
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openEditLogModal = function(id) {
        const log = productionLogs.find(l => l.id === id);
        if(!log) return;
        
        const detailModal = document.getElementById('logDetailModal');
        if(detailModal) detailModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'logEditModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">edit_note</span> Chỉnh sửa Nhật ký</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('logEditModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="background: var(--bg-body); padding: 24px;">
                    <div class="premium-card" style="display:grid; gap:16px;">
                        <div class="form-group">
                            <label>NGÀY GHI NHẬN</label>
                            <input type="date" id="edit_log_date" class="form-control" value="${log.date}">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group">
                                <label>CA LÀM</label>
                                <select id="edit_log_shift" class="form-control">
                                    <option value="Ca 1" ${log.shift === 'Ca 1' ? 'selected' : ''}>Ca 1</option>
                                    <option value="Ca 2" ${log.shift === 'Ca 2' ? 'selected' : ''}>Ca 2</option>
                                    <option value="Ca 3" ${log.shift === 'Ca 3' ? 'selected' : ''}>Ca 3</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>LỆNH SẢN XUẤT</label>
                                <input type="text" id="edit_log_moId" class="form-control" value="${log.moId}" style="color:var(--primary); font-weight:700;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>SẢN LƯỢNG HOÀN THÀNH</label>
                            <input type="number" id="edit_log_qty" class="form-control" value="${log.finishedQty}" style="font-weight:700;">
                        </div>
                        <div class="form-group">
                            <label>GHI CHÚ</label>
                            <textarea id="edit_log_note" class="form-control" style="min-height:80px; resize:vertical;">${log.note}</textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('logEditModal').remove()">Hủy bỏ</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.saveLog('${log.id}')">Lưu nhật ký</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openCreateLogModal = function() {
        const mos = JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'logCreateModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">post_add</span> Ghi Nhật Ký Mới</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('logCreateModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="background: var(--bg-body); padding: 24px;">
                    <div class="premium-card" style="display:grid; gap:16px;">
                        <div class="form-group">
                            <label>NGÀY GHI NHẬN</label>
                            <input type="date" id="create_log_date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group">
                                <label>CA LÀM</label>
                                <select id="create_log_shift" class="form-control">
                                    <option value="Ca 1">Ca 1</option>
                                    <option value="Ca 2">Ca 2</option>
                                    <option value="Ca 3">Ca 3</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>LỆNH SẢN XUẤT</label>
                                <select id="create_log_moId" class="form-control" style="color:var(--primary); font-weight:700;">
                                    ${mos.length > 0 ? mos.map(m => '<option value="' + m.id + '">' + m.id + ' - ' + m.product + '</option>').join('') : '<option value="">(Không có MO)</option>'}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>SẢN LƯỢNG HOÀN THÀNH</label>
                            <input type="number" id="create_log_qty" class="form-control" value="0" style="font-weight:700;">
                        </div>
                        <div class="form-group">
                            <label>GHI CHÚ</label>
                            <textarea id="create_log_note" class="form-control" placeholder="Nhập nội dung ghi nhận..." style="min-height:80px; resize:vertical;"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('logCreateModal').remove()">Hủy bỏ</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.handleCreateLog()"><span class="material-icons-outlined">save</span> Lưu nhật ký</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.handleCreateLog = function() {
        const date = document.getElementById('create_log_date').value;
        const shift = document.getElementById('create_log_shift').value;
        const moId = document.getElementById('create_log_moId').value;
        const finishedQty = parseInt(document.getElementById('create_log_qty').value) || 0;
        const note = document.getElementById('create_log_note').value;

        const newLog = {
            id: 'LOG-' + Math.floor(100 + Math.random() * 900),
            moId, date, shift, finishedQty, note,
            operator: 'Admin'
        };

        productionLogs.unshift(newLog);
        localStorage.setItem('erp_productionLogs', JSON.stringify(productionLogs));
        if (document.getElementById('logCreateModal')) document.getElementById('logCreateModal').remove();
        window.erpApp.renderProductionLog();
        if(typeof showToast === 'function') showToast('Đã tạo nhật ký sản xuất mới');
    };

    window.erpApp.saveLog = function(id) {
        const date = document.getElementById('edit_log_date').value;
        const shift = document.getElementById('edit_log_shift').value;
        const moId = document.getElementById('edit_log_moId').value;
        const finishedQty = parseInt(document.getElementById('edit_log_qty').value);
        const note = document.getElementById('edit_log_note').value;

        const index = productionLogs.findIndex(l => l.id === id);
        if(index > -1) {
            productionLogs[index] = { ...productionLogs[index], date, shift, moId, finishedQty, note };
            localStorage.setItem('erp_productionLogs', JSON.stringify(productionLogs));
            document.getElementById('logEditModal').remove();
            window.erpApp.renderProductionLog();
            if(typeof showToast === 'function') showToast('Đã cập nhật nhật ký sản xuất');
        }
    };
