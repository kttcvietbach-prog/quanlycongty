import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default module folders for auto-creation
const MODULE_FOLDERS = {
  'du-an': 'Dự Án',
  'hop-dong': 'Hợp Đồng',
  'tai-chinh': 'Tài Chính',
  'nhan-su': 'Nhân Sự',
  'kho-van': 'Kho Vận',
  'dau-thau': 'Đấu Thầu',
  'san-xuat': 'Sản Xuất',
  'chung': 'Chung'
};

let driveClient = null;
let rootFolderId = null;
let moduleFolderMap = {}; // { 'du-an': 'folderId', ... }

/**
 * Initialize Google Drive client
 * Supports: 1) SA JSON key  2) ADC (gcloud)  3) OAuth2 refresh token
 */
async function initDriveClient() {
  if (driveClient) return driveClient;

  try {
    let auth;
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';
    const fullCredPath = path.resolve(__dirname, credPath);

    if (fs.existsSync(fullCredPath)) {
      // Method 1: Service Account JSON key file
      const credentials = JSON.parse(fs.readFileSync(fullCredPath, 'utf8'));
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
      console.log('🔑 [GoogleDrive] Auth: Service Account key');
    } else if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
      // Method 3: OAuth2 refresh token (from get-drive-token.mjs)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID,
        process.env.GOOGLE_DRIVE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
      });
      auth = oauth2Client;
      console.log('🔑 [GoogleDrive] Auth: OAuth2 refresh token');
    } else {
      // Method 2: Application Default Credentials
      auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/drive']
      });
      console.log('🔑 [GoogleDrive] Auth: Application Default Credentials');
    }

    driveClient = google.drive({ version: 'v3', auth });
    rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null;

    if (rootFolderId) {
      const folder = await driveClient.files.get({
        fileId: rootFolderId,
        fields: 'id, name'
      });
      console.log(`✅ [GoogleDrive] Connected! Root folder: "${folder.data.name}"`);
      await ensureModuleFolders();
    } else {
      console.warn('⚠️ [GoogleDrive] GOOGLE_DRIVE_ROOT_FOLDER_ID not set. Using Drive root.');
    }

    return driveClient;
  } catch (err) {
    console.error('❌ [GoogleDrive] Init failed:', err.message);
    console.warn('💡 Chạy: node get-drive-token.mjs');
    driveClient = null;
    return null;
  }
}

/**
 * Ensure all module folders exist under root
 */
async function ensureModuleFolders() {
  if (!driveClient || !rootFolderId) return;

  try {
    // List existing folders under root
    const res = await driveClient.files.list({
      q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 100
    });

    const existing = {};
    for (const f of res.data.files) {
      existing[f.name] = f.id;
    }

    // Create missing module folders
    for (const [key, name] of Object.entries(MODULE_FOLDERS)) {
      if (existing[name]) {
        moduleFolderMap[key] = existing[name];
      } else {
        const folder = await driveClient.files.create({
          requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId]
          },
          fields: 'id, name'
        });
        moduleFolderMap[key] = folder.data.id;
        console.log(`📁 [GoogleDrive] Created folder: "${name}" (${folder.data.id})`);
      }
    }

    console.log(`📁 [GoogleDrive] Module folders ready:`, Object.keys(moduleFolderMap).join(', '));
  } catch (err) {
    console.error('❌ [GoogleDrive] ensureModuleFolders error:', err.message);
  }
}

/**
 * Upload a file to Google Drive
 * @param {Object} params
 * @param {string} params.filePath - Local file path
 * @param {string} params.fileName - File name to use on Drive
 * @param {string} params.mimeType - MIME type
 * @param {string} [params.module] - Module key (du-an, hop-dong, etc.)
 * @param {string} [params.folderId] - Specific folder ID (overrides module)
 * @returns {Object} { id, name, webViewLink, size }
 */
async function uploadFile({ filePath, fileName, mimeType, module, folderId }) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình. Xem hướng dẫn setup.');

  // Determine target folder
  let targetFolderId = folderId || null;
  if (!targetFolderId && module && moduleFolderMap[module]) {
    targetFolderId = moduleFolderMap[module];
  }
  if (!targetFolderId) {
    targetFolderId = moduleFolderMap['chung'] || rootFolderId;
  }

  // Escape single quotes for query
  const queryName = fileName.replace(/'/g, "\\'");

  const existingFiles = await drive.files.list({
    q: `name='${queryName}' and '${targetFolderId}' in parents and trashed=false`,
    fields: 'files(id)'
  });

  const media = {
    mimeType,
    body: fs.createReadStream(filePath)
  };

  let res;
  let isNew = false;

  if (existingFiles.data.files && existingFiles.data.files.length > 0) {
    // Overwrite existing file
    const existingFileId = existingFiles.data.files[0].id;
    res = await drive.files.update({
      fileId: existingFileId,
      media,
      fields: 'id, name, webViewLink, webContentLink, size, mimeType, createdTime'
    });
    console.log(`✅ [GoogleDrive] Updated existing: "${fileName}" → ${res.data.id}`);
  } else {
    // Create new file
    isNew = true;
    const fileMetadata = {
      name: fileName,
      parents: targetFolderId ? [targetFolderId] : []
    };
    res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink, size, mimeType, createdTime'
    });
    console.log(`✅ [GoogleDrive] Uploaded new: "${fileName}" → ${res.data.id}`);
  }

  if (isNew) {
    // Make the file publicly viewable so it can be loaded directly in the browser/ERP
    try {
      await drive.permissions.create({
        fileId: res.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log(`🔓 [GoogleDrive] Set public read permission for file: ${res.data.id}`);
    } catch (err) {
      console.warn(`⚠️ [GoogleDrive] Failed to set public permission for file ${res.data.id}:`, err.message);
    }
  }

  return res.data;
}

/**
 * List files in a folder
 * @param {string} [folderId] - Folder ID (defaults to root)
 * @param {string} [module] - Module key
 * @param {number} [pageSize] - Max results
 * @param {string} [pageToken] - Pagination token
 */
async function listFiles({ folderId, module, pageSize = 50, pageToken } = {}) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình.');

  let targetFolderId = folderId || null;
  if (!targetFolderId && module && moduleFolderMap[module]) {
    targetFolderId = moduleFolderMap[module];
  }
  if (!targetFolderId) {
    targetFolderId = rootFolderId;
  }

  const query = targetFolderId
    ? `'${targetFolderId}' in parents and trashed=false`
    : `trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime, iconLink, thumbnailLink)',
    pageSize,
    pageToken,
    orderBy: 'modifiedTime desc'
  });

  return {
    files: res.data.files || [],
    nextPageToken: res.data.nextPageToken || null
  };
}

/**
 * Get download stream for a file
 */
async function downloadFile(fileId) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình.');

  // Get file metadata first
  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size'
  });

  // Get file content
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return { stream: res.data, metadata: meta.data };
}

/**
 * Delete a file from Drive
 */
async function deleteFile(fileId) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình.');

  await drive.files.delete({ fileId });
  console.log(`🗑️ [GoogleDrive] Deleted: ${fileId}`);
  return { success: true };
}

/**
 * Create a new folder
 * @param {string} name - Folder name
 * @param {string} [parentId] - Parent folder ID
 */
async function createFolder(name, parentId) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình.');

  const targetParent = parentId || rootFolderId;

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: targetParent ? [targetParent] : []
    },
    fields: 'id, name, webViewLink, createdTime'
  });

  console.log(`📁 [GoogleDrive] Folder created: "${name}" (${res.data.id})`);
  return res.data;
}

/**
 * List folders (for folder picker)
 */
async function listFolders(parentId) {
  const drive = await initDriveClient();
  if (!drive) throw new Error('Google Drive chưa được cấu hình.');

  const targetParent = parentId || rootFolderId;
  const query = targetParent
    ? `'${targetParent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name, createdTime)',
    orderBy: 'name',
    pageSize: 100
  });

  return res.data.files || [];
}

/**
 * Get module folder mapping
 */
function getModuleFolders() {
  return Object.entries(MODULE_FOLDERS).map(([key, name]) => ({
    key,
    name,
    folderId: moduleFolderMap[key] || null
  }));
}

/**
 * Check if Drive is configured
 */
async function isDriveReady() {
  const drive = await initDriveClient();
  return !!drive;
}

export {
  initDriveClient,
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
  createFolder,
  listFolders,
  getModuleFolders,
  isDriveReady
};
