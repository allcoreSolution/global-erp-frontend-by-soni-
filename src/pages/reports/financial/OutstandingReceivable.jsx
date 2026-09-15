import React from 'react';
import { ArrowUpRight, Download, Printer, Filter } from 'lucide-react';

const OutstandingReceivable = () => {
  const data = [
    { customer: 'Amit Sharma (Retail)', ref: 'INV-2026-1122', date: '2026-08-15', dueAmount: 14160, overdueDays: 15, status: 'Overdue' },
    { customer: 'Superstone Enterprises', ref: 'INV-2026-1004', date: '2026-08-01', dueAmount: 45000, overdueDays: 30, status: 'Critical' },
    { customer: 'Rajesh Kumar', ref: 'INV-2026-1199', date: '2026-09-01', dueAmount: 8500, overdueDays: 0, status: 'Pending' }
  ];

  const totalDue = data.reduce((acc, curr) => acc + curr.dueAmount, 0);

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
              <th className="p-3">Customer Name</th>
              <th className="p-3">Invoice Ref</th>
              <th className="p-3">Bill Date</th>
              <th className="p-3">Overdue Days</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Pending Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-gray-800">{item.customer}</td>
                <td className="p-3 font-mono text-cyan-700">{item.ref}</td>
                <td className="p-3 text-gray-600">{item.date}</td>
                <td className="p-3 text-gray-800 font-bold">{item.overdueDays} Days</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                    item.status === 'Overdue' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-right font-extrabold text-gray-800">₹ {item.dueAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingReceivable;
