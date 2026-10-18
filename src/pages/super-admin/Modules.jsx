import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Grid,
  Layers,
  Users,
  Building2,
  Warehouse,
  CheckCircle2,
  Sparkles,
  Eye,
  RefreshCw,
  Search,
  ShoppingCart,
  Package,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  LayoutDashboard,
  Clock,
  Plane,
  Coins,
  LineChart,
  Sliders,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import api from '../../api';

// Icon and Visual Styling mapping for each module key
const MODULE_VISUALS = {
  Dashboard: {
    icon: LayoutDashboard,
    category: 'Analytics & Management',
    color: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    subFeatures: ['Live KPI Widgets', 'Revenue & Sales Charts', 'Pending Task Summary']
  },
  Sales: {
    icon: ShoppingCart,
    category: 'Core Commerce',
    color: 'from-indigo-500 to-blue-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
    subFeatures: ['GST Tax Invoices', 'POS Quick Billing', 'Delivery Challans & Dispatch']
  },
  Purchase: {
    icon: Package,
    category: 'Core Commerce',
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
    subFeatures: ['Purchase Orders (PO)', 'Inward Goods Entry', 'Supplier Debit Notes']
  },
  Inventory: {
    icon: Warehouse,
    category: 'Stock & Logistics',
    color: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
    subFeatures: ['Multi-Warehouse Tracking', 'Product Variants & Barcodes', 'Stock Adjustments & Counts']
  },
  Customers: {
    icon: Users,
    category: 'Customer CRM',
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
    subFeatures: ['Customer Directory', 'Credit Limits & Aging', 'Transaction Ledgers']
  },
  Accounts: {
    icon: FileText,
    category: 'Finance & Accounts',
    color: 'from-rose-500 to-pink-600',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    subFeatures: ['Day Book & Ledgers', 'Bank & Cash Vouchers', 'Contra & Journal Entries']
  },
  HRMS: {
    icon: ShieldCheck,
    category: 'Workforce & HR',
    color: 'from-violet-500 to-purple-600',
    badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800/40',
    subFeatures: ['Staff Directory', 'Departments & Roles', 'Performance Appraisals']
  },
  Attendance: {
    icon: Clock,
    category: 'Workforce & HR',
    color: 'from-teal-500 to-emerald-600',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/40',
    subFeatures: ['Daily Punch In/Out', 'Shift Timing Setup', 'Overtime & Late Logs']
  },
  Leave: {
    icon: Calendar,
    category: 'Workforce & HR',
    color: 'from-orange-500 to-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    subFeatures: ['Leave Applications & Approvals', 'Paid & Sick Leaves', 'Holiday Calendar']
  },
  Payroll: {
    icon: Coins,
    category: 'Finance & Accounts',
    color: 'from-emerald-500 to-green-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    subFeatures: ['Salary Structure Builder', 'Automated Payslip PDF', 'PF & ESI Statutory Logs']
  },
  Reports: {
    icon: LineChart,
    category: 'Analytics & Management',
    color: 'from-sky-500 to-cyan-600',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/40',
    subFeatures: ['P&L & Balance Sheet', 'GST GSTR-1 & 3B Reports', 'Stock Valuation & Aging']
  },
  Settings: {
    icon: Settings,
    category: 'System & Admin',
    color: 'from-slate-600 to-slate-800',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    subFeatures: ['Multi-Branch Setup', 'Tax Slabs & Price Lists', 'Company Master Preferences']
  }
};

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch real modules from Backend API using baseUrl
  const fetchModules = async () => {
    setLoading(true);
    setError('');
    try {
      // Calls backend endpoint /api/plans/modules
      const res = await api.get('/plans/modules');
      if (res.data && res.data.success && Array.isArray(res.data.modules)) {
        setModules(res.data.modules);
      } else if (Array.isArray(res.data)) {
        setModules(res.data);
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error('Failed to load modules from API:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to backend modules API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Filtered Modules List
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const visual = MODULE_VISUALS[m.key] || { category: 'Other' };
      const matchesSearch = 
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.key || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'commerce') return visual.category === 'Core Commerce' || visual.category === 'Stock & Logistics';
      if (categoryFilter === 'hr') return visual.category === 'Workforce & HR';
      if (categoryFilter === 'finance') return visual.category === 'Finance & Accounts';
      if (categoryFilter === 'analytics') return visual.category === 'Analytics & Management' || visual.category === 'System & Admin';
      return true;
    });
  }, [modules, searchTerm, categoryFilter]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = modules.length;
    let commerce = 0;
    let hr = 0;
    let finance = 0;
    let analytics = 0;

    modules.forEach(m => {
      const cat = MODULE_VISUALS[m.key]?.category;
      if (cat === 'Core Commerce' || cat === 'Stock & Logistics') commerce++;
      else if (cat === 'Workforce & HR') hr++;
      else if (cat === 'Finance & Accounts') finance++;
      else analytics++;
    });

    return { total, commerce, hr, finance, analytics };
  }, [modules]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full space-y-6">

        {/* ── TOP HEADER (FULL WIDTH) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Layers size={14} />
              <span>Super Admin Core Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ERP System Modules Registry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Live catalog of all core modules, subsystems, and business services available in Global ERP. These modules are dynamically toggled and packaged into client Subscription Plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchModules}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Refresh Modules from API"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <Link
              to="/super-admin/plans"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Configure in Plans</span>
            </Link>
          </div>
        </div>

        {/* ── METRICS SUMMARY STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Modules</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total} Modules</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commerce & Stock</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.commerce} Modules</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workforce & HR</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">{stats.hr} Modules</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Finance & Accounts</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.finance} Modules</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Analytics & Setup</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.analytics} Modules</span>
          </div>
        </div>

        {/* ── SEARCH & CATEGORY FILTER BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search module by name, key or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { key: 'all', label: 'All Modules' },
              { key: 'commerce', label: 'Commerce & Stock' },
              { key: 'hr', label: 'Workforce & HR' },
              { key: 'finance', label: 'Finance & Accounts' },
              { key: 'analytics', label: 'Analytics & Admin' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setCategoryFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── API ERROR STATE ── */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchModules}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── MODULES CARDS GRID ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <span className="text-xs font-bold text-slate-500">Loading modules from backend API...</span>
            </div>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Grid size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Modules Matched</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing the search input or changing the category filter.</p>
            <button
              onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
            {filteredModules.map((module) => {
              const visual = MODULE_VISUALS[module.key] || {
                icon: Layers,
                category: 'Service',
                color: 'from-indigo-500 to-blue-600',
                badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                subFeatures: ['Full CRUD Access', 'Role-based Isolation']
              };
              const IconComponent = visual.icon;

              return (
                <div
                  key={module.key}
                  className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-200 group"
                >
                  <div>
                    {/* Top Row: Category badge & Active status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${visual.badgeColor}`}>
                        {visual.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Ready</span>
                      </span>
                    </div>

                    {/* Icon + Module Name + Key badge */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${visual.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                        <IconComponent size={22} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                          {module.name}
                        </h2>
                        <span className="inline-block px-1.5 py-0.2 mt-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          key: "{module.key}"
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 min-h-[48px] leading-relaxed">
                      {module.description}
                    </p>

                    {/* Sub-Features Bullet Points */}
                    <div className="space-y-1.5 py-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Core Capabilities
                      </span>
                      {visual.subFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Action button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <Link
                      to="/super-admin/plans"
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700 transition font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Package into Plan</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Modules;
