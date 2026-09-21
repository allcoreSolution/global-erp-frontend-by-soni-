import React, { useState, useEffect } from 'react';
import { RefreshCcw, Save, Search, Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const AddSaleReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    returnNumber: 'RET-2023-001',
    returnDate: new Date().toISOString().split('T')[0],
    customerName: '',
    invoiceNumber: '',
    returnReason: 'Defective Product',
    status: 'Pending',
    refundMethod: 'Original Payment Method',
    restockingFee: '0',
    totalRefundAmount: '0',
    remarks: '',
    company: 'Select'
  });

  const [items, setItems] = useState([
    { id: 1, product: '', quantity: 1, unitPrice: 0, condition: 'Good', returnTotal: 0 }
  ]);

  useEffect(() => {
    if (id) {
      const fetchSaleReturn = async () => {
        try {
          const { data } = await api.get(`/sale-returns/${id}`);
          if (data.success && data.data) {
            const sr = data.data;
            setForm({
              returnNumber: sr.returnNumber || '',
              returnDate: sr.returnDate || '',
              customerName: sr.customerName || '',
              invoiceNumber: sr.invoiceNumber || '',
              returnReason: sr.returnReason || 'Defective Product',
              status: sr.status || 'Pending',
              refundMethod: sr.refundMethod || 'Original Payment Method',
              restockingFee: sr.restockingFee || '0',
              totalRefundAmount: sr.totalRefundAmount || '0',
              remarks: sr.remarks || '',
              company: sr.company || 'Select'
            });
            if (sr.items && sr.items.length > 0) {
              setItems(sr.items.map((item, idx) => ({
                id: idx + 1,
                product: item.product || '',
                condition: item.condition || 'Good',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                returnTotal: item.returnTotal || 0
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching sale return', error);
        }
      };
      fetchSaleReturn();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleItemChange = (id, field, value) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total for this item
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.returnTotal = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addItemRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, product: '', quantity: 1, unitPrice: 0, condition: 'Good', returnTotal: 0 }]);
  };

  const removeItemRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        returnNumber: form.returnNumber,
        returnDate: form.returnDate,
        customerName: form.customerName,
        invoiceNumber: form.invoiceNumber,
        returnReason: form.returnReason,
        status: form.status,
        refundMethod: form.refundMethod,
        restockingFee: Number(form.restockingFee) || 0,
        totalRefundAmount: finalRefund >= 0 ? Number(finalRefund) : 0,
        remarks: form.remarks,
        company: form.company,
        items: items.map(item => ({
          product: item.product,
          condition: item.condition,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          returnTotal: Number(item.returnTotal) || 0
        }))
      };

      if (id) {
        await api.put(`/sale-returns/${id}`, payload);
        alert('Sale Return updated successfully!');
      } else {
        await api.post('/sale-returns', payload);
        alert('Sale Return processed successfully!');
      }
      navigate('/sales/sale-return');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving sale return');
    }
  };

  // Calculate Subtotal dynamically
  const subTotal = items.reduce((sum, item) => sum + item.returnTotal, 0);
  const finalRefund = subTotal - Number(form.restockingFee);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/sale-return')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Return List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <RefreshCcw className="text-indigo-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">Process Sale Return</h2>
            <p className="text-sm text-slate-500 font-medium">Create a new product return and refund entry</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Number *</label>
                  <input type="text" name="returnNumber" value={form.returnNumber} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date *</label>
                  <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required placeholder="Search or Enter Customer Name" className="w-full border border-slate-300 rounded pl-9 pr-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Original Invoice Number *</label>
                  <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} required placeholder="e.g. INV-10293" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Allcore Solutions</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect category="Status" name="status" value={form.status} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* SECTION: REFUND DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Refund Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Reason *</label>
                  <DynamicSelect category="ReturnReason" name="returnReason" value={form.returnReason} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Method</label>
                  <DynamicSelect category="RefundMethod" name="refundMethod" value={form.refundMethod} onChange={handleChange} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Restocking Fee (₹)</label>
                  <input type="number" name="restockingFee" value={form.restockingFee} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Refund (₹)</label>
                  <input type="text" value={finalRefund >= 0 ? finalRefund : 0} readOnly className="w-full border border-slate-300 rounded bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: PRODUCT DETAILS (ITEMS TABLE) */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products Being Returned</h3>
              <button type="button" onClick={addItemRow} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <Plus size={14} /> Add Row
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-2 text-xs font-bold uppercase w-1/3">Product Name</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase w-1/6">Condition</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase w-1/6">Qty</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase w-1/6">Unit Price (₹)</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase w-1/6">Total (₹)</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <input type="text" required placeholder="Select Product" value={item.product} onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none" />
                      </td>
                      <td className="px-4 py-3">
                        <DynamicSelect 
                          category="ItemCondition" 
                          name="condition" 
                          value={item.condition} 
                          onChange={(name, value) => handleItemChange(item.id, name, value)} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" min="0" required value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" readOnly value={item.returnTotal} className="w-full border border-slate-300 bg-slate-100 rounded px-2 py-1.5 text-sm font-semibold text-slate-700 outline-none cursor-not-allowed" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => removeItemRow(item.id)} disabled={items.length === 1} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹ {subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-600">
                  <span>Restocking Fee (-):</span>
                  <span>₹ {Number(form.restockingFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-indigo-700 pt-2 border-t border-slate-200">
                  <span>Total Refund:</span>
                  <span>₹ {finalRefund >= 0 ? finalRefund.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ADDITIONAL INFO & DOCUMENTS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information & Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" placeholder="Enter any internal notes or customer feedback..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex flex-col justify-center">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Photos/Documents (Optional)</label>
                <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group w-full">
                  <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Click to upload files</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</span>
                  <input type="file" className="hidden" multiple />
                </label>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/sales/sale-return')} className="px-6 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="button" className="px-6 py-2.5 border border-indigo-200 bg-indigo-50 rounded text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
              <RefreshCcw size={16} /> Process Return
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddSaleReturn;
