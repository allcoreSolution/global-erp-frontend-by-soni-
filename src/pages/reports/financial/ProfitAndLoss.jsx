import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const ProfitAndLoss = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfitAndLoss();
  }, []);

  const fetchProfitAndLoss = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/financial/profit-and-loss');
      if (res.data && res.data.success) {
        setIncomes(res.data.data.incomes || []);
        setExpenses(res.data.data.expenses || []);
        setTotals({
          totalIncome: res.data.data.totalIncome || 0,
          totalExpense: res.data.data.totalExpense || 0,
          netProfit: res.data.data.netProfit || 0
        });
      }
    } catch (error) {
      console.error('Error fetching P&L:', error);
    } finally {
      setLoading(false);
    }
  };

  const { totalIncome, totalExpense, netProfit } = totals;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={22} /> Profit & Loss Statement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Analyze net gross margins, revenue streams, and operating expenses.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-emerald-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-emerald-600" />
        <span className="text-gray-500">Period:</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-04-01" />
        <span className="text-gray-400">to</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-blue-600">Total Operating Revenue</span>
          <span className="text-xl font-extrabold text-blue-800">₹ {totalIncome.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Expenses</span>
          <span className="text-xl font-extrabold text-rose-700">₹ {totalExpense.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Net Profit (Loss)</span>
          <span className="text-xl font-extrabold text-emerald-800">₹ {netProfit.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Expenses Side */}
        <div className="border rounded overflow-hidden">
          <div className="bg-rose-50 border-b border-rose-100 p-2 font-bold text-rose-800">Expenses (Dr)</div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">No expenses found.</td></tr>
              ) : (
                expenses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-gray-700">{item.accountName || item.account}</td>
                    <td className="p-3 text-right font-medium text-gray-800">₹ {item.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
              {netProfit > 0 && (
                <tr className="bg-emerald-50/30">
                  <td className="p-3 font-bold text-emerald-700">Net Profit (Transferred to Balance Sheet)</td>
                  <td className="p-3 text-right font-extrabold text-emerald-700">₹ {netProfit.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td className="p-3 text-gray-800 uppercase text-[10px]">Total</td>
                <td className="p-3 text-right text-gray-800">₹ {Math.max(totalExpense + (netProfit > 0 ? netProfit : 0), totalIncome).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Income Side */}
        <div className="border rounded overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 p-2 font-bold text-blue-800">Income (Cr)</div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">Loading income...</td></tr>
              ) : incomes.length === 0 ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">No income found.</td></tr>
              ) : (
                incomes.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-gray-700">{item.accountName || item.account}</td>
                    <td className="p-3 text-right font-medium text-gray-800">₹ {item.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
              {netProfit < 0 && (
                <tr className="bg-rose-50/30">
                  <td className="p-3 font-bold text-rose-700">Net Loss</td>
                  <td className="p-3 text-right font-extrabold text-rose-700">₹ {Math.abs(netProfit).toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td className="p-3 text-gray-800 uppercase text-[10px]">Total</td>
                <td className="p-3 text-right text-gray-800">₹ {Math.max(totalIncome + (netProfit < 0 ? Math.abs(netProfit) : 0), totalExpense).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;
