import React, { useState, useEffect } from 'react';
import { PackageCheck, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp, Trophy } from 'lucide-react';
import api from '../../../api';

const TopSellingItems = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/sales/analysis/product-wise');
        if (response.data.success) {
          // Sort by revenue descending and add rank
          const sorted = response.data.data.sort((a, b) => b.revenue - a.revenue).map((item, index) => ({
            ...item,
            rank: index + 1,
            sku: item.id, // mapping id to sku
            margin: '22%' // mocked as it's not in this API
          }));
          setData(sorted);
        }
      } catch (error) {
        console.error("Error fetching top selling items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Top Product (Units)', val: data.length > 0 ? data.sort((a,b)=>b.unitsSold - a.unitsSold)[0].name : '-', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Top Product (Revenue)', val: data.length > 0 ? data[0].name : '-', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Top Category', val: 'Electronics', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Total Revenue', val: formatCurrency(data.reduce((acc, curr) => acc + curr.revenue, 0)), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-xl font-bold mt-1 flex items-center">
              {stat.val} {stat.icon && stat.icon}
            </span>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-center">Units Sold</th>
                <th className="p-4 text-right">Gross Revenue</th>
                <th className="p-4 text-center">Margin %</th>
                <th className="p-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-500">Loading data...</td></tr>
              ) : data.map((item, idx) => (
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
