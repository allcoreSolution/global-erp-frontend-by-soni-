import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';

const RecentOutstandingDetails = () => {
  const outstandingList = [
    { id: 'INV-2026-0810', type: 'Receivable', party: 'Choudhary Logistics', date: '15-08-2026', dueDate: '15-09-2026', amount: 45000, status: 'Overdue' },
    { id: 'BILL-8822', type: 'Payable', party: 'Acme Distributors Ltd.', date: '20-08-2026', dueDate: '20-09-2026', amount: 155000, status: 'Pending' },
    { id: 'INV-2026-0901', type: 'Receivable', party: 'Amit Sharma (Retail)', date: '01-09-2026', dueDate: '01-10-2026', amount: 18500, status: 'Pending' },
    { id: 'BILL-8845', type: 'Payable', party: 'Electroparts India', date: '05-09-2026', dueDate: '05-10-2026', amount: 22000, status: 'Pending' },
    { id: 'INV-2026-0905', type: 'Receivable', party: 'Superstone Enterprises', date: '05-09-2026', dueDate: '05-10-2026', amount: 55000, status: 'Pending' }
  ];

  const totalReceivables = outstandingList.filter(o => o.type === 'Receivable').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayables = outstandingList.filter(o => o.type === 'Payable').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-purple-600" size={24} /> Recent Outstanding Details
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Detailed view of recent pending receivables from customers and payables to suppliers.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-blue-800 text-sm">Total Receivables (To Receive)</span>
          <span className="text-lg font-extrabold text-blue-700">₹ {totalReceivables.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-rose-800 text-sm">Total Payables (To Pay)</span>
          <span className="text-lg font-extrabold text-rose-700">₹ {totalPayables.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-gray-600">Ref No</th>
              <th className="p-3 font-semibold text-gray-600">Type</th>
              <th className="p-3 font-semibold text-gray-600">Party Name</th>
              <th className="p-3 font-semibold text-gray-600">Bill Date</th>
              <th className="p-3 font-semibold text-gray-600">Due Date</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Status</th>
              <th className="p-3 font-semibold text-gray-600 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {outstandingList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-gray-600">{item.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'Receivable' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-3 font-medium text-gray-800">{item.party}</td>
                <td className="p-3 text-xs text-gray-600">{item.date}</td>
                <td className="p-3 text-xs text-gray-600">{item.dueDate}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-gray-700">₹ {item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOutstandingDetails;
