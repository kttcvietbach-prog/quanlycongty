/**
 * Authentication Module
 * User login, session management, permissions
 */

import * as storage from '../lib/storage-manager.js';
import * as formatters from '../lib/formatters.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let currentUser = null;
let authInitialized = false;

/**
 * Initialize authentication system
 */
export function init() {
  // Load current user from storage
  currentUser = storage.load(STORAGE_KEYS.currentUser);
  authInitialized = true;

  if (isLoggedIn()) {
    console.log('✅ User session loaded:', currentUser.hoTen);
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return currentUser && currentUser.id;
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get current user ID
 */
export function getCurrentUserId() {
  return currentUser?.id || null;
}

/**
 * Get current user name
 */
export function getCurrentUserName() {
  return currentUser?.hoTen || 'Guest';
}

/**
 * Get current user avatar initials
 */
export function getCurrentUserInitials() {
  return formatters.getInitials(currentUser?.hoTen || '?');
}

/**
 * Get user by ID
 */
export function getUserById(userId) {
  const users = storage.load(STORAGE_KEYS.users, []);
  return users.find(u => u.id === userId);
}

/**
 * Login user
 */
export function login(username, password) {
  try {
    const users = storage.load(STORAGE_KEYS.users, []);
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
    }

    // Set current user
    currentUser = {
      id: user.id,
      hoTen: user.hoTen,
      email: user.email,
      username: user.username,
      chucVu: user.chucVu,
      phongBan: user.phongBan,
      avatar: user.avatar,
      loginTime: new Date().toISOString()
    };

    // Save to storage
    storage.save(STORAGE_KEYS.currentUser, currentUser);

    // Add to sessions
    const sessions = storage.load(STORAGE_KEYS.sessions, []);
    sessions.push({
      userId: user.id,
      loginTime: currentUser.loginTime,
      ipAddress: 'localhost',
      device: navigator.userAgent
    });
    storage.save(STORAGE_KEYS.sessions, sessions);

    console.log('✅ Login successful:', user.hoTen);
    return { success: true, message: 'Đăng nhập thành công', user: currentUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Lỗi đăng nhập: ' + error.message };
  }
}

/**
 * Logout user
 */
export function logout() {
  try {
    if (currentUser) {
      console.log('👋 Logout:', currentUser.hoTen);
    }

    currentUser = null;
    storage.remove(STORAGE_KEYS.currentUser);

    return { success: true, message: 'Đăng xuất thành công' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Lỗi đăng xuất' };
  }
}

/**
 * Change password
 */
export function changePassword(oldPassword, newPassword) {
  try {
    if (!isLoggedIn()) {
      return { success: false, message: 'Chưa đăng nhập' };
    }

    const users = storage.load(STORAGE_KEYS.users, []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    if (users[userIndex].password !== oldPassword) {
      return { success: false, message: 'Mật khẩu cũ không đúng' };
    }

    users[userIndex].password = newPassword;
    storage.save(STORAGE_KEYS.users, users);

    return { success: true, message: 'Đổi mật khẩu thành công' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: 'Lỗi đổi mật khẩu' };
  }
}

/**
 * Check permission
 */
export function hasPermission(module, action = 'view') {
  try {
    if (!isLoggedIn()) {return false;}

    // Admin has all permissions
    if (currentUser.chucVu === 'Quản lý' || currentUser.chucVu === 'Admin') {
      return true;
    }

    const permissions = storage.load(STORAGE_KEYS.permissions, {});
    const userPermissions = permissions[currentUser.id] || [];

    return userPermissions.some(p => p.module === module && p.actions.includes(action));
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Require permission (throw error if no permission)
 */
export function requirePermission(module, action = 'view') {
  if (!hasPermission(module, action)) {
    throw new Error(`Bạn không có quyền truy cập: ${module}.${action}`);
  }
}

/**
 * Update user profile
 */
export function updateProfile(updates) {
  try {
    if (!isLoggedIn()) {
      return { success: false, message: 'Chưa đăng nhập' };
    }

    // Update current user
    Object.assign(currentUser, updates);

    // Save to storage
    storage.save(STORAGE_KEYS.currentUser, currentUser);

    // Update in users array
    const users = storage.load(STORAGE_KEYS.users, []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      Object.assign(users[userIndex], updates);
      storage.save(STORAGE_KEYS.users, users);
    }

    return { success: true, message: 'Cập nhật hồ sơ thành công', user: currentUser };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Lỗi cập nhật hồ sơ' };
  }
}

/**
 * Get user avatar URL
 */
export function getUserAvatarUrl(userId) {
  const user = getUserById(userId);
  return user?.avatar || null;
}

/**
 * Get user department
 */
export function getUserDepartment(userId) {
  const user = getUserById(userId);
  return user?.phongBan || null;
}

/**
 * Get all users
 */
export function getAllUsers() {
  return storage.load(STORAGE_KEYS.users, []);
}

/**
 * Get users by department
 */
export function getUsersByDepartment(departmentId) {
  const users = getAllUsers();
  return users.filter(u => u.phongBan === departmentId);
}

/**
 * Get sessions
 */
export function getSessions() {
  return storage.load(STORAGE_KEYS.sessions, []);
}

/**
 * Clear old sessions
 */
export function clearOldSessions(daysOld = 30) {
  try {
    const sessions = storage.load(STORAGE_KEYS.sessions, []);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const activeSessions = sessions.filter(s => {
      const sessionDate = new Date(s.loginTime);
      return sessionDate > cutoffDate;
    });

    storage.save(STORAGE_KEYS.sessions, activeSessions);
    return { success: true, removed: sessions.length - activeSessions.length };
  } catch (error) {
    console.error('Clear sessions error:', error);
    return { success: false };
  }
}
