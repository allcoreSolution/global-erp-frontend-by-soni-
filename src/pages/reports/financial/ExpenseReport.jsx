import React from 'react';
import { TrendingDown, Download, Printer } from 'lucide-react';

const ExpenseReport = () => {
  const expenses = [
    { category: 'Direct Purchases', budgeted: 500000, actual: 450000 },
    { category: 'Employee Salaries', budgeted: 150000, actual: 120000 },
    { category: 'Office Rent & Utils', budgeted: 70000, actual: 60000 },
    { category: 'Marketing & Sales', budgeted: 20000, actual: 25000 },
    { category: 'Logistics & Travel', budgeted: 30000, actual: 15000 }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingDown className="text-rose-600" size={22} /> Expense Report
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Detailed breakdown of operational costs, salaries, and overheads vs Budget.</p>
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

      <div className="border rounded overflow-x-auto text-xs mt-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Expense Category</th>
              <th className="p-3 text-right">Budgeted (₹)</th>
              <th className="p-3 text-right">Actual Spent (₹)</th>
              <th className="p-3 text-right">Variance (Status)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((item, idx) => {
              const variance = item.budgeted - item.actual;
              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-gray-800">{item.category}</td>
                  <td className="p-3 text-right text-gray-600 font-mono">{item.budgeted.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-rose-700">{item.actual.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      variance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {variance >= 0 ? `Under by ₹${variance.toLocaleString()}` : `Over by ₹${Math.abs(variance).toLocaleString()}`}
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

export default ExpenseReport;
