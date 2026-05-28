/**
 * Validators Utilities
 * Business logic validation functions
 */

/**
 * Validate employee data
 */
export function validateEmployee(employee) {
  const errors = {};

  if (!employee.hoTen || employee.hoTen.trim() === '') {
    errors.hoTen = 'Họ tên không được để trống';
  }

  if (!employee.email || employee.email.trim() === '') {
    errors.email = 'Email không được để trống';
  } else if (!validateEmail(employee.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!employee.ngaySinh) {
    errors.ngaySinh = 'Ngày sinh không được để trống';
  }

  if (!employee.phongBan) {
    errors.phongBan = 'Phòng ban không được để trống';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate contract data
 */
export function validateContract(contract) {
  const errors = {};

  if (!contract.nhanVienId) {
    errors.nhanVienId = 'Nhân viên không được để trống';
  }

  if (!contract.loaiHopDong) {
    errors.loaiHopDong = 'Loại hợp đồng không được để trống';
  }

  if (!contract.ngayBatDau) {
    errors.ngayBatDau = 'Ngày bắt đầu không được để trống';
  }

  if (!contract.ngayKetThuc) {
    errors.ngayKetThuc = 'Ngày kết thúc không được để trống';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate project data
 */
export function validateProject(project) {
  const errors = {};

  if (!project.tenDuAn || project.tenDuAn.trim() === '') {
    errors.tenDuAn = 'Tên dự án không được để trống';
  }

  if (!project.ngayBatDau) {
    errors.ngayBatDau = 'Ngày bắt đầu không được để trống';
  }

  if (!project.ngayKetThuc) {
    errors.ngayKetThuc = 'Ngày kết thúc không được để trống';
  }

  if (project.hachToanDuKien && isNaN(parseFloat(project.hachToanDuKien))) {
    errors.hachToanDuKien = 'Hạch toán dự kiến phải là số';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate order data
 */
export function validateOrder(order) {
  const errors = {};

  if (!order.khachHangId) {
    errors.khachHangId = 'Khách hàng không được để trống';
  }

  if (!order.ngayDonHang) {
    errors.ngayDonHang = 'Ngày đơn hàng không được để trống';
  }

  if (!order.items || order.items.length === 0) {
    errors.items = 'Phải có ít nhất một mặt hàng';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]{9,}$/;
  return re.test(phone);
}

/**
 * Validate URL
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * Validate amount
 */
export function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Validate percentage
 */
export function validatePercentage(percentage) {
  const num = parseFloat(percentage);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Validate ID format (e.g., PB-001)
 */
export function validateIdFormat(id, prefix) {
  return id && id.startsWith(prefix);
}

/**
 * Check for duplicate values in array
 */
export function hasDuplicate(array, key) {
  const seen = new Set();
  for (const item of array) {
    const value = key ? item[key] : item;
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}

/**
 * Validate unique in array
 */
export function isUniqueInArray(array, value, key = null) {
  return !array.some(item => {
    const itemValue = key ? item[key] : item;
    return itemValue === value;
  });
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data, requiredFields) {
  const errors = {};

  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      errors[field] = `${field} không được để trống`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate string length
 */
export function validateStringLength(str, min, max) {
  const length = String(str).length;
  return length >= min && length <= max;
}

/**
 * Validate field with regex
 */
export function validateWithRegex(value, regex) {
  return regex.test(value);
}

/**
 * Validate business hours
 */
export function validateBusinessHours(hours) {
  return hours >= 0 && hours <= 24;
}

/**
 * Validate salary
 */
export function validateSalary(salary) {
  const num = parseFloat(salary);
  return !isNaN(num) && num >= 0;
}
