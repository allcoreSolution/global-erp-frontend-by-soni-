import React, { useState, useEffect } from 'react';
import { Download, Printer, Layers } from 'lucide-react';
import api from '../../../api';

const YearlyPurchase = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/purchases/yearly');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return "₹ " + value.toLocaleString('en-IN');
    }
    return value;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Layers className="text-indigo-600" size={24} />
            </div>
            Yearly Purchase Report
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="block w-full overflow-x-auto w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Year</th>
                <th className="p-4">Invoices</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Returns</th>
                <th className="p-4">Net Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4">{['amount', 'totalAmount', 'grossPurchase', 'discountReceived', 'returns', 'net', 'netPurchase'].includes('year') ? formatCurrency(row['year']) : row['year']}</td>
                    <td className="p-4">{['amount', 'totalAmount', 'grossPurchase', 'discountReceived', 'returns', 'net', 'netPurchase'].includes('invoices') ? formatCurrency(row['invoices']) : row['invoices']}</td>
                    <td className="p-4">{['amount', 'totalAmount', 'grossPurchase', 'discountReceived', 'returns', 'net', 'netPurchase'].includes('amount') ? formatCurrency(row['amount']) : row['amount']}</td>
                    <td className="p-4">{['amount', 'totalAmount', 'grossPurchase', 'discountReceived', 'returns', 'net', 'netPurchase'].includes('returns') ? formatCurrency(row['returns']) : row['returns']}</td>
                    <td className="p-4">{['amount', 'totalAmount', 'grossPurchase', 'discountReceived', 'returns', 'net', 'netPurchase'].includes('net') ? formatCurrency(row['net']) : row['net']}</td>
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

export default YearlyPurchase;
