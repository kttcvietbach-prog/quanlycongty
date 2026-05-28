(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    const COLLECTION_WC = 'erp_workCenters';
    let workCenters = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData(COLLECTION_WC) : [];

    function renderWC() {
        if (window.erpApp && window.erpApp.updateBreadcrumb) {
            window.erpApp.updateBreadcrumb('Work Centers (Năng lực sản xuất)', 'Sản xuất');
        }
        window.erpApp.activeProductionSubModule = 'wc';
        const pageBadge = document.getElementById('pageBadge');
        const pageContent = document.getElementById('pageContent');

        if (pageBadge) {pageBadge.textContent = 'Sản xuất';}

        // Calculate Stats
        const totalWc = workCenters.length;
        const runningWc = workCenters.filter(w => w.status === 'running').length;
        const avgOee = totalWc > 0 ? (workCenters.reduce((sum, w) => sum + (parseFloat(w.oee) || 0), 0) / totalWc).toFixed(1) : 0;
        const totalCapacity = workCenters.reduce((sum, w) => sum + (parseFloat(w.capacity) || 0), 0);

        const html = `
            <div class="wc-module-v2" style="animation: fadeIn 0.5s ease-out; padding-bottom: 40px;">
                <!-- Toolbar -->
                <div class="employee-toolbar" style="margin-bottom:20px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                </div>
                <!-- Header Section -->
                <div class="pm-page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <div>
                        <h2 style="margin:0; font-size:26px; font-weight:900; color:#1e293b; letter-spacing:-0.02em; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="font-size:32px; color:#10b981;">precision_manufacturing</span>
                            Quản lý Nguồn lực Sản xuất
                        </h2>
                        <div style="font-size:14px; color:#64748b; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">info</span>
                            Giám sát trạng thái thiết bị và hiệu suất vận hành (OEE) theo thời gian thực
                        </div>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.openWcModal()" style="padding:12px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:16px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 20px -5px rgba(16, 185, 129, 0.3); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <span class="material-icons-outlined">add_circle</span> Thêm Nguồn lực
                        </button>
                    </div>
                </div>

                <!-- Stats Dashboard -->
                <div class="pm-dash-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:32px;">
                    <div class="pm-stat-card" style="animation-delay: 0.1s;">
                        <div class="pm-stat-card-icon blue"><span class="material-icons-outlined">settings_input_component</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng nguồn lực</div>
                            <div class="pm-stat-card-value">${totalWc}</div>
                            <div class="pm-stat-card-sub">Máy móc & Dây chuyền</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="animation-delay: 0.2s;">
                        <div class="pm-stat-card-icon green"><span class="material-icons-outlined">bolt</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Đang vận hành</div>
                            <div class="pm-stat-card-value">${runningWc}</div>
                            <div class="pm-stat-card-sub">${((runningWc/totalWc || 0)*100).toFixed(0)}% Tỷ lệ hữu dụng</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="animation-delay: 0.3s;">
                        <div class="pm-stat-card-icon orange"><span class="material-icons-outlined">speed</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Hiệu suất OEE TB</div>
                            <div class="pm-stat-card-value">${avgOee}%</div>
                            <div class="pm-stat-card-sub">Toàn bộ nhà máy</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="animation-delay: 0.4s;">
                        <div class="pm-stat-card-icon indigo"><span class="material-icons-outlined">factory</span></div>
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng công suất</div>
                            <div class="pm-stat-card-value">${window.erpApp.formatValue(totalCapacity)}</div>
                            <div class="pm-stat-card-sub">Đơn vị sản phẩm/ngày</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:24px;">
                    ${workCenters.map((wc, index) => {
                        const statusColor = wc.status === 'running' ? '#10b981' : (wc.status === 'maintenance' ? '#ef4444' : '#94a3b8');
                        const statusBg = wc.status === 'running' ? '#f0fdf4' : (wc.status === 'maintenance' ? '#fef2f2' : '#f8fafc');
                        const oee = parseFloat(wc.oee) || 0;
                        const oeeColor = oee > 85 ? '#10b981' : (oee > 60 ? '#f59e0b' : '#ef4444');

                        return `
                        <div class="premium-wc-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:32px; padding:28px; box-shadow:0 12px 24px -8px rgba(0,0,0,0.05); position:relative; overflow:hidden; transition:all 0.3s ease; animation: fadeInUp 0.5s ease-out backwards; animation-delay: ${0.1 + (index * 0.05)}s;"
                             onmouseover="this.style.transform='translateY(-6px)'; this.style.borderColor='#10b981'; this.style.boxShadow='0 20px 40px -12px rgba(16, 185, 129, 0.12)'" 
                             onmouseout="this.style.transform='none'; this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 12px 24px -8px rgba(0,0,0,0.05)'">
                            
                            <!-- Corner Accent -->
                            <div style="position:absolute; right:-20px; top:-20px; width:100px; height:100px; background:${statusBg}; border-radius:50%; z-index:0; transition:all 0.3s;"></div>
                            
                            <div style="position:relative; z-index:1;">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
                                    <div style="width:56px; height:56px; border-radius:18px; background:linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); color:#fff; box-shadow:0 8px 16px -4px ${statusColor}44; display:flex; align-items:center; justify-content:center;">
                                        <span class="material-icons-outlined" style="font-size:28px;">${wc.type === 'Máy cắt' ? 'content_cut' : (wc.type === 'Dây chuyền' ? 'conveyor_belt' : 'precision_manufacturing')}</span>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="display:flex; align-items:center; gap:6px; justify-content:flex-end;">
                                            <span style="width:8px; height:8px; border-radius:50%; background:${statusColor}; display:inline-block; animation: pulse 2s infinite;"></span>
                                            <span style="font-size:11px; font-weight:900; text-transform:uppercase; color:${statusColor}; letter-spacing:0.5px;">${wc.status === 'running' ? 'Đang chạy' : (wc.status === 'maintenance' ? 'Bảo trì' : 'Tạm dừng')}</span>
                                        </div>
                                        <div style="margin-top:8px;">
                                            <div style="font-size:12px; font-weight:700; color:#94a3b8;">Hiệu suất OEE</div>
                                            <div style="font-size:24px; font-weight:950; color:${oeeColor}; letter-spacing:-1px;">${oee}%</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 style="margin:0 0 6px 0; font-size:20px; font-weight:900; color:#1e293b;">${wc.name}</h3>
                                <div style="font-size:12px; font-weight:700; color:#94a3b8; display:flex; align-items:center; gap:8px;">
                                    <span style="background:#f1f5f9; padding:2px 8px; border-radius:6px; color:#475569;">${wc.id}</span>
                                    <span>•</span>
                                    <span style="color:#64748b;">${wc.type}</span>
                                </div>

                                <!-- Progress Bar for OEE -->
                                <div style="margin:20px 0 24px 0;">
                                    <div style="height:8px; width:100%; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                        <div style="width:${oee}%; height:100%; background:linear-gradient(90deg, ${oeeColor} 0%, ${oeeColor}aa 100%); border-radius:10px; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
                                    </div>
                                </div>

                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
                                    <div style="background:#f8fafc; padding:14px; border-radius:20px; border:1px solid #f1f5f9; transition:all 0.2s;">
                                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Công suất thiết kế</div>
                                        <div style="font-size:16px; font-weight:900; color:#1e293b;">${wc.capacity} <span style="font-size:12px; color:#94a3b8;">${wc.unit}</span></div>
                                    </div>
                                    <div style="background:#f8fafc; padding:14px; border-radius:20px; border:1px solid #f1f5f9; transition:all 0.2s;">
                                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Công suất thực tế</div>
                                        <div style="font-size:16px; font-weight:900; color:#3b82f6;">${Math.round(wc.capacity * oee / 100)} <span style="font-size:12px; color:#94a3b8;">${wc.unit}</span></div>
                                    </div>
                                </div>

                                <div style="display:flex; gap:12px;">
                                    <button onclick="window.erpApp.openWcModal('${wc.id}')" style="flex:1; padding:12px; background:#f1f5f9; border:none; border-radius:16px; color:#475569; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                                        <span class="material-icons-outlined" style="font-size:18px;">edit_note</span> Cấu hình
                                    </button>
                                    <button onclick="window.erpApp.deleteWC('${wc.id}')" style="width:48px; height:48px; background:#fef2f2; border:none; border-radius:16px; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                                        <span class="material-icons-outlined" style="font-size:20px;">delete_outline</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .premium-wc-card:hover .material-icons-outlined {
                    transform: rotate(15deg) scale(1.1);
                    transition: all 0.3s;
                }
            </style>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    }

    window.erpApp.openWcModal = function(id = null) {
        const wc = id ? workCenters.find(w => w.id === id) : null;
        const modalHtml = `
            <div id="wcModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s ease-out; z-index:1100; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);" onclick="this.remove()">
                <div class="modal-content" style="width:520px; border-radius:32px; padding:40px; background:#fff; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:950; color:#1e293b; letter-spacing:-0.5px;">${id ? 'Cấu hình Nguồn lực' : 'Thêm Nguồn lực Sản xuất'}</h2>
                            <div style="font-size:13px; color:#64748b; font-weight:600; margin-top:4px;">Thiết lập thông số kỹ thuật và hiệu suất vận hành</div>
                        </div>
                        <button onclick="document.getElementById('wcModal').remove()" style="background:#f1f5f9; border:none; border-radius:12px; width:40px; height:40px; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    
                    <div style="display:grid; gap:24px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Tên Work Center <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="wcName" value="${wc ? wc.name : ''}" placeholder="Nhập tên thiết bị/dây chuyền..." style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#10b981'">
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Loại nguồn lực</label>
                                <select id="wcType" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; background:#fff; cursor:pointer;">
                                    <option value="Máy cắt" ${wc && wc.type === 'Máy cắt' ? 'selected' : ''}>Máy móc cơ khí</option>
                                    <option value="Dây chuyền" ${wc && wc.type === 'Dây chuyền' ? 'selected' : ''}>Dây chuyền sản xuất</option>
                                    <option value="Robot" ${wc && wc.type === 'Robot' ? 'selected' : ''}>Robot / CNC tự động</option>
                                    <option value="Tổ thủ công" ${wc && wc.type === 'Tổ thủ công' ? 'selected' : ''}>Tổ đội thi công</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Trạng thái vận hành</label>
                                <select id="wcStatus" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; background:#fff; cursor:pointer;">
                                    <option value="running" ${wc && wc.status === 'running' ? 'selected' : ''}>Đang hoạt động</option>
                                    <option value="idle" ${wc && wc.status === 'idle' ? 'selected' : ''}>Đang chờ (Idle)</option>
                                    <option value="maintenance" ${wc && wc.status === 'maintenance' ? 'selected' : ''}>Đang bảo trì</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Công suất tối đa (Design)</label>
                                <input type="number" id="wcCapacity" value="${wc ? wc.capacity : 100}" style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Đơn vị tính</label>
                                <input type="text" id="wcUnit" value="${wc ? wc.unit : 'SP/h'}" placeholder="VD: Mét/h, Tấn/ngày..." style="width:100%; padding:16px; border:1.5px solid #e2e8f0; border-radius:18px; font-weight:700; font-size:15px; outline:none;">
                            </div>
                        </div>
                        
                        <div style="margin-top:24px; display:grid; grid-template-columns:1fr 2fr; gap:16px;">
                            <button onclick="document.getElementById('wcModal').remove()" style="padding:16px; border:1.5px solid #e2e8f0; background:#fff; border-radius:20px; font-weight:800; color:#64748b; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'">Hủy bỏ</button>
                            <button onclick="window.erpApp.saveWC('${id || ''}')" style="padding:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:20px; font-weight:900; cursor:pointer; box-shadow:0 8px 16px -4px rgba(16, 185, 129, 0.3); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">Lưu cấu hình nguồn lực</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.saveWC = async function(id) {
        const name = document.getElementById('wcName').value;
        const type = document.getElementById('wcType').value;
        const status = document.getElementById('wcStatus').value;
        const capacity = parseFloat(document.getElementById('wcCapacity').value);
        const unit = document.getElementById('wcUnit').value;

        if (!name) {
            window.erpApp.showToast('Vui lòng nhập tên Work Center!', 'error');
            return;
        }

        const newWc = {
            id: id || ('WC-' + (workCenters.length + 1).toString().padStart(3, '0')),
            name, type, status, capacity, unit,
            oee: id ? workCenters.find(w => w.id === id).oee : 80
        };

        if (id) {
            const idx = workCenters.findIndex(w => w.id === id);
            workCenters[idx] = newWc;
        } else {
            workCenters.push(newWc);
        }

        window.erpApp._setData(COLLECTION_WC, workCenters);
        window.workCenters = workCenters;

        if (window.CrudSync) {
            await window.CrudSync.saveItem('workCenters', newWc, 'id');
        }

        document.getElementById('wcModal').remove();
        renderWC();
        window.erpApp.showToast('Đã lưu nguồn lực sản xuất thành công!', 'success');
    };

    window.erpApp.deleteWC = function(id) {
        const wc = workCenters.find(w => w.id === id);
        if (!wc) return;

        window.erpApp.showDeleteConfirmation(
            'Nguồn lực',
            wc.name,
            async function() {
                const idx = workCenters.findIndex(w => w.id === id);
                if (idx !== -1) {
                    workCenters.splice(idx, 1);
                    window.erpApp._setData(COLLECTION_WC, workCenters);
                    window.workCenters = workCenters;
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('workCenters', id, 'id');
                    }
                    renderWC();
                    window.erpApp.showToast('Đã xóa nguồn lực sản xuất.', 'info');
                }
            }
        );
    };

    window.erpApp.renderWorkCenters = renderWC;
})();
