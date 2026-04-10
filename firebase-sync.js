// ==========================================
// Firebase Sync Layer - VIETBACHCORP ERP
// Đồng bộ tất cả dữ liệu lên Firestore
// Version 2.0 - Persistent sync
// ==========================================

(function () {
    'use strict';

    // ==========================================
    // FileStore - Lưu nội dung file vào IndexedDB
    // Firestore chỉ lưu metadata, dataUrl lưu ở đây
    // ==========================================
    const FileStore = {
        dbName: 'VietBachCorp_Files',
        storeName: 'fileData',
        _db: null,

        async open() {
            if (this._db) return this._db;
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(this.dbName, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
                req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
                req.onerror = (e) => { console.error('IndexedDB error:', e); resolve(null); };
            });
        },

        // Lưu dataUrl của file: key = "collectionName:docId:fileName"
        async saveFile(collection, docId, fileName, dataUrl) {
            const db = await this.open();
            if (!db || !dataUrl) return;
            const key = `${collection}:${docId}:${fileName}`;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    tx.objectStore(this.storeName).put(dataUrl, key);
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (e) { resolve(false); }
            });
        },

        // Lấy dataUrl từ IndexedDB
        async getFile(collection, docId, fileName) {
            const db = await this.open();
            if (!db) return null;
            const key = `${collection}:${docId}:${fileName}`;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(this.storeName, 'readonly');
                    const req = tx.objectStore(this.storeName).get(key);
                    req.onsuccess = () => resolve(req.result || null);
                    req.onerror = () => resolve(null);
                } catch (e) { resolve(null); }
            });
        },

        // Xóa file khỏi IndexedDB
        async deleteFile(collection, docId, fileName) {
            const db = await this.open();
            if (!db) return;
            const key = `${collection}:${docId}:${fileName}`;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    tx.objectStore(this.storeName).delete(key);
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (e) { resolve(false); }
            });
        },

        // Lưu tất cả file của 1 document
        async saveAllFiles(collection, docId, files) {
            if (!files || files.length === 0) return;
            for (const f of files) {
                if (f.dataUrl) {
                    await this.saveFile(collection, docId, f.name, f.dataUrl);
                }
            }
        },

        // Khôi phục dataUrl cho tất cả file của 1 document
        async restoreFiles(collection, docId, files) {
            if (!files || files.length === 0) return files;
            for (const f of files) {
                if (!f.dataUrl) {
                    const data = await this.getFile(collection, docId, f.name);
                    if (data) f.dataUrl = data;
                }
            }
            return files;
        }
    };

    window.FileStore = FileStore;
    FileStore.open(); // Pre-open

    // Sanitize document ID (Firestore không cho phép / trong doc ID)
    function sanitizeDocId(id) {
        return String(id).replace(/\//g, '__');
    }

    // Unsanitize (từ Firestore ID về ID gốc)
    function unsanitizeDocId(fsId) {
        return String(fsId).replace(/__/g, '/');
    }

    // ==========================================
    // Firestore CRUD helpers
    // ==========================================
    const FireSync = {
        async getAll(collectionName) {
            try {
                const snapshot = await window.db.collection(collectionName).get();
                const data = [];
                snapshot.forEach(doc => {
                    const item = doc.data();
                    data.push(item);
                });
                console.log(`📥 Loaded ${data.length} items from "${collectionName}"`);
                return data;
            } catch (err) {
                console.error(`❌ Error loading "${collectionName}":`, err);
                return null;
            }
        },

        async setDoc(collectionName, docId, data) {
            try {
                const cleanData = { ...data };
                // Lọc bỏ dataUrl lớn trước khi lưu
                if (cleanData.files) {
                    cleanData.files = cleanData.files.map(f => ({
                        name: f.name || '',
                        size: f.size || '',
                        type: f.type || ''
                    }));
                }
                if (cleanData.avatar && cleanData.avatar.startsWith('data:')) {
                    delete cleanData.avatar;
                }
                await window.db.collection(collectionName).doc(sanitizeDocId(docId)).set(cleanData);
                console.log(`✅ Saved ${docId} → "${collectionName}"`);
                return true;
            } catch (err) {
                console.error(`❌ Error saving to "${collectionName}":`, err);
                return false;
            }
        },

        async deleteDoc(collectionName, docId) {
            try {
                await window.db.collection(collectionName).doc(sanitizeDocId(docId)).delete();
                console.log(`🗑️ Deleted ${docId} from "${collectionName}"`);
                return true;
            } catch (err) {
                console.error(`❌ Error deleting from "${collectionName}":`, err);
                return false;
            }
        },

        async batchUpload(collectionName, items, idField) {
            try {
                // Firestore batch chỉ cho phép 500 operations, chia nhỏ nếu cần
                const batchSize = 400;
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = window.db.batch();
                    const chunk = items.slice(i, i + batchSize);
                    
                    chunk.forEach(item => {
                        const docId = item[idField] || item.id;
                        const cleanItem = { ...item };
                        if (cleanItem.files) {
                            cleanItem.files = cleanItem.files.map(f => ({
                                name: f.name || '',
                                size: f.size || '',
                                type: f.type || ''
                            }));
                        }
                        if (cleanItem.avatar && cleanItem.avatar.startsWith('data:')) {
                            delete cleanItem.avatar;
                        }
                        const ref = window.db.collection(collectionName).doc(sanitizeDocId(docId));
                        batch.set(ref, cleanItem);
                    });
                    
                    await batch.commit();
                }
                console.log(`📤 Uploaded ${items.length} items → "${collectionName}"`);
                return true;
            } catch (err) {
                console.error(`❌ Batch upload error "${collectionName}":`, err);
                return false;
            }
        },

        async isEmpty(collectionName) {
            try {
                const snapshot = await window.db.collection(collectionName).limit(1).get();
                return snapshot.empty;
            } catch (err) {
                console.error(`❌ Error checking "${collectionName}":`, err);
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
        _resolveReady: null,
        _readyPromise: null,

        // Promise để chờ sync hoàn tất
        get ready() {
            if (!this._readyPromise) {
                this._readyPromise = new Promise(resolve => {
                    this._resolveReady = resolve;
                });
            }
            return this._readyPromise;
        },

        async init() {
            if (this.isInitialized) {
                if (this._resolveReady) this._resolveReady();
                return;
            }

            // Kiểm tra Firebase đã sẵn sàng chưa
            if (!window.db) {
                console.warn('⏳ Firebase chưa sẵn sàng, chờ...');
                await new Promise(resolve => {
                    const check = () => {
                        if (window.db) resolve();
                        else setTimeout(check, 100);
                    };
                    check();
                });
            }

            console.log('🔄 Bắt đầu đồng bộ Firebase...');
            showSyncIndicator('Đang đồng bộ dữ liệu...');

            try {
                const collections = [
                    { name: 'employees', idField: 'id' },
                    { name: 'contracts', idField: 'id' },
                    { name: 'hoSoDocuments', idField: 'id' },
                    { name: 'congVanList', idField: 'id' },
                    { name: 'inventory_items', idField: 'id' },
                    { name: 'warehousing_slips', idField: 'id' },
                    { name: 'goods_receipts', idField: 'id' },
                    { name: 'projects', idField: 'id' },
                    { name: 'material_proposals', idField: 'id' }
                ];


                for (const col of collections) {
                    await this.syncCollection(col.name, col.idField);
                }

                this.isInitialized = true;
                console.log('✅ Đồng bộ Firebase hoàn tất!');
                showSyncIndicator('Đồng bộ thành công!', 'success');
                setTimeout(hideSyncIndicator, 2000);

                // Resolve ready promise
                if (this._resolveReady) this._resolveReady();

            } catch (err) {
                console.error('❌ Đồng bộ Firebase thất bại:', err);
                showSyncIndicator('Lỗi đồng bộ! Dùng dữ liệu local.', 'error');
                setTimeout(hideSyncIndicator, 3000);
                if (this._resolveReady) this._resolveReady(); // resolve anyway
            }
        },

        async syncCollection(name, idField) {
            // Luôn thử tải dữ liệu từ Firestore trước
            console.log(`🔍 Kiểm tra "${name}" trên Firestore...`);
            const data = await FireSync.getAll(name);

            if (data === null) {
                // Lỗi kết nối/permission → giữ mock data local, KHÔNG đè
                console.warn(`⚠️ Không thể đọc "${name}" từ Firestore. Giữ dữ liệu local.`);
                this.syncStatus[name] = 'local-only';
                return;
            }

            if (data.length > 0) {
                // Firestore có data → tải về thay thế mock data
                console.log(`📥 Đã tải ${data.length} items từ "${name}"`);
                this.setLocalData(name, data);
                this.syncStatus[name] = 'loaded';
            } else {
                // Firestore thực sự trống → đẩy mock data lên
                console.log(`📤 "${name}" trống → Đẩy dữ liệu mẫu lên...`);
                const mockData = this.getMockData(name);
                if (mockData && mockData.length > 0) {
                    const success = await FireSync.batchUpload(name, mockData, idField);
                    this.syncStatus[name] = success ? 'uploaded' : 'error';
                }
            }
        },

        getMockData(name) {
            if (!window.erpApp || !window.erpApp._getData) return [];
            return window.erpApp._getData(name);
        },

        setLocalData(name, data) {
            if (!window.erpApp || !window.erpApp._setData) return;
            window.erpApp._setData(name, data);
        }
    };

    // ==========================================
    // CRUD Sync - Tự động sync khi thay đổi
    // ==========================================
    const CrudSync = {
        async saveItem(collectionName, item, idField) {
            if (!window.db) return false;
            const docId = item[idField] || item.id;
            return await FireSync.setDoc(collectionName, docId, item);
        },

        async deleteItem(collectionName, docId) {
            if (!window.db) return false;
            return await FireSync.deleteDoc(collectionName, docId);
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
                transition: all 0.3s ease;
            `;
            document.body.appendChild(el);
        }

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '🔄';
        const bgColor = type === 'success' ? '#065F46' : type === 'error' ? '#991B1B' : '#1E293B';
        el.style.background = bgColor;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
        el.style.display = 'flex';
    }

    function hideSyncIndicator() {
        const el = document.getElementById('syncIndicator');
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            setTimeout(() => el.remove(), 300);
        }
    }

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

    console.log('🔧 Firebase Sync Layer v2.0 loaded');
})();
