import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const JournalRegister = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);
      queryParams.append('voucherType', 'Journal');
      
      const res = await api.get(`/vouchers?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching journal vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const entries = vouchers.flatMap(v => {
    return v.entries.map((entry, index) => ({
      id: `${v._id}-${index}`,
      date: new Date(v.date).toLocaleDateString(),
      voucherNo: v.voucherNo || v._id.slice(-6),
      particulars: entry.account?.accountName || 'Unknown',
      debit: entry.debitAmount > 0 ? entry.debitAmount : null,
      credit: entry.creditAmount > 0 ? entry.creditAmount : null,
      user: 'Admin', // In real app, could be v.createdBy
      refNo: '-'
    }));
  });

  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-slate-600" size={22} /> Journal Register
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Comprehensive logs of adjustment vouchers and manual entries.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-slate-600" />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-slate-500" />
        <span className="text-gray-400">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-slate-500" />
        <button onClick={fetchJournals} className="px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total Debit</span>
          <span className="text-base font-extrabold text-blue-700">₹ {totalDebit.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Credit</span>
          <span className="text-base font-extrabold text-rose-700">₹ {totalCredit.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Voucher ID</th>
              <th className="p-3">Particulars / Account</th>
              <th className="p-3">Ref No</th>
              <th className="p-3">Created By</th>
              <th className="p-3 text-right">Debit (₹)</th>
              <th className="p-3 text-right">Credit (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">Loading journals...</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 italic">No journal entries found.</td>
              </tr>
            ) : (
              entries.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-50">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3 font-mono font-bold text-slate-600">{t.voucherNo}</td>
                  <td className="p-3 font-semibold text-gray-800">{t.particulars}</td>
                  <td className="p-3 text-gray-500">{t.refNo}</td>
                  <td className="p-3 text-gray-500">{t.user}</td>
                  <td className="p-3 text-right font-bold text-blue-700">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right font-bold text-rose-700">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalRegister;
