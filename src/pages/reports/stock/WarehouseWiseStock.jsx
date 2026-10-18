import React, { useState, useEffect } from 'react';
import { Home, Download, Printer, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const WarehouseWiseStock = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/warehouse-wise');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching warehouse wise stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter(item =>
    (item.warehouse || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.productName || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalQty = filtered.reduce((a, c) => a + (Number(c.qty) || 0), 0);
  const totalValue = filtered.reduce((a, c) => a + (Number(c.value) || 0), 0);

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Warehouse', 'Product Name', 'SKU', 'Qty', 'Value (Rs)'];
    const rows = filtered.map(r => [r.warehouse, r.productName, r.sku, r.qty, r.value]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'warehouse_wise_stock.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="text-rose-600" size={22} /> Warehouse-wise Stock
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500">Breakdown of inventory stocks stored across specific warehouses.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportCSV} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search warehouse / product / SKU..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-400" />
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {[
          { label: 'Total Records', val: filtered.length.toLocaleString(), color: 'bg-rose-50 text-rose-700 border-rose-200' },
          { label: 'Total Stock Value', val: `₹ ${totalValue.toLocaleString()}`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${s.color}`}>
            <div className="text-[10px] font-bold uppercase opacity-70">{s.label}</div>
            <div className="text-xl font-extrabold mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500 italic">Fetching warehouse-wise stock...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500 italic">No stock found.</td></tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-rose-50/20">
                  <td className="p-3 font-bold text-rose-700">{item.warehouse || '-'}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.productName}</td>
                  <td className="p-3 font-mono text-gray-500">{item.sku}</td>
                  <td className="p-3 text-gray-600">{item.category || '-'}</td>
                  <td className="p-3 text-right font-bold text-gray-700">{(item.qty || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-rose-700">₹ {(item.value || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && filtered.length > 0 && (
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td colSpan="4" className="p-3 text-right text-gray-800 uppercase text-[10px]">Grand Total</td>
                <td className="p-3 text-right text-gray-800">{totalQty.toLocaleString()}</td>
                <td className="p-3 text-right text-rose-800">₹ {totalValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default WarehouseWiseStock;
