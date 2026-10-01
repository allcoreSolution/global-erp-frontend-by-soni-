import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileDown, Eye, Edit, Trash2, 
  Check, X, ChevronLeft, ChevronRight, Calendar, DollarSign, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const JournalList = () => {
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);

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
    const csvContent = "Voucher No,Date,Reference,Narration,Total Amount,Status\n";
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
    const csvContent = "Voucher No,Date,Reference,Narration,Total Amount,Status\n";
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

    </div>
  );
};

export default JournalList;
