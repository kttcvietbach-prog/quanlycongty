/**
 * ERP Core Utilities
 * Extracted from app.js - Centralized utils for formatting, notifications, parsing
 */

const viFmt = new Intl.NumberFormat('vi-VN');

/**
 * Formats numeric value for Vietnamese display (dot thousands separator)
 */
export function formatValue(val, options = {}) {
    if (val === undefined || val === null || isNaN(val)) {return '0';}
    if (Object.keys(options).length > 0) {
        return new Intl.NumberFormat('vi-VN', options).format(parseFloat(val));
    }
    return viFmt.format(parseFloat(val));
}

/**
 * Parses Vietnamese formatted number (1.500.000 → 1500000)
 */
export function parseVND(str) {
    if (!str) {return 0;}
    if (typeof str === 'number') {return str;}
    const clean = str.toString().replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

/**
 * Cleans input to number (removes non-numeric except decimal)
 */
export function cleanNum(str) {
    return parseVND(str);
}

/**
 * Real-time number input formatter (oninput event)
 */
export function formatNumberInput(input) {
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;
    
    let val = input.value.replace(/\D/g, '');
    if (val === '') {
        input.value = '';
        return;
    }
    
    const formatted = viFmt.format(parseInt(val));
    input.value = formatted;
    
    // Adjust cursor position
    let newLength = input.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    input.setSelectionRange(cursorPosition, cursorPosition);
}

/**
 * Quantity formatter (allows decimals/comma)
 */
export function formatQuantityInput(input) {
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;
    
    let val = input.value.replace(/[^\d,]/g, '');
    const parts = val.split(',');
    
    if (parts.length > 2) {
        val = parts[0] + ',' + parts.slice(1).join('');
    }
    
    if (val === '') {
        input.value = '';
        return;
    }

    let integerPart = parts[0].replace(/\D/g, '');
    let decimalPart = parts[1] !== undefined ? ',' + parts[1].replace(/\D/g, '') : '';
    
    if (integerPart === '' && decimalPart !== '') {integerPart = '0';}
    
    const formattedInt = integerPart !== '' ? viFmt.format(parseInt(integerPart)) : '';
    input.value = formattedInt + decimalPart;
    
    let newLength = input.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    input.setSelectionRange(cursorPosition, cursorPosition);
}

/**
 * Centralized CRUD notification (extracted from app.js)
 */
export function notifyCRUD(moduleName, action, metadata = {}) {
    let title = '';
    let icon = '';
    let color = '';
    
    const name = metadata.name || metadata.id || '';
    const nameSuffix = name ? `: ${name}` : '';

    switch(action) {
        case 'add':
            title = `Đã thêm ${moduleName}${nameSuffix}`;
            icon = 'add_circle';
            color = 'blue';
            break;
        case 'update':
            title = `Đã cập nhật ${moduleName}${nameSuffix}`;
            icon = 'edit';
            color = 'indigo';
            break;
        case 'delete':
            title = `Đã xóa ${moduleName}${nameSuffix}`;
            icon = 'delete_sweep';
            color = 'red';
            break;
        case 'submit_bod':
            title = `Đã trình Ban Giám đốc ${moduleName}${nameSuffix}`;
            icon = 'outgoing_mail';
            color = 'purple';
            break;
    }

    // 1. Push to system bell notification
    if (window.erpApp && typeof window.erpApp.addNotification === 'function') {
        const target = metadata.page ? { page: metadata.page, projectId: metadata.projectId } : null;
        window.erpApp.addNotification(title, icon, color, target);
    } else {
        // Fallback: dispatch custom event for early-loading modules before app.js is ready
        const event = new CustomEvent('erp-notification', {
            detail: { title, icon, color, metadata }
        });
        document.dispatchEvent(event);
    }

    // 3. Queue email notification (debounced to batch multiple changes)
    // Disabled as per user request: CRUD operations should only notify in system UI, not via email.
    // _queueEmailNotification(moduleName, action, title, metadata);
}

// Email notification queue and debounce
let _emailQueue = [];
let _emailDebounceTimer = null;
const EMAIL_DEBOUNCE_MS = 10000; // Batch notifications every 10 seconds

function _queueEmailNotification(moduleName, action, title, metadata) {
    const user = (() => {
        try { return JSON.parse(sessionStorage.getItem('erp_user') || '{}'); } catch(e) { return {}; }
    })();

    _emailQueue.push({
        module: moduleName,
        action: action,
        title: title,
        user: user.name || user.email || 'Hệ thống',
        time: new Date().toLocaleString('vi-VN'),
        metadata: metadata
    });

    // Debounce: wait for more changes before sending batch email
    if (_emailDebounceTimer) clearTimeout(_emailDebounceTimer);
    _emailDebounceTimer = setTimeout(() => {
        _flushEmailQueue();
    }, EMAIL_DEBOUNCE_MS);
}

async function _flushEmailQueue() {
    if (_emailQueue.length === 0) return;

    const batch = [..._emailQueue];
    _emailQueue = [];

    // Check if email notifications are enabled
    const emailEnabled = localStorage.getItem('erp_email_notify_enabled');
    if (emailEnabled === 'false') return;

    const actionEmoji = { add: '🟢', update: '🔵', delete: '🔴', submit_bod: '🟣' };
    const subject = `[VIETBACHCORP ERP] ${batch.length} thay đổi dữ liệu - ${new Date().toLocaleDateString('vi-VN')}`;
    const body = `Chào Ban Quản Lý,\n\nHệ thống ghi nhận ${batch.length} thay đổi dữ liệu:\n\n` +
        batch.map((item, i) => 
            `${i + 1}. ${actionEmoji[item.action] || '⚪'} ${item.title}\n   Người thực hiện: ${item.user}\n   Thời gian: ${item.time}`
        ).join('\n\n') +
        `\n\nTrân trọng,\nVIETBACHCORP ERP System`;

    try {
        const res = await fetch((window.API_BASE_URL || '') + '/api/send-notification-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, changes: batch })
        });
        if (res.ok) {
            console.log(`[EmailNotify] Sent batch email with ${batch.length} changes`);
        }
    } catch (err) {
        // Server not running or email not configured - silent fail
        console.log(`[EmailNotify] Server unavailable, skipping email for ${batch.length} changes`);
    }
}

/**
 * Show delete confirmation dialog
 */
export function showDeleteConfirmation(first, second, third, options = {}) {
    let title, message, onConfirm;
    
    if (typeof second === 'function') {
        // Signature: showDeleteConfirmation(message, onConfirm)
        title = options.title || 'Xác nhận xóa';
        message = first;
        onConfirm = second;
    } else {
        // Signature: showDeleteConfirmation(itemType, itemName, onConfirm, options)
        title = 'Xóa ' + (first || 'dữ liệu');
        message = `Bạn có chắc chắn muốn xóa <strong>${second || 'mục này'}</strong>?<br><span style="color: #94a3b8; font-size: 12px;">Tác vụ này không thể hoàn tác.</span>`;
        onConfirm = third;
    }
    
    // Dispatch custom event
    const event = new CustomEvent('erp-confirm-dialog', {
        detail: { title, message, onConfirm }
    });
    document.dispatchEvent(event);
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'success') {
    const event = new CustomEvent('erp-toast', {
        detail: { message, type }
    });
    document.dispatchEvent(event);
}

// Export for backward compatibility
window.erpUtils = {
    formatValue,
    parseVND,
    cleanNum,
    formatNumberInput,
    formatQuantityInput,
    notifyCRUD,
    showDeleteConfirmation,
    showToast
};

// GLOBAL BRIDGE: Expose to window for legacy scripts calling them directly
window.showToast = showToast;
window.formatValue = formatValue;
window.parseVND = parseVND;
window.cleanNum = cleanNum;
window.notifyCRUD = notifyCRUD;
window.showDeleteConfirmation = showDeleteConfirmation;
window.formatNumberInput = formatNumberInput;
window.formatQuantityInput = formatQuantityInput;

// Alias for erpApp namespace
window.erpApp = window.erpApp || {};
window.erpApp.notifyCRUD = notifyCRUD;
window.erpApp.showToast = showToast;
window.erpApp.formatValue = formatValue;
window.erpApp.parseVND = parseVND;
window.erpApp.cleanNum = cleanNum;
window.erpApp.formatNumberInput = formatNumberInput;
window.erpApp.formatQuantityInput = formatQuantityInput;
window.erpApp.showDeleteConfirmation = showDeleteConfirmation;

