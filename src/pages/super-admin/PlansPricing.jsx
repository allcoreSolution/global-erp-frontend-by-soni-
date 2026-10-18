import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Edit3,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Tag,
  Calendar,
  LayoutTemplate,
  CheckSquare,
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  ArrowLeft,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
  Building2,
  Package,
  Search,
  Filter,
  Warehouse,
  FileText,
  Flame,
  CheckCheck,
  Shield,
  HelpCircle
} from 'lucide-react';
import api from '../../api';

// Curated Vibrant 3D/Abstract Shapes
const TierIcon = ({ type, colorClass }) => {
  if (type === 'clover') {
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${colorClass}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current drop-shadow-xs" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="4.5" opacity="0.9" />
          <circle cx="16" cy="8" r="4.5" opacity="0.9" />
          <circle cx="8" cy="16" r="4.5" opacity="0.9" />
          <circle cx="16" cy="16" r="4.5" opacity="0.9" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (type === 'star') {
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${colorClass}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current drop-shadow-xs" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
          <circle cx="12" cy="11" r="2" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (type === 'diamond') {
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${colorClass}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current drop-shadow-xs" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 22,12 12,22 2,12" opacity="0.9" />
          <polygon points="12,6 18,12 12,18 6,12" fill="#ffffff" opacity="0.7" />
        </svg>
      </div>
    );
  }

  // Default: Floral Shape
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${colorClass}`}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current drop-shadow-xs" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.66 2 15 3.34 15 5V9H19C20.66 9 22 10.34 22 12C22 13.66 20.66 15 19 15H15V19C15 20.66 13.66 22 12 22C10.34 22 9 20.66 9 19V15H5C3.34 15 2 13.66 2 12C2 10.34 3.34 9 5 9H9V5C9 3.34 10.34 2 12 2Z" />
        <circle cx="12" cy="12" r="2.5" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
};

// Theme configurations
const THEMES = {
  emerald: {
    key: 'emerald',
    label: 'Emerald Sage',
    ambientGlow: 'from-emerald-500/10 via-transparent to-transparent',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/40',
    iconColor: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
  },
  indigo: {
    key: 'indigo',
    label: 'Deep Indigo',
    ambientGlow: 'from-indigo-500/10 via-transparent to-transparent',
    cardBorder: 'border-indigo-200 dark:border-indigo-800/40',
    iconColor: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/30',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
  },
  peach: {
    key: 'peach',
    label: 'Warm Peach',
    ambientGlow: 'from-orange-500/10 via-transparent to-transparent',
    cardBorder: 'border-orange-200 dark:border-orange-800/40',
    iconColor: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/30',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
    btnBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
  },
  cyan: {
    key: 'cyan',
    label: 'Cyan Frost',
    ambientGlow: 'from-cyan-500/10 via-transparent to-transparent',
    cardBorder: 'border-cyan-200 dark:border-cyan-800/40',
    iconColor: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-cyan-500/30',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
    btnBg: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
  },
  violet: {
    key: 'violet',
    label: 'Royal Violet',
    ambientGlow: 'from-purple-500/10 via-transparent to-transparent',
    cardBorder: 'border-purple-200 dark:border-purple-800/40',
    iconColor: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
  }
};

// All ERP System Modules that Super Admin can assign or toggle per plan
const ALL_SYSTEM_MODULES = [
  { key: 'Dashboard', name: 'Dashboard & Analytics', desc: 'Main business KPIs, charts & summary reports' },
  { key: 'Sales', name: 'Sales & Invoicing', desc: 'Sales invoices, POS bills, quotations, packing slips & challans' },
  { key: 'Purchase', name: 'Purchases & Suppliers', desc: 'Purchase orders, supplier bills, debit notes & returns' },
  { key: 'Inventory', name: 'Inventory & Warehouses', desc: 'Product catalog, multi-warehouse stock sync & adjustments' },
  { key: 'Customers', name: 'Customers (CRM)', desc: 'Customer directory, credit limits, ledgers & transaction history' },
  { key: 'Accounts', name: 'Accounting & Vouchers', desc: 'Day Book, bank/cash vouchers, contra, journal & double entry' },
  { key: 'HRMS', name: 'HRMS & Staff Directory', desc: 'Employees master, designations, departments & appraisal ratings' },
  { key: 'Attendance', name: 'Attendance & Shifts', desc: 'Daily punch logs, shift timing setups & overtime tracking' },
  { key: 'Leave', name: 'Leaves & Holidays', desc: 'Leave requests approvals & company holiday calendar' },
  { key: 'Payroll', name: 'Payroll & Salaries', desc: 'Salary structures, monthly payslips, PF/ESI reports & claims' },
  { key: 'Reports', name: 'Financial & MIS Reports', desc: 'P&L, balance sheet, trial balance, GST sales & TDS reconciliation' },
  { key: 'Settings', name: 'Company Settings', desc: 'Branch management, tax slabs, price lists & system setup' }
];

const PlansPricing = ({ initialMode = 'list' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateRoute = location.pathname.endsWith('/create') || initialMode === 'create';
  const [viewMode, setViewMode] = useState(isCreateRoute ? 'create' : 'list'); // 'list' | 'create' | 'edit'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'popular'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 999,
    durationDays: 30,
    billingCycle: '1 Month',
    subtitle: 'For modern teams scaling their business operations.',
    themeColor: 'indigo',
    iconType: 'flower',
    isPopular: false,
    features: ['Sales & POS Invoicing', 'Inventory & Stock Management', 'Customer Relationship & Ledgers'],
    allowedModules: ALL_SYSTEM_MODULES.map(m => m.key),
    maxUsers: 10,
    maxBranches: 1,
    maxWarehouses: 1,
    maxInvoicesPerMonth: 0,
    isActive: true
  });

  const [featureInput, setFeatureInput] = useState('');

  // Sync route
  useEffect(() => {
    if (location.pathname.endsWith('/create')) {
      setViewMode('create');
    } else if (viewMode === 'create' && !location.pathname.endsWith('/create')) {
      setViewMode('list');
    }
  }, [location.pathname]);

  // Fetch Real Plans from Backend Database
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans from backend:', err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 1999,
      durationDays: 30,
      billingCycle: '1 Month',
      subtitle: 'For modern teams scaling their business operations.',
      themeColor: 'indigo',
      iconType: 'flower',
      isPopular: false,
      features: [
        'Sales & POS Invoicing',
        'Multi-Warehouse Stock Management',
        'Customer Directory & Ledgers'
      ],
      allowedModules: ALL_SYSTEM_MODULES.map(m => m.key),
      maxUsers: 10,
      maxBranches: 1,
      maxWarehouses: 1,
      maxInvoicesPerMonth: 0,
      isActive: true
    });
    setFeatureInput('');
    setViewMode('create');
    navigate('/super-admin/plans/create');
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      price: plan.price !== undefined ? plan.price : 999,
      durationDays: plan.durationDays || 30,
      billingCycle: plan.billingCycle || `${plan.durationDays || 30} Days`,
      subtitle: plan.subtitle || '',
      themeColor: plan.themeColor || 'indigo',
      iconType: plan.iconType || 'flower',
      isPopular: !!plan.isPopular,
      features: Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : ['Core ERP Features'],
      allowedModules: Array.isArray(plan.allowedModules) && plan.allowedModules.length > 0
        ? plan.allowedModules
        : ALL_SYSTEM_MODULES.map(m => m.key),
      maxUsers: plan.maxUsers !== undefined ? plan.maxUsers : 10,
      maxBranches: plan.maxBranches !== undefined ? plan.maxBranches : 1,
      maxWarehouses: plan.maxWarehouses !== undefined ? plan.maxWarehouses : 1,
      maxInvoicesPerMonth: plan.maxInvoicesPerMonth !== undefined ? plan.maxInvoicesPerMonth : 0,
      isActive: plan.isActive !== undefined ? plan.isActive : true
    });
    setFeatureInput('');
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingPlan(null);
    navigate('/super-admin/plans');
  };

  // Toggle single module in allowedModules
  const handleToggleModule = (moduleKey) => {
    setFormData(prev => {
      const exists = (prev.allowedModules || []).includes(moduleKey);
      return {
        ...prev,
        allowedModules: exists
          ? prev.allowedModules.filter(k => k !== moduleKey)
          : [...(prev.allowedModules || []), moduleKey]
      };
    });
  };

  // Select all modules
  const handleSelectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      allowedModules: ALL_SYSTEM_MODULES.map(m => m.key)
    }));
  };

  // Deselect all modules
  const handleDeselectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      allowedModules: []
    }));
  };

  // Add a feature bullet tag
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !formData.features.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, trimmed]
      }));
      setFeatureInput('');
    }
  };

  // Remove a feature bullet tag
  const handleRemoveFeature = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Duration preset selector helper
  const handleDurationPreset = (days, cycleLabel) => {
    setFormData(prev => ({
      ...prev,
      durationDays: days,
      billingCycle: cycleLabel
    }));
  };

  // Save Plan (Create or Update)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter plan name');
    if (formData.features.length === 0) return alert('Please provide at least 1 feature description');

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        durationDays: Number(formData.durationDays) || 30,
        maxUsers: Number(formData.maxUsers) || 10,
        maxBranches: Number(formData.maxBranches) || 1,
        maxWarehouses: Number(formData.maxWarehouses) || 1,
        maxInvoicesPerMonth: Number(formData.maxInvoicesPerMonth) || 0,
        allowedModules: Array.isArray(formData.allowedModules) ? formData.allowedModules : []
      };

      if (editingPlan && editingPlan._id) {
        const res = await api.put(`/plans/${editingPlan._id}`, payload);
        const updated = res.data?.data || res.data;
        setPlans(prev => prev.map(p => p._id === editingPlan._id ? { ...p, ...payload, ...updated } : p));
      } else {
        const res = await api.post('/plans', payload);
        const created = res.data?.data || res.data;
        setPlans(prev => [created, ...prev]);
      }

      handleBackToList();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving plan to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Plan from Backend Database
  const handleDelete = async (planId) => {
    try {
      await api.delete(`/plans/${planId}`);
      setPlans(prev => prev.filter(p => p._id !== planId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error deleting plan from database');
    }
  };

  // Toggle active/inactive status in Backend Database
  const handleToggleStatus = async (plan) => {
    const updatedStatus = !plan.isActive;
    try {
      await api.put(`/plans/${plan._id}`, { isActive: updatedStatus });
      setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, isActive: updatedStatus } : p));
    } catch (err) {
      console.error('Failed to toggle plan status in database:', err);
    }
  };

  // Filtered Plans list
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (statusFilter === 'active') return p.isActive === true;
      if (statusFilter === 'inactive') return p.isActive === false;
      if (statusFilter === 'popular') return !!p.isPopular;
      return true;
    });
  }, [plans, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(p => p.isActive).length;
    const popular = plans.find(p => p.isPopular)?.name || 'None';
    const avgPrice = total > 0 ? Math.round(plans.reduce((acc, p) => acc + (p.price || 0), 0) / total) : 0;
    return { total, active, popular, avgPrice };
  }, [plans]);

  const previewTheme = THEMES[formData.themeColor] || THEMES.indigo;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 font-sans">
      {viewMode === 'create' || viewMode === 'edit' ? (
        /* ══════════════════════════════════════════════════
            VIEW 1: MODERN PLAN BUILDER (CREATE / EDIT)
        ══════════════════════════════════════════════════ */
        <div className="w-full space-y-6">
          {/* Header & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Back to all plans"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    {editingPlan ? 'Edit Mode' : 'New Plan Builder'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {editingPlan ? `Configure: ${editingPlan.name}` : 'Create Subscription Package'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select allowed ERP modules, configure quotas, pricing models, and billing cycles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving Plan...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>{editingPlan ? 'Update Plan' : 'Save & Publish'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form + Sticky Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── LEFT: FORM CONFIGURATOR (7 COLS) ── */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Section 1: Basic Identity & Pricing */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Tag size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Plan Identity & Pricing
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Plan Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Starter, Growth, Enterprise"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Price (INR ₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="2999"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subtitle / Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tailored for growing operations needing advanced inventory & billing"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Validity presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Billing Cycle & Duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { days: 30, label: '1 Month' },
                      { days: 90, label: '3 Months' },
                      { days: 180, label: '6 Months' },
                      { days: 365, label: '1 Year' },
                    ].map(preset => {
                      const isSelected = formData.durationDays === preset.days && formData.billingCycle === preset.label;
                      return (
                        <button
                          type="button"
                          key={preset.days}
                          onClick={() => handleDurationPreset(preset.days, preset.label)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 mb-1 block">Exact Validity Days</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.durationDays}
                        onChange={e => {
                          const d = Number(e.target.value);
                          setFormData({ ...formData, durationDays: d, billingCycle: `${d} Days` });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 mb-1 block">Custom Cycle Tag</span>
                      <input
                        type="text"
                        value={formData.billingCycle}
                        onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Dynamic ERP Modules Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      ERP Modules & Feature Access
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      {formData.allowedModules?.length || 0} / 12 Unlocked
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllModules}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle which ERP modules are unlocked for client companies under this plan. Non-selected modules will remain locked/hidden for the company admin.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_SYSTEM_MODULES.map(mod => {
                    const isSelected = (formData.allowedModules || []).includes(mod.key);
                    return (
                      <div
                        key={mod.key}
                        onClick={() => handleToggleModule(mod.key)}
                        className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/60 shadow-xs ring-1 ring-indigo-500/10'
                            : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-700/50 opacity-60 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-bold block ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                            {mod.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {mod.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Quotas & Resource Limits */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Sliders size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Resource Quotas & Limits
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Users size={12} className="text-indigo-500" />
                      <span>Max Users</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxUsers}
                      onChange={e => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Staff accounts</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Building2 size={12} className="text-indigo-500" />
                      <span>Max Branches</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxBranches}
                      onChange={e => setFormData({ ...formData, maxBranches: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Locations</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Warehouse size={12} className="text-indigo-500" />
                      <span>Max Warehouses</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxWarehouses}
                      onChange={e => setFormData({ ...formData, maxWarehouses: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Storage points</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <FileText size={12} className="text-indigo-500" />
                      <span>Monthly Invoices</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxInvoicesPerMonth}
                      onChange={e => setFormData({ ...formData, maxInvoicesPerMonth: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">0 = Unlimited</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Marketing Feature Bullets */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Marketing Highlights & Bullet Points
                  </h3>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type feature bullet and press Enter (e.g. 24/7 Dedicated Support)"
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                        title="Remove feature"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Visual Styling & Toggles */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Visual Styling & Display Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Color Theme
                    </label>
                    <div className="flex items-center gap-2">
                      {Object.values(THEMES).map(t => (
                        <button
                          type="button"
                          key={t.key}
                          onClick={() => setFormData({ ...formData, themeColor: t.key })}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition cursor-pointer ${
                            formData.themeColor === t.key
                              ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/20'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          } ${t.iconColor}`}
                          title={t.label}
                        >
                          {formData.themeColor === t.key && <Check size={14} strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Icon Glyph Style
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'flower', label: 'Floral' },
                        { key: 'clover', label: 'Clover' },
                        { key: 'star', label: 'Star' },
                        { key: 'diamond', label: 'Diamond' },
                      ].map(shape => (
                        <button
                          type="button"
                          key={shape.key}
                          onClick={() => setFormData({ ...formData, iconType: shape.key })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            formData.iconType === shape.key
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {shape.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Active Tier</span>
                      <span className="text-[10px] text-slate-500">Enable plan for new client onboarding</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Highlight as Popular</span>
                      <span className="text-[10px] text-slate-500">Display prominent glowing badge</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── RIGHT: STICKY REAL-TIME CARD PREVIEW (5 COLS) ── */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye size={14} />
                  <span>Live Customer Preview</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Live Sync
                </span>
              </div>

              {/* Preview Card */}
              <div className={`relative rounded-3xl p-6 border ${previewTheme.cardBorder} bg-gradient-to-b ${previewTheme.ambientGlow} bg-white dark:bg-slate-900 shadow-xl overflow-hidden`}>
                {formData.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-md flex items-center gap-1">
                      <Flame size={12} />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <TierIcon type={formData.iconType} colorClass={previewTheme.iconColor} />
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formData.name || 'Plan Name'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                  {formData.subtitle || 'Subtitle description will appear here for client review.'}
                </p>

                {/* Price Display */}
                <div className="my-4 py-3 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">₹</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {(Number(formData.price) || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">
                      / {formData.billingCycle || `${formData.durationDays || 30} Days`}
                    </span>
                  </div>
                </div>

                {/* Quotas strip */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-indigo-500" />
                    <span>{formData.maxUsers || 10} Staff Users</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-indigo-500" />
                    <span>{formData.maxBranches || 1} {formData.maxBranches === 1 ? 'Branch' : 'Branches'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Warehouse size={13} className="text-indigo-500" />
                    <span>{formData.maxWarehouses || 1} Godowns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={13} className="text-indigo-500" />
                    <span>{formData.maxInvoicesPerMonth ? `${formData.maxInvoicesPerMonth} Bills/Mo` : 'Unlimited Bills'}</span>
                  </div>
                </div>

                {/* Unlocked Modules Badges */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Unlocked Modules ({formData.allowedModules?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(formData.allowedModules || []).map(mKey => (
                      <span
                        key={mKey}
                        className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                      >
                        {mKey}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Feature Highlights
                  </span>
                  {(formData.features || []).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className={`w-full py-2.5 rounded-xl font-bold text-xs text-center shadow-md ${previewTheme.btnBg}`}>
                  Subscribe to {formData.name || 'Plan'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════
            VIEW 2: SUBSCRIPTION PLANS SHOWCASE (GRID VIEW)
        ══════════════════════════════════════════════════ */
        <div className="w-full space-y-6">
          
          {/* Top Banner & Actions Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <Sparkles size={14} />
                <span>SaaS Subscription Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Subscription Plans & Pricing Tiers
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Configure SaaS packages for your tenant companies, control module access (Sales, Accounts, HRMS, etc.), and enforce user/branch resource limits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPlans}
                disabled={loading}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Refresh Plans List"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Plus size={16} />
                <span>Create New Plan</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Plans</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.total} Packages</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active For Signup</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{metrics.active} Active</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Price</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">₹{metrics.avgPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Most Popular Tier</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate block">{metrics.popular}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search plan by name or keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { key: 'all', label: 'All Plans' },
                { key: 'active', label: 'Active Only' },
                { key: 'popular', label: 'Popular' },
                { key: 'inactive', label: 'Inactive' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    statusFilter === f.key
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PLANS GRID ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={28} className="animate-spin text-indigo-600" />
                <span className="text-xs font-bold text-slate-500">Loading subscription tiers...</span>
              </div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <Tag size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Subscription Plans Found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">No plans matched your filter criteria or no plans exist yet.</p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-md transition cursor-pointer"
              >
                + Create First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredPlans.map(plan => {
                const theme = THEMES[plan.themeColor] || THEMES.indigo;
                const activeCount = plan.allowedModules?.length || 12;

                return (
                  <div
                    key={plan._id}
                    className={`relative flex flex-col justify-between rounded-2xl p-5 border ${theme.cardBorder} bg-gradient-to-b ${theme.ambientGlow} bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 group`}
                  >
                    {/* Top Row: Status badge & Actions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(plan)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition cursor-pointer ${
                              plan.isActive
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                            }`}
                            title="Click to toggle Active status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
                          </button>

                          {plan.isPopular && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                              <Flame size={10} />
                              <span>Popular</span>
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 rounded-lg p-1 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded transition cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(plan._id)}
                            className="p-1 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded transition cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Icon + Title + Subtitle */}
                      <div className="mb-3">
                        <div className="mb-2">
                          <TierIcon type={plan.iconType} colorClass={theme.iconColor} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {plan.name}
                        </h2>
                        {plan.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                            {plan.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Pricing Display */}
                      <div className="my-3 py-2.5 border-y border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-400">₹</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {plan.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 ml-1">
                            / {plan.billingCycle || `${plan.durationDays || 30} Days`}
                          </span>
                        </div>
                      </div>

                      {/* Resource Quota Strip */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <Users size={12} className="text-indigo-500 shrink-0" />
                          <span className="truncate">{plan.maxUsers || 10} Staff Users</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 size={12} className="text-indigo-500 shrink-0" />
                          <span className="truncate">{plan.maxBranches || 1} {plan.maxBranches === 1 ? 'Branch' : 'Branches'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Warehouse size={12} className="text-indigo-500 shrink-0" />
                          <span className="truncate">{plan.maxWarehouses || 1} Godowns</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText size={12} className="text-indigo-500 shrink-0" />
                          <span className="truncate">{plan.maxInvoicesPerMonth ? `${plan.maxInvoicesPerMonth} Bills/Mo` : 'Unlimited Bills'}</span>
                        </div>
                      </div>

                      {/* Unlocked Modules Badges */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Modules Unlocked
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {activeCount} / 12 Active
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(plan.allowedModules || ALL_SYSTEM_MODULES.map(m => m.key)).slice(0, 5).map(mKey => (
                            <span
                              key={mKey}
                              className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                            >
                              {mKey}
                            </span>
                          ))}
                          {activeCount > 5 && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              +{activeCount - 5} More
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-1.5 mb-4">
                        {(plan.features || []).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${theme.btnBg}`}
                    >
                      <span>Edit Plan Configuration</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL (PORTAL) ── */}
      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Subscription Plan?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Are you sure you want to delete this plan? Companies already subscribed to this tier will keep their active validity.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PlansPricing;
