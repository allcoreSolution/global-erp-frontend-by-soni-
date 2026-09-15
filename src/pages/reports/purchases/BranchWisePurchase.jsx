import React, { useState } from 'react';
import { GitBranch, Search, Filter, Download, MapPin, Building2, BarChart2 } from 'lucide-react';

const BranchWisePurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const branches = [
    { id: 1, name: 'Mumbai HQ', region: 'West', orders: 1250, value: 3500000, budgetUsed: 85 },
    { id: 2, name: 'Delhi NCR Branch', region: 'North', orders: 850, value: 1850000, budgetUsed: 62 },
    { id: 3, name: 'Bangalore Tech Hub', region: 'South', orders: 2100, value: 4200000, budgetUsed: 92 },
    { id: 4, name: 'Kolkata Office', region: 'East', orders: 320, value: 650000, budgetUsed: 45 },
    { id: 5, name: 'Pune Operations', region: 'West', orders: 650, value: 1250000, budgetUsed: 78 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GitBranch className="text-indigo-600" size={24} /> Regional Branch Procurement
          </h1>
          <p className="text-xs text-slate-500 mt-1">Compare regional branches cost allocations and purchase requisitions registers.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Top Procuring Branch</p>
            <h3 className="text-xl font-bold text-slate-800">Bangalore Tech Hub</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Active Branches</p>
            <h3 className="text-xl font-bold text-blue-600">5 Locations</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Enterprise Total Sourced</p>
            <h3 className="text-xl font-bold text-slate-800">$11.45M</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Branch Expenditure Matrix</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search branch or region..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Branch Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Zone / Region</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Orders Raised</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Cost Allocation Used</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Budget Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-700">{b.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold border border-slate-200 uppercase">
                      {b.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-right">{b.orders.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${b.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-full max-w-[100px] bg-slate-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${b.budgetUsed > 90 ? 'bg-rose-500' : b.budgetUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${b.budgetUsed}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 w-8">{b.budgetUsed}%</span>
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

export default BranchWisePurchase;
