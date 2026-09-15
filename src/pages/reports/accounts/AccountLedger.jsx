import React, { useState } from 'react';
import { BookOpen, Search, Download, Printer, Filter } from 'lucide-react';

const AccountLedger = () => {
  const [openingBalance] = useState(15000);
  const [transactions] = useState([
    { id: 'JR-001', date: '2026-09-01', particulars: 'Office Rent Payment', refNo: 'INV-889', debit: 5000, credit: 0, balance: 10000 },
    { id: 'JR-002', date: '2026-09-02', particulars: 'Internet Bill', refNo: 'BILL-442', debit: 1200, credit: 0, balance: 8800 },
    { id: 'REC-003', date: '2026-09-03', particulars: 'Refund from Vendor', refNo: 'REF-991', debit: 0, credit: 2000, balance: 10800 }
  ]);

  const totalDebit = transactions.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = transactions.reduce((acc, curr) => acc + curr.credit, 0);
  const closingBalance = transactions[transactions.length - 1]?.balance || openingBalance;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={22} /> Account Ledger
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Detailed transactional statements for general account heads.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-blue-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-indigo-600" />
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>Office Expenses A/C</option>
          <option>Salary A/C</option>
          <option>Marketing A/C</option>
        </select>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-01" />
        <span className="text-gray-400">to</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-gray-500">Opening Balance</span>
          <span className="text-base font-extrabold text-gray-800">₹ {openingBalance.toLocaleString()}</span>
        </div>
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total Debit</span>
          <span className="text-base font-extrabold text-blue-700">₹ {totalDebit.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Credit</span>
          <span className="text-base font-extrabold text-rose-700">₹ {totalCredit.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Closing Balance</span>
          <span className="text-base font-extrabold text-emerald-800">₹ {closingBalance.toLocaleString()}</span>
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
              <th className="p-3 text-right">Debit (₹)</th>
              <th className="p-3 text-right">Credit (₹)</th>
              <th className="p-3 text-right">Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-3">{t.date}</td>
                <td className="p-3 font-mono font-bold text-indigo-600">{t.id}</td>
                <td className="p-3 font-semibold text-gray-800">{t.particulars}</td>
                <td className="p-3 text-gray-500">{t.refNo}</td>
                <td className="p-3 text-right font-bold text-blue-700">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-rose-700">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-gray-800">{t.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountLedger;
