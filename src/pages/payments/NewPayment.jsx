import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    paymentNo: `PAY-${Date.now().toString().slice(-5)}`,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Supplier',
    company: '',
    branch: '',
    status: 'Draft',
    
    // Party Details
    supplierParty: '',
    supplierType: 'Supplier',
    contactNumber: '',
    invoiceNo: '',
    purchaseOrder: '',
    
    // Payment Details
    paymentAmount: 0,
    paymentMethod: 'Bank',
    paidFromAccount: '',
    transactionRef: '',
    bankName: '',
    paymentDateDetail: new Date().toISOString().split('T')[0],
    chequeNo: '',
    chequeDate: '',
    
    // Deductions / Accounting
    paymentAccount: '',
    supplierLedger: '',
    costCenter: '',
    tdsDeduction: 0,
    otherDeduction: 0,
    
    // Additional Info
    paidBy: '',
    approvedBy: '',
    paymentPurpose: '',
    remarks: ''
  });

  // Invoice Adjustment Items
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNo: 'PINV-001', invoiceAmount: 25000, dueAmount: 25000, adjustAmount: 20000 }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    payment: 0,
    adjusted: 0,
    unadjusted: 0,
    netPayment: 0
  });

  useEffect(() => {
    if (id) {
      const fetchPayment = async () => {
        try {
          const { data } = await api.get(`/payments/${id}`);
          if (data.success && data.data) {
            const pay = data.data;
            setForm({
              paymentNo: pay.paymentNo || `PAY-${Date.now().toString().slice(-5)}`,
              paymentDate: pay.paymentDate || new Date().toISOString().split('T')[0],
              paymentType: pay.paymentType || 'Supplier',
              company: pay.company || '',
              branch: pay.branch || '',
              status: pay.status || 'Draft',
              supplierParty: pay.supplierParty || '',
              supplierType: pay.supplierType || 'Supplier',
              contactNumber: pay.contactNumber || '',
              invoiceNo: pay.invoiceNo || '',
              purchaseOrder: pay.purchaseOrder || '',
              paymentAmount: pay.paymentAmount || 0,
              paymentMethod: pay.paymentMethod || 'Bank',
              paidFromAccount: pay.paidFromAccount || '',
              transactionRef: pay.transactionRef || '',
              bankName: pay.bankName || '',
              paymentDateDetail: pay.paymentDateDetail || new Date().toISOString().split('T')[0],
              chequeNo: pay.chequeNo || '',
              chequeDate: pay.chequeDate || '',
              paymentAccount: pay.paymentAccount || '',
              supplierLedger: pay.supplierLedger || '',
              costCenter: pay.costCenter || '',
              tdsDeduction: pay.tdsDeduction || 0,
              otherDeduction: pay.otherDeduction || 0,
              paidBy: pay.paidBy || '',
              approvedBy: pay.approvedBy || '',
              paymentPurpose: pay.paymentPurpose || '',
              remarks: pay.remarks || ''
            });
            setInvoices(pay.invoices || []);
            setTotals(pay.totals || { payment: 0, adjusted: 0, unadjusted: 0, netPayment: 0 });
          }
        } catch (error) {
          console.error("Error fetching payment data", error);
        }
      };
      fetchPayment();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Re-calculate totals if paymentAmount or deductions change
      if (['paymentAmount', 'tdsDeduction', 'otherDeduction'].includes(name)) {
        calculateTotals(
          name === 'paymentAmount' ? (Number(value) || 0) : (Number(prev.paymentAmount) || 0),
          invoices,
          name === 'tdsDeduction' ? (Number(value) || 0) : (Number(prev.tdsDeduction) || 0),
          name === 'otherDeduction' ? (Number(value) || 0) : (Number(prev.otherDeduction) || 0)
        );
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
      calculateTotals(Number(form.paymentAmount) || 0, newInvoices, Number(form.tdsDeduction) || 0, Number(form.otherDeduction) || 0);
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
      calculateTotals(Number(form.paymentAmount) || 0, newInvoices, Number(form.tdsDeduction) || 0, Number(form.otherDeduction) || 0);
      return newInvoices;
    });
  };

  const calculateTotals = (paymentAmount, currentInvoices, tds, other) => {
    const totalAdjusted = currentInvoices.reduce((sum, inv) => sum + (Number(inv.adjustAmount) || 0), 0);
    setTotals({
      payment: paymentAmount,
      adjusted: totalAdjusted,
      unadjusted: paymentAmount - totalAdjusted,
      netPayment: paymentAmount - tds - other
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        paymentAmount: Number(form.paymentAmount) || 0,
        tdsDeduction: Number(form.tdsDeduction) || 0,
        otherDeduction: Number(form.otherDeduction) || 0,
        invoices: invoices.map(inv => ({
          ...inv,
          invoiceAmount: Number(inv.invoiceAmount) || 0,
          dueAmount: Number(inv.dueAmount) || 0,
          adjustAmount: Number(inv.adjustAmount) || 0
        })),
        totals: {
          payment: Number(totals.payment) || 0,
          adjusted: Number(totals.adjusted) || 0,
          unadjusted: Number(totals.unadjusted) || 0,
          netPayment: Number(totals.netPayment) || 0
        }
      };
      
      if (id) {
        await api.put(`/payments/${id}`, payload);
        alert('Payment Updated successfully!');
      } else {
        await api.post('/payments', payload);
        alert('Payment Posted successfully!');
      }
      navigate('/payment/list');
    } catch (error) {
      console.error('Error saving payment', error);
      alert('Failed to save payment. Please check the inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/payment/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Payment List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/payment/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Payment
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">CREATE PAYMENT</h2>
          <p className="text-sm text-slate-500 font-medium">Record payment made</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment No. *</label>
                  <input type="text" name="paymentNo" value={form.paymentNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Type *</label>
                  <DynamicSelect category="Payment Type" name="paymentType" value={form.paymentType} onChange={handleChange} />
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Party *</label>
                  <DynamicSelect category="Supplier" name="supplierParty" value={form.supplierParty} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Type</label>
                  <DynamicSelect category="Supplier Type" name="supplierType" value={form.supplierType} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No.</label>
                  <DynamicSelect category="Invoice" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Order</label>
                  <DynamicSelect category="Purchase Order" name="purchaseOrder" value={form.purchaseOrder} onChange={handleChange} />
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
                  <input type="number" name="paymentAmount" value={form.paymentAmount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-blue-700 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <DynamicSelect category="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid From Account *</label>
                  <DynamicSelect category="Account" name="paidFromAccount" value={form.paidFromAccount} onChange={handleChange} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref.</label>
                  <input type="text" name="transactionRef" value={form.transactionRef} onChange={handleChange} placeholder="UTR / Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <DynamicSelect category="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input type="date" name="paymentDateDetail" value={form.paymentDateDetail} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                
                {form.paymentMethod === 'Cheque' && (
                  <>
                    <div className="col-span-2 lg:col-span-1"></div>
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
                        <input type="text" placeholder="PINV-..." value={inv.invoiceNo} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceNo', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
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
                 <span>Total Payment:</span>
                 <span>₹{totals.payment.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Adjusted:</span>
                 <span className="text-blue-600">₹{totals.adjusted.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-800 font-bold border-t border-slate-200 pt-1 mt-1">
                 <span>Unadjusted:</span>
                 <span className={totals.unadjusted < 0 ? 'text-red-600' : 'text-slate-800'}>₹{totals.unadjusted.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* SECTION: DEDUCTIONS / ACCOUNTING */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Deductions / Accounting</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Account</label>
                    <DynamicSelect category="Payment Account" name="paymentAccount" value={form.paymentAccount} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Ledger</label>
                    <DynamicSelect category="Supplier Ledger" name="supplierLedger" value={form.supplierLedger} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                    <DynamicSelect category="Cost Center" name="costCenter" value={form.costCenter} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Deduction</label>
                    <input type="number" name="tdsDeduction" value={form.tdsDeduction} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Other Deduction</label>
                    <input type="number" name="otherDeduction" value={form.otherDeduction} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 mt-2">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-slate-700">Net Payment</span>
                       <span className="text-lg font-black text-blue-700">₹{totals.netPayment.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* SECTION: ADDITIONAL INFORMATION */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
                    <DynamicSelect category="Paid By" name="paidBy" value={form.paidBy} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                    <DynamicSelect category="Approved By" name="approvedBy" value={form.approvedBy} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Purpose</label>
                    <input type="text" name="paymentPurpose" value={form.paymentPurpose} onChange={handleChange} placeholder="e.g. Monthly Supplier Settlement" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                    <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                  </div>
                  <div className="col-span-2 mt-2">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment</label>
                     <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium text-slate-500 cursor-pointer">
                        <UploadCloud size={18} />
                        <span className="truncate">{form.documentFile ? form.documentFile.name : 'Upload Document'}</span>
                        <input type="file" className="hidden" onChange={(e) => setForm(prev => ({ ...prev, documentFile: e.target.files[0] }))} />
                     </label>
                  </div>
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPayment;
