import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Upload, AlertCircle, Info } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AddAdjustment = () => {
  const [products, setProducts] = useState([]);

  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          api.get('/products'),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } }))
        ]);
        
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        }
        if (warehousesRes.data && warehousesRes.data.success) {
          setWarehouses(warehousesRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // States
  const [warehouse, setWarehouse] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  // Removed text-based productSearch state since we are using a select dropdown now
  const [orderItems, setOrderItems] = useState([]);
  const [note, setNote] = useState('');

  const handleSelectProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const pCode = product.productCode || product.sku || 'N/A';
    const pName = product.productName;
    const pCost = Number(product.productCost) || 0;
    
    // Find warehouse specific stock
    const whStockObj = product.warehouseStocks?.find(ws => ws.warehouse === warehouse);
    const pStock = whStockObj ? whStockObj.stock : 0;
    
    const exists = orderItems.find(item => item.code === pCode);
    if (exists) {
      setOrderItems(orderItems.map(item => 
        item.code === pCode ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, { 
        id: product._id,
        name: pName, 
        code: pCode, 
        cost: pCost, 
        currentStock: pStock,
        actionType: 'Subtract',
        quantity: 1 
      }]);
    }
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
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please select a warehouse.' });
      return;
    }
    if (orderItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Items', text: 'Please add at least one product to the adjustment order table.' });
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
          Swal.fire({ icon: 'info', title: 'Upload Failed', text: 'Note: Server upload failed (500 Error). We will proceed creating the adjustment without the document.' });
          // Do not return, allow the process to continue
        }
      }

      const formattedItems = orderItems.map(item => ({
        name: item.name,
        code: item.code,
        cost: item.cost,
        quantity: item.actionType === 'Subtract' ? -Math.abs(item.quantity) : Math.abs(item.quantity)
      }));

      const payload = {
        warehouse,
        documentName: docUrl,
        items: formattedItems,
        note
      };

      const res = await api.post('/products/adjustments', payload);
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Adjustment Created!',
          text: `Warehouse: ${warehouse} | Total items adjusted: ${totalQuantity}`
        });
        // Reset Form
        setWarehouse('');
        setDocumentFile(null);
        setOrderItems([]);
        setNote('');
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create adjustment: ' + errorMsg });
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
              {warehouses.map(w => (
                <option key={w._id} value={w.name}>{w.name}</option>
              ))}
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

        {/* Product Selection Dropdown */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Select Product *</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <select
              onChange={(e) => {
                handleSelectProduct(e.target.value);
                e.target.value = ""; // Reset after selection
              }}
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 appearance-none"
            >
              <option value="">{warehouse ? "-- View and select a product from this warehouse --" : "-- Please select a warehouse first --"}</option>
              {warehouse && products
                .filter(p => p.warehouseStocks?.some(ws => ws.warehouse === warehouse))
                .map(product => {
                  const whStockObj = product.warehouseStocks.find(ws => ws.warehouse === warehouse);
                  const whStock = whStockObj ? whStockObj.stock : 0;
                  return (
                    <option key={product._id} value={product._id}>
                      {product.productName} (Code: {product.productCode}) - Available Stock: {whStock}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Order Table Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
            <span>Order Table *</span>
            <span className="text-[10px] text-gray-500 lowercase normal-case">(products to adjust)</span>
          </h2>
          
          <div className="overflow-x-auto border border-blue-500 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-blue-500">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Name</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Code</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Current Stock</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Unit Cost</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">Adj. Qty (+/-)</th>
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
                      {/* Current Stock */}
                      <td className="px-6 py-3.5 text-sm text-indigo-700 font-bold">{item.currentStock}</td>
                      {/* Unit Cost */}
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">${Number(item.cost || 0).toFixed(2)}</td>
                      {/* Quantity */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select 
                            value={item.actionType || 'Subtract'}
                            onChange={(e) => {
                              setOrderItems(orderItems.map(i => i.code === item.code ? { ...i, actionType: e.target.value } : i));
                            }}
                            className={`border rounded px-2 py-1 text-sm outline-none font-semibold ${item.actionType === 'Add' ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-rose-500 text-rose-700 bg-rose-50'}`}
                          >
                            <option value="Subtract">(-) Subtract</option>
                            <option value="Add">(+) Add</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === '' ? '' : item.quantity}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val !== '') {
                                val = Math.max(1, parseInt(val) || 1);
                              }
                              setOrderItems(orderItems.map(i => i.code === item.code ? { ...i, quantity: val } : i));
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '' || e.target.value === '0') {
                                setOrderItems(orderItems.map(i => i.code === item.code ? { ...i, quantity: 1 } : i));
                              }
                            }}
                            className="w-20 border border-blue-500 rounded px-2 py-1 text-sm bg-white text-black outline-none focus:border-blue-450 font-semibold text-center"
                          />
                        </div>
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
                  <td colSpan="4" className="px-6 py-3 text-sm text-gray-800 text-right">Total Adjustment Qty</td>
                  <td colSpan="2" className="px-6 py-3 text-sm text-gray-900">{totalQuantity}</td>
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
