import React, { useState } from 'react';
import { HelpCircle, Search, Keyboard, BookOpen, MessageSquare, Play, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

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
    { q: 'How do I backup the ERP database?', a: 'Navigate to SETUP > Backup & Restore. Click the "Create Backup Now" button to download a manual SQL/CSV snapshot. You can also configure automatic cloud backup timings there.' },
    { q: 'How to use the hold/recall bill system in POS?', a: 'Inside the POS billing terminal, if you wish to pause the current customer\'s bill, click the "Hold Bill" button. The bill is added to the top right queue. Click "Recall" to restore it anytime.' },
    { q: 'Where do I find mismatch details for GST filings?', a: 'Go to REPORTS > GST Reports > Reconciliation. Under this tab, you will see a detailed comparison of your input tax vs output tax and mismatched invoice numbers.' },
    { q: 'How can I matching ledger balances or clear system cache?', a: 'Navigate to SETUP > Utilities. Click "Clear Cache" to speed up operations, or run "Match Balances" to recalculate ledger ledger due balances dynamically.' }
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) {
      alert("Please fill in both Subject and Message!");
      return;
    }
    alert("Support Ticket Registered Successfully!\nOur executive will contact you shortly.");
    setTicketSubject('');
    setTicketMsg('');
  };

  const filteredShortcuts = shortcuts.filter(s => 
    s.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-8">
      {/* Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="text-indigo-600" size={24} /> Help & Support Documentation
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Search user manuals, lookup keyboard navigation shortcuts, watch tutorials, or raise tickets.
          </p>
        </div>
      </div>

      {/* Search Documentation Bar */}
      <div className="relative max-w-xl mx-auto text-center space-y-2 py-4">
        <h2 className="text-sm font-bold text-gray-700">How can we help you today?</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search keyboard shortcuts, FAQS, or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-200 dark:text-slate-700"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Shortcuts Directory */}
        <div className="border border-gray-250 rounded-xl p-4 bg-white space-y-3 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
            <Keyboard size={15} className="text-indigo-600" /> Keyboard Shortcuts
          </h3>
          <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-1">
            {filteredShortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border rounded-lg hover:bg-slate-50 text-[11px] transition">
                <span className="text-indigo-600 font-extrabold font-mono bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">{s.key}</span>
                <span className="text-gray-600 font-medium text-right">{s.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Accordion FAQs */}
        <div className="border border-gray-250 rounded-xl p-4 bg-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
            <BookOpen size={15} className="text-indigo-600" /> Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 text-left font-bold text-[11px] text-slate-800 bg-slate-50/50 hover:bg-slate-100 transition"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {activeFaq === idx && (
                  <p className="p-3 text-[11px] text-gray-600 leading-relaxed border-t bg-white">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tutorials Video Cards */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Video Guides</h4>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition border">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center text-indigo-600 rounded">
                <Play size={18} fill="currentColor" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-850">Billing Terminal Setup</div>
                <div className="text-[9px] text-gray-500">Learn to use barcode scanner & thermal billing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & Support Ticket */}
        <div className="border border-gray-250 rounded-xl p-4 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
            <MessageSquare size={15} className="text-indigo-600" /> Help Desk Ticket
          </h3>

          <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-600 mb-1">Issue Subject</label>
              <input 
                type="text" 
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Printer driver not formatting"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Detailed Message</label>
              <textarea 
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                className="w-full h-24 p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Describe your issue or custom request here..."
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold text-xs rounded shadow-xs transition"
            >
              Submit Ticket
            </button>
          </form>

          {/* Contact Details */}
          <div className="pt-4 border-t space-y-2 text-[11px] text-slate-650">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-blue-500" />
              <span>support@allcore.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-blue-500" />
              <span>+91 22-1234-5678 (Mon-Sat 10AM to 7PM)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpSupport;
