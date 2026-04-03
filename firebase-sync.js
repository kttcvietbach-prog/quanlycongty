// ==========================================
// Firebase Sync Layer - VIETBACHCORP ERP
// Đồng bộ tất cả dữ liệu lên Firestore
// ==========================================

(function () {
    'use strict';

    // Đợi Firebase init xong
    function waitForFirebase(callback) {
        if (window.db) {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }

    // ==========================================
    // Firestore CRUD helpers
    // ==========================================
    const FireSync = {
        // --- Generic CRUD ---
        async getAll(collection) {
            try {
                const snapshot = await window.db.collection(collection).get();
                const data = [];
                snapshot.forEach(doc => data.push({ _docId: doc.id, ...doc.data() }));
                console.log(`📥 Loaded ${data.length} items from "${collection}"`);
                return data;
            } catch (err) {
                console.error(`❌ Error loading "${collection}":`, err);
                return null;
            }
        },

        async setDoc(collection, docId, data) {
            try {
                // Remove _docId from data before saving
                const cleanData = { ...data };
                delete cleanData._docId;
                await window.db.collection(collection).doc(docId).set(cleanData);
                console.log(`✅ Saved ${docId} to "${collection}"`);
                return true;
            } catch (err) {
                console.error(`❌ Error saving to "${collection}":`, err);
                return false;
            }
        },

        async deleteDoc(collection, docId) {
            try {
                await window.db.collection(collection).doc(docId).delete();
                console.log(`🗑️ Deleted ${docId} from "${collection}"`);
                return true;
            } catch (err) {
                console.error(`❌ Error deleting from "${collection}":`, err);
                return false;
            }
        },

        // --- Batch upload (cho mock data lần đầu) ---
        async batchUpload(collection, items, idField) {
            try {
                const batch = window.db.batch();
                items.forEach(item => {
                    const docId = item[idField] || item.id;
                    const cleanItem = { ...item };
                    // Không lưu file dataUrl lên Firestore (quá lớn)
                    if (cleanItem.files) {
                        cleanItem.files = cleanItem.files.map(f => ({
                            name: f.name,
                            size: f.size,
                            type: f.type
                            // bỏ dataUrl
                        }));
                    }
                    if (cleanItem.avatar && cleanItem.avatar.startsWith('data:')) {
                        delete cleanItem.avatar; // bỏ base64 avatar
                    }
                    const ref = window.db.collection(collection).doc(docId);
                    batch.set(ref, cleanItem);
                });
                await batch.commit();
                console.log(`📤 Batch uploaded ${items.length} items to "${collection}"`);
                return true;
            } catch (err) {
                console.error(`❌ Batch upload error for "${collection}":`, err);
                return false;
            }
        },

        // --- Check if collection has data ---
        async isEmpty(collection) {
            try {
                const snapshot = await window.db.collection(collection).limit(1).get();
                return snapshot.empty;
            } catch (err) {
                console.error(`❌ Error checking "${collection}":`, err);
                return true;
            }
        }
    };

    // ==========================================
    // Sync Manager - Quản lý đồng bộ
    // ==========================================
    const SyncManager = {
        isInitialized: false,
        syncStatus: {},

        // Khởi tạo: load dữ liệu từ Firestore hoặc push mock data
        async init() {
            if (this.isInitialized) return;
            
            console.log('🔄 Starting Firebase sync...');
            showSyncIndicator('Đang đồng bộ dữ liệu...');

            try {
                // Sync từng collection
                await this.syncCollection('employees', 'id');
                await this.syncCollection('contracts', 'id');
                await this.syncCollection('hoSoDocuments', 'id');
                await this.syncCollection('congVanList', 'id');

                this.isInitialized = true;
                console.log('✅ Firebase sync completed!');
                showSyncIndicator('Đồng bộ thành công!', 'success');
                
                // Ẩn indicator sau 2s
                setTimeout(hideSyncIndicator, 2000);
            } catch (err) {
                console.error('❌ Firebase sync failed:', err);
                showSyncIndicator('Lỗi đồng bộ! Dùng dữ liệu local.', 'error');
                setTimeout(hideSyncIndicator, 3000);
            }
        },

        async syncCollection(name, idField) {
            const isEmpty = await FireSync.isEmpty(name);
            
            if (isEmpty) {
                // Firestore trống → push mock data lên
                console.log(`📤 "${name}" is empty. Uploading mock data...`);
                const mockData = this.getMockData(name);
                if (mockData && mockData.length > 0) {
                    await FireSync.batchUpload(name, mockData, idField);
                    this.syncStatus[name] = 'uploaded';
                }
            } else {
                // Firestore có data → load về
                console.log(`📥 Loading "${name}" from Firestore...`);
                const data = await FireSync.getAll(name);
                if (data && data.length > 0) {
                    this.setLocalData(name, data);
                    this.syncStatus[name] = 'loaded';
                }
            }
        },

        // Lấy mock data từ app.js (thông qua window.erpApp)
        getMockData(name) {
            if (!window.erpApp || !window.erpApp._getData) return [];
            return window.erpApp._getData(name);
        },

        // Cập nhật data local trong app.js
        setLocalData(name, data) {
            if (!window.erpApp || !window.erpApp._setData) return;
            // Clean _docId trước khi set
            const cleanData = data.map(item => {
                const clean = { ...item };
                delete clean._docId;
                return clean;
            });
            window.erpApp._setData(name, cleanData);
        }
    };

    // ==========================================
    // UI Sync Indicator
    // ==========================================
    function showSyncIndicator(msg, type) {
        let el = document.getElementById('syncIndicator');
        if (!el) {
            el = document.createElement('div');
            el.id = 'syncIndicator';
            el.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 99999;
                padding: 12px 20px; border-radius: 12px;
                background: #1E293B; color: white;
                font-size: 13px; font-weight: 500;
                display: flex; align-items: center; gap: 10px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
                font-family: 'Inter', sans-serif;
            `;
            document.body.appendChild(el);
        }

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🔄';
        const bgColor = type === 'success' ? '#065F46' : type === 'error' ? '#991B1B' : '#1E293B';
        el.style.background = bgColor;
        el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
        el.style.display = 'flex';
    }

    function hideSyncIndicator() {
        const el = document.getElementById('syncIndicator');
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            el.style.transition = 'all 0.3s ease';
            setTimeout(() => el.remove(), 300);
        }
    }

    // ==========================================
    // Wrap CRUD: Tự động sync khi thay đổi
    // ==========================================
    const CrudSync = {
        // Gọi sau khi save (add/edit) 1 item
        async saveItem(collection, item, idField) {
            const docId = item[idField] || item.id;
            const cleanItem = { ...item };
            // Không lưu file dataUrl (quá lớn cho Firestore)
            if (cleanItem.files) {
                cleanItem.files = cleanItem.files.map(f => ({
                    name: f.name, size: f.size, type: f.type
                }));
            }
            if (cleanItem.avatar && cleanItem.avatar.startsWith('data:')) {
                delete cleanItem.avatar;
            }
            return await FireSync.setDoc(collection, docId, cleanItem);
        },

        // Gọi sau khi xóa 1 item
        async deleteItem(collection, docId) {
            return await FireSync.deleteDoc(collection, docId);
        }
    };

    // ==========================================
    // Export toàn cục
    // ==========================================
    window.FireSync = FireSync;
    window.SyncManager = SyncManager;
    window.CrudSync = CrudSync;

    // Animation keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    console.log('🔧 Firebase Sync Layer loaded');
})();
