import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, FileSpreadsheet, Plus, Trash2, Upload, Briefcase, Calculator, Building, CreditCard, CheckSquare, User, Landmark, X, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AddExpenseClaim = () => {
  const navigate = useNavigate();

  // Lookup States
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenseModes, setExpenseModes] = useState([]);
  const [travelModes, setTravelModes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Quick Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [modalInput, setModalInput] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalInput('');
    setShowAddModal(true);
  };

  const handleQuickAddSubmit = async () => {
    if(!modalInput.trim()) return;
    try {
      let endpoint = '';
      let payload = {};
      
      if(modalType === 'department') {
        endpoint = '/departments';
        payload = { 
          deptName: modalInput, 
          deptCode: `DEPT-${Math.floor(Math.random() * 10000)}`,
          status: 'Active' 
        };
      } else if (modalType === 'branch') {
        endpoint = '/branches';
        payload = { 
          name: modalInput, 
          id: `BR-${Math.floor(Math.random() * 10000)}`,
          status: 'Active' 
        };
      } else if (modalType === 'company') {
        endpoint = '/companies/register';
        const uniqueId = Math.floor(Math.random() * 100000);
        payload = { 
          companyName: modalInput,
          companyEmail: `comp${uniqueId}@example.com`,
          adminEmail: `admin${uniqueId}@example.com`,
          adminPassword: 'Password123!',
          companyPhone: '0000000000',
          companyAddress: 'Unknown Address'
        };
      } else if (modalType === 'employee' || modalType === 'manager' || modalType === 'finance') {
        endpoint = '/employees';
        const parts = modalInput.trim().split(' ');
        payload = { 
          employeeName: modalInput,
          employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
          email: `${parts[0].toLowerCase()}@example.com`,
          status: 'Active'
        };
      } else if (modalType === 'expenseCategory') {
        endpoint = '/expense-categories';
        payload = { 
          name: modalInput,
          isActive: true
        };
      } else if (modalType === 'expenseMode' || modalType === 'travelMode' || modalType === 'paymentMethod') {
        endpoint = '/master-options';
        let cat = '';
        if (modalType === 'expenseMode') cat = 'expense_mode';
        if (modalType === 'travelMode') cat = 'travel_mode';
        if (modalType === 'paymentMethod') cat = 'payment_method';
        payload = { 
          category: cat,
          label: modalInput,
          value: modalInput
        };
      }
      
      await api.post(endpoint, payload);
      setModalInput('');
      setShowAddModal(false);
      fetchLookups();
    } catch(err) {
      console.error("Error in quick add:", err);
      alert(`Failed to quick add ${modalType}. It may require more details. Please add it from the main module.`);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [empRes, compRes, brRes, deptRes, catRes, optRes] = await Promise.all([
        api.get('/employees').catch(() => ({ data: { data: [] } })),
        api.get('/companies').catch(() => ({ data: { data: [] } })),
        api.get('/branches').catch(() => ({ data: { data: [] } })),
        api.get('/departments').catch(() => ({ data: { data: [] } })),
        api.get('/expense-categories').catch(() => ({ data: { data: [] } })),
        api.get('/master-options').catch(() => ({ data: { data: [] } }))
      ]);
      if (empRes.data?.data) setEmployees(empRes.data.data);
      if (Array.isArray(compRes.data)) {
        setCompanies(compRes.data);
      } else if (compRes.data?.data) {
        setCompanies(compRes.data.data);
      }
      if (brRes.data?.data) setBranches(brRes.data.data);
      if (deptRes.data?.data) setDepartments(deptRes.data.data);
      if (catRes.data?.data) setExpenseCategories(catRes.data.data);
      if (optRes.data?.data) {
        const allOpts = optRes.data.data;
        setExpenseModes(allOpts.filter(o => o.category === 'expense_mode'));
        setTravelModes(allOpts.filter(o => o.category === 'travel_mode'));
        setPaymentMethods(allOpts.filter(o => o.category === 'payment_method'));
      }
    } catch (error) {
      console.error("Error fetching lookups:", error);
    }
  };

  // Form State
  const [form, setForm] = useState({
    claimNo: 'EXP-10024',
    claimDate: new Date().toISOString().split('T')[0],
    employee: '',
    employeeId: '',
    company: '',
    branch: '',
    department: '',
    status: 'Draft',
    purpose: '',
    project: '',
    client: '',
    costCenter: '',
    businessTrip: 'No',
    travelFrom: '',
    travelTo: '',
    travelMode: 'Cab',
    distance: '',
    ticketNo: '',
    nonReimbursable: 0,
    advanceReceived: 0,
    manager: '',
    finance: '',
    approvedAmount: '',
    approvalStatus: 'Pending',
    remarks: '',
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    paymentDate: '',
    utrNo: ''
  });

  const [expenses, setExpenses] = useState([
    { id: 1, date: '', category: 'Travel', desc: 'Cab Charge', amount: 800, mode: 'UPI' },
    { id: 2, date: '', category: 'Food', desc: 'Lunch', amount: 500, mode: 'Cash' },
    { id: 3, date: '', category: 'Hotel', desc: 'Stay', amount: 2000, mode: 'Card' }
  ]);

  const [totals, setTotals] = useState({
    totalExpense: 0,
    reimbursementAmount: 0,
    finalPayable: 0
  });

  // Document Upload State & Refs
  const billInputRef = useRef(null);
  const ticketInputRef = useRef(null);
  const [documents, setDocuments] = useState({
    bill: null,
    ticket: null
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [type]: file }));
    }
  };

  useEffect(() => {
    const totalExp = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const nonReimb = Number(form.nonReimbursable) || 0;
    const advance = Number(form.advanceReceived) || 0;
    
    const reimbAmount = totalExp - nonReimb;
    const finalAmt = reimbAmount - advance;

    setTotals({
      totalExpense: totalExp,
      reimbursementAmount: reimbAmount,
      finalPayable: finalAmt
    });
  }, [expenses, form.nonReimbursable, form.advanceReceived]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const addExpense = () => {
    setExpenses([...expenses, { id: Date.now(), date: '', category: 'Travel', desc: '', amount: 0, mode: 'UPI' }]);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        expenses,
        totalExpense: totals.totalExpense,
        reimbursementAmount: totals.reimbursementAmount,
        finalPayable: totals.finalPayable
      };
      await api.post('/expense-claims', payload);
      alert('Expense Claim submitted successfully!');
      navigate('/hrms/expenses/claims'); 
    } catch (error) {
      console.error("Error saving claim:", error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/expenses/claims')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Claims
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/hrms/expenses/claims')} className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Submit Claim
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-5 border-b border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-violet-100 rounded-xl text-violet-600 shadow-sm">
             <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-900 uppercase tracking-wide">EMPLOYEE EXPENSE REIMBURSEMENT</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">File a new claim for out-of-pocket business expenses</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-8">
             
             {/* LEFT & CENTER COLUMNS */}
             <div className="lg:col-span-2 space-y-8">
               
               {/* SECTION: BASIC INFORMATION */}
               <div className="border border-slate-200 rounded-xl p-5 bg-white">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                   <User size={14} className="text-violet-500"/> Basic Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Claim No</label>
                     <input type="text" name="claimNo" value={form.claimNo} readOnly className="w-full border border-slate-200 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500 cursor-not-allowed" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Claim Date</label>
                     <input type="date" name="claimDate" value={form.claimDate} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee *</label>
                     <div className="flex gap-2">
                       <select name="employee" value={form.employee} onChange={handleChange} required className="w-full flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                         <option value="">Select Employee</option>
                         {employees.map(emp => (
                           <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                         ))}
                       </select>
                       <button type="button" onClick={() => handleOpenModal('employee')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Employee">
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company *</label>
                     <div className="flex gap-2">
                       <select name="company" value={form.company} onChange={handleChange} required className="w-full flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                         <option value="">Select Company</option>
                         {companies.map(comp => (
                           <option key={comp._id} value={comp._id}>{comp.companyName || comp.name}</option>
                         ))}
                       </select>
                       <button type="button" onClick={() => handleOpenModal('company')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Company">
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Branch</label>
                     <div className="flex gap-2">
                       <select name="branch" value={form.branch} onChange={handleChange} className="w-full flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                         <option value="">Select Branch</option>
                         {branches.map(br => (
                           <option key={br._id} value={br._id}>{br.branchName || br.name}</option>
                         ))}
                       </select>
                       <button type="button" onClick={() => handleOpenModal('branch')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Branch">
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                     <div className="flex gap-2">
                       <select name="department" value={form.department} onChange={handleChange} className="w-full flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                         <option value="">Select Dept</option>
                         {departments.map(dept => (
                           <option key={dept._id} value={dept._id}>{dept.deptName || dept.name}</option>
                         ))}
                       </select>
                       <button type="button" onClick={() => handleOpenModal('department')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Department">
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
                     <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white text-violet-700 font-bold">
                       <option>Draft</option>
                       <option>Submitted</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* SECTION: EXPENSE DETAILS (TABLE) */}
               <div className="border border-violet-200 bg-violet-50/20 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard size={14}/> Expense Details
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="block w-full overflow-x-auto w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-2 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                          <th className="p-2 text-[10px] font-bold text-slate-500 uppercase">Category</th>
                          <th className="p-2 text-[10px] font-bold text-slate-500 uppercase">Description</th>
                          <th className="p-2 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                          <th className="p-2 text-[10px] font-bold text-slate-500 uppercase">Mode</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <input type="date" value={exp.date} onChange={(e) => handleExpenseChange(exp.id, 'date', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-500 outline-none" />
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <select value={exp.category} onChange={(e) => handleExpenseChange(exp.id, 'category', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-500 outline-none bg-white">
                                  {expenseCategories.length > 0 ? (
                                    expenseCategories.map(cat => (
                                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))
                                  ) : (
                                    <>
                                      <option>Travel</option>
                                      <option>Food</option>
                                      <option>Hotel</option>
                                      <option>Office Supplies</option>
                                      <option>Other</option>
                                    </>
                                  )}
                                </select>
                                <button type="button" onClick={() => handleOpenModal('expenseCategory')} className="p-1 bg-violet-50 text-violet-600 rounded border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Category">
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="p-2">
                              <input type="text" value={exp.desc} onChange={(e) => handleExpenseChange(exp.id, 'desc', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-500 outline-none" placeholder="Details" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-right font-semibold text-slate-700 focus:border-violet-500 outline-none" />
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <select value={exp.mode} onChange={(e) => handleExpenseChange(exp.id, 'mode', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-500 outline-none bg-white">
                                  {expenseModes.length > 0 ? (
                                    expenseModes.map(opt => <option key={opt._id} value={opt.value}>{opt.label}</option>)
                                  ) : (
                                    <>
                                      <option>UPI</option>
                                      <option>Cash</option>
                                      <option>Card</option>
                                      <option>Corp Card</option>
                                    </>
                                  )}
                                </select>
                                <button type="button" onClick={() => handleOpenModal('expenseMode')} className="p-1 bg-violet-50 text-violet-600 rounded border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Mode">
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeExpense(exp.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <button type="button" onClick={addExpense} className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100">
                      <Plus size={14} /> Add Expense Item
                    </button>
                    <div className="text-sm font-bold text-slate-800">
                      Total: ₹{totals.totalExpense.toLocaleString()}
                    </div>
                  </div>
               </div>

               {/* SECTION: BUSINESS & TRAVEL */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 <div className="border border-slate-200 rounded-xl p-5 bg-white">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                     <Building size={14} className="text-slate-500"/> Business Purpose
                   </h3>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Purpose *</label>
                       <textarea name="purpose" value={form.purpose} onChange={handleChange} required rows="2" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none resize-none" placeholder="Why was this expense incurred?"></textarea>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Project</label>
                         <input type="text" name="project" value={form.project} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Client</label>
                         <input type="text" name="client" value={form.client} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cost Center</label>
                         <input type="text" name="costCenter" value={form.costCenter} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Business Trip</label>
                         <select name="businessTrip" value={form.businessTrip} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                           <option>Yes</option>
                           <option>No</option>
                         </select>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="border border-slate-200 rounded-xl p-5 bg-white">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                     <Briefcase size={14} className="text-slate-500"/> Travel Details
                   </h3>
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From</label>
                         <input type="text" name="travelFrom" value={form.travelFrom} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" placeholder="City/Area" />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">To</label>
                         <input type="text" name="travelTo" value={form.travelTo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" placeholder="City/Area" />
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mode</label>
                         <div className="flex gap-2">
                           <select name="travelMode" value={form.travelMode} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                             {travelModes.length > 0 ? (
                               travelModes.map(opt => <option key={opt._id} value={opt.value}>{opt.label}</option>)
                             ) : (
                               <>
                                 <option>Cab</option>
                                 <option>Flight</option>
                                 <option>Train</option>
                                 <option>Bus</option>
                                 <option>Personal Vehicle</option>
                               </>
                             )}
                           </select>
                           <button type="button" onClick={() => handleOpenModal('travelMode')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Mode">
                             <Plus size={18} />
                           </button>
                         </div>
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Distance (KM)</label>
                         <input type="text" name="distance" value={form.distance} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ticket / PNR No.</label>
                       <input type="text" name="ticketNo" value={form.ticketNo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                     </div>
                   </div>
                 </div>

               </div>
               
             </div>

             {/* RIGHT COLUMN: Summary & Approvals */}
             <div className="space-y-6">
                
                {/* SECTION: AMOUNT SUMMARY */}
                <div className="bg-slate-800 text-white rounded-xl p-6 shadow-xl shadow-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 pb-2 border-b border-slate-700 flex items-center gap-2">
                    <Calculator size={14}/> Amount Summary
                  </h3>
                  <div className="space-y-4 font-medium">
                     <div className="flex justify-between items-center text-sm text-slate-300">
                       <span>Total Expense</span>
                       <span className="font-bold text-white">₹{totals.totalExpense.toLocaleString()}</span>
                     </div>
                     
                     <div className="flex justify-between items-center text-sm text-slate-300">
                       <span className="flex-1">Non-Reimbursable</span>
                       <div className="w-24">
                         <input type="number" name="nonReimbursable" value={form.nonReimbursable} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-right text-sm text-white focus:border-violet-400 outline-none" />
                       </div>
                     </div>
                     
                     <div className="flex justify-between items-center text-sm text-slate-300">
                       <span className="flex-1">Advance Received</span>
                       <div className="w-24">
                         <input type="number" name="advanceReceived" value={form.advanceReceived} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-right text-sm text-white focus:border-violet-400 outline-none" />
                       </div>
                     </div>

                     <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-700">
                       <span className="text-slate-300">Reimbursement Amt</span>
                       <span className="font-bold">₹{totals.reimbursementAmount.toLocaleString()}</span>
                     </div>

                     <div className="flex justify-between items-center text-lg font-black text-white pt-2 border-t-2 border-slate-600 mt-2">
                       <span>Final Payable</span>
                       <span className={totals.finalPayable >= 0 ? "text-emerald-400" : "text-rose-400"}>
                         ₹{totals.finalPayable.toLocaleString()}
                       </span>
                     </div>
                  </div>
                </div>

                {/* SECTION: APPROVAL DETAILS */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <CheckSquare size={14} className="text-slate-500"/> Approval Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Manager</label>
                        <div className="flex gap-2">
                          <select name="manager" value={form.manager} onChange={handleChange} className="w-full flex-1 border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-violet-500 outline-none bg-white">
                            <option value="">Select</option>
                            {employees.map(emp => (
                              <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => handleOpenModal('manager')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Manager">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Finance</label>
                        <div className="flex gap-2">
                          <select name="finance" value={form.finance} onChange={handleChange} className="w-full flex-1 border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-violet-500 outline-none bg-white">
                            <option value="">Select</option>
                            {employees.map(emp => (
                              <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => handleOpenModal('finance')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Finance">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Approved Amt</label>
                        <input type="text" name="approvedAmount" value={form.approvedAmount} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
                        <select name="approvalStatus" value={form.approvalStatus} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-violet-500 outline-none bg-white text-orange-600 font-bold">
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* SECTION: REIMBURSEMENT PAYMENT */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Landmark size={14} className="text-slate-500"/> Payment Info
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Status</label>
                        <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-violet-500 outline-none bg-white">
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Method</label>
                        <div className="flex gap-2">
                          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full flex-1 border border-slate-300 rounded-lg px-2 py-2 text-xs focus:border-violet-500 outline-none bg-white">
                            {paymentMethods.length > 0 ? (
                              paymentMethods.map(opt => <option key={opt._id} value={opt.value}>{opt.label}</option>)
                            ) : (
                              <>
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>Cheque</option>
                              </>
                            )}
                          </select>
                          <button type="button" onClick={() => handleOpenModal('paymentMethod')} className="p-2 bg-violet-50 text-violet-600 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors shrink-0" title="Add Method">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Date</label>
                        <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:border-violet-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">UTR No.</label>
                        <input type="text" name="utrNo" value={form.utrNo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:border-violet-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: DOCUMENTS */}
                <div className="border border-slate-200 border-dashed rounded-xl p-5 bg-slate-50 text-center">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Upload Documents</p>
                  <p className="text-[10px] text-slate-500 mb-4">Attach Bills, Tickets, Invoices</p>
                  
                  {/* Hidden File Inputs */}
                  <input type="file" ref={billInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'bill')} />
                  <input type="file" ref={ticketInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'ticket')} />

                  <div className="flex flex-col gap-3 items-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button type="button" onClick={() => billInputRef.current?.click()} className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Upload Bill
                      </button>
                      <button type="button" onClick={() => ticketInputRef.current?.click()} className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Upload Ticket
                      </button>
                    </div>
                    
                    {/* Display Selected Files */}
                    {(documents.bill || documents.ticket) && (
                      <div className="w-full text-left bg-white p-3 rounded-lg border border-slate-200 space-y-2 mt-2">
                        {documents.bill && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Paperclip size={12} className="text-violet-500" />
                              <span className="font-semibold truncate max-w-[150px]">{documents.bill.name}</span>
                            </div>
                            <button type="button" onClick={() => setDocuments(p => ({...p, bill: null}))} className="text-red-500 hover:text-red-700">
                              <X size={12} />
                            </button>
                          </div>
                        )}
                        {documents.ticket && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Paperclip size={12} className="text-violet-500" />
                              <span className="font-semibold truncate max-w-[150px]">{documents.ticket.name}</span>
                            </div>
                            <button type="button" onClick={() => setDocuments(p => ({...p, ticket: null}))} className="text-red-500 hover:text-red-700">
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
        </form>
      </div>

      {/* QUICK ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 capitalize">Quick Add {modalType}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16}/>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 capitalize">{modalType} Name *</label>
                <input 
                  type="text" 
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder={`Enter ${modalType} name...`}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={handleQuickAddSubmit} className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-700">Save {modalType}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpenseClaim;
