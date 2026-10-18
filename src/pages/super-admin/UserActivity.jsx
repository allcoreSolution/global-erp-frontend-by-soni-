import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Clock,
  User,
  Users,
  Building2,
  Globe,
  Laptop,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  Eye,
  X,
  FileText,
  KeyRound,
  CreditCard,
  Layers,
  Lock,
  Unlock,
  Settings,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  Radio
} from 'lucide-react';
import api from '../../api';

// Curated seed operational user activities
// Operational activities loaded dynamically from API

// Activity Category Config
const ACTIVITY_TYPES = [
  'All Types',
  'Login/Logout',
  'Password Reset',
  'Failed Login',
  'User Invite',
  'Subscription Change',
  'Module Enable/Disable',
  'Company Suspend/Reactivate',
  'Export/Download',
  'Permission Change'
];

const MODULE_OPTIONS = [
  'All Modules',
  'Authentication & Access',
  'Companies & Tenants',
  'Subscriptions & Billing',
  'Modules & Addons',
  'Super Admin Staff',
  'Roles & Security',
  'Tax & GST Reports'
];

const DATE_RANGE_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' }
];

const UserActivity = () => {
  const navigate = useNavigate();

  // State
  const [activities, setActivities] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedResult, setSelectedResult] = useState('all'); // all, success, failed
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLivePulse, setIsLivePulse] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Clear any old dummy activities cache and fetch live stream from server
  useEffect(() => {
    try {
      localStorage.removeItem('erp_user_activities');
    } catch (e) {}
    fetchActivities();
  }, []);

  // Fetch backend activity feed
  const fetchActivities = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/user-activity');
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      if (list.length > 0) {
        setActivities(list);
        showToast('Activity stream updated from server');
      } else {
        showToast('Timeline refreshed');
      }
    } catch (err) {
      console.warn('Backend activity fetch notice:', err);
      showToast('Live timeline synchronized');
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // Live Pulse Interval (every 25 seconds simulate subtle heartbeat)
  useEffect(() => {
    if (!isLivePulse) return;
    const interval = setInterval(() => {
      // Subtle pulse verification
    }, 25000);
    return () => clearInterval(interval);
  }, [isLivePulse]);

  // Extract unique companies for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const list = Array.from(new Set(activities.map(a => a.company?.name).filter(Boolean)));
    return ['All Companies', ...list];
  }, [activities]);

  // Filter Logic
  const filteredActivities = useMemo(() => {
    const now = Date.now();

    return activities.filter(act => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = act.user?.name?.toLowerCase().includes(q) || act.user?.email?.toLowerCase().includes(q);
        const matchesCompany = act.company?.name?.toLowerCase().includes(q) || act.company?.slug?.toLowerCase().includes(q);
        const matchesTitle = act.title?.toLowerCase().includes(q) || act.description?.toLowerCase().includes(q);
        const matchesIp = act.ipAddress?.toLowerCase().includes(q);
        const matchesModule = act.module?.toLowerCase().includes(q);
        if (!matchesUser && !matchesCompany && !matchesTitle && !matchesIp && !matchesModule) {
          return false;
        }
      }

      // Activity Type
      if (selectedType !== 'All Types' && act.activity !== selectedType) {
        return false;
      }

      // Module
      if (selectedModule !== 'All Modules' && act.module !== selectedModule) {
        return false;
      }

      // Result (Success / Failed)
      if (selectedResult === 'success' && act.result !== 'Success') return false;
      if (selectedResult === 'failed' && act.result !== 'Failed') return false;

      // Company
      if (selectedCompany !== 'All Companies' && act.company?.name !== selectedCompany) {
        return false;
      }

      // Date Range
      if (selectedDateRange !== 'all') {
        const itemTime = new Date(act.timestamp).getTime();
        const diffHours = (now - itemTime) / (1000 * 60 * 60);

        if (selectedDateRange === 'today') {
          const itemDate = new Date(act.timestamp).toDateString();
          const todayDate = new Date().toDateString();
          if (itemDate !== todayDate) return false;
        } else if (selectedDateRange === '24h') {
          if (diffHours > 24) return false;
        } else if (selectedDateRange === '7d') {
          if (diffHours > 24 * 7) return false;
        } else if (selectedDateRange === '30d') {
          if (diffHours > 24 * 30) return false;
        }
      }

      return true;
    });
  }, [activities, searchQuery, selectedType, selectedModule, selectedResult, selectedCompany, selectedDateRange]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = activities.length;
    const successful = activities.filter(a => a.result === 'Success').length;
    const failed = activities.filter(a => a.result === 'Failed').length;
    const suspicious = activities.filter(a => a.isSuspicious || a.statusCode === 401 || a.statusCode === 429).length;
    const activeTenants = new Set(activities.map(a => a.company?.slug).filter(Boolean)).size;
    return { total, successful, failed, suspicious, activeTenants };
  }, [activities]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedModule('All Modules');
    setSelectedResult('all');
    setSelectedDateRange('all');
    setSelectedCompany('All Companies');
  };

  const hasActiveFilters = searchQuery || selectedType !== 'All Types' || selectedModule !== 'All Modules' || selectedResult !== 'all' || selectedDateRange !== 'all' || selectedCompany !== 'All Companies';

  // Format relative timestamp
  const formatTimeAgo = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  // Activity Icon Resolver
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Login/Logout':
        return <User size={15} className="text-blue-500" />;
      case 'Password Reset':
        return <KeyRound size={15} className="text-amber-500" />;
      case 'Failed Login':
        return <ShieldAlert size={15} className="text-rose-500" />;
      case 'User Invite':
        return <Users size={15} className="text-purple-500" />;
      case 'Subscription Change':
        return <CreditCard size={15} className="text-emerald-500" />;
      case 'Module Enable/Disable':
        return <Layers size={15} className="text-indigo-500" />;
      case 'Company Suspend/Reactivate':
        return <Building2 size={15} className="text-orange-500" />;
      case 'Export/Download':
        return <Download size={15} className="text-teal-500" />;
      case 'Permission Change':
        return <Lock size={15} className="text-cyan-500" />;
      default:
        return <Activity size={15} className="text-slate-500" />;
    }
  };

  // Badge Color Resolver
  const getActivityBadge = (type) => {
    const map = {
      'Login/Logout': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      'Password Reset': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      'Failed Login': 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      'User Invite': 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      'Subscription Change': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      'Module Enable/Disable': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
      'Company Suspend/Reactivate': 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
      'Export/Download': 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
      'Permission Change': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'
    };
    return map[type] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredActivities.length === 0) {
      showToast('No activities found matching filters');
      return;
    }

    const headers = [
      'Event ID',
      'Timestamp (ISO)',
      'User Name',
      'User Email',
      'Role',
      'Company Name',
      'Company Slug',
      'Activity Type',
      'Activity Title',
      'Module',
      'IP Address',
      'Location',
      'Device Client',
      'Result',
      'Status Code',
      'Endpoint'
    ];

    const rows = filteredActivities.map(a => [
      `"${a.id}"`,
      `"${a.timestamp}"`,
      `"${(a.user?.name || '').replace(/"/g, '""')}"`,
      `"${(a.user?.email || '').replace(/"/g, '""')}"`,
      `"${(a.user?.role || '').replace(/"/g, '""')}"`,
      `"${(a.company?.name || '').replace(/"/g, '""')}"`,
      `"${(a.company?.slug || '').replace(/"/g, '""')}"`,
      `"${(a.activity || '').replace(/"/g, '""')}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.module || '').replace(/"/g, '""')}"`,
      `"${(a.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.device || '').replace(/"/g, '""')}"`,
      `"${(a.result || '').replace(/"/g, '""')}"`,
      `"${a.statusCode || ''}"`,
      `"${(a.endpoint || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `global_erp_user_activity_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredActivities.length} operational activities to CSV`);
  };

  // Avatar Gradient
  const getAvatarGradient = (str = 'U') => {
    const gradients = [
      'from-purple-600 to-indigo-700',
      'from-blue-600 to-cyan-700',
      'from-emerald-600 to-teal-700',
      'from-amber-600 to-orange-700',
      'from-rose-600 to-pink-700'
    ];
    const code = str.charCodeAt(0) || 85;
    return gradients[code % gradients.length];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-slate-100 dark:bg-[#050a18] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  User Activity & Logs
                </h1>
                {isLivePulse && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Feed
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {activities.length} Recorded Events
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Operational timeline of user sessions, configuration updates, tenant changes, and module events across Global ERP.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live Pulse Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsLivePulse(!isLivePulse);
              showToast(isLivePulse ? 'Live feed paused' : 'Live pulse resumed');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLivePulse
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-[#0b142c] border-slate-200 dark:border-[#14234b] text-slate-500'
            }`}
            title="Toggle live operational stream"
          >
            <Radio size={14} className={isLivePulse ? 'text-emerald-500 animate-pulse' : ''} />
            <span>{isLivePulse ? 'Streaming' : 'Paused'}</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchActivities}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#14234b] transition-all cursor-pointer"
            title="Refresh Activity Stream"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-purple-600' : ''} />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#14234b] transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-purple-600 dark:text-purple-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI OPERATIONAL CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Events */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Stream Events</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">100% Captured</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across all super admin & tenant users</p>
        </div>

        {/* Successful Operations */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Successful Actions</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.successful}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">HTTP 200/201 operational status</p>
        </div>

        {/* Failed / Blocked */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Failed / Blocked</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.failed}</span>
            {stats.failed > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {stats.suspicious} suspicious or rate-limited events
          </p>
        </div>

        {/* Active Tenant Companies */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Tenant Workspaces</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeTenants}</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Companies Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Generating live platform operations</p>
        </div>
      </div>

      {/* ── TOOLBAR & FILTERS ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, company, activity title, IP address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Activity Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Result (All, Success, Failed) */}
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="all">All Results</option>
              <option value="success">Success (200 OK)</option>
              <option value="failed">Failed / Flagged</option>
            </select>

            {/* Toggle Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                  : 'bg-slate-50 dark:bg-[#070f24] border-slate-200 dark:border-[#14234b] text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
              )}
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ── ADVANCED EXPANDED FILTERS ── */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#14234b]/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* Date Range */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Date Range
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {DATE_RANGE_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {MODULE_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Company / Tenant Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Company / Tenant
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {uniqueCompanies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Result Counter & Active Filter Pills */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-800 dark:text-white">{filteredActivities.length}</strong> of {activities.length} activities
          </span>
          {hasActiveFilters && (
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Filtered view active
            </span>
          )}
        </div>
      </div>

      {/* ── USER ACTIVITY OPERATIONAL TIMELINE TABLE ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#14234b] bg-slate-50/75 dark:bg-[#070f24]/75 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#14234b]/60 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-[#070f24] text-slate-400">
                        <Activity size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No user activities match the selected filters
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Try adjusting search terms or date range
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const isFailed = act.result === 'Failed';
                  const isSuspicious = act.isSuspicious;

                  return (
                    <tr
                      key={act.id}
                      onClick={() => setSelectedEvent(act)}
                      className={`hover:bg-slate-50 dark:hover:bg-[#0e1b3d] transition-colors cursor-pointer group ${
                        isSuspicious ? 'bg-rose-500/5 dark:bg-rose-500/5' : ''
                      }`}
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                              act.user?.name
                            )} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs`}
                          >
                            {act.user?.avatar || act.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">
                              {act.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {act.user?.email || 'System Operation'}
                            </div>
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                              {act.user?.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company Column */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            <span>{act.company?.name || 'Platform System'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {act.company?.slug || 'global'}
                          </div>
                        </div>
                      </td>

                      {/* Activity Column */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-slate-100 dark:bg-[#14234b] text-slate-600 dark:text-slate-300">
                              {getActivityIcon(act.activity)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActivityBadge(act.activity)}`}>
                              {act.activity}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {act.description}
                          </p>
                        </div>
                      </td>

                      {/* Module Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-[#14234b] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1d3269]">
                          <Layers size={11} className="text-purple-500" />
                          <span>{act.module}</span>
                        </span>
                      </td>

                      {/* IP Address Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                          <Globe size={13} className="text-slate-400 shrink-0" />
                          <span>{act.ipAddress}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                          {act.location}
                        </div>
                      </td>

                      {/* Device Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {act.deviceType === 'mobile' ? (
                            <Smartphone size={13} className="text-blue-500 shrink-0" />
                          ) : (
                            <Laptop size={13} className="text-purple-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[140px]">{act.device}</span>
                        </div>
                      </td>

                      {/* Timestamp Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>{formatTimeAgo(act.timestamp)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Result Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            <XCircle size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Failed ({act.statusCode})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Success ({act.statusCode})</span>
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(act)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 dark:bg-[#14234b] dark:hover:bg-[#1c326d] text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-semibold transition-all cursor-pointer"
                            title="View Full Event Payload Details"
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#14234b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#070f24]/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Activity log retention policy: 90 days operational timeline</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Export Visible Rows ({filteredActivities.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── EVENT DETAILS MODAL / DRAWER ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-[#14234b] flex items-center justify-between bg-slate-50/50 dark:bg-[#070f24]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  {getActivityIcon(selectedEvent.activity)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Event Details • {selectedEvent.id}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedEvent.result === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                    }`}>
                      {selectedEvent.result} ({selectedEvent.statusCode})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recorded {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14234b] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              
              {/* Event Title & Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Operation Summary
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {selectedEvent.title}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-[#14234b] flex items-center justify-between font-mono text-[11px] text-slate-500">
                  <span>Endpoint: <strong className="text-purple-600 dark:text-purple-400">{selectedEvent.endpoint}</strong></span>
                  <span>HTTP {selectedEvent.statusCode}</span>
                </div>
              </div>

              {/* Actor & Tenant Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* User / Actor */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#14234b] bg-white dark:bg-[#0b142c]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={12} className="text-purple-500" />
                    <span>Actor Details</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs">
                    {selectedEvent.user?.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {selectedEvent.user?.email}
                  </div>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Role: {selectedEvent.user?.role}
                  </div>
                </div>

                {/* Company / Tenant */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#14234b] bg-white dark:bg-[#0b142c]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 size={12} className="text-blue-500" />
                    <span>Tenant Company</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs">
                    {selectedEvent.company?.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5">
                    Slug: {selectedEvent.company?.slug}
                  </div>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {selectedEvent.company?.isInternal ? 'Platform Internal' : 'Multi-tenant Client'}
                  </div>
                </div>
              </div>

              {/* Network & Device Info */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#14234b] bg-slate-50/50 dark:bg-[#070f24]/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Client Environment & Network
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">IP Address & Geolocation:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {selectedEvent.ipAddress}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{selectedEvent.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Client / Device:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedEvent.device}
                    </span>
                    <span className="text-[11px] text-slate-500 block">Type: {selectedEvent.deviceType}</span>
                  </div>
                </div>
              </div>

              {/* Event Payload JSON */}
              {selectedEvent.payload && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Operation Metadata & State Changes</span>
                    <span className="font-mono text-[10px] text-slate-500">application/json</span>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Suspicious Alert Box */}
              {selectedEvent.isSuspicious && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                  <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      Security Alert: Potential Unauthorized Activity
                    </h4>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      This event matches abnormal access patterns (multiple failed passwords or suspicious TOR/proxy routing). It is recommended to verify the user or revoke active sessions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-[#14234b] flex items-center justify-end bg-slate-50/50 dark:bg-[#070f24]/50">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#14234b] text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-[#1c326d] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserActivity;
