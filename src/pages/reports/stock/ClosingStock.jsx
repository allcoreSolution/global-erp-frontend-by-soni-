import React, { useState, useEffect } from 'react';
import { FolderMinus, Download, Printer, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const ClosingStock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/closing-stock');
      if (res.data && res.data.success) {
        setItems(res.data.data.items || []);
        setTotalValue(res.data.data.totalClosingValue || 0);
      }
    } catch (error) {
      console.error('Error fetching closing stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const exportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Item Name', 'SKU', 'Category', 'Closing Qty', 'Rate (Rs)', 'Closing Value (Rs)'];
    const rows = items.map(item => [
      item.name || '', item.sku || '', item.category || '',
      item.closingQty || 0, item.rate || 0, item.closingValue || 0
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `closing_stock_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <FolderMinus className="text-cyan-600" size={22} /> Closing Stock
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500">Reconciled statements of remaining stocks left in warehouses after sales/purchases.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportCSV} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-cyan-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-cyan-600" />
          <span className="text-gray-500">Closing As On Date:</span>
          <input type="date" className="border p-1.5 rounded outline-none focus:border-cyan-500" defaultValue={today} />
          <button onClick={fetchData} className="px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
            Refresh Data
          </button>
        </div>
        <div className="text-cyan-800 font-extrabold text-base">
          Total Closing Value: ₹ {totalValue.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Item Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-right">Closing Qty</th>
              <th className="p-3 text-right">Rate (₹)</th>
              <th className="p-3 text-right">Closing Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500 italic">Fetching closing stock...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500 italic">No closing stock found.</td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="p-3 font-mono text-gray-500">{item.sku}</td>
                  <td className="p-3 text-gray-600">{item.category}</td>
                  <td className="p-3 text-right font-bold text-gray-700">{(item.closingQty || 0).toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-600">{(item.rate || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-cyan-700">₹ {(item.closingValue || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && items.length > 0 && (
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td colSpan="5" className="p-3 text-right text-gray-800 uppercase text-[10px]">Grand Total Closing Value</td>
                <td className="p-3 text-right text-cyan-800">₹ {totalValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ClosingStock;
