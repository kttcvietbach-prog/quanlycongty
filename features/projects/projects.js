/**
 * Projects Module - Project Management
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let projects = [];
let tasks = [];

export function init() {
  projects = storage.load(STORAGE_KEYS.projects, []);
  tasks = storage.load(STORAGE_KEYS.tasks, []);
  console.log(`✅ Projects Module: ${projects.length} projects, ${tasks.length} tasks`);
}

/**
 * PROJECTS
 */
export function getAllProjects() { return [...projects]; }

export function getProjectById(id) { return projects.find(p => p.id === id); }

export function createProject(data) {
  try {
    if (!data.tenDuAn?.trim()) {return { success: false, message: 'Tên dự án không được để trống' };}

    const project = {
      id: idGen.generateProjectCode(projects),
      tenDuAn: data.tenDuAn,
      moTa: data.moTa || '',
      khachHang: data.khachHang || '',
      ngayBatDau: data.ngayBatDau || new Date().toISOString().split('T')[0],
      ngayKetThuc: data.ngayKetThuc || '',
      trangThai: 'moi-tao',
      leader: data.leader || '',
      members: data.members || [],
      budget: data.budget || 0,
      progress: 0,
      createdDate: new Date().toISOString()
    };

    projects.push(project);
    storage.save(STORAGE_KEYS.projects, projects);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tạo dự án mới: ${project.tenDuAn}`,
        'work',
        'blue',
        'du-an'
      );
    }

    return { success: true, project };
  } catch (error) {
    return { success: false };
  }
}

export function updateProject(id, data) {
  try {
    const proj = getProjectById(id);
    if (!proj) {return { success: false };}

    Object.assign(proj, data);
    storage.save(STORAGE_KEYS.projects, projects);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật dự án: ${proj.tenDuAn}`,
        'edit',
        'indigo',
        'du-an'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function startProject(id) {
  try {
    const proj = getProjectById(id);
    if (!proj) {return { success: false };}

    proj.trangThai = 'dang-thuc-hien';
    proj.startDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.projects, projects);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Dự án đã bắt đầu triển khai: ${proj.tenDuAn}`,
        'play_circle',
        'green',
        'du-an'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function completeProject(id) {
  try {
    const proj = getProjectById(id);
    if (!proj) {return { success: false };}

    proj.trangThai = 'hoan-thanh';
    proj.completedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.projects, projects);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Dự án đã hoàn thành: ${proj.tenDuAn}`,
        'task_alt',
        'teal',
        'du-an'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * TASKS
 */
export function getProjectTasks(projectId) {
  return tasks.filter(t => t.duAnId === projectId);
}

export function createTask(data) {
  try {
    const task = {
      id: idGen.generateRandomId('TASK'),
      duAnId: data.duAnId,
      tieuDe: data.tieuDe || '',
      moTa: data.moTa || '',
      nguoiThucHien: data.nguoiThucHien || '',
      ngayBatDau: data.ngayBatDau || new Date().toISOString().split('T')[0],
      ngayKetThuc: data.ngayKetThuc || '',
      trangThai: 'chua-bat-dau',
      uuTien: data.uuTien || 'trung-binh',
      hoanThanh: 0,
      createdDate: new Date().toISOString()
    };

    tasks.push(task);
    storage.save(STORAGE_KEYS.tasks, tasks);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Giao việc mới: ${task.tieuDe}`,
        'assignment',
        'orange',
        'du-an'
      );
    }

    return { success: true, task };
  } catch (error) {
    return { success: false };
  }
}

export function getProjectStats(projectId) {
  const projectTasks = getProjectTasks(projectId);
  const completedTasks = projectTasks.filter(t => t.trangThai === 'hoan-thanh').length;

  return {
    totalTasks: projectTasks.length,
    completedTasks,
    progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
  };
}

export function updateProjectProgress(projectId) {
  try {
    const stats = getProjectStats(projectId);
    const proj = getProjectById(projectId);
    if (proj) {
      proj.progress = stats.progress;
      storage.save(STORAGE_KEYS.projects, projects);
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
