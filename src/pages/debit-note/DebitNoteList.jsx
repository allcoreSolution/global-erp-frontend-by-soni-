import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, Printer, Plus, Trash2, Eye, Edit, FileText, CheckCircle, Upload, FileDown } from 'lucide-react';
import api from '../../api';

const DebitNoteList = () => {
  const navigate = useNavigate();
  const [debitNotes, setDebitNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalData, setViewModalData] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const fetchDebitNotes = async () => {
    try {
      const res = await api.get('/debit-notes');
      setDebitNotes(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch debit notes", err);
      addLog("Error fetching debit notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebitNotes();
  }, []);

  const handleDelete = async (id, debitNoteNo) => {
    if (window.confirm(`Are you sure you want to delete Debit Note ${debitNoteNo}?`)) {
      try {
        await api.delete(`/debit-notes/${id}`);
        setDebitNotes(prev => prev.filter(item => item._id !== id));
        addLog(`Deleted Debit Note ${debitNoteNo}`);
      } catch (err) {
        console.error("Error deleting", err);
        addLog(`Failed to delete Debit Note ${debitNoteNo}`);
      }
    }
  };

  const handleExportCSV = () => {
    addLog("Exporting debit notes registry to CSV...");
    const headers = ['Debit Note ID', 'Supplier Name', 'Original Invoice', 'Date', 'Amount (₹)', 'Tax (₹)', 'Total Amount (₹)', 'Reason', 'Status'];
    const rows = debitNotes.map(item => [
      item.debitNoteNo,
      item.supplier,
      item.originalInvoiceNo,
      item.date,
      item.summary?.subTotal || 0,
      (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0),
      item.summary?.grandTotal || 0,
      item.remarks,
      item.status
    ]);
    const csvContent = [headers.join(',') + '\n' + '1001,Sample Name,Sample,2023-12-01,100,Sample,100,Sample,Yes', ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `debit_notes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Debit notes CSV exported.");
  };

  const handleDownloadSample = () => {
    const headers = ['Debit Note ID', 'Supplier Name', 'Original Invoice', 'Date', 'Amount', 'Tax', 'Total Amount', 'Reason', 'Status'];
    const csvContent = headers.join(',') + '\n' + '1001,Sample Name,Sample,2023-12-01,100,Sample,100,Sample,Yes' + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'debit_notes_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Sample file downloaded.");
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

      const newEntries = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 4) continue; 

        const debitNoteNo = columns[0] || `DN-IMP-${Date.now()}-${i}`;
        const supplier = columns[1] || 'Imported Supplier';
        const originalInvoiceNo = columns[2] || '';
        const date = columns[3] || new Date().toISOString().split('T')[0];
        const subTotal = Number(columns[4]) || 0;
        const taxAmount = Number(columns[5]) || 0;
        const grandTotal = Number(columns[6]) || (subTotal + taxAmount);
        const remarks = columns[7] || 'Imported Debit Note';
        const status = columns[8] || 'Draft';

        newEntries.push({
          debitNoteNo,
          supplier,
          originalInvoiceNo,
          date,
          remarks,
          status,
          summary: {
            subTotal,
            grandTotal
          },
          cgst: taxAmount / 2, // Assuming split for simple import
          sgst: taxAmount / 2,
          igst: 0,
          items: [
            { product: 'Imported Item', qty: 1, rate: subTotal, amount: subTotal }
          ]
        });
      }

      if (newEntries.length === 0) {
        alert('No valid debit notes found in the file.');
        return;
      }

      try {
        addLog(`Importing ${newEntries.length} debit notes...`);
        const res = await api.post('/debit-notes/import', newEntries);
        if (res.data?.success) {
          fetchDebitNotes();
          alert(`Successfully imported ${res.data.count || res.data.data?.length} debit notes!`);
          addLog(`Success: Imported ${res.data.count || res.data.data?.length} debit notes.`);
        }
      } catch (error) {
        console.error("Failed to import", error);
        alert('Failed to import debit notes. Some might be duplicates or invalid.');
        addLog("Error: Failed to import debit notes.");
      }
      
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  const filtered = debitNotes.filter(d =>
    (d.debitNoteNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.originalInvoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Debit Notes Register</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Record and track purchase returns, rate corrections, and price differences with suppliers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          {/* Import CSV */}
          <label className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer">
            <Upload size={14} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          {/* Sample CSV */}
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer"
          >
            <FileDown size={14} />
            Sample File
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded shadow transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>

          <Link
            to="/debit-note/new"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow transition-colors no-print"
          >
            <Plus size={14} /> New Debit Note
          </Link>
        </div>
      </div>

      {/* Search Filters */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Supplier name, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table List */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Debit Note ID</th>
                <th className="p-2 whitespace-nowrap">Supplier</th>
                <th className="p-2 whitespace-nowrap">Original Invoice</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap text-right">Taxable Amount</th>
                <th className="p-2 whitespace-nowrap text-right">GST Tax</th>
                <th className="p-2 whitespace-nowrap text-right">Total Amount</th>
                <th className="p-2 whitespace-nowrap">Reason</th>
                <th className="p-2 whitespace-nowrap text-center">Status</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500 italic">Loading debit notes...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(d => {
                  const taxAmt = (d.cgst || 0) + (d.sgst || 0) + (d.igst || 0);
                  return (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{d.debitNoteNo}</td>
                    <td className="p-2 font-medium text-gray-800">{d.supplier}</td>
                    <td className="p-2 font-mono text-gray-600">{d.originalInvoiceNo}</td>
                    <td className="p-2 text-gray-550 whitespace-nowrap">{d.date}</td>
                    <td className="p-2 text-right font-semibold text-slate-700">₹ {(d.summary?.subTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-medium text-red-650">₹ {taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-bold text-emerald-700">₹ {(d.summary?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-gray-600 italic max-w-[150px] truncate">{d.remarks || d.type}</td>
                    <td className="p-2 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        d.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-55 text-amber-800 border border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-2 text-center whitespace-nowrap space-x-1 no-print">
                      <button onClick={() => setViewModalData(d)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => navigate(`/debit-note/edit/${d._id}`)} className="p-1 hover:bg-blue-50 rounded text-blue-600">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDelete(d._id, d.debitNoteNo)} className="p-1 hover:bg-red-55 rounded text-red-600">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500 italic">No debit notes found matching parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-slate-800 mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-600" /> Operations Logs
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 h-24 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className="text-slate-700">{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No actions recorded yet. Perform operations above.</div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col print:shadow-none print:max-w-none print:w-full print:h-auto print:overflow-visible">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 no-print">
              <h3 className="font-bold text-slate-800">Debit Note Voucher: {viewModalData.debitNoteNo}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-sm font-semibold flex items-center gap-1.5"><Printer size={14} /> Print</button>
                <button onClick={() => setViewModalData(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-xl font-black text-gray-800">DEBIT NOTE</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{viewModalData.debitNoteNo}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-600">Date:</span> {viewModalData.date}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-semibold text-gray-600">Status:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                        viewModalData.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>{viewModalData.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Supplier Details</h4>
                  <p className="font-bold text-gray-800">{viewModalData.supplier}</p>
                  <p className="text-sm text-gray-600 mt-1">Branch: {viewModalData.branch || 'HQ'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Invoice Reference</h4>
                  <p className="font-mono text-gray-800">{viewModalData.originalInvoiceNo}</p>
                  <p className="text-sm text-gray-600 mt-1">Type: {viewModalData.type}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Item Details</h4>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 border-y text-slate-700">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Product</th>
                      <th className="py-2 px-3 font-semibold text-right">Quantity</th>
                      <th className="py-2 px-3 font-semibold text-right">Rate (₹)</th>
                      <th className="py-2 px-3 font-semibold text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b">
                    {(viewModalData.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-gray-800 font-medium">{item.product}</td>
                        <td className="py-2 px-3 text-right">{item.qty}</td>
                        <td className="py-2 px-3 text-right">{(item.rate || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-semibold">{(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {(!viewModalData.items || viewModalData.items.length === 0) && (
                      <tr><td colSpan="4" className="py-4 text-center text-gray-500 italic">No items found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start">
                <div className="w-1/2 pr-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Remarks</h4>
                  <p className="text-sm text-gray-600 italic bg-amber-50 p-3 rounded border border-amber-100">{viewModalData.remarks || 'No remarks provided.'}</p>
                </div>
                
                <div className="w-1/2 bg-slate-50 p-4 rounded border">
                  <div className="flex justify-between text-sm py-1 border-b border-dashed">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹ {(viewModalData.summary?.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-dashed">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">- ₹ {(viewModalData.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-dashed">
                    <span className="text-gray-600">CGST + SGST + IGST:</span>
                    <span className="text-gray-800">+ ₹ {((viewModalData.cgst || 0) + (viewModalData.sgst || 0) + (viewModalData.igst || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-dashed">
                    <span className="text-gray-600">Round Off:</span>
                    <span className="text-gray-800">₹ {(viewModalData.roundOff || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg py-2 mt-2 border-t font-black">
                    <span className="text-gray-800">Grand Total:</span>
                    <span className="text-indigo-700">₹ {(viewModalData.summary?.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebitNoteList;
