(function () {
    // ==========================================
    // MODULE: Sổ Cái Tổng Hợp (General Ledger)
    // ==========================================
    let glEntries = [
        { id: 'PK-2026-04-001', date: '2026-04-01', accountCode: '1111', accountName: 'Tiền mặt', desc: 'Rút tiền gửi ngân hàng về nhập quỹ', debit: 50000000, credit: 0, ref: 'BN-001' },
        { id: 'PK-2026-04-001', date: '2026-04-01', accountCode: '1121', accountName: 'Tiền gửi ngân hàng', desc: 'Rút tiền gửi ngân hàng về nhập quỹ', debit: 0, credit: 50000000, ref: 'BN-001' },
        { id: 'PK-2026-04-002', date: '2026-04-02', accountCode: '152', accountName: 'Nguyên liệu, vật liệu', desc: 'Mua gỗ Walnut nhập kho', debit: 120000000, credit: 0, ref: 'PN-102' },
        { id: 'PK-2026-04-002', date: '2026-04-02', accountCode: '331', accountName: 'Phải trả người bán', desc: 'Mua gỗ Walnut nhập kho', debit: 0, credit: 120000000, ref: 'PN-102' },
        { id: 'PK-2026-04-003', date: '2026-04-05', accountCode: '642', accountName: 'Chi phí quản lý doanh nghiệp', desc: 'Thanh toán tiền điện văn phòng', debit: 4500000, credit: 0, ref: 'PC-045' },
        { id: 'PK-2026-04-003', date: '2026-04-05', accountCode: '1111', accountName: 'Tiền mặt', desc: 'Thanh toán tiền điện văn phòng', debit: 0, credit: 4500000, ref: 'PC-045' },
        { id: 'PK-2026-04-004', date: '2026-04-10', accountCode: '1111', accountName: 'Tiền mặt', desc: 'Thu tiền bán hàng trực tiếp', debit: 15000000, credit: 0, ref: 'PT-001' },
        { id: 'PK-2026-04-004', date: '2026-04-10', accountCode: '511', accountName: 'Doanh thu bán hàng', desc: 'Thu tiền bán hàng trực tiếp', debit: 0, credit: 15000000, ref: 'PT-001' }
    ];

    let glAccounts = [
        // Loại 1: Tài sản
        { code: '1111', name: 'Tiền mặt', opening: 100000000 },
        { code: '1121', name: 'Tiền gửi ngân hàng', opening: 500000000 },
        { code: '131', name: 'Phải thu của khách hàng', opening: 1845998294 },
        { code: '133', name: 'Thuế GTGT được khấu trừ', opening: 0 },
        { code: '141', name: 'Tạm ứng (nhân viên, công trường)', opening: 20300697903 },
        { code: '152', name: 'Nguyên liệu, vật liệu', opening: 200000000 },
        { code: '153', name: 'Công cụ, dụng cụ', opening: 50000000 },
        { code: '154', name: 'Chi phí SXKD dở dang (Công trình)', opening: 1676828412 },
        // Loại 2: Tài sản dài hạn
        { code: '211', name: 'TSCĐ hữu hình (Máy móc, thiết bị)', opening: 29143847019 },
        { code: '214', name: 'Hao mòn TSCĐ lũy kế', opening: -18428110633 },
        // Loại 3: Nợ phải trả
        { code: '331', name: 'Phải trả cho người bán (NCC/Thầu phụ)', opening: 12265067640 },
        { code: '3331', name: 'Thuế GTGT phải nộp', opening: 132938866 },
        { code: '334', name: 'Phải trả người lao động', opening: 0 },
        { code: '341', name: 'Vay và nợ thuê tài chính', opening: 140000000 },
        // Loại 4: Vốn chủ sở hữu
        { code: '411', name: 'Vốn đầu tư của chủ sở hữu', opening: 20000000000 },
        { code: '421', name: 'Lợi nhuận sau thuế chưa phân phối', opening: -694854265 },
        // Loại 5: Doanh thu
        { code: '511', name: 'Doanh thu bán hàng & cung cấp dịch vụ', opening: 0 },
        { code: '515', name: 'Doanh thu hoạt động tài chính', opening: 0 },
        // Loại 6: Chi phí
        { code: '621', name: 'Chi phí nguyên vật liệu trực tiếp', opening: 0 },
        { code: '622', name: 'Chi phí nhân công trực tiếp', opening: 0 },
        { code: '623', name: 'Chi phí sử dụng máy thi công', opening: 0 },
        { code: '627', name: 'Chi phí sản xuất chung', opening: 0 },
        { code: '632', name: 'Giá vốn hàng bán (Giá vốn công trình)', opening: 0 },
        { code: '642', name: 'Chi phí quản lý doanh nghiệp', opening: 0 },
        { code: '635', name: 'Chi phí tài chính', opening: 0 },
        { code: '811', name: 'Chi phí khác', opening: 0 }
    ];

    let currentAccount = '1111';
    let filterStart = '2026-04-01';
    let filterEnd = '2026-04-30';

    // Load persisted data
    try {
        const savedEntries = localStorage.getItem('erp_gl_entries');
        if (savedEntries) {glEntries = JSON.parse(savedEntries);}
        
        const savedAccounts = localStorage.getItem('erp_gl_accounts');
        if (savedAccounts) {glAccounts = JSON.parse(savedAccounts);}
    } catch (e) {
        console.error('Lỗi load General Ledger Data:', e);
    }

    function saveGLAccounts() {
        localStorage.setItem('erp_gl_accounts', JSON.stringify(glAccounts));
        if (window.CrudSync) {
            window.CrudSync.saveItems('erp_gl_accounts', glAccounts, 'code');
        }
    }

    function renderGeneralLedger() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Sổ Cái tổng hợp';}
        if (pageBadge) {pageBadge.textContent = 'Kế toán';}

        const accInfo = glAccounts.find(a => a.code === currentAccount);
        const f = (v) => window.erpApp.formatValue(v);

        // 1. Tính số dư đầu kỳ (Trước ngày filterStart)
        const entriesBefore = glEntries.filter(e => e.accountCode === currentAccount && e.date < filterStart);
        let openingBalance = (accInfo ? accInfo.opening : 0);
        entriesBefore.forEach(e => {
            openingBalance += (e.debit - e.credit);
        });

        // 2. Lấy nghiệp vụ trong kỳ
        const entriesInPeriod = glEntries.filter(e => e.accountCode === currentAccount && e.date >= filterStart && e.date <= filterEnd);

        // 3. Tìm tài khoản đối ứng
        const processedEntries = entriesInPeriod.map(e => {
            const reciprocal = glEntries.find(other => other.id === e.id && other.accountCode !== e.accountCode);
            return {
                ...e,
                reciprocalCode: reciprocal ? reciprocal.accountCode : '-'
            };
        });

        // 4. Tính tổng phát sinh và số dư cuối kỳ
        const totalDebit = processedEntries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = processedEntries.reduce((sum, e) => sum + e.credit, 0);
        const closingBalance = openingBalance + totalDebit - totalCredit;

        const html = `
            <div class="gl-module" style="animation: fadeIn 0.4s ease-out; font-family: 'Inter', sans-serif;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="background:#f1f5f9; border:none; padding:8px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:8px; font-weight:700; color:#475569;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Sổ Cái Tổng Hợp</h2>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.print()" style="padding:10px 20px; background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; color:#475569; display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <span class="material-icons-outlined">print</span> In sổ cái
                        </button>
                        <button onclick="window.erpApp.openAddGLEntryModal()" style="padding:10px 20px; background:#3b82f6; color:#fff; border:none; border-radius:12px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 6px -1px rgba(59, 130, 246, 0.2);">
                            <span class="material-icons-outlined">add</span> Lập phiếu
                        </button>
                    </div>
                </div>

                <!-- Bộ lọc Sổ Cái -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns: 2fr 1fr 1fr 0.5fr; gap:16px; align-items:end;">
                    <div>
                        <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Chọn Tài khoản</label>
                        <select onchange="window.erpApp.glUpdateAccount(this.value)" style="width:100%; padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; outline:none;">
                            ${glAccounts.map(acc => `<option value="${acc.code}" ${acc.code === currentAccount ? 'selected' : ''}>${acc.code} - ${acc.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Từ ngày</label>
                        <input type="date" value="${filterStart}" onchange="window.erpApp.glUpdateDate('start', this.value)" style="width:100%; padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:600; outline:none;">
                    </div>
                    <div>
                        <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Đến ngày</label>
                        <input type="date" value="${filterEnd}" onchange="window.erpApp.glUpdateDate('end', this.value)" style="width:100%; padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:600; outline:none;">
                    </div>
                    <button onclick="window.erpApp.renderGeneralLedger()" style="padding:10px; background:#f1f5f9; border:none; border-radius:10px; color:#3b82f6; cursor:pointer;">
                        <span class="material-icons-outlined">refresh</span>
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:32px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05); overflow:hidden;">
                    <div style="text-align:center; margin-bottom:32px;">
                        <h1 style="margin:0; font-size:24px; font-weight:900; color:#1e293b; text-transform:uppercase;">SỔ CÁI</h1>
                        <p style="margin:8px 0; font-weight:700; color:#475569; font-size:16px;">Tài khoản: ${currentAccount} - ${accInfo ? accInfo.name : ''}</p>
                        <p style="margin:0; font-size:13px; color:#94a3b8; font-weight:600;">Kỳ kế toán: ${new Date(filterStart).toLocaleDateString('vi-VN')} - ${new Date(filterEnd).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:13px;">
                            <thead>
                                <tr style="background:#f8fafc; border-top:2px solid #1e293b; border-bottom:2px solid #1e293b;">
                                    <th rowspan="2" style="padding:12px; border:1px solid #e2e8f0; width:100px;">Ngày ghi sổ</th>
                                    <th colspan="2" style="padding:12px; border:1px solid #e2e8f0;">Chứng từ</th>
                                    <th rowspan="2" style="padding:12px; border:1px solid #e2e8f0;">Diễn giải</th>
                                    <th rowspan="2" style="padding:12px; border:1px solid #e2e8f0; width:80px;">TK Đối ứng</th>
                                    <th colspan="2" style="padding:12px; border:1px solid #e2e8f0; width:300px;">Số tiền</th>
                                </tr>
                                <tr style="background:#f8fafc; border-bottom:1px solid #1e293b;">
                                    <th style="padding:10px; border:1px solid #e2e8f0; width:120px;">Số hiệu</th>
                                    <th style="padding:10px; border:1px solid #e2e8f0; width:100px;">Ngày</th>
                                    <th style="padding:10px; border:1px solid #e2e8f0; text-align:right;">Ghi Nợ</th>
                                    <th style="padding:10px; border:1px solid #e2e8f0; text-align:right;">Ghi Có</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Số dư đầu kỳ -->
                                <tr style="background:#fff7ed; font-weight:800; cursor:pointer;" onclick="window.erpApp.openEditOpeningBalanceModal('${currentAccount}')" title="Kích vào đây để cập nhật số dư khai báo ban đầu">
                                    <td colspan="5" style="padding:12px; border:1px solid #e2e8f0; text-align:left;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            SỐ DƯ ĐẦU KỲ
                                            <span class="material-icons-outlined" style="font-size:16px; color:#f59e0b;">edit</span>
                                        </div>
                                    </td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right; color:#1e293b;">${openingBalance >= 0 ? f(openingBalance) : '-'}</td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right; color:#ef4444;">${openingBalance < 0 ? f(Math.abs(openingBalance)) : '-'}</td>
                                </tr>
                                
                                <!-- Phát sinh trong kỳ -->
                                ${processedEntries.length > 0 ? processedEntries.map(e => `
                                    <tr style="border-bottom:1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; text-align:center;">${e.date}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; font-weight:800; color:#3b82f6; cursor:pointer;" onclick="window.erpApp.viewGLEntryDetail('${e.id}')">${e.id}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; text-align:center;">${e.date}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; font-weight:600; color:#475569;">${e.desc}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; text-align:center; font-weight:800; color:#6366f1;">${e.reciprocalCode}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; text-align:right; font-weight:700;">${e.debit > 0 ? f(e.debit) : '-'}</td>
                                        <td style="padding:14px 10px; border:1px solid #e2e8f0; text-align:right; font-weight:700; color:#ef4444;">${e.credit > 0 ? f(e.credit) : '-'}</td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="7" style="padding:40px; text-align:center; color:#94a3b8; font-style:italic; border:1px solid #e2e8f0;">Không có nghiệp vụ phát sinh trong kỳ</td>
                                    </tr>
                                `}

                                <!-- Tổng phát sinh -->
                                <tr style="background:#f1f5f9; font-weight:900; color:#1e293b;">
                                    <td colspan="5" style="padding:12px; border:1px solid #e2e8f0; text-align:left;">CỘNG PHÁT SINH TRONG KỲ</td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right;">${f(totalDebit)}</td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right; color:#ef4444;">${f(totalCredit)}</td>
                                </tr>

                                <!-- Số dư cuối kỳ -->
                                <tr style="background:#eff6ff; font-weight:900; color:#1e293b;">
                                    <td colspan="5" style="padding:12px; border:1px solid #e2e8f0; text-align:left;">SỐ DƯ CUỐI KỲ</td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right; color:#2563eb;">${closingBalance >= 0 ? f(closingBalance) : '-'}</td>
                                    <td style="padding:12px; border:1px solid #e2e8f0; text-align:right; color:#ef4444;">${closingBalance < 0 ? f(Math.abs(closingBalance)) : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    }

    function glUpdateAccount(code) {
        currentAccount = code;
        renderGeneralLedger();
    }

    function glUpdateDate(type, val) {
        if (type === 'start') {filterStart = val;}
        else {filterEnd = val;}
        renderGeneralLedger();
    }

    function viewGLEntryDetail(id) {
        const entry = glEntries.find(e => e.id === id);
        if (!entry) {return;}

        const modalHtml = `
            <div id="glDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1000; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:550px; border-radius:32px; padding:40px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                        <div>
                            <h2 style="margin:0; font-size:24px; font-weight:900; color:#1e293b;">Chi Tiết Phiếu Kế Toán</h2>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#94a3b8; font-weight:600;">Mã chứng từ: ${entry.id}</p>
                        </div>
                        <button onclick="document.getElementById('glDetailModal').remove()" style="background:#f1f5f9; border:none; cursor:pointer; color:#64748b; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>

                    <div style="display:grid; gap:20px; background:#f8fafc; padding:24px; border-radius:24px; border:1px solid #f1f5f9; margin-bottom:32px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase;">Ngày hạch toán</span>
                            <span style="color:#1e293b; font-weight:800;">${entry.date}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase;">Tài khoản</span>
                            <span style="color:#3b82f6; font-weight:900;">${entry.accountCode} - ${entry.accountName}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase;">Chứng từ gốc</span>
                            <span style="color:#1e293b; font-weight:800;">${entry.ref || '-'}</span>
                        </div>
                        <div style="border-top:1px solid #e2e8f0; padding-top:16px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase; display:block; margin-bottom:8px;">Diễn giải</span>
                            <span style="color:#475569; font-weight:600; line-height:1.5;">${entry.desc}</span>
                        </div>
                    </div>

                    <div style="display:flex; gap:16px;">
                        <button onclick="window.erpApp.openEditGLEntryModal('${entry.id}')" style="flex:1; padding:16px; background:#1e293b; color:#fff; border:none; border-radius:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;">
                            <span class="material-icons-outlined">edit</span> Hiệu chỉnh phiếu
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function openEditGLEntryModal(id) {
        const entry = glEntries.find(e => e.id === id);
        if (!entry) {return;}

        const detail = document.getElementById('glDetailModal');
        if (detail) {detail.remove();}

        const modalHtml = `
            <div id="glEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:32px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hiệu chỉnh Phiếu kế toán</h2>
                        <button onclick="document.getElementById('glEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Diễn giải giao dịch</label>
                            <input type="text" id="edit_gl_desc" value="${entry.desc}" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:600; color:#1e293b;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số tiền Nợ</label>
                                <input type="text" id="edit_gl_debit" value="${window.erpApp.formatValue(entry.debit)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số tiền Có</label>
                                <input type="text" id="edit_gl_credit" value="${window.erpApp.formatValue(entry.credit)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:800; color:#ef4444;">
                            </div>
                        </div>
                        <div style="margin-top:12px;">
                            <button onclick="window.erpApp.saveGLEntry('${entry.id}', '${entry.accountCode}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer;">
                                Lưu thay đổi hạch toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveGLEntry(id, accCode) {
        const desc = document.getElementById('edit_gl_desc').value;
        const debit = window.erpApp.parseVND(document.getElementById('edit_gl_debit').value);
        const credit = window.erpApp.parseVND(document.getElementById('edit_gl_credit').value);

        const idx = glEntries.findIndex(e => e.id === id && e.accountCode === accCode);
        if (idx !== -1) {
            glEntries[idx] = { ...glEntries[idx], desc, debit, credit };
            localStorage.setItem('erp_gl_entries', JSON.stringify(glEntries));
            if (window.CrudSync) {window.CrudSync.saveItem('erp_gl_entries', glEntries[idx], 'id');}
            
            document.getElementById('glEditModal').remove();
            renderGeneralLedger();
            if (window.erpApp.showToast) {window.erpApp.showToast('Đã lưu chứng từ thành công');}
        }
    }

    window.erpApp.renderGeneralLedger = renderGeneralLedger;
    window.erpApp.viewGLEntryDetail = viewGLEntryDetail;
    window.erpApp.openEditGLEntryModal = openEditGLEntryModal;
    window.erpApp.saveGLEntry = saveGLEntry;
    window.erpApp.glUpdateAccount = glUpdateAccount;
    window.erpApp.glUpdateDate = glUpdateDate;
    window.erpApp.openAddGLEntryModal = function() {
        const today = new Date().toISOString().split('T')[0];
        const modalHtml = `
            <div id="glAddModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:550px; border-radius:32px; padding:32px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Lập Phiếu Kế Toán Mới</h2>
                        <button onclick="document.getElementById('glAddModal').remove()" style="background:#f1f5f9; border:none; cursor:pointer; color:#64748b; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    
                    <div style="display:grid; gap:20px;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Ngày hạch toán</label>
                                <input type="date" id="add_gl_date" value="${today}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Chứng từ gốc (Số hiệu)</label>
                                <input type="text" id="add_gl_ref" placeholder="VD: PN-001, PC-045..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none;">
                            </div>
                        </div>

                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Diễn giải nghiệp vụ</label>
                            <input type="text" id="add_gl_desc" placeholder="Nhập tóm tắt nội dung nghiệp vụ..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none;">
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Tài khoản Nợ</label>
                                <select id="add_gl_debit_acc" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; outline:none;">
                                    <option value="">-- Chọn tài khoản --</option>
                                    ${glAccounts.map(acc => `<option value="${acc.code}">${acc.code} - ${acc.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Tài khoản Có</label>
                                <select id="add_gl_credit_acc" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; outline:none;">
                                    <option value="">-- Chọn tài khoản --</option>
                                    ${glAccounts.map(acc => `<option value="${acc.code}">${acc.code} - ${acc.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số tiền giao dịch</label>
                            <input type="text" id="add_gl_amount" oninput="window.erpApp.formatNumberInput(this)" placeholder="0" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:900; font-size:18px; color:#2563eb; outline:none;">
                        </div>

                        <div style="margin-top:12px; display:flex; gap:12px;">
                            <button onclick="document.getElementById('glAddModal').remove()" style="flex:1; padding:16px; background:#f1f5f9; color:#475569; border:none; border-radius:16px; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveNewGLEntry()" style="flex:2; padding:16px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.3);">Lưu & Hạch toán</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveNewGLEntry = function() {
        const date = document.getElementById('add_gl_date').value;
        const ref = document.getElementById('add_gl_ref').value;
        const desc = document.getElementById('add_gl_desc').value;
        const debitAcc = document.getElementById('add_gl_debit_acc').value;
        const creditAcc = document.getElementById('add_gl_credit_acc').value;
        const amount = window.erpApp.parseVND(document.getElementById('add_gl_amount').value);

        if (!date || !desc || !debitAcc || !creditAcc || amount <= 0) {
            if (window.erpApp.showToast) {window.erpApp.showToast('Vui lòng nhập đầy đủ thông tin và số tiền hợp lệ', 'error');}
            return;
        }

        if (debitAcc === creditAcc) {
            if (window.erpApp.showToast) {window.erpApp.showToast('Tài khoản Nợ và Có không được trùng nhau', 'warning');}
            return;
        }

        // Tạo mã ID mới: PK-YYYY-MM-XXX
        const prefix = `PK-${date.substring(0, 7)}-`;
        const existingInMonth = glEntries.filter(e => e.id.startsWith(prefix));
        const maxId = existingInMonth.reduce((max, e) => {
            const parts = e.id.split('-');
            const num = parts.length === 4 ? parseInt(parts[3]) : 0;
            return num > max ? num : max;
        }, 0);
        const newId = `${prefix}${(maxId + 1).toString().padStart(3, '0')}`;

        const debitAccInfo = glAccounts.find(a => a.code === debitAcc);
        const creditAccInfo = glAccounts.find(a => a.code === creditAcc);

        // Thêm 2 dòng bút toán
        const debitEntry = {
            id: newId,
            date: date,
            accountCode: debitAcc,
            accountName: debitAccInfo ? debitAccInfo.name : 'Tài khoản',
            desc: desc,
            debit: amount,
            credit: 0,
            ref: ref
        };

        const creditEntry = {
            id: newId,
            date: date,
            accountCode: creditAcc,
            accountName: creditAccInfo ? creditAccInfo.name : 'Tài khoản',
            desc: desc,
            debit: 0,
            credit: amount,
            ref: ref
        };

        glEntries.unshift(creditEntry);
        glEntries.unshift(debitEntry);

        localStorage.setItem('erp_gl_entries', JSON.stringify(glEntries));
        
        if (window.CrudSync) {
            window.CrudSync.saveItem('erp_gl_entries', debitEntry, 'id');
            window.CrudSync.saveItem('erp_gl_entries', creditEntry, 'id');
        }
        
        document.getElementById('glAddModal').remove();
        renderGeneralLedger();
        if (window.erpApp.showToast) {window.erpApp.showToast('Đã hạch toán thành công', 'success');}
    };

    // --- NEW: Edit Opening Balance ---
    window.erpApp.openEditOpeningBalanceModal = function(code) {
        const acc = glAccounts.find(a => a.code === code);
        if (!acc) {return;}

        const modalHtml = `
            <div id="openingBalanceModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:1002; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);">
                <div class="modal-content" style="width:400px; border-radius:24px; padding:32px; background:#fff; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
                    <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:900; color:#1e293b;">Cập nhật Số dư khai báo</h3>
                    <p style="margin:0 0 20px 0; font-size:13px; color:#64748b; font-weight:500;">Tài khoản: ${acc.code} - ${acc.name}</p>
                    
                    <div style="margin-bottom:20px;">
                        <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số dư khai báo ban đầu (VNĐ)</label>
                        <input type="text" id="newOpeningBalance" value="${window.erpApp.formatValue(acc.opening)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:900; font-size:18px; color:#1e293b; outline:none;">
                        <p style="margin:8px 0 0 0; font-size:11px; color:#ef4444; font-style:italic;">* Lưu ý: Đây là số dư gốc tại thời điểm bắt đầu sử dụng phần mềm.</p>
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button onclick="document.getElementById('openingBalanceModal').remove()" style="flex:1; padding:12px; background:#f1f5f9; color:#475569; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Hủy</button>
                        <button onclick="window.erpApp.saveOpeningBalance('${code}')" style="flex:1; padding:12px; background:#3b82f6; color:#fff; border:none; border-radius:12px; font-weight:800; cursor:pointer;">Cập nhật</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveOpeningBalance = function(code) {
        const newVal = window.erpApp.parseVND(document.getElementById('newOpeningBalance').value);
        const idx = glAccounts.findIndex(a => a.code === code);
        if (idx !== -1) {
            glAccounts[idx].opening = newVal;
            saveGLAccounts();
            document.getElementById('openingBalanceModal').remove();
            renderGeneralLedger();
            if (window.erpApp.showToast) {window.erpApp.showToast('Đã cập nhật số dư khai báo', 'success');}
        }
    };

})();
