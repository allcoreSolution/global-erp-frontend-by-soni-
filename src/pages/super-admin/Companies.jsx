import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  Tag,
  KeyRound,
  Copy,
  Check,
  Trash2,
  Eye,
  ChevronDown,
  X,
  Sparkles,
  Layers,
  Users,
  Power,
  Package,
  Edit3
} from 'lucide-react';
import api from '../../api';

const Companies = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [viewingCompany, setViewingCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstin: '',
    subscriptionPlan: '',
    billingCycle: 'yearly',
    subscriptionStatus: 'Active'
  });
  const [deletingId, setDeletingId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch real companies from backend
  const fetchCompanies = async () => {
    setRefreshing(true);
    setError('');
    try {
      const res = await api.get('/companies');
      if (res.data && Array.isArray(res.data)) {
        setCompanies(res.data);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('Error fetching companies from API:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to companies API');
      setCompanies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load plans for edit modal
  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(Array.isArray(res.data) ? res.data : (res.data?.plans || []));
    } catch (err) {
      console.error('Error fetching plans in Companies.jsx:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setEditForm({
      name: company.name || '',
      code: company.code || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      gstin: company.gstin || '',
      subscriptionPlan: company.subscriptionPlan?._id || company.subscriptionPlan || '',
      billingCycle: company.billingCycle || 'yearly',
      subscriptionStatus: company.subscriptionStatus || (company.isActive ? 'Active' : 'Suspended')
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;

    setSavingEdit(true);
    try {
      const res = await api.put(`/companies/${editingCompany._id}`, editForm);
      const updated = res.data?.company || { ...editingCompany, ...editForm };
      
      setCompanies(prev => prev.map(c => c._id === editingCompany._id ? {
        ...c,
        ...updated,
        subscriptionPlan: plans.find(p => p._id === editForm.subscriptionPlan) || c.subscriptionPlan
      } : c));

      showToast(`Company "${editForm.name}" updated successfully!`);
      setEditingCompany(null);
    } catch (err) {
      console.error('Failed to update company:', err);
      showToast(err.response?.data?.message || 'Error updating company.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Active/Suspended status
  const handleToggleStatus = async (company) => {
    const prevStatus = company.subscriptionStatus || (company.isActive ? 'Active' : 'Suspended');
    const newStatus = prevStatus === 'Active' ? 'Suspended' : 'Active';

    // Optimistic update
    setCompanies(prev => prev.map(c => c._id === company._id ? {
      ...c,
      isActive: newStatus === 'Active',
      subscriptionStatus: newStatus
    } : c));

    try {
      await api.patch(`/companies/${company._id}/status`);
      showToast(`Company "${company.name}" is now ${newStatus}`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(`Failed to update status on server.`);
      fetchCompanies();
    }
  };

  // Delete Company
  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to delete company "${company.name}"? This will permanently delete its tenant instance and associated users.`)) {
      return;
    }

    setDeletingId(company._id);
    try {
      await api.delete(`/companies/${company._id}`);
      setCompanies(prev => prev.filter(c => c._id !== company._id));
      showToast(`Company "${company.name}" deleted successfully.`);
      if (viewingCompany?._id === company._id) setViewingCompany(null);
    } catch (err) {
      console.error('Failed to delete company:', err);
      showToast(err.response?.data?.message || 'Error deleting company from server.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const name = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const adminEmail = (c.adminUser?.email || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || code.includes(term) || email.includes(term) || adminEmail.includes(term);
      if (!matchesSearch) return false;

      if (statusFilter !== 'All') {
        const currentStatus = c.subscriptionStatus || (c.isActive ? 'Active' : 'Suspended');
        if (statusFilter.toLowerCase() !== currentStatus.toLowerCase()) return false;
      }

      return true;
    });
  }, [companies, searchTerm, statusFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(c => (c.subscriptionStatus || (c.isActive ? 'Active' : 'Suspended')) === 'Active').length;
    const suspended = total - active;
    const totalMaxUsers = companies.reduce((acc, c) => acc + (Number(c.maxUsers) || 10), 0);
    return { total, active, suspended, totalMaxUsers };
  }, [companies]);

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-bold border border-slate-700 animate-slideDown">
          <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 mb-2">
              <Building2 size={12} className="text-blue-600 dark:text-blue-400" />
              SaaS Multi-Tenant Registry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Companies & Client Tenants
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage client business organizations, monitor subscription status, view assigned module limits, and control tenant access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCompanies}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/super-admin/companies/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
            >
              <Plus size={16} />
              Register New Company
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Tenants
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1">Live Database Records</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Active Companies
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.active}
          </div>
          <div className="text-xs text-slate-400 mt-1">Full System Access</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Suspended
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {stats.suspended}
          </div>
          <div className="text-xs text-slate-400 mt-1">Login Blocked</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Allocated Users
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {stats.totalMaxUsers}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Licensed Seats</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, email, or admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
          {['All', 'Active', 'Suspended'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Companies Table / Cards */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-blue-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Fetching registered companies from database...
          </div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 sm:p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Building2 size={28} />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {searchTerm || statusFilter !== 'All' ? 'No Matching Companies Found' : 'No Companies Registered Yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            {searchTerm || statusFilter !== 'All'
              ? 'Try modifying your search criteria or resetting filters.'
              : 'Your database does not contain any tenant companies yet. Click the button below to onboard your first business client.'}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <div className="mt-6">
              <Link
                to="/super-admin/companies/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus size={16} />
                Register First Company
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Company / Tenant</th>
                  <th className="py-4 px-5">Contact Details</th>
                  <th className="py-4 px-5">Primary Admin</th>
                  <th className="py-4 px-5">Subscription Plan</th>
                  <th className="py-4 px-5">Quotas</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredCompanies.map(c => {
                  const status = c.subscriptionStatus || (c.isActive ? 'Active' : 'Suspended');
                  const planName = c.subscriptionPlan?.name || (typeof c.subscriptionPlan === 'string' ? c.subscriptionPlan : 'Standard Plan');
                  const admin = c.adminUser;

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Company Name & Code */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer" onClick={() => setViewingCompany(c)}>
                              {c.name}
                            </div>
                            <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                              {c.code || 'NO-CODE'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-5">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {c.email || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {c.phone || c.city || '—'}
                        </div>
                      </td>

                      {/* Primary Admin */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <User size={13} className="text-indigo-500 shrink-0" />
                          <span>{admin?.username || 'Admin'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {admin?.email || '—'}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Package size={12} />
                          {planName}
                        </span>
                        {c.subscriptionExpiry && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Exp: {new Date(c.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </td>

                      {/* Quotas */}
                      <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300">
                        <div><b>{c.maxUsers || 10}</b> Max Users</div>
                        <div className="text-[11px] text-slate-400 mt-0.5"><b>{c.maxBranches || 2}</b> Branches</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                            status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCompany(c)}
                            title="View Full Tenant Details"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => navigate(`/super-admin/companies/edit/${c._id}`)}
                            title="Edit Company in Full Page"
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteCompany(c)}
                            disabled={deletingId === c._id}
                            title="Delete Company"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            {deletingId === c._id ? <RefreshCw size={16} className="animate-spin text-rose-600" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Company Details Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setViewingCompany(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 font-extrabold text-xl">
                {viewingCompany.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {viewingCompany.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingCompany.code}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    (viewingCompany.subscriptionStatus || 'Active') === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {viewingCompany.subscriptionStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 uppercase font-bold tracking-wider">Corporate Email:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{viewingCompany.email || '—'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 uppercase font-bold tracking-wider">Contact Phone:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{viewingCompany.phone || '—'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 uppercase font-bold tracking-wider">GSTIN / Tax ID:</span>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1">{viewingCompany.gstin || '—'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 uppercase font-bold tracking-wider">Registered Address:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {[viewingCompany.address, viewingCompany.city, viewingCompany.state].filter(Boolean).join(', ') || '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 sm:col-span-2">
                <span className="text-slate-400 uppercase font-bold tracking-wider">Primary Admin User:</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingCompany.adminUser?.username || 'Admin'} ({viewingCompany.adminUser?.email || '—'})
                  </span>
                  <span className="text-indigo-600 font-bold">Role: Company Admin</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingCompany(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Close
              </button>

              <button
                onClick={() => handleToggleStatus(viewingCompany)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all"
              >
                Toggle Active/Suspended
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Companies;
