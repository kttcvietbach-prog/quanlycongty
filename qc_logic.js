    // ==========================================
    // MODULE: Kiểm tra chất lượng (QC)
    // ==========================================
    let qcList = [
        { id: 'QC-001', moId: 'MO-2026-0041', step: 'Lắp ráp', total: 50, passed: 48, failed: 2, checker: 'Phạm QC', date: '2026-04-12', status: 'pass' },
        { id: 'QC-002', moId: 'MO-2026-0041', step: 'Sơn Mài', total: 48, passed: 40, failed: 8, checker: 'Trần QC', date: '2026-04-14', status: 'reject' }
    ];

    try {
        const savedQC = JSON.parse(localStorage.getItem('erp_qcList'));
        if (savedQC) qcList = savedQC;
    } catch (e) {}

    window.erpApp.renderQC = function() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');
        
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Kiểm tra chất lượng (QC)';
        if (pageBadge) pageBadge.textContent = 'Sản xuất';

        const html = `
            <div class="qc-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Bảng Kiểm Tra Chất Lượng (QC)</h2>
                    </div>
                    <button onclick="window.erpApp.openCreateQCModal()" style="padding:12px 24px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(59, 130, 246, 0.3);">
                        <span class="material-icons-outlined">add_circle</span> Tạo Phiếu Kiểm Tra
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">MÃ QC</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">LỆNH SẢN XUẤT</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">CÔNG ĐOẠN</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">SẢN LƯỢNG K.TRA</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#16a34a; text-align:right;">ĐẠT</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#ef4444; text-align:right;">LỖI (NG)</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">NGƯỜI KỂM TRA</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:center;">KẾT LUẬN</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${qcList.map(qc => {
                                let statusHtml = qc.status === 'pass' 
                                    ? '<span style="background:#dcfce7; color:#16a34a; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">ĐẠT (PASS)</span>' 
                                    : '<span style="background:#fee2e2; color:#ef4444; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">TỶ LỆ LỖI CAO</span>';
                                
                                return `
                                <tr style="border-bottom:1px solid #f8fafc; cursor:pointer;" onclick="window.erpApp.viewQCDetail('${qc.id}')">
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${qc.id}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#3b82f6;">${qc.moId}</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#475569;">${qc.step}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${qc.total}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#16a34a; text-align:right;">${qc.passed}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#ef4444; text-align:right;">${qc.failed}</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#475569;">${qc.checker}<br><span style="font-size:10px; color:#94a3b8;">${qc.date}</span></td>
                                    <td style="padding:16px 12px; text-align:center;">${statusHtml}</td>
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

    window.erpApp.viewQCDetail = function(id) {
        const qc = qcList.find(q => q.id === id);
        if(!qc) return;
        
        const statusText = qc.status === 'pass' ? 'ĐẠT (PASS)' : 'TỶ LỆ LỖI CAO';
        const statusClass = qc.status === 'pass' ? 'status-pill-green' : 'status-pill-red';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'qcDetailModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">fact_check</span> Chi tiết Kiểm tra QC</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('qcDetailModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 20px;">
                    <div class="premium-card">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">info</span> Thông tin chung
                        </h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="info-item">
                                <div class="info-label">MÃ PHIẾU QC</div>
                                <div class="info-value" style="color:var(--primary); font-size:16px;">${qc.id}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">LỆNH SẢN XUẤT</div>
                                <div class="info-value" style="color:var(--primary);">${qc.moId}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">CÔNG ĐOẠN</div>
                                <div class="info-value">${qc.step}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">NGÀY KIỂM TRA</div>
                                <div class="info-value">${qc.date}</div>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card bg-light">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">analytics</span> Kết quả kiểm kê
                        </h4>
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; margin-bottom:16px;">
                            <div style="text-align:center; padding:12px; background:#fff; border-radius:12px; border:1px solid var(--border-color);">
                                <div class="info-label" style="text-align:center;">TỔNG KIỂM</div>
                                <div style="font-size:20px; font-weight:900; color:var(--text-primary);">${qc.total}</div>
                            </div>
                            <div style="text-align:center; padding:12px; background:#f0fdf4; border-radius:12px; border:1px solid #bcf0da;">
                                <div class="info-label" style="text-align:center; color:#16a34a;">ĐẠT (PASS)</div>
                                <div style="font-size:20px; font-weight:900; color:#16a34a;">${qc.passed}</div>
                            </div>
                            <div style="text-align:center; padding:12px; background:#fef2f2; border-radius:12px; border:1px solid #fecaca;">
                                <div class="info-label" style="text-align:center; color:#ef4444;">LỖI (NG)</div>
                                <div style="font-size:20px; font-weight:900; color:#ef4444;">${qc.failed}</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px dashed var(--border-color);">
                            <div class="info-label">KẾT LUẬN CUỐI CÙNG:</div>
                            <span class="status-pill ${statusClass}" style="font-size:12px; padding:6px 16px;">${statusText}</span>
                        </div>
                    </div>

                    <div class="premium-card">
                        <div class="info-item">
                            <div class="info-label">NHÂN VIÊN KIỂM TRA</div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="width:32px; height:32px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">${qc.checker.charAt(0)}</div>
                                <div class="info-value">${qc.checker}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('qcDetailModal').remove()">Đóng</button>
                    <button type="button" class="btn-primary" onclick="window.erpApp.openEditQCModal('${qc.id}')" style="background:var(--primary);">
                        <span class="material-icons-outlined">edit</span> Chỉnh sửa phiếu
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openEditQCModal = function(id) {
        const qc = qcList.find(q => q.id === id);
        if(!qc) return;
        
        const detailModal = document.getElementById('qcDetailModal');
        if(detailModal) detailModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'qcEditModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">edit_note</span> Chỉnh sửa Phiếu QC</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('qcEditModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 20px;">
                    <div class="premium-card">
                        <div class="form-group">
                            <label>LỆNH SẢN XUẤT</label>
                            <input type="text" id="edit_qc_moId" class="form-control" value="${qc.moId}" style="font-weight:700; color:var(--primary);">
                        </div>
                        <div class="form-group">
                            <label>CÔNG ĐOẠN</label>
                            <input type="text" id="edit_qc_step" class="form-control" value="${qc.step}" style="font-weight:600;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                            <div class="form-group">
                                <label style="font-size:11px;">TỔNG KT</label>
                                <input type="number" id="edit_qc_total" class="form-control" value="${qc.total}" style="font-weight:700; text-align:center;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:11px; color:#16a34a;">ĐẠT (PASS)</label>
                                <input type="number" id="edit_qc_passed" class="form-control" value="${qc.passed}" style="font-weight:700; text-align:center; color:#16a34a;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:11px; color:#ef4444;">LỖI (NG)</label>
                                <input type="number" id="edit_qc_failed" class="form-control" value="${qc.failed}" style="font-weight:700; text-align:center; color:#ef4444;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>NGƯỜI KIỂM TRA</label>
                            <input type="text" id="edit_qc_checker" class="form-control" value="${qc.checker}" style="font-weight:600;">
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('qcEditModal').remove()">Hủy bỏ</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.saveQC('${qc.id}')">Lưu thay đổi</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveQC = function(id) {
        const moId = document.getElementById('edit_qc_moId').value;
        const step = document.getElementById('edit_qc_step').value;
        const total = parseInt(document.getElementById('edit_qc_total').value);
        const passed = parseInt(document.getElementById('edit_qc_passed').value);
        const failed = parseInt(document.getElementById('edit_qc_failed').value);
        const checker = document.getElementById('edit_qc_checker').value;

        const index = qcList.findIndex(q => q.id === id);
        if(index > -1) {
            qcList[index] = {
                ...qcList[index],
                moId, step, total, passed, failed, checker,
                status: (passed / total >= 0.9) ? 'pass' : 'reject'
            };
            localStorage.setItem('erp_qcList', JSON.stringify(qcList));
            document.getElementById('qcEditModal').remove();
            window.erpApp.renderQC();
            if(typeof showToast === 'function') showToast('Đã lưu thay đổi phiếu QC');
        }
    };

    window.erpApp.openCreateQCModal = function() {
        const mos = JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'qcCreateModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">add_task</span> Tạo Phiếu Kiểm Tra QC</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('qcCreateModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 20px;">
                    <div class="premium-card">
                        <div class="form-group">
                            <label>LỆNH SẢN XUẤT</label>
                            <select id="create_qc_moId" class="form-control" style="font-weight:700; color:var(--primary);">
                                ${mos.length > 0 ? mos.map(m => `<option value="${m.id}">${m.id} - ${m.product}</option>`).join('') : '<option value="">(Không có MO)</option>'}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>CÔNG ĐOẠN KIỂM TRA</label>
                            <input type="text" id="create_qc_step" class="form-control" placeholder="VD: Lắp ráp, Sơn mài, Đóng gói..." style="font-weight:600;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                            <div class="form-group">
                                <label style="font-size:11px;">TỔNG KT</label>
                                <input type="number" id="create_qc_total" class="form-control" value="0" style="font-weight:700; text-align:center;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:11px; color:#16a34a;">ĐẠT</label>
                                <input type="number" id="create_qc_passed" class="form-control" value="0" style="font-weight:700; text-align:center; color:#16a34a;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:11px; color:#ef4444;">LỖI</label>
                                <input type="number" id="create_qc_failed" class="form-control" value="0" style="font-weight:700; text-align:center; color:#ef4444;">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('qcCreateModal').remove()">Hủy bỏ</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.handleCreateQC()"><span class="material-icons-outlined">save</span> Lưu phiếu mới</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.handleCreateQC = function() {
        const moId = document.getElementById('create_qc_moId').value;
        const step = document.getElementById('create_qc_step').value;
        const total = parseInt(document.getElementById('create_qc_total').value);
        const passed = parseInt(document.getElementById('create_qc_passed').value);
        const failed = parseInt(document.getElementById('create_qc_failed').value);

        const newQC = {
            id: 'QC-' + Math.floor(1000 + Math.random() * 9000),
            moId, step, total, passed, failed,
            checker: 'Admin',
            date: new Date().toISOString().split('T')[0],
            status: (passed / total >= 0.9) ? 'pass' : 'reject'
        };

        qcList.unshift(newQC);
        localStorage.setItem('erp_qcList', JSON.stringify(qcList));
        if (document.getElementById('qcCreateModal')) document.getElementById('qcCreateModal').remove();
        window.erpApp.renderQC();
        if(typeof showToast === 'function') showToast('Đã tạo phiếu kiểm tra QC thành công');
    };

    window.erpApp.renderQC = renderQC;
    window.erpApp.qcList = qcList;
