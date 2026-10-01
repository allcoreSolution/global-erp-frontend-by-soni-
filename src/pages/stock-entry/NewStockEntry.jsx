import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewStockEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    // Basic Information
    stockNo: `STK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)}`,
    stockDate: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    warehouseBase: '', // the one in basic info
    stockType: 'Opening Stock',
    
    // Location
    locationWarehouse: '',
    rack: '',
    bin: '',

    // Reference
    supplier: '',
    poNo: '',
    invoiceNo: '',
    
    // Remarks
    remarks: ''
  });

  // Product Entry Rows
  const [products, setProducts] = useState([
    { id: 1, product: '', sku: '', batch: '', expiry: '', qty: 0, rate: 0 }
  ]);

  // Summary State
  const [summary, setSummary] = useState({
    totalQty: 0,
    stockValue: 0
  });

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const res = await api.get(`/stock-entries/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            setForm({
              stockNo: data.stockNo || '',
              stockDate: data.stockDate || '',
              company: data.company || '',
              branch: data.branch || '',
              warehouseBase: data.warehouseBase || '',
              stockType: data.stockType || 'Opening Stock',
              locationWarehouse: data.locationWarehouse || '',
              rack: data.rack || '',
              bin: data.bin || '',
              supplier: data.supplier || '',
              poNo: data.poNo || '',
              invoiceNo: data.invoiceNo || '',
              remarks: data.remarks || ''
            });
            if (data.products && data.products.length > 0) {
              setProducts(data.products.map((p, idx) => ({ ...p, id: idx + 1 })));
            }
            if (data.summary) {
              setSummary(data.summary);
            }
          }
        } catch (err) {
          console.error("Error fetching stock entry", err);
        }
      };
      fetchEntry();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (id, field, value) => {
    setProducts(prev => {
      const newProducts = prev.map(prod => {
        if (prod.id === id) {
          return { ...prod, [field]: value };
        }
        return prod;
      });
      calculateSummary(newProducts);
      return newProducts;
    });
  };

  const addProduct = () => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { id: newId, product: '', sku: '', batch: '', expiry: '', qty: 0, rate: 0 }]);
    calculateSummary([...products, { id: newId, qty: 0, rate: 0 }]);
  };

  const removeProduct = (id) => {
    setProducts(prev => {
      const newProducts = prev.filter(p => p.id !== id);
      calculateSummary(newProducts);
      return newProducts;
    });
  };

  const calculateSummary = (currentProducts) => {
    const totalQ = currentProducts.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
    const totalV = currentProducts.reduce((sum, p) => {
       const qty = Number(p.qty) || 0;
       const rate = Number(p.rate) || 0;
       return sum + (qty * rate);
    }, 0);
    setSummary({
      totalQty: totalQ,
      stockValue: totalV
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...form,
        voucherNo: form.stockNo, // Added to prevent E11000 duplicate key error on old voucherNo index
        products: products.map(p => ({
          ...p,
          qty: Number(p.qty) || 0,
          rate: Number(p.rate) || 0,
        })),
        summary: {
          totalQty: Number(summary.totalQty) || 0,
          stockValue: Number(summary.stockValue) || 0,
        }
      };

      if (id) {
        await api.put(`/stock-entries/${id}`, payload);
        alert('Stock Entry Updated successfully!');
      } else {
        await api.post('/stock-entries', payload);
        alert('Stock Entry Posted successfully!');
      }
      navigate('/stock-entry/list');
    } catch (error) {
      console.error('Error saving stock entry', error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      alert('Failed to save stock entry. Backend error: ' + JSON.stringify(errMsg));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/stock-entry/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Stock Entry List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/stock-entry/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Stock
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-emerald-900 uppercase tracking-wide">ADD STOCK</h2>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock No.</label>
                  <input type="text" name="stockNo" value={form.stockNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Date</label>
                  <input type="date" name="stockDate" value={form.stockDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                  <DynamicSelect category="Company" name="company" value={form.company} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <DynamicSelect category="Branch" name="branch" value={form.branch} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse</label>
                  <DynamicSelect category="Warehouse" name="warehouseBase" value={form.warehouseBase} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Type</label>
                  <select name="stockType" value={form.stockType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                    <option value="Opening Stock">Opening Stock</option>
                    <option value="Stock Adjustment">Stock Adjustment</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
                {/* SECTION: SUMMARY */}
                <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Summary</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Total Qty</span>
                        <span className="text-lg font-bold text-slate-800 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">{summary.totalQty}</span>
                     </div>
                     <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">Stock Value</span>
                        <span className="text-xl font-black text-emerald-600">₹{summary.stockValue.toFixed(2)}</span>
                     </div>
                  </div>
                </div>

                {/* SECTION: REFERENCE */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Reference</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                      <DynamicSelect category="Supplier" name="supplier" value={form.supplier} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PO No.</label>
                      <input type="text" name="poNo" value={form.poNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice</label>
                      <input type="text" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* SECTION: PRODUCT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Details</h3>
              <button type="button" onClick={addProduct} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                <Plus size={14} /> Add Product
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-2 py-2 text-xs font-bold uppercase w-1/4">Product</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase">SKU</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase">Batch</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase">Expiry</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-20">Qty</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-24">Rate (₹)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase text-center w-10">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-2 py-2">
                        <DynamicSelect category="Product" name="product" value={prod.product} onChange={(e) => handleProductChange(prod.id, 'product', e.target.value)} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={prod.sku} onChange={(e) => handleProductChange(prod.id, 'sku', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={prod.batch} onChange={(e) => handleProductChange(prod.id, 'batch', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="month" value={prod.expiry} onChange={(e) => handleProductChange(prod.id, 'expiry', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={prod.qty} onChange={(e) => handleProductChange(prod.id, 'qty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-emerald-700 focus:border-emerald-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={prod.rate} onChange={(e) => handleProductChange(prod.id, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeProduct(prod.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SECTION: LOCATION */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse</label>
                    <DynamicSelect category="Warehouse" name="locationWarehouse" value={form.locationWarehouse} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rack</label>
                    <input type="text" name="rack" value={form.rack} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bin</label>
                    <input type="text" name="bin" value={form.bin} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* REMARKS */}
              <div className="border border-slate-200 rounded-lg p-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none resize-none" placeholder="Any additional notes..."></textarea>
              </div>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default NewStockEntry;
