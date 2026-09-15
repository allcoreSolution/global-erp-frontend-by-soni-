import React, { useState } from 'react';
import { Calculator, Filter, Download, Printer, Percent, ShieldCheck } from 'lucide-react';

const TaxAnalysis = () => {
  const [period, setPeriod] = useState('This Month');

  // Datasets matching the requested summaries
  const summaries = {
    taxTotals: { cgst: '₹2,18,700', sgst: '₹2,18,700', igst: '₹1,08,000', totalTax: '₹5,45,400', taxableVal: '₹24,30,000' },
    exemptSales: { exemptVal: '₹1,20,000', nilRated: '₹45,000', nonGst: '₹80,000' },
    rateBreakdown: [
      { rate: '5% Slab', taxable: '₹4,50,000', cgst: '₹11,250', sgst: '₹11,250', igst: '₹0' },
      { rate: '12% Slab', taxable: '₹5,80,000', cgst: '₹34,800', sgst: '₹34,800', igst: '₹0' },
      { rate: '18% Slab', taxable: '₹10,50,000', cgst: '₹94,500', sgst: '₹94,500', igst: '₹1,08,000' },
      { rate: '28% Slab', taxable: '₹3,50,000', cgst: '₹49,000', sgst: '₹49,000', igst: '₹0' }
    ],
    hsnSummary: [
      { hsn: '7210 (Steel Sheets)', desc: 'Iron/Steel Coil Products', uqc: 'MTS', qty: 450, taxable: '₹5,60,000', rate: '18%', totalTax: '₹1,00,800' },
      { hsn: '8481 (Valves)', desc: 'Taps, cocks & valves', uqc: 'PCS', qty: 124, taxable: '₹4,10,000', rate: '28%', totalTax: '₹1,14,800' },
      { hsn: '8544 (Cables)', desc: 'Insulated winding wire', uqc: 'KGS', qty: 980, taxable: '₹3,20,000', rate: '18%', totalTax: '₹57,600' }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Category Description', 'Taxable base Value (₹)', 'Tax Rate Component'];
    const rows = [
      ['CGST Total', summaries.taxTotals.taxableVal, summaries.taxTotals.cgst],
      ['SGST Total', summaries.taxTotals.taxableVal, summaries.taxTotals.sgst],
      ['IGST Total', summaries.taxTotals.taxableVal, summaries.taxTotals.igst],
      ['Exempt Outward Sales', summaries.exemptSales.exemptVal, 'Exempt'],
      ['Nil Rated Outward Sales', summaries.exemptSales.nilRated, 'Nil Rated']
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GST_Tax_Analysis_Report.csv`);
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
            <Calculator className="text-indigo-600" size={22} /> GST Tax Slabs & HSN-wise Analysis
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Advanced summaries matching total CGST, SGST, IGST collections, HSN classification metrics, and exempt sales.
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
          <span>Period Scope:</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. CGST, SGST, IGST & TAXABLE AMOUNT SUMMARY */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">GST Component Ledger</span>
            <span className="text-[10px] text-gray-400">Tax Component Wise</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Gross Taxable Amount</span>
              <span className="text-slate-800">{summaries.taxTotals.taxableVal}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Consolidated CGST</span>
              <span className="font-semibold text-rose-600">{summaries.taxTotals.cgst}</span>
            </div>
            <div className="flex justify-between">
              <span>Consolidated SGST</span>
              <span className="font-semibold text-rose-600">{summaries.taxTotals.sgst}</span>
            </div>
            <div className="flex justify-between">
              <span>Consolidated IGST</span>
              <span className="font-semibold text-rose-600">{summaries.taxTotals.igst}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-indigo-600">
              <span>Total Tax Collected</span>
              <span>{summaries.taxTotals.totalTax}</span>
            </div>
          </div>
        </div>

        {/* 2. EXEMPT & NIL RATED SALES */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exempt / Nil Rated Sales</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Zero Tax Liability</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Exempt Outward Supplies</span>
              <span>{summaries.exemptSales.exemptVal}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Nil Rated Supplies</span>
              <span>{summaries.exemptSales.nilRated}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Non-GST Supplies</span>
              <span>{summaries.exemptSales.nonGst}</span>
            </div>
          </div>
        </div>

        {/* 3. TAX RATE-WISE SUMMARY */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tax Rate-wise Summary</span>
            <span className="text-[10px] text-gray-400">By Tax Slabs</span>
          </div>
          <div className="space-y-3">
            {summaries.rateBreakdown.map((r, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-800">{r.rate}</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 block">Base: {r.taxable}</span>
                  <span className="text-[9px] text-gray-400 block">
                    Tax: {r.igst !== '₹0' ? `IGST ${r.igst}` : `CGST/SGST ${r.cgst}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. HSN-WISE SUMMARY */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center border-b pb-3 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">HSN-wise Output Tax Summary</h3>
            <span className="text-[10px] text-gray-400">Goods and Services Classifications</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-400 font-semibold">
                  <th className="py-2">HSN Code</th>
                  <th>Description</th>
                  <th>UQC</th>
                  <th>Total Quantity</th>
                  <th>Taxable Value</th>
                  <th>GST Rate</th>
                  <th className="text-right">Total Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaries.hsnSummary.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-gray-800">{h.hsn}</td>
                    <td>{h.desc}</td>
                    <td>{h.uqc}</td>
                    <td>{h.qty}</td>
                    <td className="font-medium text-gray-700">{h.taxable}</td>
                    <td>{h.rate}</td>
                    <td className="text-right font-bold text-indigo-600">{h.totalTax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaxAnalysis;
