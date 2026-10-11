import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, Search, UploadCloud, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const AddPurchaseReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    returnNo: `PR-${Date.now().toString().slice(-6)}`,
    returnDate: new Date().toISOString().split('T')[0],
    returnType: 'Partial',
    company: '',
    branch: '',
    warehouse: '',
    status: 'Draft',
    
    purchaseInvoice: '',
    purchaseOrder: '',
    purchaseDate: '',
    supplier: '',
    supplierInvoiceNo: '',
    grnNo: '',
    
    returnWarehouse: '',
    dispatchDate: '',
    transporter: '',
    vehicleNo: '',
    lrNo: '',
    stockAdjustment: true,
    
    debitNoteNo: 'DN-00001',
    settlementType: 'Credit Note',
    adjustAgainstInvoice: false,
    supplierRefund: false,
    
    requestedBy: '',
    approvedBy: '',
    remarks: ''
  });

  const [items, setItems] = useState([
    { id: 1, product: '', batch: '', purchasedQty: 1, returnQty: 1, rate: 0, taxPercent: 0, amount: 0 }
  ]);
  const [totals, setTotals] = useState({
    goodsValue: 0,
    discount: 0,
    tax: 0,
    returnTotal: 0
  });

  const [returnReason, setReturnReason] = useState('Damaged Goods');
  const [itemCondition, setItemCondition] = useState('Damaged');
  
  // Database States
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch data from main tables
        const [compRes, branchRes, whRes, suppRes, purRes, empRes, prodRes] = await Promise.all([
          api.get('/companies').catch(() => ({ data: { data: [] } })),
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/purchases').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } })),
          api.get('/products').catch(() => ({ data: { data: [] } }))
        ]);
        if (compRes.data?.data) setCompanies(compRes.data.data);
        if (branchRes.data?.data) setBranches(branchRes.data.data);
        if (whRes.data?.data) setWarehouses(whRes.data.data);
        if (suppRes.data?.data) setSuppliers(suppRes.data.data);
        if (purRes.data?.data) setPurchases(purRes.data.data);
        if (empRes.data?.data) setEmployees(empRes.data.data);
        if (prodRes.data?.data) setProducts(prodRes.data.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchDropdownData();
  }, []);
  
  useEffect(() => {
    if (id) {
      const fetchReturn = async () => {
        try {
          const { data } = await api.get(`/purchase-returns/${id}`);
          if (data.success && data.data) {
            const ret = data.data;
            setForm({
              returnNo: ret.returnNo || '',
              returnDate: ret.returnDate || '',
              returnType: ret.returnType || 'Partial',
              company: ret.company || '',
              branch: ret.branch || '',
              warehouse: ret.warehouse || '',
              status: ret.status || 'Draft',
              purchaseInvoice: ret.purchaseInvoice || '',
              purchaseOrder: ret.purchaseOrder || '',
              purchaseDate: ret.purchaseDate || '',
              supplier: ret.supplier || '',
              supplierInvoiceNo: ret.supplierInvoiceNo || '',
              grnNo: ret.grnNo || '',
              returnWarehouse: ret.returnWarehouse || '',
              dispatchDate: ret.dispatchDate || '',
              transporter: ret.transporter || '',
              vehicleNo: ret.vehicleNo || '',
              lrNo: ret.lrNo || '',
              stockAdjustment: ret.stockAdjustment ?? true,
              debitNoteNo: ret.debitNoteNo || '',
              settlementType: ret.settlementType || 'Credit Note',
              adjustAgainstInvoice: ret.adjustAgainstInvoice ?? false,
              supplierRefund: ret.supplierRefund ?? false,
              requestedBy: ret.requestedBy || '',
              approvedBy: ret.approvedBy || '',
              remarks: ret.remarks || ''
            });
            setReturnReason(ret.returnReason || 'Damaged Goods');
            setItemCondition(ret.itemCondition || 'Damaged');
            if (ret.items && ret.items.length > 0) {
              setItems(ret.items.map((item, idx) => ({ ...item, id: item._id || idx })));
            }
          }
        } catch (error) {
          console.error("Failed to fetch purchase return", error);
        }
      };
      fetchReturn();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setForm(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Auto-fill logic for Purchase Invoice
    if (name === 'purchaseInvoice') {
      const selectedPurchase = purchases.find(p => p._id === finalValue);
      if (selectedPurchase) {
        setForm(prev => ({
          ...prev,
          purchaseDate: selectedPurchase.purchaseDate ? selectedPurchase.purchaseDate.split('T')[0] : '',
          supplier: typeof selectedPurchase.supplier === 'object' ? selectedPurchase.supplier?._id : selectedPurchase.supplier || ''
        }));
        
        const purchaseItems = selectedPurchase.orderItems || selectedPurchase.items || [];
        if (purchaseItems.length > 0) {
          const newItems = purchaseItems.map((item, idx) => ({
            id: idx + 1,
            product: item.product?._id || item.product || item.productId || '',
            batch: item.batch || '',
            purchasedQty: item.quantity || item.qty || 1,
            returnQty: item.quantity || item.qty || 1,
            rate: item.netUnitPrice || item.rate || item.price || 0,
            taxPercent: item.taxPercent || item.tax || 0,
            amount: (item.quantity || item.qty || 1) * (item.netUnitPrice || item.rate || item.price || 0)
          }));
          setItems(newItems);
        } else {
          setItems([{ id: 1, product: '', batch: '', purchasedQty: 1, returnQty: 1, rate: 0, taxPercent: 0, amount: 0 }]);
        }
      }
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        // Auto-fill product rate when a product is selected
        if (field === 'product' && value) {
          const selectedProduct = products.find(p => p._id === value);
          if (selectedProduct) {
            updated.rate = Number(selectedProduct.productCost || 0);
          }
        }

        // Recalculate base amount if qty, rate, or product changes
        if (['returnQty', 'rate', 'product'].includes(field)) {
          updated.amount = Number(updated.returnQty || 0) * Number(updated.rate || 0);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, product: '', batch: '', purchasedQty: 1, returnQty: 1, rate: 0, taxPercent: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  useEffect(() => {
    const goodsValue = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const tax = items.reduce((sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.taxPercent) / 100)), 0);
    const discount = 0; 
    
    setTotals({
      goodsValue,
      discount,
      tax,
      returnTotal: goodsValue - discount + tax
    });
  }, [items]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      returnReason,
      itemCondition,
      items: items.map(item => ({
        product: item.product || '',
        batch: item.batch || '',
        purchasedQty: Number(item.purchasedQty) || 0,
        returnQty: Number(item.returnQty) || 1,
        rate: Number(item.rate) || 0,
        taxPercent: Number(item.taxPercent) || 0,
        amount: Number(item.amount) || 0
      })),
      totals
    };

    if (!payload.supplier) delete payload.supplier;
    if (!payload.warehouse) delete payload.warehouse;
    if (!payload.company) delete payload.company;
    if (!payload.branch) delete payload.branch;

    try {
      let documentUrl = '';
      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          documentUrl = uploadRes.data.url;
        }
      }
      
      if (documentUrl) {
        payload.documentUrl = documentUrl;
      }
      if (id) {
        await api.put(`/purchase-returns/${id}`, payload);
        await Swal.fire({ title: 'Success!', text: 'Purchase Return Updated successfully!', icon: 'success', confirmButtonColor: '#4f46e5' });
      } else {
        await api.post('/purchase-returns', payload);
        await Swal.fire({ title: 'Success!', text: 'Purchase Return Processed successfully!', icon: 'success', confirmButtonColor: '#4f46e5' });
      }
      navigate('/purchases/purchase-return');
    } catch (error) {
      console.error('Error saving purchase return', error);
      Swal.fire({ title: 'Error!', text: 'Failed to save purchase return', icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/purchases/purchase-return')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Purchase Return
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/purchases/purchase-return')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Complete Return
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-red-900 uppercase tracking-wide">PURCHASE RETURN</h2>
          <p className="text-sm text-slate-500 font-medium">Return purchased goods to supplier</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return No. *</label>
                  <input type="text" name="returnNo" value={form.returnNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date *</label>
                  <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select required name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.branchName || b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select required name="warehouse" value={form.warehouse} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Warehouse</option>
                    {warehouses
                      .filter(w => form.branch && (typeof w.branch === 'object' ? w.branch?._id : w.branch) === form.branch)
                      .map(w => <option key={w._id} value={w._id}>{w.warehouseName || w.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: ORIGINAL PURCHASE DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Original Purchase Details</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Invoice *</label>
                  <select required name="purchaseInvoice" value={form.purchaseInvoice} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Purchase Invoice</option>
                    {purchases.map(p => <option key={p._id} value={p._id}>{p.purchaseNo || p.invoiceNo}</option>)}
                  </select>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input type="text" value={form.purchaseDate} readOnly placeholder="Auto" className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none" />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select required name="supplier" value={form.supplier} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName || s.supplierName || s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: RETURN ITEMS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return Items</h3>
            </div>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-3 py-2 text-xs font-bold uppercase w-1/4">Product</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Batch</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Purchased</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Return</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Rate (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Tax (%)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <select required value={item.product} onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select Product</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.productName || p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" placeholder="---" value={item.batch} onChange={(e) => handleItemChange(item.id, 'batch', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.purchasedQty} onChange={(e) => handleItemChange(item.id, 'purchasedQty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-slate-100 cursor-not-allowed" readOnly />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.returnQty} onChange={(e) => handleItemChange(item.id, 'returnQty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white font-bold text-red-700" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                         <select value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white">
                           <option value="0">0%</option>
                           <option value="5">5%</option>
                           <option value="12">12%</option>
                           <option value="18">18%</option>
                           <option value="28">28%</option>
                         </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" readOnly value={item.amount} className="w-full border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-slate-700 outline-none cursor-not-allowed" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-sm font-semibold transition-colors">
                  <Plus size={16} /> Add Return Item
                </button>
              </div>
            </div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* LEFT COLUMN: NOTES ONLY */}
             <div className="space-y-6">
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Notes</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Reason for Return</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" placeholder="Maal kyu wapas ja raha hai? (Optional)" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Document</label>
                      <div className="flex items-center gap-2 mt-1">
                        <label className="flex-1 cursor-pointer bg-slate-50 border border-dashed border-slate-300 rounded px-3 py-2 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                          <UploadCloud size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-500">{documentFile ? documentFile.name : 'Click to upload return document'}</span>
                          <input type="file" className="hidden" onChange={e => setDocumentFile(e.target.files[0])} />
                        </label>
                        {documentFile && (
                          <button type="button" onClick={() => setDocumentFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
             </div>
             
             {/* RIGHT COLUMN: SUMMARY */}
             <div>
                <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 sticky top-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-4 border-b border-slate-200 flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" /> Return Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Goods Value</span>
                      <span>₹ {totals.goodsValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Discount (-)</span>
                      <span>₹ {totals.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Tax (+)</span>
                      <span>₹ {totals.tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800">
                          RETURN TOTAL
                        </span>
                        <span className="text-2xl font-black text-red-600">
                          ₹ {totals.returnTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AddPurchaseReturn;
