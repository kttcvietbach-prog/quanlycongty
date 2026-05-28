(function () {
    'use strict';

    // ==========================================
    // MODULE: Nhà cung cấp & Đối tác (Suppliers & Partners)
    // ==========================================
    let supplierSearchQuery = '';
    let supplierActiveTab = 'all';
    let supplierModuleContext = 'Mua hàng';
    
    // Tách biệt 2 tập dữ liệu
    let suppliersData = [];
    let partnersData = [];

    // Tải dữ liệu từ localStorage
    function loadSuppliersData() {
        try {
            // Thử load từ key mới (đã tách)
            let saved = localStorage.getItem('erp_suppliers');
            
            // Nếu không có dữ liệu mới, thử lấy từ key cũ 'suppliers' (trước khi decoupling)
            if (!saved || (JSON.parse(saved).length === 0)) {
                const oldSaved = localStorage.getItem('suppliers') || localStorage.getItem('erp_suppliers_old');
                if (oldSaved && JSON.parse(oldSaved).length > 0) {
                    saved = oldSaved;
                    localStorage.setItem('erp_suppliers', saved);
                    // Đẩy dữ liệu vừa khôi phục lên Firebase ngay lập tức
                    setTimeout(() => {
                        if (window.CrudSync && window.CrudSync.saveItems) {
                            window.CrudSync.saveItems('erp_suppliers', JSON.parse(saved));
                        }
                    }, 2000); // Đợi Firebase sẵn sàng
                }
            }

            if (saved) {
                suppliersData = JSON.parse(saved);
            } else {
                // Dữ liệu mẫu nếu trắng tinh
                suppliersData = [
                    { id: 'NCC-2024-001', name: 'Công ty Thép Hòa Phát', category: 'Vật liệu xây dựng', contactPerson: 'Nguyễn Văn Hòa', phone: '0243.123456', email: 'sales@hoaphat.com', address: 'Hà Nội', status: 'active', rating: 5, providedProducts: [] },
                    { id: 'NCC-2024-002', name: 'Xi măng Hà Tiên 1', category: 'Vật liệu xây dựng', contactPerson: 'Trần Văn Tiên', phone: '0283.987654', email: 'contact@hatien1.vn', address: 'TP.HCM', status: 'active', rating: 4, providedProducts: [] }
                ];
                localStorage.setItem('erp_suppliers', JSON.stringify(suppliersData));
            }
            // Sync with global for compatibility
            window.suppliers = suppliersData;
        } catch (e) { 
            console.error('Error loading Suppliers:', e); 
            suppliersData = [];
            window.suppliers = [];
        }
    }

    function loadPartnersData() {
        try {
            // Thử load từ key mới (đã tách)
            let saved = localStorage.getItem('erp_partners');

            // Nếu không có dữ liệu mới, thử lấy từ key cũ 'danhSachDoiTacData' (trước khi decoupling)
            if (!saved || (JSON.parse(saved).length === 0)) {
                const oldSaved = localStorage.getItem('erp_danhSachDoiTacData') || localStorage.getItem('danhSachDoiTacData');
                if (oldSaved && JSON.parse(oldSaved).length > 0) {
                    saved = oldSaved;
                    localStorage.setItem('erp_partners', saved);
                    // Đẩy dữ liệu vừa khôi phục lên Firebase ngay lập tức
                    setTimeout(() => {
                        if (window.CrudSync && window.CrudSync.saveItems) {
                            window.CrudSync.saveItems('erp_partners', JSON.parse(saved));
                        }
                    }, 2000); // Đợi Firebase sẵn sàng
                }
            }

            if (saved) {
                partnersData = JSON.parse(saved);
            } else {
                // Seed some sample data if empty for Partners
                partnersData = [
                    { id: 'DT-2024-001', name: 'Tập đoàn Xây dựng Delta', category: 'Chủ đầu tư', contactPerson: 'Nguyễn Văn A', phone: '0901234567', email: 'contact@delta.com.vn', address: 'Hà Nội', status: 'active', rating: 5, providedProducts: [] },
                    { id: 'DT-2024-002', name: 'Công ty CP Đầu tư Nam Long', category: 'Chủ đầu tư', contactPerson: 'Trần Thị B', phone: '0908765432', email: 'info@namlong.com', address: 'TP.HCM', status: 'active', rating: 5, providedProducts: [] }
                ];
                localStorage.setItem('erp_partners', JSON.stringify(partnersData));
            }
            // Sync with global for compatibility
            window.danhSachDoiTacData = partnersData;
        } catch (e) { 
            console.error('Error loading Partners:', e); 
            partnersData = [];
            window.danhSachDoiTacData = [];
        }
    }

    loadSuppliersData();
    loadPartnersData();

    // Export API
    window.erpApp.getSuppliers = () => suppliersData;
    window.erpApp.getPartners = () => partnersData;
    window.erpApp.getDanhSachDoiTac = () => partnersData;

    window.erpApp.setSuppliers = (data) => {
        if (!Array.isArray(data)) {return;}
        suppliersData = data;
        window.suppliers = data;
        localStorage.setItem('erp_suppliers', JSON.stringify(data));
        if (supplierModuleContext === 'Mua hàng') {
            renderNhaCungCap();
        }
    };

    window.erpApp.setPartners = (data) => {
        if (!Array.isArray(data)) {return;}
        partnersData = data;
        window.danhSachDoiTacData = data;
        localStorage.setItem('erp_partners', JSON.stringify(data));
        if (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') {
            renderNhaCungCap();
        }
    };

    // Helper để lấy danh sách hiện tại dựa trên context
    function getActiveList() {
        return (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? partnersData : suppliersData;
    }

    // Helper để lưu danh sách hiện tại
    async function saveActiveList() {
        if (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') {
            localStorage.setItem('erp_partners', JSON.stringify(partnersData));
            window.danhSachDoiTacData = partnersData; // Sync
            console.log('💾 [Partners] Saved to localStorage:', partnersData.length, 'items');
            if (window.CrudSync && window.CrudSync.saveItems) {
                await window.CrudSync.saveItems('erp_partners', partnersData);
                console.log('☁️ [Partners] Synced to Cloud');
            }
        } else {
            localStorage.setItem('erp_suppliers', JSON.stringify(suppliersData));
            window.suppliers = suppliersData; // Sync
            console.log('💾 [Suppliers] Saved to localStorage:', suppliersData.length, 'items');
            if (window.CrudSync && window.CrudSync.saveItems) {
                await window.CrudSync.saveItems('erp_suppliers', suppliersData);
                console.log('☁️ [Suppliers] Synced to Cloud');
            }
        }
    }

    function renderNhaCungCap(contextOrFilter = '') {
        if (contextOrFilter === 'Quản lý dự án' || contextOrFilter === 'Hệ thống' || contextOrFilter === 'Mua hàng') {
            supplierModuleContext = contextOrFilter;
        } else if (contextOrFilter) {
            supplierSearchQuery = contextOrFilter;
        }

        const pageTitleText = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'Danh sách đối tác' : 'Danh sách nhà cung cấp';
        const backTarget = supplierModuleContext === 'Quản lý dự án' ? 'van-hanh' : (supplierModuleContext === 'Hệ thống' ? 'he-thong' : 'mua-hang');

        if (window.erpApp.updateBreadcrumb) {
            window.erpApp.updateBreadcrumb(pageTitleText, supplierModuleContext);
        }

        const filtered = window.erpApp.getFilteredSuppliers();
        
        const addBtnText = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'Thêm Đối tác' : 'Thêm Nhà cung cấp';
        const countLabelText = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'QL Đối Tác:' : 'QL Nhà Cung Cấp:';
        const idColText = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'Mã Đối tác / Đánh giá' : 'Mã NCC / Đánh giá';

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {return;}

        let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('${backTarget}')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm kiếm ${ (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'đối tác' : 'nhà cung cấp'}..." 
                                value="${supplierSearchQuery}" 
                                oninput="window.erpApp.supplierSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 16px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">${countLabelText}</span>
                            <span style="font-size:15px; font-weight:800; color:#0d9488;">${filtered.length}</span>
                        </div>
                        <button onclick="window.erpApp.openSupplierModal()" style="padding:10px 24px; background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(13, 148, 136, 0.2);">
                            <span class="material-icons-outlined">domain_add</span> ${addBtnText}
                        </button>
                    </div>
                </div>

                <!-- Tabs Area (Chevron Style) -->
                <div class="crm-chevron-tabs">
                    ${['all', 'active', 'potential', 'inactive'].map(tab => {
                        const activeList = getActiveList();
                        const searchMatch = activeList.filter(s => {
                            const q = (supplierSearchQuery || '').toLowerCase();
                            const sName = (s.name || '').toLowerCase();
                            const sId = (s.id || '').toLowerCase();
                            const sCat = (s.category || '').toLowerCase();
                            return sName.includes(q) || sId.includes(q) || sCat.includes(q);
                        });
                        const count = tab === 'all' ? searchMatch.length : searchMatch.filter(c => c.status === tab).length;
                        const isActive = supplierActiveTab === tab;
                        const label = tab === 'all' ? 'Tất cả' : window.erpApp.getSupplierStatusLabel(tab);
                        
                        let bgColor, textColor, badgeColor = '#1e293b';
                        if (tab === 'all') {
                            bgColor = isActive ? '#0d9488' : '#64748b';
                            textColor = '#fff';
                            badgeColor = isActive ? '#0d9488' : '#1e293b';
                        } else {
                            const colors = window.erpApp.getSupplierStatusColor(tab);
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
                            <button class="crm-chevron-tab" onclick="window.erpApp.supplierSetTab('${tab}')" 
                                    style="background:${bgColor}; color:${textColor};">
                                ${tab === 'all' ? '<span class="material-icons-outlined" style="font-size:16px;">format_list_bulleted</span>' : ''}
                                ${label}
                                <span class="crm-chevron-badge" style="color:${badgeColor}">${count}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9;">
                                <th style="padding:16px 12px; text-align:left;">${idColText}</th>
                                <th style="padding:16px 12px; text-align:left;">Tên ${ (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'đối tác' : 'nhà cung cấp'} / Ngành hàng</th>
                                <th style="padding:16px 12px; text-align:left;">Liên hệ</th>
                                <th style="padding:16px 12px; text-align:left;">Địa chỉ</th>
                                <th style="padding:16px 12px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px 12px; text-align:right;">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu phù hợp.</td></tr>
                            ` : filtered.map(s => `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#1e293b; font-size:13px;">${s.id}</div>
                                        <div style="font-size:12px; color:#f59e0b; margin-top:4px; letter-spacing:2px;">
                                            ${'★'.repeat(s.rating || 0)}${'☆'.repeat(5 - (s.rating || 0))}
                                        </div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#0d9488; font-size:14px;">${s.name}</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">${s.category || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:600; color:#475569; font-size:13px; display:flex; align-items:center; gap:6px;"><span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">person</span> ${s.contactPerson || '---'}</div>
                                        <div style="font-size:12px; color:#64748b; margin-top:4px; display:flex; align-items:center; gap:6px;"><span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">call</span> ${s.phone || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px; color:#475569; font-size:13px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                        ${s.address || '---'}
                                    </td>
                                    <td style="padding:16px 12px; text-align:center;">
                                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background:${window.erpApp.getSupplierStatusColor(s.status).bg}; color:${window.erpApp.getSupplierStatusColor(s.status).text}; border:1px solid ${window.erpApp.getSupplierStatusColor(s.status).border};">
                                            ${window.erpApp.getSupplierStatusLabel(s.status)}
                                        </span>
                                    </td>
                                    <td style="padding:16px 12px; text-align:right;">
                                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                                            <span class="material-icons-outlined" onclick="window.erpApp.openSupplierModal('${s.id}', true)" style="font-size:18px; color:#3b82f6; cursor:pointer;" title="Xem">visibility</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.openSupplierModal('${s.id}')" style="font-size:18px; color:#0d9488; cursor:pointer;" title="Sửa">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.confirmDeleteSupplier('${s.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;" title="Xóa">delete</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
        const input = document.querySelector('.search-box input');
        if (input && supplierSearchQuery) { 
            input.focus(); 
            input.setSelectionRange(supplierSearchQuery.length, supplierSearchQuery.length); 
        }
    }

    window.erpApp.getFilteredSuppliers = function() {
        const activeList = getActiveList();
        return activeList.filter(s => {
            const q = (supplierSearchQuery || '').toLowerCase();
            const sName = (s.name || '').toLowerCase();
            const sId = (s.id || '').toLowerCase();
            const sCat = (s.category || '').toLowerCase();
            
            const matchSearch = sName.includes(q) || sId.includes(q) || sCat.includes(q);
            const matchTab = supplierActiveTab === 'all' || s.status === supplierActiveTab;
            return matchSearch && matchTab;
        });
    };

    window.erpApp.getSupplierStatusLabel = function(status) {
        const m = { 'active': 'Đang hợp tác', 'potential': 'Tiềm năng', 'inactive': 'Ngừng giao dịch' };
        return m[status] || status;
    };

    window.erpApp.getSupplierStatusColor = function(status) {
        const m = {
            'active': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' }, 
            'potential': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' }, 
            'inactive': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
        };
        return m[status] || m.potential;
    };

    window.erpApp.openSupplierModal = function(id = null, isViewOnly = false) {
        const activeList = getActiveList();
        const isEdit = !!id;
        const prefix = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'DT-' : 'NCC-';
        const label = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'đối tác' : 'nhà cung cấp';

        // Đảm bảo ngành hàng xây dựng
        if (!window.erpApp.nganhHangXayDungData) {
            try {
                const saved = localStorage.getItem('erp_nganhHangXayDung');
                if (saved) {window.erpApp.nganhHangXayDungData = JSON.parse(saved);}
            } catch(e) {}
        }

        const s = isEdit ? activeList.find(x => x.id === id) : { 
            id: prefix + new Date().getFullYear() + '-' + Date.now().toString().slice(-3), 
            name: '', category: '', contactPerson: '', phone: '', email: '', address: '', status: 'potential', rating: 3,
            bankAccount: '', bankName: '', taxCode: '', providedProducts: []
        };

        const modalHtml = `
            <div class="modal-overlay" id="supplierModal" style="z-index:1000;">
                <div class="modal-content" style="max-width:900px; width:95%; border-radius:28px; background:#fff; box-shadow:0 25px 60px rgba(0,0,0,0.15);">
                    <div class="modal-header" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #fff; padding: 24px 32px; border-radius: 28px 28px 0 0; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; display:flex; align-items:center; gap:12px; font-size:20px; font-weight:900;">
                            <span class="material-icons-outlined" style="font-size:28px;">business</span> 
                            ${isViewOnly ? 'Chi tiết ' + label : (isEdit ? 'Cập nhật ' + label : 'Thêm ' + label + ' mới')}
                        </h2>
                        <button type="button" onclick="window.erpApp.closeSupplierModal()" style="background:rgba(255,255,255,0.2); border:none; border-radius:50%; width:36px; height:36px; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    <form onsubmit="${isViewOnly ? 'return false' : 'window.erpApp.saveSupplier(event)'}">
                        <input type="hidden" name="id" value="${s.id}">
                        <div class="modal-body" style="padding:32px; max-height:75vh; overflow-y:auto; background:#f8fafc;">
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:24px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Mã định danh</label>
                                    <input type="text" value="${s.id}" readonly style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; background:#f1f5f9; font-weight:700; color:#475569;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Trạng thái <span style="color:red;">*</span></label>
                                    <select name="status" ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; outline:none; font-weight:700; background:#fff;">
                                        <option value="potential" ${s.status === 'potential' ? 'selected' : ''}>Tiềm năng</option>
                                        <option value="active" ${s.status === 'active' ? 'selected' : ''}>Đang hợp tác</option>
                                        <option value="inactive" ${s.status === 'inactive' ? 'selected' : ''}>Ngừng giao dịch</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Xếp hạng</label>
                                    <div style="display:flex; gap:4px;">
                                        ${[1,2,3,4,5].map(star => `
                                            <span class="material-icons-outlined star-btn" 
                                                onclick="${isViewOnly ? '' : `window.erpApp.setSupplierRating(${star})`}"
                                                style="cursor:pointer; color:${star <= s.rating ? '#f59e0b' : '#cbd5e1'}; font-size:28px;">
                                                ${star <= s.rating ? 'star' : 'star_border'}
                                            </span>
                                        `).join('')}
                                        <input type="hidden" name="rating" id="supplierRating" value="${s.rating}">
                                    </div>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:24px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Tên ${label} <span style="color:red;">*</span></label>
                                    <input type="text" name="name" value="${s.name}" required ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:700;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Lĩnh vực</label>
                                    <select name="category" ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; background:#fff;">
                                        <option value="">-- Chọn lĩnh vực --</option>
                                        ${ (window.erpApp.nganhHangXayDungData || []).map(c => `<option value="${c.name}" ${s.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:24px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Người liên hệ</label>
                                    <input type="text" name="contactPerson" value="${s.contactPerson}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Số điện thoại <span style="color:red;">*</span></label>
                                    <input type="text" name="phone" value="${s.phone}" required ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:700;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Email</label>
                                    <input type="email" name="email" value="${s.email}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px;">
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom:24px;">
                                <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Địa chỉ</label>
                                <input type="text" name="address" value="${s.address}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px;">
                            </div>

                            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px;">
                                <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:800; color:#0d9488; display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons-outlined">account_balance</span> Thông tin thuế & Tài khoản
                                </h4>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Mã số thuế</label>
                                        <input type="text" name="taxCode" value="${s.taxCode || ''}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Số tài khoản</label>
                                        <input type="text" name="bankAccount" value="${s.bankAccount || ''}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; font-family:monospace;">
                                    </div>
                                </div>
                                <div class="form-group" style="margin-top:16px;">
                                    <label style="display:block; font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Ngân hàng</label>
                                    <input type="text" name="bankName" value="${s.bankName || ''}" ${isViewOnly ? 'readonly' : ''} style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding:24px 32px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="window.erpApp.closeSupplierModal()" style="padding:12px 24px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:12px; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                            ${isViewOnly ? '' : `
                                <button type="submit" style="padding:12px 32px; border:none; background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color:#fff; border-radius:12px; font-weight:700; cursor:pointer; box-shadow:0 8px 20px rgba(13, 148, 136, 0.2);">Lưu dữ liệu</button>
                            `}
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.closeSupplierModal = function() {
        const m = document.getElementById('supplierModal');
        if (m) {m.remove();}
    };

    window.erpApp.setSupplierRating = function(val) {
        const input = document.getElementById('supplierRating');
        if (input) {input.value = val;}
        
        const stars = document.querySelectorAll('#supplierModal .star-btn');
        stars.forEach((star, index) => {
            if (index < val) {
                star.textContent = 'star';
                star.style.color = '#f59e0b';
            } else {
                star.textContent = 'star_border';
                star.style.color = '#cbd5e1';
            }
        });
    };

    window.erpApp.saveSupplier = async function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.rating = parseInt(data.rating) || 3;
        
        const isPartner = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống');
        const label = isPartner ? 'đối tác' : 'nhà cung cấp';
        
        // Luôn làm việc với mảng gốc
        if (isPartner) {
            const index = partnersData.findIndex(c => c.id === data.id);
            if (index > -1) {
                partnersData[index] = { ...partnersData[index], ...data };
                window.erpApp.showToast(`Cập nhật hồ sơ ${label} thành công!`);
            } else {
                partnersData.unshift(data);
                // Reset filter để người dùng thấy ngay mục mới thêm
                supplierSearchQuery = '';
                supplierActiveTab = 'all';
                window.erpApp.showToast(`Thêm ${label} mới thành công!`);
            }
        } else {
            const index = suppliersData.findIndex(c => c.id === data.id);
            if (index > -1) {
                suppliersData[index] = { ...suppliersData[index], ...data };
                window.erpApp.showToast(`Cập nhật hồ sơ ${label} thành công!`);
            } else {
                suppliersData.unshift(data);
                // Reset filter
                supplierSearchQuery = '';
                supplierActiveTab = 'all';
                window.erpApp.showToast(`Thêm ${label} mới thành công!`);
            }
        }

        await saveActiveList();
        window.erpApp.closeSupplierModal();
        renderNhaCungCap(supplierModuleContext);
    };

    window.erpApp.confirmDeleteSupplier = function(id) {
        const activeList = getActiveList();
        const s = activeList.find(x => x.id === id);
        const label = (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') ? 'đối tác' : 'nhà cung cấp';
        const name = s ? s.name : id;

        const modalHtml = `
            <div class="modal-overlay" id="confirmDeleteModal" style="z-index:9999;">
                <div class="modal-content" style="width:400px; padding:32px; text-align:center; border-radius:24px; background:#fff; box-shadow:0 25px 60px rgba(0,0,0,0.2);">
                    <div style="width:72px; height:72px; background:#fee2e2; color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
                        <span class="material-icons-outlined" style="font-size:36px;">delete_forever</span>
                    </div>
                    <h3 style="margin:0 0 12px; font-size:20px; font-weight:800;">Xóa ${label}?</h3>
                    <p style="margin:0 0 28px; color:#64748b; font-size:14px; line-height:1.6;">
                        Bạn có chắc chắn muốn xóa hồ sơ <b>${name}</b>?<br>Dữ liệu sẽ bị xóa vĩnh viễn.
                    </p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        <button onclick="document.getElementById('confirmDeleteModal').remove()" style="padding:12px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                        <button id="btnConfirmDeleteFinal" style="padding:12px; border:none; background:#ef4444; color:#fff; border-radius:12px; font-weight:700; cursor:pointer;">Xác nhận xóa</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('btnConfirmDeleteFinal').onclick = async function() {
            document.getElementById('confirmDeleteModal').remove();
            
            if (supplierModuleContext === 'Quản lý dự án' || supplierModuleContext === 'Hệ thống') {
                partnersData = partnersData.filter(x => x.id !== id);
                if (window.CrudSync && window.CrudSync.deleteItem) {
                    await window.CrudSync.deleteItem('erp_partners', id);
                }
            } else {
                suppliersData = suppliersData.filter(x => x.id !== id);
                if (window.CrudSync && window.CrudSync.deleteItem) {
                    await window.CrudSync.deleteItem('erp_suppliers', id);
                }
            }

            await saveActiveList();
            window.erpApp.showToast('Đã xóa hồ sơ thành công!');
            renderNhaCungCap(supplierModuleContext);
        };
    };

    window.erpApp.supplierSearch = function(val) {
        supplierSearchQuery = val;
        renderNhaCungCap(supplierModuleContext);
    };

    window.erpApp.supplierSetTab = function(tab) {
        supplierActiveTab = tab;
        renderNhaCungCap(supplierModuleContext);
    };

    window.erpApp.renderNhaCungCap = renderNhaCungCap;
    window.erpApp.getSuppliers = () => suppliersData;
    window.erpApp.getPartners = () => partnersData;

})();
