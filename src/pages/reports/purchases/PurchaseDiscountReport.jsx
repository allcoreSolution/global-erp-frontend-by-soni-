import React, { useState } from 'react';
import { Percent, Search, Filter, Download, ArrowDown, TrendingDown, Tag } from 'lucide-react';

const PurchaseDiscountReport = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const discounts = [
    { id: 1, vendor: 'Global Tech', billNo: 'BILL-445', billAmount: 45000, discountPct: '5%', discountAmount: 2250, finalAmount: 42750 },
    { id: 2, vendor: 'TechDistro Inc.', billNo: 'BILL-889', billAmount: 125000, discountPct: '10%', discountAmount: 12500, finalAmount: 112500 },
    { id: 3, vendor: 'OfficeDepot', billNo: 'BILL-112', billAmount: 15400, discountPct: '2%', discountAmount: 308, finalAmount: 15092 },
    { id: 4, vendor: 'Furnishings Co', billNo: 'BILL-475', billAmount: 32000, discountPct: '8%', discountAmount: 2560, finalAmount: 29440 },
    { id: 5, vendor: 'Global Chips Ltd', billNo: 'BILL-990', billAmount: 88000, discountPct: '7.5%', discountAmount: 6600, finalAmount: 81400 },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Percent className="text-emerald-600" size={24} /> Purchase Discount Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track trade discounts obtained from suppliers and special vendor pricing reductions.</p>
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
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Savings</p>
            <h3 className="text-xl font-bold text-emerald-600">$24,218.00</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Average Discount</p>
            <h3 className="text-xl font-bold text-slate-800">6.5%</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Discounted Bills</p>
            <h3 className="text-xl font-bold text-slate-800">142</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Discounted Invoices Ledger</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vendor or bill..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Bill No.</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Gross Amount</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-center">Discount %</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Saved Amount</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-indigo-600">{d.vendor}</td>
                  <td className="px-6 py-4 text-slate-600">{d.billNo}</td>
                  <td className="px-6 py-4 text-slate-500 text-right font-medium">${d.billAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded text-[10px]">
                      {d.discountPct}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 text-right flex items-center justify-end gap-1">
                    <ArrowDown size={12} /> ${d.discountAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">${d.finalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDiscountReport;
