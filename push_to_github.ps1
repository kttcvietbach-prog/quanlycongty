# File: push_to_github.ps1
# Script tự động khởi tạo và đẩy code lên GitHub dành cho VIETBACHERP

Write-Host "--- Bắt đầu quá trình cấu hình và đẩy code lên GitHub ---" -ForegroundColor Cyan

# 1. Khởi tạo Git nếu chưa có
if (!(Test-Path ".git")) {
    Write-Host "[1/4] Khởi tạo kho lưu trữ Git mới..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "[1/4] Kho lưu trữ Git đã tồn tại, đang kiểm tra cấu hình..." -ForegroundColor Green
}

# 2. Cấu hình Remote
$remoteUrl = "https://github.com/kttcvietbach-prog/quanlycongty.git"
$checkRemote = git remote
if ($checkRemote -contains "origin") {
    Write-Host "[2/4] Cập nhật địa chỉ GitHub..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
} else {
    Write-Host "[2/4] Thêm địa chỉ GitHub..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
}

# 3. Thêm file và Commit
Write-Host "[3/4] Đang đóng gói dữ liệu (Add & Commit)..." -ForegroundColor Yellow
git add .
git commit -m "Cập nhật VIETBACHERP V5.2 - Sync to Master"

# 4. Đẩy code
Write-Host "[4/4] Đang đẩy code lên GitHub... (Ưu tiên nhánh master)" -ForegroundColor Yellow
git push -f origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Thử đẩy lên nhánh main..." -ForegroundColor Gray
    git push -f origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n--- THÀNH CÔNG: Code đã được cập nhật lên GitHub! ---" -ForegroundColor Green
} else {
    Write-Host "`n--- THẤT BẠI: Có lỗi xảy ra trong quá trình push. ---" -ForegroundColor Red
    Write-Host "Gợi ý: Kiểm tra kết nối mạng hoặc quyền truy cập của bạn vào GitHub." -ForegroundColor Gray
}

Write-Host "`nNhấn phím bất kỳ để đóng cửa sổ này..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
