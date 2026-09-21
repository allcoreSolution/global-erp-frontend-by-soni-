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
  Keyboard
} from 'lucide-react';
import api from '../api';

export const TopHeader = ({ onMenuClick, onToggleDesktopSidebar }) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

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

  useEffect(() => {
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
    fetchNotifications();
    // Optional: set up polling here
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, []);

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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
    <div className="h-14 flex items-center justify-between px-2 md:px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 gap-2 transition-colors relative">
      {/* Sidebar Toggle */}
      <button
        onClick={() => {
          onMenuClick();
          if (onToggleDesktopSidebar) onToggleDesktopSidebar();
        }}
        title="Toggle Sidebar"
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Search Bar */}
      <div className="flex-1 min-w-[120px] max-w-2xl flex items-center relative">
        <Search className="absolute left-3 text-gray-400 dark:text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search Menu / Customer / Invoice / Product..."
          className="w-full pl-10 pr-4 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 dark:text-slate-100 transition-colors"
        />
        <div className="absolute right-3 text-xs text-blue-500 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded hidden sm:block">F3</div>
      </div>

      {/* Quick Actions & User Profile */}
      <div className="flex items-center gap-3 md:gap-6 ml-2 md:ml-4 min-w-0 justify-end">
        {/* Actions - Scrollable on Mobile */}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 py-1 shrink-0 lg:flex-nowrap overflow-x-auto no-scrollbar max-w-[160px] sm:max-w-[300px] md:max-w-none">

          {/* Calculator Popup */}
          <div className="relative flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" ref={calcRef}>
            <div onClick={() => setIsCalcOpen(!isCalcOpen)} className="flex flex-col items-center">
              <Calculator size={20} strokeWidth={1.5} />
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Calculator</span>
            </div>
            {isCalcOpen && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-52 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-2xl z-50 text-slate-800 dark:text-slate-100">
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
                      className={`p-2 rounded-lg font-bold transition-all shadow-xs ${char === '='
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

          {/* Notepad Popup */}
          <div className="relative flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" ref={noteRef}>
            <div onClick={() => setIsNoteOpen(!isNoteOpen)} className="flex flex-col items-center">
              <StickyNote size={20} strokeWidth={1.5} />
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Notepad</span>
            </div>
            {isNoteOpen && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-amber-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">Quick Notepad</span>
                    <span className="text-[9px] bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">Auto-saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleNotesChange('')} className="text-[10px] text-rose-600 font-bold hover:underline">Clear</button>
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

          {/* Real Dynamic Calendar Popup */}
          <div className="relative flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" ref={calRef}>
            <div onClick={() => setIsCalOpen(!isCalOpen)} className="flex flex-col items-center">
              <CalendarIcon size={20} strokeWidth={1.5} />
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Calendar</span>
            </div>
            {isCalOpen && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center mb-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold text-xs"
                  >
                    &lt;
                  </button>
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                    {calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold text-xs"
                  >
                    &gt;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-[11px] text-center font-semibold">
                  {/* Empty cells offset */}
                  {Array.from({ length: new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <span key={`empty-${i}`} className="p-1"></span>
                  ))}

                  {/* Days in month */}
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
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
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

          {/* Reminder / Notification Dropdown */}
          <div className="relative flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" ref={reminderRef}>
            <div onClick={() => setIsReminderOpen(!isReminderOpen)} className="flex flex-col items-center">
              <div className="relative">
                <Bell size={20} strokeWidth={1.5} />
                {reminders.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-xs">
                    {reminders.length}
                  </span>
                )}
              </div>
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Reminder</span>
            </div>
            {isReminderOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-slate-800 dark:text-slate-100 text-xs font-semibold">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Reminders ({reminders.length})</span>
                  {reminders.length > 0 && (
                    <button onClick={() => setReminders([])} className="text-[10px] text-blue-600 font-bold hover:underline">Clear All</button>
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
                          onClick={() => setReminders(reminders.filter(item => item.id !== r.id))}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Dropdown */}
          <div className="relative flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" ref={msgRef}>
            <div onClick={() => setIsMessageOpen(!isMessageOpen)} className="flex flex-col items-center">
              <div className="relative">
                <MessageSquare size={20} strokeWidth={1.5} />
                {messages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-xs">
                    {messages.length}
                  </span>
                )}
              </div>
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Message</span>
            </div>
            {isMessageOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-slate-800 dark:text-slate-100 text-xs font-semibold">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Unread Messages ({messages.length})</span>
                  {messages.length > 0 && (
                    <button onClick={() => setMessages([])} className="text-[10px] text-blue-600 font-bold hover:underline">Mark all read</button>
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
                          onClick={() => setMessages(messages.filter(item => item.id !== m.id))}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Modules Dropdown */}
          <div className="relative shrink-0 flex flex-col items-center" ref={addMenuRef}>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none bg-transparent border-0 p-0 text-gray-600 dark:text-gray-300"
            >
              <PlusCircle size={20} strokeWidth={1.5} />
              <span className="hidden xl:block text-[10px] mt-1 font-medium flex items-center gap-0.5">
                Add Entry <ChevronDown size={10} />
              </span>
            </button>
            {isAddMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1.5 divide-y divide-gray-150 dark:divide-slate-800 text-[11px] font-semibold">
                <div className="py-1">
                  <Link to="/sales/add-sale" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Sale Entry</Link>
                  <Link to="/purchases/add-purchase" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Purchase Entry</Link>
                  <Link to="/receipt/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Receipt Entry</Link>
                  <Link to="/payment/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Payment Entry</Link>
                </div>
                <div className="py-1">
                  <Link to="/bank-receipt/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Bank Receipt</Link>
                  <Link to="/bank-payment/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Bank Payment</Link>
                  <Link to="/contra/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Contra Entry</Link>
                  <Link to="/journal/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Journal Entry</Link>
                </div>
                <div className="py-1">
                  <Link to="/stock-entry/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Stock Entry</Link>
                  <Link to="/stock-transfer/new" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Stock Transfer</Link>
                  <Link to="/products/add-product" onClick={() => setIsAddMenuOpen(false)} className="block px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">Add Product</Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={20} strokeWidth={1.5} /> : <Maximize size={20} strokeWidth={1.5} />}
            <span className="hidden xl:block text-[10px] mt-1 font-medium">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </div>

          {/* Dark Mode */}
          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
            onClick={() => setIsDarkMode(prev => !prev)}
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDarkMode ? <Sun size={20} strokeWidth={1.5} className="text-amber-400" /> : <Moon size={20} strokeWidth={1.5} />}
            <span className="hidden xl:block text-[10px] mt-1 font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
          </div>

          <div className="relative shrink-0" ref={shortcutRef}>
            <div
              className="flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsShortcutManagerOpen(!isShortcutManagerOpen)}
              title="Manage Shortcut Keys"
            >
              <Keyboard size={20} strokeWidth={1.5} />
              <span className="hidden xl:block text-[10px] mt-1 font-medium">Shortcuts</span>
            </div>

            {isShortcutManagerOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg shadow-lg z-50 p-4 space-y-3.5 text-xs font-semibold">
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
                      <span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono min-w-[50px] text-center shadow-sm">
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

          {/* Help & Support */}
          <div className="flex flex-col items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-450 transition-colors shrink-0" onClick={() => navigate('/setup/help-support')}>
            <HelpCircle size={20} strokeWidth={1.5} />
            <span className="hidden xl:block text-[10px] mt-1 font-medium">Help</span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-800"></div>

        {/* User Profile */}
        <div className="relative" ref={adminRef}>
          <div
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-1.5 rounded-md transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold overflow-hidden border border-blue-200 dark:border-slate-700">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                {localStorage.getItem('userName') || 'ADMIN'}
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400"> Admin</div>
            </div>
            <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
          {isAdminOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-lg z-50 py-1.5 text-xs font-semibold">
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
