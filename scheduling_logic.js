(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    let schedules = [
        { id: 'SCH-001', moId: 'MO-2026-0041', wcId: 'WC-001', start: '2026-04-09T08:00', end: '2026-04-09T14:30', load: 85, note: 'Giai đoạn cắt Laser thô' },
        { id: 'SCH-002', moId: 'MO-2026-0042', wcId: 'WC-002', start: '2026-04-09T10:00', end: '2026-04-09T17:00', load: 100, note: 'May hoàn thiện' },
        { id: 'SCH-003', moId: 'MO-2026-0043', wcId: 'WC-001', start: '2026-04-10T08:00', end: '2026-04-10T12:00', load: 60, note: 'Kiểm tra lỗi bề mặt' }
    ];

    try {
        const savedSchedules = JSON.parse(localStorage.getItem('erp_productionSchedules'));
        if (savedSchedules && Array.isArray(savedSchedules)) schedules = savedSchedules;
    } catch (e) { console.error('Error loading schedules:', e); }

    function renderScheduling() {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Lịch trình sản xuất (Scheduling)';
        if (pageBadge) pageBadge.textContent = 'Kế hoạch & Điều hành';

        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

        // KPI Calculations
        const totalWc = workCenters.length;
        const activeWc = workCenters.filter(w => w.status === 'running').length;
        const maintenanceWc = workCenters.filter(w => w.status === 'maintenance').length;
        const avgOee = workCenters.length > 0 ? (workCenters.reduce((a, b) => a + (b.oee || 0), 0) / workCenters.length).toFixed(1) : 0;

        const html = `
            <div class="scheduling-module" style="animation: fadeIn 0.4s ease-out; padding: 2px;">
                <!-- Header Section -->
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:900; color:#1e293b; letter-spacing:-0.5px;">Bảng Điều Phối Lịch Sản Xuất</h2>
                            <div style="font-size:13px; color:#94a3b8; font-weight:600;">Sắp xếp và tối ưu hóa tài nguyên máy móc (Work Centers)</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.renderScheduling()" style="width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid #e2e8f0; border-radius:12px; color:#64748b; cursor:pointer;"><span class="material-icons-outlined">refresh</span></button>
                        <button onclick="window.erpApp.openScheduleModal()" style="padding:12px 28px; background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color:#fff; border:none; border-radius:14px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(139, 92, 246, 0.4); transform: translateY(0); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <span class="material-icons-outlined">add_task</span> Xếp lịch mới
                        </button>
                    </div>
                </div>

                <!-- KPI Section -->
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="premium-card shadow-sm" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:24px; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#eff6ff; color:#3b82f6; border-radius:14px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">settings_suggest</span></div>
                        <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tổng Work Centers</div><div style="font-size:22px; font-weight:950; color:#1e293b;">${totalWc}</div></div>
                    </div>
                    <div class="premium-card shadow-sm" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:24px; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#ecfdf5; color:#10b981; border-radius:14px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">bolt</span></div>
                        <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Đang hoạt động</div><div style="font-size:22px; font-weight:950; color:#10b981;">${activeWc} <span style="font-size:13px; font-weight:700; color:#94a3b8;">/ ${totalWc}</span></div></div>
                    </div>
                    <div class="premium-card shadow-sm" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:24px; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; background:#fef2f2; color:#ef4444; border-radius:14px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">build</span></div>
                        <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Đang bảo trì</div><div style="font-size:22px; font-weight:950; color:#ef4444;">${maintenanceWc}</div></div>
                    </div>
                    <div class="premium-card shadow-sm" style="background:linear-gradient(135deg, #1e293b, #0f172a); border:1px solid #e2e8f0; padding:20px; border-radius:24px; display:flex; align-items:center; gap:16px; color:#fff;">
                        <div style="width:48px; height:48px; background:rgba(255,255,255,0.1); color:#fff; border-radius:14px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">analytics</span></div>
                        <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; color:rgba(255,255,255,0.6);">Hiệu suất OEE TB</div><div style="font-size:22px; font-weight:950; color:#fff;">${avgOee}%</div></div>
                    </div>
                </div>

                <!-- Timeline Gantt Chart -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:28px; padding:32px; overflow-x:auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);">
                    <div style="min-width:1100px;">
                        <!-- Timeline Header (Hours) -->
                        <div style="display:grid; grid-template-columns: 240px repeat(${hours.length}, 1fr); border-bottom:2px solid #f1f5f9; padding-bottom:16px; margin-bottom:16px;">
                            <div style="font-weight:900; color:#1e293b; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Nguồn lực (Máy/Tổ)</div>
                            ${hours.map(h => `<div style="text-align:center; font-size:11px; font-weight:800; color:#94a3b8;">${h}:00</div>`).join('')}
                        </div>

                        <!-- Resources Rows -->
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${workCenters.map(wc => {
                                const wcSchedules = schedules.filter(s => s.wcId === wc.id);
                                const isDown = wc.status === 'maintenance';
                                
                                return `
                                <div style="display:grid; grid-template-columns: 240px repeat(${hours.length}, 1fr); min-height:80px; position:relative; background:${isDown ? '#fff1f2' : (wcSchedules.length > 0 ? '#fbfcfe' : 'transparent')}; border-radius:16px; align-items:center; transition: background 0.2s;">
                                    <div style="padding:16px; display:flex; align-items:center; gap:12px; border-right:1px solid #f1f5f9;">
                                        <div style="width:12px; height:12px; border-radius:50%; background:${isDown ? '#ef4444' : '#10b981'}; box-shadow: 0 0 8px ${isDown ? '#ef444433' : '#10b98133'}"></div>
                                        <div style="flex:1;">
                                            <div style="font-size:14px; font-weight:900; color:#1e293b;">${wc.name}</div>
                                            <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-top:2px;">${wc.id} • ${wc.type}</div>
                                        </div>
                                    </div>
                                    
                                    ${hours.map(() => `<div style="border-left:1px dashed #f1f5f9; height:100%;"></div>`).join('')}
                                    
                                    <!-- Render scheduled blocks -->
                                    ${wcSchedules.map(s => {
                                        const startDate = new Date(s.start);
                                        const startHour = startDate.getHours() + startDate.getMinutes()/60;
                                        const endDate = new Date(s.end);
                                        const endHour = endDate.getHours() + endDate.getMinutes()/60;
                                        
                                        // Calculate grid position (Start Hour 8 = Col 2)
                                        const colStart = Math.max(0, startHour - 8);
                                        const colSpan = Math.min(hours.length, endHour - startHour);
                                        
                                        if (colStart > hours.length) return '';
                                        
                                        return `
                                            <div onclick="window.erpApp.viewScheduleDetail('${s.id}')" style="position:absolute; left:calc(240px + ${colStart * (100 / hours.length)}%); width:calc(${colSpan * (100 / hours.length)}%); height:54px; top:13px; background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius:14px; color:#fff; display:flex; flex-direction:column; justify-content:center; padding-left:14px; box-shadow:0 8px 15px -3px rgba(109, 40, 217, 0.3); border:2px solid #fff; cursor:pointer; z-index:2; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.02)'; this.style.zIndex='10'" onmouseout="this.style.transform='scale(1)'; this.style.zIndex='2'">
                                                <div style="font-size:11px; font-weight:900; letter-spacing:0.3px;">${s.moId}</div>
                                                <div style="font-size:9px; font-weight:700; opacity:0.85; margin-top:2px;">${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2,'0')} - ${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2,'0')}</div>
                                            </div>
                                        `;
                                    }).join('')}

                                    ${isDown ? `
                                        <div style="position:absolute; left:240px; right:0; top:0; bottom:0; background: repeating-linear-gradient(45deg, rgba(239, 68, 68, 0.03), rgba(239, 68, 68, 0.03) 10px, transparent 10px, transparent 20px); border-radius:16px; display:flex; align-items:center; justify-content:center; z-index:1;">
                                            <div style="color:#ef4444; font-size:11px; font-weight:900; background:#fff; padding:6px 16px; border-radius:30px; border:1.5px solid #ef4444; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);">BẢO TRÌ ĐỊNH KỲ - NO SCHEDULING</div>
                                        </div>
                                    ` : ''}
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Secondary Info Section -->
                <div style="margin-top:32px; display:grid; grid-template-columns: 1.8fr 1fr; gap:32px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:28px; padding:28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                             <h3 style="margin:0; font-size:17px; font-weight:950; color:#1e293b;">Danh sách Phân bổ & Điều hành</h3>
                             <div style="font-size:12px; font-weight:800; color:#94a3b8;">${schedules.length} công việc đang xếp lịch</div>
                         </div>
                         <div style="display:flex; flex-direction:column; gap:12px;">
                            ${schedules.length === 0 ? `<div style="text-align:center; padding:40px; color:#94a3b8; font-weight:700;">Chưa có công việc nào được xếp lịch.</div>` : 
                                schedules.map(s => {
                                    const wcArr = workCenters.find(w => w.id === s.wcId);
                                    return `
                                    <div class="schedule-item" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; background:#f8fafc; border-radius:20px; border:1px solid #f1f5f9; cursor:pointer; transition: all 0.2s;" onclick="window.erpApp.viewScheduleDetail('${s.id}')" onmouseover="this.style.background='#fff'; this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#f1f5f9'; this.style.boxShadow='none'">
                                        <div style="display:flex; align-items:center; gap:18px;">
                                            <div style="width:44px; height:44px; background:#fff; border-radius:12px; box-shadow:0 3px 6px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; color:#8b5cf6;">
                                                <span class="material-icons-outlined">precision_manufacturing</span>
                                            </div>
                                            <div>
                                                <div style="font-weight:900; color:#1e293b; font-size:15px; letter-spacing:-0.2px;">${s.moId}</div>
                                                <div style="font-size:12px; color:#64748b; font-weight:650; margin-top:2px;">Gán cho: <span style="color:#3b82f6;">${wcArr ? wcArr.name : 'N/A'}</span></div>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:13px; font-weight:900; color:#475569;">${new Date(s.start).toLocaleDateString('vi-VN')}</div>
                                            <div style="font-size:11px; font-weight:800; color:#94a3b8; background:#fff; padding:2px 8px; border-radius:6px; margin-top:4px; display:inline-block; border:1px solid #f1f5f9;">${new Date(s.start).getHours()}h:${new Date(s.start).getMinutes().toString().padStart(2,'0')} - ${new Date(s.end).getHours()}h:${new Date(s.end).getMinutes().toString().padStart(2,'0')}</div>
                                        </div>
                                    </div>
                                    `;
                                }).slice(0, 5).join('')}
                         </div>
                    </div>

                    <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:28px; padding:32px; color:#fff; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2);">
                         <div style="width:56px; height:56px; background:rgba(255,255,255,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:24px;">
                             <span class="material-icons-outlined" style="font-size:32px; color:#8b5cf6;">tips_and_updates</span>
                         </div>
                         <h3 style="margin:0 0 16px 0; font-size:18px; font-weight:950; letter-spacing:-0.5px;">Tư duy Điều hành Thông minh</h3>
                         <p style="font-size:14px; color:#94a3b8; line-height:1.6; margin-bottom:28px; font-weight:500;">Sắp xếp lịch trình dựa trên công suất thực tế giúp giảm thiểu gánh nặng cho máy móc và tránh tình trạng "thắt nút cổ chai" trong xưởng.</p>
                         
                         <div style="display:flex; flex-direction:column; gap:16px;">
                            <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:20px; border:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:10px; font-weight:800; color:#3b82f6; text-transform:uppercase; letter-spacing:1px;">Cảnh báo xung đột</div>
                                <div style="font-size:18px; font-weight:900; margin:8px 0; color:#f8fafc;">Không có xung đột</div>
                                <div style="font-size:11px; color:#94a3b8; font-weight:600;">Lịch trình hiện tại đang được tối ưu hóa.</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:20px; border:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:10px; font-weight:800; color:#10b981; text-transform:uppercase; letter-spacing:1px;">Trạng thái deadline</div>
                                <div style="font-size:18px; font-weight:900; margin:8px 0; color:#f8fafc;">100% Theo đúng hạn</div>
                                <div style="font-size:11px; color:#94a3b8; font-weight:600;">Tất cả MO được xếp lịch đảm bảo ngày giao.</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) pageContent.innerHTML = html;
        window.scrollTo(0, 0);
    }

    window.erpApp.openScheduleModal = function() {
        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        const manufacturingOrders = JSON.parse(localStorage.getItem('erp_manufacturingOrders')) || [];
        
        const modalHtml = `
            <div id="schModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);" onclick="this.remove()">
                <div class="modal-content" style="width:520px; border-radius:32px; padding:36px; background:#fff; position:relative;" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                        <h2 style="margin:0; font-size:20px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">Phân Lịch Sản Xuất Mới</h2>
                        <button onclick="document.getElementById('schModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:20px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Lệnh Sản Xuất (MO) <span style="color:#ef4444;">*</span></label>
                            <select id="schMoId" style="width:100%; padding:14px; border:1px solid #e2e8f0; border-radius:16px; font-weight:700; color:#1e293b; outline:none; background:#f8fafc;">
                                <option value="">-- Chọn lệnh sx --</option>
                                ${manufacturingOrders.map(m => `<option value="${m.id}">${m.id} - ${m.product}</option>`).join('')}
                            </select>
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
                            </div>
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

    window.erpApp.saveSchedule = function() {
        const wcId = document.getElementById('schWcId').value;
        const moId = document.getElementById('schMoId').value;
        const start = parseInt(document.getElementById('schStart').value);
        const end = parseInt(document.getElementById('schEnd').value);

        if (!moId || !wcId) { if(typeof showToast === 'function') showToast('Vui lòng chọn MO và Work Center!', 'error'); return; }
        if (start >= end) { if(typeof showToast === 'function') showToast('Giờ kết thúc phải lớn hơn giờ bắt đầu!', 'error'); return; }

        const workCenters = window.erpApp.workCenters || JSON.parse(localStorage.getItem('erp_workCenters')) || [];
        const wc = workCenters.find(w => w.id === wcId);
        if (wc && wc.status === 'maintenance') {
            if (!confirm(`Cảnh báo: ${wc.name} đang trong trạng thái bảo trì. Bạn có chắc chắn muốn xếp lịch không?`)) return;
        }

        const newSch = {
            id: 'SCH-' + Date.now().toString().slice(-4),
            moId, wcId,
            start: `2026-04-09T${start.toString().padStart(2,'0')}:00`,
            end: `2026-04-09T${end.toString().padStart(2,'0')}:00`,
            load: 100,
            note: 'Phân lịch từ hệ thống ERP'
        };

        schedules.unshift(newSch);
        localStorage.setItem('erp_productionSchedules', JSON.stringify(schedules));
        if(typeof showToast === 'function') showToast('Đã ghi sổ lịch trình sản xuất thành công!', 'success');
        document.getElementById('schModal').remove();
        renderScheduling();
    };

    window.erpApp.viewScheduleDetail = function(id) {
        const s = schedules.find(x => x.id === id);
        if(!s) return;
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
                        <div style="background:#f8fafc; border-radius:20px; padding:20px; display:flex; justify-content:space-between; align-items:center;">
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

    window.erpApp.deleteSchedule = function(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;
        schedules = schedules.filter(x => x.id !== id);
        localStorage.setItem('erp_productionSchedules', JSON.stringify(schedules));
        if(typeof showToast === 'function') showToast('Đã xóa lịch trình!');
        const m = document.getElementById('schDetailModal');
        if(m) m.remove();
        renderScheduling();
    };

    window.erpApp.renderScheduling = renderScheduling;
    window.erpApp.schedules = schedules;
})();
