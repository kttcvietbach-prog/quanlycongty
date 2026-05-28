/**
 * Home Page Module
 * Extracted from app.js - Trang chủ dashboard
 */

import { formatValue } from '../lib/utils.js';
import { getStatusLabel, getStatusColor } from '../lib/formatters.js';

/**
 * Render home page
 */
export function renderHomePage() {
    const modules = [
        { page: 'hanh-chinh', icon: 'corporate_fare', color: 'blue', title: 'Hành chính', desc: 'Công văn, hợp đồng, hồ sơ nhân sự, tiền lương.' },
        { page: 'van-hanh', icon: 'engineering', color: 'green', title: 'Quản lý dự án', desc: 'Quản lý vận hành, giám sát và quy trình (Process&Risk).' },
        { page: 'kinh-doanh', icon: 'monetization_on', color: 'orange', title: 'Kinh doanh', desc: 'Bán hàng, khách hàng, cơ hội và báo các kinh doanh.' },
        // ... more modules (truncated for brevity)
    ];

    const hour = new Date().getHours();
    let greeting = 'Chào buổi sáng';
    if (hour >= 12 && hour < 18) {greeting = 'Chào buổi chiều';}
    else if (hour >= 18) {greeting = 'Chào buổi tối';}

    const html = `
        <div class="home-page">
            <div class="home-greeting">
                <h1>${greeting}, <span id="home-user-name"></span> 👋</h1>
            </div>
            <div class="home-tabs">
                <button class="home-tab active" data-tab="functions">Chức năng</button>
                <button class="home-tab" data-tab="starred">Đánh dấu</button>
                <button class="home-tab" data-tab="all">Tất cả</button>
            </div>
            <div class="home-grid" id="home-grid"></div>
        </div>
    `;

    document.getElementById('pageContent').innerHTML = html;
    updateUserName();
    renderHomeGrid();
    attachHomeEvents();
}

/**
 * Update user name in greeting
 */
function updateUserName() {
    const userNameEl = document.getElementById('home-user-name');
    if (userNameEl) {
        // Dispatch event to get current user name
        const event = new CustomEvent('erp-get-user-name');
        document.dispatchEvent(event);
        userNameEl.textContent = window.erpApp?.getCurrentUserName?.() || 'Người dùng';
    }
}

/**
 * Render home grid modules
 */
function renderHomeGrid() {
    // Dispatch event to get filtered modules based on permissions/tabs
    const event = new CustomEvent('erp-render-home-grid');
    document.dispatchEvent(event);
}

/**
 * Attach home page events
 */
function attachHomeEvents() {
    // Tab switching
    document.querySelectorAll('.home-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            window.erpNav.setHomeTab(tab.dataset.tab);
        });
    });
}

// Auto-init when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.erpApp.getCurrentPage() === 'trang-chu') {
            renderHomePage();
        }
    });
} else if (window.erpApp?.getCurrentPage?.() === 'trang-chu') {
    renderHomePage();
}

// Listen for navigation events
document.addEventListener('erp-navigate', (e) => {
    if (e.detail.page === 'trang-chu') {
        renderHomePage();
    }
});

// Export for backward compatibility
window.HomePage = {
    renderHomePage
};

