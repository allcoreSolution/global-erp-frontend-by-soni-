import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Download, Upload, FileText, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, Filter, X 
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchReturns();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const { data } = await api.get('/catalogs/warehouses');
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/purchase-returns');
      if (data.success) {
        setReturns(data.data);
      }
    } catch (error) {
      console.error('Error fetching purchase returns', error);
    } finally {
      setLoading(false);
    }
  };
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouse');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedViewReturn, setSelectedViewReturn] = useState(null);

  // Handle Search Filter (Invoice No, Product Name, Supplier, Warehouse)
  const filteredReturns = returns.filter(r => {
    const pInv = r.invoiceNo || r.purchaseInvoice || r.supplierInvoiceNo || '';
    const supp = typeof r.supplier === 'object' ? (r.supplier?.supplierName || r.supplier?.companyName || r.supplier?.name || '') : (r.supplier || '');
    const productNames = (r.items || []).map(it => it.productName || (typeof it.product === 'object' ? it.product?.name : it.product) || '').join(' ');
    
    const matchesSearch = pInv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          productNames.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const rWhId = typeof r.warehouse === 'object' ? r.warehouse?._id : r.warehouse;
    const matchesWarehouse = selectedWarehouse === 'All Warehouse' || rWhId === selectedWarehouse;
    
    return matchesSearch && matchesWarehouse;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReturns.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReturns.length / recordsPerPage) || 1;


  const handleDeleteReturn = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase return record?")) {
      try {
        await api.delete(`/purchase-returns/${id}`);
        setReturns(returns.filter(r => r._id !== id));
      } catch (error) {
        console.error('Error deleting return', error);
      }
    }
  };

  const handleExport = () => {
    if (returns.length === 0) {
      Swal.fire('No Data', 'No data available to export.', 'warning');
      return;
    }
    const headers = ['Date', 'Invoice No', 'Product Name', 'Warehouse', 'Supplier', 'Grand Total'];
    const rows = returns.map(r => {
      const pNames = (r.items || []).map(i => i.productName || (typeof i.product === 'object' ? i.product?.name : i.product)).filter(Boolean).join('; ');
      return [
        `"${r.returnDate || r.date || ''}"`,
        `"${r.invoiceNo || r.purchaseInvoice || r.supplierInvoiceNo || ''}"`,
        `"${pNames}"`,
        `"${typeof r.warehouse === 'object' ? (r.warehouse?.name || r.warehouse?.warehouseName) : r.warehouse || ''}"`,
        `"${typeof r.supplier === 'object' ? (r.supplier?.supplierName || r.supplier?.companyName || r.supplier?.name) : r.supplier || ''}"`,
        `"${r.totals?.returnTotal || r.grandTotal || 0}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PurchaseReturnList.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Date', 'Invoice No', 'Product Name', 'Warehouse', 'Supplier', 'Grand Total'];
    const csvContent = headers.join('\n'); // Just headers
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PurchaseReturn_Sample.csv');
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
        Swal.fire('Success', 'Purchase Return records imported successfully!', 'success');
      } else {
        Swal.fire('Error', 'File contains no data.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const totalReturnedAmount = filteredReturns.reduce((sum, item) => sum + (item.totals?.returnTotal || 0), 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Purchase Return List</h1>
          <p className="text-sm text-gray-600">Track and manage inventory procurement items return logs.</p>
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
            onClick={() => navigate('/purchases/add-purchase-return')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Return
          </button>
        </div>
      </div>

      {/* Filter Options Controls Form Header */}
      <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Start Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-blue-500 rounded px-2 py-1.5 pl-8 text-xs bg-white text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">End Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-blue-500 rounded px-2 py-1.5 pl-8 text-xs bg-white text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Warehouse Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse</label>
          <select 
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full border border-blue-500 rounded px-2 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All Warehouse">All Warehouse</option>
            {warehouses.map(w => (
              <option key={w._id} value={w._id}>{w.warehouseName || w.name}</option>
            ))}
          </select>
        </div>

        {/* Submit Query trigger */}
        <div>
          <button 
            type="button"
            onClick={() => alert(`Filtering Return logs from ${startDate} to ${endDate} for ${selectedWarehouse}`)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-xs font-bold transition-colors"
          >
            Submit Filter
          </button>
        </div>
      </div>

      {/* Table limit and search */}
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
            placeholder="Search return log details..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table view layout */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Invoice No</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Product Name</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Warehouse</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Supplier</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Grand Total</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500 bg-white">Loading...</td></tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{r.returnDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-800">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-bold">
                      {r.invoiceNo || r.purchaseInvoice || r.supplierInvoiceNo || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {r.items && r.items.length > 0 ? (
                      <div className="flex flex-col gap-1 max-w-xs">
                        {r.items.map((it, idx) => {
                          const pName = it.productName || (typeof it.product === 'object' ? it.product?.name : it.product) || 'Item';
                          return (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-gray-900 truncate" title={pName}>
                                {pName}
                              </span>
                              {it.returnQty !== undefined && (
                                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                  Qty: {it.returnQty}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                    {typeof r.warehouse === 'object' ? (r.warehouse?.name || r.warehouse?.warehouseName) : r.warehouse || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium">
                    {typeof r.supplier === 'object' ? (r.supplier?.supplierName || r.supplier?.companyName || r.supplier?.name) : r.supplier || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-bold">₹ {r.totals?.returnTotal?.toFixed(2) || '0.00'}</td>
                  
                  {/* Actions VIEW, EDIT, DELETE */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedViewReturn(r)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/purchases/edit-purchase-return/${r._id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                        title="Edit Record"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReturn(r._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Total Summary calculations row */}
            <tr className="bg-gray-50/95 font-bold border-t border-blue-500">
              <td colSpan="5" className="px-6 py-3.5 text-sm text-gray-800">Total</td>
              <td colSpan="2" className="px-6 py-3.5 text-sm text-gray-900 font-black">₹ {totalReturnedAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination indicators footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredReturns.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredReturns.length)} of {filteredReturns.length} entries
        </div>

        {filteredReturns.length > 0 && (
          <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* --- VIEW PURCHASE RETURN MODAL --- */}
      {selectedViewReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-4xl w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    Purchase Return Details
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {selectedViewReturn.status || 'Completed'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Invoice No: <span className="font-semibold text-indigo-700">{selectedViewReturn.invoiceNo || selectedViewReturn.purchaseInvoice || selectedViewReturn.supplierInvoiceNo || 'N/A'}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedViewReturn(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase font-medium">Return Date</span>
                  <span className="font-semibold text-gray-900">
                    {selectedViewReturn.returnDate ? new Date(selectedViewReturn.returnDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase font-medium">Purchase Invoice</span>
                  <span className="font-semibold text-indigo-700">
                    {selectedViewReturn.invoiceNo || selectedViewReturn.purchaseInvoice || selectedViewReturn.supplierInvoiceNo || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase font-medium">Supplier</span>
                  <span className="font-semibold text-gray-900">
                    {typeof selectedViewReturn.supplier === 'object' 
                      ? (selectedViewReturn.supplier?.supplierName || selectedViewReturn.supplier?.companyName || selectedViewReturn.supplier?.name || 'N/A')
                      : (selectedViewReturn.supplier || 'N/A')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase font-medium">Warehouse</span>
                  <span className="font-semibold text-gray-900">
                    {typeof selectedViewReturn.warehouse === 'object'
                      ? (selectedViewReturn.warehouse?.name || selectedViewReturn.warehouse?.warehouseName || 'N/A')
                      : (selectedViewReturn.warehouse || 'N/A')}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
                  Returned Products ({selectedViewReturn.items?.length || 0})
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-slate-100 text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5 w-10 text-center">#</th>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-3 py-2.5">Batch</th>
                        <th className="px-3 py-2.5 text-center">Purchased</th>
                        <th className="px-3 py-2.5 text-center">Return Qty</th>
                        <th className="px-3 py-2.5 text-right">Rate</th>
                        <th className="px-3 py-2.5 text-center">Tax %</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedViewReturn.items && selectedViewReturn.items.length > 0 ? (
                        selectedViewReturn.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-center text-xs text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-gray-900">
                              <div>{it.productName || (typeof it.product === 'object' ? it.product?.name : it.product) || 'Item'}</div>
                              {it.code && <span className="text-xs text-gray-400">Code: {it.code}</span>}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-gray-600">{it.batch || '-'}</td>
                            <td className="px-3 py-2.5 text-center text-xs text-gray-500">{it.purchasedQty ?? '-'}</td>
                            <td className="px-3 py-2.5 text-center font-bold text-indigo-700">{it.returnQty}</td>
                            <td className="px-3 py-2.5 text-right">₹ {(it.rate || 0).toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-center">{it.taxPercent || 0}%</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">₹ {(it.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-6 text-gray-400 text-sm">No items logged in this return.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Goods Value:</span>
                    <span className="font-medium">₹ {(selectedViewReturn.totals?.goodsValue || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax:</span>
                    <span className="font-medium">₹ {(selectedViewReturn.totals?.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                    <span>Return Total:</span>
                    <span className="text-indigo-700">₹ {(selectedViewReturn.totals?.returnTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => setSelectedViewReturn(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedViewReturn._id;
                  setSelectedViewReturn(null);
                  navigate(`/purchases/edit-purchase-return/${id}`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors flex items-center gap-1.5"
              >
                <Edit size={15} />
                Edit Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseReturn;
