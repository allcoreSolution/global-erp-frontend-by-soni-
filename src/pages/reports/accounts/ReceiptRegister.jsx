import React, { useState, useEffect } from 'react';
import { Receipt, Search, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const ReceiptRegister = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);
      queryParams.append('voucherType', 'Receipt');
      
      const res = await api.get(`/vouchers?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching receipt vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const receipts = vouchers.map(v => {
    // In a Receipt, we receive money from a Party. So Cash/Bank is Debited, Party is Credited.
    // Let's find the credited account to show as 'Party'
    const partyEntry = v.entries.find(e => e.creditAmount > 0);
    return {
      id: v._id,
      voucherNo: v.voucherNo || v._id.slice(-6),
      date: new Date(v.date).toLocaleDateString(),
      party: partyEntry?.account?.accountName || v.generalNarration || 'Unknown',
      amount: v.totalDebit || 0, // Total receipt amount
      mode: 'Receipt',
      status: v.status || 'Posted',
      refNo: '-'
    };
  });

  const totalAmount = receipts.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCleared = receipts.filter(t => t.status === 'Posted').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-rose-600" size={22} /> Receipt Register
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">History of cash and bank voucher receipt logs collected from customers.</p>
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

      <div className="bg-slate-50 p-4 border border-rose-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-rose-600" />
        <select className="border p-1.5 rounded min-w-[200px]">
          <option>All Modes</option>
          <option>Cash</option>
          <option>Cheque</option>
          <option>Bank Transfer</option>
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-rose-500" />
        <span className="text-gray-400">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-rose-500" />
        <button onClick={fetchReceipts} className="px-3 py-1.5 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total Receipts Logged</span>
          <span className="text-base font-extrabold text-blue-700">₹ {totalAmount.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Total Cleared Receipts</span>
          <span className="text-base font-extrabold text-emerald-700">₹ {totalCleared.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Receipt ID</th>
              <th className="p-3">Party / Received From</th>
              <th className="p-3">Ref No</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">Loading receipts...</td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">No receipt vouchers found.</td>
              </tr>
            ) : (
              receipts.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-50">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3 font-mono font-bold text-rose-600">{t.voucherNo}</td>
                  <td className="p-3 font-semibold text-gray-800">{t.party}</td>
                  <td className="p-3 text-gray-500">{t.refNo}</td>
                  <td className="p-3 text-gray-700">{t.mode}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-extrabold text-emerald-700">₹ {t.amount.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptRegister;
