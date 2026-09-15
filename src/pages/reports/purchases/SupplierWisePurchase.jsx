import React, { useState } from 'react';
import { Truck, Search, Filter, Download, DollarSign, Package, Clock } from 'lucide-react';

const SupplierWisePurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    { id: 1, name: 'Global Tech', orders: 145, volume: 450000, leadTime: '4 Days', compliance: '98%', status: 'Excellent' },
    { id: 2, name: 'TechDistro Inc.', orders: 320, volume: 1250000, leadTime: '2 Days', compliance: '99%', status: 'Excellent' },
    { id: 3, name: 'OfficeDepot', orders: 85, volume: 154000, leadTime: '7 Days', compliance: '85%', status: 'Average' },
    { id: 4, name: 'Furnishings Co', orders: 42, volume: 320000, leadTime: '14 Days', compliance: '92%', status: 'Good' },
    { id: 5, name: 'Global Chips Ltd', orders: 210, volume: 880000, leadTime: '5 Days', compliance: '95%', status: 'Good' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-emerald-600" size={24} /> Supplier-wise Purchase Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">Compare supplier order volumes, lead times, order delivery compliance, and cost audits.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Procurement Vol</p>
            <h3 className="text-xl font-bold text-emerald-600">$3,054,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Orders Placed</p>
            <h3 className="text-xl font-bold text-slate-800">802</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Supplier Lead Time</p>
            <h3 className="text-xl font-bold text-slate-800">6.4 Days</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Supplier Ledger</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search supplier..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Supplier Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Orders</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Volume ($)</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Lead Time</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Compliance</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-600">{s.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{s.orders}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${s.volume.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{s.leadTime}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">{s.compliance}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      s.status === 'Good' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {s.status}
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

export default SupplierWisePurchase;
