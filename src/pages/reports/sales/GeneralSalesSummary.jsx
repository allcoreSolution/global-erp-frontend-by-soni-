import React from 'react';
import { Layers, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp } from 'lucide-react';

const GeneralSalesSummary = () => {
  const data = [
    { date: '2026-09-01', orders: 45, itemsSold: 120, grossSales: 450000, discount: 15000, tax: 78300, netSales: 513300 },
    { date: '2026-09-02', orders: 38, itemsSold: 95, grossSales: 380000, discount: 12000, tax: 66240, netSales: 434240 },
    { date: '2026-09-03', orders: 52, itemsSold: 145, grossSales: 520000, discount: 18000, tax: 90360, netSales: 592360 },
    { date: '2026-09-04', orders: 60, itemsSold: 180, grossSales: 600000, discount: 20000, tax: 104400, netSales: 684400 },
  ];

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Layers className="text-blue-600" size={24} />
            </div>
            General Sales Summary
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Overall summaries of total sales volume, order sizes, taxes collected, and gross values.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-blue-50/40 p-4 border border-blue-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-blue-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <input 
            type="date" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-slate-600"
          />
        </div>
        <span className="text-slate-400 font-bold">to</span>
        <div className="flex-1 min-w-[200px] relative">
          <input 
            type="date" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-slate-600"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">All Branches</option>
          <option value="main">Main Branch</option>
          <option value="east">East Zone</option>
        </select>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-sm">
          Apply Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', val: '195', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Total Items Sold', val: '540', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Avg. Order Value', val: '₹ 11,406', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Net Sales Revenue', val: '₹ 22.2 L', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-bold mt-1 flex items-center">
              {stat.val} {stat.icon && stat.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 text-center">Total Orders</th>
                <th className="p-4 text-center">Items Sold</th>
                <th className="p-4 text-right">Gross Sales</th>
                <th className="p-4 text-right text-rose-600">Discounts</th>
                <th className="p-4 text-right">Tax (GST)</th>
                <th className="p-4 text-right text-emerald-700 bg-emerald-50/30">Net Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-semibold text-slate-700">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4 text-center font-medium text-slate-600">{row.orders}</td>
                  <td className="p-4 text-center text-slate-600">{row.itemsSold}</td>
                  <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(row.grossSales)}</td>
                  <td className="p-4 text-right text-rose-600">-{formatCurrency(row.discount)}</td>
                  <td className="p-4 text-right text-slate-600">{formatCurrency(row.tax)}</td>
                  <td className="p-4 text-right font-bold text-emerald-700 bg-emerald-50/10">{formatCurrency(row.netSales)}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-800">
                <td className="p-4">Grand Total</td>
                <td className="p-4 text-center">195</td>
                <td className="p-4 text-center">540</td>
                <td className="p-4 text-right">{formatCurrency(1950000)}</td>
                <td className="p-4 text-right text-rose-600">-{formatCurrency(65000)}</td>
                <td className="p-4 text-right">{formatCurrency(339300)}</td>
                <td className="p-4 text-right text-emerald-700 bg-emerald-100/50">{formatCurrency(2224300)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralSalesSummary;
