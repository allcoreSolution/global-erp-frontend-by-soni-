import React, { useState } from 'react';
import { ShoppingBag, Filter, Download, Printer, Percent, ShieldCheck, CheckCircle } from 'lucide-react';

const GstPurchase = () => {
  const [period, setPeriod] = useState('This Month');

  // Purchase GST & Input Tax Credit datasets
  const summaries = {
    purchaseGst: { taxable: '₹9,80,000', cgst: '₹88,200', sgst: '₹88,200', igst: '₹36,000', totalItc: '₹2,12,400' },
    supplierGst: [
      { supplier: 'Ambani Raw Materials', gstNo: '27AMBAN9999A1Z9', taxableVal: 400000, cgst: 36000, sgst: 36000, igst: 0, itcEligible: 'Yes' },
      { supplier: 'Vikas Tech Solutions', gstNo: '27VIKAS8888B2Z8', taxableVal: 200000, cgst: 0, sgst: 0, igst: 36000, itcEligible: 'Yes' },
      { supplier: 'Modern Stationary', gstNo: '27MODER5555C3Z7', taxableVal: 50000, cgst: 4500, sgst: 4500, igst: 0, itcEligible: 'Yes' }
    ],
    purchaseReturn: [
      { noteNo: 'PR-CN01', vendor: 'Ambani Raw Materials', returnVal: '₹-30,000', cgstAdj: '₹-2,700', sgstAdj: '₹-2,700' }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Supplier Name', 'GSTIN', 'Taxable Purchase (₹)', 'CGST Paid (₹)', 'SGST Paid (₹)', 'IGST Paid (₹)', 'ITC Status'];
    const rows = summaries.supplierGst.map(s => [s.supplier, s.gstNo, s.taxableVal, s.cgst, s.sgst, s.igst, s.itcEligible]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GST_Purchase_Report.csv`);
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
            <ShoppingBag className="text-indigo-600" size={22} /> GST Purchase & Input Tax Credit Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Inward supply records: Purchase GST summaries, Input GST (ITC) tracking, Supplier details matching, and Purchase return adjustments.
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

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. PURCHASE GST & INPUT GST */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase GST & ITC Summary</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Eligible Asset</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Taxable Inward Purchases</span>
              <span className="font-bold text-slate-800">{summaries.purchaseGst.taxable}</span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2">
              <span className="text-gray-500">Input CGST</span>
              <span className="font-semibold text-slate-700">{summaries.purchaseGst.cgst}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Input SGST</span>
              <span className="font-semibold text-slate-700">{summaries.purchaseGst.sgst}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Input IGST</span>
              <span className="font-semibold text-slate-700">{summaries.purchaseGst.igst}</span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2 font-bold text-emerald-600">
              <span>Claimable Input GST (ITC)</span>
              <span>{summaries.purchaseGst.totalItc}</span>
            </div>
          </div>
        </div>

        {/* 2. SUPPLIER GST DETAILS */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier Wise Tax Deductions</span>
            <span className="text-[10px] text-gray-400">ITC GSTR-2B Matches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-400 font-semibold">
                  <th className="py-2">Supplier Name</th>
                  <th>GSTIN</th>
                  <th>Taxable Val</th>
                  <th>CGST/SGST</th>
                  <th>IGST</th>
                  <th className="text-right">ITC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaries.supplierGst.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-semibold text-gray-800">{s.supplier}</td>
                    <td className="text-gray-500">{s.gstNo}</td>
                    <td className="font-medium text-gray-700">₹{s.taxableVal.toLocaleString()}</td>
                    <td>₹{s.cgst.toLocaleString()}</td>
                    <td>₹{s.igst.toLocaleString()}</td>
                    <td className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-[9px]">Matched</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PURCHASE RETURN GST */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 lg:col-span-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Return GST Amendments</span>
            <span className="text-[10px] text-gray-400">ITC Outward adjustments</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-gray-400 font-semibold">
                <th className="py-2">Debit Note Ref</th>
                <th>Supplier / Vendor</th>
                <th>Returned Taxable Value</th>
                <th>CGST Offset</th>
                <th className="text-right">SGST Offset</th>
              </tr>
            </thead>
            <tbody>
              {summaries.purchaseReturn.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 font-semibold text-gray-800">{r.noteNo}</td>
                  <td>{r.vendor}</td>
                  <td className="font-medium text-rose-600">{r.returnVal}</td>
                  <td className="text-rose-500">{r.cgstAdj}</td>
                  <td className="text-rose-500 text-right">{r.sgstAdj}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default GstPurchase;
