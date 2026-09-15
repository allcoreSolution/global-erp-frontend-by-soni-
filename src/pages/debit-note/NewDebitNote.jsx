import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewDebitNote = () => {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    // Basic Information
    debitNoteNo: 'DN-00001',
    date: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    type: 'Purchase Return',
    status: 'Draft',
    
    // Supplier Details
    supplier: '',
    supplierCode: '',
    contact: '',
    mobile: '',

    // Original Purchase Details
    originalInvoiceNo: '',
    originalInvoiceDate: '',
    poNo: '',
    grnNo: '',
    
    // Summary Inputs
    discount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    roundOff: 0,
    
    // Adjustment / Settlement
    adjustmentType: 'Adjust Against Invoice',
    adjustInvoiceNo: '',
    adjustAmount: '',
    remainingAmount: '',
    
    // Accounting
    supplierLedger: '',
    purchaseReturnLedger: '',
    taxAccount: '',
    costCenter: '',
    
    // Remarks
    remarks: ''
  });

  // Debit Note Items Rows
  const [items, setItems] = useState([
    { id: 1, product: '', batch: '', qty: 0, rate: 0, taxPercent: 0, amount: 0 }
  ]);

  // Summary Calculated State
  const [summary, setSummary] = useState({
    subTotal: 0,
    grandTotal: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (['discount', 'cgst', 'sgst', 'igst', 'roundOff'].includes(name)) {
        calculateSummary(items, { ...updated, [name]: Number(value) || 0 });
      }
      return updated;
    });
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'qty' || field === 'rate') {
             const q = Number(updatedItem.qty) || 0;
             const r = Number(updatedItem.rate) || 0;
             updatedItem.amount = q * r;
          }
          return updatedItem;
        }
        return item;
      });
      calculateSummary(newItems, form);
      return newItems;
    });
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1;
    setItems([...items, { id: newId, product: '', batch: '', qty: 0, rate: 0, taxPercent: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    setItems(prev => {
      const newItems = prev.filter(p => p.id !== id);
      calculateSummary(newItems, form);
      return newItems;
    });
  };

  const calculateSummary = (currentItems, currentForm) => {
    const subT = currentItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    const d = Number(currentForm.discount) || 0;
    const c = Number(currentForm.cgst) || 0;
    const s = Number(currentForm.sgst) || 0;
    const i = Number(currentForm.igst) || 0;
    const r = Number(currentForm.roundOff) || 0;
    
    const grandT = subT - d + c + s + i + r;

    setSummary({
      subTotal: subT,
      grandTotal: grandT
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Debit Note Posted successfully!');
    navigate('/debit-note/list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/debit-note/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Debit Note List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/debit-note/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button type="button" className="px-4 py-2 bg-blue-100 border border-blue-200 text-blue-700 rounded text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm">
             Approve
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
             <FileMinus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900 uppercase tracking-wide">CREATE DEBIT NOTE</h2>
            <p className="text-sm text-slate-500 font-medium">Record purchase returns or supplier debits</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Debit Note No.</label>
                  <input type="text" name="debitNoteNo" value={form.debitNoteNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option value="">Select Company</option>
                    <option>Main Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option value="">Select Branch</option>
                    <option>HQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option>Purchase Return</option>
                    <option>Price Difference</option>
                    <option>Discount Received</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option>Draft</option>
                    <option>Approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: SUPPLIER DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Supplier Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select name="supplier" value={form.supplier} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option value="">Select Supplier</option>
                    <option>Global Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input type="text" name="supplierCode" value={form.supplierCode} onChange={handleChange} placeholder="SUP-001" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact</label>
                  <input type="text" name="contact" value={form.contact} onChange={handleChange} placeholder="Person Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                  <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Phone No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
              </div>
            </div>

            {/* SECTION: ORIGINAL PURCHASE DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Original Purchase Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No. *</label>
                  <select name="originalInvoiceNo" value={form.originalInvoiceNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                    <option value="">Select Invoice</option>
                    <option>INV-2023-445</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input type="date" name="originalInvoiceDate" value={form.originalInvoiceDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PO No.</label>
                  <input type="text" name="poNo" value={form.poNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GRN No.</label>
                  <input type="text" name="grnNo" value={form.grnNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: DEBIT NOTE ITEMS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Debit Note Items</h3>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-1.5 rounded-md border border-red-100 hover:border-red-200">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-2 py-2 text-xs font-bold uppercase w-1/4">Product</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase">Batch</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-24">Qty</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-28">Rate (₹)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-24">Tax (%)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-32">Amount (₹)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase text-center w-10">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-2 py-2">
                        <select value={item.product} onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white">
                          <option value="">Select Product</option>
                          <option>Item A</option>
                          <option>Item B</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={item.batch} onChange={(e) => handleItemChange(item.id, 'batch', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-red-700 focus:border-red-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" value={item.amount} readOnly className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm font-bold text-slate-800 bg-slate-100 text-right cursor-not-allowed" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2 block">
                        No items added. Click "Add Item" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: SETTLEMENT, ACCOUNTING & REMARKS */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* SECTION: ADJUSTMENT / SETTLEMENT */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Adjustment / Settlement</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="col-span-2 md:col-span-4">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                     <select name="adjustmentType" value={form.adjustmentType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                       <option>Adjust Against Invoice</option>
                       <option>Keep on Account / Advance</option>
                       <option>Cash Refund</option>
                     </select>
                   </div>
                   <div className="col-span-2 text-slate-500">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice</label>
                     <input type="text" name="adjustInvoiceNo" value={form.adjustInvoiceNo} onChange={handleChange} placeholder="Select Invoice to Adjust" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Adjust Amount</label>
                     <input type="number" name="adjustAmount" value={form.adjustAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Remaining</label>
                     <input type="number" name="remainingAmount" value={form.remainingAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-slate-50" />
                   </div>
                 </div>
               </div>

               {/* SECTION: ACCOUNTING */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Ledger</label>
                     <select name="supplierLedger" value={form.supplierLedger} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                       <option value="">Select Ledger</option>
                       <option>Creditors - Global Electronics</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Return Ledger</label>
                     <select name="purchaseReturnLedger" value={form.purchaseReturnLedger} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                       <option value="">Select Ledger</option>
                       <option>Purchase Returns A/C</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Account</label>
                     <select name="taxAccount" value={form.taxAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                       <option value="">Select</option>
                       <option>Input GST A/C</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                     <select name="costCenter" value={form.costCenter} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none bg-white">
                       <option value="">Select</option>
                       <option>Main Branch Operations</option>
                     </select>
                   </div>
                 </div>
               </div>
               
               {/* SECTION: REMARKS & ATTACHMENT */}
               <div className="border border-slate-200 rounded-lg p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none resize-none" placeholder="Reason for return..."></textarea>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attachment</label>
                       <button type="button" className="flex flex-col items-center justify-center gap-1 w-full h-[76px] border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-red-400 hover:text-red-600 transition-colors text-sm font-medium text-slate-500">
                          <UploadCloud size={20} />
                          <span className="text-xs">Upload Document</span>
                       </button>
                    </div>
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN: AMOUNT SUMMARY */}
            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50 flex flex-col h-max">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Amount Summary</h3>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">Sub Total</span>
                     <span className="font-bold text-slate-800">₹{summary.subTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">Discount (-)</span>
                     <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white text-red-600" />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">CGST (+)</span>
                     <input type="number" name="cgst" value={form.cgst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">SGST (+)</span>
                     <input type="number" name="sgst" value={form.sgst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">IGST (+)</span>
                     <input type="number" name="igst" value={form.igst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">Round Off</span>
                     <input type="number" name="roundOff" value={form.roundOff} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white" />
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-300 flex justify-between items-center">
                     <span className="text-sm font-bold text-slate-800 uppercase">Grand Total</span>
                     <span className="text-2xl font-black text-red-700">₹{summary.grandTotal.toFixed(2)}</span>
                  </div>
               </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDebitNote;
