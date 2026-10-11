import React, { useState, useEffect } from 'react';

/**
 * Utility functions for Role-Based Access Control (RBAC) and permissions in Global ERP
 */

export const getUserRole = () => {
  return localStorage.getItem('userRole') || '';
};

export const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem('permissions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getStoredModulePermissions = () => {
  try {
    const raw = localStorage.getItem('modulePermissions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Route-to-permission mapping
 */
export const ROUTE_PERMISSION_MAP = [
  // Employees & HRMS
  { prefix: '/employees/profile', permission: ['create_employees', 'manage_employees'] },
  { prefix: '/employees', permission: ['view_employees', 'manage_employees'] },
  { prefix: '/department', permission: ['view_hrms', 'manage_hrms'] },
  { prefix: '/hrms/attendance/holidays', permission: ['view_holidays', 'view_hrms', 'view_leave'] },
  { prefix: '/hrms/attendance', permission: ['view_hrms', 'view_leave'] },
  { prefix: '/hrms/payroll', permission: ['view_payroll', 'view_payslips'] },
  { prefix: '/hrms/expenses', permission: ['view_expenses', 'view_payroll'] },
  { prefix: '/hrms/performance', permission: ['view_appraisals', 'view_hrms'] },
  { prefix: '/hrms/setup', permission: ['view_shift_timings', 'view_shift_setups', 'manage_hrms'] },
  { prefix: '/hrms', permission: ['view_hrms', 'view_employees'] },

  // Setup / User Master
  { prefix: '/setup/user-master', permission: ['view_roles', 'view_users', 'manage_roles'] },
  { prefix: '/setup', permission: ['manage_settings', 'view_roles', 'view_users'] },

  // Customers & Suppliers
  { prefix: '/customers', permission: ['view_contacts', 'manage_contacts', 'view_sales'] },
  { prefix: '/suppliers', permission: ['view_suppliers', 'manage_purchases', 'view_purchases'] },
  { prefix: '/warehouse', permission: ['view_warehouses', 'view_products', 'manage_stock'] },

  // Sales
  { prefix: '/sales/add-sale', permission: ['create_sales', 'manage_sales'] },
  { prefix: '/sales', permission: ['view_sales', 'manage_sales'] },

  // Purchases
  { prefix: '/purchases/add-purchase', permission: ['create_purchases', 'manage_purchases'] },
  { prefix: '/purchases', permission: ['view_purchases', 'manage_purchases'] },

  // Products / Inventory
  { prefix: '/products', permission: ['view_products', 'view_stock', 'manage_products'] },
  { prefix: '/price-list', permission: ['view_price_lists'] },
  { prefix: '/tax', permission: ['view_tax_slabs', 'view_accounts'] },
  { prefix: '/company', permission: ['view_company'] },
  { prefix: '/branch', permission: ['view_branches'] },

  // Financial Entries
  { prefix: '/receipt/new', permission: ['create_vouchers', 'create_sales', 'create_receipts'] },
  { prefix: '/receipt', permission: ['view_vouchers', 'view_accounts', 'view_sales', 'view_receipts'] },
  { prefix: '/bank-receipt/new', permission: ['create_bank_receipts', 'create_vouchers', 'create_accounts'] },
  { prefix: '/bank-receipt', permission: ['view_bank_receipts', 'view_accounts', 'view_vouchers'] },
  { prefix: '/payment/new', permission: ['create_payments', 'create_purchases', 'create_vouchers'] },
  { prefix: '/payment', permission: ['view_payments', 'view_accounts', 'view_purchases', 'view_vouchers'] },
  { prefix: '/bank-payment/new', permission: ['create_bank_payments', 'create_vouchers', 'create_accounts'] },
  { prefix: '/bank-payment', permission: ['view_bank_payments', 'view_accounts', 'view_vouchers'] },
  { prefix: '/contra/new', permission: ['create_contra_entries', 'create_accounts'] },
  { prefix: '/contra', permission: ['view_contra_entries', 'view_accounts'] },
  { prefix: '/stock-entry/new', permission: ['create_stock_adjustments', 'manage_stock', 'create_inventory'] },
  { prefix: '/stock-entry', permission: ['view_stock', 'manage_stock', 'view_inventory'] },
  { prefix: '/stock-transfer/new', permission: ['create_transfers', 'manage_stock', 'create_inventory'] },
  { prefix: '/stock-transfer', permission: ['view_stock', 'manage_stock', 'view_inventory'] },
  { prefix: '/debit-note/new', permission: ['create_debit_notes', 'create_purchases'] },
  { prefix: '/debit-note', permission: ['view_debit_notes', 'view_purchases'] },
  { prefix: '/credit-note/new', permission: ['create_credit_notes', 'create_sales'] },
  { prefix: '/credit-note', permission: ['view_credit_notes', 'view_sales'] },
  { prefix: '/day-book', permission: ['view_vouchers', 'view_accounts'] },

  // Reports
  { prefix: '/reports', permission: ['view_reports', 'view_sales', 'view_accounts', 'view_purchases'] },
];

/**
 * Check if the currently logged in user has a specific permission
 * @param {string|string[]} permission - Single permission key or array of keys
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const role = getUserRole();

  // SuperAdmin and Admin have full unrestricted access to everything
  if (role === 'SuperAdmin' || role === 'Admin') {
    return true;
  }

  if (!permission) return true;

  const permissions = getStoredPermissions();
  const modulePermissions = getStoredModulePermissions();

  const checkSingle = (permKey) => {
    if (!permKey) return true;

    // Direct match in granular permissions array
    if (permissions.includes(permKey)) return true;

    // Check module-level fallback
    const parts = permKey.split('_');
    const action = parts[0]; // view, create, edit, delete
    const resource = parts.slice(1).join('_');

    // Check if modulePermissions contains an active grant
    const modPerm = modulePermissions.find(m => {
      const mName = (m.module || '').toLowerCase();
      return (
        mName === resource.toLowerCase() ||
        (resource.includes('employee') && (mName === 'employee' || mName === 'hrms')) ||
        (resource.includes('sale') && mName === 'sales') ||
        (resource.includes('purchase') && mName === 'purchase') ||
        (resource.includes('contact') && (mName === 'sales' || mName === 'crm')) ||
        (resource.includes('product') && (mName === 'inventory' || mName === 'items')) ||
        (resource.includes('shift') && (mName === 'attendance' || mName === 'hrms')) ||
        (resource.includes('appraisal') && (mName === 'attendance' || mName === 'hrms')) ||
        (resource.includes('account') && (mName === 'settings' || mName === 'finance' || mName === 'accounts'))
      );
    });

    if (modPerm && modPerm[action]) {
      return true;
    }

    return false;
  };

  if (Array.isArray(permission)) {
    return permission.some(p => checkSingle(p));
  }

  return checkSingle(permission);
};

/**
 * Check if the user is allowed to access a given URL route
 */
export const canAccessRoute = (path) => {
  const role = getUserRole();
  if (role === 'SuperAdmin' || role === 'Admin') return true;
  if (!path || path === '/' || path === '/coming-soon') return true;

  const match = ROUTE_PERMISSION_MAP.find(m => path.startsWith(m.prefix));
  if (match) {
    return hasPermission(match.permission);
  }
  return true;
};

/**
 * React Hook for dynamic permissions with real-time reactive updates
 */
export const usePermissions = () => {
  const [role, setRole] = useState(getUserRole());
  const [permissions, setPermissions] = useState(getStoredPermissions());
  const [modulePermissions, setModulePermissions] = useState(getStoredModulePermissions());

  useEffect(() => {
    const sync = () => {
      setRole(getUserRole());
      setPermissions(getStoredPermissions());
      setModulePermissions(getStoredModulePermissions());
    };

    window.addEventListener('authChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('authChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const can = (permission) => {
    if (role === 'SuperAdmin' || role === 'Admin') return true;
    if (!permission) return true;
    return hasPermission(permission);
  };

  const canRoute = (path) => {
    return canAccessRoute(path);
  };

  return {
    role,
    permissions,
    modulePermissions,
    isSuperAdmin: role === 'SuperAdmin',
    isAdmin: role === 'Admin',
    can,
    canRoute,
    hasPermission: can
  };
};

/**
 * Declarative component for permission-gated elements
 * Usage: <Can do="create_employees"><button>Add Employee</button></Can>
 */
export const Can = ({ do: permission, children, fallback = null }) => {
  const { can } = usePermissions();
  if (can(permission)) {
    return <>{children}</>;
  }
  return fallback;
};

export default {
  hasPermission,
  canAccessRoute,
  usePermissions,
  Can,
  getUserRole
};
