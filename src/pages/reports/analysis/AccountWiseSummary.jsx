import React, { useState } from 'react';
import { Briefcase, Download, Printer, Filter } from 'lucide-react';

const AccountWiseSummary = () => {
  const [data] = useState([
    { group: 'Indirect Expenses', account: 'Office Rent A/c', opening: 0, debit: 120000, credit: 0, closing: 120000 },
    { group: 'Indirect Expenses', account: 'Salary A/c', opening: 0, debit: 450000, credit: 0, closing: 450000 },
    { group: 'Direct Incomes', account: 'Sales Revenue', opening: 0, debit: 0, credit: 1500000, closing: -1500000 },
    { group: 'Sundry Debtors', account: 'Amit Sharma', opening: 15000, debit: 45000, credit: 20000, closing: 40000 },
    { group: 'Sundry Creditors', account: 'Acme Traders', opening: -25000, debit: 15000, credit: 50000, closing: -60000 },
    { group: 'Bank Accounts', account: 'HDFC Bank', opening: 100000, debit: 500000, credit: 250000, closing: 350000 },
  ]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={22} /> Account-wise Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Comparative evaluation summaries of individual accounting categories.</p>
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
        <span className="text-gray-500">Account Group:</span>
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>All Groups</option>
          <option>Indirect Expenses</option>
          <option>Sundry Debtors</option>
          <option>Bank Accounts</option>
        </select>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Filter</button>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Account Group</th>
              <th className="p-3">Ledger Name</th>
              <th className="p-3 text-right">Opening Bal (₹)</th>
              <th className="p-3 text-right">Debit (Dr) (₹)</th>
              <th className="p-3 text-right">Credit (Cr) (₹)</th>
              <th className="p-3 text-right">Closing Bal (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-gray-500">{item.group}</td>
                <td className="p-3 font-semibold text-gray-800">{item.account}</td>
                <td className="p-3 text-right text-gray-600 font-mono">
                  {item.opening !== 0 ? (Math.abs(item.opening).toLocaleString() + (item.opening > 0 ? ' Dr' : ' Cr')) : '-'}
                </td>
                <td className="p-3 text-right font-medium text-blue-700">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-medium text-rose-700">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-extrabold text-indigo-700">
                  {item.closing !== 0 ? (Math.abs(item.closing).toLocaleString() + (item.closing > 0 ? ' Dr' : ' Cr')) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountWiseSummary;
