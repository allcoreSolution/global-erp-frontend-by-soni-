import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const OutstandingReceivable = () => {
  const [data, setData] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const fetchOutstanding = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/financial/outstanding?type=receivable');
      if (res.data && res.data.success) {
        setData(res.data.data.records || []);
        setTotalDue(res.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching Receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ArrowUpRight className="text-cyan-600" size={22} /> Outstanding Receivable
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Track unpaid customer invoices and pending collections.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-cyan-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-cyan-600" />
          <select className="border p-1.5 rounded min-w-[200px]">
            <option>All Customers</option>
            <option>Superstone Enterprises</option>
          </select>
          <button className="px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700">Apply Filter</button>
        </div>
        <div className="text-base font-extrabold text-cyan-800">
          Total Receivables: ₹ {totalDue.toLocaleString()}
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Customer / Account Name</th>
              <th className="p-3">Account Group</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Pending Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading Outstanding Receivables...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">No outstanding receivables found.</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-gray-800">{item.accountName}</td>
                  <td className="p-3 text-gray-600">Asset (Receivable)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                      Pending
                    </span>
                  </td>
                  <td className="p-3 text-right font-extrabold text-gray-800">₹ {item.amount.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingReceivable;
