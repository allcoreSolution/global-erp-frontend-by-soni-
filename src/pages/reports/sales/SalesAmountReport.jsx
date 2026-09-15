import React from 'react';
import { DollarSign, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp } from 'lucide-react';

const SalesAmountReport = () => {
  const data = [
    { invoice: 'INV-26-0901', date: '2026-09-01', customer: 'Acme Corp', amount: 45000, status: 'Paid', method: 'Bank Transfer' },
    { invoice: 'INV-26-0902', date: '2026-09-02', customer: 'TechSolutions Ltd', amount: 125000, status: 'Pending', method: '-' },
    { invoice: 'INV-26-0903', date: '2026-09-02', customer: 'Global Traders', amount: 34000, status: 'Paid', method: 'UPI' },
    { invoice: 'INV-26-0904', date: '2026-09-03', customer: 'ElectroWorld', amount: 210000, status: 'Partial', method: 'Cheque' },
    { invoice: 'INV-26-0905', date: '2026-09-04', customer: 'Modern Furniture', amount: 85000, status: 'Paid', method: 'Bank Transfer' },
  ];

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Partial': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <DollarSign className="text-indigo-600" size={24} />
            </div>
            Sales Revenue & Amounts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Audit statements display gross sale revenues, cash margins flow, and direct payments.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Invoice or Customer..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
        </select>
        
        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">Current Month</option>
          <option value="last-month">Last Month</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', val: '450', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Total Sales Amount', val: '₹ 1.2 Cr', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
          { label: 'Amount Received', val: '₹ 95.5 L', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Pending Receivables', val: '₹ 24.5 L', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-bold mt-1 flex items-center">
              {stat.val} {stat.icon && stat.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Invoice No <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4">Customer Name</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Payment Status</th>
                <th className="p-4 text-center">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4 font-mono text-indigo-700 font-medium">{item.invoice}</td>
                  <td className="p-4 font-semibold text-slate-700">{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4 font-semibold text-slate-800">
                    {item.customer}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(item.amount)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-600 font-medium">
                    {item.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>Showing 1 to 5 of 450 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-200 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-indigo-600 bg-indigo-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-700">2</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-700">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAmountReport;
