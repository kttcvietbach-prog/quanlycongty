/**
 * HR Module - Attendance & Time Tracking
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let attendance = [];

export function init() {
  attendance = storage.load(STORAGE_KEYS.attendance, []);
  console.log(`✅ HR Attendance Module: ${attendance.length} records`);
}

/**
 * ATTENDANCE
 */
export function getAllAttendance() { return [...attendance]; }

export function getAttendanceById(id) { return attendance.find(a => a.id === id); }

export function recordAttendance(data) {
  try {
    if (!data.nhanVienId) {return { success: false, message: 'Nhân viên không được để trống' };}

    const record = {
      id: idGen.generateRandomId('CK'),
      nhanVienId: data.nhanVienId,
      ngayCheCong: data.ngayCheCong || new Date().toISOString().split('T')[0],
      gioDen: data.gioDen || '',
      gioVe: data.gioVe || '',
      soGioLam: data.soGioLam || 0,
      trangThai: data.trangThai || 'co-mat', // có-mặt, vắng, phép, ốm, muộn, sớm
      lyDo: data.lyDo || '',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString()
    };

    attendance.push(record);
    storage.save(STORAGE_KEYS.attendance, attendance);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Ghi nhận chấm công: ${record.nhanVienId} (${record.trangThai})`,
        'event_available',
        'teal',
        'nhan-su'
      );
    }

    return { success: true, record, message: 'Ghi nhận chế độ thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi ghi nhận' };
  }
}

export function updateAttendance(id, data) {
  try {
    const record = getAttendanceById(id);
    if (!record) {return { success: false, message: 'Không tìm thấy' };}

    Object.assign(record, data);
    storage.save(STORAGE_KEYS.attendance, attendance);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Cập nhật chấm công: ${record.nhanVienId}`,
        'edit_calendar',
        'indigo',
        'nhan-su'
      );
    }

    return { success: true, record, message: 'Cập nhật thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteAttendance(id) {
  try {
    const idx = attendance.findIndex(a => a.id === id);
    if (idx === -1) {return { success: false, message: 'Không tìm thấy' };}

    attendance.splice(idx, 1);
    storage.save(STORAGE_KEYS.attendance, attendance);
    return { success: true, message: 'Xóa thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function getAttendanceByEmployee(nhanVienId, fromDate, toDate) {
  return attendance.filter(a => {
    if (a.nhanVienId !== nhanVienId) {return false;}
    if (fromDate && a.ngayCheCong < fromDate) {return false;}
    if (toDate && a.ngayCheCong > toDate) {return false;}
    return true;
  });
}

export function getAttendanceByDate(ngayCheCong) {
  return attendance.filter(a => a.ngayCheCong === ngayCheCong);
}

export function getMonthlyAttendanceStats(nhanVienId, year, month) {
  const monthString = `${year}-${String(month).padStart(2, '0')}`;
  const records = attendance.filter(a =>
    a.nhanVienId === nhanVienId && a.ngayCheCong.startsWith(monthString)
  );

  return {
    totalWorkdays: records.length,
    present: records.filter(r => r.trangThai === 'co-mat').length,
    absent: records.filter(r => r.trangThai === 'vang').length,
    sick: records.filter(r => r.trangThai === 'om').length,
    onLeave: records.filter(r => r.trangThai === 'phep').length,
    late: records.filter(r => r.trangThai === 'muon').length,
    early: records.filter(r => r.trangThai === 'som').length,
    totalHoursWorked: records.reduce((sum, r) => sum + (r.soGioLam || 0), 0)
  };
}

export function getAttendanceStats(fromDate, toDate) {
  const filtered = attendance.filter(a => {
    if (fromDate && a.ngayCheCong < fromDate) {return false;}
    if (toDate && a.ngayCheCong > toDate) {return false;}
    return true;
  });

  return {
    totalRecords: filtered.length,
    totalPresent: filtered.filter(a => a.trangThai === 'co-mat').length,
    totalAbsent: filtered.filter(a => a.trangThai === 'vang').length,
    totalSick: filtered.filter(a => a.trangThai === 'om').length,
    totalOnLeave: filtered.filter(a => a.trangThai === 'phep').length,
    totalLate: filtered.filter(a => a.trangThai === 'muon').length,
    averageHoursPerDay: filtered.length > 0
      ? (filtered.reduce((sum, a) => sum + (a.soGioLam || 0), 0) / filtered.length).toFixed(2)
      : 0
  };
}

export function markPresent(nhanVienId, ngayCheCong, gioDen, gioVe) {
  const soGioLam = calculateWorkHours(gioDen, gioVe);
  return recordAttendance({
    nhanVienId,
    ngayCheCong,
    gioDen,
    gioVe,
    soGioLam,
    trangThai: 'co-mat'
  });
}

export function markAbsent(nhanVienId, ngayCheCong, lyDo = '') {
  return recordAttendance({
    nhanVienId,
    ngayCheCong,
    trangThai: 'vang',
    lyDo
  });
}

export function markOnLeave(nhanVienId, ngayCheCong, loaiPhep = '') {
  return recordAttendance({
    nhanVienId,
    ngayCheCong,
    trangThai: 'phep',
    lyDo: loaiPhep
  });
}

export function markSick(nhanVienId, ngayCheCong, lyDo = '') {
  return recordAttendance({
    nhanVienId,
    ngayCheCong,
    trangThai: 'om',
    lyDo
  });
}

function calculateWorkHours(gioDen, gioVe) {
  if (!gioDen || !gioVe) {return 0;}
  try {
    const [h1, m1] = gioDen.split(':').map(Number);
    const [h2, m2] = gioVe.split(':').map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    return Math.round(((end - start) / 60) * 100) / 100;
  } catch {
    return 0;
  }
}

export function getBulkAttendanceData(dates, employees) {
  return {
    dates,
    employees,
    records: attendance.filter(a =>
      dates.includes(a.ngayCheCong) && employees.includes(a.nhanVienId)
    )
  };
}
