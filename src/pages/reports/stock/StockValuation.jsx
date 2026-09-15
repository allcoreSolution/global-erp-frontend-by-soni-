import React from 'react';
import { Percent, Download, Printer, Filter } from 'lucide-react';

const StockValuation = () => {
  const data = [
    { sku: 'ELC-TV-55', item: 'LED TV 55 Inch', qty: 45, fifoRate: 24500, avgRate: 24800, valuation: 1116000 },
    { sku: 'ELC-AC-15', item: 'Air Conditioner 1.5 Ton', qty: 22, fifoRate: 31000, avgRate: 31500, valuation: 693000 },
    { sku: 'FURN-CHR-01', item: 'Ergonomic Office Chair', qty: 150, fifoRate: 2400, avgRate: 2500, valuation: 375000 },
  ];

  const totalValuation = data.reduce((acc, curr) => acc + curr.valuation, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Percent className="text-slate-600" size={22} /> Stock Valuation
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Evaluate stock worth indices using Weighted Average Costing models.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-slate-600" />
          <span className="text-gray-500">Valuation Method:</span>
          <select className="border p-1.5 rounded">
            <option>Weighted Average (Recommended)</option>
            <option>FIFO (First In First Out)</option>
            <option>LIFO (Last In First Out)</option>
          </select>
        </div>
        <div className="text-slate-800 font-extrabold text-base">
          Total Inventory Value: ₹ {totalValuation.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-right">Available Qty</th>
              <th className="p-3 text-right">FIFO Rate (₹)</th>
              <th className="p-3 text-right bg-slate-200/50">Avg Cost Rate (₹)</th>
              <th className="p-3 text-right font-bold bg-slate-200/80">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                <td className="p-3 font-semibold text-gray-800">{item.item}</td>
                <td className="p-3 text-right font-bold text-gray-700">{item.qty}</td>
                <td className="p-3 text-right text-gray-500">{item.fifoRate.toLocaleString()}</td>
                <td className="p-3 text-right font-bold text-indigo-600 bg-slate-50/50">{item.avgRate.toLocaleString()}</td>
                <td className="p-3 text-right font-extrabold text-slate-800 bg-slate-50">₹ {item.valuation.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockValuation;
