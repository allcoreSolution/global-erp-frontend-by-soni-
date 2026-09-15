import React, { useState } from 'react';
import { Award, Search, Filter, Download, Star, ShieldCheck, Tag } from 'lucide-react';

const BrandWisePurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const brands = [
    { id: 1, name: 'Samsung', category: 'Electronics', purchases: 450, value: 1250000, marketShare: 28 },
    { id: 2, name: 'Cisco', category: 'Networking', purchases: 120, value: 850000, marketShare: 19 },
    { id: 3, name: 'Herman Miller', category: 'Furniture', purchases: 45, value: 340000, marketShare: 7 },
    { id: 4, name: 'Dell', category: 'Computers', purchases: 310, value: 920000, marketShare: 21 },
    { id: 5, name: '3M', category: 'Supplies', purchases: 850, value: 150000, marketShare: 3 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-cyan-600" size={24} /> Brand-wise Purchase Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">Procurement analysis matching cost margins grouped by manufacturing brand elements.</p>
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
            <Star size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Top Brand Partner</p>
            <h3 className="text-xl font-bold text-slate-800">Samsung</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Active Brands Sourced</p>
            <h3 className="text-xl font-bold text-blue-600">42</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Premium Tier Volume</p>
            <h3 className="text-xl font-bold text-slate-800">$2.1M</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Brand Procurement Leaderboard</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search brand..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Brand Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Primary Category</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Units Sourced</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Procurement Value</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-cyan-700">{b.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">
                      {b.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-right">{b.purchases.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${b.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-full max-w-[100px] bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-cyan-500" 
                          style={{ width: `${b.marketShare}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 w-8">{b.marketShare}%</span>
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

export default BrandWisePurchase;
