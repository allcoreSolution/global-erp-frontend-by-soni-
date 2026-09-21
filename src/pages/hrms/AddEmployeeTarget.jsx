import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Plus, Target, Users, Settings, Calendar, BarChart, CheckSquare, Paperclip, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

const AddEmployeeTarget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const [form, setForm] = useState(editData || {
    // Basic Info
    targetNo: `TGT-${Math.floor(Math.random() * 90000) + 10000}`,
    targetName: '',
    targetType: 'Individual',
    company: '',
    branch: '',
    department: '',
    appraisalCycle: '2026-2027',

    // Employee Assignment
    employee: '',
    empId: '',
    designation: '',
    manager: '',

    // Target Details
    targetTitle: '',
    category: 'Sales',
    kpi: '',
    targetValue: '100',
    unit: 'Number',
    priority: 'High',
    weightage: '20',
    description: '',

    // Target Period
    startDate: '2026-09-12',
    endDate: '2026-09-30',
    frequency: 'Monthly',
    milestoneBased: 'No',

    // Achievement & Measurement
    measurement: 'Manual',
    baseline: '0',
    achieved: '0',
    rating: '0',

    // Review & Approval
    assignedBy: 'HR Manager',
    reviewer: 'Reporting Manager',
    reviewFrequency: 'Monthly',
    approvalStatus: 'Pending',
    managerRemarks: '',

    // Additional Info
    resources: '',
    dependencies: '',
    notes: ''
  });

  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Local Dropdown States
  const [units, setUnits] = useState(['Number', 'Percentage', 'Currency']);
  const [priorities, setPriorities] = useState(['High', 'Medium', 'Low']);
  const [reviewFreqs, setReviewFreqs] = useState(['Monthly', 'Quarterly']);
  const [reviewers, setReviewers] = useState(['Reporting Manager', 'HR Manager']);
  const [measurements, setMeasurements] = useState(['Manual', 'Automatic']);
  const [frequencies, setFrequencies] = useState(['Monthly', 'Quarterly', 'Yearly']);
  const [milestoneBaseds, setMilestoneBaseds] = useState(['No', 'Yes']);
  const [statuses, setStatuses] = useState(['Pending', 'Approved']);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'company', 'branch', 'department', 'unit', etc.
  const [modalData, setModalData] = useState({ name: '', code: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, compRes, branchRes, deptRes] = await Promise.all([
          api.get('/employees').catch(() => ({ data: { data: [] } })),
          api.get('/companies/profile').catch(() => ({ data: {} })), // Fetch own company profile
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/departments').catch(() => ({ data: { data: [] } }))
        ]);
        
        if (empRes.data?.data) setEmployees(empRes.data.data);
        if (compRes.data) setCompanies([compRes.data]); // Put single company in array
        if (branchRes.data?.data) setBranches(branchRes.data.data);
        if (deptRes.data?.data) setDepartments(deptRes.data.data);
      } catch (err) {
        console.error("Error fetching lookup data:", err);
      }
    };
    fetchData();
  }, []);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!modalData.name) return;
    
    try {
      if (modalType === 'branch') {
        const res = await api.post('/branches', { name: modalData.name, id: modalData.code || `BR-${Math.floor(Math.random()*1000)}` });
        if (res.data?.success || res.status === 201) setBranches([...branches, res.data.data || res.data]);
      } else if (modalType === 'department') {
        const res = await api.post('/departments', { deptName: modalData.name, deptCode: modalData.code || `DP-${Math.floor(Math.random()*1000)}` });
        if (res.data?.success || res.status === 201) setDepartments([...departments, res.data.data || res.data]);
      } else if (modalType === 'unit') {
        setUnits([...units, modalData.name]);
      } else if (modalType === 'priority') {
        setPriorities([...priorities, modalData.name]);
      } else if (modalType === 'reviewFreq') {
        setReviewFreqs([...reviewFreqs, modalData.name]);
      } else if (modalType === 'reviewer') {
        setReviewers([...reviewers, modalData.name]);
      } else if (modalType === 'measurement') {
        setMeasurements([...measurements, modalData.name]);
      } else if (modalType === 'frequency') {
        setFrequencies([...frequencies, modalData.name]);
      } else if (modalType === 'milestoneBased') {
        setMilestoneBaseds([...milestoneBaseds, modalData.name]);
      } else if (modalType === 'status') {
        setStatuses([...statuses, modalData.name]);
      }

      const tempType = modalType;
      setModalType(null);
      setModalData({ name: '', code: '' });
      alert(`${tempType} added successfully!`);
      
      // Re-fetch APIs if it was an API call
      if (['branch', 'department'].includes(tempType)) {
        const [branchRes, deptRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/departments').catch(() => ({ data: { data: [] } }))
        ]);
        if (branchRes.data?.data) setBranches(branchRes.data.data);
        if (deptRes.data?.data) setDepartments(deptRes.data.data);
      }
    } catch (err) {
      console.error("Quick add failed", err);
      alert("Failed to add record.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'employee') {
      const selectedEmp = employees.find(emp => emp._id === value);
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        empId: selectedEmp?.employeeId || '',
        designation: selectedEmp?.designation || '',
        manager: selectedEmp?.reportingManager || '',
        department: selectedEmp?.department || prev.department
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.targetName || !form.employee || !form.targetValue) {
      alert("Please fill required fields (Target Name, Employee, Target Value).");
      return;
    }
    try {
      let res;
      if (editData?._id) {
        res = await api.put(`/employee-targets/${editData._id}`, form);
      } else {
        res = await api.post('/employee-targets', form);
      }
      
      if (res.data?.success || res.status === 201 || res.status === 200) {
        alert(`Target ${editData?._id ? 'Updated' : 'Assigned'} Successfully!`);
        navigate('/hrms/performance/targets');
      } else {
        alert(res.data?.message || 'Failed to save target.');
      }
    } catch (err) {
      console.error("Error saving target:", err);
      alert(err.response?.data?.message || 'An error occurred while saving the target.');
    }
  };

  // Auto Calculations
  const targetVal = Number(form.targetValue) || 0;
  const achievedVal = Number(form.achieved) || 0;
  const baselineVal = Number(form.baseline) || 0;
  
  const progress = targetVal - baselineVal > 0 
    ? (((achievedVal - baselineVal) / (targetVal - baselineVal)) * 100).toFixed(1)
    : 0;
  
  const remaining = Math.max(0, targetVal - achievedVal);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/performance/targets')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Assign Target
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={14} className="text-indigo-500" /> Basic Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target No.</label>
                  <input type="text" value={form.targetNo} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Name *</label>
                  <input type="text" name="targetName" value={form.targetName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="Enter Target Name" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Type *</label>
                  <select name="targetType" value={form.targetType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Individual</option>
                    <option>Team</option>
                    <option>Department</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Company *</label>
                  </div>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.companyName || c.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Branch *</label>
                    <button type="button" onClick={() => setModalType('branch')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Department</label>
                    <button type="button" onClick={() => setModalType('department')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.deptName}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Appraisal Cycle</label>
                  <select name="appraisalCycle" value={form.appraisalCycle} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>2026-2027</option>
                    <option>2025-2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. EMPLOYEE ASSIGNMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-emerald-500" /> Employee Assignment
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Employee *</label>
                    <button type="button" onClick={() => navigate('/hrms/employee/add')} className="text-emerald-600 hover:text-emerald-800"><Plus size={14} /></button>
                  </div>
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee ID</label>
                  <input type="text" name="empId" value={form.empId} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input type="text" name="designation" value={form.designation} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reporting Manager</label>
                  <input type="text" name="manager" value={form.manager} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>

              </div>
            </div>

            {/* 3. TARGET DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <Settings size={14} className="text-amber-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Target Details</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Title *</label>
                  <input type="text" name="targetTitle" value={form.targetTitle} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="Title" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Sales</option>
                    <option>Productivity</option>
                    <option>Quality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">KPI *</label>
                  <input type="text" name="kpi" value={form.kpi} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="KPI Metrics" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Value *</label>
                    <input type="number" name="targetValue" value={form.targetValue} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Unit *</label>
                      <button type="button" onClick={() => setModalType('unit')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="unit" value={form.unit} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Priority</label>
                      <button type="button" onClick={() => setModalType('priority')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Weightage %</label>
                    <input type="number" name="weightage" value={form.weightage} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* 7. ADDITIONAL INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <Paperclip size={14} className="text-slate-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Additional Information</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Resources Required</label>
                  <textarea name="resources" value={form.resources} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dependencies</label>
                  <textarea name="dependencies" value={form.dependencies} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Attachment</label>
                  <input type="file" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 4. TARGET PERIOD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" /> Target Period
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Start Date *</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">End Date *</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Frequency</label>
                      <button type="button" onClick={() => setModalType('frequency')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Milestone Based</label>
                      <button type="button" onClick={() => setModalType('milestoneBased')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="milestoneBased" value={form.milestoneBased} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {milestoneBaseds.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. ACHIEVEMENT & MEASUREMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" /> Achievement & Measurement
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Measurement</label>
                    <button type="button" onClick={() => setModalType('measurement')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="measurement" value={form.measurement} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {measurements.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Baseline</label>
                    <input type="number" name="baseline" value={form.baseline} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target</label>
                    <input type="number" name="targetValue" value={form.targetValue} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Achieved</label>
                    <input type="number" name="achieved" value={form.achieved} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rating</label>
                    <input type="text" name="rating" value={form.rating} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 4/5" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Achievement %</span>
                    <span className="font-bold text-emerald-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-medium">Remaining</span>
                    <span className="font-bold text-rose-500">{remaining}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. REVIEW & APPROVAL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckSquare size={14} className="text-purple-500" /> Review & Approval
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned By</label>
                    <input type="text" name="assignedBy" value={form.assignedBy} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Reviewer</label>
                      <button type="button" onClick={() => setModalType('reviewer')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="reviewer" value={form.reviewer} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {reviewers.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Review Freq.</label>
                      <button type="button" onClick={() => setModalType('reviewFreq')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="reviewFrequency" value={form.reviewFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      {reviewFreqs.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Status</label>
                      <button type="button" onClick={() => setModalType('status')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="approvalStatus" value={form.approvalStatus} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-amber-600 font-bold">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Manager Remarks</label>
                  <textarea name="managerRemarks" value={form.managerRemarks} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/hrms/performance/targets')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> {editData ? 'Update Target' : 'Assign Target'}
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
                Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{modalType} Code *</label>
                <input 
                  type="text" 
                  value={modalData.code} 
                  onChange={(e) => setModalData({...modalData, code: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" 
                  placeholder={`Enter Code (e.g. ${modalType === 'branch' ? 'BR' : 'DP'}-001)`}
                  required 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{modalType} Name *</label>
                <input 
                  type="text" 
                  value={modalData.name} 
                  onChange={(e) => setModalData({...modalData, name: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" 
                  placeholder="Enter Name"
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

export default AddEmployeeTarget;
