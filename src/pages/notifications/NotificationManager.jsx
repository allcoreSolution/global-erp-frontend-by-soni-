import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Megaphone,
  AlertTriangle,
  Clock,
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Eye,
  Building2,
  Users,
  User,
  Globe,
  ShieldAlert,
  Flame,
  Info,
  X,
  Check,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

const NotificationManager = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const isSuperAdmin = location.pathname.startsWith('/super-admin') || userRole === 'SuperAdmin';

  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  // Targets for Create Modal (Companies & Users)
  const [targets, setTargets] = useState({ companies: [], users: [] });
  const [isTargetsLoading, setIsTargetsLoading] = useState(false);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'alert',
    priority: 'medium',
    targetType: 'all', // 'all', 'company', 'user'
    targetCompany: '',
    targetUser: ''
  });

  // Fetch Notification List
  const fetchNotificationList = async () => {
    try {
      const res = await api.get('/notifications/list');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications list:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Targets (Companies, Users)
  const fetchTargets = async () => {
    setIsTargetsLoading(true);
    try {
      const res = await api.get('/notifications/targets');
      if (res.data?.success) {
        setTargets(res.data.data || { companies: [], users: [] });
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setIsTargetsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationList();
    fetchTargets();
  }, [location.pathname]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotificationList();
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      message: '',
      type: 'alert',
      priority: 'medium',
      targetType: 'all',
      targetCompany: targets.companies?.[0]?._id || '',
      targetUser: targets.users?.[0]?._id || ''
    });
    setIsCreateOpen(true);
  };

  // Submit Notification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.warning('Please provide both Title and Message');
      return;
    }

    if (isSuperAdmin) {
      if (formData.targetType === 'company' && !formData.targetCompany) {
        toast.warning('Please select a Target Company');
        return;
      }
      if (formData.targetType === 'user' && !formData.targetUser) {
        toast.warning('Please select a Target User');
        return;
      }
    } else {
      // Company Admin
      if (formData.targetType === 'user' && !formData.targetUser) {
        toast.warning('Please select a Target Employee');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority,
        targetType: formData.targetType,
        targetCompany: formData.targetType === 'company' ? formData.targetCompany : undefined,
        targetUser: formData.targetType === 'user' ? formData.targetUser : undefined
      };

      const res = await api.post('/notifications', payload);
      if (res.data?.success) {
        toast.success('Notification created and dispatched successfully!');
        setIsCreateOpen(false);
        fetchNotificationList();
        // Dispatch event for instant header notification count update
        window.dispatchEvent(new Event('notificationChanged'));
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch notification');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as Read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
      window.dispatchEvent(new Event('notificationChanged'));
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark All As Read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/clear-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
      window.dispatchEvent(new Event('notificationChanged'));
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  // Delete Notification
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (selectedNotif?._id === id) setIsDetailOpen(false);
      toast.success('Notification deleted successfully');
      window.dispatchEvent(new Event('notificationChanged'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesMessage = n.message?.toLowerCase().includes(q);
        const matchesSender = n.senderName?.toLowerCase().includes(q) || n.sender?.name?.toLowerCase().includes(q);
        const matchesCompany = n.targetCompany?.companyName?.toLowerCase().includes(q);
        const matchesUser = n.targetUser?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage && !matchesSender && !matchesCompany && !matchesUser) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'ALL' && n.type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && (n.priority || 'medium').toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // Target filter
      if (targetFilter !== 'ALL') {
        if (targetFilter === 'all' && n.targetType !== 'all') return false;
        if (targetFilter === 'company' && n.targetType !== 'company') return false;
        if (targetFilter === 'user' && n.targetType !== 'user') return false;
      }

      return true;
    });
  }, [notifications, searchTerm, typeFilter, priorityFilter, targetFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = notifications.length;
    const announcements = notifications.filter(n => n.type === 'announcement' || n.targetType === 'all').length;
    const alerts = notifications.filter(n => n.type === 'alert' || n.priority === 'urgent' || n.priority === 'high').length;
    const reminders = notifications.filter(n => n.type === 'reminder' || n.type === 'message').length;
    return { total, announcements, alerts, reminders };
  }, [notifications]);

  // Helpers for Badges
  const getPriorityBadge = (priority = 'medium') => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Low
          </span>
        );
    }
  };

  const getTypeBadge = (type = 'alert') => {
    switch (type.toLowerCase()) {
      case 'announcement':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Megaphone size={12} />
            Announcement
          </span>
        );
      case 'reminder':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Clock size={12} />
            Reminder
          </span>
        );
      case 'message':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <MessageSquare size={12} />
            Direct Message
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <AlertTriangle size={12} />
            System Alert
          </span>
        );
    }
  };

  const getTargetBadge = (n) => {
    if (n.targetType === 'all') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <Globe size={11} />
          {isSuperAdmin ? 'All System' : 'All Employees'}
        </span>
      );
    }
    if (n.targetType === 'company') {
      const cName = n.targetCompany?.companyName || 'Specific Company';
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <Building2 size={11} />
          {cName}
        </span>
      );
    }
    if (n.targetType === 'user') {
      const uName = n.targetUser?.name || n.targetUser?.username || 'Specific User';
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <User size={11} />
          {uName}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400">
        General
      </span>
    );
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
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 mb-2 border border-white/10">
                <Sparkles size={13} className="text-amber-400" />
                {isSuperAdmin ? 'Super Admin Communication Center' : 'Company Broadcast & Notification Desk'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Bell className="text-amber-400" size={28} />
                Notifications & Broadcasts
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                {isSuperAdmin
                  ? 'Send instant platform notifications, reminders, and alerts targeted to All Companies, a Specific Company, or Specific Users.'
                  : 'Send internal company notifications, memos, and reminders to all staff members or specific employees.'}
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
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all border border-white/10"
              >
                <CheckCircle2 size={14} />
                Mark All Read
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus size={16} />
                Send Notification
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Total Notifications</span>
              <Bell size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Logged in system</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Announcements</span>
              <Megaphone size={16} className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.announcements}
            </div>
            <div className="text-[11px] text-purple-500 dark:text-purple-400 mt-1 font-medium">Global broadcasts</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Priority Alerts</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.alerts}
            </div>
            <div className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">Urgent / High priority</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Reminders & Tasks</span>
              <Clock size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.reminders}
            </div>
            <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium">Actionable items</div>
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
                placeholder="Search title, message, sender..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Target Filter */}
              <select
                value={targetFilter}
                onChange={e => setTargetFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Audiences</option>
                <option value="all">Broadcast (All)</option>
                <option value="company">Specific Company</option>
                <option value="user">Specific User</option>
              </select>
            </div>
          </div>

          {/* Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {['ALL', 'alert', 'reminder', 'announcement', 'message'].map((typeKey) => {
              const active = typeFilter === typeKey;
              return (
                <button
                  key={typeKey}
                  onClick={() => setTypeFilter(typeKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {typeKey === 'ALL' ? 'All Types' : typeKey.charAt(0).toUpperCase() + typeKey.slice(1) + 's'}
                </button>
              );
            })}
            <span className="text-[11px] text-slate-400 ml-auto">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
          </div>
        </div>

        {/* ── Notification List Cards ── */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <RotateCcw className="animate-spin text-blue-500 mx-auto mb-3" size={28} />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No notifications found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm || typeFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter filters to view notifications.'
                : 'No notifications or broadcasts have been dispatched yet. Click "Send Notification" to create one.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus size={14} />
              Create First Notification
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isRead = notif.read;
              return (
                <div
                  key={notif._id}
                  onClick={() => { setSelectedNotif(notif); setIsDetailOpen(true); }}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 md:p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/40 cursor-pointer ${
                    !isRead
                      ? 'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getTypeBadge(notif.type)}
                        {getPriorityBadge(notif.priority)}
                        {getTargetBadge(notif)}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
                        )}
                        <span className="text-[11px] text-slate-400 ml-auto md:ml-2">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white pt-1">
                        {notif.title}
                      </h4>

                      {/* Message Preview */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Sender & Actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left md:text-right text-[11px]">
                        <span className="text-slate-400">Sent by: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {notif.senderName || notif.sender?.name || 'Administrator'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {notif.senderRole || 'Admin'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1" onClick={e => e.stopPropagation()}>
                        {!isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedNotif(notif); setIsDetailOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {(isSuperAdmin || String(notif.sender?._id || notif.sender) === String(localStorage.getItem('userId'))) && (
                          <button
                            onClick={(e) => handleDelete(notif._id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── CREATE NOTIFICATION MODAL ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Dispatch New Notification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isSuperAdmin
                      ? 'Target All System, Specific Company, or Specific User'
                      : 'Send to All Company Employees or Specific Employee'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* ── 1. Target Audience Selector ── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  1. Target Audience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: All */}
                  <div
                    onClick={() => setFormData(p => ({ ...p, targetType: 'all' }))}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                      formData.targetType === 'all'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Globe size={14} />
                      {isSuperAdmin ? 'All System' : 'All Staff'}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isSuperAdmin ? 'Every company & user' : 'All company employees'}
                    </span>
                  </div>

                  {/* Option 2: Company (Super Admin only) */}
                  {isSuperAdmin && (
                    <div
                      onClick={() => setFormData(p => ({ ...p, targetType: 'company' }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                        formData.targetType === 'company'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <Building2 size={14} />
                        Specific Company
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Select a company
                      </span>
                    </div>
                  )}

                  {/* Option 3: Specific User */}
                  <div
                    onClick={() => setFormData(p => ({ ...p, targetType: 'user' }))}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                      formData.targetType === 'user'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <User size={14} />
                      {isSuperAdmin ? 'Specific User' : 'Specific Employee'}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Direct notification
                    </span>
                  </div>
                </div>

                {/* Sub-dropdowns based on selection */}
                {isSuperAdmin && formData.targetType === 'company' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Select Target Company *
                    </label>
                    <select
                      value={formData.targetCompany}
                      onChange={e => setFormData(p => ({ ...p, targetCompany: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Choose Company --</option>
                      {targets.companies?.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.companyName} ({c.email || 'No email'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.targetType === 'user' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Select Recipient {isSuperAdmin ? 'User' : 'Employee'} *
                    </label>
                    <select
                      value={formData.targetUser}
                      onChange={e => setFormData(p => ({ ...p, targetUser: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose Recipient --</option>
                      {targets.users?.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name || u.username} ({u.role?.name || u.role || 'Staff'}) {u.company?.companyName ? `- ${u.company.companyName}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ── 2. Type & Priority ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Notification Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="alert">System Alert (Warning)</option>
                    <option value="reminder">Reminder (Task/Action)</option>
                    <option value="announcement">Announcement (General)</option>
                    <option value="message">Direct Message (Memo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              {/* ── 3. Title ── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Scheduled Maintenance Window / Important GST Filing Reminder"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ── 4. Message Content ── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Write complete notice or reminder details here..."
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RotateCcw size={14} className="animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Dispatch Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW NOTIFICATION DETAIL MODAL ── */}
      {isDetailOpen && selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(selectedNotif.type)}
                  {getPriorityBadge(selectedNotif.priority)}
                  {getTargetBadge(selectedNotif)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {selectedNotif.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedNotif.message}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Dispatched By</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedNotif.senderName || selectedNotif.sender?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedNotif.senderRole || 'Admin'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date & Time</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(selectedNotif.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {(isSuperAdmin || String(selectedNotif.sender?._id || selectedNotif.sender) === String(localStorage.getItem('userId'))) ? (
                <button
                  onClick={(e) => handleDelete(selectedNotif._id, e)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                {!selectedNotif.read && (
                  <button
                    onClick={(e) => {
                      handleMarkAsRead(selectedNotif._id, e);
                      setIsDetailOpen(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
