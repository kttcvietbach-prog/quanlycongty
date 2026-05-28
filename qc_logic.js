(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let qcList = window.qcList || [];

    try {
        const savedQc = JSON.parse(localStorage.getItem('erp_qcList'));
        if (savedQc && Array.isArray(savedQc)) {qcList = savedQc;}
    } catch (e) { console.error('Error loading QC:', e); }

    function renderQC() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Kiểm tra chất lượng (QC)';}
        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}
        window.erpApp.activeProductionSubModule = 'qc';

        const html = `
            <div class="qc-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Nhật ký Kiểm tra Chất lượng</h2>
                    </div>
                    <button onclick="window.erpApp.openQcModal()" style="padding:12px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(16, 185, 129, 0.2);">
                        <span class="material-icons-outlined">fact_check</span> Ghi nhận kết quả QC mới
                    </button>
                </div>

                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead style="background:#f8fafc;">
                            <tr>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Mã QC</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Lệnh sản xuất</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Công đoạn</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Mẫu Đạt/Tổng</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Kết quả</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Kiểm định viên</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase;">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${qcList.map(qc => `
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:20px 24px; font-weight:900; color:#1e293b;">${qc.id}</td>
                                    <td style="padding:20px 24px; font-weight:700; color:#6366f1;">${qc.moId}</td>
                                    <td style="padding:20px 24px; font-weight:700; color:#475569;">${qc.step}</td>
                                    <td style="padding:20px 24px; font-weight:700;">
                                        <span style="color:${qc.passQty === qc.sampleQty ? '#10b981' : '#ef4444'}">${qc.passQty}</span> / ${qc.sampleQty}
                                    </td>
                                    <td style="padding:20px 24px;">
                                        <span style="padding:6px 12px; border-radius:30px; font-size:11px; font-weight:800; text-transform:uppercase; background:${qc.status === 'pass' ? '#ecfdf5' : '#fef2f2'}; color:${qc.status === 'pass' ? '#10b981' : '#ef4444'}">${qc.status === 'pass' ? 'ĐẠT' : 'KHÔNG ĐẠT'}</span>
                                    </td>
                                    <td style="padding:20px 24px; color:#475569; font-weight:600;">${qc.tester}</td>
                                    <td style="padding:20px 24px; font-size:12px; color:#94a3b8; font-weight:600;">${qc.time}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    }

    window.erpApp.openQcModal = function() {
        const manufacturingOrders = window.erpApp.manufacturingOrders || JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        const modalHtml = `
            <div id="qcModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:32px; padding:36px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                        <h2 style="margin:0; font-size:20px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Ghi nhận kết quả QC</h2>
                        <button onclick="document.getElementById('qcModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Lệnh sản xuất (MO)</label>
                            <select id="qcMoId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                                ${manufacturingOrders.map(mo => `<option value="${mo.id}">${mo.id} - ${mo.product}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Công đoạn kiểm tra</label>
                            <input type="text" id="qcStep" placeholder="VD: Trộn cưỡng bức" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Số mẫu kiểm</label>
                                <input type="number" id="qcSample" value="1" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Số lượng Đạt</label>
                                <input type="number" id="qcPass" value="1" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700;">
                            </div>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Ghi chú chi tiết</label>
                            <textarea id="qcNote" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; height:80px;"></textarea>
                        </div>
                        
                        <div style="margin-top:16px; display:grid; grid-template-columns:1fr 2fr; gap:12px;">
                            <button onclick="document.getElementById('qcModal').remove()" style="padding:16px; border:1.5px solid #e2e8f0; background:#fff; border-radius:16px; font-weight:800; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveQC()" style="padding:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:16px; font-weight:900; cursor:pointer;">Lưu kết quả QC</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveQC = async function() {
        const moId = document.getElementById('qcMoId').value;
        const step = document.getElementById('qcStep').value;
        const sampleQty = parseInt(document.getElementById('qcSample').value);
        const passQty = parseInt(document.getElementById('qcPass').value);
        const note = document.getElementById('qcNote').value;

        if (!step || isNaN(sampleQty)) {return;}

        const newQc = {
            id: 'QC-2026-' + (qcList.length + 1).toString().padStart(3, '0'),
            moId, step, sampleQty, passQty,
            status: passQty === sampleQty ? 'pass' : 'fail',
            tester: 'Admin System',
            time: new Date().toLocaleString('vi-VN'),
            note
        };

        qcList.unshift(newQc);
        localStorage.setItem('erp_qcList', JSON.stringify(qcList));
        window.qcList = qcList;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('erp_qcList', newQc, 'id');
        }

        if (window.erpApp && window.erpApp.addNotification) {
            window.erpApp.addNotification(`Kết quả QC ${newQc.status === 'pass' ? 'ĐẠT' : 'KHÔNG ĐẠT'}: ${moId} - ${step}`, 'verified', newQc.status === 'pass' ? 'green' : 'red', 'san-xuat');
        }

        document.getElementById('qcModal').remove();
        renderQC();
        if (window.erpApp.showToast) {window.erpApp.showToast('Đã lưu kết quả kiểm tra chất lượng!');}
    };

    window.erpApp.renderQC = renderQC;
})();
