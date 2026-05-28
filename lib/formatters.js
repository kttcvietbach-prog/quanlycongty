/**
 * Formatter Utilities
 * Centralized formatting functions for labels, colors, status, icons
 */

/**
 * Get status label with color
 */
export const STATUS_LABELS = {
  // Attendance statuses
  'co-mat': { label: 'Có mặt', color: '#34C759', icon: 'check_circle' },
  'vang-mat': { label: 'Vắng mặt', color: '#FF5757', icon: 'cancel' },
  'di-muon': { label: 'Đi muộn', color: '#FFB300', icon: 'schedule' },
  've-som': { label: 'Về sớm', color: '#00B8D4', icon: 'schedule' },
  'phep-phep': { label: 'Phép phép', color: '#8E24AA', icon: 'event' },
  'phep-khong-phep': { label: 'Phép không phép', color: '#FF8C42', icon: 'event' },

  // Approval statuses
  'cho-duyet': { label: 'Chờ duyệt', color: '#FFB300', icon: 'hourglass_empty' },
  'da-duyet': { label: 'Đã duyệt', color: '#34C759', icon: 'check_circle' },
  'tu-choi': { label: 'Từ chối', color: '#FF5757', icon: 'cancel' },
  'chi-dinh': { label: 'Chỉ định', color: '#4A7CFF', icon: 'assignment' },

  // Contract statuses
  'moi': { label: 'Mới', color: '#00B8D4', icon: 'fiber_new' },
  'hieu-luc': { label: 'Hiệu lực', color: '#34C759', icon: 'verified' },
  'het-hieu-luc': { label: 'Hết hiệu lực', color: '#FF5757', icon: 'block' },
  'tam-dung': { label: 'Tạm dừng', color: '#FFB300', icon: 'pause' },

  // Project statuses
  'moi-tao': { label: 'Mới tạo', color: '#00B8D4', icon: 'fiber_new' },
  'dang-thuc-hien': { label: 'Đang thực hiện', color: '#4A7CFF', icon: 'play_circle' },
  'hoan-thanh': { label: 'Hoàn thành', color: '#34C759', icon: 'check_circle' },
  'huy-bo': { label: 'Hủy bỏ', color: '#FF5757', icon: 'cancel' },

  // Document statuses
  'nhap': { label: 'Nhập', color: '#00B8D4', icon: 'add' },
  'xuat': { label: 'Xuất', color: '#FF8C42', icon: 'logout' },
  'kho': { label: 'Kho', color: '#34C759', icon: 'inventory_2' },

  // Default
  'unknown': { label: 'Không xác định', color: '#9CA8B8', icon: 'help' }
};

/**
 * Get status label
 */
export function getStatusLabel(status) {
  return STATUS_LABELS[status]?.label || STATUS_LABELS['unknown'].label;
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  return STATUS_LABELS[status]?.color || STATUS_LABELS['unknown'].color;
}

/**
 * Get status icon
 */
export function getStatusIcon(status) {
  return STATUS_LABELS[status]?.icon || STATUS_LABELS['unknown'].icon;
}

/**
 * Format salary with comma separator
 */
export function formatSalary(salary) {
  if (!salary) {return '0';}
  return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(dateString) {
  if (!dateString) {return '';}
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime
 */
export function formatDateTime(dateString) {
  if (!dateString) {return '';}
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) {return 'N/A';}
  const parts = name.trim().split(' ');
  return parts.map(p => p[0].toUpperCase()).join('').substring(0, 2);
}

/**
 * Get user avatar color based on name
 */
export function getAvatarColor(name) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();

  const iconMap = {
    'pdf': 'picture_as_pdf',
    'doc': 'description',
    'docx': 'description',
    'xls': 'table_chart',
    'xlsx': 'table_chart',
    'ppt': 'slideshow',
    'pptx': 'slideshow',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'zip': 'folder_zip',
    'txt': 'notes',
    'csv': 'table_chart'
  };

  return iconMap[ext] || 'insert_drive_file';
}

/**
 * Get file type label
 */
export function getFileTypeLabel(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();

  const labelMap = {
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'xls': 'Excel Spreadsheet',
    'xlsx': 'Excel Spreadsheet',
    'ppt': 'PowerPoint',
    'pptx': 'PowerPoint',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'gif': 'Image',
    'zip': 'Archive',
    'txt': 'Text File'
  };

  return labelMap[ext] || 'File';
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) {return '0 Bytes';}

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert status code to badge HTML
 */
export function getStatusBadge(status) {
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS['unknown'];
  return `<span class="status-badge" style="background-color: ${statusInfo.color}20; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
    ${statusInfo.label}
  </span>`;
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 0) {
  return (value || 0).toFixed(decimals) + '%';
}

/**
 * Format currency
 */
export function formatCurrency(value) {
  return 'đ' + formatSalary(Math.round(value || 0));
}

/**
 * Get priority label and color
 */
export const PRIORITY_LABELS = {
  'cao': { label: 'Cao', color: '#FF5757' },
  'trung-binh': { label: 'Trung bình', color: '#FFB300' },
  'thap': { label: 'Thấp', color: '#34C759' }
};

export function getPriorityLabel(priority) {
  return PRIORITY_LABELS[priority]?.label || 'N/A';
}

export function getPriorityColor(priority) {
  return PRIORITY_LABELS[priority]?.color || '#9CA8B8';
}

/**
 * Get week day name
 */
export function getWeekDay(dayIndex) {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return days[dayIndex] || '';
}
