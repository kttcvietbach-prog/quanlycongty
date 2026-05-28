(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    function renderOEE() {
        window.erpApp.activeProductionSubModule = 'oee';
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Phân tích hiệu suất OEE';}
        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];

        const html = `
            <div class="oee-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:22px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Phân tích Hiệu suất Máy (OEE)</h2>
                        <div style="font-size:13px; color:#94a3b8; font-weight:600; margin-top:4px;">Tính khả dụng x Hiệu suất x Chất lượng</div>
                    </div>
                    <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:12px 24px; font-weight:800; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap:24px;">
                    ${workCenters.map(wc => {
                        const availability = wc.status === 'running' ? 95 : (wc.status === 'maintenance' ? 0 : 70);
                        const performance = wc.oee > 0 ? Math.min(100, wc.oee + 5) : 0;
                        const quality = 98;
                        const calcOee = Math.round((availability * performance * quality) / 10000);

                        return `
                        <div class="oee-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.03);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                                <div>
                                    <h3 style="margin:0; font-size:18px; font-weight:950; color:#1e293b;">${wc.name}</h3>
                                    <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-top:4px;">${wc.type} • ID: ${wc.id}</div>
                                </div>
                                <div style="width:70px; height:70px; border-radius:50%; background:conic-gradient(#3b82f6 ${calcOee}%, #f1f5f9 0); display:flex; align-items:center; justify-content:center; position:relative;">
                                    <div style="width:58px; height:58px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:950; color:#1e293b;">${calcOee}%</div>
                                </div>
                            </div>

                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; font-weight:800; color:#64748b;">
                                        <span>TÍNH KHẢ DỤNG (Availability)</span>
                                        <span style="color:#1e293b;">${availability}%</span>
                                    </div>
                                    <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                        <div style="width:${availability}%; height:100%; background:#3b82f6; border-radius:3px;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; font-weight:800; color:#64748b;">
                                        <span>HIỆU SUẤT (Performance)</span>
                                        <span style="color:#1e293b;">${performance}%</span>
                                    </div>
                                    <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                        <div style="width:${performance}%; height:100%; background:#8b5cf6; border-radius:3px;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; font-weight:800; color:#64748b;">
                                        <span>CHẤT LƯỢNG (Quality)</span>
                                        <span style="color:#1e293b;">${quality}%</span>
                                    </div>
                                    <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                        <div style="width:${quality}%; height:100%; background:#10b981; border-radius:3px;"></div>
                                    </div>
                                </div>
                            </div>

                            <div style="margin-top:32px; padding-top:24px; border-top:1px dashed #e2e8f0; display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                                <div style="text-align:center;">
                                    <div style="font-size:10px; font-weight:850; color:#94a3b8; text-transform:uppercase;">Thời gian chạy</div>
                                    <div style="font-size:15px; font-weight:900; color:#1e293b; margin-top:4px;">${wc.status === 'running' ? '7.5h' : '0h'} / 8h</div>
                                </div>
                                <div style="text-align:center;">
                                    <div style="font-size:10px; font-weight:850; color:#94a3b8; text-transform:uppercase;">Sản phẩm lỗi</div>
                                    <div style="font-size:15px; font-weight:900; color:#ef4444; margin-top:4px;">${calcOee > 0 ? '1.2%' : '0%'}</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        if (pageContent) {pageContent.innerHTML = html;}
    }

    window.erpApp.renderOEE = renderOEE;
})();
