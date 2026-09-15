import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Calculator, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalaryStructure = () => {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    // Basic Info
    code: 'SAL-STR-01',
    name: '',
    company: '',
    branch: '',
    department: '',
    designation: '',
    employeeType: 'Permanent',
    currency: 'INR',
    effectiveFrom: '',
    status: 'Active',
    
    // Payroll Rules
    workingDays: '30',
    overtime: 'No',
    lop: 'Yes',
    leaveDeduction: 'Yes',
    lateDeduction: 'No',
    bonus: 'No',
    
    // Tax & Compliance
    pfApplicable: 'Yes',
    esicApplicable: 'Yes',
    ptApplicable: 'Yes',
    tdsApplicable: 'Yes',
    
    // Accounting
    salaryExpenseAccount: '',
    salaryPayableAccount: '',
    pfPayableAccount: '',
    tdsPayableAccount: '',
    
    // Remarks
    remarks: ''
  });

  // Earnings Table State
  const [earnings, setEarnings] = useState([
    { id: 1, component: 'Basic Salary', type: 'Fixed', amount: 25000 },
    { id: 2, component: 'HRA', type: '% Basic', amount: 40, calculatedValue: 10000 },
    { id: 3, component: 'Conveyance', type: 'Fixed', amount: 2000 },
    { id: 4, component: 'Special Allowance', type: 'Fixed', amount: 5000 },
  ]);

  // Deductions Table State
  const [deductions, setDeductions] = useState([
    { id: 1, component: 'PF', type: '%', amount: 12, calculatedValue: 3000 },
    { id: 2, component: 'Professional Tax', type: 'Fixed', amount: 200 },
  ]);

  // Summary Totals
  const [totals, setTotals] = useState({
    basic: 0,
    grossEarnings: 0,
    totalDeductions: 0,
    netSalary: 0,
    employerCost: 0,
    ctc: 0
  });

  // Dynamic Calculations
  useEffect(() => {
    // Basic Salary is typically the base for % calculations
    const basicEarn = earnings.find(e => e.component === 'Basic Salary' || e.component.toLowerCase() === 'basic')?.amount || 0;
    
    let calcEarnings = 0;
    const processedEarnings = earnings.map(earn => {
      let val = 0;
      if (earn.type === 'Fixed') {
        val = Number(earn.amount) || 0;
      } else if (earn.type.includes('%')) {
        val = (Number(earn.amount) * Number(basicEarn)) / 100;
      }
      calcEarnings += val;
      return { ...earn, calculatedValue: val };
    });

    let calcDeductions = 0;
    const processedDeductions = deductions.map(ded => {
      let val = 0;
      if (ded.type === 'Fixed') {
        val = Number(ded.amount) || 0;
      } else if (ded.type === '%') {
        val = (Number(ded.amount) * Number(basicEarn)) / 100;
      }
      calcDeductions += val;
      return { ...ded, calculatedValue: val };
    });

    // Just an example calculation for Employer Cost (Gross + Employer PF contribution example)
    const employerCost = calcEarnings + (processedDeductions.find(d => d.component === 'PF')?.calculatedValue || 0);

    setTotals({
      basic: basicEarn,
      grossEarnings: calcEarnings,
      totalDeductions: calcDeductions,
      netSalary: calcEarnings - calcDeductions,
      employerCost: employerCost,
      ctc: employerCost * 12
    });
  }, [earnings, deductions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEarningChange = (id, field, value) => {
    setEarnings(earnings.map(earn => earn.id === id ? { ...earn, [field]: value } : earn));
  };

  const handleDeductionChange = (id, field, value) => {
    setDeductions(deductions.map(ded => ded.id === id ? { ...ded, [field]: value } : ded));
  };

  const addEarning = () => {
    setEarnings([...earnings, { id: Date.now(), component: '', type: 'Fixed', amount: 0 }]);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { id: Date.now(), component: '', type: 'Fixed', amount: 0 }]);
  };

  const removeEarning = (id) => {
    setEarnings(earnings.filter(earn => earn.id !== id));
  };

  const removeDeduction = (id) => {
    setDeductions(deductions.filter(ded => ded.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Salary Structure saved successfully!');
    // navigate('/some-route');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Save Structure
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
             <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-900 uppercase tracking-wide">CREATE SALARY STRUCTURE</h2>
            <p className="text-sm text-slate-500 font-medium">Define compensation framework and rules</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* SECTION: BASIC INFORMATION */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                <input type="text" name="code" value={form.code} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div className="md:col-span-3 lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" placeholder="e.g., Manager Standard CTC" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                <select name="company" value={form.company} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option value="">Select</option>
                  <option>Main Corp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option value="">Select</option>
                  <option>HQ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select name="department" value={form.department} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option value="">Select</option>
                  <option>IT</option>
                  <option>Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <select name="designation" value={form.designation} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option value="">Select</option>
                  <option>Manager</option>
                  <option>Developer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Type</label>
                <select name="employeeType" value={form.employeeType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option>Permanent</option>
                  <option>Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Effective From *</label>
                <input type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             
             {/* LEFT COLUMN: EARNINGS & DEDUCTIONS TABLES */}
             <div className="xl:col-span-2 space-y-6">
                
                {/* EARNINGS */}
                <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Earnings</h3>
                     <span className="text-sm font-bold text-emerald-800">Total Earnings: ₹{totals.grossEarnings.toLocaleString()}</span>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-emerald-200">
                           <th className="pb-2 text-xs font-semibold text-emerald-900 w-1/2">Component</th>
                           <th className="pb-2 text-xs font-semibold text-emerald-900 w-1/4">Type</th>
                           <th className="pb-2 text-xs font-semibold text-emerald-900 w-1/4 text-right">Amount / %</th>
                           <th className="pb-2 w-10"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-emerald-100">
                         {earnings.map((earn) => (
                           <tr key={earn.id}>
                             <td className="py-2 pr-2">
                               <input type="text" value={earn.component} onChange={(e) => handleEarningChange(earn.id, 'component', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none" placeholder="e.g. Basic" />
                             </td>
                             <td className="py-2 px-2">
                               <select value={earn.type} onChange={(e) => handleEarningChange(earn.id, 'type', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none bg-white">
                                 <option>Fixed</option>
                                 <option>% Basic</option>
                               </select>
                             </td>
                             <td className="py-2 pl-2 text-right">
                               <input type="number" value={earn.amount} onChange={(e) => handleEarningChange(earn.id, 'amount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-right focus:border-emerald-500 outline-none" />
                               {earn.type.includes('%') && (
                                  <div className="text-[10px] text-emerald-600 mt-1">₹{earn.calculatedValue?.toLocaleString() || 0}</div>
                               )}
                             </td>
                             <td className="py-2 text-center">
                               <button type="button" onClick={() => removeEarning(earn.id)} className="text-red-500 hover:text-red-700 p-1">
                                 <Trash2 size={16} />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   <button type="button" onClick={addEarning} className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                     <Plus size={14} /> Add Earning
                   </button>
                </div>

                {/* DEDUCTIONS */}
                <div className="border border-red-200 bg-red-50/30 rounded-lg p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">Deductions</h3>
                     <span className="text-sm font-bold text-red-800">Total Deductions: ₹{totals.totalDeductions.toLocaleString()}</span>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-red-200">
                           <th className="pb-2 text-xs font-semibold text-red-900 w-1/2">Component</th>
                           <th className="pb-2 text-xs font-semibold text-red-900 w-1/4">Type</th>
                           <th className="pb-2 text-xs font-semibold text-red-900 w-1/4 text-right">Amount / %</th>
                           <th className="pb-2 w-10"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-red-100">
                         {deductions.map((ded) => (
                           <tr key={ded.id}>
                             <td className="py-2 pr-2">
                               <input type="text" value={ded.component} onChange={(e) => handleDeductionChange(ded.id, 'component', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none" placeholder="e.g. PF" />
                             </td>
                             <td className="py-2 px-2">
                               <select value={ded.type} onChange={(e) => handleDeductionChange(ded.id, 'type', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-red-500 outline-none bg-white">
                                 <option>Fixed</option>
                                 <option>%</option>
                               </select>
                             </td>
                             <td className="py-2 pl-2 text-right">
                               <input type="number" value={ded.amount} onChange={(e) => handleDeductionChange(ded.id, 'amount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-right focus:border-red-500 outline-none" />
                               {ded.type === '%' && (
                                  <div className="text-[10px] text-red-600 mt-1">₹{ded.calculatedValue?.toLocaleString() || 0}</div>
                               )}
                             </td>
                             <td className="py-2 text-center">
                               <button type="button" onClick={() => removeDeduction(ded.id)} className="text-red-500 hover:text-red-700 p-1">
                                 <Trash2 size={16} />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   <button type="button" onClick={addDeduction} className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
                     <Plus size={14} /> Add Deduction
                   </button>
                </div>

                {/* SECTION: ACCOUNTING & REMARKS */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">Salary Expense</label>
                      <input type="text" name="salaryExpenseAccount" value={form.salaryExpenseAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">Salary Payable</label>
                      <input type="text" name="salaryPayableAccount" value={form.salaryPayableAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">PF Payable</label>
                      <input type="text" name="pfPayableAccount" value={form.pfPayableAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">TDS Payable</label>
                      <input type="text" name="tdsPayableAccount" value={form.tdsPayableAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                    <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none resize-none" placeholder="Notes..."></textarea>
                  </div>
                </div>

             </div>

             {/* RIGHT COLUMN: Summary & Configurations */}
             <div className="space-y-6">
                
                {/* SECTION: SALARY SUMMARY */}
                <div className="bg-slate-800 text-white rounded-lg p-5 shadow-lg">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-700">Salary Summary</h3>
                  <div className="space-y-3 font-medium">
                     <div className="flex justify-between items-center text-sm text-slate-300">
                       <span>Basic Salary</span>
                       <span>₹{totals.basic.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-emerald-400">
                       <span>Gross Salary</span>
                       <span>₹{totals.grossEarnings.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-red-400">
                       <span>Total Deduction</span>
                       <span>- ₹{totals.totalDeductions.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-slate-700 mt-2">
                       <span>Net Salary</span>
                       <span className="text-emerald-400">₹{totals.netSalary.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-slate-400 pt-2 border-t border-slate-700 mt-2">
                       <span>Employer Cost</span>
                       <span>₹{totals.employerCost.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-slate-400">
                       <span>CTC (Annual)</span>
                       <span>₹{totals.ctc.toLocaleString()}</span>
                     </div>
                  </div>
                </div>

                {/* SECTION: PAYROLL RULES */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Payroll Rules</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Working Days</label>
                      <input type="number" name="workingDays" value={form.workingDays} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Overtime</label>
                      <select name="overtime" value={form.overtime} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">LOP (Loss of Pay)</label>
                      <select name="lop" value={form.lop} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Deduction</label>
                      <select name="leaveDeduction" value={form.leaveDeduction} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Late Deduction</label>
                      <select name="lateDeduction" value={form.lateDeduction} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bonus</label>
                      <select name="bonus" value={form.bonus} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION: TAX & COMPLIANCE */}
                <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Tax & Compliance</h3>
                  <div className="grid grid-cols-4 gap-2">
                     <div className="flex flex-col items-center">
                       <label className="text-[10px] font-bold text-slate-500 mb-1">PF</label>
                       <select name="pfApplicable" value={form.pfApplicable} onChange={handleChange} className="w-full border border-slate-300 rounded p-1 text-xs text-center focus:border-emerald-500 outline-none bg-white">
                         <option>Yes</option>
                         <option>No</option>
                       </select>
                     </div>
                     <div className="flex flex-col items-center">
                       <label className="text-[10px] font-bold text-slate-500 mb-1">ESIC</label>
                       <select name="esicApplicable" value={form.esicApplicable} onChange={handleChange} className="w-full border border-slate-300 rounded p-1 text-xs text-center focus:border-emerald-500 outline-none bg-white">
                         <option>Yes</option>
                         <option>No</option>
                       </select>
                     </div>
                     <div className="flex flex-col items-center">
                       <label className="text-[10px] font-bold text-slate-500 mb-1">PT</label>
                       <select name="ptApplicable" value={form.ptApplicable} onChange={handleChange} className="w-full border border-slate-300 rounded p-1 text-xs text-center focus:border-emerald-500 outline-none bg-white">
                         <option>Yes</option>
                         <option>No</option>
                       </select>
                     </div>
                     <div className="flex flex-col items-center">
                       <label className="text-[10px] font-bold text-slate-500 mb-1">TDS</label>
                       <select name="tdsApplicable" value={form.tdsApplicable} onChange={handleChange} className="w-full border border-slate-300 rounded p-1 text-xs text-center focus:border-emerald-500 outline-none bg-white">
                         <option>Yes</option>
                         <option>No</option>
                       </select>
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

export default SalaryStructure;
