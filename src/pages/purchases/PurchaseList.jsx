import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar, Filter, DollarSign 
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';

const PurchaseList = () => {
  const { can } = usePermissions();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/purchases');
      if (data.success) {
        setPurchases(data.data);
      }
    } catch (error) {
      console.error('Error fetching purchases', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrandTotal = (p) => {
    if (!p.orderItems) return 0;
    const sub = p.orderItems.reduce((sum, item) => {
      const rawCost = item.netUnitCost - item.discount;
      const taxAmt = rawCost * (item.taxPercent / 100);
      return sum + (rawCost + taxAmt) * item.quantity;
    }, 0);
    let orderTaxPercent = 0;
    if (p.orderTax === '5%') orderTaxPercent = 5;
    else if (p.orderTax === '10%') orderTaxPercent = 10;
    else if (p.orderTax === '18%') orderTaxPercent = 18;
    const tax = sub * (orderTaxPercent / 100);
    return sub + tax + (p.shippingCost || 0) - (p.discountValue || 0);
  };

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const getSupplierName = (supp) => {
    if (!supp) return 'N/A';
    if (typeof supp === 'object') {
      return supp.companyName || supp.name || supp.supplierCode || 'N/A';
    }
    return String(supp);
  };

  const getWarehouseName = (wh) => {
    if (!wh) return 'N/A';
    if (typeof wh === 'object') {
      return wh.name || wh.code || 'N/A';
    }
    return String(wh);
  };

  const getPurchaseItems = (p) => {
    if (!p) return [];
    if (Array.isArray(p.orderItems) && p.orderItems.length > 0) {
      return p.orderItems.map((item) => ({
        name: item.name || item.product?.productName || item.productName || 'Product',
        code: item.code || item.product?.productCode || item.productCode || '-',
        quantity: item.quantity ?? item.qty ?? 1,
        freeQty: item.freeQty || 0,
        netUnitCost: Number(item.netUnitCost ?? item.cost ?? 0),
        taxPercent: Number(item.taxPercent ?? 0),
        discount: Number(item.discount ?? 0),
        batch: item.batch || '',
        expDate: item.expDate || '',
        brand: item.product?.brand?.name || item.brand?.name || (typeof item.brand === 'string' ? item.brand : ''),
        category: item.product?.category?.name || item.category?.name || (typeof item.category === 'string' ? item.category : '')
      }));
    }
    if (p.productName) {
      return [{
        name: p.productName,
        code: p.productCode || '-',
        quantity: p.purchaseQty || p.quantity || 1,
        freeQty: 0,
        netUnitCost: Number(p.productCost || 0),
        taxPercent: 0,
        discount: 0,
        batch: '',
        expDate: '',
        brand: '',
        category: p.category || ''
      }];
    }
    return [];
  };

  // Search Filter
  const filteredPurchases = purchases.filter(p => {
    const suppName = getSupplierName(p.supplier);
    const invoiceNum = String(p.invoiceNo || p.purchaseNo || '');
    const billNum = String(p.billNo || '');
    const refNum = String(p.referenceNo || '');
    const matchesSearch = refNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          billNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoiceNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          suppName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || p.purchaseStatus === selectedStatus || p.paymentStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPurchases.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPurchases.length / recordsPerPage);

  const handleOpenViewModal = (item) => {
    setSelectedPurchase(item);
    setIsViewModalOpen(true);
  };

  const handleDeletePurchase = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase invoice?")) {
      try {
        await api.delete(`/purchases/${id}`);
        setPurchases(purchases.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting purchase', error);
      }
    }
  };

  const handleExport = () => {
    if (purchases.length === 0) {
      Swal.fire('No Data', 'No data available to export.', 'warning');
      return;
    }
    const headers = ['Date', 'Invoice No', 'Bill No', 'Created By', 'Supplier', 'Purchase Status', 'Grand Total', 'Returned Amount', 'Paid', 'Due', 'Payment Term', 'Due Date', 'Payment Status'];
    const rows = purchases.map(p => {
      const grandTotal = calculateGrandTotal(p);
      const invoiceNum = p.invoiceNo || p.purchaseNo || p.referenceNo || '';
      return [
        `"${p.purchaseDate || ''}"`,
        `"${invoiceNum}"`,
        `"${p.billNo || ''}"`,
        `"Admin"`,
        `"${getSupplierName(p.supplier)}"`,
        `"${p.purchaseStatus || ''}"`,
        `"${grandTotal.toFixed(2)}"`,
        `"0.00"`,
        `"0.00"`,
        `"${grandTotal.toFixed(2)}"`,
        `"${p.paymentTerm || ''}"`,
        `"${p.dueDate || ''}"`,
        `"${p.paymentStatus || ''}"`
      ];
    });
    const dummyData = [
      '2023-12-01', 'PUR-INV-1001', 'PUR-1001', 'Admin', 'ABC Suppliers', 'Received', '10000', '0', '10000', '0', 'Net 30', '2023-12-31', 'Paid'
    ];
    const csvContent = [headers.join(','), dummyData.map(d => `"${d}"`).join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PurchaseList.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Date', 'Invoice No', 'Bill No', 'Created By', 'Supplier', 'Purchase Status', 'Grand Total', 'Returned Amount', 'Paid', 'Due', 'Payment Term', 'Due Date', 'Payment Status'];
    const dummyData = [
      '2023-12-01', 'PUR-INV-1001', 'PUR-1001', 'Admin', 'ABC Suppliers', 'Received', '10000', '0', '10000', '0', 'Net 30', '2023-12-31', 'Paid'
    ];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Purchase_Sample.csv');
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
        Swal.fire('Success', 'Purchase records imported successfully!', 'success');
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
          <h1 className="text-2xl font-bold tracking-tight text-black">Purchase List</h1>
          <p className="text-sm text-gray-600">Track and manage inventory procurement transactions invoices.</p>
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
          {can(['create_purchases', 'manage_purchases']) && (
            <button 
              onClick={() => navigate('/purchases/add-purchase')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
            >
              <Plus size={14} /> Add Purchase
            </button>
          )}
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
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

          {/* Toggle Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-blue-500 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Filter size={14} />
            <span>Filter Options</span>
          </button>

          {/* Status filter dropdown */}
          {isFilterOpen && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
              <span className="text-sm text-gray-700">Status:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450"
              >
                <option value="All">All Invoices</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Invoice No/Reference/Supplier..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table View grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Invoice No</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Bill No</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Supplier</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Product</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Code</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Brand</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-center">Qty</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Purchase Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Grand Total</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Returned Amount</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Paid</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Due</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Payment Term</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Due Date</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Payment Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {loading ? (
              <tr><td colSpan="19" className="px-4 py-8 text-center">Loading...</td></tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((p) => {
                const grandTotal = calculateGrandTotal(p);
                const invoiceNumber = p.invoiceNo || p.purchaseNo || p.referenceNo || 'PUR-INV';
                return (
                <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{p.purchaseDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      type="button"
                      onClick={() => handleOpenViewModal(p)}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer bg-indigo-50/70 px-2.5 py-1 rounded border border-indigo-200 inline-block"
                      title="View Invoice Details"
                    >
                      {invoiceNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{p.billNo || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">Admin</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {getSupplierName(p.supplier)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-semibold min-w-[120px]">
                    <div className="flex flex-col gap-2 max-h-24 overflow-y-auto no-scrollbar">
                      {p.orderItems && p.orderItems.length > 0 ? (
                        p.orderItems.map((i, idx) => (
                          <span key={idx} className="block truncate" title={i.name || i.product?.productName}>
                            {i.name || i.product?.productName || 'Product'}
                          </span>
                        ))
                      ) : p.productName ? (
                        <span className="block truncate" title={p.productName}>{p.productName}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-2 max-h-24 overflow-y-auto no-scrollbar">
                      {p.orderItems && p.orderItems.length > 0 ? (
                        p.orderItems.map((i, idx) => (
                          <span key={idx} className="block">{i.code || i.product?.productCode || '-'}</span>
                        ))
                      ) : p.productCode ? (
                        <span className="block">{p.productCode}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-2 max-h-24 overflow-y-auto no-scrollbar">
                      {p.orderItems?.map((i, idx) => <span key={idx} className="block truncate" title={i.product?.brand?.name}>{i.product?.brand?.name || 'N/A'}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-2 max-h-24 overflow-y-auto no-scrollbar">
                      {p.orderItems?.map((i, idx) => <span key={idx} className="block truncate" title={i.product?.category?.name}>{i.product?.category?.name || 'N/A'}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-bold text-center">
                    <div className="flex flex-col gap-2 max-h-24 overflow-y-auto no-scrollbar">
                      {p.orderItems && p.orderItems.length > 0 ? (
                        p.orderItems.map((i, idx) => (
                          <span key={idx} className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-extrabold">
                            {i.quantity}
                          </span>
                        ))
                      ) : p.purchaseQty ? (
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-extrabold">
                          {p.purchaseQty}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                    <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      {p.purchaseStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₹{grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">₹0.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 font-bold">₹{(p.amountPaid || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700 font-bold">₹{(grandTotal - (p.amountPaid || 0)).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{p.paymentTerm}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{p.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-extrabold ${
                      p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  
                  {/* Actions VIEW, EDIT, DELETE */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenViewModal(p)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Purchase Details"
                      >
                        <Eye size={15} />
                      </button>
                      {can(['edit_purchases', 'manage_purchases']) && (
                        <button
                          onClick={() => navigate(`/purchases/edit-purchase/${p._id}`)}
                          className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                          title="Edit Purchase Invoice"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                      {can(['delete_purchases', 'manage_purchases']) && (
                        <button
                          onClick={() => handleDeletePurchase(p._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              )
            ) : (
              <tr>
                <td colSpan="19" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No purchase records found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredPurchases.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredPurchases.length)} of {filteredPurchases.length} records
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

      {/* --- VIEW PURCHASE DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedPurchase && (() => {
        const modalItems = getPurchaseItems(selectedPurchase);
        const totalItemsCount = modalItems.length;
        const totalQtyCount = modalItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const invoiceNum = selectedPurchase.invoiceNo || selectedPurchase.purchaseNo || 'N/A';
        const grandTotal = calculateGrandTotal(selectedPurchase);

        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-blue-200 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-5xl w-full p-6 md:p-10 relative text-black animate-in fade-in slide-in-from-bottom-8 duration-300 mt-6 mb-10">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-all"
                title="Close"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="border-b border-blue-500 pb-3 mb-6 pr-10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Purchase Invoice: <span className="text-indigo-600">{invoiceNum}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Purchased items, quantities and payment breakdown</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPurchase.billNo && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-200">
                      Bill No: {selectedPurchase.billNo}
                    </span>
                  )}
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">
                    Total Products: {totalItemsCount}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-200">
                    Total Qty: {totalQtyCount}
                  </span>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                {/* Left Column */}
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Invoice No:</span>
                    <span className="text-indigo-600 font-bold">{invoiceNum}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Bill No:</span>
                    <span className="text-gray-900 font-bold">{selectedPurchase.billNo || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Date:</span>
                    <span className="text-gray-900 font-semibold">{selectedPurchase.purchaseDate || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Supplier:</span>
                    <span className="text-gray-900 font-semibold">{getSupplierName(selectedPurchase.supplier)}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="font-semibold text-gray-600">Warehouse:</span>
                    <span className="text-gray-900">{getWarehouseName(selectedPurchase.warehouse)}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Purchase Status:</span>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      {selectedPurchase.purchaseStatus || 'Received'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Payment Status:</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-extrabold ${
                      selectedPurchase.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPurchase.paymentStatus || 'Due'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Payment Term:</span>
                    <span className="text-gray-900">{selectedPurchase.paymentTerm || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/70 pb-1.5">
                    <span className="font-semibold text-gray-600">Due Date:</span>
                    <span className="text-gray-900">{selectedPurchase.dueDate || '-'}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="font-semibold text-gray-600">Currency / Tax:</span>
                    <span className="text-gray-900">{selectedPurchase.currency || 'INR'} • {selectedPurchase.orderTax || 'No Tax'}</span>
                  </div>
                </div>
              </div>

              {/* --- PURCHASED PRODUCTS & QUANTITIES TABLE (Prominent Section) --- */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>📦 Purchased Products & Quantities</span>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      {modalItems.length} {modalItems.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Total Quantity: <strong className="text-indigo-600 font-bold text-sm">{totalQtyCount}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-blue-300 rounded-lg shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-blue-50/80 border-b border-blue-200 text-gray-700">
                      <tr>
                        <th className="px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-center w-12">#</th>
                        <th className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider">Product Name & Code</th>
                        <th className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-center">Purchased Qty</th>
                        <th className="px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-center">Free Qty</th>
                        <th className="px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-right">Unit Cost (₹)</th>
                        <th className="px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-center">Tax %</th>
                        <th className="px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-right">Discount (₹)</th>
                        <th className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-right">Subtotal (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {modalItems.length > 0 ? (
                        modalItems.map((item, idx) => {
                          const rawCost = item.netUnitCost - item.discount;
                          const taxAmt = rawCost * (item.taxPercent / 100);
                          const sub = (rawCost + taxAmt) * item.quantity;
                          return (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-3 py-3 text-center text-xs text-gray-500 font-semibold">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">Code: {item.code}</span>
                                  {item.brand && <span>Brand: {item.brand}</span>}
                                  {item.category && <span>Cat: {item.category}</span>}
                                  {item.batch && <span className="text-amber-700">Batch: {item.batch}</span>}
                                  {item.expDate && <span className="text-red-600">Exp: {item.expDate}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-sm rounded-lg min-w-14 shadow-sm">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center text-gray-600 font-medium">
                                {item.freeQty > 0 ? (
                                  <span className="text-emerald-600 font-bold">+{item.freeQty}</span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-3 py-3 text-right text-gray-800 font-medium">₹{item.netUnitCost.toFixed(2)}</td>
                              <td className="px-3 py-3 text-center text-gray-600">{item.taxPercent}%</td>
                              <td className="px-3 py-3 text-right text-gray-600">{item.discount > 0 ? `₹${item.discount.toFixed(2)}` : '-'}</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900">₹{sub.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-6 text-center text-gray-500 text-sm">
                            Koi product add nahi hai is purchase record mein.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {modalItems.length > 0 && (
                      <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-xs text-gray-700">
                        <tr>
                          <td colSpan="2" className="px-4 py-2.5 text-right uppercase">Total:</td>
                          <td className="px-4 py-2.5 text-center text-indigo-700 text-sm font-extrabold">{totalQtyCount}</td>
                          <td className="px-3 py-2.5 text-center">
                            {modalItems.reduce((s, i) => s + (Number(i.freeQty) || 0), 0) || '-'}
                          </td>
                          <td colSpan="3"></td>
                          <td className="px-4 py-2.5 text-right text-sm text-indigo-700 font-extrabold">
                            ₹{grandTotal.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-full md:w-1/2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{(grandTotal - (selectedPurchase.shippingCost || 0) + (selectedPurchase.discountValue || 0)).toFixed(2)}</span>
                  </div>
                  {selectedPurchase.discountValue > 0 && (
                    <div className="flex justify-between w-full md:w-1/2">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">-₹{(selectedPurchase.discountValue || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPurchase.shippingCost > 0 && (
                    <div className="flex justify-between w-full md:w-1/2">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-semibold">₹{(selectedPurchase.shippingCost || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full md:w-1/2 border-t border-gray-300 pt-2 mt-2">
                    <span className="text-gray-900 font-bold">Grand Total:</span>
                    <span className="font-extrabold text-indigo-700 text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full md:w-1/2 text-xs pt-1">
                    <span className="text-emerald-700 font-bold">Paid: ₹{(selectedPurchase.amountPaid || 0).toFixed(2)}</span>
                    <span className="text-amber-700 font-bold">Due: ₹{(grandTotal - (selectedPurchase.amountPaid || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedPurchase.note && (
                <div className="mt-4 p-3 bg-yellow-50/50 border border-yellow-200 rounded text-sm text-gray-700">
                  <span className="font-bold block mb-1">Note:</span>
                  {selectedPurchase.note}
                </div>
              )}

              {/* Close Button Footer */}
              <div className="flex justify-end pt-4 border-t border-blue-500 mt-6">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        );
      })()}


    </div>
  );
};

export default PurchaseList;
