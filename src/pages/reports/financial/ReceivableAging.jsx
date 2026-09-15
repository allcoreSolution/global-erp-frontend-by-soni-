import React from 'react';
import { Clock, Download, Printer } from 'lucide-react';

const ReceivableAging = () => {
  const data = [
    { customer: 'Amit Sharma (Retail)', current: 5000, days30: 14160, days60: 0, days90: 0, older: 0 },
    { customer: 'Superstone Enterprises', current: 0, days30: 25000, days60: 20000, days90: 0, older: 0 },
    { customer: 'Rajesh Kumar', current: 8500, days30: 0, days60: 0, days90: 12000, older: 5000 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-indigo-600" size={22} /> Receivable Aging Analysis
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Aging matrices analysis for customer collections.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 border-r">Customer Name</th>
              <th className="p-3 text-right bg-emerald-50/50">Current (0-30 Days)</th>
              <th className="p-3 text-right bg-amber-50/50">31-60 Days</th>
              <th className="p-3 text-right bg-orange-50/50">61-90 Days</th>
              <th className="p-3 text-right bg-rose-50/50">&gt; 90 Days</th>
              <th className="p-3 text-right bg-slate-100 font-bold border-l">Total Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => {
              const total = item.current + item.days30 + item.days60 + item.days90 + item.older;
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-gray-800 border-r">{item.customer}</td>
                  <td className="p-3 text-right text-gray-700">{item.current > 0 ? item.current.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right text-amber-700">{item.days30 > 0 ? item.days30.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right text-orange-700">{item.days60 > 0 ? item.days60.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right text-rose-700 font-bold">{item.older > 0 ? item.older.toLocaleString() : '-'}</td>
                  <td className="p-3 text-right font-extrabold text-indigo-700 border-l">₹ {total.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivableAging;
