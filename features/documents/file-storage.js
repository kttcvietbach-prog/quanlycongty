/**
 * Documents Module - File Storage & Communications
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let documents = [];
let communications = [];

export function init() {
  documents = storage.load(STORAGE_KEYS.documents, []);
  communications = storage.load(STORAGE_KEYS.communications, []);
  console.log(`✅ Documents Module: ${documents.length} files, ${communications.length} communications`);
}

/**
 * FILE STORAGE
 */
export function getAllDocuments() { return [...documents]; }

export function getDocumentById(id) { return documents.find(d => d.id === id); }

export function uploadDocument(data) {
  try {
    const doc = {
      id: idGen.generateRandomId('DOC'),
      tenFile: data.tenFile,
      kichThuoc: data.kichThuoc || 0,
      loaiFile: data.loaiFile || 'other',
      nguoiTao: data.nguoiTao || '',
      ngayTao: new Date().toISOString(),
      category: data.category || 'general',
      duongDan: data.duongDan || '',
      moTa: data.moTa || ''
    };

    documents.push(doc);
    storage.save(STORAGE_KEYS.documents, documents);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tải lên tài liệu mới: ${doc.tenFile}`,
        'file_upload',
        'blue',
        'documents'
      );
    }

    return { success: true, document: doc };
  } catch (error) {
    return { success: false };
  }
}

export function deleteDocument(id) {
  try {
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) {return { success: false };}

    const removed = documents.splice(idx, 1)[0];
    storage.save(STORAGE_KEYS.documents, documents);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xóa tài liệu: ${removed.tenFile}`,
        'delete_forever',
        'red',
        'documents'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function searchDocuments(query) {
  const q = query.toLowerCase();
  return documents.filter(d => d.tenFile.toLowerCase().includes(q));
}

/**
 * COMMUNICATIONS
 */
export function getAllCommunications() { return [...communications]; }

export function getCommunicationById(id) { return communications.find(c => c.id === id); }

export function createCommunication(data) {
  try {
    const comm = {
      id: idGen.generateRandomId('COMM'),
      tieuDe: data.tieuDe || '',
      noiDung: data.noiDung || '',
      nguoiGui: data.nguoiGui || '',
      nguoiNhan: data.nguoiNhan || [],
      ngayGui: new Date().toISOString(),
      trangThai: 'moi',
      loai: data.loai || 'thong-bao'
    };

    communications.push(comm);
    storage.save(STORAGE_KEYS.communications, communications);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã gửi thông báo mới: ${comm.tieuDe}`,
        'campaign',
        'orange',
        'documents'
      );
    }

    return { success: true, communication: comm };
  } catch (error) {
    return { success: false };
  }
}

export function markAsRead(id) {
  try {
    const comm = getCommunicationById(id);
    if (comm) {
      comm.trangThai = 'da-doc';
      storage.save(STORAGE_KEYS.communications, communications);
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

export function getUnreadCommunications() {
  return communications.filter(c => c.trangThai === 'moi');
}
