import React, { useState, useEffect } from 'react';
import { Wallet, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const BankBalance = () => {
  const [data, setData] = useState({ bankBalances: [], totalBankBalance: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analysis/bank-balance');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching bank balance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-cyan-600" size={22} /> Live Bank Balances
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Live reconciled bank books balance registers and cashflow indicators.</p>
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

      <div className="bg-slate-50 p-4 border border-cyan-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-cyan-600" />
          <span className="text-gray-500">As on Date:</span>
          <span className="font-bold text-gray-800">{new Date().toLocaleDateString()}</span>
          <button onClick={fetchData} className="ml-2 px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
            Refresh
          </button>
        </div>
        <div className="text-cyan-800 font-extrabold text-base">
          Net Bank Balance: ₹ {data.totalBankBalance.toLocaleString()}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 text-gray-500">Fetching live bank balances...</div>
      ) : data.bankBalances.length === 0 ? (
        <div className="text-center p-10 text-gray-500 border border-dashed rounded">No bank ledgers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4">
          {data.bankBalances.map((bank, idx) => {
            return (
              <div key={bank.accountId || idx} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{bank.bankName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-4">Account ID: {bank.accountId.slice(-6)}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-gray-700">Current Balance:</span>
                  <span className={`text-lg font-extrabold ${bank.balance >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                    ₹ {bank.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default BankBalance;
