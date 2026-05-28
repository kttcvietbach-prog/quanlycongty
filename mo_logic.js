(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let manufacturingOrders = window.manufacturingOrders || [
        { id: 'MO-2026-0041', product: 'Bê tông nhựa nóng C19', qty: 500, unit: 'm3', status: 'approved', progress: 65, startDate: '2026-04-10', endDate: '2026-04-15' },
        { id: 'MO-2026-0042', product: 'Áo sơ mi nam công sở', qty: 2000, unit: 'Cái', status: 'draft', progress: 0, startDate: '2026-04-20', endDate: '2026-04-30' }
    ];

    try {
        const savedMo = JSON.parse(localStorage.getItem('erp_manufacturingOrders'));
        if (savedMo && Array.isArray(savedMo)) { manufacturingOrders = savedMo; }
    } catch (e) { console.error('Error loading MO:', e); }

    function renderMO() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) { breadcrumbCurrent.textContent = 'Lệnh sản xuất (MO)'; }
        if (pageBadge) { pageBadge.textContent = 'Sản xuất'; }
        window.erpApp.activeProductionSubModule = 'mo';

        // Calculate Stats
        const totalMo = manufacturingOrders.length;
        const activeMo = manufacturingOrders.filter(mo => mo.status === 'approved' && mo.progress < 100).length;
        const avgProgress = totalMo > 0 ? (manufacturingOrders.reduce((sum, mo) => sum + (mo.progress || 0), 0) / totalMo).toFixed(0) : 0;
        const completedMo = manufacturingOrders.filter(mo => mo.progress === 100).length;

        const html = `
            <div class="mo-module-v2" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
                <!-- Header Section -->
                <div class="pm-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:26px; font-weight:900; color:#1e293b; letter-spacing:-0.02em; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="font-size:32px; color:#8b5cf6;">assignment_turned_in</span>
                            Điều hành Lệnh Sản xuất (MO)
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">query_stats</span>
                            Theo dõi tiến độ thực hiện và quản lý trạng thái các lệnh sản xuất trong hệ thống
                        </div>
                    </div>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:10px 20px; font-weight:700; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;">
                            <span class="material-icons-outlined">arrow_back</span> Danh mục chính
                        </button>
                        <button onclick="window.erpApp.openMoModal()" style="padding:12px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(139, 92, 246, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">add_task</span> Phát hành Lệnh MO
                        </button>
                    </div>
                </div>

                <!-- Stats Dashboard -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon purple"><span class="material-icons-outlined">list_alt</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng số lệnh MO</div>
                            <div class="pm-stat-card-value">${totalMo}</div>
                            <div class="pm-stat-card-sub">Toàn bộ hồ sơ MO</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">pending_actions</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đang triển khai</div>
                            <div class="pm-stat-card-value">${activeMo}</div>
                            <div class="pm-stat-card-sub">Lệnh đang thực hiện</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon orange"><span class="material-icons-outlined">donut_large</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tiến độ trung bình</div>
                            <div class="pm-stat-card-value">${avgProgress}%</div>
                            <div class="pm-stat-card-sub">Tỷ lệ hoàn thành tổng thể</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon green"><span class="material-icons-outlined">task_alt</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đã hoàn tất</div>
                            <div class="pm-stat-card-value">${completedMo}</div>
                            <div class="pm-stat-card-sub">Lệnh đã bàn giao kho</div>
                        </div>
                    </div>
                </div>

                <!-- MO Table Container -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; overflow:hidden; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05);">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead style="background:#f8fafc;">
                            <tr>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Mã Lệnh / SP</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Số lượng</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Trạng thái</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; width:200px;">Tiến độ sản xuất</th>
                                <th style="padding:24px; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Thời hạn</th>
                                <th style="padding:24px; text-align:center; font-size:11px; font-weight:850; color:#94a3b8;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${manufacturingOrders.map((mo, index) => {
            const statusMap = {
                'approved': { label: 'Đã duyệt', color: '#10b981', bg: '#f0fdf4' },
                'draft': { label: 'Dự thảo', color: '#64748b', bg: '#f1f5f9' },
                'completed': { label: 'Hoàn tất', color: '#3b82f6', bg: '#eff6ff' }
            };
            const status = statusMap[mo.status] || statusMap['draft'];
            const progressColor = mo.progress > 80 ? '#10b981' : (mo.progress > 40 ? '#8b5cf6' : '#f59e0b');

            return `
                                <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s; animation: fadeInUp 0.4s ease-out backwards; animation-delay: ${index * 0.05}s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:20px 24px;">
                                        <div style="font-size:15px; font-weight:900; color:#1e293b; margin-bottom:4px;">${mo.id}</div>
                                        <div style="font-size:13px; font-weight:700; color:#64748b; display:flex; align-items:center; gap:6px;">
                                            <span class="material-icons-outlined" style="font-size:14px;">inventory_2</span>
                                            ${mo.product}
                                        </div>
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <div style="font-size:16px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(mo.qty)}</div>
                                        <div style="font-size:12px; font-weight:700; color:#94a3b8;">Đơn vị: ${mo.unit}</div>
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <span style="padding:6px 14px; border-radius:10px; font-size:11px; font-weight:850; text-transform:uppercase; background:${status.bg}; color:${status.color}; border:1px solid ${status.color}22;">
                                            ${status.label}
                                        </span>
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <div style="flex:1; height:8px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                                <div style="width:${mo.progress}%; height:100%; background:linear-gradient(90deg, ${progressColor} 0%, ${progressColor}aa 100%); border-radius:10px; transition: width 1s ease-out;"></div>
                                            </div>
                                            <span style="font-size:13px; font-weight:900; color:${progressColor}; min-width:35px;">${mo.progress}%</span>
                                        </div>
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <div style="font-size:13px; font-weight:750; color:#475569;">${mo.startDate}</div>
                                        <div style="font-size:11px; font-weight:700; color:#ef4444; margin-top:2px; display:flex; align-items:center; gap:4px;">
                                            <span class="material-icons-outlined" style="font-size:14px;">event</span>
                                            Deadline: ${mo.endDate}
                                        </div>
                                    </td>
                                    <td style="padding:20px 24px; text-align:center;">
                                        <button onclick="window.erpApp.viewMoDetail('${mo.id}')" style="width:40px; height:40px; background:#f5f3ff; border:none; border-radius:12px; color:#8b5cf6; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#ddd6fe'">
                                            <span class="material-icons-outlined" style="font-size:20px;">visibility</span>
                                        </button>
                                    </td>
                                </tr>`;
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
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    }

    window.erpApp.openMoModal = function () {
        const modalHtml = `
            <div id="moModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);" onclick="this.remove()">
                <div class="modal-content" style="width:580px; border-radius:32px; padding:40px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Phát hành Lệnh Sản Xuất mới</h2>
                            <div style="font-size:13px; color:#64748b; font-weight:600; margin-top:4px;">Thiết lập định mức sản lượng và thời gian thực hiện</div>
                        </div>
                        <button onclick="document.getElementById('moModal').remove()" style="background:#f1f5f9; border:none; border-radius:12px; width:40px; height:40px; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:24px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Sản phẩm đích <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="moProduct" placeholder="Tìm hoặc nhập tên sản phẩm..." style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#8b5cf6'">
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Số lượng lệnh</label>
                                <input type="number" id="moQty" value="100" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:800; font-size:15px; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Đơn vị tính</label>
                                <input type="text" id="moUnit" value="Cái" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Ngày khởi tạo</label>
                                <input type="date" id="moStart" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Deadline hoàn thành</label>
                                <input type="date" id="moEnd" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                        </div>
                        
                        <div style="margin-top:24px; display:grid; grid-template-columns:1fr 2fr; gap:16px;">
                            <button onclick="document.getElementById('moModal').remove()" style="padding:16px; border:1.5px solid #e2e8f0; background:#fff; border-radius:20px; font-weight:800; color:#64748b; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveMO()" style="padding:16px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:20px; font-weight:900; cursor:pointer; box-shadow:0 8px 16px -4px rgba(139, 92, 246, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">Ghi sổ & Phát hành Lệnh</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Set default dates
        const now = new Date();
        document.getElementById('moStart').value = now.toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        document.getElementById('moEnd').value = nextWeek.toISOString().split('T')[0];
    };

    window.erpApp.saveMO = async function () {
        const product = document.getElementById('moProduct').value;
        const qty = parseFloat(document.getElementById('moQty').value);
        const unit = document.getElementById('moUnit').value;
        const startDate = document.getElementById('moStart').value;
        const endDate = document.getElementById('moEnd').value;

        if (!product || !qty) {
            if (window.erpApp.showToast) { window.erpApp.showToast('Vui lòng nhập tên sản phẩm và số lượng!', 'error'); }
            return;
        }

        const newMo = {
            id: 'MO-' + new Date().getFullYear() + '-' + (manufacturingOrders.length + 41).toString().padStart(4, '0'),
            product, qty, unit, startDate, endDate,
            status: 'draft', progress: 0
        };

        manufacturingOrders.unshift(newMo);
        localStorage.setItem('erp_manufacturingOrders', JSON.stringify(manufacturingOrders));
        window.manufacturingOrders = manufacturingOrders;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('erp_manufacturingOrders', newMo, 'id');
        }

        if (window.notifyCRUD) {
            window.notifyCRUD('Lệnh sản xuất', 'add', { name: `Số LSX: ${newMo.id} (${product})`, page: 'san-xuat' });
        }

        document.getElementById('moModal').remove();
        renderMO();
        if (window.erpApp.showToast) { window.erpApp.showToast('Lệnh sản xuất đã được lưu vào hệ thống!', 'success'); }
    };

    window.erpApp.renderMO = renderMO;
})();
