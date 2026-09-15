import React, { useState } from 'react';
import { Package, Download, Printer, Filter } from 'lucide-react';

const StockSummary = () => {
  const [data] = useState([
    { group: 'Electronics', item: 'LED TV 55 Inch', qty: 45, unit: 'Nos', value: 1350000 },
    { group: 'Electronics', item: 'Air Conditioner 1.5 Ton', qty: 22, unit: 'Nos', value: 770000 },
    { group: 'Furniture', item: 'Ergonomic Office Chair', qty: 150, unit: 'Nos', value: 450000 },
    { group: 'Raw Materials', item: 'Steel Sheets (Grade A)', qty: 1200, unit: 'Kg', value: 96000 },
    { group: 'Raw Materials', item: 'Aluminum Coils', qty: 500, unit: 'Kg', value: 85000 },
  ]);

  const totalQty = data.reduce((acc, curr) => acc + (curr.unit === 'Nos' ? curr.qty : 0), 0);
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-600" size={22} /> Stock Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Overall summaries of all inventory category units and asset valuation.</p>
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
        <span className="text-gray-500">Stock Group:</span>
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>All Groups</option>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Raw Materials</option>
        </select>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-emerald-600">Total Pieces in Stock (Nos)</span>
          <span className="text-2xl font-extrabold text-emerald-800">{totalQty.toLocaleString()} Units</span>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-indigo-600">Total Stock Valuation</span>
          <span className="text-2xl font-extrabold text-indigo-800">₹ {totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Stock Group</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-right">Available Qty</th>
              <th className="p-3">Unit</th>
              <th className="p-3 text-right">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-gray-500">{item.group}</td>
                <td className="p-3 font-semibold text-gray-800">{item.item}</td>
                <td className="p-3 text-right font-bold text-gray-800">{item.qty.toLocaleString()}</td>
                <td className="p-3 text-gray-500">{item.unit}</td>
                <td className="p-3 text-right font-extrabold text-indigo-700">₹ {item.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t font-extrabold">
            <tr>
              <td colSpan="4" className="p-3 text-right text-gray-800 uppercase text-[10px]">Grand Total Value</td>
              <td className="p-3 text-right text-indigo-800">₹ {totalValue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StockSummary;
