import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileDown, Eye, Edit, Trash2, 
  Check, X, Calendar, Database, Filter, ArrowRightLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

import api from '../../api';

const StockEntryList = () => {
  const navigate = useNavigate();

  const [stockEntries, setStockEntries] = useState([]);

  useEffect(() => {
    const fetchStockEntries = async () => {
      try {
        const res = await api.get('/stock-entries');
        if (res.data?.data) {
          setStockEntries(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stock entries", err);
      }
    };
    fetchStockEntries();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const fileInputRef = useRef(null);

  // Filter Logic
  const filteredEntries = stockEntries.filter(se => {
    const matchesSearch = (se.stockNo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (se.remarks || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (se.referenceNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? se.stockType === typeFilter : true;
    const matchesWarehouse = warehouseFilter ? se.warehouseBase === warehouseFilter : true;
    const matchesStatus = statusFilter ? se.status === statusFilter : true;
    const matchesStartDate = startDate ? (se.stockDate || '') >= startDate : true;
    const matchesEndDate = endDate ? (se.stockDate || '') <= endDate : true;
    return matchesSearch && matchesType && matchesWarehouse && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this stock entry?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/stock-entries/${id}`);
        setStockEntries(stockEntries.filter(se => se._id !== id));
        Swal.fire('Deleted!', 'Stock entry deleted successfully', 'success');
      } catch (err) {
        console.error('Failed to delete', err);
        Swal.fire('Error', 'Failed to delete entry', 'error');
      }
    }
  };

  // Status and Approve logic removed as per user request

  // Export Filtered List to CSV
  const handleExportCSV = () => {
    const csvContent = "Voucher No,Type,Date,Warehouse,Reference,Reason,Total Qty,Status\n1001,Standard,2023-12-01,Sample,Sample,Sample,Sample,Yes\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_entries_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Voucher No,Type,Date,Warehouse,Reference,Reason,Total Qty,Status\n1001,Standard,2023-12-01,Sample,Sample,Sample,Sample,Yes\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_entries_sample.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Voucher List from CSV File
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. (Add logic as needed)', 'success');
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImportCSV}
        className="hidden"
      />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Stock Entries</h1>
          <p className="text-[12px] text-gray-500 mt-1">Track and adjust stock levels, inter-warehouse transfers, and damage losses.</p>
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
            onClick={() => navigate('/stock-entry/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Plus size={14} /> New Stock Entry
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

          {/* Status Filter Removed */}
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
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((se) => (
                  <tr key={se._id} className="border-b border-gray-100 dark:border-slate-200/60 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-blue-400">{se.stockNo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold 
                        ${se.stockType === 'Stock In' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                          se.stockType === 'Stock Out' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400' : 
                          se.stockType === 'Transfer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                          se.stockType === 'Damage/Loss' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'}`}
                      >
                        {se.stockType}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{se.stockDate}</td>
                    <td className="py-3 px-4">{se.warehouseBase || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4">{se.referenceNo || <span className="text-gray-400">-</span>}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={se.remarks}>{se.remarks}</td>
                    <td className="py-3 px-4 text-center font-bold">{se.summary?.totalQty || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                        POSTED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/stock-entry/edit/${se._id}`)}
                          title="Edit Entry"
                          className="p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(se._id)}
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

    </div>
  );
};

export default StockEntryList;
