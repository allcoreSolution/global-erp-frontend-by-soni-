import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const StockMovement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
      const res = await api.get('/reports/stock/movement');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching stock movement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(d => {
    const dDate = new Date(d.date).toISOString().split('T')[0];
    return dDate >= fromDate && dDate <= toDate;
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={22} /> Stock Movement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Audit logs tracking dynamic stock transfer shifts from inventory sources to destinations.</p>
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

      <div className="bg-slate-50 p-4 border border-indigo-200 rounded-lg flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-indigo-600" />
        <span className="text-gray-500">Date Range:</span>
        <input type="date" className="border p-1.5 rounded outline-none focus:border-indigo-500" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <span>to</span>
        <input type="date" className="border p-1.5 rounded outline-none focus:border-indigo-500" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button onClick={fetchData} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
          Apply Filter
        </button>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="block w-full overflow-x-auto w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Transfer Ref</th>
              <th className="p-3">Item Name</th>
              <th className="p-3 text-center">Transfer Qty</th>
              <th className="p-3">Source Location</th>
              <th className="p-3">Destination Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching stock movement...</td>
               </tr>
            ) : filteredData.length === 0 ? (
               <tr>
                 <td colSpan="7" className="p-4 text-center text-gray-500 italic">No movement records found.</td>
               </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-gray-600">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</td>
                  <td className="p-3 font-mono text-indigo-700">{item.ref}</td>
                  <td className="p-3 font-semibold text-gray-800">
                    <div>{item.item}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{item.sku}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-gray-700">{item.qty.toLocaleString()}</td>
                  <td className="p-3 text-rose-600">{item.source}</td>
                  <td className="p-3 text-emerald-600">{item.dest}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status}
                    </span>
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

export default StockMovement;
