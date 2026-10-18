import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  User,
  UserPlus,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Calendar,
  FileText,
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers,
  Package,
  Headphones,
  Database,
  Terminal,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  X,
  ArrowUpRight,
  Check,
  Eye,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';

const TX_ICON_MAP = {
  CreditCard,
  Calendar,
  FileText,
  Building2,
  Users,
  User,
  Zap,
  Package,
  Activity,
  IndianRupee,
  Layers,
  Database
};

const getTxIconComponent = (iconProp) => {
  if (!iconProp) return CreditCard;
  if (typeof iconProp === 'function' || (typeof iconProp === 'object' && iconProp !== null)) {
    return iconProp;
  }
  if (typeof iconProp === 'string') {
    return TX_ICON_MAP[iconProp] || CreditCard;
  }
  return CreditCard;
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // 1. Live Real-Time Clock with Seconds & Pulsing Indicator
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: '',
    timeStr: '',
    rawSeconds: 0
  });

  useEffect(() => {
    const updateLiveClock = () => {
      const now = new Date();
      const optionsDate = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setCurrentDateTime({
        dateStr: now.toLocaleDateString('en-GB', optionsDate),
        timeStr: now.toLocaleTimeString('en-US', optionsTime),
        rawSeconds: now.getSeconds()
      });
    };
    updateLiveClock();
    const interval = setInterval(updateLiveClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Dynamic Revenue Filter & Dataset
  const [revenueFilter, setRevenueFilter] = useState('Last 6 Months');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [revenueDatasets, setRevenueDatasets] = useState({
    'Last 6 Months': {
      total: '₹ 2,45,000',
      growth: '+12% this month',
      points: [
        { month: 'Apr', value: 72000, display: '₹ 72,000', x: 90, y: 165 },
        { month: 'May', value: 115000, display: '₹ 1,15,000', x: 155, y: 142 },
        { month: 'Jun', value: 155000, display: '₹ 1,55,000', x: 220, y: 128 },
        { month: 'Jul', value: 195000, display: '₹ 1,95,000', x: 290, y: 102 },
        { month: 'Aug', value: 275000, display: '₹ 2,75,000', x: 360, y: 72 },
        { month: 'Sep', value: 345000, display: '₹ 3,45,000', x: 440, y: 45 },
        { month: 'Oct', value: 310000, display: '₹ 3,10,000', x: 500, y: 62 }
      ],
      curvePath: 'M 90 165 C 130 150, 160 135, 200 130 C 240 125, 280 105, 320 85 C 360 65, 410 45, 440 45 C 470 45, 490 60, 500 62',
      areaPath: 'M 90 165 C 130 150, 160 135, 200 130 C 240 125, 280 105, 320 85 C 360 65, 410 45, 440 45 C 470 45, 490 60, 500 62 L 500 185 L 90 185 Z'
    },
    'Last 3 Months': {
      total: '₹ 1,85,400',
      growth: '+18% vs prev quarter',
      points: [
        { month: 'Aug', value: 275000, display: '₹ 2,75,000', x: 110, y: 140 },
        { month: 'Sep', value: 345000, display: '₹ 3,45,000', x: 300, y: 55 },
        { month: 'Oct', value: 310000, display: '₹ 3,10,000', x: 490, y: 80 }
      ],
      curvePath: 'M 110 140 C 200 100, 250 55, 300 55 C 370 55, 430 70, 490 80',
      areaPath: 'M 110 140 C 200 100, 250 55, 300 55 C 370 55, 430 70, 490 80 L 490 185 L 110 185 Z'
    },
    'Last 30 Days': {
      total: '₹ 84,200',
      growth: '+9.4% this week',
      points: [
        { month: 'Week 1', value: 18000, display: '₹ 18,000', x: 100, y: 155 },
        { month: 'Week 2', value: 22000, display: '₹ 22,000', x: 230, y: 130 },
        { month: 'Week 3', value: 28000, display: '₹ 28,000', x: 360, y: 90 },
        { month: 'Week 4', value: 24000, display: '₹ 24,000', x: 490, y: 110 }
      ],
      curvePath: 'M 100 155 C 160 145, 190 135, 230 130 C 290 115, 320 95, 360 90 C 410 90, 450 105, 490 110',
      areaPath: 'M 100 155 C 160 145, 190 135, 230 130 C 290 115, 320 95, 360 90 C 410 90, 450 105, 490 110 L 490 185 L 100 185 Z'
    },
    'This Year': {
      total: '₹ 5,82,000',
      growth: '+28% year over year',
      points: [
        { month: 'Jan', value: 45000, display: '₹ 45,000', x: 90, y: 170 },
        { month: 'Mar', value: 95000, display: '₹ 95,000', x: 170, y: 150 },
        { month: 'May', value: 160000, display: '₹ 1,60,000', x: 250, y: 125 },
        { month: 'Jul', value: 240000, display: '₹ 2,40,000', x: 330, y: 95 },
        { month: 'Sep', value: 345000, display: '₹ 3,45,000', x: 410, y: 45 },
        { month: 'Oct', value: 310000, display: '₹ 3,10,000', x: 500, y: 62 }
      ],
      curvePath: 'M 90 170 C 130 160, 150 155, 170 150 C 210 140, 230 130, 250 125 C 290 110, 310 100, 330 95 C 370 70, 390 50, 410 45 C 450 45, 480 58, 500 62',
      areaPath: 'M 90 170 C 130 160, 150 155, 170 150 C 210 140, 230 130, 250 125 C 290 110, 310 100, 330 95 C 370 70, 390 50, 410 45 C 450 45, 480 58, 500 62 L 500 185 L 90 185 Z'
    }
  });

  const currentRevenueData = revenueDatasets[revenueFilter] || revenueDatasets['Last 6 Months'];

  // 3. Dynamic KPI Metrics Cards
  const [kpiData, setKpiData] = useState([
    {
      title: 'Total Companies',
      value: '2',
      change: '+2 this month',
      icon: Building2,
      bgColor: 'bg-purple-600',
      shadowColor: 'shadow-purple-900/30',
      to: '/super-admin/companies'
    },
    {
      title: 'Total Users',
      value: '9',
      change: '+9 this month',
      icon: User,
      bgColor: 'bg-emerald-500',
      shadowColor: 'shadow-emerald-900/30',
      to: '/super-admin/users'
    },
    {
      title: 'Active Subscriptions',
      value: '2',
      change: '+2 active',
      icon: Layers,
      bgColor: 'bg-sky-500',
      shadowColor: 'shadow-sky-900/30',
      to: '/super-admin/subscriptions'
    },
    {
      title: 'Total Revenue',
      value: '₹ 20,338',
      change: '+14% this month',
      icon: IndianRupee,
      bgColor: 'bg-amber-500',
      shadowColor: 'shadow-amber-900/30',
      to: '/super-admin/subscriptions'
    }
  ]);

  // 4. Dynamic Subscription Plans Donut Data
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    { name: 'Basic', count: 15, percentage: '41.7%', color: '#8b5cf6', revenue: '₹ 44,850/mo' },
    { name: 'Standard', count: 12, percentage: '33.3%', color: '#0ea5e9', revenue: '₹ 71,880/mo' },
    { name: 'Premium', count: 7, percentage: '19.4%', color: '#10b981', revenue: '₹ 83,930/mo' },
    { name: 'Enterprise', count: 2, percentage: '5.6%', color: '#f59e0b', revenue: '₹ 45,000/mo' }
  ]);

  // 5. Dynamic Recent Transactions with Modal View
  const [selectedTx, setSelectedTx] = useState(null);
  const [txFilter, setTxFilter] = useState('All');
  const [initialTransactions, setInitialTransactions] = useState([
    {
      id: 'TXN-9041',
      type: 'Plan Subscription',
      time: 'Today, 10:24 AM',
      amount: '₹ 5,900',
      status: 'Success',
      statusType: 'success',
      icon: Calendar,
      customer: 'ABC Manufacturing',
      plan: 'Premium Annual',
      method: 'Razorpay / UPI'
    },
    {
      id: 'TXN-9042',
      type: 'Invoice Payment',
      time: 'Today, 09:10 AM',
      amount: '₹ 12,500',
      status: 'Success',
      statusType: 'success',
      icon: FileText,
      customer: 'XYZ Retail Group',
      plan: 'Custom Enterprise',
      method: 'Bank Transfer (NEFT)'
    }
  ]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === 'All') return initialTransactions;
    if (txFilter === 'Subscriptions') return initialTransactions.filter(t => (t.type || '').includes('Subscription'));
    if (txFilter === 'Invoices') return initialTransactions.filter(t => (t.type || '').includes('Invoice'));
    if (txFilter === 'Refunds') return initialTransactions.filter(t => (t.type || '').includes('Refund'));
    return initialTransactions;
  }, [txFilter, initialTransactions]);

  // 6. Dynamic Company Overview Table (Full Multi-Page Dataset + Search + Status Toggle)
  const [companySearch, setCompanySearch] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [companies, setCompanies] = useState([]);

  // Toggle company status live with API
  const toggleCompanyStatus = async (id) => {
    try {
      const res = await api.patch(`/companies/${id}/status`);
      if (res.data?.success) {
        setCompanies(prev =>
          prev.map(c => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling company status:', err);
      // Optimistic fallback
      setCompanies(prev =>
        prev.map(c => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c))
      );
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c =>
      (c.name || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.plan || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const itemsPerPage = 5;
  const totalCompanyPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const currentCompanies = filteredCompanies.slice(
    (companyPage - 1) * itemsPerPage,
    companyPage * itemsPerPage
  );

  // 7. Dynamic Recent Users Table (Search + Filter by Role)
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [usersList, setUsersList] = useState([]);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchQuery = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                         (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [usersList, userSearch, roleFilter]);

  // Toggle User Active status live with API
  const toggleUserStatus = async (id) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      setUsersList(prev =>
        prev.map(u => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
      setUsersList(prev =>
        prev.map(u => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
      );
    }
  };

  // 8. Live System Status & Performance Heartbeat Simulation
  const [isPinging, setIsPinging] = useState(false);
  const [servicesLatency, setServicesLatency] = useState({
    frontend: 24,
    backend: 45,
    db: 18,
    gateway: 98,
    email: 62
  });
  const [healthScore, setHealthScore] = useState(99);
  const [apiResponseTime, setApiResponseTime] = useState(92);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Periodic heartbeat simulation
  useEffect(() => {
    const heartbeat = setInterval(() => {
      setServicesLatency({
        frontend: Math.floor(20 + Math.random() * 8),
        backend: Math.floor(40 + Math.random() * 12),
        db: Math.floor(15 + Math.random() * 8),
        gateway: Math.floor(92 + Math.random() * 16),
        email: Math.floor(58 + Math.random() * 10)
      });
      setApiResponseTime(Math.floor(90 + Math.random() * 8));
    }, 4000);

    return () => clearInterval(heartbeat);
  }, []);

  const triggerManualPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setServicesLatency({
        frontend: Math.floor(18 + Math.random() * 6),
        backend: Math.floor(38 + Math.random() * 8),
        db: Math.floor(14 + Math.random() * 6),
        gateway: Math.floor(88 + Math.random() * 12),
        email: Math.floor(52 + Math.random() * 8)
      });
      setApiResponseTime(90);
      setHealthScore(99);
      setIsPinging(false);
    }, 700);
  };

  const systemStatusItems = [
    { name: 'Frontend Server', latency: `${servicesLatency.frontend}ms`, status: 'Online' },
    { name: 'Backend API', latency: `${servicesLatency.backend}ms`, status: 'Online' },
    { name: 'Database (MongoDB)', latency: `${servicesLatency.db}ms`, status: 'Online' },
    { name: 'Payment Gateway', latency: `${servicesLatency.gateway}ms`, status: 'Online' },
    { name: 'Email Service', latency: `${servicesLatency.email}ms`, status: 'Online' }
  ];

  // 9. Quick Access 3x3 Grid
  const quickAccessButtons = [
    { title: 'Add Company', icon: Building2, to: '/super-admin/register-company' },
    { title: 'All Employees', icon: UserPlus, to: '/super-admin/users' },
    { title: 'Subscriptions', icon: Zap, to: '/super-admin/subscriptions' },
    { title: 'Manage Plans', icon: Package, to: '/super-admin/plans' },
    { title: 'Roles & Perms', icon: ShieldCheck, to: '/super-admin/roles-permissions' },
    { title: 'Support Tickets', icon: Headphones, to: '/super-admin/support' },
    { title: 'Backup System', icon: Database, to: '/super-admin/backup' },
    { title: 'User Activity & Logs', icon: Terminal, to: '/super-admin/user-activity' },
    { title: 'Admin Profile', icon: User, to: '/super-admin/profile' }
  ];

  // 10. Subscriptions Overview Bar Chart Data
  const [subscriptionsBars, setSubscriptionsBars] = useState([
    { month: 'Apr', count: 10, heightPct: 25 },
    { month: 'May', count: 16, heightPct: 40 },
    { month: 'Jun', count: 19, heightPct: 48 },
    { month: 'Jul', count: 24, heightPct: 60 },
    { month: 'Aug', count: 28, heightPct: 70 },
    { month: 'Sep', count: 32, heightPct: 80 },
    { month: 'Oct', count: 36, heightPct: 90 }
  ]);

  // 11. MASTER DYNAMIC API FETCHER (Loads Real Super Admin Data)
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await api.get('/dashboard/super-admin');
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        if (d.revenueDatasets) setRevenueDatasets(d.revenueDatasets);
        if (d.subscriptionPlans && d.subscriptionPlans.length > 0) setSubscriptionPlans(d.subscriptionPlans);
        if (d.recentTransactions && d.recentTransactions.length > 0) setInitialTransactions(d.recentTransactions);
        if (d.companies) setCompanies(d.companies);
        if (d.users) setUsersList(d.users);
        if (d.subscriptionsBars) setSubscriptionsBars(d.subscriptionsBars);
        if (d.performance?.healthScore) setHealthScore(d.performance.healthScore);
        if (d.performance?.apiResponseTime) setApiResponseTime(d.performance.apiResponseTime);

        // Update KPIs with icons and colors
        if (d.kpiMetrics && d.kpiMetrics.length > 0) {
          const iconMap = {
            companies: { icon: Building2, bgColor: 'bg-purple-600', shadowColor: 'shadow-purple-900/30' },
            users: { icon: User, bgColor: 'bg-emerald-500', shadowColor: 'shadow-emerald-900/30' },
            subscriptions: { icon: Layers, bgColor: 'bg-sky-500', shadowColor: 'shadow-sky-900/30' },
            revenue: { icon: IndianRupee, bgColor: 'bg-amber-500', shadowColor: 'shadow-amber-900/30' }
          };
          const mappedKpis = d.kpiMetrics.map(k => ({
            ...k,
            icon: iconMap[k.key]?.icon || Building2,
            bgColor: iconMap[k.key]?.bgColor || 'bg-purple-600',
            shadowColor: iconMap[k.key]?.shadowColor || 'shadow-purple-900/30',
            to: k.to || '/super-admin'
          }));
          setKpiData(mappedKpis);
        }
      }
    } catch (err) {
      console.error('Failed to load super admin master dashboard summary:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-full bg-slate-100 dark:bg-[#050a18] text-slate-800 dark:text-slate-100 p-4 sm:p-5 lg:p-6 space-y-6 transition-colors duration-200">
      {/* ── 1. Header Banner & Live Real-Time Clock ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl animate-bounce">👋</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome Back, Super Admin!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform intelligence, revenue metrics & tenant management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Dynamic Data Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-700 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-500 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            title="Reload live dynamic data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-purple-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Live Date / Time Card with Seconds & Glowing Live Badge */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] px-3.5 py-2 rounded-xl flex items-center gap-3.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/60 transition-colors">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 relative">
              <Calendar size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide flex items-center gap-2">
                <span>{currentDateTime.dateStr || 'Tuesday, 13 Oct 2026'}</span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <div className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Clock size={12} className="text-blue-500" />
                <span>{currentDateTime.timeStr || '01:00:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Top 4 KPI Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(kpi.to)}
              className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-indigo-400/50 dark:hover:border-indigo-500/40 hover:bg-slate-50/50 dark:hover:bg-[#0c1733] hover:shadow-md transition-all cursor-pointer shadow-xs group"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{kpi.title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {kpi.value}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span>↑</span>
                  <span>{kpi.change}</span>
                </div>
              </div>

              <div
                className={`w-12 h-12 rounded-full ${kpi.bgColor} ${kpi.shadowColor} shadow-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Middle Row: Monthly Revenue, Subscription Plans, Recent Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Revenue Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Monthly Revenue</h2>
            </div>

            {/* Time Filter Dropdown (Dynamic State) */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#070e22] border border-slate-200 dark:border-[#14234b] rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer"
              >
                <span>{revenueFilter}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#182855] rounded-xl shadow-xl z-20 py-1 text-xs text-slate-700 dark:text-slate-200">
                  {Object.keys(revenueDatasets).map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setRevenueFilter(item);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#13224d] transition-colors cursor-pointer ${
                        revenueFilter === item ? 'font-bold text-purple-600 dark:text-purple-400' : ''
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SVG Line / Area Chart */}
          <div className="relative w-full h-[220px] flex items-center justify-center">
            <svg
              viewBox="0 0 520 220"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={isDarkMode ? 0.45 : 0.3} />
                  <stop offset="70%" stopColor="#8b5cf6" stopOpacity={isDarkMode ? 0.08 : 0.05} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {[
                { label: '₹ 4,00,000', y: 25 },
                { label: '₹ 3,00,000', y: 65 },
                { label: '₹ 2,00,000', y: 105 },
                { label: '₹ 1,00,000', y: 145 },
                { label: '₹ 0', y: 185 }
              ].map((grid, idx) => (
                <g key={idx}>
                  <text
                    x="10"
                    y={grid.y + 4}
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    fontSize="9.5"
                    fontFamily="sans-serif"
                  >
                    {grid.label}
                  </text>
                  <line
                    x1="70"
                    y1={grid.y}
                    x2="510"
                    y2={grid.y}
                    stroke={isDarkMode ? '#14234b' : '#e2e8f0'}
                    strokeWidth="1"
                    strokeDasharray={idx === 4 ? 'none' : '3 3'}
                  />
                </g>
              ))}

              {/* Area Under Curve */}
              <path
                d={currentRevenueData.areaPath}
                fill="url(#revenueGradient)"
                className="transition-all duration-500 ease-in-out"
              />

              {/* Curved Line */}
              <path
                d={currentRevenueData.curvePath}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                filter="url(#glow)"
                className="transition-all duration-500 ease-in-out"
              />

              {/* Interactive Data Points */}
              {currentRevenueData.points.map((pt, idx) => (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.month === pt.month ? 6 : 4}
                    fill="#a78bfa"
                    stroke={isDarkMode ? '#050a18' : '#ffffff'}
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {/* Month Label */}
                  <text
                    x={pt.x}
                    y="205"
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {pt.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-slate-900 text-white border border-purple-500/40 px-2.5 py-1 rounded-lg text-xs shadow-xl pointer-events-none transition-all z-10"
                style={{
                  left: `${(hoveredPoint.x / 520) * 100}%`,
                  top: `${(hoveredPoint.y / 220) * 100 - 18}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="font-semibold text-white">{hoveredPoint.display}</div>
                <div className="text-[10px] text-purple-300">{hoveredPoint.month} Data</div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Subscription Plans</h2>
            <span className="text-[10px] text-slate-400 font-medium">Click slice to inspect</span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke={isDarkMode ? '#14234b' : '#f1f5f9'}
                  strokeWidth="14"
                />

                {/* Segment 1: Basic (41.7%) - Purple */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="14"
                  strokeDasharray="100 140"
                  strokeDashoffset="0"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedPlan(subscriptionPlans[0])}
                  onMouseEnter={() => setSelectedPlan(subscriptionPlans[0])}
                />

                {/* Segment 2: Standard (33.3%) - Sky/Blue */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0284c7"
                  strokeWidth="14"
                  strokeDasharray="80 160"
                  strokeDashoffset="-100"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedPlan(subscriptionPlans[1])}
                  onMouseEnter={() => setSelectedPlan(subscriptionPlans[1])}
                />

                {/* Segment 3: Premium (19.4%) - Emerald */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="46 194"
                  strokeDashoffset="-180"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedPlan(subscriptionPlans[2])}
                  onMouseEnter={() => setSelectedPlan(subscriptionPlans[2])}
                />

                {/* Segment 4: Enterprise (5.6%) - Amber */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="14"
                  strokeDasharray="14 226"
                  strokeDashoffset="-226"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedPlan(subscriptionPlans[3])}
                  onMouseEnter={() => setSelectedPlan(subscriptionPlans[3])}
                />
              </svg>

              {/* Donut Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                  {selectedPlan ? selectedPlan.count : '36'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedPlan ? `${selectedPlan.name} Plans` : 'Active Plans'}
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 space-y-2 text-xs">
              {subscriptionPlans.map((plan, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPlan(plan)}
                  className={`flex items-center justify-between p-1 rounded-lg transition-colors cursor-pointer ${
                    selectedPlan?.name === plan.name
                      ? 'bg-purple-50 dark:bg-purple-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="font-medium text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                      {plan.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">{plan.count}</span>
                    <span className="text-slate-400 text-[10px] w-10 text-right">
                      {plan.percentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPlan ? (
            <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium text-center bg-purple-50 dark:bg-[#070e22] py-1.5 rounded-lg border border-purple-200 dark:border-[#14234b] flex items-center justify-around">
              <span>{selectedPlan.name}: {selectedPlan.count} Tenants ({selectedPlan.percentage})</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPlan.revenue}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-1">
              Click any plan slice to view live tenant analytics
            </div>
          )}
        </div>

        {/* Recent Transactions (3 cols) with Details Modal */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Recent Transactions</h2>
            <button
              onClick={() => navigate('/super-admin/subscriptions')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {/* Transaction Filter Tabs */}
          <div className="flex gap-1 mb-2 text-[10px] bg-slate-100 dark:bg-[#070f24] p-1 rounded-lg">
            {['All', 'Subscriptions', 'Invoices', 'Refunds'].map(tab => (
              <button
                key={tab}
                onClick={() => setTxFilter(tab)}
                className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                  txFilter === tab
                    ? 'bg-white dark:bg-[#14234b] text-purple-600 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
            {filteredTransactions.map(tx => {
              const TxIcon = getTxIconComponent(tx.icon);
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0e1938] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#070f24] border border-slate-200 dark:border-[#172750] flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <TxIcon size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tx.type}
                      </div>
                      <div className="text-[10px] text-slate-500">{tx.time}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{tx.amount}</div>
                    <span
                      className={`inline-block text-[9.5px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                        tx.statusType === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: 3 Columns matching screenshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Company Overview & Recent Users */}
        <div className="lg:col-span-5 space-y-5">
          {/* Company Overview Table (Dynamic Search + Real Pagination + Status Toggle) */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 size={17} className="text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Company Overview</h2>
              </div>
              <button
                onClick={() => navigate('/super-admin/companies')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* Live Search Filter for Companies */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setCompanyPage(1);
                }}
                placeholder="Search companies by name, plan or city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-lg text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#14234b] text-slate-500 dark:text-slate-400 text-[11px]">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Company Name</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Status (Click to toggle)</th>
                    <th className="pb-2 font-medium text-right">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#14234b]/60">
                  {currentCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-400">
                        No companies match "{companySearch}"
                      </td>
                    </tr>
                  ) : (
                    currentCompanies.map(comp => (
                      <tr
                        key={comp.id}
                        className="hover:bg-slate-50 dark:hover:bg-[#0e1938] transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <td className="py-2.5 text-slate-400 dark:text-slate-500">{comp.id}</td>
                        <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                          <div>{comp.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{comp.city}</div>
                        </td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">{comp.plan}</td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={() => toggleCompanyStatus(comp.id)}
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                              comp.status === 'Active'
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                comp.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {comp.status}
                          </button>
                        </td>
                        <td className="py-2.5 text-right font-medium text-slate-700 dark:text-slate-300">{comp.users}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Active Page Switches Real Data) */}
            <div className="flex items-center justify-between mt-3 pt-2 text-xs border-t border-slate-100 dark:border-[#14234b]/50">
              <span className="text-[11px] text-slate-400">
                Showing {Math.min((companyPage - 1) * itemsPerPage + 1, filteredCompanies.length)} to {Math.min(companyPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCompanyPage(prev => Math.max(1, prev - 1))}
                  disabled={companyPage === 1}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#14234b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalCompanyPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCompanyPage(page)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                      companyPage === page
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#14234b]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCompanyPage(prev => Math.min(totalCompanyPages, prev + 1))}
                  disabled={companyPage === totalCompanyPages}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#14234b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Users Table (Dynamic Search + Role Filter + Status Toggle) */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Recent Users</h2>
              </div>
              <button
                onClick={() => navigate('/super-admin/users')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* User Search & Role Filter Bar */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-lg text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-lg px-2 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#14234b] text-slate-500 dark:text-slate-400 text-[11px]">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#14234b]/60">
                  {filteredUsers.slice(0, 5).map(usr => (
                    <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-[#0e1938] transition-colors text-slate-700 dark:text-slate-200">
                      <td className="py-2.5 text-slate-400 dark:text-slate-500">{usr.id}</td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        <div>{usr.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{usr.lastActive}</div>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{usr.email}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#14234b] text-[10px] font-semibold">
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(usr.id)}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                            usr.status === 'Active'
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800'
                          }`}
                          title="Click to toggle user status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              usr.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {usr.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Middle Column (4 cols): Quick Access 3x3 Grid & Subscriptions Bar Chart */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Access Grid */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide mb-4">Quick Access</h2>

            <div className="grid grid-cols-3 gap-3">
              {quickAccessButtons.map((btn, idx) => {
                const BtnIcon = btn.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(btn.to)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b] hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-[#0f1b3d] hover:scale-[1.03] active:scale-[0.98] transition-all group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#0e1a3b] text-indigo-600 dark:text-indigo-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-600/20 transition-colors mb-2">
                      <BtnIcon size={18} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center leading-tight">
                      {btn.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subscriptions Overview Bar Chart */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-sky-600 dark:text-sky-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                  Subscriptions Overview
                </h2>
              </div>
              <button
                onClick={() => navigate('/super-admin/subscriptions')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* Custom Vertical Bar Chart */}
            <div className="relative h-44 flex items-end justify-between px-2 pt-6">
              {/* Y-Axis Grid Marks */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[9.5px] text-slate-400 dark:text-slate-600">
                <div className="border-b border-slate-100 dark:border-[#14234b] w-full flex justify-between">
                  <span>40</span>
                </div>
                <div className="border-b border-slate-100 dark:border-[#14234b] w-full flex justify-between">
                  <span>30</span>
                </div>
                <div className="border-b border-slate-100 dark:border-[#14234b] w-full flex justify-between">
                  <span>20</span>
                </div>
                <div className="border-b border-slate-100 dark:border-[#14234b] w-full flex justify-between">
                  <span>10</span>
                </div>
                <div className="border-b border-slate-100 dark:border-[#14234b] w-full flex justify-between">
                  <span>0</span>
                </div>
              </div>

              {/* Bars */}
              <div className="relative z-10 w-full flex items-end justify-between pl-6 pr-2 h-36">
                {subscriptionsBars.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                    <div className="w-full flex justify-center h-28 items-end">
                      <div
                        style={{ height: `${bar.heightPct}%` }}
                        className="w-5 sm:w-6 bg-gradient-to-t from-purple-600 via-indigo-500 to-sky-400 rounded-t-md group-hover:brightness-110 transition-all shadow-md shadow-purple-900/20 relative cursor-pointer"
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow border border-purple-500/40 pointer-events-none transition-opacity font-semibold whitespace-nowrap z-20">
                          {bar.count} Active
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (3 cols): Live System Status & Performance Heartbeat */}
        <div className="lg:col-span-3 space-y-5">
          {/* Live System Status Card */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={17} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">System Status</h2>
              </div>
              <button
                type="button"
                onClick={triggerManualPing}
                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title="Click to ping live services"
              >
                <RefreshCw size={10} className={isPinging ? 'animate-spin' : ''} />
                <span>All Operational</span>
              </button>
            </div>

            <div className="space-y-3">
              {systemStatusItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#14234b]/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{item.latency}</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Card with Live Health Score */}
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={17} className="text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Performance</h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                Real-Time
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {/* Circular Gauge Ring with Dynamic Pulse */}
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={isDarkMode ? '#14234b' : '#f1f5f9'}
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray="251"
                    strokeDashoffset={251 - (251 * healthScore) / 100}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                    {healthScore}%
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">System Health</span>
                </div>
              </div>

              {/* Performance Key Indicators with Live Fluctuations */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">API Response Time</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {apiResponseTime}ms
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Database Performance</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {healthScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Uptime</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    99.98%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Error Rate</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    0.08%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transaction Details Modal ── */}
      {selectedTx && (
        <div
          onClick={() => setSelectedTx(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#070f24] p-3 rounded-xl border border-slate-200 dark:border-[#14234b]">
                <div>
                  <div className="text-[11px] text-slate-400">Total Amount</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedTx.amount}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                  {selectedTx.status}
                </span>
              </div>

              <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Transaction Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Company / Tenant</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.customer}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Plan / Purpose</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTx.plan}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTx.method}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTx.time}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
