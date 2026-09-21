import React, { useState, useEffect } from 'react';
import { Clock, Download, Printer, Filter, Search, ArrowUpDown, TrendingDown } from 'lucide-react';
import api from '../../../api';

const CustomerOutstanding = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/financial/outstanding?type=receivable');
        if (response.data.success) {
          setData(response.data.data.records || []);
        }
      } catch (error) {
        console.error("Error fetching customer outstanding report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Clock className="text-rose-600" size={24} />
            </div>
            Customer Outstanding Balance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Statements lists of customers unpaid balances, aging matrices, and collection summaries.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-rose-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Customer Name..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers Owed', val: data.length.toString(), color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Highest Outstanding', val: data.length > 0 ? formatCurrency(Math.max(...data.map(d => d.amount))) : '₹ 0', color: 'bg-rose-50 text-rose-700 border-rose-200' },
          { label: 'Avg Outstanding', val: data.length > 0 ? formatCurrency(data.reduce((acc, curr) => acc + curr.amount, 0) / data.length) : '₹ 0', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Total Outstanding Amount', val: formatCurrency(data.reduce((acc, curr) => acc + curr.amount, 0)), color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <TrendingDown size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg font-bold mt-1 flex items-center">
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
                <th className="p-4">Customer Name</th>
                <th className="p-4 text-right">Outstanding Balance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">No outstanding balances found.</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{item.accountName}</td>
                  <td className="p-4 text-right font-bold text-rose-600">{formatCurrency(item.amount)}</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-rose-100 text-rose-700 border-rose-200">
                      Payment Pending
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors">
                      Send Reminder
                    </button>
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

export default CustomerOutstanding;
