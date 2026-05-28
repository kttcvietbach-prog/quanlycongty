/**
 * Auth Module Tests
 * Basic unit tests for authentication
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as auth from '../core/auth.js';
import * as storage from '../lib/storage-manager.js';

// Mock storage
vi.mock('../lib/storage-manager.js');

const mockUsers = [
  { id: '1', username: 'admin', password: 'pass123', hoTen: 'Admin User' }
];

describe('Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.load.mockImplementation((key, defaultValue) => {
      if (key === 'erp_users') {return mockUsers;}
      return defaultValue;
    });
  });

  it('should login successfully with valid credentials', () => {
    const result = auth.login('admin', 'pass123');
    expect(result.success).toBe(true);
    expect(result.user.hoTen).toBe('Admin User');
  });

  it('should reject invalid login', () => {
    const result = auth.login('wrong', 'user');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Sai tên đăng nhập');
  });

  it('should check isLoggedIn correctly', () => {
    expect(auth.isLoggedIn()).toBe(false);
    
    auth.login('admin', 'pass123');
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('should logout successfully', () => {
    auth.login('admin', 'pass123');
    const result = auth.logout();
    expect(result.success).toBe(true);
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('should handle change password', () => {
    auth.login('admin', 'pass123');
    const result = auth.changePassword('pass123', 'newpass456');
    expect(result.success).toBe(true);
  });
});

