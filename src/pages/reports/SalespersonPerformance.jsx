import React, { useState } from 'react';
import { Users, Search, Filter, Download, Target, Award, DollarSign } from 'lucide-react';

const SalespersonPerformance = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const salesReps = [
    { id: 1, name: 'Michael Scott', region: 'North America', target: 500000, achieved: 520000, completion: 104, commission: 26000, rating: 'Excellent' },
    { id: 2, name: 'Dwight Schrute', region: 'Europe', target: 450000, achieved: 410000, completion: 91, commission: 16400, rating: 'Good' },
    { id: 3, name: 'Jim Halpert', region: 'Asia Pacific', target: 400000, achieved: 435000, completion: 108, commission: 21750, rating: 'Excellent' },
    { id: 4, name: 'Stanley Hudson', region: 'North America', target: 350000, achieved: 320000, completion: 91, commission: 12800, rating: 'Good' },
    { id: 5, name: 'Phyllis Vance', region: 'Europe', target: 300000, achieved: 280000, completion: 93, commission: 11200, rating: 'Good' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-purple-600" size={24} /> Salesperson Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">Evaluate targets reached, revenue generated, and commissions for sales reps.</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Target</p>
            <h3 className="text-xl font-bold text-slate-800">$2,000,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Achieved</p>
            <h3 className="text-xl font-bold text-slate-800">$1,965,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Commissions Paid</p>
            <h3 className="text-xl font-bold text-slate-800">$88,150</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Sales Representatives</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search reps..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Rep Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Target</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Achieved</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Completion</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Commission</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesReps.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-600">{rep.name}</td>
                  <td className="px-6 py-4 text-slate-600">{rep.region}</td>
                  <td className="px-6 py-4 text-slate-500 text-right font-medium">${rep.target.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${rep.achieved.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 w-24">
                        <div 
                          className={`h-1.5 rounded-full ${rep.completion >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min(rep.completion, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold ${rep.completion >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {rep.completion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-bold text-right">${rep.commission.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      rep.rating === 'Excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {rep.rating}
                    </span>
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

export default SalespersonPerformance;
