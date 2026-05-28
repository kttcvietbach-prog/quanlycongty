/**
 * Profile Module
 * User profile management and settings
 */

import * as storage from '../lib/storage-manager.js';
import * as auth from './auth.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

/**
 * Get user profile
 */
export function getProfile(userId = null) {
  const targetUserId = userId || auth.getCurrentUserId();
  if (!targetUserId) {return null;}

  return auth.getUserById(targetUserId);
}

/**
 * Get current user profile
 */
export function getCurrentProfile() {
  return getProfile();
}

/**
 * Update profile
 */
export function updateProfile(updates, userId = null) {
  try {
    const targetUserId = userId || auth.getCurrentUserId();
    if (!targetUserId) {
      return { success: false, message: 'Chưa đăng nhập' };
    }

    const users = storage.load(STORAGE_KEYS.users, []);
    const user = users.find(u => u.id === targetUserId);

    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    // Update fields (exclude sensitive fields)
    const allowedFields = ['hoTen', 'email', 'phone', 'avatar', 'birthday', 'address', 'city'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    }

    storage.save(STORAGE_KEYS.users, users);

    // If updating current user, also update session
    if (targetUserId === auth.getCurrentUserId()) {
      auth.updateProfile(updates);
    }

    return { success: true, message: 'Cập nhật hồ sơ thành công' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Lỗi cập nhật hồ sơ' };
  }
}

/**
 * Upload avatar
 */
export function uploadAvatar(file, userId = null) {
  try {
    const targetUserId = userId || auth.getCurrentUserId();

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;

      // Update profile with avatar
      updateProfile({ avatar: base64 }, targetUserId);
    };
    reader.readAsDataURL(file);

    return { success: true, message: 'Avatar đang được tải lên' };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, message: 'Lỗi tải lên avatar' };
  }
}

/**
 * Get user preferences
 */
export function getPreferences(userId = null) {
  const targetUserId = userId || auth.getCurrentUserId();
  const profile = getProfile(targetUserId);

  return {
    theme: profile?.theme || 'light',
    language: profile?.language || 'vi',
    timeFormat: profile?.timeFormat || '24h',
    dateFormat: profile?.dateFormat || 'DD/MM/YYYY',
    notifications: profile?.notifications || true,
    emailNotifications: profile?.emailNotifications || false
  };
}

/**
 * Update preferences
 */
export function updatePreferences(preferences, userId = null) {
  try {
    const targetUserId = userId || auth.getCurrentUserId();

    const users = storage.load(STORAGE_KEYS.users, []);
    const user = users.find(u => u.id === targetUserId);

    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    // Update preference fields
    Object.assign(user, preferences);
    storage.save(STORAGE_KEYS.users, users);

    return { success: true, message: 'Cập nhật tùy chọn thành công' };
  } catch (error) {
    console.error('Update preferences error:', error);
    return { success: false, message: 'Lỗi cập nhật tùy chọn' };
  }
}

/**
 * Get user activity
 */
export function getUserActivity(userId) {
  const sessions = storage.load(STORAGE_KEYS.sessions, []);
  return sessions.filter(s => s.userId === userId);
}

/**
 * Get user statistics
 */
export function getUserStats(userId) {
  const user = auth.getUserById(userId);
  const activity = getUserActivity(userId);

  return {
    totalLogins: activity.length,
    lastLogin: activity[0]?.loginTime || null,
    createdDate: user?.createdDate || null,
    status: user?.status || 'active',
    department: user?.phongBan || null,
    position: user?.chucVu || null
  };
}

/**
 * Verify email
 */
export function verifyEmail(email) {
  const users = storage.load(STORAGE_KEYS.users, []);
  return users.some(u => u.email === email);
}

/**
 * Check if email is unique (for registration)
 */
export function isEmailUnique(email, excludeUserId = null) {
  const users = storage.load(STORAGE_KEYS.users, []);
  return !users.some(u => u.email === email && u.id !== excludeUserId);
}

/**
 * Check if username is unique
 */
export function isUsernameUnique(username, excludeUserId = null) {
  const users = storage.load(STORAGE_KEYS.users, []);
  return !users.some(u => u.username === username && u.id !== excludeUserId);
}
