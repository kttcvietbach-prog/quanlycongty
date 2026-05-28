/**
 * VIETBACHCORP ERP - Project Management Modals Logic
 * Dedicated file for PM module UI modals and operation handlers.
 * Optimized for high-precision financial data handling.
 */

window.erpApp = window.erpApp || {};

(function() {
    'use strict';

    // Helper for formatting/parsing
    const fMoney = (val) => window.erpApp.formatValue(val);
    const parseVND = (val) => window.erpApp.parseVND(val);

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
                            <input type="date" name="date" required value="${editLog ? editLog.date : new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
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
                                <input type="date" name="date" required value="${editLog ? editLog.date : new Date().toISOString().split('T')[0]}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
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
    };

    // ==========================================
    // VOLUME & SETTLEMENT MODALS
    // ==========================================
    window.erpApp.pmOpenAddVolumeModal = (workItem, volumeType = 'contract') => {
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
                if (wi) {wi.value = workItem;}
            }
        }
    };

    window.erpApp.pmOpenEditVolumeModal = (id) => {
        const mat = pmVolumes.find(m => String(m.id) === String(id));
        if (!mat) {return;}
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
        const mat = pmMaterials.find(m => m.id === id);
        if (!mat) {return;}
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

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:550px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#6366f1;">payments</span> ${editId ? 'Sửa chứng từ Thu/Chi' : 'Lập chứng từ Thu/Chi mới'}
                    </h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.pmSaveFinanceRecord(event, ${editId ? `'${editId}'` : 'null'})">
                    <div style="padding:24px;">
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
                                <input type="date" name="date" required value="${editRec ? editRec.date : new Date().toISOString().split('T')[0]}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
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
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 24px; border-radius:12px; border:none; background:#6366f1; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(99, 102, 241, 0.2);">Lưu chứng từ</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
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

    window.erpApp.pmDeleteVolume = (id) => {
        const vol = pmVolumes.find(v => String(v.id) === String(id));
        if (!vol) return;

        window.erpApp.showConfirm(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa khối lượng <strong>${vol.name}</strong> (${id})?`,
            async function() {
                const idx = pmVolumes.findIndex(v => String(v.id) === String(id));
                if (idx !== -1) {
                    const deleted = pmVolumes.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmVolumes', id, 'id');
                    }
                    localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));
                    window.erpApp.showToast(`Đã xóa khối lượng ${id}`, 'info');

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

    window.erpApp.pmClearAllVolumes = () => {
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa toàn bộ khối lượng!', 'error');
            return;
        }

        window.erpApp.showConfirm(
            'CẢNH BÁO NGUY HIỂM',
            'Bạn có chắc chắn muốn xóa TOÀN BỘ khối lượng của dự án này? Thao tác này không thể hoàn tác.',
            async function() {
                const volumesToDelete = pmVolumes.filter(v => v.projectId === (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));
                pmVolumes = pmVolumes.filter(v => v.projectId !== (window.pmActiveProjectId || window.erpApp.pmActiveProjectId));

                if (window.CrudSync) {
                    for (const v of volumesToDelete) {
                        await window.CrudSync.deleteItem('pmVolumes', v.id, 'id');
                    }
                }

                localStorage.setItem('erp_pmVolumes', JSON.stringify(pmVolumes));
                window.erpApp.showToast('Đã xóa toàn bộ khối lượng dự án', 'success');

                if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                    window.erpApp.renderQuanLyDuAn();
                }
            }
        );
    };

    window.erpApp.pmUpdateVolumeInline = (el) => {
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

    window.erpApp.pmDeleteMaterial = (id) => {
        const mat = pmMaterials.find(m => m.id === id);
        if (!mat) return;

        window.erpApp.showDeleteConfirmation(
            'Vật tư',
            mat.name,
            async function() {
                const idx = pmMaterials.findIndex(m => m.id === id);
                if (idx !== -1) {
                    const deleted = pmMaterials.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmMaterials', id, 'id');
                    }
                    localStorage.setItem('erp_pmMaterials', JSON.stringify(pmMaterials));
                    window.erpApp.showToast('Đã xóa vật tư', 'info');

                    window.erpApp.notifyCRUD('Vật tư', 'delete', {
                        name: deleted.name,
                        page: 'quan-ly-du-an',
                        module: 'Vật tư',
                        projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId)
                    });

                    if (window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') {
                        window.erpApp.renderQuanLyDuAn();
                    }
                }
            }
        );
    };

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
            joinDate: formData.get('joinDate') || new Date().toISOString().split('T')[0],
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

    window.erpApp.pmDeleteWorker = (id) => {
        const worker = pmWorkers.find(w => w.id === id);
        if (!worker) return;

        window.erpApp.showDeleteConfirmation(
            'Nhân công',
            worker.name,
            async function() {
                const idx = pmWorkers.findIndex(w => w.id === id);
                if (idx !== -1) {
                    const deleted = pmWorkers.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmWorkers', id, 'id');
                    }
                    localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));
                    window.erpApp.showToast('Đã xóa nhân công', 'info');
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

        const logData = {
            id: `${workerId}_${date}`,
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
                                <input type="date" name="joinDate" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
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

    window.erpApp.pmHandleTempUpload = (input) => {
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

    window.erpApp.pmPreviewVoucher = (fileData) => {
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

        const voucherItems = document.querySelectorAll('#pmTempFilePreview .pm-file-item');
        const vouchers = Array.from(voucherItems).map(item => ({
            name: item.dataset.fileName,
            type: item.dataset.fileType,
            data: item.dataset.fileData
        }));

        const financeData = {
            id: editId || `FIN-${Date.now()}`,
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            type: formData.get('type'),
            date: formData.get('date'),
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

    window.erpApp.pmDeleteFinanceRecord = (id) => {
        const record = pmFinanceRecords.find(r => r.id === id);
        if (!record) return;

        window.erpApp.showConfirm(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa chứng từ <strong>${record.content}</strong>?`,
            async function() {
                const idx = pmFinanceRecords.findIndex(r => r.id === id);
                if (idx !== -1) {
                    const deleted = pmFinanceRecords.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmFinanceRecords', id, 'id');
                    }
                    localStorage.setItem('erp_pmFinanceRecords', JSON.stringify(pmFinanceRecords));
                    window.erpApp.showToast('Đã xóa chứng từ', 'info');
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
    window.erpApp.pmOpenAddContractedExpenseModal = (editId = null) => {
        const contract = editId ? pmContracts.find(c => c.id === editId) : null;
        const fM = (val) => window.erpApp.formatValue(val);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
                <div class="modal-content" style="width:750px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                    <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                        <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:#6366f1;">handshake</span> ${contract ? 'Sửa hợp đồng khoán' : 'Thêm hợp đồng khoán/nội bộ mới'}
                        </h2>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form onsubmit="window.erpApp.pmSaveContractedExpenseRecord(event, ${contract ? `'${contract.id}'` : 'null'})">
                        <div style="padding:24px; max-height:75vh; overflow-y:auto;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã hợp đồng</label>
                                    <input type="text" name="id" value="${contract ? contract.id : ''}" ${contract ? 'readonly' : ''} required placeholder="VD: HĐK-001" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên hợp đồng/Nội dung</label>
                                    <input type="text" name="title" value="${contract ? contract.title : ''}" required placeholder="VD: Khoán nhân công xây tường..." style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đối tác/Tổ đội</label>
                                    <input type="text" name="partner" value="${contract ? contract.partner : ''}" required placeholder="Tên tổ trưởng/Công ty thầu phụ" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giá trị hợp đồng (VNĐ)</label>
                                    <input type="text" name="value" value="${contract ? fM(contract.value) : ''}" required placeholder="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:16px; font-weight:800; color:#2563eb; outline:none;">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Phân loại</label>
                                    <select name="category" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                        <option value="nhan-cong" ${contract && contract.category === 'nhan-cong' ? 'selected' : ''}>Nhân công</option>
                                        <option value="vat-tu" ${contract && contract.category === 'vat-tu' ? 'selected' : ''}>Vật tư</option>
                                        <option value="thau-phu" ${contract && contract.category === 'thau-phu' ? 'selected' : ''}>Thầu phụ trọn gói</option>
                                        <option value="khac" ${contract && contract.category === 'khac' ? 'selected' : ''}>Khác</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Ngày ký kết</label>
                                    <input type="date" name="signDate" value="${contract ? (contract.signDate ? new Date(contract.signDate).toISOString().split('T')[0] : '') : new Date().toISOString().split('T')[0]}" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tỷ lệ giữ lại bảo hành (%)</label>
                                    <input type="number" name="retentionRate" value="${contract ? contract.retentionRate : 5}" step="0.1" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none;">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                                    <select name="status" style="width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; font-weight:700;">
                                        <option value="dang-thuc-hien" ${contract && contract.status === 'dang-thuc-hien' ? 'selected' : ''}>Đang thực hiện</option>
                                        <option value="da-hoan-thanh" ${contract && contract.status === 'da-hoan-thanh' ? 'selected' : ''}>Đã hoàn thành</option>
                                        <option value="da-thanh-ly" ${contract && contract.status === 'da-thanh-ly' ? 'selected' : ''}>Đã thanh lý</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Đính kèm chứng từ/Hợp đồng (Ảnh/PDF)</label>
                                <div id="pmTempFilePreview" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                                    ${contract && contract.vouchers ? contract.vouchers.map(v => `
                                        <div class="pm-file-item" data-file-name="${v.name}" data-file-type="${v.type}" data-file-data="${v.data}" style="display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; padding:6px 12px; border-radius:8px; font-size:12px;">
                                            <span class="material-icons-outlined" style="font-size:16px; color:#64748b;">${v.type === 'image' ? 'image' : 'description'}</span>
                                            <span class="file-info" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${v.name}</span>
                                            <button type="button" onclick="this.closest('.pm-file-item').remove()" style="border:none; background:none; color:#ef4444; cursor:pointer; padding:0; display:flex;"><span class="material-icons-outlined" style="font-size:16px;">cancel</span></button>
                                        </div>
                                    `).join('') : ''}
                                </div>
                                <label class="file-upload-btn" style="display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:#f1f5f9; color:#475569; border-radius:10px; cursor:pointer; font-size:13px; font-weight:700; border:1px dashed #cbd5e1; transition:0.2s;">
                                    <span class="material-icons-outlined">cloud_upload</span> Tải tệp lên
                                    <input type="file" multiple accept="image/*,application/pdf" onchange="window.erpApp.pmHandleTempUpload(this)" style="display:none;">
                                </label>
                            </div>
                        </div>
                        <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:12px 24px; border-radius:14px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                            <button type="submit" style="padding:12px 24px; border-radius:14px; border:none; background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">${contract ? 'Cập nhật hợp đồng' : 'Xác nhận thêm'}</button>
                        </div>
                    </form>
                </div>
            `;
        document.body.appendChild(overlay);
        if (!contract) {
            const lastId = pmContracts.filter(c => c.id.startsWith('HĐK-')).length;
            document.querySelector('[name="id"]').value = `HĐK-${String(lastId + 1).padStart(3, '0')}`;
        }
    };

    window.erpApp.pmSaveContractedExpenseRecord = async (e, editId = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const cleanNum = (str) => window.erpApp.parseVND(str);

        const voucherItems = document.querySelectorAll('#pmTempFilePreview .pm-file-item');
        const vouchers = Array.from(voucherItems).map(item => ({
            name: item.dataset.fileName,
            type: item.dataset.fileType,
            data: item.dataset.fileData
        }));

        const contractData = {
            id: formData.get('id'),
            projectId: (window.pmActiveProjectId || window.erpApp.pmActiveProjectId),
            type: 'inbound', 
            title: formData.get('title'),
            value: cleanNum(formData.get('value')),
            signDate: formData.get('signDate'),
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

    window.erpApp.pmDeleteContractedExpenseRecord = (id) => {
        if (!currentUser || currentUser.role !== 'Admin') {
            window.erpApp.showToast('Chỉ Admin mới có quyền xóa chi phí khoán!', 'error');
            return;
        }

        const contract = pmContracts.find(c => c.id === id);
        if (!contract) return;

        window.erpApp.showConfirm(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa chi phí khoán <strong>${contract.title}</strong> (${id})?`,
            async function() {
                const idx = pmContracts.findIndex(c => c.id === id);
                if (idx !== -1) {
                    const deleted = pmContracts.splice(idx, 1)[0];
                    if (window.CrudSync) {
                        await window.CrudSync.deleteItem('pmContracts', id, 'id');
                    }
                    localStorage.setItem('erp_pmContracts', JSON.stringify(pmContracts));
                    window.erpApp.showToast(`Đã xóa chi phí khoán ${id}`, 'info');
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

    window.erpApp.pmWithdrawEquipment = (code) => {
        window.erpApp.showConfirm(
            'Xác nhận rút thiết bị',
            `Bạn có chắc chắn muốn rút thiết bị <strong>${code}</strong> về kho?`,
            async function() {
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
                    window.erpApp.showToast(`Đã rút thiết bị ${code} về kho`, 'info');
                    window.erpApp.renderQuanLyDuAn();
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
            date: formData.get('date'),
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
            date: formData.get('date'),
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

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast('Đã lưu thông tin bảo trì', 'success');
        window.erpApp.renderQuanLyDuAn();
    };

    window.erpApp.pmDeleteEquipment = async (code) => {
        window.erpApp.showConfirm(
            'Xác nhận rút thiết bị',
            `Bạn có chắc muốn rút thiết bị <strong>${code}</strong> khỏi dự án?<br>Thao tác này sẽ xóa toàn bộ Nhật ký ca máy và Bảo trì liên quan trong dự án này.`,
            function() {
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
                    if (window.erpApp && window.erpApp._setData) {
                        window.erpApp._setData('pmMachineLogs', pmMachineLogs);
                        window.erpApp._setData('pmMaintenanceLogs', pmMaintenanceLogs);
                        if (typeof vmMaintenance !== 'undefined') {window.erpApp._setData('vmMaintenance', vmMaintenance);}
                        window.erpApp._setData('vmVehicles', vmVehicles);
                        window.erpApp._setData('vmUsage', vmUsage);
                        window.erpApp._setData('masterEquipmentRegistry', masterEquipmentRegistry);

                        pmEquipment.splice(idx, 1);
                        window.erpApp._setData('pmEquipment', pmEquipment);
                    } else {
                        localStorage.setItem('erp_pmMachineLogs', JSON.stringify(pmMachineLogs));
                        localStorage.setItem('erp_pmMaintenanceLogs', JSON.stringify(pmMaintenanceLogs));
                        localStorage.setItem('erp_pmEquipment', JSON.stringify(pmEquipment));
                    }

                    window.erpApp.showToast(`Đã rút thiết bị ${code} và xóa dữ liệu vận hành liên quan.`, 'success');

                    // Trigger Notification
                    window.erpApp.notifyCRUD('Thiết thiết bị', 'delete', {
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
            if (idx !== -1) {pmLaborLogs[idx] = laborData;}
        } else {
            pmLaborLogs.unshift(laborData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmLaborLogs', laborData, 'team')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ chấm công: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmLaborLogs', JSON.stringify(pmLaborLogs));

        form.closest('.modal-overlay').remove();
        window.erpApp.showToast(editTeam ? 'Cập nhật chấm công thành công!' : 'Thêm chấm công tổ đội thành công!', 'success');
        if ((window.erpApp.currentPage === 'quan-ly-du-an' || window.erpApp.currentPage === 'van-hanh') && window.erpApp.pmActiveTab === 'labor') {window.erpApp.renderQuanLyDuAn();}

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
            if (idx !== -1) {pmWorkers[idx] = workerData;}
        } else {
            pmWorkers.push(workerData);
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('pmWorkers', workerData, 'id')
                .catch(err => window.erpApp.showToast('Lỗi đồng bộ nhân sự: ' + err.message, 'error'));
        }
        localStorage.setItem('erp_pmWorkers', JSON.stringify(pmWorkers));

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
        if (!w) {return;}

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