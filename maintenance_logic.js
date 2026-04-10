
// ==========================================
// MODULE: Quản lý thiết bị (Maintenance)
// ==========================================
let assetHealth = [
    { wcId: 'WC-001', name: 'Xưởng Cắt Laser 01', health: 92, lastMaintenance: '2026-03-10', nextMaintenance: '2026-05-10', runningHours: 450, criticality: 'High' },
    { wcId: 'WC-002', name: 'Tổ May Công Nghiệp A2', health: 85, lastMaintenance: '2026-02-15', nextMaintenance: '2026-04-20', runningHours: 820, criticality: 'Normal' },
    { wcId: 'WC-003', name: 'Máy In 3D Markforged', health: 40, lastMaintenance: '2025-12-01', nextMaintenance: '2026-04-01', runningHours: 1200, criticality: 'High' }
];

let maintenanceLogs = [
    { id: 'MT-1001', wcId: 'WC-003', type: 'Sửa chữa', date: '2026-04-05', cost: 2500000, technician: 'Lê Văn Cơ', status: 'pending', desc: 'Thay dây đai trục X' }
];

try {
    const savedHealth = JSON.parse(localStorage.getItem('erp_assetHealth'));
    if (savedHealth) assetHealth = savedHealth;
    const savedLogs = JSON.parse(localStorage.getItem('erp_maintenanceLogs'));
    if (savedLogs) maintenanceLogs = savedLogs;
} catch (e) { }

function renderMaintenance() {
    breadcrumbCurrent.textContent = 'Quản lý thiết bị (Maintenance)';
    pageBadge.textContent = 'Sản xuất';

    const html = `
            <div class="maintenance-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Sức khỏe Thiết bị & Bảo trì</h2>
                    </div>
                    <button onclick="window.erpApp.openMaintenanceOrderModal()" style="padding:12px 24px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                        <span class="material-icons-outlined">build</span> Tạo Lệnh Bảo trì / Sửa chữa
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px; margin-bottom:32px;">
                    ${assetHealth.map(asset => {
        const color = asset.health > 80 ? '#10b981' : (asset.health > 50 ? '#f59e0b' : '#ef4444');
        return `
                        <div class="asset-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                                <div style="font-size:11px; font-weight:900; color:#94a3b8;">${asset.wcId}</div>
                                <span style="background:${color}20; color:${color}; padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900;">${asset.criticality}</span>
                            </div>
                            <h3 style="margin:0 0 16px 0; font-size:16px; font-weight:900; color:#1e293b;">${asset.name}</h3>
                            
                            <div style="margin-bottom:20px;">
                                <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; margin-bottom:6px;">
                                    <span style="color:#64748b;">SỨC KHỎE MÁY (HEALTH)</span>
                                    <span style="color:${color}">${asset.health}%</span>
                                </div>
                                <div style="height:8px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                    <div style="width:${asset.health}%; height:100%; background:${color}; border-radius:10px;"></div>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:12px; border-top:1px solid #f1f5f9; padding-top:16px;">
                                <div>
                                    <div style="color:#94a3b8; font-weight:700; font-size:10px; margin-bottom:4px;">LẦN CUỐI</div>
                                    <div style="font-weight:900; color:#475569;">${asset.lastMaintenance}</div>
                                </div>
                                <div>
                                    <div style="color:#94a3b8; font-weight:700; font-size:10px; margin-bottom:4px;">KẾ HOẠCH TIẾP</div>
                                    <div style="font-weight:900; color:#1e293b;">${asset.nextMaintenance}</div>
                                </div>
                            </div>
                        </div>
                        `;
    }).join('')}
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <h3 style="margin:0 0 20px 0; font-size:18px; font-weight:900; color:#1e293b;">Nhật ký Bảo trì & Sửa chữa</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8;">MÃ LỆNH</th>
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8;">THIẾT BỊ</th>
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8;">LOẠI</th>
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8;">KỸ THUẬT VIÊN</th>
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CHI PHÍ</th>
                                <th style="padding:12px; font-size:12px; font-weight:900; color:#94a3b8;">TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${maintenanceLogs.map(log => `
                                <tr style="border-bottom:1px solid #f8fafc;">
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${log.id}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#475569;">${log.wcId}</td>
                                    <td style="padding:16px 12px; font-weight:600;"><span style="background:#f1f5f9; padding:4px 8px; border-radius:6px; font-size:11px;">${log.type}</span></td>
                                    <td style="padding:16px 12px; font-weight:700; color:#475569;">${log.technician}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${new Intl.NumberFormat('vi-VN').format(log.cost)} đ</td>
                                    <td style="padding:16px 12px;">
                                        <span style="padding:4px 10px; border-radius:30px; font-size:10px; font-weight:900; background:${log.status === 'completed' ? '#dcfce7' : '#fef9c3'}; color:${log.status === 'completed' ? '#16a34a' : '#a16207'};">
                                            ${log.status === 'completed' ? 'Đã Xong' : 'Đang Xử Lý'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    pageContent.innerHTML = html;
}

window.erpApp.openMaintenanceOrderModal = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'mtModal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 520px;">
            <div class="modal-header">
                <h2><span class="material-icons-outlined">build_circle</span> Lệnh Bảo trì Thiết bị</h2>
                <button class="modal-close-btn" onclick="document.getElementById('mtModal').remove()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body" style="background: var(--bg-body); padding: 24px;">
                <div class="premium-card" style="display:grid; gap:16px;">
                    <div class="form-group">
                        <label>CHỌN MÁY MÓC / TỔ ĐỘI</label>
                        <select id="mtWcId" class="form-control" style="font-weight:700; color:var(--primary);">
                            ${assetHealth.map(a => '<option value="' + a.wcId + '">' + a.name + ' (' + a.wcId + ')</option>').join('')}
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>LOẠI BẢO TRÌ</label>
                            <select id="mtType" class="form-control">
                                <option value="Định kỳ">Định kỳ</option>
                                <option value="Sửa chữa">Sửa chữa</option>
                                <option value="Nâng cấp">Nâng cấp</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>CHI PHÍ (VNĐ)</label>
                            <input type="text" id="mtCost" class="form-control" placeholder="0" oninput="window.erpApp.formatVNDInput(this)" style="font-weight:700; text-align:right;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>MÔ TẢ CHI TIẾT</label>
                        <textarea id="mtDesc" class="form-control" style="min-height:80px; resize:vertical;" placeholder="Nhập nội dung bảo trì..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-cancel" onclick="document.getElementById('mtModal').remove()">Hủy bỏ</button>
                <button type="button" class="btn-save" onclick="window.erpApp.saveMaintenanceOrder()" style="background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                    <span class="material-icons-outlined">build</span> Gửi Lệnh Bảo trì
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};


window.erpApp.saveMaintenanceOrder = function () {
    const wcId = document.getElementById('mtWcId').value;
    const type = document.getElementById('mtType').value;
    const cost = window.erpApp.parseVND(document.getElementById('mtCost').value);
    const desc = document.getElementById('mtDesc').value;

    const order = {
        id: 'MT-' + Date.now().toString().slice(-4),
        wcId, type, cost, desc,
        technician: 'Chờ phân công',
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
    };

    maintenanceLogs.unshift(order);

    // Cập nhật trạng thái Work Center sang MAINTENANCE
    if (typeof workCenters !== 'undefined') {
        const wc = workCenters.find(w => w.id === wcId);
        if (wc) {
            wc.status = 'maintenance';
            localStorage.setItem('erp_workCenters', JSON.stringify(workCenters));
        }
    }

    localStorage.setItem('erp_maintenanceLogs', JSON.stringify(maintenanceLogs));
    showToast('Đã tạo lệnh bảo trì. Trạng thái thiết bị chuyển sang BẢO TRÌ!');
    document.getElementById('mtModal').remove();
    renderMaintenance();
};

window.erpApp.renderMaintenance = renderMaintenance;
