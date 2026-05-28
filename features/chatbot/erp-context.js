/**
 * ERP Chatbot Context Manager
 * Provides intelligent context from ERP data for better chatbot responses
 */

class ERPContextManager {
  constructor() {
    this.cachedContext = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.lastCacheTime = 0;
  }

  /**
   * Get comprehensive ERP context
   */
  async getContext(filter = '') {
    const now = Date.now();

    // Return cached context if valid
    if (this.cachedContext && now - this.lastCacheTime < this.cacheTimeout) {
      return this.cachedContext;
    }

    const context = {
      user: this.getCurrentUser(),
      systemStatus: this.getSystemStatus(),
      summary: await this.getDataSummary(),
      recentActivities: this.getRecentActivities(),
      alerts: this.getAlerts(),
      timestamp: new Date().toISOString()
    };

    // Cache it
    this.cachedContext = context;
    this.lastCacheTime = now;

    return context;
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    const user = window.currentUser || {};
    return {
      id: user.id || 'unknown',
      name: user.name || 'User',
      email: user.email || '',
      role: user.role || 'User',
      department: user.department || 'General'
    };
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      version: '6.1',
      status: 'online',
      modules: this.getActiveModules(),
      lastSync: new Date().toISOString()
    };
  }

  /**
   * Get active modules
   */
  getActiveModules() {
    const modules = [];

    // Check which modules have data/are active
    if (window.employeeData) {modules.push('Nhân sự');}
    if (window.projectData) {modules.push('Dự án');}
    if (window.salesData) {modules.push('Bán hàng');}
    if (window.purchaseData) {modules.push('Mua hàng');}
    if (window.inventoryData) {modules.push('Kho hàng');}
    if (window.financialData) {modules.push('Tài chính');}
    if (window.productionData) {modules.push('Sản xuất');}

    return modules;
  }

  /**
   * Get data summary
   */
  async getDataSummary() {
    const summary = {};

    // Employee stats
    if (window.employeeData && typeof window.employeeData === 'object') {
      const count = Array.isArray(window.employeeData) 
        ? window.employeeData.length 
        : Object.keys(window.employeeData).length;
      summary.employees = {
        count,
        status: 'Active'
      };
    }

    // Project stats
    if (window.projectData) {
      const projects = Array.isArray(window.projectData) 
        ? window.projectData 
        : Object.values(window.projectData);
      summary.projects = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length
      };
    }

    // Sales stats
    if (window.salesData) {
      const orders = Array.isArray(window.salesData)
        ? window.salesData
        : Object.values(window.salesData);
      summary.sales = {
        orders: orders.length,
        totalValue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length
      };
    }

    // Inventory stats
    if (window.inventoryData) {
      const items = Array.isArray(window.inventoryData)
        ? window.inventoryData
        : Object.values(window.inventoryData);
      summary.inventory = {
        totalItems: items.length,
        lowStock: items.filter(i => i.quantity < i.minQuantity).length,
        totalValue: items.reduce((sum, i) => sum + (i.value || 0), 0)
      };
    }

    // Financial stats
    if (window.financialData) {
      summary.financial = {
        revenue: window.financialData.revenue || 0,
        expenses: window.financialData.expenses || 0,
        balance: (window.financialData.revenue || 0) - (window.financialData.expenses || 0)
      };
    }

    return summary;
  }

  /**
   * Get recent activities
   */
  getRecentActivities() {
    const activities = [];

    // Check activity log if available
    if (window.activityLog && Array.isArray(window.activityLog)) {
      activities.push(
        ...window.activityLog
          .slice(-5)
          .map(a => ({
            action: a.action,
            module: a.module,
            time: a.timestamp
          }))
      );
    }

    return activities;
  }

  /**
   * Get system alerts
   */
  getAlerts() {
    const alerts = [];

    // Check for low inventory
    if (window.inventoryData) {
      const items = Array.isArray(window.inventoryData)
        ? window.inventoryData
        : Object.values(window.inventoryData);
      
      const lowStockItems = items.filter(i => i.quantity < i.minQuantity);
      if (lowStockItems.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockItems.length} sản phẩm tồn kho thấp`,
          severity: 'medium'
        });
      }
    }

    // Check for overdue tasks
    if (window.taskData) {
      const tasks = Array.isArray(window.taskData)
        ? window.taskData
        : Object.values(window.taskData);
      
      const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
      if (overdue.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${overdue.length} công việc quá hạn`,
          severity: 'high'
        });
      }
    }

    // Check for pending approvals
    if (window.approvalData) {
      const pending = Array.isArray(window.approvalData)
        ? window.approvalData.filter(a => a.status === 'pending').length
        : Object.values(window.approvalData).filter(a => a.status === 'pending').length;
      
      if (pending > 0) {
        alerts.push({
          type: 'info',
          message: `${pending} phê duyệt đang chờ`,
          severity: 'medium'
        });
      }
    }

    return alerts;
  }

  /**
   * Get context for specific module
   */
  getModuleContext(module) {
    const contextMap = {
      'Nhân sự': () => this.getHRContext(),
      'Dự án': () => this.getProjectContext(),
      'Bán hàng': () => this.getSalesContext(),
      'Mua hàng': () => this.getPurchaseContext(),
      'Kho hàng': () => this.getInventoryContext(),
      'Tài chính': () => this.getFinancialContext(),
      'Sản xuất': () => this.getProductionContext()
    };

    const contextFn = contextMap[module];
    return contextFn ? contextFn() : null;
  }

  /**
   * HR Context
   */
  getHRContext() {
    const data = window.employeeData || [];
    const employees = Array.isArray(data) ? data : Object.values(data);

    return {
      module: 'Nhân sự',
      totalEmployees: employees.length,
      byDepartment: this.groupBy(employees, 'department'),
      byStatus: this.groupBy(employees, 'status'),
      birthdays: this.getUpcomingBirthdays(employees),
      contracts: this.getContractInfo(employees)
    };
  }

  /**
   * Project Context
   */
  getProjectContext() {
    const data = window.projectData || [];
    const projects = Array.isArray(data) ? data : Object.values(data);

    return {
      module: 'Dự án',
      totalProjects: projects.length,
      byStatus: this.groupBy(projects, 'status'),
      activeProjects: projects.filter(p => p.status === 'active'),
      upcomingDeadlines: projects
        .filter(p => p.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
    };
  }

  /**
   * Sales Context
   */
  getSalesContext() {
    const data = window.salesData || [];
    const orders = Array.isArray(data) ? data : Object.values(data);

    return {
      module: 'Bán hàng',
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      byStatus: this.groupBy(orders, 'status'),
      topCustomers: this.getTopItems(orders, 'customer', 5),
      recentOrders: orders.slice(-10)
    };
  }

  /**
   * Inventory Context
   */
  getInventoryContext() {
    const data = window.inventoryData || [];
    const items = Array.isArray(data) ? data : Object.values(data);

    const lowStock = items.filter(i => i.quantity < (i.minQuantity || 0));

    return {
      module: 'Kho hàng',
      totalItems: items.length,
      totalValue: items.reduce((sum, i) => sum + (i.value || 0), 0),
      lowStockItems: lowStock,
      critical: lowStock.filter(i => i.quantity === 0),
      topProducts: this.getTopItems(items, 'name', 10)
    };
  }

  /**
   * Financial Context
   */
  getFinancialContext() {
    const financial = window.financialData || {};

    return {
      module: 'Tài chính',
      revenue: financial.revenue || 0,
      expenses: financial.expenses || 0,
      balance: (financial.revenue || 0) - (financial.expenses || 0),
      accounts: financial.accounts || {},
      recentTransactions: financial.transactions?.slice(-10) || []
    };
  }

  /**
   * Production Context
   */
  getProductionContext() {
    const data = window.productionData || [];
    const orders = Array.isArray(data) ? data : Object.values(data);

    return {
      module: 'Sản xuất',
      totalOrders: orders.length,
      byStatus: this.groupBy(orders, 'status'),
      inProgress: orders.filter(o => o.status === 'in_progress'),
      completed: orders.filter(o => o.status === 'completed')
    };
  }

  /**
   * Group array by property
   */
  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = item[key] || 'Other';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Get top items by count
   */
  getTopItems(arr, key, count = 5) {
    return Object.entries(
      arr.reduce((acc, item) => {
        const value = item[key];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Get upcoming birthdays
   */
  getUpcomingBirthdays(employees) {
    const upcoming = [];
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    employees.forEach(emp => {
      if (emp.birthDate) {
        const birth = new Date(emp.birthDate);
        const thisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        
        if (thisYear >= today && thisYear <= nextMonth) {
          upcoming.push({
            name: emp.name,
            date: thisYear.toLocaleDateString('vi-VN')
          });
        }
      }
    });

    return upcoming;
  }

  /**
   * Get contract info
   */
  getContractInfo(employees) {
    const expiringContracts = employees
      .filter(e => e.contractEndDate)
      .filter(e => new Date(e.contractEndDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
      .map(e => ({
        employee: e.name,
        endDate: e.contractEndDate
      }));

    return {
      total: employees.filter(e => e.contractStartDate).length,
      expiringSoon: expiringContracts
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cachedContext = null;
    this.lastCacheTime = 0;
  }
}

// Create singleton instance
const erpContextManager = new ERPContextManager();

/**
 * Global function to get ERP context for chatbot
 */
window.getERPContext = function(module = '') {
  return formatContextForChatbot(erpContextManager.getContext(module));
};

/**
 * Format context for chatbot
 */
function formatContextForChatbot(context) {
  if (!context) {return '';}

  let contextStr = '**Thông tin hệ thống:**\n';

  // Add user info
  if (context.user) {
    contextStr += `- Người dùng: ${context.user.name} (${context.user.role})\n`;
    contextStr += `- Bộ phận: ${context.user.department}\n`;
  }

  // Add summary
  if (context.summary) {
    contextStr += '\n**Tóm tắt dữ liệu:**\n';
    
    if (context.summary.employees) {
      contextStr += `- Nhân viên: ${context.summary.employees.count} người\n`;
    }
    
    if (context.summary.projects) {
      contextStr += `- Dự án: ${context.summary.projects.total} (${context.summary.projects.active} đang làm)\n`;
    }
    
    if (context.summary.sales) {
      contextStr += `- Đơn hàng: ${context.summary.sales.orders}, Tổng giá trị: ${formatCurrency(context.summary.sales.totalValue)}\n`;
    }
    
    if (context.summary.inventory) {
      contextStr += `- Tồn kho: ${context.summary.inventory.totalItems} sản phẩm, Giá trị: ${formatCurrency(context.summary.inventory.totalValue)}\n`;
      if (context.summary.inventory.lowStock > 0) {
        contextStr += `  ⚠️ ${context.summary.inventory.lowStock} sản phẩm tồn kho thấp\n`;
      }
    }
    
    if (context.summary.financial) {
      contextStr += `- Doanh thu: ${formatCurrency(context.summary.financial.revenue)}, Chi phí: ${formatCurrency(context.summary.financial.expenses)}\n`;
    }
  }

  // Add alerts
  if (context.alerts && context.alerts.length > 0) {
    contextStr += '\n**Cảnh báo:**\n';
    context.alerts.forEach(alert => {
      contextStr += `- ${alert.message} (${alert.severity})\n`;
    });
  }

  return contextStr;
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
}

export { ERPContextManager, erpContextManager, formatContextForChatbot };
