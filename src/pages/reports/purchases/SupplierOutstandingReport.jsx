import React, { useState } from 'react';
import { Clock, Search, Filter, Download, AlertCircle, Calendar, UserCheck } from 'lucide-react';

const SupplierOutstandingReport = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const payables = [
    { id: 1, vendor: 'TechDistro Inc.', balance: 145000, overdue: 45000, daysOverdue: 15, status: 'Overdue' },
    { id: 2, vendor: 'OfficeDepot', balance: 32000, overdue: 0, daysOverdue: 0, status: 'On Track' },
    { id: 3, vendor: 'Global Logistics', balance: 85000, overdue: 85000, daysOverdue: 42, status: 'Critical' },
    { id: 4, vendor: 'RawMaterials Inc', balance: 12000, overdue: 5000, daysOverdue: 5, status: 'Overdue' },
    { id: 5, vendor: 'Alpha Builders', balance: 250000, overdue: 0, daysOverdue: 0, status: 'On Track' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-rose-600" size={24} /> Supplier Outstanding (Payables)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Statements of accounts payables, pending vendor invoices, and outstanding credits due.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Accounts Payable</p>
            <h3 className="text-xl font-bold text-slate-800">$524,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Amount Overdue</p>
            <h3 className="text-xl font-bold text-rose-600">$135,000</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Payment Cycle</p>
            <h3 className="text-xl font-bold text-slate-800">42 Days</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Creditor Balances</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vendor..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Balance Due</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Overdue Amount</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Days Overdue</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payables.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-600">{p.vendor}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${p.balance.toLocaleString()}</td>
                  <td className={`px-6 py-4 font-bold text-right ${p.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {p.overdue > 0 ? `$${p.overdue.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{p.daysOverdue > 0 ? p.daysOverdue : '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                      p.status === 'Overdue' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {p.status}
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

export default SupplierOutstandingReport;
