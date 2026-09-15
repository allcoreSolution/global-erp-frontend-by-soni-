import React, { useState } from 'react';
import { Layers, Filter, Download, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

const Reconciliation = () => {
  const [period, setPeriod] = useState('This Month');
  const [reconciledItems, setReconciledItems] = useState([
    { entryNo: 'REC-001', client: 'Aditya Enterprises', bookTds: 10000, as26Tds: 10000, difference: 0, status: 'Reconciled' },
    { entryNo: 'REC-002', client: 'Choudhary Logistics', bookTds: 5000, as26Tds: 0, difference: 5000, status: 'Discrepancy' },
    { entryNo: 'REC-003', client: 'Vardhaman Steels', bookTds: 500, as26Tds: 500, difference: 0, status: 'Reconciled' }
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Entry No', 'Client / Customer Name', 'Book TDS Value (₹)', 'Form 26AS Value (₹)', 'Difference (₹)', 'Reconciliation Status'];
    const rows = reconciledItems.map(r => [r.entryNo, r.client, r.bookTds, r.as26Tds, r.difference, r.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TDS_26AS_Reconciliation_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-indigo-600" size={22} /> TDS & Form 26AS Reconciliation
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Compare book TDS values with Form 26AS / AIS records to identify and reconcile tax mismatches.
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

      {/* Reconciliation Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Audit Reconciliation Balance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Entry No</th>
                <th className="p-3 font-semibold text-gray-600">Client / Customer Name</th>
                <th className="p-3 font-semibold text-gray-600">Ledger Book TDS</th>
                <th className="p-3 font-semibold text-gray-600">Form 26AS TDS</th>
                <th className="p-3 font-semibold text-gray-600">Difference</th>
                <th className="p-3 font-semibold text-gray-600">Reconcile Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reconciledItems.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{r.entryNo}</td>
                  <td className="p-3 text-gray-800 font-medium">{r.client}</td>
                  <td className="p-3 text-gray-700">₹{r.bookTds.toLocaleString()}</td>
                  <td className="p-3 text-gray-700">₹{r.as26Tds.toLocaleString()}</td>
                  <td className={`p-3 font-bold ${r.difference > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{r.difference.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Reconciled' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancy Note */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-bold text-rose-900">Form 26AS Credit Discrepancies</h4>
          <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
            There is a discrepancy of ₹5,000 for Choudhary Logistics. Please request the customer to verify GSTR/TDS filing details on their portal to reconcile this mismatch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reconciliation;
