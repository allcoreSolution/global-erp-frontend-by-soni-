import React, { useState, useEffect } from 'react';
import { Percent, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const StockValuation = () => {
  const [data, setData] = useState([]);
  const [totalValuation, setTotalValuation] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/valuation');
      if (res.data && res.data.success) {
        setData(res.data.data.items || []);
        setTotalValuation(res.data.data.totalCostValue || 0);
      }
    } catch (error) {
      console.error('Error fetching stock valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Percent className="text-slate-600" size={22} /> Stock Valuation
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Evaluate stock worth indices using Average Costing models.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-slate-600" />
          <span className="text-gray-500">Valuation Method:</span>
          <select className="border p-1.5 rounded outline-none focus:border-slate-500">
            <option>Average Cost (Recommended)</option>
          </select>
          <button onClick={fetchData} className="px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
            Refresh Data
          </button>
        </div>
        <div className="text-slate-800 font-extrabold text-base">
          Total Inventory Value: ₹ {totalValuation.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="block w-full overflow-x-auto w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-right">Available Qty</th>
              <th className="p-3 text-right bg-slate-200/50">Avg Cost Rate (₹)</th>
              <th className="p-3 text-right font-bold bg-slate-200/80">Total Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">Fetching stock valuation...</td>
               </tr>
            ) : data.length === 0 ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">No products found.</td>
               </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{item.sku || 'N/A'}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="p-3 text-right font-bold text-gray-700">{(item.qty || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-indigo-600 bg-slate-50/50">{(item.costRate || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-slate-800 bg-slate-50">₹ {(item.costValue || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockValuation;
