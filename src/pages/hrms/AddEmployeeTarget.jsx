import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Plus, Target, Users, Settings, Calendar, BarChart, CheckSquare, Paperclip, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddEmployeeTarget = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Basic Info
    targetNo: 'TGT-1001',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Target Assigned Successfully!');
    navigate('/hrms/performance/targets');
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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">
            <Plus size={16} /> Assign Target
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    <option>Acme Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Branch *</label>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    <option>HQ - Mumbai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                  <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>IT</option>
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
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee *</label>
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    <option>Vikram Singh</option>
                    <option>Neha Gupta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee ID</label>
                  <input type="text" value={form.empId || 'Auto'} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input type="text" value={form.designation || 'Auto'} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reporting Manager</label>
                  <input type="text" value={form.manager || 'Auto'} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="button" className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <Plus size={14} /> Add Employee
                  </button>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Value *</label>
                    <input type="number" name="targetValue" value={form.targetValue} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Unit *</label>
                    <select name="unit" value={form.unit} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Number</option>
                      <option>Percentage</option>
                      <option>Currency</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Start Date *</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">End Date *</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Frequency</label>
                    <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Milestone Based</label>
                    <select name="milestoneBased" value={form.milestoneBased} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. ACHIEVEMENT & MEASUREMENT */}
            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white border border-slate-700">
              <div className="bg-slate-900 border-b border-slate-700 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" /> Achievement & Measurement
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Measurement</label>
                  <select name="measurement" value={form.measurement} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                    <option>Manual</option>
                    <option>Automatic</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Baseline</label>
                    <input type="number" name="baseline" value={form.baseline} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target</label>
                    <input type="number" name="targetValue" value={form.targetValue} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Achieved</label>
                    <input type="number" name="achieved" value={form.achieved} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rating</label>
                    <input type="text" name="rating" value={form.rating} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" placeholder="e.g. 4/5" />
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-2 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Achievement %</span>
                    <span className="font-bold text-emerald-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/50">
                    <span className="text-slate-400 font-medium">Remaining</span>
                    <span className="font-bold text-rose-400">{remaining}</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned By</label>
                    <input type="text" value={form.assignedBy} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reviewer</label>
                    <select name="reviewer" value={form.reviewer} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Reporting Manager</option>
                      <option>HR Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Review Freq.</label>
                    <select name="reviewFrequency" value={form.reviewFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
                    <select name="approvalStatus" value={form.approvalStatus} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-amber-600 font-bold">
                      <option>Pending</option>
                      <option>Approved</option>
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
              <CheckCircle size={16} /> Assign Target
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddEmployeeTarget;
