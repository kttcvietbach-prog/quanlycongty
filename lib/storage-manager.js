/**
 * Storage Manager - Centralized localStorage management
 * Wraps all localStorage operations with consistent error handling
 */

const STORAGE_PREFIX = 'erp_';

// Centralized storage keys
const STORAGE_KEYS = {
  // User & Session
  users: 'users_db',
  currentUser: 'current_user',
  sessions: 'sessions',
  permissions: 'permissions',

  // Admin
  departments: 'departments',
  positions: 'positions',
  levels: 'levels',
  branches: 'branches',
  enterpriseInfo: 'enterprise_info',
  functions: 'functions',

  // HR
  employees: 'employees',
  contracts: 'contracts',
  attendance: 'attendance',
  payroll: 'payroll',

  // Documents
  documents: 'documents',
  communications: 'communications',
  approvals: 'approvals',
  categories: 'categories',

  // Procurement
  suppliers: 'suppliers',
  rfqs: 'rfqs',
  purchaseOrders: 'purchase_orders',
  salesOrders: 'sales_orders',
  quotations: 'quotations',
  inventory: 'inventory',

  // Sales
  customers: 'customers',

  // Projects
  projects: 'projects',
  tasks: 'tasks',
  teams: 'teams',
  materials: 'materials',
  equipment: 'equipment',
  finance: 'finance',
  labor: 'labor',
  wbs: 'wbs',
  projectContracts: 'project_contracts',

  // Operations
  products: 'products',
  production: 'production',
  boms: 'boms',
  routing: 'routing',
  workCenters: 'work_centers',

  // Warehouse
  receipts: 'receipts',
  shipments: 'shipments',

  // Vehicle Management
  vehicles: 'vm_vehicles',
  usage: 'vm_usage',
  maintenance: 'vm_maintenance',
  costs: 'vm_costs',
  drivers: 'vm_drivers',

  // Other
  backupHistory: 'backup_history',
  notifications: 'notifications'
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key (without prefix)
 * @param {*} data - Data to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export function save(key, data) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const jsonData = JSON.stringify(data);
    localStorage.setItem(fullKey, jsonData);
    return true;
  } catch (error) {
    console.error(`Storage save error for key "${key}":`, error);
    return false;
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key (without prefix)
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Stored data or default value
 */
export function load(key, defaultValue = null) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const jsonData = localStorage.getItem(fullKey);

    if (jsonData === null) {
      return defaultValue;
    }

    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Storage load error for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key (without prefix)
 * @returns {boolean} Success status
 */
export function remove(key) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all storage (dangerous!)
 * @returns {boolean} Success status
 */
export function clearAll() {
  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      remove(key);
    }
    return true;
  } catch (error) {
    console.error('Storage clearAll error:', error);
    return false;
  }
}

/**
 * Get all keys
 * @returns {object} Object with all storage keys
 */
export function getKeys() {
  return STORAGE_KEYS;
}

/**
 * Check if key exists in storage
 * @param {string} key - Storage key
 * @returns {boolean}
 */
export function exists(key) {
  const fullKey = STORAGE_PREFIX + key;
  return localStorage.getItem(fullKey) !== null;
}

/**
 * Get storage size info
 * @returns {object} Storage statistics
 */
export function getStorageInfo() {
  let totalSize = 0;
  let itemCount = 0;

  for (let key in localStorage) {
    if (key.startsWith(STORAGE_PREFIX)) {
      itemCount++;
      totalSize += localStorage[key].length;
    }
  }

  return {
    itemCount,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    totalSizeBytes: totalSize
  };
}

// Export keys for use in other modules
export { STORAGE_KEYS };
