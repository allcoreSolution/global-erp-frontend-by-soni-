import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Briefcase, FileText, Users, DollarSign, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AddDesignation = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    // Basic Information
    desigCode: 'DSG-001',
    desigName: '',
    desigType: 'Managerial',
    company: '',
    branch: '',
    department: '',
    parentDesig: '',
    status: 'Active',

    // Job Details
    jobTitle: '',
    jobLevel: '',
    jobCategory: '',
    employmentType: 'Permanent',
    experience: '',
    qualification: '',
    skills: '',
    jobDescription: '',
    responsibilities: '',

    // Reporting & Authority
    reportsTo: '',
    approvalAuthority: '',
    teamSize: '',
    leaveApproval: 'Yes',
    expenseApproval: 'Yes',

    // Salary Configuration
    salaryGrade: '',
    minSalary: '',
    maxSalary: '',
    salaryStructure: '',
    overtimeApplicable: 'No',
    incentiveApplicable: 'Yes',

    // Additional Information
    displayOrder: '',
    description: '',
    remarks: '',
    internalNotes: ''
  });

  // Local Dropdown States
  const [desigTypes, setDesigTypes] = useState(['Managerial', 'Technical', 'Administrative']);
  const [companies, setCompanies] = useState(['Acme Corp']);
  const [branches, setBranches] = useState(['HQ - Mumbai']);
  const [departments, setDepartments] = useState(['IT & Systems', 'HR']);
  const [parentDesigs, setParentDesigs] = useState(['CTO', 'VP Engineering']);
  const [statuses, setStatuses] = useState(['Active', 'Inactive']);
  const [jobLevels, setJobLevels] = useState(['L3', 'L4']);
  const [jobCategories, setJobCategories] = useState(['Software Development', 'Quality Assurance']);
  const [employmentTypes, setEmploymentTypes] = useState(['Permanent', 'Contract', 'Internship']);
  const [reportsToList, setReportsToList] = useState(['Tech Lead', 'Engineering Manager']);
  const [approvalAuthorities, setApprovalAuthorities] = useState(['Head of Department']);
  const [leaveApprovals, setLeaveApprovals] = useState(['Yes', 'No']);
  const [expenseApprovals, setExpenseApprovals] = useState(['Yes', 'No']);
  const [salaryGrades, setSalaryGrades] = useState(['Grade A', 'Grade B']);
  const [salaryStructures, setSalaryStructures] = useState(['Standard Corporate']);
  const [overtimeApplicables, setOvertimeApplicables] = useState(['No', 'Yes']);
  const [incentiveApplicables, setIncentiveApplicables] = useState(['Yes', 'No']);

  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({ name: '' });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!modalData.name) return;
    
    if (modalType === 'Designation Type') setDesigTypes([...desigTypes, modalData.name]);
    if (modalType === 'Company') setCompanies([...companies, modalData.name]);
    if (modalType === 'Branch') setBranches([...branches, modalData.name]);
    if (modalType === 'Department') setDepartments([...departments, modalData.name]);
    if (modalType === 'Parent Designation') setParentDesigs([...parentDesigs, modalData.name]);
    if (modalType === 'Status') setStatuses([...statuses, modalData.name]);
    if (modalType === 'Job Level') setJobLevels([...jobLevels, modalData.name]);
    if (modalType === 'Job Category') setJobCategories([...jobCategories, modalData.name]);
    if (modalType === 'Employment Type') setEmploymentTypes([...employmentTypes, modalData.name]);
    if (modalType === 'Reports To') setReportsToList([...reportsToList, modalData.name]);
    if (modalType === 'Approval Authority') setApprovalAuthorities([...approvalAuthorities, modalData.name]);
    if (modalType === 'Leave Approval') setLeaveApprovals([...leaveApprovals, modalData.name]);
    if (modalType === 'Expense Approval') setExpenseApprovals([...expenseApprovals, modalData.name]);
    if (modalType === 'Salary Grade') setSalaryGrades([...salaryGrades, modalData.name]);
    if (modalType === 'Salary Structure') setSalaryStructures([...salaryStructures, modalData.name]);
    if (modalType === 'Overtime Applicable') setOvertimeApplicables([...overtimeApplicables, modalData.name]);
    if (modalType === 'Incentive Applicable') setIncentiveApplicables([...incentiveApplicables, modalData.name]);

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
      const response = await api.post('/designations', form);
      if (response.data.success) {
        alert('Designation Created Successfully!');
        navigate('/designation/list');
      }
    } catch (err) {
      console.error('Error creating designation:', err);
      setError(err.response?.data?.message || 'Failed to create designation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/designation/list')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Designation List
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
                  <Briefcase size={14} className="text-indigo-500" /> Basic Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation Code *</label>
                  <input type="text" value={form.desigCode} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation Name *</label>
                  <input type="text" name="desigName" value={form.desigName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Senior Developer" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Designation Type *</label>
                    <button type="button" onClick={() => setModalType('Designation Type')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="desigType" value={form.desigType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {desigTypes.map(d => <option key={d} value={d}>{d}</option>)}
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
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Department *</label>
                    <button type="button" onClick={() => setModalType('Department')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="department" value={form.department} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Parent Designation</label>
                    <button type="button" onClick={() => setModalType('Parent Designation')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="parentDesig" value={form.parentDesig} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Designation</option>
                    {parentDesigs.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
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

            {/* 2. JOB DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-amber-500" /> Job Details
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Job Title</label>
                  <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Frontend Engineer" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Job Level / Grade</label>
                    <button type="button" onClick={() => setModalType('Job Level')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="jobLevel" value={form.jobLevel} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Grade</option>
                    {jobLevels.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Job Category</label>
                    <button type="button" onClick={() => setModalType('Job Category')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="jobCategory" value={form.jobCategory} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Category</option>
                    {jobCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Employment Type</label>
                    <button type="button" onClick={() => setModalType('Employment Type')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="employmentType" value={form.employmentType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {employmentTypes.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Required Experience</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="experience" value={form.experience} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 3" />
                    <span className="text-sm text-slate-500 font-medium">Years</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Qualification</label>
                  <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. B.Tech CS" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Required Skills</label>
                  <input type="text" name="skills" value={form.skills} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. React, Node.js, AWS" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Job Description</label>
                  <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Key Responsibilities</label>
                  <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 3. REPORTING & AUTHORITY */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-blue-500" /> Reporting & Authority
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Reports To</label>
                    <button type="button" onClick={() => setModalType('Reports To')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="reportsTo" value={form.reportsTo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    {reportsToList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Approval Authority</label>
                    <button type="button" onClick={() => setModalType('Approval Authority')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="approvalAuthority" value={form.approvalAuthority} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    {approvalAuthorities.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Team Size</label>
                  <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Leave Approval</label>
                      <button type="button" onClick={() => setModalType('Leave Approval')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="leaveApproval" value={form.leaveApproval} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {leaveApprovals.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Expense Approval</label>
                      <button type="button" onClick={() => setModalType('Expense Approval')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="expenseApproval" value={form.expenseApproval} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {expenseApprovals.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. SALARY CONFIGURATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-500" /> Salary Configuration
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Salary Grade</label>
                    <button type="button" onClick={() => setModalType('Salary Grade')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="salaryGrade" value={form.salaryGrade} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Grade</option>
                    {salaryGrades.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Minimum Salary</label>
                    <input type="text" name="minSalary" value={form.minSalary} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="₹" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Maximum Salary</label>
                    <input type="text" name="maxSalary" value={form.maxSalary} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="₹" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Salary Structure</label>
                    <button type="button" onClick={() => setModalType('Salary Structure')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="salaryStructure" value={form.salaryStructure} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Structure</option>
                    {salaryStructures.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Overtime Applicable</label>
                      <button type="button" onClick={() => setModalType('Overtime Applicable')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="overtimeApplicable" value={form.overtimeApplicable} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {overtimeApplicables.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Incentive Applicable</label>
                      <button type="button" onClick={() => setModalType('Incentive Applicable')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="incentiveApplicable" value={form.incentiveApplicable} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {incentiveApplicables.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. ADDITIONAL INFORMATION */}
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
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
            <button type="button" onClick={() => navigate('/designation/list')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle size={16} /> {loading ? 'Saving...' : 'Create Designation'}
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

export default AddDesignation;
