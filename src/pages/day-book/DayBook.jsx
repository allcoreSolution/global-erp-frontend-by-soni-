import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Download, Printer, FileDown, Upload } from 'lucide-react';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const DayBook = () => {
  const today = new Date();
  const firstDayStr = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDay = `${firstDayStr.getFullYear()}-${String(firstDayStr.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDayStr = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const lastDay = `${lastDayStr.getFullYear()}-${String(lastDayStr.getMonth() + 1).padStart(2, '0')}-${String(lastDayStr.getDate()).padStart(2, '0')}`;

  const [filters, setFilters] = useState({
    fromDate: firstDay,
    toDate: lastDay,
    branch: '',
    voucherType: '',
    account: '',
    status: ''
  });

  const [vouchers, setVouchers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchBranches();
    fetchVouchers();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data && res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/account-ledgers');
      if (res.data && res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      if (filters.voucherType) queryParams.append('voucherType', filters.voucherType);
      if (filters.account) queryParams.append('accountId', filters.account);
      if (filters.status) queryParams.append('status', filters.status);
      
      const res = await api.get(`/vouchers?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchVouchers();
  };

  const handleReset = () => {
    setFilters({
      fromDate: firstDay,
      toDate: lastDay,
      branch: '',
      voucherType: '',
      account: '',
      status: ''
    });
    // Need to trigger fetch after state updates, but since setState is async, we can just call fetchVouchers with default values
    setTimeout(() => {
       fetchVouchers();
    }, 0);
  };

  // Flatmap the voucher entries for display
  const entries = vouchers.flatMap(v => {
    return v.entries.map((entry, index) => ({
      id: `${v._id}-${index}`,
      date: new Date(v.date).toLocaleDateString(),
      voucherNo: v.voucherNo || v._id.slice(-6),
      type: v.voucherType,
      particulars: entry.account?.accountName || 'Unknown Account',
      debit: entry.debitAmount > 0 ? entry.debitAmount : null,
      credit: entry.creditAmount > 0 ? entry.creditAmount : null,
    }));
  });

  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Voucher No', 'Type', 'Particulars', 'Debit', 'Credit'];
    const rows = entries.map(entry => [
      entry.date,
      entry.voucherNo,
      entry.type,
      `"${entry.particulars}"`,
      entry.debit || 0,
      entry.credit || 0
    ]);
    const csvContent = [headers.join(',') + '\n' + '2023-12-01,1001,Standard,Sample,Sample,Sample', ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daybook_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Voucher No', 'Date', 'Type', 'Account ID', 'Debit', 'Credit', 'Narration'];
    const csvContent = headers.join(',') + '\n' + '2023-12-01,1001,Standard,Sample,Sample,Sample' + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'voucher_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }

      const newVouchers = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 5) continue; 

        // Basic parsing for the demo import
        const voucherNo = columns[0] || `V-IMP-${Date.now()}-${i}`;
        const date = columns[1] || new Date().toISOString().split('T')[0];
        const voucherType = columns[2] || 'Journal';
        const accountId = columns[3]; // We need a valid ObjectId for account in the backend. 
        const debit = Number(columns[4]) || 0;
        const credit = Number(columns[5]) || 0;
        const narration = columns[6] || 'Imported Entry';

        // Assuming we need a valid account ID, we might skip rows without one in a real app, 
        // but for now we try to send whatever is there.
        if (accountId) {
          newVouchers.push({
            voucherNo,
            date,
            voucherType,
            status: 'Posted',
            generalNarration: narration,
            entries: [
              {
                account: accountId,
                debitAmount: debit,
                creditAmount: credit,
                narration: narration
              }
            ]
          });
        }
      }

      if (newVouchers.length === 0) {
        alert('No valid vouchers found in the file. Ensure Account ID is present.');
        return;
      }

      try {
        const res = await api.post('/vouchers/import', newVouchers);
        if (res.data?.success) {
          fetchVouchers();
          alert(`Successfully imported ${res.data.count || res.data.data?.length} vouchers!`);
        }
      } catch (error) {
        console.error("Failed to import", error);
        alert('Failed to import vouchers. Make sure Account IDs are valid MongoDB ObjectIds.');
      }
      
      e.target.value = '';
    };

    reader.readAsText(file);
  };

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select name="branch" value={filters.branch} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Voucher Type</label>
              <select name="voucherType" value={filters.voucherType} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select Voucher Type</option>
                <option value="Receipt">Receipt</option>
                <option value="Payment">Payment</option>
                <option value="Journal">Journal</option>
                <option value="Contra">Contra</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account</label>
              <select name="account" value={filters.account} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.accountName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white">
                <option value="">Select Status</option>
                <option value="Draft">Draft</option>
                <option value="Posted">Posted</option>
                <option value="Cancelled">Cancelled</option>
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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 italic bg-slate-50">
                      Loading Day Book...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 italic bg-slate-50">
                      No transactions found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-amber-700">{entry.voucherNo}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          entry.type === 'Receipt' ? 'bg-green-100 text-green-700' :
                          entry.type === 'Payment' ? 'bg-red-100 text-red-700' :
                          entry.type === 'Contra' ? 'bg-purple-100 text-purple-700' :
                          entry.type === 'Sales' ? 'bg-blue-100 text-blue-700' :
                          entry.type === 'Purchase' ? 'bg-orange-100 text-orange-700' :
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="flex flex-wrap gap-3 w-full md:w-auto">
             <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm cursor-pointer">
               <Upload size={16} className="text-indigo-600" /> Import CSV
               <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
             </label>
             <button onClick={handleDownloadSample} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm">
               <FileDown size={16} className="text-blue-600" /> Sample File
             </button>
             <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-sm transition-colors shadow-sm">
               <Download size={16} className="text-emerald-600" /> Export CSV
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
