import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Filter,
  Download,
  Printer,
  Percent,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  Building
} from 'lucide-react';
import api from '../../../api';

const GstPurchase = () => {
  const [period, setPeriod] = useState('This Month');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGstPurchases = () => {
    setLoading(true);
    api.get('/reports/gst/purchase')
      .then((res) => {
        if (res.data && res.data.success) {
          setApiData(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching GST purchase data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGstPurchases();
  }, []);

  const summaries = apiData?.summaries || {
    purchaseGst: { taxable: '₹0', cgst: '₹0', sgst: '₹0', igst: '₹0', totalItc: '₹0' },
    supplierGst: [],
    purchaseReturn: []
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Supplier Name,GSTIN,Taxable Value,CGST,SGST,IGST,ITC Eligibility'];
    const rows = (summaries.supplierGst || []).map(
      (s) =>
        `"${s.supplier || ''}","${s.gstNo || ''}",${s.taxableVal || 0},${s.cgst || 0},${s.sgst || 0},${s.igst || 0},"${s.itcEligible || 'Yes'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GST_Purchases_ITC_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredSuppliers = (summaries.supplierGst || []).filter(
    (s) =>
      searchTerm === '' ||
      s.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.gstNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-100">
            Inward Supplies & Input Tax Credit (ITC)
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <ShoppingBag className="text-emerald-600" size={26} /> GST Purchase & ITC Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile inward invoices from suppliers, claim Input Tax Credit (GSTR-2B eligible), and track purchase return debit adjustments.
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
              <option value="Last Quarter">Quarterly Return</option>
              <option value="Financial Year">Financial Year 2026-27</option>
            </select>
          </div>

          <button
            onClick={fetchGstPurchases}
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Taxable Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inward Taxable</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{summaries.purchaseGst?.taxable || '₹0'}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Total assessable purchases</span>
          </div>
        </div>

        {/* Claimable ITC */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Claimable ITC</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-teal-600">{summaries.purchaseGst?.totalItc || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Eligible Input Tax Credit</span>
          </div>
        </div>

        {/* Input CGST */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Input CGST</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-blue-600">{summaries.purchaseGst?.cgst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Central input pool</span>
          </div>
        </div>

        {/* Input SGST */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Input SGST</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-indigo-600">{summaries.purchaseGst?.sgst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">State input pool</span>
          </div>
        </div>

        {/* Input IGST */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Input IGST</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-purple-600">{summaries.purchaseGst?.igst || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Inter-state inward tax</span>
          </div>
        </div>
      </div>

      {/* ── SUPPLIER WISE ITC LEDGER ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Supplier Wise Tax Deductions & GSTR-2B Matches</h2>
            <p className="text-xs text-slate-500">Live vendor inward invoices registered in purchase database.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Aggregating live GST purchase records from MongoDB...</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                  <tr>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">GSTIN / PAN</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">CGST</th>
                    <th className="py-3 px-4 text-right">SGST</th>
                    <th className="py-3 px-4 text-right">IGST</th>
                    <th className="py-3 px-4 text-center">ITC Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">{s.supplier}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{s.gstNo}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-800">₹{Number(s.taxableVal || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">₹{Number(s.cgst || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">₹{Number(s.sgst || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">₹{Number(s.igst || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Eligible ITC
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No supplier inward tax records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── PURCHASE RETURN DEBIT ADJUSTMENTS ── */}
      {summaries.purchaseReturn && summaries.purchaseReturn.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Purchase Returns & Debit Note ITC Reversals
          </h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Debit Note No</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3 text-right">Return Value</th>
                  <th className="py-2.5 px-3 text-right">CGST Reversal</th>
                  <th className="py-2.5 px-3 text-right">SGST Reversal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summaries.purchaseReturn.map((pr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-rose-600">{pr.noteNo}</td>
                    <td className="py-2 px-3 text-slate-600">{pr.vendor}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">{pr.returnVal}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">{pr.cgstAdj}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">{pr.sgstAdj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstPurchase;
