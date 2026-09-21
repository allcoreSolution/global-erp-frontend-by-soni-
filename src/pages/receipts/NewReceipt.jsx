import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileText, FileDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewReceipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    receiptNo: `REC-${Date.now().toString().slice(-5)}`,
    receiptDate: new Date().toISOString().split('T')[0],
    receiptType: 'Customer',
    company: '',
    branch: '',
    status: 'Draft',
    
    // Party Details
    customerParty: '',
    customerType: 'Retailer',
    contactNumber: '',
    referenceInvoice: '',
    referenceOrder: '',
    
    // Payment Details
    paymentAmount: 10000,
    paymentMethod: 'UPI',
    account: '',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    bankName: '',
    chequeNo: '',
    chequeDate: '',
    
    // Accounting
    receiptAccount: '',
    customerLedger: '',
    costCenter: '',
    tdsAdjustment: '',
    exchangeRate: '1.00',
    
    // Additional Info
    receivedBy: '',
    approvedBy: '',
    remarks: ''
  });

  // Invoice Adjustment Items
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNo: 'INV-001', invoiceAmount: 10000, dueAmount: 10000, adjustAmount: 10000 }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    received: 0,
    adjusted: 0,
    unadjusted: 0
  });

  useEffect(() => {
    if (id) {
      const fetchReceipt = async () => {
        try {
          const { data } = await api.get(`/receipts/${id}`);
          if (data.success && data.data) {
            const ret = data.data;
            setForm({
              receiptNo: ret.receiptNo || `REC-${Date.now().toString().slice(-5)}`,
              receiptDate: ret.receiptDate || new Date().toISOString().split('T')[0],
              receiptType: ret.receiptType || 'Customer',
              company: ret.company || '',
              branch: ret.branch || '',
              status: ret.status || 'Draft',
              customerParty: ret.customerParty || '',
              customerType: ret.customerType || 'Retailer',
              contactNumber: ret.contactNumber || '',
              referenceInvoice: ret.referenceInvoice || '',
              referenceOrder: ret.referenceOrder || '',
              paymentAmount: ret.paymentAmount || 0,
              paymentMethod: ret.paymentMethod || 'UPI',
              account: ret.account || '',
              transactionRef: ret.transactionRef || '',
              paymentDate: ret.paymentDate || new Date().toISOString().split('T')[0],
              bankName: ret.bankName || '',
              chequeNo: ret.chequeNo || '',
              chequeDate: ret.chequeDate || '',
              receiptAccount: ret.receiptAccount || '',
              customerLedger: ret.customerLedger || '',
              costCenter: ret.costCenter || '',
              tdsAdjustment: ret.tdsAdjustment || '',
              exchangeRate: ret.exchangeRate || '1.00',
              receivedBy: ret.receivedBy || '',
              approvedBy: ret.approvedBy || '',
              remarks: ret.remarks || ''
            });
            setInvoices(ret.invoices || []);
            setTotals(ret.totals || { received: 0, adjusted: 0, unadjusted: 0 });
          }
        } catch (error) {
          console.error("Error fetching receipt data", error);
        }
      };
      fetchReceipt();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'paymentAmount') {
        calculateTotals(Number(value) || 0, invoices);
      }
      return updated;
    });
  };

  const handleInvoiceChange = (id, field, value) => {
    setInvoices(prev => {
      const newInvoices = prev.map(inv => {
        if (inv.id === id) {
          return { ...inv, [field]: value };
        }
        return inv;
      });
      calculateTotals(Number(form.paymentAmount) || 0, newInvoices);
      return newInvoices;
    });
  };

  const addInvoice = () => {
    const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    setInvoices([...invoices, { id: newId, invoiceNo: '', invoiceAmount: 0, dueAmount: 0, adjustAmount: 0 }]);
  };

  const removeInvoice = (id) => {
    setInvoices(prev => {
      const newInvoices = prev.filter(inv => inv.id !== id);
      calculateTotals(Number(form.paymentAmount) || 0, newInvoices);
      return newInvoices;
    });
  };

  const calculateTotals = (receivedAmount, currentInvoices) => {
    const totalAdjusted = currentInvoices.reduce((sum, inv) => sum + (Number(inv.adjustAmount) || 0), 0);
    setTotals({
      received: receivedAmount,
      adjusted: totalAdjusted,
      unadjusted: receivedAmount - totalAdjusted
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        voucherNo: form.receiptNo,
        paymentAmount: Number(form.paymentAmount) || 0,
        tdsAdjustment: form.tdsAdjustment ? Number(form.tdsAdjustment) : 0,
        invoices: invoices.map(inv => ({
          ...inv,
          invoiceAmount: Number(inv.invoiceAmount) || 0,
          dueAmount: Number(inv.dueAmount) || 0,
          adjustAmount: Number(inv.adjustAmount) || 0
        })),
        totals: {
          received: Number(totals.received) || 0,
          adjusted: Number(totals.adjusted) || 0,
          unadjusted: Number(totals.unadjusted) || 0
        }
      };
      
      delete payload.documentFile;
      
      if (id) {
        await api.put(`/receipts/${id}`, payload);
        alert('Receipt Updated successfully!');
      } else {
        await api.post('/receipts', payload);
        alert('Receipt Posted successfully!');
      }
      navigate('/receipt/list');
    } catch (error) {
      console.error('Error saving receipt', error);
      alert('Failed to save receipt. Please check the inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/receipt/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Receipt List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/receipt/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Receipt
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-emerald-900 uppercase tracking-wide">CREATE RECEIPT</h2>
          <p className="text-sm text-slate-500 font-medium">Record payment received</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt No. *</label>
                  <input type="text" name="receiptNo" value={form.receiptNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Date *</label>
                  <input type="date" name="receiptDate" value={form.receiptDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Type *</label>
                  <DynamicSelect category="Receipt Type" name="receiptType" value={form.receiptType} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect category="Status" name="status" value={form.status} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <DynamicSelect category="Company" name="company" value={form.company} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <DynamicSelect category="Branch" name="branch" value={form.branch} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* SECTION: PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Party Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Party *</label>
                  <DynamicSelect category="Customer" name="customerParty" value={form.customerParty} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type</label>
                  <DynamicSelect category="Customer Type" name="customerType" value={form.customerType} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Invoice</label>
                  <DynamicSelect category="Invoice" name="referenceInvoice" value={form.referenceInvoice} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Order</label>
                  <select name="referenceOrder" value={form.referenceOrder} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Order</option>
                    <option>ORD-102</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Payment Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount *</label>
                  <input type="number" name="paymentAmount" value={form.paymentAmount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-emerald-700 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <DynamicSelect category="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account *</label>
                  <DynamicSelect category="Account" name="account" value={form.account} onChange={handleChange} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref.</label>
                  <input type="text" name="transactionRef" value={form.transactionRef} onChange={handleChange} placeholder="UTR / Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <DynamicSelect category="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} />
                </div>
                
                {form.paymentMethod === 'Cheque' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque No.</label>
                      <input type="text" name="chequeNo" value={form.chequeNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque Date</label>
                      <input type="date" name="chequeDate" value={form.chequeDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* SECTION: INVOICE ADJUSTMENT */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Adjustment</h3>
              <button type="button" onClick={addInvoice} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <Plus size={14} /> Add Invoice
              </button>
            </div>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-3 py-2 text-xs font-bold uppercase">Invoice No.</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Invoice Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Due Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase">Adjust Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2">
                        <input type="text" placeholder="INV-..." value={inv.invoiceNo} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceNo', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.invoiceAmount} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.dueAmount} onChange={(e) => handleInvoiceChange(inv.id, 'dueAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-slate-100" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.adjustAmount} onChange={(e) => handleInvoiceChange(inv.id, 'adjustAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-indigo-700 focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeInvoice(inv.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-sm text-slate-500 italic">No invoices added for adjustment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col items-end gap-2 text-sm font-medium pr-16 border-t border-slate-200 pt-4">
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Received:</span>
                 <span>₹{totals.received.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Adjusted:</span>
                 <span className="text-emerald-600">₹{totals.adjusted.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-800 font-bold border-t border-slate-200 pt-1 mt-1">
                 <span>Unadjusted:</span>
                 <span className={totals.unadjusted < 0 ? 'text-red-600' : 'text-slate-800'}>₹{totals.unadjusted.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* SECTION: ACCOUNTING */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Account</label>
                    <DynamicSelect category="Receipt Account" name="receiptAccount" value={form.receiptAccount} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Ledger</label>
                    <DynamicSelect category="Customer Ledger" name="customerLedger" value={form.customerLedger} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                    <DynamicSelect category="Cost Center" name="costCenter" value={form.costCenter} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange Rate</label>
                    <input type="text" name="exchangeRate" value={form.exchangeRate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Adjustment</label>
                    <input type="number" name="tdsAdjustment" value={form.tdsAdjustment} onChange={handleChange} placeholder="₹ Amount" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
             </div>

             {/* SECTION: ADDITIONAL INFORMATION */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Received By</label>
                    <DynamicSelect category="Received By" name="receivedBy" value={form.receivedBy} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                    <DynamicSelect category="Approved By" name="approvedBy" value={form.approvedBy} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                    <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                  </div>
                  <div className="col-span-2 mt-2">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment</label>
                     <div className="flex items-center gap-2">
                       <label className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium text-slate-500 cursor-pointer">
                          <UploadCloud size={18} />
                          <span className="truncate">{form.documentFile ? form.documentFile.name : 'Upload Document'}</span>
                          <input type="file" className="hidden" onChange={(e) => setForm(prev => ({ ...prev, documentFile: e.target.files[0] }))} />
                       </label>
                       {form.documentFile && (
                         <button type="button" onClick={() => setForm(prev => ({...prev, documentFile: null}))} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                           <Trash2 size={18} />
                         </button>
                       )}
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

export default NewReceipt;
