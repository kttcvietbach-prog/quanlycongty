// ==========================================
// Module: Office Expense Management Pro
// VIETBACHCORP ERP - High Fidelity Redesign
// ==========================================

(function () {
    'use strict';

    // === Guard: Ensure formatValue/parseVND exist regardless of script load order ===
    if (!window.erpApp.formatValue && window.erpUtils && window.erpUtils.formatValue) {
        window.erpApp.formatValue = window.erpUtils.formatValue;
    }
    if (!window.erpApp.parseVND && window.erpUtils && window.erpUtils.parseVND) {
        window.erpApp.parseVND = window.erpUtils.parseVND;
    }
    if (!window.erpApp.formatNumberInput && window.erpUtils && window.erpUtils.formatNumberInput) {
        window.erpApp.formatNumberInput = window.erpUtils.formatNumberInput;
    }
    // Fallback if erpUtils itself hasn't loaded yet
    if (!window.erpApp.formatValue) {
        window.erpApp.formatValue = (val) => {
            if (val === null || val === undefined || val === '') return '0';
            const num = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(/,/g, '')) : val;
            if (isNaN(num)) return '0';
            return num.toLocaleString('vi-VN');
        };
    }
    if (!window.erpApp.parseVND) {
        window.erpApp.parseVND = (str) => {
            if (!str) return 0;
            return parseFloat(String(str).replace(/\./g, '').replace(/,/g, '')) || 0;
        };
    }

    // Helper: formatDate
    const formatDate = (d) => {
        if (window.erpApp.formatDate) return window.erpApp.formatDate(d);
        if (!d) return '—';
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // ==========================================
    // Constants & State
    // ==========================================
    const COLLECTION_EXPENSES = 'office_expenses';
    const COLLECTION_NORMS = 'expense_norms';
    const COLLECTION_CATEGORIES = 'office_categories';

    let EXPENSE_CATEGORIES = {
        'VPP': { label: 'Văn phòng phẩm', icon: 'auto_stories', color: '#3B82F6', tk: '6422' },
        'DIEN': { label: 'Điện & Nước', icon: 'electric_bolt', color: '#F59E0B', tk: '642' },
        'NUOC': { label: 'Tiền nước', icon: 'opacity', color: '#0EA5E9', tk: '642' },
        'INTERNET': { label: 'Internet & Viễn thông', icon: 'language', color: '#6366F1', tk: '6424' },
        'VESINH': { label: 'Vệ sinh & Tạp vụ', icon: 'cleaning_services', color: '#10B981', tk: '642' },
        'SUACHUA': { label: 'Bảo trì văn phòng', icon: 'handyman', color: '#EF4444', tk: '6425' },
        'KHAC': { label: 'Chi phí khác', icon: 'pending_actions', color: '#64748b', tk: '6428' },
        'TIEPKHACH': { label: 'Tiếp khách', icon: 'restaurant', color: '#f59e0b', tk: '6423' }
    };

    let officeExpenses = [];
    let expenseNorms = [];
    let currentTab = 'dashboard'; // 'dashboard' | 'requests' | 'norms'
    let dashboardMonth = new Date().getMonth() + 1; // 1-12
    let dashboardYear = new Date().getFullYear();
    let selectedForPrint = new Set();
    let tempExpenseFiles = [];

    // formatDate is now provided globally via window.erpApp.formatDate

    // ==========================================
    // Initialization
    // ==========================================
    async function init() {
        console.log('🚀 [OfficeExpense] Đang khởi tạo module...');

        // 1. Tải nhanh từ LocalStorage
        officeExpenses = window.erpApp._getData(COLLECTION_EXPENSES) || [];
        
        // --- MIGRATION: Gộp dữ liệu từ Chi phí khác ---
        let oldOtherExpenses = window.erpApp._getData('other_expenses') || [];
        if (oldOtherExpenses.length > 0) {
            let changed = false;
            for (const oe of oldOtherExpenses) {
                // Đảm bảo hạng mục hợp lệ trong Office Expense
                if (!EXPENSE_CATEGORIES[oe.category]) {
                    oe.category = 'KHAC'; 
                }
                if (!officeExpenses.find(e => e.id === oe.id)) {
                    officeExpenses.push(oe);
                    changed = true;
                }
            }
            if (changed) {
                window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);
                window.erpApp._setData('other_expenses', []); // Xóa sau khi đã gộp
                console.log(`📦 [OfficeExpense] Đã gộp ${oldOtherExpenses.length} dữ liệu từ Chi phí khác.`);
            }
        }

        // Hạt giống dữ liệu nếu chưa có đề xuất nào
        if (!officeExpenses || officeExpenses.length === 0) {
            officeExpenses = [
                {
                    id: 'OTH-2026-1001',
                    requester: 'Nguyễn Quang Quốc',
                    date: '2026-05-18',
                    category: 'KHAC',
                    amount: 15000000,
                    advance: 3000000,
                    desc: 'Sửa chữa và nâng cấp hệ thống thoát nước kho bãi trung tâm',
                    invoiceNo: 'HD-KOB-001',
                    evidenceUrl: '',
                    fileData: null,
                    status: 'approved',
                    paymentStatus: 'unpaid',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'OTH-2026-1002',
                    requester: 'Nguyễn Quang Quốc',
                    date: '2026-05-18',
                    category: 'KHAC',
                    amount: 8500000,
                    advance: 0,
                    desc: 'Sơn lại văn phòng làm việc và thay thế hệ thống đèn chiếu sáng',
                    invoiceNo: 'HD-VP-092',
                    evidenceUrl: '',
                    fileData: null,
                    status: 'approved',
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString()
                }
            ];
            window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);
        }

        expenseNorms = window.erpApp._getData(COLLECTION_NORMS) || [];
        const savedCats = window.erpApp._getData(COLLECTION_CATEGORIES);
        if (savedCats) {
            if (Array.isArray(savedCats) && savedCats.length > 0 && savedCats[0].data) {
                EXPENSE_CATEGORIES = savedCats[0].data;
            } else if (!Array.isArray(savedCats) && Object.keys(savedCats).length > 0) {
                EXPENSE_CATEGORIES = savedCats;
            }
        }

        console.log(`📦 [OfficeExpense] Load nhanh: ${officeExpenses.length} đề xuất, ${expenseNorms.length} định mức.`);

        // Render ngay lập tức (có thể trống nhưng sẽ được lấp đầy sau)
        window.erpApp.renderOfficeExpense();

        // 2. Đợi đồng bộ Cloud
        if (window.SyncManager) {
            await window.SyncManager.ready;
            const cloudExpenses = window.erpApp._getData(COLLECTION_EXPENSES);
            const cloudNorms = window.erpApp._getData(COLLECTION_NORMS);
            const cloudCats = window.erpApp._getData(COLLECTION_CATEGORIES);

            if (cloudExpenses && cloudExpenses.length > 0) { officeExpenses = cloudExpenses; }
            if (cloudNorms && cloudNorms.length > 0) { expenseNorms = cloudNorms; }
            if (cloudCats) {
                if (Array.isArray(cloudCats) && cloudCats.length > 0 && cloudCats[0].data) {
                    EXPENSE_CATEGORIES = cloudCats[0].data;
                } else if (!Array.isArray(cloudCats) && Object.keys(cloudCats).length > 0) {
                    EXPENSE_CATEGORIES = cloudCats;
                }
            }

            // Gộp lại lần nữa từ Cloud nếu Cloud có other_expenses
            let cloudOtherExpenses = window.erpApp._getData('other_expenses') || [];
            if (cloudOtherExpenses.length > 0) {
                let changed = false;
                for (const oe of cloudOtherExpenses) {
                    if (!EXPENSE_CATEGORIES[oe.category]) oe.category = 'KHAC';
                    if (!officeExpenses.find(e => e.id === oe.id)) {
                        officeExpenses.push(oe);
                        changed = true;
                    }
                }
                if (changed) {
                    window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);
                    window.erpApp._setData('other_expenses', []);
                    if (window.CrudSync) {
                        for (const oe of cloudOtherExpenses) {
                            try { await window.CrudSync.saveItem(COLLECTION_EXPENSES, oe, 'id'); } catch(e){}
                        }
                    }
                }
            }

            console.log(`☁️ [OfficeExpense] Đã đồng bộ từ Cloud: ${officeExpenses.length} đề xuất.`);
            window.erpApp.renderOfficeExpense();
        }

        // 3. Nếu trống hoàn toàn (lần đầu), tạo ngay để UI có cái hiển thị
        if (expenseNorms.length === 0) {
            console.log('💡 [OfficeExpense] Khởi tạo định mức mặc định...');
            expenseNorms = Object.keys(EXPENSE_CATEGORIES).map(cat => ({
                category: cat,
                limit: 5000000,
                used: 0
            }));
            window.erpApp._setData(COLLECTION_NORMS, expenseNorms);
        }

        window.erpApp.renderOfficeExpense();
    }

    // ==========================================
    // Main Renderer
    // ==========================================
    window.erpApp.renderOfficeExpense = function () {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) { return; }

        // Sắp xếp chi phí mới nhất lên đầu tiên trước khi render
        if (Array.isArray(officeExpenses)) {
            officeExpenses.sort((a, b) => {
                const dateA = window.erpApp.toJsDate(a.date) || new Date(0);
                const dateB = window.erpApp.toJsDate(b.date) || new Date(0);
                if (dateB.getTime() !== dateA.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                }
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (timeB !== timeA) return timeB - timeA;
                return String(b.id).localeCompare(String(a.id));
            });
        }

        window.erpApp.updateBreadcrumb('Chi phí văn phòng', 'Hành chính');

        let html = `
            <div class="office-expense-pro animated fadeIn">
                <!-- Premium Header Card (Glassmorphism) -->
                <div class="glass-card module-header-pro">
                    <div class="header-info-group">
                        <button class="header-back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" title="Quay lại">
                            <span class="material-icons-outlined">arrow_back</span>
                        </button>
                        <div class="header-icon-box">
                            <span class="material-icons-outlined">receipt_long</span>
                        </div>
                        <div class="header-title-box">
                            <h1>Chi phí văn phòng</h1>
                            <p>Quản lý đề xuất, định mức và hạch toán chi phí hành chính chuyên nghiệp</p>
                        </div>
                    </div>
                    <button class="btn-primary-pro" onclick="window.erpApp.openNewExpenseModal()">
                        <span class="material-icons-outlined">add_circle</span> 
                        <span>Đề xuất mới</span>
                    </button>
                </div>

                <!-- Modern Tabs V3 -->
                <div class="module-tabs-container">
                    <button class="tab-btn-modern tab-dashboard ${currentTab === 'dashboard' ? 'active' : ''}" onclick="window.erpApp.setExpenseTab('dashboard')">
                        <span class="material-icons-outlined">space_dashboard</span>
                        <span class="tab-label">Bảng điều khiển</span>
                    </button>
                    <button class="tab-btn-modern tab-requests ${currentTab === 'requests' ? 'active' : ''}" onclick="window.erpApp.setExpenseTab('requests')">
                        <span class="material-icons-outlined">request_quote</span>
                        <span class="tab-label">Đề xuất chi phí</span>
                    </button>
                    <button class="tab-btn-modern tab-categories ${currentTab === 'categories' ? 'active' : ''}" onclick="window.erpApp.setExpenseTab('categories')">
                        <span class="material-icons-outlined">category</span>
                        <span class="tab-label">Hạng mục chi phí</span>
                    </button>

                </div>

                <div id="expenseModuleBody">
                    ${renderTabContent()}
                </div>
            </div>
        `;

        pageContent.innerHTML = html;
        injectStyles();

        // Bật kéo chuột để cuộn bảng (Drag-to-scroll)
        const scrollContainers = pageContent.querySelectorAll('.table-responsive-pro');
        scrollContainers.forEach(container => {
            if (window.erpApp.enableDragToScroll) {
                window.erpApp.enableDragToScroll(container);
            }
        });

        if (currentTab === 'dashboard') {
            setTimeout(initDashboardCharts, 100);
        }
    };

    function renderTabContent() {
        switch (currentTab) {
            case 'dashboard': return renderDashboard();
            case 'requests': return renderRequests();
            case 'norms': return renderNorms();
            case 'categories': return renderCategories();

            default: return '';
        }
    }

    window.erpApp.setExpenseTab = function (tab) {
        currentTab = tab;
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.filterExpenses = function (query) {
        const filtered = officeExpenses.filter(e =>
            e.desc.toLowerCase().includes(query.toLowerCase()) ||
            e.id.toLowerCase().includes(query.toLowerCase()) ||
            e.requester.toLowerCase().includes(query.toLowerCase())
        );
        const tbody = document.getElementById('expenseTableBody');
        if (tbody) { tbody.innerHTML = renderTableRows(filtered); }
    };

    window.erpApp.filterByCategory = function (cat) {
        const filtered = cat === 'all' ? officeExpenses : officeExpenses.filter(e => e.category === cat);
        const tbody = document.getElementById('expenseTableBody');
        if (tbody) { tbody.innerHTML = renderTableRows(filtered); }
    };

    // Dashboard filter handler
    window.erpApp.setExpenseDashboardFilter = function () {
        const mEl = document.getElementById('dashMonthFilter');
        const yEl = document.getElementById('dashYearFilter');
        if (mEl) dashboardMonth = parseInt(mEl.value);
        if (yEl) dashboardYear = parseInt(yEl.value);
        window.erpApp.renderOfficeExpense();
    };

    function getFilteredByMonth(expenses, month, year) {
        return expenses.filter(e => {
            const d = window.erpApp.toJsDate(e.date);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
        });
    }

    function renderDashboard() {
        const filtered = getFilteredByMonth(officeExpenses, dashboardMonth, dashboardYear);
        const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
        const overallNorm = expenseNorms.reduce((sum, n) => sum + n.limit, 0);
        const usedPct = overallNorm > 0 ? (totalAmount / overallNorm) * 100 : 0;

        const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

        return `
            <div class="expense-dashboard-v2 animated fadeInUp">
                <!-- Dashboard Filter -->
                <div class="glass-card" style="margin-bottom:20px; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; border-radius:16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:22px;">filter_list</span>
                        <span style="font-weight:700; color:#1e3a8a; font-size:14px;">Bộ lọc biểu đồ</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                        <select id="dashMonthFilter" onchange="window.erpApp.setExpenseDashboardFilter()" style="padding:10px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:700; background:#fff; cursor:pointer; outline:none; min-width:130px;">
                            ${monthNames.map((name, i) => `<option value="${i+1}" ${dashboardMonth === i+1 ? 'selected' : ''}>${name}</option>`).join('')}
                        </select>
                        <select id="dashYearFilter" onchange="window.erpApp.setExpenseDashboardFilter()" style="padding:10px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:700; background:#fff; cursor:pointer; outline:none; min-width:100px;">
                            ${[2024, 2025, 2026, 2027].map(y => `<option value="${y}" ${dashboardYear === y ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Top Row: 3 Stats Cards -->
                <div class="stats-row-v2">
                    <div class="glass-card stat-card-v2">
                        <span class="stat-label-v2">TỔNG CHI TIÊU ${monthNames[dashboardMonth - 1].toUpperCase()}</span>
                        <div class="stat-value-v2">${window.erpApp.formatValue(totalAmount)}</div>
                        <div class="stat-trend positive">
                            <span class="material-icons-outlined">trending_up</span>
                            <span>Tính trên ${filtered.length} đề xuất đã tạo trong tháng</span>
                        </div>
                    </div>
                    <div class="glass-card stat-card-v2">
                        <span class="stat-label-v2">Sử DỤNG ĐỊNH MỨC</span>
                        <div class="stat-value-v2">${usedPct.toFixed(1)}%</div>
                        <div class="stat-progress-v2">
                            <div class="fill" style="width: ${Math.min(usedPct, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="charts-row-v2">
                    <div class="glass-card chart-main-v2">
                        <div class="chart-header-v2">
                            <h3>Chi phí các tháng trong năm ${dashboardYear}</h3>
                        </div>
                        <div class="main-chart-container">
                            <canvas id="monthlyTrendChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-card chart-side-v2">
                        <div class="chart-header-v2">
                            <h3>Chi phí theo hạng mục (${monthNames[dashboardMonth - 1]})</h3>
                        </div>
                        <div class="donut-chart-container">
                            <canvas id="expenseCategoryChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="glass-card recent-requests-card animated fadeInUp" style="margin-top: 24px;">
                    <div class="card-header-v2">
                        <h3>Đề xuất trong ${monthNames[dashboardMonth - 1]}/${dashboardYear}</h3>
                        <button class="btn-text" onclick="window.erpApp.setExpenseTab('requests')">Xem tất cả</button>
                    </div>
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th>Mã số</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung</th>
                                    <th class="text-right">Số tiền</th>
                                    <th>Chứng từ</th>
                                    <th>Thanh toán</th>
                                    <th>Công nợ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.slice(0, 10).map(e => {
            const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            const isPaid = e.paymentStatus === 'paid';
            return `
                                        <tr>
                                            <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                                            <td data-label="Hạng mục">
                                                <div class="cat-cell">
                                                    <span class="material-icons-outlined" style="color:${cat.color}; font-size:16px;">${cat.icon}</span>
                                                    <span>${cat.label}</span>
                                                </div>
                                            </td>
                                            <td data-label="Nội dung"><div class="text-truncate" style="max-width:200px;">${e.desc}</div></td>
                                            <td data-label="Số tiền" class="text-right">
                                                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                                                    <span style="font-weight:700; color:#1e293b;">${window.erpApp.formatValue(e.amount)}</span>
                                                    ${e.advance > 0 ? `<span style="font-size:10px; color:#ef4444; font-weight:500;">T.Ứng: -${window.erpApp.formatValue(e.advance)}</span>` : ''}
                                                </div>
                                            </td>
                                            <td data-label="Chứng từ">
                                                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                                    ${e.files && e.files.length > 0 ?
                    e.files.map((file, idx) => `
                                                            <a href="${file.url || file.dataUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-right:8px;" title="${file.name}">
                                                                <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                                                ${e.files.length > 1 ? `Tệp ${idx + 1}` : (e.invoiceNo || 'Xem')}
                                                            </a>
                                                        `).join('')
                    : (e.evidenceUrl ? `
                                                            <a href="${e.evidenceUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để xem chứng từ">
                                                                <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                                                ${e.invoiceNo || 'Xem'}
                                                            </a>
                                                        ` : `<span style="color:#94a3b8; font-style:italic; font-size:12px;">${e.invoiceNo || '---'}</span>`)
                }
                                                </div>
                                            </td>
                                            <td data-label="Thanh toán">
                                                <select class="payment-select ${isPaid ? 'paid' : 'unpaid'}" onchange="window.erpApp.togglePaymentStatus('${e.id}', this.value)">
                                                    <option value="unpaid" ${!isPaid ? 'selected' : ''}>Chưa thanh toán</option>
                                                    <option value="paid" ${isPaid ? 'selected' : ''}>Đã thanh toán</option>
                                                </select>
                                            </td>
                                            <td data-label="Công nợ">
                                                ${!isPaid ? `<span class="debt-badge">${window.erpApp.formatValue(e.amount - (e.advance || 0))}</span>` : '<span style="color:#94a3b8; font-size:12px;">—</span>'}
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
    }

    function initDashboardCharts() {
        initCategoryChart();
        initTrendChart();
    }

    function initCategoryChart() {
        const ctx = document.getElementById('expenseCategoryChart');
        if (!ctx) { return; }

        // Lọc theo tháng/năm đang chọn
        const filtered = getFilteredByMonth(officeExpenses, dashboardMonth, dashboardYear);

        const dataByCat = {};
        Object.keys(EXPENSE_CATEGORIES).forEach(key => {
            const total = filtered
                .filter(e => e.category === key)
                .reduce((sum, e) => sum + e.amount, 0);
            if (total > 0) { dataByCat[key] = total; }
        });

        const labels = Object.keys(dataByCat).map(k => EXPENSE_CATEGORIES[k].label);
        const data = Object.values(dataByCat);
        const colors = Object.keys(dataByCat).map(k => EXPENSE_CATEGORIES[k].color);

        if (window.myExpenseChart) { window.myExpenseChart.destroy(); }

        if (data.length === 0) {
            ctx.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:13px; font-weight:600;"><span class="material-icons-outlined" style="margin-right:8px;">info</span>Không có dữ liệu trong tháng này</div>';
            return;
        }

        window.myExpenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { family: '\'Inter\', sans-serif', size: 11, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: {
                            label: function (context) {
                                return ` ${window.erpApp.formatValue(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function initTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart');
        if (!ctx) { return; }

        const months = [];
        const data = [];
        const bgColors = [];
        const borderColors = [];

        // Hiển thị đủ 12 tháng trong năm đang chọn
        for (let i = 1; i <= 12; i++) {
            months.push(`T${i}`);
            const monthTotal = officeExpenses
                .filter(e => {
                    const eDate = window.erpApp.toJsDate(e.date);
                    return eDate.getMonth() + 1 === i && eDate.getFullYear() === dashboardYear;
                })
                .reduce((sum, e) => sum + e.amount, 0);
            data.push(monthTotal);

            // Highlight tháng đang chọn
            if (i === dashboardMonth) {
                bgColors.push('#3b82f6');
                borderColors.push('#2563eb');
            } else {
                bgColors.push('#cbd5e1');
                borderColors.push('#94a3b8');
            }
        }

        if (window.myTrendChart) { window.myTrendChart.destroy(); }

        window.myTrendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Chi phí',
                    data: data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: {
                            label: function (context) {
                                return ` ${window.erpApp.formatValue(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            font: { family: '\'Inter\', sans-serif', size: 11 },
                            callback: value => value >= 1000000 ? (value / 1000000) + 'tr' : window.erpApp.formatValue(value)
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: '\'Inter\', sans-serif', size: 12, weight: '600' } }
                    }
                },
                onClick: function(evt, elements) {
                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        dashboardMonth = idx + 1;
                        const mEl = document.getElementById('dashMonthFilter');
                        if (mEl) mEl.value = dashboardMonth;
                        window.erpApp.renderOfficeExpense();
                    }
                }
            }
        });
    }

    // ==========================================
    // Tab: Requests (List View)
    // ==========================================
    function renderRequests() {
        const selCount = selectedForPrint.size;
        const selTotal = officeExpenses.filter(e => selectedForPrint.has(e.id)).reduce((sum, e) => sum + e.amount, 0);

        return `
            <div class="requests-container animated fadeInUp">
                <!-- Table Toolbar -->
                <div class="table-toolbar-pro glass-card">
                    <div class="search-box-pro">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" placeholder="Tìm kiếm đề xuất..." onkeyup="window.erpApp.filterExpenses(this.value)">
                    </div>
                    <div class="filter-actions-pro">
                        <select onchange="window.erpApp.filterByCategory(this.value)">
                            <option value="all">Tất cả hạng mục</option>
                            ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}">${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                        </select>
                        <button class="btn-icon-v2" onclick="window.erpApp.exportExpensesToExcel()" title="Xuất báo cáo Excel">
                            <span class="material-icons-outlined">download</span>
                        </button>
                    </div>
                </div>

                <!-- Batch Print Toolbar -->
                <div class="glass-card batch-print-toolbar" style="margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-radius: 16px; ${selCount > 0 ? 'border: 1.5px solid #3b82f6; background: #f0f7ff;' : ''}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="material-icons-outlined" style="color:${selCount > 0 ? '#3b82f6' : '#94a3b8'}; font-size:22px;">checklist</span>
                        <span style="font-weight:700; color:${selCount > 0 ? '#1e3a8a' : '#64748b'}; font-size:14px;">
                            ${selCount > 0 ? `Đã chọn <strong>${selCount}</strong> phiếu • Tổng: <strong>${window.erpApp.formatValue(selTotal)} VNĐ</strong>` : 'Chưa chọn phiếu nào — Tích chọn để in đề xuất'}
                        </span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        ${selCount > 0 ? `
                            <button class="btn-text" style="color:#ef4444;" onclick="window.erpApp.clearPrintSelection()">
                                <span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">clear_all</span>
                                Bỏ chọn tất cả
                            </button>
                        ` : ''}
                        <button class="btn-primary-pro" style="padding: 10px 20px; font-size: 13px; ${selCount < 1 ? 'opacity:0.4; pointer-events:none;' : ''}" onclick="window.erpApp.printMultipleExpenses()">
                            <span class="material-icons-outlined" style="font-size:18px;">print</span>
                            In đề xuất đã chọn (${selCount})
                        </button>
                    </div>
                </div>

                <div class="glass-card table-container-pro">
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">
                                        <input type="checkbox" id="selectAllExpensePrint" ${selCount === officeExpenses.length && selCount > 0 ? 'checked' : ''}
                                            onchange="window.erpApp.toggleAllPrintSelection(this.checked)"
                                            style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                                    </th>
                                    <th>Mã số</th>
                                    <th>Ngày</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung chi tiết</th>
                                    <th>Người đề xuất</th>
                                    <th class="text-right">Số tiền</th>
                                    <th>Chứng từ</th>
                                    <th>Thanh toán</th>
                                    <th class="text-right">Công nợ</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="expenseTableBody">
                                ${renderTableRows(officeExpenses)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTableRows(data) {
        const user = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : null;
        const isAdmin = user && user.role === 'Admin';

        if (!data || data.length === 0) {
            return '<tr><td colspan="12" class="text-center" style="padding: 40px; color: #94a3b8;">Không tìm thấy đề xuất nào</td></tr>';
        }
        return data.map(e => {
            const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            const isSelected = selectedForPrint.has(e.id);
            return `
                <tr style="${isSelected ? 'background:#f0f7ff;' : ''}">
                    <td style="text-align:center;" data-label="Chọn">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}
                            onchange="window.erpApp.togglePrintSelection('${e.id}', this.checked)"
                            style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                    </td>
                    <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                    <td data-label="Ngày"><div class="date-cell">${window.erpApp.formatDate(e.date)}</div></td>
                    <td data-label="Hạng mục">
                        <div class="cat-cell">
                            <div class="cat-icon-circle" style="background:${cat.color}15; color:${cat.color}">
                                <span class="material-icons-outlined">${cat.icon}</span>
                            </div>
                            <span>${cat.label}</span>
                        </div>
                    </td>
                    <td data-label="Nội dung">
                        <div class="text-truncate-v2" title="${e.desc}">
                            ${e.desc}
                        </div>
                    </td>
                    <td data-label="Người đề xuất">
                        <div class="user-cell">
                            <div class="avatar-mini">${e.requester.charAt(0)}</div>
                            <span>${e.requester}</span>
                        </div>
                    </td>
                    <td data-label="Số tiền" class="text-right">
                        <div style="display:flex; flex-direction:column; align-items:flex-end;">
                            <span style="font-weight:700; color:#1e293b;">${window.erpApp.formatValue(e.amount)}</span>
                            ${e.advance > 0 ? `<span style="font-size:10px; color:#ef4444; font-weight:500;">T.Ứng: -${window.erpApp.formatValue(e.advance)}</span>` : ''}
                        </div>
                    </td>
                    <td data-label="Chứng từ">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            ${e.files && e.files.length > 0 ?
                    e.files.map((file, idx) => `
                                    <a href="${file.url || file.dataUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-right:8px;" title="${file.name}">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                        ${e.files.length > 1 ? `Tệp ${idx + 1}` : (e.invoiceNo || 'Xem')}
                                    </a>
                                `).join('')
                    : (e.evidenceUrl ? `
                                    <a href="${e.evidenceUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để xem chứng từ">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                        ${e.invoiceNo || 'Xem'}
                                    </a>
                                ` : `<span style="color:#94a3b8; font-style:italic; font-size:12px;">${e.invoiceNo || '---'}</span>`)
                }
                        </div>
                    </td>
                    <td data-label="Thanh toán">
                        <select class="payment-select ${e.paymentStatus === 'paid' ? 'paid' : 'unpaid'}" onchange="window.erpApp.togglePaymentStatus('${e.id}', this.value)">
                            <option value="unpaid" ${e.paymentStatus !== 'paid' ? 'selected' : ''}>Chưa thanh toán</option>
                            <option value="paid" ${e.paymentStatus === 'paid' ? 'selected' : ''}>Đã thanh toán</option>
                        </select>
                    </td>
                    <td data-label="Công nợ" class="text-right">
                        ${e.paymentStatus !== 'paid' ? `<span class="debt-badge">${window.erpApp.formatValue(e.amount - (e.advance || 0))}</span>` : '<span style="color:#94a3b8; font-size:12px;">—</span>'}
                    </td>
                    <td data-label="Thao tác">
                        <div class="row-actions">
                            <button class="action-btn-v2" onclick="window.erpApp.viewExpenseDetail('${e.id}')" title="Xem chi tiết">
                                <span class="material-icons-outlined">visibility</span>
                            </button>
                            <button class="action-btn-v2" onclick="window.erpApp.openEditExpenseModal('${e.id}')" title="Chỉnh sửa đề xuất">
                                <span class="material-icons-outlined">edit</span>
                            </button>


                            <button class="action-btn-v2 delete" onclick="window.erpApp.deleteExpense('${e.id}')" title="Xóa chi phí">
                                <span class="material-icons-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // Tab: Norms
    // ==========================================
    function renderNorms() {
        return `
            <div class="expense-norms grid-layout animated slideUp">
                <div class="norms-grid-v2">
                    ${expenseNorms.map(n => {
            const cat = EXPENSE_CATEGORIES[n.category] || EXPENSE_CATEGORIES['KHAC'];
            const pct = Math.min(100, (n.used / n.limit) * 100);
            const isOver = n.used > n.limit;
            return `
                            <div class="glass-card norm-card-v2 ${isOver ? 'over-limit' : ''}">
                                <div class="nc-header-v2">
                                    <div class="nc-left">
                                        <div class="nc-icon-v2" style="background:${cat.color}15; color:${cat.color}">
                                            <span class="material-icons-outlined">${cat.icon}</span>
                                        </div>
                                        <span class="nc-name-v2">${cat.label}</span>
                                    </div>
                                    <div class="nc-right">
                                        <span class="nc-tk-v2">TK: ${cat.tk || '642'}</span>
                                    </div>
                                </div>
                                <div class="nc-body-v2">
                                    <div class="nc-current-v2">${window.erpApp.formatValue(n.used)}</div>
                                    <div class="nc-progress-container-v2">
                                        <div class="nc-progress-v2">
                                            <div class="fill" style="width:${pct}%; background:${isOver ? '#EF4444' : cat.color}"></div>
                                        </div>
                                        <div class="nc-limit-text-v2">Hạn mức: ${window.erpApp.formatValue(n.limit)}</div>
                                    </div>
                                    <div class="nc-footer-v2">
                                        <div class="nc-pct-v2 ${isOver ? 'text-danger' : ''}">${pct.toFixed(1)}% đã sử dụng</div>
                                        <button class="nc-edit-btn-v2" onclick="window.erpApp.editNorm('${n.category}')">Chỉnh sửa</button>
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // ==========================================
    // Modals & Forms
    // ==========================================
    window.erpApp.openNewExpenseModal = function () {
        tempExpenseFiles = [];
        const modalHtml = `
            <div class="modal-overlay-pro animated fadeIn" id="expenseModal">
                <div class="modal-content-pro glass-morphism animated zoomIn" style="width: 100%; max-width: 650px;">
                    <div class="modal-header">
                        <div class="header-title">
                            <span class="material-icons-outlined">receipt_long</span>
                            <h2>Đề xuất chi phí mới</h2>
                        </div>
                        <button class="close-btn" onclick="window.erpApp.closeExpenseModal()"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="newExpenseForm" onsubmit="window.erpApp.submitNewExpense(event)">
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 24px;">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>Nội dung đề xuất <span class="required">*</span></label>
                                    <input type="text" name="desc" required placeholder="Ví dụ: Thanh toán tiền điện tháng 04/2026">
                                </div>
                                <div class="form-group">
                                    <label>Hạng mục <span class="required">*</span></label>
                                    <select name="category" required>
                                        <option value="">-- Chọn hạng mục --</option>
                                        ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}">${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Số tiền đề xuất <span class="required">*</span></label>
                                    <input type="text" name="amount" required placeholder="0" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>
                                <div class="form-group">
                                    <label>Tạm ứng</label>
                                    <input type="text" name="advance" placeholder="0" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>

                                <div class="form-group">
                                    <label>Ngày chi dự kiến</label>
                                    <input type="text" class="erp-datepicker" name="date" value="${window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY">
                                </div>
                                <div class="form-group full-width">
                                    <label>Số Hóa đơn / Số chứng từ (nếu có)</label>
                                    <input type="text" name="invoiceNo" placeholder="VD: HD00123...">
                                </div>

                                <!-- Chứng từ tài liệu đính kèm (Google Drive UI - N-level folder chain) -->
                                <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 10px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                        <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ chứng từ đính kèm
                                    </label>
                                    
                                    <!-- Google Drive folder chain selectors -->
                                    <div style="margin-bottom:16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                        <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                        <select id="expenseDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadExpenseDriveFolderChain(null, 0)">
                                            <option value="">⏳ Đang tải danh sách thư mục...</option>
                                        </select>
                                        <div id="expenseDriveFolderChain" style="display:flex; flex-wrap:wrap; gap:10px; flex:2;">
                                            <!-- Các subfolder sẽ load động vào đây -->
                                        </div>
                                        <button type="button" onclick="window.erpApp.loadExpenseDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                            <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                        </button>
                                        <button type="button" onclick="window.erpApp.createExpenseDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                            <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                        </button>
                                        <input type="hidden" id="expenseDriveFolderIdInput" name="driveFolderId" value="">
                                        <input type="hidden" id="expenseDriveFolderPathInput" name="driveFolderPath" value="">
                                    </div>

                                    <!-- Upload Area -->
                                    <div style="border: 2px dashed #3b82f644; background: #eff6ff44; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s;" 
                                         onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff77';" 
                                         onmouseout="this.style.borderColor='#3b82f644'; this.style.background='#eff6ff44';"
                                         onclick="document.getElementById('expenseFileInput').click()">
                                        <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6; margin-bottom:8px; display:block;">cloud_upload</span>
                                        <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                        <span style="font-size:11px; color:#64748b; font-weight:500; display:block; margin-top:4px;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                        <input type="file" id="expenseFileInput" multiple onchange="window.erpApp.handleExpenseFileUpload(event)" style="display:none">
                                    </div>

                                    <!-- Link area -->
                                    <div style="margin-top:20px; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
                                        <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                            <span class="material-icons-outlined" style="font-size:14px; color:#6366f1;">link</span> Thêm chứng từ bằng đường link
                                        </label>
                                        <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                            <div style="flex:1; min-width:140px;">
                                                <input type="text" id="expenseLinkName" placeholder="VD: Hóa đơn..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                            </div>
                                            <div style="flex:2; min-width:200px;">
                                                <input type="url" id="expenseLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                            </div>
                                            <button type="button" onclick="window.erpApp.addExpenseFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                                <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                            </button>
                                        </div>
                                    </div>

                                    <!-- File list container -->
                                    <div id="expenseFileList" style="margin-top:16px;">
                                        ${window.erpApp.renderExpenseFileList ? window.erpApp.renderExpenseFileList(tempExpenseFiles, true) : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary-pro" onclick="window.erpApp.closeExpenseModal()">Hủy bỏ</button>
                            <button type="submit" class="btn-primary-pro">Gửi đề xuất</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Initialize dynamic Google Drive folders
        window.erpApp.loadExpenseDriveRootFolders();
    };

    window.erpApp.closeExpenseModal = function () {
        const modal = document.getElementById('expenseModal');
        if (modal) { modal.remove(); }
    };

    window.erpApp.formatExpenseAmountInput = function (input) {
        let value = input.value.replace(/\D/g, '');
        if (value !== '') {
            input.value = window.erpApp.formatValue(value);
        }
    };

    window.erpApp.submitNewExpense = async function (event) {
        event.preventDefault();
        try {
            const form = event.target;
            const formData = new FormData(form);
            const user = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : null;
            const rawAmount = formData.get('amount');
            const amount = window.erpApp.parseVND ? window.erpApp.parseVND(rawAmount) : parseFloat(rawAmount.replace(/\./g, ''));
            const rawAdvance = formData.get('advance') || '0';
            const advance = window.erpApp.parseVND ? window.erpApp.parseVND(rawAdvance) : (parseFloat(rawAdvance.replace(/\./g, '')) || 0);

            if (!amount || amount <= 0) {
                window.erpApp.showToast('Vui lòng nhập số tiền hợp lệ', 'error');
                return;
            }

            const newExpense = {
                id: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                requester: user ? (user.fullName || user.name || user.username) : 'Người dùng',
                date: window.erpApp.parseInputDate ? window.erpApp.parseInputDate(formData.get('date')) : formData.get('date'),
                category: formData.get('category'),
                amount: amount,
                advance: advance,
                desc: formData.get('desc'),
                priority: formData.get('priority') || 'medium',
                invoiceNo: formData.get('invoiceNo'),
                evidenceUrl: tempExpenseFiles.length > 0 ? (tempExpenseFiles[0].url || tempExpenseFiles[0].dataUrl || '') : '',
                files: [...tempExpenseFiles],
                paymentStatus: 'unpaid',
                createdAt: new Date().toISOString()
            };

            officeExpenses.unshift(newExpense);
            window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);

            if (window.CrudSync) {
                await window.CrudSync.saveItem(COLLECTION_EXPENSES, newExpense, 'id');
            }

            window.erpApp.closeExpenseModal();
            if (window.notifyCRUD) {
                window.notifyCRUD('Chi phí văn phòng', 'add', { name: newExpense.desc, page: 'hanh-chinh' });
            }
            window.erpApp.showToast('Đã gửi đề xuất chi phí!', 'success');
            window.erpApp.renderOfficeExpense();
        } catch (error) {
            console.error('❌ [OfficeExpense] Lỗi:', error);
            window.erpApp.showToast('Có lỗi xảy ra.', 'error');
        }
    };

    window.erpApp.openEditExpenseModal = function (id) {
        try {
            const expense = officeExpenses.find(e => e.id == id);
            if (!expense) { 
                alert('Không tìm thấy chi phí với ID: ' + id); 
                return; 
            }

            tempExpenseFiles = Array.isArray(expense.files) ? expense.files : (expense.evidenceUrl ? [{ name: expense.invoiceNo || 'Chứng từ đính kèm', url: expense.evidenceUrl, type: 'pdf', size: '' }] : []);

            const modalHtml = `
                <div class="modal-overlay-pro animated fadeIn" id="editExpenseModal">
                    <div class="modal-content-pro glass-morphism animated zoomIn" style="width: 100%; max-width: 650px;">
                        <div class="modal-header">
                            <div class="header-title">
                                <span class="material-icons-outlined">edit_note</span>
                                <h2>Chỉnh sửa đề xuất</h2>
                            </div>
                            <button class="close-btn" onclick="window.erpApp.closeEditExpenseModal()"><span class="material-icons-outlined">close</span></button>
                        </div>
                        <form id="editExpenseForm" onsubmit="window.erpApp.submitExpenseEdit(event, '${id}')">
                            <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 24px;">
                                <div class="form-grid">
                                    <div class="form-group full-width">
                                        <label>Nội dung đề xuất <span class="required">*</span></label>
                                        <input type="text" name="desc" value="${expense.desc}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Hạng mục <span class="required">*</span></label>
                                        <select name="category" required>
                                            ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}" ${expense.category === k ? 'selected' : ''}>${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Số tiền đề xuất <span class="required">*</span></label>
                                        <input type="text" name="amount" value="${window.erpApp.formatValue(expense.amount)}" required oninput="window.erpApp.formatExpenseAmountInput(this)">
                                    </div>
                                    <div class="form-group">
                                        <label>Tạm ứng</label>
                                        <input type="text" name="advance" value="${window.erpApp.formatValue(expense.advance || 0)}" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                    </div>

                                    <div class="form-group">
                                        <label>Ngày chi dự kiến</label>
                                        <input type="text" class="erp-datepicker" name="date" value="${window.erpApp.formatDate(expense.date)}" placeholder="DD/MM/YYYY">
                                    </div>
                                    <div class="form-group full-width">
                                        <label>Số Hóa đơn / Số chứng từ (nếu có)</label>
                                        <input type="text" name="invoiceNo" value="${expense.invoiceNo || ''}" placeholder="VD: HD00123...">
                                    </div>

                                    <!-- Chứng từ tài liệu đính kèm (Google Drive UI) -->
                                    <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 10px;">
                                        <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                            <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ chứng từ đính kèm
                                        </label>
                                        
                                        <!-- Google Drive folder chain selectors -->
                                        <div style="margin-bottom:16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                            <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                            <select id="expenseDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadExpenseDriveFolderChain(null, 0)">
                                                <option value="">⏳ Đang tải danh sách thư mục...</option>
                                            </select>
                                            <div id="expenseDriveFolderChain" style="display:flex; flex-wrap:wrap; gap:10px; flex:2;">
                                                <!-- Các subfolder sẽ load động vào đây -->
                                            </div>
                                            <button type="button" onclick="window.erpApp.loadExpenseDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                                <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                            </button>
                                            <button type="button" onclick="window.erpApp.createExpenseDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                                <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                            </button>
                                            <input type="hidden" id="expenseDriveFolderIdInput" name="driveFolderId" value="${expense.driveFolderId || ''}">
                                            <input type="hidden" id="expenseDriveFolderPathInput" name="driveFolderPath" value="${expense.driveFolderPath || ''}">
                                        </div>

                                        <!-- Upload Area -->
                                        <div style="border: 2px dashed #3b82f644; background: #eff6ff44; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s;" 
                                             onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff77';" 
                                             onmouseout="this.style.borderColor='#3b82f644'; this.style.background='#eff6ff44';"
                                             onclick="document.getElementById('expenseFileInput').click()">
                                            <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6; margin-bottom:8px; display:block;">cloud_upload</span>
                                            <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                            <span style="font-size:11px; color:#64748b; font-weight:500; display:block; margin-top:4px;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                            <input type="file" id="expenseFileInput" multiple onchange="window.erpApp.handleExpenseFileUpload(event)" style="display:none">
                                        </div>

                                        <!-- Link area -->
                                        <div style="margin-top:20px; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
                                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                                <span class="material-icons-outlined" style="font-size:14px; color:#6366f1;">link</span> Thêm chứng từ bằng đường link
                                            </label>
                                            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                                <div style="flex:1; min-width:140px;">
                                                    <input type="text" id="expenseLinkName" placeholder="VD: Hóa đơn..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                                </div>
                                                <div style="flex:2; min-width:200px;">
                                                    <input type="url" id="expenseLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                                </div>
                                                <button type="button" onclick="window.erpApp.addExpenseFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                                    <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                                </button>
                                            </div>
                                        </div>

                                        <!-- File list container -->
                                        <div id="expenseFileList" style="margin-top:16px;">
                                            ${window.erpApp.renderExpenseFileList ? window.erpApp.renderExpenseFileList(tempExpenseFiles, true) : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary-pro" onclick="window.erpApp.closeEditExpenseModal()">Hủy</button>
                                <button type="submit" class="btn-primary-pro">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            if (window.erpApp.initDatePickers) {
                window.erpApp.initDatePickers(document.getElementById('editExpenseModal'));
            }

            // Initialize dynamic Google Drive folders
            if (window.erpApp.loadExpenseDriveRootFolders) {
                window.erpApp.loadExpenseDriveRootFolders(expense.driveFolderId || null);
            }
        } catch (err) {
            alert('Lỗi hệ thống khi mở form sửa: ' + err.message);
            console.error(err);
        }
    };

    window.erpApp.closeEditExpenseModal = function () {
        const modal = document.getElementById('editExpenseModal');
        if (modal) { modal.remove(); }
    };

    window.erpApp.submitExpenseEdit = async function (event, id) {
        event.preventDefault();
        const index = officeExpenses.findIndex(e => e.id == id);
        if (index === -1) { return; }

        try {
            const form = event.target;
            const formData = new FormData(form);
            const rawAmount = formData.get('amount');
            const amount = window.erpApp.parseVND ? window.erpApp.parseVND(rawAmount) : parseFloat(rawAmount.replace(/\./g, ''));
            const rawAdvance = formData.get('advance') || '0';
            const advance = window.erpApp.parseVND ? window.erpApp.parseVND(rawAdvance) : (parseFloat(rawAdvance.replace(/\./g, '')) || 0);

            const updatedExpense = {
                ...officeExpenses[index],
                desc: formData.get('desc'),
                category: formData.get('category'),
                amount: amount,
                advance: advance,
                priority: formData.get('priority') || officeExpenses[index].priority || 'medium',
                date: window.erpApp.parseInputDate ? window.erpApp.parseInputDate(formData.get('date')) : formData.get('date'),
                invoiceNo: formData.get('invoiceNo'),
                evidenceUrl: tempExpenseFiles.length > 0 ? (tempExpenseFiles[0].url || tempExpenseFiles[0].dataUrl || '') : '',
                files: [...tempExpenseFiles],
                updatedAt: new Date().toISOString()
            };

            officeExpenses[index] = updatedExpense;
            window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);

            if (window.CrudSync) {
                await window.CrudSync.saveItem(COLLECTION_EXPENSES, updatedExpense, 'id');
            }

            window.erpApp.closeEditExpenseModal();
            if (window.notifyCRUD) {
                window.notifyCRUD('Chi phí văn phòng', 'update', { name: updatedExpense.desc, page: 'hanh-chinh' });
            }
            window.erpApp.showToast('Đã cập nhật đề xuất!', 'success');
            window.erpApp.renderOfficeExpense();
        } catch (error) {
            console.error('❌ [OfficeExpense] Lỗi:', error);
        }
    };

    window.erpApp.editNorm = function (category) {
        const norm = expenseNorms.find(n => n.category === category);
        if (!norm) { return; }
        const cat = EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES['KHAC'];

        const modalHtml = `
            <div id="normEditModal" class="modal-overlay-pro animated fadeIn">
                <div class="modal-content-pro animated zoomIn" style="max-width: 450px;">
                    <div class="modal-header">
                        <div class="header-title">
                            <span class="material-icons-outlined">tune</span>
                            <h2>Chỉnh sửa định mức</h2>
                        </div>
                        <button class="close-btn" onclick="window.erpApp.closeNormModal()">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <form onsubmit="window.erpApp.submitNormEdit(event, '${category}')">
                            <div class="form-group">
                                <label>Hạn mức tháng mới (VNĐ)</label>
                                <input type="text" name="limit" value="${window.erpApp.formatValue(norm.limit)}" 
                                    onkeyup="window.erpApp.formatExpenseAmountInput(this)" required autofocus>
                            </div>
                            <div class="modal-footer" style="margin-top:24px; padding:0; border:none; display:flex; gap:12px;">
                                <button type="button" class="btn-secondary-pro" style="flex:1;" onclick="window.erpApp.closeNormModal()">Hủy bỏ</button>
                                <button type="submit" class="btn-primary-pro" style="flex:1; justify-content:center;">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.closeNormModal = function () {
        const modal = document.getElementById('normEditModal');
        if (modal) { modal.remove(); }
    };

    window.erpApp.submitNormEdit = async function (event, category) {
        event.preventDefault();
        const norm = expenseNorms.find(n => n.category === category);
        if (!norm) { return; }

        const formData = new FormData(event.target);
        const rawLimit = formData.get('limit');
        const newLimit = parseInt(rawLimit.replace(/\D/g, ''));

        if (isNaN(newLimit) || newLimit <= 0) {
            window.erpApp.showToast('Vui lòng nhập số tiền hợp lệ!', 'error');
            return;
        }

        norm.limit = newLimit;
        window.erpApp._setData(COLLECTION_NORMS, expenseNorms);

        if (window.CrudSync) {
            await window.CrudSync.saveItem(COLLECTION_NORMS, norm, 'category');
        }

        window.erpApp.closeNormModal();
        window.erpApp.showToast('Đã cập nhật định mức!', 'success');
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.viewExpenseDetail = function (id) {
        try {
            const expense = officeExpenses.find(e => e.id == id);
            if (!expense) { 
                alert('Không tìm thấy chi phí với ID: ' + id); 
                return; 
            }
            const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES['KHAC'];

            const modalHtml = `
                <div class="modal-overlay-pro animated fadeIn" id="expenseDetailModal">
                    <div class="modal-content-pro glass-morphism animated zoomIn" style="width: 500px;">
                        <div class="modal-header">
                            <div class="header-title">
                                <span class="material-icons-outlined">visibility</span>
                                <h2>Chi tiết đề xuất</h2>
                            </div>
                            <button class="close-btn" onclick="document.getElementById('expenseDetailModal').remove()"><span class="material-icons-outlined">close</span></button>
                        </div>
                        <div class="modal-body">
                            <div class="detail-grid">
                                <div class="detail-item"><label>Mã số</label><div class="val font-bold">${expense.id}</div></div>
                                <div class="detail-item full-width"><label>Nội dung</label><div class="val">${expense.desc}</div></div>
                                <div class="detail-item"><label>Hạng mục</label><div class="val">${cat.label}</div></div>
                                <div class="detail-item"><label>Số tiền đề xuất</label><div class="val font-bold text-primary">${window.erpApp.formatValue(expense.amount)} VNĐ</div></div>
                                <div class="detail-item"><label>Đã tạm ứng</label><div class="val font-bold" style="color: #e11d48;">- ${window.erpApp.formatValue(expense.advance || 0)} VNĐ</div></div>
                                <div class="detail-item full-width" style="background: #f0fdf4; padding: 12px 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin-top: 8px;">
                                    <label style="color: #166534; font-weight:800; font-size:12px;">CÒN LẠI CẦN THANH TOÁN</label>
                                    <div class="val font-bold" style="color: #15803d; font-size:20px; margin-top: 4px;">${window.erpApp.formatValue(expense.amount - (expense.advance || 0))} VNĐ</div>
                                </div>
                                <div class="detail-item"><label>Người đề xuất</label><div class="val">${expense.requester}</div></div>
                                <div class="detail-item"><label>Ngày đề xuất</label><div class="val">${window.erpApp.formatDate ? window.erpApp.formatDate(expense.date) : expense.date}</div></div>

                                <div class="detail-item full-width" style="border-top:1px dashed #cbd5e1; padding-top: 16px; margin-top: 8px;">
                                    <label style="font-weight: 800; color: #475569;">Hồ sơ chứng từ đính kèm</label>
                                    <div style="margin-top: 8px;">
                                        ${Array.isArray(expense.files) && expense.files.length > 0 ?
                    expense.files.map((file, idx) => `
                                                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;">
                                                    <div style="display:flex; align-items:center; gap:8px;">
                                                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">description</span>
                                                        <span style="font-weight:700; color:#1e293b; font-size:13px; word-break:break-all;">${file.name}</span>
                                                    </div>
                                                    <a href="${file.url || file.dataUrl}" target="_blank" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap;">Xem tệp</a>
                                                </div>
                                            `).join('')
                    : (expense.evidenceUrl ? `
                                                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                                                    <div style="display:flex; align-items:center; gap:8px;">
                                                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">description</span>
                                                        <span style="font-weight:700; color:#1e293b; font-size:13px;">Chứng từ (Link)</span>
                                                    </div>
                                                    <a href="${expense.evidenceUrl}" target="_blank" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap;">Xem tệp</a>
                                                </div>
                                            ` : '<span style="color:#94a3b8; font-style:italic; font-size:12px;">Không có chứng từ đính kèm</span>')
                }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-primary-pro" onclick="document.getElementById('expenseDetailModal').remove()">Đóng</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (err) {
            alert('Lỗi hệ thống khi mở Xem chi tiết: ' + err.message);
            console.error(err);
        }
    };

    window.erpApp.deleteExpense = function (id) {
        const expense = officeExpenses.find(e => e.id == id);
        if (!expense) return;

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa đề xuất chi phí <strong>${expense.desc}</strong>? Thao tác này không thể hoàn tác.`,
            function () {
                const index = officeExpenses.findIndex(e => e.id == id);
                if (index === -1) return;

                officeExpenses.splice(index, 1);
                window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);

                if (window.CrudSync) {
                    window.CrudSync.deleteItem(COLLECTION_EXPENSES, id);
                }

                window.erpApp.showToast('Đã xóa đề xuất chi phí thành công!', 'success');

                // Audit Log
                if (window.erpApp.notifyCRUD) {
                    window.erpApp.notifyCRUD('Chi phí văn phòng', 'delete', {
                        name: expense.desc,
                        page: 'hanh-chinh',
                        module: 'Chi phí văn phòng'
                    });
                }

                window.erpApp.renderOfficeExpense();
            }
        );
    };

    window.erpApp.togglePaymentStatus = async function (id, value) {
        const expense = officeExpenses.find(e => e.id == id);
        if (!expense) return;
        expense.paymentStatus = value;
        window.erpApp._setData(COLLECTION_EXPENSES, officeExpenses);
        if (window.CrudSync) {
            await window.CrudSync.saveItem(COLLECTION_EXPENSES, expense, 'id');
        }
        window.erpApp.renderOfficeExpense();
    };

    function renderPrintTab() {
        const selCount = selectedForPrint.size;
        const selTotal = officeExpenses.filter(e => selectedForPrint.has(e.id)).reduce((sum, e) => sum + e.amount, 0);

        return `
            <div class="print-tab-container animated fadeInUp">
                <div class="glass-card info-banner" style="margin-bottom: 24px; background: #eff6ff; border-color: #bfdbfe; padding: 16px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:32px;">info</span>
                        <div>
                            <h4 style="margin:0; color:#1e3a8a;">Hướng dẫn in phiếu</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#1e40af;">Tích chọn các đề xuất cần in, sau đó bấm "In tất cả đã chọn".</p>
                        </div>
                    </div>
                </div>

                <div class="glass-card batch-print-toolbar" style="margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-radius: 20px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-weight:700; color:#1e3a8a; font-size:14px;">
                            ${selCount > 0 ? `Đã chọn <strong>${selCount}</strong> phiếu • Tổng: <strong>${window.erpApp.formatValue(selTotal)} VNĐ</strong>` : 'Chưa chọn phiếu nào'}
                        </span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-primary-pro" style="padding: 10px 20px; font-size: 13px;" onclick="window.erpApp.printMultipleExpenses()">
                            <span class="material-icons-outlined">print</span>
                            In tất cả đã chọn (${selCount})
                        </button>
                    </div>
                </div>

                <div class="glass-card table-container-pro">
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">
                                        <input type="checkbox" onchange="window.erpApp.toggleAllPrintSelection(this.checked)">
                                    </th>
                                    <th>Mã số</th>
                                    <th>Ngày</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung</th>
                                    <th class="text-right">Số tiền</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${officeExpenses.map(e => {
            const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            const isSelected = selectedForPrint.has(e.id);
            return `
                                        <tr style="${isSelected ? 'background:#eff6ff;' : ''}">
                                            <td style="text-align:center;" data-label="Chọn">
                                                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.erpApp.togglePrintSelection('${e.id}', this.checked)">
                                            </td>
                                            <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                                            <td data-label="Ngày">${formatDate(e.date)}</td>
                                            <td data-label="Hạng mục">${cat.label}</td>
                                            <td data-label="Nội dung">${e.desc}</td>
                                            <td data-label="Số tiền" class="text-right font-bold">${window.erpApp.formatValue(e.amount)}</td>
                                            <td data-label="Thao tác" class="text-center">
                                                <button class="action-btn-v2" onclick="window.erpApp.printExpense('${e.id}')">
                                                    <span class="material-icons-outlined">print</span>
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
    }


    // ==========================================
    // Print Logic
    // ==========================================
    window.erpApp.togglePrintSelection = function (id, checked) {
        if (checked) selectedForPrint.add(id);
        else selectedForPrint.delete(id);
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.toggleAllPrintSelection = function (checked) {
        if (checked) officeExpenses.forEach(e => selectedForPrint.add(e.id));
        else selectedForPrint.clear();
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.clearPrintSelection = function () {
        selectedForPrint.clear();
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.printExpense = function (id) {
        const expense = officeExpenses.find(e => e.id == id);
        if (!expense) return;

        const prevSelection = new Set(selectedForPrint);
        selectedForPrint.clear();
        selectedForPrint.add(id);
        window.erpApp.printMultipleExpenses();
        selectedForPrint = prevSelection;
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.printMultipleExpenses = function () {
        const selected = officeExpenses.filter(e => selectedForPrint.has(e.id));
        if (selected.length === 0) {
            window.erpApp.showToast('Vui lòng chọn ít nhất 1 phiếu để in!', 'error');
            return;
        }

        let currentUserName = 'Người dùng hệ thống';
        try {
            const localUser = JSON.parse(sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user') || '{}');
            if (localUser && localUser.fullName) {
                currentUserName = localUser.fullName;
            } else if (window.erpApp && window.erpApp.currentUser && window.erpApp.currentUser.fullName) {
                currentUserName = window.erpApp.currentUser.fullName;
            } else if (selected[0] && selected[0].requester) {
                currentUserName = selected[0].requester;
            }
        } catch (e) { }

        const enterprise = window.enterpriseInfo || {};
        const companyFullName = enterprise.fullName || 'CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH';

        let displayCompanyName = companyFullName;
        if (companyFullName.includes('CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH')) {
            displayCompanyName = 'CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ<br>VÀ XÂY DỰNG VIỆT BÁCH';
        }

        const companyTaxId = enterprise.taxId || '0303204517';
        const companyAddress = enterprise.address || '643/22B Xô Viết Nghệ Tĩnh, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh';

        const categories = [...new Set(selected.map(e => e.category))];
        const categoryText = categories.length === 1 ? `(${EXPENSE_CATEGORIES[categories[0]].label})` : '(Chi phí văn phòng)';

        const totalAmount = selected.reduce((s, e) => s + e.amount, 0);
        const totalAdvance = selected.reduce((s, e) => s + (e.advance || 0), 0);
        const netRemaining = totalAmount - totalAdvance;
        const roundedTotal = Math.floor(netRemaining / 1000) * 1000;
        const totalInWords = window.erpApp.docTienBangChu ? window.erpApp.docTienBangChu(roundedTotal) : amountToWords(roundedTotal);

        const printWindow = window.open('', '_blank');

        let html = `
            <html>
            <head>
                <title>In phiếu đề nghị thanh toán</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { padding: 15mm 20mm; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        .page-break { page-break-before: always; }
                    }
                    body { font-family: 'Inter', 'Times New Roman', serif; padding: 30px; color: #1e293b; line-height: 1.5; margin: 0; }
                    .expense-page { padding: 10px 0; }
                    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
                    .header-left { flex: 1.5; text-align: left; }
                    .company-name { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 1.3; display: inline-block; text-align: center; }
                    .company-tax { font-size: 11px; color: #475569; margin-top: 3px; font-weight: 600; }
                    .company-address { font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500; }
                    .header-right { text-align: right; flex: 1; }
                    .form-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 1.2; }
                    .form-subtitle { font-size: 15px; font-weight: 700; color: #334155; margin-top: 5px; }
                    .header-divider { height: 2px; background: #0f172a; margin: 10px 0 20px 0; border: none; }
                    .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .summary-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #1e293b; border: 1.5px solid #000; text-transform: uppercase; }
                    .summary-table td { padding: 10px 12px; font-size: 13px; border: 1.5px solid #000; color: #000; line-height: 1.4; }
                    .signature-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 50px; }
                    .sig-item { text-align: center; }
                    .sig-label { font-size: 12px; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 80px; display: block; }
                    .sig-name { font-size: 13px; font-weight: 700; color: #000; }
                    .print-btn-container { position: fixed; bottom: 30px; right: 30px; }
                    .print-btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="expense-page">
                    <div class="header-container">
                        <div class="header-left">
                            <h1 class="company-name">${displayCompanyName}</h1>
                            <p class="company-tax">MST: ${companyTaxId}</p>
                            <p class="company-address">${companyAddress}</p>
                        </div>
                        <div class="header-right">
                            <h2 class="form-title">GIẤY ĐỀ NGHỊ THANH TOÁN</h2>
                            <div class="form-subtitle">${categoryText}</div>
                        </div>
                    </div>
                    <hr class="header-divider">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th style="width:35px; text-align:center;">STT</th>
                                <th style="width:85px;">Ngày</th>
                                <th style="width:130px;">Hạng mục</th>
                                <th>Nội dung thanh toán</th>
                                <th style="width:100px; text-align:center;">Số Hóa đơn</th>
                                <th style="text-align:right; width:130px;">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selected.map((e, i) => {
            const c = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            return `<tr>
                                    <td style="text-align:center;">${i + 1}</td>
                                    <td>${formatDate(e.date)}</td>
                                    <td>${c.label}</td>
                                    <td>${e.desc}</td>
                                    <td style="text-align:center;">${e.invoiceNo || '---'}</td>
                                    <td style="text-align:right; font-weight:700;">${window.erpApp.formatValue(e.amount)}</td>
                                </tr>`;
        }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:700; padding:8px 20px; font-size:13px; color:#475569; border-bottom:none;">Tổng tiền đề xuất:</td>
                                <td style="text-align:right; font-weight:700; color:#475569; font-size:14px; padding:8px 15px; white-space:nowrap; border-bottom:none;">
                                    ${window.erpApp.formatValue(totalAmount)} VNĐ
                                </td>
                            </tr>
                            ${totalAdvance > 0 ? `
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:700; padding:8px 20px; font-size:13px; color:#ef4444; border-top:none; border-bottom:none;">Đã tạm ứng:</td>
                                <td style="text-align:right; font-weight:700; color:#ef4444; font-size:14px; padding:8px 15px; white-space:nowrap; border-top:none; border-bottom:none;">
                                    - ${window.erpApp.formatValue(totalAdvance)} VNĐ
                                </td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:800; padding:12px 20px; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">CÒN LẠI CẦN THANH TOÁN (làm tròn):</td>
                                <td style="text-align:right; font-weight:800; color:#000; font-size:16px; padding:12px 15px; background:#f8fafc; white-space:nowrap;">
                                    ${window.erpApp.formatValue(roundedTotal)} <span style="font-size:14px; margin-left:4px;">VNĐ</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align:right; font-style:italic; padding:10px 20px; font-size:13px; border-top:none;">
                                    Số tiền bằng chữ: <strong style="text-transform:capitalize;">${totalInWords}</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="signature-container">
                        <div class="sig-item">
                            <span class="sig-label">Người đề nghị</span>
                            <div class="sig-name">${currentUserName}</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Kế toán</span>
                            <div class="sig-name">..........................</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Thủ quỹ</span>
                            <div class="sig-name">..........................</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Giám đốc</span>
                            <div class="sig-name">..........................</div>
                        </div>
                    </div>
                </div>

                <div class="print-btn-container no-print">
                    <button class="print-btn" onclick="window.print()">BẮT ĐẦU IN PHIẾU</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    function amountToWords(n) {
        if (n === 0) return 'Không đồng';
        const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const Tien = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

        function docBlock(so, isFirstBlock) {
            let tram = Math.floor(so / 100);
            let chuc = Math.floor((so % 100) / 10);
            let donvi = so % 10;
            let ketqua = "";
            if (tram > 0 || !isFirstBlock) {
                ketqua += ChuSo[tram] + " trăm ";
            }
            if (chuc > 1) {
                ketqua += ChuSo[chuc] + " mươi ";
                if (donvi === 1) ketqua += "mốt";
                else if (donvi === 5) ketqua += "lăm";
                else if (donvi > 0) ketqua += ChuSo[donvi];
            } else if (chuc === 1) {
                ketqua += "mười ";
                if (donvi === 1) ketqua += "một";
                else if (donvi === 5) ketqua += "lăm";
                else if (donvi > 0) ketqua += ChuSo[donvi];
            } else if (chuc === 0 && donvi > 0) {
                if (tram > 0 || !isFirstBlock) ketqua += "lẻ ";
                ketqua += ChuSo[donvi];
            }
            return ketqua;
        }

        let result = "";
        let blocks = [];
        let temp = n;
        while (temp > 0) {
            blocks.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }

        for (let i = blocks.length - 1; i >= 0; i--) {
            let blockText = docBlock(blocks[i], i === blocks.length - 1);
            if (blockText !== "") {
                result += blockText + " " + Tien[i] + " ";
            }
        }

        result = result.trim();
        if (result === "") return "Không đồng";
        result = result.charAt(0).toUpperCase() + result.slice(1);
        return result + " đồng chẵn./.";
    }

    // ==========================================
    // Category Management
    // ==========================================
    function renderCategories() {
        return `
            <div class="glass-card animated fadeInUp" style="padding: 24px; border-radius: 24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                    <h2 style="margin:0; font-size: 18px; color:#1e293b;">Danh mục hạng mục chi phí</h2>
                    <button class="btn-primary-pro" style="padding: 10px 20px; font-size: 13px;" onclick="window.erpApp.openCategoryModal()">
                        <span class="material-icons-outlined">add</span> Thêm danh mục
                    </button>
                </div>
                <div class="table-responsive-pro">
                    <table class="pro-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Tên hạng mục</th>
                                <th>Tài khoản kế toán</th>
                                <th>Màu sắc</th>
                                <th class="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(EXPENSE_CATEGORIES).map(k => {
                                const c = EXPENSE_CATEGORIES[k];
                                return `
                                <tr>
                                    <td><strong>${k}</strong></td>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span class="material-icons-outlined" style="color:${c.color}">${c.icon || 'folder'}</span>
                                            ${c.label}
                                        </div>
                                    </td>
                                    <td><span class="code-badge">${c.tk || 'N/A'}</span></td>
                                    <td>
                                        <div style="width:20px; height:20px; border-radius:4px; background:${c.color}"></div>
                                    </td>
                                    <td class="text-center">
                                        <div class="row-actions">
                                            <button class="action-btn-v2" onclick="window.erpApp.openCategoryModal('${k}')">
                                                <span class="material-icons-outlined">edit</span>
                                            </button>
                                            <button class="action-btn-v2" style="color:#ef4444;" onclick="window.erpApp.deleteCategory('${k}')">
                                                <span class="material-icons-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                `
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    window.erpApp.openCategoryModal = function (catId = null) {
        let cat = catId ? EXPENSE_CATEGORIES[catId] : { label: '', icon: 'pending_actions', color: '#3b82f6', tk: '' };
        
        const modalHtml = `
            <div class="modal-overlay-pro animated fadeIn" id="categoryModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div class="modal-content-pro glass-card animated zoomIn" style="width: 480px; padding: 24px; border-radius: 24px; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(15,23,42,0.25);">
                    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
                        <div class="header-title" style="display:flex; align-items:center; gap: 12px;">
                            <div style="width:40px; height:40px; border-radius:12px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined" style="font-size:24px;">category</span>
                            </div>
                            <h2 style="margin:0; font-size:18px; font-weight:800; color:#1e293b;">${catId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                        </div>
                        <button class="close-btn" onclick="document.getElementById('categoryModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8; transition:color 0.2s; padding:4px;">
                            <span class="material-icons-outlined" style="font-size:24px;">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm" onsubmit="window.erpApp.saveCategory(event, '${catId || ''}')" style="display:flex; flex-direction:column; gap: 16px;">
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <label style="font-size:13px; font-weight:700; color:#475569;">Mã danh mục (Viết liền không dấu) <span style="color:#ef4444">*</span></label>
                                <input type="text" id="catCode" value="${catId || ''}" required ${catId ? 'readonly style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:12px 16px; font-size:14px; font-weight:600; color:#94a3b8; outline:none;"' : 'style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px 16px; font-size:14px; font-weight:600; color:#1e293b; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\'; this.style.boxShadow=\'0 0 0 3px rgba(59,130,246,0.1)\'" onblur="this.style.borderColor=\'#cbd5e1\'; this.style.boxShadow=\'none\'"'} placeholder="VD: VPP">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <label style="font-size:13px; font-weight:700; color:#475569;">Tên danh mục <span style="color:#ef4444">*</span></label>
                                <input type="text" id="catLabel" value="${cat.label}" required placeholder="VD: Văn phòng phẩm" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px 16px; font-size:14px; font-weight:600; color:#1e293b; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\'; this.style.boxShadow=\'0 0 0 3px rgba(59,130,246,0.1)\'" onblur="this.style.borderColor=\'#cbd5e1\'; this.style.boxShadow=\'none\'">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <label style="font-size:13px; font-weight:700; color:#475569;">Tài khoản kế toán</label>
                                    <input type="text" id="catTk" value="${cat.tk || ''}" placeholder="VD: 6422" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px 16px; font-size:14px; font-weight:600; color:#1e293b; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\'; this.style.boxShadow=\'0 0 0 3px rgba(59,130,246,0.1)\'" onblur="this.style.borderColor=\'#cbd5e1\'; this.style.boxShadow=\'none\'">
                                </div>
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <label style="font-size:13px; font-weight:700; color:#475569;">Màu sắc</label>
                                    <div style="position:relative; width:100%; height:46px; border-radius:12px; overflow:hidden; border:1.5px solid #cbd5e1;">
                                        <input type="color" id="catColor" value="${cat.color || '#3b82f6'}" style="position:absolute; top:-10px; left:-10px; width:150%; height:150%; cursor:pointer; border:none; padding:0; background:none;">
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <label style="font-size:13px; font-weight:700; color:#475569;">Biểu tượng (Material Icon)</label>
                                <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:8px 16px; transition:all 0.2s;" id="catIconWrapper">
                                    <span class="material-icons-outlined" id="catIconPreview" style="font-size:24px; color:${cat.color || '#3b82f6'};">${cat.icon || 'pending_actions'}</span>
                                    <input type="text" id="catIcon" value="${cat.icon || 'pending_actions'}" placeholder="Tên icon (VD: auto_stories)" style="border:none; background:none; flex:1; font-size:14px; font-weight:600; color:#1e293b; outline:none;" oninput="document.getElementById('catIconPreview').innerText = this.value || 'pending_actions'" onfocus="document.getElementById('catIconWrapper').style.borderColor='#3b82f6'; document.getElementById('catIconWrapper').style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'" onblur="document.getElementById('catIconWrapper').style.borderColor='#e2e8f0'; document.getElementById('catIconWrapper').style.boxShadow='none'">
                                </div>
                                <a href="https://fonts.google.com/icons?icon.set=Material+Icons" target="_blank" style="font-size:11px; color:#3b82f6; text-decoration:none; margin-top:2px;">Tra cứu thư viện icon</a>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" style="display:flex; justify-content:flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
                        <button type="button" class="btn-secondary-pro" onclick="document.getElementById('categoryModal').remove()" style="padding:10px 20px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; color:#64748b; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" form="categoryForm" class="btn-primary-pro" style="padding:10px 20px; border-radius:12px; border:none; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(59,130,246,0.3);">Lưu danh mục</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Cập nhật màu sắc icon khi chọn màu
        setTimeout(() => {
            const colorInput = document.getElementById('catColor');
            const iconPreview = document.getElementById('catIconPreview');
            if(colorInput && iconPreview) {
                colorInput.addEventListener('input', (e) => {
                    iconPreview.style.color = e.target.value;
                });
            }
        }, 100);
    };

    window.erpApp.saveCategory = async function (event, oldId) {
        event.preventDefault();
        const newId = document.getElementById('catCode').value.trim().toUpperCase();
        const label = document.getElementById('catLabel').value.trim();
        const tk = document.getElementById('catTk').value.trim();
        const icon = document.getElementById('catIcon').value.trim();
        const color = document.getElementById('catColor').value;

        if (!newId || !label) {
            window.erpApp.showToast('Vui lòng nhập đủ Mã và Tên danh mục!', 'error');
            return;
        }

        if (!oldId && EXPENSE_CATEGORIES[newId]) {
            window.erpApp.showToast('Mã danh mục đã tồn tại!', 'error');
            return;
        }

        EXPENSE_CATEGORIES[newId] = { label, tk, icon, color };
        
        window.erpApp._setData(COLLECTION_CATEGORIES, [{ id: 'global', data: EXPENSE_CATEGORIES }]);
        if (window.CrudSync) {
            await window.CrudSync.saveItem(COLLECTION_CATEGORIES, { id: 'global', data: EXPENSE_CATEGORIES }, 'id');
        }

        const existingNorm = expenseNorms.find(n => n.category === newId);
        if (!existingNorm) {
            const newNorm = {
                id: window.erpApp.generateId ? window.erpApp.generateId('N-') : `N-${Date.now()}-${Math.floor(Math.random()*100)}`,
                category: newId,
                limit: 5000000 
            };
            expenseNorms.push(newNorm);
            window.erpApp._setData(COLLECTION_NORMS, expenseNorms);
            if (window.CrudSync) {
                await window.CrudSync.saveItem(COLLECTION_NORMS, newNorm, 'category');
            }
        }

        document.getElementById('categoryModal').remove();
        window.erpApp.showToast('Đã lưu danh mục!', 'success');
        window.erpApp.renderOfficeExpense();
    };

    window.erpApp.deleteCategory = async function (catId) {
        const used = officeExpenses.some(e => e.category === catId);
        if (used) {
            window.erpApp.showToast('Không thể xóa danh mục đã phát sinh chi phí!', 'error');
            return;
        }

        window.erpApp.showDeleteConfirmation(`Bạn có chắc chắn muốn xóa danh mục <strong>${EXPENSE_CATEGORIES[catId].label}</strong>?`, async function () {
            delete EXPENSE_CATEGORIES[catId];
            window.erpApp._setData(COLLECTION_CATEGORIES, [{ id: 'global', data: EXPENSE_CATEGORIES }]);
            if (window.CrudSync) {
                await window.CrudSync.saveItem(COLLECTION_CATEGORIES, { id: 'global', data: EXPENSE_CATEGORIES }, 'id');
            }
            
            const normIdx = expenseNorms.findIndex(n => n.category === catId);
            if (normIdx !== -1) {
                const nId = expenseNorms[normIdx].id;
                expenseNorms.splice(normIdx, 1);
                window.erpApp._setData(COLLECTION_NORMS, expenseNorms);
                if (window.CrudSync) {
                    await window.CrudSync.deleteItem(COLLECTION_NORMS, nId);
                }
            }

            window.erpApp.showToast('Đã xóa danh mục!', 'success');
            window.erpApp.renderOfficeExpense();
        });
    };

    // ==========================================
    // Responsive Styles (Fluid UI)
    // ==========================================
    function injectStyles() {
        if (document.getElementById('office-expense-styles-v3')) return;
        // Remove old version if present
        const oldStyle = document.getElementById('office-expense-styles-v2');
        if (oldStyle) oldStyle.remove();
        const style = document.createElement('style');
        style.id = 'office-expense-styles-v3';
        style.textContent = `
            .office-expense-pro { 
                padding: clamp(12px, 3vw, 30px); 
                max-width: 1600px; 
                margin: 0 auto; 
                width: 100%;
                font-family: 'Inter', sans-serif;
            }

            /* Fluid Header */
            .module-header-pro { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px); 
                margin-bottom: clamp(20px, 4vw, 32px); 
                flex-wrap: wrap;
                gap: 20px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            }
            .header-info-group { display: flex; align-items: center; gap: clamp(12px, 2vw, 20px); }
            .header-back-btn {
                background: #1e293b !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #ffffff !important;
                width: 42px !important;
                height: 42px !important;
                border-radius: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: all 0.2s ease;
                z-index: 1000 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-right: 8px;
                flex-shrink: 0;
            }
            .header-back-btn:hover {
                background: #334155 !important;
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            .header-back-btn span {
                font-size: 22px !important;
                line-height: 1 !important;
            }
            .header-icon-box { 
                width: clamp(48px, 6vw, 60px); 
                height: clamp(48px, 6vw, 60px); 
                border-radius: clamp(14px, 2vw, 20px); 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                display: flex; align-items: center; justify-content: center; 
                color: #fff; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
            }
            .header-icon-box span { font-size: clamp(24px, 3vw, 32px); }
            .header-title-box h1 { font-size: clamp(18px, 3.5vw, 28px); font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -0.5px; }
            .header-title-box p { font-size: clamp(11px, 1.5vw, 14px); color: #64748b; margin: 4px 0 0 0; font-weight: 500; }

            /* Modern Tabs - Scrollable */
            .module-tabs-container { 
                display: flex; 
                gap: 8px; 
                padding: 6px; 
                background: #f1f5f9; 
                border-radius: clamp(14px, 2vw, 20px); 
                margin-bottom: clamp(20px, 4vw, 32px); 
                width: 100%;
                overflow-x: auto;
                scrollbar-width: none;
                border: 1px solid #e2e8f0;
            }
            .module-tabs-container::-webkit-scrollbar { display: none; }
            .tab-btn-modern { 
                display: flex; align-items: center; gap: 8px; 
                padding: clamp(8px, 1.5vw, 12px) clamp(16px, 2.5vw, 24px); 
                border: none; background: transparent; border-radius: clamp(10px, 1.5vw, 16px); 
                color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer; 
                transition: all 0.3s;
                white-space: nowrap;
            }
            .tab-btn-modern.active { color: #fff !important; }
            .tab-btn-modern.tab-dashboard.active { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
            .tab-btn-modern.tab-requests.active { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
            .tab-btn-modern.tab-norms.active { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
            .tab-btn-modern.tab-print.active { background: linear-gradient(135deg, #64748b 0%, #334155 100%); }

            /* Stats Row - Fluid Grid */
            .stats-row-v2 { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); 
                gap: clamp(16px, 2.5vw, 24px); 
                margin-bottom: clamp(24px, 4vw, 32px); 
            }
            .stat-card-v2 { padding: clamp(20px, 3vw, 32px); border-radius: 24px; background: white; }
            .stat-label-v2 { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
            .stat-value-v2 { font-size: clamp(24px, 4vw, 36px); font-weight: 800; color: #1e293b; margin-bottom: 16px; letter-spacing: -1px; }

            /* Charts Row - Adaptive */
            .charts-row-v2 { 
                display: flex; 
                flex-wrap: wrap; 
                gap: clamp(16px, 3vw, 24px); 
                margin-bottom: clamp(24px, 4vw, 32px);
            }
            .chart-main-v2 { flex: 1.8; min-width: min(100%, 500px); border-radius: 24px; padding: 24px; background: white; }
            .chart-side-v2 { flex: 1; min-width: min(100%, 320px); border-radius: 24px; padding: 24px; background: white; }
            .main-chart-container { width: 100%; height: 300px; }
            .donut-chart-container { width: 100%; height: 300px; }

            /* Table Styles */
            .table-container-pro { overflow: hidden; border-radius: 24px; border: 1px solid #f1f5f9; background: #fff; }
            .table-responsive-pro { width: 100%; overflow-x: auto; cursor: grab; }
            .table-responsive-pro.dragging-active { cursor: grabbing; user-select: none; }
            .pro-table { width: 100%; min-width: 1100px; border-collapse: collapse; }
            .pro-table th { padding: 10px 6px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
            .pro-table td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
            
            .text-truncate-v2 {
                max-width: 140px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: block;
                font-weight: 500;
            }
            
            .text-truncate {
                max-width: 140px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: block;
            }
            
            .cat-cell, .user-cell {
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
            }
            
            .avatar-mini {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #eff6ff;
                color: #2563eb;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            .payment-select {
                padding: 4px 6px !important;
                font-size: 11px !important;
                height: 28px !important;
                border-radius: 6px !important;
                font-weight: 700 !important;
                outline: none;
                border: 1px solid #cbd5e1;
                background: #fff;
                cursor: pointer;
                color: #475569;
            }
            .payment-select.paid {
                color: #10b981 !important;
                border-color: #10b981 !important;
                background-color: #ecfdf5 !important;
            }
            .payment-select.unpaid {
                color: #ef4444 !important;
                border-color: #ef4444 !important;
                background-color: #fef2f2 !important;
            }
            .debt-badge {
                color: #ef4444 !important;
                font-weight: 700;
            }
            
            .action-btn-v2 {
                width: 28px !important;
                height: 28px !important;
                border-radius: 6px !important;
                font-size: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .action-btn-v2 span {
                font-size: 16px !important;
            }
            
            .row-actions {
                display: flex;
                gap: 3px;
                align-items: center;
                justify-content: center;
            }

            /* Responsive Table (Cards on Mobile) */
            @media (max-width: 1024px) {
                .pro-table { display: block; }
                .pro-table thead { display: none; }
                .pro-table tbody { display: block; width: 100%; }
                .pro-table tr {
                    display: block;
                    background: #fff;
                    margin-bottom: 16px;
                    padding: 16px;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .pro-table td {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f8fafc;
                    text-align: right;
                }
                .pro-table td::before {
                    content: attr(data-label);
                    font-weight: 800;
                    color: #94a3b8;
                    font-size: 11px;
                    text-transform: uppercase;
                    margin-right: 16px;
                    text-align: left;
                }
                .pro-table td:last-child { border-bottom: none; }
                .row-actions { justify-content: flex-end; flex-wrap: wrap; }
            }

            /* Status Badges */
            .code-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; }

            /* Glass Card Base */
            .glass-card { 
                background: rgba(255, 255, 255, 0.95); 
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5); 
                border-radius: 24px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.04); 
            }
            
            /* Pro Modals */
            .modal-overlay-pro {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
                z-index: 9999; display: flex; align-items: center; justify-content: center;
            }
            .modal-content-pro {
                background: #ffffff; border-radius: 24px; padding: 0;
                box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
                position: relative; display: flex; flex-direction: column; max-height: 90vh;
                overflow: hidden;
            }
            .modal-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
            }
            .header-title { display: flex; align-items: center; gap: 12px; }
            .header-title span {
                background: #eff6ff; color: #2563eb; padding: 10px;
                border-radius: 12px; font-size: 24px;
            }
            .header-title h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
            .close-btn {
                background: transparent; border: 2px solid #e2e8f0; border-radius: 50%;
                width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: #64748b; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .close-btn:hover {
                background: #fee2e2; border-color: #fca5a5; color: #ef4444; transform: rotate(90deg);
            }
            .close-btn span { font-size: 18px; }
            .modal-footer {
                display: flex; justify-content: flex-end; align-items: center; gap: 12px;
                padding: 20px 24px; border-top: 1px solid #f1f5f9;
                background: #fafbfc; border-radius: 0 0 24px 24px;
            }

            /* Animations */
            .animated { animation-duration: 0.5s; animation-fill-mode: both; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .fadeInUp { animation-name: fadeInUp; }

            /* Norms Grid */
            .norms-grid-v2 {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(min(100%, 350px), 1fr));
                gap: 24px;
            }
            .norm-card-v2 {
                padding: 24px;
                background: #fff;
                border-radius: 20px;
                border: 1px solid #f1f5f9;
                transition: all 0.3s;
            }
            .norm-card-v2:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.06); }
            .nc-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .nc-left { display: flex; align-items: center; gap: 12px; }
            .nc-icon-v2 { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .nc-name-v2 { font-weight: 800; color: #1e293b; font-size: 15px; }
            .nc-tk-v2 { font-size: 11px; font-weight: 700; color: #94a3b8; background: #f8fafc; padding: 4px 8px; border-radius: 6px; }
            .nc-current-v2 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
            .nc-progress-v2 { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
            .nc-progress-v2 .fill { height: 100%; border-radius: 4px; transition: width 1s ease-in-out; }
            .nc-limit-text-v2 { font-size: 12px; color: #64748b; font-weight: 500; }
            .nc-footer-v2 { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #f1f5f9; }
            .nc-pct-v2 { font-size: 12px; font-weight: 700; color: #64748b; }
            .nc-edit-btn-v2 { border: none; background: #f8fafc; color: #3b82f6; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
            .nc-edit-btn-v2:hover { background: #3b82f6; color: #fff; }

            /* Buttons & Actions */
            .btn-primary-pro {
                display: flex; align-items: center; gap: 8px;
                padding: 12px 24px; border: none; border-radius: 16px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: #fff; font-weight: 700; cursor: pointer; transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .btn-primary-pro:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4); }
            
            .btn-secondary-pro {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 24px;
                border: 1.5px solid #e2e8f0;
                background: #fff;
                color: #64748b;
                border-radius: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
            }
            .btn-secondary-pro:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
                color: #334155;
            }

            .btn-text {
                background: none;
                border: none;
                color: #3b82f6;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: color 0.2s;
                padding: 0;
            }
            .btn-text:hover {
                color: #2563eb;
                text-decoration: underline;
            }
            
            .action-btn-v2 {
                width: 36px; height: 36px; border-radius: 10px; border: none;
                background: #f8fafc; color: #64748b; display: flex; align-items: center;
                justify-content: center; cursor: pointer; transition: all 0.2s;
            }
            .action-btn-v2:hover { background: #eff6ff; color: #3b82f6; }

            /* Table Toolbar & Filters */
            .table-toolbar-pro { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                gap: 16px; 
                padding: 16px 20px; 
                margin-bottom: 24px; 
                flex-wrap: wrap; 
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            }
            .search-box-pro { 
                flex: 1; 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                background: #f8fafc; 
                border: 1.5px solid #e2e8f0; 
                padding: 10px 16px; 
                border-radius: 14px; 
                transition: all 0.2s ease;
            }
            .search-box-pro:focus-within {
                border-color: #3b82f6;
                background: #ffffff;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .search-box-pro span {
                color: #94a3b8;
                font-size: 20px;
            }
            .search-box-pro input { 
                border: none; 
                background: none; 
                outline: none; 
                width: 100%; 
                font-size: 14px; 
                font-weight: 600; 
                color: #1e293b;
            }
            .search-box-pro input::placeholder {
                color: #94a3b8;
            }
            .filter-actions-pro { 
                display: flex; 
                gap: 12px; 
                align-items: center; 
            }
            .filter-actions-pro select { 
                height: 42px;
                padding: 0 16px; 
                border-radius: 12px; 
                border: 1.5px solid #cbd5e1; 
                background: white; 
                font-size: 13px; 
                font-weight: 700; 
                color: #475569; 
                outline: none; 
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 160px;
                font-family: 'Inter', sans-serif;
            }
            .filter-actions-pro select:hover {
                border-color: #94a3b8;
                background-color: #f8fafc;
            }
            .filter-actions-pro select:focus { 
                border-color: #3b82f6; 
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
            }
            
            /* Modern Excel Export Button */
            .btn-icon-v2 {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                border: 1.5px solid #cbd5e1;
                background: #ffffff;
                color: #10b981; /* Premium Emerald Green for Excel */
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 0;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                box-sizing: border-box;
            }
            .btn-icon-v2 span {
                font-size: 22px;
                font-weight: 700;
                transition: transform 0.2s ease;
            }
            .btn-icon-v2:hover {
                background: #f0fdf4; /* Soft pastel green background */
                border-color: #86efac; /* Elegant green border */
                color: #047857; /* Deep emerald green */
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
            }
            .btn-icon-v2:hover span {
                transform: translateY(1px); /* Subtle downward bounce motion */
            }
            .btn-icon-v2:active {
                transform: scale(0.95);
            }

            /* Utilities */
            .grid-layout { width: 100%; }
            .text-danger { color: #ef4444 !important; }
            .nc-progress-container-v2 { width: 100%; margin-bottom: 12px; }
            .norm-card-v2.over-limit { border-color: #fecaca; background: #fff5f5; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // Google Drive & Voucher Attachments Helpers
    // ==========================================
    // ─── Dynamic N-level folder chain for Office Expense ────────────────────
    window.erpApp.getDeepestExpenseDriveFolderId = () => {
        const chain = document.getElementById('expenseDriveFolderChain');
        if (!chain) return null;
        const selects = chain.querySelectorAll('select[data-chain-level]');
        let deepest = null;
        selects.forEach(sel => { if (sel.value) deepest = sel.value; });
        return deepest;
    };

    window.erpApp.getExpenseDriveFolderChainPath = () => {
        const chain = document.getElementById('expenseDriveFolderChain');
        if (!chain) return '';
        const selects = chain.querySelectorAll('select[data-chain-level]');
        const parts = [];
        selects.forEach(sel => {
            if (sel.value) parts.push(sel.options[sel.selectedIndex].text);
        });
        return parts.join(' ➔ ');
    };

    const _trimExpenseFolderChain = (fromLevel) => {
        const chain = document.getElementById('expenseDriveFolderChain');
        if (!chain) return;
        chain.querySelectorAll(`select[data-chain-level]`).forEach(sel => {
            if (parseInt(sel.dataset.chainLevel, 10) >= fromLevel) sel.remove();
        });
    };

    const _appendExpenseFolderDropdown = (level, folders) => {
        const chain = document.getElementById('expenseDriveFolderChain');
        if (!chain) return;
        const sel = document.createElement('select');
        sel.id = `expenseDriveChainSel_${level}`;
        sel.dataset.chainLevel = level;
        sel.style.cssText = 'flex:1;min-width:160px;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;cursor:pointer;font-weight:600;outline:none;';
        sel.innerHTML = `<option value="">— Chọn thư mục —</option>` +
            folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        sel.addEventListener('change', () => {
            window.erpApp.loadExpenseDriveFolderChain(sel.value, level + 1);
            window.erpApp.updateExpenseDriveFolderInputs();
        });
        chain.appendChild(sel);
    };

    window.erpApp.loadExpenseDriveFolderChain = async (parentFolderId, level) => {
        _trimExpenseFolderChain(level);
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        const rootFolderId = folderSelect ? folderSelect.value : '';
        const activeFolderId = parentFolderId || rootFolderId;

        if (!activeFolderId) {
            window.erpApp.updateExpenseDriveFolderInputs();
            return;
        }

        try {
            const url = (window.API_BASE_URL || '') + `/api/drive/files?folderId=${activeFolderId}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                const folders = (data.files || []).filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                if (folders.length > 0) {
                    _appendExpenseFolderDropdown(level, folders);
                }
            }
        } catch (e) { /* silent fail */ }

        window.erpApp.updateExpenseDriveFolderInputs();
    };

    window.erpApp.createExpenseDriveSubfolderFromChainModal = async () => {
        const deepestParentId = window.erpApp.getDeepestExpenseDriveFolderId() || document.getElementById('expenseDriveFolderSelect')?.value || '';
        if (!deepestParentId) {
            window.erpApp.showToast('Vui lòng chọn thư mục gốc trước khi tạo thư mục con!', 'error');
            return;
        }

        const name = await window.erpApp.expenseCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
        if (!name || !name.trim()) return;

        try {
            window.erpApp.showToast('⏳ Đang tạo folder...', 'info');
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), parentId: deepestParentId })
            });
            const data = await res.json();
            if (data.success) {
                window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                const chain = document.getElementById('expenseDriveFolderChain');
                const selects = chain ? chain.querySelectorAll('select[data-chain-level]') : [];
                const currentLevel = selects.length;
                await window.erpApp.loadExpenseDriveFolderChain(deepestParentId, currentLevel);
                // Auto select
                if (data.folder && data.folder.id) {
                    const newSel = document.getElementById(`expenseDriveChainSel_${currentLevel}`);
                    if (newSel) {
                        newSel.value = data.folder.id;
                        newSel.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                window.erpApp.showToast(`❌ Lỗi: ${data.error || 'Không tạo được folder'}`, 'error');
            }
        } catch (err) {
            window.erpApp.showToast(`❌ Lỗi kết nối: ${err.message}`, 'error');
        }
    };

    window.erpApp.updateExpenseDriveFolderInputs = () => {
        const idInput = document.getElementById('expenseDriveFolderIdInput');
        const pathInput = document.getElementById('expenseDriveFolderPathInput');
        if (!idInput || !pathInput) return;

        const deepestId = window.erpApp.getDeepestExpenseDriveFolderId();
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        if (deepestId) {
            idInput.value = deepestId;
            const rootLabel = folderSelect ? folderSelect.options[folderSelect.selectedIndex].text : '';
            const chainPath = window.erpApp.getExpenseDriveFolderChainPath();
            pathInput.value = rootLabel + (chainPath ? ' ➔ ' + chainPath : '');
        } else if (folderSelect && folderSelect.value) {
            idInput.value = folderSelect.value;
            pathInput.value = folderSelect.options[folderSelect.selectedIndex].text;
        } else {
            idInput.value = '';
            pathInput.value = 'My Drive';
        }
    };

    window.erpApp.loadExpenseDriveRootFolders = async (selectedId = null) => {
        const rootSelect = document.getElementById('expenseDriveFolderSelect');
        if (!rootSelect) return;
        rootSelect.innerHTML = '<option value="">⏳ Đang tải...</option>';
        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders');
            const data = await res.json();
            if (data.success && data.folders) {
                rootSelect.innerHTML = data.folders.map(f => `<option value="${f.id}" ${selectedId === f.id ? 'selected' : ''}>${f.name}</option>`).join('');
                
                if (!selectedId) {
                    // Default to 'Tài Chính'
                    const targetFolder = data.folders.find(f => f.name.includes('Tài Chính'));
                    if (targetFolder) {
                        rootSelect.value = targetFolder.id;
                    } else if (data.folders.length > 0) {
                        rootSelect.value = data.folders[0].id;
                    }
                }
                
                window.erpApp.loadExpenseDriveFolderChain(null, 0);
            } else {
                rootSelect.innerHTML = '<option value="">Không tải được</option>';
                window.erpApp.updateExpenseDriveFolderInputs();
            }
        } catch (e) {
            rootSelect.innerHTML = '<option value="">Lỗi kết nối</option>';
            window.erpApp.updateExpenseDriveFolderInputs();
        }
    };

    window.erpApp.expenseCustomPrompt = (title, placeholder, defaultValue = '') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 20000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s ease;
            `;

            overlay.innerHTML = `
                <div style="
                    background: #ffffff;
                    width: 100%;
                    max-width: 440px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
                    padding: 24px;
                    transform: scale(0.9);
                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                ">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <div style="
                            width: 44px;
                            height: 44px;
                            background: #f0fdf4;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #16a34a;
                        ">
                            <span class="material-icons-outlined" style="font-size: 24px;">create_new_folder</span>
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${title}</h3>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Tạo thư mục lưu trữ trực tiếp trên Drive</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <input type="text" id="expenseCustomPromptInput" value="${defaultValue}" placeholder="${placeholder}" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1.5px solid #e2e8f0;
                            border-radius: 12px;
                            font-size: 14px;
                            font-weight: 600;
                            color: #0f172a;
                            outline: none;
                            transition: all 0.2s;
                            box-sizing: border-box;
                        " onfocus="this.style.borderColor='#22c55e'; this.style.boxShadow='0 0 0 4px rgba(34, 197, 94, 0.15)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" id="expenseCustomPromptCancel" style="
                            padding: 10px 18px;
                            border: 1px solid #e2e8f0;
                            background: #ffffff;
                            color: #64748b;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 13px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#f8fafc'; this.style.color='#0f172a';" onmouseout="this.style.background='#ffffff'; this.style.color='#64748b';">Hủy bỏ</button>
                        <button type="button" id="expenseCustomPromptSubmit" style="
                            padding: 10px 20px;
                            border: none;
                            background: #22c55e;
                            color: #ffffff;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 13px;
                            cursor: pointer;
                            box-shadow: 0 4px 10px rgba(34, 197, 94, 0.25);
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#16a34a'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='#22c55e'; this.style.transform='none';">Tạo Thư Mục</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            setTimeout(() => {
                overlay.style.opacity = '1';
                overlay.firstElementChild.style.transform = 'scale(1)';
            }, 10);

            const input = overlay.querySelector('#expenseCustomPromptInput');
            input.focus();
            input.select();

            const closePrompt = (val) => {
                overlay.style.opacity = '0';
                overlay.firstElementChild.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    overlay.remove();
                    resolve(val);
                }, 200);
            };

            overlay.querySelector('#expenseCustomPromptCancel').addEventListener('click', () => closePrompt(null));
            overlay.querySelector('#expenseCustomPromptSubmit').addEventListener('click', () => {
                const v = input.value.trim();
                closePrompt(v ? v : null);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const v = input.value.trim();
                    closePrompt(v ? v : null);
                } else if (e.key === 'Escape') {
                    closePrompt(null);
                }
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closePrompt(null);
                }
            });
        });
    };

    // Removed legacy createExpenseDriveSubfolderFromModal function

    window.erpApp.handleExpenseFileUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) { return; }

        const listEl = document.getElementById('expenseFileList');

        Array.from(files).forEach(async (file) => {
            const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
            const fType = window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf';

            const placeholderIdx = tempExpenseFiles.length;
            tempExpenseFiles.push({ name: '⏳ Đang tải: ' + file.name, size: sizeStr, type: fType, uploading: true });
            if (listEl) { listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true); }

            try {
                const formData = new FormData();
                formData.append('files', file);
                const deepestId = window.erpApp.getDeepestExpenseDriveFolderId() || document.getElementById('expenseDriveFolderSelect')?.value || '';
                if (deepestId) {
                    formData.append('folderId', deepestId);
                } else {
                    formData.append('module', 'tai-chinh');
                }

                const res = await fetch((window.API_BASE_URL || '') + '/api/drive/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success && data.uploaded && data.uploaded.length > 0) {
                    const driveFile = data.uploaded[0];
                    const folderSelect = document.getElementById('expenseDriveFolderSelect');
                    const folderLabel = folderSelect ? folderSelect.options[folderSelect.selectedIndex].text : 'Tài Chính';
                    const chainPath = window.erpApp.getExpenseDriveFolderChainPath();
                    const drivePath = folderLabel.replace(/^[^\s]+\s/, '') + (chainPath ? ' ➔ ' + chainPath : '');
                    tempExpenseFiles[placeholderIdx] = {
                        name: file.name,
                        size: sizeStr,
                        type: fType,
                        url: driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
                        driveFileId: driveFile.id,
                        drivePath
                    };
                    window.erpApp.showToast(`✅ Đã tải "${file.name}" lên Google Drive`, 'success');
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                        if (listEl) { listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true); }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Drive không khả dụng, lưu tệp cục bộ: ${file.name}`, 'warning');
                }
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                    if (listEl) { listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true); }
                };
                reader.readAsDataURL(file);
                console.warn('[Expense Upload] Drive fallback:', err.message);
            }

            if (listEl) { listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true); }
        });
        event.target.value = '';
    };

    window.erpApp.addExpenseFileByLink = () => {
        const urlEl = document.getElementById('expenseLinkUrl');
        const nameEl = document.getElementById('expenseLinkName');
        if (!urlEl) return;
        const url = urlEl.value.trim();
        if (!url) { window.erpApp.showToast('Vui lòng nhập đường link!', 'error'); urlEl.focus(); return; }
        try { new URL(url); } catch (e) { window.erpApp.showToast('Đường link không hợp lệ!', 'error'); urlEl.focus(); return; }
        const name = (nameEl && nameEl.value.trim()) || url.split('/').filter(Boolean).pop() || 'Link file';
        tempExpenseFiles.push({ name: name, url: url, data: url, type: 'link', size: '' });
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true);
        }
        urlEl.value = '';
        if (nameEl) nameEl.value = '';
        window.erpApp.showToast('Đã thêm link: ' + name, 'success');
    };

    window.erpApp.removeExpenseFile = (index) => {
        tempExpenseFiles.splice(index, 1);
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderExpenseFileList(tempExpenseFiles, true);
        }
    };

    window.erpApp.previewExpenseFile = async (index) => {
        const file = tempExpenseFiles[index];
        if (!file) { window.erpApp.showToast('Không tìm thấy file!', 'error'); return; }
        let href = file.dataUrl || file.url || file.data;
        if (!href) { window.erpApp.showToast('File này chưa có dữ liệu để xem trước.', 'error'); return; }
        if (href.includes('drive.google.com') || href.includes('docs.google.com')) {
            window.open(href, '_blank');
            return;
        }
        href = window.erpApp.resolveFileUrl(href);
        const fType = file.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf');

        if ((file.dataUrl || file.data) && fType === 'pdf') {
            const win = window.open('', '_blank');
            win.document.write(`<iframe src="${href}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
        } else if ((file.dataUrl || file.data) && fType === 'img') {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${href}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`);
        } else {
            window.open(href, '_blank');
        }
    };

    window.erpApp.renderExpenseFileList = (files, editable = true) => {
        if (!files || files.length === 0) {
            return '<div style="text-align:center; padding:12px; color:#94a3b8; font-size:12px; font-style:italic;">Chưa có file đính kèm nào</div>';
        }
        return files.map((f, i) => {
            const isLink = f.type === 'link';
            const icon = isLink ? 'link' : (f.type === 'pdf' ? 'picture_as_pdf' : (f.type === 'img' ? 'image' : 'description'));
            const iconColor = isLink ? '#6366F1' : (f.type === 'pdf' ? '#EF4444' : (f.type === 'img' ? '#10B981' : '#3B82F6'));
            const previewable = !f.uploading && (f.dataUrl || f.url || f.data);
            const previewFn = previewable ? `window.erpApp.previewExpenseFile(${i})` : '';

            let actions = '';
            if (editable) {
                const previewBtn = `<button type="button" style="background:none; border:none; color:#3b82f6; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); ${previewFn}"><span class="material-icons-outlined" style="font-size:16px;">visibility</span></button>`;
                actions = `<div style="display:flex; gap:4px; align-items:center;">
                    ${previewable ? previewBtn : ''}
                    <button type="button" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); window.erpApp.removeExpenseFile(${i})"><span class="material-icons-outlined" style="font-size:16px;">close</span></button>
                </div>`;
            } else {
                actions = previewable ? `<button type="button" style="background:none; border:none; color:#3b82f6; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); ${previewFn}"><span class="material-icons-outlined" style="font-size:16px;">visibility</span></button>` : '';
            }

            let drivePathHtml = '';
            if (f.drivePath) {
                drivePathHtml = `<span style="display:block;margin-top:2px;font-size:11px;color:#0D9488"><span class="material-icons-outlined" style="font-size:12px;vertical-align:middle;margin-right:2px">folder</span>Drive: ${f.drivePath}</span>`;
            }
            const linkHref = f.url || f.data;
            if (linkHref && linkHref.includes('drive.google.com')) {
                drivePathHtml += `<a href="${linkHref}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:3px;margin-top:2px;font-size:11px;color:#2563EB;text-decoration:none" onclick="event.stopPropagation()"><span class="material-icons-outlined" style="font-size:12px">open_in_new</span>Xem trên Drive</a>`;
            }

            return `<div style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;" onclick="${previewFn}">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="material-icons-outlined" style="color:${iconColor};font-size:20px">${icon}</span>
                    <div style="text-align:left;">
                        <span style="font-weight:700; color:#1E293B; font-size:13px; word-break:break-all;">${f.name}</span>
                        <span style="display:block;margin-top:2px;font-size:11px;color:#64748B">${f.size || ''}</span>
                        ${drivePathHtml}
                    </div>
                </div>
                <div style="display:flex;gap:4px;align-items:center">${actions}</div>
            </div>`;
        }).join('');
    };

    init();
})();
