import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSelect from '../../components/DynamicSelect';
import api from '../../api';

const NewBankReceipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    receiptNo: `BRCT-${Date.now().toString().slice(-5)}`,
    receiptDate: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    bankAccount: '',
    receiptType: 'Customer Receipt',
    
    // Customer / Party Details
    customerParty: '',
    customerType: 'Retailer',
    invoiceNo: '',
    contactNumber: '',
    
    // Bank & Payment Details
    amount: 0,
    method: 'NEFT',
    bankName: '',
    utrNo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    chequeNo: '',
    
    // Accounting Details
    bankLedger: '',
    customerLedger: '',
    tdsAmount: 0,
    otherDeduction: 0,
    
    // Additional Info
    receivedBy: '',
    approvedBy: '',
    remarks: ''
  });

  // Invoice Adjustment Items
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNo: 'INV001', invoiceAmount: 50000, dueAmount: 30000, adjustAmount: 30000 }
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
          const { data } = await api.get(`/bank-receipts/${id}`);
          if (data.success && data.data) {
            const rec = data.data;
            setForm({
              receiptNo: rec.receiptNo || `BRCT-${Date.now().toString().slice(-5)}`,
              receiptDate: rec.receiptDate || new Date().toISOString().split('T')[0],
              company: rec.company || '',
              branch: rec.branch || '',
              bankAccount: rec.bankAccount || '',
              receiptType: rec.receiptType || 'Customer Receipt',
              customerParty: rec.customerParty || '',
              customerType: rec.customerType || 'Retailer',
              invoiceNo: rec.invoiceNo || '',
              contactNumber: rec.contactNumber || '',
              amount: rec.amount || 0,
              method: rec.method || 'NEFT',
              bankName: rec.bankName || '',
              utrNo: rec.utrNo || '',
              transactionDate: rec.transactionDate || new Date().toISOString().split('T')[0],
              chequeNo: rec.chequeNo || '',
              bankLedger: rec.bankLedger || '',
              customerLedger: rec.customerLedger || '',
              tdsAmount: rec.tdsAmount || 0,
              otherDeduction: rec.otherDeduction || 0,
              receivedBy: rec.receivedBy || '',
              approvedBy: rec.approvedBy || '',
              remarks: rec.remarks || ''
            });
            setInvoices(rec.invoices || []);
            setTotals(rec.totals || { received: 0, adjusted: 0, unadjusted: 0 });
          }
        } catch (error) {
          console.error("Error fetching bank receipt data", error);
        }
      };
      fetchReceipt();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Re-calculate totals if amount changes
      if (name === 'amount') {
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
      calculateTotals(Number(form.amount) || 0, newInvoices);
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
      calculateTotals(Number(form.amount) || 0, newInvoices);
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
        amount: Number(form.amount) || 0,
        tdsAmount: Number(form.tdsAmount) || 0,
        otherDeduction: Number(form.otherDeduction) || 0,
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

      if (id) {
        await api.put(`/bank-receipts/${id}`, payload);
        alert('Bank Receipt Updated successfully!');
      } else {
        await api.post('/bank-receipts', payload);
        alert('Bank Receipt Posted successfully!');
      }
      navigate('/bank-receipt/list');
    } catch (error) {
      console.error('Error saving bank receipt', error);
      alert('Failed to save bank receipt. Please check the inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/bank-receipt/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Bank Receipt List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/bank-receipt/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
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
        <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-teal-900 uppercase tracking-wide">CREATE BANK RECEIPT</h2>
          <p className="text-sm text-slate-500 font-medium">Record bank receipt</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt No.</label>
                  <input type="text" name="receiptNo" value={form.receiptNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Date *</label>
                  <input type="date" name="receiptDate" value={form.receiptDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <DynamicSelect category="Company" name="company" value={form.company} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <DynamicSelect category="Branch" name="branch" value={form.branch} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account *</label>
                  <DynamicSelect category="Account" name="bankAccount" value={form.bankAccount} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select name="receiptType" value={form.receiptType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Customer Receipt</option>
                    <option>Other Income</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: CUSTOMER / PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Customer / Party Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
                  <DynamicSelect category="Customer" name="customerParty" value={form.customerParty} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type</label>
                  <DynamicSelect category="Customer Type" name="customerType" value={form.customerType} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No.</label>
                  <DynamicSelect category="Invoice" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: BANK & PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Bank & Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-teal-700 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Method *</label>
                  <DynamicSelect category="Payment Method" name="method" value={form.method} onChange={handleChange} />
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
              <table className="block w-full overflow-x-auto w-full text-left min-w-[600px]">
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
                        <input type="text" placeholder="INV001" value={inv.invoiceNo} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceNo', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.invoiceAmount} onChange={(e) => handleInvoiceChange(inv.id, 'invoiceAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.dueAmount} onChange={(e) => handleInvoiceChange(inv.id, 'dueAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-slate-100" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={inv.adjustAmount} onChange={(e) => handleInvoiceChange(inv.id, 'adjustAmount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-teal-700 focus:border-indigo-500 outline-none bg-white" />
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
                 <span className="text-teal-600">₹{totals.adjusted.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-800 font-bold border-t border-slate-200 pt-1 mt-1">
                 <span>Unadjusted:</span>
                 <span className={totals.unadjusted < 0 ? 'text-red-600' : 'text-slate-800'}>₹{totals.unadjusted.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
             {/* SECTION: ACCOUNTING DETAILS */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Ledger</label>
                    <DynamicSelect category="Bank Ledger" name="bankLedger" value={form.bankLedger} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Ledger</label>
                    <DynamicSelect category="Customer Ledger" name="customerLedger" value={form.customerLedger} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Amount</label>
                    <input type="number" name="tdsAmount" value={form.tdsAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Other Deduction</label>
                    <input type="number" name="otherDeduction" value={form.otherDeduction} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
             </div>

             {/* SECTION: ADDITIONAL INFORMATION */}
             <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBankReceipt;
