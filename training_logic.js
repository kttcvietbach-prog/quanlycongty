(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // Khởi tạo trạng thái module
    window.erpApp.trActiveTab = 'all';
    window.erpApp.trSearchQuery = '';

    // Khởi tạo dữ liệu từ LocalStorage hoặc Cloud
    const savedTraining = localStorage.getItem('erp_training_data');
    let trainingData = window.erpApp.trainingData || window.erpApp._getData('trainingData');
    if ((!trainingData || trainingData.length === 0) && savedTraining) {
        try { trainingData = JSON.parse(savedTraining); } catch (e) { }
    }
    if (!trainingData || trainingData.length === 0) {
        trainingData = [
            { id: 'TR-001', name: 'An toàn lao động cơ bản', teacher: 'Nguyễn Văn An', startDate: '2024-03-15', students: 25, type: 'Bắt buộc', status: 'Hoàn thành' },
            { id: 'TR-002', name: 'Kỹ thuật hàn áp lực cao', teacher: 'Trần Quang Vinh', startDate: '2024-04-10', students: 12, type: 'Nâng cao', status: 'Đang học' }
        ];
    }

    const savedInstances = localStorage.getItem('erp_course_instances');
    let courseInstances = window.erpApp.courseInstancesData || window.erpApp._getData('erp_course_instances');
    if ((!courseInstances || courseInstances.length === 0) && savedInstances) {
        try { courseInstances = JSON.parse(savedInstances); } catch (e) { }
    }
    if (!courseInstances) courseInstances = [];

    // Đồng bộ lại vào namespace
    window.erpApp.trainingData = trainingData;
    window.erpApp.courseInstancesData = courseInstances;

    window.erpApp.trSetTab = function (tab) {
        window.erpApp.trActiveTab = tab;
        window.erpApp.renderDaoTao();
    };

    window.erpApp.handleTrainingSearch = function (val) {
        window.erpApp.trSearchQuery = val;
        window.erpApp.renderDaoTao();
    };

    window.erpApp.getTrainingStatusLabel = function (status) {
        const map = { 'all': 'Tất cả khóa đào tạo', 'Hoàn thành': 'Hoàn thành', 'Đang học': 'Đang giảng dạy', 'Sắp tới': 'Kế hoạch sắp tới' };
        return map[status] || status;
    };

    window.erpApp.getTrainingStatusColor = function (status) {
        const map = {
            'Hoàn thành': { bg: '#f0fdf4', text: '#16a34a' },
            'Đang học': { bg: '#eff6ff', text: '#3b82f6' },
            'Sắp tới': { bg: '#fffbeb', text: '#d97706' },
            'all': { bg: '#f1f5f9', text: '#64748b' }
        };
        return map[status] || { bg: '#f1f5f9', text: '#64748b' };
    };

    window.erpApp.renderDaoTao = function () {
        const pageContent = document.getElementById('pageContent');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        const pageBadge = document.getElementById('pageBadge');

        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Quản lý đào tạo';
        if (pageBadge) pageBadge.textContent = 'Nhân sự';

        const currentUser = window.erpApp.currentUser || JSON.parse(sessionStorage.getItem('erp_user') || '{}');
        const isAdmin = (currentUser && currentUser.role === 'Admin');
        const q = (window.erpApp.trSearchQuery || '').toLowerCase().trim();

        // 1. Lọc dữ liệu Khóa đào tạo (Tổng quát)
        const filteredTraining = (window.erpApp.trainingData || []).filter(t => {
            const matchesSearch = !q || (
                t.id.toLowerCase().includes(q) ||
                t.name.toLowerCase().includes(q) ||
                t.teacher.toLowerCase().includes(q) ||
                (t.type && t.type.toLowerCase().includes(q))
            );
            const matchesTab = window.erpApp.trActiveTab === 'all' || t.status === window.erpApp.trActiveTab;
            return matchesSearch && matchesTab;
        });

        const rows = filteredTraining.map(t => {
            const statusClass = t.status === 'Hoàn thành' ? 'green' : t.status === 'Đang học' ? 'blue' : t.status === 'Sắp tới' ? 'orange' : 'gray';

            let actionsHtml = `
                <button class="table-action-btn view" onclick="window.erpApp.openTrainingDetails('${t.id}')" title="Xem chi tiết"><span class="material-icons-outlined">visibility</span></button>
                <button class="table-action-btn schedule" style="color:#0ea5e9" onclick="window.erpApp.openTrainingSchedule('${t.id}')" title="Lịch học"><span class="material-icons-outlined">calendar_month</span></button>
            `;

            if (isAdmin) {
                actionsHtml += `
                    <button class="table-action-btn edit" onclick="window.erpApp.openTrainingModal('${t.id}')" title="Sửa"><span class="material-icons-outlined">edit</span></button>
                    <button class="table-action-btn delete" onclick="window.erpApp.deleteTraining('${t.id}')" title="Xóa"><span class="material-icons-outlined">delete</span></button>
                `;
            }

            return `
                <tr>
                    <td><strong>${t.id}</strong></td>
                    <td><div style="font-weight:700;color:var(--primary-color)">${t.name}</div></td>
                    <td>${t.teacher}</td>
                    <td>${t.startDate}</td>
                    <td><span class="gm-badge blue">${t.students}</span></td>
                    <td><span class="gm-badge gray">${t.type}</span></td>
                    <td><span class="gm-badge ${statusClass}">${t.status}</span></td>
                    <td><div class="table-actions">${actionsHtml}</div></td>
                </tr>`;
        }).join('');

        // 2. Lọc dữ liệu Khóa học (Chi tiết học viên)
        const filteredCourseInstances = (window.erpApp.courseInstancesData || []).filter(c => {
            const matchesSearch = !q || (
                c.id.toLowerCase().includes(q) ||
                c.student.toLowerCase().includes(q) ||
                c.course.toLowerCase().includes(q) ||
                c.location.toLowerCase().includes(q)
            );
            const matchesTab = window.erpApp.trActiveTab === 'all' || c.status === window.erpApp.trActiveTab;
            return matchesSearch && matchesTab;
        });

        const courseRows = filteredCourseInstances.map(c => {
            const statusClass = c.status === 'Hoàn thành' ? 'green' : c.status === 'Đang học' ? 'blue' : c.status === 'Sắp tới' ? 'orange' : 'gray';

            let actionsHtml = `<button class="table-action-btn view" onclick="window.erpApp.openCourseInstanceModal('${c.id}', true)" title="Xem"><span class="material-icons-outlined">visibility</span></button>`;
            if (isAdmin) {
                actionsHtml += `
                    <button class="table-action-btn edit" onclick="window.erpApp.openCourseInstanceModal('${c.id}')" title="Sửa"><span class="material-icons-outlined">edit</span></button>
                    <button class="table-action-btn delete" onclick="window.erpApp.deleteCourseInstance('${c.id}')" title="Xóa"><span class="material-icons-outlined">delete</span></button>
                `;
            }

            return `
                <tr>
                    <td><strong>${c.id}</strong></td>
                    <td style="font-weight:600">${c.student}</td>
                    <td style="color:var(--primary-color)">${c.course}</td>
                    <td><div style="display:flex;align-items:center;gap:4px"><span class="material-icons-outlined" style="font-size:16px;color:#64748b">place</span>${c.location}</div></td>
                    <td>${c.startDate}</td>
                    <td>${c.endDate}</td>
                    <td><span class="gm-badge gray">${c.type}</span></td>
                    <td><span class="gm-badge ${statusClass}">${c.status}</span></td>
                    <td><div class="table-actions">${actionsHtml}</div></td>
                </tr>`;
        }).join('');

        const html = `
            <div class="gm-module">
                <div class="employee-toolbar">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                    <div class="search-box">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" placeholder="Tìm mã lớp, tên khóa, giảng viên, học viên..." value="${window.erpApp.trSearchQuery}" oninput="window.erpApp.handleTrainingSearch(this.value)">
                    </div>
                    ${isAdmin ? `
                    <button class="btn-add-employee" onclick="window.erpApp.openTrainingModal()">
                        <span class="material-icons-outlined">school</span> Thêm khóa đào tạo
                    </button>` : ''}
                </div>
                
                <div class="crm-chevron-tabs" style="padding: 12px 20px; background: #fff; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
                    ${['all', 'Đang học', 'Sắp tới', 'Hoàn thành'].map(tab => {
                        const isActive = window.erpApp.trActiveTab === tab;
                        const label = window.erpApp.getTrainingStatusLabel(tab);
                        const colors = window.erpApp.getTrainingStatusColor(tab);
                        const count = tab === 'all' ? (window.erpApp.trainingData || []).length : (window.erpApp.trainingData || []).filter(t => t.status === tab).length;

                        const bgColor = isActive ? (tab === 'all' ? '#64748b' : colors.text) : colors.bg;
                        const textColor = isActive ? '#fff' : colors.text;

                        return `
                            <button class="crm-chevron-tab" onclick="window.erpApp.trSetTab('${tab}')" 
                                    style="background:${bgColor}; color:${textColor};">
                                ${tab === 'all' ? '<span class="material-icons-outlined" style="font-size:16px;">library_books</span>' : ''}
                                ${label}
                                <span class="crm-chevron-badge" style="color:${isActive ? bgColor : '#1e293b'}">${count}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="gm-section">
                    <div class="gm-panel">
                        <div class="gm-panel-title">
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                                <div style="display:flex; align-items:center; gap:8px">
                                    <span class="material-icons-outlined">assignment</span> Danh sách khóa đào tạo (Tổng quát)
                                </div>
                                <div style="font-size:12px; font-weight:700; color:#64748b">${filteredTraining.length} kết quả</div>
                            </div>
                        </div>
                        <table class="gm-mini-table">
                            <thead>
                                <tr>
                                    <th>Mã lớp</th><th>Tên khóa học</th><th>Giảng viên</th><th>Ngày bắt đầu</th><th>Học viên</th><th>Loại</th><th>Trạng thái</th><th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows || '<tr><td colspan="8" style="text-align:center;padding:20px">Chưa có dữ liệu</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="gm-section" style="margin-top:24px">
                    <div class="gm-panel" style="border-top: 3px solid #0ea5e9">
                        <div class="gm-panel-title" style="color:#0ea5e9; display:flex; justify-content:space-between; align-items:center; width:100%">
                            <div style="display:flex; align-items:center; gap:8px">
                                <span class="material-icons-outlined">school</span> Danh sách Khóa học (Chi tiết học viên & Địa điểm)
                            </div>
                            ${isAdmin ? `
                            <button class="btn-save" style="padding:6px 12px; font-size:12px; height:auto" onclick="window.erpApp.openCourseInstanceModal()">
                                <span class="material-icons-outlined" style="font-size:16px">add</span> Thêm khóa học mới
                            </button>` : ''}
                        </div>
                        <table class="gm-mini-table">
                            <thead>
                                <tr>
                                    <th>Mã lớp</th><th>Học viên</th><th>Tên khóa học</th><th>Học tại</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Loại</th><th>Trạng thái</th><th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courseRows || '<tr><td colspan="9" style="text-align:center;padding:20px">Chưa có dữ liệu khóa học chi tiết</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        if (pageContent) {
            pageContent.innerHTML = html;
            pageContent.scrollTop = 0;
        }
    };

    window.erpApp.openCourseInstanceModal = function (id = null, isView = false) {
        const item = id ? (window.erpApp.courseInstancesData || []).find(c => c.id === id) : null;
        const title = isView ? 'Thông tin chi tiết khóa học' : (id ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'courseInstanceModal';
        overlay.style.cssText = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        const courses = (window.erpApp.trainingData || []).map(t => `<option value="${t.name}" ${item && item.course === t.name ? 'selected' : ''}>${t.name}</option>`).join('');

        overlay.innerHTML = `
            <div class="modal-card" style="max-width:500px; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); overflow:hidden">
                <div class="modal-header" style="padding:16px 20px; background:#0ea5e9; color:#fff; display:flex; justify-content:space-between; align-items:center">
                    <h3 style="margin:0;font-size:16px;font-weight:700">${title}</h3>
                    <button style="background:none; border:none; color:#fff; cursor:pointer" onclick="document.getElementById('courseInstanceModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <form id="courseInstanceForm" style="padding:20px; display:grid; gap:16px">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                        <div class="form-group">
                            <label>Mã lớp</label>
                            <input type="text" name="id" value="${item ? item.id : 'L' + (window.erpApp.courseInstancesData.length + 1).toString().padStart(3, '0')}" required readonly style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; background:#f8fafc;">
                        </div>
                        <div class="form-group">
                            <label>Học viên</label>
                            <input type="text" name="student" value="${item ? item.student : ''}" placeholder="Nhập tên học viên" required ${isView ? 'readonly style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Tên khóa học</label>
                        <select name="course" required ${isView ? 'disabled style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                            <option value="">-- Chọn khóa học --</option>
                            ${courses}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Học tại (Địa điểm)</label>
                        <input type="text" name="location" value="${item ? item.location : ''}" placeholder="Ví dụ: Công trường Mỹ Thuận" required ${isView ? 'readonly style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                        <div class="form-group">
                            <label>Ngày bắt đầu</label>
                            <input type="date" name="startDate" value="${item ? item.startDate : ''}" required ${isView ? 'readonly style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                        <div class="form-group">
                            <label>Ngày kết thúc</label>
                            <input type="date" name="endDate" value="${item ? item.endDate : ''}" required ${isView ? 'readonly style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                        <div class="form-group">
                            <label>Loại</label>
                            <select name="type" ${isView ? 'disabled style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                                <option value="Bắt buộc" ${item && item.type === 'Bắt buộc' ? 'selected' : ''}>Bắt buộc</option>
                                <option value="Nâng cao" ${item && item.type === 'Nâng cao' ? 'selected' : ''}>Nâng cao</option>
                                <option value="Nội bộ" ${item && item.type === 'Nội bộ' ? 'selected' : ''}>Nội bộ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select name="status" ${isView ? 'disabled style="background:#f8fafc;"' : ''} style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                                <option value="Sắp tới" ${item && item.status === 'Sắp tới' ? 'selected' : ''}>Sắp tới</option>
                                <option value="Đang học" ${item && item.status === 'Đang học' ? 'selected' : ''}>Đang học</option>
                                <option value="Hoàn thành" ${item && item.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                            </select>
                        </div>
                    </div>
                </form>
                <div style="padding:16px 20px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px">
                    <button class="btn-cancel" onclick="document.getElementById('courseInstanceModal').remove()" style="padding:8px 16px; border:1px solid #ddd; border-radius:4px; cursor:pointer;">Đóng</button>
                    ${!isView ? '<button class="btn-save" style="background:#0ea5e9; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;" onclick="window.erpApp.saveCourseInstance()">Lưu lại</button>' : ''}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.saveCourseInstance = function () {
        const form = document.getElementById('courseInstanceForm');
        if (!form) return;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!window.erpApp.courseInstancesData) window.erpApp.courseInstancesData = [];
        const index = window.erpApp.courseInstancesData.findIndex(c => c.id === data.id);
        if (index > -1) {
            window.erpApp.courseInstancesData[index] = data;
        } else {
            window.erpApp.courseInstancesData.push(data);
        }

        localStorage.setItem('erp_course_instances', JSON.stringify(window.erpApp.courseInstancesData));
        if (window.CrudSync) {
            window.CrudSync.saveItem('erp_course_instances', data, 'id');
        }

        if (window.erpApp.notifyCRUD) {
            window.erpApp.notifyCRUD('Khóa học chi tiết', index > -1 ? 'update' : 'add', { name: `${data.student} - ${data.course}` });
        }
        
        const modal = document.getElementById('courseInstanceModal');
        if (modal) modal.remove();
        
        if (window.erpApp.showToast) {
            window.erpApp.showToast('Đã lưu thông tin khóa học', 'success');
        }
        window.erpApp.renderDaoTao();
    };

    // Robust local modal to prevent global app.js conflicts
    window.erpApp.showTrainingDeleteConfirm = function (title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:999999; display:flex; align-items:center; justify-content:center;';
        overlay.innerHTML = `
            <div class="modal-content" style="width:400px; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <style>@keyframes modalPop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }</style>
                <div style="padding:32px 24px; text-align:center;">
                    <div style="width:64px; height:64px; background:#fef2f2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                        <span class="material-icons-outlined" style="font-size:32px; color:#ef4444;">warning</span>
                    </div>
                    <h3 style="margin:0 0 10px; font-size:18px; font-weight:800; color:#1e293b;">${title}</h3>
                    <div style="font-size:14px; color:#64748b; line-height:1.6;">${message}</div>
                </div>
                <div style="padding:16px 24px; background:#f8fafc; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <button class="btn-cancel-delete" style="padding:12px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:12px; font-weight:700; cursor:pointer; font-size:14px; transition:0.2s;">Hủy bỏ</button>
                    <button class="btn-confirm-delete" style="padding:12px; border:none; background:#ef4444; color:#fff; border-radius:12px; font-weight:700; cursor:pointer; font-size:14px; box-shadow:0 4px 12px rgba(239,68,68,0.25); transition:0.2s;">Xác nhận</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.btn-cancel-delete').onclick = () => overlay.remove();
        overlay.querySelector('.btn-confirm-delete').onclick = () => {
            overlay.remove();
            if (typeof onConfirm === 'function') onConfirm();
        };
    };

    window.erpApp.deleteCourseInstance = function (id) {
        const item = (window.erpApp.courseInstancesData || []).find(c => String(c.id).trim() === String(id).trim());
        const itemName = item ? `${item.student} - ${item.course}` : id;

        const doDelete = function () {
            try {
                window.erpApp.courseInstancesData = (window.erpApp.courseInstancesData || []).filter(c => String(c.id).trim() !== String(id).trim());
                localStorage.setItem('erp_course_instances', JSON.stringify(window.erpApp.courseInstancesData));
                
                try {
                    if (window.CrudSync) {
                        window.CrudSync.deleteItem('erp_course_instances', id);
                    }
                } catch (e) { console.error('Lỗi khi xóa qua CrudSync:', e); }
                
                if (window.erpApp.notifyCRUD) {
                    window.erpApp.notifyCRUD('Khóa học chi tiết', 'delete', { name: itemName });
                }
                if (window.erpApp.showToast) {
                    window.erpApp.showToast(`Đã xóa thành công ${itemName}`, 'success');
                }
                window.erpApp.renderDaoTao();
            } catch (error) {
                console.error("Delete Error: ", error);
                if (window.erpApp.showToast) window.erpApp.showToast('Có lỗi xảy ra khi xóa!', 'error');
            }
        };

        const msg = `Bạn có chắc chắn muốn xóa <strong>${itemName}</strong>?<br><span style="color: #94a3b8; font-size: 12px;">Tác vụ này không thể hoàn tác.</span>`;
        window.erpApp.showTrainingDeleteConfirm('Xóa Lớp học / Học viên', msg, doDelete);
    };

    window.erpApp.openTrainingSchedule = function (id) {
        const item = (window.erpApp.trainingData || []).find(t => t.id === id);
        if (!item) { return; }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'trainingScheduleModal';
        overlay.style.cssText = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        const schedule = item.schedule || [];
        const scheduleRows = schedule.map(s => `
            <tr>
                <td style="padding:12px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#64748b">${s.session}</td>
                <td style="padding:12px; border-bottom:1px solid #f1f5f9"><div style="font-weight:600; color:#1e293b">${s.content}</div></td>
                <td style="padding:12px; border-bottom:1px solid #f1f5f9"><div style="display:flex; align-items:center; gap:6px; color:#0284c7; font-weight:500"><span class="material-icons-outlined" style="font-size:16px">schedule</span> ${s.time}</div></td>
                <td style="padding:12px; border-bottom:1px solid #f1f5f9"><div style="display:flex; align-items:center; gap:6px; color:#475569"><span class="material-icons-outlined" style="font-size:16px; color:#94a3b8">place</span> ${s.location}</div></td>
            </tr>
        `).join('');

        overlay.innerHTML = `
            <div class="modal-card" style="max-width:700px; width:90%; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); overflow:hidden">
                <div class="modal-header" style="padding:20px; background:#0ea5e9; color:#fff; display:flex; justify-content:space-between; align-items:center">
                    <div>
                        <div style="font-size:11px; opacity:0.8; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px">Lịch đào tạo chi tiết</div>
                        <h3 style="margin:0;font-size:18px;font-weight:800">${item.name}</h3>
                    </div>
                    <button style="background:rgba(255,255,255,0.2); border:none; color:#fff; width:30px; height:30px; border-radius:50%; cursor:pointer" onclick="document.getElementById('trainingScheduleModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div style="padding:0; max-height:400px; overflow-y:auto">
                    <table style="width:100%; border-collapse:collapse; font-size:14px">
                        <thead>
                            <tr style="background:#f8fafc; text-align:left">
                                <th style="padding:12px; color:#64748b; font-size:11px; text-transform:uppercase">Buổi học</th>
                                <th style="padding:12px; color:#64748b; font-size:11px; text-transform:uppercase">Nội dung học tập</th>
                                <th style="padding:12px; color:#64748b; font-size:11px; text-transform:uppercase">Thời gian</th>
                                <th style="padding:12px; color:#64748b; font-size:11px; text-transform:uppercase">Địa điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${scheduleRows || '<tr><td colspan="4" style="padding:40px; text-align:center; color:#94a3b8">Chưa có lịch học cụ thể cho khóa này</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div style="padding:16px 20px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center">
                    <div style="font-size:12px; color:#64748b">Lưu ý: Nhân viên có mặt trước 10 phút.</div>
                    <button class="btn-cancel" style="padding:8px 20px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer;" onclick="document.getElementById('trainingScheduleModal').remove()">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.openTrainingDetails = function (id) {
        const item = (window.erpApp.trainingData || []).find(t => t.id === id);
        if (!item) { return; }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'trainingViewModal';
        overlay.style.cssText = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        const statusClass = item.status === 'Hoàn thành' ? 'green' : item.status === 'Đang học' ? 'blue' : item.status === 'Sắp tới' ? 'orange' : 'gray';

        overlay.innerHTML = `
            <div class="modal-card" style="max-width:500px; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); overflow:hidden">
                <div class="modal-header" style="padding:20px; background:linear-gradient(135deg, #1e293b, #334155); color:#fff; display:flex; justify-content:space-between; align-items:center">
                    <div>
                        <div style="font-size:12px; opacity:0.8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Chi tiết khóa đào tạo</div>
                        <h3 style="margin:0;font-size:18px;font-weight:800">${item.name}</h3>
                    </div>
                    <button style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center" onclick="document.getElementById('trainingViewModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div style="padding:24px; display:grid; gap:20px">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
                        <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Mã lớp</label><div style="font-weight:600; color:#1e293b">${item.id}</div></div>
                        <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Trạng thái</label><span class="gm-badge ${statusClass}">${item.status}</span></div>
                    </div>
                    <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Giảng viên phụ trách</label><div style="display:flex; align-items:center; gap:10px"><div style="width:36px; height:36px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:700">${item.teacher.charAt(0)}</div><div style="font-weight:600; color:#1e293b">${item.teacher}</div></div></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
                        <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Ngày bắt đầu</label><div style="display:flex; align-items:center; gap:6px; color:#1e293b; font-weight:600"><span class="material-icons-outlined" style="font-size:18px; color:#64748b">calendar_today</span>${item.startDate}</div></div>
                        <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Số lượng học viên</label><div style="display:flex; align-items:center; gap:6px; color:#1e293b; font-weight:600"><span class="material-icons-outlined" style="font-size:18px; color:#64748b">groups</span>${item.students} nhân viên</div></div>
                    </div>
                    <div><label style="display:block; font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:6px">Loại hình đào tạo</label><div style="padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #f1f5f9; color:#475569; font-weight:500">${item.type}</div></div>
                </div>
                <div style="padding:16px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end"><button class="btn-cancel" style="padding:10px 24px; border-radius:8px; font-weight:600; border:1px solid #ddd; background:#fff; cursor:pointer;" onclick="document.getElementById('trainingViewModal').remove()">Đóng</button></div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.erpApp.openTrainingModal = function (id = null) {
        const item = id ? (window.erpApp.trainingData || []).find(t => t.id === id) : null;
        const title = id ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'trainingModal';
        overlay.style.cssText = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        overlay.innerHTML = `
            <div class="modal-card" style="max-width:550px; width:90%; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)">
                <div class="modal-header" style="padding:16px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center">
                    <h3 style="margin:0;font-size:18px;font-weight:800">${title}</h3>
                    <button class="modal-close-btn" style="background:none; border:none; cursor:pointer" onclick="document.getElementById('trainingModal').remove()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div style="grid-column: span 2"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Tên khóa học *</label><input type="text" id="trName" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px" value="${item ? item.name : ''}" placeholder="Nhập tên khóa học..."></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Mã lớp</label><input type="text" id="trId" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px" value="${item ? item.id : 'TR' + Date.now().toString().slice(-4)}" ${id ? 'disabled' : ''}></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Giảng viên</label><input type="text" id="trTeacher" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px" value="${item ? item.teacher : ''}"></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Ngày bắt đầu</label><input type="date" id="trDate" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px" value="${item ? item.startDate : ''}"></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Số học viên</label><input type="number" id="trStudents" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px" value="${item ? item.students : '0'}"></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Loại hình</label><select id="trType" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px"><option value="Bắt buộc" ${item?.type === 'Bắt buộc' ? 'selected' : ''}>Bắt buộc</option><option value="Nâng cao" ${item?.type === 'Nâng cao' ? 'selected' : ''}>Nâng cao</option><option value="Nội bộ" ${item?.type === 'Nội bộ' ? 'selected' : ''}>Nội bộ</option></select></div>
                    <div><label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">Trạng thái</label><select id="trStatus" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px"><option value="Sắp tới" ${item?.status === 'Sắp tới' ? 'selected' : ''}>Sắp tới</option><option value="Đang học" ${item?.status === 'Đang học' ? 'selected' : ''}>Đang học</option><option value="Hoàn thành" ${item?.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option></select></div>
                </div>
                <div style="padding:16px;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #eee">
                    <button class="btn-cancel" style="padding:8px 16px; border-radius:6px; cursor:pointer; border:1px solid #ddd; background:#fff;" onclick="document.getElementById('trainingModal').remove()">Hủy</button>
                    <button id="btnSaveTraining" style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer">${id ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btnSaveTraining').onclick = function () {
            const name = document.getElementById('trName').value;
            if (!name) { 
                if (window.erpApp.showToast) window.erpApp.showToast('Vui lòng nhập tên khóa học!', 'error'); 
                return; 
            }

            const newData = {
                id: document.getElementById('trId').value,
                name: name,
                teacher: document.getElementById('trTeacher').value,
                startDate: document.getElementById('trDate').value,
                students: document.getElementById('trStudents').value,
                type: document.getElementById('trType').value,
                status: document.getElementById('trStatus').value
            };

            if (!window.erpApp.trainingData) window.erpApp.trainingData = [];

            if (id) {
                const idx = window.erpApp.trainingData.findIndex(t => t.id === id);
                if (idx > -1) window.erpApp.trainingData[idx] = newData;
                if (window.erpApp.notifyCRUD) window.erpApp.notifyCRUD('Khóa đào tạo', 'update', { name: name });
            } else {
                window.erpApp.trainingData.unshift(newData);
                if (window.erpApp.notifyCRUD) window.erpApp.notifyCRUD('Khóa đào tạo', 'add', { name: name });
            }

            localStorage.setItem('erp_training_data', JSON.stringify(window.erpApp.trainingData));
            if (window.CrudSync) {
                window.CrudSync.saveItem('erp_training_data', newData, 'id');
            }
            overlay.remove();
            if (window.erpApp.showToast) window.erpApp.showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
            window.erpApp.renderDaoTao();
        };
    };

    window.erpApp.deleteTraining = function (id) {
        const item = (window.erpApp.trainingData || []).find(t => String(t.id).trim() === String(id).trim());
        if (!item) { return; }

        const doDelete = function () {
            try {
                window.erpApp.trainingData = (window.erpApp.trainingData || []).filter(t => String(t.id).trim() !== String(id).trim());
                localStorage.setItem('erp_training_data', JSON.stringify(window.erpApp.trainingData));
                
                try {
                    if (window.CrudSync) {
                        window.CrudSync.deleteItem('erp_training_data', id);
                    }
                } catch (e) { console.error('Lỗi khi xóa qua CrudSync:', e); }
                
                if (window.erpApp.notifyCRUD) window.erpApp.notifyCRUD('Khóa đào tạo', 'delete', { name: item.name });
                if (window.erpApp.showToast) window.erpApp.showToast(`Đã xóa khóa đào tạo ${item.name}`, 'success');
                
                window.erpApp.renderDaoTao();
            } catch (error) {
                console.error("Delete Error: ", error);
                if (window.erpApp.showToast) window.erpApp.showToast('Có lỗi xảy ra khi xóa!', 'error');
            }
        };

        const msg = `Bạn có chắc chắn muốn xóa <strong>${item.name}</strong>?<br><span style="color: #94a3b8; font-size: 12px;">Tác vụ này không thể hoàn tác.</span>`;
        window.erpApp.showTrainingDeleteConfirm('Xóa Khóa đào tạo', msg, doDelete);
    };

})();
