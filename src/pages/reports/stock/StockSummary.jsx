import React, { useState, useEffect } from 'react';
import { Package, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const StockSummary = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalItemsInStock: 0,
    totalStockValue: 0
  });
  const [loading, setLoading] = useState(false);
  const [filterGroup, setFilterGroup] = useState('All Groups');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/summary');
      if (res.data && res.data.success) {
        setData(res.data.data.items || []);
        setSummary(res.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = filterGroup === 'All Groups' 
    ? data 
    : data.filter(item => item.category === filterGroup);

  const totalQty = filteredData.reduce((acc, curr) => acc + (curr.currentStock || 0), 0);
  const totalValue = filteredData.reduce((acc, curr) => acc + (curr.stockValue || 0), 0);

  // Extract unique categories for filter dropdown
  const categories = ['All Groups', ...new Set(data.map(item => item.category))];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-600" size={22} /> Stock Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Overall summaries of all inventory category units and asset valuation.</p>
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
        <span className="text-gray-500">Stock Group:</span>
        <select 
          className="border p-1.5 rounded min-w-[200px]"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={fetchData} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-emerald-600">Total Items in Stock (Physical)</span>
          <span className="text-2xl font-extrabold text-emerald-800">{totalQty.toLocaleString()} Units</span>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-indigo-600">Total Stock Valuation (Cost)</span>
          <span className="text-2xl font-extrabold text-indigo-800">₹ {totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Stock Group</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-right">Available Qty</th>
              <th className="p-3 text-right">Avg Cost Rate (₹)</th>
              <th className="p-3 text-right">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">Fetching stock summary...</td>
               </tr>
            ) : filteredData.length === 0 ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">No products found.</td>
               </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-gray-500">{item.category}</td>
                  <td className="p-3 font-semibold text-gray-800">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-normal">SKU: {item.sku}</div>
                  </td>
                  <td className="p-3 text-right font-bold text-gray-800">{item.currentStock.toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-500">{item.purchasePrice.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-indigo-700">₹ {(item.stockValue || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && filteredData.length > 0 && (
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td colSpan="4" className="p-3 text-right text-gray-800 uppercase text-[10px]">Grand Total Value</td>
                <td className="p-3 text-right text-indigo-800">₹ {totalValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default StockSummary;
