import React from 'react';
import { GitBranch, Download, Printer } from 'lucide-react';

const BranchWiseStock = () => {
  const data = [
    { branch: 'North India (Delhi HQ)', totalItems: 850, totalQty: 45000, value: 12500000, status: 'Healthy' },
    { branch: 'West India (Mumbai)', totalItems: 620, totalQty: 25000, value: 8500000, status: 'Healthy' },
    { branch: 'South India (Bangalore)', totalItems: 450, totalQty: 18000, value: 6200000, status: 'Low Stock' },
    { branch: 'East India (Kolkata)', totalItems: 210, totalQty: 8500, value: 2100000, status: 'Critical' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <GitBranch className="text-teal-600" size={22} /> Branch-wise Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Track and compare regional branch stocks distributions and stock depletion indices.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Branch Location</th>
              <th className="p-3 text-right">Unique Items (SKUs)</th>
              <th className="p-3 text-right">Total Quantity (Units)</th>
              <th className="p-3 text-right">Total Stock Value (₹)</th>
              <th className="p-3">Inventory Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((branch, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-teal-800">{branch.branch}</td>
                <td className="p-3 text-right text-gray-600 font-semibold">{branch.totalItems}</td>
                <td className="p-3 text-right font-bold text-gray-700">{branch.totalQty.toLocaleString()}</td>
                <td className="p-3 text-right font-extrabold text-teal-700">₹ {branch.value.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    branch.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                    branch.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {branch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchWiseStock;
