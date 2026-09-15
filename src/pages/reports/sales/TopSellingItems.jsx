import React from 'react';
import { PackageCheck, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp, Trophy } from 'lucide-react';

const TopSellingItems = () => {
  const data = [
    { rank: 1, sku: 'PRD-SFT-099', name: 'Antivirus Pro 1-Year', category: 'Software', unitsSold: 850, revenue: 595000, margin: '65%', trend: 'Up' },
    { rank: 2, sku: 'PRD-FUR-104', name: 'Ergonomic Mesh Chair', category: 'Furniture', unitsSold: 340, revenue: 2210000, margin: '35%', trend: 'Up' },
    { rank: 3, sku: 'PRD-ELC-001', name: 'Smart LED TV 55"', category: 'Electronics', unitsSold: 125, revenue: 5250000, margin: '22%', trend: 'Down' },
    { rank: 4, sku: 'PRD-ELC-015', name: 'Wireless Headphones', category: 'Electronics', unitsSold: 85, revenue: 340000, margin: '18%', trend: 'Flat' },
    { rank: 5, sku: 'PRD-APP-022', name: 'Microwave Oven 20L', category: 'Appliances', unitsSold: 45, revenue: 382500, margin: '15%', trend: 'Up' },
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
    if (trend === 'Up') return <TrendingUp size={16} className="text-emerald-500" />;
    if (trend === 'Down') return <TrendingUp size={16} className="text-rose-500 rotate-180" />;
    return <TrendingUp size={16} className="text-slate-400 rotate-90" />;
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
            Top Selling Products Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Rank products by sales volume and net profits contributions to identify top SKU performance indices.
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
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">Sort By</option>
          <option value="volume">Sales Volume (Units)</option>
          <option value="revenue">Gross Revenue</option>
          <option value="margin">Profit Margin</option>
        </select>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="top-10">Top 10 Products</option>
          <option value="top-50">Top 50 Products</option>
          <option value="top-100">Top 100 Products</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Top Product (Units)', val: 'Antivirus Pro', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Top Product (Revenue)', val: 'Smart LED TV 55"', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Top Category', val: 'Software', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Top 10 Revenue Share', val: '68%', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
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
                  <div className="flex items-center gap-1">SKU Code <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Product Name <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 text-center">Units Sold</th>
                <th className="p-4 text-right">Gross Revenue</th>
                <th className="p-4 text-center">Margin %</th>
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
                  <td className="p-4 font-mono text-indigo-700 font-medium">{item.sku}</td>
                  <td className="p-4 font-semibold text-slate-800 flex flex-col">
                    {item.name}
                    <span className="text-xs font-normal text-slate-500 mt-0.5">{item.category}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-700 text-lg">{item.unitsSold}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(item.revenue)}</td>
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

export default TopSellingItems;
