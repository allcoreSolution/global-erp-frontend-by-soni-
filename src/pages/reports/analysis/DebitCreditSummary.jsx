import React from 'react';
import { Scale, Download, Printer, Filter } from 'lucide-react';

const DebitCreditSummary = () => {
  const data = [
    { period: 'April 2026', debit: 4500000, credit: 4500000, vouchers: 345 },
    { period: 'May 2026', debit: 3800000, credit: 3800000, vouchers: 280 },
    { period: 'June 2026', debit: 5200000, credit: 5200000, vouchers: 410 },
    { period: 'July 2026', debit: 4100000, credit: 4100000, vouchers: 315 },
    { period: 'August 2026', debit: 4900000, credit: 4900000, vouchers: 390 },
    { period: 'September 2026', debit: 2100000, credit: 2100000, vouchers: 150 },
  ];

  const totalDebit = data.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = data.reduce((acc, curr) => acc + curr.credit, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Scale className="text-emerald-600" size={22} /> Debit / Credit Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Analysis matrices matching total debit transfers and credit balances.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-emerald-200 rounded-lg flex items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-emerald-600" />
          <span className="text-gray-500">Financial Year:</span>
          <select className="border p-1.5 rounded">
            <option>FY 2026-2027</option>
            <option>FY 2025-2026</option>
          </select>
        </div>
        <div className="text-emerald-700 font-extrabold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ledgers 100% Balanced
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Period (Month)</th>
              <th className="p-3 text-center">Vouchers Count</th>
              <th className="p-3 text-right">Total Debit (₹)</th>
              <th className="p-3 text-right">Total Credit (₹)</th>
              <th className="p-3 text-right">Difference (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => {
              const diff = item.debit - item.credit;
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.period}</td>
                  <td className="p-3 text-center text-gray-600">{item.vouchers}</td>
                  <td className="p-3 text-right font-medium text-blue-700">{item.debit.toLocaleString()}</td>
                  <td className="p-3 text-right font-medium text-rose-700">{item.credit.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-emerald-600">{diff === 0 ? 'NIL' : diff}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-slate-100 border-t font-extrabold">
            <tr>
              <td colSpan="2" className="p-3 text-right text-gray-800 uppercase text-[10px]">Grand Total</td>
              <td className="p-3 text-right text-blue-800">₹ {totalDebit.toLocaleString()}</td>
              <td className="p-3 text-right text-rose-800">₹ {totalCredit.toLocaleString()}</td>
              <td className="p-3 text-right text-emerald-700">NIL</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DebitCreditSummary;
