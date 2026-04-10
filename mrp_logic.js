(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let mrpPlans = [
        { id: 'MRP-2026-0001', material: 'Thép tấm 2mm', sku: 'RM-STL-002', requiredQty: 500, inStock: 120, toPurchase: 380, dueDate: '2026-04-15', moId: 'MO-2026-0041', moProduct: 'Khung tủ điện tiêu chuẩn', status: 'urgent', unit: 'kg', leadTime: '5 ngày' },
        { id: 'MRP-2026-0002', material: 'Sơn tĩnh điện Blue-7035', sku: 'RM-PNT-035', requiredQty: 200, inStock: 250, toPurchase: 0, dueDate: '2026-04-18', moId: 'MO-2026-0042', moProduct: 'Vỏ máy biến áp 250kVA', status: 'ready', unit: 'lít', leadTime: '3 ngày' }
    ];

    try {
        const savedMRP = JSON.parse(localStorage.getItem('erp_mrpPlans'));
        if (savedMRP && Array.isArray(savedMRP)) mrpPlans = savedMRP;
    } catch (e) { console.error('Error loading MRP data:', e); }

    function renderMRP() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Kế hoạch nguyên vật liệu (MRP)';
        if (pageBadge) pageBadge.textContent = 'Kế hoạch & Điều hành';

        // Calculate KPIs
        const totalItems = mrpPlans.length;
        const shortages = mrpPlans.filter(p => p.toPurchase > 0).length;
        const urgentItems = mrpPlans.filter(p => p.status === 'urgent').length;

        const html = `
            <div class="mrp-module" style="animation: fadeIn 0.4s ease-out; padding: 2px;">
                <!-- Header -->
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b; letter-spacing:-0.5px;">Phân Tích Nhu Cầu Vật Tư (MRP)</h2>
                            <div style="font-size:13px; color:#94a3b8; font-weight:600;">Tính toán nguyên vật liệu dựa trên lệnh sản xuất (MO) và tồn kho thực tế.</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.runMRPAnalysis()" style="padding:12px 28px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:14px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(59, 130, 246, 0.4); transform: translateY(0); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <span class="material-icons-outlined">psychology</span> Tính toán MRP
                        </button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="premium-card shadow-sm" style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:56px; height:56px; background:#eff6ff; color:#3b82f6; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:28px;"><span class="material-icons-outlined">inventory_2</span></div>
                        <div>
                            <div style="font-size:12px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Tổng vật tư cần thiết</div>
                            <div style="font-size:26px; font-weight:950; color:#1e293b;">${totalItems} <span style="font-size:14px; color:#94a3b8; font-weight:700;">SKUs</span></div>
                        </div>
                    </div>
                    <div class="premium-card shadow-sm" style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:56px; height:56px; background:#fff7ed; color:#f59e0b; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:28px;"><span class="material-icons-outlined">shopping_cart</span></div>
                        <div>
                            <div style="font-size:12px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Vật tư đang thiếu</div>
                            <div style="font-size:26px; font-weight:950; color:#f59e0b;">${shortages} <span style="font-size:14px; color:#94a3b8; font-weight:700;">Yêu cầu mua</span></div>
                        </div>
                    </div>
                    <div class="premium-card shadow-sm" style="background:linear-gradient(135deg, #1e293b, #0f172a); border:1px solid #e2e8f0; padding:24px; border-radius:24px; display:flex; align-items:center; gap:20px; color:#fff;">
                        <div style="width:56px; height:56px; background:rgba(255,255,255,0.1); color:#fff; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:28px;"><span class="material-icons-outlined">warning_amber</span></div>
                        <div>
                            <div style="font-size:12px; font-weight:850; color:rgba(255,255,255,0.6); text-transform:uppercase; letter-spacing:0.5px;">Yêu cầu khẩn cấp</div>
                            <div style="font-size:26px; font-weight:950; color:#fff;">${urgentItems} <span style="font-size:14px; opacity:0.6; font-weight:700;">Ưu tiên cao</span></div>
                        </div>
                    </div>
                </div>

                <!-- MRP Data Table -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:28px; padding:20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);">
                    <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                        <thead>
                            <tr style="color:#94a3b8; font-size:11px; font-weight:850; text-transform:uppercase; letter-spacing:1px;">
                                <th style="padding:16px; text-align:left;">Vật tư / SKU</th>
                                <th style="padding:16px; text-align:left;">Lệnh SX (MO)</th>
                                <th style="padding:16px; text-align:center;">Cần thiết</th>
                                <th style="padding:16px; text-align:center;">Tồn kho</th>
                                <th style="padding:16px; text-align:center;">Cần mua</th>
                                <th style="padding:16px; text-align:center;">Trạng thái</th>
                                <th style="padding:16px; text-align:right;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mrpPlans.map(p => `
                                <tr class="mrp-row" style="background:#f8fafc; border-radius:16px; transition: all 0.2s; cursor:pointer;" onclick="window.erpApp.viewMRPDetail('${p.id}')">
                                    <td style="padding:18px 16px; border-radius:16px 0 0 16px;">
                                        <div style="font-weight:900; color:#1e293b; font-size:14.5px;">${p.material}</div>
                                        <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-top:4px;">${p.sku}</div>
                                    </td>
                                    <td style="padding:16px;">
                                        <div style="font-weight:800; color:#3b82f6; font-size:13px;">${p.moId}</div>
                                        <div style="font-size:10px; color:#64748b; font-weight:600; margin-top:2px;">${p.moProduct}</div>
                                    </td>
                                    <td style="padding:16px; text-align:center; font-weight:850; color:#1e293b; font-size:14px;">${p.requiredQty} <span style="font-size:10px; color:#94a3b8;">${p.unit}</span></td>
                                    <td style="padding:16px; text-align:center; font-weight:850; color:#10b981; font-size:14px;">${p.inStock} <span style="font-size:10px; color:#94a3b8;">${p.unit}</span></td>
                                    <td style="padding:16px; text-align:center;">
                                        <div style="font-weight:950; color:${p.toPurchase > 0 ? '#ef4444' : '#10b981'}; font-size:16px;">
                                            ${p.toPurchase > 0 ? p.toPurchase : '<span class="material-icons-outlined" style="font-size:18px; vertical-align:middle;">check_circle</span>'} 
                                            <span style="font-size:10px; opacity:0.6;">${p.unit}</span>
                                        </div>
                                    </td>
                                    <td style="padding:16px; text-align:center;">
                                        <span style="padding:6px 14px; border-radius:30px; font-size:10px; font-weight:900; background:${p.status === 'urgent' ? '#fee2e2' : (p.status === 'ready' ? '#dcfce7' : '#fef3c7')}; color:${p.status === 'urgent' ? '#dc2626' : (p.status === 'ready' ? '#166534' : '#92400e')}; border:1px solid ${p.status === 'urgent' ? '#fecaca' : (p.status === 'ready' ? '#bbf7d0' : '#fde68a')}; text-transform:uppercase; letter-spacing:0.3px;">
                                            ${p.status === 'urgent' ? 'Thiếu hụt' : (p.status === 'ready' ? 'Đã sẵn sàng' : 'Chờ kiểm tra')}
                                        </span>
                                    </td>
                                    <td style="padding:16px 16px; text-align:right; border-radius:0 16px 16px 0;">
                                        <div style="display:flex; justify-content:flex-end; gap:8px;">
                                            <button class="action-btn" style="width:36px; height:36px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; color:#64748b; cursor:pointer;" onclick="event.stopPropagation(); window.erpApp.viewMRPDetail('${p.id}')">
                                                <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                            </button>
                                            <button class="action-btn" style="width:36px; height:36px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; color:#3b82f6; cursor:pointer;" onclick="event.stopPropagation(); ">
                                                <span class="material-icons-outlined" style="font-size:18px;">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>
                .mrp-row:hover { background: #f1f5f9 !important; transform: scale(1.002); }
                .action-btn:hover { background:#f8fafc !important; color:#1e293b !important; border-color:#cbd5e1 !important; transform: translateY(-2px); transition: all 0.2s; }
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            window.scrollTo(0,0);
        }
    }

    window.erpApp.runMRPAnalysis = function () {
        if(typeof showToast === 'function') showToast('Đang thực hiện phân tích nhu cầu vật tư thực tế...', 'info');
        
        const moList = JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        const bomList = window.erpApp.boms || JSON.parse(localStorage.getItem('erp_boms')) || [];
        const products = JSON.parse(localStorage.getItem('erp_products')) || [];

        const newMrp = [];
        moList.forEach(mo => {
            const bom = bomList.find(b => b.product === mo.product);
            if (bom) {
                bom.materials.forEach(mat => {
                    const prod = products.find(p => p.name === mat.name);
                    const currentStock = prod ? prod.stock : 0;
                    const totalRequired = mat.qty * mo.quantity;
                    const short = Math.max(0, totalRequired - currentStock);

                    newMrp.push({
                        id: 'MRP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                        material: mat.name,
                        sku: prod ? prod.sku : 'N/A',
                        requiredQty: totalRequired,
                        inStock: currentStock,
                        toPurchase: short,
                        dueDate: mo.endDate,
                        moId: mo.id,
                        moProduct: mo.product,
                        status: short > (currentStock * 0.5) ? 'urgent' : (short === 0 ? 'ready' : 'pending'),
                        unit: mat.unit || 'cái',
                        leadTime: '3-5 ngày'
                    });
                });
            }
        });

        if (newMrp.length > 0) {
            mrpPlans = newMrp;
            localStorage.setItem('erp_mrpPlans', JSON.stringify(mrpPlans));
            setTimeout(() => {
                if(typeof showToast === 'function') showToast('Tính toán MRP hoàn tất! Dữ liệu đã được cập nhật.');
                renderMRP();
            }, 800);
        } else {
            if(typeof showToast === 'function') showToast('Không tìm thấy dữ liệu MO hoặc BOM để phân tích!', 'warning');
        }
    };

    window.erpApp.viewMRPDetail = function (id) {
        const mrp = mrpPlans.find(p => p.id === id);
        if (!mrp) return;

        const fmt = new Intl.NumberFormat('vi-VN');
        const statusColor = mrp.status === 'urgent' ? '#ef4444' : (mrp.status === 'ready' ? '#10b981' : '#f59e0b');
        const statusLabel = mrp.status === 'urgent' ? 'Thiếu hụt nghiêm trọng' : (mrp.status === 'ready' ? 'Sẵn sàng sản xuất' : 'Cần bổ sung/Điều tra');

        const detailHtml = `
            <div id="mrpDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);" onclick="this.remove()">
                <div class="modal-content" style="width:580px; border-radius:32px; padding:36px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; background:#eff6ff; color:#3b82f6; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">fact_check</span>
                            </div>
                            <div>
                                <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Chi Tiết Nhu Cầu Vật Tư</h2>
                                <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px;">${mrp.id}</div>
                            </div>
                        </div>
                        <button onclick="document.getElementById('mrpDetailModal').remove()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition: all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                            <span class="material-icons-outlined" style="font-size:20px;">close</span>
                        </button>
                    </div>

                    <div style="display:grid; gap:24px;">
                        <!-- Status Bar -->
                        <div style="background:${statusColor}10; border-radius:16px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; border:1px solid ${statusColor}20;">
                            <span style="font-size:13px; font-weight:800; color:#1e293b;">Tình trạng Đáp ứng</span>
                            <span style="font-weight:950; color:${statusColor}; font-size:14px; text-transform:uppercase; background:#fff; padding:4px 12px; border-radius:20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">${statusLabel}</span>
                        </div>

                        <!-- Data Grid -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div style="background:#f8fafc; padding:20px; border-radius:20px; border:1px solid #f1f5f9;">
                                <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Vật tư / SKU</div>
                                <div style="font-weight:900; color:#1e293b; font-size:15px;">${mrp.material}</div>
                                <div style="font-weight:700; color:#64748b; font-size:12px; margin-top:4px;">SKU: ${mrp.sku}</div>
                            </div>
                            <div style="background:#f8fafc; padding:20px; border-radius:20px; border:1px solid #f1f5f9;">
                                <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Cho Lệnh SX</div>
                                <div style="font-weight:900; color:#3b82f6; font-size:15px;">${mrp.moId}</div>
                                <div style="font-weight:700; color:#64748b; font-size:12px; margin-top:4px;">Sản phẩm: ${mrp.moProduct}</div>
                            </div>
                        </div>

                        <!-- Detailed Numbers -->
                        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; display:grid; gap:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:#64748b;">Số lượng cần thiết (BOM)</span>
                                <span style="font-size:18px; font-weight:900; color:#1e293b;">${fmt.format(mrp.requiredQty)} ${mrp.unit}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px dashed #e2e8f0;">
                                <span style="font-size:14px; font-weight:700; color:#10b981;">Tồn kho hiện tại</span>
                                <span style="font-size:18px; font-weight:900; color:#10b981;">${fmt.format(mrp.inStock)} ${mrp.unit}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                                <span style="font-size:15px; font-weight:900; color:#1e293b;">Cần mua thêm</span>
                                <span style="font-size:24px; font-weight:950; color:${mrp.toPurchase > 0 ? '#ef4444' : '#10b981'};">
                                    ${mrp.toPurchase > 0 ? fmt.format(mrp.toPurchase) : 'Hoàn tất'} ${mrp.toPurchase > 0 ? mrp.unit : ''}
                                </span>
                            </div>
                        </div>

                        <!-- Recommendations -->
                        <div>
                            <div style="font-size:12px; font-weight:850; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Đề xuất xử lý</div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; padding:12px 16px; border-radius:12px; font-size:13px; font-weight:600; color:#475569;">
                                    <span class="material-icons-outlined" style="color:#f59e0b; font-size:18px;">schedule</span>
                                    <span>Hạn cuối cần vật tư: <b>${mrp.dueDate}</b> (Lead time: ${mrp.leadTime})</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; padding:12px 16px; border-radius:12px; font-size:13px; font-weight:600; color:#475569;">
                                    <span class="material-icons-outlined" style="color:#3b82f6; font-size:18px;">person</span>
                                    <span>Người xử lý: Quản lý Sản xuất</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px;">
                            <button onclick="document.getElementById('mrpDetailModal').remove()" style="padding:16px; background:#f1f5f9; color:#475569; border:none; border-radius:16px; font-weight:800; cursor:pointer;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Đóng</button>
                            <button style="padding:16px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                <span class="material-icons-outlined" style="font-size:18px;">add_shopping_cart</span> Đặt Hàng Ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', detailHtml);
    };

    window.erpApp.renderMRP = renderMRP;
})();
