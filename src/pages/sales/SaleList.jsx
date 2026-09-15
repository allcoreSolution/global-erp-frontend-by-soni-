import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar, Filter, DollarSign 
} from 'lucide-react';

const SaleList = () => {
  const navigate = useNavigate();

  // Mock Sales Database matching requested table data logs exactly
  const [sales, setSales] = useState([
    { id: 1, date: '13/08/2026 12:08:11 pm', reference: 'ITrovePOS20260813-120811', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(50.00)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 50.00, returnedAmount: 0.00, paid: 50.00, due: 0.00 },
    { id: 2, date: '12/08/2026 02:06:46 pm', reference: 'fcfc', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Pending', paymentMethod: '-', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 25.00, returnedAmount: 0.00, paid: 0.00, due: 25.00 },
    { id: 3, date: '12/08/2026 01:49:16 pm', reference: 'ITrovePOS20260812-014916', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(22.00)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 22.00, returnedAmount: 0.00, paid: 22.00, due: 0.00 },
    { id: 4, date: '11/08/2026 10:21:54 pm', reference: 'gbbc', createdBy: 'mummakidz', customer: 'test1234567890', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(26.13)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 26.13, returnedAmount: 0.00, paid: 26.13, due: 0.00 },
    { id: 5, date: '11/08/2026 10:17:39 pm', reference: 'ITrovePOS20260811-101739', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(55.00)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 55.00, returnedAmount: 0.00, paid: 55.00, due: 0.00 },
    { id: 6, date: '28/04/2026 04:49:55 pm', reference: 'ITrovePOS20260428-044955', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(46.95)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 46.95, returnedAmount: 0.00, paid: 46.95, due: 0.00 },
    { id: 7, date: '02/04/2026 04:05:44 pm', reference: 'ITrovePOS20260402-040544', createdBy: 'mummakidz', customer: 'John Doe231312', warehouse: 'Test Shop', status: 'Draft', paymentStatus: 'Due', paymentMethod: '-', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 30.00, returnedAmount: 0.00, paid: 0.00, due: 30.00 },
    { id: 8, date: '02/04/2026 01:27:09 pm', reference: 'ITrovePOS20260402-012709', createdBy: 'mummakidz', customer: 'test1234567890', warehouse: 'Test Shop', status: 'Completed', paymentStatus: 'Paid', paymentMethod: 'Cash(7.50)', currencyRate: 'INR/1', deliveryStatus: 'N/A', grandTotal: 7.50, returnedAmount: 0.00, paid: 7.50, due: 0.00 }
  ]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
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

  // View modal helper
  const handleOpenViewModal = (item) => {
    setSelectedSale(item);
    setIsViewModalOpen(true);
  };

  // Delete invoice
  const handleDeleteSale = (id) => {
    if (window.confirm("Are you sure you want to delete this sales invoice?")) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const handleExport = () => {
    alert("Exporting Sales List as Excel/CSV successfully!");
  };

  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import:");
    if (file) {
      alert(`Sales records from "${file}" imported successfully!`);
    }
  };

  const handleDownloadPDF = () => {
    alert("Downloading Sales List PDF document...");
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
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={() => navigate('/sales/add-sale')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
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
            {currentRecords.length > 0 ? (
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
                  <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{item.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.warehouse}</td>
                  
                  {/* Sale Status */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold border ${
                      item.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded font-extrabold ${
                      item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{item.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.currencyRate}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-center font-medium">{item.deliveryStatus}</td>
                  
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
              <td className="px-4 py-3 text-sm font-extrabold">INR {totalGrandAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-red-700 font-semibold">INR {totalReturnedAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-emerald-700 font-extrabold">INR {totalPaidAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-amber-700 font-extrabold">INR {totalDueAmount.toFixed(2)}</td>
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
        </div>
      )}

      {/* --- VIEW SALE DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Sale Transaction Invoice Overview
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Reference No:</span>
                <span className="font-bold text-gray-900">{selectedSale.reference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Date/Time:</span>
                <span className="text-gray-900 font-semibold">{selectedSale.date}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Biller Company:</span>
                <span className="text-gray-900">Test Biller Company</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Customer:</span>
                <span className="text-gray-900 font-bold">{selectedSale.customer}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Warehouse:</span>
                <span className="text-gray-900 font-semibold">{selectedSale.warehouse}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Grand Total:</span>
                <span className="font-bold text-gray-900">INR {selectedSale.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-emerald-700">INR {selectedSale.paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Due Amount:</span>
                <span className="font-semibold text-red-700">INR {selectedSale.due.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Sale Status:</span>
                <span className="font-bold text-blue-700">{selectedSale.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Payment Status:</span>
                <span className="font-bold text-emerald-800">{selectedSale.paymentStatus}</span>
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

export default SaleList;
