import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar, Filter, DollarSign, FileDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const SaleList = () => {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales');
      const data = res.data?.data || res.data || [];
      const mapped = data.map(s => ({
        ...s,
        id: s._id,
        reference: s.referenceNo || s.invoiceNo,
        date: s.saleDate || new Date(s.createdAt).toLocaleDateString(),
        createdBy: s.biller || 'Admin',
        customer: s.customer?.name || s.customer?.customerName || s.customer || 'Unknown',
        warehouse: s.warehouse?.name || s.warehouse || 'Unknown',
        status: s.saleStatus || 'Completed',
        paymentStatus: s.paymentStatus || 'Pending',
        paymentMethod: s.paymentMode || 'Cash',
        currencyRate: `${s.currency || 'INR'}/${s.exchangeRate || 1}`,
        grandTotal: s.grandTotal || 0,
        returnedAmount: 0,
        paid: s.amountPaid || 0,
        due: s.grandTotal - (s.amountPaid || 0),
        items: s.items || s.orderItems || []
      }));
      setSales(mapped);
    } catch (err) {
      console.error('Failed to load sales', err);
    } finally {
      setLoading(false);
    }
  };


  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Search Filter
  const filteredSales = sales.filter(s => {
    const matchesSearch = s.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus || s.paymentStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSales.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSales.length / recordsPerPage) || 1;

  // View helper
  const handleOpenViewModal = (item) => {
    navigate('/sales/view-invoice', { state: { sale: item } });
  };

  const handleDeleteSale = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this sales invoice?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/sales/${id}`);
        setSales(sales.filter(s => s.id !== id));
        Swal.fire('Deleted!', 'Sale deleted successfully', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', `Error deleting sale: ${err.response?.data?.message || err.message}`, 'error');
      }
    }
  };

  const handleDownloadSample = () => {
    const headers = [
      'Date', 'Reference', 'Created By', 'Customer', 'Warehouse', 'Biller', 
      'Grand Total', 'Paid', 'Due', 'Status', 'Payment Status'
    ];
    const dummyData = [
      '2023-12-01', 'INV-1001', 'Admin', 'Rahul Traders', 'Main Warehouse', 'Admin',
      '15000', '15000', '0', 'Completed', 'Paid'
    ];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const headers = [
      'Date', 'Reference', 'Created By', 'Customer', 'Warehouse', 'Biller', 
      'Grand Total', 'Paid', 'Due', 'Status', 'Payment Status'
    ];
    const rows = filteredSales.map(s => [
      `"${s.date ? new Date(s.date).toISOString().split('T')[0] : ''}"`,
      `"${s.referenceNo || ''}"`,
      `"${s.createdBy || ''}"`,
      `"${s.customer || ''}"`,
      `"${s.warehouse || ''}"`,
      `"${s.biller || ''}"`,
      `"${s.grandTotal || 0}"`,
      `"${s.paid || 0}"`,
      `"${s.due || 0}"`,
      `"${s.status || ''}"`,
      `"${s.paymentStatus || ''}"`
    ]);
    const dummyData = [
      '2023-12-01', 'INV-1001', 'Admin', 'Rahul Traders', 'Main Warehouse', 'Admin',
      '15000', '15000', '0', 'Completed', 'Paid'
    ];
    const csvContent = [headers.join(','), dummyData.map(d => `"${d}"`).join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. (Add logic as needed)', 'success');
    e.target.value = '';
  };

  // Sums calculations
  const totalGrandAmount = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalReturnedAmount = filteredSales.reduce((sum, s) => sum + s.returnedAmount, 0);
  const totalPaidAmount = filteredSales.reduce((sum, s) => sum + s.paid, 0);
  const totalDueAmount = filteredSales.reduce((sum, s) => sum + s.due, 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Sales List</h1>
          <p className="text-sm text-gray-600">Track and manage customer billing invoice transactions logs.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <Upload size={14} /> Import CSV
          </button>
          <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <FileDown size={14} /> Sample
          </button>
          <button onClick={handleExport} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => navigate('/sales/add-sale')}
            className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Sale
          </button>
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
            <span>Filter Status</span>
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
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Reference/Customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table view log grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-center w-16">Action</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Customer</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Warehouse</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Sale Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Payment Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Payment Method</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Currency/Rate</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-center">Delivery Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Grand Total</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Returned Amount</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Paid</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {loading ? (
              <tr>
                <td colSpan="15" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
                  Loading sales records...
                </td>
              </tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">

                  {/* Actions Column */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenViewModal(item)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Sale details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => {
                          alert(`Redirecting to edit sale reference: ${item.reference}`);
                          navigate('/sales/add-sale');
                        }}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Sale"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Sale record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 font-medium">{item.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{item.reference}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.createdBy}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold">{item.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.warehouse}</td>

                  {/* Sale Status */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold border ${item.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded font-extrabold ${item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {item.paymentStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-semibold">{item.paymentMethod}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600">{item.currencyRate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 text-center font-medium">{item.deliveryStatus}</td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">INR {item.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">INR {item.returnedAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 font-bold">INR {item.paid.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700 font-bold">INR {item.due.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No sales records found.</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Calculations total sum row */}
            <tr className="bg-gray-50/90 font-bold border-t border-blue-500 text-gray-900">
              <td colSpan="11" className="px-4 py-3 text-sm text-gray-800">Total</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-extrabold">INR {totalGrandAmount.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-700 font-semibold">INR {totalReturnedAmount.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 font-extrabold">INR {totalPaidAmount.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700 font-extrabold">INR {totalDueAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredSales.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredSales.length)} of {filteredSales.length} records
          </div>

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
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
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
        </div>
      )}
    </div>
  );
};

export default SaleList;
