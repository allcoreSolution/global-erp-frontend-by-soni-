import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Calendar, UploadCloud, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    // Basic Information
    applicationNo: 'LVE-00124',
    date: new Date().toISOString().split('T')[0],
    employee: '',
    employeeId: '',
    department: '',
    branch: '',
    manager: '',
    
    // Leave Details
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    duration: 'Full Day',
    halfDayType: 'First Half',
    totalDays: 0,
    reason: '',
    contactDuringLeave: '',
    
    // Approval
    approver: 'John Doe',
    status: 'Pending',
    approverRemarks: ''
  });

  // Calculate Total Days
  useEffect(() => {
    if (form.fromDate && form.toDate) {
      const start = new Date(form.fromDate);
      const end = new Date(form.toDate);
      
      // Calculate difference in time
      const diffTime = Math.abs(end - start);
      // Calculate difference in days (adding 1 to include both start and end days)
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // If end date is before start date, set to 0
      if (end < start) diffDays = 0;
      
      // Adjust for half day
      if (form.duration === 'Half Day' && diffDays > 0) {
        // Typically a half day applies to a single day leave, but if they select multiple days and "Half Day", 
        // we might just subtract 0.5. For simplicity, we just make it 0.5 if it's a 1-day span.
        if (diffDays === 1) diffDays = 0.5;
      }
      
      setForm(prev => ({ ...prev, totalDays: diffDays }));
    } else {
      setForm(prev => ({ ...prev, totalDays: 0 }));
    }
  }, [form.fromDate, form.toDate, form.duration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Leave Application Submitted successfully!');
    navigate('/hrms/attendance/leaves');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/attendance/leaves')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Leaves
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/hrms/attendance/leaves')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Submit Leave
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
             <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-900 uppercase tracking-wide">APPLY FOR LEAVE</h2>
            <p className="text-sm text-slate-500 font-medium">Submit a new leave application</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* SECTION: BASIC INFORMATION */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application No.</label>
                <input type="text" name="applicationNo" value={form.applicationNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input type="text" name="date" value={form.date} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee</label>
                <select name="employee" value={form.employee} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white">
                  <option value="">Select Employee</option>
                  <option>Jane Smith</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" name="department" value={form.department} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <input type="text" name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manager</label>
                <input type="text" name="manager" value={form.manager} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* LEFT COLUMN: LEAVE DETAILS */}
             <div className="md:col-span-2 space-y-6">
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Leave Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type *</label>
                      <select name="leaveType" value={form.leaveType} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white font-medium">
                        <option>Casual Leave</option>
                        <option>Sick Leave</option>
                        <option>Earned Leave</option>
                        <option>Loss of Pay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">From Date *</label>
                      <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">To Date *</label>
                      <input type="date" name="toDate" value={form.toDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                      <select name="duration" value={form.duration} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white">
                        <option>Full Day</option>
                        <option>Half Day</option>
                      </select>
                    </div>

                    {form.duration === 'Half Day' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Half Day Type</label>
                        <select name="halfDayType" value={form.halfDayType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white">
                          <option>First Half</option>
                          <option>Second Half</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
                        <input type="text" value={form.totalDays} readOnly className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm font-bold text-teal-700 outline-none" />
                      </div>
                    )}
                    
                    {form.duration === 'Half Day' && (
                       <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
                        <input type="text" value={form.totalDays} readOnly className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm font-bold text-teal-700 outline-none" />
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reason *</label>
                      <textarea name="reason" value={form.reason} onChange={handleChange} required rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none resize-none" placeholder="Briefly describe your reason for leave..."></textarea>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact During Leave</label>
                      <input type="text" name="contactDuringLeave" value={form.contactDuringLeave} onChange={handleChange} placeholder="Phone number or alternate email" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                    </div>
                  </div>
                </div>
             </div>

             {/* RIGHT COLUMN: BALANCE, ATTACHMENT, APPROVAL */}
             <div className="space-y-6">
                
                {/* SECTION: LEAVE BALANCE */}
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <Info size={16} className="text-teal-600" />
                     <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Leave Balance</h3>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded border border-teal-200">
                     <div className="text-center">
                        <span className="block text-xs font-semibold text-slate-500">Available</span>
                        <span className="text-lg font-bold text-teal-700">7 Days</span>
                     </div>
                     <div className="h-8 w-px bg-slate-200"></div>
                     <div className="text-center">
                        <span className="block text-xs font-semibold text-slate-500">Used</span>
                        <span className="text-lg font-bold text-orange-600">5 Days</span>
                     </div>
                  </div>
                </div>

                {/* SECTION: ATTACHMENT */}
                <div className="border border-slate-200 rounded-lg p-5">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attachment</h3>
                   <button type="button" className="flex flex-col items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-teal-400 hover:text-teal-600 transition-colors text-sm font-medium text-slate-500">
                      <UploadCloud size={24} />
                      <span className="text-xs">Upload Document (Medical cert, etc.)</span>
                   </button>
                </div>

                {/* SECTION: APPROVAL */}
                <div className="border border-slate-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Approval</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Approver</label>
                      <input type="text" name="approver" value={form.approver} readOnly className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                      <div className="px-3 py-2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold inline-block">
                        {form.status}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Approver Remarks</label>
                      <textarea name="approverRemarks" value={form.approverRemarks} readOnly rows="2" className="w-full border border-slate-300 rounded bg-slate-50 px-3 py-2 text-sm text-slate-500 resize-none cursor-not-allowed" placeholder="Awaiting review..."></textarea>
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

export default ApplyLeave;
