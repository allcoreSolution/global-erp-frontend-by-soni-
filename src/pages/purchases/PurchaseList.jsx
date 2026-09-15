import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar, Filter, DollarSign 
} from 'lucide-react';

const PurchaseList = () => {
  const navigate = useNavigate();

  // Mock Purchase Invoices Database
  const [purchases, setPurchases] = useState([
    { id: 1, date: '28/05/2026', reference: 'pr-20260528-043900', createdBy: 'mummakidz', supplier: 'Apple Global Corp', status: 'Received', grandTotal: 1.00, returnedAmount: 0.00, paid: 1.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 2, date: '28/05/2026', reference: 'pr-20260528-043837', createdBy: 'mummakidz', supplier: 'Dell Trading Co', status: 'Received', grandTotal: 16.00, returnedAmount: 0.00, paid: 16.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 3, date: '28/05/2026', reference: 'pr-20260528-043748', createdBy: 'mummakidz', supplier: 'HP India Logistics', status: 'Received', grandTotal: 18.00, returnedAmount: 0.00, paid: 18.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 4, date: '28/05/2026', reference: 'pr-20260528-043554', createdBy: 'mummakidz', supplier: 'Logitech Distribution', status: 'Received', grandTotal: 15.00, returnedAmount: 0.00, paid: 15.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 5, date: '28/05/2026', reference: 'pr-20260528-043525', createdBy: 'mummakidz', supplier: 'Apple Global Corp', status: 'Received', grandTotal: 8.00, returnedAmount: 0.00, paid: 8.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 6, date: '28/05/2026', reference: 'pr-20260528-043442', createdBy: 'mummakidz', supplier: 'Dell Trading Co', status: 'Received', grandTotal: 23.00, returnedAmount: 0.00, paid: 23.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 7, date: '28/05/2026', reference: 'pr-20260528-043407', createdBy: 'mummakidz', supplier: 'HP India Logistics', status: 'Received', grandTotal: 7.00, returnedAmount: 0.00, paid: 7.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 8, date: '28/05/2026', reference: 'pr-20260528-043258', createdBy: 'mummakidz', supplier: 'Logitech Distribution', status: 'Received', grandTotal: 3.00, returnedAmount: 0.00, paid: 3.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 9, date: '28/05/2026', reference: 'pr-20260528-043214', createdBy: 'mummakidz', supplier: 'Apple Global Corp', status: 'Received', grandTotal: 4.00, returnedAmount: 0.00, paid: 4.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
    { id: 10, date: '28/05/2026', reference: 'pr-20260528-043142', createdBy: 'mummakidz', supplier: 'Dell Trading Co', status: 'Received', grandTotal: 5.00, returnedAmount: 0.00, paid: 5.00, due: 0.00, paymentTerm: '-', dueDate: '-', paymentStatus: 'Paid' },
  ]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Search Filter
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus || p.paymentStatus === selectedStatus;
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

  const handleDeletePurchase = (id) => {
    if (window.confirm("Are you sure you want to delete this purchase invoice?")) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  const handleExport = () => {
    alert("Exporting Purchase List as Excel/CSV successfully!");
  };

  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import:");
    if (file) {
      alert(`Purchase records from "${file}" imported successfully!`);
    }
  };

  const handleDownloadPDF = () => {
    alert("Downloading Purchase List PDF document...");
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
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import Purchase
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Purchase
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={() => navigate('/purchases/add-purchase')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Purchase
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
            placeholder="Search Reference/Supplier..."
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
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Supplier</th>
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
            {currentRecords.length > 0 ? (
              currentRecords.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{p.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{p.reference}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{p.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{p.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                    <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">${p.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">${p.returnedAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 font-bold">${p.paid.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700 font-bold">${p.due.toFixed(2)}</td>
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
                      <button
                        onClick={() => {
                          alert(`Redirecting to edit purchase: ${p.reference}`);
                          navigate('/purchases/add-purchase');
                        }}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Purchase Invoice"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeletePurchase(p.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
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
      {isViewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Purchase Invoice Overview
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Reference No:</span>
                <span className="font-bold text-gray-900">{selectedPurchase.reference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Date:</span>
                <span className="text-gray-900 font-semibold">{selectedPurchase.date}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Created By:</span>
                <span className="text-gray-900">{selectedPurchase.createdBy}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Supplier:</span>
                <span className="text-gray-900 font-semibold">{selectedPurchase.supplier}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Grand Total:</span>
                <span className="font-bold text-gray-900">${selectedPurchase.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-emerald-700">${selectedPurchase.paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Due Amount:</span>
                <span className="font-semibold text-red-700">${selectedPurchase.due.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Purchase Status:</span>
                <span className="font-bold text-blue-700">{selectedPurchase.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Payment Status:</span>
                <span className="font-bold text-emerald-800">{selectedPurchase.paymentStatus}</span>
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

export default PurchaseList;
