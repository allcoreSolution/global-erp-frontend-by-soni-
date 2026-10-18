import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Sliders,
  CreditCard,
  ShoppingCart,
  Package,
  Warehouse,
  FileText,
  Calendar,
  Calculator,
  Building2,
  TrendingUp,
  CloudUpload,
  ShieldCheck,
  Zap,
  Users,
  Tag,
  Plus,
  Lock,
  Layers,
  HelpCircle,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

export const AVAILABLE_ICONS = [
  { id: 'ShoppingCart', name: 'ShoppingCart', label: 'Sales / Cart', icon: ShoppingCart },
  { id: 'Package', name: 'Package', label: 'Purchases / Items', icon: Package },
  { id: 'Warehouse', name: 'Warehouse', label: 'Stock / Warehouse', icon: Warehouse },
  { id: 'FileText', name: 'FileText', label: 'Vouchers / Accounting', icon: FileText },
  { id: 'Calendar', name: 'Calendar', label: 'HRMS / Attendance', icon: Calendar },
  { id: 'Calculator', name: 'Calculator', label: 'Payroll / Tax', icon: Calculator },
  { id: 'CreditCard', name: 'CreditCard', label: 'Cards / Banking', icon: CreditCard },
  { id: 'Building2', name: 'Building2', label: 'Branches / Stores', icon: Building2 },
  { id: 'TrendingUp', name: 'TrendingUp', label: 'MIS / Reports', icon: TrendingUp },
  { id: 'CloudUpload', name: 'CloudUpload', label: 'Cloud / Backup', icon: CloudUpload },
  { id: 'ShieldCheck', name: 'ShieldCheck', label: 'RBAC / Security', icon: ShieldCheck },
  { id: 'Zap', name: 'Zap', label: 'Integrations / API', icon: Zap },
  { id: 'Users', name: 'Users', label: 'CRM / Customers', icon: Users },
  { id: 'Tag', name: 'Tag', label: 'Pricing / Offers', icon: Tag }
];

export const COLOR_PALETTES = [
  { id: 'blue', label: 'Royal Blue', color: 'from-blue-500 to-indigo-600', badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40' },
  { id: 'amber', label: 'Warm Orange', color: 'from-amber-500 to-orange-600', badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/40' },
  { id: 'emerald', label: 'Emerald Green', color: 'from-emerald-500 to-teal-600', badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
  { id: 'indigo', label: 'Deep Purple', color: 'from-indigo-500 to-purple-600', badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40' },
  { id: 'rose', label: 'Rose Pink', color: 'from-rose-500 to-pink-600', badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40' },
  { id: 'violet', label: 'Violet Indigo', color: 'from-violet-500 to-purple-700', badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800/40' },
  { id: 'cyan', label: 'Cyan Sky', color: 'from-cyan-500 to-blue-600', badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40' },
  { id: 'slate', label: 'Slate Gray', color: 'from-slate-600 to-slate-800', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
];

const CATEGORIES = [
  'Core Operations',
  'Stock & Logistics',
  'Finance & Banking',
  'Human Resources',
  'Analytics & BI',
  'Enterprise Hierarchy',
  'Security & Governance',
  'Add-ons & Integrations'
];

const AddModule = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Core Operations',
    description: '',
    iconName: 'Package',
    colorPaletteId: 'blue',
    starterUnlocked: false,
    starterLimit: 'Disabled',
    proUnlocked: true,
    proLimit: 'Standard Usage',
    eliteUnlocked: true,
    eliteLimit: 'Unlimited',
    status: 'Active'
  });

  const selectedPalette = COLOR_PALETTES.find(p => p.id === form.colorPaletteId) || COLOR_PALETTES[0];
  const SelectedIconItem = AVAILABLE_ICONS.find(i => i.name === form.iconName) || AVAILABLE_ICONS[0];
  const IconComp = SelectedIconItem.icon;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter a module name');
      return;
    }

    const slug = form.slug.trim()
      ? form.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
      : form.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    const newModule = {
      id: slug + '_' + Date.now().toString(36),
      name: form.name.trim(),
      category: form.category,
      iconName: form.iconName,
      color: selectedPalette.color,
      badgeColor: selectedPalette.badgeColor,
      description: form.description.trim() || 'Custom ERP module configured by Super Administrator.',
      status: form.status || 'Active',
      isCustom: true,
      plans: {
        starter: !!form.starterUnlocked,
        pro: !!form.proUnlocked,
        elite: !!form.eliteUnlocked
      },
      limits: {
        starter: form.starterUnlocked ? (form.starterLimit || 'Enabled') : 'Locked',
        pro: form.proUnlocked ? (form.proLimit || 'Enabled') : 'Locked',
        elite: form.eliteUnlocked ? (form.eliteLimit || 'Unlimited') : 'Locked'
      }
    };

    try {
      const stored = localStorage.getItem('erp_custom_modules');
      let currentModules = [];
      if (stored) {
        currentModules = JSON.parse(stored);
      }
      const updated = [newModule, ...currentModules];
      localStorage.setItem('erp_custom_modules', JSON.stringify(updated));
      toast.success(`Module "${form.name}" created successfully!`);
      navigate('/super-admin/modules');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save module. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-[#050a18] dark:via-[#070f26] dark:to-[#050a18] text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] p-4 md:p-6 transition-colors">
      {/* ── TOP BREADCRUMB & HEADER ── */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link
            to="/super-admin/modules"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Modules Catalog</span>
          </Link>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Super Admin Entitlement Builder
          </span>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create New ERP Module / Service
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define functional capabilities, branding, and assign tier access across Starter, Pro, and Elite plans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/super-admin/modules')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-module-form"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Publish Module</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (2-COLUMN LAYOUT) ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form id="add-module-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Identity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  1. Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Module / Service Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WhatsApp Invoicing & Alerts"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Module Key / Slug (Unique ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. whatsapp_invoicing (auto-generated)"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deployment Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  >
                    <option value="Active">Active (Production Live)</option>
                    <option value="Beta">Beta (Testing Mode)</option>
                    <option value="Coming Soon">Coming Soon (Roadmap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service Description & Capabilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what features this service provides to client companies (e.g. automated PDF delivery, customer tracking)..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Section 2: Visual Styling & Icon */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sliders size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  2. Visual Theme & Icon
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {AVAILABLE_ICONS.map(item => {
                    const CurrentIcon = item.icon;
                    const isSelected = form.iconName === item.name;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setForm({ ...form, iconName: item.name })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <CurrentIcon size={18} />
                        <span className="text-[9px] mt-1.5 font-medium truncate w-full">{item.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color Gradient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COLOR_PALETTES.map(p => {
                    const isSelected = form.colorPaletteId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, colorPaletteId: p.id })}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${p.color} shrink-0 shadow-2xs`} />
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Plan Tier Accessibility & Quotas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CreditCard size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  3. Plan Tier Availability & Quota Restrictions
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Starter Plan (₹999) */}
                <div className="p-4 rounded-2xl bg-orange-50/20 dark:bg-orange-950/10 border border-orange-200/80 dark:border-orange-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                        Starter Plan
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">₹ 999 / mo</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.starterUnlocked}
                        onChange={e => setForm({ ...form, starterUnlocked: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Quota Cap / Limit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500 Invoices/mo or Disabled"
                      value={form.starterLimit}
                      onChange={e => setForm({ ...form, starterLimit: e.target.value })}
                      disabled={!form.starterUnlocked}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Pro Plan (₹2,499) */}
                <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Pro Plan
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">₹ 2,499 / mo</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.proUnlocked}
                        onChange={e => setForm({ ...form, proUnlocked: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Quota Cap / Limit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5,000 Invoices/mo"
                      value={form.proLimit}
                      onChange={e => setForm({ ...form, proLimit: e.target.value })}
                      disabled={!form.proUnlocked}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Elite Plan (₹4,999) */}
                <div className="p-4 rounded-2xl bg-cyan-50/20 dark:bg-cyan-950/10 border border-cyan-200/80 dark:border-cyan-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                        Elite Plan
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">₹ 4,999 / mo</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.eliteUnlocked}
                        onChange={e => setForm({ ...form, eliteUnlocked: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Quota Cap / Limit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unlimited"
                      value={form.eliteLimit}
                      onChange={e => setForm({ ...form, eliteLimit: e.target.value })}
                      disabled={!form.eliteUnlocked}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/super-admin/modules')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Save & Publish Module</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Eye size={14} className="text-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Catalog Preview
              </span>
            </div>

            {/* Card Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-md transition-all">
              <div className="flex items-start justify-between gap-2.5 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPalette.color} text-white flex items-center justify-center shadow-xs transition-transform`}>
                  <IconComp size={18} />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Custom
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${selectedPalette.badgeColor}`}>
                    {form.category}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span>{form.name || 'Untitled ERP Service'}</span>
                {form.status !== 'Active' && (
                  <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    {form.status}
                  </span>
                )}
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[32px]">
                {form.description || 'Module description will appear here as you type in the form...'}
              </p>

              {/* Tiers Preview */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tier Accessibility
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-600 dark:text-slate-400">Starter Plan (₹999)</span>
                  <span className={`font-bold flex items-center gap-1 ${form.starterUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {form.starterUnlocked ? <Check size={11} strokeWidth={3} /> : <Lock size={11} />}
                    {form.starterUnlocked ? (form.starterLimit || 'Active') : 'Locked'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-600 dark:text-slate-400">Pro Plan (₹2,499)</span>
                  <span className={`font-bold flex items-center gap-1 ${form.proUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {form.proUnlocked ? <Check size={11} strokeWidth={3} /> : <Lock size={11} />}
                    {form.proUnlocked ? (form.proLimit || 'Active') : 'Locked'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-600 dark:text-slate-400">Elite Plan (₹4,999)</span>
                  <span className={`font-bold flex items-center gap-1 ${form.eliteUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {form.eliteUnlocked ? <Check size={11} strokeWidth={3} /> : <Lock size={11} />}
                    {form.eliteUnlocked ? (form.eliteLimit || 'Active') : 'Locked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                <HelpCircle size={14} />
                <span>How Module Quotas Work</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                When client companies exceed their plan quota, the system prompts them with an upgrade modal to seamlessly move to a higher tier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddModule;
