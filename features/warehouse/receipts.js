/**
 * Warehouse Module - Inventory Management
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let receipts = [];
let shipments = [];

export function init() {
  receipts = storage.load(STORAGE_KEYS.receipts, []);
  shipments = storage.load(STORAGE_KEYS.shipments, []);
  console.log(`✅ Warehouse Module: ${receipts.length} receipts, ${shipments.length} shipments`);
}

/**
 * RECEIPTS (Nhập kho)
 */
export function getAllReceipts() { return [...receipts]; }

export function getReceiptById(id) { return receipts.find(r => r.id === id); }

export function createReceipt(data) {
  try {
    const receipt = {
      id: idGen.generateRandomId('NK'),
      nguonHang: data.nguonHang || '', // NCC hoặc SX
      sanPhamId: data.sanPhamId,
      soLuong: data.soLuong || 1,
      ngayNhap: data.ngayNhap || new Date().toISOString().split('T')[0],
      giaNhap: data.giaNhap || 0,
      donVi: data.donVi || 'cái',
      trangThai: 'nhap-kho',
      createdDate: new Date().toISOString()
    };

    receipts.push(receipt);
    storage.save(STORAGE_KEYS.receipts, receipts);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã nhập kho sản phẩm: ${receipt.sanPhamId}`,
        'login',
        'green',
        'kho'
      );
    }

    return { success: true, receipt };
  } catch (error) {
    return { success: false };
  }
}

/**
 * SHIPMENTS (Xuất kho)
 */
export function getAllShipments() { return [...shipments]; }

export function getShipmentById(id) { return shipments.find(s => s.id === id); }

export function createShipment(data) {
  try {
    const shipment = {
      id: idGen.generateRandomId('XK'),
      sanPhamId: data.sanPhamId,
      soLuong: data.soLuong || 1,
      ngayXuat: data.ngayXuat || new Date().toISOString().split('T')[0],
      danhMuc: data.danhMuc || '', // Bán, SX, Trả lại
      trangThai: 'xuat-kho',
      createdDate: new Date().toISOString()
    };

    shipments.push(shipment);
    storage.save(STORAGE_KEYS.shipments, shipments);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xuất kho sản phẩm: ${shipment.sanPhamId}`,
        'logout',
        'orange',
        'kho'
      );
    }

    return { success: true, shipment };
  } catch (error) {
    return { success: false };
  }
}

export function getInventoryStats() {
  return {
    totalReceipts: receipts.length,
    totalShipments: shipments.length,
    netInventory: receipts.length - shipments.length,
    totalReceiptValue: receipts.reduce((sum, r) => sum + (r.soLuong * r.giaNhap), 0)
  };
}
