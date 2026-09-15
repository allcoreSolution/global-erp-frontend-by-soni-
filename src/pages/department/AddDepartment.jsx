import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Building2, Users, Phone, FileText, Settings, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddDepartment = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Department Created Successfully!');
    navigate('/department/list');
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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department Type *</label>
                  <select name="deptType" value={form.deptType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Internal</option>
                    <option>External</option>
                    <option>Cross-Functional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Parent Department</label>
                  <select name="parentDept" value={form.parentDept} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    <option>Operations</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    <option>Acme Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Branch</label>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    <option>HQ - Mumbai</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status *</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-emerald-600 font-bold">
                    <option>Active</option>
                    <option>Inactive</option>
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cost Center</label>
                  <select name="costCenter" value={form.costCenter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Cost Center</option>
                    <option>CC-01</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Profit Center</label>
                  <select name="profitCenter" value={form.profitCenter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Profit Center</option>
                    <option>PC-01</option>
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department Head *</label>
                  <select name="deptHead" value={form.deptHead} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    <option>Rohan Sharma</option>
                    <option>Priya Patel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assistant Manager</label>
                  <select name="assistantManager" value={form.assistantManager} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    <option>Amit Singh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reporting Dept.</label>
                  <select name="reportingDept" value={form.reportingDept} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    <option>Board of Directors</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. WORKING CONFIGURATION */}
            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white border border-slate-700">
              <div className="bg-slate-900 border-b border-slate-700 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} className="text-emerald-400" /> Working Configuration
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Working Days</label>
                  <select name="workingDays" value={form.workingDays} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option>Mon-Sat</option>
                    <option>Mon-Fri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Shift</label>
                  <select name="defaultShift" value={form.defaultShift} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option value="">Select Shift</option>
                    <option>General Shift (09:00 - 18:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance Required</label>
                  <select name="attendanceRequired" value={form.attendanceRequired} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Leave Approval</label>
                  <select name="leaveApproval" value={form.leaveApproval} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option>Manager</option>
                    <option>HR</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expense Approval</label>
                  <select name="expenseApproval" value={form.expenseApproval} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option>Manager</option>
                    <option>Finance</option>
                    <option>Both</option>
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
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> Create Department
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddDepartment;
