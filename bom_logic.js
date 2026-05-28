(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // ── Inject BOM module styles ──────────────────────────────────────────
    (function injectBomStyles() {
        if (document.getElementById('bom-module-styles')) return;
        const style = document.createElement('style');
        style.id = 'bom-module-styles';
        style.textContent = `
            /* ===== BOM Stats Grid ===== */
            .pm-dash-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 32px;
            }
            .pm-stat-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 20px;
                padding: 20px 22px;
                display: flex;
                align-items: flex-start;
                gap: 16px;
                box-shadow: 0 4px 12px -2px rgba(0,0,0,0.05);
                transition: all 0.25s ease;
            }
            .pm-stat-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 24px -6px rgba(0,0,0,0.08);
                border-color: #c7d2fe;
            }
            .pm-stat-card-icon {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .pm-stat-card-icon span { font-size: 24px; }
            .pm-stat-card-icon.indigo  { background: #e0e7ff; color: #6366f1; }
            .pm-stat-card-icon.green   { background: #d1fae5; color: #10b981; }
            .pm-stat-card-icon.orange  { background: #ffedd5; color: #f97316; }
            .pm-stat-card-icon.blue    { background: #dbeafe; color: #3b82f6; }
            .pm-stat-card-icon.red     { background: #fee2e2; color: #ef4444; }
            .pm-stat-card-icon.teal    { background: #ccfbf1; color: #0d9488; }
            .pm-stat-card-info { flex: 1; min-width: 0; }
            .pm-stat-card-label {
                font-size: 11px;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .pm-stat-card-value {
                font-size: 28px;
                font-weight: 900;
                color: #1e293b;
                line-height: 1.1;
                margin-bottom: 4px;
            }
            .pm-stat-card-sub {
                font-size: 12px;
                color: #64748b;
                font-weight: 600;
            }

            /* ===== BOM Page Header ===== */
            .pm-page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
                gap: 16px;
            }

            /* ===== BOM Cards Grid ===== */
            .premium-bom-card {
                cursor: pointer;
            }

            /* ===== Status Badge ===== */
            .pm-status-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 800;
                white-space: nowrap;
            }
            .pm-status-badge.hoan-thanh { background: #d1fae5; color: #059669; }
            .pm-status-badge.sap-toi    { background: #f1f5f9; color: #64748b; }
            .pm-status-badge.dang-thuc-hien { background: #dbeafe; color: #2563eb; }
            .pm-status-badge.tre-han    { background: #fee2e2; color: #dc2626; }

            /* ===== Responsive ===== */
            @media (max-width: 1100px) {
                .pm-dash-stats { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 640px) {
                .pm-dash-stats { grid-template-columns: 1fr; }
                .pm-page-header { flex-direction: column; align-items: flex-start; }
            }
        `;
        document.head.appendChild(style);
    })();

    let boms = window.boms || [];

    try {
        const savedBoms = JSON.parse(localStorage.getItem('erp_boms'));
        if (savedBoms && Array.isArray(savedBoms)) {boms = savedBoms;}
    } catch (e) { console.error('Error loading boms:', e); }

    let bomSearchQuery = '';

    function renderBOM() {
        if (window.erpApp && window.erpApp.updateBreadcrumb) {
            window.erpApp.updateBreadcrumb('Định mức nguyên vật liệu (BOM)', 'Sản xuất');
        }
        window.erpApp.activeProductionSubModule = 'bom';
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        const filtered = boms.filter(b => b.productName.toLowerCase().includes(bomSearchQuery.toLowerCase()) || b.id.toLowerCase().includes(bomSearchQuery.toLowerCase()));

        // Calculate Stats
        const totalBoms = boms.length;
        const activeBoms = boms.filter(b => b.status === 'active').length;
        const totalItemsCount = boms.reduce((sum, b) => sum + b.items.length, 0);
        const avgItems = totalBoms > 0 ? (totalItemsCount / totalBoms).toFixed(1) : 0;

        const html = `
            <div class="bom-module-v2" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
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
                            <span class="material-icons-outlined" style="font-size:32px; color:#6366f1;">inventory_2</span>
                            Định mức nguyên vật liệu (BOM)
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">verified</span>
                            Quản lý cấu trúc sản phẩm và tiêu chuẩn kỹ thuật vật tư
                        </div>
                    </div>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <div class="search-box-premium" style="position:relative; width:320px;">
                            <span class="material-icons-outlined" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm tên sản phẩm, mã BOM..." value="${bomSearchQuery}" oninput="window.erpApp.handleBomSearch(this.value)" style="width:100%; padding:12px 12px 12px 46px; border:1.5px solid #e2e8f0; border-radius:16px; outline:none; font-size:14px; font-weight:600; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'; this.style.boxShadow='0 0 0 4px rgba(99, 102, 241, 0.1)'">
                        </div>
                        <button onclick="window.erpApp.openBomModal()" style="padding:12px 24px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(15, 23, 42, 0.3); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">add</span> Thiết lập BOM mới
                        </button>
                    </div>
                </div>

                <!-- Stats Dashboard -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon indigo"><span class="material-icons-outlined">account_tree</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng số định mức</div>
                            <div class="pm-stat-card-value">${totalBoms}</div>
                            <div class="pm-stat-card-sub">Cấu trúc sản phẩm hoàn chỉnh</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon green"><span class="material-icons-outlined">check_circle</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đang áp dụng</div>
                            <div class="pm-stat-card-value">${activeBoms}</div>
                            <div class="pm-stat-card-sub">Phiên bản đang sản xuất</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon orange"><span class="material-icons-outlined">category</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Vật tư TB / BOM</div>
                            <div class="pm-stat-card-value">${avgItems}</div>
                            <div class="pm-stat-card-sub">Hạng mục thành phần</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">history_edu</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">BOM Revision</div>
                            <div class="pm-stat-card-value">v${totalBoms > 0 ? boms[0].version : '1.0'}</div>
                            <div class="pm-stat-card-sub">Phiên bản cập nhật mới nhất</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:24px;">
                    ${filtered.map((b, index) => {
                        const totalCost = b.items.reduce((sum, item) => sum + (item.qty * item.estimatePrice * (1 + item.scrapPercent / 100)), 0);
                        return `
                        <div class="premium-bom-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:28px; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05); position:relative; overflow:hidden; transition:all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; animation-delay: ${index * 0.05}s;"
                             onclick="window.erpApp.openBomModal('${b.id}')"
                             onmouseover="this.style.transform='translateY(-6px)'; this.style.borderColor='#6366f1'; this.style.boxShadow='0 20px 40px -12px rgba(99, 102, 241, 0.12)'" 
                             onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 12px 24px -8px rgba(0,0,0,0.05)'">
                            
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
                                <div style="flex:1;">
                                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                        <span style="font-size:10px; font-weight:900; background:#f1f5f9; color:#64748b; padding:4px 10px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px;">${b.id}</span>
                                        <span style="font-size:10px; font-weight:900; background:#e0e7ff; color:#6366f1; padding:4px 10px; border-radius:8px;">Ver ${b.version}</span>
                                    </div>
                                    <h3 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; line-height:1.3;">${b.productName}</h3>
                                </div>
                                <span class="pm-status-badge ${b.status === 'active' ? 'hoan-thanh' : 'sap-toi'}" style="margin:0;">
                                    ${b.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                </span>
                            </div>
                            
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:24px;">
                                <div style="background:#f8fafc; padding:14px; border-radius:20px; border:1px solid #f1f5f9;">
                                    <div style="font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Quy cách gốc</div>
                                    <div style="font-size:16px; font-weight:900; color:#1e293b;">${b.baseQty} <span style="font-size:12px; color:#94a3b8;">${b.unit || 'SP'}</span></div>
                                </div>
                                <div style="background:rgba(16, 185, 129, 0.05); padding:14px; border-radius:20px; border:1px solid rgba(16, 185, 129, 0.1);">
                                    <div style="font-size:10px; color:#10b981; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Giá thành dự tính</div>
                                    <div style="font-size:16px; font-weight:900; color:#059669;">${window.erpApp.formatValue(totalCost)} <span style="font-size:11px;">đ</span></div>
                                </div>
                            </div>

                            <div style="border-top:1px dashed #e2e8f0; padding-top:20px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                    <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Thành phần vật tư (${b.items.length})</div>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="event.stopPropagation(); window.erpApp.openBomModal('${b.id}')" style="background:transparent; border:1px solid #e2e8f0; color:#64748b; padding:6px 10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.color='#3b82f6'"><span class="material-icons-outlined" style="font-size:14px;">edit</span> SỬA</button>
                                        <button onclick="event.stopPropagation(); window.erpApp.deleteBOM('${b.id}')" style="background:transparent; border:1px solid #e2e8f0; color:#64748b; padding:6px 10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'; this.style.color='#ef4444'; this.style.borderColor='#fecaca'"><span class="material-icons-outlined" style="font-size:14px;">delete</span> XÓA</button>
                                    </div>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    ${b.items.slice(0, 3).map(item => `
                                        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:12px;">
                                            <span style="color:#475569; font-size:13px; font-weight:700;">${item.name}</span>
                                            <span style="color:#1e293b; font-size:13px; font-weight:900; background:#fff; padding:2px 8px; border-radius:6px; border:1px solid #f1f5f9;">${item.qty} ${item.unit}</span>
                                        </div>
                                    `).join('')}
                                    ${b.items.length > 3 ? `
                                        <div style="text-align:center; font-size:12px; color:#6366f1; font-weight:800; margin-top:4px;">
                                            + Xem thêm ${b.items.length - 3} vật tư khác
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
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    }

    window.erpApp.handleBomSearch = function (val) {
        bomSearchQuery = val;
        renderBOM();
    };

    window.erpApp.openBomModal = function (id = null) {
        const bom = id ? boms.find(b => b.id === id) : null;
        const modalHtml = `
            <div id="bomModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);" onclick="this.remove()">
                <div class="modal-content" style="width:1000px; max-width:95vw; max-height:90vh; border-radius:32px; padding:0; background:#fff; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <!-- Modal Header -->
                    <div style="padding:32px 40px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="margin:0; font-size:24px; font-weight:950; letter-spacing:-0.5px; display:flex; align-items:center; gap:12px;">
                                <span class="material-icons-outlined" style="font-size:28px; color:#6366f1;">engineering</span>
                                ${id ? 'Chi tiết Định mức BOM' : 'Thiết lập BOM Sản xuất mới'}
                            </h2>
                            <div style="font-size:13px; color:rgba(255,255,255,0.6); font-weight:600; margin-top:4px;">Cấu trúc phân rã vật tư (WBS) và định mức tiêu hao kỹ thuật</div>
                        </div>
                        <button onclick="document.getElementById('bomModal').remove()" style="width:44px; height:44px; border-radius:14px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'"><span class="material-icons-outlined">close</span></button>
                    </div>

                    <div style="padding:40px; overflow-y:auto; max-height:calc(90vh - 180px); background:#f8fafc;">
                        <!-- Master Info -->
                        <div style="background:#fff; padding:28px; border-radius:24px; border:1px solid #e2e8f0; display:grid; grid-template-columns: 2fr 1fr 1fr; gap:24px; margin-bottom:32px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Tên sản phẩm thành phẩm <span style="color:#ef4444;">*</span></label>
                                <input type="text" id="bomProductName" value="${bom ? bom.productName : ''}" placeholder="Nhập tên sản phẩm chính..." style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Số lượng gốc (Base)</label>
                                <input type="number" id="bomBaseQty" value="${bom ? bom.baseQty : 1}" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Đơn vị tính</label>
                                <input type="text" id="bomUnit" value="${bom ? (bom.unit || 'SP') : 'SP'}" placeholder="VD: Cái, Tấn, Bộ..." style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:16px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                        </div>

                        <!-- Details Section -->
                        <div style="background:#fff; padding:28px; border-radius:24px; border:1px solid #e2e8f0;">
                            <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                                <h4 style="margin:0; font-size:16px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                                    <span class="material-icons-outlined" style="color:#6366f1;">list_alt</span>
                                    Danh sách thành phần cấu tạo
                                </h4>
                                <button onclick="window.erpApp.addBomRow()" style="padding:10px 20px; background:#eff6ff; color:#6366f1; border:none; border-radius:14px; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;" onmouseover="this.style.background='#dbeafe'">
                                    <span class="material-icons-outlined" style="font-size:20px;">add_box</span> Thêm vật tư thành phần
                                </button>
                            </div>

                            <table style="width:100%; border-collapse:separate; border-spacing:0 12px;">
                                <thead>
                                    <tr style="text-align:left;">
                                        <th style="padding:0 12px 0; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Tên vật tư / Quy cách</th>
                                        <th style="padding:0 12px 0; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; width:120px; text-align:right;">Định mức</th>
                                        <th style="padding:0 12px 0; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; width:90px; text-align:center;">ĐV</th>
                                        <th style="padding:0 12px 0; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; width:150px; text-align:right;">Giá ước tính</th>
                                        <th style="padding:0 12px 0; font-size:11px; font-weight:850; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; width:100px; text-align:right;">Hao hụt %</th>
                                        <th style="padding:0 12px 0; width:50px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="bomItemsBody">
                                    ${(bom ? bom.items : [{ name: '', qty: 0, unit: '', estimatePrice: 0, scrapPercent: 0 }]).map((item, idx) => `
                                        <tr>
                                            <td style="padding:0 4px;"><input type="text" class="item-name" value="${item.name}" placeholder="Tên vật tư..." style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:700; background:#f8fafc; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                                            <td style="padding:0 4px;"><input type="number" class="item-qty" value="${item.qty}" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                                            <td style="padding:0 4px;"><input type="text" class="item-unit" value="${item.unit}" placeholder="Kg/m..." style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:700; background:#f8fafc; text-align:center; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                                            <td style="padding:0 4px;"><input type="number" class="item-price" value="${item.estimatePrice}" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; color:#059669; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                                            <td style="padding:0 4px;"><input type="number" class="item-scrap" value="${item.scrapPercent}" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; color:#ef4444; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                                            <td style="text-align:center;"><button onclick="this.closest('tr').remove()" style="width:36px; height:36px; border-radius:10px; background:#fef2f2; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'"><span class="material-icons-outlined" style="font-size:18px;">delete</span></button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div style="padding:28px 40px; background:#fff; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:16px;">
                        <button onclick="document.getElementById('bomModal').remove()" style="padding:14px 32px; background:#fff; color:#64748b; border:2px solid #e2e8f0; border-radius:18px; font-weight:800; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'">Đóng cửa sổ</button>
                        <button onclick="window.erpApp.saveBOM('${id || ''}')" style="padding:14px 48px; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; border:none; border-radius:18px; font-weight:950; cursor:pointer; box-shadow:0 10px 20px -5px rgba(99, 102, 241, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">Lưu & Áp dụng BOM</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.addBomRow = function () {
        const body = document.getElementById('bomItemsBody');
        const row = `
            <tr>
                <td style="padding:0 4px;"><input type="text" class="item-name" placeholder="Tên vật tư..." style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:700; background:#f8fafc; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                <td style="padding:0 4px;"><input type="number" class="item-qty" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                <td style="padding:0 4px;"><input type="text" class="item-unit" placeholder="Kg/m..." style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:700; background:#f8fafc; text-align:center; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                <td style="padding:0 4px;"><input type="number" class="item-price" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; color:#059669; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                <td style="padding:0 4px;"><input type="number" class="item-scrap" style="width:100%; padding:14px; border:1.5px solid #f1f5f9; border-radius:14px; font-weight:800; background:#f8fafc; text-align:right; color:#ef4444; outline:none;" onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff'"></td>
                <td style="text-align:center;"><button onclick="this.closest('tr').remove()" style="width:36px; height:36px; border-radius:10px; background:#fef2f2; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'"><span class="material-icons-outlined" style="font-size:18px;">delete</span></button></td>
            </tr>
        `;
        body.insertAdjacentHTML('beforeend', row);
    };

    window.erpApp.saveBOM = async function (id) {
        const productName = document.getElementById('bomProductName').value;
        const baseQty = parseFloat(document.getElementById('bomBaseQty').value);
        const unit = document.getElementById('bomUnit').value;
        const rows = document.querySelectorAll('#bomItemsBody tr');
        const items = Array.from(rows).map(row => ({
            name: row.querySelector('.item-name').value,
            qty: parseFloat(row.querySelector('.item-qty').value) || 0,
            unit: row.querySelector('.item-unit').value,
            estimatePrice: parseFloat(row.querySelector('.item-price').value) || 0,
            scrapPercent: parseFloat(row.querySelector('.item-scrap').value) || 0
        })).filter(i => i.name);

        if (!productName || items.length === 0) {
            if (window.erpApp.showToast) { window.erpApp.showToast('Vui lòng nhập tên sản phẩm và ít nhất 1 vật tư!', 'error'); }
            return;
        }

        const existingBom = id ? boms.find(b => b.id === id) : null;
        const newBom = {
            id: id || ('BOM-' + new Date().getFullYear() + '-' + (boms.length + 1).toString().padStart(3, '0')),
            productName, baseQty, unit, status: 'active',
            version: existingBom ? (parseFloat(existingBom.version) + 0.1).toFixed(1) : '1.0',
            items
        };

        if (id) {
            const idx = boms.findIndex(b => b.id === id);
            boms[idx] = newBom;
        } else {
            boms.unshift(newBom);
        }

        localStorage.setItem('erp_boms', JSON.stringify(boms));
        window.boms = boms;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('boms', newBom, 'id');
        }

        document.getElementById('bomModal').remove();
        renderBOM();
        if (window.erpApp.showToast) { window.erpApp.showToast('Đã cập nhật định mức BOM thành công!', 'success'); }
    };

    window.erpApp.deleteBOM = function(id) {
        const bom = boms.find(b => b.id === id);
        if (!bom) return;
        
        const modalHtml = `
            <div id="delBomModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s ease-out; z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.6); backdrop-filter:blur(4px);">
                <div style="background:#fff; width:400px; border-radius:24px; padding:32px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); text-align:center;">
                    <div style="width:64px; height:64px; border-radius:50%; background:#fef2f2; color:#ef4444; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                        <span class="material-icons-outlined" style="font-size:32px;">warning</span>
                    </div>
                    <h3 style="margin:0 0 12px 0; font-size:20px; font-weight:900; color:#1e293b;">Xác nhận xóa BOM</h3>
                    <p style="margin:0 0 24px 0; font-size:14px; color:#64748b; line-height:1.5;">Bạn có chắc chắn muốn xóa định mức <strong>${bom.productName}</strong>? Hành động này không thể hoàn tác.</p>
                    <div style="display:flex; gap:12px;">
                        <button onclick="document.getElementById('delBomModal').remove()" style="flex:1; padding:12px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-weight:800; cursor:pointer;">Hủy bỏ</button>
                        <button onclick="window.erpApp.confirmDeleteBOM('${id}')" style="flex:1; padding:12px; background:#ef4444; color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons-outlined" style="font-size:18px;">delete_forever</span> Xóa BOM</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.confirmDeleteBOM = async function(id) {
        const idx = boms.findIndex(b => b.id === id);
        if (idx !== -1) {
            boms.splice(idx, 1);
            localStorage.setItem('erp_boms', JSON.stringify(boms));
            window.boms = boms;
            if (window.CrudSync) {
                await window.CrudSync.deleteItem('boms', id, 'id');
            }
            document.getElementById('delBomModal').remove();
            renderBOM();
            if (window.erpApp.showToast) {
                window.erpApp.showToast('Đã xóa định mức BOM!', 'success');
            }
        }
    };

    window.erpApp.renderBOM = renderBOM;
})();
