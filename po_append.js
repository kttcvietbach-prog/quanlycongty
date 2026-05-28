(function () {
    'use strict';

    // ==========================================
    // MODULE: Đơn đặt hàng (PO)
    // ==========================================
    let poSearchQuery = '';
    let poActiveTab = 'all';
    const COLLECTION_PO = 'erp_purchaseOrders';
    let purchaseOrders = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData(COLLECTION_PO) : [];

    function renderDonDatHang() {
        if (window.erpApp.updateBreadcrumb) {
            window.erpApp.updateBreadcrumb('Đơn đặt hàng (PO)', 'Mua hàng');
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        const filtered = window.erpApp.getFilteredPO();
        
        let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('mua-hang')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm mã PO, nhà cung cấp..." 
                                value="${poSearchQuery}" 
                                oninput="window.erpApp.poSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 16px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">Tổng Tiền:</span>
                            <span style="font-size:15px; font-weight:800; color:#10b981;">${window.erpApp.formatValue(filtered.reduce((sum, item) => sum + item.totalAmount, 0))}</span>
                        </div>
                        <button onclick="window.erpApp.openPoModal()" style="padding:10px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">
                            <span class="material-icons-outlined">add_shopping_cart</span> Tạo đơn đặt hàng
                        </button>
                    </div>
                </div>

                <!-- Tabs Area (Chevron Style) -->
                <div class="crm-chevron-tabs">
                    ${['all', 'draft', 'ordered', 'received', 'cancelled'].map(tab => {
                        const searchMatch = purchaseOrders.filter(r => {
                            const q = poSearchQuery.toLowerCase();
                            return r.id.toLowerCase().includes(q) || (r.supplier || '').toLowerCase().includes(q);
                        });
                        const count = tab === 'all' ? searchMatch.length : searchMatch.filter(c => c.status === tab).length;
                        const isActive = poActiveTab === tab;
                        const label = tab === 'all' ? 'Tất cả' : window.erpApp.getPoStatusLabel(tab);
                        
                        let bgColor, textColor, badgeColor = '#1e293b';
                        if (tab === 'all') {
                            bgColor = isActive ? '#10b981' : '#64748b';
                            textColor = '#fff';
                            badgeColor = isActive ? '#10b981' : '#1e293b';
                        } else {
                            const colors = window.erpApp.getPoStatusColor(tab);
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
                            <button class="crm-chevron-tab" onclick="window.erpApp.poSetTab('${tab}')" 
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
                                <th style="padding:16px 12px; text-align:left;">Mã PO</th>
                                <th style="padding:16px 12px; text-align:left;">Nhà cung cấp</th>
                                <th style="padding:16px 12px; text-align:left;">Ngày lập / Ngày giao</th>
                                <th style="padding:16px 12px; text-align:right;">Tổng tiền</th>
                                <th style="padding:16px 12px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px 12px; text-align:right;">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu PO.</td></tr>
                            ` : filtered.map(p => `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:700; color:#1e293b; font-size:13px;">${p.id}</div>
                                        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">Buyer: ${p.buyer || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px;" onclick="window.erpApp.openPoModal('${p.id}')">
                                        <div style="font-weight:700; color:#10b981; font-size:14px; cursor:pointer;">${p.supplier}</div>
                                    </td>
                                    <td style="padding:16px 12px;">
                                        <div style="font-weight:600; color:#475569; font-size:13px;">Đặt: ${p.orderDate}</div>
                                        <div style="font-size:12px; color:#64748b; margin-top:4px;">Giao: ${p.expectedDeliveryDate || '---'}</div>
                                    </td>
                                    <td style="padding:16px 12px; text-align:right;">
                                        <div style="font-weight:800; color:#1e293b; font-size:14px;">${window.erpApp.formatValue(p.totalAmount)}</div>
                                        ${p.shippingFee > 0 ? `<div style="font-size:11px; color:#94a3b8; margin-top:4px;">+ Ship: ${window.erpApp.formatValue(p.shippingFee)}</div>` : ''}
                                    </td>
                                    <td style="padding:16px 12px; text-align:center;">
                                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background:${window.erpApp.getPoStatusColor(p.status).bg}; color:${window.erpApp.getPoStatusColor(p.status).text}; border:1px solid ${window.erpApp.getPoStatusColor(p.status).border};">
                                            ${window.erpApp.getPoStatusLabel(p.status)}
                                        </span>
                                    </td>
                                    <td style="padding:16px 12px; text-align:right;">
                                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                                            <span class="material-icons-outlined" onclick="window.erpApp.openPoModal('${p.id}')" style="font-size:18px; color:#10b981; cursor:pointer;" title="Sửa">edit</span>
                                            <span class="material-icons-outlined" onclick="window.erpApp.confirmDeletePO('${p.id}')" style="font-size:18px; color:#ef4444; cursor:pointer;" title="Xóa">delete</span>
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
        if (input && poSearchQuery) { input.focus(); input.setSelectionRange(poSearchQuery.length, poSearchQuery.length); }
    }

    window.erpApp.getFilteredPO = function() {
        return purchaseOrders.filter(p => {
            const q = poSearchQuery.toLowerCase();
            const matchSearch = p.supplier.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.buyer || '').toLowerCase().includes(q);
            const matchTab = poActiveTab === 'all' || p.status === poActiveTab;
            return matchSearch && matchTab;
        });
    };

    window.erpApp.getPoStatusLabel = function(status) {
        const m = { 'draft': 'Nháp', 'ordered': 'Đã đặt hàng', 'received': 'Đã nhận hàng', 'cancelled': 'Đã hủy' };
        return m[status] || status;
    };

    window.erpApp.getPoStatusColor = function(status) {
        const m = {
            'draft': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }, 
            'ordered': { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' }, 
            'received': { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' }, 
            'cancelled': { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' } 
        };
        return m[status] || m.draft;
    };

    window.erpApp.openPoModal = function(id = null) {
        const isEdit = !!id;
        const p = isEdit ? purchaseOrders.find(x => x.id === id) : { 
            id: 'PO-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-3), 
            supplier: '', orderDate: new Date().toISOString().split('T')[0], expectedDeliveryDate: '', subTotal: 0, shippingFee: 0, totalAmount: 0, status: 'draft', buyer: '', items: [] 
        };
        if (!p.items) {p.items = [];}

        const modalHtml = `
            <div class="modal-overlay" id="poModal">
                <div class="modal-content" style="width:900px; max-width:95%; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.15);">
                    <div class="modal-header" style="background:#f8fafc; border-bottom:1px solid #f1f5f9; padding:20px 24px; position:relative;">
                        <h2 style="margin:0; font-size:17px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <div style="width:36px; height:36px; background:#ecfdf5; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#10b981;">
                                <span class="material-icons-outlined" style="font-size:20px;">shopping_bag</span>
                            </div>
                            ${isEdit ? 'Chi tiết đơn đặt hàng (PO)' : 'Tạo đơn đặt hàng mới'}
                        </h2>
                        <button type="button" onclick="window.erpApp.closePoModal()" style="position:absolute; top:20px; right:20px; width:32px; height:32px; border-radius:50%; border:none; background:#fff; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                            <span class="material-icons-outlined" style="font-size:18px;">close</span>
                        </button>
                    </div>
                    <form id="poForm" onsubmit="window.erpApp.savePO(event)">
                        <input type="hidden" name="id" value="${p.id}">
                        <div class="modal-body" style="padding:24px; max-height:70vh; overflow-y:auto;">
                            <!-- Top row: ID, Status, Buyer -->
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Mã PO</label>
                                    <input type="text" value="${p.id}" readonly style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; font-weight:600; color:#64748b;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Trạng thái <span style="color:red;">*</span></label>
                                    <select name="status" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none; cursor:pointer;">
                                        <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Nháp</option>
                                        <option value="ordered" ${p.status === 'ordered' ? 'selected' : ''}>Đã đặt hàng</option>
                                        <option value="received" ${p.status === 'received' ? 'selected' : ''}>Đã nhận hàng</option>
                                        <option value="cancelled" ${p.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Người lập đơn (Buyer) <span style="color:red;">*</span></label>
                                    <input type="text" name="buyer" value="${p.buyer}" required placeholder="Tên nhân viên..." style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none;">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:20px; margin-bottom:30px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Nhà cung cấp / Đối tác <span style="color:red;">*</span></label>
                                    <select name="supplier" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none; cursor:pointer; font-weight:700; color:#10b981;">
                                        <option value="">-- Chọn nhà cung cấp --</option>
                                        ${(window.erpApp.getSuppliers ? window.erpApp.getSuppliers() : []).map(s => `
                                            <option value="${s.name}" ${p.supplier === s.name ? 'selected' : ''}>${s.name} (${s.id})</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Ngày đặt hàng</label>
                                    <input type="date" name="orderDate" value="${p.orderDate}" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:13px; font-weight:700; color:#475569; margin-bottom:8px;">Ngày dự kiến giao</label>
                                    <input type="date" name="expectedDeliveryDate" value="${p.expectedDeliveryDate}" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none;">
                                </div>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h3 style="margin:0; font-size:14px; font-weight:800; color:#1e293b;">Danh sách sản phẩm mua</h3>
                                <button type="button" onclick="window.erpApp.addPoItemRow()" style="padding:6px 12px; border:1px solid #d1fae5; background:#ecfdf5; color:#10b981; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:4px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">add</span> Thêm dòng
                                </button>
                            </div>
                            
                            <table style="width:100%; border-collapse:collapse; margin-bottom:20px; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;" id="poItemsTable">
                                <thead style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
                                    <tr>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:40%;">Tên Sản Phẩm</th>
                                        <th style="padding:10px; text-align:left; font-size:12px; width:15%;">ĐVT</th>
                                        <th style="padding:10px; text-align:right; font-size:12px; width:15%;">Số lượng</th>
                                        <th style="padding:10px; text-align:right; font-size:12px; width:20%;">Đơn giá (VNĐ)</th>
                                        <th style="padding:10px; text-align:center; font-size:12px; width:10%;">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody id="poItemsBody">
                                    ${p.items.length === 0 ? '' : p.items.map((item, idx) => `
                                        <tr style="border-bottom:1px solid #f1f5f9;">
                                            <td style="padding:10px;"><input type="text" name="itemName_${idx}" value="${item.name}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="text" name="itemUnit_${idx}" value="${item.unit}" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="text" name="itemQty_${idx}" value="${window.erpApp.formatValue(item.qty)}" required oninput="window.erpApp.formatNumberInput(this); window.erpApp.calcPoTotal()" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px;"><input type="text" name="itemPrice_${idx}" value="${window.erpApp.formatValue(item.price)}" required oninput="window.erpApp.formatNumberInput(this); window.erpApp.calcPoTotal()" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
                                            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove(); window.erpApp.calcPoTotal()" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div style="display:flex; justify-content:flex-end;">
                                <div style="width:300px; background:#f8fafc; border-radius:12px; padding:16px; border:1px solid #e2e8f0;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                        <span style="font-size:13px; font-weight:600; color:#64748b;">Tổng tiền hàng</span>
                                        <input type="text" name="subTotal" id="poSubTotal" value="${window.erpApp.formatValue(p.subTotal)}" readonly style="width:150px; text-align:right; border:none; background:transparent; font-weight:700; color:#475569; outline:none;">
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                        <span style="font-size:13px; font-weight:600; color:#64748b;">Phí vận chuyển</span>
                                        <input type="text" name="shippingFee" id="poShippingFee" value="${window.erpApp.formatValue(p.shippingFee)}" oninput="window.erpApp.formatNumberInput(this); window.erpApp.calcPoTotal()" style="width:150px; text-align:right; border:1px solid #e2e8f0; border-radius:6px; padding:4px; font-weight:700; color:#475569; outline:none; background:#fff;">
                                    </div>
                                    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:14px; font-weight:800; color:#1e293b;">TỔNG THÀNH TIỀN</span>
                                        <input type="text" name="totalAmount" id="poTotalAmount" value="${window.erpApp.formatValue(p.totalAmount)}" readonly style="width:150px; text-align:right; border:none; background:transparent; font-weight:900; color:#10b981; font-size:16px; outline:none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding:16px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="window.erpApp.closePoModal()" style="padding:10px 20px; border:1px solid #e2e8f0; background:#fff; color:#475569; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px;">Hủy bỏ</button>
                            <button type="submit" style="padding:10px 24px; border:none; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">Lưu đơn đặt hàng</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if(!isEdit && p.items.length === 0) {window.erpApp.addPoItemRow();}
    };

    window.erpApp.closePoModal = function() {
        const m = document.getElementById('poModal');
        if (m) {m.remove();}
    };

    window.erpApp.addPoItemRow = function() {
        const tbody = document.getElementById('poItemsBody');
        if(!tbody) {return;}
        const nextIdx = tbody.children.length + '_' + Date.now().toString().slice(-4);
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom:1px solid #f1f5f9;';
        tr.innerHTML = `
            <td style="padding:10px;"><input type="text" name="itemName_${nextIdx}" value="" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="text" name="itemUnit_${nextIdx}" value="Cái" required style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="text" name="itemQty_${nextIdx}" value="1" required oninput="window.erpApp.formatNumberInput(this); window.erpApp.calcPoTotal()" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px;"><input type="text" name="itemPrice_${nextIdx}" value="0" required oninput="window.erpApp.formatNumberInput(this); window.erpApp.calcPoTotal()" style="width:100%; border:1px solid transparent; padding:4px 8px; border-radius:4px; outline:none; background:transparent; text-align:right;" onfocus="this.style.border='1px solid #6ee7b7'" onblur="this.style.border='1px solid transparent'"></td>
            <td style="padding:10px; text-align:center;"><span class="material-icons-outlined" onclick="this.closest('tr').remove(); window.erpApp.calcPoTotal()" style="color:#ef4444; font-size:16px; cursor:pointer;">delete</span></td>
        `;
        tbody.appendChild(tr);
    };

    window.erpApp.calcPoTotal = function() {
        const form = document.getElementById('poForm');
        if(!form) {return;}
        let sub = 0;
        const tbody = document.getElementById('poItemsBody');
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(tr => {
            const inputs = tr.querySelectorAll('input');
            const qty = window.erpApp.parseVND(inputs[2].value) || 0;
            const price = window.erpApp.parseVND(inputs[3].value) || 0;
            sub += (qty * price);
        });
        const ship = window.erpApp.parseVND(document.getElementById('poShippingFee').value) || 0;
        document.getElementById('poSubTotal').value = window.erpApp.formatValue(sub);
        document.getElementById('poTotalAmount').value = window.erpApp.formatValue(sub + ship);
    };

    window.erpApp.savePO = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries()); // id, status, buyer, supplier, orderDate, expectedDeliveryDate, subTotal, shippingFee, totalAmount

        // Extract items
        const rawKeys = Object.keys(data);
        const itemNamesKeys = rawKeys.filter(k => k.startsWith('itemName_'));
        const items = [];
        itemNamesKeys.forEach(key => {
            const idx = key.split('_')[1];
            items.push({
                name: data['itemName_' + idx],
                unit: data['itemUnit_' + idx],
                qty: window.erpApp.parseVND(data['itemQty_' + idx]) || 0,
                price: window.erpApp.parseVND(data['itemPrice_' + idx]) || 0
            });
        });

        const newPo = {
            id: data.id,
            status: data.status,
            buyer: data.buyer,
            supplier: data.supplier,
            orderDate: data.orderDate,
            expectedDeliveryDate: data.expectedDeliveryDate,
            subTotal: window.erpApp.parseVND(data.subTotal) || 0,
            shippingFee: window.erpApp.parseVND(data.shippingFee) || 0,
            totalAmount: window.erpApp.parseVND(data.totalAmount) || 0,
            items: items
        };

        const index = purchaseOrders.findIndex(x => x.id === newPo.id);
        if (index > -1) {purchaseOrders[index] = newPo;}
        else {purchaseOrders.unshift(newPo);}

        window.erpApp._setData(COLLECTION_PO, purchaseOrders);
        
        // Sync to Firebase
        if (window.CrudSync && window.CrudSync.saveItem) {
            window.CrudSync.saveItem(COLLECTION_PO, newPo, 'id');
        }

        window.erpApp.closePoModal();
        
        // Gửi thông báo hệ thống
        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                index > -1 ? `Đã cập nhật đơn đặt hàng: ${newPo.id}` : `Đã tạo đơn đặt hàng mới: ${newPo.id}`,
                'shopping_bag',
                index > -1 ? 'indigo' : 'green',
                'mua-hang'
            );
        }

        window.erpApp.showToast('Đã lưu đơn đặt hàng ' + newPo.id, 'success');
        renderDonDatHang();
    };

    window.erpApp.confirmDeletePO = function(id) {
        window.erpApp.showConfirm(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa đơn đặt hàng ' + id + '?',
            async function() {
                purchaseOrders = purchaseOrders.filter(x => x.id !== id);
                window.erpApp._setData(COLLECTION_PO, purchaseOrders);
                
                // Sync to Firebase
                if (window.CrudSync && window.CrudSync.deleteItem) {
                    await window.CrudSync.deleteItem(COLLECTION_PO, id);
                }

                // Gửi thông báo hệ thống
                if (window.erpApp.addNotification) {
                    window.erpApp.addNotification(
                        `Đã xóa đơn đặt hàng: ${id}`,
                        'delete',
                        'red',
                        'mua-hang'
                    );
                }

                window.erpApp.showToast('Đã xóa đơn đặt hàng!', 'info');
                renderDonDatHang();
            }
        );
    };
    
    window.erpApp.poSearch = function(val) {
        poSearchQuery = val;
        renderDonDatHang();
    };

    window.erpApp.poSetTab = function(tab) {
        poActiveTab = tab;
        renderDonDatHang();
    };

    window.erpApp.renderDonDatHang = renderDonDatHang;
    window.erpApp.getPurchaseOrders = () => purchaseOrders;

})();
