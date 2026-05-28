/**
 * Permissions Module
 * Role-based access control
 */

import * as storage from '../lib/storage-manager.js';
import * as auth from './auth.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let permissions = {};

/**
 * Initialize permissions
 */
export function init() {
  permissions = storage.load(STORAGE_KEYS.permissions, {});
  console.log('✅ Permissions initialized');
}

/**
 * Check if current user has permission
 */
export function hasPermission(module, action = 'view') {
  const user = auth.getCurrentUser();
  if (!user) {return false;}

  // Admin/Manager has all permissions
  if (user.chucVu === 'Admin' || user.chucVu === 'Quản lý') {
    return true;
  }

  const userPermissions = permissions[user.id] || [];
  return userPermissions.some(p => p.module === module && p.actions.includes(action));
}

/**
 * Get user permissions
 */
export function getUserPermissions(userId) {
  return permissions[userId] || [];
}

/**
 * Get all permissions
 */
export function getAllPermissions() {
  return { ...permissions };
}

/**
 * Grant permission to user
 */
export function grantPermission(userId, module, actions = ['view']) {
  try {
    if (!permissions[userId]) {
      permissions[userId] = [];
    }

    const existingPerm = permissions[userId].find(p => p.module === module);

    if (existingPerm) {
      // Merge actions
      const newActions = [...new Set([...existingPerm.actions, ...actions])];
      existingPerm.actions = newActions;
    } else {
      permissions[userId].push({ module, actions });
    }

    storage.save(STORAGE_KEYS.permissions, permissions);
    return true;
  } catch (error) {
    console.error('Grant permission error:', error);
    return false;
  }
}

/**
 * Revoke permission from user
 */
export function revokePermission(userId, module, actions = null) {
  try {
    if (!permissions[userId]) {return false;}

    const userPerms = permissions[userId];
    const permIndex = userPerms.findIndex(p => p.module === module);

    if (permIndex === -1) {return false;}

    if (actions === null) {
      // Remove entire module permission
      userPerms.splice(permIndex, 1);
    } else {
      // Remove specific actions
      const perm = userPerms[permIndex];
      perm.actions = perm.actions.filter(a => !actions.includes(a));

      if (perm.actions.length === 0) {
        userPerms.splice(permIndex, 1);
      }
    }

    storage.save(STORAGE_KEYS.permissions, permissions);
    return true;
  } catch (error) {
    console.error('Revoke permission error:', error);
    return false;
  }
}

/**
 * Clear all permissions for user
 */
export function clearUserPermissions(userId) {
  try {
    delete permissions[userId];
    storage.save(STORAGE_KEYS.permissions, permissions);
    return true;
  } catch (error) {
    console.error('Clear user permissions error:', error);
    return false;
  }
}

/**
 * Copy permissions from one user to another
 */
export function copyPermissions(sourceUserId, targetUserId) {
  try {
    const sourcePerms = permissions[sourceUserId];
    if (!sourcePerms) {return false;}

    permissions[targetUserId] = JSON.parse(JSON.stringify(sourcePerms));
    storage.save(STORAGE_KEYS.permissions, permissions);
    return true;
  } catch (error) {
    console.error('Copy permissions error:', error);
    return false;
  }
}

/**
 * Get module permissions for user
 */
export function getModulePermissions(userId, module) {
  const userPerms = permissions[userId] || [];
  const modulePerm = userPerms.find(p => p.module === module);
  return modulePerm?.actions || [];
}

/**
 * Check multiple permissions
 */
export function hasAllPermissions(module, actions = []) {
  return actions.every(action => hasPermission(module, action));
}

/**
 * Check any permission
 */
export function hasAnyPermission(module, actions = []) {
  return actions.some(action => hasPermission(module, action));
}

/**
 * Get accessible modules for user
 */
export function getAccessibleModules(userId) {
  const userPerms = permissions[userId] || [];
  return userPerms.map(p => p.module);
}

/**
 * Set role permissions (predefined roles)
 */
export function setRolePermissions(userId, role) {
  const rolePermissions = {
    'admin': [
      { module: '*', actions: ['*'] } // All permissions
    ],
    'manager': [
      { module: 'hanh-chinh', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'nhan-vien', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'san-xuat', actions: ['view', 'create', 'edit'] },
      { module: 'tai-chinh', actions: ['view', 'create'] },
      { module: 'bao-cao', actions: ['view', 'export'] }
    ],
    'supervisor': [
      { module: 'nhan-vien', actions: ['view', 'edit'] },
      { module: 'san-xuat', actions: ['view', 'create', 'edit'] },
      { module: 'bao-cao', actions: ['view'] }
    ],
    'staff': [
      { module: 'nhan-vien', actions: ['view'] },
      { module: 'san-xuat', actions: ['view'] }
    ]
  };

  try {
    permissions[userId] = rolePermissions[role] || [];
    storage.save(STORAGE_KEYS.permissions, permissions);
    return true;
  } catch (error) {
    console.error('Set role permissions error:', error);
    return false;
  }
}

/**
 * Get available roles
 */
export function getAvailableRoles() {
  return ['admin', 'manager', 'supervisor', 'staff'];
}

/**
 * Require permission (throw if denied)
 */
export function requirePermission(module, action = 'view') {
  if (!hasPermission(module, action)) {
    throw new Error(`Bạn không có quyền: ${module}.${action}`);
  }
}

/**
 * Create permission audit log
 */
export function logPermissionCheck(module, action, allowed) {
  const user = auth.getCurrentUser();
  const log = {
    timestamp: new Date().toISOString(),
    userId: user?.id,
    userName: user?.hoTen,
    module,
    action,
    allowed
  };
  console.log('🔐 Permission check:', log);
  return log;
}
