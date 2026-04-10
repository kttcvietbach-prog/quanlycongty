
    // ==========================================
    // MODULE: Định mức nguyên vật liệu (BOM)
    // ==========================================
    let bomSearchQuery = '';
    let bomActiveTab = 'all';
    let boms = [
        { 
            id: 'BOM-A001', 
            productName: 'Áo sơ mi nam công sở', 
            version: '1.0', 
            baseQty: 1, 
            status: 'active',
            items: [
                { name: 'Vải Cotton', unit: 'Mét', qty: 1.5, scrapPercent: 5, estimatePrice: 120000 },
                { name: 'Nút áo', unit: 'Cái', qty: 7, scrapPercent: 0, estimatePrice: 1000 },
                { name: 'Chỉ may', unit: 'Cuộn', qty: 0.1, scrapPercent: 2, estimatePrice: 15000 }
            ]
        },
        { 
            id: 'BOM-Q001', 
            productName: 'Quần tây Âu premium', 
            version: '1.2', 
            baseQty: 1, 
            status: 'draft',
            items: [
                { name: 'Vải Wool', unit: 'Mét', qty: 1.8, scrapPercent: 10, estimatePrice: 350000 },
                { name: 'Khóa kéo', unit: 'Cái', qty: 1, scrapPercent: 0, estimatePrice: 5000 },
                { name: 'Cúc quần', unit: 'Cái', qty: 2, scrapPercent: 0, estimatePrice: 2000 }
            ]
        }
    ];

    try {
        const savedBoms = JSON.parse(localStorage.getItem('erp_boms'));
        if (savedBoms && Array.isArray(savedBoms)) {
            boms = savedBoms;
        }
    } catch (e) {}

    function renderBOM() {
        breadcrumbCurrent.textContent = 'Định mức nguyên vật liệu (BOM)';
        pageBadge.textContent = 'Sản xuất';

        const filteredBoms = boms.filter(bom => {
            const matchesSearch = bom.id.toLowerCase().includes(bomSearchQuery.toLowerCase()) || 
                                bom.productName.toLowerCase().includes(bomSearchQuery.toLowerCase());
            const matchesTab = bomActiveTab === 'all' || bom.status === bomActiveTab;
            return matchesSearch && matchesTab;
        });

        const html = `
            <div class="bom-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer; transition:all 0.2s;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:400px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;">search</span>
                            <input type="text" placeholder="Tìm tên sản phẩm hoặc mã BOM..." value="${bomSearchQuery}" 
                                oninput="window.erpApp.handleBomSearch(this.value)"
                                style="width:100%; padding:12px 12px 12px 42px; border:1px solid #e2e8f0; border-radius:14px; outline:none; font-size:14px; transition:all 0.2s; background:#fcfdfe;" onfocus="this.style.border='1px solid #8b5cf6'; this.style.boxShadow='0 0 0 4px rgba(139, 92, 246, 0.1)'" onblur="this.style.border='1px solid #e2e8f0'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    <button onclick="window.erpApp.openBomModal()" style="padding:12px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(139, 92, 246, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                        <span class="material-icons-outlined">add_circle</span> Thiết lập Định mức mới
                    </button>
                </div>

                <div class="tabs" style="display:flex; gap:12px; margin-bottom:24px; background:#f1f5f9; padding:6px; border-radius:14px; width:fit-content;">
                    ${['all', 'active', 'draft', 'obsolete'].map(tab => `
                        <button onclick="window.erpApp.setBomTab('${tab}')" style="padding:10px 20px; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.3s; ${bomActiveTab === tab ? 'background:#fff; color:#8b5cf6; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);' : 'background:transparent; color:#64748b;'}">
                            ${tab === 'all' ? 'Tất cả' : (tab === 'active' ? 'Đang áp dụng' : (tab === 'draft' ? 'Bản thảo' : 'Ngưng sử dụng'))}
                        </button>
                    `).join('')}
                </div>

                <div class="bom-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:24px;">
                    ${filteredBoms.length === 0 ? `
                        <div style="grid-column: 1/-1; text-align:center; padding:80px; background:#fff; border-radius:24px; border:2px dashed #e2e8f0;">
                            <span class="material-icons-outlined" style="font-size:48px; color:#cbd5e1; margin-bottom:16px;">account_tree</span>
                            <div style="color:#64748b; font-weight:600;">Không tìm thấy định mức nào phù hợp</div>
                        </div>
                    ` : filteredBoms.map(bom => {
                        const totalCost = bom.items.reduce((sum, item) => sum + (item.qty * item.estimatePrice * (1 + (item.scrapPercent || 0)/100)), 0);
                        return `
                        <div class="bom-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition:all 0.3s; cursor:pointer; position:relative; overflow:hidden;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0, 0, 0, 0.1)'; this.style.borderColor='#ddd6fe'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.05)'; this.style.borderColor='#e2e8f0'">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                                <div>
                                    <div style="font-size:12px; font-weight:800; color:#8b5cf6; letter-spacing:0.5px; margin-bottom:4px;">${bom.id}</div>
                                    <h3 style="margin:0; font-size:18px; font-weight:800; color:#1e293b;">${bom.productName}</h3>
                                </div>
                                <span style="padding:6px 14px; border-radius:10px; font-size:11px; font-weight:800; text-transform:uppercase; background:${bom.status === 'active' ? '#dcfce7' : (bom.status === 'draft' ? '#fef3c7' : '#f1f5f9')}; color:${bom.status === 'active' ? '#16a34a' : (bom.status === 'draft' ? '#b45309' : '#64748b')}">
                                    ${bom.status === 'active' ? 'Sử dụng' : (bom.status === 'draft' ? 'Nháp' : 'Đã đóng')}
                                </span>
                            </div>

                            <div style="display:flex; gap:20px; margin-bottom:20px; padding:16px; background:#f8fafc; border-radius:16px;">
                                <div style="flex:1;">
                                    <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:2px;">Phiên bản</div>
                                    <div style="font-weight:700; color:#475569; font-size:15px;">v${bom.version}</div>
                                </div>
                                <div style="flex:1; border-left:1px solid #e2e8f0; padding-left:20px;">
                                    <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:2px;">Tổng nguyên liệu</div>
                                    <div style="font-weight:700; color:#475569; font-size:15px;">${bom.items.length} Hạng mục</div>
                                </div>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:2px;">Ước tính giá vốn</div>
                                    <div style="font-weight:900; color:#10b981; font-size:20px;">${new Intl.NumberFormat('vi-VN').format(totalCost)} đ</div>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button onclick="event.stopPropagation(); window.erpApp.cloneBOM('${bom.id}')" style="width:38px; height:38px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; color:#64748b; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Nhân bản">
                                        <span class="material-icons-outlined" style="font-size:18px;">content_copy</span>
                                    </button>
                                    <button onclick="window.erpApp.openBomModal('${bom.id}')" style="width:38px; height:38px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; color:#8b5cf6; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Sửa chi tiết">
                                        <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
        window.erpApp.boms = boms;
    }

    window.erpApp.handleBomSearch = function(val) {
        bomSearchQuery = val;
        renderBOM();
    };

    window.erpApp.setBomTab = function(tab) {
        bomActiveTab = tab;
        renderBOM();
    };

    window.erpApp.cloneBOM = function(id) {
        const source = boms.find(b => b.id === id);
        if (!source) return;
        
        const clone = JSON.parse(JSON.stringify(source));
        clone.id = `BOM-CLONE-${Date.now().toString().slice(-4)}`;
        clone.productName = `${source.productName} (Bản sao)`;
        clone.status = 'draft';
        
        boms.unshift(clone);
        localStorage.setItem('erp_boms', JSON.stringify(boms));
        showToast('Đã nhân bản định mức thành công!');
        renderBOM();
    };

    window.erpApp.openBomModal = function(id = null) {
        const bom = id ? boms.find(b => b.id === id) : {
            id: `BOM-${Date.now().toString().slice(-4)}`,
            productName: '',
            version: '1.0',
            baseQty: 1,
            status: 'draft',
            items: []
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'bomModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; height: 90vh;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">account_tree</span> ${id ? 'Cập nhật Định mức' : 'Thiết lập Định mức mới'}</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeBomModal()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 24px;">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
                        <div class="premium-card bg-light">
                            <h4 class="premium-section-title">
                                <span class="material-icons-outlined">info</span> Thông tin thành phẩm
                            </h4>
                            <div style="margin-bottom:16px;">
                                <label>Tên Thành phẩm Sản xuất <span style="color:var(--status-red)">*</span></label>
                                <input type="text" id="bomProductName" class="form-control" value="${bom.productName}" placeholder="VD: Áo sơ mi nam công sở..." style="font-weight: 600;">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px;">
                                <div>
                                    <label>Mã Định mức</label>
                                    <input type="text" id="bomCode" class="form-control" value="${bom.id}" style="background:#f1f5f9; font-weight:700; color:var(--primary);" readonly>
                                </div>
                                <div>
                                    <label>Phiên bản</label>
                                    <input type="text" id="bomVersion" class="form-control" value="${bom.version}" style="font-weight:600;">
                                </div>
                                <div>
                                    <label>Số lượng cơ sở</label>
                                    <input type="number" id="bomBaseQty" class="form-control" value="${bom.baseQty}" style="font-weight:600;">
                                </div>
                            </div>
                        </div>

                        <div class="premium-card" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
                            <div style="font-size:12px; font-weight:800; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase;">Tổng giá vốn dự tính</div>
                            <div id="bomTotalCost" style="font-size:28px; font-weight:900; color:#10b981;">0 đ</div>
                            <div style="font-size:11px; color:var(--text-muted); font-weight:700; margin-top:4px;">(Cho ${bom.baseQty} Đơn vị TP)</div>
                        </div>
                    </div>

                    <div class="premium-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h4 class="premium-section-title" style="margin-bottom:0; border-bottom:0; padding-bottom:0;">
                                <span class="material-icons-outlined">list_alt</span> Bảng thành phần vật liệu
                            </h4>
                            <button class="btn-primary" onclick="window.erpApp.addBomItemRow()" style="padding:8px 16px; font-size:12px; border-radius:8px;">
                                <span class="material-icons-outlined">add</span> Thêm nguyên liệu
                            </button>
                        </div>

                        <div style="overflow-x:auto; border-top: 1px solid var(--border-color); padding-top: 16px;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="text-align:left; color:var(--text-muted); font-size:11px; text-transform:uppercase;">
                                        <th style="padding:8px 0;">Nguyên vật liệu</th>
                                        <th style="padding:8px 10px;">ĐVT</th>
                                        <th style="padding:8px 10px; text-align:right;">Số lượng</th>
                                        <th style="padding:8px 10px; text-align:right;">Hao hụt (%)</th>
                                        <th style="padding:8px 10px; text-align:right;">Đơn giá</th>
                                        <th style="padding:8px 0; text-align:center;">#</th>
                                    </tr>
                                </thead>
                                <tbody id="bomItemsList">
                                    ${bom.items.map((item, index) => renderBomItemRow(item, index)).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div style="flex:1; display:flex; align-items:center; gap:12px;">
                        <label style="font-size:13px; font-weight:700; color:var(--text-muted);">Trạng thái:</label>
                        <select id="bomStatus" class="form-control" style="width:auto; height:36px; padding:0 12px; font-size:13px; font-weight:700; color:var(--primary);">
                            <option value="draft" ${bom.status === 'draft' ? 'selected' : ''}>Bản thảo</option>
                            <option value="active" ${bom.status === 'active' ? 'selected' : ''}>Đang áp dụng</option>
                            <option value="obsolete" ${bom.status === 'obsolete' ? 'selected' : ''}>Ngưng sử dụng</option>
                        </select>
                    </div>
                    <button type="button" class="btn-cancel" onclick="window.erpApp.closeBomModal()">Đóng</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.saveBOM()"><span class="material-icons-outlined">save</span> Lưu cấu hình BOM</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        window.erpApp.updateBomTotal();

        document.getElementById('bomModal').addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                window.erpApp.updateBomTotal();
            }
        });
    }
        window.erpApp.updateBomTotal();

        // Add auto-calculation listeners
        document.getElementById('bomModal').addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                window.erpApp.updateBomTotal();
            }
        });
    }

    function renderBomItemRow(item = { name: '', unit: 'Mét', qty: 0, scrapPercent: 0, estimatePrice: 0 }, index) {
        return `
            <tr class="bom-item-row" data-index="${index}" style="border-bottom:1px solid #f8fafc;">
                <td style="padding:12px 0;"><input type="text" class="item-name form-control" value="${item.name}" placeholder="Tên vật liệu..." style="background:transparent; border:none; border-bottom:1px dashed #cbd5e1; border-radius:0; padding:4px 0; font-weight:700;"></td>
                <td style="padding:12px 10px;"><input type="text" class="item-unit form-control" value="${item.unit}" style="background:transparent; border:none; padding:4px 0; font-size:13px; color:var(--text-muted);"></td>
                <td style="padding:12px 10px;"><input type="number" class="item-qty form-control" value="${item.qty}" style="width:80px; text-align:right; font-weight:700;"></td>
                <td style="padding:12px 10px;"><input type="number" class="item-scrap form-control" value="${item.scrapPercent}" style="width:60px; text-align:right; color:#c2410c;"></td>
                <td style="padding:12px 10px;"><input type="number" class="item-price form-control" value="${item.estimatePrice}" style="width:120px; text-align:right; font-weight:700; color:#10b981;"></td>
                <td style="padding:12px 0; text-align:center;">
                    <button onclick="this.closest('tr').remove(); window.erpApp.updateBomTotal();" style="border:none; background:transparent; color:var(--status-red); cursor:pointer;">
                        <span class="material-icons-outlined" style="font-size:20px;">delete_outline</span>
                    </button>
                </td>
            </tr>
        `;
    }

    window.erpApp.addBomItemRow = function() {
        const list = document.getElementById('bomItemsList');
        const rows = list.querySelectorAll('.bom-item-row');
        const newIndex = rows.length;
        list.insertAdjacentHTML('beforeend', renderBomItemRow(undefined, newIndex));
    };

    window.erpApp.updateBomTotal = function() {
        const rows = document.querySelectorAll('.bom-item-row');
        let total = 0;
        rows.forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const scrap = parseFloat(row.querySelector('.item-scrap').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            total += qty * price * (1 + scrap/100);
        });
        document.getElementById('bomTotalCost').textContent = new Intl.NumberFormat('vi-VN').format(total) + ' đ';
    };

    window.erpApp.saveBOM = function() {
        const id = document.getElementById('bomCode').value;
        const productName = document.getElementById('bomProductName').value;
        if (!productName) { showToast('Vui lòng nhập tên thành phẩm!', 'error'); return; }

        const items = [];
        document.querySelectorAll('.bom-item-row').forEach(row => {
            items.push({
                name: row.querySelector('.item-name').value,
                unit: row.querySelector('.item-unit').value,
                qty: parseFloat(row.querySelector('.item-qty').value) || 0,
                scrapPercent: parseFloat(row.querySelector('.item-scrap').value) || 0,
                estimatePrice: parseFloat(row.querySelector('.item-price').value) || 0
            });
        });

        const newBom = {
            id,
            productName,
            version: document.getElementById('bomVersion').value,
            baseQty: parseFloat(document.getElementById('bomBaseQty').value) || 1,
            status: document.getElementById('bomStatus').value,
            items
        };

        const idx = boms.findIndex(b => b.id === id);
        if (idx > -1) boms[idx] = newBom;
        else boms.unshift(newBom);

        localStorage.setItem('erp_boms', JSON.stringify(boms));
        showToast('Đã lưu cấu hình định mức nguyên liệu thành công!');
        window.erpApp.closeBomModal();
        renderBOM();
    };

    window.erpApp.closeBomModal = function() {
        const m = document.getElementById('bomModal');
        if (m) m.remove();
    };

    window.erpApp.renderBOM = renderBOM;
