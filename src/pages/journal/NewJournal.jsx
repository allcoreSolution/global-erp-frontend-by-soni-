import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewJournal = () => {
  const navigate = useNavigate();

  // Basic Information State
  const [form, setForm] = useState({
    // Basic Information
    journalNo: 'JRN-00001',
    journalDate: new Date().toISOString().split('T')[0],
    company: '',
    branch: '',
    financialYear: '2023-24',
    status: 'Draft',
    referenceNo: '',
    
    // Reference Details
    referenceType: '',
    refReferenceNo: '',
    customerSupplier: '',
    invoiceNo: '',
    
    // Tax / Adjustment
    taxConfig: '',
    tdsAmount: '',
    adjustmentAccount: '',
    
    // Additional Info
    narration: '',
    preparedBy: '',
    approvedBy: '',
    remarks: ''
  });

  // Journal Entry Rows
  const [entries, setEntries] = useState([
    { id: 1, account: '', description: '', debit: '', credit: '' },
    { id: 2, account: '', description: '', debit: '', credit: '' }
  ]);

  // Totals State
  const [totals, setTotals] = useState({
    debit: 0,
    credit: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (id, field, value) => {
    setEntries(prev => {
      const newEntries = prev.map(entry => {
        if (entry.id === id) {
          // Prevent entering both Debit and Credit in the same row
          if (field === 'debit' && value !== '') {
             return { ...entry, debit: value, credit: '' };
          }
          if (field === 'credit' && value !== '') {
             return { ...entry, credit: value, debit: '' };
          }
          return { ...entry, [field]: value };
        }
        return entry;
      });
      calculateTotals(newEntries);
      return newEntries;
    });
  };

  const addEntry = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    setEntries([...entries, { id: newId, account: '', description: '', debit: '', credit: '' }]);
  };

  const removeEntry = (id) => {
    setEntries(prev => {
      const newEntries = prev.filter(e => e.id !== id);
      calculateTotals(newEntries);
      return newEntries;
    });
  };

  const calculateTotals = (currentEntries) => {
    const totalDebit = currentEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
    const totalCredit = currentEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);
    setTotals({
      debit: totalDebit,
      credit: totalCredit
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (totals.debit !== totals.credit) {
       alert('Total Debit must equal Total Credit before posting!');
       return;
    }
    alert('Journal Entry Posted successfully!');
    navigate('/journal/list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/journal/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Journal List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/journal/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Journal
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-gray-700 to-slate-800 px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">CREATE JOURNAL ENTRY</h2>
          <p className="text-sm text-slate-300 font-medium">Record manual journal vouchers</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Journal No.</label>
                  <input type="text" name="journalNo" value={form.journalNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" name="journalDate" value={form.journalDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year</label>
                  <select name="financialYear" value={form.financialYear} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>2023-24</option>
                    <option>2024-25</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Draft</option>
                    <option>Posted</option>
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
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No.</label>
                  <input type="text" name="referenceNo" value={form.referenceNo} onChange={handleChange} placeholder="e.g. For adjustment of XYZ" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* SECTION: JOURNAL ENTRY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Journal Entry Details</h3>
                <button type="button" onClick={addEntry} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus size={14} /> Add Row
                </button>
              </div>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-3 py-2 text-xs font-bold uppercase w-1/3">Account</th>
                      <th className="px-3 py-2 text-xs font-bold uppercase w-1/3">Description</th>
                      <th className="px-3 py-2 text-xs font-bold uppercase">Debit (₹)</th>
                      <th className="px-3 py-2 text-xs font-bold uppercase">Credit (₹)</th>
                      <th className="px-3 py-2 text-xs font-bold uppercase text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2">
                          <select value={entry.account} onChange={(e) => handleEntryChange(entry.id, 'account', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white font-medium text-slate-700">
                            <option value="">Select Account</option>
                            <option>Office Expense</option>
                            <option>Petty Cash</option>
                            <option>Salary A/C</option>
                            <option>TDS Payable</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" placeholder="Line description..." value={entry.description} onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none bg-white" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={entry.debit} onChange={(e) => handleEntryChange(entry.id, 'debit', e.target.value)} disabled={entry.credit !== ''} className={`w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none ${entry.credit !== '' ? 'bg-slate-100' : 'bg-white text-indigo-700 font-bold'}`} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={entry.credit} onChange={(e) => handleEntryChange(entry.id, 'credit', e.target.value)} disabled={entry.debit !== ''} className={`w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none ${entry.debit !== '' ? 'bg-slate-100' : 'bg-white text-emerald-700 font-bold'}`} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button type="button" onClick={() => removeEntry(entry.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-2 pr-12">
                   <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-600">Total Debit:</span>
                      <span className="text-indigo-700">₹{totals.debit.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-600">Total Credit:</span>
                      <span className="text-emerald-700">₹{totals.credit.toFixed(2)}</span>
                   </div>
                   {totals.debit !== totals.credit && (
                     <div className="text-xs font-bold text-red-500 text-right mt-1">
                       Difference: ₹{Math.abs(totals.debit - totals.credit).toFixed(2)}
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               <div className="space-y-6">
                 {/* SECTION: REFERENCE DETAILS */}
                 <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Reference Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Type</label>
                        <select name="referenceType" value={form.referenceType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select Type</option>
                          <option>Invoice</option>
                          <option>Vendor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No.</label>
                        <input type="text" name="refReferenceNo" value={form.refReferenceNo} onChange={handleChange} placeholder="Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Customer/Supplier</label>
                        <select name="customerSupplier" value={form.customerSupplier} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select</option>
                          <option>ABC Retailers</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice No.</label>
                        <input type="text" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} placeholder="INV001" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                      </div>
                    </div>
                 </div>

                 {/* SECTION: TAX / ADJUSTMENT */}
                 <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Tax / Adjustment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Config</label>
                        <select name="taxConfig" value={form.taxConfig} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select</option>
                          <option>GST 18%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Amount</label>
                        <input type="number" name="tdsAmount" value={form.tdsAmount} onChange={handleChange} placeholder="₹" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Account</label>
                        <select name="adjustmentAccount" value={form.adjustmentAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select</option>
                          <option>TDS Adjustment A/C</option>
                        </select>
                      </div>
                    </div>
                 </div>
               </div>

               {/* SECTION: ADDITIONAL INFORMATION */}
               <div className="border border-slate-200 rounded-lg p-5 h-full">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Narration</label>
                      <textarea name="narration" value={form.narration} onChange={handleChange} rows="2" placeholder="Overall journal description..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
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

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJournal;
