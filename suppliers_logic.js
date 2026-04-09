
    // ==========================================
    // MODULE: Nhà cung cấp (Suppliers)
    // ==========================================
    function renderNhaCungCap() {
        breadcrumbCurrent.textContent = 'Nhà cung cấp';
        pageBadge.textContent = 'Mua hàng';

        const filtered = window.erpApp.getFilteredSuppliers();
        
        let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('mua-hang')" style="padding:8px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; display:flex; align-items:center; gap:8px; font-weight:600; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm kiếm đối tác cung ứng..." 
                                value="${supplierSearchQuery}" 
                                oninput="window.erpApp.supplierSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 16px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">QL Đối Tác:</span>
                            <span style="font-size:15px; font-weight:800; color:#0d9488;">${filtered.length}</span>
                        </div>
                        <button onclick="window.erpApp.openSupplierModal()" style="padding:10px 24px; background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(13, 148, 136, 0.2);">
                            <span class="material-icons-outlined">domain_add</span> Thêm Nhà Cung Cấp
                        </button>
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:20px; background:#f1f5f9; padding:4px; border-radius:12px; width:fit-content;">
                    ${['all', 'active', 'potential', 'inactive'].map(tab => `
                        <button onclick="window.erpApp.supplierSetTab('${tab}')" 
                                style="padding:8px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; 
                                ${supplierActiveTab === tab ? 'background:#fff; color:#0d9488; box-shadow:0 2px 8px rgba(0,0,0,0.05);' : 'background:transparent; color:#64748b;'}">
                            ${tab === 'all' ? 'Tất cả' : window.erpApp.getSupplierStatusLabel(tab)}
                        </button>
                    `).join('')}
                </div>

                <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9;">
                                <th style="padding:16px 12px; text-align:left;">Mã NCC / Đánh giá</th>
                                <th style="padding:16px 12px; text-align:left;">Tên đối tác / Ngành hàng</th>
                                <th style="padding:16px 12px; text-align:left;">Liên hệ</th>
                                <th style="padding:16px 12px; text-align:left;">Địa chỉ</th>
                                <th style="padding:16px 12px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px 12px; text-align:right;">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu NCC.</td></tr>
                            ` : filtered.map(s => `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#1e293b; font-size:13px;">${s.id}</div>
                                        <div style="font-size:12px; color:#f59e0b; margin-top:4px; letter-spacing:2px;">
                                            ${'★'.repeat(s.rating)}${'☆'.repeat(5 - s.rating)}
                                        </div>
                                    </td>
                                    <td style="padding:16px 12px;" onclick="window.erpApp.openSupplierModal('${s.id}')">
                                        <div style="font-weight:700; color:#0d9488; font-size:14px; cursor:pointer;">${s.name}</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">${s.category || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:600; color:#475569; font-size:13px; display:flex; align-items:center; gap:6px;"><span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">person</span> ${s.contactPerson || '---'}</div>
                                        <div style="font-size:12px; color:#64748b; margin-top:4px; display:flex; align-items:center; gap:6px;"><span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">call</span> ${s.phone || '---'}</div>
                                        <div style="font-size:12px; color:#64748b; margin-top:2px; display:flex; align-items:center; gap:6px;"><span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">email</span> ${s.email || '---'}</div>
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
        if (input && supplierSearchQuery) { input.focus(); input.setSelectionRange(supplierSearchQuery.length, supplierSearchQuery.length); }
    }

    window.erpApp.getFilteredSuppliers = function() {
        return suppliers.filter(s => {
            const q = supplierSearchQuery.toLowerCase();
            const matchSearch = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q);
            const matchTab = supplierActiveTab === 'all' || s.status === supplierActiveTab;
            return matchSearch && matchTab;
        });
    }

    window.erpApp.getSupplierStatusLabel = function(status) {
        const m = { 'active': 'Đang hợp tác', 'potential': 'Tiềm năng', 'inactive': 'Ngừng giao dịch' };
        return m[status] || status;
    }

    window.erpApp.getSupplierStatusColor = function(status) {
        const m = {
            'active': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' }, 
            'potential': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' }, 
            'inactive': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' } 
        };
        return m[status] || m.potential;
    }

    window.erpApp.openSupplierModal = function(id = null) {
        const isEdit = !!id;
        const s = isEdit ? suppliers.find(x => x.id === id) : { 
            id: 'NCC-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-3), 
            name: '', category: '', contactPerson: '', phone: '', email: '', address: '', status: 'potential', rating: 3 
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'supplierModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:700px; width:95%;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">domain</span> ${isEdit ? 'Hồ sơ Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeSupplierModal()"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveSupplier(event)">
                    <input type="hidden" name="id" value="${s.id}">
                    <div class="modal-body" style="background: var(--bg-body); padding:24px; max-height:70vh; overflow-y:auto;">
                        <div class="premium-card" style="margin-bottom:20px;">
                            <h4 class="premium-section-title"><span class="material-icons-outlined">badge</span> Nhận diện đối tác</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
                                <div class="form-group">
                                    <label>MÃ NCC</label>
                                    <input type="text" class="form-control" value="${s.id}" readonly style="background:#f8fafc; color:#64748b;">
                                </div>
                                <div class="form-group">
                                    <label>TRẠNG THÁI <span style="color:red;">*</span></label>
                                    <select name="status" class="form-control" style="font-weight:700;">
                                        <option value="potential" ${s.status === 'potential' ? 'selected' : ''}>Tiềm năng</option>
                                        <option value="active" ${s.status === 'active' ? 'selected' : ''}>Đang hợp tác</option>
                                        <option value="inactive" ${s.status === 'inactive' ? 'selected' : ''}>Ngừng giao dịch</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>PHÂN HẠNG (SAO) <span style="color:red;">*</span></label>
                                    <input type="number" name="rating" class="form-control" value="${s.rating}" min="1" max="5" required style="font-weight:700; text-align:center;">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-top:16px;">
                                <div class="form-group">
                                    <label>TÊN ĐỐI TÁC CUNG ỨNG <span style="color:red;">*</span></label>
                                    <input type="text" name="name" class="form-control" value="${s.name}" required placeholder="VD: Công ty CP Bánh mỳ..." style="font-weight:700; color:var(--primary);">
                                </div>
                                <div class="form-group">
                                    <label>NGÀNH HÀNG</label>
                                    <input type="text" name="category" class="form-control" value="${s.category}" placeholder="Văn phòng phẩm...">
                                </div>
                            </div>
                        </div>

                        <div class="premium-card">
                            <h4 class="premium-section-title"><span class="material-icons-outlined">contact_phone</span> Thông tin liên hệ</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
                                <div class="form-group">
                                    <label>NGƯỜI ĐẠI DIỆN</label>
                                    <input type="text" name="contactPerson" class="form-control" value="${s.contactPerson}" placeholder="...">
                                </div>
                                <div class="form-group">
                                    <label>SỐ ĐIỆN THOẠI <span style="color:red;">*</span></label>
                                    <input type="text" name="phone" class="form-control" value="${s.phone}" required placeholder="09xxxx...">
                                </div>
                                <div class="form-group">
                                    <label>EMAIL</label>
                                    <input type="email" name="email" class="form-control" value="${s.email}" placeholder="abc@email.com">
                                </div>
                            </div>
                            <div class="form-group" style="margin-top:16px;">
                                <label>ĐỊA CHỈ TRỤ SỞ</label>
                                <input type="text" name="address" class="form-control" value="${s.address}" placeholder="...">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="window.erpApp.closeSupplierModal()">Hủy bỏ</button>
                        <button type="submit" class="btn-save">Lưu thông tin</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }


    window.erpApp.closeSupplierModal = function() {
        const m = document.getElementById('supplierModal');
        if (m) m.remove();
    }

    window.erpApp.saveSupplier = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries()); 

        const index = suppliers.findIndex(c => c.id === data.id);
        if (index > -1) {
            suppliers[index] = { ...suppliers[index], ...data, rating: parseInt(data.rating)||3 };
            showToast('Đã cập nhật HS Đối tác ' + data.id);
        } else {
            suppliers.unshift({ ...data, rating: parseInt(data.rating)||3 });
            showToast('Đã thêm NCC mới!');
        }

        localStorage.setItem('erp_suppliers', JSON.stringify(suppliers));
        window.erpApp.closeSupplierModal();
        renderNhaCungCap();
    };

    window.erpApp.confirmDeleteSupplier = function(id) {
        if (confirm('Bạn có chắc chắn muốn xóa hệ thống đối tác ' + id + '?')) {
            suppliers = suppliers.filter(c => c.id !== id);
            localStorage.setItem('erp_suppliers', JSON.stringify(suppliers));
            showToast('Đã xóa dữ liệu!');
            renderNhaCungCap();
        }
    };
    
    window.erpApp.supplierSearch = function(val) {
        supplierSearchQuery = val;
        renderNhaCungCap();
    };

    window.erpApp.supplierSetTab = function(tab) {
        supplierActiveTab = tab;
        renderNhaCungCap();
    };
