(function () {
    'use strict';

    window.erpApp = window.erpApp || {};

    // --- Data Layer ---
    function loadBiddingData() {
        const defaults = {
            projects: []
        };
        let data = {};
        try {
            data.projects = JSON.parse(localStorage.getItem('erp_bidding_projects')) || defaults.projects;
            // Dữ liệu mô phỏng nếu trống
            if (data.projects.length === 0) {
                data.projects = [
                    {
                        id: 'BID-001',
                        title: 'Thi công xây lắp trường học mầm non Hoa Mai',
                        investor: 'UBND Quận 1',
                        budget: 15000000000, // 15 tỷ
                        status: 'finding', // finding, estimating, submitted, won, lost
                        deadline: '2026-06-15',
                        url: 'https://muasamcong.mpi.gov.vn/',
                        estimatedCost: 0,
                        expectedRevenue: 0
                    },
                    {
                        id: 'BID-002',
                        title: 'Cung cấp thiết bị CNTT cho Bệnh viện Đa Khoa',
                        investor: 'Sở Y tế',
                        budget: 5500000000,
                        status: 'estimating',
                        deadline: '2026-05-30',
                        url: 'https://dauthau.asia/',
                        estimatedCost: 4800000000,
                        expectedRevenue: 700000000
                    }
                ];
                localStorage.setItem('erp_bidding_projects', JSON.stringify(data.projects));
            }
        } catch (e) {
            data = { ...defaults };
        }
        return data;
    }

    function saveBiddingData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getBiddingStatusBadge(status) {
        const map = {
            'finding': { label: 'Đang theo dõi', bg: '#eff6ff', color: '#3b82f6', border: '#dbeafe' },
            'estimating': { label: 'Đang lập dự toán', bg: '#fff7ed', color: '#d97706', border: '#ffedd5' },
            'submitted': { label: 'Đã nộp HSDT', bg: '#f5f3ff', color: '#8b5cf6', border: '#ede9fe' },
            'won': { label: 'Trúng thầu', bg: '#ecfdf5', color: '#10b981', border: '#d1fae5' },
            'lost': { label: 'Trượt thầu', bg: '#fef2f2', color: '#ef4444', border: '#fee2e2' }
        };
        const s = map[status] || { label: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        return `<span style="display:inline-flex; padding:4px 14px; border-radius:20px; font-size:11px; font-weight:800; background:${s.bg}; color:${s.color}; border:1px solid ${s.border};">${s.label}</span>`;
    }

    // ==========================================
    // 1. RENDER MAIN PAGE & SUB-PAGES
    // ==========================================
    window.erpApp.renderDauThau = function (subPage = 'dau-thau') {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        // Luôn đảm bảo biddingPackages được đồng bộ từ window
        const bids = window.biddingPackages || [];

        if (subPage === 'dau-thau-ho-so') {
            window.erpApp.renderHoSoDuThau();
        } else if (subPage === 'dau-thau-goi-thau') {
            window.erpApp.renderTheoDoiGoiThau();
        } else if (subPage === 'dau-thau-ket-qua') {
            window.erpApp.renderKetQuaThau();
        } else {
            renderMainView(pageContent, bids);
        }
    };

    function renderMainView(pageContent, bids) {
        const totalBudget = bids.reduce((s, b) => s + (b.value || 0), 0);
        const wonBids = bids.filter(b => b.status === 'won').length;
        const totalBids = bids.length;
        const winRate = totalBids > 0 ? ((wonBids / totalBids) * 100).toFixed(1) : 0;

        const html = `
            <div class="mkt-module" style="animation:fadeIn 0.4s ease-out; padding:2px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('kinh-doanh')">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e293b;">Hệ thống Đấu Thầu</h2>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <button onclick="document.getElementById('advFilterPanel').style.display = document.getElementById('advFilterPanel').style.display === 'none' ? 'block' : 'none'" style="padding:10px 18px; background:#fff; color:#1e293b; border:1px solid #e2e8f0; border-radius:12px; font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e2e8f0'">
                            <span class="material-icons-outlined" style="font-size:18px;">tune</span> Bộ lọc nâng cao
                        </button>
                        <button onclick="window.erpApp.openBiddingModal()" style="padding:10px 24px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(30, 41, 59, 0.15);">
                            <span class="material-icons-outlined">add_circle</span> Thêm dự án thầu
                        </button>
                    </div>
                </div>

                <!-- Bộ lọc nâng cao -->
                <div id="advFilterPanel" style="display:none; background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:24px; margin-bottom:24px; animation:fadeIn 0.3s ease-out;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="margin:0; font-size:15px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:8px;">
                            <span class="material-icons-outlined" style="color:#3b82f6;">travel_explore</span> Cào dữ liệu từ DauThau.asia
                        </h3>
                        <span style="font-size:11px; color:#94a3b8; font-weight:600; background:#f8fafc; padding:4px 12px; border-radius:20px;">Nguồn: dauthau.asia</span>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Từ khóa chính</label>
                            <input type="text" id="crawlKeyword" placeholder="VD: xây dựng, cầu đường..." style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#1e293b; outline:none; box-sizing:border-box; transition:border 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'" onkeypress="if(event.key==='Enter') window.erpApp.scrapeBidding()">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Tỉnh / Thành phố</label>
                            <select id="crawlProvince" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#1e293b; outline:none; background:#fff; box-sizing:border-box; cursor:pointer;">
                                <option value="">-- Tất cả --</option>
                                <option value="ha-noi">Hà Nội</option>
                                <option value="ho-chi-minh">TP. Hồ Chí Minh</option>
                                <option value="da-nang">Đà Nẵng</option>
                                <option value="hai-phong">Hải Phòng</option>
                                <option value="can-tho">Cần Thơ</option>
                                <option value="binh-duong">Bình Dương</option>
                                <option value="dong-nai">Đồng Nai</option>
                                <option value="quang-ninh">Quảng Ninh</option>
                                <option value="thanh-hoa">Thanh Hóa</option>
                                <option value="nghe-an">Nghệ An</option>
                                <option value="khanh-hoa">Khánh Hòa</option>
                                <option value="bac-ninh">Bắc Ninh</option>
                                <option value="quang-nam">Quảng Nam</option>
                                <option value="ba-ria-vung-tau">Bà Rịa - Vũng Tàu</option>
                                <option value="thai-nguyen">Thái Nguyên</option>
                                <option value="lam-dong">Lâm Đồng</option>
                                <option value="gia-lai">Gia Lai</option>
                                <option value="dak-lak">Đắk Lắk</option>
                                <option value="thua-thien-hue">Thừa Thiên Huế</option>
                                <option value="long-an">Long An</option>
                                <option value="an-giang">An Giang</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Loại thông tin</label>
                            <select id="crawlInfoType" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#1e293b; outline:none; background:#fff; box-sizing:border-box; cursor:pointer;">
                                <option value="tbmt">📢 Thông báo mời thầu</option>
                                <option value="khlcnt">📋 Kế hoạch lựa chọn nhà thầu</option>
                                <option value="khlcnt-tt">📑 Kế hoạch tổng thể LCNT</option>
                                <option value="du-an">🏗️ Dự án đầu tư phát triển</option>
                                <option value="kqmt">📊 Kết quả mở thầu</option>
                                <option value="kqlcnt">✅ Kết quả lựa chọn nhà thầu</option>
                                <option value="mst">📝 Thông báo mời sơ tuyển</option>
                                <option value="mqt">🔍 Thông báo mời quan tâm</option>
                                <option value="kqst">📋 Kết quả sơ tuyển nhà thầu</option>
                                <option value="kqmqt">📋 Kết quả mời quan tâm nhà thầu</option>
                                <option value="kq-mo-st">📂 Kết quả mở sơ tuyển</option>
                                <option value="kq-mo-qt">📂 Kết quả mở quan tâm</option>
                                <option value="ycbg">📩 Yêu cầu báo giá</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Lĩnh vực</label>
                            <select id="crawlSector" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#1e293b; outline:none; background:#fff; box-sizing:border-box; cursor:pointer;">
                                <option value="">-- Tất cả --</option>
                                <option value="xay-lap">🏗️ Xây lắp</option>
                                <option value="hang-hoa">📦 Hàng hóa</option>
                                <option value="tu-van">📋 Tư vấn</option>
                                <option value="phi-tu-van">🔧 Phi tư vấn</option>
                                <option value="hon-hop">🔀 Hỗn hợp</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:12px; border-top:1px solid #f1f5f9;">
                        <button onclick="window.erpApp.showMonitoredKeywords()" style="margin-right:auto; padding:10px 20px; background:#fff; color:#3b82f6; border:1px solid #3b82f6; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">notifications_active</span> DS Theo dõi tự động
                        </button>
                        <button onclick="document.getElementById('crawlKeyword').value=''; document.getElementById('crawlProvince').value=''; document.getElementById('crawlSector').value=''; document.getElementById('crawlInfoType').value='tbmt';" style="padding:10px 20px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:16px;">restart_alt</span> Đặt lại
                        </button>
                        <button onclick="window.erpApp.monitorBiddingKeyword()" style="padding:10px 20px; background:#f0f9ff; color:#0369a1; border:1px solid #bae6fd; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-outlined" style="font-size:18px;">notification_add</span> Tự động theo dõi từ khóa này
                        </button>
                        <button onclick="window.erpApp.scrapeBidding()" style="padding:10px 28px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:#fff; border:none; border-radius:12px; font-weight:800; font-size:13px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 16px rgba(59, 130, 246, 0.25); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <span class="material-icons-outlined">travel_explore</span> Tìm kiếm & Cào dữ liệu
                        </button>
                    </div>
                </div>

                <!-- Module Selection Grid -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:16px; margin-bottom:28px;">
                    <div class="premium-card" onclick="window.erpApp.navigateTo('dau-thau-ho-so')" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:20px; cursor:pointer; display:flex; align-items:center; gap:16px; transition:all 0.3s;" onmouseover="this.style.borderColor='#8b5cf6'; this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 20px -10px rgba(139, 92, 246, 0.15)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="width:48px; height:48px; border-radius:14px; background:#f5f3ff; color:#8b5cf6; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">folder_shared</span></div>
                        <div>
                            <div style="font-weight:900; font-size:14px; color:#1e293b;">Hồ sơ dự thầu</div>
                            <div style="font-size:11px; color:#94a3b8; font-weight:600;">Quản lý hồ sơ dự thầu, hồ sơ năng lực và pháp lý thầu.</div>
                        </div>
                    </div>
                    <div class="premium-card" onclick="window.erpApp.navigateTo('dau-thau-goi-thau')" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:20px; cursor:pointer; display:flex; align-items:center; gap:16px; transition:all 0.3s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 20px -10px rgba(59, 130, 246, 0.15)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="width:48px; height:48px; border-radius:14px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">track_changes</span></div>
                        <div>
                            <div style="font-weight:900; font-size:14px; color:#1e293b;">Theo dõi các gói thầu</div>
                            <div style="font-size:11px; color:#94a3b8; font-weight:600;">Theo dõi tiến độ, trạng thái và các mốc thời gian quan trọng của các gói thầu.</div>
                        </div>
                    </div>
                    <div class="premium-card" onclick="window.erpApp.navigateTo('dau-thau-ket-qua')" style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:20px; cursor:pointer; display:flex; align-items:center; gap:16px; transition:all 0.3s;" onmouseover="this.style.borderColor='#10b981'; this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 20px -10px rgba(16, 185, 129, 0.15)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="width:48px; height:48px; border-radius:14px; background:#fff7ed; color:#f59e0b; display:flex; align-items:center; justify-content:center;"><span class="material-icons-outlined">assignment_turned_in</span></div>
                        <div>
                            <div style="font-weight:900; font-size:14px; color:#1e293b;">Theo dõi kết quả thầu</div>
                            <div style="font-size:11px; color:#94a3b8; font-weight:600;">Theo dõi kết quả mở thầu, xếp hạng và thông báo kết quả.</div>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:28px;">
                    <div style="background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:#fff; padding:22px; border-radius:20px; box-shadow:0 8px 24px rgba(124, 58, 237, 0.2);">
                        <div style="font-size:10px; font-weight:800; opacity:0.75; text-transform:uppercase; letter-spacing:1px;">Tổng ngân sách gói thầu</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px;">${window.erpApp.formatValue(totalBudget)} đ</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Đang theo dõi</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#1e293b;">${bids.filter(b => b.status === 'finding' || b.status === 'estimating').length}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Trúng thầu</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#10b981;">${wonBids}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; padding:22px; border-radius:20px;">
                        <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Tỉ lệ thắng thầu</div>
                        <div style="font-size:24px; font-weight:900; margin-top:6px; color:#3b82f6;">${winRate}%</div>
                    </div>
                </div>

                <div class="premium-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:24px; overflow:hidden;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="margin:0; font-size:15px; font-weight:900; color:#1e293b;">Danh sách các cơ hội đấu thầu</h3>
                        <div style="display:flex; gap:10px;">
                            <button onclick="window.erpApp.showMonitoredKeywords()" style="padding:8px 14px; background:#fff; color:#3b82f6; border:1px solid #3b82f6; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                <span class="material-icons-outlined" style="font-size:16px;">notifications_active</span> Theo dõi tự động
                            </button>
                            <button onclick="window.erpApp.deleteSelectedBiddings()" style="padding:8px 14px; background:#fef2f2; color:#ef4444; border:1px solid #fee2e2; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                                <span class="material-icons-outlined" style="font-size:16px;">delete</span> Xóa mục đã chọn
                            </button>
                            <button onclick="window.erpApp.clearAllBiddings()" style="padding:8px 14px; background:#fff; color:#ef4444; border:1px solid #ef4444; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='#fff'; this.style.color='#ef4444'">
                                <span class="material-icons-outlined" style="font-size:16px;">delete_sweep</span> Làm sạch dữ liệu
                            </button>
                        </div>
                    </div>
                    <div style="overflow-x:auto; cursor:grab;" onmousedown="this.isDown=true; this.startX=event.pageX-this.offsetLeft; this.scrollLeftStart=this.scrollLeft; this.style.cursor='grabbing';" onmouseleave="this.isDown=false; this.style.cursor='grab';" onmouseup="this.isDown=false; this.style.cursor='grab';" onmousemove="if(!this.isDown) return; event.preventDefault(); const x=event.pageX-this.offsetLeft; const walk=(x-this.startX)*2; this.scrollLeft=this.scrollLeftStart-walk;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="border-bottom:2px solid #f1f5f9;">
                                    <th style="padding:14px 12px; width:40px; text-align:center;"><input type="checkbox" onclick="window.erpApp.toggleAllBiddingChecks(this.checked)" style="cursor:pointer; width:16px; height:16px;"></th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Tên gói thầu</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:left;">Chủ đầu tư / Nguồn</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:right;">Ngân sách dự kiến</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Hạn nộp HSDT</th>
                                    <th style="padding:14px 12px; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; text-align:center;">Trạng thái</th>
                                    <th style="padding:14px 12px; width:120px;">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bids.map(b => {
            const isWon = b.status === 'won';
            const pkgName = b.name || b.title || 'Chưa có tên gói thầu';
            const pkgCustomer = b.customer || b.investor || 'Chưa rõ chủ đầu tư';
            const pkgValue = b.value || b.budget || 0;
            const pkgDate = b.closingDate || b.deadline || '---';

            return `
                                    <tr style="border-bottom:1px solid #f8fafc; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#fbfcfe'" onmouseout="this.style.background='transparent'">
                                        <td style="padding:16px 12px; text-align:center;" onclick="event.stopPropagation()">
                                            <input type="checkbox" class="bidding-checkbox" value="${b.id}" style="cursor:pointer; width:16px; height:16px;">
                                        </td>
                                        <td style="padding:16px 12px;" onclick="window.erpApp.openBiddingModal('${b.id}')">
                                            <div style="font-weight:800; color:#1e293b; font-size:13px;">${pkgName}</div>
                                            <div style="font-size:11px; color:#94a3b8; font-weight:600; margin-top:2px;">${b.id}</div>
                                        </td>
                                        <td style="padding:16px 12px; font-size:12px; color:#475569;" onclick="window.erpApp.openBiddingModal('${b.id}')">
                                            <div style="font-weight:700;">${pkgCustomer}</div>
                                            ${b.url ? `<a href="${b.url}" target="_blank" style="color:#3b82f6; font-size:11px; font-weight:700; text-decoration:none;" onclick="event.stopPropagation()">Mở liên kết <span class="material-icons-outlined" style="font-size:10px; vertical-align:middle;">open_in_new</span></a>` : ''}
                                        </td>
                                        <td style="padding:16px 12px; font-weight:800; color:#1e293b; text-align:right; font-size:13px;" onclick="window.erpApp.openBiddingModal('${b.id}')">${window.erpApp.formatValue(pkgValue)} đ</td>
                                        <td style="padding:16px 12px; font-weight:900; color:#8b5cf6; text-align:center;" onclick="window.erpApp.openBiddingModal('${b.id}')">${pkgDate === '---' ? '---' : (window.erpApp.formatDate ? window.erpApp.formatDate(pkgDate) : pkgDate)}</td>
                                        <td style="padding:16px 12px; text-align:center;" onclick="window.erpApp.openBiddingModal('${b.id}')">${getBiddingStatusBadge(b.status)}</td>
                                        <td style="padding:16px 12px; text-align:right;">
                                            <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                                                ${isWon && !b.isConverted ? `
                                                    <button onclick="window.erpApp.convertBidToProject('${b.id}')" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:10px; padding:8px 14px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 10px rgba(16, 185, 129, 0.2); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                                        <span class="material-icons-outlined" style="font-size:16px;">rocket_launch</span> Tạo Dự án
                                                    </button>
                                                ` : (b.status === 'finding' ? `
                                                    <button onclick="window.erpApp.prepareBiddingDoc('${b.id}')" style="background:#f0f9ff; color:#0369a1; border:1px solid #bae6fd; border-radius:10px; padding:8px 14px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'">
                                                        <span class="material-icons-outlined" style="font-size:16px;">assignment</span> Chuẩn bị thầu
                                                    </button>
                                                ` : `
                                                    <button onclick="window.erpApp.estimateBidding('${b.id}')" style="background:#eff6ff; color:#3b82f6; border:1px solid #dbeafe; border-radius:10px; padding:8px 14px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#dbeafe'">
                                                        <span class="material-icons-outlined" style="font-size:16px;">calculate</span> Dự toán
                                                    </button>
                                                `)}
                                                <button onclick="window.erpApp.deleteBidding('${b.id}')" style="background:#fff; color:#ef4444; border:1px solid #fee2e2; border-radius:10px; padding:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.02);" title="Xóa" onmouseover="this.style.background='#fef2f2'">
                                                    <span class="material-icons-outlined" style="font-size:20px;">delete_outline</span>
                                                </button>
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

    // --- Phân hệ con: Hồ sơ dự thầu ---
    window.erpApp.renderHoSoDuThau = () => {
        let html = `
            <div class="bidding-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="page-top-bar" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('dau-thau')" style="padding:8px 16px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; color:#64748b;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="font-size:18px; font-weight:900; color:#1e293b; margin:0;">Hồ sơ dự thầu</h2>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div style="display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; padding:8px 14px; border-radius:12px;">
                            <input type="checkbox" onclick="window.erpApp.toggleAllBiddingChecks(this.checked)" style="cursor:pointer; width:16px; height:16px;" id="selectAllHoso">
                            <label for="selectAllHoso" style="font-size:13px; font-weight:600; color:#475569; cursor:pointer;">Chọn tất cả</label>
                        </div>
                        <button onclick="window.erpApp.deleteSelectedBiddings()" style="padding:10px 14px; background:#fef2f2; color:#ef4444; border:1px solid #fee2e2; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                            <span class="material-icons-outlined" style="font-size:16px;">delete</span> Xóa mục đã chọn
                        </button>
                        <button class="pb-btn-add" onclick="window.erpApp.openBiddingModal()" style="padding:10px 20px; border-radius:12px; border:none; background:#8b5cf6; color:#fff; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; box-shadow:0 4px 6px -1px rgba(139, 92, 246, 0.3);">
                            <span class="material-icons-outlined">add</span> Tạo gói thầu mới
                        </button>
                    </div>
                </div>

                <div class="bidding-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:24px;">
                    <div style="background:#fff; padding:20px; border-radius:16px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">assignment</span>
                        </div>
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:600;">Tổng gói thầu</div>
                            <div style="font-size:20px; font-weight:800; color:#1e293b;">${window.biddingPackages.length}</div>
                        </div>
                    </div>
                    <div style="background:#fff; padding:20px; border-radius:16px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:#fefce8; color:#eab308; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">pending_actions</span>
                        </div>
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:600;">Đang nộp/Chờ KQ</div>
                            <div style="font-size:20px; font-weight:800; color:#1e293b;">${window.biddingPackages.filter(p => p.status === 'submitted').length}</div>
                        </div>
                    </div>
                    <div style="background:#fff; padding:20px; border-radius:16px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:#f0fdf4; color:#22c55e; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">emoji_events</span>
                        </div>
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:600;">Gói thầu đã trúng</div>
                            <div style="font-size:20px; font-weight:800; color:#1e293b;">${window.biddingPackages.filter(p => p.status === 'won').length}</div>
                        </div>
                    </div>
                    <div style="background:#fff; padding:20px; border-radius:16px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:#fdf2f2; color:#ef4444; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">monetization_on</span>
                        </div>
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:600;">Tổng giá trị trúng</div>
                            <div style="font-size:20px; font-weight:800; color:#1e293b;">${Math.round(window.biddingPackages.filter(p => p.status === 'won').reduce((sum, p) => sum + (p.value || 0), 0) / 1000000000)} Tỷ</div>
                        </div>
                    </div>
                </div>

                <div class="bidding-grid" style="display:grid; grid-template-columns: 1fr; gap:20px;">
                    ${window.biddingPackages.filter(p => p.status !== 'finding' && p.status !== 'won' && p.status !== 'lost').map(pkg => `
                        <div class="bidding-card" style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; overflow:hidden; transition:all 0.3s; cursor:pointer;" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 10px 25px -5px rgba(59,130,246,0.1)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                            <div style="padding:24px; display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="flex:1;">
                                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                                        <span style="font-size:11px; font-weight:800; padding:4px 10px; background:#f1f5f9; color:#475569; border-radius:6px; text-transform:uppercase;">${pkg.id}</span>
                                        <span style="font-size:11px; font-weight:800; padding:4px 10px; background:${getStatusColor(pkg.status).bg}; color:${getStatusColor(pkg.status).text}; border-radius:6px; text-transform:uppercase;">${getStatusLabel(pkg.status)}</span>
                                    </div>
                                    <h3 style="font-size:18px; font-weight:800; color:#1e293b; margin:0 0 12px 0; line-height:1.4;">${pkg.name}</h3>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                        <div>
                                            <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Dự án:</div>
                                            <div style="font-size:13px; font-weight:600; color:#475569;">${pkg.project}</div>
                                        </div>
                                        <div>
                                            <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Chủ đầu tư:</div>
                                            <div style="font-size:13px; font-weight:600; color:#475569;">${pkg.customer}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="text-align:right; min-width:180px;">
                                    <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Giá trị gói thầu (VNĐ):</div>
                                    <div style="font-size:22px; font-weight:900; color:#3b82f6;">${window.erpApp.formatValue(pkg.value)}</div>
                                    <div style="margin-top:12px;">
                                        <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Hạn nộp hồ sơ:</div>
                                        <div style="font-size:13px; font-weight:700; color:#ef4444; display:flex; align-items:center; justify-content:flex-end; gap:4px;">
                                            <span class="material-icons-outlined" style="font-size:16px;">event</span>
                                            ${window.erpApp.formatDate(pkg.closingDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                                <div style="display:flex; align-items:center; gap:16px;">
                                    <input type="checkbox" class="bidding-checkbox" value="${pkg.id}" onclick="event.stopPropagation()" style="cursor:pointer; width:18px; height:18px;">
                                    <span style="font-size:13px; color:#64748b; display:flex; align-items:center; gap:6px;">
                                        <span class="material-icons-outlined" style="font-size:16px;">description</span> ${pkg.documents ? pkg.documents.length : 0} tài liệu
                                    </span>
                                </div>
                                <div style="display:flex; gap:10px; align-items:center;">
                                    <button onclick="event.stopPropagation(); window.erpApp.deleteBidding('${pkg.id}')" style="width:36px; height:36px; border:1px solid #fee2e2; background:#fff; color:#ef4444; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'" title="Xóa hồ sơ này">
                                        <span class="material-icons-outlined" style="font-size:18px;">delete_outline</span>
                                    </button>
                                    <button style="padding:8px 16px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;" onclick="window.erpApp.openBiddingModal('${pkg.id}')">Sửa HS</button>
                                    <button style="padding:8px 20px; border:none; background:#1e293b; color:#fff; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;" onclick="window.erpApp.estimateBidding('${pkg.id}')">Lập dự toán</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        window.pageContent.innerHTML = html;
        window.pageContent.scrollTop = 0;
    };

    window.erpApp.renderTheoDoiGoiThau = () => {
        const stages = [
            { id: 'preparing', title: 'Chuẩn bị HS', icon: 'edit_note', color: '#3b82f6' },
            { id: 'submitted', title: 'Đã nộp thầu', icon: 'send', color: '#f59e0b' },
            { id: 'opening', title: 'Mở thầu', icon: 'visibility', color: '#8b5cf6' },
            { id: 'evaluating', title: 'Chấm thầu', icon: 'fact_check', color: '#06b6d4' },
            { id: 'result', title: 'Kết quả', icon: 'emoji_events', color: '#10b981' }
        ];

        let html = `
            <div class="tracking-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="page-top-bar" style="margin-bottom:20px; display:flex; align-items:center; gap:15px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('dau-thau')" style="padding:8px 16px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; color:#64748b;">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                    <h2 style="font-size:18px; font-weight:900; color:#1e293b; margin:0;">Theo dõi tiến độ các gói thầu</h2>
                </div>

                <div class="kanban-board" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:16px; min-height:600px; overflow-x:auto; padding-bottom:20px;">
                    ${stages.map(stage => {
            const pkgs = window.biddingPackages.filter(p => {
                if (stage.id === 'result') { return p.status === 'won' || p.status === 'lost'; }
                if (stage.id === 'preparing') { return p.status === 'preparing' || p.status === 'estimating' || !p.status; }
                return p.status === stage.id;
            });

            return `
                            <div class="kanban-column" style="background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; padding:16px; display:flex; flex-direction:column; gap:12px; min-width:280px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:32px; height:32px; border-radius:8px; background:${stage.color}15; color:${stage.color}; display:flex; align-items:center; justify-content:center;">
                                            <span class="material-icons-outlined" style="font-size:18px;">${stage.icon}</span>
                                        </div>
                                        <span style="font-size:14px; font-weight:700; color:#1e293b;">${stage.title}</span>
                                    </div>
                                    <span style="font-size:12px; font-weight:700; background:#fff; color:#64748b; padding:2px 8px; border-radius:10px; border:1px solid #e2e8f0;">${pkgs.length}</span>
                                </div>

                                <div class="kanban-cards" style="display:flex; flex-direction:column; gap:12px;">
                                    ${pkgs.map(pkg => `
                                        <div class="kanban-card" style="background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05); transition:transform 0.2s; cursor:grab;" onmouseover="this.style.borderColor='${stage.color}'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='none'">
                                            <div style="font-size:10px; font-weight:800; color:${stage.color}; margin-bottom:4px; text-transform:uppercase;">${pkg.id}</div>
                                            <div style="font-size:13px; font-weight:700; color:#1e293b; line-height:1.4; margin-bottom:8px;">${pkg.name}</div>
                                            <div style="font-size:11px; color:#64748b; margin-bottom:10px; display:flex; align-items:center; gap:4px;">
                                                <span class="material-icons-outlined" style="font-size:14px;">business</span> ${pkg.customer}
                                            </div>
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed #e2e8f0;">
                                                <div style="font-size:12px; font-weight:800; color:#3b82f6;">${Math.round((pkg.value || 0) / 1000000000)} Tỷ</div>
                                                <div style="display:flex; align-items:center; gap:4px;">
                                                    <select onchange="window.erpApp.updateBiddingStatus('${pkg.id}', this.value)" style="font-size:10px; padding:2px; border:none; background:#f1f5f9; border-radius:4px; color:#64748b; cursor:pointer; outline:none;">
                                                        <option value="preparing" ${pkg.status === 'preparing' ? 'selected' : ''}>HS</option>
                                                        <option value="submitted" ${pkg.status === 'submitted' ? 'selected' : ''}>Nộp</option>
                                                        <option value="opening" ${pkg.status === 'opening' ? 'selected' : ''}>Mở</option>
                                                        <option value="evaluating" ${pkg.status === 'evaluating' ? 'selected' : ''}>Chấm</option>
                                                        <option value="won" ${pkg.status === 'won' ? 'selected' : ''}>Trúng</option>
                                                        <option value="lost" ${pkg.status === 'lost' ? 'selected' : ''}>Trượt</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        window.pageContent.innerHTML = html;
        window.pageContent.scrollTop = 0;
    };

    window.erpApp.renderKetQuaThau = () => {
        const results = window.biddingPackages.filter(p => p.status === 'won' || p.status === 'lost');

        let html = `
            <div class="bidding-results-module" style="animation: fadeIn 0.4s ease-out;">
                <div class="page-top-bar" style="margin-bottom:30px; display:flex; align-items:center; gap:15px;">
                    <button class="back-btn" onclick="window.erpApp.navigateTo('dau-thau')" style="padding:8px 16px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; color:#64748b;">
                        <span class="material-icons-outlined">arrow_back</span> Quay lại
                    </button>
                    <div>
                        <h2 style="font-size:22px; font-weight:900; color:#1e293b; margin:0;">Theo dõi Kết quả thầu</h2>
                        <p style="margin:2px 0 0 0; font-size:13px; color:#64748b; font-weight:600;">Tổng hợp kết quả thắng thầu và xếp hạng dự án</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px;">
                    <div style="background:#fff; border-radius:24px; border:1px solid #e2e8f0; padding:32px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.04);">
                        <h3 style="margin:0 0 24px 0; font-size:18px; font-weight:900; color:#1e293b; display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined" style="color:#10b981;">emoji_events</span> Danh sách Kết quả thầu
                        </h3>
                        
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            ${results.length === 0 ? `
                                <div style="text-align:center; padding:60px; background:#f8fafc; border-radius:20px; border:2px dashed #e2e8f0;">
                                    <span class="material-icons-outlined" style="font-size:48px; color:#cbd5e1; margin-bottom:16px;">assignment_turned_in</span>
                                    <div style="color:#64748b; font-weight:700;">Chưa có kết quả thầu nào được ghi nhận</div>
                                </div>
                            ` : results.map(pkg => {
            const isWon = pkg.status === 'won';
            return `
                                    <div style="border:1px solid #f1f5f9; border-radius:20px; padding:20px; background:${isWon ? '#f0fdf4' : '#fef2f2'}; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;">
                                        <div style="display:flex; gap:20px; align-items:center;">
                                            <div style="width:56px; height:56px; border-radius:16px; background:#fff; display:flex; align-items:center; justify-content:center; color:${isWon ? '#10b981' : '#ef4444'}; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                                                <span class="material-icons-outlined" style="font-size:32px;">${isWon ? 'military_tech' : 'close'}</span>
                                            </div>
                                            <div>
                                                <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:4px;">${pkg.id} • ${pkg.project}</div>
                                                <h4 style="margin:0; font-size:16px; font-weight:900; color:#1e293b;">${pkg.name}</h4>
                                                <div style="font-size:13px; color:#64748b; font-weight:600; margin-top:4px;">Đối tác: ${pkg.customer}</div>
                                            </div>
                                        </div>
                                        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                                            <div style="font-size:18px; font-weight:950; color:#1e293b;">${window.erpApp.formatValue(pkg.value)} <span style="font-size:12px; color:#94a3b8;">đ</span></div>
                                            <div style="display:inline-flex; align-items:center; gap:6px; background:#fff; padding:4px 12px; border-radius:10px; font-size:11px; font-weight:850; color:${isWon ? '#10b981' : '#ef4444'}; border:1px solid ${isWon ? '#10b981' : '#ef4444'}20;">
                                                <span class="material-icons-outlined" style="font-size:16px;">${isWon ? 'check_circle' : 'cancel'}</span>
                                                ${isWon ? 'TRÚNG THẦU' : 'KHÔNG TRÚNG'}
                                            </div>
                                            ${isWon && !pkg.isConverted ? `
                                                <button onclick="window.erpApp.convertBidToProject('${pkg.id}')" style="margin-top:4px; padding:8px 16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:none; border-radius:10px; font-weight:800; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 10px rgba(16, 185, 129, 0.2); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(16, 185, 129, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(16, 185, 129, 0.2)'">
                                                    <span class="material-icons-outlined" style="font-size:16px;">rocket_launch</span> DUYỆT & CHUYỂN DỰ ÁN
                                                </button>
                                            ` : (pkg.isConverted ? `
                                                <div style="margin-top:8px; color:#64748b; font-size:11px; font-weight:800; display:flex; align-items:center; gap:6px; background:#f1f5f9; padding:6px 12px; border-radius:8px;">
                                                    <span class="material-icons-outlined" style="font-size:16px; color:#10b981;">task_alt</span> ĐÃ CHUYỂN DỰ ÁN
                                                </div>
                                            ` : '')}
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:24px;">
                        <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:24px; padding:32px; color:#fff; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
                            <h3 style="margin:0 0 20px 0; font-size:16px; font-weight:800; opacity:0.9;">Tỷ lệ thắng thầu</h3>
                            <div style="text-align:center;">
                                <div style="font-size:48px; font-weight:950; margin-bottom:10px;">${results.length > 0 ? Math.round((results.filter(p => p.status === 'won').length / results.length) * 100) : 0}%</div>
                            </div>
                            <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:10px; margin-top:24px; overflow:hidden;">
                                <div style="width:${results.length > 0 ? (results.filter(p => p.status === 'won').length / results.length) * 100 : 0}%; height:100%; background:#10b981;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        window.pageContent.innerHTML = html;
        window.pageContent.scrollTop = 0;
    };

    // Helper functions (Internal use)
    function getStatusColor(status) {
        switch (status) {
            case 'preparing': return { bg: '#eff6ff', text: '#3b82f6' };
            case 'submitted': return { bg: '#fff7ed', text: '#f97316' };
            case 'won': return { bg: '#f0fdf4', text: '#22c55e' };
            case 'lost': return { bg: '#fef2f2', text: '#ef4444' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    }

    function getStatusLabel(status) {
        switch (status) {
            case 'preparing': return 'Đang chuẩn bị';
            case 'submitted': return 'Đã nộp thầu';
            case 'won': return 'Trúng thầu';
            case 'lost': return 'Không trúng';
            default: return 'Khác';
        }
    }

    // ==========================================
    // 2. MODALS & ACTIONS (Nguyên bản từ PM)
    // ==========================================
    window.erpApp.openBiddingModal = function () {
        const modalHtml = `
            <div class="modal-overlay" id="biddingModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div class="modal-content" style="width:600px; max-width:95%; background:#fff; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); border-radius:20px; overflow:hidden; animation:modalPop 0.3s ease-out;">
                    <div class="modal-header" style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding:20px 24px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="material-icons-outlined">assignment_add</span>
                            <h2 style="margin:0; font-size:16px; font-weight:700;">Tạo gói thầu mới</h2>
                        </div>
                        <button onclick="window.erpApp.closeBiddingModal()" style="border:none; background:none; cursor:pointer; color:#fff; opacity:0.7;"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <form id="biddingForm" style="padding:24px;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
                            <div class="form-group">
                                <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Mã gói thầu</label>
                                <input type="text" name="id" value="GT-${Date.now().toString().slice(-4)}" required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Hạn nộp hồ sơ</label>
                                <input type="text" name="closingDate" class="erp-datepicker" placeholder="DD/MM/YYYY" required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tên gói thầu</label>
                            <input type="text" name="name" placeholder="Ví dụ: Thi công xây lắp cầu..." required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Dự án</label>
                            <input type="text" name="project" placeholder="Nhập tên dự án tổng thể" required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:24px;">
                            <div class="form-group">
                                <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Chủ đầu tư</label>
                                <input type="text" name="customer" required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                            <div class="form-group">
                                <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Giá trị (VNĐ)</label>
                                <input type="text" name="value" oninput="window.erpApp.formatValue(this)" placeholder="Nhập số tiền" required style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none;">
                            </div>
                        </div>
                        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #f1f5f9; padding-top:20px;">
                            <button type="button" onclick="window.erpApp.closeBiddingModal()" style="padding:10px 20px; border:1px solid #e2e8f0; background:#fff; color:#64748b; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px;">Hủy bỏ</button>
                            <button type="button" onclick="window.erpApp.saveBiddingPackage()" style="padding:10px 24px; border:none; background:#3b82f6; color:#fff; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px; box-shadow:0 4px 6px -1px rgba(59,130,246,0.3);">Lưu gói thầu</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        if (window.flatpickr) {
            flatpickr(document.querySelectorAll('#biddingModal .erp-datepicker'), {
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    };

    window.erpApp.closeBiddingModal = function () {
        const modal = document.getElementById('biddingModal');
        if (modal) { modal.remove(); }
    };

    window.erpApp.saveBiddingPackage = function () {
        const form = document.getElementById('biddingForm');
        if (!form) { return; }

        const formData = new FormData(form);
        const newPackage = {
            id: formData.get('id'),
            name: formData.get('name'),
            project: formData.get('project'),
            customer: formData.get('customer'),
            value: window.erpApp.parseVND(formData.get('value')),
            closingDate: window.erpApp.parseInputDate(formData.get('closingDate')),
            status: 'preparing',
            documents: [
                { title: 'Hồ sơ năng lực (HSNL)', status: 'processing', updated: new Date().toLocaleDateString('vi-VN') },
                { title: 'Biện pháp thi công (BPTC)', status: 'processing', updated: new Date().toLocaleDateString('vi-VN') }
            ]
        };

        window.biddingPackages.unshift(newPackage);
        localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));

        if (window.CrudSync) {
            window.CrudSync.saveItem('biddingPackages', newPackage, 'id');
        }

        window.erpApp.showToast('Đã tạo gói thầu mới thành công!', 'success');
        window.erpApp.closeBiddingModal();
        window.erpApp.renderHoSoDuThau();
    };

    window.erpApp.updateBiddingStatus = function (pkgId, newStatus) {
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (pkg) {
            pkg.status = newStatus;
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));

            if (window.CrudSync) {
                window.CrudSync.saveItem('biddingPackages', pkg, 'id');
            }

            window.erpApp.showToast(`Đã cập nhật trạng thái gói thầu ${pkgId}`, 'success');

            // Re-render appropriate view
            if (window.erpApp.currentPage === 'dau-thau-goi-thau') {
                window.erpApp.renderTheoDoiGoiThau();
            } else if (window.erpApp.currentPage === 'dau-thau-ho-so') {
                window.erpApp.renderHoSoDuThau();
            }
        }
    };

    window.erpApp.estimateBidding = function (id) {
        const pkg = window.biddingPackages.find(p => p.id === id);
        if (!pkg) return;

        // Khởi tạo BOQ nếu chưa có
        if (!pkg.boq) pkg.boq = [];

        const modalHtml = `
            <div class="modal-overlay" id="estimatorModal" style="background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <div class="modal-content" style="width:1000px; max-width:95%; height:85vh; background:#fff; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); border-radius:24px; overflow:hidden; display:flex; flex-direction:column; animation:modalPop 0.3s ease-out;">
                    <div class="modal-header" style="background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding:20px 32px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; background:rgba(255,255,255,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                                <span class="material-icons-outlined">calculate</span>
                            </div>
                            <div>
                                <h2 style="margin:0; font-size:18px; font-weight:800;">Lập dự toán: ${pkg.name}</h2>
                                <p style="margin:2px 0 0 0; font-size:12px; opacity:0.8; font-weight:600;">Mã gói: ${pkg.id} | Khách hàng: ${pkg.customer}</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('estimatorModal').remove()" style="border:none; background:rgba(255,255,255,0.2); color:#fff; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="modal-body" style="flex:1; overflow-y:auto; padding:32px; background:#f8fafc;">
                        <!-- Toolbar Tìm kiếm -->
                        <div style="background:#fff; padding:20px; border-radius:20px; border:1px solid #e2e8f0; margin-bottom:24px; display:flex; gap:16px; align-items:flex-end;">
                            <div style="flex:1; position:relative;">
                                <label style="display:block; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Tìm kiếm hàng hóa/vật tư từ kho</label>
                                <div style="position:relative;">
                                    <span class="material-icons-outlined" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;">search</span>
                                    <input type="text" id="estimatorSearch" placeholder="Nhập tên vật tư, thiết bị hoặc mã hàng..." style="width:100%; padding:12px 12px 12px 40px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:14px; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#3b82f6'" oninput="window.erpApp.searchEstimatorItems(this.value)">
                                </div>
                                <!-- Dropdown kết quả -->
                                <div id="estimatorResults" style="position:absolute; top:100%; left:0; width:100%; background:#fff; border:1px solid #e2e8f0; border-radius:12px; margin-top:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:10; display:none; max-height:300px; overflow-y:auto;">
                                </div>
                            </div>
                            <button onclick="window.erpApp.addCustomEstimatorItem()" style="padding:12px 24px; background:#f1f5f9; color:#475569; border:none; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:8px;">
                                <span class="material-icons-outlined">add</span> Thêm dòng trống
                            </button>
                        </div>

                        <!-- Bảng BOQ -->
                        <div style="background:#fff; border-radius:24px; border:1px solid #e2e8f0; overflow:hidden;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
                                        <th style="padding:16px; text-align:center; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; width:50px;">#</th>
                                        <th style="padding:16px; text-align:left; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Hạng mục / Vật tư</th>
                                        <th style="padding:16px; text-align:center; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; width:100px;">ĐVT</th>
                                        <th style="padding:16px; text-align:center; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; width:120px;">Số lượng</th>
                                        <th style="padding:16px; text-align:right; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; width:150px;">Đơn giá (VND)</th>
                                        <th style="padding:16px; text-align:right; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; width:180px;">Thành tiền</th>
                                        <th style="padding:16px; text-align:center; width:60px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="boqBody">
                                    ${window.erpApp.renderEstimatorRows(pkg.boq)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="modal-footer" style="padding:24px 32px; background:#fff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:12px; color:#64748b; font-weight:600; margin-bottom:4px;">Tổng dự toán chi phí:</div>
                            <div id="boqTotal" style="font-size:24px; font-weight:900; color:#3b82f6;">${window.erpApp.formatValue(pkg.boq.reduce((sum, item) => sum + (item.quantity * item.price), 0))} đ</div>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <button onclick="document.getElementById('estimatorModal').remove()" style="padding:12px 24px; background:#fff; color:#64748b; border:1.5px solid #e2e8f0; border-radius:14px; font-weight:700; cursor:pointer;">Đóng</button>
                            <button onclick="window.erpApp.saveBiddingBoq('${pkg.id}')" style="padding:12px 32px; background:#1e293b; color:#fff; border:none; border-radius:14px; font-weight:700; cursor:pointer; box-shadow:0 10px 15px -3px rgba(30,41,59,0.3); display:flex; align-items:center; gap:8px;">
                                <span class="material-icons-outlined">save</span> Lưu dự toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.erpApp.renderEstimatorRows = function (boq) {
        if (!boq || boq.length === 0) {
            return `<tr><td colspan="7" style="padding:40px; text-align:center; color:#94a3b8; font-style:italic;">Chưa có hạng mục nào. Hãy tìm kiếm vật tư để thêm vào bảng dự toán.</td></tr>`;
        }
        return boq.map((item, index) => `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:16px; text-align:center; font-weight:700; color:#64748b;">${index + 1}</td>
                <td style="padding:16px;">
                    <input type="text" value="${item.name}" onchange="window.erpApp.updateBoqItem('${index}', 'name', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; color:#1e293b; outline:none;" placeholder="Tên hạng mục...">
                    <div style="font-size:11px; color:#94a3b8;">${item.id || 'Manual'}</div>
                </td>
                <td style="padding:16px; text-align:center;">
                    <input type="text" value="${item.unit}" onchange="window.erpApp.updateBoqItem('${index}', 'unit', this.value)" style="width:100%; border:none; background:transparent; text-align:center; color:#475569; outline:none;" placeholder="...">
                </td>
                <td style="padding:16px; text-align:center;">
                    <input type="number" value="${item.quantity}" oninput="window.erpApp.updateBoqItem('${index}', 'quantity', this.value)" style="width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:6px; text-align:center; font-weight:700; outline:none; color:#1e293b;">
                </td>
                <td style="padding:16px; text-align:right;">
                    <input type="text" value="${window.erpApp.formatValue(item.price)}" oninput="window.erpApp.formatNumberInput(this); window.erpApp.updateBoqItem('${index}', 'price', this.value)" style="width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:6px; text-align:right; font-weight:700; outline:none; color:#1e293b;">
                </td>
                <td style="padding:16px; text-align:right; font-weight:800; color:#1e293b;">
                    ${window.erpApp.formatValue(item.quantity * item.price)}
                </td>
                <td style="padding:16px; text-align:center;">
                    <button onclick="window.erpApp.removeBoqItem('${index}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><span class="material-icons-outlined">remove_circle_outline</span></button>
                </td>
            </tr>
        `).join('');
    };

    window.erpApp.searchEstimatorItems = function (query) {
        const resultsDiv = document.getElementById('estimatorResults');
        if (!query || query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        const items = (window.erpApp.danhSachHangHoaData || []).filter(h =>
            h.name.toLowerCase().includes(query.toLowerCase()) ||
            h.id.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        if (items.length === 0) {
            resultsDiv.innerHTML = `<div style="padding:12px; color:#94a3b8; font-size:13px; text-align:center;">Không tìm thấy vật tư phù hợp</div>`;
        } else {
            resultsDiv.innerHTML = items.map(item => `
                <div onclick="window.erpApp.addEstimatorItemFromStock('${item.id}')" style="padding:12px 16px; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                    <div>
                        <div style="font-size:14px; font-weight:700; color:#1e293b;">${item.name}</div>
                        <div style="font-size:11px; color:#64748b;">Mã: ${item.id} | ĐVT: ${item.unit || 'Cái'}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px; font-weight:800; color:#3b82f6;">${window.erpApp.formatValue(item.price || 0)} đ</div>
                        <div style="font-size:11px; color:#94a3b8;">Giá kho</div>
                    </div>
                </div>
            `).join('');
        }
        resultsDiv.style.display = 'block';
    };

    window.erpApp.addEstimatorItemFromStock = function (id) {
        const item = (window.erpApp.danhSachHangHoaData || []).find(h => h.id === id);
        if (!item) return;

        // Lấy modal đang mở để biết pkgId
        const modal = document.getElementById('estimatorModal');
        const pkgId = modal.querySelector('p').textContent.split('|')[0].replace('Mã gói: ', '').trim();
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        pkg.boq.push({
            id: item.id,
            name: item.name,
            unit: item.unit || 'Cái',
            quantity: 1,
            price: item.price || 0
        });

        document.getElementById('estimatorSearch').value = '';
        document.getElementById('estimatorResults').style.display = 'none';

        document.getElementById('boqBody').innerHTML = window.erpApp.renderEstimatorRows(pkg.boq);
        window.erpApp.calculateBoqTotal(pkg);
    };

    window.erpApp.addCustomEstimatorItem = function () {
        const modal = document.getElementById('estimatorModal');
        const pkgId = modal.querySelector('p').textContent.split('|')[0].replace('Mã gói: ', '').trim();
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        pkg.boq.push({
            id: 'Custom',
            name: '',
            unit: '',
            quantity: 1,
            price: 0
        });

        document.getElementById('boqBody').innerHTML = window.erpApp.renderEstimatorRows(pkg.boq);
        window.erpApp.calculateBoqTotal(pkg);
    };

    window.erpApp.updateBoqItem = function (index, field, value) {
        const modal = document.getElementById('estimatorModal');
        const pkgId = modal.querySelector('p').textContent.split('|')[0].replace('Mã gói: ', '').trim();
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        if (field === 'price') {
            pkg.boq[index][field] = window.erpApp.parseVND(value) || 0;
        } else if (field === 'quantity') {
            pkg.boq[index][field] = parseFloat(value) || 0;
        } else {
            pkg.boq[index][field] = value;
        }

        // Cập nhật dòng hiện tại (để tính thành tiền real-time)
        const row = document.getElementById('boqBody').children[index];
        if (row) {
            const totalCell = row.children[5];
            totalCell.textContent = window.erpApp.formatValue(pkg.boq[index].quantity * pkg.boq[index].price);
        }

        window.erpApp.calculateBoqTotal(pkg);
    };

    window.erpApp.removeBoqItem = function (index) {
        const modal = document.getElementById('estimatorModal');
        const pkgId = modal.querySelector('p').textContent.split('|')[0].replace('Mã gói: ', '').trim();
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        pkg.boq.splice(index, 1);
        document.getElementById('boqBody').innerHTML = window.erpApp.renderEstimatorRows(pkg.boq);
        window.erpApp.calculateBoqTotal(pkg);
    };

    window.erpApp.calculateBoqTotal = function (pkg) {
        const total = pkg.boq.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        document.getElementById('boqTotal').textContent = window.erpApp.formatValue(total) + ' đ';
    };

    window.erpApp.saveBiddingBoq = function (id) {
        const pkg = window.biddingPackages.find(p => p.id === id);
        if (pkg) {
            const total = pkg.boq.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            pkg.estimatedCost = total; // Cập nhật giá vốn ước tính

            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
            if (window.CrudSync) {
                window.CrudSync.saveItem('biddingPackages', pkg, 'id');
            }

            window.erpApp.showToast('Đã lưu bảng dự toán thành công!', 'success');

            // Re-render
            if (window.erpApp.currentPage === 'dau-thau-ho-so') {
                window.erpApp.renderHoSoDuThau();
            } else {
                window.erpApp.renderDauThau();
            }
        }
    };

    window.erpApp.scrapeBidding = async function () {
        // Thu thập tất cả tham số bộ lọc từ form
        const keyword = (document.getElementById('crawlKeyword') || {}).value || '';
        const province = (document.getElementById('crawlProvince') || {}).value || '';
        const sector = (document.getElementById('crawlSector') || {}).value || '';
        const biddingType = (document.getElementById('crawlBiddingType') || {}).value || '0';
        const priceFrom = (document.getElementById('crawlPriceFrom') || {}).value || '';
        const priceTo = (document.getElementById('crawlPriceTo') || {}).value || '';
        const submissionType = (document.getElementById('crawlSubmissionType') || {}).value || '';
        const infoType = (document.getElementById('crawlInfoType') || {}).value || 'tbmt';

        // Tạo mô tả bộ lọc cho thông báo
        const filterParts = [];
        if (keyword) filterParts.push(`"${keyword}"`);
        if (province) filterParts.push(`Tỉnh: ${province}`);
        if (sector) filterParts.push(`Lĩnh vực: ${sector}`);
        if (infoType && infoType !== 'tbmt') filterParts.push(`Loại: ${document.getElementById('crawlInfoType').selectedOptions[0].text}`);
        const filterDesc = filterParts.length > 0 ? filterParts.join(', ') : 'mới nhất';

        window.erpApp.showToast(`Đang tìm kiếm gói thầu (${filterDesc})...`, 'info');

        try {
            const params = new URLSearchParams();
            if (keyword) params.set('keyword', keyword);
            if (province) params.set('province', province);
            if (sector) params.set('sector', sector);
            if (biddingType && biddingType !== '0') params.set('biddingType', biddingType);
            if (priceFrom) params.set('priceFrom', priceFrom);
            if (priceTo) params.set('priceTo', priceTo);
            if (submissionType) params.set('submissionType', submissionType);
            if (infoType) params.set('infoType', infoType);

            const url = (window.API_BASE_URL || '') + `/api/scrape-dauthau?${params.toString()}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                let addedCount = 0;

                result.data.forEach(item => {
                    if (!window.biddingPackages.find(p => p.name === item.name)) {
                        window.biddingPackages.push({
                            ...item,
                            status: item.status || 'finding',
                            boq: item.boq || []
                        });
                        addedCount++;
                    }
                });

                if (addedCount > 0) {
                    if (window.erpApp._setData) {
                        window.erpApp._setData('biddingPackages', window.biddingPackages);
                    } else {
                        localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
                    }
                    if (window.CrudSync) window.CrudSync.saveItems('biddingPackages', window.biddingPackages, 'id');

                    window.erpApp.showToast(`Đã lấy thành công ${addedCount} gói thầu mới! (Trang ${result.pagination?.currentPage || 1}/${result.pagination?.totalPages || 1})`, 'success');
                    window.erpApp.renderDauThau();
                } else {
                    window.erpApp.showToast('Không có gói thầu mới nào (có thể đã tồn tại trong danh sách).', 'info');
                }
            } else {
                if (result.errorType === 'LOGIN_REQUIRED') {
                    window.erpApp.showToast(result.message || 'DauThau.info yêu cầu đăng nhập tài khoản để xem Thông báo mời thầu (TBMT).', 'error');
                } else if (result.errorType === 'CLOUDFLARE_BLOCKED') {
                    window.erpApp.showToast(result.error || 'Bị chặn bởi hệ thống bảo vệ (Cloudflare) của DauThau.info.', 'error');
                } else {
                    window.erpApp.showToast('Không tìm thấy dữ liệu thầu phù hợp với bộ lọc.', 'warning');
                }
            }
        } catch (error) {
            console.error('Scraping error:', error);
            window.erpApp.showToast('Không thể kết nối Scraper Service (Port 3002). Hãy chạy: node scraper-api.js', 'error');
        }
    };

    // ==========================================
    // AUTOMATED MONITORING LOGIC
    // ==========================================
    window.erpApp.monitorBiddingKeyword = async function () {
        const keyword = document.getElementById('crawlKeyword').value;
        const province = document.getElementById('crawlProvince').value;
        const infoType = document.getElementById('crawlInfoType').value;

        if (!keyword) {
            window.erpApp.showToast('Vui lòng nhập từ khóa muốn theo dõi!', 'warning');
            return;
        }

        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/bidding-monitor/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, province, infoType })
            });
            const data = await res.json();
            if (data.success) {
                window.erpApp.showToast('Đã thêm vào danh sách theo dõi tự động!', 'success');
            } else {
                window.erpApp.showToast('Lỗi: ' + data.error, 'error');
            }
        } catch (err) {
            window.erpApp.showToast('Lỗi kết nối Server!', 'error');
        }
    };

    window.erpApp.showMonitoredKeywords = async function () {
        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/bidding-monitor/keywords');
            const keywords = await res.json();

            const listHtml = keywords.map(k => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9;">
                    <div>
                        <div style="font-weight:700; color:#1e293b;">${k.keyword}</div>
                        <div style="font-size:11px; color:#64748b;">Tỉnh: ${k.province || 'Tất cả'} | Loại: ${k.infoType}</div>
                    </div>
                    <button onclick="window.erpApp.removeMonitoredKeyword('${k.keyword}')" style="color:#ef4444; background:none; border:none; cursor:pointer;">
                        <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                    </button>
                </div>
            `).join('') || '<div style="padding:20px; text-align:center; color:#94a3b8;">Chưa có từ khóa nào được theo dõi.</div>';

            const modalHtml = `
                <div id="monitoredModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
                    <div style="background:#fff; width:100%; max-width:450px; border-radius:24px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.15); animation:scaleIn 0.3s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="margin:0; font-size:16px; font-weight:900;">Danh sách theo dõi tự động</h3>
                            <button onclick="document.getElementById('monitoredModal').remove()" style="background:none; border:none; cursor:pointer; color:#94a3b8;"><span class="material-icons-outlined">close</span></button>
                        </div>
                        <div style="max-height:400px; overflow-y:auto;">
                            ${listHtml}
                        </div>
                        <div style="margin-top:20px; padding:12px; background:#f0f9ff; border-radius:12px; font-size:11px; color:#0369a1; font-weight:600; line-height:1.5;">
                            💡 Hệ thống sẽ tự động quét các từ khóa này vào 8h sáng và 2h chiều hàng ngày và gửi thông báo nếu có gói thầu mới.
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (err) {
            window.erpApp.showToast('Lỗi tải danh sách!', 'error');
        }
    };

    window.erpApp.removeMonitoredKeyword = async function (keyword) {
        if (!confirm(`Bạn muốn ngừng theo dõi từ khóa: "${keyword}"?`)) return;
        try {
            const res = await fetch((window.API_BASE_URL || '') + '/api/bidding-monitor/keywords', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('monitoredModal').remove();
                window.erpApp.showMonitoredKeywords();
                window.erpApp.showToast('Đã xóa từ khóa!', 'success');
            }
        } catch (err) {
            window.erpApp.showToast('Lỗi khi xóa!', 'error');
        }
    };
    /**
     * Chuyển một gói thầu từ trạng thái "Đang tìm thấy" sang "Chuẩn bị hồ sơ"
     */
    window.erpApp.prepareBiddingDoc = function(pkgId) {
        const pkg = window.biddingPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        pkg.status = 'estimating'; // Chuyển sang giai đoạn lập dự toán & chuẩn bị hồ sơ
        pkg.preparedAt = new Date().toISOString();

        if (window.erpApp._setData) {
            window.erpApp._setData('biddingPackages', window.biddingPackages);
        } else {
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
        }

        if (window.CrudSync) {
            window.CrudSync.saveItem('biddingPackages', pkg, 'id');
        }

        window.erpApp.showToast(`Gói thầu "${pkg.name}" đã được đưa vào danh sách Chuẩn bị hồ sơ!`, 'success');
        window.erpApp.renderDauThau();
        
        // Tự động mở tab Hồ sơ dự thầu để người dùng làm việc tiếp
        setTimeout(() => {
            window.erpApp.renderDauThau('dau-thau-ho-so');
        }, 1000);
    };
})();

/**
 * Chuyển đổi gói thầu trúng thầu sang module Quản lý dự án
 * @param {string} pkgId - ID gói thầu
 */
window.erpApp.convertBidToProject = function (pkgId) {
    // Phân quyền: Chỉ Ban Giám đốc hoặc Admin mới có quyền duyệt chuyển dự án
    const currentUser = window.erpApp.getCurrentUser ? window.erpApp.getCurrentUser() : null;
    const userRole = currentUser ? currentUser.role : 'Guest';

    if (userRole !== 'Admin' && userRole !== 'Ban Giám đốc') {
        window.erpApp.showToast('Bạn không có quyền duyệt và chuyển đổi dự án. Vui lòng liên hệ Ban Giám đốc.', 'warning');
        return;
    }

    const pkg = window.biddingPackages.find(p => p.id === pkgId);
    if (!pkg) {
        window.erpApp.showToast('Không tìm thấy dữ liệu gói thầu.', 'error');
        return;
    }

    if (pkg.status !== 'won') {
        window.erpApp.showToast('Chỉ có thể chuyển đổi các gói thầu có trạng thái TRÚNG THẦU.', 'warning');
        return;
    }

    if (pkg.isConverted) {
        window.erpApp.showToast('Gói thầu này đã được chuyển sang Quản lý dự án trước đó.', 'info');
        return;
    }

    // Xác nhận từ người dùng
    if (!confirm(`Xác nhận duyệt và chuyển gói thầu "${pkg.name}" sang Module Quản lý dự án?`)) return;

    try {
        // Tạo đối tượng dự án mới
        const newProjectId = 'DA-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        const newProject = {
            id: newProjectId,
            name: pkg.name,
            customer: pkg.customer,
            status: 'active',
            progress: 0,
            budget: pkg.value,
            manager: 'Chưa chỉ định',
            startDate: new Date().toISOString().split('T')[0],
            endDate: pkg.closingDate || '',
            description: `Dự án được khởi tạo từ gói thầu trúng thầu: ${pkg.name}. Mã thầu: ${pkg.id}`,
            createdAt: new Date().toISOString(),
            // Copy BOQ (dự toán) sang dự án nếu có
            estimatedCost: pkg.totalCost || 0,
            boq: pkg.boq || []
        };

        // 1. Thêm vào pmProjects
        if (!Array.isArray(window.pmProjects)) window.pmProjects = [];
        window.pmProjects.unshift(newProject);

        // 2. Đánh dấu gói thầu đã chuyển đổi
        pkg.isConverted = true;
        pkg.convertedAt = new Date().toISOString();
        pkg.linkedProjectId = newProjectId;

        // 3. Đồng bộ dữ liệu
        if (window.erpApp._setData) {
            window.erpApp._setData('pmProjects', window.pmProjects);
            window.erpApp._setData('biddingPackages', window.biddingPackages);
        } else {
            localStorage.setItem('erp_pmProjects', JSON.stringify(window.pmProjects));
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
        }

        // Đồng bộ Firebase nếu có CrudSync
        if (window.CrudSync) {
            window.CrudSync.saveItem('pmProjects', newProject, 'id');
            window.CrudSync.saveItem('biddingPackages', pkg, 'id');
        }

        // 4. Thông báo và điều hướng
        window.erpApp.showToast(`Phê duyệt thành công! Dự án mới ${newProjectId} đã được tạo.`, 'success');

        // Reload view hiện tại
        window.erpApp.renderDauThau();

        // Ghi log hệ thống
        if (window.erpApp.addNotification) {
            window.erpApp.addNotification(
                `Dự án mới "${pkg.name}" đã được phê duyệt từ kết quả đấu thầu.`,
                'rocket_launch',
                'green',
                { page: 'van-hanh', projectId: newProjectId }
            );
        }

    } catch (error) {
        console.error('Conversion error:', error);
        window.erpApp.showToast('Có lỗi xảy ra trong quá trình chuyển đổi dự án.', 'error');
    }
};

/**
 * Xóa gói thầu khỏi hệ thống
 * @param {string} id - ID gói thầu cần xóa
 */
window.erpApp.deleteBidding = function (id) {
    const pkg = (window.biddingPackages || []).find(p => p.id === id);
    const displayName = pkg ? (pkg.name || pkg.title || id) : id;

    window.erpApp.showDeleteConfirmation('Gói thầu', displayName, () => {
        window.biddingPackages = (window.biddingPackages || []).filter(p => p.id !== id);

        // Đồng bộ dữ liệu qua hệ thống _setData của app.js
        if (window.erpApp._setData) {
            window.erpApp._setData('biddingPackages', window.biddingPackages);
        } else {
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
        }

        // Đồng bộ Firebase nếu có CrudSync
        if (window.CrudSync) {
            window.CrudSync.deleteItem('biddingPackages', id, 'id');
        }

        window.erpApp.showToast(`Đã xóa gói thầu "${displayName}" thành công`, 'success');

        // Ghi log hệ thống và thông báo CRUD
        if (window.erpApp.notifyCRUD) {
            window.erpApp.notifyCRUD('Đấu thầu', 'delete', {
                page: 'dau-thau',
                id: id,
                name: displayName
            });
        }

        if (window.erpApp.currentPage === 'dau-thau-goi-thau') {
            window.erpApp.renderTheoDoiGoiThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ket-qua') {
            window.erpApp.renderKetQuaThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ho-so') {
            window.erpApp.renderHoSoDuThau();
        } else {
            window.erpApp.renderDauThau();
        }
    });
};

// ==========================================
// BULK ACTIONS
// ==========================================
window.erpApp.toggleAllBiddingChecks = function (checked) {
    const checkboxes = document.querySelectorAll('.bidding-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
};

window.erpApp.deleteSelectedBiddings = function () {
    const checkboxes = document.querySelectorAll('.bidding-checkbox:checked');
    if (checkboxes.length === 0) {
        window.erpApp.showToast('Vui lòng chọn ít nhất 1 gói thầu để xóa', 'warning');
        return;
    }

    window.erpApp.showDeleteConfirmation('dữ liệu', `${checkboxes.length} gói thầu đã chọn`, () => {
        const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
        window.biddingPackages = (window.biddingPackages || []).filter(p => !idsToDelete.includes(p.id));

        if (window.erpApp._setData) {
            window.erpApp._setData('biddingPackages', window.biddingPackages);
        } else {
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
        }

        if (window.CrudSync) {
            idsToDelete.forEach(id => {
                window.CrudSync.deleteItem('biddingPackages', id, 'id');
            });
        }

        window.erpApp.showToast(`Đã xóa ${idsToDelete.length} gói thầu thành công`, 'success');

        if (window.erpApp.notifyCRUD) {
            window.erpApp.notifyCRUD('Đấu thầu', 'delete_bulk', {
                page: 'dau-thau',
                count: idsToDelete.length
            });
        }

        if (window.erpApp.currentPage === 'dau-thau-goi-thau') {
            window.erpApp.renderTheoDoiGoiThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ket-qua') {
            window.erpApp.renderKetQuaThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ho-so') {
            window.erpApp.renderHoSoDuThau();
        } else {
            window.erpApp.renderDauThau();
        }
    });
};

window.erpApp.clearAllBiddings = function () {
    if (!window.biddingPackages || window.biddingPackages.length === 0) {
        window.erpApp.showToast('Không có dữ liệu để làm sạch', 'info');
        return;
    }

    window.erpApp.showDeleteConfirmation('dữ liệu', 'TOÀN BỘ danh sách gói thầu', () => {
        const allIds = window.biddingPackages.map(p => p.id);
        window.biddingPackages = [];

        if (window.erpApp._setData) {
            window.erpApp._setData('biddingPackages', window.biddingPackages);
        } else {
            localStorage.setItem('erp_bidding_packages', JSON.stringify(window.biddingPackages));
        }

        if (window.CrudSync) {
            allIds.forEach(id => {
                window.CrudSync.deleteItem('biddingPackages', id, 'id');
            });
        }

        window.erpApp.showToast(`Đã làm sạch toàn bộ dữ liệu gói thầu`, 'success');

        if (window.erpApp.notifyCRUD) {
            window.erpApp.notifyCRUD('Đấu thầu', 'clear_all', {
                page: 'dau-thau',
                count: allIds.length
            });
        }

        if (window.erpApp.currentPage === 'dau-thau-goi-thau') {
            window.erpApp.renderTheoDoiGoiThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ket-qua') {
            window.erpApp.renderKetQuaThau();
        } else if (window.erpApp.currentPage === 'dau-thau-ho-so') {
            window.erpApp.renderHoSoDuThau();
        } else {
            window.erpApp.renderDauThau();
        }
    });
};
