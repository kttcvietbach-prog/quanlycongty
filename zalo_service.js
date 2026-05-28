// ==========================================
// Zalo Service - VIETBACHCORP ERP
// Quản lý thông báo qua Zalo OA (API v3.0)
// ==========================================

(function () {
    'use strict';

    const COLLECTION_SETTINGS = 'system_settings';
    const DOC_ID_ZALO = 'zalo_config';

    const ZaloService = {
        config: {
            appId: '4409694189392247927', 
            appSecret: 'PqF8Y33PuE2Seo5NnyZh',
            accessToken: 'iY711sWsb6osASy7RpwUPx4dn0Ti9yObp4Z7C54ZrLRoU-9GTpR3PQvVxq0C9zLwb6xGTqSXmKV2Ri1UItBLO-i_X6HULBLfvYsKVMLKZshN59zwH4wKMFWNZr9-VOjlfZ-jU1rv_tYnBjDe7p3AJxvvoqiG2FzIlql-ImeavrU8ViTN9ptoHuT6n7Cf0iP8zcZKS7e0xL3Z7FXcOG3nVVm3rtnONeHjvpxNI48ems_DIEnv5b3f1fCey3eSG_8PfnpY3HzRrHF2F8OI75sF9wu1cpCbPgumbd6d8H86hH2qQxyx9cYo9FumcIviP9mGi3km1pnjuH7W0ECGJKJr3vS7-oWaOlOqkYR3FXTUZIV9GuDDIspgBcDIR26MOG',
            refreshToken: 'd44V3SzNZHcOIH4Do5-74fz76WtBHir4xYy_KCLfp3ILAojpb4BbQhPSS6gaF8urZNvYVwKQdZoBPtHIWYEAITTzPXxxPBS2mGXSMEvEZ3ZFLcn--mgy8EXWIthwFPKGq7LbQ8jki3UFEKPlZIUQ1QHEQdhoLQmDm0ayKibs_JBXF1jG-rlfJUi70G6vHirFwoqu6h5OrdkrGZiavWNqEEWQOLFJOf4ozdiDSgqitWRxUKvvo26i9l9UF6hWFUaBn6OlN902s0kf6HbMWc-EBzXmRqhfFVWmldHnHxSVvH_iOWDueXdY9vbSDp-39T1TbZ8s5DX7q0gAM1f6lGtjAEv184Vf2CbJwqOVIcbZBwGjoq2F50',
            adminZaloId: '520764345037309691', // ID nhận thông báo mặc định
            enabled: true
        },

        /**
         * Khởi tạo: Tải cấu hình từ Cloud/LocalStorage
         */
        async init() {
            try {
                // 1. Tải từ LocalStorage (Nhưng ưu tiên mã mới nếu mã cũ lỗi)
                if (window.erpApp && window.erpApp._getData) {
                    const localSettings = window.erpApp._getData(COLLECTION_SETTINGS) || [];
                    const localZalo = localSettings.find(s => s.id === DOC_ID_ZALO);
                    
                    // Nếu đã có cấu hình cũ, ta chỉ lấy các ID, còn Token thì ưu tiên mã mới vừa dán
                    if (localZalo) {
                        this.config = { ...this.config, ...localZalo, 
                            accessToken: 'iY711sWsb6osASy7RpwUPx4dn0Ti9yObp4Z7C54ZrLRoU-9GTpR3PQvVxq0C9zLwb6xGTqSXmKV2Ri1UItBLO-i_X6HULBLfvYsKVMLKZshN59zwH4wKMFWNZr9-VOjlfZ-jU1rv_tYnBjDe7p3AJxvvoqiG2FzIlql-ImeavrU8ViTN9ptoHuT6n7Cf0iP8zcZKS7e0xL3Z7FXcOG3nVVm3rtnONeHjvpxNI48ems_DIEnv5b3f1fCey3eSG_8PfnpY3HzRrHF2F8OI75sF9wu1cpCbPgumbd6d8H86hH2qQxyx9cYo9FumcIviP9mGi3km1pnjuH7W0ECGJKJr3vS7-oWaOlOqkYR3FXTUZIV9GuDDIspgBcDIR26MOG',
                            refreshToken: 'd44V3SzNZHcOIH4Do5-74fz76WtBHir4xYy_KCLfp3ILAojpb4BbQhPSS6gaF8urZNvYVwKQdZoBPtHIWYEAITTzPXxxPBS2mGXSMEvEZ3ZFLcn--mgy8EXWIthwFPKGq7LbQ8jki3UFEKPlZIUQ1QHEQdhoLQmDm0ayKibs_JBXF1jG-rlfJUi70G6vHirFwoqu6h5OrdkrGZiavWNqEEWQOLFJOf4ozdiDSgqitWRxUKvvo26i9l9UF6hWFUaBn6OlN902s0kf6HbMWc-EBzXmRqhfFVWmldHnHxSVvH_iOWDueXdY9vbSDp-39T1TbZ8s5DX7q0gAM1f6lGtjAEv184Vf2CbJwqOVIcbZBwGjoq2F50'
                        };
                    }
                }

                // 2. Đồng bộ từ Firebase
                if (window.SyncManager) {
                    await window.SyncManager.ready;
                    const cloudSettings = await window.FireSync.getAll(COLLECTION_SETTINGS);
                    const cloudZalo = cloudSettings?.find(s => s.id === DOC_ID_ZALO);
                    if (cloudZalo) {
                        this.config = { ...this.config, ...cloudZalo };
                        console.log('✅ [ZaloService] Đã tải cấu hình từ Cloud.');
                    }
                }
            } catch (err) {
                console.error('❌ [ZaloService] Lỗi khởi tạo:', err);
            }
        },

        /**
         * Lưu cấu hình mới
         */
        async saveConfig(newConfig) {
            this.config = { ...this.config, ...newConfig, id: DOC_ID_ZALO };
            
            // Lưu lên Firebase
            if (window.CrudSync) {
                await window.CrudSync.saveItem(COLLECTION_SETTINGS, this.config, 'id');
            }

            // Lưu LocalStorage
            if (window.erpApp && window.erpApp._getData) {
                const allSettings = window.erpApp._getData(COLLECTION_SETTINGS) || [];
                const idx = allSettings.findIndex(s => s.id === DOC_ID_ZALO);
                if (idx > -1) {allSettings[idx] = this.config;}
                else {allSettings.push(this.config);}
                window.erpApp._setData(COLLECTION_SETTINGS, allSettings);
            }
            
            return true;
        },

        /**
         * Tạo appsecret_proof bằng HMAC-SHA256 (Yêu cầu bởi Zalo khi bật bảo mật)
         */
        async generateAppSecretProof(accessToken) {
            if (!this.config.appSecret) {return null;}
            try {
                const encoder = new TextEncoder();
                const keyData = encoder.encode(this.config.appSecret);
                const msgData = encoder.encode(accessToken);
                
                const key = await crypto.subtle.importKey(
                    'raw', 
                    keyData, 
                    { name: 'HMAC', hash: 'SHA-256' }, 
                    false, 
                    ['sign']
                );
                
                const signature = await crypto.subtle.sign('HMAC', key, msgData);
                
                return Array.from(new Uint8Array(signature))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (e) {
                console.error('❌ [ZaloService] Lỗi tạo appsecret_proof:', e);
                return null;
            }
        },

        /**
         * Gửi tin nhắn văn bản (Transaction Message)
         */
        async sendMessage(text, recipientId = null) {
            const targetId = recipientId || this.config.adminZaloId;
            
            if (!this.config.enabled || !this.config.accessToken || !targetId) {
                console.log('%c[Zalo Simulation] %cNotification:', 'color:#0068ff; font-weight:bold;', 'color:inherit;', text);
                return { error: 0, message: 'Simulation only' };
            }

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'access_token': this.config.accessToken
                };

                // Sử dụng Proxy nội bộ của Server ERP (Chạy qua zalo_proxy.py)
                const localProxyUrl = window.location.origin + '/zalo-proxy';

                const response = await fetch(localProxyUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        recipient: { user_id: targetId },
                        message: { text: text }
                    })
                });
                
                const result = await response.json();

                console.log('📡 [ZaloService] API Result:', result);

                // Xử lý khi Token hết hạn (Mã lỗi Zalo: -216 hoặc 101)
                if (result.error === -216 || result.error === 101) {
                    console.warn('⚠️ [ZaloService] Access Token hết hạn, đang tự động làm mới...');
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        return await this.sendMessage(text, recipientId); // Thử lại sau khi refresh
                    }
                }

                return result;
            } catch (error) {
                console.error('❌ [ZaloService] Lỗi kết nối API Zalo:', error);
                return { error: -1, message: 'Connection Error' };
            }
        },

        /**
         * Làm mới Access Token bằng Refresh Token
         */
        async refreshAccessToken() {
            if (!this.config.refreshToken || !this.config.appId || !this.config.appSecret) {
                console.error('❌ [ZaloService] Thiếu thông tin AppId/Secret/RefreshToken để gia hạn.');
                return false;
            }

            try {
                // Sử dụng Proxy để gia hạn token
                const refreshProxyUrl = window.location.origin + '/zalo-refresh';
                
                const response = await fetch(refreshProxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'secret_key': this.config.appSecret
                    },
                    body: new URLSearchParams({
                        refresh_token: this.config.refreshToken,
                        app_id: this.config.appId,
                        grant_type: 'refresh_token'
                    })
                });

                const data = await response.json();
                if (data.access_token) {
                    await this.saveConfig({
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token || this.config.refreshToken
                    });
                    console.log('✅ [ZaloService] Refresh Token thành công!');
                    return true;
                } else {
                    console.error('❌ [ZaloService] Không thể refresh token:', data);
                    return false;
                }
            } catch (e) {
                console.error('❌ [ZaloService] Lỗi khi gọi API Refresh:', e);
                return false;
            }
        }
    };

    window.ZaloService = ZaloService;
    ZaloService.init();

})();
