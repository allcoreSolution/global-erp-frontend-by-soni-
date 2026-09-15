import React from 'react';
import { TrendingUp, Download, Printer, Filter } from 'lucide-react';

const StockMovement = () => {
  const data = [
    { date: '10-Sep-2026', ref: 'TRF-1001', item: 'LED TV 55 Inch', qty: 10, source: 'Main Warehouse', dest: 'Retail Store 1', status: 'Completed' },
    { date: '12-Sep-2026', ref: 'TRF-1002', item: 'Ergonomic Office Chair', qty: 25, source: 'Main Warehouse', dest: 'Retail Store 2', status: 'In Transit' },
    { date: '14-Sep-2026', ref: 'TRF-1003', item: 'Air Conditioner 1.5 Ton', qty: 5, source: 'Retail Store 1', dest: 'Retail Store 2', status: 'Completed' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={22} /> Stock Movement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Audit logs tracking dynamic stock transfer shifts from inventory sources to destinations.</p>
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

      <div className="bg-slate-50 p-4 border border-indigo-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-indigo-600" />
        <span className="text-gray-500">Date Range:</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-01" />
        <span>to</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Filter</button>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Transfer Ref</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-center">Transfer Qty</th>
              <th className="p-3">Source Location</th>
              <th className="p-3">Destination Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-gray-600">{item.date}</td>
                <td className="p-3 font-mono text-indigo-700">{item.ref}</td>
                <td className="p-3 font-semibold text-gray-800">{item.item}</td>
                <td className="p-3 text-center font-bold text-gray-700">{item.qty}</td>
                <td className="p-3 text-rose-600">{item.source}</td>
                <td className="p-3 text-emerald-600">{item.dest}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovement;
