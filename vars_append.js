
    let supplierSearchQuery = '';
    let supplierActiveTab = 'all';
    let suppliers = [
        { id: 'NCC-2026-001', name: 'Công ty TNHH Cung ứng Quang Minh', category: 'Thiết bị IT', contactPerson: 'Nguyễn Văn A', phone: '0901234567', email: 'contact@quangminh.vn', address: 'Quận 1, TP.HCM', status: 'active', rating: 5 },
        { id: 'NCC-2026-002', name: 'Văn phòng phẩm Hồng Hà', category: 'Văn phòng phẩm', contactPerson: 'Trần Thị B', phone: '0912345678', email: 'sales@hongha.com', address: 'Đống Đa, Hà Nội', status: 'active', rating: 4 },
        { id: 'NCC-2026-003', name: 'Đại lý phân phối Thiết bị IT Xanh', category: 'Thiết bị IT', contactPerson: 'Lê Văn C', phone: '0987654321', email: 'itxanh@gmail.com', address: 'Sơn Trà, Đà Nẵng', status: 'potential', rating: 3 },
        { id: 'NCC-2026-004', name: 'Nhà cung cấp Vật liệu Kiến Trúc', category: 'Nguyên vật liệu', contactPerson: 'Phạm Minh D', phone: '0933445566', email: 'kientruc@vlk.vn', address: 'Thanh Xuân, Hà Nội', status: 'inactive', rating: 2 }
    ];

    try {
        const savedSuppliers = JSON.parse(localStorage.getItem('erp_suppliers'));
        if (savedSuppliers && Array.isArray(savedSuppliers)) {
            suppliers = savedSuppliers;
        }
    } catch (e) { }

    let rfqSearchQuery = '';
    let rfqActiveTab = 'all';
    let rfqs = [
        { id: 'RFQ-2026-001', supplier: 'Công ty TNHH Cung ứng Quang Minh', requestDate: '2026-04-01', deadlineDate: '2026-04-10', status: 'sent', items: [{ name: 'Laptop', unit: 'Cái', qty: 10 }] },
        { id: 'RFQ-2026-002', supplier: 'Văn phòng phẩm Hồng Hà', requestDate: '2026-04-05', deadlineDate: '2026-04-08', status: 'received', items: [{ name: 'Giấy A4', unit: 'Thùng', qty: 50 }] },
        { id: 'RFQ-2026-003', supplier: 'Thiết bị IT Xanh', requestDate: '2026-04-08', deadlineDate: '2026-04-15', status: 'draft', items: [{ name: 'Bàn phím cơ', unit: 'Cái', qty: 5 }] }
    ];

    try {
        const savedRfqs = JSON.parse(localStorage.getItem('erp_rfqs'));
        if (savedRfqs && Array.isArray(savedRfqs)) {
            rfqs = savedRfqs;
        }
    } catch (e) { }
