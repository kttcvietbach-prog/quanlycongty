/**
 * Procurement Module - Purchase Orders
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let purchaseOrders = [];

export function init() {
  purchaseOrders = storage.load(STORAGE_KEYS.purchaseOrders, []);
  console.log(`✅ Procurement Purchase Orders Module: ${purchaseOrders.length} orders`);
}

/**
 * PURCHASE ORDERS
 */
export function getAllPurchaseOrders() { return [...purchaseOrders]; }

export function getPurchaseOrderById(id) { return purchaseOrders.find(p => p.id === id); }

export function createPurchaseOrder(data) {
  try {
    if (!data.nhaCungCapId) {return { success: false, message: 'Nhà cung cấp không được để trống' };}
    if (!data.items?.length) {return { success: false, message: 'Phải có ít nhất một sản phẩm' };}

    const totalAmount = data.items.reduce((sum, item) => sum + (item.soLuong * item.giaMua), 0);

    const order = {
      id: idGen.generateOrderCode(purchaseOrders),
      nhaCungCapId: data.nhaCungCapId,
      ngayDonHang: data.ngayDonHang || new Date().toISOString().split('T')[0],
      ngayDuKienNhan: data.ngayDuKienNhan || '',
      items: data.items,
      totalAmount,
      trangThai: 'tao-moi', // tạo-mới, đã-gửi, đã-duyệt, đang-giao, đã-nhận, hủy
      pyoDuKienTra: data.pyoDuKienTra || '',
      ghiChu: data.ghiChu || '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    purchaseOrders.push(order);
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã lập đơn đặt hàng mới: ${order.id}`,
        'add_shopping_cart',
        'green',
        'mua-hang'
      );
    }

    return { success: true, order, message: 'Tạo đơn đặt hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo đơn hàng' };
  }
}

export function updatePurchaseOrder(id, data) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}

    Object.assign(order, data, { updatedDate: new Date().toISOString() });
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật đơn đặt hàng: ${order.id}`,
        'edit_note',
        'indigo',
        'mua-hang'
      );
    }

    return { success: true, order, message: 'Cập nhật thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deletePurchaseOrder(id) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}
    if (order.trangThai !== 'tao-moi') {return { success: false, message: 'Chỉ được xóa đơn chưa gửi' };}

    const removed = purchaseOrders.splice(idx, 1)[0];
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã hủy xóa đơn đặt hàng: ${removed.id}`,
        'delete_sweep',
        'red',
        'mua-hang'
      );
    }

    return { success: true, message: 'Xóa thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function sendPurchaseOrder(id) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}
    if (order.trangThai !== 'tao-moi') {return { success: false, message: 'Đơn hàng đã được gửi' };}

    order.trangThai = 'da-gui';
    order.ngayGui = new Date().toISOString();
    order.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã gửi đơn đặt hàng: ${order.id}`,
        'send',
        'blue',
        'mua-hang'
      );
    }

    return { success: true, message: 'Gửi đơn hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi gửi' };
  }
}

export function approvePurchaseOrder(id) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}
    if (order.trangThai !== 'da-gui') {return { success: false, message: 'Chỉ phê duyệt đơn đã gửi' };}

    order.trangThai = 'da-duyet';
    order.ngayPheDuyet = new Date().toISOString();
    order.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã phê duyệt đơn đặt hàng: ${order.id}`,
        'verified',
        'teal',
        'mua-hang'
      );
    }

    return { success: true, message: 'Phê duyệt đơn hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi phê duyệt' };
  }
}

export function rejectPurchaseOrder(id, reason = '') {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}

    order.trangThai = 'huy';
    order.lyDoHuy = reason;
    order.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);
    return { success: true, message: 'Hủy đơn hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi hủy' };
  }
}

export function markAsShipping(id, ngayGiao) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}

    order.trangThai = 'dang-giao';
    order.ngayGiao = ngayGiao || new Date().toISOString().split('T')[0];
    order.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);
    return { success: true, message: 'Cập nhật sang giao hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function markAsReceived(id, ngayNhan) {
  try {
    const order = getPurchaseOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}

    order.trangThai = 'da-nhan';
    order.ngayNhan = ngayNhan || new Date().toISOString();
    order.updatedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.purchaseOrders, purchaseOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xác nhận nhập kho cho đơn hàng: ${order.id}`,
        'inventory',
        'green',
        'mua-hang'
      );
    }

    return { success: true, message: 'Nhận hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi nhận hàng' };
  }
}

export function getPurchaseOrdersBySupplier(nhaCungCapId) {
  return purchaseOrders.filter(o => o.nhaCungCapId === nhaCungCapId);
}

export function getPendingPurchaseOrders() {
  return purchaseOrders.filter(o =>
    ['tao-moi', 'da-gui', 'da-duyet', 'dang-giao'].includes(o.trangThai)
  );
}

export function getReceivedPurchaseOrders(fromDate, toDate) {
  return purchaseOrders.filter(o => {
    if (o.trangThai !== 'da-nhan') {return false;}
    if (fromDate && o.ngayNhan < fromDate) {return false;}
    if (toDate && o.ngayNhan > toDate) {return false;}
    return true;
  });
}

export function getPurchaseOrderStats() {
  return {
    totalOrders: purchaseOrders.length,
    createdOrders: purchaseOrders.filter(o => o.trangThai === 'tao-moi').length,
    sentOrders: purchaseOrders.filter(o => o.trangThai === 'da-gui').length,
    approvedOrders: purchaseOrders.filter(o => o.trangThai === 'da-duyet').length,
    shippingOrders: purchaseOrders.filter(o => o.trangThai === 'dang-giao').length,
    receivedOrders: purchaseOrders.filter(o => o.trangThai === 'da-nhan').length,
    cancelledOrders: purchaseOrders.filter(o => o.trangThai === 'huy').length,
    totalSpent: purchaseOrders.filter(o => o.trangThai === 'da-nhan')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  };
}

export function getPurchaseOrderTimeline(id) {
  const order = getPurchaseOrderById(id);
  if (!order) {return null;}

  return {
    created: order.createdDate,
    sent: order.ngayGui,
    approved: order.ngayPheDuyet,
    shipping: order.ngayGiao,
    received: order.ngayNhan
  };
}
