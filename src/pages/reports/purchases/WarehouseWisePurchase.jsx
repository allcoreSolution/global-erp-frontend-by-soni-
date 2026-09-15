import React, { useState } from 'react';
import { Home, Search, Filter, Download, Box, KeySquare, Shield } from 'lucide-react';

const WarehouseWisePurchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const warehouses = [
    { id: 1, name: 'Central Depot - Mumbai', type: 'Main Hub', capacity: '95%', deliveries: 450, stockValue: 8500000, status: 'Critical' },
    { id: 2, name: 'North Zone Station - NCR', type: 'Regional', capacity: '65%', deliveries: 320, stockValue: 4200000, status: 'Optimal' },
    { id: 3, name: 'South Transit - Bangalore', type: 'Transit', capacity: '88%', deliveries: 850, stockValue: 6500000, status: 'Warning' },
    { id: 4, name: 'East Storage - Kolkata', type: 'Regional', capacity: '42%', deliveries: 120, stockValue: 1200000, status: 'Optimal' },
    { id: 5, name: 'Port Customs Bonded - JNPT', type: 'Customs', capacity: '78%', deliveries: 95, stockValue: 15400000, status: 'Optimal' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Home className="text-teal-600" size={24} /> Warehouse-wise Inflow & Storage
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track direct incoming stocks values received at specific storage warehouses.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-teal-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <KeySquare size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Global Storage Value</p>
            <h3 className="text-xl font-bold text-teal-700">$35.8M</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Items Received</p>
            <h3 className="text-xl font-bold text-slate-800">1,835</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Capacity Utilization</p>
            <h3 className="text-xl font-bold text-slate-800">73.6%</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Warehouse Inventory Nodes</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search storage node..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Warehouse Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Site Type</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Inward Deliveries</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Inventory Holding Value</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Capacity Load</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warehouses.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-teal-700">{w.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold border border-slate-200 uppercase">
                      {w.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-right">{w.deliveries}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${w.stockValue.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-center">{w.capacity}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      w.status === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      w.status === 'Warning' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {w.status}
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

export default WarehouseWisePurchase;
