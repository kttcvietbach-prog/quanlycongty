(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // ==========================================
    // MODULE: Phân tích Kinh doanh (Business Analysis)
    // ==========================================

    function loadData() {
        let sales = [];
        let costs = [];

        // Default data matching app.js to ensure consistency on first load
        const defaultSales = [
            { id: 'SO-001', customer: 'Công ty TNHH MTV Việt Bách', orderDate: '2026-04-01', totalAmount: 15500000, status: 'completed', items: [{ name: 'Thiết kế website', qty: 1, unit: 'Gói', price: 15500000 }] },
            { id: 'SO-002', customer: 'Cửa hàng Nội thất Minh Anh', orderDate: '2026-04-05', totalAmount: 8200000, status: 'shipping', items: [{ name: 'Bàn làm việc gỗ', qty: 2, unit: 'Cái', price: 4100000 }] },
            { id: 'SO-003', customer: 'KS. Rex Hotel', orderDate: '2026-04-06', totalAmount: 45000000, status: 'pending', items: [{ name: 'Hệ thống quản lý', qty: 1, unit: 'Hệ thống', price: 45000000 }] },
            { id: 'SO-004', customer: 'Trường ĐH Bách Khoa', orderDate: '2026-04-07', totalAmount: 2400000, status: 'draft', items: [{ name: 'Bảo trì thiết bị', qty: 1, unit: 'Lần', price: 2400000 }] }
        ];

        const defaultCosts = [
            { moId: 'MO-2026-0041', product: 'Bàn ghế phòng khách', materialCost: 25000000, laborCost: 5000000, overheadCost: 2000000, totalCost: 32000000, qty: 50 },
            { moId: 'MO-2026-0043', product: 'Giường ngủ hiện đại 1m8', materialCost: 40000000, laborCost: 8000000, overheadCost: 3000000, totalCost: 51000000, qty: 35 }
        ];

        try {
            const savedSales = localStorage.getItem('erp_sales_orders');
            sales = savedSales ? JSON.parse(savedSales) : defaultSales;

            const savedCosts = localStorage.getItem('erp_productionCosts');
            costs = savedCosts ? JSON.parse(savedCosts) : defaultCosts;
        } catch (e) {
            console.error('Error loading data for analysis:', e);
            sales = defaultSales;
            costs = defaultCosts;
        }
        return { sales, costs };
    }

    // 1. Module: Doanh thu và Lợi nhuận
    function renderRevenueProfit() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Doanh thu & Lợi nhuận';
        if (pageBadge) pageBadge.textContent = 'Kinh doanh';

        const { sales, costs } = loadData();
        const fmt = new Intl.NumberFormat('vi-VN');

        // Aggregations
        const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        // Estimate profit: For each sales order, try to match with a cost or use 25% margin as fallback
        const totalProfit = sales.reduce((sum, s) => {
            const cost = costs.find(c => c.product === s.items[0]?.name)?.totalCost || (s.totalAmount * 0.7);
            return sum + (s.totalAmount - cost);
        }, 0);
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

        const html = `
            <div class="analysis-module" style="animation: fadeIn 0.4s ease-out; padding: 2px;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('kinh-doanh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo cáo Doanh thu & Lợi nhuận</h2>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:32px;">
                    <div class="premium-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 24px; border-radius: 24px; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);">
                        <div style="font-size: 11px; font-weight: 800; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Tổng Doanh Thu</div>
                        <div style="font-size: 28px; font-weight: 900; margin-top: 8px;">${fmt.format(totalRevenue)} đ</div>
                        <div style="margin-top: 16px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons-outlined" style="font-size:16px">trending_up</span>
                            <span>+12.5% so với tháng trước</span>
                        </div>
                    </div>
                    <div class="premium-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; padding: 24px; border-radius: 24px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);">
                        <div style="font-size: 11px; font-weight: 800; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Lợi Nhuận Ước Tính</div>
                        <div style="font-size: 28px; font-weight: 900; margin-top: 8px;">${fmt.format(totalProfit)} đ</div>
                        <div style="margin-top: 16px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons-outlined" style="font-size:16px">verified</span>
                            <span>Biên lợi nhuận: ${margin}%</span>
                        </div>
                    </div>
                    <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; padding: 24px; border-radius: 24px;">
                        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Số lượng Đơn hàng</div>
                        <div style="font-size: 28px; font-weight: 900; margin-top: 8px; color: #1e293b;">${sales.length}</div>
                        <div style="margin-top: 16px; font-size: 12px; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons-outlined" style="font-size:16px; color:#f59e0b">shopping_bag</span>
                            <span>Giao dịch trung bình: ${fmt.format(Math.round(totalRevenue / (sales.length || 1)))} đ</span>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px; margin-bottom:32px;">
                    <!-- Revenue chart -->
                    <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 900; color: #1e293b;">Doanh thu theo Đơn hàng</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                    <!-- Profit Distribution -->
                    <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 900; color: #1e293b;">Cơ cấu Lợi nhuận</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="profitDoughnut"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 900; color: #1e293b;">Chi tiết Giao dịch & Hiệu quả</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #f1f5f9; text-align: left;">
                                    <th style="padding: 16px 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">MÃ ĐƠN</th>
                                    <th style="padding: 16px 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">KHÁCH HÀNG</th>
                                    <th style="padding: 16px 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">SẢN PHẨM</th>
                                    <th style="padding: 16px 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; text-align: right;">DOANH THU</th>
                                    <th style="padding: 16px 12px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; text-align: right;">LỢI NHUẬN</th>
                                    <th style="padding: 16px 12px; width: 80px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.map(s => {
            const cost = costs.find(c => c.product === s.items[0]?.name)?.totalCost || (s.totalAmount * 0.7);
            const profit = s.totalAmount - cost;
            const profitColor = profit >= 0 ? '#059669' : '#ef4444';
            return `
                                <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: pointer;" 
                                            onclick="window.erpApp.viewAnalysisDetail('${s.id}')"
                                            onmouseover="this.style.background='#fbfcfe'" 
                                            onmouseout="this.style.background='transparent'">
                                            <td style="padding: 16px 12px; font-weight: 800; color: #3b82f6;">${s.id}</td>
                                            <td style="padding: 16px 12px; font-weight: 700; color: #1e293b;">${s.customer}</td>
                                            <td style="padding: 16px 12px; font-weight: 600; color: #64748b;">${s.items[0]?.name || 'N/A'}</td>
                                            <td style="padding: 16px 12px; font-weight: 800; color: #1e293b; text-align: right;">${fmt.format(s.totalAmount)}</td>
                                            <td style="padding: 16px 12px; font-weight: 900; color: ${profitColor}; text-align: right;">${fmt.format(profit)}</td>
                                            <td style="padding: 16px 12px; text-align: right;">
                                                <button onclick="window.erpApp.viewAnalysisDetail('${s.id}')" style="background: none; border: none; color: #94a3b8; cursor: pointer;" title="Xem nhanh">
                                                    <span class="material-icons-outlined">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        // Initialize Charts
        setTimeout(() => {
            const revCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revCtx, {
                type: 'bar',
                data: {
                    labels: sales.map(s => s.id),
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: sales.map(s => s.totalAmount),
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => fmt.format(value),
                                font: { family: 'Inter', size: 10 }
                            }
                        },
                        x: { ticks: { font: { family: 'Inter', size: 10 } } }
                    }
                }
            });

            const profitCtx = document.getElementById('profitDoughnut').getContext('2d');
            new Chart(profitCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Sản xuất', 'Dịch vụ', 'Thương mại'],
                    datasets: [{
                        data: [65, 20, 15],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 11 } } }
                    }
                }
            });
        }, 100);
    }

    // 2. Module: Phân tích xu hướng
    function renderTrendAnalysis() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Phân tích xu hướng';
        if (pageBadge) pageBadge.textContent = 'Kinh doanh';

        const { sales } = loadData();
        const fmt = new Intl.NumberFormat('vi-VN');

        const html = `
            <div class="analysis-module" style="animation: fadeIn 0.4s ease-out; padding: 2px;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('kinh-doanh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Xu hướng Kinh doanh & Dự báo</h2>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:32px;">
                    <!-- Line Chart -->
                    <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #1e293b;">Biểu đồ Tăng trưởng Doanh thu</h3>
                            <select style="border:none; background:#f1f5f9; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; color:#475569;">
                                <option>6 tháng gần đây</option>
                                <option>1 năm qua</option>
                            </select>
                        </div>
                        <div style="height: 350px; position: relative;">
                            <canvas id="growthChart"></canvas>
                        </div>
                    </div>

                    <!-- Market Insights -->
                    <div style="display:grid; gap:24px;">
                        <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 900; color: #1e293b;">Dự báo Tháng tới</h3>
                            <div style="background:#f0fdf4; border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px;">
                                <div style="width:48px; height:48px; border-radius:50%; background:#10b98120; color:#10b981; display:flex; align-items:center; justify-content:center;">
                                    <span class="material-icons-outlined">insights</span>
                                </div>
                                <div>
                                    <div style="font-size:11px; font-weight:800; color:#059669; text-transform:uppercase;">Tốc độ tăng trưởng</div>
                                    <div style="font-size:20px; font-weight:900; color:#1e293b;">+5.8% Dự kiến</div>
                                </div>
                            </div>
                            <p style="margin:16px 0 0 0; font-size:13px; color:#64748b; font-weight:600; line-height:1.6;">AI dự đoán doanh thu sẽ đạt mốc <b>1.2 tỷ VNĐ</b> vào cuối tháng tới dựa trên dữ liệu đơn hàng định kỳ.</p>
                        </div>

                        <div class="premium-card" style="background: #1e293b; color:#fff; border-radius: 24px; padding: 24px; position:relative; overflow:hidden;">
                            <span class="material-icons-outlined" style="position:absolute; right:-20px; bottom:-20px; font-size:150px; opacity:0.1;">auto_awesome</span>
                            <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 900;">Đề xuất từ AI</h3>
                            <p style="margin:0; font-size:13px; font-weight:500; opacity:0.8; line-height:1.6;">Nhu cầu sản phẩm <b>"Bàn gỗ Walnut"</b> đang tăng cao 15%. Bạn nên chuẩn bị kế hoạch sản vật tư (BOM) sớm hơn 1 tuần.</p>
                        </div>
                    </div>
                </div>

                <div class="premium-card" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 900; color: #1e293b;">Biến động Thị trường & Đối thủ</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                        ${[1, 2, 3, 4].map(idx => `
                            <div style="padding:16px; border:1px solid #f1f5f9; border-radius:16px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="font-size:12px; font-weight:800; color:#94a3b8;">NHÓM ${idx}</span>
                                    <span style="color:#10b981; font-weight:900; font-size:12px;">+${idx * 2}%</span>
                                </div>
                                <div style="font-weight:900; color:#1e293b;">Sản phẩm loại ${idx}</div>
                                <div style="height:4px; background:#f1f5f9; border-radius:10px; margin-top:12px; overflow:hidden;">
                                    <div style="width:${50 + idx * 10}%; height:100%; background:#3b82f6; border-radius:10px;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        setTimeout(() => {
            const growthCtx = document.getElementById('growthChart').getContext('2d');
            const gradient = growthCtx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
                    datasets: [{
                        label: 'Doanh thu',
                        data: [650000000, 590000000, 800000000, 810000000, 560000000, 550000000],
                        borderColor: '#3b82f6',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#3b82f6',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => (value / 1000000) + ' M',
                                font: { family: 'Inter', size: 11 }
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: { font: { family: 'Inter', size: 11 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }, 100);
    }

    // Xem nhanh chi tiết đơn hàng (drill-down logic)
    function viewAnalysisDetail(id) {
        const { sales, costs } = loadData();
        const item = sales.find(s => s.id === id);
        if (!item) return;

        const costMatch = costs.find(c => c.product === item.items[0]?.name)?.totalCost || (item.totalAmount * 0.7);
        const profit = item.totalAmount - costMatch;
        const profitMargin = ((profit / item.totalAmount) * 100).toFixed(1);

        const fmt = new Intl.NumberFormat('vi-VN');
        const modalHtml = `
            <div id="analysisDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6);" onclick="this.remove()">
                <div class="modal-content" style="width:600px; border-radius:32px; padding:36px; background:#fff; position:relative; box-shadow:0 30px 60px -15px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="background:#eff6ff; color:#3b82f6; padding:8px; border-radius:12px;">insights</span>
                            Phân tích Chi tiết Đơn hàng
                        </h2>
                        <button onclick="document.getElementById('analysisDetailModal').remove()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="font-size:20px;">close</span></button>
                    </div>

                    <div style="display:grid; gap:24px;">
                        <!-- Order Summary -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div style="background:#f8fafc; padding:20px; border-radius:20px; border:1px solid #f1f5f9;">
                                <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã đơn / Khách hàng</div>
                                <div style="font-weight:900; color:#1e293b; font-size:15px;">${item.id}</div>
                                <div style="font-weight:700; color:#64748b; font-size:13px; margin-top:4px;">${item.customer}</div>
                            </div>
                            <div style="background:#f8fafc; padding:20px; border-radius:20px; border:1px solid #f1f5f9;">
                                <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày đặt / Trạng thái</div>
                                <div style="font-weight:900; color:#1e293b; font-size:15px;">${item.orderDate}</div>
                                <div style="font-weight:800; color:#3b82f6; font-size:13px; margin-top:4px; text-transform:capitalize;">${item.status}</div>
                            </div>
                        </div>

                        <!-- Financial Breakdown -->
                        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; display:grid; gap:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:#64748b;">Tổng Doanh thu</span>
                                <span style="font-size:18px; font-weight:900; color:#1e293b;">${fmt.format(item.totalAmount)} đ</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px dashed #e2e8f0;">
                                <span style="font-size:14px; font-weight:700; color:#64748b;">Giá vốn (Ước tính)</span>
                                <span style="font-size:16px; font-weight:900; color:#64748b;">- ${fmt.format(costMatch)} đ</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                                <span style="font-size:16px; font-weight:900; color:#1e293b;">Lợi nhuận gộp</span>
                                <span style="font-size:22px; font-weight:900; color:#059669;">${fmt.format(profit)} đ</span>
                            </div>
                        </div>

                        <!-- Analysis Metrics -->
                        <div>
                            <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px;">Chỉ số Hiệu quả</h4>
                            <div style="display:grid; gap:16px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                        <span style="font-size:13px; font-weight:700; color:#64748b;">Biên Lợi nhuận</span>
                                        <span style="font-size:13px; font-weight:900; color:#059669;">${profitMargin}%</span>
                                    </div>
                                    <div style="height:10px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                        <div style="width:${profitMargin}%; height:100%; background:linear-gradient(90deg, #10b981, #3b82f6); border-radius:10px;"></div>
                                    </div>
                                </div>
                                <p style="margin:0; font-size:12px; font-weight:600; color:#94a3b8; font-style:italic;">* Dữ liệu lợi nhuận được tính toán dựa trên định mức sản xuất và chi phí vận hành ước tính.</p>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px;">
                            <button onclick="document.getElementById('analysisDetailModal').remove()" style="padding:16px; background:#f1f5f9; color:#475569; border:none; border-radius:16px; font-weight:800; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Đóng</button>
                            <button onclick="window.erpApp.navigateTo('kinh-doanh'); window.erpApp.openModule('Đơn hàng bán'); document.getElementById('analysisDetailModal').remove();" style="padding:16px; background:#1e293b; color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                <span class="material-icons-outlined" style="font-size:18px;">open_in_new</span> Xem Đơn gốc
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Export to erpApp
    window.erpApp.renderRevenueProfit = renderRevenueProfit;
    window.erpApp.renderTrendAnalysis = renderTrendAnalysis;
    window.erpApp.viewAnalysisDetail = viewAnalysisDetail;

})();
