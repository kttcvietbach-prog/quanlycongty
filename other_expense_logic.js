// ==========================================
// Module: Other Expense Management Pro
// VIETBACHCORP ERP - High Fidelity Redesign
// ==========================================

(function () {
    'use strict';

    // Inject styles for the module
    const styleId = 'other-expense-styles';
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) { oldStyle.remove(); }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
            .office-expense-pro { 
                padding: clamp(16px, 3vw, 30px); 
                font-family: 'Inter', sans-serif; 
                background: #f1f5f9;
                min-height: 100vh;
                width: 100%;
                box-sizing: border-box;
            }
            .header-info-group {
                display: flex !important;
                align-items: center !important;
                gap: 16px;
                flex-wrap: wrap;
            }
            .header-back-btn {
                background: #1e293b !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #ffffff !important;
                width: 42px !important;
                height: 42px !important;
                border-radius: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: all 0.2s ease;
                z-index: 1000 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-right: 8px;
                flex-shrink: 0;
            }
            .header-back-btn:hover {
                background: #334155 !important;
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            .header-back-btn span {
                font-size: 22px !important;
                line-height: 1 !important;
            }
            .header-icon-box { 
                width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff;
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                flex-shrink: 0;
            }
            .header-icon-box span { font-size: 28px; }
            .header-title-box h1 { font-size: clamp(18px, 2.5vw, 24px); font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -0.5px; }
            .header-title-box p { font-size: 13px; color: #64748b; margin: 2px 0 0 0; font-weight: 500; }

            .module-header-pro {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 32px);
                margin-bottom: 24px;
                gap: 16px;
                flex-wrap: wrap;
            }

            .glass-card { 
                background: rgba(255, 255, 255, 0.9); 
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5); 
                border-radius: 20px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.03); 
                padding: clamp(16px, 2.5vw, 24px); 
                width: 100%;
                box-sizing: border-box;
            }

            /* Tabs */
            .module-tabs-container { 
                display: flex; gap: 8px; padding: 6px; 
                background: #e2e8f0; border-radius: 16px; 
                margin-bottom: 24px; width: fit-content;
                max-width: 100%;
                overflow-x: auto;
                scrollbar-width: none;
            }
            .module-tabs-container::-webkit-scrollbar { display: none; }
            
            .tab-btn-modern { 
                display: flex; align-items: center; gap: 8px; padding: 10px clamp(12px, 2vw, 24px); 
                border: none; background: transparent; border-radius: 14px; 
                color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer; 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                flex-shrink: 0;
            }
            .tab-btn-modern span.material-icons-outlined { font-size: 20px; }
            .tab-btn-modern:hover { background: #fff; color: #3b82f6; transform: translateY(-1px); }
            
            .tab-btn-modern.active { color: #fff !important; }
            .tab-btn-modern.tab-dashboard.active { 
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); 
            }
            .tab-btn-modern.tab-requests.active { 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); 
            }
            .tab-btn-modern.tab-print.active { 
                background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); 
            }
            
            /* Stats */
            .stats-row-v2 { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); 
                gap: clamp(16px, 2.5vw, 24px); 
                margin-bottom: clamp(20px, 3vw, 32px); 
            }
            .stat-card-v2 { padding: clamp(20px, 2.5vw, 24px); }
            .stat-label-v2 { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
            .stat-value-v2 { font-size: clamp(24px, 3vw, 32px); font-weight: 800; color: #1e293b; letter-spacing: -1px; }
            .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; margin-top: 12px; }
            .stat-trend.positive { color: #10b981; }

            /* Charts */
            .charts-row-v2 { 
                display: flex; 
                flex-wrap: wrap; 
                gap: clamp(16px, 2.5vw, 24px); 
                margin-bottom: clamp(20px, 3vw, 32px); 
            }
            .chart-main-v2 { flex: 1.6; min-width: min(100%, 450px); }
            .chart-side-v2 { flex: 1; min-width: min(100%, 320px); }
            
            .main-chart-container { height: clamp(250px, 40vh, 350px); width: 100%; position: relative; }
            .donut-chart-container { height: clamp(250px, 40vh, 350px); width: 100%; position: relative; }

            /* Table Toolbar */
            .table-toolbar-pro { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 20px; margin-bottom: 16px; flex-wrap: wrap; }
            
            /* Responsive */
            @media (max-width: 1024px) {
                /* Removed grid-template-columns: 1fr since charts-row-v2 now uses flex-wrap */
            }
            .search-box-pro { flex: 1; display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 12px; }
            .search-box-pro input { border: none; background: none; outline: none; width: 100%; font-size: 14px; font-weight: 600; }
            
            .filter-actions-pro {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            .filter-actions-pro select {
                padding: 10px 14px;
                border-radius: 10px;
                border: 1px solid #e2e8f0;
                background: white;
                font-size: 13px;
                font-weight: 600;
                color: #475569;
                outline: none;
                transition: all 0.2s;
                min-width: 130px;
            }
            .filter-actions-pro select:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Table Styles */
            .table-container-pro { border-radius: 20px; overflow: hidden; }
            .table-responsive-pro { overflow-x: auto; width: 100%; }
            .pro-table { width: 100%; border-collapse: collapse; }
            .pro-table th { padding: 16px 20px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: left; border-bottom: 1px solid #f1f5f9; }
            .pro-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; vertical-align: middle; }
            .pro-table tr:hover { background: #fbfcfe; }

            .code-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; }
            .cat-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; }
            .cat-icon-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
            .text-truncate-v2 { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
            .user-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; }
            .avatar-mini { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; }
            
            .payment-select { padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0; cursor: pointer; outline: none; }
            .payment-select.paid { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
            .payment-select.unpaid { background: #fef3c7; color: #b45309; border-color: #fde68a; }

            .row-actions { display: flex; gap: 6px; justify-content: center; }
            .action-btn-v2 { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .action-btn-v2:hover { background: #e2e8f0; color: #1e293b; }
            .action-btn-v2.delete:hover { background: #fee2e2; color: #ef4444; }

            /* File Upload Zone */
            .file-upload-zone {
                border: 2px dashed #e2e8f0;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .file-upload-zone:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            .file-upload-zone span {
                font-size: 32px;
                color: #3b82f6;
            }
            .file-upload-zone p {
                margin: 0;
                font-size: 13px;
                font-weight: 600;
                color: #64748b;
            }
            .file-preview-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 16px;
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                margin-top: 10px;
                font-size: 13px;
                font-weight: 600;
            }
            .evidence-link-btn {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                color: #3b82f6;
                font-weight: 700;
                font-size: 12px;
                text-decoration: none;
                padding: 4px 8px;
                background: #eff6ff;
                border-radius: 6px;
                transition: all 0.2s;
            }
            .evidence-link-btn:hover {
                background: #dbeafe;
                transform: translateY(-1px);
            }

            /* Modals */
            .modal-overlay-pro { 
                position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
                backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center;
                padding: 20px;
            }
            .modal-content-pro { 
                width: 100%; max-width: 600px; background: #fff; border-radius: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.1); overflow: hidden;
            }
            .modal-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
            .header-title { display: flex; align-items: center; gap: 10px; }
            .header-title h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }
            .close-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f8fafc; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .close-btn:hover { background: #fee2e2; color: #ef4444; }
            .modal-body { padding: 24px; max-height: 75vh; overflow-y: auto; background: #fff; }
            .modal-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .form-group.full-width { grid-column: span 2; }
            .form-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #f1f5f9; border-radius: 12px; font-size: 14px; background: #f8fafc; outline: none; }
            .form-group input:focus { border-color: #3b82f6; background: #fff; }

            .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .detail-item label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
            .detail-item .val { font-size: 15px; font-weight: 600; color: #1e293b; }

            .batch-print-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .charts-row-v2 { grid-template-columns: 1fr; }
            }

            @media (max-width: 768px) {
                .office-expense-pro { padding: 16px; }
                .module-header-pro { flex-direction: column; align-items: stretch; gap: 16px; padding: 20px; }
                .header-info-group { flex-direction: row; }
                .header-title-box h1 { font-size: 20px; }
                .module-tabs-container { width: 100%; overflow-x: auto; padding: 4px; }
                .tab-btn-modern { padding: 8px 16px; font-size: 13px; }
                
                .stats-row-v2 { grid-template-columns: 1fr; }
                .table-toolbar-pro { flex-direction: column; align-items: stretch; }
                .filter-actions-pro { justify-content: space-between; }
                .filter-actions-pro select { flex: 1; min-width: 0; }
                
                .batch-print-toolbar { flex-direction: column; align-items: stretch; gap: 12px; }

                /* Mobile Table Card Layout */
                .pro-table, .pro-table thead, .pro-table tbody, .pro-table th, .pro-table td, .pro-table tr { display: block; }
                .pro-table thead { display: none; }
                .pro-table tr { margin-bottom: 16px; border: 1px solid #f1f5f9; border-radius: 16px; background: #fff; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                .pro-table td { border: none; padding: 8px 4px; display: flex; justify-content: space-between; align-items: center; text-align: right; }
                .pro-table td::before { content: attr(data-label); font-weight: 800; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: left; }
                .pro-table td:last-child { justify-content: flex-end; border-top: 1px solid #f8fafc; margin-top: 8px; padding-top: 12px; }
                
                .text-truncate-v2 { max-width: 180px; }
                
                .modal-overlay-pro { padding: 12px; }
                .modal-content-pro { border-radius: 20px; }
                .form-grid { grid-template-columns: 1fr; }
                .form-group.full-width { grid-column: span 1; }
                .detail-grid { grid-template-columns: 1fr; }
            }

            @media (max-width: 480px) {
                .header-title-box h1 { font-size: 18px; }
                .stat-value-v2 { font-size: 26px; }
                .tab-label { display: none; }
                .tab-btn-modern { padding: 10px; }
                .pro-table td::before { font-size: 10px; }
            }
        
        `;
    document.head.appendChild(style);

    // === Guard: Ensure formatValue/parseVND exist regardless of script load order ===
    if (!window.erpApp.formatValue && window.erpUtils && window.erpUtils.formatValue) {
        window.erpApp.formatValue = window.erpUtils.formatValue;
    }
    if (!window.erpApp.parseVND && window.erpUtils && window.erpUtils.parseVND) {
        window.erpApp.parseVND = window.erpUtils.parseVND;
    }
    if (!window.erpApp.formatNumberInput && window.erpUtils && window.erpUtils.formatNumberInput) {
        window.erpApp.formatNumberInput = window.erpUtils.formatNumberInput;
    }
    // Fallback if erpUtils itself hasn't loaded yet
    if (!window.erpApp.formatValue) {
        window.erpApp.formatValue = (val) => {
            if (val === null || val === undefined || val === '') return '0';
            const num = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(/,/g, '')) : val;
            if (isNaN(num)) return '0';
            return num.toLocaleString('vi-VN');
        };
    }
    if (!window.erpApp.parseVND) {
        window.erpApp.parseVND = (str) => {
            if (!str) return 0;
            return parseFloat(String(str).replace(/\./g, '').replace(/,/g, '')) || 0;
        };
    }

    window.erpApp.formatExpenseAmountInput = function (input) {
        let value = input.value.replace(/\D/g, '');
        if (value === '') {
            input.value = '';
            return;
        }
        input.value = parseInt(value).toLocaleString('vi-VN');
    };

    // ==========================================
    // Constants & State
    // ==========================================
    const COLLECTION_EXPENSES = 'other_expenses';

    const EXPENSE_CATEGORIES = {
        'CONG_TAC': { label: 'Chi phí công tác', icon: 'flight', color: '#3B82F6', tk: '642' },
        'DAO_TAO': { label: 'Chi phí đào tạo', icon: 'school', color: '#F59E0B', tk: '642' },
        'QUANG_CAO': { label: 'Marketing & Quảng cáo', icon: 'campaign', color: '#EF4444', tk: '641' },
        'SU_KIEN': { label: 'Sự kiện & Phong trào', icon: 'celebration', color: '#10B981', tk: '642' },
        'GIAO_TE': { label: 'Chi phí giao tế', icon: 'handshake', color: '#6366F1', tk: '642' },
        'SUA_KHO_BAI': { label: 'Chi phí sửa chữa kho bãi', icon: 'warehouse', color: '#8B5CF6', tk: '642' },
        'SUA_VAN_PHONG': { label: 'Chi phí sửa văn phòng', icon: 'domain', color: '#EC4899', tk: '642' },
        'KHAC': { label: 'Chi phí khác', icon: 'pending_actions', color: '#64748b', tk: '642' }
    };

    let otherExpenses = [];
    let currentTab = 'dashboard'; 
    let dashboardMonth = new Date().getMonth() + 1; // 1-12
    let dashboardYear = new Date().getFullYear();
    let selectedForPrint = new Set();
    let filterMonth = 'all';
    let filterYear = new Date().getFullYear().toString();
    let tempExpenseFiles = [];

    // formatDate is now provided globally via window.erpApp.formatDate

    function sortOtherExpenses() {
        otherExpenses.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            const idA = a.id || '';
            const idB = b.id || '';
            return idB.localeCompare(idA);
        });
    }

    // ==========================================
    // Initialization
    // ==========================================
    async function init() {
        console.log('🚀 [OtherExpense] Đang khởi tạo module...');

        // 1. Tải nhanh từ LocalStorage
        otherExpenses = window.erpApp._getData(COLLECTION_EXPENSES) || [];
        sortOtherExpenses();

        // Hạt giống dữ liệu nếu chưa có đề xuất nào
        if (!otherExpenses || otherExpenses.length === 0) {
            otherExpenses = [
                {
                    id: 'OTH-2026-1001',
                    requester: 'Nguyễn Quang Quốc',
                    date: '2026-05-18',
                    category: 'SUA_KHO_BAI',
                    amount: 15000000,
                    advance: 3000000,
                    desc: 'Sửa chữa và nâng cấp hệ thống thoát nước kho bãi trung tâm',
                    invoiceNo: 'HD-KOB-001',
                    evidenceUrl: '',
                    fileData: null,
                    status: 'approved',
                    paymentStatus: 'unpaid',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'OTH-2026-1002',
                    requester: 'Nguyễn Quang Quốc',
                    date: '2026-05-18',
                    category: 'SUA_VAN_PHONG',
                    amount: 8500000,
                    advance: 0,
                    desc: 'Sơn lại văn phòng làm việc và thay thế hệ thống đèn chiếu sáng',
                    invoiceNo: 'HD-VP-092',
                    evidenceUrl: '',
                    fileData: null,
                    status: 'approved',
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'OTH-2026-1003',
                    requester: 'Nguyễn Quang Quốc',
                    date: '2026-05-15',
                    category: 'CONG_TAC',
                    amount: 3200000,
                    advance: 0,
                    desc: 'Chi phí công tác gặp gỡ đối tác khảo sát dự án Việt Bách',
                    invoiceNo: 'HD-CT-554',
                    evidenceUrl: '',
                    fileData: null,
                    status: 'approved',
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString()
                }
            ];
            window.erpApp._setData(COLLECTION_EXPENSES, otherExpenses);
            if (window.CrudSync) {
                for (const item of otherExpenses) {
                    try {
                        await window.CrudSync.saveItem(COLLECTION_EXPENSES, item, 'id');
                    } catch (e) { }
                }
            }
        }

        console.log(`📦 [OtherExpense] Load nhanh: ${otherExpenses.length} đề xuất.`);

        // Render ngay lập tức
        window.erpApp.renderOtherExpense();

        // 2. Đợi đồng bộ Cloud
        if (window.SyncManager) {
            await window.SyncManager.ready;
            const cloudExpenses = window.erpApp._getData(COLLECTION_EXPENSES);

            if (cloudExpenses && cloudExpenses.length > 0) {
                otherExpenses = cloudExpenses;
                sortOtherExpenses();
            }

            console.log(`☁️ [OtherExpense] Đã đồng bộ từ Cloud: ${otherExpenses.length} đề xuất.`);
            window.erpApp.renderOtherExpense();
        }

        // 3. Phím tắt quay lại
        document.addEventListener('keydown', handleKeyNavigation);
    }

    function handleKeyNavigation(e) {
        if (window.erpApp.currentPage !== 'Chi phí khác') return;
        // Nếu đang gõ phím thì bỏ qua
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        if (e.key === 'Escape' || e.key === 'Backspace') {
            window.erpApp.navigateTo('hanh-chinh');
        }
    }

    // ==========================================
    // Main Renderer
    // ==========================================
    window.erpApp.renderOtherExpense = function () {
        const pageContent = window.erpApp.getPageContent();
        if (!pageContent) {return;}

        window.erpApp.currentPage = 'Chi phí khác';
        window.erpApp.updateBreadcrumb('Chi phí khác', 'Hành chính');

        let html = `
            <div class="office-expense-pro animated fadeIn">
                <!-- Premium Header Card (Glassmorphism) -->
                <div class="glass-card module-header-pro">
                    <div class="header-info-group">
                        <button class="header-back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')" title="Quay lại (Esc)">
                            <span class="material-icons-outlined">arrow_back</span>
                        </button>
                        <div class="header-icon-box" style="background: linear-gradient(135deg, #64748b 0%, #334155 100%);">
                            <span class="material-icons-outlined">payments</span>
                        </div>
                        <div class="header-title-box">
                            <h1>Chi phí khác</h1>
                            <p>Quản lý các loại chi phí ngoài văn phòng, chi phí biến đổi và phát sinh khác</p>
                        </div>
                    </div>
                    <button class="btn-primary-pro" onclick="window.erpApp.openNewOtherExpenseModal()">
                        <span class="material-icons-outlined">add_circle</span> 
                        <span>Đề xuất mới</span>
                    </button>
                </div>

                <!-- Modern Tabs V3 -->
                <div class="module-tabs-container">
                    <button class="tab-btn-modern tab-dashboard ${currentTab === 'dashboard' ? 'active' : ''}" onclick="window.erpApp.setOtherExpenseTab('dashboard')">
                        <span class="material-icons-outlined">space_dashboard</span>
                        <span class="tab-label">Bảng điều khiển</span>
                    </button>
                    <button class="tab-btn-modern tab-requests ${currentTab === 'requests' ? 'active' : ''}" onclick="window.erpApp.setOtherExpenseTab('requests')">
                        <span class="material-icons-outlined">request_quote</span>
                        <span class="tab-label">Đề xuất chi phí</span>
                    </button>

                </div>

                <div id="otherExpenseModuleBody">
                    ${renderTabContent()}
                </div>
            </div>
        `;

        pageContent.innerHTML = html;
        if (currentTab === 'dashboard') {
            setTimeout(initDashboardCharts, 100);
        }
    };

    function renderTabContent() {
        switch (currentTab) {
            case 'dashboard': return renderDashboard();
            case 'requests': return renderRequests();

            default: return '';
        }
    }

    window.erpApp.setOtherExpenseTab = function (tab) {
        currentTab = tab;
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.applyOtherExpenseFilters = function() {
        const query = document.getElementById('otherSearchInput')?.value.toLowerCase() || '';
        const cat = document.getElementById('otherCatFilter')?.value || 'all';
        const month = document.getElementById('otherMonthFilter')?.value || 'all';
        const year = document.getElementById('otherYearFilter')?.value || 'all';

        const filtered = otherExpenses.filter(e => {
            const eDate = window.erpApp.toJsDate(e.date);
            const mMatch = month === 'all' || (eDate.getMonth() + 1).toString() === month;
            const yMatch = year === 'all' || eDate.getFullYear().toString() === year;
            const cMatch = cat === 'all' || e.category === cat;
            const sMatch = !query || e.desc.toLowerCase().includes(query) || e.id.toLowerCase().includes(query) || e.requester.toLowerCase().includes(query);
            
            return mMatch && yMatch && cMatch && sMatch;
        });

        const tbody = document.getElementById('otherExpenseTableBody');
        if (tbody) { tbody.innerHTML = renderTableRows(filtered); }
    };

    window.erpApp.filterOtherExpenses = function (query) {
        window.erpApp.applyOtherExpenseFilters();
    };

    window.erpApp.filterOtherByCategory = function (cat) {
        window.erpApp.applyOtherExpenseFilters();
    };

    // Dashboard filter handler
    window.erpApp.setOtherExpenseDashboardFilter = function () {
        const mEl = document.getElementById('otherDashMonthFilter');
        const yEl = document.getElementById('otherDashYearFilter');
        if (mEl) dashboardMonth = parseInt(mEl.value);
        if (yEl) dashboardYear = parseInt(yEl.value);
        window.erpApp.renderOtherExpense();
    };

    function getFilteredByMonthOther(expenses, month, year) {
        return expenses.filter(e => {
            const d = window.erpApp.toJsDate(e.date);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
        });
    }

    function renderDashboard() {
        const filtered = getFilteredByMonthOther(otherExpenses, dashboardMonth, dashboardYear);
        const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0);

        const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

        return `
            <div class="expense-dashboard-v2 animated fadeInUp">
                <!-- Dashboard Filter -->
                <div class="glass-card" style="margin-bottom:20px; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; border-radius:16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#64748b; font-size:22px;">filter_list</span>
                        <span style="font-weight:700; color:#334155; font-size:14px;">Bộ lọc biểu đồ</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                        <select id="otherDashMonthFilter" onchange="window.erpApp.setOtherExpenseDashboardFilter()" style="padding:10px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:700; background:#fff; cursor:pointer; outline:none; min-width:130px;">
                            ${monthNames.map((name, i) => `<option value="${i+1}" ${dashboardMonth === i+1 ? 'selected' : ''}>${name}</option>`).join('')}
                        </select>
                        <select id="otherDashYearFilter" onchange="window.erpApp.setOtherExpenseDashboardFilter()" style="padding:10px 16px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:700; background:#fff; cursor:pointer; outline:none; min-width:100px;">
                            ${[2024, 2025, 2026, 2027].map(y => `<option value="${y}" ${dashboardYear === y ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="stats-row-v2">
                    <div class="glass-card stat-card-v2">
                        <span class="stat-label-v2">TỔNG CHI TIÊU ${monthNames[dashboardMonth - 1].toUpperCase()}</span>
                        <div class="stat-value-v2">${window.erpApp.formatValue(totalSpent)}</div>
                        <div class="stat-trend positive">
                            <span class="material-icons-outlined">trending_up</span>
                            <span>Tính trên ${filtered.length} đề xuất đã tạo trong tháng</span>
                        </div>
                    </div>
                </div>

                <div class="charts-row-v2">
                    <div class="glass-card chart-main-v2">
                        <div class="chart-header-v2">
                            <h3>Chi phí các tháng trong năm ${dashboardYear}</h3>
                        </div>
                        <div class="main-chart-container">
                            <canvas id="otherMonthlyTrendChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-card chart-side-v2">
                        <div class="chart-header-v2">
                            <h3>Chi phí theo hạng mục (${monthNames[dashboardMonth - 1]})</h3>
                        </div>
                        <div class="donut-chart-container">
                            <canvas id="otherExpenseCategoryChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="glass-card recent-requests-card animated fadeInUp" style="margin-top: 24px;">
                    <div class="card-header-v2">
                        <h3>Đề xuất trong ${monthNames[dashboardMonth - 1]}/${dashboardYear}</h3>
                        <button class="btn-text" onclick="window.erpApp.setOtherExpenseTab('requests')">Xem tất cả</button>
                    </div>
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th>Mã số</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung</th>
                                    <th class="text-right">Số tiền</th>
                                    <th>Thanh toán</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.slice(0, 10).map(e => {
            const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            const isPaid = e.paymentStatus === 'paid';
            return `
                                        <tr>
                                            <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                                            <td data-label="Hạng mục">
                                                <div class="cat-cell">
                                                    <span class="material-icons-outlined" style="color:${cat.color}; font-size:16px;">${cat.icon}</span>
                                                    <span>${cat.label}</span>
                                                </div>
                                            </td>
                                            <td data-label="Nội dung"><div class="text-truncate" style="max-width:200px;">${e.desc}</div></td>
                                            <td data-label="Số tiền" class="text-right" style="font-weight:700;">${window.erpApp.formatValue(e.amount)}</td>
                                            <td data-label="Thanh toán">
                                                <select class="payment-select ${isPaid ? 'paid' : 'unpaid'}" onchange="window.erpApp.toggleOtherPaymentStatus('${e.id}', this.value)">
                                                    <option value="unpaid" ${!isPaid ? 'selected' : ''}>Chưa thanh toán</option>
                                                    <option value="paid" ${isPaid ? 'selected' : ''}>Đã thanh toán</option>
                                                </select>
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
    }

    function initDashboardCharts() {
        initCategoryChart();
        initTrendChart();
    }

    function initCategoryChart() {
        const ctx = document.getElementById('otherExpenseCategoryChart');
        if (!ctx) {return;}

        const filtered = getFilteredByMonthOther(otherExpenses, dashboardMonth, dashboardYear);

        const dataByCat = {};
        Object.keys(EXPENSE_CATEGORIES).forEach(key => {
            const total = filtered
                .filter(e => e.category === key)
                .reduce((sum, e) => sum + e.amount, 0);
            if (total > 0) {dataByCat[key] = total;}
        });

        const labels = Object.keys(dataByCat).map(k => EXPENSE_CATEGORIES[k].label);
        const data = Object.values(dataByCat);
        const colors = Object.keys(dataByCat).map(k => EXPENSE_CATEGORIES[k].color);

        if (window.myOtherExpenseChart) {window.myOtherExpenseChart.destroy();}

        if (data.length === 0) {
            ctx.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:13px; font-weight:600;"><span class="material-icons-outlined" style="margin-right:8px;">info</span>Không có dữ liệu trong tháng này</div>';
            return;
        }

        window.myOtherExpenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, font: { size: 11, weight: '600' } } },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: { label: (ctx) => ` ${window.erpApp.formatValue(ctx.raw)}` }
                    }
                }
            }
        });
    }

    function initTrendChart() {
        const ctx = document.getElementById('otherMonthlyTrendChart');
        if (!ctx) {return;}

        const months = [];
        const data = [];
        const bgColors = [];
        const borderColors = [];

        for (let i = 1; i <= 12; i++) {
            months.push(`T${i}`);
            const monthTotal = otherExpenses
                .filter(e => {
                    const eDate = window.erpApp.toJsDate(e.date);
                    return eDate.getMonth() + 1 === i && eDate.getFullYear() === dashboardYear;
                })
                .reduce((sum, e) => sum + e.amount, 0);
            data.push(monthTotal);

            if (i === dashboardMonth) {
                bgColors.push('#64748b');
                borderColors.push('#475569');
            } else {
                bgColors.push('#e2e8f0');
                borderColors.push('#cbd5e1');
            }
        }

        if (window.myOtherTrendChart) {window.myOtherTrendChart.destroy();}

        window.myOtherTrendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Chi phí',
                    data: data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: { label: (ctx) => ` ${window.erpApp.formatValue(ctx.raw)}` }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { callback: value => value >= 1000000 ? (value / 1000000) + 'tr' : window.erpApp.formatValue(value) }
                    },
                    x: { grid: { display: false } }
                },
                onClick: function(evt, elements) {
                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        dashboardMonth = idx + 1;
                        const mEl = document.getElementById('otherDashMonthFilter');
                        if (mEl) mEl.value = dashboardMonth;
                        window.erpApp.renderOtherExpense();
                    }
                }
            }
        });
    }

    function renderRequests() {
        const selCount = selectedForPrint.size;
        const selTotal = otherExpenses.filter(e => selectedForPrint.has(e.id)).reduce((sum, e) => sum + e.amount, 0);

        return `
            <div class="requests-container animated fadeInUp">
                <div class="table-toolbar-pro glass-card">
                    <div class="search-box-pro">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="otherSearchInput" placeholder="Tìm kiếm đề xuất..." onkeyup="window.erpApp.filterOtherExpenses(this.value)">
                    </div>
                    <div class="filter-actions-pro">
                        <select id="otherMonthFilter" onchange="window.erpApp.applyOtherExpenseFilters()">
                            <option value="all">Tất cả tháng</option>
                            ${Array.from({length: 12}, (_, i) => `<option value="${i+1}">Tháng ${i+1}</option>`).join('')}
                        </select>
                        <select id="otherYearFilter" onchange="window.erpApp.applyOtherExpenseFilters()">
                            <option value="all">Tất cả năm</option>
                            ${[2024, 2025, 2026].map(y => `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>Năm ${y}</option>`).join('')}
                        </select>
                        <select id="otherCatFilter" onchange="window.erpApp.applyOtherExpenseFilters()">
                            <option value="all">Tất cả hạng mục</option>
                            ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}">${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Batch Print Toolbar -->
                <div class="glass-card batch-print-toolbar" style="margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-radius: 16px; ${selCount > 0 ? 'border: 1.5px solid #3b82f6; background: #f0f7ff;' : ''}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="material-icons-outlined" style="color:${selCount > 0 ? '#3b82f6' : '#94a3b8'}; font-size:22px;">checklist</span>
                        <span style="font-weight:700; color:${selCount > 0 ? '#1e3a8a' : '#64748b'}; font-size:14px;">
                            ${selCount > 0 ? `Đã chọn <strong>${selCount}</strong> phiếu • Tổng: <strong>${window.erpApp.formatValue(selTotal)} VNĐ</strong>` : 'Chưa chọn phiếu nào — Tích chọn để in đề xuất'}
                        </span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        ${selCount > 0 ? `
                            <button class="btn-text" style="color:#ef4444;" onclick="window.erpApp.clearOtherPrintSelection()">
                                <span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">clear_all</span>
                                Bỏ chọn tất cả
                            </button>
                        ` : ''}
                        <button class="btn-primary-pro" style="padding: 10px 20px; font-size: 13px; ${selCount < 1 ? 'opacity:0.4; pointer-events:none;' : ''}" onclick="window.erpApp.printMultipleOtherExpenses()">
                            <span class="material-icons-outlined" style="font-size:18px;">print</span>
                            In đề xuất đã chọn (${selCount})
                        </button>
                    </div>
                </div>

                <div class="glass-card table-container-pro">
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">
                                        <input type="checkbox" id="selectAllOtherExpensePrint" ${selCount === otherExpenses.length && selCount > 0 ? 'checked' : ''}
                                            onchange="window.erpApp.toggleAllOtherPrintSelection(this.checked)"
                                            style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                                    </th>
                                    <th>Mã số</th>
                                    <th>Ngày</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung chi tiết</th>
                                    <th>Người đề xuất</th>
                                    <th class="text-right">Số tiền</th>
                                    <th>Chứng từ</th>
                                    <th>Thanh toán</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="otherExpenseTableBody">
                                ${renderTableRows(otherExpenses)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function renderPrintTab() {
        const selCount = selectedForPrint.size;
        const selTotal = otherExpenses.filter(e => selectedForPrint.has(e.id)).reduce((sum, e) => sum + e.amount, 0);

        return `
            <div class="print-tab-container animated fadeInUp">
                <div class="glass-card info-banner" style="margin-bottom: 24px; background: #eff6ff; border-color: #bfdbfe; padding: 16px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span class="material-icons-outlined" style="color:#3b82f6; font-size:32px;">info</span>
                        <div>
                            <h4 style="margin:0; color:#1e3a8a;">Hướng dẫn in phiếu</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#1e40af;">Tích chọn các đề xuất cần in, sau đó bấm "In tất cả đã chọn" để in gộp nhiều phiếu trên một trang. Hoặc bấm "In phiếu" để in từng phiếu riêng lẻ.</p>
                        </div>
                    </div>
                </div>

                <div class="glass-card batch-print-toolbar" style="margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-radius: 16px; ${selCount > 0 ? 'border: 1.5px solid #3b82f6; background: #f0f7ff;' : ''}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="material-icons-outlined" style="color:${selCount > 0 ? '#3b82f6' : '#94a3b8'}; font-size:22px;">checklist</span>
                        <span style="font-weight:700; color:${selCount > 0 ? '#1e3a8a' : '#64748b'}; font-size:14px;">
                            ${selCount > 0 ? `Đã chọn <strong>${selCount}</strong> phiếu • Tổng: <strong>${window.erpApp.formatValue(selTotal)} VNĐ</strong>` : 'Chưa chọn phiếu nào'}
                        </span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        ${selCount > 0 ? `
                            <button class="btn-text" style="color:#ef4444;" onclick="window.erpApp.clearOtherPrintSelection()">
                                <span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">clear_all</span>
                                Bỏ chọn tất cả
                            </button>
                        ` : ''}
                        <button class="btn-primary-pro" style="padding: 10px 20px; font-size: 13px; ${selCount < 1 ? 'opacity:0.4; pointer-events:none;' : ''}" onclick="window.erpApp.printMultipleOtherExpenses()">
                            <span class="material-icons-outlined" style="font-size:18px;">print</span>
                            In tất cả đã chọn (${selCount})
                        </button>
                    </div>
                </div>

                <div class="glass-card table-container-pro">
                    <div class="table-responsive-pro">
                        <table class="pro-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">
                                        <input type="checkbox" id="selectAllOtherPrint" ${selCount === otherExpenses.length && selCount > 0 ? 'checked' : ''}
                                            onchange="window.erpApp.toggleAllOtherPrintSelection(this.checked)"
                                            style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                                    </th>
                                    <th>Mã số</th>
                                    <th>Ngày</th>
                                    <th>Hạng mục</th>
                                    <th>Nội dung</th>
                                    <th>Người đề xuất</th>
                                    <th class="text-right">Số tiền</th>
                                    <th>Chứng từ</th>
                                    <th>Thanh toán</th>
                                    <th class="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${otherExpenses.map(e => {
                                    const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
                                    const isSelected = selectedForPrint.has(e.id);
                                    return `
                                        <tr style="${isSelected ? 'background:#f0f7ff;' : ''}">
                                            <td style="text-align:center;">
                                                <input type="checkbox" ${isSelected ? 'checked' : ''}
                                                    onchange="window.erpApp.toggleOtherPrintSelection('${e.id}', this.checked)"
                                                    style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                                            </td>
                                            <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                                            <td data-label="Ngày"><div class="date-cell">${window.erpApp.formatDate(e.date)}</div></td>
                                            <td data-label="Hạng mục">
                                                <div class="cat-cell">
                                                    <span class="material-icons-outlined" style="color:${cat.color}; font-size:16px;">${cat.icon}</span>
                                                    <span>${cat.label}</span>
                                                </div>
                                            </td>
                                            <td data-label="Nội dung"><div class="text-truncate" style="max-width:200px;">${e.desc}</div></td>
                                            <td data-label="Người đề xuất">
                                                <div class="user-cell">
                                                    <div class="avatar-mini">${e.requester.charAt(0)}</div>
                                                    <span style="font-size:12px;">${e.requester}</span>
                                                </div>
                                            </td>
                                            <td data-label="Số tiền" class="text-right font-bold">
                                                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                                                    <span style="font-size: 13px; color: #1e293b;">${window.erpApp.formatValue(e.amount)}</span>
                                                    ${e.advance > 0 ? `<span style="font-size: 10px; color: #ef4444; font-weight: 500;">T.Ứng: -${window.erpApp.formatValue(e.advance)}</span>` : ''}
                                                </div>
                                            </td>
                                            <td data-label="Chứng từ">
                                                 <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                                     ${e.files && e.files.length > 0 ?
                                                         e.files.map((file, idx) => `
                                                             <a href="${file.url || file.dataUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-right:8px;" title="${file.name}">
                                                                 <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                                                 ${e.files.length > 1 ? `Tệp ${idx + 1}` : (e.invoiceNo || 'Xem')}
                                                             </a>
                                                         `).join('')
                                                         : (e.evidenceUrl ? `
                                                             <a href="${e.evidenceUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để xem chứng từ">
                                                                 <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                                                 ${e.invoiceNo || 'Xem'}
                                                             </a>
                                                         ` : (e.fileData ? `
                                                             <a href="javascript:void(0)" onclick="window.erpApp.downloadOtherFile('${e.id}')" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để tải chứng từ">
                                                                 <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                                                 ${e.invoiceNo || 'Xem'}
                                                             </a>
                                                         ` : `<span style="color:#94a3b8; font-style:italic; font-size:12px;">${e.invoiceNo || '---'}</span>`))
                                                     }
                                                 </div>
                                            </td>
                                            <td data-label="Thanh toán">
                                                <select class="payment-select ${e.paymentStatus === 'paid' ? 'paid' : 'unpaid'}" onchange="window.erpApp.toggleOtherPaymentStatus('${e.id}', this.value)">
                                                    <option value="unpaid" ${e.paymentStatus !== 'paid' ? 'selected' : ''}>Chưa TT</option>
                                                    <option value="paid" ${e.paymentStatus === 'paid' ? 'selected' : ''}>Đã TT</option>
                                                </select>
                                            </td>
                                            <td class="text-center">
                                                <button class="btn-primary-pro" style="padding: 8px 16px; font-size: 12px; border-radius:10px;" onclick="window.erpApp.printOtherExpense('${e.id}')">
                                                    <span class="material-icons-outlined" style="font-size:16px;">print</span>
                                                    In phiếu
                                                </button>
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
    }

    function renderTableRows(data) {
        if (!data || data.length === 0) {
            return '<tr><td colspan="10" class="text-center" style="padding: 40px; color: #94a3b8;">Không tìm thấy đề xuất nào</td></tr>';
        }
        return data.map(e => {
            const cat = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
            const isSelected = selectedForPrint.has(e.id);
            return `
                <tr style="${isSelected ? 'background:#f0f7ff;' : ''}">
                    <td style="text-align:center;" data-label="Chọn">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}
                            onchange="window.erpApp.toggleOtherPrintSelection('${e.id}', this.checked)"
                            style="width:18px; height:18px; cursor:pointer; accent-color:#3b82f6;">
                    </td>
                    <td data-label="Mã số"><span class="code-badge">${e.id}</span></td>
                    <td data-label="Ngày"><div class="date-cell">${window.erpApp.formatDate(e.date)}</div></td>
                    <td data-label="Hạng mục">
                        <div class="cat-cell">
                            <div class="cat-icon-circle" style="background:${cat.color}15; color:${cat.color}">
                                <span class="material-icons-outlined">${cat.icon}</span>
                            </div>
                            <span>${cat.label}</span>
                        </div>
                    </td>
                    <td data-label="Nội dung"><div class="text-truncate-v2" title="${e.desc}">${e.desc}</div></td>
                    <td data-label="Người đề xuất">
                        <div class="user-cell">
                            <div class="avatar-mini">${e.requester.charAt(0)}</div>
                            <span>${e.requester}</span>
                        </div>
                    </td>
                    <td data-label="Số tiền" class="text-right">
                        <div style="display:flex; flex-direction:column; align-items:flex-end;">
                            <span style="font-weight:700; color:#1e293b;">${window.erpApp.formatValue(e.amount)}</span>
                            ${e.advance > 0 ? `<span style="font-size:10px; color:#ef4444; font-weight:500;">T.Ứng: -${window.erpApp.formatValue(e.advance)}</span>` : ''}
                        </div>
                    </td>
                    <td data-label="Chứng từ">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            ${e.files && e.files.length > 0 ?
                                e.files.map((file, idx) => `
                                    <a href="${file.url || file.dataUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-right:8px;" title="${file.name}">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                        ${e.files.length > 1 ? `Tệp ${idx + 1}` : (e.invoiceNo || 'Xem')}
                                    </a>
                                `).join('')
                                : (e.evidenceUrl ? `
                                    <a href="${e.evidenceUrl}" target="_blank" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để xem chứng từ">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                        ${e.invoiceNo || 'Xem'}
                                    </a>
                                ` : (e.fileData ? `
                                    <a href="javascript:void(0)" onclick="window.erpApp.downloadOtherFile('${e.id}')" style="color:#3b82f6; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:4px;" title="Click để tải chứng từ">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span>
                                        ${e.invoiceNo || 'Xem'}
                                    </a>
                                ` : `<span style="color:#94a3b8; font-style:italic; font-size:12px;">${e.invoiceNo || '---'}</span>`))
                            }
                        </div>
                    </td>
                    <td data-label="Thanh toán">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <select class="payment-select ${e.paymentStatus === 'paid' ? 'paid' : 'unpaid'}" onchange="window.erpApp.toggleOtherPaymentStatus('${e.id}', this.value)">
                                <option value="unpaid" ${e.paymentStatus !== 'paid' ? 'selected' : ''}>Chưa thanh toán</option>
                                <option value="paid" ${e.paymentStatus === 'paid' ? 'selected' : ''}>Đã thanh toán</option>
                            </select>
                            ${(e.evidenceUrl || e.fileData) ? `<span class="material-icons-outlined" style="color:#3b82f6; font-size:18px;" title="Có chứng từ đính kèm">attach_file</span>` : ''}
                        </div>
                    </td>
                    <td class="text-center">
                        <div class="row-actions">
                            <button class="action-btn-v2" onclick="window.erpApp.viewOtherExpenseDetail('${e.id}')" title="Xem chi tiết">
                                <span class="material-icons-outlined">visibility</span>
                            </button>
                            <button class="action-btn-v2" onclick="window.erpApp.openEditOtherExpenseModal('${e.id}')" title="Chỉnh sửa">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button class="action-btn-v2 delete" onclick="window.erpApp.deleteOtherExpense('${e.id}')" title="Xóa">
                                <span class="material-icons-outlined">delete_outline</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }



    window.erpApp.openNewOtherExpenseModal = function () {
        tempExpenseFiles = [];
        const modalHtml = `
            <div class="modal-overlay-pro animated fadeIn" id="otherExpenseModal">
                <div class="modal-content-pro glass-morphism animated zoomIn" style="width: 100%; max-width: 650px;">
                    <div class="modal-header">
                        <div class="header-title">
                            <span class="material-icons-outlined">payments</span>
                            <h2>Đề xuất chi phí khác mới</h2>
                        </div>
                        <button class="close-btn" onclick="window.erpApp.closeOtherExpenseModal()"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="newOtherExpenseForm" onsubmit="window.erpApp.submitNewOtherExpense(event)">
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 24px;">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>Nội dung đề xuất <span class="required">*</span></label>
                                    <input type="text" name="desc" required placeholder="Ví dụ: Chi phí tổ chức team building quý 2">
                                </div>
                                <div class="form-group">
                                    <label>Hạng mục <span class="required">*</span></label>
                                    <select name="category" required>
                                        <option value="">-- Chọn hạng mục --</option>
                                        ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}">${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Ngày chi dự kiến</label>
                                    <input type="text" name="date" class="erp-datepicker" value="${window.erpApp.formatDate(new Date())}" placeholder="DD/MM/YYYY">
                                </div>
                                <div class="form-group">
                                    <label>Số tiền đề xuất <span class="required">*</span></label>
                                    <input type="text" name="amount" required placeholder="0" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>
                                <div class="form-group">
                                    <label>Tạm ứng</label>
                                    <input type="text" name="advance" placeholder="0" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>
                                <div class="form-group full-width">
                                    <label>Số Hóa đơn / Số chứng từ (nếu có)</label>
                                    <input type="text" name="invoiceNo" placeholder="VD: HD00123...">
                                </div>

                                <!-- Chứng từ tài liệu đính kèm (Google Drive UI) -->
                                <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 10px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                        <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ chứng từ đính kèm
                                    </label>
                                    
                                    <!-- Google Drive selectors -->
                                    <div style="margin-bottom:16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                        <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap; display:flex; align-items:center; gap:4px;">
                                            <span class="material-icons-outlined" style="font-size:16px; color:#f59e0b;">folder</span> Lưu vào thư mục:
                                        </label>
                                        <select id="expenseDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadOtherExpenseDriveSubfolders()">
                                            <option value="">⏳ Đang tải thư mục...</option>
                                        </select>
                                        <select id="expenseDriveSubfolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; display:none; font-weight:600; outline:none;">
                                            <option value="">— Subfolder (tuỳ chọn) —</option>
                                        </select>
                                        <button type="button" onclick="window.erpApp.loadOtherExpenseDriveSubfolders()" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải subfolder" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                            <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                        </button>
                                        <button type="button" onclick="window.erpApp.createOtherExpenseDriveSubfolderFromModal()" style="padding:10px 16px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
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
                                        <input type="file" id="expenseFileInput" multiple onchange="window.erpApp.handleOtherExpenseFileUpload(event)" style="display:none">
                                    </div>

                                    <!-- Link area -->
                                    <div style="margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                                        <label style="font-size:12px; font-weight:700; color:#64748b; display:block; margin-bottom:8px;">HOẶC THÊM ĐƯỜNG LINK CHỨNG TỪ (GOOGLE DRIVE, DROPOX, ONEDRIVE...)</label>
                                        <div style="display:flex; gap:10px; margin-bottom:10px;">
                                            <input type="text" id="expenseLinkName" placeholder="Tên tệp (VD: Hóa đơn tiền điện)" style="flex:1; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#f8fafc;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                                            <input type="url" id="expenseLinkUrl" placeholder="https://drive.google.com/..." style="flex:2; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#f8fafc;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                                            <button type="button" onclick="window.erpApp.addOtherExpenseFileByLink()" style="padding:10px 20px; border:none; background:#3b82f6; color:#fff; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                                                <span class="material-icons-outlined" style="font-size:16px;">add</span>Thêm
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Files list container -->
                                    <div style="margin-top:16px;">
                                        <label style="font-size:12px; font-weight:700; color:#64748b; display:block; margin-bottom:8px;">DANH SÁCH CHỨNG TỪ ĐÃ ĐÍNH KÈM:</label>
                                        <div id="expenseFileList" style="max-height: 200px; overflow-y: auto; padding: 4px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #fafafa;">
                                            <div style="text-align:center; padding:12px; color:#94a3b8; font-size:12px; font-style:italic;">Chưa có file đính kèm nào</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-text" onclick="window.erpApp.closeOtherExpenseModal()">Hủy bỏ</button>
                            <button type="submit" class="btn-primary-pro">Gửi đề xuất</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        window.currentOtherFile = null;
        
        // Initialize dynamic Google Drive folders
        window.erpApp.initializeOtherExpenseDriveFolders('Tài Chính');

        // Initialize Datepicker
        if (window.erpApp && window.erpApp.initDatePicker) {
            window.erpApp.initDatePicker(document.querySelector('#otherExpenseModal input[name="date"]'));
        } else if (window.flatpickr) {
            window.flatpickr(document.querySelectorAll('#otherExpenseModal .erp-datepicker'), { dateFormat: 'd/m/Y', allowInput: true });
        }
    };



    window.erpApp.closeOtherExpenseModal = function () {
        const modal = document.getElementById('otherExpenseModal');
        if (modal) {modal.remove();}
        window.currentOtherFile = null;
    };

    window.erpApp.submitNewOtherExpense = async function (event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const user = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : null;
        const amount = window.erpApp.parseVND(formData.get('amount'));
        const advance = window.erpApp.parseVND(formData.get('advance')) || 0;

        if (!amount || amount <= 0) {
            window.erpApp.showToast('Vui lòng nhập số tiền hợp lệ', 'error');
            return;
        }

        const newExpense = {
            id: `OTH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            requester: user ? (user.fullName || user.username) : 'Người dùng',
            date: window.erpApp.parseInputDate ? window.erpApp.parseInputDate(formData.get('date')) : formData.get('date'),
            category: formData.get('category'),
            amount: amount,
            advance: advance,
            desc: formData.get('desc'),
            invoiceNo: formData.get('invoiceNo'),
            evidenceUrl: tempExpenseFiles.length > 0 ? (tempExpenseFiles[0].url || tempExpenseFiles[0].dataUrl || '') : '',
            files: [...tempExpenseFiles],
            status: 'approved',
            paymentStatus: 'unpaid',
            createdAt: new Date().toISOString()
        };

        otherExpenses.unshift(newExpense);
        sortOtherExpenses();
        window.erpApp._setData(COLLECTION_EXPENSES, otherExpenses);
        if (window.CrudSync) { await window.CrudSync.saveItem(COLLECTION_EXPENSES, newExpense, 'id'); }

        window.erpApp.closeOtherExpenseModal();
        if (window.notifyCRUD) {
            window.notifyCRUD('Chi phí khác', 'add', { name: newExpense.desc, page: 'hanh-chinh' });
        }
        window.erpApp.showToast('Đã gửi đề xuất chi phí!');
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.openEditOtherExpenseModal = function (id) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense) {return;}

        tempExpenseFiles = expense.files || (expense.evidenceUrl ? [{ name: expense.invoiceNo || 'Chứng từ đính kèm', url: expense.evidenceUrl, type: 'pdf', size: '' }] : []);

        const modalHtml = `
            <div class="modal-overlay-pro animated fadeIn" id="editOtherExpenseModal">
                <div class="modal-content-pro glass-morphism animated zoomIn" style="width: 100%; max-width: 650px;">
                    <div class="modal-header">
                        <div class="header-title">
                            <span class="material-icons-outlined">edit_note</span>
                            <h2>Chỉnh sửa đề xuất chi phí khác</h2>
                        </div>
                        <button class="close-btn" onclick="window.erpApp.closeEditOtherExpenseModal()"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="editOtherExpenseForm" onsubmit="window.erpApp.submitOtherExpenseEdit(event, '${id}')">
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 24px;">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>Nội dung đề xuất <span class="required">*</span></label>
                                    <input type="text" name="desc" value="${expense.desc}" required>
                                </div>
                                <div class="form-group">
                                    <label>Hạng mục <span class="required">*</span></label>
                                    <select name="category" required>
                                        ${Object.keys(EXPENSE_CATEGORIES).map(k => `<option value="${k}" ${expense.category === k ? 'selected' : ''}>${EXPENSE_CATEGORIES[k].label}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Ngày chi dự kiến</label>
                                    <input type="text" name="date" class="erp-datepicker" value="${window.erpApp.formatDate(expense.date)}" placeholder="DD/MM/YYYY">
                                </div>
                                <div class="form-group">
                                    <label>Số tiền đề xuất <span class="required">*</span></label>
                                    <input type="text" name="amount" value="${window.erpApp.formatValue(expense.amount)}" required oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>
                                <div class="form-group">
                                    <label>Tạm ứng</label>
                                    <input type="text" name="advance" value="${window.erpApp.formatValue(expense.advance || 0)}" oninput="window.erpApp.formatExpenseAmountInput(this)">
                                </div>
                                <div class="form-group full-width">
                                    <label>Số Hóa đơn / Số chứng từ (nếu có)</label>
                                    <input type="text" name="invoiceNo" value="${expense.invoiceNo || ''}" placeholder="VD: HD00123...">
                                </div>

                                <!-- Chứng từ tài liệu đính kèm (Google Drive UI) -->
                                <div class="form-group full-width" style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 10px;">
                                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:16px;">
                                        <span class="material-icons-outlined" style="font-size:18px; color:#3b82f6;">attach_file</span> Hồ sơ chứng từ đính kèm
                                    </label>
                                    
                                    <!-- Google Drive selectors -->
                                    <div style="margin-bottom:16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                        <label style="font-size:13px; font-weight:600; color:#64748b; white-space:nowrap; display:flex; align-items:center; gap:4px;">
                                            <span class="material-icons-outlined" style="font-size:16px; color:#f59e0b;">folder</span> Lưu vào thư mục:
                                        </label>
                                        <select id="expenseDriveFolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; font-weight:600; outline:none;" onchange="window.erpApp.loadOtherExpenseDriveSubfolders()">
                                            <option value="">⏳ Đang tải thư mục...</option>
                                        </select>
                                        <select id="expenseDriveSubfolderSelect" style="flex:1; min-width:180px; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; cursor:pointer; display:none; font-weight:600; outline:none;">
                                            <option value="">— Subfolder (tuỳ chọn) —</option>
                                        </select>
                                        <button type="button" onclick="window.erpApp.loadOtherExpenseDriveSubfolders()" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; color:#3b82f6; transition:0.2s;" title="Tải subfolder" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='#fff'">
                                            <span class="material-icons-outlined" style="font-size:18px;">refresh</span>
                                        </button>
                                        <button type="button" onclick="window.erpApp.createOtherExpenseDriveSubfolderFromModal()" style="padding:10px 16px; border:1.5px solid #22c55e; border-radius:10px; background:#f0fdf4; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#16a34a; transition:all 0.2s" onmouseover="this.style.background='#22c55e'; this.style.color='#fff'" onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'" title="Tạo folder mới trên Drive">
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
                                        <input type="file" id="expenseFileInput" multiple onchange="window.erpApp.handleOtherExpenseFileUpload(event)" style="display:none">
                                    </div>

                                    <!-- Link area -->
                                    <div style="margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                                        <label style="font-size:12px; font-weight:700; color:#64748b; display:block; margin-bottom:8px;">HOẶC THÊM ĐƯỜNG LINK CHỨNG TỪ (GOOGLE DRIVE, DROPOX, ONEDRIVE...)</label>
                                        <div style="display:flex; gap:10px; margin-bottom:10px;">
                                            <input type="text" id="expenseLinkName" placeholder="Tên tệp (VD: Hóa đơn tiền điện)" style="flex:1; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#f8fafc;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                                            <input type="url" id="expenseLinkUrl" placeholder="https://drive.google.com/..." style="flex:2; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; background:#f8fafc;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                                            <button type="button" onclick="window.erpApp.addOtherExpenseFileByLink()" style="padding:10px 20px; border:none; background:#3b82f6; color:#fff; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                                                <span class="material-icons-outlined" style="font-size:16px;">add</span>Thêm
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Files list container -->
                                    <div style="margin-top:16px;">
                                        <label style="font-size:12px; font-weight:700; color:#64748b; display:block; margin-bottom:8px;">DANH SÁCH CHỨNG TỪ ĐÃ ĐÍNH KÈM:</label>
                                        <div id="expenseFileList" style="max-height: 200px; overflow-y: auto; padding: 4px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #fafafa;">
                                            ${window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-text" onclick="window.erpApp.closeEditOtherExpenseModal()">Hủy bỏ</button>
                            <button type="submit" class="btn-primary-pro">Cập nhật đề xuất</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        window.currentEditOtherFile = expense.fileData || null;

        // Initialize dynamic Google Drive folders
        window.erpApp.initializeOtherExpenseDriveFolders('Tài Chính');

        // Initialize Datepicker
        if (window.erpApp && window.erpApp.initDatePicker) {
            window.erpApp.initDatePicker(document.querySelector('#editOtherExpenseModal input[name="date"]'));
        } else if (window.flatpickr) {
            window.flatpickr(document.querySelectorAll('#editOtherExpenseModal .erp-datepicker'), { dateFormat: 'd/m/Y', allowInput: true });
        }
    };



    window.erpApp.closeEditOtherExpenseModal = function () {
        const modal = document.getElementById('editOtherExpenseModal');
        if (modal) {modal.remove();}
        window.currentEditOtherFile = null;
    };

    window.erpApp.submitOtherExpenseEdit = async function (event, id) {
        event.preventDefault();
        const index = otherExpenses.findIndex(e => e.id === id);
        if (index === -1) {return;}

        const formData = new FormData(event.target);
        const amount = window.erpApp.parseVND(formData.get('amount'));
        const advance = window.erpApp.parseVND(formData.get('advance')) || 0;
        const expense = otherExpenses[index];

        expense.desc = formData.get('desc');
        expense.category = formData.get('category');
        expense.amount = amount;
        expense.advance = advance;
        expense.date = window.erpApp.parseInputDate ? window.erpApp.parseInputDate(formData.get('date')) : formData.get('date');
        expense.invoiceNo = formData.get('invoiceNo');
        expense.evidenceUrl = tempExpenseFiles.length > 0 ? (tempExpenseFiles[0].url || tempExpenseFiles[0].dataUrl || '') : '';
        expense.files = [...tempExpenseFiles];
        // Clean up old local base64 upload data to avoid bloat
        if (expense.fileData) {
            delete expense.fileData;
        }
        expense.updatedAt = new Date().toISOString();

        sortOtherExpenses();
        window.erpApp._setData(COLLECTION_EXPENSES, otherExpenses);
        if (window.CrudSync) { await window.CrudSync.saveItem(COLLECTION_EXPENSES, otherExpenses[index], 'id'); }

        window.erpApp.closeEditOtherExpenseModal();
        if (window.notifyCRUD) {
            window.notifyCRUD('Chi phí khác', 'update', { name: expense.desc, page: 'hanh-chinh' });
        }
        window.erpApp.showToast('Đã cập nhật đề xuất!');
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.viewOtherExpenseDetail = function (id) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense) {return;}
        const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES['KHAC'];

        const modalHtml = `
            <div class="modal-overlay-pro animated fadeIn" id="otherExpenseDetailModal">
                <div class="modal-content-pro glass-morphism animated zoomIn">
                    <div class="modal-header">
                        <div class="header-title">
                            <span class="material-icons-outlined">visibility</span>
                            <h2>Chi tiết đề xuất chi phí khác</h2>
                        </div>
                        <button class="close-btn" onclick="document.getElementById('otherExpenseDetailModal').remove()"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Mã số</label>
                                <div class="val font-bold">${expense.id}</div>
                            </div>
                            <div class="detail-item full-width">
                                <label>Nội dung</label>
                                <div class="val">${expense.desc}</div>
                            </div>
                            <div class="detail-item">
                                <label>Hạng mục</label>
                                <div class="val" style="display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons-outlined" style="color:${cat.color}; font-size:18px;">${cat.icon}</span>
                                    ${cat.label}
                                </div>
                            </div>
                            <div class="detail-item">
                                <label>Số tiền đề xuất</label>
                                <div class="val font-bold" style="color: #475569;">${window.erpApp.formatValue(expense.amount)} VNĐ</div>
                            </div>
                            <div class="detail-item">
                                <label>Đã tạm ứng</label>
                                <div class="val font-bold" style="color: #e11d48;">- ${window.erpApp.formatValue(expense.advance || 0)} VNĐ</div>
                            </div>
                            <div class="detail-item full-width" style="background: #f0fdf4; padding: 12px 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin-top: 8px;">
                                <label style="color: #166534; font-weight:800; font-size:12px;">CÒN LẠI CẦN THANH TOÁN</label>
                                <div class="val font-bold" style="color: #15803d; font-size:20px; margin-top: 4px;">${window.erpApp.formatValue(expense.amount - (expense.advance || 0))} VNĐ</div>
                            </div>
                            <div class="detail-item">
                                <label>Người đề xuất</label>
                                <div class="val">${expense.requester}</div>
                            </div>
                            <div class="detail-item">
                                <label>Số hóa đơn/chứng từ</label>
                                <div class="val">${expense.invoiceNo || '---'}</div>
                            </div>
                            <div class="detail-item">
                                <label>Ngày đề xuất</label>
                                <div class="val">${window.erpApp.formatDate(expense.date)}</div>
                            </div>
                            <div class="detail-item full-width" style="border-top:1px dashed #cbd5e1; padding-top: 16px; margin-top: 8px;">
                                <label style="font-weight: 800; color: #475569;">Hồ sơ chứng từ đính kèm</label>
                                <div style="margin-top: 8px;">
                                    ${expense.files && expense.files.length > 0 ?
                expense.files.map((file, idx) => `
                                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;">
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">description</span>
                                                    <span style="font-size:13px; font-weight:600; color:#334155;">${file.name}</span>
                                                </div>
                                                <a href="${file.url || file.dataUrl}" target="_blank" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap;">Xem tệp</a>
                                            </div>
                                        `).join('')
                : (expense.evidenceUrl ? `
                                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">description</span>
                                                    <span style="font-size:13px; font-weight:600; color:#334155;">${expense.invoiceNo || 'Chứng từ đính kèm'}</span>
                                                </div>
                                                <a href="${expense.evidenceUrl}" target="_blank" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap;">Xem tệp</a>
                                            </div>
                                        ` : (expense.fileData ? `
                                            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <span class="material-icons-outlined" style="color:#3b82f6; font-size:20px;">description</span>
                                                    <span style="font-size:13px; font-weight:600; color:#334155;">${expense.fileData.name}</span>
                                                </div>
                                                <button class="evidence-link-btn" onclick="window.erpApp.downloadOtherFile('${expense.id}')" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap;">Xem tệp</button>
                                            </div>
                                        ` : '<span style="color:#94a3b8; font-style:italic; font-size:12px;">Không có chứng từ đính kèm</span>'))
            }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-primary-pro" onclick="document.getElementById('otherExpenseDetailModal').remove()">Đóng</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    // ==========================================
    // Print Selection Management
    // ==========================================
    window.erpApp.toggleOtherPrintSelection = function (id, checked) {
        if (checked) {
            selectedForPrint.add(id);
        } else {
            selectedForPrint.delete(id);
        }
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.toggleAllOtherPrintSelection = function (checked) {
        if (checked) {
            otherExpenses.forEach(e => selectedForPrint.add(e.id));
        } else {
            selectedForPrint.clear();
        }
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.clearOtherPrintSelection = function () {
        selectedForPrint.clear();
        window.erpApp.renderOtherExpense();
    };

    // ==========================================
    // CRUD & Status Management
    // ==========================================
    window.erpApp.toggleOtherPaymentStatus = async function (id, value) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense) return;

        expense.paymentStatus = value || (expense.paymentStatus === 'paid' ? 'unpaid' : 'paid');
        window.erpApp._setData(COLLECTION_EXPENSES, otherExpenses);

        if (window.CrudSync) {
            await window.CrudSync.saveItem(COLLECTION_EXPENSES, expense, 'id');
        }

        window.erpApp.showToast(expense.paymentStatus === 'paid' ? 'Đã đánh dấu thanh toán!' : 'Đã chuyển về chưa thanh toán!');
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.deleteOtherExpense = function (id) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense) {return;}

        const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES['KHAC'];
        const modalId = 'deleteConfirmModalOther';

        const modalHtml = `
            <div id="${modalId}" class="modal-overlay-pro animated fadeIn">
                <div class="modal-content-pro animated zoomIn" style="max-width: 460px;">
                    <div class="modal-header" style="background:#fef2f2; border-bottom:1px solid #fecaca;">
                        <div class="header-title">
                            <span class="material-icons-outlined" style="color:#ef4444; font-size:28px;">warning</span>
                            <h2 style="color:#991b1b;">Xác nhận xóa chi phí khác</h2>
                        </div>
                        <button class="close-btn" onclick="document.getElementById('${modalId}').remove()">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <p style="font-size:15px; color:#475569; margin:0 0 20px 0;">Bạn có chắc chắn muốn <strong style="color:#ef4444;">xóa vĩnh viễn</strong> khoản chi này?</p>
                        <div style="background:#f8fafc; border-radius:16px; padding:16px; border:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                                <div style="width:36px; height:36px; border-radius:10px; background:${cat.color}15; color:${cat.color}; display:flex; align-items:center; justify-content:center;">
                                    <span class="material-icons-outlined" style="font-size:20px;">${cat.icon}</span>
                                </div>
                                <div>
                                    <div style="font-weight:800; color:#1e293b; font-size:14px;">${expense.id}</div>
                                    <div style="font-size:12px; color:#64748b; font-weight:500;">${cat.label} • ${window.erpApp.formatDate(expense.date)}</div>
                                </div>
                            </div>
                            <div style="font-size:14px; color:#334155; font-weight:500; margin-bottom:8px;">${expense.desc}</div>
                            <div style="font-size:16px; font-weight:800; color:#1e293b;">${window.erpApp.formatValue(expense.amount)} VNĐ</div>
                        </div>
                        <p style="font-size:12px; color:#94a3b8; margin:16px 0 0 0; font-style:italic;">⚠️ Hành động này không thể hoàn tác và sẽ ảnh hưởng đến báo cáo tài chính.</p>
                    </div>
                    <div class="modal-footer" style="display:flex; gap:12px; padding:16px 24px;">
                        <button class="btn-text" style="flex:1;" onclick="document.getElementById('${modalId}').remove()">
                            Hủy bỏ
                        </button>
                        <button class="btn-primary-pro" style="flex:1; justify-content:center; background:linear-gradient(135deg, #ef4444, #dc2626);"
                            onclick="window.erpApp.confirmDeleteOtherExpense('${expense.id}')">
                            <span class="material-icons-outlined" style="font-size:18px;">delete_forever</span>
                            Xác nhận xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.confirmDeleteOtherExpense = async function (id) {
        const index = otherExpenses.findIndex(e => e.id === id);
        if (index === -1) {return;}

        const item = otherExpenses[index];
        otherExpenses.splice(index, 1);
        window.erpApp._setData(COLLECTION_EXPENSES, otherExpenses);

        if (window.CrudSync) {
            await window.CrudSync.deleteItem(COLLECTION_EXPENSES, item.id);
        }

        selectedForPrint.delete(id);

        const modal = document.getElementById('deleteConfirmModalOther');
        if (modal) {modal.remove();}

        window.erpApp.showToast('Đã xóa chi phí thành công!', 'success');
        window.erpApp.renderOtherExpense();
    };

    // ==========================================
    // Printing & Reports
    // ==========================================
    window.erpApp.printOtherExpense = function (id) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense) return;
        
        const prevSelection = new Set(selectedForPrint);
        selectedForPrint.clear();
        selectedForPrint.add(id);
        window.erpApp.printMultipleOtherExpenses();
        selectedForPrint = prevSelection;
        window.erpApp.renderOtherExpense();
    };

    window.erpApp.printMultipleOtherExpenses = function () {
        const selected = otherExpenses.filter(e => selectedForPrint.has(e.id));
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
        const categoryText = categories.length === 1 ? `(${EXPENSE_CATEGORIES[categories[0]].label})` : '(Chi phí khác)';

        const totalAmount = selected.reduce((s, e) => s + e.amount, 0);
        const totalAdvance = selected.reduce((s, e) => s + (e.advance || 0), 0);
        const totalRemaining = totalAmount - totalAdvance;

        const roundedTotal = Math.floor(totalAmount / 1000) * 1000;
        const roundedAdvance = Math.floor(totalAdvance / 1000) * 1000;
        const roundedRemaining = Math.floor(totalRemaining / 1000) * 1000;

        const totalInWords = window.erpApp.docTienBangChu ? window.erpApp.docTienBangChu(roundedRemaining) : '';

        const printWindow = window.open('', '_blank');
        
        let html = `
            <html>
            <head>
                <title>In phiếu đề nghị thanh toán</title>
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
                                <th style="width:85px;">Ngày</th>
                                <th style="width:130px;">Hạng mục</th>
                                <th>Nội dung thanh toán</th>
                                <th style="width:100px; text-align:center;">Số Hóa đơn</th>
                                <th style="text-align:right; width:130px;">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selected.map((e, i) => {
                                const c = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES['KHAC'];
                                return `<tr>
                                    <td style="text-align:center;">${i + 1}</td>
                                    <td>${window.erpApp.formatDate(e.date)}</td>
                                    <td>${c.label}</td>
                                    <td>${e.desc}</td>
                                    <td style="text-align:center;">${e.invoiceNo || '---'}</td>
                                    <td style="text-align:right; font-weight:700;">${window.erpApp.formatValue(e.amount)}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:700; padding:10px 15px; font-size:12px; text-transform:uppercase;">TỔNG CỘNG ĐỀ XUẤT (làm tròn):</td>
                                <td style="text-align:right; font-weight:700; color:#000; font-size:14px; padding:10px 15px; background:#f8fafc; white-space:nowrap;">
                                    ${window.erpApp.formatValue(roundedTotal)} <span style="font-size:12px; margin-left:2px;">VNĐ</span>
                                </td>
                            </tr>
                            ${roundedAdvance > 0 ? `
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:700; padding:10px 15px; font-size:12px; text-transform:uppercase; color:#ef4444;">ĐÃ TẠM ỨNG (làm tròn):</td>
                                <td style="text-align:right; font-weight:700; color:#ef4444; font-size:14px; padding:10px 15px; background:#f8fafc; white-space:nowrap;">
                                    -${window.erpApp.formatValue(roundedAdvance)} <span style="font-size:12px; margin-left:2px;">VNĐ</span>
                                </td>
                            </tr>
                            ` : ''}
                            <tr style="background:#f8fafc;">
                                <td colspan="5" style="text-align:right; font-weight:800; padding:12px 15px; font-size:13px; text-transform:uppercase; border-top:2px solid #000;">TỔNG CỘNG THỰC PHẢI CHI (làm tròn):</td>
                                <td style="text-align:right; font-weight:800; color:#10b981; font-size:16px; padding:12px 15px; white-space:nowrap; border-top:2px solid #000;">
                                    ${window.erpApp.formatValue(roundedRemaining)} <span style="font-size:13px; margin-left:2px;">VNĐ</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align:right; font-style:italic; padding:12px 15px; font-size:13px; border-top:none;">
                                    Số tiền bằng chữ (cho phần thực nhận): <strong style="text-transform:capitalize;">${totalInWords}</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="signature-container">
                        <div class="sig-item">
                            <span class="sig-label">NGƯỜI ĐỀ NGHỊ</span>
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

    window.erpApp.downloadOtherFile = function (id) {
        const expense = otherExpenses.find(e => e.id === id);
        if (!expense || !expense.fileData) return;

        const link = document.createElement('a');
        link.href = expense.fileData.data;
        link.download = expense.fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.erpApp.docTienBangChu = function(soTien) {
        if (soTien === 0) return 'Không đồng';
        const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const Tien = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

        function docBlock(so, isFirstBlock) {
            let tram = Math.floor(so / 100);
            let chuc = Math.floor((so % 100) / 10);
            let donvi = so % 10;
            let ketqua = "";
            if (tram > 0 || !isFirstBlock) {
                ketqua += ChuSo[tram] + " trăm ";
            }
            if (chuc > 1) {
                ketqua += ChuSo[chuc] + " mươi ";
                if (donvi === 1) ketqua += "mốt";
                else if (donvi === 5) ketqua += "lăm";
                else if (donvi > 0) ketqua += ChuSo[donvi];
            } else if (chuc === 1) {
                ketqua += "mười ";
                if (donvi === 1) ketqua += "một";
                else if (donvi === 5) ketqua += "lăm";
                else if (donvi > 0) ketqua += ChuSo[donvi];
            } else if (chuc === 0 && donvi > 0) {
                if (tram > 0 || !isFirstBlock) ketqua += "lẻ ";
                ketqua += ChuSo[donvi];
            }
            return ketqua;
        }

        let result = "";
        let blocks = [];
        let temp = soTien;
        while (temp > 0) {
            blocks.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }

        for (let i = blocks.length - 1; i >= 0; i--) {
            let blockText = docBlock(blocks[i], i === blocks.length - 1);
            if (blockText !== "") {
                result += blockText + " " + Tien[i] + " ";
            }
        }
        
        result = result.trim();
        if (result === "") return "Không đồng";
        result = result.charAt(0).toUpperCase() + result.slice(1);
        return result + " đồng chẵn./.";
    };

    // ==========================================
    // Google Drive & Voucher Attachments Helpers (Other Expense Specific)
    // ==========================================
    window.erpApp.loadOtherExpenseDriveSubfolders = async () => {
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        const subSelect = document.getElementById('expenseDriveSubfolderSelect');
        if (!folderSelect || !subSelect) return;
        const folderId = folderSelect.value;
        if (!folderId) {
            subSelect.style.display = 'none';
            return;
        }
        subSelect.style.display = 'block';
        subSelect.innerHTML = '<option value="">⏳ Đang tải...</option>';
        try {
            const res = await fetch((window.API_BASE_URL || '') + `/api/drive/files?folderId=${folderId}`);
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

    window.erpApp.initializeOtherExpenseDriveFolders = async (defaultFolderName = 'Tài Chính') => {
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        if (!folderSelect) return;
        
        folderSelect.innerHTML = '<option value="">⏳ Đang tải thư mục...</option>';
        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders');
            const data = await res.json();
            if (data.success && data.folders && data.folders.length > 0) {
                folderSelect.innerHTML = data.folders.map(f => {
                    let emoji = '📁';
                    if (f.name.includes('Tài Chính')) emoji = '💰';
                    else if (f.name.includes('Hợp Đồng')) emoji = '📝';
                    else if (f.name.includes('Dự Án')) emoji = '🏗️';
                    else if (f.name.includes('Nhân Sự')) emoji = '👥';
                    return `<option value="${f.id}">${emoji} ${f.name}</option>`;
                }).join('');
                
                // Select 'Tài Chính' by default if found
                const targetFolder = data.folders.find(f => f.name.includes(defaultFolderName));
                if (targetFolder) {
                    folderSelect.value = targetFolder.id;
                }
            } else {
                folderSelect.innerHTML = '<option value="">❌ Không tải được thư mục</option>';
            }
        } catch (e) {
            folderSelect.innerHTML = '<option value="">❌ Lỗi kết nối Drive</option>';
        }
        
        // Load subfolders of the active selection
        await window.erpApp.loadOtherExpenseDriveSubfolders();
    };

    window.erpApp.otherExpenseCustomPrompt = (title, placeholder, defaultValue = '') => {
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
                        <input type="text" id="expenseCustomPromptInput" value="${defaultValue}" placeholder="${placeholder}" style="
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
                        <button type="button" id="expenseCustomPromptCancel" style="
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
                        <button type="button" id="expenseCustomPromptSubmit" style="
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

            const input = overlay.querySelector('#expenseCustomPromptInput');
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

            overlay.querySelector('#expenseCustomPromptCancel').addEventListener('click', () => closePrompt(null));
            overlay.querySelector('#expenseCustomPromptSubmit').addEventListener('click', () => {
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

    window.erpApp.createOtherExpenseDriveSubfolderFromModal = async () => {
        const folderSelect = document.getElementById('expenseDriveFolderSelect');
        const subSelect = document.getElementById('expenseDriveSubfolderSelect');
        if (!folderSelect) return;
        const parentId = folderSelect.value;

        const name = await window.erpApp.otherExpenseCustomPrompt('Tạo Thư Mục Mới', 'Nhập tên folder mới...');
        if (!name || !name.trim()) return;

        try {
            window.erpApp.showToast('⏳ Đang tạo folder trên Google Drive...', 'info');
            const res = await fetch((window.API_BASE_URL || '') + '/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), parentId: parentId })
            });
            const data = await res.json();

            if (data.success) {
                window.erpApp.showToast(`✅ Đã tạo folder "${name.trim()}"`, 'success');
                await window.erpApp.loadOtherExpenseDriveSubfolders();
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

    window.erpApp.handleOtherExpenseFileUpload = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) { return; }

        const listEl = document.getElementById('expenseFileList');

        Array.from(files).forEach(async (file) => {
            if (file.size > 20 * 1024 * 1024) { window.erpApp.showToast(`File "${file.name}" quá lớn (>20MB)`, 'error'); return; }
            const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
            const fType = window.erpApp.getHsFileTypeFromName ? window.erpApp.getHsFileTypeFromName(file.name) : 'pdf';

            const placeholderIdx = tempExpenseFiles.length;
            tempExpenseFiles.push({ name: '⏳ Đang tải: ' + file.name, size: sizeStr, type: fType, uploading: true });
            if (listEl) { listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true); }

            try {
                const formData = new FormData();
                formData.append('files', file);
                const folderSelect = document.getElementById('expenseDriveFolderSelect');
                const subfolderSelect = document.getElementById('expenseDriveSubfolderSelect');
                if (subfolderSelect && subfolderSelect.value) {
                    formData.append('folderId', subfolderSelect.value);
                } else if (folderSelect && folderSelect.value) {
                    formData.append('folderId', folderSelect.value);
                } else {
                    formData.append('module', 'tai-chinh');
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
                        tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                        if (listEl) { listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true); }
                    };
                    reader.readAsDataURL(file);
                    window.erpApp.showToast(`⚠️ Drive không khả dụng, lưu tệp cục bộ: ${file.name}`, 'warning');
                }
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempExpenseFiles[placeholderIdx] = { name: file.name, size: sizeStr, type: fType, dataUrl: e.target.result, data: e.target.result };
                    if (listEl) { listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true); }
                };
                reader.readAsDataURL(file);
                console.warn('[Expense Upload] Drive fallback:', err.message);
            }

            if (listEl) { listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true); }
        });
        event.target.value = '';
    };

    window.erpApp.addOtherExpenseFileByLink = () => {
        const urlEl = document.getElementById('expenseLinkUrl');
        const nameEl = document.getElementById('expenseLinkName');
        if (!urlEl) return;
        const url = urlEl.value.trim();
        if (!url) { window.erpApp.showToast('Vui lòng nhập đường link!', 'error'); urlEl.focus(); return; }
        try { new URL(url); } catch (e) { window.erpApp.showToast('Đường link không hợp lệ!', 'error'); urlEl.focus(); return; }
        const name = (nameEl && nameEl.value.trim()) || url.split('/').filter(Boolean).pop() || 'Link file';
        tempExpenseFiles.push({ name: name, url: url, data: url, type: 'link', size: '' });
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true);
        }
        urlEl.value = '';
        if (nameEl) nameEl.value = '';
        window.erpApp.showToast('Đã thêm link: ' + name, 'success');
    };

    window.erpApp.removeOtherExpenseFile = (index) => {
        tempExpenseFiles.splice(index, 1);
        const listEl = document.getElementById('expenseFileList');
        if (listEl) {
            listEl.innerHTML = window.erpApp.renderOtherExpenseFileList(tempExpenseFiles, true);
        }
    };

    window.erpApp.previewOtherExpenseFile = async (index) => {
        const file = tempExpenseFiles[index];
        if (!file) { window.erpApp.showToast('Không tìm thấy file!', 'error'); return; }
        const href = file.dataUrl || file.url || file.data;
        if (!href) { window.erpApp.showToast('File này chưa có dữ liệu để xem trước.', 'error'); return; }
        if (href && (href.includes('drive.google.com') || href.includes('docs.google.com'))) {
            window.open(href, '_blank');
            return;
        }
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

    window.erpApp.renderOtherExpenseFileList = (files, editable = true) => {
        if (!files || files.length === 0) {
            return '<div style="text-align:center; padding:12px; color:#94a3b8; font-size:12px; font-style:italic;">Chưa có file đính kèm nào</div>';
        }
        return files.map((f, i) => {
            const isLink = f.type === 'link';
            const icon = isLink ? 'link' : (f.type === 'pdf' ? 'picture_as_pdf' : (f.type === 'img' ? 'image' : 'description'));
            const iconColor = isLink ? '#6366F1' : (f.type === 'pdf' ? '#EF4444' : (f.type === 'img' ? '#10B981' : '#3B82F6'));
            const previewable = !f.uploading && (f.dataUrl || f.url || f.data);
            const previewFn = previewable ? `window.erpApp.previewOtherExpenseFile(${i})` : '';

            let actions = '';
            if (editable) {
                const previewBtn = `<button type="button" style="background:none; border:none; color:#3b82f6; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); ${previewFn}"><span class="material-icons-outlined" style="font-size:16px;">visibility</span></button>`;
                actions = `<div style="display:flex; gap:4px; align-items:center;">
                    ${previewable ? previewBtn : ''}
                    <button type="button" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); window.erpApp.removeOtherExpenseFile(${i})"><span class="material-icons-outlined" style="font-size:16px;">close</span></button>
                </div>`;
            } else {
                actions = previewable ? `<button type="button" style="background:none; border:none; color:#3b82f6; cursor:pointer; padding:4px;" onclick="event.stopPropagation(); ${previewFn}"><span class="material-icons-outlined" style="font-size:16px;">visibility</span></button>` : '';
            }

            let drivePathHtml = '';
            if (f.drivePath) {
                drivePathHtml = `<span style="display:block;margin-top:2px;font-size:11px;color:#0D9488"><span class="material-icons-outlined" style="font-size:12px;vertical-align:middle;margin-right:2px">folder</span>Drive: ${f.drivePath}</span>`;
            }
            const linkHref = f.url || f.data;
            if (linkHref && linkHref.includes('drive.google.com')) {
                drivePathHtml += `<a href="${linkHref}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:3px;margin-top:2px;font-size:11px;color:#2563EB;text-decoration:none" onclick="event.stopPropagation()"><span class="material-icons-outlined" style="font-size:12px">open_in_new</span>Xem trên Drive</a>`;
            }

            return `<div style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;" onclick="${previewFn}">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="material-icons-outlined" style="color:${iconColor};font-size:20px">${icon}</span>
                    <div style="text-align:left;">
                        <span style="font-size:13px; font-weight:600; color:#334155; display:block;">${f.name}</span>
                        ${f.size ? `<span style="font-size:11px; color:#94a3b8;">${f.size}</span>` : ''}
                        ${drivePathHtml}
                    </div>
                </div>
                ${actions}
            </div>`;
        }).join('');
    };

    // Initialize on load
    init();

})();
