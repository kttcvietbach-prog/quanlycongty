(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    const COLLECTION_SCH = 'erp_productionSchedules';
    let schedules = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData(COLLECTION_SCH) : [
        { id: 'SCH-001', projectId: 'PJ-003', moId: 'MO-2026-0041', wcId: 'WC-001', start: '2026-04-09T08:00', end: '2026-04-09T14:30', load: 85, note: 'Giai đoạn cắt Laser thô' },
        { id: 'SCH-002', projectId: 'PJ-003', moId: 'MO-2026-0042', wcId: 'WC-002', start: '2026-04-09T10:00', end: '2026-04-09T17:00', load: 100, note: 'May hoàn thiện' },
        { id: 'SCH-003', projectId: 'PJ-001', moId: 'MO-2026-0043', wcId: 'WC-001', start: '2026-04-10T08:00', end: '2026-04-10T12:00', load: 60, note: 'Kiểm tra lỗi bề mặt' }
    ];

    function renderScheduling() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) { breadcrumbCurrent.textContent = 'Lịch trình sản xuất (Scheduling)'; }
        if (pageBadge) { pageBadge.textContent = 'Sản xuất'; }

        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        const pmContracts = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmContracts') : [];
        const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

        // KPI Calculations
        const totalWc = workCenters.length;
        const activeWc = workCenters.filter(w => w.status === 'running').length;
        const maintenanceWc = workCenters.filter(w => w.status === 'maintenance').length;
        const avgOee = workCenters.length > 0 ? (workCenters.reduce((a, b) => a + (b.oee || 0), 0) / workCenters.length).toFixed(1) : 0;

        const html = `
            <div class="scheduling-module-v29" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
                <!-- Header Section -->
                <div class="pm-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:26px; font-weight:900; color:#1e293b; letter-spacing:-0.02em; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="font-size:32px; color:#8b5cf6;">calendar_today</span>
                            Bảng Điều Phối Lịch Sản Xuất
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">settings_suggest</span>
                            Sắp xếp và tối ưu hóa tài nguyên máy móc (Work Centers)
                        </div>
                    </div>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:10px 20px; font-weight:700; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;">
                            <span class="material-icons-outlined">arrow_back</span> Danh mục chính
                        </button>
                        <button onclick="window.erpApp.openScheduleModal()" style="padding:12px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(139, 92, 246, 0.4); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">add_task</span> Xếp lịch mới
                        </button>
                    </div>
                </div>

                <!-- KPI Section -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">precision_manufacturing</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng Work Centers</div>
                            <div class="pm-stat-card-value">${totalWc}</div>
                            <div class="pm-stat-card-sub">Máy móc/Tổ đội</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon green"><span class="material-icons-outlined">bolt</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đang hoạt động</div>
                            <div class="pm-stat-card-value">${activeWc}</div>
                            <div class="pm-stat-card-sub">${((activeWc / totalWc) * 100).toFixed(0)}% Công suất</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon red"><span class="material-icons-outlined">build</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đang bảo trì</div>
                            <div class="pm-stat-card-value">${maintenanceWc}</div>
                            <div class="pm-stat-card-sub">Dừng máy/Sửa chữa</div>
                        </div>
                    </div>
                    <div class="pm-stat-card">
                        <div class="pm-stat-card-icon indigo"><span class="material-icons-outlined">analytics</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Hiệu suất OEE TB</div>
                            <div class="pm-stat-card-value">${avgOee}%</div>
                            <div class="pm-stat-card-sub">Toàn nhà máy</div>
                        </div>
                    </div>
                </div>

                <!-- Timeline Gantt Chart -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; overflow-x:auto; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05); margin-bottom:32px;">
                    <div style="min-width:1100px;">
                        <!-- Timeline Header (Hours) -->
                        <div style="display:grid; grid-template-columns: 240px repeat(${hours.length}, 1fr); border-bottom:1px solid #f1f5f9; padding-bottom:20px; margin-bottom:20px;">
                            <div style="font-weight:900; color:#1e293b; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Nguồn lực (Máy/Tổ)</div>
                            ${hours.map(h => `<div style="text-align:center; font-size:12px; font-weight:800; color:#94a3b8;">${h}:00</div>`).join('')}
                        </div>

                        <!-- Resources Rows -->
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${workCenters.map(wc => {
            const wcSchedules = schedules.filter(s => s.wcId === wc.id);
            const isDown = wc.status === 'maintenance';

            return `
                                <div style="display:grid; grid-template-columns: 240px repeat(${hours.length}, 1fr); min-height:86px; position:relative; background:${isDown ? '#fff1f2' : (wcSchedules.length > 0 ? '#fbfcfe' : '#f8fafc')}; border-radius:20px; align-items:center; transition: all 0.2s; border: 1px solid ${isDown ? '#fee2e2' : '#f1f5f9'};">
                                    <div style="padding:20px; display:flex; align-items:center; gap:14px; border-right:1px solid #f1f5f9; background:#fff; border-radius:20px 0 0 20px; height:100%; z-index:2;">
                                        <div style="width:14px; height:14px; border-radius:50%; background:${isDown ? '#ef4444' : '#10b981'}; box-shadow: 0 0 10px ${isDown ? '#ef444455' : '#10b98155'};"></div>
                                        <div style="flex:1;">
                                            <div style="font-size:15px; font-weight:900; color:#1e293b;">${wc.name}</div>
                                            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-top:4px; letter-spacing:0.5px;">${wc.id} • ${wc.type}</div>
                                        </div>
                                    </div>
                                    
                                    ${hours.map(() => '<div style="border-left:1px dashed #e2e8f0; height:100%; opacity:0.5;"></div>').join('')}
                                    
                                    <!-- Render scheduled blocks -->
                                    ${wcSchedules.map(s => {
                const startDate = new Date(s.start);
                const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                const endDate = new Date(s.end);
                const endHour = endDate.getHours() + endDate.getMinutes() / 60;

                const colStart = Math.max(0, startHour - 8);
                const colSpan = Math.min(hours.length, endHour - startHour);

                if (colStart > hours.length) { return ''; }

                return `
                                            <div onclick="window.erpApp.viewScheduleDetail('${s.id}')" style="position:absolute; left:calc(240px + ${colStart * (100 / hours.length)}%); width:calc(${colSpan * (100 / hours.length)}%); height:58px; top:14px; background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius:14px; color:#fff; display:flex; flex-direction:column; justify-content:center; padding-left:16px; box-shadow:0 10px 20px -5px rgba(109, 40, 217, 0.4); border:2.5px solid #fff; cursor:pointer; z-index:5; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.02) translateY(-2px)'; this.style.zIndex='20'; this.style.boxShadow='0 15px 30px -5px rgba(109, 40, 217, 0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.zIndex='5'; this.style.boxShadow='0 10px 20px -5px rgba(109, 40, 217, 0.4)'">
                                                <div style="display:flex; align-items:center; gap:6px;">
                                                    <div style="font-size:12px; font-weight:900; letter-spacing:0.5px;">${s.moId}</div>
                                                    <span class="material-icons-outlined" style="font-size:14px; color:rgba(255,255,255,0.8);">event_available</span>
                                                </div>
                                                <div style="font-size:10px; font-weight:700; opacity:0.9; margin-top:2px;">${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}</div>
                                            </div>
                                        `;
            }).join('')}

                                    ${isDown ? `
                                        <div style="position:absolute; left:240px; right:0; top:0; bottom:0; background: repeating-linear-gradient(45deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.05) 10px, transparent 10px, transparent 20px); border-radius:0 20px 20px 0; display:flex; align-items:center; justify-content:center; z-index:1;">
                                            <div style="color:#ef4444; font-size:11px; font-weight:900; background:#fff; padding:8px 20px; border-radius:30px; border:2px solid #ef4444; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.15); text-transform:uppercase; letter-spacing:1px;">BẢO TRÌ ĐỊNH KỲ</div>
                                        </div>
                                    ` : ''}
                                </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer Info Sections -->
                <div style="display:grid; grid-template-columns: 1.8fr 1fr; gap:32px;">
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:32px; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                            <h3 style="margin:0; font-size:18px; font-weight:950; color:#1e293b; display:flex; align-items:center; gap:10px;">
                                <span class="material-icons-outlined" style="color:#8b5cf6;">list_alt</span>
                                Công việc đang xếp lịch
                            </h3>
                            <span style="background:#f5f3ff; color:#8b5cf6; padding:6px 14px; border-radius:12px; font-size:12px; font-weight:850;">${schedules.length} Items</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${schedules.length === 0 ? `
                                <div style="text-align:center; padding:60px; color:#94a3b8; font-weight:700; border:2px dashed #f1f5f9; border-radius:24px;">
                                    <span class="material-icons-outlined" style="font-size:48px; margin-bottom:16px; opacity:0.3;">event_busy</span>
                                    <div>Chưa có công việc nào được xếp lịch.</div>
                                </div>
                            ` :
                schedules.map(s => {
                    const wcArr = workCenters.find(w => w.id === s.wcId);
                    return `
                                    <div class="schedule-item-v29" style="display:flex; justify-content:space-between; align-items:center; padding:20px 28px; background:#f8fafc; border-radius:24px; border:1px solid #f1f5f9; cursor:pointer; transition: all 0.3s;" onclick="window.erpApp.viewScheduleDetail('${s.id}')" onmouseover="this.style.background='#fff'; this.style.borderColor='#ddd6fe'; this.style.transform='translateX(6px)'; this.style.boxShadow='0 10px 20px -10px rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#f1f5f9'; this.style.transform='none'; this.style.boxShadow='none'">
                                        <div style="display:flex; align-items:center; gap:20px;">
                                            <div style="width:52px; height:52px; background:#fff; border-radius:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; color:#8b5cf6;">
                                                <span class="material-icons-outlined" style="font-size:26px;">precision_manufacturing</span>
                                            </div>
                                            <div>
                                                <div style="font-weight:950; color:#1e293b; font-size:16px;">${s.moId}</div>
                                                <div style="font-size:12px; color:#64748b; font-weight:700; margin-top:4px;">Gán cho: <span style="color:#3b82f6; font-weight:850;">${wcArr ? wcArr.name : 'N/A'}</span></div>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:14px; font-weight:900; color:#1e293b;">${new Date(s.start).toLocaleDateString('vi-VN')}</div>
                                            <div style="font-size:11px; font-weight:850; color:#8b5cf6; background:#f5f3ff; padding:4px 12px; border-radius:10px; margin-top:6px; display:inline-block; border:1px solid #ddd6fe;">
                                                ${new Date(s.start).getHours()}h:${new Date(s.start).getMinutes().toString().padStart(2, '0')} - ${new Date(s.end).getHours()}h:${new Date(s.end).getMinutes().toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    </div>
                                    `;
                }).slice(0, 5).join('')}
                        </div>
                    </div>

                    <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:32px; padding:40px; color:#fff; box-shadow:0 20px 40px -10px rgba(15, 23, 42, 0.3); display:flex; flex-direction:column;">
                        <div style="width:64px; height:64px; background:rgba(139, 92, 246, 0.2); border-radius:20px; display:flex; align-items:center; justify-content:center; margin-bottom:32px; border:1px solid rgba(139, 92, 246, 0.3);">
                            <span class="material-icons-outlined" style="font-size:36px; color:#a78bfa;">auto_awesome</span>
                        </div>
                        <h3 style="margin:0 0 20px 0; font-size:22px; font-weight:950; letter-spacing:-0.5px; background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tư duy Điều hành Thông minh</h3>
                        <p style="font-size:15px; color:#94a3b8; line-height:1.7; margin-bottom:36px; font-weight:500;">Hệ thống tự động phân tích công suất thực tế của từng Work Center để đưa ra đề xuất xếp lịch tối ưu, tránh tình trạng "thắt nút cổ chai" và giảm thiểu thời gian chờ.</p>
                        
                        <div style="display:flex; flex-direction:column; gap:20px; margin-top:auto;">
                            <div style="background:rgba(255,255,255,0.03); padding:24px; border-radius:24px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:16px;">
                                <div style="width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 12px #10b98188;"></div>
                                <div style="flex:1;">
                                    <div style="font-size:10px; font-weight:900; color:#10b981; text-transform:uppercase; letter-spacing:1px;">Trạng thái deadline</div>
                                    <div style="font-size:18px; font-weight:950; color:#f8fafc; margin-top:4px;">100% Theo đúng hạn</div>
                                </div>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:24px; border-radius:24px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:16px;">
                                <div style="width:10px; height:10px; border-radius:50%; background:#3b82f6; box-shadow:0 0 12px #3b82f688;"></div>
                                <div style="flex:1;">
                                    <div style="font-size:10px; font-weight:900; color:#3b82f6; text-transform:uppercase; letter-spacing:1px;">Xung đột nguồn lực</div>
                                    <div style="font-size:18px; font-weight:950; color:#f8fafc; margin-top:4px;">Không phát hiện</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .scheduling-module-v29 .pm-stat-card {
                    background: #fff; padding: 24px; border-radius: 24px; border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: all 0.3s;
                    display: flex; align-items: center; gap: 20px;
                }
                .scheduling-module-v29 .pm-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1); }
                .scheduling-module-v29 .pm-stat-card-icon {
                    width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; 
                    justify-content: center; font-size: 28px;
                }
                .scheduling-module-v29 .pm-stat-card-icon.blue { background: #eff6ff; color: #3b82f6; }
                .scheduling-module-v29 .pm-stat-card-icon.green { background: #f0fdf4; color: #10b981; }
                .scheduling-module-v29 .pm-stat-card-icon.red { background: #fef2f2; color: #ef4444; }
                .scheduling-module-v29 .pm-stat-card-icon.indigo { background: #f5f3ff; color: #8b5cf6; }
                .scheduling-module-v29 .pm-stat-card-label { font-size: 12px; font-weight: 850; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                .scheduling-module-v29 .pm-stat-card-value { font-size: 26px; font-weight: 950; color: #1e293b; margin-top: 2px; }
                .scheduling-module-v29 .pm-stat-card-sub { font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; }
            </style>
        `;
        if (pageContent) { pageContent.innerHTML = html; }
        window.scrollTo(0, 0);
    }

    window.erpApp.openScheduleModal = function () {
        const workCenters = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('erp_workCenters') : [];
        const manufacturingOrders = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('erp_manufacturingOrders') : [];
        const pmProjects = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmProjects') : [];

        const modalHtml = `
            <div id="schModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);" onclick="this.remove()">
                <div class="modal-content" style="width:520px; border-radius:32px; padding:36px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                        <h2 style="margin:0; font-size:20px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Phân Lịch Sản Xuất Mới</h2>
                        <button onclick="document.getElementById('schModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:20px;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Dự án (Project) <span style="color:#ef4444;">*</span></label>
                                <select id="schProjectId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; color:#1e293b; outline:none; background:#f8fafc;">
                                    <option value="">-- Chọn dự án --</option>
                                    ${pmProjects.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Lệnh Sản Xuất (MO) <span style="color:#ef4444;">*</span></label>
                                <select id="schMoId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; color:#1e293b; outline:none; background:#f8fafc;">
                                    <option value="">-- Chọn lệnh sx --</option>
                                    ${manufacturingOrders.map(m => `<option value="${m.id}">${m.id} - ${m.product}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Nguồn Lực (Machinery/WC) <span style="color:#ef4444;">*</span></label>
                            <select id="schWcId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; color:#1e293b; outline:none; background:#f8fafc;">
                                <option value="">-- Chọn máy móc/tổ đội --</option>
                                ${workCenters.map(a => `<option value="${a.id}">${a.name} ${a.status === 'maintenance' ? '(Đang Bảo Trì!)' : ''}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Thời gian Bắt đầu</label>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <input type="number" id="schStart" value="8" min="0" max="23" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; text-align:center;">
                                    <span style="font-weight:900; color:#94a3b8;">h</span>
                                </div>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase;">Thời gian Kết thúc</label>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <input type="number" id="schEnd" value="12" min="0" max="23" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; text-align:center;">
                                    <span style="font-weight:900; color:#94a3b8;">h</span>
                                </div>
                        <div style="margin-top:16px; display:grid; grid-template-columns:1fr 2fr; gap:12px;">
                            <button onclick="document.getElementById('schModal').remove()" style="padding:16px; border:1.5px solid #e2e8f0; background:#fff; border-radius:16px; font-weight:800; color:#64748b; cursor:pointer;" onmouseover="this.style.background='#f8fafc'">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveSchedule()" style="padding:16px; background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color:#fff; border:none; border-radius:16px; font-weight:900; cursor:pointer; box-shadow:0 8px 20px -5px rgba(109, 40, 217, 0.4);">Ghi sổ Lịch trình</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveSchedule = async function () {
        const wcId = document.getElementById('schWcId').value;
        const moId = document.getElementById('schMoId').value;
        const projectId = document.getElementById('schProjectId').value;
        const start = parseInt(document.getElementById('schStart').value);
        const end = parseInt(document.getElementById('schEnd').value);

        if (!moId || !wcId || !projectId) { window.erpApp.showToast('Vui lòng chọn Dự án, MO và Work Center!', 'error'); return; }
        if (start >= end) { window.erpApp.showToast('Giờ kết thúc phải lớn hơn giờ bắt đầu!', 'error'); return; }

        const workCenters = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('erp_workCenters') : [];
        const wc = workCenters.find(w => w.id === wcId);

        const newSch = {
            id: 'SCH-' + Date.now().toString().slice(-4),
            projectId,
            moId, wcId,
            start: `2026-04-09T${start.toString().padStart(2, '0')}:00`,
            end: `2026-04-09T${end.toString().padStart(2, '0')}:00`,
            load: 100,
            note: 'Phân lịch từ hệ thống VIETBACCORP'
        };

        if (wc && wc.status === 'maintenance') {
            window.erpApp.showConfirm(
                'Cảnh báo bảo trì',
                `${wc.name} đang trong trạng thái bảo trì. Bạn có chắc chắn muốn xếp lịch không?`,
                function () {
                    window.erpApp._executeSaveSchedule(newSch);
                }
            );
        } else {
            window.erpApp._executeSaveSchedule(newSch);
        }
    };

    window.erpApp._executeSaveSchedule = async function (newSch) {
        schedules.unshift(newSch);
        window.erpApp._setData(COLLECTION_SCH, schedules);

        if (window.CrudSync) {
            await window.CrudSync.saveItem(COLLECTION_SCH, newSch, 'id');
        }

        // Gửi thông báo hệ thống
        if (window.erpApp && window.erpApp.addNotification) {
            window.erpApp.addNotification(
                `Đã xếp lịch sản xuất mới: ${newSch.moId} trên ${newSch.wcId}`,
                'event_available',
                'indigo',
                'san-xuat'
            );
        }

        window.erpApp.showToast('Đã ghi sổ lịch trình sản xuất thành công!', 'success');
        const modal = document.getElementById('schModal');
        if (modal) modal.remove();
        renderScheduling();
    };

    window.erpApp.deleteSchedule = function (id) {
        const schedule = schedules.find(x => x.id === id);

        if (schedule) {
            window.erpApp.showDeleteConfirmation(
                'Lịch trình',
                schedule.name || id,
                async function () {
                    const deletedItem = schedules.find(x => x.id === id);
                    schedules = schedules.filter(x => x.id !== id);
                    window.erpApp._setData(COLLECTION_SCH, schedules);

                    if (window.CrudSync && deletedItem) {
                        await window.CrudSync.deleteItem(COLLECTION_SCH, id, 'id');
                    }

                    // Gửi thông báo hệ thống
                    if (window.erpApp && window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Đã hủy lịch trình sản xuất: ${id}`,
                            'event_busy',
                            'red',
                            'san-xuat'
                        );
                    }

                    if (window.erpApp.showToast) { window.erpApp.showToast('Đã xóa lịch trình!', 'info'); }
                    const m = document.getElementById('schDetailModal');
                    if (m) { m.remove(); }
                    renderScheduling();
                }
            );
        }
    };

    window.erpApp.viewScheduleDetail = function (id) {
        const s = schedules.find(x => x.id === id);
        if (!s) { return; }
        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        const wc = workCenters.find(w => w.id === s.wcId);
        const startTime = new Date(s.start);
        const endTime = new Date(s.end);

        const modalHtml = `
            <div id="schDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(2px);" onclick="this.remove()">
                <div class="modal-content" style="width:480px; border-radius:32px; padding:36px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                        <span style="background:#f1f5f9; padding:4px 12px; border-radius:30px; font-size:10px; font-weight:900; color:#64748b; text-transform:uppercase;">Chi tiết công việc</span>
                        <button onclick="document.getElementById('schDetailModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="text-align:center; margin-bottom:32px;">
                        <h2 style="margin:0; font-size:24px; font-weight:950; color:#1e293b;">${s.moId}</h2>
                        <div style="font-size:14px; color:#3b82f6; font-weight:800; margin-top:4px;">${wc ? wc.name : 'N/A'}</div>
                    </div>

                    <div style="display:grid; gap:16px;">
                        <div style="background:#f8fafc; border-radius:20px; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div><div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Dự án</div><div style="font-size:14px; font-weight:800; color:#3b82f6; margin-top:2px;">${s.projectId || 'N/A'}</div></div>
                            ${(() => {
                const contracts = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmContracts') : [];
                const contract = contracts.find(c => c.projectId === s.projectId);
                return contract ? `<div><div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Ngày ký HĐ</div><div style="font-size:14px; font-weight:800; color:#10b981; margin-top:2px;">${contract.signDate}</div></div>` : '<div></div>';
            })()}
                            <div><div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Ngày làm việc</div><div style="font-size:15px; font-weight:800; color:#1e293b; margin-top:2px;">${startTime.toLocaleDateString('vi-VN')}</div></div>
                            <div style="text-align:right;"><div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Thời gian</div><div style="font-size:15px; font-weight:800; color:#1e293b; margin-top:2px;">${startTime.getHours()}h - ${endTime.getHours()}h</div></div>
                        </div>
                        
                        <div style="padding:0 8px;">
                            <div style="font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ghi chú điều phối</div>
                            <div style="font-size:14px; color:#475569; font-weight:600; line-height:1.5; font-style:italic;">"${s.note || 'Không có ghi chú.'}"</div>
                        </div>
                    </div>

                    <div style="margin-top:32px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <button onclick="window.erpApp.deleteSchedule('${s.id}')" style="padding:14px; background:#fef2f2; color:#ef4444; border:none; border-radius:14px; font-weight:800; cursor:pointer;">Hủy lịch</button>
                        <button onclick="document.getElementById('schDetailModal').remove()" style="padding:14px; background:#1e293b; color:#fff; border:none; border-radius:14px; font-weight:800; cursor:pointer;">Đóng</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.renderScheduling = renderScheduling;
    window.erpApp.schedules = schedules;
})();
