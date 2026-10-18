import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Keyboard,
  BookOpen,
  MessageSquare,
  Play,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Support');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketMsg, setTicketMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My Tickets State
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get('/support/tickets');
      if (res.data?.success) {
        setMyTickets(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const shortcuts = [
    { key: 'F2', action: 'Open Sale Entry Page' },
    { key: 'F3', action: 'Open Purchase Entry Page' },
    { key: 'F4', action: 'Open Receipt Voucher Entry' },
    { key: 'F5', action: 'Open Payment Voucher Entry' },
    { key: 'F6', action: 'Open Bank Receipt Entry' },
    { key: 'F7', action: 'Open Bank Payment Entry' },
    { key: 'F8', action: 'Open Journal Voucher Entry' },
    { key: 'F9', action: 'Open Item/Stock View Directory' },
    { key: 'F10', action: 'Open Stock Entry Page' },
    { key: 'F11', action: 'Open Stock Transfer Page' },
    { key: 'Ctrl + L', action: 'Open Ledger Reports Finder' },
    { key: 'Ctrl + O', action: 'Open Accounts Outstanding Analysis' },
  ];

  const faqs = [
    { q: 'How do I backup the ERP database?', a: 'Navigate to SETUP > Backup & Restore. Click the "Create Backup Now" button to download a manual snapshot. You can also configure automatic cloud backup timings there.' },
    { q: 'How to use the hold/recall bill system in POS?', a: 'Inside the POS billing terminal, if you wish to pause the current customer bill, click the "Hold Bill" button. Click "Recall" to restore it anytime.' },
    { q: 'Where do I find mismatch details for GST filings?', a: 'Go to REPORTS > GST Reports > Reconciliation. Under this tab, you will see a detailed comparison of your input tax vs output tax and invoice numbers.' },
    { q: 'How can I recalculate ledger balances or clear cache?', a: 'Navigate to SETUP > Utilities. Click "Clear Cache" to speed up operations, or run "Match Balances" to recalculate ledger balances.' }
  ];

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMsg.trim()) {
      toast.warning('Please fill in both Subject and Message');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/support/tickets', {
        subject: ticketSubject.trim(),
        description: ticketMsg.trim(),
        category: ticketCategory,
        priority: ticketPriority
      });

      if (res.data?.success) {
        toast.success(`Support Ticket ${res.data.data?.ticketNumber || ''} registered successfully!`);
        setTicketSubject('');
        setTicketMsg('');
        fetchMyTickets();
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to register support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status = 'Open') => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} /> In Progress
          </span>
        );
      case 'Waiting for Customer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Awaiting Reply
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Open
          </span>
        );
    }
  };

  const filteredShortcuts = shortcuts.filter(s =>
    s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs min-h-screen space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <HelpCircle className="text-indigo-600" size={26} />
            Help, Contact & Support Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search user manuals, lookup keyboard navigation shortcuts, watch tutorials, or raise support tickets directly to Super Admin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMyTickets}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RotateCcw size={13} className={loadingTickets ? 'animate-spin' : ''} />
            Refresh Tickets
          </button>
        </div>
      </div>

      {/* Search Documentation Bar */}
      <div className="relative max-w-xl mx-auto text-center space-y-2 py-2">
        <h2 className="text-sm font-bold text-slate-700">How can we help you today?</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search keyboard shortcuts, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none bg-slate-50/50"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Shortcuts Directory */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
            <Keyboard size={15} className="text-indigo-600" /> Keyboard Shortcuts
          </h3>
          <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1 no-scrollbar">
            {filteredShortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-xl hover:bg-slate-50 text-[11px] transition">
                <span className="text-indigo-600 font-extrabold font-mono bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {s.key}
                </span>
                <span className="text-slate-600 font-medium text-right">{s.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: FAQs & Guides */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
            <BookOpen size={15} className="text-indigo-600" /> Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200/70 rounded-xl overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 text-left font-semibold text-xs text-slate-800 bg-slate-50/60 hover:bg-slate-100/80 transition"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {activeFaq === idx && (
                  <p className="p-3 text-xs text-slate-600 leading-relaxed border-t border-slate-200/70 bg-white">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tutorials */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Video Guide</h4>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600 rounded-lg shrink-0">
                <Play size={18} fill="currentColor" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Billing Terminal & GST Setup</div>
                <div className="text-[10px] text-slate-500">Learn barcode scanner setup & invoice printing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & Real Support Ticket Form */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600" />
              Raise Support Ticket
            </h3>
            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
              Live Support
            </span>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Issue Subject *</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. GST invoice series mismatch / Tax rounding"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="General Support">General Support</option>
                  <option value="Billing & Subscription">Billing & Subscription</option>
                  <option value="Technical / Bug">Technical / Bug</option>
                  <option value="GST & Taxation">GST & Taxation</option>
                  <option value="Payroll & HRMS">Payroll & HRMS</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Detailed Message *</label>
              <textarea
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                rows={4}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                placeholder="Describe your question or issue in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit Support Ticket
                </>
              )}
            </button>
          </form>

          {/* Contact Details */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-indigo-600 shrink-0" />
              <span>support@allcore.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-indigo-600 shrink-0" />
              <span>+91 22-1234-5678 (Mon-Sat 10 AM - 7 PM)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── My Submitted Support Tickets Section ── */}
      <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={17} className="text-indigo-600" />
              My Raised Support Tickets ({myTickets.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track the status of queries submitted to Super Admin and view responses.
            </p>
          </div>
          <button
            onClick={fetchMyTickets}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <RotateCcw size={12} className={loadingTickets ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loadingTickets ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading your tickets...</div>
        ) : myTickets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No support tickets raised yet. Fill out the form above to submit a query to Super Admin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Ticket #</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold font-mono text-indigo-600">
                      {t.ticketNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {t.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details / Thread Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 text-xs">
                    {selectedTicket.ticketNumber}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Initial Description</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.messages?.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    m.senderType === 'Support' || m.senderType === 'SuperAdmin'
                      ? 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
                      : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-75">
                    <span>{m.senderName} ({m.senderType})</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
