import React, { useState } from 'react';
import { FileText, Filter, Download, Printer, ArrowUpRight, CheckCircle, Percent } from 'lucide-react';

const GstSales = () => {
  const [period, setPeriod] = useState('This Month');
  const [activeView, setActiveView] = useState('All');

  // GSTR-1 & Sales tax summary datasets
  const summaries = {
    gstr1: { taxable: '₹14,50,000', cgst: '₹1,30,500', sgst: '₹1,30,500', igst: '₹72,000', totalGst: '₹3,33,000' },
    b2b: [
      { client: 'Aditya Enterprises', gstNo: '27AAAAA1111A1Z1', taxable: '₹4,50,000', cgst: '₹40,500', sgst: '₹40,500', igst: '₹0' },
      { client: 'Vardhaman Steels', gstNo: '27BBBBB2222B2Z2', taxable: '₹5,00,000', cgst: '₹0', sgst: '₹0', igst: '₹90,000' }
    ],
    b2c: [
      { pos: 'Mumbai Counter', taxable: '₹2,50,000', cgst: '₹22,500', sgst: '₹22,500', igst: '₹0' },
      { pos: 'Delhi Counter', taxable: '₹2,50,000', cgst: '₹0', sgst: '₹0', igst: '₹45,000' }
    ],
    creditNotes: [
      { noteNo: 'CN-004', origInv: 'INV-2024-009', client: 'Aditya Enterprises', taxable: '₹-50,000', gstAdjust: '₹-9,000' }
    ],
    debitNotes: [
      { noteNo: 'DN-002', origInv: 'INV-2024-003', client: 'Choudhary Logistics', taxable: '₹30,000', gstAdjust: '₹5,400' }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Sales Category', 'Taxable Amount (₹)', 'Output CGST (₹)', 'Output SGST (₹)', 'Output IGST (₹)'];
    const rows = [
      ['GSTR-1 Consolidated', summaries.gstr1.taxable, summaries.gstr1.cgst, summaries.gstr1.sgst, summaries.gstr1.igst],
      ['B2B Sales Total', '₹9,50,000', '₹40,500', '₹40,500', '₹90,000'],
      ['B2C Sales Total', '₹5,00,000', '₹22,500', '₹22,500', '₹45,000']
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GST_Sales_Report.csv`);
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
            <FileText className="text-indigo-600" size={22} /> GST Sales Summary
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Outward tax reports: GSTR-1, B2B/B2C summaries, Credit/Debit Notes adjustment logs, and Output GST analysis.
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

      {/* Filters and Sub-navigation Tabs */}
      <div className="flex flex-col gap-4 no-print border-b pb-4">
        <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
            <Filter size={14} className="text-blue-500" />
            <span>Select Period:</span>
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

        <div className="flex flex-wrap gap-2">
          {['All', 'GSTR-1 & Output GST', 'B2B & B2C Invoices', 'Credit & Debit Notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeView === tab || (tab === 'All' && activeView === 'All')
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. GSTR-1 SUMMARY & OUTPUT GST */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">GSTR-1 Output GST Summary</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active Liability</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Taxable Outward Sales</span>
              <span className="font-bold text-slate-800">{summaries.gstr1.taxable}</span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2">
              <span className="text-gray-500">Output CGST</span>
              <span className="font-semibold text-slate-700">{summaries.gstr1.cgst}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Output SGST</span>
              <span className="font-semibold text-slate-700">{summaries.gstr1.sgst}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Output IGST</span>
              <span className="font-semibold text-slate-700">{summaries.gstr1.igst}</span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2 font-bold text-indigo-600">
              <span>Total Output GST Liability</span>
              <span>{summaries.gstr1.totalGst}</span>
            </div>
          </div>
        </div>

        {/* 2. B2B SALES SUMMARY */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered B2B Sales</span>
            <span className="text-[10px] text-gray-400">Regular Taxpayers</span>
          </div>
          <div className="space-y-3">
            {summaries.b2b.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-800 block">{b.client}</span>
                  <span className="text-[9px] text-gray-400">GST: {b.gstNo}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 block">Val: {b.taxable}</span>
                  <span className="text-[9px] text-gray-500 block">
                    Tax: {b.igst !== '₹0' ? `IGST ${b.igst}` : `CGST/SGST ${b.cgst}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. B2C SALES SUMMARY */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Consumer B2C Sales</span>
            <span className="text-[10px] text-gray-400">Unregistered Counter Sales</span>
          </div>
          <div className="space-y-3">
            {summaries.b2c.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-800 block">{b.pos}</span>
                  <span className="text-[9px] text-gray-400">POS Retail Cash Sales</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 block">Val: {b.taxable}</span>
                  <span className="text-[9px] text-gray-500 block">
                    Tax: {b.igst !== '₹0' ? `IGST ${b.igst}` : `CGST/SGST ${b.cgst}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CREDIT & DEBIT NOTES AMENDMENT */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center border-b pb-3 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Credit / Debit Note Adjustments</h3>
            <span className="text-[10px] text-gray-400">Sales Return & Amendments</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] font-bold text-rose-600 block mb-2">Credit Notes (Sales Returns)</span>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th>Note No</th>
                    <th>Client</th>
                    <th>Taxable Val</th>
                    <th className="text-right">GST Adjusted</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.creditNotes.map((c, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50/50">
                      <td className="py-2 font-semibold">{c.noteNo}</td>
                      <td>{c.client}</td>
                      <td>{c.taxable}</td>
                      <td className="text-right text-rose-600 font-bold">{c.gstAdjust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-600 block mb-2">Debit Notes (Price Amendments)</span>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th>Note No</th>
                    <th>Client</th>
                    <th>Taxable Val</th>
                    <th className="text-right">GST Adjusted</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.debitNotes.map((d, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50/50">
                      <td className="py-2 font-semibold">{d.noteNo}</td>
                      <td>{d.client}</td>
                      <td>{d.taxable}</td>
                      <td className="text-right text-emerald-600 font-bold">{d.gstAdjust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GstSales;
