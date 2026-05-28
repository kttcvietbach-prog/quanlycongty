(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // ==========================================
    // MODULE: Marketing (5 Sub-modules)
    // ==========================================

    // --- Data Layer ---
    function loadMarketingData() {
        const defaults = {
            campaigns: [],
            emailCampaigns: [],
            socialPosts: [],
            customerSegments: []
        };

        let data = {};
        try {
            data.campaigns = JSON.parse(localStorage.getItem('erp_campaigns')) || defaults.campaigns;
            data.emailCampaigns = JSON.parse(localStorage.getItem('erp_email_campaigns')) || defaults.emailCampaigns;
            data.socialPosts = JSON.parse(localStorage.getItem('erp_social_posts')) || defaults.socialPosts;
            data.customerSegments = JSON.parse(localStorage.getItem('erp_customer_segments')) || defaults.customerSegments;
        } catch (e) {
            data = { ...defaults };
        }
        return data;
    }

    function saveMarketingData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getStatusBadge(status) {
        const map = {
            'active': { label: 'Đang chạy', bg: '#ecfdf5', color: '#059669', border: '#d1fae5' },
            'completed': { label: 'Hoàn thành', bg: '#eff6ff', color: '#3b82f6', border: '#dbeafe' },
            'planned': { label: 'Lên kế hoạch', bg: '#fff7ed', color: '#d97706', border: '#ffedd5' },
            'paused': { label: 'Tạm dừng', bg: '#fef2f2', color: '#ef4444', border: '#fee2e2' },
            'sent': { label: 'Đã gửi', bg: '#ecfdf5', color: '#059669', border: '#d1fae5' },
            'draft': { label: 'Bản nháp', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
            'published': { label: 'Đã đăng', bg: '#ecfdf5', color: '#059669', border: '#d1fae5' },
            'scheduled': { label: 'Đã lên lịch', bg: '#eff6ff', color: '#3b82f6', border: '#dbeafe' }
        };
        const s = map[status] || { label: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        return `<span style="display:inline-flex; padding:4px 14px; border-radius:20px; font-size:11px; font-weight:800; background:${s.bg}; color:${s.color}; border:1px solid ${s.border};">${s.label}</span>`;
    }

    function getPlatformIcon(p) {
        const map = { facebook: '🌐', linkedin: '💼', tiktok: '🎵', instagram: '📷', twitter: '🐦' };
        return map[p] || '📱';
    }

    // ==========================================
    // 1. QUẢN LÝ CHIẾN DỊCH (Campaign Management)
    // ==========================================
    function renderCampaignManagement() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Quản lý chiến dịch';}
        if (pageBadge) {pageBadge.textContent = 'Marketing';}

        const data = loadMarketingData();
        const campaigns = data.campaigns;
        const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
        const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
        const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
        const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
        const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('marketing')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Quản lý Chiến dịch Marketing</h2>
                    </div>
                    <button onclick="window.erpApp.openCampaignModal()" style="padding:10px 24px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(124, 58, 237, 0.2);">
                        <span class="material-icons-outlined">add_circle</span> Tạo chiến dịch
                    </button>
                </div>

                <!-- KPI Row -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; padding:22px; border-radius:20px; box-shadow:0 8px 24px rgba(124, 58, 237, 0.2);">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">Tổng ngân sách</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px;">${window.erpApp.formatValue(totalBudget)} đ</div>
                        <div style="margin-top:10px; font-size:11px; font-weight:600; opacity:0.8;">Đã chi: ${window.erpApp.formatValue(totalSpent)} đ (${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%)</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Tổng Leads</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#1e293b;">${window.erpApp.formatValue(totalLeads)}</div>
                        <div style="margin-top:10px; font-size:11px; font-weight:700; color:#10b981; display:flex; align-items:center; gap:4px;">
                            <span class="material-icons-outlined" style="font-size:14px;">trending_up</span> +15.2% so với kỳ trước
                        </div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Chuyển đổi</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#1e293b;">${totalConversions}</div>
                        <div style="margin-top:10px; font-size:11px; font-weight:700; color:#3b82f6;">Tỷ lệ: ${conversionRate}%</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Chiến dịch đang chạy</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#1e293b;">${campaigns.filter(c => c.status === 'active').length}</div>
                        <div style="margin-top:10px; font-size:11px; font-weight:600; color:#64748b;">/ ${campaigns.length} tổng chiến dịch</div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px; margin-bottom:28px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Ngân sách vs Chi tiêu theo Chiến dịch</h3>
                        <div style="height:280px;"><canvas id="campaignBudgetChart"></canvas></div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Phân bổ theo Kênh</h3>
                        <div style="height:280px;"><canvas id="campaignChannelChart"></canvas></div>
                    </div>
                </div>

                <!-- Campaign Table -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; overflow:hidden;">
                    <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Danh sách Chiến dịch</h3>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9;">
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Tên chiến dịch</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Kênh</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Thời gian</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Ngân sách</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Leads</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Trạng thái</th>
                                    <th style="padding:14px 12px; width:60px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${campaigns.map(c => `
                                    <tr style="border-bottom:1px solid #f8fafc; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'" onclick="window.erpApp.viewCampaignDetail('${c.id}')">
                                        <td style="padding:16px 12px;">
                                            <div style="font-weight:800; color:#1e293b; font-size:13px;">${c.name}</div>
                                            <div style="font-size:11px; color:#94a3b8; font-weight:600; margin-top:2px;">${c.id} • ${c.owner}</div>
                                        </td>
                                        <td style="padding:16px 12px; font-weight:700; color:#475569; font-size:12px;">${c.channel}</td>
                                        <td style="padding:16px 12px; font-size:12px; color:#64748b; font-weight:600;">${c.startDate} → ${c.endDate}</td>
                                        <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right; font-size:13px;">${window.erpApp.formatValue(c.budget)}</td>
                                        <td style="padding:16px 12px; font-weight:900; color:#8b5cf6; text-align:center;">${c.leads}</td>
                                        <td style="padding:16px 12px; text-align:center;">${getStatusBadge(c.status)}</td>
                                        <td style="padding:16px 12px; text-align:center;">
                                            <button onclick="event.stopPropagation(); window.erpApp.deleteCampaign('${c.id}')" style="background:none; border:none; color:#94a3b8; cursor:pointer;" title="Xóa"><span class="material-icons-outlined" style="font-size:18px;">delete_outline</span></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        // Charts
        setTimeout(() => {
            const budgetCtx = document.getElementById('campaignBudgetChart')?.getContext('2d');
            if (budgetCtx) {
                new Chart(budgetCtx, {
                    type: 'bar',
                    data: {
                        labels: campaigns.map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
                        datasets: [
                            { label: 'Ngân sách', data: campaigns.map(c => c.budget), backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6', borderWidth: 2, borderRadius: 8 },
                            { label: 'Đã chi', data: campaigns.map(c => c.spent), backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', borderWidth: 2, borderRadius: 8 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => (v / 1000000) + 'M', font: { size: 10 } }, grid: { color: '#f1f5f9' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } }
                });
            }
            const channelCtx = document.getElementById('campaignChannelChart')?.getContext('2d');
            if (channelCtx) {
                const channelMap = {};
                campaigns.forEach(c => { channelMap[c.channel] = (channelMap[c.channel] || 0) + c.budget; });
                new Chart(channelCtx, {
                    type: 'doughnut',
                    data: { labels: Object.keys(channelMap), datasets: [{ data: Object.values(channelMap), backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { family: 'Inter', size: 11 } } } } }
                });
            }
        }, 100);
    }

    // Campaign Detail Modal
    window.erpApp.viewCampaignDetail = function (id) {
        const data = loadMarketingData();
        const c = data.campaigns.find(x => x.id === id);
        if (!c) {return;}
        const spentPct = c.budget > 0 ? ((c.spent / c.budget) * 100).toFixed(0) : 0;
        const convRate = c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0;
        const costPerLead = c.leads > 0 ? Math.round(c.spent / c.leads) : 0;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'campaignDetailModal';
        modal.style.cssText = 'display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6);';
        modal.onclick = () => modal.remove();
        modal.innerHTML = `
            <div style="width:640px; border-radius:28px; padding:36px; background:#fff; position:relative; box-shadow:0 30px 60px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto;" onclick="event.stopPropagation()">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#8b5cf6; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">${c.id} • ${c.channel}</div>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">${c.name}</h2>
                    </div>
                    <button onclick="document.getElementById('campaignDetailModal').remove()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="font-size:20px;">close</span></button>
                </div>
                <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 24px;">${c.desc}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
                    <div style="background:#f8fafc; padding:18px; border-radius:16px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Ngân sách</div>
                        <div style="font-size:20px; font-weight:900; color:#1e293b; margin-top:4px;">${window.erpApp.formatValue(c.budget)} đ</div>
                        <div style="height:6px; background:#e2e8f0; border-radius:10px; margin-top:10px; overflow:hidden;"><div style="width:${spentPct}%; height:100%; background:linear-gradient(90deg, #8b5cf6, #3b82f6); border-radius:10px;"></div></div>
                        <div style="font-size:11px; color:#64748b; font-weight:700; margin-top:6px;">Đã chi: ${window.erpApp.formatValue(c.spent)} đ (${spentPct}%)</div>
                    </div>
                    <div style="background:#f8fafc; padding:18px; border-radius:16px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Hiệu quả</div>
                        <div style="font-size:20px; font-weight:900; color:#059669; margin-top:4px;">${convRate}% Conversion</div>
                        <div style="font-size:12px; color:#64748b; font-weight:700; margin-top:8px;">${c.leads} Leads → ${c.conversions} Đơn hàng</div>
                        <div style="font-size:11px; color:#3b82f6; font-weight:700; margin-top:4px;">CPL: ${window.erpApp.formatValue(costPerLead)} đ</div>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                    <div style="padding:14px; background:#eff6ff; border-radius:14px; text-align:center;">
                        <div style="font-size:10px; font-weight:800; color:#3b82f6; text-transform:uppercase;">Trạng thái</div>
                        <div style="margin-top:6px;">${getStatusBadge(c.status)}</div>
                    </div>
                    <div style="padding:14px; background:#fefce8; border-radius:14px; text-align:center;">
                        <div style="font-size:10px; font-weight:800; color:#d97706; text-transform:uppercase;">Bắt đầu</div>
                        <div style="font-weight:800; color:#1e293b; font-size:13px; margin-top:6px;">${c.startDate}</div>
                    </div>
                    <div style="padding:14px; background:#fef2f2; border-radius:14px; text-align:center;">
                        <div style="font-size:10px; font-weight:800; color:#ef4444; text-transform:uppercase;">Kết thúc</div>
                        <div style="font-weight:800; color:#1e293b; font-size:13px; margin-top:6px;">${c.endDate}</div>
                    </div>
                </div>
                <button onclick="document.getElementById('campaignDetailModal').remove()" style="width:100%; padding:14px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-weight:800; cursor:pointer;">Đóng</button>
            </div>
        `;
        document.body.appendChild(modal);
    };

    // CRUD for Campaigns
    window.erpApp.openCampaignModal = function (id) {
        const data = loadMarketingData();
        const c = id ? data.campaigns.find(x => x.id === id) : { id: 'CP-' + String(data.campaigns.length + 1).padStart(3, '0'), name: '', type: 'launch', status: 'planned', startDate: '', endDate: '', budget: 0, spent: 0, leads: 0, conversions: 0, channel: '', owner: '', desc: '' };
        const modal = document.createElement('div');
        modal.className = 'modal-overlay'; modal.id = 'cpEditModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:560px;">
                <div class="modal-header"><h2><span class="material-icons-outlined">campaign</span> ${id ? 'Chỉnh sửa' : 'Tạo'} Chiến dịch</h2><button class="modal-close-btn" onclick="document.getElementById('cpEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('cpEditModal').remove(),200)"><span class="material-icons-outlined">close</span></button></div>
                <div class="modal-body" style="background:var(--bg-body); padding:24px;">
                    <div class="premium-card" style="display:grid; gap:14px;">
                        <div class="form-group"><label class="form-label">Tên chiến dịch <span style="color:red">*</span></label><input id="cpName" class="form-control" value="${c.name}" placeholder="VD: Ra mắt sản phẩm Q2..."></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group"><label class="form-label">Kênh</label><input id="cpChannel" class="form-control" value="${c.channel}" placeholder="Facebook, Email..."></div>
                            <div class="form-group"><label class="form-label">Người phụ trách</label><input id="cpOwner" class="form-control" value="${c.owner}"></div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group"><label class="form-label">Ngày bắt đầu</label><input id="cpStart" type="date" class="form-control" value="${c.startDate}"></div>
                            <div class="form-group"><label class="form-label">Ngày kết thúc</label><input id="cpEnd" type="date" class="form-control" value="${c.endDate}"></div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group"><label class="form-label">Ngân sách (VNĐ)</label><input id="cpBudget" type="text" class="form-control" value="${window.erpApp.formatValue(c.budget)}" oninput="window.erpApp.formatNumberInput(this)"></div>
                            <div class="form-group"><label class="form-label">Trạng thái</label><select id="cpStatus" class="form-control"><option value="planned" ${c.status === 'planned' ? 'selected' : ''}>Lên kế hoạch</option><option value="active" ${c.status === 'active' ? 'selected' : ''}>Đang chạy</option><option value="paused" ${c.status === 'paused' ? 'selected' : ''}>Tạm dừng</option><option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Hoàn thành</option></select></div>
                        </div>
                        <div class="form-group"><label class="form-label">Mô tả</label><textarea id="cpDesc" class="form-control" rows="3" style="resize:none;">${c.desc}</textarea></div>
                    </div>
                </div>
                <div class="modal-footer"><button class="btn-cancel" onclick="document.getElementById('cpEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('cpEditModal').remove(),200)">Hủy</button><button class="btn-save" onclick="window.erpApp.saveCampaign('${c.id}')">Lưu chiến dịch</button></div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveCampaign = async function (id) {
        const data = loadMarketingData();
        const obj = {
            id: id,
            name: document.getElementById('cpName').value,
            type: 'launch',
            status: document.getElementById('cpStatus').value,
            startDate: document.getElementById('cpStart').value,
            endDate: document.getElementById('cpEnd').value,
            budget: window.erpApp.parseVND(document.getElementById('cpBudget').value) || 0,
            spent: 0, leads: 0, conversions: 0,
            channel: document.getElementById('cpChannel').value,
            owner: document.getElementById('cpOwner').value,
            desc: document.getElementById('cpDesc').value
        };
        if (!obj.name) { if (window.erpApp.showToast) {window.erpApp.showToast('Vui lòng nhập tên chiến dịch!', 'error');} return; }
        const idx = data.campaigns.findIndex(c => c.id === id);
        if (idx > -1) { obj.spent = data.campaigns[idx].spent; obj.leads = data.campaigns[idx].leads; obj.conversions = data.campaigns[idx].conversions; data.campaigns[idx] = obj; }
        else {data.campaigns.push(obj);}
        saveMarketingData('erp_campaigns', data.campaigns);

        if (window.CrudSync && window.CrudSync.saveItem) {
            await window.CrudSync.saveItem('erp_campaigns', obj, 'id');
        }

        const m = document.getElementById('cpEditModal'); if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
        
        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                idx > -1 ? `Đã cập nhật chiến dịch: ${obj.name}` : `Đã tạo chiến dịch mới: ${obj.name}`,
                'campaign',
                idx > -1 ? 'indigo' : 'purple',
                'marketing'
            );
        }

        if (window.erpApp.showToast) {window.erpApp.showToast('Đã lưu chiến dịch thành công!');}
        renderCampaignManagement();
    };

    window.erpApp.deleteCampaign = function (id) {
        const data = loadMarketingData();
        const campaign = data.campaigns.find(c => c.id === id);
        
        if (campaign) {
            window.erpApp.showDeleteConfirmation(
                'Chiến dịch',
                campaign.name || id,
                async function() {
                    data.campaigns = data.campaigns.filter(c => c.id !== id);
                    saveMarketingData('erp_campaigns', data.campaigns);

                    if (window.CrudSync && window.CrudSync.deleteItem) {
                        await window.CrudSync.deleteItem('erp_campaigns', id);
                    }
                    
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Đã xóa chiến dịch: ${campaign.name}`,
                            'delete',
                            'red',
                            'marketing'
                        );
                    }

                    if (window.erpApp.showToast) {window.erpApp.showToast('Đã xóa chiến dịch!');}
                    renderCampaignManagement();
                }
            );
        }
    };

    // ==========================================
    // 2. EMAIL MARKETING
    // ==========================================
    function renderEmailMarketing() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Email Marketing';}
        if (pageBadge) {pageBadge.textContent = 'Marketing';}

        const data = loadMarketingData();
        const emails = data.emailCampaigns;
        const totalSent = emails.reduce((s, e) => s + e.recipients, 0);
        const totalOpened = emails.reduce((s, e) => s + e.opened, 0);
        const totalClicked = emails.reduce((s, e) => s + e.clicked, 0);
        const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
        const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0;

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('marketing')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Email Marketing</h2>
                    </div>
                    <button onclick="window.erpApp.openEmailModal()" style="padding:10px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <span class="material-icons-outlined">email</span> Tạo Email mới
                    </button>
                </div>

                <!-- KPI -->
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:#fff; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">Đã gửi</div>
                        <div style="font-size:26px; font-weight:900; margin-top:6px;">${window.erpApp.formatValue(totalSent)}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tỷ lệ mở</div>
                        <div style="font-size:26px; font-weight:900; color:#10b981; margin-top:6px;">${openRate}%</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tỷ lệ click</div>
                        <div style="font-size:26px; font-weight:900; color:#8b5cf6; margin-top:6px;">${clickRate}%</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Hủy đăng ký</div>
                        <div style="font-size:26px; font-weight:900; color:#ef4444; margin-top:6px;">${emails.reduce((s, e) => s + e.unsubscribed, 0)}</div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; margin-bottom:28px;">
                    <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Hiệu suất Email theo chiến dịch</h3>
                    <div style="height:260px;"><canvas id="emailPerfChart"></canvas></div>
                </div>

                <!-- Email List -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Danh sách Email Campaigns</h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${emails.map(e => `
                            <div style="display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center; padding:18px; border:1px solid #f1f5f9; border-radius:16px; transition:all 0.2s; cursor:pointer;" onmouseover="this.style.borderColor='#dbeafe'; this.style.background='#fbfcfe'" onmouseout="this.style.borderColor='#f1f5f9'; this.style.background='transparent'" onclick="window.erpApp.viewEmailDetail('${e.id}')">
                                <div>
                                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                        <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">email</span>
                                        <span style="font-weight:800; color:#1e293b; font-size:14px;">${e.subject}</span>
                                        ${getStatusBadge(e.status)}
                                    </div>
                                    <div style="display:flex; gap:20px; font-size:11px; font-weight:700; color:#94a3b8;">
                                        <span>📧 ${window.erpApp.formatValue(e.recipients)} người nhận</span>
                                        <span>👁️ ${e.opened} mở (${e.recipients > 0 ? ((e.opened / e.recipients) * 100).toFixed(0) : 0}%)</span>
                                        <span>🖱️ ${e.clicked} click</span>
                                        <span>📅 ${e.sentDate || 'Chưa gửi'}</span>
                                    </div>
                                </div>
                                <button onclick="event.stopPropagation(); window.erpApp.deleteEmail('${e.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;"><span class="material-icons-outlined" style="font-size:18px;">delete_outline</span></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        setTimeout(() => {
            const ctx = document.getElementById('emailPerfChart')?.getContext('2d');
            if (ctx) {
                const sentEmails = emails.filter(e => e.status === 'sent');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: sentEmails.map(e => e.subject.length > 25 ? e.subject.substring(0, 25) + '...' : e.subject),
                        datasets: [
                            { label: 'Mở', data: sentEmails.map(e => e.opened), backgroundColor: '#3b82f620', borderColor: '#3b82f6', borderWidth: 2, borderRadius: 6 },
                            { label: 'Click', data: sentEmails.map(e => e.clicked), backgroundColor: '#8b5cf620', borderColor: '#8b5cf6', borderWidth: 2, borderRadius: 6 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter', size: 11 } } } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } }
                });
            }
        }, 100);
    }

    window.erpApp.viewEmailDetail = function (id) {
        const data = loadMarketingData();
        const e = data.emailCampaigns.find(x => x.id === id);
        if (!e) {return;}
        const modal = document.createElement('div');
        modal.id = 'emailDetailModal'; modal.className = 'modal-overlay';
        modal.style.cssText = 'display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s; z-index:1001; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6);';
        modal.onclick = () => modal.remove();
        modal.innerHTML = `
            <div style="width:520px; border-radius:28px; padding:36px; background:#fff; box-shadow:0 30px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
                    <div><div style="font-size:11px; font-weight:800; color:#3b82f6; letter-spacing:1px; margin-bottom:4px;">${e.id}</div><h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${e.subject}</h2></div>
                    <button onclick="document.getElementById('emailDetailModal').remove()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="font-size:20px;">close</span></button>
                </div>
                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:20px;">
                    <div style="padding:16px; background:#eff6ff; border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:#3b82f6;">NGƯỜI NHẬN</div><div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:4px;">${window.erpApp.formatValue(e.recipients)}</div></div>
                    <div style="padding:16px; background:#ecfdf5; border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:#059669;">ĐÃ MỞ</div><div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:4px;">${e.opened} <span style="font-size:13px; color:#059669;">(${e.recipients > 0 ? ((e.opened / e.recipients) * 100).toFixed(1) : 0}%)</span></div></div>
                    <div style="padding:16px; background:#f5f3ff; border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:#8b5cf6;">CLICK</div><div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:4px;">${e.clicked}</div></div>
                    <div style="padding:16px; background:#fef2f2; border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:#ef4444;">BOUNCE / HỦY</div><div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:4px;">${e.bounced} / ${e.unsubscribed}</div></div>
                </div>
                <div style="display:flex; gap:12px; font-size:12px; font-weight:700; color:#64748b; margin-bottom:20px;"><span>📅 ${e.sentDate || 'Chưa gửi'}</span><span>📝 Template: ${e.template}</span></div>
                <button onclick="document.getElementById('emailDetailModal').remove()" style="width:100%; padding:14px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-weight:800; cursor:pointer;">Đóng</button>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openEmailModal = function () {
        const data = loadMarketingData();
        const newId = 'EM-' + String(data.emailCampaigns.length + 1).padStart(3, '0');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay'; modal.id = 'emEditModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:520px;">
                <div class="modal-header"><h2><span class="material-icons-outlined">email</span> Tạo Email Campaign</h2><button class="modal-close-btn" onclick="document.getElementById('emEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('emEditModal').remove(),200)"><span class="material-icons-outlined">close</span></button></div>
                <div class="modal-body" style="background:var(--bg-body); padding:24px;">
                    <div class="premium-card" style="display:grid; gap:14px;">
                        <div class="form-group"><label class="form-label">Tiêu đề email <span style="color:red">*</span></label><input id="emSubject" class="form-control" placeholder="VD: Ưu đãi đặc biệt tháng 5..."></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div class="form-group"><label class="form-label">Template</label><select id="emTemplate" class="form-control"><option value="promo-spring">Promo - Khuyến mãi</option><option value="newsletter">Newsletter</option><option value="event-invite">Sự kiện</option><option value="welcome">Chào mừng</option></select></div>
                            <div class="form-group"><label class="form-label">Số người nhận</label><input id="emRecipients" type="text" class="form-control" value="0" oninput="window.erpApp.formatNumberInput(this)"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer"><button class="btn-cancel" onclick="document.getElementById('emEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('emEditModal').remove(),200)">Hủy</button><button class="btn-save" onclick="window.erpApp.saveEmail('${newId}')">Lưu bản nháp</button></div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveEmail = async function (id) {
        const data = loadMarketingData();
        const obj = { id, subject: document.getElementById('emSubject').value, campaignId: null, sentDate: null, recipients: window.erpApp.parseVND(document.getElementById('emRecipients').value) || 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, status: 'draft', template: document.getElementById('emTemplate').value };
        if (!obj.subject) { if (window.erpApp.showToast) {window.erpApp.showToast('Vui lòng nhập tiêu đề!', 'error');} return; }
        data.emailCampaigns.push(obj);
        saveMarketingData('erp_email_campaigns', data.emailCampaigns);

        if (window.CrudSync && window.CrudSync.saveItem) {
            await window.CrudSync.saveItem('erp_email_campaigns', obj, 'id');
        }

        const m = document.getElementById('emEditModal'); if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
        
        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                `Đã tạo chiến dịch email mới: ${obj.subject}`,
                'email',
                'blue',
                'marketing'
            );
        }

        if (window.erpApp.showToast) {window.erpApp.showToast('Đã lưu email campaign!');}
        renderEmailMarketing();
    };

    window.erpApp.deleteEmail = function (id) {
        const data = loadMarketingData();
        const email = data.emailCampaigns.find(e => e.id === id);
        
        if (email) {
            window.erpApp.showDeleteConfirmation(
                'Email Campaign',
                email.subject || id,
                async function() {
                    data.emailCampaigns = data.emailCampaigns.filter(e => e.id !== id);
                    saveMarketingData('erp_email_campaigns', data.emailCampaigns);

                    if (window.CrudSync && window.CrudSync.deleteItem) {
                        await window.CrudSync.deleteItem('erp_email_campaigns', id);
                    }
                    
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Đã xóa chiến dịch email: ${email.subject}`,
                            'delete',
                            'red',
                            'marketing'
                        );
                    }

                    if (window.erpApp.showToast) {window.erpApp.showToast('Đã xóa!');}
                    renderEmailMarketing();
                }
            );
        }
    };

    // ==========================================
    // 3. SOCIAL MEDIA
    // ==========================================
    function renderSocialMedia() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Social Media';}
        if (pageBadge) {pageBadge.textContent = 'Marketing';}

        const data = loadMarketingData();
        const posts = data.socialPosts;
        const totalReach = posts.reduce((s, p) => s + p.reach, 0);
        const totalEngagement = posts.reduce((s, p) => s + p.likes + p.comments + p.shares, 0);

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('marketing')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Social Media Management</h2>
                    </div>
                    <button onclick="window.erpApp.openSocialModal()" style="padding:10px 24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <span class="material-icons-outlined">post_add</span> Tạo bài đăng
                    </button>
                </div>

                <!-- KPI -->
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">Tổng Reach</div>
                        <div style="font-size:26px; font-weight:900; margin-top:6px;">${window.erpApp.formatValue(totalReach)}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tương tác</div>
                        <div style="font-size:26px; font-weight:900; color:#1e293b; margin-top:6px;">${window.erpApp.formatValue(totalEngagement)}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Bài đăng</div>
                        <div style="font-size:26px; font-weight:900; color:#1e293b; margin-top:6px;">${posts.length}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Engagement Rate</div>
                        <div style="font-size:26px; font-weight:900; color:#f59e0b; margin-top:6px;">${totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : 0}%</div>
                    </div>
                </div>

                <!-- Chart -->
                <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px; margin-bottom:28px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Reach theo Nền tảng</h3>
                        <div style="height:260px;"><canvas id="socialReachChart"></canvas></div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Engagement Mix</h3>
                        <div style="height:260px;"><canvas id="socialEngChart"></canvas></div>
                    </div>
                </div>

                <!-- Post Feed -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Bảng tin Social</h3>
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:16px;">
                        ${posts.map(p => `
                            <div style="border:1px solid #f1f5f9; border-radius:20px; padding:20px; transition:all 0.3s;" onmouseover="this.style.borderColor='#dbeafe'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.04)'" onmouseout="this.style.borderColor='#f1f5f9'; this.style.boxShadow='none'">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span style="font-size:20px;">${getPlatformIcon(p.platform)}</span>
                                        <span style="font-weight:800; color:#1e293b; font-size:13px; text-transform:capitalize;">${p.platform}</span>
                                        ${getStatusBadge(p.status)}
                                    </div>
                                    <button onclick="window.erpApp.deleteSocialPost('${p.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;"><span class="material-icons-outlined" style="font-size:16px;">delete_outline</span></button>
                                </div>
                                <p style="margin:0 0 14px; font-size:13px; color:#475569; line-height:1.6; font-weight:500;">${p.content}</p>
                                <div style="display:flex; gap:16px; font-size:11px; font-weight:700; color:#94a3b8; border-top:1px solid #f8fafc; padding-top:12px;">
                                    <span>❤️ ${window.erpApp.formatValue(p.likes)}</span>
                                    <span>💬 ${p.comments}</span>
                                    <span>🔄 ${p.shares}</span>
                                    <span>👁 ${window.erpApp.formatValue(p.reach)}</span>
                                </div>
                                <div style="font-size:11px; color:#94a3b8; font-weight:600; margin-top:8px;">📅 ${p.scheduledDate}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        setTimeout(() => {
            // Reach by Platform
            const platformMap = {};
            posts.forEach(p => { platformMap[p.platform] = (platformMap[p.platform] || 0) + p.reach; });
            const reachCtx = document.getElementById('socialReachChart')?.getContext('2d');
            if (reachCtx) {
                new Chart(reachCtx, {
                    type: 'bar',
                    data: { labels: Object.keys(platformMap).map(k => k.charAt(0).toUpperCase() + k.slice(1)), datasets: [{ label: 'Reach', data: Object.values(platformMap), backgroundColor: ['#3b82f620', '#0ea5e920', '#ef444420', '#8b5cf620', '#10b98120'], borderColor: ['#3b82f6', '#0ea5e9', '#ef4444', '#8b5cf6', '#10b981'], borderWidth: 2, borderRadius: 8 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } } }
                });
            }
            // Engagement Mix
            const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
            const totalComments = posts.reduce((s, p) => s + p.comments, 0);
            const totalShares = posts.reduce((s, p) => s + p.shares, 0);
            const engCtx = document.getElementById('socialEngChart')?.getContext('2d');
            if (engCtx) {
                new Chart(engCtx, {
                    type: 'doughnut',
                    data: { labels: ['Likes', 'Comments', 'Shares'], datasets: [{ data: [totalLikes, totalComments, totalShares], backgroundColor: ['#ef4444', '#3b82f6', '#10b981'], borderWidth: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter', size: 11 } } } } }
                });
            }
        }, 100);
    }

    window.erpApp.openSocialModal = function () {
        const data = loadMarketingData();
        const newId = 'SM-' + String(data.socialPosts.length + 1).padStart(3, '0');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay'; modal.id = 'smEditModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:520px;">
                <div class="modal-header"><h2><span class="material-icons-outlined">post_add</span> Tạo bài đăng Social</h2><button class="modal-close-btn" onclick="document.getElementById('smEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('smEditModal').remove(),200)"><span class="material-icons-outlined">close</span></button></div>
                <div class="modal-body" style="background:var(--bg-body); padding:24px;">
                    <div class="premium-card" style="display:grid; gap:14px;">
                        <div class="form-group"><label class="form-label">Nền tảng</label><select id="smPlatform" class="form-control"><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option></select></div>
                        <div class="form-group"><label class="form-label">Nội dung <span style="color:red">*</span></label><textarea id="smContent" class="form-control" rows="4" style="resize:none;" placeholder="Viết nội dung bài đăng..."></textarea></div>
                        <div class="form-group"><label class="form-label">Ngày đăng</label><input id="smDate" type="date" class="form-control"></div>
                    </div>
                </div>
                <div class="modal-footer"><button class="btn-cancel" onclick="document.getElementById('smEditModal').classList.add('closing'); setTimeout(()=>document.getElementById('smEditModal').remove(),200)">Hủy</button><button class="btn-save" onclick="window.erpApp.saveSocialPost('${newId}')">Lên lịch đăng</button></div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveSocialPost = async function (id) {
        const data = loadMarketingData();
        const obj = { id, platform: document.getElementById('smPlatform').value, content: document.getElementById('smContent').value, scheduledDate: document.getElementById('smDate').value || new Date().toISOString().split('T')[0], status: 'scheduled', likes: 0, comments: 0, shares: 0, reach: 0, campaignId: null };
        if (!obj.content) { if (window.erpApp.showToast) {window.erpApp.showToast('Vui lòng nhập nội dung!', 'error');} return; }
        data.socialPosts.push(obj);
        saveMarketingData('erp_social_posts', data.socialPosts);

        if (window.CrudSync && window.CrudSync.saveItem) {
            await window.CrudSync.saveItem('erp_social_posts', obj, 'id');
        }

        const m = document.getElementById('smEditModal'); if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
        
        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                `Đã lên lịch bài đăng ${obj.platform}: ${obj.content.substring(0, 30)}...`,
                'post_add',
                'green',
                'marketing'
            );
        }

        if (window.erpApp.showToast) {window.erpApp.showToast('Đã lên lịch đăng bài!');}
        renderSocialMedia();
    };

    window.erpApp.deleteSocialPost = function (id) {
        const data = loadMarketingData();
        const post = data.socialPosts.find(p => p.id === id);
        
        if (post) {
            window.erpApp.showDeleteConfirmation(
                'Bài đăng',
                post.platform || id,
                async function() {
                    data.socialPosts = data.socialPosts.filter(p => p.id !== id);
                    saveMarketingData('erp_social_posts', data.socialPosts);

                    if (window.CrudSync && window.CrudSync.deleteItem) {
                        await window.CrudSync.deleteItem('erp_social_posts', id);
                    }
                    
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Đã xóa bài đăng ${post.platform}`,
                            'delete',
                            'red',
                            'marketing'
                        );
                    }

                    if (window.erpApp.showToast) {window.erpApp.showToast('Đã xóa bài đăng!');}
                    renderSocialMedia();
                }
            );
        }
    };

    // ==========================================
    // 4. PHÂN TÍCH HIỆU QUẢ (Performance Analytics)
    // ==========================================
    function renderPerformanceAnalytics() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Phân tích hiệu quả';}
        if (pageBadge) {pageBadge.textContent = 'Marketing';}

        const data = loadMarketingData();
        const campaigns = data.campaigns;

        // Cross-system data: load sales orders
        let salesOrders = [];
        try { salesOrders = JSON.parse(localStorage.getItem('erp_sales_orders')) || []; } catch (e) { }
        const totalSalesRevenue = salesOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
        const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
        const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
        const roi = totalSpent > 0 ? (((totalSalesRevenue - totalSpent) / totalSpent) * 100).toFixed(1) : 0;
        const cac = totalConversions > 0 ? Math.round(totalSpent / totalConversions) : 0;
        const costPerLead = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('marketing')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Phân tích Hiệu quả Marketing</h2>
                    </div>
                </div>

                <!-- KPI -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#fff; padding:24px; border-radius:20px; box-shadow:0 8px 24px rgba(5, 150, 105, 0.2);">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">ROI Marketing</div>
                        <div style="font-size:30px; font-weight:900; margin-top:6px;">${roi}%</div>
                        <div style="margin-top:8px; font-size:11px; font-weight:600; opacity:0.8;">Lợi nhuận / Chi phí MKT</div>
                    </div>
                    <div style="background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:#fff; padding:24px; border-radius:20px; box-shadow:0 8px 24px rgba(59, 130, 246, 0.2);">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">CAC (Chi phí / KH)</div>
                        <div style="font-size:28px; font-weight:900; margin-top:6px;">${window.erpApp.formatValue(cac)} đ</div>
                        <div style="margin-top:8px; font-size:11px; font-weight:600; opacity:0.8;">${totalConversions} khách hàng mới</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Cost Per Lead</div>
                        <div style="font-size:28px; font-weight:900; color:#1e293b; margin-top:6px;">${window.erpApp.formatValue(costPerLead)} đ</div>
                        <div style="margin-top:8px; font-size:11px; font-weight:700; color:#64748b;">${totalLeads} leads tổng</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Doanh thu từ Sales</div>
                        <div style="font-size:28px; font-weight:900; color:#059669; margin-top:6px;">${window.erpApp.formatValue(totalSalesRevenue)} đ</div>
                        <div style="margin-top:8px; font-size:11px; font-weight:700; color:#64748b;">Đồng bộ từ Đơn hàng bán</div>
                    </div>
                </div>

                <!-- Charts -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">ROI theo Chiến dịch</h3>
                        <div style="height:300px;"><canvas id="roiChart"></canvas></div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Funnel chuyển đổi</h3>
                        <div style="display:flex; flex-direction:column; gap:12px; padding-top:20px;">
                            ${[
                                { label: 'Impressions / Reach', value: 66400, color: '#3b82f6' },
                                { label: 'Leads thu được', value: totalLeads, color: '#8b5cf6' },
                                { label: 'Conversions', value: totalConversions, color: '#10b981' },
                                { label: 'Khách hàng mua lại', value: Math.round(totalConversions * 0.35), color: '#f59e0b' }
                            ].map((f, i, arr) => {
                                const maxVal = arr[0].value;
                                const pct = maxVal > 0 ? (f.value / maxVal * 100) : 0;
                                return `
                                    <div>
                                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                            <span style="font-size:12px; font-weight:700; color:#64748b;">${f.label}</span>
                                            <span style="font-size:12px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(f.value)}</span>
                                        </div>
                                        <div style="height:28px; background:#f1f5f9; border-radius:14px; overflow:hidden;">
                                            <div style="width:${pct}%; height:100%; background:${f.color}; border-radius:14px; transition:width 0.8s;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Campaign Performance Table -->
                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">So sánh Hiệu quả Chiến dịch</h3>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead><tr style="border-bottom:2px solid #f1f5f9;">
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Chiến dịch</th>
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Chi phí</th>
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Leads</th>
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Conv.</th>
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">CPL</th>
                                <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Conv. Rate</th>
                            </tr></thead>
                            <tbody>
                                ${campaigns.map(c => {
                                    const cpl = c.leads > 0 ? Math.round(c.spent / c.leads) : 0;
                                    const cr = c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0;
                                    return `<tr style="border-bottom:1px solid #f8fafc;">
                                        <td style="padding:14px 12px; font-weight:800; color:#1e293b; font-size:13px;">${c.name}</td>
                                        <td style="padding:14px 12px; font-weight:700; color:#64748b; text-align:right;">${window.erpApp.formatValue(c.spent)}</td>
                                        <td style="padding:14px 12px; font-weight:900; color:#8b5cf6; text-align:center;">${c.leads}</td>
                                        <td style="padding:14px 12px; font-weight:900; color:#059669; text-align:center;">${c.conversions}</td>
                                        <td style="padding:14px 12px; font-weight:700; color:#1e293b; text-align:right;">${window.erpApp.formatValue(cpl)}</td>
                                        <td style="padding:14px 12px; font-weight:900; color:${parseFloat(cr) > 10 ? '#059669' : '#f59e0b'}; text-align:right;">${cr}%</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        setTimeout(() => {
            const roiCtx = document.getElementById('roiChart')?.getContext('2d');
            if (roiCtx) {
                const activeCampaigns = campaigns.filter(c => c.spent > 0);
                new Chart(roiCtx, {
                    type: 'bar',
                    data: {
                        labels: activeCampaigns.map(c => c.name.length > 18 ? c.name.substring(0, 18) + '...' : c.name),
                        datasets: [
                            { label: 'Chi phí', data: activeCampaigns.map(c => c.spent), backgroundColor: '#ef444420', borderColor: '#ef4444', borderWidth: 2, borderRadius: 6 },
                            { label: 'Leads × CPL trung bình', data: activeCampaigns.map(c => c.leads * (costPerLead || 100000)), backgroundColor: '#10b98120', borderColor: '#10b981', borderWidth: 2, borderRadius: 6 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter', size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => (v / 1000000) + 'M' }, grid: { color: '#f1f5f9' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } }
                });
            }
        }, 100);
    }

    // ==========================================
    // 5. PHÂN KHÚC KHÁCH HÀNG (Customer Segmentation)
    // ==========================================
    function renderCustomerSegmentation() {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');
        if (breadcrumbCurrent) {breadcrumbCurrent.textContent = 'Phân khúc khách hàng';}
        if (pageBadge) {pageBadge.textContent = 'Marketing';}

        const data = loadMarketingData();
        const segments = data.customerSegments;
        const totalCustomers = segments.reduce((s, g) => s + g.count, 0);
        const totalRevenue = segments.reduce((s, g) => s + g.revenue, 0);

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('marketing')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Phân khúc Khách hàng</h2>
                    </div>
                </div>

                <!-- Summary KPIs -->
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; padding:24px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">Tổng Khách hàng</div>
                        <div style="font-size:30px; font-weight:900; margin-top:6px;">${totalCustomers}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tổng Doanh thu</div>
                        <div style="font-size:24px; font-weight:900; color:#1e293b; margin-top:6px;">${window.erpApp.formatValue(totalRevenue)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:24px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Phân khúc</div>
                        <div style="font-size:30px; font-weight:900; color:#8b5cf6; margin-top:6px;">${segments.length}</div>
                    </div>
                </div>

                <!-- Charts -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Phân bổ Khách hàng</h3>
                        <div style="height:300px;"><canvas id="segPieChart"></canvas></div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <h3 style="margin:0 0 20px; font-size:15px; font-weight:900; color:#1e293b;">Doanh thu theo Phân khúc</h3>
                        <div style="height:300px;"><canvas id="segRevenueChart"></canvas></div>
                    </div>
                </div>

                <!-- Segment Cards -->
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
                    ${segments.map(seg => `
                        <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; transition:all 0.3s; position:relative; overflow:hidden;" onmouseover="this.style.borderColor='${seg.color}'; this.style.boxShadow='0 10px 30px ${seg.color}15'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:${seg.color};"></div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                                <div>
                                    <div style="font-size:11px; font-weight:800; color:${seg.color}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">${seg.id}</div>
                                    <h4 style="margin:0 0 6px; font-size:16px; font-weight:900; color:#1e293b;">${seg.name}</h4>
                                    <p style="margin:0; font-size:12px; color:#64748b; font-weight:600;">${seg.criteria}</p>
                                </div>
                                <div style="width:48px; height:48px; border-radius:50%; background:${seg.color}15; color:${seg.color}; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900;">${seg.count}</div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                <div style="padding:12px; background:#f8fafc; border-radius:12px;">
                                    <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Doanh thu</div>
                                    <div style="font-size:14px; font-weight:900; color:#1e293b; margin-top:4px;">${seg.revenue > 0 ? (seg.revenue / 1000000000).toFixed(1) + ' tỷ' : '0'}</div>
                                </div>
                                <div style="padding:12px; background:#f8fafc; border-radius:12px;">
                                    <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Giữ chân</div>
                                    <div style="font-size:14px; font-weight:900; color:${seg.retention > 70 ? '#059669' : seg.retention > 40 ? '#f59e0b' : '#ef4444'}; margin-top:4px;">${seg.retention}%</div>
                                </div>
                            </div>
                            ${seg.avgOrder > 0 ? `<div style="margin-top:12px; font-size:11px; font-weight:700; color:#64748b;">Đơn TB: ${window.erpApp.formatValue(seg.avgOrder)} đ</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        setTimeout(() => {
            const pieCtx = document.getElementById('segPieChart')?.getContext('2d');
            if (pieCtx) {
                new Chart(pieCtx, {
                    type: 'doughnut',
                    data: { labels: segments.map(s => s.name), datasets: [{ data: segments.map(s => s.count), backgroundColor: segments.map(s => s.color), borderWidth: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { family: 'Inter', size: 10, weight: 700 } } } } }
                });
            }
            const revCtx = document.getElementById('segRevenueChart')?.getContext('2d');
            if (revCtx) {
                new Chart(revCtx, {
                    type: 'bar',
                    data: { labels: segments.filter(s => s.revenue > 0).map(s => s.name.length > 16 ? s.name.substring(0, 16) + '...' : s.name), datasets: [{ label: 'Doanh thu (Tỷ)', data: segments.filter(s => s.revenue > 0).map(s => s.revenue / 1000000000), backgroundColor: segments.filter(s => s.revenue > 0).map(s => s.color + '30'), borderColor: segments.filter(s => s.revenue > 0).map(s => s.color), borderWidth: 2, borderRadius: 8 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => v + ' tỷ' } }, y: { grid: { display: false }, ticks: { font: { size: 10, weight: 700 } } } } }
                });
            }
        }, 100);
    }

    // ==========================================
    // Export to erpApp
    // ==========================================
    window.erpApp.renderCampaignManagement = renderCampaignManagement;
    window.erpApp.renderEmailMarketing = renderEmailMarketing;
    window.erpApp.renderSocialMedia = renderSocialMedia;
    window.erpApp.renderPerformanceAnalytics = renderPerformanceAnalytics;
    window.erpApp.renderCustomerSegmentation = renderCustomerSegmentation;

})();
