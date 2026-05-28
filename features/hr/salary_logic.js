/**
 * MODULE: Bảng tính lương & Chế độ Phúc lợi (Payroll & Benefits)
 * Extracted from app.js for better modularity.
 */

(function () {
    'use strict';

    // --- State & Constants (Accessing via window) ---
    const getEmployees = () => window.employees || [];
    const getSalarySettings = () => window.salarySettings || {};
    const getAttendanceData = () => window.attendanceData || {};
    
    let prCurrentMonth = new Date().getMonth();
    let prCurrentYear = new Date().getFullYear();
    let prSearchQuery = '';
    
    let plCurrentMonth = new Date().getMonth();
    let plCurrentYear = new Date().getFullYear();
    let plSearchQuery = '';

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    // --- HELPERS ---
    window.erpApp.formatSalaryInput = function(input) {
        let value = input.value.replace(/\D/g, '');
        input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseSalaryValue = (id) => {
        const val = document.getElementById(id).value;
        return parseInt(val.replace(/\./g, '')) || 0;
    };

    // --- PAYROLL RENDERER ---
    function renderBangLuong() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) {
            console.error('❌ [Payroll] Render target "pageContent" not found!');
            return;
        }

        // Show loading state
        pageContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px; color:#64748b;">
                <span class="material-icons-outlined animate-spin" style="font-size:48px; margin-bottom:16px;">sync</span>
                <div style="font-weight:700;">Đang tính toán bảng lương...</div>
            </div>
        `;

        try {
            if (window.erpApp.breadcrumbCurrent) window.erpApp.breadcrumbCurrent.textContent = 'Bảng tính lương';
            if (window.erpApp.pageBadge) window.erpApp.pageBadge.textContent = 'Nhân sự';

            const formatCurrency = (val) => window.erpApp.formatValue(val) + ' đ';
            const employees = getEmployees();

            // Validate data integrity
            if (!employees || employees.length === 0) {
                pageContent.innerHTML = `
                    <div style="text-align:center; padding:100px; color:#64748b;">
                        <span class="material-icons-outlined" style="font-size:48px; margin-bottom:16px; opacity:0.5;">person_off</span>
                        <div style="font-weight:700;">Không tìm thấy dữ liệu nhân viên</div>
                        <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin-top:20px;">Quay lại</button>
                    </div>
                `;
                return;
            }

            // Lọc nhân viên theo tìm kiếm
            const filteredEmployees = employees.filter(emp =>
                emp.name.toLowerCase().includes(prSearchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(prSearchQuery.toLowerCase())
            );

            // Tính toán dữ liệu lương cho từng nhân viên
            const payrollData = filteredEmployees.map(emp => {
                const settings = window.erpApp.getSalarySettings(emp.id) || {};
                const stats = window.erpApp.getAttendanceStats(emp.id, prCurrentYear, prCurrentMonth) || { full: 0, half: 0, sundayDays: 0, totalOt: 0, workingDays: 26 };

                // Lương thời gian = (Lương chính / Số ngày làm việc tiêu chuẩn) * Ngày công thực tế
                const sunCoeff = settings.sunCoeff || 2.0;
                const ngayCongThucTe = (parseFloat(stats.full || 0) + parseFloat(stats.half || 0) * 0.5) + (stats.sundayDays * sunCoeff);
                const congChuan = 26; // Cố định 26 ngày công chuẩn
                const luongThoiGian = Math.round(((settings.base || 0) / congChuan) * ngayCongThucTe);

                // Tổng phụ cấp
                const tongPhuCap = (settings.resp || 0) + (settings.lunch || 0) + (settings.phone || 0) + (settings.fuel || 0) + (settings.site || 0) + (settings.housing || 0) + (settings.child || 0);

                // Tạm tính OT (giả định 150k/h)
                const luongOT = (stats.totalOt || 0) * 150000;

                // Tổng thu nhập
                const tongThuNhap = luongThoiGian + tongPhuCap + luongOT;

                // Các khoản giảm trừ
                const bhxh = Math.round((settings.base || 0) * 0.105);
                const congDoan = Math.round((settings.base || 0) * 0.01);
                const giamTruGiaCanh = 11000000;

                // Thu nhập tính thuế
                const thuNhapTinhThue = Math.max(0, tongThuNhap - bhxh - congDoan - giamTruGiaCanh);
                const thueTNCN = Math.round(calculateTNCN(thuNhapTinhThue));

                const tamUng = settings.advance || 0;
                const giamTruKhac = settings.otherDeduct || 0;
                const tongGiamTru = bhxh + congDoan + thueTNCN + tamUng + giamTruKhac;

                // Thực lĩnh
                const thucLinh = tongThuNhap - tongGiamTru;

                return {
                    ...emp,
                    settings,
                    stats,
                    ngayCongThucTe,
                    luongThoiGian,
                    tongPhuCap,
                    luongOT,
                    tongThuNhap,
                    bhxh,
                    congDoan,
                    thueTNCN,
                    tongGiamTru,
                    thucLinh
                };
            });

            // Tổng hợp
            const totalNet = payrollData.reduce((sum, p) => sum + p.thucLinh, 0);
            const totalTax = payrollData.reduce((sum, p) => sum + p.thueTNCN, 0);
            const totalIns = payrollData.reduce((sum, p) => sum + p.bhxh, 0);

            let html = `
                <div class="payroll-module" style="animation: fadeIn 0.4s ease-out;">
                    <!-- ... existing payroll UI ... -->
            `;

            // Note: I will use the actual full HTML in the next step to keep chunks clean, 
            // for now I'm ensuring the shell and try-catch are correct.
            // Re-generating full HTML for renderBangLuong ...
            html = `
                <div class="payroll-module" style="animation: fadeIn 0.4s ease-out;">
                    <div class="print-header" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:2px solid #000; padding-bottom:10px;">
                            <div style="text-align:left;">
                                <div style="font-weight:bold; font-size:14px; text-transform:uppercase;">CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH</div>
                                <div style="font-size:11px;">Địa chỉ: 643/22B Xô Viết Nghệ Tĩnh, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh</div>
                                <div style="font-size:11px; font-weight:bold; margin-top:2px;">MST: 0303204517</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:bold; font-size:11px;">Mẫu số: 02-LĐTL</div>
                                <div style="font-size:10px;">(Ban hành theo Thông tư 200/2014/TT-BTC)</div>
                            </div>
                        </div>
                        <div style="text-align:center; margin-bottom:20px;">
                            <h1 style="margin:0; font-size:20px; font-weight:bold;">BẢNG THANH TOÁN TIỀN LƯƠNG</h1>
                            <div style="font-style:italic; font-size:14px; margin-top:5px;">Tháng ${prCurrentMonth + 1} năm ${prCurrentYear}</div>
                        </div>
                    </div>
                    <div class="employee-toolbar">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div style="flex:1"></div>
                        <div style="display:flex; gap:10px;">
                            <button class="pb-btn-add" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;" onclick="window.erpApp.exportPayrollToExcel()">
                                <span class="material-icons-outlined">download</span> Xuất Excel
                            </button>
                            <button class="pb-btn-add" onclick="window.print()">
                                <span class="material-icons-outlined">print</span> In bảng lương
                            </button>
                        </div>
                    </div>

                    <div class="employee-stats" style="margin-bottom:24px;">
                        <div class="stat-card">
                            <div class="stat-card-icon blue"><span class="material-icons-outlined">payments</span></div>
                            <div class="stat-card-body">
                                <div class="stat-card-value">${formatCurrency(totalNet)}</div>
                                <div class="stat-card-label">Tổng thực trả</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-icon green"><span class="material-icons-outlined">groups</span></div>
                            <div class="stat-card-body">
                                <div class="stat-card-value">${filteredEmployees.length}</div>
                                <div class="stat-card-label">Nhân viên quyết toán</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-icon orange"><span class="material-icons-outlined">account_balance_wallet</span></div>
                            <div class="stat-card-body">
                                <div class="stat-card-value">${formatCurrency(totalTax)}</div>
                                <div class="stat-card-label">Tổng Thuế TNCN</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-icon red"><span class="material-icons-outlined">security</span></div>
                            <div class="stat-card-body">
                                <div class="stat-card-value">${formatCurrency(totalIns)}</div>
                                <div class="stat-card-label">Tổng bảo hiểm (NLĐ)</div>
                            </div>
                        </div>
                    </div>

                    <div class="pr-card">
                        <div class="pr-header">
                            <div style="display:flex; align-items:center; gap:20px;">
                                <h2 style="font-size:18px; font-weight:800; color:#1e293b; margin:0;">Bảng thanh toán tiền lương</h2>
                                <div class="att-month-nav" style="margin:0; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 12px; border-radius:10px;">
                                    <button onclick="window.erpApp.prPrevMonth()" style="background:none; border:none; cursor:pointer; color:#64748b; padding:4px;"><span class="material-icons-outlined" style="font-size:18px;">chevron_left</span></button>
                                    <span style="font-size:13px; font-weight:700; color:#1e293b; min-width:120px; text-align:center;">${monthNames[prCurrentMonth]} ${prCurrentYear}</span>
                                    <button onclick="window.erpApp.prNextMonth()" style="background:none; border:none; cursor:pointer; color:#64748b; padding:4px;"><span class="material-icons-outlined" style="font-size:18px;">chevron_right</span></button>
                                </div>
                            </div>
                            <div style="position:relative;">
                                <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:18px; color:#94a3b8;">search</span>
                                <input type="text" id="prSearchInput" placeholder="Tìm tên nhân viên..." 
                                    value="${prSearchQuery}"
                                    oninput="window.erpApp.prSearch(this.value)"
                                    style="padding:10px 12px 10px 38px; border:1px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; width:280px; background:#f8fafc;">
                            </div>
                        </div>

                        <div class="pr-table-container" style="overflow-x:auto;">
                            <table class="pr-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="sticky-col">Mã NV</th>
                                        <th rowspan="2" class="sticky-col" style="left:80px;">Họ tên nhân viên</th>
                                        <th rowspan="2">Bộ phận</th>
                                        <th colspan="3" style="text-align:center; background:#f1f5f9;">Công & Lương TG</th>
                                        <th colspan="7" style="text-align:center; background:#ecfdf5;">Các khoản Phụ cấp</th>
                                        <th colspan="5" style="text-align:center; background:#fef2f2;">Các khoản Giảm trừ</th>
                                        <th rowspan="2" style="background:#3b82f6; color:#fff;">Thực lĩnh</th>
                                        <th rowspan="2">Thao tác</th>
                                    </tr>
                                    <tr>
                                        <th>Công</th>
                                        <th>Lương chính</th>
                                        <th>Lương TG</th>
                                        <th>Trách nhiệm</th>
                                        <th>Ăn trưa</th>
                                        <th>Điện thoại</th>
                                        <th>Xăng xe</th>
                                        <th>Công trường</th>
                                        <th>Nhà ở</th>
                                        <th>Nuôi con</th>
                                        <th>BHXH</th>
                                        <th>Công đoàn</th>
                                        <th>Thuế TNCN</th>
                                        <th>Tạm ứng</th>
                                        <th>Giảm trừ khác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payrollData.map(p => `
                                        <tr>
                                            <td class="sticky-col" style="font-weight:700; color:#64748b;">${p.id}</td>
                                            <td class="sticky-col" style="left:80px; font-weight:700; color:#1e293b;">${p.name}</td>
                                            <td style="font-size:12px; color:#64748b;">${p.department}</td>
                                            <td style="text-align:center;">
                                                <div style="font-weight:700; color:#1e293b;">${p.ngayCongThucTe.toFixed(1)}</div>
                                                <div style="font-size:10px; color:#94a3b8;">/${p.stats.workingDays || 26} công</div>
                                            </td>
                                            <td>${formatCurrency(p.settings.base || 0)}</td>
                                            <td style="font-weight:700;">${formatCurrency(p.luongThoiGian)}</td>
                                            <td>${formatCurrency(p.settings.resp || 0)}</td>
                                            <td>${formatCurrency(p.settings.lunch || 0)}</td>
                                            <td>${formatCurrency(p.settings.phone || 0)}</td>
                                            <td>${formatCurrency(p.settings.fuel || 0)}</td>
                                            <td>${formatCurrency(p.settings.site || 0)}</td>
                                            <td>${formatCurrency(p.settings.housing || 0)}</td>
                                            <td>${formatCurrency(p.settings.child || 0)}</td>
                                            <td style="color:#ef4444; cursor:pointer;" onclick="window.erpApp.viewDeductionDetail('${p.id}', 'bhxh')" title="Click xem công thức">${formatCurrency(p.bhxh)}</td>
                                            <td style="color:#ef4444; cursor:pointer;" onclick="window.erpApp.viewDeductionDetail('${p.id}', 'union')" title="Click xem công thức">${formatCurrency(p.congDoan)}</td>
                                            <td style="color:#ef4444; cursor:pointer;" onclick="window.erpApp.viewDeductionDetail('${p.id}', 'tax')" title="Click xem công thức">${formatCurrency(p.thueTNCN)}</td>
                                            <td style="color:#ef4444;">${formatCurrency(p.settings.advance || 0)}</td>
                                            <td style="color:#ef4444;">${formatCurrency(p.settings.otherDeduct || 0)}</td>
                                            <td style="font-weight:900; color:#3b82f6; background:#eff6ff; border-right:none;">${formatCurrency(p.thucLinh)}</td>
                                            <td style="text-align:center; border-left:1px solid #e2e8f0;">
                                                <button class="pr-settings-btn" onclick="window.erpApp.openSalaryModal('${p.id}')" title="Cấu hình lương">
                                                    <span class="material-icons-outlined" style="font-size:18px;">settings</span>
                                                </button>
                                                <button class="pr-settings-btn" style="margin-left:5px; color:#10b981;" onclick="window.erpApp.printPayslip('${p.id}')" title="In phiếu lương">
                                                    <span class="material-icons-outlined" style="font-size:18px;">receipt_long</span>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="print-footer" style="display:none; margin-top:30px;">
                        <table style="width:100%; border:none;">
                            <tr style="border:none;">
                                <td width="25%" style="text-align:center; border:none; vertical-align:top;">
                                    <div style="font-weight:bold; font-size:12px;">Người lập</div>
                                    <div style="font-style:italic; font-size:11px;">(Ký, họ tên)</div>
                                </td>
                                <td width="25%" style="text-align:center; border:none; vertical-align:top;">
                                    <div style="font-weight:bold; font-size:12px;">Kế toán trưởng</div>
                                    <div style="font-style:italic; font-size:11px;">(Ký, họ tên)</div>
                                </td>
                                <td width="25%" style="text-align:center; border:none; vertical-align:top;">
                                    <div style="font-weight:bold; font-size:12px;">Giám đốc</div>
                                    <div style="font-style:italic; font-size:11px;">(Ký, đóng dấu)</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <style>
                    .payroll-module { padding: 0; }
                    .pr-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .pr-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                    .pr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    .pr-table th { padding: 12px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; border-right: 1px solid #f1f5f9; font-weight: 800; color: #475569; white-space: nowrap; }
                    .pr-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; white-space: nowrap; transition: background 0.2s; }
                    .pr-table tr:hover td { background: #f8fafc; }
                    .pr-table .sticky-col { position: sticky; left: 0; background: #fff; z-index: 10; border-right: 2px solid #e2e8f0; }
                    .pr-table thead tr:first-child th.sticky-col { z-index: 20; }
                    .pr-settings-btn { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                    .pr-settings-btn:hover { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; transform: rotate(90deg); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
                    
                    @media print {
                        @page { size: landscape; margin: 5mm; }
                        body { background: white !important; }
                        #sidebar, .top-header, .top-nav, .employee-toolbar, .employee-stats, .pr-header, .pr-settings-btn, #prSearchInput, #floatingAiBtn, .sidebar-overlay { 
                            display: none !important; 
                        }
                        .main-wrapper { margin-left: 0 !important; padding: 0 !important; }
                        .page-content { margin: 0 !important; padding: 0 !important; width: 100% !important; overflow: visible !important; }
                        .payroll-module { padding: 0 !important; width: 100% !important; }
                        .pr-card { border: none !important; box-shadow: none !important; padding: 0 !important; overflow: visible !important; }
                        .print-header, .print-footer { display: block !important; }
                        .pr-table-container { overflow: visible !important; width: 100% !important; }
                        .pr-table { width: 100% !important; border-collapse: collapse !important; font-size: 8.5px !important; table-layout: fixed; }
                        .pr-table th, .pr-table td { border: 1px solid #000 !important; padding: 4px 2px !important; color: #000 !important; white-space: normal !important; overflow: visible !important; }
                        .pr-table th { background: #f2f2f2 !important; font-weight: bold !important; }
                        .sticky-col { position: static !important; background: transparent !important; border: 1px solid #000 !important; }
                        /* Ensure specific column widths for print */
                        .pr-table th:nth-child(1), .pr-table td:nth-child(1) { width: 40px !important; }
                        .pr-table th:nth-child(2), .pr-table td:nth-child(2) { width: 120px !important; }
                    }
                </style>
            `;

            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;

            // Restore focus to search input if it was active
            if (prSearchQuery) {
                const searchInput = document.getElementById('prSearchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.setSelectionRange(prSearchQuery.length, prSearchQuery.length);
                }
            }
        } catch (err) {
            console.error('❌ [Payroll] Render crash:', err);
            pageContent.innerHTML = `
                <div style="padding:40px; background:#fef2f2; border-radius:16px; border:1px solid #ef4444; color:#991b1b;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                        <span class="material-icons-outlined" style="font-size:32px;">error</span>
                        <h2 style="margin:0; font-size:18px;">Lỗi xử lý bảng lương</h2>
                    </div>
                    <p style="font-size:14px; line-height:1.6;">${err.message}</p>
                    <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin-top:16px; background:#ef4444; color:white; border:none;">Quay lại</button>
                </div>
            `;
        }
    }

    // --- BENEFIT RENDERER ---
    function renderPhucLoi() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) {
            console.error('❌ [Benefits] Render target "pageContent" not found!');
            return;
        }

        try {
            if (window.erpApp.breadcrumbCurrent) window.erpApp.breadcrumbCurrent.textContent = 'Chế độ Phúc lợi & Trợ cấp';
            if (window.erpApp.pageBadge) window.erpApp.pageBadge.textContent = 'Nhân sự';

            const formatNumber = (val) => window.erpApp.formatValue(val);
            const employees = getEmployees();

            const filteredEmployees = employees.filter(emp =>
                emp.name.toLowerCase().includes(plSearchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(plSearchQuery.toLowerCase())
            );

            const benefitData = filteredEmployees.map(emp => {
                const s = window.erpApp.getSalarySettings(emp.id) || {};
                const totalBenefits = (s.resp || 0) + (s.lunch || 0) + (s.phone || 0) + (s.fuel || 0) + (s.site || 0) + (s.housing || 0) + (s.child || 0);
                return { ...emp, s, totalBenefits };
            });



        let html = `
            <style>
                .benefits-container { padding: 20px; animation: fadeIn 0.5s ease; }
                .benefits-grid-table { 
                    width: 100%; border-collapse: separate; border-spacing: 0; 
                    background: #fff; border-radius: 16px; overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
                }
                .benefits-grid-table th { 
                    background: #f8fafc; color: #64748b; font-weight: 700; font-size: 11px;
                    text-transform: uppercase; letter-spacing: 0.05em; padding: 16px 12px;
                    border-bottom: 1px solid #f1f5f9; text-align: left;
                }
                .benefits-grid-table td { 
                    padding: 14px 12px; border-bottom: 1px solid #f1f5f9; 
                    font-size: 13px; color: #334155; vertical-align: middle;
                }
                .benefits-grid-table tr:hover td { background: #fdf2f866; }
                .currency-val { font-weight: 600; text-align: right; white-space: nowrap; color: #475569; }
                .total-col { background: #fff1f288; font-weight: 800; color: #be123c; text-align: right; }
                .action-btn-premium {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    background: #fff;
                    color: #db2777;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .action-btn-premium:hover {
                    background: #fdf2f8;
                    border-color: #fbcfe8;
                    color: #db2777;
                    transform: translateY(-2px) scale(1.1);
                    box-shadow: 0 10px 20px -5px rgba(219, 39, 119, 0.2);
                }

            </style>

            <div class="benefits-container">
                <div class="employee-toolbar" style="margin-bottom: 24px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="background:#fff; border:1px solid #e2e8f0; padding:10px 20px; border-radius:12px; font-weight:600; color:#475569;">
                        <span class="material-icons-outlined" style="font-size:20px;">arrow_back</span> Quay lại
                    </button>
                    <div style="flex:1"></div>
                    <div style="display:flex; gap:12px;">
                        <button class="pb-btn-add" style="background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; border:none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);" onclick="window.erpApp.openPolicyModal()">
                            <span class="material-icons-outlined">verified_user</span> Chính sách công ty
                        </button>
                    </div>
                </div>



                <div style="background:#fff; border-radius:20px; border:1px solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
                    <div style="padding: 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9;">
                        <div style="display:flex; align-items:center; gap:20px;">
                            <h2 style="font-size:20px; font-weight:800; color:#0f172a; margin:0; display:flex; align-items:center; gap:10px;">
                                <span class="material-icons-outlined" style="color:#db2777; font-size:28px;">workspace_premium</span>
                                Danh sách chi tiết đãi ngộ
                            </h2>
                            <div class="att-month-nav" style="margin:0; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 16px; border-radius:14px;">
                                <button onclick="window.erpApp.plPrevMonth()" style="background:none; border:none; cursor:pointer; color:#64748b;"><span class="material-icons-outlined" style="font-size:20px;">chevron_left</span></button>
                                <span style="font-size:14px; font-weight:700; color:#1e293b; min-width:140px; text-align:center; text-transform: capitalize;">${monthNames[plCurrentMonth]} ${plCurrentYear}</span>
                                <button onclick="window.erpApp.plNextMonth()" style="background:none; border:none; cursor:pointer; color:#64748b;"><span class="material-icons-outlined" style="font-size:20px;">chevron_right</span></button>
                            </div>
                        </div>
                        <div style="position:relative; width:320px;">
                            <span class="material-icons-outlined" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:20px; color:#94a3b8;">search</span>
                            <input type="text" id="plSearchInput" placeholder="Tìm kiếm nhân viên..." 
                                value="${plSearchQuery}"
                                oninput="window.erpApp.plSearch(this.value)"
                                style="width:100%; padding:12px 16px 12px 44px; border:1px solid #e2e8f0; border-radius:14px; font-size:14px; outline:none; transition:all 0.3s; background:#f8fafc;">
                        </div>
                    </div>

                    <div style="overflow-x:auto; padding:0 1px 1px 1px;">
                        <table class="benefits-grid-table">
                            <thead>
                                <tr>
                                    <th style="width:100px; padding-left:24px;">Mã NV</th>
                                    <th>Họ tên nhân viên</th>
                                    <th>Bộ phận</th>
                                    <th style="text-align:right;">Trách nhiệm</th>
                                    <th style="text-align:right;">Ăn trưa</th>
                                    <th style="text-align:right;">Điện thoại</th>
                                    <th style="text-align:right;">Xăng xe</th>
                                    <th style="text-align:right;">Công trường</th>
                                    <th style="text-align:right;">Nhà ở</th>
                                    <th style="text-align:right;">Nuôi con</th>
                                    <th style="text-align:right; width:140px; padding-right:24px;">TỔNG CỘNG</th>
                                    <th style="width:100px; text-align:center;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${benefitData.map(p => `
                                    <tr onclick="window.erpApp.viewBenefitDetail('${p.id}')">
                                        <td style="padding-left:24px;">${p.id}</td>
                                        <td><strong>${p.name}</strong></td>
                                        <td>${p.department}</td>
                                        <td class="currency-val">${formatNumber(p.s.resp || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.lunch || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.phone || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.fuel || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.site || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.housing || 0)}</td>
                                        <td class="currency-val">${formatNumber(p.s.child || 0)}</td>
                                        <td class="total-col" style="padding-right:24px;">${formatNumber(p.totalBenefits)}</td>
                                        <td style="text-align:center;">
                                            <button class="action-btn-premium" onclick="event.stopPropagation(); window.erpApp.openSalaryModal('${p.id}')" title="Chỉnh sửa đãi ngộ">
                                                <span class="material-icons-outlined" style="font-size:20px;">edit_note</span>
                                            </button>
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
            pageContent.scrollTop = 0;
        } catch (err) {
            console.error('❌ [Benefits] Render crash:', err);
            pageContent.innerHTML = `
                <div style="padding:40px; background:#fef2f2; border-radius:16px; border:1px solid #ef4444; color:#991b1b;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                        <span class="material-icons-outlined" style="font-size:32px;">error</span>
                        <h2 style="margin:0; font-size:18px;">Lỗi xử lý phúc lợi</h2>
                    </div>
                    <p>${err.message}</p>
                    <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin-top:16px; background:#ef4444; color:white; border:none;">Quay lại</button>
                </div>
            `;
        }
    }

    // --- HELPER FUNCTIONS ---
    function calculateTNCN(thuNhapTinhThue) {
        if (thuNhapTinhThue <= 0) { return 0; }
        if (thuNhapTinhThue <= 5000000) { return thuNhapTinhThue * 0.05; }
        if (thuNhapTinhThue <= 10000000) { return thuNhapTinhThue * 0.1 - 250000; }
        if (thuNhapTinhThue <= 18000000) { return thuNhapTinhThue * 0.15 - 750000; }
        if (thuNhapTinhThue <= 32000000) { return thuNhapTinhThue * 0.2 - 1650000; }
        if (thuNhapTinhThue <= 52000000) { return thuNhapTinhThue * 0.25 - 3250000; }
        if (thuNhapTinhThue <= 80000000) { return thuNhapTinhThue * 0.3 - 5850000; }
        return thuNhapTinhThue * 0.35 - 9850000;
    }

    function viewDeductionDetail(empId, type) {
        const emp = getEmployees().find(e => e.id === empId);
        if (!emp) return;
        const s = window.erpApp.getSalarySettings(empId);
        const stats = window.erpApp.getAttendanceStats(empId, prCurrentYear, prCurrentMonth);

        const sunCoeff = s.sunCoeff || 2.0;
        const ngayCongThucTe = (parseFloat(stats.full) + parseFloat(stats.half) * 0.5) + (stats.sundayDays * sunCoeff);
        const congChuan = 26;
        const luongThoiGian = Math.round((s.base / congChuan) * ngayCongThucTe);
        const tongPhuCap = (s.resp || 0) + (s.lunch || 0) + (s.phone || 0) + (s.fuel || 0) + (s.site || 0) + (s.housing || 0) + (s.child || 0);
        const luongOT = stats.totalOt * 150000;
        const tongThuNhap = luongThoiGian + tongPhuCap + luongOT;

        const bhxh = Math.round(s.base * 0.105);
        const union = Math.round(s.base * 0.01);
        const giamTruGiaCanh = 11000000;
        const thuNhapTinhThue = Math.max(0, tongThuNhap - bhxh - union - giamTruGiaCanh);

        let title = '', contentHtml = '';
        const f = (val) => window.erpApp.formatValue(val);

        if (type === 'bhxh') {
            title = 'Chi tiết Bảo hiểm xã hội (10.5%)';
            contentHtml = `
                <div style="background:#fef2f2; padding:20px; border-radius:16px; border:1px solid #fee2e2; margin-bottom:20px;">
                    <div style="font-size:14px; color:#991b1b; margin-bottom:10px; font-weight:700;">Công thức tính:</div>
                    <div style="font-size:18px; font-weight:700; color:#1e293b;">${f(s.base)} x 10.5% = ${f(bhxh)} đ</div>
                </div>
            `;
        } else if (type === 'union') {
            title = 'Chi tiết Kinh phí Công đoàn (1%)';
            contentHtml = `
                <div style="background:#fef2f2; padding:20px; border-radius:16px; border:1px solid #fee2e2; margin-bottom:20px;">
                    <div style="font-size:14px; color:#991b1b; margin-bottom:10px; font-weight:700;">Công thức tính:</div>
                    <div style="font-size:18px; font-weight:700; color:#1e293b;">${f(s.base)} x 1% = ${f(union)} đ</div>
                </div>
            `;
        } else if (type === 'tax') {
            title = 'Chi tiết Thuế TNCN';
            contentHtml = `
                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; padding:10px 15px; background:#f8fafc; border-radius:10px;">
                        <span style="color:#64748b;">Tổng thu nhập:</span>
                        <span style="font-weight:700;">${f(tongThuNhap)} đ</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:10px 15px; background:#fef2f2; border-radius:10px;">
                        <span style="color:#991b1b;">Các khoản giảm trừ (BH, Gia cảnh):</span>
                        <span style="font-weight:700; color:#ef4444;">- ${f(bhxh + union + giamTruGiaCanh)} đ</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:12px 15px; background:#eff6ff; border-radius:10px; border:1px dashed #3b82f6;">
                        <span style="color:#1e40af; font-weight:700;">Thu nhập tính thuế:</span>
                        <span style="font-weight:700; color:#1d4ed8;">${f(thuNhapTinhThue)} đ</span>
                    </div>
                </div>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:15px;">
                    <div style="font-size:12px; color:#64748b; margin-bottom:8px; font-weight:700; text-transform:uppercase;">Bậc thuế áp dụng:</div>
                    ${renderTaxBreakdown(thuNhapTinhThue)}
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'deductionDetailModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:500px; border-radius:24px;">
                <div class="modal-header" style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; padding:20px 24px;">
                    <h2 style="margin:0; font-size:18px; color:#0f172a; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#ef4444;">calculate</span> ${title}
                    </h2>
                    <button onclick="document.getElementById('deductionDetailModal').remove()" style="border:none;background:none;cursor:pointer;color:#64748b;"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="padding:24px;">
                    <div style="margin-bottom:15px; font-size:13px; color:#64748b;">Nhân viên: <strong>${emp.name}</strong></div>
                    ${contentHtml}
                </div>
                <div class="modal-footer" style="padding:15px 24px; background:#f8fafc; border-top:1px solid #e2e8f0;">
                    <button class="btn-cancel" onclick="document.getElementById('deductionDetailModal').remove()" style="width:100%; padding:12px; border-radius:12px;">Đóng cửa sổ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function renderTaxBreakdown(amount) {
        if (amount <= 0) { return '<div style="color:#10b981; font-weight:700;">Không phát sinh thuế TNCN</div>'; }
        const steps = [
            { limit: 5000000, rate: 0.05, sub: 0 },
            { limit: 10000000, rate: 0.1, sub: 250000 },
            { limit: 18000000, rate: 0.15, sub: 750000 },
            { limit: 32000000, rate: 0.2, sub: 1650000 },
            { limit: 52000000, rate: 0.25, sub: 3250000 },
            { limit: 80000000, rate: 0.3, sub: 5850000 },
            { limit: Infinity, rate: 0.35, sub: 9850000 }
        ];
        let currentStep = steps.find(s => amount <= s.limit) || steps[steps.length - 1];
        const f = (val) => window.erpApp.formatValue(val);
        return `
            <div style="font-size:14px; font-weight:700; color:#1e293b; margin-bottom:5px;">Bậc ${steps.indexOf(currentStep) + 1} (Thuế suất ${currentStep.rate * 100}%)</div>
            <div style="font-size:13px; color:#475569;">Cách tính: (${f(amount)} x ${currentStep.rate * 100}%) - ${f(currentStep.sub)} = <span style="color:#ef4444; font-weight:700;">${f(Math.round(amount * currentStep.rate - currentStep.sub))} đ</span></div>
        `;
    }

    function viewBenefitDetail(empId) {
        const emp = getEmployees().find(e => e.id === empId);
        if (!emp) return;
        const s = window.erpApp.getSalarySettings(empId);
        const total = (s.resp || 0) + (s.lunch || 0) + (s.phone || 0) + (s.fuel || 0) + (s.site || 0) + (s.housing || 0) + (s.child || 0);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'benefitDetailModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:550px; border-radius:24px; overflow:hidden;">
                <div class="modal-header" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color:#fff; padding:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:50px; height:50px; border-radius:15px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <span class="material-icons-outlined">account_circle</span>
                        </div>
                        <div>
                            <h2 style="margin:0; font-size:18px; font-weight:700;">Chi tiết Phúc lợi</h2>
                            <p style="margin:0; opacity:0.8; font-size:13px;">${emp.name} - ${emp.id}</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('benefitDetailModal').remove()" style="border:none;background:none;cursor:pointer;color:#fff; opacity:0.7; transition:0.2s;"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="padding:24px;">
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${[
                            { label: 'Phụ cấp trách nhiệm', val: s.resp },
                            { label: 'Phụ cấp ăn trưa', val: s.lunch },
                            { label: 'Phụ cấp điện thoại', val: s.phone },
                            { label: 'Phụ cấp xăng xe', val: s.fuel },
                            { label: 'Phụ cấp công trường', val: s.site },
                            { label: 'Phụ cấp nhà ở', val: s.housing },
                            { label: 'Phụ cấp nuôi con nhỏ', val: s.child }
                        ].map(item => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:12px;">
                                <span style="color:#475569; font-size:13px;">${item.label}</span>
                                <span style="font-weight:700; color:#1e293b; font-size:14px;">${window.erpApp.formatValue(item.val || 0)} đ</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:24px; padding:20px; background:linear-gradient(135deg, #be123c 0%, #9f1239 100%); border-radius:16px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:12px; opacity:0.8; text-transform:uppercase;">Tổng cộng phúc lợi</div>
                            <div style="font-size:24px; font-weight:800;">${window.erpApp.formatValue(total)} đ</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:center;">
                    <button class="btn-cancel" onclick="document.getElementById('benefitDetailModal').remove()" style="border-radius:12px; padding:10px 24px; width:100%">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function openSalaryModal(empId) {
        const emp = getEmployees().find(e => e.id === empId);
        if (!emp) return;
        const s = window.erpApp.getSalarySettings(empId);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'salaryModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:550px;">
                <div class="modal-header">
                    <div class="modal-title-area">
                        <span class="material-icons-outlined" style="color:var(--primary)">settings</span>
                        <div class="modal-title">Cấu hình lương & Phụ cấp</div>
                    </div>
                    <button class="modal-close" onclick="document.getElementById('salaryModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom:15px; padding:10px; background:#f8fafc; border-radius:10px; font-size:13px;">
                        Nhân viên: <strong>${emp.name}</strong> (${emp.id})
                    </div>
                    <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                        <div class="form-group">
                            <label>Lương chính (HĐLĐ)</label>
                            <input type="text" id="salBase" value="${window.erpApp.formatValue(s.base || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp trách nhiệm</label>
                            <input type="text" id="salResp" value="${window.erpApp.formatValue(s.resp || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp ăn trưa</label>
                            <input type="text" id="salLunch" value="${window.erpApp.formatValue(s.lunch || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp điện thoại</label>
                            <input type="text" id="salPhone" value="${window.erpApp.formatValue(s.phone || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp xăng xe</label>
                            <input type="text" id="salFuel" value="${window.erpApp.formatValue(s.fuel || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp công trường</label>
                            <input type="text" id="salSite" value="${window.erpApp.formatValue(s.site || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp nhà ở</label>
                            <input type="text" id="salHousing" value="${window.erpApp.formatValue(s.housing || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Phụ cấp nuôi con nhỏ</label>
                            <input type="text" id="salChild" value="${window.erpApp.formatValue(s.child || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Tạm ứng</label>
                            <input type="text" id="salAdvance" value="${window.erpApp.formatValue(s.advance || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                        <div class="form-group">
                            <label>Giảm trừ khác</label>
                            <input type="text" id="salOtherDeduct" value="${window.erpApp.formatValue(s.otherDeduct || 0)}" oninput="window.erpApp.formatSalaryInput(this)">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="document.getElementById('salaryModal').remove()">Hủy</button>
                    <button class="btn-save" onclick="window.erpApp.saveSalarySettings('${empId}')">Lưu thay đổi</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function saveSalarySettings(empId) {
        const base = parseSalaryValue('salBase');
        const resp = parseSalaryValue('salResp');
        const lunch = parseSalaryValue('salLunch');
        const phone = parseSalaryValue('salPhone');
        const fuel = parseSalaryValue('salFuel');
        const site = parseSalaryValue('salSite');
        const housing = parseSalaryValue('salHousing');
        const child = parseSalaryValue('salChild');
        const advance = parseSalaryValue('salAdvance');
        const otherDeduct = parseSalaryValue('salOtherDeduct');

        window.salarySettings[empId] = {
            base, resp, lunch, phone, fuel, site, housing, child, advance, otherDeduct,
            sunCoeff: window.salarySettings[empId]?.sunCoeff || 2.0
        };

        // FIXED: Using erp_salary_settings to match app.js and firebase-sync.js
        localStorage.setItem('erp_salary_settings', JSON.stringify(window.salarySettings));
        if (window.CrudSync) {
            window.CrudSync.saveItem('erp_salary_settings', { id: 'master_data', ...window.salarySettings }, 'id');
        }

        document.getElementById('salaryModal').remove();
        if (window.erpApp.breadcrumbCurrent && window.erpApp.breadcrumbCurrent.textContent === 'Bảng tính lương') renderBangLuong();
        else renderPhucLoi();
        
        window.erpApp.showToast('Đã lưu cấu hình lương thành công');
    }

    function printPayslip(empId) {
        const emp = getEmployees().find(e => e.id === empId);
        if (!emp) return;
        const s = window.erpApp.getSalarySettings(empId);
        const stats = window.erpApp.getAttendanceStats(empId, prCurrentYear, prCurrentMonth);

        const sunCoeff = s.sunCoeff || 2.0;
        const ngayCongThucTe = (parseFloat(stats.full) + parseFloat(stats.half) * 0.5) + (stats.sundayDays * sunCoeff);
        const congChuan = 26;
        const luongThoiGian = Math.round((s.base / congChuan) * ngayCongThucTe);
        const tongPhuCap = (s.resp || 0) + (s.lunch || 0) + (s.phone || 0) + (s.fuel || 0) + (s.site || 0) + (s.housing || 0) + (s.child || 0);
        const luongOT = stats.totalOt * 150000;
        const tongThuNhap = luongThoiGian + tongPhuCap + luongOT;

        const bhxh = Math.round(s.base * 0.08);
        const bhyt = Math.round(s.base * 0.015);
        const bhtn = Math.round(s.base * 0.01);
        const tongBH = bhxh + bhyt + bhtn;

        const bhxh_total = Math.round(s.base * 0.105);
        const congDoan = Math.round(s.base * 0.01);
        const thueTNCN = Math.round(calculateTNCN(Math.max(0, tongThuNhap - bhxh_total - congDoan - 11000000)));
        const tamUng = s.advance || 0;
        const tongGiamTru = tongBH + congDoan + thueTNCN + tamUng + (s.otherDeduct || 0);
        const thucLinh = tongThuNhap - tongGiamTru;

        const f = (v) => window.erpApp.formatValue(v);

        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Phiếu lương - ${emp.name}</title>
                <style>
                    body { font-family: "Times New Roman", Times, serif; padding: 20px; font-size: 13px; line-height: 1.4; }
                    .container { max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 20px; }
                    .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
                    .bg-gray { background: #f2f2f2; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div style="font-weight:bold; text-transform:uppercase;">CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH</div>
                    <div style="font-size:11px;">Địa chỉ: 643/22B Xô Viết Nghệ Tĩnh, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh</div>
                    <div style="font-size:11px; font-weight:bold; margin-top:2px;">MST: 0303204517</div>
                    <div class="title">PHIẾU THANH TOÁN TIỀN LƯƠNG</div>
                    <div style="text-align:center; margin-bottom:20px; font-style:italic;">Tháng ${prCurrentMonth + 1} năm ${prCurrentYear}</div>
                    
                    <table>
                        <tr>
                            <td width="15%" class="bold">Mã NV:</td><td width="35%">${emp.id}</td>
                            <td width="25%" class="bold">Lương chính:</td><td width="25%" class="text-right">${f(s.base)}</td>
                        </tr>
                        <tr>
                            <td class="bold">Họ tên:</td><td class="bold">${emp.name}</td>
                            <td class="bold">Ngày công thực tế:</td><td class="text-right">${ngayCongThucTe.toFixed(1)}</td>
                        </tr>
                    </table>

                    <table>
                        <tr class="bg-gray bold">
                            <th width="40%">Các khoản thu nhập</th><th width="20%">Số tiền</th>
                            <th width="40%">Các khoản trích trừ</th><th width="20%">Số tiền</th>
                        </tr>
                        <tr>
                            <td>1. Lương thời gian</td><td class="text-right">${f(luongThoiGian)}</td>
                            <td>1. Bảo hiểm (8% + 1.5% + 1%)</td><td class="text-right">${f(tongBH)}</td>
                        </tr>
                        <tr>
                            <td>2. Tổng phụ cấp</td><td class="text-right">${f(tongPhuCap)}</td>
                            <td>2. Kinh phí công đoàn (1%)</td><td class="text-right">${f(congDoan)}</td>
                        </tr>
                        <tr>
                            <td>3. Lương tăng ca (OT)</td><td class="text-right">${f(luongOT)}</td>
                            <td>3. Thuế TNCN</td><td class="text-right">${f(thueTNCN)}</td>
                        </tr>
                        <tr>
                            <td></td><td></td>
                            <td>4. Tạm ứng / Khác</td><td class="text-right">${f(tamUng + (s.otherDeduct || 0))}</td>
                        </tr>
                        <tr class="bold">
                            <td>TỔNG THU NHẬP</td><td class="text-right">${f(tongThuNhap)}</td>
                            <td>TỔNG GIẢM TRỪ</td><td class="text-right">${f(tongGiamTru)}</td>
                        </tr>
                    </table>

                    <div style="margin-top:20px; padding:10px; border:2px solid #000; text-align:center;">
                        <span style="font-size:16px; font-weight:bold;">THỰC LĨNH: ${f(thucLinh)} VNĐ</span>
                    </div>

                    <table style="border:none; margin-top:30px;">
                        <tr style="border:none;">
                            <td style="border:none; text-align:center;" width="50%"><strong>Người lập phiếu</strong><br><br><br><br></td>
                            <td style="border:none; text-align:center;" width="50%"><strong>Người nhận tiền</strong><br><br><br><br></td>
                        </tr>
                    </table>
                    
                    <div style="text-align:center; margin-top:20px;" class="no-print">
                        <button onclick="window.print()" style="padding:10px 30px; background:#3b82f6; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">IN PHIẾU LƯƠNG</button>
                    </div>
                </div>
            </body>
            </html>
        `);
        win.document.close();
    }

    function openPolicyModal() {
        const policy = window.companyPolicy || {};
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'policyModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3><span class="material-icons-outlined">verified_user</span> Chính sách & Chế độ đãi ngộ</h3>
                    <button class="modal-close" onclick="document.getElementById('policyModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="modal-body" style="padding:24px;">
                    <div style="margin-bottom:20px;">
                        <h4 style="color:#1e293b; margin-bottom:10px; display:flex; align-items:center; gap:8px;"><span class="material-icons-outlined" style="font-size:20px; color:#3b82f6;">info</span> Các khoản phụ cấp</h4>
                        <ul style="padding-left:20px; color:#475569; font-size:14px; line-height:1.8;">
                            ${(policy.allowances || []).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4 style="color:#1e293b; margin-bottom:10px; display:flex; align-items:center; gap:8px;"><span class="material-icons-outlined" style="font-size:20px; color:#10b981;">support</span> Hỗ trợ & Thưởng</h4>
                        <ul style="padding-left:20px; color:#475569; font-size:14px; line-height:1.8;">
                            ${(policy.supports || []).map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" style="width:100%" onclick="document.getElementById('policyModal').remove()">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // --- EXPORTS TO ERPAPP ---
    window.erpApp.renderBangLuong = renderBangLuong;
    window.erpApp.prPrevMonth = () => { if (prCurrentMonth === 0) { prCurrentMonth = 11; prCurrentYear--; } else { prCurrentMonth--; } renderBangLuong(); };
    window.erpApp.prNextMonth = () => { if (prCurrentMonth === 11) { prCurrentMonth = 0; prCurrentYear++; } else { prCurrentMonth++; } renderBangLuong(); };
    window.erpApp.prSearch = (q) => { prSearchQuery = q; renderBangLuong(); };
    window.erpApp.viewDeductionDetail = viewDeductionDetail;
    window.erpApp.openSalaryModal = openSalaryModal;
    window.erpApp.saveSalarySettings = saveSalarySettings;
    window.erpApp.printPayslip = printPayslip;

    window.erpApp.renderPhucLoi = renderPhucLoi;
    window.erpApp.plPrevMonth = () => { if (plCurrentMonth === 0) { plCurrentMonth = 11; plCurrentYear--; } else { plCurrentMonth--; } renderPhucLoi(); };
    window.erpApp.plNextMonth = () => { if (plCurrentMonth === 11) { plCurrentMonth = 0; plCurrentYear++; } else { plCurrentMonth++; } renderPhucLoi(); };
    window.erpApp.plSearch = (q) => { plSearchQuery = q; renderPhucLoi(); };
    window.erpApp.viewBenefitDetail = viewBenefitDetail;
    window.erpApp.openPolicyModal = openPolicyModal;
    window.erpApp.exportPayrollToExcel = () => {
        try {
            const employees = getEmployees();
            if (!employees || employees.length === 0) {
                window.erpApp.showToast('Không có dữ liệu nhân viên để xuất.', 'error');
                return;
            }

            const payrollData = employees.map(emp => {
                const settings = window.erpApp.getSalarySettings(emp.id) || {};
                const stats = window.erpApp.getAttendanceStats(emp.id, prCurrentYear, prCurrentMonth) || { full: 0, half: 0, sundayDays: 0, totalOt: 0, workingDays: 26 };
                const sunCoeff = settings.sunCoeff || 2.0;
                const ngayCongThucTe = (parseFloat(stats.full || 0) + parseFloat(stats.half || 0) * 0.5) + (stats.sundayDays * sunCoeff);
                const congChuan = 26;
                const luongThoiGian = Math.round(((settings.base || 0) / congChuan) * ngayCongThucTe);
                const tongPhuCap = (settings.resp || 0) + (settings.lunch || 0) + (settings.phone || 0) + (settings.fuel || 0) + (settings.site || 0) + (settings.housing || 0) + (settings.child || 0);
                const luongOT = (stats.totalOt || 0) * 150000;
                const tongThuNhap = luongThoiGian + tongPhuCap + luongOT;
                const bhxh = Math.round((settings.base || 0) * 0.105);
                const congDoan = Math.round((settings.base || 0) * 0.01);
                const thuNhapTinhThue = Math.max(0, tongThuNhap - bhxh - congDoan - 11000000);
                const thueTNCN = Math.round(calculateTNCN(thuNhapTinhThue));
                const tamUng = settings.advance || 0;
                const giamTruKhac = settings.otherDeduct || 0;
                const tongGiamTru = bhxh + congDoan + thueTNCN + tamUng + giamTruKhac;
                const thucLinh = tongThuNhap - tongGiamTru;

                return [
                    emp.id, emp.name, emp.department, 
                    ngayCongThucTe, settings.base || 0, luongThoiGian,
                    settings.resp || 0, settings.lunch || 0, settings.phone || 0, settings.fuel || 0, settings.site || 0, settings.housing || 0, settings.child || 0,
                    bhxh, congDoan, thueTNCN, tamUng, giamTruKhac, thucLinh
                ];
            });

            const headerRows = [
                ['CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH'],
                ['BẢNG THANH TOÁN TIỀN LƯƠNG'],
                [`Tháng ${prCurrentMonth + 1} năm ${prCurrentYear}`],
                [],
                ['Mã NV', 'Họ tên', 'Bộ phận', 'Công thực tế', 'Lương chính', 'Lương TG', 'PC Trách nhiệm', 'PC Ăn trưa', 'PC Điện thoại', 'PC Xăng xe', 'PC Công trường', 'PC Nhà ở', 'PC Nuôi con', 'BHXH (10.5%)', 'Công đoàn (1%)', 'Thuế TNCN', 'Tạm ứng', 'Giảm trừ khác', 'Thực lĩnh']
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(headerRows.concat(payrollData));

            // Column widths
            ws['!cols'] = [
                { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'BangLuong');
            const fileName = `Bang_luong_thang_${prCurrentMonth + 1}_${prCurrentYear}.xlsx`;
            XLSX.writeFile(wb, fileName);
            window.erpApp.showToast('Đã xuất file Excel thành công!', 'success');
        } catch (err) {
            console.error('Excel Export Error:', err);
            window.erpApp.showToast('Lỗi khi xuất Excel: ' + err.message, 'error');
        }
    };

})();
