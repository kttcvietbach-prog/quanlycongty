
// ==========================================
// MODULE: Năng lực sản xuất (Work Centers)
// ==========================================
let wcSearchQuery = '';
let workCenters = [
    {
        id: 'WC-001',
        name: 'Xưởng Cắt Laser 01',
        type: 'Máy móc',
        capacity: 500,
        unit: 'Sản phẩm/Ngày',
        efficiency: 85,
        oee: 78,
        status: 'running' // running, maintenance, idle
    },
    {
        id: 'WC-002',
        name: 'Tổ May Công Nghiệp A2',
        type: 'Con người',
        capacity: 200,
        unit: 'Sản phẩm/Ngày',
        efficiency: 92,
        oee: 88,
        status: 'running'
    },
    {
        id: 'WC-003',
        name: 'Máy In 3D Markforged',
        type: 'Máy móc',
        capacity: 50,
        unit: 'Sản phẩm/Ngày',
        efficiency: 95,
        oee: 65,
        status: 'maintenance'
    }
];
try {
    const savedWCs = JSON.parse(localStorage.getItem('erp_workCenters'));
    if (savedWCs && Array.isArray(savedWCs)) {
        workCenters = savedWCs;
    }
} catch (e) { }

function renderWorkCenters() {
    breadcrumbCurrent.textContent = 'Năng lực sản xuất (Work Centers)';
    pageBadge.textContent = 'Sản xuất';
    const filtered = workCenters.filter(wc =>
        wc.name.toLowerCase().includes(wcSearchQuery.toLowerCase()) ||
        wc.id.toLowerCase().includes(wcSearchQuery.toLowerCase())
    );

    const html = `
            <div class="wc-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;">search</span>
                            <input type="text" placeholder="Tìm tên máy móc, tổ đội..." value="${wcSearchQuery}" 
                                oninput="window.erpApp.handleWcSearch(this.value)"
                                style="width:100%; padding:12px 12px 12px 42px; border:1px solid #e2e8f0; border-radius:14px; outline:none; font-size:14px;">
                        </div>
                    </div>
                    <button onclick="window.erpApp.openWorkCenterModal()" style="padding:12px 24px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                        <span class="material-icons-outlined">precision_manufacturing</span> Thêm Năng lực / Work Center
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:24px;">
                    ${filtered.map(wc => `
                        <div class="wc-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition:all 0.3s; position:relative;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div style="width:10px; height:10px; border-radius:50%; background:${wc.status === 'running' ? '#10b981' : (wc.status === 'maintenance' ? '#ef4444' : '#f59e0b')}; box-shadow:0 0 10px ${wc.status === 'running' ? '#10b981' : (wc.status === 'maintenance' ? '#ef4444' : '#f59e0b')}"></div>
                                    <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:${wc.status === 'running' ? '#059669' : (wc.status === 'maintenance' ? '#dc2626' : '#d97706')}">${wc.status === 'running' ? 'Đang hoạt động' : (wc.status === 'maintenance' ? 'Đang bảo trì' : 'Đang chờ')}</span>
                                </div>
                                <div style="font-size:11px; font-weight:800; color:#94a3b8;">${wc.id}</div>
                            </div>
                            
                            <div style="display:flex; gap:20px;">
                                <div style="flex:1;">
                                    <h3 style="margin:0 0 4px 0; font-size:18px; font-weight:900; color:#1e293b;">${wc.name}</h3>
                                    <div style="font-size:13px; color:#64748b; font-weight:600; margin-bottom:16px;">Loại: ${wc.type}</div>
                                    
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                        <div style="background:#f8fafc; padding:10px; border-radius:12px;">
                                            <div style="font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase;">Công suất</div>
                                            <div style="font-size:14px; font-weight:800; color:#1e293b;">${wc.capacity}</div>
                                            <div style="font-size:9px; color:#64748b; font-weight:600;">${wc.unit}</div>
                                        </div>
                                        <div style="background:#f8fafc; padding:10px; border-radius:12px;">
                                            <div style="font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase;">Hiệu suất</div>
                                            <div style="font-size:14px; font-weight:800; color:#1e293b;">${wc.efficiency}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div style="width:100px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                    <div class="oee-chart" style="width:80px; height:80px; border-radius:50%; background: conic-gradient(#10b981 ${wc.oee * 3.6}deg, #f1f5f9 0deg); display:flex; align-items:center; justify-content:center; position:relative; box-shadow: inset 0 0 10px rgba(0,0,0,0.05);">
                                        <div style="width:60px; height:60px; border-radius:50%; background:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                            <div style="font-size:16px; font-weight:950; color:#1e293b;">${wc.oee}%</div>
                                            <div style="font-size:8px; font-weight:800; color:#94a3b8;">OEE</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:8px;">
                                <button onclick="window.erpApp.openWorkCenterModal('${wc.id}')" style="padding:8px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; color:#64748b; cursor:pointer;" title="Sửa cấu hình">
                                    <span class="material-icons-outlined" style="font-size:18px;">settings</span>
                                </button>
                                <button onclick="window.erpApp.deleteWorkCenter('${wc.id}')" style="padding:8px; border:1px solid #fee2e2; border-radius:10px; background:#fff; color:#ef4444; cursor:pointer;" title="Xóa">
                                    <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    pageContent.innerHTML = html;
}

window.erpApp.handleWcSearch = function (val) {
    wcSearchQuery = val;
    renderWorkCenters();
};

window.erpApp.openWorkCenterModal = function (id = null) {
    const wc = id ? workCenters.find(x => x.id === id) : {
        id: `WC-${Date.now().toString().slice(-4)}`,
        name: '',
        type: 'Máy móc',
        capacity: 100,
        unit: 'Sản phẩm/Ngày',
        efficiency: 90,
        oee: 80,
        status: 'running'
    };

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'wcModal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 560px;">
            <div class="modal-header">
                <h2><span class="material-icons-outlined">precision_manufacturing</span> Cấu hình Năng lực Sản xuất</h2>
                <button class="modal-close-btn" onclick="window.erpApp.closeWcModal()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body" style="background: var(--bg-body); padding: 24px;">
                <div class="premium-card" style="display:grid; gap:16px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>MÃ WC</label>
                            <input type="text" id="wcId" class="form-control" value="${wc.id}" readonly style="background:#f8fafc; color:#94a3b8;">
                        </div>
                        <div class="form-group">
                            <label>TRẠNG THÁI</label>
                            <select id="wcStatus" class="form-control" style="font-weight:700;">
                                <option value="running" ${wc.status === 'running' ? 'selected' : ''}>Hoạt động</option>
                                <option value="maintenance" ${wc.status === 'maintenance' ? 'selected' : ''}>Bảo trì</option>
                                <option value="idle" ${wc.status === 'idle' ? 'selected' : ''}>Đang chờ</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>TÊN MÁY MÓC / TỔ ĐỘI</label>
                        <input type="text" id="wcName" class="form-control" value="${wc.name}" placeholder="VD: Máy Đùn Nhựa A1..." style="font-weight:700;">
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>LOẠI NGUỒN LỰC</label>
                            <select id="wcType" class="form-control">
                                <option value="Máy móc" ${wc.type === 'Máy móc' ? 'selected' : ''}>Máy móc</option>
                                <option value="Con người" ${wc.type === 'Con người' ? 'selected' : ''}>Con người / Tổ đội</option>
                                <option value="Dây chuyền" ${wc.type === 'Dây chuyền' ? 'selected' : ''}>Dây chuyền / Giai đoạn</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ĐƠN VỊ CÔNG SUẤT</label>
                            <input type="text" id="wcUnit" class="form-control" value="${wc.unit}" placeholder="VD: Mét/Giờ...">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>CÔNG SUẤT</label>
                            <input type="number" id="wcCapacity" class="form-control" value="${wc.capacity}" style="font-weight:700; text-align:right;">
                        </div>
                        <div class="form-group">
                            <label>HIỆU SUẤT (%)</label>
                            <input type="number" id="wcEff" class="form-control" value="${wc.efficiency}" style="font-weight:700; text-align:right;">
                        </div>
                        <div class="form-group">
                            <label>CHỈ SỐ OEE (%)</label>
                            <input type="number" id="wcOee" class="form-control" value="${wc.oee}" style="font-weight:700; text-align:right; color:#10b981;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-cancel" onclick="window.erpApp.closeWcModal()">Hủy bỏ</button>
                <button type="button" class="btn-save" onclick="window.erpApp.saveWorkCenter()">Lưu cấu hình WC</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};


window.erpApp.saveWorkCenter = function () {
    const id = document.getElementById('wcId').value;
    const name = document.getElementById('wcName').value;
    if (!name) { showToast('Vui lòng nhập tên nguồn lực!', 'error'); return; }

    const data = {
        id,
        name,
        type: document.getElementById('wcType').value,
        capacity: parseInt(document.getElementById('wcCapacity').value) || 0,
        unit: document.getElementById('wcUnit').value,
        efficiency: parseInt(document.getElementById('wcEff').value) || 0,
        oee: parseInt(document.getElementById('wcOee').value) || 0,
        status: document.getElementById('wcStatus').value
    };

    const idx = workCenters.findIndex(w => w.id === id);
    if (idx > -1) workCenters[idx] = data;
    else workCenters.unshift(data);

    localStorage.setItem('erp_workCenters', JSON.stringify(workCenters));
    showToast('Đã lưu cấu hình Năng lực Sản xuất!');
    window.erpApp.closeWcModal();
    renderWorkCenters();
};

window.erpApp.deleteWorkCenter = function (id) {
    if (confirm(`Xác nhận xóa Năng lực sản xuất ${id}?`)) {
        workCenters = workCenters.filter(w => w.id !== id);
        localStorage.setItem('erp_workCenters', JSON.stringify(workCenters));
        showToast('Đã xóa dữ liệu!');
        renderWorkCenters();
    }
};

window.erpApp.closeWcModal = function () {
    const m = document.getElementById('wcModal');
    if (m) m.remove();
};

window.erpApp.renderWorkCenters = renderWorkCenters;
window.erpApp.workCenters = workCenters;
}) ();
