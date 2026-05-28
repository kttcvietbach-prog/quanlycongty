    function renderLuuTruHoSo() {
        breadcrumbCurrent.textContent = 'Lưu trữ hồ sơ';
        pageBadge.textContent = 'Hành chính';

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
            const proj = doc.project || 'Không thuộc dự án';
            if (!groups[proj]) { groups[proj] = []; }
            groups[proj].push(doc);
        });

        // Mặc định mở rộng tất cả nếu Set trống (trong lần đầu load)
        const projectsInPage = Object.keys(groups);
        if (hsExpandedProjects.size === 0 && projectsInPage.length > 0 && !hsSearchQuery && !hsFilterProject) {
            projectsInPage.forEach(p => hsExpandedProjects.add(p));
        }

        const tableBody = pageData.length === 0
            ? `<tr><td colspan="11" style="text-align:center;padding:48px;color:var(--text-muted)">
                <span class="material-icons-outlined" style="font-size:48px;opacity:.3;display:block;margin-bottom:12px">search_off</span>
                Không tìm thấy hồ sơ nào</td></tr>`
            : Object.entries(groups).map(([projName, docs]) => {
                const isExpanded = hsExpandedProjects.has(projName);
                const parentRow = `
                    <tr class="hs2-project-row" onclick="window.erpApp.toggleHsProject('${projName}')">
                        <td colspan="11">
                            <div class="hs2-project-header">
                                <span class="material-icons-outlined hs2-project-toggle ${isExpanded ? 'expanded' : ''}">expand_more</span>
                                <span class="hs2-project-name">${projName}</span>
                                <span class="hs2-project-count">${docs.length} hồ sơ</span>
                            </div>
                        </td>
                    </tr>`;

                const childRows = isExpanded ? docs.map(doc => {
                    const cat = getHsCatById(doc.category);
                    const fc = (doc.files || []).length;
                    return `<tr class="hs2-row hs2-child-row">
                        <td style="text-align:center"><span class="hs2-id-badge">${doc.id}</span></td>
                        <td><div class="hs2-title-cell">
                            ${doc.title.toLowerCase().includes(cat.label.toLowerCase()) ? '' : `<span class="hs2-cat-chip" style="background:${cat.bg};color:${cat.color}">${cat.label}</span>`}
                            <span class="hs2-title-text" title="${doc.title}">${doc.title}</span>
                        </div></td>
                        <td><span class="hs2-project-tag" title="${doc.project || ''}"><span class="material-icons-outlined" style="font-size:13px">work_outline</span>${doc.project || '—'}</span></td>
                        <td style="color:var(--text-secondary);font-size:13px">${doc.projectPublic || '—'}</td>
                        <td style="color:var(--text-secondary);font-size:13px">${doc.symbol || '—'}</td>
                        <td style="color:var(--text-secondary);font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${doc.supplier || ''}">${doc.supplier || '—'}</td>
                        <td style="text-align:right"><span class="hs2-value">${fmtCurrency(doc.value)}</span></td>
                        <td style="font-size:13px;color:var(--text-secondary);text-align:center">${formatDate(doc.issueDate)}</td>
                        <td style="font-size:13px;color:var(--text-secondary);text-align:center">${formatDate(doc.transDate)}</td>
                        <td style="text-align:center"><span class="gm-badge ${getHsStatusColor(doc.status)}">${getHsStatusLabel(doc.status)}</span></td>
                        <td style="text-align:center"><div class="hs2-actions" style="justify-content:center">
                            <button class="hs2-btn hs2-btn-view" title="Xem chi tiết" onclick="window.erpApp.viewHoSo('${doc.id}')"><span class="material-icons-outlined">visibility</span></button>
                            ${fc > 0 ? `<button class="hs2-btn hs2-btn-preview" title="Xem tài liệu (${fc} file)" onclick="window.erpApp.openHsPreview('${doc.id}')"><span class="material-icons-outlined">preview</span></button>` : ''}
                            ${isAdmin() ? `
                            <button class="hs2-btn hs2-btn-edit" title="Chỉnh sửa" onclick="window.erpApp.openHsModal('${doc.id}')"><span class="material-icons-outlined">edit</span></button>
                            <button class="hs2-btn hs2-btn-del" title="Xóa" onclick="window.erpApp.confirmDeleteHoSo('${doc.id}')"><span class="material-icons-outlined">delete</span></button>
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
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">Hiển thị ${(hsCurrentPage - 1) * hsPageSize + 1}–${Math.min(hsCurrentPage * hsPageSize, filtered.length)} / ${filtered.length}</span>
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
                <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin:0;padding:8px 12px"><span class="material-icons-outlined">arrow_back</span>Quay lại</button>
                <div class="search-box" style="flex:1;min-width:180px;max-width:300px">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" placeholder="Tìm mã HS, tên, đối tác..." value="${hsSearchQuery}" oninput="window.erpApp.hsSearch(this.value)">
                </div>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('project',this.value)" style="width:180px">
                    <option value="">📁 Tất cả dự án</option>${projOpts}
                </select>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('dept',this.value)" style="width:160px">
                    <option value="">🏢 Tất cả phòng ban</option>${deptOpts}
                </select>
                <select class="hs2-filter-select" onchange="window.erpApp.hsFilterBy('year',this.value)" style="width:130px">
                    <option value="">📅 Tất cả các năm</option>${yearOpts}
                </select>
                <input class="hs2-filter-select" type="text" placeholder="🏭 Nhà cung cấp..." value="${hsFilterSupplier}" oninput="window.erpApp.hsFilterBy('supplier',this.value)" style="width:150px">

                ${hasFilter ? '<button class="hs2-clear-btn" onclick="window.erpApp.hsClearFilters()" title="Xóa bộ lọc" style="padding:6px"><span class="material-icons-outlined">filter_alt_off</span></button>' : ''}
                <div style="flex:1"></div>
                <button class="hs2-cat-mgr-btn" style="border-color:#10b981;color:#10b981" onclick="window.erpApp.pmSyncAllProjectsFromArchive()" title="Đồng bộ tất cả dữ liệu từ Quản lý dự án">
                    <span class="material-icons-outlined" style="font-size:18px">sync</span> Đồng bộ PM
                </button>
                <button class="hs2-cat-mgr-btn" onclick="window.erpApp.openHsCategoryManager()">Danh mục</button>
                ${isAdmin() ? '<button class="btn-add-employee" onclick="window.erpApp.openHsModal()" style="margin:0"><span class="material-icons-outlined">note_add</span>Thêm hồ sơ</button>' : ''}
            </div>
            <div class="hs2-stats-row">
                <div class="hs2-stat-card${hsActiveTab === 'all' ? ' hs2-stat-active' : ''}" onclick="window.erpApp.hsSetTab('all')" style="border-left:3px solid #64748B">
                    <div><div class="hs2-stat-num" style="color:#64748B">${hoSoDocuments.length}</div><div class="hs2-stat-lbl">Tất cả hồ sơ</div></div>
                </div>
                ${statsHtml}
            </div>
            <div class="table-container" style="margin:0 20px 16px">
                <div class="table-header-bar">
                    <div class="table-title">Danh sách hồ sơ lưu trữ</div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="table-count">${filtered.length} kết quả${hsActiveTab !== 'all' ? ' — ' + getHsCatById(hsActiveTab).label : ''}</div>
                    </div>
                </div>
                <div class="table-scroll">
                    <table class="data-table hs2-table">
                        <thead><tr>
                            <th style="width:100px;text-align:center">Mã HS</th>
                            <th style="width:300px">Tên hồ sơ / Phân loại</th>
                            <th style="width:180px">Tên dự án (nội bộ)</th>
                            <th style="width:180px">Gói Thầu/Dự án</th>
                            <th style="width:120px">Số hợp đồng</th>
                            <th style="width:180px">Đối tác (Chủ ĐT/KH/NCC)</th>
                            <th style="width:130px;text-align:right">Giá trị</th>
                            <th style="width:110px;text-align:center">Ngày ký HĐ</th>
                            <th style="width:130px;text-align:center">Ngày hoàn thành</th>
                            <th style="width:130px;text-align:center">Trạng thái</th>
                            <th style="width:140px;text-align:center">Tác vụ</th>
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
        const projects = [...new Set(hoSoDocuments.map(d => d.project || 'Không thuộc dự án'))];
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
                    <button class="hs2-icon-btn" title="Tải file / Link" onclick="window.erpApp.shareHsFile(${i},'${doc.id}')"><span class="material-icons-outlined">link</span></button>
                </div>
            </div>`;
        }).join('') : '<div class="hs-no-files"><span class="material-icons-outlined">cloud_off</span> Chưa có file đính kèm</div>';

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
                    <div class="hs-view-field"><label><span class="material-icons-outlined">assignment</span> Gói Thầu/Dự án</label><p>${doc.projectPublic || '—'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">handshake</span> Đối tác (KH/NCC)</label><p>${doc.supplier || doc.customer || '—'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">payments</span> Giá trị HĐ</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.value)}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">tag</span> Số hợp đồng</label><p>${doc.symbol || '—'}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">event</span> Ngày ký hợp đồng</label><p>${formatDate(doc.issueDate)}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">event_available</span> Ngày nghiệm thu hoàn thành</label><p>${formatDate(doc.transDate)}</p></div>
                </div>
                <div class="form-section-title" style="margin-top:16px"><span class="material-icons-outlined" style="font-size:14px">verified_user</span> Thông tin Bảo hành</div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label>Bắt đầu</label><p>${formatDate(doc.warrantyStart)}</p></div>
                    <div class="hs-view-field"><label>Thời gian bảo hành</label><p>${(doc.warrantyPeriod !== undefined && doc.warrantyPeriod !== null) ? doc.warrantyPeriod : '—'} tháng</p></div>
                    <div class="hs-view-field"><label>Kết thúc</label><p>${formatDate(doc.warrantyEnd)}</p></div>
                    <div class="hs-view-field"><label>Giá trị bảo hành (5%)</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.warrantyValue)}</p></div>
                </div>
                <div class="form-section-title" style="margin-top:16px"><span class="material-icons-outlined" style="font-size:14px">post_add</span> Phụ lục hợp đồng</div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label>Ngày ký PLHĐ</label><p>${formatDate(doc.appendixDate)}</p></div>
                    <div class="hs-view-field"><label>Giá trị điều chỉnh</label><p class="hs-value-highlight">${fmtCurrencyFull(doc.appendixValue)}</p></div>
                    <div class="hs-view-field"><label>Gia hạn đến (ngày)</label><p>${formatDate(doc.appendixExtend)}</p></div>
                    <div class="hs-view-field"><label>Trạng thái</label><p>${doc.appendixStatus === 'da-ky' ? 'Đã ký' : (doc.appendixStatus === 'dang-trinh-duyet' ? 'Đang trình duyệt' : '—')}</p></div>
                </div>
                ${doc.note ? `<div class="hs-view-note"><label><span class="material-icons-outlined">notes</span> Ghi chú</label><p>${doc.note}</p></div>` : ''}
                <div class="hs-view-files">
                    <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                        <span style="font-weight:600;display:flex;align-items:center;gap:6px"><span class="material-icons-outlined">attach_file</span> File đính kèm (${(doc.files || []).length})</span>
                    </label>
                    <div class="hs-file-list">${filesHtml}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" style="width:100%" onclick="window.erpApp.closeHsViewModal()">Đóng</button>
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
        if (!doc || !doc.files || doc.files.length === 0) { showToast('Hồ sơ này chưa có file đính kèm.'); return; }
        if (doc.files.length === 1) { window.erpApp.previewHsFile(0, docId); return; }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsPreviewPickerModal';
        const filesHtml = renderHsFileList(doc.files, false, 'hs-view:' + docId);
        modal.innerHTML = `<div class="modal-content" style="max-width:500px">
            <div class="modal-header"><h3><span class="material-icons-outlined">preview</span> Chọn file để xem</h3>
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
        showToast(`✅ Đã sao chép link chia sẻ hồ sơ ${docId}`);
    }

    function shareHsFile(fileIdx, docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc || !doc.files || !doc.files[fileIdx]) { return; }
        const f = doc.files[fileIdx];
        const href = f.dataUrl || f.url;
        if (href) {
            const a = document.createElement('a'); a.href = href; a.download = f.name; a.target = '_blank'; a.click();
            showToast(`⬇ Đang tải xuống: ${f.name}`);
        } else { showToast('File này chưa có dữ liệu để tải.', 'warning'); }
    }

    function removeHsFileDirect(fileIdx, docId) {
        const doc = hoSoDocuments.find(d => d.id === docId);
        if (!doc || !doc.files) { return; }
        const fname = doc.files[fileIdx].name;
        doc.files.splice(fileIdx, 1);
        showToast(`Đã xóa file "${fname}"`);
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
                    <div class="form-group"><label>Trạng thái</label>
                        <select id="hsStatus">
                            <option value="active" ${isEdit && doc.status === 'active' ? 'selected' : ''}>🟢 Đang hiệu lực</option>
                            <option value="completed" ${isEdit && doc.status === 'completed' ? 'selected' : ''}>🔵 Hoàn thành</option>
                            <option value="da-hoan-thien" ${isEdit && doc.status === 'da-hoan-thien' ? 'selected' : ''}>🟠 Đã hoàn thiện</option>
                            <option value="pending" ${isEdit && doc.status === 'pending' ? 'selected' : ''}>🟡 Chờ xử lý</option>
                            <option value="expired" ${isEdit && doc.status === 'expired' ? 'selected' : ''}>🔴 Hết hạn</option>
                            <option value="cancelled" ${isEdit && doc.status === 'cancelled' ? 'selected' : ''}>⚪ Đã hủy</option>
                        </select></div>
                    <div class="form-group"><label>Tên dự án (nội bộ)</label>
                        <select id="hsProject">
                            <option value="">— Chọn dự án —</option>${projOpts2}
                            <option value="_new">➕ Thêm dự án mới...</option>
                        </select></div>
                    <div class="form-group"><label>Gói Thầu/Dự án</label>
                        <input type="text" id="hsProjectPublic" value="${isEdit ? (doc.projectPublic || '') : ''}" placeholder="Nhập tên gói thầu/dự án bên ngoài..."></div>
                    <div class="form-group"><label>Hồ sơ đang lưu</label>
                        <select id="hsStorageBranch">
                            <option value="">-- Chọn chi nhánh lưu trữ --</option>
                            ${branches.filter(b => b.status === 'active').map(b => `<option value="${b.name}" ${isEdit && doc.storageBranch === b.name ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select></div>
                    <div class="form-group"><label>Số hợp đồng</label>
                        <input type="text" id="hsSymbol" value="${isEdit ? (doc.symbol || '') : ''}" placeholder="VD: 123/CV-VB..."></div>
                    <div class="form-group"><label>Ngày ký hợp đồng <span class="required">*</span></label>
                        <input type="date" id="hsIssueDate" value="${isEdit ? doc.issueDate : new Date().toISOString().split('T')[0]}"></div>
                    <div class="form-group"><label>Ngày nghiệm thu hoàn thành</label>
                        <input type="date" id="hsTransDate" value="${isEdit ? (doc.transDate || '') : ''}"></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">handshake</span> Đối tác &amp; Giá trị</div>
                <div class="form-grid">
                    <div class="form-group full-width"><label>Đối tác (Chủ đầu tư / Khách hàng / Nhà cung cấp) <span class="required">*</span></label>
                        <input type="text" id="hsSupplier" value="${isEdit ? (doc.supplier || doc.customer || '') : ''}" placeholder="Tên công ty đối tác..."></div>
                    <div class="form-group"><label>Giá trị HĐ (VNĐ)</label>
                        <input type="text" id="hsValue" value="${isEdit ? window.erpApp.formatValue(doc.value) : ''}" placeholder="Nhập số tiền..." oninput="window.erpApp.formatNumberInput(this)"></div>
                    <div class="form-group full-width"><label>Ghi chú</label>
                        <textarea id="hsNote" rows="2" placeholder="Nhập ghi chú...">${isEdit ? (doc.note || '') : ''}</textarea></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">verified_user</span> Thông tin Bảo hành</div>
                <div class="form-grid">
                    <div class="form-group"><label>Bắt đầu (Lấy từ Ngày hoàn thành)</label>
                        <input type="date" id="hsWarrantyStart" value="${isEdit ? (doc.warrantyStart || '') : ''}" readonly style="background:#f1f5f9"></div>
                    <div class="form-group"><label>Thời gian bảo hành (tháng)</label>
                        <input type="number" id="hsWarrantyPeriod" value="${isEdit ? (doc.warrantyPeriod ?? '') : ''}" placeholder="Nhập số tháng..."></div>
                    <div class="form-group"><label>Kết thúc</label>
                        <input type="date" id="hsWarrantyEnd" value="${isEdit ? (doc.warrantyEnd || '') : ''}" readonly style="background:#f1f5f9"></div>
                    <div class="form-group"><label>Giá trị bảo hành (5% HĐ)</label>
                        <input type="text" id="hsWarrantyValue" value="${isEdit ? (doc.warrantyValue ? window.erpApp.formatValue(doc.warrantyValue) : '') : ''}" placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="font-weight:700"></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">post_add</span> Phụ lục hợp đồng</div>
                <div class="form-grid">
                    <div class="form-group"><label>Ngày ký PLHĐ</label>
                        <input type="date" id="hsAppendixDate" value="${isEdit ? (doc.appendixDate || '') : ''}"></div>
                    <div class="form-group"><label>Giá trị điều chỉnh (VNĐ)</label>
                        <input type="text" id="hsAppendixValue" value="${isEdit && doc.appendixValue ? window.erpApp.formatValue(doc.appendixValue) : ''}" placeholder="Nhập số tiền..." oninput="window.erpApp.formatNumberInput(this)"></div>
                    <div class="form-group"><label>Gia hạn đến (ngày)</label>
                        <input type="date" id="hsAppendixExtend" value="${isEdit ? (doc.appendixExtend || '') : ''}"></div>
                    <div class="form-group"><label>Trạng thái</label>
                        <select id="hsAppendixStatus">
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="da-ky" ${isEdit && doc.appendixStatus === 'da-ky' ? 'selected' : ''}>Đã ký</option>
                            <option value="dang-trinh-duyet" ${isEdit && doc.appendixStatus === 'dang-trinh-duyet' ? 'selected' : ''}>Đang trình duyệt</option>
                        </select></div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">attach_file</span> File đính kèm (PDF, Word, Excel, Ảnh, ZIP)</div>
                <div class="contract-upload-area">
                    <label for="hsFileInput" class="upload-label">
                        <span class="material-icons-outlined">cloud_upload</span>
                        <span>Nhấn để chọn file hoặc kéo thả vào đây</span>
                        <span style="font-size:11px;color:var(--text-muted);font-weight:400">Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP — Tối đa 20MB/file</span>
                    </label>
                    <input type="file" id="hsFileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar" multiple onchange="window.erpApp.handleHsFileUpload(event)" style="display:none">
                </div>
                <div class="form-grid" style="margin-top:16px">
                    <div class="form-group full-width"><label>Đường Link</label>
                        <textarea id="hsFileUrl" placeholder="https://example.com/file.pdf" rows="3" style="min-height:72px"></textarea>
                        <span style="font-size:11px;color:var(--text-muted);font-weight:400">Nhập nhiều link mỗi dòng một link. Có thể thêm tên hiển thị sau dấu | như: https://... | Tên file</span></div>
                    <div style="display:flex;align-items:flex-end;gap:12px;width:100%;justify-content:space-between">
                        <div class="form-group" style="flex:1;min-width:280px">
                            <label>Tên hiển thị</label>
                            <input type="text" id="hsFileUrlName" placeholder="Tên file chung cho các link (tuỳ chọn)">
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
                            <button type="button" class="btn-save" style="padding:10px 14px;min-width:140px" onclick="window.erpApp.addHsFileLink()"><span class="material-icons-outlined">link</span> Thêm link</button>
                            <button type="button" class="btn-save" style="padding:10px 14px;min-width:140px;background:#1D4ED8;color:#fff" onclick="window.erpApp.removeAllHsLinks()"><span class="material-icons-outlined">delete_sweep</span> Xóa link</button>
                        </div>
                    </div>
                </div>
                <div id="hsFileList">${renderHsFileList(tempHsFiles, true)}</div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="window.erpApp.closeHsEditModal()">Hủy</button>
                ${isAdmin() ? `
                <button class="btn-save" onclick="window.erpApp.saveHoSo()"><span class="material-icons-outlined">save</span>${isEdit ? 'Cập nhật' : 'Lưu hồ sơ'}</button>
                ` : ''}
            </div>
        </div>`;
        document.body.appendChild(modal);

        // Initialize Flatpickr cho các trường ngày tháng định dạng DD/MM/YYYY
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
                            // 🆕 Đồng bộ ngay vào localStorage để các module khác nhận diện được
                            localStorage.setItem('erp_pmProjects', JSON.stringify(pmProjects));
                        }
                        // 🆕 Tự động đặt dự án này làm active cho module Quản lý dự án
                        pmActiveProjectId = project.id;
                    }
                    const opt = document.createElement('option');
                    opt.value = projName; opt.text = projName; opt.selected = true;
                    select.insertBefore(opt, select.lastElementChild);
                    select.value = projName;

                    showToast(`Đã tạo và kích hoạt dự án: ${projName}`, 'success');
                }, () => {
                    select.value = '';
                });
            }
        });

        // Tự động tính toán thông tin bảo hành
        const transDateInput = document.getElementById('hsTransDate');
        const warrantyStartInput = document.getElementById('hsWarrantyStart');
        const warrantyPeriodInput = document.getElementById('hsWarrantyPeriod');
        const warrantyEndInput = document.getElementById('hsWarrantyEnd');
        const contractValueInput = document.getElementById('hsValue');
        const warrantyValueInput = document.getElementById('hsWarrantyValue');

        const updateWarrantyCalculations = () => {
            if (!warrantyStartInput || !warrantyEndInput || !warrantyValueInput) { return; }
            // 1. Bắt đầu = Ngày nghiệm thu hoàn thành
            warrantyStartInput.value = transDateInput.value;
            if (warrantyStartInput._flatpickr) { warrantyStartInput._flatpickr.setDate(warrantyStartInput.value); }

            // 2. Kết thúc = Bắt đầu + Thời gian bảo hành
            if (warrantyStartInput.value && warrantyPeriodInput.value) {
                const startDate = new Date(warrantyStartInput.value);
                const months = parseInt(warrantyPeriodInput.value) || 0;
                startDate.setMonth(startDate.getMonth() + months);
                warrantyEndInput.value = startDate.toISOString().split('T')[0];
            } else {
                warrantyEndInput.value = '';
            }
            if (warrantyEndInput._flatpickr) { warrantyEndInput._flatpickr.setDate(warrantyEndInput.value); }

            // 3. Giá trị bảo hành = 5% Giá trị HĐ (chỉ tính nếu có thời gian bảo hành)
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

        // Chạy lần đầu nếu đang edit
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

            const previewBtn = `<button class="hs-file-action-btn" title="${isUrlLink ? 'Mở link' : 'Xem'}" onclick="event.stopPropagation(); ${previewFn}" style="color:#0D9488"><span class="material-icons-outlined">visibility</span></button>`;

            let fileNameHtml = `<span class="contract-file-name" style="color:var(--primary);font-weight:700">${f.name}</span>`;
            if (isUrlLink) {
                fileNameHtml = `<a href="${f.url}" target="_blank" rel="noreferrer noopener" style="color:var(--primary);font-weight:700;text-decoration:none" onclick="event.stopPropagation()">${f.name}</a>`;
            }

            const fileSizeHtml = `${typeLabel}${f.size ? ' · ' + f.size : ''}`;
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
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
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

        // Thông tin bảo hành
        const warrantyStart = document.getElementById('hsWarrantyStart').value;
        const warrantyPeriod = parseInt(document.getElementById('hsWarrantyPeriod').value) || 0;
        const warrantyEnd = document.getElementById('hsWarrantyEnd').value;
        const warrantyValueStr = document.getElementById('hsWarrantyValue').value.replace(/\D/g, '');
        const warrantyValue = parseFloat(warrantyValueStr) || 0;

        // Phụ lục hợp đồng
        const appendixDate = document.getElementById('hsAppendixDate').value;
        const appendixValueStr = document.getElementById('hsAppendixValue').value.replace(/\D/g, '');
        const appendixValue = parseFloat(appendixValueStr) || 0;
        const appendixExtend = document.getElementById('hsAppendixExtend').value;
        const appendixStatus = document.getElementById('hsAppendixStatus').value;

        if (!title || !supplier || !issueDate) { showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error'); return; }
        const payload = {
            title, category, status, project, projectPublic, storageBranch, symbol, supplier,
            customer: supplier, // Gộp chung thành 1 mục Đối tác
            value, issueDate, transDate, note,
            warrantyStart, warrantyPeriod, warrantyEnd, warrantyValue,
            appendixDate, appendixValue, appendixExtend, appendixStatus,
            files: [...tempHsFiles]
        };
        if (id) {
            const doc = hoSoDocuments.find(d => d.id === id);
            if (doc) {
                Object.assign(doc, payload);
                if (window.FileStore) { await window.FileStore.saveAllFiles('hoSoDocuments', doc.id, doc.files); }
                if (window.CrudSync) { await window.CrudSync.saveItem('hoSoDocuments', doc, 'id'); }
                // 🔄 Đồng bộ ngược lại Quản lý dự án nếu có liên kết
                syncArchiveWithContract(doc);
                showToast('Đã cập nhật hồ sơ ' + id + (doc.linkedPmId ? ` (đã đồng bộ HĐ ${doc.linkedPmId})` : ''), 'success');
            }
        } else {
            const newDoc = { id: nextHsId(), ...payload };
            hoSoDocuments.unshift(newDoc);
            if (window.FileStore) { await window.FileStore.saveAllFiles('hoSoDocuments', newDoc.id, newDoc.files); }
            if (window.CrudSync) { await window.CrudSync.saveItem('hoSoDocuments', newDoc, 'id'); }
            // 🔄 Đồng bộ sang Quản lý dự án
            syncArchiveWithContract(newDoc);
            showToast('Đã thêm hồ sơ mới', 'success');
        }
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
            <div class="modal-header"><h3><span class="material-icons-outlined" style="color:#DC2626">warning</span> Xác nhận xóa</h3>
            <button class="modal-close" onclick="window.erpApp.closeHsDeleteModal()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body" style="text-align:center;padding:24px">
                <p style="font-size:15px">Bạn có chắc muốn xóa hồ sơ <strong>${doc.id}</strong>?</p>
                <p style="color:var(--text-secondary);margin-top:8px;font-size:13px">${doc.title}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="window.erpApp.closeHsDeleteModal()">Hủy</button>
                <button class="btn-save" style="background:#DC2626" onclick="window.erpApp.deleteHoSo('${doc.id}')"><span class="material-icons-outlined">delete</span> Xóa</button>
            </div></div>`;
        document.body.appendChild(modal);
    }

    async function deleteHoSo(id) {
        if (!isAdmin()) {
            window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!', 'error');
            return;
        }

        window.erpApp.showConfirm(
            'Xác nhận xóa hồ sơ',
            'Bạn có chắc chắn muốn xóa hồ sơ này và tất cả hợp đồng liên kết?',
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

                const m = document.getElementById('hsDeleteModal');
                if (m) {
                    m.classList.add('closing');
                    setTimeout(() => m.remove(), 200);
                }
                window.erpApp.showToast('Đã xóa hồ sơ và hợp đồng liên kết.');
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
                <input class="hs2-cat-inp" style="flex:1" type="text" value="${cat.label}" placeholder="Tên danh mục" oninput="window.erpApp.updateHsCategory(${ci},'label',this.value)">
                <select class="hs2-cat-inp" onchange="window.erpApp.updateHsCategory(${ci},'color',this.value)">
                    ${COLORS.map(cl => `<option value="${cl}" ${cat.color === cl ? 'selected' : ''}>${cl}</option>`).join('')}
                </select>
                ${hsCategories.length > 1 ? `<button class="hs2-icon-btn hs2-icon-del" onclick="window.erpApp.deleteHsCategory(${ci})"><span class="material-icons-outlined">delete</span></button>` : '<div style="width:34px"></div>'}
            </div>`).join('');
        modal.innerHTML = `<div class="modal-content" style="max-width:700px">
            <div class="modal-header"><h3>Quản lý danh mục hồ sơ</h3>
            <button class="modal-close" onclick="document.getElementById('hsCatMgrModal').remove()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body">
                <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Tạo, sửa đổi và xóa danh mục theo tên và màu sắc. Thay đổi áp dụng ngay lập tức.</p>
                <div id="hsCatList">${renderList()}</div>
                <button class="hs2-add-cat-btn" onclick="window.erpApp.addHsCategory()"><span class="material-icons-outlined">add_circle_outline</span> Thêm danh mục mới</button>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('hsCatMgrModal').remove()">Đóng</button>
                <button class="btn-save" onclick="document.getElementById('hsCatMgrModal').remove();renderLuuTruHoSo()"><span class="material-icons-outlined">check</span> Áp dụng thay đổi</button>
            </div></div>`;
        document.body.appendChild(modal);
    }


    // ==========================================
    // MODULE: Quản lý công văn (CRUD đầy đủ)
    // ==========================================

    // ---- Danh mục công văn (tương tự Hồ sơ) ----
    let cvCategories = [
        { id: 'den', label: 'Công văn đến', icon: 'mail', color: '#2563EB', bg: '#EFF6FF' },
        { id: 'di', label: 'Công văn đi', icon: 'send', color: '#16A34A', bg: '#F0FDF4' },
        { id: 'noi-bo', label: 'Nội bộ', icon: 'swap_horiz', color: '#7C3AED', bg: '#F5F3FF' },
        { id: 'mat', label: 'Công văn mật', icon: 'lock', color: '#DC2626', bg: '#FEF2F2' },
        { id: 'khan', label: 'Công văn khẩn', icon: 'priority_high', color: '#EA580C', bg: '#FFF7ED' },
    ];

    // cvProjects has been moved to global declaration at the top to support persistence
    // Initial demo values: ['Sunrise Tower', 'Green Valley', 'Dự án Metro', 'Văn phòng HQ', 'Kho Bình Dương', 'Tổng công ty', 'Sản xuất']
    // These are now handled via loadLocal('cvProjects', [...]) at line 227



    let cvSearchQuery = '';
    let cvCurrentPage = 1;
    let cvActiveTab = 'all';
    let cvFilterProject = '';
    let cvFilterDept = '';
    let cvSortOrder = 'desc';
    const cvPageSize = 10;
    let tempCvFiles = [];

    function getCvCatById(id) { return cvCategories.find(c => c.id === id) || { label: id, icon: 'description', color: '#64748B', bg: '#F1F5F9' }; }

    function getCvTypeLabel(t) { return { 'den': 'Công văn đến', 'di': 'Công văn đi', 'noi-bo': 'Nội bộ' }[t] || t; }
    function getCvTypeColor(t) { return { 'den': 'blue', 'di': 'green', 'noi-bo': 'purple' }[t] || 'gray'; }
    function getCvTypeIcon(t) { return { 'den': 'mail', 'di': 'send', 'noi-bo': 'swap_horiz' }[t] || 'description'; }
    function getCvStatusLabel(s) { return { 'cho-xu-ly': 'Chờ xử lý', 'dang-xu-ly': 'Đang xử lý', 'da-xu-ly': 'Đã xử lý', 'da-gui': 'Đã gửi', 'da-duyet': 'Đã duyệt' }[s] || s; }
    function getCvStatusColor(s) { return { 'cho-xu-ly': 'orange', 'dang-xu-ly': 'blue', 'da-xu-ly': 'green', 'da-gui': 'teal', 'da-duyet': 'green' }[s] || 'gray'; }
    function getCvPriorityLabel(p) { return { 'cao': 'Cao', 'trung-binh': 'Trung bình', 'thap': 'Thấp' }[p] || p; }
    function getCvPriorityColor(p) { return { 'cao': 'red', 'trung-binh': 'orange', 'thap': 'blue' }[p] || 'gray'; }
    function nextCvId() {
        const nums = congVanList.map(c => {
            const parts = c.id.split('/');
            if (parts.length < 2) { return 0; }
            const n = parseInt(parts[parts.length - 1], 10);
            return isNaN(n) ? 0 : n;
        });
        return 'CV-2026/' + (Math.max(...nums, 0) + 1);
    }

    function getFilteredCongVan() {
        let data = [...congVanList];
        if (cvActiveTab !== 'all') { data = data.filter(c => c.type === cvActiveTab); }
        if (cvFilterProject) { data = data.filter(c => c.project === cvFilterProject); }
        if (cvFilterDept) { data = data.filter(c => (c.department || '').toLowerCase().includes(cvFilterDept.toLowerCase())); }

        const q = cvSearchQuery.toLowerCase().trim();
        if (q) {
            data = data.filter(c =>
                c.id.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q) ||
                (c.sender || '').toLowerCase().includes(q) ||
                (c.receiver || '').toLowerCase().includes(q) ||
                (c.project || '').toLowerCase().includes(q) ||
                (c.department || '').toLowerCase().includes(q) ||
                getCvCatById(c.type).label.toLowerCase().includes(q)
            );
        }

        data.sort((a, b) => {
            const dateA = new Date(a.issueDate || '1970-01-01');
            const dateB = new Date(b.issueDate || '1970-01-01');
            return cvSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        return data;
    }

    // ==========================================
    // MODULE: Quản lý văn phòng (Redesigned)
    // ==========================================


    // Không tải dữ liệu mẫu cho erpOfficeEquipment nữa

    window.erpApp.renderOfficeManagement = function (branchFilter = 'all') {
        breadcrumbCurrent.textContent = 'Quản lý văn phòng';
        pageBadge.textContent = 'Hành chính';

        // Source branches from the global 'branches' variable (defined at line 9173)
        // Map branches for the filter chips (adding icons and colors)
        const branchOptions = [
            { id: 'all', name: 'Tất cả chi nhánh', color: '#64748B', icon: 'apps' },
            ...branches.map(b => ({
                id: b.id,
                name: b.name,
                color: b.id === 'CN003' ? '#3B82F6' : (b.id === 'CN002' ? '#EF4444' : '#10B981'),
                icon: 'location_city'
            }))
        ];

        const filtered = branchFilter === 'all' ? erpOffices : erpOffices.filter(o => o.branch === branchFilter);

        // Stats
        const total = erpOffices.length;
        const active = erpOffices.filter(o => o.status === 'active').length;
        const totalAssets = erpOffices.reduce((sum, o) => sum + (o.assets ? o.assets.length : 0), 0);

        let html = `
        <style>
            .om-container { padding: 20px; animation: fadeIn 0.4s ease; }
            .om-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
            .om-stat-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .om-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; }
            
            .om-branch-selector { display: flex; gap: 10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 10px; }
            .om-branch-chip { padding: 8px 20px; border-radius: 50px; background: #fff; border: 1.5px solid var(--border-color); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; transition: all 0.2s; white-space: nowrap; }
            .om-branch-chip:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
            .om-branch-chip.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 4px 12px rgba(74,124,255,0.3); }

            .om-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
            .om-card { background: #fff; border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
            .om-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
            
            .om-card-header { position: relative; height: 180px; background: #f1f5f9; overflow: hidden; }
            .om-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
            .om-card:hover .om-card-img { transform: scale(1.1); }
            .om-status-badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; backdrop-filter: blur(4px); }
            
            .om-card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
            .om-card-branch { font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .om-card-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
            .om-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4; }
            
            .om-card-features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
            .om-feature-tag { padding: 4px 8px; background: #f8fafc; border-radius: 6px; font-size: 11px; color: #64748b; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 4px; }
            
            .om-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid #f1f5f9; background: #fafafa; }
            .om-capacity { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b; }
            .om-book-btn { padding: 8px 16px; background: var(--primary); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
            .om-book-btn:hover { background: var(--primary-dark); transform: scale(1.05); }

            .om-status-pulse { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
            
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
            .pulse-green { animation: pulse 2s infinite; }
        </style>

        <div class="om-container">
            <div class="employee-toolbar">
                <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')"><span class="material-icons-outlined">arrow_back</span> Quay lại</button>
                <div style="flex:1"></div>
                ${isAdmin() ? '<button class="btn-add-employee" onclick="window.erpApp.openOfficeModal()"><span class="material-icons-outlined">add</span> Thêm văn phòng</button>' : ''}
            </div>

            <div class="om-stats">
                <div class="om-stat-card">
                    <div class="om-stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB)"><span class="material-icons-outlined">business</span></div>
                    <div><div style="font-size:24px;font-weight:700">${total}</div><div style="font-size:12px;color:var(--text-muted)">Văn phòng/Chi nhánh</div></div>
                </div>
                <div class="om-stat-card">
                    <div class="om-stat-icon" style="background: linear-gradient(135deg, #10B981, #059669)"><span class="material-icons-outlined">check_circle</span></div>
                    <div><div style="font-size:24px;font-weight:700">${active}</div><div style="font-size:12px;color:var(--text-muted)">Đang hoạt động</div></div>
                </div>
                <div class="om-stat-card">
                    <div class="om-stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706)"><span class="material-icons-outlined">inventory_2</span></div>
                    <div><div style="font-size:24px;font-weight:700">${totalAssets}</div><div style="font-size:12px;color:var(--text-muted)">Tổng loại tài sản</div></div>
                </div>
                <div class="om-stat-card">
                    <div class="om-stat-icon" style="background: linear-gradient(135deg, #7C3AED, #6D28D9)"><span class="material-icons-outlined">verified_user</span></div>
                    <div><div style="font-size:24px;font-weight:700">100%</div><div style="font-size:12px;color:var(--text-muted)">Đã kiểm kê</div></div>
                </div>
            </div>

            <div class="om-branch-selector">
                ${branchOptions.map(b => `
                    <div class="om-branch-chip ${branchFilter === b.id ? 'active' : ''}" onclick="window.erpApp.renderOfficeManagement('${b.id}')">
                        <span class="material-icons-outlined" style="font-size:18px">${b.icon}</span>
                        ${b.name}
                    </div>
                `).join('')}
            </div>

            <div class="om-grid">
                ${filtered.map(o => {
            const b = branches.find(br => br.id === o.branch) || { name: 'Không xác định', color: '#64748B' };
            const bColor = o.branch === 'CN003' ? '#3B82F6' : (o.branch === 'CN002' ? '#EF4444' : '#10B981');
            const statusText = o.status === 'active' ? 'Hoạt động' : 'Bảo trì';
            const statusColor = o.status === 'active' ? '#10B981' : '#F59E0B';

            return `
                    <div class="om-card">
                        <div class="om-card-header">
                            <img src="${o.img}" class="om-card-img" alt="${o.name}">
                            <div class="om-status-badge" style="background:${statusColor}cc">${statusText}</div>
                             ${isAdmin() ? `
                             <button onclick="window.erpApp.openEditOfficeModal(${o.id})" style="position:absolute; top:12px; left:12px; width:32px; height:32px; border-radius:10px; background:rgba(255,255,255,0.9); border:none; color:#64748b; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition:all 0.2s" onmouseover="this.style.color='var(--primary)'; this.style.transform='scale(1.1)'" onmouseout="this.style.color='#64748b'; this.style.transform='scale(1)'">
                                 <span class="material-icons-outlined" style="font-size:18px">edit</span>
                             </button>
                             <button onclick="window.erpApp.deleteOffice(${o.id})" style="position:absolute; top:12px; left:50px; width:32px; height:32px; border-radius:10px; background:rgba(255,255,255,0.9); border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition:all 0.2s" onmouseover="this.style.background='#fee2e2'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='scale(1)'">
                                 <span class="material-icons-outlined" style="font-size:18px">delete</span>
                             </button>
                             ` : ''}
                        </div>
                        <div class="om-card-content">
                            <div class="om-card-branch" style="color:${bColor}">${b.name}</div>
                            <div class="om-card-title">${o.name}</div>
                            <div class="om-card-desc" style="display:flex; align-items:flex-start; gap:4px; margin-bottom:8px">
                                <span class="material-icons-outlined" style="font-size:14px; color:var(--primary)">location_on</span>
                                <span>${o.address}</span>
                            </div>
                            <div class="om-card-desc">${o.desc}</div>
                            <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:8px">Danh mục tài sản:</div>
                            <div class="om-card-features">
                                ${o.assets.map(a => `<span class="om-feature-tag"><span class="material-icons-outlined" style="font-size:12px">inventory_2</span>${a}</span>`).join('')}
                            </div>
                        </div>
                        <div class="om-card-footer">
                            <div class="om-capacity">
                                <span class="material-icons-outlined" style="font-size:18px">qr_code_2</span>
                                <span>Mã: VP-${o.id}</span>
                            </div>
                            <button class="om-book-btn" onclick="window.erpApp.openAssetDetailsModal(${o.id})">Quản lý tài sản</button>
                        </div>
                    </div>
                    `;
        }).join('')}
            </div>
        </div>
        `;

        pageContent.innerHTML = html;
    };

    // ==========================================
    // MODULE: Quản lý thiết bị văn phòng (New)
    // ==========================================
    window.erpApp.renderOfficeEquipmentManagement = function (officeFilter = 'all', catFilter = 'all') {
        breadcrumbCurrent.textContent = 'Quản lý thiết bị';
        pageBadge.textContent = 'Hành chính';

        const filtered = erpOfficeEquipment.filter(e => {
            const matchOffice = officeFilter === 'all' || e.officeId == officeFilter;
            const matchCat = catFilter === 'all' || e.type === catFilter;
            return matchOffice && matchCat;
        });

        const categories = [...new Set(erpOfficeEquipment.map(e => e.type))];
        const offices = erpOffices;

        // Stats
        const total = erpOfficeEquipment.length;
        const totalValue = erpOfficeEquipment.reduce((sum, e) => sum + e.value, 0);
        const repairing = erpOfficeEquipment.filter(e => e.status === 'repairing').length;

        // Data for Chart
        const statusCounts = {
            using: erpOfficeEquipment.filter(e => e.status === 'using').length,
            repairing: erpOfficeEquipment.filter(e => e.status === 'repairing').length,
            new: erpOfficeEquipment.filter(e => e.status === 'new').length
        };
        const pUsing = (statusCounts.using / total * 100) || 0;
        const pRepairing = (statusCounts.repairing / total * 100) || 0;

        let html = `
        <div class="om-container" style="padding:20px; animation:fadeIn 0.4s ease;">
            <div class="employee-toolbar" style="margin-bottom:24px">
                <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')"><span class="material-icons-outlined">arrow_back</span> Quay lại</button>
                <div style="flex:1"></div>
                ${isAdmin() ? '<button class="btn-add-employee" onclick="window.erpApp.openEquipmentModal()"><span class="material-icons-outlined">add</span> Thêm thiết bị</button>' : ''}
            </div>

            <div style="display:flex; gap:24px; margin-bottom:32px; flex-wrap:wrap">
                <!-- Left: Stats Cards -->
                <div style="flex:3; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px">
                    <div class="premium-stat-card">
                        <div class="premium-stat-icon-box" style="background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4)">
                            <span class="material-icons-outlined">devices</span>
                        </div>
                        <div class="premium-stat-info">
                            <h3>Tổng thiết bị</h3>
                            <div class="stat-value">${total}</div>
                        </div>
                        <div class="premium-stat-trend trend-up">
                            <span class="material-icons-outlined" style="font-size:14px">trending_up</span> 12%
                        </div>
                    </div>
                    
                    <div class="premium-stat-card">
                        <div class="premium-stat-icon-box" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4)">
                            <span class="material-icons-outlined">payments</span>
                        </div>
                        <div class="premium-stat-info">
                            <h3>Tổng giá trị</h3>
                            <div class="stat-value">${(totalValue / 1000000).toFixed(1)}<span style="font-size:14px; font-weight:500; color:#94a3b8; margin-left:4px">M</span></div>
                        </div>
                    </div>

                    <div class="premium-stat-card">
                        <div class="premium-stat-icon-box" style="background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4)">
                            <span class="material-icons-outlined">build</span>
                        </div>
                        <div class="premium-stat-info">
                            <h3>Đang bảo trì</h3>
                            <div class="stat-value">${repairing}</div>
                        </div>
                    </div>

                    <div class="premium-stat-card">
                        <div class="premium-stat-icon-box" style="background: linear-gradient(135deg, #ec4899, #db2777); box-shadow: 0 10px 20px -5px rgba(236, 72, 153, 0.4)">
                            <span class="material-icons-outlined">verified</span>
                        </div>
                        <div class="premium-stat-info">
                            <h3>Tỉ lệ khả dụng</h3>
                            <div class="stat-value">98<span style="font-size:14px; font-weight:500; color:#94a3b8; margin-left:2px">%</span></div>
                        </div>
                    </div>
                </div>

                <!-- Right: Distribution Chart -->
                <div class="premium-stat-card" style="flex:1; min-width:300px; justify-content: space-between; padding: 16px 24px">
                    <div class="premium-stat-info">
                        <h3 style="margin-bottom:8px">Trạng thái</h3>
                        <div style="display:flex; flex-direction:column; gap:6px">
                            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#475569">
                                <span style="width:8px; height:8px; border-radius:50%; background:#10b981"></span> Sử dụng: ${statusCounts.using}
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#475569">
                                <span style="width:8px; height:8px; border-radius:50%; background:#f59e0b"></span> Bảo trì: ${statusCounts.repairing}
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#475569">
                                <span style="width:8px; height:8px; border-radius:50%; background:#3b82f6"></span> Trong kho: ${statusCounts.new}
                            </div>
                        </div>
                    </div>
                    <div class="donut-chart-container" style="width:90px; height:90px">
                        <div class="donut-chart" style="--chart-color-1: #10b981; --chart-p-1: ${pUsing}%; --chart-color-2: #f59e0b; --chart-p-2: ${pUsing + pRepairing}%; --chart-color-3: #3b82f6;">
                            <div style="font-size:15px; font-weight:800; color:#1e293b">${total}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="background:#fff; border-radius:24px; border:1px solid #f1f5f9; box-shadow:0 10px 25px -5px rgba(0,0,0,0.03); overflow:hidden">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#fcfdfe">
                    <div style="display:flex; gap:16px; align-items:center">
                        <div style="position:relative">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:20px">search</span>
                            <input type="text" placeholder="Tìm tên thiết bị, người dùng..." onkeyup="window.erpApp.filterEquipment(this.value)" style="width:300px; padding:10px 16px 10px 40px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:13px; outline:none; transition:all 0.2s" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 0 4px rgba(59,130,246,0.1)'" onblur="this.style.borderColor='#e2e8f0'">
                        </div>
                        <select onchange="window.erpApp.renderOfficeEquipmentManagement(this.value, '${catFilter}')" class="premium-input" style="width:180px; margin:0; padding:10px">
                            <option value="all">Tất cả văn phòng</option>
                            ${offices.map(o => `<option value="${o.id}" ${officeFilter == o.id ? 'selected' : ''}>${o.name}</option>`).join('')}
                        </select>
                        <select onchange="window.erpApp.renderOfficeEquipmentManagement('${officeFilter}', this.value)" class="premium-input" style="width:180px; margin:0; padding:10px">
                            <option value="all">Tất cả loại thiết bị</option>
                            ${categories.map(c => `<option value="${c}" ${catFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div style="color:#64748b; font-size:13px">Hiển thị <strong>${filtered.length}</strong> thiết bị</div>
                </div>

                <div style="overflow-x:auto">
                    <table style="width:100%; border-collapse:collapse">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:1px solid #f1f5f9">
                                <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Thông tin thiết bị</th>
                                <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Văn phòng</th>
                                <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Người sử dụng</th>
                                <th style="padding:16px 24px; text-align:left; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Phòng ban</th>
                                <th style="padding:16px 24px; text-align:right; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Giá trị</th>
                                <th style="padding:16px 24px; text-align:center; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Trạng thái</th>
                                <th style="padding:16px 24px; text-align:right; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(item => {
            const office = offices.find(o => o.id == item.officeId) || { name: 'N/A' };
            const statusColors = {
                'using': { bg: '#f0fdf4', text: '#10b981', label: 'Đang sử dụng' },
                'repairing': { bg: '#fffbeb', text: '#f59e0b', label: 'Đang bảo trì' },
                'liquidated': { bg: '#fef2f2', text: '#ef4444', label: 'Đã thanh lý' },
                'new': { bg: '#eff6ff', text: '#3b82f6', label: 'Mới/Trong kho' }
            };
            const st = statusColors[item.status] || { bg: '#f1f5f9', text: '#64748b', label: item.status };
            const emp = employees.find(e => e.name === item.user);
            const dept = item.department || (emp ? emp.department : '—');

            return `
                                <tr class="om-table-row" style="border-bottom:1px solid #f1f5f9; transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:16px 24px">
                                        <div style="display:flex; align-items:center; gap:12px">
                                            <div style="width:44px; height:44px; border-radius:12px; background:#f1f5f9; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden">
                                                <img src="${window.erpApp.transformImageUrl(item.img)}" 
                                                     data-img="${item.img}"
                                                     onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                                                     onerror="window.erpApp.handleImageError(this, this.dataset.img)" 
                                                     style="width:100%; height:100%; object-fit:cover">
                                            </div>
                                            <div>
                                                <div onclick="window.erpApp.viewEquipmentDetail('${item.id}')" style="font-weight:700; color:#1e293b; font-size:14px; cursor:pointer" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='#1e293b'">${item.name}</div>
                                                <div style="font-size:12px; color:#64748b">${item.type} • ID: ${item.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding:16px 24px; font-size:13px; color:#1e293b; font-weight:600">${office.name}</td>
                                    <td style="padding:16px 24px">
                                        <div style="display:flex; align-items:center; gap:8px">
                                            <div style="width:28px; height:28px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:12px; font-weight:700">
                                                ${item.user ? item.user.split(' ').pop()[0] : '?'}
                                            </div>
                                            <span style="font-size:13px; color:#475569">${item.user || '—'}</span>
                                        </div>
                                    </td>
                                    <td style="padding:16px 24px; font-size:13px; color:#475569">${dept}</td>
                                    <td style="padding:16px 24px; text-align:right; font-weight:700; color:#1e293b; font-size:14px">
                                        ${window.erpApp.formatValue(item.value)} <span style="font-size:11px; color:#94a3b8">đ</span>
                                    </td>
                                    <td style="padding:16px 24px; text-align:center">
                                        <span style="padding:4px 12px; border-radius:50px; font-size:11px; font-weight:700; background:${st.bg}; color:${st.text}">${st.label}</span>
                                    </td>
                                    <td style="padding:16px 24px; text-align:right">
                                        <div style="display:flex; justify-content:flex-end; gap:8px">
                                            <button onclick="window.erpApp.viewEquipmentDetail('${item.id}')" class="btn-icon-action" style="color:#10b981" title="Xem chi tiết">
                                                <span class="material-icons-outlined" style="font-size:18px">visibility</span>
                                            </button>
                                            ${isAdmin() ? `
                                            <button onclick="window.erpApp.openEquipmentModal('${item.id}')" class="btn-icon-action" style="color:#6366f1" title="Chỉnh sửa">
                                                <span class="material-icons-outlined" style="font-size:18px">edit</span>
                                            </button>
                                            <button onclick="window.erpApp.deleteEquipment('${item.id}')" class="btn-icon-action" style="color:#ef4444" title="Xóa">
                                                <span class="material-icons-outlined" style="font-size:18px">delete</span>
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

        <style>
            .btn-icon-action { width:32px; height:32px; border-radius:8px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
            .btn-icon-action:hover { background:rgba(0,0,0,0.05); transform:scale(1.1); }
        </style>
        `;

        pageContent.innerHTML = html;
    };

    window.erpApp.filterEquipment = function (q) {
        const query = q.toLowerCase();
        const rows = document.querySelectorAll('.om-table-row');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    };

    window.erpApp.formatCurrencyInput = function (input) {
        let value = input.value.replace(/\D/g, '');
        if (value === '') { input.value = ''; return; }
        input.value = parseInt(value).toLocaleString('vi-VN');
    };

    window.erpApp.openEquipmentModal = function (equipmentId = null) {
        const item = equipmentId ? erpOfficeEquipment.find(e => e.id === equipmentId) : null;
        const offices = erpOffices;
        const employeeList = window.erpApp._getData('employees') || [];
        const categories = [...new Set(erpOfficeEquipment.map(e => e.type))];

        const modalHtml = `
        <div class="premium-modal-overlay" id="equipmentModal">
            <div class="premium-modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <div style="display:flex; align-items:center; gap:16px">
                        <div class="modal-icon-box" style="background: linear-gradient(135deg, #6366F1, #4F46E5)">
                            <span class="material-icons-outlined">${item ? 'edit' : 'add_to_queue'}</span>
                        </div>
                        <div>
                            <h2>${item ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</h2>
                            <p>${item ? 'Mã định danh: ' + item.id : 'Cung cấp thông tin tài sản văn phòng'}</p>
                        </div>
                    </div>
                    <button class="modal-close-btn" onclick="document.getElementById('equipmentModal').remove()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="equipmentForm" style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Tên thiết bị</label>
                            <input type="text" name="name" class="premium-input" value="${item ? item.name : ''}" placeholder="VD: MacBook Pro 14 M3" required>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Loại thiết bị</label>
                            <input type="text" name="type" class="premium-input" value="${item ? item.type : ''}" list="catList" placeholder="Chọn hoặc nhập mới" required>
                            <datalist id="catList">
                                ${categories.map(c => `<option value="${c}">`).join('')}
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Văn phòng</label>
                            <select name="officeId" class="premium-input" required>
                                ${offices.map(o => `<option value="${o.id}" ${item && item.officeId == o.id ? 'selected' : ''}>${o.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Người sử dụng</label>
                            <input type="text" name="user" class="premium-input" value="${item ? item.user : ''}" list="employeeList" placeholder="Chọn nhân viên">
                            <datalist id="employeeList">
                                ${employeeList.map(e => `<option value="${e.name}">`).join('')}
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Phòng ban</label>
                            <select name="department" class="premium-input">
                                <option value="">— Chọn phòng ban —</option>
                                ${departments.map(d => `<option value="${d.name}" ${item && item.department === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Giá trị (VNĐ)</label>
                            <input type="text" name="value" class="premium-input" 
                                value="${item ? item.value.toLocaleString('vi-VN') : ''}" 
                                oninput="window.erpApp.formatCurrencyInput(this)" 
                                placeholder="Nhập số tiền" required>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Ngày mua</label>
                            <input type="date" name="purchaseDate" class="premium-input" value="${item ? item.purchaseDate : ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Trạng thái</label>
                            <select name="status" class="premium-input">
                                <option value="using" ${item && item.status === 'using' ? 'selected' : ''}>Đang sử dụng</option>
                                <option value="repairing" ${item && item.status === 'repairing' ? 'selected' : ''}>Đang bảo trì</option>
                                <option value="new" ${item && item.status === 'new' ? 'selected' : ''}>Mới/Trong kho</option>
                                <option value="liquidated" ${item && item.status === 'liquidated' ? 'selected' : ''}>Đã thanh lý</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Hình ảnh thiết bị (URL)</label>
                            <div style="display:flex; gap:8px; align-items:flex-end">
                                <input type="text" name="img" id="imgUrlInput" class="premium-input" value="${item ? item.img : ''}" placeholder="Link ảnh từ Unsplash, Google Photos, hoặc server" style="flex:1">
                                <button type="button" onclick="window.erpApp.previewImageUrl(document.getElementById('imgUrlInput').value)" class="premium-btn-secondary" style="white-space:nowrap; padding:8px 16px; height:40px">
                                    <span class="material-icons-outlined" style="font-size:18px; display:flex; align-items:center; justify-content:center">preview</span>
                                </button>
                            </div>
                            <div style="font-size:12px; color:#94a3b8; margin-top:8px">💡 Hỗ trợ: Google Drive, Google Photos, Unsplash, hoặc bất kỳ URL ảnh công khai nào</div>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Hóa đơn thiết bị (URL)</label>
                            <input type="text" name="invoiceUrl" class="premium-input" value="${item ? item.invoiceUrl : ''}" placeholder="Link file hóa đơn (PDF, Image...)">
                        </div>
                        <input type="hidden" name="id" value="${item ? item.id : ''}">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="premium-btn-secondary" onclick="document.getElementById('equipmentModal').remove()">Hủy bỏ</button>
                    <button class="premium-btn-primary" onclick="window.erpApp.saveEquipment()" style="background:linear-gradient(135deg, #1e293b, #0f172a)">Lưu thiết bị</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.previewImageUrl = function (imageUrl) {
        if (!imageUrl || imageUrl.trim() === '') {
            showToast('Vui lòng nhập URL ảnh!', 'warning');
            return;
        }

        const transformedUrl = window.erpApp.transformImageUrl(imageUrl);

        const previewHtml = `
        <div class="premium-modal-overlay" id="imagePreviewModal" style="z-index:10000">
            <div class="premium-modal-content" style="max-width:600px; padding:0">
                <div class="modal-header">
                    <h2>Xem trước hình ảnh</h2>
                    <button class="modal-close-btn" onclick="document.getElementById('imagePreviewModal').remove()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div style="padding:20px; text-align:center; background:#f8fafc; min-height:300px; display:flex; align-items:center; justify-content:center; border-radius:8px">
                    <img src="${transformedUrl}" 
                         data-img="${imageUrl}"
                         onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                         onerror="this.src='https://placehold.co/400x300/f1f5f9/64748b?text=Loi+tai+hinh'; this.title='Không thể tải hình ảnh từ URL này'" 
                         style="max-width:100%; max-height:300px; border-radius:6px; object-fit:contain"
                         title="Xem trước">
                </div>
                <div style="padding:20px; background:#fff">
                    <div style="font-size:12px; color:#64748b; word-break:break-all; background:#f1f5f9; padding:12px; border-radius:6px; margin-bottom:12px">
                        <strong>URL gốc:</strong> ${imageUrl}
                    </div>
                    ${transformedUrl !== imageUrl ? `<div style="font-size:12px; color:#64748b; word-break:break-all; background:#f0fdf4; padding:12px; border-radius:6px">
                        <strong>URL đã xử lý:</strong> ${transformedUrl.substring(0, 100)}...
                    </div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="premium-btn-secondary" onclick="document.getElementById('imagePreviewModal').remove()">Đóng</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', previewHtml);
    };

    window.erpApp.saveEquipment = function () {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const form = document.getElementById('equipmentForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const formData = new FormData(form);
        const id = formData.get('id');

        const data = {
            id: id || 'TBVP-' + Date.now().toString().slice(-4),
            name: formData.get('name'),
            type: formData.get('type'),
            officeId: parseInt(formData.get('officeId')),
            user: formData.get('user'),
            value: parseInt(formData.get('value').replace(/\D/g, '')) || 0,
            purchaseDate: formData.get('purchaseDate'),
            status: formData.get('status'),
            img: window.erpApp.transformImageUrl(formData.get('img')) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
            department: formData.get('department'),
            invoiceUrl: formData.get('invoiceUrl')
        };

        if (id) {
            const idx = erpOfficeEquipment.findIndex(e => e.id === id);
            if (idx > -1) { erpOfficeEquipment[idx] = data; }
        } else {
            erpOfficeEquipment.unshift(data);
        }

        // Persistence
        localStorage.setItem('erp_erpOfficeEquipment', JSON.stringify(erpOfficeEquipment));
        if (window.CrudSync && typeof window.CrudSync.saveItem === 'function') {
            window.CrudSync.saveItem('erpOfficeEquipment', data);
        }

        document.getElementById('equipmentModal').remove();
        window.erpApp.renderOfficeEquipmentManagement();
        showToast('Đã lưu thông tin thiết bị!', 'success');

        window.erpApp.notifyCRUD('Thiết bị', id ? 'update' : 'add', {
            name: data.name,
            page: 'hanh-chinh',
            module: 'Quản lý thiết bị'
        });
    };

    window.erpApp.deleteEquipment = function (id) {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const item = erpOfficeEquipment.find(e => e.id === id);
        if (!item) { return; }

        const modalHtml = `
        <div class="premium-modal-overlay" id="deleteConfirmModal" style="z-index:9999">
            <div class="premium-modal-content" style="max-width:400px; text-align:center; padding:32px">
                <div style="width:64px; height:64px; border-radius:50%; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#ef4444">
                    <span class="material-icons-outlined" style="font-size:32px">warning_amber</span>
                </div>
                <h2 style="margin-bottom:8px; font-size:20px; font-weight:800; color:#1e293b">Xác nhận xóa?</h2>
                <p style="color:#64748b; font-size:14px; margin-bottom:24px; line-height:1.6">
                    Bạn có chắc chắn muốn xóa thiết bị <strong style="color:#1e293b">${item.name}</strong>? 
                    Hành động này không thể hoàn tác.
                </p>
                <div style="display:flex; gap:12px; justify-content:center">
                    <button class="premium-btn-secondary" onclick="document.getElementById('deleteConfirmModal').remove()" style="flex:1">Hủy bỏ</button>
                    <button class="premium-btn-primary" onclick="window.erpApp.executeDeleteEquipment('${id}')" style="background:#ef4444; flex:1">Xóa ngay</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.viewEquipmentDetail = function (equipmentId) {
        const item = erpOfficeEquipment.find(e => e.id === equipmentId);
        if (!item) { return; }

        const modalHtml = `
        <div class="premium-modal-overlay" id="equipmentDetailModal" style="background:rgba(15,23,42,0.4); backdrop-filter:blur(12px); z-index:9999">
            <div class="premium-modal-content" style="max-width:700px; padding:0; background:rgba(255,255,255,0.9); border:1px solid rgba(255,255,255,0.3)">
                <div style="position:relative; height:280px; background:#f1f5f9">
                    <img src="${window.erpApp.transformImageUrl(item.img)}" 
                         data-img="${item.img}"
                         onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                         onerror="window.erpApp.handleImageError(this, this.dataset.img)" 
                         style="width:100%; height:100%; object-fit:cover">
                    <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))"></div>
                    <button onclick="document.getElementById('equipmentDetailModal').remove()" style="position:absolute; top:20px; right:20px; width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px)">
                        <span class="material-icons-outlined">close</span>
                    </button>
                    <div style="position:absolute; bottom:30px; left:30px; right:30px">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end">
                            <div>
                                <span style="background:var(--primary); color:#fff; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; display:inline-block">
                                    ${item.type}
                                </span>
                                <h1 style="color:#fff; margin:0; font-size:28px; font-weight:900">${item.name}</h1>
                                <p style="color:rgba(255,255,255,0.7); margin:8px 0 0 0; font-size:14px">ID: ${item.id} • Cập nhật lần cuối: ${new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div style="text-align:right">
                                <span style="display:block; color:rgba(255,255,255,0.6); font-size:11px; font-weight:800; margin-bottom:4px">TRẠNG THÁI</span>
                                <div style="padding:8px 20px; border-radius:30px; background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); color:#fff; font-weight:700; font-size:13px; border:1px solid rgba(255,255,255,0.3)">
                                    ${item.status === 'using' ? 'Đang sử dụng' : item.status === 'repairing' ? 'Đang bảo trì' : 'Trong kho'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="padding:40px; display:grid; grid-template-columns:1fr 1fr; gap:30px">
                    <div class="detail-info-card" style="padding:20px; border-radius:20px; background:#f8fafc; border:1px solid #f1f5f9">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
                            <span class="material-icons-outlined" style="color:var(--primary)">business</span>
                            <span style="font-weight:800; color:#1e293b; font-size:14px">Vị trí & Quản lý</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px">
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-size:13px; color:#64748b">Văn phòng:</span>
                                <span style="font-size:13px; font-weight:700; color:#1e293b">${(window.erpApp._getData('erpOffices').find(o => o.id == item.officeId) || {}).name || '—'}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-size:13px; color:#64748b">Phòng ban:</span>
                                <span style="font-size:13px; font-weight:700; color:#1e293b">${item.department || '—'}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-size:13px; color:#64748b">Người sử dụng:</span>
                                <span style="font-size:13px; font-weight:700; color:#1e293b">${item.user || 'Chưa bàn giao'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-info-card" style="padding:20px; border-radius:20px; background:#f8fafc; border:1px solid #f1f5f9">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
                            <span class="material-icons-outlined" style="color:#10b981">payments</span>
                            <span style="font-weight:800; color:#1e293b; font-size:14px">Tài chính & Hồ sơ</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px">
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-size:13px; color:#64748b">Giá trị:</span>
                                <span style="font-size:13px; font-weight:800; color:#10b981">${window.erpApp.fmtCurrencyFull(item.value)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-size:13px; color:#64748b">Ngày mua:</span>
                                <span style="font-size:13px; font-weight:700; color:#1e293b">${window.erpApp.formatDate(item.purchaseDate)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center">
                                <span style="font-size:13px; color:#64748b">Hóa đơn:</span>
                                ${item.invoiceUrl ? `
                                    <a href="${item.invoiceUrl}" target="_blank" style="display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#6366f1; text-decoration:none">
                                        <span class="material-icons-outlined" style="font-size:16px">receipt_long</span> Xem hóa đơn
                                    </a>
                                ` : '<span style="font-size:12px; color:#94a3b8">Chưa đính kèm</span>'}
                            </div>
                        </div>
                    </div>
                </div>
                <div style="padding:20px 40px 40px; display:flex; gap:12px">
                    <button onclick="document.getElementById('equipmentDetailModal').remove()" style="flex:1; padding:12px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; color:#64748b; font-weight:700; cursor:pointer; transition:all 0.2s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.executeDeleteEquipment = function (id) {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        erpOfficeEquipment = erpOfficeEquipment.filter(e => e.id !== id);

        if (window.CrudSync && typeof window.CrudSync.deleteItem === 'function') {
            window.CrudSync.deleteItem('erpOfficeEquipment', id);
        }
        localStorage.setItem('erp_erpOfficeEquipment', JSON.stringify(erpOfficeEquipment));

        const modal = document.getElementById('deleteConfirmModal');
        if (modal) { modal.remove(); }

        window.erpApp.renderOfficeEquipmentManagement();
        showToast('Đã xóa thiết bị thành công.', 'warning');

        window.erpApp.notifyCRUD('Thiết bị', 'delete', {
            name: item.name,
            page: 'hanh-chinh',
            module: 'Quản lý thiết bị'
        });
    };

    window.erpApp.openOfficeModal = function () {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const modalHtml = `
 Broadway        <div class="premium-modal-overlay" id="officeModal">
            <div class="premium-modal-content" style="max-width:560px;">
                <div class="modal-header" style="padding:32px; background:#fff; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9">
                    <div style="display:flex; align-items:center; gap:16px">
                        <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(16,185,129,0.3)">
                            <span class="material-icons-outlined" style="font-size:28px">add_business</span>
                        </div>
                        <div>
                            <h2 style="margin:0; font-size:20px; font-weight:800; color:#1e293b">Thêm văn phòng mới</h2>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b">Tạo mới điểm làm việc hoặc chi nhánh</p>
                        </div>
                    </div>
                    <button class="modal-close-btn" onclick="window.erpApp.closeOfficeModal()" style="width:36px; height:36px; border-radius:50%; background:#f1f5f9; border:none; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'; this.style.color='#ef4444'" onmouseout="this.style.background='#f1f5f9'; this.style.color='#64748b'">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body" style="padding:32px; background:#fff">
                    <form id="officeForm" style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Tên văn phòng/chi nhánh</label>
                            <input type="text" name="name" class="premium-input" placeholder="VD: Văn phòng VIETBACH Hồ Chí Minh" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Địa chỉ</label>
                            <input type="text" name="address" class="premium-input" placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM" required>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Chi nhánh</label>
                            <select name="branch" class="premium-input" required>
                                ${branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Trạng thái ban đầu</label>
                            <select name="status" class="premium-input">
                                <option value="active">Hoạt động</option>
                                <option value="maintenance">Đang bảo trì</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Tài sản (cách nhau bởi dấu phẩy)</label>
                            <input type="text" name="assets" class="premium-input" placeholder="VD: Máy tính, Máy in, Điều hòa, Bàn ghế...">
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Mô tả ngắn</label>
                            <input type="text" name="desc" class="premium-input" placeholder="VD: Trụ sở điều hành khu vực miền Nam">
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Hình ảnh văn phòng (URL)</label>
                            <input type="text" name="img" class="premium-input" placeholder="Dán link ảnh tại đây (để trống nếu dùng ảnh mặc định)">
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="padding:24px 32px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px">
                    <button class="premium-btn-secondary" onclick="window.erpApp.closeOfficeModal()">Hủy bỏ</button>
                    <button class="premium-btn-primary" onclick="window.erpApp.saveOffice()">Lưu văn phòng</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.closeOfficeModal = function () {
        const m = document.getElementById('officeModal');
        if (m) { m.remove(); }
    };

    window.erpApp.saveOffice = function () {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const form = document.getElementById('officeForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const formData = new FormData(form);
        const assets = formData.get('assets').split(',').map(a => a.trim()).filter(a => a);

        const newOffice = {
            id: erpOffices.length + 1,
            name: formData.get('name'),
            branch: formData.get('branch'),
            address: formData.get('address'),
            desc: formData.get('desc'),
            img: formData.get('img') || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
            assets: assets,
            status: 'active'
        };

        erpOffices.unshift(newOffice);
        localStorage.setItem('erp_erpOffices', JSON.stringify(erpOffices));
        if (window.CrudSync) { window.CrudSync.saveItem('erpOffices', newOffice, 'id'); }
        window.erpApp.closeOfficeModal();
        showToast('Đã thêm văn phòng mới thành công!', 'success');
        window.erpApp.renderOfficeManagement();

        window.erpApp.notifyCRUD('Văn phòng', 'add', {
            name: newOffice.name,
            page: 'hanh-chinh',
            module: 'Quản lý văn phòng'
        });
    };

    window.erpApp.openEditOfficeModal = function (officeId) {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const office = erpOffices.find(o => o.id === officeId);
        if (!office) { return; }

        const modalHtml = `
        <div class="premium-modal-overlay" id="editOfficeModal">
            <div class="premium-modal-content" style="max-width:560px;">
                <div class="modal-header" style="padding:32px; background:#fff; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9">
                    <div style="display:flex; align-items:center; gap:16px">
                        <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, var(--primary), #2563EB); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(59,130,246,0.3)">
                            <span class="material-icons-outlined" style="font-size:28px">edit_location</span>
                        </div>
                        <div>
                            <h2 style="margin:0; font-size:20px; font-weight:800; color:#1e293b">Chỉnh sửa thông tin</h2>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b">${office.name}</p>
                        </div>
                    </div>
                    <button class="modal-close-btn" onclick="document.getElementById('editOfficeModal').remove()" style="width:36px; height:36px; border-radius:50%; background:#f1f5f9; border:none; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.2s" onmouseover="this.style.background='#fee2e2'; this.style.color='#ef4444'" onmouseout="this.style.background='#f1f5f9'; this.style.color='#64748b'">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body" style="padding:32px; background:#fff">
                    <form id="editOfficeForm" style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
                        <input type="hidden" name="id" value="${office.id}">
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Tên văn phòng/chi nhánh</label>
                            <input type="text" name="name" class="premium-input" value="${office.name}" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Địa chỉ</label>
                            <input type="text" name="address" class="premium-input" value="${office.address}" required>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Chi nhánh</label>
                            <select name="branch" class="premium-input" required>
                                ${branches.map(b => `<option value="${b.id}" ${b.id === office.branch ? 'selected' : ''}>${b.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="premium-label">Trạng thái</label>
                            <select name="status" class="premium-input">
                                <option value="active" ${office.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                                <option value="maintenance" ${office.status === 'maintenance' ? 'selected' : ''}>Đang bảo trì</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Tài sản (cách nhau bởi dấu phẩy)</label>
                            <input type="text" name="assets" class="premium-input" value="${office.assets.join(', ')}">
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Mô tả ngắn</label>
                            <input type="text" name="desc" class="premium-input" value="${office.desc}">
                        </div>
                        <div class="form-group" style="grid-column: span 2">
                            <label class="premium-label">Hình ảnh văn phòng (URL)</label>
                            <input type="text" name="img" class="premium-input" value="${office.img}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="padding:24px 32px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px">
                    <button class="premium-btn-secondary" onclick="document.getElementById('editOfficeModal').remove()">Hủy bỏ</button>
                    <button class="premium-btn-primary" style="background:linear-gradient(135deg, var(--primary), #2563EB); box-shadow:0 10px 15px -3px rgba(59,130,246,0.3)" onclick="window.erpApp.updateOffice()">Cập nhật thông tin</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.updateOffice = function () {
        const form = document.getElementById('editOfficeForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const formData = new FormData(form);
        const id = parseInt(formData.get('id'));
        const index = erpOffices.findIndex(o => o.id === id);

        if (index !== -1) {
            const assets = formData.get('assets').split(',').map(a => a.trim()).filter(a => a);
            erpOffices[index] = {
                ...erpOffices[index],
                name: formData.get('name'),
                branch: formData.get('branch'),
                address: formData.get('address'),
                desc: formData.get('desc'),
                img: formData.get('img'),
                status: formData.get('status'),
                assets: assets
            };

            if (window.CrudSync) { window.CrudSync.saveItem('erpOffices', erpOffices[index], 'id'); }
            localStorage.setItem('erp_erpOffices', JSON.stringify(erpOffices));

            document.getElementById('editOfficeModal').remove();
            // Also close details modal if it's open to refresh it
            const detailModal = document.getElementById('assetDetailsModal');
            if (detailModal) { detailModal.remove(); }

            showToast('Đã cập nhật thông tin văn phòng!', 'success');
            window.erpApp.renderOfficeManagement();

            window.erpApp.notifyCRUD('Văn phòng', 'update', {
                name: erpOffices[index].name,
                page: 'hanh-chinh',
                module: 'Quản lý văn phòng'
            });
        }
    };

    window.erpApp.deleteOffice = function (officeId) {
        if (!isAdmin()) { showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }
        const office = erpOffices.find(o => o.id === officeId);
        if (office) {
            window.erpApp.showConfirm(
                'Xác nhận xóa văn phòng',
                `Bạn có chắc chắn muốn xóa văn phòng "<strong>${office.name}</strong>"?<br>Dữ liệu tài sản liên quan cũng sẽ bị mất.`,
                function () {
                    const index = erpOffices.findIndex(o => o.id === officeId);
                    if (index !== -1) {
                        const officeName = office.name;
                        if (window.CrudSync) { window.CrudSync.deleteItem('erpOffices', officeId); }
                        erpOffices.splice(index, 1);
                        localStorage.setItem('erp_erpOffices', JSON.stringify(erpOffices));
                        showToast('Đã xóa văn phòng thành công', 'info');
                        window.erpApp.renderOfficeManagement();

                        window.erpApp.notifyCRUD('Văn phòng', 'delete', {
                            name: officeName,
                            page: 'hanh-chinh',
                            module: 'Quản lý văn phòng'
                        });
                    }
                }
            );
        }
    };

    window.erpApp.deleteAsset = function (officeId, assetIndex) {
        if (!isAdmin()) {
            window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!', 'error');
            return;
        }
        const office = erpOffices.find(o => o.id === officeId);
        if (office) {
            window.erpApp.showConfirm(
                'Xác nhận xóa tài sản',
                `Xóa tài sản "${office.assets[assetIndex]}" khỏi danh sách?`,
                function () {
                    office.assets.splice(assetIndex, 1);
                    if (window.CrudSync) { window.CrudSync.saveItem('erpOffices', office, 'id'); }
                    window.erpApp.showToast('Đã xóa tài sản', 'info');
                    // Refresh detail modal
                    const modal = document.getElementById('assetDetailsModal');
                    if (modal) modal.remove();
                    window.erpApp.openAssetDetailsModal(officeId);
                }
            );
        }
    };

    window.erpApp.openAssetDetailsModal = function (officeId) {
        const office = erpOffices.find(o => o.id === officeId);
        if (!office) { return; }

        const getAssetIcon = (name) => {
            const n = name.toLowerCase();
            if (n.includes('máy tính') || n.includes('laptop') || n.includes('dell') || n.includes('thinkpad')) { return 'computer'; }
            if (n.includes('điều hòa') || n.includes('hệ thống')) { return 'ac_unit'; }
            if (n.includes('máy photocopy') || n.includes('máy in')) { return 'print'; }
            if (n.includes('camera')) { return 'videocam'; }
            if (n.includes('máy chiếu')) { return 'videocam'; }
            if (n.includes('tủ') || n.includes('bàn') || n.includes('ghế')) { return 'chair'; }
            if (n.includes('server')) { return 'dns'; }
            return 'inventory_2';
        };

        const modalHtml = `
        <div class="modal-overlay" id="assetDetailsModal" style="display:flex; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:10001; animation: fadeIn 0.3s ease">
            <div class="modal-content" style="max-width:720px; width:95%; border-radius:32px; box-shadow:0 40px 100px -20px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.4); overflow:hidden; animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)">
                <style>
                    @keyframes modalSlideUp { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                    .asset-search-input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.1) !important; }
                    .asset-row { transition: all 0.2s ease; border-radius: 12px; }
                    .asset-row:hover { background: #f8fafc; transform: scale(1.01); }
                    .asset-action-btn { transition: all 0.2s; border: 1px solid #e2e8f0; background: #fff; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
                    .asset-action-btn:hover { color: var(--primary); border-color: var(--primary); background: #eff6ff; transform: translateY(-2px); }
                </style>
                
                <div class="modal-header" style="padding:32px; background:#fff; display:flex; justify-content:space-between; align-items:center">
                    <div style="display:flex; align-items:center; gap:20px">
                        <div style="width:56px; height:56px; border-radius:18px; background:linear-gradient(135deg, #4A7CFF, #2563EB); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 15px 30px -5px rgba(59,130,246,0.4)">
                            <span class="material-icons-outlined" style="font-size:32px">inventory_2</span>
                        </div>
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:800; color:#1e293b; letter-spacing:-0.5px">Quản lý Tài sản</h2>
                            <div style="display:flex; align-items:center; gap:6px; margin-top:4px">
                                <span class="material-icons-outlined" style="font-size:14px; color:#94a3b8">business</span>
                                <span style="font-size:14px; color:#64748b; font-weight:500">${office.name}</span>
                            </div>
                        </div>
                    </div>
                    <button class="modal-close-btn" onclick="document.getElementById('assetDetailsModal').remove()" style="width:40px; height:40px; border-radius:14px; background:#f1f5f9; border:none; cursor:pointer; color:#94a3b8; transition:all 0.2s; display:flex; align-items:center; justify-content:center" onmouseover="this.style.background='#fee2e2'; this.style.color='#ef4444'" onmouseout="this.style.background='#f1f5f9'; this.style.color='#94a3b8'">
                        <span class="material-icons-outlined" style="font-size:24px">close</span>
                    </button>
                </div>

                <div class="modal-body" style="padding:0 32px 32px 32px; background:#fff">
                    <!-- Stats Section -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:32px">
                        <div style="background:#f8fafc; padding:20px; border-radius:24px; border:1px solid #f1f5f9; display:flex; align-items:center; gap:16px">
                            <div style="width:48px; height:48px; border-radius:14px; background:#fff; color:#3b82f6; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)">
                                <span class="material-icons-outlined">qr_code_2</span>
                            </div>
                            <div>
                                <div style="font-size:12px; color:#94a3b8; font-weight:700; text-transform:uppercase">Mã Văn Phòng</div>
                                <div style="font-size:18px; font-weight:800; color:#1e293b">VP-${office.id}</div>
                            </div>
                        </div>
                        <div style="background:#f8fafc; padding:20px; border-radius:24px; border:1px solid #f1f5f9; display:flex; align-items:center; gap:16px">
                            <div style="width:48px; height:48px; border-radius:14px; background:#fff; color:#10b981; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)">
                                <span class="material-icons-outlined">fact_check</span>
                            </div>
                            <div>
                                <div style="font-size:12px; color:#94a3b8; font-weight:700; text-transform:uppercase">Tổng Tài Sản</div>
                                <div style="font-size:18px; font-weight:800; color:#1e293b">${office.assets.length} hạng mục</div>
                            </div>
                        </div>
                    </div>

                    <!-- Search and Action -->
                    <div style="display:flex; gap:16px; margin-bottom:24px">
                        <div style="position:relative; flex:1">
                            <span class="material-icons-outlined" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8">search</span>
                            <input type="text" class="asset-search-input" placeholder="Tìm kiếm tài sản..." 
                                style="width:100%; padding:14px 14px 14px 48px; border-radius:16px; border:1px solid #e2e8f0; font-size:14px; background:#f8fafc; outline:none; transition:all 0.2s"
                                oninput="const q = this.value.toLowerCase(); document.querySelectorAll('.asset-row').forEach(row => { const text = row.innerText.toLowerCase(); row.style.display = text.includes(q) ? '' : 'none'; })">
                        </div>
                        <button class="btn-primary" style="padding:0 24px; border-radius:16px; display:flex; align-items:center; gap:10px" onclick="showToast('Tính năng thêm tài sản trực tiếp đang được xử lý', 'info')">
                            <span class="material-icons-outlined">add</span>
                            Thêm mới
                        </button>
                    </div>

                    <!-- Asset Table -->
                    <div style="max-height:360px; overflow-y:auto; padding-right:4px">
                        <table style="width:100%; border-collapse:separate; border-spacing:0 8px">
                            <thead>
                                <tr style="text-align:left">
                                    <th style="padding:0 12px 8px 12px; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase">Tài sản & Thiết bị</th>
                                    <th style="padding:0 12px 8px 12px; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase">Trạng thái</th>
                                    <th style="padding:0 12px 8px 12px; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; text-align:right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${office.assets.map((asset, idx) => `
                                    <tr class="asset-row">
                                        <td style="padding:16px 12px">
                                            <div style="display:flex; align-items:center; gap:16px">
                                                <div style="width:40px; height:40px; border-radius:12px; background:#fff; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b">
                                                    <span class="material-icons-outlined" style="font-size:20px">${getAssetIcon(asset)}</span>
                                                </div>
                                                <div>
                                                    <div style="font-weight:700; color:#1e293b; font-size:15px">${asset}</div>
                                                    <div style="font-size:12px; color:#94a3b8">Mã TS: AS-${Math.floor(1000 + Math.random() * 9000)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding:16px 12px">
                                            <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:10px; background:#ecfdf5; color:#059669; font-size:12px; font-weight:700">
                                                <span class="om-status-pulse pulse-green" style="margin:0"></span>
                                                Sẵn sàng
                                            </div>
                                        </td>
                                        <td style="padding:16px 12px; text-align:right">
                                            <div style="display:flex; justify-content:flex-end; gap:8px">
                                                <button class="asset-action-btn" onclick="window.erpApp.openEditOfficeModal(${office.id})" title="Chỉnh sửa">
                                                    <span class="material-icons-outlined" style="font-size:18px">edit</span>
                                                </button>
                                                <button class="asset-action-btn" onclick="window.erpApp.deleteAsset(${office.id}, ${idx})" style="color:#ef4444" title="Xóa tài sản">
                                                    <span class="material-icons-outlined" style="font-size:18px">delete_outline</span>
                                                </button>
                                                <button class="asset-action-btn" onclick="showToast('Yêu cầu bảo trì cho ${asset} đã được ghi nhận', 'success')" title="Bảo trì">
                                                    <span class="material-icons-outlined" style="font-size:18px">build</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-footer" style="padding:24px 32px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center">
                    <button class="btn-secondary" style="background:#fff; border-radius:14px; padding:12px 20px" onclick="window.print()">
                        <span class="material-icons-outlined">print</span> Xuất báo cáo
                    </button>
                    <button class="btn-primary" style="padding:12px 32px; border-radius:14px; box-shadow:0 10px 15px -3px rgba(59,130,246,0.3)" onclick="document.getElementById('assetDetailsModal').remove()">
                        Đóng chi tiết
                    </button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

