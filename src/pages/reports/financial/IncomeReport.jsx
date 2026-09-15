import React from 'react';
import { DollarSign, Download, Printer } from 'lucide-react';

const IncomeReport = () => {
  const incomes = [
    { category: 'Product Sales (Domestic)', projected: 600000, actual: 650000 },
    { category: 'Product Sales (Export)', projected: 100000, actual: 80000 },
    { category: 'Service Maintenance Contracts', projected: 120000, actual: 150000 },
    { category: 'Consulting Revenue', projected: 0, actual: 25000 },
    { category: 'Interest from Bank', projected: 10000, actual: 12000 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-teal-600" size={22} /> Income & Revenue Report
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Audit registers of non-operating revenue sources, services receipts, and product sales.</p>
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
              <th className="p-3">Revenue Stream / Category</th>
              <th className="p-3 text-right">Projected Income (₹)</th>
              <th className="p-3 text-right">Actual Earned (₹)</th>
              <th className="p-3 text-right">Performance Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incomes.map((item, idx) => {
              const variance = item.actual - item.projected;
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.category}</td>
                  <td className="p-3 text-right text-gray-600 font-mono">{item.projected.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-teal-700">{item.actual.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      variance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {variance >= 0 ? `Surplus ₹${variance.toLocaleString()}` : `Deficit ₹${Math.abs(variance).toLocaleString()}`}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeReport;
