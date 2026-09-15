import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  Check, X, Printer, Calendar, Database, Filter, ArrowRightLeft
} from 'lucide-react';

const StockEntryList = () => {
  const navigate = useNavigate();

  // Mock Stock Entries
  const [stockEntries, setStockEntries] = useState(() => {
    const saved = localStorage.getItem('stock_entries');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 'SE-2024-001',
        type: 'Stock In',
        date: '2024-05-21',
        warehouse: 'Central Warehouse',
        reference: 'REF-IN-908',
        reason: 'Opening stock count adjustments',
        status: 'Approved',
        items: [
          { product: 'Logitech Wireless Mouse', qty: 50, unit: 'Nos', batch: 'BT-LOG-90', serial: 'SN-8890-001', reason: 'Initial Count' },
          { product: 'Dell 24" Monitor', qty: 10, unit: 'Nos', batch: 'BT-DEL-24', serial: 'SN-DELL-802', reason: 'Initial Count' }
        ],
        totalQty: 60,
        remarks: 'Voucher posted after year-end stock audits'
      },
      {
        id: 'SE-2024-002',
        type: 'Damage/Loss',
        date: '2024-05-23',
        warehouse: 'North Branch Warehouse',
        reference: 'DMG-8809',
        reason: 'Water leakage damage in aisle 4',
        status: 'Pending',
        items: [
          { product: 'Keyboards USB', qty: 8, unit: 'Nos', batch: 'BT-KEY-02', serial: 'SN-KEY-390', reason: 'Water Damage' }
        ],
        totalQty: 8,
        remarks: 'Physical damaged inventory removed from active stock ledgers'
      },
      {
        id: 'SE-2024-003',
        type: 'Transfer',
        date: '2024-05-24',
        warehouse: 'Central Warehouse',
        reference: 'TRF-WH-02',
        reason: 'Inter-branch inventory transfer',
        status: 'Draft',
        items: [
          { product: 'HDMI Cables 1.5m', qty: 25, unit: 'Nos', batch: 'BT-CAB-01', serial: 'SN-CAB-120', reason: 'Stock requisition' }
        ],
        totalQty: 25,
        remarks: 'Transferring to East Side Storage branch'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('stock_entries', JSON.stringify(stockEntries));
  }, [stockEntries]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
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
  const filteredEntries = stockEntries.filter(se => {
    const matchesSearch = se.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          se.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          se.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? se.type === typeFilter : true;
    const matchesWarehouse = warehouseFilter ? se.warehouse === warehouseFilter : true;
    const matchesStatus = statusFilter ? se.status === statusFilter : true;
    const matchesStartDate = startDate ? se.date >= startDate : true;
    const matchesEndDate = endDate ? se.date <= endDate : true;
    return matchesSearch && matchesType && matchesWarehouse && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete stock entry voucher ${id}?`)) {
      setStockEntries(stockEntries.filter(se => se.id !== id));
    }
  };

  const handleApprove = (id, newStatus) => {
    setStockEntries(stockEntries.map(se => se.id === id ? { ...se, status: newStatus } : se));
  };

  const handlePrint = (se) => {
    setSelectedEntry(se);
    setIsPrintModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  // Export Filtered List to CSV
  const handleExportCSV = () => {
    const headers = ['Voucher No', 'Type', 'Date', 'Warehouse', 'Reference', 'Reason', 'Total Qty', 'Status'];
    const csvRows = filteredEntries.map(se => [
      `"${se.id}"`,
      `"${se.type}"`,
      `"${se.date}"`,
      `"${se.warehouse}"`,
      `"${se.reference || ''}"`,
      `"${se.reason.replace(/"/g, '""')}"`,
      se.totalQty,
      `"${se.status}"`
    ].join(','));

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_entries_${new Date().toISOString().split('T')[0]}.csv`);
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
        if (columns.length < 7) continue;

        const id = columns[0] || `SE-IMP-${Date.now()}-${i}`;
        const type = columns[1] || 'Stock In';
        const date = columns[2] || new Date().toISOString().split('T')[0];
        const warehouse = columns[3] || 'Central Warehouse';
        const reference = columns[4] || '';
        const reason = columns[5] || 'Imported Stock Adjustment';
        const totalQty = Number(columns[6]) || 0;
        const status = columns[7] || 'Pending';

        const items = [
          { product: 'Imported Product Sample', qty: totalQty, unit: 'Nos', batch: 'BT-IMP-01', serial: 'SN-IMP-001', reason: 'CSV Import' }
        ];

        if (stockEntries.some(s => s.id === id)) {
          continue; // Skip duplicates
        }

        newEntries.push({
          id,
          type,
          date,
          warehouse,
          reference,
          reason,
          status,
          items,
          totalQty,
          remarks: 'Batch record uploaded via CSV spreadsheet import'
        });
      }

      if (newEntries.length === 0) {
        alert('No new valid stock entries were imported. All entries might be duplicates.');
        return;
      }

      setStockEntries(prev => [...prev, ...newEntries]);
      alert(`Successfully imported ${newEntries.length} stock adjustment vouchers!`);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-blue-900 dark:text-slate-700 tracking-wide uppercase">Stock Entries</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track and adjust stock levels, inter-warehouse transfers, and damage losses</p>
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
            onClick={triggerBrowserPrint}
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer"
          >
            <FileText size={14} />
            Export PDF
          </button>

          <button
            onClick={() => navigate('/stock-entry/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-xs font-semibold px-4 py-2 rounded shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            New Stock Entry
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Search bar */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, Reason, Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Entry Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Entry Types</option>
            <option value="Normal">Normal</option>
            <option value="Stock In">Stock In</option>
            <option value="Stock Out">Stock Out</option>
            <option value="Transfer">Transfer</option>
            <option value="Damage/Loss">Damage/Loss</option>
          </select>

          {/* Warehouse */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Warehouses</option>
            <option value="Central Warehouse">Central Warehouse</option>
            <option value="North Branch Warehouse">North Branch Warehouse</option>
            <option value="East Side Storage">East Side Storage</option>
          </select>

          {/* Status */}
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
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main List Table */}
      <div id="printable-list-area" className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border border-gray-100 dark:border-slate-200 rounded-lg shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-855/50 border-b border-gray-200 dark:border-slate-200 text-gray-700 dark:text-slate-350 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Adjustment Reason</th>
                <th className="py-3 px-4 text-center">Total Qty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center no-print">Approvals</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((se) => (
                  <tr key={se.id} className="border-b border-gray-100 dark:border-slate-200/60 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-blue-400">{se.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold 
                        ${se.type === 'Stock In' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                          se.type === 'Stock Out' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400' : 
                          se.type === 'Transfer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                          se.type === 'Damage/Loss' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'}`}
                      >
                        {se.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{se.date}</td>
                    <td className="py-3 px-4">{se.warehouse}</td>
                    <td className="py-3 px-4">{se.reference || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={se.reason}>{se.reason}</td>
                    <td className="py-3 px-4 text-center font-bold">{se.totalQty}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${se.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 
                          se.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' : 
                          'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
                      >
                        {se.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        {se.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(se.id, 'Approved')}
                            title="Approve Voucher"
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {se.status === 'Approved' && (
                          <button
                            onClick={() => handleApprove(se.id, 'Pending')}
                            title="Revert to Pending"
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrint(se)}
                          title="Print Stock Entry"
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/stock-entry/edit/${se.id}`)}
                          title="Edit Entry"
                          className="p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(se.id)}
                          title="Delete Entry"
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
                  <td colSpan="10" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No stock entry vouchers found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Detail Preview Modal */}
      {isPrintModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-lg max-w-3xl w-full shadow-xl overflow-hidden flex flex-col h-[85vh] no-print">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-gray-200 dark:border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-700">Stock Entry Voucher Preview</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Review entry adjustments and serial/batch logs</p>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-855 rounded"
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
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">GSTIN: 08AAAAA1111A1Z1 | Database: ALLCORE_DB</p>
                  <h3 className="text-md font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 mt-4">STOCK ADJUSTMENT VOUCHER</h3>
                </div>

                {/* Voucher Meta details */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                  <div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Voucher No:</span> <span className="font-bold text-gray-800 dark:text-slate-700">{selectedEntry.id}</span></div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Voucher Type:</span> <span className="font-bold text-indigo-600">{selectedEntry.type}</span></div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Warehouse:</span> <span className="text-gray-700 dark:text-slate-200 font-medium">{selectedEntry.warehouse}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Voucher Date:</span> <span className="text-gray-700 dark:text-slate-200 font-semibold">{selectedEntry.date}</span></div>
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Reference:</span> <span className="text-gray-700 dark:text-slate-200 font-semibold">{selectedEntry.reference || 'N/A'}</span></div>
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Status:</span> <span className="font-bold text-green-600">{selectedEntry.status}</span></div>
                  </div>
                </div>

                {/* Voucher Items Grid */}
                <div className="mt-4">
                  <table className="w-full text-left text-xs border border-gray-200 dark:border-slate-200">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-850 border-b border-gray-200 dark:border-slate-200 text-gray-700 dark:text-slate-350 font-bold uppercase">
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200">Product / Item Name</th>
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200 w-24">Batch No</th>
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200 w-32">Serial Number</th>
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200 w-24 text-center">Qty (Unit)</th>
                        <th className="py-2 px-3">Adjustment Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntry.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-slate-200/60 text-gray-750 dark:text-slate-300">
                          <td className="py-2.5 px-3 border-r border-gray-200 dark:border-slate-200 font-bold">
                            {item.product}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 dark:border-slate-200 font-mono">
                            {item.batch || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 dark:border-slate-200 font-mono">
                            {item.serial || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-slate-200 font-semibold font-mono">
                            {item.qty} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 italic text-gray-600 dark:text-slate-500">
                            {item.reason || <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                      {/* Total Qty Row */}
                      <tr className="bg-slate-50 dark:bg-slate-850 font-bold border-t border-gray-300 dark:border-slate-200">
                        <td colSpan="3" className="py-3 px-3 text-right uppercase">Total Adjusted Qty:</td>
                        <td className="py-3 px-3 text-center font-mono">{selectedEntry.totalQty} Units</td>
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Purpose and Remarks */}
                <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-gray-700 dark:text-slate-350">
                  <div>
                    <div className="font-bold">Main Reason / Purpose:</div>
                    <p className="mt-1 bg-gray-50 dark:bg-slate-850 p-2 rounded border dark:border-slate-200">{selectedEntry.reason}</p>
                  </div>
                  <div>
                    <div className="font-bold">Remarks / Internal Comments:</div>
                    <p className="mt-1 bg-gray-50 dark:bg-slate-850 p-2 rounded border dark:border-slate-200">{selectedEntry.remarks}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 text-center text-xs">
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Store Keeper</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Verified By</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Authority Sign</div>
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
                Print Adjustment
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
          body:not(.voucher-modal-open) th:nth-child(9),
          body:not(.voucher-modal-open) td:nth-child(9),
          body:not(.voucher-modal-open) th:nth-child(10),
          body:not(.voucher-modal-open) td:nth-child(10) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StockEntryList;
