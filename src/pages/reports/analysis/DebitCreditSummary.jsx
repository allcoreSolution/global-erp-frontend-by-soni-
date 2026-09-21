import React, { useState, useEffect } from 'react';
import { Scale, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const DebitCreditSummary = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  
  const [summary, setSummary] = useState({ totalSystemDebit: 0, totalSystemCredit: 0, isBalanced: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analysis/debit-credit?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data && res.data.success) {
        setSummary(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching debit-credit summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const diff = summary.totalSystemDebit - summary.totalSystemCredit;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Scale className="text-emerald-600" size={22} /> Debit / Credit Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Analysis matrices matching total debit transfers and credit balances.</p>
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

      <div className="bg-slate-50 p-4 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-emerald-600" />
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Date Range:</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-emerald-500" />
            <span className="text-gray-400">to</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-emerald-500" />
          </div>

          <button onClick={fetchData} className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
            Apply Filter
          </button>
        </div>
        <div className={`font-extrabold flex items-center gap-2 ${summary.isBalanced ? 'text-emerald-700' : 'text-rose-700'}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${summary.isBalanced ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {summary.isBalanced ? 'Ledgers 100% Balanced' : 'Trial Balance Mismatch detected!'}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="block w-full overflow-x-auto w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Period</th>
              <th className="p-3 text-right">Total Debit (₹)</th>
              <th className="p-3 text-right">Total Credit (₹)</th>
              <th className="p-3 text-right">Difference (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500 italic">Calculating total balances...</td>
              </tr>
            ) : (
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-gray-800">
                  {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
                </td>
                <td className="p-3 text-right font-medium text-blue-700">{summary.totalSystemDebit.toLocaleString()}</td>
                <td className="p-3 text-right font-medium text-rose-700">{summary.totalSystemCredit.toLocaleString()}</td>
                <td className="p-3 text-right font-extrabold text-emerald-600">
                  {diff === 0 ? 'NIL' : Math.abs(diff).toLocaleString() + (diff > 0 ? ' Dr' : ' Cr')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DebitCreditSummary;
