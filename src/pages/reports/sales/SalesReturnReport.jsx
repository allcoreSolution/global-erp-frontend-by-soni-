import React, { useState, useEffect } from 'react';
import { RotateCcw, Download, Printer, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../../api';

const SalesReturnReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales/return-report');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching return report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg">
              <RotateCcw className="text-rose-600" size={24} />
            </div>
            Sales Return Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Refund logs, returned products list, credit vouchers, and sales returns percentages.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="block w-full overflow-x-auto w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Return No</th>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Reason</th>
                <th className="p-4 text-right text-rose-700">Return Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching sales returns...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">No return records found.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 font-semibold text-slate-700">{row.returnNo}</td>
                    <td className="p-4 text-blue-600 hover:underline cursor-pointer">{row.invoiceNo}</td>
                    <td className="p-4 text-slate-600">{row.customer}</td>
                    <td className="p-4 text-slate-500 text-xs truncate max-w-[150px]">{row.reason}</td>
                    <td className="p-4 text-right font-bold text-rose-700 bg-rose-50/30">{formatCurrency(row.returnAmount)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
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

export default SalesReturnReport;
