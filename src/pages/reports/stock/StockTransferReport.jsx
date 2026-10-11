import React, { useState, useEffect } from 'react';
import { Move, Download, Printer, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const StockTransferReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/transfer');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching stock transfer report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = data.filter(item =>
    (item.referenceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.fromWarehouse || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.toWarehouse || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = ['Date', 'Reference No', 'Product Name', 'From Warehouse', 'To Warehouse', 'Qty', 'Status'];
    const rows = filteredItems.map(r => [
      new Date(r.date).toLocaleDateString(), r.referenceNo, r.productName,
      r.fromWarehouse, r.toWarehouse, r.qty, r.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'stock_transfer_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Move className="text-indigo-600" size={24} />
              </div>
              Stock Transfer Report
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
              Inter-warehouse dynamic stock shipping logs, transit status, and delivery.
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportCSV} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Ref No, Product or Warehouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Reference No</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching stock transfer report...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">No transfer records found.</td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-indigo-700 font-medium">{item.referenceNo || '-'}</td>
                    <td className="p-4 font-semibold text-slate-800">{item.productName || '-'}</td>
                    <td className="p-4 text-rose-600 font-semibold">{item.fromWarehouse}</td>
                    <td className="p-4 text-emerald-600 font-semibold">{item.toWarehouse}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{item.qty || 0}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'In Transit' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                        }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
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

export default StockTransferReport;
