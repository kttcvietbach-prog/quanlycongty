// ==========================================
// MODULE: Sức khỏe Thiết bị & Bảo trì
// ==========================================
let assetHealth = [];

let maintenanceSectorFilter = 'all';

let maintenanceLogs = [];

try {
    const savedHealth = JSON.parse(localStorage.getItem('erp_assetHealth'));
    if (savedHealth && Array.isArray(savedHealth)) {
        // Tự động làm sạch tên nếu có hậu tố #1, #2... từ dữ liệu cũ trong localStorage
        assetHealth = savedHealth.map(a => ({
            ...a,
            name: a.name ? a.name.replace(/\s*#\d+$/, '') : 'Thiết bị không tên'
        }));
    }
    
    // Seed sample trạm trộn if empty
    if (assetHealth.length === 0) {
        assetHealth = [
            { wcId: 'T-01', name: 'Trạm bê tông nhựa nóng', sector: 'Bê tông nhựa nóng', health: 82, criticality: 'medium', sensor: 'TEMP-01', uptime: '98%', lastMaintenance: '2024-10-15', nextMaintenance: '2025-01-15', runningHours: 1250 },
            { wcId: 'T-02', name: 'Trạm bê tông nhựa nóng', sector: 'Bê tông nhựa nóng', health: 45, criticality: 'high', sensor: 'TEMP-02', uptime: '85%', lastMaintenance: '2024-05-20', nextMaintenance: '2025-02-20', runningHours: 3420 },
            { wcId: 'XM-01', name: 'Trạm bê tông xi măng', sector: 'Bê tông xi măng', health: 91, criticality: 'low', sensor: 'PRS-01', uptime: '99%', lastMaintenance: '2024-11-01', nextMaintenance: '2025-03-01', runningHours: 850 }
        ];
    }
    
    const savedLogs = JSON.parse(localStorage.getItem('erp_maintenanceLogs'));
    if (savedLogs && Array.isArray(savedLogs)) {maintenanceLogs = savedLogs;}
} catch (e) { }

const formatValue = (num) => {
    return window.erpApp.formatValue(num);
};

function renderMaintenance() {
    if (window.erpApp && window.erpApp.updateBreadcrumb) {
        window.erpApp.updateBreadcrumb('Sức khỏe Thiết bị', 'Vận hành');
    }

    // Gộp dữ liệu từ các nguồn
    const vehicles = (window.erpApp && window.erpApp._getData ? window.erpApp._getData('vmVehicles') : window.vmVehicles) || [];
    const equipments = (window.erpApp && window.erpApp._getData ? window.erpApp._getData('masterEquipmentRegistry') : window.masterEquipmentRegistry) || [];

    const unifiedAssets = [
        ...assetHealth.map(a => ({
            ...a,
            name: (a.name || 'Thiết bị').replace(/\s*#\d+$/, '')
        })),
        ...vehicles.map(v => ({
            wcId: v.id, name: (v.name || v.brand || 'Xe vận tải').replace(/\s*#\d+$/, ''), sector: 'Vận tải', 
            health: v.health || 85, criticality: (v.health || 85) < 60 ? 'high' : 'medium', 
            sensor: v.licensePlate || 'N/A', uptime: '95%', 
            lastMaintenance: v.lastServiceDate || 'Chưa cập nhật',
            nextMaintenance: v.nextServiceDate || 'Chưa có',
            runningHours: v.runningHours || 0
        })),
        ...equipments.map(e => ({
            wcId: e.code, name: (e.name || 'Máy cơ giới').replace(/\s*#\d+$/, ''), sector: 'Xe cơ giới', 
            health: e.health || 80, criticality: (e.health || 80) < 60 ? 'high' : 'medium', 
            sensor: e.type || 'N/A', uptime: '90%', 
            lastMaintenance: e.lastMaintenanceDate || 'Chưa cập nhật',
            nextMaintenance: e.nextMaintenanceDate || 'Chưa có',
            runningHours: e.runningHours || 0
        }))
    ];

    const filtered = unifiedAssets.filter(a => maintenanceSectorFilter === 'all' || a.sector === maintenanceSectorFilter);
    const criticalCount = unifiedAssets.filter(a => a.health < 60).length;

    const html = `
            <div class="maintenance-module" style="animation: fadeIn 0.4s ease-out; padding-bottom: 40px;">
                <!-- Header & Stats -->
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:20px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('van-hanh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b; letter-spacing:-0.5px;">Sức khỏe Thiết bị & Bảo trì</h2>
                            <p style="margin:2px 0 0 0; font-size:12px; color:#64748b; font-weight:600;">Giám sát tình trạng máy móc sản xuất thời gian thực</p>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:12px;">
                        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:10px 20px; display:flex; align-items:center; gap:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                            <div style="width:40px; height:40px; border-radius:10px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">precision_manufacturing</span>
                            </div>
                            <div>
                                <div style="font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase;">Tổng thiết bị</div>
                                <div style="font-size:18px; font-weight:900; color:#1e293b;">${formatValue(unifiedAssets.length)}</div>
                            </div>
                        </div>
                        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:10px 20px; display:flex; align-items:center; gap:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                            <div style="width:40px; height:40px; border-radius:10px; background:#fef2f2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">error_outline</span>
                            </div>
                            <div>
                                <div style="font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase;">Cảnh báo đỏ</div>
                                <div style="font-size:18px; font-weight:900; color:#ef4444;">${formatValue(criticalCount)}</div>
                            </div>
                        </div>
                        <button onclick="window.erpApp.openMaintenanceOrderModal()" style="padding:12px 24px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                            <span class="material-icons-outlined">build</span> Lệnh Bảo trì mới
                        </button>
                    </div>
                </div>

                <!-- Sector Filters -->
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; background:#fff; padding:12px; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02); overflow-x:auto;">
                    <span style="font-size:12px; font-weight:800; color:#94a3b8; margin-left:8px; text-transform:uppercase; white-space:nowrap;">Lọc theo lĩnh vực:</span>
                    <button onclick="window.erpApp.filterMaintenanceSector('all')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'all' ? 'background:#1e293b; color:#fff; box-shadow:0 4px 12px rgba(30,41,59,0.2);' : 'background:#f8fafc; color:#64748b;'}">Tất cả</button>
                    <button onclick="window.erpApp.filterMaintenanceSector('Bê tông nhựa nóng')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'Bê tông nhựa nóng' ? 'background:#f59e0b; color:#fff; box-shadow:0 4px 12px rgba(245,158,11,0.2);' : 'background:#f8fafc; color:#64748b;'}">Bê tông nhựa nóng</button>
                    <button onclick="window.erpApp.filterMaintenanceSector('Bê tông xi măng')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'Bê tông xi măng' ? 'background:#3b82f6; color:#fff; box-shadow:0 4px 12px rgba(59,130,246,0.2);' : 'background:#f8fafc; color:#64748b;'}">Bê tông xi măng</button>
                    <button onclick="window.erpApp.filterMaintenanceSector('Vận tải')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'Vận tải' ? 'background:#10b981; color:#fff; box-shadow:0 4px 12px rgba(16,185,129,0.2);' : 'background:#f8fafc; color:#64748b;'}">Vận tải (Xe)</button>
                    <button onclick="window.erpApp.filterMaintenanceSector('Xe cơ giới')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'Xe cơ giới' ? 'background:#ef4444; color:#fff; box-shadow:0 4px 12px rgba(239,68,68,0.2);' : 'background:#f8fafc; color:#64748b;'}">Xe cơ giới (Máy)</button>
                    <button onclick="window.erpApp.filterMaintenanceSector('Lĩnh vực khác')" style="padding:10px 20px; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; ${maintenanceSectorFilter === 'Lĩnh vực khác' ? 'background:#8b5cf6; color:#fff; box-shadow:0 4px 12px rgba(139,92,246,0.2);' : 'background:#f8fafc; color:#64748b;'}">Lĩnh vực khác</button>
                </div>

                <!-- Asset Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:24px; margin-bottom:40px;">
                    ${filtered.length === 0 ? `
                        <div style="grid-column:1/-1; text-align:center; padding:100px; background:#fff; border-radius:24px; border:2px dashed #e2e8f0;">
                            <span class="material-icons-outlined" style="font-size:64px; color:#cbd5e1; margin-bottom:16px;">precision_manufacturing</span>
                            <div style="color:#64748b; font-size:16px; font-weight:600;">Không có thiết bị nào trong lĩnh vực này</div>
                        </div>
                    ` : filtered.map(asset => {
        const color = asset.health > 85 ? '#10b981' : (asset.health > 60 ? '#f59e0b' : '#ef4444');
        const sectorColors = {
            'Bê tông nhựa nóng': '#f59e0b',
            'Bê tông xi măng': '#3b82f6',
            'Vận tải': '#10b981',
            'Xe cơ giới': '#ef4444',
            'Lĩnh vực khác': '#8b5cf6'
        };
        const sectorColor = sectorColors[asset.sector] || '#64748b';
        const isCritical = asset.health < 60;

        return `
                        <div class="asset-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.04); transition:all 0.3s; cursor:pointer; position:relative; overflow:hidden;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='${sectorColor}';" onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0';">
                            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:${sectorColor}"></div>
                            
                            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px;">
                                <div>
                                    <span style="background:${sectorColor}15; color:${sectorColor}; padding:4px 10px; border-radius:8px; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;">${asset.sector}</span>
                                    <div style="font-size:12px; font-weight:900; color:#1e293b; margin-top:10px;">${asset.wcId}</div>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                                    <span style="background:${color}15; color:${color}; padding:6px 12px; border-radius:30px; font-size:10px; font-weight:900; border:1px solid ${color}30; letter-spacing:0.5px;">${asset.criticality.toUpperCase()}</span>
                                    ${asset.sensor ? `<span style="font-size:9px; color:#64748b; font-weight:800; background:#f1f5f9; padding:2px 6px; border-radius:4px;">IOT: ${asset.sensor}</span>` : ''}
                                </div>
                            </div>

                            <h3 style="margin:0 0 20px 0; font-size:17px; font-weight:900; color:#1e293b; line-height:1.3;">${asset.name}</h3>
                            
                            <div style="background:#f8fafc; border-radius:16px; padding:16px; margin-bottom:20px; border:1px solid #f1f5f9;">
                                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:900; margin-bottom:8px; letter-spacing:0.5px;">
                                    <span style="color:#64748b;">CHỈ SỐ SỨC KHỎE (HEALTH)</span>
                                    <span style="color:${color}">${asset.health}%</span>
                                </div>
                                <div style="height:10px; background:#e2e8f0; border-radius:10px; overflow:hidden; position:relative;">
                                    <div style="width:${asset.health}%; height:100%; background:${color}; border-radius:10px; transition:width 1s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
                                    ${isCritical ? '<div class="critical-pulse" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(239,68,68,0.2); animation: pulse 1.5s infinite;"></div>' : ''}
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; font-size:13px;">
                                <div style="background:#f1f5f940; padding:12px; border-radius:12px;">
                                    <div style="color:#94a3b8; font-weight:800; font-size:9px; margin-bottom:4px; text-transform:uppercase;">Giờ vận hành</div>
                                    <div style="font-weight:900; color:#475569;">${formatValue(asset.runningHours)} hrs</div>
                                </div>
                                <div style="background:#f1f5f940; padding:12px; border-radius:12px;">
                                    <div style="color:#94a3b8; font-weight:800; font-size:9px; margin-bottom:4px; text-transform:uppercase;">Kế hoạch tiếp</div>
                                    <div style="font-weight:900; color:#1e293b; display:flex; align-items:center; gap:4px;">
                                        ${asset.nextMaintenance || 'Chưa có'}
                                        ${isCritical ? '<span class="material-icons-outlined" style="font-size:14px; color:#ef4444;">event_busy</span>' : ''}
                                    </div>
                                </div>
                            </div>

                            <div style="margin-top:20px; padding-top:16px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:11px; color:#64748b; font-weight:700;">Lần cuối: <span style="color:#1e293b;">${asset.lastMaintenance}</span></div>
                                <button onclick="window.erpApp.openMaintenanceOrderModal('${asset.wcId}')" style="background:transparent; border:none; color:${sectorColor}; font-weight:800; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:4px;">
                                    Chi tiết <span class="material-icons-outlined" style="font-size:16px;">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        `;
    }).join('')}
                </div>

                <!-- Logs Section -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:32px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:#ef4444;">history</span> Nhật ký Bảo trì & Sửa chữa
                        </h3>
                        <button class="btn-outline" onclick="window.erpApp.exportMaintenanceReport()" style="padding:8px 16px; font-size:12px; border-radius:10px;">Xuất báo cáo</button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Mã lệnh</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Thiết bị / Work Center</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Loại hình</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Kỹ thuật viên</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase; text-align:right;">Chi phí</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Trạng thái</th>
                                    <th style="padding:16px 12px; font-size:11px; font-weight:900; color:#94a3b8; text-transform:uppercase; text-align:center;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${maintenanceLogs.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">Chưa có lịch sử bảo trì</td></tr>' : maintenanceLogs.map(log => `
                                    <tr style="border-bottom:1px solid #f8fafc; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 12px; font-weight:800; color:#4f46e5;">${log.id}</td>
                                        <td style="padding:16px 12px;">
                                            <div style="font-weight:700; color:#1e293b;">${log.wcId}</div>
                                            <div style="font-size:11px; color:#64748b; margin-top:2px;">${log.date}</div>
                                        </td>
                                        <td style="padding:16px 12px; font-weight:600;"><span style="background:#f1f5f9; color:#475569; padding:6px 12px; border-radius:8px; font-size:11px; border:1px solid #e2e8f0;">${log.type}</span></td>
                                        <td style="padding:16px 12px; font-weight:700; color:#475569;">${log.technician}</td>
                                        <td style="padding:16px 12px; font-weight:900; color:#1e293b; text-align:right; font-size:15px;">${formatValue(log.cost)} đ</td>
                                        <td style="padding:16px 12px;">
                                            <span style="padding:6px 14px; border-radius:30px; font-size:10px; font-weight:900; background:${log.status === 'completed' ? '#dcfce7' : '#fef9c3'}; color:${log.status === 'completed' ? '#16a34a' : '#a16207'}; display:inline-flex; align-items:center; gap:6px;">
                                                <span style="width:6px; height:6px; border-radius:50%; background:${log.status === 'completed' ? '#16a34a' : '#a16207'};"></span>
                                                ${log.status === 'completed' ? 'HOÀN THÀNH' : 'ĐANG XỬ LÝ'}
                                            </span>
                                        </td>
                                        <td style="padding:16px 12px; text-align:center;">
                                            <div style="display:flex; gap:8px; justify-content:center;">
                                                <button onclick="window.erpApp.editMaintenanceOrder('${log.id}')" title="Sửa" style="width:32px; height:32px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#f59e0b; transition:all 0.2s;" onmouseover="this.style.background='#fffbeb'; this.style.borderColor='#f59e0b';" onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0';">
                                                    <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                                                </button>
                                                <button onclick="window.erpApp.deleteMaintenanceOrder('${log.id}')" title="Xóa" style="width:32px; height:32px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#ef4444; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'; this.style.borderColor='#ef4444';" onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0';">
                                                    <span class="material-icons-outlined" style="font-size:16px;">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { opacity: 0.2; }
                    50% { opacity: 0.5; }
                    100% { opacity: 0.2; }
                }
            </style>
        `;
    pageContent.innerHTML = html;
    pageContent.scrollTop = 0;
}

window.erpApp.filterMaintenanceSector = function (sector) {
    maintenanceSectorFilter = sector;
    renderMaintenance();
};

window.erpApp.openMaintenanceOrderModal = function (preselectedWcId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'mtModal';

    const vehicles = (window.erpApp && window.erpApp._getData ? window.erpApp._getData('vmVehicles') : window.vmVehicles) || [];
    const equipments = (window.erpApp && window.erpApp._getData ? window.erpApp._getData('masterEquipmentRegistry') : window.masterEquipmentRegistry) || [];

    const assetOptions = assetHealth.map(a => `<option value="${a.wcId}" ${preselectedWcId === a.wcId ? 'selected' : ''}>${(a.name || '').replace(/\s*#\d+$/, '')} (${a.wcId})</option>`).join('');
    const vehicleOptions = vehicles.map(v => `<option value="${v.id}" ${preselectedWcId === v.id ? 'selected' : ''}>${(v.name || v.brand || 'Xe').replace(/\s*#\d+$/, '')} (${v.licensePlate || v.id})</option>`).join('');
    const equipOptions = equipments.map(e => `<option value="${e.code}" ${preselectedWcId === e.code ? 'selected' : ''}>${(e.name || '').replace(/\s*#\d+$/, '')} (${e.code})</option>`).join('');

    const employees = window.employees || [];
    const technicianOptions = employees.map(e => `<option value="${e.name}">${e.name} (${e.id} - ${e.department || 'KT'})</option>`).join('');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 560px; border-radius:28px;">
            <div class="modal-header" style="background:linear-gradient(90deg, #ef4444, #dc2626); color:#fff; border-bottom:0; padding:24px 32px;">
                <div style="display:flex; align-items:center; gap:16px;">
                    <div style="width:48px; height:48px; background:rgba(255,255,255,0.2); border-radius:14px; display:flex; align-items:center; justify-content:center;">
                        <span class="material-icons-outlined" style="font-size:28px;">build_circle</span>
                    </div>
                    <div>
                        <h2 style="margin:0; color:#fff; font-size:20px; font-weight:900;">Lệnh Bảo trì & Sửa chữa</h2>
                        <p style="margin:0; color:rgba(255,255,255,0.7); font-size:12px; font-weight:600;">Khởi tạo phiếu yêu cầu kỹ thuật</p>
                    </div>
                </div>
                <button class="modal-close-btn" onclick="document.getElementById('mtModal').remove()" style="background:rgba(255,255,255,0.1); color:#fff;"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body" style="background: #f8fafc; padding: 32px;">
                <div class="premium-card" style="display:grid; gap:20px; background:#fff; padding:24px; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Thiết bị / Work Center yêu cầu <span style="color:#ef4444">*</span></label>
                        <select id="mtWcId" class="form-control" style="font-weight:700; color:#1e293b; height:48px; border-radius:12px; background:#f1f5f9; border:none;">
                            ${assetOptions ? `<optgroup label="Sức khỏe Thiết bị">${assetOptions}</optgroup>` : ''}
                            ${vehicleOptions ? `<optgroup label="Quản lý xe">${vehicleOptions}</optgroup>` : ''}
                            ${equipOptions ? `<optgroup label="Quản lý thiết bị cơ giới">${equipOptions}</optgroup>` : ''}
                        </select>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div class="form-group" style="margin-bottom:0;">
                            <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase;">Loại hình</label>
                            <select id="mtType" class="form-control" style="font-weight:700; height:48px; border-radius:12px;">
                                <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
                                <option value="Sửa chữa đột xuất">Sửa chữa đột xuất</option>
                                <option value="Thay thế linh kiện">Thay thế linh kiện</option>
                                <option value="Nâng cấp hệ thống">Nâng cấp hệ thống</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase;">Dự toán chi phí (VNĐ)</label>
                            <input type="text" id="mtCost" class="form-control" placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="font-weight:900; text-align:right; color:#ef4444; height:48px; border-radius:12px; font-size:16px;">
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase;">Phân công kỹ thuật xử lý</label>
                        <select id="mtTechnician" class="form-control" style="font-weight:700; height:48px; border-radius:12px; background:#f1f5f9; border:none; width:100%;" onchange="window.erpApp.toggleExternalTechInput(this.value)">
                            <option value="Chờ phân công">-- Để trống nếu chưa phân công --</option>
                            <option value="external_tech" style="color:#ef4444; font-weight:800;">[+] Thuê ngoài (Nhập tay)</option>
                            <optgroup label="Nhân sự nội bộ">
                                ${technicianOptions}
                            </optgroup>
                        </select>
                        <input type="text" id="mtExternalTechName" placeholder="Tên đơn vị/Thợ thuê ngoài..." style="display:none; margin-top:10px; font-weight:700; height:44px; border-radius:10px; border:1.5px dashed #ef4444; padding:0 15px; width:100%; background:#fff5f5;">
                    </div>
                    
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase;">Mô tả tình trạng & Nội dung xử lý</label>
                        <textarea id="mtDesc" class="form-control" style="min-height:100px; resize:vertical; border-radius:12px; padding:15px; line-height:1.6;" placeholder="Ví dụ: Máy phát ra tiếng kêu lạ tại cụm sàng, cần kiểm tra vòng bi..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding:24px 32px; background:#fff; border-top:1px solid #f1f5f9; border-radius:0 0 28px 28px;">
                <button type="button" class="btn-cancel" onclick="document.getElementById('mtModal').remove()" style="padding:12px 24px; border-radius:14px; font-weight:800; border:1.5px solid #e2e8f0; background:#fff; color:#64748b;">Hủy bỏ</button>
                <button type="button" class="btn-save" onclick="window.erpApp.saveMaintenanceOrder()" style="padding:12px 32px; border-radius:14px; font-weight:800; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border:none; color:#fff; display:flex; align-items:center; gap:10px; box-shadow:0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                    <span class="material-icons-outlined">send</span> Gửi Lệnh & Thông báo
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.erpApp.saveMaintenanceOrder = async function () {
    const wcId = document.getElementById('mtWcId').value;
    const type = document.getElementById('mtType').value;
    let technician = document.getElementById('mtTechnician').value;
    const externalTech = document.getElementById('mtExternalTechName').value.trim();
    
    if (technician === 'external_tech') {
        technician = externalTech ? `[TN] ${externalTech}` : 'Thuê ngoài (Chưa rõ tên)';
    }

    const cost = window.erpApp.parseVND(document.getElementById('mtCost').value);
    const desc = document.getElementById('mtDesc').value;

    const order = {
        id: 'MT-' + Date.now().toString().slice(-4),
        wcId, type, cost, desc,
        technician,
        status: technician === 'Chờ phân công' ? 'pending' : 'processing',
        date: new Date().toISOString().split('T')[0]
    };

    maintenanceLogs.unshift(order);
    localStorage.setItem('erp_maintenanceLogs', JSON.stringify(maintenanceLogs));
    
    if (window.CrudSync && window.CrudSync.saveItem) {
        await window.CrudSync.saveItem('erp_maintenanceLogs', order, 'id');
    }

    if (window.erpApp.notifyCRUD) {
        window.erpApp.notifyCRUD('Lệnh bảo trì', 'add', {
            id: order.id,
            name: order.wcId,
            page: 'van-hanh',
            module: 'Bảo trì'
        });
    }

    const asset = assetHealth.find(a => a.wcId === wcId);
    if (asset && asset.health < 50) {
        asset.criticality = 'High';
        localStorage.setItem('erp_assetHealth', JSON.stringify(assetHealth));
        if (window.CrudSync && window.CrudSync.saveItem) {
            await window.CrudSync.saveItem('erp_assetHealth', asset, 'wcId');
        }
    }

    if (window.workCenters && Array.isArray(window.workCenters)) {
        const wc = window.workCenters.find(w => w.id === wcId || w.name === wcId);
        if (wc) {
            wc.status = 'maintenance';
            localStorage.setItem('erp_workCenters', JSON.stringify(window.workCenters));
            if (window.CrudSync && window.CrudSync.saveItem) {
                await window.CrudSync.saveItem('erp_workCenters', wc, 'id');
            }
        }
    }

    if (document.getElementById('mtModal')) {document.getElementById('mtModal').remove();}
    renderMaintenance();
};

window.erpApp.exportMaintenanceReport = function() {
    if (maintenanceLogs.length === 0) {
        window.erpApp.showToast('Không có dữ liệu nhật ký để xuất báo cáo!', 'warning');
        return;
    }

    window.erpApp.showToast('Đang khởi tạo báo cáo bảo trì...', 'info');

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.background = '#fff';
    container.style.color = '#000';
    container.style.fontFamily = '\'Times New Roman\', Times, serif';
    container.style.fontSize = '11pt';
    container.style.lineHeight = '1.5';

    const dateNow = new Date();
    const dateStr = `Ngày ${dateNow.getDate()} tháng ${dateNow.getMonth() + 1} năm ${dateNow.getFullYear()}`;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="text-align: center; width: 45%;">
                <div style="font-weight: bold; text-transform: uppercase;">VIETBACHCORP</div>
                <div style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px;">BỘ PHẬN KỸ THUẬT - SẢN XUẤT</div>
            </div>
            <div style="text-align: center; width: 50%;">
                <div style="font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style="font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
                <div style="border-bottom: 1px solid #000; width: 150px; margin: 5px auto;"></div>
                <div style="font-style: italic; font-size: 10pt; margin-top: 5px;">Hà Nội, ${dateStr}</div>
            </div>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 16pt; text-transform: uppercase; margin-bottom: 5px;">BÁO CÁO TỔNG HỢP BẢO TRÌ & SỬA CHỮA THIẾT BỊ</h1>
            <div style="font-style: italic; font-size: 10pt;">Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 10pt;">
            <thead>
                <tr style="background-color: #f2f2f2; text-align: center;">
                    <th style="border: 1px solid #000; padding: 8px; width: 40px;">STT</th>
                    <th style="border: 1px solid #000; padding: 8px; width: 80px;">Mã lệnh</th>
                    <th style="border: 1px solid #000; padding: 8px; width: 100px;">Ngày thực hiện</th>
                    <th style="border: 1px solid #000; padding: 8px;">Thiết bị / Nội dung</th>
                    <th style="border: 1px solid #000; padding: 8px; width: 100px;">Kỹ thuật viên</th>
                    <th style="border: 1px solid #000; padding: 8px; width: 100px;">Chi phí (VNĐ)</th>
                    <th style="border: 1px solid #000; padding: 8px; width: 90px;">Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                ${maintenanceLogs.map((log, idx) => `
                    <tr>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${idx + 1}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${log.id}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${log.date}</td>
                        <td style="border: 1px solid #000; padding: 8px;">
                            <strong>${log.wcId}</strong><br/>
                            <span style="font-size: 9pt; color: #444;">Loại: ${log.type}</span><br/>
                            <span style="font-size: 9pt; font-style: italic;">${log.desc || ''}</span>
                        </td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${log.technician}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatValue(log.cost)}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 9pt;">
                            ${log.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="font-weight: bold; background-color: #f9f9f9;">
                    <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: right;">TỔNG CỘNG</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatValue(maintenanceLogs.reduce((sum, l) => sum + l.cost, 0))}</td>
                    <td style="border: 1px solid #000; padding: 8px;"></td>
                </tr>
            </tfoot>
        </table>

        <div style="display: flex; justify-content: space-around; margin-top: 50px; text-align: center;">
            <div style="width: 40%;">
                <div style="font-weight: bold; margin-bottom: 80px;">NGƯỜI LẬP BÁO CÁO</div>
                <div style="font-style: italic;">(Ký và ghi rõ họ tên)</div>
            </div>
            <div style="width: 40%;">
                <div style="font-weight: bold; margin-bottom: 80px;">TRƯỞNG BỘ PHẬN</div>
                <div style="font-style: italic;">(Ký và ghi rõ họ tên)</div>
            </div>
        </div>

        <div style="margin-top: 60px; font-size: 8pt; color: #666; border-top: 1px dashed #ccc; padding-top: 10px; text-align: center;">
            Tài liệu nội bộ VIETBACH-ERP - Trích xuất tự động từ hệ thống quản lý sản xuất
        </div>
    `;

    document.body.appendChild(container);

    const opt = {
        margin:       0.5,
        filename:     `Bao-cao-bao-tri-${dateNow.getFullYear()}${String(dateNow.getMonth()+1).padStart(2,'0')}${String(dateNow.getDate()).padStart(2,'0')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
        window.erpApp.showToast('Đã tải xuống báo cáo bảo trì thành công!', 'success');
    }).catch(err => {
        console.error('Maintenance Export Error:', err);
        window.erpApp.showToast('Lỗi khi xuất PDF!', 'error');
        document.body.removeChild(container);
    });
};

window.erpApp.editMaintenanceOrder = function (id) {
    const log = maintenanceLogs.find(l => l.id === id);
    if (!log) { return; }

    window.erpApp.openMaintenanceOrderModal(log.wcId);
    
    // Customize modal for editing
    const modal = document.getElementById('mtModal');
    if (!modal) return;
    
    modal.querySelector('h2').textContent = 'Chỉnh sửa Lệnh Bảo trì';
    modal.querySelector('p').textContent = `Đang cập nhật mã lệnh: ${log.id}`;
    
    document.getElementById('mtType').value = log.type || 'Bảo trì định kỳ';
    document.getElementById('mtCost').value = formatValue(log.cost || 0);
    
    // Handle Technician Selection
    const techSelect = document.getElementById('mtTechnician');
    const externalInput = document.getElementById('mtExternalTechName');
    
    if (log.technician && log.technician.startsWith('[TN]')) {
        techSelect.value = 'external_tech';
        externalInput.style.display = 'block';
        externalInput.value = log.technician.replace('[TN] ', '');
    } else {
        techSelect.value = log.technician || 'Chờ phân công';
        externalInput.style.display = 'none';
    }

    document.getElementById('mtDesc').value = log.desc || '';

    // Add Status selection for Edit mode
    const techGroup = document.getElementById('mtTechnician').parentElement;
    const statusHtml = `
        <div class="form-group" style="margin-top:16px;">
            <label style="font-weight:800; color:#475569; margin-bottom:10px; display:block; font-size:12px; text-transform:uppercase;">Trạng thái xử lý</label>
            <select id="mtStatus" class="form-control" style="font-weight:700; height:48px; border-radius:12px; background:#fff; border:1.5px solid #e2e8f0; width:100%;">
                <option value="pending" ${log.status === 'pending' ? 'selected' : ''}>Đang chờ (Pending)</option>
                <option value="processing" ${log.status === 'processing' ? 'selected' : ''}>Đang xử lý (Processing)</option>
                <option value="completed" ${log.status === 'completed' ? 'selected' : ''}>Hoàn thành (Completed)</option>
            </select>
        </div>
    `;
    techGroup.insertAdjacentHTML('afterend', statusHtml);
    
    // Change Save button to Update button
    const saveBtn = modal.querySelector('.btn-save');
    saveBtn.innerHTML = '<span class="material-icons-outlined">save</span> Cập nhật thay đổi';
    saveBtn.onclick = () => window.erpApp.saveEditMaintenanceOrder(id);
};

window.erpApp.saveEditMaintenanceOrder = async function (id) {
    const idx = maintenanceLogs.findIndex(l => l.id === id);
    if (idx === -1) return;

    const wcId = document.getElementById('mtWcId').value;
    const type = document.getElementById('mtType').value;
    let technician = document.getElementById('mtTechnician').value;
    const externalTech = document.getElementById('mtExternalTechName').value.trim();
    
    if (technician === 'external_tech') {
        technician = externalTech ? `[TN] ${externalTech}` : 'Thuê ngoài (Chưa rõ tên)';
    }

    const cost = window.erpApp.parseVND(document.getElementById('mtCost').value);
    const desc = document.getElementById('mtDesc').value;
    const status = document.getElementById('mtStatus').value;

    maintenanceLogs[idx] = {
        ...maintenanceLogs[idx],
        wcId, type, cost, desc, technician, status
    };

    localStorage.setItem('erp_maintenanceLogs', JSON.stringify(maintenanceLogs));
    
    if (window.CrudSync && window.CrudSync.saveItem) {
        await window.CrudSync.saveItem('erp_maintenanceLogs', maintenanceLogs[idx], 'id');
    }

    if (document.getElementById('mtModal')) {document.getElementById('mtModal').remove();}
    window.erpApp.showToast('Đã cập nhật lệnh bảo trì thành công!', 'success');
    renderMaintenance();
};

window.erpApp.deleteMaintenanceOrder = function (id) {
    const log = maintenanceLogs.find(l => l.id === id);
    if (!log) return;

    window.erpApp.showDeleteConfirmation(
        `Bạn có chắc chắn muốn xóa lệnh bảo trì <strong>${id}</strong>? Thao tác này không thể hoàn tác.`,
        function() {
            const idx = maintenanceLogs.findIndex(l => l.id === id);
            if (idx !== -1) {
                maintenanceLogs.splice(idx, 1);
                localStorage.setItem('erp_maintenanceLogs', JSON.stringify(maintenanceLogs));
                
                if (window.CrudSync && window.CrudSync.deleteItem) {
                    window.CrudSync.deleteItem('erp_maintenanceLogs', id, 'id');
                }
                
                window.erpApp.showToast('Đã xóa lệnh bảo trì thành công!', 'success');

                // Audit Log
                if (window.erpApp.notifyCRUD) {
                    window.erpApp.notifyCRUD('Lệnh bảo trì', 'delete', {
                        id: id,
                        name: log.wcId,
                        page: 'van-hanh',
                        module: 'Bảo trì'
                    });
                }

                renderMaintenance();
            }
        }
    );
};

window.erpApp.toggleExternalTechInput = function (val) {
    const input = document.getElementById('mtExternalTechName');
    if (!input) return;
    input.style.display = (val === 'external_tech') ? 'block' : 'none';
    if (val === 'external_tech') input.focus();
};

window.erpApp.renderMaintenance = renderMaintenance;
