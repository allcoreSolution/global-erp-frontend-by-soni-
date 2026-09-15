import React, { useState } from 'react';
import { Scale, Download, Printer, Filter } from 'lucide-react';

const TrialBalance = () => {
  const [data] = useState([
    { account: 'Cash in Hand', type: 'Asset', debit: 125000, credit: 0 },
    { account: 'HDFC Bank A/c', type: 'Asset', debit: 550000, credit: 0 },
    { account: 'Capital Account', type: 'Equity', debit: 0, credit: 1000000 },
    { account: 'Sales Revenue', type: 'Revenue', debit: 0, credit: 350000 },
    { account: 'Purchase A/c', type: 'Expense', debit: 150000, credit: 0 },
    { account: 'Salary Expense', type: 'Expense', debit: 45000, credit: 0 },
    { account: 'Office Rent', type: 'Expense', debit: 15000, credit: 0 },
    { account: 'Acme Distributors Ltd.', type: 'Liability', debit: 0, credit: 85000 },
    { account: 'Amit Sharma (Customer)', type: 'Asset', debit: 55000, credit: 0 },
    { account: 'GST Payable', type: 'Liability', debit: 0, credit: 10000 },
  ]);

  const totalDebit = data.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = data.reduce((acc, curr) => acc + curr.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Scale className="text-indigo-600" size={22} /> Trial Balance
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Verify the arithmetic accuracy of double entry ledgers.</p>
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
        <span className="text-gray-500">As on Date:</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total Debit Balance</span>
          <span className="text-xl font-extrabold text-blue-700">₹ {totalDebit.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Credit Balance</span>
          <span className="text-xl font-extrabold text-rose-700">₹ {totalCredit.toLocaleString()}</span>
        </div>
        <div className={`border p-3 rounded-lg flex flex-col justify-between ${isBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <span className={`text-[10px] uppercase font-bold ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>Status</span>
          <span className={`text-xl font-extrabold ${isBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isBalanced ? 'Matched (100% Balanced)' : `Difference: ₹ ${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Account Head</th>
              <th className="p-3">Account Group / Type</th>
              <th className="p-3 text-right">Debit Balance (₹)</th>
              <th className="p-3 text-right">Credit Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-gray-800">{item.account}</td>
                <td className="p-3 text-gray-500">{item.type}</td>
                <td className="p-3 text-right font-bold text-blue-700">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-rose-700">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-extrabold">
              <td colSpan="2" className="p-3 text-right text-gray-700 uppercase tracking-wider text-[10px]">Grand Total</td>
              <td className="p-3 text-right text-indigo-700">₹ {totalDebit.toLocaleString()}</td>
              <td className="p-3 text-right text-indigo-700">₹ {totalCredit.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialBalance;
