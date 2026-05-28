    // ==========================================
    // MODULE: Giá thành sản xuất
    // ==========================================
    const COLLECTION_COST = 'erp_productionCosts';
    let productionCosts = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData(COLLECTION_COST) : [
        { moId: 'MO-2026-0041', product: 'Bàn ghế phòng khách', materialCost: 25000000, laborCost: 5000000, overheadCost: 2000000, totalCost: 32000000, qty: 50 },
        { moId: 'MO-2026-0043', product: 'Giường ngủ hiện đại 1m8', materialCost: 40000000, laborCost: 8000000, overheadCost: 3000000, totalCost: 51000000, qty: 35 }
    ];

    window.erpApp.renderProductionCost = function() {
        window.erpApp.activeProductionSubModule = 'cost';
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');
        
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Giá thành sản xuất';}
        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        // Check Permissions via System Matrix
        const canEdit = window.erpApp.userHasAccess('Sản xuất', 'edit');
        const canDelete = window.erpApp.userHasAccess('Sản xuất', 'delete');

        const html = `
            <div class="cost-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Phân Tích Giá Thành Sản Xuất</h2>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:1000px;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">LỆNH SẢN XUẤT</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">SẢN PHẨM</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">SẢN LƯỢNG</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CP VẬT TƯ</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CP NHÂN CÔNG</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right;">CP SX CHUNG</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#0f172a; text-align:right;">TỔNG GIÁ</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#2563eb; text-align:right;">GIÁ VỐN/SP</th>
                                <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#64748b; text-align:center;">TÁC VỤ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productionCosts.map(cost => {
                                const unitCost = (cost.totalCost / cost.qty).toFixed(0);
                                return `
                                <tr style="border-bottom:1px solid #f8fafc; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 12px; font-weight:800; color:#3b82f6;">${cost.moId}</td>
                                    <td style="padding:16px 12px; font-weight:700; color:#475569;">${cost.product}</td>
                                    <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${cost.qty}</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#64748b; text-align:right;">${window.erpApp.formatValue(cost.materialCost)} đ</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#64748b; text-align:right;">${window.erpApp.formatValue(cost.laborCost)} đ</td>
                                    <td style="padding:16px 12px; font-weight:600; color:#64748b; text-align:right;">${window.erpApp.formatValue(cost.overheadCost)} đ</td>
                                    <td style="padding:16px 12px; font-weight:900; color:#ef4444; text-align:right;">${window.erpApp.formatValue(cost.totalCost)} đ</td>
                                    <td style="padding:16px 12px; font-weight:900; color:#10b981; text-align:right;">${window.erpApp.formatValue(unitCost)} đ</td>
                                    <td style="padding:16px 12px; text-align:center;">
                                        <div style="display:flex; justify-content:center; gap:8px;">
                                            <button onclick="window.erpApp.viewCostDetail('${cost.moId}')" title="Xem chi tiết" style="width:32px; height:32px; border-radius:8px; border:none; background:#eff6ff; color:#3b82f6; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='#fff'" onmouseout="this.style.background='#eff6ff'; this.style.color='#3b82f6'">
                                                <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                            </button>
                                            ${canEdit ? `
                                            <button onclick="window.erpApp.openEditCostModal('${cost.moId}')" title="Sửa chi phí" style="width:32px; height:32px; border-radius:8px; border:none; background:#f0fdf4; color:#10b981; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#10b981'">
                                                <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                            </button>
                                            ` : ''}
                                            ${canDelete ? `
                                            <button onclick="window.erpApp.deleteCost('${cost.moId}')" title="Xóa" style="width:32px; height:32px; border-radius:8px; border:none; background:#fef2f2; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='#fef2f2'; this.style.color='#ef4444'">
                                                <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                                            </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    };

    window.erpApp.deleteCost = function(moId) {
        window.erpApp.showConfirm(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa dữ liệu giá thành của lệnh ${moId}?`,
            async function() {
                const index = productionCosts.findIndex(c => c.moId === moId);
                if (index > -1) {
                    productionCosts.splice(index, 1);
                    window.erpApp._setData(COLLECTION_COST, productionCosts);
                    
                    // Sync to Firebase
                    if (window.CrudSync && window.CrudSync.deleteItem) {
                        await window.CrudSync.deleteItem(COLLECTION_COST, moId, 'moId');
                    }
                    
                    window.erpApp.renderProductionCost();
                    window.erpApp.showToast('Đã xóa dữ liệu giá thành', 'info');
                }
            }
        );
    };

    window.erpApp.viewCostDetail = function(moId) {
        const cost = productionCosts.find(c => c.moId === moId);
        if(!cost) {return;}
        
        // Check permissions for buttons inside modal
        const canEdit = window.erpApp.userHasAccess('Sản xuất', 'edit');

        const unitCost = (cost.totalCost / cost.qty).toFixed(0);

        const modalHtml = `
            <div id="costDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1000; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:24px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Chi tiết Giá Thành</h2>
                        <button onclick="document.getElementById('costDetailModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:16px; font-size:14px; font-weight:600; color:#475569;">
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">LỆNH SẢN XUẤT</span>
                            <span style="color:#3b82f6; font-weight:900; font-size:16px;">${cost.moId}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">SẢN PHẨM</span>
                            <span style="color:#1e293b; font-weight:800;">${cost.product}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">SẢN LƯỢNG</span>
                            <span style="color:#1e293b; font-weight:800;">${cost.qty}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">CHI PHÍ VẬT TƯ (NVL)</span>
                            <span style="color:#64748b; font-weight:800;">${window.erpApp.formatValue(cost.materialCost)} đ</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">CHI PHÍ NHÂN CÔNG</span>
                            <span style="color:#64748b; font-weight:800;">${window.erpApp.formatValue(cost.laborCost)} đ</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px;">CHI PHÍ SẢN XUẤT CHUNG</span>
                            <span style="color:#64748b; font-weight:800;">${window.erpApp.formatValue(cost.overheadCost)} đ</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                            <span style="color:#1e293b; font-weight:900; font-size:13px;">TỔNG GIÁ THÀNH</span>
                            <span style="color:#ef4444; font-weight:900; font-size:16px;">${window.erpApp.formatValue(cost.totalCost)} đ</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#10b981; font-weight:900; font-size:13px;">GIÁ VỐN/SẢN PHẨM</span>
                            <span style="color:#10b981; font-weight:900; font-size:16px;">${window.erpApp.formatValue(unitCost)} đ</span>
                        </div>
                    </div>
                    ${canEdit ? `
                    <div style="margin-top:24px; display:flex; gap:12px;">
                        <button onclick="window.erpApp.openEditCostModal('${cost.moId}')" style="flex:1; padding:12px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <span class="material-icons-outlined" style="font-size:18px;">edit</span> Điều chỉnh chi phí
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.openEditCostModal = function(moId) {
        const cost = productionCosts.find(c => c.moId === moId);
        if(!cost) {return;}

        const detailModal = document.getElementById('costDetailModal');
        if(detailModal) {detailModal.remove();}

        const modalHtml = `
            <div id="costEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:24px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Điều chỉnh Chi phí SP</h2>
                        <button onclick="document.getElementById('costEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:4px;">SẢN PHẨM: ${cost.product}</label>
                            <div style="font-size:14px; font-weight:800; color:#1e293b;">MO: ${cost.moId}</div>
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px;">CHI PHÍ VẬT TƯ (NVL)</label>
                            <input type="text" id="edit_cost_material" value="${window.erpApp.formatValue(cost.materialCost)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px;">CHI PHÍ NHÂN CÔNG</label>
                            <input type="text" id="edit_cost_labor" value="${window.erpApp.formatValue(cost.laborCost)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px;">CHI PHÍ SẢN XUẤT CHUNG</label>
                            <input type="text" id="edit_cost_overhead" value="${window.erpApp.formatValue(cost.overheadCost)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                        </div>
                        <button onclick="window.erpApp.saveCost('${cost.moId}')" style="width:100%; padding:14px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:14px; font-weight:700; cursor:pointer; box-shadow:0 10px 15px -3px rgba(15, 23, 42, 0.3);">
                            Lưu và Tính lại giá thành
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveCost = function(moId) {
        const materialCost = window.erpApp.parseVND(document.getElementById('edit_cost_material').value);
        const laborCost = window.erpApp.parseVND(document.getElementById('edit_cost_labor').value);
        const overheadCost = window.erpApp.parseVND(document.getElementById('edit_cost_overhead').value);
        
        const totalCost = materialCost + laborCost + overheadCost;

        const index = productionCosts.findIndex(c => c.moId === moId);
        if(index > -1) {
            productionCosts[index] = { ...productionCosts[index], materialCost, laborCost, overheadCost, totalCost };
            window.erpApp._setData(COLLECTION_COST, productionCosts);
            
            // Sync to Firebase
            if (window.CrudSync && window.CrudSync.saveItem) {
                window.CrudSync.saveItem(COLLECTION_COST, productionCosts[index], 'moId');
            }
            
            document.getElementById('costEditModal').remove();
            window.erpApp.renderProductionCost();
            window.erpApp.showToast('Cập nhật giá thành thành công!', 'success');
        }
    };
