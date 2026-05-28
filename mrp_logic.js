(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let mrpPlans = window.mrpPlans || [
        { id: 'MRP-2026-0001', material: 'Thép tấm 2mm', sku: 'RM-STL-002', requiredQty: 500, inStock: 120, toPurchase: 380, dueDate: '2026-04-15', moId: 'MO-2026-0041', moProduct: 'Khung tủ điện tiêu chuẩn', status: 'urgent', unit: 'kg', leadTime: '5 ngày' },
        { id: 'MRP-2026-0002', material: 'Sơn tĩnh điện Blue-7035', sku: 'RM-PNT-035', requiredQty: 200, inStock: 250, toPurchase: 0, dueDate: '2026-04-18', moId: 'MO-2026-0042', moProduct: 'Vỏ máy biến áp 250kVA', status: 'ready', unit: 'lít', leadTime: '3 ngày' }
    ];

    try {
        const savedMRP = JSON.parse(localStorage.getItem('erp_mrpPlans'));
        if (savedMRP && Array.isArray(savedMRP)) {mrpPlans = savedMRP;}
    } catch (e) { console.error('Error loading MRP data:', e); }

    function renderMRP() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Kế hoạch nguyên vật liệu (MRP)';}
        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}
        window.erpApp.activeProductionSubModule = 'mrp';

        // Calculate KPIs
        const totalItems = mrpPlans.length;
        const shortages = mrpPlans.filter(p => p.toPurchase > 0).length;
        const urgentItems = mrpPlans.filter(p => p.status === 'urgent').length;

        const html = `
            <div class="mrp-module-v29" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
                <!-- Header -->
                <div class="pm-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:26px; font-weight:900; color:#1e293b; letter-spacing:-0.02em; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="font-size:32px; color:#3b82f6;">inventory_2</span>
                            Phân Tích Nhu Cầu Vật Tư (MRP)
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">psychology</span>
                            Tính toán nguyên vật liệu dựa trên lệnh sản xuất (MO) và tồn kho thực tế
                        </div>
                    </div>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:10px 20px; font-weight:700; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;">
                            <span class="material-icons-outlined">arrow_back</span> Danh mục chính
                        </button>
                        <button onclick="window.erpApp.runMRPAnalysis()" style="padding:12px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(59, 130, 246, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">psychology</span> Tính toán MRP
                        </button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">inventory_2</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng SKU cần thiết</div>
                            <div class="pm-stat-card-value">${totalItems}</div>
                            <div class="pm-stat-card-sub">Nguyên liệu trong BOM</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon orange"><span class="material-icons-outlined">shopping_cart</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Vật tư đang thiếu</div>
                            <div class="pm-stat-card-value">${shortages}</div>
                            <div class="pm-stat-card-sub">Yêu cầu mua hàng (PR)</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon red"><span class="material-icons-outlined">warning_amber</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Yêu cầu khẩn cấp</div>
                            <div class="pm-stat-card-value">${urgentItems}</div>
                            <div class="pm-stat-card-sub">Ưu tiên thu mua</div>
                        </div>
                    </div>
                </div>

                <!-- MRP Data Table -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; overflow:hidden; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05);">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead style="background:#f8fafc;">
                            <tr>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Vật tư / SKU</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Lệnh SX (MO)</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Cần thiết</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Tồn kho</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Cần mua</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Trạng thái</th>
                                <th style="padding:24px; text-align:center; font-size:11px; font-weight:850; color:#94a3b8;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mrpPlans.map((p, index) => {
                                const statusMap = {
                                    'urgent': { label: 'Thiếu hụt', color: '#ef4444', bg: '#fef2f2' },
                                    'ready': { label: 'Sẵn sàng', color: '#10b981', bg: '#f0fdf4' },
                                    'pending': { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fffbeb' }
                                };
                                const status = statusMap[p.status] || statusMap['pending'];

                                return `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s; animation: fadeInUp 0.4s ease-out backwards; animation-delay: ${index * 0.05}s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:20px 24px;">
                                        <div style="font-size:15px; font-weight:900; color:#1e293b; margin-bottom:4px;">${p.material}</div>
                                        <div style="font-size:12px; font-weight:700; color:#64748b; display:flex; align-items:center; gap:6px;">
                                            <span class="material-icons-outlined" style="font-size:14px;">inventory</span>
                                            SKU: ${p.sku}
                                        </div>
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <div style="font-size:14px; font-weight:800; color:#3b82f6;">${p.moId}</div>
                                        <div style="font-size:11px; font-weight:600; color:#94a3b8; margin-top:2px;">${p.moProduct}</div>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <div style="font-size:16px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(p.requiredQty)}</div>
                                        <div style="font-size:11px; font-weight:700; color:#94a3b8;">${p.unit}</div>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <div style="font-size:16px; font-weight:900; color:#10b981;">${window.erpApp.formatValue(p.inStock)}</div>
                                        <div style="font-size:11px; font-weight:700; color:#94a3b8;">${p.unit}</div>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <div style="font-size:18px; font-weight:950; color:${p.toPurchase > 0 ? '#ef4444' : '#10b981'};">
                                            ${p.toPurchase > 0 ? window.erpApp.formatValue(p.toPurchase) : '<span class="material-icons-outlined">check_circle</span>'}
                                        </div>
                                        <div style="font-size:11px; font-weight:700; color:#94a3b8;">${p.toPurchase > 0 ? p.unit : 'Đầy đủ'}</div>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <span style="padding:6px 14px; border-radius:10px; font-size:11px; font-weight:850; text-transform:uppercase; background:${status.bg}; color:${status.color}; border:1px solid ${status.color}22;">
                                            ${status.label}
                                        </span>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <div style="display:flex; justify-content:center; gap:8px;">
                                            <button onclick="window.erpApp.viewMRPDetail('${p.id}')" style="width:36px; height:36px; background:#f5f3ff; border:none; border-radius:10px; color:#8b5cf6; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#ddd6fe'">
                                                <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                            </button>
                                            <button onclick="window.erpApp.viewMRPDetail('${p.id}')" style="width:36px; height:36px; background:#f0f9ff; border:none; border-radius:10px; color:#0ea5e9; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'">
                                                <span class="material-icons-outlined" style="font-size:18px;">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .mrp-module-v29 .pm-stat-card {
                    background: #fff; padding: 24px; border-radius: 24px; border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: all 0.3s;
                    display: flex; align-items: center; gap: 20px;
                }
                .mrp-module-v29 .pm-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1); }
                .mrp-module-v29 .pm-stat-card-icon {
                    width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; 
                    justify-content: center; font-size: 28px;
                }
                .mrp-module-v29 .pm-stat-card-icon.blue { background: #eff6ff; color: #3b82f6; }
                .mrp-module-v29 .pm-stat-card-icon.orange { background: #fff7ed; color: #f59e0b; }
                .mrp-module-v29 .pm-stat-card-icon.red { background: #fef2f2; color: #ef4444; }
                .mrp-module-v29 .pm-stat-card-label { font-size: 12px; font-weight: 850; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                .mrp-module-v29 .pm-stat-card-value { font-size: 26px; font-weight: 950; color: #1e293b; margin-top: 2px; }
                .mrp-module-v29 .pm-stat-card-sub { font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; }
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    }

    window.erpApp.runMRPAnalysis = async function () {
        if (window.erpApp.showToast) { window.erpApp.showToast('Đang thực hiện phân tích nhu cầu vật tư thực tế...', 'info'); }
        
        const moList = JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        const bomList = window.boms || JSON.parse(localStorage.getItem('erp_boms')) || [];
        const products = JSON.parse(localStorage.getItem('erp_products')) || [];

        const newMrp = [];
        moList.forEach(mo => {
            // Sửa lỗi: bom_logic dùng productName, không phải product
            const bom = bomList.find(b => b.productName === mo.product);
            if (bom) {
                // Sửa lỗi: bom_logic dùng items, không phải materials
                bom.items.forEach(mat => {
                    const prod = products.find(p => p.name === mat.name);
                    const currentStock = prod ? prod.stock : 0;
                    // Sửa lỗi: mo_logic dùng qty, không phải quantity
                    const totalRequired = mat.qty * mo.qty;
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

            // Sync to Firebase
            if (window.CrudSync && window.CrudSync.saveItem) {
                for (const plan of mrpPlans) {
                    await window.CrudSync.saveItem('erp_mrpPlans', plan, 'id');
                }
            }
            
            if (window.erpApp.showToast) { window.erpApp.showToast('Tính toán MRP hoàn tất! Dữ liệu đã được cập nhật.', 'success'); }
            
            // Gửi thông báo hệ thống
            if (window.erpApp.addNotification) {
                window.erpApp.addNotification(
                    'Đã hoàn tất phân tích nhu cầu vật tư (MRP)',
                    'psychology',
                    'blue',
                    'san-xuat'
                );
            }

            renderMRP();
        } else {
            if (window.erpApp.showToast) { window.erpApp.showToast('Không tìm thấy dữ liệu MO hoặc BOM để phân tích!', 'warning'); }
        }
    };

    window.erpApp.viewMRPDetail = function (id) {
        const mrp = mrpPlans.find(p => p.id === id);
        if (!mrp) {return;}


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
                                <span style="font-size:18px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(mrp.requiredQty)} ${mrp.unit}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px dashed #e2e8f0;">
                                <span style="font-size:14px; font-weight:700; color:#10b981;">Tồn kho hiện tại</span>
                                <span style="font-size:18px; font-weight:900; color:#10b981;">${window.erpApp.formatValue(mrp.inStock)} ${mrp.unit}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                                <span style="font-size:15px; font-weight:900; color:#1e293b;">Cần mua thêm</span>
                                <span style="font-size:24px; font-weight:950; color:${mrp.toPurchase > 0 ? '#ef4444' : '#10b981'};">
                                    ${mrp.toPurchase > 0 ? window.erpApp.formatValue(mrp.toPurchase) : 'Hoàn tất'} ${mrp.toPurchase > 0 ? mrp.unit : ''}
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
    window.mrpPlans = mrpPlans;
})();
