import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Calendar, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddHoliday = () => {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    // Basic Information
    holidayCode: 'HOL-0045',
    holidayName: '',
    holidayDate: '',
    type: 'Festival',
    company: '',
    branch: '',
    calendarYear: '2026',
    status: 'Active',
    
    // Holiday Details
    startDate: '',
    endDate: '',
    totalDays: 0,
    dayName: '',
    paidHoliday: 'Yes',
    description: '',
    
    // Applicability
    applicableTo: 'All Employees',
    department: '',
    employeeType: 'All',
    location: '',
    
    // Optional Holiday
    isOptional: 'No',
    employeeCanSelect: 'No',
    approvalRequired: 'No',
    
    // Remarks
    remarks: ''
  });

  // Calculate Total Days and Day Name
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      
      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (end < start) diffDays = 0;
      
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayString = diffDays === 1 ? daysOfWeek[start.getDay()] : 'Multiple Days';
      
      setForm(prev => ({ 
        ...prev, 
        totalDays: diffDays,
        dayName: dayString
      }));
    } else if (form.startDate && !form.endDate) {
       const start = new Date(form.startDate);
       const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
       setForm(prev => ({ 
         ...prev, 
         totalDays: 1,
         dayName: daysOfWeek[start.getDay()] || ''
       }));
    } else {
      setForm(prev => ({ ...prev, totalDays: 0, dayName: '' }));
    }
  }, [form.startDate, form.endDate]);

  // Sync Holiday Date with Start Date for simplicity if user types in Basic Info first
  const handleDateChange = (e) => {
     const { name, value } = e.target;
     if (name === 'holidayDate') {
        setForm(prev => ({ ...prev, holidayDate: value, startDate: value, endDate: value }));
     } else {
        setForm(prev => ({ ...prev, [name]: value }));
     }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Holiday saved successfully!');
    navigate('/hrms/attendance/holidays'); // Assuming back to list
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/attendance/holidays')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Holiday List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/hrms/attendance/holidays')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Save Holiday
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
             <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">ADD HOLIDAY</h2>
            <p className="text-sm text-slate-500 font-medium">Configure a new company holiday</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             
             {/* LEFT & CENTER COLUMNS: Basic Info & Details */}
             <div className="lg:col-span-2 space-y-6">
               
               {/* SECTION: BASIC INFORMATION */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                   <Briefcase size={14} /> Basic Information
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Code</label>
                     <input type="text" name="holidayCode" value={form.holidayCode} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Name *</label>
                     <input type="text" name="holidayName" value={form.holidayName} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Date *</label>
                     <input type="date" name="holidayDate" value={form.holidayDate} onChange={handleDateChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                     <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white font-medium">
                       <option>Festival</option>
                       <option>National Holiday</option>
                       <option>Company Holiday</option>
                       <option>Restricted Holiday</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                     <select name="company" value={form.company} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                       <option value="">Select Company</option>
                       <option>Main Corp</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                     <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                       <option value="">Select Branch</option>
                       <option>HQ</option>
                       <option>North Branch</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Calendar Year</label>
                     <input type="text" name="calendarYear" value={form.calendarYear} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                     <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                       <option>Active</option>
                       <option>Inactive</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* SECTION: HOLIDAY DETAILS */}
               <div className="border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                   <Calendar size={14} /> Holiday Details
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                     <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                     <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
                     <input type="text" value={form.totalDays} readOnly className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm font-bold text-blue-700 outline-none cursor-not-allowed" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Day</label>
                     <input type="text" value={form.dayName} readOnly className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 outline-none cursor-not-allowed" />
                   </div>
                   <div className="sm:col-span-2">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Holiday</label>
                     <select name="paidHoliday" value={form.paidHoliday} onChange={handleChange} className="w-full sm:w-1/2 border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                       <option>Yes</option>
                       <option>No</option>
                     </select>
                   </div>
                   <div className="sm:col-span-2">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                     <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Brief details about the holiday..."></textarea>
                   </div>
                 </div>
               </div>

             </div>

             {/* RIGHT COLUMN: Applicability & Optional Settings */}
             <div className="space-y-6">
                
                {/* SECTION: APPLICABILITY */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                   <Users size={14} /> Applicability
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable To</label>
                      <select name="applicableTo" value={form.applicableTo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                        <option>All Employees</option>
                        <option>Specific Departments</option>
                        <option>Specific Locations</option>
                      </select>
                    </div>
                    {form.applicableTo === 'Specific Departments' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                        <select name="department" value={form.department} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                          <option value="">Select Department</option>
                          <option>IT</option>
                          <option>HR</option>
                        </select>
                      </div>
                    )}
                    {form.applicableTo === 'Specific Locations' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                        <select name="location" value={form.location} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                          <option value="">Select Location</option>
                          <option>Mumbai HQ</option>
                          <option>Delhi Branch</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Type</label>
                      <select name="employeeType" value={form.employeeType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                        <option>All</option>
                        <option>Permanent</option>
                        <option>Contract</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION: OPTIONAL HOLIDAY */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 pb-2 border-b border-blue-200">Optional Holiday Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Is Optional Holiday?</label>
                      <select name="isOptional" value={form.isOptional} onChange={handleChange} className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none bg-white text-center">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    {form.isOptional === 'Yes' && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Employee Can Select?</label>
                          <select name="employeeCanSelect" value={form.employeeCanSelect} onChange={handleChange} className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none bg-white text-center">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Approval Required?</label>
                          <select name="approvalRequired" value={form.approvalRequired} onChange={handleChange} className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none bg-white text-center">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* SECTION: REMARKS */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Internal notes..."></textarea>
                </div>

             </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoliday;
