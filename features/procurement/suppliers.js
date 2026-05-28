/**
 * Procurement Module - Suppliers & Purchase Orders
 * Suppliers, RFQ, Purchase Orders, Quotations
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';
import * as formatters from '../../lib/formatters.js';
import * as validators from '../../lib/validators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

// Module state
let suppliers = [];
let purchaseOrders = [];
let quotations = [];
let rfqs = [];

/**
 * Initialize Procurement module
 */
export function init() {
  suppliers = storage.load(STORAGE_KEYS.suppliers, []);
  purchaseOrders = storage.load(STORAGE_KEYS.purchaseOrders, []);
  quotations = storage.load(STORAGE_KEYS.quotations, []);
  rfqs = storage.load(STORAGE_KEYS.rfqs, []);

  console.log(`✅ Procurement Module initialized:
    - Suppliers: ${suppliers.length}
    - Purchase Orders: ${purchaseOrders.length}
    - Quotations: ${quotations.length}
    - RFQs: ${rfqs.length}`);
}

/**
 * SUPPLIERS
 */

export function getAllSuppliers() {
  return [...suppliers];
}

export function getSupplierById(id) {
  return suppliers.find(s => s.id === id);
}

export function createSupplier(data) {
  try {
    if (!data.tenNhaCungCap || data.tenNhaCungCap.trim() === '') {
      return { success: false, message: 'Tên nhà cung cấp không được để trống' };
    }

    const supplier = {
      id: idGen.generateRandomId('NCC'),
      tenNhaCungCap: data.tenNhaCungCap,
      email: data.email || '',
      phone: data.phone || '',
      diaChi: data.diaChi || '',
      thanhPho: data.thanhPho || '',
      quocGia: data.quocGia || 'Việt Nam',
      maSoThue: data.maSoThue || '',
      nguoiLienHe: data.nguoiLienHe || '',
      trangThai: data.trangThai || 'hoat-dong',
      danhGia: data.danhGia || 5,
      createdDate: new Date().toISOString()
    };

    suppliers.push(supplier);
    storage.save(STORAGE_KEYS.suppliers, suppliers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã thêm nhà cung cấp mới: ${supplier.tenNhaCungCap}`,
        'business',
        'blue',
        'mua-hang'
      );
    }

    return { success: true, supplier, message: 'Tạo nhà cung cấp thành công' };
  } catch (error) {
    console.error('Create supplier error:', error);
    return { success: false, message: 'Lỗi tạo nhà cung cấp' };
  }
}

export function updateSupplier(id, data) {
  try {
    const supplier = getSupplierById(id);
    if (!supplier) {
      return { success: false, message: 'Không tìm thấy nhà cung cấp' };
    }

    Object.assign(supplier, data);
    storage.save(STORAGE_KEYS.suppliers, suppliers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật thông tin NCC: ${supplier.tenNhaCungCap}`,
        'edit',
        'indigo',
        'mua-hang'
      );
    }

    return { success: true, supplier, message: 'Cập nhật nhà cung cấp thành công' };
  } catch (error) {
    console.error('Update supplier error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteSupplier(id) {
  try {
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy nhà cung cấp' };
    }

    const removed = suppliers.splice(index, 1)[0];
    storage.save(STORAGE_KEYS.suppliers, suppliers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xóa nhà cung cấp: ${removed.tenNhaCungCap}`,
        'delete',
        'red',
        'mua-hang'
      );
    }

    return { success: true, message: 'Xóa nhà cung cấp thành công' };
  } catch (error) {
    console.error('Delete supplier error:', error);
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function rateSupplier(id, rating) {
  try {
    const supplier = getSupplierById(id);
    if (!supplier) {
      return { success: false, message: 'Không tìm thấy' };
    }

    supplier.danhGia = Math.max(0, Math.min(5, rating));
    storage.save(STORAGE_KEYS.suppliers, suppliers);

    return { success: true, message: 'Đánh giá nhà cung cấp thành công' };
  } catch (error) {
    console.error('Rate supplier error:', error);
    return { success: false, message: 'Lỗi đánh giá' };
  }
}

/**
 * PURCHASE ORDERS
 */

export function getAllPurchaseOrders() {
  return [...purchaseOrders];
}

export function getPurchaseOrderById(id) {
  return purchaseOrders.find(p => p.id === id);
}

export function createPurchaseOrder(data) {
  try {
    if (!data.nhaCungCapId) {
      return { success: false, message: 'Nhà cung cấp không được để trống' };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Phải có ít nhất một mặt hàng' };
    }

    const totalAmount = data.items.reduce((sum, item) => {
      return sum + (item.soLuong * item.donGia);
    }, 0);

    const order = {
      id: idGen.generateOrderCode(purchaseOrders),
      nhaCungCapId: data.nhaCungCapId,
      ngayDonHang: data.ngayDonHang || new Date().toISOString().split('T')[0],
      ngayGiaoHang: data.ngayGiaoHang || '',
      items: data.items,
      totalAmount,
      trangThai: data.trangThai || 'tao-moi',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString()
    };

    purchaseOrders.push(order);
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tạo đơn hàng mua mới: ${order.id}`,
        'shopping_cart',
        'green',
        'mua-hang'
      );
    }

    return { success: true, order, message: 'Tạo đơn hàng mua thành công' };
  } catch (error) {
    console.error('Create purchase order error:', error);
    return { success: false, message: 'Lỗi tạo đơn hàng' };
  }
}

export function updatePurchaseOrder(id, data) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }

    Object.assign(order, data);

    // Recalculate total
    if (data.items) {
      order.totalAmount = data.items.reduce((sum, item) => {
        return sum + (item.soLuong * item.donGia);
      }, 0);
    }

    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật đơn hàng mua: ${order.id}`,
        'edit_note',
        'indigo',
        'mua-hang'
      );
    }

    return { success: true, order, message: 'Cập nhật đơn hàng thành công' };
  } catch (error) {
    console.error('Update purchase order error:', error);
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function approvePurchaseOrder(id) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {
      return { success: false, message: 'Không tìm thấy' };
    }

    order.trangThai = 'da-duyet';
    order.approvalDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã phê duyệt đơn hàng mua: ${order.id}`,
        'verified',
        'teal',
        'mua-hang'
      );
    }

    return { success: true, message: 'Phê duyệt đơn hàng thành công' };
  } catch (error) {
    console.error('Approve purchase order error:', error);
    return { success: false, message: 'Lỗi phê duyệt' };
  }
}

export function receivePurchaseOrder(id) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {
      return { success: false, message: 'Không tìm thấy' };
    }

    order.trangThai = 'da-nhan';
    order.receivedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xác nhận nhập kho đơn hàng: ${order.id}`,
        'inventory',
        'green',
        'mua-hang'
      );
    }

    return { success: true, message: 'Ghi nhận nhập kho thành công' };
  } catch (error) {
    console.error('Receive purchase order error:', error);
    return { success: false, message: 'Lỗi ghi nhận' };
  }
}

/**
 * QUOTATIONS
 */

export function getAllQuotations() {
  return [...quotations];
}

export function getQuotationById(id) {
  return quotations.find(q => q.id === id);
}

export function createQuotation(data) {
  try {
    const quotation = {
      id: idGen.generateQuotationCode(quotations),
      nhaCungCapId: data.nhaCungCapId,
      ngayBaoGia: data.ngayBaoGia || new Date().toISOString().split('T')[0],
      hanHieuLuc: data.hanHieuLuc || '',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      trangThai: data.trangThai || 'moi',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString()
    };

    quotations.push(quotation);
    storage.save(STORAGE_KEYS.quotations, quotations);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        'Đã nhận báo giá mới từ nhà cung cấp',
        'request_quote',
        'blue',
        'mua-hang'
      );
    }

    return { success: true, quotation, message: 'Tạo báo giá thành công' };
  } catch (error) {
    console.error('Create quotation error:', error);
    return { success: false, message: 'Lỗi tạo báo giá' };
  }
}

export function acceptQuotation(id) {
  try {
    const quotation = getQuotationById(id);
    if (!quotation) {
      return { success: false, message: 'Không tìm thấy' };
    }

    quotation.trangThai = 'da-chap-nhan';
    quotation.acceptedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.quotations, quotations);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã chấp nhận báo giá: ${quotation.id}`,
        'task_alt',
        'teal',
        'mua-hang'
      );
    }

    return { success: true, message: 'Chấp nhận báo giá thành công' };
  } catch (error) {
    console.error('Accept quotation error:', error);
    return { success: false, message: 'Lỗi chấp nhận' };
  }
}

/**
 * HELPER FUNCTIONS
 */

export function getSupplierOrders(supplierId) {
  return purchaseOrders.filter(o => o.nhaCungCapId === supplierId);
}

export function getTotalSpendBySupplier(supplierId) {
  const orders = getSupplierOrders(supplierId);
  return orders.reduce((sum, o) => sum + o.totalAmount, 0);
}

export function getOrderStatistics() {
  return {
    totalOrders: purchaseOrders.length,
    pendingOrders: purchaseOrders.filter(o => o.trangThai === 'tao-moi').length,
    approvedOrders: purchaseOrders.filter(o => o.trangThai === 'da-duyet').length,
    receivedOrders: purchaseOrders.filter(o => o.trangThai === 'da-nhan').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  };
}

export function searchSuppliers(query) {
  const q = query.toLowerCase();
  return suppliers.filter(s =>
    s.tenNhaCungCap.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.phone.includes(q)
  );
}
