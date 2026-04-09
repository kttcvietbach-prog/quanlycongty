(function () {
    // ==========================================
    // MODULE: Sổ Cái Tổng Hợp (General Ledger)
    // ==========================================
    let glEntries = [
        { id: 'PK-2026-0001', date: '2026-04-01', accountCode: '1111', accountName: 'Tiền mặt', desc: 'Rút tiền gửi ngân hàng về nhập quỹ', debit: 50000000, credit: 0, ref: 'BN-001' },
        { id: 'PK-2026-0002', date: '2026-04-01', accountCode: '1121', accountName: 'Tiền gửi ngân hàng', desc: 'Rút tiền gửi ngân hàng về nhập quỹ', debit: 0, credit: 50000000, ref: 'BN-001' },
        { id: 'PK-2026-0003', date: '2026-04-02', accountCode: '152', accountName: 'Nguyên liệu, vật liệu', desc: 'Mua gỗ Walnut nhập kho', debit: 120000000, credit: 0, ref: 'PN-102' },
        { id: 'PK-2026-0004', date: '2026-04-02', accountCode: '331', accountName: 'Phải trả người bán', desc: 'Mua gỗ Walnut nhập kho', debit: 0, credit: 120000000, ref: 'PN-102' },
        { id: 'PK-2026-0005', date: '2026-04-05', accountCode: '642', accountName: 'Chi phí quản lý doanh nghiệp', desc: 'Thanh toán tiền điện văn phòng', debit: 4500000, credit: 0, ref: 'PC-045' },
        { id: 'PK-2026-0006', date: '2026-04-05', accountCode: '1111', accountName: 'Tiền mặt', desc: 'Thanh toán tiền điện văn phòng', debit: 0, credit: 4500000, ref: 'PC-045' }
    ];

    try {
        const saved = localStorage.getItem('erp_gl_entries');
        if (saved) glEntries = JSON.parse(saved);
    } catch (e) {
        console.error('Lỗi load General Ledger:', e);
    }

    function renderGeneralLedger() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Sổ Cái tổng hợp';
        if (pageBadge) pageBadge.textContent = 'Kế toán';

        const fmt = new Intl.NumberFormat('vi-VN');

        const html = `
            <div class="gl-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Sổ Cái Tổng Hợp</h2>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.openAddGLEntryModal()" style="padding:12px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                            <span class="material-icons-outlined">add</span> Lập phiếu kế toán
                        </button>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:1000px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:120px;">NGÀY</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:150px;">SỐ CHỨNG TỪ</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:100px;">TÀI KHOẢN</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8;">DIỄN GIẢI</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right; width:150px;">NỢ</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right; width:150px;">CÓ</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; width:80px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${glEntries.map(entry => `
                                    <tr style="border-bottom:1px solid #f8fafc; transition: background 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 12px; font-weight:700; color:#475569;">${entry.date}</td>
                                        <td style="padding:16px 12px; font-weight:800; color:#1e293b;">${entry.id}</td>
                                        <td style="padding:16px 12px; font-weight:700; color:#3b82f6;">${entry.accountCode}</td>
                                        <td style="padding:16px 12px; font-weight:600; color:#475569;">${entry.desc}</td>
                                        <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right;">${entry.debit > 0 ? fmt.format(entry.debit) : '-'}</td>
                                        <td style="padding:16px 12px; font-weight:800; color:#ef4444; text-align:right;">${entry.credit > 0 ? fmt.format(entry.credit) : '-'}</td>
                                        <td style="padding:16px 12px; text-align:right;">
                                            <button onclick="window.erpApp.viewGLEntryDetail('${entry.id}')" style="background:none; border:none; color:#94a3b8; cursor:pointer;" title="Xem chi tiết">
                                                <span class="material-icons-outlined">visibility</span>
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
        if (pageContent) pageContent.innerHTML = html;
    }

    function viewGLEntryDetail(id) {
        const entry = glEntries.find(e => e.id === id);
        if (!entry) return;

        const fmt = new Intl.NumberFormat('vi-VN');
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
                            <span style="color:#1e293b; font-weight:800;">${entry.ref}</span>
                        </div>
                        <div style="border-top:1px solid #e2e8f0; padding-top:16px;">
                            <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase; display:block; margin-bottom:8px;">Diễn giải</span>
                            <span style="color:#475569; font-weight:600; line-height:1.5;">${entry.desc}</span>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-top:1px solid #e2e8f0; padding-top:16px;">
                            <div>
                                <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase;">Số tiền Nợ</span>
                                <div style="font-size:20px; font-weight:900; color:${entry.debit > 0 ? '#1e293b' : '#cbd5e1'}; margin-top:4px;">${entry.debit > 0 ? fmt.format(entry.debit) + ' đ' : '-'}</div>
                            </div>
                            <div style="text-align:right;">
                                <span style="color:#94a3b8; font-weight:800; font-size:12px; text-transform:uppercase;">Số tiền Có</span>
                                <div style="font-size:20px; font-weight:900; color:${entry.credit > 0 ? '#ef4444' : '#cbd5e1'}; margin-top:4px;">${entry.credit > 0 ? fmt.format(entry.credit) + ' đ' : '-'}</div>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; gap:16px;">
                        <button onclick="window.erpApp.openEditGLEntryModal('${entry.id}')" style="flex:1; padding:16px; background:#1e293b; color:#fff; border:none; border-radius:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
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
        if (!entry) return;

        const detail = document.getElementById('glDetailModal');
        if (detail) detail.remove();

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
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số tiền Nợ (GL)</label>
                                <input type="text" id="edit_gl_debit" value="${new Intl.NumberFormat('vi-VN').format(entry.debit)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Số tiền Có (GL)</label>
                                <input type="text" id="edit_gl_credit" value="${new Intl.NumberFormat('vi-VN').format(entry.credit)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:800; color:#ef4444;">
                            </div>
                        </div>
                        <div style="margin-top:12px;">
                            <button onclick="window.erpApp.saveGLEntry('${entry.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                                Lưu thay đổi hạch toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function saveGLEntry(id) {
        const desc = document.getElementById('edit_gl_desc').value;
        const debit = window.erpApp.parseVND(document.getElementById('edit_gl_debit').value);
        const credit = window.erpApp.parseVND(document.getElementById('edit_gl_credit').value);

        const idx = glEntries.findIndex(e => e.id === id);
        if (idx !== -1) {
            glEntries[idx] = { ...glEntries[idx], desc, debit, credit };
            localStorage.setItem('erp_gl_entries', JSON.stringify(glEntries));
            document.getElementById('glEditModal').remove();
            renderGeneralLedger();
            if (typeof showToast === 'function') showToast('Đã lưu chứng từ thành công');
        }
    }

    window.erpApp.renderGeneralLedger = renderGeneralLedger;
    window.erpApp.viewGLEntryDetail = viewGLEntryDetail;
    window.erpApp.openEditGLEntryModal = openEditGLEntryModal;
    window.erpApp.saveGLEntry = saveGLEntry;
    window.erpApp.openAddGLEntryModal = function() {
        if (typeof showToast === 'function') showToast('Tính năng lập phiếu mới đang được cập nhật', 'info');
    };

})();
