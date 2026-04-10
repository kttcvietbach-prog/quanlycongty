
    // ==========================================
    // MODULE: Yêu cầu báo giá (RFQ)
    // ==========================================
    function renderRFQ() {
        breadcrumbCurrent.textContent = 'Yêu cầu báo giá (RFQ)';
        pageBadge.textContent = 'Mua hàng';

        const filtered = window.erpApp.getFilteredRFQ();
        
        let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('mua-hang')" style="padding:8px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; display:flex; align-items:center; gap:8px; font-weight:600; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm mã RFQ, đối tác..." 
                                value="${rfqSearchQuery}" 
                                oninput="window.erpApp.rfqSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 16px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">Tổng RFQ:</span>
                            <span style="font-size:15px; font-weight:800; color:#8b5cf6;">${filtered.length}</span>
                        </div>
                        <button onclick="window.erpApp.openRfqModal()" style="padding:10px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(139, 92, 246, 0.2);">
                            <span class="material-icons-outlined">request_quote</span> Tạo Yêu Cầu Mới
                        </button>
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:20px; background:#f1f5f9; padding:4px; border-radius:12px; width:fit-content;">
                    ${['all', 'draft', 'sent', 'received', 'closed'].map(tab => `
                        <button onclick="window.erpApp.rfqSetTab('${tab}')" 
                                style="padding:8px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; 
                                ${rfqActiveTab === tab ? 'background:#fff; color:#8b5cf6; box-shadow:0 2px 8px rgba(0,0,0,0.05);' : 'background:transparent; color:#64748b;'}">
                            ${tab === 'all' ? 'Tất cả' : window.erpApp.getRfqStatusLabel(tab)}
                        </button>
                    `).join('')}
                </div>

                <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9;">
                                <th style="padding:16px 12px; text-align:left;">Mã RFQ</th>
                                <th style="padding:16px 12px; text-align:left;">Gửi tới Nhà cung cấp</th>
                                <th style="padding:16px 12px; text-align:left;">Ngày gửi / Hạn chót</th>
                                <th style="padding:16px 12px; text-align:center;">Số mặt hàng</th>
                                <th style="padding:16px 12px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px 12px; text-align:right;">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu RFQ.</td></tr>
                            ` : filtered.map(r => `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#1e293b; font-size:13px;">${r.id}</div>
                                    </td>
                                    <td style="padding:16px 12px;" onclick="window.erpApp.openRfqModal('${r.id}')">
                                        <div style="font-weight:700; color:#8b5cf6; font-size:14px; cursor:pointer;">${r.supplier || '(Chưa xác định)'}</div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:600; color:#475569; font-size:13px;">Gửi: ${r.requestDate}</div>
                                        <div style="font-size:12px; color:#ef4444; margin-top:4px;">Hạn: ${r.deadlineDate || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px; text-align:center; font-weight:700; color:#64748b;">
                                        ${r.items ? r.items.length : 0} SP
                                    </td>
                                    <td style="padding:16px 12px; text-align:center;">
                                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background:${window.erpApp.getRfqStatusColor(r.status).bg}; color:${window.erpApp.getRfqStatusColor(r.status).text}; border:1px solid ${window.erpApp.getRfqStatusColor(r.status).border};">
                                            ${window.erpApp.getRfqStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td style="padding:16px 12px; text-align:right;">
                                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                                            <span class="material-icons-outlined" onclick="window.erpApp.simulateSendRfqEmail('${r.id}')" style="font-size:18px; color:#3b82f6; cursor:pointer;" title="Mô phỏng Gửi Email Báo Giá tới NCC">send</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.openRfqModal('${r.id}')" style="font-size:18px; color:#8b5cf6; cursor:pointer;" title="Sửa">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.confirmDeleteRFQ('${r.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;" title="Xóa">delete</span>
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
        if (input && rfqSearchQuery) { input.focus(); input.setSelectionRange(rfqSearchQuery.length, rfqSearchQuery.length); }
    }

    window.erpApp.getFilteredRFQ = function() {
        return rfqs.filter(r => {
            const q = rfqSearchQuery.toLowerCase();
            const matchSearch = r.id.toLowerCase().includes(q) || (r.supplier || '').toLowerCase().includes(q);
            const matchTab = rfqActiveTab === 'all' || r.status === rfqActiveTab;
            return matchSearch && matchTab;
        });
    }

    window.erpApp.getRfqStatusLabel = function(status) {
        const m = { 'draft': 'Bản nháp', 'sent': 'Đã gửi yêu cầu', 'received': 'Đã nhận báo giá', 'closed': 'Đã chốt' };
        return m[status] || status;
    }

    window.erpApp.getRfqStatusColor = function(status) {
        const m = {
            'draft': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }, 
            'sent': { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' }, 
            'received': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' }, 
            'closed': { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' } 
        };
        return m[status] || m.draft;
    }

    window.erpApp.simulateSendRfqEmail = function(id) {
        showToast('🔄 Đang kết nối máy chủ Mail...');
        setTimeout(() => {
            showToast('✅ Đã gửi Email Yêu cầu Báo Giá (RFQ) tới Nhà cung cấp cho luồng: ' + id);
            const index = rfqs.findIndex(x => x.id === id);
            if (index > -1 && rfqs[index].status === 'draft') {
                rfqs[index].status = 'sent';
                localStorage.setItem('erp_rfqs', JSON.stringify(rfqs));
                renderRFQ();
            }
        }, 1500);
    }

    window.erpApp.openRfqModal = function(id = null) {
        const isEdit = !!id;
        const r = isEdit ? rfqs.find(x => x.id === id) : { 
            id: 'RFQ-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-3), 
            supplier: '', requestDate: new Date().toISOString().split('T')[0], deadlineDate: '', status: 'draft', items: [] 
        };
        if (!r.items) r.items = [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'rfqModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px; width:95%;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">request_quote</span> ${isEdit ? 'Chi tiết Yêu cầu báo giá' : 'Tạo Yêu cầu báo giá (RFQ)'}</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeRfqModal()"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveRFQ(event)">
                    <input type="hidden" name="id" value="${r.id}">
                    <div class="modal-body" style="background: var(--bg-body); padding:24px; max-height:70vh; overflow-y:auto;">
                        <div class="premium-card" style="margin-bottom:20px;">
                            <h4 class="premium-section-title"><span class="material-icons-outlined">info</span> Thông tin chung</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                <div class="form-group">
                                    <label>MÃ RFQ</label>
                                    <input type="text" class="form-control" value="${r.id}" readonly style="background:#f8fafc; color:#64748b;">
                                </div>
                                <div class="form-group">
                                    <label>TRẠNG THÁI <span style="color:red;">*</span></label>
                                    <select name="status" class="form-control" style="font-weight:700;">
                                        <option value="draft" ${r.status === 'draft' ? 'selected' : ''}>Bản nháp</option>
                                        <option value="sent" ${r.status === 'sent' ? 'selected' : ''}>Đã gửi biểu mẫu y/c</option>
                                        <option value="received" ${r.status === 'received' ? 'selected' : ''}>Đã nhận phản hồi BG</option>
                                        <option value="closed" ${r.status === 'closed' ? 'selected' : ''}>Đã chốt / Đóng</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top:16px;">
                                <label>GỬI TỚI NHÀ CUNG CẤP</label>
                                <input type="text" name="supplier" class="form-control" value="${r.supplier}" placeholder="VD: Công ty TNHH Quang Minh" style="font-weight:700; color:var(--primary);">
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
                                <div class="form-group">
                                    <label>NGÀY YÊU CẦU <span style="color:red;">*</span></label>
                                    <input type="date" name="requestDate" class="form-control" value="${r.requestDate}" required>
                                </div>
                                <div class="form-group">
                                    <label>HẠN CHÓT BÁO GIÁ</label>
                                    <input type="date" name="deadlineDate" class="form-control" value="${r.deadlineDate}">
                                </div>
                            </div>
                        </div>

                        <div class="premium-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h4 class="premium-section-title" style="margin-bottom:0; padding-bottom:0; border-bottom:none;"><span class="material-icons-outlined">shopping_cart</span> Các hàng hóa cần Báo Giá</h4>
                                <button type="button" onclick="window.erpApp.addRfqItemRow()" class="btn-primary" style="padding:6px 14px; font-size:12px; background:var(--primary);">
                                    <span class="material-icons-outlined" style="font-size:14px;">add</span> Thêm hàng
                                </button>
                            </div>
                            
                            <table style="width:100%; border-collapse:collapse; border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
                                <thead style="background:#f8fafc; border-bottom:1px solid var(--border-color);">
                                    <tr>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:50%;">Tên Sản Phẩm Cần Cung Ứng</th>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:20%;">ĐVT</th>
                                        <th style="padding:10px; text-align:right; font-size:12px; width:20%;">Số lượng</th>
                                        <th style="padding:10px; text-align:center; font-size:12px; width:10%;">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody id="rfqItemsBody">
                                    ${r.items.length === 0 ? '' : r.items.map((item, idx) => `
                                        <tr style="border-bottom:1px solid #f1f5f9;">
                                            <td style="padding:10px;"><input type="text" name="rItemName_${idx}" value="${item.name}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="text" name="rItemUnit_${idx}" value="${item.unit}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="number" name="rItemQty_${idx}" value="${item.qty}" required min="1" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right; font-family:Inter,sans-serif; font-size:13px;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove();" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="window.erpApp.closeRfqModal()">Hủy bỏ</button>
                        <button type="submit" class="btn-save">Lưu thông tin</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        if(!isEdit && r.items.length === 0) window.erpApp.addRfqItemRow();

    }

    window.erpApp.closeRfqModal = function() {
        const m = document.getElementById('rfqModal');
        if (m) m.remove();
    }

    window.erpApp.addRfqItemRow = function() {
        const tbody = document.getElementById('rfqItemsBody');
        if(!tbody) return;
        const nextIdx = tbody.children.length + '_' + Date.now().toString().slice(-4);
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom:1px solid #f1f5f9;';
        tr.innerHTML = `
            <td style="padding:10px;"><input type="text" name="rItemName_${nextIdx}" value="" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="text" name="rItemUnit_${nextIdx}" value="Cái" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="number" name="rItemQty_${nextIdx}" value="1" required min="1" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #c4b5fd'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove();" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
        `;
        tbody.appendChild(tr);
    };

    window.erpApp.saveRFQ = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries()); 

        const rawKeys = Object.keys(data);
        const itemNamesKeys = rawKeys.filter(k => k.startsWith('rItemName_'));
        const items = [];
        itemNamesKeys.forEach(key => {
            const idx = key.split('_')[1];
            items.push({
                name: data['rItemName_' + idx],
                unit: data['rItemUnit_' + idx],
                qty: parseFloat(data['rItemQty_' + idx]) || 0
            });
        });

        const newR = {
            id: data.id,
            status: data.status,
            supplier: data.supplier,
            requestDate: data.requestDate,
            deadlineDate: data.deadlineDate,
            items: items
        };

        const index = rfqs.findIndex(x => x.id === newR.id);
        if (index > -1) rfqs[index] = newR;
        else rfqs.unshift(newR);

        localStorage.setItem('erp_rfqs', JSON.stringify(rfqs));
        window.erpApp.closeRfqModal();
        showToast('Đã lưu YCBG ' + newR.id);
        renderRFQ();
    };

    window.erpApp.confirmDeleteRFQ = function(id) {
        if (confirm('Trích xuất RFQ ' + id + ' khỏi hệ thống?')) {
            rfqs = rfqs.filter(x => x.id !== id);
            localStorage.setItem('erp_rfqs', JSON.stringify(rfqs));
            showToast('Đã xóa RFQ!');
            renderRFQ();
        }
    };
    
    window.erpApp.rfqSearch = function(val) {
        rfqSearchQuery = val;
        renderRFQ();
    };

    window.erpApp.rfqSetTab = function(tab) {
        rfqActiveTab = tab;
        renderRFQ();
    };
