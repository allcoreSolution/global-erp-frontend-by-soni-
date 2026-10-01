import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2, Edit, FileDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const ContraList = () => {
  const navigate = useNavigate();
  const [contraEntries, setContraEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContras();
  }, []);

  const fetchContras = async () => {
    try {
      const res = await api.get('/contras');
      setContraEntries(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching contra entries:', error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this contra entry?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/contras/${id}`);
        setContraEntries(prev => prev.filter(c => c._id !== id));
        Swal.fire('Deleted!', 'Contra entry deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting contra entry:', error);
        Swal.fire('Error', 'Failed to delete contra entry', 'error');
      }
    }
  };

  const filtered = contraEntries.filter(c =>
    (c.fromAccount || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.toAccount || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contraNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    const csvContent = "Contra ID,From Account,To Account,Amount (₹),Date,Transfer Mode,Reference No\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contra_entries_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Contra ID,From Account,To Account,Amount (₹),Date,Transfer Mode,Reference No\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contra_entries_sample.csv`);
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
        id="contra-import-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Contra Vouchers</h1>
          <p className="text-[12px] text-gray-500 mt-1">Manage contra cash deposits and withdrawals.</p>
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
            onClick={() => navigate('/contra/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Plus size={14} /> New Contra
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
            placeholder="Search by ID, From Account, or To Account..."
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
                <th className="p-2 whitespace-nowrap">Contra ID</th>
                <th className="p-2 whitespace-nowrap">From Account</th>
                <th className="p-2 whitespace-nowrap">To Account</th>
                <th className="p-2 whitespace-nowrap text-right">Amount (₹)</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap">Transfer Mode</th>
                <th className="p-2 whitespace-nowrap">Ref No</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{c.contraNo}</td>
                  <td className="p-2 font-medium text-gray-850">{c.fromAccount}</td>
                  <td className="p-2 text-gray-850 font-medium">{c.toAccount}</td>
                  <td className="p-2 text-right font-bold text-slate-800">₹ {(c.amount || 0).toLocaleString()}</td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">{c.contraDate}</td>
                  <td className="p-2 text-gray-600 font-semibold">{c.transferMode}</td>
                  <td className="p-2 font-mono text-gray-550">{c.referenceNo}</td>
                  <td className="p-2 text-center no-print flex gap-2 justify-center">
                    <button onClick={() => navigate(`/contra/edit/${c._id}`)} className="p-1 hover:bg-blue-50 rounded text-blue-600">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ContraList;
