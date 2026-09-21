import React, { useState, useEffect } from 'react';
import { Percent, Download, Printer, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../../api';

const NetSalesReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales/net-sales');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching net sales:', error);
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
            <div className="p-2 bg-teal-50 rounded-lg">
              <Percent className="text-teal-600" size={24} />
            </div>
            Net Sales Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Calculated net sales sheets showing gross sales values minus return margins and trade discounts.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Period</th>
                <th className="p-4 text-right">Gross Sales</th>
                <th className="p-4 text-right text-rose-600">Total Returns</th>
                <th className="p-4 text-right text-rose-600">Discounts Allowed</th>
                <th className="p-4 text-right text-teal-700">Net Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 italic">Fetching net sales data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 italic">No records found.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{row.period}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(row.grossSales)}</td>
                    <td className="p-4 text-right text-rose-600">-{formatCurrency(row.returns)}</td>
                    <td className="p-4 text-right text-rose-600">-{formatCurrency(row.discounts)}</td>
                    <td className="p-4 text-right font-bold text-teal-700 bg-teal-50/30">{formatCurrency(row.netSales)}</td>
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

export default NetSalesReport;
