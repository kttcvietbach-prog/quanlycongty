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
            projectId: 'DA-2026-001',
            projectName: 'Dự án Alpha - Xây dựng nhà máy thép',
            requester: 'Nguyễn Văn Hải',
            department: 'Phòng Kỹ thuật',
            date: '2026-04-01',
            reason: 'Thay thế linh kiện bảo trì máy cắt CNC',
            status: 'da_duyet',
            items: [
                { name: 'Thép cuộn CB300', unit: 'kg', qty: 500, note: 'Nhập kho dự án' },
                { name: 'Dầu bôi trơn công nghiệp', unit: 'Lít', qty: 10, note: 'Shell Tellus S2 M 46' }
            ]
        },
        {
            id: 'DX-2026-002',
            projectId: 'DA-2026-002',
            projectName: 'Dự án Beta - Lắp đặt hệ thống M&E',
            requester: 'Trần Thị Thu',
            department: 'Phòng Hành chính',
            date: '2026-04-05',
            reason: 'Vật tư thi công hệ thống điện tầng 5',
            status: 'cho_duyet',
            items: [
                { name: 'Dây cáp điện CADIVI', unit: 'Cuộn', qty: 20, note: '' },
                { name: 'Ống nhựa PVC D90', unit: 'ống', qty: 30, note: '' }
            ]
        }
    ];

    // Persistence
    function saveData() {
        // No longer using localStorage as primary, but keep for offline fallback if desired
        // localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(materialProposals));
    }

    function loadData() {
        // Data will be loaded via SyncManager
    }

    // Export internal helpers for SyncManager (called via app.js)
    window.erpApp.mp_getData = () => materialProposals;
    window.erpApp.mp_setData = (data) => {
        materialProposals = data;
        if (window.erpApp.getCurrentPage() === 'phié-u-?-é-xu??t-v??t-t??') {
             window.erpApp.renderMaterialProposal();
        }
    };

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
                                        <td style="padding:16px 20px;"><div style="font-weight:600; color:#1e293b;">${p.requester}</div><div style="font-size:11px; color:#64748b;">${p.projectName || 'Dự án chung'}</div></td>
                                        <td style="padding:16px 20px;"><div style="font-size:13px; color:#475569; font-weight:500;">${p.reason}</div><div style="font-size:11px; color:#94a3b8;">${p.items?.length || 0} mặt hàng</div></td>
                                        <td style="padding:16px 20px; text-align:center;">${getStatusLabel(p.status)}</td>
                                        <td style="padding:16px 20px; text-align:right;" onclick="event.stopPropagation()">
                                            <span class="material-icons-outlined" onclick="window.erpApp.printMP('${p.id}')" style="font-size:18px; color:#3b82f6; cursor:pointer; margin-right:12px;" title="In phiếu">print</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.openMPModal('${p.id}')" style="font-size:18px; color:#1e293b; cursor:pointer; margin-right:12px;" title="Sửa">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.deleteMP('${p.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;" title="Xóa">delete</span>
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
                projectId: '',
                date: new Date().toISOString().split('T')[0],
                reason: '',
                status: 'cho_duyet',
                items: [{ name: '', unit: 'Cái', qty: 1, note: '' }]
            };

            const goodsList = window.erpApp.getDanhSachHangHoa ? window.erpApp.getDanhSachHangHoa() : [];
            const projects = window.erpApp.getDanhSachDuAn ? window.erpApp.getDanhSachDuAn() : [];

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(15, 23, 42, 0.7); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);';
            overlay.id = 'mpModalOverlay';

            overlay.innerHTML = `
                <div style="background:#fff; border-radius:24px; width:95%; max-width:900px; max-height:92vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1);">
                    <div style="padding:20px 28px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                        <div>
                            <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; letter-spacing:-0.5px;">${isEdit ? 'Cập nhật' : 'Tạo'} Phiếu đề xuất vật tư</h2>
                            <div style="font-size:12px; color:#64748b; font-weight:600; margin-top:2px;">Mã phiếu: <span style="color:#3b82f6;">${p.id}</span></div>
                        </div>
                        <button onclick="document.getElementById('mpModalOverlay').remove()" style="width:36px; height:36px; border-radius:10px; border:none; background:#f1f5f9; color:#64748b; cursor:pointer; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="padding:28px; overflow-y:auto; background:#f8fafc;">
                        <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:20px; margin-bottom:24px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Dự án / Công trình <span style="color:#ef4444;">*</span></label>
                                <select id="mpr-project" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; color:#1e293b; outline:none; background:#fff; transition:all 0.2s;">
                                    <option value="">-- Chọn dự án --</option>
                                    ${projects.map(proj => `<option value="${proj.id}" ${p.projectId === proj.id ? 'selected' : ''}>${proj.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Người đề xuất</label>
                                <input type="text" id="mpr-name" value="${p.requester}" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; color:#1e293b; outline:none; background:#fff;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Ngày đề xuất</label>
                                <input type="date" id="mpr-date" value="${p.date}" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; color:#1e293b; outline:none; background:#fff;">
                            </div>
                        </div>
                        
                        <div style="margin-bottom:24px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Lý do đề xuất / Mục đích sử dụng</label>
                            <textarea id="mpr-reason" placeholder="Nhập lý do chi tiết..." style="width:100%; padding:14px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:600; color:#1e293b; outline:none; height:70px; resize:none; background:#fff; font-size:14px;">${p.reason}</textarea>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <h3 style="margin:0; font-size:15px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:8px;">
                                <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">inventory_2</span> Danh sách vật tư đề xuất
                            </h3>
                            <button onclick="window.erpApp.addMPRow()" style="padding:8px 16px; background:#fff; border:1.5px solid #e2e8f0; color:#3b82f6; border-radius:10px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#3b82f6'" onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0'">
                                <span class="material-icons-outlined" style="font-size:16px">add</span> Thêm vật tư
                            </button>
                        </div>
                        
                        <div style="background:#fff; border:1.5px solid #e2e8f0; border-radius:18px; overflow:hidden;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="background:#f1f5f9; border-bottom:1.5px solid #e2e8f0;">
                                        <th style="padding:12px 16px; text-align:left; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase;">Vật tư / Sản phẩm (Dữ liệu gốc)</th>
                                        <th style="padding:12px 16px; text-align:center; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; width:80px;">ĐVT</th>
                                        <th style="padding:12px 16px; text-align:center; font-size:11px; font-weight:850; color:#3b10b9; text-transform:uppercase; width:120px;">SL Tồn Kho</th>
                                        <th style="padding:12px 16px; text-align:center; font-size:11px; font-weight:850; color:#1e293b; text-transform:uppercase; width:140px;">SL Đề xuất</th>
                                        <th style="padding:12px 16px; text-align:center; width:50px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="mpModalBody">
                                    ${p.items.map((it, idx) => {
                                        const stockList = window.erpApp.getCurrentStockList ? window.erpApp.getCurrentStockList() : {};
                                        const currentStock = stockList[it.name]?.current || 0;
                                        return `
                                            <tr style="border-bottom:1px solid #f1f5f9;">
                                                <td style="padding:10px 16px;">
                                                    <select class="it-name" onchange="window.erpApp.onMPItemChange(this, ${idx})" style="width:100%; border:none; outline:none; font-size:14px; font-weight:700; color:#1e293b; background:transparent;">
                                                        <option value="">-- Chọn vật tư từ kho --</option>
                                                        ${goodsList.map(g => `<option value="${g.name}" data-unit="${g.unit}" ${it.name === g.name ? 'selected' : ''}>${g.id} - ${g.name}</option>`).join('')}
                                                        <option value="khac" ${it.name && !goodsList.find(x => x.name === it.name) ? 'selected' : ''}>[Khác] - Tự nhập tên vật tư</option>
                                                    </select>
                                                    ${it.name && !goodsList.find(x => x.name === it.name) ? `
                                                        <input type="text" class="it-name-custom" value="${it.name}" placeholder="Nhập tên vật tư khác..." style="width:100%; margin-top:4px; padding:6px 0; border:none; border-bottom:1.5px solid #3b82f6; outline:none; font-size:13px; font-weight:600; color:#1e293b; background:transparent;">
                                                    ` : ''}
                                                </td>
                                                <td style="padding:10px 16px;"><input type="text" value="${it.unit}" class="it-unit" style="width:100%; border:none; outline:none; font-size:13px; font-weight:700; color:#64748b; text-align:center; background:transparent;" readonly></td>
                                                <td style="padding:10px 16px;"><input type="text" value="${currentStock}" class="it-stock" style="width:100%; border:none; outline:none; font-size:14px; font-weight:800; color:#10b981; text-align:center; background:transparent;" readonly></td>
                                                <td style="padding:10px 16px;"><input type="number" value="${it.qty}" class="it-qty" style="width:100%; border:1.5px solid #e2e8f0; background:#f8fafc; padding:8px; border-radius:10px; outline:none; font-size:15px; font-weight:900; color:#2563eb; text-align:center; transition:all 0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'"></td>
                                                <td style="padding:10px 16px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove()" style="color:#ef4444; font-size:20px; cursor:pointer;" title="Xóa dòng">delete_sweep</span></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style="padding:24px 28px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:16px; background:#fff;">
                        <button onclick="document.getElementById('mpModalOverlay').remove()" style="padding:12px 24px; border:1.5px solid #e2e8f0; background:none; border-radius:14px; cursor:pointer; font-weight:800; color:#64748b; transition:all 0.2s;" onmouseover="this.style.background='#f1f5f9'">Hủy bỏ</button>
                        <button onclick="window.erpApp.saveMP('${p.id}')" style="padding:12px 32px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:#fff; border:none; border-radius:14px; cursor:pointer; font-weight:900; box-shadow:0 10px 15px -3px rgba(59, 130, 246, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 12px 20px -3px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'">Xác nhận Đề xuất</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        };

        window.erpApp.addMPRow = () => {
            const tbody = document.getElementById('mpModalBody');
            const goodsList = window.erpApp.getDanhSachHangHoa ? window.erpApp.getDanhSachHangHoa() : [];
            const idx = tbody.querySelectorAll('tr').length;
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.innerHTML = `
                <td style="padding:10px 16px;">
                    <select class="it-name" onchange="window.erpApp.onMPItemChange(this, ${idx})" style="width:100%; border:none; outline:none; font-size:14px; font-weight:700; color:#1e293b; background:transparent;">
                        <option value="">-- Chọn vật tư từ kho --</option>
                        ${goodsList.map(g => `<option value="${g.name}" data-unit="${g.unit}">${g.id} - ${g.name}</option>`).join('')}
                        <option value="khac">[Khác] - Tự nhập tên vật tư</option>
                    </select>
                </td>
                <td style="padding:10px 16px;"><input type="text" value="Cái" class="it-unit" style="width:100%; border:none; outline:none; font-size:13px; font-weight:700; color:#64748b; text-align:center; background:transparent;" readonly></td>
                <td style="padding:10px 16px;"><input type="text" value="0" class="it-stock" style="width:100%; border:none; outline:none; font-size:14px; font-weight:800; color:#10b981; text-align:center; background:transparent;" readonly></td>
                <td style="padding:10px 16px;"><input type="number" value="1" class="it-qty" style="width:100%; border:1.5px solid #e2e8f0; background:#f8fafc; padding:8px; border-radius:10px; outline:none; font-size:15px; font-weight:900; color:#2563eb; text-align:center; transition:all 0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'"></td>
                <td style="padding:10px 16px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove()" style="color:#ef4444; font-size:20px; cursor:pointer; opacity:0.6;">delete_sweep</span></td>
            `;
            tbody.appendChild(tr);
        };

        window.erpApp.onMPItemChange = (select, idx) => {
            const row = select.closest('tr');
            const unitInput = row.querySelector('.it-unit');
            const stockInput = row.querySelector('.it-stock');
            const customInput = row.querySelector('.it-name-custom');
            
            if (select.value === 'khac') {
                if (!customInput) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'it-name-custom';
                    input.placeholder = 'Nhập tên vật tư khác...';
                    input.style.cssText = 'width:100%; margin-top:4px; padding:6px 0; border:none; border-bottom:1.5px solid #3b82f6; outline:none; font-size:13px; font-weight:600; color:#1e293b; background:transparent;';
                    select.parentNode.appendChild(input);
                    input.focus();
                }
                unitInput.value = '—';
                unitInput.readOnly = false;
                if (stockInput) stockInput.value = 'N/A';
            } else {
                if (customInput) customInput.remove();
                const option = select.options[select.selectedIndex];
                const unit = option.getAttribute('data-unit');
                if (unitInput) {
                    unitInput.value = unit || '—';
                    unitInput.readOnly = true;
                }

                // Update stock
                if (stockInput && window.erpApp.getCurrentStockList) {
                    const stockList = window.erpApp.getCurrentStockList();
                    const stock = stockList[select.value]?.current || 0;
                    stockInput.value = stock;
                }
            }
        };

        window.erpApp.saveMP = (id) => {
            const rows = document.querySelectorAll('#mpModalBody tr');
            const items = Array.from(rows).map(r => {
                const select = r.querySelector('.it-name');
                const custom = r.querySelector('.it-name-custom');
                return {
                    name: select.value === 'khac' ? (custom ? custom.value : '') : select.value,
                    unit: r.querySelector('.it-unit').value,
                    qty: parseFloat(r.querySelector('.it-qty').value) || 0
                };
            }).filter(it => it.name);

            const projects = window.erpApp.getDanhSachDuAn ? window.erpApp.getDanhSachDuAn() : [];
            const projId = document.getElementById('mpr-project').value;
            const proj = projects.find(x => x.id === projId);

            const newP = {
                id: id,
                projectId: projId,
                projectName: proj ? proj.name : 'Dự án chung',
                requester: document.getElementById('mpr-name').value,
                date: document.getElementById('mpr-date').value,
                reason: document.getElementById('mpr-reason').value,
                status: 'cho_duyet',
                items: items
            };

            const idx = materialProposals.findIndex(x => x.id === id);
            if (idx > -1) materialProposals[idx] = newP; else materialProposals.unshift(newP);

            if (window.CrudSync) window.CrudSync.saveItem('material_proposals', newP, 'id');
            
            document.getElementById('mpModalOverlay').remove();
            renderDashboard();
            if (window.erpApp.showToast) window.erpApp.showToast('Đã lưu phiếu đề xuất vật tư thành công!');
        };

        window.erpApp.deleteMP = (id) => {
            if (confirm('Xóa phiếu này?')) {
                materialProposals = materialProposals.filter(x => x.id !== id);
                if (window.CrudSync) window.CrudSync.deleteItem('material_proposals', id);
                renderDashboard();
            }
        };

        window.erpApp.viewMPDetail = (id) => {
            const p = materialProposals.find(x => x.id === id);
            if (!p) return;
            window.erpApp.openMPModal(id);
        };

        window.erpApp.printMP = (id) => {
            const p = materialProposals.find(x => x.id === id);
            if (!p) return;

            const printWindow = window.open('', '_blank');
            const itemsHtml = p.items.map((it, idx) => `
                <tr>
                    <td style="border:1px solid #000; padding:8px; text-align:center;">${idx + 1}</td>
                    <td style="border:1px solid #000; padding:8px;">${it.name}</td>
                    <td style="border:1px solid #000; padding:8px; text-align:center;">${it.unit}</td>
                    <td style="border:1px solid #000; padding:8px; text-align:center; font-weight:bold;">${it.qty}</td>
                    <td style="border:1px solid #000; padding:8px;">${it.note || ''}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                <head>
                    <title>In Phiếu đề xuất - ${p.id}</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #000; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .company-info { font-size: 14px; font-weight: bold; text-transform: uppercase; }
                        .doc-id { font-size: 14px; }
                        .main-title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                        .sub-title { text-align: center; font-size: 16px; font-style: italic; margin-bottom: 30px; }
                        .info-section { margin-bottom: 20px; line-height: 1.6; }
                        .info-row { display: flex; margin-bottom: 6px; }
                        .info-label { width: 150px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { border: 1px solid #000; padding: 10px; background: #f2f2f2; font-size: 14px; }
                        .footer { margin-top: 50px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; }
                        .signature-box { height: 100px; }
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-info">
                            <div>CÔNG TY CỔ PHẦN VIỆT BÁCH</div>
                            <div style="font-size: 11px; font-weight: normal; margin-top:4px;">Địa chỉ: Số 123, Đường ABC, TP. Hà Nội</div>
                        </div>
                        <div class="doc-id">
                            <div>Số: <strong>${p.id}</strong></div>
                            <div>Ngày: ${p.date}</div>
                        </div>
                    </div>

                    <div class="main-title">PHIẾU ĐỀ XUẤT VẬT TƯ</div>
                    <div class="sub-title">(Dùng cho sản xuất và thi công dự án)</div>

                    <div class="info-section">
                        <div class="info-row"><span class="info-label">Người đề xuất:</span><span>${p.requester}</span></div>
                        <div class="info-row"><span class="info-label">Phòng ban:</span><span>${p.department || 'Phòng Dự án'}</span></div>
                        <div class="info-row"><span class="info-label">Dự án:</span><span>${p.projectName || 'Dự án chung'}</span></div>
                        <div class="info-row"><span class="info-label">Lý do đề xuất:</span><span>${p.reason}</span></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">STT</th>
                                <th>Tên vật tư, quy cách</th>
                                <th style="width: 80px;">ĐVT</th>
                                <th style="width: 80px;">Số lượng</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="footer">
                        <div>
                            <div style="font-weight: bold;">Người lập phiếu</div>
                            <div style="font-size: 12px; font-style: italic;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-box"></div>
                            <div style="font-weight: bold;">${p.requester}</div>
                        </div>
                        <div>
                            <div style="font-weight: bold;">Trưởng bộ phận</div>
                            <div style="font-size: 12px; font-style: italic;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-box"></div>
                        </div>
                        <div>
                            <div style="font-weight: bold;">Ban Giám Đốc</div>
                            <div style="font-size: 12px; font-style: italic;">(Ký và đóng dấu)</div>
                            <div class="signature-box"></div>
                        </div>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                                // window.close(); // Uncomment to close after print
                            }, 500);
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        };
    };

    // Safe Initialization
    window.addEventListener('DOMContentLoaded', initMPModule);

    console.log('✅ MP Logic: Loaded and Ready.');
})();
