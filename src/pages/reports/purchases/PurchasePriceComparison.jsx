import React, { useState } from 'react';
import { Scale, Search, Filter, Download, ArrowDownRight, DollarSign, Activity } from 'lucide-react';

const PurchasePriceComparison = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const comparisons = [
    { id: 1, product: 'Intel Core i7 Processor', defaultVendor: 'TechDistro Inc.', defaultPrice: 245, bestVendor: 'Global Chips Ltd', bestPrice: 220, variance: '-10.2%' },
    { id: 2, product: 'Samsung 1TB SSD', defaultVendor: 'Storage World', defaultPrice: 85, bestVendor: 'TechDistro Inc.', bestPrice: 82, variance: '-3.5%' },
    { id: 3, product: 'Office Chair Pro', defaultVendor: 'Furnishings Co', defaultPrice: 150, bestVendor: 'OfficeDepot', bestPrice: 135, variance: '-10.0%' },
    { id: 4, product: 'Mechanical Keyboard', defaultVendor: 'Peripheral Hub', defaultPrice: 65, bestVendor: 'TechDistro Inc.', bestPrice: 60, variance: '-7.6%' },
    { id: 5, product: '27" 4K Monitor', defaultVendor: 'Display Tech', defaultPrice: 320, bestVendor: 'Global Displays', bestPrice: 295, variance: '-7.8%' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-purple-600" size={24} /> Purchase Price Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">Analyze historical procurement prices offered by multiple vendors to find cost optimization margins.</p>
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
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Potential Savings</p>
            <h3 className="text-xl font-bold text-emerald-600">$12,450.00</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Analyzed Products</p>
            <h3 className="text-xl font-bold text-slate-800">84 Items</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Price Variance</p>
            <h3 className="text-xl font-bold text-slate-800">-8.4%</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Vendor Pricing Matrix</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Current Vendor</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Current Price</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Lowest Bidder</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Lowest Price</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisons.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">{item.product}</td>
                  <td className="px-6 py-4 text-slate-600">{item.defaultVendor}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-right">${item.defaultPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-purple-600">{item.bestVendor}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 text-right">${item.bestPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                      {item.variance}
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

export default PurchasePriceComparison;
