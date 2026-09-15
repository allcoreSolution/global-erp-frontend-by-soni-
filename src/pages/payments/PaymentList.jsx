import React, { useState } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2 } from 'lucide-react';

const PaymentList = () => {
  const [payments, setPayments] = useState([
    { id: 'PMT-001', supplierName: 'Rathi Steel Traders Ltd', invoiceNo: 'PINV-2024-001', amount: 45000, date: '2024-05-10', mode: 'Bank Transfer', refNo: 'TXN88990', advance: false },
    { id: 'PMT-002', supplierName: 'Saraswati Plastics', invoiceNo: 'PINV-2024-002', amount: 15000, date: '2024-05-14', mode: 'Cheque', refNo: 'CHQ00123', advance: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete payment ${id}?`)) {
      setPayments(prev => prev.filter(p => p.id !== id));
      addLog(`Deleted payment record ${id}`);
    }
  };

  const filtered = payments.filter(p =>
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    addLog("Exporting payments registers logs to CSV...");
    const headers = ['Payment ID', 'Supplier Name', 'Invoice Ref', 'Amount (₹)', 'Date', 'Payment Mode', 'Ref No', 'Advance'];
    const rows = payments.map(p => [
      p.id,
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.invoiceNo,
      p.amount,
      p.date,
      p.mode,
      p.refNo,
      p.advance ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Payments CSV file downloaded.");
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
        const newPayments = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8) {
            newPayments.push({
              id: cols[0] || `PMT-NEW-${Date.now()}-${i}`,
              supplierName: cols[1] || 'Imported Supplier',
              invoiceNo: cols[2] || 'N/A',
              amount: Number(cols[3]) || 0,
              date: cols[4] || '',
              mode: cols[5] || 'Cash',
              refNo: cols[6] || '',
              advance: cols[7] === 'Yes' ? true : false
            });
          }
        }
        if (newPayments.length > 0) {
          setPayments(prev => [...prev, ...newPayments]);
          addLog(`Success: Parsed ${newPayments.length} new payment records!`);
          alert(`Successfully imported ${newPayments.length} payments!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Import failed. Headers should match: Payment ID, Supplier Name, Invoice Ref, Amount, Date, Payment Mode, Ref No, Advance");
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
        id="payment-list-import-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Payments Registry Logs</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter matrices, import bulk data logs, export directories, and print purchase payment vouchers.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire supplier payments and clearing registers to a local CSV.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple payments instantly.</p>
          </div>
          <button onClick={() => document.getElementById('payment-list-import-csv').click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered payments list directly to the printer or save as PDF.</p>
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
            placeholder="Search by ID, Supplier, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Payment ID</th>
                <th className="p-2 whitespace-nowrap">Supplier Name</th>
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
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.id}</td>
                  <td className="p-2 font-medium text-gray-900">{p.supplierName}</td>
                  <td className="p-2 text-gray-650">{p.invoiceNo}</td>
                  <td className="p-2 text-right font-bold text-rose-600">₹ {p.amount.toLocaleString()}</td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">{p.date}</td>
                  <td className="p-2 text-gray-600">{p.mode}</td>
                  <td className="p-2 font-mono text-gray-550">{p.refNo}</td>
                  <td className="p-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${p.advance ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.advance ? 'Advance' : 'Invoice Adj'}
                    </span>
                  </td>
                  <td className="p-2 text-center no-print">
                    <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
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

export default PaymentList;
