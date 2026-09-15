import React, { useState } from 'react';
import { CreditCard, Search, Download, Printer, Filter } from 'lucide-react';

const PaymentRegister = () => {
  const [transactions] = useState([
    { id: 'PAY-2026-001', date: '2026-09-02', party: 'Acme Distributors Ltd.', refNo: 'NEFT-1002', amount: 25000, mode: 'Bank Transfer', status: 'Cleared' },
    { id: 'PAY-2026-002', date: '2026-09-04', party: 'Office Expense', refNo: 'CASH-99', amount: 4500, mode: 'Cash', status: 'Cleared' },
    { id: 'PAY-2026-003', date: '2026-09-08', party: 'Electroparts India', refNo: 'CHQ-00912', amount: 12000, mode: 'Cheque', status: 'Pending' }
  ]);

  const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCleared = transactions.filter(t => t.status === 'Cleared').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-teal-600" size={22} /> Payment Register
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Voucher payment lists sent to vendors, salary heads, or operational expenses.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-teal-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-teal-600" />
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>All Modes</option>
          <option>Cash</option>
          <option>Cheque</option>
          <option>Bank Transfer</option>
        </select>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-01" />
        <span className="text-gray-400">to</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total Payments Logged</span>
          <span className="text-base font-extrabold text-blue-700">₹ {totalAmount.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Cleared Payments</span>
          <span className="text-base font-extrabold text-rose-700">₹ {totalCleared.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Payment ID</th>
              <th className="p-3">Party / Paid To</th>
              <th className="p-3">Ref No</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-3">{t.date}</td>
                <td className="p-3 font-mono font-bold text-teal-600">{t.id}</td>
                <td className="p-3 font-semibold text-gray-800">{t.party}</td>
                <td className="p-3 text-gray-500">{t.refNo}</td>
                <td className="p-3 text-gray-700">{t.mode}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-3 text-right font-extrabold text-rose-700">₹ {t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentRegister;
