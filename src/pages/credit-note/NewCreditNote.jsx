import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FilePlus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewCreditNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form State
  const [form, setForm] = useState({
    // Basic Information
    creditNoteNo: 'CN-00001',
    date: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    type: 'Sales Return',
    status: 'Draft',
    
    // Customer Details
    customer: '',
    customerCode: '',
    customerType: '',
    mobile: '',

    // Original Sales Details
    originalInvoiceNo: '',
    originalInvoiceDate: '',
    orderNo: '',
    challan: '',
    
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
    refundAmount: '',
    remainingCredit: '',
    
    // Accounting
    customerLedger: '',
    salesReturnLedger: '',
    taxAccount: '',
    costCenter: '',
    
    // Remarks
    remarks: ''
  });

  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);

  // Credit Note Items Rows
  const [items, setItems] = useState([
    { id: 1, product: '', batch: '', qty: 0, rate: 0, taxPercent: 0, amount: 0 }
  ]);

  // Summary Calculated State
  const [summary, setSummary] = useState({
    subTotal: 0,
    grandTotal: 0
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCreditNote = async () => {
        try {
          const res = await api.get(`/credit-notes/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            setForm({
              creditNoteNo: data.creditNoteNo || '',
              date: data.date || '',
              company: data.company || '',
              branch: data.branch || '',
              type: data.type || 'Sales Return',
              status: data.status || 'Draft',
              customer: data.customer || '',
              customerCode: data.customerCode || '',
              customerType: data.customerType || '',
              mobile: data.mobile || '',
              originalInvoiceNo: data.originalInvoiceNo || '',
              originalInvoiceDate: data.originalInvoiceDate || '',
              orderNo: data.orderNo || '',
              challan: data.challan || '',
              discount: data.discount || 0,
              cgst: data.cgst || 0,
              sgst: data.sgst || 0,
              igst: data.igst || 0,
              roundOff: data.roundOff || 0,
              adjustmentType: data.adjustmentType || 'Adjust Against Invoice',
              adjustInvoiceNo: data.adjustInvoiceNo || '',
              adjustAmount: data.adjustAmount || 0,
              refundAmount: data.refundAmount || 0,
              remainingCredit: data.remainingCredit || 0,
              customerLedger: data.customerLedger || '',
              salesReturnLedger: data.salesReturnLedger || '',
              taxAccount: data.taxAccount || '',
              costCenter: data.costCenter || '',
              remarks: data.remarks || ''
            });
            if (data.items && data.items.length > 0) {
              setItems(data.items.map((it, idx) => ({ ...it, id: idx + 1 })));
            }
            if (data.summary) {
              setSummary({
                subTotal: data.summary.subTotal || 0,
                grandTotal: data.summary.grandTotal || 0
              });
            }
          }
        } catch (err) {
          console.error("Error fetching credit note", err);
          alert("Credit note not found!");
          navigate('/credit-note/list');
        }
      };
      fetchCreditNote();
    } else {
      setForm(prev => ({
        ...prev,
        creditNoteNo: `CN-${Math.floor(Math.random() * 90000) + 10000}`
      }));
    }
  }, [id, isEditMode, navigate]);

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      // The file object (attachment) is omitted from the JSON payload
      const payload = {
        ...form,
        voucherNo: form.creditNoteNo, // Protect from duplicate unique index
        
        // Deep Casting numbers
        discount: Number(form.discount) || 0,
        cgst: Number(form.cgst) || 0,
        sgst: Number(form.sgst) || 0,
        igst: Number(form.igst) || 0,
        roundOff: Number(form.roundOff) || 0,
        adjustAmount: Number(form.adjustAmount) || 0,
        refundAmount: Number(form.refundAmount) || 0,
        remainingCredit: Number(form.remainingCredit) || 0,

        items: items.map(item => ({
          product: item.product,
          batch: item.batch,
          qty: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          amount: Number(item.amount) || 0,
        })),

        summary: {
          subTotal: Number(summary.subTotal) || 0,
          grandTotal: Number(summary.grandTotal) || 0
        }
      };

      if (isEditMode) {
        await api.put(`/credit-notes/${id}`, payload);
        alert('Credit Note Updated successfully!');
      } else {
        await api.post('/credit-notes', payload);
        alert('Credit Note Posted successfully!');
      }
      navigate('/credit-note/list');
    } catch (err) {
      console.error("Failed to save credit note", err);
      alert('Failed to save credit note: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/credit-note/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Credit Note List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/credit-note/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
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
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
             <FilePlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">CREATE CREDIT NOTE</h2>
            <p className="text-sm text-slate-500 font-medium">Record sales returns or customer credits</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Note No.</label>
                  <input type="text" name="creditNoteNo" value={form.creditNoteNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <DynamicSelect 
                    name="company" 
                    category="Company" 
                    value={form.company} 
                    onChange={handleChange} 
                    defaultOptions={['Main Corp']} 
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <DynamicSelect 
                    name="branch" 
                    category="Branch" 
                    value={form.branch} 
                    onChange={handleChange} 
                    defaultOptions={['HQ']} 
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <DynamicSelect 
                    name="type" 
                    category="Credit Note Type" 
                    value={form.type} 
                    onChange={handleChange} 
                    defaultOptions={['Sales Return', 'Price Difference', 'Discount Given']} 
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect 
                    name="status" 
                    category="Status" 
                    value={form.status} 
                    onChange={handleChange} 
                    defaultOptions={['Draft', 'Approved']} 
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: CUSTOMER DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
                  <DynamicSelect 
                    name="customer" 
                    category="Customer" 
                    value={form.customer} 
                    onChange={handleChange} 
                    defaultOptions={['ABC Retailers']} 
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input type="text" name="customerCode" value={form.customerCode} onChange={handleChange} placeholder="CUST-001" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <input type="text" name="customerType" value={form.customerType} onChange={handleChange} placeholder="Wholesale" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                  <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Phone No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* SECTION: ORIGINAL SALES DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Original Sales Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No. *</label>
                  <DynamicSelect 
                    name="originalInvoiceNo" 
                    category="Invoice" 
                    value={form.originalInvoiceNo} 
                    onChange={handleChange} 
                    defaultOptions={['SINV-2023-112']} 
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input type="date" name="originalInvoiceDate" value={form.originalInvoiceDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order No.</label>
                  <input type="text" name="orderNo" value={form.orderNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Challan</label>
                  <input type="text" name="challan" value={form.challan} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: CREDIT NOTE ITEMS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Note Items</h3>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 hover:border-blue-200">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="block w-full overflow-x-auto w-full text-left min-w-[800px]">
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
                        <DynamicSelect 
                          name="product" 
                          category="Product" 
                          value={item.product} 
                          onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} 
                          defaultOptions={['Item X', 'Item Y']} 
                          className="w-full text-sm"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={item.batch} onChange={(e) => handleItemChange(item.id, 'batch', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none bg-white" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-blue-700 focus:border-blue-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none bg-white text-right" />
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

          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: SETTLEMENT, ACCOUNTING & REMARKS */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* SECTION: SETTLEMENT / ADJUSTMENT */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Settlement / Adjustment</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="col-span-2 md:col-span-4">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                     <DynamicSelect 
                       name="adjustmentType" 
                       category="Adjustment Type" 
                       value={form.adjustmentType} 
                       onChange={handleChange} 
                       defaultOptions={['Adjust Against Invoice', 'Keep on Account / Advance', 'Cash Refund']} 
                       className="w-full text-sm"
                     />
                   </div>
                   <div className="col-span-2 text-slate-500">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice</label>
                     <input type="text" name="adjustInvoiceNo" value={form.adjustInvoiceNo} onChange={handleChange} placeholder="Select Invoice to Adjust" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Adjust Amount</label>
                     <input type="number" name="adjustAmount" value={form.adjustAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Amount</label>
                     <input type="number" name="refundAmount" value={form.refundAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div className="col-span-2 md:col-span-4 mt-2">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Remaining Credit</label>
                     <input type="number" name="remainingCredit" value={form.remainingCredit} onChange={handleChange} placeholder="₹" className="w-1/2 border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-slate-50" />
                   </div>
                 </div>
               </div>

               {/* SECTION: ACCOUNTING */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Ledger</label>
                     <DynamicSelect 
                       name="customerLedger" 
                       category="Customer Ledger" 
                       value={form.customerLedger} 
                       onChange={handleChange} 
                       defaultOptions={['Debtors - ABC Retailers']} 
                       className="w-full text-sm"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Return Ledger</label>
                     <DynamicSelect 
                       name="salesReturnLedger" 
                       category="Return Ledger" 
                       value={form.salesReturnLedger} 
                       onChange={handleChange} 
                       defaultOptions={['Sales Returns A/C']} 
                       className="w-full text-sm"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Account</label>
                     <DynamicSelect 
                       name="taxAccount" 
                       category="Tax Account" 
                       value={form.taxAccount} 
                       onChange={handleChange} 
                       defaultOptions={['Output GST A/C']} 
                       className="w-full text-sm"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                     <DynamicSelect 
                       name="costCenter" 
                       category="Cost Center" 
                       value={form.costCenter} 
                       onChange={handleChange} 
                       defaultOptions={['Main Branch Sales']} 
                       className="w-full text-sm"
                     />
                   </div>
                 </div>
               </div>
               
               {/* SECTION: REMARKS & ATTACHMENT */}
               <div className="border border-slate-200 rounded-lg p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Reason for credit..."></textarea>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attachment</label>
                       
                       <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                       />

                       {!attachment ? (
                         <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-1 w-full h-[76px] border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium text-slate-500"
                         >
                            <UploadCloud size={20} />
                            <span className="text-xs">Upload Document</span>
                         </button>
                       ) : (
                         <div className="flex items-center justify-between w-full h-[76px] border border-slate-200 rounded px-4 bg-slate-50 text-sm">
                            <span className="truncate max-w-[200px] font-medium text-slate-700">{attachment.name}</span>
                            <button type="button" onClick={removeAttachment} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors">
                              <X size={16} />
                            </button>
                         </div>
                       )}
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
                     <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-blue-500 outline-none bg-white text-red-600" />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">CGST (+)</span>
                     <input type="number" name="cgst" value={form.cgst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-blue-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">SGST (+)</span>
                     <input type="number" name="sgst" value={form.sgst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-blue-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">IGST (+)</span>
                     <input type="number" name="igst" value={form.igst} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-blue-500 outline-none bg-white" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-slate-600">Round Off</span>
                     <input type="number" name="roundOff" value={form.roundOff} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-blue-500 outline-none bg-white" />
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-300 flex justify-between items-center">
                     <span className="text-sm font-bold text-slate-800 uppercase">Grand Total</span>
                     <span className="text-2xl font-black text-blue-700">₹{summary.grandTotal.toFixed(2)}</span>
                  </div>
               </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCreditNote;
