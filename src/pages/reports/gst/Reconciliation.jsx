import React, { useState, useEffect } from 'react';
import { Layers, Filter, Download, Printer, CheckCircle, AlertTriangle, ArrowRight, Sparkles, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api';

const Reconciliation = () => {
  const [period, setPeriod] = useState('This Month');
  const [reconciliationData, setReconciliationData] = useState({
    netPosition: { outputTax: '₹0', inputTax: '₹0', netPayable: '₹0' },
    mismatches: [],
    invoices: []
  });
  const [loading, setLoading] = useState(true);

  // 1-Click GST Set-Off Wizard State
  const [isSetOffModalOpen, setIsSetOffModalOpen] = useState(false);
  const [setOffForm, setSetOffForm] = useState({
    cgstAmount: 11745,
    sgstAmount: 11745,
    igstAmount: 0,
    monthYear: 'April 2026'
  });

  const handlePostGstSetOff = async (e) => {
    e.preventDefault();
    const cgst = Number(setOffForm.cgstAmount) || 0;
    const sgst = Number(setOffForm.sgstAmount) || 0;
    const igst = Number(setOffForm.igstAmount) || 0;
    const totalSetOff = cgst + sgst + igst;

    try {
      const payload = {
        journalNo: `JV-GSTSETOFF-${Date.now().toString().slice(-6)}`,
        journalDate: new Date().toISOString().split('T')[0],
        financialYear: '2026-27',
        referenceNo: `GST-SETOFF-${setOffForm.monthYear}`,
        narration: `Month-end GST Input vs Output tax set-off under Section 49 (${setOffForm.monthYear})`,
        status: 'Approved',
        entries: [
          { account: 'Output CGST A/c', debit: cgst, credit: 0, description: 'Set-off Output CGST Liability' },
          { account: 'Input CGST A/c', debit: 0, credit: cgst, description: 'Utilize Input CGST Credit' },
          { account: 'Output SGST A/c', debit: sgst, credit: 0, description: 'Set-off Output SGST Liability' },
          { account: 'Input SGST A/c', debit: 0, credit: sgst, description: 'Utilize Input SGST Credit' }
        ],
        totals: { debit: totalSetOff, credit: totalSetOff }
      };

      await api.post('/journals', payload);
      Swal.fire({
        icon: 'success',
        title: 'GST Set-Off Journal Posted! ✓',
        text: `Voucher posted: CGST ₹${cgst.toLocaleString()} & SGST ₹${sgst.toLocaleString()} set-off successfully.`,
        confirmButtonColor: '#4f46e5'
      });
      setIsSetOffModalOpen(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Set-Off Failed', text: err.message });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/gst/reconciliation');
        if (response.data && response.data.success) {
          setReconciliationData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            onClick={() => setIsSetOffModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition"
          >
            <Sparkles size={14} /> 1-Click GST Set-Off Wizard
          </button>
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
        <div className="p-4 border rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Net GST Cash Payable</span>
            <span className="text-xl font-extrabold text-indigo-600">{reconciliationData.netPosition.netPayable}</span>
          </div>
          <button
            onClick={() => setIsSetOffModalOpen(true)}
            className="mt-3 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs flex items-center justify-between transition"
          >
            <span>⚡ Set-Off & Post Journal</span>
            <ArrowRight size={13} />
          </button>
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
                  <td className="p-3 text-gray-700 font-medium">
                    {typeof (m.supplier || m.client) === 'object' && (m.supplier || m.client) ? ((m.supplier || m.client).companyName || (m.supplier || m.client).name || 'N/A') : (m.supplier || m.client || 'N/A')}
                  </td>
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
      {/* 1-Click GST Set-Off Modal */}
      {isSetOffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" /> 1-Click GST Set-Off Wizard
                </h3>
                <p className="text-xs text-indigo-100 mt-1">Rule 88A / Section 49 Month-End Input vs Output Adjustment</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSetOffModalOpen(false)} 
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostGstSetOff} className="p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900">
                <strong>Standard Rule:</strong> Output liability is set-off against available eligible Input Tax Credit (ITC). Excess ITC carries forward, or remaining liability is paid via cash ledger.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Set-Off Period / Month</label>
                <input 
                  type="text" 
                  value={setOffForm.monthYear} 
                  onChange={(e) => setSetOffForm({ ...setOffForm, monthYear: e.target.value })}
                  placeholder="e.g. April 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CGST Set-Off (₹)</label>
                  <input 
                    type="number" 
                    value={setOffForm.cgstAmount} 
                    onChange={(e) => setSetOffForm({ ...setOffForm, cgstAmount: Number(e.target.value) })}
                    placeholder="11745"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                  <span className="text-[10px] text-gray-500">Output CGST Dr / Input CGST Cr</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">SGST Set-Off (₹)</label>
                  <input 
                    type="number" 
                    value={setOffForm.sgstAmount} 
                    onChange={(e) => setSetOffForm({ ...setOffForm, sgstAmount: Number(e.target.value) })}
                    placeholder="11745"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                  <span className="text-[10px] text-gray-500">Output SGST Dr / Input SGST Cr</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center font-bold">
                <span className="text-slate-600">Total Set-Off Value:</span>
                <span className="text-emerald-700 text-sm">
                  ₹{((Number(setOffForm.cgstAmount) || 0) + (Number(setOffForm.sgstAmount) || 0) + (Number(setOffForm.igstAmount) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsSetOffModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Post JV Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;
