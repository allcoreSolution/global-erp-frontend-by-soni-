import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  Check, X, ChevronLeft, ChevronRight, Printer, Calendar, DollarSign, Filter
} from 'lucide-react';

const JournalList = () => {
  const navigate = useNavigate();

  // Mock Journal Vouchers
  const [journals, setJournals] = useState(() => {
    const saved = localStorage.getItem('journal_entries');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 'JV-2024-001',
        date: '2024-05-20',
        reference: 'REF-88902',
        narration: 'Office Rent for May 2024 adjusted against security deposit',
        status: 'Approved',
        items: [
          { type: 'Dr', account: 'Rent Expense A/c', amount: 45000, narration: 'Monthly rent' },
          { type: 'Cr', account: 'Security Deposit A/c', amount: 45000, narration: 'Adjustment' }
        ],
        totalAmount: 45000,
        attachmentName: 'rent_agreement.pdf'
      },
      {
        id: 'JV-2024-002',
        date: '2024-05-22',
        reference: 'DEP-209',
        narration: 'Depreciation provision on office machinery for FY 24-25',
        status: 'Pending',
        items: [
          { type: 'Dr', account: 'Depreciation A/c', amount: 12500, narration: 'Machinery dep.' },
          { type: 'Cr', account: 'Accumulated Depreciation A/c', amount: 12500, narration: 'Machinery dep.' }
        ],
        totalAmount: 12500,
        attachmentName: null
      },
      {
        id: 'JV-2024-003',
        date: '2024-05-23',
        reference: 'JV-ADJ',
        narration: 'Correction entry for sales commission wrong booking',
        status: 'Draft',
        items: [
          { type: 'Dr', account: 'Commission Paid A/c', amount: 8000, narration: 'Correct booking' },
          { type: 'Cr', account: 'Sundry Debtors - Ramesh & Sons', amount: 8000, narration: 'Rectification entry' }
        ],
        totalAmount: 8000,
        attachmentName: 'correction_note.png'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(journals));
  }, [journals]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Manage print modal body class for print styling targeting
  useEffect(() => {
    if (isPrintModalOpen) {
      document.body.classList.add('voucher-modal-open');
    } else {
      document.body.classList.remove('voucher-modal-open');
    }
    return () => document.body.classList.remove('voucher-modal-open');
  }, [isPrintModalOpen]);

  // Filter Logic
  const filteredJournals = journals.filter(jv => {
    const matchesSearch = jv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          jv.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          jv.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? jv.status === statusFilter : true;
    const matchesStartDate = startDate ? jv.date >= startDate : true;
    const matchesEndDate = endDate ? jv.date <= endDate : true;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Export Filtered List to CSV
  const handleExportCSV = () => {
    const headers = ['Voucher No', 'Date', 'Reference', 'Narration', 'Total Amount', 'Status'];
    const csvRows = filteredJournals.map(jv => [
      `"${jv.id}"`,
      `"${jv.date}"`,
      `"${jv.reference || ''}"`,
      `"${jv.narration.replace(/"/g, '""')}"`,
      jv.totalAmount,
      `"${jv.status}"`
    ].join(','));

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_entries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Voucher List from CSV File
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }

      const newEntries = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 5) continue;

        const id = columns[0] || `JV-IMP-${Date.now()}-${i}`;
        const date = columns[1] || new Date().toISOString().split('T')[0];
        const reference = columns[2] || '';
        const narration = columns[3] || 'Imported Entry';
        const totalAmount = Number(columns[4]) || 0;
        const status = columns[5] || 'Pending';

        const items = [
          { type: 'Dr', account: 'Suspense Account A/c', amount: totalAmount, narration: 'Imported debit line' },
          { type: 'Cr', account: 'Suspense Account A/c', amount: totalAmount, narration: 'Imported credit line' }
        ];

        if (journals.some(j => j.id === id)) {
          continue; // Skip duplicates
        }

        newEntries.push({
          id,
          date,
          reference,
          narration,
          status,
          items,
          totalAmount,
          attachmentName: null
        });
      }

      if (newEntries.length === 0) {
        alert('No new valid entries were imported. All entries might be duplicates.');
        return;
      }

      setJournals(prev => [...prev, ...newEntries]);
      alert(`Successfully imported ${newEntries.length} journal entry vouchers!`);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete journal voucher ${id}?`)) {
      setJournals(journals.filter(j => j.id !== id));
    }
  };

  const handleApprove = (id, newStatus) => {
    setJournals(journals.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  const handlePrint = (jv) => {
    setSelectedJournal(jv);
    setIsPrintModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-blue-900 dark:text-slate-700 tracking-wide uppercase">Journal Entries</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Record, review, and approve adjustment and rectification journal vouchers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Import CSV */}
          <label className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer">
            <Upload size={14} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer"
          >
            <FileText size={14} />
            Export PDF
          </button>

          <button
            onClick={() => navigate('/journal/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-xs font-semibold px-4 py-2 rounded shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            Create Journal
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
                  <tr key={jv.id} className="border-b border-gray-100 dark:border-slate-200/60 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-blue-400">{jv.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{jv.date}</td>
                    <td className="py-3 px-4">{jv.reference || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={jv.narration}>{jv.narration}</td>
                    <td className="py-3 px-4 text-right font-bold">₹ {jv.totalAmount.toLocaleString('en-IN')}.00</td>
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
                            onClick={() => handleApprove(jv.id, 'Approved')}
                            title="Approve Voucher"
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {jv.status === 'Approved' && (
                          <button
                            onClick={() => handleApprove(jv.id, 'Pending')}
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
                          onClick={() => handlePrint(jv)}
                          title="View & Print Voucher"
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/journal/edit/${jv.id}`)}
                          title="Edit Voucher"
                          className="p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(jv.id)}
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

      {/* Print / Detail Preview Modal */}
      {isPrintModalOpen && selectedJournal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-lg max-w-3xl w-full shadow-xl overflow-hidden flex flex-col h-[85vh] no-print">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-gray-200 dark:border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-700">Journal Voucher Preview</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Review voucher details before printing</p>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-850 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Printable Content */}
            <div className="flex-1 overflow-y-auto p-8" id="printable-voucher-area">
              <div className="border border-gray-300 dark:border-slate-200 p-6 rounded bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200">
                {/* Company Header */}
                <div className="text-center pb-4 border-b border-gray-200 dark:border-slate-850">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-slate-700">ALLCORE SOLUTION PVT. LTD.</h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Plot 12, Gandhi Nagar, Jaipur - 302015</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">GSTIN: 08AAAAA1111A1Z1 | Support: contact@allcore.com</p>
                  <h3 className="text-md font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 mt-4">JOURNAL VOUCHER</h3>
                </div>

                {/* Voucher Meta details */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                  <div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Voucher No:</span> <span className="font-bold text-gray-800 dark:text-slate-700">{selectedJournal.id}</span></div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Voucher Date:</span> <span className="text-gray-700 dark:text-slate-200">{selectedJournal.date}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Reference:</span> <span className="text-gray-700 dark:text-slate-200 font-semibold">{selectedJournal.reference || 'N/A'}</span></div>
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Status:</span> <span className="font-bold text-green-600">{selectedJournal.status}</span></div>
                  </div>
                </div>

                {/* Voucher Accounts Grid */}
                <div className="mt-4">
                  <table className="w-full text-left text-xs border border-gray-200 dark:border-slate-200">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-850 border-b border-gray-200 dark:border-slate-200 text-gray-700 dark:text-slate-300 font-bold uppercase">
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200">Particulars (Account)</th>
                        <th className="py-2 px-3 text-center border-r border-gray-200 dark:border-slate-200 w-16">Dr / Cr</th>
                        <th className="py-2 px-3 text-right border-r border-gray-200 dark:border-slate-200 w-28">Debit (₹)</th>
                        <th className="py-2 px-3 text-right w-28">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJournal.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-slate-200/60 text-gray-750 dark:text-slate-300">
                          <td className="py-2.5 px-3 border-r border-gray-200 dark:border-slate-200">
                            <div className="font-bold">{item.account}</div>
                            {item.narration && <div className="text-[10px] text-gray-400 dark:text-gray-500 italic mt-0.5">{item.narration}</div>}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-slate-200 font-semibold">
                            {item.type}
                          </td>
                          <td className="py-2.5 px-3 text-right border-r border-gray-200 dark:border-slate-200 font-mono">
                            {item.type === 'Dr' ? `₹ ${item.amount.toLocaleString('en-IN')}.00` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {item.type === 'Cr' ? `₹ ${item.amount.toLocaleString('en-IN')}.00` : '-'}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-slate-50 dark:bg-slate-850 font-bold border-t border-gray-300 dark:border-slate-200">
                        <td colSpan="2" className="py-3 px-3 text-right border-r border-gray-200 dark:border-slate-200 uppercase">Total Amount:</td>
                        <td className="py-3 px-3 text-right border-r border-gray-200 dark:border-slate-200 font-mono">₹ {selectedJournal.totalAmount.toLocaleString('en-IN')}.00</td>
                        <td className="py-3 px-3 text-right font-mono">₹ {selectedJournal.totalAmount.toLocaleString('en-IN')}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Narration and Signature */}
                <div className="mt-6 text-xs text-gray-700 dark:text-slate-300">
                  <div className="font-bold">General Narration:</div>
                  <p className="mt-1 bg-gray-50 dark:bg-slate-850 p-2.5 rounded border dark:border-slate-200 italic">{selectedJournal.narration}</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 text-center text-xs">
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Prepared By</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Checked By</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Approved By</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-t border-gray-200 dark:border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border border-gray-300 dark:border-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-350 text-xs font-semibold px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={triggerBrowserPrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 shadow"
              >
                <Printer size={14} />
                Print Voucher
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Embed print styles to support clean voucher printouts without headers/footers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .voucher-modal-open #printable-voucher-area, 
          .voucher-modal-open #printable-voucher-area * {
            visibility: visible !important;
          }
          .voucher-modal-open #printable-voucher-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          body:not(.voucher-modal-open) #printable-list-area,
          body:not(.voucher-modal-open) #printable-list-area * {
            visibility: visible !important;
          }
          body:not(.voucher-modal-open) #printable-list-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          /* Hide print action columns during printing list */
          body:not(.voucher-modal-open) th:nth-child(7),
          body:not(.voucher-modal-open) td:nth-child(7),
          body:not(.voucher-modal-open) th:nth-child(8),
          body:not(.voucher-modal-open) td:nth-child(8) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JournalList;
