import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileMinus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewDebitNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

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

    // Original Purchase Details
    originalInvoiceNo: '',
    poNo: '',
    grnNo: '',
    
    // Summary Inputs
    discount: 0,
    taxAmount: 0,
    
    // Remarks
    remarks: ''
  });

  // Debit Note Items Rows
  const [items, setItems] = useState([
    { id: 1, product: '', qty: 0, rate: 0, amount: 0 }
  ]);

  // Summary Calculated State
  const [summary, setSummary] = useState({
    subTotal: 0,
    grandTotal: 0
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchDebitNote = async () => {
        try {
          const res = await api.get(`/debit-notes/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            setForm({
              debitNoteNo: data.debitNoteNo || '',
              date: data.date || '',
              company: data.company || '',
              branch: data.branch || '',
              type: data.type || 'Purchase Return',
              status: data.status || 'Draft',
              supplier: data.supplier || '',
              originalInvoiceNo: data.originalInvoiceNo || '',
              poNo: data.poNo || '',
              grnNo: data.grnNo || '',
              discount: data.discount || 0,
              taxAmount: data.taxAmount || 0,
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
          console.error("Error fetching debit note", err);
          alert("Debit note not found!");
          navigate('/debit-note/list');
        }
      };
      fetchDebitNote();
    } else {
      setForm(prev => ({
        ...prev,
        debitNoteNo: `DN-${Math.floor(Math.random() * 90000) + 10000}`
      }));
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (['discount', 'taxAmount'].includes(name)) {
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
    setItems([...items, { id: newId, product: '', qty: 0, rate: 0, amount: 0 }]);
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
    const t = Number(currentForm.taxAmount) || 0;
    
    const grandT = subT - d + t;

    setSummary({
      subTotal: subT,
      grandTotal: grandT
    });
  };

  // ──────────────────────────────────────────────────────────────
  // AUTO-POPULATE ITEMS WHEN INVOICE NO IS SELECTED
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInvoiceItems = async () => {
      // Avoid fetching if we don't have the required fields
      if (!form.originalInvoiceNo || !form.supplier) return;
      
      try {
        const res = await api.get(`/purchases?supplierName=${encodeURIComponent(form.supplier)}`);
        const purchases = res.data?.data || [];
        const selectedPurchase = purchases.find(p => p.purchaseNo === form.originalInvoiceNo);
        
        if (selectedPurchase && selectedPurchase.orderItems && selectedPurchase.orderItems.length > 0) {
          const newItems = selectedPurchase.orderItems.map((item, index) => {
             const qty = Number(item.quantity) || 0;
             const rate = Number(item.netUnitCost || item.cost) || 0;
             return {
                id: index + 1,
                product: item.product?.productName || item.name || '',
                qty: qty,
                rate: rate,
                amount: qty * rate
             };
          });
          setItems(newItems);
          calculateSummary(newItems, form);
        }
      } catch (err) {
        console.error('Failed to fetch invoice details', err);
      }
    };

    fetchInvoiceItems();
  }, [form.originalInvoiceNo, form.supplier]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!form.branch || !form.supplier || !form.originalInvoiceNo) {
      alert("Please fill all mandatory fields (Branch, Supplier, Invoice No).");
      return;
    }

    if (items.some(i => !i.product)) {
      alert("Please select a product for all items.");
      return;
    }

    try {
      // The file object (attachment) is omitted from the JSON payload
      // In a real scenario, you'd use FormData to send files.
      const payload = {
        ...form,
        voucherNo: form.debitNoteNo, // Protect from duplicate unique index E11000
        noteNo: form.debitNoteNo, // Protect from duplicate unique index noteNo_1
        
        // Deep Casting numbers
        discount: Number(form.discount) || 0,
        taxAmount: Number(form.taxAmount) || 0,

        items: items.map(item => ({
          product: item.product,
          qty: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
        })),

        summary: {
          subTotal: Number(summary.subTotal) || 0,
          grandTotal: Number(summary.grandTotal) || 0
        }
      };

      if (!payload.company) {
        delete payload.company;
      }

      if (isEditMode) {
        await api.put(`/debit-notes/${id}`, payload);
        alert('Debit Note Updated successfully!');
      } else {
        await api.post('/debit-notes', payload);
        alert('Debit Note Posted successfully!');
      }
      navigate('/debit-note/list');
    } catch (err) {
      console.error("Failed to save debit note", err);
      alert('Failed to save debit note: ' + (err.response?.data?.message || err.message));
    }
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

           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
             <FileMinus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">CREATE DEBIT NOTE</h2>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <DynamicSelect hideAddButton 
                    name="branch" 
                    category="Branch" 
                    value={form.branch} 
                    onChange={handleChange} 
                    className="w-full text-sm"
                  />
              </div>
            </div>
          </div>

            {/* SECTION: SUPPLIER DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Supplier Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <DynamicSelect hideAddButton 
                    name="supplier" 
                    category="Supplier" 
                    value={form.supplier} 
                    onChange={handleChange}
                    dependentValue={form.branch}
                    disabled={!form.branch}
                    defaultOptions={[]} 
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: ORIGINAL PURCHASE DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Original Purchase Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No. *</label>
                  <DynamicSelect hideAddButton 
                    name="originalInvoiceNo" 
                    category="Purchase Invoice" 
                    value={form.originalInvoiceNo} 
                    onChange={handleChange} 
                    dependentValue={form.supplier}
                    dependentValue2={form.branch}
                    disabled={!form.supplier}
                  />
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
                    <th className="px-2 py-2 text-xs font-bold uppercase w-24">Qty</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-28">Rate (₹)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase w-32">Amount (₹)</th>
                    <th className="px-2 py-2 text-xs font-bold uppercase text-center w-10">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-2 py-2">
                        <DynamicSelect hideAddButton 
                          name="product" 
                          category="Product" 
                          value={item.product} 
                          onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} 
                          defaultOptions={['Item A', 'Item B']} 
                          className="w-full text-sm"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-red-700 focus:border-red-500 outline-none bg-white text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white text-right" />
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
                      <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2 block">
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
               

               {/* SECTION: REMARKS */}
               <div className="border border-slate-200 rounded-lg p-5">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-red-500 outline-none resize-none" placeholder="Reason for return..."></textarea>
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
                     <span className="font-semibold text-slate-600">Total Tax (+)</span>
                     <input type="number" name="taxAmount" value={form.taxAmount} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-red-500 outline-none bg-white" />
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
