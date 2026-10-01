import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const CashBook = () => {
  const [ledgers, setLedgers] = useState([]);
  const [accountId, setAccountId] = useState('');
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const [statementData, setStatementData] = useState([]);
  const [accountInfo, setAccountInfo] = useState({
    openingBalance: 0,
    closingBalance: 0
  });

  useEffect(() => {
    fetchLedgers();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchStatement();
    }
  }, [accountId]);

  const fetchLedgers = async () => {
    try {
      const response = await api.get('/account-ledgers');
      if (response.data && response.data.data) {
        // Filter for Cash accounts
        const cashLedgers = response.data.data.filter(l => 
          l.groupType === 'Asset' && l.accountName.toLowerCase().includes('cash')
        );
        setLedgers(cashLedgers);
        if (cashLedgers.length > 0) {
          setAccountId(cashLedgers[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const fetchStatement = async () => {
    if (!accountId) return;
    try {
      const response = await api.get(`/vouchers/statement?accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}`);
      if (response.data && response.data.success) {
        setStatementData(response.data.data);
        setAccountInfo(response.data.accountInfo);
      }
    } catch (error) {
      console.error('Error fetching statement:', error);
    }
  };

  const totalReceipts = statementData.reduce((acc, curr) => acc + (curr.debit || 0), 0); // Cash received is Dr to Cash A/c
  const totalPayments = statementData.reduce((acc, curr) => acc + (curr.credit || 0), 0); // Cash paid is Cr to Cash A/c
  const openingBalance = accountInfo.openingBalance || 0;
  const closingBalance = accountInfo.closingBalance || 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-amber-600" size={22} /> Cash Book
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Daily cash transaction flows, closing balance, and physical cash assets check.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-amber-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-amber-600" />
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="border p-1.5 rounded min-w-[200px] outline-none focus:border-amber-500">
          <option value="">Select Cash Account...</option>
          {ledgers.map(l => (
            <option key={l._id} value={l._id}>{l.accountName}</option>
          ))}
        </select>
        <span className="text-gray-500 ml-2">Date Range:</span>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-amber-500" />
        <span className="text-gray-400">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-1.5 rounded outline-none focus:border-amber-500" />
        <button onClick={fetchStatement} className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors">Apply Filter</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-gray-500">Opening Balance</span>
          <span className="text-base font-extrabold text-gray-800">₹ {openingBalance.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Total Receipts (+)</span>
          <span className="text-base font-extrabold text-emerald-700">₹ {totalReceipts.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-600">Total Payments (-)</span>
          <span className="text-base font-extrabold text-rose-700">₹ {totalPayments.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50/30 border border-amber-200 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-600">Closing Cash Balance</span>
          <span className="text-base font-extrabold text-amber-700">₹ {closingBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Voucher ID</th>
              <th className="p-3">Particulars</th>
              <th className="p-3">Ref No</th>
              <th className="p-3 text-right">Receipts (₹)</th>
              <th className="p-3 text-right">Payments (₹)</th>
              <th className="p-3 text-right">Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statementData.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 font-medium">No transactions found for this period.</td>
              </tr>
            )}
            {statementData.map((t, idx) => (
              <tr key={t.voucherId || idx} className="hover:bg-slate-50">
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 font-mono font-bold text-amber-600">{t.voucherNo || t.voucherId.slice(-6)}</td>
                <td className="p-3 font-semibold text-gray-800">
                  {t.narration || t.voucherType}
                </td>
                <td className="p-3 text-gray-500">-</td>
                <td className="p-3 text-right font-bold text-emerald-700">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-rose-700">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-bold text-gray-800">{t.runningBalance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBook;
