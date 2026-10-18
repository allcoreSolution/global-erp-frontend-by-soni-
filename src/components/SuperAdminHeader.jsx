import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  ExternalLink,
  CheckCircle2,
  Maximize,
  Minimize,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import superAdminAvatar from '../assets/superadmin-avatar.jpg';
import api from '../api';

const SuperAdminHeader = ({ onMenuClick, onToggleDesktopSidebar }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Quick modules for search
  const searchableModules = [
    { name: 'Dashboard', path: '/super-admin', category: 'General' },
    { name: 'Subscriptions', path: '/super-admin/subscriptions', category: 'Company & Tenant' },
    { name: 'Plans & Pricing', path: '/super-admin/plans', category: 'Company & Tenant' },
    { name: 'Modules Configuration', path: '/super-admin/modules', category: 'Company & Tenant' },
    { name: 'Registered Companies', path: '/super-admin/companies', category: 'Company & Tenant' },
    { name: 'All Employees', path: '/super-admin/users', category: 'Users & Roles' },
    // { name: 'Roles & Permissions', path: '/super-admin/roles', category: 'Users & Roles' },
    { name: 'User Activity & Logs', path: '/super-admin/user-activity', category: 'Users & Roles' },
    { name: 'Support Tickets', path: '/super-admin/support', category: 'Communication' },
    { name: 'Notifications & Broadcasts', path: '/super-admin/notifications', category: 'Communication' },
    { name: 'System Settings', path: '/super-admin/settings', category: 'System' },
    { name: 'Backup & Restore', path: '/super-admin/backup', category: 'System' }
  ];

  const filteredResults = searchQuery.trim()
    ? searchableModules.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Ctrl + K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target) && !searchInputRef.current?.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('permissions');
    localStorage.removeItem('modulePermissions');
    localStorage.removeItem('user');
    localStorage.removeItem('companyName');
    localStorage.removeItem('erp_company');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_fy');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  const [liveNotifications, setLiveNotifications] = useState([]);

  const fetchSuperNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        const msgs = (res.data.data?.messages || []).map(m => ({ ...m, category: 'message' }));
        const rems = (res.data.data?.reminders || []).map(r => ({ ...r, category: 'reminder' }));
        setLiveNotifications([...rems, ...msgs]);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchSuperNotifications();
    const handleNotif = () => fetchSuperNotifications();
    window.addEventListener('notificationChanged', handleNotif);
    const interval = setInterval(fetchSuperNotifications, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationChanged', handleNotif);
    };
  }, []);

  const handleMarkAllSuperRead = async () => {
    try {
      await api.put('/notifications/clear-all');
      setLiveNotifications([]);
      window.dispatchEvent(new Event('notificationChanged'));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-14 bg-white dark:bg-[#070d1e] border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between select-none relative z-30 transition-colors">
      {/* ── Left Section: Menu Toggle & Search Bar ── */}
      <div className="flex items-center gap-3">
        {/* Mobile / Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={() => {
            if (onMenuClick) onMenuClick();
            if (onToggleDesktopSidebar) onToggleDesktopSidebar();
          }}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-lg dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Vertical Divider */}
        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800/90 mx-1" />

        {/* Search Bar matching screenshot */}
        <div className="relative">
          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-[#0c1633] border border-slate-200 dark:border-blue-900/40 rounded-xl px-3 py-1.5 w-56 sm:w-80 md:w-96 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xs">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search anything..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none font-medium"
            />
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#16234b]/80 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.5 rounded shrink-0 select-none shadow-xs">
              Ctrl + K
            </kbd>
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div
              ref={searchDropdownRef}
              className="absolute left-0 top-12 w-full bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto no-scrollbar"
            >
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No modules found for "{searchQuery}"
                </div>
              ) : (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.category}
                      </div>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Section: Notifications, Theme, Profile ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white p-2 rounded-xl dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={19} />
            {liveNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {liveNotifications.length > 9 ? '9+' : liveNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Notifications ({liveNotifications.length})
                </span>
                {liveNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllSuperRead}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto no-scrollbar">
                {liveNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications or alerts
                  </div>
                ) : (
                  liveNotifications.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/super-admin/notifications');
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                          {n.title || 'Notice'}
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {n.time || 'Active'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-2">
                        {n.text || n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/super-admin/notifications');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All in Notification Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white p-2 rounded-xl dark:hover:bg-white/10 transition-colors cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? (
            <Minimize size={19} className="text-slate-600 dark:text-slate-300" />
          ) : (
            <Maximize size={19} className="text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* Sun / Moon Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white p-2 rounded-xl dark:hover:bg-white/10 transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun size={19} className="text-amber-400 animate-spin-slow" />
          ) : (
            <Moon size={19} className="text-slate-600" />
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800/90 mx-1 sm:mx-2" />

        {/* Super Admin User Profile matching screenshot */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            {/* Avatar matching screenshot with purple ring */}
            <div className="w-9 h-9 rounded-full ring-2 ring-purple-500/80 overflow-hidden bg-purple-900/40 shrink-0">
              <img
                src={superAdminAvatar}
                alt="Super Admin"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/superadmin-avatar.jpg";
                }}
              />
            </div>

            {/* User Title & Role */}
            <div className="hidden sm:block text-left">
              <div className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">
                Super Admin
              </div>
              <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">
                Administrator
              </div>
            </div>

            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-60 bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left py-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full ring-2 ring-purple-500/80 overflow-hidden shrink-0">
                  <img
                    src={superAdminAvatar}
                    alt="Super Admin"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">Super Admin</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">superadmin@gmail.com</div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/super-admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  <span>Admin Profile</span>
                </Link>
                <Link
                  to="/super-admin/user-activity"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Clock size={14} className="text-slate-400" />
                  <span>User Activity & Logs</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminHeader;
