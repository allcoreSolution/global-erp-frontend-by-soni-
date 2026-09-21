import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const CashFlow = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const [flow, setFlow] = useState({ cashInflow: 0, cashOutflow: 0, netLiquidityMovement: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analysis/cash-flow?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data && res.data.success) {
        setFlow(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching cash flow summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const netCashFlow = flow.netLiquidityMovement;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={22} /> Cash Flow Statement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Visualize dynamic cash inflows, liquidity index, and operating payments.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-purple-200 rounded-lg flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-purple-600" />
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Date Range:</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-purple-500" />
          <span className="text-gray-400">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-purple-500" />
        </div>

        <button onClick={fetchData} className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
          Apply Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-emerald-600">Total Cash Inflows</span>
          <span className="text-2xl font-extrabold text-emerald-800">₹ {flow.cashInflow.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-rose-600">Total Cash Outflows</span>
          <span className="text-2xl font-extrabold text-rose-800">₹ {flow.cashOutflow.toLocaleString()}</span>
        </div>
        <div className={`p-4 rounded-lg flex flex-col justify-between border ${netCashFlow >= 0 ? 'bg-indigo-50/50 border-indigo-200' : 'bg-amber-50/50 border-amber-200'}`}>
          <span className={`text-[11px] uppercase font-bold ${netCashFlow >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>Net Cash Flow</span>
          <span className={`text-2xl font-extrabold ${netCashFlow >= 0 ? 'text-indigo-800' : 'text-amber-800'}`}>
            {netCashFlow >= 0 ? '+' : ''} ₹ {Math.abs(netCashFlow).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border rounded overflow-hidden text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Period</th>
              <th className="p-3 text-right bg-emerald-50/30">Cash Inflows (₹)</th>
              <th className="p-3 text-right bg-rose-50/30">Cash Outflows (₹)</th>
              <th className="p-3 text-right font-bold">Net Activity Flow (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500 italic">Calculating cash flows...</td>
              </tr>
            ) : (
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-gray-800">
                  {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
                </td>
                <td className="p-3 text-right text-emerald-700">{flow.cashInflow.toLocaleString()}</td>
                <td className="p-3 text-right text-rose-700">{flow.cashOutflow.toLocaleString()}</td>
                <td className={`p-3 text-right font-bold ${netCashFlow >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlow;
