import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import Swal from 'sweetalert2';
import { 
  ShieldCheck, Plus, Edit2, Trash2, Search, Check, X, Shield, 
  CheckSquare, ChevronDown, ChevronUp, Layers, Filter, CheckCircle2
} from 'lucide-react';
import { usePermissions } from '../../utils/permissionUtils';

// Granular Permission Matrix Definitions matching Backend permissions.js
export const PERMISSION_GROUPS = [
  {
    groupId: 'sales',
    module: 'Sales',
    name: 'Sales & Customer Management',
    description: 'Invoices, Quotations, Orders, Credit Notes and Contacts',
    color: 'emerald',
    resources: [
      {
        id: 'sales',
        name: 'Sales & Invoices',
        description: 'Quotations, Sales Invoices, Orders & Deliveries',
        actions: {
          view: 'view_sales',
          create: 'create_sales',
          edit: 'edit_sales',
          delete: 'delete_sales'
        }
      },
      {
        id: 'credit_notes',
        name: 'Credit Notes',
        description: 'Sales returns & credit adjustments against invoices',
        actions: {
          view: 'view_credit_notes',
          create: 'create_credit_notes',
          edit: 'edit_credit_notes',
          delete: 'delete_credit_notes'
        }
      },
      {
        id: 'contacts',
        name: 'Customers & Contacts',
        description: 'Customer profiles, contact directory & ledgers',
        actions: {
          view: 'view_contacts',
          create: 'create_contacts',
          edit: 'edit_contacts',
          delete: 'delete_contacts'
        }
      }
    ]
  },
  {
    groupId: 'purchase',
    module: 'Purchase',
    name: 'Purchase & Vendor Management',
    description: 'Purchase Orders, Bills, Debit Notes, Returns and Suppliers',
    color: 'blue',
    resources: [
      {
        id: 'purchases',
        name: 'Purchases & Bills',
        description: 'Purchase orders, incoming vendor bills and GRNs',
        actions: {
          view: 'view_purchases',
          create: 'create_purchases',
          edit: 'edit_purchases',
          delete: 'delete_purchases'
        }
      },
      {
        id: 'debit_notes',
        name: 'Debit Notes',
        description: 'Purchase return notes & debit balance claims',
        actions: {
          view: 'view_debit_notes',
          create: 'create_debit_notes',
          edit: 'edit_debit_notes',
          delete: 'delete_debit_notes'
        }
      },
      {
        id: 'purchase_returns',
        name: 'Purchase Returns',
        description: 'Goods returned back to suppliers',
        actions: {
          view: 'view_purchases',
          create: 'create_purchase_returns',
          edit: 'edit_purchases',
          delete: 'delete_purchases'
        }
      },
      {
        id: 'suppliers',
        name: 'Suppliers & Vendors',
        description: 'Supplier directory, credit terms & bank details',
        actions: {
          view: 'view_suppliers',
          create: 'create_suppliers',
          edit: 'edit_suppliers',
          delete: 'delete_suppliers'
        }
      }
    ]
  },
  {
    groupId: 'inventory',
    module: 'Inventory',
    name: 'Inventory, Stock & Catalogs',
    description: 'Products, Warehouses, Tax Slabs, Units, Price Lists & Stock Adjustments',
    color: 'amber',
    resources: [
      {
        id: 'products',
        name: 'Products & Catalog',
        description: 'Item master, variants, categories and barcodes',
        actions: {
          view: 'view_products',
          create: 'create_products',
          edit: 'edit_products',
          delete: 'delete_products'
        }
      },
      {
        id: 'stock',
        name: 'Warehouse & Stock',
        description: 'Stock on hand, warehouse transfers & locations',
        actions: {
          view: 'view_stock',
          create: 'create_stock',
          edit: 'edit_stock',
          delete: 'delete_stock'
        }
      },
      {
        id: 'tax_slabs',
        name: 'Tax Slabs (GST / VAT)',
        description: 'Tax percentages, CGST/SGST/IGST slabs & HSN codes',
        actions: {
          view: 'view_tax_slabs',
          create: 'create_tax_slabs',
          edit: 'edit_tax_slabs',
          delete: 'delete_tax_slabs'
        }
      },
      {
        id: 'units',
        name: 'Units of Measurement (UOM)',
        description: 'Units like PCS, BOX, KGS, MTR, etc.',
        actions: {
          view: 'view_units',
          create: 'create_units',
          edit: 'edit_units',
          delete: 'delete_units'
        }
      },
      {
        id: 'price_lists',
        name: 'Price Lists',
        description: 'Wholesale, retail, and custom tier pricing tables',
        actions: {
          view: 'view_price_lists',
          create: 'create_price_lists',
          edit: 'edit_price_lists',
          delete: 'delete_price_lists'
        }
      },
      {
        id: 'price_rules',
        name: 'Price Rules & Discounts',
        description: 'Volume discount matrices and scheduled promos',
        actions: {
          view: 'view_price_rules',
          create: 'create_price_rules',
          edit: 'edit_price_rules',
          delete: 'delete_price_rules'
        }
      },
      {
        id: 'adjustments',
        name: 'Stock Adjustments',
        description: 'Physical audit shrinkage / damaged stock corrections',
        actions: {
          view: 'view_adjustments',
          create: 'create_adjustments',
          edit: 'edit_stock',
          delete: 'delete_stock'
        }
      },
      {
        id: 'catalog_stock',
        name: 'Catalog Warehouses & Billers',
        description: 'Catalog warehouse locations, billers & distribution points',
        actions: {
          view: 'view_catalog_stock',
          create: 'create_catalog_stock',
          edit: 'edit_catalog_stock',
          delete: 'delete_catalog_stock'
        }
      }
    ]
  },
  {
    groupId: 'attendance',
    module: 'Attendance',
    name: 'HRMS, Attendance & Performance',
    description: 'Biometric Attendance, Shifts, Targets, Appraisals and Ratings',
    color: 'violet',
    resources: [
      {
        id: 'hrms',
        name: 'Daily Attendance',
        description: 'Employee punch in/out, biometric sync & logs',
        actions: {
          view: 'view_hrms',
          create: 'create_hrms',
          edit: 'edit_hrms',
          delete: 'delete_hrms'
        }
      },
      {
        id: 'shift_timings',
        name: 'Shift Timings',
        description: 'Working hours, grace periods & overtime rules',
        actions: {
          view: 'view_shift_timings',
          create: 'create_shift_timings',
          edit: 'edit_shift_timings',
          delete: 'delete_shift_timings'
        }
      },
      {
        id: 'shift_setups',
        name: 'Shift Setups & Rosters',
        description: 'Shift assignment to departments & employees',
        actions: {
          view: 'view_shift_setups',
          create: 'create_shift_setups',
          edit: 'edit_shift_setups',
          delete: 'delete_shift_setups'
        }
      },
      {
        id: 'appraisals',
        name: 'Appraisals & Reviews',
        description: 'Employee performance reviews & self-appraisals',
        actions: {
          view: 'view_appraisals',
          create: 'create_appraisals',
          edit: 'edit_appraisals',
          delete: 'delete_appraisals'
        }
      },
      {
        id: 'employee_targets',
        name: 'Employee Targets & KPIs',
        description: 'Target setting, milestones and periodic progress',
        actions: {
          view: 'view_employee_targets',
          create: 'create_employee_targets',
          edit: 'edit_employee_targets',
          delete: 'delete_employee_targets'
        }
      },
      {
        id: 'performance_ratings',
        name: 'Performance Ratings',
        description: 'Competency scoring and performance benchmarks',
        actions: {
          view: 'view_performance_ratings',
          create: 'create_performance_ratings',
          edit: 'edit_performance_ratings',
          delete: 'delete_performance_ratings'
        }
      }
    ]
  },
  {
    groupId: 'leave',
    module: 'Leave',
    name: 'Leaves & Holidays',
    description: 'Leave requests, balance approvals and holiday calendars',
    color: 'teal',
    resources: [
      {
        id: 'leave',
        name: 'Leave Applications',
        description: 'Casual/Medical leave requests and approvals',
        actions: {
          view: 'view_leave',
          create: 'create_leave',
          edit: 'edit_leave',
          delete: 'delete_leave'
        }
      },
      {
        id: 'holidays',
        name: 'Holiday Calendar',
        description: 'Gazetted, corporate & regional holiday calendar',
        actions: {
          view: 'view_holidays',
          create: 'create_holidays',
          edit: 'edit_holidays',
          delete: 'delete_holidays'
        }
      }
    ]
  },
  {
    groupId: 'payroll',
    module: 'Payroll',
    name: 'Payroll, Salary & Expenses',
    description: 'Salary structures, monthly payslips, expense claims & statutory reports',
    color: 'rose',
    resources: [
      {
        id: 'salary_structures',
        name: 'Salary Structures',
        description: 'CTC breakdowns, allowances, basic and deductions',
        actions: {
          view: 'view_salary_structures',
          create: 'create_salary_structures',
          edit: 'edit_salary_structures',
          delete: 'delete_salary_structures'
        }
      },
      {
        id: 'payslips',
        name: 'Monthly Payslips',
        description: 'Monthly payroll run and employee salary disbursement',
        actions: {
          view: 'view_payslips',
          create: 'create_payslips',
          edit: 'edit_payroll',
          delete: 'delete_payslips'
        }
      },
      {
        id: 'expenses',
        name: 'Expense Claims',
        description: 'Staff reimbursement, travel and petty expenses',
        actions: {
          view: 'view_expenses',
          create: 'create_expenses',
          edit: 'edit_expenses',
          delete: 'delete_expenses'
        }
      },
      {
        id: 'statutory_reports',
        name: 'Statutory Reports',
        description: 'PF, ESI, TDS and labour compliance reporting',
        actions: {
          view: 'view_statutory_reports',
          create: 'create_payroll',
          edit: 'edit_payroll',
          delete: 'delete_payroll'
        }
      }
    ]
  },
  {
    groupId: 'employee',
    module: 'Employee',
    name: 'Employee Directory',
    description: 'Staff directory, personal profiles, KYC documents',
    color: 'sky',
    resources: [
      {
        id: 'employees',
        name: 'Staff Profiles',
        description: 'Employee details, IDs, joining documents & records',
        actions: {
          view: 'view_employees',
          create: 'create_employees',
          edit: 'edit_employees',
          delete: 'delete_employees'
        }
      }
    ]
  },
  {
    groupId: 'finance',
    module: 'Settings',
    name: 'Accounts, Banking & Vouchers',
    description: 'Bank Payments, Receipts, Journals, Ledgers & Clearances',
    color: 'indigo',
    resources: [
      {
        id: 'bank_payments',
        name: 'Bank Payments',
        description: 'Outgoing bank payments & vendor disbursements',
        actions: {
          view: 'view_bank_payments',
          create: 'create_bank_payments',
          edit: 'edit_bank_payments',
          delete: 'delete_bank_payments'
        }
      },
      {
        id: 'bank_receipts',
        name: 'Bank Receipts',
        description: 'Incoming bank receipts & client settlements',
        actions: {
          view: 'view_bank_receipts',
          create: 'create_bank_receipts',
          edit: 'edit_bank_receipts',
          delete: 'delete_bank_receipts'
        }
      },
      {
        id: 'journals',
        name: 'General Journals',
        description: 'General journals & adjustment ledger postings',
        actions: {
          view: 'view_journals',
          create: 'create_journals',
          edit: 'edit_journals',
          delete: 'delete_journals'
        }
      },
      {
        id: 'journal_vouchers',
        name: 'Journal Vouchers',
        description: 'Double-entry journal vouchers and adjustment entries',
        actions: {
          view: 'view_journal_vouchers',
          create: 'create_journal_vouchers',
          edit: 'edit_journal_vouchers',
          delete: 'delete_journal_vouchers'
        }
      },
      {
        id: 'contra_entries',
        name: 'Contra Entries',
        description: 'Inter-account bank/cash contra transfers',
        actions: {
          view: 'view_contra_entries',
          create: 'create_contra_entries',
          edit: 'edit_contra_entries',
          delete: 'delete_contra_entries'
        }
      },
      {
        id: 'vouchers',
        name: 'General Vouchers',
        description: 'General voucher entries and financial adjustments',
        actions: {
          view: 'view_vouchers',
          create: 'create_vouchers',
          edit: 'edit_vouchers',
          delete: 'delete_vouchers'
        }
      },
      {
        id: 'ledgers',
        name: 'Ledgers & Chart of Accounts',
        description: 'Ledger accounts, groupings & trial balances',
        actions: {
          view: 'view_ledgers',
          create: 'create_ledgers',
          edit: 'edit_ledgers',
          delete: 'delete_ledgers'
        }
      },
      {
        id: 'clearance',
        name: 'Bank Clearance & Cheques',
        description: 'Cheque clearance and bank statement reconciliations',
        actions: {
          view: 'view_clearance',
          create: 'create_clearance',
          edit: 'edit_clearance',
          delete: 'delete_clearance'
        }
      }
    ]
  },
  {
    groupId: 'master_setup',
    module: 'Settings',
    name: 'Master Configuration & Branches',
    description: 'Branches, Cities, Departments, Designations & Couriers',
    color: 'cyan',
    resources: [
      {
        id: 'branches',
        name: 'Company Branches',
        description: 'Physical branches, warehouses & retail outlets',
        actions: {
          view: 'view_branches',
          create: 'create_branches',
          edit: 'edit_branches',
          delete: 'delete_branches'
        }
      },
      {
        id: 'branch_types',
        name: 'Branch Types',
        description: 'Head office, regional branch, or warehouse hubs',
        actions: {
          view: 'view_branch_types',
          create: 'create_branch_types',
          edit: 'edit_branch_types',
          delete: 'delete_branch_types'
        }
      },
      {
        id: 'cities',
        name: 'Cities & Locations',
        description: 'Operating cities, states, pin-codes master',
        actions: {
          view: 'view_cities',
          create: 'create_cities',
          edit: 'edit_cities',
          delete: 'delete_cities'
        }
      },
      {
        id: 'departments',
        name: 'Departments',
        description: 'Organizational divisions (IT, HR, Finance, Ops)',
        actions: {
          view: 'view_departments',
          create: 'create_departments',
          edit: 'edit_departments',
          delete: 'delete_departments'
        }
      },
      {
        id: 'designations',
        name: 'Designations',
        description: 'Staff job titles and rank hierarchy',
        actions: {
          view: 'view_designations',
          create: 'create_designations',
          edit: 'edit_designations',
          delete: 'delete_designations'
        }
      },
      {
        id: 'couriers',
        name: 'Couriers & Logistics',
        description: 'Shipping partners and parcel courier dispatchers',
        actions: {
          view: 'view_couriers',
          create: 'create_couriers',
          edit: 'edit_couriers',
          delete: 'delete_couriers'
        }
      },
      {
        id: 'count_types',
        name: 'Count Types',
        description: 'Stock-take count types and periodic cycles',
        actions: {
          view: 'view_count_types',
          create: 'create_count_types',
          edit: 'edit_count_types',
          delete: 'delete_count_types'
        }
      },
      {
        id: 'currencies',
        name: 'Currencies',
        description: 'Multi-currency rates and exchange symbols',
        actions: {
          view: 'view_currencies',
          create: 'create_currencies',
          edit: 'view_currencies',
          delete: 'view_currencies'
        }
      },
      {
        id: 'hrms_settings',
        name: 'HRMS Master Settings',
        description: 'HR policies, leave quotas and payroll rules',
        actions: {
          view: 'view_hrms_settings',
          create: 'edit_hrms_settings',
          edit: 'edit_hrms_settings',
          delete: 'edit_hrms_settings'
        }
      },
      {
        id: 'settings',
        name: 'System Preferences',
        description: 'Global ERP configuration and company settings',
        actions: {
          view: 'view_settings',
          create: 'create_settings',
          edit: 'edit_settings',
          delete: 'delete_settings'
        }
      }
    ]
  },
  {
    groupId: 'security',
    module: 'Settings',
    name: 'Security, Users & Roles',
    description: 'User access accounts, roles and permission security',
    color: 'purple',
    resources: [
      {
        id: 'users',
        name: 'System Users',
        description: 'User credentials, email logins and status controls',
        actions: {
          view: 'view_users',
          create: 'create_users',
          edit: 'edit_users',
          delete: 'delete_users'
        }
      },
      {
        id: 'roles',
        name: 'Roles & Privileges',
        description: 'Role access definitions & permission matrices',
        actions: {
          view: 'view_roles',
          create: 'create_roles',
          edit: 'edit_roles',
          delete: 'delete_roles'
        }
      }
    ]
  },
  {
    groupId: 'analytics',
    module: 'Reports',
    name: 'Dashboard & Reports',
    description: 'Executive dashboard overview, financial and MIS reports',
    color: 'orange',
    resources: [
      {
        id: 'dashboard',
        name: 'Main Executive Dashboard',
        description: 'Sales summaries, revenue metrics and executive KPIs',
        actions: {
          view: 'Dashboard',
          create: 'view_dashboard',
          edit: 'view_dashboard',
          delete: 'view_dashboard'
        }
      },
      {
        id: 'reports',
        name: 'Financial & MIS Reports',
        description: 'Balance Sheet, P&L, GST summaries & stock ledger reports',
        actions: {
          view: 'view_reports',
          create: 'view_reports',
          edit: 'view_reports',
          delete: 'view_reports'
        }
      }
    ]
  }
];

const ALL_CORE_MODULES = [
  'Sales', 'Purchase', 'Inventory', 'Attendance', 
  'Leave', 'Payroll', 'Employee', 'Reports', 'Settings', 'Dashboard'
];

const UserMaster = () => {
  const { can } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Create & Edit Role
  const [showModal, setShowModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    roleCode: '',
    description: '',
    status: 'Active'
  });

  // Granular Permissions Map: { [permKey]: boolean }
  const [selectedPerms, setSelectedPerms] = useState({});

  // Filter inside the modal
  const [permSearch, setPermSearch] = useState('');
  // Collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/roles');
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoleId(null);
    setRoleForm({
      name: '',
      roleCode: `ROL-${String(roles.length + 1).padStart(3, '0')}`,
      description: '',
      status: 'Active'
    });
    setSelectedPerms({});
    setPermSearch('');
    setShowModal(true);
  };

  const handleOpenEditModal = (role) => {
    setEditingRoleId(role._id);
    setRoleForm({
      name: role.name || '',
      roleCode: role.roleCode || '',
      description: role.description || '',
      status: role.status || 'Active'
    });

    const permsMap = {};
    // 1. Populate from granular role.permissions array if present
    if (Array.isArray(role.permissions)) {
      role.permissions.forEach(p => {
        if (p) permsMap[p] = true;
      });
    }

    // 2. Fallback / supplementary support from modulePermissions if old role
    if (Array.isArray(role.modulePermissions)) {
      role.modulePermissions.forEach(mp => {
        const mod = (mp.module || mp.name || '').toLowerCase();
        if (mp.view) {
          permsMap[`view_${mod}`] = true;
          if (mod === 'attendance') permsMap['view_hrms'] = true;
          if (mod === 'inventory') permsMap['view_products'] = true;
          if (mod === 'settings') permsMap['view_settings'] = true;
        }
        if (mp.create) {
          permsMap[`create_${mod}`] = true;
          if (mod === 'attendance') permsMap['create_hrms'] = true;
          if (mod === 'inventory') permsMap['create_products'] = true;
          if (mod === 'settings') permsMap['create_settings'] = true;
        }
        if (mp.edit) {
          permsMap[`edit_${mod}`] = true;
          if (mod === 'attendance') permsMap['edit_hrms'] = true;
          if (mod === 'inventory') permsMap['edit_products'] = true;
          if (mod === 'settings') permsMap['edit_settings'] = true;
        }
        if (mp.delete) {
          permsMap[`delete_${mod}`] = true;
          if (mod === 'attendance') permsMap['delete_hrms'] = true;
          if (mod === 'inventory') permsMap['delete_products'] = true;
          if (mod === 'settings') permsMap['delete_settings'] = true;
        }
      });
    }

    // Special case for SuperAdmin & Admin system roles (Full access to all permissions)
    if (role.name === 'SuperAdmin' || role.name === 'Admin') {
      PERMISSION_GROUPS.forEach(g => {
        g.resources.forEach(r => {
          Object.values(r.actions).forEach(key => {
            permsMap[key] = true;
          });
        });
      });
    }

    setSelectedPerms(permsMap);
    setPermSearch('');
    setShowModal(true);
  };

  const handleTogglePerm = (permKey) => {
    setSelectedPerms(prev => ({
      ...prev,
      [permKey]: !prev[permKey]
    }));
  };

  const handleToggleResource = (resource) => {
    const keys = Object.values(resource.actions);
    const allChecked = keys.every(k => !!selectedPerms[k]);
    const newState = !allChecked;

    setSelectedPerms(prev => {
      const next = { ...prev };
      keys.forEach(k => {
        next[k] = newState;
      });
      return next;
    });
  };

  const handleToggleGroup = (group) => {
    const keys = [];
    group.resources.forEach(r => {
      Object.values(r.actions).forEach(k => keys.push(k));
    });

    const allChecked = keys.every(k => !!selectedPerms[k]);
    const newState = !allChecked;

    setSelectedPerms(prev => {
      const next = { ...prev };
      keys.forEach(k => {
        next[k] = newState;
      });
      return next;
    });
  };

  const handleToggleAll = (targetState) => {
    const next = {};
    if (targetState) {
      PERMISSION_GROUPS.forEach(g => {
        g.resources.forEach(r => {
          Object.values(r.actions).forEach(k => {
            next[k] = true;
          });
        });
      });
    }
    setSelectedPerms(next);
  };

  const toggleCollapseGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filter groups and resources based on search term in modal
  const filteredGroups = useMemo(() => {
    if (!permSearch.trim()) return PERMISSION_GROUPS;
    const query = permSearch.toLowerCase();

    return PERMISSION_GROUPS.map(group => {
      const groupMatches = group.name.toLowerCase().includes(query) || group.description.toLowerCase().includes(query);
      const filteredResources = group.resources.filter(r => 
        groupMatches ||
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        Object.values(r.actions).some(k => k.toLowerCase().includes(query))
      );

      if (filteredResources.length > 0) {
        return {
          ...group,
          resources: filteredResources
        };
      }
      return null;
    }).filter(Boolean);
  }, [permSearch]);

  const totalSelectedCount = useMemo(() => {
    return Object.values(selectedPerms).filter(Boolean).length;
  }, [selectedPerms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a role name!',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    // Gather all checked granular permission strings
    const permsSet = new Set();
    Object.entries(selectedPerms).forEach(([key, isChecked]) => {
      if (isChecked) {
        permsSet.add(key);
      }
    });

    // Also auto-add module wide permissions for backward compatibility
    ALL_CORE_MODULES.forEach(mod => {
      const modLower = mod.toLowerCase();
      const group = PERMISSION_GROUPS.find(g => g.module === mod);
      if (group) {
        const hasView = group.resources.some(r => !!selectedPerms[r.actions.view]);
        const hasCreate = group.resources.some(r => !!selectedPerms[r.actions.create]);
        const hasEdit = group.resources.some(r => !!selectedPerms[r.actions.edit]);
        const hasDelete = group.resources.some(r => !!selectedPerms[r.actions.delete]);

        if (hasView) permsSet.add(`view_${modLower}`);
        if (hasCreate) permsSet.add(`create_${modLower}`);
        if (hasEdit) permsSet.add(`edit_${modLower}`);
        if (hasDelete) permsSet.add(`delete_${modLower}`);
      }
    });

    // Generate clean modulePermissions array matching the 10 core modules
    const formattedModulePermissions = ALL_CORE_MODULES.map(modName => {
      const group = PERMISSION_GROUPS.find(g => g.module === modName);
      if (!group) {
        return { module: modName, view: false, create: false, edit: false, delete: false };
      }
      return {
        module: modName,
        view: group.resources.some(r => !!selectedPerms[r.actions.view]),
        create: group.resources.some(r => !!selectedPerms[r.actions.create]),
        edit: group.resources.some(r => !!selectedPerms[r.actions.edit]),
        delete: group.resources.some(r => !!selectedPerms[r.actions.delete])
      };
    });

    const payload = {
      name: roleForm.name.trim(),
      roleCode: roleForm.roleCode.trim(),
      description: roleForm.description.trim(),
      status: 'Active',
      permissions: Array.from(permsSet),
      modulePermissions: formattedModulePermissions
    };

    try {
      if (editingRoleId) {
        await api.put(`/roles/${editingRoleId}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Role updated successfully!',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await api.post('/roles', payload);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Role created successfully!',
          timer: 1800,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Role',
        text: error.response?.data?.message || 'Something went wrong while saving the role.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const handleDeleteRole = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Do you really want to delete role <b>"${name}"</b>?<br/><span style="font-size: 12px; color: #64748b;">This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/roles/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `Role "${name}" has been deleted.`,
        timer: 1800,
        showConfirmButton: false
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Delete',
        text: error.response?.data?.message || 'Error deleting role.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);

  const isSuperAdmin = loggedInUser?.role?.name === 'SuperAdmin' || loggedInUser?.role === 'SuperAdmin';

  const filteredRoles = roles.filter(r => {
    // Hide SuperAdmin from non-SuperAdmin users
    if (!isSuperAdmin && r.name === 'SuperAdmin') {
      return false;
    }

    return (
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="text-indigo-600" size={26} />
            User & Role Master
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define system roles, manage granular API permissions, and configure access security.
          </p>
        </div>

        {/* Top Right Create Button */}
        {can(['create_roles', 'manage_roles']) && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            Create Role
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search roles by name or role code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Roles: <span className="text-indigo-600 font-bold">{roles.length}</span>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-4">Role Name</th>
                <th className="p-4">Role Code</th>
                <th className="p-4 text-center">Granular Permissions</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold">
                    Loading roles from database...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold">
                    No roles found. Click &quot;Create Role&quot; button to create a new role.
                  </td>
                </tr>
              ) : (
                filteredRoles.map(role => {
                  const permCount = (role.permissions || []).length;
                  const isSystemRole = role.name === 'SuperAdmin' || role.name === 'Admin';

                  return (
                    <tr key={role._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                          <Shield size={14} />
                        </div>
                        {role.name}
                        {isSystemRole && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                            System
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">
                        {role.roleCode || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSystemRole 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : permCount > 0 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isSystemRole 
                            ? 'All Permissions Granted' 
                            : permCount > 0 
                              ? `${permCount} Permissions Granted` 
                              : 'Default Scope'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          role.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {role.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {can(['edit_roles', 'manage_roles']) && (
                          <button
                            onClick={() => handleOpenEditModal(role)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Role & Permissions"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {!isSystemRole && can(['delete_roles', 'manage_roles']) && (
                          <button
                            onClick={() => handleDeleteRole(role._id, role.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Role"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT ROLE MODAL WITH GRANULAR PERMISSIONS MATRIX */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-800">
                    {editingRoleId ? 'Edit Role & Granular Permissions' : 'Create New System Role'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Configure granular API permissions (View, Create, Edit, Delete) across all ERP modules
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FinanceManager, Inventory_Clerk, HR_Officer"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Role Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ROL-001"
                    value={roleForm.roleCode}
                    onChange={(e) => setRoleForm({ ...roleForm, roleCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Permissions Header & Actions Bar */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="text-indigo-600" size={16} />
                    Granular Resource Permissions Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select permissions below. Total Granted: <span className="font-bold text-indigo-700">{totalSelectedCount}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Quick Search */}
                  <div className="relative flex-1 md:w-56">
                    <Filter className="absolute left-2.5 top-2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Filter entities (e.g. tax, units, bank)..."
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1 text-[11px] bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAll(true)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAll(false)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grouped Permission Accordions */}
              <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed rounded-2xl">
                    No resources matching &quot;{permSearch}&quot;
                  </div>
                ) : (
                  filteredGroups.map(group => {
                    const isCollapsed = !!collapsedGroups[group.groupId];
                    
                    // Count how many keys in this group are checked
                    const allGroupKeys = [];
                    group.resources.forEach(r => Object.values(r.actions).forEach(k => allGroupKeys.push(k)));
                    const checkedInGroup = allGroupKeys.filter(k => !!selectedPerms[k]).length;
                    const isAllInGroupChecked = allGroupKeys.length > 0 && checkedInGroup === allGroupKeys.length;

                    return (
                      <div 
                        key={group.groupId}
                        className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                      >
                        {/* Group Header */}
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                          <div 
                            onClick={() => toggleCollapseGroup(group.groupId)}
                            className="flex items-center gap-2 cursor-pointer select-none flex-1"
                          >
                            <span className="font-bold text-xs text-slate-800">
                              {group.name}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              • {group.description}
                            </span>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              {checkedInGroup} / {allGroupKeys.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(group)}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                                isAllInGroupChecked
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              }`}
                            >
                              {isAllInGroupChecked ? 'Deselect Group' : 'Select Group'}
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleCollapseGroup(group.groupId)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded"
                            >
                              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Group Table */}
                        {!isCollapsed && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/60 text-slate-600 font-bold border-b border-slate-100">
                                <tr>
                                  <th className="px-4 py-2 min-w-[220px]">Sub-Resource / Entity</th>
                                  <th className="px-3 py-2 text-center w-16">View</th>
                                  <th className="px-3 py-2 text-center w-16">Create</th>
                                  <th className="px-3 py-2 text-center w-16">Edit</th>
                                  <th className="px-3 py-2 text-center w-16">Delete</th>
                                  <th className="px-3 py-2 text-center w-20">Row</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.resources.map(res => {
                                  const vKey = res.actions.view;
                                  const cKey = res.actions.create;
                                  const eKey = res.actions.edit;
                                  const dKey = res.actions.delete;
                                  
                                  const keys = [vKey, cKey, eKey, dKey].filter(Boolean);
                                  const rowAllChecked = keys.every(k => !!selectedPerms[k]);

                                  return (
                                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="px-4 py-2.5">
                                        <div className="font-bold text-slate-800 text-[11px]">{res.name}</div>
                                        <div className="text-[10px] text-slate-400">{res.description}</div>
                                      </td>

                                      {/* View */}
                                      <td className="px-3 py-2.5 text-center">
                                        {vKey ? (
                                          <input
                                            type="checkbox"
                                            checked={!!selectedPerms[vKey]}
                                            onChange={() => handleTogglePerm(vKey)}
                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            title={`Permission: ${vKey}`}
                                          />
                                        ) : <span className="text-slate-300">-</span>}
                                      </td>

                                      {/* Create */}
                                      <td className="px-3 py-2.5 text-center">
                                        {cKey ? (
                                          <input
                                            type="checkbox"
                                            checked={!!selectedPerms[cKey]}
                                            onChange={() => handleTogglePerm(cKey)}
                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            title={`Permission: ${cKey}`}
                                          />
                                        ) : <span className="text-slate-300">-</span>}
                                      </td>

                                      {/* Edit */}
                                      <td className="px-3 py-2.5 text-center">
                                        {eKey ? (
                                          <input
                                            type="checkbox"
                                            checked={!!selectedPerms[eKey]}
                                            onChange={() => handleTogglePerm(eKey)}
                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            title={`Permission: ${eKey}`}
                                          />
                                        ) : <span className="text-slate-300">-</span>}
                                      </td>

                                      {/* Delete */}
                                      <td className="px-3 py-2.5 text-center">
                                        {dKey ? (
                                          <input
                                            type="checkbox"
                                            checked={!!selectedPerms[dKey]}
                                            onChange={() => handleTogglePerm(dKey)}
                                            className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                                            title={`Permission: ${dKey}`}
                                          />
                                        ) : <span className="text-slate-300">-</span>}
                                      </td>

                                      {/* Toggle Row */}
                                      <td className="px-3 py-2.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleResource(res)}
                                          className={`text-[9px] px-2 py-0.5 rounded font-bold transition ${
                                            rowAllChecked 
                                              ? 'bg-indigo-600 text-white' 
                                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                          }`}
                                        >
                                          {rowAllChecked ? 'Full' : 'Toggle'}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-indigo-600">{totalSelectedCount}</span> permissions will be assigned to this role.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 transition hover:scale-[1.01]"
                  >
                    {editingRoleId ? 'Save Changes' : 'Create Role'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserMaster;
