
    // ==========================================
    // MODULE: Quy trình sản xuất (Routing)
    // ==========================================
    let routingSearchQuery = '';
    let routings = [
        { 
            id: 'RT-S001', 
            name: 'Quy trình May Sơ mi tiêu chuẩn', 
            version: '1.0', 
            status: 'active',
            steps: [
                { op: 'Cắt vải', workCenter: 'Xưởng Cắt Laser 01', duration: 10, laborCost: 5000, desc: 'Cắt vải theo rập sơ mi' },
                { op: 'May cổ & tay', workCenter: 'Tổ May Công Nghiệp A2', duration: 45, laborCost: 25000, desc: 'May ráp chi tiết phụ' },
                { op: 'Ráp thân áo', workCenter: 'Tổ May Công Nghiệp A2', duration: 30, laborCost: 15000, desc: 'May hoàn thiện form' }
            ]
        },
        { 
            id: 'RT-Q002', 
            name: 'Quy trình Sản xuất Quần Tây', 
            version: '1.2', 
            status: 'draft',
            steps: [
                { op: 'Cắt phôi', workCenter: 'Xưởng Cắt Laser 01', duration: 15, laborCost: 7000, desc: 'Cắt chân quần' },
                { op: 'May vắt sổ', workCenter: 'Tổ May Công Nghiệp A2', duration: 20, laborCost: 10000, desc: 'Xử lý mép vải' }
            ]
        }
    ];

    try {
        const savedRoutings = JSON.parse(localStorage.getItem('erp_routings'));
        if (savedRoutings && Array.isArray(savedRoutings)) {
            routings = savedRoutings;
        }
    } catch (e) {}

    function renderRouting() {
        breadcrumbCurrent.textContent = 'Quy trình sản xuất (Routing)';
        pageBadge.textContent = 'Sản xuất';

        const filtered = routings.filter(r => 
            r.name.toLowerCase().includes(routingSearchQuery.toLowerCase()) || 
            r.id.toLowerCase().includes(routingSearchQuery.toLowerCase())
        );

        const html = `
            <div class="routing-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('san-xuat')" style="padding:10px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:12px; display:flex; align-items:center; gap:8px; font-weight:700; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div class="search-box" style="position:relative; width:350px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;">search</span>
                            <input type="text" placeholder="Tìm tên quy trình, mã RT..." value="${routingSearchQuery}" 
                                oninput="window.erpApp.handleRoutingSearch(this.value)"
                                style="width:100%; padding:12px 12px 12px 42px; border:1px solid #e2e8f0; border-radius:14px; outline:none; font-size:14px;">
                        </div>
                    </div>
                    <button onclick="window.erpApp.openRoutingModal()" style="padding:12px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(59, 130, 246, 0.3);">
                        <span class="material-icons-outlined">route</span> Thiết lập Quy trình mới
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap:24px;">
                    ${filtered.map(r => {
                        const totalTime = r.steps.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);
                        const totalLabor = r.steps.reduce((sum, s) => sum + (parseInt(s.laborCost) || 0), 0);
                        return `
                        <div class="routing-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); cursor:pointer;" onclick="window.erpApp.openRoutingModal('${r.id}')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                                <div>
                                    <div style="font-size:11px; font-weight:800; color:#3b82f6; letter-spacing:1px; margin-bottom:4px;">${r.id} | v${r.version}</div>
                                    <h3 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${r.name}</h3>
                                </div>
                                <span style="padding:6px 12px; border-radius:30px; font-size:10px; font-weight:800; text-transform:uppercase; background:${r.status === 'active' ? '#dcfce7' : '#f1f5f9'}; color:${r.status === 'active' ? '#16a34a' : '#64748b'}">
                                    ${r.status === 'active' ? 'Đang áp dụng' : 'Bản thảo'}
                                </span>
                            </div>

                            <div style="display:flex; gap:12px; margin-bottom:20px;">
                                <div style="flex:1; background:#f8fafc; padding:12px; border-radius:16px; display:flex; align-items:center; gap:10px;">
                                    <span class="material-icons-outlined" style="color:#64748b; font-size:20px;">timer</span>
                                    <div>
                                        <div style="font-size:10px; color:#94a3b8; font-weight:800;">TỔNG THỜI GIAN</div>
                                        <div style="font-weight:900; color:#1e293b;">${totalTime} phút</div>
                                    </div>
                                </div>
                                <div style="flex:1; background:#f0fdf4; padding:12px; border-radius:16px; display:flex; align-items:center; gap:10px;">
                                    <span class="material-icons-outlined" style="color:#10b981; font-size:20px;">payments</span>
                                    <div>
                                        <div style="font-size:10px; color:#94a3b8; font-weight:800;">NHÂN CÔNG DỰ KIẾN</div>
                                        <div style="font-weight:900; color:#059669;">${new Intl.NumberFormat('vi-VN').format(totalLabor)} đ</div>
                                    </div>
                                </div>
                            </div>

                            <div style="border-top:1px solid #f1f5f9; padding-top:16px;">
                                <div style="font-size:12px; font-weight:800; color:#94a3b8; margin-bottom:12px;">TRÌNH TỰ CÔNG ĐOẠN (${r.steps.length})</div>
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    ${r.steps.slice(0, 3).map((s, idx) => `
                                        <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:#475569;">
                                            <div style="width:20px; height:20px; border-radius:50%; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900;">${idx + 1}</div>
                                            <span style="font-weight:600;">${s.op}</span>
                                            <span style="color:#94a3b8; font-size:11px;">@ ${s.workCenter}</span>
                                        </div>
                                    `).join('')}
                                    ${r.steps.length > 3 ? `<div style="font-size:11px; color:#94a3b8; font-weight:600; padding-left:30px;">+ ${r.steps.length - 3} công đoạn khác...</div>` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
    }

    window.erpApp.handleRoutingSearch = function(val) {
        routingSearchQuery = val;
        renderRouting();
    };

    window.erpApp.openRoutingModal = function(id = null) {
        const rt = id ? routings.find(x => x.id === id) : {
            id: `RT-${Date.now().toString().slice(-4)}`,
            name: '',
            version: '1.0',
            status: 'active',
            steps: []
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'rtModal';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; height: 90vh;">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">route</span> ${id ? 'Cập nhật Quy trình' : 'Thiết lập Quy trình mới'}</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeRtModal()"><span class="material-icons-outlined">close</span></button>
                </div>

                <div class="modal-body" style="background: var(--bg-body); padding: 24px; display: grid; gap: 24px;">
                    <div class="premium-card bg-light">
                        <h4 class="premium-section-title">
                            <span class="material-icons-outlined">settings_suggest</span> Cấu hình Luồng công việc
                        </h4>
                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:16px;">
                            <div class="form-group">
                                <label>Tên Quy trình Sản xuất <span style="color:var(--status-red)">*</span></label>
                                <input type="text" id="rtName" class="form-control" value="${rt.name}" placeholder="VD: Quy trình May sơ mi, Lắp ráp chi tiết..." style="font-weight: 700;">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                                <div class="form-group">
                                    <label>Phiên bản</label>
                                    <input type="text" id="rtVer" class="form-control" value="${rt.version}" style="font-weight:700; text-align:center;">
                                </div>
                                <div class="form-group">
                                    <label>Mã định danh</label>
                                    <input type="text" id="rtId" class="form-control" value="${rt.id}" readonly style="background:#f1f5f9; font-weight:700; color:var(--primary); text-align:center;">
                                </div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:12px 20px; border-radius:12px; border:1px solid var(--border-color);">
                            <div style="display:flex; align-items:center; gap:32px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons-outlined" style="color:var(--text-muted); font-size:20px;">schedule</span>
                                    <span id="totalRtTime" style="font-weight:900; color:var(--text-primary); font-size:15px;">0 phút</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons-outlined" style="color:#10b981; font-size:20px;">payments</span>
                                    <span id="totalRtLabor" style="font-weight:900; color:#059669; font-size:15px;">0 đ</span>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <label style="font-size:13px; font-weight:700; color:var(--text-muted);">Trạng thái:</label>
                                <select id="rtStatus" class="form-control" style="width:auto; height:36px; padding:0 12px; font-size:13px; font-weight:700; color:var(--primary);">
                                    <option value="active" ${rt.status === 'active' ? 'selected' : ''}>Kích hoạt</option>
                                    <option value="draft" ${rt.status === 'draft' ? 'selected' : ''}>Bản thảo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h4 class="premium-section-title" style="margin-bottom:0; border-bottom:0; padding-bottom:0;">
                                <span class="material-icons-outlined">account_tree</span> Danh sách Công đoạn
                            </h4>
                            <button class="btn-primary" onclick="window.erpApp.addRoutingStep()" style="padding:8px 16px; font-size:12px; border-radius:8px;">
                                <span class="material-icons-outlined">playlist_add</span> Thêm bước sản xuất
                            </button>
                        </div>

                        <div id="routingStepsList" style="display:grid; gap:16px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                            ${rt.steps.map((s, idx) => renderRoutingStepRow(s, idx)).join('')}
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" onclick="window.erpApp.closeRtModal()">Đóng</button>
                    <button type="button" class="btn-save" onclick="window.erpApp.saveRouting()"><span class="material-icons-outlined">save</span> Lưu cấu hình Quy trình</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        window.erpApp.updateRtTotals();
    };
        window.erpApp.updateRtTotals();
    };

    function renderRoutingStepRow(step = { op: '', workCenter: '', duration: 10, laborCost: 0, desc: '' }, index) {
        const wcOptions = workCenters.map(wc => `<option value="${wc.name}" ${step.workCenter === wc.name ? 'selected' : ''}>${wc.name}</option>`).join('');
        return `
            <div class="rt-step-row" style="background:#f8fafc; border:1px solid var(--border-color); border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:16px; position:relative;">
                <div style="display:grid; grid-template-columns: 2fr 1.5fr 100px 140px 40px; gap:16px; align-items:flex-end;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:11px;">CÔNG ĐOẠN</label>
                        <input type="text" class="step-op form-control" value="${step.op}" placeholder="VD: Cắt phôi, Ráp thân..." style="font-weight:700;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:11px;">XƯỞNG / WORK CENTER</label>
                        <select class="step-wc form-control" style="font-weight:600;">
                            ${wcOptions || '<option value="">(Chọn Work Center)</option>'}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:11px; text-align:center;">T.GIAN (PHÚT)</label>
                        <input type="number" class="step-dur form-control" value="${step.duration}" oninput="window.erpApp.updateRtTotals()" style="font-weight:700; text-align:center;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:11px; text-align:right;">NHÂN CÔNG (VNĐ)</label>
                        <input type="number" class="step-labor form-control" value="${step.laborCost}" oninput="window.erpApp.updateRtTotals()" style="font-weight:700; text-align:right; color:#059669;">
                    </div>
                    <button onclick="this.closest('.rt-step-row').remove(); window.erpApp.updateRtTotals();" style="border:none; background:transparent; color:var(--status-red); cursor:pointer;">
                        <span class="material-icons-outlined" style="font-size:20px;">delete_outline</span>
                    </button>
                </div>
                <div style="border-top:1px dashed var(--border-color); padding-top:8px;">
                    <input type="text" class="step-desc" value="${step.desc || ''}" placeholder="Mô tả chi tiết / Hướng dẫn thực hiện..." style="width:100%; border:none; background:transparent; font-size:12px; color:var(--text-muted); outline:none;">
                </div>
            </div>
        `;
    }

    window.erpApp.addRoutingStep = function() {
        const list = document.getElementById('routingStepsList');
        const nextIdx = list.children.length;
        list.insertAdjacentHTML('beforeend', renderRoutingStepRow(undefined, nextIdx));
    };

    window.erpApp.updateRtTotals = function() {
        const rows = document.querySelectorAll('.rt-step-row');
        let totalTime = 0;
        let totalLabor = 0;
        rows.forEach(row => {
            totalTime += parseInt(row.querySelector('.step-dur').value) || 0;
            totalLabor += parseInt(row.querySelector('.step-labor').value) || 0;
        });
        document.getElementById('totalRtTime').textContent = `${totalTime} phút`;
        document.getElementById('totalRtLabor').textContent = `${new Intl.NumberFormat('vi-VN').format(totalLabor)} đ`;
    };

    window.erpApp.saveRouting = function() {
        const id = document.getElementById('rtId').value;
        const name = document.getElementById('rtName').value;
        if (!name) { showToast('Vui lòng nhập tên quy trình!', 'error'); return; }

        const steps = [];
        document.querySelectorAll('.rt-step-row').forEach(row => {
            steps.push({
                op: row.querySelector('.step-op').value,
                workCenter: row.querySelector('.step-wc').value,
                duration: parseInt(row.querySelector('.step-dur').value) || 0,
                laborCost: parseInt(row.querySelector('.step-labor').value) || 0,
                desc: row.querySelector('.step-desc').value
            });
        });

        const data = {
            id,
            name,
            version: document.getElementById('rtVer').value,
            status: document.getElementById('rtStatus').value,
            steps
        };

        const idx = routings.findIndex(r => r.id === id);
        if (idx > -1) routings[idx] = data;
        else routings.unshift(data);

        localStorage.setItem('erp_routings', JSON.stringify(routings));
        showToast('Đã lưu dữ liệu Quy trình sản xuất!');
        window.erpApp.closeRtModal();
        renderRouting();
    };

    window.erpApp.closeRtModal = function() {
        const m = document.getElementById('rtModal');
        if (m) m.remove();
    };

    window.erpApp.renderRouting = renderRouting;
