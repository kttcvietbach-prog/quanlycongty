/**
 * Admin Module - Branch Management
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let branches = [];

export function init() {
  branches = storage.load(STORAGE_KEYS.branches, []);
  console.log(`✅ Admin Branches Module: ${branches.length} branches`);
}

/**
 * BRANCHES
 */
export function getAllBranches() { return [...branches]; }

export function getBranchById(id) { return branches.find(b => b.id === id); }

export function createBranch(data) {
  try {
    if (!data.tenChiNhanh?.trim()) {return { success: false, message: 'Tên chi nhánh không được để trống' };}

    const branch = {
      id: idGen.generateRandomId('CN'),
      tenChiNhanh: data.tenChiNhanh,
      maSoThue: data.maSoThue || '',
      diaChi: data.diaChi || '',
      thanhPho: data.thanhPho || '',
      quocGia: data.quocGia || 'Việt Nam',
      phone: data.phone || '',
      email: data.email || '',
      quanLyChiNhanh: data.quanLyChiNhanh || '', // ID người quản lý
      soLuongNhanVien: data.soLuongNhanVien || 0,
      loaiChiNhanh: data.loaiChiNhanh || 'chi-nhanh', // chi-nhánh, văn-phòng-đại-diện, xưởng-sản-xuất
      ngayThanhLap: data.ngayThanhLap || new Date().toISOString().split('T')[0],
      trangThai: 'hoat-dong',
      hoatDong: data.hoatDong || true,
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    branches.push(branch);
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true, branch, message: 'Tạo chi nhánh thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo chi nhánh' };
  }
}

export function updateBranch(id, data) {
  try {
    const branch = getBranchById(id);
    if (!branch) {return { success: false, message: 'Không tìm thấy chi nhánh' };}

    Object.assign(branch, data, { updatedDate: new Date().toISOString() });
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true, branch, message: 'Cập nhật chi nhánh thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteBranch(id) {
  try {
    const idx = branches.findIndex(b => b.id === id);
    if (idx === -1) {return { success: false, message: 'Không tìm thấy' };}

    branches.splice(idx, 1);
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true, message: 'Xóa chi nhánh thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function deactivateBranch(id, reason = '') {
  try {
    const branch = getBranchById(id);
    if (!branch) {return { success: false, message: 'Không tìm thấy' };}

    branch.trangThai = 'dung-hoat-dong';
    branch.lyDoDungHoatDong = reason;
    branch.hoatDong = false;
    branch.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true, message: 'Dừng hoạt động chi nhánh thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi dừng' };
  }
}

export function reactivateBranch(id) {
  try {
    const branch = getBranchById(id);
    if (!branch) {return { success: false, message: 'Không tìm thấy' };}

    branch.trangThai = 'hoat-dong';
    branch.hoatDong = true;
    branch.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true, message: 'Kích hoạt chi nhánh thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi kích hoạt' };
  }
}

export function getActiveBranches() {
  return branches.filter(b => b.trangThai === 'hoat-dong' && b.hoatDong);
}

export function getBranchesByCity(thanhPho) {
  return branches.filter(b => b.thanhPho === thanhPho);
}

export function getBranchesByManager(quanLyId) {
  return branches.filter(b => b.quanLyChiNhanh === quanLyId);
}

export function updateBranchEmployeeCount(id, count) {
  try {
    const branch = getBranchById(id);
    if (!branch) {return { success: false };}

    branch.soLuongNhanVien = count;
    branch.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.branches, branches);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function getBranchStats() {
  return {
    totalBranches: branches.length,
    activeBranches: getActiveBranches().length,
    inactiveBranches: branches.filter(b => b.trangThai === 'dung-hoat-dong').length,
    totalEmployees: branches.reduce((sum, b) => sum + (b.soLuongNhanVien || 0), 0),
    branchesByType: {
      branches: branches.filter(b => b.loaiChiNhanh === 'chi-nhanh').length,
      offices: branches.filter(b => b.loaiChiNhanh === 'van-phong-dai-dien').length,
      factories: branches.filter(b => b.loaiChiNhanh === 'xuong-san-xuat').length
    },
    citiesCount: new Set(branches.map(b => b.thanhPho)).size
  };
}

export function searchBranches(query) {
  const q = query.toLowerCase();
  return branches.filter(b =>
    b.tenChiNhanh.toLowerCase().includes(q) ||
    b.diaChi.toLowerCase().includes(q) ||
    b.thanhPho.toLowerCase().includes(q) ||
    b.phone.includes(q) ||
    b.email.toLowerCase().includes(q)
  );
}

export function getBranchHierarchy() {
  return {
    totalBranches: branches.length,
    byType: {
      headOffice: branches.filter(b => b.loaiChiNhanh === 'chi-nhanh').map(b => ({
        id: b.id,
        name: b.tenChiNhanh,
        manager: b.quanLyChiNhanh,
        employees: b.soLuongNhanVien
      })),
      branches: branches.filter(b => b.loaiChiNhanh === 'van-phong-dai-dien').map(b => ({
        id: b.id,
        name: b.tenChiNhanh,
        manager: b.quanLyChiNhanh
      })),
      factories: branches.filter(b => b.loaiChiNhanh === 'xuong-san-xuat').map(b => ({
        id: b.id,
        name: b.tenChiNhanh
      }))
    }
  };
}
