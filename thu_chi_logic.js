(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // ==========================================
    // DATA INITIALIZATION
    // ==========================================
    let accounts = [];

    let incomeCategories = [
        { id: 'INC-01', name: 'Thu nghiệm thu khối lượng', icon: 'assignment_turned_in' },
        { id: 'INC-02', name: 'Thu thanh toán hợp đồng', icon: 'handshake' },
        { id: 'INC-03', name: 'Thu tạm ứng từ Chủ đầu tư', icon: 'account_balance' },
        { id: 'INC-04', name: 'Thu bảo lãnh / ký quỹ hoàn', icon: 'verified' },
        { id: 'INC-05', name: 'Thu lãi ngân hàng', icon: 'trending_up' },
        { id: 'INC-06', name: 'Thu thanh lý vật tư / thiết bị', icon: 'recycling' },
        { id: 'INC-07', name: 'Thu khác', icon: 'add_circle' }
    ];

    let expenseCategories = [
        { id: 'EXP-01', name: 'Chi vật tư thi công (NVL)', icon: 'inventory' },
        { id: 'EXP-02', name: 'Chi nhân công trực tiếp', icon: 'engineering' },
        { id: 'EXP-03', name: 'Chi thuê máy / thiết bị', icon: 'construction' },
        { id: 'EXP-04', name: 'Chi thầu phụ', icon: 'groups' },
        { id: 'EXP-05', name: 'Chi lương CBCNV', icon: 'badge' },
        { id: 'EXP-06', name: 'Chi phí quản lý công trường', icon: 'business' },
        { id: 'EXP-07', name: 'Chi phí văn phòng & điện nước', icon: 'bolt' },
        { id: 'EXP-08', name: 'Chi bảo lãnh / ký quỹ', icon: 'shield' },
        { id: 'EXP-09', name: 'Chi phí lãi vay', icon: 'credit_card' },
        { id: 'EXP-10', name: 'Chi phí bảo hiểm công trình', icon: 'health_and_safety' },
        { id: 'EXP-11', name: 'Chi khác', icon: 'remove_circle' }
    ];

    let transactions = [];
    let overviewPeriod = 'month';

    // Persistence
    function loadDataThuChi() {
        const savedAcc = localStorage.getItem('erp_tc_accounts');
        if (savedAcc) {accounts = JSON.parse(savedAcc);}
        const savedTx = localStorage.getItem('erp_tc_transactions');
        if (savedTx) {
            try {
                transactions = JSON.parse(savedTx);
                console.log(`[Finance] Loaded ${transactions.length} transactions from LocalStorage`);
            } catch (e) {
                console.error('[Finance] Error parsing transactions from LocalStorage:', e);
                transactions = [];
            }
        }
    }
    function saveDataThuChi() {
        localStorage.setItem('erp_tc_accounts', JSON.stringify(accounts));
        localStorage.setItem('erp_tc_transactions', JSON.stringify(transactions));
        
        // Note: Individual item sync is handled in CRUD functions for better performance
    }
    loadDataThuChi();

    // Consolidated Data Helper
    function getConsolidatedTransactions() {
        let allTx = transactions.map(t => ({ ...t, source: t.source || 'manual' }));

        // 1. Add Administrative Expenses (Hành chính)
        const officeExpenses = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('office_expenses') : [];
        officeExpenses.filter(e => e.paymentStatus === 'paid' && e.status === 'approved').forEach(e => {
            if (!transactions.some(tx => tx.id === e.id)) {
                allTx.push({
                    id: e.id,
                    date: window.erpApp.formatDate(e.date),
                    amount: e.amount,
                    type: 'chi',
                    partner: e.requester,
                    note: `[Hành chính] ${e.desc}`,
                    category: 'EXP-07', 
                    source: 'administrative'
                });
            }
        });

        // 2. Add Project Management Payments
        const pmMilestones = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmPaymentMilestones') : [];
        const pmContracts = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmContracts') : [];
        
        pmMilestones.filter(m => ['tam-ung', 'da-thanh-toan', 'da-quyet-toan'].includes(m.status)).forEach(m => {
            if (!transactions.some(tx => tx.id === m.id)) {
                const contract = pmContracts.find(c => String(c.id).trim() === String(m.contractId).trim());
                if (contract) {
                    const isIncome = contract.type === 'outbound';
                    allTx.push({
                        id: m.id,
                        date: window.erpApp.formatDate(m.date),
                        amount: m.actualValue || 0,
                        type: isIncome ? 'thu' : 'chi',
                        partner: contract.partner,
                        note: `[Dự án] ${m.title}`,
                        category: isIncome ? 'INC-02' : 'EXP-04', 
                        source: 'pm-contract',
                        projectId: contract.projectId,
                        contractId: contract.id
                    });
                }
            }
        });

        // 3. Add PM Material Contracts
        const pmMaterials = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmMaterialContracts') : [];
        pmMaterials.forEach(mc => {
            if (mc.paidAmount > 0 && !transactions.some(tx => tx.id === mc.id)) {
                allTx.push({
                    id: mc.id,
                    date: window.erpApp.formatDate(mc.signDate || new Date()),
                    amount: mc.paidAmount,
                    type: 'chi',
                    partner: mc.supplier,
                    note: `[Vật tư DA] ${mc.title}`,
                    category: 'EXP-01',
                    source: 'pm-material',
                    projectId: mc.projectId,
                    materialId: mc.id
                });
            }
        });

        return allTx;
    }

    const isUserAdmin = () => {
        try {
            // Đọc trực tiếp từ localStorage để tránh phụ thuộc vào thứ tự load file
            const userStr = localStorage.getItem('erp_currentUser');
            if (!userStr) {return true;} // Fallback cho môi trường test
            const user = JSON.parse(userStr);
            const r = (user.role || '').toLowerCase();
            return r.includes('admin') || r.includes('giám đốc') || r.includes('director') || r.includes('kế toán');
        } catch (e) {
            return true;
        }
    };

    // Bank Branding Helper
    const getBankInfo = (name = '') => {
        const n = name.toLowerCase();
        const logoBase = 'https://api.vietqr.io/img/';
        
        if (n.includes('vietcombank') || n.includes('vcb')) 
            {return { color: 'green', icon: 'account_balance', brand: 'VCB', logo: logoBase + 'VCB.png' };}
        if (n.includes('techcombank') || n.includes('tcb')) 
            {return { color: 'red', icon: 'account_balance', brand: 'TCB', logo: logoBase + 'TCB.png' };}
        if (n.includes('momo')) 
            {return { color: 'pink', icon: 'account_balance_wallet', brand: 'MoMo', logo: 'https://developers.momo.vn/v3/assets/images/logo-custom-c89280b1f3640234691456575317d74c.png' };}
        if (n.includes('tiền mặt') || n.includes('cash')) 
            {return { color: 'blue', icon: 'payments', brand: 'Cash' };}
        if (n.includes('vpbank') || n.includes('vpb')) 
            {return { color: 'emerald', icon: 'account_balance', brand: 'VPB', logo: logoBase + 'VPB.png' };}
        if (n.includes('bidv')) 
            {return { color: 'indigo', icon: 'account_balance', brand: 'BIDV', logo: logoBase + 'BIDV.png' };}
        if (n.includes('sacombank') || n.includes('stb')) 
            {return { color: 'blue', icon: 'account_balance', brand: 'STB', logo: logoBase + 'STB.png' };}
        if (n.includes('mb bank') || n === 'mb' || n.includes('military')) 
            {return { color: 'blue', icon: 'account_balance', brand: 'MB', logo: logoBase + 'MB.png' };}
        if (n.includes('agribank') || n.includes('vba')) 
            {return { color: 'red', icon: 'account_balance', brand: 'VBA', logo: logoBase + 'AGRIBANK.png' };}
        if (n.includes('acb')) 
            {return { color: 'blue', icon: 'account_balance', brand: 'ACB', logo: logoBase + 'ACB.png' };}
        if (n.includes('tpbank') || n.includes('tpb')) 
            {return { color: 'purple', icon: 'account_balance', brand: 'TPB', logo: logoBase + 'TPB.png' };}
        if (n.includes('vietinbank') || n.includes('vtb') || n.includes('icb')) 
            {return { color: 'blue', icon: 'account_balance', brand: 'VTB', logo: logoBase + 'ICINB.png' };}
            
        return { color: 'slate', icon: 'account_balance', brand: 'Bank' };
    };

    // ==========================================
    // MAIN RENDERING: OVERVIEW (DASHBOARD)
    // ==========================================
    function renderThuChiOverview() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) return;
        window.erpApp.updateBreadcrumb('Tổng quan dòng tiền', 'Tài chính');

        const consolidatedTx = getConsolidatedTransactions();
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        // Dynamic Period Logic
        const now = new Date();
        const curMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const curYear = now.getFullYear();
        
        let filteredTx = [];
        let periodLabel = '';
        
        if (overviewPeriod === 'week') {
            const startOfWeek = new Date();
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            startOfWeek.setHours(0,0,0,0);
            filteredTx = consolidatedTx.filter(tx => window.erpApp.toJsDate(tx.date) >= startOfWeek);
            periodLabel = 'Tuần này';
        } else if (overviewPeriod === 'month') {
            const prefix = `/${curMonth}/${curYear}`;
            filteredTx = consolidatedTx.filter(tx => tx.date.endsWith(prefix));
            periodLabel = `Tháng ${curMonth}/${curYear}`;
        } else if (overviewPeriod === 'prev_month') {
            const prev = new Date();
            prev.setMonth(now.getMonth() - 1);
            const pMonth = (prev.getMonth() + 1).toString().padStart(2, '0');
            const pYear = prev.getFullYear();
            const prefix = `/${pMonth}/${pYear}`;
            filteredTx = consolidatedTx.filter(tx => tx.date.endsWith(prefix));
            periodLabel = `Tháng ${pMonth}/${pYear}`;
        } else if (overviewPeriod === 'year') {
            const prefix = `/${curYear}`;
            filteredTx = consolidatedTx.filter(tx => tx.date.endsWith(prefix));
            periodLabel = `Năm ${curYear}`;
        } else if (overviewPeriod === 'prev_year') {
            const pYear = curYear - 1;
            const prefix = `/${pYear}`;
            filteredTx = consolidatedTx.filter(tx => tx.date.endsWith(prefix));
            periodLabel = `Năm ${pYear}`;
        } else {
            filteredTx = consolidatedTx;
            periodLabel = 'Tất cả thời gian';
        }

        const incomePeriod = filteredTx.filter(tx => tx.type === 'thu').reduce((sum, tx) => sum + tx.amount, 0);
        const expensePeriod = filteredTx.filter(tx => tx.type === 'chi').reduce((sum, tx) => sum + tx.amount, 0);

        const html = `
            <div class="thu-chi-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('tai-chinh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Tổng quan dòng tiền doanh nghiệp</h2>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:4px 12px; display:flex; align-items:center; gap:8px;">
                            <span class="material-icons-outlined" style="font-size:18px; color:#64748b;">calendar_today</span>
                            <select onchange="window.erpApp.changeOverviewPeriod(this.value)" style="border:none; background:none; font-size:13px; font-weight:700; color:#1e293b; padding:8px 0; cursor:pointer; outline:none;">
                                <option value="week" ${overviewPeriod === 'week' ? 'selected' : ''}>Tuần này</option>
                                <option value="month" ${overviewPeriod === 'month' ? 'selected' : ''}>Tháng này</option>
                                <option value="prev_month" ${overviewPeriod === 'prev_month' ? 'selected' : ''}>Tháng trước</option>
                                <option value="year" ${overviewPeriod === 'year' ? 'selected' : ''}>Năm nay</option>
                                <option value="prev_year" ${overviewPeriod === 'prev_year' ? 'selected' : ''}>Năm trước</option>
                                <option value="all" ${overviewPeriod === 'all' ? 'selected' : ''}>Tất cả</option>
                            </select>
                        </div>
                        <button onclick="window.erpApp.openAddTransactionModal('thu')" style="padding:12px 20px; background:#10b981; color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(16, 185, 129, 0.2);">
                            <span class="material-icons-outlined">add_circle</span> Thu tiền
                        </button>
                        <button onclick="window.erpApp.openAddTransactionModal('chi')" style="padding:12px 20px; background:#ef4444; color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 10px 15px -3px rgba(239, 68, 68, 0.2);">
                            <span class="material-icons-outlined">remove_circle</span> Chi tiền
                        </button>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-bottom:32px;">
                    <!-- Total Balance -->
                    <div class="premium-card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; padding:32px; border-radius:24px; position:relative; overflow:hidden;">
                        <span class="material-icons-outlined" style="position:absolute; right:-20px; bottom:-20px; font-size:160px; opacity:0.1;">account_balance_wallet</span>
                        <div style="font-size:12px; font-weight:800; opacity:0.7; text-transform:uppercase; letter-spacing:1px;">Tổng số dư hiện tại</div>
                        <div style="font-size:32px; font-weight:900; margin:12px 0;">${window.erpApp.formatValue(totalBalance)} đ</div>
                        <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:600;">
                            <span style="color:#10b981;">● ${accounts.length} Tài khoản</span>
                            <span style="opacity:0.6;">● Cập nhật: Vừa xong</span>
                        </div>
                    </div>
                    <!-- Monthly Summary -->
                    <div class="premium-card" style="background: #fff; border:1px solid #e2e8f0; padding:24px; border-radius:24px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Thu nhập (${periodLabel})</div>
                                <div style="font-size:24px; font-weight:900; color:#10b981; margin-top:4px;">+ ${window.erpApp.formatValue(incomePeriod)} đ</div>
                            </div>
                            <div style="width:40px; height:40px; background:#ecfdf5; color:#10b981; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">trending_up</span>
                            </div>
                        </div>
                        <div style="height:1px; background:#f1f5f9; margin:16px 0;"></div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Chi phí (${periodLabel})</div>
                                <div style="font-size:24px; font-weight:900; color:#ef4444; margin-top:4px;">- ${window.erpApp.formatValue(expensePeriod)} đ</div>
                            </div>
                            <div style="width:40px; height:40px; background:#fef2f2; color:#ef4444; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">trending_down</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:32px;">
                    <!-- Flow Chart -->
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">Biểu đồ dòng tiền (${periodLabel})</h3>
                            <div style="display:flex; gap:8px;">
                                <span style="display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#10b981;"><span style="width:10px; height:10px; border-radius:50%; background:#10b981;"></span> Thu</span>
                                <span style="display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#ef4444;"><span style="width:10px; height:10px; border-radius:50%; background:#ef4444;"></span> Chi</span>
                            </div>
                        </div>
                        <div style="height:320px;">
                            <canvas id="cashFlowChart"></canvas>
                        </div>
                    </div>
                    <!-- Recent Transactions Sidebar -->
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">Giao dịch (${periodLabel})</h3>
                            <span onclick="window.erpApp.renderThuChiTransactions()" style="font-size:12px; font-weight:700; color:#3b82f6; cursor:pointer;">Xem tất cả</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${filteredTx.slice().reverse().slice(0, 10).map(tx => {
                                const isIncome = tx.type === 'thu';
                                const isTransfer = tx.type === 'chuyen_khoan';
                                const color = isIncome ? '#10b981' : (isTransfer ? '#3b82f6' : '#ef4444');
                                const bg = isIncome ? '#ecfdf5' : (isTransfer ? '#eff6ff' : '#fef2f2');
                                const icon = isIncome ? 'add' : (isTransfer ? 'sync_alt' : 'remove');
                                return `
                                    <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.erpApp.viewTransactionDetail('${tx.id}')">
                                        <div style="width:36px; height:36px; background:${bg}; color:${color}; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                                            <span class="material-icons-outlined" style="font-size:18px;">${icon}</span>
                                        </div>
                                        <div style="flex:1;">
                                            <div style="font-size:13px; font-weight:700; color:#1e293b;">${tx.note}</div>
                                            <div style="font-size:11px; color:#94a3b8; font-weight:600;">${window.erpApp.formatDate(tx.date)} • ${tx.partner || 'N/A'}</div>
                                        </div>
                                        <div style="font-size:14px; font-weight:800; color:${color};">${isIncome ? '+' : (isTransfer ? '' : '-')}${window.erpApp.formatValue(tx.amount)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <h3 style="margin:0 0 20px 0; font-size:16px; font-weight:900; color:#1e293b;">Trạng thái tài khoản</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
                        ${accounts.map(acc => `
                            <div style="padding:20px; border:1px solid #f1f5f9; border-radius:20px; border-left:4px solid var(--icon-${acc.color}); hover:background:#f8fafc; transition:0.2s; cursor:pointer;" onclick="window.erpApp.renderThuChiAccounts()">
                                <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
                                    <span class="material-icons-outlined" style="color:var(--icon-${acc.color}); font-size:24px;">${acc.icon}</span>
                                    <div style="font-size:14px; font-weight:800; color:#1e293b;">${acc.name}</div>
                                </div>
                                <div style="font-size:18px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(acc.balance)} đ</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;

        // Init Chart (Period Aware)
        setTimeout(() => {
            const chartCanvas = document.getElementById('cashFlowChart');
            if (!chartCanvas) return;
            
            let labels = [];
            let incomeData = [];
            let expenseData = [];
            let chartType = 'line';
            
            if (overviewPeriod === 'week') {
                const startOfWeek = new Date();
                startOfWeek.setDate(now.getDate() - now.getDay());
                for (let i = 0; i < 7; i++) {
                    const d = new Date(startOfWeek);
                    d.setDate(d.getDate() + i);
                    const dateStr = window.erpApp.formatDate(d);
                    labels.push(`${d.getDate()}/${d.getMonth()+1}`);
                    incomeData.push(consolidatedTx.filter(t => t.type === 'thu' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                    expenseData.push(consolidatedTx.filter(t => t.type === 'chi' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                }
            } else if (overviewPeriod === 'month' || overviewPeriod === 'prev_month') {
                const targetDate = new Date();
                if (overviewPeriod === 'prev_month') targetDate.setMonth(now.getMonth() - 1);
                const year = targetDate.getFullYear();
                const month = targetDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                for (let i = 1; i <= daysInMonth; i++) {
                    const d = new Date(year, month, i);
                    const dateStr = window.erpApp.formatDate(d);
                    labels.push(i.toString());
                    incomeData.push(consolidatedTx.filter(t => t.type === 'thu' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                    expenseData.push(consolidatedTx.filter(t => t.type === 'chi' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                }
            } else if (overviewPeriod === 'year' || overviewPeriod === 'prev_year') {
                const targetYear = overviewPeriod === 'year' ? now.getFullYear() : now.getFullYear() - 1;
                chartType = 'bar';
                for (let m = 1; m <= 12; m++) {
                    const suffix = `/${m.toString().padStart(2,'0')}/${targetYear}`;
                    labels.push(`T${m}`);
                    incomeData.push(consolidatedTx.filter(t => t.type === 'thu' && t.date.endsWith(suffix)).reduce((s,t) => s+t.amount, 0));
                    expenseData.push(consolidatedTx.filter(t => t.type === 'chi' && t.date.endsWith(suffix)).reduce((s,t) => s+t.amount, 0));
                }
            } else {
                // Default: Last 7 Days
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = window.erpApp.formatDate(d);
                    labels.push(`${d.getDate()}/${d.getMonth()+1}`);
                    incomeData.push(consolidatedTx.filter(t => t.type === 'thu' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                    expenseData.push(consolidatedTx.filter(t => t.type === 'chi' && t.date === dateStr).reduce((s,t) => s+t.amount, 0));
                }
            }

            const ctx = chartCanvas.getContext('2d');
            if (window.myFlowChart) window.myFlowChart.destroy();
            window.myFlowChart = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Thu',
                            data: incomeData,
                            borderColor: '#10b981',
                            backgroundColor: chartType === 'line' ? 'rgba(16, 185, 129, 0.1)' : '#10b981',
                            fill: true,
                            tension: 0.4,
                            borderWidth: chartType === 'line' ? 3 : 0,
                            borderRadius: 4
                        },
                        {
                            label: 'Chi',
                            data: expenseData,
                            borderColor: '#ef4444',
                            backgroundColor: chartType === 'line' ? 'rgba(239, 68, 68, 0.1)' : '#ef4444',
                            fill: true,
                            tension: 0.4,
                            borderWidth: chartType === 'line' ? 3 : 0,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            ticks: { 
                                callback: v => v >= 1000000 ? (v / 1000000).toFixed(1) + ' M' : window.erpApp.formatValue(v), 
                                font: { family: 'Inter', size: 10 } 
                            }, 
                            grid: { color: '#f1f5f9' } 
                        },
                        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 } } }
                    }
                }
            });
        }, 300);
    }

    function changeOverviewPeriod(period) {
        overviewPeriod = period;
        renderThuChiOverview();
    }

    // ==========================================
    // MODULE: TRANSACTIONS LIST
    // ==========================================
    function renderThuChiTransactions() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) return;
        window.erpApp.updateBreadcrumb('Lịch sử giao dịch', 'Thu chi');
        const isAdmin = isUserAdmin();

        const consolidatedTx = getConsolidatedTransactions();
        const sortedTx = [...consolidatedTx].reverse();

        const html = `
            <div class="thu-chi-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.renderThuChiOverview()">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Sổ cái giao dịch tiền mặt & ngân hàng</h2>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.refreshTransactionData()" style="padding:12px 24px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                            <span class="material-icons-outlined">sync</span> Đồng bộ dữ liệu
                        </button>
                        <button onclick="window.erpApp.openAddTransactionModal()" style="padding:12px 24px; background:#3b82f6; color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <span class="material-icons-outlined">add</span> Tạo giao dịch mới
                        </button>
                    </div>
                </div>

                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden;">
                    <div style="padding:20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#fbfcfe;">
                        <div style="display:flex; gap:12px;">
                            <div style="position:relative; width:300px;">
                                <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:18px;">search</span>
                                <input type="text" id="txSearchInp" oninput="window.erpApp.filterTransactionTable()" placeholder="Tìm kiếm giao dịch, đối tác..." style="width:100%; padding:10px 12px 10px 40px; border:1px solid #e2e8f0; border-radius:12px; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'">
                            </div>
                            <select id="txTypeFilter" onchange="window.erpApp.filterTransactionTable()" style="padding:8px 16px; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#64748b; background:#fff; cursor:pointer; outline:none; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'">
                                <option value="all">Tất cả loại hình</option>
                                <option value="thu">Thu nhập</option>
                                <option value="chi">Chi phí</option>
                                <option value="chuyen_khoan">Chuyển khoản</option>
                            </select>
                        </div>
                        <div style="font-size:13px; font-weight:600; color:#94a3b8;">Hiển thị <span id="txCountLabel">${sortedTx.length}</span> giao dịch gần nhất</div>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;" id="txTable">
                            <thead>
                                <tr style="text-align:left; background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Ngày</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Mã / Đối tác</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Hạng mục / Ghi chú</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tài khoản</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Số tiền</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Trạng thái</th>
                                    <th style="padding:16px 20px; width:120px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedTx.map(tx => {
                                    const isIncome = tx.type === 'thu';
                                    const isTransfer = tx.type === 'chuyen_khoan';
                                    const color = isIncome ? '#10b981' : (isTransfer ? '#3b82f6' : '#ef4444');
                                    const catName = isTransfer ? 'Nội bộ' : ([...incomeCategories, ...expenseCategories].find(c => c.id === tx.category)?.name || 'N/A');
                                    const accName = isTransfer ? `${tx.fromAccountId} → ${tx.toAccountId}` : (accounts.find(a => a.id === tx.accountId)?.name || 'N/A');
                                    
                                    return `
                                        <tr style="border-bottom:1px solid #f8fafc; transition:0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                            <td style="padding:16px 20px; font-size:13px; font-weight:600; color:#64748b;">${window.erpApp.formatDate(tx.date)}</td>
                                            <td style="padding:16px 20px;">
                                                <div style="font-size:13px; font-weight:800; color:#3b82f6;">${tx.id}</div>
                                                <div style="font-size:12px; font-weight:600; color:#1e293b; margin-top:2px;">${tx.partner || 'N/A'}</div>
                                            </td>
                                            <td style="padding:16px 20px;">
                                                <div style="font-size:13px; font-weight:700; color:#1e293b;">${catName}</div>
                                                <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                                                    <div style="font-size:12px; color:#94a3b8; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">${tx.note}</div>
                                                    ${tx.fileUrl ? '<span class="material-icons-outlined" style="font-size:14px; color:#0ea5e9;" title="Có chứng từ đính kèm">link</span>' : ''}
                                                </div>
                                            </td>
                                            <td style="padding:16px 20px; font-size:12px; font-weight:600; color:#64748b;">${accName}</td>
                                            <td style="padding:16px 20px; font-size:15px; font-weight:900; color:${color}; text-align:right;">${isIncome ? '+' : (isTransfer ? '' : '-')}${window.erpApp.formatValue(tx.amount)}</td>
                                            <td style="padding:16px 20px; text-align:center;">
                                                <span style="padding:6px 12px; border-radius:30px; font-size:10px; font-weight:800; text-transform:uppercase; background:${tx.status === 'completed' ? '#dcfce7' : '#fef2f2'}; color:${tx.status === 'completed' ? '#16a34a' : '#ef4444'}">
                                                    ${tx.status === 'completed' ? 'Thành công' : 'Chờ xử lý'}
                                                </span>
                                            </td>
                                            <td style="padding:16px 20px; text-align:center;">
                                                <div style="display:flex; gap:6px; justify-content:center; align-items:center;">
                                                    ${tx.source && tx.source !== 'manual' ? `
                                                        <button onclick="window.erpApp.goToDebtSource('${tx.source}', '${tx.contractId || tx.materialId || tx.id}', '${tx.projectId}')" 
                                                                title="Xem dữ liệu gốc" 
                                                                style="background:#f0f9ff; border:1px solid #bae6fd; cursor:pointer; color:#0369a1; width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:0.2s;"
                                                                onmouseover="this.style.background='#e0f2fe'" onmouseout="this.style.background='#f0f9ff'">
                                                            <span class="material-icons-outlined" style="font-size:18px;">launch</span>
                                                        </button>
                                                    ` : ''}
                                                    <button onclick="window.erpApp.viewTransactionDetail('${tx.id}')" title="Xem chi tiết" style="background:none; border:none; color:#3b82f6; cursor:pointer; display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:10px; transition:all 0.2s;" onmouseover="this.style.background='#eff6ff'; this.style.color='#1d4ed8'" onmouseout="this.style.background='none'; this.style.color='#3b82f6'">
                                                        <span class="material-icons-outlined" style="font-size:20px;">visibility</span>
                                                    </button>
                                                    ${isUserAdmin() && (!tx.source || tx.source === 'manual') ? `
                                                        <button onclick="window.erpApp.openTransactionModal('${tx.type}', '${tx.id}', '${tx.source || 'manual'}')" title="Chỉnh sửa" style="background:none; border:none; color:#10b981; cursor:pointer; display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:10px; transition:all 0.2s;" onmouseover="this.style.background='#ecfdf5'; this.style.color='#059669'" onmouseout="this.style.background='none'; this.style.color='#10b981'">
                                                            <span class="material-icons-outlined" style="font-size:20px;">edit</span>
                                                        </button>
                                                        <button onclick="window.erpApp.deleteTransaction('${tx.id}', '${tx.source || 'manual'}')" title="Xóa giao dịch" style="background:none; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:10px; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'; this.style.color='#dc2626'" onmouseout="this.style.background='none'; this.style.color='#ef4444'">
                                                            <span class="material-icons-outlined" style="font-size:20px;">delete</span>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        pageContent.innerHTML = html;
    }

    // ==========================================
    // MODULE: ACCOUNTS MANAGEMENT
    // ==========================================
    function renderThuChiAccounts() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) return;
        window.erpApp.updateBreadcrumb('Quản lý tài khoản', 'Thu chi');
        const isAdmin = isUserAdmin();

        const html = `
            <div class="thu-chi-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <button class="back-btn" onclick="window.erpApp.renderThuChiOverview()">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                    ${isAdmin ? `
                        <button onclick="window.erpApp.openAccountModal()" style="padding:12px 24px; background:#1e293b; color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <span class="material-icons-outlined">add</span> Thêm tài khoản mới
                        </button>
                    ` : ''}
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:24px;">
                    ${accounts.map(acc => {
                        const txs = transactions.filter(t => t.accountId === acc.id || t.fromAccountId === acc.id || t.toAccountId === acc.id);
                        const bankInfo = getBankInfo(acc.name);
                        return `
                        <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:28px; transition:all 0.3s; position:relative; overflow:hidden;" 
                             onmouseover="this.style.borderColor='var(--icon-${bankInfo.color})'; this.style.transform='translateY(-5px)'" 
                             onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='none'">
                            
                            <!-- Brand Overlay -->
                            <div style="position:absolute; right:-10px; top:-10px; font-size:60px; font-weight:900; color:#f1f5f9; z-index:0; user-select:none;">${bankInfo.brand}</div>

                            <div style="position:relative; z-index:1;">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
                                    <div style="width:56px; height:56px; background:${bankInfo.logo ? '#fff' : `var(--icon-${bankInfo.color}-bg) `}; color:var(--icon-${bankInfo.color}); border-radius:18px; display:flex; align-items:center; justify-content:center; box-shadow: ${bankInfo.logo ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'}; border: ${bankInfo.logo ? '1px solid #f1f5f9' : 'none'}; overflow:hidden;">
                                        ${bankInfo.logo ? `<img src="${bankInfo.logo}" style="width:100%; height:100%; object-fit:contain; padding:8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                        <span class="material-icons-outlined" style="font-size:28px; display:none;">${bankInfo.icon}</span>` : `<span class="material-icons-outlined" style="font-size:28px;">${bankInfo.icon}</span>`}
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Số dư khả dụng</div>
                                        <div style="font-size:24px; font-weight:900; color:#10b981; margin-top:4px;">${window.erpApp.formatValue(acc.balance)} đ</div>
                                    </div>
                                </div>
                                <h3 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${acc.name}</h3>
                                <div style="font-size:13px; color:#64748b; font-weight:600; margin-top:4px;">Mã số: ${acc.id}</div>
                                
                                <div style="margin-top:24px; padding-top:20px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                                    <div style="display:flex; gap:8px;">
                                        ${isAdmin ? `
                                            <button onclick="event.stopPropagation(); window.erpApp.openAccountModal('${acc.id}')" style="width:32px; height:32px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; color:#64748b; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Chỉnh sửa">
                                                <span class="material-icons-outlined" style="font-size:16px; pointer-events:none;">edit</span>
                                            </button>
                                            <button onclick="event.stopPropagation(); window.erpApp.deleteAccount('${acc.id}')" style="width:32px; height:32px; border-radius:8px; border:1px solid #fecaca; background:#fff; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Xóa tài khoản">
                                                <span class="material-icons-outlined" style="font-size:16px; pointer-events:none;">delete</span>
                                            </button>
                                        ` : `
                                            <div style="font-size:11px; color:#94a3b8; font-weight:600; font-style:italic;">Chỉ xem</div>
                                        `}
                                    </div>
                                    <button onclick="event.stopPropagation(); window.erpApp.viewAccountDetail('${acc.id}')" style="background:#f1f5f9; border:none; padding:8px 16px; border-radius:10px; font-size:12px; font-weight:700; color:#1e293b; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Chi tiết tài khoản</button>
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

    // ==========================================
    // MODULE: DEBTS (PARTNERS) - CRUD + LIÊN KẾT DỰ ÁN
    // ==========================================
    let debtPartners = [];
    try {
        const savedDebts = localStorage.getItem('erp_debt_partners');
        if (savedDebts) {debtPartners = JSON.parse(savedDebts);}
        else {
            debtPartners = [
                { id: 'DP-001', name: 'Ban QLDA Đường cao tốc', type: 'Chủ đầu tư', project: 'Cao tốc Cần Thơ - Cà Mau', receivable: 450000000, payable: 0, dueDate: '2026-05-15' },
                { id: 'DP-002', name: 'Cty TNHH Xây dựng Hòa Phát', type: 'Thầu phụ', project: 'Cầu Cái Sắn', receivable: 0, payable: 320500000, dueDate: '2026-04-20' },
                { id: 'DP-003', name: 'VLXD Thành Công', type: 'Nhà cung cấp', project: '', receivable: 0, payable: 120500000, dueDate: '2026-04-25' },
                { id: 'DP-004', name: 'Sở GTVT tỉnh Cần Thơ', type: 'Chủ đầu tư', project: 'Đường tỉnh 918B', receivable: 795600000, payable: 0, dueDate: '2026-06-01' }
            ];
            localStorage.setItem('erp_debt_partners', JSON.stringify(debtPartners));
        }
    } catch (e) { }

    function saveDebtPartners() {
        localStorage.setItem('erp_debt_partners', JSON.stringify(debtPartners));
        // Sync is handled in individual save/delete functions
    }

    // Consolidated Debt Helper
    function getConsolidatedDebts() {
        let allDebts = [...debtPartners].map(d => ({ ...d, source: 'manual' }));

        // 1. Pull Debt from Project Management Contracts
        const pmContracts = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmContracts') : [];
        const pmProjects = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmProjects') : [];

        pmContracts.forEach(c => {
            const debt = (c.value || 0) - (c.paid || 0);
            if (debt > 0) {
                const project = pmProjects.find(p => p.id === c.projectId);
                const isReceivable = c.type === 'outbound';
                
                // Check if this partner/project already exists in manual list to avoid duplication
                const exists = allDebts.find(d => d.name === c.partner && d.project === (project ? project.name : c.projectId));
                if (exists) {
                    if (isReceivable) exists.receivable += debt;
                    else exists.payable += debt;
                    // Add link info to exists if not there
                    if (!exists.links) exists.links = [];
                    exists.links.push({ id: c.id, projectId: c.projectId, type: 'pm-contract' });
                } else {
                    allDebts.push({
                        id: `PMD-${c.id}`,
                        name: c.partner,
                        type: isReceivable ? 'Chủ đầu tư' : 'Thầu phụ',
                        project: project ? project.name : c.projectId,
                        receivable: isReceivable ? debt : 0,
                        payable: isReceivable ? 0 : debt,
                        dueDate: c.guaranteeExpiry || '',
                        source: 'pm-contract',
                        projectId: c.projectId,
                        contractId: c.id
                    });
                }
            }
        });

        // 2. Pull Debt from PM Material Contracts
        const pmMaterials = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('pmMaterialContracts') : [];
        pmMaterials.forEach(mc => {
            const debt = (mc.value || 0) - (mc.advanceAmount || 0) - (mc.paidAmount || 0);
            if (debt > 0) {
                const project = pmProjects.find(p => p.id === mc.projectId);
                const exists = allDebts.find(d => d.name === mc.supplier && d.project === (project ? project.name : mc.projectId));
                if (exists) {
                    exists.payable += debt;
                    if (!exists.links) exists.links = [];
                    exists.links.push({ id: mc.id, projectId: mc.projectId, type: 'pm-material' });
                } else {
                    allDebts.push({
                        id: `MCD-${mc.id}`,
                        name: mc.supplier,
                        type: 'Nhà cung cấp',
                        project: project ? project.name : mc.projectId,
                        receivable: 0,
                        payable: debt,
                        dueDate: '',
                        source: 'pm-material',
                        projectId: mc.projectId,
                        materialId: mc.id
                    });
                }
            }
        });

        return allDebts;
    }

    function renderThuChiDebts() {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) return;
        window.erpApp.updateBreadcrumb('Công nợ đối tác', 'Thu chi');
        const f = window.erpApp.formatValue;
        const isAdmin = isUserAdmin();

        const consolidatedDebts = getConsolidatedDebts();
        const totalAR = consolidatedDebts.reduce((s, d) => s + d.receivable, 0);
        const totalAP = consolidatedDebts.reduce((s, d) => s + d.payable, 0);
        const arCount = consolidatedDebts.filter(d => d.receivable > 0).length;
        const apCount = consolidatedDebts.filter(d => d.payable > 0).length;

        const typeBadge = (type) => {
            if (type === 'Chủ đầu tư') {return '<span style="background:#dbeafe; color:#2563eb; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:700;">Chủ đầu tư</span>';}
            if (type === 'Thầu phụ') {return '<span style="background:#fef3c7; color:#a16207; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:700;">Thầu phụ</span>';}
            return '<span style="background:#f1f5f9; color:#475569; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:700;">NCC</span>';
        };

        const rows = consolidatedDebts.map(d => `
            <tr style="border-bottom:1px solid #f8fafc; transition:0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                <td style="padding:16px 20px;">
                    <div style="font-weight:800; color:#1e293b;">${d.name}</div>
                    ${d.project ? `<div style="font-size:11px; color:#0ea5e9; font-weight:600; margin-top:2px;"><span class="material-icons-outlined" style="font-size:12px; vertical-align:middle;">location_on</span> ${d.project}</div>` : ''}
                </td>
                <td style="padding:16px 20px;">${typeBadge(d.type)}</td>
                <td style="padding:16px 20px; font-weight:900; color:${d.receivable > 0 ? '#10b981' : '#cbd5e1'}; text-align:right;">${d.receivable > 0 ? f(d.receivable) + ' đ' : '—'}</td>
                <td style="padding:16px 20px; font-weight:900; color:${d.payable > 0 ? '#ef4444' : '#cbd5e1'}; text-align:right;">${d.payable > 0 ? f(d.payable) + ' đ' : '—'}</td>
                <td style="padding:16px 20px; text-align:center; font-weight:700; color:${window.erpApp.toJsDate(d.dueDate) < new Date() ? '#ef4444' : '#64748b'};">${window.erpApp.formatDate(d.dueDate)}</td>
                <td style="padding:16px 20px; text-align:right;">
                    <div style="display:flex; gap:6px; justify-content:center; align-items:center;">
                        ${d.source !== 'manual' ? `
                            <button onclick="window.erpApp.goToDebtSource('${d.source}', '${d.contractId || d.materialId}', '${d.projectId}')" 
                                    title="Xem dữ liệu gốc tại PM" 
                                    style="background:#f0f9ff; border:1px solid #bae6fd; cursor:pointer; color:#0369a1; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:0.2s;"
                                    onmouseover="this.style.background='#e0f2fe'" onmouseout="this.style.background='#f0f9ff'">
                                <span class="material-icons-outlined" style="font-size:18px;">launch</span>
                            </button>
                        ` : `
                            ${isAdmin ? `
                                <button onclick="window.erpApp.openDebtModal('${d.id}')" title="Chỉnh sửa" style="background:none; border:none; cursor:pointer; color:#3b82f6; width:32px; height:32px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="font-size:18px;">edit</span></button>
                                <button onclick="window.erpApp.deleteDebtPartner('${d.id}')" title="Xóa" style="background:none; border:none; cursor:pointer; color:#ef4444; width:32px; height:32px; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="font-size:18px;">delete</span></button>
                            ` : ''}
                        `}
                    </div>
                </td>
            </tr>
        `).join('');

        pageContent.innerHTML = `
            <div class="thu-chi-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.renderThuChiOverview()">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Công nợ Đối tác (Chủ đầu tư / Thầu phụ / NCC)</h2>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button onclick="window.erpApp.refreshDebtData()" style="padding:12px 24px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                            <span class="material-icons-outlined">refresh</span> Cập nhật dữ liệu
                        </button>
                        ${isAdmin ? `<button onclick="window.erpApp.openDebtModal()" style="padding:12px 24px; background:#1e293b; color:#fff; border:none; border-radius:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <span class="material-icons-outlined">add</span> Thêm đối tác
                        </button>` : ''}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; margin-bottom:32px;">
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; border-top:6px solid #10b981;">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tổng Phải Thu (AR)</div>
                        <div style="font-size:28px; font-weight:900; color:#10b981; margin-top:8px;">${f(totalAR)} đ</div>
                        <div style="margin-top:12px; font-size:13px; font-weight:600; color:#64748b;">${arCount} đối tác đang nợ</div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; border-top:6px solid #ef4444;">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Tổng Phải Trả (AP)</div>
                        <div style="font-size:28px; font-weight:900; color:#ef4444; margin-top:8px;">${f(totalAP)} đ</div>
                        <div style="margin-top:12px; font-size:13px; font-weight:600; color:#64748b;">${apCount} đối tác cần thanh toán</div>
                    </div>
                    <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; border-top:6px solid #3b82f6;">
                        <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Chênh lệch ròng</div>
                        <div style="font-size:28px; font-weight:900; color:${totalAR - totalAP >= 0 ? '#10b981' : '#ef4444'}; margin-top:8px;">${f(totalAR - totalAP)} đ</div>
                        <div style="margin-top:12px; font-size:13px; font-weight:600; color:#64748b;">${totalAR - totalAP >= 0 ? 'Dương (Thu > Trả)' : 'Âm (Trả > Thu)'}</div>
                    </div>
                </div>

                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">Danh sách công nợ chi tiết</h3>
                        <div style="position:relative; width:300px;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:18px;">search</span>
                            <input type="text" id="debtSearchInp" oninput="window.erpApp.filterDebtTable(this.value)" placeholder="Tìm đối tác hoặc dự án..." style="width:100%; padding:10px 12px 10px 40px; border:1.5px solid #e2e8f0; border-radius:12px; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'">
                        </div>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;" id="debtTable">
                            <thead>
                                <tr style="text-align:left; background:#f8fafc; border-bottom:1px solid #f1f5f9;">
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Đối tác / Dự án</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Phân loại</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Phải thu</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Phải trả</th>
                                    <th style="padding:16px 20px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Hạn gần nhất</th>
                                    <th style="padding:16px 20px; width:120px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    }

    window.erpApp.filterDebtTable = (query) => {
        const q = query.toLowerCase().trim();
        const rows = document.querySelectorAll('#debtTable tbody tr');
        rows.forEach(row => {
            const text = row.cells[0].textContent.toLowerCase();
            row.style.display = text.includes(q) ? '' : 'none';
        });
    };

    window.erpApp.refreshDebtData = () => {
        window.erpApp.showToast('Đang cập nhật dữ liệu từ các phân hệ...', 'info');
        setTimeout(() => {
            renderThuChiDebts();
            window.erpApp.showToast('Dữ liệu công nợ đã được cập nhật!', 'success');
        }, 500);
    };

    window.erpApp.refreshTransactionData = () => {
        window.erpApp.showToast('Đang đồng bộ giao dịch từ các phân hệ...', 'info');
        setTimeout(() => {
            renderThuChiTransactions();
            window.erpApp.showToast('Dữ liệu giao dịch đã được đồng bộ!', 'success');
        }, 500);
    };

    window.erpApp.filterTransactionTable = () => {
        const query = document.getElementById('txSearchInp').value.toLowerCase().trim();
        const type = document.getElementById('txTypeFilter').value;
        const rows = document.querySelectorAll('#txTable tbody tr');
        let count = 0;

        rows.forEach(row => {
            const partner = row.cells[1].textContent.toLowerCase();
            const note = row.cells[2].textContent.toLowerCase();
            const id = row.cells[1].querySelector('div').textContent.toLowerCase();
            
            // Check type from some hidden data or from the row style/content
            // A better way is to check the amount color or text
            const amountText = row.cells[4].textContent;
            let rowType = 'chi';
            if (amountText.startsWith('+')) rowType = 'thu';
            else if (!amountText.includes('+') && !amountText.includes('-')) rowType = 'chuyen_khoan';

            const matchesQuery = partner.includes(query) || note.includes(query) || id.includes(query);
            const matchesType = type === 'all' || rowType === type;

            if (matchesQuery && matchesType) {
                row.style.display = '';
                count++;
            } else {
                row.style.display = 'none';
            }
        });

        document.getElementById('txCountLabel').textContent = count;
    };

    window.erpApp.goToDebtSource = (source, id, projectId) => {
        if (!source || source === 'manual') return;
        
        if (source === 'pm-contract' || source === 'pm-material') {
            if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
                // Navigate to PM and select project
                window.erpApp.pmActiveProjectId = projectId;
                window.erpApp.openModule('Quản lý dự án'); // Ensure module is active
                
                // Optional: after a delay, open the specific modal
                setTimeout(() => {
                    if (source === 'pm-contract' && typeof window.erpApp.pmOpenEditContractModal === 'function') {
                        window.erpApp.pmOpenEditContractModal(id, true); // Open in view mode
                    } else if (source === 'pm-material' && typeof window.erpApp.pmOpenEditMaterialContractModal === 'function') {
                        window.erpApp.pmOpenEditMaterialContractModal(id);
                    }
                }, 800);
            } else {
                window.erpApp.showToast('Chức năng Quản lý dự án chưa sẵn sàng!', 'warning');
            }
        }
    };

    window.erpApp.openDebtModal = function (id = null) {
        const item = id ? debtPartners.find(d => d.id === id) : null;
        const title = id ? 'Chỉnh sửa công nợ' : 'Thêm đối tác công nợ';

        // Lấy danh sách dự án từ module Quản lý dự án
        let projectSuggestions = '';
        try {
            const projects = window.pmProjects || [];
            projectSuggestions = projects.map(p => `<option value="${p.name}">`).join('');
        } catch (e) { }

        // Lấy danh sách đối tác từ API dùng chung
        let partnerSuggestions = '';
        try {
            const partners = window.erpApp.getPartners ? window.erpApp.getPartners() : [];
            partnerSuggestions = partners.map(p => `<option value="${p.name}">`).join('');
        } catch (e) { }

        const modalHtml = `
            <div id="debtModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);">
                <div style="max-width:500px; width:100%; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
                    <div style="padding:20px 24px; background:#1e293b; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:16px; font-weight:800;">${title}</h3>
                        <button style="background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('debtModal').remove()"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="debtForm" style="padding:24px; display:grid; gap:16px;">
                        <div class="form-group"><label>Tên đối tác</label>
                            <input type="text" name="name" list="debtPartnerList" autocomplete="off" value="${item ? item.name : ''}" placeholder="Nhập hoặc chọn từ danh sách..." required>
                            <datalist id="debtPartnerList">
                                ${partnerSuggestions}
                            </datalist>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group"><label>Phân loại</label>
                                <select name="type" required>
                                    <option value="Chủ đầu tư" ${item && item.type === 'Chủ đầu tư' ? 'selected' : ''}>Chủ đầu tư</option>
                                    <option value="Thầu phụ" ${item && item.type === 'Thầu phụ' ? 'selected' : ''}>Thầu phụ</option>
                                    <option value="Nhà cung cấp" ${item && item.type === 'Nhà cung cấp' ? 'selected' : ''}>Nhà cung cấp</option>
                                </select></div>
                            <div class="form-group"><label>Dự án liên kết</label>
                                <input type="text" name="project" list="debtProjectList" autocomplete="off" value="${item ? item.project : ''}" placeholder="Gõ tên dự án để tìm...">
                                <datalist id="debtProjectList">
                                    ${projectSuggestions}
                                </datalist>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group"><label>Phải thu (VNĐ)</label>
                                <input type="text" name="receivable" value="${item ? window.erpApp.formatValue(item.receivable) : '0'}" oninput="window.erpApp.formatNumberInput(this)"></div>
                            <div class="form-group"><label>Phải trả (VNĐ)</label>
                                <input type="text" name="payable" value="${item ? window.erpApp.formatValue(item.payable) : '0'}" oninput="window.erpApp.formatNumberInput(this)"></div>
                        </div>
                        <div class="form-group"><label>Hạn thanh toán gần nhất</label>
                            <input type="text" name="dueDate" class="erp-datepicker" value="${window.erpApp.formatDate(item ? item.dueDate : '')}" placeholder="DD/MM/YYYY"></div>
                    </form>
                    <div style="padding:16px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button class="btn-cancel" onclick="document.getElementById('debtModal').remove()">Hủy</button>
                        <button class="btn-save" onclick="window.erpApp.saveDebtPartner('${id || ''}')">Lưu lại</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const debtModalRef = document.getElementById('debtModal');
        if (debtModalRef && typeof flatpickr !== 'undefined') {
            flatpickr(debtModalRef.querySelectorAll('.erp-datepicker'), { dateFormat: 'd/m/Y', allowInput: true });
        }
    };

    window.erpApp.saveDebtPartner = function (id) {
        const form = document.getElementById('debtForm');
        const fd = new FormData(form);
        const data = {
            id: id || 'DP-' + Date.now().toString().slice(-6),
            name: fd.get('name'),
            type: fd.get('type'),
            project: fd.get('project') || '',
            receivable: window.erpApp.parseVND(fd.get('receivable')),
            payable: window.erpApp.parseVND(fd.get('payable')),
            dueDate: window.erpApp.parseInputDate(fd.get('dueDate')) || ''
        };
        if (id) {
            const idx = debtPartners.findIndex(d => d.id === id);
            if (idx > -1) {debtPartners[idx] = data;}
        } else {
            debtPartners.push(data);
        }
        saveDebtPartners();
        if (window.CrudSync) {window.CrudSync.saveItem('erp_debt_partners', data, 'id');}
        document.getElementById('debtModal').remove();
        window.erpApp.showToast('Đã lưu công nợ đối tác', 'success');
        renderThuChiDebts();
    };

    window.erpApp.deleteDebtPartner = function (id) {
        const partner = debtPartners.find(d => d.id === id);
        if (!partner) {return;}
        
        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa công nợ đối tác <strong>${partner.name}</strong>? Thao tác này không thể hoàn tác.`,
            function() {
                debtPartners = debtPartners.filter(d => d.id !== id);
                saveDebtPartners();
                if (window.CrudSync) {window.CrudSync.deleteItem('erp_debt_partners', id);}
                
                window.erpApp.showToast('Đã xóa công nợ đối tác thành công', 'success');

                // Audit Log
                window.erpApp.notifyCRUD('Tài chính', 'delete', {
                    name: partner.name,
                    page: 'tai-chinh',
                    module: 'Công nợ'
                });

                renderThuChiDebts();
            }
        );
    };

    // ==========================================
    // MODALS & HELPERS
    // ==========================================
    function openTransactionModal(type = 'thu', id = null, source = 'manual') {
        if (source && source !== 'manual') {
            window.erpApp.showToast('Giao dịch này được đồng bộ từ module khác. Đang chuyển hướng tới dữ liệu gốc...', 'info');
            // Tìm dự án và các ID liên quan từ consolidated list
            const consolidated = getConsolidatedTransactions();
            const tx = consolidated.find(t => t.id === id);
            if (tx) {
                window.erpApp.goToDebtSource(tx.source, tx.contractId || tx.materialId || tx.id, tx.projectId);
            }
            return;
        }

        const isEdit = !!id;
        const tx = isEdit ? transactions.find(t => t.id === id) : null;
        if (isEdit && tx) {type = tx.type;}

        const title = isEdit ? `Chỉnh sửa giao dịch ${id}` : (type === 'thu' ? 'Ghi nhận Thu nhập mới' : (type === 'chi' ? 'Ghi nhận Chi phí mới' : 'Chuyển khoản nội bộ'));
        const color = type === 'thu' ? '#10b981' : (type === 'chi' ? '#ef4444' : '#3b82f6');
        const cats = type === 'thu' ? incomeCategories : expenseCategories;

        const modalHtml = `
            <div id="txModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:9000; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);">
                <div class="modal-content" style="width:500px; border-radius:24px; background:#fff; overflow:hidden; animation:modalPop 0.3s ease-out;">
                    <style>@keyframes modalPop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }</style>
                    <div style="background:${color}; padding:24px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined">${isEdit ? 'edit' : (type === 'thu' ? 'add_circle' : 'remove_circle')}</span> ${title}
                        </h2>
                        <button onclick="window.erpApp.closeTxModal()" style="background:none; border:none; cursor:pointer; color:#fff; opacity:0.8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="txForm" style="padding:24px; display:grid; gap:16px;">
                        <input type="hidden" name="id" value="${id || ''}">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày giao dịch</label>
                                <input type="text" name="date" class="form-control erp-datepicker" value="${window.erpApp.formatDate(isEdit ? tx.date : new Date())}" required placeholder="DD/MM/YYYY">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số tiền (VNĐ) <span style="color:red">*</span></label>
                                <input type="text" name="amount" class="form-control" value="${isEdit ? window.erpApp.formatValue(tx.amount) : ''}" oninput="window.erpApp.formatNumberInput(this)" placeholder="0" style="font-weight:900; font-size:16px;" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">${type === 'chuyen_khoan' ? 'Từ tài khoản' : 'Tài khoản'}</label>
                            <select name="accountId" class="form-control" ${isEdit ? 'disabled' : ''} required>
                                ${accounts.map(a => `<option value="${a.id}" ${isEdit && tx.accountId === a.id ? 'selected' : ''}>${a.name} (${window.erpApp.formatValue(a.balance)} đ)</option>`).join('')}
                            </select>
                            ${isEdit ? '<div style="font-size:10px; color:#94a3b8; margin-top:4px;">* Không thể đổi tài khoản khi sửa. Hãy xóa và tạo mới nếu cần.</div>' : ''}
                        </div>

                        ${type === 'chuyen_khoan' ? `
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đến tài khoản</label>
                            <select name="toAccountId" class="form-control" ${isEdit ? 'disabled' : ''} required>
                                ${accounts.map(a => `<option value="${a.id}" ${isEdit && tx.toAccountId === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
                            </select>
                        </div>
                        ` : `
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạng mục</label>
                            <select name="category" class="form-control" required>
                                ${cats.map(c => `<option value="${c.id}" ${isEdit && tx.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        `}

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Dự án liên kết</label>
                            <select name="projectId" class="form-control">
                                <option value="">-- Không thuộc dự án --</option>
                                ${(window.pmProjects || []).map(p => `<option value="${p.id}" ${isEdit && tx.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đối tác / Người nhận</label>
                            <input type="text" name="partner" class="form-control" value="${isEdit ? (tx.partner || '') : ''}" placeholder="Tên khách hàng hoặc NCC...">
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ghi chú</label>
                            <textarea name="note" class="form-control" style="min-height:80px;">${isEdit ? (tx.note || '') : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Liên kết chứng từ (URL)</label>
                            <div style="position:relative;">
                                <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:18px;">link</span>
                                <input type="url" name="fileUrl" class="form-control" value="${isEdit ? (tx.fileUrl || '') : ''}" placeholder="Dán link chứng từ từ Google Drive, v.v..." style="padding-left:40px;">
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
                            <button type="button" onclick="window.erpApp.closeTxModal()" style="padding:12px 24px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:12px; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                            <button type="submit" style="padding:12px 32px; background:${color}; color:#fff; border:none; border-radius:12px; font-weight:800; cursor:pointer;">${isEdit ? 'Cập nhật' : 'Lưu giao dịch'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const txModalRef = document.getElementById('txModal');
        if (txModalRef && typeof flatpickr !== 'undefined') {
            flatpickr(txModalRef.querySelectorAll('.erp-datepicker'), { dateFormat: 'd/m/Y', allowInput: true });
        }

        document.getElementById('txForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const amt = window.erpApp.parseVND(data.amount);

            if (isEdit) {
                const index = transactions.findIndex(t => t.id === id);
                if (index > -1) {
                    const oldTx = transactions[index];
                    const diff = amt - oldTx.amount;

                    // Update account balance based on diff
                    const accIdx = accounts.findIndex(a => a.id === oldTx.accountId);
                    if (accIdx > -1) {
                        if (oldTx.type === 'thu') {accounts[accIdx].balance += diff;}
                        else if (oldTx.type === 'chi') {accounts[accIdx].balance -= diff;}
                    }
                    
                    if (oldTx.type === 'chuyen_khoan') {
                        // Transfer logic is complex to edit, but let's handle simple amount change
                        const fromIdx = accounts.findIndex(a => a.id === oldTx.accountId);
                        const toIdx = accounts.findIndex(a => a.id === oldTx.toAccountId);
                        if (fromIdx > -1) {accounts[fromIdx].balance -= diff;}
                        if (toIdx > -1) {accounts[toIdx].balance += diff;}
                    }

                    transactions[index] = {
                        ...oldTx,
                        date: window.erpApp.parseInputDate(data.date),
                        amount: amt,
                        category: data.category,
                        projectId: data.projectId || '',
                        partner: data.partner,
                        note: data.note,
                        fileUrl: data.fileUrl || ''
                    };
                    if (window.CrudSync) {window.CrudSync.saveItem('erp_tc_transactions', transactions[index], 'id');}
                }
            } else {
                const newTx = {
                    id: 'TX-' + (Date.now() % 10000),
                    type,
                    date: window.erpApp.parseInputDate(data.date),
                    amount: amt,
                    accountId: data.accountId,
                    category: data.category,
                    projectId: data.projectId || '',
                    partner: data.partner,
                    note: data.note,
                    fileUrl: data.fileUrl || '',
                    status: 'completed'
                };
                if (type === 'chuyen_khoan') {newTx.toAccountId = data.toAccountId;}

                // Update Account Balance
                const accIdx = accounts.findIndex(a => a.id === data.accountId);
                if (accIdx > -1) {
                    if (type === 'thu') {accounts[accIdx].balance += amt;}
                    else if (type === 'chi') {accounts[accIdx].balance -= amt;}
                    else if (type === 'chuyen_khoan') {
                        accounts[accIdx].balance -= amt;
                        const toAccIdx = accounts.findIndex(a => a.id === data.toAccountId);
                        if (toAccIdx > -1) {accounts[toAccIdx].balance += amt;}
                    }
                }
                transactions.push(newTx);
                if (window.CrudSync) {window.CrudSync.saveItem('erp_tc_transactions', newTx, 'id');}
            }

            saveDataThuChi();
            // Sync accounts since balances changed
            if (window.CrudSync) {
                accounts.forEach(acc => {
                    window.CrudSync.saveItem('erp_tc_accounts', acc, 'id');
                });
            }

            // Gửi thông báo hệ thống
            if (window.erpApp.addNotification) {
                const action = isEdit ? 'Cập nhật' : 'Ghi nhận';
                const typeLabel = type === 'thu' ? 'thu nhập' : (type === 'chi' ? 'chi phí' : 'chuyển khoản');
                window.erpApp.addNotification(
                    `Đã ${action.toLowerCase()} ${typeLabel}: ${window.erpApp.formatValue(amt)} đ`,
                    type === 'thu' ? 'add_circle' : (type === 'chi' ? 'remove_circle' : 'sync_alt'),
                    type === 'thu' ? 'green' : (type === 'chi' ? 'red' : 'blue'),
                    'tai-chinh'
                );
            }

            window.erpApp.closeTxModal();
            window.erpApp.showToast(isEdit ? `Đã cập nhật giao dịch ${id}` : 'Thêm giao dịch mới thành công');
            
            if (document.getElementById('cashFlowChart')) {renderThuChiOverview();}
            else {renderThuChiTransactions();}
        };
    }

    function viewTransactionDetail(id) {
        const consolidatedTx = getConsolidatedTransactions();
        const tx = consolidatedTx.find(t => t.id === id);
        if (!tx) {return;}

        const isIncome = tx.type === 'thu';
        const modalHtml = `
            <div id="txDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:9001; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);">
                <div class="modal-content" style="width:550px; border-radius:32px; background:#fff; overflow:hidden; box-shadow:0 30px 60px -12px rgba(0,0,0,0.25);">
                    <div style="padding:32px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <div style="width:48px; height:48px; background:${isIncome ? '#ecfdf5' : '#fef2f2'}; color:${isIncome ? '#10b981' : '#ef4444'}; border-radius:14px; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">${isIncome ? 'arrow_downward' : 'arrow_upward'}</span>
                            </div>
                            <div>
                                <h3 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Chi tiết giao dịch</h3>
                                <div style="font-size:12px; font-weight:800; color:#94a3b8;">MÃ SỐ: ${tx.id}</div>
                            </div>
                        </div>
                        <button onclick="document.getElementById('txDetailModal').remove()" style="background:#f1f5f9; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; color:#64748b;"><span class="material-icons-outlined" style="font-size:18px">close</span></button>
                    </div>
                    <div style="padding:32px;">
                        <div style="text-align:center; margin-bottom:32px;">
                            <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số tiền thanh toán</div>
                            <div style="font-size:36px; font-weight:900; color:${isIncome ? '#10b981' : '#ef4444'};">${isIncome ? '+' : '-'}${window.erpApp.formatValue(tx.amount)} đ</div>
                        </div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Thời gian</label>
                                <div style="font-size:14px; font-weight:700; color:#1e293b;">${window.erpApp.formatDate(tx.date)}</div>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Phương thức</label>
                                <div style="font-size:14px; font-weight:700; color:#1e293b;">${accounts.find(a => a.id === tx.accountId)?.name || 'Chuyển khoản'}</div>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đối tác</label>
                                <div style="font-size:14px; font-weight:700; color:#1e293b;">${tx.partner || '—'}</div>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạng mục</label>
                                <div style="font-size:14px; font-weight:700; color:#1e293b;">${[...incomeCategories, ...expenseCategories].find(c => c.id === tx.category)?.name || 'Nội bộ'}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top:24px; padding:20px; background:#f8fafc; border-radius:20px; border:1px solid #f1f5f9;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ghi chú nội bộ</label>
                            <div style="font-size:13px; font-weight:600; color:#475569; line-height:1.6;">${tx.note || 'Không có ghi chú nào.'}</div>
                        </div>
                        
                        ${tx.fileUrl ? `
                        <div style="margin-top:16px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chứng từ đính kèm</label>
                            <a href="${tx.fileUrl}" target="_blank" style="display:flex; align-items:center; gap:10px; padding:12px 16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:16px; text-decoration:none; color:#0369a1; transition:all 0.2s;" onmouseover="this.style.background='#e0f2fe'" onmouseout="this.style.background='#f0f9ff'">
                                <span class="material-icons-outlined" style="font-size:20px;">link</span>
                                <div style="flex:1; font-size:13px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Xem chứng từ gốc</div>
                                <span class="material-icons-outlined" style="font-size:16px;">open_in_new</span>
                            </a>
                        </div>
                        ` : ''}
                        
                        <div style="margin-top:24px; padding:20px; background:#f0fdf4; border-radius:20px; display:flex; align-items:center; gap:12px;">
                            <span class="material-icons-outlined" style="color:#10b981">verified</span>
                            <div style="font-size:13px; font-weight:700; color:#16a34a;">Giao dịch đã được xác thực hệ thống</div>
                        </div>
                    </div>
                    <div style="padding:24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button onclick="window.erpApp.printTransactionReceipt('${tx.id}')" style="padding:10px 20px; border:1px solid #e2e8f0; background:#fff; color:#3b82f6; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                            <span class="material-icons-outlined" style="font-size:18px;">print</span> In phiếu
                        </button>
                        <button onclick="document.getElementById('txDetailModal').remove()" style="padding:10px 24px; border:none; background:#1e293b; color:#fff; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer;">Đóng lại</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    function printTransactionReceipt(id) {
        const consolidatedTx = getConsolidatedTransactions();
        const tx = consolidatedTx.find(t => t.id === id);
        if (!tx) {
            window.erpApp.showToast('Không tìm thấy dữ liệu để in.', 'error');
            return;
        }

        const isIncome = tx.type === 'thu';
        const accountName = accounts.find(a => a.id === tx.accountId)?.name || 'Chuyển khoản';
        const categoryName = [...incomeCategories, ...expenseCategories].find(c => c.id === tx.category)?.name || 'Nội bộ';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Phiếu ${isIncome ? 'Thu' : 'Chi'} - ${tx.id}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                    .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1e293b; padding-bottom: 20px; }
                    .company-info { flex: 1; }
                    .company-name { font-size: 20px; font-weight: 900; color: #1e293b; text-transform: uppercase; }
                    .receipt-info { text-align: right; }
                    .title { text-align: center; font-size: 28px; font-weight: 900; margin: 30px 0; text-transform: uppercase; letter-spacing: 2px; }
                    .grid { display: grid; grid-template-columns: 180px 1fr; gap: 16px; margin-bottom: 30px; }
                    .label { font-weight: 700; color: #64748b; font-size: 13px; text-transform: uppercase; }
                    .value { font-weight: 800; color: #1e293b; border-bottom: 1px dotted #cbd5e1; }
                    .amount-box { margin: 40px 0; padding: 24px; background: #f8fafc; border: 2px solid #1e293b; border-radius: 12px; text-align: center; }
                    .amount-label { font-size: 14px; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
                    .amount-value { font-size: 32px; font-weight: 900; color: #1e293b; }
                    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 60px; text-align: center; }
                    .sig-box { display: flex; flex-direction: column; height: 150px; }
                    .sig-title { font-weight: 900; color: #1e293b; margin-bottom: 8px; }
                    .sig-note { font-size: 11px; font-weight: 600; color: #94a3b8; font-style: italic; }
                    @media print {
                        body { padding: 0; }
                        .container { border: none; max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="company-info">
                            <div class="company-name">CÔNG TY CỔ PHẦN VIETBACHCORP</div>
                            <div style="font-size: 12px; font-weight: 600; color: #64748b;">Mã số thuế: 3301721525</div>
                            <div style="font-size: 12px; font-weight: 600; color: #64748b;">Địa chỉ: 112 Nguyễn Khoa Chiêm, Huế</div>
                        </div>
                        <div class="receipt-info">
                            <div style="font-weight: 900; color: #1e293b;">MÃ PHIẾU: ${tx.id}</div>
                            <div style="font-size: 13px; font-weight: 700; color: #64748b;">Ngày: ${window.erpApp.formatDate(tx.date)}</div>
                        </div>
                    </div>

                    <div class="title">PHIẾU ${isIncome ? 'THU' : 'CHI'} TIỀN MẶT</div>

                    <div class="grid">
                        <div class="label">Người ${isIncome ? 'nộp' : 'nhận'} tiền:</div>
                        <div class="value">${tx.partner || '—'}</div>

                        <div class="label">Lý do ${isIncome ? 'thu' : 'chi'}:</div>
                        <div class="value">${tx.note || '—'}</div>

                        <div class="label">Hạng mục tài chính:</div>
                        <div class="value">${categoryName}</div>

                        <div class="label">Tài khoản thanh toán:</div>
                        <div class="value">${accountName}</div>
                    </div>

                    <div class="amount-box">
                        <div class="amount-label">Số tiền thực ${isIncome ? 'thu' : 'chi'}</div>
                        <div class="amount-value">${window.erpApp.formatValue(tx.amount)} VNĐ</div>
                    </div>

                    <div style="font-style: italic; font-size: 14px; margin-bottom: 40px; border-bottom: 1px dotted #cbd5e1; padding-bottom: 8px;">
                        <strong>Bằng chữ:</strong> ............................................................................................................................................................
                    </div>

                    <div class="signatures">
                        <div class="sig-box">
                            <div class="sig-title">Người lập biểu</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-title">Thủ quỹ</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-title">Người ${isIncome ? 'nộp' : 'nhận'}</div>
                            <div class="sig-note">(Ký, họ tên)</div>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function deleteTransaction(id, source = 'manual') {
        if (source && source !== 'manual') {
            window.erpApp.showDeleteConfirmation(
                'Giao dịch này được đồng bộ từ module khác. Bạn có chắc muốn xóa <strong>Dữ liệu gốc</strong>? Hành động này sẽ ảnh hưởng đến module nguồn.',
                async function() {
                    if (source === 'pm-contract' && typeof window.erpApp.pmDeletePaymentMilestone === 'function') {
                        await window.erpApp.pmDeletePaymentMilestone(id);
                        window.erpApp.showToast('Đã xóa dữ liệu gốc thành công', 'success');
                        renderThuChiTransactions();
                    } else if (source === 'pm-material' && typeof window.erpApp.pmDeleteMaterialContract === 'function') {
                        const mcIdx = (window.pmMaterialContracts || []).findIndex(mc => mc.id === id);
                        if (mcIdx > -1) {
                            window.pmMaterialContracts.splice(mcIdx, 1);
                            localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(window.pmMaterialContracts));
                            if (window.CrudSync) await window.CrudSync.deleteItem('pmMaterialContracts', id, 'id');
                            window.erpApp.showToast('Đã xóa hợp đồng vật tư gốc', 'success');
                            renderThuChiTransactions();
                        } else {
                            window.erpApp.showToast('Không tìm thấy hợp đồng vật tư gốc.', 'error');
                        }
                    } else {
                        window.erpApp.showToast('Không thể xóa dữ liệu gốc từ đây. Vui lòng vào module nguồn.', 'warning');
                    }
                }
            );
            return;
        }
        const tx = transactions.find(t => t.id === id);
        if (!tx) {return;}

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa giao dịch <strong>${tx.id}</strong>? Số dư tài khoản sẽ được hoàn lại tương ứng.`,
            function() {
                // Revert account balances
                const amt = tx.amount;
                if (tx.type === 'thu') {
                    const accIdx = accounts.findIndex(a => a.id === tx.accountId);
                    if (accIdx > -1) {accounts[accIdx].balance -= amt;}
                } else if (tx.type === 'chi') {
                    const accIdx = accounts.findIndex(a => a.id === tx.accountId);
                    if (accIdx > -1) {accounts[accIdx].balance += amt;}
                } else if (tx.type === 'chuyen_khoan') {
                    const fromIdx = accounts.findIndex(a => a.id === tx.accountId);
                    const toIdx = accounts.findIndex(a => a.id === tx.toAccountId);
                    if (fromIdx > -1) {accounts[fromIdx].balance += amt;}
                    if (toIdx > -1) {accounts[toIdx].balance -= amt;}
                }

                transactions = transactions.filter(t => t.id !== id);
                saveDataThuChi();
                
                if (window.CrudSync) {
                    window.CrudSync.saveItems('erp_tc_transactions', transactions, 'id');
                    window.CrudSync.saveItems('erp_tc_accounts', accounts, 'id');
                }
                
                window.erpApp.showToast('Đã xóa giao dịch thành công', 'success');

                // Audit Log
                window.erpApp.notifyCRUD('Tài chính', 'delete', {
                    name: tx.id,
                    page: 'tai-chinh',
                    module: 'Giao dịch'
                });

                renderThuChiTransactions();
            }
        );
    }

    // ==========================================
    // ACCOUNT CRUD & DETAIL
    // ==========================================
    function openAccountModal(id = null) {
        if (!isUserAdmin()) {
            window.erpApp.showToast('Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Admin.', 'error');
            return;
        }
        const acc = id ? accounts.find(a => a.id === id) : null;
        const title = id ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới';

        const modalHtml = `
            <div id="accModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:9999; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);">
                <div class="modal-content" style="width:450px; border-radius:24px; background:#fff; overflow:hidden; animation:modalPop 0.3s ease-out;">
                    <div style="background:#1e293b; padding:24px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined">account_balance</span> ${title}
                        </h2>
                        <button onclick="document.getElementById('accModal').remove()" style="background:none; border:none; cursor:pointer; color:#fff; opacity:0.8;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="accForm" style="padding:24px; display:grid; gap:16px;">
                        <input type="hidden" name="id" value="${id || ''}">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên tài khoản / Ngân hàng <span style="color:red">*</span></label>
                            <input type="text" name="name" class="form-control" value="${acc ? acc.name : ''}" placeholder="Ví dụ: Vietcombank - CN Huế" required>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Loại tài khoản</label>
                            <select name="type" class="form-control">
                                <option value="bank" ${acc && acc.type === 'bank' ? 'selected' : ''}>Ngân hàng</option>
                                <option value="cash" ${acc && acc.type === 'cash' ? 'selected' : ''}>Tiền mặt</option>
                                <option value="wallet" ${acc && acc.type === 'wallet' ? 'selected' : ''}>Ví điện tử</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số dư ban đầu (VNĐ)</label>
                            <input type="text" name="balance" class="form-control" value="${acc ? window.erpApp.formatValue(acc.balance) : 0}" oninput="window.erpApp.formatNumberInput(this)" ${id ? 'readonly' : ''} style="font-weight:700;">
                            ${id ? '<div style="font-size:11px; color:#94a3b8; margin-top:4px;">* Số dư hiện tại được quản lý qua giao dịch.</div>' : ''}
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
                            <button type="button" onclick="document.getElementById('accModal').remove()" style="padding:10px 20px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:10px; font-weight:700; cursor:pointer;">Hủy</button>
                            <button type="submit" style="padding:10px 32px; background:#1e293b; color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer;">Lưu thông tin</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('accForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            if (!id) {
                const newAcc = {
                    id: 'ACC-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    name: data.name,
                    type: data.type,
                    balance: window.erpApp.parseVND(data.balance) || 0,
                    icon: getBankInfo(data.name).icon,
                    color: getBankInfo(data.name).color
                };
                accounts.push(newAcc);
                if (window.CrudSync) {window.CrudSync.saveItem('erp_tc_accounts', newAcc, 'id');}
            } else {
                const idx = accounts.findIndex(a => a.id === id);
                if (idx > -1) {
                    accounts[idx].name = data.name;
                    if (window.CrudSync) {window.CrudSync.saveItem('erp_tc_accounts', accounts[idx], 'id');}
                }
            }
            saveDataThuChi();
            
            // Gửi thông báo hệ thống
            if (window.erpApp && window.erpApp.addNotification) {
                window.erpApp.addNotification(
                    `Đã ${id ? 'cập nhật' : 'thêm'} tài khoản: ${data.name}`,
                    'account_balance',
                    id ? 'indigo' : 'green',
                    'tai-chinh'
                );
            }

            document.getElementById('accModal').remove();
            window.erpApp.showToast(id ? 'Cập nhật tài khoản thành công' : 'Thêm tài khoản mới thành công');
            renderThuChiAccounts();
        };
    }

    function deleteAccount(id) {
        if (!isUserAdmin()) {
            window.erpApp.showToast('Bạn không có quyền thực hiện thao tác này.', 'error');
            return;
        }
        const acc = accounts.find(a => a.id === id);
        if (!acc) {return;}
        
        // Check for transactions
        const hasTx = transactions.some(tx => tx.accountId === id || tx.fromAccountId === id || tx.toAccountId === id);
        if (hasTx) {
            window.erpApp.showToast('Không thể xóa tài khoản đã có lịch sử giao dịch. Vui lòng đổi tên thay thế.', 'error');
            return;
        }

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa tài khoản <strong>${acc.name}</strong>? Thao tác này không thể hoàn tác.`,
            function() {
                accounts = accounts.filter(a => a.id !== id);
                saveDataThuChi();
                if (window.CrudSync) {window.CrudSync.deleteItem('erp_tc_accounts', id);}
                
                window.erpApp.showToast('Đã xóa tài khoản thành công', 'success');

                // Audit Log
                window.erpApp.notifyCRUD('Tài chính', 'delete', {
                    name: acc.name,
                    page: 'tai-chinh',
                    module: 'Tài khoản'
                });

                renderThuChiAccounts();
            }
        );
    }

    function viewAccountDetail(id) {
        const acc = accounts.find(a => a.id === id);
        if (!acc) {return;}
        
        const txs = transactions.filter(t => t.accountId === id || t.fromAccountId === id || t.toAccountId === id).reverse().slice(0, 10);
        const bankInfo = getBankInfo(acc.name);

        const modalHtml = `
            <div id="accDetailModal" class="modal-overlay" style="display:flex; justify-content:center; align-items:center; z-index:9011; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);">
                <div class="modal-content" style="width:650px; border-radius:32px; background:#fff; overflow:hidden; box-shadow:0 30px 60px -15px rgba(0,0,0,0.3); animation:modalPop 0.3s ease-out;">
                    <div style="background: linear-gradient(135deg, var(--icon-${bankInfo.color}) 0%, #1e293b 100%); padding:40px; color:#fff; position:relative; overflow:hidden;">
                        <div style="position:absolute; right: -20px; bottom: -20px; font-size:150px; font-weight:900; opacity:0.1;">${bankInfo.brand}</div>
                        <div style="position:relative; z-index:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <div style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Số tài khoản / Mã định danh: ${acc.id}</div>
                                    <h2 style="margin:0; font-size:28px; font-weight:900;">${acc.name}</h2>
                                </div>
                                <button onclick="document.getElementById('accDetailModal').remove()" style="background:rgba(255,255,255,0.2); border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; color:#fff;"><span class="material-icons-outlined">close</span></button>
                            </div>
                            <div style="margin-top:40px;">
                                <div style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.7); text-transform:uppercase;">Số dư hiện tại</div>
                                <div style="font-size:36px; font-weight:950; margin-top:8px;">${window.erpApp.formatValue(acc.balance)} <span style="font-size:18px; font-weight:600; opacity:0.8;">VNĐ</span></div>
                            </div>
                        </div>
                    </div>
                    <div style="padding:32px;">
                        <h4 style="margin:0 0 20px 0; font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; display:flex; align-items:center; gap:8px;">
                            <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">history</span> Giao dịch gần nhất
                        </h4>
                        ${txs.length === 0 ? `
                            <div style="padding:40px; text-align:center; color:#94a3b8; font-style:italic; font-size:13px; border:1px dashed #e2e8f0; border-radius:20px;">
                                Chưa có giao dịch nào phát sinh trên tài khoản này.
                            </div>
                        ` : `
                            <div style="display:grid; gap:12px;">
                                ${txs.map(tx => {
                                    const isIncome = tx.type === 'thu' || (tx.type === 'chuyen_khoan' && tx.toAccountId === id);
                                    const color = isIncome ? '#10b981' : '#ef4444';
                                    return `
                                        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#f8fafc; border-radius:16px; border:1px solid #f1f5f9;">
                                            <div>
                                                <div style="font-size:13px; font-weight:700; color:#1e293b;">${tx.note}</div>
                                                <div style="font-size:11px; color:#94a3b8; font-weight:600; margin-top:2px;">${tx.date} • ${tx.partner || 'N/A'}</div>
                                            </div>
                                            <div style="font-size:14px; font-weight:800; color:${color};">
                                                ${isIncome ? '+' : '-'}${window.erpApp.formatValue(tx.amount)}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                        <div style="margin-top:24px;">
                            <button onclick="document.getElementById('accDetailModal').remove(); window.erpApp.renderThuChiTransactions()" style="width:100%; padding:14px; background:#f1f5f9; border:none; border-radius:16px; color:#475569; font-weight:800; font-size:13px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Xem tất cả giao dịch hệ thống</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Export functions
    window.erpApp.isUserAdmin = isUserAdmin;
    window.erpApp.renderThuChiOverview = renderThuChiOverview;
    window.erpApp.changeOverviewPeriod = changeOverviewPeriod;
    window.erpApp.renderThuChiTransactions = renderThuChiTransactions;
    window.erpApp.renderThuChiAccounts = renderThuChiAccounts;
    window.erpApp.renderThuChiDebts = renderThuChiDebts;
    window.erpApp.openTransactionModal = openTransactionModal;
    window.erpApp.openAddTransactionModal = (type) => openTransactionModal(type);
    window.erpApp.viewTransactionDetail = viewTransactionDetail;
    window.erpApp.printTransactionReceipt = printTransactionReceipt;
    window.erpApp.deleteTransaction = deleteTransaction;
    window.erpApp.closeTxModal = () => { const m = document.getElementById('txModal'); if(m) {m.remove();} };
    window.erpApp.openAccountModal = openAccountModal;
    window.erpApp.deleteAccount = deleteAccount;
    window.erpApp.viewAccountDetail = viewAccountDetail;

    // Expose data for sync
    window.erpApp.thuChiData = {
        get transactions() { return transactions; },
        set transactions(val) { 
            console.log(`[Sync] Received ${val ? val.length : 0} transactions from Cloud`);
            transactions = val || []; 
            if (typeof renderThuChiTransactions === 'function' && document.getElementById('pageContent') && document.getElementById('pageContent').querySelector('.thu-chi-module')) {
                console.log('[Sync] Refreshing Thu Chi UI...');
                if (document.getElementById('cashFlowChart')) {renderThuChiOverview();}
                else {renderThuChiTransactions();}
            }
        },
        get accounts() { return accounts; },
        set accounts(val) { accounts = val; },
        get debtPartners() { return debtPartners; },
        set debtPartners(val) { debtPartners = val; },
        get incomeCategories() { return incomeCategories; },
        get expenseCategories() { return expenseCategories; }
    };

    // Helper to force a full cloud scrub (ensure Firebase matches local exactly)
    window.erpApp.syncThuChiToCloud = async function() {
        if (!window.CrudSync) {return;}
        window.erpApp.showToast('Đang rà soát & đồng bộ với Cloud...');
        await window.CrudSync.saveItems('erp_tc_transactions', transactions, 'id');
        await window.CrudSync.saveItems('erp_tc_accounts', accounts, 'id');
        await window.CrudSync.saveItems('erp_debt_partners', debtPartners, 'id');
        window.erpApp.showToast('Đồng bộ hoàn tất', 'success');
    };

    // Update breadcrumb helper since it's frequently used
    window.erpApp.updateBreadcrumb = (current, badge) => {
        const b = document.getElementById('breadcrumbCurrent');
        const bg = document.getElementById('pageBadge');
        if (b) {b.textContent = current;}
        if (bg) {bg.textContent = badge;}
    };

    window.erpApp.filterTransactionTable = function () {
        const query = (document.getElementById('txSearchInp')?.value || '').toLowerCase();
        const type = document.getElementById('txTypeFilter')?.value || 'all';
        const rows = document.querySelectorAll('#txTable tbody tr');
        let count = 0;

        rows.forEach(row => {
            const cells = row.cells;
            if (!cells || cells.length < 6) return;
            
            const id = cells[1].querySelector('div:first-child')?.textContent.toLowerCase() || '';
            const partner = cells[1].querySelector('div:last-child')?.textContent.toLowerCase() || '';
            const note = cells[2].querySelector('div:last-child')?.textContent.toLowerCase() || '';
            const amountText = cells[4].textContent || '';

            let rowType = 'chi';
            if (amountText.includes('+')) rowType = 'thu';
            else if (!amountText.includes('+') && !amountText.includes('-')) rowType = 'chuyen_khoan';

            const matchesQuery = partner.includes(query) || note.includes(query) || id.includes(query);
            const matchesType = type === 'all' || rowType === type;

            if (matchesQuery && matchesType) {
                row.style.display = '';
                count++;
            } else {
                row.style.display = 'none';
            }
        });

        const label = document.getElementById('txCountLabel');
        if (label) label.textContent = count;
    };

})();
