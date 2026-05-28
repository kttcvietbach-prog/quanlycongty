/**
 * Sales Module - Customers & Sales Orders
 * Customer management, sales orders, pricing
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';
import * as formatters from '../../lib/formatters.js';
import * as validators from '../../lib/validators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let customers = [];
let salesOrders = [];

export function init() {
  customers = storage.load(STORAGE_KEYS.customers, []);
  salesOrders = storage.load(STORAGE_KEYS.salesOrders, []);
  console.log(`✅ Sales Module: ${customers.length} customers, ${salesOrders.length} orders`);
}

/**
 * CUSTOMERS
 */
export function getAllCustomers() { return [...customers]; }

export function getCustomerById(id) { return customers.find(c => c.id === id); }

export function createCustomer(data) {
  try {
    if (!data.tenKhachHang?.trim()) {return { success: false, message: 'Tên không được để trống' };}

    const customer = {
      id: idGen.generateRandomId('KH'),
      tenKhachHang: data.tenKhachHang,
      email: data.email || '',
      phone: data.phone || '',
      diaChi: data.diaChi || '',
      maSoThue: data.maSoThue || '',
      loaiKhach: data.loaiKhach || 'le',
      danhGia: 5,
      tongMua: 0,
      trangThai: 'hoat-dong',
      createdDate: new Date().toISOString()
    };

    customers.push(customer);
    storage.save(STORAGE_KEYS.customers, customers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã thêm khách hàng mới: ${customer.tenKhachHang}`,
        'person_add',
        'blue',
        'ban-hang'
      );
    }

    return { success: true, customer, message: 'Tạo khách hàng thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo khách hàng' };
  }
}

export function updateCustomer(id, data) {
  try {
    const cust = getCustomerById(id);
    if (!cust) {return { success: false, message: 'Không tìm thấy' };}

    Object.assign(cust, data);
    storage.save(STORAGE_KEYS.customers, customers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật thông tin KH: ${cust.tenKhachHang}`,
        'edit',
        'indigo',
        'ban-hang'
      );
    }

    return { success: true, customer: cust, message: 'Cập nhật thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi cập nhật' };
  }
}

export function deleteCustomer(id) {
  try {
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) {return { success: false, message: 'Không tìm thấy' };}

    const removed = customers.splice(idx, 1)[0];
    storage.save(STORAGE_KEYS.customers, customers);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xóa khách hàng: ${removed.tenKhachHang}`,
        'person_remove',
        'red',
        'ban-hang'
      );
    }

    return { success: true, message: 'Xóa thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi xóa' };
  }
}

export function searchCustomers(query) {
  const q = query.toLowerCase();
  return customers.filter(c =>
    c.tenKhachHang.toLowerCase().includes(q) || c.email.includes(q) || c.phone.includes(q)
  );
}

/**
 * SALES ORDERS
 */
export function getAllSalesOrders() { return [...salesOrders]; }

export function getSalesOrderById(id) { return salesOrders.find(s => s.id === id); }

export function createSalesOrder(data) {
  try {
    if (!data.khachHangId) {return { success: false, message: 'Khách hàng không được để trống' };}
    if (!data.items?.length) {return { success: false, message: 'Phải có ít nhất một sản phẩm' };}

    const totalAmount = data.items.reduce((sum, item) => sum + (item.soLuong * item.donGia), 0);

    const order = {
      id: idGen.generateOrderCode(salesOrders),
      khachHangId: data.khachHangId,
      ngayDonHang: data.ngayDonHang || new Date().toISOString().split('T')[0],
      ngayGiao: data.ngayGiao || '',
      items: data.items,
      totalAmount,
      trangThai: 'tao-moi',
      createdDate: new Date().toISOString()
    };

    salesOrders.push(order);
    storage.save(STORAGE_KEYS.salesOrders, salesOrders);

    // Update customer total spent
    const cust = getCustomerById(data.khachHangId);
    if (cust) {
      cust.tongMua = (cust.tongMua || 0) + totalAmount;
      storage.save(STORAGE_KEYS.customers, customers);
    }

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tạo đơn hàng bán mới: ${order.id}`,
        'shopping_cart',
        'green',
        'ban-hang'
      );
    }

    return { success: true, order, message: 'Tạo đơn hàng bán thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo đơn hàng' };
  }
}

export function approveSalesOrder(id) {
  try {
    const order = getSalesOrderById(id);
    if (!order) {return { success: false, message: 'Không tìm thấy' };}

    order.trangThai = 'da-duyet';
    storage.save(STORAGE_KEYS.salesOrders, salesOrders);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã phê duyệt đơn hàng: ${order.id}`,
        'check_circle',
        'teal',
        'ban-hang'
      );
    }

    return { success: true, message: 'Phê duyệt thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi phê duyệt' };
  }
}

export function getCustomerOrders(customerId) {
  return salesOrders.filter(o => o.khachHangId === customerId);
}

export function getSalesStats() {
  return {
    totalCustomers: customers.length,
    totalOrders: salesOrders.length,
    totalRevenue: salesOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    pendingOrders: salesOrders.filter(o => o.trangThai === 'tao-moi').length
  };
}
