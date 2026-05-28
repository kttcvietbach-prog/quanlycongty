/**
 * Profile Page Module
 * Extracted from app.js - Hồ sơ cá nhân
 */

import { getInitials, formatDate } from '../lib/formatters.js';

/**
 * Render profile page
 */
export function renderProfilePage() {
    const profile = getProfileData();
    const avatarHTML = profile.avatar 
        ? `<img src="${profile.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
        : `<span class="avatar-initials">${getInitials(profile.fullName)}</span>`;

    const html = `
        <div class="profile-page-wrapper">
            <div class="profile-layout">
                <!-- Sidebar with avatar, info, actions -->
                <div class="profile-sidebar">
                    <div class="profile-avatar-large">
                        ${avatarHTML}
                        <div class="profile-avatar-status"></div>
                    </div>
                    <div class="profile-name">${profile.fullName}</div>
                    <div class="profile-role-badge">${profile.role}</div>
                    <!-- Contact info rows -->
                    <!-- Action buttons: change avatar, change password -->
                </div>
                <!-- Main content panels: Personal, Work, Contact info -->
                <div class="profile-main-content">
                    <div class="profile-panel">
                        <h3>Thông tin cá nhân <button onclick="window.erpApp.openEditProfile()">Chỉnh sửa</button></h3>
                        <!-- Grid of personal fields -->
                    </div>
                    <!-- More panels -->
                </div>
            </div>
        </div>
    `;

    document.getElementById('pageContent').innerHTML = html;
    attachProfileEvents();
}

/**
 * Get profile data (from localStorage or default)
 */
export function getProfileData() {
    // Dispatch to auth or storage
    const event = new CustomEvent('erp-get-profile');
    document.dispatchEvent(event);
    return {
        fullName: 'Nguyễn Quang Quốc',
        dob: '06/06/1986',
        role: 'Admin',
        // ... full profile
    };
}

/**
 * Save profile data
 */
export function saveProfileData(data) {
    // Dispatch save event
    document.dispatchEvent(new CustomEvent('erp-save-profile', { detail: data }));
}

/**
 * Attach profile events
 */
function attachProfileEvents() {
    // Avatar change, password change, edit profile modals
}

// Export
window.ProfilePage = {
    renderProfilePage,
    getProfileData,
    saveProfileData
};

