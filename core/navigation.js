/**
 * Navigation Module
 * Centralized navigation, breadcrumb, history management
 * Extracted from app.js
 */

let currentPage = 'trang-chu';
let navigationHistory = [];
let homeTab = 'functions';

/**
 * Navigate to page
 */
export function navigateTo(page, isBack = false) {
    // Save to history (avoid duplicates)
    if (!isBack && currentPage !== page) {
        if (navigationHistory.length === 0 || navigationHistory[navigationHistory.length - 1] !== currentPage) {
            navigationHistory.push(currentPage);
            if (navigationHistory.length > 50) {navigationHistory.shift();}
        }
    }
    
    currentPage = page;
    dispatchNavigationEvent(page);
}

/**
 * Go back in history
 */
export function goBack() {
    if (navigationHistory.length > 0) {
        const prevPage = navigationHistory.pop();
        navigateTo(prevPage, true);
    } else if (currentPage !== 'trang-chu') {
        navigateTo('trang-chu');
    }
}

/**
 * Go home
 */
export function goHome() {
    navigateTo('trang-chu');
}

/**
 * Update breadcrumb
 */
export function updateBreadcrumb(currentTitle, parentTitle = null) {
    const detail = { currentTitle, parentTitle };
    document.dispatchEvent(new CustomEvent('erp-breadcrumb-update', { detail }));
}

/**
 * Get current page
 */
export function getCurrentPage() {
    return currentPage;
}

/**
 * Set home tab
 */
export function setHomeTab(tab) {
    homeTab = tab;
    document.dispatchEvent(new CustomEvent('erp-home-tab-change', { detail: { tab } }));
}

/**
 * Toggle tab (all/starred)
 */
export function setTab(tab) {
    document.dispatchEvent(new CustomEvent('erp-tab-change', { detail: { tab } }));
}

/**
 * Search handler
 */
export function onSearch(query) {
    document.dispatchEvent(new CustomEvent('erp-search', { detail: { query } }));
}

/**
 * Toggle star/favorite
 */
export function toggleStar(title) {
    document.dispatchEvent(new CustomEvent('erp-toggle-star', { detail: { title } }));
}

/**
 * Open module (rich navigation)
 */
export function openModule(title, contentEl = null) {
    const detail = { title, contentEl };
    document.dispatchEvent(new CustomEvent('erp-open-module', { detail }));
}

/**
 * Permission check wrapper
 */
export function userHasAccess(moduleName) {
    // Dispatch to auth module
    const event = new CustomEvent('erp-check-permission', { 
        detail: { moduleName, action: 'view' } 
    });
    document.dispatchEvent(event);
    return true; // Placeholder
}

/**
 * Update sidebar visibility based on permissions
 */
export function updateSidebarVisibility() {
    document.dispatchEvent(new CustomEvent('erp-update-sidebar'));
}

/**
 * Dispatch navigation event for page renders to listen
 */
function dispatchNavigationEvent(page) {
    document.dispatchEvent(new CustomEvent('erp-navigate', { 
        detail: { page, isBack: false } 
    }));
}

// Export for backward compatibility
window.erpNav = {
    navigateTo,
    goBack,
    goHome,
    updateBreadcrumb,
    getCurrentPage,
    setHomeTab,
    setTab,
    onSearch,
    toggleStar,
    openModule,
    updateSidebarVisibility
};

