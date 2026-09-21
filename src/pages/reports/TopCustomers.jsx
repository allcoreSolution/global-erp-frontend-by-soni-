import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Download, ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../api';

const TopCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/sales/analysis/customer-wise');
        if (response.data.success) {
          // Sort by revenue descending and add rank
          const sorted = response.data.data.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).map((item, index) => ({
            ...item,
            revenue: item.totalSpent, // Map totalSpent to revenue
            rank: index + 1,
            margin: '22%' // mock
          }));
          setData(sorted);
        }
      } catch (error) {
        console.error("Error fetching top customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const filteredData = data.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-emerald-600" size={24} /> Top Customers Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review rankings of your top purchasing clients based on revenue and volume.</p>
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
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Revenue (Top 5)</p>
            <h3 className="text-xl font-bold text-slate-800">
              {formatCurrency(data.slice(0, 5).reduce((acc, curr) => acc + curr.revenue, 0))}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Profit Margin</p>
            <h3 className="text-xl font-bold text-slate-800">21.6%</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Orders</p>
            <h3 className="text-xl font-bold text-slate-800">
              {data.reduce((acc, curr) => acc + curr.orders, 0)}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">Customer Rankings</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
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
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Orders</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Revenue</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Avg Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-500">Loading data...</td></tr>
              ) : filteredData.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-700">#{c.rank}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600">{c.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'VIP' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-right font-medium">{c.orders}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-right">{formatCurrency(c.revenue)}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold text-right">{c.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopCustomers;
