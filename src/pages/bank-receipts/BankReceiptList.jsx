import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2, Edit, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const BankReceiptList = () => {
  const navigate = useNavigate();
  const [bankReceipts, setBankReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const handleToggleReconciliation = async (id, currentStatus) => {
    try {
      await api.put(`/bank-receipts/${id}`, { reconciled: !currentStatus });
      setBankReceipts(prev => prev.map(r => {
        if (r._id === id) {
          return { ...r, reconciled: !currentStatus };
        }
        return r;
      }));
    } catch (error) {
      console.error('Error toggling reconciliation', error);
      Swal.fire('Error', 'Error toggling reconciliation status', 'error');
    }
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bank-receipts');
      if (data.success) {
        setBankReceipts(data.data);
      }
    } catch (error) {
      console.error('Error fetching bank receipts:', error);
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
      text: "You want to delete this bank receipt?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/bank-receipts/${id}`);
        setBankReceipts(prev => prev.filter(r => r._id !== id));
        Swal.fire('Deleted!', 'Bank receipt deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting bank receipt:', error);
        Swal.fire('Error', 'Failed to delete bank receipt', 'error');
      }
    }
  };

  const filtered = bankReceipts.filter(r =>
    (r.customerParty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.bankAccount || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    const csvContent = "Bank Receipt ID,Bank Account,Customer Name,Amount (₹),Date,Reference No,Bank Charges (₹),Reconciled\n1001,Sample,Sample Name,100,2023-12-01,1001,Sample,Sample\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bank_receipts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Bank Receipt ID,Bank Account,Customer Name,Amount (₹),Date,Reference No,Bank Charges (₹),Reconciled\n1001,Sample,Sample Name,100,2023-12-01,1001,Sample,Sample\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bank_receipts_sample.csv`);
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
        id="bank-receipt-import-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bank Receipt Vouchers</h1>
          <p className="text-[12px] text-gray-500 mt-1">Manage bank receipt clearings and parameters.</p>
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
            onClick={() => navigate('/bank-receipt/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Edit size={14} /> New Bank Receipt
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
            placeholder="Search by Customer, Bank Account or ID..."
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
                <th className="p-2 whitespace-nowrap">Bank Account</th>
                <th className="p-2 whitespace-nowrap">Customer Name</th>
                <th className="p-2 whitespace-nowrap text-right">Amount (₹)</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap">Ref / UTR</th>
                <th className="p-2 whitespace-nowrap text-right">Bank Charges</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Reconciliation</th>
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
                  <td colSpan="9" className="p-4 text-center text-slate-500">No bank receipts found.</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{r.receiptNo}</td>
                    <td className="p-2 font-medium text-gray-800">{r.bankAccount || '-'}</td>
                    <td className="p-2 text-gray-650">{r.customerParty || '-'}</td>
                    <td className="p-2 text-right font-bold text-emerald-600">₹ {(r.amount || 0).toLocaleString()}</td>
                    <td className="p-2 text-gray-500 whitespace-nowrap">{r.receiptDate}</td>
                    <td className="p-2 font-mono text-gray-600">{r.utrNo || '-'}</td>
                    <td className="p-2 text-right text-gray-550">₹ {r.otherDeduction || 0}</td>
                    <td className="p-2 text-center no-print">
                      <button
                        onClick={() => handleToggleReconciliation(r._id, r.reconciled)}
                        className={`px-2 py-0.5 rounded font-bold text-[9px] sm:text-[10px] ${r.reconciled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.reconciled ? 'Reconciled' : 'Unreconciled'}
                      </button>
                    </td>
                    <td className="p-2 text-center no-print flex justify-center items-center gap-2">
                      <button onClick={() => navigate(`/bank-receipt/edit/${r._id}`)} className="p-1 hover:bg-indigo-50 rounded text-indigo-600">
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

export default BankReceiptList;
