import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Upload, AlertCircle, Info } from 'lucide-react';
import api from '../../api';

const AddAdjustment = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
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
    fetchProducts();
  }, []);

  // States
  const [warehouse, setWarehouse] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [note, setNote] = useState('');

  // Handle product search typing
  const handleProductSearchChange = (e) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.trim().length > 0) {
      const results = products.filter(p => 
        (p.productCode && p.productCode.includes(val)) || 
        (p.sku && p.sku.includes(val)) ||
        (p.productName && p.productName.toLowerCase().includes(val.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectProduct = (product) => {
    const pCode = product.productCode || product.sku;
    const pName = product.productName;
    const pCost = Number(product.productCost) || 0;
    
    // Check if product already exists in orderItems
    const exists = orderItems.find(item => item.code === pCode);
    if (exists) {
      setOrderItems(orderItems.map(item => 
        item.code === pCode ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, { 
        name: pName, 
        code: pCode, 
        cost: pCost, 
        quantity: 1 
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  // Update order items quantity
  const handleQtyChange = (code, val) => {
    const qty = Math.max(1, parseInt(val) || 0);
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, quantity: qty } : item
    ));
  };

  // Delete item from Order Table
  const handleDeleteItem = (code) => {
    setOrderItems(orderItems.filter(item => item.code !== code));
  };

  // Document File Upload handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  // Calculate Total Quantity
  const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);

  // Form Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse) {
      alert("Please select a warehouse.");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add at least one product to the adjustment order table.");
      return;
    }

    try {
      let docUrl = null;
      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);
        try {
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            docUrl = uploadRes.data.url;
          }
        } catch (error) {
          console.error('Error uploading document:', error);
          alert('Failed to upload document');
          return;
        }
      }

      const payload = {
        warehouse,
        documentName: docUrl,
        items: orderItems,
        note
      };

      const res = await api.post('/products/adjustments', payload);
      if (res.data.success) {
        alert(`Stock Adjustment Created successfully!\nWarehouse: ${warehouse}\nTotal items adjusted: ${totalQuantity}`);
        // Reset Form
        setWarehouse('');
        setDocumentFile(null);
        setOrderItems([]);
        setNote('');
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to create adjustment: ' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header */}
      <div className="mb-6 border-b border-blue-500 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">Add Adjustment</h1>
        <p className="text-sm text-gray-500 mt-1">The field labels marked with * are required input fields.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Warehouse *</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full border border-blue-500 rounded-md px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="">Select warehouse...</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="North Branch Warehouse">North Branch Warehouse</option>
              <option value="East Side Storage">East Side Storage</option>
            </select>
          </div>

          {/* Attach Document */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Attach Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-blue-500 rounded cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors">
                <Upload size={14} className="text-gray-500" />
                <span>Choose File</span>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
              <span className="text-xs text-gray-500 truncate">
                {documentFile ? documentFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

        </div>

        {/* Product Search & Dropdown Selection */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Select Product</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={handleProductSearchChange}
              placeholder="Please type product code/name and select..."
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-blue-500 rounded-md shadow-lg max-h-60 overflow-y-auto divide-y divide-blue-500">
              {searchResults.map((product, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-xs text-gray-500 font-mono">Code: {product.code} (Cost: ${product.cost})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Table Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
            <span>Order Table *</span>
            <span className="text-[10px] text-gray-500 lowercase normal-case">(products to adjust)</span>
          </h2>
          
          <div className="overflow-x-auto border border-blue-500 rounded-lg">
            <table className="block w-full overflow-x-auto w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-blue-500">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Name</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Code</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Unit Cost</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Quantity</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/55 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{item.name}</td>
                      {/* Code */}
                      <td className="px-6 py-3.5 text-sm text-gray-600">{item.code}</td>
                      {/* Unit Cost */}
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">${Number(item.cost || 0).toFixed(2)}</td>
                      {/* Quantity */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.code, e.target.value)}
                          className="w-20 border border-blue-500 rounded px-2 py-1 text-sm bg-white text-black outline-none focus:border-blue-450 text-center font-semibold"
                        />
                      </td>
                      {/* Action */}
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.code)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-xs text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Info size={20} className="text-gray-400" />
                        <span>No products added to adjustment list yet. Search above to add.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {/* Total Summary Row */}
                <tr className="bg-gray-50/80 font-bold border-t border-blue-500">
                  <td colSpan="3" className="px-6 py-3 text-sm text-gray-800">Total</td>
                  <td colSpan="2" className="px-6 py-3 text-sm text-gray-900 pl-10">{totalQuantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Note</label>
          <textarea
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type stock adjustment note details here..."
            className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          ></textarea>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWarehouse('');
              setDocumentFile(null);
              setOrderItems([]);
              setNote('');
            }}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded-lg text-sm font-semibold shadow transition-colors"
          >
            Submit Adjustment
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddAdjustment;
