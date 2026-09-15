import React, { useState } from 'react';
import { DollarSign, Search, Download, Printer, Filter } from 'lucide-react';

const CashBook = () => {
  const [openingBalance] = useState(150000);
  const [transactions] = useState([
    { id: 'REC-2026-11', date: '2026-09-02', particulars: 'Cash Sales', refNo: 'CS-001', receipt: 25000, payment: 0, balance: 175000 },
    { id: 'PAY-2026-08', date: '2026-09-04', particulars: 'Office Expenses', refNo: 'EXP-12', receipt: 0, payment: 4500, balance: 170500 },
    { id: 'CNTR-2026-01', date: '2026-09-05', particulars: 'Cash Deposit to Bank', refNo: 'DEP-99', receipt: 0, payment: 50000, balance: 120500 }
  ]);

  const totalReceipts = transactions.reduce((acc, curr) => acc + curr.receipt, 0);
  const totalPayments = transactions.reduce((acc, curr) => acc + curr.payment, 0);
  const closingBalance = transactions[transactions.length - 1]?.balance || openingBalance;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-amber-600" size={22} /> Cash Book
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Daily cash transaction flows, closing balance, and physical cash assets check.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-amber-600" />
        <span className="text-gray-500">Date Range:</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-01" />
        <span className="text-gray-400">to</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600">Apply Filter</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-gray-500">Opening Balance</span>
          <span className="text-base font-extrabold text-gray-800">₹ {openingBalance.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Total Receipts (+)</span>
          <span className="text-base font-extrabold text-emerald-700">₹ {totalReceipts.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Payments (-)</span>
          <span className="text-base font-extrabold text-rose-700">₹ {totalPayments.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50/30 border border-amber-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-600">Closing Cash Balance</span>
          <span className="text-base font-extrabold text-amber-700">₹ {closingBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Voucher ID</th>
              <th className="p-3">Particulars</th>
              <th className="p-3">Ref No</th>
              <th className="p-3 text-right">Receipts (₹)</th>
              <th className="p-3 text-right">Payments (₹)</th>
              <th className="p-3 text-right">Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-3">{t.date}</td>
                <td className="p-3 font-mono font-bold text-amber-600">{t.id}</td>
                <td className="p-3 font-semibold text-gray-800">{t.particulars}</td>
                <td className="p-3 text-gray-500">{t.refNo}</td>
                <td className="p-3 text-right font-bold text-emerald-700">{t.receipt > 0 ? t.receipt.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-rose-700">{t.payment > 0 ? t.payment.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-gray-800">{t.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBook;
