import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RotateCcw,
  User,
  Send,
  X,
  ChevronDown,
  Trash2,
  Eye,
  Check,
  Tag,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

const SupportTickets = () => {
  // State
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & Drawers
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [createForm, setCreateForm] = useState({
    subject: '',
    description: '',
    category: 'General Support',
    priority: 'Medium'
  });
  const [creating, setCreating] = useState(false);

  // Fetch Tickets from Real Backend API
  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      if (res.data?.success) {
        setTickets(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Companies for create modal
  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      if (res.data?.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCompanies();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  // Status Change Handler
  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const res = await api.put(`/support/tickets/${ticketId}`, { status: newStatus });
      if (res.data?.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? { ...t, status: newStatus } : t))
        );
        if (activeTicket?._id === ticketId) {
          setActiveTicket(prev => ({ ...prev, status: newStatus }));
        }
        toast.success(`Ticket status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update ticket status');
    }
  };

  // Send Reply Handler
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.warning('Please enter a reply message');
      return;
    }
    if (!activeTicket) return;

    setSendingReply(true);
    try {
      const payload = {
        message: replyText.trim(),
        status: replyStatus || (activeTicket.status === 'Open' ? 'In Progress' : activeTicket.status)
      };

      const res = await api.post(`/support/tickets/${activeTicket._id}/reply`, payload);
      if (res.data?.success) {
        const updated = res.data.data;
        setActiveTicket(updated);
        setTickets(prev => prev.map(t => (t._id === updated._id ? updated : t)));
        setReplyText('');
        setReplyStatus('');
        toast.success('Reply dispatched successfully!');
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      toast.error('Failed to dispatch reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Delete Ticket Handler
  const handleDeleteTicket = async (ticketId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;

    try {
      const res = await api.delete(`/support/tickets/${ticketId}`);
      if (res.data?.success) {
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        if (activeTicket?._id === ticketId) setActiveTicket(null);
        toast.success('Ticket deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      toast.error('Failed to delete ticket');
    }
  };

  // Create Ticket Submit
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.subject.trim() || !createForm.description.trim()) {
      toast.warning('Subject and description are required');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/support/tickets', createForm);
      if (res.data?.success) {
        toast.success('Ticket registered successfully!');
        setShowCreateModal(false);
        setCreateForm({
          subject: '',
          description: '',
          category: 'General Support',
          priority: 'Medium'
        });
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register ticket');
    } finally {
      setCreating(false);
    }
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = (t.ticketNumber || '').toLowerCase().includes(q);
        const matchesSub = (t.subject || '').toLowerCase().includes(q);
        const matchesUser = (t.userName || t.user?.name || '').toLowerCase().includes(q);
        const matchesComp = (t.companyName || t.company?.companyName || '').toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        if (!matchesNum && !matchesSub && !matchesUser && !matchesComp && !matchesDesc) {
          return false;
        }
      }

      if (selectedStatus !== 'All' && t.status !== selectedStatus) {
        return false;
      }

      if (selectedPriority !== 'All' && t.priority !== selectedPriority) {
        return false;
      }

      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, selectedStatus, selectedPriority, selectedCategory]);

  // Metrics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  // Priority Badge
  const getPriorityBadge = (priority = 'Medium') => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400">
            Low
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = (status = 'Open') => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Resolved / Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={12} />
            In Progress (Process)
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles size={12} />
            Open
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top Header Banner ── */}
        <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-purple-200 mb-2 border border-white/10">
                <ShieldCheck size={13} className="text-emerald-400" />
                Super Admin Support Desk
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <MessageSquare className="text-purple-400" size={28} />
                Company Support Tickets
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Directly review, respond to, process (In Progress), and complete (Resolve) support queries raised by companies and users across Global ERP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all border border-white/10"
                title="Refresh list"
              >
                <RotateCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Plus size={16} />
                Log Ticket
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Total Tickets</span>
              <MessageSquare size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Submitted in system</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Open Tickets</span>
              <Sparkles size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {stats.open}
            </div>
            <div className="text-[11px] text-blue-500 dark:text-blue-400 mt-1 font-medium">Needs initial response</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>In Progress (Process)</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {stats.inProgress}
            </div>
            <div className="text-[11px] text-amber-500 dark:text-amber-400 mt-1 font-medium">Being processed</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Completed / Resolved</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.resolved}
            </div>
            <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium">Fully settled</div>
          </div>
        </div>

        {/* ── Filters & Controls Bar ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, subject, company, user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="General Support">General Support</option>
                <option value="GST & Taxation">GST & Taxation</option>
                <option value="Technical / Bug">Technical / Bug</option>
                <option value="Billing & Subscription">Billing & Subscription</option>
                <option value="Payroll & HRMS">Payroll & HRMS</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((statusKey) => {
              const active = selectedStatus === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {statusKey === 'All' ? 'All Statuses' : statusKey === 'Resolved' ? 'Completed / Resolved' : statusKey}
                </button>
              );
            })}
            <span className="text-[11px] text-slate-400 ml-auto">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </span>
          </div>
        </div>

        {/* ── Tickets Table ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RotateCcw className="animate-spin text-purple-600 mx-auto mb-3" size={28} />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading support tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No support tickets found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No tickets match your filter criteria or no support queries have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket #</th>
                    <th className="py-3 px-4">Company & Requester</th>
                    <th className="py-3 px-4">Subject & Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Date Logged</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => setActiveTicket(t)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {t.ticketNumber}
                      </td>

                      {/* Company & Requester */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span>{t.companyName || t.company?.companyName || 'Global User'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <User size={11} className="shrink-0" />
                          <span>{t.userName || t.user?.name || 'Customer'}</span>
                        </div>
                      </td>

                      {/* Subject & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {t.subject}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {t.category}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        {getPriorityBadge(t.priority)}
                      </td>

                      {/* Status + 1-Click Switcher */}
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateStatus(t._id, e.target.value)}
                          className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                        >
                          <option value="Open">🔵 Open</option>
                          <option value="In Progress">🟡 In Progress (Process)</option>
                          <option value="Resolved">🟢 Resolved (Completed)</option>
                          <option value="Closed">⚫ Closed</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(t.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveTicket(t)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition flex items-center gap-1"
                          >
                            <Eye size={13} />
                            View & Reply
                          </button>
                          <button
                            onClick={(e) => handleDeleteTicket(t._id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                            title="Delete Ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── VIEW TICKET & CONVERSATION THREAD DRAWER / MODAL ── */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-6 space-y-4 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                    {activeTicket.ticketNumber}
                  </span>
                  {getPriorityBadge(activeTicket.priority)}
                  {getStatusBadge(activeTicket.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {activeTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Buttons */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 mr-1">Update Status:</span>
              <button
                type="button"
                onClick={() => handleUpdateStatus(activeTicket._id, 'In Progress')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTicket.status === 'In Progress'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50'
                }`}
              >
                🟡 Set In Progress (Process)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(activeTicket._id, 'Resolved')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTicket.status === 'Resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                🟢 Set Completed (Resolved)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(activeTicket._id, 'Closed')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTicket.status === 'Closed'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚫ Close Ticket
              </button>
            </div>

            {/* Requester Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Company Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {activeTicket.companyName || activeTicket.company?.companyName || 'General User'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Category: {activeTicket.category}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Raised By User</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {activeTicket.userName || activeTicket.user?.name || 'Customer'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Email: {activeTicket.userEmail || activeTicket.user?.email || 'N/A'}
                </div>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 no-scrollbar text-xs">
              {/* Initial Query Description */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>Initial Issue Description</span>
                  <span>{formatDate(activeTicket.createdAt)}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeTicket.description}
                </p>
              </div>

              {/* Thread Messages */}
              {(activeTicket.messages || []).map((m, idx) => {
                const isSuperAdminSender = m.senderType === 'Support' || m.senderType === 'SuperAdmin';
                return (
                  <div
                    key={m._id || idx}
                    className={`p-3.5 rounded-2xl border ${
                      isSuperAdminSender
                        ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40 ml-4'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                      <span className={isSuperAdminSender ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}>
                        {m.senderName} ({isSuperAdminSender ? 'Super Admin' : 'Company User'})
                      </span>
                      <span className="text-slate-400 font-normal">{formatDate(m.createdAt)}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                      {m.message || m.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Super Admin Reply Box */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Reply to Company / User:
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your official solution or query response here..."
                required
                className="w-full p-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">After reply, set status:</span>
                  <select
                    value={replyStatus}
                    onChange={e => setReplyStatus(e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="">Keep current status</option>
                    <option value="In Progress">Set In Progress (Process)</option>
                    <option value="Resolved">Set Resolved (Completed)</option>
                    <option value="Closed">Set Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTicket(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-500/25 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {sendingReply ? (
                      <>
                        <RotateCcw size={14} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LOG NEW TICKET MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-purple-600" />
                Log Support Ticket
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))}
                  required
                  placeholder="e.g. GST E-Way Bill sync error"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="General Support">General Support</option>
                    <option value="GST & Taxation">GST & Taxation</option>
                    <option value="Technical / Bug">Technical / Bug</option>
                    <option value="Billing & Subscription">Billing & Subscription</option>
                    <option value="Payroll & HRMS">Payroll & HRMS</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  required
                  placeholder="Provide complete details..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportTickets;
