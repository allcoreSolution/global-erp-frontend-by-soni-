import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, Search, UploadCloud, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddPurchaseReturn = () => {
  const navigate = useNavigate();

  // Basic Details State
  const [form, setForm] = useState({
    returnNo: 'PR-00001',
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

  // Items State
  const [items, setItems] = useState([
    { id: 1, product: '', batch: '', purchasedQty: 100, returnQty: 20, rate: 500, taxPercent: 18, amount: 10000 }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    goodsValue: 10000,
    discount: 500,
    tax: 1710,
    returnTotal: 11210
  });

  const [returnReason, setReturnReason] = useState('Damaged Goods');
  const [itemCondition, setItemCondition] = useState('Damaged');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'returnQty' || field === 'rate') {
          updated.amount = Number(updated.returnQty) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, product: '', batch: '', purchasedQty: 1, returnQty: 1, rate: 0, taxPercent: 18, amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Calculate Totals dynamically
  useEffect(() => {
    const goodsValue = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = items.reduce((sum, item) => sum + (item.amount * (Number(item.taxPercent) / 100)), 0);
    const discount = 500; // Mocked discount for now based on mockup
    
    setTotals({
      goodsValue,
      discount,
      tax,
      returnTotal: goodsValue - discount + tax
    });
  }, [items]);

  const handleSave = (e) => {
    e.preventDefault();
    alert('Purchase Return Processed successfully!');
    navigate('/purchases/purchase-return');
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Type *</label>
                  <select name="returnType" value={form.returnType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Partial</option>
                    <option>Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Company</option>
                    <option>Main Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Branch</option>
                    <option>HQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select name="warehouse" value={form.warehouse} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Warehouse</option>
                    <option>Central Warehouse</option>
                  </select>
                </div>
                <div className="col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white max-w-[200px]">
                    <option>Draft</option>
                    <option>Completed</option>
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
                  <select name="purchaseInvoice" value={form.purchaseInvoice} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Invoice</option>
                    <option>PINV-2023-01</option>
                  </select>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Order</label>
                  <select name="purchaseOrder" value={form.purchaseOrder} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select PO</option>
                  </select>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input type="text" value={form.purchaseDate} readOnly placeholder="Auto" className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none" />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select name="supplier" value={form.supplier} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Supplier</option>
                    <option>Apple Global Corp</option>
                  </select>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Invoice No.</label>
                  <input type="text" name="supplierInvoiceNo" value={form.supplierInvoiceNo} onChange={handleChange} placeholder="Invoice No." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GRN No.</label>
                  <select name="grnNo" value={form.grnNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select GRN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: RETURN ITEMS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return Items</h3>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <Plus size={14} /> Add Item
              </button>
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
                        <input type="text" required placeholder="Select Product" value={item.product} onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
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
            </div>
            
            <div className="flex gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
               <div className="w-64">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Reason</label>
                  <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 outline-none bg-white focus:border-indigo-500">
                    <option>Damaged Goods</option>
                    <option>Defective Product</option>
                    <option>Incorrect Item Delivered</option>
                    <option>Quality Not as Expected</option>
                  </select>
               </div>
               <div className="w-64">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Condition</label>
                  <select value={itemCondition} onChange={(e) => setItemCondition(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 outline-none bg-white focus:border-indigo-500">
                    <option>Damaged</option>
                    <option>Good</option>
                    <option>Opened</option>
                    <option>Sealed</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* LEFT COLUMN */}
             <div className="space-y-6">
                
                {/* SECTION: RETURN / WAREHOUSE DETAILS */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Return / Warehouse Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Return Warehouse</label>
                      <select name="returnWarehouse" value={form.returnWarehouse} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option value="">Select</option>
                        <option>Central Warehouse</option>
                        <option>Transit Hub</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                      <input type="text" readOnly placeholder="Auto" className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch Date</label>
                      <input type="date" name="dispatchDate" value={form.dispatchDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Transporter</label>
                      <select name="transporter" value={form.transporter} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option value="">Select</option>
                        <option>FedEx Logistics</option>
                        <option>BlueDart</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No.</label>
                      <input type="text" name="vehicleNo" value={form.vehicleNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">LR / Tracking No.</label>
                      <input type="text" name="lrNo" value={form.lrNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-2">
                      <input type="checkbox" name="stockAdjustment" checked={form.stockAdjustment} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                      <label className="text-sm font-medium text-slate-700">Update Stock Adjustment</label>
                    </div>
                  </div>
                </div>

                {/* SECTION: DEBIT NOTE / SETTLEMENT */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Debit Note / Settlement</h3>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Debit Note No.</label>
                      <input type="text" name="debitNoteNo" value={form.debitNoteNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Type</label>
                      <select name="settlementType" value={form.settlementType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option>Credit Note</option>
                        <option>Bank Refund</option>
                        <option>Cash Refund</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Amount</label>
                      <input type="text" readOnly value={`₹ ${totals.returnTotal.toFixed(2)}`} className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 outline-none cursor-not-allowed" />
                    </div>
                    
                    <div className="col-span-2 flex flex-col gap-2 mt-2">
                       <div className="flex items-center gap-2">
                         <input type="checkbox" name="adjustAgainstInvoice" checked={form.adjustAgainstInvoice} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                         <label className="text-sm font-medium text-slate-700">Adjust Against Future Invoices</label>
                       </div>
                       <div className="flex items-center gap-2">
                         <input type="checkbox" name="supplierRefund" checked={form.supplierRefund} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                         <label className="text-sm font-medium text-slate-700">Awaiting Supplier Refund</label>
                       </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: APPROVAL & NOTES */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Approval & Notes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Requested By</label>
                      <select name="requestedBy" value={form.requestedBy} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option value="">Select</option>
                        <option>Store Manager</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                      <select name="approvedBy" value={form.approvedBy} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option value="">Select</option>
                        <option>Finance Manager</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
                    <div className="col-span-2 mt-2">
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment</label>
                       <button type="button" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium text-slate-500">
                          <UploadCloud size={18} /> Upload Document
                       </button>
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
