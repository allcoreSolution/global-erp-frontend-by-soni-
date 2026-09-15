import React, { useState } from 'react';
import { Layers, Filter, Download, Printer, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const Reconciliation = () => {
  const [period, setPeriod] = useState('This Month');

  // Reconciliation summaries data
  const reconciliationData = {
    netPosition: { outputTax: '₹3,33,000', inputTax: '₹2,12,400', netPayable: '₹1,20,600' },
    mismatches: [
      { invNo: 'INV-2024-089', type: 'Purchase Match', supplier: 'Choudhary Logistics', bookTax: '₹9,000', portal2B: '₹0', diff: '₹9,000', reason: 'Supplier GSTR-1 not filed' },
      { invNo: 'INV-2024-114', type: 'Sales Match', client: 'Balaji & Sons', bookTax: '₹18,000', portal2B: '₹18,000', diff: '₹0', reason: 'Fully Matched' }
    ],
    invoices: [
      { invNo: 'INV-2024-001', date: '2024-05-10', partner: 'Aditya Enterprises', taxableVal: '₹1,00,000', cgst: '₹9,000', sgst: '₹9,000', igst: '₹0', status: 'Matched' },
      { invNo: 'INV-2024-002', date: '2024-05-12', partner: 'Vardhaman Steels', taxableVal: '₹2,00,000', cgst: '₹0', sgst: '₹0', igst: '₹36,000', status: 'Matched' },
      { invNo: 'INV-2024-003', date: '2024-05-15', partner: 'Choudhary Logistics', taxableVal: '₹50,000', cgst: '₹4,500', sgst: '₹4,500', igst: '₹0', status: 'Pending' }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Type', 'Partner Name', 'Book Tax (₹)', 'Portal Tax (₹)', 'Tax Difference (₹)', 'Status'];
    const rows = reconciliationData.mismatches.map(m => [m.invNo, m.type, m.supplier || m.client, m.bookTax, m.portal2B, m.diff, m.reason]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GST_Reconciliation_Report.csv`);
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
            <Layers className="text-indigo-600" size={22} /> GST Reconciliation & Mismatch Ledger
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Compare outward output liability against GSTR-2B input credits to calculate exact net cash payable and identify discrepancies.
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
      <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center no-print border-b pb-4">
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

      {/* Input vs Output Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Output GST (Liability)</span>
          <span className="text-xl font-extrabold text-rose-600">{reconciliationData.netPosition.outputTax}</span>
        </div>
        <div className="p-4 border rounded-xl bg-slate-50/40">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Input GST (ITC Reconciled)</span>
          <span className="text-xl font-extrabold text-emerald-600">{reconciliationData.netPosition.inputTax}</span>
        </div>
        <div className="p-4 border rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Net GST Cash Payable</span>
          <span className="text-xl font-extrabold text-indigo-600">{reconciliationData.netPosition.netPayable}</span>
        </div>
      </div>

      {/* Mismatches Details */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Taxes Discrepancies & Mismatch Logs</h3>
          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">Action Recommended</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Invoice No</th>
                <th className="p-3 font-semibold text-gray-600">Reconciliation Area</th>
                <th className="p-3 font-semibold text-gray-600">Associate Party</th>
                <th className="p-3 font-semibold text-gray-600">Book Value</th>
                <th className="p-3 font-semibold text-gray-600">GSTR-2B Portal Value</th>
                <th className="p-3 font-semibold text-gray-600 text-rose-600">Tax Difference</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Primary Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reconciliationData.mismatches.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{m.invNo}</td>
                  <td className="p-3 text-gray-500">{m.type}</td>
                  <td className="p-3 text-gray-700 font-medium">{m.supplier || m.client}</td>
                  <td className="p-3 text-gray-600">{m.bookTax}</td>
                  <td className="p-3 text-gray-600">{m.portal2B}</td>
                  <td className="p-3 text-rose-600 font-bold">₹{m.diff}</td>
                  <td className="p-3 text-right text-gray-500 font-medium">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice-wise details list */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Invoice-wise GST Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Invoice No</th>
                <th className="p-3 font-semibold text-gray-600">Date</th>
                <th className="p-3 font-semibold text-gray-600">Associate Partner</th>
                <th className="p-3 font-semibold text-gray-600">Taxable Value</th>
                <th className="p-3 font-semibold text-gray-600">CGST</th>
                <th className="p-3 font-semibold text-gray-600">SGST</th>
                <th className="p-3 font-semibold text-gray-600">IGST</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reconciliationData.invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{inv.invNo}</td>
                  <td className="p-3 text-gray-500">{inv.date}</td>
                  <td className="p-3 text-gray-800 font-medium">{inv.partner}</td>
                  <td className="p-3 text-gray-600">{inv.taxableVal}</td>
                  <td className="p-3 text-gray-600">{inv.cgst}</td>
                  <td className="p-3 text-gray-600">{inv.sgst}</td>
                  <td className="p-3 text-gray-600">{inv.igst}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
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

export default Reconciliation;
