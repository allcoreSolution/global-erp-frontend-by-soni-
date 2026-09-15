import React, { useState } from 'react';
import { Calculator, Filter, Download, Printer, Percent, CheckCircle } from 'lucide-react';

const TaxAnalysis = () => {
  const [period, setPeriod] = useState('This Month');
  const tdsSlabs = [
    { sec: 'Sec 194C (Contractors)', rate: '1% / 2%', threshold: '₹30,000 / ₹1,00,000', totalDeductions: 8000, deposited: 8000, pending: 0 },
    { sec: 'Sec 194J (Professionals)', rate: '10%', threshold: '₹30,000', totalDeductions: 25000, deposited: 15000, pending: 10000 },
    { sec: 'Sec 194I (Rent)', rate: '10%', threshold: '₹2,40,000', totalDeductions: 45000, deposited: 45000, pending: 0 },
    { sec: 'Sec 194Q (Goods Purchase)', rate: '0.1%', threshold: '₹50,000', totalDeductions: 12000, deposited: 12000, pending: 0 }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['TDS Section', 'Standard Rate', 'Threshold Limit', 'Total Deductions (₹)', 'Deposited (₹)', 'Pending Deposit (₹)'];
    const rows = tdsSlabs.map(s => [s.sec, s.rate, s.threshold, s.totalDeductions, s.deposited, s.pending]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TDS_Tax_Analysis_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = tdsSlabs.reduce((acc, curr) => {
    acc.deductions += curr.totalDeductions;
    acc.deposited += curr.deposited;
    acc.pending += curr.pending;
    return acc;
  }, { deductions: 0, deposited: 0, pending: 0 });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-indigo-600" size={22} /> TDS Tax Analysis & Slabs Analysis
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Analyze TDS deductions, standard tax rates, threshold guidelines, and pending deposits status across tax sections.
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
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total TDS Liabilities</span>
          <span className="text-xl font-extrabold text-slate-800">₹{totals.deductions.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Deposited (Form 16/27Q)</span>
          <span className="text-xl font-extrabold text-emerald-600">₹{totals.deposited.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Pending Challan Deposit</span>
          <span className="text-xl font-extrabold text-rose-600">₹{totals.pending.toLocaleString()} Due</span>
        </div>
      </div>

      {/* Slabs Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">TDS Section Rate Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Income Tax Section</th>
                <th className="p-3 font-semibold text-gray-600">TDS rate</th>
                <th className="p-3 font-semibold text-gray-600">Threshold Value</th>
                <th className="p-3 font-semibold text-gray-600">Total Deductions</th>
                <th className="p-3 font-semibold text-gray-600">Deposited</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Pending Challan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tdsSlabs.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{s.sec}</td>
                  <td className="p-3 text-gray-600">{s.rate}</td>
                  <td className="p-3 text-gray-500">{s.threshold}</td>
                  <td className="p-3 text-gray-700 font-semibold">₹{s.totalDeductions.toLocaleString()}</td>
                  <td className="p-3 text-emerald-600 font-semibold">₹{s.deposited.toLocaleString()}</td>
                  <td className="p-3 font-bold text-rose-600 text-right">₹{s.pending.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t border-gray-300">
                <td className="p-3 text-gray-800" colSpan={3}>Grand Total</td>
                <td className="p-3 text-gray-800">₹{totals.deductions.toLocaleString()}</td>
                <td className="p-3 text-emerald-600">₹{totals.deposited.toLocaleString()}</td>
                <td className="p-3 text-rose-600 text-right">₹{totals.pending.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxAnalysis;
