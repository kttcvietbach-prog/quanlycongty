/**
 * Admin Module - Departments Management
 * Organization structure, departments, positions, levels
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';
import * as formatters from '../../lib/formatters.js';
import * as validators from '../../lib/validators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

// Module state
let departments = [];
let positions = [];
let levels = [];

/**
 * Initialize Admin module
 */
export function init() {
  departments = storage.load(STORAGE_KEYS.departments, []);
  positions = storage.load(STORAGE_KEYS.positions, []);
  levels = storage.load(STORAGE_KEYS.levels, []);

  console.log(`✅ Admin Module initialized:
    - Departments: ${departments.length}
    - Positions: ${positions.length}
    - Levels: ${levels.length}`);
}

/**
 * DEPARTMENTS
 */

export function getAllDepartments() {
  return [...departments];
}

export function getDepartmentById(id) {
  return departments.find(d => d.id === id);
}

export function createDepartment(data) {
  try {
    if (!data.tenPhongBan || data.tenPhongBan.trim() === '') {
      return { success: false, message: 'Tên phòng ban không được để trống' };
    }

    const department = {
      id: idGen.generateDepartmentCode(departments),
      tenPhongBan: data.tenPhongBan,
      moTa: data.moTa || '',
      truongPhong: data.truongPhong || '',
      soNhanVien: 0,
      trangThai: data.trangThai || 'hoat-dong',
      createdDate: new Date().toISOString()
    };

    departments.push(department);
    storage.save(STORAGE_KEYS.departments, departments);

    return { success: true, department, message: 'Tạo phòng ban thành công' };
  } catch (error) {
    console.error('Create department error:', error);
    return { success: false, message: 'Lỗi tạo phòng ban' };
  }
}

export function updateDepartment(id, data) {
  try {
    const dept = getDepartmentById(id);
    if (!dept) {
      return { success: false, message: 'Không tìm thấy phòng ban' };
    }

    Object.assign(dept, data);
    storage.save(STORAGE_KEYS.departments, departments);

    return { success: true, department: dept, message: 'Cập nhật phòng ban thành công' };
  } catch (error) {
    console.error('Update department error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteDepartment(id) {
  try {
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy phòng ban' };
    }

    departments.splice(index, 1);
    storage.save(STORAGE_KEYS.departments, departments);

    return { success: true, message: 'Xóa phòng ban thành công' };
  } catch (error) {
    console.error('Delete department error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

/**
 * POSITIONS
 */

export function getAllPositions() {
  return [...positions];
}

export function getPositionById(id) {
  return positions.find(p => p.id === id);
}

export function createPosition(data) {
  try {
    if (!data.tenChucVu || data.tenChucVu.trim() === '') {
      return { success: false, message: 'Tên chức vụ không được để trống' };
    }

    const position = {
      id: idGen.generatePositionCode(positions),
      tenChucVu: data.tenChucVu,
      moTa: data.moTa || '',
      mucLuongMin: data.mucLuongMin || 0,
      mucLuongMax: data.mucLuongMax || 0,
      yeuCau: data.yeuCau || '',
      createdDate: new Date().toISOString()
    };

    positions.push(position);
    storage.save(STORAGE_KEYS.positions, positions);

    return { success: true, position, message: 'Tạo chức vụ thành công' };
  } catch (error) {
    console.error('Create position error:', error);
    return { success: false, message: 'Lỗi tạo chức vụ' };
  }
}

export function updatePosition(id, data) {
  try {
    const pos = getPositionById(id);
    if (!pos) {
      return { success: false, message: 'Không tìm thấy chức vụ' };
    }

    Object.assign(pos, data);
    storage.save(STORAGE_KEYS.positions, positions);

    return { success: true, position: pos, message: 'Cập nhật chức vụ thành công' };
  } catch (error) {
    console.error('Update position error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deletePosition(id) {
  try {
    const index = positions.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy chức vụ' };
    }

    positions.splice(index, 1);
    storage.save(STORAGE_KEYS.positions, positions);

    return { success: true, message: 'Xóa chức vụ thành công' };
  } catch (error) {
    console.error('Delete position error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

/**
 * LEVELS
 */

export function getAllLevels() {
  return [...levels];
}

export function getLevelById(id) {
  return levels.find(l => l.id === id);
}

export function createLevel(data) {
  try {
    if (!data.tenCapBac || data.tenCapBac.trim() === '') {
      return { success: false, message: 'Tên cấp bậc không được để trống' };
    }

    const level = {
      id: idGen.generateLevelCode(levels),
      tenCapBac: data.tenCapBac,
      moTa: data.moTa || '',
      heSoLuong: data.heSoLuong || 1.0,
      createdDate: new Date().toISOString()
    };

    levels.push(level);
    storage.save(STORAGE_KEYS.levels, levels);

    return { success: true, level, message: 'Tạo cấp bậc thành công' };
  } catch (error) {
    console.error('Create level error:', error);
    return { success: false, message: 'Lỗi tạo cấp bậc' };
  }
}

export function updateLevel(id, data) {
  try {
    const lvl = getLevelById(id);
    if (!lvl) {
      return { success: false, message: 'Không tìm thấy cấp bậc' };
    }

    Object.assign(lvl, data);
    storage.save(STORAGE_KEYS.levels, levels);

    return { success: true, level: lvl, message: 'Cập nhật cấp bậc thành công' };
  } catch (error) {
    console.error('Update level error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteLevel(id) {
  try {
    const index = levels.findIndex(l => l.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy cấp bậc' };
    }

    levels.splice(index, 1);
    storage.save(STORAGE_KEYS.levels, levels);

    return { success: true, message: 'Xóa cấp bậc thành công' };
  } catch (error) {
    console.error('Delete level error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

/**
 * HELPER FUNCTIONS
 */

export function getDepartmentInfo(deptId) {
  return getDepartmentById(deptId);
}

export function getPositionInfo(posId) {
  return getPositionById(posId);
}

export function getLevelInfo(levelId) {
  return getLevelById(levelId);
}

export function getOrgStructure() {
  return {
    departments: getAllDepartments(),
    positions: getAllPositions(),
    levels: getAllLevels()
  };
}

export function searchDepartments(query) {
  const q = query.toLowerCase();
  return departments.filter(d =>
    d.tenPhongBan.toLowerCase().includes(q) ||
    d.id.includes(q)
  );
}
