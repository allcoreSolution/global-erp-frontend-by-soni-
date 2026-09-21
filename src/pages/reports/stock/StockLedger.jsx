import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const StockLedger = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterItem, setFilterItem] = useState('All');
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // The API returns all ledger entries across products. In production, we'd pass filters to the backend.
      const res = await api.get('/reports/stock/ledger');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching stock ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique items for the dropdown filter
  const uniqueItems = ['All', ...new Set(data.map(d => d.item))];

  // Filter and calculate running balance
  const filteredData = [...data]
    .filter(d => filterItem === 'All' || d.item === filterItem)
    .filter(d => {
      const dDate = new Date(d.date).toISOString().split('T')[0];
      return dDate >= fromDate && dDate <= toDate;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically for running balance

  let runningBalance = 0;
  const tableData = filteredData.map(item => {
    runningBalance += (item.inward || 0) - (item.outward || 0);
    return { ...item, balance: runningBalance };
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-amber-600" size={22} /> Stock Ledger
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Detailed product ledger statements tracing individual incoming/outgoing transactions.</p>
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

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex flex-wrap gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-amber-600" />
          <span className="text-gray-500">Item:</span>
          <select 
            className="border p-1.5 rounded min-w-[200px] outline-none focus:border-amber-500"
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
          >
            {uniqueItems.map((item, idx) => (
              <option key={idx} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">From:</span>
          <input type="date" className="border p-1.5 rounded outline-none focus:border-amber-500" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span className="text-gray-500">To:</span>
          <input type="date" className="border p-1.5 rounded outline-none focus:border-amber-500" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <button onClick={fetchData} className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
            Apply Filter
          </button>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="block w-full overflow-x-auto w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Transaction Date</th>
              <th className="p-3">Reference No.</th>
              <th className="p-3">Item / SKU</th>
              <th className="p-3">Transaction Type</th>
              <th className="p-3 text-right bg-emerald-50/50">Inward Qty (+)</th>
              <th className="p-3 text-right bg-rose-50/50">Outward Qty (-)</th>
              <th className="p-3 text-right font-bold bg-amber-50/30 border-l">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching stock ledger...</td>
               </tr>
            ) : tableData.length === 0 ? (
               <tr>
                 <td colSpan="7" className="p-4 text-center text-gray-500 italic">No ledger records found.</td>
               </tr>
            ) : (
              tableData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-gray-600">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</td>
                  <td className="p-3 font-mono text-amber-700">{item.voucherNo}</td>
                  <td className="p-3 font-semibold text-gray-800">
                    <div>{item.item}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{item.sku}</div>
                  </td>
                  <td className="p-3 font-semibold text-gray-700">{item.type}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{item.inward > 0 ? item.inward : '-'}</td>
                  <td className="p-3 text-right font-bold text-rose-600">{item.outward > 0 ? item.outward : '-'}</td>
                  <td className="p-3 text-right font-extrabold text-gray-800 border-l">{item.balance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLedger;
