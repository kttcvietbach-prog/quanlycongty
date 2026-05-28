/**
 * HR Module - Employment Contracts
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let contracts = [];

export function init() {
  contracts = storage.load(STORAGE_KEYS.contracts, []);
  console.log(`✅ HR Contracts Module: ${contracts.length} contracts`);
}

/**
 * CONTRACTS
 */
export function getAllContracts() { return [...contracts]; }

export function getContractById(id) { return contracts.find(c => c.id === id); }

export function createContract(data) {
  try {
    if (!data.nhanVienId) {return { success: false, message: 'Nhân viên không được để trống' };}
    if (!data.loaiHopDong?.trim()) {return { success: false, message: 'Loại hợp đồng không được để trống' };}

    const contract = {
      id: idGen.generateRandomId('HĐ'),
      nhanVienId: data.nhanVienId,
      loaiHopDong: data.loaiHopDong, // Toàn thời gian, bán thời gian, thử việc, hợp đồng dự án
      ngayKy: data.ngayKy || new Date().toISOString().split('T')[0],
      ngayBatDau: data.ngayBatDau || new Date().toISOString().split('T')[0],
      ngayKetThuc: data.ngayKetThuc || '',
      luongCoBan: data.luongCoBan || 0,
      heSoLuong: data.heSoLuong || 1,
      trangThai: 'hoat-dong',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    contracts.push(contract);
    storage.save(STORAGE_KEYS.contracts, contracts);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tạo hợp đồng mới: ${contract.id}`,
        'description',
        'green',
        'nhan-su'
      );
    }

    return { success: true, contract, message: 'Tạo hợp đồng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo hợp đồng' };
  }
}

export function updateContract(id, data) {
  try {
    const contract = getContractById(id);
    if (!contract) {return { success: false, message: 'Không tìm thấy hợp đồng' };}

    Object.assign(contract, data, { updatedDate: new Date().toISOString() });
    storage.save(STORAGE_KEYS.contracts, contracts);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật hợp đồng: ${contract.id}`,
        'edit_note',
        'indigo',
        'nhan-su'
      );
    }

    return { success: true, contract, message: 'Cập nhật hợp đồng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteContract(id) {
  try {
    const idx = contracts.findIndex(c => c.id === id);
    if (idx === -1) {return { success: false, message: 'Không tìm thấy' };}

    contracts.splice(idx, 1);
    storage.save(STORAGE_KEYS.contracts, contracts);
    return { success: true, message: 'Xóa hợp đồng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function renewContract(id, newEndDate) {
  try {
    const contract = getContractById(id);
    if (!contract) {return { success: false, message: 'Không tìm thấy' };}

    contract.ngayKetThuc = newEndDate;
    contract.trangThai = 'hoat-dong';
    contract.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.contracts, contracts);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã gia hạn hợp đồng: ${contract.id}`,
        'event_repeat',
        'blue',
        'nhan-su'
      );
    }

    return { success: true, message: 'Gia hạn hợp đồng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi gia hạn' };
  }
}

export function terminateContract(id, reason) {
  try {
    const contract = getContractById(id);
    if (!contract) {return { success: false, message: 'Không tìm thấy' };}

    contract.trangThai = 'ket-thuc';
    contract.lyDoKetThuc = reason || '';
    contract.ngayKetThuc = new Date().toISOString().split('T')[0];
    contract.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.contracts, contracts);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã chấm dứt hợp đồng: ${contract.id}`,
        'event_busy',
        'red',
        'nhan-su'
      );
    }

    return { success: true, message: 'Chấm dứt hợp đồng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi chấm dứt' };
  }
}

export function getContractsByEmployee(nhanVienId) {
  return contracts.filter(c => c.nhanVienId === nhanVienId);
}

export function getActiveContracts() {
  return contracts.filter(c => c.trangThai === 'hoat-dong');
}

export function getExpiringContracts(daysBeforeExpiry = 30) {
  const today = new Date();
  const expiryDate = new Date(today.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000);

  return contracts.filter(c => {
    if (!c.ngayKetThuc) {return false;}
    const endDate = new Date(c.ngayKetThuc);
    return endDate <= expiryDate && endDate >= today && c.trangThai === 'hoat-dong';
  });
}

export function getContractStats() {
  return {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.trangThai === 'hoat-dong').length,
    terminatedContracts: contracts.filter(c => c.trangThai === 'ket-thuc').length,
    expiringContracts: getExpiringContracts(30).length,
    totalPayroll: contracts.reduce((sum, c) => sum + (c.luongCoBan * c.heSoLuong || 0), 0)
  };
}
