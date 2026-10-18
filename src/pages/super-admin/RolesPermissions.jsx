import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Plus,
  Search,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Edit3,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle2,
  Users,
  Sliders,
  CreditCard,
  Headphones,
  Save,
  RotateCcw,
  Eye,
  FileText,
  KeyRound,
  Building2,
  Layers,
  Tag,
  Clock,
  Briefcase
} from 'lucide-react';
import { SUPERADMIN_PERMISSIONS } from './AddSuperAdminUser';

// Categorized Platform Modules for RBAC Matrix
const PERMISSION_CATEGORIES = [
  { id: 'All', label: 'All Modules' },
  { id: 'Tenants', label: 'Tenants & Licensing' },
  { id: 'Finance', label: 'Billing & Financials' },
  { id: 'Operations', label: 'Support & Operations' },
  { id: 'Security', label: 'Staff & Security' },
  { id: 'System', label: 'System & Infrastructure' }
];

// Helper to reliably resolve Icon Component without storing function references in serializable JSON
const getRoleIcon = (roleId) => {
  if (roleId === 'super_admin') return ShieldAlert;
  if (roleId === 'billing_admin') return CreditCard;
  if (roleId === 'support_admin') return Headphones;
  if (roleId === 'technical_admin') return Sliders;
  return UserCheck;
};

// Initial System Roles
const INITIAL_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    desc: 'Unrestricted God Mode. Full access across all modules, databases, tenant workspaces, and system settings.',
    color: 'from-purple-600 to-indigo-600',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    isSystem: true,
    isGodMode: true,
    assignedUsersCount: 1,
    permissions: {
      // All modules have full view, edit, delete
      companies: { view: true, edit: true, delete: true },
      subscriptions: { view: true, edit: true, delete: true },
      plans: { view: true, edit: true, delete: true },
      modules: { view: true, edit: true, delete: true },
      users: { view: true, edit: true, delete: true },
      roles: { view: true, edit: true, delete: true },
      user_activity: { view: true, edit: true, delete: true },
      invoices: { view: true, edit: true, delete: true },
      payments: { view: true, edit: true, delete: true },
      gateways: { view: true, edit: true, delete: true },
      support: { view: true, edit: true, delete: true },
      announcements: { view: true, edit: true, delete: true },
      email_templates: { view: true, edit: true, delete: true },
      feedback: { view: true, edit: true, delete: true },
      settings: { view: true, edit: true, delete: true },
      backup: { view: true, edit: true, delete: true },
      audit: { view: true, edit: true, delete: true },
      performance: { view: true, edit: true, delete: true }
    }
  },
  {
    id: 'billing_admin',
    name: 'Billing & Finance Admin',
    desc: 'Manages plans, invoices, transactions ledger, and payment gateways. Cannot access server databases or delete tenants.',
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    isSystem: true,
    isGodMode: false,
    assignedUsersCount: 2,
    permissions: {
      companies: { view: true, edit: false, delete: false },
      subscriptions: { view: true, edit: true, delete: false },
      plans: { view: true, edit: true, delete: false },
      modules: { view: true, edit: false, delete: false },
      users: { view: false, edit: false, delete: false },
      roles: { view: false, edit: false, delete: false },
      user_activity: { view: false, edit: false, delete: false },
      invoices: { view: true, edit: true, delete: true },
      payments: { view: true, edit: true, delete: false },
      gateways: { view: true, edit: true, delete: false },
      support: { view: false, edit: false, delete: false },
      announcements: { view: true, edit: false, delete: false },
      email_templates: { view: false, edit: false, delete: false },
      feedback: { view: false, edit: false, delete: false },
      settings: { view: false, edit: false, delete: false },
      backup: { view: false, edit: false, delete: false },
      audit: { view: true, edit: false, delete: false },
      performance: { view: false, edit: false, delete: false }
    }
  },
  {
    id: 'support_admin',
    name: 'Customer Support Admin',
    desc: 'Help desk & tenant assistance. Responds to support tickets, views tenant workspace status, and broadcasts notices.',
    color: 'from-blue-500 to-cyan-600',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    isSystem: true,
    isGodMode: false,
    assignedUsersCount: 2,
    permissions: {
      companies: { view: true, edit: false, delete: false },
      subscriptions: { view: true, edit: false, delete: false },
      plans: { view: true, edit: false, delete: false },
      modules: { view: true, edit: false, delete: false },
      users: { view: false, edit: false, delete: false },
      roles: { view: false, edit: false, delete: false },
      user_activity: { view: false, edit: false, delete: false },
      invoices: { view: false, edit: false, delete: false },
      payments: { view: false, edit: false, delete: false },
      gateways: { view: false, edit: false, delete: false },
      support: { view: true, edit: true, delete: false },
      announcements: { view: true, edit: true, delete: false },
      email_templates: { view: true, edit: true, delete: false },
      feedback: { view: true, edit: true, delete: false },
      settings: { view: false, edit: false, delete: false },
      backup: { view: false, edit: false, delete: false },
      audit: { view: false, edit: false, delete: false },
      performance: { view: false, edit: false, delete: false }
    }
  },
  {
    id: 'technical_admin',
    name: 'Technical & DevOps Admin',
    desc: 'Platform health & system settings. Manages database dumps, snapshots, audit logs, and API latency metrics.',
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    isSystem: true,
    isGodMode: false,
    assignedUsersCount: 1,
    permissions: {
      companies: { view: true, edit: false, delete: false },
      subscriptions: { view: false, edit: false, delete: false },
      plans: { view: false, edit: false, delete: false },
      modules: { view: true, edit: true, delete: false },
      users: { view: false, edit: false, delete: false },
      roles: { view: false, edit: false, delete: false },
      user_activity: { view: true, edit: false, delete: false },
      invoices: { view: false, edit: false, delete: false },
      payments: { view: false, edit: false, delete: false },
      gateways: { view: false, edit: false, delete: false },
      support: { view: false, edit: false, delete: false },
      announcements: { view: false, edit: false, delete: false },
      email_templates: { view: false, edit: false, delete: false },
      feedback: { view: false, edit: false, delete: false },
      settings: { view: true, edit: true, delete: false },
      backup: { view: true, edit: true, delete: true },
      audit: { view: true, edit: false, delete: false },
      performance: { view: true, edit: false, delete: false }
    }
  },
  {
    id: 'compliance_officer',
    name: 'Compliance & Audit Officer',
    desc: 'Read-only compliance monitor. Has audit visibility across tenant activity, financial summaries, and security logs.',
    color: 'from-cyan-500 to-blue-600',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    isSystem: false,
    isGodMode: false,
    assignedUsersCount: 1,
    permissions: {
      companies: { view: true, edit: false, delete: false },
      subscriptions: { view: true, edit: false, delete: false },
      plans: { view: true, edit: false, delete: false },
      modules: { view: true, edit: false, delete: false },
      users: { view: true, edit: false, delete: false },
      roles: { view: true, edit: false, delete: false },
      user_activity: { view: true, edit: false, delete: false },
      invoices: { view: true, edit: false, delete: false },
      payments: { view: true, edit: false, delete: false },
      gateways: { view: false, edit: false, delete: false },
      support: { view: true, edit: false, delete: false },
      announcements: { view: true, edit: false, delete: false },
      email_templates: { view: false, edit: false, delete: false },
      feedback: { view: true, edit: false, delete: false },
      settings: { view: true, edit: false, delete: false },
      backup: { view: false, edit: false, delete: false },
      audit: { view: true, edit: false, delete: false },
      performance: { view: true, edit: false, delete: false }
    }
  }
];

const RolesPermissions = () => {
  // Roles state with local persistence (sanitizing corrupt icons from cache)
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('acs_rbac_matrix_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(r => {
            const { icon, ...rest } = r;
            return rest;
          });
        }
      }
      return INITIAL_ROLES;
    } catch {
      return INITIAL_ROLES;
    }
  });

  // Active selected role for focused editing
  const [selectedRoleKey, setSelectedRoleKey] = useState('super_admin');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal: Create Custom Role
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    desc: '',
    baseRole: 'support_admin'
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Toggle single permission for a role (view, edit, delete)
  const handleToggleCapability = (roleId, moduleId, actionKey) => {
    // Super admin is locked to true for safety
    if (roleId === 'super_admin') {
      showToast('Super Admin permissions are permanently unlocked (God Mode).');
      return;
    }

    setRoles(prev =>
      prev.map(r => {
        if (r.id !== roleId) return r;
        const currentMod = r.permissions[moduleId] || { view: false, edit: false, delete: false };
        const nextVal = !currentMod[actionKey];

        // If edit or delete is enabled, view must also be enabled
        const updatedMod = {
          ...currentMod,
          [actionKey]: nextVal,
          view: (actionKey === 'edit' || actionKey === 'delete') && nextVal ? true : currentMod.view
        };

        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: updatedMod
          }
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Save changes to local storage & backend
  const handleSaveMatrix = () => {
    try {
      localStorage.setItem('acs_rbac_matrix_cache', JSON.stringify(roles));
      setHasUnsavedChanges(false);
      showToast('RBAC Matrix changes saved and applied across platform!');
    } catch (err) {
      console.error(err);
    }
  };

  // Reset to system defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all roles and permissions to system defaults?')) {
      setRoles(INITIAL_ROLES);
      localStorage.setItem('acs_rbac_matrix_cache', JSON.stringify(INITIAL_ROLES));
      setHasUnsavedChanges(false);
      showToast('Roles and permissions reset to factory defaults.');
    }
  };

  // Create Custom Role Handler
  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    const base = roles.find(r => r.id === newRoleForm.baseRole) || roles[1];
    const newId = newRoleForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const created = {
      id: newId,
      name: newRoleForm.name.trim(),
      desc: newRoleForm.desc.trim() || 'Custom organizational administrative role.',
      color: 'from-violet-500 to-purple-600',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      isSystem: false,
      isGodMode: false,
      assignedUsersCount: 0,
      permissions: JSON.parse(JSON.stringify(base.permissions))
    };

    const updatedRoles = [...roles, created];
    setRoles(updatedRoles);
    localStorage.setItem('acs_rbac_matrix_cache', JSON.stringify(updatedRoles));
    setSelectedRoleKey(newId);
    setIsCreateModalOpen(false);
    setNewRoleForm({ name: '', desc: '', baseRole: 'support_admin' });
    showToast(`Created new role "${created.name}" successfully!`);
  };

  // Filter modules for matrix view
  const filteredModules = useMemo(() => {
    return SUPERADMIN_PERMISSIONS.filter(m => {
      const matchCat = categoryFilter === 'All' || m.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  // Selected Role Object
  const activeRole = roles.find(r => r.id === selectedRoleKey) || roles[0];

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

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Roles & Access Permissions
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {roles.length} Active Roles
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Define Role-Based Access Control (RBAC), enforce capability boundaries, and restrict module editing across platform staff.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#14234b] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            title="Reset to Factory System Defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Configured Roles</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{roles.length}</h3>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">4 System + {roles.length - 4} Custom</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Protected Modules</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{SUPERADMIN_PERMISSIONS.length}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">54 Granular Scopes</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Staff</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">7</h3>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Internal Operators</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Security Policy</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Enforced</h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Zero-Trust Principle</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* ── ROLE SELECTION TABS / CARDS ── */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Select Role to Inspect & Edit Access Rights:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {roles.map((r) => {
            const isSelected = selectedRoleKey === r.id;
            const IconComp = getRoleIcon(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleKey(r.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white dark:bg-[#0b142c] border-slate-200 dark:border-[#14234b] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${r.color} text-white shadow-xs`}>
                      <IconComp size={15} />
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {r.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#14234b] flex items-center justify-between text-[10px] text-slate-400">
                  <span>{r.assignedUsersCount} Staff</span>
                  {r.isGodMode ? (
                    <span className="text-rose-500 font-bold">God Mode</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Scoped</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE ROLE BANNER ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${activeRole.color} text-white`}>
            {React.createElement(getRoleIcon(activeRole?.id), { size: 20 })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Permissions Matrix for: {activeRole.name}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeRole.badge}`}>
                {activeRole.isGodMode ? 'Permanent Full Access' : 'Customizable'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeRole.desc}
            </p>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={14} /> Unsaved Changes
            </span>
            <button
              type="button"
              onClick={handleSaveMatrix}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Save Matrix
            </button>
          </div>
        )}
      </div>

      {/* ── TOOLBAR: SEARCH & CATEGORY FILTER ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search module capabilities (e.g. backup, invoices, tenants, gateways)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {PERMISSION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-[#070f24] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#14234b]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PERMISSION MATRIX TABLE ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#14234b] bg-slate-50/70 dark:bg-[#070f24] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 w-2/5">Platform Module & Scope</th>
                <th className="py-3.5 px-4 text-center">Category</th>
                <th className="py-3.5 px-4 text-center">👁️ View / Read</th>
                <th className="py-3.5 px-4 text-center">✏️ Create & Edit</th>
                <th className="py-3.5 px-4 text-center">🗑️ Delete / Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#14234b]/60 text-xs text-slate-700 dark:text-slate-300">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldCheck size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No capabilities found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different term.</p>
                  </td>
                </tr>
              ) : (
                filteredModules.map((m) => {
                  const currentMod = activeRole.permissions[m.id] || { view: false, edit: false, delete: false };
                  const isLockedGod = activeRole.isGodMode;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#14234b]/30 transition-colors"
                    >
                      {/* Column 1: Module Info */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {m.name}
                            {isLockedGod && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                                [God Mode]
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {m.desc}
                          </p>
                        </div>
                      </td>

                      {/* Column 2: Category */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#070f24] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#14234b]">
                          {m.category}
                        </span>
                      </td>

                      {/* Column 3: View Permission */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLockedGod}
                          onClick={() => handleToggleCapability(activeRole.id, m.id, 'view')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed ${
                            currentMod.view
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-[#070f24] text-slate-400 border border-slate-200 dark:border-[#14234b]'
                          }`}
                          title={isLockedGod ? 'Permanently unlocked for Super Admin' : 'Toggle Read Permission'}
                        >
                          {currentMod.view ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                        </button>
                      </td>

                      {/* Column 4: Edit Permission */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLockedGod}
                          onClick={() => handleToggleCapability(activeRole.id, m.id, 'edit')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed ${
                            currentMod.edit
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-slate-100 dark:bg-[#070f24] text-slate-400 border border-slate-200 dark:border-[#14234b]'
                          }`}
                          title={isLockedGod ? 'Permanently unlocked for Super Admin' : 'Toggle Edit Permission'}
                        >
                          {currentMod.edit ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                        </button>
                      </td>

                      {/* Column 5: Delete Permission */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLockedGod}
                          onClick={() => handleToggleCapability(activeRole.id, m.id, 'delete')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed ${
                            currentMod.delete
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-slate-100 dark:bg-[#070f24] text-slate-400 border border-slate-200 dark:border-[#14234b]'
                          }`}
                          title={isLockedGod ? 'Permanently unlocked for Super Admin' : 'Toggle Delete Permission'}
                        >
                          {currentMod.delete ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE CUSTOM ROLE MODAL ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#14234b]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create New Custom Role
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Define custom capability presets for dedicated operations staff.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Support Analyst"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this role responsible for?"
                  value={newRoleForm.desc}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Template to Clone Permissions From
                </label>
                <select
                  value={newRoleForm.baseRole}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, baseRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="support_admin">Clone from Customer Support Admin</option>
                  <option value="billing_admin">Clone from Billing & Finance Admin</option>
                  <option value="technical_admin">Clone from Technical & DevOps Admin</option>
                  <option value="compliance_officer">Clone from Compliance Officer</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#14234b] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#14234b] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Create & Configure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RolesPermissions;
