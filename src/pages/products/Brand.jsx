import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Download, Upload, FileDown, Eye, Edit, Trash2,
  Check, X, ChevronLeft, ChevronRight, AlertCircle, XCircle
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const Brand = () => {
  const [brands, setBrands] = useState([]);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/products/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Form State for Add / Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '', image: '', imageFile: null, description: '', status: true, displayOrder: '', featured: false, company: '', branch: '' });
  const fileInputRef = useRef(null);

  // Handle Search
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBrands.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredBrands.length / recordsPerPage);

  // Toggle status
  const handleToggleStatus = async (id) => {
    const brand = brands.find(b => b._id === id);
    if (!brand) return;
    try {
      await api.put(`/products/brands/${id}`, { status: !brand.status });
      fetchBrands();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Add / Edit Action handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setBrandForm({ name: '', image: '', imageFile: null, description: '', status: true, displayOrder: '', featured: false, company: '', branch: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand) => {
    setIsEditMode(true);
    setSelectedBrand(brand);
    setBrandForm({ 
      name: brand.name || '', 
      image: brand.image || '', 
      imageFile: null, 
      description: brand.description || '', 
      status: brand.status !== undefined ? brand.status : true, 
      displayOrder: brand.displayOrder || '', 
      featured: brand.featured || false, 
      company: brand.company || '', 
      branch: brand.branch || '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (brand) => {
    setSelectedBrand(brand);
    setIsViewModalOpen(true);
  };

  const handleDeleteBrand = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/products/brands/${id}`);
        Swal.fire('Deleted!', 'Brand has been deleted.', 'success');
        fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        Swal.fire('Error', 'Failed to delete brand.', 'error');
      }
    }
  };

  // Form Submit (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    let imageUrl = brandForm.image;
    
    if (brandForm.imageFile) {
      const formData = new FormData();
      formData.append('file', brandForm.imageFile);
      try {
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          imageUrl = uploadRes.data.url;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Image upload failed');
        return;
      }
    }

    const payload = {
      name: brandForm.name,
      image: imageUrl,
      description: brandForm.description,
      status: brandForm.status,
      displayOrder: brandForm.displayOrder,
      featured: brandForm.featured,
      company: brandForm.company,
      branch: brandForm.branch
    };

    try {
      if (isEditMode) {
        await api.put(`/products/brands/${selectedBrand._id}`, payload);
      } else {
        await api.post('/products/brands', payload);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      Swal.fire('Error', 'Failed to save brand: ' + errorMsg, 'error');
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "name,description,status,displayOrder,featured,company,branch\nTest Brand,A test brand,true,1,false,,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brand_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (brands.length === 0) {
      Swal.fire('No Data', 'No brands available to export.', 'warning');
      return;
    }
    const headers = ['Name', 'Description', 'Status', 'Display Order', 'Featured', 'Company', 'Branch'];
    const rows = brands.map(b => [
      `"${b.name || ''}"`,
      `"${(b.description || '').replace(/"/g, '""')}"`,
      b.status ? 'true' : 'false',
      b.displayOrder || '',
      b.featured ? 'true' : 'false',
      `"${b.company || ''}"`,
      `"${b.branch || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brands_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        Swal.fire('Error', 'CSV file is empty or invalid.', 'error');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const importedData = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parse handling comma separation without full quote parsing to keep it light
        const values = lines[i].split(',');
        const bData = {};
        headers.forEach((header, index) => {
          bData[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        });
        
        // Deduplication
        const isDuplicate = brands.some(b => 
          (bData.name && b.name.toLowerCase() === b.name.toLowerCase())
        );
        
        if (!isDuplicate && bData.name) {
          if (bData.status !== undefined) bData.status = (bData.status === 'true');
          if (bData.featured !== undefined) bData.featured = (bData.featured === 'true');
          importedData.push(bData);
        }
      }
      
      if (importedData.length === 0) {
        Swal.fire('Notice', 'No new brands found or all are duplicates.', 'info');
        e.target.value = '';
        return;
      }
      
      try {
        Swal.fire({ title: 'Importing...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        for (const data of importedData) {
          await api.post('/products/brands', data);
        }
        Swal.fire('Success', `${importedData.length} Brands imported successfully!`, 'success');
        fetchBrands();
      } catch (err) {
        console.error('Import error:', err);
        Swal.fire('Error', 'Failed to import brands.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Brands</h1>
          <p className="text-sm text-gray-600">Manage products manufacturer and brand catalogs.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <Upload size={14} /> Import
          </button>
          <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <FileDown size={14} /> Sample
          </button>
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={handleOpenAddModal} className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors">
            <Plus size={14} /> Add New Brand
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
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-400"
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
            placeholder="Search Brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Brands Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Image</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Brand</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((brand) => (
                <tr key={brand._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Brand Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={brand.image || 'https://via.placeholder.com/80?text=No+Image'}
                      alt={brand.name}
                      className="w-10 h-10 object-contain rounded border border-blue-500 bg-gray-50"
                    />
                  </td>
                  {/* Brand Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {brand.name}
                  </td>
                  {/* Status Indicator Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${brand.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {brand.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions (Toggle Status, View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">

                      {/* Toggle Status Button inside Action column */}
                      <button
                        onClick={() => handleToggleStatus(brand._id)}
                        className={`p-1.5 rounded transition-colors ${brand.status
                          ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          }`}
                        title={brand.status ? 'Deactivate Brand' : 'Activate Brand'}
                      >
                        {brand.status ? <Check size={16} /> : <XCircle size={16} />}
                      </button>

                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(brand)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleOpenEditModal(brand)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Brand"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteBrand(brand._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No brands found matching your search.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredBrands.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredBrands.length)} of {filteredBrands.length} records
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
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${currentPage === i + 1
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

      {/* --- ADD / EDIT BRAND DIALOG MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-2xl w-full p-6 relative text-black max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              {isEditMode ? 'Edit Brand' : 'Add New Brand'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* 1. Basic Information */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">1. Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand Code</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Auto Generated"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Logitech"
                      value={brandForm.name}
                      onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand Image / Logo (Upload)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBrandForm({ ...brandForm, imageFile: e.target.files[0] })}
                      className="w-full border border-blue-500 rounded px-3 py-1.5 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand Image Link</label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={brandForm.image}
                      onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2 hidden">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand Description</label>
                    <textarea
                      placeholder="Enter brand description..."
                      rows="3"
                      value={brandForm.description}
                      onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450 placeholder:text-gray-400"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 2. Brand Settings */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">2. Brand Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-3 py-1 hidden">
                    <input
                      type="checkbox"
                      id="modal-status"
                      checked={brandForm.status}
                      onChange={(e) => setBrandForm({ ...brandForm, status: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-650 bg-white border-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="modal-status" className="text-sm font-semibold text-gray-800 cursor-pointer">Set as Active</label>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <input
                      type="checkbox"
                      id="modal-featured"
                      checked={brandForm.featured}
                      onChange={(e) => setBrandForm({ ...brandForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-650 bg-white border-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="modal-featured" className="text-sm font-semibold text-gray-800 cursor-pointer">Featured Brand</label>
                  </div>
                  <div className="hidden">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={brandForm.displayOrder}
                      onChange={(e) => setBrandForm({ ...brandForm, displayOrder: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Company / Organization */}
              <div className="hidden">
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">3. Company / Organization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Company</label>
                    <select
                      value={brandForm.company}
                      onChange={(e) => setBrandForm({ ...brandForm, company: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    >
                      <option value="">Default Company</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Branch</label>
                    <select
                      value={brandForm.branch}
                      onChange={(e) => setBrandForm({ ...brandForm, branch: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    >
                      <option value="">Default Branch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow transition-colors"
                >
                  {isEditMode ? 'Save Changes' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW BRAND DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">

            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Brand Overview Details
            </h3>

            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={selectedBrand.image}
                alt={selectedBrand.name}
                className="w-24 h-24 object-contain rounded border border-blue-500 p-2 bg-gray-50"
              />
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900">{selectedBrand.name}</h4>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${selectedBrand.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {selectedBrand.status ? 'Operational Active' : 'Deactivated / Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-500">
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

export default Brand;
