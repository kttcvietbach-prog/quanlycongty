
    let grSearchQuery = '';
    let grActiveTab = 'all';
    let goodsReceipts = [
        { id: 'GR-2026-001', poId: 'PO-2026-001', supplier: 'Công ty TNHH Cung ứng Quang Minh', inspector: 'Lê Kỹ Thuật', date: '2026-04-03', status: 'completed', items: [{ name: 'Laptop', unit: 'Cái', qtyOrdered: 10, qtyReceived: 10, condition: 'Tốt', defectImg: '' }] },
        { id: 'GR-2026-002', poId: 'PO-2026-005', supplier: 'Văn phòng phẩm Hồng Hà', inspector: 'Trần Kho', date: '2026-04-08', status: 'partial', items: [{ name: 'Giấy A4', unit: 'Thùng', qtyOrdered: 50, qtyReceived: 30, condition: 'Tốt', defectImg: '' }, { name: 'Mực in', unit: 'Thùng', qtyOrdered: 5, qtyReceived: 5, condition: 'Lỗi', defectImg: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Muc+Loi' }] }
    ];

    try {
        const savedGR = JSON.parse(localStorage.getItem('erp_goodsReceipts'));
        if (savedGR && Array.isArray(savedGR)) {
            goodsReceipts = savedGR;
        }
    } catch (e) { }
