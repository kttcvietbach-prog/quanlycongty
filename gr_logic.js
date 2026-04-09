
    // ==========================================
    // MODULE: Kiểm tra nhập hàng (GR/QC)
    // ==========================================
    function renderKiemTraNhapHang() {
        breadcrumbCurrent.textContent = 'Kiểm tra nhập hàng';
        pageBadge.textContent = 'Mua hàng';

        const filtered = window.erpApp.getFilteredGR();
        
        let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('mua-hang')" style="padding:8px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; display:flex; align-items:center; gap:8px; font-weight:600; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm mã Phiếu kiếm tra, PO, Đối tác..." 
                                value="${grSearchQuery}" 
                                oninput="window.erpApp.grSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 16px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">Tổng phiếu KT:</span>
                            <span style="font-size:15px; font-weight:800; color:#059669;">${filtered.length}</span>
                        </div>
                        <button onclick="window.erpApp.openGrModal()" style="padding:10px 24px; background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(5, 150, 105, 0.2);">
                            <span class="material-icons-outlined">fact_check</span> Tạo Phiếu Kiểm Tra
                        </button>
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:20px; background:#f1f5f9; padding:4px; border-radius:12px; width:fit-content;">
                    ${['all', 'pending', 'partial', 'completed', 'rejected'].map(tab => `
                        <button onclick="window.erpApp.grSetTab('${tab}')" 
                                style="padding:8px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; 
                                ${grActiveTab === tab ? 'background:#fff; color:#059669; box-shadow:0 2px 8px rgba(0,0,0,0.05);' : 'background:transparent; color:#64748b;'}">
                            ${tab === 'all' ? 'Tất cả' : window.erpApp.getGrStatusLabel(tab)}
                        </button>
                    `).join('')}
                </div>

                <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9;">
                                <th style="padding:16px 12px; text-align:left;">Mã Phiếu / Đơn hàng</th>
                                <th style="padding:16px 12px; text-align:left;">Đối tác giao</th>
                                <th style="padding:16px 12px; text-align:left;">Người kiểm tra / Ngày</th>
                                <th style="padding:16px 12px; text-align:center;">Số mặt hàng</th>
                                <th style="padding:16px 12px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px 12px; text-align:right;">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu Phiếu kiểm tra.</td></tr>
                            ` : filtered.map(r => `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#1e293b; font-size:13px;">${r.id}</div>
                                        <div style="font-size:12px; color:#3b82f6; margin-top:4px; font-weight:600;"><span class="material-icons-outlined" style="font-size:12px; vertical-align:-2px;">link</span> ${r.poId || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px;" onclick="window.erpApp.openGrModal('${r.id}')">
                                        <div style="font-weight:700; color:#059669; font-size:14px; cursor:pointer;">${r.supplier || '(Chưa xác định)'}</div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:600; color:#475569; font-size:13px;">${r.inspector || '---'}</div>
                                        <div style="font-size:12px; color:#64748b; margin-top:4px;">Ngày: ${r.date || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px; text-align:center; font-weight:700; color:#64748b;">
                                        ${r.items ? r.items.length : 0} SP
                                    </td>
                                    <td style="padding:16px 12px; text-align:center;">
                                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background:${window.erpApp.getGrStatusColor(r.status).bg}; color:${window.erpApp.getGrStatusColor(r.status).text}; border:1px solid ${window.erpApp.getGrStatusColor(r.status).border};">
                                            ${window.erpApp.getGrStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td style="padding:16px 12px; text-align:right;">
                                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                                            <span class="material-icons-outlined" onclick="window.erpApp.openGrModal('${r.id}')" style="font-size:18px; color:#059669; cursor:pointer;" title="Sửa/Kiểm tra">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.confirmDeleteGR('${r.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;" title="Xóa">delete</span>
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
        if (input && grSearchQuery) { input.focus(); input.setSelectionRange(grSearchQuery.length, grSearchQuery.length); }
    }

    window.erpApp.getFilteredGR = function() {
        return goodsReceipts.filter(r => {
            const q = grSearchQuery.toLowerCase();
            const matchSearch = r.id.toLowerCase().includes(q) || (r.supplier || '').toLowerCase().includes(q) || (r.poId || '').toLowerCase().includes(q);
            const matchTab = grActiveTab === 'all' || r.status === grActiveTab;
            return matchSearch && matchTab;
        });
    }

    window.erpApp.getGrStatusLabel = function(status) {
        const m = { 'pending': 'Chờ kiểm tra', 'partial': 'Nhập một phần', 'completed': 'Hoàn tất nhập', 'rejected': 'Từ chối nhận' };
        return m[status] || status;
    }

    window.erpApp.getGrStatusColor = function(status) {
        const m = {
            'pending': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' }, 
            'partial': { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' }, 
            'completed': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' }, 
            'rejected': { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' } 
        };
        return m[status] || m.pending;
    }

    window.erpApp.openGrModal = function(id = null) {
        const isEdit = !!id;
        const r = isEdit ? goodsReceipts.find(x => x.id === id) : { 
            id: 'GR-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-3), 
            poId: '', supplier: '', inspector: '', date: new Date().toISOString().split('T')[0], status: 'pending', items: [] 
        };
        if (!r.items) r.items = [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'grModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:1050px; width:95%;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">fact_check</span> ${isEdit ? 'Kiểm kê Hàng nhập' : 'Lập Phiếu Kiểm Tra Mới'}</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeGrModal()"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveGR(event)">
                    <input type="hidden" name="id" value="${r.id}">
                    <div class="modal-body" style="background: var(--bg-body); padding:24px; max-height:70vh; overflow-y:auto;">
                        <div class="premium-card" style="margin-bottom:20px;">
                            <h4 class="premium-section-title"><span class="material-icons-outlined">description</span> Thông tin phiếu</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
                                <div class="form-group">
                                    <label>MÃ PHIẾU</label>
                                    <input type="text" class="form-control" value="${r.id}" readonly style="background:#f8fafc; color:#64748b;">
                                </div>
                                <div class="form-group">
                                    <label>THAM CHIẾU PO</label>
                                    <input type="text" name="poId" class="form-control" value="${r.poId}" placeholder="VD: PO-2026-xxx">
                                </div>
                                <div class="form-group">
                                    <label>KẾT LUẬN TỔNG QUÁT <span style="color:red;">*</span></label>
                                    <select name="status" class="form-control" style="font-weight:700; color:#059669;">
                                        <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Chờ kiểm tra</option>
                                        <option value="partial" ${r.status === 'partial' ? 'selected' : ''}>Nhập một phần (Thiếu)</option>
                                        <option value="completed" ${r.status === 'completed' ? 'selected' : ''}>Hoàn tất / Nhập đủ</option>
                                        <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>Trả hàng / Không nhận</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:16px; margin-top:16px;">
                                <div class="form-group">
                                    <label>ĐƠN VỊ GIAO HÀNG / ĐỐI TÁC</label>
                                    <input type="text" name="supplier" class="form-control" value="${r.supplier}" placeholder="Cung ứng A...">
                                </div>
                                <div class="form-group">
                                    <label>NHÂN VIÊN KIỂM TRA</label>
                                    <input type="text" name="inspector" class="form-control" value="${r.inspector}" placeholder="NV Kho...">
                                </div>
                                <div class="form-group">
                                    <label>NGÀY KIỂM TRA <span style="color:red;">*</span></label>
                                    <input type="date" name="date" class="form-control" value="${r.date}" required>
                                </div>
                            </div>
                        </div>

                        <div class="premium-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h4 class="premium-section-title" style="margin-bottom:0; padding-bottom:0; border-bottom:none;"><span class="material-icons-outlined">inventory</span> Biên bản Nhận hàng chi tiết</h4>
                                <button type="button" onclick="window.erpApp.addGrItemRow()" class="btn-primary" style="padding:6px 14px; font-size:12px; background:var(--primary);">
                                    <span class="material-icons-outlined" style="font-size:14px;">add</span> Thêm hàng
                                </button>
                            </div>
                            
                            <table style="width:100%; border-collapse:collapse; border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
                                <thead style="background:#f8fafc; border-bottom:1px solid var(--border-color);">
                                    <tr>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:22%;">Tên Hàng Hóa</th>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:8%;">ĐVT</th>
                                        <th style="padding:10px; text-align:right; font-size:12px; width:12%;">SL Yêu cầu</th>
                                        <th style="padding:10px; text-align:right; font-size:12px; width:12%;">SL Đã Nhận</th>
                                        <th style="padding:10px; text-align:center; font-size:12px; width:14%;">Đánh Giá</th>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:26%;">Link Bằng Chứng</th>
                                        <th style="padding:10px; text-align:center; font-size:12px; width:6%;">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody id="grItemsBody">
                                    ${r.items.length === 0 ? '' : r.items.map((item, idx) => `
                                        <tr style="border-bottom:1px solid #f1f5f9;">
                                            <td style="padding:10px;"><input type="text" name="gItemName_${idx}" value="${item.name}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="text" name="gItemUnit_${idx}" value="${item.unit}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="number" name="gItemQtyOrd_${idx}" value="${item.qtyOrdered}" required min="1" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="number" name="gItemQtyRec_${idx}" value="${item.qtyReceived}" required min="0" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:#ecfdf5; text-align:right; font-weight:700; color:#059669; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px; text-align:center;">
                                                <select name="gItemCond_${idx}" class="form-control" style="padding:4px; font-size:12px;">
                                                    <option value="Tốt" ${item.condition === 'Tốt' ? 'selected' : ''}>Tốt</option>
                                                    <option value="Lỗi" ${item.condition === 'Lỗi' ? 'selected' : ''}>Hàng lỗi</option>
                                                    <option value="Thiếu" ${item.condition === 'Thiếu' ? 'selected' : ''}>Giao thiếu</option>
                                                    <option value="Sai hàng" ${item.condition === 'Sai hàng' ? 'selected' : ''}>Giao sai</option>
                                                </select>
                                            </td>
                                            <td style="padding:10px;"><input type="url" name="gItemImg_${idx}" value="${item.defectImg || ''}" placeholder="HTTP..." style="width:100%; border:1px dashed #cbd5e1; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-size:11px; font-family:Inter,sans-serif;" onfocus="this.style.border='1px solid #f87171'" onblur="this.style.border='1px dashed #cbd5e1'"></td>
                                            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove();" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <div style="font-size:12px; color:#64748b; font-style:italic; margin-top:12px;">* Nếu có hàng lỗi, vui lòng dán URL hình ảnh hiện trường vào ô Link Bằng Chứng để lưu trữ.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="window.erpApp.closeGrModal()">Hủy bỏ</button>
                        <button type="submit" class="btn-save">Chốt sổ Biên bản</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        if(!isEdit && r.items.length === 0) window.erpApp.addGrItemRow();

    }

    window.erpApp.closeGrModal = function() {
        const m = document.getElementById('grModal');
        if (m) m.remove();
    }

    window.erpApp.addGrItemRow = function() {
        const tbody = document.getElementById('grItemsBody');
        if(!tbody) return;
        const nextIdx = tbody.children.length + '_' + Date.now().toString().slice(-4);
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom:1px solid #f1f5f9;';
        tr.innerHTML = `
            <td style="padding:10px;"><input type="text" name="gItemName_${nextIdx}" value="" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="text" name="gItemUnit_${nextIdx}" value="Cái" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="number" name="gItemQtyOrd_${nextIdx}" value="1" required min="1" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="number" name="gItemQtyRec_${nextIdx}" value="1" required min="0" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:#ecfdf5; text-align:right; font-weight:700; color:#059669;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px; text-align:center;">
                <select name="gItemCond_${nextIdx}" style="padding:4px; border:1px solid #e2e8f0; border-radius:4px; outline:none; width:90%; font-size:12px;">
                    <option value="Tốt">Tốt</option>
                    <option value="Lỗi">Hàng lỗi</option>
                    <option value="Thiếu">Giao thiếu</option>
                    <option value="Sai hàng">Giao sai</option>
                </select>
            </td>
            <td style="padding:10px;"><input type="url" name="gItemImg_${nextIdx}" value="" placeholder="HTTP..." style="width:100%; border:1px dashed #cbd5e1; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-size:11px;" onfocus="this.style.border='1px solid #f87171'" onblur="this.style.border='1px dashed #cbd5e1'"></td>
            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove();" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
        `;
        tbody.appendChild(tr);
    };

    window.erpApp.saveGR = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries()); 

        const rawKeys = Object.keys(data);
        const itemNamesKeys = rawKeys.filter(k => k.startsWith('gItemName_'));
        const items = [];
        itemNamesKeys.forEach(key => {
            const idx = key.split('_')[1];
            items.push({
                name: data['gItemName_' + idx],
                unit: data['gItemUnit_' + idx],
                qtyOrdered: parseFloat(data['gItemQtyOrd_' + idx]) || 0,
                qtyReceived: parseFloat(data['gItemQtyRec_' + idx]) || 0,
                condition: data['gItemCond_' + idx],
                defectImg: data['gItemImg_' + idx] || ''
            });
        });

        const newR = {
            id: data.id,
            poId: data.poId,
            status: data.status,
            supplier: data.supplier,
            inspector: data.inspector,
            date: data.date,
            items: items
        };

        const index = goodsReceipts.findIndex(x => x.id === newR.id);
        if (index > -1) goodsReceipts[index] = newR;
        else goodsReceipts.unshift(newR);

        localStorage.setItem('erp_goodsReceipts', JSON.stringify(goodsReceipts));
        window.erpApp.closeGrModal();
        showToast('Đã lưu dữ liệu Phiếu Kiểm Tra Hàng!');
        renderKiemTraNhapHang();
    };

    window.erpApp.confirmDeleteGR = function(id) {
        if (confirm('Lập tức Hủy Biên Bản nhận hàng ' + id + '?')) {
            goodsReceipts = goodsReceipts.filter(x => x.id !== id);
            localStorage.setItem('erp_goodsReceipts', JSON.stringify(goodsReceipts));
            showToast('Đã xóa dữ liệu GR!');
            renderKiemTraNhapHang();
        }
    };
    
    window.erpApp.grSearch = function(val) {
        grSearchQuery = val;
        renderKiemTraNhapHang();
    };

    window.erpApp.grSetTab = function(tab) {
        grActiveTab = tab;
        renderKiemTraNhapHang();
    };
