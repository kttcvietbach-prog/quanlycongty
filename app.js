// ==========================================
// VIETBACHCORP ERP - Main Application Logic
// ==========================================

(function () {
    'use strict';

    // ==========================================
    // User Accounts & Auth
    // ==========================================
    const users = [
        { username: 'admin', password: 'quoclachu', fullName: 'Nguyễn Quang Quốc', role: 'Admin', initials: 'NQ' }
    ];

    let currentUser = null;

    // Check if user is already logged in (session)
    try {
        const savedUser = JSON.parse(sessionStorage.getItem('erp_user'));
        if (savedUser) currentUser = savedUser;
    } catch (e) { }

    // ==========================================
    // Login Logic
    // ==========================================
    function initLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        const togglePasswordBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('loginPassword');

        // If already logged in, skip login screen
        if (currentUser) {
            loginScreen.classList.add('hidden');
            appContainer.style.display = 'flex';
            updateUserUI();
            // Sync Firebase trước khi render trang
            (async () => {
                if (window.SyncManager) {
                    await window.SyncManager.init();
                }
                navigateTo('trang-chu');
            })();
            return;
        }

        // Toggle password visibility
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.querySelector('.material-icons-outlined').textContent = isPassword ? 'visibility' : 'visibility_off';
        });

        // Handle login form submit
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                currentUser = { fullName: user.fullName, role: user.role, initials: user.initials, username: user.username };
                sessionStorage.setItem('erp_user', JSON.stringify(currentUser));

                // Remember me
                if (document.getElementById('rememberMe').checked) {
                    localStorage.setItem('erp_remembered_user', username);
                } else {
                    localStorage.removeItem('erp_remembered_user');
                }

                // Animate out login, show app
                loginScreen.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(async () => {
                    loginScreen.classList.add('hidden');
                    loginScreen.style.animation = '';
                    appContainer.style.display = 'flex';
                    updateUserUI();
                    // Sync Firebase TRƯỚC, rồi mới render trang
                    if (window.SyncManager) {
                        await window.SyncManager.init();
                    }
                    navigateTo('trang-chu');
                }, 300);
            } else {
                loginError.innerHTML = '<span class="material-icons-outlined" style="font-size:15px">error</span> Tài khoản hoặc mật khẩu không đúng';
                passwordInput.value = '';
                passwordInput.focus();
                // Clear error after 3s
                setTimeout(() => { loginError.textContent = ''; }, 3000);
            }
        });

        // Pre-fill remembered username
        const remembered = localStorage.getItem('erp_remembered_user');
        if (remembered) {
            document.getElementById('loginUsername').value = remembered;
            document.getElementById('rememberMe').checked = true;
            passwordInput.focus();
        } else {
            document.getElementById('loginUsername').focus();
        }
    }

    function updateUserUI() {
        if (!currentUser) return;
        // Update all user name/role/initials in the header & dropdown
        const els = {
            'avatarInitials': currentUser.initials,
            'dropdownInitials': currentUser.initials,
            'headerUserName': currentUser.fullName,
            'dropdownUserName': currentUser.fullName,
            'headerUserRole': currentUser.role,
            'dropdownUserRole': currentUser.role
        };
        Object.entries(els).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });
    }

    function handleLogout() {
        currentUser = null;
        sessionStorage.removeItem('erp_user');
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        appContainer.style.display = 'none';
        loginScreen.classList.remove('hidden');
        // Reset form
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').textContent = '';
        document.getElementById('loginPassword').type = 'password';
        document.getElementById('togglePassword').querySelector('.material-icons-outlined').textContent = 'visibility_off';
        // Pre-fill remembered
        const remembered = localStorage.getItem('erp_remembered_user');
        if (remembered) {
            document.getElementById('loginUsername').value = remembered;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // ==========================================
    // Page Data Definitions
    // ==========================================

    const pagesData = {
        'trang-chu': {
            title: 'Trang chủ',
            icon: 'home',
            badge: 'Trang chủ',
            sections: []
        },
        'hanh-chinh': {
            title: 'Hành chính',
            icon: 'apartment',
            badge: 'Hành chính',
            sections: [
                {
                    title: 'Quản lý văn bản',
                    modules: [
                        { icon: 'description', color: 'blue', title: 'Quản lý công văn', desc: 'Theo dõi công văn đến, đi, nội bộ và phân phối xử lý.' },
                        { icon: 'folder_shared', color: 'purple', title: 'Lưu trữ hồ sơ', desc: 'Quản lý kho lưu trữ hồ sơ, tài liệu theo danh mục.' },
                        { icon: 'approval', color: 'orange', title: 'Phê duyệt văn bản', desc: 'Quy trình phê duyệt văn bản, đề xuất trực tuyến.' }
                    ]
                },
                {
                    title: 'Quản lý tài sản',
                    modules: [
                        { icon: 'meeting_room', color: 'teal', title: 'Quản lý phòng họp', desc: 'Đặt lịch phòng họp, theo dõi thiết bị và tiện ích.' },
                        { icon: 'devices', color: 'green', title: 'Quản lý thiết bị', desc: 'Cấp phát, thu hồi, bảo trì tài sản, thiết bị công ty.' },
                        { icon: 'directions_car', color: 'amber', title: 'Quản lý xe', desc: 'Điều phối xe công, theo dõi lịch trình và chi phí.' }
                    ]
                }
            ]
        },
        'nhan-su': {
            title: 'Nhân sự',
            icon: 'people',
            badge: 'Nhân sự',
            sections: [
                {
                    title: 'Quản lý nhân viên',
                    modules: [
                        { icon: 'badge', color: 'blue', title: 'Hồ sơ nhân viên', desc: 'Quản lý thông tin cá nhân, hợp đồng, bằng cấp nhân viên.' },
                        { icon: 'work_history', color: 'purple', title: 'Quản lý hợp đồng', desc: 'Theo dõi hợp đồng lao động, gia hạn, chấm dứt.' },
                        { icon: 'school', color: 'green', title: 'Đào tạo', desc: 'Lập kế hoạch đào tạo, theo dõi kết quả và chứng chỉ.' }
                    ]
                },
                {
                    title: 'Chấm công & Lương',
                    modules: [
                        { icon: 'schedule', color: 'orange', title: 'Chấm công', desc: 'Quản lý bảng chấm công, nghỉ phép, làm thêm giờ.' },
                        { icon: 'payments', color: 'teal', title: 'Bảng lương', desc: 'Tính lương, phụ cấp, khấu trừ và phát hành phiếu lương.' },
                        { icon: 'card_giftcard', color: 'pink', title: 'Phúc lợi', desc: 'Quản lý chế độ phúc lợi, bảo hiểm, trợ cấp nhân viên.' }
                    ]
                }
            ]
        },
        'van-hanh': {
            title: 'Vận hành',
            icon: 'miscellaneous_services',
            badge: 'Vận hành',
            sections: [
                {
                    title: 'Quản lý dự án',
                    modules: [
                        { icon: 'assignment', color: 'blue', title: 'Quản lý dự án', desc: 'Tạo, theo dõi tiến độ và phân công công việc dự án.' },
                        { icon: 'task_alt', color: 'green', title: 'Quản lý công việc', desc: 'Phân công, theo dõi trạng thái và deadline công việc.' },
                        { icon: 'timeline', color: 'purple', title: 'Gantt Chart', desc: 'Biểu đồ Gantt trực quan hoá tiến độ dự án.' }
                    ]
                },
                {
                    title: 'Bảo trì & Sửa chữa',
                    modules: [
                        { icon: 'build', color: 'orange', title: 'Bảo trì thiết bị', desc: 'Lập lịch bảo trì, theo dõi tình trạng thiết bị máy móc.' },
                        { icon: 'report_problem', color: 'red', title: 'Quản lý sự cố', desc: 'Ghi nhận, xử lý và thống kê sự cố vận hành.' }
                    ]
                }
            ]
        },
        'kinh-doanh': {
            title: 'Kinh doanh',
            icon: 'storefront',
            badge: 'Kinh doanh',
            sections: [
                {
                    title: 'Bán hàng',
                    modules: [
                        { icon: 'point_of_sale', color: 'blue', title: 'Đơn hàng bán', desc: 'Tạo và quản lý đơn hàng, theo dõi trạng thái giao hàng.' },
                        { icon: 'receipt_long', color: 'purple', title: 'Báo giá', desc: 'Tạo báo giá, gửi khách hàng và chuyển đổi thành đơn hàng.' },
                        { icon: 'groups', color: 'teal', title: 'Quản lý khách hàng (CRM)', desc: 'Quản lý thông tin, lịch sử giao dịch và chăm sóc khách hàng.' }
                    ]
                },
                {
                    title: 'Phân tích kinh doanh',
                    modules: [
                        { icon: 'trending_up', color: 'green', title: 'Doanh thu & Lợi nhuận', desc: 'Báo cáo doanh thu, lợi nhuận theo sản phẩm, kênh bán.' },
                        { icon: 'analytics', color: 'orange', title: 'Phân tích xu hướng', desc: 'Phân tích xu hướng bán hàng, dự báo nhu cầu thị trường.' }
                    ]
                }
            ]
        },
        'marketing': {
            title: 'Marketing',
            icon: 'campaign',
            badge: 'Marketing',
            sections: [
                {
                    title: 'Chiến dịch',
                    modules: [
                        { icon: 'campaign', color: 'purple', title: 'Quản lý chiến dịch', desc: 'Lập kế hoạch, triển khai và đo lường hiệu quả chiến dịch.' },
                        { icon: 'email', color: 'blue', title: 'Email Marketing', desc: 'Gửi email hàng loạt, tự động hoá và theo dõi tỷ lệ mở.' },
                        { icon: 'share', color: 'teal', title: 'Social Media', desc: 'Quản lý nội dung mạng xã hội, lên lịch đăng bài.' }
                    ]
                },
                {
                    title: 'Phân tích',
                    modules: [
                        { icon: 'insights', color: 'green', title: 'Phân tích hiệu quả', desc: 'ROI chiến dịch, chi phí thu hút khách hàng (CAC).' },
                        { icon: 'people_alt', color: 'orange', title: 'Phân khúc khách hàng', desc: 'Phân nhóm khách hàng theo hành vi và đặc điểm.' }
                    ]
                }
            ]
        },
        'tai-chinh': {
            title: 'Tài chính',
            icon: 'account_balance',
            badge: 'Tài chính',
            sections: [
                {
                    title: 'Kế toán',
                    modules: [
                        { icon: 'account_balance_wallet', color: 'blue', title: 'Sổ cái tổng hợp', desc: 'Quản lý hệ thống tài khoản, ghi nhận bút toán.' },
                        { icon: 'receipt', color: 'purple', title: 'Công nợ phải thu', desc: 'Theo dõi công nợ khách hàng, đối chiếu và thu hồi.' },
                        { icon: 'credit_card', color: 'orange', title: 'Công nợ phải trả', desc: 'Quản lý công nợ nhà cung cấp, lập lịch thanh toán.' }
                    ]
                },
                {
                    title: 'Báo cáo tài chính',
                    modules: [
                        { icon: 'assessment', color: 'green', title: 'Bảng cân đối kế toán', desc: 'Báo cáo tài sản, nợ phải trả và vốn chủ sở hữu.' },
                        { icon: 'bar_chart', color: 'teal', title: 'Kết quả kinh doanh', desc: 'Báo cáo doanh thu, chi phí và lợi nhuận theo kỳ.' },
                        { icon: 'money', color: 'amber', title: 'Lưu chuyển tiền tệ', desc: 'Theo dõi dòng tiền vào, ra theo hoạt động.' }
                    ]
                }
            ]
        },
        'mua-hang': {
            title: 'Mua hàng',
            icon: 'shopping_cart',
            badge: 'Mua hàng',
            sections: [
                {
                    title: 'Đặt hàng',
                    modules: [
                        { icon: 'shopping_bag', color: 'blue', title: 'Đơn đặt hàng (PO)', desc: 'Tạo và quản lý đơn hàng mua, theo dõi trạng thái.' },
                        { icon: 'request_quote', color: 'purple', title: 'Yêu cầu báo giá (RFQ)', desc: 'Gửi yêu cầu báo giá đến nhà cung cấp, so sánh giá.' },
                        { icon: 'local_shipping', color: 'teal', title: 'Nhà cung cấp', desc: 'Quản lý danh sách, đánh giá và xếp hạng nhà cung cấp.' }
                    ]
                },
                {
                    title: 'Kiểm soát mua hàng',
                    modules: [
                        { icon: 'fact_check', color: 'green', title: 'Kiểm tra nhập hàng', desc: 'Xác nhận số lượng, chất lượng hàng nhập kho.' },
                        { icon: 'summarize', color: 'orange', title: 'Báo cáo mua hàng', desc: 'Thống kê chi phí mua hàng theo nhà cung cấp, kỳ.' }
                    ]
                }
            ]
        },
        'san-xuat': {
            title: 'Sản xuất',
            icon: 'precision_manufacturing',
            badge: 'Sản xuất',
            sections: [
                {
                    title: 'Thiết lập & Định mức',
                    modules: [
                        {
                            icon: 'account_tree',
                            color: 'purple',
                            title: 'Định mức nguyên vật liệu (BOM)',
                            desc: 'Quản lý danh sách nguyên liệu, tỉ lệ hao hụt để tạo ra 1 đơn vị thành phẩm.'
                        },
                        {
                            icon: 'route',
                            color: 'blue',
                            title: 'Quy trình sản xuất (Routing)',
                            desc: 'Khai báo các bước/công đoạn: Cắt, May, Kiểm tra, Đóng gói.'
                        },
                        {
                            icon: 'factory',
                            color: 'orange',
                            title: 'Năng lực sản xuất (Work Centers)',
                            desc: 'Quản lý máy móc, tổ đội sản xuất và công suất tối đa.'
                        }
                    ]
                },
                {
                    title: 'Kế hoạch & Điều hành',
                    modules: [
                        {
                            icon: 'assignment',
                            color: 'purple',
                            title: 'Lệnh sản xuất (MO)',
                            desc: 'Tạo và theo dõi lệnh sản xuất từ đơn hàng hoặc kế hoạch dự trữ.'
                        },
                        {
                            icon: 'inventory',
                            color: 'blue',
                            title: 'Kế hoạch nguyên vật liệu (MRP)',
                            desc: 'Tự tính: cần bao nhiêu NVL, tồn kho, cần mua thêm.'
                        },
                        {
                            icon: 'calendar_month',
                            color: 'purple',
                            title: 'Lịch trình sản xuất',
                            desc: 'Gantt: sắp xếp lệnh, máy; theo dõi tiến độ.'
                        }
                    ]
                },
                {
                    title: 'Kiểm soát & Báo cáo',
                    modules: [
                        {
                            icon: 'verified',
                            color: 'green',
                            title: 'Kiểm tra chất lượng (QC)',
                            desc: 'Ghi nhận kết quả kiểm tra từng công đoạn (Đạt/Không đạt), lý do.'
                        },
                        {
                            icon: 'menu_book',
                            color: 'orange',
                            title: 'Nhật ký sản xuất',
                            desc: 'Cập nhật số lượng hoàn thành thực tế theo ca làm việc.'
                        },
                        {
                            icon: 'bar_chart',
                            color: 'red',
                            title: 'Báo cáo hiệu suất (OEE)',
                            desc: 'Phân tích hiệu suất máy, thời gian dừng, tỷ lệ hàng lỗi.'
                        },
                        {
                            icon: 'calculate',
                            color: 'teal',
                            title: 'Giá thành sản xuất',
                            desc: 'Tổng hợp chi phí NVL + Nhân công + Hao mòn → giá vốn.'
                        }
                    ]
                }
            ]
        },
        'kho-van': {
            title: 'Kho vận',
            icon: 'inventory_2',
            badge: 'Kho vận',
            sections: [
                {
                    title: 'Quản lý kho',
                    modules: [
                        { icon: 'warehouse', color: 'blue', title: 'Nhập kho', desc: 'Ghi nhận phiếu nhập kho từ mua hàng, sản xuất, trả hàng.' },
                        { icon: 'local_shipping', color: 'purple', title: 'Xuất kho', desc: 'Quản lý phiếu xuất kho theo đơn hàng, nội bộ, huỷ.' },
                        { icon: 'swap_horiz', color: 'orange', title: 'Chuyển kho', desc: 'Điều chuyển hàng hoá giữa các kho, chi nhánh.' }
                    ]
                },
                {
                    title: 'Kiểm soát tồn kho',
                    modules: [
                        { icon: 'inventory', color: 'green', title: 'Tồn kho', desc: 'Theo dõi số lượng tồn kho theo vị trí, lô, hạn sử dụng.' },
                        { icon: 'fact_check', color: 'teal', title: 'Kiểm kê', desc: 'Kiểm kê kho định kỳ, đối chiếu chênh lệch thực tế.' },
                        { icon: 'assessment', color: 'amber', title: 'Báo cáo kho', desc: 'Thống kê nhập - xuất - tồn, vòng quay hàng tồn kho.' }
                    ]
                }
            ]
        },
        'dieu-hanh': {
            title: 'Điều hành',
            icon: 'dashboard',
            badge: 'Điều hành',
            sections: [
                {
                    title: 'Dashboard',
                    modules: [
                        { icon: 'dashboard_customize', color: 'blue', title: 'Tổng quan doanh nghiệp', desc: 'Dashboard tổng quan KPIs, biểu đồ, chỉ số quan trọng.' },
                        { icon: 'monitoring', color: 'green', title: 'Báo cáo thời gian thực', desc: 'Theo dõi hoạt động doanh nghiệp real-time.' },
                        { icon: 'notifications_active', color: 'orange', title: 'Cảnh báo & Nhắc nhở', desc: 'Hệ thống thông báo tự động cho các sự kiện quan trọng.' }
                    ]
                }
            ]
        },
        'he-thong': {
            title: 'Hệ thống',
            icon: 'settings',
            badge: 'Hệ thống',
            sections: [
                {
                    title: 'Cấu hình hệ thống',
                    modules: [
                        { icon: 'admin_panel_settings', color: 'blue', title: 'Quản lý người dùng', desc: 'Tạo tài khoản, phân quyền và quản lý truy cập.' },
                        { icon: 'security', color: 'purple', title: 'Vai trò & Quyền', desc: 'Cấu hình vai trò, quyền truy cập theo chức năng.' },
                        { icon: 'tune', color: 'orange', title: 'Cấu hình chung', desc: 'Thiết lập tham số hệ thống, đơn vị, tiền tệ, ngôn ngữ.' }
                    ]
                },
                {
                    title: 'Bảo trì hệ thống',
                    modules: [
                        { icon: 'backup', color: 'green', title: 'Sao lưu dữ liệu', desc: 'Sao lưu, phục hồi dữ liệu và quản lý lịch sử.' },
                        { icon: 'history', color: 'teal', title: 'Nhật ký hệ thống', desc: 'Theo dõi hoạt động đăng nhập, thay đổi dữ liệu.' }
                    ]
                }
            ]
        },
        'tro-ly-ai': {
            title: 'Trợ lý AI',
            icon: 'smart_toy',
            badge: 'Trợ lý AI',
            sections: [
                {
                    title: 'Công cụ AI',
                    modules: [
                        { icon: 'psychology', color: 'purple', title: 'Chatbot hỗ trợ', desc: 'Trợ lý AI giải đáp thắc mắc, hướng dẫn sử dụng hệ thống.' },
                        { icon: 'auto_awesome', color: 'blue', title: 'Phân tích dữ liệu AI', desc: 'AI phân tích dữ liệu, phát hiện xu hướng và bất thường.' },
                        { icon: 'recommend', color: 'green', title: 'Đề xuất thông minh', desc: 'AI gợi ý hành động tối ưu dựa trên dữ liệu lịch sử.' }
                    ]
                }
            ]
        },
        'ban-quyen': {
            title: 'Thông tin bản quyền',
            icon: 'info',
            badge: 'Bản quyền',
            sections: []
        }
    };

    // ==========================================
    // State
    // ==========================================
    let currentPage = 'san-xuat';
    let searchQuery = '';
    let activeTab = 'all'; // 'all' | 'starred'
    let starredModules = new Set();

    // Load starred from localStorage
    try {
        const saved = JSON.parse(localStorage.getItem('erp_starred') || '[]');
        starredModules = new Set(saved);
    } catch (e) { }

    // ==========================================
    // DOM References
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebarNav');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const pageContent = document.getElementById('pageContent');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const pageBadge = document.getElementById('pageBadge');
    const notificationBtn = document.getElementById('notificationBtn');
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');

    // ==========================================
    // Clock
    // ==========================================
    function updateClock() {
        const now = new Date();
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockTime.textContent = `${h}:${m}:${s}`;

        const day = days[now.getDay()];
        const d = String(now.getDate()).padStart(2, '0');
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        clockDate.textContent = `${day}, ${d}/${mo}/${y}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // Sidebar Navigation
    // ==========================================
    sidebarNav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (!item) return;
        const page = item.dataset.page;
        if (page) {
            navigateTo(page);
            closeSidebar();
        }
    });

    function navigateTo(page) {
        currentPage = page;
        searchQuery = '';
        activeTab = 'all';

        // Update sidebar active
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeItem) activeItem.classList.add('active');

        // Update header
        const pageData = pagesData[page];
        if (pageData) {
            breadcrumbCurrent.textContent = pageData.title;
            pageBadge.textContent = pageData.badge;
        }

        renderPage();
    }

    // ==========================================
    // Mobile Sidebar
    // ==========================================
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('show');
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    }

    // ==========================================
    // Notification Panel
    // ==========================================
    let notifPanelOpen = false;
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanelOpen = !notifPanelOpen;
        let panel = document.querySelector('.notification-panel');
        if (!panel) {
            panel = createNotificationPanel();
            document.body.appendChild(panel);
        }
        panel.classList.toggle('show', notifPanelOpen);
    });

    document.addEventListener('click', () => {
        const panel = document.querySelector('.notification-panel');
        if (panel) {
            panel.classList.remove('show');
            notifPanelOpen = false;
        }
    });

    function createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.addEventListener('click', e => e.stopPropagation());
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3>Thông báo</h3>
                <span>Đánh dấu đã đọc</span>
            </div>
            <div class="notification-list">
                <div class="notification-item">
                    <div class="notif-icon" style="background:var(--icon-blue-bg);color:var(--icon-blue)">
                        <span class="material-icons-outlined" style="font-size:18px">assignment</span>
                    </div>
                    <div class="notif-body">
                        <div class="notif-title">Lệnh sản xuất MO-2026-0041 đã được duyệt</div>
                        <div class="notif-time">5 phút trước</div>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notif-icon" style="background:var(--icon-orange-bg);color:var(--icon-orange)">
                        <span class="material-icons-outlined" style="font-size:18px">warning</span>
                    </div>
                    <div class="notif-body">
                        <div class="notif-title">Tồn kho NVL-035 dưới mức tối thiểu</div>
                        <div class="notif-time">15 phút trước</div>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notif-icon" style="background:var(--icon-green-bg);color:var(--icon-green)">
                        <span class="material-icons-outlined" style="font-size:18px">check_circle</span>
                    </div>
                    <div class="notif-body">
                        <div class="notif-title">QC công đoạn May - Lô #127 đạt 100%</div>
                        <div class="notif-time">30 phút trước</div>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notif-icon" style="background:var(--icon-purple-bg);color:var(--icon-purple)">
                        <span class="material-icons-outlined" style="font-size:18px">person</span>
                    </div>
                    <div class="notif-body">
                        <div class="notif-title">Nhân viên mới: Nguyễn Văn A - Phòng Sản xuất</div>
                        <div class="notif-time">1 giờ trước</div>
                    </div>
                </div>
            </div>
        `;
        return panel;
    }

    // ==========================================
    // Render Page
    // ==========================================
    function renderPage() {
        const page = pagesData[currentPage];
        if (!page) return;

        // Special pages
        if (currentPage === 'trang-chu') {
            renderHomePage();
            return;
        }

        if (currentPage === 'ban-quyen') {
            renderCopyrightPage();
            return;
        }

        if (page.sections.length === 0) {
            renderPlaceholder(page);
            return;
        }

        let html = `
            <div class="page-top-bar">
                <button class="back-btn" onclick="window.erpApp.goHome()">
                    <span class="material-icons-outlined">arrow_back</span>
                    Quay lại
                </button>
                <div class="tab-group">
                    <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="window.erpApp.setTab('all')">Tất cả</button>
                    <button class="tab-btn ${activeTab === 'starred' ? 'active' : ''}" onclick="window.erpApp.setTab('starred')">Đánh Dấu</button>
                </div>
                <div class="search-box">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="searchInput" placeholder="Tìm module theo tên hoặc mô tả..." value="${searchQuery}" oninput="window.erpApp.onSearch(this.value)">
                </div>
            </div>
        `;

        const filteredSections = getFilteredSections(page.sections);

        if (filteredSections.length === 0) {
            html += `
                <div class="page-placeholder" style="height:40vh">
                    <div class="placeholder-icon">
                        <span class="material-icons-outlined">search_off</span>
                    </div>
                    <h2>Không tìm thấy kết quả</h2>
                    <p>Thử tìm kiếm với từ khoá khác hoặc xoá bộ lọc.</p>
                </div>
            `;
        } else {
            filteredSections.forEach(section => {
                html += `
                    <div class="module-section">
                        <div class="section-title">${section.title}</div>
                        <div class="module-grid">
                            ${section.modules.map(mod => renderCard(mod)).join('')}
                        </div>
                    </div>
                `;
            });
        }

        pageContent.innerHTML = html;
    }

    function getFilteredSections(sections) {
        const q = searchQuery.toLowerCase().trim();
        const result = [];

        sections.forEach(section => {
            let mods = section.modules;

            // Filter by starred
            if (activeTab === 'starred') {
                mods = mods.filter(m => starredModules.has(m.title));
            }

            // Filter by search
            if (q) {
                mods = mods.filter(m =>
                    m.title.toLowerCase().includes(q) ||
                    m.desc.toLowerCase().includes(q)
                );
            }

            if (mods.length > 0) {
                result.push({ ...section, modules: mods });
            }
        });

        return result;
    }

    function renderCard(mod) {
        const isStarred = starredModules.has(mod.title);
        return `
            <div class="module-card" onclick="window.erpApp.openModule('${mod.title.replace(/'/g, "\\'")}')">
                <div class="card-icon ${mod.color}">
                    <span class="material-icons-outlined">${mod.icon}</span>
                </div>
                <div class="card-body">
                    <div class="card-title">${mod.title}</div>
                    <div class="card-desc">${mod.desc}</div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn ${isStarred ? 'starred' : ''}" onclick="event.stopPropagation(); window.erpApp.toggleStar('${mod.title.replace(/'/g, "\\'")}')">
                        <span class="material-icons-outlined">${isStarred ? 'star' : 'star_border'}</span>
                    </button>
                    <button class="card-action-btn" onclick="event.stopPropagation();">
                        <span class="material-icons-outlined">settings</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ==========================================
    // Home Page
    // ==========================================
    let homeTab = 'functions'; // 'functions' | 'starred' | 'all'

    function renderHomePage() {
        // All modules for the home grid
        const homeModules = [
            { page: 'hanh-chinh', icon: 'description', color: 'red', title: 'Hành chính', desc: 'Công văn, hợp đồng, văn thư lưu trữ.' },
            { page: 'nhan-su', icon: 'people', color: 'blue', title: 'Nhân sự', desc: 'Tuyển dụng, đào tạo, chấm công, lương.' },
            { page: 'van-hanh', icon: 'miscellaneous_services', color: 'green', title: 'Vận hành', desc: 'Quản lý vận hành, giám sát và quy trình (Process&Risk).' },
            { page: 'kinh-doanh', icon: 'storefront', color: 'blue', title: 'Kinh doanh', desc: 'Bán hàng, khách hàng, cơ hội và báo các kinh doanh.' },
            { page: 'marketing', icon: 'campaign', color: 'purple', title: 'Marketing', desc: 'Chiến dịch, khách hàng, báo cáo marketing.' },
            { page: 'tai-chinh', icon: 'account_balance', color: 'teal', title: 'Tài chính', desc: 'Kế toán, ngân sách, báo cáo tài chính.' },
            { page: 'mua-hang', icon: 'shopping_cart', color: 'orange', title: 'Mua hàng', desc: 'Đề xuất vật tư, đơn đặt hàng, đối tác.' },
            { page: 'san-xuat', icon: 'precision_manufacturing', color: 'coral', title: 'Sản xuất', desc: 'Kế hoạch sản xuất, quản lý sản xuất.' },
            { page: 'kho-van', icon: 'inventory_2', color: 'blue', title: 'Kho vận', desc: 'Tồn kho, xuất nhập kho, vận chuyển.' },
            { page: 'dieu-hanh', icon: 'dashboard', color: 'green', title: 'Điều hành', desc: 'Điều hành, giám sát và vận hành.' },
            { page: 'he-thong', icon: 'settings', color: 'navy', title: 'Hệ thống', desc: 'Cấu hình, phân quyền và nhiều sự.' },
            { page: 'tro-ly-ai', icon: 'smart_toy', color: 'green', title: 'Trợ lý AI', desc: 'Cấu hình, phân quyền và nhiều sự.' },
            { page: 'ban-quyen', icon: 'info', color: 'teal', title: 'Thông tin bản quyền', desc: 'Quản lý sở hữu trí tuệ và thông tin nhà phát triển.' }
        ];

        // Determine greeting based on time
        const hour = new Date().getHours();
        let greeting = 'Chào buổi sáng';
        if (hour >= 12 && hour < 18) greeting = 'Chào buổi chiều';
        else if (hour >= 18) greeting = 'Chào buổi tối';

        // Filter modules based on tab
        let displayModules = homeModules;
        if (homeTab === 'starred') {
            displayModules = homeModules.filter(m => starredModules.has(m.title));
        }

        let html = `
            <div class="home-page">
                <div class="home-greeting" style="animation: fadeInUp 0.4s ease both;">
                    <h1 class="greeting-text"><em>${greeting}, ${currentUser ? currentUser.fullName : 'Người dùng'}</em> 👋</h1>
                </div>
                <div class="home-tabs">
                    <button class="home-tab ${homeTab === 'functions' ? 'active' : ''}" onclick="window.erpApp.setHomeTab('functions')">Chức năng</button>
                    <button class="home-tab ${homeTab === 'starred' ? 'active' : ''}" onclick="window.erpApp.setHomeTab('starred')">Đánh dấu</button>
                    <button class="home-tab ${homeTab === 'all' ? 'active' : ''}" onclick="window.erpApp.setHomeTab('all')">Tất cả</button>
                </div>
        `;

        if (displayModules.length === 0) {
            html += `
                <div class="page-placeholder" style="height:40vh">
                    <div class="placeholder-icon">
                        <span class="material-icons-outlined">star_border</span>
                    </div>
                    <h2>Chưa có module nào được đánh dấu</h2>
                    <p>Đánh dấu sao ⭐ các module yêu thích để truy cập nhanh tại đây.</p>
                </div>
            `;
        } else {
            html += `<div class="home-grid">`;
            displayModules.forEach((mod, index) => {
                html += `
                    <div class="home-module-card" onclick="window.erpApp.navigateTo('${mod.page}')" style="animation-delay: ${index * 0.04}s">
                        <div class="home-card-icon ${mod.color}">
                            <span class="material-icons-outlined">${mod.icon}</span>
                        </div>
                        <div class="home-card-title">${mod.title}</div>
                        <div class="home-card-desc">${mod.desc}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;
        pageContent.innerHTML = html;
    }

    // ==========================================
    // Copyright Page
    // ==========================================
    function renderCopyrightPage() {
        pageContent.innerHTML = `
            <div class="page-placeholder" style="max-width:480px">
                <div class="placeholder-icon">
                    <span class="material-icons-outlined">verified</span>
                </div>
                <h2>VIETBACHCORP</h2>
                <p style="margin-bottom:4px;color:var(--primary);font-weight:600;">Hệ thống quản lý công ty</p>
                <p style="margin-bottom:16px;">Phiên bản 1.0.0</p>
                <div style="text-align:left;background:var(--bg-secondary);border-radius:12px;padding:20px 24px;width:100%;border:1px solid var(--border-light)">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:14px;font-weight:600;color:var(--text-primary)">
                        <span class="material-icons-outlined" style="font-size:18px;color:var(--primary)">person</span> Nguyễn Quang Quốc
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:var(--text-secondary)">
                        <span class="material-icons-outlined" style="font-size:16px;color:#16A34A">phone</span> 0935 435 496
                    </div>
                    <div style="display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--text-secondary)">
                        <span class="material-icons-outlined" style="font-size:16px;color:#DC2626;margin-top:1px">location_on</span> TDP La Chữ Thượng, Phường Kim Trà, Thành phố Huế
                    </div>
                </div>
                <p style="margin-top:16px;font-size:12px;color:var(--text-muted)">© 2026 Nguyễn Quang Quốc. All rights reserved.</p>
            </div>
        `;
    }

    // ==========================================
    // Placeholder Page
    // ==========================================
    function renderPlaceholder(page) {
        pageContent.innerHTML = `
            <div class="page-placeholder">
                <div class="placeholder-icon">
                    <span class="material-icons-outlined">${page.icon}</span>
                </div>
                <h2>${page.title}</h2>
                <p>Module đang được phát triển, vui lòng quay lại sau.</p>
            </div>
        `;
    }

    // ==========================================
    // Public API
    // ==========================================
    window.erpApp = {
        navigateTo: navigateTo,
        goHome: () => navigateTo('trang-chu'),

        setHomeTab: (tab) => {
            homeTab = tab;
            renderHomePage();
        },

        setTab: (tab) => {
            activeTab = tab;
            renderPage();
        },

        onSearch: (val) => {
            searchQuery = val;
            renderPage();
            // Restore focus on search input
            const input = document.getElementById('searchInput');
            if (input) {
                input.focus();
                input.setSelectionRange(val.length, val.length);
            }
        },

        toggleStar: (title) => {
            if (starredModules.has(title)) {
                starredModules.delete(title);
            } else {
                starredModules.add(title);
            }
            localStorage.setItem('erp_starred', JSON.stringify([...starredModules]));
            renderPage();
        },

        openModule: (title) => {
            if (title === 'Hồ sơ nhân viên') { renderHoSoNhanVien(); return; }
            if (title === 'Quản lý hợp đồng') { renderHopDongLaoDong(); return; }
            if (title === 'Chấm công') { renderChamCong(); return; }
            if (title === 'Lưu trữ hồ sơ') { renderLuuTruHoSo(); return; }
            if (title === 'Quản lý công văn') { renderQuanLyCongVan(); return; }
            // Generic modules - use function to avoid TDZ
            const cfg = getModuleConfig(title);
            if (cfg) { renderGenericModule(cfg); return; }
            showToast(`Mở module: ${title}`);
        }
    };

    // Helper function (hoisted) to get module config from all registries
    function getModuleConfig(title) {
        // Check hanhChinhModules when it's available
        if (typeof hanhChinhModules !== 'undefined' && hanhChinhModules[title]) {
            return hanhChinhModules[title];
        }
        return null;
    }

    // ==========================================
    // Toast Notification
    // ==========================================
    function showToast(message) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <span class="material-icons-outlined" style="font-size:18px;color:var(--primary);">check_circle</span>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
            padding: 10px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 500;
            z-index: 1000;
            animation: toastIn 0.3s ease forwards;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Add toast animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(styleSheet);

    // ==========================================
    // User Dropdown
    // ==========================================
    const userProfileArea = document.getElementById('userProfileArea');
    const userDropdown = document.getElementById('userDropdown');
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userInfoHeader = document.getElementById('userInfoHeader');

    function toggleUserDropdown(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
        // Close notification panel if open
        const notifPanel = document.querySelector('.notification-panel');
        if (notifPanel) notifPanel.classList.remove('show');
    }

    if (userAvatarBtn) userAvatarBtn.addEventListener('click', toggleUserDropdown);
    if (userInfoHeader) userInfoHeader.addEventListener('click', toggleUserDropdown);

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (userDropdown && !userProfileArea.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Dropdown menu actions
    document.getElementById('btnProfile')?.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        showToast('Mở hồ sơ cá nhân');
    });

    document.getElementById('btnSettings')?.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        navigateTo('he-thong');
    });

    document.getElementById('btnChangePassword')?.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        showToast('Chức năng đổi mật khẩu');
    });

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        handleLogout();
    });

    // ==========================================
    // MODULE: Hồ sơ nhân viên (CRUD)
    // ==========================================

    // --- Dữ liệu mẫu ---
    const avatarColors = [
        '#4A7CFF', '#7C5CFC', '#FF8C42', '#34C759', '#FF5757',
        '#00B8D4', '#E040FB', '#FFB300', '#EF5350', '#6366F1',
        '#43A047', '#FB8C00', '#AB47BC', '#1E88E5', '#D81B60'
    ];

    let employees = [
        { id: 'NV001', name: 'Nguyễn Văn An', gender: 'Nam', dob: '1990-05-15', cccd: '001090012345', phone: '0901234567', email: 'an.nguyen@company.vn', department: 'Phòng Kỹ thuật', position: 'Trưởng phòng', joinDate: '2018-03-01', status: 'active', address: '123 Lý Thường Kiệt, Q.10, TP.HCM', note: '' },
        { id: 'NV002', name: 'Trần Thị Bích', gender: 'Nữ', dob: '1992-08-20', cccd: '001092034567', phone: '0912345678', email: 'bich.tran@company.vn', department: 'Phòng Nhân sự', position: 'Chuyên viên', joinDate: '2019-07-15', status: 'active', address: '45 Nguyễn Huệ, Q.1, TP.HCM', note: '' },
        { id: 'NV003', name: 'Lê Hoàng Cường', gender: 'Nam', dob: '1988-12-03', cccd: '001088056789', phone: '0923456789', email: 'cuong.le@company.vn', department: 'Phòng Sản xuất', position: 'Phó phòng', joinDate: '2017-01-10', status: 'active', address: '78 Trần Hưng Đạo, Q.5, TP.HCM', note: 'Quản lý dây chuyền chính' },
        { id: 'NV004', name: 'Phạm Thúy Dung', gender: 'Nữ', dob: '1995-03-28', cccd: '001095078901', phone: '0934567890', email: 'dung.pham@company.vn', department: 'Phòng Kế toán', position: 'Kế toán trưởng', joinDate: '2020-02-20', status: 'active', address: '210 Hai Bà Trưng, Q.3, TP.HCM', note: '' },
        { id: 'NV005', name: 'Hoàng Minh Đức', gender: 'Nam', dob: '1993-07-11', cccd: '001093090123', phone: '0945678901', email: 'duc.hoang@company.vn', department: 'Phòng Kỹ thuật', position: 'Kỹ sư phần mềm', joinDate: '2021-06-05', status: 'active', address: '56 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM', note: '' },
        { id: 'NV006', name: 'Võ Kim Em', gender: 'Nữ', dob: '1997-01-22', cccd: '001097012345', phone: '0956789012', email: 'em.vo@company.vn', department: 'Phòng Marketing', position: 'Nhân viên', joinDate: '2023-09-01', status: 'probation', address: '32 Lê Văn Sỹ, Q.3, TP.HCM', note: 'Thử việc 2 tháng' },
        { id: 'NV007', name: 'Đặng Văn Phúc', gender: 'Nam', dob: '1985-11-09', cccd: '001085034567', phone: '0967890123', email: 'phuc.dang@company.vn', department: 'Phòng Sản xuất', position: 'Quản đốc', joinDate: '2015-04-18', status: 'active', address: '88 Cách Mạng Tháng 8, Q.10, TP.HCM', note: '' },
        { id: 'NV008', name: 'Ngô Thanh Giang', gender: 'Nữ', dob: '1994-06-14', cccd: '001094056789', phone: '0978901234', email: 'giang.ngo@company.vn', department: 'Phòng Nhân sự', position: 'Trưởng phòng', joinDate: '2019-01-02', status: 'active', address: '167 Pasteur, Q.3, TP.HCM', note: '' },
        { id: 'NV009', name: 'Bùi Quang Hải', gender: 'Nam', dob: '1991-09-30', cccd: '001091078901', phone: '0989012345', email: 'hai.bui@company.vn', department: 'Phòng Kinh doanh', position: 'Trưởng phòng', joinDate: '2018-08-12', status: 'active', address: '245 Nguyễn Thị Minh Khai, Q.1, TP.HCM', note: '' },
        { id: 'NV010', name: 'Phan Thị Hương', gender: 'Nữ', dob: '1996-04-05', cccd: '001096090123', phone: '0990123456', email: 'huong.phan@company.vn', department: 'Phòng Kế toán', position: 'Nhân viên', joinDate: '2022-03-10', status: 'active', address: '90 Võ Văn Tần, Q.3, TP.HCM', note: '' },
        { id: 'NV011', name: 'Lý Văn Khoa', gender: 'Nam', dob: '1989-02-17', cccd: '001089012345', phone: '0901122334', email: 'khoa.ly@company.vn', department: 'Phòng Kỹ thuật', position: 'Kỹ sư', joinDate: '2020-11-25', status: 'active', address: '12 Trường Chinh, Q. Tân Bình, TP.HCM', note: '' },
        { id: 'NV012', name: 'Mai Thị Lan', gender: 'Nữ', dob: '1998-10-08', cccd: '001098034567', phone: '0912233445', email: 'lan.mai@company.vn', department: 'Phòng Marketing', position: 'Chuyên viên', joinDate: '2024-01-15', status: 'probation', address: '78 Nguyễn Đình Chiểu, Q.3, TP.HCM', note: 'Chuyên viên Content' },
        { id: 'NV013', name: 'Trương Minh Long', gender: 'Nam', dob: '1987-08-25', cccd: '001087056789', phone: '0923344556', email: 'long.truong@company.vn', department: 'Phòng Sản xuất', position: 'Kỹ sư QC', joinDate: '2016-06-20', status: 'inactive', address: '345 Hoàng Văn Thụ, Q. Phú Nhuận, TP.HCM', note: 'Nghỉ không lương' },
        { id: 'NV014', name: 'Đinh Thị Ngọc', gender: 'Nữ', dob: '1993-12-12', cccd: '001093078901', phone: '0934455667', email: 'ngoc.dinh@company.vn', department: 'Phòng Kinh doanh', position: 'Nhân viên', joinDate: '2021-09-08', status: 'active', address: '56 Nguyễn Trãi, Q.5, TP.HCM', note: '' },
        { id: 'NV015', name: 'Cao Văn Phong', gender: 'Nam', dob: '1990-07-19', cccd: '001090090123', phone: '0945566778', email: 'phong.cao@company.vn', department: 'Phòng Kỹ thuật', position: 'Nhân viên', joinDate: '2022-07-01', status: 'active', address: '123 Bà Huyện Thanh Quan, Q.3, TP.HCM', note: '' }
    ];

    let empSearchQuery = '';
    let empCurrentPage = 1;
    const empPageSize = 8;

    // --- Hàm tiện ích ---
    function getInitials(name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function getAvatarColor(id) {
        const idx = parseInt(id.replace(/\D/g, ''), 10) || 0;
        return avatarColors[idx % avatarColors.length];
    }

    // Tạo HTML avatar (ảnh hoặc chữ cái)
    function renderAvatarHtml(emp, size, fontSize) {
        size = size || 32;
        fontSize = fontSize || 11;
        const initials = getInitials(emp.name);
        const color = getAvatarColor(emp.id);
        if (emp.avatar) {
            return `<div class="td-avatar" style="width:${size}px;height:${size}px;"><img src="${emp.avatar}" alt="${emp.name}"></div>`;
        }
        return `<div class="td-avatar" style="width:${size}px;height:${size}px;font-size:${fontSize}px;background:${color}">${initials}</div>`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function getStatusLabel(status) {
        const map = { active: 'Đang làm việc', inactive: 'Nghỉ việc', probation: 'Thử việc' };
        return map[status] || status;
    }

    function getGenderLabel(gender) {
        return gender === 'Nam' ? 'Nam' : 'Nữ';
    }

    function nextEmployeeId() {
        const ids = employees.map(e => parseInt(e.id.replace(/\D/g, ''), 10));
        const maxId = Math.max(...ids, 0);
        return 'NV' + String(maxId + 1).padStart(3, '0');
    }

    // --- Render chính ---
    function renderHoSoNhanVien() {
        // Cập nhật breadcrumb
        breadcrumbCurrent.textContent = 'Hồ sơ nhân viên';
        pageBadge.textContent = 'Nhân sự';

        const filtered = getFilteredEmployees();
        const totalPages = Math.ceil(filtered.length / empPageSize);
        if (empCurrentPage > totalPages && totalPages > 0) empCurrentPage = totalPages;
        const startIdx = (empCurrentPage - 1) * empPageSize;
        const pageData = filtered.slice(startIdx, startIdx + empPageSize);

        // Thống kê
        const totalActive = employees.filter(e => e.status === 'active').length;
        const totalProbation = employees.filter(e => e.status === 'probation').length;
        const totalInactive = employees.filter(e => e.status === 'inactive').length;

        let html = `
            <div class="employee-module">
                <!-- Toolbar -->
                <div class="employee-toolbar">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('nhan-su')">
                        <span class="material-icons-outlined">arrow_back</span>
                        Quay lại
                    </button>
                    <div class="search-box">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="empSearchInput" placeholder="Tìm theo tên, mã NV, phòng ban..." value="${empSearchQuery}" oninput="window.erpApp.empSearch(this.value)">
                    </div>
                    <button class="btn-add-employee" onclick="window.erpApp.openEmpModal()">
                        <span class="material-icons-outlined">person_add</span>
                        Thêm nhân viên
                    </button>
                </div>

                <!-- Thống kê -->
                <div class="employee-stats">
                    <div class="stat-card">
                        <div class="stat-card-icon blue">
                            <span class="material-icons-outlined">groups</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${employees.length}</div>
                            <div class="stat-card-label">Tổng nhân viên</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon green">
                            <span class="material-icons-outlined">how_to_reg</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalActive}</div>
                            <div class="stat-card-label">Đang làm việc</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon orange">
                            <span class="material-icons-outlined">pending</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalProbation}</div>
                            <div class="stat-card-label">Thử việc</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon red">
                            <span class="material-icons-outlined">person_off</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalInactive}</div>
                            <div class="stat-card-label">Nghỉ việc</div>
                        </div>
                    </div>
                </div>

                <!-- Bảng dữ liệu -->
                <div class="table-container">
                    <div class="table-header-bar">
                        <div class="table-title">
                            <span class="material-icons-outlined">badge</span>
                            Danh sách nhân viên
                        </div>
                        <div class="table-count">${filtered.length} kết quả</div>
                    </div>
                    <div class="table-scroll">
        `;

        if (filtered.length === 0) {
            html += `
                <div class="table-empty">
                    <span class="material-icons-outlined">search_off</span>
                    <p>Không tìm thấy nhân viên nào phù hợp.</p>
                </div>
            `;
        } else {
            html += `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã NV</th>
                            <th>Họ và tên</th>
                            <th>Giới tính</th>
                            <th>Ngày sinh</th>
                            <th>Phòng ban</th>
                            <th>Chức vụ</th>
                            <th>Số điện thoại</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            pageData.forEach(emp => {
                const initials = getInitials(emp.name);
                const color = getAvatarColor(emp.id);
                const genderClass = emp.gender === 'Nam' ? 'male' : 'female';
                html += `
                    <tr>
                        <td class="td-id">${emp.id}</td>
                        <td>
                            <div class="td-name">
                                ${renderAvatarHtml(emp, 32, 11)}
                                <div class="td-name-text">
                                    <span class="td-name-main">${emp.name}</span>
                                    <span class="td-name-sub">${emp.email}</span>
                                </div>
                            </div>
                        </td>
                        <td><span class="gender-badge ${genderClass}">${emp.gender}</span></td>
                        <td>${formatDate(emp.dob)}</td>
                        <td>${emp.department}</td>
                        <td>${emp.position}</td>
                        <td>${emp.phone}</td>
                        <td><span class="status-badge ${emp.status}">${getStatusLabel(emp.status)}</span></td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view" title="Xem chi tiết" onclick="window.erpApp.viewEmployee('${emp.id}')">
                                    <span class="material-icons-outlined">visibility</span>
                                </button>
                                <button class="table-action-btn edit" title="Chỉnh sửa" onclick="window.erpApp.openEmpModal('${emp.id}')">
                                    <span class="material-icons-outlined">edit</span>
                                </button>
                                <button class="table-action-btn delete" title="Xóa" onclick="window.erpApp.confirmDeleteEmployee('${emp.id}')">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
        }

        html += `</div>`; // end table-scroll

        // Phân trang
        if (totalPages > 1) {
            html += `
                <div class="table-footer">
                    <span>Hiển thị ${startIdx + 1}–${Math.min(startIdx + empPageSize, filtered.length)} / ${filtered.length} nhân viên</span>
                    <div class="pagination">
                        <button class="pagination-btn" onclick="window.erpApp.empGoPage(${empCurrentPage - 1})" ${empCurrentPage === 1 ? 'disabled' : ''}>
                            <span class="material-icons-outlined">chevron_left</span>
                        </button>
            `;
            for (let p = 1; p <= totalPages; p++) {
                html += `<button class="pagination-btn ${p === empCurrentPage ? 'active' : ''}" onclick="window.erpApp.empGoPage(${p})">${p}</button>`;
            }
            html += `
                        <button class="pagination-btn" onclick="window.erpApp.empGoPage(${empCurrentPage + 1})" ${empCurrentPage === totalPages ? 'disabled' : ''}>
                            <span class="material-icons-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            `;
        }

        html += `</div></div>`; // end table-container, employee-module

        pageContent.innerHTML = html;

        // Giữ focus search
        const searchInput = document.getElementById('empSearchInput');
        if (searchInput && empSearchQuery) {
            searchInput.focus();
            searchInput.setSelectionRange(empSearchQuery.length, empSearchQuery.length);
        }
    }

    function getFilteredEmployees() {
        const q = empSearchQuery.toLowerCase().trim();
        if (!q) return [...employees];
        return employees.filter(e =>
            e.id.toLowerCase().includes(q) ||
            e.name.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            e.position.toLowerCase().includes(q) ||
            e.phone.includes(q) ||
            e.email.toLowerCase().includes(q)
        );
    }

    // --- Modal Thêm/Sửa ---
    function openEmpModal(editId) {
        const isEdit = !!editId;
        const emp = isEdit ? employees.find(e => e.id === editId) : null;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'empModal';

        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>
                        <span class="material-icons-outlined">${isEdit ? 'edit' : 'person_add'}</span>
                        ${isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                    </h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeEmpModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <form id="empForm" class="modal-body" onsubmit="window.erpApp.saveEmployee(event)">
                    <input type="hidden" id="empEditId" value="${isEdit ? emp.id : ''}">
                    <input type="hidden" id="empAvatarData" value="">

                    <!-- Avatar Upload -->
                    <div class="avatar-upload-area">
                        <div class="avatar-preview" id="avatarPreview" onclick="document.getElementById('empAvatarInput').click()" style="background:${isEdit ? getAvatarColor(emp.id) : '#9CA8B8'}">
                            ${isEdit && emp.avatar ? `<img src="${emp.avatar}" alt="avatar">` : `<span id="avatarInitialsPreview">${isEdit ? getInitials(emp.name) : '?'}</span>`}
                            <div class="avatar-overlay">
                                <span class="material-icons-outlined">photo_camera</span>
                            </div>
                        </div>
                        <input type="file" id="empAvatarInput" accept="image/*" style="display:none" onchange="window.erpApp.handleAvatarUpload(event)">
                        <div class="avatar-upload-actions">
                            <button type="button" class="btn-upload-avatar" onclick="document.getElementById('empAvatarInput').click()">
                                <span class="material-icons-outlined">upload</span>
                                Chọn ảnh
                            </button>
                            <button type="button" class="btn-remove-avatar" id="btnRemoveAvatar" onclick="window.erpApp.removeAvatar()" style="display:${isEdit && emp.avatar ? 'flex' : 'none'}">
                                <span class="material-icons-outlined">close</span>
                                Xóa ảnh
                            </button>
                        </div>
                        <div class="avatar-hint">JPG, PNG tối đa 2MB · Tỉ lệ 1:1 tốt nhất</div>
                    </div>

                    <div class="form-section-title">Thông tin cá nhân</div>
                    <div class="form-grid">
                        <div class="form-field full-width">
                            <label>Họ và tên <span class="required">*</span></label>
                            <input type="text" id="empName" placeholder="Nhập họ và tên đầy đủ" value="${isEdit ? emp.name : ''}" required>
                        </div>
                        <div class="form-field">
                            <label>Giới tính <span class="required">*</span></label>
                            <select id="empGender" required>
                                <option value="">-- Chọn --</option>
                                <option value="Nam" ${isEdit && emp.gender === 'Nam' ? 'selected' : ''}>Nam</option>
                                <option value="Nữ" ${isEdit && emp.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Ngày sinh <span class="required">*</span></label>
                            <input type="date" id="empDob" value="${isEdit ? emp.dob : ''}" required>
                        </div>
                        <div class="form-field">
                            <label>Số CCCD / CMND</label>
                            <input type="text" id="empCccd" placeholder="0010xxxxxxxx" value="${isEdit ? emp.cccd : ''}">
                        </div>
                        <div class="form-field">
                            <label>Số điện thoại <span class="required">*</span></label>
                            <input type="tel" id="empPhone" placeholder="09xxxxxxxx" value="${isEdit ? emp.phone : ''}" required>
                        </div>
                        <div class="form-field full-width">
                            <label>Email</label>
                            <input type="email" id="empEmail" placeholder="email@company.vn" value="${isEdit ? emp.email : ''}">
                        </div>
                        <div class="form-field full-width">
                            <label>Địa chỉ</label>
                            <input type="text" id="empAddress" placeholder="Số nhà, đường, quận/huyện, tỉnh/TP" value="${isEdit ? emp.address : ''}">
                        </div>
                    </div>

                    <div class="form-section-title">Thông tin công việc</div>
                    <div class="form-grid">
                        <div class="form-field">
                            <label>Phòng ban <span class="required">*</span></label>
                            <select id="empDepartment" required>
                                <option value="">-- Chọn phòng ban --</option>
                                <option value="Phòng Kỹ thuật" ${isEdit && emp.department === 'Phòng Kỹ thuật' ? 'selected' : ''}>Phòng Kỹ thuật</option>
                                <option value="Phòng Nhân sự" ${isEdit && emp.department === 'Phòng Nhân sự' ? 'selected' : ''}>Phòng Nhân sự</option>
                                <option value="Phòng Sản xuất" ${isEdit && emp.department === 'Phòng Sản xuất' ? 'selected' : ''}>Phòng Sản xuất</option>
                                <option value="Phòng Kế toán" ${isEdit && emp.department === 'Phòng Kế toán' ? 'selected' : ''}>Phòng Kế toán</option>
                                <option value="Phòng Kinh doanh" ${isEdit && emp.department === 'Phòng Kinh doanh' ? 'selected' : ''}>Phòng Kinh doanh</option>
                                <option value="Phòng Marketing" ${isEdit && emp.department === 'Phòng Marketing' ? 'selected' : ''}>Phòng Marketing</option>
                                <option value="Phòng Hành chính" ${isEdit && emp.department === 'Phòng Hành chính' ? 'selected' : ''}>Phòng Hành chính</option>
                                <option value="Ban Giám đốc" ${isEdit && emp.department === 'Ban Giám đốc' ? 'selected' : ''}>Ban Giám đốc</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Chức vụ <span class="required">*</span></label>
                            <select id="empPosition" required>
                                <option value="">-- Chọn chức vụ --</option>
                                <option value="Giám đốc" ${isEdit && emp.position === 'Giám đốc' ? 'selected' : ''}>Giám đốc</option>
                                <option value="Phó Giám đốc" ${isEdit && emp.position === 'Phó Giám đốc' ? 'selected' : ''}>Phó Giám đốc</option>
                                <option value="Trưởng phòng" ${isEdit && emp.position === 'Trưởng phòng' ? 'selected' : ''}>Trưởng phòng</option>
                                <option value="Phó phòng" ${isEdit && emp.position === 'Phó phòng' ? 'selected' : ''}>Phó phòng</option>
                                <option value="Quản đốc" ${isEdit && emp.position === 'Quản đốc' ? 'selected' : ''}>Quản đốc</option>
                                <option value="Kế toán trưởng" ${isEdit && emp.position === 'Kế toán trưởng' ? 'selected' : ''}>Kế toán trưởng</option>
                                <option value="Kỹ sư" ${isEdit && emp.position === 'Kỹ sư' ? 'selected' : ''}>Kỹ sư</option>
                                <option value="Kỹ sư phần mềm" ${isEdit && emp.position === 'Kỹ sư phần mềm' ? 'selected' : ''}>Kỹ sư phần mềm</option>
                                <option value="Kỹ sư QC" ${isEdit && emp.position === 'Kỹ sư QC' ? 'selected' : ''}>Kỹ sư QC</option>
                                <option value="Chuyên viên" ${isEdit && emp.position === 'Chuyên viên' ? 'selected' : ''}>Chuyên viên</option>
                                <option value="Nhân viên" ${isEdit && emp.position === 'Nhân viên' ? 'selected' : ''}>Nhân viên</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Ngày vào làm <span class="required">*</span></label>
                            <input type="date" id="empJoinDate" value="${isEdit ? emp.joinDate : ''}" required>
                        </div>
                        <div class="form-field">
                            <label>Trạng thái <span class="required">*</span></label>
                            <select id="empStatus" required>
                                <option value="">-- Chọn --</option>
                                <option value="active" ${isEdit && emp.status === 'active' ? 'selected' : ''}>Đang làm việc</option>
                                <option value="probation" ${isEdit && emp.status === 'probation' ? 'selected' : ''}>Thử việc</option>
                                <option value="inactive" ${isEdit && emp.status === 'inactive' ? 'selected' : ''}>Nghỉ việc</option>
                            </select>
                        </div>
                        <div class="form-field full-width">
                            <label>Ghi chú</label>
                            <textarea id="empNote" placeholder="Ghi chú thêm (nếu có)...">${isEdit ? emp.note : ''}</textarea>
                        </div>
                    </div>
                </form>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeEmpModal()">Hủy bỏ</button>
                    <button class="btn-save" type="submit" onclick="document.getElementById('empForm').requestSubmit()">
                        <span class="material-icons-outlined">save</span>
                        ${isEdit ? 'Cập nhật' : 'Lưu mới'}
                    </button>
                </div>
            </div>
        `;

        // Đóng khi click overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeEmpModal();
        });

        document.body.appendChild(overlay);
    }

    function closeEmpModal() {
        const modal = document.getElementById('empModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    function saveEmployee(e) {
        e.preventDefault();

        const editId = document.getElementById('empEditId').value;
        const avatarDataEl = document.getElementById('empAvatarData');
        const data = {
            name: document.getElementById('empName').value.trim(),
            gender: document.getElementById('empGender').value,
            dob: document.getElementById('empDob').value,
            cccd: document.getElementById('empCccd').value.trim(),
            phone: document.getElementById('empPhone').value.trim(),
            email: document.getElementById('empEmail').value.trim(),
            address: document.getElementById('empAddress').value.trim(),
            department: document.getElementById('empDepartment').value,
            position: document.getElementById('empPosition').value,
            joinDate: document.getElementById('empJoinDate').value,
            status: document.getElementById('empStatus').value,
            note: document.getElementById('empNote').value.trim()
        };

        // Xử lý avatar
        if (avatarDataEl && avatarDataEl.value === '__REMOVED__') {
            data.avatar = '';
        } else if (avatarDataEl && avatarDataEl.value && avatarDataEl.value !== '__REMOVED__') {
            data.avatar = avatarDataEl.value;
        }

        if (editId) {
            // Chỉnh sửa
            const idx = employees.findIndex(e => e.id === editId);
            if (idx !== -1) {
                employees[idx] = { ...employees[idx], ...data };
                if (window.CrudSync) window.CrudSync.saveItem('employees', employees[idx], 'id');
            }
            showToast(`Đã cập nhật thông tin: ${data.name}`);
        } else {
            // Thêm mới
            const newEmp = { id: nextEmployeeId(), ...data };
            employees.push(newEmp);
            if (window.CrudSync) window.CrudSync.saveItem('employees', newEmp, 'id');
            showToast(`Đã thêm nhân viên: ${data.name}`);
        }

        closeEmpModal();
        renderHoSoNhanVien();
    }

    // --- Xem chi tiết ---
    function viewEmployee(id) {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'empViewModal';

        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 560px;">
                <div class="modal-header">
                    <h2>
                        <span class="material-icons-outlined">badge</span>
                        Chi tiết nhân viên
                    </h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeViewModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center; margin-bottom: 18px;">
                        <div style="display:inline-block;margin:0 auto 8px;">${renderAvatarHtml(emp, 64, 22)}</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary)">${emp.name}</div>
                        <div style="font-size:12px;color:var(--text-muted)">${emp.id} · ${emp.position}</div>
                        <div style="margin-top:6px">
                            <span class="status-badge ${emp.status}">${getStatusLabel(emp.status)}</span>
                        </div>
                    </div>

                    <div class="detail-section-title">
                        <span class="material-icons-outlined">person</span>
                        Thông tin cá nhân
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Giới tính</span>
                            <span class="detail-value"><span class="gender-badge ${emp.gender === 'Nam' ? 'male' : 'female'}">${emp.gender}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày sinh</span>
                            <span class="detail-value">${formatDate(emp.dob)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số CCCD</span>
                            <span class="detail-value">${emp.cccd || '—'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số điện thoại</span>
                            <span class="detail-value">${emp.phone}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${emp.email || '—'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="detail-label">Địa chỉ</span>
                            <span class="detail-value">${emp.address || '—'}</span>
                        </div>
                    </div>

                    <div class="detail-section-title">
                        <span class="material-icons-outlined">work</span>
                        Thông tin công việc
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Phòng ban</span>
                            <span class="detail-value">${emp.department}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Chức vụ</span>
                            <span class="detail-value">${emp.position}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày vào làm</span>
                            <span class="detail-value">${formatDate(emp.joinDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Trạng thái</span>
                            <span class="detail-value"><span class="status-badge ${emp.status}">${getStatusLabel(emp.status)}</span></span>
                        </div>
                        ${emp.note ? `
                        <div class="detail-item full-width">
                            <span class="detail-label">Ghi chú</span>
                            <span class="detail-value">${emp.note}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeViewModal()">Đóng</button>
                    <button class="btn-save" onclick="window.erpApp.closeViewModal(); window.erpApp.openEmpModal('${emp.id}')">
                        <span class="material-icons-outlined">edit</span>
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 200);
            }
        });

        document.body.appendChild(overlay);
    }

    // --- Xác nhận xóa ---
    function confirmDeleteEmployee(id) {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'empConfirmModal';

        overlay.innerHTML = `
            <div class="modal-content confirm-dialog">
                <div class="confirm-icon">
                    <span class="material-icons-outlined">warning</span>
                </div>
                <h3>Xóa nhân viên?</h3>
                <p>Bạn có chắc chắn muốn xóa nhân viên <span class="confirm-name">${emp.name}</span> (${emp.id}) khỏi hệ thống? Hành động này không thể hoàn tác.</p>
                <div class="confirm-actions">
                    <button class="btn-cancel" onclick="window.erpApp.closeConfirmModal()">Hủy bỏ</button>
                    <button class="btn-confirm-delete" onclick="window.erpApp.deleteEmployee('${emp.id}')">
                        <span class="material-icons-outlined">delete</span>
                        Xóa nhân viên
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 200);
            }
        });

        document.body.appendChild(overlay);
    }

    function deleteEmployee(id) {
        const emp = employees.find(e => e.id === id);
        employees = employees.filter(e => e.id !== id);
        if (window.CrudSync) window.CrudSync.deleteItem('employees', id);
        closeConfirmModal();
        renderHoSoNhanVien();
        showToast(`Đã xóa nhân viên: ${emp ? emp.name : id}`);
    }

    function closeConfirmModal() {
        const modal = document.getElementById('empConfirmModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    function closeViewModal() {
        const modal = document.getElementById('empViewModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    // ==========================================
    // MODULE: Hợp đồng lao động (CRUD)
    // ==========================================

    let contracts = [
        { id: 'HD001', empId: 'NV001', empName: 'Nguyễn Văn An', contractType: 'indefinite', startDate: '2018-03-01', endDate: '', terminateDate: '', status: 'active', salary: 25000000, note: 'Hợp đồng chính thức', files: [{ name: 'HD001_NguyenVanAn.pdf', size: '1.2 MB', type: 'pdf' }] },
        { id: 'HD002', empId: 'NV002', empName: 'Trần Thị Bích', contractType: 'definite', startDate: '2019-07-15', endDate: '2025-07-15', terminateDate: '', status: 'active', salary: 15000000, note: 'HĐ 6 năm', files: [] },
        { id: 'HD003', empId: 'NV003', empName: 'Lê Hoàng Cường', contractType: 'indefinite', startDate: '2017-01-10', endDate: '', terminateDate: '', status: 'active', salary: 22000000, note: '', files: [{ name: 'HD003_LeHoangCuong.pdf', size: '890 KB', type: 'pdf' }] },
        { id: 'HD004', empId: 'NV004', empName: 'Phạm Thúy Dung', contractType: 'definite', startDate: '2020-02-20', endDate: '2026-02-20', terminateDate: '', status: 'active', salary: 18000000, note: '', files: [] },
        { id: 'HD005', empId: 'NV005', empName: 'Hoàng Minh Đức', contractType: 'definite', startDate: '2021-06-05', endDate: '2024-06-05', terminateDate: '', status: 'expired', salary: 16000000, note: 'Đã hết hạn, chờ gia hạn', files: [] },
        { id: 'HD006', empId: 'NV006', empName: 'Võ Kim Em', contractType: 'probation', startDate: '2023-09-01', endDate: '2023-11-01', terminateDate: '', status: 'expired', salary: 8000000, note: 'Thử việc 2 tháng', files: [] },
        { id: 'HD007', empId: 'NV007', empName: 'Đặng Văn Phúc', contractType: 'indefinite', startDate: '2015-04-18', endDate: '', terminateDate: '', status: 'active', salary: 28000000, note: '', files: [{ name: 'HD007_DangVanPhuc.docx', size: '756 KB', type: 'doc' }] },
        { id: 'HD008', empId: 'NV008', empName: 'Ngô Thanh Giang', contractType: 'indefinite', startDate: '2019-01-02', endDate: '', terminateDate: '', status: 'active', salary: 24000000, note: '', files: [] },
        { id: 'HD009', empId: 'NV009', empName: 'Bùi Quang Hải', contractType: 'definite', startDate: '2018-08-12', endDate: '2028-08-12', terminateDate: '', status: 'active', salary: 26000000, note: 'HĐ 10 năm', files: [{ name: 'HD009_BuiQuangHai.pdf', size: '1.5 MB', type: 'pdf' }] },
        { id: 'HD010', empId: 'NV010', empName: 'Phan Thị Hương', contractType: 'definite', startDate: '2022-03-10', endDate: '2025-03-10', terminateDate: '', status: 'active', salary: 12000000, note: '', files: [] },
        { id: 'HD011', empId: 'NV011', empName: 'Lý Văn Khoa', contractType: 'definite', startDate: '2020-11-25', endDate: '2025-11-25', terminateDate: '', status: 'active', salary: 17000000, note: '', files: [] },
        { id: 'HD012', empId: 'NV012', empName: 'Mai Thị Lan', contractType: 'probation', startDate: '2024-01-15', endDate: '2024-03-15', terminateDate: '', status: 'pending', salary: 7500000, note: 'Chờ ký HĐ chính thức', files: [] },
        { id: 'HD013', empId: 'NV013', empName: 'Trương Minh Long', contractType: 'definite', startDate: '2016-06-20', endDate: '2024-06-20', terminateDate: '2024-01-15', status: 'terminated', salary: 19000000, note: 'Nghỉ không lương', files: [{ name: 'HD013_TruongMinhLong_ChapDut.pdf', size: '430 KB', type: 'pdf' }] },
        { id: 'HD014', empId: 'NV014', empName: 'Đinh Thị Ngọc', contractType: 'seasonal', startDate: '2021-09-08', endDate: '2024-09-08', terminateDate: '', status: 'expired', salary: 11000000, note: 'HĐ thời vụ', files: [] },
        { id: 'HD015', empId: 'NV015', empName: 'Cao Văn Phong', contractType: 'definite', startDate: '2022-07-01', endDate: '2025-07-01', terminateDate: '', status: 'active', salary: 14000000, note: '', files: [] }
    ];

    let ctSearchQuery = '';
    let ctCurrentPage = 1;
    const ctPageSize = 8;

    // --- Hàm tiện ích hợp đồng ---
    function getContractTypeLabel(type) {
        const map = { definite: 'Có thời hạn', indefinite: 'Không thời hạn', seasonal: 'Thời vụ', probation: 'Thử việc' };
        return map[type] || type;
    }

    function getContractStatusLabel(status) {
        const map = { active: 'Đang hiệu lực', expired: 'Hết hạn', terminated: 'Đã chấm dứt', pending: 'Chờ ký' };
        return map[status] || status;
    }

    function formatSalary(amount) {
        if (!amount) return '—';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    }

    function calcWorkDuration(startDate, endDateOrTerminate) {
        const start = new Date(startDate);
        const end = endDateOrTerminate ? new Date(endDateOrTerminate) : new Date();
        if (isNaN(start.getTime())) return '—';

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) { months--; days += 30; }
        if (months < 0) { years--; months += 12; }

        const parts = [];
        if (years > 0) parts.push(`${years} năm`);
        if (months > 0) parts.push(`${months} tháng`);
        if (parts.length === 0) parts.push(`${Math.max(days, 0)} ngày`);
        return parts.join(' ');
    }

    function nextContractId() {
        const ids = contracts.map(c => parseInt(c.id.replace(/\D/g, ''), 10));
        const maxId = Math.max(...ids, 0);
        return 'HD' + String(maxId + 1).padStart(3, '0');
    }

    function getFileIcon(type) {
        return type === 'pdf' ? 'picture_as_pdf' : 'description';
    }

    function getFilteredContracts() {
        const q = ctSearchQuery.toLowerCase().trim();
        if (!q) return [...contracts];
        return contracts.filter(c =>
            c.id.toLowerCase().includes(q) ||
            c.empId.toLowerCase().includes(q) ||
            c.empName.toLowerCase().includes(q) ||
            getContractTypeLabel(c.contractType).toLowerCase().includes(q) ||
            getContractStatusLabel(c.status).toLowerCase().includes(q)
        );
    }

    // --- Render chính hợp đồng ---
    function renderHopDongLaoDong() {
        breadcrumbCurrent.textContent = 'Hợp đồng lao động';
        pageBadge.textContent = 'Nhân sự';

        const filtered = getFilteredContracts();
        const totalPages = Math.ceil(filtered.length / ctPageSize);
        if (ctCurrentPage > totalPages && totalPages > 0) ctCurrentPage = totalPages;
        const startIdx = (ctCurrentPage - 1) * ctPageSize;
        const pageData = filtered.slice(startIdx, startIdx + ctPageSize);

        const totalActive = contracts.filter(c => c.status === 'active').length;
        const totalExpired = contracts.filter(c => c.status === 'expired').length;
        const totalTerminated = contracts.filter(c => c.status === 'terminated').length;
        const totalPending = contracts.filter(c => c.status === 'pending').length;

        let html = `
            <div class="employee-module">
                <div class="employee-toolbar">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('nhan-su')">
                        <span class="material-icons-outlined">arrow_back</span>
                        Quay lại
                    </button>
                    <div class="search-box">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="ctSearchInput" placeholder="Tìm theo số HĐ, tên NV, loại HĐ..." value="${ctSearchQuery}" oninput="window.erpApp.ctSearch(this.value)">
                    </div>
                    <button class="btn-add-employee" onclick="window.erpApp.openContractModal()">
                        <span class="material-icons-outlined">note_add</span>
                        Thêm hợp đồng
                    </button>
                </div>

                <div class="employee-stats">
                    <div class="stat-card">
                        <div class="stat-card-icon blue">
                            <span class="material-icons-outlined">description</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${contracts.length}</div>
                            <div class="stat-card-label">Tổng hợp đồng</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon green">
                            <span class="material-icons-outlined">check_circle</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalActive}</div>
                            <div class="stat-card-label">Đang hiệu lực</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon orange">
                            <span class="material-icons-outlined">timer_off</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalExpired}</div>
                            <div class="stat-card-label">Hết hạn</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon red">
                            <span class="material-icons-outlined">cancel</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${totalTerminated + totalPending}</div>
                            <div class="stat-card-label">Chấm dứt / Chờ ký</div>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-header-bar">
                        <div class="table-title">
                            <span class="material-icons-outlined">work_history</span>
                            Danh sách hợp đồng lao động
                        </div>
                        <div class="table-count">${filtered.length} kết quả</div>
                    </div>
                    <div class="table-scroll">
        `;

        if (filtered.length === 0) {
            html += `<div class="table-empty"><span class="material-icons-outlined">search_off</span><p>Không tìm thấy hợp đồng nào.</p></div>`;
        } else {
            html += `
                <table class="data-table">
                    <thead><tr>
                        <th>Số HĐLĐ</th>
                        <th>Nhân viên</th>
                        <th>Loại HĐ</th>
                        <th>Ngày bắt đầu</th>
                        <th>Thời gian làm việc</th>
                        <th>Mức lương</th>
                        <th>Trạng thái</th>
                        <th>File</th>
                        <th>Thao tác</th>
                    </tr></thead>
                    <tbody>
            `;

            pageData.forEach(ct => {
                const endRef = ct.terminateDate || ct.endDate || '';
                const duration = calcWorkDuration(ct.startDate, ct.status === 'terminated' ? ct.terminateDate : '');
                const hasFiles = ct.files && ct.files.length > 0;
                html += `
                    <tr>
                        <td class="td-id">${ct.id}</td>
                        <td>
                            <div class="td-name">
                                ${renderAvatarHtml(employees.find(e => e.id === ct.empId) || { id: ct.empId, name: ct.empName }, 32, 11)}
                                <div class="td-name-text">
                                    <span class="td-name-main">${ct.empName}</span>
                                    <span class="td-name-sub">${ct.empId}</span>
                                </div>
                            </div>
                        </td>
                        <td><span class="contract-type-chip ${ct.contractType}">${getContractTypeLabel(ct.contractType)}</span></td>
                        <td>${formatDate(ct.startDate)}</td>
                        <td><span class="duration-badge"><span class="material-icons-outlined">schedule</span>${duration}</span></td>
                        <td><span class="salary-text">${formatSalary(ct.salary)}</span></td>
                        <td><span class="contract-status ${ct.status}">${getContractStatusLabel(ct.status)}</span></td>
                        <td>
                            ${hasFiles ? `<span class="material-icons-outlined" style="font-size:18px;color:var(--primary);cursor:pointer" title="${ct.files.length} file" onclick="window.erpApp.viewContract('${ct.id}')">attach_file</span>` : '<span style="color:var(--text-muted);font-size:11px">—</span>'}
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view" title="Xem chi tiết" onclick="window.erpApp.viewContract('${ct.id}')">
                                    <span class="material-icons-outlined">visibility</span>
                                </button>
                                <button class="table-action-btn edit" title="Chỉnh sửa" onclick="window.erpApp.openContractModal('${ct.id}')">
                                    <span class="material-icons-outlined">edit</span>
                                </button>
                                <button class="table-action-btn delete" title="Xóa" onclick="window.erpApp.confirmDeleteContract('${ct.id}')">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
        }

        html += '</div>'; // table-scroll

        if (totalPages > 1) {
            html += `
                <div class="table-footer">
                    <span>Hiển thị ${startIdx + 1}–${Math.min(startIdx + ctPageSize, filtered.length)} / ${filtered.length} hợp đồng</span>
                    <div class="pagination">
                        <button class="pagination-btn" onclick="window.erpApp.ctGoPage(${ctCurrentPage - 1})" ${ctCurrentPage === 1 ? 'disabled' : ''}><span class="material-icons-outlined">chevron_left</span></button>`;
            for (let p = 1; p <= totalPages; p++) {
                html += `<button class="pagination-btn ${p === ctCurrentPage ? 'active' : ''}" onclick="window.erpApp.ctGoPage(${p})">${p}</button>`;
            }
            html += `
                        <button class="pagination-btn" onclick="window.erpApp.ctGoPage(${ctCurrentPage + 1})" ${ctCurrentPage === totalPages ? 'disabled' : ''}><span class="material-icons-outlined">chevron_right</span></button>
                    </div>
                </div>`;
        }

        html += '</div></div>';
        pageContent.innerHTML = html;

        const searchInput = document.getElementById('ctSearchInput');
        if (searchInput && ctSearchQuery) {
            searchInput.focus();
            searchInput.setSelectionRange(ctSearchQuery.length, ctSearchQuery.length);
        }
    }

    // --- Modal Thêm/Sửa Hợp đồng ---
    let tempContractFiles = [];

    function openContractModal(editId) {
        const isEdit = !!editId;
        const ct = isEdit ? contracts.find(c => c.id === editId) : null;
        tempContractFiles = isEdit ? [...(ct.files || [])] : [];

        const empOptions = employees.map(e =>
            `<option value="${e.id}" ${isEdit && ct.empId === e.id ? 'selected' : ''}>${e.id} - ${e.name}</option>`
        ).join('');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'ctModal';

        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>
                        <span class="material-icons-outlined">${isEdit ? 'edit' : 'note_add'}</span>
                        ${isEdit ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}
                    </h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeContractModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <form id="ctForm" class="modal-body" onsubmit="window.erpApp.saveContract(event)">
                    <input type="hidden" id="ctEditId" value="${isEdit ? ct.id : ''}">

                    <div class="form-section-title">Thông tin hợp đồng</div>
                    <div class="form-grid">
                        <div class="form-field full-width">
                            <label>Nhân viên <span class="required">*</span></label>
                            <select id="ctEmpId" required>
                                <option value="">-- Chọn nhân viên --</option>
                                ${empOptions}
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Loại hợp đồng <span class="required">*</span></label>
                            <select id="ctType" required>
                                <option value="">-- Chọn loại --</option>
                                <option value="indefinite" ${isEdit && ct.contractType === 'indefinite' ? 'selected' : ''}>Không thời hạn</option>
                                <option value="definite" ${isEdit && ct.contractType === 'definite' ? 'selected' : ''}>Có thời hạn</option>
                                <option value="seasonal" ${isEdit && ct.contractType === 'seasonal' ? 'selected' : ''}>Thời vụ</option>
                                <option value="probation" ${isEdit && ct.contractType === 'probation' ? 'selected' : ''}>Thử việc</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Trạng thái <span class="required">*</span></label>
                            <select id="ctStatus" required>
                                <option value="">-- Chọn --</option>
                                <option value="active" ${isEdit && ct.status === 'active' ? 'selected' : ''}>Đang hiệu lực</option>
                                <option value="expired" ${isEdit && ct.status === 'expired' ? 'selected' : ''}>Hết hạn</option>
                                <option value="terminated" ${isEdit && ct.status === 'terminated' ? 'selected' : ''}>Đã chấm dứt</option>
                                <option value="pending" ${isEdit && ct.status === 'pending' ? 'selected' : ''}>Chờ ký</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Ngày bắt đầu <span class="required">*</span></label>
                            <input type="date" id="ctStartDate" value="${isEdit ? ct.startDate : ''}" required>
                        </div>
                        <div class="form-field">
                            <label>Ngày kết thúc</label>
                            <input type="date" id="ctEndDate" value="${isEdit ? ct.endDate : ''}">
                        </div>
                        <div class="form-field">
                            <label>Ngày nghỉ việc</label>
                            <input type="date" id="ctTerminateDate" value="${isEdit ? ct.terminateDate : ''}">
                        </div>
                        <div class="form-field">
                            <label>Mức lương (VNĐ) <span class="required">*</span></label>
                            <input type="number" id="ctSalary" placeholder="VD: 15000000" value="${isEdit ? ct.salary : ''}" min="0" required>
                        </div>
                        <div class="form-field full-width">
                            <label>Ghi chú</label>
                            <textarea id="ctNote" placeholder="Ghi chú thêm...">${isEdit ? ct.note : ''}</textarea>
                        </div>
                    </div>

                    <div class="form-section-title">File hợp đồng (PDF / Word)</div>
                    <div class="file-upload-area" onclick="document.getElementById('ctFileInput').click()">
                        <span class="material-icons-outlined upload-icon">cloud_upload</span>
                        <div class="upload-text">Kéo thả hoặc bấm để chọn file</div>
                        <div class="upload-hint">PDF, DOC, DOCX — Tối đa 10MB/file</div>
                    </div>
                    <input type="file" id="ctFileInput" accept=".pdf,.doc,.docx" multiple style="display:none" onchange="window.erpApp.handleContractFileUpload(event)">
                    <div class="file-list" id="ctFileList">
                        ${renderContractFileList(tempContractFiles, true)}
                    </div>
                </form>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeContractModal()">Hủy bỏ</button>
                    <button class="btn-save" onclick="document.getElementById('ctForm').requestSubmit()">
                        <span class="material-icons-outlined">save</span>
                        ${isEdit ? 'Cập nhật' : 'Lưu mới'}
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeContractModal();
        });

        document.body.appendChild(overlay);
    }

    function renderContractFileList(files, editable) {
        if (!files || files.length === 0) return '';
        return files.map((f, i) => `
            <div class="file-item">
                <div class="file-item-icon ${f.type || 'pdf'}">
                    <span class="material-icons-outlined">${getFileIcon(f.type || 'pdf')}</span>
                </div>
                <div class="file-item-info">
                    <div class="file-item-name">${f.name}</div>
                    <div class="file-item-size">${f.size || ''}</div>
                </div>
                <div class="file-item-actions">
                    ${f.dataUrl ? `<button title="Xem file" onclick="window.erpApp.previewContractFile(${i})"><span class="material-icons-outlined">open_in_new</span></button>` : ''}
                    ${editable ? `<button class="delete-file" title="Xóa file" onclick="window.erpApp.removeContractFile(${i})"><span class="material-icons-outlined">delete</span></button>` : ''}
                </div>
            </div>
        `).join('');
    }

    function closeContractModal() {
        const modal = document.getElementById('ctModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    function saveContract(e) {
        e.preventDefault();

        const editId = document.getElementById('ctEditId').value;
        const empIdVal = document.getElementById('ctEmpId').value;
        const emp = employees.find(e => e.id === empIdVal);

        const data = {
            empId: empIdVal,
            empName: emp ? emp.name : empIdVal,
            contractType: document.getElementById('ctType').value,
            status: document.getElementById('ctStatus').value,
            startDate: document.getElementById('ctStartDate').value,
            endDate: document.getElementById('ctEndDate').value,
            terminateDate: document.getElementById('ctTerminateDate').value,
            salary: parseInt(document.getElementById('ctSalary').value) || 0,
            note: document.getElementById('ctNote').value.trim(),
            files: [...tempContractFiles]
        };

        if (editId) {
            const idx = contracts.findIndex(c => c.id === editId);
            if (idx !== -1) {
                contracts[idx] = { ...contracts[idx], ...data };
                if (window.CrudSync) window.CrudSync.saveItem('contracts', contracts[idx], 'id');
            }
            showToast(`Đã cập nhật hợp đồng: ${editId}`);
        } else {
            const newCt = { id: nextContractId(), ...data };
            contracts.push(newCt);
            if (window.CrudSync) window.CrudSync.saveItem('contracts', newCt, 'id');
            showToast(`Đã thêm hợp đồng mới cho: ${data.empName}`);
        }

        closeContractModal();
        renderHopDongLaoDong();
    }

    // --- Xem chi tiết hợp đồng ---
    function viewContract(id) {
        const ct = contracts.find(c => c.id === id);
        if (!ct) return;

        const endRef = ct.terminateDate || ct.endDate || '';
        const duration = calcWorkDuration(ct.startDate, ct.status === 'terminated' ? ct.terminateDate : '');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'ctViewModal';

        overlay.innerHTML = `
            <div class="modal-content" style="max-width:580px">
                <div class="modal-header">
                    <h2><span class="material-icons-outlined">work_history</span> Chi tiết hợp đồng</h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeCtViewModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contract-detail-header">
                        <div class="contract-icon-box ${ct.status}">
                            <span class="material-icons-outlined">description</span>
                        </div>
                        <div class="contract-meta">
                            <div class="contract-number">${ct.id}</div>
                            <div class="contract-emp-name">${ct.empName} (${ct.empId})</div>
                        </div>
                        <span class="contract-status ${ct.status}">${getContractStatusLabel(ct.status)}</span>
                    </div>

                    <div class="salary-highlight">
                        <span class="material-icons-outlined">payments</span>
                        <div>
                            <div class="salary-highlight-label">Mức lương</div>
                            <div class="salary-highlight-value">${formatSalary(ct.salary)}</div>
                        </div>
                    </div>

                    <div class="detail-section-title">
                        <span class="material-icons-outlined">info</span>
                        Thông tin hợp đồng
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Loại hợp đồng</span>
                            <span class="detail-value"><span class="contract-type-chip ${ct.contractType}">${getContractTypeLabel(ct.contractType)}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày bắt đầu</span>
                            <span class="detail-value">${formatDate(ct.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày kết thúc</span>
                            <span class="detail-value">${ct.endDate ? formatDate(ct.endDate) : 'Không thời hạn'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày nghỉ việc</span>
                            <span class="detail-value">${ct.terminateDate ? formatDate(ct.terminateDate) : '—'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="detail-label">Tổng thời gian đã làm</span>
                            <span class="detail-value"><span class="duration-badge"><span class="material-icons-outlined">schedule</span>${duration}</span></span>
                        </div>
                        ${ct.note ? `<div class="detail-item full-width"><span class="detail-label">Ghi chú</span><span class="detail-value">${ct.note}</span></div>` : ''}
                    </div>

                    ${ct.files && ct.files.length > 0 ? `
                    <div class="detail-section-title">
                        <span class="material-icons-outlined">attach_file</span>
                        File đính kèm (${ct.files.length})
                    </div>
                    <div class="file-list">
                        ${ct.files.map((f, i) => `
                            <div class="file-item">
                                <div class="file-item-icon ${f.type || 'pdf'}">
                                    <span class="material-icons-outlined">${getFileIcon(f.type || 'pdf')}</span>
                                </div>
                                <div class="file-item-info">
                                    <div class="file-item-name">${f.name}</div>
                                    <div class="file-item-size">${f.size || ''}</div>
                                </div>
                                <div class="file-item-actions">
                                    ${f.dataUrl ? `<button title="Xem file" onclick="window.erpApp.previewContractFile(${i}, '${ct.id}')"><span class="material-icons-outlined">open_in_new</span></button>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeCtViewModal()">Đóng</button>
                    <button class="btn-save" onclick="window.erpApp.closeCtViewModal(); window.erpApp.openContractModal('${ct.id}')">
                        <span class="material-icons-outlined">edit</span>
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { overlay.classList.add('closing'); setTimeout(() => overlay.remove(), 200); }
        });
        document.body.appendChild(overlay);
    }

    function closeCtViewModal() {
        const modal = document.getElementById('ctViewModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    // --- Xóa hợp đồng ---
    function confirmDeleteContract(id) {
        const ct = contracts.find(c => c.id === id);
        if (!ct) return;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'ctConfirmModal';

        overlay.innerHTML = `
            <div class="modal-content confirm-dialog">
                <div class="confirm-icon"><span class="material-icons-outlined">warning</span></div>
                <h3>Xóa hợp đồng?</h3>
                <p>Bạn có chắc chắn muốn xóa hợp đồng <span class="confirm-name">${ct.id}</span> của ${ct.empName}? Hành động này không thể hoàn tác.</p>
                <div class="confirm-actions">
                    <button class="btn-cancel" onclick="window.erpApp.closeCtConfirmModal()">Hủy bỏ</button>
                    <button class="btn-confirm-delete" onclick="window.erpApp.deleteContract('${ct.id}')">
                        <span class="material-icons-outlined">delete</span>
                        Xóa hợp đồng
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { overlay.classList.add('closing'); setTimeout(() => overlay.remove(), 200); }
        });
        document.body.appendChild(overlay);
    }

    function deleteContract(id) {
        const ct = contracts.find(c => c.id === id);
        contracts = contracts.filter(c => c.id !== id);
        if (window.CrudSync) window.CrudSync.deleteItem('contracts', id);
        closeCtConfirmModal();
        renderHopDongLaoDong();
        showToast(`Đã xóa hợp đồng: ${ct ? ct.id : id}`);
    }

    function closeCtConfirmModal() {
        const modal = document.getElementById('ctConfirmModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    // ==========================================
    // MODULE: Bảng chấm công (Calendar)
    // ==========================================

    let attCurrentMonth = new Date().getMonth();
    let attCurrentYear = new Date().getFullYear();
    let attSelectedEmpId = 'NV001';

    // Trạng thái: full, half, absent, late, leave, weekend (auto)
    // Tạo mock data cho mỗi nhân viên
    const attendanceData = {};

    function generateAttendanceForEmp(empId) {
        if (attendanceData[empId]) return;
        attendanceData[empId] = {};

        // Tạo dữ liệu cho 12 tháng gần nhất
        const now = new Date();
        for (let m = 0; m < 12; m++) {
            const year = now.getFullYear();
            const month = now.getMonth() - m;
            const dt = new Date(year, month, 1);
            const y = dt.getFullYear();
            const mo = dt.getMonth();
            const daysInMonth = new Date(y, mo + 1, 0).getDate();
            const key = `${y}-${String(mo + 1).padStart(2, '0')}`;
            attendanceData[empId][key] = {};

            for (let d = 1; d <= daysInMonth; d++) {
                const dayOfWeek = new Date(y, mo, d).getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) continue; // weekend

                const today = new Date();
                const thisDay = new Date(y, mo, d);
                if (thisDay > today) continue; // tương lai

                const rand = Math.random();
                let status, ot = 0, note = '';
                if (rand < 0.55) { status = 'full'; }
                else if (rand < 0.7) { status = 'half'; ot = [1.5, 2, 3][Math.floor(Math.random() * 3)]; note = `${ot}h(x1.5)`; }
                else if (rand < 0.8) { status = 'late'; ot = [0, 1, 2][Math.floor(Math.random() * 3)]; }
                else if (rand < 0.88) { status = 'absent'; }
                else if (rand < 0.95) { status = 'leave'; note = 'Nghỉ phép'; }
                else { status = 'half'; ot = [2, 3, 5][Math.floor(Math.random() * 3)]; note = `${ot}h(x2)`; }

                attendanceData[empId][key][d] = { status, ot, note };
            }
        }
    }

    // Init cho tất cả nhân viên
    employees.forEach(e => generateAttendanceForEmp(e.id));

    function getAttendanceStats(empId, year, month) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        const data = (attendanceData[empId] && attendanceData[empId][key]) || {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let full = 0, half = 0, absent = 0, late = 0, leave = 0, totalOt = 0, workingDays = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            const dow = new Date(year, month, d).getDay();
            if (dow === 0 || dow === 6) continue;
            workingDays++;

            const rec = data[d];
            if (!rec) continue;
            if (rec.status === 'full') full++;
            else if (rec.status === 'half') half++;
            else if (rec.status === 'absent') absent++;
            else if (rec.status === 'late') late++;
            else if (rec.status === 'leave') leave++;
            totalOt += rec.ot || 0;
        }

        const attended = full + half;
        const pct = workingDays > 0 ? Math.round((attended / workingDays) * 100) : 0;

        return { full, half, absent, late, leave, totalOt, workingDays, attended, pct, daysInMonth };
    }

    function getAttStatusIcon(status) {
        const map = { full: 'check', half: 'check', absent: 'close', late: 'schedule', leave: 'event_busy' };
        return map[status] || '';
    }

    function renderChamCong() {
        breadcrumbCurrent.textContent = 'Bảng chấm công';
        pageBadge.textContent = 'Nhân sự';

        const emp = employees.find(e => e.id === attSelectedEmpId) || employees[0];
        if (!emp) return;
        generateAttendanceForEmp(emp.id);

        const stats = getAttendanceStats(emp.id, attCurrentYear, attCurrentMonth);
        const monthNames = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];

        // Avatar HTML
        const initials = getInitials(emp.name);
        const color = getAvatarColor(emp.id);
        const avatarHtml = emp.avatar
            ? `<div class="att-emp-avatar"><img src="${emp.avatar}" alt="${emp.name}"></div>`
            : `<div class="att-emp-avatar" style="background:${color}">${initials}</div>`;

        // Employee options
        const empOptions = employees.map(e =>
            `<option value="${e.id}" ${e.id === emp.id ? 'selected' : ''}>${e.name} (${e.department})</option>`
        ).join('');

        // Calendar cells
        const calendarHtml = buildCalendarGrid(emp.id, attCurrentYear, attCurrentMonth);

        let html = `
            <div class="attendance-module">
                <div class="employee-toolbar">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('nhan-su')">
                        <span class="material-icons-outlined">arrow_back</span>
                        Quay lại
                    </button>
                    <div style="flex:1"></div>
                </div>

                <div class="attendance-layout">
                    <!-- Sidebar trái -->
                    <div class="att-sidebar">
                        <div class="att-month-nav">
                            <button onclick="window.erpApp.attPrevMonth()">
                                <span class="material-icons-outlined">chevron_left</span>
                            </button>
                            <span class="att-month-label">${monthNames[attCurrentMonth]} năm ${attCurrentYear}</span>
                            <button onclick="window.erpApp.attNextMonth()">
                                <span class="material-icons-outlined">chevron_right</span>
                            </button>
                        </div>

                        <div class="att-emp-selector">
                            <select onchange="window.erpApp.attSelectEmp(this.value)">
                                ${empOptions}
                            </select>
                        </div>

                        <div class="att-emp-card">
                            ${avatarHtml}
                            <div class="att-emp-name">${emp.name}</div>
                            <div class="att-emp-dept">${emp.department}</div>
                            <div class="att-emp-stats">
                                <div class="att-stat-row green">
                                    <span class="material-icons-outlined">event_available</span>
                                    Ngày công: <strong>${stats.attended}/${stats.workingDays} ngày</strong>
                                </div>
                                <div class="att-stat-row orange">
                                    <span class="material-icons-outlined">more_time</span>
                                    Giờ tăng ca: <strong>${stats.totalOt}h</strong>
                                </div>
                            </div>
                            <div class="att-stat-pct">
                                <span class="material-icons-outlined">percent</span>
                                ${stats.pct}%
                                <span class="att-stat-pct-label">điểm danh</span>
                            </div>
                        </div>

                        <div class="att-legend">
                            <div class="att-legend-item"><span class="att-legend-dot full"></span> Đủ công (${stats.full})</div>
                            <div class="att-legend-item"><span class="att-legend-dot half"></span> Nửa công (${stats.half})</div>
                            <div class="att-legend-item"><span class="att-legend-dot absent"></span> Vắng mặt (${stats.absent})</div>
                            <div class="att-legend-item"><span class="att-legend-dot late"></span> Đi muộn (${stats.late})</div>
                            <div class="att-legend-item"><span class="att-legend-dot leave"></span> Nghỉ phép (${stats.leave})</div>
                            <div class="att-legend-item"><span class="att-legend-dot weekend"></span> Cuối tuần</div>
                        </div>
                    </div>

                    <!-- Calendar -->
                    <div class="att-calendar">
                        <div class="att-cal-header">
                            <div class="att-cal-header-cell">T2</div>
                            <div class="att-cal-header-cell">T3</div>
                            <div class="att-cal-header-cell">T4</div>
                            <div class="att-cal-header-cell">T5</div>
                            <div class="att-cal-header-cell">T6</div>
                            <div class="att-cal-header-cell">T7</div>
                            <div class="att-cal-header-cell sunday">CN</div>
                        </div>
                        <div class="att-cal-grid">
                            ${calendarHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        pageContent.innerHTML = html;
    }

    function buildCalendarGrid(empId, year, month) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        const data = (attendanceData[empId] && attendanceData[empId][key]) || {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

        // Chuyển sang Mon=0 format: Mon=0, Tue=1... Sun=6
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        let html = '';

        // Ngày tháng trước
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            html += `<div class="att-cal-cell other-month"><span class="day-num">${prevMonthDays - i}</span></div>`;
        }

        // Ngày trong tháng
        for (let d = 1; d <= daysInMonth; d++) {
            const dow = new Date(year, month, d).getDay();
            const isSun = dow === 0;
            const isSat = dow === 6;
            const isToday = isCurrentMonth && d === today.getDate();
            const rec = data[d];

            let cellClass = 'att-cal-cell';
            let content = `<span class="day-num">${d}</span>`;

            if (isSat || isSun) {
                cellClass += ' weekend';
                if (isSun) cellClass += ' sunday';
            } else if (rec) {
                cellClass += ` ${rec.status}`;
                const iconName = getAttStatusIcon(rec.status);
                if (iconName) content += `<span class="day-icon material-icons-outlined">${iconName}</span>`;
                if (rec.note) content += `<span class="day-label">${rec.note}</span>`;
                else if (rec.ot > 0) content += `<span class="day-label">${rec.ot}h OT</span>`;
            } else {
                // Ngày chưa qua = không ghi nhận
                const thisDay = new Date(year, month, d);
                if (thisDay <= today) {
                    cellClass += ' no-record';
                }
            }

            if (isToday) cellClass += ' today';

            // Click để chỉnh sửa
            const clickable = !(isSat || isSun);
            const onclick = clickable ? `onclick="window.erpApp.editAttendance(${d})"` : '';

            html += `<div class="${cellClass}" ${onclick} title="${d}/${month + 1}/${year}" style="${clickable ? 'cursor:pointer' : ''}">${content}</div>`;
        }

        // Ngày tháng sau
        const totalCells = startOffset + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="att-cal-cell other-month"><span class="day-num">${i}</span></div>`;
        }

        return html;
    }

    // --- Modal chỉnh sửa chấm công ---
    function editAttendance(day) {
        const emp = employees.find(e => e.id === attSelectedEmpId);
        if (!emp) return;

        const key = `${attCurrentYear}-${String(attCurrentMonth + 1).padStart(2, '0')}`;
        if (!attendanceData[emp.id]) attendanceData[emp.id] = {};
        if (!attendanceData[emp.id][key]) attendanceData[emp.id][key] = {};

        const rec = attendanceData[emp.id][key][day] || { status: '', ot: 0, note: '' };
        const dateStr = `${day}/${attCurrentMonth + 1}/${attCurrentYear}`;

        const statuses = [
            { val: 'full', label: 'Đủ công', dot: 'full' },
            { val: 'half', label: 'Nửa công', dot: 'half' },
            { val: 'absent', label: 'Vắng mặt', dot: 'absent' },
            { val: 'late', label: 'Đi muộn', dot: 'late' },
            { val: 'leave', label: 'Nghỉ phép', dot: 'leave' },
            { val: '', label: 'Xóa chấm công', dot: 'weekend' }
        ];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'attEditModal';

        overlay.innerHTML = `
            <div class="modal-content" style="max-width:440px">
                <div class="modal-header">
                    <h2>
                        <span class="material-icons-outlined">edit_calendar</span>
                        Chấm công: ${dateStr}
                    </h2>
                    <button class="modal-close-btn" onclick="window.erpApp.closeAttEditModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">
                        <strong>${emp.name}</strong> · ${emp.department}
                    </div>

                    <label style="font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Trạng thái</label>
                    <div class="att-edit-status-grid">
                        ${statuses.map(s => `
                            <div class="att-status-option ${rec.status === s.val ? 'selected' : ''}" onclick="window.erpApp.attSelectStatus(this, '${s.val}')">
                                <span class="att-legend-dot ${s.dot}"></span>
                                ${s.label}
                            </div>
                        `).join('')}
                    </div>

                    <div class="form-grid" style="margin-top:10px">
                        <div class="form-field">
                            <label>Giờ tăng ca (OT)</label>
                            <input type="number" id="attOtHours" value="${rec.ot || 0}" min="0" max="12" step="0.5" placeholder="0">
                        </div>
                        <div class="form-field">
                            <label>Ghi chú</label>
                            <input type="text" id="attNote" value="${rec.note || ''}" placeholder="VD: 3h(x1.5)">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeAttEditModal()">Hủy</button>
                    <button class="btn-save" onclick="window.erpApp.saveAttendance(${day})">
                        <span class="material-icons-outlined">save</span>
                        Lưu
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { overlay.classList.add('closing'); setTimeout(() => overlay.remove(), 200); }
        });

        document.body.appendChild(overlay);
    }

    let attSelectedStatus = '';

    function closeAttEditModal() {
        const modal = document.getElementById('attEditModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    // ==========================================
    // GENERIC MODULE DASHBOARD ENGINE
    // ==========================================

    /*
      Config structure:
      {
        title: 'Module Name',       breadcrumb: 'Module',
        badge: 'Category',          backPage: 'page-slug',
        stats: [ { icon, color, value, label } ],
        table: { title, icon, cols: ['Col1','Col2',...], rows: [['v1','v2',...], ...], badgeCols: { colIdx: { 'value': 'colorClass' } }  },
        chart: { title, icon, bars: [ { label, value, maxValue, color } ] },
        progress: { title, icon, items: [ { label, value, pct, color } ] },
        timeline: { title, icon, items: [ { dot, icon, title, desc, time } ] },
        infoCards: { title, icon, items: [ { icon, bg, color, title, desc, badge, badgeColor } ] }
      }
    */

    function renderGenericModule(cfg) {
        breadcrumbCurrent.textContent = cfg.title;
        pageBadge.textContent = cfg.badge || cfg.title;

        let html = `<div class="gm-module">
            <div class="employee-toolbar">
                <button class="back-btn" onclick="window.erpApp.navigateTo('${cfg.backPage || 'trang-chu'}')">
                    <span class="material-icons-outlined">arrow_back</span> Quay lại
                </button>
                <div style="flex:1"></div>
            </div>`;

        // --- Stat Cards ---
        if (cfg.stats && cfg.stats.length) {
            html += '<div class="employee-stats">';
            cfg.stats.forEach(s => {
                html += `<div class="stat-card">
                    <div class="stat-card-icon ${s.color}"><span class="material-icons-outlined">${s.icon}</span></div>
                    <div class="stat-card-body">
                        <div class="stat-card-value">${s.value}</div>
                        <div class="stat-card-label">${s.label}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }

        // --- Two column layout: Table + Chart/Progress ---
        const hasTable = cfg.table;
        const hasChart = cfg.chart;
        const hasProgress = cfg.progress;
        const hasRight = hasChart || hasProgress;

        if (hasTable || hasRight) {
            if (hasTable && hasRight) {
                html += '<div class="gm-two-col gm-section">';
            } else {
                html += '<div class="gm-section">';
            }

            // Table panel
            if (hasTable) {
                const t = cfg.table;
                html += `<div class="gm-panel">
                    <div class="gm-panel-title"><span class="material-icons-outlined">${t.icon || 'table_chart'}</span>${t.title}</div>
                    <table class="gm-mini-table"><thead><tr>`;
                t.cols.forEach(c => html += `<th>${c}</th>`);
                html += '</tr></thead><tbody>';
                t.rows.forEach(row => {
                    html += '<tr>';
                    row.forEach((cell, ci) => {
                        if (t.badgeCols && t.badgeCols[ci]) {
                            const color = t.badgeCols[ci][cell] || t.badgeCols[ci]['_default'] || 'gray';
                            html += `<td><span class="gm-badge ${color}">${cell}</span></td>`;
                        } else {
                            html += `<td>${cell}</td>`;
                        }
                    });
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
            }

            // Chart or Progress panel
            if (hasChart) {
                const c = cfg.chart;
                const maxVal = Math.max(...c.bars.map(b => b.value));
                html += `<div class="gm-panel">
                    <div class="gm-panel-title"><span class="material-icons-outlined">${c.icon || 'bar_chart'}</span>${c.title}</div>
                    <div class="gm-bar-chart">`;
                c.bars.forEach(b => {
                    const pct = maxVal > 0 ? (b.value / maxVal) * 100 : 0;
                    html += `<div class="gm-bar">
                        <span class="gm-bar-val">${b.value}</span>
                        <div class="gm-bar-fill" style="height:${pct}%;background:${b.color || 'var(--primary)'}"></div>
                        <span class="gm-bar-label">${b.label}</span>
                    </div>`;
                });
                html += '</div></div>';
            } else if (hasProgress) {
                const p = cfg.progress;
                html += `<div class="gm-panel">
                    <div class="gm-panel-title"><span class="material-icons-outlined">${p.icon || 'donut_large'}</span>${p.title}</div>
                    <div class="gm-progress-list">`;
                p.items.forEach(item => {
                    html += `<div class="gm-progress-item">
                        <div class="gm-progress-header"><span>${item.label}</span><span class="value">${item.value}</span></div>
                        <div class="gm-progress-track"><div class="gm-progress-fill" style="width:${item.pct}%;background:${item.color || 'var(--primary)'}"></div></div>
                    </div>`;
                });
                html += '</div></div>';
            }

            html += '</div>'; // close two-col or section
        }

        // --- Timeline ---
        if (cfg.timeline) {
            const tl = cfg.timeline;
            html += `<div class="gm-section">
                <div class="gm-section-title"><span class="material-icons-outlined">${tl.icon || 'history'}</span>${tl.title}</div>
                <div class="gm-panel"><div class="gm-timeline">`;
            tl.items.forEach(item => {
                html += `<div class="gm-timeline-item">
                    <div class="gm-timeline-dot ${item.dot}"><span class="material-icons-outlined">${item.icon}</span></div>
                    <div class="gm-timeline-content">
                        <div class="gm-timeline-title">${item.title}</div>
                        <div class="gm-timeline-desc">${item.desc}</div>
                        <div class="gm-timeline-time"><span class="material-icons-outlined">schedule</span>${item.time}</div>
                    </div>
                </div>`;
            });
            html += '</div></div></div>';
        }

        // --- Info Cards ---
        if (cfg.infoCards) {
            const ic = cfg.infoCards;
            html += `<div class="gm-section">
                <div class="gm-section-title"><span class="material-icons-outlined">${ic.icon || 'widgets'}</span>${ic.title}</div>
                <div class="gm-info-grid">`;
            ic.items.forEach(item => {
                html += `<div class="gm-info-card">
                    <div class="gm-info-card-icon" style="background:${item.bg}">
                        <span class="material-icons-outlined" style="color:${item.color}">${item.icon}</span>
                    </div>
                    <div class="gm-info-card-body">
                        <div class="gm-info-card-title">${item.title}</div>
                        <div class="gm-info-card-desc">${item.desc}</div>
                        ${item.badge ? `<span class="gm-info-card-badge gm-badge ${item.badgeColor || 'green'}">${item.badge}</span>` : ''}
                    </div>
                </div>`;
            });
            html += '</div></div>';
        }

        html += '</div>'; // close gm-module
        pageContent.innerHTML = html;
    }

    // ==========================================
    // MODULE: Lưu trữ hồ sơ (CRUD đầy đủ)
    // ==========================================

    let hoSoDocuments = [
        { id: 'HS-001', title: 'Hợp đồng cung cấp vật liệu xây dựng', category: 'hop-dong', supplier: 'Công ty TNHH Vật liệu Hoàng Phát', customer: 'VIETBACHCORP', value: 2500000000, issueDate: '2026-01-15', status: 'active', note: 'HĐ cung ứng quý 1-2/2026', files: [{ name: 'HD_VatLieu_HoangPhat.pdf', size: '2.1 MB', type: 'pdf' }] },
        { id: 'HS-002', title: 'Hợp đồng thi công dự án Sunrise Tower', category: 'hop-dong', supplier: 'VIETBACHCORP', customer: 'Tập đoàn Sunrise Holdings', value: 15800000000, issueDate: '2025-11-20', status: 'active', note: 'Dự án thi công 18 tháng', files: [{ name: 'HD_ThiCong_SunriseTower.pdf', size: '5.4 MB', type: 'pdf' }] },
        { id: 'HS-003', title: 'Hợp đồng thuê máy móc thiết bị', category: 'hop-dong', supplier: 'CT CP Thiết bị Đại Phong', customer: 'VIETBACHCORP', value: 890000000, issueDate: '2026-02-10', status: 'active', note: 'Thuê cẩu tháp + xe nâng', files: [] },
        { id: 'HS-004', title: 'Phụ lục 01 - Bổ sung hạng mục Sunrise Tower', category: 'phu-luc', supplier: 'VIETBACHCORP', customer: 'Tập đoàn Sunrise Holdings', value: 3200000000, issueDate: '2026-02-28', status: 'active', note: 'Phụ lục bổ sung tầng hầm B3', files: [{ name: 'PL01_SunriseTower.docx', size: '1.8 MB', type: 'doc' }] },
        { id: 'HS-005', title: 'Phụ lục 02 - Điều chỉnh đơn giá vật liệu', category: 'phu-luc', supplier: 'Công ty TNHH Vật liệu Hoàng Phát', customer: 'VIETBACHCORP', value: 450000000, issueDate: '2026-03-10', status: 'active', note: 'Điều chỉnh giá thép theo thị trường', files: [{ name: 'PL02_DieuChinhDonGia.pdf', size: '960 KB', type: 'pdf' }] },
        { id: 'HS-006', title: 'Phụ lục gia hạn HĐ thuê thiết bị', category: 'phu-luc', supplier: 'CT CP Thiết bị Đại Phong', customer: 'VIETBACHCORP', value: 0, issueDate: '2026-03-25', status: 'pending', note: 'Gia hạn thêm 3 tháng', files: [] },
        { id: 'HS-007', title: 'Quyết toán công trình Green Valley', category: 'quyet-toan', supplier: 'VIETBACHCORP', customer: 'CT TNHH BĐS Green Valley', value: 8900000000, issueDate: '2026-01-08', status: 'completed', note: 'Quyết toán hoàn công giai đoạn 1', files: [{ name: 'QT_GreenValley_GD1.pdf', size: '12.5 MB', type: 'pdf' }] },
        { id: 'HS-008', title: 'Quyết toán cung cấp bê tông Q4/2025', category: 'quyet-toan', supplier: 'Nhà máy bê tông Phú Mỹ', customer: 'VIETBACHCORP', value: 1750000000, issueDate: '2026-02-05', status: 'completed', note: 'Qt nợ gốc + lãi chậm trả', files: [{ name: 'QT_BeTong_Q4.pdf', size: '3.2 MB', type: 'pdf' }, { name: 'QT_BeTong_ChiTiet.xlsx', size: '890 KB', type: 'doc' }] },
        { id: 'HS-009', title: 'Quyết toán thiết bị PCCC tòa nhà AB', category: 'quyet-toan', supplier: 'CT PCCC Việt An', customer: 'VIETBACHCORP', value: 620000000, issueDate: '2026-03-18', status: 'pending', note: 'Chờ nghiệm thu cuối cùng', files: [] },
        { id: 'HS-010', title: 'Thanh lý HĐ thuê văn phòng 78 Lý Thường Kiệt', category: 'thanh-ly', supplier: 'CT TNHH TM DV Minh Quang', customer: 'VIETBACHCORP', value: 360000000, issueDate: '2025-12-30', status: 'completed', note: 'Kết thúc thuê, hoàn trả cọc', files: [{ name: 'TL_ThueVP_LyThuongKiet.pdf', size: '1.4 MB', type: 'pdf' }] },
        { id: 'HS-011', title: 'Thanh lý hợp đồng thầu phụ DA Metro', category: 'thanh-ly', supplier: 'CT XD Thành Đạt', customer: 'VIETBACHCORP', value: 4500000000, issueDate: '2026-01-22', status: 'completed', note: 'Chấm dứt do tiến độ chậm', files: [{ name: 'TL_ThauPhu_Metro.pdf', size: '2.8 MB', type: 'pdf' }, { name: 'TL_BienBan_NghiemThu.docx', size: '1.1 MB', type: 'doc' }] },
        { id: 'HS-012', title: 'Thanh lý HĐ cung ứng nhân công 2025', category: 'thanh-ly', supplier: 'CT Nhân lực Phương Nam', customer: 'VIETBACHCORP', value: 980000000, issueDate: '2026-03-01', status: 'pending', note: 'Chờ quyết toán công nợ cuối', files: [] },
    ];

    let hsSearchQuery = '';
    let hsCurrentPage = 1;
    let hsActiveTab = 'all'; // 'all', 'hop-dong', 'phu-luc', 'quyet-toan', 'thanh-ly'
    const hsPageSize = 8;
    let tempHsFiles = [];

    function getCategoryLabel(cat) {
        const map = { 'hop-dong': 'Hợp đồng', 'phu-luc': 'Phụ lục HĐ', 'quyet-toan': 'Quyết toán', 'thanh-ly': 'Thanh lý HĐ' };
        return map[cat] || cat;
    }
    function getCategoryColor(cat) {
        const map = { 'hop-dong': 'blue', 'phu-luc': 'purple', 'quyet-toan': 'teal', 'thanh-ly': 'orange' };
        return map[cat] || 'gray';
    }
    function getCategoryIcon(cat) {
        const map = { 'hop-dong': 'description', 'phu-luc': 'post_add', 'quyet-toan': 'receipt_long', 'thanh-ly': 'assignment_turned_in' };
        return map[cat] || 'folder';
    }
    function getHsStatusLabel(status) {
        const map = { active: 'Đang hiệu lực', completed: 'Hoàn thành', pending: 'Chờ xử lý', expired: 'Hết hạn', cancelled: 'Đã hủy' };
        return map[status] || status;
    }
    function getHsStatusColor(status) {
        const map = { active: 'green', completed: 'blue', pending: 'orange', expired: 'red', cancelled: 'gray' };
        return map[status] || 'gray';
    }
    function formatCurrency(amount) {
        if (!amount) return '—';
        if (amount >= 1000000000) return (amount / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
        if (amount >= 1000000) return (amount / 1000000).toFixed(0) + ' triệu';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    }
    function formatCurrencyFull(amount) {
        if (!amount) return '—';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    }
    function nextHsId() {
        const ids = hoSoDocuments.map(d => parseInt(d.id.replace(/\D/g, ''), 10));
        return 'HS-' + String(Math.max(...ids, 0) + 1).padStart(3, '0');
    }

    function getFilteredHoSo() {
        let data = [...hoSoDocuments];
        if (hsActiveTab !== 'all') data = data.filter(d => d.category === hsActiveTab);
        const q = hsSearchQuery.toLowerCase().trim();
        if (q) {
            data = data.filter(d =>
                d.id.toLowerCase().includes(q) ||
                d.title.toLowerCase().includes(q) ||
                d.supplier.toLowerCase().includes(q) ||
                d.customer.toLowerCase().includes(q) ||
                getCategoryLabel(d.category).toLowerCase().includes(q)
            );
        }
        return data;
    }

    // --- Render chính Lưu trữ hồ sơ ---
    function renderLuuTruHoSo() {
        breadcrumbCurrent.textContent = 'Lưu trữ hồ sơ';
        pageBadge.textContent = 'Hành chính';

        const filtered = getFilteredHoSo();
        const totalPages = Math.ceil(filtered.length / hsPageSize);
        if (hsCurrentPage > totalPages && totalPages > 0) hsCurrentPage = totalPages;
        const startIdx = (hsCurrentPage - 1) * hsPageSize;
        const pageData = filtered.slice(startIdx, startIdx + hsPageSize);

        const countAll = hoSoDocuments.length;
        const countHD = hoSoDocuments.filter(d => d.category === 'hop-dong').length;
        const countPL = hoSoDocuments.filter(d => d.category === 'phu-luc').length;
        const countQT = hoSoDocuments.filter(d => d.category === 'quyet-toan').length;
        const countTL = hoSoDocuments.filter(d => d.category === 'thanh-ly').length;

        let html = `
            <div class="employee-module">
                <div class="employee-toolbar">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')">
                        <span class="material-icons-outlined">arrow_back</span>
                        Quay lại
                    </button>
                    <div class="search-box">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="hsSearchInput" placeholder="Tìm mã HS, tên, nhà cung cấp, khách hàng..." value="${hsSearchQuery}" oninput="window.erpApp.hsSearch(this.value)">
                    </div>
                    <button class="btn-add-employee" onclick="window.erpApp.openHsModal()">
                        <span class="material-icons-outlined">note_add</span>
                        Thêm hồ sơ
                    </button>
                </div>

                <div class="employee-stats">
                    <div class="stat-card" style="cursor:pointer;${hsActiveTab === 'hop-dong' ? 'outline:2px solid var(--primary)' : ''}" onclick="window.erpApp.hsSetTab('hop-dong')">
                        <div class="stat-card-icon blue">
                            <span class="material-icons-outlined">description</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${countHD}</div>
                            <div class="stat-card-label">Hợp đồng</div>
                        </div>
                    </div>
                    <div class="stat-card" style="cursor:pointer;${hsActiveTab === 'phu-luc' ? 'outline:2px solid var(--primary)' : ''}" onclick="window.erpApp.hsSetTab('phu-luc')">
                        <div class="stat-card-icon purple">
                            <span class="material-icons-outlined">post_add</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${countPL}</div>
                            <div class="stat-card-label">Phụ lục HĐ</div>
                        </div>
                    </div>
                    <div class="stat-card" style="cursor:pointer;${hsActiveTab === 'quyet-toan' ? 'outline:2px solid var(--primary)' : ''}" onclick="window.erpApp.hsSetTab('quyet-toan')">
                        <div class="stat-card-icon teal">
                            <span class="material-icons-outlined">receipt_long</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${countQT}</div>
                            <div class="stat-card-label">Quyết toán</div>
                        </div>
                    </div>
                    <div class="stat-card" style="cursor:pointer;${hsActiveTab === 'thanh-ly' ? 'outline:2px solid var(--primary)' : ''}" onclick="window.erpApp.hsSetTab('thanh-ly')">
                        <div class="stat-card-icon orange">
                            <span class="material-icons-outlined">assignment_turned_in</span>
                        </div>
                        <div class="stat-card-body">
                            <div class="stat-card-value">${countTL}</div>
                            <div class="stat-card-label">Thanh lý HĐ</div>
                        </div>
                    </div>
                </div>

                <div class="hs-tab-bar">
                    <button class="hs-tab ${hsActiveTab === 'all' ? 'active' : ''}" onclick="window.erpApp.hsSetTab('all')">Tất cả (${countAll})</button>
                    <button class="hs-tab ${hsActiveTab === 'hop-dong' ? 'active' : ''}" onclick="window.erpApp.hsSetTab('hop-dong')">Hợp đồng (${countHD})</button>
                    <button class="hs-tab ${hsActiveTab === 'phu-luc' ? 'active' : ''}" onclick="window.erpApp.hsSetTab('phu-luc')">Phụ lục (${countPL})</button>
                    <button class="hs-tab ${hsActiveTab === 'quyet-toan' ? 'active' : ''}" onclick="window.erpApp.hsSetTab('quyet-toan')">Quyết toán (${countQT})</button>
                    <button class="hs-tab ${hsActiveTab === 'thanh-ly' ? 'active' : ''}" onclick="window.erpApp.hsSetTab('thanh-ly')">Thanh lý (${countTL})</button>
                </div>

                <div class="table-container">
                    <div class="table-header-bar">
                        <div class="table-title">
                            <span class="material-icons-outlined">folder_shared</span>
                            Danh sách hồ sơ
                        </div>
                        <div class="table-count">${filtered.length} kết quả</div>
                    </div>
                    <div class="table-scroll">
        `;

        if (filtered.length === 0) {
            html += `<div class="table-empty"><span class="material-icons-outlined">search_off</span><p>Không tìm thấy hồ sơ nào.</p></div>`;
        } else {
            html += `
                <table class="data-table">
                    <thead><tr>
                        <th>Mã HS</th>
                        <th>Tên hồ sơ</th>
                        <th>Loại</th>
                        <th>Nhà cung cấp</th>
                        <th>Khách hàng</th>
                        <th>Giá trị</th>
                        <th>Ngày ban hành</th>
                        <th>Trạng thái</th>
                        <th>Tác vụ</th>
                    </tr></thead>
                    <tbody>
            `;

            pageData.forEach(doc => {
                const hasFiles = doc.files && doc.files.length > 0;
                html += `
                    <tr>
                        <td class="td-id">${doc.id}</td>
                        <td>
                            <div class="hs-title-cell">
                                <span class="material-icons-outlined hs-cat-icon ${getCategoryColor(doc.category)}">${getCategoryIcon(doc.category)}</span>
                                <span class="hs-title-text" title="${doc.title}">${doc.title}</span>
                            </div>
                        </td>
                        <td><span class="gm-badge ${getCategoryColor(doc.category)}">${getCategoryLabel(doc.category)}</span></td>
                        <td><span class="hs-partner-cell" title="${doc.supplier}"><span class="material-icons-outlined">business</span>${doc.supplier}</span></td>
                        <td><span class="hs-partner-cell" title="${doc.customer}"><span class="material-icons-outlined">person</span>${doc.customer}</span></td>
                        <td><span class="salary-text">${formatCurrency(doc.value)}</span></td>
                        <td>${formatDate(doc.issueDate)}</td>
                        <td><span class="gm-badge ${getHsStatusColor(doc.status)}">${getHsStatusLabel(doc.status)}</span></td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view" title="Xem chi tiết" onclick="window.erpApp.viewHoSo('${doc.id}')">
                                    <span class="material-icons-outlined">visibility</span>
                                </button>
                                <button class="table-action-btn edit" title="Upload file" onclick="window.erpApp.openHsUpload('${doc.id}')">
                                    <span class="material-icons-outlined">upload_file</span>
                                </button>
                                ${hasFiles ? `<button class="table-action-btn" title="Xem file (${doc.files.length})" onclick="window.erpApp.viewHoSo('${doc.id}')" style="color:#0D9488">
                                    <span class="material-icons-outlined">attach_file</span>
                                </button>` : ''}
                                <button class="table-action-btn edit" title="Chỉnh sửa" onclick="window.erpApp.openHsModal('${doc.id}')">
                                    <span class="material-icons-outlined">edit</span>
                                </button>
                                <button class="table-action-btn delete" title="Xóa" onclick="window.erpApp.confirmDeleteHoSo('${doc.id}')">
                                    <span class="material-icons-outlined">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
        }

        // Phân trang
        html += `</div>`;
        if (totalPages > 1) {
            html += `<div class="pagination">`;
            html += `<button class="page-btn" ${hsCurrentPage <= 1 ? 'disabled' : ''} onclick="window.erpApp.hsGoPage(${hsCurrentPage - 1})"><span class="material-icons-outlined">chevron_left</span></button>`;
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="page-btn ${i === hsCurrentPage ? 'active' : ''}" onclick="window.erpApp.hsGoPage(${i})">${i}</button>`;
            }
            html += `<button class="page-btn" ${hsCurrentPage >= totalPages ? 'disabled' : ''} onclick="window.erpApp.hsGoPage(${hsCurrentPage + 1})"><span class="material-icons-outlined">chevron_right</span></button>`;
            html += `</div>`;
        }

        html += `</div></div>`;
        pageContent.innerHTML = html;
    }

    // --- Modal Xem chi tiết hồ sơ ---
    function viewHoSo(id) {
        const doc = hoSoDocuments.find(d => d.id === id);
        if (!doc) return;

        let filesHtml = '';
        if (doc.files && doc.files.length > 0) {
            filesHtml = doc.files.map((f, i) => `
                <div class="hs-file-item">
                    <span class="material-icons-outlined hs-file-icon ${f.type === 'pdf' ? 'pdf' : 'doc'}">${f.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                    <div class="hs-file-info">
                        <span class="hs-file-name">${f.name}</span>
                        <span class="hs-file-size">${f.size}</span>
                    </div>
                    <button class="hs-file-action-btn" title="Xem file" onclick="window.erpApp.previewHsFile(${i}, '${doc.id}')">
                        <span class="material-icons-outlined">visibility</span>
                    </button>
                </div>
            `).join('');
        } else {
            filesHtml = '<div class="hs-no-files"><span class="material-icons-outlined">cloud_off</span> Chưa có file đính kèm</div>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsViewModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:680px">
                <div class="modal-header">
                    <h3><span class="material-icons-outlined">${getCategoryIcon(doc.category)}</span> ${doc.title}</h3>
                    <button class="modal-close" onclick="window.erpApp.closeHsViewModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body" style="padding:0">
                    <div class="hs-view-header">
                        <span class="gm-badge ${getCategoryColor(doc.category)}" style="font-size:13px;padding:6px 14px">${getCategoryLabel(doc.category)}</span>
                        <span class="gm-badge ${getHsStatusColor(doc.status)}" style="font-size:13px;padding:6px 14px">${getHsStatusLabel(doc.status)}</span>
                        <span class="hs-view-id">${doc.id}</span>
                    </div>
                    <div class="hs-view-grid">
                        <div class="hs-view-field">
                            <label><span class="material-icons-outlined">business</span> Nhà cung cấp</label>
                            <p>${doc.supplier}</p>
                        </div>
                        <div class="hs-view-field">
                            <label><span class="material-icons-outlined">person</span> Khách hàng</label>
                            <p>${doc.customer}</p>
                        </div>
                        <div class="hs-view-field">
                            <label><span class="material-icons-outlined">payments</span> Giá trị hợp đồng</label>
                            <p class="hs-value-highlight">${formatCurrencyFull(doc.value)}</p>
                        </div>
                        <div class="hs-view-field">
                            <label><span class="material-icons-outlined">event</span> Ngày ban hành</label>
                            <p>${formatDate(doc.issueDate)}</p>
                        </div>
                    </div>
                    ${doc.note ? `<div class="hs-view-note"><label><span class="material-icons-outlined">notes</span> Ghi chú</label><p>${doc.note}</p></div>` : ''}
                    <div class="hs-view-files">
                        <label><span class="material-icons-outlined">attach_file</span> File đính kèm (${doc.files ? doc.files.length : 0})</label>
                        <div class="hs-file-list">${filesHtml}</div>
                        <div class="hs-upload-inline">
                            <label class="hs-upload-btn" for="hsViewUpload_${doc.id}">
                                <span class="material-icons-outlined">cloud_upload</span> Upload thêm file
                            </label>
                            <input type="file" id="hsViewUpload_${doc.id}" accept=".pdf,.doc,.docx" multiple style="display:none" onchange="window.erpApp.handleHsFileUploadDirect(event, '${doc.id}')">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function closeHsViewModal() {
        const modal = document.getElementById('hsViewModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    // --- Modal Thêm/Sửa hồ sơ ---
    function openHsModal(id) {
        const doc = id ? hoSoDocuments.find(d => d.id === id) : null;
        const isEdit = !!doc;
        tempHsFiles = doc ? [...(doc.files || [])] : [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsEditModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:680px">
                <div class="modal-header">
                    <h3><span class="material-icons-outlined">${isEdit ? 'edit' : 'note_add'}</span> ${isEdit ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}</h3>
                    <button class="modal-close" onclick="window.erpApp.closeHsEditModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="hsEditId" value="${isEdit ? doc.id : ''}">

                    <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">info</span> Thông tin cơ bản</div>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:var(--primary)">article</span> Tên hồ sơ <span class="required">*</span></label>
                            <input type="text" id="hsTitle" value="${isEdit ? doc.title : ''}" placeholder="VD: Hợp đồng cung cấp vật liệu xây dựng...">
                        </div>
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#7C3AED">category</span> Loại hồ sơ <span class="required">*</span></label>
                            <select id="hsCategory">
                                <option value="hop-dong" ${isEdit && doc.category === 'hop-dong' ? 'selected' : ''}>📄 Hợp đồng</option>
                                <option value="phu-luc" ${isEdit && doc.category === 'phu-luc' ? 'selected' : ''}>📋 Phụ lục hợp đồng</option>
                                <option value="quyet-toan" ${isEdit && doc.category === 'quyet-toan' ? 'selected' : ''}>🧾 Quyết toán</option>
                                <option value="thanh-ly" ${isEdit && doc.category === 'thanh-ly' ? 'selected' : ''}>✅ Thanh lý hợp đồng</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#16A34A">flag</span> Trạng thái</label>
                            <select id="hsStatus">
                                <option value="active" ${isEdit && doc.status === 'active' ? 'selected' : ''}>🟢 Đang hiệu lực</option>
                                <option value="completed" ${isEdit && doc.status === 'completed' ? 'selected' : ''}>🔵 Hoàn thành</option>
                                <option value="pending" ${isEdit && doc.status === 'pending' ? 'selected' : ''}>🟡 Chờ xử lý</option>
                                <option value="expired" ${isEdit && doc.status === 'expired' ? 'selected' : ''}>🔴 Hết hạn</option>
                                <option value="cancelled" ${isEdit && doc.status === 'cancelled' ? 'selected' : ''}>⚪ Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">handshake</span> Đối tác & Giá trị</div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#EA580C">business</span> Nhà cung cấp <span class="required">*</span></label>
                            <input type="text" id="hsSupplier" value="${isEdit ? doc.supplier : ''}" placeholder="Tên công ty nhà cung cấp...">
                        </div>
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#0D9488">person</span> Khách hàng <span class="required">*</span></label>
                            <input type="text" id="hsCustomer" value="${isEdit ? doc.customer : ''}" placeholder="Tên công ty khách hàng...">
                        </div>
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#16A34A">payments</span> Giá trị hợp đồng (VNĐ)</label>
                            <input type="number" id="hsValue" value="${isEdit ? doc.value : ''}" placeholder="Nhập số tiền...">
                        </div>
                        <div class="form-group">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#DC2626">event</span> Ngày ban hành <span class="required">*</span></label>
                            <input type="date" id="hsIssueDate" value="${isEdit ? doc.issueDate : new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group full-width">
                            <label><span class="material-icons-outlined" style="font-size:15px;color:#6B7A90">notes</span> Ghi chú</label>
                            <textarea id="hsNote" rows="2" placeholder="Nhập ghi chú, mô tả chi tiết về hồ sơ...">${isEdit ? (doc.note || '') : ''}</textarea>
                        </div>
                    </div>

                    <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">attach_file</span> File đính kèm</div>
                    <div class="contract-upload-area">
                        <label for="hsFileInput" class="upload-label">
                            <span class="material-icons-outlined">cloud_upload</span>
                            <span>Nhấn để chọn file PDF hoặc Word</span>
                            <span style="font-size:11px;color:var(--text-muted);font-weight:400">Hỗ trợ: .pdf, .doc, .docx — Tối đa 10MB/file</span>
                        </label>
                        <input type="file" id="hsFileInput" accept=".pdf,.doc,.docx" multiple onchange="window.erpApp.handleHsFileUpload(event)" style="display:none">
                    </div>
                    <div id="hsFileList">${renderHsFileList(tempHsFiles, true)}</div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeHsEditModal()">Hủy</button>
                    <button class="btn-save" onclick="window.erpApp.saveHoSo()">
                        <span class="material-icons-outlined">save</span>
                        ${isEdit ? 'Cập nhật' : 'Lưu hồ sơ'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function renderHsFileList(files, editable, context) {
        if (!files || files.length === 0) return '';
        // context: 'cv-edit' | 'cv-view:CV_ID' | undefined (ho so)
        return files.map((f, i) => {
            const icon = f.type === 'pdf' ? 'picture_as_pdf' : 'description';
            const iconColor = f.type === 'pdf' ? '#DC2626' : '#2563EB';
            let actions = '';
            if (context && context.startsWith('cv-view:')) {
                const cvId = context.split(':')[1];
                actions = `
                    <button class="hs-file-action-btn" title="Xem file" onclick="window.erpApp.previewCvFile(${i},'${cvId}')" style="color:#0D9488"><span class="material-icons-outlined">visibility</span></button>
                    <button class="hs-file-action-btn" title="Xóa file" onclick="window.erpApp.removeCvFileDirect(${i},'${cvId}')" style="color:#DC2626"><span class="material-icons-outlined">delete</span></button>
                `;
            } else if (context === 'cv-edit') {
                actions = `
                    <button class="hs-file-action-btn" title="Xem file" onclick="window.erpApp.previewCvFile(${i},'')" style="color:#0D9488"><span class="material-icons-outlined">visibility</span></button>
                    <button class="contract-file-remove" onclick="window.erpApp.removeCvFileTemp(${i})"><span class="material-icons-outlined">close</span></button>
                `;
            } else if (editable) {
                actions = `<button class="contract-file-remove" onclick="window.erpApp.removeHsFile(${i})"><span class="material-icons-outlined">close</span></button>`;
            } else {
                actions = `<button class="contract-file-remove" style="color:var(--primary)" onclick="window.erpApp.previewHsFile(${i}, '')"><span class="material-icons-outlined">visibility</span></button>`;
            }
            return `
            <div class="contract-file-item">
                <span class="material-icons-outlined" style="color:${iconColor};font-size:20px">${icon}</span>
                <div class="contract-file-info">
                    <span class="contract-file-name">${f.name}</span>
                    <span class="contract-file-size">${f.size}</span>
                </div>
                <div style="display:flex;gap:4px;align-items:center">${actions}</div>
            </div>
            `;
        }).join('');
    }

    function closeHsEditModal() {
        const modal = document.getElementById('hsEditModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
        tempHsFiles = [];
    }

    function saveHoSo() {
        const id = document.getElementById('hsEditId').value;
        const title = document.getElementById('hsTitle').value.trim();
        const category = document.getElementById('hsCategory').value;
        const status = document.getElementById('hsStatus').value;
        const supplier = document.getElementById('hsSupplier').value.trim();
        const customer = document.getElementById('hsCustomer').value.trim();
        const value = parseFloat(document.getElementById('hsValue').value) || 0;
        const issueDate = document.getElementById('hsIssueDate').value;
        const note = document.getElementById('hsNote').value.trim();

        if (!title || !supplier || !customer || !issueDate) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        if (id) {
            const doc = hoSoDocuments.find(d => d.id === id);
            if (doc) {
                Object.assign(doc, { title, category, status, supplier, customer, value, issueDate, note, files: [...tempHsFiles] });
                if (window.CrudSync) window.CrudSync.saveItem('hoSoDocuments', doc, 'id');
                showToast('Đã cập nhật hồ sơ ' + id);
            }
        } else {
            const newDoc = { id: nextHsId(), title, category, status, supplier, customer, value, issueDate, note, files: [...tempHsFiles] };
            hoSoDocuments.unshift(newDoc);
            if (window.CrudSync) window.CrudSync.saveItem('hoSoDocuments', newDoc, 'id');
            showToast('Đã thêm hồ sơ mới');
        }

        closeHsEditModal();
        renderLuuTruHoSo();
    }

    function confirmDeleteHoSo(id) {
        const doc = hoSoDocuments.find(d => d.id === id);
        if (!doc) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'hsDeleteModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:420px">
                <div class="modal-header"><h3><span class="material-icons-outlined" style="color:#DC2626">warning</span> Xác nhận xóa</h3><button class="modal-close" onclick="window.erpApp.closeHsDeleteModal()"><span class="material-icons-outlined">close</span></button></div>
                <div class="modal-body" style="text-align:center;padding:24px">
                    <p style="font-size:15px">Bạn có chắc muốn xóa hồ sơ <strong>${doc.id}</strong>?</p>
                    <p style="color:var(--text-secondary);margin-top:8px;font-size:13px">${doc.title}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.erpApp.closeHsDeleteModal()">Hủy</button>
                    <button class="btn-save" style="background:#DC2626" onclick="window.erpApp.deleteHoSo('${doc.id}')"><span class="material-icons-outlined">delete</span> Xóa</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function deleteHoSo(id) {
        hoSoDocuments = hoSoDocuments.filter(d => d.id !== id);
        if (window.CrudSync) window.CrudSync.deleteItem('hoSoDocuments', id);
        const modal = document.getElementById('hsDeleteModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
        showToast('Đã xóa hồ sơ ' + id);
        renderLuuTruHoSo();
    }

    function closeHsDeleteModal() {
        const modal = document.getElementById('hsDeleteModal');
        if (modal) { modal.classList.add('closing'); setTimeout(() => modal.remove(), 200); }
    }

    // ==========================================
    // MODULE: Quản lý công văn (CRUD đầy đủ)
    // ==========================================

    let congVanList = [
        { id: 'CV-2026/156', title: 'V/v triển khai dự án mới Q2/2026', type: 'den', sender: 'Sở KH&ĐT TP.HCM', receiver: 'Ban Giám đốc', issueDate: '2026-04-01', status: 'cho-xu-ly', priority: 'cao', note: 'Yêu cầu phản hồi trước 15/04', files: [{ name: 'CV156_DuAn_Q2.pdf', size: '3.2 MB', type: 'pdf' }] },
        { id: 'CV-2026/155', title: 'Thông báo lịch nghỉ lễ 30/4 - 1/5', type: 'noi-bo', sender: 'Phòng HC-NS', receiver: 'Toàn công ty', issueDate: '2026-03-31', status: 'da-xu-ly', priority: 'trung-binh', note: 'Nghỉ từ 30/4 đến 3/5', files: [{ name: 'TB_NghiLe_2026.pdf', size: '890 KB', type: 'pdf' }] },
        { id: 'CV-2026/154', title: 'Hợp đồng hợp tác chiến lược ABC Corp', type: 'di', sender: 'VIETBACHCORP', receiver: 'ABC Corporation', issueDate: '2026-03-30', status: 'da-gui', priority: 'cao', note: 'HĐ hợp tác 3 năm', files: [{ name: 'HD_HopTac_ABC.pdf', size: '5.4 MB', type: 'pdf' }, { name: 'PhuLuc_ABC.docx', size: '1.2 MB', type: 'doc' }] },
        { id: 'CV-2026/153', title: 'Báo cáo tài chính Q1/2026', type: 'di', sender: 'Phòng Tài chính', receiver: 'HĐQT', issueDate: '2026-03-28', status: 'da-gui', priority: 'cao', note: 'Báo cáo quý đầy đủ', files: [{ name: 'BCTC_Q1_2026.pdf', size: '8.1 MB', type: 'pdf' }] },
        { id: 'CV-2026/152', title: 'Yêu cầu phê duyệt ngân sách Q2', type: 'noi-bo', sender: 'Phòng Kế hoạch', receiver: 'CEO', issueDate: '2026-03-27', status: 'da-duyet', priority: 'cao', note: 'Ngân sách 2.5 tỷ', files: [] },
        { id: 'CV-2026/151', title: 'Thư mời dự hội nghị CNTT Việt Nam 2026', type: 'den', sender: 'Hiệp hội CNTT VN', receiver: 'Phòng IT', issueDate: '2026-03-25', status: 'da-xu-ly', priority: 'thap', note: 'Ngày 15-17/05 tại Hà Nội', files: [{ name: 'ThuMoi_CNTT2026.pdf', size: '1.5 MB', type: 'pdf' }] },
        { id: 'CV-2026/150', title: 'V/v cập nhật quy trình ISO 9001:2015', type: 'noi-bo', sender: 'Phòng QA', receiver: 'Các phòng ban', issueDate: '2026-03-24', status: 'dang-xu-ly', priority: 'trung-binh', note: 'Cập nhật version 3.0', files: [{ name: 'QuyTrinh_ISO_v3.docx', size: '2.8 MB', type: 'doc' }] },
        { id: 'CV-2026/149', title: 'Đề nghị thanh toán công nợ tháng 3', type: 'den', sender: 'CT TNHH Vật liệu Hoàng Phát', receiver: 'Phòng Tài chính', issueDate: '2026-03-22', status: 'cho-xu-ly', priority: 'cao', note: 'Tổng nợ 450 triệu', files: [{ name: 'DeNghi_ThanhToan_T3.pdf', size: '1.1 MB', type: 'pdf' }] },
        { id: 'CV-2026/148', title: 'Thông báo kết quả kiểm toán nội bộ', type: 'di', sender: 'Ban Kiểm toán', receiver: 'HĐQT & Ban TGĐ', issueDate: '2026-03-20', status: 'da-gui', priority: 'trung-binh', note: 'Kết quả kiểm toán Q4/2025', files: [{ name: 'KetQua_KiemToan.pdf', size: '6.3 MB', type: 'pdf' }] },
        { id: 'CV-2026/147', title: 'Giấy phép xây dựng dự án Sunrise Tower', type: 'den', sender: 'Sở Xây dựng TP.HCM', receiver: 'Ban Dự án', issueDate: '2026-03-18', status: 'da-xu-ly', priority: 'cao', note: 'Giấy phép có hiệu lực 24 tháng', files: [{ name: 'GiayPhep_SunriseTower.pdf', size: '4.7 MB', type: 'pdf' }] },
    ];

    let cvSearchQuery = '';
    let cvCurrentPage = 1;
    let cvActiveTab = 'all';
    let cvSortOrder = 'desc'; // 'desc' = mới nhất trước, 'asc' = cũ nhất trước
    const cvPageSize = 8;
    let tempCvFiles = [];

    function getCvTypeLabel(t) { return { 'den': 'Công văn đến', 'di': 'Công văn đi', 'noi-bo': 'Nội bộ' }[t] || t; }
    function getCvTypeColor(t) { return { 'den': 'blue', 'di': 'green', 'noi-bo': 'purple' }[t] || 'gray'; }
    function getCvTypeIcon(t) { return { 'den': 'mail', 'di': 'send', 'noi-bo': 'swap_horiz' }[t] || 'description'; }
    function getCvStatusLabel(s) { return { 'cho-xu-ly': 'Chờ xử lý', 'dang-xu-ly': 'Đang xử lý', 'da-xu-ly': 'Đã xử lý', 'da-gui': 'Đã gửi', 'da-duyet': 'Đã duyệt' }[s] || s; }
    function getCvStatusColor(s) { return { 'cho-xu-ly': 'orange', 'dang-xu-ly': 'blue', 'da-xu-ly': 'green', 'da-gui': 'teal', 'da-duyet': 'green' }[s] || 'gray'; }
    function getCvPriorityLabel(p) { return { 'cao': 'Cao', 'trung-binh': 'Trung bình', 'thap': 'Thấp' }[p] || p; }
    function getCvPriorityColor(p) { return { 'cao': 'red', 'trung-binh': 'orange', 'thap': 'blue' }[p] || 'gray'; }
    function nextCvId() { const nums = congVanList.map(c => parseInt(c.id.split('/')[1],10)); return 'CV-2026/' + (Math.max(...nums,0)+1); }

    function getFilteredCongVan() {
        let data = [...congVanList];
        if (cvActiveTab !== 'all') data = data.filter(c => c.type === cvActiveTab);
        const q = cvSearchQuery.toLowerCase().trim();
        if (q) data = data.filter(c => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.sender.toLowerCase().includes(q) || c.receiver.toLowerCase().includes(q));
        // Sắp xếp theo ngày ban hành
        data.sort((a, b) => {
            const dateA = new Date(a.issueDate || '1970-01-01');
            const dateB = new Date(b.issueDate || '1970-01-01');
            return cvSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        return data;
    }

    function renderQuanLyCongVan() {
        breadcrumbCurrent.textContent = 'Quản lý công văn';
        pageBadge.textContent = 'Hành chính';
        const filtered = getFilteredCongVan();
        const totalPages = Math.ceil(filtered.length / cvPageSize);
        if (cvCurrentPage > totalPages && totalPages > 0) cvCurrentPage = totalPages;
        const pageData = filtered.slice((cvCurrentPage-1)*cvPageSize, cvCurrentPage*cvPageSize);
        const cDen = congVanList.filter(c=>c.type==='den').length, cDi = congVanList.filter(c=>c.type==='di').length, cNB = congVanList.filter(c=>c.type==='noi-bo').length;
        const cPending = congVanList.filter(c=>c.status==='cho-xu-ly'||c.status==='dang-xu-ly').length;

        let html = `<div class="employee-module">
            <div class="employee-toolbar">
                <button class="back-btn" onclick="window.erpApp.navigateTo('hanh-chinh')"><span class="material-icons-outlined">arrow_back</span> Quay lại</button>
                <div class="search-box"><span class="material-icons-outlined">search</span>
                    <input type="text" id="cvSearchInput" placeholder="Tìm số CV, tiêu đề, người gửi/nhận..." value="${cvSearchQuery}" oninput="window.erpApp.cvSearch(this.value)">
                </div>
                <button class="btn-add-employee" onclick="window.erpApp.openCvModal()"><span class="material-icons-outlined">note_add</span> Thêm công văn</button>
            </div>
            <div class="employee-stats">
                <div class="stat-card" style="cursor:pointer;${cvActiveTab==='den'?'outline:2px solid var(--primary)':''}" onclick="window.erpApp.cvSetTab('den')">
                    <div class="stat-card-icon blue"><span class="material-icons-outlined">mail</span></div>
                    <div class="stat-card-body"><div class="stat-card-value">${cDen}</div><div class="stat-card-label">Công văn đến</div></div>
                </div>
                <div class="stat-card" style="cursor:pointer;${cvActiveTab==='di'?'outline:2px solid var(--primary)':''}" onclick="window.erpApp.cvSetTab('di')">
                    <div class="stat-card-icon green"><span class="material-icons-outlined">send</span></div>
                    <div class="stat-card-body"><div class="stat-card-value">${cDi}</div><div class="stat-card-label">Công văn đi</div></div>
                </div>
                <div class="stat-card" style="cursor:pointer;${cvActiveTab==='noi-bo'?'outline:2px solid var(--primary)':''}" onclick="window.erpApp.cvSetTab('noi-bo')">
                    <div class="stat-card-icon purple"><span class="material-icons-outlined">swap_horiz</span></div>
                    <div class="stat-card-body"><div class="stat-card-value">${cNB}</div><div class="stat-card-label">Nội bộ</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon orange"><span class="material-icons-outlined">pending_actions</span></div>
                    <div class="stat-card-body"><div class="stat-card-value">${cPending}</div><div class="stat-card-label">Chờ xử lý</div></div>
                </div>
            </div>
            <div class="hs-tab-bar">
                <button class="hs-tab ${cvActiveTab==='all'?'active':''}" onclick="window.erpApp.cvSetTab('all')">Tất cả (${congVanList.length})</button>
                <button class="hs-tab ${cvActiveTab==='den'?'active':''}" onclick="window.erpApp.cvSetTab('den')">Đến (${cDen})</button>
                <button class="hs-tab ${cvActiveTab==='di'?'active':''}" onclick="window.erpApp.cvSetTab('di')">Đi (${cDi})</button>
                <button class="hs-tab ${cvActiveTab==='noi-bo'?'active':''}" onclick="window.erpApp.cvSetTab('noi-bo')">Nội bộ (${cNB})</button>
            </div>
            <div class="table-container"><div class="table-header-bar">
                <div class="table-title"><span class="material-icons-outlined">description</span> Danh sách công văn</div>
                <div class="table-count">${filtered.length} kết quả</div>
            </div><div class="table-scroll">`;

        if (filtered.length === 0) {
            html += `<div class="table-empty"><span class="material-icons-outlined">search_off</span><p>Không tìm thấy công văn nào.</p></div>`;
        } else {
            const sortIcon = cvSortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward';
            const sortLabel = cvSortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất';
            html += `<table class="data-table"><thead><tr>
                <th>Số CV</th><th>Tiêu đề</th><th>Loại</th><th>Người gửi</th><th>Người nhận</th>
                <th style="cursor:pointer;user-select:none;white-space:nowrap" onclick="window.erpApp.cvToggleSort()" title="Click để đổi thứ tự">
                    Ngày <span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;margin-left:2px">${sortIcon}</span>
                    <span style="font-size:10px;color:var(--text-secondary);font-weight:400;margin-left:4px">${sortLabel}</span>
                </th>
                <th>Ưu tiên</th><th>Trạng thái</th><th>Tác vụ</th>
            </tr></thead><tbody>`;
            pageData.forEach(cv => {
                const hasFiles = cv.files && cv.files.length > 0;
                html += `<tr>
                    <td class="td-id">${cv.id}</td>
                    <td><div class="hs-title-cell"><span class="material-icons-outlined hs-cat-icon ${getCvTypeColor(cv.type)}">${getCvTypeIcon(cv.type)}</span><span class="hs-title-text" title="${cv.title}">${cv.title}</span></div></td>
                    <td><span class="gm-badge ${getCvTypeColor(cv.type)}">${getCvTypeLabel(cv.type)}</span></td>
                    <td><span class="hs-partner-cell"><span class="material-icons-outlined">person</span>${cv.sender}</span></td>
                    <td><span class="hs-partner-cell"><span class="material-icons-outlined">person_outline</span>${cv.receiver}</span></td>
                    <td>${formatDate(cv.issueDate)}</td>
                    <td><span class="gm-badge ${getCvPriorityColor(cv.priority)}">${getCvPriorityLabel(cv.priority)}</span></td>
                    <td><span class="gm-badge ${getCvStatusColor(cv.status)}">${getCvStatusLabel(cv.status)}</span></td>
                    <td><div class="table-actions">
                        <button class="table-action-btn view" title="Xem" onclick="window.erpApp.viewCongVan('${cv.id}')"><span class="material-icons-outlined">visibility</span></button>
                        <button class="table-action-btn edit" title="Sửa" onclick="window.erpApp.openCvModal('${cv.id}')"><span class="material-icons-outlined">edit</span></button>
                        ${hasFiles ? `<button class="table-action-btn" title="Tải file" onclick="window.erpApp.previewCvFile(0,'${cv.id}')" style="color:#0D9488"><span class="material-icons-outlined">download</span></button>` : ''}
                        <button class="table-action-btn delete" title="Xóa" onclick="window.erpApp.confirmDeleteCv('${cv.id}')"><span class="material-icons-outlined">delete</span></button>
                    </div></td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }
        html += `</div>`;
        if (totalPages > 1) {
            html += `<div class="pagination">`;
            html += `<button class="page-btn" ${cvCurrentPage<=1?'disabled':''} onclick="window.erpApp.cvGoPage(${cvCurrentPage-1})"><span class="material-icons-outlined">chevron_left</span></button>`;
            for (let i=1;i<=totalPages;i++) html += `<button class="page-btn ${i===cvCurrentPage?'active':''}" onclick="window.erpApp.cvGoPage(${i})">${i}</button>`;
            html += `<button class="page-btn" ${cvCurrentPage>=totalPages?'disabled':''} onclick="window.erpApp.cvGoPage(${cvCurrentPage+1})"><span class="material-icons-outlined">chevron_right</span></button></div>`;
        }
        html += `</div></div>`;
        pageContent.innerHTML = html;
    }

    function viewCongVan(id) {
        const cv = congVanList.find(c=>c.id===id); if(!cv) return;
        let filesHtml = cv.files && cv.files.length > 0 ? renderHsFileList(cv.files, false, 'cv-view:' + cv.id)
            : '<div class="hs-no-files"><span class="material-icons-outlined">cloud_off</span> Chưa có file đính kèm</div>';

        const modal = document.createElement('div'); modal.className='modal-overlay'; modal.id='cvViewModal';
        modal.innerHTML = `<div class="modal-content" style="max-width:680px">
            <div class="modal-header"><h3><span class="material-icons-outlined">${getCvTypeIcon(cv.type)}</span> ${cv.title}</h3>
                <button class="modal-close" onclick="document.getElementById('cvViewModal').classList.add('closing');setTimeout(()=>document.getElementById('cvViewModal').remove(),200)"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body" style="padding:0">
                <div class="hs-view-header">
                    <span class="gm-badge ${getCvTypeColor(cv.type)}" style="font-size:13px;padding:6px 14px">${getCvTypeLabel(cv.type)}</span>
                    <span class="gm-badge ${getCvStatusColor(cv.status)}" style="font-size:13px;padding:6px 14px">${getCvStatusLabel(cv.status)}</span>
                    <span class="gm-badge ${getCvPriorityColor(cv.priority)}" style="font-size:13px;padding:6px 14px">Ưu tiên: ${getCvPriorityLabel(cv.priority)}</span>
                    <span class="hs-view-id">${cv.id}</span>
                </div>
                <div class="hs-view-grid">
                    <div class="hs-view-field"><label><span class="material-icons-outlined">person</span> Người gửi</label><p>${cv.sender}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">person_outline</span> Người nhận</label><p>${cv.receiver}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">event</span> Ngày ban hành</label><p>${formatDate(cv.issueDate)}</p></div>
                    <div class="hs-view-field"><label><span class="material-icons-outlined">flag</span> Trạng thái</label><p>${getCvStatusLabel(cv.status)}</p></div>
                </div>
                ${cv.note ? `<div class="hs-view-note"><label><span class="material-icons-outlined">notes</span> Ghi chú</label><p>${cv.note}</p></div>` : ''}
                <div class="hs-view-files"><label><span class="material-icons-outlined">attach_file</span> File đính kèm (${cv.files?cv.files.length:0})</label>
                    <div class="hs-file-list">${filesHtml}</div>
                    <div class="hs-upload-inline"><label class="hs-upload-btn" for="cvViewUpload_${cv.id}"><span class="material-icons-outlined">cloud_upload</span> Upload thêm file</label>
                        <input type="file" id="cvViewUpload_${cv.id}" accept=".pdf,.doc,.docx" multiple style="display:none" onchange="window.erpApp.handleCvFileUploadDirect(event,'${cv.id}')">
                    </div>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }

    function openCvModal(id) {
        const cv = id ? congVanList.find(c=>c.id===id) : null;
        const isEdit = !!cv;
        tempCvFiles = cv ? [...(cv.files||[])] : [];
        const modal = document.createElement('div'); modal.className='modal-overlay'; modal.id='cvEditModal';
        modal.innerHTML = `<div class="modal-content" style="max-width:680px">
            <div class="modal-header"><h3><span class="material-icons-outlined">${isEdit?'edit':'note_add'}</span> ${isEdit?'Chỉnh sửa công văn':'Thêm công văn mới'}</h3>
                <button class="modal-close" onclick="window.erpApp.closeCvEditModal()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="cvEditId" value="${isEdit?cv.id:''}">
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">info</span> Thông tin công văn</div>
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:var(--primary)">article</span> Tiêu đề <span class="required">*</span></label>
                        <input type="text" id="cvTitle" value="${isEdit?cv.title:''}" placeholder="VD: V/v triển khai dự án mới...">
                    </div>
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#7C3AED">category</span> Loại công văn <span class="required">*</span></label>
                        <select id="cvType">
                            <option value="den" ${isEdit&&cv.type==='den'?'selected':''}>📩 Công văn đến</option>
                            <option value="di" ${isEdit&&cv.type==='di'?'selected':''}>📤 Công văn đi</option>
                            <option value="noi-bo" ${isEdit&&cv.type==='noi-bo'?'selected':''}>🔄 Nội bộ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#16A34A">flag</span> Trạng thái</label>
                        <select id="cvStatus">
                            <option value="cho-xu-ly" ${isEdit&&cv.status==='cho-xu-ly'?'selected':''}>🟡 Chờ xử lý</option>
                            <option value="dang-xu-ly" ${isEdit&&cv.status==='dang-xu-ly'?'selected':''}>🔵 Đang xử lý</option>
                            <option value="da-xu-ly" ${isEdit&&cv.status==='da-xu-ly'?'selected':''}>🟢 Đã xử lý</option>
                            <option value="da-gui" ${isEdit&&cv.status==='da-gui'?'selected':''}>✅ Đã gửi</option>
                            <option value="da-duyet" ${isEdit&&cv.status==='da-duyet'?'selected':''}>✅ Đã duyệt</option>
                        </select>
                    </div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">people</span> Người gửi & Nhận</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#EA580C">person</span> Người gửi <span class="required">*</span></label>
                        <input type="text" id="cvSender" value="${isEdit?cv.sender:''}" placeholder="Tên đơn vị/người gửi...">
                    </div>
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#0D9488">person_outline</span> Người nhận <span class="required">*</span></label>
                        <input type="text" id="cvReceiver" value="${isEdit?cv.receiver:''}" placeholder="Tên đơn vị/người nhận...">
                    </div>
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#DC2626">event</span> Ngày ban hành <span class="required">*</span></label>
                        <input type="date" id="cvIssueDate" value="${isEdit?cv.issueDate:new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#D97706">priority_high</span> Mức ưu tiên</label>
                        <select id="cvPriority">
                            <option value="cao" ${isEdit&&cv.priority==='cao'?'selected':''}>🔴 Cao</option>
                            <option value="trung-binh" ${isEdit&&cv.priority==='trung-binh'?'selected':''}>🟡 Trung bình</option>
                            <option value="thap" ${isEdit&&cv.priority==='thap'?'selected':''}>🔵 Thấp</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label><span class="material-icons-outlined" style="font-size:15px;color:#6B7A90">notes</span> Ghi chú</label>
                        <textarea id="cvNote" rows="2" placeholder="Nội dung tóm tắt...">${isEdit?(cv.note||''):''}</textarea>
                    </div>
                </div>
                <div class="form-section-title"><span class="material-icons-outlined" style="font-size:14px">attach_file</span> File đính kèm</div>
                <div class="contract-upload-area">
                    <label for="cvFileInput" class="upload-label"><span class="material-icons-outlined">cloud_upload</span><span>Nhấn để chọn file PDF hoặc Word</span>
                        <span style="font-size:11px;color:var(--text-muted);font-weight:400">Hỗ trợ: .pdf, .doc, .docx — Tối đa 10MB/file</span></label>
                    <input type="file" id="cvFileInput" accept=".pdf,.doc,.docx" multiple onchange="window.erpApp.handleCvFileUpload(event)" style="display:none">
                </div>
                <div id="cvFileList">${renderHsFileList(tempCvFiles, true, 'cv-edit')}</div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="window.erpApp.closeCvEditModal()">Hủy</button>
                <button class="btn-save" onclick="window.erpApp.saveCongVan()"><span class="material-icons-outlined">save</span> ${isEdit?'Cập nhật':'Lưu công văn'}</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }

    function closeCvEditModal() { const m=document.getElementById('cvEditModal'); if(m){m.classList.add('closing');setTimeout(()=>m.remove(),200);} tempCvFiles=[]; }

    function saveCongVan() {
        const id=document.getElementById('cvEditId').value, title=document.getElementById('cvTitle').value.trim();
        const type=document.getElementById('cvType').value, status=document.getElementById('cvStatus').value;
        const sender=document.getElementById('cvSender').value.trim(), receiver=document.getElementById('cvReceiver').value.trim();
        const issueDate=document.getElementById('cvIssueDate').value, priority=document.getElementById('cvPriority').value;
        const note=document.getElementById('cvNote').value.trim();
        if(!title||!sender||!receiver||!issueDate){showToast('Vui lòng điền đầy đủ thông tin bắt buộc!');return;}
        if(id){
            const cv=congVanList.find(c=>c.id===id);
            if(cv){
                Object.assign(cv,{title,type,status,sender,receiver,issueDate,priority,note,files:[...tempCvFiles]});
                if(window.CrudSync) window.CrudSync.saveItem('congVanList',cv,'id');
                showToast('Đã cập nhật '+id);
            }
        } else {
            const newCv={id:nextCvId(),title,type,status,sender,receiver,issueDate,priority,note,files:[...tempCvFiles]};
            congVanList.unshift(newCv);
            if(window.CrudSync) window.CrudSync.saveItem('congVanList',newCv,'id');
            showToast('Đã thêm công văn mới');
        }
        closeCvEditModal(); renderQuanLyCongVan();
    }

    function confirmDeleteCv(id) {
        const cv=congVanList.find(c=>c.id===id);if(!cv)return;
        const modal=document.createElement('div');modal.className='modal-overlay';modal.id='cvDeleteModal';
        modal.innerHTML=`<div class="modal-content" style="max-width:420px"><div class="modal-header"><h3><span class="material-icons-outlined" style="color:#DC2626">warning</span> Xác nhận xóa</h3><button class="modal-close" onclick="window.erpApp.closeCvDeleteModal()"><span class="material-icons-outlined">close</span></button></div>
            <div class="modal-body" style="text-align:center;padding:24px"><p style="font-size:15px">Xóa công văn <strong>${cv.id}</strong>?</p><p style="color:var(--text-secondary);margin-top:8px;font-size:13px">${cv.title}</p></div>
            <div class="modal-footer"><button class="btn-cancel" onclick="window.erpApp.closeCvDeleteModal()">Hủy</button><button class="btn-save" style="background:#DC2626" onclick="window.erpApp.deleteCongVan('${cv.id}')"><span class="material-icons-outlined">delete</span> Xóa</button></div></div>`;
        document.body.appendChild(modal);
    }
    function deleteCongVan(id){
        congVanList=congVanList.filter(c=>c.id!==id);
        if(window.CrudSync) window.CrudSync.deleteItem('congVanList',id);
        const m=document.getElementById('cvDeleteModal');
        if(m){m.classList.add('closing');setTimeout(()=>m.remove(),200);}
        showToast('Đã xóa '+id);
        renderQuanLyCongVan();
    }
    function closeCvDeleteModal(){const m=document.getElementById('cvDeleteModal');if(m){m.classList.add('closing');setTimeout(()=>m.remove(),200);}}

    // ==========================================
    // CONFIGS: 4 Module Hành chính (generic)
    // ==========================================

    const hanhChinhModules = {
        'Phê duyệt văn bản': {
            title: 'Phê duyệt văn bản', badge: 'Hành chính', backPage: 'hanh-chinh',
            stats: [
                { icon: 'pending_actions', color: 'orange', value: '7', label: 'Chờ duyệt' },
                { icon: 'check_circle', color: 'green', value: '143', label: 'Đã duyệt' },
                { icon: 'cancel', color: 'red', value: '8', label: 'Từ chối' },
                { icon: 'assignment_return', color: 'blue', value: '5', label: 'Yêu cầu sửa' }
            ],
            table: {
                title: 'Văn bản chờ phê duyệt', icon: 'approval',
                cols: ['Mã VB', 'Tiêu đề', 'Người gửi', 'Ngày gửi', 'Ưu tiên', 'Trạng thái'],
                rows: [
                    ['VB-087', 'Đề xuất mua thiết bị CNTT', 'Phạm Thúy Dung', '01/04', 'Cao', 'Chờ duyệt'],
                    ['VB-086', 'Đề xuất tuyển dụng Q2', 'Lê Hoàng Cường', '31/03', 'Cao', 'Chờ duyệt'],
                    ['VB-085', 'Xin phê duyệt ngân sách Marketing', 'Võ Kim Em', '30/03', 'Trung bình', 'Chờ duyệt'],
                    ['VB-084', 'Đề xuất thay đổi quy trình KCS', 'Đặng Văn Phúc', '28/03', 'Thấp', 'Chờ duyệt'],
                    ['VB-083', 'Hợp đồng thuê kho mới', 'Nguyễn Văn An', '27/03', 'Cao', 'Đã duyệt'],
                    ['VB-082', 'Đề xuất nghỉ phép tập thể 30/4', 'Trần Thị Bích', '25/03', 'Trung bình', 'Đã duyệt'],
                    ['VB-081', 'Điều chỉnh bảng lương T4', 'Phan Thị Hương', '24/03', 'Cao', 'Từ chối']
                ],
                badgeCols: { 4: { 'Cao': 'red', 'Trung bình': 'orange', 'Thấp': 'blue' }, 5: { 'Chờ duyệt': 'orange', 'Đã duyệt': 'green', 'Từ chối': 'red', 'Yêu cầu sửa': 'blue' } }
            },
            chart: {
                title: 'Tỷ lệ phê duyệt 6 tháng gần đây', icon: 'bar_chart',
                bars: [
                    { label: 'T11', value: 18, color: '#16A34A' }, { label: 'T12', value: 25, color: '#16A34A' },
                    { label: 'T1', value: 22, color: '#16A34A' }, { label: 'T2', value: 15, color: '#16A34A' },
                    { label: 'T3', value: 30, color: '#16A34A' }, { label: 'T4', value: 7, color: '#F97316' }
                ]
            },
            timeline: {
                title: 'Hoạt động phê duyệt gần đây', icon: 'history',
                items: [
                    { dot: 'orange', icon: 'pending_actions', title: 'VB-087 chờ phê duyệt', desc: 'Đề xuất mua thiết bị CNTT — Phạm Thúy Dung', time: '2 giờ trước' },
                    { dot: 'green', icon: 'check_circle', title: 'Đã duyệt VB-083', desc: 'Hợp đồng thuê kho mới — CEO đã ký duyệt', time: '5 ngày trước' },
                    { dot: 'red', icon: 'cancel', title: 'Từ chối VB-081', desc: 'Điều chỉnh bảng lương — Cần bổ sung căn cứ pháp lý', time: '1 tuần trước' },
                    { dot: 'blue', icon: 'assignment_return', title: 'Yêu cầu sửa VB-079', desc: 'Hợp đồng thuê VP — Sửa điều khoản giá', time: '2 tuần trước' }
                ]
            }
        },

        'Quản lý phòng họp': {
            title: 'Quản lý phòng họp', badge: 'Hành chính', backPage: 'hanh-chinh',
            stats: [
                { icon: 'meeting_room', color: 'blue', value: '6', label: 'Tổng phòng họp' },
                { icon: 'event_available', color: 'green', value: '3', label: 'Đang trống' },
                { icon: 'event_busy', color: 'red', value: '2', label: 'Đang họp' },
                { icon: 'build', color: 'orange', value: '1', label: 'Bảo trì' }
            ],
            table: {
                title: 'Lịch đặt phòng hôm nay', icon: 'calendar_today',
                cols: ['Phòng', 'Cuộc họp', 'Người đặt', 'Thời gian', 'Sức chứa', 'Trạng thái'],
                rows: [
                    ['Phòng A1', 'Họp giao ban đầu tuần', 'Nguyễn Văn An', '08:00 – 09:30', '20 người', 'Đã xong'],
                    ['Phòng B2', 'Review dự án Alpha', 'Lê Hoàng Cường', '09:30 – 11:00', '10 người', 'Đang họp'],
                    ['Phòng A1', 'Training NextJS', 'Phạm Thúy Dung', '14:00 – 16:00', '20 người', 'Sắp tới'],
                    ['Phòng C1', 'Phỏng vấn ứng viên', 'Trần Thị Bích', '10:00 – 11:30', '6 người', 'Đang họp'],
                    ['Phòng B1', 'Họp chiến lược Q2', 'Đặng Văn Phúc', '13:30 – 15:00', '12 người', 'Sắp tới'],
                    ['Phòng VIP', 'Tiếp khách hàng ABC', 'Hoàng Minh Đức', '15:00 – 16:30', '8 người', 'Sắp tới']
                ],
                badgeCols: { 5: { 'Đã xong': 'green', 'Đang họp': 'blue', 'Sắp tới': 'orange' } }
            },
            progress: {
                title: 'Tỷ lệ sử dụng phòng (tháng này)', icon: 'donut_large',
                items: [
                    { label: 'Phòng A1 (20 chỗ)', value: '85%', pct: 85, color: '#3B82F6' },
                    { label: 'Phòng B1 (12 chỗ)', value: '72%', pct: 72, color: '#7C3AED' },
                    { label: 'Phòng B2 (10 chỗ)', value: '91%', pct: 91, color: '#16A34A' },
                    { label: 'Phòng C1 (6 chỗ)', value: '68%', pct: 68, color: '#EA580C' },
                    { label: 'Phòng VIP (8 chỗ)', value: '45%', pct: 45, color: '#0D9488' },
                    { label: 'Phòng D1 (30 chỗ)', value: '0% – Bảo trì', pct: 0, color: '#94A3B8' }
                ]
            },
            infoCards: {
                title: 'Danh sách phòng họp', icon: 'meeting_room',
                items: [
                    { icon: 'meeting_room', bg: '#DBEAFE', color: '#2563EB', title: 'Phòng A1', desc: '20 chỗ · TV 65" · Whiteboard · Máy chiếu', badge: 'Trống', badgeColor: 'green' },
                    { icon: 'meeting_room', bg: '#EDE9FE', color: '#7C3AED', title: 'Phòng B1', desc: '12 chỗ · TV 55" · Webcam · Mic hội nghị', badge: 'Trống', badgeColor: 'green' },
                    { icon: 'meeting_room', bg: '#DCFCE7', color: '#16A34A', title: 'Phòng B2', desc: '10 chỗ · Màn hình 50" · Bảng trắng', badge: 'Đang họp', badgeColor: 'blue' },
                    { icon: 'meeting_room', bg: '#FEF3C7', color: '#D97706', title: 'Phòng C1', desc: '6 chỗ · TV 42" · Phòng kín', badge: 'Đang họp', badgeColor: 'blue' },
                    { icon: 'meeting_room', bg: '#CCFBF1', color: '#0D9488', title: 'Phòng VIP', desc: '8 chỗ · TV 75" · Soundbar · Bar nước', badge: 'Trống', badgeColor: 'green' },
                    { icon: 'build', bg: '#FEE2E2', color: '#DC2626', title: 'Phòng D1', desc: '30 chỗ hội trường · Đang bảo trì điều hoà', badge: 'Bảo trì', badgeColor: 'red' }
                ]
            }
        },

        'Quản lý thiết bị': {
            title: 'Quản lý thiết bị', badge: 'Hành chính', backPage: 'hanh-chinh',
            stats: [
                { icon: 'devices', color: 'blue', value: '234', label: 'Tổng thiết bị' },
                { icon: 'check_circle', color: 'green', value: '198', label: 'Đang sử dụng' },
                { icon: 'inventory', color: 'orange', value: '24', label: 'Trong kho' },
                { icon: 'build', color: 'red', value: '12', label: 'Đang sửa chữa' }
            ],
            table: {
                title: 'Thiết bị mới cấp phát', icon: 'devices',
                cols: ['Mã TB', 'Tên thiết bị', 'Người sử dụng', 'Phòng ban', 'Ngày cấp', 'Tình trạng'],
                rows: [
                    ['TB-234', 'Laptop Dell Latitude 5540', 'Nguyễn Văn An', 'Kỹ thuật', '01/04/2026', 'Mới cấp'],
                    ['TB-233', 'Màn hình Dell 27"', 'Phạm Thúy Dung', 'Marketing', '28/03/2026', 'Mới cấp'],
                    ['TB-232', 'Máy in HP LaserJet Pro', 'Văn phòng Tầng 3', 'Chung', '25/03/2026', 'Đang dùng'],
                    ['TB-231', 'iPad Air 5', 'Lê Hoàng Cường', 'Kỹ thuật', '22/03/2026', 'Đang dùng'],
                    ['TB-230', 'Tai nghe Jabra Evolve', 'Trần Thị Bích', 'Nhân sự', '20/03/2026', 'Đang dùng'],
                    ['TB-229', 'Máy chiếu Epson EB-X50', 'Phòng họp A1', 'Chung', '18/03/2026', 'Bảo trì'],
                    ['TB-228', 'Camera Logitech C920', 'Phòng họp B2', 'Chung', '15/03/2026', 'Đang dùng']
                ],
                badgeCols: { 5: { 'Mới cấp': 'blue', 'Đang dùng': 'green', 'Bảo trì': 'orange', 'Thu hồi': 'red' } }
            },
            chart: {
                title: 'Thiết bị theo loại', icon: 'category',
                bars: [
                    { label: 'Laptop', value: 85, color: '#3B82F6' },
                    { label: 'Màn hình', value: 62, color: '#7C3AED' },
                    { label: 'Máy in', value: 15, color: '#16A34A' },
                    { label: 'Tablet', value: 12, color: '#EA580C' },
                    { label: 'Phụ kiện', value: 45, color: '#0D9488' },
                    { label: 'Khác', value: 15, color: '#94A3B8' }
                ]
            },
            timeline: {
                title: 'Lịch sử cấp phát / thu hồi', icon: 'history',
                items: [
                    { dot: 'blue', icon: 'assignment_ind', title: 'Cấp phát TB-234', desc: 'Laptop Dell — Nguyễn Văn An (Phòng Kỹ thuật)', time: 'Hôm nay' },
                    { dot: 'green', icon: 'assignment_ind', title: 'Cấp phát TB-233', desc: 'Màn hình Dell 27" — Phạm Thúy Dung', time: '4 ngày trước' },
                    { dot: 'orange', icon: 'build', title: 'Gửi sửa TB-229', desc: 'Máy chiếu Epson — Lỗi đèn hình', time: '2 tuần trước' },
                    { dot: 'red', icon: 'assignment_return', title: 'Thu hồi TB-215', desc: 'Laptop Lenovo — NV nghỉ việc', time: '1 tháng trước' }
                ]
            }
        },

        'Quản lý xe': {
            title: 'Quản lý xe', badge: 'Hành chính', backPage: 'hanh-chinh',
            stats: [
                { icon: 'directions_car', color: 'blue', value: '8', label: 'Tổng xe công ty' },
                { icon: 'local_taxi', color: 'green', value: '5', label: 'Sẵn sàng' },
                { icon: 'local_shipping', color: 'orange', value: '2', label: 'Đang sử dụng' },
                { icon: 'build', color: 'red', value: '1', label: 'Đang bảo dưỡng' }
            ],
            table: {
                title: 'Lịch điều xe hôm nay', icon: 'departure_board',
                cols: ['Biển số', 'Loại xe', 'Tài xế', 'Người đặt', 'Lộ trình', 'Trạng thái'],
                rows: [
                    ['51A-123.45', 'Toyota Camry', 'Anh Tùng', 'Đặng Văn Phúc', 'VP → Sân bay TSN', 'Đang đi'],
                    ['51A-678.90', 'Ford Transit 16 chỗ', 'Anh Minh', 'Phòng Nhân sự', 'VP → KCN Tân Bình', 'Đang đi'],
                    ['51A-111.22', 'Honda CRV', 'Anh Hùng', 'Nguyễn Văn An', 'VP → Đối tác XYZ', 'Chờ xuất phát'],
                    ['51A-333.44', 'Toyota Innova', 'Anh Tuấn', 'Lê Hoàng Cường', 'VP → Kho Bình Dương', 'Chờ xuất phát'],
                    ['51A-555.66', 'Hyundai Accent', '—', '—', '—', 'Sẵn sàng'],
                    ['51A-777.88', 'Toyota Vios', '—', '—', '—', 'Bảo dưỡng']
                ],
                badgeCols: { 5: { 'Đang đi': 'blue', 'Chờ xuất phát': 'orange', 'Sẵn sàng': 'green', 'Bảo dưỡng': 'red' } }
            },
            chart: {
                title: 'Chi phí nhiên liệu 6 tháng (triệu đ)', icon: 'local_gas_station',
                bars: [
                    { label: 'T11', value: 18, color: '#EA580C' }, { label: 'T12', value: 22, color: '#EA580C' },
                    { label: 'T1', value: 19, color: '#EA580C' }, { label: 'T2', value: 15, color: '#EA580C' },
                    { label: 'T3', value: 24, color: '#EA580C' }, { label: 'T4', value: 8, color: '#F97316' }
                ]
            },
            infoCards: {
                title: 'Đội xe công ty', icon: 'garage',
                items: [
                    { icon: 'directions_car', bg: '#DBEAFE', color: '#2563EB', title: '51A-123.45 · Toyota Camry', desc: 'Sedan 5 chỗ · Đời 2023 · 45,000 km', badge: 'Đang đi', badgeColor: 'blue' },
                    { icon: 'airport_shuttle', bg: '#EDE9FE', color: '#7C3AED', title: '51A-678.90 · Ford Transit', desc: '16 chỗ · Đời 2022 · 62,000 km', badge: 'Đang đi', badgeColor: 'blue' },
                    { icon: 'directions_car', bg: '#DCFCE7', color: '#16A34A', title: '51A-111.22 · Honda CRV', desc: 'SUV 7 chỗ · Đời 2024 · 18,000 km', badge: 'Chờ', badgeColor: 'orange' },
                    { icon: 'directions_car', bg: '#FEF3C7', color: '#D97706', title: '51A-333.44 · Toyota Innova', desc: 'MPV 7 chỗ · Đời 2023 · 35,000 km', badge: 'Chờ', badgeColor: 'orange' },
                    { icon: 'directions_car', bg: '#CCFBF1', color: '#0D9488', title: '51A-555.66 · Hyundai Accent', desc: 'Sedan 5 chỗ · Đời 2024 · 12,000 km', badge: 'Sẵn sàng', badgeColor: 'green' },
                    { icon: 'build', bg: '#FEE2E2', color: '#DC2626', title: '51A-777.88 · Toyota Vios', desc: 'Sedan 5 chỗ · Đời 2021 · Thay lốp + dầu', badge: 'Bảo dưỡng', badgeColor: 'red' }
                ]
            }
        }
    };

    // --- Export thêm các hàm vào API công khai ---
    Object.assign(window.erpApp, {
        // Firebase data access
        _getData: (name) => {
            switch (name) {
                case 'employees': return [...employees];
                case 'contracts': return [...contracts];
                case 'hoSoDocuments': return [...hoSoDocuments];
                case 'congVanList': return [...congVanList];
                default: return [];
            }
        },
        _setData: (name, data) => {
            switch (name) {
                case 'employees': employees = data; break;
                case 'contracts': contracts = data; break;
                case 'hoSoDocuments': hoSoDocuments = data; break;
                case 'congVanList': congVanList = data; break;
            }
            console.log(`📥 Updated local "${name}" with ${data.length} items`);
        },
        _triggerSync: async () => {
            if (window.SyncManager) {
                await window.SyncManager.init();
                // Re-render trang hiện tại sau khi sync
                renderPage();
            }
        },
        empSearch: (val) => {
            empSearchQuery = val;
            empCurrentPage = 1;
            renderHoSoNhanVien();
        },
        empGoPage: (page) => {
            const filtered = getFilteredEmployees();
            const totalPages = Math.ceil(filtered.length / empPageSize);
            if (page < 1 || page > totalPages) return;
            empCurrentPage = page;
            renderHoSoNhanVien();
        },
        openEmpModal: (id) => openEmpModal(id),
        closeEmpModal,
        saveEmployee,
        viewEmployee,
        confirmDeleteEmployee,
        deleteEmployee,
        closeConfirmModal,
        closeViewModal,

        // Avatar upload handlers
        handleAvatarUpload: (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Kiểm tra kích thước (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
                event.target.value = '';
                return;
            }

            // Kiểm tra loại file
            if (!file.type.startsWith('image/')) {
                showToast('Vui lòng chọn file ảnh (JPG, PNG, ...)');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;

                // Cập nhật preview
                const preview = document.getElementById('avatarPreview');
                if (preview) {
                    // Xóa nội dung initials cũ, thêm ảnh
                    const existingImg = preview.querySelector('img');
                    const existingInitials = preview.querySelector('#avatarInitialsPreview');
                    if (existingInitials) existingInitials.remove();
                    if (existingImg) {
                        existingImg.src = base64;
                    } else {
                        const img = document.createElement('img');
                        img.src = base64;
                        img.alt = 'avatar';
                        preview.insertBefore(img, preview.querySelector('.avatar-overlay'));
                    }
                }

                // Lưu vào hidden input
                const dataEl = document.getElementById('empAvatarData');
                if (dataEl) dataEl.value = base64;

                // Hiện nút xóa
                const btnRemove = document.getElementById('btnRemoveAvatar');
                if (btnRemove) btnRemove.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        },

        removeAvatar: () => {
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                const img = preview.querySelector('img');
                if (img) img.remove();

                // Khôi phục initials
                const nameInput = document.getElementById('empName');
                const name = nameInput ? nameInput.value.trim() : '';
                let initials = '?';
                if (name) {
                    const parts = name.split(/\s+/);
                    initials = parts.length >= 2
                        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                        : name.substring(0, 2).toUpperCase();
                }
                if (!preview.querySelector('#avatarInitialsPreview')) {
                    const span = document.createElement('span');
                    span.id = 'avatarInitialsPreview';
                    span.textContent = initials;
                    preview.insertBefore(span, preview.querySelector('.avatar-overlay'));
                }
            }

            // Đánh dấu xóa avatar
            const dataEl = document.getElementById('empAvatarData');
            if (dataEl) dataEl.value = '__REMOVED__';

            // Reset file input
            const fileInput = document.getElementById('empAvatarInput');
            if (fileInput) fileInput.value = '';

            // Ẩn nút xóa
            const btnRemove = document.getElementById('btnRemoveAvatar');
            if (btnRemove) btnRemove.style.display = 'none';
        },

        // === Contract module handlers ===
        ctSearch: (val) => {
            ctSearchQuery = val;
            ctCurrentPage = 1;
            renderHopDongLaoDong();
        },
        ctGoPage: (page) => {
            const filtered = getFilteredContracts();
            const totalPages = Math.ceil(filtered.length / ctPageSize);
            if (page < 1 || page > totalPages) return;
            ctCurrentPage = page;
            renderHopDongLaoDong();
        },
        openContractModal: (id) => openContractModal(id),
        closeContractModal,
        saveContract,
        viewContract,
        closeCtViewModal,
        confirmDeleteContract,
        deleteContract,
        closeCtConfirmModal,

        handleContractFileUpload: (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    showToast(`File "${file.name}" quá lớn! Tối đa 10MB.`);
                    return;
                }

                const ext = file.name.split('.').pop().toLowerCase();
                const fileType = ext === 'pdf' ? 'pdf' : 'doc';
                const sizeStr = file.size > 1024 * 1024
                    ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                    : (file.size / 1024).toFixed(0) + ' KB';

                const reader = new FileReader();
                reader.onload = (e) => {
                    tempContractFiles.push({
                        name: file.name,
                        size: sizeStr,
                        type: fileType,
                        dataUrl: e.target.result
                    });

                    const listEl = document.getElementById('ctFileList');
                    if (listEl) listEl.innerHTML = renderContractFileList(tempContractFiles, true);
                };
                reader.readAsDataURL(file);
            });

            event.target.value = '';
        },

        removeContractFile: (index) => {
            tempContractFiles.splice(index, 1);
            const listEl = document.getElementById('ctFileList');
            if (listEl) listEl.innerHTML = renderContractFileList(tempContractFiles, true);
        },

        previewContractFile: (index, contractId) => {
            let file;
            if (contractId) {
                const ct = contracts.find(c => c.id === contractId);
                if (ct && ct.files && ct.files[index]) file = ct.files[index];
            } else {
                file = tempContractFiles[index];
            }

            if (file && file.dataUrl) {
                const win = window.open('', '_blank');
                if (file.type === 'pdf') {
                    win.document.write(`<iframe src="${file.dataUrl}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
                } else {
                    win.document.write(`<html><head><title>${file.name}</title></head><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>📄 ${file.name}</h2><p>File Word không thể xem trước trực tiếp.<br>Bấm nút bên dưới để tải về.</p><a href="${file.dataUrl}" download="${file.name}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#4A7C4B;color:white;border-radius:8px;text-decoration:none;font-weight:600">⬇ Tải xuống</a></body></html>`);
                }
            } else {
                showToast('File này chưa có dữ liệu để xem.');
            }
        },

        // === Lưu trữ hồ sơ module handlers ===
        hsSearch: (val) => {
            hsSearchQuery = val;
            hsCurrentPage = 1;
            renderLuuTruHoSo();
        },
        hsGoPage: (page) => {
            const filtered = getFilteredHoSo();
            const totalPages = Math.ceil(filtered.length / hsPageSize);
            if (page < 1 || page > totalPages) return;
            hsCurrentPage = page;
            renderLuuTruHoSo();
        },
        hsSetTab: (tab) => {
            hsActiveTab = tab;
            hsCurrentPage = 1;
            renderLuuTruHoSo();
        },
        openHsModal: (id) => openHsModal(id),
        closeHsEditModal,
        saveHoSo,
        viewHoSo,
        closeHsViewModal,
        confirmDeleteHoSo,
        deleteHoSo,
        closeHsDeleteModal,
        openHsUpload: (id) => {
            // Mở modal xem chi tiết (có nút upload)
            viewHoSo(id);
        },
        handleHsFileUpload: (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    showToast(`File "${file.name}" quá lớn! Tối đa 10MB.`);
                    return;
                }
                const ext = file.name.split('.').pop().toLowerCase();
                const fileType = ext === 'pdf' ? 'pdf' : 'doc';
                const sizeStr = file.size > 1024 * 1024
                    ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                    : (file.size / 1024).toFixed(0) + ' KB';
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempHsFiles.push({ name: file.name, size: sizeStr, type: fileType, dataUrl: e.target.result });
                    const listEl = document.getElementById('hsFileList');
                    if (listEl) listEl.innerHTML = renderHsFileList(tempHsFiles, true);
                };
                reader.readAsDataURL(file);
            });
            event.target.value = '';
        },
        handleHsFileUploadDirect: (event, docId) => {
            const doc = hoSoDocuments.find(d => d.id === docId);
            if (!doc) return;
            const files = event.target.files;
            if (!files || files.length === 0) return;
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    showToast(`File "${file.name}" quá lớn! Tối đa 10MB.`);
                    return;
                }
                const ext = file.name.split('.').pop().toLowerCase();
                const fileType = ext === 'pdf' ? 'pdf' : 'doc';
                const sizeStr = file.size > 1024 * 1024
                    ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                    : (file.size / 1024).toFixed(0) + ' KB';
                const reader = new FileReader();
                reader.onload = (e) => {
                    doc.files.push({ name: file.name, size: sizeStr, type: fileType, dataUrl: e.target.result });
                    showToast(`Đã upload "${file.name}" vào ${docId}`);
                    // Re-render modal
                    closeHsViewModal();
                    setTimeout(() => viewHoSo(docId), 250);
                };
                reader.readAsDataURL(file);
            });
            event.target.value = '';
        },
        removeHsFile: (index) => {
            tempHsFiles.splice(index, 1);
            const listEl = document.getElementById('hsFileList');
            if (listEl) listEl.innerHTML = renderHsFileList(tempHsFiles, true);
        },
        previewHsFile: (index, docId) => {
            let file;
            if (docId) {
                const doc = hoSoDocuments.find(d => d.id === docId);
                if (doc && doc.files && doc.files[index]) file = doc.files[index];
            } else {
                file = tempHsFiles[index];
            }
            if (file && file.dataUrl) {
                const win = window.open('', '_blank');
                if (file.type === 'pdf') {
                    win.document.write(`<iframe src="${file.dataUrl}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0"></iframe>`);
                } else {
                    win.document.write(`<html><head><title>${file.name}</title></head><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>📄 ${file.name}</h2><p>File Word không thể xem trước trực tiếp.<br>Bấm nút bên dưới để tải về.</p><a href="${file.dataUrl}" download="${file.name}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#4A7C4B;color:white;border-radius:8px;text-decoration:none;font-weight:600">⬇ Tải xuống</a></body></html>`);
                }
            } else {
                showToast('File này chưa có dữ liệu để xem trước.');
            }
        },

        // === Công văn module handlers ===
        cvSearch: (q) => { cvSearchQuery = q; cvCurrentPage = 1; renderQuanLyCongVan(); },
        cvSetTab: (tab) => { cvActiveTab = tab; cvCurrentPage = 1; renderQuanLyCongVan(); },
        cvToggleSort: () => { cvSortOrder = cvSortOrder === 'desc' ? 'asc' : 'desc'; cvCurrentPage = 1; renderQuanLyCongVan(); },
        cvGoPage: (page) => {
            const filtered = getFilteredCongVan();
            const totalPages = Math.ceil(filtered.length / cvPageSize);
            if (page < 1 || page > totalPages) return;
            cvCurrentPage = page; renderQuanLyCongVan();
        },
        openCvModal: (id) => openCvModal(id),
        closeCvEditModal,
        saveCongVan,
        viewCongVan,
        confirmDeleteCv,
        deleteCongVan,
        closeCvDeleteModal,
        handleCvFileUpload: (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) { showToast(`File "${file.name}" quá lớn! Tối đa 10MB.`); return; }
                const ext = file.name.split('.').pop().toLowerCase();
                const fileType = ext === 'pdf' ? 'pdf' : 'doc';
                const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
                const reader = new FileReader();
                reader.onload = (e) => {
                    tempCvFiles.push({ name: file.name, size: sizeStr, type: fileType, dataUrl: e.target.result });
                    const listEl = document.getElementById('cvFileList');
                    if (listEl) listEl.innerHTML = renderHsFileList(tempCvFiles, true, 'cv-edit');
                };
                reader.readAsDataURL(file);
            });
            event.target.value = '';
        },
        handleCvFileUploadDirect: (event, cvId) => {
            const cv = congVanList.find(c => c.id === cvId);
            if (!cv) return;
            const files = event.target.files;
            if (!files || files.length === 0) return;
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) { showToast(`File "${file.name}" quá lớn! Tối đa 10MB.`); return; }
                const ext = file.name.split('.').pop().toLowerCase();
                const fileType = ext === 'pdf' ? 'pdf' : 'doc';
                const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
                const reader = new FileReader();
                reader.onload = (e) => {
                    cv.files.push({ name: file.name, size: sizeStr, type: fileType, dataUrl: e.target.result });
                    showToast(`Đã upload "${file.name}" vào ${cvId}`);
                    const m = document.getElementById('cvViewModal');
                    if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
                    setTimeout(() => viewCongVan(cvId), 250);
                };
                reader.readAsDataURL(file);
            });
            event.target.value = '';
        },
        previewCvFile: (index, cvId) => {
            let file;
            if (cvId) { const cv = congVanList.find(c => c.id === cvId); if (cv && cv.files && cv.files[index]) file = cv.files[index]; }
            else { file = tempCvFiles[index]; }
            if (file && file.dataUrl) {
                // Xem inline bằng modal
                const previewId = 'cvFilePreviewModal';
                const old = document.getElementById(previewId); if (old) old.remove();
                const modal = document.createElement('div');
                modal.className = 'modal-overlay'; modal.id = previewId;
                let contentHtml;
                if (file.type === 'pdf') {
                    contentHtml = `<iframe src="${file.dataUrl}" style="width:100%;height:75vh;border:none;border-radius:8px"></iframe>`;
                } else {
                    contentHtml = `
                        <div style="text-align:center;padding:40px 20px">
                            <span class="material-icons-outlined" style="font-size:64px;color:#2563EB">description</span>
                            <h3 style="margin:16px 0 8px">📄 ${file.name}</h3>
                            <p style="color:var(--text-secondary);margin-bottom:24px">File Word không thể xem trước trực tiếp trên web.<br>Bấm nút bên dưới để tải về máy.</p>
                            <a href="${file.dataUrl}" download="${file.name}" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--primary);color:white;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                                <span class="material-icons-outlined">download</span> Tải xuống
                            </a>
                        </div>`;
                }
                modal.innerHTML = `<div class="modal-content" style="max-width:900px;max-height:90vh">
                    <div class="modal-header"><h3><span class="material-icons-outlined">${file.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span> ${file.name}</h3>
                        <div style="display:flex;gap:8px">
                            <a href="${file.dataUrl}" download="${file.name}" class="btn-cancel" style="display:flex;align-items:center;gap:4px;text-decoration:none;font-size:13px"><span class="material-icons-outlined" style="font-size:16px">download</span> Tải về</a>
                            <button class="modal-close" onclick="document.getElementById('${previewId}').classList.add('closing');setTimeout(()=>document.getElementById('${previewId}').remove(),200)"><span class="material-icons-outlined">close</span></button>
                        </div>
                    </div>
                    <div class="modal-body" style="padding:12px">${contentHtml}</div>
                </div>`;
                document.body.appendChild(modal);
            } else { showToast('File mẫu — chưa có dữ liệu thực. Hãy upload file mới!'); }
        },
        removeCvFileTemp: (index) => {
            tempCvFiles.splice(index, 1);
            const listEl = document.getElementById('cvFileList');
            if (listEl) listEl.innerHTML = renderHsFileList(tempCvFiles, true, 'cv-edit');
        },
        removeCvFileDirect: (index, cvId) => {
            const cv = congVanList.find(c => c.id === cvId);
            if (!cv || !cv.files) return;
            const fileName = cv.files[index]?.name || 'file';
            if (!confirm(`Xóa file "${fileName}" khỏi công văn ${cvId}?`)) return;
            cv.files.splice(index, 1);
            if (window.CrudSync) window.CrudSync.saveItem('congVanList', cv, 'id');
            showToast(`Đã xóa "${fileName}"`);
            // Refresh view modal
            const m = document.getElementById('cvViewModal');
            if (m) { m.classList.add('closing'); setTimeout(() => m.remove(), 200); }
            setTimeout(() => viewCongVan(cvId), 250);
        },

        // === Attendance module handlers ===
        attPrevMonth: () => {
            attCurrentMonth--;
            if (attCurrentMonth < 0) { attCurrentMonth = 11; attCurrentYear--; }
            renderChamCong();
        },
        attNextMonth: () => {
            attCurrentMonth++;
            if (attCurrentMonth > 11) { attCurrentMonth = 0; attCurrentYear++; }
            renderChamCong();
        },
        attSelectEmp: (empId) => {
            attSelectedEmpId = empId;
            renderChamCong();
        },
        editAttendance: (day) => editAttendance(day),
        closeAttEditModal,
        attSelectStatus: (el, val) => {
            attSelectedStatus = val;
            document.querySelectorAll('.att-status-option').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
        },
        saveAttendance: (day) => {
            const key = `${attCurrentYear}-${String(attCurrentMonth + 1).padStart(2, '0')}`;
            const empId = attSelectedEmpId;

            if (!attendanceData[empId]) attendanceData[empId] = {};
            if (!attendanceData[empId][key]) attendanceData[empId][key] = {};

            const selectedEl = document.querySelector('.att-status-option.selected');
            const status = selectedEl ? selectedEl.getAttribute('onclick').match(/'([^']*)'/)?.[1] || '' : '';
            const ot = parseFloat(document.getElementById('attOtHours').value) || 0;
            const note = document.getElementById('attNote').value.trim();

            if (status === '') {
                delete attendanceData[empId][key][day];
            } else {
                attendanceData[empId][key][day] = { status, ot, note };
            }

            closeAttEditModal();
            renderChamCong();
            showToast(`Đã cập nhật chấm công ngày ${day}/${attCurrentMonth + 1}`);
        }
    });

    // ==========================================
    // Initial Render
    // ==========================================
    initLogin();
    renderPage();

    // Add fadeOut animation for login
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);

})();
