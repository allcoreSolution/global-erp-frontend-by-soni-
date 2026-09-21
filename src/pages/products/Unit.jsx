import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X 
} from 'lucide-react';

const Unit = () => {
  // Mock Unit Data
  const [units, setUnits] = useState([]);
  
  const fetchUnits = async () => {
    try {
      const response = await api.get('/products/units');
      if (response.data.success) {
        setUnits(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // Form State for Add / Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [unitForm, setUnitForm] = useState({ 
    code: '', 
    name: '', 
    baseUnit: 'None', 
    operator: 'None', 
    operationValue: '1' 
  });

  // Handle Search
  const filteredUnits = units.filter(unit => 
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.baseUnit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUnits.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredUnits.length / recordsPerPage);

  // Add / Edit Action handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setUnitForm({ 
      code: '', 
      name: '', 
      baseUnit: 'None', 
      operator: 'None', 
      operationValue: '1' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit) => {
    setIsEditMode(true);
    setSelectedUnit(unit);
    setUnitForm({ 
      code: unit.code, 
      name: unit.name, 
      baseUnit: unit.baseUnit, 
      operator: unit.operator, 
      operationValue: unit.operationValue 
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (unit) => {
    setSelectedUnit(unit);
    setIsViewModalOpen(true);
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        const res = await api.delete(`/products/units/${id}`);
        if (res.data.success) {
          fetchUnits();
        }
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Failed to delete unit');
      }
    }
  };

  // Form Submit (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!unitForm.code.trim() || !unitForm.name.trim()) return;

    try {
      const payload = {
        code: unitForm.code,
        name: unitForm.name,
        baseUnit: unitForm.baseUnit,
        operator: unitForm.operator,
        operationValue: unitForm.operationValue
      };

      if (isEditMode) {
        await api.put(`/products/units/${selectedUnit._id}`, payload);
      } else {
        await api.post('/products/units', payload);
      }

      setIsModalOpen(false);
      fetchUnits();
    } catch (error) {
      console.error('Error saving unit:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to save unit: ' + errorMsg);
    }
  };

  // Mock Export function
  const handleExport = () => {
    alert("Exporting Unit list successfully as Excel/CSV!");
  };

  // Mock Import function
  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import:");
    if (file) {
      alert(`Units from file "${file}" imported successfully!`);
    }
  };

  // Mock Download PDF
  const handleDownloadPDF = () => {
    alert("Downloading Unit list PDF file...");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Units</h1>
          <p className="text-sm text-gray-600">Define measurement metrics and stock quantity conversion operators.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import Unit
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Unit
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Unit
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
            placeholder="Search Unit..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Units Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Code</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Name</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Base Unit</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Operator</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Operation Value</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((unit) => (
                <tr key={unit._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Unit Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {unit.code}
                  </td>
                  {/* Unit Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {unit.name}
                  </td>
                  {/* Base Unit */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {unit.baseUnit}
                  </td>
                  {/* Operator */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {unit.operator}
                  </td>
                  {/* Operation Value */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {unit.operationValue}
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(unit)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleOpenEditModal(unit)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Unit"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteUnit(unit._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Unit"
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
                    <span>No units found matching your search.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredUnits.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredUnits.length)} of {filteredUnits.length} records
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

      {/* --- ADD / EDIT UNIT DIALOG MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              {isEditMode ? 'Edit Unit Info' : 'Create New Unit'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Unit Code *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. dozen"
                  value={unitForm.code}
                  onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Unit Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dozen"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Base Unit</label>
                <select 
                  value={unitForm.baseUnit}
                  onChange={(e) => setUnitForm({ ...unitForm, baseUnit: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                >
                  <option value="None">None (Root Unit)</option>
                  {units.map(u => (
                    <option key={u.id} value={u.code}>{u.name} ({u.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Operator</label>
                  <select 
                    value={unitForm.operator}
                    onChange={(e) => setUnitForm({ ...unitForm, operator: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="None">None</option>
                    <option value="Multiply (*)">Multiply (*)</option>
                    <option value="Divide (/)">Divide (/)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Operation Value</label>
                  <input 
                    type="number"
                    value={unitForm.operationValue}
                    onChange={(e) => setUnitForm({ ...unitForm, operationValue: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  {isEditMode ? 'Save Changes' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW UNIT DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Unit Overview Details
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Unit Code:</span>
                <span className="font-bold text-gray-900">{selectedUnit.code}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Unit Name:</span>
                <span className="font-bold text-gray-900">{selectedUnit.name}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Base Unit:</span>
                <span className="text-gray-900">{selectedUnit.baseUnit}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Operator:</span>
                <span className="text-gray-900">{selectedUnit.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Operation Value:</span>
                <span className="font-bold text-gray-900">{selectedUnit.operationValue}</span>
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

export default Unit;
