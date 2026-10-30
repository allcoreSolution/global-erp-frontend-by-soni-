import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Calculator,
  User,
  UserCheck,
  Briefcase,
  Layers,
  Banknote,
  Repeat,
  RotateCcw,
  Receipt,
  CreditCard,
  Building,
  Building2,
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
  MessageSquare,
  Mail,
  CloudUpload,
  Trash,
  Trash2,
  ShieldCheck,
  Bell,
  LogOut
} from 'lucide-react';
import { usePermissions } from '../utils/permissionUtils';

const SidebarContext = createContext();

const resolveItemModule = (text, to) => {
  const t = (text || '').toLowerCase();
  const path = (to || '').toLowerCase();

  if (path === '/setup/user-master' || t.includes('user & role')) {
    return 'user_master';
  }

  if (path.startsWith('/employees') || path.startsWith('/hrms') || path.startsWith('/department') || path.startsWith('/designation') || t.includes('employee') || t.includes('attendance') || t.includes('payroll') || t.includes('hrms') || t.includes('leave') || t.includes('holiday') || t.includes('shift') || t.includes('salary')) {
    if (path.includes('attendance') || t.includes('attendance')) return 'Attendance';
    if (path.includes('payroll') || path.includes('salary') || t.includes('payroll') || t.includes('salary') || t.includes('slip')) return 'Payroll';
    if (path.includes('leave') || path.includes('holiday') || t.includes('leave') || t.includes('holiday')) return 'Leave';
    return 'HRMS';
  }
  if (path.startsWith('/sales') || t.includes('sale') || t.includes('credit note') || t.includes('challan') || t.includes('packing slip')) {
    return 'Sales';
  }
  if (path.startsWith('/purchases') || path.startsWith('/suppliers') || t.includes('purchase') || t.includes('supplier') || t.includes('debit note')) {
    return 'Purchase';
  }
  if (path.startsWith('/products') || path.startsWith('/warehouse') || path.startsWith('/stock-') || t.includes('product') || t.includes('warehouse') || t.includes('stock') || t.includes('item')) {
    return 'Inventory';
  }
  if (path.startsWith('/customers') || t.includes('customer')) {
    return 'Customers';
  }
  if (path.startsWith('/receipt') || path.startsWith('/payment') || path.startsWith('/bank-') || path.startsWith('/contra') || path.startsWith('/day-book') || t.includes('receipt') || t.includes('payment') || t.includes('contra') || t.includes('day book')) {
    return 'Accounts';
  }
  if (path.startsWith('/reports') || t.includes('report')) {
    return 'Reports';
  }
  if (path.startsWith('/setup') || path.startsWith('/company') || path.startsWith('/branch') || path.startsWith('/tax') || t.includes('settings') || t.includes('branch') || t.includes('tax')) {
    return 'Settings';
  }
  if (path === '/' || t === 'dashboard') {
    return 'Dashboard';
  }
  return null;
};

const MenuItem = ({ icon: Icon, text, hasDropdown, active = false, shortcut = '', to = "/coming-soon", subItems, permission, module }) => {
  const { openMenu, setOpenMenu } = useContext(SidebarContext);
  const { can, canRoute, isSuperAdmin, isAdmin, canModule } = usePermissions();
  const location = useLocation();
  const isOpen = openMenu === text;

  // 1. Subscription Plan Module Check (applies to all tenant users including company Admin)
  const itemModule = module || resolveItemModule(text, to);
  if (!isSuperAdmin && itemModule && !canModule(itemModule)) {
    return null;
  }

  // 2. Direct permission check (for staff users)
  if (!isSuperAdmin && !isAdmin && permission && !can(permission)) {
    return null;
  }

  // Auto-open parent dropdown if current route matches one of the subItems
  useEffect(() => {
    if (subItems && subItems.length > 0) {
      const isCurrentRouteInSubItems = subItems.some(sub => sub.to && location.pathname.startsWith(sub.to.split('?')[0]));
      if (isCurrentRouteInSubItems && !openMenu) {
        setOpenMenu(text);
      }
    }
  }, [location.pathname]);

  if (subItems && subItems.length > 0) {
    // Filter subItems based on module subscription and staff permissions
    const permittedSubItems = subItems.filter(sub => {
      const subModule = sub.module || resolveItemModule(sub.text, sub.to);
      if (!isSuperAdmin && subModule && !canModule(subModule)) return false;
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
          className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors text-xs hover:bg-slate-800 hover:text-white ${isOpen ? 'text-white bg-slate-800/80 font-medium' : 'text-gray-300'}`}
        >
          <div className="flex items-center gap-2.5">
            <Icon size={14} className={isOpen ? "text-blue-400" : "text-gray-400"} />
            <span>{text}</span>
          </div>
          <div>
            {isOpen ? <ChevronDown size={14} className="text-blue-400" /> : <ChevronRight size={14} className="text-gray-400" />}
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
      onClick={() => setOpenMenu(null)}
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

const MenuSection = ({ title, module, children, defaultOpen = false, permission }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { can, isSuperAdmin, isAdmin, canModule } = usePermissions();

  const sectionModule = module || (title === 'HRMS' ? 'HRMS' : title === 'REPORTS' ? 'Reports' : null);
  if (!isSuperAdmin && sectionModule && !canModule(sectionModule)) {
    return null;
  }

  if (!isSuperAdmin && !isAdmin && permission && !can(permission)) {
    return null;
  }

  // Filter children to verify that at least one valid item is subscribed
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.filter(child => {
    if (!React.isValidElement(child)) return false;
    const childModule = child.props.module || resolveItemModule(child.props.text, child.props.to);
    if (!isSuperAdmin && childModule && !canModule(childModule)) return false;
    if (!isSuperAdmin && !isAdmin && child.props.permission && !can(child.props.permission)) return false;
    return true;
  });

  if (!isSuperAdmin && visibleChildren.length === 0) {
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

const SUPER_ADMIN_SECTIONS = [
  {
    id: 'company_tenant',
    title: 'COMPANY & TENANT',
    items: [
      { text: 'Subscriptions', to: '/super-admin/subscriptions', icon: CreditCard },
      { text: 'Plans & Pricing', to: '/super-admin/plans', icon: Tag },
      { text: 'Modules', to: '/super-admin/modules', icon: Grid },
      { text: 'Companies', to: '/super-admin/companies', icon: Building2 },
    ]
  },
  {
    id: 'users_roles',
    title: 'USERS & ROLES',
    items: [
      { text: 'All Employees', to: '/super-admin/users', icon: Users },
      { text: 'User Activity & Logs', to: '/super-admin/user-activity', icon: Clock },
    ]
  },
  {
    id: 'support_communication',
    title: 'SUPPORT & COMMUNICATION',
    items: [
      { text: 'Company Support Tickets', to: '/super-admin/support', icon: MessageSquare },
      { text: 'Notifications & Broadcasts', to: '/super-admin/notifications', icon: Bell },
    ]
  },
  {
    id: 'system_settings',
    title: 'SYSTEM & SETTINGS',
    items: [
      { text: 'Backup & Restore', to: '/super-admin/backup', icon: CloudUpload },
    ]
  }
];

const Sidebar = ({ onClose, onToggleDesktop }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [companyTheme, setCompanyTheme] = useState({ name: 'GLOBAL ERP', logoUrl: '', themeColor: '#0a192f' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [collapsedSuperAdminSections, setCollapsedSuperAdminSections] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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

  const userRole = localStorage.getItem('userRole');
  const isSuperAdminMode = userRole === 'SuperAdmin' || location.pathname.startsWith('/super-admin');

  const toggleSuperAdminSection = (id) => {
    setCollapsedSuperAdminSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    const loadTheme = () => {
      // 1. Read dynamically switched company name
      const activeName = localStorage.getItem('companyName') || localStorage.getItem('erp_company');
      const userStr = localStorage.getItem('user');
      let userComp = {};
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.company) {
            userComp = userObj.company;
          }
        } catch (e) {
          console.error('Failed to parse user for theme', e);
        }
      }

      setCompanyTheme({
        name: activeName || userComp.name || 'GLOBAL ERP',
        logoUrl: userComp.logoUrl || '',
        themeColor: userComp.themeColor || '#0a192f'
      });
    };

    loadTheme();
    window.addEventListener('userUpdated', loadTheme);
    window.addEventListener('companySwitched', loadTheme);
    window.addEventListener('erp_config_changed', loadTheme);
    return () => {
      window.removeEventListener('userUpdated', loadTheme);
      window.removeEventListener('companySwitched', loadTheme);
      window.removeEventListener('erp_config_changed', loadTheme);
    };
  }, []);

  if (isSuperAdminMode) {
    return (
      <div className="w-[270px] text-white flex-shrink-0 flex flex-col h-full overflow-hidden select-none bg-[#070d1e] border-r border-slate-800/80">
        {/* Header / Brand matching user screenshot */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60 bg-[#070d1e]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0 border border-white/20">
              <img
                src="/image-removebg-preview (1).png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/image-removebg-preview (1).png";
                }}
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-[15px] font-bold text-white leading-tight truncate">
                AllCore Solution
              </div>
              <div className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase leading-none mt-1">
                SUPER ADMIN PANEL
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose || onToggleDesktop}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 overflow-x-hidden no-scrollbar space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/super-admin"
            end
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-[13px] font-medium
              ${isActive || location.pathname === '/super-admin'
                ? 'text-white font-semibold hover:bg-white/5'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Home size={18} className={(isActive || location.pathname === '/super-admin') ? 'text-white' : 'text-slate-400'} />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          {/* Collapsible Sections */}
          {SUPER_ADMIN_SECTIONS.map((section) => {
            const isCollapsed = collapsedSuperAdminSections[section.id];
            return (
              <div key={section.id} className="pt-2">
                <div
                  onClick={() => toggleSuperAdminSection(section.id)}
                  className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer select-none uppercase"
                >
                  <span>{section.title}</span>
                  {isCollapsed ? (
                    <ChevronDown size={14} className="text-slate-400" />
                  ) : (
                    <ChevronUp size={14} className="text-slate-400" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-[13px] font-medium group
                          ${isActive
                            ? 'text-white font-semibold hover:bg-white/5'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                            <span className="truncate">{item.text}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pinned Profile & Sign Out Container */}
        <div className="px-3 py-2.5 border-t border-slate-800/60 bg-[#070d1e] space-y-2">
          <NavLink
            to="/super-admin/profile"
            className={({ isActive }) => `
              w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all
              ${isActive
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <User size={15} className="text-purple-400" />
            <span>Admin Profile</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#e5252a] hover:bg-[#d01f24] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Logout Modal */}
        {showLogoutConfirm && createPortal(
          <div
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
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
              <div style={{ background: '#fff1f2', padding: '20px 24px 16px', borderBottom: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#ffe4e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={20} color="#e11d48" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Confirm Logout</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>Are you sure you want to sign out?</p>
                </div>
              </div>
              <div style={{ padding: '18px 24px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Signing out will end your current session and return you to the login screen.
                </p>
              </div>
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
                  Sign Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

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
            <MenuItem icon={LayoutDashboard} text="Dashboard" to="/" />
          </div>

          <MenuSection
            title="MASTERS"
            defaultOpen={true}
            permission={['manage_company', 'view_company', 'view_contacts', 'view_suppliers', 'view_warehouses', 'view_products', 'view_price_lists', 'view_tax_slabs', 'view_branches']}
          >
            <MenuItem icon={Building2} text="Company Master" to="/company/company-master" permission="view_company" />
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
                { text: 'Add Adjustment', to: '/products/add-adjustment', permission: 'create_adjustments' },
                { text: 'Adjustment List', to: '/products/adjustment-list', permission: 'view_adjustments' },
                { text: 'Supplier Ledger', to: '/products/ledger', permission: ['view_ledgers', 'view_suppliers', 'view_purchases', 'view_products'] }
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
                { text: 'Sale Exchange List', to: '/sales/sale-exchange-list', permission: ['view_sales', 'manage_sales'] },
                { text: 'Customer Ledger', to: '/sales/customer-ledger', permission: ['view_sales', 'manage_sales'] }
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
            <MenuItem
              icon={ShieldCheck}
              text="Pharma Compliance Hub"
              subItems={[
                { text: 'Quarantine & Inspection', to: '/pharma/operations?tab=quarantine' },
                { text: 'Batch Recall & Traceability', to: '/pharma/operations?tab=traceability' },
                { text: 'Near-Expiry FEFO Alerts', to: '/pharma/operations?tab=near-expiry' },
                { text: 'Damage & Expiry Write-Off', to: '/pharma/operations?tab=write-off' }
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
            permission={['manage_settings', 'view_roles', 'view_users', 'view_company']}
          >
            <MenuItem
              icon={Building}
              text="Company Profile"
              permission="view_company"
              subItems={[
                { text: 'Company Profile', to: '/company/profile', permission: 'view_company' },
                { text: 'Business Settings', to: '/company/business-settings', permission: 'view_company' }
              ]}
            />
            <MenuItem icon={Settings} text="System Settings" to="/setup/system-settings" permission="manage_settings" />
            <MenuItem icon={Bell} text="Notifications & Broadcast" to="/setup/notifications" />
            <MenuItem icon={Repeat} text="Backup & Restore" to="/setup/backup-restore" permission="manage_settings" />
          </MenuSection>
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
