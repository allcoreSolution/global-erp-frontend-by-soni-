import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X 
} from 'lucide-react';

const Category = () => {
  // Mock Category Data
  // Real Category Data
  const [categories, setCategories] = useState([]);
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form State for Add / Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    parent: 'None', 
    description: '',
    imageFile: null,
    company: '',
    displayOrder: '',
    status: true,
    numProducts: 0, 
    stockQty: 0, 
    worthPrice: 0.00, 
    worthCost: 0.00 
  });

  // Handle Search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.parent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCategories.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);

  // Add / Edit Action handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCategoryForm({ 
      name: '', 
      parent: 'None', 
      description: '',
      imageFile: null,
      company: '',
      displayOrder: '',
      status: true,
      numProducts: 0, 
      stockQty: 0, 
      worthPrice: 0, 
      worthCost: 0 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setCategoryForm({ 
      name: category.name || '', 
      parent: category.parent || 'None', 
      description: category.description || '',
      imageFile: null,
      company: category.company || '',
      displayOrder: category.displayOrder || '',
      status: category.status !== undefined ? category.status : true,
      numProducts: category.numProducts || 0, 
      stockQty: category.stockQty || 0, 
      worthPrice: category.worthPrice || 0, 
      worthCost: category.worthCost || 0 
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await api.delete(`/products/categories/${id}`);
        if (res.data.success) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  // Form Submit (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      let imageUrl = categoryForm.image;
      
      if (categoryForm.imageFile) {
        const formData = new FormData();
        formData.append('file', categoryForm.imageFile);
        try {
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            imageUrl = uploadRes.data.url;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image');
          return;
        }
      }

      const payload = {
        name: categoryForm.name,
        parent: categoryForm.parent,
        description: categoryForm.description,
        image: imageUrl,
        company: categoryForm.company,
        displayOrder: categoryForm.displayOrder,
        status: categoryForm.status,
      };

      if (isEditMode) {
        await api.put(`/products/categories/${selectedCategory._id}`, payload);
      } else {
        await api.post('/products/categories', payload);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to save category: ' + errorMsg);
    }
  };

  // Mock Export function
  const handleExport = () => {
    alert("Exporting Category list successfully as Excel/CSV!");
  };

  // Mock Import function
  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import:");
    if (file) {
      alert(`Categories from file "${file}" imported successfully!`);
    }
  };

  // Mock Download PDF
  const handleDownloadPDF = () => {
    alert("Downloading Category list PDF file...");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Categories</h1>
          <p className="text-sm text-gray-600">Organize and manage catalog products grouping.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import Category
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Category
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
            <Plus size={14} /> Add Category
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
            placeholder="Search Category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Categories Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Parent Category</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Number of Products</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Stock Quantity</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Stock Worth(Price/Cost)</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Category Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {category.name}
                  </td>
                  {/* Parent Category */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.parent}
                  </td>
                  {/* Number of Products */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                    {category.numProducts}
                  </td>
                  {/* Stock Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                    {category.stockQty}
                  </td>
                  {/* Stock Worth (Price/Cost) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold text-emerald-700">${(category.worthPrice || 0).toFixed(2)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500">${(category.worthCost || 0).toFixed(2)}</span>
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(category)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Category"
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
                    <span>No categories found matching your search.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCategories.length)} of {filteredCategories.length} records
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

      {/* --- ADD / EDIT CATEGORY DIALOG MODAL --- */}
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
              {isEditMode ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Code */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Category Code</label>
                  <input 
                    type="text"
                    disabled
                    placeholder="CAT-0001 (Auto Generated)"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Category Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Smart Devices"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Parent Category</label>
                  <select 
                    value={categoryForm.parent}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="None">None (Root Category)</option>
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Company</label>
                  <select 
                    value={categoryForm.company}
                    onChange={(e) => setCategoryForm({ ...categoryForm, company: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="">Default Company</option>
                  </select>
                </div>

                {/* Category Image */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Category Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageFile: e.target.files[0] })}
                    className="w-full border border-blue-500 rounded px-3 py-1.5 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Display Order</label>
                  <input 
                    type="number"
                    placeholder="e.g. 1"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Description</label>
                  <textarea 
                    placeholder="Enter category description..."
                    rows="3"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450 placeholder:text-gray-400"
                  ></textarea>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 py-2 border-t border-gray-100 mt-2">
                <input
                  type="checkbox"
                  id="modal-cat-status"
                  checked={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-650 bg-white border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="modal-cat-status" className="text-sm font-semibold text-gray-800 cursor-pointer">Set Category as Active</label>
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
                  {isEditMode ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CATEGORY DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Category Overview Details
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Category Name:</span>
                <span className="font-bold text-gray-900">{selectedCategory.name}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Parent Category:</span>
                <span className="text-gray-900">{selectedCategory.parent}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Number of Products:</span>
                <span className="font-semibold text-gray-900">{selectedCategory.numProducts}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Stock Quantity:</span>
                <span className="font-semibold text-gray-900">{selectedCategory.stockQty}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Stock Worth (Price):</span>
                <span className="font-bold text-emerald-700">${selectedCategory.worthPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Stock Worth (Cost):</span>
                <span className="font-bold text-gray-700">${selectedCategory.worthCost.toFixed(2)}</span>
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

export default Category;
