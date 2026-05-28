// =============================================
// FILE MANAGER - Google Drive Integration
// =============================================

/**
 * Render the File Manager UI
 */
function renderFileManager(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="fm-container" id="fm-container">
      <div class="fm-header">
        <div class="fm-header-left">
          <h2><i class="fas fa-cloud-upload-alt"></i> Quản Lý Tài Liệu</h2>
          <span class="fm-subtitle">Google Drive</span>
        </div>
        <div class="fm-header-right">
          <div class="fm-search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="fm-search" placeholder="Tìm kiếm file..." oninput="fmFilterFiles(this.value)">
          </div>
          <button class="fm-btn fm-btn-outline" onclick="fmCreateFolder()">
            <i class="fas fa-folder-plus"></i> Tạo Folder
          </button>
          <button class="fm-btn fm-btn-primary" onclick="fmOpenUploadModal()">
            <i class="fas fa-upload"></i> Upload File
          </button>
        </div>
      </div>

      <div class="fm-breadcrumb" id="fm-breadcrumb">
        <span class="fm-crumb fm-crumb-root" onclick="fmNavigate(null)">
          <i class="fas fa-home"></i> Tất cả
        </span>
      </div>

      <div class="fm-module-tabs" id="fm-module-tabs"></div>

      <div class="fm-status-bar" id="fm-status-bar">
        <span id="fm-file-count">Đang tải...</span>
        <span id="fm-drive-status" class="fm-status-dot"></span>
      </div>

      <div class="fm-file-grid" id="fm-file-grid">
        <div class="fm-loading">
          <div class="fm-spinner"></div>
          <p>Đang kết nối Google Drive...</p>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div class="fm-modal-overlay" id="fm-upload-modal" style="display:none">
      <div class="fm-modal">
        <div class="fm-modal-header">
          <h3><i class="fas fa-cloud-upload-alt"></i> Upload Tài Liệu</h3>
          <button class="fm-modal-close" onclick="fmCloseUploadModal()">&times;</button>
        </div>
        <div class="fm-modal-body">
          <div class="fm-upload-module">
            <label>Chọn Module:</label>
            <select id="fm-upload-module">
              <option value="chung">📁 Chung</option>
              <option value="du-an">📋 Dự Án</option>
              <option value="hop-dong">📝 Hợp Đồng</option>
              <option value="tai-chinh">💰 Tài Chính</option>
              <option value="nhan-su">👥 Nhân Sự</option>
              <option value="kho-van">📦 Kho Vận</option>
              <option value="dau-thau">🏗️ Đấu Thầu</option>
              <option value="san-xuat">🏭 Sản Xuất</option>
            </select>
            <div class="fm-folder-picker" id="fm-folder-picker">
              <label><input type="checkbox" id="fm-use-custom-folder" onchange="fmToggleFolderPicker()"> Chọn folder tùy chỉnh</label>
              <select id="fm-custom-folder" style="display:none" disabled></select>
            </div>
          </div>
          <div class="fm-dropzone" id="fm-dropzone"
               ondragover="event.preventDefault();this.classList.add('dragover')"
               ondragleave="this.classList.remove('dragover')"
               ondrop="fmHandleDrop(event)">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Kéo thả file vào đây</p>
            <span>hoặc</span>
            <button class="fm-btn fm-btn-primary" onclick="document.getElementById('fm-file-input').click()">
              <i class="fas fa-folder-open"></i> Chọn File
            </button>
            <input type="file" id="fm-file-input" multiple style="display:none" onchange="fmHandleFileSelect(event)">
            <p class="fm-dropzone-hint">Hỗ trợ tất cả loại file • Tối đa 100MB/file • Tối đa 10 file</p>
          </div>
          <div class="fm-upload-queue" id="fm-upload-queue"></div>
        </div>
        <div class="fm-modal-footer">
          <button class="fm-btn fm-btn-outline" onclick="fmCloseUploadModal()">Hủy</button>
          <button class="fm-btn fm-btn-primary" id="fm-upload-btn" onclick="fmStartUpload()" disabled>
            <i class="fas fa-upload"></i> Upload (<span id="fm-upload-count">0</span> file)
          </button>
        </div>
      </div>
    </div>
  `;

  fmInit();
}

// State
const fmApiBase = window.API_BASE_URL || '';
let fmCurrentFolder = null;
let fmCurrentModule = null;
let fmFiles = [];
let fmUploadQueue = [];
let fmBreadcrumbs = [{ id: null, name: 'Tất cả' }];
let fmDriveReady = false;

async function fmInit() {
  try {
    const res = await fetch(`${fmApiBase}/api/drive/status`);
    const data = await res.json();
    fmDriveReady = data.ready;

    const statusEl = document.getElementById('fm-drive-status');
    if (statusEl) {
      statusEl.innerHTML = data.ready
        ? '<i class="fas fa-check-circle" style="color:#22c55e"></i> Drive kết nối'
        : '<i class="fas fa-exclamation-circle" style="color:#f59e0b"></i> Chưa cấu hình Drive';
    }

    if (data.ready && data.modules) {
      fmRenderModuleTabs(data.modules);
      fmLoadFiles();
    } else {
      fmShowSetupGuide();
    }
  } catch (err) {
    console.error('[FM] Init error:', err);
    fmShowError('Không thể kết nối server');
  }
}

function fmRenderModuleTabs(modules) {
  const tabs = document.getElementById('fm-module-tabs');
  if (!tabs) return;

  const icons = {
    'du-an': '📋', 'hop-dong': '📝', 'tai-chinh': '💰',
    'nhan-su': '👥', 'kho-van': '📦', 'dau-thau': '🏗️',
    'san-xuat': '🏭', 'chung': '📁'
  };

  tabs.innerHTML = `
    <button class="fm-tab ${!fmCurrentModule ? 'active' : ''}" onclick="fmSelectModule(null)">
      <i class="fas fa-th-large"></i> Tất cả
    </button>
    ${modules.map(m => `
      <button class="fm-tab ${fmCurrentModule === m.key ? 'active' : ''}" onclick="fmSelectModule('${m.key}')">
        ${icons[m.key] || '📁'} ${m.name}
      </button>
    `).join('')}
  `;
}

async function fmSelectModule(moduleKey) {
  fmCurrentModule = moduleKey;
  fmCurrentFolder = null;
  fmBreadcrumbs = [{ id: null, name: 'Tất cả' }];
  if (moduleKey) {
    const icons = { 'du-an': 'Dự Án', 'hop-dong': 'Hợp Đồng', 'tai-chinh': 'Tài Chính', 'nhan-su': 'Nhân Sự', 'kho-van': 'Kho Vận', 'dau-thau': 'Đấu Thầu', 'san-xuat': 'Sản Xuất', 'chung': 'Chung' };
    fmBreadcrumbs.push({ id: moduleKey, name: icons[moduleKey] || moduleKey });
  }
  fmRenderBreadcrumb();
  document.querySelectorAll('.fm-tab').forEach(t => t.classList.remove('active'));
  event.target.closest('.fm-tab').classList.add('active');
  await fmLoadFiles();
}

async function fmLoadFiles() {
  const grid = document.getElementById('fm-file-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="fm-loading"><div class="fm-spinner"></div><p>Đang tải...</p></div>';

  try {
    const params = new URLSearchParams();
    if (fmCurrentFolder) params.set('folderId', fmCurrentFolder);
    else if (fmCurrentModule) params.set('module', fmCurrentModule);

    const res = await fetch(`${fmApiBase}/api/drive/files?${params}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error);
    fmFiles = data.files || [];
    fmRenderFiles();
  } catch (err) {
    grid.innerHTML = `<div class="fm-empty"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}

function fmRenderFiles() {
  const grid = document.getElementById('fm-file-grid');
  const countEl = document.getElementById('fm-file-count');
  if (!grid) return;

  const folders = fmFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const files = fmFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  if (countEl) countEl.textContent = `${folders.length} folder, ${files.length} file`;

  if (fmFiles.length === 0) {
    grid.innerHTML = `
      <div class="fm-empty">
        <i class="fas fa-folder-open"></i>
        <p>Chưa có file nào</p>
        <button class="fm-btn fm-btn-primary" onclick="fmOpenUploadModal()">
          <i class="fas fa-upload"></i> Upload file đầu tiên
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = `
    ${folders.map(f => `
      <div class="fm-card fm-card-folder" ondblclick="fmNavigate('${f.id}','${fmEscapeHtml(f.name)}')">
        <div class="fm-card-icon"><i class="fas fa-folder" style="color:#f59e0b"></i></div>
        <div class="fm-card-info">
          <span class="fm-card-name" title="${fmEscapeHtml(f.name)}">${fmEscapeHtml(f.name)}</span>
          <span class="fm-card-date">${fmFormatDate(f.createdTime)}</span>
        </div>
        <div class="fm-card-actions">
          <button title="Xóa" onclick="event.stopPropagation();fmDeleteItem('${f.id}','${fmEscapeHtml(f.name)}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('')}
    ${files.map(f => `
      <div class="fm-card fm-card-file">
        <div class="fm-card-icon">${fmGetFileIcon(f.mimeType, f.name)}</div>
        <div class="fm-card-info">
          <span class="fm-card-name" title="${fmEscapeHtml(f.name)}">${fmEscapeHtml(f.name)}</span>
          <span class="fm-card-meta">${fmFormatSize(f.size)} • ${fmFormatDate(f.modifiedTime)}</span>
        </div>
        <div class="fm-card-actions">
          <button title="Tải xuống" onclick="fmDownloadFile('${f.id}')">
            <i class="fas fa-download"></i>
          </button>
          ${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" title="Mở trong Drive"><i class="fas fa-external-link-alt"></i></a>` : ''}
          <button title="Xóa" onclick="fmDeleteItem('${f.id}','${fmEscapeHtml(f.name)}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('')}
  `;
}

function fmNavigate(folderId, folderName) {
  if (folderId) {
    fmCurrentFolder = folderId;
    fmBreadcrumbs.push({ id: folderId, name: folderName || 'Folder' });
  } else {
    fmCurrentFolder = null;
    fmCurrentModule = null;
    fmBreadcrumbs = [{ id: null, name: 'Tất cả' }];
  }
  fmRenderBreadcrumb();
  fmLoadFiles();
}

function fmRenderBreadcrumb() {
  const el = document.getElementById('fm-breadcrumb');
  if (!el) return;
  el.innerHTML = fmBreadcrumbs.map((b, i) => {
    const isLast = i === fmBreadcrumbs.length - 1;
    return `${i > 0 ? '<i class="fas fa-chevron-right fm-crumb-sep"></i>' : ''}
      <span class="fm-crumb ${isLast ? 'active' : ''}" onclick="fmBreadcrumbClick(${i})">
        ${i === 0 ? '<i class="fas fa-home"></i> ' : ''}${fmEscapeHtml(b.name)}
      </span>`;
  }).join('');
}

function fmBreadcrumbClick(index) {
  if (index === fmBreadcrumbs.length - 1) return;
  const target = fmBreadcrumbs[index];
  fmBreadcrumbs = fmBreadcrumbs.slice(0, index + 1);
  fmCurrentFolder = target.id;
  if (index === 0) fmCurrentModule = null;
  fmRenderBreadcrumb();
  fmLoadFiles();
}

// Upload functions
function fmOpenUploadModal() {
  document.getElementById('fm-upload-modal').style.display = 'flex';
  fmUploadQueue = [];
  fmRenderUploadQueue();
}

function fmCloseUploadModal() {
  document.getElementById('fm-upload-modal').style.display = 'none';
  fmUploadQueue = [];
  document.getElementById('fm-file-input').value = '';
}

function fmHandleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files);
  fmAddToQueue(files);
}

function fmHandleFileSelect(e) {
  const files = Array.from(e.target.files);
  fmAddToQueue(files);
}

function fmAddToQueue(files) {
  for (const f of files) {
    if (fmUploadQueue.length >= 10) break;
    if (f.size > 100 * 1024 * 1024) {
      alert(`File "${f.name}" quá lớn (>${100}MB)`);
      continue;
    }
    if (!fmUploadQueue.find(q => q.name === f.name && q.size === f.size)) {
      fmUploadQueue.push(f);
    }
  }
  fmRenderUploadQueue();
}

function fmRenderUploadQueue() {
  const queue = document.getElementById('fm-upload-queue');
  const btn = document.getElementById('fm-upload-btn');
  const count = document.getElementById('fm-upload-count');
  if (!queue) return;

  count.textContent = fmUploadQueue.length;
  btn.disabled = fmUploadQueue.length === 0;

  if (fmUploadQueue.length === 0) {
    queue.innerHTML = '';
    return;
  }

  queue.innerHTML = fmUploadQueue.map((f, i) => `
    <div class="fm-queue-item">
      <span class="fm-queue-icon">${fmGetFileIcon(f.type, f.name)}</span>
      <span class="fm-queue-name">${fmEscapeHtml(f.name)}</span>
      <span class="fm-queue-size">${fmFormatSize(f.size)}</span>
      <button class="fm-queue-remove" onclick="fmRemoveFromQueue(${i})"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function fmRemoveFromQueue(index) {
  fmUploadQueue.splice(index, 1);
  fmRenderUploadQueue();
}

async function fmStartUpload() {
  if (fmUploadQueue.length === 0) return;

  const btn = document.getElementById('fm-upload-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang upload...';

  const formData = new FormData();
  for (const f of fmUploadQueue) {
    formData.append('files', f);
  }

  const moduleSelect = document.getElementById('fm-upload-module');
  formData.append('module', moduleSelect.value);

  const useCustom = document.getElementById('fm-use-custom-folder');
  if (useCustom && useCustom.checked) {
    const customFolder = document.getElementById('fm-custom-folder');
    if (customFolder.value) formData.append('folderId', customFolder.value);
  }

  try {
    const res = await fetch(`${fmApiBase}/api/drive/upload`, { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      fmCloseUploadModal();
      fmLoadFiles();
      fmShowToast(`✅ ${data.message}`, 'success');
    } else {
      fmShowToast(`⚠️ ${data.message}. Lỗi: ${data.errors?.map(e => e.file).join(', ')}`, 'warning');
      if (data.uploaded?.length > 0) {
        fmCloseUploadModal();
        fmLoadFiles();
      }
    }
  } catch (err) {
    fmShowToast(`❌ Upload thất bại: ${err.message}`, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Upload (<span id="fm-upload-count">0</span> file)';
}

async function fmToggleFolderPicker() {
  const cb = document.getElementById('fm-use-custom-folder');
  const select = document.getElementById('fm-custom-folder');
  if (cb.checked) {
    select.style.display = 'block';
    select.disabled = false;
    select.innerHTML = '<option value="">Đang tải folders...</option>';
    try {
      const res = await fetch(`${fmApiBase}/api/drive/folders`);
      const data = await res.json();
      select.innerHTML = '<option value="">-- Chọn folder --</option>' +
        (data.folders || []).map(f => `<option value="${f.id}">${fmEscapeHtml(f.name)}</option>`).join('');
    } catch (e) {
      select.innerHTML = '<option value="">Lỗi tải folders</option>';
    }
  } else {
    select.style.display = 'none';
    select.disabled = true;
  }
}

function fmDownloadFile(fileId) {
  window.open(`${fmApiBase}/api/drive/download/${fileId}`, '_blank');
}

async function fmDeleteItem(fileId, fileName) {
  if (!confirm(`Bạn có chắc muốn xóa "${fileName}"?`)) return;
  try {
    const res = await fetch(`${fmApiBase}/api/drive/files/${fileId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fmShowToast('🗑️ Đã xóa file', 'success');
      fmLoadFiles();
    } else {
      fmShowToast(`❌ ${data.error}`, 'error');
    }
  } catch (err) {
    fmShowToast(`❌ ${err.message}`, 'error');
  }
}

async function fmCreateFolder() {
  const name = prompt('Tên folder mới:');
  if (!name || !name.trim()) return;
  try {
    const res = await fetch(`${fmApiBase}/api/drive/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), parentId: fmCurrentFolder })
    });
    const data = await res.json();
    if (data.success) {
      fmShowToast(`📁 Đã tạo folder "${name}"`, 'success');
      fmLoadFiles();
    }
  } catch (err) {
    fmShowToast(`❌ ${err.message}`, 'error');
  }
}

function fmFilterFiles(query) {
  const q = query.toLowerCase();
  const cards = document.querySelectorAll('.fm-card');
  cards.forEach(card => {
    const name = card.querySelector('.fm-card-name')?.textContent?.toLowerCase() || '';
    card.style.display = name.includes(q) ? '' : 'none';
  });
}

// Helpers
function fmGetFileIcon(mimeType, fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': '<i class="fas fa-file-pdf" style="color:#ef4444"></i>',
    'doc': '<i class="fas fa-file-word" style="color:#3b82f6"></i>',
    'docx': '<i class="fas fa-file-word" style="color:#3b82f6"></i>',
    'xls': '<i class="fas fa-file-excel" style="color:#22c55e"></i>',
    'xlsx': '<i class="fas fa-file-excel" style="color:#22c55e"></i>',
    'ppt': '<i class="fas fa-file-powerpoint" style="color:#f97316"></i>',
    'pptx': '<i class="fas fa-file-powerpoint" style="color:#f97316"></i>',
    'jpg': '<i class="fas fa-file-image" style="color:#8b5cf6"></i>',
    'jpeg': '<i class="fas fa-file-image" style="color:#8b5cf6"></i>',
    'png': '<i class="fas fa-file-image" style="color:#8b5cf6"></i>',
    'gif': '<i class="fas fa-file-image" style="color:#8b5cf6"></i>',
    'zip': '<i class="fas fa-file-archive" style="color:#eab308"></i>',
    'rar': '<i class="fas fa-file-archive" style="color:#eab308"></i>',
    'mp4': '<i class="fas fa-file-video" style="color:#ec4899"></i>',
    'mp3': '<i class="fas fa-file-audio" style="color:#14b8a6"></i>',
    'txt': '<i class="fas fa-file-alt" style="color:#6b7280"></i>',
    'csv': '<i class="fas fa-file-csv" style="color:#22c55e"></i>',
  };
  if (mimeType === 'application/vnd.google-apps.folder') return '<i class="fas fa-folder" style="color:#f59e0b"></i>';
  return iconMap[ext] || '<i class="fas fa-file" style="color:#6b7280"></i>';
}

function fmFormatSize(bytes) {
  if (!bytes) return '';
  const b = parseInt(bytes);
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
  return (b / 1073741824).toFixed(1) + ' GB';
}

function fmFormatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmEscapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmShowToast(msg, type) {
  let toast = document.getElementById('fm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fm-toast';
    document.body.appendChild(toast);
  }
  const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:12px;color:#fff;font-size:14px;z-index:99999;background:${colors[type] || '#333'};box-shadow:0 8px 24px rgba(0,0,0,.3);transition:all .3s;opacity:1;`;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 300); }, 3000);
}

function fmShowSetupGuide() {
  const grid = document.getElementById('fm-file-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="fm-setup-guide">
      <i class="fas fa-cog fa-3x" style="color:#f59e0b;margin-bottom:16px"></i>
      <h3>Chưa cấu hình Google Drive</h3>
      <p>Để sử dụng tính năng quản lý tài liệu, bạn cần:</p>
      <ol style="text-align:left;max-width:500px;margin:16px auto">
        <li>Tạo Google Cloud Project và bật Drive API</li>
        <li>Tạo Service Account và tải file credentials JSON</li>
        <li>Đặt file <code>google-credentials.json</code> vào thư mục gốc dự án</li>
        <li>Thêm <code>GOOGLE_DRIVE_ROOT_FOLDER_ID</code> vào file <code>.env</code></li>
      </ol>
      <p style="color:#94a3b8;font-size:13px">Xem chi tiết trong file <strong>google-drive-setup.md</strong></p>
    </div>`;
}

function fmShowError(msg) {
  const grid = document.getElementById('fm-file-grid');
  if (grid) grid.innerHTML = `<div class="fm-empty"><i class="fas fa-exclamation-triangle"></i><p>${msg}</p></div>`;
}
