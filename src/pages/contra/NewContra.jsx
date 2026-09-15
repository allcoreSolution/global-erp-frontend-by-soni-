import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewContra = () => {
  const navigate = useNavigate();

  // Contra Form State
  const [form, setForm] = useState({
    // Basic Information
    contraNo: 'CON-00001',
    contraDate: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    voucherType: 'Contra',
    status: 'Draft',
    
    // Transfer Details
    fromAccount: 'HDFC Bank',
    toAccount: 'Cash Account',
    amount: '',
    transferMode: 'Cash Withdrawal',
    referenceNo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    bankCharges: '',
    
    // Accounting Details
    debitAccount: '',
    creditAccount: '',
    costCenter: '',
    narration: '',
    
    // Additional Info
    preparedBy: '',
    approvedBy: '',
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Contra Entry Posted successfully!');
    navigate('/contra/list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/contra/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Contra List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/contra/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
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

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-purple-900 uppercase tracking-wide">CREATE CONTRA ENTRY</h2>
          <p className="text-sm text-slate-500 font-medium">Record internal bank/cash transfers</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5 bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contra No.</label>
                  <input type="text" name="contraNo" value={form.contraNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" name="contraDate" value={form.contraDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Draft</option>
                    <option>Posted</option>
                    <option>Cancelled</option>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voucher Type *</label>
                  <input type="text" name="voucherType" value={form.voucherType} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* SECTION: TRANSFER DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5 bg-purple-50/30">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Transfer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Account *</label>
                  <select name="fromAccount" value={form.fromAccount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white font-medium text-slate-700">
                    <option>HDFC Bank</option>
                    <option>SBI OD</option>
                    <option>Cash Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Account *</label>
                  <select name="toAccount" value={form.toAccount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white font-medium text-slate-700">
                    <option>Cash Account</option>
                    <option>HDFC Bank</option>
                    <option>SBI OD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-lg font-bold text-purple-700 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Mode</label>
                  <select name="transferMode" value={form.transferMode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white">
                    <option>Cash Withdrawal</option>
                    <option>Cash Deposit</option>
                    <option>Bank to Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No.</label>
                  <input type="text" name="referenceNo" value={form.referenceNo} onChange={handleChange} placeholder="Cheque / UTR No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Charges</label>
                  <input type="number" name="bankCharges" value={form.bankCharges} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
              </div>
            </div>

            {/* SECTION: ACCOUNTING DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Debit Account (To Account Ledger)</label>
                  <select name="debitAccount" value={form.debitAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Ledger</option>
                    <option>Cash A/C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Account (From Account Ledger)</label>
                  <select name="creditAccount" value={form.creditAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Ledger</option>
                    <option>HDFC Bank A/C</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                  <select name="costCenter" value={form.costCenter} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select</option>
                    <option>Finance Dept</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Narration</label>
                  <textarea name="narration" value={form.narration} onChange={handleChange} rows="2" placeholder="Being cash withdrawn from HDFC bank for office expenses..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* SECTION: ADDITIONAL INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Prepared By</label>
                   <select name="preparedBy" value={form.preparedBy} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
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

export default NewContra;
