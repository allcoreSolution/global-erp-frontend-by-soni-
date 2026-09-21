import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Filter 
} from 'lucide-react';
import api from '../../api';

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State for Edit (inline edit modal example)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    code: '',
    brand: '',
    category: '',
    price: 0,
    cost: 0,
    qty: 0,
    unit: 'pcs'
  });

  // Handle Search and Category Filter
  const filteredProducts = products.filter(product => {
    const pName = product.productName || '';
    const pCode = product.productCode || '';
    const pBrand = product.brand?.name || '';
    const pCat = product.category?.name || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pBrand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || pCat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

  // Open Actions Modals
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setEditProductForm({
      name: product.productName,
      code: product.productCode,
      brand: product.brand?._id || product.brand,
      category: product.category?._id || product.category,
      price: product.productPrice,
      cost: product.productCost,
      qty: product.currentStock,
      unit: product.productUnit
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Submit inline edit modal form
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productName: editProductForm.name,
        productCode: editProductForm.code,
        // Assuming we are not editing brand/category easily inline, or they are just strings here
        productPrice: editProductForm.price,
        productCost: editProductForm.cost,
        currentStock: editProductForm.qty,
        productUnit: editProductForm.unit
      };
      await api.put(`/products/${selectedProduct._id}`, payload);
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Unique categories list for filters
  const categoriesList = ['All', ...new Set(products.map(p => p.category?.name || 'Uncategorized'))];

  // Mock Export function
  const handleExport = () => {
    alert("Exporting Product list successfully as Excel/CSV!");
  };

  // Mock Import function
  const handleImport = () => {
    const file = prompt("Import spreadsheet: Enter file name to mock import:");
    if (file) {
      alert(`Products from file "${file}" imported successfully!`);
    }
  };

  // Mock Download PDF
  const handleDownloadPDF = () => {
    alert("Downloading Product list PDF file...");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Product List</h1>
          <p className="text-sm text-gray-600">Track current items warehouse stock, prices and values.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import Products
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export Products
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={() => navigate('/products/add-product')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Product
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

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">Category:</span>
            <select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Product Name/Code/Brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Products Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Product</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Code</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Brand</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Cost</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Price</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Stock Qty</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Product Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {product.productName}
                  </td>
                  {/* Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.productCode}
                  </td>
                  {/* Brand */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.brand?.name || 'N/A'}
                  </td>
                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.category?.name || 'N/A'}
                  </td>
                  {/* Cost */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${Number(product.productCost || 0).toFixed(2)}
                  </td>
                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">
                    ${Number(product.productPrice || 0).toFixed(2)}
                  </td>
                  {/* Stock Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {product.currentStock || 0} {product.productUnit || ''}
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(product)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No products found matching filters.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredProducts.length)} of {filteredProducts.length} records
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

      {/* --- INLINE EDIT PRODUCT DIALOG MODAL --- */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Edit Product Details
            </h3>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product Name *</label>
                <input 
                  type="text"
                  required
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product Code *</label>
                  <input 
                    type="text"
                    required
                    value={editProductForm.code}
                    onChange={(e) => setEditProductForm({ ...editProductForm, code: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand</label>
                  <input 
                    type="text"
                    value={editProductForm.brand}
                    onChange={(e) => setEditProductForm({ ...editProductForm, brand: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Cost ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editProductForm.cost}
                    onChange={(e) => setEditProductForm({ ...editProductForm, cost: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Price ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editProductForm.price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Stock Quantity *</label>
                  <input 
                    type="number"
                    required
                    value={editProductForm.qty}
                    onChange={(e) => setEditProductForm({ ...editProductForm, qty: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Unit *</label>
                  <input 
                    type="text"
                    required
                    value={editProductForm.unit}
                    onChange={(e) => setEditProductForm({ ...editProductForm, unit: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRODUCT DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Product Overview Details
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Product Name:</span>
                <span className="font-bold text-gray-900">{selectedProduct.productName}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Product Code:</span>
                <span className="text-gray-900 font-mono font-medium">{selectedProduct.productCode}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Brand:</span>
                <span className="text-gray-900">{selectedProduct.brand?.name || selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Category:</span>
                <span className="text-gray-900">{selectedProduct.category?.name || selectedProduct.category}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Product Cost:</span>
                <span className="text-gray-900 font-semibold">${Number(selectedProduct.productCost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Product Price:</span>
                <span className="font-bold text-emerald-700">${Number(selectedProduct.productPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Stock Available:</span>
                <span className="font-bold text-gray-900">{selectedProduct.currentStock || 0} {selectedProduct.productUnit || ''}</span>
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

export default ProductList;
