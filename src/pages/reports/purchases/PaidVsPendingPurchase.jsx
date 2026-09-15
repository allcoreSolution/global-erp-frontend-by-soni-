import React, { useState } from 'react';
import { Scale, Search, Filter, Download, CheckCircle, Clock, Banknote } from 'lucide-react';

const PaidVsPendingPurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const settlements = [
    { id: 1, period: 'Sep 2026', totalPurchases: 450000, paidAmount: 305000, pendingAmount: 145000, paidPct: 67 },
    { id: 2, period: 'Aug 2026', totalPurchases: 380000, paidAmount: 348000, pendingAmount: 32000, paidPct: 91 },
    { id: 3, period: 'Jul 2026', totalPurchases: 520000, paidAmount: 435000, pendingAmount: 85000, paidPct: 83 },
    { id: 4, period: 'Jun 2026', totalPurchases: 410000, paidAmount: 398000, pendingAmount: 12000, paidPct: 97 },
    { id: 5, period: 'May 2026', totalPurchases: 475000, paidAmount: 475000, pendingAmount: 0, paidPct: 100 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-amber-600" size={24} /> Paid vs Pending Settlements
          </h1>
          <p className="text-xs text-slate-500 mt-1">Summary displaying mapped cleared procurement checks vs draft pending supplier balances.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition shadow-sm">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">YTD Total Purchases</p>
            <h3 className="text-xl font-bold text-slate-800">$2,235,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">YTD Total Cleared</p>
            <h3 className="text-xl font-bold text-emerald-600">$1,961,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">YTD Total Pending</p>
            <h3 className="text-xl font-bold text-amber-600">$274,000</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Monthly Settlement Logs</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search period..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Fiscal Period</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Purchases</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Paid Amount</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Pending Amount</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-600">{s.period}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${s.totalPurchases.toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold text-right">${s.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-amber-600 font-bold text-right">${s.pendingAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 w-32">
                        <div 
                          className="h-1.5 rounded-full bg-emerald-500" 
                          style={{ width: `${s.paidPct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 w-8">{s.paidPct}%</span>
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

export default PaidVsPendingPurchase;
