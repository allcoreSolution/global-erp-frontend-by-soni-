import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  Check, X, Printer, Calendar, Database, Filter, ArrowRightLeft, MoveRight
} from 'lucide-react';

const TransferList = () => {
  const navigate = useNavigate();

  // Mock Stock Transfers
  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem('stock_transfers');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 'ST-2024-001',
        date: '2024-05-22',
        fromWarehouse: 'Central Warehouse',
        toWarehouse: 'North Branch Warehouse',
        reference: 'REF-TR-442',
        reason: 'Restocking retail branch inventories',
        status: 'Received',
        items: [
          { product: 'Logitech Wireless Mouse', qty: 30, unit: 'Nos', batch: 'BT-LOG-90', serial: 'SN-8890-045' },
          { product: 'Wireless Keyboard', qty: 15, unit: 'Nos', batch: 'BT-WKY-12', serial: 'SN-WKY-902' }
        ],
        totalQty: 45,
        remarks: 'Shipped via DTDC cargo logistics services'
      },
      {
        id: 'ST-2024-002',
        date: '2024-05-24',
        fromWarehouse: 'Central Warehouse',
        toWarehouse: 'East Side Storage',
        reference: 'REF-TR-456',
        reason: 'Bulk stock shift to secondary warehouse',
        status: 'Sent',
        items: [
          { product: 'Dell 24" Monitor', qty: 8, unit: 'Nos', batch: 'BT-DEL-24', serial: 'SN-DELL-812' }
        ],
        totalQty: 8,
        remarks: 'Driver: Ram Singh (Challan #88902)'
      },
      {
        id: 'ST-2024-003',
        date: '2024-05-25',
        fromWarehouse: 'North Branch Warehouse',
        toWarehouse: 'Central Warehouse',
        reference: 'REF-TR-490',
        reason: 'Excess inventory return to head office',
        status: 'Pending',
        items: [
          { product: 'HDMI Cables 1.5m', qty: 10, unit: 'Nos', batch: 'BT-CAB-01', serial: 'SN-CAB-150' }
        ],
        totalQty: 10,
        remarks: 'Draft entry waiting for dispatch confirmation'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('stock_transfers', JSON.stringify(transfers));
  }, [transfers]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
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
  const filteredTransfers = transfers.filter(st => {
    const matchesSearch = st.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          st.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrom = fromFilter ? st.fromWarehouse === fromFilter : true;
    const matchesTo = toFilter ? st.toWarehouse === toFilter : true;
    const matchesStatus = statusFilter ? st.status === statusFilter : true;
    const matchesStartDate = startDate ? st.date >= startDate : true;
    const matchesEndDate = endDate ? st.date <= endDate : true;
    return matchesSearch && matchesFrom && matchesTo && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete stock transfer voucher ${id}?`)) {
      setTransfers(transfers.filter(st => st.id !== id));
    }
  };

  const handleApproveStatus = (id, newStatus) => {
    setTransfers(transfers.map(st => st.id === id ? { ...st, status: newStatus } : st));
  };

  const handlePrint = (st) => {
    setSelectedTransfer(st);
    setIsPrintModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  // Export Filtered List to CSV
  const handleExportCSV = () => {
    const headers = ['Voucher No', 'Date', 'From Warehouse', 'To Warehouse', 'Reference', 'Reason', 'Total Qty', 'Status'];
    const csvRows = filteredTransfers.map(st => [
      `"${st.id}"`,
      `"${st.date}"`,
      `"${st.fromWarehouse}"`,
      `"${st.toWarehouse}"`,
      `"${st.reference || ''}"`,
      `"${st.reason.replace(/"/g, '""')}"`,
      st.totalQty,
      `"${st.status}"`
    ].join(','));

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_transfers_${new Date().toISOString().split('T')[0]}.csv`);
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

        const id = columns[0] || `ST-IMP-${Date.now()}-${i}`;
        const date = columns[1] || new Date().toISOString().split('T')[0];
        const fromWarehouse = columns[2] || 'Central Warehouse';
        const toWarehouse = columns[3] || 'North Branch Warehouse';
        const reference = columns[4] || '';
        const reason = columns[5] || 'Imported Stock Transfer';
        const totalQty = Number(columns[6]) || 0;
        const status = columns[7] || 'Pending';

        const items = [
          { product: 'Imported Product Sample', qty: totalQty, unit: 'Nos', batch: 'BT-IMP-01', serial: 'SN-IMP-001' }
        ];

        if (transfers.some(t => t.id === id)) {
          continue; // Skip duplicates
        }

        newEntries.push({
          id,
          date,
          fromWarehouse,
          toWarehouse,
          reference,
          reason,
          status,
          items,
          totalQty,
          remarks: 'Record generated via CSV data upload sheet'
        });
      }

      if (newEntries.length === 0) {
        alert('No new valid stock transfers were imported. All entries might be duplicates.');
        return;
      }

      setTransfers(prev => [...prev, ...newEntries]);
      alert(`Successfully imported ${newEntries.length} stock transfer vouchers!`);
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-blue-900 dark:text-slate-700 tracking-wide uppercase">Stock Transfers</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Shift stock between warehouses, manage shipping challans, and track delivery status</p>
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
            onClick={() => navigate('/stock-transfer/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-xs font-semibold px-4 py-2 rounded shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            New Transfer
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

          {/* From Warehouse */}
          <select
            value={fromFilter}
            onChange={(e) => setFromFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">From Warehouse</option>
            <option value="Central Warehouse">Central Warehouse</option>
            <option value="North Branch Warehouse">North Branch Warehouse</option>
            <option value="East Side Storage">East Side Storage</option>
          </select>

          {/* To Warehouse */}
          <select
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">To Warehouse</option>
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
            <option value="Received">Received</option>
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Date */}
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
                <th className="py-3 px-4">Transfer No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">From Warehouse</th>
                <th className="py-3 px-4 text-center w-8"></th>
                <th className="py-3 px-4">To Warehouse</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Transfer Reason</th>
                <th className="py-3 px-4 text-center">Total Qty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center no-print">Delivery Action</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((st) => (
                  <tr key={st.id} className="border-b border-gray-100 dark:border-slate-200/60 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-blue-400">{st.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{st.date}</td>
                    <td className="py-3 px-4 font-semibold">{st.fromWarehouse}</td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      <MoveRight size={14} />
                    </td>
                    <td className="py-3 px-4 font-semibold">{st.toWarehouse}</td>
                    <td className="py-3 px-4">{st.reference || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={st.reason}>{st.reason}</td>
                    <td className="py-3 px-4 text-center font-bold">{st.totalQty}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${st.status === 'Received' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 
                          st.status === 'Sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 
                          st.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' : 
                          'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        {st.status === 'Pending' && (
                          <button
                            onClick={() => handleApproveStatus(st.id, 'Sent')}
                            title="Dispatch Stock (Set Sent)"
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-indigo-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-[9px] rounded font-bold transition-all"
                          >
                            Dispatch
                          </button>
                        )}
                        {st.status === 'Sent' && (
                          <button
                            onClick={() => handleApproveStatus(st.id, 'Received')}
                            title="Receive Stock (Set Received)"
                            className="px-2 py-0.5 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/40 text-[9px] rounded font-bold transition-all"
                          >
                            Receive
                          </button>
                        )}
                        {st.status === 'Received' && (
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold italic">Settled</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrint(st)}
                          title="Print Delivery Challan"
                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/stock-transfer/edit/${st.id}`)}
                          title="Edit Transfer"
                          className="p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          title="Delete Transfer"
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
                  <td colSpan="11" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No stock transfer vouchers found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Detail Preview Modal */}
      {isPrintModalOpen && selectedTransfer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-lg max-w-3xl w-full shadow-xl overflow-hidden flex flex-col h-[85vh] no-print">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-gray-200 dark:border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-700">Stock Transfer Challan Preview</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Verify source, target destination, and inventory list</p>
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
                  <h3 className="text-md font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 mt-4">DELIVERY CHALLAN (STOCK TRANSFER)</h3>
                </div>

                {/* Voucher Meta details */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                  <div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">Challan No:</span> <span className="font-bold text-gray-800 dark:text-slate-700">{selectedTransfer.id}</span></div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">From Warehouse:</span> <span className="font-bold text-red-600">{selectedTransfer.fromWarehouse}</span></div>
                    <div className="flex py-1"><span className="text-gray-500 font-medium w-24">To Warehouse:</span> <span className="font-bold text-green-600">{selectedTransfer.toWarehouse}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Challan Date:</span> <span className="text-gray-700 dark:text-slate-200 font-semibold">{selectedTransfer.date}</span></div>
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Reference:</span> <span className="text-gray-700 dark:text-slate-200 font-semibold">{selectedTransfer.reference || 'N/A'}</span></div>
                    <div className="flex justify-end py-1"><span className="text-gray-500 font-medium w-24 text-right mr-2">Delivery Status:</span> <span className="font-bold text-indigo-600 uppercase">{selectedTransfer.status}</span></div>
                  </div>
                </div>

                {/* Voucher Items Grid */}
                <div className="mt-4">
                  <table className="w-full text-left text-xs border border-gray-200 dark:border-slate-200">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-855 border-b border-gray-200 dark:border-slate-200 text-gray-700 dark:text-slate-350 font-bold uppercase">
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200">Product / Item Description</th>
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200 w-28">Batch No</th>
                        <th className="py-2 px-3 border-r border-gray-200 dark:border-slate-200 w-36">Serial Number</th>
                        <th className="py-2 px-3 text-center w-28">Quantity (Unit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items.map((item, idx) => (
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
                          <td className="py-2.5 px-3 text-center font-semibold font-mono">
                            {item.qty} {item.unit}
                          </td>
                        </tr>
                      ))}
                      {/* Total Qty Row */}
                      <tr className="bg-slate-50 dark:bg-slate-850 font-bold border-t border-gray-300 dark:border-slate-200">
                        <td colSpan="3" className="py-3 px-3 text-right uppercase">Total Transfer Quantity:</td>
                        <td className="py-3 px-3 text-center font-mono">{selectedTransfer.totalQty} Units</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Reason and Remarks */}
                <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-gray-700 dark:text-slate-350">
                  <div>
                    <div className="font-bold">Reason for Transfer:</div>
                    <p className="mt-1 bg-gray-50 dark:bg-slate-850 p-2 rounded border dark:border-slate-200 italic">{selectedTransfer.reason}</p>
                  </div>
                  <div>
                    <div className="font-bold">Shipping / Vehicle Remarks:</div>
                    <p className="mt-1 bg-gray-50 dark:bg-slate-850 p-2 rounded border dark:border-slate-200">{selectedTransfer.remarks}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 text-center text-xs">
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Dispatcher Sign</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Receiver (Store Keeper)</div>
                  </div>
                  <div>
                    <div className="border-b border-gray-300 dark:border-slate-200 pb-1 mx-4"></div>
                    <div className="text-gray-500 mt-2 font-medium">Authorized Sign</div>
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
                Print Challan
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
          body:not(.voucher-modal-open) th:nth-child(10),
          body:not(.voucher-modal-open) td:nth-child(10),
          body:not(.voucher-modal-open) th:nth-child(11),
          body:not(.voucher-modal-open) td:nth-child(11) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TransferList;
