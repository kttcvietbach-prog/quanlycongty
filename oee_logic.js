    let oeeData = {
        machineName: 'Xưởng Cắt Laser 01',
        date: '2026-04-12',
        availability: 85,
        performance: 90,
        quality: 98,
        oee: 75
    };

    try {
        const savedOEE = JSON.parse(localStorage.getItem('erp_oeeData'));
        if (savedOEE) oeeData = savedOEE;
    } catch (e) {}

    window.erpApp.renderOEE = function() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');
        
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Báo cáo hiệu suất (OEE)';
        if (pageBadge) pageBadge.textContent = 'Sản xuất';

        const html = `
            <div class="oee-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Báo Cáo Hiệu Suất Tổng Thể (OEE)</h2>
                    </div>
                    <button onclick="window.erpApp.openEditOEEModal()" style="padding:12px 24px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                        <span class="material-icons-outlined">edit</span> Chỉnh sửa dữ liệu OEE
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <!-- OEE Total -->
                    <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:24px; padding:24px; color:#fff; box-shadow:0 10px 15px -3px rgba(15, 23, 42, 0.4); display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <div style="font-size:14px; font-weight:800; color:#cbd5e1; margin-bottom:8px; letter-spacing:1px;">OEE TỔNG THỂ</div>
                        <div style="font-size:48px; font-weight:900; color:#38bdf8;">${oeeData.oee}%</div>
                        <div style="font-size:12px; font-weight:600; color:#94a3b8; margin-top:8px;">${oeeData.machineName} - ${oeeData.date}</div>
                    </div>

                    <!-- Availability -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); text-align:center;">
                        <div style="font-size:13px; font-weight:800; color:#64748b; margin-bottom:16px;">TỶ LỆ KHẢ DỤNG (A)</div>
                        <div style="position:relative; width:120px; height:120px; margin:0 auto;">
                            <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" stroke-width="3.8"/>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" stroke-width="3.8" stroke-dasharray="${oeeData.availability}, 100"/>
                            </svg>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:24px; font-weight:900; color:#1e293b;">${oeeData.availability}%</div>
                        </div>
                    </div>

                    <!-- Performance -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); text-align:center;">
                        <div style="font-size:13px; font-weight:800; color:#64748b; margin-bottom:16px;">HIỆU SUẤT (P)</div>
                        <div style="position:relative; width:120px; height:120px; margin:0 auto;">
                            <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" stroke-width="3.8"/>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="3.8" stroke-dasharray="${oeeData.performance}, 100"/>
                            </svg>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:24px; font-weight:900; color:#1e293b;">${oeeData.performance}%</div>
                        </div>
                    </div>

                    <!-- Quality -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); text-align:center;">
                        <div style="font-size:13px; font-weight:800; color:#64748b; margin-bottom:16px;">CHẤT LƯỢNG (Q)</div>
                        <div style="position:relative; width:120px; height:120px; margin:0 auto;">
                            <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" stroke-width="3.8"/>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3.8" stroke-dasharray="${oeeData.quality}, 100"/>
                            </svg>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:24px; font-weight:900; color:#1e293b;">${oeeData.quality}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) pageContent.innerHTML = html;
    };

    window.erpApp.openEditOEEModal = function() {
        const modalHtml = `
            <div id="oeeEditModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5);" onclick="this.remove()">
                <div class="modal-content" style="width:500px; border-radius:24px; padding:32px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                        <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b;">Chỉnh sửa tham số OEE</h2>
                        <button onclick="document.getElementById('oeeEditModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px;">TÊN THIẾT BỊ / XƯỞNG</label>
                            <input type="text" id="edit_oee_machine" value="${oeeData.machineName}" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:8px;">NGÀY BÁO CÁO</label>
                            <input type="date" id="edit_oee_date" value="${oeeData.date}" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#eab308; margin-bottom:8px;">A (%)</label>
                                <input type="number" id="edit_oee_availability" value="${oeeData.availability}" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#3b82f6; margin-bottom:8px;">P (%)</label>
                                <input type="number" id="edit_oee_performance" value="${oeeData.performance}" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#10b981; margin-bottom:8px;">Q (%)</label>
                                <input type="number" id="edit_oee_quality" value="${oeeData.quality}" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:12px; font-weight:600;">
                            </div>
                        </div>
                        <button onclick="window.erpApp.saveOEE()" style="width:100%; padding:14px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:14px; font-weight:700; cursor:pointer; box-shadow:0 10px 15px -3px rgba(245, 158, 11, 0.3);">
                            Cập nhật báo cáo OEE
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveOEE = function() {
        const machineName = document.getElementById('edit_oee_machine').value;
        const date = document.getElementById('edit_oee_date').value;
        const availability = parseInt(document.getElementById('edit_oee_availability').value);
        const performance = parseInt(document.getElementById('edit_oee_performance').value);
        const quality = parseInt(document.getElementById('edit_oee_quality').value);
        
        // Calculate new OEE (A * P * Q)
        const oee = Math.round((availability * performance * quality) / 10000);

        oeeData = { machineName, date, availability, performance, quality, oee };
        localStorage.setItem('erp_oeeData', JSON.stringify(oeeData));
        
        document.getElementById('oeeEditModal').remove();
        window.erpApp.renderOEE();
        if(typeof showToast === 'function') showToast('Đã cập nhật dữ liệu hiệu suất OEE');
    };
