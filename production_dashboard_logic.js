(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    window.erpApp.renderSanXuat = function () {
        window.erpApp.activeProductionSubModule = null; // Clear sub-module state when returning to main dashboard
        const page = window.erpApp.pagesData ? window.erpApp.pagesData['san-xuat'] : null;
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {return;}

        // 1. Dữ liệu thực tế
        const manufacturingOrders = window.manufacturingOrders || JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        const workCenters = window.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];

        // Tính toán các chỉ số
        const totalMO = manufacturingOrders.length;
        const activeMO = manufacturingOrders.filter(mo => mo.status === 'approved' && mo.progress < 100).length;
        const completedMO = manufacturingOrders.filter(mo => mo.progress === 100).length;

        // Hiệu suất trung bình (OEE Mock)
        let totalOEE = 0;
        workCenters.forEach(wc => {
            const availability = wc.status === 'running' ? 95 : (wc.status === 'maintenance' ? 0 : 70);
            const performance = wc.oee > 0 ? Math.min(100, wc.oee + 5) : 0;
            const quality = 98;
            totalOEE += Math.round((availability * performance * quality) / 10000);
        });
        const avgOEE = workCenters.length > 0 ? Math.round(totalOEE / workCenters.length) : 0;

        // Sản lượng (Throughput)
        const totalQty = manufacturingOrders.reduce((sum, mo) => sum + (parseFloat(mo.qty) || 0), 0);
        const completedQty = manufacturingOrders.reduce((sum, mo) => sum + ((parseFloat(mo.qty) || 0) * (mo.progress || 0) / 100), 0);
        const throughputPercent = totalQty > 0 ? Math.round((completedQty / totalQty) * 100) : 0;

        let html = `
            <style>
                .prod-dashboard { animation: fadeIn 0.5s ease-out; color: #1e293b; padding-bottom: 30px; }
                .prod-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
                .prod-kpi-card { 
                    background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: all 0.3s ease;
                    display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden;
                }
                .prod-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(0,0,0,0.08); border-color: #3b82f6; }
                
                .prod-kpi-card.blue { border-left: 4px solid #3b82f6; }
                .prod-kpi-card.purple { border-left: 4px solid #8b5cf6; }
                .prod-kpi-card.emerald { border-left: 4px solid #10b981; }
                .prod-kpi-card.amber { border-left: 4px solid #f59e0b; }

                .prod-icon-box {
                    width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; 
                    justify-content: center; font-size: 22px; flex-shrink: 0;
                }
                .prod-kpi-card.blue .prod-icon-box { background: #eff6ff; color: #2563eb; }
                .prod-kpi-card.purple .prod-icon-box { background: #f5f3ff; color: #7c3aed; }
                .prod-kpi-card.emerald .prod-icon-box { background: #f0fdf4; color: #059669; }
                .prod-kpi-card.amber .prod-icon-box { background: #fffbeb; color: #d97706; }

                .prod-section-header { 
                    display: flex; align-items: center; gap: 10px; margin-bottom: 16px; margin-top: 24px;
                }
                .prod-section-header h3 { margin: 0; font-size: 14px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 1px; }
                .prod-section-line { flex: 1; height: 1px; background: #e2e8f0; }

                .prod-module-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
                .prod-module-card {
                    background: #fff; border-radius: 18px; padding: 16px; border: 1px solid #f1f5f9;
                    display: flex; align-items: center; gap: 14px; transition: all 0.3s; cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }
                .prod-module-card:hover { 
                    background: #f8fafc; border-color: #3b82f6; transform: scale(1.01);
                    box-shadow: 0 8px 16px -4px rgba(59,130,246,0.12);
                }
                .prod-module-icon {
                    width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; 
                    justify-content: center; font-size: 18px; transition: all 0.3s;
                }
                .prod-module-card:hover .prod-module-icon { transform: rotate(-5deg) scale(1.1); }
            </style>

            <div class="prod-dashboard">
                <div class="prod-kpi-grid">
                    <!-- OEE -->
                    <div class="prod-kpi-card blue">
                        <div class="prod-icon-box"><span class="material-icons-outlined">precision_manufacturing</span></div>
                        <div style="flex:1;">
                            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Hiệu suất OEE</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; line-height:1.2;">${avgOEE}%</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:10px; font-weight:850; color:#3b82f6; background:#eff6ff; padding:2px 8px; border-radius:6px;">Goal 85%</div>
                        </div>
                    </div>

                    <!-- MO -->
                    <div class="prod-kpi-card purple">
                        <div class="prod-icon-box"><span class="material-icons-outlined">inventory_2</span></div>
                        <div style="flex:1;">
                            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Lệnh Sản Xuất</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; line-height:1.2;">${activeMO}/${totalMO}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:10px; font-weight:850; color:#8b5cf6; background:#f5f3ff; padding:2px 8px; border-radius:6px;">${completedMO} Xong</div>
                        </div>
                    </div>

                    <!-- Throughput -->
                    <div class="prod-kpi-card emerald">
                        <div class="prod-icon-box"><span class="material-icons-outlined">speed</span></div>
                        <div style="flex:1;">
                            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Sản lượng</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; line-height:1.2;">${throughputPercent}%</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:10px; font-weight:850; color:#10b981; background:#f0fdf4; padding:2px 8px; border-radius:6px;">+4.2%</div>
                        </div>
                    </div>

                    <!-- Yield -->
                    <div class="prod-kpi-card amber">
                        <div class="prod-icon-box"><span class="material-icons-outlined">verified</span></div>
                        <div style="flex:1;">
                            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Tỷ lệ đạt</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; line-height:1.2;">98.8%</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:10px; font-weight:850; color:#f59e0b; background:#fffbeb; padding:2px 8px; border-radius:6px;">Ổn định</div>
                        </div>
                    </div>
                </div>

                ${(window.erpApp.pagesData['san-xuat'].sections || []).map(section => `
                    <div class="prod-section-header">
                        <h3>${section.title}</h3>
                        <div class="prod-section-line"></div>
                    </div>
                    <div class="prod-module-grid">
                        ${section.modules.map(mod => `
                            <div class="prod-module-card" onclick="window.erpApp.openModule('${mod.title.replace(/'/g, '\\\'')}')">
                                <div class="prod-module-icon" style="background:var(--icon-${mod.color}-bg); color:var(--icon-${mod.color});">
                                    <span class="material-icons-outlined">${mod.icon}</span>
                                </div>
                                <div style="flex:1;">
                                    <div style="font-size:14px; font-weight:800; color:#1e293b;">${mod.title}</div>
                                    <div style="font-size:11px; color:#64748b; margin-top:2px; line-height:1.4;">${mod.desc}</div>
                                </div>
                                <div style="color:#cbd5e1;"><span class="material-icons-outlined" style="font-size:18px;">chevron_right</span></div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        pageContent.innerHTML = html;
        pageContent.scrollTop = 0;


    };

})();
