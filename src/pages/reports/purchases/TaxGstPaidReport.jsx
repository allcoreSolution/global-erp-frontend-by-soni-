import React, { useState, useEffect } from 'react';
import { Calculator, Search, Filter, Download, FileText, FileSpreadsheet, Building2 } from 'lucide-react';
import api from '../../../api';

const TaxGstPaidReport = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [taxEntries, setTaxEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/purchases/financial/tax-gst-paid');
        if (response.data.success) {
          setTaxEntries(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-purple-600" size={24} /> Tax / GST Paid (ITC) Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">Detailed Input Tax Credit (ITC) mappings on vendor purchases.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
            <Filter size={14} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition shadow-sm">
            <Download size={14} /> Export GSTR-2A
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Taxable Value</p>
          <h3 className="text-xl font-bold text-slate-800 mt-2">$315,000.00</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total CGST</p>
          <h3 className="text-xl font-bold text-blue-600 mt-2">$13,500.00</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total SGST</p>
          <h3 className="text-xl font-bold text-blue-600 mt-2">$13,500.00</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total IGST</p>
          <h3 className="text-xl font-bold text-indigo-600 mt-2">$23,850.00</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">ITC Register</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search GSTIN or Vendor..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">GSTIN</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Taxable Amt</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">CGST</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">SGST</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">IGST</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Tax (ITC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxEntries.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-slate-500 text-xs">{t.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" /> {t.vendor}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{t.gstin}</td>
                  <td className="px-6 py-4 font-medium text-slate-600 text-right">${t.taxableAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-blue-600 text-right">${t.cgst.toLocaleString()}</td>
                  <td className="px-6 py-4 text-blue-600 text-right">${t.sgst.toLocaleString()}</td>
                  <td className="px-6 py-4 text-indigo-600 text-right">${t.igst.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-purple-600 text-right">${t.totalTax.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxGstPaidReport;
