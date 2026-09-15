import React, { useState } from 'react';
import { Briefcase, Search, Filter, Download, Truck, Package, DollarSign } from 'lucide-react';

const PurchaseCostReport = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const costs = [
    { id: 1, product: 'Intel Core i7', qty: 50, unitPrice: 245, freight: 12.5, customs: 5.5, handling: 2.0, landingCost: 265 },
    { id: 2, product: 'Samsung 1TB SSD', qty: 100, unitPrice: 85, freight: 4.5, customs: 1.5, handling: 1.0, landingCost: 92 },
    { id: 3, product: 'Office Chair Pro', qty: 25, unitPrice: 150, freight: 25.0, customs: 0, handling: 5.0, landingCost: 180 },
    { id: 4, product: 'Mechanical Keyboard', qty: 75, unitPrice: 65, freight: 8.5, customs: 2.5, handling: 1.5, landingCost: 77.5 },
    { id: 5, product: '27" 4K Monitor', qty: 40, unitPrice: 320, freight: 35.0, customs: 15.0, handling: 8.0, landingCost: 378 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-cyan-600" size={24} /> Landing Cost Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">Analyze final landing costs per product unit including shipping freight and customs parameters.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-cyan-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Basic Price</p>
            <h3 className="text-xl font-bold text-slate-800">$173.00</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Freight Overhead</p>
            <h3 className="text-xl font-bold text-slate-800">+$17.10</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Landing Cost</p>
            <h3 className="text-xl font-bold text-emerald-600">$198.50</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Per Unit Landing Cost Ledger</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search product..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Batch Qty</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Basic Unit Price</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">+ Freight / Unit</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">+ Customs / Unit</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">+ Handling / Unit</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Final Landing Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">{c.product}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{c.qty}</td>
                  <td className="px-6 py-4 font-medium text-slate-600 text-right">${c.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-rose-500 text-right">${c.freight.toFixed(2)}</td>
                  <td className="px-6 py-4 text-orange-500 text-right">${c.customs.toFixed(2)}</td>
                  <td className="px-6 py-4 text-amber-500 text-right">${c.handling.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-cyan-700 text-right bg-cyan-50/30">${c.landingCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCostReport;
