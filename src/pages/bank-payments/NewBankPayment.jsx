import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewBankPayment = () => {
  const navigate = useNavigate();

  // Basic Information State
  const [form, setForm] = useState({
    paymentNo: 'BPAY-00001',
    paymentDate: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    bankAccount: '',
    paymentType: 'Supplier',
    
    // Party Details
    supplierParty: '',
    supplierType: 'Supplier',
    invoiceNo: '',
    poNo: '',
    
    // Bank Payment Details
    amount: 50000,
    method: 'NEFT',
    bankName: '',
    utrNo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    chequeNo: '',
    
    // Deductions & Accounting
    tdsAmount: 0,
    bankCharges: 0,
    otherDeduction: 0,
    supplierLedger: '',
    bankLedger: '',
    
    // Additional Info
    paidBy: '',
    approvedBy: '',
    remarks: ''
  });

  // Invoice Adjustment Items
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNo: 'PINV001', invoiceAmount: 80000, dueAmount: 50000, adjustAmount: 50000 }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    payment: 50000,
    adjusted: 50000,
    unadjusted: 0,
    netPayment: 50000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Re-calculate totals if amount or deductions change
      if (['amount', 'tdsAmount', 'bankCharges', 'otherDeduction'].includes(name)) {
        calculateTotals(
          name === 'amount' ? (Number(value) || 0) : (Number(prev.amount) || 0),
          invoices,
          name === 'tdsAmount' ? (Number(value) || 0) : (Number(prev.tdsAmount) || 0),
          name === 'bankCharges' ? (Number(value) || 0) : (Number(prev.bankCharges) || 0),
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
      calculateTotals(
        Number(form.amount) || 0, 
        newInvoices, 
        Number(form.tdsAmount) || 0,
        Number(form.bankCharges) || 0,
        Number(form.otherDeduction) || 0
      );
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
      calculateTotals(
        Number(form.amount) || 0, 
        newInvoices, 
        Number(form.tdsAmount) || 0,
        Number(form.bankCharges) || 0,
        Number(form.otherDeduction) || 0
      );
      return newInvoices;
    });
  };

  const calculateTotals = (paymentAmount, currentInvoices, tds, charges, other) => {
    const totalAdjusted = currentInvoices.reduce((sum, inv) => sum + (Number(inv.adjustAmount) || 0), 0);
    setTotals({
      payment: paymentAmount,
      adjusted: totalAdjusted,
      unadjusted: paymentAmount - totalAdjusted,
      netPayment: paymentAmount - tds - charges - other
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Bank Payment Posted successfully!');
    navigate('/bank-payment/list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/bank-payment/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Bank Payment List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/bank-payment/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
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
        <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-orange-900 uppercase tracking-wide">CREATE BANK PAYMENT</h2>
          <p className="text-sm text-slate-500 font-medium">Record bank payment</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment No.</label>
                  <input type="text" name="paymentNo" value={form.paymentNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account *</label>
                  <select name="bankAccount" value={form.bankAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Account</option>
                    <option>HDFC Current</option>
                    <option>ICICI OD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select name="paymentType" value={form.paymentType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Supplier</option>
                    <option>Employee Expense</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Party Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select name="supplierParty" value={form.supplierParty} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Supplier</option>
                    <option>Global Electronics</option>
                    <option>Local Traders</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Type</label>
                  <select name="supplierType" value={form.supplierType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Supplier</option>
                    <option>Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No.</label>
                  <select name="invoiceNo" value={form.invoiceNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Invoice</option>
                    <option>PINV001</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PO No.</label>
                  <select name="poNo" value={form.poNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select PO</option>
                    <option>PO-2023</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: BANK PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Bank Payment Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-orange-700 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Method *</label>
                  <select name="method" value={form.method} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>NEFT</option>
                    <option>RTGS</option>
                    <option>IMPS</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input type="text" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UTR No.</label>
                  <input type="text" name="utrNo" value={form.utrNo} onChange={handleChange} placeholder="UTR / Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque No. (If applicable)</label>
                  <input type="text" name="chequeNo" value={form.chequeNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
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
                        <input type="text" placeholder="PINV001" value={inv.invoiceNo} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceNo', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.invoiceAmount} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.dueAmount} onChange={(e) => handleInvoiceChange(inv.id, 'dueAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-slate-100" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.adjustAmount} onChange={(e) => handleInvoiceChange(inv.id, 'adjustAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-orange-700 focus:border-indigo-500 outline-none bg-white" />
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
                 <span className="text-orange-600">₹{totals.adjusted.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-800 font-bold border-t border-slate-200 pt-1 mt-1">
                 <span>Unadjusted:</span>
                 <span className={totals.unadjusted < 0 ? 'text-red-600' : 'text-slate-800'}>₹{totals.unadjusted.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* SECTION: DEDUCTIONS & ACCOUNTING */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Deductions & Accounting</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Amount</label>
                    <input type="number" name="tdsAmount" value={form.tdsAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Charges</label>
                    <input type="number" name="bankCharges" value={form.bankCharges} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Other Deduction</label>
                    <input type="number" name="otherDeduction" value={form.otherDeduction} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 mt-2">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-slate-700">Net Payment</span>
                       <span className="text-lg font-black text-orange-700">₹{totals.netPayment.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 mt-2">Supplier Ledger</label>
                    <select name="supplierLedger" value={form.supplierLedger} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option value="">Select</option>
                      <option>Global Electronics Ledger</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 mt-2">Bank Ledger</label>
                    <select name="bankLedger" value={form.bankLedger} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option value="">Select</option>
                      <option>HDFC Bank Ledger</option>
                    </select>
                  </div>
                </div>
             </div>

             {/* SECTION: ADDITIONAL INFORMATION */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
                    <select name="paidBy" value={form.paidBy} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option value="">Select</option>
                      <option>Accountant 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                    <select name="approvedBy" value={form.approvedBy} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option value="">Select</option>
                      <option>Finance Head</option>
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
        </form>
      </div>
    </div>
  );
};

export default NewBankPayment;
