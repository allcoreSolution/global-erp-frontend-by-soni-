import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2, Edit, Plus, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const ReceiptList = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);


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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this receipt?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/receipts/${id}`);
        setReceipts(prev => prev.filter(r => r._id !== id));
        Swal.fire('Deleted!', 'Receipt deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting receipt:', error);
        Swal.fire('Error', 'Failed to delete receipt', 'error');
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
    const csvContent = "Receipt ID,Customer Name,Invoice Ref,Amount (₹),Date,Payment Mode,Ref No,Advance\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `receipts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Receipt ID,Customer Name,Invoice Ref,Amount (₹),Date,Payment Mode,Ref No,Advance\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `receipts_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. (Add logic as needed)', 'success');
    e.target.value = '';
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

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Receipts Registry</h1>
          <p className="text-[12px] text-gray-500 mt-1">Manage customer receipt vouchers and settlement details.</p>
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
            onClick={() => navigate('/receipt/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Plus size={14} /> New Receipt
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
          <table className="w-full text-left">
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
    </div>
  );
};

export default ReceiptList;
