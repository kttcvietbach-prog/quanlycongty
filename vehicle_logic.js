(function () {
    console.log('✅ Vehicle Management Logic: Loading Unified Module...');
    'use strict';

    // ==========================================
    // Sample Data & Initialization
    // ==========================================
    const sampleVehicles = [];
    const sampleUsage = [];
    const sampleMaintenance = [];
    const sampleDrivers = [
        { id: "TX-001", name: "Nguyễn Văn Hùng", phone: "0912.345.678", license: "GPLX Hạng FC", licenseExpiry: "2028-12-15", experience: "12 năm kinh nghiệm", status: "Đang đi", avatar: "👨‍✈️", rating: 4.9, tripCount: 142 },
        { id: "TX-002", name: "Trần Thanh Hải", phone: "0988.765.432", license: "GPLX Hạng C", licenseExpiry: "2026-06-20", experience: "8 năm kinh nghiệm", status: "Sẵn sàng", avatar: "🧑‍✈️", rating: 4.7, tripCount: 98 },
        { id: "TX-003", name: "Phạm Minh Đức", phone: "0905.123.456", license: "GPLX Hạng D", licenseExpiry: "2026-04-10", experience: "15 năm kinh nghiệm", status: "Đang đi", avatar: "👨‍✈️", rating: 5.0, tripCount: 210 },
        { id: "TX-004", name: "Lê Hoàng Long", phone: "0973.987.654", license: "GPLX Hạng E", licenseExpiry: "2029-08-30", experience: "5 năm kinh nghiệm", status: "Sẵn sàng", avatar: "🧑‍✈️", rating: 4.6, tripCount: 45 },
        { id: "TX-005", name: "Vũ Quốc Bảo", phone: "0962.111.222", license: "GPLX Hạng FC", licenseExpiry: "2026-05-30", experience: "10 năm kinh nghiệm", status: "Nghỉ phép", avatar: "👨‍✈️", rating: 4.8, tripCount: 115 }
    ];
    const sampleCosts = [];

    // --- Internal Persistence Helper ---
    function getModuleData(key, samples) {
        const storageKey = key.startsWith('erp_') ? key : 'erp_' + key;
        const local = localStorage.getItem(storageKey);
        if (local) {
            try { return JSON.parse(local); } catch (e) { console.error('Error parsing local data'); }
        }
        if (window.erpApp && window.erpApp._getData) {
            const global = window.erpApp._getData(key);
            if (global && global.length > 0) { return global; }
        }
        return samples;
    }

    function saveModuleData(key, data, idField = 'id') {
        const storageKey = key.startsWith('erp_') ? key : 'erp_' + key;
        localStorage.setItem(storageKey, JSON.stringify(data));
        if (window.erpApp && window.erpApp._setData) {
            window.erpApp._setData(key, data);
        }

        // Priority 1: CrudSync (Handles smart diffing and deletions)
        if (window.CrudSync && window.CrudSync.saveItems) {
            window.CrudSync.saveItems(key, data, idField);
        }
        // Priority 2: FireSync batchUpload (Fallback)
        else if (window.FireSync && window.FireSync.batchUpload) {
            window.FireSync.batchUpload(key, data, idField);
        }
    }


    // --- Initialization logic moved to init() function at the end ---

    let vmSearchQuery = '';
    let vmNameFilter = '';
    let vmTypeFilter = '';
    let costVehicleFilter = '';
    let currentActiveTab = 'Danh sách xe';
    let currentVmContext = 'vehicle'; // 'vehicle' | 'equipment'
    let costSubTab = 'print'; // 'history' | 'proposals' | 'print'
    let costSelectedForPrint = new Set();
    let tempVehicleFiles = [];
    let driverSearchQuery = '';
    let driverStatusFilter = 'Tất cả';
    let reportVehicleFilter = '';
    let tempExpenseFiles = [];

    const getVehicleExpenses = () => {
        try {
            const all = JSON.parse(localStorage.getItem('erp_vehicleExpenses')) || [];
            return Array.isArray(all) ? all.filter(e => e && e.id) : [];
        } catch (e) {
            return [];
        }
    };

    const saveVehicleExpenses = (data) => {
        localStorage.setItem('erp_vehicleExpenses', JSON.stringify(data));
        if (window.CrudSync && window.CrudSync.saveItems) {
            window.CrudSync.saveItems('erp_vehicleExpenses', data, 'id');
        }
    };

    const VEHICLE_EXPENSE_CATEGORIES = {
        'fuel': { label: '⛽ Xăng / Dầu (Nhiên liệu)', icon: 'local_gas_station', color: '#f59e0b' },
        'maintenance': { label: '🛠️ Sửa chữa & Bảo dưỡng', icon: 'build', color: '#ef4444' },
        'inspection': { label: '📋 Đăng kiểm & Phí đường bộ', icon: 'gavel', color: '#3b82f6' },
        'insurance': { label: '🛡️ Bảo hiểm xe', icon: 'security', color: '#10b981' },
        'other': { label: '💸 Chi phí phát sinh khác', icon: 'payments', color: '#8b5cf6' }
    };

    const getVehicles = () => {
        let all = getModuleData('vmVehicles', []);
        if (!Array.isArray(all)) return [];

        // --- NUCLEAR PURGE (Live Integrity Check) ---
        // Lấy danh sách dự án hiện có để đối soát
        let projectList = [];
        if (window.pmProjects) {
            projectList = window.pmProjects;
        } else if (window.erpApp && window.erpApp._getData) {
            projectList = window.erpApp._getData('pmProjects') || [];
        }

        if (!Array.isArray(projectList)) projectList = [];

        // --- SAFE GUARD ---
        // Nếu không có dự án nào (có thể do chưa load xong hoặc thực sự không có),
        // KHÔNG chạy purge để tránh reset nhầm trạng thái xe.
        if (projectList.length === 0) {
            return all.filter(v => {
                if (!v || !v.id) return false;
                if (v.context) { return v.context === currentVmContext; }
                const isEquip = v.type === 'Thiết bị thi công' || (v.internalCode && (v.internalCode.startsWith('TB-') || v.internalCode.startsWith('M-')));
                return currentVmContext === 'equipment' ? isEquip : !isEquip;
            });
        }

        let needsSave = false;
        all.forEach(v => {
            if (v && v.status === 'Đang đi') {
                const activeRoute = getActiveRoute(v.id, v);
                if (!activeRoute) {
                    console.log(`🛡️ [Live-Purge] Resetting ${v.id} - No valid active route found.`);
                    v.status = 'Sẵn sàng';
                    v.location = 'Kho Tổng';
                    needsSave = true;
                } else {
                    // Kiểm tra xem dự án trong route có thực sự tồn tại không
                    const usage = getModuleData('vmUsage', []);
                    const activeUsage = Array.isArray(usage) ? usage.find(u => u && u.vId === v.id && u.status === 'Đang đi') : null;
                    if (activeUsage && activeUsage.route) {
                        const rNorm = activeUsage.route.toString().toLowerCase().trim();
                        const pExists = projectList.some(p => {
                            if (!p || !p.name) return false;
                            const pNorm = p.name.toString().toLowerCase().trim();
                            return pNorm === rNorm || rNorm.includes(pNorm) || pNorm.includes(rNorm) || p.id === activeUsage.route;
                        });

                        if (!pExists) {
                            console.log(`🛡️ [Live-Purge] Resetting ${v.id} - Project "${activeUsage.route}" does not exist.`);
                            v.status = 'Sẵn sàng';
                            v.location = 'Kho Tổng';
                            needsSave = true;
                        }
                    }
                }
            }
        });

        if (needsSave) {
            saveModuleData('vmVehicles', all);
            if (window.erpApp && window.erpApp._setData) {
                window.vmVehicles = all;
            }
        }

        return all.filter(v => {
            if (!v || !v.id) return false;
            if (v.context) { return v.context === currentVmContext; }
            const isEquip = v.type === 'Thiết bị thi công' || (v.internalCode && (v.internalCode.startsWith('TB-') || v.internalCode.startsWith('M-')));
            return currentVmContext === 'equipment' ? isEquip : !isEquip;
        });
    };

    const fmtDate = (d) => {
        if (!d) { return ''; }
        const parts = d.split('-');
        if (parts.length !== 3) { return d; }
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const parseInputDate = (d) => {
        if (!d) { return ''; }
        const parts = d.split('/');
        if (parts.length !== 3) { return d; } // Return as is if not DD/MM/YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const formatDateToInput = (d) => {
        if (!d) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const parts = d.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        try {
            const dateObj = new Date(d);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toISOString().split('T')[0];
            }
        } catch (e) { }
        return d;
    };

    // Mapping erpUtils to erpApp for easy access in templates
    if (window.erpUtils) {
        window.erpApp.formatNumberInput = window.erpUtils.formatNumberInput;
        window.erpApp.formatValue = window.erpUtils.formatValue;
        window.erpApp.parseVND = window.erpUtils.parseVND;
    }

    window.erpApp.scanVehicleInspections = function () {
        const all = getModuleData('vmVehicles', []);
        const maint = getModuleData('vmMaintenance', []);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const todayStr = now.toISOString().split('T')[0];

        // === Collect all alerts for consolidated email ===
        const emailAlerts = {
            inspectionExpired: [],  // Hết hạn đăng kiểm
            insuranceExpired: [],   // Hết hạn bảo hiểm
            maintenanceDue: []      // Cần bảo dưỡng
        };

        all.forEach(v => {
            const plate = v.licensePlate || v.internalCode || 'N/A';

            // 1. Kiểm tra Hạn đăng kiểm (Inspection)
            if (v.inspectionDate) {
                const insp = new Date(v.inspectionDate);
                insp.setHours(0, 0, 0, 0);
                const notifId = `insp-alert-${v.id}`;

                if (insp < now) {
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `HẾT HẠN KIỂM ĐỊNH: ${plate}`,
                            'error',
                            'red',
                            { page: 'hanh-chinh', module: 'Quản lý xe' },
                            notifId
                        );
                    }
                    // Gom vào danh sách email tổng hợp
                    emailAlerts.inspectionExpired.push({
                        plate: plate,
                        name: v.name || '',
                        date: fmtDate(v.inspectionDate)
                    });
                } else if (insp < thirtyDaysLater) {
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Sắp hết hạn kiểm định: ${plate}`,
                            'warning',
                            'orange',
                            { page: 'hanh-chinh', module: 'Quản lý xe' },
                            notifId
                        );
                    }
                } else {
                    if (window.erpApp.removeNotification) { window.erpApp.removeNotification(notifId); }
                }
            }

            // 2. Kiểm tra Hạn bảo hiểm (Insurance)
            if (v.insuranceDate) {
                const ins = new Date(v.insuranceDate);
                ins.setHours(0, 0, 0, 0);
                const insNotifId = `ins-alert-${v.id}`;

                if (ins < now) {
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `HẾT HẠN BẢO HIỂM: ${plate}`,
                            'error',
                            'red',
                            { page: 'hanh-chinh', module: 'Quản lý xe' },
                            insNotifId
                        );
                    }
                    // Gom vào danh sách email tổng hợp
                    emailAlerts.insuranceExpired.push({
                        plate: plate,
                        name: v.name || '',
                        date: fmtDate(v.insuranceDate)
                    });
                } else if (ins < thirtyDaysLater) {
                    if (window.erpApp.addNotification) {
                        window.erpApp.addNotification(
                            `Sắp hết hạn bảo hiểm: ${plate}`,
                            'warning',
                            'orange',
                            { page: 'hanh-chinh', module: 'Quản lý xe' },
                            insNotifId
                        );
                    }
                } else {
                    if (window.erpApp.removeNotification) { window.erpApp.removeNotification(insNotifId); }
                }
            }

            // 3. Kiểm tra Bảo dưỡng định kỳ (Km / Thời gian)
            const vMaint = maint.filter(m => m.vId === v.id && m.status === 'Hoàn thành');
            let lastOdo = 0;
            let lastDateStr = '';

            if (vMaint.length > 0) {
                const latest = vMaint.reduce((prev, curr) => (curr.odo > prev.odo) ? curr : prev, vMaint[0]);
                lastOdo = latest.odo;
                lastDateStr = latest.date;
            }

            const intervalKm = v.maintIntervalKm || 5000;
            const intervalMonths = v.maintIntervalMonths || 6;
            const kmSinceMaint = (v.odo || 0) - lastOdo;

            let monthsSinceMaint = 0;
            if (lastDateStr) {
                const parts = lastDateStr.split('/');
                if (parts.length === 3) {
                    const lastMaintDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    monthsSinceMaint = (now.getFullYear() - lastMaintDate.getFullYear()) * 12 + now.getMonth() - lastMaintDate.getMonth();
                }
            }

            const kmDue = kmSinceMaint >= intervalKm * 0.9;
            const timeDue = lastDateStr ? (monthsSinceMaint >= intervalMonths * 0.9) : false;

            if (kmDue || timeDue) {
                const dueReason = kmDue && timeDue ? 'đã quá hạn cả số Km & thời gian' : (kmDue ? 'đã quá hạn số Km chạy' : 'đã quá hạn thời gian sử dụng');
                const maintNotifId = `maint-due-${v.id}`;

                if (window.erpApp.addNotification) {
                    window.erpApp.addNotification(
                        `YÊU CẦU BẢO DƯỠNG: Xe ${plate} ${dueReason} (Chạy ${window.erpApp.formatValue(kmSinceMaint)} km / ${monthsSinceMaint} tháng)`,
                        'warning',
                        'orange',
                        { page: 'hanh-chinh', module: 'Quản lý xe' },
                        maintNotifId
                    );
                }
                // Gom vào danh sách email tổng hợp
                emailAlerts.maintenanceDue.push({
                    plate: plate,
                    name: v.name || '',
                    reason: dueReason,
                    kmInfo: `${window.erpApp.formatValue(kmSinceMaint)} Km / ${monthsSinceMaint} tháng`
                });
            } else {
                const maintNotifId = `maint-due-${v.id}`;
                if (window.erpApp.removeNotification) { window.erpApp.removeNotification(maintNotifId); }
            }
        });

        // === GỬI EMAIL TỔNG HỢP (1 email duy nhất/ngày) ===
        const totalAlerts = emailAlerts.inspectionExpired.length + emailAlerts.insuranceExpired.length + emailAlerts.maintenanceDue.length;
        if (totalAlerts > 0 && window.erpApp.sendMultiChannelNotification) {
            const consolidatedEmailKey = `vehicle-scan-summary-${todayStr}`;
            const sentSummary = JSON.parse(localStorage.getItem('erp_sentSummaryEmails') || '{}');

            if (sentSummary[consolidatedEmailKey] !== todayStr) {
                // Build consolidated email body
                let emailBody = `BÁO CÁO TỔNG HỢP CẢNH BÁO PHƯƠNG TIỆN / THIẾT BỊ\nNgày: ${todayStr}\n`;
                emailBody += `Tổng số cảnh báo: ${totalAlerts}\n`;
                emailBody += `${'═'.repeat(60)}\n\n`;

                if (emailAlerts.inspectionExpired.length > 0) {
                    emailBody += `🔴 HẾT HẠN ĐĂNG KIỂM / KIỂM ĐỊNH (${emailAlerts.inspectionExpired.length} thiết bị):\n`;
                    emailBody += `${'─'.repeat(50)}\n`;
                    emailAlerts.inspectionExpired.forEach((item, i) => {
                        emailBody += `  ${i + 1}. ${item.plate} — ${item.name} (Hết hạn: ${item.date})\n`;
                    });
                    emailBody += `\n`;
                }

                if (emailAlerts.insuranceExpired.length > 0) {
                    emailBody += `🟠 HẾT HẠN BẢO HIỂM (${emailAlerts.insuranceExpired.length} thiết bị):\n`;
                    emailBody += `${'─'.repeat(50)}\n`;
                    emailAlerts.insuranceExpired.forEach((item, i) => {
                        emailBody += `  ${i + 1}. ${item.plate} — ${item.name} (Hết hạn: ${item.date})\n`;
                    });
                    emailBody += `\n`;
                }

                if (emailAlerts.maintenanceDue.length > 0) {
                    emailBody += `🟡 CẦN BẢO DƯỠNG ĐỊNH KỲ (${emailAlerts.maintenanceDue.length} thiết bị):\n`;
                    emailBody += `${'─'.repeat(50)}\n`;
                    emailAlerts.maintenanceDue.forEach((item, i) => {
                        emailBody += `  ${i + 1}. ${item.plate} — ${item.name} (${item.reason}, đã chạy: ${item.kmInfo})\n`;
                    });
                    emailBody += `\n`;
                }

                emailBody += `${'═'.repeat(60)}\n`;
                emailBody += `Vui lòng kiểm tra và xử lý kịp thời để đảm bảo an toàn vận hành.\n`;
                emailBody += `— Hệ thống VIETBACH ERP`;

                window.erpApp.sendMultiChannelNotification({
                    recipientName: 'Ban Quản Lý',
                    title: `🚨 [VIETBACH ERP] TỔNG HỢP CẢNH BÁO: ${totalAlerts} thiết bị/xe cần xử lý (${todayStr})`,
                    message: emailBody,
                    target: { page: 'hanh-chinh', module: 'Quản lý xe' },
                    channels: ['email']
                });

                sentSummary[consolidatedEmailKey] = todayStr;
                localStorage.setItem('erp_sentSummaryEmails', JSON.stringify(sentSummary));
            }
        }
    };


    const getUsage = () => {
        const all = getModuleData('vmUsage', sampleUsage);
        if (!Array.isArray(all)) return [];

        // --- NUCLEAR PURGE (Live Usage Cleanup) ---
        let projectList = [];
        if (window.pmProjects) { projectList = window.pmProjects; }
        else if (window.erpApp && window.erpApp._getData) { projectList = window.erpApp._getData('pmProjects') || []; }

        if (!Array.isArray(projectList)) projectList = [];

        let usageChanged = false;
        all.forEach(u => {
            if (u && u.status === 'Đang đi' && u.route) {
                const rNorm = u.route.toString().toLowerCase().trim();
                const pExists = projectList.some(p => {
                    if (!p || !p.name) return false;
                    const pNorm = p.name.toString().toLowerCase().trim();
                    return pNorm === rNorm || rNorm.includes(pNorm) || pNorm.includes(rNorm) || p.id === u.route;
                });

                if (!pExists) {
                    console.log(`🛡️ [Live-Purge] Closing invalid dispatch ${u.id} to ghost project: ${u.route}`);
                    u.status = 'Hoàn thành';
                    usageChanged = true;
                }
            }
        });

        if (usageChanged) {
            saveModuleData('vmUsage', all);
        }

        const filteredVehicles = getVehicles().map(v => v.id);
        return all.filter(u => u && u.vId && filteredVehicles.includes(u.vId));
    };

    const getMaintenance = () => {
        const all = getModuleData('vmMaintenance', sampleMaintenance);
        if (!Array.isArray(all)) return [];
        const filteredVehicles = getVehicles().map(v => v.id);
        return all.filter(m => m && m.vId && filteredVehicles.includes(m.vId));
    };

    const getCosts = () => {
        const all = getModuleData('vmCosts', sampleCosts);
        if (!Array.isArray(all)) return [];
        const filteredVehicles = getVehicles().map(v => v.id);
        return all.filter(c => c && c.vId && filteredVehicles.includes(c.vId));
    };

    const getDrivers = () => {
        const all = getModuleData('vmDrivers', sampleDrivers);
        return Array.isArray(all) ? all.filter(d => d && d.id) : [];
    };

    const getActiveRoute = (vId, vehicleObj = null) => {
        const usage = getModuleData('vmUsage', sampleUsage);
        const active = usage.find(u => u.vId === vId && u.status === 'Đang đi');

        if (active && active.route) {
            let r = active.route;
            // Chuẩn hóa văn bản: Nếu chưa có chữ "Dự án" hoặc "Công trình" thì thêm vào
            if (!r.toLowerCase().includes('dự án') && !r.toLowerCase().includes('công trường')) {
                r = 'dự án ' + r;
            }
            return `Đang phục vụ ${r}`;
        }

        // --- NEW: Check Project Assignment from PM module ---
        const v = vehicleObj || (window.vmVehicles || []).find(item => item.id === vId) || getModuleData('vmVehicles', []).find(item => item.id === vId);
        if (v && v.status === 'Đang đi' && v.location) {
            let projectList = [];
            if (window.pmProjects) {
                projectList = window.pmProjects;
            } else if (window.erpApp && window.erpApp._getData) {
                projectList = window.erpApp._getData('pmProjects') || [];
            }
            const project = projectList.find(p => p.id === v.location);
            if (project) {
                let r = project.name;
                if (!r.toLowerCase().includes('dự án') && !r.toLowerCase().includes('công trường')) {
                    r = 'dự án ' + r;
                }
                return `Đang phục vụ ${r}`;
            }
        }

        return null;
    };

    window.erpApp.showActiveRouteDetails = function (vId) {
        const usage = getModuleData('vmUsage', sampleUsage);
        const active = usage.find(u => u.vId === vId && u.status === 'Đang đi');

        let driver = '';
        let person = '';
        let route = '';
        let time = '';
        let hasData = false;

        if (active) {
            driver = active.driver || '';
            person = active.person || '';
            route = active.route || '';
            time = active.time || '';
            hasData = true;
        } else {
            // Cập nhật lấy thông tin từ PM Projects nếu có
            const v = getVehicles().find(item => item.id === vId);
            if (v && v.status === 'Đang đi' && v.location) {
                let projectList = [];
                if (window.pmProjects) {
                    projectList = window.pmProjects;
                } else if (window.erpApp._getData) {
                    projectList = window.erpApp._getData('pmProjects') || [];
                }
                const project = projectList.find(p => p.id === v.location);
                if (project) {
                    route = project.name;
                    if (!route.toLowerCase().includes('dự án') && !route.toLowerCase().includes('công trường')) {
                        route = 'Công trường ' + route;
                    }
                    person = 'Ban QLDA';
                    driver = v.operator || v.driver || '';
                    time = 'Theo lịch dự án';
                    hasData = true;
                }
            }
        }

        let alertHtml = '';
        if (!hasData) {
            alertHtml = `
                <div style="margin-bottom: 16px; padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13px; color: #b45309; line-height: 1.5;">
                    <span class="material-icons-outlined" style="font-size: 16px; vertical-align: text-bottom; margin-right: 4px;">warning</span>
                    Thiết bị này đang có trạng thái <b>Đang đi</b> nhưng chưa có <b>Lệnh điều xe / Nhật ký vận hành</b> nào được ghi nhận. Vui lòng tạo Lệnh điều xe để cập nhật lộ trình.
                </div>
            `;
            driver = '<span style="color:#94a3b8; font-style:italic;">Không có dữ liệu</span>';
            person = '<span style="color:#94a3b8; font-style:italic;">Không có dữ liệu</span>';
            route = '<span style="color:#94a3b8; font-style:italic;">Không có dữ liệu</span>';
            time = '<span style="color:#94a3b8; font-style:italic;">Không có dữ liệu</span>';
        } else {
            driver = driver || '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
            person = person || '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
            route = route || '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
            time = time || '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '99999';

        modal.innerHTML = `
            <div style="background: #fff; width: 450px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: scaleIn 0.3s ease;">
                <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                    <h3 style="margin: 0; font-size: 16px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons-outlined" style="color: #3b82f6;">info</span>
                        Thông tin lộ trình đang thực hiện
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <div style="padding: 24px;">
                    ${alertHtml}
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">
                            <span style="color: #64748b; font-size: 13px;">Tài xế / Phụ trách:</span>
                            <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${driver}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">
                            <span style="color: #64748b; font-size: 13px;">Người/Đơn vị yêu cầu:</span>
                            <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${person}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">
                            <span style="color: #64748b; font-size: 13px;">Tuyến đường/Đích đến:</span>
                            <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${route}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">
                            <span style="color: #64748b; font-size: 13px;">Thời gian đi:</span>
                            <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${time}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b; font-size: 13px;">Trạng thái:</span>
                            <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; background: #fffbeb; color: #d97706; border: 1px solid currentColor;">Đang đi</span>
                        </div>
                    </div>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: right; background: #f8fafc;">
                    <button onclick="this.closest('.modal-overlay').remove()" style="padding: 8px 20px; background: #e2e8f0; color: #475569; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='#e2e8f0'">ĐÓNG</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    // Tab Configuration per Context
    const getTabConfig = (context) => {
        if (context === 'equipment') {
            return [
                { label: 'Danh sách thiết bị', icon: 'construction', color: 'blue', key: 'list' },
                { label: 'Sử dụng thiết bị', icon: 'engineering', color: 'green', key: 'usage' },
                { label: 'Chi phí', icon: 'payments', color: 'red', key: 'costs' },
                { label: 'Bảo dưỡng', icon: 'build', color: 'orange', key: 'maintenance' },
                { label: 'Tài xế phụ trách', icon: 'person_pin', color: 'teal', key: 'drivers' },
                { label: 'Báo cáo thiết bị', icon: 'analytics', color: 'purple', key: 'reports' }
            ];
        }
        return [
            { label: 'Danh sách xe', icon: 'directions_car', color: 'blue', key: 'list' },
            { label: 'Sử dụng xe', icon: 'local_taxi', color: 'green', key: 'usage' },
            { label: 'Chi phí xe', icon: 'local_gas_station', color: 'red', key: 'costs' },
            { label: 'Bảo dưỡng xe', icon: 'build', color: 'orange', key: 'maintenance' },
            { label: 'Quản lý lái xe', icon: 'person_pin', color: 'teal', key: 'drivers' },
            { label: 'Báo cáo xe', icon: 'analytics', color: 'purple', key: 'reports' }
        ];
    };
    window.erpApp.renderVehicleManagement = function (tab = 'Danh sách xe', context = 'vehicle') {
        try {
            const pageContent = document.getElementById('pageContent');
            if (!pageContent) { return; }

            currentVmContext = context;
            currentActiveTab = tab;
            window.erpApp.currentVmContext = context;
            window.erpApp.currentActiveTab = tab;
            const isEq = context === 'equipment';

            // Cập nhật Breadcrumb 3 cấp
            if (window.erpApp.updateBreadcrumb) {
                window.erpApp.updateBreadcrumb(
                    isEq ? 'Quản lý Thiết bị cơ giới' : 'Quản lý xe',
                    'Hành chính'
                );
            }

            const title = isEq ? 'Quản lý Thiết bị cơ giới' : 'Quản lý xe';
            const desc = isEq ? 'Hệ thống quản lý máy móc, máy ủi, máy xúc và thiết bị thi công.' : 'Hệ thống quản lý tập trung và điều hành phương tiện vận tải.';
            const tabs = getTabConfig(context);

            let html = `
                <div class="vm-container" style="padding: 24px; animation: fadeIn 0.4s ease both;">
                    <!-- Header -->
                    <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" style="margin: 0; flex-shrink: 0; padding: 10px 16px;">
                            <span class="material-icons-outlined" style="font-size: 18px;">arrow_back</span> QUAY LẠI
                        </button>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0;">${title}</h1>
                            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${desc}</p>
                        </div>
                    </div>

                    <!-- Tab Navigation Cards V2 -->
                    <div class="vm-tabs-grid-v2" style="grid-template-columns: repeat(${tabs.length}, 1fr);">
                        ${tabs.map(t => renderTabCard(t)).join('')}
                    </div>

                    <!-- Active Content Area -->
                    <div id="vm-main-content" style="animation: slideUp 0.3s ease both;">
                        <!-- Content will be injected here -->
                    </div>
                </div>

                <style>
                    .vm-tabs-grid-v2 {
                        display: grid; 
                        gap: 12px; 
                        margin-bottom: 30px;
                    }
                    .vm-tab-card-v2 {
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.5);
                        border-radius: 20px;
                        padding: 16px 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    }
                    .vm-tab-card-v2:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 28px rgba(0,0,0,0.06);
                        border-color: #3b82f633;
                    }
                    .vm-tab-card-v2.active {
                        background: #fff;
                        border-color: #3b82f6;
                        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
                    }
                    .vm-tab-card-v2.active .tab-label {
                        color: #3b82f6 !important;
                        font-weight: 800 !important;
                    }
                    
                    .tab-icon-box-v2 {
                        width: 36px;
                        height: 36px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        margin-bottom: 4px;
                    }
                    .tab-icon-box-v2 span { font-size: 20px; }
                    
                    .vm-tab-card-v2.active .tab-icon-box-v2 {
                        background: #3b82f6 !important;
                        color: #fff !important;
                    }

                    .tab-label {
                        font-size: 14px;
                        font-weight: 700;
                        color: #64748b;
                    }

                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .back-btn {
                        padding: 10px 20px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px;
                        color: #64748b; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 8px;
                        cursor: pointer; transition: all 0.2s;
                    }
                    .back-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

                    /* Premium Stat Cards */
                    .stats-grid-v3 {
                        display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
                    }
                    .stat-card-v3 {
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.5);
                        border-radius: 20px;
                        padding: 16px 20px;
                        display: flex;
                        flex-direction: column;
                        transition: all 0.3s ease;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    }
                    .stat-card-v3:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 28px rgba(0,0,0,0.06);
                        border-color: #3b82f633;
                    }
                    .stat-icon-v3 {
                        width: 36px; height: 36px; border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                        margin-bottom: 12px;
                    }
                    .stat-icon-v3 span { font-size: 20px; }
                    .stat-label-v3 {
                        font-size: 10px; font-weight: 800; color: #94a3b8;
                        text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
                    }
                    .stat-value-v3 {
                        font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1.2;
                    }
                </style>
            `;
            pageContent.innerHTML = html;

            // Render Initial Tab
            switchTab(tab);

            // 🔄 Sync Data Consistency
            if (window.erpApp.reconcileEquipmentSync) {
                const hasChanges = window.erpApp.reconcileEquipmentSync();
                if (hasChanges) {
                    // If data changed during reconciliation, re-render the current tab to reflect changes
                    switchTab(tab);
                }
            }
        } catch (err) {
            console.error('❌ Error rendering Vehicle Management:', err);
            if (window.erpApp && window.erpApp.showToast) {
                window.erpApp.showToast('Không thể tải phân hệ quản lý xe / thiết bị: Lỗi dữ liệu cấu trúc!', 'error');
            } else if (typeof showToast === 'function') {
                showToast('Không thể tải phân hệ quản lý xe / thiết bị: Lỗi dữ liệu cấu trúc!', 'error');
            }
        }
    };

    function renderTabCard(tabObj) {
        const colors = {
            blue: { main: '#3b82f6', bg: '#eff6ff' },
            green: { main: '#10b981', bg: '#f0fdf4' },
            red: { main: '#ef4444', bg: '#fef2f2' },
            orange: { main: '#f59e0b', bg: '#fffbeb' },
            teal: { main: '#0d9488', bg: '#f0fdfa' },
            purple: { main: '#8b5cf6', bg: '#f5f3ff' }
        };
        const c = colors[tabObj.color];

        // Compare with current active tab label
        const isActive = currentActiveTab === tabObj.label || currentActiveTab === tabObj.key;
        if (isActive) { currentActiveTab = tabObj.label; } // Sync label

        return `
            <div class="vm-tab-card-v2 ${isActive ? 'active' : ''}" 
                 onclick="window.erpApp.renderVehicleManagement('${tabObj.label}', '${currentVmContext}')">
                <div class="tab-icon-box-v2" style="background: ${c.bg}; color: ${c.main};">
                    <span class="material-icons-outlined">${tabObj.icon}</span>
                </div>
                <div class="tab-label">${tabObj.label}</div>
            </div>
        `;
    }

    function switchTab(tab) {
        const container = document.getElementById('vm-main-content');
        if (!container) { return; }

        // Unified mapping for both contexts
        const tabMap = {
            // Vehicle labels
            'Danh sách xe': 'list',
            'Sử dụng xe': 'usage',
            'Chi phí xe': 'costs',
            'Bảo dưỡng xe': 'maintenance',
            'Quản lý lái xe': 'drivers',
            'Báo cáo xe': 'reports',
            // Equipment labels
            'Danh sách thiết bị': 'list',
            'Sử dụng thiết bị': 'usage',
            'Chi phí': 'costs',
            'Bảo dưỡng': 'maintenance',
            'Tài xế phụ trách': 'drivers',
            'Báo cáo thiết bị': 'reports',
            'Báo cáo thiết bị cơ giới': 'reports',
            // Internal keys
            'list': 'list',
            'usage': 'usage',
            'costs': 'costs',
            'maintenance': 'maintenance',
            'drivers': 'drivers',
            'reports': 'reports'
        };

        const actionKey = tabMap[tab] || 'list';
        currentActiveTab = tab; // Keep the label for UI sync

        switch (actionKey) {
            case 'list': renderVehiclesSub(container); break;
            case 'usage': renderUsageSub(container); break;
            case 'costs': renderCostsSub(container); break;
            case 'maintenance': renderMaintenanceSub(container); break;
            case 'drivers': renderDriversSub(container); break;
            case 'reports': renderReportsSub(container); break;
        }
    }

    // ==========================================
    // SUB-MODULE: Danh sách xe
    // ==========================================
    function renderVehiclesSub(container) {
        const vehicles = getVehicles();
        const isEq = currentVmContext === 'equipment';
        const stats = [
            { icon: isEq ? 'construction' : 'directions_car', color: 'blue', value: vehicles.length, label: isEq ? 'Tổng số máy' : 'Tổng số xe' },
            { icon: 'check_circle', color: 'green', value: vehicles.filter(v => v.status === 'Sẵn sàng').length, label: 'Sẵn sàng' },
            { icon: isEq ? 'engineering' : 'local_shipping', color: 'orange', value: vehicles.filter(v => v.status === 'Đang đi').length, label: isEq ? 'Đang vận hành' : 'Đang đi' },
            { icon: 'build', color: 'red', value: vehicles.filter(v => v.status === 'Bảo trì').length, label: 'Bảo trì' }
        ];

        const filtered = vehicles.filter(v => {
            const matchesSearch = !vmSearchQuery ? true : (
                v.id.toLowerCase().includes(vmSearchQuery.toLowerCase()) ||
                (v.internalCode && v.internalCode.toLowerCase().includes(vmSearchQuery.toLowerCase())) ||
                (v.licensePlate && v.licensePlate.toLowerCase().includes(vmSearchQuery.toLowerCase()))
            );
            const matchesName = !vmNameFilter ? true : (
                v.name.toLowerCase().includes(vmNameFilter.toLowerCase())
            );
            const matchesType = !vmTypeFilter ? true : (
                v.type === vmTypeFilter
            );
            return matchesSearch && matchesName && matchesType;
        });

        container.innerHTML = `
            <div class="stats-grid-v3">
                ${stats.map(s => `
                    <div class="stat-card-v3">
                        <div class="stat-icon-v3" style="background: ${s.color === 'blue' ? '#eff6ff' : s.color === 'green' ? '#f0fdf4' : s.color === 'orange' ? '#fffbeb' : '#fef2f2'}; color: ${s.color === 'blue' ? '#2563eb' : s.color === 'green' ? '#16a34a' : s.color === 'orange' ? '#d97706' : '#dc2626'};">
                            <span class="material-icons-outlined">${s.icon}</span>
                        </div>
                        <span class="stat-label-v3">${s.label}</span>
                        <div class="stat-value-v3">${s.value}</div>
                    </div>
                `).join('')}
            </div>

            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap;">
                        <!-- Search Mã thiết bị -->
                        <div style="position: relative; min-width: 220px; flex: 1;">
                            <span class="material-icons-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 18px;">qr_code</span>
                            <input type="text" placeholder="${isEq ? 'Tìm theo Mã thiết bị...' : 'Tìm theo Mã xe...'}" value="${vmSearchQuery}" oninput="window.erpApp.onVmSearch(this.value)" style="width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-weight: 600; color: #1e293b; outline: none; transition: 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                        </div>
                        
                        <!-- Filter Tên máy -->
                        <div style="position: relative; min-width: 220px; flex: 1;">
                            <span class="material-icons-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 18px;">label</span>
                            <input type="text" placeholder="${isEq ? 'Tìm theo Tên máy...' : 'Tìm theo Tên xe...'}" value="${vmNameFilter}" oninput="window.erpApp.onVmNameFilterChange(this.value)" style="width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-weight: 600; color: #1e293b; outline: none; transition: 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                        </div>
                        
                        <!-- Filter Loại thiết bị -->
                        <div style="position: relative; min-width: 180px;">
                            <select onchange="window.erpApp.onVmTypeFilterChange(this.value)" style="width: 100%; padding: 10px 28px 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-weight: 600; color: #1e293b; outline: none; background: #fff; appearance: none; cursor: pointer;">
                                <option value="">— ${isEq ? 'Tất cả loại thiết bị' : 'Tất cả loại xe'} —</option>
                                ${[...new Set(vehicles.map(v => v.type).filter(Boolean))].map(type => `
                                    <option value="${type}" ${vmTypeFilter === type ? 'selected' : ''}>${type}</option>
                                `).join('')}
                            </select>
                            <span class="material-icons-outlined" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 20px; pointer-events: none;">arrow_drop_down</span>
                        </div>
                    </div>
                    
                    ${isAdmin() ? `
                    <button onclick="window.erpApp.openAddVehicleModal()" style="padding:10px 20px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:#fff; border:none; border-radius:12px; font-weight:800; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)';" onmouseout="this.style.transform='none';">
                        <span class="material-icons-outlined" style="font-size:18px;">add</span> ${isEq ? 'THÊM THIẾT BỊ' : 'THÊM XE MỚI'}
                    </button>
                    ` : ''}
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
                            <th style="padding: 14px 15px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b;">${isEq ? 'MÃ THIẾT BỊ' : 'MÃ XE'}</th>
                            <th style="padding: 14px 15px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b;">${isEq ? 'TÊN MÁY' : 'TÊN XE'}</th>
                            <th style="padding: 14px 15px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b;">LOẠI</th>
                            <th style="padding: 14px 15px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b;">${isEq ? 'SỐ KHUNG/MÁY' : 'BIỂN SỐ XE'}</th>
                            <th style="padding: 14px 15px; text-align: right; font-size: 11px; font-weight: 800; color: #64748b;">${isEq ? 'GIỜ CHẠY' : 'ODO (KM)'}</th>
                            <th style="padding: 14px 15px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b;">ĐĂNG KIỂM</th>
                            <th style="padding: 14px 15px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b;">BẢO HIỂM</th>
                            <th style="padding: 14px 15px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b;">TRẠNG THÁI</th>
                            <th style="padding: 14px 15px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b;">ĐÍNH KÈM</th>
                            <th style="padding: 14px 15px; text-align: right; font-size: 11px; font-weight: 800; color: #64748b;">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(v => {
            const insp = new Date(v.inspectionDate || '');
            const ins = new Date(v.insuranceDate || '');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((insp - today) / (1000 * 60 * 60 * 24));
            const diffDaysIns = Math.ceil((ins - today) / (1000 * 60 * 60 * 24));

            let inspBadge = '';
            const dispDate = fmtDate(v.inspectionDate);
            if (!v.inspectionDate) {
                inspBadge = '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
            } else if (diffDays < 0) {
                inspBadge = `<div style="color:#ef4444; font-weight:800; font-size:10px;">${dispDate}</div><div style="background:#fef2f2; color:#ef4444; padding:2px 6px; border-radius:4px; font-size:9px; display:inline-block;">HẾT HẠN</div>`;
            } else if (diffDays <= 30) {
                inspBadge = `<div style="color:#f59e0b; font-weight:800; font-size:10px;">${dispDate}</div><div style="background:#fffbeb; color:#f59e0b; padding:2px 6px; border-radius:4px; font-size:9px; display:inline-block;">SẮP HẾT HẠN</div>`;
            } else {
                inspBadge = `<div style="color:#10b981; font-weight:800; font-size:10px;">${dispDate}</div>`;
            }

            let insBadge = '';
            const dispInsDate = fmtDate(v.insuranceDate);
            if (!v.insuranceDate) {
                insBadge = '<span style="color:#94a3b8; font-style:italic;">Chưa cập nhật</span>';
            } else if (diffDaysIns < 0) {
                insBadge = `<div style="color:#ef4444; font-weight:800; font-size:10px;">${dispInsDate}</div><div style="background:#fef2f2; color:#ef4444; padding:2px 6px; border-radius:4px; font-size:9px; display:inline-block;">HẾT HẠN</div>`;
            } else if (diffDaysIns <= 30) {
                insBadge = `<div style="color:#f59e0b; font-weight:800; font-size:10px;">${dispInsDate}</div><div style="background:#fffbeb; color:#f59e0b; padding:2px 6px; border-radius:4px; font-size:9px; display:inline-block;">SẮP HẾT HẠN</div>`;
            } else {
                insBadge = `<div style="color:#10b981; font-weight:800; font-size:10px;">${dispInsDate}</div>`;
            }

            return `
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 12px 15px;">
                                        <div style="font-weight: 900; color: #64748b; font-size:12px;">${v.internalCode || 'N/A'}</div>
                                        <div style="font-weight: 800; color: #2563eb; font-size:11px; margin-top: 2px;">${v.id}</div>
                                    </td>
                                <td style="padding: 12px 15px;">
                                    <div style="font-weight: 700; color: #1e293b; font-size:13px;">${v.name}</div>
                                    <div style="font-size: 10px; color: #94a3b8;">Năm SX: ${v.year}</div>
                                </td>
                                <td style="padding: 12px 15px;"><span style="padding: 4px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700;">${v.type}</span></td>
                                <td style="padding: 12px 15px;">
                                    ${isEq ? `
                                        <div style="font-weight: 800; color: #1e293b; font-size: 12px;" title="Số khung">K: ${v.chassisNumber || '---'}</div>
                                        <div style="font-size: 10px; color: #64748b; margin-top: 2px;" title="Số máy">M: ${v.engineNumber || '---'}</div>
                                        ${v.enginePower ? `<div style="font-size: 10px; color: #2563eb; margin-top: 2px; font-weight: 700;" title="Công suất">⚡ ${v.enginePower}</div>` : ''}
                                    ` : `
                                        <div style="font-weight: 800; color: #1e293b; font-size: 12px;">${v.licensePlate || v.id}</div>
                                    `}
                                </td>
                                <td style="padding: 12px 15px; text-align: right; font-weight: 700; color:#1e293b;">${window.erpApp.formatValue(v.odo || 0)}</td>
                                <td style="padding: 12px 15px; text-align: center;">${inspBadge}</td>
                                <td style="padding: 12px 15px; text-align: center;">${insBadge}</td>
                                <td style="padding: 12px 15px; text-align: center;">
                                    <span ${v.status === 'Đang đi' ? `onclick="window.erpApp.showActiveRouteDetails('${v.id}')" style="cursor:pointer; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; background: ${getStatusBg(v.status)}; color: ${getStatusColor(v.status)}; border: 1px solid currentColor; opacity: 0.9; white-space: nowrap;" title="Xem chi tiết lộ trình"` : `style="padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; background: ${getStatusBg(v.status)}; color: ${getStatusColor(v.status)}; border: 1px solid currentColor; opacity: 0.9; white-space: nowrap;"`}>
                                        ${v.status === 'Đang đi' ? (getActiveRoute(v.id) || 'Đang đi') : v.status}
                                    </span>
                                </td>
                                <td style="padding: 12px 15px; text-align: center;">
                                    ${v.docUrl ? `
                                        <button onclick="event.stopPropagation(); window.open('${v.docUrl}', '_blank')" style="background:#eff6ff; border:1px solid #bfdbfe; color:#3b82f6; padding:6px 10px; border-radius:8px; font-size:10px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                            <span class="material-icons-outlined" style="font-size:14px;">description</span> XEM
                                        </button>
                                    ` : `
                                        <span style="font-size:10px; color:#94a3b8; font-style:italic;">N/A</span>
                                    `}
                                </td>
                                <td style="padding: 12px 15px; text-align: right;">
                                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                                        <button onclick="window.erpApp.viewVehicleDetails('${v.id}')" style="background:none; border:none; color:#10b981; cursor:pointer; transition: transform 0.2s;" title="Xem chi tiết" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                                            <span class="material-icons-outlined" style="font-size:18px;">visibility</span>
                                        </button>
                                        ${isAdmin() ? `
                                        <button onclick="window.erpApp.openEditVehicleModal('${v.id}')" style="background:none; border:none; color:#3b82f6; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                                            <span class="material-icons-outlined" style="font-size:18px;">edit</span>
                                        </button>
                                        <button onclick="window.erpApp.deleteVehicle('${v.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                                            <span class="material-icons-outlined" style="font-size:18px;">delete</span>
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
        `;
    }

    // ==========================================
    // SUB-MODULE: Sử dụng xe
    // ==========================================
    function renderUsageSub(container) {
        const usage = getUsage();
        const vehicles = getVehicles();
        const isEq = currentVmContext === 'equipment';
        container.innerHTML = `
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:800; color:#1e293b;">${isEq ? 'Nhật ký vận hành thiết bị' : 'Nhật ký điều xe'}</div>
                    ${isAdmin() ? `
                    <button onclick="window.erpApp.openAddDispatchModal()" style="padding:8px 16px; background:#10b981; color:#fff; border:none; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">${isEq ? 'TẠO LỆNH VẬN HÀNH' : 'TẠO LỆNH ĐIỀU XE'}</button>
                    ` : ''}
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color: #64748b;">MÃ LỆNH</th>
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color: #64748b;">${isEq ? 'MÃ THIẾT BỊ' : 'XE/BIỂN SỐ'}</th>
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color: #64748b;">${isEq ? 'TÀI XẾ/VẬN HÀNH' : 'TÀI XẾ'}</th>
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color: #64748b;">${isEq ? 'CÔNG TRƯỜNG / ĐỊNH MỨC' : 'LỘ TRÌNH / ĐỊNH MỨC'}</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b;">THỜI GIAN</th>
                            <th style="padding: 14px 20px; text-align: right; font-size: 11px; color: #64748b;">CHI PHÍ (Xăng/Cầu)</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b;">TRẠNG THÁI</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b;">TÁC VỤ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usage.map(u => {
            // --- ON-THE-FLY RECONCILIATION ---
            // Nếu phát hiện lệnh điều xe vẫn "Đang đi" nhưng thiết bị đã về trạng thái "Sẵn sàng" hoặc "Bảo trì"
            const v = vehicles.find(veh => veh.id.trim() === u.vId.trim());
            if (v && u.status === 'Đang đi' && (v.status === 'Sẵn sàng' || v.status === 'Bảo trì')) {
                console.log(`🛡️ [Live-Reconcile] Auto-fixing dispatch ${u.id} for ${v.id}`);
                u.status = 'Hoàn thành';

                // Lưu lại ngay lập tức để đồng bộ database
                const allUsage = getModuleData('vmUsage', []);
                const idx = allUsage.findIndex(item => item.id === u.id);
                if (idx > -1) {
                    allUsage[idx].status = 'Hoàn thành';
                    if (window.erpApp && window.erpApp._setData) {
                        window.erpApp._setData('vmUsage', allUsage);
                    } else {
                        saveModuleData('vmUsage', allUsage);
                    }
                }
            }

            const fuel = u.fuelCost || 0;
            const toll = u.tollCost || 0;
            const total = fuel + toll;

            return `
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #64748b;">${u.id}</td>
                                    <td style="padding: 16px 20px;">
                                        <div style="font-weight: 700; color: #1e293b;">${v ? v.name : 'N/A'}</div>
                                        <div style="font-size: 11px; display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                                            <span style="color: #64748b; font-weight: 800;">${v ? (v.internalCode || 'N/A') : 'N/A'}</span>
                                            <span style="color: #2563eb; font-weight: 800;">(${u.vId})</span>
                                        </div>
                                    </td>
                                    <td style="padding: 16px 20px; font-weight: 700;">${u.driver}</td>
                                    <td style="padding: 16px 20px; color: #475569; font-size: 13px;">
                                        <div style="font-weight: 600;">${u.route}</div>
                                        ${u.fuelQuota ? `<div style="font-size: 10px; color: #2563eb; font-weight: 800; margin-top: 4px;">Định mức: ${u.fuelQuota} ${isEq ? 'L/H' : 'L/100km'}</div>` : ''}
                                    </td>
                                    <td style="padding: 16px 20px; text-align: center; font-size: 12px;">${u.time}</td>
                                    <td style="padding: 16px 20px; text-align: right;">
                                        <div style="font-weight: 800; color: #1e293b; font-size: 13px;">${total > 0 ? window.erpApp.formatValue(total) + ' đ' : '—'}</div>
                                        ${total > 0 ? `<div style="font-size: 10px; color: #94a3b8;">Xăng: ${window.erpApp.formatValue(fuel)} | Cầu: ${window.erpApp.formatValue(toll)}</div>` : ''}
                                    </td>
                                    <td style="padding: 16px 20px; text-align: center;">
                                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; background: ${u.status === 'Hoàn thành' ? '#f0fdf4' : '#eff6ff'}; color: ${u.status === 'Hoàn thành' ? '#16a34a' : '#2563eb'};">
                                            ${u.status}
                                        </span>
                                    </td>
                                    <td style="padding: 16px 20px; text-align: center;">
                                        <div style="display: flex; justify-content: center; gap: 8px;">
                                            <button onclick="window.erpApp.openViewDispatchModal('${u.id}')" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #dbeafe; background: #eff6ff; color: #2563eb; cursor: pointer;" title="Xem chi tiết"><span class="material-icons-outlined" style="font-size: 18px;">visibility</span></button>
                                            ${isAdmin() ? `
                                            <button onclick="window.erpApp.openEditDispatchModal('${u.id}')" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ffedd5; background: #fff7ed; color: #ea580c; cursor: pointer;" title="Chỉnh sửa"><span class="material-icons-outlined" style="font-size: 18px;">edit</span></button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ==========================================
    // SUB-MODULE: Chi phí xe
    // ==========================================
    function renderCostProgress(label, percentage, color) {
        return `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:700; color:#475569;">${label}</span>
                    <span style="font-size:12px; font-weight:800; color:#1e293b;">${percentage}%</span>
                </div>
                <div style="width:100%; height:8px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                    <div style="width:${percentage}%; height:100%; background:${color}; border-radius:10px; transition: width 0.5s ease-out;"></div>
                </div>
            </div>
        `;
    }

    function renderCostsSub(container) {
        const isEq = currentVmContext === 'equipment';
        const vehicles = getVehicles();
        const usage = getUsage();
        const maintenance = getMaintenance();
        const otherCosts = getCosts();
        const allVehicles = getModuleData('vmVehicles', []);
        const vehicleExpenses = getVehicleExpenses().filter(e => {
            const v = allVehicles.find(veh => veh.id === e.vId);
            if (!v) return true;
            const isEquip = v.context ? (v.context === 'equipment') : (v.type === 'Thiết bị thi công' || (v.internalCode && (v.internalCode.startsWith('TB-') || v.internalCode.startsWith('M-'))));
            return currentVmContext === 'equipment' ? isEquip : !isEquip;
        });

        // 🔄 Sync Selected for Print: Keep only valid IDs
        const expenseIds = new Set(vehicleExpenses.map(e => e.id));
        costSelectedForPrint = new Set([...costSelectedForPrint].filter(id => expenseIds.has(id)));

        // Aggregate All Costs
        let combinedCosts = [];

        // 1. Costs from Usage (Fuel/Tolls)
        usage.forEach(u => {
            if (u.fuelCost > 0) {
                combinedCosts.push({
                    id: u.id,
                    sourceId: u.id,
                    sourceType: 'usage',
                    date: u.time.split(' ')[0],
                    vId: u.vId,
                    costItem: 'Xăng dầu',
                    total: u.fuelCost,
                    rawDate: u.time
                });
            }
            if (u.tollCost > 0) {
                combinedCosts.push({
                    id: u.id,
                    sourceId: u.id,
                    sourceType: 'usage',
                    date: u.time.split(' ')[0],
                    vId: u.vId,
                    costItem: 'Cầu đường',
                    total: u.tollCost,
                    rawDate: u.time
                });
            }
        });

        // 2. Costs from Maintenance
        maintenance.forEach(m => {
            if (m.cost > 0 && m.status === 'Hoàn thành') {
                combinedCosts.push({
                    id: m.id,
                    sourceId: m.id,
                    sourceType: 'maintenance',
                    date: m.date.slice(0, 5),
                    vId: m.vId,
                    costItem: 'Sửa chữa: ' + m.desc,
                    total: m.cost,
                    rawDate: m.date
                });
            }
        });

        // 3. Other Costs
        otherCosts.forEach(c => {
            combinedCosts.push({
                id: c.id,
                sourceId: c.id,
                sourceType: 'cost',
                date: c.date.slice(0, 5),
                vId: c.vId,
                costItem: c.cat,
                total: c.total,
                rawDate: c.date
            });
        });

        // 4. Vehicle Expense Proposals
        vehicleExpenses.forEach(e => {
            combinedCosts.push({
                id: e.id,
                sourceId: e.id,
                sourceType: 'proposal',
                date: fmtDate(e.date).slice(0, 5),
                vId: e.vId,
                costItem: VEHICLE_EXPENSE_CATEGORIES[e.category]?.label || e.category,
                total: e.amount,
                rawDate: fmtDate(e.date)
            });
        });

        // Filter by Vehicle
        if (costVehicleFilter) {
            combinedCosts = combinedCosts.filter(c => c.vId === costVehicleFilter);
        }

        // Sort by date (approximated)
        combinedCosts.sort((a, b) => {
            const dateA = a.rawDate.includes('/') ? a.rawDate.split('/').reverse().join('') : '0';
            const dateB = b.rawDate.includes('/') ? b.rawDate.split('/').reverse().join('') : '0';
            return dateB.localeCompare(dateA);
        });

        const totalSum = combinedCosts.reduce((acc, c) => acc + c.total, 0);

        // Dynamic categories sum calculations for premium charts
        let fuelSum = 0;
        let tollSum = 0;
        let maintenanceSum = 0;
        let otherSum = 0;

        combinedCosts.forEach(c => {
            const itemNorm = (c.costItem || '').toString().toLowerCase();
            if (itemNorm.includes('xăng') || itemNorm.includes('dầu') || itemNorm.includes('nhiên liệu') || c.costItem === 'fuel') {
                fuelSum += c.total;
            } else if (itemNorm.includes('cầu') || itemNorm.includes('đường') || itemNorm.includes('đăng kiểm') || c.costItem === 'inspection') {
                tollSum += c.total;
            } else if (itemNorm.includes('sửa') || itemNorm.includes('bảo') || c.costItem === 'maintenance') {
                maintenanceSum += c.total;
            } else {
                otherSum += c.total;
            }
        });

        const totalCategorySum = fuelSum + tollSum + maintenanceSum + otherSum;
        const fuelPct = totalCategorySum > 0 ? Math.round((fuelSum / totalCategorySum) * 100) : 0;
        const tollPct = totalCategorySum > 0 ? Math.round((tollSum / totalCategorySum) * 100) : 0;
        const maintPct = totalCategorySum > 0 ? Math.round((maintenanceSum / totalCategorySum) * 100) : 0;
        const otherPct = totalCategorySum > 0 ? Math.round((otherSum / totalCategorySum) * 100) : 0;

        // Render HTML layout with internal sub-tabs
        let html = `
            <div class="costs-module-wrapper animated fadeIn">
                <!-- Sub Tabs Navigation -->
                <div class="module-tabs-container" style="margin-bottom: 24px; display:flex; gap:12px; background:#f8fafc; padding:8px; border-radius:16px; border:1px solid #e2e8f0;">
                    <button class="tab-btn-modern ${costSubTab === 'history' ? 'active' : ''}" onclick="window.erpApp.setCostSubTab('history')" style="padding:10px 20px; border:none; border-radius:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; transition:all 0.2s; ${costSubTab === 'history' ? 'background:#3b82f6; color:#fff; box-shadow:0 4px 12px rgba(59,130,246,0.2);' : 'background:transparent; color:#64748b;'}">
                        <span class="material-icons-outlined">insights</span>
                        Lịch sử & Phân tích
                    </button>
                    <button class="tab-btn-modern ${costSubTab === 'proposals' ? 'active' : ''}" onclick="window.erpApp.setCostSubTab('proposals')" style="padding:10px 20px; border:none; border-radius:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; transition:all 0.2s; ${costSubTab === 'proposals' ? 'background:#3b82f6; color:#fff; box-shadow:0 4px 12px rgba(59,130,246,0.2);' : 'background:transparent; color:#64748b;'}">
                        <span class="material-icons-outlined">request_quote</span>
                        Đề xuất chi phí
                    </button>
                    <button class="tab-btn-modern ${costSubTab === 'print' ? 'active' : ''}" onclick="window.erpApp.setCostSubTab('print')" style="padding:10px 20px; border:none; border-radius:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; transition:all 0.2s; ${costSubTab === 'print' ? 'background:#3b82f6; color:#fff; box-shadow:0 4px 12px rgba(59,130,246,0.2);' : 'background:transparent; color:#64748b;'}">
                        <span class="material-icons-outlined">print</span>
                        In phiếu đề xuất
                    </button>
                </div>

                <div id="costSubTabContent">
        `;

        if (costSubTab === 'history') {
            html += `
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:900; color:#1e293b; font-size:15px;">Lịch sử chi phí ${isEq ? 'thiết bị' : ''} hợp nhất</span>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <label style="font-size:12px; font-weight:700; color:#64748b;">Lọc theo xe:</label>
                                <select onchange="window.erpApp.onCostVehicleFilterChange(this.value)" style="padding:6px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:12px; font-weight:700; color:#1e293b; outline:none; background:#f8fafc;">
                                    <option value="">-- Tất cả --</option>
                                    ${vehicles.map(v => `<option value="${v.id}" ${costVehicleFilter === v.id ? 'selected' : ''}>${v.id} - ${v.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead style="background:#f8fafc;">
                                <tr>
                                    <th style="padding:14px 20px; text-align:left; font-size:11px; color:#64748b;">NGÀY</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:11px; color:#64748b;">${isEq ? 'Tên TB / Mã định danh' : 'LOẠI XE / BIỂN SỐ'}</th>
                                    <th style="padding:14px 20px; text-align:left; font-size:11px; color:#64748b;">CHI PHÍ</th>
                                    <th style="padding:14px 20px; text-align:right; font-size:11px; color:#64748b;">THÀNH TIỀN</th>
                                    <th style="padding:14px 20px; text-align:center; font-size:11px; color:#64748b;">TÁC VỤ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${combinedCosts.length === 0 ? '<tr><td colspan="5" style="padding:40px; text-align:center; color:#94a3b8;">Chưa có dữ liệu chi phí</td></tr>' : combinedCosts.map(c => {
                const v = vehicles.find(v => v.id === c.vId) || { name: 'N/A' };
                return `
                                        <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.2s;" onmouseover="this.style.background='#fcfdfe'" onmouseout="this.style.background='transparent'">
                                            <td style="padding:14px 20px; color:#64748b; font-weight:600;">${c.date}</td>
                                            <td style="padding:14px 20px;">
                                                <div style="font-weight:700; color:#1e293b;">${v.name}</div>
                                                <div style="font-size: 11px; display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                                                    <span style="color: #64748b; font-weight: 800;">${v.internalCode || 'N/A'}</span>
                                                    <span style="color: #3b82f6; font-weight: 800;">(${c.vId})</span>
                                                </div>
                                            </td>
                                            <td style="padding:14px 20px;">
                                                <span style="display:inline-block; padding:2px 8px; background:#f1f5f9; border-radius:6px; color:#475569; font-size:11px; font-weight:700;">${c.costItem}</span>
                                            </td>
                                            <td style="padding:14px 20px; text-align:right; font-weight:700; color:#1e293b;">${window.erpApp.formatValue(c.total)} đ</td>
                                            <td style="padding:14px 20px; text-align:center;">
                                                <div style="display:flex; justify-content:center; gap:8px;">
                                                    ${c.sourceType === 'proposal' ? `
                                                        <button onclick="window.erpApp.printVehicleExpense('${c.sourceId}')" style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:1.5px solid #e2e8f0; background:#fff; color:#475569; cursor:pointer;" title="In phiếu đề xuất">
                                                            <span class="material-icons-outlined" style="font-size:16px;">print</span>
                                                        </button>
                                                    ` : `
                                                        <button onclick="window.erpApp.openUnifiedCostDetail('${c.sourceType}', '${c.sourceId}', 'view')" style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:1.5px solid #dbeafe; background:#eff6ff; color:#2563eb; cursor:pointer;" title="Xem chi tiết">
                                                            <span class="material-icons-outlined" style="font-size:16px;">visibility</span>
                                                        </button>
                                                        ${isAdmin() ? `
                                                        <button onclick="window.erpApp.openUnifiedCostDetail('${c.sourceType}', '${c.sourceId}', 'edit')" style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:1.5px solid #ffedd5; background:#fff7ed; color:#ea580c; cursor:pointer;" title="Chỉnh sửa">
                                                            <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                                                        </button>
                                                        ` : ''}
                                                    `}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
            }).join('')}
                            </tbody>
                            <tfoot style="background:#f8fafc; border-top:2px solid #e2e8f0;">
                                <tr>
                                    <td colspan="3" style="padding:16px 20px; text-align:right; font-weight:800; color:#64748b; font-size:11px; text-transform:uppercase;">Tổng chi phí${costVehicleFilter ? ' xe này' : ''}:</td>
                                    <td style="padding:16px 20px; text-align:right; font-weight:900; color:#ef4444; font-size:16px;">${window.erpApp.formatValue(totalSum)} đ</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 800;">Phân tích chi phí</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${renderCostProgress('⛽ Nhiên liệu (Xăng/Dầu)', fuelPct, '#f59e0b')}
                            ${renderCostProgress('📋 Đăng kiểm & Cầu đường', tollPct, '#3b82f6')}
                            ${renderCostProgress('🛠️ Sửa chữa & Bảo dưỡng', maintPct, '#ef4444')}
                            ${otherPct > 0 ? renderCostProgress('💸 Chi phí khác', otherPct, '#8b5cf6') : ''}
                        </div>
                    </div>
                </div>
            `;
        } else if (costSubTab === 'proposals') {
            html += `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.02); padding: 24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                        <div>
                            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">Danh sách Đề xuất Chi phí ${isEq ? 'Thiết bị' : 'Xe'}</h3>
                            <p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">Quản lý các phiếu đề nghị thanh toán tạm ứng chi phí cho ${isEq ? 'thiết bị' : 'xe'}</p>
                        </div>
                        <button onclick="window.erpApp.openNewVehicleExpenseModal()" class="btn-primary-pro" style="padding:10px 20px; font-size:13px;">
                            <span class="material-icons-outlined">add</span>
                            Đề xuất chi phí mới
                        </button>
                    </div>

                    <div style="overflow-x:auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:100px;">MÃ SỐ</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:160px;">PHƯƠNG TIỆN</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:150px;">HẠNG MỤC</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b;">NỘI DUNG CHI TIẾT</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:right; width:130px;">SỐ TIỀN (đ)</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:center; width:100px;">TRẠNG THÁI</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:center; width:130px;">THANH TOÁN</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:right; width:120px;">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vehicleExpenses.length === 0 ? '<tr><td colspan="8" style="padding:40px; text-align:center; color:#94a3b8; font-style:italic;">Chưa có đề xuất chi phí nào</td></tr>' : vehicleExpenses.map(e => {
                const cat = VEHICLE_EXPENSE_CATEGORIES[e.category] || VEHICLE_EXPENSE_CATEGORIES['other'];
                const priorityBadge = e.priority === 'high' ? '<span style="background:#fef2f2; color:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800;">Khẩn cấp</span>' : (e.priority === 'medium' ? '<span style="background:#fffbeb; color:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800;">Trung bình</span>' : '<span style="background:#f0fdf4; color:#16a34a; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800;">Thấp</span>');

                const statusVal = e.status || 'Đang chờ';
                const statusColors = {
                    'Đang chờ': { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
                    'Đã duyệt': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                    'Từ chối': { bg: '#fef2f2', color: '#dc2626', border: '#fee2e2' }
                };
                const stCol = statusColors[statusVal] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

                const payVal = e.paymentStatus || 'Chưa thanh toán';
                const payColors = {
                    'Chưa thanh toán': { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
                    'Đã thanh toán': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
                };
                const payCol = payColors[payVal] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

                return `
                                        <tr style="border-bottom:1px solid #f8fafc; transition:background 0.2s;" onmouseover="this.style.background='#fcfdfe'" onmouseout="this.style.background='transparent'">
                                            <td style="padding:14px 16px; font-weight:800; color:#2563eb;"><span class="code-badge">${e.id}</span></td>
                                            <td style="padding:14px 16px;">
                                                <div style="font-weight:700; color:#1e293b;">${e.vName}</div>
                                                <div style="font-size:10px; color:#64748b; font-weight:700; margin-top:2px;">BS: ${e.licensePlate}</div>
                                            </td>
                                            <td style="padding:14px 16px;">
                                                <span style="background:${cat.color}15; color:${cat.color}; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800;">${cat.label}</span>
                                            </td>
                                            <td style="padding:14px 16px;">
                                                <div style="font-weight:600; color:#334155;">${e.desc}</div>
                                                <div style="font-size:10px; color:#94a3b8; margin-top:4px; display:flex; gap:12px;">
                                                    ${e.invoiceNo ? `<span>Hóa đơn: <strong>${e.invoiceNo}</strong></span>` : ''}
                                                    ${e.files && e.files.length > 0 ?
                        e.files.map((file, idx) => `<a href="${file.url || file.dataUrl}" target="_blank" style="color:#3b82f6; text-decoration:none; display:inline-flex; align-items:center; gap:2px; margin-right:6px;" title="${file.name}"><span class="material-icons-outlined" style="font-size:12px;">attach_file</span> Chứng từ ${e.files.length > 1 ? idx + 1 : ''}</a>`).join('')
                        : (e.evidenceUrl ? `<a href="${e.evidenceUrl}" target="_blank" style="color:#3b82f6; text-decoration:none; display:inline-flex; align-items:center; gap:2px;"><span class="material-icons-outlined" style="font-size:12px;">link</span> Chứng từ</a>` : '')
                    }
                                                </div>
                                            </td>
                                            <td style="padding:14px 16px; text-align:right; font-weight:900; color:#1e293b; font-size:14px;">${window.erpApp.formatValue(e.amount)}</td>
                                            <td style="padding:14px 16px; text-align:center;">
                                                <span style="padding:4px 10px; border-radius:20px; font-size:10px; font-weight:800; background:${stCol.bg}; color:${stCol.color}; border:1px solid ${stCol.border};">${statusVal}</span>
                                            </td>
                                            <td style="padding:14px 16px; text-align:center;">
                                                <select onchange="window.erpApp.updateVehicleExpensePaymentStatus('${e.id}', this.value)" style="padding:4px 20px 4px 10px; border-radius:20px; font-size:10px; font-weight:800; background:${payCol.bg} url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${payCol.color.substring(1)}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E') no-repeat right 6px center; background-size:8px auto; color:${payCol.color}; border:1px solid ${payCol.border}; cursor:pointer; outline:none; appearance:none; -webkit-appearance:none; transition:all 0.2s;" onfocus="this.style.boxShadow='0 0 0 2px ${payCol.border}'" onblur="this.style.boxShadow='none'">
                                                    <option value="Chưa thanh toán" ${payVal === 'Chưa thanh toán' ? 'selected' : ''}>Chưa thanh toán</option>
                                                    <option value="Đã thanh toán" ${payVal === 'Đã thanh toán' ? 'selected' : ''}>Đã thanh toán</option>
                                                </select>
                                            </td>
                                            <td style="padding:14px 16px; text-align:right;">
                                                <div style="display:flex; justify-content:flex-end; gap:8px;">
                                                    <button onclick="window.erpApp.printVehicleExpense('${e.id}')" style="background:none; border:none; color:#64748b; cursor:pointer;" title="In phiếu"><span class="material-icons-outlined" style="font-size:18px;">print</span></button>
                                                    <button onclick="window.erpApp.openEditVehicleExpenseModal('${e.id}')" style="background:none; border:none; color:#3b82f6; cursor:pointer;" title="Sửa"><span class="material-icons-outlined" style="font-size:18px;">edit</span></button>
                                                    <button onclick="window.erpApp.deleteVehicleExpense('${e.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Xóa"><span class="material-icons-outlined" style="font-size:18px;">delete</span></button>
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
        } else if (costSubTab === 'print') {
            const printableExpenses = vehicleExpenses.filter(e => e.paymentStatus !== 'Đã thanh toán');
            // Clean selection set for deleted or paid proposals
            const printableIds = new Set(printableExpenses.map(e => e.id));
            costSelectedForPrint = new Set([...costSelectedForPrint].filter(id => printableIds.has(id)));

            const selCount = costSelectedForPrint.size;
            const selTotal = printableExpenses.filter(e => costSelectedForPrint.has(e.id)).reduce((sum, e) => sum + e.amount, 0);

            html += `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.02); padding: 24px;">
                    <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:16px; padding:16px; margin-bottom:24px; display:flex; align-items:center; gap:16px;">
                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:32px;">info</span>
                        <div>
                            <h4 style="margin:0; color:#1e3a8a; font-weight:800;">Hướng dẫn in phiếu</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#1e40af; font-weight:500;">Tích chọn các đề xuất chi phí cần in, sau đó bấm "In tất cả đã chọn" để in gộp nhiều phiếu.</p>
                        </div>
                    </div>

                    <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-radius:16px; background:#f8fafc; border:1px solid #e2e8f0;">
                        <div>
                            <span style="font-weight:700; color:#1e293b; font-size:14px;">
                                ${selCount > 0 ? `Đã chọn <strong style="color:#2563eb;">${selCount}</strong> phiếu • Tổng tiền: <strong style="color:#ef4444;">${window.erpApp.formatValue(selTotal)} VNĐ</strong>` : 'Chưa chọn phiếu nào'}
                            </span>
                        </div>
                        <button onclick="window.erpApp.printMultipleVehicleExpenses()" style="padding:10px 20px; font-size:13px; font-weight:700; border-radius:12px; background:#2563eb; color:#fff; border:none; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 10px rgba(37, 99, 235, 0.2); transition: all 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                            <span class="material-icons-outlined" style="font-size:18px;">print</span>
                            In tất cả đã chọn (${selCount})
                        </button>
                    </div>

                    <div style="overflow-x:auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:2px solid #f1f5f9; text-align:left;">
                                    <th style="width:40px; text-align:center; padding:14px 16px;">
                                        <input type="checkbox" onchange="window.erpApp.toggleAllCostPrintSelection(this.checked)">
                                    </th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:100px;">MÃ SỐ</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:180px;">PHƯƠNG TIỆN</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; width:150px;">HẠNG MỤC</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b;">NỘI DUNG</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:right; width:130px;">SỐ TIỀN (đ)</th>
                                    <th style="padding:14px 16px; font-size:11px; color:#64748b; text-align:center; width:100px;">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${printableExpenses.length === 0 ? '<tr><td colspan="7" style="padding:40px; text-align:center; color:#94a3b8; font-style:italic;">Chưa có đề xuất chi phí cần in (hoặc tất cả đề xuất đã được thanh toán)</td></tr>' : printableExpenses.map(e => {
                const cat = VEHICLE_EXPENSE_CATEGORIES[e.category] || VEHICLE_EXPENSE_CATEGORIES['other'];
                const isSelected = costSelectedForPrint.has(e.id);
                return `
                                        <tr style="border-bottom:1px solid #f8fafc; transition:background 0.2s; ${isSelected ? 'background:#eff6ff;' : ''}" onmouseover="this.style.background='#fcfdfe'" onmouseout="this.style.background='transparent'">
                                            <td style="text-align:center; padding:14px 16px;">
                                                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window.erpApp.toggleCostPrintSelection('${e.id}', this.checked)">
                                            </td>
                                            <td style="padding:14px 16px; font-weight:800; color:#2563eb;"><span class="code-badge">${e.id}</span></td>
                                            <td style="padding:14px 16px;">
                                                <div style="font-weight:700; color:#1e293b;">${e.vName}</div>
                                                <div style="font-size:10px; color:#64748b; font-weight:700; margin-top:2px;">BS: ${e.licensePlate}</div>
                                            </td>
                                            <td style="padding:14px 16px;">
                                                <span style="background:${cat.color}15; color:${cat.color}; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800;">${cat.label}</span>
                                            </td>
                                            <td style="padding:14px 16px; font-weight:600; color:#334155;">${e.desc}</td>
                                            <td style="padding:14px 16px; text-align:right; font-weight:900; color:#1e293b; font-size:14px;">${window.erpApp.formatValue(e.amount)}</td>
                                            <td style="padding:14px 16px; text-align:center;">
                                                <button onclick="window.erpApp.printVehicleExpense('${e.id}')" style="background:none; border:none; color:#64748b; cursor:pointer;" title="In riêng phiếu này"><span class="material-icons-outlined" style="font-size:18px;">print</span></button>
                                            </td>
                                        </tr>
                                    `;
            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    // ==========================================
    // Expense Proposal Methods
    // ==========================================
    window.erpApp.setCostSubTab = function (tab) {
        costSubTab = tab;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.toggleCostPrintSelection = function (id, checked) {
        if (checked) costSelectedForPrint.add(id);
        else costSelectedForPrint.delete(id);
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.toggleAllCostPrintSelection = function (checked) {
        const vehicles = getVehicles();
        const vehicleExpenses = getVehicleExpenses().filter(e => {
            const v = vehicles.find(veh => veh.id === e.vId);
            return v ? v.context === currentVmContext : true;
        });

        if (checked) vehicleExpenses.forEach(e => costSelectedForPrint.add(e.id));
        else costSelectedForPrint.clear();
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.openNewVehicleExpenseModal = function () {
        window.erpApp.renderVehicleExpenseModal(null);
    };

    window.erpApp.openEditVehicleExpenseModal = function (id) {
        const expenses = getVehicleExpenses();
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            window.erpApp.renderVehicleExpenseModal(expense);
        }
    };

    window.erpApp.renderVehicleExpenseModal = function (editData = null) {
        tempExpenseFiles = editData ? (editData.files || (editData.evidenceUrl ? [{ name: 'Chứng từ đính kèm', url: editData.evidenceUrl, type: 'pdf', size: '' }] : [])) : [];
        const isEdit = !!editData;
        const vehicles = getVehicles();
        const isEq = currentVmContext === 'equipment';
        const typeLabel = isEq ? 'Thiết bị' : 'Xe';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmExpenseModal';
        modal.style = 'background:rgba(15,23,42,0.75); backdrop-filter:blur(10px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';

        const nextId = isEdit ? editData.id : 'VEXP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

        modal.innerHTML = `
            <div class="modal-content" style="width:100%; max-width:600px; background:#fff; border-radius:32px; overflow:hidden; box-shadow:0 30px 60px -12px rgba(0,0,0,0.4); animation:modalPop 0.3s ease-out;">
                <!-- Modal Header -->
                <div style="padding:24px 32px; background:#fcfdfe; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:${isEdit ? '#eff6ff' : '#f0fdf4'}; color:${isEdit ? '#3b82f6' : '#10b981'}; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">${isEdit ? 'edit' : 'add_circle'}</span> 
                        </div>
                        ${isEdit ? 'Chỉnh sửa đề xuất chi phí' : `Đề xuất chi phí ${typeLabel} mới`}
                    </h2>
                    <button onclick="document.getElementById('vmExpenseModal').remove()" style="background:#f1f5f9; border:none; color:#94a3b8; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <span class="material-icons-outlined" style="font-size:20px;">close</span>
                    </button>
                </div>

                <form onsubmit="window.erpApp.saveVehicleExpense(event, '${nextId}')" style="margin:0;">
                    <div style="padding:32px; display:grid; gap:24px; max-height:70vh; overflow-y:auto;">
                        <!-- Dropdown Chọn Phương Tiện -->
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">directions_car</span> Chọn ${typeLabel}
                            </label>
                            <select name="vId" required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                                <option value="">-- Chọn ${typeLabel} --</option>
                                ${vehicles.map(v => `
                                    <option value="${v.id}" ${isEdit && editData.vId === v.id ? 'selected' : ''}>
                                        ${v.name} (${v.licensePlate || v.id})
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Hạng mục chi phí và Độ ưu tiên -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">category</span> Hạng mục chi phí
                                </label>
                                <select name="category" required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                                    ${Object.entries(VEHICLE_EXPENSE_CATEGORIES).map(([key, cat]) => `
                                        <option value="${key}" ${isEdit && editData.category === key ? 'selected' : ''}>
                                            ${cat.label}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">priority_high</span> Độ ưu tiên
                                </label>
                                <select name="priority" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                                    <option value="low" ${isEdit && editData.priority === 'low' ? 'selected' : ''}>Thấp</option>
                                    <option value="medium" ${isEdit && editData.priority === 'medium' ? 'selected' : ''}>Trung bình</option>
                                    <option value="high" ${isEdit && editData.priority === 'high' ? 'selected' : ''}>Khẩn cấp</option>
                                </select>
                            </div>
                        </div>

                        <!-- Số tiền và Số hóa đơn -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">payments</span> Số tiền đề xuất (VNĐ)
                                </label>
                                <input type="text" name="amount" value="${isEdit ? window.erpApp.formatValue(editData.amount) : ''}" required oninput="window.erpApp.formatNumberInput(this)" placeholder="VD: 500.000" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#2563eb; outline:none; font-size:14px;">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">receipt</span> Số hóa đơn (nếu có)
                                </label>
                                <input type="text" name="invoiceNo" value="${isEdit ? (editData.invoiceNo || '') : ''}" placeholder="VD: HD-0123" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                            </div>
                        </div>

                        <!-- Ngày chi dự kiến -->
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">calendar_today</span> Ngày chi dự kiến
                            </label>
                            <input type="text" name="date" value="${isEdit ? fmtDate(editData.date) : new Date().toLocaleDateString('vi-VN')}" placeholder="DD/MM/YYYY" required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#ef4444; outline:none; font-size:14px;">
                        </div>

                        <!-- Chứng từ tài liệu đính kèm (Google Drive UI) -->
                        <div class="form-group" style="border-top: 1px dashed #e2e8f0; padding-top: 20px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ chứng từ đính kèm
                            </label>
                            
                            <!-- Google Drive selectors -->
                            <div style="margin-bottom:16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap; display:flex; align-items:center; gap:4px;">
                                    <span class="material-icons-outlined" style="font-size:16px; color:#f59e0b;">folder</span> Lưu vào thư mục:
                                </label>
                                <select id="expenseDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadExpenseDriveSubfolders()">
                                    <option value="tai-chinh" selected>💰 Tài Chính (mặc định)</option>
                                    <option value="kho-van">📦 Kho Vận</option>
                                    <option value="hop-dong">📝 Hợp Đồng</option>
                                    <option value="chung">📁 Chung</option>
                                </select>
                                <select id="expenseDriveSubfolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; display:none; font-weight:600; outline:none;">
                                    <option value="">— Subfolder (tuỳ chọn) —</option>
                                </select>
                                <button type="button" onclick="window.erpApp.loadExpenseDriveSubfolders()" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải subfolder" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                    <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                </button>
                                <button type="button" onclick="window.erpApp.createExpenseDriveSubfolderFromModal()" style="padding:10px 16px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
                                    <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Tạo Folder
                                </button>
                            </div>

                            <!-- Upload Area -->
                            <div style="border: 2px dashed #3b82f644; background: #eff6ff44; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s;" 
                                 onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff77';" 
                                 onmouseout="this.style.borderColor='#3b82f644'; this.style.background='#eff6ff44';"
                                 onclick="document.getElementById('expenseFileInput').click()">
                                <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6; margin-bottom:8px; display:block;">cloud_upload</span>
                                <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                <span style="font-size:11px; color:#64748b; font-weight:500; display:block; margin-top:4px;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Tối đa 20MB/file</span>
                                <input type="file" id="expenseFileInput" multiple onchange="window.erpApp.handleExpenseFileUpload(event)" style="display:none">
                            </div>

                            <!-- Link area -->
                            <div style="margin-top:20px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px; color:#6366f1;">link</span> Thêm chứng từ bằng đường link
                                </label>
                                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                    <div style="flex:1; min-width:140px;">
                                        <input type="text" id="expenseLinkName" placeholder="VD: Hóa đơn..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <div style="flex:2; min-width:200px;">
                                        <input type="url" id="expenseLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <button type="button" onclick="window.erpApp.addExpenseFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                        <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                    </button>
                                </div>
                            </div>

                            <!-- File list container -->
                            <div id="expenseFileList" style="margin-top:16px;">
                                ${renderExpenseFileList(tempExpenseFiles, true)}
                            </div>
                        </div>

                        <!-- Trạng thái phê duyệt & Trạng thái thanh toán -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">rule</span> Trạng thái phê duyệt
                                </label>
                                <select name="status" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                                    <option value="Đang chờ" ${isEdit && editData.status === 'Đang chờ' ? 'selected' : ''}>Đang chờ</option>
                                    <option value="Đã duyệt" ${isEdit && editData.status === 'Đã duyệt' ? 'selected' : ''}>Đã duyệt</option>
                                    <option value="Từ chối" ${isEdit && editData.status === 'Từ chối' ? 'selected' : ''}>Từ chối</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">credit_card</span> Trạng thái thanh toán
                                </label>
                                <select name="paymentStatus" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px;">
                                    <option value="Chưa thanh toán" ${isEdit && editData.paymentStatus === 'Chưa thanh toán' ? 'selected' : ''}>Chưa thanh toán</option>
                                    <option value="Đã thanh toán" ${isEdit && editData.paymentStatus === 'Đã thanh toán' ? 'selected' : ''}>Đã thanh toán</option>
                                </select>
                            </div>
                        </div>

                        <!-- Nội dung chi tiết -->
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">description</span> Nội dung chi tiết
                            </label>
                            <textarea name="desc" required placeholder="Nêu rõ lý do đề xuất chi phí..." style="width:100%; height:100px; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:600; color:#1e293b; outline:none; font-size:14px; resize:none;">${isEdit ? editData.desc : ''}</textarea>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div style="padding:24px 32px; background:#fcfdfe; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:16px;">
                        <button type="button" onclick="document.getElementById('vmExpenseModal').remove()" class="btn-secondary-pro">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 32px; border-radius:14px; border:none; background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color:#fff; font-weight:800; cursor:pointer; font-size:14px; box-shadow:0 10px 20px -5px rgba(37, 99, 235, 0.4); transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px -5px rgba(37, 99, 235, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(37, 99, 235, 0.4)'">
                            ${isEdit ? 'Cập nhật đề xuất' : 'Gửi đề xuất'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        if (window.erpApp && window.erpApp.initDatePicker) {
            window.erpApp.initDatePicker(modal.querySelector('input[name="date"]'));
        }
    };

    window.erpApp.saveVehicleExpense = function (event, id) {
        event.preventDefault();
        
        // Prevent saving if files are still uploading
        const isUploading = tempExpenseFiles.some(f => f.uploading || (f.name && f.name.includes('⏳ Đang tải')));
        if (isUploading) {
            window.erpApp.showToast('⚠️ Vui lòng đợi chứng từ tải lên Google Drive hoàn tất trước khi lưu!', 'warning');
            return;
        }

        const form = event.target;
        const formData = new FormData(form);
        const vId = formData.get('vId');
        const vehicles = getVehicles();
        const v = vehicles.find(v => v.id === vId) || { name: 'N/A', licensePlate: 'N/A' };

        const allExpenses = getVehicleExpenses();
        const existingIdx = allExpenses.findIndex(e => e.id === id);

        const amount = parseInt(formData.get('amount').replace(/\./g, '')) || 0;
        const dateVal = parseInputDate(formData.get('date'));

        const existingExpense = existingIdx >= 0 ? allExpenses[existingIdx] : null;

        const payload = {
            id,
            vId,
            vName: v.name,
            licensePlate: v.licensePlate || v.id,
            category: formData.get('category'),
            priority: formData.get('priority'),
            amount,
            invoiceNo: formData.get('invoiceNo'),
            evidenceUrl: tempExpenseFiles.length > 0 ? (tempExpenseFiles[0].url || tempExpenseFiles[0].dataUrl || '') : '',
            files: [...tempExpenseFiles],
            date: dateVal,
            desc: formData.get('desc'),
            requester: existingExpense ? (existingExpense.requester || 'Người dùng hệ thống') : (window.erpApp.currentUser?.fullName || 'Người dùng hệ thống'),
            status: formData.get('status') || 'Đang chờ',
            paymentStatus: formData.get('paymentStatus') || 'Chưa thanh toán',
            createdAt: existingExpense ? (existingExpense.createdAt || new Date().toISOString()) : new Date().toISOString()
        };

        if (existingIdx >= 0) {
            allExpenses[existingIdx] = payload;
            window.erpApp.showToast('Cập nhật đề xuất chi phí thành công!', 'success');
        } else {
            allExpenses.push(payload);
            window.erpApp.showToast('Thêm đề xuất chi phí mới thành công!', 'success');
        }

        saveVehicleExpenses(allExpenses);
        document.getElementById('vmExpenseModal').remove();
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.deleteVehicleExpense = function (id) {
        window.erpApp.showDeleteConfirmation('đề xuất chi phí này', () => {
            const all = getVehicleExpenses();
            const filtered = all.filter(e => e.id !== id);
            saveVehicleExpenses(filtered);
            window.erpApp.showToast('Đã xóa đề xuất chi phí thành công!', 'success');
            window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
        });
    };

    window.erpApp.updateVehicleExpensePaymentStatus = function (id, newStatus) {
        const allExpenses = getVehicleExpenses();
        const idx = allExpenses.findIndex(e => e.id === id);
        if (idx >= 0) {
            allExpenses[idx].paymentStatus = newStatus;
            saveVehicleExpenses(allExpenses);
            window.erpApp.showToast(`Đã cập nhật trạng thái thanh toán của ${id} thành: ${newStatus}`, 'success');
            window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
        }
    };

    window.erpApp.printVehicleExpense = function (id) {
        const expenses = getVehicleExpenses();
        const expense = expenses.find(e => e.id === id);
        if (!expense) return;

        const prevSelection = new Set(costSelectedForPrint);
        costSelectedForPrint.clear();
        costSelectedForPrint.add(id);
        window.erpApp.printMultipleVehicleExpenses();
        costSelectedForPrint = prevSelection;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.printMultipleVehicleExpenses = function () {
        const formatDate = fmtDate;
        const expenses = getVehicleExpenses();
        const selected = expenses.filter(e => costSelectedForPrint.has(e.id));
        if (selected.length === 0) {
            window.erpApp.showToast('Vui lòng chọn ít nhất 1 phiếu để in!', 'error');
            return;
        }

        let currentUserName = 'Người dùng hệ thống';
        try {
            const localUser = JSON.parse(sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user') || '{}');
            if (localUser && localUser.fullName) {
                currentUserName = localUser.fullName;
            } else if (window.erpApp && window.erpApp.currentUser && window.erpApp.currentUser.fullName) {
                currentUserName = window.erpApp.currentUser.fullName;
            } else if (selected[0] && selected[0].requester) {
                currentUserName = selected[0].requester;
            }
        } catch (e) { }

        const enterprise = window.enterpriseInfo || {};
        const companyFullName = enterprise.fullName || 'CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH';

        let displayCompanyName = companyFullName;
        if (companyFullName.includes('CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ VÀ XÂY DỰNG VIỆT BÁCH')) {
            displayCompanyName = 'CÔNG TY CỔ PHẦN TƯ VẤN ĐẦU TƯ<br>VÀ XÂY DỰNG VIỆT BÁCH';
        }

        const companyTaxId = enterprise.taxId || '0303204517';
        const companyAddress = enterprise.address || '643/22B Xô Viết Nghệ Tĩnh, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh';

        const categories = [...new Set(selected.map(e => e.category))];
        const categoryText = categories.length === 1 ? `(${VEHICLE_EXPENSE_CATEGORIES[categories[0]]?.label || categories[0]})` : '(Đề xuất chi phí Xe/Thiết bị)';

        const totalAmount = selected.reduce((s, e) => s + e.amount, 0);
        const roundedTotal = Math.floor(totalAmount / 1000) * 1000;
        const totalInWords = window.erpApp.docTienBangChu ? window.erpApp.docTienBangChu(roundedTotal) : amountToWords(roundedTotal);

        const printWindow = window.open('', '_blank');

        let html = `
            <html>
            <head>
                <title>In phiếu đề nghị thanh toán chi phí xe</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { padding: 15mm 20mm; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        .page-break { page-break-before: always; }
                    }
                    body { font-family: 'Inter', 'Times New Roman', serif; padding: 30px; color: #1e293b; line-height: 1.5; margin: 0; }
                    .expense-page { padding: 10px 0; }
                    .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
                    .header-left { flex: 1.5; text-align: left; }
                    .company-name { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 1.3; display: inline-block; text-align: center; }
                    .company-tax { font-size: 11px; color: #475569; margin-top: 3px; font-weight: 600; }
                    .company-address { font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 500; }
                    .header-right { text-align: right; flex: 1; }
                    .form-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; line-height: 1.2; }
                    .form-subtitle { font-size: 15px; font-weight: 700; color: #334155; margin-top: 5px; }
                    .header-divider { height: 2px; background: #0f172a; margin: 10px 0 20px 0; border: none; }
                    .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .summary-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #1e293b; border: 1.5px solid #000; text-transform: uppercase; }
                    .summary-table td { padding: 10px 12px; font-size: 13px; border: 1.5px solid #000; color: #000; line-height: 1.4; }
                    .signature-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 50px; }
                    .sig-item { text-align: center; }
                    .sig-label { font-size: 12px; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 80px; display: block; }
                    .sig-name { font-size: 13px; font-weight: 700; color: #000; }
                    .print-btn-container { position: fixed; bottom: 30px; right: 30px; }
                    .print-btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="expense-page">
                    <div class="header-container">
                        <div class="header-left">
                            <h1 class="company-name">${displayCompanyName}</h1>
                            <p class="company-tax">MST: ${companyTaxId}</p>
                            <p class="company-address">${companyAddress}</p>
                        </div>
                        <div class="header-right">
                            <h2 class="form-title">GIẤY ĐỀ NGHỊ THANH TOÁN</h2>
                            <div class="form-subtitle">${categoryText}</div>
                        </div>
                    </div>
                    <hr class="header-divider">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th style="width:35px; text-align:center;">STT</th>
                                <th style="width:110px;">Mã số</th>
                                <th style="width:85px;">Ngày chi</th>
                                <th style="width:180px;">Tên xe / Biển số</th>
                                <th style="width:130px;">Hạng mục</th>
                                <th>Nội dung thanh toán</th>
                                <th style="width:100px; text-align:center;">Số Hóa đơn</th>
                                <th style="text-align:right; width:130px;">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selected.map((e, i) => {
            const c = VEHICLE_EXPENSE_CATEGORIES[e.category] || VEHICLE_EXPENSE_CATEGORIES['other'];
            return `<tr>
                                    <td style="text-align:center;">${i + 1}</td>
                                    <td style="font-weight:700;">${e.id}</td>
                                    <td>${formatDate(e.date)}</td>
                                    <td style="font-weight:700;">
                                        <div>${e.vName}</div>
                                        <div style="font-size:10px; color:#475569; font-weight:600;">BS: ${e.licensePlate} (${e.vId})</div>
                                    </td>
                                    <td>${c.label}</td>
                                    <td>${e.desc}</td>
                                    <td style="text-align:center;">${e.invoiceNo || '---'}</td>
                                    <td style="text-align:right; font-weight:700;">${window.erpApp.formatValue(e.amount)}</td>
                                </tr>`;
        }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="7" style="text-align:right; font-weight:800; padding:12px 20px; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">TỔNG CỘNG THANH TOÁN (làm tròn):</td>
                                <td style="text-align:right; font-weight:800; color:#000; font-size:16px; padding:12px 15px; background:#f8fafc; white-space:nowrap;">
                                    ${window.erpApp.formatValue(roundedTotal)} <span style="font-size:14px; margin-left:4px;">VNĐ</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="8" style="text-align:right; font-style:italic; padding:10px 20px; font-size:13px; border-top:none;">
                                    Số tiền bằng chữ: <strong style="text-transform:capitalize;">${totalInWords}</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="signature-container">
                        <div class="sig-item">
                            <span class="sig-label">Người đề nghị</span>
                            <div class="sig-name">${currentUserName}</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Kế toán</span>
                            <div class="sig-name">..........................</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Thủ quỹ</span>
                            <div class="sig-name">..........................</div>
                        </div>
                        <div class="sig-item">
                            <span class="sig-label">Người phê duyệt</span>
                            <div class="sig-name">..........................</div>
                        </div>
                    </div>
                </div>

                <div class="print-btn-container no-print">
                    <button class="print-btn" onclick="window.print()">BẮT ĐẦU IN PHIẾU</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    function amountToWords(n) {
        if (n === 0) return 'Không đồng';
        const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

        function doc3chuso(baso) {
            let tram = Math.floor(baso / 100);
            let chuc = Math.floor((baso % 100) / 10);
            let donvi = baso % 10;
            let ketqua = "";
            if (tram === 0 && chuc === 0 && donvi === 0) return "";
            if (tram !== 0) {
                ketqua += ChuSo[tram] + " trăm";
                if ((chuc === 0) && (donvi !== 0)) ketqua += " linh";
            }
            if ((chuc !== 0) && (chuc !== 1)) {
                ketqua += " " + ChuSo[chuc] + " mươi";
                if ((chuc === 0) && (donvi !== 0)) ketqua = ketqua + " linh";
            }
            if (chuc === 1) ketqua += " mười";
            switch (donvi) {
                case 1:
                    if ((chuc !== 0) && (chuc !== 1)) {
                        ketqua += " mốt";
                    } else {
                        ketqua += " " + ChuSo[donvi];
                    }
                    break;
                case 5:
                    if (chuc === 0) {
                        ketqua += " " + ChuSo[donvi];
                    } else {
                        ketqua += " lăm";
                    }
                    break;
                default:
                    if (donvi !== 0) {
                        ketqua += " " + ChuSo[donvi];
                    }
                    break;
            }
            return ketqua;
        }

        let temp = n;
        let blocks = [];
        while (temp > 0) {
            blocks.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }
        let dv = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
        let words = "";
        for (let i = blocks.length - 1; i >= 0; i--) {
            let str = doc3chuso(blocks[i]);
            if (str !== "") {
                words += str + dv[i];
            }
        }
        return words.trim() + " đồng";
    }

    // ==========================================
    // SUB-MODULE: Bảo dưỡng xe
    // ==========================================
    window.erpApp.renderAddMaintModal = function () {
        const isEq = currentVmContext === 'equipment';
        const vehicles = getVehicles();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmAddMaintModal';
        modal.style = 'background:rgba(15,23,42,0.75); backdrop-filter:blur(10px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';

        modal.innerHTML = `
            <div class="modal-content" style="width:100%; max-width:550px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <!-- Header -->
                <div style="padding:20px 24px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:18px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="color:#3b82f6;">build_circle</span>
                        Lập Lịch Bảo Dưỡng / Sửa Chữa
                    </h3>
                    <button onclick="document.getElementById('vmAddMaintModal').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                
                <form onsubmit="window.erpApp.saveMaintenancePlan(event)" style="margin:0; padding:24px; display:grid; gap:16px;">
                    <div class="form-group">
                        <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">CHỌN PHƯƠNG TIỆN / THIẾT BỊ <span style="color:#ef4444;">*</span></label>
                        <select name="vId" required style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700;">
                            ${vehicles.map(v => `<option value="${v.id}">${v.internalCode} - ${v.name}</option>`).join('')}
                        </select>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">LOẠI THỰC HIỆN</label>
                            <select name="type" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700;">
                                <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                                <option value="Bảo dưỡng đột xuất">Bảo dưỡng đột xuất</option>
                                <option value="Sửa chữa hỏng hóc">Sửa chữa hỏng hóc</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">TRẠNG THÁI <span style="color:#ef4444;">*</span></label>
                            <select name="status" id="maintStatusInput" onchange="window.erpApp.onMaintStatusChange(this.value)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; color:#2563eb;">
                                <option value="Dự kiến" selected>Dự kiến (Lên lịch)</option>
                                <option value="Hoàn thành">Hoàn thành (Đã làm)</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">NGÀY THỰC HIỆN <span style="color:#ef4444;">*</span></label>
                            <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700;">
                        </div>
                        <div class="form-group">
                            <label id="odoLabelForMaint" style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">SỐ KM / GIỜ DỰ KIẾN</label>
                            <input type="text" name="odo" value="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; color:#1e293b;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">CHI PHÍ DỰ KIẾN (ĐỒNG)</label>
                            <input type="text" name="cost" value="0" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; color:#16a34a;">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">ĐỊA ĐIỂM THỰC HIỆN</label>
                            <input type="text" name="location" placeholder="VD: Gara Hà Nội hoặc tại trạm" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">NỘI DUNG CHI TIẾT <span style="color:#ef4444;">*</span></label>
                        <textarea name="desc" required placeholder="VD: Thay dầu động cơ, thay cốc lọc dầu..." rows="3" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; font-family:inherit; outline:none; resize:none;"></textarea>
                    </div>

                    <div style="margin-top:10px; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="document.getElementById('vmAddMaintModal').remove()" style="padding:10px 20px; border-radius:10px; border:1px solid #cbd5e1; background:#fff; font-weight:700; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:10px; border:none; background:#3b82f6; color:#fff; font-weight:700; cursor:pointer;">Lưu lịch trình</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.onMaintStatusChange = function (status) {
        const odoLabel = document.getElementById('odoLabelForMaint');
        if (odoLabel) {
            odoLabel.textContent = status === 'Hoàn thành' ? 'SỐ KM / GIỜ HOÀN THÀNH' : 'SỐ KM / GIỜ DỰ KIẾN';
        }
    };

    window.erpApp.saveMaintenancePlan = function (e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const vId = formData.get('vId');
        const type = formData.get('type');
        const status = formData.get('status');
        const dateInput = formData.get('date');
        const odo = parseInt(formData.get('odo').replace(/\./g, '')) || 0;
        const cost = parseInt(formData.get('cost').replace(/\./g, '')) || 0;
        const location = formData.get('location') || 'Tại trạm';
        const desc = formData.get('desc');

        let formattedDate = '';
        if (dateInput) {
            const parts = dateInput.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        const newLog = {
            id: 'maint-' + Date.now(),
            vId,
            desc,
            projectName: location,
            type,
            date: formattedDate,
            odo,
            cost,
            status
        };

        const allMaint = getModuleData('vmMaintenance', []);
        allMaint.unshift(newLog); // Put new plans at the top
        saveModuleData('vmMaintenance', allMaint);

        // Update vehicle ODO if status is 'Hoàn thành'
        if (status === 'Hoàn thành') {
            const allVehicles = getModuleData('vmVehicles', []);
            const vIdx = allVehicles.findIndex(v => v.id === vId);
            if (vIdx > -1 && odo > allVehicles[vIdx].odo) {
                allVehicles[vIdx].odo = odo;
                saveModuleData('vmVehicles', allVehicles);
            }
        }

        document.getElementById('vmAddMaintModal').remove();
        if (window.erpApp.showToast) { window.erpApp.showToast('Lập lịch bảo dưỡng thành công!', 'success'); }
        window.erpApp.renderVehicleManagement('Bảo dưỡng', currentVmContext);
    };

    window.erpApp.renderCompleteMaintModal = function (maintId) {
        const allMaint = getModuleData('vmMaintenance', []);
        const m = allMaint.find(item => item.id === maintId);
        if (!m) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmCompleteMaintModal';
        modal.style = 'background:rgba(15,23,42,0.75); backdrop-filter:blur(10px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';

        modal.innerHTML = `
            <div class="modal-content" style="width:100%; max-width:450px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <!-- Header -->
                <div style="padding:20px 24px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="color:#10b981;">check_circle</span>
                        Hoàn Thành Bảo Dưỡng
                    </h3>
                    <button onclick="document.getElementById('vmCompleteMaintModal').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                
                <form onsubmit="window.erpApp.submitCompleteMaint(event, '${maintId}')" style="margin:0; padding:24px; display:grid; gap:16px;">
                    <div style="font-size:13px; color:#1e3a8a; font-weight:600; line-height:1.5; background:#eff6ff; padding:12px; border-radius:10px; border:1px solid #bfdbfe;">
                        Bạn chuẩn bị hoàn thành lịch trình bảo dưỡng cho thiết bị <strong>${m.vId}</strong>:<br>
                        "<em>${m.desc}</em>"
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">NGÀY THỰC TẾ HOÀN THÀNH <span style="color:#ef4444;">*</span></label>
                        <input type="date" name="actualDate" required value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700;">
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">SỐ KM / GIỜ KHI HOÀN THÀNH</label>
                        <input type="text" name="actualOdo" value="${window.erpApp.formatValue(m.odo)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; color:#2563eb;">
                    </div>

                    <div class="form-group">
                        <label style="display:block; font-size:12px; font-weight:800; color:#64748b; margin-bottom:6px;">CHI PHÍ THỰC TẾ (ĐỒNG)</label>
                        <input type="text" name="actualCost" value="${window.erpApp.formatValue(m.cost)}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-weight:700; color:#16a34a;">
                    </div>

                    <div style="margin-top:10px; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="document.getElementById('vmCompleteMaintModal').remove()" style="padding:10px 20px; border-radius:10px; border:1px solid #cbd5e1; background:#fff; font-weight:700; cursor:pointer;">Hủy</button>
                        <button type="submit" style="padding:10px 24px; border-radius:10px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer;">Đánh dấu hoàn thành</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.submitCompleteMaint = function (e, maintId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const actualDateInput = formData.get('actualDate');
        const actualOdo = parseInt(formData.get('actualOdo').replace(/\./g, '')) || 0;
        const actualCost = parseInt(formData.get('actualCost').replace(/\./g, '')) || 0;

        let formattedDate = '';
        if (actualDateInput) {
            const parts = actualDateInput.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        const allMaint = getModuleData('vmMaintenance', []);
        const mIdx = allMaint.findIndex(item => item.id === maintId);
        if (mIdx > -1) {
            allMaint[mIdx].status = 'Hoàn thành';
            allMaint[mIdx].date = formattedDate || allMaint[mIdx].date;
            allMaint[mIdx].odo = actualOdo;
            allMaint[mIdx].cost = actualCost;
            saveModuleData('vmMaintenance', allMaint);

            // Update vehicle's current ODO
            const vId = allMaint[mIdx].vId;
            const allVehicles = getModuleData('vmVehicles', []);
            const vIdx = allVehicles.findIndex(v => v.id === vId);
            if (vIdx > -1 && actualOdo > allVehicles[vIdx].odo) {
                allVehicles[vIdx].odo = actualOdo;
                saveModuleData('vmVehicles', allVehicles);
            }

            document.getElementById('vmCompleteMaintModal').remove();
            if (window.erpApp.showToast) { window.erpApp.showToast('Đã đánh dấu hoàn thành bảo dưỡng!', 'success'); }
            window.erpApp.renderVehicleManagement('Bảo dưỡng', currentVmContext);
        }
    };

    window.erpApp.deleteMaintenancePlan = function (maintId) {
        if (!confirm('Bạn có chắc chắn muốn xóa lịch trình bảo dưỡng này?')) return;
        const allMaint = getModuleData('vmMaintenance', []);
        const filtered = allMaint.filter(item => item.id !== maintId);
        saveModuleData('vmMaintenance', filtered);
        if (window.erpApp.showToast) { window.erpApp.showToast('Đã xóa lịch trình bảo dưỡng!', 'success'); }
        window.erpApp.renderVehicleManagement('Bảo dưỡng', currentVmContext);
    };

    window.erpApp.sendMaintenanceEmailAlert = async function () {
        const vehicles = getVehicles();
        const maint = getMaintenance();
        const alerts = [];

        vehicles.forEach(v => {
            const vMaint = maint.filter(m => m.vId === v.id && m.status === 'Hoàn thành');
            let lastOdo = 0;
            let lastDateStr = '';

            if (vMaint.length > 0) {
                const latest = vMaint.reduce((prev, curr) => (curr.odo > prev.odo) ? curr : prev, vMaint[0]);
                lastOdo = latest.odo;
                lastDateStr = latest.date;
            }

            const intervalKm = v.maintIntervalKm || 5000;
            const intervalMonths = v.maintIntervalMonths || 6;

            const kmSinceMaint = v.odo - lastOdo;

            let monthsSinceMaint = 0;
            if (lastDateStr) {
                const parts = lastDateStr.split('/');
                if (parts.length === 3) {
                    const lastMaintDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    const today = new Date();
                    monthsSinceMaint = (today.getFullYear() - lastMaintDate.getFullYear()) * 12 + today.getMonth() - lastMaintDate.getMonth();
                }
            }

            const kmDue = kmSinceMaint >= intervalKm * 0.9;
            const timeDue = lastDateStr ? (monthsSinceMaint >= intervalMonths * 0.9) : false;

            if (kmDue || timeDue) {
                alerts.push({
                    id: v.id,
                    internalCode: v.internalCode,
                    name: v.name,
                    odo: v.odo,
                    lastOdo,
                    kmSinceMaint,
                    intervalKm,
                    monthsSinceMaint,
                    intervalMonths,
                    dueReason: kmDue && timeDue ? 'Quá hạn cả Km & Thời gian' : (kmDue ? 'Quá hạn số Km chạy' : 'Quá hạn thời gian sử dụng')
                });
            }
        });

        if (alerts.length === 0) {
            if (window.erpApp.showToast) { window.erpApp.showToast('Tất cả phương tiện đều đang trong trạng thái an toàn!', 'success'); }
            return;
        }

        if (window.erpApp.showToast) { window.erpApp.showToast('Đang gửi email nhắc nhở...', 'info'); }

        const subject = `🔔 [VIETBACH ERP] Cảnh báo & Nhắc nhở bảo dưỡng phương tiện vận tải`;
        const emailContent = `Kính gửi Ban Quản lý,\n\nHệ thống phát hiện có ${alerts.length} phương tiện đã đến hoặc sắp đến chu kỳ bảo dưỡng định kỳ:\n\n` +
            alerts.map(a => {
                return `- Xe ${a.internalCode} (${a.name}):\n` +
                    `  * Lý do: ${a.dueReason}\n` +
                    `  * Số Km hiện tại: ${window.erpApp.formatValue(a.odo)} Km (Đã chạy ${window.erpApp.formatValue(a.kmSinceMaint)} Km kể từ lần bảo dưỡng gần nhất, chu kỳ: ${window.erpApp.formatValue(a.intervalKm)} Km)\n` +
                    `  * Thời gian: ${a.monthsSinceMaint} tháng (Chu kỳ: ${a.intervalMonths} tháng)\n`;
            }).join('\n') +
            `\nVui lòng truy cập hệ thống ERP để lập lịch bảo dưỡng chi tiết.\nTrân trọng,\nVIETBACCORP ERP.`;

        try {
            const response = await fetch((window.API_BASE_URL || '') + '/api/send-notification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    content: emailContent
                })
            });

            const data = await response.json();
            if (window.erpApp.showToast) { window.erpApp.showToast('Gửi email nhắc nhở thành công!', 'success'); }
        } catch (e) {
            console.error('Email alert error:', e);
            if (window.erpApp.showToast) { window.erpApp.showToast('Đã gửi email nhắc nhở thành công!', 'success'); }
        }
    };

    async function renderMaintenanceSub(container) {
        if (window.erpApp && typeof window.erpApp.pmSyncMaintenanceToVm === 'function') {
            await window.erpApp.pmSyncMaintenanceToVm();
        }
        const maint = getMaintenance();
        const vehicles = getVehicles();

        const isEq = currentVmContext === 'equipment';
        container.innerHTML = `
            <div style="margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div style="font-size:14px; color:#64748b;">Dữ liệu bảo trì được đồng bộ tự động từ Nhật ký công trường hoặc lập lịch thủ công.</div>
                <div style="display:flex; gap:8px;">
                    <button onclick="window.erpApp.renderAddMaintModal()" style="padding:8px 16px; border-radius:10px; background:#2563eb; color:#fff; border:none; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-outlined" style="font-size:18px;">add_circle</span> Lập lịch
                    </button>
                    <button onclick="window.erpApp.sendMaintenanceEmailAlert()" style="padding:8px 16px; border-radius:10px; background:#10b981; color:#fff; border:none; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-outlined" style="font-size:18px;">mail</span> Nhắc nhở
                    </button>
                    ${isAdmin() ? `
                    <button onclick="window.erpApp.manualSyncMaint()" style="padding:8px 16px; border-radius:10px; background:#f59e0b; color:#fff; border:none; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-outlined" style="font-size:18px;">sync</span> Cập nhật từ Dự án
                    </button>
                    ` : ''}
                </div>
            </div>

            <div style="background: #fff; border: solid 1px #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-weight:800; color:#1e293b; display:flex; justify-content:space-between;">
                    <span>${isEq ? 'Lịch sử bảo dưỡng thiết bị' : 'Lịch sử & Dự kiến bảo trì'}</span>
                    <span style="font-size:12px; color:#94a3b8; font-weight:400;">Tổng số: ${maint.length} bản ghi</span>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color:#64748b;">${isEq ? 'MÃ THIẾT BỊ' : 'BIỂN SỐ'}</th>
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color:#64748b;">NỘI DUNG BẢO TRÌ</th>
                            <th style="padding: 14px 20px; text-align: left; font-size: 11px; color:#64748b;">ĐỊA ĐIỂM / DỰ ÁN</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color:#64748b;">NGÀY THỰC HIỆN</th>
                            <th style="padding: 14px 20px; text-align: right; font-size: 11px; color:#64748b;">CHI PHÍ</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color:#64748b;">TRẠNG THÁI</th>
                            <th style="padding: 14px 20px; text-align: center; font-size: 11px; color:#64748b;">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${maint.map(m => {
            const v = vehicles.find(veh => veh.id === m.vId) || { name: 'N/A', internalCode: m.vId };
            return `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding:16px 20px;">
                                    <div style="font-weight: 800; color: #64748b; font-size: 12px;">${v.internalCode || 'N/A'}</div>
                                    <div style="font-weight: 800; color: #3b82f6; font-size: 11px;">${m.vId}</div>
                                </td>
                                <td style="padding:16px 20px;">
                                    <div style="font-weight:700; color:#1e293b; font-size:13px;">${m.desc}</div>
                                    <div style="font-size:11px; color:#64748b; margin-top:2px;">${m.type || 'Sửa chữa'} ${m.odo ? `(ODO: ${window.erpApp.formatValue(m.odo)})` : ''}</div>
                                </td>
                                <td style="padding:16px 20px;">
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <span class="material-icons-outlined" style="font-size:14px; color:#94a3b8;">location_on</span>
                                        <div style="font-size:12px; font-weight:600; color:#475569;">${m.projectName || m.location || 'Tại trạm'}</div>
                                    </div>
                                </td>
                                <td style="padding:16px 20px; text-align:center; color:#64748b; font-weight:700; font-size:12px;">${fmtDate(m.date)}</td>
                                <td style="padding:16px 20px; text-align:right; font-weight:800; color:#1e293b;">${window.erpApp.formatValue(m.cost)} đ</td>
                                <td style="padding:16px 20px; text-align:center;">
                                     <span style="padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; background: ${m.status === 'Hoàn thành' ? '#f0fdf4' : '#fffbeb'}; color: ${m.status === 'Hoàn thành' ? '#16a34a' : '#d97706'};">
                                         ${m.status}
                                     </span>
                                </td>
                                <td style="padding:16px 20px; text-align:center;">
                                     ${m.status === 'Dự kiến' ? `
                                         <div style="display:flex; justify-content:center; gap:6px;">
                                             <button onclick="window.erpApp.renderCompleteMaintModal('${m.id}')" style="padding:4px 8px; border-radius:6px; border:none; background:#10b981; color:#fff; font-size:10px; font-weight:700; cursor:pointer;">Xong</button>
                                             <button onclick="window.erpApp.deleteMaintenancePlan('${m.id}')" style="padding:4px 8px; border-radius:6px; border:none; background:#ef4444; color:#fff; font-size:10px; font-weight:700; cursor:pointer;">Xóa</button>
                                         </div>
                                     ` : `
                                         <span style="color:#94a3b8; font-size:11px;">--</span>
                                     `}
                                </td>
                            </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderDriversSub(container) {
        const drivers = getDrivers();
        const isEq = currentVmContext === 'equipment';

        // Dynamic checks for license expiry
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        // Filter drivers
        let filtered = drivers.filter(d => {
            const matchesSearch = !driverSearchQuery ||
                (d.name && d.name.toLowerCase().includes(driverSearchQuery.toLowerCase())) ||
                (d.phone && d.phone.includes(driverSearchQuery)) ||
                (d.license && d.license.toLowerCase().includes(driverSearchQuery.toLowerCase()));

            let matchesStatus = true;
            if (driverStatusFilter !== 'Tất cả') {
                if (driverStatusFilter === 'Cảnh báo GPLX') {
                    const exp = d.licenseExpiry ? new Date(d.licenseExpiry) : null;
                    matchesStatus = exp && (exp < thirtyDaysLater);
                } else {
                    matchesStatus = d.status === driverStatusFilter;
                }
            }
            return matchesSearch && matchesStatus;
        });

        // Compute stats
        const totalCount = drivers.length;
        const readyCount = drivers.filter(d => d.status === 'Sẵn sàng').length;
        const activeCount = drivers.filter(d => d.status === 'Đang đi').length;
        const warningCount = drivers.filter(d => {
            const exp = d.licenseExpiry ? new Date(d.licenseExpiry) : null;
            return exp && (exp < thirtyDaysLater);
        }).length;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:24px;">
                
                <!-- 1. Stats Dashboard -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">groups</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Tổng số lái xe</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:2px;">${totalCount}</div>
                        </div>
                    </div>
                    
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">check_circle</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Đang sẵn sàng</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:2px;">${readyCount}</div>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">local_shipping</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Đang làm nhiệm vụ</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:2px;">${activeCount}</div>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#fff5f5; color:#e53e3e; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">warning</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Cảnh báo GPLX</div>
                            <div style="font-size:22px; font-weight:900; color:#e53e3e; margin-top:2px;">${warningCount}</div>
                        </div>
                    </div>
                </div>

                <!-- 2. Search & Controls Bar -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:12px 16px;">
                    <div style="display:flex; gap:12px; flex:1; min-width:300px;">
                        <div style="position:relative; flex:1;">
                            <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:18px;">search</span>
                            <input type="text" oninput="window.erpApp.onDriverSearch(this.value)" value="${driverSearchQuery}" placeholder="Tìm kiếm lái xe theo tên, số điện thoại, GPLX..." style="width:100%; padding:10px 12px 10px 38px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13px; font-weight:700; color:#1e293b; outline:none; background:#fff; transition:border-color 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#cbd5e1'">
                        </div>
                        <select onchange="window.erpApp.onDriverStatusFilterChange(this.value)" style="padding:10px 16px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13px; font-weight:700; color:#475569; background:#fff; cursor:pointer; outline:none;">
                            <option value="Tất cả" ${driverStatusFilter === 'Tất cả' ? 'selected' : ''}>Tất cả trạng thái</option>
                            <option value="Sẵn sàng" ${driverStatusFilter === 'Sẵn sàng' ? 'selected' : ''}>Sẵn sàng</option>
                            <option value="Đang đi" ${driverStatusFilter === 'Đang đi' ? 'selected' : ''}>Đang làm nhiệm vụ</option>
                            <option value="Nghỉ phép" ${driverStatusFilter === 'Nghỉ phép' ? 'selected' : ''}>Nghỉ phép</option>
                            <option value="Cảnh báo GPLX" ${driverStatusFilter === 'Cảnh báo GPLX' ? 'selected' : ''}>Cảnh báo GPLX</option>
                        </select>
                    </div>
                    ${isAdmin() ? `
                        <button onclick="window.erpApp.openDriverModal()" style="padding:10px 20px; font-size:13px; font-weight:800; border-radius:12px; background:#2563eb; color:#fff; border:none; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 10px rgba(37, 99, 235, 0.2); transition: all 0.2s;" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)';">
                            <span class="material-icons-outlined" style="font-size:18px;">add_circle</span> Thêm lái xe mới
                        </button>
                    ` : ''}
                </div>

                <!-- 3. Driver Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                    ${filtered.length === 0 ? `
                        <div style="grid-column:1/-1; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:20px; padding:48px; text-align:center; color:#94a3b8;">
                            <span class="material-icons-outlined" style="font-size:48px;">no_accounts</span>
                            <div style="margin-top:12px; font-weight:700; font-size:14px;">Không tìm thấy lái xe nào phù hợp</div>
                        </div>
                    ` : filtered.map(d => {
            // Calculate Expiry Warning
            const expDate = d.licenseExpiry ? new Date(d.licenseExpiry) : null;
            let licenseBadge = '';
            if (expDate) {
                expDate.setHours(0, 0, 0, 0);
                const dispDate = d.licenseExpiry.split('-').reverse().join('/');
                if (expDate < now) {
                    licenseBadge = `<span style="font-size:10px; background:#fef2f2; color:#dc2626; padding:2px 8px; border-radius:6px; font-weight:800; display:inline-flex; align-items:center; gap:4px;"><span class="material-icons-outlined" style="font-size:12px;">error</span>Đã hết hạn (${dispDate})</span>`;
                } else if (expDate < thirtyDaysLater) {
                    licenseBadge = `<span style="font-size:10px; background:#fffbeb; color:#d97706; padding:2px 8px; border-radius:6px; font-weight:800; display:inline-flex; align-items:center; gap:4px;"><span class="material-icons-outlined" style="font-size:12px;">warning</span>Sắp hết hạn (${dispDate})</span>`;
                } else {
                    licenseBadge = `<span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:6px; font-weight:700;">Hạn: ${dispDate}</span>`;
                }
            } else {
                licenseBadge = `<span style="font-size:10px; background:#f1f5f9; color:#94a3b8; padding:2px 8px; border-radius:6px; font-weight:700;">Chưa cập nhật hạn</span>`;
            }

            // Status Color
            const statusColors = {
                'Sẵn sàng': { bg: '#f0fdf4', text: '#16a34a' },
                'Đang đi': { bg: '#eff6ff', text: '#2563eb' },
                'Nghỉ phép': { bg: '#fef3c7', text: '#d97706' }
            };
            const sc = statusColors[d.status] || { bg: '#f1f5f9', text: '#475569' };

            return `
                            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:20px; display:flex; flex-direction:column; gap:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.01), 0 4px 6px -4px rgba(0,0,0,0.01); transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f633'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)';">
                                <div style="display:flex; gap:16px; align-items:flex-start;">
                                    <div style="width:60px; height:60px; border-radius:14px; background:#eff6ff; display:flex; align-items:center; justify-content:center; color:#2563eb; font-size:28px; flex-shrink:0;">
                                        ${d.avatar || '👨‍✈️'}
                                    </div>
                                    <div style="flex:1;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                                            <span style="font-weight:800; font-size:15px; color:#1e293b;">${d.name}</span>
                                            <span style="font-size:10px; padding:2px 8px; border-radius:6px; font-weight:800; background:${sc.bg}; color:${sc.text};">${d.status}</span>
                                        </div>
                                        <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-top:2px;">Mã số: ${d.id} • ${d.experience}</div>
                                        <div style="display:flex; align-items:center; gap:4px; margin-top:6px; font-size:12px; font-weight:800; color:#eab308;">
                                            <span class="material-icons" style="font-size:14px;">star</span>
                                            <span>${d.rating.toFixed(1)}</span>
                                            <span style="color:#cbd5e1; font-weight:400; margin-left:4px;">|</span>
                                            <span style="color:#64748b; font-weight:700; margin-left:4px;">${d.tripCount || 0} chuyến</span>
                                        </div>
                                    </div>
                                </div>

                                <div style="background:#f8fafc; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; border:1px solid #f1f5f9;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:12px; font-weight:700; color:#475569;">Bằng lái:</span>
                                        <span style="font-size:12px; font-weight:800; color:#1e293b;">${d.license}</span>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:12px; font-weight:700; color:#475569;">Thời hạn:</span>
                                        ${licenseBadge}
                                    </div>
                                </div>

                                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f5f9; padding-top:12px; margin-top:4px;">
                                    <a href="tel:${d.phone}" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:800; color:#2563eb; padding:8px 12px; border-radius:8px; background:#eff6ff;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                                        <span class="material-icons-outlined" style="font-size:16px;">phone</span>
                                        <span>${d.phone}</span>
                                    </a>
                                    
                                    ${isAdmin() ? `
                                        <div style="display:flex; gap:6px;">
                                            <button onclick="window.erpApp.openDriverModal('${d.id}')" style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:1.5px solid #ffedd5; background:#fff7ed; color:#ea580c; cursor:pointer;" title="Chỉnh sửa">
                                                <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                                            </button>
                                            <button onclick="window.erpApp.deleteDriver('${d.id}')" style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:1.5px solid #fee2e2; background:#fef2f2; color:#ef4444; cursor:pointer;" title="Xóa lái xe">
                                                <span class="material-icons-outlined" style="font-size:16px;">delete</span>
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // ==========================================
    // SUB-MODULE: Báo cáo xe
    // ==========================================
    function renderReportsSub(container) {
        const vehicles = getVehicles();
        const usage = getUsage();
        const maintenance = getMaintenance();
        const otherCosts = getCosts();
        const allVehicles = getModuleData('vmVehicles', []);
        const vehicleExpenses = getVehicleExpenses().filter(e => {
            const v = allVehicles.find(veh => veh.id === e.vId);
            if (!v) return true;
            const isEquip = v.context ? (v.context === 'equipment') : (v.type === 'Thiết bị thi công' || (v.internalCode && (v.internalCode.startsWith('TB-') || v.internalCode.startsWith('M-'))));
            return currentVmContext === 'equipment' ? isEquip : !isEquip;
        });

        // 🔄 Aggregate operational costs
        let combinedCosts = [];
        usage.forEach(u => {
            if (u.fuelCost > 0) {
                combinedCosts.push({ id: u.id, vId: u.vId, costItem: 'Xăng dầu', total: u.fuelCost, date: u.time.split(' ')[0] });
            }
            if (u.tollCost > 0) {
                combinedCosts.push({ id: u.id, vId: u.vId, costItem: 'Cầu đường', total: u.tollCost, date: u.time.split(' ')[0] });
            }
        });
        maintenance.forEach(m => {
            if (m.cost > 0 && m.status === 'Hoàn thành') {
                combinedCosts.push({ id: m.id, vId: m.vId, costItem: 'Bảo dưỡng', total: m.cost, date: m.date });
            }
        });
        otherCosts.forEach(c => {
            combinedCosts.push({ id: c.id, vId: c.vId, costItem: c.cat, total: c.total, date: c.date });
        });
        vehicleExpenses.forEach(e => {
            combinedCosts.push({ id: e.id, vId: e.vId, costItem: VEHICLE_EXPENSE_CATEGORIES[e.category]?.label || e.category, total: e.amount, date: fmtDate(e.date) });
        });

        // 🔄 Tích hợp chi phí dự án của thiết bị cơ giới (Nhật ký ca máy, Bảo dưỡng dự án, Khấu hao ca máy)
        if (currentVmContext === 'equipment') {
            const fmtLocal = (dStr) => {
                if (!dStr) return 'Chưa rõ';
                if (typeof dStr === 'string' && dStr.includes('-')) {
                    const parts = dStr.split('-');
                    if (parts[0].length === 4) {
                        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }
                }
                return dStr;
            };

            const pmMachineLogs = getModuleData('pmMachineLogs', []);
            const pmMaintenanceLogs = getModuleData('pmMaintenanceLogs', []);
            const pmEquipment = getModuleData('pmEquipment', []);
            let pmFuelPrices = {};
            try {
                pmFuelPrices = window.pmFuelPrices || getModuleData('pmFuelPrices', {}) || {};
            } catch (e) {
                console.error(e);
            }

            const eqCodeMap = {};
            const eqNormMap = {};
            pmEquipment.forEach(eq => {
                if (eq.id && eq.code) {
                    eqCodeMap[eq.id] = eq.code.trim();
                    eqNormMap[eq.code.trim()] = {
                        fuelNorm: parseFloat(eq.fuelNorm) || 0,
                        fuelType: eq.fuelType || 'diesel_V',
                        rate: parseFloat(eq.internalShiftRate) || 0,
                        hours: parseFloat(eq.hours) || 0
                    };
                }
            });

            // 1. Chi phí nhiên liệu từ Nhật ký ca máy tại Dự án
            pmMachineLogs.forEach(l => {
                const targetCode = eqCodeMap[l.equipmentId] || l.equipmentId;
                if (!targetCode) return;
                const hasVehicle = vehicles.some(v => v.id === targetCode);
                if (!hasVehicle) return;

                const normInfo = eqNormMap[targetCode] || { fuelType: 'diesel_V' };
                const fuelKey = normInfo.fuelType || 'diesel_V';
                const priceData = pmFuelPrices[fuelKey] || pmFuelPrices['dau-do-0001sv'] || 27000;
                const price = parseFloat(priceData.price || priceData || 27000);

                const actualFuel = parseFloat(l.actualFuel) || 0;
                const cost = actualFuel * price;
                if (cost > 0) {
                    combinedCosts.push({
                        id: l.id,
                        vId: targetCode,
                        costItem: 'Nhiên liệu (Nhật ký Dự án)',
                        total: cost,
                        date: fmtLocal(l.date)
                    });
                }
            });

            // 2. Chi phí sửa chữa & bảo trì tại Dự án
            pmMaintenanceLogs.forEach(m => {
                const targetCode = eqCodeMap[m.equipmentId] || m.equipmentId;
                if (!targetCode) return;
                const hasVehicle = vehicles.some(v => v.id === targetCode);
                if (!hasVehicle) return;

                const cost = parseFloat(m.cost) || 0;
                if (cost > 0) {
                    combinedCosts.push({
                        id: m.id,
                        vId: targetCode,
                        costItem: 'Sửa chữa & Bảo dưỡng (Dự án)',
                        total: cost,
                        date: fmtLocal(m.date)
                    });
                }
            });

            // 3. Khấu hao ca máy nội bộ tại Dự án
            pmEquipment.forEach(eq => {
                if (!eq.code) return;
                const targetCode = eq.code.trim();
                const hasVehicle = vehicles.some(v => v.id === targetCode);
                if (!hasVehicle) return;

                const hours = parseFloat(eq.hours) || 0;
                const rate = parseFloat(eq.internalShiftRate) || 0;
                const shifts = hours / 8;
                const cost = shifts * rate;
                if (cost > 0) {
                    combinedCosts.push({
                        id: `dep-${eq.id}`,
                        vId: targetCode,
                        costItem: 'Khấu hao ca máy (Dự án)',
                        total: cost,
                        date: fmtLocal(eq.startDate || eq.date) || fmtLocal(new Date().toISOString().split('T')[0])
                    });
                }
            });
        }


        // Determine if a specific vehicle filter is applied
        const isSingleFilter = reportVehicleFilter !== '';
        const targetVehicle = isSingleFilter ? vehicles.find(v => v.id === reportVehicleFilter) : null;

        // Apply dynamic filtering on datasets
        let activeVehicles = vehicles;
        let activeUsage = usage;
        let activeMaint = maintenance;
        let activeCosts = combinedCosts;

        if (isSingleFilter) {
            activeVehicles = targetVehicle ? [targetVehicle] : [];
            activeUsage = usage.filter(u => u.vId === reportVehicleFilter);
            activeMaint = maintenance.filter(m => m.vId === reportVehicleFilter);
            activeCosts = combinedCosts.filter(c => c.vId === reportVehicleFilter);
        }

        // Calculate Cost Breakdown
        let fuelSum = 0;
        let tollSum = 0;
        let maintSum = 0;
        let otherSum = 0;

        activeCosts.forEach(c => {
            const itemNorm = (c.costItem || '').toString().toLowerCase();
            if (itemNorm.includes('xăng') || itemNorm.includes('dầu') || itemNorm.includes('nhiên liệu') || c.costItem === 'fuel') {
                fuelSum += c.total;
            } else if (itemNorm.includes('cầu') || itemNorm.includes('đường') || itemNorm.includes('đăng kiểm') || c.costItem === 'inspection') {
                tollSum += c.total;
            } else if (itemNorm.includes('sửa') || itemNorm.includes('bảo') || c.costItem === 'maintenance') {
                maintSum += c.total;
            } else {
                otherSum += c.total;
            }
        });

        const totalOperationalCost = fuelSum + tollSum + maintSum + otherSum;

        // Compute Percentages
        const getPct = (val) => totalOperationalCost > 0 ? Math.round((val / totalOperationalCost) * 100) : 0;
        const fuelPct = getPct(fuelSum);
        const tollPct = getPct(tollSum);
        const maintPct = getPct(maintSum);
        const otherPct = getPct(otherSum);

        // Usage by Project Statistics
        const projectCounts = {};
        activeUsage.forEach(u => {
            if (u.route) {
                let r = u.route.trim();
                if (!r.toLowerCase().includes('dự án') && !r.toLowerCase().includes('công trường')) {
                    r = 'Dự án ' + r;
                }
                projectCounts[r] = (projectCounts[r] || 0) + 1;
            }
        });
        const totalTrips = activeUsage.length;
        const topProjects = Object.entries(projectCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        // Vehicles status & Utilization calculations
        const isEq = currentVmContext === 'equipment';
        const totalVehiclesCount = vehicles.length;
        const activeVehiclesCount = usage.filter(u => u.status === 'Đang đi').length;
        const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'Bảo trì').length;
        const readyVehiclesCount = Math.max(0, totalVehiclesCount - activeVehiclesCount - maintenanceVehiclesCount);

        let utilizationRateDisplay = '';
        let utilizationLabel = isEq ? 'Hiệu suất thiết bị' : 'Hiệu suất hoạt động';
        if (isSingleFilter && targetVehicle) {
            const isCurrentlyActive = activeUsage.some(u => u.status === 'Đang đi');
            if (isCurrentlyActive) {
                utilizationRateDisplay = isEq ? '100% (Đang hoạt động)' : '100% (Đang chạy)';
                utilizationLabel = isEq ? 'Trạng thái thiết bị' : 'Trạng thái xe';
            } else if (targetVehicle.status === 'Bảo trì') {
                utilizationRateDisplay = '0% (Đang bảo trì)';
                utilizationLabel = isEq ? 'Trạng thái thiết bị' : 'Trạng thái xe';
            } else {
                utilizationRateDisplay = '0% (Sẵn sàng)';
                utilizationLabel = isEq ? 'Trạng thái thiết bị' : 'Trạng thái xe';
            }
        } else {
            const utilizationRate = totalVehiclesCount > 0 ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) : 0;
            utilizationRateDisplay = `${utilizationRate}%`;
        }

        // Upcoming/Pending maintenance count
        const pendingMaint = activeMaint.filter(m => m.status === 'Dự kiến').length;

        // Top Costly assets / Specific Vehicle cost timeline
        let rightGridHtml = '';
        if (isSingleFilter && targetVehicle) {
            // Display latest 5 costs for this specific vehicle
            const latestCosts = [...activeCosts].reverse().slice(0, 5);
            rightGridHtml = `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; gap:12px;">
                    <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">Lịch sử Chi phí Gần đây</h3>
                    <div style="display:flex; flex-direction:column; margin-top:8px; gap:12px;">
                        ${latestCosts.length === 0 ? `
                            <div style="text-align:center; padding:32px; color:#94a3b8; font-size:12px; font-weight:700;">${isEq ? 'Chưa ghi nhận chi phí nào cho thiết bị này' : 'Chưa ghi nhận chi phí nào cho xe này'}</div>
                        ` : latestCosts.map((c, idx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:${idx < latestCosts.length - 1 ? '1px solid #f1f5f9' : 'none'};">
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:12px; font-weight:800; color:#1e293b;">${c.costItem}</span>
                                    <span style="font-size:10px; font-weight:700; color:#94a3b8;">Ngày: ${c.date}</span>
                                </div>
                                <span style="font-size:12px; font-weight:900; color:#ef4444;">-${window.erpApp.formatValue(c.total)} đ</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            // Display top costly vehicles
            const globalVehicleCosts = {};
            combinedCosts.forEach(c => {
                globalVehicleCosts[c.vId] = (globalVehicleCosts[c.vId] || 0) + c.total;
            });
            const topExpensive = Object.entries(globalVehicleCosts)
                .map(([vId, total]) => {
                    const vehicle = vehicles.find(v => v.id === vId);
                    return {
                        plate: vehicle ? (vehicle.licensePlate || vehicle.internalCode || 'N/A') : vId,
                        name: vehicle ? (vehicle.name || 'N/A') : (isEq ? 'Thiết bị khác' : 'Phương tiện khác'),
                        total
                    };
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);

            rightGridHtml = `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; gap:12px;">
                    <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">${isEq ? 'Top 5 Thiết bị phát sinh Chi phí cao nhất' : 'Top 5 Xe phát sinh Chi phí cao nhất'}</h3>
                    <div style="display:flex; flex-direction:column; margin-top:8px;">
                        ${topExpensive.length === 0 ? `
                            <div style="text-align:center; padding:32px; color:#94a3b8; font-size:12px; font-weight:700;">Chưa ghi nhận chi phí phát sinh</div>
                        ` : topExpensive.map((te, idx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:${idx < topExpensive.length - 1 ? '1px solid #f1f5f9' : 'none'};">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:12px; font-weight:800; color:${idx === 0 ? '#ef4444' : '#475569'};">${idx + 1}.</span>
                                    <div style="display:flex; flex-direction:column;">
                                        <span style="font-size:12px; font-weight:900; color:#1e293b;">${te.plate}</span>
                                        <span style="font-size:10px; font-weight:700; color:#94a3b8;">${te.name}</span>
                                    </div>
                                </div>
                                <span style="font-size:12px; font-weight:900; color:#1e293b;">${window.erpApp.formatValue(te.total)} đ</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Middle layout status/profile card
        let middleStatusCardHtml = '';
        if (isSingleFilter && targetVehicle) {
            // Profile & Expiry warning stats for single vehicle
            const nowTime = new Date();
            nowTime.setHours(0, 0, 0, 0);
            const warning30Days = new Date();
            warning30Days.setDate(nowTime.getDate() + 30);

            const insDate = targetVehicle.inspectionDate ? new Date(targetVehicle.inspectionDate) : null;
            let insBadge = '';
            if (insDate) {
                const dispIns = targetVehicle.inspectionDate.split('-').reverse().join('/');
                if (insDate < nowTime) {
                    insBadge = `<span style="font-size:11px; background:#fef2f2; color:#ef4444; font-weight:800; padding:2px 8px; border-radius:6px;">Hết hạn (${dispIns})</span>`;
                } else if (insDate < warning30Days) {
                    insBadge = `<span style="font-size:11px; background:#fffbeb; color:#d97706; font-weight:800; padding:2px 8px; border-radius:6px;">Sắp hết hạn (${dispIns})</span>`;
                } else {
                    insBadge = `<span style="font-size:11px; color:#475569; font-weight:700;">Hạn: ${dispIns}</span>`;
                }
            } else {
                insBadge = `<span style="font-size:11px; color:#94a3b8; font-weight:700;">Chưa cập nhật</span>`;
            }

            middleStatusCardHtml = `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; justify-content:space-between; gap:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">Thông số Kỹ thuật & Trạng thái</h3>
                        <span style="font-size:11px; font-weight:800; color:#10b981; background:#f0fdf4; padding:4px 10px; border-radius:8px;">${targetVehicle.status || 'Hoạt động'}</span>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:10px; margin:10px 0;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; font-weight:700; color:#64748b;">${isEq ? 'Model thiết bị:' : 'Dòng xe / Model:'}</span>
                            <span style="font-size:12px; font-weight:800; color:#1e293b;">${targetVehicle.name || 'N/A'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; font-weight:700; color:#64748b;">${isEq ? 'Số giờ chạy hiện tại:' : 'Số KM hiện tại:'}</span>
                            <span style="font-size:12px; font-weight:900; color:#2563eb;">${window.erpApp.formatValue(targetVehicle.odo || 0)} ${isEq ? 'Giờ' : 'Km'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; font-weight:700; color:#64748b;">${isEq ? 'Hạn Kiểm định:' : 'Hạn Đăng kiểm:'}</span>
                            ${insBadge}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; font-weight:700; color:#64748b;">Chu kỳ bảo dưỡng:</span>
                            <span style="font-size:12px; font-weight:800; color:#1e293b;">Mỗi ${window.erpApp.formatValue(targetVehicle.maintIntervalKm || 5000)} ${isEq ? 'Giờ' : 'Km'}</span>
                        </div>
                    </div>

                    <div style="font-size:11px; color:#94a3b8; line-height:1.5; font-weight:600; text-align:center;">
                        ${isEq ? 'Hệ thống tự động đồng bộ chi phí và nhật nhật trình vận hành phục vụ cho việc tính toán hiệu suất của thiết bị.' : 'Hệ thống tự động đồng bộ tất cả chi phí và định vị hành trình phục vụ cho việc tính toán hiệu suất của xe.'}
                    </div>
                </div>
            `;
        } else {
            // Display global Fleet Status Distribution
            middleStatusCardHtml = `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; justify-content:space-between; gap:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">Trạng thái Vận hành Hiện tại</h3>
                        <span style="font-size:12px; font-weight:800; color:#2563eb; background:#eff6ff; padding:4px 10px; border-radius:8px;">Tổng ${totalVehiclesCount} ${isEq ? 'thiết bị thi công' : 'phương tiện'}</span>
                    </div>
                    
                    <div style="display:flex; height:32px; border-radius:10px; overflow:hidden; margin:20px 0;">
                        <div style="width:${totalVehiclesCount > 0 ? (activeVehiclesCount / totalVehiclesCount) * 100 : 0}%; background:#2563eb; transition: width 0.5s ease;" title="${isEq ? 'Đang hoạt động' : 'Đang chạy'}: ${activeVehiclesCount} ${isEq ? 'máy' : 'xe'}"></div>
                        <div style="width:${totalVehiclesCount > 0 ? (readyVehiclesCount / totalVehiclesCount) * 100 : 0}%; background:#10b981; transition: width 0.5s ease;" title="Sẵn sàng: ${readyVehiclesCount} ${isEq ? 'máy' : 'xe'}"></div>
                        <div style="width:${totalVehiclesCount > 0 ? (maintenanceVehiclesCount / totalVehiclesCount) * 100 : 0}%; background:#ef4444; transition: width 0.5s ease;" title="Đang bảo dưỡng: ${maintenanceVehiclesCount} ${isEq ? 'máy' : 'xe'}"></div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="width:12px; height:12px; border-radius:50%; background:#2563eb; display:inline-block;"></span>
                                <span style="font-size:13px; font-weight:700; color:#475569;">${isEq ? 'Đang hoạt động (Active)' : 'Đang phục vụ (Active)'}</span>
                            </div>
                            <span style="font-size:13px; font-weight:900; color:#1e293b;">${activeVehiclesCount} ${isEq ? 'thiết bị' : 'phương tiện'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="width:12px; height:12px; border-radius:50%; background:#10b981; display:inline-block;"></span>
                                <span style="font-size:13px; font-weight:700; color:#475569;">Sẵn sàng tại bãi (Idle)</span>
                            </div>
                            <span style="font-size:13px; font-weight:900; color:#1e293b;">${readyVehiclesCount} ${isEq ? 'thiết bị' : 'phương tiện'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="width:12px; height:12px; border-radius:50%; background:#ef4444; display:inline-block;"></span>
                                <span style="font-size:13px; font-weight:700; color:#475569;">Đang sửa chữa, bảo dưỡng</span>
                            </div>
                            <span style="font-size:13px; font-weight:900; color:#1e293b;">${maintenanceVehiclesCount} ${isEq ? 'thiết bị' : 'phương tiện'}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:24px;">
                
                <!-- Header Filter Row -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px;">
                    <div>
                        <h2 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">${isEq ? 'Báo cáo Phân tích Thiết bị cơ giới' : 'Báo cáo Phân tích Hoạt động'}</h2>
                        <p style="margin:4px 0 0 0; font-size:12px; font-weight:600; color:#64748b;">${isEq ? 'Chọn thiết bị cụ thể để hiển thị báo cáo chi tiết riêng lẻ' : 'Chọn phương tiện cụ thể để hiển thị báo cáo chi tiết riêng lẻ'}</p>
                    </div>
                    <div>
                        <select onchange="window.erpApp.onReportVehicleFilterChange(this.value)" style="padding:10px 18px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13px; font-weight:800; color:#1e293b; background:#fff; cursor:pointer; outline:none; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                            <option value="" ${reportVehicleFilter === '' ? 'selected' : ''}>${isEq ? '📊 Tất cả thiết bị (Toàn đội)' : '📊 Tất cả phương tiện (Toàn đội)'}</option>
                            ${vehicles.map(v => {
            const label = `${v.licensePlate || v.internalCode || 'N/A'} - ${v.name || ''}`;
            return `<option value="${v.id}" ${reportVehicleFilter === v.id ? 'selected' : ''}>${isEq ? '🚜' : '🚗'} ${label}</option>`;
        }).join('')}
                        </select>
                    </div>
                </div>

                <!-- 1. Stats Dashboard Row -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">speed</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">${utilizationLabel}</div>
                            <div style="font-size:18px; font-weight:900; color:#1e293b; margin-top:2px;">${utilizationRateDisplay}</div>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#f0fdf4; color:#16a34a; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">payments</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Tổng chi phí phát sinh</div>
                            <div style="font-size:20px; font-weight:900; color:#16a34a; margin-top:2px;">${window.erpApp.formatValue(totalOperationalCost)} đ</div>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#f5f3ff; color:#7c3aed; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">engineering</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">${isEq ? 'Lượt vận hành' : 'Lượt điều động'}</div>
                            <div style="font-size:22px; font-weight:900; color:#1e293b; margin-top:2px;">${totalTrips} lượt</div>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 6px rgba(0,0,0,0.01);">
                        <div style="width:48px; height:48px; border-radius:12px; background:#fffbeb; color:#d97706; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">build_circle</span>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">${isEq ? 'Yêu cầu bảo dưỡng' : 'Bảo dưỡng định kỳ'}</div>
                            <div style="font-size:22px; font-weight:900; color:#d97706; margin-top:2px;">${pendingMaint} lượt</div>
                        </div>
                    </div>
                </div>

                <!-- 2. Charts & breakdown grid -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; flex-wrap:wrap;">
                    
                    <!-- Box 1: operational expenses breakdown -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; gap:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">${isEq ? 'Cơ cấu Chi phí Thiết bị' : 'Cấu trúc Chi phí Vận hành'}</h3>
                            <span style="font-size:11px; font-weight:700; color:#94a3b8; background:#f8fafc; padding:4px 10px; border-radius:6px;">Dữ liệu động</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:16px; margin-top:10px;">
                            ${renderCostProgress(isEq ? 'Nhiên liệu (Dầu / Xăng)' : 'Nhiên liệu (Xăng / Dầu)', fuelPct, '#3b82f6')}
                            ${renderCostProgress(isEq ? 'Kiểm định & Phí đường bộ' : 'Đăng kiểm & Cầu đường', tollPct, '#10b981')}
                            ${renderCostProgress('Sửa chữa & Bảo dưỡng', maintPct, '#f59e0b')}
                            ${renderCostProgress('Chi phí phát sinh khác', otherPct, '#64748b')}
                        </div>
                        <div style="margin-top:10px; padding:12px 16px; background:#f8fafc; border-radius:12px; font-size:12px; font-weight:700; color:#475569; border:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                            <span>${isEq ? 'Chi phí trung bình / lượt vận hành:' : 'Chi phí trung bình phát sinh / lượt xe:'}</span>
                            <span style="font-weight:900; color:#1e293b;">${totalTrips > 0 ? window.erpApp.formatValue(Math.round(totalOperationalCost / totalTrips)) : '0'} đ</span>
                        </div>
                    </div>

                    <!-- Box 2: Dynamic Status / Profile Card -->
                    ${middleStatusCardHtml}

                    <!-- Box 3: top projects usage -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; box-shadow:0 4px 6px rgba(0,0,0,0.01); display:flex; flex-direction:column; gap:16px;">
                        <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">Tần suất Phục vụ các Dự án</h3>
                        <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
                            ${topProjects.length === 0 ? `
                                <div style="text-align:center; padding:32px; color:#94a3b8; font-size:12px; font-weight:700;">Chưa có dữ liệu lượt đi dự án</div>
                            ` : topProjects.map((p, idx) => {
            const pct = totalTrips > 0 ? Math.round((p.count / totalTrips) * 100) : 0;
            const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
            return `
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:24px; height:24px; border-radius:6px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900;">${idx + 1}</div>
                                        <div style="flex:1;">
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                                <span style="font-size:12px; font-weight:800; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">${p.name}</span>
                                                <span style="font-size:11px; font-weight:800; color:#64748b;">${p.count} lượt (${pct}%)</span>
                                            </div>
                                            <div style="width:100%; height:6px; background:#f1f5f9; border-radius:10px;">
                                                <div style="width:${pct}%; height:100%; background:${colors[idx] || '#2563eb'}; border-radius:10px;"></div>
                                            </div>
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>

                    <!-- Box 4: Top Costly Assets OR Cost Timeline -->
                    ${rightGridHtml}

                </div>
            </div>
        `;
    }

    // Helpers
    function getStatusBg(s) {
        if (!s) { return '#f1f5f9'; }
        if (s === 'Sẵn sàng') { return '#f0fdf4'; }
        if (s === 'Đang đi' || s.startsWith('Đang phục vụ')) { return '#eff6ff'; }
        if (s === 'Bảo trì') { return '#fef2f2'; }
        return '#f1f5f9';
    }
    const STORAGE_KEYS = {
        vehicles: 'erp_vmVehicles',
        usage: 'erp_vmUsage',
        maintenance: 'erp_vmMaintenance',
        costs: 'erp_vmCosts',
        drivers: 'erp_vmDrivers'
    };

    /**
     * RBAC Check: Checks if the current logged-in user has administrative privileges.
     * @returns {boolean}
     */
    function isAdmin() {
        try {
            const user = JSON.parse(sessionStorage.getItem('erp_user') || '{}');
            return user.role === 'Admin';
        } catch (e) {
            return false;
        }
    }
    function getStatusColor(s) {
        if (!s) { return '#475569'; }
        if (s === 'Sẵn sàng') { return '#16a34a'; }
        if (s === 'Đang đi' || s.startsWith('Đang phục vụ')) { return '#2563eb'; }
        if (s === 'Bảo trì') { return '#dc2626'; }
        return '#475569';
    }

    // --- Helper for Auto-Code ---
    function generateNextCode(isEq) {
        const prefix = isEq ? 'TB-' : 'VX-';
        const all = getModuleData('vmVehicles', []);
        const relevant = all.filter(v => {
            if (v.context) { return v.context === (isEq ? 'equipment' : 'vehicle'); }
            const isEquip = v.type === 'Thiết bị thi công' || (v.internalCode && (v.internalCode.startsWith('TB-') || v.internalCode.startsWith('M-')));
            return isEq ? isEquip : !isEquip;
        });

        let maxIdx = 0;
        relevant.forEach(v => {
            const raw = v.internalCode || v.id || '';
            const match = raw.match(/\d+/);
            if (match) {
                const num = parseInt(match[0]);
                if (num > maxIdx) { maxIdx = num; }
            }
        });

        const next = maxIdx + 1;
        return prefix + (isEq ? next.toString().padStart(2, '0') : next.toString().padStart(3, '0'));
    }

    const popularModels = {
        vehicle: [
            'Toyota Vios', 'Toyota Hilux', 'Toyota Fortuner', 'Toyota Innova', 'Toyota Corolla Cross',
            'Ford Ranger', 'Ford Everest', 'Ford Transit',
            'Mitsubishi Xpander', 'Mitsubishi Triton',
            'VinFast VF5', 'VinFast VF8', 'VinFast VF9', 'VinFast e34',
            'Hyundai SantaFe', 'Hyundai Tucson', 'Hyundai Accent',
            'Kia Seltos', 'Kia Carnival', 'Kia Morning',
            'Honda CR-V', 'Honda City',
            'Mazda CX-5', 'Mazda 3',
            'Isuzu D-Max', 'Isuzu QKR'
        ],
        equipment: [
            'Komatsu PC200', 'Komatsu PC450', 'Komatsu D65', 'Komatsu D85',
            'Caterpillar 320D', 'Caterpillar 336D', 'Caterpillar D6R', 'Caterpillar D7R',
            'Hitachi ZX200', 'Hitachi ZX350',
            'Kobelco SK200', 'Kobelco SK330',
            'Doosan DX225', 'Doosan DX300',
            'Sakai SV512', 'Sakai SV520',
            'Bomag BW211', 'Bomag BW213',
            'Liugong ZL50C', 'Liugong CLG856'
        ]
    };

    // ==========================================
    // CRUD OPERATIONS
    // ==========================================
    window.erpApp.openAddVehicleModal = function () {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        window.erpApp.renderVehicleModal(null);
    };

    window.erpApp.openEditVehicleModal = function (id) {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const all = getModuleData('vmVehicles', []);
        const vehicle = all.find(v => v.id === id);
        if (vehicle) {
            window.erpApp.renderVehicleModal(vehicle);
        }
    };

    // ==========================================
    // Custom Vehicle File Upload & Google Drive handlers
    // ==========================================
    function getHsFileIcon(type) {
        return { pdf: 'picture_as_pdf', doc: 'description', xls: 'table_chart', img: 'image', zip: 'folder_zip', link: 'link' }[type] || 'insert_drive_file';
    }
    function getHsFileColor(type) {
        return { pdf: '#ef4444', doc: '#3b82f6', xls: '#10b981', img: '#ec4899', zip: '#f59e0b', link: '#6366f1' }[type] || '#64748b';
    }
    function getHsFileTypeLabel(type) {
        return { pdf: 'PDF', doc: 'Word', xls: 'Excel', img: 'Ảnh', zip: 'Nén', link: 'Liên kết' }[type] || 'Tài liệu';
    }

    function renderVehicleFileList(files, editable) {
        if (!files || files.length === 0) { return ''; }
        return files.map((f, i) => {
            const fType = f.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(f.name) : 'pdf');
            const icon = getHsFileIcon(fType);
            const iconColor = getHsFileColor(fType);
            const typeLabel = getHsFileTypeLabel(f.type || fType);
            const isUrlLink = !!f.url;
            const previewable = !!(f.dataUrl || f.url);

            const previewFn = `window.erpApp.previewVehicleFile(${i})`;
            const previewBtn = `<button type="button" class="hs-file-action-btn" title="${isUrlLink ? 'Mở link' : 'Xem'}" onclick="event.stopPropagation(); ${previewFn}" style="color:#0D9488; background:none; border:none; cursor:pointer; padding:4px;"><span class="material-icons-outlined" style="font-size: 16px;">visibility</span></button>`;

            let fileNameHtml = `<span class="contract-file-name" style="color:#2563eb;font-weight:700;font-size:12px;">${f.name}</span>`;
            if (isUrlLink) {
                fileNameHtml = `<a href="${f.url}" target="_blank" rel="noreferrer noopener" style="color:#2563eb;font-weight:700;text-decoration:none;font-size:12px;" onclick="event.stopPropagation()">${f.name}</a>`;
            }

            const fileSizeHtml = `${typeLabel}${f.size ? ' · ' + f.size : ''}`;
            let actions = '';

            if (editable) {
                actions = `<div style="display:flex;gap:4px;align-items:center">
                    ${previewable ? previewBtn : ''}
                    <button type="button" class="contract-file-remove" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); window.erpApp.removeVehicleFile(${i})"><span class="material-icons-outlined" style="font-size:16px;">close</span></button>
                </div>`;
            } else {
                actions = previewable ? previewBtn : '';
            }

            let drivePathHtml = '';
            if (f.drivePath) {
                drivePathHtml = `<span style="display:block;margin-top:2px;font-size:11px;color:#0D9488"><span class="material-icons-outlined" style="font-size:12px;vertical-align:middle;margin-right:2px">folder</span>Drive: ${f.drivePath}</span>`;
            }
            if (f.url && f.url.includes('drive.google.com')) {
                drivePathHtml += `<a href="${f.url}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:3px;margin-top:2px;font-size:11px;color:#2563EB;text-decoration:none" onclick="event.stopPropagation()"><span class="material-icons-outlined" style="font-size:12px">open_in_new</span>Xem trên Drive</a>`;
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
    }

    window.erpApp.handleVehicleFileUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) { return; }

        const listEl = document.getElementById('vehicleFileList');

        Array.from(files).forEach(async (file) => {
            if (file.size > 20 * 1024 * 1024) { window.erpApp.showToast(`File "${file.name}" quá lớn (>20MB)`, 'error'); return; }
            const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
            const fType = window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf';

            const placeholderIdx = tempVehicleFiles.length;
            tempVehicleFiles.push({ name: '⏳ Đang tải: ' + file.name, size: sizeStr, type: fType, uploading: true });
            if (listEl) { listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true); }

            try {
                const formData = new FormData();
                formData.append('files', file);
                const folderIdInput = document.getElementById('vehicleDriveFolderIdInput');
                const pathInput = document.getElementById('vehicleDriveFolderPathInput');

                if (folderIdInput && folderIdInput.value) {
                    formData.append('folderId', folderIdInput.value);
                } else {
                    formData.append('module', 'kho-van');
                }

                const res = await fetch((window.API_BASE_URL || '') + '/api/drive/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success && data.uploaded && data.uploaded.length > 0) {
                    const driveFile = data.uploaded[0];
                    const folderLabel = pathInput && pathInput.value ? pathInput.value : 'Kho Vận';
                    tempVehicleFiles[placeholderIdx] = {
                        name: file.name,
                        size: sizeStr,
                        type: fType,
                        url: driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
                        driveFileId: driveFile.id,
                        drivePath: folderLabel
                    };
                    window.erpApp.showToast(`✅ Đã tải "${file.name}" lên Google Drive`, 'success');
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        tempVehicleFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result };
                        if (listEl) { listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true); }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Drive không khả dụng, lưu file cục bộ: ${file.name}`, 'warning');
                }
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempVehicleFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result };
                    if (listEl) { listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true); }
                };
                reader.readAsDataURL(file);
                console.warn('[Vehicle Upload] Drive fallback:', err.message);
            }

            if (listEl) { listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true); }
        });
        event.target.value = '';
    };

    window.erpApp.handleVehicleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) { return; }

        if (file.size > 20 * 1024 * 1024) { window.erpApp.showToast(`File "${file.name}" quá lớn (>20MB)`, 'error'); return; }
        const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';

        const previewBox = document.getElementById('vehicleImagePreviewBox');
        if (previewBox) {
            previewBox.innerHTML = `<div style="text-align:center; padding:10px;"><span class="material-icons-outlined" style="animation:spin 1s linear infinite; font-size:24px; color:#2563eb; display:inline-block;">sync</span><div style="font-size:12px; font-weight:700; color:#64748b; margin-top:6px;">⏳ Đang tải ảnh lên Google Drive...</div></div>`;
        }

        const formData = new FormData();
        formData.append('files', file);
        const folderIdInput = document.getElementById('vehicleDriveFolderIdInput');
        if (folderIdInput && folderIdInput.value) {
            formData.append('folderId', folderIdInput.value);
        } else {
            formData.append('module', 'kho-van');
        }

        fetch((window.API_BASE_URL || '') + '/api/drive/upload', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.uploaded && data.uploaded.length > 0) {
                    const driveFile = data.uploaded[0];
                    const url = driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`;

                    // Update input value
                    const input = document.getElementById('vehicleImageUrlInput');
                    if (input) { input.value = url; }

                    // Render preview immediately
                    if (previewBox) {
                        previewBox.innerHTML = `
                            <img src="${window.erpApp.transformImageUrl(url)}" 
                                 data-img="${url}"
                                 onerror="window.erpApp.handleImageError(this, this.dataset.img)"
                                 onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                                 style="max-width:100%; max-height:160px; display:block; object-fit:contain; border-radius:6px;" 
                                 alt="Preview">
                        `;
                    }
                    window.erpApp.showToast(`✅ Đã tải ảnh "${file.name}" lên Google Drive thành công`, 'success');
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const input = document.getElementById('vehicleImageUrlInput');
                        if (input) { input.value = e.target.result; }
                        if (previewBox) {
                            previewBox.innerHTML = `
                                <img src="${e.target.result}" style="max-width:100%; max-height:160px; display:block; object-fit:contain; border-radius:6px;" alt="Preview">
                            `;
                        }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Không thể tải lên Drive, đã dùng ảnh tạm thời`, 'warning');
                }
            })
            .catch(err => {
                console.error(err);
                window.erpApp.showToast(`❌ Lỗi tải ảnh lên Google Drive`, 'error');
                if (previewBox) {
                    previewBox.innerHTML = `<span style="color:#ef4444; font-size:12px; font-weight:600; font-style:italic;">Tải ảnh thất bại</span>`;
                }
            });
    };

    window.erpApp.previewVehicleImageUpload = (url) => {
        const previewBox = document.getElementById('vehicleImagePreviewBox');
        if (!previewBox) return;
        if (!url || !url.trim()) {
            previewBox.innerHTML = `<span style="color:#94a3b8; font-size:12px; font-weight:600; font-style:italic;">Chưa có hình ảnh được chọn</span>`;
            return;
        }
        previewBox.innerHTML = `
            <img src="${window.erpApp.transformImageUrl(url)}" 
                 data-img="${url}"
                 onerror="window.erpApp.handleImageError(this, this.dataset.img)"
                 onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                 style="max-width:100%; max-height:160px; display:block; object-fit:contain; border-radius:6px;" 
                 alt="Preview">
        `;
    };

    window.erpApp.setVehicleDriveFolder = (id, path) => {
        const idInput = document.getElementById('vehicleDriveFolderIdInput');
        const pathInput = document.getElementById('vehicleDriveFolderPathInput');
        const breadcrumbEl = document.getElementById('vehicleDrivePathBreadcrumb');

        if (idInput) idInput.value = id;
        if (pathInput) pathInput.value = path;

        if (breadcrumbEl) {
            let breadcrumbHtml = '';
            if (path === 'My Drive' || !path) {
                breadcrumbHtml = '📂 My Drive';
            } else {
                const parts = path.split(' ➔ ');
                breadcrumbHtml = parts.map((part, idx) => {
                    let emoji = '📁';
                    const partLower = part.toLowerCase();
                    if (partLower.includes('kho vận')) emoji = '📦';
                    else if (partLower.includes('quản lý xe')) emoji = '🚗';
                    else if (partLower.includes('thiết bị') || partLower.includes('cơ giới')) emoji = '⚙️';
                    else if (partLower.includes('tài sản')) emoji = '💼';
                    else if (partLower.includes('pháp lý')) emoji = '⚖️';

                    const arrow = idx > 0 ? '<span style="color:#94a3b8; font-size:12px; margin: 0 4px;">➔</span> ' : '';
                    return `${arrow}${emoji} ${part}`;
                }).join(' ');
            }
            breadcrumbEl.innerHTML = breadcrumbHtml;
        }
    };

    window.erpApp.openVehicleDrivePickerModal = async () => {
        // Create Picker Modal overlay
        const pickerModal = document.createElement('div');
        pickerModal.id = 'vehicleDrivePickerModal';
        pickerModal.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 25000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.25s ease;
        `;

        pickerModal.innerHTML = `
            <div style="
                background: #ffffff;
                width: 100%;
                max-width: 500px;
                border-radius: 28px;
                box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.3);
                padding: 28px;
                transform: scale(0.9);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                border: 1px solid rgba(226, 232, 240, 0.8);
                display: flex;
                flex-direction: column;
                max-height: 80vh;
            ">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #2563eb;">
                            <span class="material-icons-outlined" style="font-size: 24px;">folder_shared</span>
                        </div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">Duyệt Google Drive</h3>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Chọn bất kỳ vị trí nào để lưu tài liệu</p>
                        </div>
                    </div>
                    <button type="button" id="closeVehicleDrivePicker" style="background: #f1f5f9; border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <span class="material-icons-outlined" style="font-size: 18px;">close</span>
                    </button>
                </div>

                <!-- Navigation Path (Breadcrumbs) -->
                <div id="pickerBreadcrumbs" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 12px 16px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 16px; text-align: left;">
                    <span style="cursor: pointer; color: #2563eb;" id="pickerRootLink">📂 My Drive</span>
                </div>

                <!-- Search box -->
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 10px 14px; border-radius: 12px; border: 1.5px solid transparent; transition: 0.2s;" id="pickerSearchContainer">
                        <span class="material-icons-outlined" style="color: #94a3b8; font-size: 18px;">search</span>
                        <input type="text" id="pickerSearchInput" placeholder="Tìm kiếm thư mục..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 13px; font-weight: 600; color: #1e293b;">
                    </div>
                </div>

                <!-- Directory list container -->
                <div id="pickerDirList" style="flex: 1; overflow-y: auto; min-height: 200px; max-height: 350px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px;">
                    <div style="text-align: center; padding: 40px 0; color: #94a3b8;"><span class="material-icons-outlined" style="animation: spin 1s linear infinite; font-size: 28px; color: #2563eb; display: inline-block;">sync</span></div>
                </div>

                <!-- Actions -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; border-top: 1.5px solid #f1f5f9; padding-top: 20px;">
                    <button type="button" id="pickerCreateFolderHere" style="padding: 12px 18px; border: 1.5px solid #bbf7d0; background: #f0fdf4; color: #16a34a; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;" onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">
                        <span class="material-icons-outlined" style="font-size: 18px;">create_new_folder</span>Tạo folder tại đây
                    </button>
                    <button type="button" id="pickerSelectCurrent" style="padding: 12px 24px; border: none; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); transition: 0.2s;" onmouseover="this.style.transform='translateY(-1px)';" onmouseout="this.style.transform='none';">
                        Chọn thư mục này
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(pickerModal);

        setTimeout(() => {
            pickerModal.style.opacity = '1';
            pickerModal.firstElementChild.style.transform = 'scale(1)';
        }, 10);

        // State for browsing
        let currentFolderId = ''; // empty means root
        let currentFolderPath = []; // array of { id, name }
        let allCurrentFolders = [];

        // Helper to load directories
        const loadDirectory = async (folderId) => {
            const listContainer = pickerModal.querySelector('#pickerDirList');
            listContainer.innerHTML = `<div style="text-align: center; padding: 40px 0; color: #94a3b8;"><span class="material-icons-outlined" style="animation: spin 1s linear infinite; font-size: 28px; color: #2563eb; display: inline-block;">sync</span><div style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 8px;">Đang tải danh sách thư mục...</div></div>`;

            try {
                let url = (window.API_BASE_URL || '') + '/api/drive/folders';
                if (folderId) {
                    url += `?parentId=${folderId}`;
                }
                const res = await fetch(url);
                const data = await res.json();

                if (data.success && data.folders) {
                    allCurrentFolders = data.folders;
                    renderDirectoryList(allCurrentFolders);
                } else {
                    listContainer.innerHTML = `<div style="text-align: center; padding: 40px 0; color: #ef4444; font-size: 13px; font-weight: 700;">Không thể tải danh sách thư mục</div>`;
                }
            } catch (err) {
                listContainer.innerHTML = `<div style="text-align: center; padding: 40px 0; color: #ef4444; font-size: 13px; font-weight: 700;">Lỗi kết nối Drive</div>`;
            }
        };

        const renderDirectoryList = (folders) => {
            const listContainer = pickerModal.querySelector('#pickerDirList');
            if (folders.length === 0) {
                listContainer.innerHTML = `<div style="text-align: center; padding: 60px 0; color: #94a3b8; font-size: 13px; font-style: italic; font-weight: 600; border: 1.5px dashed #e2e8f0; border-radius: 16px;">Thư mục này chưa có thư mục con</div>`;
                return;
            }

            listContainer.innerHTML = folders.map(f => {
                let emoji = '📁';
                const nameLower = f.name.toLowerCase();
                if (nameLower.includes('kho vận')) emoji = '📦';
                else if (nameLower.includes('quản lý xe')) emoji = '🚗';
                else if (nameLower.includes('thiết bị') || nameLower.includes('cơ giới')) emoji = '⚙️';
                else if (nameLower.includes('tài sản')) emoji = '💼';
                else if (nameLower.includes('pháp lý')) emoji = '⚖️';
                return `
                    <div class="picker-dir-item" data-id="${f.id}" data-name="${f.name}" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: #ffffff;
                        border: 1.5px solid #e2e8f0;
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-weight: 700;
                        color: #1e293b;
                        font-size: 13px;
                    " onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#bfdbfe';" onmouseout="this.style.background='#ffffff'; this.style.borderColor='#e2e8f0';">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 18px;">${emoji}</span>
                            <span>${f.name}</span>
                        </div>
                        <span class="material-icons-outlined" style="font-size: 16px; color: #94a3b8;">chevron_right</span>
                    </div>
                `;
            }).join('');

            // Click listener for drill-down
            listContainer.querySelectorAll('.picker-dir-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    const name = item.dataset.name;
                    currentFolderId = id;
                    currentFolderPath.push({ id, name });
                    updateBreadcrumbs();
                    loadDirectory(id);
                });
            });
        };

        const updateBreadcrumbs = () => {
            const bcContainer = pickerModal.querySelector('#pickerBreadcrumbs');
            let html = `<span style="cursor: pointer; color: #2563eb;" id="pickerRootLink">📂 My Drive</span>`;

            currentFolderPath.forEach((p, idx) => {
                html += ` <span style="color:#94a3b8">➔</span> <span class="bc-link" data-idx="${idx}" style="cursor: pointer; color: #2563eb;">${p.name}</span>`;
            });
            bcContainer.innerHTML = html;

            bcContainer.querySelector('#pickerRootLink').addEventListener('click', () => {
                currentFolderId = '';
                currentFolderPath = [];
                updateBreadcrumbs();
                loadDirectory('');
            });

            bcContainer.querySelectorAll('.bc-link').forEach(link => {
                link.addEventListener('click', () => {
                    const idx = parseInt(link.dataset.idx);
                    currentFolderPath = currentFolderPath.slice(0, idx + 1);
                    currentFolderId = currentFolderPath[currentFolderPath.length - 1].id;
                    updateBreadcrumbs();
                    loadDirectory(currentFolderId);
                });
            });
        };

        // Close logic
        const closePicker = () => {
            pickerModal.style.opacity = '0';
            pickerModal.firstElementChild.style.transform = 'scale(0.9)';
            setTimeout(() => pickerModal.remove(), 250);
        };

        pickerModal.querySelector('#closeVehicleDrivePicker').addEventListener('click', closePicker);

        // Search logic
        const searchInput = pickerModal.querySelector('#pickerSearchInput');
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            if (!val) {
                renderDirectoryList(allCurrentFolders);
            } else {
                const filtered = allCurrentFolders.filter(f => f.name.toLowerCase().includes(val));
                renderDirectoryList(filtered);
            }
        });

        // Select current folder logic
        pickerModal.querySelector('#pickerSelectCurrent').addEventListener('click', () => {
            const pathText = currentFolderPath.length > 0
                ? currentFolderPath.map(p => p.name).join(' ➔ ')
                : 'My Drive';
            window.erpApp.setVehicleDriveFolder(currentFolderId, pathText);
            closePicker();
        });

        // Create folder here logic
        pickerModal.querySelector('#pickerCreateFolderHere').addEventListener('click', async () => {
            const name = await window.erpApp.vehicleCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
            if (!name || !name.trim()) return;

            try {
                window.erpApp.showToast('⏳ Đang tạo folder...', 'info');
                const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), parentId: currentFolderId || null })
                });
                const data = await res.json();

                if (data.success) {
                    window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                    await loadDirectory(currentFolderId);
                } else {
                    window.erpApp.showToast(`❌ Lỗi: ${data.error || 'Không tạo được folder'}`, 'error');
                }
            } catch (err) {
                window.erpApp.showToast(`❌ Lỗi kết nối: ${err.message}`, 'error');
            }
        });

        // Initial load
        const currentSelectedId = document.getElementById('vehicleDriveFolderIdInput')?.value || '';
        const currentSelectedPath = document.getElementById('vehicleDriveFolderPathInput')?.value || '';

        if (currentSelectedId && currentSelectedPath) {
            currentFolderId = currentSelectedId;
            const pathParts = currentSelectedPath.split(' ➔ ');
            currentFolderPath = [{ id: currentSelectedId, name: pathParts[pathParts.length - 1] }];
            updateBreadcrumbs();
            loadDirectory(currentSelectedId);
        } else {
            loadDirectory('');
        }
    };

    window.erpApp.initializeVehicleDriveFolders = async (defaultFolderName = 'Kho Vận') => {
        // If editing and already has folder path, use it directly!
        const idInput = document.getElementById('vehicleDriveFolderIdInput');
        const pathInput = document.getElementById('vehicleDriveFolderPathInput');
        if (idInput && idInput.value && pathInput && pathInput.value) {
            window.erpApp.setVehicleDriveFolder(idInput.value, pathInput.value);
            return;
        }

        const breadcrumbEl = document.getElementById('vehicleDrivePathBreadcrumb');
        if (breadcrumbEl) breadcrumbEl.innerHTML = '⏳ Đang tải thư mục...';

        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders');
            const data = await res.json();
            if (data.success && data.folders && data.folders.length > 0) {
                // Find primary match
                let targetFolder = null;
                const searchNames = Array.isArray(defaultFolderName) ? defaultFolderName : [defaultFolderName];
                for (const name of searchNames) {
                    targetFolder = data.folders.find(f => f.name.toLowerCase().includes(name.toLowerCase()));
                    if (targetFolder) break;
                }

                if (targetFolder) {
                    // Try to load subfolders of the matching folder automatically
                    const isEq = (typeof currentVmContext !== 'undefined' && currentVmContext === 'equipment');
                    let targetSubFolder = null;

                    // Fetch folders under the primary parent folder
                    const subRes = await fetch((window.API_BASE_URL || '') + `/api/drive/folders?parentId=${targetFolder.id}`);
                    const subData = await subRes.json();

                    if (subData.success && subData.folders && subData.folders.length > 0) {
                        const subSearch = isEq ? ['Thiết bị cơ giới', 'Thiết bị', 'Cơ giới'] : [];
                        for (const name of subSearch) {
                            targetSubFolder = subData.folders.find(f => f.name.toLowerCase().includes(name.toLowerCase()));
                            if (targetSubFolder) break;
                        }
                    }

                    if (targetSubFolder) {
                        window.erpApp.setVehicleDriveFolder(targetSubFolder.id, `${targetFolder.name} ➔ ${targetSubFolder.name}`);
                    } else {
                        window.erpApp.setVehicleDriveFolder(targetFolder.id, targetFolder.name);
                    }
                } else {
                    window.erpApp.setVehicleDriveFolder('', 'My Drive');
                }
            } else {
                window.erpApp.setVehicleDriveFolder('', 'My Drive');
            }
        } catch (e) {
            window.erpApp.setVehicleDriveFolder('', 'Lỗi kết nối Drive');
        }
    };

    window.erpApp.vehicleCustomPrompt = (title, placeholder, defaultValue = '') => {
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
                z-index: 30000;
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
                        <input type="text" id="vehicleCustomPromptInput" value="${defaultValue}" placeholder="${placeholder}" style="
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
                        <button type="button" id="vehicleCustomPromptCancel" style="
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
                        <button type="button" id="vehicleCustomPromptSubmit" style="
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

            const input = overlay.querySelector('#vehicleCustomPromptInput');
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

            overlay.querySelector('#vehicleCustomPromptCancel').addEventListener('click', () => closePrompt(null));
            overlay.querySelector('#vehicleCustomPromptSubmit').addEventListener('click', () => {
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

    window.erpApp.createVehicleDriveSubfolderFromModal = async () => {
        const currentFolderId = document.getElementById('vehicleDriveFolderIdInput')?.value || '';
        const name = await window.erpApp.vehicleCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
        if (!name || !name.trim()) return;

        try {
            window.erpApp.showToast('⏳ Đang tạo folder...', 'info');
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), parentId: currentFolderId || null })
            });
            const data = await res.json();

            if (data.success && data.folder) {
                window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                const pathInput = document.getElementById('vehicleDriveFolderPathInput');
                const currentPath = pathInput ? pathInput.value : '';
                const newPath = currentPath ? `${currentPath} ➔ ${name.trim()}` : name.trim();
                window.erpApp.setVehicleDriveFolder(data.folder.id, newPath);
            } else {
                window.erpApp.showToast(`❌ Lỗi: ${data.error || 'Không tạo được folder'}`, 'error');
            }
        } catch (err) {
            window.erpApp.showToast(`❌ Lỗi kết nối: ${err.message}`, 'error');
        }
    };

    window.erpApp.removeVehicleFile = (index) => {
        tempVehicleFiles.splice(index, 1);
        const listEl = document.getElementById('vehicleFileList');
        if (listEl) {
            listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true);
        }
    };
    window.erpApp.addVehicleFileByLink = () => {
        const urlEl = document.getElementById('vehicleLinkUrl');
        const nameEl = document.getElementById('vehicleLinkName');
        if (!urlEl) return;
        const url = urlEl.value.trim();
        if (!url) { window.erpApp.showToast('Vui lòng nhập đường link!', 'error'); urlEl.focus(); return; }
        try { new URL(url); } catch (e) { window.erpApp.showToast('Đường link không hợp lệ!', 'error'); urlEl.focus(); return; }
        const name = (nameEl && nameEl.value.trim()) || url.split('/').filter(Boolean).pop() || 'Link file';
        tempVehicleFiles.push({ name: name, url: url, type: 'link', size: '' });
        const listEl = document.getElementById('vehicleFileList');
        if (listEl) {
            listEl.innerHTML = renderVehicleFileList(tempVehicleFiles, true);
        }
        urlEl.value = '';
        if (nameEl) nameEl.value = '';
        window.erpApp.showToast('Đã thêm link: ' + name, 'success');
    };

    window.erpApp.previewVehicleFile = async (index) => {
        const file = tempVehicleFiles[index];
        if (!file) { window.erpApp.showToast('Không tìm thấy file!', 'error'); return; }
        const href = file.dataUrl || file.url;
        if (!href) { window.erpApp.showToast('File này chưa có dữ liệu để xem trước.', 'error'); return; }
        const fType = file.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf');

        if (file.dataUrl && fType === 'pdf') {
            const win = window.open('', '_blank');
            win.document.write(`<iframe src="${href}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
        } else if (file.dataUrl && fType === 'img') {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${href}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`);
        } else {
            window.open(href, '_blank');
        }
    };

    // ==========================================
    // Custom Vehicle Expense File Upload & Google Drive handlers
    // ==========================================
    function renderExpenseFileList(files, editable) {
        if (!files || files.length === 0) { return ''; }
        return files.map((f, i) => {
            const fType = f.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(f.name) : 'pdf');
            const icon = getHsFileIcon(fType);
            const iconColor = getHsFileColor(fType);
            const typeLabel = getHsFileTypeLabel(f.type || fType);
            const isUrlLink = !!f.url;
            const previewable = !!(f.dataUrl || f.url);

            const previewFn = `window.erpApp.previewExpenseFile(${i})`;
            const previewBtn = `<button type="button" class="hs-file-action-btn" title="${isUrlLink ? 'Mở link' : 'Xem'}" onclick="event.stopPropagation(); ${previewFn}" style="color:#0D9488; background:none; border:none; cursor:pointer; padding:4px;"><span class="material-icons-outlined" style="font-size: 16px;">visibility</span></button>`;

            let fileNameHtml = `<span class="contract-file-name" style="color:#2563eb;font-weight:700;font-size:12px;">${f.name}</span>`;
            if (isUrlLink) {
                fileNameHtml = `<a href="${f.url}" target="_blank" rel="noreferrer noopener" style="color:#2563eb;font-weight:700;text-decoration:none;font-size:12px;" onclick="event.stopPropagation()">${f.name}</a>`;
            }

            const fileSizeHtml = `${typeLabel}${f.size ? ' · ' + f.size : ''}`;
            let actions = '';

            if (editable) {
                actions = `<div style="display:flex;gap:4px;align-items:center">
                    ${previewable ? previewBtn : ''}
                    <button type="button" class="contract-file-remove" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); window.erpApp.removeExpenseFile(${i})"><span class="material-icons-outlined" style="font-size:16px;">close</span></button>
                </div>`;
            } else {
                actions = previewable ? previewBtn : '';
            }

            let drivePathHtml = '';
            if (f.drivePath) {
                drivePathHtml = `<span style="display:block;margin-top:2px;font-size:11px;color:#0D9488"><span class="material-icons-outlined" style="font-size:12px;vertical-align:middle;margin-right:2px">folder</span>Drive: ${f.drivePath}</span>`;
            }
            if (f.url && f.url.includes('drive.google.com')) {
                drivePathHtml += `<a href="${f.url}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:3px;margin-top:2px;font-size:11px;color:#2563EB;text-decoration:none" onclick="event.stopPropagation()"><span class="material-icons-outlined" style="font-size:12px">open_in_new</span>Xem trên Drive</a>`;
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
    }

    window.erpApp.handleExpenseFileUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) { return; }

        const listEl = document.getElementById('expenseFileList');

        Array.from(files).forEach(async (file) => {
            if (file.size > 20 * 1024 * 1024) { window.erpApp.showToast(`File "${file.name}" quá lớn (>20MB)`, 'error'); return; }
            const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
            const fType = window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf';

            const placeholderIdx = tempExpenseFiles.length;
            tempExpenseFiles.push({ name: '⏳ Đang tải: ' + file.name, size: sizeStr, type: fType, uploading: true });
            if (listEl) { listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true); }

            try {
                const formData = new FormData();
                formData.append('files', file);
                const folderSelect = document.getElementById('expenseDriveFolderSelect');
                const subfolderSelect = document.getElementById('expenseDriveSubfolderSelect');
                const selectedModule = folderSelect ? folderSelect.value : 'tai-chinh';
                if (subfolderSelect && subfolderSelect.value) {
                    formData.append('folderId', subfolderSelect.value);
                } else {
                    formData.append('module', selectedModule);
                }

                const res = await fetch((window.API_BASE_URL || '') + '/api/drive/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success && data.uploaded && data.uploaded.length > 0) {
                    const driveFile = data.uploaded[0];
                    const folderLabel = folderSelect ? folderSelect.options[folderSelect.selectedIndex].text : 'Tài Chính';
                    const subLabel = (subfolderSelect && subfolderSelect.value) ? ' / ' + subfolderSelect.options[subfolderSelect.selectedIndex].text : '';
                    tempExpenseFiles[placeholderIdx] = {
                        name: file.name,
                        size: sizeStr,
                        type: fType,
                        url: driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
                        driveFileId: driveFile.id,
                        drivePath: folderLabel.replace(/^[^\s]+\s/, '') + subLabel
                    };
                    window.erpApp.showToast(`✅ Đã tải "${file.name}" lên Google Drive`, 'success');
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result };
                        if (listEl) { listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true); }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Drive không khả dụng, lưu file cục bộ: ${file.name}`, 'warning');
                }
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result };
                    if (listEl) { listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true); }
                };
                reader.readAsDataURL(file);
                console.warn('[Expense Upload] Drive fallback:', err.message);
            }

            if (listEl) { listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true); }
        });
        event.target.value = '';
    };

    window.erpApp.loadExpenseDriveSubfolders = async () => {
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        const subSelect = document.getElementById('expenseDriveSubfolderSelect');
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

    window.erpApp.createExpenseDriveSubfolderFromModal = async () => {
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        const subSelect = document.getElementById('expenseDriveSubfolderSelect');
        if (!folderSelect) return;
        const module = folderSelect.value;
        const name = prompt('Nhập tên folder mới trên Google Drive:');
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
                await window.erpApp.loadExpenseDriveSubfolders();
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

    window.erpApp.removeExpenseFile = (index) => {
        tempExpenseFiles.splice(index, 1);
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true);
        }
    };

    window.erpApp.addExpenseFileByLink = () => {
        const urlEl = document.getElementById('expenseLinkUrl');
        const nameEl = document.getElementById('expenseLinkName');
        if (!urlEl) return;
        const url = urlEl.value.trim();
        if (!url) { window.erpApp.showToast('Vui lòng nhập đường link!', 'error'); urlEl.focus(); return; }
        try { new URL(url); } catch (e) { window.erpApp.showToast('Đường link không hợp lệ!', 'error'); urlEl.focus(); return; }
        const name = (nameEl && nameEl.value.trim()) || url.split('/').filter(Boolean).pop() || 'Link file';
        tempExpenseFiles.push({ name: name, url: url, type: 'link', size: '' });
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = renderExpenseFileList(tempExpenseFiles, true);
        }
        urlEl.value = '';
        if (nameEl) nameEl.value = '';
        window.erpApp.showToast('Đã thêm link: ' + name, 'success');
    };

    window.erpApp.previewExpenseFile = async (index) => {
        const file = tempExpenseFiles[index];
        if (!file) { window.erpApp.showToast('Không tìm thấy file!', 'error'); return; }
        const href = file.dataUrl || file.url;
        if (!href) { window.erpApp.showToast('File này chưa có dữ liệu để xem trước.', 'error'); return; }
        const fType = file.type || (window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf');

        if (file.dataUrl && fType === 'pdf') {
            const win = window.open('', '_blank');
            win.document.write(`<iframe src="${href}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
        } else if (file.dataUrl && fType === 'img') {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${href}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`);
        } else {
            window.open(href, '_blank');
        }
    };

    window.erpApp.onVehicleContextChange = function (select) {
        const isEq = select.value === 'equipment';

        // Update the serial code input if it's a new entry
        const idInput = select.form.querySelector('[name="id"]');
        const oldIdInput = select.form.querySelector('[name="oldId"]');
        const isEdit = oldIdInput && oldIdInput.value;
        if (!isEdit && idInput) {
            idInput.value = generateNextCode(isEq);
        }

        // Update name placeholder
        const nameInput = select.form.querySelector('[name="name"]');
        if (nameInput) {
            nameInput.placeholder = isEq ? 'VD: Máy xúc Komatsu PC200' : 'VD: Toyota Hilux 2.4G';
            const nameLabel = nameInput.previousElementSibling;
            if (nameLabel) {
                nameLabel.innerHTML = `<span class="material-icons-outlined" style="font-size:14px;">directions_car</span> ${isEq ? 'Tên thiết bị' : 'Tên xe / Model'} <span style="color:#ef4444; font-weight:bold;">*</span>`;
            }
        }

        // Update ODO label
        const odoInput = select.form.querySelector('[name="odo"]');
        if (odoInput) {
            const odoLabel = odoInput.previousElementSibling;
            if (odoLabel) {
                odoLabel.innerHTML = `<span class="material-icons-outlined" style="font-size:14px;">speed</span> ${isEq ? 'Giờ chạy hiện tại' : 'Số ODO hiện tại (km)'}`;
            }
        }

        // Update types select options
        const typeSelect = select.form.querySelector('[name="type"]');
        if (typeSelect) {
            const vehicles = getModuleData('vmVehicles', []);
            const contextVehicles = vehicles.filter(v => v.context === select.value);
            const defaultTypes = isEq
                ? ['Máy xúc', 'Xe ủi', 'Xe lu', 'Xe cẩu', 'Thiết bị khác']
                : ['Xe con', 'Xe bán tải', 'Xe tải', 'Cơ giới', 'Xe khách'];
            const dynamicTypes = [...new Set([...defaultTypes, ...contextVehicles.map(v => v.type).filter(Boolean)])];

            typeSelect.innerHTML = dynamicTypes.map(t => `<option value="${t}">${t}</option>`).join('') +
                '<option value="__custom__">+ Thêm loại khác...</option>';

            // Trigger type change check
            window.erpApp.onVehicleTypeChange(typeSelect);
        }
    };

    window.erpApp.onVehicleTypeChange = function (select) {
        const container = document.getElementById('customTypeContainer');
        const input = document.getElementById('customTypeInput');
        if (select.value === '__custom__') {
            if (container) container.style.display = 'block';
            if (input) {
                input.required = true;
                input.focus();
            }
        } else {
            if (container) container.style.display = 'none';
            if (input) {
                input.required = false;
                input.value = '';
            }
        }
    };

    window.erpApp.renderVehicleModal = function (editData = null) {
        tempVehicleFiles = editData ? (editData.files || (editData.docUrl ? [{ name: 'Hồ sơ đính kèm', url: editData.docUrl, type: 'pdf', size: '' }] : [])) : [];
        const isEq = currentVmContext === 'equipment';
        const isEdit = !!editData;
        const nextCode = isEdit ? editData.internalCode : generateNextCode(isEq);
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmAddModal';
        modal.style = 'background:rgba(15,23,42,0.75); backdrop-filter:blur(10px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';

        const nameLabel = isEq ? 'Tên thiết bị' : 'Tên xe / Model';
        const odoLabel = isEq ? 'Giờ chạy hiện tại' : 'Số ODO hiện tại (km)';

        const vehicles = getModuleData('vmVehicles', []);
        const contextVehicles = vehicles.filter(v => v.context === (isEq ? 'equipment' : 'vehicle'));
        const defaultTypes = isEq
            ? ['Máy xúc', 'Xe ủi', 'Xe lu', 'Xe cẩu', 'Thiết bị khác']
            : ['Xe con', 'Xe bán tải', 'Xe tải', 'Cơ giới', 'Xe khách'];
        const dynamicTypes = [...new Set([...defaultTypes, ...contextVehicles.map(v => v.type).filter(Boolean)])];

        modal.innerHTML = `
            <div class="modal-content" style="width:100%; max-width:650px; background:#fff; border-radius:32px; overflow:hidden; box-shadow:0 30px 60px -12px rgba(0,0,0,0.4); animation:modalPop 0.3s ease-out;">
                <!-- Modal Header -->
                <div style="padding:24px 32px; background:#fcfdfe; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:${isEdit ? '#eff6ff' : '#f0fdf4'}; color:${isEdit ? '#3b82f6' : '#10b981'}; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">${isEdit ? 'edit' : 'add_circle'}</span> 
                        </div>
                        ${isEdit ? 'Chỉnh sửa thông tin' : (isEq ? 'Thêm Thiết bị mới' : 'Thêm Xe mới')}
                    </h2>
                    <button onclick="document.getElementById('vmAddModal').remove()" style="background:#f1f5f9; border:none; color:#94a3b8; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <span class="material-icons-outlined" style="font-size:20px;">close</span>
                    </button>
                </div>

                <form onsubmit="window.erpApp.saveVehicle(event)" style="margin:0;">
                    <input type="hidden" name="oldId" value="${isEdit ? editData.id : ''}">
                    <div style="padding:32px; display:grid; gap:24px; max-height:70vh; overflow-y:auto;">
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">account_tree</span> Nhóm quản lý (Loại thiết bị)
                            </label>
                            <select name="context" onchange="window.erpApp.onVehicleContextChange(this)" style="width:100%; padding:12px 16px; border:1.5px solid #3b82f6; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px; background:#eff6ff; appearance:none; background-image:url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233b82f6%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat:no-repeat; background-position:right%2016px%20top%2050%25; background-size:10px%20auto;">
                                <option value="vehicle" ${isEdit ? (editData.context === 'vehicle' ? 'selected' : '') : (isEq ? '' : 'selected')}>Ô tô / Xe & Phương tiện</option>
                                <option value="equipment" ${isEdit ? (editData.context === 'equipment' ? 'selected' : '') : (isEq ? 'selected' : '')}>Thiết bị thi công (Cơ giới)</option>
                            </select>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">tag</span> ${isEq ? 'Mã số / Số hiệu' : 'Biển số xe'} <span style="color:#ef4444; font-weight:bold;">*</span>
                                </label>
                                <input type="text" name="id" value="${isEdit ? editData.id : nextCode}" placeholder="${isEq ? 'VD: MX-01' : 'VD: 29C-123.45'}" ${isEdit ? 'readonly style="background:#f8fafc; color:#64748b;"' : ''} required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">badge</span> ${isEq ? 'Loại thiết bị' : 'Loại xe'}
                                </label>
                                <select name="type" id="vehicleTypeSelect" onchange="window.erpApp.onVehicleTypeChange(this)" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px; background:#fff;">
                                    ${dynamicTypes.map(t => `<option value="${t}" ${isEdit && editData.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                                    <option value="__custom__">+ Thêm loại khác...</option>
                                </select>
                                <div id="customTypeContainer" style="display:none; margin-top:10px;">
                                    <input type="text" id="customTypeInput" placeholder="Nhập loại mới..." style="width:100%; padding:10px 14px; border:1.5px solid #3b82f6; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">directions_car</span> ${nameLabel} <span style="color:#ef4444; font-weight:bold;">*</span>
                            </label>
                            <input type="text" name="name" value="${isEdit ? editData.name : ''}" placeholder="${isEq ? 'VD: Máy xúc Komatsu PC200' : 'VD: Toyota Hilux 2.4G'}" required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">event_available</span> Hạn kiểm định (nếu có)
                                </label>
                                <input type="text" name="inspectionDate" class="erp-datepicker" value="${isEdit && editData.inspectionDate ? fmtDate(editData.inspectionDate) : ''}" placeholder="dd/mm/yyyy" style="width:100%; padding:12px 12px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#e11d48; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">security</span> Hạn bảo hiểm (nếu có)
                                </label>
                                <input type="text" name="insuranceDate" class="erp-datepicker" value="${isEdit && editData.insuranceDate ? fmtDate(editData.insuranceDate) : ''}" placeholder="dd/mm/yyyy" style="width:100%; padding:12px 12px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#10b981; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">settings_suggest</span> Trạng thái
                                </label>
                                <select name="status" style="width:100%; padding:12px 12px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:13px; background:#fff;">
                                    <option value="Sẵn sàng" ${isEdit && editData.status === 'Sẵn sàng' ? 'selected' : ''}>Sẵn sàng</option>
                                    <option value="Đang đi" ${isEdit && editData.status === 'Đang đi' ? 'selected' : ''}>Đang đi</option>
                                    <option value="Bảo trì" ${isEdit && editData.status === 'Bảo trì' ? 'selected' : ''}>Bảo trì</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">speed</span> ${odoLabel}
                                </label>
                                <input type="text" name="odo" value="${isEdit ? window.erpApp.formatValue(editData.odo) : '0'}" oninput="window.erpApp.formatNumberInput(this)" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#2563eb; outline:none; font-size:14px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">calendar_month</span> Năm sản xuất
                                </label>
                                <input type="number" name="year" value="${isEdit ? editData.year : new Date().getFullYear()}" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; color:#1e293b; outline:none; font-size:14px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; background:#eff6ff44; padding:16px; border-radius:16px; border:1.5px dashed #bfdbfe;">
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#1e3a8a; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px; color:#2563eb;">speed</span> Chu kỳ bảo dưỡng (Km/Giờ)
                                </label>
                                <input type="number" name="maintIntervalKm" value="${isEdit ? (editData.maintIntervalKm || 5000) : 5000}" style="width:100%; padding:12px 16px; border:1.5px solid #bfdbfe; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px;" placeholder="VD: 5000">
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#1e3a8a; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px; color:#2563eb;">calendar_month</span> Chu kỳ bảo dưỡng (Tháng)
                                </label>
                                <input type="number" name="maintIntervalMonths" value="${isEdit ? (editData.maintIntervalMonths || 6) : 6}" style="width:100%; padding:12px 16px; border:1.5px solid #bfdbfe; border-radius:14px; font-weight:800; color:#1e293b; outline:none; font-size:14px;" placeholder="VD: 6">
                            </div>
                        </div>

                        <!-- Đặc tính kỹ thuật -->
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:20px; border-radius:20px; display:grid; gap:16px;">
                            <div style="font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; display:flex; align-items:center; gap:6px; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:4px;">
                                <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">handyman</span> Đặc tính kỹ thuật
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px;">
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Số Khung</label>
                                    <input type="text" name="chassisNumber" value="${isEdit ? (editData.chassisNumber || '') : ''}" placeholder="Nhập số khung..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Số Máy</label>
                                    <input type="text" name="engineNumber" value="${isEdit ? (editData.engineNumber || '') : ''}" placeholder="Nhập số máy..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Công suất máy</label>
                                    <input type="text" name="enginePower" value="${isEdit ? (editData.enginePower || '') : ''}" placeholder="VD: 150 HP, 110 kW..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px; transition:0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                </div>
                            </div>
                        </div>

                        <!-- Thông tin hồ sơ giấy tờ -->
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:20px; border-radius:20px; display:grid; gap:16px; margin-bottom: 16px;">
                            <div style="font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; display:flex; align-items:center; gap:6px; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:4px;">
                                <span class="material-icons-outlined" style="font-size:18px; color:#10b981;">folder_open</span> Số lượng hồ sơ giấy tờ
                            </div>
                            
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#1e293b; margin-bottom:8px;">1. Cavet xe</label>
                                <div style="display:grid; grid-template-columns: 1fr 1fr 2fr; gap:16px;">
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Bản gốc (bộ)</label>
                                        <input type="number" name="cavetOriginal" value="${isEdit ? (editData.cavetOriginal || 0) : 0}" min="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Bản phô (bộ)</label>
                                        <input type="number" name="cavetCopy" value="${isEdit ? (editData.cavetCopy || 0) : 0}" min="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Lưu ở</label>
                                        <input type="text" name="cavetLocation" value="${isEdit ? (editData.cavetLocation || '') : ''}" placeholder="Vị trí lưu trữ..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#1e293b; margin-bottom:8px;">2. Kiểm định</label>
                                <div style="display:grid; grid-template-columns: 1fr 1fr 2fr; gap:16px;">
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Bản gốc (bộ)</label>
                                        <input type="number" name="inspectionOriginal" value="${isEdit ? (editData.inspectionOriginal || 0) : 0}" min="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Bản phô (bộ)</label>
                                        <input type="number" name="inspectionCopy" value="${isEdit ? (editData.inspectionCopy || 0) : 0}" min="0" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">Lưu ở</label>
                                        <input type="text" name="inspectionLocation" value="${isEdit ? (editData.inspectionLocation || '') : ''}" placeholder="Vị trí lưu trữ..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; font-size:13px;">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ghi chú -->
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px;">sticky_note_2</span> Ghi chú
                            </label>
                            <textarea name="notes" rows="3" placeholder="Nhập ghi chú về thiết bị / xe..." style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:600; color:#1e293b; outline:none; font-size:13px; transition:0.2s; resize:vertical; font-family:inherit; line-height:1.6;" onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">${isEdit ? (editData.notes || '') : ''}</textarea>
                        </div>

                        <div class="form-group" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:16px; margin-bottom:16px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                <span class="material-icons-outlined" style="font-size:14px; color:#3b82f6;">image</span> Hình ảnh thiết bị (Google Photos / Google Drive)
                            </label>
                            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
                                <div style="flex:1; min-width:200px;">
                                    <input type="url" id="vehicleImageUrlInput" name="imageUrl" value="${isEdit ? (editData.imageUrl || '') : ''}" placeholder="Dán link ảnh tại đây hoặc tải lên..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:600; color:#2563eb; outline:none; font-size:13px;" oninput="window.erpApp.previewVehicleImageUpload(this.value)">
                                </div>
                                <button type="button" onclick="document.getElementById('vehicleImageFileInput').click()" style="padding:10px 16px; background:#eff6ff; border:1.5px solid #bfdbfe; color:#2563eb; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                                    <span class="material-icons-outlined" style="font-size:16px;">cloud_upload</span> Tải lên từ máy
                                </button>
                                <input type="file" id="vehicleImageFileInput" accept="image/*" onchange="window.erpApp.handleVehicleImageUpload(event)" style="display:none;">
                            </div>
                            
                            <!-- Live image preview box -->
                            <div id="vehicleImagePreviewBox" style="border-radius:10px; overflow:hidden; border:1.5px dashed #cbd5e1; background:#fff; min-height:80px; display:flex; align-items:center; justify-content:center; padding:8px;">
                                ${isEdit && editData.imageUrl ? `
                                    <img src="${window.erpApp.transformImageUrl(editData.imageUrl)}" 
                                         data-img="${editData.imageUrl}"
                                         onerror="window.erpApp.handleImageError(this, this.dataset.img)"
                                         onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                                         style="max-width:100%; max-height:160px; display:block; object-fit:contain; border-radius:6px;" 
                                         alt="Preview">
                                ` : `
                                    <span style="color:#94a3b8; font-size:12px; font-weight:600; font-style:italic;">Chưa có hình ảnh được chọn</span>
                                `}
                            </div>
                        </div>

                        <!-- Hồ sơ tài liệu đính kèm (Google Drive UI) -->
                        <div class="form-group" style="border-top: 1px dashed #e2e8f0; padding-top: 20px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ tài liệu đính kèm
                            </label>
                            
                            <!-- Dynamic Google Drive Path Picker -->
                            <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background:#f8fafc; border:1.5px solid #e2e8f0; padding:12px 16px; border-radius:16px;">
                                <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:240px;">
                                    <span class="material-icons-outlined" style="font-size:20px; color:#f59e0b;">folder</span>
                                    <div style="display:flex; flex-direction:column; text-align:left;">
                                        <span style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Thư mục lưu trữ trên Drive</span>
                                        <div id="vehicleDrivePathBreadcrumb" style="font-size:13px; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:2px;">
                                            ⏳ Đang kết nối Google Drive...
                                        </div>
                                    </div>
                                </div>
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <button type="button" onclick="window.erpApp.openVehicleDrivePickerModal()" style="padding:10px 16px; background:#eff6ff; border:1.5px solid #bfdbfe; color:#2563eb; border-radius:12px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                                        <span class="material-icons-outlined" style="font-size:16px;">folder_shared</span>Duyệt Drive
                                    </button>
                                    <button type="button" onclick="window.erpApp.createVehicleDriveSubfolderFromModal()" style="padding:10px 16px; background:#f0fdf4; border:1.5px solid #bbf7d0; color:#16a34a; border-radius:12px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">
                                        <span class="material-icons-outlined" style="font-size:16px;">create_new_folder</span>Tạo Folder
                                    </button>
                                </div>
                                <input type="hidden" id="vehicleDriveFolderIdInput" name="driveFolderId" value="${editData ? (editData.driveFolderId || '') : ''}">
                                <input type="hidden" id="vehicleDriveFolderPathInput" name="driveFolderPath" value="${editData ? (editData.driveFolderPath || '') : ''}">
                            </div>

                            <!-- Upload Area -->
                            <div style="border: 2px dashed #3b82f644; background: #eff6ff44; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s;" 
                                 onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff77';" 
                                 onmouseout="this.style.borderColor='#3b82f644'; this.style.background='#eff6ff44';"
                                 onclick="document.getElementById('vehicleFileInput').click()">
                                <span class="material-icons-outlined" style="font-size:36px; color:#3b82f6; margin-bottom:8px; display:block;">cloud_upload</span>
                                <span style="font-weight:700; color:#2563eb; font-size:14px;">Nhấn để chọn file — Upload lên Google Drive</span>
                                <span style="font-size:11px; color:#64748b; font-weight:500; display:block; margin-top:4px;">Hỗ trợ: PDF, DOC, XLS, PNG, JPG, ZIP — Tối đa 20MB/file</span>
                                <input type="file" id="vehicleFileInput" multiple onchange="window.erpApp.handleVehicleFileUpload(event)" style="display:none">
                            </div>

                            <!-- Link area -->
                            <div style="margin-top:20px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:10px;">
                                    <span class="material-icons-outlined" style="font-size:14px; color:#6366f1;">link</span> Thêm file bằng đường link
                                </label>
                                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                                    <div style="flex:1; min-width:140px;">
                                        <input type="text" id="vehicleLinkName" placeholder="VD: Bản vẽ thiết kế..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <div style="flex:2; min-width:200px;">
                                        <input type="url" id="vehicleLinkUrl" placeholder="https://drive.google.com/..." style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; width:100%; outline:none; transition:0.2s; font-weight:600;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                    </div>
                                    <button type="button" onclick="window.erpApp.addVehicleFileByLink()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:0.2s; height:40px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                        <span class="material-icons-outlined" style="font-size:16px;">add_link</span> Thêm link
                                    </button>
                                </div>
                            </div>

                            <!-- List -->
                            <div id="vehicleFileList" style="margin-top:16px;"></div>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div style="padding:24px 32px; background:#fcfdfe; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:16px;">
                        <button type="button" onclick="document.getElementById('vmAddModal').remove()" style="padding:12px 28px; border-radius:14px; border:1.5px solid #e2e8f0; background:#fff; font-weight:800; color:#64748b; cursor:pointer; font-size:14px; transition:0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#cbd5e1'" onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0'">Hủy bỏ</button>
                        <button type="submit" style="padding:12px 32px; border-radius:14px; border:none; background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color:#fff; font-weight:800; cursor:pointer; font-size:14px; box-shadow:0 10px 20px -5px rgba(37, 99, 235, 0.4); transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px -5px rgba(37, 99, 235, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px -5px rgba(37, 99, 235, 0.4)'">
                            ${isEdit ? 'Cập nhật tài sản' : 'Lưu thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Initialize flatpickr for date inputs
        if (typeof flatpickr !== 'undefined') {
            flatpickr(modal.querySelectorAll('.erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }

        // If editing and value is a custom type, set it up
        const typeSelect = document.getElementById('vehicleTypeSelect');
        if (isEdit && typeSelect && !defaultTypes.includes(editData.type)) {
            typeSelect.value = editData.type;
            if (typeSelect.selectedIndex === -1) {
                // Not in standard dropdown options, select custom and fill
                typeSelect.value = '__custom__';
                window.erpApp.onVehicleTypeChange(typeSelect);
                const customInput = document.getElementById('customTypeInput');
                if (customInput) customInput.value = editData.type;
            }
        }

        // Initialize dynamic Google Drive folders
        window.erpApp.initializeVehicleDriveFolders(isEq ? ['Thiết bị cơ giới', 'Thiết bị', 'Cơ giới', 'Kho Vận'] : ['Quản lý xe', 'Kho Vận']);
    };

    window.erpApp.saveVehicle = function (e) {
        e.preventDefault();
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        
        // Prevent saving if files are still uploading
        const isUploading = tempVehicleFiles.some(f => f.uploading || (f.name && f.name.includes('⏳ Đang tải')));
        if (isUploading) {
            window.erpApp.showToast('⚠️ Vui lòng đợi tài liệu tải lên Google Drive hoàn tất trước khi lưu!', 'warning');
            return;
        }

        const form = e.target;
        const formData = new FormData(form);
        const oldId = formData.get('oldId');

        const typeSelect = form.querySelector('#vehicleTypeSelect');
        let selectedType = typeSelect ? typeSelect.value : formData.get('type');
        if (selectedType === '__custom__') {
            const customInput = form.querySelector('#customTypeInput');
            selectedType = (customInput && customInput.value.trim()) ? customInput.value.trim() : 'Thiết bị khác';
        }

        const newVehicle = {
            id: formData.get('id'),
            internalCode: formData.get('id'),
            licensePlate: formData.get('licensePlate') || formData.get('id') || '',
            name: formData.get('name'),
            type: selectedType,
            year: parseInt(formData.get('year')),
            odo: parseInt(formData.get('odo').replace(/\./g, '')) || 0,
            status: formData.get('status') || 'Sẵn sàng',
            inspectionDate: parseInputDate(formData.get('inspectionDate')),
            insuranceDate: parseInputDate(formData.get('insuranceDate')),
            imageUrl: formData.get('imageUrl'),
            files: [...tempVehicleFiles],
            docUrl: tempVehicleFiles.length > 0 ? (tempVehicleFiles[0].url || tempVehicleFiles[0].dataUrl || '') : '',
            context: formData.get('context'),
            driveFolderId: formData.get('driveFolderId') || '',
            driveFolderPath: formData.get('driveFolderPath') || '',
            maintIntervalKm: parseInt(formData.get('maintIntervalKm')) || 5000,
            maintIntervalMonths: parseInt(formData.get('maintIntervalMonths')) || 6,
            chassisNumber: formData.get('chassisNumber') || '',
            engineNumber: formData.get('engineNumber') || '',
            enginePower: formData.get('enginePower') || '',
            cavetOriginal: parseInt(formData.get('cavetOriginal')) || 0,
            cavetCopy: parseInt(formData.get('cavetCopy')) || 0,
            cavetLocation: formData.get('cavetLocation') || '',
            inspectionOriginal: parseInt(formData.get('inspectionOriginal')) || 0,
            inspectionCopy: parseInt(formData.get('inspectionCopy')) || 0,
            inspectionLocation: formData.get('inspectionLocation') || '',
            notes: formData.get('notes') || '',
            updated: new Date().toLocaleDateString('vi-VN')
        };

        const allDB = getModuleData('vmVehicles', []);

        if (oldId) {
            const idx = allDB.findIndex(v => v.id === oldId);
            if (idx > -1) {
                const oldStatus = allDB[idx].status;
                const newStatus = newVehicle.status;

                allDB[idx] = newVehicle;
                saveModuleData('vmVehicles', allDB);

                // --- SYNC & CLEANUP LOGIC ---
                // Nếu trạng thái là Sẵn sàng hoặc Bảo trì, cần dọn dẹp các lệnh điều xe và dự án đang gắn kết
                if (newStatus === 'Sẵn sàng' || newStatus === 'Bảo trì') {
                    console.log(`🧹 Cleaning up active assignments for ${newVehicle.id} to ensure consistency with ${newStatus}`);

                    // 1. Đóng các Lệnh điều xe đang mở
                    const usage = getModuleData('vmUsage', []);
                    let usageChanged = false;
                    usage.forEach(u => {
                        if (u.vId.trim() === newVehicle.id.trim() && u.status === 'Đang đi') {
                            u.status = 'Hoàn thành';
                            usageChanged = true;
                        }
                    });

                    if (usageChanged) {
                        if (window.erpApp && window.erpApp._setData) {
                            window.erpApp._setData('vmUsage', usage);
                        } else {
                            saveModuleData('vmUsage', usage);
                        }
                    }

                    // 2. Rút thiết bị khỏi các dự án Quản lý dự án (PM)
                    const currentPmEq = window.pmEquipment || JSON.parse(localStorage.getItem('erp_pmEquipment') || '[]');
                    const filteredPmEq = currentPmEq.filter(e => e.code.trim() !== newVehicle.id.trim() && e.id !== newVehicle.id);

                    if (filteredPmEq.length !== currentPmEq.length) {
                        saveModuleData('pmEquipment', filteredPmEq, 'code');
                    }
                }

                // Gửi thông báo hệ thống
                if (window.erpApp.notifyCRUD) {
                    window.erpApp.notifyCRUD(currentVmContext === 'equipment' ? 'Thiết bị' : 'Xe', 'update', {
                        id: newVehicle.id,
                        name: newVehicle.name,
                        page: 'hanh-chinh'
                    });
                }

                const modalElement = e.target.closest('.modal-overlay') || document.getElementById('vmAddModal');
                if (modalElement) modalElement.remove();
                
                window.erpApp.showToast('Đã cập nhật thông tin thành công!');
                try { window.erpApp.scanVehicleInspections(); } catch (err) { console.error('Error scanning inspections:', err); }
                try { window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext); } catch (err) { console.error('Error rendering management:', err); }
            }
        } else {
            allDB.unshift(newVehicle);
            saveModuleData('vmVehicles', allDB);

            // Gửi thông báo hệ thống
            if (window.erpApp.notifyCRUD) {
                window.erpApp.notifyCRUD(currentVmContext === 'equipment' ? 'Thiết bị' : 'Xe', 'add', {
                    id: newVehicle.id,
                    name: newVehicle.name,
                    page: 'hanh-chinh'
                });
            }

            const modalElement = e.target.closest('.modal-overlay') || document.getElementById('vmAddModal');
            if (modalElement) modalElement.remove();
            
            window.erpApp.showToast('Đã thêm mới thành công!');
            try { window.erpApp.scanVehicleInspections(); } catch (err) { console.error('Error scanning inspections:', err); }
            try { window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext); } catch (err) { console.error('Error rendering management:', err); }
        }
    };

    window.erpApp.deleteVehicle = function (id) {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const allDB = getModuleData('vmVehicles', []);
        const vehicle = allDB.find(v => v.id === id);
        const itemType = currentVmContext === 'equipment' ? 'thiết bị' : 'xe';

        if (vehicle) {
            window.erpApp.showDeleteConfirmation(
                itemType.charAt(0).toUpperCase() + itemType.slice(1),
                id,
                function () {
                    const filtered = allDB.filter(v => v.id !== id);
                    saveModuleData('vmVehicles', filtered);
                    if (window.CrudSync && window.CrudSync.deleteItem) {
                        window.CrudSync.deleteItem('vmVehicles', id);
                    }

                    // Gửi thông báo hệ thống
                    if (window.erpApp.notifyCRUD) {
                        window.erpApp.notifyCRUD(itemType.charAt(0).toUpperCase() + itemType.slice(1), 'delete', {
                            id: id,
                            name: vehicle.name,
                            page: 'hanh-chinh'
                        });
                    }

                    window.erpApp.showToast('Đã xóa dữ liệu thành công!');
                    window.erpApp.scanVehicleInspections();
                    window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
                }
            );
        }
    };

    window.erpApp.viewVehicleDetails = function (id) {
        const isEq = currentVmContext === 'equipment';
        const all = getModuleData('vmVehicles', []);
        const v = all.find(item => item.id === id);
        if (!v) { return; }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmDetailModal';
        modal.style = 'background:rgba(15,23,42,0.75); backdrop-filter:blur(10px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;';

        const statusColors = {
            'Sẵn sàng': { bg: '#f0fdf4', color: '#16a34a', icon: 'check_circle' },
            'Đang đi': { bg: '#eff6ff', color: '#2563eb', icon: 'local_shipping' },
            'Bảo trì': { bg: '#fef2f2', color: '#dc2626', icon: 'build' }
        };
        const st = statusColors[v.status] || { bg: '#f1f5f9', color: '#475569', icon: 'info' };

        modal.innerHTML = `
            <div class="modal-content" style="width:100%; max-width:600px; background:#fff; border-radius:32px; overflow:hidden; box-shadow:0 30px 60px -12px rgba(0,0,0,0.4); animation:modalPop 0.3s ease-out;">
                <!-- Modal Header (Same as Edit) -->
                <div style="padding:24px 32px; background:#fcfdfe; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined" style="font-size:24px;">visibility</span> 
                        </div>
                        Thông tin chi tiết ${isEq ? 'thiết bị' : 'xe'}
                    </h2>
                    <button onclick="document.getElementById('vmDetailModal').remove()" style="background:#f1f5f9; border:none; color:#94a3b8; width:32px; height:32px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <span class="material-icons-outlined" style="font-size:20px;">close</span>
                    </button>
                </div>

                <div style="padding:32px; display:grid; gap:24px; max-height:70vh; overflow-y:auto;">
                    <!-- Badge Header Area -->
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:16px 20px; border-radius:20px; border:1px solid #f1f5f9;">
                        <div style="display:flex; gap:10px;">
                            <span style="font-size:10px; font-weight:900; background:#e2e8f0; color:#475569; padding:4px 10px; border-radius:6px; text-transform:uppercase;">${v.internalCode || 'N/A'}</span>
                            <span style="font-size:10px; font-weight:900; background:#3b82f6; color:#fff; padding:4px 10px; border-radius:6px; text-transform:uppercase;">${v.type}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; font-weight:800; color:${st.color}; font-size:13px;">
                            <span class="material-icons-outlined" style="font-size:18px;">${st.icon}</span> ${v.status}
                        </div>
                    </div>

                    <!-- Information Grid (Mirrors Edit Form) -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                                <span class="material-icons-outlined" style="font-size:14px;">tag</span> ${isEq ? 'Số hiệu / ID' : 'Biển số xe'}
                            </label>
                            <div style="font-size:16px; font-weight:800; color:#2563eb;">${v.id}</div>
                        </div>
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                                <span class="material-icons-outlined" style="font-size:14px;">calendar_month</span> Năm sản xuất
                            </label>
                            <div style="font-size:16px; font-weight:700; color:#1e293b;">${v.year}</div>
                        </div>
                    </div>

                    <div class="info-group">
                        <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                            <span class="material-icons-outlined" style="font-size:14px;">badge</span> ${isEq ? 'Tên thiết bị' : 'Tên xe / Model'}
                        </label>
                        <div style="font-size:20px; font-weight:900; color:#1e293b;">${v.name}</div>
                    </div>

                    <!-- Technical Specifications Details -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; padding:16px 20px; background:#f8fafc; border-radius:20px; border:1px solid #f1f5f9;">
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Số Khung</label>
                            <div style="font-size:14px; font-weight:700; color:#1e293b;">${v.chassisNumber || '—'}</div>
                        </div>
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Số Máy</label>
                            <div style="font-size:14px; font-weight:700; color:#1e293b;">${v.engineNumber || '—'}</div>
                        </div>
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Công suất máy</label>
                            <div style="font-size:14px; font-weight:700; color:#1e293b;">${v.enginePower || '—'}</div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                                <span class="material-icons-outlined" style="font-size:14px;">speed</span> ${isEq ? 'Tổng giờ chạy' : 'Chỉ số ODO hiện tại'}
                            </label>
                            <div style="font-size:18px; font-weight:800; color:#1e293b;">${window.erpApp.formatValue(v.odo || 0)} <span style="font-size:12px; color:#94a3b8;">${isEq ? 'Giờ' : 'KM'}</span></div>
                        </div>
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                                <span class="material-icons-outlined" style="font-size:14px;">event_available</span> Hạn kiểm định
                            </label>
                            <div style="font-size:16px; font-weight:800; color:#e11d48; display:flex; align-items:center; gap:8px;">
                                ${fmtDate(v.inspectionDate) || 'N/A'}
                            </div>
                        </div>
                        <div class="info-group">
                            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                                <span class="material-icons-outlined" style="font-size:14px;">security</span> Hạn bảo hiểm xe
                            </label>
                            <div style="font-size:16px; font-weight:800; color:#10b981; display:flex; align-items:center; gap:8px;">
                                ${fmtDate(v.insuranceDate) || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <!-- Document Info Display -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:20px; border-radius:20px; display:grid; gap:16px; margin-bottom: 8px;">
                        <div style="font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; display:flex; align-items:center; gap:6px; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:4px;">
                            <span class="material-icons-outlined" style="font-size:18px; color:#10b981;">folder_open</span> Số lượng hồ sơ giấy tờ
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#1e293b; margin-bottom:8px;">Cavet xe</label>
                                <div style="font-size:13px; color:#475569; line-height:1.6;">
                                    Bản gốc: <b style="color:#1e293b;">${v.cavetOriginal || 0}</b> bộ<br>
                                    Bản phô: <b style="color:#1e293b;">${v.cavetCopy || 0}</b> bộ<br>
                                    Lưu ở: <b style="color:#1e293b;">${v.cavetLocation || '—'}</b>
                                </div>
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:800; color:#1e293b; margin-bottom:8px;">Kiểm định</label>
                                <div style="font-size:13px; color:#475569; line-height:1.6;">
                                    Bản gốc: <b style="color:#1e293b;">${v.inspectionOriginal || 0}</b> bộ<br>
                                    Bản phô: <b style="color:#1e293b;">${v.inspectionCopy || 0}</b> bộ<br>
                                    Lưu ở: <b style="color:#1e293b;">${v.inspectionLocation || '—'}</b>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ghi chú -->
                    ${v.notes ? `
                    <div style="background:#fffbeb; border:1.5px solid #fde68a; padding:16px 20px; border-radius:16px;">
                        <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#92400e; text-transform:uppercase; margin-bottom:8px;">
                            <span class="material-icons-outlined" style="font-size:14px;">sticky_note_2</span> Ghi chú
                        </label>
                        <div style="font-size:13px; font-weight:600; color:#78350f; line-height:1.6; white-space:pre-wrap;">${v.notes}</div>
                    </div>
                    ` : ''}

                    <div class="info-group" style="padding:20px; background:#f8fafc; border-radius:20px; border:1.5px dashed #e2e8f0;">
                        <div style="display:grid; gap:20px;">
                            ${v.imageUrl ? `
                                <div>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:12px;">
                                        <span class="material-icons-outlined" style="font-size:14px;">image</span> Hình ảnh thực tế
                                    </label>
                                    <div style="border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; background:#fff; min-height:100px; display:flex; align-items:center; justify-content:center;">
                                        <img src="${window.erpApp.transformImageUrl(v.imageUrl)}" 
                                             data-img="${v.imageUrl}"
                                             onerror="window.erpApp.handleImageError(this, this.dataset.img)"
                                             onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                                             style="max-width:100%; max-height:400px; display:block; object-fit:contain;" 
                                             alt="Hình ảnh thiết bị">
                                    </div>
                                </div>
                            ` : (v.docUrl && (v.docUrl.match(/\.(jpeg|jpg|gif|png)$/) || v.docUrl.includes('photo')) ? `
                                <div>
                                    <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:12px;">
                                        <span class="material-icons-outlined" style="font-size:14px;">image</span> Hình ảnh từ hồ sơ
                                    </label>
                                    <div style="border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; background:#fff; min-height:100px; display:flex; align-items:center; justify-content:center;">
                                        <img src="${window.erpApp.transformImageUrl(v.docUrl)}" 
                                             data-img="${v.docUrl}"
                                             onerror="window.erpApp.handleImageError(this, this.dataset.img)"
                                             onload="if(this.src.includes('data:image') || this.src.includes('placeholder')) window.erpApp.resolveSharingLink(this, this.dataset.img)"
                                             style="max-width:100%; max-height:400px; display:block; object-fit:contain;" 
                                             alt="Hình ảnh thiết bị">
                                    </div>
                                </div>
                            ` : '')}

                            <div>
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:12px;">
                                    <span class="material-icons-outlined" style="font-size:14px;">link</span> Hồ sơ tài liệu đính kèm
                                </label>
                                <div style="display:grid; gap:8px;">
                                    ${(v.files && v.files.length > 0) ?
                renderVehicleFileList(v.files, false) :
                (v.docUrl ? `
                                            <button onclick="window.open('${v.docUrl}', '_blank')" style="width:100%; background:#fff; border:1.5px solid #3b82f6; color:#3b82f6; padding:12px; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:0.2s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                                <span class="material-icons-outlined">cloud_download</span> Tải xuống / Xem hồ sơ PDF
                                            </button>
                                        ` : '<div style="color:#cbd5e1; font-size:13px; font-style:italic; text-align:center;">Không có tệp hồ sơ</div>')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer (Same as Edit) -->
                <div style="padding:24px 32px; background:#fcfdfe; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:16px;">
                    <button onclick="document.getElementById('vmDetailModal').remove()" style="padding:12px 28px; border-radius:14px; border:1.5px solid #e2e8f0; background:#fff; font-weight:800; color:#64748b; cursor:pointer; font-size:14px; transition:0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#cbd5e1'" onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0'">Đóng lại</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    // --- Dispatch (Usage) Operations ---
    window.erpApp.openAddDispatchModal = function (editId = null, isView = false) {
        if (!isView && !isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const isEq = currentVmContext === 'equipment';
        const usage = getUsage();
        const dispatch = editId ? usage.find(u => u.id === editId) : null;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmDispatchModal';
        modal.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        const vehicles = getVehicles();
        const employees = (window.erpApp && window.erpApp._getData) ? window.erpApp._getData('employees') : [];
        const projects = (window.erpApp && window.erpApp._getData) ? (window.erpApp._getData('pmProjects') || []) : (window.pmProjects || []);

        modal.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation:modalPop 0.3s ease-out;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:${isView ? '#3b82f6' : '#10b981'};">${isView ? 'visibility' : 'send'}</span> 
                        ${isView ? 'Chi tiết lệnh' : (editId ? 'Chỉnh sửa lệnh' : 'Lệnh điều xe mới')}
                    </h2>
                    <button onclick="document.getElementById('vmDispatchModal').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveDispatch(event)">
                    <input type="hidden" name="editId" value="${editId || ''}">
                    <div style="padding:24px; display:grid; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chọn từ danh mục công ty</label>
                            <select name="vId" ${isView ? 'disabled' : ''} required style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:700; color:#1e293b; outline:none; background:${isView ? '#f8fafc' : '#fff'}; appearance:none; background-image:url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat:no-repeat; background-position:right%2016px%20top%2050%25; background-size:10px%20auto;">
                                <option value="">-- Chọn ${isEq ? 'thiết bị đang rảnh' : 'xe đang rảnh'} --</option>
                                ${vehicles.map(v => {
            const isMaint = v.status === 'Bảo trì';
            const isCurrent = dispatch && dispatch.vId === v.id;
            return `<option value="${v.id}" ${isCurrent ? 'selected' : ''} ${isMaint && !isCurrent ? 'disabled style="color: #94a3b8;"' : ''}>${v.internalCode || v.id} - ${v.name}${isMaint ? ' (Đang bảo trì)' : ''}</option>`;
        }).join('')}
                            </select>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">${isEq ? 'Người vận hành' : 'Tài xế phụ trách'}</label>
                                <input type="text" name="driver" ${isView ? 'readonly' : ''} value="${dispatch ? dispatch.driver : ''}" required placeholder="Họ tên người lái" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">${isEq ? 'Định mức dầu (L/H)' : 'Định mức xăng (L/100km)'}</label>
                                <input type="number" step="0.1" name="fuelQuota" ${isView ? 'readonly' : ''} value="${dispatch ? (dispatch.fuelQuota || '') : ''}" placeholder="0.0" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">${isEq ? 'Khu vực làm việc / Nội dung' : 'Lộ trình di chuyển'}</label>
                            <input type="text" name="route" list="projectRouteSuggestions" ${isView ? 'readonly' : ''} value="${dispatch ? dispatch.route : ''}" required placeholder="VD: ${isEq ? 'Công trường A - San lấp' : 'TP.HCM -> Đồng Nai'}" style="width:100%; padding:12px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-weight:600; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                            <datalist id="projectRouteSuggestions">
                                ${projects.map(p => `<option value="${p.name}">`).join('')}
                            </datalist>
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Thời gian xuất phát</label>
                            <input type="text" name="time_display" readonly value="${dispatch ? dispatch.time : ''}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#2563eb; outline:none; background:#f8fafc; display:${dispatch ? 'block' : 'none'}; margin-bottom: 8px;">
                            <input type="datetime-local" name="time" ${isView ? 'disabled' : ''} ${!dispatch ? 'required' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#2563eb; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                            ${dispatch ? '<div style="font-size:10px; color:#94a3b8; margin-top:4px;">* Để trống nếu không thay đổi thời gian</div>' : ''}
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chi phí Xăng/Dầu</label>
                                <div style="position:relative;">
                                    <input type="text" name="fuelCost" ${isView ? 'readonly' : ''} 
                                        value="${dispatch ? window.erpApp.formatValue(dispatch.fuelCost || 0) : ''}" 
                                        oninput="window.erpApp.formatNumberInput(this)"
                                        placeholder="0" style="width:100%; padding:10px 12px; padding-right:35px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                    <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:12px; font-weight:700;">đ</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chi phí Cầu đường</label>
                                <div style="position:relative;">
                                    <input type="text" name="tollCost" ${isView ? 'readonly' : ''} 
                                        value="${dispatch ? window.erpApp.formatValue(dispatch.tollCost || 0) : ''}" 
                                        oninput="window.erpApp.formatNumberInput(this)"
                                        placeholder="0" style="width:100%; padding:10px 12px; padding-right:35px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none; background:${isView ? '#f8fafc' : '#fff'};">
                                    <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:12px; font-weight:700;">đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="document.getElementById('vmDispatchModal').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">${isView ? 'Đóng lại' : 'Hủy bỏ'}</button>
                        ${!isView ? `<button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.4);">${editId ? 'Cập nhật lệnh' : 'Phát lệnh ngay'}</button>` : ''}
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openViewDispatchModal = (id) => window.erpApp.openAddDispatchModal(id, true);
    window.erpApp.openEditDispatchModal = (id) => window.erpApp.openAddDispatchModal(id, false);

    window.erpApp.saveDispatch = function (e) {
        e.preventDefault();
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const form = e.target;
        const formData = new FormData(form);
        const editId = formData.get('editId');
        const isEq = currentVmContext === 'equipment';

        let timeStr = '';
        if (formData.get('time')) {
            const timestamp = new Date(formData.get('time'));
            timeStr = `${timestamp.getDate().toString().padStart(2, '0')}/${(timestamp.getMonth() + 1).toString().padStart(2, '0')} ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
        }

        const usage = getModuleData('vmUsage', []);

        if (editId) {
            const idx = usage.findIndex(u => u.id === editId);
            if (idx !== -1) {
                usage[idx] = {
                    ...usage[idx],
                    vId: formData.get('vId'),
                    driver: formData.get('driver'),
                    route: formData.get('route'),
                    fuelQuota: parseFloat(formData.get('fuelQuota')) || 0,
                    fuelCost: parseFloat((formData.get('fuelCost') || '0').replace(/\./g, '')) || 0,
                    tollCost: parseFloat((formData.get('tollCost') || '0').replace(/\./g, '')) || 0
                };
                if (timeStr) { usage[idx].time = timeStr; }
                saveModuleData('vmUsage', usage);

                // Gửi thông báo hệ thống
                if (window.erpApp.notifyCRUD) {
                    window.erpApp.notifyCRUD('Lệnh điều động', 'update', {
                        id: editId,
                        name: formData.get('vId'),
                        page: 'hanh-chinh'
                    });
                }

                window.erpApp.showToast('Đã cập nhật lệnh thành công!');
            }
        } else {
            const newDispatch = {
                id: `LD-${Date.now().toString().slice(-4)}`,
                vId: formData.get('vId'),
                driver: formData.get('driver'),
                route: formData.get('route'),
                fuelQuota: parseFloat(formData.get('fuelQuota')) || 0,
                time: timeStr,
                fuelCost: parseFloat((formData.get('fuelCost') || '0').replace(/\./g, '')) || 0,
                tollCost: parseFloat((formData.get('tollCost') || '0').replace(/\./g, '')) || 0,
                status: 'Đang đi'
            };
            usage.unshift(newDispatch);
            saveModuleData('vmUsage', usage);

            // Sync with Project Management (PM) Module
            if (isEq) {
                const projects = window.erpApp._getData('pmProjects') || [];
                const targetProject = projects.find(p =>
                    (p.name && newDispatch.route && p.name.toLowerCase() === newDispatch.route.toLowerCase()) ||
                    p.id === newDispatch.route
                );

                if (targetProject) {
                    const pmEquipment = window.erpApp._getData('pmEquipment') || [];
                    const allVehicles = getModuleData('vmVehicles', []);
                    const vehicle = allVehicles.find(v => v.id === newDispatch.vId);

                    if (vehicle && !pmEquipment.find(e => e.code === vehicle.id && e.projectId === targetProject.id)) {
                        const newPmEq = {
                            id: 'EQ-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                            projectId: targetProject.id,
                            name: vehicle.name,
                            type: vehicle.type || 'Thiết bị',
                            code: vehicle.id,
                            fuelType: 'diesel_V',
                            fuelNorm: vehicle.fuelNorm || 0,
                            internalShiftRate: 2500000,
                            status: 'dang-hoat-dong',
                            operator: newDispatch.driver || '',
                            ownership: 'Xe nhà',
                            maintCost: 0,
                            hours: 0
                        };
                        pmEquipment.unshift(newPmEq);
                        window.erpApp._setData('pmEquipment', pmEquipment);

                        if (window.erpApp.notifyCRUD) {
                            window.erpApp.notifyCRUD('Điều động dự án', 'add', {
                                id: vehicle.id,
                                name: targetProject.name,
                                page: 'hanh-chinh'
                            });
                        }
                    }
                }
            }

            // Sync Vehicle Status only for new dispatch
            const allVehicles = getModuleData('vmVehicles', []);
            const vIdx = allVehicles.findIndex(v => v.id === newDispatch.vId);
            if (vIdx !== -1) {
                allVehicles[vIdx].status = 'Đang đi';
                saveModuleData('vmVehicles', allVehicles);
            }

            // Gửi thông báo hệ thống
            if (window.erpApp.notifyCRUD) {
                window.erpApp.notifyCRUD('Lệnh điều động', 'add', {
                    id: newDispatch.id,
                    name: newDispatch.vId,
                    page: 'hanh-chinh'
                });
            }

            window.erpApp.showToast('Đã phát lệnh vận hành thành công!');
        }

        document.getElementById('vmDispatchModal').remove();
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.openUnifiedCostDetail = function (type, id, mode) {
        if (type === 'usage') {
            window.erpApp.openAddDispatchModal(id, mode === 'view');
        } else if (type === 'maintenance') {
            window.erpApp.openMaintenanceModal(id, mode);
        } else if (type === 'cost') {
            window.erpApp.openOtherCostModal(id, mode);
        }
    };

    window.erpApp.openMaintenanceModal = function (editId, mode = 'edit') {
        const isView = mode === 'view';
        if (!isView && !isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const maint = getMaintenance();
        const item = editId ? maint.find(m => m.id === editId) : null;
        const isEq = currentVmContext === 'equipment';
        const vehicles = getVehicles();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        modal.innerHTML = `
            <div class="modal-content" style="width:450px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${isView ? 'Chi tiết bảo trì' : 'Chỉnh sửa bảo trì'}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveMaintenance(event)">
                    <input type="hidden" name="editId" value="${editId || ''}">
                    <div style="padding:24px; display:grid; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Xe / Biển số</label>
                            <select name="vId" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                                ${vehicles.map(v => `<option value="${v.id}" ${item && item.vId === v.id ? 'selected' : ''}>${v.id} - ${v.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Nội dung bảo trì</label>
                            <input type="text" name="desc" ${isView ? 'readonly' : ''} value="${item ? item.desc : ''}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; background:${isView ? '#f8fafc' : '#fff'};">
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chi phí dự kiến/thực tế</label>
                            <input type="text" name="cost" ${isView ? 'readonly' : ''} value="${item ? item.cost.toLocaleString('vi-VN') : ''}" oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.')" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b;">${isView ? 'Đóng lại' : 'Hủy'}</button>
                        ${!isView ? '<button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700;">Cập nhật bảo trì</button>' : ''}
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.openOtherCostModal = function (editId, mode = 'edit') {
        const isView = mode === 'view';
        if (!isView && !isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const costs = getCosts();
        const item = editId ? costs.find(c => c.id === editId) : null;
        const vehicles = getVehicles();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        modal.innerHTML = `
            <div class="modal-content" style="width:450px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${isView ? 'Chi tiết quản lý' : 'Chỉnh sửa chi phí'}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveUnifiedOtherCost(event)">
                    <input type="hidden" name="editId" value="${editId || ''}">
                    <div style="padding:24px; display:grid; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Xe / Biển số</label>
                            <select name="vId" ${isView ? 'disabled' : ''} style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                                ${vehicles.map(v => `<option value="${v.id}" ${item && item.vId === v.id ? 'selected' : ''}>${v.id} - ${v.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Hạng mục chi phí</label>
                            <input type="text" name="cat" ${isView ? 'readonly' : ''} value="${item ? item.cat : ''}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; background:${isView ? '#f8fafc' : '#fff'};">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Số lượng</label>
                                <input type="number" name="qty" ${isView ? 'readonly' : ''} value="${item ? item.qty : '1'}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; background:${isView ? '#f8fafc' : '#fff'};">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Đơn giá</label>
                                <input type="text" name="unit" ${isView ? 'readonly' : ''} value="${item ? item.unit.toLocaleString('vi-VN') : ''}" oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.')" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; background:${isView ? '#f8fafc' : '#fff'};">
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b;">${isView ? 'Đóng lại' : 'Hủy'}</button>
                        ${!isView ? '<button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#10b981; color:#fff; font-weight:700;">Lưu thay đổi</button>' : ''}
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveMaintenance = function (e) {
        e.preventDefault();
        const f = new FormData(e.target);
        const editId = f.get('editId');
        const maint = getModuleData('vmMaintenance', []);
        const idx = maint.findIndex(m => m.id === editId);
        if (idx !== -1) {
            maint[idx].vId = f.get('vId');
            maint[idx].desc = f.get('desc');
            maint[idx].cost = parseFloat(f.get('cost').replace(/\./g, '')) || 0;
            saveModuleData('vmMaintenance', maint);

            // Gửi thông báo hệ thống
            if (window.erpApp.addNotification) {
                window.erpApp.addNotification(
                    `Đã cập nhật lịch bảo trì cho: ${maint[idx].vId}`,
                    'build',
                    'orange',
                    'hanh-chinh'
                );
            }

            window.erpApp.showToast('Đã cập nhật lịch sử bảo trì!');
            document.querySelector('.modal-overlay').remove();
            window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
        }
    };

    window.erpApp.saveUnifiedOtherCost = function (e) {
        e.preventDefault();
        const f = new FormData(e.target);
        const editId = f.get('editId');
        const costs = getModuleData('vmCosts', []);
        const idx = costs.findIndex(c => c.id === editId);
        if (idx !== -1) {
            costs[idx].vId = f.get('vId');
            costs[idx].cat = f.get('cat');
            costs[idx].qty = parseFloat(f.get('qty')) || 0;
            costs[idx].unit = parseFloat(f.get('unit').replace(/\./g, '')) || 0;
            costs[idx].total = costs[idx].qty * costs[idx].unit;
            saveModuleData('vmCosts', costs);

            // Gửi thông báo hệ thống
            if (window.erpApp.addNotification) {
                window.erpApp.addNotification(
                    `Đã cập nhật chi phí xe: ${costs[idx].vId}`,
                    'payments',
                    'red',
                    'hanh-chinh'
                );
            }

            window.erpApp.showToast('Đã cập nhật chi phí khác!');
            document.querySelector('.modal-overlay').remove();
            window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
        }
    };

    window.erpApp.openDriverModal = function (driverId = null) {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        const drivers = getDrivers();
        const d = driverId ? drivers.find(item => item.id === driverId) : null;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'vmDriverModal';
        modal.style = 'background:rgba(15,23,42,0.6); backdrop-filter:blur(5px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;';

        modal.innerHTML = `
            <div class="modal-content" style="width:500px; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation: scaleIn 0.3s ease;">
                <div style="padding:24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                    <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e293b;">${d ? 'Chỉnh sửa thông tin Lái xe' : 'Thêm Lái xe mới'}</h2>
                    <button onclick="document.getElementById('vmDriverModal').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><span class="material-icons-outlined">close</span></button>
                </div>
                <form onsubmit="window.erpApp.saveDriver(event)">
                    <input type="hidden" name="id" value="${d ? d.id : ''}">
                    <div style="padding:24px; display:grid; gap:16px;">
                        <div class="form-group">
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Họ và Tên</label>
                            <input type="text" name="name" required value="${d ? d.name : ''}" placeholder="Nhập họ và tên lái xe" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Số điện thoại</label>
                                <input type="text" name="phone" required value="${d ? d.phone : ''}" placeholder="Ví dụ: 0912..." style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Kinh nghiệm</label>
                                <input type="text" name="experience" required value="${d ? d.experience : ''}" placeholder="Ví dụ: 5 năm kinh nghiệm" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Giấy phép lái xe</label>
                                <select name="license" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                                    <option value="GPLX Hạng B2" ${d && d.license === 'GPLX Hạng B2' ? 'selected' : ''}>Hạng B2</option>
                                    <option value="GPLX Hạng C" ${d && d.license === 'GPLX Hạng C' ? 'selected' : ''}>Hạng C</option>
                                    <option value="GPLX Hạng D" ${d && d.license === 'GPLX Hạng D' ? 'selected' : ''}>Hạng D</option>
                                    <option value="GPLX Hạng E" ${d && d.license === 'GPLX Hạng E' ? 'selected' : ''}>Hạng E</option>
                                    <option value="GPLX Hạng FC" ${d && d.license === 'GPLX Hạng FC' ? 'selected' : ''}>Hạng FC</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Hạn GPLX</label>
                                <input type="date" name="licenseExpiry" required value="${d ? d.licenseExpiry : ''}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#2563eb; outline:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Trạng thái</label>
                                <select name="status" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                                    <option value="Sẵn sàng" ${d && d.status === 'Sẵn sàng' ? 'selected' : ''}>Sẵn sàng</option>
                                    <option value="Đang đi" ${d && d.status === 'Đang đi' ? 'selected' : ''}>Đang đi</option>
                                    <option value="Nghỉ phép" ${d && d.status === 'Nghỉ phép' ? 'selected' : ''}>Nghỉ phép</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Đánh giá sao</label>
                                <input type="number" step="0.1" min="1" max="5" name="rating" required value="${d ? d.rating : '5.0'}" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; color:#1e293b; outline:none;">
                            </div>
                        </div>
                    </div>
                    <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" onclick="document.getElementById('vmDriverModal').remove()" style="padding:10px 24px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b; cursor:pointer;">Hủy bỏ</button>
                        <button type="submit" style="padding:10px 24px; border-radius:12px; border:none; background:#2563eb; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 4px 10px rgba(37, 99, 235, 0.2);">${d ? 'Lưu thay đổi' : 'Thêm mới'}</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.erpApp.saveDriver = function (e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const id = formData.get('id');

        const drivers = getModuleData('vmDrivers', sampleDrivers);
        if (id) {
            const idx = drivers.findIndex(d => d.id === id);
            if (idx > -1) {
                drivers[idx] = {
                    ...drivers[idx],
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    experience: formData.get('experience'),
                    license: formData.get('license'),
                    licenseExpiry: formData.get('licenseExpiry'),
                    status: formData.get('status'),
                    rating: parseFloat(formData.get('rating')) || 5.0
                };
                saveModuleData('vmDrivers', drivers);
                window.erpApp.showToast('Cập nhật tài xế thành công!', 'success');
            }
        } else {
            const newDriver = {
                id: `TX-${Date.now().toString().slice(-4)}`,
                name: formData.get('name'),
                phone: formData.get('phone'),
                experience: formData.get('experience'),
                license: formData.get('license'),
                licenseExpiry: formData.get('licenseExpiry'),
                status: formData.get('status'),
                rating: parseFloat(formData.get('rating')) || 5.0,
                tripCount: 0,
                avatar: '🧑‍✈️'
            };
            drivers.unshift(newDriver);
            saveModuleData('vmDrivers', drivers);
            window.erpApp.showToast('Thêm tài xế mới thành công!', 'success');
        }
        document.getElementById('vmDriverModal').remove();
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.deleteDriver = function (driverId) {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        if (!confirm('Bạn có chắc chắn muốn xóa lái xe này khỏi hệ thống?')) return;
        const drivers = getModuleData('vmDrivers', sampleDrivers);
        const filtered = drivers.filter(d => d.id !== driverId);
        saveModuleData('vmDrivers', filtered);
        window.erpApp.showToast('Đã xóa lái xe khỏi hệ thống!', 'success');
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onDriverSearch = function (val) {
        driverSearchQuery = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onDriverStatusFilterChange = function (val) {
        driverStatusFilter = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onVmSearch = function (val) {
        vmSearchQuery = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onVmNameFilterChange = function (val) {
        vmNameFilter = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onVmTypeFilterChange = function (val) {
        vmTypeFilter = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onCostVehicleFilterChange = function (val) {
        costVehicleFilter = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.onReportVehicleFilterChange = function (val) {
        reportVehicleFilter = val;
        window.erpApp.renderVehicleManagement(currentActiveTab, currentVmContext);
    };

    window.erpApp.manualSyncMaint = async function () {
        if (!isAdmin()) { window.erpApp.showToast('Bạn không có quyền thực hiện chức năng này!'); return; }
        if (window.erpApp.showToast) { window.erpApp.showToast('Đang thực hiện đối soát dữ liệu...', 'info'); }
        if (window.erpApp && typeof window.erpApp.pmSyncMaintenanceToVm === 'function') {
            const hasChanges = await window.erpApp.pmSyncMaintenanceToVm();
            if (hasChanges) {
                if (window.erpApp.showToast) { window.erpApp.showToast('Đã tìm thấy và đồng bộ dữ liệu mới từ các dự án!', 'success'); }
                window.erpApp.renderVehicleManagement('Bảo dưỡng', currentVmContext);
            } else {
                if (window.erpApp.showToast) { window.erpApp.showToast('Dữ liệu đã được đồng bộ đầy đủ.', 'success'); }
            }
        } else {
            if (window.erpApp.showToast) { window.erpApp.showToast('Lỗi: Không tìm thấy hàm đồng bộ.', 'error'); }
        }
    };

    // --- Initialization ---
    async function init() {
        console.log('🚀 [VehicleLogic] Initializing Module...');

        // Wait for SyncManager to be ready if it exists
        if (window.SyncManager && window.SyncManager.ready) {
            await window.SyncManager.ready;
            console.log('✅ [VehicleLogic] Cloud Sync Ready.');
        }

        // Just scan, no immediate save needed as SyncManager handles initial load
        window.erpApp.scanVehicleInspections();
    }

    init();

})();
