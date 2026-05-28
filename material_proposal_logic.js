(function () {
    console.log('✅ MP Logic: Loading Module...');
    'use strict';

    const MP_STORAGE_KEY = 'erp_materialProposals';

    // ==========================================
    // State Management
    // ==========================================
    let propSearchQuery = '';
    let propActiveTab = 'all';
    let isRendering = false; // LOOP GUARD

    let materialProposals = window.materialProposals || [];

    // Persistence
    function loadDataMaterial() {
        try {
            // 1. Load native proposals
            const saved = localStorage.getItem(MP_STORAGE_KEY);
            let nativeProposals = [];
            if (saved) { nativeProposals = JSON.parse(saved); }

            materialProposals = [...nativeProposals];

            // 2. Load PM data to create "Virtual" proposals
            const pmMatsRaw = localStorage.getItem('erp_pmMaterials');
            const projectsRaw = localStorage.getItem('erp_pmProjects');

            if (pmMatsRaw && projectsRaw) {
                const pmMats = JSON.parse(pmMatsRaw);
                const projects = JSON.parse(projectsRaw);

                // Filter items with actual quantity (proposed)
                const proposedItems = pmMats.filter(m => (parseFloat(m.actual) || 0) > 0);

                // Group by project and date
                const groups = {};
                proposedItems.forEach(item => {
                    const project = projects.find(p => p.id === item.projectId) || { name: 'Dự án không xác định' };
                    const date = item.date || 'Chưa rõ ngày';
                    // Unique ID for virtual proposal to prevent duplication
                    const key = `V-PM-${item.projectId}-${date}`;

                    if (!groups[key]) {
                        groups[key] = {
                            id: key,
                            requester: 'Quản lý dự án',
                            department: project.name,
                            date: date,
                            reason: `Vật tư phục vụ thi công dự án: ${project.name}`,
                            status: 'cho_duyet',
                            items: [],
                            isVirtual: true,
                            projectId: item.projectId
                        };
                    }
                    groups[key].items.push({
                        name: item.name,
                        unit: item.unit,
                        qty: item.actual,
                        note: item.workItem || ''
                    });
                });

                // Merge virtual proposals into the main list if not already there
                Object.values(groups).forEach(vp => {
                    if (!materialProposals.find(p => p.id === vp.id)) {
                        materialProposals.push(vp);
                    }
                });
            }
        } catch (e) { console.error('MP Logic: Error loading data', e); }
    }

    function saveDataMaterial() {
        // Only save real proposals (filter out virtual ones from PM)
        const realProposals = materialProposals.filter(p => !p.isVirtual);
        localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(realProposals));
    }

    // ==========================================
    // Rendering Logic
    // ==========================================
    function renderDashboard() {
        if (isRendering) { return; } // Prevent loop
        isRendering = true;

        console.log('✅ MP Logic: Rendering Dashboard [Guard Active]');
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            isRendering = false;
            return;
        }

        loadDataMaterial();

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
                <div style="margin-bottom:20px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('kho-van')" style="padding:8px 16px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; color:#64748b; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;">
                        <span class="material-icons-outlined" style="font-size:18px;">arrow_back</span> Quay lại
                    </button>
                </div>
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
                    ${renderMaterialStatCard('Tổng đề xuất', stats.total, 'assignment', '#eff6ff', '#3b82f6')}
                    ${renderMaterialStatCard('Chờ phê duyệt', stats.pending, 'pending_actions', '#fff7ed', '#f97316')}
                    ${renderMaterialStatCard('Đã phê duyệt', stats.approved, 'check_circle', '#f0fdf4', '#22c55e')}
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                    <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                        <!-- Tabs Area (Chevron Style) -->
                        <div class="crm-chevron-tabs" style="margin-bottom:0; padding-bottom:0;">
                            ${['all', 'cho_duyet', 'da_duyet'].map(tab => {
            const searchMatch = materialProposals.filter(r => {
                const q = propSearchQuery.toLowerCase();
                return (r.requester || '').toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
            });
            const count = tab === 'all' ? searchMatch.length : searchMatch.filter(c => c.status === tab).length;
            const isActive = propActiveTab === tab;
            const label = tab === 'all' ? 'Tất cả' : (tab === 'cho_duyet' ? 'Chờ duyệt' : 'Đã duyệt');

            let bgColor, textColor, badgeColor = '#1e293b';
            if (tab === 'all') {
                bgColor = isActive ? '#3b82f6' : '#64748b';
                textColor = '#fff';
                badgeColor = isActive ? '#3b82f6' : '#1e293b';
            } else {
                const colors = tab === 'cho_duyet' ? { bg: '#fff7ed', text: '#f97316', border: '#ffedd5' } : { bg: '#f0fdf4', text: '#22c55e', border: '#dcfce7' };
                if (isActive) {
                    bgColor = colors.text;
                    textColor = '#fff';
                    badgeColor = colors.text;
                } else {
                    bgColor = colors.bg;
                    textColor = colors.text;
                }
            }

            return `
                                    <button class="crm-chevron-tab" onclick="window.erpApp.setMPTab('${tab}')" 
                                            style="background:${bgColor}; color:${textColor}; padding: 8px 16px 8px 24px;">
                                        ${tab === 'all' ? '<span class="material-icons-outlined" style="font-size:16px;">format_list_bulleted</span>' : ''}
                                        ${label}
                                        <span class="crm-chevron-badge" style="color:${badgeColor}">${count}</span>
                                    </button>
                                `;
        }).join('')}
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
                                ${filtered.length === 0 ? '<tr><td colspan="5" style="padding:40px; text-align:center; color:#94a3b8;">Không có dữ liệu.</td></tr>' :
                filtered.map(p => `
                                    <tr onclick="window.erpApp.viewMPDetail('${p.id}')" style="border-bottom:1px solid #f1f5f9; cursor:pointer;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 20px;">
                                            <div style="font-weight:700; color:#3b82f6; display:flex; align-items:center; gap:6px;">
                                                ${p.id}
                                                ${p.isVirtual ? '<span style="background:#fef2f2; color:#ef4444; font-size:10px; padding:2px 6px; border-radius:4px; border:1px solid #fee2e2;">DỰ ÁN</span>' : ''}
                                            </div>
                                            <div style="font-size:11px; color:#94a3b8;">${p.date}</div>
                                        </td>
                                        <td style="padding:16px 20px;"><div style="font-weight:600; color:#1e293b;">${p.requester}</div><div style="font-size:11px; color:#64748b;">${p.department}</div></td>
                                        <td style="padding:16px 20px;"><div style="font-size:13px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${p.reason}</div></td>
                                        <td style="padding:16px 20px; text-align:center;">${getStatusLabel(p.status)}</td>
                                        <td style="padding:16px 20px; text-align:right;" onclick="event.stopPropagation()">
                                            <div style="display:flex; gap:8px; justify-content:flex-end;">
                                                <button onclick="window.erpApp.viewMPDetail('${p.id}')" title="Xem chi tiết" style="background:none; border:none; color:#3b82f6; cursor:pointer; display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:6px; transition:0.2s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='none'">
                                                    <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                                </button>
                                                ${!p.isVirtual ? `
                                                <button onclick="window.erpApp.openMPModal('${p.id}')" title="Sửa" style="background:none; border:none; color:#10b981; cursor:pointer; display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:6px; transition:0.2s;" onmouseover="this.style.background='#ecfdf5'" onmouseout="this.style.background='none'">
                                                    <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                                </button>
                                                <button onclick="window.erpApp.deleteMP('${p.id}')" title="Xóa" style="background:none; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:6px; transition:0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                                                    <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                                                </button>
                                                ` : `
                                                <button onclick="window.erpApp.showToast('Đây là đề xuất tự động từ dự án. Vui lòng xử lý tại dự án tương ứng.', 'info')" title="Đề xuất dự án" style="background:none; border:none; color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:6px;">
                                                    <span class="material-icons-outlined" style="font-size:18px;">lock</span>
                                                </button>
                                                `}
                                            </div>
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

    function renderMaterialStatCard(label, value, icon, bg, color) {
        return `
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px;">
                <div style="width:48px; height:48px; border-radius:12px; background:${bg}; color:${color}; display:flex; align-items:center; justify-content:center;">
                    <span class="material-icons-outlined">${icon}</span>
                </div>
                <div>
                    <div style="font-size:24px; font-weight:800; color:#1e293b;">${window.erpApp.formatValue(value)}</div>
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
        if (!window.erpApp) { return; }

        window.erpApp.renderPhieuDeXuatVatTu = renderDashboard;

        window.erpApp.setMPTab = (tab) => { propActiveTab = tab; renderDashboard(); };
        window.erpApp.onMPSearch = (val) => { propSearchQuery = val; renderDashboard(); };

        window.erpApp.openMPModal = (id = null) => {
            const isEdit = !!id;
            let p = isEdit ? materialProposals.find(x => x.id === id) : {
                id: 'DX-' + Date.now().toString().slice(-4),
                requester: JSON.parse(sessionStorage.getItem('erp_user'))?.fullName || 'Người dùng',
                department: 'Phòng Kho',
                date: new Date().toISOString().split('T')[0],
                reason: '',
                status: 'cho_duyet',
                items: [{ name: '', unit: 'Cái', qty: 1, note: '' }]
            };

            const isVirtual = p && p.isVirtual;

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
            overlay.id = 'mpModalOverlay';

            overlay.innerHTML = `
                <div style="background:#fff; border-radius:20px; width:95%; max-width:800px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                    <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:700; color:#1e293b;">
                            ${isVirtual ? '<span style="color:#ef4444; border:1px solid #fee2e2; background:#fef2f2; padding:2px 8px; border-radius:6px; font-size:12px; margin-right:10px;">DỰ ÁN</span>' : ''}
                            ${isEdit ? 'Chi tiết' : 'Tạo'} Phiếu đề xuất vật tư
                        </h2>
                        <span class="material-icons-outlined" onclick="document.getElementById('mpModalOverlay').remove()" style="cursor:pointer; color:#94a3b8;">close</span>
                    </div>
                    <div style="padding:24px; overflow-y:auto; background:#f8fafc;">
                        ${isVirtual ? `
                            <div style="background:#eff6ff; border:1px solid #dbeafe; padding:12px 16px; border-radius:12px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">
                                <span class="material-icons-outlined" style="color:#3b82f6;">info</span>
                                <div style="font-size:13px; color:#1e40af; font-weight:500;">Đây là đề xuất được liên thông tự động từ <strong>${p.department}</strong>. Nội dung được đồng bộ từ Quản lý dự án.</div>
                            </div>
                        ` : ''}
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                            <div><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Người đề xuất</label><input type="text" id="mpr-name" value="${p.requester}" ${isVirtual ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; ${isVirtual ? 'background:#f1f5f9;' : ''}"></div>
                            <div><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Ngày lập</label><input type="date" id="mpr-date" value="${p.date}" ${isVirtual ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; ${isVirtual ? 'background:#f1f5f9;' : ''}"></div>
                        </div>
                        <div style="margin-bottom:20px;"><label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:6px;">Lý do / Mô tả</label><textarea id="mpr-reason" ${isVirtual ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; height:60px; resize:none; ${isVirtual ? 'background:#f1f5f9;' : ''}">${p.reason}</textarea></div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <h3 style="margin:0; font-size:14px; color:#475569;">Danh sách vật tư</h3>
                            ${!isVirtual ? '<button onclick="window.erpApp.addMPRow()" style="background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">+ Thêm dòng</button>' : ''}
                        </div>
                        <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #e2e8f0; border-radius:8px;">
                            <thead><tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;"><th style="padding:10px; text-align:left; font-size:11px;">Tên vật tư</th><th style="padding:10px; text-align:center; font-size:11px; width:60px;">ĐVT</th><th style="padding:10px; text-align:center; font-size:11px; width:80px;">SL</th>${!isVirtual ? '<th style="padding:10px; text-align:center; font-size:11px; width:40px;"></th>' : ''}</tr></thead>
                            <tbody id="mpModalBody">
                                ${p.items.map(it => `
                                    <tr style="border-bottom:1px solid #f1f5f9;">
                                        <td style="padding:8px;"><input type="text" value="${it.name}" class="it-name" ${isVirtual ? 'readonly' : ''} style="width:100%; border:none; outline:none; font-size:13px; ${isVirtual ? 'background:transparent;' : ''}"></td>
                                        <td style="padding:8px;"><input type="text" value="${it.unit}" class="it-unit" ${isVirtual ? 'readonly' : ''} style="width:100%; border:none; outline:none; font-size:13px; text-align:center; ${isVirtual ? 'background:transparent;' : ''}"></td>
                                        <td style="padding:8px;"><input type="text" value="${window.erpApp.formatValue(it.qty)}" class="it-qty" ${isVirtual ? 'readonly' : ''} oninput="window.erpApp.formatNumberInput(this)" style="width:100%; border:none; outline:none; font-size:13px; text-align:center; ${isVirtual ? 'background:transparent;' : ''}"></td>
                                        ${!isVirtual ? '<td style="padding:8px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest(\'tr\').remove()" style="color:#ef4444; font-size:18px; cursor:pointer;">delete</span></td>' : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px; align-items:center;">
                        <button onclick="document.getElementById('mpModalOverlay').remove()" style="padding:10px 20px; border:1px solid #e2e8f0; background:none; border-radius:10px; cursor:pointer; font-weight:600;">Hủy</button>
                        ${isEdit && p.status === 'cho_duyet' ? `
                            <button onclick="window.erpApp.approveMP('${p.id}')" style="padding:10px 24px; background:#10b981; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(16,185,129,0.2);">
                                <span class="material-icons-outlined" style="font-size:18px;">check_circle</span> Phê duyệt
                            </button>
                            <button onclick="window.erpApp.rejectMP('${p.id}')" style="padding:10px 24px; background:#ef4444; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(239,68,68,0.2);">
                                <span class="material-icons-outlined" style="font-size:18px;">cancel</span> Từ chối
                            </button>
                        ` : ''}
                        ${isEdit && !isVirtual && p.status !== 'da_duyet' ? `
                            <button onclick="window.erpApp.pmSubmitProposalToBOD('${p.id}')" style="padding:10px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(139,92,246,0.2);">
                                <span class="material-icons-outlined" style="font-size:18px;">send</span> Gửi Ban Giám đốc
                            </button>
                        ` : ''}
                        ${!isVirtual && p.status !== 'da_duyet' ? `
                            <button onclick="window.erpApp.saveMP('${p.id}')" style="padding:10px 24px; background:#3b82f6; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:700;">Lưu phiếu</button>
                        ` : ''}
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        };

        window.erpApp.addMPRow = () => {
            const tbody = document.getElementById('mpModalBody');
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.innerHTML = '<td style="padding:8px;"><input type="text" class="it-name" style="width:100%; border:none; outline:none; font-size:13px;"></td><td style="padding:8px;"><input type="text" value="Cái" class="it-unit" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td><td style="padding:8px;"><input type="text" value="1" class="it-qty" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; border:none; outline:none; font-size:13px; text-align:center;"></td><td style="padding:8px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest(\'tr\').remove()" style="color:#ef4444; font-size:18px; cursor:pointer;">delete</span></td>';
            tbody.appendChild(tr);
        };

        window.erpApp.saveMP = async (id) => {
            const rows = document.querySelectorAll('#mpModalBody tr');
            const items = Array.from(rows).map(r => ({
                name: r.querySelector('.it-name').value,
                unit: r.querySelector('.it-unit').value,
                qty: window.erpApp.parseVND(r.querySelector('.it-qty').value) || 0
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
            if (idx > -1) { materialProposals[idx] = newP; } else { materialProposals.unshift(newP); }

            saveDataMaterial();

            if (window.CrudSync && window.CrudSync.saveItem) {
                await window.CrudSync.saveItem('erp_materialProposals', newP, 'id');
            }
            document.getElementById('mpModalOverlay').remove();

            if (window.erpApp.notifyCRUD) {
                window.erpApp.notifyCRUD('Phiếu đề xuất vật tư', idx > -1 ? 'update' : 'add', {
                    id: id,
                    name: newP.requester,
                    page: 'kho-van'
                });
            }

            renderDashboard();
            window.erpApp.showToast('Đã lưu phiếu đề xuất');
        };

        window.erpApp.deleteMP = (id) => {
            const proposal = materialProposals.find(x => x.id === id);

            if (proposal) {
                window.erpApp.showDeleteConfirmation(
                    'Phiếu đề xuất',
                    id,
                    async function () {
                        materialProposals = materialProposals.filter(x => x.id !== id);
                        saveDataMaterial();

                        if (window.CrudSync && window.CrudSync.deleteItem) {
                            await window.CrudSync.deleteItem('erp_materialProposals', id);
                        }

                        if (window.erpApp.notifyCRUD) {
                            window.erpApp.notifyCRUD('Phiếu đề xuất vật tư', 'delete', {
                                id: id,
                                name: proposal.requester,
                                page: 'kho-van'
                            });
                        }

                        renderDashboard();
                    }
                );
            }
        };

        window.erpApp.approveMP = async (id) => {
            const proposal = materialProposals.find(x => x.id === id);
            if (!proposal) {
                window.erpApp.showToast('Không tìm thấy phiếu đề xuất!', 'error');
                return;
            }

            proposal.status = 'da_duyet';
            saveDataMaterial();

            if (window.CrudSync && window.CrudSync.saveItem && !proposal.isVirtual) {
                await window.CrudSync.saveItem('erp_materialProposals', proposal, 'id');
            }

            // Gửi thông báo hệ thống và email
            if (window.erpApp && window.erpApp.sendMultiChannelNotification) {
                window.erpApp.sendMultiChannelNotification({
                    recipientId: proposal.requester || 'User',
                    recipientName: proposal.requester || 'Người đề xuất',
                    title: `Đề xuất vật tư ${proposal.id} đã được phê duyệt`,
                    message: `Đề xuất vật tư ${proposal.id} lập ngày ${proposal.date} phục vụ: ${proposal.reason} đã được phê duyệt thành công. Vui lòng kiểm tra trên hệ thống.`,
                    target: { page: 'kho-van', subPage: 'material_proposals', itemId: proposal.id },
                    channels: ['system', 'email']
                });
            }

            const modal = document.getElementById('mpModalOverlay');
            if (modal) modal.remove();

            renderDashboard();
            window.erpApp.showToast('Đã phê duyệt đề xuất vật tư thành công!', 'success');
        };

        window.erpApp.rejectMP = async (id) => {
            const proposal = materialProposals.find(x => x.id === id);
            if (!proposal) {
                window.erpApp.showToast('Không tìm thấy phiếu đề xuất!', 'error');
                return;
            }

            proposal.status = 'tu_choi';
            saveDataMaterial();

            if (window.CrudSync && window.CrudSync.saveItem && !proposal.isVirtual) {
                await window.CrudSync.saveItem('erp_materialProposals', proposal, 'id');
            }

            // Gửi thông báo từ chối
            if (window.erpApp && window.erpApp.sendMultiChannelNotification) {
                window.erpApp.sendMultiChannelNotification({
                    recipientId: proposal.requester || 'User',
                    recipientName: proposal.requester || 'Người đề xuất',
                    title: `Đề xuất vật tư ${proposal.id} đã bị từ chối`,
                    message: `Đề xuất vật tư ${proposal.id} lập ngày ${proposal.date} phục vụ: ${proposal.reason} đã bị từ chối phê duyệt.`,
                    target: { page: 'kho-van', subPage: 'material_proposals', itemId: proposal.id },
                    channels: ['system', 'email']
                });
            }

            const modal = document.getElementById('mpModalOverlay');
            if (modal) modal.remove();

            renderDashboard();
            window.erpApp.showToast('Đã từ chối đề xuất vật tư!', 'warning');
        };

        window.erpApp.viewMPDetail = (id) => {
            const p = materialProposals.find(x => x.id === id);
            if (!p) { return; }
            // Detail logic here...
            window.erpApp.openMPModal(id);
        };

        // ==========================================
        // PDF Submission to BOD Pipeline
        // ==========================================
        window.erpApp.pmSubmitProposalToBOD = async (id) => {
            const p = materialProposals.find(x => x.id === id);
            if (!p) {
                window.erpApp.showToast('Không tìm thấy phiếu đề xuất!', 'error');
                return;
            }

            if (window.erpApp.showLoading) window.erpApp.showLoading();

            try {
                // 1. Generate HTML for PDF
                const pdfContainer = document.createElement('div');
                pdfContainer.style.position = 'fixed';
                pdfContainer.style.left = '-9999px';
                pdfContainer.style.top = '-9999px';
                pdfContainer.style.width = '800px';
                pdfContainer.style.background = '#fff';
                pdfContainer.style.padding = '40px';

                pdfContainer.innerHTML = `
                    <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.6; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                            <div style="text-align: center; width: 45%;">
                                <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">CÔNG TY TNHH XÂY DỰNG VIỆT BẮC</div>
                                <div style="border-top: 1px solid #000; width: 80px; margin: 5px auto;"></div>
                                <div style="font-size: 10pt; margin-top: 5px;">Mã số: ${p.id}</div>
                            </div>
                            <div style="text-align: center; width: 50%;">
                                <div style="font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div style="font-weight: bold; font-size: 10pt;">Độc lập - Tự do - Hạnh phúc</div>
                                <div style="border-top: 1px solid #000; width: 100px; margin: 5px auto;"></div>
                                <div style="font-style: italic; font-size: 10pt; margin-top: 10px;">TP. Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
                            </div>
                        </div>

                        <div style="text-align: center; margin-bottom: 40px;">
                            <h2 style="text-transform: uppercase; font-size: 16pt; margin: 0; font-weight: bold;">PHIẾU ĐỀ XUẤT VẬT TƯ</h2>
                            <div style="font-style: italic; margin-top: 5px; font-size: 11pt;">(V/v: Cung cấp vật tư, trang thiết bị thi công phục vụ dự án)</div>
                        </div>

                        <div style="margin-bottom: 25px; font-size: 12pt;">
                            <div style="margin-bottom: 12px;"><span style="font-weight: bold; width: 150px; display: inline-block;">Kính gửi:</span> Ban Giám đốc Công ty TNHH Xây dựng Việt Bắc</div>
                            <div style="margin-bottom: 12px;"><span style="font-weight: bold; width: 150px; display: inline-block;">Người đề xuất:</span> ${p.requester}</div>
                            <div style="margin-bottom: 12px;"><span style="font-weight: bold; width: 150px; display: inline-block;">Phòng/Bộ phận:</span> ${p.department}</div>
                            <div style="margin-bottom: 12px;"><span style="font-weight: bold; width: 150px; display: inline-block;">Lý do đề xuất:</span> ${p.reason}</div>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 11pt;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 50px;">STT</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: left;">Tên vật tư, quy cách kỹ thuật</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 70px;">ĐVT</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 100px;">Số lượng</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: left; width: 150px;">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${p.items.map((it, index) => `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${index + 1}</td>
                                        <td style="border: 1px solid #000; padding: 10px;">${it.name}</td>
                                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${it.unit}</td>
                                        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold;">${window.erpApp.formatValue(it.qty)}</td>
                                        <td style="border: 1px solid #000; padding: 10px;">${it.note || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
                            <div style="text-align: center; width: 33%;">
                                <div style="font-weight: bold; text-transform: uppercase;">BAN GIÁM ĐỐC</div>
                                <div style="font-style: italic; font-size: 9pt;">(Ký và đóng dấu)</div>
                                <div style="margin-top: 100px;"></div>
                            </div>
                            <div style="text-align: center; width: 33%;">
                                <div style="font-weight: bold; text-transform: uppercase;">TRƯỞNG BỘ PHẬN</div>
                                <div style="font-style: italic; font-size: 9pt;">(Ký, ghi rõ họ tên)</div>
                                <div style="margin-top: 100px;"></div>
                            </div>
                            <div style="text-align: center; width: 33%;">
                                <div style="font-weight: bold; text-transform: uppercase;">NGƯỜI LẬP PHIẾU</div>
                                <div style="font-style: italic; font-size: 9pt;">(Ký, ghi rõ họ tên)</div>
                                <div style="margin-top: 100px; font-weight: bold;">${p.requester}</div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(pdfContainer);

                const opt = {
                    margin: [15, 15, 15, 15],
                    filename: `DeXuatVatTu_${p.id}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                const pdfBase64 = await html2pdf().set(opt).from(pdfContainer).outputPdf('datauristring');
                document.body.removeChild(pdfContainer);

                const response = await fetch((window.API_BASE_URL || '') + '/api/send-notification-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: 'bod@vietbachcorp.com',
                        subject: `[ERP-PHÊ DUYỆT] Đề xuất vật tư - ${p.id} - ${p.requester}`,
                        content: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                <h2 style="color: #2563eb;">Thông báo Phê duyệt Đề xuất Vật tư</h2>
                                <p>Kính gửi Ban Giám đốc,</p>
                                <p>Hệ thống ERP vừa nhận được yêu cầu phê duyệt vật tư từ <strong>${p.requester}</strong>.</p>
                                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Mã phiếu:</strong> ${p.id}</p>
                                    <p style="margin: 5px 0;"><strong>Người đề xuất:</strong> ${p.requester}</p>
                                    <p style="margin: 5px 0;"><strong>Ngày lập:</strong> ${p.date}</p>
                                    <p style="margin: 5px 0;"><strong>Lý do:</strong> ${p.reason}</p>
                                </div>
                                <p>Vui lòng xem chi tiết trong báo cáo PDF đính kèm để tiến hành phê duyệt.</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="font-size: 12px; color: #64748b;">Đây là email tự động từ hệ thống ERP VietBachCorp. Vui lòng không phản hồi email này.</p>
                            </div>
                        `,
                        attachments: [
                            {
                                filename: `DeXuatVatTu_${p.id}.pdf`,
                                content: pdfBase64.split(',')[1],
                                encoding: 'base64'
                            }
                        ]
                    })
                });

                if (response.ok) {
                    window.erpApp.showToast('Đã gửi đề xuất tới Ban Giám đốc thành công!');

                    if (window.erpApp.notifyCRUD) {
                        window.erpApp.notifyCRUD('Phiếu đề xuất vật tư', 'submit_bod', {
                            id: p.id,
                            name: p.requester,
                            page: 'kho-van',
                            module: 'Đề xuất vật tư'
                        });
                    }

                    const modal = document.getElementById('mpModalOverlay');
                    if (modal) modal.remove();

                    renderDashboard();
                } else {
                    throw new Error('Gửi email thông báo thất bại');
                }

            } catch (error) {
                console.error('Submit to BOD error:', error);
                window.erpApp.showToast('Lỗi gửi đề xuất: ' + error.message, 'error');
            } finally {
                if (window.erpApp.hideLoading) window.erpApp.hideLoading();
            }
        };
    };

    // Safe Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMPModule);
    } else {
        initMPModule();
    }

    console.log('✅ MP Logic: Loaded and Ready.');
    window.materialProposals = materialProposals;
})();
