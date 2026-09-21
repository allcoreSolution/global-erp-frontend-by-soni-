import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Calendar 
} from 'lucide-react';

const AdjustmentList = () => {
  const navigate = useNavigate();

  // Mock Adjustment Records Data
  const [adjustments, setAdjustments] = useState([
    { id: 1, date: '2026-08-10', reference: 'ADJ-00192', warehouse: 'Central Warehouse', products: 'iPhone 15 Pro (2), Dell XPS 15 (1)', note: 'Damaged item return replacement adjustment.' },
    { id: 2, date: '2026-08-11', reference: 'ADJ-00193', warehouse: 'North Branch Warehouse', products: 'MX Master 3S (10)', note: 'Discrepancy count stock fix.' },
    { id: 3, date: '2026-08-12', reference: 'ADJ-00194', warehouse: 'East Side Storage', products: 'Galaxy S24 Ultra (3), Sony WH-1000XM5 (2)', note: 'Correction update parameters.' },
    { id: 4, date: '2026-08-12', reference: 'ADJ-00195', warehouse: 'Central Warehouse', products: 'HP LaserJet Pro (1)', note: 'Office demo writeoff.' },
    { id: 5, date: '2026-08-13', reference: 'ADJ-00196', warehouse: 'North Branch Warehouse', products: 'Dell XPS 15 (2)', note: 'Testing stock valuation unit.' },
  ]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  // Handle Search Filter (Reference, Warehouse, Products, Note)
  const filteredAdjustments = adjustments.filter(adj => 
    adj.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.products.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAdjustments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAdjustments.length / recordsPerPage);

  // Open Actions Modals
  const handleOpenViewModal = (adj) => {
    setSelectedAdjustment(adj);
    setIsViewModalOpen(true);
  };

  const handleDeleteAdjustment = (id) => {
    if (window.confirm("Are you sure you want to delete this adjustment record?")) {
      setAdjustments(adjustments.filter(adj => adj.id !== id));
    }
  };

  // Mock Export function
  const handleExport = () => {
    alert("Exporting Stock Adjustment list successfully as Excel/CSV!");
  };

  // Mock Import function
  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import adjustments:");
    if (file) {
      alert(`Adjustment records from file "${file}" imported successfully!`);
    }
  };

  // Mock Download PDF
  const handleDownloadPDF = () => {
    alert("Downloading Stock Adjustment list PDF file...");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Adjustment List</h1>
          <p className="text-sm text-gray-600">Track and manage inventory stock corrections logs.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import Adjustment
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Adjustment
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={() => navigate('/products/add-adjustment')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Adjustment
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
            placeholder="Search adjustments..."
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
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Products</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Note</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((adj) => (
                <tr key={adj.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{adj.date}</span>
                    </div>
                  </td>
                  {/* Reference */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {adj.reference}
                  </td>
                  {/* Warehouse */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {adj.warehouse}
                  </td>
                  {/* Products Adjusted list summary */}
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-xs truncate" title={adj.products}>
                    {adj.products}
                  </td>
                  {/* Note summary */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={adj.note}>
                    {adj.note}
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(adj)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Adjustment"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action (redirect/alert mockup) */}
                      <button
                        onClick={() => {
                          alert(`Redirecting to edit adjustment: ${adj.reference}`);
                          navigate('/products/add-adjustment');
                        }}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Adjustment"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteAdjustment(adj.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Adjustment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No stock adjustments found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredAdjustments.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredAdjustments.length)} of {filteredAdjustments.length} records
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

      {/* --- VIEW ADJUSTMENT DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Adjustment Log Details
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Reference No:</span>
                <span className="font-bold text-gray-900">{selectedAdjustment.reference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Adjustment Date:</span>
                <span className="text-gray-900">{selectedAdjustment.date}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Warehouse:</span>
                <span className="text-gray-900 font-semibold">{selectedAdjustment.warehouse}</span>
              </div>
              <div className="border-b border-blue-500 pb-2 space-y-1">
                <span className="block font-semibold text-gray-600">Products Adjusted:</span>
                <span className="block text-gray-800 bg-gray-50 p-2 rounded border border-blue-500 font-medium text-xs">
                  {selectedAdjustment.products}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block font-semibold text-gray-600">Adjustment Note:</span>
                <span className="block text-gray-700 italic bg-gray-50 p-2 rounded border border-blue-500 text-xs">
                  {selectedAdjustment.note || 'No notes added.'}
                </span>
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

export default AdjustmentList;
