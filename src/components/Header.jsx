import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Calculator,
  StickyNote,
  Calendar as CalendarIcon,
  Bell,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Menu,
  MoreVertical,
  Maximize,
  Minimize,
  Sun,
  Moon,
  PlusCircle,
  X,
  Plus,
  Keyboard,
  Clock,
  Building2,
  Building,
  Check,
  Sparkles
} from 'lucide-react';
import api from '../api';
import { usePermissions } from '../utils/permissionUtils';
import { useTheme } from '../context/ThemeContext';

export const CompanySwitcherHeader = () => {
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/switch-options');
      if (res.data?.success) {
        const list = res.data.companies || [];
        setCompanies(list);
        const storedId = localStorage.getItem('active_company_id');
        let current = list.find(c => c._id === storedId);
        if (!current && list.length > 0) {
          current = list[0];
          localStorage.setItem('active_company_id', current._id);
          localStorage.setItem('companyName', current.name);
          localStorage.setItem('erp_company', current.name);
        }
        setActiveCompany(current || null);
      }
    } catch (err) {
      console.warn('Company fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchCompanies();
    const handleSwitch = () => fetchCompanies();
    window.addEventListener('companySwitched', handleSwitch);
    window.addEventListener('userUpdated', handleSwitch);
    return () => {
      window.removeEventListener('companySwitched', handleSwitch);
      window.removeEventListener('userUpdated', handleSwitch);
    };
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelect = (comp) => {
    setIsOpen(false);
    if (activeCompany?._id === comp._id) return;

    localStorage.setItem('active_company_id', comp._id);
    localStorage.setItem('companyName', comp.name);
    localStorage.setItem('erp_company', comp.name);
    setActiveCompany(comp);
    window.dispatchEvent(new Event('companySwitched'));
    window.dispatchEvent(new Event('userUpdated'));
    window.dispatchEvent(new Event('erp_config_changed'));

    // Instant smooth reload so all API calls refresh under new company isolation pass
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-850 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-slate-750 dark:hover:to-slate-800 border border-indigo-200/90 dark:border-indigo-900/60 rounded-xl transition-all cursor-pointer shadow-xs group"
        title="Click to Switch Company Workspace"
      >
        <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 uppercase shadow-xs">
          {activeCompany?.code ? activeCompany.code.substring(0, 2) : <Building2 size={12} />}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight max-w-[120px] md:max-w-[150px] xl:max-w-[190px] truncate">
            {activeCompany?.name || 'Select Company'}
          </div>
          <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wider leading-none mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeCompany?.code || 'FIRM'}</span>
          </div>
        </div>
        <ChevronDown size={13} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[80] py-2 text-slate-800 dark:text-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Switch Firm / Company
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
              {companies.length} Registered
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 py-1">
            {companies.map((comp) => {
              const isSelected = comp._id === activeCompany?._id;
              return (
                <div
                  key={comp._id}
                  onClick={() => handleSelect(comp)}
                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {comp.code ? comp.code.substring(0, 2) : <Building2 size={13} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs truncate font-bold leading-tight">
                        {comp.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                        {comp.gstin ? `GST: ${comp.gstin}` : `Code: ${comp.code || 'CO'}`}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" title="Active Workspace"></span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/company/company-master');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg shadow-2xs transition cursor-pointer"
            >
              <Plus size={13} />
              <span>Add / Manage Companies</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickPunchHeader = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendances/my-today');
      if (res.data?.success) setStatus(res.data.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const handler = () => fetchStatus();
    window.addEventListener('attendanceChanged', handler);
    return () => window.removeEventListener('attendanceChanged', handler);
  }, []);

  const handlePunch = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (!status?.hasPunchedIn) {
        const res = await api.post('/attendances/punch-in');
        alert(res.data?.message || 'Punched in successfully!');
      } else if (!status?.hasPunchedOut) {
        if (!window.confirm('Punch Out for the day?')) {
          setLoading(false);
          return;
        }
        const res = await api.post('/attendances/punch-out');
        alert(res.data?.message || 'Punched out successfully!');
      } else {
        navigate('/hrms/attendance/daily');
        setLoading(false);
        return;
      }
      fetchStatus();
      window.dispatchEvent(new Event('attendanceChanged'));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  return (
    <div className="flex items-center shrink-0">
      {!status.hasPunchedIn ? (
        <button
          onClick={handlePunch}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[10px] sm:text-[11px] rounded-lg shadow-xs transition disabled:opacity-50 shrink-0 cursor-pointer whitespace-nowrap"
          title="Click to Punch In for today"
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse shrink-0" />
          <span>{loading ? '...' : 'Punch In'}</span>
        </button>
      ) : !status.hasPunchedOut ? (
        <button
          onClick={handlePunch}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-[10px] sm:text-[11px] rounded-lg shadow-xs transition disabled:opacity-50 shrink-0 cursor-pointer whitespace-nowrap"
          title="Click to Punch Out"
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping shrink-0" />
          <span>{loading ? '...' : `Punch Out (${status.attendance?.checkIn || ''})`}</span>
        </button>
      ) : (
        <button
          onClick={() => navigate('/hrms/attendance/daily')}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer whitespace-nowrap"
          title="View Today Attendance"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Punched Out</span>
          <span className="sm:hidden">Done</span>
        </button>
      )}
    </div>
  );
};

export const TopHeader = ({ onMenuClick, onToggleDesktopSidebar }) => {
  const navigate = useNavigate();
  const { canRoute, isSuperAdmin, isAdmin } = usePermissions();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  // Live Date & Time State
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Popups & Dropdowns State
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [notes, setNotes] = useState(localStorage.getItem('quick_notes') || '');
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [calDate, setCalDate] = useState(new Date());

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminders, setReminders] = useState([]);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.success) {
        setMessages(response.data.data.messages || []);
        setReminders(response.data.data.reminders || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleNotifChanged = () => fetchNotifications();
    window.addEventListener('notificationChanged', handleNotifChanged);
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationChanged', handleNotifChanged);
    };
  }, []);

  const handleDismissReminder = async (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (e) {
      console.error('Failed to dismiss reminder', e);
    }
  };

  const handleClearAllReminders = async () => {
    setReminders([]);
    try {
      await api.put('/notifications/clear-all', { type: 'reminder' });
    } catch (e) {
      console.error('Failed to clear reminders', e);
    }
  };

  const handleDismissMessage = async (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (e) {
      console.error('Failed to dismiss message', e);
    }
  };

  const handleClearAllMessages = async () => {
    setMessages([]);
    try {
      await api.put('/notifications/clear-all', { type: 'message' });
    } catch (e) {
      console.error('Failed to clear messages', e);
    }
  };

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShortcutManagerOpen, setIsShortcutManagerOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(() => {
    return JSON.parse(localStorage.getItem('erp_shortcuts') || '{}');
  });
  const [shortcutsEnabled, setShortcutsEnabled] = useState(() => {
    return localStorage.getItem('erp_shortcuts_enabled') !== 'false';
  });

  const calcRef = useRef(null);
  const noteRef = useRef(null);
  const calRef = useRef(null);
  const reminderRef = useRef(null);
  const msgRef = useRef(null);
  const adminRef = useRef(null);
  const shortcutRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setIsAddMenuOpen(false);
      if (calcRef.current && !calcRef.current.contains(e.target)) setIsCalcOpen(false);
      if (noteRef.current && !noteRef.current.contains(e.target)) setIsNoteOpen(false);
      if (calRef.current && !calRef.current.contains(e.target)) setIsCalOpen(false);
      if (reminderRef.current && !reminderRef.current.contains(e.target)) setIsReminderOpen(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setIsMessageOpen(false);
      if (adminRef.current && !adminRef.current.contains(e.target)) setIsAdminOpen(false);
      if (shortcutRef.current && !shortcutRef.current.contains(e.target)) setIsShortcutManagerOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);



  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleCalcClick = (val) => {
    if (val === '=') {
      try {
        const evaluated = Function(`"use strict"; return (${calcInput})`)();
        setCalcInput(String(evaluated));
      } catch (err) {
        setCalcInput('Error');
      }
    } else if (val === 'C') {
      setCalcInput('');
    } else if (val === '⌫') {
      setCalcInput(prev => prev.slice(0, -1));
    } else {
      setCalcInput(prev => (prev === 'Error' ? val : prev + val));
    }
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    localStorage.setItem('quick_notes', val);
  };

  return (
    <div className="h-14 flex items-center justify-between px-2 sm:px-3 md:px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 gap-1.5 sm:gap-2 transition-colors relative z-20">
      {/* 1. Left Fixed Section: Sidebar toggle, Brand Logo & Live Date/Time */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Sidebar Toggle */}
        <button
          onClick={() => {
            onMenuClick();
            if (onToggleDesktopSidebar) onToggleDesktopSidebar();
          }}
          title="Toggle Sidebar"
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Brand Logo in Header */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
          <img 
            src="/image-removebg-preview (1).png" 
            alt="Logo" 
            className="h-7 sm:h-8 w-auto max-w-[85px] sm:max-w-[115px] object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/logo.png";
            }}
          />
        </div>

        {/* Live Date & Time Display - Adaptive Responsive */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 py-1 px-2 sm:px-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-lg select-none shrink-0">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
            <CalendarIcon size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden xl:inline">
              {currentDateTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="xl:hidden">
              {currentDateTime.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short'
              })}
            </span>
          </div>

          <span className="w-[1px] h-3 bg-slate-300 dark:bg-slate-600 shrink-0" />

          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight shrink-0">
            <Clock size={12} className="text-indigo-500 animate-pulse shrink-0" />
            <span className="hidden xl:inline">
              {currentDateTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </span>
            <span className="xl:hidden">
              {currentDateTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>

        {/* Company Switcher Dropdown (Multi-Company Architecture) */}
        <CompanySwitcherHeader />
      </div>

      {/* 2. Middle Section: All Action Buttons - Direct on Desktop, Smooth Horizontal Swipe/Scroll on Phone & Smaller Screens */}
      <div className="flex-1 min-w-0 flex items-center justify-end overflow-hidden px-1">
        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 dark:text-gray-300 overflow-x-auto no-scrollbar scroll-smooth py-1 touch-pan-x">

          {/* Calculator */}
          <div className="relative flex flex-col items-center shrink-0" ref={calcRef}>
            <button
              onClick={() => setIsCalcOpen(!isCalcOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer shrink-0"
              title="Calculator"
            >
              <Calculator size={18} strokeWidth={1.7} />
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Calc</span>
            </button>
            {isCalcOpen && (
              <div className="fixed top-[52px] right-2 sm:right-6 md:right-10 z-[70] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-2xl text-slate-800 dark:text-slate-100 w-[240px]">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Calculator</span>
                  <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => setIsCalcOpen(false)} />
                </div>
                <input
                  type="text"
                  value={calcInput}
                  readOnly
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-2 mb-2 text-right text-base font-mono font-bold focus:outline-none text-slate-900 dark:text-slate-100 shadow-inner"
                />
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {['C', '⌫', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(char => (
                    <button
                      key={char}
                      onClick={() => handleCalcClick(char)}
                      className={`p-2 rounded-lg font-bold transition-all shadow-xs cursor-pointer ${char === '='
                        ? 'bg-blue-600 hover:bg-blue-700 text-white col-span-2'
                        : ['/', '*', '-', '+', 'C', '⌫', '%'].includes(char)
                          ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Notepad */}
          <div className="relative flex flex-col items-center shrink-0" ref={noteRef}>
            <button
              onClick={() => setIsNoteOpen(!isNoteOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer shrink-0"
              title="Quick Notepad"
            >
              <StickyNote size={18} strokeWidth={1.7} />
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Notes</span>
            </button>
            {isNoteOpen && (
              <div className="fixed top-[52px] right-2 sm:right-6 md:right-10 z-[70] bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl text-slate-800 dark:text-slate-100 w-80">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-amber-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">Quick Notepad</span>
                    <span className="text-[9px] bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">Auto-saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleNotesChange('')} className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer">Clear</button>
                    <X size={14} className="cursor-pointer text-slate-500 hover:text-slate-700" onClick={() => setIsNoteOpen(false)} />
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Write quick thoughts or reminders here..."
                  className="w-full h-36 text-xs bg-amber-50/50 dark:bg-slate-950 p-2.5 focus:outline-none resize-none font-medium border border-amber-200/60 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="relative flex flex-col items-center shrink-0" ref={calRef}>
            <button
              onClick={() => setIsCalOpen(!isCalOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer shrink-0"
              title="Calendar"
            >
              <CalendarIcon size={18} strokeWidth={1.7} />
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Calendar</span>
            </button>
            {isCalOpen && (
              <div className="fixed top-[52px] right-2 sm:right-6 md:right-10 z-[70] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl text-slate-800 dark:text-slate-100 w-72">
                <div className="flex justify-between items-center mb-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold text-xs cursor-pointer"
                  >
                    &lt;
                  </button>
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                    {calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold text-xs cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-[11px] text-center font-semibold">
                  {Array.from({ length: new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <span key={`empty-${i}`} className="p-1"></span>
                  ))}
                  {Array.from({ length: new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                    const dayNum = i + 1;
                    const today = new Date();
                    const isToday = today.getDate() === dayNum &&
                      today.getMonth() === calDate.getMonth() &&
                      today.getFullYear() === calDate.getFullYear();
                    return (
                      <span
                        key={dayNum}
                        className={`p-1 rounded-md transition-all ${isToday
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {dayNum}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Modules Dropdown */}
          <div className="relative flex flex-col items-center shrink-0" ref={addMenuRef}>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer text-gray-600 dark:text-gray-300 shrink-0"
              title="Quick Add Entry"
            >
              <PlusCircle size={18} strokeWidth={1.7} />
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Add</span>
            </button>
            {isAddMenuOpen && (
              <div className="fixed top-[52px] right-2 sm:right-6 md:right-10 z-[70] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-semibold min-w-[180px]">
                {[
                  [
                    { text: 'Sale Entry', to: '/sales/add-sale' },
                    { text: 'Purchase Entry', to: '/purchases/add-purchase' },
                    { text: 'Receipt Entry', to: '/receipt/new' },
                    { text: 'Payment Entry', to: '/payment/new' }
                  ],
                  [
                    { text: 'Bank Receipt', to: '/bank-receipt/new' },
                    { text: 'Bank Payment', to: '/bank-payment/new' },
                    { text: 'Contra Entry', to: '/contra/new' },
                    { text: 'Journal Entry', to: '/journal/new' }
                  ],
                  [
                    { text: 'Stock Entry', to: '/stock-entry/new' },
                    { text: 'Stock Transfer', to: '/stock-transfer/new' },
                    { text: 'Add Product', to: '/products/add-product' }
                  ]
                ].map((group, gIdx) => {
                  const filteredGroup = group.filter(item => isSuperAdmin || isAdmin || canRoute(item.to));
                  if (filteredGroup.length === 0) return null;
                  return (
                    <div key={gIdx} className="py-1">
                      {filteredGroup.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={item.to} 
                          onClick={() => setIsAddMenuOpen(false)} 
                          className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {item.text}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="relative flex flex-col items-center shrink-0" ref={shortcutRef}>
            <button
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer shrink-0 text-gray-600 dark:text-gray-300"
              onClick={() => setIsShortcutManagerOpen(!isShortcutManagerOpen)}
              title="Manage Shortcut Keys"
            >
              <Keyboard size={18} strokeWidth={1.7} />
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Keys</span>
            </button>

            {isShortcutManagerOpen && (
              <div className="fixed top-[52px] right-2 sm:right-6 md:right-10 z-[70] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 space-y-3.5 text-xs font-semibold">
                <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Shortcut Keys</span>
                  <label className="relative inline-flex items-center cursor-pointer" title="Enable/Disable Shortcuts">
                    <input
                      type="checkbox"
                      checked={shortcutsEnabled}
                      onChange={() => {
                        const nextVal = !shortcutsEnabled;
                        setShortcutsEnabled(nextVal);
                        localStorage.setItem('erp_shortcuts_enabled', String(nextVal));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                  {[
                    { key: 'F2', label: 'Sale Entry' },
                    { key: 'F3', label: 'Purchase Entry' },
                    { key: 'F4', label: 'Receipt Entry' },
                    { key: 'F5', label: 'Payment Entry' },
                    { key: 'F6', label: 'Bank Receipt' },
                    { key: 'F7', label: 'Bank Payment' },
                    { key: 'F8', label: 'Journal Entry' },
                    { key: 'F9', label: 'Stock View' },
                    { key: 'F10', label: 'Stock Entry' },
                    { key: 'F11', label: 'Stock Transfer' },
                    { key: 'Ctrl+L', label: 'Ledger' },
                    { key: 'Ctrl+O', label: 'Outstanding' },
                  ].map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-1.5 last:border-0">
                      <span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono min-w-[50px] text-center shadow-xs">
                        {shortcut.key}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 text-[11px] text-right font-medium">
                        {shortcut.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center shrink-0 cursor-pointer text-gray-600 dark:text-gray-300" 
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} strokeWidth={1.7} /> : <Maximize size={18} strokeWidth={1.7} />}
            <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>

          {/* Reminders / Notifications */}
          <div className="relative flex flex-col items-center shrink-0" ref={reminderRef}>
            <button
              onClick={() => setIsReminderOpen(!isReminderOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer text-gray-600 dark:text-gray-300 relative shrink-0"
              title="Notifications & Reminders"
            >
              <div className="relative">
                <Bell size={18} strokeWidth={1.7} />
                {reminders.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] h-[15px] flex items-center justify-center shadow-xs">
                    {reminders.length}
                  </span>
                )}
              </div>
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Alerts</span>
            </button>
            {isReminderOpen && (
              <div className="fixed sm:absolute top-[52px] sm:top-12 right-2 sm:right-0 w-[calc(100vw-16px)] sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[70] py-1.5 text-slate-800 dark:text-slate-100 text-xs font-semibold">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Reminders ({reminders.length})</span>
                  {reminders.length > 0 && (
                    <button onClick={handleClearAllReminders} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Clear All</button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {reminders.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">No active reminders</div>
                  ) : (
                    reminders.map(r => (
                      <div key={r.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-start gap-2 group">
                        <div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{r.text}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{r.time}</span>
                        </div>
                        <X
                          size={12}
                          className="cursor-pointer text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0 mt-0.5"
                          onClick={() => handleDismissReminder(r.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setIsReminderOpen(false);
                      navigate('/setup/notifications');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View All Notifications & Broadcasts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="relative flex flex-col items-center shrink-0" ref={msgRef}>
            <button
              onClick={() => setIsMessageOpen(!isMessageOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer text-gray-600 dark:text-gray-300 relative shrink-0"
              title="Messages"
            >
              <div className="relative">
                <MessageSquare size={18} strokeWidth={1.7} />
                {messages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] h-[15px] flex items-center justify-center shadow-xs">
                    {messages.length}
                  </span>
                )}
              </div>
              <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Chat</span>
            </button>
            {isMessageOpen && (
              <div className="fixed sm:absolute top-[52px] sm:top-12 right-2 sm:right-0 w-[calc(100vw-16px)] sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[70] py-1.5 text-slate-800 dark:text-slate-100 text-xs font-semibold">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Unread Messages ({messages.length})</span>
                  {messages.length > 0 && (
                    <button onClick={handleClearAllMessages} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Mark all read</button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">No unread messages</div>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-start gap-2 group">
                        <div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{m.text}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{m.time}</span>
                        </div>
                        <X
                          size={12}
                          className="cursor-pointer text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0 mt-0.5"
                          onClick={() => handleDismissMessage(m.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center cursor-pointer shrink-0 text-gray-600 dark:text-gray-300"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDarkMode ? <Sun size={18} strokeWidth={1.7} className="text-amber-400" /> : <Moon size={18} strokeWidth={1.7} />}
            <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          {/* Help & Support */}
          <button 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center shrink-0 cursor-pointer text-gray-600 dark:text-gray-300" 
            onClick={() => navigate('/setup/help-support')}
            title="Help & Support"
          >
            <HelpCircle size={18} strokeWidth={1.7} />
            <span className="hidden 2xl:block text-[9px] mt-0.5 font-medium">Help</span>
          </button>
        </div>
      </div>

      {/* 3. Right Fixed Section: Quick Punch Button & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-1">
        {/* Quick Punch Button */}
        <QuickPunchHeader />

        <div className="h-6 w-[1px] bg-gray-200 dark:bg-slate-800 hidden sm:block shrink-0"></div>

        {/* User Profile */}
        <div className="relative shrink-0" ref={adminRef}>
          <div
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-1 sm:p-1.5 rounded-lg transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold overflow-hidden border border-blue-200 dark:border-slate-700 shrink-0">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-gray-800 dark:text-slate-100 leading-tight truncate max-w-[100px]">
                {localStorage.getItem('userName') || 'ADMIN'}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate max-w-[100px]">
                {localStorage.getItem('userRole') || 'User'}
              </div>
            </div>
            <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
          </div>
          {isAdminOpen && (
            <div className="fixed sm:absolute top-[52px] sm:top-12 right-2 sm:right-0 w-48 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-[70] py-1.5 text-xs font-semibold">
              <div className="px-4 py-2 border-b text-gray-500 dark:text-gray-400">Status: Online</div>
              <Link to="/setup/user-master" onClick={() => setIsAdminOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-850">Manage Users</Link>
              <Link to="/setup/system-settings" onClick={() => setIsAdminOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-850">Settings</Link>
              <div
                onClick={() => {
                  setIsAdminOpen(false);
                  localStorage.removeItem('isLoggedIn');
                  navigate('/login');
                }}
                className="block px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SubHeader = () => {
  const navigate = useNavigate();
  // Configurable master switcher states
  const [company, setCompany] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.company && u.company.name) return u.company.name;
    }
    return localStorage.getItem('erp_company') || 'GLOBAL ERP';
  });
  const [fy, setFy] = useState(() => localStorage.getItem('erp_fy') || '2024-2025');
  const [fyList, setFyList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('financial_years')) || ['2023-2024', '2024-2025', '2025-2026'];
    } catch {
      return ['2023-2024', '2024-2025', '2025-2026'];
    }
  });
  const [branch, setBranch] = useState(() => localStorage.getItem('erp_branch') || 'HEAD OFFICE');
  const [user, setUser] = useState(() => localStorage.getItem('userName') || localStorage.getItem('erp_user') || 'ADMIN');

  // Toggle Menus
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isFyOpen, setIsFyOpen] = useState(false);
  const [isBrOpen, setIsBrOpen] = useState(false);
  const [isUsOpen, setIsUsOpen] = useState(false);

  const compRef = useRef(null);
  const fyRef = useRef(null);
  const brRef = useRef(null);
  const usRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (compRef.current && !compRef.current.contains(e.target)) setIsCompOpen(false);
      if (fyRef.current && !fyRef.current.contains(e.target)) setIsFyOpen(false);
      if (brRef.current && !brRef.current.contains(e.target)) setIsBrOpen(false);
      if (usRef.current && !usRef.current.contains(e.target)) setIsUsOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleUserUpdated = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.company && u.company.name) {
          setCompany(u.company.name);
        }
      }
    };

    const handleConfigChange = () => {
      setFy(localStorage.getItem('erp_fy') || '2024-2025');
      try {
        setFyList(JSON.parse(localStorage.getItem('financial_years')) || ['2023-2024', '2024-2025', '2025-2026']);
      } catch {
        setFyList(['2023-2024', '2024-2025', '2025-2026']);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdated);
    window.addEventListener('erp_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated);
      window.removeEventListener('erp_config_changed', handleConfigChange);
    };
  }, []);

  const handleSelect = (setter, key, val) => {
    setter(val);
    localStorage.setItem(key, val);
    setIsCompOpen(false);
    setIsFyOpen(false);
    setIsBrOpen(false);
    setIsUsOpen(false);
    window.dispatchEvent(new Event('erp_config_changed'));
  };

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between px-4 py-2 md:py-0 md:h-14 border-b border-gray-200 dark:border-slate-800 shadow-sm gap-2 transition-colors relative">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 w-full max-w-5xl">

        {/* Company Dropdown */}
        <div className="flex flex-col w-64 relative" ref={compRef}>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Company</label>
          </div>
          <div
            onClick={() => setIsCompOpen(!isCompOpen)}
            className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-0.5 cursor-pointer group"
          >
            <span className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">{company}</span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          {isCompOpen && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded shadow-lg z-50 text-xs font-bold text-slate-850 dark:text-slate-150 py-1.5 divide-y divide-gray-100 dark:divide-slate-800">
              {[localStorage.getItem('companyName') || 'ALLCORE SOLUTION PVT. LTD.', 'GLOBAL ERP SERVICES LTD.'].map((val, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(setCompany, 'erp_company', val)}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${company === val ? 'text-blue-600' : ''}`}
                >
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Year */}
        <div className="flex flex-col w-32 relative" ref={fyRef}>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Financial Year</label>
            <Plus size={9} className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => navigate('/setup/tax-finance')} title="Add / Manage Financial Year" />
          </div>
          <div
            onClick={() => setIsFyOpen(!isFyOpen)}
            className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-0.5 cursor-pointer group"
          >
            <span className="text-xs font-bold text-gray-800 dark:text-slate-100">{fy}</span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          {isFyOpen && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded shadow-lg z-50 text-xs font-bold text-slate-850 dark:text-slate-150 py-1.5">
              {fyList.map(val => (
                <div
                  key={val}
                  onClick={() => handleSelect(setFy, 'erp_fy', val)}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${fy === val ? 'text-blue-600' : ''}`}
                >
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branch */}
        <div className="flex flex-col w-40 relative" ref={brRef}>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Branch</label>
            <Plus size={9} className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => navigate('/branch/info')} title="Add / Manage Branch" />
          </div>
          <div
            onClick={() => setIsBrOpen(!isBrOpen)}
            className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-0.5 cursor-pointer group"
          >
            <span className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate max-w-[130px]">{branch}</span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          {isBrOpen && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded shadow-lg z-50 text-xs font-bold text-slate-850 dark:text-slate-150 py-1.5">
              {['HEAD OFFICE', 'MUMBAI BRANCH', 'DELHI OUTLET', 'BANGALORE R&D'].map(val => (
                <div
                  key={val}
                  onClick={() => handleSelect(setBranch, 'erp_branch', val)}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${branch === val ? 'text-blue-600' : ''}`}
                >
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex flex-col w-32 relative" ref={usRef}>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">User</label>
            <Plus size={9} className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => navigate('/setup/user-master')} title="Add / Manage User" />
          </div>
          <div
            onClick={() => setIsUsOpen(!isUsOpen)}
            className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-0.5 cursor-pointer group"
          >
            <span className="text-xs font-bold text-gray-800 dark:text-slate-100">{user}</span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          {isUsOpen && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded shadow-lg z-50 text-xs font-bold text-slate-850 dark:text-slate-150 py-1.5">
              {['ADMIN', 'ACCOUNTANT', 'SALES EXECUTIVE', 'OPERATOR'].map(val => (
                <div
                  key={val}
                  onClick={() => handleSelect(setUser, 'erp_user', val)}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${user === val ? 'text-blue-600' : ''}`}
                >
                  {val}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="hidden md:flex flex-col items-end whitespace-nowrap ml-4">
        <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">
          {time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </span>
      </div>
    </div>
  );
};
