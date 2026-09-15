import React from 'react';
import { Truck, Download, Printer, Filter, Search, ArrowUpDown, TrendingDown, Trophy } from 'lucide-react';

const TopSuppliers = () => {
  const data = [
    { rank: 1, vendorId: 'VND-045', name: 'Global Supplies Inc.', category: 'Electronics', orders: 120, amount: 4500000, margin: '22%', trend: 'Up' },
    { rank: 2, vendorId: 'VND-012', name: 'Prime Hardware Ltd.', category: 'Hardware', orders: 85, amount: 2100000, margin: '35%', trend: 'Up' },
    { rank: 3, vendorId: 'VND-088', name: 'Alpha Software Corp.', category: 'Software', orders: 45, amount: 1500000, margin: '18%', trend: 'Down' },
    { rank: 4, vendorId: 'VND-104', name: 'Delta Furniture', category: 'Furniture', orders: 60, amount: 800000, margin: '15%', trend: 'Flat' },
    { rank: 5, vendorId: 'VND-023', name: 'Office Solutions', category: 'Stationery', orders: 30, amount: 250000, margin: '12%', trend: 'Up' },
  ];

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-amber-100 text-amber-600 border-amber-300 font-extrabold shadow-sm';
      case 2: return 'bg-slate-200 text-slate-600 border-slate-300 font-bold';
      case 3: return 'bg-orange-100 text-orange-700 border-orange-200 font-bold';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'Up') return <TrendingDown size={16} className="text-emerald-500" />;
    if (trend === 'Down') return <TrendingDown size={16} className="text-rose-500 rotate-180" />;
    return <TrendingDown size={16} className="text-slate-400 rotate-90" />;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Trophy className="text-amber-500" size={24} />
            </div>
            Top Suppliers Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Rank suppliers by procurement value, discount margins offered, and delivery turnaround efficiency.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Vendor Name or ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">Sort By</option>
          <option value="amount">Procurement Amount</option>
          <option value="orders">Total Orders</option>
          <option value="margin">Discount Margin</option>
        </select>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="top-10">Top 10 Suppliers</option>
          <option value="top-50">Top 50 Suppliers</option>
          <option value="top-100">Top 100 Suppliers</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Top Vendor (Orders)', val: 'Global Supplies Inc.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Top Vendor (Amount)', val: 'Global Supplies Inc.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Top Category', val: 'Electronics', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Top 10 Spend Share', val: '72%', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <TrendingDown size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-xl font-bold mt-1 flex items-center">
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
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Vendor ID <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Supplier Name <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 text-center">Total Orders</th>
                <th className="p-4 text-right">Procurement Amount</th>
                <th className="p-4 text-center">Avg. Discount Margin %</th>
                <th className="p-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border ${getRankStyle(item.rank)}`}>
                      {item.rank === 1 ? <Trophy size={14} className="text-amber-600" /> : item.rank}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-indigo-700 font-medium">{item.vendorId}</td>
                  <td className="p-4 font-semibold text-slate-800 flex flex-col">
                    {item.name}
                    <span className="text-xs font-normal text-slate-500 mt-0.5">{item.category}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-700 text-lg">{item.orders}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(item.amount)}</td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-emerald-600">{item.margin}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      {getTrendIcon(item.trend)}
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

export default TopSuppliers;
