(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let productionLogs = window.productionLogs || [
        { id: 'LOG-2026-001', moId: 'MO-2026-0041', shift: 'Ca 1', workerCount: 12, qty: 150, time: '12/04/2026 14:00', note: 'Vận hành ổn định' },
        { id: 'LOG-2026-002', moId: 'MO-2026-0041', shift: 'Ca 2', workerCount: 10, qty: 120, time: '12/04/2026 22:00', note: 'Thiếu 1 nhân sự phụ trợ' }
    ];

    try {
        const savedLogs = JSON.parse(localStorage.getItem('erp_productionLogs'));
        if (savedLogs && Array.isArray(savedLogs)) {productionLogs = savedLogs;}
    } catch (e) { console.error('Error loading logs:', e); }

    function renderProductionLog() {
        window.erpApp.activeProductionSubModule = 'production-log';
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Nhật ký sản xuất';}
        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        const html = `
            <div class="log-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo cáo Sản lượng theo ca</h2>
                    </div>
                    <button onclick="window.erpApp.openLogModal()" style="padding:12px 24px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                        <span class="material-icons-outlined">edit_note</span> Ghi nhận Nhật ký ca
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead style="background:#f8fafc;">
                            <tr>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Mã Nhật ký</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Lệnh sản xuất</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Ca làm việc</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Nhân sự ca</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Sản lượng</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Ghi chú</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Thời gian ghi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productionLogs.map(log => `
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:20px 24px; font-weight:900; color:#1e293b;">${log.id}</td>
                                    <td style="padding:20px 24px; font-weight:700; color:#6366f1;">${log.moId}</td>
                                    <td style="padding:20px 24px; font-weight:800; color:#f59e0b;">${log.shift}</td>
                                    <td style="padding:20px 24px; font-weight:700; color:#475569;">${log.workerCount} người</td>
                                    <td style="padding:20px 24px; font-weight:900; color:#10b981;">+ ${log.qty} SP</td>
                                    <td style="padding:20px 24px; color:#64748b; font-size:13px; max-width:200px;">${log.note}</td>
                                    <td style="padding:20px 24px; font-size:12px; color:#94a3b8; font-weight:600;">${log.time}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    }

    window.erpApp.openLogModal = function() {
        const manufacturingOrders = window.erpApp.manufacturingOrders || JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        const modalHtml = `
            <div id="logModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);" onclick="this.remove()">
                <div class="modal-content" style="width:480px; border-radius:32px; padding:36px; background:#fff;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                        <h2 style="margin:0; font-size:20px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Ghi nhận Nhật ký Ca</h2>
                        <button onclick="document.getElementById('logModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Lệnh sản xuất (MO)</label>
                            <select id="logMoId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                                ${manufacturingOrders.map(mo => `<option value="${mo.id}">${mo.id} - ${mo.product}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Ca làm việc</label>
                                <select id="logShift" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                                    <option value="Ca 1">Ca 1 (06:00 - 14:00)</option>
                                    <option value="Ca 2">Ca 2 (14:00 - 22:00)</option>
                                    <option value="Ca 3">Ca 3 (22:00 - 06:00)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Số nhân sự</label>
                                <input type="number" id="logWorkers" value="1" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                            </div>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Sản lượng hoàn thành trong ca</label>
                            <input type="number" id="logQty" value="0" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Ghi chú vận hành</label>
                            <textarea id="logNote" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; height:80px;"></textarea>
                        </div>
                        
                        <div style="margin-top:16px; display:grid; grid-template-columns:1fr 2fr; gap:12px;">
                            <button onclick="document.getElementById('logModal').remove()" style="padding:16px; border:1.5px solid #e2e8f0; background:#fff; border-radius:16px; font-weight:800; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveLog()" style="padding:16px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:16px; font-weight:900; cursor:pointer;">Ghi nhận vào Nhật ký</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveLog = async function() {
        const moId = document.getElementById('logMoId').value;
        const shift = document.getElementById('logShift').value;
        const workerCount = parseInt(document.getElementById('logWorkers').value);
        const qty = parseInt(document.getElementById('logQty').value);
        const note = document.getElementById('logNote').value;

        if (isNaN(qty)) {return;}

        const newLog = {
            id: 'LOG-2026-' + (productionLogs.length + 1).toString().padStart(3, '0'),
            moId, shift, workerCount, qty, note,
            time: new Date().toLocaleString('vi-VN')
        };

        productionLogs.unshift(newLog);
        localStorage.setItem('erp_productionLogs', JSON.stringify(productionLogs));
        window.productionLogs = productionLogs;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('erp_productionLogs', newLog, 'id');
        }

        if (window.erpApp && window.erpApp.addNotification) {
            window.erpApp.addNotification(`Nhật ký sản xuất: ${moId} hoàn thành +${qty} SP (${shift})`, 'menu_book', 'orange', 'san-xuat');
        }

        document.getElementById('logModal').remove();
        renderProductionLog();
        if (window.erpApp.showToast) {window.erpApp.showToast('Đã ghi nhận nhật ký sản xuất thành công!');}
    };

    window.erpApp.renderProductionLog = renderProductionLog;
})();
