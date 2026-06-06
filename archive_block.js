    let hsCategories = [
        { id: 'hop-dong', label: 'Há»£p Ä‘á»“ng', icon: 'description', color: '#2563EB', bg: '#EFF6FF' },
        { id: 'phu-luc', label: 'Phá»¥ lá»¥c HÄ', icon: 'post_add', color: '#7C3AED', bg: '#F5F3FF' },
        { id: 'quyet-toan', label: 'Quyáº¿t toÃ¡n', icon: 'receipt_long', color: '#0D9488', bg: '#F0FDFA' },
        { id: 'thanh-ly', label: 'Thanh lÃ½ HÄ', icon: 'assignment_turned_in', color: '#EA580C', bg: '#FFF7ED' },
        { id: 'bao-cao', label: 'BÃ¡o cÃ¡o', icon: 'bar_chart', color: '#16A34A', bg: '#F0FDF4' },
        { id: 'bien-ban', label: 'BiÃªn báº£n', icon: 'gavel', color: '#DC2626', bg: '#FEF2F2' },
        { id: 'cong-van-den', label: 'CÃ´ng vÄƒn Ä‘áº¿n', icon: 'mail', color: '#3B82F6', bg: '#E0F2FE' },
        { id: 'cong-van-di', label: 'CÃ´ng vÄƒn Ä‘i', icon: 'send', color: '#10B981', bg: '#DCFCE7' },
    ];

    // ---- Dá»± Ã¡n ----
    let hsProjects = [];

    // ==========================================
    // MODULE: QUáº¢N LÃ Dá»° ÃN (PROJECT MANAGEMENT)
    // ==========================================
    let pmActiveProjectId = ''; // Sáº½ tá»± Ä‘á»™ng chá»n dá»± Ã¡n Ä‘áº§u tiÃªn náº¿u cÃ³
    window.erpApp.pmActiveProjectId = pmActiveProjectId;
    let pmActiveTab = 'dashboard';
    window.erpApp.pmActiveTab = pmActiveTab;
    let pmLaborView = 'dashboard'; // 'dashboard' | 'logs' | 'workers' | 'attendance'
    let pmAttendanceMode = 'month'; // 'month' | 'week'
    let pmAttendanceMonth = new Date().getMonth() + 1;
    let pmAttendanceYear = new Date().getFullYear();
    let pmAttendanceWeek = 0;

    
    // Default to current month for date range filters
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    let pmDailyLogFromDate = firstDay.toISOString().split('T')[0];
    let pmDailyLogToDate = lastDay.toISOString().split('T')[0];

    let pmDailyLogMonth = new Date().getMonth() + 1;
    let pmDailyLogYear = new Date().getFullYear();
    let pmDailyLogWeek = 0;

    // Sync to window.erpApp for attribute-based event handlers
    if (window.erpApp) {
        window.erpApp.pmAttendanceMonth = pmAttendanceMonth;
        window.erpApp.pmAttendanceYear = pmAttendanceYear;
        window.erpApp.pmAttendanceWeek = pmAttendanceWeek;
        window.erpApp.pmDailyLogFromDate = pmDailyLogFromDate;
        window.erpApp.pmDailyLogToDate = pmDailyLogToDate;
        window.erpApp.pmDailyLogMonth = pmDailyLogMonth;
        window.erpApp.pmDailyLogYear = pmDailyLogYear;
        window.erpApp.pmDailyLogWeek = pmDailyLogWeek;
    }



    // Gantt Chart State
    let pmGanttZoom = 'month'; // 'day' | 'month' | 'year'
    let pmGanttFilterStart = '';
    let pmGanttFilterEnd = '';
    let pmGanttExpandedTasks = new Set(['WBS-01', 'WBS-02']); // IDs of expanded parents

    // Gantt Date Utilities
    const ganttUtils = {
        parse: (d) => new Date(d),
        format: (d) => d.toISOString().split('T')[0],
        formatVie: (d) => {
            const date = new Date(d);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        },
        diffDays: (start, end) => Math.ceil((new Date(end) - new Date(start)) / (86400000)) + 1,
        addDays: (d, days) => {
            const res = new Date(d);
            res.setDate(res.getDate() + days);
            return res;
        },
        getProjectRange: (tasks) => {
            if (!tasks.length) { return { min: new Date(), max: new Date() }; }
            const starts = tasks.map(t => new Date(t.startDate).getTime());
            const ends = tasks.map(t => new Date(t.endDate).getTime());
            return {
                min: new Date(Math.min(...starts)),
                max: new Date(Math.max(...ends))
            };
        }
    };

    // ---- Dá»¯ liá»‡u há»“ sÆ¡ ----


    // =====================================================================
    // CROSS-MODULE SYNC: Quáº£n lÃ½ dá»± Ã¡n <=> LÆ°u trá»¯ há»“ sÆ¡
    // Äá»“ng bá»™ há»£p Ä‘á»“ng 2 chiá»u: khi sá»­a á»Ÿ má»™t module, module kia tá»± cáº­p nháº­t
    // =====================================================================
    function syncContractWithArchive(pmContract) {
        // PM â†’ Archive: khi sá»­a há»£p Ä‘á»“ng trong Quáº£n lÃ½ dá»± Ã¡n
        if (!pmContract.linkedHsId) { return; }
        const hsIdx = hoSoDocuments.findIndex(d => d.id === pmContract.linkedHsId);
        if (hsIdx === -1) { return; }
        const hsDoc = hoSoDocuments[hsIdx];
        // XÃ¡c Ä‘á»‹nh supplier/customer dá»±a vÃ o loáº¡i há»£p Ä‘á»“ng
        const isOutbound = pmContract.type === 'outbound';
        Object.assign(hsDoc, {
            title: pmContract.title,
            value: pmContract.value,
            customer: isOutbound ? pmContract.partner : (hsDoc.customer || 'VIETBACHCORP'),
            supplier: isOutbound ? (hsDoc.supplier || 'VIETBACHCORP') : pmContract.partner,
            issueDate: pmContract.signDate || hsDoc.issueDate,
            transDate: pmContract.acceptanceDate || hsDoc.transDate,
            warrantyPeriod: pmContract.warrantyPeriod ?? hsDoc.warrantyPeriod
        });
        if (window.CrudSync) { window.CrudSync.saveItem('hoSoDocuments', hsDoc, 'id'); }
        console.log(`[Sync PMâ†’Archive] ÄÃ£ Ä‘á»“ng bá»™ HÄ ${pmContract.id} â†’ Há»“ sÆ¡ ${pmContract.linkedHsId}`);
        // ðŸ”„ Náº¿u module LÆ°u trá»¯ Ä‘ang hiá»ƒn thá»‹, refresh ngay (kiá»ƒm tra qua breadcrumb)
        if (typeof renderLuuTruHoSo === 'function' && breadcrumbCurrent && breadcrumbCurrent.textContent === 'LÆ°u trá»¯ há»“ sÆ¡') {
            renderLuuTruHoSo();
        }
    }

    function syncArchiveWithContract(hsDoc) {
        // Archive â†’ PM: khi sá»­a/thÃªm há»“ sÆ¡ trong LÆ°u trá»¯
        if (!hsDoc.project || hsDoc.project === 'Tá»•ng cÃ´ng ty' || hsDoc.project === 'VÄƒn phÃ²ng HQ') { return; }

        // TÃ¬m dá»± Ã¡n trong Quáº£n lÃ½ dá»± Ã¡n
        const project = pmProjects.find(p => p.name === hsDoc.project || p.id === hsDoc.project);
        if (!project) { return; }

        let pmContract;
        if (hsDoc.linkedPmId) {
            pmContract = pmContracts.find(c => c.id === hsDoc.linkedPmId);
        }

        // ðŸ†• Náº¿u chÆ°a liÃªn káº¿t nhÆ°ng lÃ  loáº¡i Há»£p Ä‘á»“ng, táº¡o má»›i HÄ trong Quáº£n lÃ½ dá»± Ã¡n
        if (!pmContract && hsDoc.category === 'hop-dong') {
            // XÃ¡c Ä‘á»‹nh loáº¡i HÄ: Náº¿u VIETBACHCORP lÃ  khÃ¡ch hÃ ng (tá»« NCC) => inbound, ngÆ°á»£c láº¡i outbound
            const supplierStr = (hsDoc.supplier || '').toUpperCase();
            const isOutbound = supplierStr.includes('VIETBACHCORP') || supplierStr.includes('CÃ”NG TY VIá»†T BÃCH');

            pmContract = {
                id: 'HÄ-' + hsDoc.id,
                projectId: project.id,
                title: hsDoc.title,
                contractNo: hsDoc.symbol || hsDoc.id,
                signDate: hsDoc.issueDate,
                value: hsDoc.value,
                partner: isOutbound ? hsDoc.customer : hsDoc.supplier,
                type: isOutbound ? 'outbound' : 'inbound',
                status: 'dang-thi-cong',
                executionTime: 365,
                paid: 0,
                acceptanceDate: hsDoc.transDate,
                linkedHsId: hsDoc.id
            };
            pmContracts.push(pmContract);
            hsDoc.linkedPmId = pmContract.id;

            if (window.CrudSync) { window.CrudSync.saveItem('pmContracts', pmContract, 'id'); }
            if (window.CrudSync) { window.CrudSync.saveItem('hoSoDocuments', hsDoc, 'id'); }
            console.log(`[Sync Archiveâ†’PM] ÄÃ£ Táº O Má»šI HÄ ${pmContract.id} cho Há»“ sÆ¡ ${hsDoc.id}`);
        } else if (pmContract) {
            // Cáº­p nháº­t HÄ hiá»‡n cÃ³
            const isOutbound = pmContract.type === 'outbound';
            Object.assign(pmContract, {
                title: hsDoc.title,
                value: hsDoc.value,
                partner: isOutbound ? hsDoc.customer : hsDoc.supplier,
                signDate: hsDoc.issueDate || pmContract.signDate,
                acceptanceDate: hsDoc.transDate || pmContract.acceptanceDate,
                warrantyPeriod: hsDoc.warrantyPeriod ?? pmContract.warrantyPeriod
            });
            if (window.CrudSync) { window.CrudSync.saveItem('pmContracts', pmContract, 'id'); }
        }

        // 🔄 Refresh UI nếu đang ở tab Quản lý dự án
        if (pmContract && typeof renderQuanLyDuAn === 'function' && typeof breadcrumbCurrent !== 'undefined' && breadcrumbCurrent && breadcrumbCurrent.textContent === 'Quản lý dự án') {
            renderQuanLyDuAn();
        }
    }
    window.erpApp.syncArchiveWithContract = syncArchiveWithContract;

    function nextHsIdForContract(contractId, projectName) {
        // Tá»± Ä‘á»™ng sinh HS ID khi thÃªm há»£p Ä‘á»“ng má»›i tá»« PM
        const ids = hoSoDocuments.map(d => {
            const idStr = String(d.id || '');
            return parseInt(idStr.replace(/\D/g, ''), 10);
        }).filter(n => !isNaN(n));
        return 'HS-' + String(Math.max(...ids, 0) + 1).padStart(3, '0');
    }
    // =====================================================================

    let hsSearchQuery = '';
    let hsCurrentPage = 1;
    let hsActiveTab = 'all';
    let hsFilterProject = '';
    let hsFilterDept = '';
    let hsFilterSupplier = '';
    let hsFilterYear = '';

    const hsPageSize = 10;
    let tempHsFiles = [];
    let hsExpandedProjects = new Set();


    function getHsCatById(id) { return hsCategories.find(c => c.id === id) || { label: id, icon: 'folder', color: '#64748B', bg: '#F1F5F9' }; }
    function getHsStatusLabel(s) { return { active: 'Đang hiệu lực', completed: 'Hoàn thành', pending: 'Chờ xử lý', expired: 'Hết hạn', cancelled: 'Đã hủy', 'da-hoan-thien': 'Đã hoàn thiện' }[s] || s; }
    function getHsStatusColor(s) { return { active: 'green', completed: 'blue', pending: 'orange', expired: 'red', cancelled: 'gray', 'da-hoan-thien': 'teal' }[s] || 'gray'; }
    function fmtCurrency(v) { if (!v) { return 'â€”'; } if (v >= 1e9) { return (v / 1e9).toFixed(1).replace('.0', '') + ' tá»·'; } if (v >= 1e6) { return Math.round(v / 1e6) + ' triá»‡u'; } return window.erpApp.formatValue(v) + ' Ä‘'; }
    function fmtCurrencyFull(v) { if (!v) { return 'â€”'; } return window.erpApp.formatValue(v) + ' VNÄ'; }
    function formatDate(d) {
        if (!d || d === 'â€”' || d === '-') { return 'â€”'; }
        const date = new Date(d);
        if (isNaN(date.getTime())) { return d; }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function parseInputDate(dStr) {
        if (!dStr) { return ''; }
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        }
        return dStr; // Assume it's already YYYY-MM-DD or other valid format
    }

    function nextHsId() { const ids = hoSoDocuments.map(d => parseInt(d.id.replace(/\D/g, ''), 10)); return 'HS-' + String(Math.max(...ids, 0) + 1).padStart(3, '0'); }
    function getHsFileIcon(type) { return { pdf: 'picture_as_pdf', doc: 'description', xls: 'table_chart', img: 'image', zip: 'folder_zip', link: 'link' }[type] || 'insert_drive_file'; }
    function getHsFileColor(type) { return { pdf: '#DC2626', doc: '#2563EB', xls: '#16A34A', img: '#7C3AED', zip: '#EA580C', link: '#0D9488' }[type] || '#64748B'; }
    window.erpApp.formatDate = formatDate;
    window.erpApp.parseInputDate = parseInputDate;
    window.erpApp.fmtCurrencyFull = fmtCurrencyFull;
    function getHsFileTypeLabel(type) { return { pdf: 'PDF', doc: 'Word', xls: 'Excel', img: 'áº¢nh', zip: 'ZIP', link: 'Link' }[type] || 'File'; }
    function getHsFileTypeFromName(name) {
        const ext = (name || '').split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) { return 'pdf'; }
        if (['doc', 'docx'].includes(ext)) { return 'doc'; }
        if (['xls', 'xlsx', 'csv'].includes(ext)) { return 'xls'; }
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) { return 'img'; }
        if (['zip', 'rar', '7z'].includes(ext)) { return 'zip'; }
        return 'doc';
    }

    function getFilteredHoSo() {
        let data = [...hoSoDocuments];
        if (hsActiveTab !== 'all') { data = data.filter(d => d.category === hsActiveTab); }
        if (hsFilterProject) { data = data.filter(d => d.project === hsFilterProject); }
        if (hsFilterDept) { data = data.filter(d => (d.department || '').toLowerCase().includes(hsFilterDept.toLowerCase())); }
        if (hsFilterSupplier) { data = data.filter(d => (d.supplier || '').toLowerCase().includes(hsFilterSupplier.toLowerCase())); }
        if (hsFilterYear) {
            data = data.filter(d => {
                if (!d.issueDate) { return false; }
                const year = new Date(d.issueDate).getFullYear().toString();
                return year === hsFilterYear;
            });
        }

        const q = hsSearchQuery.toLowerCase().trim();
        if (q) {
            data = data.filter(d =>
                d.id.toLowerCase().includes(q) ||
                d.title.toLowerCase().includes(q) ||
                (d.supplier || '').toLowerCase().includes(q) ||
                (d.customer || '').toLowerCase().includes(q) ||
                (d.project || '').toLowerCase().includes(q) ||
                (d.department || '').toLowerCase().includes(q) ||
                getHsCatById(d.category).label.toLowerCase().includes(q)
            );
        }
        return data;
    }

    function renderLuuTruHoSo() {
        breadcrumbCurrent.textContent = 'LÆ°u trá»¯ há»“ sÆ¡';
        pageBadge.textContent = 'HÃ nh chÃ­nh';

        const filtered = getFilteredHoSo();
        const totalPages = Math.max(1, Math.ceil(filtered.length / hsPageSize));
        if (hsCurrentPage > totalPages) { hsCurrentPage = totalPages; }
        const pageData = filtered.slice((hsCurrentPage - 1) * hsPageSize, hsCurrentPage * hsPageSize);

        const statsHtml = hsCategories.map(cat => {
            const cnt = hoSoDocuments.filter(d => d.category === cat.id).length;
            const isAct = hsActiveTab === cat.id;
            return `<div class="hs2-stat-card${isAct ? ' hs2-stat-active' : ''}" onclick="window.erpApp.hsSetTab('${cat.id}')" style="border-left:3px solid ${cat.color};background:${isAct ? cat.color + '14' : '#fff'}">
                <div style="display:flex;flex-direction:column;gap:4px">
                    <div class="hs2-stat-num" style="color:${cat.color}">${cnt}</div>
                    <div class="hs2-stat-lbl">${cat.label}</div>
                </div>
            </div>`;
        }).join('');

        const projectNames = [...new Set([...(typeof pmProjects !== 'undefined' ? pmProjects.map(p => p.name) : []), ...hoSoDocuments.map(d => d.project).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'vi'));
        const depts = (typeof departments !== 'undefined' ? departments : []).map(d => d.name);
        const years = [...new Set(hoSoDocuments.map(d => d.issueDate ? new Date(d.issueDate).getFullYear() : null).filter(Boolean))].sort((a, b) => b - a);
        const projOpts = projectNames.map(p => `<option value="${p}" ${hsFilterProject === p ? 'selected' : ''}>${p}</option>`).join('');
        const deptOpts = depts.map(d => `<option value="${d}" ${hsFilterDept === d ? 'selected' : ''}>${d}</option>`).join('');
        const yearOpts = years.map(y => `<option value="${y}" ${hsFilterYear === y.toString() ? 'selected' : ''}>${y}</option>`).join('');


        const groups = {};
        pageData.forEach(doc => {
            const proj = doc.project || 'KhÃ´ng thuá»™c dá»± Ã¡n';
            if (!groups[proj]) { groups[proj] = []; }
            groups[proj].push(doc);
        });

        // Máº·c Ä‘á»‹nh má»Ÿ rá»™ng táº¥t cáº£ náº¿u Set trá»‘ng (trong láº§n Ä‘áº§u load)
        const projectsInPage = Object.keys(groups);
        if (hsExpandedProjects.size === 0 && projectsInPage.length > 0 && !hsSearchQuery && !hsFilterProject) {
            projectsInPage.forEach(p => hsExpandedProjects.add(p));
        }

        const tableBody = pageData.length === 0
            ? `<tr><td colspan="11" style="text-align:center;padding:48px;color:var(--text-muted)">
                <span class="material-icons-outlined" style="font-size:48px;opacity:.3;display:block;margin-bottom:12px">search_off</span>
                KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ nÃ o</td></tr>`
            : Object.entries(groups).map(([projName, docs]) => {
                const isExpanded = hsExpandedProjects.has(projName);
                const parentRow = `
                    <tr class="hs2-project-row" onclick="window.erpApp.toggleHsProject('${projName}')">
                        <td colspan="11">
                            <div class="hs2-project-header">
                                <span class="material-icons-outlined hs2-project-toggle ${isExpanded ? 'expanded' : ''}">expand_more</span>
                                <span class="hs2-project-name">${projName}</span>
                                <span class="hs2-project-count">${docs.length} há»“ sÆ¡</span>
                            </div>
                        </td>
                    </tr>`;

                const childRows = isExpanded ? docs.map(doc => {
                    const cat = getHsCatById(doc.category);
                    const fc = (doc.files || []).length;
                    return `<tr class="hs2-row hs2-child-row">
                        <td style="text-align:center"><span class="hs2-id-badge">${doc.id}</span></td>
                        <td><div class="hs2-title-cell">
                            <span class="hs2-cat-chip" style="background:${cat.bg};color:${cat.color}">${cat.label}</span>
                            <span class="hs2-title-text" title="${doc.title}">${doc.title}</span>
                        </div></td>
                        <td><span class="hs2-project-tag" title="${doc.project || ''}"><span class="material-icons-outlined" style="font-size:13px">work_outline</span>${doc.project || 'â€”'}</span></td>
                        <td style="color:var(--text-secondary);font-size:13px">${doc.projectPublic || 'â€”'}</td>
                        <td style="color:var(--text-secondary);font-size:13px">${doc.symbol || 'â€”'}</td>
                        <td style="color:var(--text-secondary);font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${doc.supplier || ''}">${doc.supplier || 'â€”'}</td>
                        <td style="text-align:right"><span class="hs2-value">${fmtCurrency(doc.value)}</span></td>
                        <td style="font-size:13px;color:var(--text-secondary);text-align:center">${formatDate(doc.issueDate)}</td>
                        <td style="font-size:13px;color:var(--text-secondary);text-align:center">${formatDate(doc.transDate)}</td>
                        <td style="text-align:center"><span class="gm-badge ${getHsStatusColor(doc.status)}">${getHsStatusLabel(doc.status)}</span></td>
                        <td style="text-align:center"><div class="hs2-actions" style="justify-content:center">
                            <button class="hs2-btn hs2-btn-view" title="Xem chi tiáº¿t" onclick="window.erpApp.viewHoSo('${doc.id}')"><span class="material-icons-outlined">visibility</span></button>
                            ${fc > 0 ? `<button class="hs2-btn hs2-btn-preview" title="Xem tÃ i liá»‡u (${fc} file)" onclick="window.erpApp.openHsPreview('${doc.id}')"><span class="material-icons-outlined">preview</span></button>` : ''}
                            ${isAdmin() ? `
                            <button class="hs2-btn hs2-btn-edit" title="Chá»‰nh sá»­a" onclick="window.erpApp.openHsModal('${doc.id}')"><span class="material-icons-outlined">edit</span></button>
                            <button class="hs2-btn hs2-btn-del" title="XÃ³a" onclick="window.erpApp.confirmDeleteHoSo('${doc.id}')"><span class="material-icons-outlined">delete</span></button>
                            ` : ''}
                        </div></td>
                    </tr>`;
                }).join('') : '';

                return parentRow + childRows;
            }).join('');


        let pagHtml = '';
        if (totalPages > 1) {
            pagHtml = `<div class="pagination" style="padding:16px 20px">
                <button class="page-btn" ${hsCurrentPage <= 1 ? 'disabled' : ''} onclick="window.erpApp.hsGoPage(${hsCurrentPage - 1})"><span class="material-icons-outlined">chevron_left</span></button>`;
            for (let i = 1; i <= totalPages; i++) { pagHtml += `<button class="page-btn ${i === hsCurrentPage ? 'active' : ''}" onclick="window.erpApp.hsGoPage(${i})">${i}</button>`; }
            pagHtml += `<button class="page-btn" ${hsCurrentPage >= totalPages ? 'disabled' : ''} onclick="window.erpApp.hsGoPage(${hsCurrentPage + 1})"><span class="material-icons-outlined">chevron_right</span></button>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">Hiá»ƒn thá»‹ ${(hsCurrentPage - 1) * hsPageSize + 1}â€“${Math.min(hsCurrentPage * hsPageSize, filtered.length)} / ${filtered.length}</span>
            </div>`;
        }

        const hasFilter = hsFilterProject || hsFilterDept || hsFilterSupplier || hsFilterYear;

        pageContent.innerHTML = `
        <style>
        .hs2-stats-row{display:flex;gap:10px;padding:0 20px 16px;overflow-x:auto;flex-wrap:wrap}
        .hs2-stat-card{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;border:1px solid var(--border-color);cursor:pointer;transition:all .18s;min-width:130px;flex:1}
        .hs2-stat-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .hs2-stat-active{box-shadow:0 2px 8px rgba(0,0,0,.12)!important}
        .hs2-stat-num{font-size:22px;font-weight:700;line-height:1}
        .hs2-stat-lbl{font-size:11px;color:var(--text-secondary);margin-top:2px}
        .hs2-filter-select{padding:8px 12px;border:1.5px solid var(--border-color);border-radius:8px;font-size:13px;background:#fff;color:var(--text-main);cursor:pointer;outline:none;transition:border .15s;max-width:200px;text-overflow:ellipsis}
        .hs2-filter-select:focus{border-color:var(--primary)}
        .hs2-clear-btn{padding:8px;border:1.5px solid #FCA5A5;border-radius:8px;background:#FEF2F2;color:#DC2626;cursor:pointer;display:flex;align-items:center}
        .hs2-cat-mgr-btn{padding:8px 14px;border:1.5px solid var(--border-color);border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:var(--text-main);cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s}
        .hs2-cat-mgr-btn:hover{border-color:var(--primary);color:var(--primary)}
        .hs2-table{min-width:1000px}
        .hs2-row{cursor:pointer;transition:background .15s}
        .hs2-row:hover{background:#F8FAFF}
        .hs2-id-badge{font-size:12px;font-weight:700;color:var(--primary);background:#EFF6FF;padding:3px 8px;border-radius:5px;white-space:nowrap;display:inline-block}
        .hs2-title-cell{display:flex;flex-direction:column;gap:4px;min-width:0}
        .hs2-cat-chip{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;width:fit-content}
        .hs2-title-text{font-size:13px;font-weight:500;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}
        .hs2-project-tag{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#7C3AED;background:#F5F3FF;padding:3px 8px;border-radius:5px;font-weight:500;white-space:nowrap}
        .hs2-value{font-weight:700;color:#16A34A;font-size:13px}
        .hs2-actions{display:flex;gap:4px;align-items:center}
        .hs2-btn{width:28px;height:28px;border:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .hs2-btn span{font-size:15px}
        .hs2-btn-view{background:#EFF6FF;color:#2563EB}.hs2-btn-view:hover{background:#2563EB;color:#fff}
        .hs2-btn-preview{background:#F0FDFA;color:#0D9488}.hs2-btn-preview:hover{background:#0D9488;color:#fff}
        .hs2-btn-share{background:#F5F3FF;color:#7C3AED}.hs2-btn-share:hover{background:#7C3AED;color:#fff}
        .hs2-btn-edit{background:#FFF7ED;color:#EA580C}.hs2-btn-edit:hover{background:#EA580C;color:#fff}
        .hs2-btn-del{background:#FEF2F2;color:#DC2626}.hs2-btn-del:hover{background:#DC2626;color:#fff}
        .hs2-file-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;transition:background .15s}
        .hs2-file-row:hover{background:#F8FAFF}
        .hs2-file-meta{flex:1;min-width:0}
        .hs2-file-name{display:block;font-size:13px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .hs2-file-size{font-size:11px;color:var(--text-muted)}
        .hs2-icon-btn{width:30px;height:30px;border:1px solid var(--border-color);border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .hs2-icon-btn:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
        .hs2-icon-btn span{font-size:15px}
        .hs2-icon-del{color:#DC2626;border-color:#FCA5A5}.hs2-icon-del:hover{background:#DC2626;border-color:#DC2626;color:#fff}
        .hs2-share-inline-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border:1.5px solid #7C3AED;border-radius:6px;background:#F5F3FF;color:#7C3AED;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
        .hs2-share-inline-btn:hover{background:#7C3AED;color:#fff}
        .hs2-cat-row{display:grid;grid-template-columns:auto 1fr 1fr 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-color)}
        .hs2-cat-inp{padding:6px 10px;border:1.5px solid var(--border-color);border-radius:6px;font-size:13px}
        .hs2-add-cat-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;margin-top:12px;border:2px dashed var(--border-color);border-radius:8px;background:none;color:var(--primary);font-weight:600;cursor:pointer;font-size:13px;transition:all .15s;width:100%;justify-content:center}
        .hs2-add-cat-btn:hover{border-color:var(--primary);background:#EFF6FF}
        .hs2-project-row{background:#F8FAFC;border-bottom:1px solid var(--border-color)}
        .hs2-project-row:hover{background:#F1F5F9!important}
        .hs2-project-header{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;user-select:none}
        .hs2-project-name{font-weight:700;color:var(--text-main);font-size:14px}
        .hs2-project-count{font-size:11px;color:var(--text-muted);background:#fff;padding:2px 8px;border-radius:12px;border:1px solid var(--border-color)}
        .hs2-project-toggle{transition:transform .2s;color:var(--text-muted)}
        .hs2-project-toggle.expanded{transform:rotate(180deg)}
        .hs2-child-row{background:#fff}
        .hs2-child-row td:first-child{padding-left:40px;position:relative}
        .hs2-child-row td:first-child::before{content:'';position:absolute;left:24px;top:0;bottom:0;width:2px;background:#F1F5F9}
        .hs2-child-row:last-child td:first-child::before{bottom:50%}
        .hs2-child-row td:first-child::after{content:'';position:absolute;left:24px;top:50%;width:12px;height:2px;background:#F1F5F9}
        </style>
        <div class="employee-module" style="background:var(--bg-body)">
            <div class="employee-toolbar" style="display:flex;align-items:center;gap:8px;padding:12px 20px;background:#fff;border-bottom:1px solid var(--border-color)">
                <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin:0;padding:8px 12px"><span class="material-icons-outlined">arrow_back</span>Quay láº¡i</button>
                <div class="search-box" style="flex:1;min-width:180px;max-width:300px">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" placeholder="TÃ¬m mÃ£ HS, tÃªn, Ä‘á»‘i tÃ¡c..." value="${hsSearchQuery}" oninput="window.erpApp.hsSearch(this.value)">
                </div>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('project',this.value)" style="width:180px">
                    <option value="">ðŸ“ Táº¥t cáº£ dá»± Ã¡n</option>${projOpts}
                </select>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('dept',this.value)" style="width:160px">
                    <option value="">ðŸ¢ Táº¥t cáº£ phÃ²ng ban</option>${deptOpts}
                </select>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('year',this.value)" style="width:130px">
                    <option value="">ðŸ“… Táº¥t cáº£ cÃ¡c nÄƒm</option>${yearOpts}
                </select>
                <input class="hs2-filter-select" type="text" placeholder="ðŸ­ NhÃ  cung cáº¥p..." value="${hsFilterSupplier}" oninput="window.erpApp.hsFilterBy('supplier',this.value)" style="width:150px">

                ${hasFilter ? '<button class="hs2-clear-btn" onclick="window.erpApp.hsClearFilters()" title="XÃ³a bá»™ lá»c" style="padding:6px"><span class="material-icons-outlined">filter_alt_off</span></button>' : ''}
                <div style="flex:1"></div>
                <button class="hs2-cat-mgr-btn" style="border-color:#10b981;color:#10b981" onclick="window.erpApp.pmSyncAllProjectsFromArchive()" title="Äá»“ng bá»™ táº¥t cáº£ dá»¯ liá»‡u tá»« Quáº£n lÃ½ dá»± Ã¡n">
                    <span class="material-icons-outlined" style="font-size:18px">sync</span> Äá»“ng bá»™ PM
                </button>
                <button class="hs2-cat-mgr-btn" onclick="window.erpApp.openHsCategoryManager()">Danh má»¥c</button>
                ${isAdmin() ? '<button class="btn-add-employee" onclick="window.erpApp.openHsModal()" style="margin:0"><span class="material-icons-outlined">note_add</span>ThÃªm há»“ sÆ¡</button>' : ''}
            </div>
            <div class="hs2-stats-row">
                <div class="hs2-stat-card${hsActiveTab === 'all' ? ' hs2-stat-active' : ''}" onclick="window.erpApp.hsSetTab('all')" style="border-left:3px solid #64748B">
                    <div><div class="hs2-stat-num" style="color:#64748B">${hoSoDocuments.length}</div><div class="hs2-stat-lbl">Táº¥t cáº£ há»“ sÆ¡</div></div>
                </div>
                ${statsHtml}
            </div>
            <div class="table-container" style="margin:0 20px 16px">
                <div class="table-header-bar">
                    <div class="table-title">Danh sÃ¡ch há»“ sÆ¡ lÆ°u trá»¯</div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="table-count">${filtered.length} káº¿t quáº£${hsActiveTab !== 'all' ? ' â€” ' + getHsCatById(hsActiveTab).label : ''}</div>
                    </div>
                </div>
                <div class="table-scroll">
                    <table class="data-table hs2-table">
                        <thead><tr>
                            <th style="width:100px;text-align:center">MÃ£ HS</th>
                            <th style="width:300px">TÃªn há»“ sÆ¡ / PhÃ¢n loáº¡i</th>
                            <th style="width:180px">TÃªn dá»± Ã¡n (ná»™i bá»™)</th>
                            <th style="width:180px">GÃ³i Tháº§u/Dá»± Ã¡n</th>
                            <th style="width:120px">Sá»‘ há»£p Ä‘á»“ng</th>
                            <th style="width:180px">Äá»‘i tÃ¡c (Chá»§ ÄT/KH/NCC)</th>
                            <th style="width:130px;text-align:right">GiÃ¡ trá»‹</th>
                            <th style="width:110px;text-align:center">NgÃ y kÃ½ HÄ</th>
                            <th style="width:130px;text-align:center">NgÃ y hoÃ n thÃ nh</th>
                            <th style="width:130px;text-align:center">Tráº¡ng thÃ¡i</th>
                            <th style="width:140px;text-align:center">TÃ¡c vá»¥</th>
                        </tr></thead>
                        <tbody>${tableBody}</tbody>
                    </table>
                </div>
                ${pagHtml}
            </div>
        </div>`;
    }

    window.erpApp.toggleHsProject = function (projectName) {
        if (hsExpandedProjects.has(projectName)) {
            hsExpandedProjects.delete(projectName);
        } else {
            hsExpandedProjects.add(projectName);
        }
        renderLuuTruHoSo();
    };

    window.erpApp.hsSetAllExpanded = function (isExpanded) {
        const projects = [...new Set(hoSoDocuments.map(d => d.project || 'KhÃ´ng thuá»™c dá»± Ã¡n'))];
        if (isExpanded) {
            projects.forEach(p => hsExpandedProjects.add(p));
        } else {
            hsExpandedProjects.clear();
        }
        renderLuuTruHoSo();
    };


    function viewHoSo(id) {
        const doc = hoSoDocuments.find(d => d.id === id);
        if (!doc) { return; }
        const cat = getHsCatById(doc.category);
        const filesHtml = (doc.files && doc.files.length > 0) ? doc.files.map((f, i) => {
            const fType = f.type || getHsFileTypeFromName(f.name);
            return `<div class="hs2-file-row" style="cursor:pointer" onclick="window.erpApp.previewHsFile(${i},'${doc.id}')">
                <span class="material-icons-outlined" style="color:${getHsFileColor(fType)};font-size:22px">${getHsFileIcon(fType)}</span>
                <div class="hs2-file-meta">
                    <span class="hs2-file-name" style="color:var(--primary);font-weight:600">${f.name}</span>
                    <span class="hs2-file-size">${f.size || ''}</span>
                </div>
                <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
                    <button class="hs2-icon-btn" title="Táº£i file / Link" onclick="window.erpApp.shareHsFile(${i},'${doc.id}')"><span class="material-icons-outlined">link</span></button>
                </div>
            </div>`;
        }).join('') : '<div class="hs-no-files"><span class="material-icons-outlined">cloud_off</span> ChÆ°a cÃ³ file Ä‘Ã­nh kÃ¨m</div>';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsViewModal';
        modal.innerHTML = `<div class="modal-content" style="max-width:720px">
            <div class="modal-header" style="background:${cat.bg};border-bottom:2px solid ${cat.color}30">
                <h3 style="color:${cat.color}">${doc.title}</h3>
                <button class="modal-close" onclick="window.erpApp.closeHsViewModal()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body" style="padding:0">
                <div class="hs-view-header" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <span class="hs2-cat-chip" style="background:${cat.bg};color:${cat.color}">${cat.label}</span>
                    <span class="gm-badge ${getHsStatusColor(doc.status)}" style="font-size:13px;padding:6px 14px">${getHsStatusLabel(doc.status)}</span>
                    <span class="hs-view-id">${doc.id}</span>
                </div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label><span class="material-icons-outlined">assignment</span> GÃ³i Tháº§u/Dá»± Ã¡n</label><p>${doc.projectPublic || 'â€”'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">handshake</span> Äá»‘i tÃ¡c (KH/NCC)</label><p>${doc.supplier || doc.customer || 'â€”'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">payments</span> GiÃ¡ trá»‹ HÄ</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.value)}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">tag</span> Sá»‘ há»£p Ä‘á»“ng</label><p>${doc.symbol || 'â€”'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">event</span> NgÃ y kÃ½ há»£p Ä‘á»“ng</label><p>${formatDate(doc.issueDate)}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">event_available</span> NgÃ y nghiá»‡m thu hoÃ n thÃ nh</label><p>${formatDate(doc.transDate)}</p></div>
                </div>
                <div class="form-section-title" style="margin-top:16px"><span class="material-icons-outlined" style="font-size:14px">verified_user</span> ThÃ´ng tin Báº£o hÃ nh</div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label>Báº¯t Ä‘áº§u</label><p>${formatDate(doc.warrantyStart)}</p></div>
                    <div class="hs-view-field"><label>Thá»i gian báº£o hÃ nh</label><p>${(doc.warrantyPeriod !== undefined && doc.warrantyPeriod !== null) ? doc.warrantyPeriod : 'â€”'} thÃ¡ng</p></div>
                    <div class="hs-view-field"><label>Káº¿t thÃºc</label><p>${formatDate(doc.warrantyEnd)}</p></div>
                    <div class="hs-view-field"><label>GiÃ¡ trá»‹ báº£o hÃ nh (5%)</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.warrantyValue)}</p></div>
                </div>
                <div class="form-section-title" style="margin-top:16px"><span class="material-icons-outlined" style="font-size:14px">post_add</span> Phá»¥ lá»¥c há»£p Ä‘á»“ng</div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label>NgÃ y kÃ½ PLHÄ</label><p>${formatDate(doc.appendixDate)}</p></div>
                    <div class="hs-view-field"><label>GiÃ¡ trá»‹ Ä‘iá»u chá»‰nh</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.appendixValue)}</p></div>
                    <div class="hs-view-field"><label>Gia háº¡n Ä‘áº¿n (ngÃ y)</label><p>${formatDate(doc.appendixExtend)}</p></div>
                    <div class="hs-view-field"><label>Tráº¡ng thÃ¡i</label><p>${doc.appendixStatus === 'da-ky' ? 'ÄÃ£ kÃ½' : (doc.appendixStatus === 'dang-trinh-duyet' ? 'Äang trÃ¬nh duyá»‡t' : 'â€”')}</p></div>
                </div>
                ${doc.note ? `<div class="hs-view-note"><label><span class="material-icons-outlined">notes</span> Ghi chÃº</label><p>${doc.note}</p></div>` : ''}
                <div class="hs-view-files">
                    <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                        <span style="font-weight:600;display:flex;align-items:center;gap:6px"><span class="material-icons-outlined">attach_file</span> File Ä‘Ã­nh kÃ¨m (${(doc.files || []).length})</span>
                    </label>
                    <div class="hs-file-list">${filesHtml}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" style="width:100%" onclick="window.erpApp.closeHsViewModal()">ÄÃ³ng</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }

    function closeHsViewModal() {
        const m = document.getElementById('hsViewModal');
        if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
    }

    function openHsPreview(docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc || !doc.files || doc.files.length === 0) { showToast('Há»“ sÆ¡ nÃ y chÆ°a cÃ³ file Ä‘Ã­nh kÃ¨m.'); return; }
        if (doc.files.length === 1) { window.erpApp.previewHsFile(0, docId); return; }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsPreviewPickerModal';
        const filesHtml = renderHsFileList(doc.files, false, 'hs-view:' + docId);
        modal.innerHTML = `<div class="modal-content" style="max-width:500px">
            <div class="modal-header"><h3><span class="material-icons-outlined">preview</span> Chá»n file Ä‘á»ƒ xem</h3>
            <button class="modal-close" onclick="document.getElementById('hsPreviewPickerModal').remove()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body"><p style="color:var(--text-secondary);margin-bottom:16px;font-size:13px">${doc.title}</p>
            <div class="hs-file-list">${filesHtml}</div></div></div>`;
        document.body.appendChild(modal);
    }

    function shareHoSo(docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc) { return; }
        const shareData = { id: doc.id, title: doc.title, project: doc.project, status: doc.status, issueDate: doc.issueDate };
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
        const fakeUrl = `${location.origin}${location.pathname}?hs_share=${encoded}`;
        const copy = (txt) => {
            if (navigator.clipboard) { navigator.clipboard.writeText(txt).catch(() => { }); }
            else { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        };
        copy(fakeUrl);
        showToast(`âœ… ÄÃ£ sao chÃ©p link chia sáº» há»“ sÆ¡ ${docId}`);
    }

    function shareHsFile(fileIdx, docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc || !doc.files || !doc.files[fileIdx]) { return; }
        const f = doc.files[fileIdx];
        const href = f.dataUrl || f.url;
        if (href) {
            const a = document.createElement('a'); a.href = href; a.download = f.name; a.target = '_blank'; a.click();
            showToast(`â¬‡ Äang táº£i xuá»‘ng: ${f.name}`);
        } else { showToast('File nÃ y chÆ°a cÃ³ dá»¯ liá»‡u Ä‘á»ƒ táº£i.', 'warning'); }
    }

    function removeHsFileDirect(fileIdx, docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc || !doc.files) { return; }
        const fname = doc.files[fileIdx].name;
        doc.files.splice(fileIdx, 1);
        showToast(`ÄÃ£ xÃ³a file "${fname}"`);
        closeHsViewModal();
        setTimeout(() => viewHoSo(docId), 200);
    }

    function openHsModal(id) {
        const doc = id ? hoSoDocuments.find(d => d.id === id) : null;
        const isEdit = !!doc;
        tempHsFiles = doc ? [...(doc.files || [])] : [];
        const catOpts = hsCategories.map(c => `<option value="${c.id}" ${isEdit && doc.category === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
        const projOpts2 = pmProjects.map(p => `<option value="${p.name}" ${isEdit && doc.project === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsEditModal';
        modal.innerHTML = `<div class="modal-content" style="max-width:720px">
            <div class="modal-header">
                <h3><span class="material-icons-outlined">${isEdit ? 'edit' : 'note_add'}</span> ${isEdit ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}</h3>
                <button class="modal-close" onclick="window.erpApp.closeHsEditModal()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="hsEditId" value="${isEdit ? doc.id : ''}">
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">info</span> Thông tin cơ bản</div>
                <div class="form-grid">
                    <div class="form-group full-width"><label>Tên hồ sơ <span class="required">*</span></label>
                        <input type="text" id="hsTitle" value="${isEdit ? doc.title : ''}" placeholder="VD: Hợp đồng cung cấp vật liệu..."></div>
                    <div class="form-group"><label>Loại hồ sơ <span class="required">*</span></label>
                        <select id="hsCategory">${catOpts}</select></div>
                    <div class="form-group"><label>Tráº¡ng thÃ¡i</label>
                        <select id="hsStatus">
                            <option value="da-hoan-thien" ${isEdit && doc.status === 'da-hoan-thien' ? 'selected' : ''}>🟠 Đã hoàn thiện</option>
                            <option value="active" ${isEdit && doc.status === 'active' ? 'selected' : ''}>ðŸŸ¢ Äang hiá»‡u lá»±c</option>
                            <option value="completed" ${isEdit && doc.status === 'completed' ? 'selected' : ''}>ðŸ”µ HoÃ n thÃ nh</option>
                            <option value="pending" ${isEdit && doc.status === 'pending' ? 'selected' : ''}>ðŸŸ¡ Chá» xá»­ lÃ½</option>
                            <option value="expired" ${isEdit && doc.status === 'expired' ? 'selected' : ''}>ðŸ”´ Háº¿t háº¡n</option>
                            <option value="cancelled" ${isEdit && doc.status === 'cancelled' ? 'selected' : ''}>âšª ÄÃ£ há»§y</option>
                        </select></div>
                    <div class="form-group"><label>TÃªn dá»± Ã¡n (ná»™i bá»™)</label>
                        <select id="hsProject">
                            <option value="">â€” Chá»n dá»± Ã¡n â€”</option>${projOpts2}
                            <option value="_new">âž• ThÃªm dá»± Ã¡n má»›i...</option>
                        </select></div>
                    <div class="form-group"><label>GÃ³i Tháº§u/Dá»± Ã¡n</label>
                        <input type="text" id="hsProjectPublic" value="${isEdit ? (doc.projectPublic || '') : ''}" placeholder="Nháº­p tÃªn gÃ³i tháº§u/dá»± Ã¡n bÃªn ngoÃ i..."></div>
                    <div class="form-group"><label>Há»“ sÆ¡ Ä‘ang lÆ°u</label>
                        <select id="hsStorageBranch">
                            <option value="">-- Chá»n chi nhÃ¡nh lÆ°u trá»¯ --</option>
                            ${branches.filter(b => b.status === 'active').map(b => `<option value="${b.name}" ${isEdit && doc.storageBranch === b.name ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select></div>
                    <div class="form-group"><label>Sá»‘ há»£p Ä‘á»“ng</label>
                        <input type="text" id="hsSymbol" value="${isEdit ? (doc.symbol || '') : ''}" placeholder="VD: 123/CV-VB..."></div>
                    <div class="form-group"><label>NgÃ y kÃ½ há»£p Ä‘á»“ng <span class="required">*</span></label>
                        <input type="date" id="hsIssueDate" value="${isEdit ? doc.issueDate : new Date().toISOString().split('T')[0]}"></div>
                    <div class="form-group"><label>NgÃ y nghiá»‡m thu hoÃ n thÃ nh</label>
                        <input type="date" id="hsTransDate" value="${isEdit ? (doc.transDate || '') : ''}"></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">handshake</span> Äá»‘i tÃ¡c &amp; GiÃ¡ trá»‹</div>
                <div class="form-grid">
                    <div class="form-group full-width"><label>Äá»‘i tÃ¡c (Chá»§ Ä‘áº§u tÆ° / KhÃ¡ch hÃ ng / NhÃ  cung cáº¥p) <span class="required">*</span></label>
                        <input type="text" id="hsSupplier" value="${isEdit ? (doc.supplier || doc.customer || '') : ''}" placeholder="TÃªn cÃ´ng ty Ä‘á»‘i tÃ¡c..."></div>
                    <div class="form-group"><label>GiÃ¡ trá»‹ HÄ (VNÄ)</label>
                        <input type="text" id="hsValue" value="${isEdit ? window.erpApp.formatValue(doc.value) : ''}" placeholder="Nháº­p sá»‘ tiá»n..." oninput="window.erpApp.formatNumberInput(this)"></div>
                    <div class="form-group full-width"><label>Ghi chÃº</label>
                        <textarea id="hsNote" rows="2" placeholder="Nháº­p ghi chÃº...">${isEdit ? (doc.note || '') : ''}</textarea></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">verified_user</span> ThÃ´ng tin Báº£o hÃ nh</div>
                <div class="form-grid">
                    <div class="form-group"><label>Báº¯t Ä‘áº§u (Láº¥y tá»« NgÃ y hoÃ n thÃ nh)</label>
                        <input type="date" id="hsWarrantyStart" value="${isEdit ? (doc.warrantyStart || '') : ''}" readonly style="background:#f1f5f9"></div>
                    <div class="form-group"><label>Thá»i gian báº£o hÃ nh (thÃ¡ng)</label>
                        <input type="number" id="hsWarrantyPeriod" value="${isEdit ? (doc.warrantyPeriod ?? '') : ''}" placeholder="Nháº­p sá»‘ thÃ¡ng..."></div>
                    <div class="form-group"><label>Káº¿t thÃºc</label>
                        <input type="date" id="hsWarrantyEnd" value="${isEdit ? (doc.warrantyEnd || '') : ''}" readonly style="background:#f1f5f9"></div>
                    <div class="form-group"><label>GiÃ¡ trá»‹ báº£o hÃ nh (5% HÄ)</label>
                        <input type="text" id="hsWarrantyValue" value="${isEdit ? (doc.warrantyValue ? window.erpApp.formatValue(doc.warrantyValue) : '') : ''}" placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="font-weight:700"></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">post_add</span> Phá»¥ lá»¥c há»£p Ä‘á»“ng</div>
                <div class="form-grid">
                    <div class="form-group"><label>NgÃ y kÃ½ PLHÄ</label>
                        <input type="date" id="hsAppendixDate" value="${isEdit ? (doc.appendixDate || '') : ''}"></div>
                    <div class="form-group"><label>GiÃ¡ trá»‹ Ä‘iá»u chá»‰nh (VNÄ)</label>
                        <input type="text" id="hsAppendixValue" value="${isEdit && doc.appendixValue ? window.erpApp.formatValue(doc.appendixValue) : ''}" placeholder="Nháº­p sá»‘ tiá»n..." oninput="window.erpApp.formatNumberInput(this)"></div>
                    <div class="form-group"><label>Gia háº¡n Ä‘áº¿n (ngÃ y)</label>
                        <input type="date" id="hsAppendixExtend" value="${isEdit ? (doc.appendixExtend || '') : ''}"></div>
                    <div class="form-group"><label>Tráº¡ng thÃ¡i</label>
                        <select id="hsAppendixStatus">
                            <option value="">-- Chá»n tráº¡ng thÃ¡i --</option>
                            <option value="da-ky" ${isEdit && doc.appendixStatus === 'da-ky' ? 'selected' : ''}>ÄÃ£ kÃ½</option>
                            <option value="dang-trinh-duyet" ${isEdit && doc.appendixStatus === 'dang-trinh-duyet' ? 'selected' : ''}>Äang trÃ¬nh duyá»‡t</option>
                        </select></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">attach_file</span> File Ä‘Ã­nh kÃ¨m (PDF, Word, Excel, áº¢nh, ZIP)</div>
                <div class="contract-upload-area">
                    <label for="hsFileInput" class="upload-label">
                        <span class="material-icons-outlined">cloud_upload</span>
                        <span>Nháº¥n Ä‘á»ƒ chá»n file hoáº·c kÃ©o tháº£ vÃ o Ä‘Ã¢y</span>
                        <span style="font-size:11px;color:var(--text-muted);font-weight:400">Há»— trá»£: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP â€” Tá»‘i Ä‘a 20MB/file</span>
                    </label>
                    <input type="file" id="hsFileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar" multiple onchange="window.erpApp.handleHsFileUpload(event)" style="display:none">
                </div>
                <div class="form-grid" style="margin-top:16px">
                    <div class="form-group full-width"><label>ÄÆ°á»ng Link</label>
                        <textarea id="hsFileUrl" placeholder="https://example.com/file.pdf" rows="3" style="min-height:72px"></textarea>
                        <span style="font-size:11px;color:var(--text-muted);font-weight:400">Nháº­p nhiá»u link má»—i dÃ²ng má»™t link. CÃ³ thá»ƒ thÃªm tÃªn hiá»ƒn thá»‹ sau dáº¥u | nhÆ°: https://... | TÃªn file</span></div>
                    <div style="display:flex;align-items:flex-end;gap:12px;width:100%;justify-content:space-between">
                        <div class="form-group" style="flex:1;min-width:280px">
                            <label>TÃªn hiá»ƒn thá»‹</label>
                            <input type="text" id="hsFileUrlName" placeholder="TÃªn file chung cho cÃ¡c link (tuá»³ chá»n)">
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
                            <button type="button" class="btn-save" style="padding:10px 14px;min-width:140px" onclick="window.erpApp.addHsFileLink()"><span class="material-icons-outlined">link</span> ThÃªm link</button>
                            <button type="button" class="btn-save" style="padding:10px 14px;min-width:140px;background:#1D4ED8;color:#fff" onclick="window.erpApp.removeAllHsLinks()"><span class="material-icons-outlined">delete_sweep</span> XÃ³a link</button>
                        </div>
                    </div>
                </div>
                <div id="hsFileList">${renderHsFileList(tempHsFiles, true)}</div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="window.erpApp.closeHsEditModal()">Há»§y</button>
                ${isAdmin() ? `
                <button class="btn-save" onclick="window.erpApp.saveHoSo()"><span class="material-icons-outlined">save</span>${isEdit ? 'Cáº­p nháº­t' : 'LÆ°u há»“ sÆ¡'}</button>
                ` : ''}
            </div>
        </div>`;
        document.body.appendChild(modal);

        // Initialize Flatpickr cho cÃ¡c trÆ°á»ng ngÃ y thÃ¡ng Ä‘á»‹nh dáº¡ng DD/MM/YYYY
        if (typeof flatpickr !== 'undefined') {
            flatpickr('#hsIssueDate, #hsTransDate, #hsAppendixDate, #hsAppendixExtend', {
                dateFormat: 'Y-m-d',
                altInput: true,
                altFormat: 'd/m/Y',
                allowInput: true,
                locale: 'vn'
            });
            flatpickr('#hsWarrantyStart, #hsWarrantyEnd', {
                dateFormat: 'Y-m-d',
                altInput: true,
                altFormat: 'd/m/Y',
                locale: 'vn',
                clickOpens: false,
                allowInput: false
            });
        }

        document.getElementById('hsProject').addEventListener('change', function () {
            const select = this;
            if (select.value === '_new') {
                window.erpApp.showAddProjectDialog((projName) => {
                    if (typeof cvProjects !== 'undefined' && !cvProjects.includes(projName)) {
                        cvProjects.push(projName);
                        localStorage.setItem('erp_cvProjects', JSON.stringify(cvProjects));
                    }
                    if (typeof pmProjects !== 'undefined') {
                        let project = pmProjects.find(p => p.name === projName);
                        if (!project) {
                            project = window.erpApp.createNewProjectObject(projName);
                            pmProjects.push(project);
                            if (window.CrudSync) { window.CrudSync.saveItem('pmProjects', project, 'id'); }
                            // ðŸ†• Äá»“ng bá»™ ngay vÃ o localStorage Ä‘á»ƒ cÃ¡c module khÃ¡c nháº­n diá»‡n Ä‘Æ°á»£c
                            localStorage.setItem('erp_pmProjects', JSON.stringify(pmProjects));
                        }
                        // ðŸ†• Tá»± Ä‘á»™ng Ä‘áº·t dá»± Ã¡n nÃ y lÃ m active cho module Quáº£n lÃ½ dá»± Ã¡n
                        pmActiveProjectId = project.id;
                    }
                    const opt = document.createElement('option');
                    opt.value = projName; opt.text = projName; opt.selected = true;
                    select.insertBefore(opt, select.lastElementChild);
                    select.value = projName;

                    showToast(`ÄÃ£ táº¡o vÃ  kÃ­ch hoáº¡t dá»± Ã¡n: ${projName}`, 'success');
                }, () => {
                    select.value = '';
                });
            }
        });

        // Tá»± Ä‘á»™ng tÃ­nh toÃ¡n thÃ´ng tin báº£o hÃ nh
        const transDateInput = document.getElementById('hsTransDate');
        const warrantyStartInput = document.getElementById('hsWarrantyStart');
        const warrantyPeriodInput = document.getElementById('hsWarrantyPeriod');
        const warrantyEndInput = document.getElementById('hsWarrantyEnd');
        const contractValueInput = document.getElementById('hsValue');
        const warrantyValueInput = document.getElementById('hsWarrantyValue');

        const updateWarrantyCalculations = () => {
            if (!warrantyStartInput || !warrantyEndInput || !warrantyValueInput) { return; }
            // 1. Báº¯t Ä‘áº§u = NgÃ y nghiá»‡m thu hoÃ n thÃ nh
            warrantyStartInput.value = transDateInput.value;
            if (warrantyStartInput._flatpickr) { warrantyStartInput._flatpickr.setDate(warrantyStartInput.value); }

            // 2. Káº¿t thÃºc = Báº¯t Ä‘áº§u + Thá»i gian báº£o hÃ nh
            if (warrantyStartInput.value && warrantyPeriodInput.value) {
                const startDate = new Date(warrantyStartInput.value);
                const months = parseInt(warrantyPeriodInput.value) || 0;
                startDate.setMonth(startDate.getMonth() + months);
                warrantyEndInput.value = startDate.toISOString().split('T')[0];
            } else {
                warrantyEndInput.value = '';
            }
            if (warrantyEndInput._flatpickr) { warrantyEndInput._flatpickr.setDate(warrantyEndInput.value); }

            // 3. GiÃ¡ trá»‹ báº£o hÃ nh = 5% GiÃ¡ trá»‹ HÄ (chá»‰ tÃ­nh náº¿u cÃ³ thá»i gian báº£o hÃ nh)
            const months = parseInt(warrantyPeriodInput.value) || 0;
            if (months > 0) {
                const valStr = contractValueInput.value.replace(/\D/g, '');
                const val = parseFloat(valStr) || 0;
                const wVal = Math.round(val * 0.05);
                warrantyValueInput.value = wVal > 0 ? window.erpApp.formatValue(wVal) : '';
            } else {
                warrantyValueInput.value = '';
            }
        };

        transDateInput.addEventListener('change', updateWarrantyCalculations);
        warrantyPeriodInput.addEventListener('input', updateWarrantyCalculations);
        contractValueInput.addEventListener('input', updateWarrantyCalculations);

        // Cháº¡y láº§n Ä‘áº§u náº¿u Ä‘ang edit
        if (isEdit) { updateWarrantyCalculations(); }
    }

    function renderHsFileList(files, editable, context) {
        if (!files || files.length === 0) { return ''; }
        return files.map((f, i) => {
            const fType = f.type || getHsFileTypeFromName(f.name);
            const icon = getHsFileIcon(fType);
            const iconColor = getHsFileColor(fType);
            const typeLabel = getHsFileTypeLabel(f.type || fType);
            const isUrlLink = !!f.url;
            const previewable = !!(f.dataUrl || f.url);

            // Determine preview function based on context
            let previewFn = `window.erpApp.previewHsFile(${i},'')`;
            if (context && context.startsWith('cv-view:')) {
                previewFn = `window.erpApp.previewCvFile(${i},'${context.split(':')[1]}')`;
            } else if (context === 'cv-edit') {
                previewFn = `window.erpApp.previewCvFile(${i},'')`;
            } else if (context && context.startsWith('pd-view:')) {
                previewFn = `window.erpApp.previewPdFile(${i},'${context.split(':')[1]}')`;
            } else if (context && context.startsWith('pd-edit')) {
                previewFn = `window.erpApp.previewPdFile(${i},'')`;
            } else if (context && context.startsWith('pk-view:')) {
                previewFn = `window.erpApp.previewPkFile(${i},'${context.split(':')[1]}')`;
            } else if (context === 'pk-edit') {
                previewFn = `window.erpApp.previewPkFile(${i},'')`;
            }

            const previewBtn = `<button class="hs-file-action-btn" title="${isUrlLink ? 'Má»Ÿ link' : 'Xem'}" onclick="event.stopPropagation(); ${previewFn}" style="color:#0D9488"><span class="material-icons-outlined">visibility</span></button>`;

            let fileNameHtml = `<span class="contract-file-name" style="color:var(--primary);font-weight:700">${f.name}</span>`;
            if (isUrlLink) {
                fileNameHtml = `<a href="${f.url}" target="_blank" rel="noreferrer noopener" style="color:var(--primary);font-weight:700;text-decoration:none" onclick="event.stopPropagation()">${f.name}</a>`;
            }

            const fileSizeHtml = `${typeLabel}${f.size ? ' Â· ' + f.size : ''}`;
            let actions = '';

            if (context && context.includes('-view:')) {
                // Read-only view
                actions = previewable ? previewBtn : '';
            } else if (context && (context.includes('-edit') || context === 'cv-edit' || context === 'pk-edit')) {
                // Edit mode
                let removeFn = '';
                if (context === 'cv-edit') { removeFn = `window.erpApp.removeCvFileTemp(${i})`; }
                else if (context === 'pd-edit' || context.startsWith('pd-edit')) { removeFn = `window.erpApp.removePdFileTemp(${i})`; }
                else if (context === 'pk-edit') { removeFn = `window.erpApp.removePkFileTemp(${i})`; }

                actions = `<div style="display:flex;gap:4px;align-items:center">
                    ${previewable ? previewBtn : ''}
                    <button class="contract-file-remove" onclick="event.stopPropagation(); ${removeFn}"><span class="material-icons-outlined">close</span></button>
                </div>`;
            } else if (editable) {
                actions = `<div style="display:flex;gap:4px;align-items:center">
                    ${previewable ? previewBtn : ''}
                    <button class="contract-file-remove" onclick="event.stopPropagation(); window.erpApp.removeHsFile(${i})"><span class="material-icons-outlined">close</span></button>
                </div>`;
            } else {
                actions = previewable ? previewBtn : '';
            }

            return `<div class="contract-file-item" style="cursor:pointer" onclick="${previewFn}">
                <span class="material-icons-outlined" style="color:${iconColor};font-size:20px">${icon}</span>
                <div class="contract-file-info">
                    ${fileNameHtml}
                    <span class="contract-file-size" style="display:block;margin-top:4px;font-size:12px;color:#64748B">${fileSizeHtml}</span>
                </div>
                <div style="display:flex;gap:4px;align-items:center">${actions}</div>
            </div>`;
        }).join('');
    }

    function closeHsEditModal() {
        const m = document.getElementById('hsEditModal');
        if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
        tempHsFiles = [];
    }

    async function saveHoSo() {
        if (!isAdmin()) { showToast('Báº¡n khÃ´ng cÃ³ quyá»n thá»±c hiá»‡n chá»©c nÄƒng nÃ y!', 'error'); return; }
        const id = document.getElementById('hsEditId').value;
        const title = document.getElementById('hsTitle').value.trim();
        const category = document.getElementById('hsCategory').value;
        const status = document.getElementById('hsStatus').value;
        const project = document.getElementById('hsProject').value;
        const projectPublic = document.getElementById('hsProjectPublic').value.trim();
        const storageBranch = document.getElementById('hsStorageBranch').value.trim();
        const symbol = document.getElementById('hsSymbol').value.trim();
        const supplier = document.getElementById('hsSupplier').value.trim();
        const valueStr = document.getElementById('hsValue').value.replace(/\./g, '');
        const value = parseFloat(valueStr) || 0;
        const issueDate = document.getElementById('hsIssueDate').value;
        const transDate = document.getElementById('hsTransDate').value;
        const note = document.getElementById('hsNote').value.trim();

        // ThÃ´ng tin báº£o hÃ nh
        const warrantyStart = document.getElementById('hsWarrantyStart').value;
        const warrantyPeriod = parseInt(document.getElementById('hsWarrantyPeriod').value) || 0;
        const warrantyEnd = document.getElementById('hsWarrantyEnd').value;
        const warrantyValueStr = document.getElementById('hsWarrantyValue').value.replace(/\D/g, '');
        const warrantyValue = parseFloat(warrantyValueStr) || 0;

        // Phá»¥ lá»¥c há»£p Ä‘á»“ng
        const appendixDate = document.getElementById('hsAppendixDate').value;
        const appendixValueStr = document.getElementById('hsAppendixValue').value.replace(/\D/g, '');
        const appendixValue = parseFloat(appendixValueStr) || 0;
        const appendixExtend = document.getElementById('hsAppendixExtend').value;
        const appendixStatus = document.getElementById('hsAppendixStatus').value;

        if (!title || !supplier || !issueDate) { showToast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c!', 'error'); return; }
        const payload = {
            title, category, status, project, projectPublic, storageBranch, symbol, supplier,
            customer: supplier, // Gá»™p chung thÃ nh 1 má»¥c Äá»‘i tÃ¡c
            value, issueDate, transDate, note,
            warrantyStart, warrantyPeriod, warrantyEnd, warrantyValue,
            appendixDate, appendixValue, appendixExtend, appendixStatus,
            files: [...tempHsFiles]
        };
        try {
    if (id) {
            const doc = hoSoDocuments.find(d => d.id === id);
            if (doc) {
                Object.assign(doc, payload);
                if (window.FileStore) { await window.FileStore.saveAllFiles('hoSoDocuments', doc.id, doc.files); }
                if (window.CrudSync) { await window.CrudSync.saveItem('hoSoDocuments', doc, 'id'); }
                // ðŸ”„ Äá»“ng bá»™ ngÆ°á»£c láº¡i Quáº£n lÃ½ dá»± Ã¡n náº¿u cÃ³ liÃªn káº¿t
                syncArchiveWithContract(doc);
                showToast('ÄÃ£ cáº­p nháº­t há»“ sÆ¡ ' + id + (doc.linkedPmId ? ` (Ä‘Ã£ Ä‘á»“ng bá»™ HÄ ${doc.linkedPmId})` : ''), 'success');
            }
        } else {
            const newDoc = { id: nextHsId(), ...payload };
            hoSoDocuments.unshift(newDoc);
            if (window.FileStore) { await window.FileStore.saveAllFiles('hoSoDocuments', newDoc.id, newDoc.files); }
            if (window.CrudSync) { await window.CrudSync.saveItem('hoSoDocuments', newDoc, 'id'); }
            // ðŸ”„ Äá»“ng bá»™ sang Quáº£n lÃ½ dá»± Ã¡n
            syncArchiveWithContract(newDoc);
            showToast('ÄÃ£ thÃªm há»“ sÆ¡ má»›i', 'success');
        }
        } catch (err) {
        console.error('Lỗi lưu hồ sơ:', err);
    } finally {
        closeHsEditModal();
        renderLuuTruHoSo();
    }

    function confirmDeleteHoSo(id) {
        const doc = hoSoDocuments.find(d => d.id === id);
        if (!doc) { return; }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsDeleteModal';
        modal.innerHTML = `<div class="modal-content" style="max-width:420px">
            <div class="modal-header"><h3><span class="material-icons-outlined" style="color:#DC2626">warning</span> XÃ¡c nháº­n xÃ³a</h3>
            <button class="modal-close" onclick="window.erpApp.closeHsDeleteModal()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body" style="text-align:center;padding:24px">
                <p style="font-size:15px">Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a há»“ sÆ¡ <strong>${doc.id}</strong>?</p>
                <p style="color:var(--text-secondary);margin-top:8px;font-size:13px">${doc.title}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="window.erpApp.closeHsDeleteModal()">Há»§y</button>
                <button class="btn-save" style="background:#DC2626" onclick="window.erpApp.deleteHoSo('${doc.id}')"><span class="material-icons-outlined">delete</span> XÃ³a</button>
            </div></div>`;
        document.body.appendChild(modal);
    }

    async function deleteHoSo(id) {
        if (!isAdmin()) {
            window.erpApp.showToast('Báº¡n khÃ´ng cÃ³ quyá»n thá»±c hiá»‡n chá»©c nÄƒng nÃ y!', 'error');
            return;
        }

        window.erpApp.showConfirm(
            'XÃ¡c nháº­n xÃ³a há»“ sÆ¡',
            'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a há»“ sÆ¡ nÃ y vÃ  táº¥t cáº£ há»£p Ä‘á»“ng liÃªn káº¿t?',
            async function () {
                const doc = hoSoDocuments.find(d => d.id === id);
                const linkedPmId = doc ? doc.linkedPmId : null;

                // 1. Remove from hoSoDocuments
                hoSoDocuments = hoSoDocuments.filter(d => d.id !== id);
                if (window.CrudSync) await window.CrudSync.deleteItem('hoSoDocuments', id);
                localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));

                // 2. Cascade delete from pmContracts if linked
                if (linkedPmId) {
                    const pmIdx = pmContracts.findIndex(c => c.id === linkedPmId);
                    if (pmIdx !== -1) {
                        pmContracts.splice(pmIdx, 1);
                        if (window.CrudSync) await window.CrudSync.deleteItem('pmContracts', linkedPmId, 'id');
                        localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));
                        console.log(`[Cascade Delete] Removed linked PM contract: ${linkedPmId}`);
                    }
                }

                if (window.notifyCRUD) {
                    const doc = hoSoDocuments.find(d => d.id === id) || { title: id };
                    window.notifyCRUD('Hồ sơ', 'delete', { name: doc.title, page: 'hanh-chinh' });
                }

                const m = document.getElementById('hsDeleteModal');
                if (m) {
                    m.classList.add('closing');
                    setTimeout(() => m.remove(), 200);
                }
                window.erpApp.showToast('ÄÃ£ xÃ³a há»“ sÆ¡ vÃ  há»£p Ä‘á»“ng liÃªn káº¿t.');
                renderLuuTruHoSo();
            }
        );
    }

    function closeHsDeleteModal() {
        const m = document.getElementById('hsDeleteModal');
        if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
    }

    function openHsCategoryManager() {
        const COLORS = ['#2563EB', '#7C3AED', '#0D9488', '#EA580C', '#16A34A', '#DC2626', '#DB2777', '#0891B2', '#64748B', '#CA8A04', '#9333EA', '#0EA5E9'];
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsCatMgrModal';
        const renderList = () => hsCategories.map((cat, ci) => `
            <div class="hs2-cat-row">
                <div style="background:${cat.bg || cat.color + '14'};color:${cat.color};border:1.5px solid ${cat.color}40;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;min-width:120px">
                    ${cat.label}
                </div>
                <input class="hs2-cat-inp" style="flex:1" type="text" value="${cat.label}" placeholder="TÃªn danh má»¥c" oninput="window.erpApp.updateHsCategory(${ci},'label',this.value)">
                <select class="hs2-cat-inp" onchange="window.erpApp.updateHsCategory(${ci},'color',this.value)">
                    ${COLORS.map(cl => `<option value="${cl}" ${cat.color === cl ? 'selected' : ''}>${cl}</option>`).join('')}
                </select>
                ${hsCategories.length > 1 ? `<button class="hs2-icon-btn hs2-icon-del" onclick="window.erpApp.deleteHsCategory(${ci})"><span class="material-icons-outlined">delete</span></button>` : '<div style="width:34px"></div>'}
            </div>`).join('');
        modal.innerHTML = `<div class="modal-content" style="max-width:700px">
            <div class="modal-header"><h3>Quáº£n lÃ½ danh má»¥c há»“ sÆ¡</h3>
            <button class="modal-close" onclick="document.getElementById('hsCatMgrModal').remove()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body">
                <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Táº¡o, sá»­a Ä‘á»•i vÃ  xÃ³a danh má»¥c theo tÃªn vÃ  mÃ u sáº¯c. Thay Ä‘á»•i Ã¡p dá»¥ng ngay láº­p tá»©c.</p>
                <div id="hsCatList">${renderList()}</div>
                <button class="hs2-add-cat-btn" onclick="window.erpApp.addHsCategory()"><span class="material-icons-outlined">add_circle_outline</span> ThÃªm danh má»¥c má»›i</button>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('hsCatMgrModal').remove()">ÄÃ³ng</button>
                <button class="btn-save" onclick="document.getElementById('hsCatMgrModal').remove();renderLuuTruHoSo()"><span class="material-icons-outlined">check</span> Ãp dá»¥ng thay Ä‘á»•i</button>
            </div></div>`;
        document.body.appendChild(modal);
    }


