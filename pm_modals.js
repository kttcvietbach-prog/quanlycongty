/**
 * VIETBACHCORP ERP - Project Management Modals Logic
 * Dedicated file for PM module UI modals and operation handlers.
 * Optimized for high-precision financial data handling.
 */

window.erpApp = window.erpApp || {};

(function () {
    'use strict';

    // Helper for formatting/parsing
    const fMoney = (val) => window.erpApp.formatValue(val);
    const parseVND = (val) => window.erpApp.parseVND(val);
    const showToast = (msg, type) => window.erpApp.showToast(msg, type);

    // Helper to slugify Vietnamese text for weather crawling
    window.erpApp.pmToSlug = (str) => {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
        str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
        str = str.replace(/[ìíịỉĩ]/g, "i");
        str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
        str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
        str = str.replace(/[ỳýỵỷỹ]/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/[^a-z0-9]/g, "-");
        str = str.replace(/-+/g, "-");
        str = str.replace(/^-+|-+$/g, "");
        return str;
    };
    const pmToSlug = window.erpApp.pmToSlug;

    // Global State Local References
    let pmProjects = window.pmProjects || [];
    let pmContracts = window.pmContracts || [];
    let pmTasks = window.pmTasks || [];
    let pmVolumes = window.pmVolumes || [];
    let pmMaterials = window.pmMaterials || [];
    let pmLaborLogs = window.pmLaborLogs || [];
    let pmTeams = window.pmTeams || [];
    let pmWorkers = window.pmWorkers || [];
    let pmAttendanceLogs = window.pmAttendanceLogs || [];
    let pmFinanceRecords = window.pmFinanceRecords || [];
    let pmMaterialContracts = window.pmMaterialContracts || [];
    let pmEquipment = window.pmEquipment || [];
    let pmMachineLogs = window.pmMachineLogs || [];
    let pmMaintenanceLogs = window.pmMaintenanceLogs || [];
    let pmIncidents = window.pmIncidents || [];
    let pmDailyLogs = window.pmDailyLogs || [];
    let pmProjectPhotos = window.pmProjectPhotos || [];
    let hoSoDocuments = window.hoSoDocuments || [];
    let pmLegalDocs = window.pmLegalDocs || [];
    let pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId || '';
    let currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
    let tempContractFiles = [];

    function syncGlobalData() {
        pmProjects = window.pmProjects || [];
        pmContracts = window.pmContracts || [];
        pmTasks = window.pmTasks || [];
        pmVolumes = window.pmVolumes || [];
        pmMaterials = window.pmMaterials || [];
        pmLaborLogs = window.pmLaborLogs || [];
        pmTeams = window.pmTeams || [];
        pmWorkers = window.pmWorkers || [];
        pmAttendanceLogs = window.pmAttendanceLogs || [];
        pmFinanceRecords = window.pmFinanceRecords || [];
        pmMaterialContracts = window.pmMaterialContracts || [];
        pmEquipment = window.pmEquipment || [];
        pmMachineLogs = window.pmMachineLogs || [];
        pmMaintenanceLogs = window.pmMaintenanceLogs || [];
        pmIncidents = window.pmIncidents || [];
        pmDailyLogs = window.pmDailyLogs || [];
        pmProjectPhotos = window.pmProjectPhotos || [];
        hoSoDocuments = window.hoSoDocuments || [];
        pmLegalDocs = window.pmLegalDocs || [];
        pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId || '';
    }

    function syncToGlobalData() {
        window.pmProjects = pmProjects;
        window.pmContracts = pmContracts;
        window.pmTasks = pmTasks;
        window.pmVolumes = pmVolumes;
        window.pmMaterials = pmMaterials;
        window.pmLaborLogs = pmLaborLogs;
        window.pmTeams = pmTeams;
        window.pmWorkers = pmWorkers;
        window.pmAttendanceLogs = pmAttendanceLogs;
        window.pmFinanceRecords = pmFinanceRecords;
        window.pmMaterialContracts = pmMaterialContracts;
        window.pmEquipment = pmEquipment;
        window.pmMachineLogs = pmMachineLogs;
        window.pmMaintenanceLogs = pmMaintenanceLogs;
        window.pmIncidents = pmIncidents;
        window.pmDailyLogs = pmDailyLogs;
        window.pmProjectPhotos = pmProjectPhotos;
        window.hoSoDocuments = hoSoDocuments;
        window.pmLegalDocs = pmLegalDocs;
    }

    /**
     * syncArchiveWithContract is defined in pm_logic.js
     * It handles pulling data from Archive (hoSoDocuments) to PM (pmContracts)
     * using hsDoc.project to find the correct project.
     * DO NOT redefine here to avoid overriding the correct implementation.
     */

    // ==========================================
    // LEGAL DOCUMENTS (HỒ SƠ PHÁP LÝ)
    // ==========================================
    window.erpApp.pmOpenLegalDocModal = (id = null) => {
        syncGlobalData();
        const doc = id ? pmLegalDocs.find(d => d.id === id) : null;

        tempContractFiles = doc && doc.vouchers ? [...doc.vouchers] : (doc && doc.fileUrl ? [{
            name: doc.title || 'Tài liệu đính kèm',
            url: doc.fileUrl,
            data: doc.fileUrl,
            type: (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(doc.fileUrl) : 'pdf'),
            size: ''
        }] : []);

        const existingDrivePath = (tempContractFiles && tempContractFiles.find(f => f.drivePath)?.drivePath) || '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:650px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#6366f1;">policy</span> ${id ? 'Sửa hồ sơ pháp lý' : 'Thêm hồ sơ pháp lý mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveLegalDoc(event, ${id ? `'${id}'` : 'null'})">
                    <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:20px; max-height:calc(100vh - 180px); overflow-y:auto;">
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên hồ sơ / Tài liệu <span style="color:red">*</span></label>
                            <input type="text" name="title" required value="${doc ? doc.title : ''}" placeholder="Ví dụ: Giấy phép xây dựng, Biên bản bàn giao..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-weight:700;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số hiệu</label>
                            <input type="text" name="symbol" value="${doc ? doc.symbol || '' : ''}" placeholder="VD: 123/GPXD-SXD" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày ban hành</label>
                            <input type="text" name="date" class="erp-datepicker" value="${doc && doc.date ? window.erpApp.formatDate(doc.date) : ''}" placeholder="DD/MM/YYYY" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nơi nhận</label>
                            <input type="text" name="recipient" value="${doc ? doc.recipient || '' : ''}" placeholder="Ví dụ: Ban QLDA, Tư vấn giám sát..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nơi ban hành</label>
                            <input type="text" name="issuer" value="${doc ? doc.issuer || '' : ''}" placeholder="Ví dụ: Sở Xây dựng, UBND Tỉnh..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        
                        <div class="form-group" style="grid-column: span 2; border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:8px;">
                            <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tài liệu đính kèm (Ảnh / PDF / Link tài liệu)</label>
                            
                            <div style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                <select id="pmContractDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadContractDriveFolderChain(null, 0)">
                                    <option value="">⏳ Đang tải thư mục...</option>
                                </select>
                                <div id="pmContractDriveFolderChain" style="display:contents"></div>
                                <button type="button" onclick="window.erpApp.loadContractDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                    <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                </button>
                                <button type="button" onclick="window.erpApp.createContractDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                    <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                </button>
                            </div>
                            <div id="pmContractDriveFolderPathText" style="font-size:12px; color:#0d9488; font-weight:700; margin-top:4px; margin-bottom:8px; display:${existingDrivePath ? 'block' : 'none'};" data-initial-path="${existingDrivePath}">
                                ${existingDrivePath ? `Thư mục hiện tại: ${existingDrivePath}` : ''}
                            </div>

                            <div class="contract-upload-area" style="margin-bottom: 16px;">
                                <label for="pmContractFileInput" class="upload-label" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; border:2px dashed #3b82f6; border-radius:16px; cursor:pointer; background:#f8fafc; transition: 0.2s; min-height:120px;" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='#f8fafc'">
                                    <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6;">cloud_upload</span>
                                    <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                    <span style="font-size:11px; color:#64748b; font-weight:500;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                </label>
                                <input type="file" id="pmContractFileInput" multiple onchange="window.erpApp.pmHandleContractFileUpload(event)" style="display:none;">
                            </div>

                            <div style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:16px; margin-bottom:16px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:12px;">
                                    <span class="material-icons-outlined" style="font-size:16px; color:#3b82f6;">link</span> Thêm file bằng đường link
                                </label>
                                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                    <div style="flex:1; min-width:140px;">
                                        <input type="text" id="pmContractLinkName" placeholder="VD: Bản vẽ thiết kế..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <div style="flex:2; min-width:200px;">
                                        <input type="url" id="pmContractLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <button type="button" onclick="window.erpApp.pmAddContractFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                        <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                    </button>
                                </div>
                            </div>

                            <!-- File list container -->
                            <div id="pmContractFileList" style="margin-top:16px;">
                                ${window.erpApp.renderContractFileList ? window.erpApp.renderContractFileList(tempContractFiles, true) : ''}
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#6366f1; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(99, 102, 241, 0.2);">${id ? 'Cập nhật' : 'Thêm hồ sơ'}</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            window.erpApp.loadContractDriveRootFolders(null, 'du-an');
        }, 100);

        if (window.flatpickr) {
            flatpickr(overlay.querySelectorAll('.erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.pmSaveLegalDoc = (e, id = null) => {
        e.preventDefault();
        syncGlobalData();
        const formData = new FormData(e.target);
        const pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;

        if (id) {
            const index = pmLegalDocs.findIndex(d => d.id === id);
            if (index !== -1) {
                pmLegalDocs[index] = {
                    ...pmLegalDocs[index],
                    title: formData.get('title'),
                    symbol: formData.get('symbol'),
                    date: window.erpApp.parseInputDate(formData.get('date')),
                    recipient: formData.get('recipient'),
                    issuer: formData.get('issuer'),
                    vouchers: [...tempContractFiles],
                    fileUrl: tempContractFiles[0] ? (tempContractFiles[0].url || tempContractFiles[0].dataUrl || tempContractFiles[0].data) : ''
                };
                if (window.CrudSync) window.CrudSync.saveItem('pmLegalDocs', pmLegalDocs[index], 'id');
            }
        } else {
            const newDoc = {
                id: 'LD-' + Date.now().toString().slice(-6),
                projectId: pmActiveProjectId,
                title: formData.get('title'),
                symbol: formData.get('symbol'),
                date: window.erpApp.parseInputDate(formData.get('date')),
                recipient: formData.get('recipient'),
                issuer: formData.get('issuer'),
                vouchers: [...tempContractFiles],
                fileUrl: tempContractFiles[0] ? (tempContractFiles[0].url || tempContractFiles[0].dataUrl || tempContractFiles[0].data) : '',
                createdAt: new Date().toISOString()
            };
            pmLegalDocs.push(newDoc);
            if (window.CrudSync) window.CrudSync.saveItem('pmLegalDocs', newDoc, 'id');
        }

        syncToGlobalData();
        localStorage.setItem('erp_pmLegalDocs', JSON.stringify(pmLegalDocs));
        e.target.closest('.modal-overlay').remove();
        showToast(id ? 'Đã cập nhật hồ sơ pháp lý' : 'Đã thêm hồ sơ pháp lý mới', 'success');

        if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
            window.erpApp.renderQuanLyDuAn();
        }
    };

    window.erpApp.pmDeleteLegalDoc = (id) => {
        syncGlobalData();
        const doc = pmLegalDocs.find(d => d.id === id);
        if (!doc) return;

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa hồ sơ pháp lý <strong>${doc.title || id}</strong>? Thao tác này không thể hoàn tác.`,
            async function () {
                const index = pmLegalDocs.findIndex(d => d.id === id);
                if (index !== -1) {
                    pmLegalDocs.splice(index, 1);
                    syncToGlobalData();
                    localStorage.setItem('erp_pmLegalDocs', JSON.stringify(pmLegalDocs));
                    if (window.CrudSync) window.CrudSync.deleteItem('pmLegalDocs', id, 'id');
                    showToast('Đã xóa hồ sơ pháp lý thành công', 'success');

                    // Audit Log
                    window.erpApp.notifyCRUD('Hồ sơ pháp lý', 'delete', {
                        name: doc.title || id,
                        page: 'quan-ly-du-an',
                        projectId: pmActiveProjectId
                    });

                    if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
                        window.erpApp.renderQuanLyDuAn();
                    }
                }
            }
        );
    };

    /**
     * pmSyncLegalFromArchive is defined in pm_logic.js
     * DO NOT redefine here to avoid overriding the correct implementation.
     */

    // ==========================================
    // EQUIPMENT & MACHINE LOGS MODALS
    // ==========================================
    window.erpApp.pmOpenAddMachineLogModal = (editId = null) => {
        const editLog = editId ? pmMachineLogs.find(l => l.id === editId) : null;
        const projectEquipment = pmEquipment.filter(e => e.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#f59e0b;">history_edu</span> ${editId ? 'Sửa nhật ký ca máy' : 'Ghi nhật ký ca máy mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveMachineLog(event, ${editId ? `'${editId}'` : 'null'})">
                    <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chọn Thiết bị</label>
                            <select name="equipmentId" required style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-weight:700;">
                                ${projectEquipment.map(e => `<option value="${e.id}" ${editLog && editLog.equipmentId === e.id ? 'selected' : ''}>${e.code} - ${e.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày vận hành</label>
                            <input type="text" name="date" class="erp-datepicker" required value="${editLog ? window.erpApp.formatDate(editLog.date) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nhiên liệu tiêu thụ (Lít)</label>
                            <input type="text" name="actualFuel" placeholder="0.0" value="${editLog ? window.erpApp.formatValue(editLog.actualFuel) : ''}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:800; color:#f59e0b; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giờ sáng (H)</label>
                            <input type="text" name="morningHours" required value="${editLog ? window.erpApp.formatValue(editLog.morningHours) : 4}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giờ chiều (H)</label>
                            <input type="text" name="afternoonHours" required value="${editLog ? window.erpApp.formatValue(editLog.afternoonHours) : 4}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số Km bắt đầu</label>
                            <input type="number" name="startKm" value="${editLog ? editLog.startKm : ''}" placeholder="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số Km kết thúc</label>
                            <input type="number" name="endKm" value="${editLog ? editLog.endKm : ''}" placeholder="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đã thanh toán (VNĐ)</label>
                            <input type="text" name="paidAmount" value="${editLog ? window.erpApp.formatValue(editLog.paidAmount || 0) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:800; color:#10b981; outline:none;">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ghi chú công việc</label>
                            <textarea name="workNotes" rows="3" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; resize:none;">${editLog ? editLog.workNotes : ''}</textarea>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#f59e0b; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(245, 158, 11, 0.2);">Lưu nhật ký</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        window.erpApp.initDatePickers(overlay);
    };

    window.erpApp.pmOpenAddMaintenanceModal = () => { window.erpApp.pmOpenEditMaintenanceModal(null); };

    window.erpApp.pmOpenEditMaintenanceModal = (editId = null) => {
        const editLog = editId ? pmMaintenanceLogs.find(l => l.id === editId) : null;
        const projectEquipment = pmEquipment.filter(e => e.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:550px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#ef4444;">build_circle</span> ${editId ? 'Sửa bản ghi bảo trì' : 'Ghi nhận bảo trì & Sửa chữa'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveMaintenance(event, ${editId ? `'${editId}'` : 'null'})">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chọn Thiết bị</label>
                            <select name="equipmentId" required style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                ${projectEquipment.map(e => `<option value="${e.id}" ${editLog && editLog.equipmentId === e.id ? 'selected' : ''}>${e.code} - ${e.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày thực hiện</label>
                                <input type="text" name="date" class="erp-datepicker" required value="${editLog ? window.erpApp.formatDate(editLog.date) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Loại hình</label>
                                <select name="type" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                    <option value="Bảo trì định kỳ" ${editLog && editLog.type === 'Bảo trì định kỳ' ? 'selected' : ''}>Bảo trì định kỳ</option>
                                    <option value="Sửa chữa" ${editLog && editLog.type === 'Sửa chữa' ? 'selected' : ''}>Sửa chữa đột xuất</option>
                                    <option value="Thay thế phụ tùng" ${editLog && editLog.type === 'Thay thế phụ tùng' ? 'selected' : ''}>Thay thế phụ tùng</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chi phí thực tế (VNĐ)</label>
                                <input type="text" name="cost" value="${editLog ? window.erpApp.formatValue(editLog.cost) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; font-weight:800; color:#ef4444; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đã thanh toán (VNĐ)</label>
                                <input type="text" name="paidAmount" value="${editLog ? window.erpApp.formatValue(editLog.paidAmount || 0) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; font-weight:800; color:#10b981; outline:none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nội dung chi tiết</label>
                            <textarea name="content" rows="4" required style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; outline:none; resize:none;">${editLog ? editLog.content : ''}</textarea>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 24px; border-radius:12px; border:none; background:#ef4444; color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(239, 68, 68, 0.2);">Lưu thông tin</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        window.erpApp.initDatePickers(overlay);
    };

    // ==========================================
    // VOLUME & SETTLEMENT MODALS
    // ==========================================
    window.erpApp.pmOpenAddVolumeModal = (workItem, volumeType = 'contract') => {
        syncGlobalData();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
                <div class="modal-content" style="width:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:${volumeType === 'field' ? '#10b981' : '#6366f1'};">${volumeType === 'field' ? 'engineering' : 'description'}</span> 
                            Đăng ký Khối lượng ${volumeType === 'field' ? 'Hiện trường' : 'Hợp đồng'}
                        </h2>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form onsubmit="window.erpApp.pmSaveVolume(event)">
                        <input type="hidden" name="volumeType" value="${volumeType}">
                        <div style="padding:24px; max-height:75vh; overflow-y:auto;">
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã số (Tự động)</label>
                                    <input type="text" name="id" value="VOL-${String(pmVolumes.length + 1).padStart(3, '0')}" readonly style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; background:#f8fafc; color:#64748b;">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạng mục công việc</label>
                                    <input type="text" name="name" required placeholder="VD: Đào nền đường..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">ĐVT</label>
                                    <input type="text" name="unit" required placeholder="VD: Tấn, m2..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Khối lượng HĐ/Dự toán</label>
                                    <input type="text" name="norm" required oninput="window.erpApp.formatQuantityInput(this)" placeholder="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1; display: ${volumeType === 'field' ? 'none' : 'block'};">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">KL Lũy kế kỳ trước</label>
                                    <input type="text" name="prevActual" value="0" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">${volumeType === 'field' ? 'Khối lượng thi công' : 'Khối lượng kỳ này'}</label>
                                    <input type="text" name="actual" value="0" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1; display: ${volumeType === 'contract' ? 'none' : (volumeType === 'field' ? 'none' : 'block')};">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn giá ước tính (VNĐ)</label>
                                    <input type="text" name="price" oninput="window.erpApp.formatNumberInput(this)" placeholder="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:800; color:#10b981; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Công trình / Hạng mục</label>
                                    <input type="text" name="workItem" list="pmTaskNames" required placeholder="VD: Xây thô móng..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                    <datalist id="pmTaskNames">
                                        ${pmTasks.filter(t => t.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)).map(t => `<option value="${t.title}">`).join('')}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                        <div style="padding:20px 24px; background:#fff; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">Lưu thông tin</button>
                        </div>
                    </form>
                </div>
            `;
        document.body.appendChild(overlay);
        if (workItem) {
            const form = overlay.querySelector('form');
            if (form) {
                const wi = form.querySelector('[name="workItem"]');
                if (wi) { wi.value = workItem; }
            }
        }
    };

    window.erpApp.pmOpenEditVolumeModal = (id) => {
        syncGlobalData();
        const mat = pmVolumes.find(m => String(m.id) === String(id));
        if (!mat) { return; }
        const volumeType = mat.volumeType || 'contract';
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
                <div class="modal-content" style="width:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:${volumeType === 'field' ? '#10b981' : '#6366f1'};">${volumeType === 'field' ? 'engineering' : 'description'}</span> 
                            Cập nhật Khối lượng ${volumeType === 'field' ? 'Hiện trường' : 'Hợp đồng'}
                        </h2>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form onsubmit="window.erpApp.pmSaveVolume(event, '${id}')">
                        <input type="hidden" name="volumeType" value="${volumeType}">
                        <div style="padding:24px; max-height:75vh; overflow-y:auto;">
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã số</label>
                                    <input type="text" name="id" value="${mat.id}" readonly style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; background:#f8fafc; color:#64748b;">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạng mục công việc</label>
                                    <input type="text" name="name" required value="${mat.name}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">ĐVT</label>
                                    <input type="text" name="unit" required value="${mat.unit}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Khối lượng HĐ/Dự toán</label>
                                    <input type="text" name="norm" required value="${window.erpApp.formatValue(mat.norm || 0)}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1; display: ${volumeType === 'field' ? 'none' : 'block'};">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">KL Lũy kế kỳ trước</label>
                                    <input type="text" name="prevActual" value="${window.erpApp.formatValue(mat.prevActual || 0)}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">${volumeType === 'field' ? 'Khối lượng thi công' : 'Khối lượng kỳ này'}</label>
                                    <input type="text" name="actual" value="${window.erpApp.formatValue(mat.actual || 0)}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:700; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 1; display: ${volumeType === 'contract' ? 'none' : (volumeType === 'field' ? 'none' : 'block')};">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn giá ước tính (VNĐ)</label>
                                    <input type="text" name="price" value="${window.erpApp.formatValue(mat.price)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-weight:800; color:#10b981; outline:none;">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Công trình / Hạng mục</label>
                                    <input type="text" name="workItem" list="pmTaskNames" required value="${mat.workItem || ''}" placeholder="VD: Xây móng..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                </div>
                            </div>
                        </div>
                        <div style="padding:20px 24px; background:#fff; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            `;
        document.body.appendChild(overlay);
    };

    // ==========================================
    // MATERIAL MODALS
    // ==========================================
    window.erpApp.pmOpenAddMaterialModal = () => {
        syncGlobalData();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#3b82f6;">inventory_2</span> Thêm Vật tư/Thiết bị mới
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveMaterial(event)">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên Vật tư/Thiết bị</label>
                            <input type="text" name="name" required placeholder="Nhập tên vật tư..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn vị tính</label>
                                <input type="text" name="unit" required placeholder="VD: Kg, Mét, Bộ..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số lượng nhập</label>
                                <input type="text" name="quantity" required placeholder="0" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#3b82f6; outline:none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn giá ước tính (VNĐ)</label>
                            <input type="text" name="price" required placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#10b981; outline:none;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 24px; border-radius:12px; border:none; background:#3b82f6; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(59, 130, 246, 0.2);">Lưu vật tư</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmOpenEditMaterialModal = (id) => {
        syncGlobalData();
        const mat = pmMaterials.find(m => m.id === id);
        if (!mat) { return; }
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#10b981;">edit</span> Sửa Vật tư/Thiết bị
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveMaterial(event, '${id}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên Vật tư/Thiết bị</label>
                            <input type="text" name="name" required value="${mat.name}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn vị tính</label>
                                <input type="text" name="unit" required value="${mat.unit}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số lượng nhập</label>
                                <input type="text" name="quantity" required value="${window.erpApp.formatValue(mat.quantity)}" oninput="window.erpApp.formatQuantityInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#3b82f6; outline:none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đơn giá ước tính (VNĐ)</label>
                            <input type="text" name="price" required value="${window.erpApp.formatValue(mat.price)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#10b981; outline:none;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    // ==========================================
    // FINANCE MODALS
    // ==========================================
    window.erpApp.pmOpenAddFinanceModal = () => { window.erpApp.pmOpenEditFinanceModal(null); };

    window.erpApp.pmOpenEditFinanceModal = (editId = null) => {
        const editRec = editId ? pmFinanceRecords.find(r => r.id === editId) : null;

        tempContractFiles = editRec && editRec.vouchers ? [...editRec.vouchers] : [];

        const existingDrivePath = (tempContractFiles && tempContractFiles.find(f => f.drivePath)?.drivePath) || '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:650px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#6366f1;">payments</span> ${editId ? 'Sửa chứng từ Thu/Chi' : 'Lập chứng từ Thu/Chi mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveFinanceRecord(event, ${editId ? `'${editId}'` : 'null'})">
                    <div style="padding:24px; max-height:calc(100vh - 180px); overflow-y:auto;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Loại giao dịch</label>
                                <select name="type" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                    <option value="chi" ${editRec && editRec.type === 'chi' ? 'selected' : ''}>Chi phí (OUT)</option>
                                    <option value="thu" ${editRec && editRec.type === 'thu' ? 'selected' : ''}>Thu nhập (IN)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày hạch toán</label>
                                <input type="text" name="date" class="erp-datepicker" required value="${editRec ? window.erpApp.formatDate(editRec.date) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nội dung thanh toán</label>
                            <input type="text" name="content" required value="${editRec ? editRec.content : ''}" placeholder="VD: Tạm ứng tiền xăng xe..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạng mục chi phí</label>
                                <select name="category" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                    <option value="Vật tư" ${editRec && editRec.category === 'Vật tư' ? 'selected' : ''}>Vật tư / Thiết bị</option>
                                    <option value="Nhân công" ${editRec && editRec.category === 'Nhân công' ? 'selected' : ''}>Nhân công / Tổ đội</option>
                                    <option value="Máy thi công" ${editRec && editRec.category === 'Máy thi công' ? 'selected' : ''}>Máy thi công / Nhiên liệu</option>
                                    <option value="Thầu phụ" ${editRec && editRec.category === 'Thầu phụ' ? 'selected' : ''}>Thầu phụ / Khoán</option>
                                    <option value="Quản lý" ${editRec && editRec.category === 'Quản lý' ? 'selected' : ''}>Chi phí quản lý / Hành chính</option>
                                    <option value="Khác" ${editRec && editRec.category === 'Khác' ? 'selected' : ''}>Chi phí khác</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số tiền (VNĐ)</label>
                                <input type="text" name="amount" required value="${editRec ? window.erpApp.formatValue(editRec.amount) : ''}" placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#2563eb; outline:none;">
                            </div>
                        </div>

                        <!-- NEW STANDARD ATTACHMENT SECTION -->
                        <div class="form-group" style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:8px;">
                            <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tài liệu đính kèm (Ảnh / PDF / Link tài liệu)</label>
                            
                            <div style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                <select id="pmContractDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadContractDriveFolderChain(null, 0)">
                                    <option value="">⏳ Đang tải thư mục...</option>
                                </select>
                                <div id="pmContractDriveFolderChain" style="display:contents"></div>
                                <button type="button" onclick="window.erpApp.loadContractDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                    <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                </button>
                                <button type="button" onclick="window.erpApp.createContractDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                    <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                </button>
                            </div>
                            <div id="pmContractDriveFolderPathText" style="font-size:12px; color:#0d9488; font-weight:700; margin-top:4px; margin-bottom:8px; display:${existingDrivePath ? 'block' : 'none'};" data-initial-path="${existingDrivePath}">
                                ${existingDrivePath ? `Thư mục hiện tại: ${existingDrivePath}` : ''}
                            </div>

                            <div class="contract-upload-area" style="margin-bottom: 16px;">
                                <label for="pmContractFileInput" class="upload-label" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; border:2px dashed #3b82f6; border-radius:16px; cursor:pointer; background:#f8fafc; transition: 0.2s; min-height:120px;" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='#f8fafc'">
                                    <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6;">cloud_upload</span>
                                    <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                    <span style="font-size:11px; color:#64748b; font-weight:500;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                </label>
                                <input type="file" id="pmContractFileInput" multiple onchange="window.erpApp.pmHandleContractFileUpload(event)" style="display:none;">
                            </div>

                            <div style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:16px; margin-bottom:16px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:12px;">
                                    <span class="material-icons-outlined" style="font-size:16px; color:#3b82f6;">link</span> Thêm file bằng đường link
                                </label>
                                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                    <div style="flex:1; min-width:140px;">
                                        <input type="text" id="pmContractLinkName" placeholder="VD: Hóa đơn đỏ..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <div style="flex:2; min-width:200px;">
                                        <input type="url" id="pmContractLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <button type="button" onclick="window.erpApp.pmAddContractFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                        <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                    </button>
                                </div>
                            </div>

                            <!-- File list container -->
                            <div id="pmContractFileList" style="margin-top:16px;">
                                ${window.erpApp.renderContractFileList ? window.erpApp.renderContractFileList(tempContractFiles, true) : ''}
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 24px; border-radius:12px; border:none; background:#6366f1; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(99, 102, 241, 0.2);">Lưu chứng từ</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            window.erpApp.loadContractDriveRootFolders(null, 'tai-chinh');
        }, 100);

        window.erpApp.initDatePickers(overlay);
    };

    // ==========================================
    // ATTENDANCE & LABOR MODALS
    // ==========================================
    window.erpApp.pmOpenAttendanceEditModal = (workerId, date) => {
        const log = pmAttendanceLogs.find(l => l.workerId === workerId && l.date === date) || {
            workerId: workerId,
            date: date,
            normalWork: 1,
            overtime: 0,
            notes: ''
        };
        const worker = pmWorkers.find(w => w.id === workerId);
        const normalWork = parseFloat(log.normalWork) || 0;
        const overtime = parseFloat(log.overtime) || 0;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:450px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <div style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Chỉnh sửa chấm công</div>
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${worker ? worker.name : 'Công nhân'}</h2>
                    <div style="font-size:13px; color:#64748b; margin-top:4px;">Ngày: ${date.split('-').reverse().join('/')}</div>
                </div>
                <form onsubmit="window.erpApp.pmSaveAttendance(event, '${workerId}', '${date}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Công nhật (Ngày công)</label>
                            <select name="normalWork" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:700; outline:none; color:#3b82f6;">
                                <option value="1" ${normalWork === 1 ? 'selected' : ''}>1.0 Công (Ngày làm bình thường)</option>
                                <option value="0.5" ${normalWork === 0.5 ? 'selected' : ''}>0.5 Công (Nửa ngày)</option>
                                <option value="0" ${normalWork === 0 ? 'selected' : ''}>0 Công (Nghỉ)</option>
                                <option value="1.5" ${normalWork === 1.5 ? 'selected' : ''}>1.5 Công (Làm ca đặc biệt)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số giờ tăng ca (h)</label>
                            <input type="text" name="overtime" value="${window.erpApp.formatValue(overtime)}" oninput="window.erpApp.formatQuantityInput(this)" placeholder="Nhập số giờ..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:700; outline:none; color:#f59e0b;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#1e293b; color:#fff; font-weight:700; cursor:pointer;">Lưu chấm công</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    // ==========================================
    // VOLUME & SETTLEMENT LOGIC
    // ==========================================
    window.erpApp.pmSaveVolume = async (e, editId = null) => {
        syncGlobalData();
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const activeProjectSelect = document.querySelector('.pm-project-picker select');
        const activeProjectId = activeProjectSelect ? activeProjectSelect.value : (window.pmActiveProjectId || window.erpApp.pmActiveProjectId);

        const volumeType = formData.get('volumeType') || 'contract';
        const actualValue = parseVND(formData.get('actual')) || 0;

        const volumeData = {
            id: formData.get('id'),
            projectId: activeProjectId,
            name: formData.get('name'),
            unit: formData.get('unit'),
            norm: parseVND(formData.get('norm')),
            prevActual: parseVND(formData.get('prevActual')) || 0,
            actual: actualValue,
            price: parseVND(formData.get('price')) || 0,
            workItem: formData.get('workItem'),
            volumeType: volumeType
        };

        if (volumeType === 'field' && actualValue > 0 && !editId) {
            const today = new Date();
            const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(2)}`;
            volumeData[`qty_${todayStr}`] = actualValue;
        }

        if (editId) {
            const idx = pmVolumes.findIndex(v => String(v.id) === String(editId));
            if (idx !== -1) {
                pmVolumes[idx] = { ...pmVolumes[idx], ...volumeData };
            }
        } else {
            // Check duplicate ID
            if (pmVolumes.some(v => v.id === volumeData.id)) {
                volumeData.id = `VOL-${Date.now().toString().slice(-6)}`;
            }
            pmVolumes.unshift(volumeData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmVolumes', volumeData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ khối lượng: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');

        const vPanel = document.getElementById('pmVolumeContent');
        if (vPanel && window.erpApp && window.erpApp.pmProjects) {
            const activeProject = window.erpApp.pmProjects.find(p => p.id === activeProjectId);
            if (activeProject && typeof renderPmVolume === 'function') {
                vPanel.innerHTML = renderPmVolume(activeProject);
            } else if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                window.erpApp.renderQuanLyDuAn();
            }
        } else {
            if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                window.erpApp.renderQuanLyDuAn();
            }
        }

        window.erpApp.notifyCRUD('Khối lượng', editId ? 'update' : 'add', {
            name: volumeData.name,
            page: 'quan-ly-du-an',
            module: 'Khối lượng',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmDeleteVolume = async (id) => {
        syncGlobalData();
        const volume = pmVolumes.find(v => String(v.id) === String(id));
        if (!volume) return;

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa hạng mục khối lượng <strong>${volume.name || id}</strong>? Thao tác này không thể hoàn tác.`,
            async () => {
                const idx = pmVolumes.findIndex(v => String(v.id) === String(id));
                if (idx !== -1) {
                    const deleted = pmVolumes.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmVolumes', id, 'id');
                    }
                    localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));
                    syncToGlobalData();
                    window.erpApp.showToast(`Đã xóa khối lượng thành công`, 'success');

                    window.erpApp.notifyCRUD('Khối lượng', 'delete', {
                        name: deleted.name,
                        page: 'quan-ly-du-an',
                        module: 'Khối lượng',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                        window.erpApp.renderQuanLyDuAn();
                    }
                }
            }
        );
    };

    // pmClearAllVolumes refactored and moved to pm_logic_extracted.js to avoid duplication

    window.erpApp.pmUpdateVolumeInline = (el) => {
        syncGlobalData();
        const id = el.getAttribute('data-id');
        const field = el.getAttribute('data-field');
        const value = el.value;

        const pmVolumes = window.pmVolumes || [];
        const idx = pmVolumes.findIndex(v => String(v.id) === String(id));
        if (idx !== -1) {
            const numVal = window.erpApp.parseVND(value);
            pmVolumes[idx][field] = numVal;

            if (window.CrudSync) {
                window.CrudSync.saveItem('pmVolumes', pmVolumes[idx], 'id');
            }
            localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));
            window.pmVolumes = pmVolumes; // Global sync

            // Full UI Sync: Re-render the volume panel to ensure Totals, Cumulative and Chart are all perfectly in sync.
            // Since this is called on 'change' (blur/Enter), it's safe to refresh the DOM now.
            if (window.erpApp.currentPage === 'quan-ly-du-an') {
                const pmActiveProjectId = window.erpApp.pmActiveProjectId;
                const pmProjects = window.pmProjects || [];
                const activeProject = pmProjects.find(p => p.id === pmActiveProjectId);

                if (activeProject && typeof window.erpApp.renderPmVolume === 'function') {
                    const vPanel = document.getElementById('pmVolumeContent');
                    if (vPanel) {
                        // Refresh the table first
                        vPanel.innerHTML = window.erpApp.renderPmVolume(activeProject);

                        // Immediately force the chart to update with the new global data
                        if (typeof window.erpApp.updatePmVolumeChartLive === 'function') {
                            window.erpApp.updatePmVolumeChartLive(pmActiveProjectId);
                        }
                    }
                }
            }
        }
    };

    window.erpApp.pmUpdateVolumeLive = (el) => {
        const row = el.closest('tr');
        if (!row) return;

        const fQty = (val) => window.erpApp.formatValue(val, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        const parseVND = (val) => window.erpApp.parseVND(val);

        // Case 1: Field Volume (qty_DD-MM-YY)
        if (el.getAttribute('data-field').startsWith('qty_')) {
            const inputs = row.querySelectorAll('input[data-field^="qty_"]');
            let total = 0;
            inputs.forEach(input => {
                total += parseVND(input.value);
            });

            // "Tổng cộng" is the 2nd to last <td> before the action <td>
            // According to app.js structure for 'field' tab:
            // 0: STT, 1: Name, 2: Unit, 3: Norm, ... dateCells ..., totalCell, cumulativeCell, actionCell
            const cells = row.querySelectorAll('td');
            const totalCell = cells[cells.length - 3];
            const cumulativeCell = cells[cells.length - 2];
            const normCell = cells[3];

            if (totalCell) {
                totalCell.textContent = fQty(total);
            }

            if (cumulativeCell && normCell) {
                const norm = parseVND(normCell.textContent);
                const luyKe = total - norm;
                cumulativeCell.textContent = fQty(luyKe);
                cumulativeCell.style.color = luyKe < 0 ? '#ef4444' : '#10b981';
            }
        }
        // Case 2: Contract Volume (norm, prevActual, actual)
        else if (['norm', 'prevActual', 'actual'].includes(el.getAttribute('data-field'))) {
            const prevInput = row.querySelector('input[data-field="prevActual"]');
            const actualInput = row.querySelector('input[data-field="actual"]');

            if (prevInput && actualInput) {
                const total = parseVND(prevInput.value) + parseVND(actualInput.value);
                const cells = row.querySelectorAll('td');
                const totalCell = cells[6]; // In contract tab: 0:STT, 1:Name, 2:Unit, 3:Norm, 4:Prev, 5:Actual, 6:Total
                if (totalCell) {
                    totalCell.textContent = fQty(total);
                }
            }
        }
    };

    window.erpApp.pmHandleImportVolume = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                jsonData.forEach((row, index) => {
                    const volId = `VOL-IMP-${Date.now()}-${index}`;
                    const vol = {
                        id: volId,
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
                        name: row['Tên hạng mục'] || row['Name'] || 'Không tên',
                        unit: row['ĐVT'] || row['Unit'] || '...',
                        norm: parseFloat(row['Khối lượng HĐ']) || parseFloat(row['Norm']) || 0,
                        prevActual: 0,
                        actual: 0,
                        price: parseFloat(row['Đơn giá']) || parseFloat(row['Price']) || 0,
                        workItem: row['Hạng mục'] || row['WorkItem'] || ''
                    };
                    pmVolumes.push(vol);
                    if (window.CrudSync) {
                        window.CrudSync.saveItem('pmVolumes', vol, 'id');
                    }
                });

                localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));
                window.erpApp.showToast(`Đã nhập ${jsonData.length} hạng mục khối lượng`, 'success');
                window.erpApp.renderQuanLyDuAn();
            } catch (err) {
                window.erpApp.showToast('Lỗi đọc file Excel: ' + err.message, 'error');
            }
        };
        reader.readAsBinaryString(file);
    };

    // ==========================================
    // MATERIAL LOGIC
    // ==========================================
    window.erpApp.pmSaveMaterial = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const materialData = {
            id: editId || `MAT-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            name: formData.get('name'),
            unit: formData.get('unit'),
            quantity: parseVND(formData.get('quantity')),
            price: parseVND(formData.get('price')),
            date: new Date().toISOString().split('T')[0]
        };

        if (editId) {
            const idx = pmMaterials.findIndex(m => m.id === editId);
            if (idx !== -1) {
                pmMaterials[idx] = { ...pmMaterials[idx], ...materialData };
            }
        } else {
            pmMaterials.unshift(materialData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmMaterials', materialData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ vật tư: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmMaterials', JSON.stringify(pmMaterials));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm vật tư thành công!', 'success');

        if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
            window.erpApp.renderQuanLyDuAn();
        }

        window.erpApp.notifyCRUD('Vật tư', editId ? 'update' : 'add', {
            name: materialData.name,
            page: 'quan-ly-du-an',
            module: 'Vật tư',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    // Removed outdated pmDeleteMaterial - Logic moved to pm_logic_extracted.js

    window.erpApp.pmHandleMaterialNameInput = (input) => {
        // Logic for material suggestion could go here
    };

    window.erpApp.pmPrintMaterialProposal = (id) => {
        const mat = pmMaterials.find(m => m.id === id);
        if (!mat) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Phiếu đề xuất vật tư - ${mat.id}</title></head>
                <body style="font-family: Arial, sans-serif; padding: 40px;">
                    <h1 style="text-align: center;">PHIẾU ĐỀ XUẤT VẬT TƯ</h1>
                    <p style="text-align: center;">Mã đề xuất: ${mat.id} | Ngày: ${mat.date}</p>
                    <hr/>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr><th style="text-align: left; padding: 8px;">Tên vật tư</th><td>${mat.name}</td></tr>
                        <tr><th style="text-align: left; padding: 8px;">Đơn vị tính</th><td>${mat.unit}</td></tr>
                        <tr><th style="text-align: left; padding: 8px;">Số lượng</th><td>${window.erpApp.formatValue(mat.quantity)}</td></tr>
                        <tr><th style="text-align: left; padding: 8px;">Dự án</th><td>${(window.pmActiveProjectId || window.erpApp.pmActiveProjectId)}</td></tr>
                    </table>
                    <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                        <div style="text-align: center; width: 200px;"><p>Người lập phiếu</p><br/><br/>(Ký tên)</div>
                        <div style="text-align: center; width: 200px;"><p>Trưởng ban QLDA</p><br/><br/>(Ký tên)</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // ==========================================
    // WORKER & LABOR LOGIC
    // ==========================================
    window.erpApp.pmSaveWorker = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const workerData = {
            id: editId || `W-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            name: formData.get('name'),
            role: formData.get('role'),
            baseWage: window.erpApp.parseVND(formData.get('baseWage')),
            phone: formData.get('phone'),
            idCard: formData.get('idCard'),
            joinDate: window.erpApp.parseInputDate(formData.get('joinDate') || window.erpApp.formatDate(new Date())),
            status: 'active'
        };

        if (editId) {
            const idx = pmWorkers.findIndex(w => w.id === editId);
            if (idx !== -1) {
                pmWorkers[idx] = { ...pmWorkers[idx], ...workerData };
            }
        } else {
            pmWorkers.unshift(workerData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmWorkers', workerData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ công nhân: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm công nhân thành công!', 'success');
        window.erpApp.renderQuanLyDuAn();

        window.erpApp.notifyCRUD('Công nhân', editId ? 'update' : 'add', {
            name: workerData.name,
            page: 'quan-ly-du-an',
            module: 'Nhân công',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmDeleteWorker = async (id) => {
        const worker = pmWorkers.find(w => w.id === id);
        if (!worker) return;

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa nhân công <strong>${worker.name}</strong>? Thao tác này không thể hoàn tác.`,
            async () => {
                const idx = pmWorkers.findIndex(w => w.id === id);
                if (idx !== -1) {
                    const deleted = pmWorkers.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmWorkers', id, 'id');
                    }
                    localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
                    window.erpApp.showToast('Đã xóa nhân công thành công', 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Nhân công', 'delete', {
                        name: deleted.name,
                        page: 'quan-ly-du-an',
                        module: 'Nhân công',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };

    window.erpApp.pmSaveAttendance = async (e, workerId, date) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        // Standardize ID construction
        const safeWorkerId = String(workerId).replace(/[^a-zA-Z0-9]/g, '_');
        const safeDate = String(date).replace(/\//g, '-');
        const logData = {
            id: `${safeWorkerId}_${safeDate}`,
            workerId: workerId,
            date: date,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            normalWork: parseFloat(formData.get('normalWork')) || 0,
            overtime: window.erpApp.parseVND(formData.get('overtime')) || 0,
            notes: formData.get('notes') || ''
        };

        const idx = pmAttendanceLogs.findIndex(l => l.workerId === workerId && l.date === date);
        if (idx !== -1) {
            pmAttendanceLogs[idx] = { ...pmAttendanceLogs[idx], ...logData };
        } else {
            pmAttendanceLogs.push(logData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmAttendanceLogs', logData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ chấm công: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmAttendanceLogs', JSON.stringify(pmAttendanceLogs));
        syncToGlobalData();

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã lưu chấm công', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmOpenAddWorkerModal = () => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#3b82f6;">person_add</span> Thêm Nhân công mới
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveWorker(event)">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Họ và Tên</label>
                            <input type="text" name="name" required placeholder="Nhập tên nhân công..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chức vụ/Tổ đội</label>
                                <input type="text" name="role" required placeholder="VD: Thợ nề, Thợ điện..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Lương cơ bản (Công/Ngày)</label>
                                <input type="text" name="baseWage" required placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#10b981; outline:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số điện thoại</label>
                                <input type="text" name="phone" placeholder="0xxx..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày vào làm</label>
                                <input type="text" name="joinDate" class="erp-datepicker" value="${window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#3b82f6; color:#fff; font-weight:700; cursor:pointer;">Lưu nhân công</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        window.erpApp.initDatePickers(overlay);
    };

    window.erpApp.pmOpenEditWageModal = (workerId) => {
        const worker = pmWorkers.find(w => w.id === workerId);
        if (!worker) return;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:450px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <div style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Điều chỉnh mức lương</div>
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${worker.name}</h2>
                </div>
                <form onsubmit="window.erpApp.pmSaveWage(event, '${workerId}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Lương cơ bản hiện tại (VNĐ/Ngày)</label>
                            <input type="text" name="baseWage" value="${window.erpApp.formatValue(worker.baseWage)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:18px; font-weight:900; color:#10b981; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Lương tăng ca (VNĐ/Giờ)</label>
                            <input type="text" name="otWage" id="pm_ot_wage" value="${window.erpApp.formatValue(worker.otWage || (worker.baseWage / 8 * 1.5))}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#f59e0b; outline:none;">
                            <button type="button" onclick="window.erpApp.pmAutoCalcOtWage('${workerId}')" style="margin-top:8px; background:none; border:none; color:#3b82f6; font-size:11px; font-weight:700; cursor:pointer; text-decoration:underline;">Tự động tính (x1.5)</button>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer;">Cập nhật lương</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmAutoCalcOtWage = (workerId) => {
        const worker = pmWorkers.find(w => w.id === workerId);
        if (!worker) return;
        const base = window.erpApp.parseVND(document.querySelector('[name="baseWage"]').value);
        const ot = Math.round((base / 8) * 1.5);
        document.getElementById('pm_ot_wage').value = window.erpApp.formatValue(ot);
    };

    window.erpApp.pmSaveWage = async (e, workerId) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const idx = pmWorkers.findIndex(w => w.id === workerId);
        if (idx !== -1) {
            pmWorkers[idx].baseWage = window.erpApp.parseVND(formData.get('baseWage'));
            pmWorkers[idx].otWage = window.erpApp.parseVND(formData.get('otWage'));

            if (window.CrudSync) {
                window.CrudSync.saveItem('pmWorkers', pmWorkers[idx], 'id')
                    .catch(err => window.erpApp.showToast('Lỗi đồng bộ lương: ' + err.message, 'error'));
            }
            localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
            syncToGlobalData();

            form.closest('.modal-overlay').remove();
            window.erpApp.showToast('Đã cập nhật mức lương', 'success');
            window.erpApp.renderQuanLyDuAn();
        }
    };

    // ==========================================
    // FINANCE LOGIC
    // ==========================================
    window.erpApp.pmCalcFinanceTotal = () => {
        const rows = document.querySelectorAll('#pmFinanceTableBody tr');
        let totalThu = 0;
        let totalChi = 0;
        rows.forEach(row => {
            const amount = window.erpApp.parseVND(row.cells[4].textContent);
            const type = row.cells[1].textContent.toLowerCase();
            if (type.includes('thu')) totalThu += amount;
            else totalChi += amount;
        });
        document.getElementById('pmTotalFinanceThu').textContent = window.erpApp.formatValue(totalThu);
        document.getElementById('pmTotalFinanceChi').textContent = window.erpApp.formatValue(totalChi);
        document.getElementById('pmTotalFinanceBalance').textContent = window.erpApp.formatValue(totalThu - totalChi);
    };

    window.erpApp.pmHandleTempUpload = (inputOrEvent) => {
        const input = inputOrEvent && inputOrEvent.target ? inputOrEvent.target : inputOrEvent;
        if (!input || !input.files) return;
        const files = input.files;
        const preview = document.getElementById('pmTempFilePreview');
        if (!preview) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'pm-file-item';
                item.dataset.fileName = file.name;
                item.dataset.fileType = file.type.includes('image') ? 'image' : 'pdf';
                item.dataset.fileData = e.target.result;

                item.style = 'display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; padding:6px 12px; border-radius:8px; margin:4px; font-size:12px;';
                item.innerHTML = `
                    <span class="material-icons-outlined" style="font-size:16px; color:#64748b;">${file.type.includes('image') ? 'image' : 'description'}</span>
                    <span class="file-info" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${file.name}</span>
                    <button type="button" onclick="this.closest('.pm-file-item').remove()" style="border:none; background:none; color:#ef4444; cursor:pointer; padding:0; display:flex;"><span class="material-icons-outlined" style="font-size:16px;">cancel</span></button>
                `;
                preview.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    };

    window.erpApp.pmAddTempLink = () => {
        const linkInput = document.getElementById('pmTempLinkUrl') || document.getElementById('pmTempLinkInput') || document.getElementById('pmNewContractLinkInput');
        const nameInput = document.getElementById('pmTempLinkName');
        const preview = document.getElementById('pmTempFilePreview');
        if (!linkInput || !preview || !linkInput.value.trim()) return;

        const url = linkInput.value.trim();
        const displayName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : url;
        const item = document.createElement('div');
        item.className = 'pm-file-item';
        item.dataset.fileName = displayName;
        item.dataset.fileType = 'link';
        item.dataset.fileData = url;

        item.style = 'display:inline-flex; align-items:center; gap:8px; background:#e0f2fe; padding:6px 12px; border-radius:8px; margin:4px; font-size:12px; border:1px solid #bae6fd; cursor:pointer;';
        item.onclick = (ev) => {
            if (ev.target.closest('button')) return;
            if (window.erpApp.pmOpenFile) window.erpApp.pmOpenFile(url);
            else window.open(url, '_blank');
        };

        item.innerHTML = `
            <span class="material-icons-outlined" style="font-size:16px; color:#0369a1;">link</span>
            <span class="file-info" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#0369a1; font-weight:700;">${displayName}</span>
            <button type="button" onclick="event.stopPropagation(); this.closest('.pm-file-item').remove()" style="border:none; background:none; color:#ef4444; cursor:pointer; padding:0; display:flex;"><span class="material-icons-outlined" style="font-size:16px;">cancel</span></button>
        `;
        preview.appendChild(item);
        linkInput.value = '';
        if (nameInput) nameInput.value = '';
    };

    window.erpApp.pmOpenFile = (fileData) => {
        if (!fileData) return;
        if (fileData.startsWith('http') || fileData.startsWith('www')) {
            window.open(fileData.startsWith('http') ? fileData : 'https://' + fileData, '_blank');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(0,0,0,0.8); position:fixed; top:0; left:0; width:100%; height:100%; z-index:10000; display:flex; align-items:center; justify-content:center; padding:40px;';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        if (fileData.startsWith('data:image')) {
            overlay.innerHTML = `<img src="${fileData}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">`;
        } else {
            overlay.innerHTML = `<iframe src="${fileData}" style="width:100%; height:100%; border:none; border-radius:8px;"></iframe>`;
        }
        document.body.appendChild(overlay);
    };

    window.erpApp.pmSaveFinanceRecord = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const vouchers = [...tempContractFiles];

        const financeData = {
            id: editId || `FIN-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            type: formData.get('type'),
            date: window.erpApp.parseInputDate(formData.get('date')),
            content: formData.get('content'),
            category: formData.get('category'),
            amount: window.erpApp.parseVND(formData.get('amount')),
            vouchers: vouchers
        };

        if (editId) {
            const idx = pmFinanceRecords.findIndex(r => r.id === editId);
            if (idx !== -1) {
                pmFinanceRecords[idx] = { ...pmFinanceRecords[idx], ...financeData };
            }
        } else {
            pmFinanceRecords.unshift(financeData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmFinanceRecords', financeData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ tài chính: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmFinanceRecords', JSON.stringify(pmFinanceRecords));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm chứng từ thành công!', 'success');
        window.erpApp.renderQuanLyDuAn();

        window.erpApp.notifyCRUD('Tài chính', editId ? 'update' : 'add', {
            name: financeData.content,
            page: 'quan-ly-du-an',
            module: 'Tài chính',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmDeleteFinanceRecord = async (id) => {
        const record = pmFinanceRecords.find(r => r.id === id);
        if (!record) return;

        window.erpApp.showDeleteConfirmation(
            `Bạn có chắc chắn muốn xóa chứng từ <strong>${record.content || id}</strong>? Thao tác này không thể hoàn tác.`,
            async () => {
                const idx = pmFinanceRecords.findIndex(r => r.id === id);
                if (idx !== -1) {
                    const deleted = pmFinanceRecords.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmFinanceRecords', id, 'id');
                    }
                    localStorage.setItem('erp_pmFinanceRecords', JSON.stringify(pmFinanceRecords));
                    window.erpApp.showToast('Đã xóa chứng từ thành công', 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Tài chính', 'delete', {
                        name: deleted.content,
                        page: 'quan-ly-du-an',
                        module: 'Tài chính',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };

    // ==========================================
    // CONTRACTED EXPENSE LOGIC
    // ==========================================
    window.erpApp.pmOpenAddContractedExpenseModal = (editId = null, isView = false) => {
        const contract = editId ? pmContracts.find(c => c.id === editId) : null;
        const fM = (val) => window.erpApp.formatValue(val);

        tempContractFiles = contract && contract.vouchers ? [...contract.vouchers] : [];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
                <div class="modal-content" style="width:750px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:#6366f1;">${isView ? 'visibility' : 'handshake'}</span> ${isView ? 'Chi tiết hợp đồng khoán' : (contract ? 'Sửa hợp đồng khoán' : 'Thêm hợp đồng khoán/nội bộ mới')}
                        </h2>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form onsubmit="${isView ? 'event.preventDefault(); this.closest(\'.modal-overlay\').remove();' : `window.erpApp.pmSaveContractedExpenseRecord(event, ${contract ? `'${contract.id}'` : 'null'})`}">
                        <div style="padding:24px; max-height:75vh; overflow-y:auto;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã hợp đồng</label>
                                    <input type="text" name="id" value="${contract ? contract.id : ''}" ${contract || isView ? 'readonly' : ''} required placeholder="VD: HĐK-001" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700; background:${contract || isView ? '#f8fafc' : '#fff'};">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên hợp đồng/Nội dung</label>
                                    <input type="text" name="title" value="${contract ? contract.title : ''}" ${isView ? 'readonly' : ''} required placeholder="VD: Khoán nhân công xây tường..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đối tác/Tổ đội</label>
                                    <input type="text" name="partner" value="${contract ? contract.partner : ''}" ${isView ? 'readonly' : ''} required placeholder="Tên tổ trưởng/Công ty thầu phụ" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giá trị hợp đồng (VNĐ)</label>
                                    <input type="text" name="value" value="${contract ? fM(contract.value) : ''}" ${isView ? 'readonly' : ''} required placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#2563eb; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Phân loại</label>
                                    <select name="category" ${isView ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                                        <option value="nhan-cong" ${contract && contract.category === 'nhan-cong' ? 'selected' : ''}>Nhân công</option>
                                        <option value="vat-tu" ${contract && contract.category === 'vat-tu' ? 'selected' : ''}>Vật tư</option>
                                        <option value="thau-phu" ${contract && contract.category === 'thau-phu' ? 'selected' : ''}>Thầu phụ trọn gói</option>
                                        <option value="khac" ${contract && contract.category === 'khac' ? 'selected' : ''}>Khác</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày ký kết</label>
                                    <input type="text" name="signDate" class="erp-datepicker" value="${contract && contract.signDate ? window.erpApp.formatDate(contract.signDate) : window.erpApp.formatDate(new Date())}" ${isView ? 'readonly' : ''} placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tỷ lệ giữ lại bảo hành (%)</label>
                                    <input type="number" name="retentionRate" value="${contract ? contract.retentionRate : 5}" step="0.1" ${isView ? 'readonly' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                                    <select name="status" ${isView ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                                        <option value="dang-thuc-hien" ${contract && contract.status === 'dang-thuc-hien' ? 'selected' : ''}>Đang thực hiện</option>
                                        <option value="da-hoan-thanh" ${contract && contract.status === 'da-hoan-thanh' ? 'selected' : ''}>Đã hoàn thành</option>
                                        <option value="da-thanh-ly" ${contract && contract.status === 'da-thanh-ly' ? 'selected' : ''}>Đã thanh lý</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- MODERN FILE MANAGEMENT AREA -->
                            <div class="form-group" style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:8px;">
                                <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Hồ sơ đính kèm (Ảnh / PDF / Hợp đồng quét)</label>
                                
                                ${isView ? '' : `
                                <div style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                    <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                    <select id="pmContractDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadContractDriveFolderChain(null, 0)">
                                        <option value="">⏳ Đang tải thư mục...</option>
                                    </select>
                                    <div id="pmContractDriveFolderChain" style="display:contents"></div>
                                    <button type="button" onclick="window.erpApp.loadContractDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                        <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                    </button>
                                    <button type="button" onclick="window.erpApp.createContractDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                        <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                    </button>
                                </div>
                                <div id="pmContractDriveFolderPathText" style="font-size:12px; color:#0d9488; font-weight:700; margin-top:4px; margin-bottom:8px; display:${existingDrivePath ? 'block' : 'none'};" data-initial-path="${existingDrivePath}">
                                    ${existingDrivePath ? `Thư mục hiện tại: ${existingDrivePath}` : ''}
                                </div>

                                <div class="contract-upload-area" style="margin-bottom: 16px;">
                                    <label for="pmContractFileInput" class="upload-label" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; border:2px dashed #3b82f6; border-radius:16px; cursor:pointer; background:#f8fafc; transition: 0.2s; min-height:120px;" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='#f8fafc'">
                                        <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6;">cloud_upload</span>
                                        <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                        <span style="font-size:11px; color:#64748b; font-weight:500;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                    </label>
                                    <input type="file" id="pmContractFileInput" multiple onchange="window.erpApp.pmHandleContractFileUpload(event)" style="display:none;">
                                </div>

                                <div style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:16px; margin-bottom:16px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:12px;">
                                        <span class="material-icons-outlined" style="font-size:16px; color:#3b82f6;">link</span> Thêm file bằng đường link
                                    </label>
                                    <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                        <div style="flex:1; min-width:140px;">
                                            <input type="text" id="pmContractLinkName" placeholder="VD: Bảng phụ lục..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                        </div>
                                        <div style="flex:2; min-width:200px;">
                                            <input type="url" id="pmContractLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                        </div>
                                        <button type="button" onclick="window.erpApp.pmAddContractFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                            <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                        </button>
                                    </div>
                                </div>
                                `}

                                <!-- File list container -->
                                <div id="pmContractFileList" style="margin-top:16px;">
                                    ${window.erpApp.renderContractFileList ? window.erpApp.renderContractFileList(tempContractFiles, !isView) : ''}
                                </div>
                            </div>
                        </div>
                        <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:14px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">${isView ? 'Đóng' : 'Hủy bỏ'}</button>
                            ${isView ? '' : `<button type="submit" style="padding:12px 24px; border-radius:14px; border:none; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">${contract ? 'Cập nhật hợp đồng' : 'Xác nhận thêm'}</button>`}
                        </div>
                    </form>
                </div>
            `;
        document.body.appendChild(overlay);

        if (!isView) {
            setTimeout(() => {
                window.erpApp.loadContractDriveRootFolders(null, 'hop-dong');
            }, 100);
        }

        if (!contract) {
            const lastId = pmContracts.filter(c => c.id.startsWith('HĐK-')).length;
            document.querySelector('[name="id"]').value = `HĐK-${String(lastId + 1).padStart(3, '0')}`;
        }

        if (!isView) {
            window.erpApp.initDatePickers(overlay);
        }
    };

    window.erpApp.pmSaveContractedExpenseRecord = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const cleanNum = (str) => window.erpApp.parseVND(str);

        const vouchers = [...tempContractFiles];

        const contractData = {
            id: formData.get('id'),
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            type: 'inbound',
            title: formData.get('title'),
            value: cleanNum(formData.get('value')),
            signDate: window.erpApp.parseInputDate(formData.get('signDate')),
            partner: formData.get('partner'),
            status: formData.get('status'),
            category: formData.get('category'),
            retentionRate: parseFloat(formData.get('retentionRate')) || 0,
            isContracted: true,
            vouchers: vouchers
        };

        if (editId) {
            const idx = pmContracts.findIndex(c => c.id === editId);
            if (idx !== -1) {
                pmContracts[idx] = { ...pmContracts[idx], ...contractData };
            }
        } else {
            if (pmContracts.some(c => c.id === contractData.id)) {
                window.erpApp.showToast('Mã hợp đồng đã tồn tại!', 'error');
                return;
            }
            pmContracts.unshift(contractData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmContracts', contractData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ chi phí khoán: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
        window.erpApp.renderQuanLyDuAn();

        window.erpApp.notifyCRUD('Hợp đồng khoán', editId ? 'update' : 'add', {
            name: contractData.title,
            page: 'quan-ly-du-an',
            module: 'Chi phí khoán',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmDeleteContractedExpenseRecord = async (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa chi phí khoán!', 'error');
            return;
        }

        const record = pmContracts.find(c => c.id === id);
        if (!record) return;

        window.erpApp.showDeleteConfirmation(
            "Chi phí khoán",
            record.title || id,
            async () => {
                const idx = pmContracts.findIndex(c => c.id === id);
                if (idx !== -1) {
                    const deleted = pmContracts.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmContracts', id, 'id');
                    }
                    localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));
                    window.erpApp.showToast(`Đã xóa chi phí khoán thành công`, 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Chi phí khoán', 'delete', {
                        name: deleted.title,
                        page: 'quan-ly-du-an',
                        module: 'Chi phí khoán',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };

    // ==========================================
    // EQUIPMENT LOGIC
    // ==========================================
    window.erpApp.pmSaveEquipment = async (e, editCode = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const equipmentData = {
            id: editCode ? pmEquipment.find(eq => eq.code === editCode).id : `EQ-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            code: formData.get('code') || editCode,
            name: formData.get('name'),
            type: formData.get('type'),
            operator: formData.get('operator'),
            fuelType: formData.get('fuelType'),
            fuelNorm: parseFloat(formData.get('fuelNorm')) || 0,
            ownership: formData.get('ownership'),
            internalShiftRate: parseVND(formData.get('internalShiftRate')),
            maintCost: parseVND(formData.get('maintCost')) || 0,
            status: formData.get('status') || 'dang-hoat-dong',
            arrivalDate: new Date().toISOString().split('T')[0]
        };

        if (editCode) {
            const idx = pmEquipment.findIndex(eq => eq.code === editCode);
            if (idx !== -1) {
                pmEquipment[idx] = { ...pmEquipment[idx], ...equipmentData };
            }
        } else {
            // Update master registry status
            const masterIdx = vmVehicles.findIndex(v => v.id === equipmentData.code);
            if (masterIdx !== -1) {
                vmVehicles[masterIdx].status = 'Đang đi';
                vmVehicles[masterIdx].location = (window.pmActiveProjectId || window.erpApp.pmActiveProjectId);
                if (window.CrudSync) window.CrudSync.saveItem('vmVehicles', vmVehicles[masterIdx], 'id');
                localStorage.setItem('erp_vmVehicles', JSON.stringify(vmVehicles));
            }
            pmEquipment.unshift(equipmentData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmEquipment', equipmentData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ thiết bị: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmEquipment', JSON.stringify(pmEquipment));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editCode ? 'Cập nhật thành công!' : 'Điều động thiết bị thành công!', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmWithdrawEquipment = async (code) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền rút thiết bị!', 'error');
            return;
        }

        window.erpApp.showDeleteConfirmation(
            "Rút thiết bị về kho",
            code,
            async () => {
                const idx = pmEquipment.findIndex(e => e.code === code);
                if (idx !== -1) {
                    const eq = pmEquipment.splice(idx, 1)[0];

                    // Update master registry
                    const masterIdx = vmVehicles.findIndex(v => v.id === code);
                    if (masterIdx !== -1) {
                        vmVehicles[masterIdx].status = 'Sẵn sàng';
                        vmVehicles[masterIdx].location = 'Kho trung tâm';
                        if (window.CrudSync) window.CrudSync.saveItem('vmVehicles', vmVehicles[masterIdx], 'id');
                        localStorage.setItem('erp_vmVehicles', JSON.stringify(vmVehicles));
                    }

                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmEquipment', eq.id, 'id');
                    }
                    localStorage.setItem('erp_pmEquipment', JSON.stringify(pmEquipment));
                    window.erpApp.showToast(`Đã rút thiết bị ${code} về kho`, 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Thiết bị', 'delete', {
                        name: `Rút thiết bị ${code}`,
                        page: 'quan-ly-du-an',
                        module: 'Thiết bị',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };

    window.erpApp.pmSaveMachineLog = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const logData = {
            id: editId || `ML-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            equipmentId: formData.get('equipmentId'),
            date: window.erpApp.parseInputDate(formData.get('date')),
            actualFuel: parseVND(formData.get('actualFuel')),
            morningHours: parseFloat(formData.get('morningHours')) || 0,
            afternoonHours: parseFloat(formData.get('afternoonHours')) || 0,
            startKm: parseInt(formData.get('startKm')) || 0,
            endKm: parseInt(formData.get('endKm')) || 0,
            paidAmount: parseVND(formData.get('paidAmount')) || 0,
            workNotes: formData.get('workNotes')
        };

        if (editId) {
            const idx = pmMachineLogs.findIndex(l => l.id === editId);
            if (idx !== -1) pmMachineLogs[idx] = { ...pmMachineLogs[idx], ...logData };
        } else {
            pmMachineLogs.unshift(logData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmMachineLogs', logData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ nhật ký máy: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmMachineLogs', JSON.stringify(pmMachineLogs));
        syncToGlobalData();

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã lưu nhật ký ca máy', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmSaveMaintenance = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const maintData = {
            id: editId || `MT-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            equipmentId: formData.get('equipmentId'),
            date: window.erpApp.parseInputDate(formData.get('date')),
            type: formData.get('type'),
            cost: parseVND(formData.get('cost')),
            paidAmount: parseVND(formData.get('paidAmount')) || 0,
            content: formData.get('content')
        };

        if (editId) {
            const idx = pmMaintenanceLogs.findIndex(l => l.id === editId);
            if (idx !== -1) pmMaintenanceLogs[idx] = { ...pmMaintenanceLogs[idx], ...maintData };
        } else {
            pmMaintenanceLogs.unshift(maintData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmMaintenanceLogs', maintData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ bảo trì: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmMaintenanceLogs', JSON.stringify(pmMaintenanceLogs));
        syncToGlobalData();

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã lưu thông tin bảo trì', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmDeleteEquipment = async (code) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền rút thiết bị khỏi dự án!', 'error');
            return;
        }

        window.erpApp.showDeleteConfirmation(
            'Rút thiết bị khỏi dự án',
            code,
            async function () {
                const idx = pmEquipment.findIndex(e => e.code === code);
                if (idx !== -1) {
                    const eq = pmEquipment[idx];
                    const eqId = eq.id;

                    // 1. Xóa Nhật ký ca máy liên quan
                    const logsToDelete = pmMachineLogs.filter(l => l.equipmentId === eqId && l.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));
                    const remainingLogs = pmMachineLogs.filter(l => !(l.equipmentId === eqId && l.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)));
                    pmMachineLogs.length = 0;
                    remainingLogs.forEach(l => pmMachineLogs.push(l));

                    // 2. Xóa Bảo trì & Sửa chữa liên quan
                    const maintToDelete = pmMaintenanceLogs.filter(l => l.equipmentId === eqId && l.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));
                    const remainingMaint = pmMaintenanceLogs.filter(l => !(l.equipmentId === eqId && l.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)));
                    pmMaintenanceLogs.length = 0;
                    remainingMaint.forEach(l => pmMaintenanceLogs.push(l));

                    // 3. Xóa đồng bộ sang VM Maintenance (nếu có)
                    if (typeof vmMaintenance !== 'undefined') {
                        const vmRemaining = vmMaintenance.filter(m => !maintToDelete.some(mt => mt.id === m.id));
                        vmMaintenance.length = 0;
                        vmRemaining.forEach(m => vmMaintenance.push(m));
                    }

                    // Cloud Sync (Async)
                    if (window.CrudSync) {
                        logsToDelete.forEach(l => window.CrudSync.deleteItem('pmMachineLogs', l.id, 'id'));
                        maintToDelete.forEach(m => window.CrudSync.deleteItem('pmMaintenanceLogs', m.id, 'id'));
                        window.CrudSync.deleteItem('pmEquipment', eqId, 'id');
                    }

                    // 🔄 Sync back to Master Registry and Vehicle Management
                    const m = masterEquipmentRegistry.find(item => item.code === eq.code);
                    if (m) {
                        m.status = 'san-sang';
                        m.location = 'Kho Tổng';
                    }

                    const v = vmVehicles.find(item => item.id === eq.code);
                    if (v) {
                        v.status = 'Sẵn sàng';
                        v.location = 'Kho Tổng';
                    }

                    // 🔄 Close active dispatches for this equipment in this project
                    const vmUsage = window.erpApp._getData('vmUsage') || [];
                    const activeProject = pmProjects.find(p => p.id === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));
                    const projectTag = activeProject ? activeProject.name : (window.pmActiveProjectId || window.erpApp.pmActiveProjectId);

                    // Fuzzy matching for route closure (Triệt để)
                    const normalize = (s) => (s || '').toString().trim().toLowerCase();
                    const routeNorm = normalize(projectTag);
                    const idNorm = normalize((window.pmActiveProjectId || window.erpApp.pmActiveProjectId));

                    vmUsage.forEach(u => {
                        if (u.vId === eq.code && u.status === 'Đang đi') {
                            const uRouteNorm = normalize(u.route);
                            const isMatch = uRouteNorm === routeNorm ||
                                uRouteNorm.includes(routeNorm) ||
                                routeNorm.includes(uRouteNorm) ||
                                uRouteNorm === idNorm;

                            if (isMatch) {
                                console.log(`🧹 [Sync] Force-closing dispatch ${u.id} for ${u.vId} to project ${projectTag}`);
                                u.status = 'Hoàn thành';
                            }
                        }
                    });

                    // --- GLOBAL SYNC ---
                    // Sync to LocalStorage (Always)
                    localStorage.setItem('erp_pmMachineLogs', JSON.stringify(pmMachineLogs));
                    localStorage.setItem('erp_pmMaintenanceLogs', JSON.stringify(pmMaintenanceLogs));
                    localStorage.setItem('erp_pmEquipment', JSON.stringify(pmEquipment));

                    // Sync to Cloud (Always)
                    if (window.CrudSync) {
                        window.CrudSync.saveItem('pmEquipment', pmEquipment, 'id');
                    }

                    // Sync to UI (Integrated environments)
                    if (window.erpApp && window.erpApp._setData) {
                        window.erpApp._setData('pmMachineLogs', pmMachineLogs);
                        window.erpApp._setData('pmMaintenanceLogs', pmMaintenanceLogs);
                        if (typeof vmMaintenance !== 'undefined') { window.erpApp._setData('vmMaintenance', vmMaintenance); }
                        window.erpApp._setData('vmVehicles', vmVehicles);
                        window.erpApp._setData('vmUsage', vmUsage);
                        window.erpApp._setData('masterEquipmentRegistry', masterEquipmentRegistry);

                        pmEquipment.splice(idx, 1);
                        window.erpApp._setData('pmEquipment', pmEquipment);
                    } else {
                        pmEquipment.splice(idx, 1);
                    }

                    window.erpApp.showToast(`Đã rút thiết bị ${code} và xóa dữ liệu vận hành liên quan.`, 'success');

                    // Trigger Notification
                    window.erpApp.notifyCRUD('Thiết bị', 'delete', {
                        id: code,
                        page: 'quan-ly-du-an',
                        module: 'Thiết bị',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    window.erpApp.renderQuanLyDuAn();
                }
            }
        );
    };

    window.erpApp.pmSaveLabor = async (e, editTeam = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const cleanNum = (str) => window.erpApp.parseVND(str);

        const laborData = {
            team: editTeam || formData.get('team'),
            date: window.erpApp.parseInputDate(formData.get('date')) || new Date().toISOString().split('T')[0],
            count: cleanNum(formData.get('count')),
            work: formData.get('work'),
            manager: formData.get('manager')
        };

        if (editTeam) {
            const idx = pmLaborLogs.findIndex(item => item.team === editTeam);
            if (idx !== -1) { pmLaborLogs[idx] = laborData; }
        } else {
            pmLaborLogs.unshift(laborData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmLaborLogs', laborData, 'team')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ chấm công: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmLaborLogs', JSON.stringify(pmLaborLogs));
        syncToGlobalData();

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editTeam ? 'Cập nhật chấm công thành công!' : 'Thêm chấm công tổ đội thành công!', 'success');
        if ((window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') && window.erpApp.pmActiveTab === 'labor') { window.erpApp.renderQuanLyDuAn(); }

        // Trigger Notification
        window.erpApp.notifyCRUD('Chấm công tổ đội', editTeam ? 'update' : 'add', {
            name: laborData.team,
            page: 'quan-ly-du-an',
            module: 'Nhân sự',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmOpenAddWorkerModal = (id = null) => {
        const w = id ? pmWorkers.find(item => item.id === id) : null;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#3b82f6;">${id ? 'edit' : 'person_add'}</span> ${id ? 'Cập nhật công nhân' : 'Thêm công nhân mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveWorker(event, '${id || ''}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Họ và tên</label>
                            <input type="text" name="name" value="${w ? w.name : ''}" required placeholder="VD: Nguyễn Văn A..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giới tính</label>
                                <select name="gender" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                    <option value="Nam" ${w && w.gender === 'Nam' ? 'selected' : ''}>Nam</option>
                                    <option value="Nữ" ${w && w.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số điện thoại</label>
                                <input type="text" name="phone" value="${w ? w.phone : ''}" placeholder="09xxx..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chức vụ / Tay nghề</label>
                                <input type="text" name="position" value="${w ? w.position : ''}" required placeholder="VD: Thợ nề..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tổ đội / Bộ phận</label>
                                <input type="text" name="team" list="pmTeamList" value="${w ? w.team : ''}" required placeholder="Chọn tổ đội..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                            <select name="status" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                                <option value="dang-lam" ${w && w.status === 'dang-lam' ? 'selected' : ''}>Đang làm việc</option>
                                <option value="da-nghi" ${w && w.status === 'da-nghi' ? 'selected' : ''}>Đã nghỉ việc</option>
                            </select>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#3b82f6; color:#fff; font-weight:700; cursor:pointer;">${id ? 'Cập nhật' : 'Thêm mới'}</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmSaveWorker = (e, id = '') => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const workerData = {
            id: id || 'W-' + Date.now().toString().slice(-4),
            name: formData.get('name'),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            position: formData.get('position'),
            team: formData.get('team'),
            status: formData.get('status'),
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        };

        if (id) {
            const idx = pmWorkers.findIndex(w => w.id === id);
            if (idx !== -1) { pmWorkers[idx] = workerData; }
        } else {
            pmWorkers.push(workerData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmWorkers', workerData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ nhân sự: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
        syncToGlobalData();

        e.target.closest('.modal-overlay').remove();
        window.erpApp.showToast(id ? 'Đã cập nhật công nhân' : 'Đã thêm công nhân mới', 'success');
        window.erpApp.renderQuanLyDuAn();

        // Trigger Notification
        window.erpApp.notifyCRUD('Nhân sự', id ? 'update' : 'add', {
            name: workerData.name,
            page: 'quan-ly-du-an',
            module: 'Nhân sự',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmOpenAttendanceEditModal = (workerId, dateStr) => {
        const w = pmWorkers.find(item => item.id === workerId);
        if (!w) { return; }

        const log = pmAttendanceLogs.find(l => l.workerId === workerId && l.date === dateStr);
        const normalWork = log ? log.normalWork : 0;
        const overtime = log ? log.overtime : 0;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:400px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <h2 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">Chấm công ngày ${dateStr.split('-').reverse().join('/')}</h2>
                    <div style="font-size:13px; color:#64748b; margin-top:4px;">Nhân sự: <span style="font-weight:700; color:#2563eb;">${w.name}</span></div>
                </div>
                <form onsubmit="window.erpApp.pmSaveAttendance(event, '${workerId}', '${dateStr}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; transition:0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e2e8f0'">
                                <input type="checkbox" name="normalWork" ${normalWork ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                                <div style="flex:1;">
                                    <div style="font-size:14px; font-weight:800; color:#1e293b;">Có mặt (Công ngày)</div>
                                    <div style="font-size:11px; color:#64748b;">Tích chọn nếu nhân sự đi làm bình thường</div>
                                </div>
                            </label>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số giờ tăng ca (h)</label>
                            <input type="text" name="overtime" value="${window.erpApp.formatValue(overtime)}" oninput="window.erpApp.formatQuantityInput(this)" placeholder="Nhập số giờ..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:700; outline:none; color:#f59e0b;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#2563eb; color:#fff; font-weight:700; cursor:pointer;">Cập nhật</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmSaveAttendance = (e, workerId, dateStr) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const normalWork = formData.get('normalWork') ? 1 : 0;
        const overtime = window.erpApp.parseVND(formData.get('overtime'));

        let log = pmAttendanceLogs.find(l => l.workerId === workerId && l.date === dateStr);
        if (log) {
            log.normalWork = normalWork;
            log.overtime = overtime;
            if (!log.id) { log.id = `${workerId}_${dateStr}`; }
        } else {
            const safeWorkerId = String(workerId).replace(/[^a-zA-Z0-9]/g, '_');
            const safeDate = String(dateStr).replace(/\//g, '-');
            pmAttendanceLogs.push({ id: `${safeWorkerId}_${safeDate}`, workerId, date: dateStr, normalWork, overtime });
        }

        if (window.CrudSync) {
            const currentLog = pmAttendanceLogs.find(l => l.workerId === workerId && l.date === dateStr);
            window.CrudSync.saveItem('pmAttendanceLogs', currentLog, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ chấm công: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmAttendanceLogs', JSON.stringify(pmAttendanceLogs));
        syncToGlobalData();

        e.target.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã cập nhật chấm công', 'success');
        window.erpApp.renderQuanLyDuAn();

        // Trigger Notification
        const w = pmWorkers.find(item => item.id === workerId);
        window.erpApp.notifyCRUD('Chấm công', 'update', {
            name: `${w ? w.name : workerId} (${dateStr})`,
            page: 'quan-ly-du-an',
            module: 'Nhân sự',
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
        });
    };

    window.erpApp.pmOpenWageEditModal = (workerId) => {
        const w = pmWorkers.find(item => item.id === workerId);
        if (!w) { return; }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:400px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <h2 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">Cập nhật định mức lương</h2>
                    <div style="font-size:13px; color:#64748b; margin-top:4px;">Nhân sự: <span style="font-weight:700; color:#2563eb;">${w.name}</span></div>
                </div>
                <form onsubmit="window.erpApp.pmSaveWage(event, '${workerId}')">
                    <div style="padding:24px;">
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Lương ngày công (VNĐ)</label>
                            <input type="text" name="dailyWage" value="${window.erpApp.formatValue(w.dailyWage || 0)}" oninput="window.erpApp.formatNumberInput(this); window.erpApp.pmAutoCalcOtWage(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:700; outline:none; color:#1e293b;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Lương tăng ca / Giờ (VNĐ) <span style="text-transform:none; color:#3b82f6; font-size:10px;">(Tự động: Lương ngày/8 * 1.5)</span></label>
                            <input type="text" name="otWage" value="${window.erpApp.formatValue(w.otWage || 0)}" readonly style="width:100%; padding:12px; border:1.5px solid #f1f5f9; border-radius:12px; font-size:16px; font-weight:700; outline:none; color:#f59e0b; background:#f8fafc;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer;">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmAutoCalcOtWage = (el) => {
        const daily = window.erpApp.parseVND(el.value);
        const ot = Math.round((daily / 8) * 1.5);
        const otInput = el.closest('form').querySelector('input[name="otWage"]');
        if (otInput) {
            otInput.value = window.erpApp.formatValue(ot);
        }
    };

    window.erpApp.pmSaveWage = (e, workerId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const cleanNum = (str) => window.erpApp.parseVND(str);

        const dailyWage = cleanNum(formData.get('dailyWage'));
        const otWage = Math.round((dailyWage / 8) * 1.5);

        const idx = pmWorkers.findIndex(w => w.id === workerId);
        if (idx !== -1) {
            pmWorkers[idx].dailyWage = dailyWage;
            pmWorkers[idx].otWage = otWage;
            if (window.CrudSync) {
                window.CrudSync.saveItem('pmWorkers', pmWorkers[idx], 'id')
                    .catch(err => window.erpApp.showToast('Lỗi đồng bộ lương: ' + err.message, 'error'));
            }
            localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
        }

        e.target.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã cập nhật định mức lương', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmDeleteWorker = (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa nhân sự!', 'error');
            return;
        }

        const worker = pmWorkers.find(w => w.id === id);
        if (!worker) return;

        window.erpApp.showDeleteConfirmation(
            "Nhân sự dự án",
            worker.name,
            async () => {
                const idx = pmWorkers.findIndex(w => w.id === id);
                if (idx !== -1) {
                    const deleted = pmWorkers.splice(idx, 1)[0];

                    localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
                    if (window.CrudSync && typeof window.CrudSync.deleteItem === 'function') {
                        await window.CrudSync.deleteItem('pmWorkers', id, 'id');
                    }

                    window.erpApp.showToast('Đã xóa nhân sự thành công', 'success');

                    // Trigger Notification
                    window.erpApp.notifyCRUD('Nhân sự', 'delete', {
                        name: deleted.name,
                        page: 'quan-ly-du-an',
                        module: 'Nhân sự',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    window.erpApp.renderQuanLyDuAn();
                    if (typeof window.erpApp.reconcileEquipmentSync === 'function') {
                        window.erpApp.reconcileEquipmentSync();
                    }
                }
            }
        );
    };




    // --- Incident Module ---
    function parseToYYYYMMDD(dateStr) {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) return dateStr;
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return new Date().toISOString().split('T')[0];
    }

    function formatToDDMMYYYY(dateStr) {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    window.erpApp.renderIncidentManagement = () => {
        const incidents = window.pmIncidents || [];

        let html = `
            <div class="incident-management-module" style="animation: fadeIn 0.5s ease-out;">
                <div class="page-top-bar" style="margin-bottom:30px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('van-hanh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <div>
                            <h2 style="font-size:22px; font-weight:900; color:#1e293b; margin:0;">Quản lý Sự cố</h2>
                            <p style="margin:2px 0 0 0; font-size:13px; color:#64748b; font-weight:600;">Ghi nhận, xử lý và theo dõi các sự cố vận hành</p>
                        </div>
                    </div>
                    <button class="pb-btn-add" onclick="window.erpApp.openIncidentModal()" style="padding:12px 24px; border-radius:14px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#fff; border:none; font-weight:800; display:flex; align-items:center; gap:10px; box-shadow:0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                        <span class="material-icons-outlined">report_problem</span> Báo cáo sự cố mới
                    </button>
                </div>

                <div style="background:#fff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 10px 15px -3px rgba(0,0,0,0.04);">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8fafc; text-align:left; border-bottom:1px solid #e2e8f0;">
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Mã sự cố</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Thời gian</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Dự án</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Nội dung sự cố</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Mức độ</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase;">Trạng thái</th>
                                <th style="padding:16px 24px; font-size:12px; font-weight:900; color:#64748b; text-transform:uppercase; text-align:center;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${incidents.length === 0 ? `
                                <tr>
                                    <td colspan="7" style="text-align:center; padding:60px; color:#94a3b8;">Hệ thống chưa ghi nhận sự cố nào</td>
                                </tr>
                            ` : incidents.map(inc => {
            const severityColor = inc.severity === 'high' ? '#ef4444' : (inc.severity === 'medium' ? '#f59e0b' : '#3b82f6');
            const statusColor = inc.status === 'resolved' ? '#10b981' : (inc.status === 'processing' ? '#f97316' : '#ef4444');
            return `
                                    <tr style="border-bottom:1px solid #f1f5f9; transition:all 0.2s;" onmouseover="this.style.background='#f8fafc'">
                                        <td style="padding:16px 24px; font-weight:800; color:#1e293b;">${inc.id}</td>
                                        <td style="padding:16px 24px; font-size:13px; color:#64748b;">${formatToDDMMYYYY(inc.date)}</td>
                                        <td style="padding:16px 24px; font-weight:700; color:#475569;">${inc.project}</td>
                                        <td style="padding:16px 24px;">
                                            <div style="font-weight:800; color:#1e293b;">${inc.title}</div>
                                            <div style="font-size:12px; color:#64748b;">${inc.desc}</div>
                                        </td>
                                        <td style="padding:16px 24px;">
                                            <span style="padding:4px 10px; border-radius:8px; font-size:11px; font-weight:850; background:${severityColor}15; color:${severityColor}; border:1px solid ${severityColor}20;">${inc.severity.toUpperCase()}</span>
                                        </td>
                                        <td style="padding:16px 24px;">
                                            <select onchange="window.erpApp.updateIncidentStatus('${inc.id}', this.value)" style="padding:6px 10px; border-radius:10px; font-size:12px; font-weight:700; border:1.5px solid #e2e8f0; cursor:pointer; outline:none; font-family:inherit; background:${inc.status === 'resolved' ? '#dcfce7' : (inc.status === 'processing' ? '#fff7ed' : '#fef2f2')}; color:${statusColor};">
                                                <option value="open" ${inc.status === 'open' ? 'selected' : ''}>Đang mở</option>
                                                <option value="processing" ${inc.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                                                <option value="resolved" ${inc.status === 'resolved' ? 'selected' : ''}>Đã giải quyết</option>
                                            </select>
                                        </td>
                                        <td style="padding:16px 24px; text-align:center;">
                                            <div style="display:flex; gap:6px; justify-content:center;">
                                                <button onclick="window.erpApp.viewIncident('${inc.id}')" title="Xem" style="width:32px; height:32px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#3b82f6; transition:all 0.2s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'"><span class="material-icons-outlined" style="font-size:16px;">visibility</span></button>
                                                <button onclick="window.erpApp.editIncident('${inc.id}')" title="Sửa" style="width:32px; height:32px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#f59e0b; transition:all 0.2s;" onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='#fff'"><span class="material-icons-outlined" style="font-size:16px;">edit</span></button>
                                                <button onclick="window.erpApp.deleteIncident('${inc.id}')" title="Xóa" style="width:32px; height:32px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#ef4444; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'"><span class="material-icons-outlined" style="font-size:16px;">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        window.pageContent.innerHTML = html;
        window.pageContent.scrollTop = 0;
    };

    window.erpApp.openIncidentModal = function () {
        syncToGlobalData();
        const modalHtml = `
            <div class="modal-overlay" id="incidentModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; animation: fadeIn 0.3s ease-out;">
                <div class="modal-content" style="width:600px; max-width:95%; background:#fff; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); border-radius:28px; overflow:hidden;">
                    <div class="modal-header" style="background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding:28px 32px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:16px;">
                            <span class="material-icons-outlined" style="font-size:28px;">report_gmailerrorred</span>
                            <h2 style="margin:0; font-size:20px; font-weight:900;">Báo cáo Sự cố mới</h2>
                        </div>
                        <button onclick="document.getElementById('incidentModal').remove()" style="border:none; background:none; cursor:pointer; color:#fff;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="incidentForm" style="padding:32px; background:#f8fafc;">
                        <div style="background:#fff; padding:24px; border-radius:20px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:20px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tiêu đề sự cố *</label>
                                <input type="text" name="title" placeholder="VD: Hỏng bơm thủy lực máy đào..." required style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; outline:none;">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Dự án liên quan</label>
                                    <select name="projectId" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; background:#fff; cursor:pointer;">
                                        ${pmProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Mức độ nghiêm trọng</label>
                                    <select name="severity" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; background:#fff; cursor:pointer;">
                                        <option value="low">Thấp</option>
                                        <option value="medium" selected>Trung bình</option>
                                        <option value="high">Cao</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày tạo</label>
                                    <input type="text" name="date" class="erp-datepicker" required style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; background:#fff; cursor:pointer; font-family:inherit;" value="${window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Mô tả chi tiết</label>
                                <textarea name="desc" placeholder="Mô tả diễn biến, nguyên nhân..." required style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:600; min-height:120px; outline:none;"></textarea>
                            </div>
                        </div>
                        <div style="margin-top:32px; display:flex; justify-content:flex-end; gap:16px;">
                            <button type="button" onclick="document.getElementById('incidentModal').remove()" style="padding:14px 28px; border-radius:16px; border:2px solid #e2e8f0; background:#fff; color:#64748b; font-weight:800; cursor:pointer;">Hủy bỏ</button>
                            <button type="button" onclick="window.erpApp.saveIncident()" style="padding:14px 40px; border-radius:16px; border:none; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#fff; font-weight:900; cursor:pointer;">Gửi Báo cáo</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        if (window.flatpickr) {
            flatpickr(document.querySelectorAll('#incidentModal .erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.saveIncident = async function () {
        syncToGlobalData();
        const form = document.getElementById('incidentForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const project = pmProjects.find(p => p.id === data.projectId);

        const dateInput = formData.get('date');
        const formattedDate = window.erpApp.parseInputDate(dateInput) || new Date().toISOString().split('T')[0];

        const newIncident = {
            id: 'INC-' + Date.now().toString().slice(-4),
            date: formattedDate,
            title: data.title,
            project: project ? project.name : 'N/A',
            projectId: data.projectId,
            severity: data.severity,
            desc: data.desc,
            status: 'open'
        };

        pmIncidents.unshift(newIncident);
        localStorage.setItem('erp_pmIncidents', JSON.stringify(pmIncidents));
        window.pmIncidents = pmIncidents;

        document.getElementById('incidentModal').remove();
        window.erpApp.renderIncidentManagement();
        window.erpApp.showToast('Đã gửi báo cáo sự cố thành công!', 'success');

        if (window.CrudSync) {
            await window.CrudSync.saveItem('pmIncidents', newIncident, 'id');
        }

        window.erpApp.notifyCRUD('Sự cố', 'add', { name: data.title });

        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                `🚨 Sự cố mới: ${data.title} (${newIncident.id})`,
                'report_problem',
                'red',
                { page: 'van-hanh', subPage: 'incident' }
            );
        }
    };

    // --- Incident CRUD Actions ---
    window.erpApp.viewIncident = function (id) {
        const inc = pmIncidents.find(i => i.id === id);
        if (!inc) { return; }
        const sevLabel = inc.severity === 'high' ? 'Cao' : (inc.severity === 'medium' ? 'Trung bình' : 'Thấp');
        const sevColor = inc.severity === 'high' ? '#ef4444' : (inc.severity === 'medium' ? '#f59e0b' : '#3b82f6');
        const statusLabel = inc.status === 'resolved' ? 'Đã giải quyết' : (inc.status === 'processing' ? 'Đang xử lý' : 'Đang mở');
        const modalHtml = `
            <div class="modal-overlay" id="viewIncModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div style="width:520px; max-width:95%; background:#fff; border-radius:28px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <div style="padding:24px 32px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;"><span class="material-icons-outlined" style="color:#3b82f6; font-size:24px;">info</span><h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">Chi tiết sự cố</h2></div>
                        <button onclick="document.getElementById('viewIncModal').remove()" style="border:none; background:#f1f5f9; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="color:#64748b;">close</span></button>
                    </div>
                    <div style="padding:32px;">
                        <div style="display:flex; gap:12px; margin-bottom:20px;">
                            <span style="background:#f1f5f9; color:#475569; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800;">${inc.id}</span>
                            <span style="background:${sevColor}15; color:${sevColor}; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800; border:1px solid ${sevColor}20;">${sevLabel}</span>
                            <span style="background:#f0fdf4; color:#16a34a; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800;">${statusLabel}</span>
                        </div>
                        <div style="margin-bottom:16px;"><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Tiêu đề</div><div style="font-size:16px; font-weight:800; color:#1e293b;">${inc.title}</div></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                            <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Dự án</div><div style="font-size:14px; font-weight:700; color:#475569;">${inc.project}</div></div>
                            <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Thời gian</div><div style="font-size:14px; font-weight:700; color:#475569;">${inc.date}</div></div>
                        </div>
                        <div><div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Mô tả chi tiết</div><div style="font-size:14px; color:#334155; line-height:1.6; background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #f1f5f9;">${inc.desc || 'Không có mô tả'}</div></div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.editIncident = function (id) {
        syncToGlobalData();
        const inc = pmIncidents.find(i => i.id === id);
        if (!inc) { return; }
        const modalHtml = `
            <div class="modal-overlay" id="editIncModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div style="width:600px; max-width:95%; background:#fff; border-radius:28px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
                    <div style="padding:24px 32px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;"><span class="material-icons-outlined" style="font-size:24px;">edit_note</span><h2 style="margin:0; font-size:18px; font-weight:900;">Chỉnh sửa sự cố ${inc.id}</h2></div>
                        <button onclick="document.getElementById('editIncModal').remove()" style="border:none; background:rgba(255,255,255,0.2); width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="editIncForm" style="padding:32px; display:flex; flex-direction:column; gap:20px;">
                        <div><label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tiêu đề *</label><input type="text" name="title" value="${inc.title}" required style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; outline:none;"></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Dự án liên quan</label>
                                <select name="projectId" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700;">
                                    ${pmProjects.map(p => `<option value="${p.id}" ${inc.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày tạo</label>
                                <input type="text" name="date" class="erp-datepicker" value="${inc.date ? window.erpApp.formatDate(inc.date) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" required style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700; outline:none; font-family:inherit;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                            <div><label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Mức độ</label><select name="severity" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700;"><option value="low" ${inc.severity === 'low' ? 'selected' : ''}>Thấp</option><option value="medium" ${inc.severity === 'medium' ? 'selected' : ''}>Trung bình</option><option value="high" ${inc.severity === 'high' ? 'selected' : ''}>Cao</option></select></div>
                            <div><label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label><select name="status" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; font-weight:700;"><option value="open" ${inc.status === 'open' ? 'selected' : ''}>Đang mở</option><option value="processing" ${inc.status === 'processing' ? 'selected' : ''}>Đang xử lý</option><option value="resolved" ${inc.status === 'resolved' ? 'selected' : ''}>Đã giải quyết</option></select></div>
                        </div>
                        <div><label style="display:block; font-size:11px; font-weight:850; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Mô tả</label><textarea name="desc" style="width:100%; padding:14px; border:1.5px solid #e2e8f0; border-radius:14px; font-size:14px; min-height:100px; outline:none;">${inc.desc || ''}</textarea></div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:8px;">
                            <button type="button" onclick="document.getElementById('editIncModal').remove()" style="padding:12px 24px; border-radius:14px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-weight:800; cursor:pointer;">Hủy</button>
                            <button type="button" onclick="window.erpApp.saveEditIncident('${inc.id}')" style="padding:12px 32px; border-radius:14px; border:none; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-weight:800; cursor:pointer;">Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        if (window.flatpickr) {
            flatpickr(document.querySelectorAll('#editIncModal .erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.saveEditIncident = async function (id) {
        syncToGlobalData();
        const form = document.getElementById('editIncForm');
        const formData = new FormData(form);
        const idx = pmIncidents.findIndex(i => i.id === id);
        if (idx === -1) { return; }
        pmIncidents[idx].title = formData.get('title');

        const projectId = formData.get('projectId');
        const project = pmProjects.find(p => p.id === projectId);
        pmIncidents[idx].projectId = projectId;
        pmIncidents[idx].project = project ? project.name : 'N/A';

        const dateInput = formData.get('date');
        if (dateInput) {
            pmIncidents[idx].date = window.erpApp.parseInputDate(dateInput);
        }

        pmIncidents[idx].severity = formData.get('severity');
        pmIncidents[idx].status = formData.get('status');
        pmIncidents[idx].desc = formData.get('desc');
        localStorage.setItem('erp_pmIncidents', JSON.stringify(pmIncidents));
        window.pmIncidents = pmIncidents;

        document.getElementById('editIncModal').remove();
        window.erpApp.showToast('Đã cập nhật sự cố thành công!', 'success');
        window.erpApp.renderIncidentManagement();

        if (window.CrudSync) { await window.CrudSync.saveItem('pmIncidents', pmIncidents[idx], 'id'); }
    };

    window.erpApp.updateIncidentStatus = async function (id, newStatus) {
        syncToGlobalData();
        const inc = pmIncidents.find(i => i.id === id);
        if (!inc) { return; }
        inc.status = newStatus;
        localStorage.setItem('erp_pmIncidents', JSON.stringify(pmIncidents));
        window.pmIncidents = pmIncidents;

        window.erpApp.showToast('Đã cập nhật trạng thái sự cố!', 'success');
        window.erpApp.renderIncidentManagement();

        localStorage.setItem('erp_pmIncidents', JSON.stringify(pmIncidents));
        if (window.CrudSync) { await window.CrudSync.saveItem('pmIncidents', inc, 'id'); }
    };

    window.erpApp.deleteIncident = function (id) {
        syncToGlobalData();
        const inc = pmIncidents.find(i => i.id === id);
        if (!inc) { return; }
        const sevColor = inc.severity === 'high' ? '#ef4444' : (inc.severity === 'medium' ? '#f59e0b' : '#3b82f6');
        const modalHtml = `
            <div class="modal-overlay" id="delIncModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div style="width:440px; max-width:95%; background:#fff; border-radius:28px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
                    <div style="padding:24px 32px; background:#fef2f2; border-bottom:1px solid #fecaca; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;"><span class="material-icons-outlined" style="color:#ef4444; font-size:24px;">warning</span><h2 style="margin:0; font-size:18px; font-weight:900; color:#991b1b;">Xác nhận xóa sự cố</h2></div>
                        <button onclick="document.getElementById('delIncModal').remove()" style="border:none; background:#fff; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined" style="color:#64748b;">close</span></button>
                    </div>
                    <div style="padding:24px 32px;">
                        <p style="font-size:15px; color:#475569; margin:0 0 20px 0;">Bạn có chắc chắn muốn <strong style="color:#ef4444;">xóa vĩnh viễn</strong> sự cố sau?</p>
                        <div style="background:#f8fafc; border-radius:16px; padding:16px; border:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="background:#f1f5f9; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:800; color:#475569;">${inc.id}</span><span style="background:${sevColor}15; color:${sevColor}; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800;">${inc.severity.toUpperCase()}</span></div>
                            <div style="font-weight:800; color:#1e293b; font-size:15px; margin-bottom:6px;">${inc.title}</div>
                            <div style="font-size:13px; color:#64748b;">${inc.project} • ${inc.date}</div>
                        </div>
                        <p style="font-size:12px; color:#94a3b8; margin:16px 0 0 0; font-style:italic;">⚠️ Hành động này không thể hoàn tác.</p>
                    </div>
                    <div style="padding:16px 32px 24px; display:flex; gap:12px;">
                        <button onclick="document.getElementById('delIncModal').remove()" style="flex:1; padding:12px; border-radius:14px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-weight:800; cursor:pointer;">Hủy bỏ</button>
                        <button onclick="window.erpApp.confirmDeleteIncident('${inc.id}')" style="flex:1; padding:12px; border-radius:14px; border:none; background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons-outlined" style="font-size:18px;">delete_forever</span>Xóa sự cố</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.confirmDeleteIncident = async function (id) {
        syncToGlobalData();
        const idx = pmIncidents.findIndex(i => i.id === id);
        if (idx !== -1) {
            pmIncidents.splice(idx, 1);
            localStorage.setItem('erp_pmIncidents', JSON.stringify(pmIncidents));
            window.pmIncidents = pmIncidents;

            // UI Update first (Optimistic)
            const modal = document.getElementById('delIncModal');
            if (modal) modal.remove();
            if (typeof window.erpApp.showToast === 'function') window.erpApp.showToast('Đã xóa sự cố thành công!', 'info');
            window.erpApp.renderIncidentManagement();

            // Then background sync
            if (window.CrudSync) {
                await window.CrudSync.deleteItem('pmIncidents', id, 'id');
            }
        }
    };

    // ==========================================
    // MATERIAL CONTRACTS MODULE
    // ==========================================
    window.erpApp.renderPmMaterialContracts = (project) => {
        syncGlobalData();
        const fMoney = (val) => window.erpApp.formatValue(val) + ' đ';
        const projectContracts = (window.pmMaterialContracts || []).filter(c => {
            if (c.projectId !== project.id) return false;
            if (c.contractNo && c.contractNo.startsWith('HĐVT-')) {
                const matId = c.contractNo.substring(5);
                const mat = (window.pmMaterials || []).find(m => String(m.id) === String(matId));
                if (mat && mat.legalStatus === 'khong-co-hop-dong') {
                    return false;
                }
            }
            return true;
        });

        const totalValue = projectContracts.reduce((s, c) => s + (parseFloat(c.value) || 0), 0);
        const totalAdvance = projectContracts.reduce((s, c) => s + (parseFloat(c.advanceAmount) || 0), 0);
        const totalPaid = projectContracts.reduce((s, c) => s + (parseFloat(c.paidAmount) || 0), 0);
        const totalRemaining = totalValue - totalAdvance - totalPaid;

        return `
            <div class="pm-sub-module animate-fade-in">
                <div class="pm-dash-stats" style="margin-bottom:24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                    <div class="pm-stat-card" style="border-left: 4px solid #3b82f6; padding: 16px;">
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng giá trị HĐ</div>
                            <div class="pm-stat-card-value" style="color:#3b82f6; font-size: 16px;">${fMoney(totalValue)}</div>
                            <div style="font-size:11px; color:#64748b;">${projectContracts.length} hợp đồng</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="border-left: 4px solid #f59e0b; padding: 16px;">
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng tạm ứng</div>
                            <div class="pm-stat-card-value" style="color:#f59e0b; font-size: 16px;">${fMoney(totalAdvance)}</div>
                            <div style="font-size:11px; color:#64748b;">${totalValue > 0 ? ((totalAdvance / totalValue) * 100).toFixed(1) : 0}% giá trị</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="border-left: 4px solid #10b981; padding: 16px;">
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng thanh toán</div>
                            <div class="pm-stat-card-value" style="color:#10b981; font-size: 16px;">${fMoney(totalPaid)}</div>
                            <div style="font-size:11px; color:#64748b;">Thực tế đã giải ngân</div>
                        </div>
                    </div>
                    <div class="pm-stat-card" style="border-left: 4px solid #ef4444; padding: 16px;">
                        <div class="pm-stat-card-info">
                            <div class="pm-stat-card-label">Tổng còn lại</div>
                            <div class="pm-stat-card-value" style="color:#ef4444; font-size: 16px;">${fMoney(totalRemaining)}</div>
                            <div style="font-size:11px; color:#64748b;">Công nợ cần trả NCC</div>
                        </div>
                    </div>
                </div>

                <div class="pm-panel">
                    <div class="pm-panel-header">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <h3 style="margin:0; font-size:15px; font-weight:800;">Danh sách Hợp đồng Vật tư</h3>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <button class="pm-btn-add" onclick="window.erpApp.pmSyncContractsFromArchive('${project.id}')" style="background: linear-gradient(135deg, #10b981, #059669); border:none;">
                                <span class="material-icons-outlined">sync</span> Đồng bộ dữ liệu
                            </button>
                            <button class="pm-btn-add" onclick="window.erpApp.pmOpenAddMaterialContractModal()">
                                <span class="material-icons-outlined">add_circle</span> Thêm Hợp đồng
                            </button>
                        </div>
                    </div>
                    <div class="pm-table-wrapper">
                        <table class="pm-table">
                            <thead>
                                <tr>
                                    <th style="min-width:130px;">Số HĐ / Ngày ký</th>
                                    <th style="min-width:180px;">Nhà cung cấp / Nội dung</th>
                                    <th class="text-right" style="min-width:120px;">Giá trị HĐ</th>
                                    <th class="text-right" style="min-width:110px;">Tạm ứng</th>
                                    <th class="text-right" style="min-width:110px;">Thanh toán</th>
                                    <th class="text-right" style="min-width:110px;">Còn lại</th>
                                    <th class="text-center" style="min-width:130px;">Tình trạng TT</th>
                                    <th class="text-center" style="min-width:100px;">Trạng thái</th>
                                    <th class="text-center" style="min-width:90px;">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${projectContracts.map(c => `
                                    <tr>
                                        <td>
                                            <div style="font-weight:700; color:#1e293b;">${c.contractNo || 'N/A'}</div>
                                            <div style="font-size:11px; color:#64748b;">${c.signDate || '-'}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight:700; color:#334155;">${c.supplier}</div>
                                            <div style="font-size:11px; color:#64748b; font-style:italic;">${c.title}</div>
                                            ${c.contractNo && c.contractNo.startsWith('HĐVT-') ? (() => {
                const matId = c.contractNo.substring(5);
                const mat = (window.pmMaterials || []).find(m => String(m.id) === String(matId));
                return mat ? `
                                                    <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
                                                        <span style="font-size:11px; font-weight:600; color:#64748b;">Pháp lý:</span>
                                                        <select onchange="window.erpApp.pmUpdateMaterialLegalStatus('${mat.id}', this.value)" 
                                                                style="padding:4px 8px; border-radius:8px; border:1px solid #e2e8f0; font-size:11px; outline:none; background:#fff; cursor:pointer; font-weight:700; color:#10b981;">
                                                            <option value="co-hop-dong" ${mat.legalStatus !== 'khong-co-hop-dong' ? 'selected' : ''}>Có hợp đồng</option>
                                                            <option value="khong-co-hop-dong" ${mat.legalStatus === 'khong-co-hop-dong' ? 'selected' : ''}>Không có hợp đồng</option>
                                                        </select>
                                                    </div>
                                                ` : '';
            })() : ''}
                                        </td>
                                        <td class="text-right" style="font-weight:700; color:#1e293b;">${fMoney(c.value)}</td>
                                        <td class="text-right" style="font-weight:700; color:#f59e0b;">${fMoney(c.advanceAmount || 0)}</td>
                                        <td class="text-right" style="font-weight:700; color:#10b981;">${fMoney(c.paidAmount || 0)}</td>
                                        <td class="text-right" style="font-weight:700; color:${(c.value - (c.advanceAmount || 0) - (c.paidAmount || 0)) > 0 ? '#ef4444' : '#64748b'};">
                                            ${fMoney(c.value - (c.advanceAmount || 0) - (c.paidAmount || 0))}
                                        </td>
                                        <td class="text-center">
                                            ${(() => {
                const rem = c.value - (c.advanceAmount || 0) - (c.paidAmount || 0);
                if (rem <= 0) {
                    return `<span style="color:#10b981; font-weight:700; font-size:11px;"><span class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">check_circle</span> Đã thanh toán</span><br><span style="font-size:10px; color:#94a3b8;">Không có công nợ</span>`;
                } else {
                    return `<span style="color:#f59e0b; font-weight:700; font-size:11px;"><span class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">pending</span> Chưa thanh toán</span><br><span style="font-size:10px; color:#ef4444; font-weight:600;">Có công nợ</span>`;
                }
            })()}
                                        </td>
                                        <td class="text-center">
                                            <span class="pm-status-badge ${c.status === 'Hoàn thành' ? 'hoan-thanh' : 'dang-thi-cong'}" style="font-size:10px;">
                                                ${c.status || 'Đang thực hiện'}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div style="display:flex; gap:6px; justify-content:center;">
                                                <button onclick="window.erpApp.pmOpenEditMaterialContractModal('${c.id}')" class="pm-action-btn green"><span class="material-icons-outlined" style="font-size:16px;">edit</span></button>
                                                <button onclick="window.erpApp.pmDeleteMaterialContract('${c.id}')" class="pm-action-btn red"><span class="material-icons-outlined" style="font-size:16px;">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${projectContracts.length === 0 ? '<tr><td colspan="9" class="text-center" style="padding:40px; color:#94a3b8;">Chưa có hợp đồng vật tư cho dự án này</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    };

    window.erpApp.pmOpenAddMaterialContractModal = () => { window.erpApp.pmOpenEditMaterialContractModal(null); };

    window.erpApp.pmOpenEditMaterialContractModal = (editId = null) => {
        const editContract = editId ? (window.pmMaterialContracts || []).find(c => c.id === editId) : null;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#3b82f6;">assignment</span> ${editId ? 'Sửa Hợp đồng Vật tư' : 'Thêm Hợp đồng Vật tư mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveMaterialContract(event, ${editId ? `'${editId}'` : 'null'})">
                    <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số Hợp đồng</label>
                            <input type="text" name="contractNo" required value="${editContract ? editContract.contractNo : ''}" placeholder="HĐVT-2025-..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày ký</label>
                            <input type="text" name="signDate" class="erp-datepicker" required value="${editContract ? window.erpApp.formatDate(editContract.signDate) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nhà cung cấp</label>
                            <input type="text" name="supplier" required value="${editContract ? editContract.supplier : ''}" placeholder="Tên công ty / Cửa hàng..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Nội dung Hợp đồng</label>
                            <input type="text" name="title" required value="${editContract ? editContract.title : ''}" placeholder="Cung cấp vật tư thiết bị cho hạng mục..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giá trị Hợp đồng (VNĐ)</label>
                            <input type="text" name="value" required value="${editContract ? window.erpApp.formatValue(editContract.value) : ''}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; font-weight:800; color:#1e293b; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số tiền Tạm ứng (VNĐ)</label>
                            <input type="text" name="advanceAmount" required value="${editContract ? window.erpApp.formatValue(editContract.advanceAmount) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; font-weight:800; color:#f59e0b; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Số tiền Thanh toán (VNĐ)</label>
                            <input type="text" name="paidAmount" required value="${editContract ? window.erpApp.formatValue(editContract.paidAmount || 0) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; font-weight:800; color:#10b981; outline:none;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                            <select name="status" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-weight:700;">
                                <option value="Đang thực hiện" ${editContract && editContract.status === 'Đang thực hiện' ? 'selected' : ''}>Đang thực hiện</option>
                                <option value="Hoàn thành" ${editContract && editContract.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                                <option value="Tạm dừng" ${editContract && editContract.status === 'Tạm dừng' ? 'selected' : ''}>Tạm dừng</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ghi chú</label>
                            <input type="text" name="notes" value="${editContract ? editContract.notes || '' : ''}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#3b82f6; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(59, 130, 246, 0.2);">Lưu Hợp đồng</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        if (window.flatpickr) {
            flatpickr(overlay.querySelectorAll('.erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.pmSaveMaterialContract = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parseVND = (v) => window.erpApp.parseVND(v);

        const activeProjectId = (window.pmActiveProjectId || window.erpApp.pmActiveProjectId);

        const contractData = {
            id: editId || `MC-${Date.now()}`,
            projectId: activeProjectId,
            contractNo: formData.get('contractNo'),
            signDate: window.erpApp.parseInputDate(formData.get('signDate')),
            supplier: formData.get('supplier'),
            title: formData.get('title'),
            value: parseVND(formData.get('value')),
            advanceAmount: parseVND(formData.get('advanceAmount')),
            paidAmount: parseVND(formData.get('paidAmount')),
            status: formData.get('status'),
            notes: formData.get('notes')
        };

        if (editId) {
            const idx = window.pmMaterialContracts.findIndex(c => c.id === editId);
            if (idx !== -1) {
                window.pmMaterialContracts[idx] = { ...window.pmMaterialContracts[idx], ...contractData };
            }
        } else {
            window.pmMaterialContracts.unshift(contractData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmMaterialContracts', contractData, 'id')
                .catch(err => console.error('Sync Error:', err));
        }
        localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(window.pmMaterialContracts));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');

        if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
            window.erpApp.renderQuanLyDuAn();
        }
    };

    window.erpApp.pmDeleteMaterialContract = async (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa hợp đồng vật tư!', 'error');
            return;
        }

        const contract = window.pmMaterialContracts.find(c => c.id === id);
        if (!contract) return;

        window.erpApp.showDeleteConfirmation(
            "Hợp đồng cung cấp vật tư",
            contract.title || id,
            async () => {
                const idx = window.pmMaterialContracts.findIndex(c => c.id === id);
                if (idx !== -1) {
                    const deleted = window.pmMaterialContracts.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmMaterialContracts', id, 'id');
                    }
                    localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(window.pmMaterialContracts));
                    window.erpApp.showToast('Đã xóa hợp đồng vật tư thành công', 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Hợp đồng vật tư', 'delete', {
                        name: deleted.title,
                        page: 'quan-ly-du-an',
                        module: 'Chi phí vật tư',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };

    window.erpApp.pmUpdateMaterialContractStatus = (id, newStatus) => {
        const contract = window.pmMaterialContracts.find(c => c.id === id);
        if (contract) {
            contract.status = newStatus;
            localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(window.pmMaterialContracts));
            if (window.CrudSync) window.CrudSync.saveItem('pmMaterialContracts', contract, 'id');
            window.erpApp.showToast('Đã cập nhật trạng thái', 'success');
            if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
                window.erpApp.renderQuanLyDuAn();
            }
        }
    };

    window.erpApp.pmSyncContractsFromArchive = async (projectId) => {
        const activeProjectId = projectId || (window.pmActiveProjectId || window.erpApp.pmActiveProjectId);
        const activeProject = (window.pmProjects || []).find(p => p.id === activeProjectId);

        console.log('[Sync] Active Project ID:', activeProjectId);
        console.log('[Sync] Active Project Obj:', activeProject);

        if (!activeProjectId || !activeProject) {
            window.erpApp.showToast('Không tìm thấy thông tin dự án!', 'error');
            return;
        }

        let newEntries = 0;
        const currentMaterialContracts = window.pmMaterialContracts || [];

        // 1. Sync from pmContracts (Main Contracts tab)
        const mainContracts = (window.pmContracts || []).filter(c =>
            c.projectId === activeProjectId &&
            (c.category === 'vat-tu' || (c.title && c.title.toLowerCase().includes('vật tư')))
        );

        const syncPromises = [];
        mainContracts.forEach(mc => {
            // Check if already in pmMaterialContracts
            const exists = currentMaterialContracts.some(item =>
                item.contractNo === mc.contractNo ||
                (mc.linkedHsId && item.linkedHsId === mc.linkedHsId)
            );

            if (!exists) {
                const newMC = {
                    id: `MC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    projectId: activeProjectId,
                    contractNo: mc.contractNo || 'N/A',
                    signDate: mc.signDate || new Date().toISOString().split('T')[0],
                    supplier: mc.partner || 'N/A',
                    title: mc.title || 'Hợp đồng đồng bộ từ PM',
                    value: mc.value || 0,
                    advanceAmount: mc.paid || 0,
                    paidAmount: 0,
                    status: 'Đang thực hiện',
                    notes: 'Đồng bộ từ Hợp đồng PM',
                    linkedPmId: mc.id,
                    linkedHsId: mc.linkedHsId
                };
                currentMaterialContracts.unshift(newMC);
                newEntries++;
                if (window.CrudSync) syncPromises.push(window.CrudSync.saveItem('pmMaterialContracts', newMC, 'id'));
            }
        });

        // 2. Sync from hoSoDocuments (Archive)
        const archiveDocs = (window.hoSoDocuments || []).filter(doc => {
            if (!doc.project) return false;

            // Normalize names for comparison
            const docProj = String(doc.project).trim().toLowerCase();
            const actProjName = String(activeProject.name).trim().toLowerCase();
            const actProjId = String(activeProject.id).trim().toLowerCase();

            const isProjectMatch = docProj === actProjName ||
                docProj === actProjId ||
                actProjName.includes(docProj) ||
                docProj.includes(actProjName);

            const isCategoryMatch = doc.category === 'hop-dong';

            const title = (doc.title || '').toLowerCase();
            const note = (doc.note || '').toLowerCase();
            const expCat = (doc.expenseCategory || '').toLowerCase();
            const docCat = (doc.category || '').toLowerCase();

            const isMaterialMatch = (expCat === 'vat-tu' ||
                docCat === 'vat-tu' ||
                title.includes('vật tư') ||
                title.includes('biển báo') ||
                note.includes('vật tư') ||
                note.includes('biển báo'));
            return isProjectMatch && isCategoryMatch && isMaterialMatch;
        });

        archiveDocs.forEach(doc => {
            const exists = currentMaterialContracts.some(item =>
                item.contractNo === doc.symbol ||
                item.linkedHsId === doc.id
            );

            if (!exists) {
                const newMC = {
                    id: `MC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    projectId: activeProjectId,
                    contractNo: doc.symbol || doc.id,
                    signDate: doc.issueDate || new Date().toISOString().split('T')[0],
                    supplier: doc.supplier || doc.customer || 'N/A',
                    title: doc.title || 'Hợp đồng đồng bộ từ Archive',
                    value: doc.value || 0,
                    advanceAmount: 0,
                    paidAmount: 0,
                    status: 'Đang thực hiện',
                    notes: 'Đồng bộ từ Lưu trữ hồ sơ',
                    linkedHsId: doc.id
                };
                currentMaterialContracts.unshift(newMC);
                newEntries++;
                if (window.CrudSync) syncPromises.push(window.CrudSync.saveItem('pmMaterialContracts', newMC, 'id'));
            }
        });

        if (newEntries > 0) {
            // Await all background syncs before UI refresh
            if (syncPromises.length > 0) {
                await Promise.all(syncPromises).catch(err => console.error('Sync Error:', err));
            }

            window.pmMaterialContracts = currentMaterialContracts;
            localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(window.pmMaterialContracts));
            window.erpApp.showToast(`Đã đồng bộ thành công ${newEntries} hợp đồng mới!`, 'success');
            if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
                window.erpApp.renderQuanLyDuAn();
            }
        } else {
            window.erpApp.showToast('Không có dữ liệu mới để đồng bộ.', 'info');
        }
    };

    // ==========================================
    // CONTRACT & APPENDIX MODALS
    // ==========================================

    window.erpApp._pmOpenAddContractModal = (id = null) => {
        console.log('ERP Debug: _pmOpenAddContractModal called, diverting to EditContractModal');
        window.erpApp.pmOpenEditContractModal(id);
    };
    window.erpApp.pmOpenAddContractModal = window.erpApp._pmOpenAddContractModal;

    window.erpApp.pmCloseAddContractModal = () => {
        const modal = document.getElementById('pmContractModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    };

    window.erpApp.pmOpenEditContractModal = function (id = null, isView = false) {
        console.log('ERP Debug: pmOpenEditContractModal implementation STARTED for ID:', id);
        const pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId || '';
        const projects = window.pmProjects || [];
        const pmContracts = window.pmContracts || [];
        const today = new Date().toISOString().split('T')[0];

        const contract = id ? pmContracts.find(c => c.id === id) : null;
        const isEdit = !!contract;
        tempContractFiles = contract ? (contract.vouchers || []) : [];

        const existingDrivePath = (tempContractFiles && tempContractFiles.find(f => f.drivePath)?.drivePath) || '';

        // Populate Partners from danhSachDoiTacData (with legacy fallback)
        const partnersList = window.danhSachDoiTacData || [];

        let generatedId = '';
        if (!isEdit) {
            const lastId = pmContracts.length > 0 ? pmContracts[pmContracts.length - 1].id : 'HĐ-BT-000';
            const numPart = lastId.split('-').pop();
            const num = parseInt(numPart) || 0;
            generatedId = `HĐ-${pmActiveProjectId.split('-').pop()}-${String(num + 1).padStart(3, '0')}`;
        }

        const fDate = (d) => d ? window.erpApp.formatDate(d) : '';
        const fValue = (v) => v ? window.erpApp.formatValue(v) : '0';

        // Helper to ensure flatpickr receives a clean date or empty string, never "—" or "-"
        const fDateInput = (d) => {
            if (!d) return '';
            const formatted = window.erpApp.formatDate(d);
            return (formatted === '—' || formatted === '-') ? '' : formatted;
        };

        const modalHtml = `
            <div class="modal-overlay" id="pmContractModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div class="modal-content" style="width:680px; max-width:95%; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <style>
                        @keyframes modalPop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                    </style>
                    <div class="modal-header" style="background:#f8fafc; border-bottom:1px solid #f1f5f9; padding:20px 24px; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:17px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <div style="width:36px; height:36px; background:#eff6ff; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#3b82f6;">
                                <span class="material-icons-outlined" style="font-size:20px;">${isView ? 'visibility' : (isEdit ? 'edit_document' : 'description')}</span>
                            </div>
                            ${isView ? 'Chi tiết hợp đồng' : (isEdit ? 'Sửa hợp đồng' : 'Thêm hợp đồng mới')}
                        </h2>
                        <button onclick="window.erpApp.pmCloseAddContractModal()" style="width:32px; height:32px; border-radius:50%; border:none; background:#fff; cursor:pointer; color:#94a3b8; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">
                            <span class="material-icons-outlined" style="font-size:18px;">close</span>
                        </button>
                    </div>
                    <form id="pmContractForm" onsubmit="${isView ? 'event.preventDefault(); window.erpApp.pmCloseAddContractModal();' : `window.erpApp.pmSaveNewContract(event, ${isEdit ? `'${id}'` : 'null'})`}">
                        <div class="modal-body" style="padding:24px; max-height:75vh; overflow-y:auto;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Mã nội bộ (ID)</label>
                                    <input type="text" id="pmInpContractId" name="id" value="${isEdit ? contract.id : generatedId}" ${isEdit || isView ? 'readonly' : ''} placeholder="HĐ-BT-000" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isEdit || isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Số hợp đồng (Gốc)</label>
                                    <input type="text" name="contractNo" value="${isEdit ? (contract.contractNo || '') : ''}" ${isView ? 'readonly' : ''} placeholder="VD: 01/2026/HĐ-XD" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Loại hợp đồng</label>
                                    <select name="type" onchange="window.erpApp.pmUpdateContractCategoryDropdown(this.form)" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; cursor:pointer; background:${isView ? '#f8fafc' : '#fff'};">
                                        <option value="outbound" ${isEdit && contract.type === 'outbound' ? 'selected' : ''}>Hợp đồng Đầu ra (Thu)</option>
                                        <option value="inbound" ${isEdit && contract.type === 'inbound' ? 'selected' : (!isEdit ? 'selected' : '')}>Hợp đồng Đầu vào (Chi)</option>
                                    </select>
                                </div>
                                <div class="form-group" id="pmContractCategoryGroup">
                                    <label id="pmContractCategoryLabel" style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Phân loại chi phí</label>
                                    <select name="category" id="pmContractCategorySelect" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; cursor:pointer; background:${isView ? '#f8fafc' : '#fff'};">
                                        <!-- Populated dynamically -->
                                    </select>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Dự án liên kết</label>
                                    <select name="projectId" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; cursor:pointer; background:${isView ? '#f8fafc' : '#fff'};">
                                        ${projects.map(p => `<option value="${p.id}" ${p.id === (isEdit ? contract.projectId : pmActiveProjectId) ? 'selected' : ''}>${p.id} - ${p.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chủ Đầu tư/Đối tác</label>
                                    <select name="partner" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; cursor:pointer; background:${isView ? '#f8fafc' : '#fff'};">
                                        <option value="">-- Chọn Chủ đầu tư/Đối tác --</option>
                                        ${(() => {
                const list = [...partnersList];
                if (isEdit && contract.partner && !list.some(p => p.name === contract.partner)) {
                    list.push({ name: contract.partner });
                }
                return list.map(p => `<option value="${p.name}" ${isEdit && contract.partner === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
            })()}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom:20px;">
                                <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tên Hợp đồng</label>
                                <input type="text" name="title" value="${isEdit ? contract.title : ''}" ${isView ? 'readonly' : ''} placeholder="VD: Cung cấp vật tư giai đoạn 1..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Giá trị hợp đồng (VNĐ)</label>
                                    <input type="text" name="value" value="${isEdit ? window.erpApp.formatValue(contract.value) : '0'}" oninput="window.erpApp.formatNumberInput(this)" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-weight:700; color:#2563eb; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Thời gian thực hiện (ngày)</label>
                                    <input type="number" name="executionTime" value="${isEdit ? (contract.executionTime ?? 365) : 365}" ${isView ? 'readonly' : ''} oninput="window.erpApp.pmCalculateContractExpiry(this.form)" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Thời gian Bảo hành (tháng)</label>
                                    <input type="number" name="warrantyPeriod" value="${isEdit ? (contract.warrantyPeriod ?? 12) : 12}" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; font-weight:700; color:#6366f1; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#6366f1'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày bắt đầu</label>
                                    <input type="text" class="${isView ? '' : 'pm-date-picker-input'}" name="startDate" value="${isEdit && contract.startDate ? fDateInput(contract.startDate) : fDateInput(today)}" oninput="window.erpApp.pmCalculateContractExpiry(this.form)" onchange="window.erpApp.pmCalculateContractExpiry(this.form)" placeholder="DD/MM/YYYY" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày ký hợp đồng</label>
                                    <input type="text" class="${isView ? '' : 'pm-date-picker-input'}" name="signDate" value="${isEdit && contract.signDate ? fDateInput(contract.signDate) : fDateInput(today)}" oninput="window.erpApp.pmCalculateContractExpiry(this.form)" onchange="window.erpApp.pmCalculateContractExpiry(this.form)" placeholder="DD/MM/YYYY" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Hết hạn hợp đồng</label>
                                    <input type="text" class="${isView ? '' : 'pm-date-picker-input'}" name="guaranteeExpiry" value="${isEdit && contract.guaranteeExpiry ? fDateInput(contract.guaranteeExpiry) : fDateInput(today)}" placeholder="DD/MM/YYYY" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày nghiệm thu</label>
                                    <input type="text" class="${isView ? '' : 'pm-date-picker-input'}" name="acceptanceDate" value="${isEdit && contract.acceptanceDate ? fDateInput(contract.acceptanceDate) : ''}" oninput="if(this.value.trim()){const s=this.form.querySelector('select[name=\'status\']');if(s)s.value='da-nghiem-thu';}" onchange="if(this.value.trim()){const s=this.form.querySelector('select[name=\'status\']');if(s)s.value='da-nghiem-thu';}" placeholder="DD/MM/YYYY" ${isView ? 'readonly' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:0.2s; background:${isView ? '#f8fafc' : '#fff'};" onfocus="this.style.borderColor='#3b82f6'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                                    <select name="status" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; cursor:pointer; background:${isView ? '#f8fafc' : '#fff'};">
                                        <option value="dang-thi-cong" ${isEdit && contract.status === 'dang-thi-cong' ? 'selected' : (!isEdit ? 'selected' : '')}>Đang Thi công</option>
                                        <option value="da-hoan-thien" ${isEdit && contract.status === 'da-hoan-thien' ? 'selected' : ''}>Đã hoàn thiện</option>
                                        <option value="da-nghiem-thu" ${isEdit && contract.status === 'da-nghiem-thu' ? 'selected' : ''}>Đã nghiệm thu</option>
                                        <option value="da-thanh-ly" ${isEdit && contract.status === 'da-thanh-ly' ? 'selected' : ''}>Đã thanh lý</option>
                                    </select>
                                </div>
                            </div>                            <div class="form-group" style="margin-bottom:20px;">
                                <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chứng từ hợp đồng (Scan, Ảnh / Link tài liệu)</label>
                                
                                ${isView ? '' : `
                                <div style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                    <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                    <select id="pmContractDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadContractDriveFolderChain(null, 0)">
                                        <option value="">⏳ Đang tải thư mục...</option>
                                    </select>
                                    <div id="pmContractDriveFolderChain" style="display:contents"></div>
                                    <button type="button" onclick="window.erpApp.loadContractDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                        <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                    </button>
                                    <button type="button" onclick="window.erpApp.createContractDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                        <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                    </button>
                                </div>
                                <div id="pmContractDriveFolderPathText" style="font-size:12px; color:#0d9488; font-weight:700; margin-top:4px; margin-bottom:8px; display:${existingDrivePath ? 'block' : 'none'};" data-initial-path="${existingDrivePath}">
                                    ${existingDrivePath ? `Thư mục hiện tại: ${existingDrivePath}` : ''}
                                </div>

                                <div class="contract-upload-area" style="margin-bottom: 16px;">
                                    <label for="pmContractFileInput" class="upload-label" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; border:2px dashed #3b82f6; border-radius:16px; cursor:pointer; background:#f8fafc; transition: 0.2s; min-height:120px;" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='#f8fafc'">
                                        <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6;">cloud_upload</span>
                                        <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                        <span style="font-size:11px; color:#64748b; font-weight:500;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                    </label>
                                    <input type="file" id="pmContractFileInput" multiple onchange="window.erpApp.pmHandleContractFileUpload(event)" style="display:none;">
                                </div>

                                <div style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:16px; margin-bottom:16px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:12px;">
                                        <span class="material-icons-outlined" style="font-size:16px; color:#3b82f6;">link</span> Thêm file bằng đường link
                                    </label>
                                    <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                        <div style="flex:1; min-width:140px;">
                                            <input type="text" id="pmContractLinkName" placeholder="VD: Bản vẽ thiết kế..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                        </div>
                                        <div style="flex:2; min-width:200px;">
                                            <input type="url" id="pmContractLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                        </div>
                                        <button type="button" onclick="window.erpApp.pmAddContractFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                            <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                        </button>
                                    </div>
                                </div>
                                `}

                                <!-- File list container -->
                                <div id="pmContractFileList" style="margin-top:16px;">
                                    ${window.erpApp.renderContractFileList ? window.erpApp.renderContractFileList(tempContractFiles, !isView) : ''}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px; background:#f8fafc;">
                            <button type="button" onclick="window.erpApp.pmCloseAddContractModal()" style="padding:10px 20px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px; transition:0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">${isView ? 'Đóng' : 'Hủy bỏ'}</button>
                            ${isView ? '' : `<button type="submit" style="padding:10px 24px; border:none; background:#3b82f6; color:#fff; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px; box-shadow:0 4px 6px -1px rgba(59,130,246,0.3); transition:all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">${isEdit ? 'Lưu thay đổi' : 'Tạo hợp đồng'}</button>`}
                        </div>
                    </form>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.innerHTML = modalHtml;
        const modalElement = overlay.firstElementChild;

        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) { window.erpApp.pmCloseAddContractModal(); }
        });

        document.body.appendChild(modalElement);

        if (!isView) {
            setTimeout(() => {
                window.erpApp.loadContractDriveRootFolders(null, 'hop-dong');
            }, 100);
        }

        // Dynamic dropdown for categories based on inbound/outbound type
        window.erpApp.pmUpdateContractCategoryDropdown = function (formElement, selectedCategory = null) {
            const typeSelect = formElement.querySelector('select[name="type"]');
            const categoryLabel = formElement.querySelector('#pmContractCategoryLabel');
            const categorySelect = formElement.querySelector('#pmContractCategorySelect');
            if (!typeSelect || !categoryLabel || !categorySelect) return;

            const isOutbound = typeSelect.value === 'outbound';
            categoryLabel.textContent = isOutbound ? 'Phân loại doanh thu' : 'Phân loại chi phí';

            const activeCat = selectedCategory || (contract ? contract.category : 'khac');

            let optionsHtml = '';
            if (isOutbound) {
                optionsHtml = `
                    <option value="doanh-thu-xay-lap" ${activeCat === 'doanh-thu-xay-lap' ? 'selected' : ''}>Doanh thu Xây lắp/Thi công</option>
                    <option value="doanh-thu-vat-tu" ${activeCat === 'doanh-thu-vat-tu' ? 'selected' : ''}>Doanh thu Cung cấp vật tư</option>
                    <option value="doanh-thu-thiet-bi" ${activeCat === 'doanh-thu-thiet-bi' ? 'selected' : ''}>Doanh thu Cung cấp thiết bị</option>
                    <option value="khac" ${activeCat === 'khac' ? 'selected' : ''}>Khác</option>
                `;
            } else {
                optionsHtml = `
                    <option value="nhan-cong" ${activeCat === 'nhan-cong' ? 'selected' : ''}>Nhân công</option>
                    <option value="vat-tu" ${activeCat === 'vat-tu' ? 'selected' : ''}>Vật tư</option>
                    <option value="thue-may" ${activeCat === 'thue-may' ? 'selected' : ''}>Thuê máy/Thiết bị</option>
                    <option value="thau-phu" ${activeCat === 'thau-phu' ? 'selected' : ''}>Thầu phụ</option>
                    <option value="khac" ${activeCat === 'khac' ? 'selected' : ''}>Khác</option>
                `;
            }
            categorySelect.innerHTML = optionsHtml;
        };

        // Initialize category dropdown immediately
        window.erpApp.pmUpdateContractCategoryDropdown(modalElement, contract ? contract.category : null);

        if (window.flatpickr) {
            flatpickr(modalElement.querySelectorAll('.pm-date-picker-input'), {
                dateFormat: 'd/m/Y',
                allowInput: true,
                onChange: (selectedDates, dateStr, instance) => {
                    if (instance.element.name === 'signDate' || instance.element.name === 'startDate') {
                        window.erpApp.pmCalculateContractExpiry(instance.element.form);
                    }
                    if (instance.element.name === 'acceptanceDate' && dateStr.trim()) {
                        const statusSelect = instance.element.form.querySelector('select[name="status"]');
                        if (statusSelect) {
                            statusSelect.value = 'da-nghiem-thu';
                        }
                    }
                }
            });
        }
    };

    window.erpApp.pmSaveNewContract = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Safety wrapper for number cleaning
        const cleanNum = (str) => {
            if (!str) return 0;
            // Handle both string and number inputs, remove dots (Vietnamese separator)
            return parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.')) || 0;
        };

        try {
            const pmContracts = window.pmContracts || [];
            const pmProjects = window.pmProjects || [];
            const hoSoDocuments = window.hoSoDocuments || [];

            const title = formData.get('title');
            const partner = formData.get('partner');
            const projectId = formData.get('projectId');

            if (!title || !partner || !projectId) {
                window.erpApp.showToast('Vui lòng điền đầy đủ Tên HĐ, Đối tác và Dự án!', 'warning');
                return;
            }

            const parsedAcceptanceDate = window.erpApp.parseInputDate(formData.get('acceptanceDate'));
            const contractData = {
                id: formData.get('id') || `HĐ-AUTO-${Date.now().toString().slice(-6)}`,
                contractNo: formData.get('contractNo'),
                projectId: projectId,
                type: formData.get('type'),
                title: title,
                value: cleanNum(formData.get('value')),
                partner: partner,
                startDate: window.erpApp.parseInputDate(formData.get('startDate')),
                signDate: window.erpApp.parseInputDate(formData.get('signDate')),
                executionTime: parseInt(formData.get('executionTime')) || 0,
                warrantyPeriod: parseInt(formData.get('warrantyPeriod')) || 0,
                guaranteeExpiry: window.erpApp.parseInputDate(formData.get('guaranteeExpiry')),
                acceptanceDate: parsedAcceptanceDate,
                category: formData.get('category') || 'khac',
                status: (parsedAcceptanceDate && formData.get('status') !== 'da-thanh-ly') ? 'da-nghiem-thu' : formData.get('status'),
                vouchers: [...tempContractFiles]
            };

            const targetId = editId ? String(editId).trim() : null;
            if (editId) {
                const idx = pmContracts.findIndex(c => String(c.id).trim() === targetId);
                if (idx !== -1) {
                    contractData.linkedHsId = pmContracts[idx].linkedHsId;
                    pmContracts[idx] = { ...pmContracts[idx], ...contractData };
                } else {
                    console.error(`[PM Edit] Contract ID ${editId} not found in pmContracts.`);
                    throw new Error('Không tìm thấy hợp đồng để cập nhật!');
                }
            } else {
                if (pmContracts.some(c => String(c.id).trim() === String(contractData.id).trim())) {
                    window.erpApp.showToast('Mã hợp đồng đã tồn tại!', 'error');
                    return;
                }
                pmContracts.push(contractData);
            }

            // Ensure global window reference is updated
            window.pmContracts = pmContracts;

            // 1. Initial Sync for Contract
            if (window.CrudSync) {
                await window.CrudSync.saveItem('pmContracts', contractData, 'id')
                    .catch(err => { throw new Error('Lỗi sync PM: ' + err.message); });
            }

            // 2. Cascade Sync with Archive (HoSoDocuments)
            if (!editId) {
                const projectInfo = pmProjects.find(p => p.id === contractData.projectId);
                const isOutbound = contractData.type === 'outbound';

                const getHsId = () => {
                    const prefix = "HS-";
                    const now = new Date();
                    const yymm = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0');
                    const p = prefix + yymm + '-';
                    const matching = window.hoSoDocuments.filter(d => String(d.id).startsWith(p));
                    let maxSeq = 0;
                    for (const d of matching) {
                        const seq = parseInt(String(d.id).split('-').pop());
                        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                    }
                    return p + String(maxSeq + 1).padStart(3, '0');
                };

                const newHsId = getHsId();
                const newHsDoc = {
                    id: newHsId,
                    title: contractData.title,
                    category: 'hop-dong',
                    project: projectInfo ? projectInfo.name : contractData.projectId,
                    department: 'Phòng Kỹ thuật',
                    supplier: isOutbound ? 'VIETBACHCORP' : contractData.partner,
                    customer: isOutbound ? contractData.partner : 'VIETBACHCORP',
                    value: contractData.value,
                    warrantyPeriod: contractData.warrantyPeriod,
                    issueDate: contractData.signDate,
                    transDate: contractData.acceptanceDate,
                    status: 'active',
                    note: `Liên kết tự động từ HĐ dự án ${contractData.id}`,
                    linkedPmId: contractData.id,
                    symbol: contractData.contractNo || contractData.id,
                    files: []
                };
                contractData.linkedHsId = newHsId;
                window.hoSoDocuments.unshift(newHsDoc);

                if (window.CrudSync) {
                    await window.CrudSync.saveItem('hoSoDocuments', newHsDoc, 'id');
                    await window.CrudSync.saveItem('pmContracts', contractData, 'id'); // Update linkedHsId
                }
            } else if (contractData.linkedHsId) {
                const doc = window.hoSoDocuments.find(d => String(d.id).trim() === String(contractData.linkedHsId).trim());
                if (doc) {
                    Object.assign(doc, {
                        title: contractData.title,
                        value: contractData.value,
                        warrantyPeriod: contractData.warrantyPeriod,
                        issueDate: contractData.signDate,
                        transDate: contractData.acceptanceDate
                    });
                    if (window.CrudSync) await window.CrudSync.saveItem('hoSoDocuments', doc, 'id');
                }
            }

            // 3. Final Persistence
            localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));
            localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));

            window.erpApp.pmCloseAddContractModal();
            window.erpApp.showToast(editId ? 'Đã cập nhật hợp đồng!' : 'Thêm hợp đồng thành công!', 'success');

            // 4. Refresh View
            if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                if (typeof window.erpApp.renderQuanLyDuAn === 'function') window.erpApp.renderQuanLyDuAn();
                else if (typeof window.renderQuanLyDuAn === 'function') window.renderQuanLyDuAn();
            }
        } catch (err) {
            console.error('[pmSaveNewContract Error]', err);
            window.erpApp.showToast('Lỗi khi lưu hợp đồng: ' + err.message, 'error');
        }
    };

    window.erpApp.pmDeleteContract = async (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa hợp đồng dự án!', 'error');
            return;
        }

        const contract = pmContracts.find(c => String(c.id).trim() === String(id).trim());
        if (!contract) return;

        window.erpApp.showDeleteConfirmation(
            "Hợp đồng dự án",
            contract.title || id,
            async () => {
                const idx = pmContracts.findIndex(c => String(c.id).trim() === String(id).trim());
                if (idx === -1) {
                    console.error(`[PM Delete] Contract ID ${id} not found.`);
                    window.erpApp.showToast('Không tìm thấy hợp đồng để xóa.', 'error');
                    return;
                }

                const contract = pmContracts[idx];
                const linkedHsId = contract.linkedHsId;

                // 1. Remove from pmContracts
                pmContracts.splice(idx, 1);
                if (window.CrudSync) await window.CrudSync.deleteItem('pmContracts', id, 'id');
                localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));

                // 2. Cascade delete from hoSoDocuments if linked
                if (linkedHsId) {
                    const hsIdx = hoSoDocuments.findIndex(d => String(d.id).trim() === String(linkedHsId).trim());
                    if (hsIdx !== -1) {
                        hoSoDocuments.splice(hsIdx, 1);
                        if (window.CrudSync) await window.CrudSync.deleteItem('hoSoDocuments', linkedHsId, 'id');
                        localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));
                        console.log(`[Cascade Delete] Removed linked Archive record: ${linkedHsId}`);

                        if (typeof window.renderLuuTruHoSo === 'function') window.renderLuuTruHoSo();
                        else if (typeof window.erpApp.renderLuuTruHoSo === 'function') window.erpApp.renderLuuTruHoSo();
                    }
                }

                window.erpApp.showToast('Đã xóa hợp đồng và hồ sơ liên kết thành công.', 'success');

                window.erpApp.notifyCRUD('Hợp đồng dự án', 'delete', {
                    name: contract.title || id,
                    page: 'quan-ly-du-an',
                    module: 'Hợp đồng',
                    projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                });

                // 3. Refresh UI
                if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                    if (typeof window.erpApp.renderQuanLyDuAn === 'function') window.erpApp.renderQuanLyDuAn();
                    else if (typeof window.renderQuanLyDuAn === 'function') window.renderQuanLyDuAn();
                }
            }
        );
    };

    window.erpApp.pmOpenViewModal = (id) => {
        const pmContracts = window.pmContracts || [];
        const contract = pmContracts.find(c => c.id === id);
        if (contract && contract.isContracted) {
            window.erpApp.pmOpenAddContractedExpenseModal(id, true);
        } else {
            window.erpApp.pmOpenEditContractModal(id, true);
        }
    };

    // Appendix Modals
    window.erpApp.pmOpenAddAppendixModal = (id = null, isView = false) => {
        const pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;
        const projects = window.pmProjects || [];
        const pmContracts = window.pmContracts || [];
        const hoSoDocuments = window.hoSoDocuments || [];

        const project = projects.find(p => p.id === pmActiveProjectId);
        if (!project) return;

        const contracts = pmContracts.filter(c => c.projectId === project.id);
        const appendix = id ? hoSoDocuments.find(a => a.id === id) : null;
        const isEdit = !!id;

        tempContractFiles = appendix && appendix.vouchers ? [...appendix.vouchers] : [];

        const existingDrivePath = (tempContractFiles && tempContractFiles.find(f => f.drivePath)?.drivePath) || '';

        let initialExtendedDate = '';
        if (appendix && appendix.appendixExtend) {
            initialExtendedDate = window.erpApp.formatDate(appendix.appendixExtend);
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        overlay.innerHTML = `
            <div class="modal-content" style="width:600px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; background:#f8fafc; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">${isView ? 'Xem Phụ lục' : (isEdit ? 'Chỉnh sửa Phụ lục' : 'Thêm Phụ lục Hợp đồng')}</h2>
                        <div style="font-size:12px; color:#64748b; margin-top:4px;">Dự án: ${project.name}</div>
                    </div>
                    <button onclick="this.closest('.modal-overlay').remove()" style="border:none; background:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="${isView ? "event.preventDefault(); this.closest('.modal-overlay').remove();" : `window.erpApp.pmSaveAppendix(event${id ? `, '${id}'` : ''})`}">
                    <div style="padding:24px; max-height:calc(100vh - 180px); overflow-y:auto;">
                        <div style="margin-bottom:16px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hợp đồng gốc</label>
                            <select name="contractId" ${isView ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; background:${isView ? '#f1f5f9' : '#fff'}; font-weight:600;">
                                ${contracts.map(c => `<option value="${c.id}" ${appendix && appendix.symbol === c.id ? 'selected' : ''}>${c.id} - ${c.title}</option>`).join('')}
                            </select>
                        </div>

                        <div style="margin-bottom:16px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên/Nội dung phụ lục</label>
                            <input type="text" name="title" value="${appendix ? appendix.title : ''}" ${isView ? 'readonly' : ''} placeholder="Ví dụ: Phụ lục 01: Bổ sung hạng mục..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; background:${isView ? '#f1f5f9' : '#fff'}; font-weight:600;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giá trị điều chỉnh (VNĐ)</label>
                                <input type="text" name="value" value="${appendix ? window.erpApp.formatValue(appendix.appendixValue || 0) : ''}" oninput="window.erpApp.formatNumberInput(this)" ${isView ? 'readonly' : ''} placeholder="Nhập số tiền (+/-)..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; font-weight:700; background:${isView ? '#f1f5f9' : '#fff'};">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Gia hạn đến (ngày)</label>
                                <input type="text" class="${isView ? '' : 'pm-datepicker-ext'}" name="extendedDate" value="${initialExtendedDate}" ${isView ? 'readonly' : ''} placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; font-weight:700; background:${isView ? '#f1f5f9' : '#fff'};">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày ký PLHĐ</label>
                                <input type="text" class="${isView ? '' : 'pm-datepicker-date'}" name="date" value="${appendix && appendix.appendixDate ? window.erpApp.formatDate(appendix.appendixDate) : (isView ? '' : window.erpApp.formatDate(new Date().toISOString().split('T')[0]))}" ${isView ? 'readonly' : ''} placeholder="DD/MM/YYYY" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; background:${isView ? '#f1f5f9' : '#fff'};">
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                                <select name="status" ${isView ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; color:#1e293b; background:${isView ? '#f1f5f9' : '#fff'}; font-weight:600;">
                                    <option value="da-ky" ${appendix && appendix.appendixStatus === 'da-ky' ? 'selected' : ''}>Đã ký kết</option>
                                    <option value="dang-trinh" ${appendix && appendix.appendixStatus === 'dang-trinh' ? 'selected' : ''}>Đang trình duyệt</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:20px; border-top:1px dashed #e2e8f0; padding-top:16px;">
                            <label style="display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Tài liệu đính kèm (Ảnh / PDF / Link tài liệu)</label>
                            
                            ${isView ? '' : `
                            <div style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap;"><span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">folder</span>Lưu vào thư mục:</label>
                                <select id="pmContractDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadContractDriveFolderChain(null, 0)">
                                    <option value="">⏳ Đang tải thư mục...</option>
                                </select>
                                <div id="pmContractDriveFolderChain" style="display:contents"></div>
                                <button type="button" onclick="window.erpApp.loadContractDriveFolderChain(null, 0)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải lại thư mục" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                    <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                </button>
                                <button type="button" onclick="window.erpApp.createContractDriveSubfolderFromChainModal()" style="padding:8px 14px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s; height:38px;" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                    <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Thêm Thư Mục
                                </button>
                            </div>
                            <div id="pmContractDriveFolderPathText" style="font-size:12px; color:#0d9488; font-weight:700; margin-top:4px; margin-bottom:8px; display:${existingDrivePath ? 'block' : 'none'};" data-initial-path="${existingDrivePath}">
                                ${existingDrivePath ? `Thư mục hiện tại: ${existingDrivePath}` : ''}
                            </div>

                            <div class="contract-upload-area" style="margin-bottom: 16px;">
                                <label for="pmContractFileInput" class="upload-label" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px; border:2px dashed #3b82f6; border-radius:16px; cursor:pointer; background:#f8fafc; transition: 0.2s; min-height:120px;" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='#f8fafc'">
                                    <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6;">cloud_upload</span>
                                    <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                    <span style="font-size:11px; color:#64748b; font-weight:500;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Không giới hạn dung lượng</span>
                                </label>
                                <input type="file" id="pmContractFileInput" multiple onchange="window.erpApp.pmHandleContractFileUpload(event)" style="display:none;">
                            </div>

                            <div style="border-top:1px dashed #e2e8f0; padding-top:16px; margin-top:16px; margin-bottom:16px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:12px;">
                                    <span class="material-icons-outlined" style="font-size:16px; color:#3b82f6;">link</span> Thêm file bằng đường link
                                </label>
                                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                    <div style="flex:1; min-width:140px;">
                                        <input type="text" id="pmContractLinkName" placeholder="VD: Bản vẽ thiết kế..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <div style="flex:2; min-width:200px;">
                                        <input type="url" id="pmContractLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <button type="button" onclick="window.erpApp.pmAddContractFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                        <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                    </button>
                                </div>
                            </div>
                            `}

                            <!-- File list container -->
                            <div id="pmContractFileList" style="margin-top:16px;">
                                ${window.erpApp.renderContractFileList ? window.erpApp.renderContractFileList(tempContractFiles, !isView) : ''}
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        ${isView ? `
                            <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#6366f1; color:#fff; font-weight:700; cursor:pointer;">Đóng</button>
                        ` : `
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#6366f1; color:#fff; font-weight:700; cursor:pointer;">${isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
                        `}
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        if (!isView) {
            setTimeout(() => {
                window.erpApp.loadContractDriveRootFolders(null, 'hop-dong');
            }, 100);
        }

        if (!isView && window.flatpickr) {
            flatpickr(overlay.querySelectorAll('.pm-datepicker-ext, .pm-datepicker-date'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.pmSaveAppendix = (e, id = null) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : { role: 'Admin' };
        const isAdmin = currentUser && (['Admin', 'Director', 'Giám đốc', 'Phó Giám đốc', 'GĐDA', 'SuperAdmin'].includes(currentUser.role));
        if (!isAdmin) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!', 'error'); return; }

        e.preventDefault();
        const formData = new FormData(e.target);
        const cleanNum = (str) => {
            if (!str) { return 0; }
            const isNegative = str.trim().startsWith('-');
            const val = parseInt(str.replace(/[^0-9]/g, '')) || 0;
            return isNegative ? -val : val;
        };

        const pmActiveProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;
        const pmProjects = window.pmProjects || [];
        const pmContracts = window.pmContracts || [];
        const hoSoDocuments = window.hoSoDocuments || [];

        const project = pmProjects.find(p => p.id === pmActiveProjectId);
        if (!project) return;
        const contracts = pmContracts.filter(c => c.projectId === project.id);
        const contract = contracts.find(c => c.id === formData.get('contractId'));

        const parsedDate = window.erpApp.parseInputDate(formData.get('date'));
        const parsedExtendedDate = window.erpApp.parseInputDate(formData.get('extendedDate'));

        if (id) {
            const doc = hoSoDocuments.find(a => a.id === id);
            if (doc) {
                doc.symbol = formData.get('contractId');
                doc.projectPublic = contract ? contract.title : formData.get('contractId');
                doc.title = formData.get('title');
                doc.appendixValue = cleanNum(formData.get('value'));
                doc.appendixExtend = parsedExtendedDate || null;
                doc.appendixDate = parsedDate || null;
                doc.appendixStatus = formData.get('status');
                doc.vouchers = [...tempContractFiles];

                if (window.CrudSync) window.CrudSync.saveItem('hoSoDocuments', doc, 'id');
            }
        } else {
            const newDoc = {
                id: 'PL-' + Date.now().toString().slice(-4),
                title: formData.get('title'),
                category: 'phu-luc',
                status: 'active',
                projectPublic: contract ? contract.title : formData.get('contractId'),
                symbol: formData.get('contractId'),
                appendixValue: cleanNum(formData.get('value')),
                appendixExtend: parsedExtendedDate || null,
                appendixDate: parsedDate || null,
                appendixStatus: formData.get('status'),
                vouchers: [...tempContractFiles],
                issueDate: parsedDate || new Date().toISOString().split('T')[0],
                value: 0
            };
            hoSoDocuments.push(newDoc);

            if (window.CrudSync) window.CrudSync.saveItem('hoSoDocuments', newDoc, 'id');
        }

        localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));
        e.target.closest('.modal-overlay').remove();
        window.erpApp.showToast(id ? 'Đã cập nhật phụ lục hợp đồng' : 'Đã thêm phụ lục hợp đồng mới', 'success');

        if (typeof window.erpApp.renderQuanLyDuAn === 'function') window.erpApp.renderQuanLyDuAn();
        else if (typeof window.renderQuanLyDuAn === 'function') window.renderQuanLyDuAn();
    };

    window.erpApp.pmDeleteAppendix = (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa phụ lục!', 'error');
            return;
        }

        const doc = hoSoDocuments.find(a => a.id === id);
        if (!doc) return;

        window.erpApp.showDeleteConfirmation(
            "Phụ lục hợp đồng",
            doc.title,
            async () => {
                const idx = hoSoDocuments.findIndex(a => a.id === id);
                if (idx !== -1) {
                    const deleted = hoSoDocuments.splice(idx, 1)[0];
                    if (window.CrudSync) await window.CrudSync.deleteItem('hoSoDocuments', id, 'id');
                    localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));
                    window.erpApp.showToast('Đã xóa phụ lục hợp đồng thành công', 'success');

                    window.erpApp.notifyCRUD('Phụ lục HĐ', 'delete', {
                        name: deleted.title,
                        page: 'quan-ly-du-an',
                        module: 'PLHĐ',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    window.erpApp.renderQuanLyDuAn();
                }
            }
        );
    };

    /**
     * Bidirectional Sync between PM and Archive
     * Resolves discrepancies like "4 contracts in PM but only 3 in Archive"
     */
    window.erpApp.pmTwoWaySync = async (projectId, silent = false) => {
        const pmContracts = window.pmContracts || [];
        const pmMaterialContracts = window.pmMaterialContracts || [];
        const hoSoDocuments = window.hoSoDocuments || [];
        const projects = window.pmProjects || [];
        const project = projects.find(p => p.id === projectId);

        if (!project) {
            if (!silent) window.erpApp.showToast('Không tìm thấy dự án để đồng bộ.', 'error');
            return;
        }

        if (!silent) window.erpApp.showToast(`Đang bắt đầu đồng bộ dự án: ${project.name}...`, 'info');
        let pushedToArchive = 0;
        let pulledFromArchive = 0;

        const normalize = (s) => (s || '').toString().trim().toLowerCase();

        // 1. PM -> Archive: Combine Main and Material contracts
        const combinedPmContracts = [
            ...pmContracts.filter(c => c.projectId === projectId).map(c => ({ ...c, source: 'main' })),
            ...pmMaterialContracts.filter(c => c.projectId === projectId).map(c => ({ ...c, source: 'material' }))
        ];

        for (const contract of combinedPmContracts) {
            const linkedHs = hoSoDocuments.find(d =>
                (contract.linkedHsId && normalize(d.id) === normalize(contract.linkedHsId)) ||
                (d.linkedPmId && normalize(d.linkedPmId) === normalize(contract.id)) ||
                (normalize(d.category) === 'hop-dong' && normalize(d.symbol) === normalize(contract.contractNo) && contract.contractNo && (window.erpApp.isProjectMatch ? window.erpApp.isProjectMatch(d.project, project) : (normalize(d.project) === normalize(project.name) || normalize(d.project) === normalize(project.id))))
            );

            if (!linkedHs) {
                // Missing in Archive, push it
                const newHsId = 'HS-' + Date.now().toString().slice(-4) + '-' + Math.floor(Math.random() * 1000);
                const newDoc = {
                    id: newHsId,
                    title: contract.title || '',
                    category: 'hop-dong',
                    project: project.name,
                    department: 'Phòng Kỹ thuật',
                    supplier: contract.type === 'outbound' ? 'VIETBACHCORP' : (contract.partner || contract.supplier || 'N/A'),
                    customer: contract.type === 'outbound' ? (contract.partner || contract.supplier || 'N/A') : 'VIETBACHCORP',
                    value: contract.value || 0,
                    warrantyPeriod: contract.warrantyPeriod ?? 12,
                    issueDate: contract.signDate || null,
                    transDate: contract.acceptanceDate || null,
                    expiryDate: contract.guaranteeExpiry || null,
                    executionTime: contract.executionTime || null,
                    status: 'active',
                    note: `Đồng bộ tự động từ HĐ dự án (${contract.source === 'material' ? 'Vật tư' : 'Chính'}) ${contract.id}`,
                    linkedPmId: contract.id,
                    symbol: contract.contractNo || contract.id,
                    files: []
                };

                // Update original contract object with linkedHsId
                if (contract.source === 'main') {
                    const original = pmContracts.find(c => c.id === contract.id);
                    if (original) original.linkedHsId = newHsId;
                } else {
                    const original = pmMaterialContracts.find(c => c.id === contract.id);
                    if (original) original.linkedHsId = newHsId;
                }

                hoSoDocuments.unshift(newDoc);
                if (window.CrudSync) {
                    await window.CrudSync.saveItem('hoSoDocuments', newDoc, 'id');
                    if (contract.source === 'main') {
                        await window.CrudSync.saveItem('pmContracts', contract, 'id');
                    } else {
                        await window.CrudSync.saveItem('pmMaterialContracts', contract, 'id');
                    }
                }
                pushedToArchive++;
            } else {
                // Nếu đã khớp nhưng chưa liên kết ID, tiến hành liên kết chéo
                let updated = false;
                if (!contract.linkedHsId) {
                    contract.linkedHsId = linkedHs.id;
                    updated = true;
                }
                if (!linkedHs.linkedPmId) {
                    linkedHs.linkedPmId = contract.id;
                    updated = true;
                }
                if (updated) {
                    if (contract.source === 'main') {
                        const original = pmContracts.find(c => c.id === contract.id);
                        if (original) original.linkedHsId = linkedHs.id;
                    } else {
                        const original = pmMaterialContracts.find(c => c.id === contract.id);
                        if (original) original.linkedHsId = linkedHs.id;
                    }
                    if (window.CrudSync) {
                        await window.CrudSync.saveItem('hoSoDocuments', linkedHs, 'id');
                        if (contract.source === 'main') {
                            await window.CrudSync.saveItem('pmContracts', contract, 'id');
                        } else {
                            await window.CrudSync.saveItem('pmMaterialContracts', contract, 'id');
                        }
                    }
                }
            }
        }

        // 2. Archive -> PM: Find docs in Archive that are missing from PM
        const archiveDocs = hoSoDocuments.filter(d =>
            normalize(d.category) === 'hop-dong' && (window.erpApp.isProjectMatch ? window.erpApp.isProjectMatch(d.project, project) : (normalize(d.project) === normalize(project.name) || normalize(d.project) === normalize(project.id)))
        );
        for (const doc of archiveDocs) {
            const existsInPm = combinedPmContracts.find(c =>
                (c.linkedHsId && normalize(c.linkedHsId) === normalize(doc.id)) ||
                (doc.linkedPmId && normalize(doc.linkedPmId) === normalize(c.id)) ||
                (doc.symbol && normalize(c.contractNo) === normalize(doc.symbol))
            );

            if (!existsInPm) {
                // Pull from Archive to PM (Main contracts as default)
                if (typeof window.erpApp.syncArchiveWithContract === 'function') {
                    window.erpApp.syncArchiveWithContract(doc);
                    pulledFromArchive++;
                }
            }
        }

        // Save states
        localStorage.setItem('erp_hoSoDocuments', JSON.stringify(hoSoDocuments));
        localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));
        localStorage.setItem('erp_pmMaterialContracts', JSON.stringify(pmMaterialContracts));
        window.hoSoDocuments = hoSoDocuments;
        window.pmContracts = pmContracts;
        window.pmMaterialContracts = pmMaterialContracts;

        if (!silent) window.erpApp.showToast(`Đã đồng bộ xong dự án ${project.name}: ${pushedToArchive} hồ sơ mới, ${pulledFromArchive} hợp đồng PM mới.`, 'success');
        return { pushedToArchive, pulledFromArchive };
    };

    /**
     * Batch sync for all projects
     */
    window.erpApp.pmSyncAllProjectsFromArchive = async () => {
        const projects = window.pmProjects || [];
        if (projects.length === 0) {
            window.erpApp.showToast('Không có dự án nào để đồng bộ.', 'info');
            return;
        }

        window.erpApp.showToast(`Đang bắt đầu đồng bộ toàn bộ ${projects.length} dự án...`, 'info');
        let totalPushed = 0;
        let totalPulled = 0;

        for (const p of projects) {
            const res = await window.erpApp.pmTwoWaySync(p.id, true);
            if (res) {
                totalPushed += res.pushedToArchive;
                totalPulled += res.pulledFromArchive;
            }
        }

        window.erpApp.showToast(`Hoàn tất đồng bộ hệ thống: ${totalPushed} hồ sơ mới, ${totalPulled} hợp đồng PM mới.`, 'success');
        if (typeof window.erpApp.renderLuuTruHoSo === 'function') window.erpApp.renderLuuTruHoSo();
    };

    // ==========================================
    // CONSTRUCTION DAILY LOG (NHẬT KÝ THI CÔNG)
    // ==========================================
    window.erpApp.pmOpenDailyLogModal = (logId = null, isViewOnly = false) => {
        const logs = window.pmDailyLogs || [];
        const log = logId ? logs.find(l => l.id === logId) : null;
        const activeProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        const modalId = `LOG-${Date.now().toString().slice(-6)}`;

        overlay.innerHTML = `
            <div class="modal-content" style="width:750px; max-width:95%; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out; display:flex; flex-direction:column; max-height:90vh;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                    <div>
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:#f59e0b;">auto_stories</span> 
                            ${isViewOnly ? 'Chi tiết Nhật ký thi công' : (logId ? 'Cập nhật Nhật ký thi công' : 'Ghi Nhật ký thi công mới')}
                        </h2>
                        <div style="font-size:12px; color:#64748b; margin-top:4px;">Hệ thống quản lý chất lượng & Tiến độ công trình</div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        ${logId ? `<button onclick="window.erpApp.pmPrintDailyLog('${logId}')" style="background:#fff; border:1px solid #e2e8f0; color:#475569; padding:8px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:6px; font-weight:700; font-size:13px;"><span class="material-icons-outlined" style="font-size:18px;">print</span> In nhật ký</button>` : ''}
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                    </div>
                </div>
                
                <form onsubmit="window.erpApp.pmSaveDailyLog(event, ${logId ? `'${logId}'` : 'null'})" style="flex:1; overflow-y:auto; display:flex; flex-direction:column;">
                    <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                        <!-- Thông tin cơ bản -->
                        <div style="grid-column: span 2; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; background:#fff9f2; padding:20px; border-radius:16px; border:1px solid #ffedd5;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#9a3412; text-transform:uppercase; margin-bottom:8px;">Ngày thực hiện</label>
                                <input type="text" name="date" class="erp-datepicker" required value="${log ? window.erpApp.formatDate(log.date) : window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY"
                                    ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #fed7aa; border-radius:10px; font-size:14px; outline:none; font-weight:700;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#9a3412; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
                                    Thời tiết
                                    ${!isViewOnly ? `<span onclick="window.erpApp.pmAutoFetchWeather('${activeProjectId}')" style="cursor:pointer; color:#c2410c; text-decoration:underline; font-size:10px; display:flex; align-items:center; gap:2px;"><span class="material-icons-outlined" style="font-size:12px;">cloud_sync</span> Cập nhật tự động</span>` : ''}
                                </label>
                                <select name="weather" ${isViewOnly ? 'disabled' : ''} id="pmLogWeatherSelect" style="width:100%; padding:10px 12px; border:1.5px solid #fed7aa; border-radius:10px; font-size:14px; outline:none; font-weight:700;">
                                    <option value="Nắng" ${log && log.weather === 'Nắng' ? 'selected' : ''}>Trời Nắng</option>
                                    <option value="Mưa" ${log && log.weather === 'Mưa' ? 'selected' : ''}>Trời Mưa</option>
                                    <option value="Nhiều mây" ${log && log.weather === 'Nhiều mây' ? 'selected' : ''}>Nhiều mây / Dịu</option>
                                    <option value="Giông bão" ${log && log.weather === 'Giông bão' ? 'selected' : ''}>Giông bão / Nghỉ</option>
                                </select>
                            </div>
                            <div class="form-group" style="grid-column: span 1;">
                                <label style="display:block; font-size:11px; font-weight:800; color:#9a3412; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
                                    Số lượng nhân công
                                    ${!isViewOnly ? `<span onclick="window.erpApp.pmUpdateManpowerFromLabor(this.closest('form').date.value, '${activeProjectId}', this.closest('form'))" style="cursor:pointer; color:#c2410c; text-decoration:underline; font-size:10px; display:flex; align-items:center; gap:2px;"><span class="material-icons-outlined" style="font-size:12px;">sync</span> Đồng bộ</span>` : ''}
                                </label>
                                <input type="number" name="manpowerCount" required value="${log ? log.manpowerCount : 0}" ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #fed7aa; border-radius:10px; font-size:14px; outline:none; font-weight:700; color:#c2410c; transition: background 0.3s;">
                            </div>
                        </div>

                        <!-- Đánh giá bổ sung -->
                        <div style="grid-column: span 2; display:grid; grid-template-columns: 1fr 1fr; gap:20px; background:#f8fafc; padding:20px; border-radius:16px; border:1px solid #e2e8f0;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px;">Vệ sinh môi trường</label>
                                <select name="envSanitation" ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#fff;">
                                    <option value="Tốt" ${log && log.envSanitation === 'Tốt' ? 'selected' : ''}>Tốt</option>
                                    <option value="Bình thường" ${!log || log.envSanitation === 'Bình thường' ? 'selected' : ''}>Bình thường</option>
                                    <option value="Kém" ${log && log.envSanitation === 'Kém' ? 'selected' : ''}>Kém</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px;">An toàn lao động</label>
                                <select name="laborSafety" ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#fff;">
                                    <option value="Tốt" ${log && log.laborSafety === 'Tốt' ? 'selected' : ''}>Tốt</option>
                                    <option value="Bình thường" ${!log || log.laborSafety === 'Bình thường' ? 'selected' : ''}>Bình thường</option>
                                    <option value="Kém" ${log && log.laborSafety === 'Kém' ? 'selected' : ''}>Kém</option>
                                </select>
                            </div>
                        </div>

                        <!-- Nội dung công việc -->
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Nội dung thi công chính</label>
                            <textarea name="workSummary" rows="3" required placeholder="Mô tả các đầu việc chính trong ngày..." ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; resize:none;">${log ? log.workSummary : ''}</textarea>
                        </div>

                        <!-- Chi tiết nhân sự & Thiết bị -->
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chi tiết tổ đội & Nhân lực</label>
                            <textarea name="manpowerDetails" rows="4" placeholder="VD: Tổ nề 10 người, Tổ điện 5 người..." ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; outline:none; resize:none; background:#f8fafc;">${log ? (log.manpowerDetails || '') : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
                                Thiết bị & Máy móc sử dụng
                                ${!isViewOnly ? `<span onclick="window.erpApp.pmUpdateEquipmentFromLogs(this.closest('form').date.value, '${activeProjectId}', this.closest('form'))" style="cursor:pointer; color:#2563eb; text-decoration:underline; font-size:10px; display:flex; align-items:center; gap:2px;"><span class="material-icons-outlined" style="font-size:12px;">sync</span> Đồng bộ</span>` : ''}
                            </label>
                            <textarea name="equipmentDetails" rows="4" placeholder="VD: 1 máy xúc, 2 máy đầm, 1 cẩu tháp..." ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; outline:none; resize:none; background:#f8fafc;">${log ? (log.equipmentDetails || '') : ''}</textarea>
                        </div>

                        <!-- An toàn & Sự cố -->
                        <div class="form-group" style="grid-column: span 2;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#ef4444; text-transform:uppercase; margin-bottom:8px;">Ghi chú An toàn / Sự cố / Trở ngại</label>
                            <textarea name="safetyNotes" rows="2" placeholder="Ghi nhận các vấn đề phát sinh hoặc tình trạng an toàn..." ${isViewOnly ? 'disabled' : ''} style="width:100%; padding:12px; border:1.5px solid #fee2e2; border-radius:12px; font-size:13px; outline:none; resize:none;">${log ? (log.safetyNotes || '') : ''}</textarea>
                        </div>

                        <!-- Hình ảnh & Chứng từ -->
                        <div style="grid-column: span 2; border:1.5px dashed #cbd5e1; border-radius:16px; padding:20px;">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:12px;">Hình ảnh hiện trường & Chứng từ (Vouchers)</label>
                            
                            <div id="pmTempFilePreview" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                                ${log && log.vouchers ? log.vouchers.map(v => `
                                    <div class="pm-file-item" data-file-name="${v.name}" data-file-type="${v.type}" data-file-data="${v.data || ''}" data-file-url="${v.url || ''}" style="display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; padding:6px 12px; border-radius:8px; margin:4px; font-size:12px;">
                                        <span class="material-icons-outlined" style="font-size:16px; color:#64748b;">${v.type === 'image' ? 'image' : 'description'}</span>
                                        <span class="file-info" title="${v.name}" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;" onclick="${v.url ? `window.open('${v.url}', '_blank')` : (v.data ? `window.erpApp.pmViewFullImage('${v.data}')` : '')}">${v.name}</span>
                                        ${!isViewOnly ? `<button type="button" onclick="this.closest('.pm-file-item').remove()" style="border:none; background:none; color:#ef4444; cursor:pointer; padding:0; display:flex;"><span class="material-icons-outlined" style="font-size:16px;">cancel</span></button>` : ''}
                                    </div>
                                `).join('') : ''}
                            </div>
                            
                            ${!isViewOnly ? `
                                <div style="display:flex; gap:10px;">
                                    <label class="pm-btn-upload" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; color:#475569; font-size:13px; font-weight:700; cursor:pointer; transition:0.2s;">
                                        <span class="material-icons-outlined">add_a_photo</span> Tải ảnh / File lên
                                        <input type="file" multiple accept="image/*,application/pdf" onchange="window.erpApp.pmHandleTempUpload(this)" style="display:none;">
                                    </label>
                                    <button type="button" onclick="window.erpApp.pmToggleDailyLogLinkArea()" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; color:#475569; font-size:13px; font-weight:700; cursor:pointer; transition:0.2s;">
                                        <span class="material-icons-outlined">link</span> Dán link (Drive/Cloud)
                                    </button>
                                </div>
                                <div id="pmDailyLogLinkArea" style="display:none; margin-top:10px; gap:8px;">
                                    <input type="text" id="pmDailyLogLinkInput" placeholder="Dán link Google Drive hoặc Dropbox vào đây..." 
                                        onkeydown="if(event.key==='Enter') { event.preventDefault(); window.erpApp.pmConfirmAddDailyLogLink(); }"
                                        style="flex:1; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none;">
                                    <button type="button" onclick="window.erpApp.pmConfirmAddDailyLogLink()" style="background:#1e293b; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-weight:700; cursor:pointer;">Thêm</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px; margin-top:auto;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">${isViewOnly ? 'Đóng' : 'Hủy bỏ'}</button>
                        ${!isViewOnly ? `<button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#f59e0b; color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(245, 158, 11, 0.2);">Lưu nhật ký</button>` : ''}
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        if (window.flatpickr) {
            flatpickr(overlay.querySelectorAll('.erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.pmSaveDailyLog = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const activeProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;

        // Ensure we are working with the global state
        window.pmDailyLogs = window.pmDailyLogs || [];
        const logs = window.pmDailyLogs;
        const log = editId ? logs.find(l => l.id === editId) : null;
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : { displayName: 'User' };

        const voucherItems = document.querySelectorAll('#pmTempFilePreview .pm-file-item');
        const vouchers = Array.from(voucherItems).map(item => ({
            name: item.dataset.fileName,
            type: item.dataset.fileType,
            data: item.dataset.fileData || '',
            url: item.dataset.fileUrl || ''
        }));

        let savedLog = null;

        if (editId) {
            const idx = logs.findIndex(l => l.id === editId);
            if (idx !== -1) {
                // Merge with existing log to keep fields like createdBy, createdAt, etc.
                savedLog = {
                    ...logs[idx],
                    date: window.erpApp.parseInputDate(formData.get('date')),
                    weather: formData.get('weather'),
                    manpowerCount: parseInt(formData.get('manpowerCount')) || 0,
                    workSummary: formData.get('workSummary'),
                    manpowerDetails: formData.get('manpowerDetails'),
                    equipmentDetails: formData.get('equipmentDetails'),
                    safetyNotes: formData.get('safetyNotes'),
                    envSanitation: formData.get('envSanitation') || 'Bình thường',
                    laborSafety: formData.get('laborSafety') || 'Bình thường',
                    vouchers: vouchers,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUser.displayName || currentUser.username || 'User'
                };

                logs[idx] = savedLog;

                if (window.CrudSync) {
                    console.log('📤 Syncing Daily Log (Update) to Cloud:', savedLog.id);
                    window.CrudSync.saveItem('pmDailyLogs', savedLog, 'id')
                        .catch(err => window.erpApp.showToast('Lỗi đồng bộ nhật ký: ' + err.message, 'error'));
                }
                localStorage.setItem('erp_pmDailyLogs', JSON.stringify(logs));
            }
        } else {
            savedLog = {
                id: `LOG-${Date.now().toString().slice(-6)}`,
                projectId: activeProjectId,
                date: window.erpApp.parseInputDate(formData.get('date')),
                weather: formData.get('weather'),
                manpowerCount: parseInt(formData.get('manpowerCount')) || 0,
                workSummary: formData.get('workSummary'),
                manpowerDetails: formData.get('manpowerDetails'),
                equipmentDetails: formData.get('equipmentDetails'),
                safetyNotes: formData.get('safetyNotes'),
                envSanitation: formData.get('envSanitation') || 'Bình thường',
                laborSafety: formData.get('laborSafety') || 'Bình thường',
                vouchers: vouchers,
                createdBy: currentUser.displayName || currentUser.username || 'User',
                createdAt: new Date().toISOString()
            };

            logs.unshift(savedLog);

            if (window.CrudSync) {
                console.log('📤 Syncing Daily Log (New) to Cloud:', savedLog.id);
                window.CrudSync.saveItem('pmDailyLogs', savedLog, 'id')
                    .catch(err => window.erpApp.showToast('Lỗi đồng bộ nhật ký: ' + err.message, 'error'));
            }
            localStorage.setItem('erp_pmDailyLogs', JSON.stringify(logs));
        }

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editId ? 'Cập nhật thành công!' : 'Đã ghi nhật ký thi công!', 'success');

        // Immediate UI update
        if (typeof window.erpApp.renderQuanLyDuAn === 'function') {
            window.erpApp.renderQuanLyDuAn();
        }

        if (savedLog) {
            window.erpApp.notifyCRUD('Nhật ký thi công', editId ? 'update' : 'add', {
                name: `Ngày ${savedLog.date}`,
                page: 'quan-ly-du-an',
                module: 'Nhật ký thi công',
                projectId: activeProjectId
            });
        }
    };

    window.erpApp.pmDeleteDailyLog = async (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa nhật ký thi công!', 'error');
            return;
        }

        const logs = window.pmDailyLogs || [];
        const log = logs.find(l => l.id === id);
        if (!log) return;

        window.erpApp.showDeleteConfirmation(
            "Nhật ký thi công",
            `Ngày ${log.date}`,
            async () => {
                const idx = logs.findIndex(l => l.id === id);
                if (idx !== -1) {
                    const deleted = logs.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        console.log('🗑️ Deleting Daily Log from Cloud:', id);
                        await window.CrudSync.deleteItem('pmDailyLogs', id, 'id');
                    }
                    localStorage.setItem('erp_pmDailyLogs', JSON.stringify(logs));
                    window.erpApp.showToast(`Đã xóa nhật ký thi công thành công`, 'success');

                    window.erpApp.notifyCRUD('Nhật ký thi công', 'delete', {
                        name: `Ngày ${deleted.date}`,
                        page: 'quan-ly-du-an',
                        module: 'Nhật ký thi công',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    window.erpApp.renderQuanLyDuAn();
                }
            }
        );
    };

    window.erpApp.pmUpdateManpowerFromLabor = (dateStr, projectId, form) => {
        if (!dateStr || !projectId || !form) return;

        const [y, m, d] = dateStr.split('-');
        const displayDate = `${parseInt(d)}/${parseInt(m)}/${y}`;
        const normalizedDisplayDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;

        // 1. Lấy dữ liệu từ Tổ đội (pmLaborLogs)
        const laborLogs = (window.pmLaborLogs || []).filter(l => l.projectId === projectId && (l.date === normalizedDisplayDate || l.date === displayDate || l.date === dateStr));
        const teamTotal = laborLogs.reduce((sum, l) => sum + (parseInt(l.count) || 0), 0);

        // 2. Lấy dữ liệu từ Chấm công cá nhân (pmAttendanceLogs)
        // Cần lọc theo workers thuộc dự án này
        const projectWorkers = (window.pmWorkers || []).filter(w => w.projectId === projectId);
        const attendanceLogs = (window.pmAttendanceLogs || []).filter(l =>
            l.date === dateStr &&
            (l.normalWork > 0) &&
            projectWorkers.some(w => w.id === l.workerId)
        );
        const individualTotal = attendanceLogs.length;

        const total = teamTotal + individualTotal;

        const manpowerCountInput = form.querySelector('[name="manpowerCount"]');
        if (manpowerCountInput) {
            manpowerCountInput.value = total;
            manpowerCountInput.style.backgroundColor = '#ecfdf5';
            setTimeout(() => manpowerCountInput.style.backgroundColor = 'transparent', 1000);
        }

        const manpowerDetailsTextarea = form.querySelector('[name="manpowerDetails"]');
        if (manpowerDetailsTextarea) {
            const teamDetails = laborLogs.map(l => `- ${l.team}: ${l.count} người (${l.work || 'Thi công'})`).join('\n');
            const workerNames = attendanceLogs.map(l => {
                const w = projectWorkers.find(worker => worker.id === l.workerId);
                return w ? w.name : l.workerId;
            });
            const individualDetails = workerNames.length > 0 ? `- Chấm công cá nhân (${workerNames.length} người): ${workerNames.join(', ')}` : '';

            const details = [teamDetails, individualDetails].filter(d => d).join('\n');

            if (details) {
                if (!manpowerDetailsTextarea.value || confirm('Bạn có muốn cập nhật chi tiết tổ đội & nhân lực từ hệ thống không?')) {
                    manpowerDetailsTextarea.value = details;
                }
            } else {
                window.erpApp.showToast('Không có dữ liệu nhân công cho ngày này.', 'info');
            }
        }
    };

    window.erpApp.pmUpdateEquipmentFromLogs = (dateStr, projectId, form) => {
        if (!dateStr || !projectId || !form) return;

        const [y, m, d] = dateStr.split('-');
        const displayDate = `${parseInt(d)}/${parseInt(m)}/${y}`;
        const normalizedDisplayDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        const project = (window.pmProjects || []).find(p => p.id === projectId) || { name: projectId };

        // 1. Từ Nhật ký ca máy
        const machineLogs = (window.pmMachineLogs || []).filter(l => l.projectId === projectId && (l.date === normalizedDisplayDate || l.date === displayDate || l.date === dateStr));

        // 2. Từ Lệnh điều xe (vmUsage)
        const dispatches = (window.vmUsage || []).filter(u => {
            const uDate = u.time ? u.time.split('T')[0] : '';
            if (uDate !== dateStr) return false;

            const routeNorm = (u.route || '').toLowerCase().trim();
            const pNameNorm = (project.name || '').toLowerCase().trim();
            return routeNorm === pNameNorm || routeNorm === project.id.toLowerCase() || routeNorm.includes(pNameNorm) || pNameNorm.includes(routeNorm);
        });

        const equipmentDetailsTextarea = form.querySelector('[name="equipmentDetails"]');
        if (equipmentDetailsTextarea) {
            const grouped = {}; // { equipmentName: { codes: Set } }

            // Process machine logs
            machineLogs.forEach(l => {
                const eq = (window.pmEquipment || []).find(e => e.id === l.equipmentId) || { name: l.equipmentId || 'Thiết bị', code: l.equipmentId };
                const name = eq.name;
                if (!grouped[name]) grouped[name] = { codes: new Set() };
                grouped[name].codes.add(eq.code || eq.id);
            });

            // Process dispatches
            dispatches.forEach(u => {
                const v = (window.vmVehicles || []).find(veh => veh.id === u.vId) || { name: u.vId, id: u.vId };
                const name = v.name;
                if (!grouped[name]) grouped[name] = { codes: new Set() };
                grouped[name].codes.add(v.internalCode || v.id);
            });

            const details = Object.entries(grouped).map(([name, info]) => {
                const codesArr = Array.from(info.codes);
                return `- ${name} (${codesArr.length} chiếc): ${codesArr.join(', ')}`;
            }).join('\n');

            if (details) {
                if (!equipmentDetailsTextarea.value || confirm('Bạn có muốn cập nhật chi tiết thiết bị từ hệ thống không?')) {
                    equipmentDetailsTextarea.value = details;
                }
            } else {
                window.erpApp.showToast('Không có dữ liệu thiết bị cho ngày này.', 'info');
            }
        }
    };

    window.erpApp.pmPrintDailyLog = (id) => {
        const logs = window.pmDailyLogs || [];
        const projects = window.pmProjects || [];
        const log = logs.find(l => l.id === id);
        if (!log) {
            window.erpApp.showToast('Không tìm thấy dữ liệu nhật ký!', 'error');
            return;
        }

        const project = projects.find(p => p.id === log.projectId) || { name: 'Dự án chưa xác định', location: '—' };
        const entInfo = window.enterpriseInfo || {};

        // Calculate live manpower for print if details are empty
        const getManpowerForDate = (dateStr, pId) => {
            if (!dateStr) return 0;
            const [y, m, d] = dateStr.split('-');
            const dDate = `${parseInt(d)}/${parseInt(m)}/${y}`;
            const nDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
            return (window.pmLaborLogs || [])
                .filter(l => l.projectId === pId && (l.date === nDate || l.date === dDate))
                .reduce((sum, l) => sum + (parseInt(l.count) || 0), 0);
        };
        const liveManpower = getManpowerForDate(log.date, log.projectId);

        const dateObj = window.erpApp.toJsDate(log.date) || new Date();
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        // Fetch equipment logs if available
        const equipmentLogs = (window.pmMachineLogs || [])
            .filter(e => e.projectId === log.projectId && (e.date === log.date || e.date === dateStr));

        const printWindow = window.open('', '_blank');

        const formatMultiline = (text) => {
            if (!text) return '—';
            return text.split('\n').join('<br>');
        };

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>NHẬT KÝ THI CÔNG - ${dateStr}</title>
                <style>
                    @page { size: A4; margin: 0; }
                    body { font-family: "Times New Roman", Times, serif; color: #000; line-height: 1.4; font-size: 12pt; margin: 15mm 15mm 20mm 15mm; padding: 0; }
                    
                    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                    .company-info { width: 50%; }
                    .company-name { font-weight: bold; text-transform: uppercase; font-size: 11pt; margin-bottom: 2px; }
                    .company-sub { font-size: 10pt; font-weight: normal; color: #333; }
                    
                    .national-branding { width: 45%; text-align: center; }
                    .nation-subtitle { font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 0px; }
                    .nation-title { font-weight: bold; font-size: 12pt; margin-bottom: 2px; }
                    .decoration-line { width: 120px; border-bottom: 1.5px solid #000; margin: 0 auto; }

                    .doc-title { text-align: center; margin: 10px 0 8px 0; }
                    .doc-title h1 { font-size: 16pt; text-transform: uppercase; margin: 0; font-weight: bold; letter-spacing: 1px; }
                    .doc-date { font-style: italic; font-size: 11pt; margin-top: 2px; }

                    .info-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px; margin-bottom: 10px; border: 1.5px solid #000; padding: 10px; background: #fafafa; }
                    .info-item { display: flex; gap: 6px; }
                    .info-label { font-weight: bold; min-width: 90px; }
                    .info-value { border-bottom: 1px dotted #999; flex: 1; }

                    .section-header { font-weight: bold; text-transform: uppercase; font-size: 11pt; margin: 12px 0 6px 0; display: flex; align-items: center; gap: 10px; border-left: 5px solid #000; padding-left: 10px; background: #f8f8f8; padding-top: 3px; padding-bottom: 3px; }
                    
                    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10.5pt; table-layout: fixed; }
                    table.data-table th, table.data-table td { border: 1px solid #000; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; }
                    table.data-table th { background: #eeeeee; text-align: center; font-weight: bold; text-transform: uppercase; font-size: 9pt; }
                    
                    .content-box { border: 1px solid #000; padding: 10px; min-height: 80px; white-space: pre-wrap; font-size: 11pt; margin-bottom: 12px; background: #fff; line-height: 1.5; }
                    
                    .signature-container { display: grid; grid-template-columns: 1fr 1fr; margin-top: 15px; text-align: center; page-break-inside: avoid; }
                    .sig-block { padding: 5px; }
                    .sig-title { font-weight: bold; text-transform: uppercase; margin-bottom: 45px; font-size: 10.5pt; line-height: 1.3; }
                    .sig-name { font-weight: bold; text-decoration: underline; }

                    .no-print { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 12px; z-index: 10000; }
                    .btn { padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; font-size: 14px; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .btn-cancel { background: #64748b; color: white; }
                    .btn-print { background: #2563eb; color: white; }
                    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }

                    @media print {
                        .no-print { display: none; }
                        body { -webkit-print-color-adjust: exact; background: white; }
                        .info-grid { background: white !important; }
                        .section-header { background: #f0f0f0 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="doc-title">
                    <h1>NHẬT KÝ THI CÔNG</h1>
                    <div class="doc-date">Ngày ${day} tháng ${month} năm ${year}</div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Thời tiết:</span>
                        <span class="info-value">${log.weather || 'Bình thường'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">NL / TB:</span>
                        <span class="info-value">${log.manpowerCount || liveManpower || 0} người | ${equipmentLogs.length} máy</span>
                    </div>
                </div>

                <div class="section-header">I. TÌNH HÌNH NHÂN LỰC</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">STT</th>
                            <th style="width: 240px;">Tổ đội / Hạng mục nhân sự</th>
                            <th style="width: 80px;">Số lượng</th>
                            <th>Ghi chú / Phân công công việc</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${log.manpowerDetails ? log.manpowerDetails.split('\n').filter(l => l.trim()).map((line, idx) => {
            const parts = line.split(':');
            return `
                                <tr>
                                    <td style="text-align: center;">${idx + 1}</td>
                                    <td>${parts[0] || '—'}</td>
                                    <td style="text-align: center;">${parts[1] || '—'}</td>
                                    <td>Tiếp tục thi công theo kế hoạch</td>
                                </tr>
                            `;
        }).join('') : `
                            <tr>
                                <td style="text-align: center;">1</td>
                                <td>Nhân công trực tiếp thi công</td>
                                <td style="text-align: center;">${log.manpowerCount || liveManpower || 0}</td>
                                <td>Thi công các hạng mục tại hiện trường</td>
                            </tr>
                        `}
                    </tbody>
                </table>

                <div class="section-header">II. THIẾT BỊ, MÁY MÓC THI CÔNG</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">STT</th>
                            <th style="width: 240px;">Tên máy / Thiết bị</th>
                            <th style="width: 80px;">Số lượng</th>
                            <th>Thời gian làm việc / Tình trạng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${log.equipmentDetails ? log.equipmentDetails.split('\n').filter(l => l.trim()).map((line, idx) => {
            const parts = line.split(':');
            return `
                                <tr>
                                    <td style="text-align: center;">${idx + 1}</td>
                                    <td>${parts[0] || '—'}</td>
                                    <td style="text-align: center;">${parts[1] || '—'}</td>
                                    <td>Hoạt động bình thường</td>
                                </tr>
                            `;
        }).join('') : (equipmentLogs.length > 0 ? equipmentLogs.map((e, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td>${e.name || '—'}</td>
                                <td style="text-align: center;">1</td>
                                <td>Ghi nhận: ${e.shift || '1 ca'}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align: center; color: #666; font-style: italic; padding: 15px;">Không có ghi nhận thiết bị đặc biệt</td></tr>')}
                    </tbody>
                </table>

                <div class="section-header">III. NỘI DUNG CÔNG VIỆC THỰC HIỆN CHI TIẾT</div>
                <div class="content-box">${formatMultiline(log.workSummary)}</div>

                <div class="section-header">IV. NHẬN XÉT, ĐÁNH GIÁ VÀ CÁC VẤN ĐỀ KHÁC</div>
                <table class="data-table">
                    <tr>
                        <td style="width: 180px; font-weight: bold; background: #fcfcfc;">An toàn lao động:</td>
                        <td>${log.laborSafety || 'Tốt'}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background: #fcfcfc;">Vệ sinh môi trường:</td>
                        <td>${log.envSanitation || 'Tốt'}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background: #fcfcfc;">Sự cố / Trở ngại:</td>
                        <td>${formatMultiline(log.safetyNotes)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; background: #fcfcfc;">Ý kiến chỉ đạo / Tiếp thu:</td>
                        <td>Đồng ý cho tiếp tục triển khai các hạng mục theo đúng hồ sơ thiết kế và biện pháp thi công đã duyệt.</td>
                    </tr>
                </table>

                <div class="signature-container">
                    <div class="sig-block">
                        <div class="sig-title">ĐẠI DIỆN TƯ VẤN GIÁM SÁT<br>HOẶC CHỦ ĐẦU TƯ</div>
                        <p style="font-size: 10pt; font-style: italic;">(Ký và ghi rõ họ tên)</p>
                        <div style="height: 90px;"></div>
                        <div style="color: #ccc;">................................................</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-title">ĐẠI DIỆN ĐƠN VỊ THI CÔNG<br>(CHỈ HUY TRƯỞNG)</div>
                        <p style="font-size: 10pt; font-style: italic;">(Ký và ghi rõ họ tên)</p>
                        <div style="height: 90px;"></div>
                        <div class="sig-name">${log.createdBy || 'BCH CÔNG TRÌNH'}</div>
                    </div>
                </div>

                <div class="no-print">
                    <button class="btn btn-cancel" onclick="window.close()">Hủy bỏ</button>
                    <button class="btn btn-print" onclick="window.print()">XÁC NHẬN IN NHẬT KÝ</button>
                </div>

                <script>
                    window.onload = () => {
                        // Optional auto print: setTimeout(() => window.print(), 300);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    window.erpApp.pmViewFullImage = (data) => {
        const overlay = document.createElement('div');
        overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; cursor:pointer;';
        overlay.onclick = () => overlay.remove();
        overlay.innerHTML = `<img src="${data}" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow:0 0 50px rgba(0,0,0,0.5);">`;
        document.body.appendChild(overlay);
    };

    window.erpApp.pmConfirmAddDailyLogLink = () => {
        const input = document.getElementById('pmDailyLogLinkInput');
        let link = input.value.trim();
        if (!link) return;

        const preview = document.getElementById('pmTempFilePreview');
        if (!preview) return;

        // Smart detection for image links & Google Drive conversion
        let isImage = /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(link) || link.includes('img') || link.includes('photo');

        if (link.includes('drive.google.com')) {
            const driveIdMatch = link.match(/\/file\/d\/([^/]+)/) || link.match(/id=([^&]+)/);
            if (driveIdMatch && driveIdMatch[1]) {
                const driveId = driveIdMatch[1];
                // Convert to direct link for better display in gallery/reports
                link = `https://drive.google.com/uc?id=${driveId}&export=view`;
                isImage = true; // Most users adding Drive links to Daily Log intend them to be photos
            }
        }

        const fileType = isImage ? 'image' : 'pdf';
        const icon = isImage ? 'image' : 'link';
        const label = isImage ? 'Hình ảnh hiện trường' : 'Tài liệu đính kèm';

        const item = document.createElement('div');
        item.className = 'pm-file-item';
        item.dataset.fileName = label;
        item.dataset.fileType = fileType;
        item.dataset.fileUrl = link;

        item.style = 'display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; padding:6px 12px; border-radius:8px; margin:4px; font-size:12px;';
        item.innerHTML = `
            <span class="material-icons-outlined" style="font-size:16px; color:${isImage ? '#f59e0b' : '#6366f1'};">${icon}</span>
            <span class="file-info" title="${link}" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;" onclick="window.open('${link}', '_blank')">${label}</span>
            <button type="button" onclick="this.closest('.pm-file-item').remove()" style="border:none; background:none; color:#ef4444; cursor:pointer; padding:0; display:flex;"><span class="material-icons-outlined" style="font-size:16px;">cancel</span></button>
        `;
        preview.appendChild(item);
        input.value = '';
        document.getElementById('pmDailyLogLinkArea').style.display = 'none';
    };

    window.erpApp.pmToggleDailyLogLinkArea = () => {
        const area = document.getElementById('pmDailyLogLinkArea');
        if (area) {
            area.style.display = area.style.display === 'none' ? 'flex' : 'none';
            if (area.style.display === 'flex') {
                const input = document.getElementById('pmDailyLogLinkInput');
                if (input) input.focus();
            }
        }
    };

    window.erpApp.pmFetchWeatherForProject = async (projectId) => {
        const project = (window.pmProjects || []).find(p => p.id === projectId);
        if (!project) return null;

        let address = project.location || project.address || '';
        if (!address || address.startsWith('http')) return null;

        // Ưu tiên lấy Tỉnh/Thành từ cuối địa chỉ
        const parts = address.split(',').map(p => p.trim());
        const province = parts.length > 0 ? parts[parts.length - 1].replace(/^(Tỉnh|Thành phố|TP)\s+/i, '') : '';

        // Sử dụng wttr.in - hỗ trợ tiếng Việt tốt
        const locationQuery = province.replace(/\s+/g, '');
        const targetUrl = `https://wttr.in/${encodeURIComponent(locationQuery)}?format=%C&lang=vi`;

        // Danh sách proxy để xoay vòng nếu một cái lỗi
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
        ];

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;

                let statusText = '';
                if (proxyUrl.includes('allorigins')) {
                    const data = await response.json();
                    statusText = data.contents;
                } else {
                    statusText = await response.text();
                }

                statusText = statusText.toLowerCase().trim();
                if (!statusText || statusText.includes('uốn nắn') || statusText.includes('lỗi')) continue;

                let weatherValue = 'Nhiều mây';
                if (statusText.includes('mưa') || statusText.includes('dông') || statusText.includes('bão') || statusText.includes('tuyết')) {
                    weatherValue = 'Mưa';
                } else if (statusText.includes('nắng') || statusText.includes('quang') || statusText.includes('trong')) {
                    weatherValue = 'Nắng';
                } else if (statusText.includes('sét') || statusText.includes('giông')) {
                    weatherValue = 'Giông bão';
                } else if (statusText.includes('mây') || statusText.includes('u ám') || statusText.includes('sương')) {
                    weatherValue = 'Nhiều mây';
                }

                return { value: weatherValue, province: province, raw: statusText };
            } catch (e) {
                console.warn(`Weather proxy ${proxyUrl} failed, trying next...`);
            }
        }
        return null;
    };

    window.erpApp.pmAutoFetchWeather = async (projectId) => {
        const res = await window.erpApp.pmFetchWeatherForProject(projectId);
        if (!res) {
            window.erpApp.showToast('Không thể lấy dữ liệu thời tiết. Vui lòng nhập địa chỉ text hoặc chọn thủ công.', 'warning');
            return;
        }

        const select = document.getElementById('pmLogWeatherSelect');
        if (select) {
            select.value = res.value;
            window.erpApp.showToast(`Đã cập nhật thời tiết tại ${res.province}: ${res.value}`, 'success');
        }
    };

    window.erpApp.pmPrintDailyLogImages = (id) => {
        const logs = window.pmDailyLogs || [];
        const projects = window.pmProjects || [];
        const log = logs.find(l => l.id === id);
        if (!log || !log.vouchers) {
            window.erpApp.showToast('Không tìm thấy dữ liệu hình ảnh cho ngày này!', 'error');
            return;
        }

        const images = log.vouchers.filter(v => (v.type && v.type.includes('image')) || (v.url && (v.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || v.url.includes('drive.google.com/uc'))));
        if (images.length === 0) {
            window.erpApp.showToast('Ngày này không có hình ảnh thi công nào!', 'warning');
            return;
        }

        const project = projects.find(p => p.id === log.projectId) || { name: 'Dự án chưa xác định' };
        const entInfo = window.enterpriseInfo || {};
        const dateObj = window.erpApp.toJsDate(log.date) || new Date();
        const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>BÁO CÁO HÌNH ẢNH - ${dateStr}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: "Times New Roman", Times, serif; color: #000; line-height: 1.4; font-size: 12pt; margin: 0; padding: 0; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .company-name { font-weight: bold; text-transform: uppercase; font-size: 12pt; }
                    .project-info { text-align: right; font-size: 11pt; }
                    .doc-title { text-align: center; margin-bottom: 30px; }
                    .doc-title h1 { font-size: 18pt; text-transform: uppercase; margin: 0; font-weight: bold; }
                    .doc-title p { font-style: italic; margin: 5px 0 0 0; }
                    .image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .image-item { border: 1px solid #ddd; padding: 5px; text-align: center; page-break-inside: avoid; }
                    .image-item img { max-width: 100%; height: 180px; object-fit: cover; display: block; margin: 0 auto 5px auto; }
                    .image-caption { font-size: 10pt; font-style: italic; color: #444; }
                    .footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; text-align: center; }
                    .sig-title { font-weight: bold; margin-bottom: 80px; text-transform: uppercase; }
                    .no-print { position: fixed; bottom: 30px; right: 30px; }
                    .btn { padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; font-size: 14px; background: #2563eb; color: white; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">${entInfo.fullName || 'VIETBACHCORP'}</div>
                    <div class="project-info">
                        <div>Dự án: <b>${project.name}</b></div>
                        <div>Ngày báo cáo: <b>${dateStr}</b></div>
                    </div>
                </div>
                <div class="doc-title">
                    <h1>BÁO CÁO HÌNH ẢNH THI CÔNG</h1>
                    <p>Công trình: ${project.name}</p>
                </div>
                <div class="image-grid">
                    ${images.map((img, idx) => `
                        <div class="image-item">
                            <img src="${img.url || img.data}" alt="Hình ${idx + 1}">
                            <div class="image-caption">Hình ${idx + 1}: Ảnh thi công ngày ${dateStr}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="footer">
                    <div>
                        <div class="sig-title">Người lập báo cáo</div>
                        <div>(Ký và ghi rõ họ tên)</div>
                    </div>
                    <div>
                        <div class="sig-title">Chỉ huy trưởng</div>
                        <div>(Ký và ghi rõ họ tên)</div>
                    </div>
                </div>
                <div class="no-print">
                    <button class="btn" onclick="window.print()">In báo cáo</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };
    // ==========================================
    // PROJECT PHOTO GALLERY (HÌNH ẢNH THI CÔNG)
    // ==========================================
    window.erpApp.pmOpenProjectPhotoModal = (photoId = null, source = 'project_gallery') => {
        syncGlobalData();
        const activeProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;

        let photo = null;
        if (photoId) {
            if (source === 'daily_log') {
                const logs = window.pmDailyLogs || [];
                const parts = photoId.split('-');
                const logId = parts.slice(1, -1).join('-');
                const photoIdx = parseInt(parts[parts.length - 1]);
                const log = logs.find(l => l.id === logId);
                if (log && log.vouchers && log.vouchers[photoIdx]) {
                    const v = log.vouchers[photoIdx];
                    photo = {
                        id: photoId,
                        source: 'daily_log',
                        logId: logId,
                        photoIdx: photoIdx,
                        date: log.date,
                        url: v.url || v.data,
                        info: v.info || log.workSummary || '',
                        note: v.note || ''
                    };
                }
            } else {
                photo = pmProjectPhotos.find(p => p.id === photoId);
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        overlay.innerHTML = `
            <div class="modal-content" style="width:550px; max-width:95%; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                    <h2 style="margin:0; font-size:16px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#4f46e5;">photo_camera</span> 
                        ${photoId ? 'Thông tin hình ảnh' : 'Thêm hình ảnh thi công'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>

                <form onsubmit="window.erpApp.pmSaveProjectPhoto(event, ${photoId ? `'${photoId}'` : 'null'}, '${source}')" style="padding:24px; display:flex; flex-direction:column; gap:20px;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ngày chụp / Ghi nhận</label>
                            <input type="text" name="date" class="erp-datepicker" required value="${photo ? window.erpApp.formatDate(photo.date) : window.erpApp.formatDate(new Date())}" 
                                ${source === 'daily_log' ? 'readonly' : ''}
                                placeholder="DD/MM/YYYY"
                                style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; font-weight:700; ${source === 'daily_log' ? 'background:#f8fafc; color:#94a3b8;' : ''}">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Nguồn dữ liệu</label>
                            <div style="padding:10px 12px; background:#f1f5f9; border-radius:10px; font-size:12px; font-weight:700; color:#475569;">
                                ${source === 'daily_log' ? 'Trích xuất từ Nhật ký thi công' : 'Album ảnh dự án'}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Hình ảnh</label>
                        <div id="pmPhotoPreviewArea" style="width:100%; aspect-ratio:16/9; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:16px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
                            ${photo ? `<img src="${window.erpApp.fixDriveUrl(photo.url)}" style="width:100%; height:100%; object-fit:contain;">` : `
                                <div style="text-align:center; color:#94a3b8;">
                                    <span class="material-icons-outlined" style="font-size:48px; display:block; margin-bottom:8px;">add_a_photo</span>
                                    <span style="font-size:12px; font-weight:600;">Chọn ảnh hoặc dán link phía dưới</span>
                                </div>
                            `}
                        </div>
                        <input type="hidden" name="url" value="${photo ? photo.url : ''}">
                    </div>

                    ${!photo || source !== 'daily_log' ? `
                        <div style="display:flex; gap:10px;">
                            <label style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; color:#475569; font-size:12px; font-weight:700; cursor:pointer;">
                                <span class="material-icons-outlined" style="font-size:18px;">upload</span> Tải ảnh lên
                                <input type="file" accept="image/*" onchange="window.erpApp.pmHandlePhotoUpload(this)" style="display:none;">
                            </label>
                            <button type="button" onclick="window.erpApp.pmPromptPhotoLink()" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; color:#475569; font-size:12px; font-weight:700; cursor:pointer;">
                                <span class="material-icons-outlined" style="font-size:18px;">link</span> Dán link ảnh
                            </button>
                        </div>
                    ` : ''}

                    <div class="form-group">
                        <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Thông tin hình ảnh (Caption)</label>
                        <input type="text" name="info" required value="${photo ? photo.info : ''}" placeholder="Mô tả nội dung công việc trong ảnh..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none;">
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ghi chú chi tiết</label>
                        <textarea name="note" rows="3" placeholder="Các lưu ý hoặc ghi chú thêm về hình ảnh này..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; outline:none; resize:none;">${photo ? photo.note : ''}</textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:10px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Đóng</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#4f46e5; color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(79, 70, 229, 0.2);">Lưu thông tin</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        if (source !== 'daily_log') {
            window.erpApp.initDatePickers(overlay);
        }
    };

    window.erpApp.pmHandlePhotoUpload = (input) => {
        if (!input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const previewArea = document.getElementById('pmPhotoPreviewArea');
            if (previewArea) {
                previewArea.innerHTML = `<img src="${data}" style="width:100%; height:100%; object-fit:contain;">`;
                const urlInput = input.closest('form').querySelector('[name="url"]');
                if (urlInput) urlInput.value = data;
            }
        };
        reader.readAsDataURL(input.files[0]);
    };

    window.erpApp.pmPromptPhotoLink = () => {
        const link = prompt('Dán link hình ảnh (Google Drive, Dropbox...) vào đây:');
        if (link) {
            const fixedLink = window.erpApp.fixDriveUrl(link);
            const previewArea = document.getElementById('pmPhotoPreviewArea');
            if (previewArea) {
                previewArea.innerHTML = `<img src="${fixedLink}" style="width:100%; height:100%; object-fit:contain;">`;
                const urlInput = document.querySelector('input[name="url"]');
                if (urlInput) urlInput.value = fixedLink;
            }
        }
    };

    window.erpApp.pmSaveProjectPhoto = async (e, editId = null, source = 'project_gallery') => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const activeProjectId = window.pmActiveProjectId || window.erpApp.pmActiveProjectId;

        const photoData = {
            date: window.erpApp.parseInputDate(formData.get('date')),
            url: formData.get('url'),
            info: formData.get('info'),
            note: formData.get('note')
        };

        if (!photoData.url) {
            window.erpApp.showToast('Vui lòng chọn ảnh hoặc dán link!', 'warning');
            return;
        }

        if (source === 'daily_log' && editId) {
            // Update daily log voucher
            const parts = editId.split('-');
            const logId = parts.slice(1, -1).join('-');
            const photoIdx = parseInt(parts[parts.length - 1]);

            const logs = window.pmDailyLogs || [];
            const logIdx = logs.findIndex(l => l.id === logId);
            if (logIdx !== -1 && logs[logIdx].vouchers && logs[logIdx].vouchers[photoIdx]) {
                logs[logIdx].vouchers[photoIdx].info = photoData.info;
                logs[logIdx].vouchers[photoIdx].note = photoData.note;

                if (window.CrudSync) {
                    await window.CrudSync.saveItem('pmDailyLogs', logs[logIdx], 'id');
                }
                localStorage.setItem('erp_pmDailyLogs', JSON.stringify(logs));
            }
        } else {
            // Update project gallery
            pmProjectPhotos = window.pmProjectPhotos || [];
            if (editId) {
                const idx = pmProjectPhotos.findIndex(p => p.id === editId);
                if (idx !== -1) {
                    pmProjectPhotos[idx] = { ...pmProjectPhotos[idx], ...photoData, updatedAt: new Date().toISOString() };
                }
            } else {
                const newPhoto = {
                    id: `PHO-${Date.now().toString().slice(-6)}`,
                    projectId: activeProjectId,
                    ...photoData,
                    createdAt: new Date().toISOString()
                };
                pmProjectPhotos.unshift(newPhoto);
            }

            if (window.CrudSync) {
                await window.CrudSync.saveItem('pmProjectPhotos', editId ? pmProjectPhotos.find(p => p.id === editId) : pmProjectPhotos[0], 'id');
            }
            localStorage.setItem('erp_pmProjectPhotos', JSON.stringify(pmProjectPhotos));
            window.pmProjectPhotos = pmProjectPhotos;
        }

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã lưu thông tin hình ảnh!', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmDeleteProjectPhoto = async (id) => {
        const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa ảnh dự án!', 'error');
            return;
        }

        const photo = (window.pmProjectPhotos || []).find(p => p.id === id);
        if (!photo) return;

        window.erpApp.showDeleteConfirmation(
            "Hình ảnh dự án",
            photo.title || "Ảnh album",
            async () => {
                pmProjectPhotos = window.pmProjectPhotos || [];
                const idx = pmProjectPhotos.findIndex(p => p.id === id);
                if (idx !== -1) {
                    const deleted = pmProjectPhotos.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmProjectPhotos', id, 'id');
                    }
                    localStorage.setItem('erp_pmProjectPhotos', JSON.stringify(pmProjectPhotos));
                    window.pmProjectPhotos = pmProjectPhotos;
                    window.erpApp.showToast('Đã xóa hình ảnh dự án thành công', 'success');
                    window.erpApp.renderQuanLyDuAn();

                    window.erpApp.notifyCRUD('Ảnh dự án', 'delete', {
                        name: deleted.title || 'Ảnh album',
                        page: 'quan-ly-du-an',
                        module: 'Album ảnh',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });
                }
            }
        );
    };
    window.erpApp.pmDeleteDailyLogPhoto = async (logId, photoIdx) => {
        window.erpApp.showDeleteConfirmation(
            "Bạn có chắc chắn muốn xóa hình ảnh này khỏi nhật ký thi công? Thao tác này sẽ cập nhật lại bản ghi nhật ký.",
            async () => {
                const logs = window.pmDailyLogs || [];
                const logIdx = logs.findIndex(l => l.id === logId);
                if (logIdx !== -1 && logs[logIdx].vouchers) {
                    const deleted = logs[logIdx].vouchers.splice(photoIdx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.saveItem('pmDailyLogs', logs[logIdx], 'id');
                    }
                    localStorage.setItem('erp_pmDailyLogs', JSON.stringify(logs));
                    window.erpApp.showToast('Đã xóa ảnh khỏi nhật ký thành công', 'success');
                    window.erpApp.renderQuanLyDuAn();
                }
            }
        );
    };

    window.erpApp.pmViewFullImage = (data) => {
        const overlay = document.createElement('div');
        overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10001; display:flex; align-items:center; justify-content:center; cursor:pointer;';
        overlay.onclick = () => overlay.remove();
        overlay.innerHTML = `
            <div style="position:relative; max-width:90%; max-height:90%; animation:modalPop 0.3s ease-out;">
                <img src="${data}" style="max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 0 40px rgba(0,0,0,0.5);">
                <button style="position:absolute; top:-40px; right:-40px; background:none; border:none; color:#fff; cursor:pointer;"><span class="material-icons" style="font-size:32px;">close</span></button>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    // ==========================================
    // Custom Project Contract File Upload & Google Drive handlers
    // ==========================================
    window.erpApp.renderContractFileList = function (files, editable) {
        if (!files || files.length === 0) { return '<p style="text-align:center; color:#94a3b8; font-size:12px; font-style:italic; padding:10px 0; margin:0;">Chưa có file đính kèm nào</p>'; }
        return files.map((f, i) => {
            const fType = f.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(f.name) : 'pdf');
            const icon = window.erpApp.getHsFileIcon ? window.erpApp.getHsFileIcon(fType) : 'description';
            const iconColor = window.erpApp.getHsFileColor ? window.erpApp.getHsFileColor(fType) : '#64748b';
            const typeLabel = window.erpApp.getHsFileTypeLabel ? window.erpApp.getHsFileTypeLabel(f.type || fType) : 'Tài liệu';
            const isUrlLink = !!f.url || (f.type === 'link');
            const previewable = !!(f.dataUrl || f.url || f.data);

            const previewFn = `window.erpApp.pmPreviewContractFile(${i})`;
            const previewBtn = `<button type="button" class="hs-file-action-btn" title="${isUrlLink ? 'Mở link' : 'Xem'}" onclick="event.stopPropagation(); ${previewFn}" style="color:#0D9488; background:none; border:none; cursor:pointer; padding:4px;"><span class="material-icons-outlined" style="font-size: 16px;">visibility</span></button>`;

            let fileNameHtml = `<span class="contract-file-name" style="color:#2563eb;font-weight:700;font-size:12px;">${f.name || 'Chứng từ'}</span>`;
            if (isUrlLink) {
                fileNameHtml = `<a href="${f.url || f.data}" target="_blank" rel="noreferrer noopener" style="color:#2563eb;font-weight:700;text-decoration:none;font-size:12px;" onclick="event.stopPropagation()">${f.name || 'Link tài liệu'}</a>`;
            }

            const fileSizeHtml = `${typeLabel}${f.size ? ' · ' + f.size : ''}`;
            let actions = '';

            if (editable) {
                actions = `<div style="display:flex;gap:4px;align-items:center">
                    ${previewable ? previewBtn : ''}
                    <button type="button" class="contract-file-remove" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); window.erpApp.pmRemoveContractFile(${i})"><span class="material-icons-outlined" style="font-size:16px;">close</span></button>
                </div>`;
            } else {
                actions = previewable ? previewBtn : '';
            }

            let drivePathHtml = '';
            if (f.drivePath) {
                drivePathHtml = `<span style="display:block;margin-top:2px;font-size:11px;color:#0D9488"><span class="material-icons-outlined" style="font-size:12px;vertical-align:middle;margin-right:2px">folder</span>Drive: ${f.drivePath}</span>`;
            }
            const linkHref = f.url || f.data;
            if (linkHref && linkHref.includes('drive.google.com')) {
                drivePathHtml += `<a href="${linkHref}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:3px;margin-top:2px;font-size:11px;color:#2563EB;text-decoration:none" onclick="event.stopPropagation()"><span class="material-icons-outlined" style="font-size:12px">open_in_new</span>Xem trên Drive</a>`;
            }

            return `<div class="contract-file-item" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;" onclick="${previewFn}">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="material-icons-outlined" style="color:${iconColor};font-size:20px">${icon}</span>
                    <div class="contract-file-info" style="text-align:left;">
                        ${fileNameHtml}
                        <span class="contract-file-size" style="display:block;margin-top:2px;font-size:11px;color:#64748B">${fileSizeHtml}</span>
                        ${drivePathHtml}
                    </div>
                </div>
                <div style="display:flex;gap:4px;align-items:center">${actions}</div>
            </div>`;
        }).join('');
    };

    window.erpApp.pmHandleContractFileUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) { return; }

        const listEl = document.getElementById('pmContractFileList');

        Array.from(files).forEach(async (file) => {
            const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
            const fType = window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf';

            const placeholderIdx = tempContractFiles.length;
            tempContractFiles.push({ name: '⏳ Đang tải: ' + file.name, size: sizeStr, type: fType, uploading: true });
            if (listEl) { listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true); }

            try {
                const formData = new FormData();
                formData.append('files', file);

                let finalFolderId = '';
                let finalModule = 'hop-dong';
                let pathLabel = '';

                const hsSelect = document.getElementById('hsDriveFolderSelect');
                if (hsSelect) {
                    finalModule = hsSelect.value;
                    pathLabel = hsSelect.options[hsSelect.selectedIndex].text.replace(/^[^\s]+\s/, '');
                    
                    const chainContainer = document.getElementById('hsDriveFolderChain');
                    if (chainContainer) {
                        const selects = Array.from(chainContainer.querySelectorAll('select'));
                        for (let i = 0; i < selects.length; i++) {
                            if (selects[i].value) {
                                finalFolderId = selects[i].value;
                                pathLabel += ' ➔ ' + selects[i].options[selects[i].selectedIndex].text;
                            } else {
                                break;
                            }
                        }
                    }
                } else {
                    const folderSelect = document.getElementById('pmContractDriveFolderSelect');
                    if (folderSelect) {
                        const deepestId = window.erpApp.getDeepestContractDriveFolderId();
                        finalFolderId = deepestId || folderSelect.value;
                        const rootLabel = folderSelect.options[folderSelect.selectedIndex]?.text.replace(/^[^\s]+\s/, '') || '';
                        const chainPath = window.erpApp.getContractDriveFolderChainPath();
                        pathLabel = rootLabel + (chainPath ? ' ➔ ' + chainPath : '');
                    }
                }

                if (finalFolderId) {
                    formData.append('folderId', finalFolderId);
                } else {
                    formData.append('module', finalModule);
                }

                const res = await fetch((window.API_BASE_URL || '') + '/api/drive/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success && data.uploaded && data.uploaded.length > 0) {
                    const driveFile = data.uploaded[0];
                    tempContractFiles[placeholderIdx] = {
                        name: file.name,
                        size: sizeStr,
                        type: fType,
                        url: driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
                        driveFileId: driveFile.id,
                        drivePath: pathLabel
                    };
                    window.erpApp.showToast(`✅ Đã tải "${file.name}" lên Google Drive`, 'success');
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        tempContractFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                        if (listEl) { listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true); }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Drive không khả dụng, lưu file cục bộ: ${file.name}`, 'warning');
                }
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempContractFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                    if (listEl) { listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true); }
                };
                reader.readAsDataURL(file);
                console.warn('[Contract Upload] Drive fallback:', err.message);
            }

            if (listEl) { listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true); }
        });
        event.target.value = '';
    };

    window.erpApp.loadContractDriveSubfolders = async () => {
        const folderSelect = document.getElementById('pmContractDriveFolderSelect');
        const subSelect = document.getElementById('pmContractDriveSubfolderSelect');
        if (!folderSelect || !subSelect) return;
        const module = folderSelect.value;
        subSelect.style.display = 'block';
        subSelect.innerHTML = '<option value="">⏳ Đang tải...</option>';
        try {
            const res = await fetch((window.API_BASE_URL || '') + `/api/drive/files?module=${module}`);
            const data = await res.json();
            if (data.success) {
                const folders = (data.files || []).filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                subSelect.innerHTML = '<option value="">— Lưu vào thư mục gốc —</option>' +
                    folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
            } else {
                subSelect.innerHTML = '<option value="">Không tải được</option>';
            }
        } catch (e) {
            subSelect.innerHTML = '<option value="">Lỗi kết nối</option>';
        }
    };

    window.erpApp.pmCustomPrompt = (title, placeholder, defaultValue = '') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 20000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s ease;
            `;

            overlay.innerHTML = `
                <div style="
                    background: #ffffff;
                    width: 100%;
                    max-width: 440px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
                    padding: 24px;
                    transform: scale(0.9);
                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                ">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <div style="
                            width: 44px;
                            height: 44px;
                            background: #f0fdf4;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #16a34a;
                        ">
                            <span class="material-icons-outlined" style="font-size: 24px;">create_new_folder</span>
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${title}</h3>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Tạo thư mục lưu trữ trực tiếp trên Drive</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <input type="text" id="pmCustomPromptInput" value="${defaultValue}" placeholder="${placeholder}" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1.5px solid #e2e8f0;
                            border-radius: 12px;
                            font-size: 14px;
                            font-weight: 600;
                            color: #0f172a;
                            outline: none;
                            transition: all 0.2s;
                            box-sizing: border-box;
                        " onfocus="this.style.borderColor='#22c55e'; this.style.boxShadow='0 0 0 4px rgba(34, 197, 94, 0.15)';" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" id="pmCustomPromptCancel" style="
                            padding: 10px 18px;
                            border: 1px solid #e2e8f0;
                            background: #ffffff;
                            color: #64748b;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 13px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#f8fafc'; this.style.color='#0f172a';" onmouseout="this.style.background='#ffffff'; this.style.color='#64748b';">Hủy bỏ</button>
                        <button type="button" id="pmCustomPromptSubmit" style="
                            padding: 10px 20px;
                            border: none;
                            background: #22c55e;
                            color: #ffffff;
                            border-radius: 12px;
                            font-weight: 700;
                            font-size: 13px;
                            cursor: pointer;
                            box-shadow: 0 4px 10px rgba(34, 197, 94, 0.25);
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#16a34a'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='#22c55e'; this.style.transform='none';">Tạo Thư Mục</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            setTimeout(() => {
                overlay.style.opacity = '1';
                overlay.firstElementChild.style.transform = 'scale(1)';
            }, 10);

            const input = overlay.querySelector('#pmCustomPromptInput');
            input.focus();
            input.select();

            const closePrompt = (val) => {
                overlay.style.opacity = '0';
                overlay.firstElementChild.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    overlay.remove();
                    resolve(val);
                }, 200);
            };

            overlay.querySelector('#pmCustomPromptCancel').addEventListener('click', () => closePrompt(null));
            overlay.querySelector('#pmCustomPromptSubmit').addEventListener('click', () => {
                const v = input.value.trim();
                closePrompt(v ? v : null);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const v = input.value.trim();
                    closePrompt(v ? v : null);
                } else if (e.key === 'Escape') {
                    closePrompt(null);
                }
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closePrompt(null);
                }
            });
        });
    };

    window.erpApp.createContractDriveSubfolderFromModal = async () => {
        const folderSelect = document.getElementById('pmContractDriveFolderSelect');
        const subSelect = document.getElementById('pmContractDriveSubfolderSelect');
        if (!folderSelect) return;
        const module = folderSelect.value;

        const name = await window.erpApp.pmCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
        if (!name || !name.trim()) return;

        try {
            window.erpApp.showToast('⏳ Đang tạo folder trên Google Drive...', 'info');
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), module: module })
            });
            const data = await res.json();

            if (data.success) {
                window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                await window.erpApp.loadContractDriveSubfolders();
                if (subSelect && data.folder && data.folder.id) {
                    subSelect.value = data.folder.id;
                }
            } else {
                window.erpApp.showToast(`❌ Lỗi: ${data.error || 'Không tạo được folder'}`, 'error');
            }
        } catch (err) {
            window.erpApp.showToast(`❌ Lỗi kết nối: ${err.message}`, 'error');
        }
    };

    window.erpApp.pmRemoveContractFile = (index) => {
        tempContractFiles.splice(index, 1);
        const listEl = document.getElementById('pmContractFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true);
        }
    };

    window.erpApp.pmAddContractFileByLink = () => {
        const urlEl = document.getElementById('pmContractLinkUrl');
        const nameEl = document.getElementById('pmContractLinkName');
        if (!urlEl) return;
        const url = urlEl.value.trim();
        if (!url) { window.erpApp.showToast('Vui lòng nhập đường link!', 'error'); urlEl.focus(); return; }
        try { new URL(url); } catch (e) { window.erpApp.showToast('Đường link không hợp lệ!', 'error'); urlEl.focus(); return; }
        const name = (nameEl && nameEl.value.trim()) || url.split('/').filter(Boolean).pop() || 'Link file';
        tempContractFiles.push({ name: name, url: url, data: url, type: 'link', size: '' });
        const listEl = document.getElementById('pmContractFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderContractFileList(tempContractFiles, true);
        }
        urlEl.value = '';
        if (nameEl) nameEl.value = '';
        window.erpApp.showToast('Đã thêm link: ' + name, 'success');
    };

    window.erpApp.pmPreviewContractFile = async (index) => {
        const file = tempContractFiles[index];
        if (!file) { window.erpApp.showToast('Không tìm thấy file!', 'error'); return; }
        const href = file.dataUrl || file.url || file.data;
        if (!href) { window.erpApp.showToast('File này chưa có dữ liệu để xem trước.', 'error'); return; }
        const fType = file.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf');

        if ((file.dataUrl || file.data) && fType === 'pdf') {
            const win = window.open('', '_blank');
            win.document.write(`<iframe src="${href}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
        } else if ((file.dataUrl || file.data) && fType === 'img') {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${href}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`);
        } else {
            window.open(href, '_blank');
        }
    };

    // ─── Dynamic N-level folder chain for Project Modules ─────────────────
    window.erpApp.getDeepestContractDriveFolderId = () => {
        const chain = document.getElementById('pmContractDriveFolderChain');
        if (!chain) return null;
        const selects = chain.querySelectorAll('select[data-chain-level]');
        let deepest = null;
        selects.forEach(sel => { if (sel.value) deepest = sel.value; });
        return deepest;
    };

    window.erpApp.getContractDriveFolderChainPath = () => {
        const chain = document.getElementById('pmContractDriveFolderChain');
        if (!chain) return '';
        const selects = chain.querySelectorAll('select[data-chain-level]');
        const parts = [];
        selects.forEach(sel => {
            if (sel.value) parts.push(sel.options[sel.selectedIndex].text);
        });
        return parts.join(' ➔ ');
    };

    const _trimContractFolderChain = (fromLevel) => {
        const chain = document.getElementById('pmContractDriveFolderChain');
        if (!chain) return;
        chain.querySelectorAll(`select[data-chain-level]`).forEach(sel => {
            if (parseInt(sel.dataset.chainLevel, 10) >= fromLevel) sel.remove();
        });
    };

    const _appendContractFolderDropdown = (level, folders) => {
        const chain = document.getElementById('pmContractDriveFolderChain');
        if (!chain) return;
        const sel = document.createElement('select');
        sel.id = `pmContractDriveChainSel_${level}`;
        sel.dataset.chainLevel = level;
        sel.style.cssText = 'flex:1;min-width:160px;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;cursor:pointer;font-weight:600;outline:none;';
        sel.innerHTML = `<option value="">— Chọn thư mục —</option>` +
            folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        sel.addEventListener('change', () => {
            window.erpApp.loadContractDriveFolderChain(sel.value, level + 1);
            window.erpApp.updateContractDriveFolderInputs();
        });
        chain.appendChild(sel);
    };

    window.erpApp.loadContractDriveFolderChain = async (parentFolderId, level) => {
        _trimContractFolderChain(level);
        const folderSelect = document.getElementById('pmContractDriveFolderSelect');
        const rootFolderId = folderSelect ? folderSelect.value : '';
        const activeFolderId = parentFolderId || rootFolderId;

        if (!activeFolderId) {
            window.erpApp.updateContractDriveFolderInputs();
            return;
        }

        try {
            const url = (window.API_BASE_URL || '') + `/api/drive/files?folderId=${activeFolderId}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                const folders = (data.files || []).filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                if (folders.length > 0) {
                    _appendContractFolderDropdown(level, folders);
                }
            }
        } catch (e) { /* silent fail */ }

        window.erpApp.updateContractDriveFolderInputs();
    };

    window.erpApp.createContractDriveSubfolderFromChainModal = async () => {
        const deepestParentId = window.erpApp.getDeepestContractDriveFolderId() || document.getElementById('pmContractDriveFolderSelect')?.value || '';
        if (!deepestParentId) {
            window.erpApp.showToast('Vui lòng chọn thư mục gốc trước khi tạo thư mục con!', 'error');
            return;
        }

        const name = await window.erpApp.pmCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
        if (!name || !name.trim()) return;

        try {
            window.erpApp.showToast('⏳ Đang tạo folder...', 'info');
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), parentId: deepestParentId })
            });
            const data = await res.json();
            if (data.success) {
                window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                const chain = document.getElementById('pmContractDriveFolderChain');
                const selects = chain ? chain.querySelectorAll('select[data-chain-level]') : [];
                const currentLevel = selects.length;
                await window.erpApp.loadContractDriveFolderChain(deepestParentId, currentLevel);
                // Auto select
                if (data.folder && data.folder.id) {
                    const newSel = document.getElementById(`pmContractDriveChainSel_${currentLevel}`);
                    if (newSel) {
                        newSel.value = data.folder.id;
                        newSel.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                window.erpApp.showToast(`❌ Lỗi: ${data.error || 'Không tạo được folder'}`, 'error');
            }
        } catch (err) {
            window.erpApp.showToast(`❌ Lỗi kết nối: ${err.message}`, 'error');
        }
    };

    window.erpApp.updateContractDriveFolderInputs = () => {
        const pathTextEl = document.getElementById('pmContractDriveFolderPathText');
        if (!pathTextEl) return;

        const deepestId = window.erpApp.getDeepestContractDriveFolderId();
        const folderSelect = document.getElementById('pmContractDriveFolderSelect');
        if (deepestId) {
            const rootLabel = folderSelect ? folderSelect.options[folderSelect.selectedIndex].text.replace(/^[^\s]+\s/, '') : '';
            const chainPath = window.erpApp.getContractDriveFolderChainPath();
            const path = rootLabel + (chainPath ? ' ➔ ' + chainPath : '');
            pathTextEl.innerText = `Thư mục lưu trữ: ${path}`;
            pathTextEl.style.display = 'block';
        } else if (folderSelect && folderSelect.value) {
            const path = folderSelect.options[folderSelect.selectedIndex].text.replace(/^[^\s]+\s/, '');
            pathTextEl.innerText = `Thư mục lưu trữ: ${path}`;
            pathTextEl.style.display = 'block';
        } else {
            const initialPath = pathTextEl.dataset.initialPath || '';
            if (initialPath) {
                pathTextEl.innerText = `Thư mục hiện tại: ${initialPath}`;
                pathTextEl.style.display = 'block';
            } else {
                pathTextEl.style.display = 'none';
            }
        }
    };

    window.erpApp.loadContractDriveRootFolders = async (selectedId = null, defaultKeyword = '') => {
        const rootSelect = document.getElementById('pmContractDriveFolderSelect');
        if (!rootSelect) return;
        rootSelect.innerHTML = '<option value="">⏳ Đang tải...</option>';
        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders');
            const data = await res.json();
            if (data.success && data.folders) {
                rootSelect.innerHTML = data.folders.map(f => `<option value="${f.id}" ${selectedId === f.id ? 'selected' : ''}>${f.name}</option>`).join('');
                
                if (!selectedId) {
                    let targetFolder = null;
                    const kw = String(defaultKeyword || '').toLowerCase();
                    let searchNames = [];
                    if (kw.includes('du-an')) {
                        searchNames = ['Dự án', 'Du an', 'Công trình'];
                    } else if (kw.includes('hop-dong')) {
                        searchNames = ['Hợp đồng', 'Hop dong', 'Ký kết'];
                    } else if (kw.includes('tai-chinh') || kw.includes('thanh-toan') || kw.includes('chi-phi')) {
                        searchNames = ['Tài chính', 'Tai chinh', 'Thanh toán', 'Thanh toan', 'Chi phí', 'Thu chi'];
                    } else if (kw.includes('dau-thau')) {
                        searchNames = ['Đấu thầu', 'Dau thau', 'Hồ sơ thầu'];
                    }
                    
                    for (const name of searchNames) {
                        targetFolder = data.folders.find(f => f.name.toLowerCase().includes(name.toLowerCase()));
                        if (targetFolder) break;
                    }
                    if (targetFolder) {
                        rootSelect.value = targetFolder.id;
                    } else if (data.folders.length > 0) {
                        rootSelect.value = data.folders[0].id;
                    }
                }
                
                window.erpApp.loadContractDriveFolderChain(null, 0);
            } else {
                rootSelect.innerHTML = '<option value="">Không tải được</option>';
                window.erpApp.updateContractDriveFolderInputs();
            }
        } catch (e) {
            rootSelect.innerHTML = '<option value="">Lỗi kết nối</option>';
            window.erpApp.updateContractDriveFolderInputs();
        }
    };

    // Legacy compatibility aliases
    window.erpApp.loadContractDriveSubfolders = () => window.erpApp.loadContractDriveFolderChain(null, 0);
    window.erpApp.createContractDriveSubfolderFromModal = () => window.erpApp.createContractDriveSubfolderFromChainModal();
})();


