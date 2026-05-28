/**
 * Notifications Module
 * System notifications and alert management
 */

import * as storage from '../lib/storage-manager.js';
import * as formatters from '../lib/formatters.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let notifications = [];
let notificationListeners = [];

/**
 * Initialize notifications
 */
export function init() {
  notifications = storage.load(STORAGE_KEYS.notifications, []);
  console.log('✅ Notifications initialized:', notifications.length);
}

/**
 * Add notification
 */
export function add(notification) {
  try {
    const newNotif = {
      id: 'notif-' + Date.now(),
      type: notification.type || 'info', // info, success, warning, error
      title: notification.title || 'Thông báo',
      message: notification.message || '',
      data: notification.data || {},
      read: notification.read || false,
      timestamp: new Date().toISOString(),
      action: notification.action || null
    };

    notifications.unshift(newNotif);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications = notifications.slice(0, 100);
    }

    // Save to storage
    storage.save(STORAGE_KEYS.notifications, notifications);

    // Notify listeners
    notifyListeners('added', newNotif);

    // Auto-dismiss certain types
    if (newNotif.type === 'success' || newNotif.type === 'info') {
      setTimeout(() => dismiss(newNotif.id), 5000);
    }

    return newNotif;
  } catch (error) {
    console.error('Add notification error:', error);
  }
}

/**
 * Show info notification
 */
export function info(message, title = 'Thông báo') {
  return add({ type: 'info', title, message });
}

/**
 * Show success notification
 */
export function success(message, title = 'Thành công') {
  return add({ type: 'success', title, message });
}

/**
 * Show warning notification
 */
export function warning(message, title = 'Cảnh báo') {
  return add({ type: 'warning', title, message });
}

/**
 * Show error notification
 */
export function error(message, title = 'Lỗi') {
  return add({ type: 'error', title, message });
}

/**
 * Get all notifications
 */
export function getAll() {
  return [...notifications];
}

/**
 * Get unread notifications
 */
export function getUnread() {
  return notifications.filter(n => !n.read);
}

/**
 * Get unread count
 */
export function getUnreadCount() {
  return getUnread().length;
}

/**
 * Mark as read
 */
export function markAsRead(notificationId) {
  try {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      storage.save(STORAGE_KEYS.notifications, notifications);
      notifyListeners('read', notif);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Mark as read error:', error);
    return false;
  }
}

/**
 * Mark all as read
 */
export function markAllAsRead() {
  try {
    notifications.forEach(n => n.read = true);
    storage.save(STORAGE_KEYS.notifications, notifications);
    notifyListeners('all-read', null);
    return true;
  } catch (error) {
    console.error('Mark all as read error:', error);
    return false;
  }
}

/**
 * Dismiss notification
 */
export function dismiss(notificationId) {
  try {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const removed = notifications.splice(index, 1)[0];
      storage.save(STORAGE_KEYS.notifications, notifications);
      notifyListeners('dismissed', removed);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Dismiss notification error:', error);
    return false;
  }
}

/**
 * Clear all notifications
 */
export function clearAll() {
  try {
    notifications = [];
    storage.save(STORAGE_KEYS.notifications, notifications);
    notifyListeners('cleared', null);
    return true;
  } catch (error) {
    console.error('Clear notifications error:', error);
    return false;
  }
}

/**
 * Subscribe to notification changes
 */
export function subscribe(callback) {
  notificationListeners.push(callback);
  return () => {
    notificationListeners = notificationListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notify all listeners
 */
function notifyListeners(action, data) {
  notificationListeners.forEach(callback => {
    try {
      callback(action, data);
    } catch (error) {
      console.error('Notification listener error:', error);
    }
  });
}

/**
 * Get notification color by type
 */
export function getTypeColor(type) {
  const colors = {
    info: '#4A7CFF',
    success: '#34C759',
    warning: '#FFB300',
    error: '#FF5757'
  };
  return colors[type] || colors.info;
}

/**
 * Get notification icon by type
 */
export function getTypeIcon(type) {
  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error'
  };
  return icons[type] || icons.info;
}

/**
 * Format notification time
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {return 'Vừa xong';}
  if (diffMins < 60) {return `${diffMins}m trước`;}
  if (diffHours < 24) {return `${diffHours}h trước`;}
  if (diffDays < 7) {return `${diffDays}d trước`;}

  return formatters.formatDate(timestamp);
}

/**
 * Create notification from system event
 */
export function createSystemNotification(event, data = {}) {
  const notifMap = {
    'user-login': { title: 'Đăng nhập', message: 'Người dùng đã đăng nhập' },
    'user-logout': { title: 'Đăng xuất', message: 'Người dùng đã đăng xuất' },
    'data-saved': { title: 'Lưu thành công', message: 'Dữ liệu đã được lưu', type: 'success' },
    'data-error': { title: 'Lỗi', message: 'Đã xảy ra lỗi', type: 'error' },
    'data-deleted': { title: 'Xóa thành công', message: 'Dữ liệu đã được xóa', type: 'success' },
    'data-restored': { title: 'Khôi phục thành công', message: 'Dữ liệu đã được khôi phục', type: 'success' }
  };

  const notifConfig = notifMap[event] || { title: 'Thông báo', message: 'Sự kiện: ' + event };
  return add({ ...notifConfig, data });
}
