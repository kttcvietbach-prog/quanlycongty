/**
 * HR Module - Employee Management
 * Employees, contracts, attendance, payroll
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';
import * as formatters from '../../lib/formatters.js';
import * as validators from '../../lib/validators.js';
import * as modalMgr from '../../lib/modal-manager.js';
import * as formHelpers from '../../lib/form-helpers.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

// Module state
let employees = [];
let contracts = [];
let attendance = [];
let payroll = [];

/**
 * Initialize HR module
 */
export function init() {
  employees = storage.load(STORAGE_KEYS.employees, []);
  contracts = storage.load(STORAGE_KEYS.contracts, []);
  attendance = storage.load(STORAGE_KEYS.attendance, []);
  payroll = storage.load(STORAGE_KEYS.payroll, []);

  console.log(`✅ HR Module initialized:
    - Employees: ${employees.length}
    - Contracts: ${contracts.length}
    - Attendance: ${attendance.length}
    - Payroll: ${payroll.length}`);
}

/**
 * EMPLOYEE MANAGEMENT
 */

export function getAllEmployees() {
  return [...employees];
}

export function getEmployeeById(id) {
  return employees.find(e => e.id === id);
}

export function getEmployeesByDepartment(deptId) {
  return employees.filter(e => e.phongBan === deptId);
}

export function createEmployee(data) {
  try {
    // Validate
    const { valid, errors } = validators.validateEmployee(data);
    if (!valid) {
      return { success: false, errors };
    }

    // Create employee
    const employee = {
      id: idGen.generateEmployeeCode(employees),
      hoTen: data.hoTen,
      email: data.email,
      phone: data.phone || '',
      ngaySinh: data.ngaySinh,
      gioiTinh: data.gioiTinh || 'Nam',
      phongBan: data.phongBan,
      chucVu: data.chucVu,
      capBac: data.capBac || '',
      diaChi: data.diaChi || '',
      cmnd: data.cmnd || '',
      nguonTuyen: data.nguonTuyen || '',
      ngayVaoLam: data.ngayVaoLam || new Date().toISOString().split('T')[0],
      trangThai: data.trangThai || 'hoat-dong',
      taiKhoan: data.taiKhoan || '',
      matKhau: data.matKhau || '',
      createdDate: new Date().toISOString()
    };

    employees.push(employee);
    storage.save(STORAGE_KEYS.employees, employees);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tiếp nhận nhân sự mới: ${employee.hoTen}`,
        'person_add',
        'blue',
        'nhan-su'
      );
    }

    return { success: true, employee, message: 'Tạo nhân viên thành công' };
  } catch (error) {
    console.error('Create employee error:', error);
    return { success: false, message: 'Lỗi tạo nhân viên: ' + error.message };
  }
}

export function updateEmployee(id, data) {
  try {
    const employee = getEmployeeById(id);
    if (!employee) {
      return { success: false, message: 'Không tìm thấy nhân viên' };
    }

    Object.assign(employee, data);
    storage.save(STORAGE_KEYS.employees, employees);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật thông tin nhân viên: ${employee.hoTen}`,
        'manage_accounts',
        'indigo',
        'nhan-su'
      );
    }

    return { success: true, employee, message: 'Cập nhật nhân viên thành công' };
  } catch (error) {
    console.error('Update employee error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteEmployee(id) {
  try {
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy nhân viên' };
    }

    const removed = employees.splice(index, 1)[0];
    storage.save(STORAGE_KEYS.employees, employees);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xóa hồ sơ nhân viên: ${removed.hoTen}`,
        'person_remove',
        'red',
        'nhan-su'
      );
    }

    return { success: true, message: 'Xóa nhân viên thành công' };
  } catch (error) {
    console.error('Delete employee error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function searchEmployees(query) {
  const q = query.toLowerCase();
  return employees.filter(e =>
    e.hoTen.toLowerCase().includes(q) ||
    e.email.toLowerCase().includes(q) ||
    e.phone.includes(q) ||
    e.id.includes(q)
  );
}

export function filterEmployeesByStatus(status) {
  return employees.filter(e => e.trangThai === status);
}

/**
 * CONTRACT MANAGEMENT
 */

export function getAllContracts() {
  return [...contracts];
}

export function getContractById(id) {
  return contracts.find(c => c.id === id);
}

export function getEmployeeContracts(employeeId) {
  return contracts.filter(c => c.nhanVienId === employeeId);
}

export function createContract(data) {
  try {
    // Validate
    const { valid, errors } = validators.validateContract(data);
    if (!valid) {
      return { success: false, errors };
    }

    const contract = {
      id: idGen.generateContractCode(contracts),
      nhanVienId: data.nhanVienId,
      loaiHopDong: data.loaiHopDong,
      ngayBatDau: data.ngayBatDau,
      ngayKetThuc: data.ngayKetThuc,
      luongCoBan: data.luongCoBan || 0,
      luongThuong: data.luongThuong || 0,
      phuCapAnToan: data.phuCapAnToan || 0,
      phuCapKhac: data.phuCapKhac || 0,
      trangThai: data.trangThai || 'hieu-luc',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString()
    };

    contracts.push(contract);
    storage.save(STORAGE_KEYS.contracts, contracts);

    return { success: true, contract, message: 'Tạo hợp đồng thành công' };
  } catch (error) {
    console.error('Create contract error:', error);
    return { success: false, message: 'Lỗi tạo hợp đồng' };
  }
}

export function updateContract(id, data) {
  try {
    const contract = getContractById(id);
    if (!contract) {
      return { success: false, message: 'Không tìm thấy hợp đồng' };
    }

    Object.assign(contract, data);
    storage.save(STORAGE_KEYS.contracts, contracts);

    return { success: true, contract, message: 'Cập nhật hợp đồng thành công' };
  } catch (error) {
    console.error('Update contract error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteContract(id) {
  try {
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy hợp đồng' };
    }

    contracts.splice(index, 1);
    storage.save(STORAGE_KEYS.contracts, contracts);

    return { success: true, message: 'Xóa hợp đồng thành công' };
  } catch (error) {
    console.error('Delete contract error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

/**
 * ATTENDANCE MANAGEMENT
 */

export function getAllAttendance() {
  return [...attendance];
}

export function getAttendanceByDate(date) {
  return attendance.filter(a => a.ngayVao === date);
}

export function getEmployeeAttendance(employeeId, dateFrom, dateTo) {
  return attendance.filter(a =>
    a.nhanVienId === employeeId &&
    a.ngayVao >= dateFrom &&
    a.ngayVao <= dateTo
  );
}

export function recordAttendance(data) {
  try {
    const record = {
      id: idGen.generateRandomId('ATT'),
      nhanVienId: data.nhanVienId,
      ngayVao: data.ngayVao,
      gioVao: data.gioVao || '',
      gioRa: data.gioRa || '',
      trangThai: data.trangThai || 'co-mat',
      ghiChu: data.ghiChu || '',
      recordedDate: new Date().toISOString()
    };

    attendance.push(record);
    storage.save(STORAGE_KEYS.attendance, attendance);

    return { success: true, record, message: 'Ghi nhận chấm công thành công' };
  } catch (error) {
    console.error('Record attendance error:', error);
    return { success: false, message: 'Lỗi ghi nhận' };
  }
}

export function getAttendanceStats(employeeId, monthYear) {
  const records = getEmployeeAttendance(employeeId, monthYear + '-01', monthYear + '-31');

  return {
    total: records.length,
    present: records.filter(r => r.trangThai === 'co-mat').length,
    absent: records.filter(r => r.trangThai === 'vang-mat').length,
    late: records.filter(r => r.trangThai === 'di-muon').length,
    leave: records.filter(r => r.trangThai === 'phep-phep').length
  };
}

/**
 * PAYROLL MANAGEMENT
 */

export function getAllPayroll() {
  return [...payroll];
}

export function getPayrollByPeriod(period) {
  return payroll.filter(p => p.kyTinh === period);
}

export function calculateSalary(employeeId, period) {
  const contract = contracts.find(c => c.nhanVienId === employeeId && c.trangThai === 'hieu-luc');
  if (!contract) {return null;}

  const attendanceStats = getAttendanceStats(employeeId, period);
  const daysWorked = attendanceStats.present;
  const daysAbsent = attendanceStats.absent;

  // Calculate
  const baseSalary = contract.luongCoBan;
  const bonus = contract.luongThuong;
  const allowance = contract.phuCapAnToan + contract.phuCapKhac;

  // Deductions
  const deduction = (daysAbsent * baseSalary) / 22; // 22 working days per month

  const totalSalary = baseSalary + bonus + allowance - deduction;

  return {
    employeeId,
    period,
    baseSalary,
    bonus,
    allowance,
    deduction,
    totalSalary,
    daysWorked,
    daysAbsent
  };
}

export function createPayroll(employeeId, period) {
  try {
    const salary = calculateSalary(employeeId, period);
    if (!salary) {
      return { success: false, message: 'Không tính được lương' };
    }

    const payrollRecord = {
      id: idGen.generateRandomId('PAYROLL'),
      ...salary,
      trangThai: 'chua-phat',
      createdDate: new Date().toISOString()
    };

    payroll.push(payrollRecord);
    storage.save(STORAGE_KEYS.payroll, payroll);

    return { success: true, payroll: payrollRecord, message: 'Tạo bảng lương thành công' };
  } catch (error) {
    console.error('Create payroll error:', error);
    return { success: false, message: 'Lỗi tạo bảng lương' };
  }
}

export function approvePayroll(payrollId) {
  try {
    const record = payroll.find(p => p.id === payrollId);
    if (!record) {
      return { success: false, message: 'Không tìm thấy' };
    }

    record.trangThai = 'da-phat';
    record.phatDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.payroll, payroll);

    return { success: true, message: 'Phê duyệt lương thành công' };
  } catch (error) {
    console.error('Approve payroll error:', error);
    return { success: false, message: 'Lỗi phê duyệt' };
  }
}

/**
 * HELPER FUNCTIONS
 */

export function getEmployeeInfo(employeeId) {
  const employee = getEmployeeById(employeeId);
  const activeContract = contracts.find(c => c.nhanVienId === employeeId && c.trangThai === 'hieu-luc');

  return {
    employee,
    contract: activeContract,
    salary: activeContract?.luongCoBan || 0
  };
}

export function getEmployeesList() {
  return employees.map(e => ({
    id: e.id,
    name: e.hoTen,
    email: e.email,
    department: e.phongBan,
    position: e.chucVu,
    status: e.trangThai
  }));
}

export function exportEmployeesCSV() {
  // Would implement CSV export
  const headers = ['ID', 'Họ tên', 'Email', 'Phòng ban', 'Chức vụ', 'Trạng thái'];
  const rows = employees.map(e => [
    e.id, e.hoTen, e.email, e.phongBan, e.chucVu, e.trangThai
  ]);

  return { headers, rows };
}
