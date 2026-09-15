import React from 'react';
import { FolderMinus, Download, Printer, Filter } from 'lucide-react';

const ClosingStock = () => {
  const data = [
    { item: 'LED TV 55 Inch', date: '30-Sep-2026', qty: 45, rate: 25000, value: 1125000 },
    { item: 'Air Conditioner 1.5 Ton', date: '30-Sep-2026', qty: 22, rate: 32000, value: 704000 },
    { item: 'Ergonomic Office Chair', date: '30-Sep-2026', qty: 150, rate: 2500, value: 375000 },
    { item: 'Steel Sheets (Grade A)', date: '30-Sep-2026', qty: 1200, rate: 80, value: 96000 },
  ];

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderMinus className="text-cyan-600" size={22} /> Closing Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Reconciled statements of remaining stocks left in warehouses after sales/purchases.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-cyan-200 rounded-lg flex items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-cyan-600" />
          <span className="text-gray-500">Closing Date:</span>
          <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
          <button className="px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700">Calculate</button>
        </div>
        <div className="text-cyan-800 font-extrabold text-base">
          Total Closing Value: ₹ {totalValue.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Item Name</th>
              <th className="p-3">As On Date</th>
              <th className="p-3 text-right">Closing Qty</th>
              <th className="p-3 text-right">Valuation Rate (₹)</th>
              <th className="p-3 text-right">Total Closing Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-gray-800">{item.item}</td>
                <td className="p-3 text-gray-600">{item.date}</td>
                <td className="p-3 text-right font-bold text-gray-700">{item.qty}</td>
                <td className="p-3 text-right text-gray-600">{item.rate.toLocaleString()}</td>
                <td className="p-3 text-right font-extrabold text-cyan-700">₹ {item.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClosingStock;
