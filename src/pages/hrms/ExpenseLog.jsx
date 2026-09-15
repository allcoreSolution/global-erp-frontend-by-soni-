import React, { useState } from 'react';
import { Calendar, Printer, Download, FileText, Check, ShieldCheck, CreditCard, Banknote, Landmark } from 'lucide-react';

const ExpenseLog = () => {
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [logs] = useState([
    { id: 'EXP-102', name: 'Neha Gupta', type: 'Client Meeting', amount: 2400, paidDate: '2026-08-09', mode: 'UPI / GPay', approvedBy: 'ADMIN', status: 'Disbursed' },
    { id: 'EXP-103', name: 'Priya Patel', type: 'Office Stationery', amount: 850, paidDate: '2026-08-06', mode: 'Petty Cash', approvedBy: 'ADMIN', status: 'Disbursed' },
    { id: 'EXP-104', name: 'Amit Sharma', type: 'Miscellaneous', amount: 1500, paidDate: '2026-08-05', mode: 'Bank Transfer', approvedBy: 'ACCOUNTANT', status: 'Disbursed' },
    { id: 'EXP-095', name: 'Vikram Singh', type: 'Travel Expense', amount: 4800, paidDate: '2026-07-28', mode: 'Bank Transfer', approvedBy: 'ADMIN', status: 'Disbursed' },
    { id: 'EXP-096', name: 'Rajesh Kumar', type: 'Food & Meals', amount: 950, paidDate: '2026-07-25', mode: 'Petty Cash', approvedBy: 'ACCOUNTANT', status: 'Disbursed' }
  ]);

  const stats = {
    totalDisbursed: logs.reduce((acc, l) => acc + l.amount, 0),
    totalCount: logs.length,
    pettyCash: logs.filter(l => l.mode === 'Petty Cash').reduce((acc, l) => acc + l.amount, 0),
    bankTransfer: logs.filter(l => l.mode === 'Bank Transfer').reduce((acc, l) => acc + l.amount, 0)
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Employee Name', 'Expense Category', 'Disbursed Amount', 'Paid Date', 'Payment Mode', 'Approved By', 'Status'];
    const rows = logs.map(l => [l.id, l.name, l.type, l.amount, l.paidDate, l.mode, l.approvedBy, l.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Expense_Claims_Log_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={24} /> Expense Claim Status Logs
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Audit history of all employee expense claims processed, paid dates, payment channels, and authorizing signatures.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-slate-800"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded-lg transition"
          >
            <Download size={14} /> Export Log
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Printer size={14} /> Print Audit
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Paid Records</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.totalCount}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Disbursed</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">₹{stats.totalDisbursed.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Bank Disbursals</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1">₹{stats.bankTransfer.toLocaleString()}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <Landmark size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Petty Cash Disbursals</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">₹{stats.pettyCash.toLocaleString()}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Banknote size={18} />
          </div>
        </div>

      </div>

      {/* Logs Table Matrix */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Expense Claim Payment Status History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Claim ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Expense Category</th>
                <th className="p-3 text-right">Disbursed Amt (₹)</th>
                <th className="p-3">Paid Date</th>
                <th className="p-3">Payment Channel</th>
                <th className="p-3">Authorized By</th>
                <th className="p-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{l.id}</td>
                  <td className="p-3 text-slate-800 font-bold">{l.name}</td>
                  <td className="p-3 text-gray-500">{l.type}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-850">₹{l.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-600 font-mono">{l.paidDate}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 px-2 py-0.5 rounded font-bold text-[10px] border dark:border-slate-200">
                      {l.mode}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-700">{l.approvedBy}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Check size={10} /> {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ExpenseLog;
