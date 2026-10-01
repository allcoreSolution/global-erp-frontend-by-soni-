import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const OpeningStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/opening-stock');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching opening stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Use the earliest date from data as Financial Year Start, or default to current year April 1
  const today = new Date();
  const defaultFyStart = new Date(today.getFullYear(), 3, 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  
  let fyStart = defaultFyStart;
  if (data.length > 0) {
    const dates = data.map(d => new Date(d.date).getTime()).filter(t => !isNaN(t));
    if (dates.length > 0) {
      const earliest = new Date(Math.min(...dates));
      fyStart = earliest.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    }
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-600" size={22} /> Opening Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Statements of initial inventory levels uploaded at the beginning of the financial year.</p>
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

      <div className="bg-slate-50 p-4 border border-purple-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-purple-600" />
          <span className="text-gray-500">Earliest Record:</span>
          <span className="bg-white border p-1.5 rounded font-bold">{fyStart}</span>
          <button onClick={fetchData} className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Refresh Data
          </button>
        </div>
        <div className="text-purple-800 font-extrabold text-base">
          Total Opening Value: ₹ {totalValue.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Item Name</th>
              <th className="p-3">Opening Date</th>
              <th className="p-3 text-right">Opening Qty</th>
              <th className="p-3 text-right">Valuation Rate (₹)</th>
              <th className="p-3 text-right">Total Opening Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">Fetching opening stock...</td>
               </tr>
            ) : data.length === 0 ? (
               <tr>
                 <td colSpan="5" className="p-4 text-center text-gray-500 italic">No opening stock found.</td>
               </tr>
            ) : (
              data.map((item, idx) => {
                const formattedDate = new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-gray-800">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">SKU: {item.sku}</div>
                    </td>
                    <td className="p-3 text-gray-600">{formattedDate}</td>
                    <td className="p-3 text-right font-bold text-gray-700">{item.qty.toLocaleString()}</td>
                    <td className="p-3 text-right text-gray-600">{item.rate.toLocaleString()}</td>
                    <td className="p-3 text-right font-extrabold text-purple-700">₹ {item.value.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpeningStock;
