import React, { useState } from 'react';
import { FileText, Filter, Download, Printer, ShieldCheck } from 'lucide-react';

const TdsSales = () => {
  const [period, setPeriod] = useState('This Month');
  const [tdsRecords, setTdsRecords] = useState([
    { client: 'Aditya Enterprises', sec: '194J (Professional)', invVal: 100000, tdsRate: '10%', tdsDeducted: 10000, certStatus: 'Received', matched26as: 'Yes' },
    { client: 'Choudhary Logistics', sec: '194C (Contractor)', invVal: 250000, tdsRate: '2%', tdsDeducted: 5000, certStatus: 'Pending', matched26as: 'No' },
    { client: 'Vardhaman Steels', sec: '194Q (Goods Purchase)', invVal: 500000, tdsRate: '0.1%', tdsDeducted: 500, certStatus: 'Received', matched26as: 'Yes' }
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Client Name', 'Section Code', 'Invoice Value (₹)', 'TDS Rate', 'TDS Deducted (₹)', 'Certificate Status', 'Form 26AS Matched'];
    const rows = tdsRecords.map(r => [r.client, r.sec, r.invVal, r.tdsRate, r.tdsDeducted, r.certStatus, r.matched26as]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TDS_Sales_Receivables_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = tdsRecords.reduce((acc, curr) => {
    acc.inv += curr.invVal;
    acc.tds += curr.tdsDeducted;
    return acc;
  }, { inv: 0, tds: 0 });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" size={22} /> TDS on Sales (Receivables)
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Track TDS deducted by customers on outward invoices, reconcile with Form 26AS.
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
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Invoiced Outward Value</span>
          <span className="text-xl font-extrabold text-slate-800">₹{totals.inv.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total TDS Deducted (Asset)</span>
          <span className="text-xl font-extrabold text-indigo-600">₹{totals.tds.toLocaleString()}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">26AS Reconciled Ratio</span>
          <span className="text-xl font-extrabold text-emerald-600">92.4% Matched</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">TDS Receivables Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Client / Customer Name</th>
                <th className="p-3 font-semibold text-gray-600">TDS Section</th>
                <th className="p-3 font-semibold text-gray-600">Invoice Value</th>
                <th className="p-3 font-semibold text-gray-600">TDS Rate</th>
                <th className="p-3 font-semibold text-gray-600">TDS Deducted</th>
                <th className="p-3 font-semibold text-gray-600">Certificate</th>
                <th className="p-3 font-semibold text-gray-600">26AS Matched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tdsRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{r.client}</td>
                  <td className="p-3 text-gray-600">{r.sec}</td>
                  <td className="p-3 text-gray-700">₹{r.invVal.toLocaleString()}</td>
                  <td className="p-3 text-gray-600">{r.tdsRate}</td>
                  <td className="p-3 font-bold text-slate-800">₹{r.tdsDeducted.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.certStatus === 'Received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.certStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.matched26as === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.matched26as}
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

export default TdsSales;
