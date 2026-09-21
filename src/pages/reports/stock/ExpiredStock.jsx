import React, { useState, useEffect } from 'react';
import { CalendarX, Search, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const ExpiredStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/expired');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expired stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.batchNo && item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalValue = filteredItems.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarX className="text-rose-600" size={24} /> Expired & Near Expiry Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Track inventory items that have expired or are nearing their expiration date.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-50 p-4 border border-rose-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-rose-600" />
            <span className="text-xs font-semibold text-gray-700">Filter By:</span>
          </div>
          <select className="border p-1.5 rounded text-xs text-gray-700 bg-white">
            <option>All Items</option>
            <option>Already Expired</option>
            <option>Expires in 30 Days</option>
            <option>Expires in 90 Days</option>
          </select>
          <div className="text-xs font-bold text-rose-800 ml-4 hidden md:block">
            Total Value at Risk: ₹ {totalValue.toLocaleString()}
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search item, ID or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      <div className="md:hidden text-xs font-bold text-rose-800 text-center">
        Total Value at Risk: ₹ {totalValue.toLocaleString()}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-gray-600">Item Code</th>
              <th className="p-3 font-semibold text-gray-600">Item Name</th>
              <th className="p-3 font-semibold text-gray-600">Batch No</th>
              <th className="p-3 font-semibold text-gray-600">Exp. Date</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Qty</th>
              <th className="p-3 font-semibold text-gray-600">Supplier</th>
              <th className="p-3 font-semibold text-gray-600 text-right">Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 italic">Fetching expired stock...</td>
              </tr>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const isExpired = item.status === 'Expired';
                
                return (
                  <tr key={idx} className="hover:bg-rose-50/30">
                    <td className="p-3 font-mono text-gray-500">{item.sku}</td>
                    <td className="p-3 font-medium text-gray-800">{item.name}</td>
                    <td className="p-3 text-gray-600 text-xs">{item.batchNo || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`font-semibold px-2 py-1 rounded text-xs ${isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.expiryDate || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-gray-700">{item.qty} <span className="text-xs font-normal text-gray-500">{item.unit || 'Nos'}</span></td>
                    <td className="p-3 text-gray-600 text-xs">{item.supplier || 'N/A'}</td>
                    <td className="p-3 text-right font-bold text-rose-700">₹ {(item.value || 0).toLocaleString()}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 italic">No expiry items found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiredStock;
