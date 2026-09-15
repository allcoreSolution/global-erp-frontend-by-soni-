import React from 'react';
import { TrendingUp, Download, Printer, Filter } from 'lucide-react';

const CashFlow = () => {
  const data = [
    { activity: 'Operating Activities', inflows: 1250000, outflows: 850000 },
    { activity: 'Investing Activities', inflows: 50000, outflows: 250000 },
    { activity: 'Financing Activities', inflows: 500000, outflows: 150000 }
  ];

  const totalInflows = data.reduce((acc, curr) => acc + curr.inflows, 0);
  const totalOutflows = data.reduce((acc, curr) => acc + curr.outflows, 0);
  const netCashFlow = totalInflows - totalOutflows;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={22} /> Cash Flow Statement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Visualize dynamic cash inflows, liquidity index, and operating payments.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-emerald-600">Total Cash Inflows</span>
          <span className="text-2xl font-extrabold text-emerald-800">₹ {totalInflows.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-rose-600">Total Cash Outflows</span>
          <span className="text-2xl font-extrabold text-rose-800">₹ {totalOutflows.toLocaleString()}</span>
        </div>
        <div className={`p-4 rounded-lg flex flex-col justify-between border ${netCashFlow >= 0 ? 'bg-indigo-50/50 border-indigo-200' : 'bg-amber-50/50 border-amber-200'}`}>
          <span className={`text-[11px] uppercase font-bold ${netCashFlow >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>Net Cash Flow</span>
          <span className={`text-2xl font-extrabold ${netCashFlow >= 0 ? 'text-indigo-800' : 'text-amber-800'}`}>
            {netCashFlow >= 0 ? '+' : '-'} ₹ {Math.abs(netCashFlow).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border rounded overflow-hidden text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Cash Flow Activity</th>
              <th className="p-3 text-right bg-emerald-50/30">Cash Inflows (₹)</th>
              <th className="p-3 text-right bg-rose-50/30">Cash Outflows (₹)</th>
              <th className="p-3 text-right font-bold">Net Activity Flow (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => {
              const net = item.inflows - item.outflows;
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.activity}</td>
                  <td className="p-3 text-right text-emerald-700">{item.inflows.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-700">{item.outflows.toLocaleString()}</td>
                  <td className={`p-3 text-right font-bold ${net >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
                    {net >= 0 ? '+' : ''}{net.toLocaleString()}
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

export default CashFlow;
