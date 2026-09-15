import React, { useState } from 'react';
import { FileText, Search, RefreshCw, Download, Printer, FileDown } from 'lucide-react';

const DayBook = () => {
  // Filters state
  const [filters, setFilters] = useState({
    fromDate: '2026-09-01',
    toDate: '2026-09-12',
    company: '',
    branch: '',
    voucherType: 'All',
    account: 'All',
    status: 'All'
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    // Implement search logic
  };

  const handleReset = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      company: '',
      branch: '',
      voucherType: 'All',
      account: 'All',
      status: 'All'
    });
  };

  // Mock Data
  const entries = [
    { id: 1, date: '12-09-2026', voucherNo: 'REC-001', type: 'Receipt', particulars: 'ABC Customer', debit: 50000, credit: null },
    { id: 2, date: '12-09-2026', voucherNo: 'PAY-004', type: 'Payment', particulars: 'XYZ Supplier', debit: null, credit: 15000 },
    { id: 3, date: '12-09-2026', voucherNo: 'CON-002', type: 'Contra', particulars: 'HDFC → Cash', debit: 5000, credit: 5000 },
    { id: 4, date: '12-09-2026', voucherNo: 'JV-008', type: 'Journal', particulars: 'Salary Exp.', debit: 30000, credit: null },
    { id: 5, date: '12-09-2026', voucherNo: 'JV-008', type: 'Journal', particulars: 'Salary Payable', debit: null, credit: 30000 },
  ];

  // Calculate Totals
  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-7xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <FileText size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-amber-900 uppercase tracking-wide">DAY BOOK</h2>
               <p className="text-sm text-slate-500 font-medium">Daily transaction log</p>
             </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <select name="company" value={filters.company} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select</option>
                <option>Main Corp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select name="branch" value={filters.branch} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select</option>
                <option>HQ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Voucher Type</label>
              <select name="voucherType" value={filters.voucherType} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option>All</option>
                <option>Receipt</option>
                <option>Payment</option>
                <option>Contra</option>
                <option>Journal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account</label>
              <select name="account" value={filters.account} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option>All</option>
                <option>Cash Account</option>
                <option>HDFC Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option>All</option>
                <option>Posted</option>
                <option>Draft</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleSearch} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold transition-colors">
                <Search size={16} /> Search
              </button>
              <button onClick={handleReset} className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded text-sm font-semibold transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase w-28">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase w-32">Voucher No</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase w-32">Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase">Particulars</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-right w-36">Debit (₹)</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-right w-36">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{entry.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-amber-700">{entry.voucherNo}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        entry.type === 'Receipt' ? 'bg-green-100 text-green-700' :
                        entry.type === 'Payment' ? 'bg-red-100 text-red-700' :
                        entry.type === 'Contra' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">{entry.particulars}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                      {entry.debit ? entry.debit.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                      {entry.credit ? entry.credit.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 italic bg-slate-50">
                      No transactions found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="flex gap-3 w-full md:w-auto">
             <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm">
               <FileDown size={16} className="text-green-600" /> Export Excel
             </button>
             <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm">
               <Download size={16} className="text-red-600" /> Export PDF
             </button>
             <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm">
               <Printer size={16} className="text-blue-600" /> Print
             </button>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="bg-white px-6 py-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-end">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Debit</span>
               <span className="text-xl font-black text-slate-800">₹{totalDebit.toLocaleString()}</span>
             </div>
             <div className="bg-white px-6 py-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-end">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Credit</span>
               <span className="text-xl font-black text-slate-800">₹{totalCredit.toLocaleString()}</span>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default DayBook;
