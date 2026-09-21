import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, CheckCircle, Plus, Trash2, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const AddSaleExchange = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Details State
  const [form, setForm] = useState({
    exchangeNo: 'EX-00001',
    exchangeDate: new Date().toISOString().split('T')[0],
    exchangeType: 'Full',
    company: '',
    branch: '',
    warehouse: '',
    status: 'Draft',
    invoiceNo: '',
    salesOrder: '',
    saleDate: '',
    customer: '',
    salesperson: '',
    paymentMethod: 'UPI',
    transactionRef: '',
    returnWarehouse: '',
    replacementWarehouse: '',
    restockItem: true,
    requestedBy: '',
    approvedBy: '',
    customerRemarks: ''
  });

  // Items State
  const [returnItems, setReturnItems] = useState([
    { id: 1, product: '', batch: '', soldQty: 1, returnQty: 1, rate: 0, amount: 0, reason: 'Size Issue', condition: 'Good' }
  ]);
  const [replacementItems, setReplacementItems] = useState([
    { id: 1, product: '', batch: '', qty: 1, unit: 'PCS', rate: 0, discount: 0, tax: 0, total: 0 }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    returnValue: 0,
    replacementValue: 0,
    tax: 0,
    discount: 0,
    additionalPayable: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReturnItemChange = (id, field, value) => {
    setReturnItems(prev => prev.map(item => {
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

  const addReturnItem = () => {
    const newId = returnItems.length > 0 ? Math.max(...returnItems.map(i => i.id)) + 1 : 1;
    setReturnItems([...returnItems, { id: newId, product: '', batch: '', soldQty: 1, returnQty: 1, rate: 0, amount: 0, reason: 'Size Issue', condition: 'Good' }]);
  };

  const removeReturnItem = (id) => {
    if (returnItems.length > 1) {
      setReturnItems(returnItems.filter(item => item.id !== id));
    }
  };

  const handleReplacementItemChange = (id, field, value) => {
    setReplacementItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate' || field === 'discount' || field === 'tax') {
          const subTotal = Number(updated.qty) * Number(updated.rate);
          const afterDiscount = subTotal - Number(updated.discount);
          updated.total = afterDiscount + Number(updated.tax);
        }
        return updated;
      }
      return item;
    }));
  };

  const addReplacementItem = () => {
    const newId = replacementItems.length > 0 ? Math.max(...replacementItems.map(i => i.id)) + 1 : 1;
    setReplacementItems([...replacementItems, { id: newId, product: '', batch: '', qty: 1, unit: 'PCS', rate: 0, discount: 0, tax: 0, total: 0 }]);
  };

  const removeReplacementItem = (id) => {
    if (replacementItems.length > 1) {
      setReplacementItems(replacementItems.filter(item => item.id !== id));
    }
  };

  // Calculate Totals dynamically
  useEffect(() => {
    const returnValue = returnItems.reduce((sum, item) => sum + item.amount, 0);
    const repSubtotal = replacementItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.rate)), 0);
    const repTax = replacementItems.reduce((sum, item) => sum + Number(item.tax), 0);
    const repDiscount = replacementItems.reduce((sum, item) => sum + Number(item.discount), 0);
    const replacementValue = repSubtotal - repDiscount + repTax;

    setTotals({
      returnValue,
      replacementValue,
      tax: repTax,
      discount: repDiscount,
      additionalPayable: replacementValue - returnValue
    });
  }, [returnItems, replacementItems]);

  useEffect(() => {
    if (id) {
      const fetchExchange = async () => {
        try {
          const { data } = await api.get(`/sale-exchanges/${id}`);
          if (data.success && data.data) {
            const ex = data.data;
            setForm({
              exchangeNo: ex.exchangeNo || '',
              exchangeDate: ex.exchangeDate || '',
              exchangeType: ex.exchangeType || 'Full',
              company: ex.company || '',
              branch: ex.branch || '',
              warehouse: ex.warehouse || '',
              status: ex.status || 'Draft',
              invoiceNo: ex.invoiceNo || '',
              salesOrder: ex.salesOrder || '',
              saleDate: ex.saleDate || '',
              customer: ex.customer || '',
              salesperson: ex.salesperson || '',
              paymentMethod: ex.paymentMethod || 'UPI',
              transactionRef: ex.transactionRef || '',
              returnWarehouse: ex.returnWarehouse || '',
              replacementWarehouse: ex.replacementWarehouse || '',
              restockItem: ex.restockItem ?? true,
              requestedBy: ex.requestedBy || '',
              approvedBy: ex.approvedBy || '',
              customerRemarks: ex.customerRemarks || ''
            });

            if (ex.returnItems && ex.returnItems.length > 0) {
              setReturnItems(ex.returnItems.map((item, idx) => ({
                id: idx + 1,
                product: item.product || '',
                batch: item.batch || '',
                soldQty: item.soldQty || 1,
                returnQty: item.returnQty || 1,
                rate: item.rate || 0,
                amount: item.amount || 0,
                reason: item.reason || 'Size Issue',
                condition: item.condition || 'Good'
              })));
            }

            if (ex.replacementItems && ex.replacementItems.length > 0) {
              setReplacementItems(ex.replacementItems.map((item, idx) => ({
                id: idx + 1,
                product: item.product || '',
                batch: item.batch || '',
                qty: item.qty || 1,
                unit: item.unit || 'PCS',
                rate: item.rate || 0,
                discount: item.discount || 0,
                tax: item.tax || 0,
                total: item.total || 0
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching exchange', error);
        }
      };
      fetchExchange();
    }
  }, [id]);



  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        exchangeNo: form.exchangeNo,
        exchangeDate: form.exchangeDate,
        exchangeType: form.exchangeType,
        company: form.company,
        branch: form.branch,
        warehouse: form.warehouse,
        status: form.status,
        invoiceNo: form.invoiceNo,
        salesOrder: form.salesOrder,
        saleDate: form.saleDate,
        customer: form.customer,
        salesperson: form.salesperson,
        paymentMethod: form.paymentMethod,
        transactionRef: form.transactionRef,
        returnWarehouse: form.returnWarehouse,
        replacementWarehouse: form.replacementWarehouse,
        restockItem: form.restockItem,
        requestedBy: form.requestedBy,
        approvedBy: form.approvedBy,
        customerRemarks: form.customerRemarks,
        returnItems: returnItems.map(item => ({
          product: item.product,
          batch: item.batch,
          soldQty: Number(item.soldQty) || 0,
          returnQty: Number(item.returnQty) || 0,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
          reason: item.reason,
          condition: item.condition
        })),
        replacementItems: replacementItems.map(item => ({
          product: item.product,
          batch: item.batch,
          qty: Number(item.qty) || 0,
          unit: item.unit,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
          total: Number(item.total) || 0
        })),
        totals: {
          returnValue: Number(totals.returnValue) || 0,
          replacementValue: Number(totals.replacementValue) || 0,
          tax: Number(totals.tax) || 0,
          discount: Number(totals.discount) || 0,
          additionalPayable: Number(totals.additionalPayable) || 0
        }
      };

      if (id) {
        await api.put(`/sale-exchanges/${id}`, payload);
        alert('Sale Exchange updated successfully!');
      } else {
        await api.post('/sale-exchanges', payload);
        alert('Sale Exchange Processed successfully!');
      }
      navigate('/sales/sale-exchange-list');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error processing exchange');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/sale-exchange-list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Sale Exchange
        </button>
        <div className="flex gap-2">
           <button type="button" className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Complete Exchange
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">CREATE SALE EXCHANGE</h2>
          <p className="text-sm text-slate-500 font-medium">Exchange sold product with replacement item</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange No. *</label>
                  <input type="text" name="exchangeNo" value={form.exchangeNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange Date *</label>
                  <input type="date" name="exchangeDate" value={form.exchangeDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange Type</label>
                  <DynamicSelect category="ExchangeType" name="exchangeType" value={form.exchangeType} onChange={handleChange} />
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
                  <DynamicSelect category="Branch" name="branch" value={form.branch} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <DynamicSelect category="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} />
                </div>
                <div className="col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect category="Status" name="status" value={form.status} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* SECTION: ORIGINAL SALE DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Original Sale Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No. *</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input type="text" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} required placeholder="Select Invoice" className="w-full border border-slate-300 rounded pl-8 pr-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Order</label>
                  <DynamicSelect category="SalesOrder" name="salesOrder" value={form.salesOrder} onChange={handleChange} />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sale Date</label>
                  <input type="text" value={form.saleDate} readOnly placeholder="Auto" className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none" />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
                  <input type="text" name="customer" value={form.customer} onChange={handleChange} required placeholder="Customer Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salesperson</label>
                  <DynamicSelect category="Salesperson" name="salesperson" value={form.salesperson} onChange={handleChange} />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <input type="text" readOnly placeholder="Auto" className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: RETURN ITEM DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5 bg-orange-50/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-orange-200">
              <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider">Return Item Details (From Customer)</h3>
              <button type="button" onClick={addReturnItem} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto mb-3">
              <table className="block w-full overflow-x-auto w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-orange-100/50 text-orange-800">
                    <th className="px-3 py-2 text-xs font-bold uppercase w-1/4">Product</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Batch</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Sold Qty</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Return Qty</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Rate (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {returnItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <input type="text" required placeholder="Select Product" value={item.product} onChange={(e) => handleReturnItemChange(item.id, 'product', e.target.value)} className="w-full border border-orange-200 rounded px-2 py-1.5 text-sm focus:border-orange-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" placeholder="---" value={item.batch} onChange={(e) => handleReturnItemChange(item.id, 'batch', e.target.value)} className="w-full border border-orange-200 rounded px-2 py-1.5 text-sm focus:border-orange-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.soldQty} onChange={(e) => handleReturnItemChange(item.id, 'soldQty', e.target.value)} className="w-full border border-orange-200 rounded px-2 py-1.5 text-sm focus:border-orange-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.returnQty} onChange={(e) => handleReturnItemChange(item.id, 'returnQty', e.target.value)} className="w-full border border-orange-200 rounded px-2 py-1.5 text-sm focus:border-orange-500 outline-none bg-white font-bold text-orange-700" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.rate} onChange={(e) => handleReturnItemChange(item.id, 'rate', e.target.value)} className="w-full border border-orange-200 rounded px-2 py-1.5 text-sm focus:border-orange-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" readOnly value={item.amount} className="w-full border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-orange-900 outline-none cursor-not-allowed" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeReturnItem(item.id)} disabled={returnItems.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 p-3 bg-orange-100/50 rounded-lg">
               <div>
                  <label className="text-xs font-semibold text-orange-800 mr-2">Return Reason:</label>
                  <div className="inline-block min-w-[120px]">
                    <DynamicSelect category="ReturnReason" name="reason" value={returnItems[0].reason} onChange={(e) => handleReturnItemChange(returnItems[0].id, e.target.name, e.target.value)} />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-semibold text-orange-800 mr-2">Condition:</label>
                  <div className="inline-block min-w-[120px]">
                    <DynamicSelect category="ItemCondition" name="condition" value={returnItems[0].condition} onChange={(e) => handleReturnItemChange(returnItems[0].id, e.target.name, e.target.value)} />
                  </div>
               </div>
            </div>
          </div>

          {/* SECTION: REPLACEMENT ITEM DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5 bg-emerald-50/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Replacement Item Details (To Customer)</h3>
              <button type="button" onClick={addReplacementItem} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="block w-full overflow-x-auto w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-emerald-100/50 text-emerald-800">
                    <th className="px-3 py-2 text-xs font-bold uppercase w-1/4">Product</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Batch</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Qty</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Unit</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Rate (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Disc. (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Tax (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Total (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {replacementItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <input type="text" required placeholder="Select Product" value={item.product} onChange={(e) => handleReplacementItemChange(item.id, 'product', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" placeholder="---" value={item.batch} onChange={(e) => handleReplacementItemChange(item.id, 'batch', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.qty} onChange={(e) => handleReplacementItemChange(item.id, 'qty', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white font-bold text-emerald-700" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.unit} onChange={(e) => handleReplacementItemChange(item.id, 'unit', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" required value={item.rate} onChange={(e) => handleReplacementItemChange(item.id, 'rate', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.discount} onChange={(e) => handleReplacementItemChange(item.id, 'discount', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.tax} onChange={(e) => handleReplacementItemChange(item.id, 'tax', e.target.value)} className="w-full border border-emerald-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" readOnly value={item.total} className="w-full border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-emerald-900 outline-none cursor-not-allowed" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeReplacementItem(item.id)} disabled={replacementItems.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
             {/* LEFT COLUMN: PAYMENTS & OTHERS */}
             <div className="space-y-6">
                
                {/* SECTION: PAYMENT DETAILS */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                      <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                        <option>Cash</option>
                        <option>Card</option>
                        <option>UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{totals.additionalPayable >= 0 ? 'Amount Paid' : 'Amount Refunded'}</label>
                      <input type="text" readOnly value={`₹ ${Math.abs(totals.additionalPayable).toFixed(2)}`} className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 outline-none cursor-not-allowed" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref.</label>
                      <input type="text" name="transactionRef" value={form.transactionRef} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* SECTION: RETURN & INVENTORY */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Return & Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Return Warehouse</label>
                      <DynamicSelect category="Warehouse" name="returnWarehouse" value={form.returnWarehouse} onChange={handleChange} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" name="restockItem" checked={form.restockItem} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
                      <label className="text-sm font-medium text-slate-700">Restock Item</label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Replacement Warehouse</label>
                      <DynamicSelect category="Warehouse" name="replacementWarehouse" value={form.replacementWarehouse} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* SECTION: APPROVAL & NOTES */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Approval & Notes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Requested By</label>
                      <DynamicSelect category="Salesperson" name="requestedBy" value={form.requestedBy} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                      <DynamicSelect category="Salesperson" name="approvedBy" value={form.approvedBy} onChange={handleChange} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Remarks</label>
                      <textarea name="customerRemarks" value={form.customerRemarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

             </div>
             
             {/* RIGHT COLUMN: EXCHANGE SUMMARY */}
             <div>
                <div className="border-2 border-indigo-100 rounded-xl p-6 bg-indigo-50/30 sticky top-6">
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-6 pb-4 border-b border-indigo-200 flex items-center gap-2">
                    <FileText size={18} /> Exchange Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Return Value (-)</span>
                      <span className="text-orange-600">₹ {totals.returnValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Replacement Value (+)</span>
                      <span className="text-emerald-600">₹ {(totals.replacementValue - totals.tax + totals.discount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Tax (+)</span>
                      <span>₹ {totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                      <span>Discount (-)</span>
                      <span>₹ {totals.discount.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-6 border-t border-indigo-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-900">
                          {totals.additionalPayable >= 0 ? 'Additional Payable' : 'Amount to Refund'}
                        </span>
                        <span className={`text-2xl font-black ${totals.additionalPayable >= 0 ? 'text-indigo-700' : 'text-orange-600'}`}>
                          ₹ {Math.abs(totals.additionalPayable).toFixed(2)}
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

export default AddSaleExchange;
