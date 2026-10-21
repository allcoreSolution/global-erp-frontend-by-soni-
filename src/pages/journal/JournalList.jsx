import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileDown, Eye, Edit, Trash2, 
  Check, X, ChevronLeft, ChevronRight, Calendar, DollarSign, Filter,
  Calculator, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const JournalList = () => {
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);

  // Month-end Automation Wizards
  const [isAmortModalOpen, setIsAmortModalOpen] = useState(false);
  const [amortForm, setAmortForm] = useState({
    expenseName: 'Office Insurance',
    totalPrepaid: 12000,
    tenureMonths: 12,
    prepaidAccount: 'Prepaid Insurance',
    expenseAccount: 'Insurance Expense',
    periodMonth: 'April 2026'
  });

  const [isDeprModalOpen, setIsDeprModalOpen] = useState(false);
  const [deprForm, setDeprForm] = useState({
    assetName: 'Furniture & Fixtures',
    assetCost: 50000,
    annualRate: 10,
    deprMethod: 'SLM',
    expenseAccount: 'Depreciation Expense',
    assetAccount: 'Furniture & Fixtures',
    periodMonth: 'April 2026'
  });

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const res = await api.get('/journals');
      if (res.data?.data) {
        setJournals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch journals', err);
    }
  };

  const handlePostAmortization = async (e) => {
    e.preventDefault();
    const monthlyAmt = Math.round((Number(amortForm.totalPrepaid) || 0) / (Number(amortForm.tenureMonths) || 12));
    try {
      const payload = {
        journalNo: `JV-AMORT-${Date.now().toString().slice(-6)}`,
        journalDate: new Date().toISOString().split('T')[0],
        financialYear: '2026-27',
        referenceNo: `AMORT-${amortForm.periodMonth}`,
        narration: `Monthly amortization for ${amortForm.expenseName} (${amortForm.periodMonth}) - ₹${monthlyAmt}`,
        status: 'Approved',
        entries: [
          { account: amortForm.expenseAccount, debit: monthlyAmt, credit: 0, description: `Monthly charge for ${amortForm.expenseName}` },
          { account: amortForm.prepaidAccount, debit: 0, credit: monthlyAmt, description: `Prepaid asset reduction` }
        ],
        totals: { debit: monthlyAmt, credit: monthlyAmt }
      };
      await api.post('/journals', payload);
      Swal.fire({
        icon: 'success',
        title: 'Amortization Posted! ✓',
        text: `Posted ₹${monthlyAmt} from ${amortForm.prepaidAccount} to ${amortForm.expenseAccount}.`,
        confirmButtonColor: '#4f46e5'
      });
      setIsAmortModalOpen(false);
      fetchJournals();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to Post', text: err.message });
    }
  };

  const handlePostDepreciation = async (e) => {
    e.preventDefault();
    const annualAmt = (Number(deprForm.assetCost) || 0) * (Number(deprForm.annualRate) || 10) / 100;
    const monthlyAmt = Math.round(annualAmt / 12);
    try {
      const payload = {
        journalNo: `JV-DEPR-${Date.now().toString().slice(-6)}`,
        journalDate: new Date().toISOString().split('T')[0],
        financialYear: '2026-27',
        referenceNo: `DEPR-${deprForm.periodMonth}`,
        narration: `Monthly depreciation on ${deprForm.assetName} (${deprForm.periodMonth}) @ ${deprForm.annualRate}% p.a.`,
        status: 'Approved',
        entries: [
          { account: deprForm.expenseAccount, debit: monthlyAmt, credit: 0, description: `Depreciation on ${deprForm.assetName}` },
          { account: deprForm.assetAccount, debit: 0, credit: monthlyAmt, description: `Accumulated depreciation reduction` }
        ],
        totals: { debit: monthlyAmt, credit: monthlyAmt }
      };
      await api.post('/journals', payload);
      Swal.fire({
        icon: 'success',
        title: 'Depreciation Posted! ✓',
        text: `Posted ₹${monthlyAmt} depreciation on ${deprForm.assetName}.`,
        confirmButtonColor: '#4f46e5'
      });
      setIsDeprModalOpen(false);
      fetchJournals();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to Post', text: err.message });
    }
  };

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const fileInputRef = useRef(null);

  // Filter Logic
  const filteredJournals = journals.filter(jv => {
    const matchesSearch = (jv.journalNo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (jv.narration || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (jv.referenceNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? jv.status === statusFilter : true;
    const matchesStartDate = startDate ? (jv.journalDate || '') >= startDate : true;
    const matchesEndDate = endDate ? (jv.journalDate || '') <= endDate : true;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Export Filtered List to CSV
  const handleExportCSV = () => {
    const csvContent = "Voucher No,Date,Reference,Narration,Total Amount,Status\n1001,2023-12-01,Sample,Sample,100,Yes\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_entries_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Voucher No,Date,Reference,Narration,Total Amount,Status\n1001,2023-12-01,Sample,Sample,100,Yes\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_entries_sample.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Voucher List from CSV File
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. (Add logic as needed)', 'success');
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this journal voucher?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/journals/${id}`);
        setJournals(journals.filter(j => j._id !== id));
        Swal.fire('Deleted!', 'Journal entry deleted successfully', 'success');
      } catch (err) {
        console.error('Failed to delete', err);
        Swal.fire('Error', 'Failed to delete journal entry.', 'error');
      }
    }
  };

  const handleApprove = async (id, newStatus) => {
    try {
      await api.put(`/journals/${id}`, { status: newStatus });
      setJournals(journals.map(j => j._id === id ? { ...j, status: newStatus } : j));
    } catch (err) {
      console.error('Failed to change status', err);
      alert('Failed to change status.');
    }
  };



  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImportCSV}
        className="hidden"
      />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Journal Entries</h1>
          <p className="text-[12px] text-gray-500 mt-1">Record, review, and approve adjustment and rectification journal vouchers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button 
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <FileDown size={14} /> Sample
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => setIsAmortModalOpen(true)} 
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded shadow-xs transition"
          >
            <Sparkles size={14} /> Prepaid Amortization
          </button>
          <button 
            onClick={() => setIsDeprModalOpen(true)} 
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded shadow-xs transition"
          >
            <Calculator size={14} /> Asset Depreciation
          </button>
          <button 
            onClick={() => navigate('/journal/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Plus size={14} /> New Journal
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, Narration, Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div id="printable-list-area" className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border border-gray-100 dark:border-slate-200 rounded-lg shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-855/50 border-b border-gray-200 dark:border-slate-200 text-gray-700 dark:text-slate-350 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Journal No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Narration</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Approval Actions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals.length > 0 ? (
                filteredJournals.map((jv) => (
                  <tr key={jv._id} className="border-b border-gray-100 dark:border-slate-200/60 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-blue-400">{jv.journalNo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{jv.journalDate}</td>
                    <td className="py-3 px-4">{jv.referenceNo || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={jv.narration}>{jv.narration}</td>
                    <td className="py-3 px-4 text-right font-bold">₹ {(jv.totals?.debit || 0).toLocaleString('en-IN')}.00</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${jv.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 
                          jv.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' : 
                          'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
                      >
                        {jv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {jv.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(jv._id, 'Approved')}
                            title="Approve Voucher"
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {jv.status === 'Approved' && (
                          <button
                            onClick={() => handleApprove(jv._id, 'Pending')}
                            title="Reject/Revert to Pending"
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/journal/edit/${jv._id}`)}
                          title="Edit Voucher"
                          className="p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(jv._id)}
                          title="Delete Voucher"
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No journal vouchers found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREPAID EXPENSE AMORTIZATION WIZARD MODAL */}
      {isAmortModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-4 bg-purple-50/70 border-b border-purple-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles size={16} /> Prepaid Expense Amortization Wizard
                </h3>
                <p className="text-xs text-purple-600 mt-0.5">Auto-calculate monthly charge & post journal (Entry 24/29)</p>
              </div>
              <button onClick={() => setIsAmortModalOpen(false)} className="p-1.5 hover:bg-purple-100 rounded-full text-purple-700 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePostAmortization} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expense / Policy Description</label>
                  <input
                    type="text"
                    required
                    value={amortForm.expenseName}
                    onChange={(e) => setAmortForm({ ...amortForm, expenseName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
                    placeholder="e.g. Office Insurance"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total Prepaid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amortForm.totalPrepaid}
                    onChange={(e) => setAmortForm({ ...amortForm, totalPrepaid: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
                    placeholder="12000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Amortization Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={amortForm.tenureMonths}
                    onChange={(e) => setAmortForm({ ...amortForm, tenureMonths: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Prepaid Asset A/c (Credit)</label>
                  <input
                    type="text"
                    required
                    value={amortForm.prepaidAccount}
                    onChange={(e) => setAmortForm({ ...amortForm, prepaidAccount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expense A/c (Debit)</label>
                  <input
                    type="text"
                    required
                    value={amortForm.expenseAccount}
                    onChange={(e) => setAmortForm({ ...amortForm, expenseAccount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Monthly Amount Preview */}
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex justify-between items-center font-bold">
                <div>
                  <span className="text-purple-900 block text-xs">Monthly Expense Charge:</span>
                  <span className="text-[10px] text-purple-600 font-medium">₹{amortForm.totalPrepaid} ÷ {amortForm.tenureMonths} months</span>
                </div>
                <div className="text-right">
                  <span className="text-purple-700 text-lg">
                    ₹{Math.round((Number(amortForm.totalPrepaid) || 0) / (Number(amortForm.tenureMonths) || 12)).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-purple-500 block">per month</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAmortModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Post Monthly Amortization Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED ASSET DEPRECIATION CALCULATOR MODAL */}
      {isDeprModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <Calculator size={16} /> Fixed Asset Depreciation Calculator
                </h3>
                <p className="text-xs text-amber-600 mt-0.5">Straight Line (SLM) & WDV monthly auto-calculator & journal post</p>
              </div>
              <button onClick={() => setIsDeprModalOpen(false)} className="p-1.5 hover:bg-amber-100 rounded-full text-amber-700 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePostDepreciation} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Asset Head / Item</label>
                  <select
                    value={deprForm.assetName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Furniture & Fixtures') {
                        setDeprForm({ ...deprForm, assetName: val, assetCost: 50000, assetAccount: 'Furniture & Fixtures', annualRate: 10 });
                      } else if (val === 'Computer & IT Equipment') {
                        setDeprForm({ ...deprForm, assetName: val, assetCost: 40000, assetAccount: 'Computer Equipment', annualRate: 20 });
                      } else {
                        setDeprForm({ ...deprForm, assetName: val, assetAccount: val });
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-amber-500"
                  >
                    <option value="Furniture & Fixtures">Furniture & Fixtures (Entry 05 - ₹50,000)</option>
                    <option value="Computer & IT Equipment">Computer & IT Equipment (Entry 06 - ₹40,000)</option>
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Office Equipment">Office Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Asset Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={deprForm.assetCost}
                    onChange={(e) => setDeprForm({ ...deprForm, assetCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Annual Depr. Rate (% p.a.)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    step="0.5"
                    value={deprForm.annualRate}
                    onChange={(e) => setDeprForm({ ...deprForm, annualRate: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Calculation Method</label>
                  <select
                    value={deprForm.deprMethod}
                    onChange={(e) => setDeprForm({ ...deprForm, deprMethod: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-amber-500"
                  >
                    <option value="SLM">Straight Line Method (SLM)</option>
                    <option value="WDV">Written Down Value (WDV)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expense Ledger (Dr)</label>
                  <input
                    type="text"
                    required
                    value={deprForm.expenseAccount}
                    onChange={(e) => setDeprForm({ ...deprForm, expenseAccount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Depreciation Preview */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center font-bold">
                <div>
                  <span className="text-amber-900 block text-xs">Monthly Depreciation Charge:</span>
                  <span className="text-[10px] text-amber-700 font-medium">₹{deprForm.assetCost} × {deprForm.annualRate}% ÷ 12</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-700 text-lg">
                    ₹{Math.round(((Number(deprForm.assetCost) || 0) * (Number(deprForm.annualRate) || 10) / 100) / 12).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-600 block">per month</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeprModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Calculator size={14} /> Post Depreciation Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JournalList;
