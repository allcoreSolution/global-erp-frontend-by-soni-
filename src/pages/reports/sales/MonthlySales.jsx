import React, { useState, useEffect } from 'react';
import { LineChart, Download, Printer, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../../api';

const MonthlySales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales/monthly');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
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
            <div className="p-2 bg-purple-50 rounded-lg">
              <LineChart className="text-purple-600" size={24} />
            </div>
            Monthly Sales Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Monthly sales comparison summaries to study target compliance and cash inflows.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="block w-full overflow-x-auto w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Month</th>
                <th className="p-4 text-center">Total Invoices</th>
                <th className="p-4 text-right">Gross Amount</th>
                <th className="p-4 text-right">Tax Amount</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right text-purple-700">Net Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching monthly sales data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">No records found.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{row.month}</td>
                    <td className="p-4 text-center text-slate-600">{row.totalInvoices}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(row.grossAmount)}</td>
                    <td className="p-4 text-right text-slate-600">{formatCurrency(row.taxAmount)}</td>
                    <td className="p-4 text-right text-rose-600">-{formatCurrency(row.discountAmount)}</td>
                    <td className="p-4 text-right font-bold text-purple-700 bg-purple-50/30">{formatCurrency(row.netAmount)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
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

export default MonthlySales;
