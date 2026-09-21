import React, { useState, useEffect } from 'react';
import { Briefcase, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const AccountWiseSummary = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [groupFilter, setGroupFilter] = useState('All Groups');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analysis/account-wise?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching account-wise summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (groupFilter !== 'All Groups' && item.groupType !== groupFilter) return false;
    // Don't show accounts with 0 movement unless they are specifically filtered
    if (item.totalDebit === 0 && item.totalCredit === 0) return false;
    return true;
  });

  const uniqueGroups = ['All Groups', ...new Set(data.map(d => d.groupType))];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={22} /> Account-wise Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Comparative evaluation summaries of individual accounting categories.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-blue-200 rounded-lg flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-indigo-600" />
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Account Group:</span>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="border p-1.5 rounded min-w-[150px] outline-none">
            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">Date Range:</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none" />
          <span className="text-gray-400">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none" />
        </div>

        <button onClick={fetchData} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
          Apply Filter
        </button>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="block w-full overflow-x-auto w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Account Group</th>
              <th className="p-3">Ledger Name</th>
              <th className="p-3 text-right">Debit (Dr) (₹)</th>
              <th className="p-3 text-right">Credit (Cr) (₹)</th>
              <th className="p-3 text-right">Net Movement (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 italic">Loading summary...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 italic">No account movements found.</td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.accountId || idx} className="hover:bg-slate-50">
                  <td className="p-3 text-gray-500">{item.groupType}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.accountName}</td>
                  <td className="p-3 text-right font-medium text-blue-700">{item.totalDebit > 0 ? item.totalDebit.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right font-medium text-rose-700">{item.totalCredit > 0 ? item.totalCredit.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right font-extrabold text-indigo-700">
                    {item.netMovement !== 0 ? (Math.abs(item.netMovement).toLocaleString() + (item.netMovement > 0 ? ' Dr' : ' Cr')) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountWiseSummary;
