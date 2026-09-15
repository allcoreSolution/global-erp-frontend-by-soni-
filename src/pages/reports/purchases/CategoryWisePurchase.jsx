import React, { useState } from 'react';
import { Layers, Search, Filter, Download, Box, LayoutGrid, PieChart } from 'lucide-react';

const CategoryWisePurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 1, name: 'IT Infrastructure', items: 1250, value: 850000, share: 45 },
    { id: 2, name: 'Office Furniture', items: 340, value: 220000, share: 12 },
    { id: 3, name: 'Raw Materials', items: 5500, value: 650000, share: 34 },
    { id: 4, name: 'Stationery', items: 12000, value: 45000, share: 2 },
    { id: 5, name: 'Cleaning Supplies', items: 850, value: 125000, share: 7 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-purple-600" size={24} /> Category-wise Purchase
          </h1>
          <p className="text-xs text-slate-500 mt-1">Verify purchase investments categorized under general items divisions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Active Categories</p>
            <h3 className="text-xl font-bold text-slate-800">18</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Top Category Value</p>
            <h3 className="text-xl font-bold text-blue-600">$850,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Items Sourced</p>
            <h3 className="text-xl font-bold text-slate-800">19,940</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Category Portfolio</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search category..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Items Count</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Procurement Value</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-purple-700">{c.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-right">{c.items.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${c.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-full max-w-[100px] bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-purple-500" 
                          style={{ width: `${c.share}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 w-8">{c.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryWisePurchase;
