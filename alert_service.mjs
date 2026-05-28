
import https from 'https';
import { sendEmailNotification } from './email_service.mjs';

/**
 * Alert Service for VIETBACHCORP ERP
 * Manages automated notifications for expiring items.
 */

const FIREBASE_CONFIG = {
    projectId: "vietbachcorp-6cd8c"
};

const ZALO_CONFIG = {
    // These will be loaded from system_settings/zalo_config in Firestore
    accessToken: '',
    adminZaloId: '',
    enabled: true
};

/**
 * Fetch documents from Firestore using REST API
 */

async function fetchFirestoreCollection(collectionName) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/${collectionName}`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.documents) {
                        const items = json.documents.map(doc => {
                            const fields = doc.fields || {};
                            const obj = {};
                            
                            // Extract Document ID from name: "projects/.../documents/coll/docId"
                            const parts = doc.name.split('/');
                            obj.id = parts[parts.length - 1];

                            for (const key in fields) {
                                const valObj = fields[key];
                                obj[key] = valObj.stringValue !== undefined ? valObj.stringValue :
                                          (valObj.integerValue !== undefined ? valObj.integerValue :
                                          (valObj.doubleValue !== undefined ? valObj.doubleValue :
                                          (valObj.booleanValue !== undefined ? valObj.booleanValue : null)));
                            }
                            return obj;
                        });
                        resolve(items);
                    } else {
                        resolve([]);
                    }
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Send Zalo message via Transaction API
 */
async function sendZaloMessage(text, recipientId, accessToken) {
    if (!accessToken || !recipientId) return { error: -1, message: 'Missing credentials' };

    const postData = JSON.stringify({
        recipient: { user_id: recipientId },
        message: { text: text }
    });

    const options = {
        hostname: 'openapi.zalo.me',
        path: '/v3.0/oa/message/transaction',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': accessToken
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

/**
 * Refresh Zalo Access Token
 */
async function refreshZaloToken(config) {
    if (!config.refreshToken || !config.appId || !config.appSecret) return null;

    const postData = new URLSearchParams({
        refresh_token: config.refreshToken,
        app_id: config.appId,
        grant_type: 'refresh_token'
    }).toString();

    const options = {
        hostname: 'oauth.zaloapp.com',
        path: '/v4/oa/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': config.appSecret
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.write(postData);
        req.end();
    });
}

/**
 * Update Firestore with new token
 */
async function updateFirestoreToken(newAccessToken, newRefreshToken) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/system_settings/zalo_config?updateMask.fieldPaths=accessToken&updateMask.fieldPaths=refreshToken`;
    
    const postData = JSON.stringify({
        fields: {
            accessToken: { stringValue: newAccessToken },
            refreshToken: { stringValue: newRefreshToken }
        }
    });

    const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve(true));
        });
        req.on('error', () => resolve(false));
        req.write(postData);
        req.end();
    });
}

/**
 * Main Scanning Routine
 */
export async function runExpirationScan() {
    console.log(`[AlertService] Starting daily scan: ${new Date().toLocaleString()}`);
    const summary = { vehicleAlerts: 0, contractAlerts: 0, adminAlerts: 0, hrAlerts: 0, emailSent: false, zaloSent: 0 };

    try {
        // 1. Load Zalo Config from Firestore
        const settingsUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/system_settings/zalo_config`;
        let settingsRes = await new Promise((resolve) => {
            https.get(settingsUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
                });
            });
        });

        // Try alternative path if not found
        if (!settingsRes.fields) {
            const altZaloUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/zalo_config/zalo_config`;
            settingsRes = await new Promise((resolve) => {
                https.get(altZaloUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
                    });
                });
            });
        }

        if (!settingsRes.fields) {
            console.warn('[AlertService] Zalo config not found in Firestore. Zalo notifications will be disabled.');
        }

        const config = {
            accessToken: settingsRes.fields?.accessToken?.stringValue || '',
            refreshToken: settingsRes.fields?.refreshToken?.stringValue || '',
            appId: settingsRes.fields?.appId?.stringValue || '',
            appSecret: settingsRes.fields?.appSecret?.stringValue || '',
            adminZaloId: settingsRes.fields?.adminZaloId?.stringValue || '',
            enabled: settingsRes.fields?.enabled?.booleanValue ?? false
        };
        
        // 1b. Load Email Config from Firestore
        const emailSettingsUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/email_config/email_config`;
        const emailSettingsRes = await new Promise((resolve) => {
            https.get(emailSettingsUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
                });
            });
        });

        const emailConfig = {
            enabled: emailSettingsRes.fields?.enabled?.booleanValue ?? false,
            smtpHost: emailSettingsRes.fields?.smtpHost?.stringValue || 'smtp.gmail.com',
            smtpPort: emailSettingsRes.fields?.smtpPort?.stringValue || '587',
            smtpUser: emailSettingsRes.fields?.smtpUser?.stringValue || '',
            smtpPass: emailSettingsRes.fields?.smtpPass?.stringValue || '',
            senderName: emailSettingsRes.fields?.senderName?.stringValue || 'VIETBACHCORP Alert',
            recipientEmails: emailSettingsRes.fields?.recipientEmails?.stringValue || '',
            smtpSecure: emailSettingsRes.fields?.smtpSecure?.stringValue || 'false'
        };

        // Only skip Zalo if truly broken, but don't return so Email can still work
        const isZaloReady = config.enabled && config.accessToken;
        if (!isZaloReady) {
            console.log('[AlertService] Zalo notifications are skipped (disabled or no token).');
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Use local date string YYYY-MM-DD
        const tomorrowStr = tomorrow.getFullYear() + '-' + 
                            String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(tomorrow.getDate()).padStart(2, '0');

        console.log(`[AlertService] Scanning for expiration date: ${tomorrowStr}`);

        const alerts = [];

        // 2. Scan Vehicle Inspections
        const vehicles = await fetchFirestoreCollection('vmVehicles');
        vehicles.forEach(v => {
            const date = v.inspectionDate || v.nextInspection;
            if (date === tomorrowStr) {
                alerts.push(`🚗 [HẾT HẠN KIỂM ĐỊNH]\nXe: ${v.licensePlate || v.name}\nNgày hết hạn: ${date}`);
                summary.vehicleAlerts++;
            }
        });

        // 3. Scan Project Contracts & Warranty
        const pmProjects = await fetchFirestoreCollection('pmProjects');
        const projectMap = {};
        pmProjects.forEach(p => {
            projectMap[p.id] = p.name;
        });

        const pmContracts = await fetchFirestoreCollection('pmContracts');
        pmContracts.forEach(c => {
            // Check completed contracts without acceptance date
            if ((c.status === 'da-hoan-thien' || c.status === 'dang-hoan-thien') && !c.acceptanceDate) {
                const contractVal = parseFloat(c.value) || 0;
                const formattedValue = contractVal ? new Intl.NumberFormat('vi-VN').format(contractVal) : '0';
                const projectName = projectMap[c.projectId] || 'Không xác định';
                alerts.push(`🚨 [CHƯA NGHIỆM THU VÀ QUYẾT TOÁN]\nSố hợp đồng: ${c.contractNo || c.id}, có giá trị ${formattedValue}, thuộc Gói Thầu/Dự án: ${projectName}. Đã thi công xong nhưng chưa được nghiệm thu thanh quyết toán.`);
                summary.contractAlerts++;
            }
            // Contract Expiry (Sign Date + Execution Time)
            if (c.signDate && c.executionTime) {
                try {
                    const sign = new Date(c.signDate);
                    const expiry = new Date(sign.getTime() + (parseInt(c.executionTime) * 24 * 60 * 60 * 1000));
                    const expiryStr = expiry.getFullYear() + '-' + 
                                      String(expiry.getMonth() + 1).padStart(2, '0') + '-' + 
                                      String(expiry.getDate()).padStart(2, '0');
                    
                    if (expiryStr === tomorrowStr) {
                        alerts.push(`📑 [HẾT HẠN HĐ DỰ ÁN]\nHĐ: ${c.id} - ${c.title}\nNgày hết hạn: ${expiryStr}`);
                        summary.contractAlerts++;
                    }
                } catch (e) { /* skip invalid dates */ }
            }
            // Setup today string for overdue checks
            const todayDate = new Date();
            const todayStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');

            // Warranty Expiry
            let warrantyExpiryStr = null;
            if (c.acceptanceDate && c.warrantyPeriod) {
                try {
                    const months = parseInt(c.warrantyPeriod);
                    if (months > 0) {
                        let wStart = new Date(c.acceptanceDate);
                        if (c.acceptanceDate.includes('/')) {
                            const p = c.acceptanceDate.split('/');
                            if (p.length === 3) wStart = new Date(`${p[2]}-${p[1]}-${p[0]}`);
                        }
                        
                        if (!isNaN(wStart.getTime())) {
                            wStart.setMonth(wStart.getMonth() + months);
                            warrantyExpiryStr = wStart.getFullYear() + '-' + 
                                              String(wStart.getMonth() + 1).padStart(2, '0') + '-' + 
                                              String(wStart.getDate()).padStart(2, '0');
                        }
                    }
                } catch (e) { /* skip invalid dates */ }
            } else if (c.guaranteeExpiry) {
                warrantyExpiryStr = c.guaranteeExpiry;
            }

            if (warrantyExpiryStr && !['da-thanh-ly', 'da-quyet-toan'].includes(c.status)) {
                if (warrantyExpiryStr === tomorrowStr) {
                    alerts.push(`🛡️ [HẾT HẠN BẢO HÀNH DỰ ÁN]\nHĐ: ${c.id} - ${c.title}\nHạn bảo hành: ${warrantyExpiryStr} (Ngày mai)`);
                    summary.contractAlerts++;
                } else if (warrantyExpiryStr <= todayStr) {
                    alerts.push(`🚨 [QUÁ HẠN BẢO HÀNH DỰ ÁN]\nHĐ: ${c.id} - ${c.title}\nĐã hết hạn từ: ${warrantyExpiryStr}`);
                    summary.contractAlerts++;
                }
            }
        });

        // 4. Scan Administrative Documents (Lưu trữ hồ sơ)
        const docs = await fetchFirestoreCollection('hoSoDocuments');
        docs.forEach(d => {
            if (d.warrantyEnd === tomorrowStr) {
                alerts.push(`📂 [HẾT HẠN BẢO HÀNH HỒ SƠ]\nHồ sơ: ${d.id} - ${d.title}\nHạn bảo hành: ${d.warrantyEnd}`);
                summary.adminAlerts++;
            }
            if (d.appendixExtend === tomorrowStr) {
                alerts.push(`🔗 [HẾT HẠN GIA HẠN PHỤ LỤC]\nHồ sơ: ${d.id} - ${d.title}\nHạn gia hạn: ${d.appendixExtend}`);
                summary.adminAlerts++;
            }
        });

        // 5. Scan HR Contracts
        const hrContracts = await fetchFirestoreCollection('contracts');
        hrContracts.forEach(c => {
            if (c.ngayKetThuc === tomorrowStr) {
                alerts.push(`👔 [HẾT HẠN HĐ NHÂN SỰ]\nNV: ${c.nhanVienId || 'N/A'} - Loại: ${c.loaiHopDong || 'HĐLD'}\nNgày kết thúc: ${c.ngayKetThuc}`);
                summary.hrAlerts++;
            }
        });

        // 6. Scan for New Admin Items & Pending Approvals (Only official incoming/outgoing dispatches)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check Ho So / Documents (Only official incoming/outgoing dispatches)
        docs.forEach(d => {
            if (d.category === 'cong-van-den' || d.category === 'cong-van-di') {
                if (d.createdAt && d.createdAt.startsWith(yesterdayStr)) {
                    const typeLabel = d.category === 'cong-van-den' ? 'CÔNG VĂN ĐẾN MỚI' : 'CÔNG VĂN ĐI MỚI';
                    alerts.push(`📝 [${typeLabel}] ${d.title} (${d.id})`);
                    summary.adminAlerts++;
                }
                if (d.status === 'pending') {
                    const typeLabel = d.category === 'cong-van-den' ? 'Công văn đến' : 'Công văn đi';
                    alerts.push(`⏳ [CHỜ PHÊ DUYỆT] ${typeLabel}: ${d.title} (${d.id})`);
                }
            }
        });

        // Deduplicate daily alerts to prevent duplicate Zalo/Email messages
        const uniqueAlerts = [...new Set(alerts)];
        alerts.length = 0;
        alerts.push(...uniqueAlerts);

        // 4. Send Alerts
        if (alerts.length > 0) {
            console.log(`[AlertService] Found ${alerts.length} expirations for tomorrow.`);
            if (isZaloReady) {
                let currentToken = config.accessToken;

                // Support multiple recipients (comma-separated string or array)
                const recipientIds = Array.isArray(config.adminZaloId) 
                    ? config.adminZaloId 
                    : (config.adminZaloId || '').split(',').map(id => id.trim()).filter(id => id);

                if (recipientIds.length > 0) {
                    for (const msg of alerts) {
                        for (const zaloId of recipientIds) {
                            let res = await sendZaloMessage(msg, zaloId, currentToken);
                            
                            // Handle expired token
                            if (res.error === -216 || res.error === 101) {
                                console.log('[AlertService] Access token expired, attempting refresh...');
                                const refreshRes = await refreshZaloToken(config);
                                if (refreshRes && refreshRes.access_token) {
                                    currentToken = refreshRes.access_token;
                                    await updateFirestoreToken(refreshRes.access_token, refreshRes.refresh_token || config.refreshToken);
                                    // Retry sending for this user
                                    res = await sendZaloMessage(msg, zaloId, currentToken);
                                }
                            }
                            console.log(`[AlertService] Zalo response for ${zaloId}:`, res);
                            if (res.error === 0) summary.zaloSent++;
                        }
                    }
                } else {
                    console.log('[AlertService] No valid Zalo recipient IDs found.');
                }
            }

            // --- Send via Email ---
            if (emailConfig.enabled) {
                const emailSubject = `[VIETBACHCORP ALERT] Thông báo hết hạn ngày ${tomorrowStr}`;
                const emailBody = `Chào Ban Quản Lý,\n\nHệ thống VIETBACHCORP ghi nhận các mục sau sẽ hết hạn vào ngày mai (${tomorrowStr}):\n\n` + 
                                  alerts.map(a => "- " + a).join('\n\n') + 
                                  `\n\nVui lòng kiểm tra và xử lý.\n\n` +
                                  `Thống kê quét:\n` +
                                  `- Xe hết hạn kiểm định: ${summary.vehicleAlerts}\n` +
                                  `- Hợp đồng/Bảo hành dự án: ${summary.contractAlerts}\n` +
                                  `- Hồ sơ & Công văn mới: ${summary.adminAlerts}\n` +
                                  `- Hợp đồng nhân sự: ${summary.hrAlerts}\n` +
                                  `- Thông báo/Phê duyệt khác: ${alerts.length - (summary.vehicleAlerts + summary.contractAlerts + summary.adminAlerts + summary.hrAlerts)}\n\n` +
                                  `Trân trọng,\nVIETBACHCORP System`;
                
                const emailRes = await sendEmailNotification(emailSubject, emailBody, emailConfig);
                summary.emailSent = emailRes.success;
            }
        } else {
            console.log('[AlertService] No expirations found for tomorrow.');
        }

        return summary;

    } catch (err) {
        console.error('[AlertService] Error during scan:', err);
        return { error: err.message };
    }
}
