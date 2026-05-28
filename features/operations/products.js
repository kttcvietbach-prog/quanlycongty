/**
 * Operations Module - Products & Production Planning
 * Products, production orders, BOM, routing
 */

import * as storage from '../../lib/storage-manager.js';
import * as idGen from '../../lib/id-generators.js';

const STORAGE_KEYS = storage.STORAGE_KEYS;

let products = [];
let production = [];
let boms = [];

export function init() {
  products = storage.load(STORAGE_KEYS.products, []);
  production = storage.load(STORAGE_KEYS.production, []);
  boms = storage.load(STORAGE_KEYS.boms, []);
  console.log(`✅ Operations Module: ${products.length} products, ${production.length} orders`);
}

/**
 * PRODUCTS
 */
export function getAllProducts() { return [...products]; }

export function getProductById(id) { return products.find(p => p.id === id); }

export function createProduct(data) {
  try {
    if (!data.tenSanPham?.trim()) {return { success: false, message: 'Tên sản phẩm không được để trống' };}

    const product = {
      id: idGen.generateRandomId('SP'),
      tenSanPham: data.tenSanPham,
      maSanPham: data.maSanPham || idGen.generateRandomId('CODE'),
      moTa: data.moTa || '',
      donVi: data.donVi || 'cái',
      giaCo: data.giaCo || 0,
      giaWholesale: data.giaWholesale || 0,
      giaLe: data.giaLe || 0,
      tonKho: 0,
      createdDate: new Date().toISOString()
    };

    products.push(product);
    storage.save(STORAGE_KEYS.products, products);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã thêm sản phẩm mới: ${product.tenSanPham}`,
        'inventory_2',
        'blue',
        'van-hanh'
      );
    }

    return { success: true, product, message: 'Tạo sản phẩm thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo sản phẩm' };
  }
}

export function updateProduct(id, data) {
  try {
    const prod = getProductById(id);
    if (!prod) {return { success: false };}

    Object.assign(prod, data);
    storage.save(STORAGE_KEYS.products, products);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã cập nhật sản phẩm: ${prod.tenSanPham}`,
        'edit',
        'indigo',
        'van-hanh'
      );
    }

    return { success: true, product: prod };
  } catch (error) {
    return { success: false };
  }
}

export function deleteProduct(id) {
  try {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {return { success: false };}

    const removed = products.splice(idx, 1)[0];
    storage.save(STORAGE_KEYS.products, products);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã xóa sản phẩm: ${removed.tenSanPham}`,
        'delete',
        'red',
        'van-hanh'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * PRODUCTION ORDERS
 */
export function getAllProductionOrders() { return [...production]; }

export function getProductionOrderById(id) { return production.find(p => p.id === id); }

export function createProductionOrder(data) {
  try {
    if (!data.sanPhamId) {return { success: false, message: 'Sản phẩm không được để trống' };}

    const order = {
      id: idGen.generateRandomId('MO'),
      sanPhamId: data.sanPhamId,
      soLuong: data.soLuong || 1,
      ngayBatDau: data.ngayBatDau || new Date().toISOString().split('T')[0],
      ngayKetThuc: data.ngayKetThuc || '',
      trangThai: 'tao-moi',
      createdDate: new Date().toISOString()
    };

    production.push(order);
    storage.save(STORAGE_KEYS.production, production);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Lệnh sản xuất mới: ${order.id}`,
        'precision_manufacturing',
        'green',
        'van-hanh'
      );
    }

    return { success: true, order, message: 'Tạo lệnh sản xuất thành công' };
  } catch (error) {
    return { success: false, message: 'Lỗi tạo lệnh' };
  }
}

export function startProduction(id) {
  try {
    const order = getProductionOrderById(id);
    if (!order) {return { success: false };}

    order.trangThai = 'dang-thuc-hien';
    order.startedDate = new Date().toISOString();
    storage.save(STORAGE_KEYS.production, production);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Lệnh sản xuất đã bắt đầu: ${order.id}`,
        'play_arrow',
        'blue',
        'van-hanh'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function completeProduction(id) {
  try {
    const order = getProductionOrderById(id);
    if (!order) {return { success: false };}

    order.trangThai = 'hoan-thanh';
    order.completedDate = new Date().toISOString();

    // Update stock
    const product = getProductById(order.sanPhamId);
    if (product) {
      product.tonKho = (product.tonKho || 0) + order.soLuong;
      storage.save(STORAGE_KEYS.products, products);
    }

    storage.save(STORAGE_KEYS.production, production);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Lệnh sản xuất đã hoàn tất: ${order.id}`,
        'check_circle',
        'teal',
        'van-hanh'
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * BOM (Bill of Materials)
 */
export function getAllBOMs() { return [...boms]; }

export function getBOMById(id) { return boms.find(b => b.id === id); }

export function createBOM(data) {
  try {
    const bom = {
      id: idGen.generateRandomId('BOM'),
      sanPhamId: data.sanPhamId,
      vatTuList: data.vatTuList || [],
      createdDate: new Date().toISOString()
    };

    boms.push(bom);
    storage.save(STORAGE_KEYS.boms, boms);

    // Gửi thông báo hệ thống
    if (window.erpApp && window.erpApp.addNotification) {
      window.erpApp.addNotification(
        `Đã tạo định mức (BOM): ${bom.id}`,
        'account_tree',
        'orange',
        'van-hanh'
      );
    }

    return { success: true, bom };
  } catch (error) {
    return { success: false };
  }
}

export function getProductStats() {
  return {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + (p.tonKho || 0), 0),
    productionOrders: production.length,
    completedOrders: production.filter(p => p.trangThai === 'hoan-thanh').length
  };
}
