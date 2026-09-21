import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import api from '../../../api';

const BalanceSheet = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [totals, setTotals] = useState({ totalAssets: 0, totalLiabilitiesAndEquity: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/financial/balance-sheet');
      if (res.data && res.data.success) {
        setAssets(res.data.data.assets || []);
        // Combine liabilities and equity for the view
        const liab = res.data.data.liabilities || [];
        const eq = res.data.data.equity || [];
        setLiabilities([...eq, ...liab]);
        
        setTotals({
          totalAssets: res.data.data.totalAssets || 0,
          totalLiabilitiesAndEquity: res.data.data.totalLiabilitiesAndEquity || 0
        });
      }
    } catch (error) {
      console.error('Error fetching Balance Sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const { totalAssets, totalLiabilitiesAndEquity: totalLiabilities } = totals;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-purple-600" size={22} /> Balance Sheet
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Evaluate financial health matrices, liabilities, asset balances, and equity.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border border-purple-200 rounded-lg flex items-center gap-4 text-xs font-semibold text-gray-700 mb-4">
        <Filter size={16} className="text-purple-600" />
        <span className="text-gray-500">As on Date:</span>
        <input type="date" className="border p-1.5 rounded" defaultValue="2026-09-30" />
        <button className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700">Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-rose-600">Total Liabilities & Equity</span>
          <span className="text-2xl font-extrabold text-rose-800">₹ {totalLiabilities.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[11px] uppercase font-bold text-emerald-600">Total Assets</span>
          <span className="text-2xl font-extrabold text-emerald-800">₹ {totalAssets.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-4">
        {/* Liabilities */}
        <div className="border rounded overflow-hidden">
          <div className="bg-rose-50 border-b border-rose-100 p-2 font-bold text-rose-800">Liabilities & Capital</div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">Loading liabilities...</td></tr>
              ) : liabilities.length === 0 ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">No liabilities/equity found.</td></tr>
              ) : (
                liabilities.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-gray-700">{item.accountName || item.account}</td>
                    <td className="p-3 text-right font-medium text-gray-800">₹ {item.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td className="p-3 text-gray-800 uppercase text-[10px]">Total Liabilities</td>
                <td className="p-3 text-right text-gray-800">₹ {totalLiabilities.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Assets */}
        <div className="border rounded overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-100 p-2 font-bold text-emerald-800">Assets & Properties</div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">Loading assets...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="2" className="p-3 text-center text-gray-500 italic">No assets found.</td></tr>
              ) : (
                assets.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-gray-700">{item.accountName || item.account}</td>
                    <td className="p-3 text-right font-medium text-gray-800">₹ {item.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t font-extrabold">
              <tr>
                <td className="p-3 text-gray-800 uppercase text-[10px]">Total Assets</td>
                <td className="p-3 text-right text-gray-800">₹ {totalAssets.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
