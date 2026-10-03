import React, { useState, createContext, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
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

const SidebarContext = createContext();

const MenuItem = ({ icon: Icon, text, hasDropdown, active = false, shortcut = '', to = "/coming-soon", subItems }) => {
  const { openMenu, setOpenMenu } = useContext(SidebarContext);
  const isOpen = openMenu === text;

  if (subItems && subItems.length > 0) {
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
            {subItems.map((sub, idx) => (
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

const MenuSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
            <div className="relative w-10 h-10 flex items-center justify-center text-blue-500 bg-white/10 rounded overflow-hidden">
              {companyTheme.logoUrl ? (
                <img src={companyTheme.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" />
                  <path d="M12 9l3 7H9l3-7z" fill="#3b82f6" />
                </svg>
              )}
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
              <MenuSection title="MASTERS" defaultOpen={true}>
                <MenuItem icon={User} text="Customer Master" to="/customers/customer-master" />
                <MenuItem icon={Truck} text="Supplier Master" to="/suppliers/supplier-master" />
                <MenuItem icon={Building} text="Warehouse Master" to="/warehouse/master" />
                <MenuItem
                  icon={Package}
                  text="Item / Product Master"
                  subItems={[
                    { text: 'Add Purchase', to: '/purchases/add-purchase' },
                    { text: 'Purchase List', to: '/purchases/purchase-list' },
                    { text: 'Purchase Return', to: '/purchases/purchase-return' },
                    { text: 'Brand', to: '/products/brand' },
                    { text: 'Category', to: '/products/category' },
                    { text: 'Unit', to: '/products/unit' },
                    { text: 'Stock List', to: '/products/product-list' },
                    { text: 'Add Adjustment', to: '/products/add-adjustment' },
                    { text: 'Adjustment List', to: '/products/adjustment-list' },
                    { text: 'Group', to: '/products/group' },
                    { text: 'Ledger', to: '/products/ledger' }
                  ]}
                />

                <MenuItem
                  icon={FileText}
                  text="Price List Master"
                  subItems={[
                    { text: 'Price List', to: '/price-list/list' },
                    { text: 'Pricing Rules', to: '/price-list/rules' }
                  ]}
                />
                <MenuItem
                  icon={Calculator}
                  text="Tax Master"
                  subItems={[
                    { text: 'Tax Configuration', to: '/tax/config' }
                  ]}
                />

                <MenuItem
                  icon={Building}
                  text="Company Master"
                  subItems={[
                    { text: 'Company Profile', to: '/company/profile' },
                    { text: 'Business Settings', to: '/company/business-settings' }
                  ]}
                />
                <MenuItem
                  icon={Layers}
                  text="Branch Master"
                  to="/branch/info"
                />

              </MenuSection>

              <MenuSection title="TRANSACTIONS" defaultOpen={true}>
                <MenuItem
                  icon={ShoppingCart}
                  text="Sales"
                  subItems={[
                    { text: 'Add Sale', to: '/sales/add-sale' },
                    { text: 'Sale List', to: '/sales/sale-list' },
                    { text: 'Packing Slip List', to: '/sales/packing-slip-list' },
                    { text: 'Challan List', to: '/sales/challan-list' },



                    { text: 'Courier List', to: '/sales/courier-list' },
                    { text: 'Sale Return', to: '/sales/sale-return' },
                    { text: 'Sale Exchange List', to: '/sales/sale-exchange-list' }
                  ]}
                />

                <MenuItem
                  icon={Receipt}
                  text="Receipt"
                  subItems={[
                    { text: 'Receipt List', to: '/receipt/list' },
                    { text: 'New Receipt', to: '/receipt/new' }
                  ]}
                />
                <MenuItem
                  icon={CreditCard}
                  text="Payment"
                  subItems={[
                    { text: 'Payment List', to: '/payment/list' },
                    { text: 'New Payment', to: '/payment/new' }
                  ]}
                />
                <MenuItem
                  icon={Banknote}
                  text="Bank Receipt"
                  subItems={[
                    { text: 'Bank Receipt List', to: '/bank-receipt/list' },
                    { text: 'New Bank Receipt', to: '/bank-receipt/new' }
                  ]}
                />
                <MenuItem
                  icon={CreditCard}
                  text="Bank Payment"
                  subItems={[
                    { text: 'Bank Payment List', to: '/bank-payment/list' },
                    { text: 'New Bank Payment', to: '/bank-payment/new' }
                  ]}
                />
                <MenuItem
                  icon={Repeat}
                  text="Contra Entry"
                  subItems={[
                    { text: 'Contra List', to: '/contra/list' },
                    { text: 'New Contra', to: '/contra/new' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Journal Entry"
                  subItems={[
                    { text: 'Journal List', to: '/journal/list' },
                    { text: 'New Journal', to: '/journal/new' }
                  ]}
                />
                <MenuItem
                  icon={Package}
                  text="Stock Entry"
                  subItems={[
                    { text: 'Stock Entry List', to: '/stock-entry/list' },
                    { text: 'New Stock Entry', to: '/stock-entry/new' }
                  ]}
                />
                <MenuItem
                  icon={Repeat}
                  text="Stock Transfer"
                  subItems={[
                    { text: 'Transfer List', to: '/stock-transfer/list' },
                    { text: 'New Transfer', to: '/stock-transfer/new' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Debit Note"
                  subItems={[
                    { text: 'Debit Note List', to: '/debit-note/list' },
                    { text: 'New Debit Note', to: '/debit-note/new' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Credit Note"
                  subItems={[
                    { text: 'Credit Note List', to: '/credit-note/list' },
                    { text: 'New Credit Note', to: '/credit-note/new' }
                  ]}
                />
                <MenuItem icon={FileText} text="Day Book" to="/day-book" />
              </MenuSection>

              <MenuSection title="HRMS" defaultOpen={true}>
                <MenuItem
                  icon={Users}
                  text="Employee Management"
                  subItems={[
                    { text: 'Employee List', to: '/employees/list' },
                    { text: 'Add Employee', to: '/employees/profile' }
                  ]}
                />
                <MenuItem
                  icon={Calendar}
                  text="Attendance & Leave"
                  subItems={[
                    { text: 'Daily Attendance', to: '/hrms/attendance/daily' },
                    { text: 'Leave Requests', to: '/hrms/attendance/leaves' },
                    { text: 'Holiday Calendar', to: '/hrms/attendance/holidays' }
                  ]}
                />
                <MenuItem
                  icon={Calculator}
                  text="Payroll & Salary"
                  subItems={[
                    { text: 'Salary Structure', to: '/hrms/payroll/structure' },
                    { text: 'Generate Pay Slips', to: '/hrms/payroll/slips' },
                    { text: 'PF & ESI Reports', to: '/hrms/payroll/pf-esi' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Expense Claims"
                  subItems={[
                    { text: 'Reimbursement Claims', to: '/hrms/expenses/claims' },
                    { text: 'Claim Status Log', to: '/hrms/expenses/log' }
                  ]}
                />
                <MenuItem
                  icon={TrendingUp}
                  text="Performance & KPI"
                  subItems={[
                    { text: 'Appraisal Ratings', to: '/hrms/performance/appraisals' },
                    { text: 'Employee Targets', to: '/hrms/performance/targets' }
                  ]}
                />
                <MenuItem
                  icon={Settings}
                  text="HR Setup"
                  subItems={[
                    { text: 'Department Master', to: '/department/list' },
                    { text: 'Designation Master', to: '/designation/list' },
                    { text: 'Shift & Timings', to: '/hrms/setup/shifts' },
                    { text: 'Master Settings', to: '/hrms/setup/master-settings' }
                  ]}
                />
              </MenuSection>

              <MenuSection title="REPORTS" defaultOpen={true}>
                <MenuItem
                  icon={FileText}
                  text="Accounts Reports"
                  subItems={[
                    { text: 'Ledger & Voucher Reports', to: '/reports/accounts/ledger-voucher' },
                    { text: 'Financial Reports', to: '/reports/accounts/financial' },
                    { text: 'Analysis', to: '/reports/accounts/analysis' }
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
                    { text: 'Sales Summary', to: '/reports/sales/summary' },
                    { text: 'Analysis', to: '/reports/sales/analysis' },
                    { text: 'Financial', to: '/reports/sales/financial' },
                    { text: 'Top Performance', to: '/reports/sales/performance' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="Purchase Reports"
                  subItems={[
                    { text: 'Purchase Summary', to: '/reports/purchases/summary' },
                    { text: 'Analysis', to: '/reports/purchases/analysis' },
                    { text: 'Financial', to: '/reports/purchases/financial' },
                    { text: 'Performance', to: '/reports/purchases/performance' }
                  ]}
                />
                <MenuItem
                  icon={FileText}
                  text="MIS Reports"
                  subItems={[
                    { text: 'Management Dashboard', to: '/reports/mis/management-dashboard' },
                    { text: 'Performance Analysis', to: '/reports/mis/performance-analysis' },
                    { text: 'Business Analysis', to: '/reports/mis/business-analysis' },
                    { text: 'KPI Reports', to: '/reports/mis/kpi-reports' }
                  ]}
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
                <MenuItem
                  icon={FileText}
                  text="TDS Reports"
                  subItems={[
                    { text: 'TDS Sales', to: '/reports/tds/sales' },
                    { text: 'TDS Purchase', to: '/reports/tds/purchase' },
                    { text: 'Tax Analysis', to: '/reports/tds/tax-analysis' },
                    { text: 'Reconciliation', to: '/reports/tds/reconciliation' }
                  ]}
                />
              </MenuSection>

              <MenuSection title="SETUP" defaultOpen={true}>
                <MenuItem icon={Settings} text="System Settings" to="/setup/system-settings" />
                <MenuItem icon={Repeat} text="Backup & Restore" to="/setup/backup-restore" />
                <MenuItem
                  icon={Users}
                  text="User & Role Master"
                  subItems={[
                    { text: 'User Master', to: '/setup/user-master' },
                    { text: 'Role Master', to: '/setup/role-master' }
                  ]}
                />
              </MenuSection>
            </>
          )}

        </div>


      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
