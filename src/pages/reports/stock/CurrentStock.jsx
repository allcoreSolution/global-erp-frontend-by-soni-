import React, { useState, useEffect } from 'react';
import { Layers, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const CurrentStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/current-stock');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching current stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchTerm.trim() === '' 
    ? data 
    : data.filter(item => 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-emerald-600" size={22} /> Current Stock Status
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Realtime lookup on inventory stocks, physical counts, and committed vs available stock.</p>
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

      <div className="bg-slate-50 p-4 border border-emerald-200 rounded-lg flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-emerald-600" />
        <span className="text-gray-500">Search Item / SKU:</span>
        <input 
          type="text" 
          className="border p-1.5 rounded min-w-[200px]" 
          placeholder="e.g. ELC-TV-55" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchData} className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">Refresh Data</button>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">SKU / Code</th>
              <th className="p-3">Item Name</th>
              <th className="p-3">Warehouse / Location</th>
              <th className="p-3 text-right">On Hand (Physical)</th>
              <th className="p-3 text-right">Committed (Sales)</th>
              <th className="p-3 text-right bg-emerald-50/50">Available for Sale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="6" className="p-4 text-center text-gray-500 italic">Fetching current stock...</td>
               </tr>
            ) : filteredData.length === 0 ? (
               <tr>
                 <td colSpan="6" className="p-4 text-center text-gray-500 italic">No products found.</td>
               </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-emerald-700">{item.sku || 'N/A'}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="p-3 text-gray-600">{item.location}</td>
                  <td className="p-3 text-right font-bold text-gray-700">{item.onHand.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-600">{item.committed.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-emerald-700 bg-emerald-50/20">{item.available.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentStock;
