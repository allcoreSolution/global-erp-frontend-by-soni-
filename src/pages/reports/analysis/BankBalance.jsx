import React from 'react';
import { Wallet, Download, Printer, Filter } from 'lucide-react';

const BankBalance = () => {
  const banks = [
    { name: 'HDFC Bank (Current A/c)', accountNo: 'XXXX-XXXX-1234', opening: 450000, deposits: 1250000, withdrawals: 850000, status: 'Reconciled' },
    { name: 'ICICI Bank (OD A/c)', accountNo: 'XXXX-XXXX-9876', opening: -150000, deposits: 500000, withdrawals: 450000, status: 'Reconciled' },
    { name: 'SBI Bank (Savings A/c)', accountNo: 'XXXX-XXXX-5555', opening: 25000, deposits: 10000, withdrawals: 5000, status: 'Pending' }
  ];

  const totalBalance = banks.reduce((acc, curr) => acc + (curr.opening + curr.deposits - curr.withdrawals), 0);

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

      <div className="bg-slate-50 p-4 border border-cyan-200 rounded-lg flex items-center justify-between gap-4 text-xs font-semibold text-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-cyan-600" />
          <span className="text-gray-500">As on Date:</span>
          <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        </div>
        <div className="text-cyan-800 font-extrabold text-base">
          Net Bank Balance: ₹ {totalBalance.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map((bank, idx) => {
          const closing = bank.opening + bank.deposits - bank.withdrawals;
          return (
            <div key={idx} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{bank.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bank.status === 'Reconciled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {bank.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-4">{bank.accountNo}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Opening Bal:</span>
                    <span className="font-semibold text-gray-800">₹ {bank.opening.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>+ Deposits:</span>
                    <span className="font-semibold">₹ {bank.deposits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 pb-2 border-b">
                    <span>- Withdrawals:</span>
                    <span className="font-semibold">₹ {bank.withdrawals.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2">
                <span className="text-xs font-bold text-gray-700">Closing Balance:</span>
                <span className={`text-lg font-extrabold ${closing >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                  ₹ {closing.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default BankBalance;
