import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, Printer, Plus, Trash2, Eye, Edit, FileText, CheckCircle, Upload, FileDown } from 'lucide-react';
import api from '../../api';

const CreditNoteList = () => {
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const fetchCreditNotes = async () => {
    try {
      const res = await api.get('/credit-notes');
      setCreditNotes(res.data?.data || []);
      addLog("Credit Notes loaded from backend.");
    } catch (err) {
      console.error(err);
      addLog("Failed to load credit notes.");
    }
  };

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const handleDelete = async (id, no) => {
    if (window.confirm(`Are you sure you want to delete Credit Note ${no}?`)) {
      try {
        await api.delete(`/credit-notes/${id}`);
        setCreditNotes(prev => prev.filter(item => item._id !== id));
        addLog(`Deleted Credit Note ${no}`);
      } catch (err) {
        addLog(`Failed to delete Credit Note ${no}`);
      }
    }
  };

  const handleExportCSV = () => {
    addLog("Exporting credit notes registry to CSV...");
    const headers = ['Credit Note ID', 'Customer Name', 'Original Invoice', 'Date', 'Amount (₹)', 'Tax (₹)', 'Total Amount (₹)', 'Reason', 'Status'];
    const rows = creditNotes.map(item => {
      const taxAmount = (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
      return [
        item.creditNoteNo,
        item.customer,
        item.originalInvoiceNo,
        item.date,
        item.summary?.subTotal || 0,
        taxAmount,
        item.summary?.grandTotal || 0,
        item.remarks,
        item.status
      ];
    });
    const csvContent = [headers.join(',') + '\n' + '1001,Sample Name,Sample,2023-12-01,100,Sample,100,Sample,Yes', ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `credit_notes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Credit notes CSV exported.");
  };

  const handleDownloadSample = () => {
    const headers = ['Credit Note ID', 'Customer Name', 'Original Invoice', 'Date', 'Amount', 'Tax', 'Total Amount', 'Reason', 'Status'];
    const csvContent = headers.join(',') + '\n' + '1001,Sample Name,Sample,2023-12-01,100,Sample,100,Sample,Yes' + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'credit_notes_sample.csv');
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

        const creditNoteNo = columns[0] || `CN-IMP-${Date.now()}-${i}`;
        const customer = columns[1] || 'Imported Customer';
        const originalInvoiceNo = columns[2] || '';
        const date = columns[3] || new Date().toISOString().split('T')[0];
        const subTotal = Number(columns[4]) || 0;
        const taxAmount = Number(columns[5]) || 0;
        const grandTotal = Number(columns[6]) || (subTotal + taxAmount);
        const remarks = columns[7] || 'Imported Credit Note';
        const status = columns[8] || 'Draft';

        newEntries.push({
          creditNoteNo,
          customer,
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
        alert('No valid credit notes found in the file.');
        return;
      }

      try {
        addLog(`Importing ${newEntries.length} credit notes...`);
        const res = await api.post('/credit-notes/import', newEntries);
        if (res.data?.success) {
          fetchCreditNotes();
          alert(`Successfully imported ${res.data.count || res.data.data?.length} credit notes!`);
          addLog(`Success: Imported ${res.data.count || res.data.data?.length} credit notes.`);
        }
      } catch (error) {
        console.error("Failed to import", error);
        alert('Failed to import credit notes. Some might be duplicates or invalid.');
        addLog("Error: Failed to import credit notes.");
      }

      e.target.value = '';
    };

    reader.readAsText(file);
  };

  const filtered = creditNotes.filter(d =>
    (d.creditNoteNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.originalInvoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Credit Notes Register</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Record and track sales returns, customer discounts, and price reductions.</p>
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
            to="/credit-note/new"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow transition-colors no-print"
          >
            <Plus size={14} /> New Credit Note
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
            placeholder="Search by ID, Customer name, or Invoice..."
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
                <th className="p-2 whitespace-nowrap">Credit Note ID</th>
                <th className="p-2 whitespace-nowrap">Customer</th>
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
              {filtered.length > 0 ? (
                filtered.map(d => {
                  const taxAmount = (d.cgst || 0) + (d.sgst || 0) + (d.igst || 0);
                  return (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{d.creditNoteNo}</td>
                      <td className="p-2 font-medium text-gray-800">{d.customer}</td>
                      <td className="p-2 font-mono text-gray-600">{d.originalInvoiceNo}</td>
                      <td className="p-2 text-gray-550 whitespace-nowrap">{d.date}</td>
                      <td className="p-2 text-right font-semibold text-slate-700">₹ {(d.summary?.subTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right font-medium text-red-655">₹ {taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">₹ {(d.summary?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-gray-600 italic max-w-[150px] truncate">{d.remarks}</td>
                      <td className="p-2 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${d.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-55 text-amber-800 border border-amber-200'
                          }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-2 text-center whitespace-nowrap space-x-1 no-print">
                        <button onClick={() => addLog(`Previewing Credit Note Voucher ${d.creditNoteNo}`)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => navigate(`/credit-note/edit/${d._id}`)} className="p-1 hover:bg-blue-50 rounded text-blue-600">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDelete(d._id, d.creditNoteNo)} className="p-1 hover:bg-red-55 rounded text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500 italic">No credit notes found matching parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-slate-805 mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
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
    </div>
  );
};

export default CreditNoteList;
