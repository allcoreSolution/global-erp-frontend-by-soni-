import React, { useState, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Calculator,
  User,
  Briefcase,
  Layers,
  Banknote,
  Repeat,
  RotateCcw,
  Receipt,
  CreditCard,
  Building,
  FileBox,
  Truck,
  Heart,
  UserPlus,
  ShieldAlert,
  Star,
  X,
  Calendar,
  TrendingUp,
  Tag,
  Grid,
  Clock,
  IndianRupee,
  MessageSquare,
  Mail,
  Megaphone,
  CloudUpload,
  Trash,
  ShieldCheck,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { usePermissions } from '../utils/permissionUtils';

const SidebarContext = createContext();

const MenuItem = ({ icon: Icon, text, hasDropdown, active = false, shortcut = '', to = "/coming-soon", subItems, permission }) => {
  const { openMenu, setOpenMenu } = useContext(SidebarContext);
  const { can, canRoute, isSuperAdmin, isAdmin } = usePermissions();
  const isOpen = openMenu === text;

  // Direct permission check
  if (!isSuperAdmin && !isAdmin && permission && !can(permission)) {
    return null;
  }

  if (subItems && subItems.length > 0) {
    // Filter subItems based on permission and routes
    const permittedSubItems = subItems.filter(sub => {
      if (isSuperAdmin || isAdmin) return true;
      if (sub.permission) return can(sub.permission);
      if (sub.to) return canRoute(sub.to);
      return true;
    });

    // If all subItems were filtered out, hide this entire menu
    if (permittedSubItems.length === 0) {
      return null;
    }

    return (
      <div>
        <div
          onClick={() => setOpenMenu(isOpen ? null : text)}
          className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors text-xs text-gray-300 hover:bg-slate-800 hover:text-white`}
        >
          <div className="flex items-center gap-2.5">
            <Icon size={14} className="text-gray-400" />
            <span>{text}</span>
          </div>
          <div>
            {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
        </div>
        {isOpen && (
          <div className="pl-3 bg-[#071324] border-l-2 border-blue-600/30">
            {permittedSubItems.map((sub, idx) => (
              <NavLink
                key={idx}
                to={sub.to}
                className={({ isActive }) => `flex items-center py-1 px-2.5 text-[11px] transition-colors
                ${isActive ? 'text-white font-semibold bg-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
              >
                {sub.text}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single item route check
  if (!isSuperAdmin && !isAdmin && to && to !== '/' && to !== '/coming-soon') {
    if (!canRoute(to)) {
      return null;
    }
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors text-xs group
      ${isActive || active ? 'text-white bg-slate-800' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-gray-400 group-hover:text-white" />
        <span>{text}</span>
      </div>
      <div className="flex items-center gap-2">
        {shortcut && <span className="text-[9px] text-gray-500 bg-slate-800 px-1 rounded">{shortcut}</span>}
        {hasDropdown && <ChevronRight size={14} className="text-gray-500" />}
      </div>
    </NavLink>
  );
};

const MenuSection = ({ title, children, defaultOpen = false, permission }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { can, isSuperAdmin, isAdmin } = usePermissions();

  if (!isSuperAdmin && !isAdmin && permission && !can(permission)) {
    return null;
  }

  return (
    <div className="mt-1">
      <div
        className="flex items-center justify-between px-2 py-1 cursor-pointer text-blue-400 text-[10px] font-bold tracking-wider hover:text-blue-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
};

const Sidebar = ({ onClose }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [companyTheme, setCompanyTheme] = useState({ name: 'GLOBAL ERP', logoUrl: '', themeColor: '#0a192f' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('permissions');
    localStorage.removeItem('modulePermissions');
    localStorage.removeItem('user');
    localStorage.removeItem('companyName');
    localStorage.removeItem('erp_company');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_fy');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  const userRole = localStorage.getItem('userRole'); // Check the logged in user's role

  React.useEffect(() => {
    const loadTheme = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.company) {
            setCompanyTheme({
              name: userObj.company.name || 'GLOBAL ERP',
              logoUrl: userObj.company.logoUrl || '',
              themeColor: userObj.company.themeColor || '#0a192f'
            });
          }
        } catch (e) {
          console.error('Failed to parse user for theme', e);
        }
      }
    };
    loadTheme();
    window.addEventListener('userUpdated', loadTheme);
    return () => window.removeEventListener('userUpdated', loadTheme);
  }, []);

  return (
    <SidebarContext.Provider value={{ openMenu, setOpenMenu, openSection, setOpenSection }}>
      <div className="w-[260px] text-white flex-shrink-0 flex flex-col h-full overflow-hidden select-none transition-colors" style={{ backgroundColor: companyTheme.themeColor }}>
        {/* Logo Area */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1 shadow-sm border border-white/20 overflow-hidden shrink-0">
              <img 
                src={companyTheme.logoUrl || "/image-removebg-preview (1).png"} 
                alt="Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/image-removebg-preview (1).png";
                }}
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold leading-tight tracking-wide flex items-center gap-1 truncate max-w-[150px]">
                {companyTheme.name.toUpperCase()}
              </div>
              <div className="text-[11px] text-blue-300 font-semibold tracking-widest mt-0.5">ERP SYSTEM</div>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
          )}
        </div>


        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pb-4 overflow-x-hidden no-scrollbar">
          <div className="mt-2">
            {userRole === 'SuperAdmin' ? (
              <MenuItem icon={LayoutDashboard} text="Super Admin Panel" to="/super-admin" />
            ) : (
              <MenuItem icon={LayoutDashboard} text="Dashboard" to="/" />
            )}
          </div>

          {/* ONLY SHOW SUPER ADMIN MENUS TO SUPER ADMIN */}
          {userRole === 'SuperAdmin' && (
            <>
              <MenuSection title="COMPANY & TENANT" defaultOpen={true}>
                <MenuItem icon={CreditCard} text="Subscriptions" to="/super-admin/subscriptions" />
                <MenuItem icon={Tag} text="Plans & Pricing" to="/super-admin/plans" />
                <MenuItem icon={Grid} text="Modules" to="/super-admin/modules" />
                <MenuItem icon={Building} text="Companies" to="/super-admin/companies" />
              </MenuSection>

              <MenuSection title="USERS & ROLES" defaultOpen={true}>
                <MenuItem icon={Users} text="Super Admin Users" to="/super-admin/users" />
                <MenuItem icon={User} text="Roles & Permissions" to="/super-admin/roles" />
                <MenuItem icon={Clock} text="User Activity" to="/super-admin/user-activity" />
              </MenuSection>

              <MenuSection title="BILLING & PAYMENTS" defaultOpen={true}>
                <MenuItem icon={FileText} text="Invoices" to="/super-admin/invoices" />
                <MenuItem icon={IndianRupee} text="Payments & Ledger" to="/super-admin/payments" />
                <MenuItem icon={CreditCard} text="Payment Gateways" to="/super-admin/gateways" />
              </MenuSection>

              <MenuSection title="SUPPORT & COMMUNICATION" defaultOpen={true}>
                <MenuItem icon={MessageSquare} text="Company Support Tickets" to="/super-admin/support" />
                <MenuItem icon={Mail} text="Email Templates" to="/super-admin/email-templates" />
                <MenuItem icon={Megaphone} text="Platform Announcements" to="/super-admin/announcements" />
              </MenuSection>

              <MenuSection title="SYSTEM & SETTINGS" defaultOpen={true}>
                <MenuItem icon={Settings} text="System Settings" to="/super-admin/settings" />
                <MenuItem icon={CloudUpload} text="Backup & Restore" to="/super-admin/backup" />
                <MenuItem icon={Trash} text="Recently Deleted" to="/super-admin/deleted" />
                <MenuItem icon={ShieldCheck} text="Audit & Activity Logs" to="/super-admin/audit" />
              </MenuSection>

              <MenuSection title="PERFORMANCE" defaultOpen={true}>
                <MenuItem icon={Star} text="Performance" to="/super-admin/performance" />
                <MenuItem icon={MessageCircle} text="Feedback" to="/super-admin/feedback" />
              </MenuSection>
            </>
          )}

          {userRole !== 'SuperAdmin' && (
            <>
              <MenuSection
                title="MASTERS"
                defaultOpen={true}
                permission={['view_contacts', 'view_suppliers', 'view_warehouses', 'view_products', 'view_price_lists', 'view_tax_slabs', 'view_company', 'view_branches']}
              >
                <MenuItem icon={User} text="Customer Master" to="/customers/customer-master" permission="view_contacts" />
                <MenuItem icon={Truck} text="Supplier Master" to="/suppliers/supplier-master" permission="view_suppliers" />
                <MenuItem icon={Building} text="Warehouse Master" to="/warehouse/master" permission="view_warehouses" />
                <MenuItem
                  icon={Package}
                  text="Item / Product Master"
                  permission="view_products"
                  subItems={[
                    { text: 'Add Purchase', to: '/purchases/add-purchase', permission: 'create_purchases' },
                    { text: 'Purchase List', to: '/purchases/purchase-list', permission: 'view_purchases' },
                    { text: 'Purchase Return', to: '/purchases/purchase-return', permission: 'create_purchase_returns' },
                    { text: 'Brand', to: '/products/brand', permission: 'view_products' },
                    { text: 'Category', to: '/products/category', permission: 'view_products' },
                    { text: 'Unit', to: '/products/unit', permission: 'view_units' },
                    { text: 'Product List', to: '/products/product-list', permission: ['view_products', 'view_stock'] },
                    { text: 'Add Adjustment', to: '/products/add-adjustment', permission: 'create_adjustments' },
                    { text: 'Adjustment List', to: '/products/adjustment-list', permission: 'view_adjustments' },
                    { text: 'Group', to: '/products/group', permission: 'view_products' },
                    { text: 'Ledger', to: '/products/ledger', permission: 'view_ledgers' }
                  ]}
                />

                <MenuItem
                  icon={FileText}
                  text="Price List Master"
                  permission="view_price_lists"
                  subItems={[
                    { text: 'Price List', to: '/price-list/list', permission: 'view_price_lists' },
                    { text: 'Pricing Rules', to: '/price-list/rules', permission: 'view_price_lists' }
                  ]}
                />
                <MenuItem
                  icon={Calculator}
                  text="Tax Master"
                  permission="view_tax_slabs"
                  subItems={[
                    { text: 'Tax Configuration', to: '/tax/config', permission: 'view_tax_slabs' }
                  ]}
                />

                <MenuItem
                  icon={Building}
                  text="Company Master"
                  permission="view_company"
                  subItems={[
                    { text: 'Company Profile', to: '/company/profile', permission: 'view_company' },
                    { text: 'Business Settings', to: '/company/business-settings', permission: 'view_company' }
                  ]}
                />
                <MenuItem
                  icon={Layers}
                  text="Branch Master"
                  permission="view_branches"
                  to="/branch/info"
                />

              </MenuSection>

              <MenuSection
                title="TRANSACTIONS"
                defaultOpen={true}
                permission={['view_sales', 'view_receipts', 'view_bank_receipts', 'view_payments', 'view_bank_payments', 'view_contra_entries', 'view_stock', 'view_debit_notes', 'view_credit_notes', 'view_vouchers', 'view_accounts']}
              >
                <MenuItem
                  icon={ShoppingCart}
                  text="Sales"
                  subItems={[
                    { text: 'Add Sale', to: '/sales/add-sale', permission: ['create_sales', 'manage_sales'] },
                    { text: 'Sale List', to: '/sales/sale-list', permission: ['view_sales', 'manage_sales'] },
                    { text: 'Packing Slip List', to: '/sales/packing-slip-list', permission: ['view_sales', 'manage_sales'] },
                    { text: 'Challan List', to: '/sales/challan-list', permission: ['view_sales', 'manage_sales'] },
                    { text: 'Courier List', to: '/sales/courier-list', permission: ['view_sales', 'manage_sales'] },
                    { text: 'Sale Return', to: '/sales/sale-return', permission: ['create_sales', 'create_credit_notes', 'manage_sales'] },
                    { text: 'Sale Exchange List', to: '/sales/sale-exchange-list', permission: ['view_sales', 'manage_sales'] }
                  ]}
                />

                <MenuItem
                  icon={Receipt}
                  text="Receipt"
                  subItems={[
                    { text: 'Receipt List', to: '/receipt/list', permission: ['view_vouchers', 'view_sales', 'view_receipts'] },
                    { text: 'New Receipt', to: '/receipt/new', permission: ['create_vouchers', 'create_sales', 'create_receipts'] }
                  ]}
                />
                <MenuItem
                  icon={Banknote}
                  text="Bank Receipt"
                  subItems={[
                    { text: 'Bank Receipt List', to: '/bank-receipt/list', permission: ['view_bank_receipts', 'view_vouchers', 'view_accounts'] },
                    { text: 'New Bank Receipt', to: '/bank-receipt/new', permission: ['create_bank_receipts', 'create_vouchers', 'create_accounts'] }
                  ]}
                />
                <MenuItem
                  icon={CreditCard}
                  text="Payment"
                  subItems={[
                    { text: 'Payment List', to: '/payment/list', permission: ['view_payments', 'view_purchases', 'view_vouchers'] },
                    { text: 'New Payment', to: '/payment/new', permission: ['create_payments', 'create_purchases', 'create_vouchers'] }
                  ]}
                />
                <MenuItem
                  icon={CreditCard}
                  text="Bank Payment"
                  subItems={[
                    { text: 'Bank Payment List', to: '/bank-payment/list', permission: ['view_bank_payments', 'view_vouchers', 'view_accounts'] },
                    { text: 'New Bank Payment', to: '/bank-payment/new', permission: ['create_bank_payments', 'create_vouchers', 'create_accounts'] }
                  ]}
                />
                <MenuItem
                  icon={Repeat}
                  text="Contra Entry"
                  subItems={[
                    { text: 'Contra List', to: '/contra/list', permission: ['view_contra_entries', 'view_accounts'] },
                    { text: 'New Contra', to: '/contra/new', permission: ['create_contra_entries', 'create_accounts'] }
                  ]}
                />
                <MenuItem
                  icon={Package}
                  text="Stock Entry"
                  subItems={[
                    { text: 'Stock Entry List', to: '/stock-entry/list', permission: ['view_stock', 'manage_stock', 'view_inventory'] },
                    { text: 'New Stock Entry', to: '/stock-entry/new', permission: ['create_stock_adjustments', 'manage_stock', 'create_inventory'] }
                  ]}
                />
                <MenuItem
                  icon={Repeat}
                  text="Stock Transfer"
                  subItems={[
                    { text: 'Transfer List', to: '/stock-transfer/list', permission: ['view_stock', 'manage_stock', 'view_inventory'] },
                    { text: 'New Transfer', to: '/stock-transfer/new', permission: ['create_transfers', 'manage_stock', 'create_inventory'] }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Debit Note"
                  subItems={[
                    { text: 'Debit Note List', to: '/debit-note/list', permission: ['view_debit_notes', 'view_purchases'] },
                    { text: 'New Debit Note', to: '/debit-note/new', permission: ['create_debit_notes', 'create_purchases'] }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Credit Note"
                  subItems={[
                    { text: 'Credit Note List', to: '/credit-note/list', permission: ['view_credit_notes', 'view_sales'] },
                    { text: 'New Credit Note', to: '/credit-note/new', permission: ['create_credit_notes', 'create_sales'] }
                  ]}
                />
                <MenuItem icon={FileText} text="Day Book" to="/day-book" permission={['view_vouchers', 'view_accounts']} />
              </MenuSection>

              <MenuSection
                title="HRMS"
                defaultOpen={true}
                permission={['view_employees', 'view_hrms', 'view_leave', 'view_payroll', 'view_expenses', 'view_appraisals', 'view_roles', 'view_shift_timings', 'manage_hrms']}
              >
                <MenuItem
                  icon={ShieldCheck}
                  text="User & Role Master"
                  to="/setup/user-master"
                  permission="view_roles"
                />
                <MenuItem
                  icon={Users}
                  text="Employee Management"
                  permission={['view_employees', 'create_employees']}
                  subItems={[
                    { text: 'Employee List', to: '/employees/list', permission: 'view_employees' },
                    { text: 'Add Employee', to: '/employees/profile', permission: 'create_employees' }
                  ]}
                />
                <MenuItem
                  icon={Calendar}
                  text="Attendance & Leave"
                  permission={['view_hrms', 'view_leave']}
                  subItems={[
                    { text: 'Daily Attendance', to: '/hrms/attendance/daily', permission: ['view_hrms', 'view_attendance', 'view_leave'] },
                    { text: 'Leave Requests', to: '/hrms/attendance/leaves', permission: ['view_hrms', 'view_leave'] },
                    { text: 'Holiday Calendar', to: '/hrms/attendance/holidays', permission: ['view_holidays', 'view_hrms', 'view_leave'] }
                  ]}
                />
                <MenuItem
                  icon={Calculator}
                  text="Payroll & Salary"
                  permission={['view_payroll', 'view_payslips']}
                  subItems={[
                    { text: 'Salary Structure', to: '/hrms/payroll/structure' },
                    { text: 'Generate Pay Slips', to: '/hrms/payroll/slips' },
                    { text: 'PF & ESI Reports', to: '/hrms/payroll/pf-esi' }
                  ]}
                />
                {/* <MenuItem
                  icon={FileText}
                  text="Expense Claims"
                  permission="view_expenses"
                  subItems={[
                    { text: 'Reimbursement Claims', to: '/hrms/expenses/claims' },
                    { text: 'Claim Status Log', to: '/hrms/expenses/log' }
                  ]}
                /> */}
                {/* <MenuItem
                  icon={TrendingUp}
                  text="Performance & KPI"
                  permission="view_appraisals"
                  subItems={[
                    { text: 'Appraisal Ratings', to: '/hrms/performance/appraisals' },
                    { text: 'Employee Targets', to: '/hrms/performance/targets' }
                  ]}
                /> */}
                <MenuItem
                  icon={Settings}
                  text="HR Setup"
                  permission={['manage_hrms', 'view_shift_timings']}
                  subItems={[
                    { text: 'Department Master', to: '/department/list' },
                    // { text: 'Designation Master', to: '/designation/list' },
                    { text: 'Shift & Timings', to: '/hrms/setup/shifts' },
                    // { text: 'Master Settings', to: '/hrms/setup/master-settings' }
                  ]}
                />
                <MenuItem
                  icon={User}
                  text="My Profile"
                  to="/hrms/profile"
                />
              </MenuSection>

              <MenuSection
                title="REPORTS"
                defaultOpen={true}
                permission={['view_reports', 'view_sales', 'view_purchases', 'view_accounts']}
              >
                <MenuItem
                  icon={FileText}
                  text="Accounts Reports"
                  subItems={[
                    { text: 'All Accounts & Day Book', to: '/reports/accounts' },
                    { text: 'Customer Ledgers & Receivables', to: '/reports/accounts?tab=customers' },
                    { text: 'Supplier Ledgers & Payables', to: '/reports/accounts?tab=suppliers' },
                    { text: 'Financial Statements (TB, P&L, BS)', to: '/reports/accounts?tab=financial' },
                    { text: 'Aging & Outstandings', to: '/reports/accounts?tab=aging' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Stock Reports"
                  subItems={[
                    { text: 'Stock Reports', to: '/reports/stock/ledger' },
                    { text: 'Product Reports', to: '/reports/stock/product' },
                    { text: 'Control Reports', to: '/reports/stock/control' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Sales Reports"
                  subItems={[
                    { text: 'All Sales & Invoices', to: '/reports/sales' },
                    { text: 'Daily & Monthly Turnover', to: '/reports/sales?tab=daily-monthly' },
                    { text: 'Product-wise & Top Selling', to: '/reports/sales?tab=products' },
                    { text: 'Customer-wise Performance', to: '/reports/sales?tab=customers' },
                    { text: 'Sales Returns & Refunds', to: '/reports/sales?tab=returns' },
                    { text: 'Branch & Warehouse Sales', to: '/reports/sales?tab=branches' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Purchase Reports"
                  subItems={[
                    { text: 'All Purchases & Bills', to: '/reports/purchases' },
                    { text: 'Daily & Monthly Turnover', to: '/reports/purchases?tab=daily-monthly' },
                    { text: 'Supplier-wise & Top Vendors', to: '/reports/purchases?tab=suppliers' },
                    { text: 'Product & Item Procurement', to: '/reports/purchases?tab=products' },
                    { text: 'Branch & Warehouse Inwards', to: '/reports/purchases?tab=branches' },
                    { text: 'Returns & Debit Notes', to: '/reports/purchases?tab=returns' },
                    { text: 'Taxes (GST Paid) & Financials', to: '/reports/purchases?tab=financial' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="MIS Reports"
                  to="/reports/mis"
                />
                <MenuItem
                  icon={FileText}
                  text="GST Reports"
                  subItems={[
                    { text: 'GST Sales', to: '/reports/gst/sales' },
                    { text: 'GST Purchase', to: '/reports/gst/purchase' },
                    { text: 'Tax Analysis', to: '/reports/gst/tax-analysis' },
                    { text: 'Reconciliation', to: '/reports/gst/reconciliation' }
                  ]}
                />
                {/* <MenuItem
                  icon={FileText}
                  text="TDS Reports"
                  subItems={[
                    { text: 'TDS Sales', to: '/reports/tds/sales' },
                    { text: 'TDS Purchase', to: '/reports/tds/purchase' },
                    { text: 'Tax Analysis', to: '/reports/tds/tax-analysis' },
                    { text: 'Reconciliation', to: '/reports/tds/reconciliation' }
                  ]}
                /> */}
              </MenuSection>

              <MenuSection
                title="SETUP"
                defaultOpen={true}
                permission={['manage_settings', 'view_roles', 'view_users']}
              >
                <MenuItem icon={Settings} text="System Settings" to="/setup/system-settings" permission="manage_settings" />
                <MenuItem icon={Repeat} text="Backup & Restore" to="/setup/backup-restore" permission="manage_settings" />
              </MenuSection>
            </>
          )}

        </div>

        {/* ── Logout Button (fixed at bottom) ── */}
        <div className="flex-shrink-0 border-t border-slate-700/60 p-3" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all group"
          >
            <div className="w-7 h-7 flex items-center justify-center bg-rose-500/10 rounded-md group-hover:bg-rose-500/20 transition-colors">
              <LogOut size={14} className="text-rose-400" />
            </div>
            <span>Logout</span>
            <span className="ml-auto text-[9px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
              {localStorage.getItem('userName') || 'User'}
            </span>
          </button>
        </div>

        {/* ── Logout Confirm Modal — Portal so it renders on document.body ── */}
        {showLogoutConfirm && createPortal(
          <div
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Stop click propagation so clicking card doesn't close */}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                width: '340px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ background: '#fff1f2', padding: '20px 24px 16px', borderBottom: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#ffe4e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={20} color="#e11d48" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Confirm Logout</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>Kya aap sach mein logout karna chahte hain?</p>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '18px 24px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Logout karne ke baad aapka session end ho jayega aur aapko wapas <strong>Login Page</strong> pe redirect kiya jayega.
                </p>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 24px 22px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#e11d48', fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <LogOut size={13} color="#fff" />
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
