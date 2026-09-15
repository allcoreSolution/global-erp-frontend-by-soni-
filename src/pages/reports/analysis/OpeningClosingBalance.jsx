import React from 'react';
import { RefreshCw, Download, Printer, Filter } from 'lucide-react';

const OpeningClosingBalance = () => {
  const data = [
    { account: 'Cash in Hand', group: 'Asset', opening: 25000, closing: 45000 },
    { account: 'HDFC Bank', group: 'Asset', opening: 100000, closing: 350000 },
    { account: 'Sundry Debtors', group: 'Asset', opening: 450000, closing: 310000 },
    { account: 'Sundry Creditors', group: 'Liability', opening: -220000, closing: -180000 },
    { account: 'Closing Stock', group: 'Asset', opening: 380000, closing: 420000 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="text-amber-600" size={22} /> Opening / Closing Balance
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Opening ledger margins and closing balances summaries for seasonal cycle audits.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-amber-600" />
        <span className="text-gray-500">Financial Year:</span>
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>FY 2026-2027</option>
          <option>FY 2025-2026</option>
        </select>
        <button className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700">Apply Filter</button>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Ledger Account</th>
              <th className="p-3">Account Group</th>
              <th className="p-3 text-right">Opening Balance (₹)</th>
              <th className="p-3 text-right">Closing Balance (₹)</th>
              <th className="p-3 text-right">Net Change (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => {
              const change = Math.abs(item.closing) - Math.abs(item.opening);
              const changeIndicator = item.group === 'Asset' 
                ? (change >= 0 ? 'text-emerald-600' : 'text-rose-600')
                : (change >= 0 ? 'text-rose-600' : 'text-emerald-600'); // Increase in liability is 'bad' (rose)
              
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.account}</td>
                  <td className="p-3 text-gray-500">{item.group}</td>
                  <td className="p-3 text-right text-gray-700">
                    {Math.abs(item.opening).toLocaleString()} {item.opening > 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className="p-3 text-right font-bold text-gray-800">
                    {Math.abs(item.closing).toLocaleString()} {item.closing > 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className={`p-3 text-right font-extrabold ${changeIndicator}`}>
                    {change > 0 ? '▲' : change < 0 ? '▼' : '-'} {Math.abs(change).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpeningClosingBalance;
