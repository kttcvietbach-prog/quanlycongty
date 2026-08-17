# Task: Thêm Module Quản lý Hồ sơ Gởi đi & Hồ sơ Nhận (Hành chính)

## Summary
Thêm module **Quản lý Hồ sơ (Gởi đi & Nhận)** tương tự như module **Quản lý công văn** trong mục Hành chính của hệ thống ERP. Module này cho phép theo dõi, quản lý danh mục hồ sơ đến/đi/nội bộ, thông tin nơi gửi/nhận, số lượng bản chính/bản sao, ngày lập/ngày gửi, dự án, phòng ban, trạng thái xử lý, đính kèm file chứng từ, cùng đầy đủ tính năng Thêm, Sửa, Xóa, Xem chi tiết, Phân trang, Tìm kiếm, Bộ lọc và Đồng bộ dữ liệu.

## Implementation Steps

### Step 1: Khai báo State & Dữ liệu mẫu (Data Layer)
- Khai báo danh sách `hoSoRecordList` (load từ `localStorage` key `erp_hoSoRecordList`, hỗ trợ `CrudSync` và `FileStore`).
- Định nghĩa danh mục `hsCategories` (Hồ sơ đến, Hồ sơ gửi đi, Hồ sơ nội bộ, Hồ sơ pháp lý/dự án).
- Định nghĩa dữ liệu mẫu khởi tạo `initialHoSoList` nếu chưa có dữ liệu trong LocalStorage.

### Step 2: Đăng ký Router & Menu Card trong Section Hành chính
- Thêm thẻ module **Quản lý hồ sơ gởi/nhận** vào danh mục Hành chính (`pagesData['hanh-chinh']`) tại `app.js`.
- Bổ sung routing click module: `if (title === 'Quản lý hồ sơ gởi/nhận' || title === 'Quản lý hồ sơ') { renderQuanLyHoSo(); return; }`.
- Cập nhật hàm `navigateTo` hoặc breadcrumb handler để chuyển tiếp mượt mà.

### Step 3: Xây dựng Giao diện UI (`renderQuanLyHoSo`)
- **Header & Breadcrumb**: Tiêu đề *"Quản lý hồ sơ gởi đi & nhận"*, nút Thêm mới hồ sơ, Tìm kiếm & Lọc theo Dự án/Phòng ban.
- **Thống kê / Statistic Cards**: Các tab/badge đếm số lượng: *Tất cả*, *Hồ sơ đến*, *Hồ sơ gửi đi*, *Hồ sơ nội bộ*, *Hồ sơ pháp lý*.
- **Bảng dữ liệu (Data Table)**:
  - STT, Mã hồ sơ (`HS-2026/xxx`), Loại hồ sơ, Tên bộ hồ sơ, Nơi gửi/nhận, Dự án/Phòng ban, Ngày gửi/nhận, Trạng thái, Số lượng file, Nút hành động (Xem, Xem file, Sửa, Xóa).
- **Phân trang (Pagination)**.

### Step 4: Xây dựng Modal & Logic Thêm/Sửa/Xóa/Xem chi tiết
- `openHoSoModal(id)`: Modal form nhập thông tin hồ sơ (Mã, Loại, Tên bộ hồ sơ, Nơi gửi, Nơi nhận, Ngày gửi/nhận, Người phụ trách, Dự án, Phòng ban, Số bản chính/sao, Ghi chú, Up load file đính kèm).
- `saveHoSo()`: Lưu hồ sơ (Save to local state, LocalStorage, CrudSync, FileStore).
- `viewHoSo(id)`: Modal xem thông tin chi tiết hồ sơ.
- `confirmDeleteHoSo(id)`: Xác nhận xóa hồ sơ.
- `openHoSoPreview(id)`: Preview file tài liệu.

### Step 5: Integration & Verification
- Đảm bảo đồng bộ `firebase-sync.js` (thêm `hoSoRecordList` vào danh sách sync nếu cần).
- Kiểm tra syntax JS, thử nghiệm UI rendering & CRUD functions.
