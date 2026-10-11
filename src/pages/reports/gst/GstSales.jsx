import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Filter,
  Download,
  Printer,
  Calendar,
  Percent,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Search,
  Building,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import api from '../../../api';

const GstSales = () => {
  const [period, setPeriod] = useState('This Month');
  const [activeView, setActiveView] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGstSales = () => {
    setLoading(true);
    api.get('/reports/gst/sales')
      .then(res => {
        if (res.data && res.data.success) {
          setApiData(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching GST sales:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGstSales();
  }, []);

  const summaries = apiData?.summaries || {
    gstr1: { taxable: '₹0', cgst: '₹0', sgst: '₹0', igst: '₹0', totalGst: '₹0' },
    b2b: [],
    b2c: [],
    creditNotes: [],
    debitNotes: []
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic CSV Export
  const handleExportCSV = () => {
    const headers = ['Type,Partner/POS,GST No,Taxable Amount,CGST,SGST,IGST'];
    const rows = [];

    // B2B
    (summaries.b2b || []).forEach(b => {
      rows.push(`"B2B","${b.client || ''}","${b.gstNo || ''}","${b.taxable || ''}","${b.cgst || ''}","${b.sgst || ''}","${b.igst || ''}"`);
    });

    // B2C
    (summaries.b2c || []).forEach(b => {
      rows.push(`"B2C","${b.pos || ''}","Unregistered","${b.taxable || ''}","${b.cgst || ''}","${b.cgst || ''}","${b.igst || ''}"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filter B2B list by search
  const filteredB2B = useMemo(() => {
    return (summaries.b2b || []).filter(b => 
      searchTerm === '' ||
      b.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gstNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [summaries.b2b, searchTerm]);

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">
            Outward Supplies & GSTR-1 Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <FileText className="text-indigo-600" size={26} /> GST Sales & Outward Tax Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time outward tax liability, GSTR-1 returns breakdown, registered B2B tax invoices, and retail B2C POS sales.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto no-print">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar size={14} className="text-slate-400" />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none text-xs"
            >
              <option value="This Month">Current Return (Monthly)</option>
              <option value="Last Quarter">Quarterly GSTR-1</option>
              <option value="Financial Year">Annual FY 2026-27</option>
            </select>
          </div>

          <button
            onClick={fetchGstSales}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs"
          >
            <Download size={14} /> Export CSV
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Taxable Outward Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taxable Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{summaries.gstr1?.taxable || '₹0'}</div>
            <span className="text-[10px] text-indigo-600 font-semibold">Net assessable value</span>
          </div>
        </div>

        {/* Total Output GST Liability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Output GST</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-rose-600">{summaries.gstr1?.totalGst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Payable tax liability</span>
          </div>
        </div>

        {/* CGST Component */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Central Tax (CGST)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-blue-600">{summaries.gstr1?.cgst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">50% Central share</span>
          </div>
        </div>

        {/* SGST Component */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State Tax (SGST)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-purple-600">{summaries.gstr1?.sgst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">50% State share</span>
          </div>
        </div>

        {/* Integrated Tax (IGST) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inter-State (IGST)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-emerald-600">{summaries.gstr1?.igst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Cross-border supplies</span>
          </div>
        </div>
      </div>

      {/* ── VIEW TABS & FILTERS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1">
            {[
              { id: 'All', label: 'Overview & All Sections' },
              { id: 'GSTR-1 & Output GST', label: 'GSTR-1 Summary Breakdown' },
              { id: 'B2B & B2C Invoices', label: 'B2B & B2C Tax Register' },
              { id: 'Credit & Debit Notes', label: 'Credit & Debit Adjustments' }
            ].map(tab => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {(activeView === 'All' || activeView === 'B2B & B2C Invoices') && (
            <div className="relative w-48 sm:w-64 flex-shrink-0 pr-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search buyer or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Aggregating live GST sales records from MongoDB...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* SECTION 1: GSTR-1 SUMMARY CARDS */}
              {(activeView === 'All' || activeView === 'GSTR-1 & Output GST') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Detailed Liability Box */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Outward Supplies (GSTR-1)</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Taxable Outward Value</span>
                        <span className="font-black text-slate-800">{summaries.gstr1?.taxable}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-medium">Output CGST</span>
                        <span className="font-bold text-slate-700">{summaries.gstr1?.cgst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Output SGST</span>
                        <span className="font-bold text-slate-700">{summaries.gstr1?.sgst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Output IGST</span>
                        <span className="font-bold text-slate-700">{summaries.gstr1?.igst}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2.5 font-black text-indigo-600 text-sm">
                        <span>Total Tax Liability</span>
                        <span>{summaries.gstr1?.totalGst}</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered vs Unregistered Split */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Buyer Segmentation</span>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Live</span>
                    </div>
                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">B2B Registered Invoices</span>
                          <span className="text-[11px] font-black text-blue-600">{summaries.b2b?.length || 0} Bills</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Invoices issued to clients with verified GSTIN/PAN credentials.</p>
                      </div>

                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">B2C Retail Counter Sales</span>
                          <span className="text-[11px] font-black text-emerald-600">{summaries.b2c?.length || 0} States</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">POS & over-the-counter sales to end-consumer walk-ins.</p>
                      </div>
                    </div>
                  </div>

                  {/* Return Adjustments Snapshot */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Adjustment & Reversals</span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Debits / Credits</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Credit Notes Issued</span>
                        <span className="font-bold text-rose-600">{summaries.creditNotes?.length || 0} Notes</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-medium">Debit Notes (Price Hikes)</span>
                        <span className="font-bold text-emerald-600">{summaries.debitNotes?.length || 0} Notes</span>
                      </div>
                      <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-700 font-medium mt-3">
                        ✓ All output taxes are synchronized directly with active MongoDB Sales collections.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: B2B INVOICES REGISTER */}
              {(activeView === 'All' || activeView === 'B2B & B2C Invoices') && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Registered B2B Outward Invoices</h2>
                      <p className="text-xs text-slate-500">Live tax records for buyers eligible for Input Tax Credit claims.</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {filteredB2B.length} Invoices Found
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                        <tr>
                          <th className="py-3 px-4">Buyer / Client</th>
                          <th className="py-3 px-4">Buyer GSTIN / PAN</th>
                          <th className="py-3 px-4 text-right">Taxable Turnover</th>
                          <th className="py-3 px-4 text-right">CGST</th>
                          <th className="py-3 px-4 text-right">SGST</th>
                          <th className="py-3 px-4 text-right">IGST</th>
                          <th className="py-3 px-4 text-center">Filing Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredB2B.length > 0 ? (
                          filteredB2B.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4 font-bold text-slate-800">{b.client}</td>
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.gstNo}</td>
                              <td className="py-3 px-4 text-right font-black text-slate-800">{b.taxable}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-600">{b.cgst}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-600">{b.sgst}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-600">{b.igst}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  Included in GSTR-1
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400">
                              No B2B tax records found for the selected query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 3: B2C CONSUMER SALES */}
              {(activeView === 'All' || activeView === 'B2B & B2C Invoices') && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Consumer B2C Retail Turnover</h2>
                    <p className="text-xs text-slate-500">Unregistered counter and retail sales summarized by Place of Supply (POS).</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                        <tr>
                          <th className="py-3 px-4">Place of Supply (POS)</th>
                          <th className="py-3 px-4">Supply Category</th>
                          <th className="py-3 px-4 text-right">Taxable Value</th>
                          <th className="py-3 px-4 text-right">CGST / SGST</th>
                          <th className="py-3 px-4 text-right">IGST</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {summaries.b2c && summaries.b2c.length > 0 ? (
                          summaries.b2c.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-bold text-slate-800">{b.pos}</td>
                              <td className="py-3 px-4 text-slate-500">Counter Retail Walk-in</td>
                              <td className="py-3 px-4 text-right font-black text-slate-800">{b.taxable}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-600">{b.cgst}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-600">{b.igst}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No B2C transactions recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 4: CREDIT & DEBIT NOTES */}
              {(activeView === 'All' || activeView === 'Credit & Debit Notes') && (
                <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Credit / Debit Note Amendments (Returns & Adjustments)
                    </h3>
                    <span className="text-[10px] text-slate-400">Sales Return & Price Changes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Credit Notes */}
                    <div>
                      <span className="text-[11px] font-black text-rose-600 block mb-2 uppercase tracking-wide">
                        Credit Notes (Sales Returns)
                      </span>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                              <th className="py-2.5 px-3">Note No</th>
                              <th className="py-2.5 px-3">Client</th>
                              <th className="py-2.5 px-3 text-right">Taxable</th>
                              <th className="py-2.5 px-3 text-right">GST Adjusted</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {summaries.creditNotes && summaries.creditNotes.length > 0 ? (
                              summaries.creditNotes.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 font-bold text-rose-600">{c.noteNo}</td>
                                  <td className="py-2 px-3 text-slate-600">{c.client}</td>
                                  <td className="py-2 px-3 text-right font-medium text-slate-800">{c.taxable}</td>
                                  <td className="py-2 px-3 text-right text-rose-600 font-bold">{c.gstAdj || c.gstAdjust || '₹0'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-slate-400">
                                  No credit notes recorded.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Debit Notes */}
                    <div>
                      <span className="text-[11px] font-black text-emerald-600 block mb-2 uppercase tracking-wide">
                        Debit Notes (Price Amendments)
                      </span>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                              <th className="py-2.5 px-3">Note No</th>
                              <th className="py-2.5 px-3">Client</th>
                              <th className="py-2.5 px-3 text-right">Taxable</th>
                              <th className="py-2.5 px-3 text-right">GST Adjusted</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {summaries.debitNotes && summaries.debitNotes.length > 0 ? (
                              summaries.debitNotes.map((d, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 font-bold text-emerald-600">{d.noteNo}</td>
                                  <td className="py-2 px-3 text-slate-600">{d.client}</td>
                                  <td className="py-2 px-3 text-right font-medium text-slate-800">{d.taxable}</td>
                                  <td className="py-2 px-3 text-right text-emerald-600 font-bold">{d.gstAdjust || '₹0'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-slate-400">
                                  No debit notes recorded.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default GstSales;
