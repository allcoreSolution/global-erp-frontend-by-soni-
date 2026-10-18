import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Package,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  RotateCw,
  X,
  Check
} from 'lucide-react';
import api from '../../api';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Renewal Modal State
  const [renewingItem, setRenewingItem] = useState(null);
  const [plans, setPlans] = useState([]);
  const [renewalCycle, setRenewalCycle] = useState('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [renewingLoading, setRenewingLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch real subscriptions from API
  const fetchSubscriptions = async () => {
    setRefreshing(true);
    setError('');
    try {
      const res = await api.get('/companies/subscriptions');
      if (res.data?.success) {
        setSubscriptions(res.data.subscriptions || []);
        if (res.data.stats) setStats(res.data.stats);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Failed to load subscriptions from API:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to subscriptions API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch plans for renewal modal
  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      const planList = Array.isArray(res.data) ? res.data : (res.data?.plans || []);
      setPlans(planList);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, []);

  // Quick Status Toggle
  const handleToggleStatus = async (item) => {
    try {
      await api.patch(`/companies/${item._id}/status`);
      showToast(`Subscription status toggled.`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Error updating status.');
    }
  };

  // Open Renew Modal
  const handleOpenRenew = (item) => {
    setRenewingItem(item);
    setRenewalCycle(item.billingCycle || 'yearly');
    setSelectedPlanId(item.plan?._id || item.plan || '');
  };

  // Submit Renewal
  const handleSaveRenewal = async (e) => {
    e.preventDefault();
    if (!renewingItem) return;

    setRenewingLoading(true);
    try {
      const daysToAdd = renewalCycle === 'yearly' ? 365 : 30;
      const res = await api.post(`/companies/${renewingItem._id}/renew`, {
        durationDays: daysToAdd,
        billingCycle: renewalCycle,
        planId: selectedPlanId || undefined
      });

      showToast(res.data?.message || 'Subscription renewed successfully!');
      setRenewingItem(null);
      fetchSubscriptions();
    } catch (err) {
      console.error('Renewal failed:', err);
      showToast(err.response?.data?.message || 'Error renewing subscription.');
    } finally {
      setRenewingLoading(false);
    }
  };

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(item => {
      const name = (item.companyName || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      const planName = (item.plan?.name || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || code.includes(term) || planName.includes(term);
      if (!matchesSearch) return false;

      if (statusFilter !== 'All') {
        if (statusFilter === 'Active' && item.status !== 'Active') return false;
        if (statusFilter === 'Expiring Soon' && item.status !== 'Expiring Soon') return false;
        if (statusFilter === 'Expired' && (item.status !== 'Expired' && item.status !== 'Suspended')) return false;
      }

      return true;
    });
  }, [subscriptions, searchTerm, statusFilter]);

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
              <CreditCard size={12} className="text-blue-600 dark:text-blue-400" />
              Subscription Lifecycle Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Client Subscriptions & Billing Status
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Track live multi-tenant subscription contracts, monitor expiry countdowns, manage renewals, and control active tenant access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSubscriptions}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/super-admin/plans"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <Package size={15} />
              Plans & Pricing
            </Link>

            <Link
              to="/super-admin/companies/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
            >
              <Plus size={16} />
              Provision Company
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Subscriptions
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Client Tenancies</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Active Contracts
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.active}
          </div>
          <div className="text-xs text-slate-400 mt-1">Healthy & Accessible</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Expiring Soon
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {stats.expiringSoon}
          </div>
          <div className="text-xs text-slate-400 mt-1">Due Within 15 Days</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Expired / Suspended
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {stats.expired}
          </div>
          <div className="text-xs text-slate-400 mt-1">Requires Immediate Renewal</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, code, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
          {['All', 'Active', 'Expiring Soon', 'Expired'].map(s => (
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

      {/* Subscriptions Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-blue-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Fetching active subscriptions from database...
          </div>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 sm:p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 mx-auto mb-4">
            <CreditCard size={28} />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {searchTerm || statusFilter !== 'All' ? 'No Matching Subscriptions' : 'No Active Subscriptions Yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            {searchTerm || statusFilter !== 'All'
              ? 'Try modifying your search query or reset filters.'
              : 'Register a client company to start provisioning active subscriptions with module quotas.'}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <div className="mt-6">
              <Link
                to="/super-admin/companies/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus size={16} />
                Provision First Subscription
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
                  <th className="py-4 px-5">Client / Tenant</th>
                  <th className="py-4 px-5">Active Plan</th>
                  <th className="py-4 px-5">Expiry & Countdown</th>
                  <th className="py-4 px-5">Quotas Usage</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredSubscriptions.map(sub => {
                  const plan = sub.plan;
                  const price = plan?.price || 0;
                  const days = sub.daysRemaining;

                  let countdownBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (days <= 0) {
                    countdownBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (days <= 15) {
                    countdownBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <tr
                      key={sub._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tenant */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {sub.companyName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {sub.companyName}
                            </div>
                            <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                              {sub.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {plan?.name || 'Custom Plan'}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-extrabold mt-0.5">
                          ₹{Number(price).toLocaleString('en-IN')}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            /{sub.billingCycle}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.allowedModules?.length || 12} Modules enabled
                        </div>
                      </td>

                      {/* Expiry & Countdown */}
                      <td className="py-4 px-5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${countdownBadge}`}>
                          <Clock size={12} />
                          {days <= 0 ? 'Expired' : `${days} Days Left`}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                          Valid till: <b>{sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime'}</b>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300">
                        <div>
                          Users: <b className="text-slate-900 dark:text-white">{sub.usersCount}</b> / {sub.usersMax} Seats
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Branches: <b className="text-slate-900 dark:text-white">{sub.branchesCount}</b> / {sub.branchesMax} Max
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          sub.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.status === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            sub.status === 'Active' ? 'bg-emerald-500' : sub.status === 'Expiring Soon' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRenew(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-blue-300 text-xs font-bold transition-all border border-blue-200 dark:border-blue-800"
                            title="Renew or Extend Subscription"
                          >
                            <RotateCw size={13} />
                            Renew
                          </button>

                          <button
                            onClick={() => handleToggleStatus(sub)}
                            className={`p-2 rounded-xl transition-colors ${
                              sub.status === 'Active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Toggle Access"
                          >
                            <span className="text-xs font-bold">
                              {sub.status === 'Active' ? 'Pause' : 'Resume'}
                            </span>
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

      {/* Renew Subscription Modal */}
      {renewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setRenewingItem(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 font-bold">
                <RotateCw size={18} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Renew / Extend Contract
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Client: <b>{renewingItem.companyName}</b> ({renewingItem.code})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-5">
              {/* Plan Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Subscription Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} - ₹{p.price || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Renewal Duration / Cycle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Extend Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRenewalCycle('monthly')}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                      renewalCycle === 'monthly'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold">+30 Days</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Monthly Extension</div>
                  </div>

                  <div
                    onClick={() => setRenewalCycle('yearly')}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${
                      renewalCycle === 'yearly'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold">+365 Days</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Annual Extension</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>Current Expiry: <b>{renewingItem.expiryDate ? new Date(renewingItem.expiryDate).toLocaleDateString() : 'N/A'}</b></div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Will extend from today or from current expiry date seamlessly.
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRenewingItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={renewingLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {renewingLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Extending Contract...
                    </>
                  ) : (
                    'Confirm Renewal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscriptions;
