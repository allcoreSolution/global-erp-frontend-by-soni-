import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const OpeningClosingBalance = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analysis/opening-closing?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching opening-closing summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter out zero-balance accounts
  const filteredData = data.filter(item => 
    item.openingBalance !== 0 || item.closingBalance !== 0 || item.periodDebit !== 0 || item.periodCredit !== 0
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="text-amber-600" size={22} /> Opening / Closing Balance
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Opening ledger margins and closing balances summaries for seasonal cycle audits.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-amber-600" />
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Date Range:</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-amber-500" />
          <span className="text-gray-400">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-amber-500" />
        </div>

        <button onClick={fetchData} className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
          Apply Filter
        </button>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Ledger Account</th>
              <th className="p-3">Account Group</th>
              <th className="p-3 text-right">Opening Balance (₹)</th>
              <th className="p-3 text-right text-blue-600">Period Debit (₹)</th>
              <th className="p-3 text-right text-rose-600">Period Credit (₹)</th>
              <th className="p-3 text-right">Closing Balance (₹)</th>
              <th className="p-3 text-right">Net Change (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">Calculating balances...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">No data found for the selected period.</td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                const change = Math.abs(item.closingBalance) - Math.abs(item.openingBalance);
                const isAssetOrExpense = ['Asset', 'Expense'].includes(item.groupType);
                
                // For Assets/Expenses, an increase is positive. For Liabilities/Incomes, an increase is often negative visually but let's just use raw values
                const changeIndicator = isAssetOrExpense 
                  ? (change >= 0 ? 'text-emerald-600' : 'text-rose-600')
                  : (change >= 0 ? 'text-rose-600' : 'text-emerald-600'); 
                
                return (
                  <tr key={item.accountId || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-gray-800">{item.accountName}</td>
                    <td className="p-3 text-gray-500">{item.groupType}</td>
                    <td className="p-3 text-right text-gray-700">
                      {Math.abs(item.openingBalance).toLocaleString()} {item.openingBalance > 0 ? 'Dr' : 'Cr'}
                    </td>
                    <td className="p-3 text-right text-blue-700">{item.periodDebit > 0 ? item.periodDebit.toLocaleString() : '-'}</td>
                    <td className="p-3 text-right text-rose-700">{item.periodCredit > 0 ? item.periodCredit.toLocaleString() : '-'}</td>
                    <td className="p-3 text-right font-bold text-gray-800">
                      {Math.abs(item.closingBalance).toLocaleString()} {item.closingBalance > 0 ? 'Dr' : 'Cr'}
                    </td>
                    <td className={`p-3 text-right font-extrabold ${changeIndicator}`}>
                      {change > 0 ? '▲' : change < 0 ? '▼' : '-'} {Math.abs(change).toLocaleString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpeningClosingBalance;
