import React, { useState } from 'react';
import { PackageCheck, Search, Filter, Download, Box, TrendingUp, Calendar } from 'lucide-react';

const FrequentlyPurchasedProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: 1, name: 'Industrial Bearings A-12', category: 'Hardware', frequency: 145, avgRestock: '12 Days', cost: 12500 },
    { id: 2, name: 'Safety Helmets Pro', category: 'PPE', frequency: 98, avgRestock: '30 Days', cost: 8400 },
    { id: 3, name: 'Lubricant Oil 50L', category: 'Consumables', frequency: 76, avgRestock: '15 Days', cost: 15200 },
    { id: 4, name: 'Copper Wiring 2.5mm', category: 'Electrical', frequency: 65, avgRestock: '20 Days', cost: 22000 },
    { id: 5, name: 'Steel Bolts M10', category: 'Hardware', frequency: 54, avgRestock: '10 Days', cost: 4500 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PackageCheck className="text-emerald-600" size={24} /> Frequently Purchased Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">Rank products by order frequency, reorder counts, and average warehouse stocking timelines.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Items Reordered</p>
            <h3 className="text-xl font-bold text-slate-800">4,521</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Fastest Moving Category</p>
            <h3 className="text-xl font-bold text-slate-800">Hardware</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Restock Cycle</p>
            <h3 className="text-xl font-bold text-slate-800">17.4 Days</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Product Ranking</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Purchase Frequency</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Avg Restock Time</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Avg Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-700">#{i + 1}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-indigo-600">{p.frequency} orders</td>
                  <td className="px-6 py-4 text-center text-slate-600 font-medium">{p.avgRestock}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${p.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyPurchasedProducts;
