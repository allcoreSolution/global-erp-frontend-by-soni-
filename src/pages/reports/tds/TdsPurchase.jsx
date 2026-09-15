import React, { useState } from 'react';
import { ShoppingBag, Filter, Download, Printer, CheckCircle } from 'lucide-react';

const TdsPurchase = () => {
  const [period, setPeriod] = useState('This Month');
  const [purchaseRecords, setPurchaseRecords] = useState([
    { supplier: 'Ambani Raw Materials', sec: '194Q (Goods Purchase)', totalVal: 600000, tdsRate: '0.1%', tdsDeducted: 600, depositStatus: 'Deposited', challanNo: 'CHL-99881' },
    { supplier: 'Vikas Tech Solutions', sec: '194J (Professional fees)', totalVal: 150000, tdsRate: '10%', tdsDeducted: 15000, depositStatus: 'Deposited', challanNo: 'CHL-44512' },
    { supplier: 'Modern Contractor & Log', sec: '194C (Contracts)', totalVal: 200000, tdsRate: '2%', tdsDeducted: 4000, depositStatus: 'Pending', challanNo: '--' }
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Supplier Name', 'TDS Section', 'Invoice Total (₹)', 'TDS Rate', 'TDS Deducted (₹)', 'Deposit Status', 'Challan Reference'];
    const rows = purchaseRecords.map(r => [r.supplier, r.sec, r.totalVal, r.tdsRate, r.tdsDeducted, r.depositStatus, r.challanNo]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TDS_Purchase_Payables_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = purchaseRecords.reduce((acc, curr) => {
    acc.total += curr.totalVal;
    acc.tds += curr.tdsDeducted;
    return acc;
  }, { total: 0, tds: 0 });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={22} /> TDS on Purchases (Payables)
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Track TDS deducted on supplier payments, verify deposit statuses and challan references.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center no-print">
        <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
          <Filter size={14} className="text-blue-500" />
          <span>Period:</span>
        </div>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
        >
          <option value="This Month">This Month</option>
          <option value="Last Quarter">Last Quarter</option>
          <option value="Financial Year">Financial Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Invoiced Inward Purchases</span>
          <span className="text-xl font-extrabold text-slate-800">₹{totals.total.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total TDS Deducted (Liability)</span>
          <span className="text-xl font-extrabold text-rose-600">₹{totals.tds.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">TDS Deposited Status</span>
          <span className="text-xl font-extrabold text-emerald-600">₹{(totals.tds - 4000).toLocaleString()} Paid</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">TDS Payables / Deductions Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Supplier Name</th>
                <th className="p-3 font-semibold text-gray-600">TDS Section</th>
                <th className="p-3 font-semibold text-gray-600">Invoice Amount</th>
                <th className="p-3 font-semibold text-gray-600">TDS Rate</th>
                <th className="p-3 font-semibold text-gray-600">TDS Liability</th>
                <th className="p-3 font-semibold text-gray-600">Challan No</th>
                <th className="p-3 font-semibold text-gray-600">Deposit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{r.supplier}</td>
                  <td className="p-3 text-gray-600">{r.sec}</td>
                  <td className="p-3 text-gray-700">₹{r.totalVal.toLocaleString()}</td>
                  <td className="p-3 text-gray-600">{r.tdsRate}</td>
                  <td className="p-3 font-bold text-rose-600">₹{r.tdsDeducted.toLocaleString()}</td>
                  <td className="p-3 text-gray-500 font-semibold">{r.challanNo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.depositStatus === 'Deposited' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.depositStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TdsPurchase;
