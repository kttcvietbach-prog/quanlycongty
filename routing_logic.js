(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let productionRoutings = window.productionRoutings || [
        { 
            id: 'RT-2026-001', 
            name: 'Sản xuất Bê tông nhựa nóng C19', 
            sector: 'Bê tông nhựa nóng',
            status: 'approved', 
            version: '1.5',
            steps: [
                { name: 'Gia nhiệt cốt liệu', wcId: 'WC-001', duration: 45, laborCost: 500000 },
                { name: 'Phun nhựa đường', wcId: 'WC-001', duration: 30, laborCost: 300000 },
                { name: 'Trộn cưỡng bức', wcId: 'WC-001', duration: 15, laborCost: 200000 }
            ]
        },
        { 
            id: 'RT-2026-002', 
            name: 'Quy trình May Sơ mi 04 công đoạn', 
            sector: 'May mặc',
            status: 'pending', 
            version: '2.0',
            steps: [
                { name: 'Cắt vải CNC', wcId: 'WC-001', duration: 10, laborCost: 50000 },
                { name: 'May cổ & tay', wcId: 'WC-002', duration: 40, laborCost: 150000 },
                { name: 'May hoàn thiện', wcId: 'WC-002', duration: 60, laborCost: 250000 },
                { name: 'Kiểm tra & Đóng gói', wcId: 'WC-004', duration: 15, laborCost: 40000 }
            ]
        }
    ];

    try {
        const savedRoutings = JSON.parse(localStorage.getItem('erp_routings'));
        if (savedRoutings && Array.isArray(savedRoutings)) {productionRoutings = savedRoutings;}
    } catch (e) { console.error('Error loading routings:', e); }

    let routingSearchQuery = '';
    let routingSectorFilter = 'all';

    function renderRouting() {
        if (window.erpApp && window.erpApp.updateBreadcrumb) {
            window.erpApp.updateBreadcrumb('Quy trình sản xuất (Routing)', 'Sản xuất');
        }
        window.erpApp.activeProductionSubModule = 'routing';
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        // Load latest data from window object if it has been updated by SyncManager
        if (window.productionRoutings) {
            productionRoutings = window.productionRoutings;
        }

        const filtered = productionRoutings.filter(r => {
            const matchSearch = r.name.toLowerCase().includes(routingSearchQuery.toLowerCase()) || r.id.toLowerCase().includes(routingSearchQuery.toLowerCase());
            const matchSector = routingSectorFilter === 'all' || r.sector === routingSectorFilter;
            return matchSearch && matchSector;
        });

        // Calculate Stats
        const totalRoutings = productionRoutings.length;
        const approvedRoutings = productionRoutings.filter(r => r.status === 'approved').length;
        const totalTime = productionRoutings.reduce((sum, r) => sum + r.steps.reduce((s, step) => s + (step.duration || 0), 0), 0);
        const avgTime = totalRoutings > 0 ? (totalTime / totalRoutings).toFixed(0) : 0;

        const html = `
            <div class="routing-module-v2" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
                <!-- Toolbar -->
                <div class="employee-toolbar" style="margin-bottom:20px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                </div>
                <!-- Header Section -->
                <div class="pm-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:26px; font-weight:900; color:#1e293b; letter-spacing:-0.02em; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="font-size:32px; color:#6366f1;">account_tree</span>
                            Quy trình Sản xuất (Routing)
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">settings_suggest</span>
                            Thiết lập chuỗi công đoạn và định mức công nghệ cho từng sản phẩm
                        </div>
                    </div>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <div style="display:flex; gap:12px;">
                             <div class="search-box-premium" style="position:relative; width:280px;">
                                <span class="material-icons-outlined" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                                <input type="text" placeholder="Tìm quy trình..." value="${routingSearchQuery}" oninput="window.erpApp.handleRoutingSearch(this.value)" style="width:100%; padding:12px 12px 12px 46px; border:1.5px solid #e2e8f0; border-radius:16px; outline:none; font-size:14px; font-weight:600; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'">
                            </div>
                            <select onchange="window.erpApp.handleRoutingSectorFilter(this.value)" style="padding:12px 20px; border:1.5px solid #e2e8f0; border-radius:16px; outline:none; font-size:14px; background:#fff; font-weight:700; color:#475569; cursor:pointer; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'">
                                <option value="all">Tất cả lĩnh vực</option>
                                <option value="Bê tông nhựa nóng" ${routingSectorFilter === 'Bê tông nhựa nóng' ? 'selected' : ''}>Bê tông nhựa nóng</option>
                                <option value="Bê tông xi măng" ${routingSectorFilter === 'Bê tông xi măng' ? 'selected' : ''}>Bê tông xi măng</option>
                                <option value="May mặc" ${routingSectorFilter === 'May mặc' ? 'selected' : ''}>May mặc</option>
                                <option value="Khác" ${routingSectorFilter === 'Khác' ? 'selected' : ''}>Khác</option>
                            </select>
                        </div>
                        <button onclick="window.erpApp.openRoutingModal()" style="padding:12px 24px; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(99, 102, 241, 0.3); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">route</span> Thiết lập Routing
                        </button>
                    </div>
                </div>

                <!-- Stats Dashboard -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">format_list_numbered</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng số quy trình</div>
                            <div class="pm-stat-card-value">${totalRoutings}</div>
                            <div class="pm-stat-card-sub">Quy trình công nghệ gốc</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon green"><span class="material-icons-outlined">verified</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đã phê duyệt</div>
                            <div class="pm-stat-card-value">${approvedRoutings}</div>
                            <div class="pm-stat-card-sub">Sẵn sàng cho sản xuất</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon orange"><span class="material-icons-outlined">schedule</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Thời gian TB</div>
                            <div class="pm-stat-card-value">${avgTime} <span style="font-size:14px;">phút</span></div>
                            <div class="pm-stat-card-sub">Trên mỗi chu kỳ SP</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon indigo"><span class="material-icons-outlined">layers</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Độ phức tạp TB</div>
                            <div class="pm-stat-card-value">${totalRoutings > 0 ? (productionRoutings.reduce((sum, r) => sum + r.steps.length, 0) / totalRoutings).toFixed(1) : 0}</div>
                            <div class="pm-stat-card-sub">Bước công việc / Quy trình</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap:24px;">
                    ${filtered.length === 0 ? `
                        <div style="grid-column:1/-1; text-align:center; padding:120px; background:#fff; border-radius:32px; border:2px dashed #e2e8f0; animation: fadeIn 0.5s ease-out;">
                            <div style="width:100px; height:100px; background:#f8fafc; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
                                <span class="material-icons-outlined" style="font-size:48px; color:#cbd5e1;">account_tree</span>
                            </div>
                            <h3 style="margin:0; font-size:18px; font-weight:800; color:#64748b;">Không tìm thấy quy trình sản xuất nào</h3>
                            <p style="margin:8px 0 24px; color:#94a3b8; font-size:14px;">Vui lòng thử tìm kiếm với từ khóa khác hoặc tạo mới quy trình.</p>
                            <button onclick="window.erpApp.openRoutingModal()" style="padding:12px 24px; background:#6366f1; color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:10px; margin:0 auto;">
                                <span class="material-icons-outlined">add</span> Tạo mới ngay
                            </button>
                        </div>
                    ` : filtered.map((r, index) => {
                        const totalTime = r.steps.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
                        const totalLabor = r.steps.reduce((sum, s) => sum + (parseInt(s.laborCost) || 0), 0);
                        const sectorColor = r.sector === 'Bê tông nhựa nóng' ? '#f59e0b' : (r.sector === 'Bê tông xi măng' ? '#3b82f6' : '#8b5cf6');
                        
                        const statusMap = {
                            'approved': { label: 'Đã duyệt', color: '#10b981', bg: '#f0fdf4', icon: 'verified' },
                            'pending': { label: 'Chờ duyệt', color: '#6366f1', bg: '#f5f3ff', icon: 'history' },
                            'rejected': { label: 'Từ chối', color: '#ef4444', bg: '#fef2f2', icon: 'error_outline' }
                        };
                        const status = statusMap[r.status] || statusMap['pending'];

                        return `
                        <div class="premium-routing-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:28px; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05); position:relative; overflow:hidden; transition:all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; animation-delay: ${index * 0.05}s;"
                             onclick="window.erpApp.openRoutingModal('${r.id}')"
                             onmouseover="this.style.transform='translateY(-6px)'; this.style.borderColor='#6366f1'; this.style.boxShadow='0 20px 40px -12px rgba(99, 102, 241, 0.12)'" 
                             onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 12px 24px -8px rgba(0,0,0,0.05)'">
                            
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
                                <div style="flex:1;">
                                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                        <span style="font-size:10px; font-weight:900; background:#f1f5f9; color:#64748b; padding:4px 10px; border-radius:8px; text-transform:uppercase;">${r.id}</span>
                                        <span style="font-size:10px; font-weight:900; background:${sectorColor}15; color:${sectorColor}; padding:4px 10px; border-radius:8px;">${r.sector}</span>
                                    </div>
                                    <h3 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; line-height:1.4;">${r.name}</h3>
                                </div>
                                <div style="background:${status.bg}; color:${status.color}; padding:6px 14px; border-radius:12px; font-size:11px; font-weight:850; display:flex; align-items:center; gap:6px; border:1px solid ${status.color}22;">
                                    <span class="material-icons-outlined" style="font-size:16px;">${status.icon}</span>
                                    ${status.label}
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px;">
                                <div style="background:#f8fafc; padding:16px; border-radius:20px; border:1px solid #f1f5f9;">
                                    <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Tổng thời gian</div>
                                    <div style="font-size:18px; font-weight:950; color:#1e293b;">${totalTime} <span style="font-size:12px; font-weight:700; color:#94a3b8;">phút</span></div>
                                </div>
                                <div style="background:rgba(99, 102, 241, 0.05); padding:16px; border-radius:20px; border:1px solid rgba(99, 102, 241, 0.1);">
                                    <div style="font-size:10px; font-weight:800; color:#6366f1; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">CP Nhân công</div>
                                    <div style="font-size:18px; font-weight:950; color:#4f46e5;">${window.erpApp.formatValue(totalLabor)} <span style="font-size:12px;">đ</span></div>
                                </div>
                            </div>

                            <div style="border-top:1px dashed #e2e8f0; padding-top:20px;">
                                <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons-outlined" style="font-size:18px;">auto_awesome_motion</span> 
                                    Công đoạn thực hiện (${r.steps.length})
                                </div>
                                <div style="display:flex; flex-direction:column; gap:12px; position:relative; padding-left:14px; border-left:2px solid #f1f5f9;">
                                    ${r.steps.slice(0, 3).map((step, idx) => `
                                        <div style="display:flex; align-items:center; gap:12px; position:relative;">
                                            <div style="position:absolute; left:-23px; width:16px; height:16px; background:#fff; border:3px solid #6366f1; border-radius:50%; box-shadow:0 0 0 4px #fff;"></div>
                                            <div style="flex:1;">
                                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                                    <span style="font-size:14px; font-weight:800; color:#475569;">${step.name}</span>
                                                    <span style="font-size:11px; font-weight:800; color:#94a3b8; background:#f8fafc; padding:2px 8px; border-radius:6px;">${step.duration}m</span>
                                                </div>
                                                <div style="font-size:11px; color:#94a3b8; font-weight:700;">Nguồn lực: ${step.wcId || '---'}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${r.steps.length > 3 ? `
                                        <div style="padding:4px 0 0 0; font-size:12px; font-weight:800; color:#6366f1; display:flex; align-items:center; gap:6px;">
                                            <span class="material-icons-outlined" style="font-size:16px;">more_horiz</span>
                                            Xem thêm ${r.steps.length - 3} bước công nghệ khác
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <style>
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .premium-routing-card:hover .material-icons-outlined {
                    color: #6366f1;
                    transition: all 0.3s;
                }
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    }

    window.erpApp.handleRoutingSearch = function (val) {
        routingSearchQuery = val;
        renderRouting();
    };

    window.erpApp.handleRoutingSectorFilter = function (val) {
        routingSectorFilter = val;
        renderRouting();
    };

    window.erpApp.openRoutingModal = function (id = null) {
        const routing = id ? productionRoutings.find(r => r.id === id) : null;
        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        
        const modalHtml = `
            <div id="routingModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);" onclick="this.remove()">
                <div class="modal-content" style="width:1000px; max-width:95vw; max-height:95vh; border-radius:32px; padding:0; background:#fff; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <!-- Header -->
                    <div style="padding:32px 40px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:20px;">
                            <div style="width:56px; height:56px; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius:18px; display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 8px 16px -4px rgba(99, 102, 241, 0.4);">
                                <span class="material-icons-outlined" style="font-size:32px;">account_tree</span>
                            </div>
                            <div>
                                <h2 style="margin:0; font-size:24px; font-weight:950; letter-spacing:-0.5px;">${id ? 'Cấu hình Quy trình Công nghệ' : 'Thiết lập Routing Sản xuất mới'}</h2>
                                <div style="font-size:13px; color:rgba(255,255,255,0.6); font-weight:600; margin-top:4px;">Kỹ thuật sản xuất, trình tự thực hiện và định mức nhân công</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:12px;">
                            ${id ? `<button onclick="window.erpApp.exportRoutingPDF('${id}')" style="padding:10px 20px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:14px; font-weight:800; color:#fff; cursor:pointer; display:flex; align-items:center; gap:8px;"><span class="material-icons-outlined" style="font-size:20px;">picture_as_pdf</span> PDF</button>` : ''}
                            <button onclick="document.getElementById('routingModal').remove()" style="width:44px; height:44px; border-radius:14px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'"><span class="material-icons-outlined">close</span></button>
                        </div>
                    </div>

                    <div style="padding:40px; overflow-y:auto; max-height:calc(95vh - 180px); background:#f8fafc;">
                        <!-- Basic Info -->
                        <div style="background:#fff; padding:28px; border-radius:24px; border:1px solid #e2e8f0; display:grid; grid-template-columns: 2fr 1fr 1fr; gap:24px; margin-bottom:32px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Tên Quy trình sản xuất <span style="color:#ef4444;">*</span></label>
                                <input type="text" id="rtName" value="${routing ? routing.name : ''}" placeholder="Nhập tên quy trình..." style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Lĩnh vực / Nhóm SP</label>
                                <select id="rtSector" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; background:#fff; cursor:pointer;">
                                    <option value="Bê tông nhựa nóng" ${routing && routing.sector === 'Bê tông nhựa nóng' ? 'selected' : ''}>Bê tông nhựa nóng</option>
                                    <option value="Bê tông xi măng" ${routing && routing.sector === 'Bê tông xi măng' ? 'selected' : ''}>Bê tông xi măng</option>
                                    <option value="May mặc" ${routing && routing.sector === 'May mặc' ? 'selected' : ''}>May mặc</option>
                                    <option value="Khác" ${routing && routing.sector === 'Khác' ? 'selected' : ''}>Lĩnh vực khác</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Trạng thái phê duyệt</label>
                                <select id="rtStatus" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; background:#fff; cursor:pointer;">
                                    <option value="pending" ${routing && routing.status === 'pending' ? 'selected' : ''}>Chờ phê duyệt</option>
                                    <option value="approved" ${routing && routing.status === 'approved' ? 'selected' : ''}>Đã phê duyệt</option>
                                    <option value="rejected" ${routing && routing.status === 'rejected' ? 'selected' : ''}>Từ chối phê duyệt</option>
                                </select>
                            </div>
                        </div>

                        <!-- Steps Container -->
                        <div style="background:#fff; padding:28px; border-radius:24px; border:1px solid #e2e8f0;">
                            <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
                                <h4 style="margin:0; font-size:16px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                                    <span class="material-icons-outlined" style="color:#6366f1;">reorder</span>
                                    Các bước công nghệ & Trình tự thực hiện
                                </h4>
                                <button onclick="window.erpApp.addRoutingStep()" style="padding:10px 24px; background:#eff6ff; color:#6366f1; border:none; border-radius:14px; font-size:13px; font-weight:850; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all 0.2s;" onmouseover="this.style.background='#dbeafe'">
                                    <span class="material-icons-outlined" style="font-size:20px;">playlist_add</span> Thêm bước công việc
                                </button>
                            </div>

                            <div id="routingStepsBody" style="display:flex; flex-direction:column; gap:16px;">
                                ${(routing ? routing.steps : [{ name: '', wcId: '', duration: 0, laborCost: 0 }]).map((step, idx) => `
                                    <div class="routing-step-row" style="display:grid; grid-template-columns: 50px 2.5fr 1.5fr 1fr 1.5fr 50px; gap:16px; align-items:center; background:#f8fafc; padding:20px; border:1px solid #f1f5f9; border-radius:20px; transition: all 0.2s;">
                                        <div style="width:32px; height:32px; background:#6366f1; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; box-shadow:0 4px 10px -2px rgba(99, 102, 241, 0.4);">${idx + 1}</div>
                                        <div>
                                            <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Tên công đoạn</label>
                                            <input type="text" class="step-name" value="${step.name}" placeholder="VD: Cắt phôi, Gia nhiệt..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; background:#fff; outline:none;" onfocus="this.style.borderColor='#6366f1'">
                                        </div>
                                        <div>
                                            <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Work Center / Nguồn lực</label>
                                            <select class="step-wcId" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; background:#fff; cursor:pointer;">
                                                <option value="">-- Chọn nguồn lực --</option>
                                                ${workCenters.map(wc => `<option value="${wc.id}" ${step.wcId === wc.id ? 'selected' : ''}>${wc.name}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Thời gian</label>
                                            <div style="display:flex; align-items:center; gap:6px;">
                                                <input type="number" class="step-duration" value="${step.duration}" oninput="window.erpApp.updateRoutingTotals()" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:800; background:#fff; text-align:right; outline:none;">
                                                <span style="font-size:11px; font-weight:800; color:#64748b;">m</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Chi phí nhân công</label>
                                            <input type="number" class="step-labor" value="${step.laborCost}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:800; background:#fff; text-align:right; color:#6366f1; outline:none;">
                                        </div>
                                        <button onclick="this.closest('.routing-step-row').remove(); window.erpApp.updateRoutingTotals();" style="width:40px; height:40px; background:#fef2f2; border:none; border-radius:12px; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'"><span class="material-icons-outlined" style="font-size:18px;">delete_outline</span></button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding:28px 40px; background:#fff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:32px; align-items:center;">
                             <div style="font-size:13px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Tổng cộng (Summary):</div>
                             <div style="display:flex; gap:20px;">
                                <div style="background:#f1f5f9; padding:8px 16px; border-radius:12px; font-size:14px; font-weight:900; color:#1e293b;">
                                    <span style="color:#64748b; font-weight:700; margin-right:6px;">Thời gian:</span>
                                    <span id="rtTotalTime">0 phút</span>
                                </div>
                             </div>
                        </div>
                        <div style="display:flex; gap:16px;">
                            <button onclick="document.getElementById('routingModal').remove()" style="padding:14px 32px; background:#fff; color:#64748b; border:2px solid #e2e8f0; border-radius:18px; font-weight:800; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveRouting('${id || ''}')" style="padding:14px 48px; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; border:none; border-radius:18px; font-weight:950; cursor:pointer; box-shadow:0 10px 20px -5px rgba(99, 102, 241, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">Lưu & Phát hành Quy trình</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        window.erpApp.updateRoutingTotals();
    };

    window.erpApp.addRoutingStep = function () {
        const body = document.getElementById('routingStepsBody');
        const count = body.querySelectorAll('.routing-step-row').length + 1;
        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        
        const row = `
            <div class="routing-step-row" style="display:grid; grid-template-columns: 50px 2.5fr 1.5fr 1fr 1.5fr 50px; gap:16px; align-items:center; background:#f8fafc; padding:20px; border:1px solid #f1f5f9; border-radius:20px; transition: all 0.2s; animation: fadeInUp 0.3s ease-out;">
                <div style="width:32px; height:32px; background:#6366f1; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; box-shadow:0 4px 10px -2px rgba(99, 102, 241, 0.4);">${count}</div>
                <div>
                    <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Tên công đoạn</label>
                    <input type="text" class="step-name" placeholder="VD: Tên bước..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; background:#fff; outline:none;" onfocus="this.style.borderColor='#6366f1'">
                </div>
                <div>
                    <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Work Center / Nguồn lực</label>
                    <select class="step-wcId" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; background:#fff; cursor:pointer;">
                        <option value="">-- Chọn nguồn lực --</option>
                        ${workCenters.map(wc => `<option value="${wc.id}">${wc.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Thời gian</label>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="number" class="step-duration" value="0" oninput="window.erpApp.updateRoutingTotals()" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:800; background:#fff; text-align:right; outline:none;">
                        <span style="font-size:11px; font-weight:800; color:#64748b;">m</span>
                    </div>
                </div>
                <div>
                    <label style="display:block; font-size:10px; font-weight:850; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Chi phí nhân công</label>
                    <input type="number" class="step-labor" value="0" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:800; background:#fff; text-align:right; color:#6366f1; outline:none;">
                </div>
                <button onclick="this.closest('.routing-step-row').remove(); window.erpApp.updateRoutingTotals();" style="width:40px; height:40px; background:#fef2f2; border:none; border-radius:12px; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'"><span class="material-icons-outlined" style="font-size:18px;">delete_outline</span></button>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', row);
    };

    window.erpApp.updateRoutingTotals = function () {
        const durations = document.querySelectorAll('.step-duration');
        let total = 0;
        durations.forEach(d => total += (parseInt(d.value) || 0));
        const el = document.getElementById('rtTotalTime');
        if (el) {el.textContent = total + ' phút';}
    };

    window.erpApp.saveRouting = async function (id) {
        const name = document.getElementById('rtName').value;
        const sector = document.getElementById('rtSector').value;
        const status = document.getElementById('rtStatus').value;
        const rows = document.querySelectorAll('.routing-step-row');
        
        const steps = Array.from(rows).map(row => ({
            name: row.querySelector('.step-name').value,
            wcId: row.querySelector('.step-wcId').value,
            duration: parseInt(row.querySelector('.step-duration').value) || 0,
            laborCost: parseInt(row.querySelector('.step-labor').value) || 0
        })).filter(s => s.name);

        if (!name || steps.length === 0) {
            if (window.erpApp.showToast) {window.erpApp.showToast('Vui lòng nhập tên quy trình và ít nhất 1 công đoạn!', 'error');}
            return;
        }

        const newRouting = {
            id: id || ('RT-' + new Date().getFullYear() + '-' + (productionRoutings.length + 1).toString().padStart(3, '0')),
            name, sector, status, version: id ? (parseFloat(productionRoutings.find(r => r.id === id).version) + 0.1).toFixed(1) : '1.0',
            steps
        };

        if (id) {
            const idx = productionRoutings.findIndex(r => r.id === id);
            productionRoutings[idx] = newRouting;
        } else {
            productionRoutings.unshift(newRouting);
        }

        localStorage.setItem('erp_routings', JSON.stringify(productionRoutings));
        window.productionRoutings = productionRoutings;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('erp_routings', newRouting, 'id');
        }

        document.getElementById('routingModal').remove();
        renderRouting();
        if (window.erpApp.showToast) {window.erpApp.showToast('Đã lưu quy trình sản xuất thành công!', 'success');}
    };

    window.erpApp.renderRouting = renderRouting;
})();
