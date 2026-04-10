(function () {
    // ==========================================
    // MODULE: Kết Quả Kinh Doanh (Income Statement / P&L)
    // ==========================================
    let pnlData = [
        { id: '1', name: '1. Doanh thu bán hàng và cung cấp dịch vụ', value: 850000000, isHeader: true, type: 'plus' },
        { id: '2', name: '2. Các khoản giảm trừ doanh thu', value: 15000000, parentId: '1', type: 'minus' },
        { id: '10', name: '3. Doanh thu thuần về bán hàng và cung cấp dịch vụ', value: 835000000, isTotal: true },
        { id: '11', name: '4. Giá vốn hàng bán', value: 520000000, type: 'minus' },
        { id: '20', name: '5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ', value: 315000000, isTotal: true },
        { id: '21', name: '6. Doanh thu hoạt động tài chính', value: 5000000, type: 'plus' },
        { id: '22', name: '7. Chi phí tài chính', value: 12000000, type: 'minus' },
        { id: '25', name: '8. Chi phí bán hàng', value: 45000000, type: 'minus' },
        { id: '26', name: '9. Chi phí quản lý doanh nghiệp', value: 68000000, type: 'minus' },
        { id: '30', name: '10. Lợi nhuận thuần từ hoạt động kinh doanh', value: 195000000, isTotal: true },
        { id: '40', name: '11. Thu nhập khác', value: 2000000, type: 'plus' },
        { id: '41', name: '12. Chi phí khác', value: 800000, type: 'minus' },
        { id: '50', name: '13. Tổng lợi nhuận kế toán trước thuế', value: 196200000, isTotal: true },
        { id: '51', name: '14. Chi phí thuế TNDN hiện hành', value: 39240000, type: 'minus' },
        { id: '60', name: '15. Lợi nhuận sau thuế thu nhập doanh nghiệp', value: 156960000, isTotal: true }
    ];

    try {
        const saved = localStorage.getItem('erp_pnl_data');
        if (saved) pnlData = JSON.parse(saved);
    } catch (e) { }

    function renderPNL() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Kết quả kinh doanh';
        if (pageBadge) pageBadge.textContent = 'Tài chính';

        const fmt = new Intl.NumberFormat('vi-VN');

        const html = `
            <div class="pnl-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo Cáo Kết Quả Kinh Doanh</h2>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; box-shadow:0 4px 20px -5px rgba(0,0,0,0.05);">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-transform:uppercase;">Chỉ tiêu</th>
                                    <th style="padding:16px 12px; font-size:12px; font-weight:900; color:#94a3b8; text-align:right; width:200px; text-transform:uppercase;">Kỳ này (VNĐ)</th>
                                    <th style="padding:16px 12px; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pnlData.map(item => {
                                    const isTotal = item.isTotal;
                                    const background = isTotal ? '#f1f5f9' : 'transparent';
                                    const weight = isTotal ? '900' : (item.isHeader ? '800' : '600');
                                    const color = isTotal ? '#1e293b' : (item.type === 'minus' ? '#ef4444' : '#475569');
                                    
                                    return `
                                        <tr style="border-bottom:1px solid #f8fafc; background:${background};">
                                            <td style="padding:16px 12px; font-weight:${weight}; color:${isTotal ? '#1e293b' : '#1e293b'}; font-size:14px;">${item.name}</td>
                                            <td style="padding:16px 12px; font-weight:800; color:${color}; text-align:right; font-size:14px;">${fmt.format(item.value)}</td>
                                            <td style="padding:16px 12px; text-align:right;">
                                                ${!isTotal ? `
                                                    <button onclick="window.erpApp.openEditPNLModal('${item.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;" title="Chỉnh sửa">
                                                        <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                                    </button>
                                                ` : ''}
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
        if (pageContent) pageContent.innerHTML = html;
    }

    function openEditPNLModal(id) {
        const item = pnlData.find(i => i.id === id);
        if (!item) return;

        const modalHtml = `
            <div id="pnlEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:450px; border-radius:32px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hiệu chỉnh Kết quả</h2>
                        <button onclick="document.getElementById('pnlEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Chỉ tiêu báo cáo</label>
                            <div style="font-size:14px; font-weight:700; color:#475569; background:#f8fafc; padding:12px; border-radius:12px;">${item.name}</div>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Giá trị (VNĐ)</label>
                            <input type="text" id="edit_pnl_value" value="${new Intl.NumberFormat('vi-VN').format(item.value)}" oninput="window.erpApp.formatVNDInput(this)" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:14px; font-weight:900; color:#1e293b;">
                        </div>
                        <button onclick="window.erpApp.savePNLValue('${item.id}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:16px; font-weight:800; cursor:pointer;">
                            Lưu và Tính toán lại
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function savePNLValue(id) {
        const valStr = document.getElementById('edit_pnl_value').value;
        const value = window.erpApp.parseVND(valStr);
        const idx = pnlData.findIndex(i => i.id === id);
        if (idx !== -1) {
            pnlData[idx].value = value;
            calculatePNL();
            localStorage.setItem('erp_pnl_data', JSON.stringify(pnlData));
            document.getElementById('pnlEditModal').remove();
            renderPNL();
            if (typeof showToast === 'function') showToast('Đã tính toán lại kết quả kinh doanh');
        }
    }

    function calculatePNL() {
        const getV = (id) => pnlData.find(i => i.id === id).value;
        const setV = (id, val) => { const item = pnlData.find(i => i.id === id); if(item) item.value = val; };

        // 3. Doanh thu thuần = 1 - 2
        setV('10', getV('1') - getV('2'));
        // 5. Lợi nhuận gộp = 10 - 11
        setV('20', getV('10') - getV('11'));
        // 10. Lợi nhuận thuần HĐKD = 20 + 21 - 22 - 25 - 26
        setV('30', getV('20') + getV('21') - getV('22') - getV('25') - getV('26'));
        // 13. Tổng lợi nhuận trước thuế = 30 + 40 - 41
        setV('50', getV('30') + getV('40') - getV('41'));
        // 14. Thuế (Tạm tính 20%) - Cho phép tự nhập hoặc tự tính, ở đây cho phép tự tính nếu muốn
        // Ở đây để người dùng nhập Thuế, hoặc tự tính 20% nếu giá trị là 0
        if (getV('51') === 0 || getV('51') === Math.round(getV('50') * 0.2)) {
             setV('51', Math.round(getV('50') * 0.2));
        }
        // 15. Lợi nhuận sau thuế = 50 - 51
        setV('60', getV('50') - getV('51'));
    }

    window.erpApp.renderPNL = renderPNL;
    window.erpApp.openEditPNLModal = openEditPNLModal;
    window.erpApp.savePNLValue = savePNLValue;

})();
