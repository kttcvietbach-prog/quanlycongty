(function () {
    console.log('✅ Inventory Report Logic: Loading Module...');
    'use strict';

    // ==========================================
    // State & Data Helpers
    // ==========================================
    let invSearchQuery = '';
    let nxtDateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    let nxtDateTo = new Date().toISOString().split('T')[0];

    function calculateStockStatsByRange(from, to) {
        const stats = {};
        const itemsList = (window.erpApp && window.erpApp.getDanhSachHangHoa) ? window.erpApp.getDanhSachHangHoa() : [];
        
        itemsList.forEach(p => {
            stats[p.name] = { 
                name: p.name, 
                id: p.id, 
                unit: p.unit, 
                category: p.category,
                minStock: p.minStock || 0, 
                opening: 0, 
                inbound: 0, 
                outbound: 0, 
                current: 0 
            };
        });

        const slList = (window.erpApp && window.erpApp.getPkList) ? window.erpApp.getPkList() : [];
        const grList = (window.erpApp && window.erpApp.getGoodsReceipts) ? window.erpApp.getGoodsReceipts() : [];

        // 1. Process Warehouse Slips (Manual)
        slList.forEach(pk => {
            if (pk.status !== 'da-duyet') return;
            const pkDate = pk.date;
            
            pk.items.forEach(item => {
                if (!stats[item.name]) stats[item.name] = { name: item.name, id: '---', unit: item.unit, minStock: 0, opening: 0, inbound: 0, outbound: 0, current: 0 };
                const s = stats[item.name];
                const qty = parseFloat(item.qty) || 0;

                if (pkDate < from) {
                    if (pk.type === 'nhap') s.opening += qty;
                    else if (pk.type === 'xuat') s.opening -= qty;
                } else if (!to || pkDate <= to) {
                    if (pk.type === 'nhap') s.inbound += qty;
                    else if (pk.type === 'xuat') s.outbound += qty;
                }
            });
        });

        // 2. Process Goods Receipts (Inbound from Purchase)
        grList.forEach(gr => {
            if (gr.status !== 'completed' && gr.status !== 'partial') return;
            const grDate = gr.date;

            gr.items.forEach(item => {
                if (!stats[item.name]) stats[item.name] = { name: item.name, id: '---', unit: item.unit, minStock: 0, opening: 0, inbound: 0, outbound: 0, current: 0 };
                const s = stats[item.name];
                const qty = parseFloat(item.qtyReceived) || 0;

                if (grDate < from) {
                    s.opening += qty;
                } else if (!to || grDate <= to) {
                    s.inbound += qty;
                }
            });
        });

        // 3. Finalize
        Object.values(stats).forEach(s => {
            s.current = s.opening + s.inbound - s.outbound;
        });
        return stats;
    }


    // ==========================================
    // MODULE: Tốn Kho (Current Stock)
    // ==========================================
    window.erpApp.renderTonKho = function () {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        const stockData = Object.values(calculateStockStatsByRange(new Date().toISOString().split('T')[0], null));
        const filtered = stockData.filter(s => 
            s.name.toLowerCase().includes(invSearchQuery.toLowerCase()) || 
            s.id.toLowerCase().includes(invSearchQuery.toLowerCase()) ||
            (s.category && s.category.toLowerCase().includes(invSearchQuery.toLowerCase()))
        );

        const stats = {
            totalItems: stockData.length,
            lowStock: stockData.filter(s => s.current < s.minStock && s.minStock > 0).length,
            outOfStock: stockData.filter(s => s.current <= 0).length
        };

        let html = `
            <div class="inventory-module" style="padding: 24px; animation: fadeInUp 0.4s ease both;">
                <!-- Header Toolbar -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div class="premium-title-group">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">Báo cáo tồn kho hiện tại</h1>
                            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Kho vận <span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">chevron_right</span> Báo cáo</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.print()" style="padding:10px 20px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; font-weight:700; font-size:14px; color:#64748b; display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <span class="material-icons-outlined">print</span> In Báo Cáo
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
                    ${renderStatCard('Tổng mặt hàng', stats.totalItems, 'inventory_2', '#eff6ff', '#3b82f6')}
                    ${renderStatCard('Dưới định mức', stats.lowStock, 'notification_important', '#fff7ed', '#f97316')}
                    ${renderStatCard('Hết hàng', stats.outOfStock, 'block', '#fef2f2', '#ef4444')}
                </div>

                <!-- Table Card -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                        <div style="position:relative; width:400px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px;">search</span>
                            <input type="text" placeholder="Tìm kiếm tên hàng, mã hàng..." value="${invSearchQuery}" 
                                oninput="window.erpApp.onInvSearch(this.value)"
                                style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div>
                             <select style="padding:10px 16px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; background:#fff; min-width:180px;">
                                <option value="">Tất cả kho</option>
                                ${(window.erpApp && window.erpApp.getDanhSachKho) ? window.erpApp.getDanhSachKho().map(k => `<option value="${k.name}">${k.name}</option>`).join('') : ''}
                             </select>
                        </div>
                    </div>

                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">MÃ HÀNG</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">TÊN SẢN PHẨM</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b;">DANH MỤC</th>
                                    <th style="padding:14px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b;">ĐƠN VỊ</th>
                                    <th style="padding:14px 20px; text-align:right; font-size:12px; font-weight:700; color:#64748b;">TỒN HIỆN TẠI</th>
                                    <th style="padding:14px 20px; text-align:right; font-size:12px; font-weight:700; color:#64748b;">ĐỊNH MỨC</th>
                                    <th style="padding:14px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b;">TRẠNG THÁI</th>
                                    <th style="padding:14px 20px; text-align:right; font-size:12px; font-weight:700; color:#64748b;">TÁC VỤ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.length === 0 ? `<tr><td colspan="7" style="padding:60px; text-align:center; color:#94a3b8;">Không tìm thấy dữ liệu tồn kho.</td></tr>` : 
                                filtered.map(s => `
                                    <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 20px; font-weight:700; color:#3b82f6;">${s.id}</td>
                                        <td style="padding:16px 20px; font-weight:700; color:#1e293b;">${s.name}</td>
                                        <td style="padding:16px 20px; color:#64748b;"><span style="padding:4px 8px; background:#f1f5f9; border-radius:6px; font-size:11px;">${s.category || 'N/A'}</span></td>
                                        <td style="padding:16px 20px; text-align:center; color:#64748b;">${s.unit}</td>
                                        <td style="padding:16px 20px; text-align:right; font-weight:800; font-size:15px; ${s.current < s.minStock ? 'color:#ef4444' : 'color:#1e293b'}">${s.current.toLocaleString()}</td>
                                        <td style="padding:16px 20px; text-align:right; color:#94a3b8;">${s.minStock.toLocaleString()}</td>
                                        <td style="padding:16px 20px; text-align:center;">${getStockBadge(s.current, s.minStock)}</td>
                                        <td style="padding:16px 20px; text-align:right;">
                                            <button onclick="window.erpApp.viewStockDetail('${s.name}')" style="background:none; border:none; cursor:pointer; color:#3b82f6;" title="Xem chi tiết"><span class="material-icons-outlined" style="font-size:20px;">visibility</span></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
        const input = document.querySelector('input[type="text"]');
        if (input && invSearchQuery) { input.focus(); input.setSelectionRange(invSearchQuery.length, invSearchQuery.length); }
    };

    // ==========================================
    // MODULE: Báo cáo Nhập Xuất Tồn
    // ==========================================
    window.erpApp.renderNhapXuatTon = function () {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        const periodStats = Object.values(calculateStockStatsByRange(nxtDateFrom, nxtDateTo));

        let html = `
            <div class="inventory-module" style="padding: 24px; animation: fadeInUp 0.4s ease both;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div class="premium-title-group">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">Báo cáo tổng hợp Nhập - Xuất - Tồn</h1>
                            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Kho vận <span class="material-icons-outlined" style="font-size: 14px; vertical-align: middle;">chevron_right</span> Báo cáo</div>
                        </div>
                    </div>
                    <button style="padding:10px 24px; background:#10b981; color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">
                        <span class="material-icons-outlined">file_download</span> Xuất Excel
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin-bottom:24px; box-shadow:0 4px 6px rgba(0,0,0,0.02); display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px; font-weight:700; color:#64748b;">TỪ NGÀY:</span>
                        <input type="date" value="${nxtDateFrom}" onchange="window.erpApp.onNXTDateChange('from', this.value)" style="padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none; font-size:13px;">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px; font-weight:700; color:#64748b;">ĐẾN NGÀY:</span>
                        <input type="date" value="${nxtDateTo}" onchange="window.erpApp.onNXTDateChange('to', this.value)" style="padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none; font-size:13px;">
                    </div>
                    <button onclick="window.erpApp.renderNhapXuatTon()" style="padding:8px 16px; background:#f1f5f9; color:#475569; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-outlined" style="font-size:18px;">refresh</span> Làm mới
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th rowspan="2" style="padding:14px 20px; text-align:left; font-size:12px; font-weight:700; color:#64748b; border-right:1px solid #f1f5f9;">SẢN PHẨM / MÃ HÀNG</th>
                                    <th rowspan="2" style="padding:14px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b; border-right:1px solid #f1f5f9;">ĐVT</th>
                                    <th colspan="1" style="padding:10px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b; border-right:1px solid #f1f5f9;">ĐẦU KỲ</th>
                                    <th colspan="2" style="padding:10px 20px; text-align:center; font-size:12px; font-weight:700; color:#64748b; border-right:1px solid #f1f5f9;">PHÁT SINH TRONG KỲ</th>
                                    <th colspan="1" style="padding:10px 20px; text-align:center; font-size:12px; font-weight:700; color:#3b82f6; background:#eff6ff;">CUỐI KỲ</th>
                                </tr>
                                <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9;">
                                    <th style="padding:10px 20px; text-align:right; font-size:11px; color:#94a3b8; border-right:1px solid #f1f5f9;">SỐ LƯỢNG</th>
                                    <th style="padding:10px 20px; text-align:right; font-size:11px; color:#10b981; border-right:1px solid #f1f5f9;">NHẬP (+)</th>
                                    <th style="padding:10px 20px; text-align:right; font-size:11px; color:#ef4444; border-right:1px solid #f1f5f9;">XUẤT (-)</th>
                                    <th style="padding:10px 20px; text-align:right; font-size:11px; color:#3b82f6; background:#eff6ff;">SỐ LƯỢNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${periodStats.length === 0 ? `<tr><td colspan="6" style="padding:60px; text-align:center; color:#94a3b8;">Không có dữ liệu trong khoảng thời gian này.</td></tr>` : 
                                periodStats.map(s => `
                                    <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:14px 20px; border-right:1px solid #f1f5f9;">
                                            <div style="font-weight:700; color:#1e293b; font-size:13px;">${s.name}</div>
                                            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${s.id}</div>
                                        </td>
                                        <td style="padding:14px 20px; text-align:center; color:#64748b; border-right:1px solid #f1f5f9;">${s.unit}</td>
                                        <td style="padding:14px 20px; text-align:right; font-weight:600; color:#475569; border-right:1px solid #f1f5f9;">${s.opening.toLocaleString()}</td>
                                        <td style="padding:14px 20px; text-align:right; font-weight:700; color:#10b981; border-right:1px solid #f1f5f9;">${s.inbound > 0 ? '+' + s.inbound.toLocaleString() : '0'}</td>
                                        <td style="padding:14px 20px; text-align:right; font-weight:700; color:#ef4444; border-right:1px solid #f1f5f9;">${s.outbound > 0 ? '-' + s.outbound.toLocaleString() : '0'}</td>
                                        <td style="padding:14px 20px; text-align:right; font-weight:800; color:#3b82f6; background:#f8fafc; font-size:15px;">${s.current.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
    };

    // ==========================================
    // UTILS & HELPERS
    // ==========================================
    function renderStatCard(label, value, icon, bg, color) {
        return `
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.02);">
                <div style="width:48px; height:48px; border-radius:12px; background:${bg}; color:${color}; display:flex; align-items:center; justify-content:center;">
                    <span class="material-icons-outlined">${icon}</span>
                </div>
                <div>
                    <div style="font-size:24px; font-weight:800; color:#1e293b;">${value}</div>
                    <div style="font-size:13px; color:#64748b; font-weight:500;">${label}</div>
                </div>
            </div>
        `;
    }

    function getStockBadge(curr, min) {
        if (curr <= 0) return `<span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#fef2f2; color:#ef4444; border:1px solid #fee2e2;">Hết hàng</span>`;
        if (curr < min) return `<span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#fff7ed; color:#f97316; border:1px solid #ffedd5;">Sắp hết</span>`;
        return `<span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#f0fdf4; color:#22c55e; border:1px solid #dcfce7;">Ổn định</span>`;
    }

    window.erpApp.onInvSearch = (val) => { invSearchQuery = val; window.erpApp.renderTonKho(); };
    window.erpApp.onNXTDateChange = (type, val) => {
        if (type === 'from') nxtDateFrom = val;
        else nxtDateTo = val;
        window.erpApp.renderNhapXuatTon();
    };

    window.erpApp.viewStockDetail = function (name) {
        const stats = calculateStockStatsByRange(new Date().toISOString().split('T')[0], null);
        const s = stats[name];
        if (!s) return;

        // 1. Get Warehouse Slip History
        const slList = (window.erpApp && window.erpApp.getPkList) ? window.erpApp.getPkList() : (window.pkList || []);
        const pkHistory = slList.filter(pk => pk.status === 'da-duyet' && pk.items.some(it => it.name === name))
            .map(pk => ({
                date: pk.date,
                id: pk.id,
                type: pk.type,
                qty: pk.items.find(it => it.name === name).qty,
                warehouse: pk.warehouse || 'Kho chính',
                source: 'Phiếu kho'
            }));

        // 2. Get Goods Receipt History
        const grList = (window.erpApp && window.erpApp.getGoodsReceipts) ? window.erpApp.getGoodsReceipts() : [];
        const grHistory = grList.filter(gr => (gr.status === 'completed' || gr.status === 'partial') && gr.items.some(it => it.name === name))
            .map(gr => ({
                date: gr.date,
                id: gr.id,
                type: 'nhap',
                qty: gr.items.find(it => it.name === name).qtyReceived,
                warehouse: 'Kho nhập hàng',
                source: 'Nhận hàng (QC)'
            }));

        // 3. Combine and Sort
        const history = [...pkHistory, ...grHistory].sort((a, b) => b.date.localeCompare(a.date));

        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999;';
        modal.id = 'stockDetailModal';
        modal.innerHTML = `
            <div style="background:#fff; border-radius:20px; width:90%; max-width:800px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:700; color:#1e293b;">Chi tiết biến động: ${name}</h2>
                    <span class="material-icons-outlined" onclick="document.getElementById('stockDetailModal').remove()" style="cursor:pointer; color:#94a3b8;">close</span>
                </div>
                <div style="padding:24px; overflow-y:auto; background:#f8fafc;">
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:20px;">
                        <div style="background:#fff; padding:12px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                            <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Tồn hiện tại</div>
                            <div style="font-size:18px; font-weight:800; color:#3b82f6;">${s.current} ${s.unit}</div>
                        </div>
                        <div style="background:#fff; padding:12px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                            <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Định mức</div>
                            <div style="font-size:18px; font-weight:800; color:#1e293b;">${s.minStock} ${s.unit}</div>
                        </div>
                        <div style="background:#fff; padding:12px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                            <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Trạng thái</div>
                            <div style="padding-top:4px;">${getStockBadge(s.current, s.minStock)}</div>
                        </div>
                    </div>
                    
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th style="padding:12px; text-align:left; font-size:11px; color:#64748b;">NGÀY</th>
                                    <th style="padding:12px; text-align:left; font-size:11px; color:#64748b;">MÃ PHIẾU</th>
                                    <th style="padding:12px; text-align:left; font-size:11px; color:#64748b;">NGUỒN</th>
                                    <th style="padding:12px; text-align:center; font-size:11px; color:#64748b;">LOẠI</th>
                                    <th style="padding:12px; text-align:right; font-size:11px; color:#64748b;">SỐ LƯỢNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.length === 0 ? `<tr><td colspan="5" style="padding:30px; text-align:center; color:#94a3b8;">Chưa có lịch sử giao dịch.</td></tr>` : 
                                history.map(h => `
                                    <tr style="border-bottom:1px solid #f1f5f9;">
                                        <td style="padding:12px; font-size:12px; color:#475569;">${h.date}</td>
                                        <td style="padding:12px; font-size:12px; font-weight:700; color:#3b82f6;">${h.id}</td>
                                        <td style="padding:12px; font-size:11px; color:#64748b;">
                                            <span style="display:flex; align-items:center; gap:4px;">
                                                <span class="material-icons-outlined" style="font-size:14px;">${h.source === 'Phiếu kho' ? 'inventory' : 'receipt_long'}</span>
                                                ${h.source}
                                            </span>
                                        </td>
                                        <td style="padding:12px; text-align:center;">${h.type === 'nhap' ? '<span style="color:#10b981; font-weight:700; font-size:11px;">NHẬP</span>' : '<span style="color:#ef4444; font-weight:700; font-size:11px;">XUẤT</span>'}</td>
                                        <td style="padding:12px; text-align:right; font-weight:700; font-size:14px; ${h.type === 'nhap' ? 'color:#10b981' : 'color:#ef4444'}">${h.type === 'nhap' ? '+' : '-'}${h.qty}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    };

    console.log('✅ Inventory Report Logic: Ready.');
})();
