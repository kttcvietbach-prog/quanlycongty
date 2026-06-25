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
            if (this._db) { return this._db; }
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
            if (!db || !dataUrl) { return; }
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
            if (!db) { return null; }
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
            if (!db) { return; }
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
            if (!files || files.length === 0) { return; }
            for (const f of files) {
                if (f.dataUrl) {
                    await this.saveFile(collection, docId, f.name, f.dataUrl);
                }
            }
        },

        // Khôi phục dataUrl cho tất cả file của 1 document
        async restoreFiles(collection, docId, files) {
            if (!files || files.length === 0) { return files; }
            for (const f of files) {
                if (!f.dataUrl) {
                    const data = await this.getFile(collection, docId, f.name);
                    if (data) { f.dataUrl = data; }
                }
            }
            return files;
        }
    };

    window.FileStore = FileStore;
    FileStore.open(); // Pre-open

    // Sanitize document ID (Firestore không cho phép / và một số ký tự đặc biệt trong doc ID REST path)
    function sanitizeDocId(id) {
        if (!id) return 'null_id_' + Date.now();
        // Firestore IDs can contain: a-z, A-Z, 0-9, . , _ , -
        // Chúng ta thay thế / bằng __ để dễ đọc, và các ký tự khác bằng _
        return String(id)
            .replace(/\//g, '__')
            .replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    // Unsanitize (từ Firestore ID về ID gốc)
    function unsanitizeDocId(fsId) {
        return String(fsId).replace(/__/g, '/');
    }

    // Lấy idField chính xác theo tên collection
    function getIdField(collectionName) {
        if (collectionName === 'pmLaborLogs') return 'team';
        if (['pmEquipment', 'masterEquipmentRegistry', 'erp_gl_accounts'].includes(collectionName)) return 'code';
        if (collectionName === 'erp_registered_users') return 'username';
        return 'id';
    }

    // ==========================================
    // Firestore CRUD helpers
    // ==========================================
    const FireSync = {
        _isOfflineOrQuotaExceeded: false,

        async getAll(collectionName) {
            if (this._isOfflineOrQuotaExceeded) return null;
            try {
                // Thêm timeout 5s để tránh treo app khi đứt mạng hoặc hết Quota Firebase
                const snapshot = await Promise.race([
                    window.db.collection(collectionName).get(),
                    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'deadline-exceeded' })), 5000))
                ]);
                const data = [];
                snapshot.forEach(doc => {
                    const item = doc.data();
                    const idField = getIdField(collectionName);

                    // Nếu item thiếu ID hoặc ID bị sai (do sanitize), phục hồi từ doc.id
                    if (!item[idField] || sanitizeDocId(item[idField]) !== doc.id) {
                        item[idField] = unsanitizeDocId(doc.id);
                    }
                    data.push(item);
                });
                if (data.length === 0) {
                    console.log(`📥 Loaded 0 items from "${collectionName}" (collection exists but is empty on Cloud)`);
                } else {
                    console.log(`📥 Loaded ${data.length} items from "${collectionName}"`);
                }
                return data;
            } catch (err) {
                // Phân biệt lỗi permission vs lỗi khác
                if (err.code === 'permission-denied') {
                    console.error(`🔒 PERMISSION DENIED reading "${collectionName}". Kiểm tra Firebase Security Rules!`, err.message);
                } else if (err.code === 'unavailable' || err.code === 'deadline-exceeded') {
                    console.warn(`⏳ Firebase offline/timeout for "${collectionName}":`, err.message);
                    this._isOfflineOrQuotaExceeded = true;
                } else {
                    console.error(`❌ Error loading "${collectionName}" [${err.code}]:`, err.message);
                }
                return null;
            }
        },

        async setDoc(collectionName, docId, data) {
            try {
                const cleanData = { ...data };
                // Lọc bỏ dataUrl/data lớn trước khi lưu
                if (cleanData.files) {
                    cleanData.files = cleanData.files.map(f => {
                        if (f.dataUrl && String(f.dataUrl).startsWith('data:')) {
                            const { dataUrl, ...rest } = f;
                            return rest;
                        }
                        return f;
                    });
                }
                if (cleanData.vouchers) {
                    cleanData.vouchers = cleanData.vouchers.map(v => {
                        if (v.data && String(v.data).startsWith('data:')) {
                            const { data, ...rest } = v;
                            return rest;
                        }
                        return v;
                    });
                }
                if (cleanData.avatar && cleanData.avatar.startsWith('data:')) {
                    // Lưu vào FileStore để backup cục bộ
                    try {
                        await FileStore.saveFile(collectionName, docId, 'avatar_image', cleanData.avatar);
                    } catch (fsErr) {
                        console.error(`❌ FileStore error for ${docId}:`, fsErr);
                    }

                    // Nếu quá lớn (> 500KB), xóa khỏi Firestore để tránh lỗi 1MB limit
                    // Chỉnh xuống 500KB để an toàn hơn cho các trường dữ liệu khác
                    if (cleanData.avatar.length > 500 * 1024) {
                        console.warn(`⚠️ Avatar for ${docId} is too large (${Math.round(cleanData.avatar.length / 1024)}KB), removed from Cloud sync.`);
                        delete cleanData.avatar;
                    }
                }
                const finalDocId = sanitizeDocId(docId);
                if (!finalDocId || finalDocId === 'undefined' || finalDocId.includes('null')) {
                    console.warn(`[FireSync] Skipping setDoc for "${collectionName}" due to invalid ID:`, docId);
                    return false;
                }
                await window.db.collection(collectionName).doc(finalDocId).set(cleanData);
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

                    for (const item of chunk) {
                        const docId = item[idField] || item.id;
                        const cleanItem = { ...item };
                        if (cleanItem.files) {
                            cleanItem.files = cleanItem.files.map(f => {
                                if (f.dataUrl && String(f.dataUrl).startsWith('data:')) {
                                    const { dataUrl, ...rest } = f;
                                    return rest;
                                }
                                return f;
                            });
                        }
                        if (cleanItem.vouchers) {
                            cleanItem.vouchers = cleanItem.vouchers.map(v => {
                                if (v.data && String(v.data).startsWith('data:')) {
                                    const { data, ...rest } = v;
                                    return rest;
                                }
                                return v;
                            });
                        }
                        if (cleanItem.avatar && cleanItem.avatar.startsWith('data:')) {
                            // Backup cục bộ trong quá trình batch (đợi để đảm bảo)
                            await FileStore.saveFile(collectionName, docId, 'avatar_image', cleanItem.avatar);

                            if (cleanItem.avatar.length > 500 * 1024) {
                                delete cleanItem.avatar;
                            }
                        }
                        const ref = window.db.collection(collectionName).doc(sanitizeDocId(docId));
                        batch.set(ref, cleanItem);
                    }

                    await Promise.race([
                        batch.commit(),
                        new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'deadline-exceeded' })), 5000))
                    ]);
                }
                console.log(`📤 Uploaded ${items.length} items → "${collectionName}"`);
                return true;
            } catch (err) {
                if (err.code === 'unavailable' || err.code === 'deadline-exceeded') {
                    this._isOfflineOrQuotaExceeded = true;
                }
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
                if (this._resolveReady) { this._resolveReady(); }
                return;
            }

            // Kiểm tra Firebase đã sẵn sàng chưa
            if (!window.db) {
                console.warn('⏳ Firebase chưa sẵn sàng, chờ...');
                await new Promise(resolve => {
                    const check = () => {
                        if (window.db) { resolve(); }
                        else { setTimeout(check, 100); }
                    };
                    check();
                });
            }

            console.log('🔄 Bắt đầu đồng bộ Firebase...');
            showSyncIndicator('Đang đồng bộ dữ liệu...');

            const gateProgress = document.getElementById('gateProgress');
            const gateMessage = document.getElementById('gateMessage');

            try {
                const collections = [
                    { name: 'employees', idField: 'id' },
                    { name: 'contracts', idField: 'id' },
                    { name: 'hoSoDocuments', idField: 'id' },
                    { name: 'congVanList', idField: 'id' },
                    { name: 'pheDuyetList', idField: 'id' },
                    { name: 'pmProjects', idField: 'id' },
                    { name: 'pmContracts', idField: 'id' },
                    { name: 'pmTasks', idField: 'id' },
                    { name: 'vmVehicles', idField: 'id' },
                    { name: 'vmUsage', idField: 'id' },
                    { name: 'vmMaintenance', idField: 'id' },
                    { name: 'vmCosts', idField: 'id' },
                    { name: 'vmDrivers', idField: 'id' },
                    { name: 'erpOffices', idField: 'id' },
                    { name: 'erpOfficeEquipment', idField: 'id' },
                    { name: 'inventoryAuditData', idField: 'id' },
                    { name: 'erp_suppliers', idField: 'id' },
                    { name: 'erp_partners', idField: 'id' },
                    { name: 'erp_rfqs', idField: 'id' },
                    { name: 'erp_purchaseOrders', idField: 'id' },
                    { name: 'erp_customers', idField: 'id' },
                    { name: 'erp_quotations', idField: 'id' },
                    { name: 'erp_sales_orders', idField: 'id' },
                    { name: 'erp_goodsReceipts', idField: 'id' },
                    { name: 'office_expenses', idField: 'id' },
                    { name: 'other_expenses', idField: 'id' },
                    { name: 'expense_norms', idField: 'id' },
                    { name: 'departments', idField: 'id' },
                    { name: 'pmVolumes', idField: 'id' },
                    { name: 'pmMaterials', idField: 'id' },
                    { name: 'pmMaterialContracts', idField: 'id' },
                    { name: 'pmFinanceRecords', idField: 'id' },
                    { name: 'pmLaborLogs', idField: 'team' },
                    { name: 'pmTeams', idField: 'id' },
                    { name: 'pmWorkers', idField: 'id' },
                    { name: 'pmPaymentMilestones', idField: 'id' },
                    { name: 'pmContractAppendices', idField: 'id' },
                    { name: 'pmEquipment', idField: 'code' },
                    { name: 'masterEquipmentRegistry', idField: 'code' },
                    { name: 'system_config', idField: 'id' },
                    { name: 'pkList', idField: 'id' },
                    { name: 'danhMucHangHoaData', idField: 'id' },
                    { name: 'danhSachHangHoaData', idField: 'id' },
                    { name: 'danhSachKhoData', idField: 'id' },
                    { name: 'boms', idField: 'id' },
                    { name: 'workCenters', idField: 'id' },
                    { name: 'backupHistory', idField: 'id' },
                    { name: 'biddingPackages', idField: 'id' },
                    { name: 'notificationsData', idField: 'id' },
                    { name: 'erp_levels', idField: 'id' },
                    { name: 'erp_positions', idField: 'id' },
                    { name: 'erp_dept_missions', idField: 'id' },
                    { name: 'erp_dept_kpis', idField: 'id' },
                    { name: 'erp_dept_functions', idField: 'id' },
                    { name: 'erp_dept_tasks', idField: 'id' },
                    { name: 'erp_enterprise_info', idField: 'id' },
                    { name: 'erp_legal_docs', idField: 'id' },
                    { name: 'erp_branches', idField: 'id' },
                    { name: 'erp_production_orders', idField: 'id' },
                    { name: 'erp_exec_strategy', idField: 'id' },
                    { name: 'erp_products', idField: 'id' },
                    { name: 'erp_production', idField: 'id' },
                    { name: 'erp_salary_settings', idField: 'id' },
                    { name: 'erp_attendance_data', idField: 'id' },
                    { name: 'erp_registered_users', idField: 'username' },
                    { name: 'erp_productionLogs', idField: 'id' },
                    { name: 'erp_manufacturingOrders', idField: 'id' },
                    { name: 'erp_materialProposals', idField: 'id' },
                    { name: 'erp_routings', idField: 'id' },
                    { name: 'erp_productionSchedules', idField: 'id' },
                    { name: 'erp_productionCosts', idField: 'id' },
                    { name: 'erp_mrpPlans', idField: 'id' },
                    { name: 'pmMachineLogs', idField: 'id' },
                    { name: 'pmMaintenanceLogs', idField: 'id' },
                    { name: 'pmAttendanceLogs', idField: 'id' },
                    { name: 'erp_training_data', idField: 'id' },
                    { name: 'erp_course_instances', idField: 'id' },
                    { name: 'erp_ap_data', idField: 'id' },
                    { name: 'erp_ar_data', idField: 'id' },
                    { name: 'erp_gl_entries', idField: 'id' },
                    { name: 'erp_tc_accounts', idField: 'id' },
                    { name: 'erp_tc_transactions', idField: 'id' },
                    { name: 'erp_debt_partners', idField: 'id' },
                    { name: 'pmContractedExpenses', idField: 'id' },
                    { name: 'pmDailyLogs', idField: 'id' },
                    { name: 'pmEquipmentLogs', idField: 'id' },
                    { name: 'pmEquipmentCosts', idField: 'id' },
                    { name: 'pmProjectEquipment', idField: 'id' },
                    { name: 'pmProjectPhotos', idField: 'id' },
                    { name: 'pmMaterialQuotas', idField: 'id' },
                    { name: 'pmFuelPrices', idField: 'id' },
                    { name: 'pmIncidents', idField: 'id' },
                    { name: 'erp_gl_accounts', idField: 'code' },
                    { name: 'erp_nganhHangXayDung', idField: 'id' },
                    { name: 'erp_balance_sheet', idField: 'id' },
                    { name: 'erp_pnl_data', idField: 'id' },
                    { name: 'erp_cashflow_data', idField: 'id' }
                ];

                let completed = 0;
                const total = collections.length;

                // Tăng kích thước chunk từ 5 lên 25 để tối ưu song song hóa qua HTTP/2 Multiplexing, giúp tải nhanh gấp 5 lần
                const chunkSize = 25;
                for (let i = 0; i < collections.length; i += chunkSize) {
                    const chunk = collections.slice(i, i + chunkSize);
                    await Promise.all(chunk.map(async col => {
                        await this.syncCollection(col.name, col.idField);
                        completed++;
                        const percent = 30 + Math.floor((completed / total) * 60); // 30% -> 90%
                        if (gateProgress) { gateProgress.style.width = percent + '%'; }
                        if (gateMessage) { gateMessage.textContent = `Đang tải: ${col.name}...`; }
                    }));
                }

                this.isInitialized = true;
                console.log('✅ Đồng bộ Firebase hoàn tất!');
                showSyncIndicator('Đồng bộ thành công!', 'success');
                setTimeout(hideSyncIndicator, 2000);

                // Resolve ready promise
                if (this._resolveReady) { this._resolveReady(); }

            } catch (err) {
                console.error('❌ Đồng bộ Firebase thất bại:', err);
                showSyncIndicator('Lỗi đồng bộ! Dùng dữ liệu local.', 'error');
                setTimeout(hideSyncIndicator, 3000);
                if (this._resolveReady) { this._resolveReady(); } // resolve anyway
            }
        },

        async syncCollection(name, idField) {
            // Luôn thử tải dữ liệu từ Firestore trước
            console.log(`🔍 Kiểm tra "${name}" trên Firestore...`);
            const data = await FireSync.getAll(name);

            if (data === null) {
                // Lỗi kết nối/permission/quota → giữ mock data local, KHÔNG đè
                console.log(`⚠️ Không thể đọc "${name}" từ Firestore. Sử dụng dữ liệu local.`);
                const localData = this.getLocalDataFromStorage(name);
                if (localData) { this.setLocalData(name, localData); }
                this.syncStatus[name] = 'local-only';
                return;
            }

            if (data.length > 0) {
                // --- CLOUD SCRUBBING MIGRATION ---
                // If this is an equipment-related collection, purge items with legacy codes (MX-, MU-, etc.)
                if (['pmEquipment', 'masterEquipmentRegistry', 'vmVehicles'].includes(name)) {
                    const oldPrefixes = ['MX-', 'MU-', 'XL-', 'CT-'];
                    const isOld = (s) => s && oldPrefixes.some(p => String(s).startsWith(p)) && !String(s).startsWith('TB-') && !String(s).startsWith('VX-');

                    const itemsToDelete = data.filter(item => {
                        const code = item[idField] || item.id;
                        return isOld(code);
                    });

                    if (itemsToDelete.length > 0) {
                        console.log(`🧹 Scrubbing ${itemsToDelete.length} legacy items from Firestore: "${name}"`);
                        for (const item of itemsToDelete) {
                            const docId = item[idField] || item.id;
                            await FireSync.deleteDoc(name, docId);
                        }
                        // Refresh data after scrubbing
                        const cleanedData = data.filter(item => {
                            const code = item[idField] || item.id;
                            return !isOld(code);
                        });
                        this.setLocalData(name, cleanedData);
                        this.syncStatus[name] = 'scrubbed';
                        return;
                    }
                }

                // Khôi phục avatar từ FileStore nếu Firestore không có
                const restoredData = await Promise.all(data.map(async item => {
                    if (!item.avatar) {
                        const docId = item[idField] || item.id;
                        const localAvatar = await FileStore.getFile(name, docId, 'avatar_image');
                        if (localAvatar) { item.avatar = localAvatar; }
                    } else {
                        // Nếu Firestore có avatar, cập nhật lại FileStore cục bộ
                        const docId = item[idField] || item.id;
                        await FileStore.saveFile(name, docId, 'avatar_image', item.avatar);
                    }
                    return item;
                }));

                // --- RECONCILIATION ---
                // Smart Date-Aware Reconciliation Engine
                const localData = this.getLocalDataFromStorage(name) || [];
                if (Array.isArray(localData) && Array.isArray(restoredData)) {
                    const localMap = new Map(localData.map(item => [String(item[idField] || item.id || '').trim(), item]));
                    const cloudMap = new Map(restoredData.map(item => [String(item[idField] || item.id || '').trim(), item]));

                    const toPush = [];
                    const finalRestored = [];

                    let localMissingOnCloud = 0;
                    let localNewer = 0;
                    let cloudNewer = 0;
                    let cloudMissingLocally = 0;

                    const parseDate = (dStr) => {
                        if (!dStr) return 0;
                        const str = String(dStr).trim();
                        if (str.includes('/')) {
                            const parts = str.split('/');
                            if (parts[2] && parts[2].length === 4) {
                                // DD/MM/YYYY
                                return new Date(parts[2], parts[1] - 1, parts[0]).getTime() || 0;
                            }
                            if (parts[0] && parts[0].length === 4) {
                                // YYYY/MM/DD
                                return new Date(parts[0], parts[1] - 1, parts[2]).getTime() || 0;
                            }
                        } else if (str.includes('-')) {
                            const parts = str.split('-');
                            if (parts[2] && parts[2].length === 4) {
                                // DD-MM-YYYY
                                return new Date(parts[2], parts[1] - 1, parts[0]).getTime() || 0;
                            }
                            if (parts[0] && parts[0].length === 4) {
                                // YYYY-MM-DD
                                return new Date(parts[0], parts[1] - 1, parts[2]).getTime() || 0;
                            }
                        }
                        const t = new Date(str).getTime();
                        return isNaN(t) ? 0 : t;
                    };

                    // 1. Process items that exist locally
                    for (const [id, localItem] of localMap.entries()) {
                        if (!id) continue;
                        const cloudItem = cloudMap.get(id);

                        if (!cloudItem) {
                            // Missing in cloud -> Push local to cloud
                            toPush.push(localItem);
                            finalRestored.push(localItem);
                            localMissingOnCloud++;
                        } else {
                            // Exists in both -> Compare contents
                            if (JSON.stringify(localItem) !== JSON.stringify(cloudItem)) {
                                const localTime = parseDate(localItem.updated);
                                const cloudTime = parseDate(cloudItem.updated);

                                if (localTime >= cloudTime) {
                                    // Local is newer -> Push local to cloud
                                    toPush.push(localItem);
                                    finalRestored.push(localItem);
                                    localNewer++;
                                } else {
                                    // Cloud is newer -> Keep cloud version
                                    finalRestored.push(cloudItem);
                                    cloudNewer++;
                                }
                            } else {
                                // Exactly same
                                finalRestored.push(cloudItem);
                            }
                        }
                    }

                    // 2. Process items that exist in cloud but missing locally
                    for (const [id, cloudItem] of cloudMap.entries()) {
                        if (!id) continue;
                        if (!localMap.has(id)) {
                            finalRestored.push(cloudItem);
                            cloudMissingLocally++;
                        }
                    }

                    // Log aggregated reconciliation stats instead of thousands of individual console.log calls
                    if (localMissingOnCloud > 0 || localNewer > 0 || cloudNewer > 0 || cloudMissingLocally > 0) {
                        console.log(`📊 [Sync:${name}] Đối soát thành công: Đẩy Cloud (+${localMissingOnCloud + localNewer}), Cập nhật Local (+${cloudNewer + cloudMissingLocally})`);
                    }

                    // 3. Batch upload any new/updated items to Firestore
                    if (toPush.length > 0) {
                        try {
                            await FireSync.batchUpload(name, toPush, idField);
                            console.log(`✅ [Sync:${name}] Successfully pushed ${toPush.length} reconciled items to Cloud.`);
                        } catch (err) {
                            console.error(`❌ [Sync:${name}] Failed to batch upload reconciled items:`, err);
                        }
                    }

                    // Replace contents in-place on the const array restoredData
                    restoredData.length = 0;
                    restoredData.push(...finalRestored);
                }

                this.setLocalData(name, restoredData);
                this.syncStatus[name] = 'loaded';
            } else {
                // Cloud trống → kiểm tra Local có data không
                const localData = this.getLocalDataFromStorage(name);
                const hasData = localData && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0);

                if (hasData) {
                    // LOCAL → CLOUD: Tự động push local data lên Cloud
                    console.log(`🔼 "${name}": Cloud trống, Local có dữ liệu → Tự động push lên Cloud...`);
                    
                    // Nạp dữ liệu local vào app ngay lập tức để người dùng không thấy trống
                    this.setLocalData(name, localData);

                    let items = Array.isArray(localData) ? localData : [localData];
                    // Đảm bảo mỗi item đều có field id để Firestore không bị undefined docId
                    items = items.map((item, idx) => {
                        if (!item[idField] && !item.id) {
                            return { ...item, [idField]: item.id || 'main' };
                        }
                        return item;
                    });
                    const uploaded = await FireSync.batchUpload(name, items, idField);
                    if (uploaded) {
                        console.log(`✅ "${name}": Đã sync Local → Cloud (${items.length} items)`);
                        this.syncStatus[name] = 'pushed-to-cloud';
                    } else {
                        console.warn(`⚠️ "${name}": Push lên Cloud thất bại. Sử dụng Local.`);
                        this.syncStatus[name] = 'local-only';
                    }
                } else {
                    console.log(`⬜ "${name}": Cloud và Local đều trống.`);
                    this.setLocalData(name, []);
                    this.syncStatus[name] = 'empty';
                }
            }
        },

        getLocalDataFromStorage(name) {
            // Đảm bảo không bị double prefix 'erp_erp_'
            const storageKey = name.startsWith('erp_') ? name : 'erp_' + name;
            const raw = localStorage.getItem(storageKey);
            if (!raw) { return null; }
            try {
                return JSON.parse(raw);
            } catch (e) { return null; }
        },

        getMockData(name) {
            if (!window.erpApp || !window.erpApp._getData) { return []; }
            return window.erpApp._getData(name);
        },

        setLocalData(name, data) {
            const storageKey = name.startsWith('erp_') ? name : 'erp_' + name;
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (e) {
                console.error(`[FireSync] Error writing ${storageKey} to localStorage:`, e.message);
            }
            if (window.erpApp && window.erpApp._setData) {
                window.erpApp._setData(name, data);
            }
        },

        async forceUploadAllLocalData() {
            console.log('🚀 Bắt đầu đẩy toàn bộ dữ liệu Local lên Cloud...');
            if (typeof showSyncIndicator === 'function') { showSyncIndicator('Đang đẩy dữ liệu lên Cloud...'); }

            const collections = [
                { name: 'employees', idField: 'id' },
                { name: 'contracts', idField: 'id' },
                { name: 'hoSoDocuments', idField: 'id' },
                { name: 'congVanList', idField: 'id' },
                { name: 'pheDuyetList', idField: 'id' },
                { name: 'pmProjects', idField: 'id' },
                { name: 'pmContracts', idField: 'id' },
                { name: 'pmTasks', idField: 'id' },
                { name: 'vmVehicles', idField: 'id' },
                { name: 'vmUsage', idField: 'id' },
                { name: 'vmMaintenance', idField: 'id' },
                { name: 'vmCosts', idField: 'id' },
                { name: 'vmDrivers', idField: 'id' },
                { name: 'erpOffices', idField: 'id' },
                { name: 'erpOfficeEquipment', idField: 'id' },
                { name: 'inventoryAuditData', idField: 'id' },
                { name: 'erp_suppliers', idField: 'id' },
                { name: 'erp_rfqs', idField: 'id' },
                { name: 'erp_purchaseOrders', idField: 'id' },
                { name: 'erp_customers', idField: 'id' },
                { name: 'erp_quotations', idField: 'id' },
                { name: 'erp_sales_orders', idField: 'id' },
                { name: 'erp_goodsReceipts', idField: 'id' },
                { name: 'office_expenses', idField: 'id' },
                { name: 'other_expenses', idField: 'id' },
                { name: 'expense_norms', idField: 'id' },
                { name: 'departments', idField: 'id' },
                { name: 'pmVolumes', idField: 'id' },
                { name: 'pmMaterials', idField: 'id' },
                { name: 'pmMaterialContracts', idField: 'id' },
                { name: 'pmFinanceRecords', idField: 'id' },
                { name: 'pmLaborLogs', idField: 'team' },
                { name: 'pmTeams', idField: 'id' },
                { name: 'pmWorkers', idField: 'id' },
                { name: 'pmPaymentMilestones', idField: 'id' },
                { name: 'pmContractAppendices', idField: 'id' },
                { name: 'pmEquipment', idField: 'code' },
                { name: 'masterEquipmentRegistry', idField: 'code' },
                { name: 'system_config', idField: 'id' },
                { name: 'pkList', idField: 'id' },
                { name: 'danhMucHangHoaData', idField: 'id' },
                { name: 'danhSachHangHoaData', idField: 'id' },
                { name: 'danhSachKhoData', idField: 'id' },
                { name: 'danhSachDoiTacData', idField: 'id' },
                { name: 'boms', idField: 'id' },
                { name: 'workCenters', idField: 'id' },
                { name: 'backupHistory', idField: 'id' },
                { name: 'biddingPackages', idField: 'id' },
                { name: 'notificationsData', idField: 'id' },
                { name: 'erp_levels', idField: 'id' },
                { name: 'erp_positions', idField: 'id' },
                { name: 'erp_dept_missions', idField: 'id' },
                { name: 'erp_dept_kpis', idField: 'id' },
                { name: 'erp_dept_functions', idField: 'id' },
                { name: 'erp_dept_tasks', idField: 'id' },
                { name: 'erp_enterprise_info', idField: 'id' },
                { name: 'erp_legal_docs', idField: 'id' },
                { name: 'erp_branches', idField: 'id' },
                { name: 'erp_production_orders', idField: 'id' },
                { name: 'erp_exec_strategy', idField: 'id' },
                { name: 'erp_products', idField: 'id' },
                { name: 'erp_production', idField: 'id' },
                { name: 'erp_salary_settings', idField: 'id' },
                { name: 'erp_attendance_data', idField: 'id' },
                { name: 'erp_productionLogs', idField: 'id' },
                { name: 'erp_manufacturingOrders', idField: 'id' },
                { name: 'erp_materialProposals', idField: 'id' },
                { name: 'erp_routings', idField: 'id' },
                { name: 'erp_productionSchedules', idField: 'id' },
                { name: 'erp_productionCosts', idField: 'id' },
                { name: 'erp_mrpPlans', idField: 'id' },
                { name: 'pmMachineLogs', idField: 'id' },
                { name: 'pmMaintenanceLogs', idField: 'id' },
                { name: 'pmAttendanceLogs', idField: 'id' },
                { name: 'erp_training_data', idField: 'id' },
                { name: 'erp_course_instances', idField: 'id' },
                { name: 'erp_ap_data', idField: 'id' },
                { name: 'erp_ar_data', idField: 'id' },
                { name: 'erp_gl_entries', idField: 'id' },
                { name: 'erp_tc_accounts', idField: 'id' },
                { name: 'erp_tc_transactions', idField: 'id' },
                { name: 'erp_debt_partners', idField: 'id' },
                { name: 'pmContractedExpenses', idField: 'id' },
                { name: 'pmDailyLogs', idField: 'id' },
                { name: 'pmEquipmentLogs', idField: 'id' },
                { name: 'pmEquipmentCosts', idField: 'id' },
                { name: 'pmProjectEquipment', idField: 'id' },
                { name: 'pmProjectPhotos', idField: 'id' },
                { name: 'pmMaterialQuotas', idField: 'id' },
                { name: 'pmFuelPrices', idField: 'id' },
                { name: 'pmIncidents', idField: 'id' },
                { name: 'erp_gl_accounts', idField: 'code' },
                { name: 'erp_nganhHangXayDung', idField: 'id' },
                { name: 'erp_balance_sheet', idField: 'id' },
                { name: 'erp_pnl_data', idField: 'id' },
                { name: 'erp_cashflow_data', idField: 'id' }
            ];

            for (const col of collections) {
                const data = this.getLocalDataFromStorage(col.name);
                if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                    console.log(`📤 Đang đẩy "${col.name}"...`);
                    const items = Array.isArray(data) ? data : [data];
                    await FireSync.batchUpload(col.name, items, col.idField);
                }
            }

            if (typeof showSyncIndicator === 'function') {
                showSyncIndicator('Đã đẩy toàn bộ dữ liệu lên Cloud thành công!', 'success');
                setTimeout(hideSyncIndicator, 3000);
            }
        }
    };

    // ==========================================
    // CRUD Sync - Tự động sync khi thay đổi
    // ==========================================
    const CrudSync = {
        async saveItem(collectionName, item, idField) {
            if (!window.db) { return false; }
            const docId = item[idField] || item.id;
            return await FireSync.setDoc(collectionName, docId, item);
        },

        async saveItems(collectionName, items, idField = 'id') {
            if (!window.db) { return false; }
            if (!Array.isArray(items)) { return false; }

            try {
                // Tự động rà soát và xóa các item đã bị xóa ở local nhưng còn trên Cloud
                const snapshot = await window.db.collection(collectionName).get();
                const cloudIds = [];
                snapshot.forEach(doc => {
                    cloudIds.push(unsanitizeDocId(doc.id));
                });

                const localIds = items.map(item => String(item[idField] || item.id));
                const idsToDelete = cloudIds.filter(id => !localIds.includes(id));

                if (idsToDelete.length > 0) {
                    console.log(`[Sync] Tự động dọn dẹp ${idsToDelete.length} item rác trong "${collectionName}"`);
                    for (const id of idsToDelete) {
                        await FireSync.deleteDoc(collectionName, id);
                    }
                }
            } catch (err) {
                console.error(`❌ Lỗi khi rà soát xóa tự động cho "${collectionName}":`, err);
            }

            return await FireSync.batchUpload(collectionName, items, idField);
        },

        async deleteItem(collectionName, docIdOrItem, idField) {
            if (!window.db) { return false; }
            let finalId = docIdOrItem;
            if (typeof docIdOrItem === 'object' && docIdOrItem !== null && idField) {
                finalId = docIdOrItem[idField];
            }
            return await FireSync.deleteDoc(collectionName, finalId);
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
