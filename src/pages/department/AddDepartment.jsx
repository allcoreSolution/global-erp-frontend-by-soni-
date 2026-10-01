import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Building2, Users, Phone, FileText, Settings, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AddDepartment = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    // Basic Information
    deptCode: 'DPT-001',
    deptName: '',
    deptType: 'Internal',
    parentDept: '',
    company: '',
    branch: '',
    status: 'Active',

    // Department Head
    deptHead: '',
    assistantManager: '',
    reportingDept: '',

    // Contact Details
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    floor: '',

    // Department Details
    description: '',
    objective: '',
    responsibilities: '',
    costCenter: '',
    profitCenter: '',
    budget: '',

    // Working Configuration
    workingDays: 'Mon-Sat',
    defaultShift: '',
    attendanceRequired: 'Yes',
    leaveApproval: 'Manager',
    expenseApproval: 'Manager',

    // Additional Information
    displayOrder: '',
    remarks: '',
    internalNotes: ''
  });

  // Local Dropdown States
  const [parentDepts, setParentDepts] = useState(['Operations', 'Finance']);
  const [deptTypes, setDeptTypes] = useState(['Internal', 'External', 'Cross-Functional']);
  const [branches, setBranches] = useState(['HQ - Mumbai']);
  const [companies, setCompanies] = useState(['Acme Corp']);
  const [statuses, setStatuses] = useState(['Active', 'Inactive']);
  const [costCenters, setCostCenters] = useState(['CC-01']);
  const [profitCenters, setProfitCenters] = useState(['PC-01']);
  const [deptHeads, setDeptHeads] = useState(['Rohan Sharma', 'Priya Patel']);
  const [assistantManagers, setAssistantManagers] = useState(['Amit Singh']);
  const [reportingDepts, setReportingDepts] = useState(['Board of Directors']);
  const [workingDaysList, setWorkingDaysList] = useState(['Mon-Sat', 'Mon-Fri']);
  const [defaultShifts, setDefaultShifts] = useState(['General Shift (09:00 - 18:00)']);
  const [attendanceReqs, setAttendanceReqs] = useState(['Yes', 'No']);
  const [leaveApprovals, setLeaveApprovals] = useState(['Manager', 'HR', 'Both']);
  const [expenseApprovals, setExpenseApprovals] = useState(['Manager', 'Finance', 'Both']);

  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({ name: '' });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!modalData.name) return;
    
    if (modalType === 'Parent Department') setParentDepts([...parentDepts, modalData.name]);
    if (modalType === 'Department Type') setDeptTypes([...deptTypes, modalData.name]);
    if (modalType === 'Branch') setBranches([...branches, modalData.name]);
    if (modalType === 'Company') setCompanies([...companies, modalData.name]);
    if (modalType === 'Status') setStatuses([...statuses, modalData.name]);
    if (modalType === 'Cost Center') setCostCenters([...costCenters, modalData.name]);
    if (modalType === 'Profit Center') setProfitCenters([...profitCenters, modalData.name]);
    if (modalType === 'Department Head') setDeptHeads([...deptHeads, modalData.name]);
    if (modalType === 'Assistant Manager') setAssistantManagers([...assistantManagers, modalData.name]);
    if (modalType === 'Reporting Dept.') setReportingDepts([...reportingDepts, modalData.name]);
    if (modalType === 'Working Days') setWorkingDaysList([...workingDaysList, modalData.name]);
    if (modalType === 'Default Shift') setDefaultShifts([...defaultShifts, modalData.name]);
    if (modalType === 'Attendance Required') setAttendanceReqs([...attendanceReqs, modalData.name]);
    if (modalType === 'Leave Approval') setLeaveApprovals([...leaveApprovals, modalData.name]);
    if (modalType === 'Expense Approval') setExpenseApprovals([...expenseApprovals, modalData.name]);

    const tempType = modalType;
    setModalType(null);
    setModalData({ name: '' });
    alert(`${tempType} added successfully!`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/departments', form);
      if (response.data.success) {
        alert('Department Created Successfully!');
        navigate('/department/list');
      }
    } catch (err) {
      console.error('Error creating department:', err);
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/department/list')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Department List
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-semibold">
            {error}
          </div>
        )}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-500" /> Basic Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department Code *</label>
                  <input type="text" value={form.deptCode} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department Name *</label>
                  <input type="text" name="deptName" value={form.deptName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Sales" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Department Type *</label>
                    <button type="button" onClick={() => setModalType('Department Type')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="deptType" value={form.deptType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {deptTypes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Parent Department</label>
                    <button type="button" onClick={() => setModalType('Parent Department')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="parentDept" value={form.parentDept} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    {parentDepts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Company *</label>
                    <button type="button" onClick={() => setModalType('Company')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="company" value={form.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Branch</label>
                    <button type="button" onClick={() => setModalType('Branch')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Status *</label>
                    <button type="button" onClick={() => setModalType('Status')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-emerald-600 font-bold">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. CONTACT DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} className="text-amber-500" /> Contact Details
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contact Person</label>
                  <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Official Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone / Extension</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. +91 / Ext 123" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Office Location</label>
                  <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. North Wing" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Floor / Room</label>
                  <input type="text" name="floor" value={form.floor} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 4th Floor, Room 402" />
                </div>
              </div>
            </div>

            {/* 4. DEPARTMENT DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <FileText size={14} className="text-emerald-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Department Details</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Objective</label>
                  <textarea name="objective" value={form.objective} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Responsibilities</label>
                  <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Cost Center</label>
                    <button type="button" onClick={() => setModalType('Cost Center')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="costCenter" value={form.costCenter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Cost Center</option>
                    {costCenters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Profit Center</label>
                    <button type="button" onClick={() => setModalType('Profit Center')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="profitCenter" value={form.profitCenter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Profit Center</option>
                    {profitCenters.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Budget</label>
                  <input type="text" name="budget" value={form.budget} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. ₹ 50,00,000" />
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. DEPARTMENT HEAD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-blue-500" /> Department Head
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Department Head *</label>
                    <button type="button" onClick={() => setModalType('Department Head')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="deptHead" value={form.deptHead} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    {deptHeads.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Assistant Manager</label>
                    <button type="button" onClick={() => setModalType('Assistant Manager')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="assistantManager" value={form.assistantManager} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    {assistantManagers.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Reporting Dept.</label>
                    <button type="button" onClick={() => setModalType('Reporting Dept.')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="reportingDept" value={form.reportingDept} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    {reportingDepts.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 5. WORKING CONFIGURATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} className="text-emerald-500" /> Working Configuration
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Working Days</label>
                    <button type="button" onClick={() => setModalType('Working Days')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="workingDays" value={form.workingDays} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {workingDaysList.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Default Shift</label>
                    <button type="button" onClick={() => setModalType('Default Shift')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="defaultShift" value={form.defaultShift} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Shift</option>
                    {defaultShifts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Attendance Required</label>
                    <button type="button" onClick={() => setModalType('Attendance Required')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="attendanceRequired" value={form.attendanceRequired} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {attendanceReqs.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Leave Approval</label>
                    <button type="button" onClick={() => setModalType('Leave Approval')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="leaveApproval" value={form.leaveApproval} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {leaveApprovals.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Expense Approval</label>
                    <button type="button" onClick={() => setModalType('Expense Approval')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="expenseApproval" value={form.expenseApproval} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {expenseApprovals.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 6. ADDITIONAL INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-purple-500" /> Additional Info
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Display Order</label>
                  <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Internal Notes</label>
                  <textarea name="internalNotes" value={form.internalNotes} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/department/list')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle size={16} /> {loading ? 'Saving...' : 'Create Department'}
            </button>
          </div>

        </form>
      </div>

      {/* QUICK ADD MODAL */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                Add New {modalType}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{modalType} Name *</label>
                <input 
                  type="text" 
                  value={modalData.name} 
                  onChange={(e) => setModalData({...modalData, name: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" 
                  placeholder={`Enter ${modalType} Name`}
                  required 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-indigo-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddDepartment;
