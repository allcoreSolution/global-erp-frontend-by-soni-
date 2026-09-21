import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ReceiptList = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/receipts');
      if (data.success) {
        setReceipts(data.data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await api.delete(`/receipts/${id}`);
        setReceipts(prev => prev.filter(r => r._id !== id));
        addLog(`Deleted receipt: ${id}`);
      } catch (error) {
        console.error('Error deleting receipt:', error);
        addLog(`Error deleting receipt: ${id}`);
      }
    }
  };

  const filtered = receipts.filter(r =>
    (r.customerParty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.referenceInvoice || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    addLog("Exporting receipts transactions to CSV format...");
    const headers = ['Receipt ID', 'Customer Name', 'Invoice Ref', 'Amount (₹)', 'Date', 'Payment Mode', 'Ref No', 'Advance'];
    const rows = receipts.map(r => [
      r.receiptNo,
      `"${(r.customerParty || '').replace(/"/g, '""')}"`,
      r.referenceInvoice,
      r.paymentAmount,
      r.receiptDate,
      r.paymentMethod,
      r.transactionRef,
      r.receiptType
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `receipts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Receipt transactions CSV downloaded.");
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addLog(`Reading file "${file.name}"...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newReceipts = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8) {
            newReceipts.push({
              id: cols[0] || `RCT-NEW-${Date.now()}-${i}`,
              customerName: cols[1] || 'Imported Customer',
              invoiceNo: cols[2] || 'N/A',
              amount: Number(cols[3]) || 0,
              date: cols[4] || '',
              mode: cols[5] || 'Cash',
              refNo: cols[6] || '',
              advance: cols[7] === 'Yes' ? true : false
            });
          }
        }
        if (newReceipts.length > 0) {
          setReceipts(prev => [...prev, ...newReceipts]);
          addLog(`Success: Parsed ${newReceipts.length} new receipt vouchers!`);
          alert(`Successfully imported ${newReceipts.length} receipts!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Import failed. Headers should match: Receipt ID, Customer Name, Invoice Ref, Amount, Date, Payment Mode, Ref No, Advance");
        }
      } catch (err) {
        addLog("Error: Failed to parse CSV correctly.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintReport = () => {
    addLog("Spooling print system dialog...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="receipt-list-import-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Receipts Registry Logs</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter matrices, import bulk data logs, export directories, and print transaction vouchers.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire customer receipt vouchers and settlement details to a local CSV.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple receipt clearances instantly.</p>
          </div>
          <button onClick={() => document.getElementById('receipt-list-import-csv').click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered receipts directories directly to the printer or save as PDF.</p>
          </div>
          <button onClick={handlePrintReport} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Print / PDF Page
          </button>
        </div>
      </div>

      {/* Search demonstration */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters Testing Matrix</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Customer Name, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="block w-full overflow-x-auto w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Receipt ID</th>
                <th className="p-2 whitespace-nowrap">Customer Name</th>
                <th className="p-2 whitespace-nowrap">Invoice Ref</th>
                <th className="p-2 whitespace-nowrap text-right">Amount (₹)</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap">Mode</th>
                <th className="p-2 whitespace-nowrap">Ref No</th>
                <th className="p-2 whitespace-nowrap text-center">Type</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">Loading receipts...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">No receipts found.</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{r.receiptNo}</td>
                    <td className="p-2 font-medium text-gray-900">{r.customerParty || '-'}</td>
                    <td className="p-2 text-gray-650">{r.referenceInvoice || '-'}</td>
                    <td className="p-2 text-right font-bold text-emerald-600">₹ {(r.paymentAmount || 0).toLocaleString()}</td>
                    <td className="p-2 text-gray-500 whitespace-nowrap">{r.receiptDate}</td>
                    <td className="p-2 text-gray-600">{r.paymentMethod}</td>
                    <td className="p-2 font-mono text-gray-550">{r.transactionRef || '-'}</td>
                    <td className="p-2 text-center">
                      <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-blue-100 text-blue-700">
                        {r.receiptType}
                      </span>
                    </td>
                    <td className="p-2 text-center no-print flex justify-center items-center gap-2">
                      <button onClick={() => navigate(`/receipt/edit/${r._id}`)} className="p-1 hover:bg-indigo-50 rounded text-indigo-600">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-slate-850 mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-600" /> Utility Console Log
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 h-28 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className="text-slate-700">{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No operations recorded yet. Click one of the operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptList;
