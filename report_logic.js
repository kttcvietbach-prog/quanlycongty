
// ==========================================
// MODULE: Báo cáo mua hàng 
// ==========================================
function renderBaoCaoMuaHang() {
    breadcrumbCurrent.textContent = 'Báo cáo mua hàng';
    pageBadge.textContent = 'Mua hàng';

    // Fake Data computations
    const totalPO = purchaseOrders.length;
    const totalSpent = purchaseOrders.reduce((sum, po) => sum + (po.status !== 'cancelled' ? po.totalAmount : 0), 0);
    const pendingPO = purchaseOrders.filter(po => po.status === 'draft' || po.status === 'ordered').length;
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

    let supplierTotals = {};
    purchaseOrders.filter(po => po.status !== 'cancelled').forEach(po => {
        if (!supplierTotals[po.supplier]) supplierTotals[po.supplier] = 0;
        supplierTotals[po.supplier] += po.totalAmount;
    });

    // Get Top 5 suppliers
    const topSuppliers = Object.entries(supplierTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Chart Data Calculation
    const chartCounts = { draft: 0, ordered: 0, received: 0, cancelled: 0 };
    purchaseOrders.forEach(po => {
        if (chartCounts[po.status] !== undefined) chartCounts[po.status]++;
    });
    const getPct = (val) => totalPO > 0 ? (val / totalPO * 100).toFixed(1) : 0;

    let html = `
            <div class="sales-order-module">
                <div class="so-toolbar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button class="back-btn" onclick="window.erpApp.navigateTo('mua-hang')" style="padding:8px 16px; border:1px solid #e2e8f0; background:#fff; border-radius:8px; display:flex; align-items:center; gap:8px; font-weight:600; color:#64748b; cursor:pointer;">
                            <span class="material-icons-outlined">arrow_back</span> Quay lại
                        </button>
                        <h2 style="font-size:18px; font-weight:800; color:#1e293b; margin:0;">Tổng quan Chi phí & Mua sắm</h2>
                    </div>
                    <div>
                        <button onclick="window.erpApp.simulatePrintPurchasingReport()" style="padding:10px 24px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(245, 158, 11, 0.2);">
                            <span class="material-icons-outlined">picture_as_pdf</span> Xuất Báo Cáo PDF
                        </button>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:24px;">
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:10px;">
                        <div style="font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Tổng chi phí Thực Nhận & Đã Đặt</div>
                        <div style="font-size:28px; font-weight:900; color:#10b981;">${formatter.format(totalSpent)}</div>
                        <div style="font-size:12px; color:#94a3b8; font-weight:600;">(Đã loại trừ Đơn hủy)</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:10px;">
                        <div style="font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Lượng Đơn Đặt Hàng (PO)</div>
                        <div style="display:flex; align-items:flex-end; gap:8px;">
                            <span style="font-size:28px; font-weight:900; color:#3b82f6;">${totalPO}</span>
                            <span style="font-size:13px; font-weight:700; color:#64748b; margin-bottom:6px;">phiếu xuất</span>
                        </div>
                        <div style="font-size:12px; color:#f59e0b; font-weight:700;">Đang chờ xử lý: ${pendingPO} phiếu</div>
                    </div>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:10px;">
                        <div style="font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Mức độ liên kết Đối tác</div>
                        <div style="display:flex; align-items:flex-end; gap:8px;">
                            <span style="font-size:28px; font-weight:900; color:#8b5cf6;">${Object.keys(supplierTotals).length}</span>
                            <span style="font-size:13px; font-weight:700; color:#64748b; margin-bottom:6px;">nhà cung cấp</span>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02); padding:24px;">
                        <h3 style="font-size:16px; font-weight:800; color:#1e293b; margin:0 0 20px 0;">Phân bổ Trạng thái Đơn hàng (PO)</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;"><span color="#10b981">Đã nhận hàng</span> <span>${chartCounts.received} (${getPct(chartCounts.received)}%)</span></div>
                                <div style="width:100%; height:12px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                    <div style="width:${getPct(chartCounts.received)}%; height:100%; background:#10b981;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;"><span color="#3b82f6">Đã đặt hàng</span> <span>${chartCounts.ordered} (${getPct(chartCounts.ordered)}%)</span></div>
                                <div style="width:100%; height:12px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                    <div style="width:${getPct(chartCounts.ordered)}%; height:100%; background:#3b82f6;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;"><span color="#64748b">Bản Nháp</span> <span>${chartCounts.draft} (${getPct(chartCounts.draft)}%)</span></div>
                                <div style="width:100%; height:12px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                    <div style="width:${getPct(chartCounts.draft)}%; height:100%; background:#94a3b8;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;"><span color="#ef4444">Đã hủy</span> <span>${chartCounts.cancelled} (${getPct(chartCounts.cancelled)}%)</span></div>
                                <div style="width:100%; height:12px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                                    <div style="width:${getPct(chartCounts.cancelled)}%; height:100%; background:#ef4444;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
                        <div style="padding:24px; border-bottom:1px solid #f1f5f9;">
                            <h3 style="font-size:16px; font-weight:800; color:#1e293b; margin:0;">Top 5 Nhà cung cấp lớn nhất</h3>
                        </div>
                        <table style="width:100%; border-collapse:collapse;">
                            <tbody>
                                ${topSuppliers.length === 0 ? '<tr><td style="padding:20px;text-align:center;color:#94a3b8;">Chưa có dữ liệu thanh toán.</td></tr>' :
            topSuppliers.map((s, idx) => `
                                    <tr style="border-bottom:1px solid #f1f5f9;">
                                        <td style="padding:16px 24px; width:40px; text-align:center; font-weight:900; color:${idx === 0 ? '#f59e0b' : (idx === 1 ? '#94a3b8' : (idx === 2 ? '#b45309' : '#cbd5e1'))};">#${idx + 1}</td>
                                        <td style="padding:16px 12px; font-weight:700; color:#334155; font-size:14px;">${s.name}</td>
                                        <td style="padding:16px 24px; text-align:right; font-weight:800; color:#10b981;">${formatter.format(s.amount)}</td>
                                    </tr>
                                  `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    pageContent.innerHTML = html;
}

window.erpApp.simulatePrintPurchasingReport = function () {
    showToast('Đang kết xuất Báo cáo Hệ thống...');
    setTimeout(() => {
        showToast('✅ Đã tải xuống file Baocao_Muahang_VIETBACH.pdf !');
    }, 1200);
}
