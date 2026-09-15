import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Download, Upload, FileText, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, Filter, X 
} from 'lucide-react';

const PurchaseReturn = () => {
  const navigate = useNavigate();
  // Mock Purchase Return Logs Database (Starts empty as requested "No data available in table")
  const [returns, setReturns] = useState([]);
  
  // States
  const [startDate, setStartDate] = useState('2025-08-13');
  const [endDate, setEndDate] = useState('2026-08-13');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouse');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Return Modal
  const [returnForm, setReturnForm] = useState({
    date: '2026-08-13',
    reference: '',
    purchaseRef: '',
    warehouse: 'Central Warehouse',
    supplier: 'Apple Global Corp',
    grandTotal: ''
  });

  // Handle Search Filter (Reference, Purchase Reference, Supplier, Warehouse)
  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.purchaseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'All Warehouse' || r.warehouse === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReturns.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReturns.length / recordsPerPage) || 1;

  // Add Return Submit
  const handleAddReturnSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: returns.length + 1,
      date: returnForm.date,
      reference: returnForm.reference || `rt-${Math.floor(100000 + Math.random() * 900000)}`,
      purchaseRef: returnForm.purchaseRef || `pr-${Math.floor(100000 + Math.random() * 900000)}`,
      warehouse: returnForm.warehouse,
      supplier: returnForm.supplier,
      grandTotal: Number(returnForm.grandTotal) || 0
    };
    setReturns([...returns, newRecord]);
    setIsAddModalOpen(false);
    // Reset Form fields
    setReturnForm({
      date: '2026-08-13',
      reference: '',
      purchaseRef: '',
      warehouse: 'Central Warehouse',
      supplier: 'Apple Global Corp',
      grandTotal: ''
    });
  };

  const handleDeleteReturn = (id) => {
    if (window.confirm("Are you sure you want to delete this purchase return record?")) {
      setReturns(returns.filter(r => r.id !== id));
    }
  };

  const handleExport = () => {
    alert("Exporting Purchase Return list successfully as Excel/CSV!");
  };

  const handleDownloadPDF = () => {
    alert("Downloading Purchase Return list PDF file...");
  };

  const totalReturnedAmount = filteredReturns.reduce((sum, item) => sum + item.grandTotal, 0);

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
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Return
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
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
            <option value="Central Warehouse">Central Warehouse</option>
            <option value="North Branch Warehouse">North Branch Warehouse</option>
            <option value="East Side Storage">East Side Storage</option>
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
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Purchase Reference</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Warehouse</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Supplier</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Grand Total</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.purchaseRef}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.warehouse}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{item.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${item.grandTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => alert(`View Return Details: ${item.reference}`)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => alert(`Edit Return: ${item.reference}`)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit return"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteReturn(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={15} />
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
              <td colSpan="2" className="px-6 py-3.5 text-sm text-gray-900 font-black">${totalReturnedAmount.toFixed(2)}</td>
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

      {/* --- ADD PURCHASE RETURN DIALOG MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Log Purchase Return
            </h3>

            <form onSubmit={handleAddReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Return Date *</label>
                <input 
                  type="date"
                  required
                  value={returnForm.date}
                  onChange={(e) => setReturnForm({ ...returnForm, date: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Purchase Invoice Ref No *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. pr-20260528-043900"
                  value={returnForm.purchaseRef}
                  onChange={(e) => setReturnForm({ ...returnForm, purchaseRef: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse *</label>
                  <select
                    value={returnForm.warehouse}
                    onChange={(e) => setReturnForm({ ...returnForm, warehouse: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="North Branch Warehouse">North Branch Warehouse</option>
                    <option value="East Side Storage">East Side Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Supplier *</label>
                  <select
                    value={returnForm.supplier}
                    onChange={(e) => setReturnForm({ ...returnForm, supplier: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="Apple Global Corp">Apple Global Corp</option>
                    <option value="Dell Trading Co">Dell Trading Co</option>
                    <option value="HP India Logistics">HP India Logistics</option>
                    <option value="Logitech Distribution">Logitech Distribution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Return Grand Total ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 100.00"
                  value={returnForm.grandTotal}
                  onChange={(e) => setReturnForm({ ...returnForm, grandTotal: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseReturn;
