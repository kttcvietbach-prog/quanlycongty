/**
 * ID Generator Utilities
 * Centralized ID generation for all entities
 */

/**
 * Generate numeric ID (find max + 1)
 * @param {array} items - Array of items with id property
 * @param {string} prefix - Optional prefix (e.g., 'PB')
 * @returns {string|number} Next ID
 */
export function generateNumericId(items = [], prefix = '') {
  if (!items || items.length === 0) {
    return prefix ? `${prefix}-1` : 1;
  }

  const maxId = Math.max(...items.map(item => {
    const id = item.id || '';
    const numPart = parseInt(String(id).replace(prefix, '')) || 0;
    return numPart;
  }));

  const nextId = maxId + 1;
  return prefix ? `${prefix}-${nextId}` : nextId;
}

/**
 * Generate random string ID
 * @param {string} prefix - Prefix for ID
 * @returns {string} Generated ID
 */
export function generateRandomId(prefix = '') {
  const randomPart = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

/**
 * Generate department code (PB-xxx)
 * @param {array} items - Existing departments
 * @returns {string} New department code
 */
export function generateDepartmentCode(items = []) {
  return generateNumericId(items, 'PB');
}

/**
 * Generate position code (CV-xxx)
 * @param {array} items - Existing positions
 * @returns {string} New position code
 */
export function generatePositionCode(items = []) {
  return generateNumericId(items, 'CV');
}

/**
 * Generate level code (CB-xxx)
 * @param {array} items - Existing levels
 * @returns {string} New level code
 */
export function generateLevelCode(items = []) {
  return generateNumericId(items, 'CB');
}

/**
 * Generate employee code (NV-xxx)
 * @param {array} items - Existing employees
 * @returns {string} New employee code
 */
export function generateEmployeeCode(items = []) {
  return generateNumericId(items, 'NV');
}

/**
 * Generate contract code (HD-xxx)
 * @param {array} items - Existing contracts
 * @returns {string} New contract code
 */
export function generateContractCode(items = []) {
  return generateNumericId(items, 'HD');
}

/**
 * Generate order code (DH-xxx)
 * @param {array} items - Existing orders
 * @returns {string} New order code
 */
export function generateOrderCode(items = []) {
  return generateNumericId(items, 'DH');
}

/**
 * Generate proposal code (XN-xxx)
 * @param {array} items - Existing proposals
 * @returns {string} New proposal code
 */
export function generateProposalCode(items = []) {
  return generateNumericId(items, 'XN');
}

/**
 * Generate quotation code (BG-xxx)
 * @param {array} items - Existing quotations
 * @returns {string} New quotation code
 */
export function generateQuotationCode(items = []) {
  return generateNumericId(items, 'BG');
}

/**
 * Generate project code (DA-xxx)
 * @param {array} items - Existing projects
 * @returns {string} New project code
 */
export function generateProjectCode(items = []) {
  return generateNumericId(items, 'DA');
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate timestamp ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Timestamp-based ID
 */
export function generateTimestampId(prefix = '') {
  const timestamp = Date.now();
  return prefix ? `${prefix}-${timestamp}` : timestamp.toString();
}

/**
 * Validate ID format
 * @param {string} id - ID to validate
 * @param {string} prefix - Expected prefix
 * @returns {boolean}
 */
export function validateIdFormat(id, prefix = '') {
  if (!id) {return false;}
  if (prefix && !String(id).startsWith(prefix)) {return false;}
  return true;
}
