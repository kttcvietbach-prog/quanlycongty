(function () {
    console.log('✅ MP Logic: Loading Module...');
    'use strict';

    const MP_STORAGE_KEY = 'erp_material_proposals';

    // ==========================================
    // State Management
    // ==========================================
    let propSearchQuery = '';
    let propActiveTab = 'all';
    let isRendering = false; // LOOP GUARD

    let materialProposals = [
        {
            id: 'DX-2026-001',
            requester: 'Nguyễn Văn Hải',
            department: 'Phòng Kỹ thuật',
            date: '2026-04-01',
            reason: 'Thay thế linh kiện bảo trì máy cắt CNC',
            status: 'da_duyet',
            items: [
                { name: 'Lưỡi cắt kim loại 300mm', unit: 'Cái', qty: 5, note: 'Loại thép hợp kim' },
                { name: 'Dầu bôi trơn công nghiệp', unit: 'Lít', qty: 10, note: 'Shell Tellus S2 M 46' }
            ]
        },
        {
            id: 'DX-2026-002',
            requester: 'Trần Thị Thu',
            department: 'Phòng Hành chính',
            date: '2026-04-05',
            reason: 'Văn phòng phẩm quý 2',
            status: 'cho_duyet',
            items: [
                { name: 'Giấy A4 Double A', unit: 'Ram', qty: 20, note: '' },
                { name: 'Mực máy in HP', unit: 'Hộp', qty: 3, note: '' }
            ]
        }
    ];

    // Persistence
    function loadData() {
        try {
            const saved = localStorage.getItem(MP_STORAGE_KEY);
            if (saved) materialProposals = JSON.parse(saved);
        } catch (e) { console.error('MP Logic: Error loading data', e); }
    }

    function saveData() {
        localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(materialProposals));
    }

    // ==========================================
    // Rendering Logic
    // ==========================================
    function renderDashboard() {
        if (isRendering) return; // Prevent loop
        isRendering = true;

        console.log('✅ MP Logic: Rendering Dashboard [Guard Active]');
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            isRendering = false;
            return;
        }

        loadData();

        const filtered = materialProposals.filter(p => {
            const q = propSearchQuery.toLowerCase();
            return p.id.toLowerCase().includes(q) ||
                p.requester.toLowerCase().includes(q) ||
                (p.reason || '').toLowerCase().includes(q);
        }).filter(p => propActiveTab === 'all' || p.status === propActiveTab);

        const stats = {
            total: materialProposals.length,
            pending: materialProposals.filter(x => x.status === 'cho_duyet').length,
            approved: materialProposals.filter(x => x.status === 'da_duyet').length
        };

        const html = `
            <div class="mp-module" style="padding: 24px; animation: fadeInUp 0.4s ease both;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">Phiếu đề xuất vật tư</h1>
                            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Kho vận <span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">chevron_right</span> Nhập xuất kho</div>
                        </div>
                    </div>
                    <button onclick="window.erpApp.openMPModal()" style="padding:10px 24px; background:#3b82f6; color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(59, 130, 246, 0.2);">
                        <span class="material-icons-outlined">add</span> Tạo Đề Xuất Mới
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
                    ${renderStatCard('Tổng đề xuất', stats.total, 'assignment', '#eff6ff', '#3b82f6')}
                    ${renderStatCard('Chờ phê duyệt', stats.pending, 'pending_actions', '#fff7ed', '#f97316')}
                    ${renderStatCard('Đã phê duyệt', stats.approved, 'check_circle', '#f0fdf4', '#22c55e')}
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                    <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                        <div style="display:flex; gap:8px; background:#f1f5f9; padding:4px; border-radius:10px;">
                            ${['all', 'cho_duyet', 'da_duyet'].map(tab => `
                                <button onclick="window.erpApp.setMPTab('${tab}')" 
                                        style="padding:6px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; 
                                        ${propActiveTab === tab ? 'background:#fff; color:#3b82f6; box-shadow:0 2px 8px rgba(0,0,0,0.05);' : 'background:transparent; color:#64748b;'}">
                                    ${tab === 'all' ? 'Tất cả' : (tab === 'cho_duyet' ? 'Chờ duyệt' : 'Đã duyệt')}
                                </button>
                            `).join('')}
                        </div>
                        <div style="position:relative; width:300px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm người đề xuất, mã phiếu..." 
                                value="${propSearchQuery}" 
                                oninput="window.erpApp.onMPSearch(this.value)"
                                style="width:100%; padding:8px 12px 8px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none;">
                        </div>
                    </div>

                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">MÃ PHIẾU / NGÀY</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">NGƯỜI ĐỀ XUẤT</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">LÝ DO</th>
                                    <th style="padding:14px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b;">TRẠNG THÁI</th>
                                    <th style="padding:14px 20px; text-align:right; font-size:12px; font-weight:700; color:#64748b;">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.length === 0 ? `<tr><td colspan="5" style="padding:40px; text-align:center; color:#94a3b8;">Không có dữ liệu.</td></tr>` : 
                                  filtered.map(p => `
                                    <tr onclick="window.erpApp.viewMPDetail('${p.id}')" style="border-bottom:1px solid #f1f5f9; cursor:pointer;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 20px;"><div style="font-weight:700; color:#3b82f6;">${p.id}</div><div style="font-size:11px; color:#94a3b8;">${p.date}</div></td>
                                        <td style="padding:16px 20px;"><div style="font-weight:600; color:#1e293b;">${p.requester}</div><div style="font-size:11px; color:#64748b;">${p.department}</div></td>
                                        <td style="padding:16px 20px;"><div style="font-size:13px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${p.reason}</div></td>
                                        <td style="padding:16px 20px; text-align:center;">${getStatusLabel(p.status)}</td>
                                        <td style="padding:16px 20px; text-align:right;" onclick="event.stopPropagation()">
                                            <span class="material-icons-outlined" onclick="window.erpApp.openMPModal('${p.id}')" style="font-size:18px; color:#64748b; cursor:pointer; margin-right:12px;">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.deleteMP('${p.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;">delete</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
        isRendering = false; // Reset guard

        // Maintain cursor for search
        if (propSearchQuery) {
            const input = pageContent.querySelector('input[type="text"]');
            if (input) { input.focus(); input.setSelectionRange(propSearchQuery.length, propSearchQuery.length); }
        }
    }

    function renderStatCard(label, value, icon, bg, color) {
        return `
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px;">
                <div style="width:48px; height:48px; border-radius:12px; background:${bg}; color:${color}; display:flex; align-items:center; justify-content:center;">
                    <span class="material-icons-outlined">${icon}</span>
                </div>
                <div>
                    <div style="font-size:24px; font-weight:800; color:#1e293b;">${value}</div>
                    <div style="font-size:13px; color:#64748b; font-weight:500;">${label}</div>
                </div>
            </div>
        `;
    }

    function getStatusLabel(status) {
        const m = {
            'nhap': { label: 'Nháp', bg: '#f1f5f9', text: '#64748b' },
            'cho_duyet': { label: 'Chờ duyệt', bg: '#fff7ed', text: '#f97316' },
            'da_duyet': { label: 'Đã duyệt', bg: '#f0fdf4', text: '#22c55e' },
            'tu_choi': { label: 'Từ chối', bg: '#fef2f2', text: '#ef4444' }
        };
        const c = m[status] || m.cho_duyet;
        return `<span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background:${c.bg}; color:${c.text};">${c.label}</span>`;
    }

    // ==========================================
    // Interaction Handlers
    // ==========================================
    const initMPModule = () => {
        if (!window.erpApp) return;

        window.erpApp.renderPhieuDeXuatVatTu = renderDashboard;

        window.erpApp.setMPTab = (tab) => { propActiveTab = tab; renderDashboard(); };
        window.erpApp.onMPSearch = (val) => { propSearchQuery = val; renderDashboard(); };

        window.erpApp.openMPModal = (id = null) => {
            const isEdit = !!id;
            const p = isEdit ? materialProposals.find(x => x.id === id) : {
                id: 'DX-' + Date.now().toString().slice(-4),
                requester: JSON.parse(sessionStorage.getItem('erp_user'))?.fullName || 'Người dùng',
                department: 'Phòng Kho',
                date: new Date().toISOString().split('T')[0],
                reason: '',
                status: 'cho_duyet',
                items: [{ name: '', unit: 'Cái', qty: 1, note: '' }]
            };

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
            overlay.id = 'mpModalOverlay';

            overlay.innerHTML = `
                <div style="background:#fff; border-radius:20px; width:95%; max-width:800px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                    <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:700; color:#1e293b;">${isEdit ? 'Sửa' : 'Tạo'} Phiếu đề xuất vật tư</h2>
                        <span class="material-icons-outlined" onclick="document.getElementById('mpModalOverlay').remove()" style="cursor:pointer; color:#94a3b8;">close</span>
                    </div>
                    <div style="padding:24px; overflow-y:auto; background:#f8fafc;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                            <div><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Người đề xuất</label><input type="text" id="mpr-name" value="${p.requester}" style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none;"></div>
                            <div><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Ngày lập</label><input type="date" id="mpr-date" value="${p.date}" style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none;"></div>
                        </div>
                        <div style="margin-bottom:20px;"><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Lý do / Mô tả</label><textarea id="mpr-reason" style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; height:60px; resize:none;">${p.reason}</textarea></div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <h3 style="margin:0; font-size:14px; color:#475569;">Danh sách vật tư</h3>
                            <button onclick="window.erpApp.addMPRow()" style="background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">+ Thêm dòng</button>
                        </div>
                        <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #e2e8f0; border-radius:8px;">
                            <thead><tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;"><th style="padding:10px; text-align:left; font-size:11px;">Tên vật tư</th><th style="padding:10px; text-align:center; font-size:11px; width:60px;">ĐVT</th><th style="padding:10px; text-align:center; font-size:11px; width:80px;">SL</th><th style="padding:10px; text-align:center; font-size:11px; width:40px;"></th></tr></thead>
                            <tbody id="mpModalBody">
                                ${p.items.map(it => `
                                    <tr style="border-bottom:1px solid #f1f5f9;">
                                        <td style="padding:8px;"><input type="text" value="${it.name}" class="it-name" style="width:100%; border:none; outline:none; font-size:13px;"></td>
                                        <td style="padding:8px;"><input type="text" value="${it.unit}" class="it-unit" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td>
                                        <td style="padding:8px;"><input type="number" value="${it.qty}" class="it-qty" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td>
                                        <td style="padding:8px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove()" style="color:#ef4444; font-size:18px; cursor:pointer;">delete</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button onclick="document.getElementById('mpModalOverlay').remove()" style="padding:10px 20px; border:1px solid #e2e8f0; background:none; border-radius:10px; cursor:pointer; font-weight:600;">Hủy</button>
                        <button onclick="window.erpApp.saveMP('${p.id}')" style="padding:10px 24px; background:#3b82f6; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:700;">Lưu phiếu</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        };

        window.erpApp.addMPRow = () => {
            const tbody = document.getElementById('mpModalBody');
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.innerHTML = `<td style="padding:8px;"><input type="text" class="it-name" style="width:100%; border:none; outline:none; font-size:13px;"></td><td style="padding:8px;"><input type="text" value="Cái" class="it-unit" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td><td style="padding:8px;"><input type="number" value="1" class="it-qty" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td><td style="padding:8px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove()" style="color:#ef4444; font-size:18px; cursor:pointer;">delete</span></td>`;
            tbody.appendChild(tr);
        };

        window.erpApp.saveMP = (id) => {
            const rows = document.querySelectorAll('#mpModalBody tr');
            const items = Array.from(rows).map(r => ({
                name: r.querySelector('.it-name').value,
                unit: r.querySelector('.it-unit').value,
                qty: parseFloat(r.querySelector('.it-qty').value) || 0
            })).filter(it => it.name);

            const newP = {
                id: id,
                requester: document.getElementById('mpr-name').value,
                date: document.getElementById('mpr-date').value,
                reason: document.getElementById('mpr-reason').value,
                status: 'cho_duyet',
                items: items
            };

            const idx = materialProposals.findIndex(x => x.id === id);
            if (idx > -1) materialProposals[idx] = newP; else materialProposals.unshift(newP);

            saveData();
            document.getElementById('mpModalOverlay').remove();
            renderDashboard();
            window.erpApp.showToast('Đã lưu phiếu đề xuất');
        };

        window.erpApp.deleteMP = (id) => {
            if (confirm('Xóa phiếu này?')) {
                materialProposals = materialProposals.filter(x => x.id !== id);
                saveData();
                renderDashboard();
            }
        };

        window.erpApp.viewMPDetail = (id) => {
            const p = materialProposals.find(x => x.id === id);
            if (!p) return;
            // Detail logic here...
            window.erpApp.openMPModal(id);
        };
    };

    // Safe Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMPModule);
    } else {
        initMPModule();
    }

    console.log('✅ MP Logic: Loaded and Ready.');
})();
