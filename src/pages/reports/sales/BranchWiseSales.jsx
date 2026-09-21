import React, { useState, useEffect } from 'react';
import { GitBranch, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp } from 'lucide-react';
import api from '../../../api';

const BranchWiseSales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/sales/analysis/branch-wise');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branch wise sales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Profitable': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Growing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Loss': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <GitBranch className="text-indigo-600" size={24} />
            </div>
            Branch-wise Sales Analysis
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Study geographic sales data comparing regional branches and local franchises.
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

      <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Branch..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">Current FY</option>
          <option value="last-fy">Last FY</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Branches', val: '3', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Top Branch', val: 'Mumbai HQ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Avg Order/Branch', val: '1,033', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Total Revenue', val: '₹ 2.62 Cr', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-bold mt-1 flex items-center">
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
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">Branch ID</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">Branch Name</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">Manager</th>
                <th className="p-4 text-center">Total Orders</th>
                <th className="p-4 text-right">Revenue</th>
                <th className="p-4 text-right">Expenses</th>
                <th className="p-4 text-right">Net Profit</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-slate-500">No data available</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4 font-mono text-indigo-700 font-medium">{item.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.manager}</td>
                  <td className="p-4 text-center font-bold text-slate-700">{item.totalOrders}</td>
                  <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(item.revenue)}</td>
                  <td className="p-4 text-right text-rose-600 font-medium">{formatCurrency(item.expenses)}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(item.profit)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(item.status)}`}>
                      {item.status}
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

export default BranchWiseSales;
