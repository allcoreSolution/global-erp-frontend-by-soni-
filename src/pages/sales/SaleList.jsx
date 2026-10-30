import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, Calendar, Filter, FileDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';

const SaleList = () => {
  const { can } = usePermissions();
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
      const mapped = data.map(s => {
        const orderItems = s.orderItems || s.items || [];
        const totalItemsCount = orderItems.length;
        const totalQty = orderItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
        const grand = Number(s.grandTotal) || 0;
        const paid = Number(s.amountPaid) || 0;
        const due = Math.max(0, grand - paid);

        return {
          ...s,
          id: s._id,
          invoiceNo: s.invoiceNo || s.referenceNo || 'N/A',
          date: s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A'),
          biller: s.biller || 'Admin Biller',
          customer: s.customer?.name || s.customer?.customerName || (typeof s.customer === 'string' ? s.customer : 'Walk-in Customer'),
          warehouse: s.warehouse?.name || (typeof s.warehouse === 'string' ? s.warehouse : 'Main Warehouse'),
          status: s.saleStatus || 'Completed',
          paymentStatus: s.paymentStatus || (due === 0 && grand > 0 ? 'Paid' : 'Pending'),
          paymentMethod: s.paymentMode || 'Cash',
          itemsCount: totalItemsCount,
          totalQty: totalQty,
          subTotal: Number(s.subTotal) || 0,
          taxTotal: Number(s.taxTotal) || 0,
          discountTotal: Number(s.discountTotal) || 0,
          grandTotal: grand,
          paid: paid,
          due: due,
          items: orderItems,
          orderItems: orderItems
        };
      });
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
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(term)) ||
      (s.customer && s.customer.toLowerCase().includes(term)) ||
      (s.biller && s.biller.toLowerCase().includes(term)) ||
      (s.warehouse && s.warehouse.toLowerCase().includes(term));
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
      'Date', 'Invoice No', 'Customer', 'Warehouse', 'Biller', 
      'Grand Total', 'Paid', 'Due', 'Sale Status', 'Payment Status'
    ];
    const dummyData = [
      '2026-10-29', 'INV-1001', 'Walk-in Customer', 'Main Warehouse', 'Admin Biller',
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
      'Date', 'Invoice No', 'Customer', 'Warehouse', 'Biller', 
      'Items Count', 'Grand Total', 'Paid', 'Due', 'Sale Status', 'Payment Status'
    ];
    const rows = filteredSales.map(s => [
      `"${s.date || ''}"`,
      `"${s.invoiceNo || ''}"`,
      `"${s.customer || ''}"`,
      `"${s.warehouse || ''}"`,
      `"${s.biller || ''}"`,
      `"${s.itemsCount || 0}"`,
      `"${s.grandTotal || 0}"`,
      `"${s.paid || 0}"`,
      `"${s.due || 0}"`,
      `"${s.status || ''}"`,
      `"${s.paymentStatus || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
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

  // Calculations for total summary row
  const totalGrandAmount = filteredSales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
  const totalPaidAmount = filteredSales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
  const totalDueAmount = filteredSales.reduce((sum, s) => sum + (Number(s.due) || 0), 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <span>Sales Invoices</span>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
              {sales.length} Invoices
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Sabhi customer sale bills aur invoices ki complete report.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          {can(['create_sales', 'manage_sales']) && (
            <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <Upload size={14} /> Import CSV
            </button>
          )}
          {can(['create_sales', 'manage_sales']) && (
            <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <FileDown size={14} /> Sample
            </button>
          )}
          <button onClick={handleExport} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> Export CSV
          </button>
          {can(['create_sales', 'manage_sales']) && (
            <button
              onClick={() => navigate('/sales/add-sale')}
              className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
            >
              <Plus size={14} /> Add Sale
            </button>
          )}
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">Records per page:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-indigo-600"
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
              <span className="text-sm text-gray-700 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-indigo-600"
              >
                <option value="All">All Invoices</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due / Pending</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Invoice No, Customer, Godown..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-indigo-600 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Table view log grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-100 border-b border-blue-500 text-gray-800">
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center w-14">Action</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider w-28">Date</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-indigo-700 w-36">Invoice No</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Warehouse / Godown</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">Items (Qty)</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-right">Grand Total</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-right text-emerald-700">Paid</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-right text-amber-700">Due</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">Sale Status</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-center">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {loading ? (
              <tr>
                <td colSpan="11" className="px-4 py-12 text-center text-sm text-gray-500 bg-white">
                  Loading sales records...
                </td>
              </tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">

                  {/* Actions Column */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenViewModal(item)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                        title="View Sale Invoice"
                      >
                        <Eye size={16} />
                      </button>
                      {can(['edit_sales', 'manage_sales']) && (
                        <button
                          onClick={() => {
                            navigate('/sales/add-sale', { state: { editSale: item } });
                          }}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
                          title="Edit Sale"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {can(['delete_sales', 'manage_sales']) && (
                        <button
                          onClick={() => handleDeleteSale(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete Sale record"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700 font-semibold">{item.date}</td>

                  {/* Invoice No (Replacing Reference) */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-black text-indigo-700">
                    <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {item.invoiceNo}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {item.customer}
                  </td>

                  {/* Warehouse / Godown */}
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700 font-medium">
                    {item.warehouse}
                  </td>

                  {/* Items (Qty) */}
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-center font-bold text-gray-800">
                    <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                      {item.itemsCount} Items ({item.totalQty} Qty)
                    </span>
                  </td>

                  {/* Grand Total */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-black text-gray-900 text-right">
                    ₹{item.grandTotal.toFixed(2)}
                  </td>

                  {/* Paid */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-emerald-700 text-right">
                    ₹{item.paid.toFixed(2)}
                  </td>

                  {/* Due */}
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-amber-700 text-right">
                    ₹{item.due.toFixed(2)}
                  </td>

                  {/* Sale Status */}
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold border ${
                      item.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                      item.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.paymentStatus === 'Partial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-4 py-12 text-center text-sm text-gray-500 bg-white">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No sales records found.</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Calculations total sum row */}
            <tr className="bg-slate-100 font-bold border-t-2 border-blue-500 text-gray-900">
              <td colSpan="6" className="px-4 py-3 text-sm text-gray-800 font-bold">Total ({filteredSales.length} Invoices):</td>
              <td className="px-3 py-3 whitespace-nowrap text-sm font-black text-gray-900 text-right">₹{totalGrandAmount.toFixed(2)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-sm font-black text-emerald-700 text-right">₹{totalPaidAmount.toFixed(2)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-sm font-black text-amber-700 text-right">₹{totalDueAmount.toFixed(2)}</td>
              <td colSpan="2"></td>
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
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
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
