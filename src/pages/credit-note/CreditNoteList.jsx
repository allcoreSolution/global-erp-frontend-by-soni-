import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Printer, Plus, Trash2, Eye, FileText, CheckCircle } from 'lucide-react';

const CreditNoteList = () => {
  const [creditNotes, setCreditNotes] = useState([
    {
      id: 'CN-2026-001',
      customerName: 'Amit Sharma (Retail)',
      originalInvoice: 'INV-2026-1122',
      date: '2026-08-11',
      amount: 12000,
      taxAmount: 2160,
      totalAmount: 14160,
      reason: 'Sales Return (Incorrect Spec)',
      status: 'Approved'
    },
    {
      id: 'CN-2026-002',
      customerName: 'Superstone Enterprises',
      originalInvoice: 'INV-2026-1145',
      date: '2026-08-13',
      amount: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      reason: 'Rate Adjustment / Trade Discount',
      status: 'Pending'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete Credit Note ${id}?`)) {
      setCreditNotes(prev => prev.filter(item => item.id !== id));
      addLog(`Deleted Credit Note ${id}`);
    }
  };

  const handleExportCSV = () => {
    addLog("Exporting credit notes registry to CSV...");
    const headers = ['Credit Note ID', 'Customer Name', 'Original Invoice', 'Date', 'Amount (₹)', 'Tax (₹)', 'Total Amount (₹)', 'Reason', 'Status'];
    const rows = creditNotes.map(item => [
      item.id,
      item.customerName,
      item.originalInvoice,
      item.date,
      item.amount,
      item.taxAmount,
      item.totalAmount,
      item.reason,
      item.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `credit_notes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Credit notes CSV exported.");
  };

  const handlePrint = () => {
    addLog("Spooling print system dialog for Credit Notes registry...");
    window.print();
  };

  const filtered = creditNotes.filter(d =>
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Credit Notes Register</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Record and track sales returns, customer discounts, and price reductions.</p>
        </div>
        <Link
          to="/credit-note/new"
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors no-print"
        >
          <Plus size={14} /> New Credit Note
        </Link>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save the credit note registers and customer ledger offsets to local CSV.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered list of credit notes directly to printing or PDF.</p>
          </div>
          <button onClick={handlePrint} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Print / PDF Page
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><FileText size={14} className="text-emerald-600" /> Ledger Audits</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Check current customer ledger balances and adjustment adjustments.</p>
          </div>
          <button onClick={() => addLog("Directing user to customer ledgers utilities...")} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Review Ledger Balances
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Customer name, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table List */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Credit Note ID</th>
                <th className="p-2 whitespace-nowrap">Customer</th>
                <th className="p-2 whitespace-nowrap">Original Invoice</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap text-right">Taxable Amount</th>
                <th className="p-2 whitespace-nowrap text-right">GST Tax</th>
                <th className="p-2 whitespace-nowrap text-right">Total Amount</th>
                <th className="p-2 whitespace-nowrap">Reason</th>
                <th className="p-2 whitespace-nowrap text-center">Status</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{d.id}</td>
                    <td className="p-2 font-medium text-gray-800">{d.customerName}</td>
                    <td className="p-2 font-mono text-gray-600">{d.originalInvoice}</td>
                    <td className="p-2 text-gray-550 whitespace-nowrap">{d.date}</td>
                    <td className="p-2 text-right font-semibold text-slate-700">₹ {d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-medium text-red-655">₹ {d.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-bold text-emerald-700">₹ {d.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-gray-600 italic max-w-[150px] truncate">{d.reason}</td>
                    <td className="p-2 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        d.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-55 text-amber-800 border border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-2 text-center whitespace-nowrap space-x-1 no-print">
                      <button onClick={() => addLog(`Previewing Credit Note Voucher ${d.id}`)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1 hover:bg-red-55 rounded text-red-600">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500 italic">No credit notes found matching parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-slate-805 mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-600" /> Operations Logs
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 h-24 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className="text-slate-700">{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No actions recorded yet. Perform operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditNoteList;
