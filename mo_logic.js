    // ==========================================
    // MODULE: Lệnh Sản Xuất (Manufacturing Order - MO)
    // ==========================================
    let manufacturingOrders = [
        { id: 'MO-2026-0041', product: 'Bàn ghế phòng khách gỗ Sồi', qty: 50, date: '2026-04-10', deadline: '2026-04-25', status: 'processing', progress: 40, manager: 'Nguyễn Văn A' },
        { id: 'MO-2026-0042', product: 'Tủ quần áo 3 buồng', qty: 20, date: '2026-04-12', deadline: '2026-04-30', status: 'pending', progress: 0, manager: 'Trần Thị B' },
        { id: 'MO-2026-0043', product: 'Giường ngủ hiện đại 1m8', qty: 35, date: '2026-04-05', deadline: '2026-04-15', status: 'completed', progress: 100, manager: 'Lê Hoàng C' }
    ];

    try {
        const savedMOs = JSON.parse(localStorage.getItem('erp_manufacturingOrders'));
        if (savedMOs) manufacturingOrders = savedMOs;
    } catch (e) {}

    window.erpApp.renderMO = function() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');
        
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Lệnh sản xuất (MO)';
        if (pageBadge) pageBadge.textContent = 'Sản xuất';

        const html = `
            <div class="mo-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Danh sách Lệnh Sản Xuất</h2>
                    </div>
                    <button onclick="window.erpApp.openCreateMOModal()" style="padding:12px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(59, 130, 246, 0.3);">
                        <span class="material-icons-outlined">add</span> Tạo Lệnh Sản Xuất
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:32px;">
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#e0e7ff; color:#4f46e5; border-radius:14px; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">assignment</span>
                        </div>
                        <div>
                            <div style="font-size:12px; font-weight:800; color:#64748b; margin-bottom:4px;">TỔNG LỆNH SX</div>
                            <div style="font-size:24px; font-weight:900; color:#1e293b;">${manufacturingOrders.length}</div>
                        </div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#fef3c7; color:#d97706; border-radius:14px; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">pending_actions</span>
                        </div>
                        <div>
                            <div style="font-size:12px; font-weight:800; color:#64748b; margin-bottom:4px;">ĐANG SẢN XUẤT</div>
                            <div style="font-size:24px; font-weight:900; color:#1e293b;">${manufacturingOrders.filter(m => m.status === 'processing').length}</div>
                        </div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#dcfce7; color:#16a34a; border-radius:14px; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">task_alt</span>
                        </div>
                        <div>
                            <div style="font-size:12px; font-weight:800; color:#64748b; margin-bottom:4px;">ĐÃ HOÀN THÀNH</div>
                            <div style="font-size:24px; font-weight:900; color:#1e293b;">${manufacturingOrders.filter(m => m.status === 'completed').length}</div>
                        </div>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">MÃ LỆNH</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">SẢN PHẨM</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">SỐ LƯỢNG</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">TIẾN ĐỘ</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">DEADLINE</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">NGƯỜI LẬP</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${manufacturingOrders.map(mo => {
                                let statusHtml = '';
                                if (mo.status === 'completed') statusHtml = '<span style="background:#dcfce7; color:#16a34a; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">Hoàn thành</span>';
                                else if (mo.status === 'processing') statusHtml = '<span style="background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">Đang sản xuất</span>';
                                else statusHtml = '<span style="background:#f1f5f9; color:#64748b; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">Chờ duyệt</span>';
                                
                                return `
                                <tr style="border-bottom:1px solid #f8fafc; cursor:pointer;" onclick="window.erpApp.viewMODetail('${mo.id}')">
                                    <td style="padding:16px 12px; font-weight:800; color:#3b82f6;">${mo.id}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#1e293b;">${mo.product}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#475569;">${mo.qty}</td>
                                    <td style="padding:16px 12px;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <div style="flex:1; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                                <div style="height:100%; width:${mo.progress}%; background:${mo.status === 'completed' ? '#10b981' : '#3b82f6'}; border-radius:3px;"></div>
                                            </div>
                                            <span style="font-size:12px; font-weight:800; color:#475569;">${mo.progress}%</span>
                                        </div>
                                    </td>
                                    <td style="padding:16px 12px; font-weight:600; color:#ef4444;">${mo.deadline}</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#475569;">${mo.manager}</td>
                                    <td style="padding:16px 12px;">${statusHtml}</td>
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

    window.erpApp.openCreateMOModal = function () {
        const boms = window.erpApp.boms || [];
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'moCreateModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 650px;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">add_task</span> Tạo Lệnh Sản Xuất Mới</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('moCreateModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="background: var(--bg-body); padding: 24px;">
                    <form id="moCreateForm" onsubmit="event.preventDefault(); window.erpApp.saveMO();">
                        <div class="premium-card bg-light">
                            <h4 class="premium-section-title">
                                <span class="material-icons-outlined">inventory_2</span> Thông tin định danh
                            </h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Sản phẩm / BOM <span style="color:var(--status-red)">*</span></label>
                                    <select id="moBomId" class="form-control" required style="font-weight: 600;">
                                        <option value="">-- Chọn sản phẩm --</option>
                                        ${boms.map(bom => `<option value="${bom.id}" data-name="${bom.productName}">${bom.productName} (${bom.id})</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Số lượng sản xuất <span style="color:var(--status-red)">*</span></label>
                                    <input type="number" id="moQty" class="form-control" required min="1" placeholder="Nhập số lượng" style="font-weight: 600;">
                                </div>
                            </div>
                        </div>

                        <div class="premium-card">
                            <h4 class="premium-section-title">
                                <span class="material-icons-outlined">calendar_today</span> Lịch trình sản xuất
                            </h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Ngày bắt đầu dự kiến <span style="color:var(--status-red)">*</span></label>
                                    <input type="date" id="moStartDate" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Hạn hoàn thành <span style="color:var(--status-red)">*</span></label>
                                    <input type="date" id="moDeadline" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top: 16px;">
                                <label>Người phụ trách</label>
                                <input type="text" id="moManager" class="form-control" value="${window.erpApp.currentUser?.fullName || 'Admin'}">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="document.getElementById('moCreateModal').remove()">Đóng</button>
                    <button type="submit" form="moCreateForm" class="btn-save"><span class="material-icons-outlined">save</span> Lưu thông tin</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveMO = function() {
        const bomSelect = document.getElementById('moBomId');
        const bomId = bomSelect.value;
        const productName = bomSelect.options[bomSelect.selectedIndex].getAttribute('data-name');
        const qty = parseInt(document.getElementById('moQty').value);
        const startDate = document.getElementById('moStartDate').value;
        const endDate = document.getElementById('moDeadline').value;
        const manager = document.getElementById('moManager').value;

        if (!bomId || !qty || !startDate || !endDate) {
            if (typeof showToast === 'function') showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
            else alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
            return;
        }

        const newMO = {
            id: 'MO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
            product: productName,
            qty: qty,
            status: 'pending',
            progress: 0,
            deadline: endDate,
            date: startDate,
            bomId: bomId,
            manager: manager
        };

        manufacturingOrders.unshift(newMO);
        localStorage.setItem('erp_manufacturingOrders', JSON.stringify(manufacturingOrders));
        
        if (typeof showToast === 'function') showToast(`Đã tạo thành công lệnh sản xuất ${newMO.id}!`);
        else alert(`Đã tạo thành công lệnh sản xuất ${newMO.id}!`);
        
        document.getElementById('moCreateModal').remove();
        window.erpApp.renderMO();
    };

    window.erpApp.viewMODetail = function(id) {
        const mo = manufacturingOrders.find(m => m.id === id);
        if(!mo) return;
        
        let statusText = mo.status === 'completed' ? 'Hoàn thành' : (mo.status === 'processing' ? 'Đang sản xuất' : 'Chờ duyệt');
        let statusIcon = mo.status === 'completed' ? 'check_circle' : (mo.status === 'processing' ? 'sync' : 'history_query');

        // Fetch related data
        const mrps = (typeof mrpPlans !== 'undefined') ? mrpPlans.filter(m => m.moId === id) : [];
        const qcs = (typeof qcList !== 'undefined') ? qcList.filter(q => q.moId === id) : [];
        const logs = (typeof productionLogs !== 'undefined') ? productionLogs.filter(l => l.moId === id) : [];
        const cost = (typeof productionCosts !== 'undefined') ? productionCosts.find(c => c.moId === id) : null;

        const fmt = new Intl.NumberFormat('vi-VN');
        
        let costHtml = `<div class="premium-card" style="padding:16px; background:#f8fafc; font-size:13px; color:#64748b; font-style:italic;">Chưa có dữ liệu giá thành (Chi tiết sẽ tính khi hoàn tất).</div>`;
        if (cost) {
            const revenue = cost.totalCost * 1.3;
            const profit = revenue - cost.totalCost;
            costHtml = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                    <div style="background:#f1f5f9; padding:16px; border-radius:12px;">
                        <span style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:4px;">CHI PHÍ VẬT TƯ (NVL)</span>
                        <span style="font-size:16px; font-weight:900; color:#1e293b;">${fmt.format(cost.materialCost)} đ</span>
                    </div>
                    <div style="background:#f1f5f9; padding:16px; border-radius:12px;">
                        <span style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:4px;">CP NHÂN CÔNG & SXC</span>
                        <span style="font-size:16px; font-weight:900; color:#1e293b;">${fmt.format(cost.laborCost + cost.overheadCost)} đ</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, #1e293b, #0f172a); padding:20px; border-radius:16px; color:#fff;">
                    <div>
                        <span style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:4px;">TỔNG GIÁ THÀNH (VỐN)</span>
                        <span style="font-size:20px; font-weight:900;">${fmt.format(cost.totalCost)} đ</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:4px;">DỰ KIẾN LỢI NHUẬN (30%)</span>
                        <span style="font-size:20px; font-weight:900; color:#10b981;">+ ${fmt.format(profit)} đ</span>
                    </div>
                </div>
            `;
        }

        let logHtml = logs.length === 0 ? `<div style="color:#94a3b8; font-size:13px; font-style:italic;">Chưa có nhật ký/tiến độ công việc.</div>` : 
            `<div style="display:grid; gap:12px;">
                ${logs.map(l => `
                <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:800; color:#94a3b8;">${l.date} (${l.shift}) - ${l.operator}</span>
                        <span style="font-size:12px; font-weight:900; color:#3b82f6;">+${l.finishedQty} SP</span>
                    </div>
                    <div style="font-size:13px; font-weight:600; color:#1e293b;">${l.note}</div>
                </div>`).join('')}
            </div>`;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'moDetailModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; height: 90vh;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">assignment</span> Chi tiết Lệnh Sản Xuất - ${mo.id}</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('moDetailModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 24px;">
                    
                    <!-- Overview info -->
                    <div class="premium-card bg-light">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">info</span> Thông tin chung
                        </h4>
                        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:24px;">
                            <div>
                                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">SẢN PHẨM</label>
                                <div style="font-size:16px; font-weight:700; color:var(--text-primary);">${mo.product}</div>
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">SỐ LƯỢNG</label>
                                <div style="font-size:16px; font-weight:700; color:var(--text-primary);">${mo.qty} SP</div>
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">TRẠNG THÁI</label>
                                <div style="display:flex; align-items:center; gap:6px; font-weight:700; color:var(--primary);">
                                    <span class="material-icons-outlined" style="font-size:18px;">${statusIcon}</span> ${statusText}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px;">
                        <!-- Left col: MRP & QC -->
                        <div style="display:grid; gap:24px;">
                            <div class="premium-card">
                                <h4 class="premium-section-title">
                                    <span class="material-icons-outlined">inventory</span> Vật tư dự kiến (MRP)
                                </h4>
                                ${mrps.length === 0 ? `<div style="color:#94a3b8; font-size:13px; font-style:italic;">Không có dữ liệu.</div>` : `
                                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                        <thead>
                                            <tr style="border-bottom:1px solid #e2e8f0; color:#94a3b8; text-align:left;">
                                                <th style="padding:10px 0;">Vật tư</th><th style="padding:10px 0; text-align:right;">SL Cần</th><th style="padding:10px 0; text-align:right;">Tình trạng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${mrps.map(m => `
                                            <tr style="border-bottom:1px solid #f1f5f9;">
                                                <td style="padding:12px 0; font-weight:600;">${m.material}</td>
                                                <td style="padding:12px 0; text-align:right; font-weight:700;">${m.requiredQty}</td>
                                                <td style="padding:12px 0; text-align:right; font-weight:700; color:${m.status === 'ok' ? '#10b981' : '#ef4444'};">${m.status === 'ok' ? 'Đủ kho' : 'Thiếu hụt'}</td>
                                            </tr>`).join('')}
                                        </tbody>
                                    </table>
                                `}
                            </div>

                            <div class="premium-card">
                                <h4 class="premium-section-title">
                                    <span class="material-icons-outlined">verified</span> Kiểm soát chất lượng (QC)
                                </h4>
                                ${qcs.length === 0 ? `<div style="color:#94a3b8; font-size:13px; font-style:italic;">Chưa có biên bản.</div>` : `
                                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                        <thead>
                                            <tr style="border-bottom:1px solid #e2e8f0; color:#94a3b8; text-align:left;">
                                                <th style="padding:10px 0;">Công đoạn</th><th style="padding:10px 0; text-align:right;">Pass/Fail</th><th style="padding:10px 0; text-align:right;">Kết quả</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${qcs.map(q => `
                                            <tr style="border-bottom:1px solid #f1f5f9;">
                                                <td style="padding:12px 0; font-weight:600;">${q.step}</td>
                                                <td style="padding:12px 0; text-align:right; font-weight:700;">${q.passed}/${q.failed}</td>
                                                <td style="padding:12px 0; text-align:right; font-weight:700; color:${q.status === 'pass' ? '#10b981' : '#ef4444'};">${q.status.toUpperCase()}</td>
                                            </tr>`).join('')}
                                        </tbody>
                                    </table>
                                `}
                            </div>
                        </div>

                        <!-- Right col: Cost & Logs -->
                        <div style="display:grid; gap:24px;">
                            <div class="premium-card">
                                <h4 class="premium-section-title">
                                    <span class="material-icons-outlined">payments</span> Phân tích Giá thành
                                </h4>
                                ${costHtml}
                            </div>

                            <div class="premium-card">
                                <h4 class="premium-section-title">
                                    <span class="material-icons-outlined">history</span> Nhật ký sản xuất
                                </h4>
                                ${logHtml}
                            </div>
                        </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };
