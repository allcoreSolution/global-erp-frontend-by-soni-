import React from 'react';
import { BookOpen, Download, Printer, Filter } from 'lucide-react';

const StockLedger = () => {
  const data = [
    { date: '10-Aug-2026', ref: 'PUR-0012', type: 'Purchase', inQty: 100, outQty: 0, balance: 100 },
    { date: '15-Aug-2026', ref: 'SAL-0045', type: 'Sales', inQty: 0, outQty: 25, balance: 75 },
    { date: '22-Aug-2026', ref: 'SAL-0050', type: 'Sales', inQty: 0, outQty: 10, balance: 65 },
    { date: '01-Sep-2026', ref: 'PUR-0018', type: 'Purchase', inQty: 50, outQty: 0, balance: 115 },
    { date: '05-Sep-2026', ref: 'RET-0002', type: 'Sales Return', inQty: 2, outQty: 0, balance: 117 },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-amber-600" size={22} /> Stock Ledger
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Detailed product ledger statements tracing individual incoming/outgoing transactions.</p>
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

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex flex-col sm:flex-row gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-amber-600" />
          <span className="text-gray-500">Item:</span>
          <select className="border p-1.5 rounded min-w-[200px]">
            <option>LED TV 55 Inch (ELC-TV-55)</option>
            <option>Air Conditioner 1.5 Ton</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">From:</span>
          <input type="date" className="border p-1.5 rounded" defaultValue="2026-08-01" />
          <span className="text-gray-500">To:</span>
          <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
          <button className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700">Apply Filter</button>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Transaction Date</th>
              <th className="p-3">Reference No.</th>
              <th className="p-3">Transaction Type</th>
              <th className="p-3 text-right bg-emerald-50/50">Inward Qty (+)</th>
              <th className="p-3 text-right bg-rose-50/50">Outward Qty (-)</th>
              <th className="p-3 text-right font-bold bg-amber-50/30 border-l">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-gray-600">{item.date}</td>
                <td className="p-3 font-mono text-amber-700">{item.ref}</td>
                <td className="p-3 font-semibold text-gray-700">{item.type}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{item.inQty > 0 ? item.inQty : '-'}</td>
                <td className="p-3 text-right font-bold text-rose-600">{item.outQty > 0 ? item.outQty : '-'}</td>
                <td className="p-3 text-right font-extrabold text-gray-800 border-l">{item.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLedger;
