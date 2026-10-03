import React, { useState } from 'react';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar, FileSpreadsheet 
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const StockCount = () => {
  // State for Stock Count Records
  const [counts, setCounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(null);

  // Database States
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [countTypes, setCountTypes] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, whRes, catRes, brandRes, countTypeRes, stockCountsRes] = await Promise.all([
          api.get('/branches'),
          api.get('/catalogs/warehouses'),
          api.get('/products/categories'),
          api.get('/products/brands'),
          api.get('/count-types').catch(() => ({ data: { data: [] } })),
          api.get('/products/stock-counts')
        ]);
        if (branchRes.data?.data) setBranches(branchRes.data.data);
        if (whRes.data?.data) setWarehouses(whRes.data.data);
        if (catRes.data?.data) setCategories(catRes.data.data);
        if (brandRes.data?.data) setBrands(brandRes.data.data);
        if (countTypeRes.data?.data) setCountTypes(countTypeRes.data.data);
        if (stockCountsRes.data?.success) setCounts(stockCountsRes.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Form State for Add Count
  const [countForm, setCountForm] = useState({
    date: '',
    company: '',
    branch: '',
    warehouse: '',
    rack: '',
    type: 'Full Stock Count',
    countedBy: '',
    verifiedBy: '',
    countingDateTime: '',
    remarks: '',
  });

  // Handle Search Filter (Reference, Warehouse, Category, Brand, Type)
  const filteredCounts = counts.filter(c => {
    const s = searchTerm.toLowerCase();
    const ref = c.reference || '';
    const wh = c.warehouse || '';
    const typ = c.type || '';
    return ref.toLowerCase().includes(s) ||
           wh.toLowerCase().includes(s) ||
           typ.toLowerCase().includes(s);
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCounts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCounts.length / recordsPerPage);

  // View modal detail open
  const handleOpenViewModal = (count) => {
    setSelectedCount(count);
    setIsViewModalOpen(true);
  };

  // Edit log mockup trigger
  const handleEditCount = (count) => {
    alert(`Editing Stock Count reference: ${count.reference}`);
  };

  // Delete count record
  const handleDeleteCount = (id) => {
    if (window.confirm("Are you sure you want to delete this stock count log?")) {
      setCounts(counts.filter(c => c.id !== id));
    }
  };

  // Form Submit (Add Stock Count)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: counts.length + 1,
      date: new Date().toISOString().split('T')[0],
      reference: `STK-009${Math.floor(10 + Math.random() * 90)}`,
      warehouse: countForm.warehouse,
      category: countForm.category,
      brand: countForm.brand,
      type: countForm.type,
      initialFile: countForm.initialFile || 'initial_empty.xlsx',
      finalFile: countForm.finalFile || 'final_empty.xlsx'
    };
    setCounts([...counts, newRecord]);
    setIsAddModalOpen(false);
  };

  // File Download simulation
  const handleDownloadFile = (fileName) => {
    alert(`Downloading stock spreadsheet template: ${fileName}`);
  };

  // Toolbar Actions
  const handleExport = () => {
    if (counts.length === 0) {
      Swal.fire('No Data', 'No data available to export.', 'warning');
      return;
    }
    const headers = ['Date', 'Reference', 'Warehouse', 'Category', 'Brand', 'Type', 'Initial File', 'Final File'];
    const rows = counts.map(item => [
      `"${item.date || ''}"`,
      `"${item.reference || ''}"`,
      `"${item.warehouse || ''}"`,
      `"${item.category || ''}"`,
      `"${item.brand || ''}"`,
      `"${item.type || ''}"`,
      `"${item.initialFile || ''}"`,
      `"${item.finalFile || ''}"`
    ]);
    const csvContent = [headers.join(',') + '\n' + '2023-12-01,Sample,Sample,General,Sample,Standard,Sample,Sample', ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'StockCount.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Date', 'Reference', 'Warehouse', 'Category', 'Brand', 'Type', 'Initial File', 'Final File'];
    const csvContent = headers.join('\n'); // Just headers
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'StockCount_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
        const importedData = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(val => val.replace(/(^"|"$)/g, '').trim());
          return {
            id: Date.now() + index,
            date: values[0] || '',
            reference: values[1] || '',
            warehouse: values[2] || '',
            category: values[3] || '',
            brand: values[4] || '',
            type: values[5] || '',
            initialFile: values[6] || '',
            finalFile: values[7] || ''
          };
        });
        setCounts(prev => [...prev, ...importedData]);
        Swal.fire('Success', 'Stock count records imported successfully!', 'success');
      } else {
        Swal.fire('Error', 'File contains no data.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Stock Count</h1>
          <p className="text-sm text-gray-600">Perform stocktake counts, compare initial sheets against physical final sheets.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input for import */}
          <input 
            type="file" 
            accept=".csv" 
            id="import-csv" 
            className="hidden" 
            onChange={handleImport} 
          />
          <label 
            htmlFor="import-csv"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload size={14} /> Import
          </label>
          <button 
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <FileText size={14} /> Sample
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Count Stock
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Records per page:</span>
          <select 
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference/warehouse/type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Warehouse</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Brand</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Type</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Initial File</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Final File</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {isLoading ? (
              <tr><td colSpan="9" className="text-center py-4 text-gray-500">Loading stock counts...</td></tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50/70 transition-colors">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  {/* Reference */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.reference}
                  </td>
                  {/* Warehouse */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.warehouse}
                  </td>
                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.category || 'N/A'}
                  </td>
                  {/* Brand */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.brand || 'N/A'}
                  </td>
                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                      item.type === 'Full Count' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  {/* Initial File */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleDownloadFile(item.initialFile)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-blue-800 hover:underline"
                    >
                      <FileSpreadsheet size={14} />
                      <span className="truncate max-w-[120px]">{item.initialFile || 'N/A'}</span>
                    </button>
                  </td>
                  {/* Final File */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleDownloadFile(item.finalFile)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-blue-800 hover:underline"
                    >
                      <FileSpreadsheet size={14} />
                      <span className="truncate max-w-[120px]">{item.finalFile || 'N/A'}</span>
                    </button>
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(item)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleEditCount(item)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit stock count"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteCount(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No stock count records found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredCounts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCounts.length)} of {filteredCounts.length} records
          </div>

          <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* --- ADD COUNT STOCK DIALOG MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-4xl w-full p-6 relative text-black max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Create Stock Count
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* 1. Stock Count Information */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">1. Stock Count Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Stock Count No.</label>
                    <input 
                      type="text"
                      disabled
                      placeholder="Auto Generated"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Count Date *</label>
                    <input 
                      type="date"
                      required
                      value={countForm.date || ''}
                      onChange={(e) => setCountForm({ ...countForm, date: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Branch *</label>
                    <select
                      required
                      value={countForm.branch || ''}
                      onChange={(e) => setCountForm({ ...countForm, branch: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse *</label>
                    <select
                      required
                      value={countForm.warehouse || ''}
                      onChange={(e) => setCountForm({ ...countForm, warehouse: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(w => (
                        <option key={w._id} value={w._id}>{w.warehouseName || w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Stock Location / Rack</label>
                    <input 
                      type="text"
                      placeholder="e.g. Rack A1"
                      value={countForm.rack || ''}
                      onChange={(e) => setCountForm({ ...countForm, rack: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Count Type *</label>
                    <select
                      required
                      value={countForm.type || ''}
                      onChange={(e) => setCountForm({ ...countForm, type: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    >
                      <option value="">Select Count Type</option>
                      {countTypes.map(ct => (
                        <option key={ct._id} value={ct.name}>{ct.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Counting Team */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">2. Counting Team</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Counted By *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Employee Name"
                      value={countForm.countedBy || ''}
                      onChange={(e) => setCountForm({ ...countForm, countedBy: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Verified By</label>
                    <input 
                      type="text"
                      placeholder="Manager/Supervisor Name"
                      value={countForm.verifiedBy || ''}
                      onChange={(e) => setCountForm({ ...countForm, verifiedBy: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Counting Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={countForm.countingDateTime || ''}
                      onChange={(e) => setCountForm({ ...countForm, countingDateTime: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Remarks</label>
                    <textarea 
                      placeholder="Enter remarks..."
                      rows="2"
                      value={countForm.remarks || ''}
                      onChange={(e) => setCountForm({ ...countForm, remarks: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450 placeholder:text-gray-400"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 3. Product Selection */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">🔍 3. Product Selection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product Category</label>
                    <select className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450">
                      <option value="">All Categories</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.categoryName || c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand</label>
                    <select className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450">
                      <option value="">All Brands</option>
                      {brands.map(b => (
                        <option key={b._id} value={b._id}>{b.brandName || b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product</label>
                    <input type="text" placeholder="Search Product..." className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">SKU</label>
                    <input type="text" placeholder="Search SKU..." className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Batch</label>
                    <input type="text" placeholder="Search Batch..." className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse</label>
                    <select className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450">
                      <option value="">All Warehouses</option>
                      {warehouses.map(w => (
                        <option key={w._id} value={w._id}>{w.warehouseName || w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Rack/Bin</label>
                    <input type="text" placeholder="Rack/Bin..." className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 text-sm font-semibold shadow transition-colors flex items-center justify-center gap-2">
                      <Search size={16} /> Load Products
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow transition-colors"
                >
                  Create Stocktake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW COUNT DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedCount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Stocktake Count Details
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Reference No:</span>
                <span className="font-bold text-gray-900">{selectedCount.reference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Stocktake Date:</span>
                <span className="text-gray-900">{selectedCount.date}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Warehouse:</span>
                <span className="text-gray-900 font-semibold">{selectedCount.warehouse}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Target Category:</span>
                <span className="text-gray-900">{selectedCount.category}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Target Brand:</span>
                <span className="text-gray-900">{selectedCount.brand}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Count Type:</span>
                <span className="font-bold text-indigo-700">{selectedCount.type}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Initial Sheet:</span>
                <span className="text-gray-800 font-mono text-xs">{selectedCount.initialFile}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Final Sheet:</span>
                <span className="text-gray-800 font-mono text-xs">{selectedCount.finalFile}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-500 mt-4">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-slate-800 rounded text-sm font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockCount;
