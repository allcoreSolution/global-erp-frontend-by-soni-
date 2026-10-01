import React, { useState, useEffect } from 'react';
import { Trash2, Download, Printer, Search } from 'lucide-react';
import api from '../../../api';

const DamagedStockReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/damaged');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching damaged stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Trash2 className="text-slate-600" size={24} />
            </div>
            Damaged Stock Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Inventory write-offs registries cataloging damaged parts.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-slate-50/40 p-4 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Product Name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4">Reason</th>
                <th className="p-4 text-center">Value (₹)</th>
                <th className="p-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching damaged stock report...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">No damaged items found.</td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-slate-500 font-medium">{item.sku}</td>
                    <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-4 text-center font-bold text-gray-800">{item.qty}</td>
                    <td className="p-4 text-slate-600">{item.reason}</td>
                    <td className="p-4 text-center font-medium text-rose-600">{item.value.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">{item.loggedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DamagedStockReport;
